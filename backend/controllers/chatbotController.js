import { GoogleGenerativeAI } from '@google/generative-ai';
import { companyInfo } from '../config/companyInfo.js';
import { bookingTools } from '../config/geminiTools.js';
import appointmentModel from '../models/appointmentModel.js';
import stylistModel from '../models/stylistModel.js';
import userModel from '../models/userModel.js';

const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_KEY;
    if (!apiKey) return null;
    return new GoogleGenerativeAI(apiKey);
};

export const handleChatbotMessage = async (req, res) => {
    try {
        const { message, history, currentUser } = req.body;

        const genAI = getGeminiClient();
        if (!genAI) {
            return res.status(500).json({
                success: false,
                message: 'Thiếu cấu hình Gemini API key trên server.'
            });
        }

        // Lấy ngày giờ hiện tại của Việt Nam để AI tự tính ngày tháng
        const today = new Date().toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

        // 1. CHUẨN BỊ LỜI DẶN DÒ ĐỘNG (DYNAMIC INSTRUCTION)
        let customInstruction = `[SYSTEM TIME CLOCK: Hôm nay là ngày ${today}. Hãy tự động tính toán các ngày "ngày mai", "tuần sau" dựa trên ngày này và LUÔN MẶC ĐỊNH LÀ NĂM HIỆN TẠI.]\n\n` + companyInfo;
        
        if (currentUser && currentUser.phone) {
            customInstruction += `\n\n[LƯU Ý ĐẶC BIỆT]: Bạn đang nói chuyện với khách hàng đã đăng nhập. 
            - Tên khách hàng: ${currentUser.name}
            - Số điện thoại: ${currentUser.phone}
            - BẮT BUỘC: KHÔNG ĐƯỢC hỏi tên và số điện thoại của họ nữa.
            - Khi cần gọi hàm createBooking hoặc cancelAppointment, hãy tự động lấy tên và số điện thoại ở trên để điền vào.`;
        } else {
            // CHẶN KHÁCH VÃNG LAI BẰNG PROMPT
            customInstruction += `\n\n[LƯU Ý ĐẶC BIỆT]: Bạn đang nói chuyện với khách vãng lai (chưa đăng nhập). 
            - QUY TẮC CỨNG: TUYỆT ĐỐI KHÔNG ĐƯỢC PHÉP ĐẶT LỊCH HOẶC HUỶ LỊCH.
            - Nếu khách yêu cầu đặt/huỷ lịch, hãy từ chối một cách lịch sự, khéo léo và hướng dẫn họ ĐĂNG NHẬP vào tài khoản trên website để thực hiện.
            - KHÔNG ĐƯỢC gọi các hàm 'checkAvailability', 'createBooking', hay 'cancelAppointment' trong bất kỳ hoàn cảnh nào.`;
        }

        // 2. KHỞI TẠO MODEL (Đã giữ lại model gemini-2.5-flash theo yêu cầu của bạn)
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
            
            // 3. CHẶN BẢO MẬT KÉP Ở BACKEND: Đề phòng AI lách luật gọi hàm khi là khách vãng lai
            if ((call.name === "createBooking" || call.name === "checkAvailability" || call.name === "cancelAppointment") && (!currentUser || !currentUser.phone)) {
                // Ép AI ghi nhận lỗi 
                await chat.sendMessage([{
                    functionResponse: { name: call.name, response: { error: "Yêu cầu đăng nhập." } }
                }]);
                // Trả thẳng thông báo cho người dùng
                return res.json({ 
                    success: true, 
                    reply: "Dạ để đảm bảo quyền lợi và theo dõi lịch sử dịch vụ, anh/chị vui lòng đăng nhập vào hệ thống trước khi sử dụng tính năng đặt hoặc huỷ lịch giúp em nhé ạ!" 
                });
            }
            
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

                const fallbackResult = await chat.sendMessage([{
                    functionResponse: { name: "createBooking", response: { success: false, message: "Không tìm thấy nhân viên để tạo lịch." } }
                }]);

                return res.json({ success: true, reply: fallbackResult.response.text() });
            }
        }

        return res.json({ success: true, reply: response.text() });

    } catch (error) {
        console.error("Chatbot Error:", error);
        
        // BẮT LỖI 503: GOOGLE BỊ QUÁ TẢI (Đóng vai trò như một lớp khiên bảo vệ)
        if (error.status === 503 || (error.message && error.message.includes("503"))) {
            return res.json({ 
                success: true, 
                reply: "Dạ hiện tại hệ thống tổng đài AI đang có chút quá tải do lượng khách truy cập đông. Anh/chị vui lòng thử nhắn lại giúp em sau vài giây nhé ạ!" 
            });
        }

        res.status(500).json({ success: false, message: "Lỗi hệ thống Chatbot AI" });
    }
};