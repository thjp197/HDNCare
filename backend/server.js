import cors from 'cors'
import dns from 'dns'
import 'dotenv/config'
import express from 'express'
import connectCloudinary from './config/cloudinary.js'
import connectDB from './config/mongodb.js'
import adminRouter from './routes/adminRoute.js'
import chatbotRoute from './routes/chatbotRoute.js'; // <-- CHÍNH LÀ DÒNG BỊ SÓT NÀY ĐÂY
import stylistRouter from './routes/stylistRoute.js'
import userRoute from './routes/userRoute.js'

//Change DNS 
dns.setServers(["1.1.1.1","8.8.8.8"]);  

// app config
const app = express()
const port = process.env.PORT || 4000
connectDB()
connectCloudinary()

// middlewares
app.use(cors())
app.use(express.json())

// api endpoints
app.use('/api/admin', adminRouter)
app.use('/api/stylist', stylistRouter)
app.use('/api/user', userRoute)
app.use('/api/chatbot', chatbotRoute) // DÒNG THÊM MỚI 2

app.get('/', (req, res) => {
  res.send('API works!')
})

app.listen(port, () => console.log(`Server started on port ${port}`))