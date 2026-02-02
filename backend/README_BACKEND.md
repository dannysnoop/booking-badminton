# Backend - Booking Badminton API

NestJS backend application for the Booking Badminton platform.

## Features

- ✅ User Registration with email and phone validation
- ✅ Password hashing with bcrypt
- ✅ PostgreSQL database with TypeORM
- ✅ API documentation with Swagger
- ✅ Global validation pipes
- ✅ Error handling and response formatting
- ✅ Unit and E2E tests

## Prerequisites

- Node.js 18+ 
- PostgreSQL 15+
- npm or yarn

## Installation

```bash
# Install dependencies
npm install
```

## Configuration

Create a `.env` file in the root directory:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/booking_badminton
PORT=3000
NODE_ENV=development
BCRYPT_SALT_ROUNDS=10
```

## Database Setup

### Option 1: Using Docker Compose (Recommended)

```bash
# Start PostgreSQL database
docker-compose up -d

# Stop database
docker-compose down
```

### Option 2: Local PostgreSQL

1. Install PostgreSQL 15+
2. Create database:
```sql
CREATE DATABASE booking_badminton;
```
3. Update `.env` with your database credentials

## Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The API will be available at:
- API: http://localhost:3000/api
- Swagger Documentation: http://localhost:3000/api/docs

## Testing

```bash
# Unit tests
npm test

# E2E tests (requires database)
npm run test:e2e

# Test coverage
npm run test:cov
```

## API Endpoints

### Authentication

#### POST /api/auth/register

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "phone": "0912345678",
  "password": "Password123!",
  "fullName": "Nguyễn Văn A"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "email": "user@example.com",
    "phone": "0912345678",
    "fullName": "Nguyễn Văn A"
  },
  "message": "Đăng ký thành công. Vui lòng xác thực tài khoản."
}
```

**Error Responses:**
- `400 Bad Request`: Invalid input data
- `409 Conflict`: Email or phone already exists

## Validation Rules

### Email
- Must be a valid email format
- Cannot be empty

### Phone
- Must match Vietnamese phone format: `0[0-9]{9,10}` or `+84[0-9]{9,10}`
- Cannot be empty

### Password
- Minimum 8 characters
- Must contain uppercase letter
- Must contain lowercase letter
- Must contain number or special character

### Full Name
- Minimum 2 characters
- Cannot be empty

## Project Structure

```
backend/
├── src/
│   ├── auth/                   # Authentication module
│   │   ├── dto/               # Data Transfer Objects
│   │   ├── entities/          # TypeORM entities
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── common/                # Shared utilities
│   │   ├── filters/           # Exception filters
│   │   └── interceptors/      # Response interceptors
│   ├── config/                # Configuration
│   ├── database/              # Database setup
│   │   └── migrations/        # Database migrations
│   ├── app.module.ts
│   └── main.ts
├── test/                      # E2E tests
├── docker-compose.yml         # Docker setup
└── package.json
```

## Development

```bash
# Lint code
npm run lint

# Format code
npm run format

# Build
npm run build
```

## Security Features

- Passwords are hashed using bcrypt (salt rounds: 10)
- Passwords are never returned in API responses
- Email and phone have unique constraints with indexes
- Input validation on all endpoints
- CORS enabled
- Global exception handling

## Technology Stack

- **Framework**: NestJS 11.x
- **Language**: TypeScript 5.x
- **Database**: PostgreSQL 15+
- **ORM**: TypeORM 0.3.x
- **Validation**: class-validator, class-transformer
- **Password Hashing**: bcrypt
- **API Documentation**: @nestjs/swagger
- **Testing**: Jest

## License

UNLICENSED
