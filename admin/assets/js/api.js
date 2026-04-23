/**
 * api.js — fetch wrapper for the PHP JSON API
 *
 * Every PHP endpoint returns this envelope:
 *   { success: true|false, data: <payload|null>, error: "<message|null>" }
 *
 * This module normalises network failures and HTTP errors into the same shape
 * so callers never have to distinguish between transport failures and
 * application-level failures — they always check result.success.
 */

/** Base path to the API directory, relative to index.html. */
const BASE = '../api';

/**
 * Internal helper — executes a fetch request and returns a normalised result.
 *
 * @param {string}      path    — e.g. 'auth/login.php'
 * @param {RequestInit} options — standard fetch options
 * @returns {Promise<{success: boolean, data: *, error: string|null}>}
 */
async function request(path, options = {}) {
  try {
    const response = await fetch(`${BASE}/${path}`, {
      /*
       * WHY credentials: 'same-origin'?
       * The PHP session cookie must be sent with every request so the server
       * can identify who is making the call. 'same-origin' is the safe default
       * — it only sends cookies when the page and API are on the same origin.
       */
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const json = await response.json();

    // PHP always returns our envelope — if success is missing something went
    // very wrong (e.g. server error before JSON could be written).
    if (json.success === undefined) {
      return {
        success: false,
        data: null,
        error: `Unexpected server response (HTTP ${response.status})`,
      };
    }

    return json;
  } catch (err) {
    // Network failure or JSON parse error
    return {
      success: false,
      data: null,
      error: err.message ?? 'Network error — check your connection',
    };
  }
}

/**
 * GET request.
 * @param {string} path — API path, e.g. 'auth/me.php'
 * @returns {Promise<{success, data, error}>}
 */
export function get(path) {
  return request(path, { method: 'GET' });
}

/**
 * POST request with a JSON body.
 * @param {string} path — API path
 * @param {object} body — will be JSON-serialised
 * @returns {Promise<{success, data, error}>}
 */
export function post(path, body = {}) {
  return request(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * PUT request with a JSON body.
 * @param {string} path — API path
 * @param {object} body — will be JSON-serialised
 * @returns {Promise<{success, data, error}>}
 */
export function put(path, body = {}) {
  return request(path, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

/**
 * DELETE request.
 * @param {string} path — API path
 * @returns {Promise<{success, data, error}>}
 */
export function del(path) {
  return request(path, { method: 'DELETE' });
}

/**
 * API namespace — groups all request methods for named import.
 * Usage: import { api } from './api.js'; api.get('...')
 */
export const api = {
  get,
  post,
  put,
  del,
};
