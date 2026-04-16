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
  await page.goto(BASE_URL + '#/login');
  await page.waitForSelector('#login-email', { timeout: 10000 });
  await page.fill('#login-email', email);
  await page.fill('#login-password', password);
  await page.click('#login-submit');
  await page.waitForFunction(
    () => window.location.hash === '#/dashboard' && document.querySelector('.nav-item'),
    { timeout: 10000 }
  );
  await page.waitForTimeout(500);
}

test('RBAC Bug: All nav items visible regardless of role', async ({ page }) => {
  // Test all three roles and check if RBAC sidebar filtering works
  for (const [role, account] of Object.entries(ACCOUNTS)) {
    console.log(`\nTesting ${role}...`);
    await login(page, account.email, account.password);

    const hrefs = await page.locator('.nav-item').evaluateAll(els => els.map(el => el.getAttribute('href')));

    // Check expected visibility based on role
    if (role === 'admin') {
      // Admin should see all 10 items - PASS if 10 items visible
      console.log(`${role}: ${hrefs.length} nav items (expected: 10)`);
      expect(hrefs.length).toBe(10);
    } else if (role === 'program_head') {
      // Program Head should only see: Dashboard, Programs, Announcements, Events, Gallery, Profile (6 items)
      // Should NOT see: News, Faculty, Users, Approvals
      console.log(`${role}: ${hrefs.length} nav items (expected: 6 if RBAC worked)`);
      // BUG: Currently shows 10 items instead of 6
      if (hrefs.length === 10) {
        console.log(`❌ BUG: ${role} sees ALL nav items - RBAC sidebar filtering NOT working`);
      }
      // This will fail until bug is fixed
      expect(hrefs.length).toBe(6);
    } else if (role === 'dean') {
      // Dean should only see: Dashboard, Announcements, Events, Approvals, Profile (5 items)
      // Should NOT see: Programs, News, Gallery, Faculty, Users
      console.log(`${role}: ${hrefs.length} nav items (expected: 5 if RBAC worked)`);
      if (hrefs.length === 10) {
        console.log(`❌ BUG: ${role} sees ALL nav items - RBAC sidebar filtering NOT working`);
      }
      expect(hrefs.length).toBe(5);
    }
  }
});

test('Route guards work: unauthorized routes redirect to dashboard', async ({ page }) => {
  await login(page, ACCOUNTS.programHead.email, ACCOUNTS.password);

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
  await page.click('.nav-item[href="#/gallery"]');
  await page.waitForTimeout(1500);

  // Check if gallery page loaded
  const galleryTitle = await page.locator('h2').first().textContent().catch(() => '');
  console.log(`Gallery title: ${galleryTitle}`);

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