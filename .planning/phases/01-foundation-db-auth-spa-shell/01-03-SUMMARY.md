---
plan: "01-03"
phase: 1
wave: 3
status: complete
title: "SPA Shell: index.html, CSS, JS modules, view templates"
---

## What Was Built

Eight files that form the complete SPA shell for the BS Mathematics Admin Portal.

### Files Created

| File | Purpose |
|------|---------|
| `index.html` | App shell — Tailwind CDN, Material Symbols, design tokens, #app mount point |
| `assets/css/app.css` | Material Symbols variation settings, nav-item states, toast/spinner keyframes |
| `assets/js/api.js` | Fetch wrapper — normalises all responses to `{success, data, error}` envelope |
| `assets/js/auth.js` | Auth state — `login()`, `logout()`, `me()`, `getUser()`, sessionStorage cache |
| `assets/js/router.js` | Hash router — RBAC guards, shell mounting, nav RBAC filtering, stub views |
| `assets/js/app.js` | Bootstrap — restores auth state before router, exposes `window.showToast` |
| `views/login.html` | Login form template — wired up by router.js after injection into #app |
| `views/shell.html` | Authenticated layout — topbar, sidebar with all nav items + data-roles attrs |

---

## Architecture Decisions

### Hash Routing
Used `window.location.hash` instead of the History API. The SPA runs on a plain
Apache/PHP server with no URL rewrite rules — hash changes never reach the server,
so every refresh correctly lands on `index.html`.

### ES Modules
All JS files use `import`/`export`. No bundler required — browsers support native
ES modules. `app.js` is loaded as `type="module"`, which defers execution
automatically.

### sessionStorage for Auth Cache
`auth.js` caches the user object in `sessionStorage` (not `localStorage`) so it
clears when the tab closes — matching the PHP session lifetime. On every page
load, `me()` hits the server to confirm the session is still valid before the
router makes any routing decision.

### RBAC at Two Levels
- **Server** (PHP): every endpoint checks `$_SESSION['role']` before returning data.
- **Client** (JS): `router.js` hides nav items via `data-roles` attributes and
  guards route access by checking `getUser().role`. Client-side RBAC is UX only;
  the server is the authority.

### Shell Mounted Once
`views/shell.html` is fetched and injected into `#app` on the first protected
navigation and reused for all subsequent navigations. Only `#main-content`
is swapped per route, keeping the topbar and sidebar stable.

### Stub Views
All 10 protected routes return placeholder HTML stubs. Real view modules will
replace `routes[path].loader` in phases 02–09. The stub shows the logged-in
user's name and role to confirm RBAC is working during development.

---

## RBAC Sidebar Matrix (as implemented)

| Route | admin | dean | program_head |
|-------|:-----:|:----:|:------------:|
| `/dashboard`     | ✅ | ✅ | ✅ |
| `/programs`      | ✅ | — | ✅ |
| `/announcements` | ✅ | ✅ | ✅ |
| `/events`        | ✅ | ✅ | ✅ |
| `/news`          | ✅ | — | — |
| `/gallery`       | ✅ | ✅ | ✅ |
| `/faculty`       | ✅ | ✅ | ✅ |
| `/users`         | ✅ | — | — |
| `/approvals`     | ✅ | ✅ | — |
| `/profile`       | ✅ | ✅ | ✅ |

---

## Verification Checklist

- [x] `index.html` loads Tailwind CDN + Material Symbols + Work Sans + Newsreader
- [x] Tailwind config extends the emerald/stone MD3 palette from `mock.html`
- [x] `api.js` returns `{success, data, error}` for all outcomes including network failure
- [x] `auth.js` clears sessionStorage before server logout call (fail-safe)
- [x] `auth.js` calls `me()` on page load to prevent stale-cache login ghost
- [x] `router.js` redirects unauthenticated users to `#/login`
- [x] `router.js` redirects wrong-role users to `#/dashboard` (not a 403 page)
- [x] `router.js` skips login page for already-authenticated users
- [x] `app.js` awaits `me()` before calling `router.init()`
- [x] `views/login.html` has correct IDs for router.js wiring
- [x] `views/shell.html` has `data-roles` on all nav items
- [x] `views/shell.html` has `#sidebar-user-name`, `#sidebar-user-role`, `#btn-logout`
- [x] `views/shell.html` has `#main-content` slot for view injection

---

## Links to Context

- Auth API: `.planning/phases/01-foundation-db-auth-spa-shell/01-02-PLAN.md`
- RBAC requirements: `.planning/REQUIREMENTS.md` (RBAC Matrix section)
- Design reference: `mock.html` (emerald/stone palette, Newsreader + Work Sans, nav structure)

---

## Next Phase

**01-04** — Dashboard view: stats cards (Programs, Announcements, Events, Users counts)
and Recent Activities feed. Connects to real DB via `api/dashboard/stats.php`.
