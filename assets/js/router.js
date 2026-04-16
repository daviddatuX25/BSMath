/**
 * router.js — hash-based SPA router with RBAC guards
 *
 * WHY hash routing (not History API)?
 * The SPA runs on a plain Apache/PHP server with no URL-rewrite rules.
 * Hash changes never reach the server, so every refresh lands on index.html
 * regardless of the current "route". Zero server config required.
 *
 * Navigation flow on every hashchange:
 *   1. Parse current hash → path
 *   2. Look up route definition
 *   3. If route is public (login): mount login view directly into #app
 *   4. If route is protected: check isLoggedIn → check role → mount shell
 *      (once) → swap #main-content
 */

import { isLoggedIn, getUser, logout } from './auth.js';

// ── Nav definition (source of truth for RBAC sidebar) ────────────────────

/**
 * Ordered list of sidebar navigation items.
 * `roles` lists which roles can see and access this route.
 * Exported so views can reference the same list without duplicating data.
 */
export const NAV_ITEMS = [
  {
    label: 'Dashboard',
    icon:  'dashboard',
    hash:  '/dashboard',
    roles: ['admin', 'dean', 'program_head'],
  },
  {
    label: 'Programs',
    icon:  'account_tree',
    hash:  '/programs',
    roles: ['admin', 'program_head'],
  },
  {
    label: 'Announcements',
    icon:  'campaign',
    hash:  '/announcements',
    roles: ['admin', 'dean', 'program_head'],
  },
  {
    label: 'Events',
    icon:  'event',
    hash:  '/events',
    roles: ['admin', 'dean', 'program_head'],
  },
  {
    label: 'News',
    icon:  'newspaper',
    hash:  '/news',
    roles: ['admin'],
  },
  {
    label: 'Gallery',
    icon:  'gallery_thumbnail',
    hash:  '/gallery',
    roles: ['admin', 'dean', 'program_head'],
  },
  {
    label: 'Faculty',
    icon:  'school',
    hash:  '/faculty',
    roles: ['admin', 'dean', 'program_head'],
  },
  {
    label: 'Users',
    icon:  'group',
    hash:  '/users',
    roles: ['admin'],
  },
  {
    label: 'Approvals',
    icon:  'verified',
    hash:  '/approvals',
    roles: ['admin', 'dean'],
  },
  {
    label: 'Profile',
    icon:  'person',
    hash:  '/profile',
    roles: ['admin', 'dean', 'program_head'],
  },
];

// ── Route map ─────────────────────────────────────────────────────────────

/*
 * Each key is a hash path (without '#').
 * `public: true` skips auth checks.
 * `roles` lists which roles may visit this route.
 * `loader` returns an HTML string to inject into #main-content.
 *
 * Loaders return stubs now; real view modules replace them in later phases.
 */
const routes = {
  '/login': {
    public: true,
    loader: null,   // handled specially by mountLogin()
  },
  '/dashboard': {
    roles:  ['admin', 'dean', 'program_head'],
    loader: async (user) => {
      await ensureShell();
      highlightNav('/dashboard');
      const { loadDashboard } = await import('./views/dashboard.js');
      await loadDashboard(user);
    },
  },
  '/programs': {
    roles:  ['admin', 'program_head'],
    loader: async (user) => {
      await ensureShell();
      highlightNav('/programs');
      const { loadPrograms } = await import('./views/programs.js');
      await loadPrograms(user);
    },
  },
  '/announcements': {
    roles:  ['admin', 'dean', 'program_head'],
    loader: async (user) => {
      await ensureShell();
      highlightNav('/announcements');
      const { loadAnnouncements } = await import('./views/announcements.js');
      await loadAnnouncements(user);
    },
  },
  '/events': {
    roles:  ['admin', 'dean'],
    loader: async (user) => {
      await ensureShell();
      highlightNav('/events');
      const { loadEvents } = await import('./views/events.js');
      await loadEvents(user);
    },
  },
  '/news': {
    roles:  ['admin'],
    loader: async (user) => {
      await ensureShell();
      highlightNav('/news');
      const { loadNews } = await import('./views/news.js');
      await loadNews(user);
    },
  },
  '/gallery': {
    roles:  ['admin', 'dean', 'program_head'],
    loader: () => stubView('Gallery', 'gallery_thumbnail', 'Upload and organise photo galleries.'),
  },
  '/faculty': {
    roles:  ['admin', 'dean', 'program_head'],
    loader: () => stubView('Faculty', 'school', 'Manage faculty profiles and information.'),
  },
  '/users': {
    roles:  ['admin'],
    loader: () => stubView('Users', 'group', 'Manage user accounts and roles.'),
  },
  '/approvals': {
    roles:  ['admin', 'dean'],
    loader: () => stubView('Approvals', 'verified', 'Review and approve pending content.'),
  },
  '/profile': {
    roles:  ['admin', 'dean', 'program_head'],
    loader: () => stubView('Profile', 'person', 'View and edit your account profile.'),
  },
};

// ── Stub view helper ──────────────────────────────────────────────────────

/**
 * Returns a placeholder view HTML string.
 * Removed per-route as real view modules are implemented in later phases.
 *
 * @param {string} title       — page heading
 * @param {string} icon        — Material Symbol name
 * @param {string} description — helper text
 * @returns {string} HTML
 */
function stubView(title, icon, description) {
  const user = getUser();
  return `
    <div class="p-8 max-w-7xl mx-auto">
      <div class="mb-10 space-y-1">
        <span class="text-xs font-bold tracking-[0.2em] text-stone-400 uppercase">BS Mathematics Admin</span>
        <h2 class="text-5xl font-headline font-bold text-on-surface tracking-tight">${title}</h2>
        <p class="text-stone-500 text-lg font-light">${description}</p>
      </div>
      <div class="flex items-center gap-4 p-6 bg-surface-container-low rounded-xl border border-outline-variant/10">
        <div class="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
          <span class="material-symbols-outlined">${icon}</span>
        </div>
        <div>
          <p class="text-sm font-semibold text-on-surface">Logged in as <span class="text-primary">${user?.name ?? ''}</span></p>
          <p class="text-xs text-stone-500 mt-0.5">Role: ${formatRole(user?.role)}</p>
        </div>
      </div>
    </div>
  `;
}

// ── Shell state ───────────────────────────────────────────────────────────

/**
 * Set to true once views/shell.html has been injected into #app.
 * Prevents re-fetching and re-mounting the shell on every navigation.
 */
let shellMounted = false;

// ── Core navigation ───────────────────────────────────────────────────────

/**
 * Navigate to a path.  Called on init and on every hashchange event.
 * @param {string} path — e.g. '/dashboard', '/login'
 */
async function navigate(path) {
  const route = routes[path];

  // Unknown path → redirect appropriately
  if (!route) {
    redirect(isLoggedIn() ? '/dashboard' : '/login');
    return;
  }

  // ── Public routes (login page) ─────────────────────────────────────────
  if (route.public) {
    // Already logged in? Skip login, go to dashboard
    if (isLoggedIn()) {
      redirect('/dashboard');
      return;
    }
    await mountLogin();
    return;
  }

  // ── Protected routes ───────────────────────────────────────────────────

  // Must be authenticated
  if (!isLoggedIn()) {
    redirect('/login');
    return;
  }

  // Must have a permitted role for this route
  const user = getUser();
  if (route.roles && !route.roles.includes(user.role)) {
    // Silently bounce to dashboard rather than showing an error page
    redirect('/dashboard');
    return;
  }

  // Ensure the authenticated shell (topbar + sidebar) is in the DOM
  await ensureShell();

  // Swap content in #main-content
  const main = document.getElementById('main-content');
  if (!main) return;

  main.classList.add('loading');

  // Await async loaders (dashboard, programs) and sync loaders (stub views).
  // View loaders that manage their own DOM (e.g. loadDashboard, loadPrograms)
  // return undefined — only overwrite main-content when a string is returned.
  const html = await route.loader(user);
  if (html != null) main.innerHTML = html;
  main.classList.remove('loading');
  highlightNav(path);
}

// ── Shell mounting ────────────────────────────────────────────────────────

/**
 * Fetch views/shell.html and inject it into #app.
 * Runs only once per session — subsequent calls are no-ops.
 */
async function ensureShell() {
  if (shellMounted) return;

  const res  = await fetch('views/shell.html');
  const html = await res.text();
  document.getElementById('app').innerHTML = html;
  shellMounted = true;

  // Filter nav items to those the current user's role can see
  applyRbacToNav();

  // Populate user info in the sidebar footer
  populateSidebarUser();

  // Wire up the logout button
  document.getElementById('btn-logout')?.addEventListener('click', async () => {
    await logout();
    shellMounted = false;
    redirect('/login');
  });
}

/**
 * Fetch views/login.html and inject it into #app.
 * Also wires up the login form submit handler.
 */
async function mountLogin() {
  shellMounted = false; // reset so ensureShell re-mounts after next login

  const res  = await fetch('views/login.html');
  const html = await res.text();
  document.getElementById('app').innerHTML = html;

  // Wire login form
  document.getElementById('login-form')?.addEventListener('submit', handleLoginSubmit);
}

/**
 * Login form submit handler.
 * Calls auth.login(), caches the user, then navigates to dashboard.
 * @param {SubmitEvent} e
 */
async function handleLoginSubmit(e) {
  e.preventDefault();

  const email     = document.getElementById('login-email').value.trim();
  const password  = document.getElementById('login-password').value;
  const errorEl   = document.getElementById('login-error');
  const submitBtn = document.getElementById('login-submit');
  const spinner   = document.getElementById('login-spinner');

  // Loading state
  submitBtn.disabled   = true;
  spinner.style.display = 'inline';
  errorEl.textContent  = '';

  // Lazy-import to avoid circular dependency
  const { login } = await import('./auth.js');
  const { user, error } = await login(email, password);

  if (user) {
    redirect('/dashboard');
  } else {
    errorEl.textContent  = error;
    submitBtn.disabled   = false;
    spinner.style.display = 'none';
  }
}

// ── RBAC + nav helpers ────────────────────────────────────────────────────

/**
 * Hide nav links whose data-roles attribute does not include the current role.
 * The shell template uses data-roles="admin,dean,program_head" on each <a>.
 */
function applyRbacToNav() {
  const user = getUser();
  if (!user) return;

  document.querySelectorAll('[data-roles]').forEach((el) => {
    const allowed = el.dataset.roles.split(',').map((r) => r.trim());
    if (!allowed.includes(user.role)) {
      el.style.display = 'none';
    }
  });
}

/** Populate the sidebar footer with the logged-in user's name and role. */
function populateSidebarUser() {
  const user = getUser();
  if (!user) return;

  const nameEl = document.getElementById('sidebar-user-name');
  const roleEl = document.getElementById('sidebar-user-role');
  if (nameEl) nameEl.textContent = user.name;
  if (roleEl) roleEl.textContent = formatRole(user.role);
}

/** Toggle .nav-item--active / .nav-item--inactive on sidebar links. */
function highlightNav(path) {
  document.querySelectorAll('.nav-item').forEach((el) => {
    const active = el.getAttribute('href') === `#${path}`;
    el.classList.toggle('nav-item--active',   active);
    el.classList.toggle('nav-item--inactive', !active);
  });
}

/** Map role keys to human-readable labels. */
function formatRole(role) {
  return (
    { admin: 'Administrator', dean: 'Dean / Principal', program_head: 'Program Head' }[role]
    ?? role
  );
}

// ── Routing utilities ─────────────────────────────────────────────────────

/** Parse window.location.hash into a plain path string. */
function currentPath() {
  const hash = window.location.hash.slice(1); // remove '#'
  return hash || '/dashboard';
}

/**
 * Push a new hash, triggering the hashchange listener.
 * Use this instead of setting window.location.hash directly so call sites
 * don't need to remember to prepend '#'.
 * @param {string} path — e.g. '/dashboard'
 */
export function redirect(path) {
  window.location.hash = `#${path}`;
}

// ── Public API ────────────────────────────────────────────────────────────

/**
 * Start the router.
 * Call this once from app.js after auth state has been restored.
 */
export function init() {
  window.addEventListener('hashchange', () => navigate(currentPath()));
  navigate(currentPath()); // handle the URL already in the address bar
}
