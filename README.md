# ASSON UI — Academic Resource & Student Platform

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)

Official academic resource engine, past examination repository, notice board, and opportunities platform for the **Association of Statistics Students of Nigeria (ASSON)**, University of Ibadan Chapter.

> **Motto**: *Facts from Reliable Figures*  
> **Official Student Portal**: [https://student-portal.ui.edu.ng/login](https://student-portal.ui.edu.ng/login)  
> **Official Instagram**: [@asson_unibadan](https://www.instagram.com/asson_unibadan/)  
> **Live Production (Primary)**: [https://asson-ui.vercel.app](https://asson-ui.vercel.app)  
> **Live Production (Mirror)**: [https://asson-ui.netlify.app](https://asson-ui.netlify.app)  
> **Architecture & Governance Docs**: See [`docs/`](docs/) for the verified reality audit, security findings, hosting map, and V2 roadmap.

---

## 🌟 Key Features

1. **3-Pane Academic Resource Explorer**:
   - Hierarchical course directory for 100L through 400L and Postgraduate courses (`STA 111` – `STA 701`).
   - Unified filterable catalog: Past examination questions, approved lecture notes, tutorial sheets, and syllabi.
   - Live metadata preview drawer with one-click direct file downloads (no sign-up wall for students).

2. **Global Command Palette (`Ctrl+K` or `/`)**:
   - Instant search across all course codes, examination sessions, and topic summaries from any page.

3. **Departmental Notice Board**:
   - Categorized announcements (`ASSON`, `Department`, `Faculty`, `University`).
   - Pinned tray for urgent Senate decisions, academic calendars, and course registration deadlines.

4. **Opportunities & Career Hub**:
   - Verified undergraduate scholarships (MTN Science & Technology, Federal BEA awards, etc.) with deadline countdown badges.
   - Quantitative internship and SIWES placements for Statistics students.

5. **Student Dashboard & Submission Tracker**:
   - Personal dashboard with matriculation profile, bookmark tray, and peer contribution tracker.
   - Status tracking badges for uploaded materials: `Under Review`, `Approved`, `Changes Requested`.

6. **Admin & Moderation Console**:
   - Editorial verification pipeline for ASSON executives to approve or request revisions on uploaded papers.
   - Audit event logging table tracking administrative actions with timestamps and user emails.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, TanStack Query
- **Routing**: React Router v6
- **Database & Storage**: Supabase (PostgreSQL 15+, Row Level Security, Storage Buckets, Trigram Search)
- **Validation**: Zod + React Hook Form
- **Build Tool**: Vite 6

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ or 22+ LTS
- npm 9+ or pnpm

### 2. Clone Repository & Install
```bash
git clone https://github.com/emmanuelikeh2993/asson_website.git
cd asson_website
npm install
```

### 3. Environment Variables
Copy the example environment file and configure your Supabase project keys:
```bash
cp .env.example .env
```
Fill in your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
VITE_APP_NAME="ASSON UI"
VITE_APP_URL=http://localhost:3000
```

### 4. Database Setup
Execute the following SQL scripts in your Supabase SQL Editor:
1. `supabase/migrations/20261104000000_initial_schema.sql` (Tables, RLS policies, enums, triggers)
2. `supabase/migrations/20261106000000_v2_security_and_submissions.sql` (Anonymous submissions, Private Feedback, Help Directory)
3. `supabase/seed.sql` (Curriculum courses `STA 111`–`STA 701`, verified past questions, notices)

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
├── public/
│   ├── logo/
│   │   ├── asson_logo.png       # Primary ASSON brand seal
│   │   └── ui_crest.jpg         # University of Ibadan affiliate crest
├── src/
│   ├── components/
│   │   ├── features/resources/  # Explorer table, preview drawer, upload & report modals
│   │   ├── layout/              # Navbar (dual logos & search), Footer, MobileNav
│   │   └── ui/                  # Button, Badge, Modal, Input primitives
│   ├── lib/
│   │   ├── supabase.ts          # Supabase client & resilient data services
│   │   ├── mockData.ts          # Seed data and fallback datasets
│   │   └── utils.ts             # Date, formatting, and file size helpers
│   ├── pages/                   # Home, Resources, Past Questions, Notices, Opps, Dashboard, Admin
│   └── types/                   # Unified TypeScript domain definitions
├── supabase/
│   ├── migrations/              # PostgreSQL schema migrations
│   └── seed.sql                 # UI Statistics department course & resource seed
└── package.json
```

---

## 🔒 Security & Privacy

- All sensitive secrets (database passwords and secret keys) are excluded from git via `.gitignore`.
- Row Level Security (RLS) is enabled on all tables in Supabase.
- Only vetted materials marked `verification_status = 'Verified'` are publicly accessible.

---

## 📄 License & Attribution

Designed and developed for the **Association of Statistics Students of Nigeria (ASSON)**, University of Ibadan Chapter.  
© 2026 ASSON Unibadan Chapter. All Rights Reserved.

