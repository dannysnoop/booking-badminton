---
name: "[Phase 1.4] Advanced Authentication Features"
about: Social login, 2FA, forgot password, profile management
title: "[Phase 1.4] Advanced Authentication Features"
labels: authentication, enhancement, phase-1
assignees: ''
---

## Mô tả
Implement các tính năng xác thực nâng cao: đăng nhập mạng xã hội, 2FA, quên mật khẩu, và quản lý profile.

## Yêu cầu chức năng

### 1. Social Login (Google & Facebook)
- [ ] OAuth 2.0 integration với Google:
  - Register OAuth app trên Google Cloud Console
  - Implement OAuth flow
  - Get user info từ Google
  - Map Google user tới local user
- [ ] OAuth integration với Facebook:
  - Register app trên Facebook Developers
  - Implement Facebook Login
  - Get user profile
- [ ] Link/unlink social accounts
- [ ] Handle existing email conflicts

### 2. Two-Factor Authentication (2FA)
- [ ] Generate TOTP secret cho user
- [ ] QR code generation (Google Authenticator, Authy)
- [ ] Verify TOTP code
- [ ] Backup codes (10 codes, single-use)
- [ ] Enable/disable 2FA
- [ ] Force 2FA cho admin users
- [ ] Recovery process nếu mất device

### 3. Forgot Password
- [ ] Request password reset:
  - Input: email/phone
  - Generate unique reset token
  - Send reset link via email
  - Token expires sau 1 giờ
- [ ] Reset password page:
  - Validate reset token
  - Input new password
  - Update password hash
  - Invalidate token
  - Notify user via email
- [ ] Security:
  - Rate limit reset requests
  - Log all password changes

### 4. Profile Management
- [ ] View profile:
  - GET /api/user/profile
  - Return user info (không có password)
- [ ] Update profile:
  - PUT /api/user/profile
  - Update: full_name, phone, avatar
  - Validate changes
- [ ] Change password:
  - POST /api/user/change-password
  - Verify old password
  - Validate new password
  - Update password hash
  - Invalidate all sessions/tokens
  - Notify via email
- [ ] Upload avatar:
  - Image upload
  - Resize và optimize
  - Store on CDN/S3
  - Update user avatar_url

### 5. Database Schema Updates
- [ ] Bảng users - thêm columns:
  - google_id (nullable, unique)
  - facebook_id (nullable, unique)
  - avatar_url
  - two_factor_enabled (boolean)
  - two_factor_secret
- [ ] Bảng password_reset_tokens:
  - id
  - user_id
  - token (unique, indexed)
  - expires_at
  - used (boolean)
  - created_at
- [ ] Bảng backup_codes:
  - id
  - user_id
  - code (hashed)
  - used (boolean)
  - created_at

### 6. API Endpoints
- [ ] POST /api/auth/google - Google OAuth callback
- [ ] POST /api/auth/facebook - Facebook OAuth callback
- [ ] POST /api/auth/2fa/enable - Enable 2FA
- [ ] POST /api/auth/2fa/verify - Verify 2FA code
- [ ] POST /api/auth/2fa/disable - Disable 2FA
- [ ] POST /api/auth/forgot-password - Request reset
- [ ] POST /api/auth/reset-password - Reset password
- [ ] GET /api/user/profile - Get profile
- [ ] PUT /api/user/profile - Update profile
- [ ] POST /api/user/change-password - Change password
- [ ] POST /api/user/avatar - Upload avatar

### 7. Testing
- [ ] Mock OAuth providers
- [ ] Test 2FA flow
- [ ] Test forgot password flow
- [ ] Test profile updates
- [ ] Test password change
- [ ] Integration tests cho tất cả endpoints

## Tiêu chí chấp nhận
- [ ] Google và Facebook login hoạt động
- [ ] 2FA setup và verify đúng
- [ ] Forgot password flow hoàn chỉnh
- [ ] Profile management hoạt động
- [ ] Password change secure và đúng
- [ ] Tests pass 100%
- [ ] Security review passed

## Phụ thuộc
- Issue #[Phase 1.1] - User Registration
- Issue #[Phase 1.2] - Email/SMS Verification
- Issue #[Phase 1.3] - Login System

## Công nghệ đề xuất
- OAuth: passport-google-oauth20, passport-facebook
- 2FA: speakeasy (TOTP), qrcode
- Image: sharp, multer, AWS S3
- Email templates: handlebars, mjml

## Ước lượng
- Effort: 7-10 days
- Priority: Medium (P1)

## Ghi chú
- Social login có thể làm sau 2FA và forgot password
- 2FA là optional cho users thường, required cho admins
- Backup codes quan trọng cho recovery
