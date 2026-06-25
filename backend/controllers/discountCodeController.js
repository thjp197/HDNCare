import discountCodeModel from "../models/discountCodeModel.js";

// API to add a new discount code
const addDiscountCode = async (req, res) => {
  try {
    const { code, description, discountType, discountValue, maxUses, expiryDate } = req.body;

    // Validate required fields
    if (!code || !discountType || discountValue === undefined) {
      return res.json({ success: false, message: "Vui lòng nhập các trường bắt buộc" });
    }

    // Check if code already exists
    const existingCode = await discountCodeModel.findOne({ code: code.toUpperCase() });
    if (existingCode) {
      return res.json({ success: false, message: "Mã giảm giá đã tồn tại" });
    }

    // Validate discount value
    if (discountType === "percentage" && (discountValue < 0 || discountValue > 100)) {
      return res.json({ success: false, message: "Phần trăm giảm giá phải từ 0-100" });
    }

    if (discountValue < 0) {
      return res.json({ success: false, message: "Giá trị giảm giá phải lớn hơn 0" });
    }

    const newDiscountCode = new discountCodeModel({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      maxUses: maxUses || null,
      expiryDate: expiryDate || null,
    });

    await newDiscountCode.save();
    res.json({ success: true, message: "Thêm mã giảm giá thành công" });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get all discount codes
const getAllDiscountCodes = async (req, res) => {
  try {
    const discountCodes = await discountCodeModel.find().sort({ createdAt: -1 });
    res.json({ success: true, discountCodes });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to update discount code
const updateDiscountCode = async (req, res) => {
  try {
    const { discountCodeId, code, description, discountType, discountValue, maxUses, expiryDate, isActive } = req.body;

    if (!discountCodeId) {
      return res.json({ success: false, message: "ID mã giảm giá không hợp lệ" });
    }

    const updateData = {
      code: code?.toUpperCase(),
      description,
      discountType,
      discountValue,
      maxUses: maxUses || null,
      expiryDate: expiryDate || null,
      isActive
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    await discountCodeModel.findByIdAndUpdate(discountCodeId, updateData);
    res.json({ success: true, message: "Cập nhật mã giảm giá thành công" });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to delete discount code
const deleteDiscountCode = async (req, res) => {
  try {
    const { discountCodeId } = req.body;

    if (!discountCodeId) {
      return res.json({ success: false, message: "ID mã giảm giá không hợp lệ" });
    }

    await discountCodeModel.findByIdAndDelete(discountCodeId);
    res.json({ success: true, message: "Xóa mã giảm giá thành công" });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to verify and apply discount code (for customers)
const verifyDiscountCode = async (req, res) => {
  try {
    const { code, orderAmount, userId } = req.body;

    if (!code) {
      return res.json({ success: false, message: "Vui lòng nhập mã giảm giá" });
    }

    const discountCode = await discountCodeModel.findOne({ code: code.toUpperCase() });

    if (!discountCode) {
      return res.json({ success: false, message: "Mã giảm giá không hợp lệ" });
    }

    if (!discountCode.isActive) {
      return res.json({ success: false, message: "Mã giảm giá đã bị vô hiệu hóa" });
    }

    if (discountCode.expiryDate && new Date(discountCode.expiryDate) < new Date()) {
      return res.json({ success: false, message: "Mã giảm giá đã hết hạn" });
    }

    if (discountCode.minOrderAmount && orderAmount < discountCode.minOrderAmount) {
      return res.json({ success: false, message: `Đơn hàng phải tối thiểu ${discountCode.minOrderAmount} VND` });
    }

    if (discountCode.maxUses && discountCode.usedCount >= discountCode.maxUses) {
      return res.json({ success: false, message: "Mã giảm giá đã hết lượt sử dụng" });
    }

    if (userId && discountCode.usedBy.includes(userId)) {
      return res.json({ success: false, message: "Bạn đã sử dụng mã giảm giá này rồi" });
    }

    // Calculate discount
    let discount = 0;
    if (discountCode.discountType === "percentage") {
      discount = (orderAmount * discountCode.discountValue) / 100;
      if (discountCode.maxDiscount) {
        discount = Math.min(discount, discountCode.maxDiscount);
      }
    } else {
      discount = discountCode.discountValue;
    }

    const finalAmount = Math.max(0, orderAmount - discount);

    res.json({ 
      success: true, 
      message: "Mã giảm giá hợp lệ",
      discount,
      finalAmount,
      discountCode: discountCode.code
    });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  addDiscountCode,
  getAllDiscountCodes,
  updateDiscountCode,
  deleteDiscountCode,
  verifyDiscountCode
};
