# Authentication & Profile API Documentation

## Overview

This document describes the Authentication and Profile management APIs implemented in Phase 1 & 2.

## Features Implemented

### Phase 1: Registration & OTP Verification
- ✅ User registration with validation
- ✅ Email/Phone duplicate checking
- ✅ Password hashing (bcrypt)
- ✅ OTP generation and verification
- ✅ OTP expiration (10 minutes)
- ✅ Rate limiting for registration and OTP attempts
- ✅ Resend OTP with cooldown (1 minute) and daily limit (5 times)
- ✅ Registration and verification event logging

### Phase 2: Login & Token Management
- ✅ Login with email or phone number
- ✅ JWT access token + refresh token
- ✅ Token refresh endpoint
- ✅ Logout with token revocation
- ✅ User profile endpoint (protected)
- ✅ Account locking after 5 failed login attempts
- ✅ Login event logging
- ✅ JWT authentication middleware

## API Endpoints

### 1. Register User
**POST** `/api/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "phone": "0912345678",
  "password": "SecurePass123!",
  "fullName": "Nguyễn Văn A"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "phone": "0912345678",
    "fullName": "Nguyễn Văn A",
    "status": "pending"
  },
  "message": "Đăng ký thành công. Vui lòng kiểm tra email/SMS để xác thực tài khoản."
}
```

**Validation Rules:**
- Email: Valid email format
- Phone: Vietnamese phone format (0xxxxxxxxx or +84xxxxxxxxx)
- Password: Minimum 8 characters, must contain uppercase, lowercase, number, and special character
- Full Name: Minimum 2 characters

**Rate Limit:** 5 registrations per IP per 15 minutes

---

### 2. Verify OTP
**POST** `/api/auth/verify`

Verify the OTP code sent to user's email/phone.

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "code": "123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "status": "verified"
  },
  "message": "Xác thực tài khoản thành công"
}
```

**Rate Limit:** 10 attempts per user per 5 minutes
**OTP Expiration:** 10 minutes
**Max Wrong Attempts:** 5 times (then need to request new OTP)

---

### 3. Resend OTP
**POST** `/api/auth/resend-otp`

Request a new OTP code.

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "type": "email"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "expiresAt": "2026-02-10T10:30:00.000Z",
    "nextResendAt": "2026-02-10T10:21:00.000Z"
  },
  "message": "Mã OTP mới đã được gửi"
}
```

**Rate Limits:**
- Cooldown: 1 minute between requests
- Daily limit: 5 requests per user per day

---

### 4. Login
**POST** `/api/auth/login`

Login with email or phone number.

**Request Body:**
```json
{
  "username": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "fullName": "Nguyễn Văn A",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresAt": "2026-02-10T11:20:00.000Z"
  },
  "message": "Đăng nhập thành công"
}
```

**Security Rules:**
- User must be verified (status = 'verified')
- User must be active (isActive = true)
- User must not be locked (isLocked = false)
- Account will be locked after 5 failed login attempts

**Error Responses:**
- 401: Invalid credentials
- 401: Account not verified
- 401: Account inactive
- 401: Account locked

---

### 5. Refresh Token
**POST** `/api/auth/refresh`

Get a new access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresAt": "2026-02-10T12:20:00.000Z"
  },
  "message": "Làm mới token thành công"
}
```

**Note:** Old refresh token will be revoked after successful refresh.

---

### 6. Get Profile
**GET** `/api/auth/profile`

Get current user's profile information.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "phone": "0912345678",
    "fullName": "Nguyễn Văn A",
    "status": "verified",
    "isActive": true,
    "isLocked": false
  }
}
```

**Error Responses:**
- 401: Missing or invalid token
- 401: Account inactive
- 401: Account locked
- 401: Account not verified

---

### 7. Logout
**POST** `/api/auth/logout`

Logout and revoke refresh token.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Đăng xuất thành công"
}
```

---

## Authentication

All protected endpoints require a valid JWT access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

**Token Expiration:**
- Access Token: 1 hour (configurable via JWT_EXPIRES_IN)
- Refresh Token: 7 days (configurable via JWT_REFRESH_EXPIRES_IN)

---

## Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "retryAfter": 900
  }
}
```

**Common Error Codes:**
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `DAILY_LIMIT_EXCEEDED`: Daily limit reached
- `VALIDATION_ERROR`: Invalid input data
- `UNAUTHORIZED`: Authentication failed
- `FORBIDDEN`: Access denied

---

## Database Schemas

### User
```typescript
{
  email: string;          // Unique, indexed
  phone: string;          // Unique, indexed
  passwordHash: string;
  fullName: string;
  status: 'pending' | 'verified' | 'locked';
  isActive: boolean;      // Default: true
  isLocked: boolean;      // Default: false
  failedLoginCount: number; // Default: 0
  lockedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
```

### RefreshToken
```typescript
{
  userId: ObjectId;       // Indexed
  tokenHash: string;      // SHA-256 hash
  expiresAt: Date;        // TTL index
  isRevoked: boolean;     // Default: false
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
}
```

### LoginLog
```typescript
{
  userId: ObjectId;       // Indexed
  eventType: string;      // 'login_success', 'login_failed', 'logout', 'token_refresh'
  ipAddress: string;
  userAgent: string;
  metadata: object;       // Additional data
  createdAt: Date;
}
```

---

## Testing

### Run Unit Tests
```bash
npm run test
```

### Run E2E Tests
```bash
npm run test:e2e
```

### Run Tests with Coverage
```bash
npm run test:cov
```

---

## Environment Variables

Required environment variables (see `.env.example`):

```env
# Database
MONGODB_URI=mongodb://localhost:27017/badminton-booking

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_REFRESH_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development
```

---

## Swagger API Documentation

Once the server is running, you can access interactive API documentation at:

```
http://localhost:3000/api
```

This provides a full Swagger UI where you can test all endpoints interactively.

---

## Security Features

1. **Password Hashing**: bcrypt with salt rounds
2. **JWT Authentication**: Access + Refresh token pattern
3. **Token Refresh**: Automatic refresh with token rotation
4. **Account Locking**: After 5 failed login attempts
5. **Rate Limiting**: IP-based rate limiting for sensitive endpoints
6. **OTP Expiration**: 10-minute validity for OTP codes
7. **Refresh Token Hashing**: SHA-256 hash stored in database
8. **Token Revocation**: Logout revokes refresh token
9. **Failed Login Tracking**: Tracks and resets failed attempts
10. **Audit Logging**: All auth events logged to database

---

## Next Steps

Future enhancements may include:
- Password reset flow
- Email verification links (alternative to OTP)
- Two-factor authentication (2FA)
- Social login (Google, Facebook)
- Role-based access control (RBAC)
- Session management
- Device management
- IP whitelist/blacklist

