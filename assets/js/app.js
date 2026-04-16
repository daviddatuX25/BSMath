// assets/js/app.js — application bootstrap
// Catch all errors at top level so one crash doesn't kill the whole app.
window.addEventListener('error', (e) => {
  console.error('[app] Uncaught error:', e.message, 'at', e.filename, 'line', e.lineno, 'col', e.colno);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('[app] Unhandled promise rejection:', e.reason);
});

/**
 * app.js — application bootstrap
 *
 * Entry point loaded by index.html via <script type="module">.
 * Responsibilities:
 *   1. Restore auth state from the server (me() call)
 *   2. Start the router (which handles the initial URL)
 *   3. Expose global utilities (showToast) on window for views to use
 *
 * WHY call me() before router.init()?
 * The router makes immediate role-guard decisions on startup. If we let the
 * router run first, it would find an empty sessionStorage and redirect every
 * returning user to #/login — even if their PHP session is still valid.
 * Restoring auth state first means the first navigation is always correct.
 */

import { me }      from './auth.js';
import { init }    from './router.js';
import { initSearch } from './ui/search.js';

// ── Bootstrap ─────────────────────────────────────────────────────────────

(async function bootstrap() {
  // Restore auth state from the server before the router makes any decisions
  await me();

  // Hand off to the router — it reads the current hash and renders the view
  init();

  // Wire up the #topbar-search debounced global search
  initSearch();
})();

// ── Global toast utility ──────────────────────────────────────────────────

/**
 * Display a toast notification.
 * Called from view modules after CRUD actions.
 *
 * @param {string} message  — text to display
 * @param {'success'|'error'|'info'} type — controls colour
 * @param {number} [duration=3500] — ms before auto-dismiss
 */
export function showToast(message, type = 'success', duration = 3500) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  // Colour map — success=green, error=red, info=neutral
  const colours = {
    success: 'bg-emerald-800 text-white',
    error:   'bg-secondary   text-white',
    info:    'bg-stone-700   text-white',
  };

  const toast = document.createElement('div');
  toast.className = [
    'flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg',
    'text-sm font-medium pointer-events-auto min-w-[240px] max-w-sm',
    'toast-enter',
    colours[type] ?? colours.info,
  ].join(' ');

  // Icon per type
  const icons = { success: 'check_circle', error: 'error', info: 'info' };
  toast.innerHTML = `
    <span class="material-symbols-outlined text-[20px] shrink-0">${icons[type] ?? 'info'}</span>
    <span class="flex-1">${message}</span>
    <button class="material-symbols-outlined text-[20px] opacity-70 hover:opacity-100 shrink-0" aria-label="Dismiss">close</button>
  `;

  // Dismiss on close button click
  toast.querySelector('button').addEventListener('click', () => dismiss(toast));

  container.appendChild(toast);

  // Auto-dismiss after `duration` ms
  const timer = setTimeout(() => dismiss(toast), duration);

  // Cancel auto-dismiss if user clicks close manually
  toast.querySelector('button').addEventListener('click', () => clearTimeout(timer), { once: true });
}

/** Animate out and remove a toast element. */
function dismiss(toast) {
  toast.classList.remove('toast-enter');
  toast.classList.add('toast-exit');
  toast.addEventListener('animationend', () => toast.remove(), { once: true });
}

// Expose on window so view modules can call showToast without importing app.js
// (views are injected as raw HTML strings and run in the module's scope)
window.showToast = showToast;

// ── Mobile sidebar drawer ───────────────────────────────────────────────

/** Toggle the mobile sidebar drawer. */
function setupMobileMenu() {
  const btn     = document.getElementById('hamburger-btn');
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');

  if (!btn || !sidebar || !backdrop) return;

  const open = () => {
    sidebar.classList.add('sidebar-open');
    backdrop.classList.add('sidebar-open');
    btn.setAttribute('aria-expanded', 'true');
  };
  const close = () => {
    sidebar.classList.remove('sidebar-open');
    backdrop.classList.remove('sidebar-open');
    btn.setAttribute('aria-expanded', 'false');
  };

  btn.addEventListener('click', () => {
    const isOpen = sidebar.classList.contains('sidebar-open');
    isOpen ? close() : open();
  });

  backdrop.addEventListener('click', close);

  sidebar.querySelectorAll('.nav-item').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 768) close();
    });
  });
}

// Listen for shell-ready (dispatched by router after shell is mounted)
window.addEventListener('shell-ready', setupMobileMenu);
