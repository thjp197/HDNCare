import jwt from 'jsonwebtoken'
import stylistModel from '../models/stylistModel.js'

// stylist authentication middleware
const authStylist = async (req, res, next) => {
    const { stoken } = req.headers
    if (!stoken) {
        return res.json({ success: false, message: 'Bạn chưa được xác thực. Vui lòng đăng nhập lại.' })
    }
    try {
        const token_decode = jwt.verify(stoken, process.env.JWT_SECRET)
        req.styId = token_decode.id
        
        // Fetch full stylist document to get isBranchManager and branch info
        try {
            const stylist = await stylistModel.findById(req.styId)
            if (stylist) {
                req.isBranchManager = stylist.isBranchManager || false
                req.branch = stylist.branch || null
            }
        } catch (dbError) {
            console.log('Error fetching stylist from DB:', dbError)
            req.isBranchManager = false
            req.branch = null
        }
        
        next()
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export default authStylist;