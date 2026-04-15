# Roadmap — BS Mathematics Admin SPA (v1.0)

**Granularity:** Coarse (5 phases)
**Style:** Junior-friendly — each phase produces something you can open in a browser and show off.

---

## Phase 1 — Foundation: DB, Auth, SPA Shell

**Goal:** A user can log in as any of the 3 roles and see a working shell (topbar + role-filtered sidebar + empty main canvas). Navigating between routes does NOT reload the page.

**Deliverables:**
- `db/schema.sql` — tables: `users`, `programs`, `announcements`, `events`, `news`, `gallery`, `faculty`, `activities`
- `db/seed.sql` — 1 admin, 1 dean, 1 program head (hashed passwords)
- `api/connect.php` — database connection helper (extends ws4.2 pattern)
- `api/auth/login.php`, `logout.php`, `me.php`
- `index.html` — app shell with Tailwind CDN, Material Symbols, emerald/stone palette
- `assets/css/app.css` — any custom overrides
- `assets/js/app.js` — bootstraps the app
- `assets/js/router.js` — hash router with role guards
- `assets/js/api.js` — fetch wrapper, handles `{success, data, error}` envelope
- `assets/js/auth.js` — login page logic, current-user cache
- `views/login.html` — login form template
- `views/shell.html` — topbar + sidebar markup (matches mock)

**Demo checkpoint:** Log in as `admin@bsmath.test`, see Admin sidebar. Log out, log in as `dean@bsmath.test`, see Dean sidebar. Refresh → stay logged in. Click any sidebar link → hash changes, no reload.

**Why this phase first:** Everything else depends on the shell and auth. Getting this right makes phases 2–5 mechanical.

---

## Phase 2 — Dashboard + Programs Module

**Goal:** Dashboard shows real stats from the DB. Manage Programs works end-to-end (list, add, edit, delete) for Admin and Program Head. Matches `mock.html` fidelity.

**Deliverables:**
- `api/dashboard/stats.php` — returns counts
- `api/dashboard/activities.php` — returns last 10 activity rows
- `api/programs/{index,store,update,destroy}.php`
- `assets/js/views/dashboard.js`
- `assets/js/views/programs.js` — list, add modal, edit modal, delete confirm
- `assets/js/ui/toast.js` — simple toast helper
- `assets/js/ui/modal.js` — simple modal helper
- Activity log helper: every CRUD writes one row to `activities`

**Demo checkpoint:** Dashboard shows "Total Programs: 4". Click Manage Programs → see seeded programs in editorial table. Add one → see toast, row appears, dashboard count updates. Edit, delete — all work without reload.

**Why this phase second:** Programs is the most visible module (your mock). Nailing the UI patterns here (modal, table, toast) makes the remaining modules copy-paste.

---

## Phase 3 — Content Modules: Announcements, Events, News

**Goal:** Three more CRUD modules using the patterns from Phase 2. Announcements and Events have a `status` field (`pending` / `approved` / `rejected`) to prep for Phase 4.

**Deliverables:**
- `api/announcements/*`, `api/events/*`, `api/news/*`
- `assets/js/views/announcements.js`, `events.js`, `news.js`
- Shared list/modal/form patterns extracted into tiny helpers (no framework — just functions)

**Demo checkpoint:** All three modules list, add, edit, delete. Each shows up in its role's sidebar only. RBAC verified: Program Head cannot reach `#/news` (router redirects + server returns 403).

**Why this phase third:** Repetition of Phase 2 pattern. If Phase 2 is clean, this is fast.

---

## Phase 4 — Gallery, Faculty, Users, + Approve Content

**Goal:** Finish the remaining modules + Dean's approval workflow. Gallery supports file upload to `uploads/` folder. Users module lets Admin manage accounts (including role assignment).

**Deliverables:**
- `api/gallery/*` (store handles `$_FILES` upload)
- `api/faculty/*`
- `api/users/*` (password hashing on create/update)
- `api/approvals/{index,approve,reject}.php` — Dean only
- `assets/js/views/gallery.js`, `faculty.js`, `users.js`, `approvals.js`
- `uploads/.htaccess` — prevent PHP execution in upload dir (basic safety)

**Demo checkpoint:** Admin creates a new Program Head user. Logs in as Program Head, uploads a gallery image, creates a pending announcement. Dean logs in, sees it under Approve Content, clicks Approve → status flips.

**Why this phase fourth:** Gallery (file upload) and Users (password hashing) are the trickiest modules — group them after patterns are proven.

---

## Phase 5 — Polish: Search, Responsive, Visual QA

**Goal:** Hit the "Excellent" rubric tier. Global search works. Layout survives mobile. Every pixel matches mock.

**Deliverables:**
- `assets/js/ui/search.js` — debounced topbar search, filters current view
- Responsive refinements: off-canvas sidebar under `md`, hamburger toggle
- Empty states for every list (when DB is empty)
- Loading states (skeleton rows while fetching)
- Final visual pass: spacing, colors, typography vs. `mock.html`
- `README.md` — how to run locally on Laragon, demo credentials

**Demo checkpoint:** Resize to 375px — sidebar becomes drawer, cards stack. Type in search → list filters live. Demo every role's happy path without visual glitches.

**Why this phase last:** Polish is easier when features are stable. Doing it last also means we only touch CSS/UX, not logic.

---

## Phase Dependency Graph

```
Phase 1 (foundation)
   ↓
Phase 2 (dashboard + programs — sets UI patterns)
   ↓
Phase 3 (announcements, events, news — repeats patterns)
   ↓
Phase 4 (gallery, faculty, users, approvals — harder modules)
   ↓
Phase 5 (polish, search, responsive)
```

Strict sequential. No parallelization (user preference + simpler for solo work).

## Rubric Mapping

| Rubric category | Addressed in |
|-----------------|--------------|
| Completeness (every use case) | Phases 2–4 |
| Visual Hierarchy | Phase 2 (mock fidelity) + Phase 5 |
| Responsiveness | Phase 5 |
| UX Smoothness (SPA, feedback) | Phase 1 (no reload) + Phase 2 (toasts) |
| RBAC correctness | Phase 1 (guards) + Phase 3 (verify) |
| Theme consistency | Phase 1 (palette) + Phase 5 (pass) |

## Next Step

`/gsd-plan-phase 1` to break Phase 1 into concrete plans and tasks.
