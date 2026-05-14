import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js'

// user authentication middleware
const authUser = async (req, res, next) => {
    const { token } = req.headers
    if (!token) {
        return res.json({ success: false, message: 'Bạn chưa được xác thực. Vui lòng đăng nhập lại.' })
    }
    try {
        const token_decode = jwt.verify(token, process.env.JWT_SECRET)
        const user = await userModel.findById(token_decode.id).select('isBanned')

        if (!user) {
            return res.json({ success: false, message: 'Người dùng không tồn tại. Vui lòng đăng nhập lại.' })
        }

        if (user.isBanned) {
            return res.json({ success: false, message: 'Tài khoản của bạn đã bị khóa do vi phạm chính sách hủy lịch.' })
        }

        req.userId = token_decode.id
        next()
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export default authUser;