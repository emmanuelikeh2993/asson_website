# ASSON UI — V1 Reality Audit & Comprehensive Codebase Assessment

> **Document Type**: Codebase & Architecture Reality Audit  
> **Repository**: `https://github.com/emmanuelikeh2993/asson_website`  
> **Branch Audited**: `main` (commit `295c6cc`)  
> **Directive Reference**: `ASSON_UI_V2_Implementation_Directive.pdf` (Section 3)  
> **Date**: November 2026  
> **Status**: Completed Read-Only Audit — Awaiting Project Owner Approval Before Implementation  

---

## 1. Executive Summary

This audit establishes the ground truth of the **ASSON UI Student Platform (v1.0)** codebase. It verifies what is genuinely functional, what is backed by live cloud infrastructure, what relies on mock fallbacks or browser storage, and why user reviewers reported the interface as **"noisy and cluttered."**

### Key Takeaways:
1. **Core Reading Experience Works**: Public browsing, searching by course code (e.g. `STA 211`, `STA 231`), document previewing via Google Docs/PDF viewers, and direct downloads are functional.
2. **Architecture Disconnect Between Frontend & Backend**: The database schema in `supabase/migrations/20261104000000_initial_schema.sql` was written with strict Supabase Auth (`auth.uid()`) and role-based policies (`has_role('editor')`). However, the frontend operates in a **zero-login mode** for students and uses a **client-only PIN gate** for administrators. Consequently, privileged operations fail silently on the backend and fall back to browser `localStorage`.
3. **UI Noise / Clutter Root Cause Identified**: The landing page currently packs **9 distinct sections**, **2 competing navigation bars** (sticky top + bottom tab bar), **4 simultaneous search/jump triggers**, and marketing statistics that obstruct students from their primary job: finding academic resources in under 5 seconds.
4. **Dual Production Deployments are Live**: Both Netlify (`asson-ui.netlify.app`) and Vercel (`asson-ui.vercel.app`) are active and serving the application correctly.

---

## 2. Repository & Application Architecture

### 2.1 Technology Stack & Versions
- **Frontend Framework**: React `18.3.1` (Vite `6.0.1`, `@vitejs/plugin-react` `4.3.4`)
- **Language**: TypeScript `5.6.3` (Strict mode enabled, target `ES2020`)
- **Routing**: `react-router-dom` `6.28.0`
- **Styling**: Tailwind CSS `3.4.16`, PostCSS `8.4.49`, Autoprefixer `10.4.20`
- **Component Libraries**: Lucide React `0.468.0`, clsx `2.1.1`, tailwind-merge `2.5.5`
- **Form & Validation**: React Hook Form `7.54.0`, Zod `3.24.1`
- **Async State**: TanStack React Query `5.62.0` (installed, lightly used)
- **Database Client**: `@supabase/supabase-js` `2.118.0`
- **Testing**: Vitest `2.1.8` (installed)

### 2.2 Directory Structure & Responsibilities
- `src/components/layout/`: Global navigation shell (`Navbar.tsx`, `MobileNav.tsx`, `Footer.tsx`, `InstallPwaPrompt.tsx`).
- `src/components/features/resources/`: Academic resource listing, filtering, tables, preview modals, and submission drawer.
- `src/components/features/admin/`: Admin telemetry line charts (`AnalyticsChart.tsx`) and course demand ranking (`CourseDemandLeaderboard.tsx`).
- `src/components/features/home/`: Landing page FAQ accordion (`LandingFaqSection.tsx`).
- `src/components/ui/`: Reusable primitives (`Button`, `Input`, `Badge`, `Modal`, `Toast`, `Skeleton`).
- `src/lib/`: Backend client (`supabase.ts`), zero-login download trigger (`download.ts`), fallback data (`mockData.ts`), and formatters (`utils.ts`).
- `src/pages/`: 8 routed views (`HomePage`, `ResourcesPage`, `PastQuestionsPage`, `NoticesPage`, `OpportunitiesPage`, `FaqPage`, `DashboardPage`, `AdminPage`).
- `supabase/`: Initial SQL migration (`20261104000000_initial_schema.sql`) and sample seed (`seed.sql`).

---

## 3. Page & Feature Inventory

Every route and feature was inspected and classified according to the directive's status criteria:

| Route / Feature | Purpose | Access | Data Source | Status | Audit Findings & Mobile Behaviour |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`/` (HomePage)** | Public entry, quick search, announcements, gateways, FAQs | Public | Supabase (`fetchResources`, `fetchNotices`) with mock fallback | **Partially Working** | High visual clutter on mobile. Too many stacked elements (pills, search, stat boxes, gateways, featured cards) before reaching core content. |
| **`/resources`** | Master catalog for notes, outlines, tutorials, practicals | Public | Supabase `resources` & `courses` tables + mock fallback | **Working** | Debounced search, course filter slider, level filters, grid/table toggle, and document preview work properly. |
| **`/past-questions`** | Filtered view for examination past questions | Public | Same as `/resources` with `initialType="Past Question"` | **Working** | Reliable filtering. Direct PDF preview modal works via Google Docs / native embed. |
| **`/notices`** | Departmental & ASSON official notices, senate updates | Public | Supabase `notices` table + mock fallback | **Working** | Category filtering, urgent notice badges, and Web Share API work properly. |
| **`/opportunities`** | Scholarships, internships, and grants board | Public | Supabase `opportunities` table + mock fallback | **Working** | Authentic listings (MTN Foundation, Moniepoint SIWES, Chevron, KPMG). External URLs functional. |
| **`/faqs`** | Academic FAQ accordion | Public | Supabase `faqs` table + mock fallback | **Working** | Clean collapsible accordion. Also mirrored on landing page. |
| **`/dashboard`** | Student Study Locker | Public (Local) | Browser `localStorage` (`asson_downloads`, `asson_submissions`) | **Working** | Zero-login persistence of downloaded materials and submitted reference receipts works cleanly per device. |
| **`/admin`** | Executive telemetry, moderation, and audit logs | Restricted (PIN) | Supabase + `localStorage` | **Visual Only (Privileged)** | The gate is client-side only (`sessionStorage.getItem('asson_admin_authenticated')`). Privileged database updates fail on Supabase and fall back to `localStorage`. |
| **Submit Modal** | Student material upload workflow | Public | Supabase Storage (`resources` bucket) + `submissions` | **Partially Working** | Uploads file to Supabase storage when permissions permit; records submission locally, but backend DB insert fails if unauthenticated. |
| **Document Preview** | Preview PDF / document before downloading | Public | Google Docs Viewer / Native iframe | **Working** | Embedded preview opens in modal / bottom sheet without forcing immediate download. |
| **Command Palette** | Quick global search (`⌘K` or `/`) | Public | In-memory catalog search | **Working** | Fast, keyboard-accessible on desktop; search button triggers on mobile. |

---

## 4. Why Reviewers Find the App "Noisy / Cluttered"

Reviewers and students accurately identified visual clutter. A clinical breakdown of the current landing page and mobile experience reveals four primary design defects:

```
+-------------------------------------------------------------+
| CURRENT MOBILE HOME SCREEN (CLUTTERED)                      |
| [Sticky Top Navbar: 2 Logos, Title, Search, Submit, Menu]   |
| [PWA Install Notification Banner]                           |
| [Hero: Green Gradient + Dot Grid Pattern]                   |
|   - "Association of Statistics Students..." Pulse Badge     |
|   - "Together for Academic Excellence" (Large H1)           |
|   - Subtitle paragraph                                      |
|   - Quick Jump Pills: 100L | 200L | 300L | 400L | PG        |
|   - Search Input Bar + CMD-K + "Search" green button        |
|   - Trending Tags: STA 111 | STA 211 | STA 231 | MAT 121    |
|   - [Button: Explore Past Questions] [Button: Submit]       |
|   - 4 Stat Boxes: 625+ Docs | 57 Courses | 100% Free | 0 Login|
| [Urgent Banner: "Read it please." overlapping hero]         |
| [Academic Gateways: 3 Huge Bento Cards]                     |
| [Featured Questions: 4 Download Cards]                      |
| [Official Notices Section]                                  |
| [FAQ Accordion Section]                                     |
| [Footer]                                                    |
| [Sticky Bottom Mobile Bar: 5 Buttons + Floating Center Plus]|
+-------------------------------------------------------------+
```

### 1. Viewport Cannibalization (Double Chrome on Mobile)
On a mobile device (where $\ge 80\%$ of UI students access the portal), the sticky top navbar occupies **64px** and the fixed bottom navigation bar occupies **60px**. When combined with the floating PWA install banner and the urgent announcement box, **over 35% of the mobile screen is occupied by persistent navigation chrome**, leaving very little room for actual academic content.

### 2. Four Redundant Jump Triggers
A student landing on the home page is immediately confronted with four competing navigation mechanisms in the same 400px vertical space:
1. Quick Jump level pills (`100L`, `200L`, `300L`, `400L`)
2. Primary search bar
3. Trending course tags (`STA 111`, `STA 211`, `STA 231`...)
4. Two large CTA buttons (`Explore Past Questions`, `Submit Material`)

### 3. Marketing Metrics Block
The 4-box statistics grid (*"625+ Catalogued Materials"*, *"57 Departmental Courses"*, *"100% Free Instant Access"*, *"Zero Login Walls"*) is SaaS marketing copy. Students already know the site is free; the stat cards push the actual past questions down below the fold.

### 4. Competing Visual Elements
Simultaneous glowing gradients, pulsating dots, dot-grid overlays, urgent red warning cards, elevated cards, and floating pill badges compete for visual dominance.

### Recommended De-Cluttering Plan (To be implemented upon approval):
1. **Unify Mobile Navigation**: Keep a clean, compact top navbar with title and search trigger; eliminate redundant floating CTAs that overlap content.
2. **Streamline the Hero**: Present one clear, authoritative search bar with clean level selector chips directly integrated below it. Remove SaaS metric boxes and duplicate button stacks.
3. **Bring Materials Above the Fold**: Allow students to see and filter actual course documents within 1 scroll.
4. **Restrain Colour & Animation**: Follow the Academic Precision philosophy — high-contrast slate text on white surfaces, restrained academic emerald accents, and zero decorative pulses or glows.

---

## 5. Discrepancies Between Documentation & Reality

| Handover / Directive Claim | Actual Code Reality | Severity |
| :--- | :--- | :--- |
| Handover claimed 13 database tables are actively populated | Tables exist in migration schema, but frontend only queries 5 tables (`resources`, `courses`, `notices`, `opportunities`, `faqs`). The remaining tables (`submissions`, `content_reports`, `audit_events`, `bookmarks`, `site_settings`) are either unpopulated or blocked by RLS policies. | Medium |
| Handover claimed 625 verified documents in Supabase | 625 documents exist in `MOCK_RESOURCES` inside `src/lib/mockData.ts`. If Supabase credentials are missing or the connection fails, the frontend seamlessly serves these 625 records. However, in the Supabase cloud database, live counts depend on whether the ingestion script was executed with service-role permissions. | Low (Graceful fallback) |
| Handover claimed Admin Console is protected by Executive Passkey | Gated strictly by frontend JavaScript (`sessionStorage.getItem('asson_admin_authenticated') === 'true'`). Any visitor can bypass this via browser dev tools or by browsing to `/admin`. Privileged database updates do not carry an executive JWT, causing Supabase RLS to reject them. | **High (Security)** |
| Handover claimed anonymous student submissions are stored in database | The `submissions` table has a foreign key `user_id UUID REFERENCES auth.users(id) NOT NULL` and RLS `WITH CHECK (auth.uid() = user_id)`. Unauthenticated student submissions cannot satisfy this policy and fall back to `localStorage`. | **High (Data Flow)** |

