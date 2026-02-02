---
name: "[Phase 2.1] Implement Court Search Functionality"
about: Search courts with filters, maps, and sorting
title: "[Phase 2.1] Implement Court Search Functionality"
labels: search, enhancement, phase-2
assignees: ''
---

## Mô tả
Xây dựng hệ thống tìm kiếm sân với filters, bản đồ và sắp xếp kết quả.

## Yêu cầu chức năng

### 1. Search Filters
- [ ] Filter theo vị trí:
  - City/Province dropdown
  - District/Ward dropdown
  - Radius search (1km, 3km, 5km, 10km)
  - Current location (geolocation API)
- [ ] Filter theo loại sân:
  - Cầu lông
  - Bóng đá
  - Tennis
  - Bóng rổ
  - Đa năng
- [ ] Filter theo khoảng giá:
  - Min-max price slider
  - Price ranges: <100k, 100k-200k, 200k-300k, >300k
- [ ] Filter theo thời gian:
  - Date picker
  - Time slot picker
  - Chỉ hiện sân có slot trống

### 2. Search Algorithm
- [ ] Full-text search cho tên sân, địa chỉ
- [ ] Geo-spatial search (PostGIS, MongoDB geospatial)
- [ ] Filter logic (AND/OR conditions)
- [ ] Pagination (20-50 results per page)
- [ ] Search query optimization

### 3. Google Maps Integration
- [ ] Display courts trên bản đồ
- [ ] Custom markers cho mỗi sân
- [ ] Info window với thông tin cơ bản
- [ ] Current location marker
- [ ] Click marker để xem chi tiết
- [ ] Map bounds based on search results
- [ ] Cluster markers khi zoom out

### 4. Sort Options
- [ ] Sort theo khoảng cách (gần nhất)
- [ ] Sort theo giá (thấp -> cao, cao -> thấp)
- [ ] Sort theo rating (cao nhất)
- [ ] Sort theo độ phổ biến (số bookings)
- [ ] Default sort: relevance score

### 5. Search Results Display
- [ ] Card layout với:
  - Hình ảnh chính
  - Tên sân
  - Địa chỉ
  - Khoảng cách
  - Rating stars
  - Giá từ
  - Available slots count
  - Quick book button
- [ ] List view / Grid view toggle
- [ ] Save search / Favorite courts

### 6. Database Schema
- [ ] Bảng courts:
  - id
  - name (indexed, full-text)
  - description
  - address (full-text)
  - city, district, ward
  - latitude, longitude (spatial index)
  - court_type (enum)
  - rating (computed)
  - total_reviews
  - base_price
  - created_at, updated_at
- [ ] Indexes:
  - Spatial index cho lat/long
  - Full-text index cho name, address
  - Composite index cho filters

### 7. API Endpoints
- [ ] GET /api/courts/search
  - Query params: q, city, district, type, min_price, max_price, date, time, lat, lng, radius, sort, page, limit
  - Output: courts array, total, page info, facets
- [ ] GET /api/courts/nearby
  - Query params: lat, lng, radius, limit
  - Output: nearby courts with distance
- [ ] POST /api/courts/favorites - Add to favorites
- [ ] DELETE /api/courts/favorites/:id - Remove favorite

### 8. Frontend Components
- [ ] SearchBar component
- [ ] FilterPanel component
- [ ] MapView component
- [ ] CourtCard component
- [ ] Pagination component
- [ ] Sort dropdown

### 9. Performance
- [ ] Cache popular searches
- [ ] Index optimization
- [ ] Lazy load images
- [ ] Debounce search input
- [ ] Implement infinite scroll hoặc pagination

### 10. Testing
- [ ] Unit tests cho search logic
- [ ] Test geo-spatial queries
- [ ] Test filters combinations
- [ ] Test sorting
- [ ] Integration tests cho API
- [ ] E2E tests cho search flow

## Tiêu chí chấp nhận
- [ ] Search với filters hoạt động đúng
- [ ] Google Maps hiển thị sân chính xác
- [ ] Sort options hoạt động
- [ ] Results hiển thị đẹp trên UI
- [ ] Performance tốt với 1000+ courts
- [ ] Tests pass 100%
- [ ] Mobile responsive

## Phụ thuộc
- Cần seed data với sample courts

## Công nghệ đề xuất
- Backend: PostgreSQL + PostGIS hoặc MongoDB
- Maps: Google Maps JavaScript API
- Search: Elasticsearch (optional, nâng cao)
- Frontend: React/Vue với Maps library
- Cache: Redis

## Ước lượng
- Effort: 10-14 days
- Priority: High (P0)

## Ghi chú
- Google Maps API có quota và pricing
- Cân nhắc Mapbox như alternative
- Implement search analytics để optimize
