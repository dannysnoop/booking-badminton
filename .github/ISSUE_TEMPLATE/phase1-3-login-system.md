---
name: "[Phase 1.3] Implement Login System"
about: User login with session/token management
title: "[Phase 1.3] Implement Login System"
labels: authentication, enhancement, phase-1
assignees: ''
---

## Mô tả
Xây dựng hệ thống đăng nhập với quản lý session/token và chuyển hướng.

## Yêu cầu chức năng

### 1. Login Flow
- [ ] Accept email hoặc số điện thoại
- [ ] Verify password với hash trong database
- [ ] Kiểm tra tài khoản đã được verify
- [ ] Tạo session/JWT token
- [ ] Trả về token và thông tin user

### 2. Token Management
- [ ] Implement JWT token:
  - Access token (15-30 phút)
  - Refresh token (7-30 ngày)
  - Payload: user_id, email, role
- [ ] Lưu refresh token vào database
- [ ] API refresh token
- [ ] Revoke token khi logout

### 3. Session Management (alternative to JWT)
- [ ] Tạo session với unique session_id
- [ ] Lưu session vào Redis/database
- [ ] Set cookie với session_id
- [ ] Expiry time cho session

### 4. Security
- [ ] Rate limiting cho login (5 lần/5 phút)
- [ ] Lock account sau N lần đăng nhập sai (10 lần)
- [ ] Log tất cả login attempts
- [ ] Implement CSRF protection
- [ ] Secure cookie settings (httpOnly, secure, sameSite)

### 5. Database Schema
- [ ] Bảng sessions/refresh_tokens:
  - id
  - user_id
  - token/session_id
  - expires_at
  - created_at
  - last_used_at
  - ip_address
  - user_agent
- [ ] Bảng login_attempts:
  - id
  - user_id/identifier
  - success
  - ip_address
  - created_at

### 6. API Endpoints
- [ ] POST /api/auth/login
  - Input: email/phone, password
  - Output: access_token, refresh_token, user
  - Status: 200 OK, 401 Unauthorized, 429 Too Many Requests
- [ ] POST /api/auth/refresh
  - Input: refresh_token
  - Output: new access_token
- [ ] POST /api/auth/logout
  - Input: access_token
  - Output: success message
- [ ] GET /api/auth/me
  - Header: Authorization: Bearer {token}
  - Output: user info

### 7. Middleware
- [ ] Authentication middleware
- [ ] Verify token và attach user to request
- [ ] Handle expired tokens
- [ ] Handle invalid tokens

### 8. Testing
- [ ] Unit tests cho token generation/validation
- [ ] Integration tests cho login flow
- [ ] Test rate limiting
- [ ] Test account lockout
- [ ] Test token refresh
- [ ] Test logout

## Tiêu chí chấp nhận
- [ ] Login với email/phone hoạt động đúng
- [ ] Token/session được tạo và quản lý đúng
- [ ] Rate limiting và security measures hoạt động
- [ ] Logout xóa session/token
- [ ] Tests pass 100%
- [ ] API documentation đầy đủ

## Phụ thuộc
- Issue #[Phase 1.1] - User Registration
- Issue #[Phase 1.2] - Email/SMS Verification

## Công nghệ đề xuất
- JWT: jsonwebtoken (Node.js), PyJWT (Python)
- Session: express-session, Redis
- Security: helmet, express-rate-limit
- Crypto: bcrypt

## Ước lượng
- Effort: 5-7 days
- Priority: High (P0)

## Ghi chú
- Quyết định JWT vs Session based trước khi implement
- Document token format và expiry times
- Implement logout from all devices
