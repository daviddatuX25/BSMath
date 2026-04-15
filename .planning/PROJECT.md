# BS Mathematics Admin SPA

## What This Is

A Single Page Application (SPA) admin portal for the BS Mathematics department, built strictly with the **ws4.2 source code** stack: vanilla PHP + HTML/CSS/JS. No frameworks, no build tools. UI fidelity matches `mock.html` (emerald/stone palette, Tailwind CDN, Material Symbols).

Deliverable for **CCSIT 213 Worksheet 4.2** — an academic/midterm project.

## Core Value

Demonstrate SPA architecture fundamentals (hash routing, `fetch` for data, no page reloads) with Role-Based Access Control — in the simplest possible implementation a junior developer can follow end-to-end.

## Context

- **Stack constraint (HARD):** ONLY the ws4.2 source code folder may be referenced (`connect.php`, profile CRUD endpoints, `index.html`). No outside libraries except what's already loaded (Tailwind CDN, Material Symbols, Google Fonts).
- **Local dev:** Laragon on `G:\`. Project at `D:\Projects\BSMath`.
- **Target grade tier:** "Excellent (20-16 pts)" across all rubric categories — completeness, visual hierarchy, responsiveness, UX smoothness.
- **Design reference:** `mock.html` at repo root shows pixel-target fidelity for the Manage Programs page (emerald-800 primary, stone neutrals, Newsreader serif headings, Work Sans body).

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] R1. Login screen with session-based auth (Admin, Dean/Principal, Program Head)
- [ ] R2. Persistent SPA layout: sticky topbar (logo + search + profile), sidebar nav, dynamic main content area
- [ ] R3. Hash-based client router — navigation never reloads the page
- [ ] R4. Role-Based Access Control — nav items and routes hide/deny based on logged-in role
- [ ] R5. Dashboard view — role-aware header, 4 stats cards, recent activities feed, quick actions
- [ ] R6. Manage Programs module — list, add, edit, delete (Admin + Program Head)
- [ ] R7. Announcements module — list, add, edit, delete (Admin, Dean, Program Head)
- [ ] R8. Events module — list, add, edit, delete (Admin, Dean)
- [ ] R9. News module — list, add, edit, delete (Admin)
- [ ] R10. Gallery module — list, upload, delete (Admin, Program Head)
- [ ] R11. Faculty module — list, add, edit, delete (Admin)
- [ ] R12. Users module — list, add, edit, delete (Admin)
- [ ] R13. Dean "Approve Content" UI — approve/reject pending announcements and events
- [ ] R14. Global search bar in topbar — filters the current module list
- [ ] R15. Responsive layout — sidebar collapses on small screens, cards stack
- [ ] R16. Apply emerald/stone "Midterm" color combo consistently (from mock.html)
- [ ] R17. Form feedback — success/error toast on every create/update/delete

### Out of Scope

- Any external npm/composer packages — strict ws4.2 constraint
- Inertia/Laravel/Svelte — must be vanilla
- Real file upload service (gallery uses local storage / `uploads/` folder only)
- Email/SMS notifications
- Two-factor auth, password reset flows
- Audit logs, soft deletes
- Production deployment (local Laragon only)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Vanilla PHP + hash-routed SPA | Worksheet constraint: only ws4.2 stack allowed | — Pending |
| Session-based auth (`$_SESSION`) | Simplest implementation; matches ws4.2 PHP idioms | — Pending |
| Emerald-800 primary + stone neutrals | Assigned "Midterm" color combo, per `mock.html` | — Pending |
| Tailwind via CDN + Material Symbols | Already in `mock.html`; no build step | — Pending |
| Role stored as column on `users` table | Simpler than separate roles/permissions tables | — Pending |
| JSON API endpoints (PHP returns JSON) | Extends ws4.2 fetch-profile pattern to all modules | — Pending |
| Junior-friendly coding style | User preference — readable over clever | — Pending |

## Stack Summary

| Layer | Tool |
|-------|------|
| Server | PHP 8.x (Laragon) |
| Database | MySQL/MariaDB (Laragon) |
| Frontend | Vanilla JS (ES6 modules), hash router, `fetch` |
| CSS | Tailwind CDN + small custom overrides |
| Icons | Material Symbols Outlined (Google Fonts) |
| Fonts | Newsreader (headings), Work Sans (body) |
| API shape | JSON — `{ success, data, error }` envelope |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition:**
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions

---
*Last updated: 2026-04-15 after initialization*
