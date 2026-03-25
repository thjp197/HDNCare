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
          slotDate: { type: "STRING", description: "Ngày đã đặt (Format: DD_MM_YYYY)" },
          slotTime: { type: "STRING", description: "Giờ đã đặt (Format: HH:mm AM/PM)" }
        },
        required: ["customerPhone", "slotDate", "slotTime"]
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
          slotDate: { type: "STRING", description: "Ngày đặt (Format: DD_MM_YYYY)" },
          slotTime: { type: "STRING", description: "Giờ đặt (Format: HH:mm AM/PM)" }
        },
        required: ["customerName", "customerPhone", "stylistName", "slotDate", "slotTime"]
      }
    }
  ]
}];