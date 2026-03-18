import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import userModel from "../models/userModel.js";
import { v2 as cloudinary } from 'cloudinary'
import stylistModel from "../models/stylistModel.js";
import appointmentModel from "../models/appointmentModel.js";
import { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } from 'vnpay';

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

//API to book appointment
const bookAppointment = async (req, res) => {
    try {
        
        const userId = req.userId
        const {styId, slotDate, slotTime} = req.body

        const styData = await stylistModel.findById(styId).select('-password')
        
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

        const userData = await userModel.findById(userId).select('-password')

        delete styData.slots_booked

        const appointmentData = {
            userId,
            styId,
            userData,
            styData,
            amount: styData.fees,
            slotTime,
            slotDate,
            date: Date.now()
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
        const { appointmentId } = req.body

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

        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

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

export { registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment, createPaymentUrl, verifyPayment }