# Backend – Authentication & Profile APIs

## Overview

Tài liệu này mô tả các API và cơ chế xác thực cho hệ thống Backend, bao gồm:

- Đăng nhập bằng Email hoặc Số điện thoại
- Xác thực JWT + Refresh Token
- Logout & revoke token
- Lấy thông tin profile hiện tại
- Khoá tài khoản khi đăng nhập sai nhiều lần
- Ghi log các sự kiện đăng nhập
- Middleware xác thực
- Unit tests & API documentation requirements

Công nghệ đề xuất:

- Node.js + TypeScript
- NestJS
- TypeORM
- JWT (access token + refresh token)
- Redis (optional, cho rate-limit & token blacklist)

---

## Authentication Flow

### Tổng quan luồng đăng nhập

1. Client gọi `POST /auth/login`
2. Backend:
    - Tìm user theo email hoặc số điện thoại
    - Kiểm tra trạng thái user
    - Verify mật khẩu
    - Kiểm tra số lần login sai
3. Nếu hợp lệ:
    - Sinh access token (JWT)
    - Sinh refresh token
    - Lưu refresh token (hash) vào DB
4. Trả về token cho client

---

## User status & security rules

User phải thỏa các điều kiện sau mới được đăng nhập:

- `isActive = true`
- `isLocked = false`

Tài khoản sẽ bị khoá khi:

- số lần đăng nhập sai vượt quá ngưỡng cho phép

---

## Data model (đề xuất)

### User

```ts
interface User {
  id: string;
  email?: string;
  phone?: string;

  passwordHash: string;

  isActive: boolean;
  isLocked: boolean;

  failedLoginCount: number;
  lockedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}
