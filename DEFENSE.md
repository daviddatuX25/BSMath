# Defense Preparation Guide — BS Math Department Website

> Beginner-to-advanced walkthrough of every concept, syntax, and decision in this codebase.
> Read top-to-bottom for a structured review, or jump to any section.

---

## Table of Contents

1. [The Big Picture](#1-the-big-picture)
2. [Database Layer](#2-database-layer)
3. [API Layer — Admin (Protected)](#3-api-layer--admin-protected)
4. [API Layer — Public (Unprotected)](#4-api-layer--public-unprotected)
5. [Authentication & Sessions](#5-authentication--sessions)
6. [Role-Based Access Control (RBAC)](#6-role-based-access-control-rbac)
7. [Admin SPA — Architecture](#7-admin-spa--architecture)
8. [Client Website — Architecture](#8-client-website--architecture)
9. [Key Syntax & Concepts Explained](#9-key-syntax--concepts-explained)
10. [Likely Defense Questions & Answers](#10-likely-defense-questions--answers)

---

## 1. The Big Picture

### What is this project?

A department website for BS Mathematics with **two sides**:

| Side | URL | Who uses it | What it does |
|------|-----|-------------|-------------|
| **Client (public)** | `/` (root) | Anyone — no login needed | Browse programs, announcements, events, news, gallery, faculty |
| **Admin (private)** | `/admin/` | Staff only — must log in | Create/edit/delete content, manage users, approve items |

### How data flows

```
Visitor's browser                    Admin's browser
    |                                    |
    v                                    v
Client HTML pages                   Admin SPA (index.html)
    |                                    |
    v                                    v
public_api/*.php  (no auth)          api/*.php  (session-protected)
    |                                    |
    +---------- both connect to ---------+
                    |
                    v
              MySQL database
           (bsmath schema)
```

**Layman's terms:** Think of it like a restaurant. The client website is the menu display out front — anyone can read it. The admin panel is the kitchen — only staff can go in and change what's on the menu.

### File structure at a glance

```
BSMath/
  index.html              ← public homepage
  programs.html           ← public pages (6 total)
  announcements.html
  events.html / news.html / gallery.html / faculty.html
  css/client.css          ← public site styles
  js/fetch-section.js     ← shared fetch helper

  admin/                   ← admin SPA (separate app)
    index.html             ← admin entry point
    views/                 ← HTML fragments (login, shell)
    assets/js/             ← router, auth, api wrapper, view modules, UI helpers

  api/                     ← admin PHP endpoints (session-protected)
    auth/login.php, me.php, logout.php
    programs/, announcements/, events/, news/, gallery/, faculty/
    users/, approvals/, dashboard/, helpers/

  public_api/              ← public PHP endpoints (no auth, no session)
    programs_api.php, announcements_api.php, events_api.php
    news_api.php, gallery_api.php, faculty_api.php

  db/
    schema.sql             ← table definitions
    seed.sql               ← demo data
```

---

## 2. Database Layer

### `db/schema.sql` — 8 Tables

| Table | Purpose | In Layman's Terms |
|-------|---------|-------------------|
| `users` | Admin accounts | The staff keycard list — who can enter the kitchen |
| `programs` | Academic programs | The degree offerings on the menu |
| `announcements` | Department notices | Bulletin board posts |
| `events` | Calendar events | Scheduled activities with date/time/place |
| `news` | News articles | Blog-style posts (admin-only) |
| `gallery` | Photo gallery | Photo album entries |
| `faculty` | Faculty directory | Staff profiles |
| `activities` | Activity log | The kitchen's CCTV — records every action |

### Key SQL Concepts Used

**FOREIGN KEY with ON DELETE SET NULL**
```sql
created_by INT,
FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
```
- **What it means:** If a user is deleted, their created items survive but the `created_by` column becomes NULL.
- **Why not CASCADE?** Deleting a user should NOT delete all their announcements/events. CASCADE would destroy content; SET NULL preserves it with "unknown author."
- **Defense answer:** "We chose SET NULL because content outlives the creator. If a faculty member leaves, their announcements should still exist."

**ENUM types for status and role**
```sql
role ENUM('admin', 'dean', 'program_head')
status ENUM('pending', 'approved', 'rejected')
```
- **What it means:** The database itself enforces that only these exact values are allowed. You literally cannot insert `role = 'superadmin'` — MySQL will reject it.
- **Layman's terms:** Like a dropdown that only has 3 options — you can't type a custom answer.
- **Defense answer:** "ENUM acts as a whitelist at the database level. Even if the application has a bug, the database won't accept invalid values."

**TIMESTAMP with auto-update**
```sql
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```
- `DEFAULT CURRENT_TIMESTAMP` — automatically fills in the current time when a row is created.
- `ON UPDATE CURRENT_TIMESTAMP` — automatically updates the time whenever the row changes.
- The `activities` table intentionally has NO `updated_at` because activity logs are append-only (never edited).

**utf8mb4 charset**
- Regular MySQL `utf8` is only 3 bytes — it cannot store 4-byte characters like emojis or some Asian scripts.
- `utf8mb4` is the real UTF-8 (4 bytes) — supports everything including emojis.
- **Defense answer:** "utf8mb4 is the complete UTF-8. MySQL's 'utf8' is actually a 3-byte subset that can't store all Unicode characters."

**InnoDB engine**
- Required for foreign key support. MyISAM does not support FKs.
- Also supports transactions (row-level locking).

### `db/seed.sql` — Demo Data

- 3 users: admin, dean, program_head — all share password `password123`.
- The password is stored as a **bcrypt hash** (`$2y$10$...`), not plaintext.
  - `$2y$` = PHP bcrypt identifier
  - `10` = cost factor (2^10 = 1024 iterations — how many times the hash runs)
- Seeding order matters: `users` first (because other tables reference `users.id`).

---

## 3. API Layer — Admin (Protected)

### The shared bootstrap: `api/connect.php`

Every admin API file starts with `require_once __DIR__ . '/../connect.php'`. This one file does 4 things:

| Step | Code | Layman's Terms |
|------|------|----------------|
| 1. Start session | `session_start()` | Opens the visitor's session file so we can check their ID |
| 2. Set CORS headers | `Access-Control-Allow-Origin: *` | Tells browsers "any website can call this API" (dev only) |
| 3. Handle preflight | `if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS')` | Browsers send a "can I call you?" request first; this answers "yes" |
| 4. Connect to DB | `mysqli_connect(...)` | Opens the database connection |

**Preflight (OPTIONS) explained:** When a browser sends a cross-origin request with custom headers, it first sends an OPTIONS request to ask "am I allowed?" If the server doesn't respond correctly, the browser blocks the real request. This is a browser security feature called **CORS** (Cross-Origin Resource Sharing).

### The JSON Envelope Pattern

Every admin API response uses this shape:
```json
{ "success": true,  "data": [...],    "error": null }
{ "success": false, "data": null,     "error": "Not authenticated" }
```

**Why this pattern?** The JS `api.js` wrapper normalizes every response (even network failures) into this shape. Callers always check `result.success` — they never need to distinguish between "server returned an error" vs "network went down."

### Authentication Check (every endpoint)

```php
if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Not authenticated']);
    exit;
}
```
- **401** = "I don't know who you are" (unauthenticated)
- **403** = "I know who you are, but you can't do this" (unauthorized/forbidden)

### Role Check (varies per endpoint)

```php
if (!in_array($_SESSION['role'], ['admin', 'program_head'])) {
    http_response_code(403);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Forbidden']);
    exit;
}
```

### `api/auth/login.php` — The Login Endpoint

**Step by step:**
1. Reject non-POST requests → `405 Method Not Allowed`
2. Read JSON body from `php://input` (not `$_POST` — `$_POST` only works for form-encoded data)
3. Look up user by email using a **prepared statement** (prevents SQL injection)
4. Check password with `password_verify()` (NOT `===` — bcrypt generates different hashes each time)
5. Store `user_id`, `role`, `name` in `$_SESSION`
6. Return user object

**Prepared statement explained:**
```php
$stmt = $conn->prepare('SELECT * FROM users WHERE email = ?');
$stmt->bind_param('s', $email);   // 's' = string
$stmt->execute();
```
- The `?` is a **placeholder**. The actual value is sent separately.
- The database treats the parameter as DATA, not as SQL code.
- Even if someone enters `email = "admin'; DROP TABLE users; --"`, it's treated as a literal string, not SQL.
- **Layman's terms:** Like writing a form letter with a blank, then filling in the name separately — the name can never alter the letter's structure.

**Why NOT `===` for password check?**
- `password_hash()` generates a **different hash every time** (because of a random salt).
- So the stored hash and a fresh hash of the same password will look different.
- `password_verify()` extracts the salt from the stored hash and re-hashes correctly.
- **Layman's terms:** Bcrypt is like a blender — put in the same ingredient twice and the result looks different each time, but `password_verify()` has a special technique to verify they used the same ingredient.

### `api/gallery/store.php` — File Upload

This is the most complex endpoint. The flow:

1. **Validate file**: check for upload errors, max 5MB, allowed MIME types (jpeg/png/gif/webp)
2. **Generate safe filename**: `uniqid() . '_' . sanitized_name . '.' . extension`
   - `uniqid()` prevents filename collisions
   - `preg_replace('/[^a-zA-Z0-9_-]/', '_', ...)` strips dangerous characters — prevents directory traversal attacks like `../../../etc/passwd`
3. **Create directory**: `mkdir($uploadDir, 0755, true)` — `true` means create parent dirs too
4. **Move file**: `move_uploaded_file()` — the ONLY safe way in PHP. Unlike `rename()` or `copy()`, it verifies the file was actually uploaded via HTTP POST.
5. **Insert DB record** with prepared statement
6. **Log activity**

**Why not allow SVG?** SVG files can contain embedded JavaScript. If someone uploads `evil.svg` with `<script>alert('xss')</script>`, opening the image could run that script. By excluding SVG from the allowed list, we prevent this attack vector.

### `api/helpers/log_activity.php`

The `log_activity()` function inserts a row into the `activities` table. Key design: **silent failure** — if the insert fails, the function returns without error. The comment says "activity logging must never break the main action."

**Layman's terms:** The CCTV camera might be broken, but the kitchen still operates. We don't shut down the restaurant because the security camera stopped recording.

---

## 4. API Layer — Public (Unprotected)

### How public APIs differ from admin APIs

| Aspect | Admin API (`api/`) | Public API (`public_api/`) |
|--------|-------------------|---------------------------|
| Auth check | Yes — session required | No — anyone can call |
| Session start | Yes | No |
| Includes `connect.php` | Yes | No — own connection |
| Response format | `{success, data, error}` envelope | Plain array `[...]` |
| MySQLi style | Procedural (`mysqli_query()`) | OOP (`$conn->query()`) |
| CORS | In `connect.php` | Inline per-file |
| Status filters | Returns ALL (regardless of status) | Filters by approved/active/published only |

### The public API template (all 6 files follow this pattern)

```php
<?php
header("Content-Type: application/json");        // Tell browser: "this is JSON"
header("Access-Control-Allow-Origin: *");         // Allow any website to call this

$conn = new mysqli("localhost", "root", "", "bsmath");  // Connect directly (no session)
if ($conn->connect_error) { ... }                        // Check connection

$result = $conn->query("SELECT ... WHERE status = 'approved' ...");  // Filter by status
$data = [];
while ($row = $result->fetch_assoc()) { $data[] = $row; }            // Build array
echo json_encode($data);                                              // Return JSON
?>
```

### Why no SQL injection risk in public APIs?

There are no user inputs in the queries — they are all simple `SELECT ... WHERE status = 'approved'` with hardcoded values. SQL injection requires user-controlled input being inserted into a query. Without that, there's nothing to inject.

### Content moderation by status filter

| Endpoint | Filter | Why |
|----------|--------|-----|
| programs | `status = 'active'` | Only show active programs |
| announcements | `status = 'approved'` | Only show dean-approved announcements |
| events | `status = 'approved'` | Only show dean-approved events |
| news | `status = 'published'` | Only show published news |
| gallery | **no filter** | All gallery items are public by design |
| faculty | `status = 'active'` | Only show active faculty |

**Defense answer for "why no gallery filter?":** Gallery items are uploaded by admins who have already decided the image is appropriate. Unlike announcements/events that go through an approval workflow, gallery items are curated at upload time.

---

## 5. Authentication & Sessions

### The full login flow (step by step)

```
1. User opens /admin/ → browser loads admin/index.html
2. app.js runs → calls me() → GET api/auth/me.php
3. me.php checks $_SESSION['user_id'] → empty → returns 401
4. JS sees 401 → redirects to #/login
5. User types email + password → submits form
6. JS calls login() → POST api/auth/login.php
7. PHP finds user by email (prepared statement)
8. PHP checks password_verify($input, $stored_hash)
9. PHP stores user_id, role, name in $_SESSION
10. PHP returns {success: true, data: {id, name, email, role}}
11. JS stores user in sessionStorage
12. JS redirects to #/dashboard
```

### Session vs sessionStorage — two different things

| | PHP Session (`$_SESSION`) | JS sessionStorage |
|---|---|---|
| Where stored | On the server (file/database) | In the browser (per-tab) |
| Lifetime | Until timeout or logout | Until tab is closed |
| Security | Cannot be read by JS directly | Can be read/modified by JS |
| Purpose | Server knows who you are | Client caches user info for UI |

**Why use both?** The PHP session is the source of truth (server-side, tamper-proof). The sessionStorage is a client-side cache so the router doesn't need to hit the server on every page navigation.

### The `me()` call on every page load

When the admin SPA loads, `app.js` calls `me()` BEFORE starting the router. This re-validates with the server in case:
- The PHP session expired (timeout)
- An admin deleted the user account
- The user's role was changed

**Layman's terms:** Like checking your ID at the door every time you enter the building, even if you were here yesterday.

### Logout flow

```javascript
// 1. Clear client cache FIRST (fail-safe)
sessionStorage.removeItem('bsmath_user');

// 2. Then tell the server
await post('auth/logout.php');
```

**Why clear client first?** If the network request fails, the user is still "logged out" on the client side. The server session will expire naturally. If we did it the other way around and the network failed, the client would think they're still logged in while the server already destroyed the session.

The PHP logout destroys the session thoroughly:
1. Empty `$_SESSION` array
2. Delete the session cookie (set expiry to the past)
3. Call `session_destroy()` (removes server-side session file)

---

## 6. Role-Based Access Control (RBAC)

### Three roles, different permissions

| Feature | admin | dean | program_head |
|---------|-------|------|-------------|
| Dashboard | Yes | Yes | Yes |
| Programs | Yes | No | Yes |
| Announcements | Yes | Yes | Yes |
| Events | Yes | Yes | No |
| News | Yes | No | No |
| Gallery | Yes | No | Yes |
| Faculty | Yes | No | No |
| Users | Yes | No | No |
| Approvals | No | Yes | No |

### RBAC is enforced at 5 levels (defense goldmine)

```
Level 1: DATABASE — ENUM('admin','dean','program_head')
         → Can't insert invalid roles at the data level

Level 2: SERVER API — in_array($_SESSION['role'], ['admin','dean'])
         → Returns 401/403 even if client-side is bypassed

Level 3: CLIENT ROUTER — routes['/news'].roles = ['admin']
         → Redirects to dashboard if role doesn't match

Level 4: CLIENT SIDEBAR — data-roles="admin" on nav links
         → Hides nav items the user can't access

Level 5: CLIENT VIEW — role-filtered quick actions on dashboard
         → Only shows action buttons for permitted features
```

**Defense answer for "Can a user bypass client-side RBAC?":** "Yes, client-side RBAC is only for UX convenience. The server-side checks are the real security layer. If someone edits the browser console to unhide a nav link and clicks it, the API will return 403 Forbidden."

### The Approval Workflow

```
program_head creates announcement (status = 'pending')
        |
        v
dean sees it in Approvals page
        |
   +----+----+
   |         |
approve    reject
   |         |
   v         v
status =   status =
'approved' 'rejected'
   |
   v
appears in public_api
(visible to visitors)
```

This is why `dean` has access to the Approvals page and `program_head` does not.

---

## 7. Admin SPA — Architecture

### Hash-based routing explained

The admin SPA uses URLs like `/admin/#/dashboard` and `/admin/#/programs`.

**How it works:**
- The `#` (hash) and everything after it NEVER reaches the server.
- No matter what hash you type, the server always serves `admin/index.html`.
- The JS `router.js` reads the hash and decides what to render.
- `window.addEventListener('hashchange', ...)` fires whenever the hash changes.

**Why hash routing instead of clean URLs like `/admin/dashboard`?**
- Clean URLs require server-side URL rewriting (`.htaccess` or similar).
- Hash routing works with zero server configuration.
- **Layman's terms:** The hash is like a note pinned to a letter — the post office (server) only sees the address (index.html), but the recipient (JavaScript) reads the note too.

### Dynamic imports (code splitting)

```javascript
const { loadDashboard } = await import('./views/dashboard.js');
```

This is **dynamic `import()`** — it loads the JS file only when the user navigates to that route. This means:
- Initial page load is faster (only `app.js` + `router.js` + `auth.js` + `api.js`)
- Each view module is loaded on demand
- **Layman's terms:** Instead of shipping the entire encyclopedia, you only deliver the chapter someone asks for.

### The modal system (`admin/assets/js/ui/modal.js`)

Two modes:
1. **Confirmation dialog**: `modal.open({ title, body, onConfirm })` — shows "Are you sure?"
2. **Form dialog**: `modal.openForm({ title, fields, onSubmit })` — shows a form built from a field definition array

Key technique — **form data extraction**:
```javascript
const data = Object.fromEntries(new FormData(form).entries());
```
- `FormData(form)` collects all named input values.
- `Object.fromEntries()` converts the key-value pairs into a plain JS object.
- **Layman's terms:** Like a secretary who reads all the fields on a form and types them into a spreadsheet.

### Global search with debouncing (`admin/assets/js/ui/search.js`)

**Debouncing explained:**
```javascript
let timer;
input.addEventListener('input', () => {
  clearTimeout(timer);
  timer = setTimeout(() => filterRows(term), 250);
});
```
- On every keystroke, clear the previous timer and set a new 250ms timer.
- The search only runs when the user **stops typing for 250ms**.
- **Layman's terms:** Like waiting for someone to finish speaking before you reply, instead of responding to every syllable.
- **Why?** Filtering 200 table rows on every single keystroke would be slow and wasteful.

### Toast notifications

- Created dynamically in `app.js` via `showToast(message, type)`.
- Auto-dismiss after 3.5 seconds.
- Types: `success` (green), `error` (red), `info` (gray).
- Exposed on `window` so view modules can call it without importing app.js.

---

## 8. Client Website — Architecture

### Multi-page architecture (not SPA)

Each section is a **separate HTML file**. Navigation uses regular `<a href="programs.html">` links that cause a full page load.

**Why not SPA for the client site?**
- Simpler — no router needed, no state management.
- SEO-friendly — each page has its own URL that search engines can index.
- The guide (`guide-api-activity.md`) specifically shows this pattern.
- **Layman's terms:** The client site is like a book with separate pages. The admin panel is like a single-page app where pages swap without reloading.

### `js/fetch-section.js` — The shared helper

```javascript
function fetchSection(apiUrl, renderFn) {
  var container = document.getElementById('content');
  container.innerHTML = '<div class="loading">Loading...</div>';

  fetch(apiUrl)
    .then(function(response) {
      if (!response.ok) throw new Error('Failed to fetch data');
      return response.json();
    })
    .then(function(data) {
      if (data.length === 0) {
        container.innerHTML = '<div class="empty-state">No items found.</div>';
        return;
      }
      container.innerHTML = renderFn(data);
    })
    .catch(function(err) {
      container.innerHTML = '<div class="error-state">Failed to load data.</div>';
    });
}
```

**Three states handled:**
1. **Loading** — shown immediately while the fetch is in progress
2. **Empty** — shown when the API returns an empty array
3. **Error** — shown when the fetch fails (network error, 500, etc.)

**The callback pattern:** Each page passes a different `renderFn` that takes the data array and returns an HTML string. This is how one helper serves 6 different pages.

### `css/client.css` — CSS Custom Properties

```css
:root {
  --primary: #006d36;
  --primary-light: #50c878;
  --on-primary: #ffffff;
  /* ... */
}
```

**Why CSS variables?** One change to `--primary` recolors the entire site. These mirror the admin SPA's Tailwind color tokens for visual consistency between the two sides.

**Responsive grid:**
```css
.section-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}
```
- `auto-fit` — automatically creates as many columns as fit.
- `minmax(280px, 1fr)` — each column is at least 280px wide, at most equal share of space.
- **Layman's terms:** The grid is like elastic shelving — it adds shelves when there's room and collapses them when there isn't.

---

## 9. Key Syntax & Concepts Explained

### PHP Concepts

| Concept | Where Used | Layman's Explanation |
|---------|-----------|---------------------|
| `$_SESSION` | Auth | A server-side storage box for this visitor's data. Lives until they close the browser or the session times out. |
| `session_start()` | `connect.php` | Opens that storage box. Without this call, `$_SESSION` is empty. |
| `file_get_contents('php://input')` | `login.php` | Reads the raw request body. `$_POST` only works for form-encoded data; this works for JSON too. |
| `password_verify()` | `login.php` | The ONLY correct way to check bcrypt. Never use `===` on hashes. |
| `password_hash($pw, PASSWORD_BCRYPT)` | `seed.sql` | Hashes a password using bcrypt. Generates a unique salt automatically. |
| `mysqli_prepare()` + `bind_param()` | All admin endpoints | Prevents SQL injection by separating SQL structure from data. |
| `$conn->query()` | Public APIs | Simple query execution. Safe when there are no user inputs. |
| `move_uploaded_file()` | `gallery/store.php` | The ONLY safe way to move an uploaded file in PHP. Verifies it was actually uploaded via HTTP. |
| `http_response_code(401)` | Auth check | "I don't know who you are" |
| `http_response_code(403)` | Role check | "I know who you are, but you can't do this" |
| `http_response_code(405)` | Method check | "You used GET but this endpoint only accepts POST" |
| `json_encode()` | All endpoints | Converts a PHP array/object into a JSON string |
| `header("Content-Type: application/json")` | All endpoints | Tells the browser "the response is JSON, not HTML" |
| `header("Access-Control-Allow-Origin: *")` | Public APIs | "Any website can call this endpoint" (CORS) |
| `exit` | Auth check | Stops PHP execution immediately. Used after sending an error response so no more code runs. |
| `require_once` | `connect.php` include | Loads a file exactly once. If the file doesn't exist, PHP throws a fatal error (unlike `include_once` which only warns). |
| `UNIQUE` constraint | `users.email`, `programs.code` | No two rows can have the same value. Like a "no duplicates" rule. |
| `ON DELETE SET NULL` | All foreign keys | If the referenced row is deleted, this column becomes NULL instead of breaking. |
| `ENUM` | `role`, `status` columns | A whitelist of allowed values enforced at the database level. |

### JavaScript Concepts

| Concept | Where Used | Layman's Explanation |
|---------|-----------|---------------------|
| `fetch()` | `api.js`, `fetch-section.js` | The browser's built-in way to make HTTP requests. Replaces the old `XMLHttpRequest`. |
| `Promise` / `.then()` | `fetch-section.js` | A placeholder for a value that will arrive later. Like an "IOU" for data. |
| `async/await` | `api.js`, all admin views | Syntactic sugar over Promises. `await` pauses execution until the Promise resolves. |
| `sessionStorage` | `auth.js` | Browser storage that clears when the tab closes. Smaller scope than `localStorage`. |
| ES modules (`import`/`export`) | All admin JS | Each JS file is a module with its own scope. `import` pulls in functions from other files. |
| Dynamic `import()` | `router.js` | Loads a module on demand (code splitting). Only downloads the file when the route is visited. |
| `window.location.hash` | Router | The `#` part of the URL. Changes don't cause page reloads. |
| `hashchange` event | Router | Fires when the URL hash changes. This is the router's trigger. |
| `innerHTML` | All views | Sets the HTML content of an element. Fast but be careful — unescaped user data = XSS risk. |
| `textContent` | Router, modal | Sets text safely (no HTML interpretation). Used for error messages and user data. |
| `Object.fromEntries(new FormData(form))` | `modal.js` | Converts a form's inputs into a plain JS object. |
| `URL.createObjectURL(file)` | `gallery.js` | Creates a temporary browser URL for a local file. Used for image preview before upload. |
| Debouncing | `search.js` | Delay execution until the user pauses. Prevents running code on every keystroke. |
| Event delegation | `programs.js` et al. | One listener on a parent instead of many on children. Works with dynamically created elements. |
| `?.` optional chaining | `auth.js` | `getUser()?.role` — if getUser() is null, stop and return undefined instead of crashing. |
| `??` nullish coalescing | `login.php` | `$body['email'] ?? ''` — if the key is null/undefined, use the fallback. |

### CSS Concepts

| Concept | Where Used | Layman's Explanation |
|---------|-----------|---------------------|
| CSS custom properties (`--var`) | `client.css` | Variables in CSS. Change once, update everywhere. |
| `auto-fit` + `minmax()` | `client.css` grid | Creates a responsive grid that auto-adjusts column count. |
| `object-fit: cover` | Gallery, Faculty | Crops images to fill their container without stretching. |
| `@media (max-width: 640px)` | `client.css` | Applies styles only on screens narrower than 640px (responsive design). |
| `backdrop-blur-xl` | Shell topbar | Blurs the background behind the element (glass effect). |

---

## 10. Likely Defense Questions & Answers

### Architecture

**Q: Why did you use a SPA for the admin but multi-page for the client?**
A: The admin needs complex interactions (modals, search, role-based navigation) that benefit from SPA architecture — no full reloads, shared state. The client site is read-only browsing where separate pages are simpler, more SEO-friendly, and match the guide's instructions.

**Q: Why hash routing instead of the History API?**
A: Hash routing requires zero server configuration. The `#` fragment never reaches the server, so Apache always serves `index.html` and JS handles routing. History API would require `.htaccess` URL rewriting to avoid 404s on refresh.

**Q: What is the difference between your admin API and public API?**
A: The admin API (`api/`) is session-protected and returns data in a `{success, data, error}` envelope. The public API (`public_api/`) has no authentication, creates its own database connection, returns a plain JSON array, and filters content by status (only approved/published items).

### Security

**Q: How do you prevent SQL injection?**
A: All admin endpoints use prepared statements with `bind_param()`. The SQL structure and data are sent separately, so user input is always treated as data, never as executable SQL. The public APIs use hardcoded queries with no user input, so injection is not possible there.

**Q: How do you prevent XSS?**
A: In the admin SPA, all user-generated content is passed through `escapeHtml()` before being inserted via `innerHTML`. This replaces `<`, `>`, `&`, `"`, `'` with HTML entities so they render as text instead of being interpreted as HTML/JS.

**Q: Why use bcrypt instead of MD5 or SHA256 for passwords?**
A: Bcrypt is designed for passwords — it's slow by design (configurable cost factor), which makes brute-force attacks impractical. MD5 and SHA256 are fast hashing algorithms designed for data integrity, not security. An attacker could try billions of MD5 guesses per second but only thousands of bcrypt guesses.

**Q: What is CORS and why do you set `Access-Control-Allow-Origin: *`?**
A: CORS (Cross-Origin Resource Sharing) is a browser security feature that blocks web pages from making requests to a different domain. The `*` wildcard allows any origin to call the API. This is acceptable in development but should be restricted to specific origins in production.

**Q: Why is `move_uploaded_file()` used instead of `rename()` for gallery uploads?**
A: `move_uploaded_file()` verifies the file was actually uploaded via HTTP POST, preventing path traversal attacks. `rename()` would move ANY file the PHP process can access, which is a security risk.

**Q: Can someone bypass your client-side RBAC?**
A: Yes — client-side RBAC (hiding nav links, redirecting) is only for user experience. The real security is server-side: every API endpoint checks `$_SESSION['role']` and returns 403 for unauthorized access. Someone using the browser console to unhide a nav link would get a 403 error from the API.

### Database

**Q: Why `ON DELETE SET NULL` instead of `CASCADE`?**
A: CASCADE would delete all content created by a user when that user is deleted. SET NULL preserves the content — the author field becomes "Unknown" but the announcement/event/program still exists. Content outlives its creator.

**Q: What's the difference between MyISAM and InnoDB?**
A: InnoDB supports transactions, row-level locking, and foreign keys. MyISAM is simpler but lacks FK support and only supports table-level locking. We need InnoDB for our foreign key relationships.

**Q: Why use ENUM for roles instead of a separate roles table?**
A: With only 3 fixed roles that rarely change, ENUM is simpler and enforces valid values at the database level. A separate roles table would add complexity (JOINs, migration) for minimal benefit. If roles were dynamic or numerous, a lookup table would be better.

### JavaScript

**Q: What is the difference between `var`, `let`, and `const`?**
A: `var` is function-scoped and hoisted (can be used before declaration). `let` is block-scoped and not hoisted. `const` is block-scoped and cannot be reassigned. The client pages use `var` for simplicity; the admin SPA uses `const`/`let` for stricter scoping.

**Q: Why do you call `me()` before `router.init()`?**
A: The router makes immediate role-based decisions. If it runs first, it finds empty sessionStorage and redirects to login — even if the PHP session is still valid. Restoring auth state first ensures the first navigation is correct.

**Q: What is debouncing and why do you use it?**
A: Debouncing delays a function call until the user pauses. Our search waits 250ms after the last keystroke before filtering. Without it, filtering would run on every keystroke, which is wasteful and could feel laggy with large datasets.

**Q: What is event delegation?**
A: Instead of attaching a click handler to every button in a table, we attach ONE handler on the table container and check `e.target.closest('[data-action]')` to see which button was clicked. This is more efficient and works with dynamically added rows.

### Workflow

**Q: Walk me through the approval workflow.**
A: A program_head creates an announcement or event with `status = 'pending'`. The dean sees pending items in the Approvals page. The dean can approve (status becomes 'approved') or reject (status becomes 'rejected'). Only approved items appear in the public API endpoints. The `approved_by` column records which dean approved it.

**Q: Walk me through the file upload process.**
A: The user selects a file in the gallery form. `URL.createObjectURL()` shows a live preview. On submit, a `FormData` object is built with the file and metadata. The request is sent as `multipart/form-data` (not JSON) to `gallery/store.php`. PHP validates the file type and size, generates a safe filename with `uniqid()`, moves it with `move_uploaded_file()` to `uploads/gallery/`, and inserts a database record.

**Q: Walk me through what happens when a visitor opens the public site.**
A: They visit `index.html` — a static page with navigation cards. Clicking "Programs" loads `programs.html`, which calls `fetchSection('public_api/programs_api.php', renderFn)`. The PHP endpoint connects to MySQL, runs `SELECT ... WHERE status = 'active'`, returns JSON. The JS renders the data as HTML cards. No login, no session, no authentication — fully public.

---

### Quick Reference: HTTP Status Codes Used

| Code | Meaning | When we return it |
|------|---------|-------------------|
| 200 | OK | Successful request |
| 401 | Unauthorized | No valid session (don't know who you are) |
| 403 | Forbidden | Valid session but wrong role (know who you are, but can't do this) |
| 405 | Method Not Allowed | Used GET on a POST-only endpoint |
| 500 | Internal Server Error | Database connection failed or query failed |

### Quick Reference: File Map by Feature

| Feature | Client Files | Admin Files | API Files |
|---------|-------------|-------------|-----------|
| Programs | `programs.html` | `views/programs.js` | `api/programs/`, `public_api/programs_api.php` |
| Announcements | `announcements.html` | `views/announcements.js` | `api/announcements/`, `public_api/announcements_api.php` |
| Events | `events.html` | `views/events.js` | `api/events/`, `public_api/events_api.php` |
| News | `news.html` | `views/news.js` | `api/news/`, `public_api/news_api.php` |
| Gallery | `gallery.html` | `views/gallery.js` | `api/gallery/`, `public_api/gallery_api.php` |
| Faculty | `faculty.html` | `views/faculty.js` | `api/faculty/`, `public_api/faculty_api.php` |
| Auth | — | `auth.js`, `views/login.html` | `api/auth/` |
| Dashboard | — | `views/dashboard.js` | `api/dashboard/` |
| Approvals | — | `views/approvals.js` | `api/approvals/` |
| Users | — | `views/users.js` | `api/users/` |