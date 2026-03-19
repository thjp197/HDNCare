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

export { changeAvailablity, stylistList, loginStylist, appointmentsStylist }