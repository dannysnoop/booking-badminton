# Backend – Notification System, Reviews, Support Tickets & Abuse Reporting

## Overview

Tài liệu mô tả các API và thành phần backend cho:

- Hệ thống gửi thông báo đa kênh: in-app, email, SMS
- Quản lý template nội dung & thời điểm gửi
- Tích hợp push notification cho Web & Mobile
- Lưu lịch sử gửi, trạng thái đã đọc / chưa đọc
- Đánh giá – bình luận sân, phản hồi và kiểm duyệt nội dung
- Hệ thống ticket hỗ trợ (support)
- Báo cáo hành vi lạm dụng
- Unit test và kiểm thử nghiệp vụ hỗ trợ

Phù hợp với stack hiện tại:

- NestJS
- MongoDB (Mongoose)
- JWT authentication
- WebSocket / FCM / APNs
- Email provider, SMS provider

---

## 1. Notification system (đa kênh)

---

## 1.1 Supported channels

- IN_APP
- EMAIL
- SMS
- PUSH (Web / Mobile)

---

## 1.2 Notification template

### NotificationTemplate

```ts
interface NotificationTemplate {
  _id: ObjectId;

  code: string; // BOOKING_CONFIRMED, GROUP_INVITE, PAYMENT_SUCCESS...

  channels: ('IN_APP' | 'EMAIL' | 'SMS' | 'PUSH')[];

  titleTemplate?: string;
  contentTemplate: string;

  scheduleType: 'IMMEDIATE' | 'DELAYED';

  delaySeconds?: number;

  isActive: boolean;

  createdAt: Date;
}
