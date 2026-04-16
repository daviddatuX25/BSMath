# BS Mathematics Admin Portal

SPA dashboard for managing programs, announcements, events, news, gallery, faculty, users, and content approvals.

## Tech Stack

- **Backend:** PHP 8.x (no framework)
- **Frontend:** Vanilla JS + Tailwind CSS (CDN)
- **Database:** MySQL 5.7+ / MariaDB 10.4+
- **Server:** Apache (with mod_rewrite) — Laragon recommended

## Local Setup (Laragon)

1. **Clone** the repo into `C:\laragon\www\bsmath\` (or your Laragon www root)
2. **Create database:** Open HeidiSQL → create database `bsmath`
3. **Import schema:** Run `db/schema.sql` then `db/seed.sql`
4. **Configure connection:** Edit `api/connect.php` if your MySQL credentials differ (defaults: `root`, empty password, database `bsmath`)
5. **Start Apache + MySQL** in Laragon
6. **Open** http://bsmath.test/ (or http://localhost/bsmath/)

## Demo Accounts

| Email             | Password      | Role          |
|-------------------|---------------|---------------|
| admin@bsmath.test | password123   | Administrator |
| dean@bsmath.test  | password123   | Dean/Principal |
| head@bsmath.test  | password123   | Program Head  |

All three accounts are seeded by `db/seed.sql`.

## Features

- Hash-based SPA routing (no page reloads)
- Role-based access control (Admin, Dean, Program Head)
- CRUD for all modules with toast feedback
- Dean approval workflow for announcements & events
- Gallery image uploads
- Global search with 250ms debounce
- Responsive layout (mobile sidebar drawer)
- Loading skeleton rows on every data fetch
- Empty state messages when lists have no items

## Project Structure

```
api/              PHP endpoints (auth, CRUD, dashboard)
assets/css/       app.css (Tailwind overrides)
assets/js/        SPA modules (router, views, ui helpers)
assets/js/api.js  API client wrapper
assets/js/app.js  Entry point + router
db/               schema.sql, seed.sql
views/            login.html, shell.html (HTML fragments)
uploads/gallery/  Uploaded gallery images
```

## Browser Support

Chrome 90+, Firefox 90+, Safari 14+, Edge 90+.
