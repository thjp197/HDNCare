# Hệ Thống Hoàn Tiền - HDNCare

## Tổng Quan

Hệ thống hoàn tiền cho phép khách hàng có thể nhận lại tiền khi hủy lịch hẹn, với điều kiện là hủy lịch hợp lệ (không vi phạm chính sách).

## Luật Hoàn Tiền

### ✅ Hủy Hợp Lệ (Có Hoàn Tiền)
- **Điều kiện**: Hủy lịch **trước 2 giờ** cuộc hẹn
- **Hoàn tiền**: 100% số tiền đã thanh toán hoặc cọc
- **Xử lý**: Tiền tự động cộng vào ví của khách hàng

### ❌ Hủy Vi Phạm (Không Hoàn Tiền)
- **Điều kiện**: Hủy lịch **trong vòng 2 giờ** trước cuộc hẹn
- **Hậu quả**: 
  - Không hoàn tiền
  - Nhận 1 lần phạt vi phạm
  - Nếu tích lũy 5 lần phạt → Tài khoản bị khóa

## Cấu Trúc Dữ Liệu

### Appointment Model
```javascript
{
  amount: Number,              // Số tiền dịch vụ
  payment: Boolean,            // Đã thanh toán đầy đủ?
  paymentTransactionId: String,// ID giao dịch thanh toán
  depositPaid: Boolean,        // Đã cọc?
  depositAmount: Number,       // Số tiền cọc
  depositTransactionId: String,// ID giao dịch cọc
  cancelled: Boolean,          // Đã hủy?
  cancellationReasons: Array,  // Lý do hủy
  cancellationDetails: String  // Chi tiết hủy
}
```

### Wallet Transaction Model
```javascript
{
  reference: String,          // ID giao dịch duy nhất
  type: String,               // "refund", "topup", "payment"
  source: String,             // "full_payment", "deposit"
  appointmentId: ObjectId,    // Lịch hẹn liên quan
  amount: Number,             // Số tiền
  status: String,             // "pending", "success", "failed"
  description: String,        // Mô tả
  createdAt: Date            // Thời gian tạo
}
```

## Quy Trình Xử Lý Hoàn Tiền

### 1. Khi Khách Hàng Gửi Yêu Cầu Hủy Lịch

```
POST /api/user/cancel-appointment
{
  appointmentId: "6507c8d0a1b2c3d4e5f6g7h8",
  cancellationReasons: ["Unexpected work", "Emergency"],
  cancellationDetails: "Có việc khẩn cấp phải xử lý"
}
```

### 2. Hệ Thống Kiểm Tra

- ✅ Xác thực người dùng
- ✅ Kiểm tra lịch hẹn tồn tại
- ✅ Kiểm tra lịch hẹn chưa được hủy
- ✅ Kiểm tra quyền sở hữu (lịch hẹn thuộc về người dùng)

### 3. Cập Nhật Trạng Thái

- ✅ Đánh dấu lịch hẹn là `cancelled: true`
- ✅ Lưu lý do hủy trong `cancellationReasons` và `cancellationDetails`
- ✅ Giải phóng slot của stylist

### 4. Kiểm Tra Chính Sách

```javascript
const shouldPenalize = isWithinHoursToAppointment(appointmentData, 2);
```

**Nếu hủy trong 2 giờ:**
- → Áp dụng phạt (1 lần vi phạm)
- → **KHÔNG hoàn tiền**

**Nếu hủy trước 2 giờ:**
- → Không áp dụng phạt
- → **CÓ hoàn tiền**

### 5. Xử Lý Hoàn Tiền (Nếu Hợp Lệ)

Hàm `processRefund()` sẽ:

1. **Lấy thông tin người dùng**
   ```javascript
   const user = await userModel.findById(userId);
   ```

2. **Tính toán số tiền hoàn**
   - Nếu `payment === true` → Hoàn `amount` (thanh toán đầy đủ)
   - Nếu `depositPaid === true` → Hoàn `depositAmount` (cọc)
   - Nếu cả hai → Hoàn tổng cộng

3. **Tạo ghi chép giao dịch**
   ```javascript
   {
     reference: `refund_${appointmentId}_${timestamp}`,
     type: "refund",
     source: "full_payment" | "deposit",
     appointmentId: appointmentId,
     amount: refundAmount,
     status: "success",
     description: "Hoàn lại tiền dịch vụ từ lịch hẹn bị hủy - X.XXX.XXX VND",
     createdAt: new Date()
   }
   ```

4. **Cập nhật ví**
   ```javascript
   walletBalance: walletBalance + refundAmount
   walletTransactions: [...walletTransactions, refundTransaction]
   ```

### 6. Phản Hồi Cho Khách Hàng

```json
{
  "success": true,
  "message": "Lịch hẹn đã được hủy. Hoàn lại 500.000 VND vào ví",
  "penaltyApplied": false,
  "penaltyCount": null,
  "userBanned": false,
  "refundProcessed": true,
  "refundAmount": 500000,
  "refundMessage": "Hoàn lại 500.000 VND vào ví"
}
```

## Các Trường Hợp Hoàn Tiền

### Trường Hợp 1: Thanh Toán Đầy Đủ Trước Lịch

| Tình Huống | Điều Kiện | Hoàn Tiền |
|-----------|-----------|----------|
| Hủy trước 2 giờ | `payment: true`, `amount: 500000` | ✅ Hoàn 500.000 VND |
| Hủy trong 2 giờ | `payment: true`, `amount: 500000` | ❌ Không hoàn, phạt 1 lần |

### Trường Hợp 2: Chỉ Cọc

| Tình Huống | Điều Kiện | Hoàn Tiền |
|-----------|-----------|----------|
| Hủy trước 2 giờ | `depositPaid: true`, `depositAmount: 100000` | ✅ Hoàn 100.000 VND |
| Hủy trong 2 giờ | `depositPaid: true`, `depositAmount: 100000` | ❌ Không hoàn, phạt 1 lần |

### Trường Hợp 3: Cọc + Thanh Toán Đầy Đủ

| Tình Huống | Điều Kiện | Hoàn Tiền |
|-----------|-----------|----------|
| Hủy trước 2 giờ | `payment: true, amount: 500000, depositPaid: true, depositAmount: 100000` | ✅ Hoàn 600.000 VND |
| Hủy trong 2 giờ | Như trên | ❌ Không hoàn, phạt 1 lần |

## API Response Examples

### ✅ Hủy Thành Công - Hoàn Tiền

```json
{
  "success": true,
  "message": "Lịch hẹn đã được hủy. Hoàn lại 500.000 VND vào ví",
  "penaltyApplied": false,
  "penaltyCount": null,
  "userBanned": false,
  "refundProcessed": true,
  "refundAmount": 500000,
  "refundMessage": "Hoàn lại 500.000 VND vào ví"
}
```

### ⚠️ Hủy Vi Phạm - Không Hoàn Tiền

```json
{
  "success": true,
  "message": "Lịch hẹn đã được hủy. Bạn bị phạt 1 lần (2/5). Không có tiền hoàn lại.",
  "penaltyApplied": true,
  "penaltyCount": 2,
  "userBanned": false,
  "refundProcessed": false,
  "refundAmount": 0,
  "refundMessage": null
}
```

### 🔒 Hủy Vi Phạm Lần 5 - Tài Khoản Bị Khóa

```json
{
  "success": true,
  "message": "Lịch hẹn đã được hủy. Bạn bị phạt 1 lần và tài khoản đã bị khóa vì đủ 5 lần vi phạm. Không có tiền hoàn lại.",
  "penaltyApplied": true,
  "penaltyCount": 5,
  "userBanned": true,
  "refundProcessed": false,
  "refundAmount": 0,
  "refundMessage": null
}
```

## Xem Giao Dịch Hoàn Tiền Trong Ví

Khách hàng có thể xem lịch sử hoàn tiền trong ví:

```
GET /api/user/wallet
```

**Response:**
```json
{
  "success": true,
  "user": {
    "walletBalance": 600000,
    "walletTransactions": [
      {
        "type": "refund",
        "reference": "refund_6507c8d0a1b2c3d4e5f6g7h8_1692000000000",
        "source": "full_payment",
        "amount": 500000,
        "status": "success",
        "description": "Hoàn lại tiền dịch vụ từ lịch hẹn bị hủy - 500.000 VND",
        "createdAt": "2024-05-07T10:30:00Z"
      },
      {
        "type": "topup",
        "reference": "wallet_123456_1691999999999",
        "amount": 100000,
        "status": "success",
        "description": "Nạp tiền ví 100.000 VND",
        "createdAt": "2024-05-07T09:00:00Z"
      }
    ]
  }
}
```

## Hàm Utility Chính

### `processRefund(userId, appointmentData)`

**Vị trí:** `backend/utils/penaltyUtils.js`

**Tham số:**
- `userId` (string): ID của người dùng
- `appointmentData` (object): Dữ liệu lịch hẹn

**Trả về:**
```javascript
{
  success: boolean,
  amount: number,
  source: string,  // "full_payment" | "deposit"
  message: string
}
```

**Ví dụ:**
```javascript
const refundResult = await processRefund(userId, appointmentData);

if (refundResult.success && refundResult.amount > 0) {
  console.log(`Đã hoàn ${refundResult.amount} VND`);
}
```

## Kiểm Thử (Testing)

### Test Case 1: Hoàn Tiền Thành Công
```bash
# Tạo lịch hẹn với thanh toán đầy đủ
# Hủy sau 2.5 giờ
# Kỳ vọng: Hoàn tiền
```

### Test Case 2: Phạt Vi Phạm - Không Hoàn Tiền
```bash
# Tạo lịch hẹn với thanh toán đầy đủ
# Hủy sau 1 giờ
# Kỳ vọng: Không hoàn tiền, nhận phạt 1 lần
```

### Test Case 3: Hoàn Cọc
```bash
# Tạo lịch hẹn chỉ cọc
# Hủy sau 2.5 giờ
# Kỳ vọng: Hoàn tiền cọc
```

## Lợi Ích Của Hệ Thống

✅ **Minh Bạch**: Khách hàng biết rõ khi nào được hoàn tiền  
✅ **Công Bằng**: Tuân thủ chính sách hủy lịch có chủ ý  
✅ **Tự Động**: Hoàn tiền xảy ra tức thời, không cần xử lý thủ công  
✅ **Lưu Vết**: Ghi chép mọi giao dịch trong lịch sử ví  
✅ **An Toàn**: Chỉ hoàn tiền nếu điều kiện được thỏa mãn  

## Câu Hỏi Thường Gặp

**Q: Hoàn tiền sẽ tới tài khoản ngân hàng của tôi không?**  
A: Không. Hoàn tiền sẽ được cộng vào ví HDNCare của bạn. Bạn có thể rút tiền từ ví hoặc sử dụng để đặt lịch hẹn khác.

**Q: Tôi có thể hoàn tiền bao lâu?**  
A: Hoàn tiền được xử lý ngay lập tức khi bạn hủy lịch hẹn (nếu hợp lệ).

**Q: Nếu tôi bị phạt 5 lần, tôi có thể mở lại tài khoản không?**  
A: Bạn sẽ cần liên hệ với đội hỗ trợ khách hàng để xin mở lại tài khoản.

**Q: Phí rút tiền từ ví là bao nhiêu?**  
A: Hiện tại không có phí rút tiền từ ví.

## Cập Nhật Ghi Chú

**Phiên bản**: 1.0  
**Ngày cập nhật**: 2024-05-07  
**Tác giả**: HDNCare Team  
**Trạng thái**: Hoạt động ✅
