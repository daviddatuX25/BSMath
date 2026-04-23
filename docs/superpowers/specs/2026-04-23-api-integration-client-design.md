# BSMath Public Client Website — API Integration Design

## Goal

Align the existing BSMath system with Worksheet 4.2 (Client-Side Website with API Integration) grading requirements by adding a **public client website** and **public API endpoints** — without modifying the existing admin SPA.

## Grading Targets

| Criteria | Points | How We Hit It |
|----------|--------|---------------|
| Content | 20 | All 6 sections present, data from API, no hardcoded data |
| Working API | 40 | 6 PHP API files returning JSON from MySQL; client uses fetch() |
| Responsiveness & Design | 20 | Tailwind CSS, emerald color scheme, responsive layouts |

## Architecture

**Add-only. Zero changes to existing admin SPA or database.**

```
BSMath/
├── client/                        ← NEW
│   ├── index.html                 ← home/landing page
│   ├── programs.html
│   ├── announcements.html
│   ├── events.html
│   ├── news.html
│   ├── gallery.html
│   ├── faculty.html
│   ├── css/
│   │   └── client.css             ← shared styles (admin color tokens)
│   └── js/
│       └── fetch-section.js       ← shared fetch helper
├── public_api/                    ← NEW
│   ├── programs_api.php
│   ├── announcements_api.php
│   ├── events_api.php
│   ├── news_api.php
│   ├── gallery_api.php
│   └── faculty_api.php
└── ...existing files (untouched)...
```

## Public API Endpoints

Each file follows the guide's exact pattern:

```php
<?php
header("Content-Type: application/json");
$conn = new mysqli("localhost", "root", "", "course_website");
$result = $conn->query("SELECT ... FROM <table> WHERE <filter>");
$data = array();
while($row = $result->fetch_assoc()) {
    $data[] = $row;
}
echo json_encode($data);
?>
```

- No auth check (public access)
- Filter to approved/published/active items only
- One file per content section (matches guide's `programs_api.php` pattern)

### Endpoint Details

| File | Table | Filter | Fields Returned |
|------|-------|--------|-----------------|
| programs_api.php | programs | status='active' | id, name, description |
| announcements_api.php | announcements | status='approved' | id, title, content, date_posted |
| events_api.php | events | status='approved' | id, title, description, event_date, event_time, location |
| news_api.php | news | status='published' | id, title, content, image_url |
| gallery_api.php | gallery | all | id, title, image_url, description |
| faculty_api.php | faculty | status='active' | id, name, position, specialization, image_url |

## Client Pages

Each page:
- Includes a shared top navigation bar linking to all 6 sections + home
- Uses Tailwind CSS via CDN with the admin's emerald color tokens
- Has a `<script>` block using `fetch()` to pull data from the corresponding public API
- Renders data dynamically into the DOM (no hardcoded content)

### Shared Components

**client/css/client.css** — CSS custom properties matching admin's Tailwind tokens:
- Primary: `#006d36` (emerald green)
- Secondary: `#b7131a` (red accent)
- Fonts: Newsreader (headings) + Work Sans (body)
- Surface colors, border radius, spacing

**client/js/fetch-section.js** — shared helper:
- `fetchSection(apiUrl, renderFn)` — fetches JSON and calls the render function
- Error handling with fallback message

### Page Layouts

**index.html** — Landing page with hero section + 6 section preview cards linking to detail pages

**programs.html** — Card grid of programs (name + description)

**announcements.html** — Chronological list of announcements (title + content + date)

**events.html** — Card list of events (title + description + date + location)

**news.html** — News article cards (title + content + image if available)

**gallery.html** — Image grid with titles and descriptions

**faculty.html** — Faculty cards (name + position + specialization + photo if available)

## Content Mapping

All data flows from the existing `course_website` database:

| Section | Table | Filter | Display Fields |
|---------|-------|--------|----------------|
| Programs | programs | status='active' | name, description |
| Announcements | announcements | status='approved' | title, content, created_at |
| Events | events | status='approved' | title, description, event_date, event_time, location |
| News | news | status='published' | title, content, image_url |
| Gallery | gallery | (all) | title, image_url, description |
| Faculty | faculty | status='active' | name, position, specialization, image_url |

## What We Do NOT Touch

- `api/` directory (admin API stays auth-protected)
- `assets/` directory (admin SPA assets unchanged)
- `index.html` (admin SPA entry point unchanged)
- `db/schema.sql` (database schema unchanged)
- `views/` directory (admin views unchanged)

## Out of Scope

- Login functionality on the client site (guide explicitly excludes it)
- Manage Users (guide explicitly excludes it)
- Approve Content (guide explicitly excludes it)
- CRUD operations on the client site (read-only display only)