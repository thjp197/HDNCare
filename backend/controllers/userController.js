import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import userModel from "../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";
import stylistModel from "../models/stylistModel.js";
import appointmentModel from "../models/appointmentModel.js";
import { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } from "vnpay";
import { applyUserPenalty, isWithinHoursToAppointment } from "../utils/penaltyUtils.js";

const PERSONAL_LIBRARY_FOLDER = "hdn_care/personal_library";

const getCloudinaryPublicIdFromUrl = (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== "string") return null;
  const marker = "/upload/";
  const markerIndex = imageUrl.indexOf(marker);

  if (markerIndex === -1) return null;

  let publicIdWithExt = imageUrl.slice(markerIndex + marker.length);
  publicIdWithExt = publicIdWithExt.split("?")[0];

  // Strip optional version segment: v1234567890/
  publicIdWithExt = publicIdWithExt.replace(/^v\d+\//, "");

  const lastDotIndex = publicIdWithExt.lastIndexOf(".");
  if (lastDotIndex === -1) return publicIdWithExt;

  return publicIdWithExt.slice(0, lastDotIndex);
};

const calculateDepositAmount = (amount) => {
  const numericAmount = Number(amount || 0);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) return 0;
  return Math.round(numericAmount * 0.2);
};

// API to register user
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // checking for all data to register user
    if (!name || !email || !password) {
      return res.json({ success: false, message: "Missing Details" });
    }

    // validating email format
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }

    // validating strong password
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Please enter a strong password",
      });
    }

    // hashing user password
    const salt = await bcrypt.genSalt(10); // the more no. round the more time it will take
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      name,
      email,
      password: hashedPassword,
    };

    const newUser = new userModel(userData);
    const user = await newUser.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "Người dùng không tồn tại" });
    }

    if (user.isBanned) {
      return res.json({
        success: false,
        message: "Tài khoản của bạn đã bị khóa do vi phạm chính sách hủy lịch nhiều lần.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Thông tin đăng nhập không đúng" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get user profile data
const getProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const userData = await userModel.findById(userId).select("-password");

    res.json({ success: true, userData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to update user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, phone, address, dob, gender } = req.body;
    const imageFile = req.file;

    if (!name || !phone || !dob || !gender) {
      return res.json({ success: false, message: "Data Missing" });
    }

    await userModel.findByIdAndUpdate(userId, {
      name,
      phone,
      address: JSON.parse(address),
      dob,
      gender,
    });

    if (imageFile) {
      // upload image to cloudinary
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      });
      const imageURL = imageUpload.secure_url;

      await userModel.findByIdAndUpdate(userId, { image: imageURL });
    }

    res.json({ success: true, message: "Profile Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to change user password
const changePassword = async (req, res) => {
  try {
    const userId = req.userId;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.json({
        success: false,
        message: "Vui lòng nhập đầy đủ thông tin",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.json({
        success: false,
        message: "Xác nhận mật khẩu mới không khớp",
      });
    }

    if (newPassword.length < 8) {
      return res.json({
        success: false,
        message: "Mật khẩu mới phải có ít nhất 8 ký tự",
      });
    }

    if (currentPassword === newPassword) {
      return res.json({
        success: false,
        message: "Mật khẩu mới phải khác mật khẩu cũ",
      });
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "Không tìm thấy người dùng" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.json({
        success: false,
        message: "Mật khẩu hiện tại không đúng",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await userModel.findByIdAndUpdate(userId, { password: hashedPassword });

    res.json({ success: true, message: "Đổi mật khẩu thành công" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//API to book appointment
const bookAppointment = async (req, res) => {
  try {
    const userId = req.userId;
    const { styId, slotDate, slotTime, selectedStyleImage = null } = req.body;

    const styData = await stylistModel.findById(styId).select("-password");
    const userData = await userModel.findById(userId).select("-password");

    if (!userData) {
      return res.json({ success: false, message: "User not found" });
    }

    if (
      selectedStyleImage &&
      !(userData.personalImages || []).includes(selectedStyleImage)
    ) {
      return res.json({ success: false, message: "Selected image is invalid" });
    }

    if (!styData.available) {
      return res.json({
        success: false,
        message: "Stylist not available at the selected time",
      });
    }

    let slots_booked = styData.slots_booked;

    //checking for slot availability
    if (slots_booked[slotDate]) {
      if (slots_booked[slotDate].includes(slotTime)) {
        return res.json({ success: false, message: "Slot not available" });
      } else {
        slots_booked[slotDate].push(slotTime);
      }
    } else {
      slots_booked[slotDate] = [];
      slots_booked[slotDate].push(slotTime);
    }

    delete styData.slots_booked;

    const appointmentData = {
      userId,
      styId,
      userData,
      styData,
      amount: styData.fees,
      slotTime,
      slotDate,
      date: Date.now(),
      selectedStyleImage: selectedStyleImage || null,
    };

    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();

    //save new slots data in styData
    await stylistModel.findByIdAndUpdate(styId, { slots_booked });

    res.json({ success: true, message: "Appointment Booked" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to add or remove personal makeup library images
const updatePersonalImages = async (req, res) => {
  try {
    const userId = req.userId;
    const { action, imageData, imageUrl } = req.body;
    const imageFile = req.file;

    if (!["add", "remove"].includes(action)) {
      return res.json({ success: false, message: "Invalid action" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (action === "add") {
      if (!imageFile && (!imageData || typeof imageData !== "string")) {
        return res.json({ success: false, message: "Missing image data" });
      }

      const uploaded = imageFile
        ? await cloudinary.uploader.upload(imageFile.path, {
            folder: PERSONAL_LIBRARY_FOLDER,
            resource_type: "image",
          })
        : await cloudinary.uploader.upload(imageData, {
            folder: PERSONAL_LIBRARY_FOLDER,
            resource_type: "image",
          });

      const secureUrl = uploaded.secure_url;
      user.personalImages = [
        ...new Set([...(user.personalImages || []), secureUrl]),
      ];
      await user.save();

      return res.json({
        success: true,
        message: "Saved image to personal library",
        personalImages: user.personalImages,
        imageUrl: secureUrl,
      });
    }

    // action === "remove"
    if (!imageUrl || typeof imageUrl !== "string") {
      return res.json({ success: false, message: "Missing image URL" });
    }

    user.personalImages = (user.personalImages || []).filter(
      (url) => url !== imageUrl,
    );
    await user.save();

    const publicId = getCloudinaryPublicIdFromUrl(imageUrl);
    if (publicId) {
      await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
    }

    return res.json({
      success: true,
      message: "Removed image from personal library",
      personalImages: user.personalImages,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//API to get user appointments for FE my-appointments page
const listAppointment = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.json({
        success: false,
        message: "Bạn chưa được xác thực. Vui lòng đăng nhập lại.",
      });
    }

    const appointments = await appointmentModel
      .find({ userId })
      .sort({ date: -1 });

    res.json({ success: true, appointments });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// mywallet
const getWalletData = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.json({
        success: false,
        message: "Bạn chưa được xác thực. Vui lòng đăng nhập lại.",
      });
    }

    const user = await userModel.findById(userId).select("-password");

    if (!user) {
      return res.json({ success: false, message: "Không tìm thấy người dùng" });
    }

    const walletTransactions = Array.isArray(user.walletTransactions)
      ? [...user.walletTransactions].sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
        )
      : [];

    res.json({
      success: true,
      walletBalance: user.walletBalance || 0,
      walletTransactions,
      userData: user,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const createWalletTopupUrl = async (req, res) => {
  let walletRef = null;
  try {
    const userId = req.userId;
    const amount = Number(req.body.amount);

    if (!userId) {
      return res.json({
        success: false,
        message: "Bạn chưa được xác thực. Vui lòng đăng nhập lại.",
      });
    }

    if (!Number.isFinite(amount) || amount < 10000) {
      return res.json({ success: false, message: "Số tiền nạp không hợp lệ" });
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "Không tìm thấy người dùng" });
    }

    walletRef = `wallet_${userId}_${Date.now()}`;
    const nextTransactions = [
      ...(user.walletTransactions || []),
      {
        reference: walletRef,
        type: "topup",
        amount,
        status: "pending",
        description: `Nạp tiền ví ${amount.toLocaleString("vi-VN")} VND`,
        createdAt: new Date(),
      },
    ];

    await userModel.findByIdAndUpdate(userId, {
      walletTransactions: nextTransactions,
    });

    const vnpay = new VNPay({
      tmnCode: process.env.VNPAY_TMN_CODE,
      secureSecret: process.env.VNPAY_SECRET_KEY,
      vnpayHost: process.env.VNPAY_HOST,
      testMode: true,
      hashAlgorithm: "SHA512",
      loggerFn: ignoreLogger,
    });

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const vnpayResponse = await vnpay.buildPaymentUrl({
      vnp_Amount: amount,
      vnp_IpAddr: req.ip || "127.0.0.1",
      vnp_TxnRef: walletRef,
      vnp_OrderInfo: `Nạp tiền ví - ${user.name || "User"}`,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl:
        process.env.VNPAY_RETURN_URL || `${process.env.FRONTEND_URL}/my-wallet`,
      vnp_Locale: VnpLocale.VN,
      vnp_CreateDate: dateFormat(new Date()),
      vnp_ExpireDate: dateFormat(tomorrow),
    });

    res.json({ success: true, paymentUrl: vnpayResponse, walletRef });
  } catch (error) {
    console.log(error);
    if (walletRef && req?.userId) {
      await userModel.findByIdAndUpdate(req.userId, {
        $pull: { walletTransactions: { reference: walletRef } },
      });
    }
    res.json({ success: false, message: error.message });
  }
};

const verifyWalletTopup = async (req, res) => {
  try {
    const userId = req.userId;
    const { walletRef, vnp_TransactionNo } = req.body;

    if (!userId) {
      return res.json({
        success: false,
        message: "Bạn chưa được xác thực. Vui lòng đăng nhập lại.",
      });
    }

    if (!walletRef) {
      return res.json({ success: false, message: "Thiếu mã giao dịch ví" });
    }

    const user = await userModel.findOne({
      _id: userId,
      "walletTransactions.reference": walletRef,
    });

    if (!user) {
      return res.json({
        success: false,
        message: "Không tìm thấy giao dịch ví",
      });
    }

    const transactionIndex = (user.walletTransactions || []).findIndex(
      (item) => item.reference === walletRef,
    );

    if (transactionIndex === -1) {
      return res.json({
        success: false,
        message: "Không tìm thấy giao dịch ví",
      });
    }

    const transaction = user.walletTransactions[transactionIndex];

    if (transaction.status === "success") {
      return res.json({
        success: true,
        message: "Ví đã được cập nhật trước đó",
      });
    }

    const updatedTransactions = [...user.walletTransactions];
    updatedTransactions[transactionIndex] = {
      ...transaction,
      status: "success",
      vnp_TransactionNo: vnp_TransactionNo || null,
      verifiedAt: new Date(),
    };

    await userModel.findByIdAndUpdate(userId, {
      walletBalance:
        (user.walletBalance || 0) + Number(transaction.amount || 0),
      walletTransactions: updatedTransactions,
    });

    res.json({ success: true, message: "Nạp ví thành công" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const payAppointmentWithWallet = async (req, res) => {
  try {
    const userId = req.userId;
    const { appointmentId } = req.body;

    if (!userId) {
      return res.json({
        success: false,
        message: "Bạn chưa được xác thực. Vui lòng đăng nhập lại.",
      });
    }

    if (!appointmentId) {
      return res.json({ success: false, message: "Thiếu mã lịch hẹn" });
    }

    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData) {
      return res.json({ success: false, message: "Không tìm thấy lịch hẹn" });
    }

    if (String(appointmentData.userId) !== String(userId)) {
      return res.json({ success: false, message: "Vui lòng đăng nhập lại" });
    }

    if (appointmentData.cancelled) {
      return res.json({ success: false, message: "Lịch hẹn đã bị hủy" });
    }

    if (appointmentData.payment) {
      return res.json({
        success: true,
        message: "Lịch hẹn này đã được thanh toán",
      });
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "Không tìm thấy người dùng" });
    }

    const appointmentAmount = Number(appointmentData.amount || 0);
    const paidDeposit = Number(appointmentData.depositPaid ? appointmentData.depositAmount || 0 : 0);
    const payableAmount = Math.max(appointmentAmount - paidDeposit, 0);
    const walletBalance = Number(user.walletBalance || 0);

    if (payableAmount <= 0) {
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        payment: true,
        paymentMethod: appointmentData.depositMethod || "wallet",
      });

      return res.json({
        success: true,
        message: "Lịch hẹn đã được thanh toán đầy đủ",
      });
    }

    if (walletBalance < payableAmount) {
      return res.json({
        success: false,
        message: "Số dư ví không đủ để thanh toán",
      });
    }

    const previousBalance = walletBalance;
    let walletReference = `wallet_pay_${appointmentId}_${Date.now()}`;
    const nextTransactions = [
      ...(user.walletTransactions || []),
      {
        reference: walletReference,
        type: "appointment_payment",
        amount: -payableAmount,
        status: "success",
        description: `Thanh toán lịch hẹn ${appointmentId}${paidDeposit > 0 ? " (phần còn lại)" : ""}`,
        createdAt: new Date(),
      },
    ];

    await userModel.findByIdAndUpdate(userId, {
      walletBalance: walletBalance - payableAmount,
      walletTransactions: nextTransactions,
    });

    try {
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        payment: true,
        paymentTransactionId: walletReference,
        paymentMethod: "wallet",
      });
    } catch (appointmentError) {
      await userModel.findByIdAndUpdate(userId, {
        walletBalance: previousBalance,
        $pull: { walletTransactions: { reference: walletReference } },
      });
      throw appointmentError;
    }

    res.json({ success: true, message: "Thanh toán bằng ví thành công" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const payAppointmentDepositWithWallet = async (req, res) => {
  try {
    const userId = req.userId;
    const { appointmentId } = req.body;

    if (!userId) {
      return res.json({
        success: false,
        message: "Bạn chưa được xác thực. Vui lòng đăng nhập lại.",
      });
    }

    if (!appointmentId) {
      return res.json({ success: false, message: "Thiếu mã lịch hẹn" });
    }

    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData) {
      return res.json({ success: false, message: "Không tìm thấy lịch hẹn" });
    }

    if (String(appointmentData.userId) !== String(userId)) {
      return res.json({ success: false, message: "Vui lòng đăng nhập lại" });
    }

    if (appointmentData.cancelled) {
      return res.json({ success: false, message: "Lịch hẹn đã bị hủy" });
    }

    if (appointmentData.payment) {
      return res.json({ success: false, message: "Lịch hẹn đã thanh toán đầy đủ" });
    }

    if (appointmentData.depositPaid) {
      return res.json({ success: true, message: "Lịch hẹn đã được thanh toán cọc" });
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "Không tìm thấy người dùng" });
    }

    const depositAmount = calculateDepositAmount(appointmentData.amount);

    if (depositAmount <= 0) {
      return res.json({ success: false, message: "Số tiền cọc không hợp lệ" });
    }

    const walletBalance = Number(user.walletBalance || 0);
    if (walletBalance < depositAmount) {
      return res.json({ success: false, message: "Số dư ví không đủ để thanh toán cọc" });
    }

    const previousBalance = walletBalance;
    const walletReference = `wallet_deposit_${appointmentId}_${Date.now()}`;
    const nextTransactions = [
      ...(user.walletTransactions || []),
      {
        reference: walletReference,
        type: "appointment_deposit",
        amount: -depositAmount,
        status: "success",
        description: `Thanh toán cọc lịch hẹn ${appointmentId}`,
        createdAt: new Date(),
      },
    ];

    await userModel.findByIdAndUpdate(userId, {
      walletBalance: walletBalance - depositAmount,
      walletTransactions: nextTransactions,
    });

    try {
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        depositPaid: true,
        depositAmount,
        depositTransactionId: walletReference,
        depositMethod: "wallet",
      });
    } catch (appointmentError) {
      await userModel.findByIdAndUpdate(userId, {
        walletBalance: previousBalance,
        $pull: { walletTransactions: { reference: walletReference } },
      });
      throw appointmentError;
    }

    res.json({ success: true, message: "Thanh toán cọc bằng ví thành công" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// withdraw from wallet
const withdrawFromWallet = async (req, res) => {
  try {
    const userId = req.userId;
    const { amount, cardHolderName, cardNumber, bankName } = req.body;

    if (!userId) {
      return res.json({
        success: false,
        message: "Bạn chưa được xác thực. Vui lòng đăng nhập lại.",
      });
    }

    const withdrawAmount = Number(amount);
    if (!Number.isFinite(withdrawAmount) || withdrawAmount < 10000) {
      return res.json({
        success: false,
        message: "Số tiền rút tối thiểu là 10.000 VND",
      });
    }

    if (!cardHolderName || !cardNumber || !bankName) {
      return res.json({
        success: false,
        message: "Vui lòng nhập đầy đủ thông tin thẻ",
      });
    }

    const normalizedCardNumber = String(cardNumber).replace(/\s+/g, "");
    if (!/^\d{12,19}$/.test(normalizedCardNumber)) {
      return res.json({ success: false, message: "Số thẻ không hợp lệ" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "Không tìm thấy người dùng" });
    }

    const currentBalance = Number(user.walletBalance || 0);
    if (currentBalance < withdrawAmount) {
      return res.json({
        success: false,
        message: "Số dư ví không đủ để rút tiền",
      });
    }

    const cardLast4 = normalizedCardNumber.slice(-4);
    const withdrawReference = `wallet_withdraw_${userId}_${Date.now()}`;
    const nextTransactions = [
      ...(user.walletTransactions || []),
      {
        reference: withdrawReference,
        type: "withdrawal",
        amount: -withdrawAmount,
        status: "success",
        description: `Rút tiền về thẻ ****${cardLast4} (${bankName})`,
        cardHolderName,
        cardLast4,
        bankName,
        createdAt: new Date(),
      },
    ];

    await userModel.findByIdAndUpdate(userId, {
      walletBalance: currentBalance - withdrawAmount,
      walletTransactions: nextTransactions,
    });

    res.json({
      success: true,
      message: "Rút tiền thành công",
      walletBalance: currentBalance - withdrawAmount,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//API to cancel appointment
const cancelAppointment = async (req, res) => {
  try {
    const userId = req.userId;
    const { appointmentId, cancellationReasons, cancellationDetails } =
      req.body;

    if (!userId) {
      return res.json({ success: false, message: "Vui lòng đăng nhập lại" });
    }

    if (!appointmentId) {
      return res.json({ success: false, message: "Thiếu mã lịch hẹn" });
    }

    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData) {
      return res.json({ success: false, message: "Không tìm thấy lịch hẹn" });
    }

    if (appointmentData.cancelled) {
      return res.json({ success: false, message: "Lịch hẹn này đã được hủy trước đó" });
    }

    // verify appointment user
    if (String(appointmentData.userId) !== String(userId)) {
      return res.json({ success: false, message: "Vui lòng đăng nhập lại" });
    }

    const updateData = {
      cancelled: true,
      cancellationReasons: cancellationReasons || [],
      cancellationDetails: cancellationDetails || "",
    };

    await appointmentModel.findByIdAndUpdate(appointmentId, updateData, {
      returnDocument: "after",
    });

    //releasing stylist slot
    const { styId, slotDate, slotTime } = appointmentData;

    const stylistData = await stylistModel.findById(styId);

    if (stylistData) {
      let slots_booked = stylistData.slots_booked || {};

      if (Array.isArray(slots_booked[slotDate])) {
        slots_booked[slotDate] = slots_booked[slotDate].filter(
          (e) => e !== slotTime,
        );
      }

      await stylistModel.findByIdAndUpdate(styId, { slots_booked });
    }

    const shouldPenalize = isWithinHoursToAppointment(appointmentData, 2);
    let penaltyResult = null;

    if (shouldPenalize) {
      penaltyResult = await applyUserPenalty(userId, {
        appointmentId,
        source: "user",
        reason: "Người dùng hủy lịch sát giờ hẹn (trong vòng 2 tiếng)",
      });
    }

    const message = penaltyResult?.applied
      ? penaltyResult.isBanned
        ? "Lịch hẹn đã được hủy. Bạn bị phạt 1 lần và tài khoản đã bị khóa vì đủ 5 lần vi phạm."
        : `Lịch hẹn đã được hủy. Bạn bị phạt 1 lần (${penaltyResult.penaltyCount}/5).`
      : "Lịch hẹn đã được hủy";

    res.json({
      success: true,
      message,
      penaltyApplied: Boolean(penaltyResult?.applied),
      penaltyCount: penaltyResult?.penaltyCount || null,
      userBanned: Boolean(penaltyResult?.isBanned),
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to create VNPay payment URL
const createPaymentUrl = async (req, res) => {
  try {
    const userId = req.userId;
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.json({ success: false, message: "Thiếu mã lịch hẹn" });
    }

    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData) {
      return res.json({ success: false, message: "Không tìm thấy lịch hẹn" });
    }

    // Verify appointment belongs to user
    if (String(appointmentData.userId) !== String(userId)) {
      return res.json({ success: false, message: "Vui lòng đăng nhập lại" });
    }

    // If already paid
    if (appointmentData.payment) {
      return res.json({
        success: false,
        message: "Lịch hẹn này đã được thanh toán",
      });
    }

    const depositAmount = Number(appointmentData.depositPaid ? appointmentData.depositAmount || 0 : 0);
    const payableAmount = Math.max(Number(appointmentData.amount || 0) - depositAmount, 0);

    if (payableAmount <= 0) {
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        payment: true,
        paymentMethod: appointmentData.depositMethod || "vnpay",
      });

      return res.json({ success: true, alreadyPaid: true, message: "Lịch hẹn đã được thanh toán đầy đủ" });
    }

    const vnpay = new VNPay({
      tmnCode: process.env.VNPAY_TMN_CODE,
      secureSecret: process.env.VNPAY_SECRET_KEY,
      vnpayHost: process.env.VNPAY_HOST,
      testMode: true,
      hashAlgorithm: "SHA512",
      loggerFn: ignoreLogger,
    });

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const vnpayResponse = await vnpay.buildPaymentUrl({
      vnp_Amount: payableAmount,
      vnp_IpAddr: req.ip || "127.0.0.1",
      vnp_TxnRef: appointmentId, // Dùng appointmentId làm transaction reference
      vnp_OrderInfo: `Thanh toán lịch hẹn - ${appointmentData.userData?.name || "User"}`,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl:
        process.env.VNPAY_APPOINTMENT_RETURN_URL ||
        `${process.env.FRONTEND_URL}/my-appointments`,
      vnp_Locale: VnpLocale.VN,
      vnp_CreateDate: dateFormat(new Date()),
      vnp_ExpireDate: dateFormat(tomorrow),
    });

    res.json({ success: true, paymentUrl: vnpayResponse });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const createDepositPaymentUrl = async (req, res) => {
  try {
    const userId = req.userId;
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.json({ success: false, message: "Thiếu mã lịch hẹn" });
    }

    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData) {
      return res.json({ success: false, message: "Không tìm thấy lịch hẹn" });
    }

    if (String(appointmentData.userId) !== String(userId)) {
      return res.json({ success: false, message: "Vui lòng đăng nhập lại" });
    }

    if (appointmentData.cancelled) {
      return res.json({ success: false, message: "Lịch hẹn đã bị hủy" });
    }

    if (appointmentData.payment) {
      return res.json({ success: false, message: "Lịch hẹn đã thanh toán đầy đủ" });
    }

    if (appointmentData.depositPaid) {
      return res.json({ success: true, message: "Lịch hẹn đã được thanh toán cọc" });
    }

    const depositAmount = calculateDepositAmount(appointmentData.amount);

    if (depositAmount <= 0) {
      return res.json({ success: false, message: "Số tiền cọc không hợp lệ" });
    }

    const depositRef = `dep_${appointmentId}_${Date.now()}`;

    const vnpay = new VNPay({
      tmnCode: process.env.VNPAY_TMN_CODE,
      secureSecret: process.env.VNPAY_SECRET_KEY,
      vnpayHost: process.env.VNPAY_HOST,
      testMode: true,
      hashAlgorithm: "SHA512",
      loggerFn: ignoreLogger,
    });

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const vnpayResponse = await vnpay.buildPaymentUrl({
      vnp_Amount: depositAmount,
      vnp_IpAddr: req.ip || "127.0.0.1",
      vnp_TxnRef: depositRef,
      vnp_OrderInfo: `Thanh toán cọc lịch hẹn - ${appointmentData.userData?.name || "User"}`,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl:
        process.env.VNPAY_APPOINTMENT_RETURN_URL ||
        `${process.env.FRONTEND_URL}/my-appointments`,
      vnp_Locale: VnpLocale.VN,
      vnp_CreateDate: dateFormat(new Date()),
      vnp_ExpireDate: dateFormat(tomorrow),
    });

    res.json({ success: true, paymentUrl: vnpayResponse, depositAmount, depositRef });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to verify VNPay payment
const verifyPayment = async (req, res) => {
  try {
    const userId = req.userId;
    const { appointmentId, vnp_TransactionNo, vnp_Amount } = req.body;

    if (!appointmentId) {
      return res.json({ success: false, message: "Thiếu mã lịch hẹn" });
    }

    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData) {
      return res.json({ success: false, message: "Không tìm thấy lịch hẹn" });
    }

    // Verify appointment belongs to user
    if (String(appointmentData.userId) !== String(userId)) {
      return res.json({ success: false, message: "Vui lòng đăng nhập lại" });
    }

    // Update appointment payment status
    await appointmentModel.findByIdAndUpdate(appointmentId, {
      payment: true,
      paymentTransactionId: vnp_TransactionNo,
      paymentMethod: "vnpay",
    });

    res.json({ success: true, message: "Thanh toán thành công" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const verifyDepositPayment = async (req, res) => {
  try {
    const userId = req.userId;
    const { depositRef, vnp_TransactionNo } = req.body;

    if (!depositRef) {
      return res.json({ success: false, message: "Thiếu mã giao dịch cọc" });
    }

    if (!depositRef.startsWith("dep_")) {
      return res.json({ success: false, message: "Mã giao dịch cọc không hợp lệ" });
    }

    const parts = depositRef.split("_");
    const appointmentId = parts[1];

    if (!appointmentId) {
      return res.json({ success: false, message: "Mã lịch hẹn không hợp lệ" });
    }

    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData) {
      return res.json({ success: false, message: "Không tìm thấy lịch hẹn" });
    }

    if (String(appointmentData.userId) !== String(userId)) {
      return res.json({ success: false, message: "Vui lòng đăng nhập lại" });
    }

    if (appointmentData.depositPaid) {
      return res.json({ success: true, message: "Lịch hẹn đã được thanh toán cọc" });
    }

    const depositAmount = calculateDepositAmount(appointmentData.amount);

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      depositPaid: true,
      depositAmount,
      depositTransactionId: vnp_TransactionNo || depositRef,
      depositMethod: "vnpay",
    });

    res.json({ success: true, message: "Thanh toán cọc thành công" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  changePassword,
  bookAppointment,
  listAppointment,
  cancelAppointment,
  createPaymentUrl,
  verifyPayment,
  createDepositPaymentUrl,
  verifyDepositPayment,
  getWalletData,
  createWalletTopupUrl,
  verifyWalletTopup,
  payAppointmentWithWallet,
  payAppointmentDepositWithWallet,
  withdrawFromWallet,
  updatePersonalImages,
};
