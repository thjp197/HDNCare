import stylistModel from "../models/stylistModel.js";


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

export { changeAvailablity, stylistList }