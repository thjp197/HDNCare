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

  const appointmentDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
  if (Number.isNaN(appointmentDate.getTime())) {
    return null;
  }

  return appointmentDate;
};

const isWithinHoursToAppointment = (appointmentData, hours = 2) => {
  const appointmentDate = parseAppointmentDateTime(appointmentData?.slotDate, appointmentData?.slotTime);
  if (!appointmentDate) return false;

  const diffMs = appointmentDate.getTime() - Date.now();
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

export {
  MAX_USER_PENALTY_COUNT,
  parseAppointmentDateTime,
  isWithinHoursToAppointment,
  applyUserPenalty,
};
