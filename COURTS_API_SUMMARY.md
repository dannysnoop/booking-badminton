# Court Search & Detail APIs - Implementation Summary

## ✅ Đã Hoàn Thành

### 1. **Court Management APIs**

#### Endpoints Created:
- **POST /api/courts** - Tạo sân mới (Owner only)
- **GET /api/courts** - Tìm kiếm sân với filters
- **GET /api/courts/:id** - Xem chi tiết sân
- **PUT /api/courts/:id** - Cập nhật sân (Owner only)
- **DELETE /api/courts/:id** - Xóa sân (Owner only)
- **POST /api/courts/:id/images** - Upload ảnh sân (Owner only)

#### Search Features:
✅ **Keyword search** - Tìm theo tên, mô tả, địa chỉ
✅ **Court type filter** - badminton, football, tennis, basketball, etc.
✅ **Location-based search** - Tìm theo vị trí (lat, lng) + radius
✅ **Price range filter** - Min/max price
✅ **Amenities filter** - Lọc theo tiện ích (parking, shower, wifi, etc.)
✅ **Rating filter** - Minimum rating
✅ **Sorting** - distance, rating, price, name
✅ **Pagination** - page, limit

#### Advanced Features:
✅ **Geospatial queries** - MongoDB 2dsphere index
✅ **Distance calculation** - Haversine formula
✅ **View count tracking** - Tự động tăng khi xem chi tiết
✅ **Owner/Admin permissions** - Phân quyền xem thông tin

---

### 2. **Review & Rating System**

#### Endpoints Created:
- **POST /api/courts/:id/reviews** - Tạo đánh giá
- **GET /api/courts/:id/reviews** - Lấy danh sách đánh giá
- **PUT /api/courts/reviews/:reviewId** - Cập nhật đánh giá
- **DELETE /api/courts/reviews/:reviewId** - Xóa đánh giá
- **POST /api/courts/reviews/:reviewId/reply** - Chủ sân trả lời

#### Features:
✅ **Rating system** - 1-5 stars
✅ **Comment with images** - Upload ảnh đánh giá
✅ **Owner reply** - Chủ sân phản hồi đánh giá
✅ **One review per user** - Mỗi user chỉ đánh giá 1 lần/sân
✅ **Auto-update court rating** - Tự động tính trung bình rating
✅ **Soft delete** - Xóa mềm reviews

---

## 📁 Files Created

### Schemas (2 new)
```
src/courts/schemas/
├── court.schema.ts          ✅ Court model với geospatial index
└── review.schema.ts         ✅ Review model
```

### DTOs (2 new)
```
src/courts/dto/
├── court.dto.ts            ✅ CreateCourtDto, UpdateCourtDto, SearchCourtDto
└── review.dto.ts           ✅ CreateReviewDto, UpdateReviewDto, OwnerReplyDto
```

### Services (2 new)
```
src/courts/services/
├── court.service.ts        ✅ Court CRUD + Search logic
└── review.service.ts       ✅ Review CRUD + Rating calculation
```

### Controllers (1 new)
```
src/courts/
├── courts.controller.ts    ✅ 11 endpoints
└── courts.module.ts        ✅ Module configuration
```

---

## 🗄️ Database Schema

### Court Schema
```typescript
{
  name: string                    // Tên sân
  description: string             // Mô tả
  address: string                 // Địa chỉ
  location: {                     // Vị trí (GeoJSON)
    type: 'Point'
    coordinates: [lng, lat]       // [Kinh độ, Vĩ độ]
  }
  courtType: string               // badminton, football, etc.
  images: string[]                // URLs ảnh
  amenities: string[]             // Tiện ích
  pricing: {                      // Giá
    weekdayPrice: number
    weekendPrice: number
    peakHourPrice: number
    currency: string
  }
  operatingHours: {               // Giờ mở cửa
    open: string
    close: string
  }
  phoneNumber: string
  email: string
  averageRating: number           // Rating trung bình (denormalized)
  totalReviews: number            // Số đánh giá (denormalized)
  viewCount: number               // Số lượt xem
  isActive: boolean
  ownerId: ObjectId
}
```

**Indexes:**
- `location: 2dsphere` - Geospatial queries
- `name, description, address: text` - Full-text search
- `courtType + isActive` - Compound index
- `ownerId + isActive` - Owner queries
- `averageRating` - Sorting by rating

### Review Schema
```typescript
{
  courtId: ObjectId
  userId: ObjectId
  rating: number (1-5)
  comment: string
  images: string[]
  ownerReply: string
  ownerRepliedAt: Date
  isActive: boolean
}
```

**Indexes:**
- `courtId + createdAt` - Court reviews
- `userId + courtId` - Unique constraint
- `rating` - Filter by rating

---

## 🔍 Search Examples

### 1. Basic Search
```bash
GET /api/courts?keyword=cầu lông&courtType=badminton
```

### 2. Location-Based Search
```bash
GET /api/courts?latitude=10.8231&longitude=106.6297&radius=5
```

### 3. Advanced Search
```bash
GET /api/courts
  ?courtType=badminton
  &minPrice=50000
  &maxPrice=200000
  &amenities=parking,shower
  &minRating=4
  &latitude=10.8231
  &longitude=106.6297
  &radius=10
  &sortBy=distance
  &page=1
  &limit=20
```

---

## 🔐 Authorization

### Public Endpoints
- GET /api/courts (search)
- GET /api/courts/:id (detail)
- GET /api/courts/:id/reviews

### Authenticated Endpoints
- POST /api/courts (create)
- PUT /api/courts/:id (update - owner only)
- DELETE /api/courts/:id (delete - owner only)
- POST /api/courts/:id/images (upload - owner only)
- POST /api/courts/:id/reviews (create review)
- PUT /api/courts/reviews/:reviewId (update - author only)
- DELETE /api/courts/reviews/:reviewId (delete - author only)
- POST /api/courts/reviews/:reviewId/reply (reply - owner only)

---

## 🚀 Features Highlights

### Geospatial Search
- ✅ MongoDB 2dsphere index
- ✅ $near operator for location queries
- ✅ Distance calculation (Haversine formula)
- ✅ Radius-based search (km)

### Performance Optimizations
- ✅ Compound indexes for common queries
- ✅ Text indexes for full-text search
- ✅ Denormalized rating data (avoid aggregation on every request)
- ✅ Pagination for large result sets
- ✅ Lean queries for read-only operations

### Security
- ✅ Owner-only access for CRUD operations
- ✅ User validation for reviews
- ✅ Soft delete for data retention
- ✅ File upload validation (size, type)

### Data Integrity
- ✅ One review per user per court (unique constraint)
- ✅ Auto-update court rating on review changes
- ✅ Cascade updates for related data

---

## 📊 API Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/courts | ✅ | Tạo sân mới |
| GET | /api/courts | ❌ | Tìm kiếm sân |
| GET | /api/courts/:id | ❌ | Chi tiết sân |
| PUT | /api/courts/:id | ✅ | Cập nhật sân |
| DELETE | /api/courts/:id | ✅ | Xóa sân |
| POST | /api/courts/:id/images | ✅ | Upload ảnh sân |
| POST | /api/courts/:id/reviews | ✅ | Tạo đánh giá |
| GET | /api/courts/:id/reviews | ❌ | Danh sách đánh giá |
| PUT | /api/courts/reviews/:reviewId | ✅ | Sửa đánh giá |
| DELETE | /api/courts/reviews/:reviewId | ✅ | Xóa đánh giá |
| POST | /api/courts/reviews/:reviewId/reply | ✅ | Trả lời đánh giá |

**Total: 11 endpoints**

---

## 🧪 Testing

### Manual Testing with Swagger
Access: `http://localhost:3000/api`

### Test Scenarios

**Court Management:**
1. Create court (authenticated)
2. Search courts (public)
3. Filter by location
4. Filter by price range
5. Filter by amenities
6. Sort by distance/rating
7. View court detail
8. Update court (owner)
9. Upload images (owner)
10. Delete court (owner)

**Review Management:**
1. Create review (authenticated)
2. View reviews (public)
3. Update review (author)
4. Delete review (author)
5. Owner reply (owner)
6. Verify rating calculation

---

## 📝 TODO / Future Enhancements

### Google Maps Integration
- [ ] Implement actual Google Places API integration
- [ ] Geocoding for address → coordinates
- [ ] Reverse geocoding for coordinates → address
- [ ] Place autocomplete
- [ ] Distance Matrix API

### Features
- [ ] Court availability calendar
- [ ] Booking integration
- [ ] Favorite/Bookmark courts
- [ ] Court comparison
- [ ] Advanced analytics for owners
- [ ] Bulk image upload
- [ ] Image optimization/thumbnails

### Performance
- [ ] Redis caching for popular searches
- [ ] Elasticsearch for better search
- [ ] CDN for images
- [ ] Query optimization

### Testing
- [ ] Unit tests for services
- [ ] E2E tests for endpoints
- [ ] Load testing

---

## 🎯 Environment Variables

No additional env variables needed for basic functionality.

For Google Maps integration (future):
```env
GOOGLE_MAPS_API_KEY=your-api-key
```

---

## 📚 References

- [MongoDB Geospatial Queries](https://docs.mongodb.com/manual/geospatial-queries/)
- [Mongoose Geospatial Indexes](https://mongoosejs.com/docs/geojson.html)
- [Google Maps Platform](https://developers.google.com/maps)

---

**Status: ✅ COURT SEARCH & DETAIL APIs COMPLETE**

All core features implemented:
- Court CRUD operations
- Advanced search with geospatial queries
- Review & rating system
- Owner permissions
- File uploads
- Pagination & sorting

