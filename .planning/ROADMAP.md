# Roadmap — BS Mathematics Admin SPA (v1.0)

**Granularity:** Coarse (7 phases)
**Style:** Junior-friendly — each phase produces something you can open in a browser and show off.

---

## Phase 1: Foundation — DB, Auth, SPA Shell

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

**Plans:** 3 plans (complete)

Plans:
- [x] 01-01-PLAN.md — DB layer: schema.sql, seed.sql, connect.php
- [x] 01-02-PLAN.md — Auth API: login.php, logout.php, me.php
- [x] 01-03-PLAN.md — SPA shell: index.html, JS modules, view templates + demo checkpoint

---

## Phase 2: Dashboard + Programs Module

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

**Plans:** 3 plans (1/3 complete)

Plans:
- [x] 02-01-PLAN.md — Backend API: dashboard stats/activities, programs CRUD, log_activity helper
- [ ] 02-02-PLAN.md — UI helpers + dashboard view (toast, modal, dashboard.js)
- [ ] 02-03-PLAN.md — Programs view (programs.js) + demo checkpoint

**Why this phase second:** Programs is the most visible module (your mock). Nailing the UI patterns here (modal, table, toast) makes the remaining modules copy-paste.

---

## Phase 3: Content Modules — Announcements, Events, News

**Goal:** Three more CRUD modules using the patterns from Phase 2. Announcements and Events have a `status` field (`pending` / `approved` / `rejected`) to prep for Phase 4.

**Deliverables:**
- `api/announcements/*`, `api/events/*`, `api/news/*`
- `assets/js/views/announcements.js`, `events.js`, `news.js`
- Shared list/modal/form patterns extracted into tiny helpers (no framework — just functions)

**Demo checkpoint:** All three modules list, add, edit, delete. Each shows up in its role's sidebar only. RBAC verified: Program Head cannot reach `#/news` (router redirects + server returns 403).

**Why this phase third:** Repetition of Phase 2 pattern. If Phase 2 is clean, this is fast.

---

## Phase 4: Gallery, Faculty, Users, + Approve Content

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

## Phase 5: Polish — Search, Responsive, Visual QA

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

### Phase 6: Presentation Preparation

**Goal:** Create a junior-friendly technical guide documenting how the SPA framework and PHP backend align, so the team can confidently present and defend the project against the guide.md rubric.

**Deliverables:**
- `docs/PRESENTATION_GUIDE.md` — comprehensive junior-friendly walkthrough covering:
  - SPA architecture: hash-based routing, module loading, view lifecycle
  - PHP backend alignment: how each API endpoint maps to frontend actions
  - RBAC deep-dive: role guards in router.js vs server-side enforcement in each PHP endpoint
  - Data flow diagrams: login → session → API call → render cycle
  - Guide.md compliance checklist: every rubric item mapped to code locations
- `docs/RUBRIC_DEFENSE.md` — point-by-point defense against each guide.md requirement with code references

**Demo checkpoint:** Any team member can open PRESENTATION_GUIDE.md and explain how the SPA works, where RBAC is enforced, and how each guide.md requirement is met — without reading source code.

**Depends on:** Phase 5

Plans:
- [ ] TBD (run /gsd-plan-phase 6 to break down)

### Phase 7: Finishing Touches

**Goal:** Fix the 3 issues identified by gap analysis against guide.md, ensuring full rubric compliance before presentation.

**Deliverables:**
- RBAC fix: remove `program_head` from Events nav access (guide.md specifies Programs, Gallery, Announcements only)
- Dashboard header fix: change "Welcome, [name]" to "Welcome [Role] Panel" format (e.g., "Welcome Admin Panel", "Welcome Dean")
- Source code constraint review: document that Tailwind CDN, Material Symbols, and Google Fonts are external resources added beyond the ws4.2 source code, and ensure this aligns with instructor expectations

**Demo checkpoint:** Log in as Program Head → sidebar shows only Dashboard, Programs, Announcements, Gallery. Dashboard says "Welcome Program Head Panel". Source code usage is documented.

**Depends on:** Phase 6

Plans:
- [x] 07-01-PLAN.md -- Finishing touches: RBAC fix, dashboard header fix, external resources documentation

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
   ↓
Phase 6 (presentation preparation — docs + defense guide)
   ↓
Phase 7 (finishing touches — RBAC fix, header fix, compliance)
```

Strict sequential. No parallelization (user preference + simpler for solo work).

## Rubric Mapping

| Rubric category | Addressed in |
|-----------------|--------------|
| Completeness (every use case) | Phases 2–4 |
| Visual Hierarchy | Phase 2 (mock fidelity) + Phase 5 |
| Responsiveness | Phase 5 |
| UX Smoothness (SPA, feedback) | Phase 1 (no reload) + Phase 2 (toasts) |
| RBAC correctness | Phase 1 (guards) + Phase 3 (verify) + **Phase 7 (fix program_head)** |
| Theme consistency | Phase 1 (palette) + Phase 5 (pass) |
| Presentation defense | Phase 6 (guide + rubric defense) |
