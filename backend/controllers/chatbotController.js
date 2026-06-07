import { GoogleGenerativeAI } from '@google/generative-ai';
import { companyInfo } from '../config/companyInfo.js';
import { bookingTools } from '../config/geminiTools.js';
import appointmentModel from '../models/appointmentModel.js';
import stylistModel from '../models/stylistModel.js';
import userModel from '../models/userModel.js';
import { emitStylistSlotsUpdated } from '../utils/socket.js';

const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_KEY;
    if (!apiKey) return null;
    return new GoogleGenerativeAI(apiKey);
};

// CẬP NHẬT: Hàm kiểm tra thời gian siêu việt (Chặn quá khứ + Chặn ngoài giờ)
const validateBookingTime = (dateStr, timeStr) => {
    try {
        const [day, month, year] = dateStr.split('_').map(Number);
        let hours = 0, minutes = 0;
        
        if (timeStr) {
            const timeMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM|am|pm)?/i);
            if (timeMatch) {
                hours = parseInt(timeMatch[1], 10);
                minutes = parseInt(timeMatch[2], 10);
                const ampm = timeMatch[3] ? timeMatch[3].toUpperCase() : null;
                if (ampm === 'PM' && hours < 12) hours += 12;
                if (ampm === 'AM' && hours === 12) hours = 0;
            }
        }
        
        // 1. CHẶN NGOÀI GIỜ: Chỉ nhận khách từ 08:00 đến 20:00
        if (hours < 8 || hours > 20 || (hours === 20 && minutes > 0)) {
            return { 
                isValid: false, 
                message: "NGOÀI GIỜ LÀM VIỆC! Hệ thống chỉ mở cửa từ 08:00 AM và nhận khách trễ nhất lúc 20:00 (8h tối). Hãy từ chối khách." 
            };
        }

        // 2. CHẶN QUÁ KHỨ
        const nowInVN = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Ho_Chi_Minh"}));
        const bookingDate = new Date(year, month - 1, day, hours, minutes);
        
        if (bookingDate.getTime() < nowInVN.getTime()) {
            return { 
                isValid: false, 
                message: "THỜI GIAN TRONG QUÁ KHỨ KHÔNG HỢP LỆ! Nhắc khách chọn thời gian tương lai." 
            };
        }

        const normalizedDate = `${day}_${month}_${year}`; 
        const normalizedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`; 
        return { isValid: true, normalizedDate, normalizedTime };
    } catch (e) {
        return { isValid: false, message: "Định dạng thời gian không hợp lệ." };
    }
};

export const handleChatbotMessage = async (req, res) => {
    try {
        const { message, history, currentUser } = req.body;

        let dbUser = null;
        if (currentUser && currentUser.email) {
            dbUser = await userModel.findOne({ email: currentUser.email });
            if (dbUser && dbUser.isBanned) {
                return res.json({ 
                    success: true, 
                    reply: "⚠️ Tài khoản của anh/chị đã bị hệ thống tạm khoá do vi phạm quy định huỷ lịch quá 5 lần. Vui lòng liên hệ với Quản lý chi nhánh hoặc Hotline HDNCare để được hỗ trợ xử lý ạ." 
                });
            }
        }

        const genAI = getGeminiClient();
        if (!genAI) {
            return res.status(500).json({ success: false, message: 'Thiếu cấu hình Gemini API key trên server.' });
        }

        const stylistsList = await stylistModel.find({});
        let realtimePricingInfo = `\n\n[BẢNG GIÁ DỊCH VỤ VÀ CHUYÊN VIÊN MỚI NHẤT (REAL-TIME CẬP NHẬT TỪ DATABASE)]:
        CẢNH BÁO TỐI CAO: BẠN PHẢI KIỂM TRA KỸ CHUYÊN MÔN VÀ CHI NHÁNH CỦA NHÂN VIÊN. TUYỆT ĐỐI TỪ CHỐI ĐẶT LỊCH NẾU KHÁCH YÊU CẦU SAI CHUYÊN MÔN HOẶC SAI CHI NHÁNH!\n`;
        
        if (stylistsList && stylistsList.length > 0) {
            stylistsList.forEach(sty => {
                const price = sty.fees ? sty.fees.toLocaleString('vi-VN') + ' VNĐ' : '250.000 VNĐ';
                const specialty = sty.specialty || sty.speciality || 'Không xác định'; 
                const experience = sty.experience ? `${sty.experience}` : 'Chưa rõ';
                const branch = sty.branch || sty.branchName || 'Chưa phân bổ';
                
                realtimePricingInfo += `- Chuyên viên ${sty.name} (Chuyên môn: ${specialty} - Chi nhánh: ${branch} - Kinh nghiệm: ${experience}): Giá dịch vụ là ${price}.\n`;
            });
        } else {
            realtimePricingInfo += "- Hệ thống đang cập nhật danh sách chuyên viên.\n";
        }

        const nowInVN = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Ho_Chi_Minh"}));
        const today = nowInVN.toLocaleDateString('vi-VN');
        const currentTime = nowInVN.toLocaleTimeString('vi-VN', { hour12: false });

        let customInstruction = `[SYSTEM TIME CLOCK: Thời điểm NGAY LÚC NÀY là ${currentTime} ngày ${today}. Hãy tự động tính toán các ngày "ngày mai", "tuần sau" dựa trên mốc này. TUYỆT ĐỐI KHÔNG CHẤP NHẬN YÊU CẦU ĐẶT LỊCH VÀO QUÁ KHỨ!]\n\n` + companyInfo + realtimePricingInfo;
        
        customInstruction += `\n\n[HƯỚNG DẪN QUY TRÌNH ĐẶT LỊCH HỆ THỐNG]:
        Khi khách hàng hỏi về quy trình đặt lịch trên website HDNCare, hãy giới thiệu 5 bước:
        - Bước 1 (BẮT BUỘC): Đăng ký / Đăng nhập.
        - Bước 2: Tại Trang chủ, lựa chọn Chi nhánh Salon.
        - Bước 3: Lựa chọn phân loại dịch vụ (Makeup/Stylist).
        - Bước 4: Lựa chọn Chuyên viên, sau đó chọn Ngày và Khung giờ.
        - Bước 5: Kiểm tra thông tin tại trang Xác nhận và tiến hành Thanh toán.
        [ĐẶC QUYỀN AI]: Ngay sau khi đăng nhập thành công, khách hoàn toàn có thể nhắn tin yêu cầu Chatbot đặt lịch, dời lịch hoặc huỷ lịch ngay tại khung chat.`;

        customInstruction += `\n\n[HƯỚNG DẪN QUY TRÌNH THANH TOÁN SAU KHI ĐẶT LỊCH THÀNH CÔNG]:
        Sau khi đặt lịch thành công, BẠN BẮT BUỘC PHẢI hướng dẫn khách hàng chi tiết 2 phương thức thanh toán sau:
        + Thanh toán tiền mặt: đến chi nhánh đã đặt lịch và thanh toán bằng tiền mặt
        + Thanh toán chuyển khoản: Tìm lịch hẹn vừa đặt trong phần Lịch hẹn của tôi, nhấn nút **Thanh toán** và lựa chọn phương thức chuyển khoản.
        
        👉 CÁCH NẠP TIỀN VÍ: Truy cập "Trang cá nhân" -> "Ví của tôi" -> Nhập số tiền -> Nạp qua VNPay.
        [BẢO MẬT]: Tuyệt đối KHÔNG yêu cầu cung cấp số thẻ, mã CVV, OTP vào khung chat.
        [CHÍNH SÁCH HUỶ LỊCH QUAN TRỌNG]: Huỷ trước 2 tiếng: Hoàn 100%. Huỷ dưới 2 tiếng: Mất cọc HOẶC khấu trừ 20% phí thanh toán toàn bộ, và bị tính 1 lần vi phạm (5 lần sẽ bị ban).`;

        if (currentUser && currentUser.phone) {
            customInstruction += `\n\n[LƯU Ý ĐẶC BIỆT]: Bạn đang nói chuyện với khách hàng đã đăng nhập. 
            - Tên khách hàng: ${currentUser.name}
            - Số điện thoại: ${currentUser.phone}
            - BẮT BUỘC: KHÔNG ĐƯỢC hỏi tên và số điện thoại của họ nữa.
            - Khi gọi hàm createBooking, cancelAppointment, HOẶC rescheduleAppointment, tự động lấy tên và SĐT để điền.`;
        } else {
            customInstruction += `\n\n[LƯU Ý ĐẶC BIỆT]: Bạn đang nói chuyện với khách vãng lai (chưa đăng nhập). 
            - QUY TẮC CỨNG: TUYỆT ĐỐI KHÔNG ĐƯỢC PHÉP ĐẶT LỊCH, HUỶ LỊCH HOẶC DỜI LỊCH TRÊN KHUNG CHAT.
            - Từ chối lịch sự và hướng dẫn họ ĐĂNG NHẬP/ĐĂNG KÝ.
            - KHÔNG ĐƯỢC gọi các hàm 'checkAvailability', 'createBooking', 'cancelAppointment', hay 'rescheduleAppointment'.`;
        }

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
            
            if ((call.name === "createBooking" || call.name === "checkAvailability" || call.name === "cancelAppointment" || call.name === "rescheduleAppointment") && (!currentUser || !currentUser.phone)) {
                await chat.sendMessage([{
                    functionResponse: { name: call.name, response: { error: "Yêu cầu đăng nhập." } }
                }]);
                return res.json({ 
                    success: true, 
                    reply: "Dạ để đảm bảo quyền lợi bảo mật, hệ thống yêu cầu anh/chị cần đăng nhập tài khoản trước ạ. Anh/chị vui lòng đăng nhập ở góc phải màn hình để trải nghiệm nhé." 
                });
            }
            
            if (call.name === "checkAvailability") {
                const { stylistName, slotDate, slotTime } = call.args;

                const timeValidation = validateBookingTime(slotDate, slotTime);
                if (!timeValidation.isValid) {
                    const errorResult = await chat.sendMessage([{
                        functionResponse: { name: "checkAvailability", response: { error: timeValidation.message } }
                    }]);
                    return res.json({ success: true, reply: errorResult.response.text() });
                }
                const normalizedDate = timeValidation.normalizedDate;
                const normalizedTime = timeValidation.normalizedTime;

                // TÌM THEO MẢNG ĐỂ BẮT TRƯỜNG HỢP TRÙNG TÊN
                const stylists = await stylistModel.find({ name: stylistName });
                
                if (stylists.length === 0) {
                    const fallbackResult = await chat.sendMessage([{
                        functionResponse: { name: "checkAvailability", response: { error: "Không tìm thấy nhân viên này." } }
                    }]);
                    return res.json({ success: true, reply: fallbackResult.response.text() });
                }

                // NẾU PHÁT HIỆN TRÙNG TÊN: ÉP AI HỎI LẠI KHÁCH HÀNG
                if (stylists.length > 1) {
                    const errorResult = await chat.sendMessage([{
                        functionResponse: { name: "checkAvailability", response: { error: "CẢNH BÁO LỖI HỆ THỐNG: Đang có nhiều nhân viên trùng tên này trong Database. Bạn PHẢI yêu cầu khách hàng xác nhận lại họ muốn đặt chuyên viên này ở Chi nhánh nào hoặc Chuyên môn gì trước khi đi tiếp." } }
                    }]);
                    return res.json({ success: true, reply: errorResult.response.text() });
                }

                const stylist = stylists[0];

                const isBooked = await appointmentModel.findOne({
                    styId: stylist._id.toString(),
                    slotDate: normalizedDate,
                    slotTime: normalizedTime,
                    cancelled: false
                });

                const stylistSpecialty = stylist.specialty || stylist.speciality || 'Không xác định';
                const stylistBranch = stylist.branch || stylist.branchName || 'Không xác định';
                
                const aiGuardrailMsg = `[LỆNH ÉP BUỘC: Nhân viên này có chuyên môn là '${stylistSpecialty}' và LÀM VIỆC TẠI CHI NHÁNH '${stylistBranch}'. BẮT BUỘC kiểm tra xem có khớp với yêu cầu của khách không. NẾU SAI CHUYÊN MÔN HOẶC SAI CHI NHÁNH, TỪ CHỐI NGAY!]`;

                const dbResult = {
                    isAvailable: !isBooked,
                    message: isBooked ? "BẮT BUỘC: Bạn phải thông báo cho khách hàng là 'Khung giờ này đã có khách khác đặt mất rồi' và gợi ý khách chọn giờ khác. TUYỆT ĐỐI KHÔNG bịa lý do là quá khứ." : `Khung giờ này đang trống. ${aiGuardrailMsg}`
                };

                const finalResult = await chat.sendMessage([{
                    functionResponse: { name: "checkAvailability", response: dbResult }
                }]);

                return res.json({ success: true, reply: finalResult.response.text() });
            } 
            
            else if (call.name === "cancelAppointment") {
                const { customerPhone, slotDate, slotTime } = call.args;

                const timeValidation = validateBookingTime(slotDate, slotTime);
                const normalizedDate = timeValidation.isValid ? timeValidation.normalizedDate : slotDate;
                const normalizedTime = timeValidation.isValid ? timeValidation.normalizedTime : slotTime;

                let query = {
                    slotDate: normalizedDate,
                    slotTime: normalizedTime,
                    cancelled: false
                };
                if (dbUser) {
                    query.userId = dbUser._id.toString();
                } else {
                    query["userData.phone"] = customerPhone;
                }
                const appointment = await appointmentModel.findOne(query);

                let dbResult = {};
                let isBannedFlag = false;

                if (appointment) {
                    const [day, month, year] = appointment.slotDate.split('_').map(Number);
                    let hours = 0, minutes = 0;
                    
                    const timeMatch = appointment.slotTime.match(/(\d+):(\d+)\s*(AM|PM|am|pm)?/i);
                    if (timeMatch) {
                        hours = parseInt(timeMatch[1], 10);
                        minutes = parseInt(timeMatch[2], 10);
                        const ampm = timeMatch[3] ? timeMatch[3].toUpperCase() : null;
                        if (ampm === 'PM' && hours < 12) hours += 12;
                        if (ampm === 'AM' && hours === 12) hours = 0;
                    }
                    
                    const appointmentDateTime = new Date(year, month - 1, day, hours, minutes);
                    const nowInVN = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Ho_Chi_Minh"}));
                    
                    const timeUntilAppointment = appointmentDateTime.getTime() - nowInVN.getTime();
                    const TWO_HOURS_IN_MS = 2 * 60 * 60 * 1000;

                    appointment.cancelled = true;
                    
                    const stylist = await stylistModel.findById(appointment.styId);
                    if (stylist && stylist.slots_booked && stylist.slots_booked[appointment.slotDate]) {
                        stylist.slots_booked[appointment.slotDate] = stylist.slots_booked[appointment.slotDate].filter(t => t !== appointment.slotTime);
                        await stylistModel.findByIdAndUpdate(stylist._id, { slots_booked: stylist.slots_booked });
                        emitStylistSlotsUpdated(stylist._id, { action: "cancelled", slotDate: appointment.slotDate, slotTime: appointment.slotTime });
                    }

                    if (timeUntilAppointment > TWO_HOURS_IN_MS) {
                        appointment.cancellationReasons = ["Khách hàng huỷ lịch qua AI hợp lệ (trước 2 tiếng)"];
                        dbResult = { success: true, message: "Huỷ lịch thành công. Đã áp dụng chính sách hoàn 100% tiền (nếu có) và không tính lỗi vi phạm." };
                    } else {
                        let penaltyMsg = "";
                        let user = dbUser || await userModel.findOne({ phone: customerPhone });
                        
                        if (user) {
                            user.penaltyCount = (user.penaltyCount || 0) + 1;
                            
                            if (user.penaltyCount >= 5) {
                                user.isBanned = true;
                                isBannedFlag = true;
                                penaltyMsg = `TÀI KHOẢN ĐÃ BỊ KHOÁ do vi phạm huỷ lịch sát giờ 5 lần.`;
                            } else {
                                penaltyMsg = `Khách bị tính 1 lần vi phạm (Hiện tại: ${user.penaltyCount}/5 lần).`;
                            }
                            await user.save();
                        }
                        
                        appointment.cancellationReasons = ["Khách hàng huỷ lịch qua AI quá gấp (dưới 2 tiếng)"];
                        appointment.cancellationDetails = penaltyMsg;
                        
                        dbResult = { success: true, message: `Huỷ lịch thành công. Hệ thống áp dụng chính sách KHÔNG hoàn cọc hoặc KHẤU TRỪ 20% phí. ${penaltyMsg}` };
                    }

                    await appointment.save();
                } else {
                    dbResult = { success: false, message: "Không tìm thấy lịch hẹn trùng khớp để huỷ." };
                }

                const finalResult = await chat.sendMessage([{
                    functionResponse: { name: "cancelAppointment", response: dbResult }
                }]);

                return res.json({ 
                    success: true, 
                    reply: finalResult.response.text(),
                    isBanned: isBannedFlag
                });
            }

            else if (call.name === "rescheduleAppointment") {
                const { customerPhone, oldSlotDate, oldSlotTime, newSlotDate, newSlotTime } = call.args;

                const oldTimeValidation = validateBookingTime(oldSlotDate, oldSlotTime);
                const normalizedOldDate = oldTimeValidation.isValid ? oldTimeValidation.normalizedDate : oldSlotDate;
                const normalizedOldTime = oldTimeValidation.isValid ? oldTimeValidation.normalizedTime : oldSlotTime;

                const timeValidation = validateBookingTime(newSlotDate, newSlotTime);
                if (!timeValidation.isValid) {
                    const errorResult = await chat.sendMessage([{
                        functionResponse: { name: "rescheduleAppointment", response: { error: timeValidation.message } }
                    }]);
                    return res.json({ success: true, reply: errorResult.response.text() });
                }
                const normalizedNewDate = timeValidation.normalizedDate;
                const normalizedNewTime = timeValidation.normalizedTime;

                let query = {
                    slotDate: normalizedOldDate,
                    slotTime: normalizedOldTime,
                    cancelled: false
                };
                if (dbUser) {
                    query.userId = dbUser._id.toString();
                } else {
                    query["userData.phone"] = customerPhone;
                }
                const appointment = await appointmentModel.findOne(query);

                let dbResult = {};
                if (!appointment) {
                    dbResult = { success: false, message: "Không tìm thấy lịch hẹn cũ trùng khớp để dời lịch." };
                } else {
                    const isConflict = await appointmentModel.findOne({
                        styId: appointment.styId,
                        slotDate: normalizedNewDate,
                        slotTime: normalizedNewTime,
                        cancelled: false
                    });

                    if (isConflict) {
                        dbResult = { success: false, message: "BẮT BUỘC: Bạn phải thông báo cho khách là 'Khung giờ này đã có khách khác đặt' và yêu cầu chọn giờ khác. TUYỆT ĐỐI KHÔNG bịa lý do." };
                    } else {
                        const stylist = await stylistModel.findById(appointment.styId);
                        if (stylist && stylist.slots_booked) {
                            let slots_booked = stylist.slots_booked;
                            if (slots_booked[normalizedOldDate]) {
                                slots_booked[normalizedOldDate] = slots_booked[normalizedOldDate].filter(t => t !== normalizedOldTime);
                            }
                            if (slots_booked[normalizedNewDate]) {
                                if (!slots_booked[normalizedNewDate].includes(normalizedNewTime)) {
                                    slots_booked[normalizedNewDate].push(normalizedNewTime);
                                }
                            } else {
                                slots_booked[normalizedNewDate] = [normalizedNewTime];
                            }
                            await stylistModel.findByIdAndUpdate(stylist._id, { slots_booked });
                            emitStylistSlotsUpdated(stylist._id, { action: "cancelled", slotDate: normalizedOldDate, slotTime: normalizedOldTime });
                            emitStylistSlotsUpdated(stylist._id, { action: "booked", slotDate: normalizedNewDate, slotTime: normalizedNewTime });
                        }

                        appointment.slotDate = normalizedNewDate;
                        appointment.slotTime = normalizedNewTime;
                        await appointment.save();
                        dbResult = { success: true, message: "Đã dời lịch thành công sang thời gian mới." };
                    }
                }

                const finalResult = await chat.sendMessage([{
                    functionResponse: { name: "rescheduleAppointment", response: dbResult }
                }]);

                return res.json({ success: true, reply: finalResult.response.text() });
            }

            else if (call.name === "createBooking") {
                const { customerName, customerPhone, stylistName, branchName, slotDate, slotTime } = call.args;

                const timeValidation = validateBookingTime(slotDate, slotTime);
                const normalizedDate = timeValidation.isValid ? timeValidation.normalizedDate : slotDate;
                const normalizedTime = timeValidation.isValid ? timeValidation.normalizedTime : slotTime;

                // CẬP NHẬT: LỌC TRÙNG TÊN LÚC LƯU DATABASE KẾT HỢP VỚI CHI NHÁNH ĐỂ LƯU ĐÚNG NGƯỜI
                const stylists = await stylistModel.find({ name: stylistName });
                let stylist = null;

                if (stylists.length === 1) {
                    stylist = stylists[0];
                } else if (stylists.length > 1) {
                    stylist = stylists.find(s => s.branch === branchName || s.branchName === branchName) || stylists[0];
                }

                let finalUserId = dbUser ? dbUser._id.toString() : "GUEST";
                let finalUserData = dbUser ? dbUser : { name: customerName, phone: customerPhone, isGuest: true };
                

                if (stylist) {
                    const appointmentData = {
                        userId: finalUserId, 
                        styId: stylist._id.toString(),
                        branch: branchName || stylist.branch || 'Chưa phân bổ',
                        slotDate: normalizedDate,
                        slotTime: normalizedTime,
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

                    let slots_booked = stylist.slots_booked || {};
                    if (slots_booked[normalizedDate]) {
                        if (!slots_booked[normalizedDate].includes(normalizedTime)) {
                            slots_booked[normalizedDate].push(normalizedTime);
                        }
                    } else {
                        slots_booked[normalizedDate] = [normalizedTime];
                    }
                    await stylistModel.findByIdAndUpdate(stylist._id, { slots_booked });
                    emitStylistSlotsUpdated(stylist._id, { action: "booked", slotDate: normalizedDate, slotTime: normalizedTime });

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