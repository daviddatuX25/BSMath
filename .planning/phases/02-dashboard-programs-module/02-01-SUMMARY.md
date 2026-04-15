---
phase: 2
plan: "02-01"
subsystem: backend-api
tags: [php, mysqli, rbac, crud, activities]
dependency_graph:
  requires: [01-01, 01-02, 01-03]
  provides: [dashboard-stats-api, dashboard-activities-api, programs-crud-api]
  affects: [02-02, 02-03]
tech_stack:
  added: []
  patterns: [repository-pattern, activity-logging, rbac-guard, prepared-statements]
key_files:
  created:
    - api/helpers/log_activity.php
    - api/dashboard/stats.php
    - api/dashboard/activities.php
    - api/programs/index.php
    - api/programs/store.php
    - api/programs/update.php
    - api/programs/destroy.php
  modified:
    - db/seed.sql
decisions:
  - "Used schema column 'name' instead of plan's 'title' for programs — matches actual DB schema"
  - "Added 'code' auto-generation in store.php (initials from name) — schema requires NOT NULL UNIQUE code"
  - "log_activity() signature extended to accept type, entityType, entityId — matches multi-column activities schema"
  - "update.php skips code update if not provided — prevents accidental unique constraint violations"
  - "update.php 0-affected-rows check queries DB to distinguish 'no change' from 'not found'"
metrics:
  duration: "~20 minutes"
  completed: "2026-04-15"
  tasks_completed: 5
  files_created: 7
  files_modified: 1
---

# Phase 2 Plan 01: Backend — Dashboard API + Programs CRUD API Summary

**One-liner:** PHP API layer for dashboard stats/activities feed and full Programs CRUD with RBAC, prepared statements, and activity logging against the actual 8-column schema.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Seed 4 programs + activities | ac198c5 | db/seed.sql |
| 2 | Create log_activity helper | ac198c5 | api/helpers/log_activity.php |
| 3 | Dashboard stats + activities endpoints | ac198c5 | api/dashboard/stats.php, api/dashboard/activities.php |
| 4 | Programs index + store endpoints | ac198c5 | api/programs/index.php, api/programs/store.php |
| 5 | Programs update + destroy endpoints | ac198c5 | api/programs/update.php, api/programs/destroy.php |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Schema column mismatch: `title` vs `name` in programs table**
- **Found during:** Task 1 (reading schema.sql)
- **Issue:** Plan used `title` throughout, but the actual `programs` table schema uses `name` as the column. Plan was written assuming a simpler schema.
- **Fix:** All endpoints use `name` column. `store.php` and `update.php` also accept `title` as an alias for frontend flexibility.
- **Files modified:** api/programs/index.php, store.php, update.php, destroy.php
- **Commit:** ac198c5

**2. [Rule 2 - Missing Critical Functionality] programs.code is NOT NULL UNIQUE**
- **Found during:** Task 4 (reading schema.sql)
- **Issue:** Plan's `store.php` body only contained `title` and `description`. The `code` column is NOT NULL UNIQUE — INSERT would fail without it.
- **Fix:** `store.php` auto-generates a code from name initials if not provided. Returns HTTP 409 on duplicate code conflict.
- **Files modified:** api/programs/store.php
- **Commit:** ac198c5

**3. [Rule 1 - Bug] log_activity() signature mismatch with actual activities schema**
- **Found during:** Task 2 (reading schema.sql)
- **Issue:** Plan specified `INSERT INTO activities (user_id, action)` but schema has `type` (NOT NULL), `description` (NOT NULL), `entity_type`, `entity_id` columns. No `action` column exists.
- **Fix:** Helper signature adapted to `log_activity($conn, $userId, $type, $description, $entityType, $entityId)`.
- **Files modified:** api/helpers/log_activity.php (already existed with correct signature from prior work)
- **Commit:** ac198c5

**4. [Rule 1 - Bug] activities.php returned `action` field — column does not exist**
- **Found during:** Task 3 (files already existed from prior session)
- **Status:** Already correctly using `a.description` and `a.type` — no fix needed, prior execution adapted correctly.

**5. [Rule 2 - Missing Critical Functionality] update.php: 0-affected-rows ambiguity**
- **Found during:** Task 5
- **Issue:** `mysqli_stmt_affected_rows()` returns 0 for both "no rows changed" (same data sent) AND "record not found". Plan's simple `if ($affected === 0) → 404` incorrectly returns 404 when data is unchanged.
- **Fix:** Added a secondary SELECT to confirm record existence when affected=0, only returning 404 if the record genuinely does not exist.
- **Files modified:** api/programs/update.php
- **Commit:** ac198c5

## Pre-existing Files

Three files (`api/helpers/log_activity.php`, `api/dashboard/stats.php`, `api/dashboard/activities.php`) already existed from a prior session's partial execution. They were already correctly adapted to the real schema. No changes were needed — they passed all acceptance criteria.

## Must-Have Verification

| Requirement | Status |
|-------------|--------|
| GET dashboard/stats returns {programs, announcements, events, users} counts | Done — stats.php has 4-subquery SELECT |
| GET dashboard/activities returns last 10 rows | Done — activities.php: ORDER BY DESC LIMIT 10 |
| GET programs/index returns all programs (Admin + Program Head only) | Done — 403 guard on dean |
| POST programs/store creates program + logs activity | Done — INSERT + log_activity() |
| POST programs/update updates program + logs activity | Done — UPDATE + log_activity() |
| POST programs/destroy deletes program + logs activity | Done — name fetched before DELETE |
| All endpoints return 403 for wrong role | Done — in_array(['admin','program_head']) guard |
| db/seed.sql has 4 programs | Done — BSMATH, APMATH, MEDUMATH, PMATH |

## Known Stubs

None — all endpoints are fully wired to the database.

## Threat Flags

No new threat surface beyond what was declared in the plan's threat model. All DB writes use prepared statements. `$id` in the title-fetch query is cast to `(int)` — injection-safe per T-02-01-03.

## Self-Check: PASSED

- `D:\Projects\BSMath\api\programs\index.php` — FOUND
- `D:\Projects\BSMath\api\programs\store.php` — FOUND
- `D:\Projects\BSMath\api\programs\update.php` — FOUND
- `D:\Projects\BSMath\api\programs\destroy.php` — FOUND
- `D:\Projects\BSMath\api\helpers\log_activity.php` — FOUND
- `D:\Projects\BSMath\api\dashboard\stats.php` — FOUND
- `D:\Projects\BSMath\api\dashboard\activities.php` — FOUND
- `D:\Projects\BSMath\db\seed.sql` — FOUND, updated
- Commit `ac198c5` — created with 8 files changed
