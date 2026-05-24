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

        // --- 1. CHẶN TỪ CỬA: KIỂM TRA TÀI KHOẢN CÓ BỊ KHOÁ KHÔNG ---
        if (currentUser && currentUser.phone) {
            const dbUser = await userModel.findOne({ phone: currentUser.phone });
            if (dbUser && dbUser.isBanned) {
                return res.json({ 
                    success: true, 
                    reply: "⚠️ Tài khoản của anh/chị đã bị hệ thống tạm khoá do vi phạm quy định huỷ lịch quá 5 lần. Vui lòng liên hệ với Quản lý chi nhánh hoặc Hotline HDNCare để được hỗ trợ xử lý ạ." 
                });
            }
        }

        const genAI = getGeminiClient();
        if (!genAI) {
            return res.status(500).json({
                success: false,
                message: 'Thiếu cấu hình Gemini API key trên server.'
            });
        }

        // --- 2. LẤY BẢNG GIÁ VÀ KINH NGHIỆM REAL-TIME TỪ DATABASE ---
        const stylistsList = await stylistModel.find({});
        let realtimePricingInfo = `\n\n[BẢNG GIÁ DỊCH VỤ VÀ CHUYÊN VIÊN MỚI NHẤT (REAL-TIME CẬP NHẬT TỪ DATABASE)]:
        Hãy sử dụng thông tin giá tiền và kinh nghiệm dưới đây để báo giá, tư vấn cho khách (Tuyệt đối không dùng giá cũ ở bất kỳ đâu): \n`;
        
        if (stylistsList && stylistsList.length > 0) {
            stylistsList.forEach(sty => {
                const price = sty.fees ? sty.fees.toLocaleString('vi-VN') + ' VNĐ' : '250.000 VNĐ';
                const specialty = sty.specialty || 'Dịch vụ làm đẹp';
                const experience = sty.experience ? `${sty.experience} kinh nghiệm` : 'Chuyên viên chuyên nghiệp';
                
                realtimePricingInfo += `- Chuyên viên ${sty.name} (Chuyên môn: ${specialty} - ${experience}): Giá dịch vụ là ${price}.\n`;
            });
        } else {
            realtimePricingInfo += "- Hệ thống đang cập nhật danh sách chuyên viên.\n";
        }

        const today = new Date().toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

        // --- 3. CHUẨN BỊ LỜI DẶN DÒ ĐỘNG ---
        let customInstruction = `[SYSTEM TIME CLOCK: Hôm nay là ngày ${today}. Hãy tự động tính toán các ngày "ngày mai", "tuần sau" dựa trên ngày này và LUÔN MẶC ĐỊNH LÀ NĂM HIỆN TẠI.]\n\n` + companyInfo + realtimePricingInfo;
        
        customInstruction += `\n\n[HƯỚNG DẪN QUY TRÌNH ĐẶT LỊCH HỆ THỐNG]:
        Khi khách hàng hỏi về quy trình, các bước đặt lịch hoặc lộ trình sử dụng dịch vụ trên website HDNCare, hãy giới thiệu rõ ràng cho họ quy trình chuẩn 5 bước sau:
        - Bước 1 (BẮT BUỘC): Đăng ký / Đăng nhập vào tài khoản cá nhân trên website.
        - Bước 2: Tại Trang chủ, lựa chọn Chi nhánh Salon (Select Salon) phù hợp hoặc gần vị trí của mình nhất.
        - Bước 3: Lựa chọn phân loại dịch vụ theo nhu cầu: Trang điểm (Makeup) hoặc Làm tóc/Tạo kiểu (Stylist).
        - Bước 4: Khám phá hồ sơ cá nhân và lựa chọn Chuyên viên yêu thích, sau đó chọn một Ngày và Khung giờ còn trống (Select Time Slot) trên lịch làm việc của họ.
        - Bước 5: Kiểm tra lại toàn bộ thông tin tại trang Xác nhận (Confirm booking), tiến hành Thanh toán (RECAP + Payment) qua cổng VNPay hoặc bằng số dư Ví điện tử để hoàn tất.
        [ĐẶC QUYỀN AI]: Hãy luôn tự hào thông báo thêm với khách rằng: Ngay sau khi họ có tài khoản và đăng nhập thành công, họ hoàn toàn có thể nhắn tin yêu cầu bạn (AI Chatbot) đặt lịch, dời lịch hoặc huỷ lịch giúp họ ngay lập tức tại khung chat này mà không cần tự click qua 5 bước trên web.`;

        customInstruction += `\n\n[HƯỚNG DẪN QUY TRÌNH THANH TOÁN & CHÍNH SÁCH HUỶ]:
        Hệ thống HDNCare hỗ trợ thanh toán an toàn qua cổng VNPay và thanh toán bằng Ví điện tử nội bộ.
        [QUY TẮC BẢO MẬT TỐI CAO]: Tuyệt đối không bao giờ yêu cầu khách hàng cung cấp số thẻ ngân hàng, mã CVV, mật khẩu hoặc mã OTP vào khung chat. Khẳng định với khách rằng AI Chatbot không trực tiếp thu tiền.
        [CHÍNH SÁCH HUỶ LỊCH QUAN TRỌNG]: Huỷ trong vòng 2 tiếng sau khi đặt sẽ được hoàn tiền 100% và không bị phạt. Huỷ sau 2 tiếng sẽ KHÔNG được hoàn tiền và bị tính 1 lần vi phạm. 5 lần vi phạm sẽ bị ban tài khoản.`;

        if (currentUser && currentUser.phone) {
            customInstruction += `\n\n[LƯU Ý ĐẶC BIỆT]: Bạn đang nói chuyện với khách hàng đã đăng nhập. 
            - Tên khách hàng: ${currentUser.name}
            - Số điện thoại: ${currentUser.phone}
            - BẮT BUỘC: KHÔNG ĐƯỢC hỏi tên và số điện thoại của họ nữa.
            - Khi cần gọi hàm createBooking, cancelAppointment, HOẶC rescheduleAppointment, hãy tự động lấy tên và số điện thoại ở trên để điền vào.`;
        } else {
            customInstruction += `\n\n[LƯU Ý ĐẶC BIỆT]: Bạn đang nói chuyện với khách vãng lai (chưa đăng nhập). 
            - QUY TẮC CỨNG: TUYỆT ĐỐI KHÔNG ĐƯỢC PHÉP ĐẶT LỊCH, HUỶ LỊCH HOẶC DỜI LỊCH TRỰC TIẾP TRÊN KHUNG CHAT.
            - Nếu khách yêu cầu thao tác lịch, hãy từ chối một cách lịch sự, khéo léo. Sau đó, giới thiệu chi tiết 5 bước trong [HƯỚNG DẪN QUY TRÌNH ĐẶT LỊCH HỆ THỐNG] và hướng dẫn họ ĐĂNG NHẬP/ĐĂNG KÝ.
            - KHÔNG ĐƯỢC gọi các hàm 'checkAvailability', 'createBooking', 'cancelAppointment', hay 'rescheduleAppointment' trong bất kỳ hoàn cảnh nào.`;
        }

        // --- 4. KHỞI TẠO MODEL VÀ GỬI TIN NHẮN ---
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
            
            // --- CHẶN BẢO MẬT KÉP Ở BACKEND ---
            if ((call.name === "createBooking" || call.name === "checkAvailability" || call.name === "cancelAppointment" || call.name === "rescheduleAppointment") && (!currentUser || !currentUser.phone)) {
                await chat.sendMessage([{
                    functionResponse: { name: call.name, response: { error: "Yêu cầu đăng nhập." } }
                }]);
                return res.json({ 
                    success: true, 
                    reply: "Dạ để đảm bảo quyền lợi bảo mật và đồng bộ lịch sử dịch vụ, hệ thống yêu cầu anh/chị cần đăng nhập tài khoản trước ạ.\n\nQuy trình tự đặt lịch trên website vô cùng đơn giản gồm 5 bước:\n1. Đăng nhập/Đăng ký tài khoản.\n2. Chọn Chi nhánh gần nhất.\n3. Chọn dịch vụ (Makeup/Stylist).\n4. Chọn Chuyên viên & Khung giờ.\n5. Xác nhận & Thanh toán.\n\n💡 **Đặc biệt:** Ngay sau khi đăng nhập, anh/chị hoàn toàn có thể nhắn tin yêu cầu em đặt lịch hoặc dời lịch giúp ngay tại khung chat này luôn ạ." 
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
            
            // --- XỬ LÝ HUỶ LỊCH (CÓ LUỒNG TÍNH THỜI GIAN VÀ PHẠT) ---
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
                    // Đổi 2 tiếng thành mili-giây
                    const TWO_HOURS = 2 * 60 * 60 * 1000;
                    const bookingTime = new Date(appointment.date).getTime();
                    const timeSinceBooking = Date.now() - bookingTime;

                    appointment.cancelled = true;
                    await appointment.save();

                    // Kiểm tra điều kiện thời gian huỷ
                    if (timeSinceBooking <= TWO_HOURS) {
                        // Khách huỷ đúng luật (Trong vòng 2 tiếng)
                        dbResult = { success: true, message: "Huỷ lịch thành công. Khách huỷ TRONG VÒNG 2 tiếng kể từ lúc đặt, hệ thống sẽ hỗ trợ HOÀN TIỀN 100% và KHÔNG tính lỗi phạt." };
                    } else {
                        // Khách huỷ sai luật (Sau 2 tiếng) -> Xử phạt
                        let penaltyMsg = "";
                        let user = await userModel.findOne({ phone: customerPhone });
                        
                        if (user) {
                            user.penaltyCount = (user.penaltyCount || 0) + 1;
                            
                            if (user.penaltyCount >= 5) {
                                user.isBanned = true;
                                penaltyMsg = `TÀI KHOẢN ĐÃ BỊ KHOÁ do vi phạm huỷ lịch 5 lần.`;
                            } else {
                                penaltyMsg = `Khách bị tính 1 lần vi phạm (Hiện tại: ${user.penaltyCount}/5 lần).`;
                            }
                            
                            await user.save();
                        }
                        
                        dbResult = { success: true, message: `Huỷ lịch thành công. Khách huỷ SAU 2 tiếng nên KHÔNG ĐƯỢC HOÀN TIỀN. ${penaltyMsg}` };
                    }
                } else {
                    dbResult = { success: false, message: "Không tìm thấy lịch hẹn trùng khớp để huỷ." };
                }

                const finalResult = await chat.sendMessage([{
                    functionResponse: { name: "cancelAppointment", response: dbResult }
                }]);

                return res.json({ success: true, reply: finalResult.response.text() });
            }

            // --- XỬ LÝ DỜI LỊCH ---
            else if (call.name === "rescheduleAppointment") {
                const { customerPhone, oldSlotDate, oldSlotTime, newSlotDate, newSlotTime } = call.args;

                const appointment = await appointmentModel.findOne({
                    slotDate: oldSlotDate,
                    slotTime: oldSlotTime,
                    "userData.phone": customerPhone,
                    cancelled: false
                });

                let dbResult = {};
                if (!appointment) {
                    dbResult = { success: false, message: "Không tìm thấy lịch hẹn cũ trùng khớp để dời lịch." };
                } else {
                    const isConflict = await appointmentModel.findOne({
                        styId: appointment.styId,
                        slotDate: newSlotDate,
                        slotTime: newSlotTime,
                        cancelled: false
                    });

                    if (isConflict) {
                        dbResult = { success: false, message: "Khung giờ mới đã có khách đặt, vui lòng gợi ý khách chọn giờ/ngày khác." };
                    } else {
                        appointment.slotDate = newSlotDate;
                        appointment.slotTime = newSlotTime;
                        await appointment.save();
                        dbResult = { success: true, message: "Đã dời lịch thành công sang thời gian mới." };
                    }
                }

                const finalResult = await chat.sendMessage([{
                    functionResponse: { name: "rescheduleAppointment", response: dbResult }
                }]);

                return res.json({ success: true, reply: finalResult.response.text() });
            }

            // --- XỬ LÝ TẠO LỊCH MỚI ---
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
        
        if (error.status === 503 || (error.message && error.message.includes("503"))) {
            return res.json({ 
                success: true, 
                reply: "Dạ hiện tại hệ thống AI đang có chút quá tải do lượng khách truy cập đông. Anh/chị vui lòng thử nhắn lại giúp em sau vài giây nhé ạ!" 
            });
        }

        res.status(500).json({ success: false, message: "Lỗi hệ thống Chatbot AI" });
    }
};