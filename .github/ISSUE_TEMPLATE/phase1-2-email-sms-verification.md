---
name: "[Phase 1.2] Implement Email/SMS Verification"
about: Email and SMS verification with OTP
title: "[Phase 1.2] Implement Email/SMS Verification"
labels: authentication, enhancement, phase-1
assignees: ''
---

## Mô tả
Xây dựng hệ thống xác thực tài khoản qua email và SMS với mã OTP.

## Yêu cầu chức năng

### 1. Tạo và gửi OTP
- [ ] Generate OTP 6 chữ số ngẫu nhiên
- [ ] Lưu OTP vào database/cache với thời gian hết hạn (5-10 phút)
- [ ] Gửi email xác thực:
  - Tích hợp SMTP service (SendGrid, AWS SES, Mailgun)
  - Template email với OTP code
  - Link xác thực thay thế
- [ ] Gửi SMS xác thực:
  - Tích hợp SMS gateway (Twilio, AWS SNS, VNPT)
  - Format tin nhắn với OTP

### 2. Xác thực OTP
- [ ] Validate OTP code
- [ ] Kiểm tra thời gian hết hạn
- [ ] Giới hạn số lần thử (tối đa 5 lần)
- [ ] Update trạng thái is_verified = true
- [ ] Xóa OTP sau khi xác thực thành công

### 3. Gửi lại OTP
- [ ] API để gửi lại OTP
- [ ] Rate limiting (1 lần/60 giây)
- [ ] Invalidate OTP cũ khi gửi mới

### 4. Database Schema
- [ ] Bảng verification_codes:
  - id
  - user_id (foreign key)
  - code (indexed)
  - type (email/sms)
  - expires_at
  - attempts
  - created_at

### 5. API Endpoints
- [ ] POST /api/auth/send-verification
  - Input: user_id, type (email/sms)
  - Output: message, expires_at
- [ ] POST /api/auth/verify-otp
  - Input: user_id, code
  - Output: success, message
- [ ] POST /api/auth/resend-verification
  - Input: user_id, type
  - Output: message, expires_at

### 6. Testing
- [ ] Unit tests cho OTP generation
- [ ] Integration tests cho gửi email/SMS
- [ ] Test rate limiting
- [ ] Test expiration logic
- [ ] Mock email/SMS services

## Tiêu chí chấp nhận
- [ ] OTP được gửi qua email và SMS
- [ ] Xác thực OTP hoạt động đúng
- [ ] Rate limiting hoạt động
- [ ] OTP hết hạn sau thời gian quy định
- [ ] Tests pass 100%

## Phụ thuộc
- Issue #[Phase 1.1] - User Registration

## Công nghệ đề xuất
- Email: SendGrid API, Nodemailer, AWS SES
- SMS: Twilio, AWS SNS, VNPT SMS
- Cache: Redis (cho OTP storage)
- Queue: Bull/BullMQ (cho async sending)

## Ước lượng
- Effort: 5-7 days
- Priority: High (P0)

## Ghi chú
- Cân nhắc chi phí SMS gateway
- Implement email template đẹp mắt
- Log tất cả verification attempts
