import { GoogleGenerativeAI } from '@google/generative-ai';
import { companyInfo } from '../config/companyInfo.js';
import { bookingTools } from '../config/geminiTools.js';
import appointmentModel from '../models/appointmentModel.js';
import stylistModel from '../models/stylistModel.js';
import userModel from '../models/userModel.js';

// DÒNG NÀY ĐỂ DEBUG LỖI 403: Kiểm tra xem Node.js có đọc được Key không
console.log("=== KIỂM TRA API KEY TRONG CONTROLLER ===", process.env.GEMINI_API_KEY ? "Đã có Key" : "KEY BỊ TRỐNG (UNDEFINED)");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const handleChatbotMessage = async (req, res) => {
    try {
        const { message, history, currentUser } = req.body;

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

        // 2. KHỞI TẠO MODEL VỚI LỜI DẶN DÒ MỚI
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash", 
            systemInstruction: customInstruction,
            tools: bookingTools,
        });

        const chat = model.startChat({ history: history || [] });
        const result = await chat.sendMessage(message);
        const response = result.response;
        const functionCalls = response.functionCalls();

        if (functionCalls && functionCalls.length > 0) {
            const call = functionCalls[0];
            
            // --- XỬ LÝ KIỂM TRA TRÙNG LỊCH ---
            if (call.name === "checkAvailability") {
                const { stylistName, slotDate, slotTime } = call.args;
                const stylist = await stylistModel.findOne({ name: stylistName });
                
                if (!stylist) {
                    const fallbackResult = await chat.sendMessage([{
                        functionResponse: { name: "checkAvailability", response: { error: "Không tìm thấy nhân viên này trong hệ thống." } }
                    }]);
                    return res.json({ success: true, reply: fallbackResult.response.text() });
                }

                const isBooked = await appointmentModel.findOne({
                    styId: stylist._id.toString(),
                    slotDate: slotDate,
                    slotTime: slotTime,
                    cancelled: false
                });

                const dbResult = {
                    isAvailable: !isBooked,
                    message: isBooked ? "Khung giờ này đã có người đặt." : "Khung giờ này đang trống."
                };

                const finalResult = await chat.sendMessage([{
                    functionResponse: { name: "checkAvailability", response: dbResult }
                }]);

                return res.json({ success: true, reply: finalResult.response.text() });
            } 
            
            // --- XỬ LÝ HUỶ LỊCH ---
            else if (call.name === "cancelAppointment") {
                const { customerPhone, slotDate, slotTime } = call.args;

                const appointment = await appointmentModel.findOne({
                    slotDate: slotDate,
                    slotTime: slotTime,
                    "userData.phone": customerPhone,
                    cancelled: false
                });

                let dbResult = {};
                if (appointment) {
                    appointment.cancelled = true;
                    await appointment.save();
                    dbResult = { success: true, message: "Đã huỷ lịch thành công trên hệ thống." };
                } else {
                    dbResult = { success: false, message: "Không tìm thấy lịch hẹn trùng khớp để huỷ." };
                }

                const finalResult = await chat.sendMessage([{
                    functionResponse: { name: "cancelAppointment", response: dbResult }
                }]);

                return res.json({ success: true, reply: finalResult.response.text() });
            }

            // --- XỬ LÝ TẠO LỊCH MỚI CÓ PHÂN LUỒNG ---
            else if (call.name === "createBooking") {
                const { customerName, customerPhone, stylistName, slotDate, slotTime } = call.args;

                const stylist = await stylistModel.findOne({ name: stylistName });
                let user = await userModel.findOne({ phone: customerPhone });

                let finalUserId = user ? user._id.toString() : "GUEST";
                let finalUserData = user ? user : { name: customerName, phone: customerPhone, isGuest: true };

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
                        isCompleted: false
                    };

                    const newAppointment = new appointmentModel(appointmentData);
                    await newAppointment.save(); 

                    const dbResult = { success: true, message: "Lịch hẹn đã được lưu thành công." };
                    const finalResult = await chat.sendMessage([{
                        functionResponse: { name: "createBooking", response: dbResult }
                    }]);

                    return res.json({ success: true, reply: finalResult.response.text() });
                }
            }
        }

        return res.json({ success: true, reply: response.text() });

    } catch (error) {
        console.error("Chatbot Error:", error);
        res.status(500).json({ success: false, message: "Lỗi hệ thống Chatbot AI" });
    }
};