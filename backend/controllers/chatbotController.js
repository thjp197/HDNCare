import { GoogleGenerativeAI } from '@google/generative-ai';
import { companyInfo } from '../config/companyInfo.js';
import { bookingTools } from '../config/geminiTools.js';
import appointmentModel from '../models/appointmentModel.js';
import stylistModel from '../models/stylistModel.js';
import userModel from '../models/userModel.js'; // Thêm import này

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash", // Đã đổi sang 1.5 để tránh lỗi Quota 429
    systemInstruction: companyInfo,
    tools: bookingTools,
});

export const handleChatbotMessage = async (req, res) => {
    try {
        const { message, history } = req.body;

        const chat = model.startChat({
            history: history || []
        });

        const result = await chat.sendMessage(message);
        const response = result.response;
        const functionCalls = response.functionCalls();

        if (functionCalls && functionCalls.length > 0) {
            const call = functionCalls[0];
            
            // 1. XỬ LÝ KIỂM TRA TRÙNG LỊCH
            if (call.name === "checkAvailability") {
                const { stylistName, slotDate, slotTime } = call.args;
                const stylist = await stylistModel.findOne({ name: stylistName });
                
                if (!stylist) {
                    const fallbackResult = await chat.sendMessage([{
                        functionResponse: { name: "checkAvailability", response: { error: "Không tìm thấy nhân viên này." } }
                    }]);
                    return res.json({ success: true, reply: fallbackResult.response.text() });
                }

                const isBooked = await appointmentModel.findOne({
                    styId: stylist._id.toString(),
                    slotDate,
                    slotTime,
                    cancelled: false
                });

                const dbResult = {
                    isAvailable: !isBooked,
                    message: isBooked ? "Khung giờ này đã kín." : "Khung giờ này còn trống."
                };

                const finalResult = await chat.sendMessage([{
                    functionResponse: { name: "checkAvailability", response: dbResult }
                }]);

                return res.json({ success: true, reply: finalResult.response.text() });
            } 
            
            // 2. XỬ LÝ HUỶ LỊCH
            else if (call.name === "cancelAppointment") {
                const { customerPhone, slotDate, slotTime } = call.args;
                const appointment = await appointmentModel.findOne({
                    slotDate,
                    slotTime,
                    "userData.phone": customerPhone,
                    cancelled: false
                });

                let dbResult = { success: false, message: "Không tìm thấy lịch để huỷ." };

                if (appointment) {
                    appointment.cancelled = true;
                    await appointment.save();
                    dbResult = { success: true, message: "Đã huỷ lịch thành công." };
                }

                const finalResult = await chat.sendMessage([{
                    functionResponse: { name: "cancelAppointment", response: dbResult }
                }]);

                return res.json({ success: true, reply: finalResult.response.text() });
            }

            // 3. XỬ LÝ TẠO LỊCH MỚI (MỚI THÊM)
            else if (call.name === "createBooking") {
                const { customerName, customerPhone, stylistName, slotDate, slotTime } = call.args;

                // Tìm thông tin Stylist và User từ Database
                const stylist = await stylistModel.findOne({ name: stylistName });
                let user = await userModel.findOne({ phone: customerPhone });

                // Nếu khách chưa có tài khoản, tạo một object giả lập để lưu vào userData
                if (!user) {
                    user = { name: customerName, phone: customerPhone, email: "guest@hdncare.com" };
                }

                if (stylist) {
                    const appointmentData = {
                        userId: user._id ? user._id.toString() : "GUEST_USER",
                        styId: stylist._id.toString(),
                        slotDate,
                        slotTime,
                        userData: user,
                        styData: stylist,
                        amount: stylist.fees || 250000,
                        date: Date.now(),
                        cancelled: false,
                        payment: false,
                        isCompleted: false
                    };

                    const newAppointment = new appointmentModel(appointmentData);
                    await newAppointment.save();

                    const dbResult = { success: true, message: "Lịch hẹn đã được lưu vào hệ thống Atlas." };

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