# BSMath Public Client Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a public client-side website with 6 PHP/JSON API endpoints that display Programs, Announcements, Events, News, Gallery, and Faculty from the existing `bsmath` database — aligned with Worksheet 4.2 grading rubric.

**Architecture:** New `public_api/` directory with one PHP file per section (no auth, guide-pattern). New `client/` directory with 7 HTML pages (home + 6 sections), shared CSS and JS, using fetch() to pull data. Zero changes to existing admin SPA.

**Tech Stack:** PHP 7+ (MySQLi), HTML5, JavaScript (fetch API), Tailwind CSS (CDN), Google Fonts (Newsreader + Work Sans)

---

## File Structure

| Action | Path | Purpose |
|--------|------|---------|
| Create | `public_api/programs_api.php` | Public JSON endpoint — active programs |
| Create | `public_api/announcements_api.php` | Public JSON endpoint — approved announcements |
| Create | `public_api/events_api.php` | Public JSON endpoint — approved events |
| Create | `public_api/news_api.php` | Public JSON endpoint — published news |
| Create | `public_api/gallery_api.php` | Public JSON endpoint — all gallery items |
| Create | `public_api/faculty_api.php` | Public JSON endpoint — active faculty |
| Create | `client/css/client.css` | Shared styles with admin color tokens |
| Create | `client/js/fetch-section.js` | Shared fetch helper |
| Create | `client/index.html` | Landing page with hero + section cards |
| Create | `client/programs.html` | Programs card grid |
| Create | `client/announcements.html` | Announcements chronological list |
| Create | `client/events.html` | Events card list |
| Create | `client/news.html` | News article cards |
| Create | `client/gallery.html` | Image grid |
| Create | `client/faculty.html` | Faculty cards |

---

### Task 1: Create public_api/programs_api.php

**Files:**
- Create: `public_api/programs_api.php`

- [ ] **Step 1: Create the file**

```php
<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

$conn = new mysqli("localhost", "root", "", "bsmath");

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed"]);
    exit;
}

$conn->set_charset("utf8");

$result = $conn->query("SELECT id, name, description FROM programs WHERE status = 'active' ORDER BY name");

$data = array();
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode($data);
?>
```

- [ ] **Step 2: Verify in browser**

Open `http://localhost/BSMath/public_api/programs_api.php` — should return JSON array of active programs.

- [ ] **Step 3: Commit**

```bash
git add public_api/programs_api.php
git commit -m "feat(public_api): add programs_api.php — public JSON endpoint for active programs"
```

---

### Task 2: Create public_api/announcements_api.php

**Files:**
- Create: `public_api/announcements_api.php`

- [ ] **Step 1: Create the file**

```php
<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

$conn = new mysqli("localhost", "root", "", "bsmath");

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed"]);
    exit;
}

$conn->set_charset("utf8");

$result = $conn->query("SELECT id, title, content, created_at FROM announcements WHERE status = 'approved' ORDER BY created_at DESC");

$data = array();
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode($data);
?>
```

- [ ] **Step 2: Verify in browser**

Open `http://localhost/BSMath/public_api/announcements_api.php` — should return JSON array of approved announcements.

- [ ] **Step 3: Commit**

```bash
git add public_api/announcements_api.php
git commit -m "feat(public_api): add announcements_api.php — public JSON endpoint for approved announcements"
```

---

### Task 3: Create public_api/events_api.php

**Files:**
- Create: `public_api/events_api.php`

- [ ] **Step 1: Create the file**

```php
<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

$conn = new mysqli("localhost", "root", "", "bsmath");

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed"]);
    exit;
}

$conn->set_charset("utf8");

$result = $conn->query("SELECT id, title, description, event_date, event_time, location FROM events WHERE status = 'approved' ORDER BY event_date ASC");

$data = array();
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode($data);
?>
```

- [ ] **Step 2: Verify in browser**

Open `http://localhost/BSMath/public_api/events_api.php` — should return JSON array of approved events.

- [ ] **Step 3: Commit**

```bash
git add public_api/events_api.php
git commit -m "feat(public_api): add events_api.php — public JSON endpoint for approved events"
```

---

### Task 4: Create public_api/news_api.php

**Files:**
- Create: `public_api/news_api.php`

- [ ] **Step 1: Create the file**

```php
<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

$conn = new mysqli("localhost", "root", "", "bsmath");

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed"]);
    exit;
}

$conn->set_charset("utf8");

$result = $conn->query("SELECT id, title, content, image_url FROM news WHERE status = 'published' ORDER BY created_at DESC");

$data = array();
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode($data);
?>
```

- [ ] **Step 2: Verify in browser**

Open `http://localhost/BSMath/public_api/news_api.php` — should return JSON array of published news.

- [ ] **Step 3: Commit**

```bash
git add public_api/news_api.php
git commit -m "feat(public_api): add news_api.php — public JSON endpoint for published news"
```

---

### Task 5: Create public_api/gallery_api.php

**Files:**
- Create: `public_api/gallery_api.php`

- [ ] **Step 1: Create the file**

```php
<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

$conn = new mysqli("localhost", "root", "", "bsmath");

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed"]);
    exit;
}

$conn->set_charset("utf8");

$result = $conn->query("SELECT id, title, image_url, description FROM gallery ORDER BY created_at DESC");

$data = array();
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode($data);
?>
```

- [ ] **Step 2: Verify in browser**

Open `http://localhost/BSMath/public_api/gallery_api.php` — should return JSON array of gallery items.

- [ ] **Step 3: Commit**

```bash
git add public_api/gallery_api.php
git commit -m "feat(public_api): add gallery_api.php — public JSON endpoint for gallery images"
```

---

### Task 6: Create public_api/faculty_api.php

**Files:**
- Create: `public_api/faculty_api.php`

- [ ] **Step 1: Create the file**

```php
<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

$conn = new mysqli("localhost", "root", "", "bsmath");

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed"]);
    exit;
}

$conn->set_charset("utf8");

$result = $conn->query("SELECT id, name, position, specialization, image_url FROM faculty WHERE status = 'active' ORDER BY name");

$data = array();
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode($data);
?>
```

- [ ] **Step 2: Verify in browser**

Open `http://localhost/BSMath/public_api/faculty_api.php` — should return JSON array of active faculty.

- [ ] **Step 3: Commit**

```bash
git add public_api/faculty_api.php
git commit -m "feat(public_api): add faculty_api.php — public JSON endpoint for active faculty"
```

---

### Task 7: Create shared client CSS and JS

**Files:**
- Create: `client/css/client.css`
- Create: `client/js/fetch-section.js`

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p client/css client/js
```

- [ ] **Step 2: Create client/css/client.css**

```css
/* BSMath Client Website — Shared Styles */
/* Reuses admin SPA color tokens for visual consistency */

:root {
  --primary: #006d36;
  --primary-light: #50c878;
  --on-primary: #ffffff;
  --secondary: #b7131a;
  --background: #f9f9f8;
  --surface: #ffffff;
  --on-surface: #1a1c1b;
  --on-surface-muted: #6e7a6e;
  --outline: #bdcabc;
  --radius: 0.5rem;
}

body {
  font-family: 'Work Sans', sans-serif;
  background-color: var(--background);
  color: var(--on-surface);
  margin: 0;
}

h1, h2, h3 {
  font-family: 'Newsreader', serif;
}

/* Navigation bar */
.client-nav {
  background: var(--primary);
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.client-nav a {
  color: var(--on-primary);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  opacity: 0.85;
  transition: opacity 0.15s;
}

.client-nav a:hover,
.client-nav a.active {
  opacity: 1;
}

.client-nav .brand {
  font-family: 'Newsreader', serif;
  font-weight: 700;
  font-size: 1.125rem;
  opacity: 1;
  margin-right: auto;
}

/* Hero section (index page) */
.hero {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
  color: var(--on-primary);
  padding: 3rem 1.5rem;
  text-align: center;
}

.hero h1 {
  font-size: 2.25rem;
  margin: 0 0 0.5rem;
}

.hero p {
  font-size: 1.125rem;
  opacity: 0.9;
  margin: 0;
}

/* Section cards (index page) */
.section-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
  padding: 2rem 1.5rem;
  max-width: 72rem;
  margin: 0 auto;
}

.section-card {
  background: var(--surface);
  border: 1px solid var(--outline);
  border-radius: var(--radius);
  padding: 1.5rem;
  transition: box-shadow 0.15s;
}

.section-card:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.section-card h3 {
  margin: 0 0 0.5rem;
  color: var(--primary);
}

.section-card p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--on-surface-muted);
}

.section-card a {
  display: inline-block;
  margin-top: 0.75rem;
  color: var(--primary);
  font-weight: 600;
  font-size: 0.875rem;
  text-decoration: none;
}

.section-card a:hover {
  text-decoration: underline;
}

/* Content section page layout */
.section-page {
  max-width: 72rem;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.section-page h2 {
  font-size: 1.75rem;
  margin: 0 0 1.5rem;
  color: var(--primary);
}

/* Content cards grid */
.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.25rem;
}

.content-card {
  background: var(--surface);
  border: 1px solid var(--outline);
  border-radius: var(--radius);
  padding: 1.25rem;
}

.content-card h3 {
  margin: 0 0 0.5rem;
  color: var(--on-surface);
}

.content-card p {
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
  color: var(--on-surface-muted);
  line-height: 1.5;
}

.content-card .meta {
  font-size: 0.75rem;
  color: var(--on-surface-muted);
  margin: 0.5rem 0 0;
}

/* Gallery grid */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.gallery-item {
  background: var(--surface);
  border: 1px solid var(--outline);
  border-radius: var(--radius);
  overflow: hidden;
}

.gallery-item img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}

.gallery-item .caption {
  padding: 0.75rem;
}

.gallery-item .caption h3 {
  margin: 0 0 0.25rem;
  font-size: 0.9375rem;
}

.gallery-item .caption p {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--on-surface-muted);
}

/* Faculty cards */
.faculty-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.25rem;
}

.faculty-card {
  background: var(--surface);
  border: 1px solid var(--outline);
  border-radius: var(--radius);
  padding: 1.25rem;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.faculty-card img {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.faculty-card .info h3 {
  margin: 0 0 0.25rem;
  font-size: 1rem;
}

.faculty-card .info p {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--on-surface-muted);
}

/* Loading / empty / error states */
.loading {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--on-surface-muted);
  font-size: 0.875rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--on-surface-muted);
}

.error-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--secondary);
}

/* Footer */
.client-footer {
  text-align: center;
  padding: 2rem 1.5rem;
  margin-top: 3rem;
  border-top: 1px solid var(--outline);
  font-size: 0.8125rem;
  color: var(--on-surface-muted);
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .hero h1 { font-size: 1.5rem; }
  .section-page h2 { font-size: 1.375rem; }
  .client-nav { gap: 0.75rem; }
  .client-nav a { font-size: 0.8125rem; }
}
```

- [ ] **Step 3: Create client/js/fetch-section.js**

```js
/**
 * fetch-section.js — shared helper for client pages
 * Fetches JSON from a public API endpoint and renders it.
 */

function fetchSection(apiUrl, renderFn) {
  const container = document.getElementById('content');
  container.innerHTML = '<div class="loading">Loading...</div>';

  fetch(apiUrl)
    .then(response => {
      if (!response.ok) throw new Error('Failed to fetch data');
      return response.json();
    })
    .then(data => {
      if (data.length === 0) {
        container.innerHTML = '<div class="empty-state">No items found.</div>';
        return;
      }
      container.innerHTML = renderFn(data);
    })
    .catch(err => {
      container.innerHTML = '<div class="error-state">Failed to load data. Please try again later.</div>';
      console.error('Fetch error:', err);
    });
}
```

- [ ] **Step 4: Commit**

```bash
git add client/css/client.css client/js/fetch-section.js
git commit -m "feat(client): add shared CSS (color tokens) and fetch helper"
```

---

### Task 8: Create client/index.html (landing page)

**Files:**
- Create: `client/index.html`

- [ ] **Step 1: Create the file**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BS Mathematics Department</title>
  <link href="https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400;6..72,600;6..72,700&family=Work+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/client.css">
</head>
<body>
  <nav class="client-nav">
    <a href="index.html" class="brand active">BS Mathematics</a>
    <a href="programs.html">Programs</a>
    <a href="announcements.html">Announcements</a>
    <a href="events.html">Events</a>
    <a href="news.html">News</a>
    <a href="gallery.html">Gallery</a>
    <a href="faculty.html">Faculty</a>
  </nav>

  <div class="hero">
    <h1>BS Mathematics Department</h1>
    <p>College of Computing and Information Technology</p>
  </div>

  <div class="section-grid">
    <div class="section-card">
      <h3>Programs</h3>
      <p>Explore our academic programs in mathematics and applied tracks.</p>
      <a href="programs.html">View Programs &rarr;</a>
    </div>
    <div class="section-card">
      <h3>Announcements</h3>
      <p>Latest updates and announcements from the department.</p>
      <a href="announcements.html">View Announcements &rarr;</a>
    </div>
    <div class="section-card">
      <h3>Events</h3>
      <p>Upcoming events, workshops, and department activities.</p>
      <a href="events.html">View Events &rarr;</a>
    </div>
    <div class="section-card">
      <h3>News</h3>
      <p>News and achievements from our students and faculty.</p>
      <a href="news.html">View News &rarr;</a>
    </div>
    <div class="section-card">
      <h3>Gallery</h3>
      <p>Photos from department events and activities.</p>
      <a href="gallery.html">View Gallery &rarr;</a>
    </div>
    <div class="section-card">
      <h3>Faculty</h3>
      <p>Meet our dedicated faculty members and their expertise.</p>
      <a href="faculty.html">View Faculty &rarr;</a>
    </div>
  </div>

  <footer class="client-footer">
    &copy; 2026 BS Mathematics Department — College of Computing and Information Technology
  </footer>
</body>
</html>
```

- [ ] **Step 2: Verify in browser**

Open `http://localhost/BSMath/client/index.html` — should show green nav bar, hero section, and 6 section cards.

- [ ] **Step 3: Commit**

```bash
git add client/index.html
git commit -m "feat(client): add landing page with hero and section cards"
```

---

### Task 9: Create client/programs.html

**Files:**
- Create: `client/programs.html`

- [ ] **Step 1: Create the file**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Programs — BS Mathematics</title>
  <link href="https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400;6..72,600;6..72,700&family=Work+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/client.css">
</head>
<body>
  <nav class="client-nav">
    <a href="index.html" class="brand">BS Mathematics</a>
    <a href="programs.html" class="active">Programs</a>
    <a href="announcements.html">Announcements</a>
    <a href="events.html">Events</a>
    <a href="news.html">News</a>
    <a href="gallery.html">Gallery</a>
    <a href="faculty.html">Faculty</a>
  </nav>

  <div class="section-page">
    <h2>Programs</h2>
    <div id="content" class="content-grid"></div>
  </div>

  <footer class="client-footer">
    &copy; 2026 BS Mathematics Department — College of Computing and Information Technology
  </footer>

  <script src="js/fetch-section.js"></script>
  <script>
    fetchSection('../public_api/programs_api.php', function(data) {
      return data.map(function(p) {
        return '<div class="content-card">' +
          '<h3>' + p.name + '</h3>' +
          '<p>' + (p.description || '') + '</p>' +
          '</div>';
      }).join('');
    });
  </script>
</body>
</html>
```

- [ ] **Step 2: Verify in browser**

Open `http://localhost/BSMath/client/programs.html` — should show program cards with data from the API.

- [ ] **Step 3: Commit**

```bash
git add client/programs.html
git commit -m "feat(client): add programs page — fetches from programs_api.php"
```

---

### Task 10: Create client/announcements.html

**Files:**
- Create: `client/announcements.html`

- [ ] **Step 1: Create the file**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Announcements — BS Mathematics</title>
  <link href="https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400;6..72,600;6..72,700&family=Work+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/client.css">
</head>
<body>
  <nav class="client-nav">
    <a href="index.html" class="brand">BS Mathematics</a>
    <a href="programs.html">Programs</a>
    <a href="announcements.html" class="active">Announcements</a>
    <a href="events.html">Events</a>
    <a href="news.html">News</a>
    <a href="gallery.html">Gallery</a>
    <a href="faculty.html">Faculty</a>
  </nav>

  <div class="section-page">
    <h2>Announcements</h2>
    <div id="content"></div>
  </div>

  <footer class="client-footer">
    &copy; 2026 BS Mathematics Department — College of Computing and Information Technology
  </footer>

  <script src="js/fetch-section.js"></script>
  <script>
    fetchSection('../public_api/announcements_api.php', function(data) {
      return data.map(function(a) {
        var date = a.created_at ? new Date(a.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
        return '<div class="content-card">' +
          '<h3>' + a.title + '</h3>' +
          '<p>' + a.content + '</p>' +
          (date ? '<span class="meta">' + date + '</span>' : '') +
          '</div>';
      }).join('');
    });
  </script>
</body>
</html>
```

- [ ] **Step 2: Verify in browser**

Open `http://localhost/BSMath/client/announcements.html` — should show announcement cards with dates.

- [ ] **Step 3: Commit**

```bash
git add client/announcements.html
git commit -m "feat(client): add announcements page — fetches from announcements_api.php"
```

---

### Task 11: Create client/events.html

**Files:**
- Create: `client/events.html`

- [ ] **Step 1: Create the file**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Events — BS Mathematics</title>
  <link href="https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400;6..72,600;6..72,700&family=Work+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/client.css">
</head>
<body>
  <nav class="client-nav">
    <a href="index.html" class="brand">BS Mathematics</a>
    <a href="programs.html">Programs</a>
    <a href="announcements.html">Announcements</a>
    <a href="events.html" class="active">Events</a>
    <a href="news.html">News</a>
    <a href="gallery.html">Gallery</a>
    <a href="faculty.html">Faculty</a>
  </nav>

  <div class="section-page">
    <h2>Events</h2>
    <div id="content" class="content-grid"></div>
  </div>

  <footer class="client-footer">
    &copy; 2026 BS Mathematics Department — College of Computing and Information Technology
  </footer>

  <script src="js/fetch-section.js"></script>
  <script>
    fetchSection('../public_api/events_api.php', function(data) {
      return data.map(function(e) {
        var date = e.event_date ? new Date(e.event_date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
        var time = e.event_time || '';
        var location = e.location || '';
        var meta = [date, time, location].filter(Boolean).join(' &bull; ');
        return '<div class="content-card">' +
          '<h3>' + e.title + '</h3>' +
          '<p>' + (e.description || '') + '</p>' +
          (meta ? '<span class="meta">' + meta + '</span>' : '') +
          '</div>';
      }).join('');
    });
  </script>
</body>
</html>
```

- [ ] **Step 2: Verify in browser**

Open `http://localhost/BSMath/client/events.html` — should show event cards with date/time/location.

- [ ] **Step 3: Commit**

```bash
git add client/events.html
git commit -m "feat(client): add events page — fetches from events_api.php"
```

---

### Task 12: Create client/news.html

**Files:**
- Create: `client/news.html`

- [ ] **Step 1: Create the file**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>News — BS Mathematics</title>
  <link href="https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400;6..72,600;6..72,700&family=Work+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/client.css">
</head>
<body>
  <nav class="client-nav">
    <a href="index.html" class="brand">BS Mathematics</a>
    <a href="programs.html">Programs</a>
    <a href="announcements.html">Announcements</a>
    <a href="events.html">Events</a>
    <a href="news.html" class="active">News</a>
    <a href="gallery.html">Gallery</a>
    <a href="faculty.html">Faculty</a>
  </nav>

  <div class="section-page">
    <h2>News</h2>
    <div id="content" class="content-grid"></div>
  </div>

  <footer class="client-footer">
    &copy; 2026 BS Mathematics Department — College of Computing and Information Technology
  </footer>

  <script src="js/fetch-section.js"></script>
  <script>
    fetchSection('../public_api/news_api.php', function(data) {
      return data.map(function(n) {
        var img = n.image_url ? '<img src="' + n.image_url + '" alt="" style="width:100%;height:180px;object-fit:cover;border-radius:var(--radius);margin-bottom:0.75rem;">' : '';
        return '<div class="content-card">' +
          img +
          '<h3>' + n.title + '</h3>' +
          '<p>' + n.content + '</p>' +
          '</div>';
      }).join('');
    });
  </script>
</body>
</html>
```

- [ ] **Step 2: Verify in browser**

Open `http://localhost/BSMath/client/news.html` — should show news cards with images.

- [ ] **Step 3: Commit**

```bash
git add client/news.html
git commit -m "feat(client): add news page — fetches from news_api.php"
```

---

### Task 13: Create client/gallery.html

**Files:**
- Create: `client/gallery.html`

- [ ] **Step 1: Create the file**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gallery — BS Mathematics</title>
  <link href="https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400;6..72,600;6..72,700&family=Work+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/client.css">
</head>
<body>
  <nav class="client-nav">
    <a href="index.html" class="brand">BS Mathematics</a>
    <a href="programs.html">Programs</a>
    <a href="announcements.html">Announcements</a>
    <a href="events.html">Events</a>
    <a href="news.html">News</a>
    <a href="gallery.html" class="active">Gallery</a>
    <a href="faculty.html">Faculty</a>
  </nav>

  <div class="section-page">
    <h2>Gallery</h2>
    <div id="content" class="gallery-grid"></div>
  </div>

  <footer class="client-footer">
    &copy; 2026 BS Mathematics Department — College of Computing and Information Technology
  </footer>

  <script src="js/fetch-section.js"></script>
  <script>
    fetchSection('../public_api/gallery_api.php', function(data) {
      return data.map(function(g) {
        return '<div class="gallery-item">' +
          '<img src="' + g.image_url + '" alt="' + (g.title || '') + '" onerror="this.src=\'https://via.placeholder.com/400x200?text=Image+Not+Found\'">' +
          '<div class="caption">' +
          (g.title ? '<h3>' + g.title + '</h3>' : '') +
          (g.description ? '<p>' + g.description + '</p>' : '') +
          '</div>' +
          '</div>';
      }).join('');
    });
  </script>
</body>
</html>
```

- [ ] **Step 2: Verify in browser**

Open `http://localhost/BSMath/client/gallery.html` — should show image grid with captions.

- [ ] **Step 3: Commit**

```bash
git add client/gallery.html
git commit -m "feat(client): add gallery page — fetches from gallery_api.php"
```

---

### Task 14: Create client/faculty.html

**Files:**
- Create: `client/faculty.html`

- [ ] **Step 1: Create the file**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Faculty — BS Mathematics</title>
  <link href="https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400;6..72,600;6..72,700&family=Work+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/client.css">
</head>
<body>
  <nav class="client-nav">
    <a href="index.html" class="brand">BS Mathematics</a>
    <a href="programs.html">Programs</a>
    <a href="announcements.html">Announcements</a>
    <a href="events.html">Events</a>
    <a href="news.html">News</a>
    <a href="gallery.html">Gallery</a>
    <a href="faculty.html" class="active">Faculty</a>
  </nav>

  <div class="section-page">
    <h2>Faculty</h2>
    <div id="content" class="faculty-grid"></div>
  </div>

  <footer class="client-footer">
    &copy; 2026 BS Mathematics Department — College of Computing and Information Technology
  </footer>

  <script src="js/fetch-section.js"></script>
  <script>
    fetchSection('../public_api/faculty_api.php', function(data) {
      return data.map(function(f) {
        var img = f.image_url
          ? '<img src="' + f.image_url + '" alt="' + f.name + '">'
          : '<div style="width:64px;height:64px;border-radius:50%;background:#e2e3e1;display:flex;align-items:center;justify-content:center;color:#6e7a6e;font-size:1.25rem;font-weight:600;flex-shrink:0;">' + f.name.charAt(0) + '</div>';
        return '<div class="faculty-card">' +
          img +
          '<div class="info">' +
          '<h3>' + f.name + '</h3>' +
          '<p>' + (f.position || '') + '</p>' +
          (f.specialization ? '<p>' + f.specialization + '</p>' : '') +
          '</div>' +
          '</div>';
      }).join('');
    });
  </script>
</body>
</html>
```

- [ ] **Step 2: Verify in browser**

Open `http://localhost/BSMath/client/faculty.html` — should show faculty cards with photos or initial placeholders.

- [ ] **Step 3: Commit**

```bash
git add client/faculty.html
git commit -m "feat(client): add faculty page — fetches from faculty_api.php"
```

---

### Task 15: Final integration test

**Files:** (none — verification only)

- [ ] **Step 1: Verify all API endpoints return valid JSON**

Open each URL and confirm JSON array is returned:
- `http://localhost/BSMath/public_api/programs_api.php`
- `http://localhost/BSMath/public_api/announcements_api.php`
- `http://localhost/BSMath/public_api/events_api.php`
- `http://localhost/BSMath/public_api/news_api.php`
- `http://localhost/BSMath/public_api/gallery_api.php`
- `http://localhost/BSMath/public_api/faculty_api.php`

- [ ] **Step 2: Verify all client pages render data**

Open each page and confirm data loads from API:
- `http://localhost/BSMath/client/index.html`
- `http://localhost/BSMath/client/programs.html`
- `http://localhost/BSMath/client/announcements.html`
- `http://localhost/BSMath/client/events.html`
- `http://localhost/BSMath/client/news.html`
- `http://localhost/BSMath/client/gallery.html`
- `http://localhost/BSMath/client/faculty.html`

- [ ] **Step 3: Verify no hardcoded data**

Inspect page source — confirm all content sections have empty `<div id="content">` and data appears only after JS fetch executes.

- [ ] **Step 4: Verify responsiveness**

Resize browser to mobile width (320px-640px) and confirm:
- Nav wraps properly
- Cards stack vertically
- Images scale down
- Text remains readable

- [ ] **Step 5: Verify color scheme consistency**

Confirm the client site uses the same emerald green (#006d36) as the admin SPA.