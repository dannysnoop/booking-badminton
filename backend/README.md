# Booking Badminton - Backend API

## Phase 1.1: User Registration with OTP Verification

This is the NestJS backend implementation for the user registration system with OTP verification.

## Features

- ✅ User registration with email and phone validation
- ✅ OTP generation and verification (6-digit code)
- ✅ Email/SMS notification system (mocked for testing)
- ✅ Rate limiting protection
- ✅ Duplicate email/phone detection
- ✅ Password hashing with bcrypt
- ✅ Comprehensive error handling
- ✅ Swagger API documentation
- ✅ Unit tests with >80% coverage
- ✅ E2E tests

## Tech Stack

- **Framework**: NestJS 10.x
- **Database**: PostgreSQL with TypeORM
- **Validation**: class-validator, class-transformer
- **Rate Limiting**: @nestjs/throttler
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Jest, Supertest

## Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

## Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your database credentials
```

## Environment Variables

See `.env.example` for all required environment variables:

- Database configuration (PostgreSQL)
- Server configuration
- Security settings (bcrypt salt rounds)
- OTP configuration (expiry time, max attempts, cooldown)
- Email/SMS service credentials (optional for testing)
- Rate limiting settings

## Database Setup

1. Create a PostgreSQL database:
```sql
CREATE DATABASE booking_badminton;
```

2. The application will automatically create tables on startup (synchronize: true in development mode)

### Database Schema

The application creates three main tables:

- **users**: User account information
- **verification_codes**: OTP codes for verification
- **registration_logs**: Audit logs for registration events

## Running the Application

```bash
# Development mode (with auto-reload)
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000`

## API Documentation

Once the server is running, access Swagger documentation at:

```
http://localhost:3000/api/docs
```

## API Endpoints

### 1. Register New User

**POST** `/api/auth/register`

Register a new user account and send OTP verification code.

**Request Body:**
```json
{
  "email": "user@example.com",
  "phone": "0912345678",
  "password": "SecurePass123!",
  "fullName": "Nguyễn Văn A"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "userId": "uuid-here",
    "email": "user@example.com",
    "phone": "0912345678",
    "fullName": "Nguyễn Văn A",
    "status": "pending",
    "expiresAt": "2026-02-02T10:10:00Z"
  },
  "message": "Đăng ký thành công. Vui lòng kiểm tra email/SMS để xác thực tài khoản."
}
```

### 2. Verify OTP

**POST** `/api/auth/verify`

Verify the OTP code to activate the user account.

**Request Body:**
```json
{
  "userId": "uuid-here",
  "code": "123456"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "userId": "uuid-here",
    "email": "user@example.com",
    "status": "verified"
  },
  "message": "Xác thực tài khoản thành công"
}
```

### 3. Resend OTP

**POST** `/api/auth/resend-otp`

Request a new OTP code.

**Request Body:**
```json
{
  "userId": "uuid-here",
  "type": "email"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "expiresAt": "2026-02-02T10:20:00Z",
    "nextResendAt": "2026-02-02T10:11:00Z"
  },
  "message": "Mã OTP mới đã được gửi"
}
```

## Error Responses

All errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": [] // Optional, for validation errors
  }
}
```

### Common Error Codes

- `DUPLICATE_EMAIL`: Email already registered
- `DUPLICATE_PHONE`: Phone number already registered
- `INVALID_OTP`: Incorrect OTP code
- `OTP_EXPIRED`: OTP code has expired
- `TOO_MANY_ATTEMPTS`: Too many failed OTP attempts
- `RATE_LIMIT_EXCEEDED`: Rate limit exceeded
- `VALIDATION_ERROR`: Input validation failed

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Register**: Default throttling (10 requests per 60 seconds)
- **Verify**: Default throttling (10 requests per 60 seconds)
- **Resend OTP**: 1 request per 60 seconds, max 5 per day

## Testing

```bash
# Run unit tests
npm test

# Run unit tests with coverage
npm test -- --coverage --testPathIgnorePatterns='e2e-spec'

# Run specific test file
npm test -- otp.service.spec

# Run E2E tests (requires database)
npm run test:e2e
```

### Test Coverage

Current test coverage (unit tests):
- Services: **95.72%** statement coverage
- Entities: **95.34%** statement coverage
- **26 unit tests** passing
- **14 E2E tests** (11 validation tests passing)

## Project Structure

```
backend/
├── src/
│   ├── auth/
│   │   ├── dto/                    # Data Transfer Objects
│   │   │   ├── register.dto.ts
│   │   │   ├── verify-otp.dto.ts
│   │   │   └── resend-otp.dto.ts
│   │   ├── entities/               # TypeORM entities
│   │   │   ├── user.entity.ts
│   │   │   ├── verification-code.entity.ts
│   │   │   └── registration-log.entity.ts
│   │   ├── services/              # Business logic
│   │   │   ├── auth.service.ts
│   │   │   ├── otp.service.ts
│   │   │   └── notification.service.ts
│   │   ├── tests/                 # Unit tests
│   │   │   ├── auth.service.spec.ts
│   │   │   └── otp.service.spec.ts
│   │   ├── auth.controller.ts
│   │   └── auth.module.ts
│   ├── config/
│   │   └── database.config.ts
│   ├── app.module.ts
│   └── main.ts
├── test/
│   ├── auth.e2e-spec.ts          # E2E tests
│   └── jest-e2e.json
├── .env.example
├── package.json
└── README.md
```

## Security Features

1. **Password Hashing**: Passwords are hashed using bcrypt with 10 salt rounds
2. **OTP Security**: 
   - 6-digit random codes
   - 10-minute expiry
   - Maximum 5 attempts
   - One-time use only
3. **Rate Limiting**: Prevents brute force attacks
4. **Input Validation**: Comprehensive validation using class-validator
5. **Audit Logging**: All registration events are logged

## Validation Rules

### Email
- Must be valid RFC 5322 format
- Required field

### Phone
- Must be Vietnamese format: `0xxx` or `+84xxx`
- Required field

### Password
- Minimum 8 characters
- Must contain uppercase letter
- Must contain lowercase letter
- Must contain number
- Must contain special character

### Full Name
- Minimum 2 characters
- Required field

## Development Notes

1. **Mock Services**: Email and SMS services are mocked in the current implementation. To enable real notifications:
   - Configure SendGrid for email (SENDGRID_API_KEY)
   - Configure Twilio for SMS (TWILIO credentials)
   - Uncomment the implementation in `notification.service.ts`

2. **Database Synchronization**: In production, disable `synchronize` in TypeORM config and use migrations instead

3. **Environment**: Make sure to set `NODE_ENV=production` in production to disable development features

## Future Enhancements

- [ ] Implement real email service integration
- [ ] Implement real SMS service integration
- [ ] Add Redis for OTP and rate limiting storage
- [ ] Add database migrations
- [ ] Add more comprehensive E2E tests with test database
- [ ] Add logging middleware
- [ ] Add health check endpoints

## License

MIT

## Support

For issues and questions, please create an issue in the GitHub repository.
