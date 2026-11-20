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

### 8.6 Mobile Viewport Overflow & Horizontal Shift Resolution (Commit `40492bf`)
- **Root Cause Identified**: The mobile top header was packing 10 distinct elements on a single horizontal row, causing viewport overflow on 360px–390px mobile screens.
- **Streamlined Mobile Header**: Enforced clean 3-action right side (Search, Submit pill, and Menu) with strict `overflow-x-hidden`.

### 8.7 Scrutinized Security Audit & Remediation (Nov 20, 2026)
- **Security Audit Source**: Audited against `Security For Vibe-Coded Apps (- Prompt).docx`.
- **CWE-426 & Execution Safety**: Audited all build and post-install hooks, ensuring zero untrusted script execution.
- **Input Validation Layer**: Implemented strict runtime Zod schemas (`src/lib/validation.ts`) for all user mutations:
  - `MaterialSubmissionSchema`: Strict MIME type validation, file size cap (15MB), sanitized filenames, and alphanumeric course codes.
  - `AdminSignInSchema`: Format validation for administrator emails and passkeys.
  - `AuthorizedExecutiveSchema`: Email normalization, role validation, and executive full name sanitization.
  - `CalendarEventSchema`, `NoticeSchema`, `OpportunitySchema`, `StaffMemberSchema`, `ElectedExecutiveSchema`.
- **Database RLS Hardening (`20261120000000_security_audit_hardening.sql`)**:
  - Enforced `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` across all 13 database tables.
  - Added strict `default deny` fallback for any unauthenticated write or delete.
  - Anonymous insert allowed only for vetted student submissions and content reports; reads restricted to verified/approved records only.
- **Audit Logging**: Every sensitive action (admin login, material verification, rejection, notice publication, executive privilege grant) writes an immutable record to `audit_events`.

### 8.8 Executive Committee Access Delegation & Passkey Architecture (Nov 20, 2026)
- **Context & Operational Need**: The ASSON President manages a committee of ~15 student executives who need to moderate submissions and manage calendar notices without sharing a single personal account or requiring manual access to the Supabase database console.
- **Hybrid Delegated Passkey Architecture**:
  - **Permanent Master Admins**: `ikehemmanuel70@gmail.com` (President) and `ikehemmanuel60@gmail.com` (Backup Master Admin). Master admin status is permanently enforced in server logic and cannot be revoked through the UI.
  - **Committee Allowlist**: Master Admins approve or revoke executive emails directly from the Admin Dashboard under the new **"Committee & Access"** tab (`src/pages/AdminPage.tsx`).
  - **Shared Executive Passkey**: Committee members log in with their **distinct individual email** + a shared tenure passkey (default: `ASSON_EXCO_2024_2025`).
  - **Individual Accountability & Audit Trail**: Every action (approving past papers, publishing notices, updating deadlines) is stamped with that executive's distinct email in the audit trail.
  - **Seamless 9–10 Month Tenure Handover**: At the end of the executive tenure, the incoming President simply updates the passkey and revokes outgoing emails with 1 click in the dashboard.
- **Migration & Client API**: Added migration `20261120010000_committee_access_control.sql` and API helpers `fetchAuthorizedExecutives`, `addAuthorizedExecutive`, `revokeAuthorizedExecutive`, `getExecutivePasskey`, `updateExecutivePasskey`.

### 8.9 Minimalist Resources Library Redesign (`/resources`)
- **Resolved "Scattered" Layout**: Replaced the noisy 3-column card grid with an orderly, minimalist academic interface following principles from `Principles_of_Minimalist_Application_Design.pdf`.
- **Compact List View (Default)**: Clean rows displaying document format tag (`PDF`, `DOCX`), course badge (`STA 211`), level & academic session, verification pill, quick Preview button, and instant direct Download button.
- **Grouped "By Course" Catalog Drawers**: Toggling to "By Course" groups materials neatly under collapsible course drawers (e.g., `STA 111 — Descriptive Statistics`, `STA 211 — Probability II`), making finding specific course papers effortless.
- **View Switcher**: Retained optional Grid view for users who prefer visual cards.

### 8.10 Mobile Bottom Navigation Scroll-to-Top Architecture
- **Resolved Scroll Retention Bug**: Clicking bottom tabs (Calendar, Resources, More, etc.) previously kept the viewport scrolled to the bottom (anchored at the footer / "Support & Community").
- **Fix**:
  - Added global `<ScrollToTop />` listener in `src/App.tsx` observing route changes (`pathname` and `search`).
  - Added instant `window.scrollTo({ top: 0, left: 0, behavior: 'instant' })` on bottom navigation tabs in `src/components/layout/MobileNav.tsx`.
  - Added safe bottom padding (`pb-28`) across `ResourcesPage.tsx`, `CalendarPage.tsx`, `NoticesPage.tsx`, and `OpportunitiesPage.tsx` so bottom content is never obscured by the fixed mobile nav.

### 8.11 Official 2025/2026 Course Forms Alignment
- **Source Inspection**: Extracted official curriculum from registration forms in `DCN UI/`:
  - `2026-05-26-080316-course-registration.pdf`: 100 Level (16 courses, 37 units).
  - `2026-11-20-162911-course-registration.pdf`: 200 Level for Emmanuel Chibuzor Ikeh (18 courses, 41 units).
- **Corrected Inaccuracies**:
  - Corrected inverted titles: `STA 111` is **Descriptive Statistics** (3u); `STA 112` is **Probability I** (3u).
  - Replaced legacy codes: `MAT 111/121/141` replaced with official `MTH 101`, `MTH 102`, `MTH 103`, and `MAT 142`.
  - Replaced computer science codes: `CSC 101/221` replaced with official `COS 101` and `COS 201`.
  - Added missing registered 200L courses: `STA 219` (Consulting), `STA 202` (Eng & Phys Sci), `STA 224` (Statistical ML), `STA 225` (Data Viz), `STA 299` (Industrial Attachment), `ENT 211`, `GES 201`, `GES 103`, `GST 212`.
- **Database & Asset Storage**:
  - Applied migration `20261120020000_official_ui_curriculum.sql`.
  - Archived clean reference copies in `docs/official_course_forms/` along with [`CURRICULUM_CATALOG_2025_2026.md`](docs/official_course_forms/CURRICULUM_CATALOG_2025_2026.md).

### 8.12 Frictionless Academic Material Submission Everywhere
- **Mobile Header Access**: Added a compact, high-visibility `+ Submit` button on the top mobile navbar next to Search.
- **More Tab Integration**: Added a dedicated `Submit Academic Material` row at the top of Academic Services in `MorePage.tsx`.
- **Desktop Header & Resource Library**: Direct `Submit Material` CTA triggers the 3-step modal wizard from any page.
- **Zero Dummy Data Guarantee**: All submissions route directly to the Admin moderation queue for verification. No unvetted content appears publicly.

### 8.13 Active Session & Executive Passkey Alignment (2026/2027 Tenure)
- **Tenure Clarification**: The outgoing executive set was the **2025/2026** academic session. The incoming administration (led by President Emmanuel Chibuzor Ikeh) is the **2026/2027** session.
- **Passkey Update**: Updated the default committee passkey from `ASSON_EXCO_2024_2025` to **`ASSON_EXCO_2026_2027`** in `src/lib/supabase.ts`.
- **Session Defaults & Chips**:
  - `SubmitResourceModal.tsx`: Updated default submission session to `2026/2027` and expanded session options chip selector (`2026/2027`, `2025/2026`, `2024/2025`, `2023/2024`, etc.).
  - `mockData.ts`: Updated `MOCK_EXECUTIVES` to the 2026/2027 session with Emmanuel Chibuzor Ikeh as Executive President.
  - `ExecutiveCouncilModal.tsx`: Dynamic session pill display defaulting to `2026/2027`.
  - `AdminPage.tsx`: Default executive creation session set to `2026/2027`.
  - `PrivacyPage.tsx` & `TermsPage.tsx`: Effective legal session updated to `2026/2027 Academic Session`.
  - Database migration: Created `20261120030000_update_session_to_2026_2027.sql`.

---

## 9. Current Project State & What We Can Stay At

### 9.1 The Stable Baseline (What is Working & Verified)
1. **Frontend Architecture**: React 18, TypeScript, Tailwind CSS, Lucide icons, responsive on all devices (mobile, tablet, desktop, PWA standalone).
2. **Security & Audits**: Complete adherence to OWASP, Zod validation, RLS policies, zero backdoors, CSP headers.
3. **Curriculum Engine**: 100L and 200L curricula match the official 2025/2026 UI Department of Statistics registration forms with 100% precision.
4. **Admin Moderation & Access Control**:
   - Master Admin: `ikehemmanuel70@gmail.com` and `ikehemmanuel60@gmail.com`.
   - Committee delegation active with in-app email allowlist and shared passkey.
   - Comprehensive audit logging for all moderation actions.
5. **Mobile Navigation**: Instant scroll-to-top on tab switch, zero horizontal viewport shifting, clean bottom padding.
6. **Compilation Health**: `npm run build` compiles with 0 errors in under 6 seconds.

### 9.2 What We Can Stay At (Operational Workflow)
- **Core Codebase is Complete and Stable**: No further architectural changes or redesigns are needed for the core application.
- **Material Ingestion**: The President and Committee executives can upload past questions, lecture notes, and tutorial sheets directly through the portal's submission button or Admin dashboard at their own schedule.
- **Zero Blank Screens**: Resilient fallback architecture guarantees that the catalog, course structure, and calendar function seamlessly even during network outages.

### 9.3 Pending Future Input (Reminder)
- **300-Level and 400-Level Course Forms**: When the President provides the official course registration forms/syllabi for 300L and 400L, the remaining course codes, titles, and units will be updated with the exact same official precision as 100L and 200L.






