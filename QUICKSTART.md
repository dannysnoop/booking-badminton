# Quick Start Guide - Booking Badminton Backend

## 🚀 Quick Start (5 minutes)

### Prerequisites
- Node.js 18+ installed
- Docker installed (for MongoDB and Redis)

### Step 1: Clone and Install
```bash
git clone https://github.com/dannysnoop/booking-badminton.git
cd booking-badminton
npm install
```

### Step 2: Start Dependencies (Docker)
```bash
# Start MongoDB
docker run -d -p 27017:27017 --name booking-mongodb mongo:6

# Start Redis
docker run -d -p 6379:6379 --name booking-redis redis:6
```

### Step 3: Configure Environment
```bash
cp .env.example .env
# Edit .env if needed (defaults work for local Docker setup)
```

### Step 4: Start the Application
```bash
npm run start:dev
```

### Step 5: Access the API
- **API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api/docs

## 📝 Test the API

### Register a User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "phone": "0912345678",
    "password": "SecurePass123!",
    "fullName": "Nguyễn Văn A"
  }'
```

**Response:** You'll get a `userId` and the system will log the OTP to console (check terminal).

### Verify OTP
```bash
# Replace {userId} and {code} with actual values from registration response and console log
curl -X POST http://localhost:3000/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "{userId}",
    "code": "{code}"
  }'
```

### Resend OTP
```bash
curl -X POST http://localhost:3000/api/auth/resend-otp \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "{userId}",
    "type": "email"
  }'
```

## 🧪 Run Tests
```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🛠️ Development Tips

### Check Logs
```bash
# The OTP codes are logged to console in development mode
# Look for lines like: [EMAIL] Sending OTP 123456 to user@example.com
```

### Swagger UI
Visit http://localhost:3000/api/docs to test all endpoints interactively.

### MongoDB GUI
```bash
# Use MongoDB Compass or Studio 3T
# Connection string: mongodb://localhost:27017
# Database: booking_badminton
```

### Redis CLI
```bash
# Connect to Redis
docker exec -it booking-redis redis-cli

# List all keys
KEYS *

# Check OTP cache
GET otp:{userId}:email

# Check rate limits
GET rate_limit:register:{ip}
```

## 🔧 Troubleshooting

### Port already in use
```bash
# Change PORT in .env file
PORT=3001
```

### MongoDB connection failed
```bash
# Check if MongoDB is running
docker ps | grep booking-mongodb

# Restart MongoDB
docker restart booking-mongodb
```

### Redis connection failed
```bash
# Check if Redis is running
docker ps | grep booking-redis

# Restart Redis
docker restart booking-redis
```

### Clear all data
```bash
# MongoDB
docker exec -it booking-mongodb mongosh booking_badminton --eval "db.dropDatabase()"

# Redis
docker exec -it booking-redis redis-cli FLUSHALL
```

## 📚 Next Steps

1. Read the full [SETUP.md](./SETUP.md) for detailed documentation
2. Explore the Swagger documentation at http://localhost:3000/api/docs
3. Check the [API response examples](./SETUP.md#api-endpoints) in SETUP.md
4. Review the [database schema](./SETUP.md#database-schema) documentation

## 🎯 API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/verify | Verify OTP code |
| POST | /api/auth/resend-otp | Resend OTP code |

## ✅ What's Working

- ✅ User registration with validation
- ✅ OTP generation and verification
- ✅ Rate limiting (IP and user-based)
- ✅ Redis caching
- ✅ MongoDB persistence with TTL indexes
- ✅ Comprehensive error handling
- ✅ API documentation (Swagger)
- ✅ 32 unit tests (100% passing)

## 🔜 Coming Soon

- Email integration (SendGrid)
- SMS integration (Twilio)
- JWT authentication
- Refresh tokens
- Account recovery

## 📞 Support

For issues or questions:
- Create an issue on GitHub
- Check [SETUP.md](./SETUP.md) for detailed documentation
- Review test files in `src/auth/tests/` for usage examples

---

Happy coding! 🎉
