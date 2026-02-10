
# Backend – Analytics, Reporting & Dynamic RBAC

## Overview

Tài liệu mô tả các API backend phục vụ:

- Thống kê – báo cáo vận hành hệ thống sân
- Dữ liệu thời gian thực (near-real-time)
- Xuất báo cáo Excel / PDF
- Hệ thống phân quyền động (RBAC + object-based permission)
- Audit log & phát hiện hành vi bất thường
- Unit test và API documentation

Phù hợp với hệ thống hiện tại:

- NestJS
- MongoDB (Mongoose)
- JWT Authentication
- WebSocket (realtime dashboard – optional)

---

## 1. Thống kê & phân tích dữ liệu

---

## 1.1 Các chỉ số chính

### Doanh thu

- Tổng doanh thu
- Doanh thu theo:
  - sân
  - loại sân
  - khung giờ
  - nguồn khách (app, web, QR, admin tạo)
- Doanh thu thời gian thực (real-time)

---

### Tỉ lệ lấp đầy (Occupancy rate)

