# Backend – Court Search & Detail APIs (with Google Maps)

## Overview

Tài liệu mô tả các API backend cho chức năng tìm kiếm và hiển thị chi tiết sân (sân thể thao), bao gồm:

- Tìm kiếm sân với nhiều bộ lọc
- Tích hợp Google Maps APIs cho tìm kiếm theo vị trí
- Lấy chi tiết sân (thông tin, hình ảnh, bảng giá, tiện ích, đánh giá, lịch trống)
- Phân quyền truy cập
- Paging & sorting
- Bảo mật dữ liệu cá nhân
- Unit tests và API documentation

Thiết kế phù hợp với stack hiện tại:

- NestJS
- MongoDB (Mongoose)
- REST API
- Google Maps Platform

---

## Functional scope

- Người dùng có thể:
  - tìm sân theo vị trí, loại sân, giá, thời gian
  - xem chi tiết sân
  - xem lịch trống
  - xem đánh giá
- Chủ sân (owner):
  - có thể xem dữ liệu mở rộng (booking nội bộ, thống kê cơ bản)
- Admin:
  - toàn quyền

---

## Data model (Mongo – đề xuất)

### Court

```ts
interface Court {
  _id: ObjectId;

  name: string;
  description?: string;

  address: string;

  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };

  courtType: string; // badminton, football, tennis...

  images: string[];

  amenities: string[];

  isActive: boolean;

  ownerId: ObjectId;

  createdAt: Date;
  updatedAt: Date;
}
