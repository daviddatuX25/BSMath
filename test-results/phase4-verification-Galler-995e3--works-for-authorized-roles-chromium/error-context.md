# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: phase4-verification.spec.js >> Gallery module works for authorized roles
- Location: e2e-tests\phase4-verification.spec.js:99:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - navigation "Main navigation" [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e7]: Σ
      - generic [ref=e8]:
        - heading "BS Mathematics" [level=1] [ref=e9]
        - paragraph [ref=e10]: Admin Portal
    - list [ref=e11]:
      - listitem [ref=e12] [cursor=pointer]:
        - generic [ref=e13]: dashboard
        - generic [ref=e14]: Dashboard
      - listitem [ref=e15] [cursor=pointer]:
        - generic [ref=e16]: account_tree
        - generic [ref=e17]: Programs
      - listitem [ref=e18] [cursor=pointer]:
        - generic [ref=e19]: campaign
        - generic [ref=e20]: Announcements
      - listitem [ref=e21] [cursor=pointer]:
        - generic [ref=e22]: event
        - generic [ref=e23]: Events
      - listitem [ref=e24] [cursor=pointer]:
        - generic [ref=e25]: newspaper
        - generic [ref=e26]: News
      - listitem [ref=e27] [cursor=pointer]:
        - generic [ref=e28]: gallery_thumbnail
        - generic [ref=e29]: Gallery
      - listitem [ref=e30] [cursor=pointer]:
        - generic [ref=e31]: school
        - generic [ref=e32]: Faculty
      - listitem [ref=e33] [cursor=pointer]:
        - generic [ref=e34]: group
        - generic [ref=e35]: Users
      - listitem [ref=e36] [cursor=pointer]:
        - generic [ref=e37]: person
        - generic [ref=e38]: Profile
    - generic [ref=e40]:
      - generic [ref=e42]: person
      - generic [ref=e43]:
        - paragraph [ref=e44]: Admin User
        - paragraph [ref=e45]: Administrator
      - button "Sign out" [ref=e46] [cursor=pointer]:
        - generic [ref=e47]: logout
  - generic [ref=e48]:
    - banner [ref=e49]:
      - generic [ref=e51]:
        - generic [ref=e52]: search
        - searchbox "Global search" [ref=e53]
      - generic [ref=e54]:
        - button "Notifications" [ref=e55] [cursor=pointer]:
          - generic [ref=e56]: notifications
        - button "My profile" [ref=e57] [cursor=pointer]:
          - generic [ref=e58]: account_circle
    - main "Page content" [ref=e59]:
      - generic [ref=e60]:
        - generic [ref=e61]:
          - heading "Welcome, Admin User" [level=2] [ref=e62]
          - paragraph [ref=e63]: admin
        - generic [ref=e64]:
          - link "school 4 Total Programs" [ref=e65] [cursor=pointer]:
            - /url: "#/programs"
            - generic [ref=e67]: school
            - generic [ref=e68]:
              - paragraph [ref=e69]: "4"
              - paragraph [ref=e70]: Total Programs
          - link "campaign 3 Total Announcements" [ref=e71] [cursor=pointer]:
            - /url: "#/announcements"
            - generic [ref=e73]: campaign
            - generic [ref=e74]:
              - paragraph [ref=e75]: "3"
              - paragraph [ref=e76]: Total Announcements
          - link "event 3 Total Events" [ref=e77] [cursor=pointer]:
            - /url: "#/events"
            - generic [ref=e79]: event
            - generic [ref=e80]:
              - paragraph [ref=e81]: "3"
              - paragraph [ref=e82]: Total Events
          - link "manage_accounts 3 Total Users" [ref=e83] [cursor=pointer]:
            - /url: "#/users"
            - generic [ref=e85]: manage_accounts
            - generic [ref=e86]:
              - paragraph [ref=e87]: "3"
              - paragraph [ref=e88]: Total Users
        - generic [ref=e89]:
          - heading "Quick Actions" [level=3] [ref=e90]
          - generic [ref=e91]:
            - link "school Add Program" [ref=e92] [cursor=pointer]:
              - /url: "#/programs"
              - generic [ref=e93]: school
              - text: Add Program
            - link "campaign Create Announcement" [ref=e94] [cursor=pointer]:
              - /url: "#/announcements"
              - generic [ref=e95]: campaign
              - text: Create Announcement
            - link "photo_library Upload Gallery" [ref=e96] [cursor=pointer]:
              - /url: "#/gallery"
              - generic [ref=e97]: photo_library
              - text: Upload Gallery
        - generic [ref=e98]:
          - heading "Recent Activities" [level=3] [ref=e99]
          - list [ref=e100]:
            - listitem [ref=e101]:
              - generic [ref=e102]: history
              - generic [ref=e103]:
                - paragraph [ref=e104]: "Updated event: Mathematics Workshop"
                - paragraph [ref=e105]: Admin User · Apr 17, 12:57 AM
            - listitem [ref=e106]:
              - generic [ref=e107]: history
              - generic [ref=e108]:
                - paragraph [ref=e109]: "Updated event: Mathematics Workshop"
                - paragraph [ref=e110]: Admin User · Apr 17, 12:57 AM
            - listitem [ref=e111]:
              - generic [ref=e112]: history
              - generic [ref=e113]:
                - paragraph [ref=e114]: "Updated announcement: Enrollment for AY 2026-2027 Now Open"
                - paragraph [ref=e115]: Admin User · Apr 17, 12:57 AM
            - listitem [ref=e116]:
              - generic [ref=e117]: history
              - generic [ref=e118]:
                - paragraph [ref=e119]: "Updated announcement: Enrollment for AY 2026-2027 Now Opens"
                - paragraph [ref=e120]: Admin User · Apr 17, 12:57 AM
            - listitem [ref=e121]:
              - generic [ref=e122]: history
              - generic [ref=e123]:
                - paragraph [ref=e124]: "Updated program: Bachelor of Science in Mathematics"
                - paragraph [ref=e125]: Admin User · Apr 15, 07:23 PM
            - listitem [ref=e126]:
              - generic [ref=e127]: history
              - generic [ref=e128]:
                - paragraph [ref=e129]: "Updated program: Bachelor of Science in Mathematic"
                - paragraph [ref=e130]: Admin User · Apr 15, 07:23 PM
            - listitem [ref=e131]:
              - generic [ref=e132]: history
              - generic [ref=e133]:
                - paragraph [ref=e134]: "Gallery image uploaded: Department Team Photo 2026"
                - paragraph [ref=e135]: Admin User · Apr 15, 04:49 PM
            - listitem [ref=e136]:
              - generic [ref=e137]: history
              - generic [ref=e138]:
                - paragraph [ref=e139]: "New faculty added: Dr. Pedro Reyes"
                - paragraph [ref=e140]: Admin User · Apr 15, 04:49 PM
            - listitem [ref=e141]:
              - generic [ref=e142]: history
              - generic [ref=e143]:
                - paragraph [ref=e144]: "New announcement posted: Enrollment for AY 2026-2027 Now Open"
                - paragraph [ref=e145]: Admin User · Apr 15, 04:49 PM
            - listitem [ref=e146]:
              - generic [ref=e147]: history
              - generic [ref=e148]:
                - paragraph [ref=e149]: "Created program: Pure Mathematics Track"
                - paragraph [ref=e150]: Admin User · Apr 15, 04:49 PM
```

# Test source

```ts
  24  |   await page.goto(BASE_URL + '#/login');
  25  |   await page.waitForSelector('#login-email', { timeout: 15000 });
  26  | 
  27  |   await page.fill('#login-email', email);
  28  |   await page.fill('#login-password', password);
  29  |   await page.click('#login-submit');
  30  |   await page.waitForFunction(
  31  |     () => window.location.hash === '#/dashboard' && document.querySelector('.nav-item'),
  32  |     { timeout: 15000 }
  33  |   );
  34  |   await page.waitForTimeout(500);
  35  | }
  36  | 
  37  | test('RBAC Bug: All nav items visible regardless of role', async ({ page }) => {
  38  |   // Test all three roles and check if RBAC sidebar filtering works
  39  |   for (const [role, account] of Object.entries(ACCOUNTS)) {
  40  |     console.log(`\nTesting ${role}...`);
  41  |     await login(page, account.email, account.password);
  42  | 
  43  |     // Count only VISIBLE nav items (those without display:none set by RBAC)
  44  |     const hrefs = await page.locator('.nav-item').evaluateAll(els =>
  45  |       els.filter(el => el.style.display !== 'none').map(el => el.getAttribute('href'))
  46  |     );
  47  | 
  48  |     // Debug: log the stored user and nav items with their visibility
  49  |     const debug = await page.evaluate(() => {
  50  |       const user = JSON.parse(sessionStorage.getItem('bsmath_user') || 'null');
  51  |       const navItems = Array.from(document.querySelectorAll('[data-roles]')).map(el => ({
  52  |         href: el.getAttribute('href'),
  53  |         roles: el.dataset.roles,
  54  |         display: el.style.display,
  55  |         text: el.textContent.trim().slice(0, 20)
  56  |       }));
  57  |       return { userRole: user?.role, navItems };
  58  |     });
  59  |     console.log(`Debug for ${role}:`, JSON.stringify(debug, null, 2));
  60  | 
  61  |     // Check expected visibility based on role
  62  |     // applyRbacToNav() hides nav items where data-roles doesn't include user's role
  63  |     if (role === 'admin') {
  64  |       // Admin sees: Dashboard, Programs, Announcements, Events, News, Gallery, Faculty, Users, Profile (9 items)
  65  |       // Admin does NOT see: Approvals (dean-only)
  66  |       console.log(`${role}: ${hrefs.length} nav items (expected: 9 visible - Approvals is dean-only)`);
  67  |       expect(hrefs.length).toBe(9);
  68  |     } else if (role === 'program_head') {
  69  |       // Program Head sees: Dashboard, Programs, Announcements, Events, Gallery, Profile (6 items)
  70  |       // Does NOT see: News, Faculty, Users, Approvals
  71  |       console.log(`${role}: ${hrefs.length} nav items (expected: 6)`);
  72  |       expect(hrefs.length).toBe(6);
  73  |     } else if (role === 'dean') {
  74  |       // Dean sees: Dashboard, Announcements, Events, Approvals, Profile (5 items)
  75  |       // Does NOT see: Programs, News, Gallery, Faculty, Users
  76  |       console.log(`${role}: ${hrefs.length} nav items (expected: 5)`);
  77  |       expect(hrefs.length).toBe(5);
  78  |     }
  79  |   }
  80  | });
  81  | 
  82  | test('Route guards work: unauthorized routes redirect to dashboard', async ({ page }) => {
  83  |   await login(page, ACCOUNTS.programHead.email, ACCOUNTS.programHead.password);
  84  | 
  85  |   // Even if sidebar shows items, route guards should prevent access
  86  |   console.log('\nTesting route guards for Program Head...');
  87  | 
  88  |   await page.goto(BASE_URL + '#/faculty');
  89  |   await page.waitForTimeout(1000);
  90  |   console.log(`After /faculty: ${page.url()}`);
  91  |   expect(page.url()).toContain('#/dashboard');
  92  | 
  93  |   await page.goto(BASE_URL + '#/users');
  94  |   await page.waitForTimeout(1000);
  95  |   console.log(`After /users: ${page.url()}`);
  96  |   expect(page.url()).toContain('#/dashboard');
  97  | });
  98  | 
  99  | test('Gallery module works for authorized roles', async ({ page }) => {
  100 |   await login(page, ACCOUNTS.admin.email, ACCOUNTS.admin.password);
  101 | 
  102 |   console.log('\nTesting Gallery module...');
  103 | 
  104 |   // Navigate directly to gallery hash and manually trigger hashchange to ensure navigation fires
  105 |   await page.goto(BASE_URL + '#/gallery');
  106 |   await page.evaluate(() => window.dispatchEvent(new HashChangeEvent('hashchange')));
  107 |   await page.waitForTimeout(3000);
  108 | 
  109 |   // Debug: check URL, main-content, and console errors
  110 |   const debug = await page.evaluate(() => {
  111 |     const mainContent = document.getElementById('main-content');
  112 |     return {
  113 |       url: window.location.href,
  114 |       hash: window.location.hash,
  115 |       mainContentHTML: mainContent ? mainContent.innerHTML.slice(0, 200) : 'NOT FOUND',
  116 |       hasBtnAddGallery: !!document.getElementById('btn-add-gallery'),
  117 |       consoleErrors: window._consoleErrors || []
  118 |     };
  119 |   });
  120 |   console.log('Gallery debug:', JSON.stringify(debug, null, 2));
  121 | 
  122 |   const uploadBtn = await page.locator('#btn-add-gallery').isVisible().catch(() => false);
  123 |   console.log(`Upload button visible: ${uploadBtn}`);
> 124 |   expect(uploadBtn).toBe(true);
      |                     ^ Error: expect(received).toBe(expected) // Object.is equality
  125 | });
  126 | 
  127 | test('Approvals module works for Dean', async ({ page }) => {
  128 |   await login(page, ACCOUNTS.dean.email, ACCOUNTS.dean.password);
  129 | 
  130 |   console.log('\nTesting Approvals module for Dean...');
  131 |   await page.click('.nav-item[href="#/approvals"]');
  132 |   await page.waitForTimeout(1500);
  133 | 
  134 |   // Check if approvals page loaded
  135 |   const hasPendingItems = await page.locator('button:has-text("Approve"), button:has-text("Reject")').first().isVisible().catch(() => false);
  136 |   console.log(`Has approve/reject buttons: ${hasPendingItems}`);
  137 | });
```