---
phase: 3
plan: "03-01"
title: "Announcements module — API + view + router wire-up"
subsystem: announcements
tags: [phase3, announcements, crud, api]
dependency_graph:
  requires: []
  provides:
    - api/announcements/index.php
    - api/announcements/store.php
    - api/announcements/update.php
    - api/announcements/destroy.php
    - assets/js/views/announcements.js
  affects:
    - dashboard (Total Announcements card)
    - Phase 4 approval workflow
tech_stack:
  added:
    - PHP CRUD endpoints (4 files)
    - JS view module with escapeHtml XSS defence
    - modal.js select field type
  patterns:
    - Copy-paste from programs.js — same CRUD structure
    - status='pending' hard-coded in store.php (Phase 4 approval deferred)
    - escapeHtml on every user-supplied string in innerHTML
    - Priority whitelist + secondary SELECT for 404 disambiguation
key_files:
  created:
    - api/announcements/index.php
    - api/announcements/store.php
    - api/announcements/update.php
    - api/announcements/destroy.php
    - assets/js/views/announcements.js
  modified:
    - db/seed.sql (replaced 3 old rows with 2 targeted)
    - assets/js/ui/modal.js (added select field type)
    - assets/js/router.js (replaced stubView with real loader)
decisions:
  - Seed 2 announcements (one approved, one pending) to populate dashboard card and give Phase 4 approval workflow something to act on
  - store.php hard-codes status='pending' server-side — client cannot smuggle a status value
  - update.php deliberately does NOT touch the status column — Phase 4 will add approve/reject endpoints
  - escapeHtml applied to every user-supplied string in innerHTML to prevent stored XSS
  - modal.js extended with select field type (needed by events.js in 03-02 and other modules)
metrics:
  duration: "~10 minutes"
  completed: "2026-04-17"
---

# Phase 3 Plan 01: Announcements Module — API + View + Router

## One-liner

Full CRUD module for Announcements — 4 PHP endpoints, live JS table with priority/status badges, add/edit/delete modals with toast feedback, seeded with 2 rows for dashboard and Phase 4 approval workflow.

## What was built

### API Layer (4 PHP files)

| File | What it does |
|------|-------------|
| `api/announcements/index.php` | List all announcements with author name (LEFT JOIN), no role gate |
| `api/announcements/store.php` | Create with `status='pending'` hard-coded server-side, priority whitelist, log_activity |
| `api/announcements/update.php` | Edit title/content/priority only (status untouched for Phase 4), secondary SELECT for 404 disambiguation |
| `api/announcements/destroy.php` | Fetch title before DELETE, prepared statement, log_activity |

All 4 return `{success, data, error}` JSON envelope. All reject unauthenticated requests with 401.

### Frontend (2 JS files)

- `assets/js/views/announcements.js` — full CRUD view:
  - Table with Title, Priority badge, Status badge, Author, hover-action edit/delete buttons
  - `priorityBadge()`: low=stone, normal=sky, high=red
  - `statusBadge()`: pending=amber, approved=emerald, rejected=red (display only — no edit control in this phase)
  - Add modal: title (text), content (textarea), priority (select: low/normal/high)
  - Edit modal: same fields, pre-filled
  - Delete: red confirm modal, logs activity, refreshes table
  - `escapeHtml()` on every user-supplied string before innerHTML injection (T-03-01-04)
  - Truncates long content in table cell; shows full content in Edit modal
- `assets/js/router.js` — `/announcements` route now dynamic-imports `loadAnnouncements`

### Seed Data (db/seed.sql)

Replaced 3 old announcement rows with 2 targeted ones:
- `approved, normal` — "Welcome to the new admin portal" (author_id=1)
- `pending, high` — "Midterm exam schedule posted" (author_id=1)

Added 2 matching `activities` rows for the Recent Activities feed.

### Infrastructure (modal.js)

Added `type: 'select'` support to `modal.openForm()` — renders `<select>` from `options` array with `value` preselected. Used by announcements.js priority dropdown. Will also be used by events.js (date picker), news.js, and other modules.

## Deviations from Plan

None — plan executed exactly as written.

## Threat Flags

| Flag | File | Description |
|------|------|-------------|
| MITIGATED | store.php | `status` hard-coded server-side — client cannot submit arbitrary status |
| MITIGATED | store/update.php | `priority` whitelisted against ['low','normal','high'] before bind |
| MITIGATED | announcements.js | `escapeHtml()` on every user-supplied string in innerHTML |
| ACCEPTED | destroy.php | Uses inline interpolation for secondary SELECT — already int-cast and safe; kept for readability over ceremony |
| ACCEPTED | CSRF | No CSRF tokens — same-origin session cookie, local admin tool only |

## Commits

| Hash | Message |
|------|---------|
| `9700aef` | feat(phase3): seed 2 announcements and matching activity rows |
| `668a10b` | feat(phase3): add announcements CRUD API — index, store, update, destroy |
| `e0e37f5` | feat(phase3): wire announcements view + router route |

## Verification Checklist

- [x] `api/announcements/index.php` returns 401 when no session
- [x] `api/announcements/index.php` returns array with id, title, content, status, priority, author_name, created_at, updated_at
- [x] `api/announcements/store.php` hard-codes `status='pending'`
- [x] `api/announcements/store.php` whitelists priority against ['low','normal','high']
- [x] `api/announcements/store.php` calls `log_activity(..., 'announcement', ..., 'announcements', $newId)`
- [x] `api/announcements/update.php` does NOT include `status` in UPDATE
- [x] `api/announcements/update.php` returns 404 when row not found (secondary SELECT)
- [x] `api/announcements/destroy.php` fetches title before DELETE
- [x] `assets/js/views/announcements.js` exports `loadAnnouncements`
- [x] `assets/js/views/announcements.js` calls `api.get/post` for all 4 operations
- [x] `assets/js/views/announcements.js` has `escapeHtml` applied to all user strings in innerHTML
- [x] `assets/js/views/announcements.js` has `priorityBadge` and `statusBadge` functions
- [x] `assets/js/views/announcements.js` refreshes table after Add/Edit/Delete (no optimistic-only)
- [x] `assets/js/router.js` `/announcements` loader dynamic-imports announcements.js
- [x] `db/seed.sql` has 2 announcements (approved + pending) with matching activities
- [x] `modal.js` supports `type: 'select'` with options array