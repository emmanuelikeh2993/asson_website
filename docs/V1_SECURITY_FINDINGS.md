# ASSON UI — V1 Security Findings & Vulnerability Assessment

> **Document Type**: Security & Authorization Audit Report  
> **Repository**: `https://github.com/emmanuelikeh2993/asson_website`  
> **Directive Reference**: `ASSON_UI_V2_Implementation_Directive.pdf` (Sections 3.3, 3.4, 3.5, 7)  
> **Date**: November 2026  
> **Auditor**: Antigravity Principal Security Architect  
> **Status**: Completed Read-Only Audit — Awaiting Project Owner Approval Before Implementation  

---

## 1. Security Overview & Threat Model

The ASSON UI platform serves two distinct user classes with fundamentally different trust levels:
1. **Students (Public Consumers & Contributors)**: Access without authentication across cellular networks and campus Wi-Fi. Must have free, unhindered read access to public academic documents. Must be able to report issues or submit materials anonymously without leaking personal data or running unauthorized database mutations.
2. **ASSON Executives & Academic Editors**: Privileged users who approve submissions, publish official notices, modify course metadata, and access audit logs.

### Core Threat Boundaries:
- **Boundary A (Public Internet to Database)**: Can anonymous visitors modify public course or resource records? Can they read private student submissions or issue reports?
- **Boundary B (Storage Bucket Abuse)**: Can malicious visitors upload arbitrary executable files, HTML/JS payloads, or oversized files into Supabase storage?
- **Boundary C (Administrative Operations)**: Are privileged actions (`PUBLISH`, `DELETE`, `VERIFY`, `UPDATE_NOTICE`) cryptographically verified on the backend, or can a client bypass the UI gate?

---

## 2. Detailed Security Findings

### Finding 1: Frontend Client-Side Admin Gate (CRITICAL)
- **Severity**: **Critical (CVSS 8.5)**
- **Location**: `src/pages/AdminPage.tsx` (Lines 38–43, 67–77)
- **Mechanism**: The admin console relies on browser `sessionStorage`:
  ```typescript
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('asson_admin_authenticated') === 'true';
  });
  ```
  Access is granted if a user inputs a hardcoded passkey or empty input into a client-side form.
- **Impact**:
  1. Any user can set `sessionStorage.setItem('asson_admin_authenticated', 'true')` in their browser console and visually access the executive console.
  2. The shared passkey was previously documented in plaintext in a tracked file (`what_i_have_done.md`), rendering it compromised according to Section 3.5 of the directive.
- **Backend Consequence**:
  Because the client lacks a signed Supabase Auth JWT with administrative claims, any mutation attempts against Supabase tables protected by `has_role('editor')` are rejected by Postgres RLS, or silently fall back to `localStorage`.
- **Recommended Remediation**:
  1. Never use a client-side PIN as the sole defense.
  2. Implement proper Supabase Auth for executive roles (e.g. Magic Link email authentication or password-based executive login) where Supabase issues an authenticated session token.
  3. Enforce role checks inside Supabase RLS (`public.user_roles.role = 'editor' OR role = 'admin'`).
  4. Purge the exposed passkey from all documentation.

---

### Finding 2: Schema / RLS Disconnect on Anonymous Student Submissions (HIGH)
- **Severity**: **High (Functionality & Architectural Defect)**
- **Location**: `supabase/migrations/20261104000000_initial_schema.sql` (Lines 138–151, 288–290)
- **Mechanism**:
  The `submissions` table schema declares:
  ```sql
  CREATE TABLE public.submissions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      ...
  );
  CREATE POLICY "Students can insert submissions"
      ON public.submissions FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  ```
  However, the product requirement explicitly dictates **Zero Login for Students** (`auth.uid()` is `NULL` for anonymous public contributors).
- **Impact**:
  When an anonymous student attempts to submit a past paper through `SubmitResourceModal.tsx`, the remote database query fails RLS check `auth.uid() = user_id`. The application falls back to saving the submission in the student's browser `localStorage`, preventing central executive review.
- **Recommended Remediation**:
  1. Alter `submissions.user_id` to `UUID REFERENCES auth.users(id) NULL` (nullable for anonymous contributions).
  2. Add an anonymous submission reference tracking column: `reference_code TEXT NOT NULL UNIQUE` (e.g., `SUB-2026-XXXXX`).
  3. Create an RLS policy:
     ```sql
     CREATE POLICY "Allow anonymous submissions with valid payload"
         ON public.submissions FOR INSERT
         WITH CHECK (user_id IS NULL OR auth.uid() = user_id);
     ```
  4. Restrict `SELECT` on `submissions` so anonymous users cannot read each other's submissions, while allowing executives with `has_role('editor')` full review access.

---

### Finding 3: Unrestricted Public Storage Bucket Permissions (MEDIUM)
- **Severity**: **Medium (Storage Abuse & Integrity Risk)**
- **Location**: Supabase Storage Bucket `resources`
- **Mechanism**:
  The existing storage policy allows unrestricted public `INSERT` into the `resources` bucket:
  ```sql
  CREATE POLICY "Allow public uploads into resources bucket"
      ON storage.objects FOR INSERT TO public
      WITH CHECK (bucket_id = 'resources');
  ```
- **Impact**:
  1. Anyone with the Supabase anon key can upload arbitrary files directly to `resources` without moderation.
  2. Malicious users could upload executable scripts, HTML files (leading to Stored XSS if served directly), or spam files that consume free-tier storage quotas.
- **Recommended Remediation**:
  1. Enforce strict MIME-type and extension restrictions at the storage policy level:
     ```sql
     AND (storage.extension(name) IN ('pdf', 'docx', 'zip'))
     ```
  2. Implement a two-folder storage structure:
     - `submissions/`: Where unvetted public uploads land in a quarantined state.
     - `published/`: Read-only public downloads, populated only when an editor approves a submission.
  3. Keep the 15MB file size limit enforced.

---

### Finding 4: Content Reports & Privacy Safeguards (MEDIUM)
- **Severity**: **Medium (Privacy & Data Governance)**
- **Location**: `supabase/migrations/20261104000000_initial_schema.sql` (Lines 154–163, 296–298)
- **Mechanism**:
  Policy `Anyone can report an issue` allows unrestricted `INSERT` into `content_reports`.
  However, the schema lacks explicit policies for the planned **Private Feedback Centre / Welfare Submissions** (Section 5.4 of the directive).
- **Impact**:
  If private student welfare concerns, exam grievances, or feedback records are inserted into public tables or queried by generic client queries, sensitive student data could be exposed.
- **Recommended Remediation**:
  1. In Release 1, create a dedicated `feedback_submissions` table with strict private RLS:
     - Public can `INSERT` (write-only).
     - Only verified Welfare Board / Executive members (`has_role('admin')` or `has_role('welfare')`) can `SELECT`.
     - Zero anonymous read access.
  2. Ensure welfare records are strictly excluded from all public search indexes, analytics charts, and future AI retrieval pipelines.

---

### Finding 5: Environment Variables & Secrets Handling (PASS / LOW RISK)
- **Severity**: **Informational / Passing**
- **Inspection Findings**:
  - The repository contains `.env.example` with safe placeholder keys.
  - The actual `.env` file is listed in `.gitignore` and is NOT tracked in Git.
  - The Supabase key in `.env` is the public `anon` / `publishable` client key (`sb_publishable_...`), which is intended for browser use and safe when backend RLS is properly enforced.
  - No Supabase `service_role` secret or database administrative password exists in the frontend codebase.

---

## 3. Prioritized Security Remediation Order

Before implementing new V2 features, the following three security corrections are required:

1. **Step 1 (Database)**: Update `submissions` and `content_reports` RLS to safely accept anonymous submissions with strict format validation, while restricting reading to verified editors.
2. **Step 2 (Storage)**: Restrict the public `resources` storage bucket to approved MIME types (`application/pdf`, `.docx`, `.zip`) and isolate unreviewed files in a `submissions/` prefix.
3. **Step 3 (Authentication)**: Upgrade `/admin` from a client-side PIN check to Supabase Auth with server-enforced role verification (`has_role('editor')`).

