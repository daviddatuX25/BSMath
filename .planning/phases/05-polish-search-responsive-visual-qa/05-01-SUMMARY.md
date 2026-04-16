---
phase: 5
plan: "05-01"
title: "Global search + responsive shell"
subsystem: "frontend"
tags: [search, responsive, mobile, UX]
dependency_graph:
  requires: []
  provides: []
  affects: []
tech_stack:
  added: []
  patterns: []
key_files:
  created:
    - assets/js/ui/search.js
  modified:
    - assets/js/app.js
    - assets/js/router.js
    - assets/js/views/programs.js
    - assets/js/views/announcements.js
    - assets/js/views/events.js
    - assets/js/views/news.js
    - assets/js/views/gallery.js
    - assets/js/views/faculty.js
    - assets/js/views/users.js
    - assets/js/views/approvals.js
    - views/shell.html
    - assets/css/app.css
decisions: []
metrics:
  duration: ""
  completed: "2026-04-17"
---

# Phase 5 Plan 1: Global Search + Responsive Shell Summary

## One-liner

Added debounced global search filtering across all CRUD list views, and a slide-out mobile sidebar drawer with hamburger toggle and backdrop.

## What Was Built

### Global Search (R14)
- **New module `assets/js/ui/search.js`** — exports `initSearch()` and `setActiveView()`
  - 250ms debounce on `#topbar-search` input
  - Calls `currentView.filterRows(lower)` when the active view provides it
  - Generic fallback queries `tr[data-id]` and `.searchable-card` elements
  - Clears search input on navigation via `setActiveView`
- **`filterRows(term)` added to all 8 CRUD views**: programs, announcements, events, news, gallery, faculty, users, approvals
- **Router updated** (`assets/js/router.js`) — imports `setActiveView` and calls it after each CRUD route loader with the view's `filterRows` function
- **`initSearch()` called in `app.js`** bootstrap after `router.init()`

### Responsive Sidebar Drawer (R15)
- **Hamburger button** added inside topbar before search input (`id="hamburger-btn"`, `md:hidden`)
- **Backdrop overlay** added after sidebar nav (`id="sidebar-backdrop"`, `fixed inset-0 bg-black/40 z-40 hidden md:hidden`)
- **Sidebar transform**: `transform -translate-x-full md:translate-x-0 transition-transform duration-200` — off-canvas by default, slides in on mobile
- **Main column margin**: changed from `ml-64` to `ml-0 md:ml-64` — no margin on mobile when sidebar is hidden
- **CSS media queries in `app.css`**:
  - `@media (max-width: 767px)`: `#sidebar.sidebar-open { transform: translateX(0); }` + `#sidebar-backdrop.sidebar-open { display: block; }`
  - `@media (max-width: 479px)`: forces stat card grid to 1 column

### Mobile Menu JS (`setupMobileMenu` in `app.js`)
- Toggles `.sidebar-open` on `#sidebar` and `#sidebar-backdrop` on hamburger click
- Closes drawer on backdrop click
- Closes drawer when a `.nav-item` link is clicked on mobile (`< 768px`)
- Sets/clears `aria-expanded` on hamburger button
- Connected via `shell-ready` custom event dispatched by `router.js` at end of `ensureShell()` — avoids circular import

## Deviations from Plan

None — plan executed exactly as written.

## Commits

| Commit | Message |
|--------|---------|
| `5089c55` | feat(05-01): add debounced global search module |
| `48e6e7c` | feat(05-01): add filterRows to all CRUD views and wire setActiveView in router |
| `3575c65` | feat(05-01): call initSearch() during app bootstrap |
| `f40739a` | feat(05-01): add hamburger button, backdrop, and responsive sidebar to shell.html |
| `1dad3d7` | feat(05-01): add responsive CSS for mobile sidebar drawer and card grid |
| `439151f` | feat(05-01): add setupMobileMenu and shell-ready event for mobile drawer |

## Self-Check: PASSED

- `assets/js/ui/search.js` — created, exports `initSearch` and `setActiveView`, contains `DEBOUNCE_MS = 250`
- `router.js` — imports `setActiveView`, all CRUD routes call it after loading
- All 8 CRUD views export `filterRows(term)` that shows/hides `tr[data-id]` rows
- `app.js` — imports `initSearch`, calls it after `router.init()`
- `shell.html` — `#hamburger-btn` (md:hidden), `#sidebar-backdrop` (hidden md:hidden), sidebar has responsive transform classes, main column has `ml-0 md:ml-64`
- `app.css` — `@media (max-width: 767px)` with `.sidebar-open` rules, `@media (max-width: 479px)` for 1-col cards
- `app.js` — `setupMobileMenu()` function wired to `shell-ready` event
- `router.js` — dispatches `shell-ready` at end of `ensureShell()`
