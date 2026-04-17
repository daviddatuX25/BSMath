# Phase 6: Presentation Preparation - Context

**Gathered:** 2026-04-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Create two documentation artifacts that let any team member explain and defend the BS Mathematics Admin SPA against the CCSIT 213 Worksheet 4.2 rubric (guide.md) without reading source code:

1. `docs/PRESENTATION_GUIDE.md` — junior-friendly technical walkthrough of SPA architecture, PHP backend alignment, RBAC, data flows, and guide.md compliance
2. `docs/RUBRIC_DEFENSE.md` — point-by-point defense against each guide.md requirement with code references

</domain>

<decisions>
## Implementation Decisions

### Rubric Defense Format
- **D-01:** RUBRIC_DEFENSE.md uses **table format** — each rubric item gets a row: `| Rubric Item | Code Location | Evidence |`. Fastest for live Q&A lookups; teammates can Ctrl+F any rubric keyword.

### Diagram Style
- **D-02:** PRESENTATION_GUIDE.md uses **ASCII flow diagrams** for data flows (e.g., `login.php → $_SESSION → fetch → render`). Works in any markdown viewer, easy to copy into slides, teammates can recreate on a whiteboard.

### Claude's Discretion
- Exact depth of technical explanation in PRESENTATION_GUIDE.md (balance between junior-friendly and thorough)
- Whether docs cross-reference each other or are self-contained
- Specific ASCII diagram layouts and flow sequences
- Which code excerpts to include as evidence in RUBRIC_DEFENSE.md
- Organization/section structure within each doc
</decisions>

<canonical_refs>
## Canonical References

### Rubric / Requirements
- `guide.md` — CCSIT 213 Worksheet 4.2 project brief and rubric: architecture constraints, RBAC matrix, layout requirements, dashboard UI specs, UX quality targets (5 categories: Completeness, Visual Hierarchy, Responsiveness, UX Smoothness)
- `.planning/REQUIREMENTS.md` — Detailed feature requirements (R1–R17), RBAC matrix, success criteria
- `.planning/PROJECT.md` — Stack summary, key decisions, out-of-scope items
- `.planning/ROADMAP.md` — Phase dependency graph, rubric mapping table

### Architecture Reference
- `assets/js/router.js` — Hash-based SPA routing, role guards
- `assets/js/auth.js` — Login flow, session handling
- `assets/js/api.js` — Fetch wrapper, `{success, data, error}` envelope
- `assets/js/app.js` — App bootstrap, module loading
- `api/connect.php` — Database connection pattern
- `api/auth/login.php` — Server-side session creation

### Phase History
- `.planning/phases/01-foundation-db-auth-spa-shell/01-01-SUMMARY.md` through `01-03-SUMMARY.md`
- `.planning/phases/02-dashboard-programs-module/02-01-SUMMARY.md` through `02-03-SUMMARY.md`
- `.planning/phases/03-content-modules-announcements-events-news/03-01-SUMMARY.md` through `03-03-SUMMARY.md`
- `.planning/phases/04-gallery-faculty-users-approve-content/04-01-SUMMARY.md` through `04-03-SUMMARY.md`
- `.planning/phases/05-polish-search-responsive-visual-qa/05-01-SUMMARY.md` through `05-02-SUMMARY.md`

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Full SPA codebase exists: 18 JS modules, 38 PHP endpoints, complete RBAC, all CRUD modules
- `README.md` — already has setup instructions and demo credentials (can reference or extend)

### Established Patterns
- Every PHP endpoint follows: session check → role check → query → JSON response
- Every JS view follows: fetch API → render list → modal CRUD → toast feedback
- Router guards: `router.js` checks `currentUser.role` before mounting a view
- RBAC: dual enforcement (client-side nav hiding + server-side 403)

### Integration Points
- `docs/` directory — new, will contain both deliverables
- Both docs must reference actual file paths and line numbers in the existing codebase
</code_context>

<specifics>
## Specific Ideas

- RUBRIC_DEFENSE.md table format: each row maps a guide.md requirement to exact code location + what it does
- PRESENTATION_GUIDE.md ASCII diagrams: login→session→API→render cycle, RBAC enforcement flow, CRUD data flow
- Docs should enable a teammate who didn't write the code to confidently present and answer rubric questions

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---
*Phase: 06-presentation-preparation*
*Context gathered: 2026-04-17*