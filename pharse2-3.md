
# Backend – Group Booking, Invitation, Group Chat & Payment Split

## Overview

Tài liệu mô tả các API backend cho chức năng **đặt sân theo nhóm (group booking)**, bao gồm:

- Tạo booking nhóm
- Chọn số lượng thành viên, phương thức chia phí
- Tạo link mời và QR code
- Gửi lời mời qua SMS / in-app / link
- Xác nhận tham gia / từ chối
- Chat nhóm theo từng booking
- Thông báo mọi thay đổi trạng thái
- Quản lý trạng thái thanh toán theo từng thành viên và toàn nhóm
- Audit log
- Unit test cho nghiệp vụ nhóm

Thiết kế phù hợp với hệ thống booking sân hiện tại (NestJS + MongoDB).

---

## Core concepts

- Một booking có thể là:
  - booking cá nhân
  - booking nhóm
- Group booking có:
  - host (người tạo)
  - danh sách thành viên
  - link mời chung

---

## Data model (Mongo – đề xuất)

---

### GroupBooking

```ts
interface GroupBooking {
  _id: ObjectId;

  bookingId: ObjectId;

  hostId: ObjectId;

  maxMembers: number;

  splitMethod: 'EQUAL' | 'CUSTOM' | 'HOST_PAY_FIRST';

  inviteCode: string;
  inviteLink: string;

  status: 'OPEN' | 'FULL' | 'CANCELLED';

  createdAt: Date;
}
