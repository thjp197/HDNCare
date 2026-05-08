import { GoogleGenerativeAI } from "@google/generative-ai";
import { companyInfo } from "../config/companyInfo.js";
import { bookingTools } from "../config/geminiTools.js";
import appointmentModel from "../models/appointmentModel.js";
import stylistModel from "../models/stylistModel.js";
import userModel from "../models/userModel.js";

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_KEY;
  if (!apiKey) return null;
  return new GoogleGenerativeAI(apiKey);
};

export const handleChatbotMessage = async (req, res) => {
  try {
    const { message, history, currentUser } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        success: false,
        message: "Thiếu nội dung tin nhắn.",
      });
    }

    const genAI = getGeminiClient();
    if (!genAI) {
      return res.status(500).json({
        success: false,
        message: "Thiếu cấu hình Gemini API key trên server.",
      });
    }

    // 1. CHUẨN BỊ LỜI DẶN DÒ ĐỘNG (DYNAMIC INSTRUCTION)
    let customInstruction = companyInfo;

    if (currentUser && currentUser.phone) {
      customInstruction += `\n\n[LƯU Ý ĐẶC BIỆT]: Bạn đang nói chuyện với khách hàng đã đăng nhập. 
            - Tên khách hàng: ${currentUser.name}
            - Số điện thoại: ${currentUser.phone}
            - BẮT BUỘC: KHÔNG ĐƯỢC hỏi tên và số điện thoại của họ nữa.
            - Khi cần gọi hàm createBooking hoặc cancelAppointment, hãy tự động lấy tên và số điện thoại ở trên để điền vào.`;
    } else {
      customInstruction += `\n\n[LƯU Ý ĐẶC BIỆT]: Bạn đang nói chuyện với khách vãng lai (chưa đăng nhập). 
            - BẮT BUỘC phải yêu cầu họ cung cấp Tên và Số điện thoại trước khi tiến hành đặt lịch.`;
    }

    // 2. KHỞI TẠO MODEL VỚI LỜI DẶN DÒ MỚI (CÓ FALLBACK KHI MODEL KHÔNG TỒN TẠI)
    const modelCandidates = [
      process.env.GEMINI_MODEL,
      "gemini-2.5-flash",
      "gemini-1.5-flash-002",
      "gemini-1.5-flash-latest",
    ].filter(Boolean);

    let chat;
    let response;
    let lastError;

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    for (const modelName of modelCandidates) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: customInstruction,
          tools: bookingTools,
        });
        chat = model.startChat({ history: history || [] });
        let attempt = 0;
        let result;
        while (attempt < 3) {
          try {
            result = await chat.sendMessage(message);
            break;
          } catch (sendErr) {
            const status = sendErr?.status || sendErr?.response?.status;
            if (status === 429 && attempt < 2) {
              await sleep(800 * (attempt + 1));
              attempt += 1;
              continue;
            }
            throw sendErr;
          }
        }
        if (!result) throw new Error("Gemini request failed");
        response = result.response;
        lastError = null;
        break;
      } catch (err) {
        const status = err?.status || err?.response?.status;
        lastError = err;
        if (status === 404) {
          continue;
        }
        throw err;
      }
    }

    if (!response || !chat) {
      throw lastError || new Error("Gemini model not available");
    }
    const functionCalls = response.functionCalls();

    if (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0];

      // --- XỬ LÝ KIỂM TRA TRÙNG LỊCH ---
      if (call.name === "checkAvailability") {
        const { stylistName, slotDate, slotTime } = call.args;
        const stylist = await stylistModel.findOne({ name: stylistName });

        if (!stylist) {
          const fallbackResult = await chat.sendMessage([
            {
              functionResponse: {
                name: "checkAvailability",
                response: {
                  error: "Không tìm thấy nhân viên này trong hệ thống.",
                },
              },
            },
          ]);
          return res.json({
            success: true,
            reply: fallbackResult.response.text(),
          });
        }

        const isBooked = await appointmentModel.findOne({
          styId: stylist._id.toString(),
          slotDate: slotDate,
          slotTime: slotTime,
          cancelled: false,
        });

        const dbResult = {
          isAvailable: !isBooked,
          message: isBooked
            ? "Khung giờ này đã có người đặt."
            : "Khung giờ này đang trống.",
        };

        const finalResult = await chat.sendMessage([
          {
            functionResponse: { name: "checkAvailability", response: dbResult },
          },
        ]);

        return res.json({ success: true, reply: finalResult.response.text() });
      }

      // --- XỬ LÝ HUỶ LỊCH ---
      else if (call.name === "cancelAppointment") {
        const { customerPhone, slotDate, slotTime } = call.args;

        const appointment = await appointmentModel.findOne({
          slotDate: slotDate,
          slotTime: slotTime,
          "userData.phone": customerPhone,
          cancelled: false,
        });

        let dbResult = {};
        if (appointment) {
          appointment.cancelled = true;
          await appointment.save();
          dbResult = {
            success: true,
            message: "Đã huỷ lịch thành công trên hệ thống.",
          };
        } else {
          dbResult = {
            success: false,
            message: "Không tìm thấy lịch hẹn trùng khớp để huỷ.",
          };
        }

        const finalResult = await chat.sendMessage([
          {
            functionResponse: { name: "cancelAppointment", response: dbResult },
          },
        ]);

        return res.json({ success: true, reply: finalResult.response.text() });
      }

      // --- XỬ LÝ TẠO LỊCH MỚI CÓ PHÂN LUỒNG ---
      else if (call.name === "createBooking") {
        const { customerName, customerPhone, stylistName, slotDate, slotTime } =
          call.args;

        const stylist = await stylistModel.findOne({ name: stylistName });
        let user = await userModel.findOne({ phone: customerPhone });

        let finalUserId = user ? user._id.toString() : "GUEST";
        let finalUserData = user
          ? user
          : { name: customerName, phone: customerPhone, isGuest: true };

        if (stylist) {
          const appointmentData = {
            userId: finalUserId,
            styId: stylist._id.toString(),
            slotDate,
            slotTime,
            userData: finalUserData,
            styData: stylist,
            amount: stylist.fees || 250000,
            date: Date.now(),
            cancelled: false,
            payment: false,
            isCompleted: false,
          };

          const newAppointment = new appointmentModel(appointmentData);
          await newAppointment.save();

          const dbResult = {
            success: true,
            message: "Lịch hẹn đã được lưu thành công.",
          };
          const finalResult = await chat.sendMessage([
            {
              functionResponse: { name: "createBooking", response: dbResult },
            },
          ]);

          return res.json({
            success: true,
            reply: finalResult.response.text(),
          });
        }

        const fallbackResult = await chat.sendMessage([
          {
            functionResponse: {
              name: "createBooking",
              response: {
                success: false,
                message: "Không tìm thấy nhân viên để tạo lịch.",
              },
            },
          },
        ]);

        return res.json({
          success: true,
          reply: fallbackResult.response.text(),
        });
      }
    }

    return res.json({ success: true, reply: response.text() });
  } catch (error) {
    const status = error?.status || error?.response?.status;
    if (status === 429) {
      return res.status(429).json({
        success: false,
        message:
          "Hệ thống đang quá tải hoặc hết hạn mức. Vui lòng thử lại sau vài phút.",
      });
    }
    console.error("Chatbot Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi hệ thống Chatbot AI" });
  }
};
