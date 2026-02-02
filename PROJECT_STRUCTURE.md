# Project Structure - Issue Templates

## 📁 Repository Structure

```
booking-badminton/
├── .github/
│   └── ISSUE_TEMPLATE/
│       ├── phase1-1-user-registration.md
│       ├── phase1-2-email-sms-verification.md
│       ├── phase1-3-login-system.md
│       ├── phase1-4-advanced-auth.md
│       ├── phase2-1-court-search.md
│       ├── phase2-2-court-details.md
│       ├── phase3-1-booking-system.md
│       ├── phase3-2-booking-management.md
│       ├── phase4-group-booking-chat.md
│       ├── phase5-1-admin-court-management.md
│       ├── phase5-2-admin-booking-management.md
│       ├── phase5-3-admin-analytics.md
│       ├── phase5-4-admin-promotions.md
│       └── phase6-infrastructure.md
├── README.md (Original project description)
├── ISSUES_LIST.md (Master list of all issues)
├── HOW_TO_CREATE_ISSUES.md (Step-by-step guide)
├── README_ISSUES_SUMMARY.md (Quick summary)
└── PROJECT_STRUCTURE.md (This file)
```

## 🗺️ Development Phases Map

```
┌─────────────────────────────────────────────────────────────┐
│                    PHASE 6: INFRASTRUCTURE                   │
│                     (Ongoing throughout)                     │
│   • Tech Stack  • Architecture  • CI/CD  • Documentation    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              PHASE 1: AUTHENTICATION (P0 - 4 weeks)         │
│  Registration → Verification → Login → Advanced Features    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│          PHASE 2: SEARCH & DETAILS (P0 - 3-4 weeks)         │
│           Search Functionality → Court Detail View           │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│            PHASE 3: BOOKING SYSTEM (P0 - 6 weeks)           │
│        Booking Flow → User Booking Management               │
└─────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────┴─────────┐
                    ↓                   ↓
┌───────────────────────────┐  ┌──────────────────────────────┐
│  PHASE 4: SOCIAL (P1)     │  │  PHASE 5: ADMIN (P0-P1)      │
│      4 weeks              │  │       8-10 weeks             │
│  • Group Booking          │  │  • Court Management          │
│  • Invitations            │  │  • Booking Management        │
│  • Chat                   │  │  • Analytics & Reports       │
│                           │  │  • Promotions & Marketing    │
└───────────────────────────┘  └──────────────────────────────┘
```

## 📊 Timeline Overview

```
Month 1: ████████░░░░░░░░░░░░ Phase 1 (Auth) + Phase 6 setup
Month 2: ░░░░░░░░████████░░░░ Phase 2 (Search)
Month 3: ░░░░░░░░░░░░████████ Phase 3 (Booking)
Month 4: ████░░░░████████░░░░ Phase 4 (Social) + Phase 5.1-5.2
Month 5: ░░░░████████████░░░░ Phase 5.3-5.4 (Analytics/Promo)
Month 6: ░░░░░░░░████████████ Polish & Launch prep
```

## 🎯 Priority Matrix

```
        High Impact
             │
    P0       │    P1
  ┌──────────┼──────────┐
  │ Phase 1  │          │
  │ Phase 2  │ Phase 4  │
  │ Phase 3  │ Phase 5.3│
  │ Phase 5.1│ Phase 5.4│
  │ Phase 5.2│          │
──┼──────────┼──────────┼── Low Impact
  │          │          │
  │  Phase 6 (Enabling) │
  └──────────┴──────────┘
```

## 🔗 Dependencies Graph

```
                    Infrastructure (Phase 6)
                            │
                    ┌───────┼───────┐
                    ↓       ↓       ↓
               Auth    Search    Admin
             (Ph 1)   (Ph 2)   (Ph 5.1)
                │       │         │
                └───┬───┘         │
                    ↓             ↓
                Booking ──→ Admin Booking
                (Ph 3)      (Ph 5.2)
                    │             │
            ┌───────┼───────┐     ↓
            ↓               ↓  Analytics
        Group            Admin   (Ph 5.3)
        (Ph 4)          Promo      │
                       (Ph 5.4)    ↓
                                Marketing
```

## 📝 Issue Templates Content

Each template includes:

1. **Header** (YAML front matter)
   - name
   - about
   - title
   - labels
   - assignees

2. **Mô tả** - Vietnamese description

3. **Yêu cầu chức năng** - Detailed requirements with checkboxes
   - Feature breakdown
   - User flows
   - Business logic

4. **Database Schema** - Table structures and relationships

5. **API Endpoints** - Complete endpoint specifications

6. **Frontend Components** - UI component breakdown

7. **Testing** - Unit, integration, E2E requirements

8. **Tiêu chí chấp nhận** - Acceptance criteria

9. **Phụ thuộc** - Dependencies on other issues

10. **Công nghệ đề xuất** - Technology recommendations

11. **Ước lượng** - Effort and priority

12. **Ghi chú** - Important notes and warnings

## 🚀 Quick Start

1. Read `README_ISSUES_SUMMARY.md` for overview
2. Check `ISSUES_LIST.md` for all issues
3. Follow `HOW_TO_CREATE_ISSUES.md` to create issues
4. Start with Phase 6 (Infrastructure setup)
5. Then Phase 1 (Authentication)
6. Continue with phases in order

## 📚 Documentation Files

| File | Purpose | Size |
|------|---------|------|
| README.md | Original project description | 5.7 KB |
| ISSUES_LIST.md | Master list of all issues | 8.5 KB |
| HOW_TO_CREATE_ISSUES.md | Creation guide | 8.8 KB |
| README_ISSUES_SUMMARY.md | Quick summary | 5.2 KB |
| PROJECT_STRUCTURE.md | This file | - |

## 🏷️ Labels to Create

```yaml
Phases:
  - phase-1: "#1d76db" (blue)
  - phase-2: "#0e8a16" (green)
  - phase-3: "#fbca04" (yellow)
  - phase-4: "#d93f0b" (orange)
  - phase-5: "#e99695" (red)
  - phase-6: "#8957e5" (purple)

Features:
  - authentication: "#d4c5f9"
  - search: "#c5def5"
  - booking: "#bfdadc"
  - admin: "#fef2c0"
  - chat: "#c2e0c6"
  - social: "#f9d0c4"

Types:
  - enhancement: "#a2eeef"
  - bug: "#d73a4a"
  - documentation: "#0075ca"

Priority:
  - high: "#b60205"
  - medium: "#fbca04"
  - low: "#0e8a16"
```

## 🎓 Best Practices

1. **Start with Infrastructure** - Set up foundation first
2. **Follow Dependencies** - Build in logical order
3. **Test Early** - Don't skip testing
4. **Document As You Go** - Keep docs updated
5. **Security First** - Build security in from start
6. **Review Regularly** - Code reviews matter
7. **Iterate** - Start MVP, then enhance
8. **Communicate** - Use issues for discussions

---

*Generated: February 2, 2026*
*Repository: dannysnoop/booking-badminton*
