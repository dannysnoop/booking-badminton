---
name: "[Phase 3.1] Implement Booking System"
about: Court booking with date/time selection, payment, and confirmation
title: "[Phase 3.1] Implement Booking System"
labels: booking, enhancement, phase-3
assignees: ''
---

## Mô tả
Xây dựng hệ thống đặt lịch sân với lựa chọn ngày giờ, thanh toán và xác nhận.

## Yêu cầu chức năng

### 1. Booking Flow
- [ ] Step 1: Chọn sân từ search results/detail page
- [ ] Step 2: Chọn ngày và khung giờ
- [ ] Step 3: Kiểm tra tình trạng còn trống (real-time)
- [ ] Step 4: Nhập thông tin liên hệ
- [ ] Step 5: Chọn phương thức thanh toán
- [ ] Step 6: Review và xác nhận
- [ ] Step 7: Nhận mã booking và confirmation

### 2. Date and Time Selection
- [ ] Calendar picker cho date
- [ ] Available time slots display
- [ ] Multiple hours selection
- [ ] Price calculation per selection
- [ ] Check overlap với bookings khác
- [ ] Lock slot khi selecting (5-10 phút)
- [ ] Show peak/off-peak pricing

### 3. Availability Check
- [ ] Real-time availability API
- [ ] Concurrent booking prevention
- [ ] Optimistic locking mechanism
- [ ] Show alternative times nếu không còn chỗ
- [ ] Auto-refresh availability

### 4. Contact Information
- [ ] Pre-fill từ user profile
- [ ] Allow edit:
  - Tên người đặt
  - Số điện thoại
  - Email (optional)
  - Ghi chú đặc biệt
- [ ] Validate phone number
- [ ] Save thông tin cho lần sau

### 5. Payment Methods
- [ ] Thanh toán trực tuyến:
  - VNPay
  - MoMo
  - ZaloPay
  - Thẻ tín dụng/ATM (Stripe, PayPal)
- [ ] Thanh toán tại sân:
  - Tiền mặt
  - Chuyển khoản
- [ ] Payment status tracking
- [ ] Payment timeout handling
- [ ] Refund mechanism

### 6. Booking Confirmation
- [ ] Generate unique booking code (8-10 ký tự)
- [ ] Create booking record trong database
- [ ] Send confirmation email/SMS:
  - Booking details
  - Court info
  - Date and time
  - Total price
  - Booking code
  - QR code (optional)
  - Directions link
  - Contact info
- [ ] Show confirmation page
- [ ] Add to calendar button (ICS file)

### 7. Booking Policies
- [ ] Cancellation policy display
- [ ] Minimum booking duration
- [ ] Maximum advance booking period
- [ ] Same-day booking rules
- [ ] Terms and conditions checkbox
- [ ] Refund policy

### 8. Database Schema
- [ ] Bảng bookings:
  - id (UUID)
  - booking_code (unique, indexed)
  - user_id
  - court_id
  - booking_date
  - start_time
  - end_time
  - duration_hours
  - total_price
  - status (pending, confirmed, cancelled, completed)
  - payment_method
  - payment_status (unpaid, paid, refunded)
  - payment_transaction_id
  - contact_name
  - contact_phone
  - contact_email
  - notes
  - created_at
  - updated_at
- [ ] Bảng booking_slots (nhiều slots cho 1 booking):
  - id
  - booking_id
  - time_slot
  - price
  - status
- [ ] Bảng booking_locks (prevent concurrent booking):
  - id
  - court_id
  - date
  - time_slot
  - user_id
  - expires_at
  - created_at

### 9. API Endpoints
- [ ] POST /api/bookings/check-availability
  - Input: court_id, date, time_slots
  - Output: available (boolean), alternatives
- [ ] POST /api/bookings/lock-slot
  - Input: court_id, date, time_slots
  - Output: lock_id, expires_at
- [ ] POST /api/bookings/create
  - Input: booking details, payment info
  - Output: booking object with code
- [ ] POST /api/bookings/calculate-price
  - Input: court_id, date, time_slots
  - Output: breakdown, total
- [ ] GET /api/bookings/:code - Get booking by code
- [ ] POST /api/payments/process - Process payment
- [ ] POST /api/payments/callback - Payment gateway callback

### 10. Payment Integration
- [ ] VNPay integration
- [ ] MoMo integration
- [ ] ZaloPay integration
- [ ] Handle payment callbacks
- [ ] Payment verification
- [ ] Transaction logging
- [ ] Webhook security

### 11. Notifications
- [ ] Email notifications:
  - Booking confirmation
  - Payment confirmation
  - Booking reminder (1 day before, 2 hours before)
- [ ] SMS notifications:
  - Booking code
  - Important updates
- [ ] Push notifications (mobile app)

### 12. Frontend Components
- [ ] DateTimePicker component
- [ ] TimeSlotSelector component
- [ ] ContactForm component
- [ ] PaymentMethodSelector component
- [ ] PriceBreakdown component
- [ ] BookingConfirmation component
- [ ] BookingProgress stepper

### 13. Error Handling
- [ ] Slot no longer available
- [ ] Payment failed
- [ ] Network timeout
- [ ] Concurrent booking conflict
- [ ] Show user-friendly messages
- [ ] Retry mechanisms

### 14. Testing
- [ ] Unit tests cho booking logic
- [ ] Integration tests cho API
- [ ] Test concurrent bookings
- [ ] Mock payment gateways
- [ ] E2E tests cho full booking flow
- [ ] Load testing cho concurrent users

## Tiêu chí chấp nhận
- [ ] Booking flow hoàn chỉnh và mượt mà
- [ ] Real-time availability check chính xác
- [ ] Payment integration hoạt động
- [ ] Confirmation emails/SMS được gửi
- [ ] Concurrent booking prevention works
- [ ] Mobile responsive
- [ ] Tests pass 100%
- [ ] Security review passed

## Phụ thuộc
- Issue #[Phase 2.2] - Court Detail View (availability calendar)

## Công nghệ đề xuất
- Payment: VNPay SDK, MoMo SDK, ZaloPay SDK
- Queue: Bull/BullMQ (notifications)
- Email: SendGrid, Mailgun
- SMS: Twilio, VNPT SMS
- Lock: Redis (distributed lock)

## Ước lượng
- Effort: 14-21 days
- Priority: Critical (P0)

## Ghi chú
- Payment integration cần test thoroughly
- Handle edge cases: timeout, failed payments
- Compliance với payment gateway security
- Log tất cả transactions
