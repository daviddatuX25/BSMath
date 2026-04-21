---
phase: "03"
plan: "03-02"
subsystem: events
tags: [phase3, events, crud, api, rbac]

dependency_graph:
  requires:
    - phase: "03-01"
      provides: announcements CRUD API + view module as template
  provides:
    - api/events/index.php
    - api/events/store.php
    - api/events/update.php
    - api/events/destroy.php
    - assets/js/views/events.js
  affects:
    - dashboard (Total Events card)
    - Phase 4 approval workflow

tech_stack:
  added:
    - PHP CRUD endpoints (4 files)
    - JS view module with escapeHtml XSS defence
  patterns:
    - Copy-paste from announcements.js — same CRUD structure
    - status='pending' hard-coded in store.php (Phase 4 approval deferred)
    - escapeHtml on every user-supplied string in innerHTML
    - role check admin+dean only for events (stricter than announcements)

key_files:
  created:
    - api/events/index.php
    - api/events/store.php
    - api/events/update.php
    - api/events/destroy.php
    - assets/js/views/events.js
  modified:
    - assets/js/router.js (replaced stubView with real loader, restricted roles to admin+dean)

key_decisions:
  - "Events use description column (not content like announcements) — adapted SQL and form fields accordingly"
  - "Events have no priority column — statusBadge only, no priorityBadge"
  - "Role restriction tighter than announcements: admin+dean only (no program_head) — enforced at router AND server"
  - "event_time stored as TIME in DB, sliced to HH:MM in edit form (HTML time input format)"
  - "Date display formatted as 'May 10, 2026' via formatDate helper"

patterns_established:
  - "events.js follows announcements.js structure — same skeleton/refresh/render cycle, same modal helpers"
  - "All write endpoints call log_activity with type='event' and entity_type='events'"
  - "store.php hard-codes status='pending' server-side — client cannot smuggle a status value"

requirements_completed: [R6]

metrics:
  duration: "~3 minutes"
  completed: "2026-04-17"
---

# Phase 3 Plan 02: Events Module — API + View + Router

**Full CRUD module for Events — 4 PHP endpoints, live JS table with date/time/location fields, add/edit/delete modals with toast feedback. Admin and Dean only. Status defaults to 'pending' for Phase 4 approval workflow.**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-04-17T00:00:00Z (approximate)
- **Completed:** 2026-04-17
- **Tasks:** 6
- **Files modified:** 6

## Accomplishments
- 4 PHP CRUD endpoints under api/events/ (index, store, update, destroy)
- JS view module with live table, status badges, formatted date/time display
- Router wired with admin+dean-only roles (program_head blocked at both router and server)
- EscapeHtml XSS defence on all user-supplied strings
- No full-page reloads during any CRUD operation

## Task Commits

Each task was committed atomically:

1. **Task 1: api/events/index.php** - `8f433ae` (feat)
2. **Task 2: api/events/store.php** - `8f433ae` (feat)
3. **Task 3: api/events/update.php** - `8f433ae` (feat)
4. **Task 4: api/events/destroy.php** - `8f433ae` (feat)
5. **Task 5: assets/js/views/events.js** - `c9502f3` (feat)
6. **Task 6: assets/js/router.js (events route)** - `d023458` (feat)

## Files Created/Modified

- `api/events/index.php` — List all events with author name (LEFT JOIN), admin+dean only
- `api/events/store.php` — Create with status='pending' hard-coded, date format validation, log_activity
- `api/events/update.php` — Edit title/description/event_date/event_time/location (status untouched), secondary SELECT for 404 disambiguation
- `api/events/destroy.php` — Fetch title before DELETE, prepared statement, log_activity
- `assets/js/views/events.js` — Full CRUD view: table with status badge, date/time/location columns, form modals, toast feedback, escapeHtml, formatDate, formatTime
- `assets/js/router.js` — /events route now dynamic-imports loadEvents, roles restricted to ['admin', 'dean']

## Decisions Made

- Events use `description` column (not `content` like announcements) — SQL and form fields adapted accordingly
- Events have no `priority` column — `statusBadge` only, no `priorityBadge`
- Role restriction is tighter than announcements: admin+dean only, program_head gets 403 at both router and server level
- `event_time` stored as TIME in DB, sliced to HH:MM in edit form (HTML time input format)
- Date display formatted as "May 10, 2026" via `formatDate` helper
- Events table starts empty (no seed data) — user creates events during Phase 3 usage

## Deviations from Plan

None — plan executed exactly as written.

## Threat Flags

| Flag | File | Description |
|------|------|-------------|
| MITIGATED | store.php | `status` hard-coded server-side — client cannot submit arbitrary status |
| MITIGATED | store/update.php | `event_date` validated with `preg_match('/^\d{4}-\d{2}-\d{2}$/')` before bind |
| MITIGATED | events.js | `escapeHtml()` on every user-supplied string in innerHTML |
| MITIGATED | All endpoints | Role check `['admin','dean']` enforced server-side — program_head gets 403 |
| ACCEPTED | CSRF | No CSRF tokens — same-origin session cookie, local admin tool only |

## Verification Checklist

- [x] `api/events/index.php` returns 401 when no session
- [x] `api/events/index.php` returns 403 when role is program_head
- [x] `api/events/index.php` returns array with id, title, description, event_date, event_time, location, status, author_name, created_at, updated_at
- [x] `api/events/store.php` hard-codes `status='pending'`
- [x] `api/events/store.php` validates event_date format
- [x] `api/events/store.php` calls `log_activity(..., 'event', ..., 'events', $newId)`
- [x] `api/events/update.php` does NOT include `status` in UPDATE
- [x] `api/events/update.php` returns 404 when row not found (secondary SELECT)
- [x] `api/events/destroy.php` fetches title before DELETE
- [x] `assets/js/views/events.js` exports `async function loadEvents`
- [x] `assets/js/views/events.js` calls `api.get('events/index.php')` inside refresh
- [x] `assets/js/views/events.js` calls `api.post` for store/update/destroy
- [x] `assets/js/views/events.js` has `statusBadge` (no `priorityBadge`)
- [x] `assets/js/views/events.js` has `formatDate` and `formatTime` helpers
- [x] `assets/js/views/events.js` applies `escapeHtml` to all user strings in innerHTML
- [x] `assets/js/router.js` `/events` loader dynamic-imports events.js
- [x] `assets/js/router.js` `/events` has roles `['admin', 'dean']` only
- [x] Empty-state branch renders when `items.length === 0`
- [x] Table refreshes from server after Add/Edit/Delete

---
*Phase: 03-02*
*Completed: 2026-04-17*
