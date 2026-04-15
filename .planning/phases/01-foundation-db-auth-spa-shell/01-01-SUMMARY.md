# 01-01 Foundation: Database & Auth - Summary

## What Was Built

### Files Created

| File | Description |
|------|-------------|
| `db/schema.sql` | 8-table database schema |
| `db/seed.sql` | Demo data with 3 users + sample records |
| `api/connect.php` | MySQLi connection with JSON error envelope |

### Database Schema (8 Tables)

1. **users** - Admin accounts with RBAC roles (admin, dean, program_head)
2. **programs** - Academic programs with status tracking
3. **announcements** - Department announcements with approval workflow
4. **events** - Department events with approval workflow
5. **news** - News articles (admin only)
6. **gallery** - Image gallery with uploader tracking
7. **faculty** - Faculty members with specialization
8. **activities** - Recent activities feed for dashboard

### Demo Users

| Email | Role | Password |
|-------|------|----------|
| admin@bsmath.test | admin | password123 |
| dean@bsmath.test | dean | password123 |
| head@bsmath.test | program_head | password123 |

All passwords hashed with bcrypt (`password_hash`, PASSWORD_BCRYPT).

### API Connection Pattern

`api/connect.php` follows the ws4.2 pattern:
- Uses MySQLi
- Sets JSON content-type header
- Exports `$conn` variable
- Returns `{success: false, data: null, error: "..."}` envelope on failure
- Sets UTF-8 charset

## Verification

- PHP syntax checked: No errors
- All files committed with conventional commit messages
