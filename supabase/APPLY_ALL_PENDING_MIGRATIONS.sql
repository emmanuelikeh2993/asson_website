-- ====================================================================
-- ASSON UI: ONE-SHOT PENDING MIGRATIONS BUNDLE (Idempotent / Safe to Re-run)
-- Paste and run ONCE in Supabase Dashboard -> SQL Editor
-- ====================================================================
-- >>> BEGIN: 20261106010000_audit_events_policy.sql
-- ====================================================================
-- ASSON UI: Audit Events Policy Hardening
-- Allows application actions (publish, verify) to be logged by authenticated or system actors
-- ====================================================================

-- 1. Ensure actor_email column exists (compatible with code)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'audit_events'
          AND column_name = 'actor_email'
    ) THEN
        ALTER TABLE public.audit_events ADD COLUMN actor_email TEXT;
    END IF;
END $$;

-- 2. Make user_id nullable in audit_events for system/service actions
ALTER TABLE IF EXISTS public.audit_events 
    ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE IF EXISTS public.audit_events 
    ALTER COLUMN user_name DROP NOT NULL;

-- 3. Policy: Allow insertion of audit log records
DROP POLICY IF EXISTS "Allow system and authorized actors to insert audit events" ON public.audit_events;
CREATE POLICY "Allow system and authorized actors to insert audit events"
    ON public.audit_events FOR INSERT
    WITH CHECK (true);
-- <<< END: 20261106010000_audit_events_policy.sql

-- >>> BEGIN: 20261106020000_tier1_security_hardening.sql
-- ====================================================================
-- ASSON UI: Tier 1 Security, Storage & Privacy Hardening Migration
-- Enforces: PDF & DOCX only (no archives), role-gated audit logs,
-- and matriculation data removal per NDPA compliance.
-- ====================================================================

-- 1. Restrict audit_events INSERT to authorized roles only (Remove anon write backdoor)
DROP POLICY IF EXISTS "Allow system and authorized actors to insert audit events" ON public.audit_events;

DROP POLICY IF EXISTS "Only authorized editors and admins can insert audit events" ON public.audit_events;
CREATE POLICY "Only authorized editors and admins can insert audit events"
    ON public.audit_events FOR INSERT
    WITH CHECK (
        public.has_role('editor') 
        OR public.has_role('admin')
        OR auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role IN ('editor', 'admin', 'super_admin'))
    );

-- 2. Enforce allowed document formats at the database level: PDF and DOCX only
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_allowed_academic_file_extension'
    ) THEN
        ALTER TABLE public.submissions 
            ADD CONSTRAINT check_allowed_academic_file_extension 
            CHECK (file_path ~* '\.(pdf|docx)$');
    END IF;
END $$;

-- 3. Data minimization: Drop matric_number column from profiles if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'profiles' 
          AND column_name = 'matric_number'
    ) THEN
        ALTER TABLE public.profiles DROP COLUMN matric_number;
    END IF;
END $$;
-- <<< END: 20261106020000_tier1_security_hardening.sql

-- >>> BEGIN: 20261106030000_batch1_calendar_and_events.sql
-- ====================================================================
-- ASSON UI: Batch 1 Academic Calendar & Event Announcements Migration
-- Provides: academic_calendar table with RLS, and event metadata on notices.
-- ====================================================================

-- 1. Create Academic Calendar Table
CREATE TABLE IF NOT EXISTS public.academic_calendar (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN (
        'Examination', 
        'Continuous Assessment', 
        'Registration Deadline', 
        'Departmental Event', 
        'Resumption / Senate', 
        'Academic Milestone'
    )),
    start_date DATE NOT NULL,
    end_date DATE,
    start_time TEXT,
    target_level academic_level_enum,
    venue TEXT,
    is_confirmed BOOLEAN DEFAULT TRUE NOT NULL,
    notice_id UUID REFERENCES public.notices(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_calendar_start_date ON public.academic_calendar(start_date ASC);
CREATE INDEX IF NOT EXISTS idx_calendar_category ON public.academic_calendar(category);

-- Enable RLS on academic_calendar
ALTER TABLE public.academic_calendar ENABLE ROW LEVEL SECURITY;

-- Public can view calendar entries (Zero Login)
DROP POLICY IF EXISTS "Public can view calendar items" ON public.academic_calendar;
CREATE POLICY "Public can view calendar items"
    ON public.academic_calendar FOR SELECT
    USING (true);

-- Authorized editors and admins can manage calendar entries
DROP POLICY IF EXISTS "Editors and admins can manage calendar" ON public.academic_calendar;
CREATE POLICY "Editors and admins can manage calendar"
    ON public.academic_calendar FOR ALL
    USING (public.has_role('editor') OR public.has_role('admin'));

-- 2. Add Event Metadata columns to notices table for in-announcement events
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notices' AND column_name = 'event_date') THEN
        ALTER TABLE public.notices ADD COLUMN event_date DATE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notices' AND column_name = 'event_time') THEN
        ALTER TABLE public.notices ADD COLUMN event_time TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notices' AND column_name = 'venue') THEN
        ALTER TABLE public.notices ADD COLUMN venue TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notices' AND column_name = 'rsvp_url') THEN
        ALTER TABLE public.notices ADD COLUMN rsvp_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notices' AND column_name = 'has_in_app_rsvp') THEN
        ALTER TABLE public.notices ADD COLUMN has_in_app_rsvp BOOLEAN DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notices' AND column_name = 'rsvp_count') THEN
        ALTER TABLE public.notices ADD COLUMN rsvp_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- 3. Optional Event RSVP tracking table
CREATE TABLE IF NOT EXISTS public.event_rsvps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notice_id UUID NOT NULL REFERENCES public.notices(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    contributor_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_event_rsvp_per_user UNIQUE (notice_id, user_id)
);

ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public and users can register RSVP" ON public.event_rsvps;
CREATE POLICY "Public and users can register RSVP"
    ON public.event_rsvps FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view their own RSVP" ON public.event_rsvps;
CREATE POLICY "Users can view their own RSVP"
    ON public.event_rsvps FOR SELECT
    USING (auth.uid() = user_id OR public.has_role('editor'));
-- <<< END: 20261106030000_batch1_calendar_and_events.sql

-- >>> BEGIN: 20261120000000_security_audit_hardening.sql
-- ====================================================================
-- ASSON UI Student Platform — Security Audit Hardening Migration (V3.0)
-- Addresses:
-- 1. CWE-426: Search path injection on SECURITY DEFINER functions
-- 2. Checklist 2.1 & 2.2: RLS and policies for user_roles, staff_members,
--    elected_executives, and enterprise_listings
-- 3. Storage bucket security (disallowing unauthenticated overwrites)
-- ====================================================================

-- 1. HARDEN SECURITY DEFINER FUNCTIONS (Mitigate CWE-426 Untrusted Search Path)
CREATE OR REPLACE FUNCTION public.has_role(required_role user_role_enum)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
          AND (
            role = required_role
            OR role = 'super_admin'
            OR (required_role = 'editor' AND role = 'admin')
          )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
    );

    -- Assign default student role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'student');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;


-- 2. USER ROLES RLS FIX (Checklist 2.2: Table had RLS enabled but missing SELECT policy)
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
CREATE POLICY "Users can view own role"
    ON public.user_roles FOR SELECT
    USING (auth.uid() = user_id OR public.has_role('admin'));


-- 3. ELECTED EXECUTIVES TABLE & RLS POLICIES
CREATE TABLE IF NOT EXISTS public.elected_executives (
    id TEXT PRIMARY KEY DEFAULT ('exec-' || extract(epoch from now())::bigint),
    name TEXT NOT NULL,
    office TEXT NOT NULL,
    session TEXT NOT NULL DEFAULT '2024/2025',
    level TEXT NOT NULL DEFAULT '300',
    image_url TEXT,
    whatsapp TEXT,
    email TEXT,
    bio TEXT,
    order_index INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.elected_executives ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view elected executives" ON public.elected_executives;
CREATE POLICY "Public can view elected executives"
    ON public.elected_executives FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Only administrators can manage elected executives" ON public.elected_executives;
CREATE POLICY "Only administrators can manage elected executives"
    ON public.elected_executives FOR ALL
    USING (public.has_role('admin'));


-- 4. ACADEMIC STAFF & FACULTY DIRECTORY TABLE & RLS POLICIES
CREATE TABLE IF NOT EXISTS public.staff_members (
    id TEXT PRIMARY KEY DEFAULT ('staff-' || extract(epoch from now())::bigint),
    name TEXT NOT NULL,
    title TEXT NOT NULL DEFAULT 'Dr.',
    designation TEXT NOT NULL DEFAULT 'Lecturer',
    courses TEXT[] DEFAULT '{}',
    office TEXT NOT NULL,
    email TEXT,
    consultation_hours TEXT,
    advisor_level TEXT,
    is_hod BOOLEAN DEFAULT FALSE NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view staff members" ON public.staff_members;
CREATE POLICY "Public can view staff members"
    ON public.staff_members FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Only administrators can manage staff members" ON public.staff_members;
CREATE POLICY "Only administrators can manage staff members"
    ON public.staff_members FOR ALL
    USING (public.has_role('admin'));


-- 5. STUDENT ENTERPRISE LISTINGS TABLE & RLS POLICIES
CREATE TABLE IF NOT EXISTS public.enterprise_listings (
    id TEXT PRIMARY KEY DEFAULT ('biz-' || extract(epoch from now())::bigint),
    business_name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'Tech & Coding',
        'Data & Analytics',
        'Fashion & Apparel',
        'Food & Treats',
        'Design & Media',
        'Hair & Beauty',
        'Gadgets & Accessories',
        'Other Services'
    )),
    tagline TEXT NOT NULL,
    description TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    owner_level TEXT NOT NULL DEFAULT '200',
    contact_phone TEXT NOT NULL,
    whatsapp_link TEXT,
    instagram_handle TEXT,
    image_url TEXT,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.enterprise_listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view approved enterprise listings" ON public.enterprise_listings;
CREATE POLICY "Public can view approved enterprise listings"
    ON public.enterprise_listings FOR SELECT
    USING (
        status = 'Approved' 
        OR (auth.uid() IS NOT NULL AND auth.uid() = user_id)
        OR public.has_role('admin')
        OR public.has_role('editor')
    );

DROP POLICY IF EXISTS "Authenticated students can submit enterprises" ON public.enterprise_listings;
CREATE POLICY "Authenticated students can submit enterprises"
    ON public.enterprise_listings FOR INSERT
    WITH CHECK (
        length(trim(business_name)) >= 2
        AND length(trim(description)) >= 10
        AND (auth.uid() IS NULL OR auth.uid() = user_id)
    );

DROP POLICY IF EXISTS "Only administrators can approve or delete enterprises" ON public.enterprise_listings;
CREATE POLICY "Only administrators can approve or delete enterprises"
    ON public.enterprise_listings FOR ALL
    USING (public.has_role('admin') OR public.has_role('editor'));
-- <<< END: 20261120000000_security_audit_hardening.sql

-- >>> BEGIN: 20261120010000_committee_access_control.sql
-- ====================================================================
-- ASSON UI Student Platform — Executive Committee Delegation & Access
-- Implements:
-- 1. public.authorized_executives table with RLS
-- 2. Master Admin seeds: ikehemmanuel70@gmail.com & ikehemmanuel60@gmail.com
-- 3. Dynamic team management directly from Admin Dashboard
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.authorized_executives (
    id TEXT PRIMARY KEY DEFAULT ('auth-exec-' || extract(epoch from now())::bigint),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL DEFAULT 'Executive Member',
    office TEXT NOT NULL DEFAULT 'Committee Member',
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('editor', 'admin', 'super_admin')),
    is_master BOOLEAN DEFAULT FALSE NOT NULL,
    approved_by TEXT DEFAULT 'Emmanuel Ikeh (President)',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.authorized_executives ENABLE ROW LEVEL SECURITY;

-- 1. Read Policy: All authenticated and internal lookups can read authorized list
DROP POLICY IF EXISTS "Anyone can check authorized executive status" ON public.authorized_executives;
CREATE POLICY "Anyone can check authorized executive status"
    ON public.authorized_executives FOR SELECT
    USING (true);

-- 2. Write Policy: Only administrators can add or revoke committee members
DROP POLICY IF EXISTS "Only administrators can manage authorized executives" ON public.authorized_executives;
CREATE POLICY "Only administrators can manage authorized executives"
    ON public.authorized_executives FOR ALL
    USING (public.has_role('admin') OR public.has_role('super_admin') OR true);

-- 3. Seed Initial Master Admins
INSERT INTO public.authorized_executives (email, name, office, role, is_master, approved_by)
VALUES 
    ('ikehemmanuel70@gmail.com', 'Emmanuel Ikeh', 'Executive President / Lead Admin', 'super_admin', true, 'System Founder'),
    ('ikehemmanuel60@gmail.com', 'Emmanuel Ikeh (Backup)', 'Master Admin Alternate', 'super_admin', true, 'System Founder'),
    ('executive@asson.ui.edu.ng', 'ASSON Executive Council', 'Executive Secretariat', 'admin', false, 'System Founder')
ON CONFLICT (email) DO UPDATE 
SET role = EXCLUDED.role, is_master = EXCLUDED.is_master, office = EXCLUDED.office;
-- <<< END: 20261120010000_committee_access_control.sql

-- >>> BEGIN: 20261120020000_official_ui_curriculum.sql
-- ====================================================================
-- ASSON UI Student Platform — Official University of Ibadan Curriculum
-- Updates public.courses table with exact 100L and 200L course forms (2025/2026 session)
-- ====================================================================

-- 100 Level Courses
INSERT INTO public.courses (code, title, level, semester, units)
VALUES
  ('STA 111', 'Descriptive Statistics', '100', 1, 3),
  ('STA 112', 'Probability I', '100', 1, 3),
  ('STA 121', 'Statistical Inference I', '100', 2, 3),
  ('STA 122', 'Statistical Computing I', '100', 2, 3),
  ('MTH 101', 'Elementary Mathematics I (Algebra and Trigonometry)', '100', 1, 2),
  ('MTH 102', 'Elementary Mathematics II (Calculus)', '100', 2, 2),
  ('MTH 103', 'Elementary Mathematics III (Vectors, Geometry and Dynamics)', '100', 1, 2),
  ('COS 101', 'Introduction to Computing Sciences', '100', 1, 3),
  ('PHY 101', 'General Physics I', '100', 1, 2),
  ('PHY 102', 'General Physics II', '100', 2, 2),
  ('PHY 103', 'General Physics III', '100', 1, 2),
  ('GST 111', 'Communication in English I', '100', 1, 2),
  ('GST 112', 'Nigerian Peoples and Culture', '100', 2, 2),
  ('GES 107', 'Reproductive Health, STIs, Drugs and Mankind', '100', 1, 1),
  ('GES 108', 'Introduction to French', '100', 2, 1),
  ('MAT 142', 'Introduction to Actuarial Mathematics', '100', 2, 4),

-- 200 Level Courses
  ('STA 211', 'Probability II', '200', 1, 3),
  ('STA 219', 'Statistical Consulting', '200', 1, 2),
  ('STA 231', 'Statistical Computing II', '200', 1, 2),
  ('STA 202', 'Statistics for Physical Science & Engineering', '200', 1, 3),
  ('STA 212', 'Introduction to Social & Economic Statistics', '200', 2, 3),
  ('STA 221', 'Statistical Inference II', '200', 2, 3),
  ('STA 224', 'Introduction to Statistical Machine Learning', '200', 2, 2),
  ('STA 225', 'Data Visualization', '200', 2, 2),
  ('STA 299', 'Industrial Attachment', '200', 2, 3),
  ('MTH 204', 'Linear Algebra I', '200', 1, 2),
  ('MTH 207', 'Real Analysis I', '200', 1, 2),
  ('MTH 202', 'Elementary Differential Equations', '200', 2, 2),
  ('MTH 209', 'Introduction to Numerical Analysis', '200', 2, 2),
  ('COS 201', 'Computer Programming I', '200', 1, 3),
  ('ENT 211', 'Entrepreneurship and Innovation', '200', 1, 2),
  ('GST 212', 'Philosophy, Logic and Human Existence', '200', 2, 2),
  ('GES 201', 'Use of English II', '200', 1, 2),
  ('GES 103', 'Government, Society & the Economy', '200', 1, 1)
ON CONFLICT (code) DO UPDATE
SET title = EXCLUDED.title,
    level = EXCLUDED.level,
    semester = EXCLUDED.semester,
    units = EXCLUDED.units;
-- <<< END: 20261120020000_official_ui_curriculum.sql

-- >>> BEGIN: 20261120030000_update_session_to_2026_2027.sql
-- ====================================================================
-- ASSON UI Student Platform — Session Alignment Migration (2026/2027)
-- Sets active administrative and academic session to 2026/2027
-- ====================================================================

-- 1. Update Elected Executives Table Defaults & Existing Records
ALTER TABLE IF EXISTS public.elected_executives 
    ALTER COLUMN session SET DEFAULT '2026/2027';

UPDATE public.elected_executives
SET session = '2026/2027'
WHERE session = '2024/2025' OR session IS NULL;

-- 2. Ensure Executive President Record for Emmanuel Chibuzor Ikeh
INSERT INTO public.elected_executives (
    id, name, office, session, level, email, bio, order_index
) VALUES (
    'exec-lead-president',
    'Emmanuel Chibuzor Ikeh',
    'Executive President',
    '2026/2027',
    '200',
    'ikehemmanuel70@gmail.com',
    'Championing academic excellence, technological transformation, transparent committee governance, and student welfare for all UI Statisticians.',
    1
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    office = EXCLUDED.office,
    session = '2026/2027',
    email = EXCLUDED.email,
    bio = EXCLUDED.bio;

-- 3. Purge any legacy plaintext passkey setting (hashed passkeys are managed via secure RPC)
DELETE FROM public.site_settings WHERE key = 'executive_passkey';
-- <<< END: 20261120030000_update_session_to_2026_2027.sql

-- >>> BEGIN: 20261125000000_secure_committee_passkey_rpc.sql
-- ====================================================================
-- ASSON UI Student Platform — Zero-Secrets Server-Hashed Passkey & RLS
-- Fixes CWE-798 / CWE-259 (No hardcoded passwords in Git or frontend):
-- 1. Removes any plaintext executive passkeys from site_settings
-- 2. Upgrades has_role() to recognize Master Admins & authorized_executives
-- 3. Removes overly permissive RLS on authorized_executives
-- 4. Implements salted SHA-256 passkey verification & rotation via RPC
-- ====================================================================

-- 0. Upgrade has_role() so Master Admins & approved committee members via Email/OTP
-- automatically have full RLS permissions across all tables without touching user_roles
CREATE OR REPLACE FUNCTION public.has_role(required_role user_role_enum)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_jwt_email TEXT := lower(trim(coalesce(auth.jwt() ->> 'email', '')));
BEGIN
    IF v_jwt_email IN ('ikehemmanuel70@gmail.com', 'ikehemmanuel60@gmail.com') THEN
        RETURN TRUE;
    END IF;

    IF EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
          AND (
            role = required_role
            OR role = 'super_admin'
            OR (required_role = 'editor' AND role = 'admin')
          )
    ) THEN
        RETURN TRUE;
    END IF;

    IF v_jwt_email <> '' AND EXISTS (
        SELECT 1 FROM public.authorized_executives
        WHERE lower(email) = v_jwt_email
          AND (
            role = required_role::text
            OR role IN ('admin', 'super_admin')
            OR (required_role = 'editor' AND role = 'editor')
          )
    ) THEN
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$;

-- 1. Lock down site_settings: ensure RLS is enabled with NO anonymous read access
ALTER TABLE IF EXISTS public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can manage site settings" ON public.site_settings;
CREATE POLICY "Admins can manage site settings"
    ON public.site_settings FOR ALL
    USING (
        public.has_role('super_admin')
        OR lower(coalesce(auth.jwt() ->> 'email', '')) IN (
            'ikehemmanuel70@gmail.com',
            'ikehemmanuel60@gmail.com'
        )
    )
    WITH CHECK (
        public.has_role('super_admin')
        OR lower(coalesce(auth.jwt() ->> 'email', '')) IN (
            'ikehemmanuel70@gmail.com',
            'ikehemmanuel60@gmail.com'
        )
    );

-- Remove any legacy plaintext passkey rows if they exist
DELETE FROM public.site_settings WHERE key = 'executive_passkey';

-- 2. Tighten authorized_executives RLS (remove legacy "OR true" bypass)
ALTER TABLE IF EXISTS public.authorized_executives ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can check authorized executive status" ON public.authorized_executives;
DROP POLICY IF EXISTS "Only administrators can manage authorized executives" ON public.authorized_executives;
DROP POLICY IF EXISTS "Authenticated executives can view allowlist" ON public.authorized_executives;
DROP POLICY IF EXISTS "Master admins can manage allowlist" ON public.authorized_executives;

DROP POLICY IF EXISTS "Authenticated executives can view allowlist" ON public.authorized_executives;
CREATE POLICY "Authenticated executives can view allowlist"
    ON public.authorized_executives FOR SELECT
    USING (
        public.has_role('admin')
        OR public.has_role('super_admin')
        OR lower(coalesce(auth.jwt() ->> 'email', '')) IN (
            'ikehemmanuel70@gmail.com',
            'ikehemmanuel60@gmail.com'
        )
        OR lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    );

DROP POLICY IF EXISTS "Master admins can manage allowlist" ON public.authorized_executives;
CREATE POLICY "Master admins can manage allowlist"
    ON public.authorized_executives FOR ALL
    USING (
        public.has_role('super_admin')
        OR lower(coalesce(auth.jwt() ->> 'email', '')) IN (
            'ikehemmanuel70@gmail.com',
            'ikehemmanuel60@gmail.com'
        )
    )
    WITH CHECK (
        public.has_role('super_admin')
        OR lower(coalesce(auth.jwt() ->> 'email', '')) IN (
            'ikehemmanuel70@gmail.com',
            'ikehemmanuel60@gmail.com'
        )
    );

-- Remove unverified generic seed account if present
DELETE FROM public.authorized_executives WHERE lower(email) = 'executive@asson.ui.edu.ng';

-- 3. Helper: Check whether a committee passkey hash is configured (returns boolean only)
CREATE OR REPLACE FUNCTION public.has_executive_passkey()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.site_settings
        WHERE key = 'executive_passkey_hash'
          AND value ? 'hash'
          AND value ? 'salt'
    );
$$;

-- 4. RPC: Verify executive login against allowlist + salted SHA-256 hash
CREATE OR REPLACE FUNCTION public.verify_executive_login(
    p_email TEXT,
    p_passkey TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_email TEXT := lower(trim(coalesce(p_email, '')));
    v_passkey TEXT := trim(coalesce(p_passkey, ''));
    v_is_master BOOLEAN := FALSE;
    v_exec RECORD;
    v_setting JSONB;
    v_salt TEXT;
    v_stored_hash TEXT;
    v_computed_hash TEXT;
BEGIN
    IF v_email = '' OR v_passkey = '' THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'error', 'Email address and committee passkey are required.'
        );
    END IF;

    v_is_master := v_email IN ('ikehemmanuel70@gmail.com', 'ikehemmanuel60@gmail.com');

    SELECT id, email, name, office, role, is_master
    INTO v_exec
    FROM public.authorized_executives
    WHERE lower(email) = v_email
    LIMIT 1;

    IF NOT v_is_master AND v_exec.id IS NULL THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'error', 'Access Denied: this email is not on the approved committee list.'
        );
    END IF;

    SELECT value INTO v_setting
    FROM public.site_settings
    WHERE key = 'executive_passkey_hash'
    LIMIT 1;

    IF v_setting IS NULL OR NOT (v_setting ? 'hash') OR NOT (v_setting ? 'salt') THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'needsSetup', TRUE,
            'error', 'Committee passkey is not configured yet. Master Admin must sign in via Email OTP or Supabase Password first to set it.'
        );
    END IF;

    v_salt := v_setting ->> 'salt';
    v_stored_hash := v_setting ->> 'hash';
    v_computed_hash := encode(sha256((v_salt || ':' || v_passkey)::bytea), 'hex');

    IF v_computed_hash <> v_stored_hash THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'error', 'Incorrect committee passkey. Please verify with Emmanuel Ikeh.'
        );
    END IF;

    INSERT INTO public.audit_events (user_name, actor_email, action, entity, details)
    VALUES (
        coalesce(v_exec.name, CASE WHEN v_is_master THEN 'Emmanuel Ikeh' ELSE v_email END),
        v_email,
        'LOGIN',
        'admin_session',
        format('Executive portal session opened by %s (%s)', v_email, coalesce(v_exec.office, 'Executive Council'))
    );

    RETURN jsonb_build_object(
        'success', TRUE,
        'role', CASE WHEN v_is_master THEN 'super_admin' ELSE coalesce(v_exec.role, 'admin') END,
        'isMaster', v_is_master OR coalesce(v_exec.is_master, FALSE),
        'name', coalesce(v_exec.name, CASE WHEN v_is_master THEN 'Emmanuel Ikeh' ELSE 'Executive Member' END),
        'office', coalesce(v_exec.office, CASE WHEN v_is_master THEN 'Executive President / Lead Admin' ELSE 'Executive Council' END)
    );
END;
$$;

-- 5. RPC: Set or rotate the hashed committee passkey (Master Admin only)
CREATE OR REPLACE FUNCTION public.set_executive_passkey(
    p_new_passkey TEXT,
    p_actor_email TEXT DEFAULT NULL,
    p_current_passkey TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_jwt_email TEXT := lower(trim(coalesce(auth.jwt() ->> 'email', '')));
    v_actor_email TEXT := lower(trim(coalesce(p_actor_email, '')));
    v_new_passkey TEXT := trim(coalesce(p_new_passkey, ''));
    v_current_passkey TEXT := trim(coalesce(p_current_passkey, ''));
    v_setting JSONB;
    v_salt TEXT;
    v_new_hash TEXT;
    v_authorized BOOLEAN := FALSE;
    v_actor TEXT;
BEGIN
    IF length(v_new_passkey) < 8 THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'error', 'Passkey must be at least 8 characters long.'
        );
    END IF;

    SELECT value INTO v_setting
    FROM public.site_settings
    WHERE key = 'executive_passkey_hash'
    LIMIT 1;

    -- Case A: Verified Supabase Auth / OTP session as Master Admin
    IF v_jwt_email IN ('ikehemmanuel70@gmail.com', 'ikehemmanuel60@gmail.com')
       OR public.has_role('super_admin') THEN
        v_authorized := TRUE;
        v_actor := coalesce(nullif(v_jwt_email, ''), v_actor_email, 'Master Admin');
    -- Case B: Rotating an existing passkey by providing the valid current passkey as Master Admin
    ELSIF v_setting IS NOT NULL
          AND v_actor_email IN ('ikehemmanuel70@gmail.com', 'ikehemmanuel60@gmail.com')
          AND v_current_passkey <> '' THEN
        IF encode(sha256(((v_setting ->> 'salt') || ':' || v_current_passkey)::bytea), 'hex') = (v_setting ->> 'hash') THEN
            v_authorized := TRUE;
            v_actor := v_actor_email;
        END IF;
    END IF;

    IF NOT v_authorized THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'error', 'Only a verified Master Admin session (Email OTP / Supabase Auth, or valid current passkey) can update the committee passkey.'
        );
    END IF;

    v_salt := replace(gen_random_uuid()::text, '-', '');
    v_new_hash := encode(sha256((v_salt || ':' || v_new_passkey)::bytea), 'hex');

    INSERT INTO public.site_settings (key, value, updated_at)
    VALUES (
        'executive_passkey_hash',
        jsonb_build_object(
            'salt', v_salt,
            'hash', v_new_hash,
            'updated_by', v_actor,
            'updated_at', now()
        ),
        now()
    )
    ON CONFLICT (key) DO UPDATE
    SET value = EXCLUDED.value,
        updated_at = now();

    INSERT INTO public.audit_events (user_name, actor_email, action, entity, details)
    VALUES (
        v_actor,
        v_actor,
        'UPDATE',
        'site_settings',
        'Rotated encrypted committee passkey hash'
    );

    RETURN jsonb_build_object('success', TRUE);
END;
$$;

-- 6. Helper RPC: Check if a single email is authorized (boolean only, never leaks allowlist)
CREATE OR REPLACE FUNCTION public.is_authorized_executive_email(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT lower(trim(coalesce(p_email, ''))) IN ('ikehemmanuel70@gmail.com', 'ikehemmanuel60@gmail.com')
    OR EXISTS (
        SELECT 1 FROM public.authorized_executives
        WHERE lower(email) = lower(trim(coalesce(p_email, '')))
    );
$$;

GRANT EXECUTE ON FUNCTION public.has_executive_passkey() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_executive_login(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_executive_passkey(TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_authorized_executive_email(TEXT) TO anon, authenticated;
-- <<< END: 20261125000000_secure_committee_passkey_rpc.sql

-- >>> BEGIN: 20261125010000_senior_security_remediation.sql
REVOKE ALL ON FUNCTION public.verify_executive_login(TEXT, TEXT) FROM PUBLIC, anon, authenticated;
DROP FUNCTION IF EXISTS public.verify_executive_login(TEXT, TEXT);

REVOKE ALL ON FUNCTION public.set_executive_passkey(TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
DROP FUNCTION IF EXISTS public.set_executive_passkey(TEXT, TEXT, TEXT);

REVOKE ALL ON FUNCTION public.has_executive_passkey() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_authorized_executive_email(TEXT) FROM PUBLIC, anon;

CREATE OR REPLACE FUNCTION public.is_authorized_executive_email(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT auth.uid() IS NOT NULL
    AND (
        public.has_role('admin')
        OR lower(trim(coalesce(p_email, ''))) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
    )
    AND (
        lower(trim(coalesce(p_email, ''))) IN ('ikehemmanuel70@gmail.com', 'ikehemmanuel60@gmail.com')
        OR EXISTS (
            SELECT 1 FROM public.authorized_executives
            WHERE lower(email) = lower(trim(coalesce(p_email, '')))
        )
    );
$$;

GRANT EXECUTE ON FUNCTION public.is_authorized_executive_email(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_executive_passkey() TO authenticated;

CREATE OR REPLACE FUNCTION public.set_executive_passkey(p_new_passkey TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_jwt_email TEXT := lower(trim(coalesce(auth.jwt() ->> 'email', '')));
    v_new_passkey TEXT := trim(coalesce(p_new_passkey, ''));
    v_salt TEXT;
    v_new_hash TEXT;
BEGIN
    IF auth.uid() IS NULL OR NOT public.has_role('super_admin') THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'error', 'Unauthorized: verified Super Admin session required.'
        );
    END IF;

    IF length(v_new_passkey) < 8 THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'error', 'Passkey must be at least 8 characters long.'
        );
    END IF;

    v_salt := replace(gen_random_uuid()::text, '-', '');
    v_new_hash := encode(sha256((v_salt || ':' || v_new_passkey)::bytea), 'hex');

    INSERT INTO public.site_settings (key, value, updated_at)
    VALUES (
        'executive_passkey_hash',
        jsonb_build_object(
            'salt', v_salt,
            'hash', v_new_hash,
            'updated_by', v_jwt_email,
            'updated_at', now()
        ),
        now()
    )
    ON CONFLICT (key) DO UPDATE
    SET value = EXCLUDED.value,
        updated_at = now();

    INSERT INTO public.audit_events (user_id, user_name, actor_email, action, entity, details)
    VALUES (
        auth.uid(),
        v_jwt_email,
        v_jwt_email,
        'UPDATE',
        'site_settings',
        'Rotated committee security credential hash'
    );

    RETURN jsonb_build_object('success', TRUE);
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_executive_passkey(TEXT) TO authenticated;

CREATE TABLE IF NOT EXISTS public.auth_rate_limits (
    bucket TEXT NOT NULL,
    rate_key TEXT NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 1,
    window_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (bucket, rate_key)
);

ALTER TABLE public.auth_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.check_rate_limit(
    p_bucket TEXT,
    p_key TEXT,
    p_max_attempts INTEGER DEFAULT 5,
    p_window_seconds INTEGER DEFAULT 900
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_bucket TEXT := left(lower(trim(coalesce(p_bucket, 'default'))), 40);
    v_key TEXT := encode(sha256(convert_to(lower(trim(coalesce(p_key, 'anon'))), 'UTF8')), 'hex');
    v_rec public.auth_rate_limits%ROWTYPE;
    v_retry_after INTEGER;
BEGIN
    SELECT * INTO v_rec
    FROM public.auth_rate_limits
    WHERE bucket = v_bucket AND rate_key = v_key
    FOR UPDATE;

    IF NOT FOUND OR v_rec.window_started_at + make_interval(secs => p_window_seconds) <= NOW() THEN
        INSERT INTO public.auth_rate_limits (bucket, rate_key, attempts, window_started_at)
        VALUES (v_bucket, v_key, 1, NOW())
        ON CONFLICT (bucket, rate_key) DO UPDATE
        SET attempts = 1,
            window_started_at = NOW();

        RETURN jsonb_build_object('allowed', TRUE, 'remaining', GREATEST(p_max_attempts - 1, 0), 'retryAfter', 0);
    END IF;

    IF v_rec.attempts >= p_max_attempts THEN
        v_retry_after := GREATEST(
            CEIL(EXTRACT(EPOCH FROM (v_rec.window_started_at + make_interval(secs => p_window_seconds) - NOW())))::INTEGER,
            1
        );
        RETURN jsonb_build_object('allowed', FALSE, 'remaining', 0, 'retryAfter', v_retry_after);
    END IF;

    UPDATE public.auth_rate_limits
    SET attempts = v_rec.attempts + 1
    WHERE bucket = v_bucket AND rate_key = v_key;

    RETURN jsonb_build_object(
        'allowed', TRUE,
        'remaining', GREATEST(p_max_attempts - (v_rec.attempts + 1), 0),
        'retryAfter', 0
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_rate_limit(TEXT, TEXT, INTEGER, INTEGER) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.bind_audit_event_actor()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_jwt_email TEXT := NULLIF(lower(trim(coalesce(auth.jwt() ->> 'email', ''))), '');
BEGIN
    IF auth.uid() IS NOT NULL THEN
        NEW.user_id := auth.uid();
        IF v_jwt_email IS NOT NULL THEN
            NEW.actor_email := v_jwt_email;
            IF NEW.user_name IS NULL OR trim(NEW.user_name) = '' THEN
                NEW.user_name := v_jwt_email;
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_events_bind_actor ON public.audit_events;
CREATE TRIGGER trg_audit_events_bind_actor
    BEFORE INSERT ON public.audit_events
    FOR EACH ROW
    EXECUTE FUNCTION public.bind_audit_event_actor();

DROP POLICY IF EXISTS "Allow public submissions with valid payload" ON public.submissions;
CREATE POLICY "Allow public submissions with valid payload"
    ON public.submissions FOR INSERT
    WITH CHECK (
        status = 'Under Review'
        AND length(trim(resource_title)) >= 3
        AND length(trim(course_code)) >= 3
        AND (user_id IS NULL OR auth.uid() = user_id)
    );

DROP POLICY IF EXISTS "Authenticated students can submit enterprises" ON public.enterprise_listings;
CREATE POLICY "Authenticated students can submit enterprises"
    ON public.enterprise_listings FOR INSERT
    WITH CHECK (
        status = 'Pending'
        AND length(trim(business_name)) >= 2
        AND length(trim(description)) >= 10
        AND (user_id IS NULL OR auth.uid() = user_id)
    );

DROP POLICY IF EXISTS "Public can submit private feedback" ON public.feedback_submissions;
CREATE POLICY "Public can submit private feedback"
    ON public.feedback_submissions FOR INSERT
    WITH CHECK (
        status = 'Received'
        AND reviewer_notes IS NULL
        AND length(trim(subject)) >= 3
        AND length(trim(description)) >= 5
    );

DROP POLICY IF EXISTS "Only authorized editors can update feedback" ON public.feedback_submissions;
CREATE POLICY "Only authorized editors can update feedback"
    ON public.feedback_submissions FOR UPDATE
    USING (public.has_role('editor') OR public.has_role('admin'))
    WITH CHECK (public.has_role('editor') OR public.has_role('admin'));

DROP POLICY IF EXISTS "Anyone can report an issue" ON public.content_reports;
CREATE POLICY "Anyone can report an issue"
    ON public.content_reports FOR INSERT
    WITH CHECK (
        status IN ('Open', 'Pending')
        AND (user_id IS NULL OR auth.uid() = user_id)
    );

DROP POLICY IF EXISTS "Public and users can register RSVP" ON public.event_rsvps;
CREATE POLICY "Public and users can register RSVP"
    ON public.event_rsvps FOR INSERT
    WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Editors can manage resources" ON public.resources;
CREATE POLICY "Editors can manage resources"
    ON public.resources FOR ALL
    USING (public.has_role('editor'))
    WITH CHECK (public.has_role('editor'));

DROP POLICY IF EXISTS "Editors can view and review all submissions" ON public.submissions;
CREATE POLICY "Editors can view and review all submissions"
    ON public.submissions FOR ALL
    USING (public.has_role('editor'))
    WITH CHECK (public.has_role('editor'));

DROP POLICY IF EXISTS "Editors can view and manage notices" ON public.notices;
CREATE POLICY "Editors can view and manage notices"
    ON public.notices FOR ALL
    USING (public.has_role('editor'))
    WITH CHECK (public.has_role('editor'));

DROP POLICY IF EXISTS "Editors can view and manage opportunities" ON public.opportunities;
CREATE POLICY "Editors can view and manage opportunities"
    ON public.opportunities FOR ALL
    USING (public.has_role('editor'))
    WITH CHECK (public.has_role('editor'));

DROP POLICY IF EXISTS "Editors and admins can manage calendar" ON public.academic_calendar;
CREATE POLICY "Editors and admins can manage calendar"
    ON public.academic_calendar FOR ALL
    USING (public.has_role('editor') OR public.has_role('admin'))
    WITH CHECK (public.has_role('editor') OR public.has_role('admin'));

DROP POLICY IF EXISTS "Only administrators can manage elected executives" ON public.elected_executives;
CREATE POLICY "Only administrators can manage elected executives"
    ON public.elected_executives FOR ALL
    USING (public.has_role('admin'))
    WITH CHECK (public.has_role('admin'));

DROP POLICY IF EXISTS "Only administrators can manage staff members" ON public.staff_members;
CREATE POLICY "Only administrators can manage staff members"
    ON public.staff_members FOR ALL
    USING (public.has_role('admin'))
    WITH CHECK (public.has_role('admin'));

DROP POLICY IF EXISTS "Only administrators can approve or delete enterprises" ON public.enterprise_listings;
CREATE POLICY "Only administrators can approve or delete enterprises"
    ON public.enterprise_listings FOR ALL
    USING (public.has_role('admin') OR public.has_role('editor'))
    WITH CHECK (public.has_role('admin') OR public.has_role('editor'));

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_opportunities_safe_url') THEN
        ALTER TABLE public.opportunities
            ADD CONSTRAINT check_opportunities_safe_url
            CHECK (application_url ~* '^https?://') NOT VALID;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_notices_safe_rsvp_url') THEN
        ALTER TABLE public.notices
            ADD CONSTRAINT check_notices_safe_rsvp_url
            CHECK (rsvp_url IS NULL OR rsvp_url = '' OR rsvp_url ~* '^https?://') NOT VALID;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_enterprise_safe_image_url') THEN
        ALTER TABLE public.enterprise_listings
            ADD CONSTRAINT check_enterprise_safe_image_url
            CHECK (image_url IS NULL OR image_url = '' OR image_url ~* '^https?://') NOT VALID;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_resources_allowed_file_extension') THEN
        ALTER TABLE public.resources
            ADD CONSTRAINT check_resources_allowed_file_extension
            CHECK (file_path ~* '\.(pdf|docx)$') NOT VALID;
    END IF;
END $$;

CREATE OR REPLACE FUNCTION public.increment_download_count(resource_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    UPDATE public.resources
    SET downloads_count = COALESCE(downloads_count, 0) + 1
    WHERE id = resource_id
      AND verification_status IN ('Verified', 'Archived');
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_download_count(UUID) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.increment_notice_rsvp(
    p_notice_id UUID,
    p_contributor_name TEXT DEFAULT 'Student Attendee'
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_new_count INTEGER;
BEGIN
    INSERT INTO public.event_rsvps (notice_id, user_id, contributor_name)
    VALUES (p_notice_id, auth.uid(), left(coalesce(nullif(trim(p_contributor_name), ''), 'Student Attendee'), 80))
    ON CONFLICT ON CONSTRAINT unique_event_rsvp_per_user DO NOTHING;

    UPDATE public.notices
    SET rsvp_count = COALESCE(rsvp_count, 0) + 1
    WHERE id = p_notice_id AND is_expired = FALSE
    RETURNING rsvp_count INTO v_new_count;

    RETURN COALESCE(v_new_count, 1);
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_notice_rsvp(UUID, TEXT) TO anon, authenticated;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
    (
        'resources',
        'resources',
        TRUE,
        15728640,
        ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    ),
    (
        'submissions-pending',
        'submissions-pending',
        FALSE,
        15728640,
        ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    ),
    (
        'enterprise-images',
        'enterprise-images',
        TRUE,
        2097152,
        ARRAY['image/jpeg', 'image/png', 'image/webp']
    )
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public can read verified resources files" ON storage.objects;
CREATE POLICY "Public can read verified resources files"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'resources');

DROP POLICY IF EXISTS "Editors can manage resources files" ON storage.objects;
CREATE POLICY "Editors can manage resources files"
    ON storage.objects FOR ALL
    USING (bucket_id = 'resources' AND (public.has_role('editor') OR public.has_role('admin')))
    WITH CHECK (bucket_id = 'resources' AND (public.has_role('editor') OR public.has_role('admin')));

DROP POLICY IF EXISTS "Anyone can upload pending submissions" ON storage.objects;
CREATE POLICY "Anyone can upload pending submissions"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'submissions-pending'
        AND name ~* '^submissions/[a-zA-Z0-9._-]+\.(pdf|docx)$'
    );

DROP POLICY IF EXISTS "Editors can review and manage pending submissions" ON storage.objects;
CREATE POLICY "Editors can review and manage pending submissions"
    ON storage.objects FOR ALL
    USING (bucket_id = 'submissions-pending' AND (public.has_role('editor') OR public.has_role('admin')))
    WITH CHECK (bucket_id = 'submissions-pending' AND (public.has_role('editor') OR public.has_role('admin')));

DROP POLICY IF EXISTS "Public can read enterprise images" ON storage.objects;
CREATE POLICY "Public can read enterprise images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'enterprise-images');

DROP POLICY IF EXISTS "Anyone can upload enterprise images" ON storage.objects;
CREATE POLICY "Anyone can upload enterprise images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'enterprise-images'
        AND name ~* '^enterprises/[a-zA-Z0-9._-]+\.(jpg|jpeg|png|webp)$'
    );

DROP POLICY IF EXISTS "Admins can delete enterprise images" ON storage.objects;
CREATE POLICY "Admins can delete enterprise images"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'enterprise-images' AND (public.has_role('admin') OR public.has_role('editor')));
-- <<< END: 20261125010000_senior_security_remediation.sql

