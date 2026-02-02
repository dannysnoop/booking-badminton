---
name: "[Phase 2.2] Implement Court Detail View"
about: Detailed court information with images, pricing, reviews, availability
title: "[Phase 2.2] Implement Court Detail View"
labels: court-details, enhancement, phase-2
assignees: ''
---

## Mô tả
Xây dựng trang chi tiết sân với đầy đủ thông tin, hình ảnh, giá, đánh giá và lịch trống.

## Yêu cầu chức năng

### 1. Basic Information Section
- [ ] Tên sân
- [ ] Địa chỉ đầy đủ
- [ ] Số điện thoại liên hệ
- [ ] Email liên hệ
- [ ] Giờ mở cửa (theo ngày trong tuần)
- [ ] Social media links
- [ ] Share buttons (Facebook, Zalo, Copy link)

### 2. Image and Video Gallery
- [ ] Main featured image
- [ ] Image carousel/gallery (10-20 ảnh)
- [ ] Video preview/player
- [ ] Lightbox view cho images
- [ ] Upload từ admin panel
- [ ] Lazy loading cho images
- [ ] Image optimization (multiple sizes)

### 3. Pricing Table
- [ ] Bảng giá theo khung giờ:
  - Morning (6h-11h)
  - Afternoon (12h-17h)
  - Evening (18h-22h)
  - Late night (23h-6h)
- [ ] Giá theo ngày thường/cuối tuần
- [ ] Giá theo loại sân (nếu có nhiều loại)
- [ ] Giá đặc biệt theo sự kiện/lễ
- [ ] Display discounts/promotions
- [ ] Price comparison với sân nearby

### 4. Amenities/Facilities
- [ ] Icon-based amenities display:
  - Bãi đỗ xe
  - Phòng thay đồ
  - Căng tin/quán nước
  - Wifi miễn phí
  - Điều hòa
  - Cho thuê dụng cụ
  - Tủ khóa
  - Nhà vệ sinh
  - Khu vực chờ
- [ ] Description cho mỗi amenity

### 5. Reviews and Ratings
- [ ] Overall rating (1-5 stars)
- [ ] Rating breakdown:
  - Chất lượng sân
  - Dịch vụ
  - Vị trí
  - Giá cả
  - Vệ sinh
- [ ] Total reviews count
- [ ] Reviews list với:
  - User name và avatar
  - Rating
  - Comment text
  - Images (nếu có)
  - Date
  - Helpful votes
- [ ] Filter reviews (highest/lowest rating, recent)
- [ ] Pagination cho reviews
- [ ] Report inappropriate review

### 6. Real-time Availability Calendar
- [ ] Calendar view (monthly/weekly/daily)
- [ ] Color-coded time slots:
  - Available (green)
  - Booked (red)
  - Partially available (yellow)
  - Not available (grey)
- [ ] Click slot to select and book
- [ ] Show price per slot
- [ ] Show number of courts available
- [ ] Auto-refresh availability
- [ ] Multiple courts booking

### 7. Quick Booking Widget
- [ ] Date picker
- [ ] Time slot selector
- [ ] Number of hours
- [ ] Total price calculation
- [ ] "Book Now" button
- [ ] "Add to Cart" (nếu có multiple bookings)
- [ ] Login required check

### 8. Additional Information
- [ ] Court rules và policies
- [ ] Cancellation policy
- [ ] Payment methods accepted
- [ ] How to get there (directions)
- [ ] Nearby facilities (restaurants, hotels)
- [ ] FAQs section

### 9. Related Courts Section
- [ ] "Similar courts" carousel
- [ ] "Nearby courts" list
- [ ] "Frequently booked together"

### 10. Database Schema
- [ ] Bảng court_images:
  - id, court_id, image_url, display_order, is_featured
- [ ] Bảng court_videos:
  - id, court_id, video_url, thumbnail_url
- [ ] Bảng court_amenities:
  - id, court_id, amenity_type, description
- [ ] Bảng court_pricing:
  - id, court_id, day_type, time_slot, price
- [ ] Bảng court_reviews:
  - id, court_id, user_id, rating, comment, images, created_at
- [ ] Bảng court_availability:
  - id, court_id, date, time_slot, status, booking_id

### 11. API Endpoints
- [ ] GET /api/courts/:id - Chi tiết sân
- [ ] GET /api/courts/:id/pricing - Bảng giá
- [ ] GET /api/courts/:id/availability?date=YYYY-MM-DD - Lịch trống
- [ ] GET /api/courts/:id/reviews?page=1&limit=10 - Reviews
- [ ] POST /api/courts/:id/reviews - Thêm review
- [ ] GET /api/courts/:id/related - Sân liên quan

### 12. Frontend Components
- [ ] CourtHeader component
- [ ] ImageGallery component
- [ ] PricingTable component
- [ ] AmenitiesList component
- [ ] ReviewsList component
- [ ] AvailabilityCalendar component
- [ ] QuickBooking component
- [ ] RelatedCourts component

### 13. SEO Optimization
- [ ] Meta tags (title, description)
- [ ] Open Graph tags
- [ ] Schema.org markup (LocalBusiness)
- [ ] Clean URLs
- [ ] Sitemap entry

### 14. Testing
- [ ] Unit tests cho components
- [ ] API integration tests
- [ ] E2E tests cho booking flow
- [ ] Performance tests
- [ ] Accessibility tests

## Tiêu chí chấp nhận
- [ ] Tất cả thông tin hiển thị đầy đủ
- [ ] Image gallery hoạt động mượt
- [ ] Pricing table rõ ràng
- [ ] Reviews display đúng và có pagination
- [ ] Availability calendar real-time
- [ ] Quick booking hoạt động
- [ ] Mobile responsive hoàn toàn
- [ ] Page load < 3 seconds
- [ ] Tests pass 100%

## Phụ thuộc
- Issue #[Phase 2.1] - Court Search (data model)

## Công nghệ đề xuất
- Image gallery: react-image-gallery, photoswipe
- Calendar: react-big-calendar, fullcalendar
- Rating: react-rating-stars
- Charts: Chart.js (rating breakdown)
- CDN: Cloudinary, AWS S3 + CloudFront

## Ước lượng
- Effort: 10-14 days
- Priority: High (P0)

## Ghi chú
- Availability calendar là phần phức tạp nhất
- Cân nhắc WebSocket cho real-time updates
- Image optimization quan trọng cho performance
