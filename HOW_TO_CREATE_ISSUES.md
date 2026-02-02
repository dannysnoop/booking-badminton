# Hướng dẫn Tạo GitHub Issues

## Cách tạo issues từ templates

### Bước 1: Truy cập GitHub Repository
1. Mở trình duyệt và truy cập: https://github.com/dannysnoop/booking-badminton
2. Đăng nhập vào tài khoản GitHub của bạn

### Bước 2: Tạo Issue Mới
1. Click vào tab **Issues**
2. Click nút **New Issue** (màu xanh lá)

### Bước 3: Chọn Template (nếu có) hoặc Tạo Blank Issue
- Nếu template đã được setup: chọn template phù hợp
- Nếu chưa có: click **Open a blank issue**

### Bước 4: Copy Nội Dung từ Template
1. Mở file template trong thư mục `.github/ISSUE_TEMPLATE/`
2. Ví dụ: mở file `phase1-1-user-registration.md`
3. Copy toàn bộ nội dung (bao gồm cả phần metadata ở đầu)
4. Paste vào issue form trên GitHub

### Bước 5: Điền Thông Tin
1. **Title**: Đã có sẵn trong template (ví dụ: `[Phase 1.1] Implement User Registration`)
2. **Description**: Đã có đầy đủ trong template
3. **Labels**: Thêm các labels:
   - Phase labels: `phase-1`, `phase-2`, etc.
   - Feature labels: `authentication`, `booking`, `admin`, etc.
   - Type: `enhancement`, `bug`, `documentation`
   - Priority: `high`, `medium`, `low`
4. **Assignees**: Assign cho team member phù hợp
5. **Projects**: Thêm vào project board (nếu có)
6. **Milestone**: Chọn milestone tương ứng với phase

### Bước 6: Submit
- Click **Submit new issue**
- Issue được tạo với số ID (ví dụ: #1, #2, etc.)

## Tạo Tất Cả Issues Cùng Lúc (Recommended)

Để tạo tất cả 11 issues một cách nhanh chóng:

### Sử dụng GitHub CLI (gh)

```bash
# Cài đặt GitHub CLI (nếu chưa có)
# macOS: brew install gh
# Windows: choco install gh
# Linux: https://github.com/cli/cli#installation

# Login
gh auth login

# Tạo issues từ templates
cd .github/ISSUE_TEMPLATE

# Phase 1
gh issue create --title "[Phase 1.1] Implement User Registration" --body-file phase1-1-user-registration.md --label "authentication,enhancement,phase-1"
gh issue create --title "[Phase 1.2] Implement Email/SMS Verification" --body-file phase1-2-email-sms-verification.md --label "authentication,enhancement,phase-1"
gh issue create --title "[Phase 1.3] Implement Login System" --body-file phase1-3-login-system.md --label "authentication,enhancement,phase-1"
gh issue create --title "[Phase 1.4] Advanced Authentication Features" --body-file phase1-4-advanced-auth.md --label "authentication,enhancement,phase-1"

# Phase 2
gh issue create --title "[Phase 2.1] Implement Court Search Functionality" --body-file phase2-1-court-search.md --label "search,enhancement,phase-2"
gh issue create --title "[Phase 2.2] Implement Court Detail View" --body-file phase2-2-court-details.md --label "court-details,enhancement,phase-2"

# Phase 3
gh issue create --title "[Phase 3.1] Implement Booking System" --body-file phase3-1-booking-system.md --label "booking,enhancement,phase-3"
gh issue create --title "[Phase 3.2] Implement Booking Management" --body-file phase3-2-booking-management.md --label "booking,enhancement,phase-3"

# Phase 4
gh issue create --title "[Phase 4] Group Booking, Invitations & Chat" --body-file phase4-group-booking-chat.md --label "social,group-booking,chat,enhancement,phase-4"

# Phase 5
gh issue create --title "[Phase 5.1] Admin - Court Management" --body-file phase5-1-admin-court-management.md --label "admin,court-management,enhancement,phase-5"
gh issue create --title "[Phase 5.2] Admin - Booking Management" --body-file phase5-2-admin-booking-management.md --label "admin,booking-management,enhancement,phase-5"
gh issue create --title "[Phase 5.3] Admin - Statistics & Reporting" --body-file phase5-3-admin-analytics.md --label "admin,analytics,reporting,enhancement,phase-5"
gh issue create --title "[Phase 5.4] Admin - Promotions & Marketing" --body-file phase5-4-admin-promotions.md --label "admin,promotions,marketing,enhancement,phase-5"

# Phase 6
gh issue create --title "[Phase 6] Infrastructure & Documentation" --body-file phase6-infrastructure.md --label "infrastructure,documentation,enhancement,phase-6"
```

### Hoặc Sử dụng Script Python

Tạo file `create_issues.py`:

```python
import os
import subprocess

template_dir = ".github/ISSUE_TEMPLATE"

issues = [
    {
        "title": "[Phase 1.1] Implement User Registration",
        "file": "phase1-1-user-registration.md",
        "labels": "authentication,enhancement,phase-1"
    },
    {
        "title": "[Phase 1.2] Implement Email/SMS Verification",
        "file": "phase1-2-email-sms-verification.md",
        "labels": "authentication,enhancement,phase-1"
    },
    {
        "title": "[Phase 1.3] Implement Login System",
        "file": "phase1-3-login-system.md",
        "labels": "authentication,enhancement,phase-1"
    },
    {
        "title": "[Phase 1.4] Advanced Authentication Features",
        "file": "phase1-4-advanced-auth.md",
        "labels": "authentication,enhancement,phase-1"
    },
    {
        "title": "[Phase 2.1] Implement Court Search Functionality",
        "file": "phase2-1-court-search.md",
        "labels": "search,enhancement,phase-2"
    },
    {
        "title": "[Phase 2.2] Implement Court Detail View",
        "file": "phase2-2-court-details.md",
        "labels": "court-details,enhancement,phase-2"
    },
    {
        "title": "[Phase 3.1] Implement Booking System",
        "file": "phase3-1-booking-system.md",
        "labels": "booking,enhancement,phase-3"
    },
    {
        "title": "[Phase 3.2] Implement Booking Management",
        "file": "phase3-2-booking-management.md",
        "labels": "booking,enhancement,phase-3"
    },
    {
        "title": "[Phase 4] Group Booking, Invitations & Chat",
        "file": "phase4-group-booking-chat.md",
        "labels": "social,group-booking,chat,enhancement,phase-4"
    },
    {
        "title": "[Phase 5.1] Admin - Court Management",
        "file": "phase5-1-admin-court-management.md",
        "labels": "admin,court-management,enhancement,phase-5"
    },
    {
        "title": "[Phase 5.2] Admin - Booking Management",
        "file": "phase5-2-admin-booking-management.md",
        "labels": "admin,booking-management,enhancement,phase-5"
    },
    {
        "title": "[Phase 5.3] Admin - Statistics & Reporting",
        "file": "phase5-3-admin-analytics.md",
        "labels": "admin,analytics,reporting,enhancement,phase-5"
    },
    {
        "title": "[Phase 5.4] Admin - Promotions & Marketing",
        "file": "phase5-4-admin-promotions.md",
        "labels": "admin,promotions,marketing,enhancement,phase-5"
    },
    {
        "title": "[Phase 6] Infrastructure & Documentation",
        "file": "phase6-infrastructure.md",
        "labels": "infrastructure,documentation,enhancement,phase-6"
    }
]

for issue in issues:
    filepath = os.path.join(template_dir, issue["file"])
    cmd = [
        "gh", "issue", "create",
        "--title", issue["title"],
        "--body-file", filepath,
        "--label", issue["labels"]
    ]
    print(f"Creating issue: {issue['title']}")
    subprocess.run(cmd)
    print(f"✓ Created successfully\n")

print("All issues created!")
```

Chạy script:
```bash
python create_issues.py
```

## Sau Khi Tạo Issues

### 1. Tạo Labels (nếu chưa có)
Vào Settings > Labels và tạo các labels:
- `phase-1`, `phase-2`, `phase-3`, `phase-4`, `phase-5`, `phase-6`
- `authentication`, `search`, `booking`, `admin`, `chat`, `social`
- `enhancement`, `bug`, `documentation`
- `high`, `medium`, `low`

### 2. Tạo Milestones
Vào Issues > Milestones > New milestone:
- Phase 1: Authentication (Due date: +1 month)
- Phase 2: Search & Details (Due date: +2 months)
- Phase 3: Booking System (Due date: +3 months)
- Phase 4: Group Features (Due date: +4 months)
- Phase 5: Admin Panel (Due date: +5 months)
- Phase 6: Infrastructure (Due date: ongoing)

### 3. Tạo Project Board
1. Vào Projects > New project
2. Chọn "Board" template
3. Tạo columns: Backlog, Todo, In Progress, Review, Done
4. Add issues vào project board
5. Move issues theo progress

### 4. Assign Issues
- Assign issues cho các team members
- Set priority và labels
- Link related issues

## Tips

1. **Chia nhỏ issues**: Các issue lớn có thể chia thành sub-issues nhỏ hơn
2. **Update thường xuyên**: Cập nhật progress trong issue comments
3. **Cross-reference**: Dùng `#issue_number` để reference issues khác
4. **Close issues**: Close khi hoàn thành với `Closes #X` trong PR description
5. **Use templates**: Luôn dùng templates để đảm bảo consistency

## Tài Liệu Tham Khảo

- [GitHub Issues Documentation](https://docs.github.com/en/issues)
- [GitHub CLI Documentation](https://cli.github.com/manual/)
- [Creating Issue Templates](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/configuring-issue-templates-for-your-repository)
