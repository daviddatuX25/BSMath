/**
 * auth.js — authentication state management
 *
 * Owns the question "who is the current user?" for the entire SPA.
 * Persists state in sessionStorage so a page refresh doesn't force a re-login,
 * but closing the tab does — matching the lifetime of the PHP session cookie.
 *
 * WHY sessionStorage (not localStorage)?
 * localStorage survives tab close and could deliver a stale cache long after
 * the PHP session has expired. sessionStorage is cleared when the tab closes,
 * keeping client state in sync with server state.
 */

import { get, post } from './api.js';

const SESSION_KEY = 'bsmath_user';

// ── Read ──────────────────────────────────────────────────────────────────

/**
 * Return the cached user object, or null if not logged in.
 * @returns {{id, name, email, role}|null}
 */
export function getUser() {
  const raw = sessionStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

/**
 * Return true if there is a cached user in sessionStorage.
 * NOTE: This is a client-side check. Use `me()` on page load to verify
 * the server session is still valid.
 */
export function isLoggedIn() {
  return getUser() !== null;
}

/**
 * Return true if the cached user has the given role.
 * @param {string} role — 'admin' | 'dean' | 'program_head'
 */
export function hasRole(role) {
  return getUser()?.role === role;
}

// ── Remote calls ──────────────────────────────────────────────────────────

/**
 * Restore auth state from the server.
 * Called once on page load (before the router runs).
 *
 * WHY hit the server on every page load?
 * The PHP session may have expired between page loads (e.g. 24 h timeout),
 * even though sessionStorage still has a user object. This call makes the
 * client and server consistent before any routing decision is made.
 *
 * @returns {Promise<{id, name, email, role}|null>}
 */
export async function me() {
  const result = await get('auth/me.php');

  if (result.success) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(result.data));
    return result.data;
  }

  // Server says not authenticated — clear any stale client cache
  sessionStorage.removeItem(SESSION_KEY);
  return null;
}

/**
 * Login with email + password.
 *
 * On success: caches the user in sessionStorage, returns {user, error: null}.
 * On failure: does NOT touch sessionStorage, returns {user: null, error}.
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{user: object|null, error: string|null}>}
 */
export async function login(email, password) {
  const result = await post('auth/login.php', { email, password });

  if (result.success) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(result.data));
    return { user: result.data, error: null };
  }

  return { user: null, error: result.error ?? 'Login failed. Please try again.' };
}

/**
 * Logout — destroys the server session and clears the client cache.
 *
 * WHY clear sessionStorage before the server call?
 * If the network request fails, we still want the client to behave as if
 * logged out (fail-safe). The server session will expire naturally.
 *
 * Callers should redirect to #/login after this resolves.
 */
export async function logout() {
  sessionStorage.removeItem(SESSION_KEY);
  await post('auth/logout.php');
}
