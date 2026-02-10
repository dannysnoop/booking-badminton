# Backend – Social Login, 2FA (TOTP), Password Recovery & Profile Management

## Overview

Tài liệu này mô tả các chức năng backend mở rộng cho hệ thống xác thực và quản lý hồ sơ người dùng, bao gồm:

- Tích hợp đăng nhập mạng xã hội (Google, Facebook – OAuth2)
- Đăng ký và xác thực Two-Factor Authentication (2FA – TOTP)
- Quản lý backup codes cho 2FA
- Quên mật khẩu và đặt lại mật khẩu an toàn
- Cập nhật thông tin hồ sơ (tên, mật khẩu, avatar)
- Ghi audit log
- Unit tests và API documentation

Hệ thống được thiết kế phù hợp với stack hiện tại:

- Node.js, NestJS
- MongoDB (Mongoose)
- JWT (access token / refresh token)
- Cloud storage cho avatar (S3 / Cloudinary / GCS)

---

## Supported authentication methods

- Email / phone + password
- Google OAuth2
- Facebook OAuth2

---

## Data model (Mongo / Mongoose – đề xuất)

### User

```ts
interface User {
  _id: ObjectId;

  email?: string;
  phone?: string;

  passwordHash?: string;

  fullName?: string;
  avatarUrl?: string;

  authProviders: {
    google?: {
      providerId: string;
      email?: string;
    };
    facebook?: {
      providerId: string;
      email?: string;
    };
  };

  twoFactorEnabled: boolean;
  twoFactorSecret?: string; // encrypted / sealed

  createdAt: Date;
  updatedAt: Date;
}
