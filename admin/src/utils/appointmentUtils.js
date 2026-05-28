// Function to check if appointment is expired
export const isAppointmentExpired = (appointment) => {
  // If already cancelled or completed, it's not expired
  if (appointment.cancelled || appointment.isCompleted) {
    return false;
  }
  
  // Parse date and time
  const [dayStr, monthStr, yearStr] = appointment.slotDate.split("_");
  const day = parseInt(dayStr);
  const month = parseInt(monthStr);
  const year = parseInt(yearStr);
  
  // Extract hour and minute from slotTime
  const timeMatch = appointment.slotTime.match(/(\d{1,2}):(\d{2})/);
  if (!timeMatch) return false;
  
  const hour = parseInt(timeMatch[1]);
  const minute = parseInt(timeMatch[2]);
  const appointmentDateTime = new Date(year, month - 1, day, hour, minute);
  const now = new Date();
  
  // If appointment time is in the past, it's expired
  return appointmentDateTime < now;
};
