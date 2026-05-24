import cors from 'cors'
import dns from 'dns'
import 'dotenv/config'
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import connectCloudinary from './config/cloudinary.js'
import connectDB from './config/mongodb.js'
import adminRouter from './routes/adminRoute.js'
import chatbotRoute from './routes/chatbotRoute.js'; // <-- CHÍNH LÀ DÒNG BỊ SÓT NÀY ĐÂY
import stylistRouter from './routes/stylistRoute.js'
import userRoute from './routes/userRoute.js'
import { getStylistRoom, setSocketServer } from './utils/socket.js'

//Change DNS 
dns.setServers(["1.1.1.1","8.8.8.8"]);  

// app config
const app = express()
const port = process.env.PORT || 4000
const server = createServer(app)
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

const io = new Server(server, {
  cors: corsOptions,
})

setSocketServer(io)

io.on('connection', (socket) => {
  socket.emit('server-time', { serverTime: Date.now() })

  socket.on('join-stylist-slots', (styId) => {
    if (styId) {
      socket.join(getStylistRoom(styId))
    }
  })

  socket.on('leave-stylist-slots', (styId) => {
    if (styId) {
      socket.leave(getStylistRoom(styId))
    }
  })
})

setInterval(() => {
  io.emit('server-time', { serverTime: Date.now() })
}, 15000).unref()

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

server.listen(port, () => console.log(`Server started on port ${port}`))
