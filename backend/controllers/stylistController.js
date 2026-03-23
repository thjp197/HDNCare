import stylistModel from "../models/stylistModel.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import appointmentModel from "../models/appointmentModel.js";

// API to change stylist availablity for Admin and Stylist Panel
const changeAvailablity = async (req, res) => {
    try {

        const { stylistId } = req.body

        const stylistData = await stylistModel.findById(stylistId)
        await stylistModel.findByIdAndUpdate(stylistId, { available: !stylistData.available })
        res.json({ success: true, message: 'Availablity Changed' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get all stylists list for Frontend
const stylistList = async (req, res) => {
    try {

        const stylists = await stylistModel.find({}).select(['-password', '-email'])
        res.json({ success: true, stylists })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API for stylist Login 
const loginStylist = async (req, res) => {

    try {

        const { email, password } = req.body
        const user = await stylistModel.findOne({ email })

        if (!user) {
            return res.json({ success: false, message: "Invalid credentials" })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: "Invalid credentials" })
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get stylist appointments for stylist panel
const appointmentsStylist = async (req, res) => {
    try {

        const styId = req.styId
        const appointments = await appointmentModel.find({ styId })

        res.json({ success: true, appointments })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to mark appointment as completed for stylist panel
const appointmentComplete = async (req, res) => {
    try {
        const { appointmentId } = req.body
        const styId = req.styId

        const appointmentData = await appointmentModel.findById(appointmentId)
        if (appointmentData && String(appointmentData.styId) === String(styId)) {
            const updatedAppointment = await appointmentModel.findByIdAndUpdate(
                appointmentId,
                { isCompleted: true },
                { new: true }
            )
            return res.json({ success: true, message: 'Cuộc hẹn đã hoàn thành', appointment: updatedAppointment })
        } else {
            return res.json({ success: false, message: 'Không tìm thấy cuộc hẹn' })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to cancel appointment for stylist panel
const appointmentCancel = async (req, res) => {
    try {
        const { appointmentId } = req.body
        const styId = req.styId

        const appointmentData = await appointmentModel.findById(appointmentId)
        if (appointmentData && String(appointmentData.styId) === String(styId)) {
            const updatedAppointment = await appointmentModel.findByIdAndUpdate(
                appointmentId,
                { cancelled: true },
                { new: true }
            )
            return res.json({ success: true, message: 'Hủy cuộc hẹn thành công', appointment: updatedAppointment })
        } else {
            return res.json({ success: false, message: 'Hủy cuộc hẹn thất bại' })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get dashboard data for stylist panel
const stylistDashboard = async (req, res) => {

    try {
        const styId = req.styId

        const appointments = await appointmentModel.find({ styId })

        const earnings = appointments.reduce((sum, item) => {
            if (item.isCompleted || item.payment) {
                return sum + Number(item.amount || 0)
            }
            return sum
        }, 0)

        let users = []

        appointments.map((item) => {
            if (!users.includes(item.userId)) {
                users.push(item.userId)
            }
        })

        const dashData = {
            earnings,
            appointments: appointments.length,
            users: users.length,
            latestAppointments: appointments.reverse().slice(0, 5)
        }

        res.json({ success: true, dashData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// API to get stylist profile for Stylist panel 
const stylistProfile = async (req, res) => {


    try {

        // const { styId } = req.body 
        const styId = req.styId
        const profileData = await stylistModel.findById(styId).select('-password')

        res.json({ success: true, profileData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

//API to update stylist profile data from Stylist Panel
const updateStylistProfile = async (req, res) => {
    try {

        const styId = req.styId
        const { fees, address, available } = req.body

        await stylistModel.findByIdAndUpdate(styId, { fees, address, available })

        res.json({ success: true, message: 'Hồ sơ đã được cập nhật' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export {
    changeAvailablity,
    stylistList,
    loginStylist,
    appointmentsStylist,
    appointmentCancel,
    appointmentComplete,
    stylistDashboard,
    stylistProfile,
    updateStylistProfile
}