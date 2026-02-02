---
name: "[Phase 4] Group Booking, Invitations & Chat"
about: Social features for group bookings with chat functionality
title: "[Phase 4] Group Booking, Invitations & Chat"
labels: social, group-booking, chat, enhancement, phase-4
assignees: ''
---

## Mô tả
Xây dựng tính năng đặt lịch nhóm, mời bạn bè và chat trao đổi để tạo trải nghiệm xã hội.

## Yêu cầu chức năng

### 1. Create Group Booking
- [ ] Booking flow với "Group Booking" option
- [ ] Group settings:
  - Group name (optional)
  - Number of participants (2-20)
  - Cost sharing method:
    - Equal split
    - Custom amounts
    - Pay individually
  - Deadline for joining
- [ ] Create group invitation:
  - Generate unique invite link
  - Create member list
  - Set max participants
- [ ] Group creator becomes admin

### 2. Invitation System
- [ ] Multiple invitation methods:
  - Share link (copy to clipboard)
  - Send via app notifications
  - Send via SMS
  - Share to social media (Zalo, Facebook)
  - Email invitation
  - QR code
- [ ] Invitation tracking:
  - Sent count
  - Viewed count
  - Accepted count
  - Declined count
- [ ] Invitation expiry
- [ ] Resend invitation option

### 3. Friend Invitation & Confirmation
- [ ] Friend receives invitation:
  - View booking details
  - See who else joined
  - See cost share amount
  - Accept/Decline buttons
- [ ] Join group:
  - Confirm participation
  - Enter contact info
  - Pay share (if required upfront)
- [ ] Update group:
  - Add member to group
  - Update participant count
  - Recalculate cost split
  - Notify all members
- [ ] Member list:
  - Show all participants
  - Payment status per member
  - Contact info (if shared)
  - Admin indicator

### 4. Cost Sharing
- [ ] Equal split:
  - Total price / number of participants
  - Auto-update when members join/leave
- [ ] Custom split:
  - Admin sets amount per person
  - Flexible percentages
- [ ] Individual payment:
  - Each member pays separately
  - Track payment status
  - Payment reminders
- [ ] Payment collection:
  - Group wallet
  - Direct to court
  - Collect before booking confirmed
- [ ] Refund handling:
  - Distribute refund proportionally
  - Individual refund tracking

### 5. Group Management
- [ ] Admin capabilities:
  - Add/remove members
  - Change cost split
  - Modify booking (date/time)
  - Cancel booking
  - Send announcements
  - Transfer admin role
- [ ] Member capabilities:
  - Leave group
  - Update own contact info
  - View booking details
  - Chat with group
- [ ] Notifications to all members:
  - Member joined/left
  - Booking modified
  - Payment updates
  - Important reminders

### 6. Group Chat
- [ ] Create chat room per booking:
  - Auto-create when group is formed
  - Persist until after booking date
- [ ] Chat features:
  - Send text messages
  - Share images (max 5MB)
  - Share videos (max 10MB)
  - Emoji reactions
  - Reply to messages
  - Delete own messages (within 5 mins)
  - @mention members
- [ ] Chat UI:
  - Real-time updates (WebSocket/Polling)
  - Typing indicators
  - Read receipts
  - Unread count badge
  - Message timestamps
  - Infinite scroll for history
- [ ] File sharing:
  - Upload images
  - Preview thumbnails
  - Download files

### 7. Discussion Topics
- [ ] Suggested discussion threads:
  - Game time coordination
  - Team division
  - Equipment sharing
  - Post-game plans
  - Carpooling
- [ ] Polls:
  - Create simple polls
  - Vote on options
  - See results
- [ ] Announcement messages:
  - Pin important messages
  - Highlight system notifications

### 8. Automated Notifications
- [ ] Booking created notification
- [ ] Member joined/left notification
- [ ] Payment received notification
- [ ] Booking approaching reminder
- [ ] Booking modified notification
- [ ] Chat message notification
- [ ] @mention notification

### 9. Message History
- [ ] Persistent storage:
  - Store all messages
  - Store media files
  - Retention policy (90 days after booking)
- [ ] Search messages
- [ ] Filter by media/links
- [ ] Export chat history

### 10. Database Schema
- [ ] Bảng group_bookings:
  - id
  - booking_id (foreign key)
  - group_name
  - admin_user_id
  - max_participants
  - cost_sharing_method
  - invite_code (unique)
  - invite_expires_at
  - created_at
- [ ] Bảng group_members:
  - id
  - group_booking_id
  - user_id
  - role (admin/member)
  - cost_share_amount
  - payment_status
  - joined_at
- [ ] Bảng group_invitations:
  - id
  - group_booking_id
  - invited_by_user_id
  - invite_type (link/sms/email)
  - status (sent/viewed/accepted/declined)
  - created_at
- [ ] Bảng chat_rooms:
  - id
  - group_booking_id
  - created_at
  - archived_at
- [ ] Bảng chat_messages:
  - id
  - chat_room_id
  - user_id
  - message_type (text/image/video/system)
  - content
  - media_url
  - reply_to_message_id
  - created_at
  - updated_at
  - deleted_at
- [ ] Bảng chat_read_receipts:
  - id
  - chat_room_id
  - user_id
  - last_read_message_id
  - read_at

### 11. API Endpoints
- [ ] POST /api/bookings/:id/create-group - Tạo group booking
- [ ] POST /api/groups/:id/invite - Gửi invitation
- [ ] POST /api/groups/join/:code - Join group qua link
- [ ] GET /api/groups/:id/members - List members
- [ ] DELETE /api/groups/:id/members/:userId - Remove member
- [ ] PUT /api/groups/:id/cost-split - Update cost split
- [ ] GET /api/groups/:id/chat - Get chat messages
- [ ] POST /api/groups/:id/chat - Send message
- [ ] POST /api/groups/:id/chat/upload - Upload media
- [ ] PUT /api/groups/:id/chat/:messageId - Edit message
- [ ] DELETE /api/groups/:id/chat/:messageId - Delete message
- [ ] POST /api/groups/:id/chat/read - Mark as read

### 12. Real-time Implementation
- [ ] WebSocket server cho chat:
  - Connection management
  - Room-based messaging
  - Broadcast to group members
  - Typing indicators
  - Online/offline status
- [ ] Fallback to polling nếu WebSocket fails
- [ ] Message queue cho reliable delivery

### 13. Frontend Components
- [ ] CreateGroupBooking component
- [ ] InviteFriends component
- [ ] MembersList component
- [ ] CostSplitCalculator component
- [ ] GroupChat component
- [ ] MessageBubble component
- [ ] MediaPreview component
- [ ] TypingIndicator component

### 14. Mobile Considerations
- [ ] Push notifications cho chat messages
- [ ] Offline message queue
- [ ] Image compression before upload
- [ ] Responsive chat UI
- [ ] Deep linking cho invite links

### 15. Testing
- [ ] Unit tests cho cost splitting logic
- [ ] WebSocket connection tests
- [ ] Chat message delivery tests
- [ ] Concurrent member join tests
- [ ] File upload tests
- [ ] E2E tests cho group booking flow
- [ ] Load tests cho chat server

## Tiêu chí chấp nhận
- [ ] Group booking creation works
- [ ] Invitation system hoạt động (all methods)
- [ ] Members can join/leave groups
- [ ] Cost splitting calculated correctly
- [ ] Chat real-time và reliable
- [ ] File sharing works
- [ ] Notifications sent properly
- [ ] Mobile responsive
- [ ] Tests pass 100%

## Phụ thuộc
- Issue #[Phase 3.1] - Booking System
- Issue #[Phase 3.2] - Booking Management

## Công nghệ đề xuất
- WebSocket: Socket.io, ws
- Real-time DB: Firebase Realtime Database (alternative)
- Message Queue: RabbitMQ, Redis Pub/Sub
- File storage: AWS S3, Cloudinary
- Push notifications: Firebase Cloud Messaging

## Ước lượng
- Effort: 21-28 days
- Priority: Medium (P1)

## Ghi chú
- Chat là feature phức tạp nhất
- Cân nhắc dùng third-party chat SDK (Sendbird, Stream)
- WebSocket scaling cần load balancer
- File upload cần virus scanning
