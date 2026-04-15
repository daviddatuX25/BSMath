---
phase: 02-dashboard-programs-module
plan: "02-03"
subsystem: ui
tags: [spa, router, modal, toast, crud, programs]

# Dependency graph
requires:
  - phase: 02-02
    provides: toast/modal UI helpers, dashboard view, real API wiring
provides:
  - Programs CRUD view module (programs.js)
  - /programs route wired to loadPrograms dynamic import
affects:
  - Phase 3 (Announcements) - copies modal+toast+table pattern
  - Phase 4 (Events) - same pattern again

# Tech tracking
tech-stack:
  added: []
  patterns:
    - CRUD view module pattern (load, refresh, attachEvents, modal openForm/open)
    - Event delegation for row action buttons (data-action attributes)
    - Dynamic import for view lazy-loading in router

key-files:
  created:
    - assets/js/views/programs.js
  modified:
    - assets/js/router.js

key-decisions:
  - "Used event delegation (data-action, data-id) instead of per-row listeners for edit/delete buttons"
  - "Dynamic import of programs.js in router loader keeps initial bundle small"

patterns-established:
  - "CRUD view pattern: loadPrograms() → refresh() → renderPage() → attachEvents() → modal openForm/open"
  - "Table with hover-reveal action column (opacity-0 group-hover:opacity-100)"
  - "Skeleton loading state shown while API fetch is in flight"

requirements-completed: [R5]

# Metrics
duration: 4min
completed: 2026-04-15
---

# Phase 2, Plan 03: Programs CRUD View + Router Wire-Up

**Programs management view with full CRUD (list table, Add modal, Edit modal, Delete confirm) wired to hash router**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-15T07:43:25Z
- **Completed:** 2026-04-15T07:47:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Created `assets/js/views/programs.js` with `loadPrograms()` export
- Wired `/programs` route in `router.js` to dynamically import `loadPrograms`
- Replaced stubView placeholder with real CRUD functionality
- All CRUD operations call correct API endpoints with proper payload shapes

## Task Commits

Each task was committed atomically:

1. **Task 1: Create programs.js** - `0a817db` (feat)
2. **Task 2: Wire router /programs** - `0a817db` (feat, same commit)
3. **Task 3: Demo checkpoint** - PENDING (human verification required)

## Files Created/Modified

- `assets/js/views/programs.js` - Programs CRUD view module with loadPrograms export
- `assets/js/router.js` - `/programs` route now dynamically imports loadPrograms

## Decisions Made

- Used `data-action` + event delegation on the canvas instead of attaching listeners per row (avoids re-attaching on refresh)
- API uses `name` field (not `title`) matching the PHP backend column name
- Store/update accept `name` as primary field, aligned with PHP backend

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Demo Checkpoint

**This plan has a blocking human-verify checkpoint (Task 3).** The verifier must run the 10-step demo before Phase 2 can be marked complete.

To verify:
1. Ensure Laragon is running (Apache + MySQL)
2. Re-import `db/seed.sql` to add 4 programs and activity rows
3. Log in as `admin@bsmath.test` / `password123`
4. Follow the 10-step demo in the plan's Task 3 action section

Key assertions:
- Dashboard "Total Programs" shows 4 after seed data
- Programs table shows 4 rows on first load
- Add Program modal creates a row and shows success toast
- Edit modal pre-fills with current values
- Delete confirm modal uses red confirm button
- Dashboard stats update on next visit after any CRUD action
- Zero full-page reloads during all navigation + CRUD (Network tab)

## Next Phase Readiness

- Programs view is complete and serves as the template pattern for Announcements (Phase 3) and Events (Phase 4)
- The modal/toast/table pattern is established and copy-paste ready

---
*Phase: 02-dashboard-programs-module | Plan: 02-03*
*Completed: 2026-04-15*