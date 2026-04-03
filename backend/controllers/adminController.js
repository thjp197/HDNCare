import validator from "validator";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import jwt from "jsonwebtoken";
import stylistModel from "../models/stylistModel.js";
import appointmentModel from "../models/appointmentModel.js";
import userModel from "../models/userModel.js";

//API for adding stylist
const addStylist = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
    } = req.body;
    const imageFile = req.file;

    // checking for all data to add stylist
    if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {
        return res.json({ success: false, message: "Missing Details" })
    }

    // validating email format
    if (!validator.isEmail(email)) {
        return res.json({ success: false, message: "Please enter a valid email" })
    }

    // validating strong password
    if (password.length < 8) {
        return res.json({ success: false, message: "Please enter a strong password" })
    }

    // checking for duplicate email
    const existingStylist = await stylistModel.findOne({ email })
    if (existingStylist) {
        return res.json({ success: false, message: "Email already registered" })
    }

    // hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt)

    // upload image to cloudinary
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
    const imageUrl = imageUpload.secure_url

    const stylistData = {
        name,
        email,
        image: imageUrl,
        password: hashedPassword,
        speciality,
        degree,
        experience,
        about,
        fees,
        address: JSON.parse(address),
        date: Date.now()
    }

    const newStylist = new stylistModel(stylistData)
    await newStylist.save()
    res.json({ success: true, message: 'Stylist Added' })

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message })
  }
};

// API for admin Login
const loginAdmin = async (req, res) => {

  try {

    const { email, password } = req.body

    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {

      const token = jwt.sign(email + password, process.env.JWT_SECRET)
      res.json({ success: true, token })

    } else {
      res.json({ success: false, message: "Invalid credentials" })
    }

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }

}

// API to get all stylists list for admin panel
const allStylists = async (req, res) => {
  try {

    const stylists = await stylistModel.find({}).select('-password')
    res.json({ success: true, stylists })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const appointmentsAdmin = async (req, res) => {
    try {
        const appointments = await appointmentModel.find({})
        res.json({ success: true, appointments })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const appointmentCancel = async (req, res) => {

    try {
        const { appointmentId } = req.body

        if (!appointmentId) {
            return res.json({ success: false, message: "Thiếu mã lịch hẹn" })
        }

        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData) {
            return res.json({ success: false, message: "Không tìm thấy lịch hẹn" })
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

// API to get dashboard data for admin panel
const adminDashboard = async (req, res) => {
    try {

        const stylists = await stylistModel.find({})
        const users = await userModel.find({})
        const appointments = await appointmentModel.find({})

        const dashData = {
            stylists: stylists.length,
            appointments: appointments.length,
            users: users.length,
            latestAppointments: appointments.reverse()
        }

        res.json({ success: true, dashData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to update stylist info for admin panel
const updateStylist = async (req, res) => {
  try {
    const { stylistId, name, speciality, degree, experience, about, fees, address, available } = req.body
    const imageFile = req.file

    if (!stylistId) {
      return res.json({ success: false, message: "Thiếu ID nhân viên" })
    }

    const updateData = { name, speciality, degree, experience, about, fees, address: JSON.parse(address), available }

    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
      updateData.image = imageUpload.secure_url
    }

    await stylistModel.findByIdAndUpdate(stylistId, updateData)
    res.json({ success: true, message: "Cập nhật thông tin thành công" })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

export { addStylist, loginAdmin, allStylists, appointmentsAdmin, appointmentCancel, adminDashboard, updateStylist };
