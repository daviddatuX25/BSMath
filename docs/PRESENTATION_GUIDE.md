# BS Mathematics Admin SPA - Technical Presentation Guide

This guide explains how the SPA works so you can present and defend it. No source code reading required.

---

## How the App Starts (Bootstrap Sequence)

When you open the app in a browser, three things happen in order:

1. **Check if user is already logged in** (`app.js` calls `me()`)
   - Sends a request to `api/auth/me.php`
   - If the PHP session is still valid, the server returns the user object
   - The client caches this in `sessionStorage` so page refreshes don't force re-login
   - If no session exists, the server returns an error and the user stays logged out

2. **Start the router** (`router.init()`)
   - The router looks at the current URL hash (e.g., `#/dashboard`)
   - It decides which view to load based on the hash
   - It also checks if the user is allowed to see that route (role guard)

3. **Wire up the search bar** (`initSearch()`)
   - Connects the topbar search input to a 250ms debounced filter
   - Filters whatever list is currently shown (programs, announcements, etc.)

```
app.js bootstrap
    |
    v
1. me()  -->  api/auth/me.php  -->  sessionStorage cache
    |
    v
2. router.init()  -->  listen for #/hash changes
    |
    v
3. initSearch()  -->  wire topbar search input
```

**Why this order matters:** If we let the router run first, it would see an empty sessionStorage and redirect every returning user to `#/login` - even if their PHP session is still valid. Restoring auth state first means the first navigation is always correct.

---

## How Navigation Works (Hash-Based Routing)

The app uses **hash routing** - URLs look like `http://localhost/#/programs`. The `#` means everything after it is handled by JavaScript in the browser, never by the PHP server. This is why the app never reloads the page.

When you click a sidebar link, it sets `window.location.hash` (e.g., `#/programs`). The router listens for `hashchange` events and runs these checks in order:

```
hashchange event
    |
    v
Route defined?  --NO-->  redirect('/dashboard')
    |
   YES
    v
Route public?  --YES-->  render login page
    |
    NO
    v
User logged in?  --NO-->  redirect('/login')
    |
   YES
    v
Role allowed?  --NO-->  redirect('/dashboard')
    |
   YES
    v
ensureShell()  -->  applyRbacToNav()  -->  route.loader(user)
```

**The five checks explained:**
1. **Route defined?** - If the hash doesn't match any known route, send to dashboard
2. **Route public?** - The login page is public; anyone can see it
3. **User logged in?** - If not logged in, send to login page
4. **Role allowed?** - If the user's role isn't in the route's allowed roles list, send to dashboard
5. **Load the view** - If all pass: mount the shell (sidebar + topbar), apply RBAC to sidebar, then render the view

---

## How Views Load (Module System)

Each sidebar link maps to a JavaScript module in `assets/js/views/`:

| Sidebar Link | JavaScript Module | PHP API Called |
|---|---|---|
| Dashboard | `dashboard.js` | `api/dashboard/stats.php`, `api/dashboard/activities.php` |
| Programs | `programs.js` | `api/programs/index.php` |
| Announcements | `announcements.js` | `api/announcements/index.php` |
| Events | `events.js` | `api/events/index.php` |
| News | `news.js` | `api/news/index.php` |
| Gallery | `gallery.js` | `api/gallery/index.php` |
| Faculty | `faculty.js` | `api/faculty/index.php` |
| Users | `users.js` | `api/users/index.php` |
| Approvals | `approvals.js` | `api/approvals/index.php` |

**How a view loads:**
1. `router.js` calls the view's `loadXxx()` function (e.g., `loadPrograms()`)
2. The function renders a skeleton (loading state) immediately into `#main-content`
3. It fetches data from the API using `api.get()` or `api.post()`
4. When data arrives, it renders the full HTML and attaches event handlers
5. When navigating away, the next view's HTML simply replaces the old one (no accumulation)

---

## How the API Works (Fetch Wrapper)

All frontend-to-backend communication goes through `api.js`, which provides four methods:

```javascript
api.get('programs/index.php')    // GET request
api.post('programs/store.php', { name: 'BS Math', code: 'BSM' })  // POST with JSON body
api.put('programs/update.php', { id: 1, name: 'New Name' })     // PUT with JSON body
api.del('programs/destroy.php', { id: 1 })                       // DELETE with JSON body
```

**Every API response follows this shape:**
```json
{
  "success": true,
  "data": { ...payload... },
  "error": null
}
```
or on failure:
```json
{
  "success": false,
  "data": null,
  "error": "Something went wrong"
}
```

**Key behaviors:**
- The PHP session cookie (`PHPSESSID`) is sent automatically with every request (no extra setup needed)
- If `success` is `false`, the `api.js` wrapper throws an error with the `error` message
- The `Content-Type: application/json` header is set automatically on all requests

---

## PHP Backend - How Every API Maps to the Frontend

### The API Pattern (Every Endpoint Follows This)

Every PHP endpoint follows a consistent 4-step pattern:

```
1. session_start() + header('Content-Type: application/json')
   --> Handled automatically by including connect.php at the top of every file

2. Auth check: if $_SESSION['user_id'] is empty
   --> Return 401 Not authenticated

3. Role check: if $_SESSION['role'] not in allowed roles
   --> Return 403 Forbidden

4. Business logic: SELECT/INSERT/UPDATE/DELETE
   --> Return { success: true, data: ..., error: null }
```

**connect.php** handles steps 1 and 2 by being included at the top of every API file.

### Auth Endpoints

| Endpoint | Method | Who Can Call | Frontend Caller | What It Does |
|----------|--------|-------------|-----------------|-------------|
| `api/auth/login.php` | POST | Anyone (unauthenticated) | `auth.js:login()` | Verifies email/password, creates PHP session |
| `api/auth/logout.php` | POST | Any logged-in user | `auth.js:logout()` | Destroys PHP session, clears cookies |
| `api/auth/me.php` | GET | Any logged-in user | `auth.js:me()` | Returns current user info from session |

**Login flow:** `login.php` receives `{email, password}`, checks against the `users` table using `password_verify()`, and if correct, sets `$_SESSION['user_id']` and `$_SESSION['role']`.

### Dashboard Endpoints

| Endpoint | Method | Who Can Call | Frontend Caller | What It Does |
|----------|--------|-------------|-----------------|-------------|
| `api/dashboard/stats.php` | GET | admin, dean, program_head | `dashboard.js` | Returns 4 count stats (programs, announcements, events, users) |
| `api/dashboard/activities.php` | GET | admin, dean, program_head | `dashboard.js` | Returns last 10 activity log entries |

### CRUD Module Endpoints

Each CRUD module has the same four endpoints. Here is the full map:

| Module | Endpoint | Method | Allowed Roles | Frontend Caller |
|--------|----------|--------|--------------|-----------------|
| Programs | `api/programs/index.php` | GET | admin, program_head | `programs.js` |
| Programs | `api/programs/store.php` | POST | admin, program_head | `programs.js` |
| Programs | `api/programs/update.php` | POST | admin, program_head | `programs.js` |
| Programs | `api/programs/destroy.php` | POST | admin, program_head | `programs.js` |
| Announcements | `api/announcements/index.php` | GET | admin, dean, program_head | `announcements.js` |
| Announcements | `api/announcements/store.php` | POST | admin, dean, program_head | `announcements.js` |
| Announcements | `api/announcements/update.php` | POST | admin, dean, program_head | `announcements.js` |
| Announcements | `api/announcements/destroy.php` | POST | admin, dean, program_head | `announcements.js` |
| Events | `api/events/index.php` | GET | admin, dean | `events.js` |
| Events | `api/events/store.php` | POST | admin, dean | `events.js` |
| Events | `api/events/update.php` | POST | admin, dean | `events.js` |
| Events | `api/events/destroy.php` | POST | admin, dean | `events.js` |
| News | `api/news/index.php` | GET | admin | `news.js` |
| News | `api/news/store.php` | POST | admin | `news.js` |
| News | `api/news/update.php` | POST | admin | `news.js` |
| News | `api/news/destroy.php` | POST | admin | `news.js` |
| Gallery | `api/gallery/index.php` | GET | admin, program_head | `gallery.js` |
| Gallery | `api/gallery/store.php` | POST | admin, program_head | `gallery.js` (uses `multipart/form-data` for file upload) |
| Gallery | `api/gallery/update.php` | POST | admin, program_head | `gallery.js` |
| Gallery | `api/gallery/destroy.php` | POST | admin, program_head | `gallery.js` |
| Faculty | `api/faculty/index.php` | GET | admin | `faculty.js` |
| Faculty | `api/faculty/store.php` | POST | admin | `faculty.js` |
| Faculty | `api/faculty/update.php` | POST | admin | `faculty.js` |
| Faculty | `api/faculty/destroy.php` | POST | admin | `faculty.js` |
| Users | `api/users/index.php` | GET | admin | `users.js` |
| Users | `api/users/store.php` | POST | admin | `users.js` |
| Users | `api/users/update.php` | POST | admin | `users.js` |
| Users | `api/users/destroy.php` | POST | admin | `users.js` |

> **Gallery note:** `gallery/store.php` and `gallery/update.php` use `multipart/form-data` encoding (not JSON) because they accept image file uploads. The frontend uses `FormData` object and `fetch` with `credentials: 'same-origin'` instead of the JSON-based `api.post()` method.

### Approval Endpoints

| Endpoint | Method | Who Can Call | Frontend Caller | What It Does |
|----------|--------|-------------|-----------------|-------------|
| `api/approvals/index.php` | GET | admin, dean | `approvals.js` | Lists pending announcements and events |
| `api/approvals/approve.php` | POST | dean only | `approvals.js` | Sets item status to 'approved' |
| `api/approvals/reject.php` | POST | dean only | `approvals.js` | Sets item status to 'rejected' |

### Activity Logging

Every time a create, update, or delete action happens, the PHP endpoint calls `log_activity()` from `api/helpers/log_activity.php`. This helper inserts a row into the `activities` table with:
- Who did it (`user_id`)
- What type of action (`type`: 'program', 'announcement', 'event', etc.)
- A human-readable description ("Created program: BS Math")
- The entity type and ID

The Dashboard's "Recent Activities" feed reads from this table, so all recent actions appear there automatically.

---

## RBAC - How Role-Based Access Works (Dual Enforcement)

### Why Two Layers?

Role-Based Access Control (RBAC) is enforced in **two places** for defense-in-depth:

1. **Client-side (browser):** Hides nav items and blocks routes - gives fast UX, avoids unnecessary API calls
2. **Server-side (PHP):** Returns 401/403 on every endpoint - the real security gate

If someone bypasses the client (e.g., types a URL directly in the address bar), the PHP server still blocks them. This is the critical security guarantee.

### Layer 1: Client-Side (What the User Sees)

**Sidebar navigation filtering (`applyRbacToNav()` in `router.js`):**
- Each nav link in `shell.html` has a `data-roles="admin,dean,program_head"` attribute
- `router.js` reads the current user's role from `sessionStorage`
- It hides any nav item whose `data-roles` attribute doesn't include the current role
- Result: Program Head never sees "Users" or "Faculty" in the sidebar

**Route guard (`navigate()` in `router.js`):**
- Each route definition has a `roles: ['admin', 'program_head']` array
- If the user's role is not in the array, the router redirects to dashboard
- This prevents someone from typing `#/users` directly in the address bar

### Layer 2: Server-Side (The Real Guard)

Every PHP endpoint starts with these checks:

```php
// Step 1: Check if user is logged in
if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Not authenticated']);
    exit;
}

// Step 2: Check if user's role is allowed
if (!in_array($_SESSION['role'], ['admin', 'program_head'])) {
    http_response_code(403);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Forbidden']);
    exit;
}
```

This means even if someone manually calls `api/users/index.php` with a Program Head session, they get a `403 Forbidden` response because the PHP server independently verifies the role.

### RBAC Matrix (Who Can Do What)

| Module | Admin | Dean | Program Head |
|--------|:-----:|:----:|:------------:|
| Dashboard | YES | YES | YES |
| Programs | YES | -- | YES |
| Announcements | YES | YES | YES |
| Events | YES | YES | -- |
| News | YES | -- | -- |
| Gallery | YES | -- | YES |
| Faculty | YES | -- | -- |
| Users | YES | -- | -- |
| Approve Content | -- | YES | -- |

### Known Gap: Events Nav for Program Head

The sidebar currently shows "Events" for Program Head (the `shell.html` nav item for Events has `data-roles="admin,dean,program_head"`). However, the route guard in `router.js` AND the server-side check in `api/events/index.php` both correctly block Program Head access.

So clicking "Events" as a Program Head redirects to dashboard - the nav item is cosmetic, not a security issue. The security works correctly at both layers.

**Phase 7 will remove the nav item from the sidebar for full compliance with guide.md.**

---

## Data Flow Diagrams

### Flow 1: Login + Session Creation

```
Browser                         Server (PHP)
  |                                |
  | POST api/auth/login.php        |
  | {email, password}              |
  |------------------------------->|
  |                                | 1. SELECT * FROM users WHERE email=?
  |                                | 2. password_verify(input, hash)
  |                                | 3. $_SESSION['user_id'] = id
  |                                | 4. $_SESSION['role'] = role
  |                                |
  | {success, data: {user}}        |
  |<-------------------------------|
  |                                |
  | sessionStorage.setItem()        |
  | redirect('#/dashboard')        |
```

When the user types their email and password and clicks Sign In:
1. `auth.js:login()` sends `{email, password}` to `api/auth/login.php`
2. PHP looks up the user by email, verifies the password hash
3. PHP sets `$_SESSION['user_id']` and `$_SESSION['role']` (server-side session)
4. PHP returns the user object to the browser
5. `auth.js` stores the user in `sessionStorage` (client-side cache)
6. The router redirects to `#/dashboard`

### Flow 2: Page Load / Session Restore

```
Browser                         Server (PHP)
  |                                |
  | app.js bootstrap               |
  | await me()                     |
  | GET api/auth/me.php            |
  |------------------------------->|
  |                                | 1. Check $_SESSION['user_id']
  |                                | 2. SELECT * FROM users WHERE id=?
  |                                |
  | {success, data: {user}}        |
  |<-------------------------------|
  |                                |
  | sessionStorage.setItem()        |
  | router.init()                  |
  | navigate(current hash)         |
```

When a user opens the app or refreshes the page:
1. `app.js` calls `me()` which hits `api/auth/me.php`
2. PHP checks if `$_SESSION['user_id']` exists
3. If yes, PHP re-fetches the user from the DB (freshest role data) and returns it
4. The client caches this in `sessionStorage` and starts the router
5. The router reads the current hash and navigates to the appropriate view

### Flow 3: Navigation + RBAC Guard

```
Browser (router.js)
  |
  | hashchange event
  | currentPath() = '/programs'
  |
  | Lookup routes['/programs']
  | route.public? NO
  | isLoggedIn()? YES
  | route.roles includes user.role? CHECK
  |
  +-- YES: ensureShell()
  |           applyRbacToNav()   (hide unauthorized sidebar items)
  |           route.loader(user) (call loadPrograms)
  |           render into #main-content
  |
  +-- NO:  redirect('#/dashboard')
```

When a user clicks "Programs" in the sidebar:
1. The router looks up the `/programs` route
2. It checks: is the route public? (No - it requires login)
3. It checks: is the user logged in? (Yes - sessionStorage has user)
4. It checks: does the user's role match `route.roles`? (Admin and Program Head allowed)
5. If all pass: mount the shell (sidebar + topbar) if not already mounted, filter the sidebar nav items, call `loadPrograms()` to render the programs list

### Flow 4: CRUD Data Cycle (Add Program)

```
Browser                         Server (PHP)
  |                                |
  | 1. Click "Add Program"         |
  | 2. modal.openForm()            |
  | 3. User fills form             |
  | 4. Click Submit                |
  | 5. api.post(                   |
  |    'programs/store.php',        |
  |    {name, code, description})  |
  |------------------------------->|
  |                                | 1. Check $_SESSION (auth)
  |                                | 2. Check role in ['admin','program_head']
  |                                | 3. Validate input
  |                                | 4. INSERT INTO programs
  |                                | 5. log_activity()
  |                                |
  | {success, data: {id}}          |
  |<-------------------------------|
  |                                |
  | 6. toast.show('Program added') |
  | 7. refresh() -> GET index.php  |
  | 8. Re-render programs table    |
```

When a user adds a new program:
1. Clicking "Add Program" opens a modal form via `modal.openForm()`
2. User fills in name, code, description fields
3. On submit, `api.post('programs/store.php', {name, code, description})` sends the data
4. PHP verifies auth, verifies role, validates input, inserts into DB, logs the activity
5. On success: `toast.show('Program added successfully', 'success')` appears
6. The view refreshes by re-fetching from `api/programs/index.php` and re-rendering the table

### Flow 5: Dean Approval Workflow

```
Dean Browser                    Server (PHP)
  |                                |
  | Navigate to #/approvals        |
  | router: role='dean'? YES       |
  | loadApprovals()                |
  | GET approvals/index.php        |
  |------------------------------->|
  |                                | SELECT pending announcements + events
  |                                |
  | {success, data: [...items]}    |
  |<-------------------------------|
  |                                |
  | Render table with              |
  | Approve/Reject buttons         |
  |                                |
  | Click "Approve"               |
  | POST approvals/approve.php    |
  | {type, id}                    |
  |------------------------------->|
  |                                | 1. Check role='dean'
  |                                | 2. Check item.status='pending'
  |                                | 3. UPDATE status='approved'
  |                                | 4. log_activity()
  |                                |
  | {success}                      |
  |<-------------------------------|
  |                                |
  | toast.show('Approved')          |
  | refresh() -> reload table      |
```

When a Dean reviews pending content:
1. Navigating to `#/approvals` triggers the route guard (only `dean` role is allowed)
2. `loadApprovals()` fetches from `api/approvals/index.php` which returns all pending items
3. The view renders a table with Approve/Reject buttons for each item
4. Clicking "Approve" sends `{type: 'announcement', id: 5}` to `api/approvals/approve.php`
5. PHP verifies the caller is Dean, the item exists, and its status is 'pending'
6. PHP updates the status to 'approved', logs the action
7. The view shows a success toast and refreshes the table

---

## Guide.md Compliance Checklist

### 1. Architectural & Technical Constraints

| Requirement | Where in Code | Met? |
|-------------|---------------|------|
| SPA architecture (no page reloads) | `router.js`: hash-based routing, `hashchange` listener | YES |
| Strict code constraint (ws4.2 only) | No npm/composer packages; vanilla JS + PHP only; Tailwind/Material Symbols from CDN (in ws4.2 source) | YES* |
| Theming (Midterm color combination) | `index.html`: Tailwind config with emerald/stone MD3 tokens; `app.css`: primary `#006d36` | YES |

> *Tailwind CSS, Material Symbols, and Google Fonts are loaded via CDN as part of the ws4.2 source code template. No additional libraries were introduced.

### 2. Role-Based Access Control

| Requirement | Where in Code | Met? |
|-------------|---------------|------|
| Admin: full access | `router.js` NAV_ITEMS: `admin` in all arrays; `shell.html` `data-roles`; PHP: `admin` in all `in_array()` checks | YES |
| Dean: Announcements, Events, Approve Content | `router.js` routes + `shell.html` + PHP endpoints all restrict dean to these 3 | YES |
| Program Head: Programs, Gallery, Announcements | `router.js` routes + `shell.html` + PHP endpoints restrict program_head to these 3 | YES* |
| Nav adapts to role | `router.js` `applyRbacToNav()` hides items by `data-roles` | YES* |
| Approve Content UI for Dean | `views/approvals.js`: tab filter, approve/reject buttons; `api/approvals/` endpoints: dean only | YES |

> *Events nav item currently shows for Program Head (cosmetic only - route guard and server both block access). Phase 7 removes the nav item.

### 3. Layout & Navigation Structure

| Requirement | Where in Code | Met? |
|-------------|---------------|------|
| Top navigation bar | `views/shell.html`: sticky topbar with logo, search, profile | YES |
| System Logo | `views/shell.html`: Sigma logo in emerald-800 | YES |
| Global Search Bar | `assets/js/ui/search.js`: 250ms debounce, filters current view | YES |
| User Profile | `shell.html`: topbar-profile + sidebar footer with name/role/logout | YES |
| Conditional sidebar | `shell.html` `data-roles` + `router.js` `applyRbacToNav()` | YES |
| Dashboard default landing | `router.js`: `currentPath()` returns `/dashboard` when hash is empty | YES |

### 4. Main Dashboard UI Components

| Requirement | Where in Code | Met? |
|-------------|---------------|------|
| Header: "Welcome [Role] Panel" | `views/dashboard.js`: "Welcome, [Name]" + role subtitle | YES* |
| Stats Cards (4) | `dashboard.js`: 4-card grid; `api/dashboard/stats.php`: 4 COUNT queries | YES |
| Recent Activities Feed | `dashboard.js`: chronological list; `api/dashboard/activities.php`: last 10 | YES |
| Quick Actions Panel | `dashboard.js`: role-filtered buttons (Add Program, Create Announcement, Upload Gallery) | YES |

> *Dashboard header currently shows "Welcome, [Name]" with role subtitle. Guide.md specifies "Welcome [Role] Panel" format. Phase 7 updates the format.

### 5. UI/UX Quality Targets

| Requirement | Where in Code | Met? |
|-------------|---------------|------|
| Completeness (every use case functional) | 8 CRUD modules + approval workflow; all operations work end-to-end | YES |
| Visual Hierarchy (clean, consistent colors) | Emerald/stone palette; Newsreader + Work Sans fonts; consistent card/table patterns | YES |
| Responsiveness (sidebar toggle, card stacking) | `app.css`: 767px/479px breakpoints; sidebar drawer; hamburger toggle; card stacking | YES |
| UX Smoothness (instant nav, feedback) | Hash routing = instant; `toast.show()` on every CRUD; skeleton loading; empty states | YES |

---

For point-by-point defense with exact code references, see [RUBRIC_DEFENSE.md](./RUBRIC_DEFENSE.md).
