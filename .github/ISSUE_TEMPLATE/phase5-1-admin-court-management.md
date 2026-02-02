---
name: "[Phase 5.1] Admin - Court Management"
about: Admin panel for managing courts, pricing, and schedules
title: "[Phase 5.1] Admin - Court Management"
labels: admin, court-management, enhancement, phase-5
assignees: ''
---

## Mô tả
Xây dựng panel quản trị để quản lý thông tin sân, giá cả, lịch hoạt động và tiện ích.

## Yêu cầu chức năng

### 1. Court CRUD Operations
- [ ] List all courts:
  - Table view với sorting
  - Search by name, address
  - Filter by city, type, status
  - Pagination
  - Bulk actions
- [ ] Create new court:
  - Court information form
  - Validation
  - Save to database
- [ ] Edit court:
  - Pre-filled form
  - Update information
  - Track changes (audit log)
- [ ] Delete court:
  - Soft delete (archive)
  - Cannot delete if has active bookings
  - Confirmation dialog
- [ ] Restore archived court

### 2. Court Information Management
- [ ] Basic info:
  - Name (required)
  - Type (dropdown: cầu lông, bóng đá, tennis, etc.)
  - Description (rich text editor)
  - Address (full address)
  - City, District, Ward (cascading dropdowns)
  - Latitude/Longitude (map picker)
  - Phone number
  - Email
  - Website
- [ ] Operating hours:
  - Opening time
  - Closing time
  - Different hours cho weekday/weekend
  - Add special hours cho holidays
- [ ] Court details:
  - Number of courts
  - Surface type
  - Indoor/Outdoor
  - Court dimensions
  - Max players per court

### 3. Image & Video Management
- [ ] Upload images:
  - Drag & drop interface
  - Multiple file upload
  - Image preview
  - Crop/resize tool
  - Set featured image
  - Reorder images (drag & drop)
  - Delete images
  - Max 20 images per court
- [ ] Upload videos:
  - Video upload (max 100MB)
  - YouTube/Vimeo embed
  - Thumbnail selection
  - Delete videos
- [ ] Media library:
  - View all media
  - Filter by court
  - Bulk delete

### 4. Pricing Management
- [ ] Create pricing rules:
  - Time slot based:
    - Morning (6h-11h)
    - Afternoon (12h-17h)
    - Evening (18h-22h)
    - Late night (23h-6h)
  - Day type:
    - Weekday
    - Weekend
    - Holiday
  - Price per hour
  - Minimum hours
- [ ] Special pricing:
  - Specific dates (Tết, special events)
  - Date range pricing
  - Peak season pricing
  - Dynamic pricing (optional)
- [ ] Pricing table view:
  - Calendar view
  - Matrix view (time x day type)
  - Edit inline
  - Bulk update
- [ ] Price history tracking

### 5. Schedule & Availability Management
- [ ] Set operating schedule:
  - Regular schedule (weekly pattern)
  - Special schedules (holidays, events)
- [ ] Holidays/Closure dates:
  - Add closure dates
  - Full day or partial hours
  - Reason for closure
  - Notify users with bookings
- [ ] Block time slots:
  - Maintenance
  - Private events
  - Emergency closure
  - Manual booking block
- [ ] Override availability:
  - Open on normally closed days
  - Extended hours for events

### 6. Amenities Management
- [ ] Amenities checklist:
  - Parking
  - Changing rooms
  - Cafeteria
  - WiFi
  - Air conditioning
  - Equipment rental
  - Lockers
  - Restrooms
  - Waiting area
  - Shower
  - First aid
- [ ] Custom amenities:
  - Add custom amenity
  - Icon selection
  - Description
- [ ] Amenity details:
  - Availability
  - Additional cost
  - Notes

### 7. Court Status Management
- [ ] Status options:
  - Active (accepting bookings)
  - Inactive (not visible)
  - Under maintenance
  - Temporarily closed
  - Coming soon
- [ ] Status change:
  - Update status
  - Set end date for temporary status
  - Automatic status change
  - Notification to affected users

### 8. Multi-location Management
- [ ] Court groups/chains:
  - Create chain/franchise
  - Link multiple courts
  - Shared settings option
  - Bulk operations
- [ ] Copy court settings:
  - Clone court configuration
  - Copy pricing to another court
  - Copy amenities

### 9. Database Schema (Admin focused)
- [ ] Bảng court_audit_log:
  - id
  - court_id
  - admin_user_id
  - action (create/update/delete)
  - field_changed
  - old_value
  - new_value
  - timestamp
- [ ] Bảng court_closure_dates:
  - id
  - court_id
  - closure_date
  - start_time (nullable)
  - end_time (nullable)
  - reason
  - created_by_admin_id
  - created_at
- [ ] Bảng court_pricing_history:
  - id
  - court_pricing_id
  - price
  - effective_from
  - effective_to
  - created_at

### 10. API Endpoints (Admin)
- [ ] GET /api/admin/courts - List với filters
- [ ] POST /api/admin/courts - Create court
- [ ] GET /api/admin/courts/:id - Get details
- [ ] PUT /api/admin/courts/:id - Update court
- [ ] DELETE /api/admin/courts/:id - Soft delete
- [ ] POST /api/admin/courts/:id/restore - Restore
- [ ] POST /api/admin/courts/:id/images - Upload images
- [ ] DELETE /api/admin/courts/:id/images/:imageId
- [ ] PUT /api/admin/courts/:id/pricing - Update pricing
- [ ] POST /api/admin/courts/:id/closures - Add closure
- [ ] GET /api/admin/courts/:id/audit-log - Get changes

### 11. Frontend Components (Admin Panel)
- [ ] CourtListTable component
- [ ] CourtForm component
- [ ] ImageUploader component
- [ ] PricingEditor component
- [ ] ScheduleEditor component
- [ ] AmenitiesSelector component
- [ ] ClosureDatePicker component
- [ ] MapPicker component (for lat/lng)
- [ ] RichTextEditor component

### 12. Permissions & Roles
- [ ] Admin roles:
  - Super Admin (full access)
  - Court Manager (own courts only)
  - Staff (limited access)
- [ ] Permission checks on all actions
- [ ] Audit logging for all changes

### 13. Validation & Error Handling
- [ ] Form validation:
  - Required fields
  - Format validation
  - Business rules
- [ ] Error messages:
  - User-friendly
  - Specific errors
- [ ] Prevent data loss:
  - Unsaved changes warning
  - Auto-save drafts

### 14. Testing
- [ ] Unit tests cho CRUD operations
- [ ] Test pricing calculations
- [ ] Test image upload/resize
- [ ] Test permissions
- [ ] Integration tests cho admin APIs
- [ ] E2E tests cho admin workflows

## Tiêu chí chấp nhận
- [ ] CRUD operations hoạt động đầy đủ
- [ ] Image/video upload và management works
- [ ] Pricing configuration flexible và accurate
- [ ] Schedule management complete
- [ ] Amenities management works
- [ ] Audit logging captures all changes
- [ ] Admin UI intuitive và responsive
- [ ] Tests pass 100%
- [ ] Permission system secure

## Phụ thuộc
- Issue #[Phase 2.1] - Court Search (data model)
- Issue #[Phase 2.2] - Court Details (display)

## Công nghệ đề xuất
- Admin UI: React Admin, Vue Admin, Ant Design Pro
- Rich text: Quill, TinyMCE, Draft.js
- Image processing: Sharp, Jimp
- File upload: Multer, Formidable
- Map: Leaflet, Google Maps Picker

## Ước lượng
- Effort: 14-21 days
- Priority: High (P0)

## Ghi chú
- Admin panel cần authentication và authorization
- Consider using existing admin framework
- Image optimization critical for performance
- Audit log important for compliance
