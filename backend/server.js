import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import adminRouter from './routes/adminRoute.js'
import dns from 'dns'

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

app.get('/', (req, res) => {
  res.send('API works!')
})

app.listen(port, () => console.log(`Server started on port ${port}`))