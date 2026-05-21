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
        
        // --- HƯỚNG DẪN QUY TRÌNH ĐẶT LỊCH HỆ THỐNG ---
        customInstruction += `\n\n[HƯỚNG DẪN QUY TRÌNH ĐẶT LỊCH HỆ THỐNG]:
        Khi khách hàng hỏi về quy trình, các bước đặt lịch hoặc lộ trình sử dụng dịch vụ trên website HDNCare, hãy giới thiệu rõ ràng cho họ quy trình chuẩn 5 bước sau:
        - Bước 1 (BẮT BUỘC): Đăng ký / Đăng nhập vào tài khoản cá nhân trên website.
        - Bước 2: Tại Trang chủ, lựa chọn Chi nhánh Salon (Select Salon) phù hợp hoặc gần vị trí của mình nhất.
        - Bước 3: Lựa chọn phân loại dịch vụ theo nhu cầu: Trang điểm (Makeup) hoặc Làm tóc/Tạo kiểu (Stylist).
        - Bước 4: Khám phá hồ sơ cá nhân và lựa chọn Chuyên viên yêu thích, sau đó chọn một Ngày và Khung giờ còn trống (Select Time Slot) trên lịch làm việc của họ.
        - Bước 5: Kiểm tra lại toàn bộ thông tin tại trang Xác nhận (Confirm booking), tiến hành Thanh toán (RECAP + Payment) qua cổng VNPay hoặc bằng số dư Ví điện tử để hoàn tất.
        [ĐẶC QUYỀN AI]: Hãy luôn tự hào thông báo thêm với khách rằng: Ngay sau khi họ có tài khoản và đăng nhập thành công, họ hoàn toàn có thể nhắn tin yêu cầu bạn (AI Chatbot) đặt lịch hoặc huỷ lịch giúp họ ngay lập tức tại khung chat này mà không cần tự click qua 5 bước trên web.`;

        // --- ĐOẠN HƯỚNG DẪN THANH TOÁN ---
        customInstruction += `\n\n[HƯỚNG DẪN QUY TRÌNH THANH TOÁN]:
        Hệ thống HDNCare hỗ trợ thanh toán an toàn qua cổng VNPay và thanh toán bằng Ví điện tử nội bộ. Khi khách hàng hỏi về cách thanh toán hoặc cách nạp tiền, hãy hướng dẫn họ một cách lịch sự theo các bước sau:
        1. Đăng nhập vào tài khoản trên website.
        2. Cách nạp tiền vào Ví: Truy cập trang thông tin cá nhân, chọn mục "Ví của tôi" (Wallet) -> Nhập số tiền -> Bấm "Nạp tiền". Hệ thống sẽ chuyển hướng sang cổng VNPay để giao dịch an toàn.
        3. Cách thanh toán lịch hẹn: Sau khi tạo lịch hẹn thành công, khách hàng có thể thanh toán ngay tại bước xác nhận, hoặc vào mục "Lịch sử đặt lịch" để tiến hành thanh toán. Có thể dùng số dư trong Ví HDNCare hoặc thanh toán trực tiếp qua VNPay.
        [QUY TẮC BẢO MẬT TỐI CAO]: Tuyệt đối không bao giờ yêu cầu khách hàng cung cấp số thẻ ngân hàng, mã CVV, mật khẩu hoặc mã OTP vào khung chat. Khẳng định với khách rằng AI Chatbot không trực tiếp thu tiền.`;

        if (currentUser && currentUser.phone) {
            customInstruction += `\n\n[LƯU Ý ĐẶC BIỆT]: Bạn đang nói chuyện với khách hàng đã đăng nhập. 
            - Tên khách hàng: ${currentUser.name}
            - Số điện thoại: ${currentUser.phone}
            - BẮT BUỘC: KHÔNG ĐƯỢC hỏi tên và số điện thoại của họ nữa.
            - Khi cần gọi hàm createBooking hoặc cancelAppointment, hãy tự động lấy tên và số điện thoại ở trên để điền vào.`;
        } else {
            // CHẶN KHÁCH VÃNG LAI BẰNG PROMPT VÀ ĐIỀU HƯỚNG SANG QUY TRÌNH TỰ ĐẶT LỊCH
            customInstruction += `\n\n[LƯU Ý ĐẶC BIỆT]: Bạn đang nói chuyện với khách vãng lai (chưa đăng nhập). 
            - QUY TẮC CỨNG: TUYỆT ĐỐI KHÔNG ĐƯỢC PHÉP ĐẶT LỊCH HOẶC HUỶ LỊCH TRỰC TIẾP TRÊN KHUNG CHAT.
            - Nếu khách yêu cầu đặt/huỷ lịch, hãy từ chối một cách lịch sự, khéo léo. Sau đó, giới thiệu chi tiết 5 bước trong [HƯỚNG DẪN QUY TRÌNH ĐẶT LỊCH HỆ THỐNG] để họ hiểu và hướng dẫn họ ĐĂNG NHẬP/ĐĂNG KÝ vào tài khoản trên website. Đừng quên nhắc họ rằng bạn có thể đặt lịch giúp họ sau khi họ đăng nhập.
            - KHÔNG ĐƯỢC gọi các hàm 'checkAvailability', 'createBooking', hay 'cancelAppointment' trong bất kỳ hoàn cảnh nào.`;
        }

        // 2. KHỞI TẠO MODEL (Gemini 2.5 Flash)
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
            
            // 3. CHẶN BẢO MẬT KÉP Ở BACKEND
            if ((call.name === "createBooking" || call.name === "checkAvailability" || call.name === "cancelAppointment") && (!currentUser || !currentUser.phone)) {
                // Ép AI ghi nhận lỗi 
                await chat.sendMessage([{
                    functionResponse: { name: call.name, response: { error: "Yêu cầu đăng nhập." } }
                }]);
                // Trả thẳng thông báo cho người dùng (Đã cập nhật câu mời gọi đặt lịch qua Chatbot)
                return res.json({ 
                    success: true, 
                    reply: "Dạ để đảm bảo quyền lợi bảo mật và đồng bộ lịch sử dịch vụ, hệ thống yêu cầu anh/chị cần đăng nhập tài khoản trước ạ.\n\nQuy trình tự đặt lịch trên website vô cùng đơn giản gồm 5 bước:\n1. Đăng nhập/Đăng ký tài khoản.\n2. Chọn Chi nhánh gần nhất.\n3. Chọn dịch vụ (Makeup/Stylist).\n4. Chọn Chuyên viên & Khung giờ.\n5. Xác nhận & Thanh toán.\n\n💡 **Đặc biệt:** Ngay sau khi đăng nhập (hoặc đăng ký xong), anh/chị hoàn toàn có thể nhắn tin yêu cầu em đặt lịch giúp ngay tại khung chat này luôn ạ, vô cùng tiện lợi! Anh/chị vui lòng đăng nhập ở góc phải màn hình để trải nghiệm nhé." 
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
        
        // BẮT LỖI 503: GOOGLE BỊ QUÁ TẢI
        if (error.status === 503 || (error.message && error.message.includes("503"))) {
            return res.json({ 
                success: true, 
                reply: "Dạ hiện tại hệ thống tổng đài AI đang có chút quá tải do lượng khách truy cập đông. Anh/chị vui lòng thử nhắn lại giúp em sau vài giây nhé ạ!" 
            });
        }

        res.status(500).json({ success: false, message: "Lỗi hệ thống Chatbot AI" });
    }
};