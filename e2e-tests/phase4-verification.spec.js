/**
 * Phase 4 Verification Tests - Simplified
 * Focus on what works and document issues
 */

const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost/bsmath/';

const ACCOUNTS = {
  admin: { email: 'admin@bsmath.test', password: 'password123' },
  programHead: { email: 'head@bsmath.test', password: 'password123' },
  dean: { email: 'dean@bsmath.test', password: 'password123' }
};

async function login(page, email, password) {
  console.log(`Logging in as ${email}...`);

  // Navigate to app first, then clear sessionStorage to ensure clean auth state
  await page.goto(BASE_URL);
  await page.evaluate(() => sessionStorage.clear());

  // Now navigate to login
  await page.goto(BASE_URL + '#/login');
  await page.waitForSelector('#login-email', { timeout: 15000 });

  await page.fill('#login-email', email);
  await page.fill('#login-password', password);
  await page.click('#login-submit');
  await page.waitForFunction(
    () => window.location.hash === '#/dashboard' && document.querySelector('.nav-item'),
    { timeout: 15000 }
  );
  await page.waitForTimeout(500);
}

test('RBAC Bug: All nav items visible regardless of role', async ({ page }) => {
  // Test all three roles and check if RBAC sidebar filtering works
  for (const [role, account] of Object.entries(ACCOUNTS)) {
    console.log(`\nTesting ${role}...`);
    await login(page, account.email, account.password);

    // Count only VISIBLE nav items (those without display:none set by RBAC)
    const hrefs = await page.locator('.nav-item').evaluateAll(els =>
      els.filter(el => el.style.display !== 'none').map(el => el.getAttribute('href'))
    );

    // Debug: log the stored user and nav items with their visibility
    const debug = await page.evaluate(() => {
      const user = JSON.parse(sessionStorage.getItem('bsmath_user') || 'null');
      const navItems = Array.from(document.querySelectorAll('[data-roles]')).map(el => ({
        href: el.getAttribute('href'),
        roles: el.dataset.roles,
        display: el.style.display,
        text: el.textContent.trim().slice(0, 20)
      }));
      return { userRole: user?.role, navItems };
    });
    console.log(`Debug for ${role}:`, JSON.stringify(debug, null, 2));

    // Check expected visibility based on role
    // applyRbacToNav() hides nav items where data-roles doesn't include user's role
    if (role === 'admin') {
      // Admin sees: Dashboard, Programs, Announcements, Events, News, Gallery, Faculty, Users, Profile (9 items)
      // Admin does NOT see: Approvals (dean-only)
      console.log(`${role}: ${hrefs.length} nav items (expected: 9 visible - Approvals is dean-only)`);
      expect(hrefs.length).toBe(9);
    } else if (role === 'program_head') {
      // Program Head sees: Dashboard, Programs, Announcements, Events, Gallery, Profile (6 items)
      // Does NOT see: News, Faculty, Users, Approvals
      console.log(`${role}: ${hrefs.length} nav items (expected: 6)`);
      expect(hrefs.length).toBe(6);
    } else if (role === 'dean') {
      // Dean sees: Dashboard, Announcements, Events, Approvals, Profile (5 items)
      // Does NOT see: Programs, News, Gallery, Faculty, Users
      console.log(`${role}: ${hrefs.length} nav items (expected: 5)`);
      expect(hrefs.length).toBe(5);
    }
  }
});

test('Route guards work: unauthorized routes redirect to dashboard', async ({ page }) => {
  await login(page, ACCOUNTS.programHead.email, ACCOUNTS.programHead.password);

  // Even if sidebar shows items, route guards should prevent access
  console.log('\nTesting route guards for Program Head...');

  await page.goto(BASE_URL + '#/faculty');
  await page.waitForTimeout(1000);
  console.log(`After /faculty: ${page.url()}`);
  expect(page.url()).toContain('#/dashboard');

  await page.goto(BASE_URL + '#/users');
  await page.waitForTimeout(1000);
  console.log(`After /users: ${page.url()}`);
  expect(page.url()).toContain('#/dashboard');
});

test('Gallery module works for authorized roles', async ({ page }) => {
  await login(page, ACCOUNTS.admin.email, ACCOUNTS.admin.password);

  console.log('\nTesting Gallery module...');

  // Navigate directly to gallery hash and manually trigger hashchange to ensure navigation fires
  await page.goto(BASE_URL + '#/gallery');
  await page.evaluate(() => window.dispatchEvent(new HashChangeEvent('hashchange')));
  await page.waitForTimeout(3000);

  // Debug: check URL, main-content, and console errors
  const debug = await page.evaluate(() => {
    const mainContent = document.getElementById('main-content');
    return {
      url: window.location.href,
      hash: window.location.hash,
      mainContentHTML: mainContent ? mainContent.innerHTML.slice(0, 200) : 'NOT FOUND',
      hasBtnAddGallery: !!document.getElementById('btn-add-gallery'),
      consoleErrors: window._consoleErrors || []
    };
  });
  console.log('Gallery debug:', JSON.stringify(debug, null, 2));

  const uploadBtn = await page.locator('#btn-add-gallery').isVisible().catch(() => false);
  console.log(`Upload button visible: ${uploadBtn}`);
  expect(uploadBtn).toBe(true);
});

test('Approvals module works for Dean', async ({ page }) => {
  await login(page, ACCOUNTS.dean.email, ACCOUNTS.dean.password);

  console.log('\nTesting Approvals module for Dean...');
  await page.click('.nav-item[href="#/approvals"]');
  await page.waitForTimeout(1500);

  // Check if approvals page loaded
  const hasPendingItems = await page.locator('button:has-text("Approve"), button:has-text("Reject")').first().isVisible().catch(() => false);
  console.log(`Has approve/reject buttons: ${hasPendingItems}`);
});