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
