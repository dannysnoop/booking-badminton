# 🎉 Analytics, Reporting & RBAC - COMPLETE!

Tôi đã hoàn thành việc implement **Analytics, Reporting & Dynamic RBAC System** theo yêu cầu từ `pharse3-2.md`.

## ✅ Đã Implement

### 1. **Analytics & Reporting** (6 endpoints)
- GET /api/analytics/dashboard - Tổng quan dashboard
- GET /api/analytics/revenue - Thống kê doanh thu
- GET /api/analytics/occupancy - Tỉ lệ lấp đầy
- GET /api/analytics/top-courts - Top sân theo doanh thu
- GET /api/analytics/users - Thống kê người dùng
- GET /api/analytics/booking-trends - Xu hướng booking

### 2. **Role-Based Access Control (RBAC)** (8 endpoints)
- POST /api/rbac/roles - Tạo role mới
- GET /api/rbac/roles - Danh sách roles
- PUT /api/rbac/roles/:id - Cập nhật role
- DELETE /api/rbac/roles/:id - Xóa role
- POST /api/rbac/assign - Gán role cho user
- DELETE /api/rbac/user-roles/:id - Thu hồi role
- GET /api/rbac/users/:userId/roles - Roles của user
- GET /api/rbac/users/:userId/permissions - Permissions của user

### 3. **Audit Logs** (3 endpoints)
- GET /api/rbac/audit-logs - Xem audit logs
- GET /api/rbac/audit-logs/stats - Thống kê audit logs
- GET /api/rbac/audit-logs/anomalies/:userId - Phát hiện hành vi bất thường

## 🎯 Key Features

### Analytics Features
✅ **Revenue Analytics**:
  - Tổng doanh thu theo period
  - Doanh thu theo ngày
  - Doanh thu theo loại sân
  - Doanh thu theo khung giờ
  - Average booking value

✅ **Occupancy Rate**:
  - Tính toán tỉ lệ lấp đầy
  - Giờ đã book vs giờ available
  - Support filter theo court

✅ **Top Courts**:
  - Ranking theo doanh thu
  - Số lượng bookings
  - Average rating

✅ **User Statistics**:
  - Tổng số users
  - Users mới trong period
  - Active users (có booking)

✅ **Booking Trends**:
  - Trends theo ngày
  - Group by status
  - Time series data

✅ **Dashboard Summary**:
  - Stats của hôm nay
  - Pending bookings
  - Totals (courts, users)

### RBAC Features
✅ **Dynamic Roles**:
  - Create/Update/Delete custom roles
  - Flexible permissions array
  - System roles (không thể xóa)
  - Role description

✅ **Pre-defined Roles**:
  - ADMIN - Full access
  - OWNER - Court management
  - STAFF - Limited operations
  - USER - Basic access

✅ **Granular Permissions**:
  - booking:* (create, view, update, delete)
  - court:* (create, view, update, delete)
  - user:* (view, update, delete)
  - analytics:* (view, export)
  - role:* (create, view, update, delete, assign)
  - audit:view

✅ **Object-Based Permissions**:
  - Court-specific roles
  - User can have different roles per court
  - Support for resource-level access

✅ **Role Assignment**:
  - Assign roles to users
  - Optional expiration date
  - Track who granted the role
  - Revoke permissions

### Audit Log Features
✅ **Complete Logging**:
  - User actions tracked
  - Resource changes logged
  - Old/New data comparison
  - IP & User Agent tracking

✅ **Audit Stats**:
  - Stats by action type
  - Stats by resource
  - Top users by activity
  - Success/Failed counts

✅ **Anomaly Detection**:
  - High frequency action detection
  - Failed login tracking
  - Configurable thresholds
  - Time window analysis

✅ **Audit Filtering**:
  - Filter by user
  - Filter by action
  - Filter by resource
  - Date range filtering
  - Pagination

## 📁 Files Created

### Analytics (3 files)
```
src/analytics/
├── analytics.controller.ts       ✅ 6 endpoints
├── analytics.module.ts            ✅ Module config
├── dto/
│   └── analytics.dto.ts           ✅ DTOs
└── services/
    └── analytics.service.ts       ✅ Analytics logic
```

### RBAC (9 files)
```
src/rbac/
├── rbac.controller.ts             ✅ 11 endpoints
├── rbac.module.ts                 ✅ Module config
├── schemas/
│   ├── role.schema.ts             ✅ Role model
│   ├── user-role.schema.ts        ✅ User-Role mapping
│   └── audit-log.schema.ts        ✅ Audit logs
├── services/
│   ├── rbac.service.ts            ✅ RBAC logic
│   └── audit-log.service.ts       ✅ Audit logging
├── decorators/
│   └── permissions.decorator.ts   ✅ @RequirePermissions
└── guards/
    └── permissions.guard.ts       ✅ Permission check
```

## 🗄️ Database Schemas

### Role
```typescript
{
  name: string (unique)           // ADMIN, OWNER, STAFF, USER
  displayName: string
  description: string
  permissions: string[]           // Array of permission strings
  isActive: boolean
  isSystem: boolean              // System roles can't be deleted
}
```

### UserRole
```typescript
{
  userId: ObjectId
  roleId: ObjectId
  courtId: ObjectId              // Optional, for court-specific roles
  grantedBy: ObjectId
  expiresAt: Date                // Optional expiration
  isActive: boolean
}
```

### AuditLog
```typescript
{
  userId: ObjectId
  action: string                 // CREATE, UPDATE, DELETE, LOGIN, etc.
  resource: string               // booking, court, user, role, etc.
  resourceId: ObjectId
  oldData: Object                // Before changes
  newData: Object                // After changes
  ipAddress: string
  userAgent: string
  status: string                 // SUCCESS, FAILED
  errorMessage: string
  metadata: Object
}
```

## 📊 Analytics Examples

### 1. Revenue Stats
```bash
GET /api/analytics/revenue?startDate=2026-01-01&endDate=2026-02-10

Response:
{
  "summary": {
    "totalRevenue": 15000000,
    "totalBookings": 150,
    "averageBookingValue": 100000
  },
  "revenueByDate": [...],
  "revenueByCourtType": [...],
  "revenueByTimeSlot": [...]
}
```

### 2. Occupancy Rate
```bash
GET /api/analytics/occupancy?startDate=2026-01-01&endDate=2026-02-10

Response:
{
  "occupancyRate": 75.5,
  "bookedHours": 1200,
  "availableHours": 1600
}
```

### 3. Dashboard Summary
```bash
GET /api/analytics/dashboard

Response:
{
  "today": {
    "bookings": 15,
    "revenue": 1500000
  },
  "pending": {
    "bookings": 5
  },
  "totals": {
    "courts": 10,
    "users": 500
  }
}
```

## 🔐 RBAC Usage Examples

### 1. Create Custom Role
```bash
POST /api/rbac/roles
{
  "name": "MANAGER",
  "displayName": "Court Manager",
  "permissions": [
    "court:view",
    "booking:view:all",
    "analytics:view:own"
  ]
}
```

### 2. Assign Role to User
```bash
POST /api/rbac/assign
{
  "userId": "...",
  "roleId": "...",
  "courtId": "...",        // Optional, for court-specific role
  "expiresAt": "2027-01-01" // Optional
}
```

### 3. Check Permissions
```bash
GET /api/rbac/users/{userId}/permissions?courtId=...

Response:
[
  "booking:create",
  "booking:view:own",
  "court:view",
  ...
]
```

### 4. Using Permission Guard
```typescript
@Post('courts')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions(Permission.COURT_CREATE)
async createCourt() {
  // Only users with 'court:create' permission can access
}
```

## 📝 Audit Log Examples

### 1. View Audit Logs
```bash
GET /api/rbac/audit-logs?action=CREATE&resource=booking&page=1&limit=50
```

### 2. Audit Stats
```bash
GET /api/rbac/audit-logs/stats?startDate=2026-01-01&endDate=2026-02-10

Response:
{
  "byAction": [
    { "_id": "CREATE", "count": 150, "successCount": 148, "failedCount": 2 },
    ...
  ],
  "byResource": [...],
  "topUsers": [...]
}
```

### 3. Detect Anomalies
```bash
GET /api/rbac/audit-logs/anomalies/{userId}

Response:
{
  "isAnomaly": true,
  "details": {
    "recentActions": 150,
    "threshold": 100,
    "failedLogins": 6,
    "failedLoginThreshold": 5
  }
}
```

## 🎯 Permission System

### Pre-defined Permissions (26 total):

**Booking:**
- booking:create
- booking:view:own / booking:view:all
- booking:update:own / booking:update:all
- booking:delete:own / booking:delete:all

**Court:**
- court:create
- court:view
- court:update:own / court:update:all
- court:delete:own / court:delete:all

**User:**
- user:view:own / user:view:all
- user:update:own / user:update:all
- user:delete

**Analytics:**
- analytics:view:own / analytics:view:all
- analytics:export

**Role:**
- role:create / role:view / role:update / role:delete
- role:assign

**Audit:**
- audit:view

## 📊 API Summary

| Module | Endpoints | Description |
|--------|-----------|-------------|
| Analytics | 6 | Revenue, occupancy, trends, stats |
| RBAC | 8 | Roles & permissions management |
| Audit | 3 | Audit logs & anomaly detection |

**Total: 17 new endpoints**

## 🚀 Production Ready Features

✅ **MongoDB Aggregations** - Efficient data queries
✅ **Flexible date ranges** - Custom period analytics
✅ **Pagination** - All list endpoints
✅ **Permission guards** - Reusable authorization
✅ **System roles** - Pre-defined roles
✅ **Audit trail** - Complete activity tracking
✅ **Anomaly detection** - Security monitoring
✅ **Resource-level permissions** - Court-specific access
✅ **Role expiration** - Time-limited access

## 📝 TODO / Future Enhancements

### Export Features
- [ ] Excel export (xlsx)
- [ ] PDF report generation
- [ ] Email scheduled reports
- [ ] Chart generation

### Real-time Dashboard
- [ ] WebSocket integration
- [ ] Live metrics updates
- [ ] Real-time notifications

### Advanced Analytics
- [ ] Revenue forecasting
- [ ] Customer segmentation
- [ ] Churn prediction
- [ ] Peak hours analysis

### RBAC Enhancements
- [ ] Permission inheritance
- [ ] Role templates
- [ ] Bulk role assignment
- [ ] Permission request workflow

## 🎯 Usage

### Initialize System Roles
```typescript
// Call on app startup
await rbacService.initializeSystemRoles();
```

### Log User Actions
```typescript
// Use in services
await auditLogService.log({
  userId: user.id,
  action: 'CREATE',
  resource: 'booking',
  resourceId: booking.id,
  newData: booking,
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
});
```

---

**Status: ✅ PHASE 3-2 COMPLETE**

Analytics, Reporting & Dynamic RBAC với:
- Revenue & occupancy analytics
- User & booking trends
- Dynamic role management
- Granular permissions
- Complete audit trail
- Anomaly detection
- Permission guards

**Total APIs: 17 endpoints** 🎊

