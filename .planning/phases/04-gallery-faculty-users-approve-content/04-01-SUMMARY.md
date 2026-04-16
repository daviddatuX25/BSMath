---
phase: "04-gallery-faculty-users-approve-content"
plan: "04-01"
subsystem: api
tags: [php, mysqli, file-upload, password-hash, rbac, approval-workflow]

# Dependency graph
requires:
  - phase: "01-foundation-db-auth-spa-shell"
    provides: "Database schema, auth API, session management, log_activity helper"
provides:
  - "Gallery CRUD API with multipart file upload (admin + program_head)"
  - "Faculty CRUD API (admin only)"
  - "Users CRUD API with password hashing (admin only)"
  - "Dean approval workflow (index, approve, reject)"
  - "uploads/.htaccess to prevent PHP execution"
affects:
  - "04-02 (Gallery/Faculty/Users/Approvals UI)"
  - "03-content-modules-announcements-events-news (Phase 3 approvals)"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "mysqli prepared statements for all queries"
    - "password_hash() / PASSWORD_DEFAULT for user passwords"
    - "move_uploaded_file() with uniqid() prefix for safe filenames"
    - "Role whitelist validation before database writes"
    - "log_activity() calls on all write operations"
    - "multipart/form-data handling alongside JSON for gallery updates"

key-files:
  created:
    - "uploads/.htaccess"
    - "api/gallery/index.php, store.php, update.php, destroy.php"
    - "api/faculty/index.php, store.php, update.php, destroy.php"
    - "api/users/index.php, store.php, update.php, destroy.php"
    - "api/approvals/index.php, approve.php, reject.php"
    - "db/seed.sql (appended gallery + faculty seed rows)"
  modified: []

key-decisions:
  - "Gallery update.php handles both multipart/form-data and JSON — same endpoint supports both file replacement and text-only updates"
  - "Users update.php conditionally updates password only when a new one is provided (empty string skips)"
  - "Approvals index.php allows admin+dean to view, but approve.php/reject.php require dean role only"
  - "uploads/.htaccess uses both php_flag engine off and SetHandler default-handler for defense in depth"
  - "Faculty/Users destroy.php fetches entity metadata before deletion for meaningful activity log messages"

patterns-established:
  - "File upload endpoints validate type whitelist, size limit, and use uniqid() prefix before move_uploaded_file()"
  - "RBAC enforced at top of every endpoint: 401 for unauthenticated, 403 for wrong role"
  - "Activity logging: log_activity($conn, $userId, $type, $description, $entityType, $entityId)"

requirements-completed:
  - "R5"
  - "R6"
  - "R7"
  - "R8"
  - "R9"
  - "R10"
  - "R11"
  - "R12"
  - "R13"

# Metrics
duration: 393s
completed: 2026-04-16
---

# Phase 04-01: Backend APIs: Gallery, Faculty, Users, Approvals Summary

**Gallery CRUD with multipart file upload, Faculty CRUD, Users CRUD with password_hash(), and Dean approval workflow — all using prepared statements and RBAC enforcement**

## Performance

- **Duration:** 6 min 33 sec
- **Started:** 2026-04-16T17:59:59Z
- **Completed:** 2026-04-16T18:06:33Z
- **Tasks:** 10
- **Files created:** 17 (18 files including seed.sql modification)

## Accomplishments

- Gallery API (index, store, update, destroy) with file upload: validates type (jpg/png/gif/webp), size (5MB max), uses uniqid() prefix for collision safety, moves to uploads/gallery/
- Faculty API (index, store, update, destroy) admin-only with email validation (http://https://) and status whitelist (active/inactive)
- Users API (index, store, update, destroy) admin-only with password_hash() hashing, email uniqueness checks (including on update excluding self), and self-deletion prevention
- Approvals API: index returns pending announcements+events for admin+dean; approve/reject endpoints set status and approved_by for dean only
- uploads/.htaccess blocks PHP execution (php_flag engine off + SetHandler default-handler)
- Seed data appended: 3 gallery images (Unsplash URLs) + 4 faculty members (one with NULL image_url)

## Task Commits

All 10 tasks committed atomically in a single commit:

- **Task 1-10: Phase 04-01 backend APIs** - `1bf0c57` (feat)

**Plan metadata:** `1bf0c57` (feat: complete Phase 4 backend APIs plan)

## Files Created/Modified

- `uploads/.htaccess` - Blocks PHP execution in upload directory
- `uploads/gallery/.gitkeep` - Git-tracked empty directory marker
- `api/gallery/index.php` - Returns gallery images with uploader name (admin + program_head)
- `api/gallery/store.php` - Multipart file upload with validation and safe filename
- `api/gallery/update.php` - Handles both multipart and JSON, optional file replacement
- `api/gallery/destroy.php` - Deletes DB row and image file from disk
- `api/faculty/index.php` - Returns faculty list with creator name (admin only)
- `api/faculty/store.php` - Creates faculty with image_url validation (admin only)
- `api/faculty/update.php` - Updates faculty fields with status whitelist (admin only)
- `api/faculty/destroy.php` - Deletes faculty after fetching name for log (admin only)
- `api/users/index.php` - Returns users without password hashes (admin only)
- `api/users/store.php` - Creates user with password_hash(), email uniqueness check (admin only)
- `api/users/update.php` - Optional password update, email uniqueness excluding self (admin only)
- `api/users/destroy.php` - Prevents self-deletion, fetches name+role before delete (admin only)
- `api/approvals/index.php` - Returns pending announcements + events with type field (admin + dean)
- `api/approvals/approve.php` - Sets status=approved, approved_by (dean only)
- `api/approvals/reject.php` - Sets status=rejected, approved_by (dean only)
- `db/seed.sql` - Appended 3 gallery + 4 faculty seed rows

## Decisions Made

- Used `uniqid() . '_' . $safe` filename pattern for gallery uploads to prevent collision and preserve extension for browser rendering
- Approvals approve/reject use dynamic table name via ternary (announcements vs events) with type whitelist validation to prevent injection
- Gallery destroy fetches image_url from DB before delete, then unlinks silently (@unlink) — file cleanup failure doesn't affect API response
- Users update conditionally builds SQL: if password provided, 4-field UPDATE; if empty, 3-field UPDATE (skips password entirely)

## Deviations from Plan

**None - plan executed exactly as written.**

## Issues Encountered

None.

## Threat Surface Notes

| Threat ID | Category | File | Status |
|-----------|----------|------|--------|
| T-04-01 | Elevation of Privilege | api/users/store.php | Mitigated: role whitelist |
| T-04-02 | Spoofing | api/users/store.php | Mitigated: email uniqueness check |
| T-04-03 | Tampering | api/users/destroy.php | Mitigated: self-deletion blocked |
| T-04-04 | Information Disclosure | api/users/index.php | Mitigated: password excluded from SELECT |
| T-04-05 | Injection | api/gallery/store.php | Mitigated: type whitelist + safe filename |
| T-04-06 | Remote Code Execution | uploads/.htaccess | Mitigated: php_flag engine off |
| T-04-07 | Elevation of Privilege | api/approvals/approve.php | Mitigated: type whitelist + status check |
| T-04-08 | Injection | api/gallery/destroy.php | Flagged: @unlink suppresses errors — acceptable |

## Self-Check

- [x] All 17 files created
- [x] uploads/.htaccess contains `php_flag engine off` and `SetHandler default-handler`
- [x] api/gallery/store.php contains `move_uploaded_file`
- [x] api/users/store.php contains `password_hash`
- [x] api/approvals/index.php contains `status = 'pending'`
- [x] Faculty admin-only (403 for dean/program_head)
- [x] Users never return passwords
- [x] Approvals approve/reject dean-only
- [x] Seed data appended to db/seed.sql
- [x] All endpoints use prepared statements
- [x] All write endpoints call log_activity
- [x] Commit hash: 1bf0c57

## Next Phase Readiness

Phase 04-02 (UI for Gallery, Faculty, Users, Approvals) is ready to begin. All API endpoints are implemented with correct RBAC, prepared statements, and logging. Seed data provides test content.

---
*Phase: 04-gallery-faculty-users-approve-content*
*Plan: 04-01*
*Completed: 2026-04-16*
