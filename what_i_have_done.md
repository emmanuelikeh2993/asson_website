# ASSON UI Student Platform — Project State & Handover Guide (what_i_have_done.md)

> **Purpose of this Document**:  
> This file is a comprehensive onboarding and handover guide for any future AI assistant or engineer resuming work on this codebase—whether on this machine or a new laptop. It explains where we started, the decisions made, what has been built and tested, the live backend status, and the immediate next steps.

---

## 1. Project Overview & Institutional Context

- **Platform Name**: ASSON UI Student Platform
- **Organization**: Association of Statistics Students of Nigeria (ASSON), University of Ibadan Chapter
- **Motto**: *"Facts from Reliable Figures"*
- **Target Audience**: Undergraduate (100L–400L) & Postgraduate students in the Department of Statistics, Faculty of Science, University of Ibadan.
- **Core Purpose**: Academic resource repository (past examination questions, lecture notes, tutorial sheets), departmental notice board, vetted scholarships/internships tracker, student dashboard, and admin moderation console.
- **Official External References**:
  - **UI Student Portal**: `https://student-portal.ui.edu.ng/login`
  - **ASSON Official Instagram**: `https://www.instagram.com/asson_unibadan/` (`@asson_unibadan`)
  - **Official Department Email**: `asson@ui.edu.ng`
  - **Physical Location**: Department of Statistics, Faculty of Science, University of Ibadan, Oyo State, Nigeria.

---

## 2. Infrastructure & Connected Cloud Backend

### Supabase Project Details
- **Project Name**: `asson_website`
- **Project URL**: `https://cvhjohbknghlmspoaenr.supabase.co`
- **Project Ref**: `cvhjohbknghlmspoaenr`
- **Publishable Key**: `sb_publishable_NMsNixFSbQvLjqXtGpHgxA_uuaBD7w5` (configured in `.env`)
- **Secret Key**: `[Stored securely in Supabase Dashboard - Project Settings > API]`
- **Database Status**:
  - All **13 tables** are created and live (`courses`, `resources`, `notices`, `opportunities`, `faqs`, `profiles`, `user_roles`, `submissions`, `bookmarks`, `audit_events`, `content_reports`, `site_settings`, `executive_contacts`).
  - **Seed data populated**: 12 official UI Statistics courses (`STA 111` through `STA 701`), verified resources, urgent notices, and scholarships.
  - **Storage Bucket**: Public bucket `resources` is provisioned with a 15MB file size limit and MIME-type restrictions (`application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `application/zip`).

---

## 3. Technology Stack & Environment

- **Runtime**: Node.js v22.14.0 LTS
- **Build Tool**: Vite 6.0.1
- **Language**: TypeScript 5.6
- **UI Framework**: React 18.3.1
- **Styling**: Tailwind CSS 3.4 + PostCSS + Autoprefixer
- **Icons**: Lucide React
- **Data Fetching & Cache**: TanStack React Query v5
- **Routing**: React Router v6
- **Database & Auth SDK**: `@supabase/supabase-js` v2.118.0
- **Validation**: Zod + React Hook Form

---

## 4. What Has Been Done (Detailed Inventory)

### 4.1 Design System & Inspiration Archive
- **23 High-Fidelity Inspiration Screenshots**: Curated from Dribbble and indexed in `docs/design_inspiration/` covering academic portals, bento grids, 3-pane tables, notice feeds, hospital/student dashboards, and audit logs.
- **Semantic Color Palette** (`tailwind.config.js`):
  - Primary Brand Green: `#087A3E`
  - Deep Brand Green: `#064B2B`
  - Soft Light Green: `#E8F5E9`
  - Accent Red: `#C62828`
  - Accent Cyan: `#55C9D5`
  - Background Surface: `#F6F8F7`
  - Card Surface: `#FFFFFF`
- **Logo Sizing & Co-Branding Fix**:
  - The raw `asson_logo.png` had ~70% blank white margin, which made it shrink in CSS `object-contain` compared to `ui_crest.jpg`.
  - Tightly cropped the ASSON emblem to `142 × 140px` and made the background transparent.
  - Co-branded both logos side-by-side in `Navbar.tsx` (`w-9 h-9`) and `Footer.tsx` (`w-10 h-10`) separated by an institutional hairline divider (`w-px h-5 bg-border-light`), achieving perfect optical balance.

### 4.2 Priority 1: The Core Academic Engine
- **3-Pane Explorer (`src/pages/ResourcesPage.tsx`)**:
  - **Left Pane**: Course curriculum selector (`STA 111` to `STA 421`, grouped by level).
  - **Center Pane**: Filterable data table and grid views with level chips, resource types (`Past Question`, `Lecture Note`, `Course Outline`, `Tutorial Sheet`), and verification badges.
  - **Right Drawer (`ResourcePreviewDrawer.tsx`)**: Metadata slide-out with syllabus summary, contributor attribution, download stats, and zero-login instant download trigger.
- **Filtered Past Questions Catalog (`src/pages/PastQuestionsPage.tsx`)**: Filtered instance of the unified academic resource engine.
- **Global Command Palette (`src/components/features/resources/CommandPalette.tsx`)**: Keyboard-accessible (`Ctrl+K` or `/`) modal search indexing course codes, titles, and past sessions.
- **Drag-and-Drop Uploader (`src/components/features/resources/SubmitResourceModal.tsx`)**: Multi-step file upload modal with 15MB file size validation and progress bar.
- **Content Reporting (`src/components/features/resources/ReportIssueModal.tsx`)**: Dialog for reporting broken links or incorrect answers.

### 4.3 Priority 2: Institutional Pages & Feeds
- **Homepage (`src/pages/HomePage.tsx`)**:
  - Institutional trust hero with animated status badge and instant search bar.
  - Quick Bento grid gateways (Past Questions, Departmental Notices, Opportunities, Get Involved).
  - One-click level gateways (100L, 200L, 300L, 400L, Postgraduate).
  - Carousel of recently verified past question papers.
- **Notice Board (`src/pages/NoticesPage.tsx`)**: Categorized announcements (`ASSON`, `Department`, `Faculty`, `University`) with pinned urgent Senate/resumption tray.
- **Opportunities Hub (`src/pages/OpportunitiesPage.tsx`)**: Scholarship and internship board with eligibility filters, deadline countdown tags, and application links.
- **FAQ Accordion (`src/pages/FaqPage.tsx`)**: Interactive accordion covering academic grading, past question downloads, and portal policies.
- **Student Dashboard (`src/pages/DashboardPage.tsx`)**: Personal matriculation profile, saved bookmarks tray, and peer contribution status tracker (`Under Review`, `Approved`, `Changes Requested`).
- **Admin & Moderation Console (`src/pages/AdminPage.tsx`)**: Vetting pipeline for ASSON executives to approve or request changes on student submissions, plus a platform audit log table.

### 4.4 Data Layer Architecture (`src/lib/supabase.ts`)
- **Dual-Layer Resilient Fetching**:
  - Connects to Supabase with the publishable key.
  - Implements snake_case to camelCase data mappers for all tables (`mapDbResourceToModel`, `mapDbNoticeToModel`, `mapDbOpportunityToModel`, etc.).
  - If the network fails or keys are unset, it gracefully serves the verified mock seed dataset (`src/lib/mockData.ts`), guaranteeing **zero blank screens and 100% uptime**.

### 4.5 Git & Repository Status
- Git repository initialized on the `main` branch.
- Initial commit created: `c986dec` (`feat: complete initial release of ASSON UI student platform (v1.0)`).
- Environment files (`.env`), database passwords, build artifacts (`dist/`), and `node_modules` are excluded via `.gitignore`.

---

## 5. File Structure Quick Reference

```
asson_website1/
├── what_i_have_done.md          # THIS HANDOVER FILE
├── README.md                    # Public GitHub documentation
├── project_idea.md              # Original specification v1.0
├── gemini.md / GEMINI.md        # Core engineering rules & standards
├── package.json                 # Dependencies and scripts
├── .env                         # Local environment variables (DO NOT COMMIT)
├── .env.example                 # Safe environment template
├── public/
│   └── logo/
│       ├── asson_logo.png       # Primary ASSON seal (cropped, transparent)
│       └── ui_crest.jpg         # UI Crest affiliate mark
├── src/
│   ├── components/
│   │   ├── features/resources/  # 3-Pane Explorer, Command Palette, Modals
│   │   ├── layout/              # Navbar, Footer, MobileNav
│   │   └── ui/                  # Button, Badge, Input, Modal primitives
│   ├── lib/
│   │   ├── supabase.ts          # Supabase client & live fetch services
│   │   ├── mockData.ts          # Seed catalog & fallback dataset
│   │   └── utils.ts             # Date, formatting, and file size helpers
│   ├── pages/                   # All 7 core views
│   └── types/                   # Unified domain definitions
└── supabase/
    ├── migrations/              # Initial SQL migration (11 tables, RLS)
    └── seed.sql                 # Seed SQL data
```

---

## 6. How to Resume on a New Laptop

If you pull this project onto a new machine, follow these steps to resume immediately:

### Step 1: Clone Repository
```bash
git clone https://github.com/emmanuelikeh2993/asson_website.git
cd asson_website
```

### Step 2: Install Node.js & Dependencies
Ensure Node.js 18+ or 22+ LTS is installed:
```bash
npm install
```

### Step 3: Configure Environment Variables
Create a `.env` file in the project root:
```env
VITE_SUPABASE_URL=https://cvhjohbknghlmspoaenr.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_NMsNixFSbQvLjqXtGpHgxA_uuaBD7w5
VITE_APP_NAME="ASSON UI"
VITE_APP_URL=http://localhost:3000
```

### Step 4: Run Development Server
```bash
npm run dev
```
The application will run at **`http://localhost:3000`** and immediately connect to the live Supabase database.

### Step 5: Verify Production Build
```bash
npm run build
```
Confirms 0 TypeScript or packaging errors.

---

## 7. Immediate Next Steps / Roadmap

1. **Production Deployment**:
   - Deployed and live at:
     - Vercel: `https://asson-ui.vercel.app`
     - Netlify: `https://asson-ui.netlify.app`
   - Git repository: `https://github.com/emmanuelikeh2993/asson_website.git` (`main` branch)

---

## 8. Progress Log & Security Hardening (Session: Nov 6, 2026)

### 8.1 V2 Directive Implementation
- **Zero Dummy Data Mandate**: Purged all fabricated mock records across the public catalog, notices, opportunities, and analytics. Only genuine academic uploads, verified curriculum data, and approved student submissions are shown.
- **Academic Legal Pages**:
  - Built Terms of Academic Contribution at `/terms`.
  - Built Student Privacy Policy at `/privacy`.
  - Embedded required agreement links in the 3-step upload modal.
- **Obfuscated Admin Gateway**:
  - Removed all public links to `/admin` from the navigation bar, mobile drawer, and footer.
  - Implemented an inconspicuous secret dot gateway in the footer (`Footer.tsx`) that links directly to `/console`.
- **Upload Flow Redesign (Dribbble-Inspired 3-Step Wizard)**:
  - Step 1: Course selection with live search, level pills, and quick suggestion chips.
  - Step 2: Material category cards and academic session selector.
  - Step 3: Clean drag-and-drop file upload with Terms/Privacy confirmation check.

### 8.2 Security Audit & Hardening (from `Security For Vibe-Coded Apps (- Prompt).docx`)
- **Patched Authentication Backdoors**:
  - Completely removed the keyword matching check (`asson`, `admin`, `2026`, `exco`) in `src/lib/supabase.ts`.
  - Deleted the 1-click executive demo session button in `src/pages/AdminPage.tsx`.
  - Added cryptographic session verification on mount with `supabase.auth.getUser()` in `src/pages/AdminPage.tsx` so `sessionStorage` cannot be manipulated to access admin controls.
- **Upload Security**:
  - Removed dangerous `'application/octet-stream'` fallback in `SubmitResourceModal.tsx`.
  - Enforced strict double-check on file extension and approved MIME types (`application/pdf`, `.docx`, `.zip`).
- **Build Hardening**:
  - Disabled sourcemaps in production (`build: { sourcemap: false }`) in `vite.config.ts`.
  - Configured security headers (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Content-Security-Policy`).
  - Added startup environment validation in `src/main.tsx`.
- **Database RLS Hardening**:
  - Created migration `20261106010000_audit_events_policy.sql` adding insert policy for audit events and nullable user IDs for anonymous contributions.

### 8.3 PWA Splash Screen & Crispy Logo Upgrade
- Replaced the blurry splash screen icon with high-resolution assets generated directly from the user's crisp ASSON crest image (`icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png`).
- Set `background_color` and `theme_color` in `public/manifest.json` to `#000000` to eliminate blurry white splash borders.
- Bumped PWA service worker cache to `asson-ui-cache-v4` in `public/sw.js`.

### 8.4 Verification & Live Status
- `npm run build` ran with 0 errors (built in 5.74s, 1663 modules transformed).
- Commit `7a7d513`: Security hardening (auth backdoor removal, RLS audit policy, PWA splash screen fix).
- Commit `7305e5e`: External audit resolution (robots.txt, sitemap.xml, Open Graph / WhatsApp sharing cards, route aliases, table accessibility, and ErrorBoundary).
- Live endpoints returning HTTP 200 OK:
  - `/robots.txt` verified live.
  - `/sitemap.xml` verified live.
  - Social share preview cards active.
  - Route aliases (`/submit`, `/library`, `/grants`, `/get-help`) active.

### 8.5 Manifest 2 Batch 1 & Mobile App Experience (Commit `b7d444c`)
- **Full Screen Standalone App Experience (PWA)**:
  - Enabled `"display": "standalone"` and `"display_override": ["window-controls-overlay", "standalone", "minimal-ui"]` in `public/manifest.json`.
  - Added home screen launcher shortcuts for Past Papers, Calendar, and Notices.
  - Added full mobile standalone meta tags in `index.html` (`mobile-web-app-capable`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style: black-translucent`, and dual theme colors matching light/dark modes).
  - Designed in-app "Install App" triggers and step-by-step guidance for iOS/Safari and Android/Chrome.
- **Orderly Preferences & Settings (WhatsApp / Telegram / Claude Aesthetic)**:
  - Built grouped, uncluttered settings panel in `SettingsModal.tsx`:
    - Appearance & Theme: Light / Dark / System segmented toggle.
    - Full Screen Standalone App status & 1-tap installation.
    - Academic Level Focus selector (100L–400L / Postgraduate).
    - Campus Data Saver toggle for low mobile bandwidth on UI campus networks.
    - Offline past question storage manager with cache clearance.
    - Student Study Locker account view & sign out.
    - Legal compliance (Terms, NDPA privacy, ASSON build version).
- **Shareable Resource URLs (`/resources/:id` & `/past-questions/:id`)**:
  - Implemented dedicated shareable view with dynamic title metadata.
  - Direct 1-click WhatsApp share button (`api.whatsapp.com/send?text=...`).
  - Instant download, copy link with confirmation, and bookmarking.
- **Academic Calendar CMS & Student Schedule (`/calendar`)**:
  - Built interactive Calendar page with Agenda list view and Month calendar view.
  - Filter by category (Continuous Assessment, Examination, Milestones, Events) and level.
  - Built complete Admin Calendar CMS tab in `AdminPage.tsx` with modal for scheduling CA tests and exam dates.
- **Embedded In-Notice RSVPs (`/notices`)**:
  - Embedded dates, times, venues, and 1-click RSVP registration directly into departmental announcements (preventing navigation clutter).
- **Automated Verification**:
  - Unit tests established with Vitest in `src/__tests__/app.test.ts` (all 3 tests passing).
  - Production build compiled cleanly with 0 TypeScript errors.




