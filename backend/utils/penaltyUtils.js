import userModel from "../models/userModel.js";

const MAX_USER_PENALTY_COUNT = 5;

const parseAppointmentDateTime = (slotDate, slotTime) => {
  if (!slotDate || !slotTime) return null;

  const [dayRaw, monthRaw, yearRaw] = String(slotDate).split("_");
  const day = Number(dayRaw);
  const month = Number(monthRaw);
  const year = Number(yearRaw);

  if (!Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year)) {
    return null;
  }

  const normalizedSlotTime = String(slotTime).trim().toUpperCase();

  let hours = 0;
  let minutes = 0;

  const twelveHourMatch = normalizedSlotTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  const twentyFourHourMatch = normalizedSlotTime.match(/^(\d{1,2}):(\d{2})$/);

  if (twelveHourMatch) {
    const parsedHours = Number(twelveHourMatch[1]);
    minutes = Number(twelveHourMatch[2]);
    const period = twelveHourMatch[3];

    hours = parsedHours % 12;
    if (period === "PM") {
      hours += 12;
    }
  } else if (twentyFourHourMatch) {
    hours = Number(twentyFourHourMatch[1]);
    minutes = Number(twentyFourHourMatch[2]);
  } else {
    const fallbackDate = new Date(`${month}/${day}/${year} ${slotTime}`);
    if (!Number.isNaN(fallbackDate.getTime())) {
      return fallbackDate;
    }
    return null;
  }

  // Tạo date theo giờ Việt Nam (UTC+7)
  // slotTime là giờ Việt Nam, cần convert sang UTC
  let appointmentDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
  
  // appointmentDate hiện tại là local time của server
  // Nếu server ở UTC, ta cần trừ 7 giờ để có giờ UTC
  // Nếu server ở giờ địa phương, ta cần convert khác
  
  // Cách an toàn: Tạo date UTC-based
  // slotTime là Vietnam time (UTC+7), convert sang UTC bằng cách trừ 7 tiếng
  const utcDate = new Date(Date.UTC(year, month - 1, day, hours - 7, minutes, 0, 0));
  
  if (Number.isNaN(utcDate.getTime())) {
    return null;
  }

  return utcDate;
};

const isWithinHoursToAppointment = (appointmentData, hours = 2) => {
  const appointmentDate = parseAppointmentDateTime(appointmentData?.slotDate, appointmentData?.slotTime);
  
  if (!appointmentDate) {
    return false;
  }

  const now = new Date();
  const diffMs = appointmentDate.getTime() - now.getTime();
  const thresholdMs = Number(hours) * 60 * 60 * 1000;

  return diffMs <= thresholdMs;
};

const applyUserPenalty = async (userId, options = {}) => {
  const user = await userModel.findById(userId);
  if (!user) {
    return { applied: false, message: "Không tìm thấy tài khoản người dùng" };
  }

  const nextPenaltyCount = Number(user.penaltyCount || 0) + 1;
  const nextIsBanned = nextPenaltyCount >= MAX_USER_PENALTY_COUNT;

  const penaltyEntry = {
    appointmentId: options.appointmentId || null,
    source: options.source || "system",
    reason: options.reason || "Vi phạm chính sách hủy lịch",
    createdAt: new Date(),
    penaltyCountAfter: nextPenaltyCount,
  };

  await userModel.findByIdAndUpdate(userId, {
    penaltyCount: nextPenaltyCount,
    isBanned: nextIsBanned,
    lastPenaltyAt: new Date(),
    $push: { penaltyLogs: penaltyEntry },
  });

  return {
    applied: true,
    penaltyCount: nextPenaltyCount,
    isBanned: nextIsBanned,
  };
};

// Xử lý hoàn tiền khi hủy lịch hợp lệ
const processRefund = async (userId, appointmentData) => {
  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return { success: false, message: "Không tìm thấy người dùng" };
    }

    // Tính toán số tiền hoàn lại
    let refundAmount = 0;
    let refundSource = "";

    if (appointmentData.payment && appointmentData.amount) {
      // Hoàn lại toàn bộ số tiền thanh toán
      refundAmount = appointmentData.amount;
      refundSource = "full_payment";
    } else if (appointmentData.depositPaid && appointmentData.depositAmount) {
      // Hoàn lại cọc
      refundAmount = appointmentData.depositAmount;
      refundSource = "deposit";
    }

    if (refundAmount <= 0) {
      return { success: true, amount: 0, message: "Không có tiền cần hoàn" };
    }

    // Tạo ghi chép giao dịch hoàn tiền
    const refundTransaction = {
      reference: `refund_${appointmentData._id}_${Date.now()}`,
      type: "refund",
      source: refundSource,
      appointmentId: appointmentData._id,
      amount: refundAmount,
      status: "success",
      description: 
        refundSource === "full_payment"
          ? `Hoàn lại tiền từ lịch hẹn bị hủy - ${refundAmount.toLocaleString("vi-VN")} VND`
          : `Hoàn lại tiền từ lịch hẹn bị hủy - ${refundAmount.toLocaleString("vi-VN")} VND`,
      createdAt: new Date(),
    };

    // Cập nhật ví và ghi chép giao dịch
    const nextTransactions = [
      ...(user.walletTransactions || []),
      refundTransaction,
    ];

    await userModel.findByIdAndUpdate(userId, {
      walletBalance: (user.walletBalance || 0) + refundAmount,
      walletTransactions: nextTransactions,
    });

    return {
      success: true,
      amount: refundAmount,
      source: refundSource,
      message: `Hoàn lại ${refundAmount.toLocaleString("vi-VN")} VND vào ví`,
    };
  } catch (error) {
    console.log("Refund error:", error);
    return { success: false, message: "Lỗi khi xử lý hoàn tiền: " + error.message };
  }
};

export {
  MAX_USER_PENALTY_COUNT,
  parseAppointmentDateTime,
  isWithinHoursToAppointment,
  applyUserPenalty,
  processRefund,
};
