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

// const corsOptions = {
//   origin: true,
//   credentials: true,
// }

const corsOptions = {
  origin: [
    'https://hdncare.onrender.com',
    'https://hdncare-admin.onrender.com',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174'
  ],
  credentials: true,
}
// middlewares
app.use(cors(corsOptions))
app.use(express.json({ limit: '10mb' }))

// api endpoints
app.use('/api/admin', adminRouter)
app.use('/api/stylist', stylistRouter)
app.use('/api/user', userRoute)
app.use('/api/users', userRoute)
app.use('/api/chatbot', chatbotRoute) // DÒNG THÊM MỚI 2
app.use('/api/gemini', chatbotRoute)

app.get('/', (req, res) => {
  res.send('API works!')
})

app.listen(port, () => console.log(`Server started on port ${port}`))