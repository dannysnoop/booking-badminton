# Ứng Dụng Đặt Lịch Sân Thể Thao

## Giới thiệu

Ứng dụng Đặt Lịch Sân Thể Thao là một nền tảng số hóa giúp người dùng dễ dàng tìm kiếm, đặt lịch và quản lý việc thuê sân thể thao (cầu lông, bóng đá, tennis, v.v.). Ứng dụng cung cấp trải nghiệm tiện lợi cho cả người dùng cá nhân và nhóm, đồng thời hỗ trợ quản trị viên trong việc quản lý sân, booking và thống kê doanh thu hiệu quả.

## Các Nghiệp Vụ Chính

### 1. Đăng ký / Đăng nhập / Xác thực

**Mục đích:** Quản lý tài khoản người dùng, đảm bảo bảo mật thông tin và cá nhân hóa trải nghiệm.

**Các bước thực hiện:**
- **Đăng ký tài khoản mới:**
  - Người dùng nhập thông tin: email, số điện thoại, mật khẩu, họ tên
  - Hệ thống gửi email/SMS xác thực
  - Người dùng xác nhận qua link hoặc mã OTP
  - Tài khoản được kích hoạt

- **Đăng nhập:**
  - Người dùng nhập email/số điện thoại và mật khẩu
  - Hệ thống xác thực thông tin
  - Tạo phiên đăng nhập (session/token)
  - Chuyển hướng đến trang chủ

- **Xác thực nâng cao:**
  - Hỗ trợ đăng nhập qua mạng xã hội (Google, Facebook)
  - Xác thực hai yếu tố (2FA) cho bảo mật cao
  - Quên mật khẩu: gửi link reset qua email
  - Quản lý thông tin cá nhân và đổi mật khẩu

### 2. Tìm kiếm và xem chi tiết sân

**Mục đích:** Giúp người dùng dễ dàng tìm kiếm và lựa chọn sân thể thao phù hợp với nhu cầu.

**Các bước thực hiện:**
- **Tìm kiếm sân:**
  - Người dùng nhập bộ lọc: vị trí, loại sân, khoảng giá, thời gian
  - Hệ thống hiển thị danh sách sân phù hợp
  - Xem sân trên bản đồ (tích hợp Google Maps)
  - Sắp xếp theo: khoảng cách, giá, đánh giá

- **Xem chi tiết sân:**
  - Thông tin cơ bản: tên, địa chỉ, số điện thoại, giờ mở cửa
  - Hình ảnh và video sân
  - Bảng giá theo khung giờ
  - Tiện ích: đỗ xe, phòng thay đồ, căng tin
  - Đánh giá và nhận xét từ người dùng khác
  - Lịch trống/đã đặt theo thời gian thực

### 3. Đặt lịch và quản lý lịch

**Mục đích:** Cho phép người dùng đặt lịch thuê sân và quản lý các booking của mình.

**Các bước thực hiện:**
- **Đặt lịch:**
  - Chọn sân từ kết quả tìm kiếm
  - Chọn ngày và khung giờ muốn đặt
  - Kiểm tra tình trạng còn trống
  - Xác nhận thông tin: tên, số điện thoại
  - Chọn phương thức thanh toán (online/offline)
  - Xác nhận đặt lịch và nhận mã booking

- **Quản lý lịch đã đặt:**
  - Xem danh sách lịch: sắp tới, đã chơi, đã hủy
  - Xem chi tiết từng booking
  - Hủy hoặc thay đổi lịch (theo chính sách)
  - Thanh toán booking chưa thanh toán
  - Nhận thông báo nhắc nhở trước giờ chơi
  - Đánh giá và nhận xét sau khi chơi

### 4. Đặt lịch nhóm, mời bạn và chat trao đổi

**Mục đích:** Tạo trải nghiệm xã hội, giúp nhóm bạn dễ dàng tổ chức và phối hợp đặt sân.

**Các bước thực hiện:**
- **Tạo booking nhóm:**
  - Người tạo đặt lịch và chọn "Đặt theo nhóm"
  - Nhập số lượng thành viên tham gia
  - Chọn cách chia tiền (đều/tùy chỉnh)
  - Tạo link mời hoặc danh sách thành viên

- **Mời bạn tham gia:**
  - Gửi lời mời qua app, SMS, hoặc link chia sẻ
  - Bạn bè xác nhận tham gia
  - Hệ thống cập nhật số lượng và phân chia chi phí
  - Thông báo cho tất cả thành viên khi có thay đổi

- **Chat và trao đổi:**
  - Tạo nhóm chat cho mỗi booking
  - Trao đổi về thời gian, cách chơi, chia đội
  - Chia sẻ hình ảnh, video
  - Thông báo tự động về booking cho nhóm
  - Lưu lịch sử tin nhắn

### 5. Quản trị viên quản lý sân, booking và thống kê

**Mục đích:** Cung cấp công cụ quản lý toàn diện cho chủ sân và quản trị viên.

**Các bước thực hiện:**
- **Quản lý thông tin sân:**
  - Thêm/sửa/xóa sân và thông tin chi tiết
  - Cập nhật hình ảnh, tiện ích, giá
  - Cài đặt lịch hoạt động và ngày nghỉ
  - Quản lý bảng giá theo khung giờ và ngày đặc biệt

- **Quản lý booking:**
  - Xem tất cả booking theo ngày/tuần/tháng
  - Xác nhận/từ chối booking
  - Cập nhật trạng thái: đã checkin, hoàn thành, hủy
  - Xử lý hoàn tiền và khiếu nại
  - Ghi chú nội bộ cho từng booking

- **Thống kê và báo cáo:**
  - Doanh thu theo ngày/tuần/tháng/năm
  - Tỷ lệ lấp đầy sân
  - Phân tích khách hàng: mới, quay lại, VIP
  - Thống kê khung giờ hot/vắng
  - Báo cáo đánh giá và phản hồi khách hàng
  - Xuất báo cáo Excel/PDF

- **Quản lý khuyến mãi:**
  - Tạo mã giảm giá, voucher
  - Thiết lập chương trình khách hàng thân thiết
  - Gửi thông báo khuyến mãi đến người dùng

## Công nghệ và Kiến trúc

### Backend (Phase 1.1 - Implemented ✅)
- **Framework**: NestJS 10.x with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Cache**: Redis for OTP and rate limiting
- **Validation**: class-validator, class-transformer
- **Security**: bcrypt password hashing, rate limiting
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Jest (32 unit tests, 100% passing)

### Status
- ✅ Phase 1.1: User Registration System - **COMPLETED**
- 📋 Phase 1.2: Email/SMS Verification - In Progress
- 📋 Phase 1.3: Login System - Planned
- 📋 Phase 1.4: Advanced Authentication - Planned

## Hướng dẫn Cài đặt

### Quick Start (5 minutes)
See [QUICKSTART.md](./QUICKSTART.md) for a quick getting-started guide.

### Detailed Setup
See [SETUP.md](./SETUP.md) for comprehensive installation and configuration instructions.

### Prerequisites
- Node.js 18+ 
- MongoDB 6+
- Redis 6+
- Docker (recommended for local development)

### Installation
```bash
# Clone repository
git clone https://github.com/dannysnoop/booking-badminton.git
cd booking-badminton

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Start dependencies (Docker)
docker run -d -p 27017:27017 --name booking-mongodb mongo:6
docker run -d -p 6379:6379 --name booking-redis redis:6

# Start application
npm run start:dev

# Access API
# - API: http://localhost:3000
# - Swagger Docs: http://localhost:3000/api/docs
```

### Testing
```bash
# Run all tests
npm test

# Run with coverage
npm run test:cov

# Run E2E tests
npm run test:e2e
```

## API Documentation

API documentation is available at http://localhost:3000/api/docs when running the application.

### Implemented Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/verify` - Verify OTP code
- `POST /api/auth/resend-otp` - Resend OTP code

See [SETUP.md](./SETUP.md#api-endpoints) for detailed API documentation with request/response examples.

## Đóng góp

Chúng tôi luôn chào đón mọi đóng góp từ cộng đồng. Vui lòng tạo Pull Request hoặc Issues để đề xuất cải tiến.

## Liên hệ

(Thông tin liên hệ sẽ được cập nhật)