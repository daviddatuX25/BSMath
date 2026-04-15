## CCSIT 213 SPA Development Guide (Worksheet 4.2)

Here is the consolidated project brief and specification sheet extracted from the worksheet. Treat this as your functional and architectural blueprint. As your senior, I’ve broken this down into the exact requirements you need to implement to hit full marks on the rubric.

### 1. Architectural & Technical Constraints
* **Architecture:** Single Page Application (SPA). This means the page should not reload when navigating.
* **Strict Code Constraint:** You **MUST ONLY** use the provided source code located in the **"ws4.2 source code"** folder. Do not introduce outside libraries, frameworks, or templates unless they are already in that folder.
* **Theming/Styling:** You must strictly apply the specific "Midterm" color combination assigned to our group.

### 2. Role-Based Access Control (RBAC) Requirements
The UI and navigation must dynamically adapt based on who is logged in. Do not show buttons or links to users who do not have permission to use them.
* **Admin:** Full Access. (Login, Manage Programs, Announcements, Events, News, Gallery, Faculty, Users).
* **Dean/Principal:** Restricted Access. (Login, Manage Announcements, Manage Events, **Approve Content**). *Note: Ensure the "Approve Content" UI is built specifically for this role.*
* **Program Head:** Restricted Access. (Login, Manage Programs, Manage Gallery, Manage Announcements).

### 3. Layout & Navigation Structure
The SPA requires a persistent layout with a static sidebar and topbar, while the Main Content Area updates dynamically based on the active route.

* **Top Navigation Bar:**
    * System Logo
    * Global Search Bar
    * User Profile (likely a dropdown for logout/settings)
* **Sidebar Navigation (Conditionally rendered based on user role):**
    * Dashboard (Default landing view)
    * Manage Programs
    * Announcements
    * Events
    * News
    * Gallery
    * Faculty
    * Users

### 4. Main Dashboard UI Components
When a user lands on the "Dashboard" view, the layout must include the following specific sections:
* **Header:** "Welcome Admin Panel" (Update dynamically based on role, e.g., "Welcome Dean").
* **Stats Cards (Data visualizations at the top):**
    * Total Programs
    * Total Announcements
    * Total Events
    * Total Users
* **Recent Activities Feed (Chronological list):**
    * Example entries to design for: "New Announcement Posted," "Program Updated," "New Event Created."
* **Quick Actions Panel (Buttons for fast execution):**
    * Add Program
    * Create Announcement
    * Upload Gallery

### 5. UI/UX Quality Targets (Rubric Standards)
To secure the "Excellent (20-16 pts)" tier across all grading categories, the code and design must reflect the following:
* **Completeness:** Every single use case from the diagram MUST have a corresponding functional screen or modal in the SPA. Missing features equal immediate point deductions.
* **Visual Hierarchy:** Clean, modern design. Do not clutter the screen. Ensure the "Assigned Colors" are used consistently (e.g., primary color for primary actions, secondary for accents).
* **Responsiveness:** The layout must be fluid. Ensure the Sidebar can toggle or collapse, and that the Stats Cards stack neatly on smaller screens. 
* **UX Smoothness:** Navigation must be instant (SPA routing). Ensure forms and actions have logical feedback (e.g., success messages when an announcement is posted).