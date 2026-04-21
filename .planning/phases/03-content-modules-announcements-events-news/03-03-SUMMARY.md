---
phase: "03"
plan: "03-03"
title: "News module + Phase 3 demo checkpoint"
subsystem: news
tags: [phase3, news, crud, api, rbac]
dependency_graph:
  requires:
    - phase: "03-01"
      provides: announcements CRUD API + view module as template
    - phase: "03-02"
      provides: events CRUD API + view module as template
  provides:
    - api/news/index.php
    - api/news/store.php
    - api/news/update.php
    - api/news/destroy.php
    - assets/js/views/news.js
  affects:
    - dashboard (Total News card)
    - Phase 4 approval workflow
tech_stack:
  added:
    - PHP CRUD endpoints (4 files)
    - JS view module with escapeHtml XSS defence
  patterns:
    - Copy-paste from announcements.js — same CRUD structure
    - status='draft' hard-coded in store.php (admin publishes manually via update.php)
    - escapeHtml on every user-supplied string in innerHTML
    - status enum: published/draft/archived (DIFFERENT from announcements' pending/approved/rejected)
    - role check admin-only for news (stricter than announcements and events)
key_files:
  created:
    - api/news/index.php
    - api/news/store.php
    - api/news/update.php
    - api/news/destroy.php
    - assets/js/views/news.js
  modified:
    - assets/js/router.js (replaced stubView with real loader, roles: ['admin'])
key_decisions:
  - "News uses published/draft/archived status enum — NOT pending/approved/rejected (different from announcements)"
  - "store.php hard-codes status='draft' server-side — client cannot smuggle a status value"
  - "update.php DOES include status in UPDATE — admin controls publish/archive via edit modal"
  - "Edit modal has status dropdown (published/draft/archived); Add modal has no status field"
  - "image_url validated to start with http:// or https:// — blocks data: URIs and javascript: protocol"
  - "escapeHtml applied to status badge span text AND to all user-supplied strings in innerHTML"
  - "news.js mirrors announcements.js structure with: skeleton loader, table with image thumbnail, modals"
patterns_established:
  - "news.js follows announcements.js/events.js skeleton — same refresh/render/attach cycle, same modal helpers"
  - "All write endpoints call log_activity with type='news' and entity_type='news'"
  - "router.js /news loader dynamic-imports news.js with roles: ['admin'] only"
requirements_completed: [R7]
metrics:
  duration: "~2 minutes"
  completed: "2026-04-17"
---

# Phase 3 Plan 03: News Module — API + View + Router

**Full CRUD module for News — 4 PHP endpoints, live JS table with image thumbnails, status badges (published/draft/archived), add/edit/delete modals. Admin only. Status defaults to 'draft' for manual publishing by admin.**

## What was built

### API Layer (4 PHP files under api/news/)

| File | What it does |
|------|-------------|
| `api/news/index.php` | List all news articles with author name (LEFT JOIN), admin-only (403 for dean/program_head) |
| `api/news/store.php` | Create with `status='draft'` hard-coded server-side, image_url URL validation, log_activity |
| `api/news/update.php` | Edit title/content/image_url/status, status whitelist (published/draft/archived), secondary SELECT for 404 disambiguation |
| `api/news/destroy.php` | Fetch title before DELETE, prepared statement, log_activity |

All 4 return `{success, data, error}` JSON envelope. All reject unauthenticated requests with 401 and non-admin roles with 403.

### Frontend (assets/js/views/news.js)

- Full CRUD view mirroring announcements.js structure:
  - Table with Article (image thumbnail + title + truncated content), Status badge, Author, Date, hover-action edit/delete buttons
  - `statusBadge()`: published=emerald, draft=amber, archived=stone (DIFFERENT from announcements)
  - Add modal: Title (text), Content (textarea), Image URL (text, optional) — NO status field
  - Edit modal: Title + Content + Image URL + **Status dropdown** (published/draft/archived) — admin controls publish/archive
  - Delete: red confirm modal, logs activity, refreshes table
  - `escapeHtml()` on every user-supplied string before innerHTML injection
  - Image thumbnail preview in table (with `onerror` fallback hide)
  - Truncates long content in table cell; shows full content in Edit modal

### Router (assets/js/router.js)

`/news` route now dynamic-imports `loadNews` with `roles: ['admin']` only. Dean and program_head are blocked at the router level AND at the server level.

## Task Commits

Each task was committed atomically:

1. **Task 1-4: api/news/*.php** - `d2e1d08` (feat)
2. **Task 5: assets/js/views/news.js** - `2895e03` (feat)
3. **Task 6: assets/js/router.js (news route)** - `c44f62f` (feat)

## Files Created/Modified

- `api/news/index.php` — List all news with author name (LEFT JOIN), admin-only role check
- `api/news/store.php` — Create with status='draft' hard-coded, image_url URL validation, log_activity
- `api/news/update.php` — Edit title/content/image_url/status, status whitelist, secondary SELECT for 404
- `api/news/destroy.php` — Fetch title before DELETE, prepared statement, log_activity
- `assets/js/views/news.js` — Full CRUD view: table with image thumbnail, status badges, form modals, toast feedback, escapeHtml, formatDate
- `assets/js/router.js` — /news route now dynamic-imports loadNews, roles restricted to ['admin']

## Decisions Made

- News uses `published/draft/archived` status enum (NOT `pending/approved/rejected`) — this is a hard constraint from the schema
- `store.php` hard-codes `status='draft'` server-side — client cannot force 'published'
- `update.php` DOES include status in UPDATE — admin explicitly publishes/archives via edit modal status dropdown
- `image_url` validated to start with `http://` or `https://` — blocks `data:` URIs, `javascript:` protocol, and local paths
- `escapeHtml` applied to status badge text AND all user-supplied strings in innerHTML

## Deviations from Plan

None — plan executed exactly as written.

## Threat Flags

| Flag | File | Description |
|------|------|-------------|
| MITIGATED | store.php | `status` hard-coded server-side — client cannot submit arbitrary status |
| MITIGATED | store/update.php | `image_url` validated against `preg_match('/^https?:\/\//i')` — blocks data: URIs and javascript: protocol |
| MITIGATED | update.php | `$status` whitelisted against `['published','draft','archived']` before bind |
| MITIGATED | news.js | `escapeHtml()` on every user-supplied string in innerHTML; image_url escaped before use in `src` attribute |
| MITIGATED | All endpoints | Role check `$role !== 'admin'` enforced server-side — dean + program_head get 403 |
| ACCEPTED | CSRF | No CSRF tokens — same-origin session cookie, local admin tool only |

## TDD Gate Compliance

This plan was NOT marked as `type: tdd` in the frontmatter. TDD gate enforcement does not apply.

## Verification Checklist

- [x] `api/news/index.php` returns 401 when no session
- [x] `api/news/index.php` returns 403 when role is dean or program_head
- [x] `api/news/index.php` returns array with id, title, content, image_url, status, author_name, created_at, updated_at
- [x] `api/news/store.php` hard-codes `status='draft'`
- [x] `api/news/store.php` validates image_url starts with http:// or https://
- [x] `api/news/store.php` calls `log_activity(..., 'news', ..., 'news', $newId)`
- [x] `api/news/update.php` includes `status` in UPDATE
- [x] `api/news/update.php` whitelists `$status` against `['published', 'draft', 'archived']`
- [x] `api/news/update.php` returns 404 when row not found (secondary SELECT)
- [x] `api/news/destroy.php` fetches title before DELETE
- [x] `assets/js/views/news.js` exports `async function loadNews`
- [x] `assets/js/views/news.js` calls `api.get('news/index.php')` inside refresh
- [x] `assets/js/views/news.js` calls `api.post` for store/update/destroy
- [x] `assets/js/views/news.js` has `statusBadge` with: published=emerald, draft=amber, archived=stone
- [x] `assets/js/views/news.js` Add modal has NO status field (draft is server-set)
- [x] `assets/js/views/news.js` Edit modal has status select with published/draft/archived options
- [x] `assets/js/views/news.js` applies `escapeHtml` to all user strings in innerHTML
- [x] `assets/js/views/news.js` shows image thumbnail when `image_url` is present
- [x] `assets/js/router.js` `/news` loader dynamic-imports news.js
- [x] `assets/js/router.js` `/news` has roles `['admin']` only
- [x] Empty-state branch renders when `items.length === 0`
- [x] Table refreshes from server after Add/Edit/Delete

## Awaiting Human Verification (Task 7)

Tasks 1-6 are complete and committed. Task 7 (Phase 3 Demo Checkpoint) requires manual browser testing across 3 roles and cannot be auto-executed.

---
*Phase: 03-03*
*Tasks completed: 6/7 (Task 7 — human-verify checkpoint — pending)*
*Completed: 2026-04-17*
