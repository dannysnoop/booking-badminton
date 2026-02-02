---
name: "[Phase 5.2] Admin - Booking Management"
about: Admin panel for managing all bookings and operations
title: "[Phase 5.2] Admin - Booking Management"
labels: admin, booking-management, enhancement, phase-5
assignees: ''
---

## Mô tả
Xây dựng hệ thống quản lý booking cho admin: xem, xác nhận, cập nhật trạng thái, xử lý hoàn tiền và khiếu nại.

## Yêu cầu chức năng

### 1. Booking List & Calendar View
- [ ] List view:
  - Table với all bookings
  - Columns: code, user, court, date, time, status, price
  - Sort by any column
  - Search by code, user, court
  - Advanced filters
  - Bulk actions
  - Export to CSV/Excel
- [ ] Calendar view:
  - Month/week/day view
  - Color-coded by status
  - Drag & drop to reschedule (optional)
  - Filter by court
  - Quick view on hover
  - Click to view details
- [ ] Timeline view:
  - Hourly timeline per court
  - Visual booking blocks
  - Identify gaps/overlaps
  - Optimize scheduling

### 2. Booking Filters
- [ ] Date range filter
- [ ] Status filter:
  - Pending confirmation
  - Confirmed
  - Checked-in
  - Completed
  - Cancelled
  - No-show
- [ ] Court filter (multi-select)
- [ ] Payment status filter:
  - Unpaid
  - Paid
  - Partially paid
  - Refunded
- [ ] User filter (search)
- [ ] Price range filter
- [ ] Group booking filter
- [ ] Source filter (web, app, phone, walk-in)

### 3. Booking Detail View
- [ ] Complete booking information:
  - Booking code
  - User details (link to profile)
  - Court details
  - Date and time
  - Duration
  - Price breakdown
  - Payment info
  - Contact details
  - Special requests/notes
  - Created date
  - Status history
- [ ] Admin actions section
- [ ] Activity timeline
- [ ] Related bookings (same user)

### 4. Confirm/Reject Bookings
- [ ] Manual confirmation:
  - Review booking details
  - Accept button
  - Reject button with reason
  - Send notification to user
- [ ] Auto-confirmation rules:
  - Auto-confirm paid bookings
  - Auto-confirm regular users
  - Require manual review for new users
- [ ] Rejection reasons:
  - Court unavailable
  - Maintenance scheduled
  - User verification issue
  - Suspicious activity
  - Other (text input)

### 5. Update Booking Status
- [ ] Status workflow:
  - Pending → Confirmed
  - Confirmed → Checked-in
  - Checked-in → Completed
  - Any → Cancelled
  - Completed → No-show (if user didn't arrive)
- [ ] Check-in:
  - Scan QR code
  - Manual check-in
  - Record check-in time
  - Mark as checked-in
- [ ] Complete booking:
  - Mark as completed
  - Trigger review request
  - Update court availability
- [ ] Mark no-show:
  - Record no-show
  - Apply no-show policy
  - May charge fee

### 6. Refund Handling
- [ ] View refund requests:
  - List pending refunds
  - Review reason
  - Check cancellation policy
  - Calculate refund amount
- [ ] Process refund:
  - Approve/reject refund
  - Adjust refund amount
  - Add admin notes
  - Process payment refund
  - Update booking status
  - Send confirmation to user
- [ ] Refund tracking:
  - Refund status
  - Refund amount
  - Processing date
  - Transaction ID
- [ ] Refund reports:
  - Total refunds
  - Refund rate
  - Common reasons

### 7. Complaint Handling
- [ ] Complaint form:
  - Link from booking
  - Complaint type
  - Description
  - Severity
  - Attachments
- [ ] Complaint management:
  - View all complaints
  - Assign to admin
  - Add internal notes
  - Change status (new, investigating, resolved)
  - Add resolution
  - Contact user
  - Close complaint
- [ ] Complaint tracking:
  - Response time
  - Resolution time
  - User satisfaction

### 8. Internal Notes
- [ ] Add notes to booking:
  - Text input
  - Note category (general, issue, resolution)
  - Visibility (admin only)
  - Timestamp and author
- [ ] View note history
- [ ] Edit/delete own notes (within time limit)
- [ ] Important note highlight

### 9. Manual Booking Creation
- [ ] Create booking on behalf of user:
  - Select/search user (or create guest)
  - Select court
  - Select date and time
  - Enter contact info
  - Set payment method
  - Add notes
  - Create booking
  - Send confirmation
- [ ] Walk-in bookings:
  - Quick booking form
  - Immediate confirmation
  - Collect payment
  - Check-in automatically
- [ ] Phone bookings:
  - Record caller info
  - Create booking
  - Send SMS confirmation

### 10. Booking Modifications (Admin)
- [ ] Change date/time:
  - Check availability
  - Update booking
  - Notify user
- [ ] Change court:
  - Move to different court
  - Adjust price if needed
- [ ] Add/remove hours
- [ ] Update contact info
- [ ] Apply discount
- [ ] Waive fees

### 11. Database Schema
- [ ] Bảng booking_admin_actions:
  - id
  - booking_id
  - admin_user_id
  - action_type (confirm, reject, refund, modify, etc.)
  - notes
  - created_at
- [ ] Bảng booking_complaints:
  - id
  - booking_id
  - user_id
  - complaint_type
  - description
  - severity
  - status
  - assigned_to_admin_id
  - resolution
  - created_at
  - resolved_at
- [ ] Bảng booking_notes:
  - id
  - booking_id
  - admin_user_id
  - note
  - note_category
  - created_at
  - updated_at
- [ ] Bảng booking_refunds:
  - id
  - booking_id
  - requested_amount
  - approved_amount
  - status
  - reason
  - admin_notes
  - processed_by_admin_id
  - processed_at

### 12. API Endpoints (Admin)
- [ ] GET /api/admin/bookings - List với filters
- [ ] GET /api/admin/bookings/:id - Get details
- [ ] POST /api/admin/bookings - Create manual booking
- [ ] PUT /api/admin/bookings/:id - Update booking
- [ ] POST /api/admin/bookings/:id/confirm - Confirm
- [ ] POST /api/admin/bookings/:id/reject - Reject
- [ ] POST /api/admin/bookings/:id/check-in - Check-in
- [ ] POST /api/admin/bookings/:id/complete - Complete
- [ ] POST /api/admin/bookings/:id/cancel - Cancel
- [ ] POST /api/admin/bookings/:id/refund - Process refund
- [ ] POST /api/admin/bookings/:id/notes - Add note
- [ ] GET /api/admin/complaints - List complaints
- [ ] PUT /api/admin/complaints/:id - Update complaint

### 13. Frontend Components (Admin)
- [ ] BookingListTable component
- [ ] BookingCalendar component
- [ ] BookingDetailPanel component
- [ ] ConfirmRejectModal component
- [ ] RefundProcessor component
- [ ] ComplaintManager component
- [ ] NotesPanel component
- [ ] ManualBookingForm component
- [ ] TimelineView component

### 14. Notifications & Alerts
- [ ] Real-time notifications:
  - New booking alert
  - Pending confirmation count
  - Upcoming check-ins
  - Overdue payments
  - New complaints
- [ ] Dashboard widgets:
  - Today's bookings count
  - Pending actions count
  - Revenue today
  - Alerts and issues

### 15. Permissions
- [ ] Role-based access:
  - View bookings
  - Confirm/reject bookings
  - Process refunds (may require supervisor)
  - Access complaints
  - Create manual bookings
  - Modify bookings
  - View financial data
- [ ] Court-specific permissions:
  - Managers only see own courts
  - Super admin sees all

### 16. Testing
- [ ] Unit tests cho booking operations
- [ ] Test refund calculations
- [ ] Test status transitions
- [ ] Test permissions
- [ ] Integration tests cho admin APIs
- [ ] E2E tests cho admin workflows

## Tiêu chí chấp nhận
- [ ] Booking list và calendar views hoạt động
- [ ] Filters và search accurate
- [ ] Confirm/reject flow complete
- [ ] Status updates work correctly
- [ ] Refund processing functional
- [ ] Complaint system works
- [ ] Internal notes feature complete
- [ ] Manual booking creation works
- [ ] Permissions enforced
- [ ] Tests pass 100%

## Phụ thuộc
- Issue #[Phase 3.1] - Booking System
- Issue #[Phase 3.2] - Booking Management
- Issue #[Phase 5.1] - Admin Court Management

## Công nghệ đề xuất
- Calendar: FullCalendar, React Big Calendar
- Tables: AG Grid, React Table
- Export: ExcelJS, json2csv
- Real-time: Socket.io, WebSocket
- Charts: Chart.js, Recharts

## Ước lượng
- Effort: 14-21 days
- Priority: High (P0)

## Ghi chú
- Calendar view là feature phức tạp
- Refund processing cần integration với payment gateways
- Real-time updates improve UX significantly
- Export functionality important cho reporting
