import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import userModel from "../models/userModel.js";
import { v2 as cloudinary } from 'cloudinary'
import stylistModel from "../models/stylistModel.js";
import appointmentModel from "../models/appointmentModel.js";
import { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } from 'vnpay';

const PERSONAL_LIBRARY_FOLDER = "hdn_care/personal_library";

const getCloudinaryPublicIdFromUrl = (imageUrl) => {
    if (!imageUrl || typeof imageUrl !== "string") return null;
    const marker = "/upload/";
    const markerIndex = imageUrl.indexOf(marker);

    if (markerIndex === -1) return null;

    let publicIdWithExt = imageUrl.slice(markerIndex + marker.length);
    publicIdWithExt = publicIdWithExt.split("?")[0];

    // Strip optional version segment: v1234567890/
    publicIdWithExt = publicIdWithExt.replace(/^v\d+\//, "");

    const lastDotIndex = publicIdWithExt.lastIndexOf(".");
    if (lastDotIndex === -1) return publicIdWithExt;

    return publicIdWithExt.slice(0, lastDotIndex);
};

// API to register user
const registerUser = async (req, res) => {

    try {
        const { name, email, password } = req.body;

        // checking for all data to register user
        if (!name || !email || !password) {
            return res.json({ success: false, message: 'Missing Details' })
        }

        // validating email format
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }

        // validating strong password
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" })
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10); // the more no. round the more time it will take
        const hashedPassword = await bcrypt.hash(password, salt)

        const userData = {
            name,
            email,
            password: hashedPassword,
        }

        const newUser = new userModel(userData)
        const user = await newUser.save()
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)

        res.json({ success: true, token })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to login user
const loginUser = async (req, res) => {

    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email })

        if (!user) {
            return res.json({ success: false, message: "User does not exist" })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
            res.json({ success: true, token })
        }
        else {
            res.json({ success: false, message: "Invalid credentials" })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get user profile data
const getProfile = async (req, res) => {

    try {
        const userId = req.userId
        const userData = await userModel.findById(userId).select('-password')

        res.json({ success: true, userData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to update user profile
const updateProfile = async (req, res) => {

    try {

        const userId = req.userId
        const { name, phone, address, dob, gender } = req.body
        const imageFile = req.file

        if (!name || !phone || !dob || !gender) {
            return res.json({ success: false, message: "Data Missing" })
        }

        await userModel.findByIdAndUpdate(userId, { name, phone, address: JSON.parse(address), dob, gender })

        if (imageFile) {

            // upload image to cloudinary
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
            const imageURL = imageUpload.secure_url

            await userModel.findByIdAndUpdate(userId, { image: imageURL })
        }

        res.json({ success: true, message: 'Profile Updated' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to change user password
const changePassword = async (req, res) => {
    try {
        const userId = req.userId
        const { currentPassword, newPassword, confirmPassword } = req.body

        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.json({ success: false, message: "Vui lòng nhập đầy đủ thông tin" })
        }

        if (newPassword !== confirmPassword) {
            return res.json({ success: false, message: "Xác nhận mật khẩu mới không khớp" })
        }

        if (newPassword.length < 8) {
            return res.json({ success: false, message: "Mật khẩu mới phải có ít nhất 8 ký tự" })
        }

        if (currentPassword === newPassword) {
            return res.json({ success: false, message: "Mật khẩu mới phải khác mật khẩu cũ" })
        }

        const user = await userModel.findById(userId)

        if (!user) {
            return res.json({ success: false, message: "Không tìm thấy người dùng" })
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password)

        if (!isMatch) {
            return res.json({ success: false, message: "Mật khẩu hiện tại không đúng" })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(newPassword, salt)

        await userModel.findByIdAndUpdate(userId, { password: hashedPassword })

        res.json({ success: true, message: "Đổi mật khẩu thành công" })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

//API to book appointment
const bookAppointment = async (req, res) => {
    try {
        
        const userId = req.userId
        const {styId, slotDate, slotTime, selectedStyleImage = null} = req.body

        const styData = await stylistModel.findById(styId).select('-password')
        const userData = await userModel.findById(userId).select('-password')

        if (!userData) {
            return res.json({ success: false, message: "User not found" })
        }

        if (selectedStyleImage && !(userData.personalImages || []).includes(selectedStyleImage)) {
            return res.json({ success: false, message: "Selected image is invalid" })
        }
        
        if(!styData.available){
            return res.json({ success: false, message: "Stylist not available at the selected time" })
        }

        let slots_booked = styData.slots_booked

        //checking for slot availability
        if(slots_booked[slotDate]){
            if(slots_booked[slotDate].includes(slotTime)){
                return res.json({ success: false, message: "Slot not available" })
            } else {
                slots_booked[slotDate].push(slotTime)
            }
        } else {
            slots_booked[slotDate] = []
            slots_booked[slotDate].push(slotTime)
        }

        delete styData.slots_booked

        const appointmentData = {
            userId,
            styId,
            userData,
            styData,
            amount: styData.fees,
            slotTime,
            slotDate,
            date: Date.now(),
            selectedStyleImage: selectedStyleImage || null,
        }

        const newAppointment = new appointmentModel(appointmentData)
        await newAppointment.save()

        //save new slots data in styData
        await stylistModel.findByIdAndUpdate(styId, { slots_booked })

        res.json({ success: true, message: "Appointment Booked" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to add or remove personal makeup library images
const updatePersonalImages = async (req, res) => {
    try {
        const userId = req.userId;
        const { action, imageData, imageUrl } = req.body;
        const imageFile = req.file;

        if (!["add", "remove"].includes(action)) {
            return res.json({ success: false, message: "Invalid action" });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        if (action === "add") {
            if (!imageFile && (!imageData || typeof imageData !== "string")) {
                return res.json({ success: false, message: "Missing image data" });
            }

            const uploaded = imageFile
                ? await cloudinary.uploader.upload(imageFile.path, {
                    folder: PERSONAL_LIBRARY_FOLDER,
                    resource_type: "image",
                })
                : await cloudinary.uploader.upload(imageData, {
                    folder: PERSONAL_LIBRARY_FOLDER,
                    resource_type: "image",
                });

            const secureUrl = uploaded.secure_url;
            user.personalImages = [...new Set([...(user.personalImages || []), secureUrl])];
            await user.save();

            return res.json({
                success: true,
                message: "Saved image to personal library",
                personalImages: user.personalImages,
                imageUrl: secureUrl,
            });
        }

        // action === "remove"
        if (!imageUrl || typeof imageUrl !== "string") {
            return res.json({ success: false, message: "Missing image URL" });
        }

        user.personalImages = (user.personalImages || []).filter((url) => url !== imageUrl);
        await user.save();

        const publicId = getCloudinaryPublicIdFromUrl(imageUrl);
        if (publicId) {
            await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
        }

        return res.json({
            success: true,
            message: "Removed image from personal library",
            personalImages: user.personalImages,
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

//API to get user appointments for FE my-appointments page
const listAppointment = async (req, res) => {
    try {
        const userId = req.userId

        if (!userId) {
            return res.json({ success: false, message: "Not Authorized Login Again" })
        }

        const appointments = await appointmentModel.find({ userId }).sort({ date: -1 })

        res.json({ success: true, appointments })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


//API to cancel appointment
const cancelAppointment = async (req, res) => {

    try {
        const userId = req.userId
        const { appointmentId, cancellationReasons, cancellationDetails } = req.body

        if (!userId) {
            return res.json({ success: false, message: "Vui lòng đăng nhập lại" })
        }

        if (!appointmentId) {
            return res.json({ success: false, message: "Thiếu mã lịch hẹn" })
        }

        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData) {
            return res.json({ success: false, message: "Không tìm thấy lịch hẹn" })
        }

        // verify appointment user
        if (String(appointmentData.userId) !== String(userId)) {
            return res.json({ success: false, message: "Vui lòng đăng nhập lại" })
        }

        const updateData = { 
            cancelled: true,
            cancellationReasons: cancellationReasons || [],
            cancellationDetails: cancellationDetails || ""
        };

        await appointmentModel.findByIdAndUpdate(appointmentId, updateData, { returnDocument: 'after' })

        //releasing stylist slot
        const { styId, slotDate, slotTime } = appointmentData

        const stylistData = await stylistModel.findById(styId)

        if (stylistData) {
            let slots_booked = stylistData.slots_booked || {}

            if (Array.isArray(slots_booked[slotDate])) {
                slots_booked[slotDate] = slots_booked[slotDate].filter((e) => e !== slotTime)
            }

            await stylistModel.findByIdAndUpdate(styId, { slots_booked })
        }

        res.json({ success: true, message: "Lịch hẹn đã được hủy" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API to create VNPay payment URL
const createPaymentUrl = async (req, res) => {
    try {
        const userId = req.userId;
        const { appointmentId } = req.body;

        if (!appointmentId) {
            return res.json({ success: false, message: "Thiếu mã lịch hẹn" });
        }

        const appointmentData = await appointmentModel.findById(appointmentId);

        if (!appointmentData) {
            return res.json({ success: false, message: "Không tìm thấy lịch hẹn" });
        }

        // Verify appointment belongs to user
        if (String(appointmentData.userId) !== String(userId)) {
            return res.json({ success: false, message: "Vui lòng đăng nhập lại" });
        }

        // If already paid
        if (appointmentData.payment) {
            return res.json({ success: false, message: "Lịch hẹn này đã được thanh toán" });
        }

        const vnpay = new VNPay({
            tmnCode: process.env.VNPAY_TMN_CODE,
            secureSecret: process.env.VNPAY_SECRET_KEY,
            vnpayHost: process.env.VNPAY_HOST,
            testMode: true,
            hashAlgorithm: 'SHA512',
            loggerFn: ignoreLogger
        });

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const vnpayResponse = await vnpay.buildPaymentUrl({
            vnp_Amount: appointmentData.amount,
            vnp_IpAddr: req.ip || '127.0.0.1',
            vnp_TxnRef: appointmentId, // Dùng appointmentId làm transaction reference
            vnp_OrderInfo: `Thanh toán lịch hẹn - ${appointmentData.userData?.name || 'User'}`,
            vnp_OrderType: ProductCode.Other,
            vnp_ReturnUrl: `${process.env.FRONTEND_URL}/my-appointments`,
            vnp_Locale: VnpLocale.VN,
            vnp_CreateDate: dateFormat(new Date()),
            vnp_ExpireDate: dateFormat(tomorrow)
        });

        res.json({ success: true, paymentUrl: vnpayResponse });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// API to verify VNPay payment
const verifyPayment = async (req, res) => {
    try {
        const userId = req.userId;
        const { appointmentId, vnp_TransactionNo, vnp_Amount } = req.body;

        if (!appointmentId) {
            return res.json({ success: false, message: "Thiếu mã lịch hẹn" });
        }

        const appointmentData = await appointmentModel.findById(appointmentId);

        if (!appointmentData) {
            return res.json({ success: false, message: "Không tìm thấy lịch hẹn" });
        }

        // Verify appointment belongs to user
        if (String(appointmentData.userId) !== String(userId)) {
            return res.json({ success: false, message: "Vui lòng đăng nhập lại" });
        }

        // Update appointment payment status
        await appointmentModel.findByIdAndUpdate(appointmentId, { 
            payment: true,
            paymentTransactionId: vnp_TransactionNo 
        });

        res.json({ success: true, message: "Thanh toán thành công" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export {
    registerUser,
    loginUser,
    getProfile,
    updateProfile,
    changePassword,
    bookAppointment,
    listAppointment,
    cancelAppointment,
    createPaymentUrl,
    verifyPayment,
    updatePersonalImages,
}