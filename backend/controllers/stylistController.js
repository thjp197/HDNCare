import stylistModel from "../models/stylistModel.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import appointmentModel from "../models/appointmentModel.js";
import { applyUserPenalty } from "../utils/penaltyUtils.js";

// API to change stylist availablity for Admin and Stylist Panel
const changeAvailablity = async (req, res) => {
    try {

        const { stylistId } = req.body

        const stylistData = await stylistModel.findById(stylistId)
        await stylistModel.findByIdAndUpdate(stylistId, { available: !stylistData.available })
        res.json({ success: true, message: 'Tình trạng khả dụng đã được thay đổi' })

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
            return res.json({ success: false, message: "Thông tin đăng nhập không đúng" })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: "Thông tin đăng nhập không đúng" })
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
                { returnDocument: 'after' }
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
        const { appointmentId, penalizeUser = false } = req.body
        const styId = req.styId

        const appointmentData = await appointmentModel.findById(appointmentId)
        if (appointmentData?.cancelled) {
            return res.json({ success: false, message: 'Lịch hẹn này đã được hủy trước đó' })
        }

        if (appointmentData && String(appointmentData.styId) === String(styId)) {
            const updatedAppointment = await appointmentModel.findByIdAndUpdate(
                appointmentId,
                {
                    cancelled: true,
                    cancellationReasons: ['Hủy bởi quản trị viên/chuyên viên'],
                    cancellationDetails: penalizeUser
                        ? 'Đơn đã bị hủy và người dùng bị phạt 1 lần.'
                        : 'Đơn đã bị hủy bởi quản trị viên/chuyên viên.',
                },
                { returnDocument: 'after' }
            )

            const stylistData = await stylistModel.findById(styId)
            if (stylistData) {
                const { slotDate, slotTime } = appointmentData
                let slots_booked = stylistData.slots_booked || {}

                if (Array.isArray(slots_booked[slotDate])) {
                    slots_booked[slotDate] = slots_booked[slotDate].filter((item) => item !== slotTime)
                }

                await stylistModel.findByIdAndUpdate(styId, { slots_booked })
            }

            let penaltyResult = null
            if (penalizeUser) {
                penaltyResult = await applyUserPenalty(appointmentData.userId, {
                    appointmentId,
                    source: 'stylist',
                    reason: 'Lịch hẹn bị hủy bởi quản trị viên hoặc chuyên viên',
                })
            }

            const message = penaltyResult?.applied
                ? penaltyResult.isBanned
                    ? 'Hủy cuộc hẹn thành công. Người dùng đã bị phạt và tài khoản đã bị khóa vì đủ 5 lần vi phạm.'
                    : `Hủy cuộc hẹn thành công. Người dùng đã bị phạt ${penaltyResult.penaltyCount}/5 lần.`
                : 'Hủy cuộc hẹn thành công'

            return res.json({
                success: true,
                message,
                appointment: updatedAppointment,
                penaltyApplied: Boolean(penaltyResult?.applied),
                penaltyCount: penaltyResult?.penaltyCount || null,
                userBanned: Boolean(penaltyResult?.isBanned),
            })
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
            if (item.isCompleted) {
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
        const {address, available } = req.body

        await stylistModel.findByIdAndUpdate(styId, { address, available })

        res.json({ success: true, message: 'Hồ sơ đã được cập nhật' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to change stylist password
const changeStylistPassword = async (req, res) => {
    try {
        const styId = req.styId
        const { currentPassword, newPassword, confirmPassword } = req.body

        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin' })
        }

        if (newPassword !== confirmPassword) {
            return res.json({ success: false, message: 'Xác nhận mật khẩu mới không khớp' })
        }

        if (newPassword.length < 8) {
            return res.json({ success: false, message: 'Mật khẩu mới phải có ít nhất 8 ký tự' })
        }

        if (currentPassword === newPassword) {
            return res.json({ success: false, message: 'Mật khẩu mới phải khác mật khẩu cũ' })
        }

        const stylist = await stylistModel.findById(styId)

        if (!stylist) {
            return res.json({ success: false, message: 'Không tìm thấy stylist' })
        }

        const isMatch = await bcrypt.compare(currentPassword, stylist.password)

        if (!isMatch) {
            return res.json({ success: false, message: 'Mật khẩu hiện tại không đúng' })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(newPassword, salt)

        await stylistModel.findByIdAndUpdate(styId, { password: hashedPassword })

        res.json({ success: true, message: 'Đổi mật khẩu thành công' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get branch manager dashboard
const branchManagerDashboard = async (req, res) => {
    try {
        const styId = req.styId
        const isBranchManager = req.isBranchManager
        const branch = req.branch
        
        console.log('Branch Manager Dashboard Request:', { styId, isBranchManager, branch })
        
        if (!isBranchManager || !branch) {
            return res.json({ success: false, message: 'Bạn không phải là trưởng chi nhánh hoặc chưa được gán chi nhánh' })
        }

        // Get all stylists in this branch
        const branchStylists = await stylistModel.find({ branch }).select('_id')
        const stylistIds = branchStylists.map(s => s._id)

        // Get appointments for stylists in this branch
        const appointments = await appointmentModel.find({ styId: { $in: stylistIds } })

        // Calculate metrics
        const earnings = appointments.reduce((sum, item) => {
            if (item.isCompleted) {
                return sum + Number(item.amount || 0)
            }
            return sum
        }, 0)

        const dashData = {
            branch,
            stylists: branchStylists.length,
            appointments: appointments.length,
            earnings,
            latestAppointments: appointments.reverse().slice(0, 5)
        }

        res.json({ success: true, dashData })

    } catch (error) {
        console.log('Error in branchManagerDashboard:', error)
        res.json({ success: false, message: error.message })
    }
}

// API to get branch appointments
const branchManagerAppointments = async (req, res) => {
    try {
        const isBranchManager = req.isBranchManager
        const branch = req.branch
        
        if (!isBranchManager || !branch) {
            return res.json({ success: false, message: 'Bạn không phải là trưởng chi nhánh hoặc chưa được gán chi nhánh' })
        }

        // Get all stylists in this branch
        const branchStylists = await stylistModel.find({ branch }).select('_id')
        const stylistIds = branchStylists.map(s => s._id)

        // Get appointments for stylists in this branch
        const appointments = await appointmentModel.find({ styId: { $in: stylistIds } })

        res.json({ success: true, appointments })

    } catch (error) {
        console.log('Error in branchManagerAppointments:', error)
        res.json({ success: false, message: error.message })
    }
}

// API to get branch stylists
const branchManagerStylists = async (req, res) => {
    try {
        const isBranchManager = req.isBranchManager
        const branch = req.branch
        
        if (!isBranchManager || !branch) {
            return res.json({ success: false, message: 'Bạn không phải là trưởng chi nhánh hoặc chưa được gán chi nhánh' })
        }

        const stylists = await stylistModel.find({ branch }).select('-password')

        res.json({ success: true, stylists })

    } catch (error) {
        console.log('Error in branchManagerStylists:', error)
        res.json({ success: false, message: error.message })
    }
}

// API to get branch info
const branchManagerInfo = async (req, res) => {
    try {
        const styId = req.styId
        const isBranchManager = req.isBranchManager
        const branch = req.branch
        
        if (!isBranchManager || !branch) {
            return res.json({ success: false, message: 'Bạn không phải là trưởng chi nhánh hoặc chưa được gán chi nhánh' })
        }

        const branchStylists = await stylistModel.find({ branch }).select('-password')
        const manager = branchStylists.find(s => String(s._id) === String(styId))

        const branchInfo = {
            name: branch,
            manager: manager,
            stylistCount: branchStylists.length,
            stylists: branchStylists
        }

        res.json({ success: true, branchInfo })

    } catch (error) {
        console.log('Error in branchManagerInfo:', error)
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
    updateStylistProfile,
    changeStylistPassword,
    branchManagerDashboard,
    branchManagerAppointments,
    branchManagerStylists,
    branchManagerInfo
}