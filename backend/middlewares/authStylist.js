import jwt from 'jsonwebtoken'

// stylist authentication middleware
const authStylist = async (req, res, next) => {
    const { stoken } = req.headers
    if (!stoken) {
        return res.json({ success: false, message: 'Bạn chưa được xác thực. Vui lòng đăng nhập lại.' })
    }
    try {
        const token_decode = jwt.verify(stoken, process.env.JWT_SECRET)
        req.styId = token_decode.id
        next()
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export default authStylist;