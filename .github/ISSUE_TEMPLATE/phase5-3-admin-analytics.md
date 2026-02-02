---
name: "[Phase 5.3] Admin - Statistics & Reporting"
about: Analytics dashboard with revenue reports and business insights
title: "[Phase 5.3] Admin - Statistics & Reporting"
labels: admin, analytics, reporting, enhancement, phase-5
assignees: ''
---

## Mô tả
Xây dựng hệ thống thống kê và báo cáo với dashboard, phân tích doanh thu, khách hàng và hiệu suất sân.

## Yêu cầu chức năng

### 1. Dashboard Overview
- [ ] Key metrics cards:
  - Today's revenue
  - Today's bookings count
  - Active bookings now
  - Total customers
  - Pending payments
  - Court occupancy rate
  - Avg booking value
  - New customers today
- [ ] Quick stats:
  - vs yesterday (% change)
  - vs last week
  - vs last month
- [ ] Visual indicators (up/down arrows, colors)
- [ ] Real-time updates

### 2. Revenue Reports
- [ ] Revenue by period:
  - Daily revenue chart
  - Weekly revenue chart
  - Monthly revenue chart
  - Yearly revenue chart
  - Custom date range
- [ ] Revenue breakdown:
  - By court
  - By time slot
  - By day of week
  - By payment method
  - By booking type (individual vs group)
- [ ] Revenue comparison:
  - Period over period
  - Year over year
  - Budget vs actual
- [ ] Revenue projections:
  - Trend analysis
  - Forecast next month
- [ ] Financial summary:
  - Total revenue
  - Average daily revenue
  - Peak revenue day
  - Lowest revenue day
  - Refunds total
  - Net revenue

### 3. Court Occupancy Analysis
- [ ] Occupancy rate:
  - Overall occupancy %
  - Per court occupancy
  - By time slot
  - By day of week
  - Heatmap visualization
- [ ] Utilization metrics:
  - Total hours available
  - Total hours booked
  - Available vs booked ratio
  - Prime time utilization
  - Off-peak utilization
- [ ] Identify:
  - Most popular courts
  - Underutilized courts
  - Peak hours
  - Slow hours
- [ ] Optimization suggestions:
  - Pricing recommendations
  - Marketing opportunities

### 4. Customer Analytics
- [ ] Customer segmentation:
  - New customers (first booking)
  - Returning customers
  - VIP customers (frequent bookers)
  - Inactive customers (haven't booked in 30+ days)
  - At-risk customers
- [ ] Customer metrics:
  - Total customers
  - New customers this period
  - Customer retention rate
  - Churn rate
  - Average lifetime value
  - Average bookings per customer
- [ ] Customer behavior:
  - Preferred time slots
  - Preferred courts
  - Average booking frequency
  - Booking lead time
  - Cancellation rate per segment
- [ ] Top customers:
  - Most bookings
  - Highest spending
  - Most reviews
  - Longest relationship

### 5. Time Slot Analysis
- [ ] Hot time slots:
  - Most booked hours
  - Highest revenue hours
  - Fastest booking hours
  - Booking frequency by hour
- [ ] Off-peak slots:
  - Least booked hours
  - Opportunity hours
- [ ] Day of week analysis:
  - Monday-Sunday comparison
  - Weekend vs weekday
- [ ] Seasonal trends:
  - Monthly patterns
  - Holiday impact
  - Weather correlation (optional)

### 6. Review & Feedback Analytics
- [ ] Rating overview:
  - Average rating (overall)
  - Rating distribution (1-5 stars)
  - Ratings over time (trend)
  - Rating by court
- [ ] Review metrics:
  - Total reviews
  - Response rate
  - Sentiment analysis (optional)
- [ ] Category ratings:
  - Court quality avg
  - Service avg
  - Facilities avg
  - Value for money avg
  - Cleanliness avg
- [ ] Review insights:
  - Most mentioned keywords
  - Common complaints
  - Common praise
  - Improvement areas
- [ ] NPS score (Net Promoter Score):
  - Calculate NPS
  - Promoters, Passives, Detractors
  - NPS trend

### 7. Booking Analysis
- [ ] Booking metrics:
  - Total bookings
  - Confirmed bookings
  - Cancelled bookings
  - No-shows
  - Cancellation rate
  - No-show rate
  - Average booking value
  - Average booking duration
- [ ] Booking sources:
  - Web bookings
  - Mobile app bookings
  - Phone bookings
  - Walk-in bookings
  - Social media conversions
- [ ] Booking patterns:
  - Advance booking period
  - Last-minute bookings
  - Recurring bookings
  - Group vs individual ratio
- [ ] Conversion funnel:
  - Court views
  - Booking started
  - Booking completed
  - Conversion rate
  - Drop-off points

### 8. Export & Reporting
- [ ] Report types:
  - Revenue report
  - Booking report
  - Customer report
  - Court performance report
  - Financial statement
  - Custom report builder
- [ ] Export formats:
  - Excel (.xlsx)
  - CSV
  - PDF (formatted)
  - JSON
- [ ] Scheduled reports:
  - Daily summary email
  - Weekly report
  - Monthly report
  - Custom schedule
- [ ] Report templates:
  - Pre-built templates
  - Custom templates
  - Save report config

### 9. Filters & Date Ranges
- [ ] Date range picker:
  - Today
  - Yesterday
  - Last 7 days
  - Last 30 days
  - This month
  - Last month
  - This year
  - Custom range
- [ ] Filters:
  - By court
  - By city/location
  - By booking status
  - By payment status
  - By user segment
- [ ] Compare periods:
  - Compare to previous period
  - Compare to same period last year

### 10. Data Visualization
- [ ] Chart types:
  - Line charts (trends)
  - Bar charts (comparisons)
  - Pie charts (distributions)
  - Area charts (cumulative)
  - Heatmaps (time/day patterns)
  - Tables (detailed data)
- [ ] Interactive charts:
  - Hover tooltips
  - Click to drill down
  - Zoom and pan
  - Export chart as image
- [ ] Dashboard customization:
  - Add/remove widgets
  - Rearrange layout
  - Save custom dashboards

### 11. Database Queries & Optimization
- [ ] Pre-computed aggregates:
  - Daily revenue totals
  - Monthly statistics
  - Cached reports
- [ ] Materialized views:
  - Revenue by period
  - Occupancy rates
  - Customer metrics
- [ ] Indexing strategy:
  - Date indexes
  - Composite indexes
  - Query optimization
- [ ] Background jobs:
  - Nightly stats calculation
  - Weekly report generation
  - Monthly aggregation

### 12. API Endpoints (Admin)
- [ ] GET /api/admin/stats/dashboard - Dashboard metrics
- [ ] GET /api/admin/stats/revenue?period=month
- [ ] GET /api/admin/stats/occupancy?date_range=...
- [ ] GET /api/admin/stats/customers
- [ ] GET /api/admin/stats/timeslots
- [ ] GET /api/admin/stats/reviews
- [ ] GET /api/admin/reports/generate
- [ ] POST /api/admin/reports/export
- [ ] GET /api/admin/reports/scheduled
- [ ] POST /api/admin/reports/schedule

### 13. Frontend Components (Admin)
- [ ] DashboardLayout component
- [ ] MetricCard component
- [ ] RevenueChart component
- [ ] OccupancyHeatmap component
- [ ] CustomerSegmentation component
- [ ] TimeSlotAnalysis component
- [ ] ReviewAnalytics component
- [ ] ReportBuilder component
- [ ] DateRangePicker component
- [ ] ExportButton component

### 14. Performance Considerations
- [ ] Cache frequently accessed data
- [ ] Lazy load charts
- [ ] Pagination for large datasets
- [ ] Background computation
- [ ] Progressive loading
- [ ] Server-side aggregation

### 15. Testing
- [ ] Unit tests cho calculation logic
- [ ] Test data aggregation accuracy
- [ ] Test report generation
- [ ] Test export functionality
- [ ] Performance tests cho large datasets
- [ ] Integration tests cho analytics APIs

## Tiêu chí chấp nhận
- [ ] Dashboard displays key metrics
- [ ] Revenue reports accurate và detailed
- [ ] Occupancy analysis informative
- [ ] Customer analytics comprehensive
- [ ] Time slot analysis useful
- [ ] Review analytics complete
- [ ] Export to Excel/PDF works
- [ ] Charts interactive và responsive
- [ ] Performance acceptable (< 3s load)
- [ ] Tests pass 100%

## Phụ thuộc
- Issue #[Phase 3.1] - Booking System (booking data)
- Issue #[Phase 3.2] - Booking Management (reviews data)
- Issue #[Phase 5.1] - Admin Court Management (court data)
- Issue #[Phase 5.2] - Admin Booking Management (admin data)

## Công nghệ đề xuất
- Charts: Chart.js, Recharts, D3.js
- Export: ExcelJS, jsPDF
- Tables: AG Grid, React Table
- Caching: Redis
- Background jobs: Bull, Agenda
- Date library: date-fns, dayjs

## Ước lượng
- Effort: 14-21 days
- Priority: Medium (P1)

## Ghi chú
- Analytics là feature data-intensive
- Pre-computed aggregates critical for performance
- Consider using BI tool (Metabase, Superset)
- Real-time dashboard adds complexity
- Start with basic reports, expand later
