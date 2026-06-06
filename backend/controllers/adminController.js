import validator from "validator";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import jwt from "jsonwebtoken";
import stylistModel from "../models/stylistModel.js";
import appointmentModel from "../models/appointmentModel.js";
import userModel from "../models/userModel.js";
import { applyUserPenalty } from "../utils/penaltyUtils.js";

const MAX_USER_PENALTY_COUNT = 5;

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
        return res.json({ success: false, message: "Thiếu thông tin" })
    }

    // validating email format
    if (!validator.isEmail(email)) {
        return res.json({ success: false, message: "Vui lòng nhập email hợp lệ" })
    }

    // validating strong password
    if (password.length < 8) {
        return res.json({ success: false, message: "Vui lòng nhập mật khẩu mạnh" })
    }

    // checking for duplicate email
    const existingStylist = await stylistModel.findOne({ email })
    if (existingStylist) {
        return res.json({ success: false, message: "Email đã được đăng ký" })
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
    res.json({ success: true, message: 'Nhân viên tạo kiểu đã được thêm' })

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
      res.json({ success: false, message: "Thông tin đăng nhập không đúng" })
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
    const { appointmentId, penalizeUser = false } = req.body

        if (!appointmentId) {
            return res.json({ success: false, message: "Thiếu mã lịch hẹn" })
        }

        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData) {
            return res.json({ success: false, message: "Không tìm thấy lịch hẹn" })
        }

        if (appointmentData.cancelled) {
          return res.json({ success: false, message: "Lịch hẹn này đã được hủy trước đó" })
        }


        const cancellationReasons = ["Hủy bởi quản trị viên/chuyên viên"]
        const cancellationDetails = penalizeUser
          ? "Đơn đã bị hủy và người dùng bị phạt 1 lần."
          : "Đơn đã bị hủy bởi quản trị viên/chuyên viên."

        await appointmentModel.findByIdAndUpdate(appointmentId, {
          cancelled: true,
          cancellationReasons,
          cancellationDetails,
        })

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

          let penaltyResult = null

          if (penalizeUser) {
            penaltyResult = await applyUserPenalty(appointmentData.userId, {
              appointmentId,
              source: "admin",
              reason: "Lịch hẹn bị hủy bởi quản trị viên hoặc chuyên viên",
            })
          }

          const message = penaltyResult?.applied
            ? penaltyResult.isBanned
              ? "Lịch hẹn đã được hủy. Người dùng đã bị phạt và tài khoản đã bị khóa vì đủ 5 lần vi phạm."
              : `Lịch hẹn đã được hủy và người dùng đã bị phạt ${penaltyResult.penaltyCount}/5 lần.`
            : "Lịch hẹn đã được hủy"

          res.json({
            success: true,
            message,
            penaltyApplied: Boolean(penaltyResult?.applied),
            penaltyCount: penaltyResult?.penaltyCount || null,
            userBanned: Boolean(penaltyResult?.isBanned),
          })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

      const penalizedUsers = async (req, res) => {
        try {
          const users = await userModel
            .find({ penaltyCount: { $gt: 0 } })
            .select("name email phone penaltyCount isBanned lastPenaltyAt")
            .sort({ penaltyCount: -1, lastPenaltyAt: -1 })

          res.json({ success: true, users })
        } catch (error) {
          console.log(error)
          res.json({ success: false, message: error.message })
        }
      }

const resetUserPenalty = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.json({ success: false, message: "Thiếu mã người dùng" });
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "Không tìm thấy người dùng" });
    }

    await userModel.findByIdAndUpdate(userId, {
      penaltyCount: 0,
      isBanned: false,
      lastPenaltyAt: null,
      penaltyLogs: [],
    });

    res.json({ success: true, message: "Đã tạo lại tài khoản và đặt số lần phạt về 0" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const updateUserPenalty = async (req, res) => {
  try {
    const { userId, penaltyCount } = req.body;
    if (penaltyCount === undefined || penaltyCount === null || penaltyCount === "") {
      return res.json({ success: false, message: "Số lần phạt không được để trống" });
    }

    const isNumericString =
      typeof penaltyCount === "string" && /^\d+$/.test(penaltyCount.trim());
    const isNumericInteger =
      typeof penaltyCount === "number" && Number.isInteger(penaltyCount);

    if (!isNumericString && !isNumericInteger) {
      return res.json({ success: false, message: "Số lần phạt chỉ được nhập bằng số" });
    }

    const normalizedPenaltyCount = Number(
      typeof penaltyCount === "string" ? penaltyCount.trim() : penaltyCount,
    );

    if (!userId) {
      return res.json({ success: false, message: "Thiếu mã người dùng" });
    }

    if (!Number.isInteger(normalizedPenaltyCount) || normalizedPenaltyCount < 0 || normalizedPenaltyCount > MAX_USER_PENALTY_COUNT) {
      return res.json({ success: false, message: `Số lần phạt chỉ được phép từ 0 đến ${MAX_USER_PENALTY_COUNT}` });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "Không tìm thấy người dùng" });
    }

    const isBanned = normalizedPenaltyCount >= MAX_USER_PENALTY_COUNT;

    if (normalizedPenaltyCount === 0) {
      await userModel.findByIdAndUpdate(userId, {
        penaltyCount: 0,
        isBanned: false,
        lastPenaltyAt: null,
        penaltyLogs: [],
      });
    } else {
      await userModel.findByIdAndUpdate(userId, {
        penaltyCount: normalizedPenaltyCount,
        isBanned,
        lastPenaltyAt: new Date(),
        $push: {
          penaltyLogs: {
            source: "admin",
            reason: `Admin cập nhật số lần phạt thành ${normalizedPenaltyCount}`,
            createdAt: new Date(),
            penaltyCountAfter: normalizedPenaltyCount,
          },
        },
      });
    }

    res.json({
      success: true,
      message: "Cập nhật số lần phạt thành công",
      penaltyCount: normalizedPenaltyCount,
      isBanned,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get dashboard data for admin panel
const adminDashboard = async (req, res) => {
    try {

        const stylists = await stylistModel.find({})
        const users = await userModel.find({})
        const appointments = await appointmentModel.find({})

        const earnings = appointments.reduce((sum, item) => {
            if (item.isCompleted) {
                return sum + Number(item.amount || 0)
            }
            return sum
        }, 0)

        const dashData = {
            stylists: stylists.length,
            appointments: appointments.length,
            users: users.length,
            earnings,
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

// API to get stylists by branch
const getStylistsByBranch = async (req, res) => {
  try {
    const { branch } = req.body

    if (!branch) {
      return res.json({ success: false, message: "Vui lòng chọn chi nhánh" })
    }

    const stylists = await stylistModel.find({ branch }).select('-password')
    res.json({ success: true, stylists })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// API to get all branches info
const getBranchesInfo = async (req, res) => {
  try {
    const branches = ['Chi nhánh 1', 'Chi nhánh 2', 'Chi nhánh 3']
    const branchesData = []

    for (const branch of branches) {
      const stylists = await stylistModel.find({ branch }).select('-password')
      const manager = stylists.find(s => s.isBranchManager)
      
      // Calculate revenue for this branch
      const stylistIds = stylists.map(s => s._id.toString())
      console.log(`Branch: ${branch}, Stylists: ${stylists.length}, IDs:`, stylistIds)
      
      const branchAppointments = await appointmentModel.find({ styId: { $in: stylistIds } })
      console.log(`Appointments found: ${branchAppointments.length}`)
      
      const branchRevenue = branchAppointments.reduce((sum, item) => {
        if (item.isCompleted) {
          console.log(`Appointment completed: ${item._id}, Amount: ${item.amount}`)
          return sum + Number(item.amount || 0)
        }
        return sum
      }, 0)

      branchesData.push({
        name: branch,
        stylistCount: stylists.length,
        stylists,
        manager: manager || null,
        revenue: branchRevenue
      })
    }

    res.json({ success: true, branchesData })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// API to assign branch to stylist
const assignBranch = async (req, res) => {
  try {
    const { stylistId, branch } = req.body

    if (!stylistId || !branch) {
      return res.json({ success: false, message: "Thiếu thông tin" })
    }

    const validBranches = ['Chi nhánh 1', 'Chi nhánh 2', 'Chi nhánh 3']
    if (!validBranches.includes(branch)) {
      return res.json({ success: false, message: "Chi nhánh không hợp lệ" })
    }

    await stylistModel.findByIdAndUpdate(stylistId, { branch })
    res.json({ success: true, message: `Đã gán stylist vào ${branch}` })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// API to assign branch manager
const assignBranchManager = async (req, res) => {
  try {
    const { stylistId, branch } = req.body

    if (!stylistId || !branch) {
      return res.json({ success: false, message: "Thiếu thông tin" })
    }

    const validBranches = ['Chi nhánh 1', 'Chi nhánh 2', 'Chi nhánh 3']
    if (!validBranches.includes(branch)) {
      return res.json({ success: false, message: "Chi nhánh không hợp lệ" })
    }

    // Remove isBranchManager from current manager of this branch (if exists)
    await stylistModel.updateMany({ branch, isBranchManager: true }, { isBranchManager: false })

    // Set the new manager
    await stylistModel.findByIdAndUpdate(stylistId, { isBranchManager: true, branch })

    res.json({ success: true, message: `Đã gán stylist làm quản lý của ${branch}` })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// API to remove branch manager status
const removeBranchManager = async (req, res) => {
  try {
    const { stylistId } = req.body

    if (!stylistId) {
      return res.json({ success: false, message: "Thiếu ID stylist" })
    }

    await stylistModel.findByIdAndUpdate(stylistId, { isBranchManager: false })
    res.json({ success: true, message: "Đã xóa quyền quản lý chi nhánh" })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// API to delete stylist
const deleteStylist = async (req, res) => {
  try {
    const { stylistId } = req.body

    if (!stylistId) {
      return res.json({ success: false, message: "Thiếu ID nhân viên" })
    }

    // Delete all appointments related to this stylist
    await appointmentModel.deleteMany({ stylistId })

    // Delete the stylist
    await stylistModel.findByIdAndDelete(stylistId)
    res.json({ success: true, message: "Xóa nhân viên thành công" })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

export {
  addStylist,
  loginAdmin,
  allStylists,
  appointmentsAdmin,
  appointmentCancel,
  adminDashboard,
  updateStylist,
  penalizedUsers,
  resetUserPenalty,
  updateUserPenalty,
  getStylistsByBranch,
  getBranchesInfo,
  assignBranch,
  assignBranchManager,
  removeBranchManager,
  deleteStylist,
};
