---
name: "[Phase 3.2] Implement Booking Management"
about: View, manage, cancel, modify, and review bookings
title: "[Phase 3.2] Implement Booking Management"
labels: booking, enhancement, phase-3
assignees: ''
---

## Mô tả
Xây dựng hệ thống quản lý booking cho người dùng: xem danh sách, chi tiết, hủy, thay đổi, thanh toán và đánh giá.

## Yêu cầu chức năng

### 1. Booking List View
- [ ] Tabs/Filters theo status:
  - Sắp tới (Upcoming)
  - Đã chơi (Completed)
  - Đã hủy (Cancelled)
  - Tất cả (All)
- [ ] Display info cho mỗi booking:
  - Court name và image
  - Booking code
  - Date và time
  - Price
  - Status badge
  - Quick actions (view, cancel, review)
- [ ] Sort options:
  - Date (mới nhất, cũ nhất)
  - Price (cao -> thấp, thấp -> cao)
  - Status
- [ ] Pagination hoặc infinite scroll
- [ ] Empty state khi không có bookings
- [ ] Filter by date range

### 2. Booking Detail View
- [ ] Full booking information:
  - Booking code (QR code)
  - Court details với link
  - Date và time slots
  - Duration
  - Contact information
  - Total price breakdown
  - Payment method và status
  - Booking status
  - Created date
  - Notes
- [ ] Action buttons:
  - View on map
  - Get directions
  - Contact court
  - Add to calendar
  - Share booking
  - Print/Download receipt
- [ ] Timeline/History:
  - Booking created
  - Payment confirmed
  - Reminders sent
  - Status changes
  - Cancellation (if any)

### 3. Cancel Booking
- [ ] Cancellation policy display
- [ ] Calculate refund amount:
  - Full refund (> 24h trước)
  - Partial refund (12-24h trước)
  - No refund (< 12h trước)
  - Policy customizable per court
- [ ] Cancellation reason selection:
  - Change of plans
  - Weather
  - Emergency
  - Found better court
  - Other (text input)
- [ ] Confirmation dialog
- [ ] Process cancellation:
  - Update booking status
  - Free up time slot
  - Process refund (if applicable)
  - Send notification email/SMS
- [ ] Cannot cancel if:
  - Already played
  - Too close to booking time
  - Already cancelled

### 4. Modify Booking
- [ ] Change date/time:
  - Check new availability
  - Calculate price difference
  - Charge/refund difference
  - Update booking
- [ ] Modify duration:
  - Add/remove hours
  - Update price
- [ ] Change contact information
- [ ] Modification policy:
  - Free 1 modification
  - Fee for subsequent changes
  - Cannot modify < 6h before

### 5. Payment for Unpaid Bookings
- [ ] Show unpaid bookings prominently
- [ ] Payment deadline display
- [ ] "Pay Now" button
- [ ] Redirect to payment gateway
- [ ] Handle payment callback
- [ ] Auto-cancel if not paid by deadline
- [ ] Send payment reminders

### 6. Reminder Notifications
- [ ] Schedule reminders:
  - 1 day before: Email + Push
  - 2 hours before: SMS + Push
  - 30 minutes before: Push notification
- [ ] Reminder content:
  - Booking details
  - Court address và directions
  - Weather info (optional)
  - Preparation tips
- [ ] User preference:
  - Enable/disable reminders
  - Choose channels
  - Customize timing

### 7. Post-Booking Review
- [ ] Review prompt after booking:
  - Auto-show after end_time
  - Email reminder sau 24h
- [ ] Review form:
  - Overall rating (1-5 stars)
  - Category ratings:
    - Court quality
    - Service
    - Facilities
    - Value for money
    - Cleanliness
  - Written review (optional)
  - Upload photos (optional, max 5)
  - Anonymous option
- [ ] Submit review:
  - Validate user completed booking
  - One review per booking
  - Cannot edit after 7 days
- [ ] Review display on court detail page

### 8. Booking History & Analytics
- [ ] User statistics:
  - Total bookings
  - Total spent
  - Favorite courts
  - Favorite time slots
  - Booking frequency
- [ ] Charts:
  - Bookings per month
  - Spending over time
- [ ] Export booking history (CSV/PDF)

### 9. Database Schema Updates
- [ ] Bảng bookings - thêm columns:
  - cancellation_reason
  - cancellation_date
  - refund_amount
  - refund_status
  - modification_count
  - last_modified_at
- [ ] Bảng booking_modifications:
  - id
  - booking_id
  - field_changed
  - old_value
  - new_value
  - user_id
  - created_at
- [ ] Bảng booking_reminders:
  - id
  - booking_id
  - type (1day, 2hours, 30mins)
  - sent_at
  - status

### 10. API Endpoints
- [ ] GET /api/bookings - List bookings với filters
- [ ] GET /api/bookings/:id - Booking detail
- [ ] POST /api/bookings/:id/cancel - Cancel booking
- [ ] PUT /api/bookings/:id/modify - Modify booking
- [ ] POST /api/bookings/:id/pay - Pay for unpaid booking
- [ ] POST /api/bookings/:id/review - Submit review
- [ ] GET /api/bookings/:id/receipt - Download receipt
- [ ] GET /api/user/booking-stats - User statistics

### 11. Frontend Components
- [ ] BookingListCard component
- [ ] BookingDetailPage component
- [ ] CancelBookingModal component
- [ ] ModifyBookingModal component
- [ ] ReviewForm component
- [ ] BookingTimeline component
- [ ] BookingStats component

### 12. Email/SMS Templates
- [ ] Cancellation confirmation
- [ ] Modification confirmation
- [ ] Payment reminder
- [ ] Pre-booking reminders (1 day, 2 hours)
- [ ] Review request
- [ ] Receipt

### 13. Background Jobs
- [ ] Schedule reminders job
- [ ] Auto-cancel unpaid bookings job
- [ ] Send review requests job
- [ ] Clean up old booking locks job
- [ ] Update booking statuses job

### 14. Testing
- [ ] Unit tests cho booking logic
- [ ] Test cancellation với different policies
- [ ] Test modification scenarios
- [ ] Test reminder scheduling
- [ ] Integration tests cho APIs
- [ ] E2E tests cho full user journey

## Tiêu chí chấp nhận
- [ ] Booking list hiển thị đầy đủ
- [ ] Detail page có đủ thông tin
- [ ] Cancel booking hoạt động với refund
- [ ] Modify booking works properly
- [ ] Payment for unpaid bookings hoàn chỉnh
- [ ] Reminders được gửi đúng lúc
- [ ] Review system hoạt động
- [ ] Mobile responsive
- [ ] Tests pass 100%

## Phụ thuộc
- Issue #[Phase 3.1] - Booking System

## Công nghệ đề xuất
- Queue: Bull/BullMQ (background jobs)
- Scheduler: node-cron, Agenda
- Email: SendGrid templates
- Push notifications: Firebase Cloud Messaging
- PDF: puppeteer, pdfkit

## Ước lượng
- Effort: 14-21 days
- Priority: High (P0)

## Ghi chú
- Reminder scheduling phức tạp, cần test kỹ
- Cancellation policy phải rõ ràng
- Review system cần moderation
- Export functionality có thể làm sau
