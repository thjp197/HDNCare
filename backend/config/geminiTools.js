export const bookingTools = [{
  functionDeclarations: [
    {
      name: "checkAvailability",
      description: "Kiểm tra xem lịch của nhân viên có bị trùng vào ngày và giờ khách chọn hay không. BẮT BUỘC gọi hàm này trước khi xác nhận đặt lịch.",
      parameters: {
        type: "OBJECT",
        properties: {
          stylistName: { type: "STRING", description: "Tên đầy đủ của nhân viên (VD: Nguyễn Thảo My)" },
          slotDate: { type: "STRING", description: "Ngày đặt lịch (Format: DD_MM_YYYY, VD: 25_10_2026)" },
          slotTime: { type: "STRING", description: "Giờ đặt lịch (Format: HH:mm AM/PM, VD: 10:30 AM)" }
        },
        required: ["stylistName", "slotDate", "slotTime"]
      }
    },
    {
      name: "cancelAppointment",
      description: "Huỷ lịch hẹn đã đặt của khách hàng. BẮT BUỘC phải hỏi khách hàng số điện thoại, ngày và giờ họ đã đặt trước khi gọi hàm này.",
      parameters: {
        type: "OBJECT",
        properties: {
          customerPhone: { type: "STRING", description: "Số điện thoại của khách đã dùng để đặt lịch" },
          stylistName: { type: "STRING", description: "Tên chuyên viên của lịch hẹn muốn huỷ" },
          slotDate: { type: "STRING", description: "Ngày đã đặt (Format: DD_MM_YYYY)" },
          slotTime: { type: "STRING", description: "Giờ đã đặt (Format: HH:mm AM/PM)" }
        },
        required: ["customerPhone", "stylistName", "slotDate", "slotTime"]
      }
    },
    {
      name: "createBooking",
      description: "Tạo lịch hẹn mới vào hệ thống sau khi khách hàng đã xác nhận đồng ý đặt lịch.",
      parameters: {
        type: "OBJECT",
        properties: {
          customerName: { type: "STRING", description: "Tên của khách hàng" },
          customerPhone: { type: "STRING", description: "Số điện thoại của khách hàng" },
          stylistName: { type: "STRING", description: "Tên nhân viên khách chọn" },
          branchName: { type: "STRING", description: "Tên chi nhánh khách chọn (VD: Gò Vấp, Bình Thạnh, Quận 7)" },
          slotDate: { type: "STRING", description: "Ngày đặt (Format: DD_MM_YYYY)" },
          slotTime: { type: "STRING", description: "Giờ đặt (Format: HH:mm AM/PM)" }
        },
        required: ["customerName", "customerPhone", "stylistName", "slotDate", "slotTime"]
      }
    },
    {
      name: "rescheduleAppointment",
      description: "Dời lịch hoặc thay đổi thời gian cho một lịch hẹn đã đặt của khách hàng sang một khung giờ/ngày khác.",
      parameters: {
        type: "OBJECT",
        properties: {
          customerPhone: { type: "STRING", description: "Số điện thoại của khách hàng đã đặt lịch" },
          stylistName: { type: "STRING", description: "Tên chuyên viên của lịch hẹn muốn dời" },
          oldSlotDate: { type: "STRING", description: "Ngày hẹn CŨ (định dạng DD_MM_YYYY)" },
          oldSlotTime: { type: "STRING", description: "Giờ hẹn CŨ (VD: 09:00 hoặc 14:00)" },
          newSlotDate: { type: "STRING", description: "Ngày hẹn MỚI (định dạng DD_MM_YYYY)" },
          newSlotTime: { type: "STRING", description: "Giờ hẹn MỚI (VD: 10:00 hoặc 15:00)" }
        },
        required: ["customerPhone", "stylistName", "oldSlotDate", "oldSlotTime", "newSlotDate", "newSlotTime"]
      }
    }
  ]
}];