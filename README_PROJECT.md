# Ứng Dụng Đặt Lịch Sân Thể Thao - Booking Badminton

## 📱 Giới thiệu

Ứng dụng Đặt Lịch Sân Thể Thao là một nền tảng số hóa giúp người dùng dễ dàng tìm kiếm, đặt lịch và quản lý việc thuê sân thể thao (cầu lông, bóng đá, tennis, v.v.). 

## 🏗️ Kiến trúc

```
booking-badminton/
├── backend/              # NestJS Backend API
├── .github/             # GitHub workflows and issue templates
└── docs/                # Documentation
```

## 🚀 Quick Start

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Start PostgreSQL database
docker-compose up -d

# Run in development mode
npm run start:dev

# Access API documentation
# http://localhost:3000/api/docs
```

See [backend/README_BACKEND.md](backend/README_BACKEND.md) for detailed backend documentation.

## ✨ Implemented Features

### Phase 1.1: User Registration ✅

- ✅ User registration with email and phone
- ✅ Password hashing with bcrypt
- ✅ Email and phone validation
- ✅ Strong password requirements
- ✅ PostgreSQL database with TypeORM
- ✅ API documentation with Swagger
- ✅ Comprehensive unit and E2E tests
- ✅ Docker setup for database

**API Endpoint**: `POST /api/auth/register`

## 📋 Development Phases

### Completed
- [x] **Phase 1.1**: User Registration - NestJS Backend

### Upcoming
- [ ] **Phase 1.2**: Email/SMS Verification
- [ ] **Phase 1.3**: Login System
- [ ] **Phase 1.4**: Advanced Authentication Features
- [ ] **Phase 2.1**: Court Search
- [ ] **Phase 2.2**: Court Details
- [ ] **Phase 3.1**: Booking System
- [ ] **Phase 3.2**: Booking Management
- [ ] **Phase 4**: Group Booking & Chat
- [ ] **Phase 5**: Admin Panel

## 🛠️ Technology Stack

### Backend
- **Framework**: NestJS 11.x
- **Language**: TypeScript 5.x
- **Database**: PostgreSQL 15+
- **ORM**: TypeORM 0.3.x
- **Validation**: class-validator, class-transformer
- **Password Security**: bcrypt
- **API Docs**: Swagger/OpenAPI
- **Testing**: Jest

## 📖 Documentation

- [Backend Documentation](backend/README_BACKEND.md)
- [API Documentation](http://localhost:3000/api/docs) (when running)
- [Issue Templates](.github/ISSUE_TEMPLATE/)
- [Project Structure](PROJECT_STRUCTURE.md)

## 🔒 Security

- Password hashing with bcrypt (10 salt rounds)
- Email and phone uniqueness validation
- Input validation on all endpoints
- Type-safe TypeScript implementation
- CodeQL security scanning
- No sensitive data in API responses

## 🧪 Testing

```bash
# Backend tests
cd backend

# Unit tests
npm test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

Current test coverage:
- Auth module: 82%
- Overall: 45% (infrastructure files excluded)

## 🤝 Contributing

1. Check [ISSUES_LIST.md](ISSUES_LIST.md) for available tasks
2. Follow [HOW_TO_CREATE_ISSUES.md](HOW_TO_CREATE_ISSUES.md) for creating new issues
3. Create a feature branch
4. Write tests for new features
5. Ensure all tests pass and linting is clean
6. Submit a pull request

## 📝 License

UNLICENSED - Private Project

## 👥 Team

Development team for Booking Badminton platform.

---

**Current Status**: Phase 1.1 Completed ✅  
**Last Updated**: February 2, 2026
