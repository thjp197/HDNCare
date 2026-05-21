import express from "express";
import { registerUser, loginUser, getProfile, updateProfile, changePassword, bookAppointment, listAppointment, cancelAppointment, createPaymentUrl, verifyPayment, createDepositPaymentUrl, verifyDepositPayment, getWalletData, createWalletTopupUrl, verifyWalletTopup, payAppointmentWithWallet, payAppointmentDepositWithWallet, withdrawFromWallet, updatePersonalImages, verifyDiscountCode } from "../controllers/userController.js";
import authUser from "../middlewares/authUser.js";
import upload from "../middlewares/multer.js";

const userRoute = express.Router();

userRoute.post("/register", registerUser)
userRoute.post("/login", loginUser)

userRoute.get("/get-profile", authUser, getProfile)
userRoute.post("/update-profile", upload.single("image"), authUser, updateProfile)
userRoute.post("/change-password", authUser, changePassword)
userRoute.patch("/personal-images", upload.single("image"), authUser, updatePersonalImages)
userRoute.post("/book-appointment", authUser, bookAppointment)
userRoute.get("/appointments", authUser, listAppointment)
userRoute.post("/cancel-appointment", authUser, cancelAppointment)

userRoute.get("/wallet", authUser, getWalletData)
userRoute.post("/wallet/create-topup-url", authUser, createWalletTopupUrl)
userRoute.post("/wallet/verify-topup", authUser, verifyWalletTopup)
userRoute.post("/wallet/pay-appointment", authUser, payAppointmentWithWallet)
userRoute.post("/wallet/pay-appointment-deposit", authUser, payAppointmentDepositWithWallet)
userRoute.post("/wallet/withdraw", authUser, withdrawFromWallet)

// Payment routes
userRoute.post("/create-payment-url", authUser, createPaymentUrl)
userRoute.post("/verify-payment", authUser, verifyPayment)
userRoute.post("/create-deposit-payment-url", authUser, createDepositPaymentUrl)
userRoute.post("/verify-deposit-payment", authUser, verifyDepositPayment)

// Discount code route
userRoute.post("/verify-discount-code", authUser, verifyDiscountCode)

export default userRoute;