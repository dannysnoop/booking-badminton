---
name: "[Phase 1.1] Implement User Registration"
about: User registration with email/phone validation and password hashing
title: "[Phase 1.1] Implement User Registration"
labels: authentication, enhancement, phase-1
assignees: ''
---

## Mô tả
Xây dựng hệ thống đăng ký tài khoản người dùng với xác thực email/số điện thoại và mã hóa mật khẩu.

## Yêu cầu chức năng

### 1. Validation đầu vào
- [ ] Validate email format (RFC 5322)
- [ ] Validate số điện thoại (định dạng VN: 0xxx hoặc +84xxx)
- [ ] Yêu cầu mật khẩu:
  - Tối thiểu 8 ký tự
  - Chứa ít nhất 1 chữ hoa
  - Chứa ít nhất 1 chữ thường
  - Chứa ít nhất 1 số
  - Chứa ít nhất 1 ký tự đặc biệt
- [ ] Validate họ tên (không để trống, tối thiểu 2 ký tự)

### 2. Lưu trữ thông tin
- [ ] Thiết kế schema database cho bảng users
  - id (UUID/auto-increment)
  - email (unique, indexed)
  - phone (unique, indexed)
  - password_hash
  - full_name
  - created_at
  - updated_at
  - is_verified (boolean, default: false)
- [ ] Hash mật khẩu với bcrypt/argon2
- [ ] Kiểm tra email/phone đã tồn tại

### 3. API Endpoints
- [ ] POST /api/auth/register
  - Input: email, phone, password, full_name
  - Output: user_id, message
  - Status codes: 201 Created, 400 Bad Request, 409 Conflict

### 4. Testing
- [ ] Unit tests cho validation
- [ ] Integration tests cho API endpoint
- [ ] Test cases:
  - Đăng ký thành công
  - Email/phone đã tồn tại
  - Mật khẩu không đủ mạnh
  - Dữ liệu không hợp lệ

## Tiêu chí chấp nhận
- [ ] API đăng ký hoạt động đúng
- [ ] Mật khẩu được hash an toàn
- [ ] Validation hoạt động chính xác
- [ ] Tests pass 100%
- [ ] Code được review và merge

## Phụ thuộc
- Không có phụ thuộc

## Công nghệ đề xuất
- Backend: Node.js/Express hoặc Django/FastAPI
- Database: PostgreSQL hoặc MySQL
- Password hashing: bcrypt
- Validation: Joi/Yup hoặc Pydantic

## Ước lượng
- Effort: 3-5 days
- Priority: High (P0)
