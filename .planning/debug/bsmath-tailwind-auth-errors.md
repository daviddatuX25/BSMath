---
status: investigating
trigger: "Console errors on BSMath SPA load: tailwind is not defined, 401 on /api/auth/me.php, main.js TypeError on Object.entries"
created: 2026-04-15
updated: 2026-04-15
symptoms:
  expected: "App loads, shows login or dashboard based on session"
  actual: "Console shows tailwind is not defined, 401 on me.php, main.js TypeError"
  errors:
    - "net::ERR_NETWORK_CHANGED for Google Fonts and Tailwind CDN"
    - "Uncaught ReferenceError: tailwind is not defined at bsmath/:33"
    - "GET http://localhost/bsmath/api/auth/me.php 401 (Unauthorized)"
    - "main.js:1 Uncaught TypeError: Cannot convert undefined or null to object at Object.entries"
    - "favicon.ico 404 (Not Found)"
  timeline: "Errors appeared when accessing http://localhost/bsmath/ in browser"
  reproduction: "Open browser to http://localhost/bsmath/ — errors appear immediately"
hypothesis: null
test: null
expecting: null
next_action: null
reasoning_checkpoint: null
tdd_checkpoint: null
---

## Evidence

### Error 1: `tailwind is not defined` (root cause)

**File:** `index.html` line 33
**Code:**
```html
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
```
**Config script (line ~35):**
```html
<script>
  tailwind.config = { ... };
</script>
```

**Root cause:** The CDN script is loaded with `?plugins=...` query param, and the config script runs immediately after — before the CDN script's inline execution has set the global `tailwind` object. The CDN script is also failing to load with `ERR_NETWORK_CHANGED` (no internet connection in browser).

**Fix:** Load the CDN via a proper `type="module"` import, OR wrap the config in `window.addEventListener('load', ...)` after the CDN script loads, OR self-host Tailwind.

### Error 2: `ERR_NETWORK_CHANGED` for CDN resources

**Root cause:** Browser machine has no internet access, or the network changed during the request. The Tailwind CDN and Google Fonts cannot be fetched.

**Fix:** Self-host Tailwind CSS (download the CDN file and serve locally). Self-host Google Fonts (or accept degraded icon/font experience offline).

### Error 3: `401 Unauthorized` on `/api/auth/me.php`

**Root cause:** When accessing via `http://localhost/bsmath/`, the `me()` call in `app.js` hits `api/auth/me.php`. The 401 means the PHP session is not authenticated. If this is a fresh session (never logged in), this is EXPECTED — the login page should be shown. However, if the app crashes due to the Tailwind error before it can render the login page, it appears broken.

**Fix:** This is expected behavior for unauthenticated users IF the login page renders correctly. The console error is cosmetic if the app still functions.

### Error 4: `main.js:1 TypeError: Cannot convert undefined or null to object`

**Root cause:** This is from a minified third-party script (main.js is NOT a file in the BSMath project). Likely Google Analytics or similar injected script. NOT a BSMath code issue.

### Error 5: `favicon.ico 404`

**Root cause:** No favicon in `http://localhost/bsmath/` root.

**Fix:** Add a favicon or ignore (non-critical).

## Proposed Fixes

1. **Critical:** Fix Tailwind loading order — move config into an onload callback
2. **Critical:** Self-host Tailwind CSS so it works offline (download CDN file to `assets/vendor/tailwindcss/`)
3. **Optional:** Self-host Google Fonts (or graceful fallback with system fonts)
4. **Optional:** Add favicon
