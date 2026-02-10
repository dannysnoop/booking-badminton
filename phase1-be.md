BE (Backend)

Thiết kế API POST /auth/register (validate – duplicate check – hash password – lưu user trạng thái pending)

Thiết kế API POST /auth/verify (OTP hoặc link, cập nhật trạng th��i user, giới hạn số lần sai)

Gửi email/SMS xác thực OTP với TTL và rate-limit

Xử lý resend OTP, giới hạn max lần/ngày

Ghi log/audit sự kiện đăng ký, xác thực

Unit tests & API docs