# 01-02 SUMMARY — Auth API: login.php, logout.php, me.php

## What was built

Three PHP auth endpoints that power the SPA's authentication:

| File | Method | Purpose |
|------|--------|---------|
| `api/auth/login.php` | POST | Validates email+password, sets `$_SESSION`, returns user |
| `api/auth/logout.php` | POST | Clears `$_SESSION` and destroys session cookie |
| `api/auth/me.php` | GET | Returns current user from DB (re-fetches each call) or 401 |

Supporting file updated:
| File | Change |
|------|--------|
| `api/connect.php` | Added `session_start()`, CORS headers, OPTIONS preflight handling |

## Implementation notes

- All endpoints return `{success: bool, data: payload, error: string|null}` JSON envelope
- `connect.php` now calls `session_start()` once — auth files do NOT call it again
- `me.php` re-fetches the user from DB on every call so role cannot go stale
- `login.php` uses `password_verify()` against bcrypt hash; hash never leaves the server
- All queries are parameterized (`$conn->prepare()`) — no SQL injection vector
- CORS is permissive (`*`) for dev; must be restricted before production

## Verification

```bash
# Syntax check (all pass)
php -l api/connect.php
php -l api/auth/login.php
php -l api/auth/me.php
php -l api/auth/logout.php

# Runtime verification (requires DB)
# 1. POST login — valid credentials
curl -X POST http://localhost/api/auth/login.php \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bsmath.test","password":"password123"}'
# → 200: {"success":true,"data":{"id":1,"name":"Admin User","email":"admin@bsmath.test","role":"admin"}}

# 2. GET me (authenticated)
curl http://localhost/api/auth/me.php
# → 200: {"success":true,"data":{...}}

# 3. POST logout
curl -X POST http://localhost/api/auth/logout.php
# → 200: {"success":true,"data":null}

# 4. GET me (after logout)
curl http://localhost/api/auth/me.php
# → 401: {"success":false,"data":null,"error":"Not authenticated"}
```

## Dependencies

- Requires `api/connect.php` from **01-01** (provides `$conn` and session)
- Requires `users` table with bcrypt-hashed passwords (from **01-01** seed)

## Commits

- `cd7982d` feat: add auth API endpoints (login, logout, me)

## Out for 01-03

The SPA shell, login page, and routing (`#/login`, `#/dashboard`) that consumes these endpoints.
