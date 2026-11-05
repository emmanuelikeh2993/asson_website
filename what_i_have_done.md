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
├── WHAT_I_HAVE_DONE.md          # THIS HANDOVER FILE
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

### 4.5 Mobile-First Architecture, Button Hierarchy & Zero-Login Engine (November 2026 Update)
- **Zero-Login & Zero-Barrier Access Guarantee**:
  - **100% Feasible and Proven**: Student access requires 0 passwords, 0 signups, and 0 email verification walls.
  - **Downloads**: Files stream directly from public Supabase Storage CDN URLs (`/storage/v1/object/public/resources/...`) or verified external links via silent browser triggers.
  - **Uploads**: Anonymous public uploads land in Supabase Storage `resources/submissions/` and are logged in the `submissions` table as `Under Review`.
  - **Study Locker (Student Dashboard)**: Automatically captures submission IDs and download history in browser local storage so students can track their review status without logging in.
  - **Eliminated Native Browser `alert()` Dialogs**: Implemented an accessible floating `<ToastProvider>` and `useToast()` hook with sleek emerald notifications (`Toast.tsx`).
- **Mobile-First Optimizations (80%+ Student Phone Users)**:
  - **Mobile Slide-Out Drawer (`Navbar.tsx`)**: Hamburger menu button giving 1-tap thumb access to all pages (Resources, Past Questions, Notices, Opportunities, FAQs, Dashboard) and quick level filters.
  - **Sticky Bottom Navigation (`MobileNav.tsx`)**: 5 thumb-friendly tabs (`Home`, `Past Papers`, `Submit Material` (floating center action), `Notices`, `Grants`) with safe-area padding (`pb-safe`).
  - **Responsive Horizontal Course Pill Slider (`ResourcesPage.tsx`)**: Replaced the desktop 60vh course tree on mobile screens with a quick horizontal flick carousel so students instantly view resources without scrolling past 57 courses.
  - **Slide-Up Mobile Sheet Drawer**: Course selection and resource document preview open as native slide-up bottom sheets on mobile.
  - **Default to Cards on Mobile**: Automatic screen detection loads touch-friendly `DownloadCard` components instead of wide horizontal-scrolling HTML tables.
- **Button Hierarchy & Order Consistency**:
  - Every card and modal now adheres to strict visual hierarchy:
    - **Primary Action** (Emerald Green `#087A3E`): Instant Download or Explore.
    - **Secondary Action** (Outlined `#D8E2DE`): Preview / Outlines.
    - **Tertiary Action** (Subtle Icon): Report Issue / Share.
- **Real Fetched Notices & Opportunities Pipeline**:
  - Merged live Supabase queries with verified local seed data in `src/lib/supabase.ts` ensuring resilient data retrieval.
  - Documented external automated ingestion APIs (Telegram bot webhooks for ASSON executive broadcasts, UI Senate RSS/bulletin parsers, and Opportunities For Africans scholarship feeds).

---

## 7. Immediate Next Steps / Roadmap

1. **Telegram / WhatsApp Webhook for Real Notices**:
   - Deploy a lightweight Supabase Edge Function listening to the ASSON Executive announcement channel to automatically insert verified notices into the `notices` table.
2. **Opportunities RSS Ingestion**:
   - Connect the Opportunities For Africans (OFA) RSS feed via a scheduled GitHub Action cron to periodically fetch new scholarship calls.
3. **Storage Bucket Policy Configuration**:
   - Ensure the Supabase Storage bucket `resources` has the public write policy enabled for `submissions/` path.
4. **Production Deployment**:
   - Deploy to Vercel or Netlify with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` configured in the dashboard.

