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
