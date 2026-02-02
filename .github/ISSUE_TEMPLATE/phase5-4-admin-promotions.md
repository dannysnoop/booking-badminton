---
name: "[Phase 5.4] Admin - Promotions & Marketing"
about: Manage discounts, vouchers, and loyalty programs
title: "[Phase 5.4] Admin - Promotions & Marketing"
labels: admin, promotions, marketing, enhancement, phase-5
assignees: ''
---

## Mô tả
Xây dựng hệ thống quản lý khuyến mãi, mã giảm giá, voucher và chương trình khách hàng thân thiết.

## Yêu cầu chức năng

### 1. Discount Code Management
- [ ] Create discount codes:
  - Code name (unique)
  - Description
  - Discount type:
    - Percentage (%)
    - Fixed amount (VND)
    - Free hours
  - Discount value
  - Minimum order value
  - Maximum discount amount
  - Valid date range
  - Usage limit:
    - Total uses
    - Per user limit
  - Target:
    - All users
    - New users only
    - Specific users
    - User segments
  - Applicable to:
    - All courts
    - Specific courts
    - Specific time slots
- [ ] Code generation:
  - Auto-generate random codes
  - Bulk code generation
  - Custom code input
  - QR code generation
- [ ] Activate/deactivate codes
- [ ] Edit discount details
- [ ] Delete expired codes

### 2. Voucher System
- [ ] Create vouchers:
  - Voucher type:
    - Discount voucher
    - Free booking voucher
    - Upgrade voucher
    - Gift voucher
  - Voucher value
  - Terms and conditions
  - Expiry date
  - Redemption rules
- [ ] Issue vouchers:
  - Send to specific users
  - Send to user segments
  - Bulk send
  - Public vouchers
- [ ] Voucher tracking:
  - Issued count
  - Redeemed count
  - Expired count
  - Redemption rate
- [ ] Voucher history per user

### 3. Loyalty Program
- [ ] Point system:
  - Earn points per booking
  - Points based on spending (1 point = 1,000 VND)
  - Bonus points for reviews
  - Bonus points for referrals
  - Points expiry (12 months)
- [ ] Membership tiers:
  - Bronze (0-999 points)
  - Silver (1,000-4,999 points)
  - Gold (5,000-9,999 points)
  - Platinum (10,000+ points)
- [ ] Tier benefits:
  - Discount % (Bronze 5%, Silver 10%, Gold 15%, Platinum 20%)
  - Priority booking
  - Free cancellations
  - Birthday rewards
  - Exclusive access
- [ ] Points redemption:
  - Redeem for discounts
  - Redeem for free bookings
  - Redeem for merchandise (optional)
  - Redemption rate (e.g., 100 points = 10,000 VND)

### 4. Referral Program
- [ ] Referral system:
  - Unique referral code per user
  - Referral link
  - Track referrals
- [ ] Rewards:
  - Referrer reward (e.g., 50,000 VND credit)
  - Referee reward (e.g., 20% off first booking)
  - Milestone bonuses (refer 5, 10, 20 friends)
- [ ] Referral tracking:
  - Pending referrals
  - Successful referrals
  - Reward status
- [ ] Leaderboard:
  - Top referrers
  - Rewards earned

### 5. Promotional Campaigns
- [ ] Campaign creation:
  - Campaign name
  - Campaign type:
    - Flash sale
    - Happy hour
    - Weekend special
    - Seasonal promotion
    - Holiday special
  - Campaign period
  - Target audience
  - Campaign goals
  - Budget
- [ ] Campaign content:
  - Banner images
  - Promotional text
  - Call-to-action
  - Landing page URL
- [ ] Campaign channels:
  - In-app banner
  - Email blast
  - SMS marketing
  - Push notifications
  - Social media
- [ ] Campaign tracking:
  - Impressions
  - Clicks
  - Conversions
  - ROI

### 6. Special Offers
- [ ] Time-based offers:
  - Happy hour pricing (off-peak)
  - Early bird discounts
  - Last-minute deals
  - Weekend specials
- [ ] Event-based offers:
  - Holiday promotions
  - Birthday month discount
  - Anniversary deals
  - New court opening
- [ ] Package deals:
  - Buy 5 get 1 free
  - Monthly pass
  - 10-session package
  - Group booking discounts

### 7. Notification System
- [ ] Send promotions:
  - Select target audience
  - Choose notification channel
  - Schedule send time
  - Preview before send
- [ ] Notification templates:
  - Email templates
  - SMS templates
  - Push notification templates
  - Banner templates
- [ ] Personalization:
  - Use customer name
  - Favorite courts
  - Booking history
  - Preferences
- [ ] A/B testing:
  - Test different messages
  - Test different offers
  - Compare performance

### 8. Usage Tracking & Analytics
- [ ] Promotion performance:
  - Total redemptions
  - Revenue generated
  - Average order value with promotion
  - Conversion rate
  - ROI calculation
- [ ] Code analytics:
  - Most used codes
  - Least used codes
  - Fraud detection (unusual usage patterns)
- [ ] Campaign analytics:
  - Campaign reach
  - Engagement rate
  - Conversion rate
  - Cost per acquisition
- [ ] Loyalty analytics:
  - Active members per tier
  - Points earned vs redeemed
  - Member lifetime value
  - Tier upgrades

### 9. Database Schema
- [ ] Bảng discount_codes:
  - id
  - code (unique, indexed)
  - description
  - discount_type
  - discount_value
  - min_order_value
  - max_discount_amount
  - start_date
  - end_date
  - total_usage_limit
  - per_user_limit
  - current_usage_count
  - is_active
  - target_user_type
  - applicable_courts (JSON)
  - created_by_admin_id
  - created_at
- [ ] Bảng discount_code_usage:
  - id
  - discount_code_id
  - user_id
  - booking_id
  - discount_amount
  - used_at
- [ ] Bảng vouchers:
  - id
  - code (unique)
  - voucher_type
  - value
  - terms
  - issued_to_user_id
  - issued_at
  - redeemed_at
  - expires_at
  - status
- [ ] Bảng loyalty_points:
  - id
  - user_id
  - points
  - transaction_type (earn/redeem)
  - booking_id
  - description
  - created_at
  - expires_at
- [ ] Bảng user_loyalty_tier:
  - id
  - user_id
  - tier_level
  - total_points_earned
  - current_points
  - tier_since
  - updated_at
- [ ] Bảng referrals:
  - id
  - referrer_user_id
  - referee_user_id
  - referral_code
  - status (pending/completed)
  - reward_given
  - created_at
  - completed_at
- [ ] Bảng campaigns:
  - id
  - name
  - campaign_type
  - start_date
  - end_date
  - target_audience
  - budget
  - impressions
  - clicks
  - conversions
  - created_at

### 10. API Endpoints (Admin)
- [ ] GET /api/admin/discounts - List discount codes
- [ ] POST /api/admin/discounts - Create discount
- [ ] PUT /api/admin/discounts/:id - Update discount
- [ ] DELETE /api/admin/discounts/:id - Delete discount
- [ ] POST /api/admin/discounts/bulk - Bulk create
- [ ] GET /api/admin/vouchers - List vouchers
- [ ] POST /api/admin/vouchers/issue - Issue vouchers
- [ ] GET /api/admin/loyalty/tiers - Get tier info
- [ ] PUT /api/admin/loyalty/tiers - Update tiers
- [ ] GET /api/admin/loyalty/users - List loyalty members
- [ ] GET /api/admin/referrals - Referral stats
- [ ] POST /api/admin/campaigns - Create campaign
- [ ] POST /api/admin/campaigns/:id/send - Send campaign
- [ ] GET /api/admin/promotions/analytics - Performance

### 11. User-Facing API Endpoints
- [ ] POST /api/booking/apply-discount - Apply code
- [ ] GET /api/user/vouchers - My vouchers
- [ ] POST /api/user/vouchers/redeem - Redeem voucher
- [ ] GET /api/user/loyalty - My loyalty info
- [ ] GET /api/user/referral - My referral code
- [ ] POST /api/user/loyalty/redeem - Redeem points

### 12. Frontend Components (Admin)
- [ ] DiscountCodeList component
- [ ] DiscountCodeForm component
- [ ] VoucherManager component
- [ ] LoyaltyProgramConfig component
- [ ] ReferralDashboard component
- [ ] CampaignBuilder component
- [ ] PromotionAnalytics component
- [ ] BulkCodeGenerator component

### 13. Frontend Components (User)
- [ ] DiscountCodeInput component
- [ ] VoucherCard component
- [ ] LoyaltyBadge component
- [ ] PointsBalance component
- [ ] ReferralInvite component
- [ ] PromoBanner component

### 14. Validation & Rules
- [ ] Code validation:
  - Check if code exists
  - Check if active
  - Check usage limits
  - Check user eligibility
  - Check minimum order
  - Check expiry
  - Check applicable courts/times
- [ ] Prevent abuse:
  - Rate limiting
  - Fraud detection
  - IP tracking
  - Pattern detection

### 15. Testing
- [ ] Unit tests cho discount calculation
- [ ] Test usage limits
- [ ] Test loyalty points calculation
- [ ] Test referral tracking
- [ ] Integration tests
- [ ] Test campaign sending
- [ ] E2E tests cho promotion flow

## Tiêu chí chấp nhận
- [ ] Discount code system complete
- [ ] Voucher system works
- [ ] Loyalty program functional
- [ ] Referral system operational
- [ ] Campaign creation và sending works
- [ ] Analytics accurate
- [ ] User can apply discounts
- [ ] Fraud prevention in place
- [ ] Tests pass 100%

## Phụ thuộc
- Issue #[Phase 3.1] - Booking System (apply discounts)
- Issue #[Phase 5.3] - Admin Analytics (track performance)

## Công nghệ đề xuất
- Email: SendGrid, Mailgun (bulk emails)
- SMS: Twilio (bulk SMS)
- Push: Firebase Cloud Messaging
- QR codes: qrcode library
- Scheduler: node-cron, Bull

## Ước lượng
- Effort: 14-21 days
- Priority: Medium (P1)

## Ghi chú
- Start với discount codes, sau đó vouchers
- Loyalty program có thể phase sau
- Marketing campaigns phức tạp, consider third-party tools
- Fraud prevention quan trọng
- A/B testing có thể làm sau
