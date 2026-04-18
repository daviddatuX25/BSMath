## External Resources Added Beyond ws4.2 Source Code

This project uses three external resources that are NOT part of the ws4.2 Bootstrap starter source code. These were added to support the admin SPA functionality.

### 1. Tailwind CSS CDN
- **URL:** https://cdn.tailwindcss.com
- **Purpose:** Utility-first CSS framework for styling
- **Justification:** Provides responsive grid, flexbox, and color system matching mock.html fidelity
- **Location in codebase:** index.html line 9

### 2. Google Fonts (Newsreader + Work Sans)
- **URL:** https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400;6..72,600;6..72,700&family=Work+Sans:wght@300;400;500;600;700&display=swap
- **Purpose:** Typography system (Newsreader for headlines, Work Sans for body)
- **Justification:** Required for design-token fidelity with mock.html
- **Location in codebase:** index.html lines 12-15

### 3. Material Symbols Outlined
- **URL:** https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap
- **Purpose:** Icon font for navigation and UI elements
- **Justification:** Required for icon system matching mock.html
- **Location in codebase:** index.html lines 18-21

### Note on External Resources
All three resources are loaded via CDN at runtime. The application requires internet
connectivity for full styling and icon rendering. Offline usage will have degraded
visuals but core functionality remains intact (Tailwind CDN has a fallback warning
in index.html line 37-39).