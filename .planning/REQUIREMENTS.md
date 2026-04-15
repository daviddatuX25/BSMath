# Requirements — BS Mathematics Admin SPA

## Table Stakes (all phases must uphold)

- **Strict stack:** vanilla PHP + HTML/CSS/JS from ws4.2 source code only
- **SPA:** hash routing (`#/dashboard`, `#/programs`), no page reloads
- **API:** all data via `fetch` to PHP JSON endpoints, `{success, data, error}` envelope
- **Auth:** PHP session, check on every protected endpoint
- **RBAC:** role checked both server-side (PHP) and client-side (hide nav)
- **Theme:** emerald/stone palette from `mock.html`, Newsreader + Work Sans
- **Responsive:** sidebar collapses under md breakpoint
- **Feedback:** toast on every CRUD action (success green, error red)
- **Junior-friendly:** readable names, tiny functions, comments only where WHY is non-obvious

## RBAC Matrix

| Module | Admin | Dean/Principal | Program Head |
|--------|:-----:|:--------------:|:------------:|
| Dashboard | ✅ | ✅ | ✅ |
| Manage Programs | ✅ | — | ✅ |
| Announcements | ✅ | ✅ | ✅ |
| Events | ✅ | ✅ | — |
| News | ✅ | — | — |
| Gallery | ✅ | — | ✅ |
| Faculty | ✅ | — | — |
| Users | ✅ | — | — |
| Approve Content | — | ✅ | — |

## Feature Requirements

### R1. Authentication
- Login page: email + password
- POST to `api/auth/login.php` → sets `$_SESSION[user_id]`, `$_SESSION[role]`
- Logout: `api/auth/logout.php` destroys session
- Default seeded accounts (one per role) for demo
- Unauthenticated access to `#/*` routes redirects to `#/login`

### R2. SPA Shell
- Sticky topbar: logo, search, notifications icon, profile icon
- Sidebar (fixed left): role-filtered nav with Material Symbols icons
- Main canvas: renders view based on `window.location.hash`
- Active nav item highlighted (emerald left border, per mock)

### R3. Router (`router.js`)
- Map hash → view loader function
- On `hashchange`: unmount previous, mount next
- Unknown hash → 404 view
- Guards: if route requires role X and user isn't X, redirect to dashboard

### R4. Dashboard
- Header: "Welcome, [Name]" (role-aware subtitle)
- 4 stats cards: Total Programs, Total Announcements, Total Events, Total Users
- Recent Activities feed (last 10 events from `activities` table)
- Quick Actions: Add Program, Create Announcement, Upload Gallery (role-filtered)

### R5–R12. CRUD Modules
Each module follows same shape:
- List view with table (matching mock's editorial style)
- "Add" button (top right) → opens modal
- Row hover → edit/delete icons (per mock)
- Confirmation modal for delete
- Server validates role on every action

### R13. Approve Content (Dean only)
- Tab filter: Pending | Approved | Rejected
- Announcements + Events with `status=pending` listed
- Approve / Reject buttons update status
- Only approved items appear on public-facing views (out of scope for this milestone, but fields set up)

### R14. Global Search
- Topbar input filters currently-mounted list view (client-side)
- Debounced 250ms

### R15. Responsive
- `md` breakpoint: sidebar becomes off-canvas drawer, hamburger toggle in topbar
- Stats cards: 4-col → 2-col → 1-col

## Success Criteria

- [ ] All 3 roles can log in and see only their permitted nav
- [ ] No full page reload when navigating (verified by watching Network tab)
- [ ] Every CRUD action produces a toast
- [ ] Dashboard stats reflect real DB counts
- [ ] Dean can approve a pending announcement and see it move to Approved
- [ ] Layout doesn't break at 375px width
- [ ] Colors match `mock.html` exactly
- [ ] Code is readable to a classmate who didn't write it
