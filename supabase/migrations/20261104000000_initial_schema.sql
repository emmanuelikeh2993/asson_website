-- ====================================================================
-- ASSON UI Student Platform — Complete Initial Database Schema (V1.0)
-- Specification: project_idea.md (Parts Ten, Eleven, Twelve)
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fast fuzzy text search

-- 2. CUSTOM ENUMS
CREATE TYPE academic_level_enum AS ENUM ('100', '200', '300', '400', 'Postgraduate');
CREATE TYPE resource_type_enum AS ENUM ('Past Question', 'Lecture Note', 'Course Outline', 'Tutorial Sheet', 'Reference Material');
CREATE TYPE verification_status_enum AS ENUM ('Verified', 'Unverified', 'Needs Review', 'Archived');
CREATE TYPE user_role_enum AS ENUM ('student', 'editor', 'admin', 'super_admin');
CREATE TYPE notice_category_enum AS ENUM ('ASSON', 'Department', 'Faculty', 'University');
CREATE TYPE opportunity_category_enum AS ENUM ('Scholarship', 'Internship');
CREATE TYPE submission_status_enum AS ENUM ('Under Review', 'Approved', 'Changes Requested');

-- ====================================================================
-- 3. CORE TABLES
-- ====================================================================

-- 3.1 Profiles Table (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    matric_number TEXT,
    level academic_level_enum DEFAULT '200',
    department TEXT DEFAULT 'Department of Statistics',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3.2 User Roles Table (Separated from profile for granular security)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role_enum DEFAULT 'student' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_user_role UNIQUE (user_id, role)
);

-- 3.3 Courses Table (UI Statistics Curriculum)
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,       -- e.g. 'STA 211'
    title TEXT NOT NULL,      -- e.g. 'Probability & Distribution Theory I'
    level academic_level_enum NOT NULL,
    semester SMALLINT CHECK (semester IN (1, 2)) NOT NULL,
    units SMALLINT DEFAULT 3 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3.4 Academic Resources & Past Questions (Single Unified Catalog)
CREATE TABLE IF NOT EXISTS public.resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE RESTRICT,
    course_code TEXT NOT NULL,
    course_title TEXT NOT NULL,
    level academic_level_enum NOT NULL,
    semester SMALLINT CHECK (semester IN (1, 2)) NOT NULL,
    session TEXT NOT NULL,            -- e.g. '2023/2024'
    type resource_type_enum NOT NULL,
    file_type TEXT NOT NULL DEFAULT 'PDF',
    file_path TEXT NOT NULL,          -- Path inside Supabase Storage bucket
    file_size_bytes BIGINT NOT NULL,
    verification_status verification_status_enum DEFAULT 'Needs Review' NOT NULL,
    contributor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    contributor_name TEXT,
    description TEXT,
    downloads_count INTEGER DEFAULT 0 NOT NULL,
    last_checked_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3.5 Notices & Announcements
CREATE TABLE IF NOT EXISTS public.notices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    category notice_category_enum NOT NULL,
    is_urgent BOOLEAN DEFAULT FALSE NOT NULL,
    published_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    effective_date DATE,
    deadline DATE,
    issuer TEXT NOT NULL,             -- e.g. 'UI Academic Affairs' or 'ASSON Exco'
    is_expired BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3.6 Scholarships & Internship Opportunities
CREATE TABLE IF NOT EXISTS public.opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    provider TEXT NOT NULL,           -- e.g. 'MTN Foundation'
    category opportunity_category_enum NOT NULL,
    deadline DATE NOT NULL,
    eligibility TEXT NOT NULL,
    description TEXT NOT NULL,
    application_url TEXT NOT NULL,
    location TEXT,
    is_verified BOOLEAN DEFAULT TRUE NOT NULL,
    is_expired BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3.7 Frequently Asked Questions
CREATE TABLE IF NOT EXISTS public.faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT DEFAULT 'General' NOT NULL,
    order_index SMALLINT DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3.8 Executive Directory Contacts
CREATE TABLE IF NOT EXISTS public.executive_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    level TEXT NOT NULL,
    bio TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    avatar_url TEXT,
    order_index SMALLINT DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3.9 Student Submissions & Vetting Pipeline
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    resource_title TEXT NOT NULL,
    course_code TEXT NOT NULL,
    resource_type resource_type_enum NOT NULL,
    session TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    status submission_status_enum DEFAULT 'Under Review' NOT NULL,
    feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3.10 Content Issue Reports
CREATE TABLE IF NOT EXISTS public.content_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    issue_type TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'Pending' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3.11 Student Bookmarks
CREATE TABLE IF NOT EXISTS public.bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_user_bookmark UNIQUE (user_id, resource_id)
);

-- 3.12 Audit Events Log
CREATE TABLE IF NOT EXISTS public.audit_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    action TEXT NOT NULL,             -- 'CREATE', 'UPDATE', 'DELETE', 'PUBLISH', 'VERIFY'
    entity TEXT NOT NULL,
    details TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3.13 Site Settings
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ====================================================================
-- 4. PERFORMANCE INDEXES (Part Eleven of Specification)
-- ====================================================================

CREATE INDEX IF NOT EXISTS idx_resources_course_code ON public.resources(course_code);
CREATE INDEX IF NOT EXISTS idx_resources_level ON public.resources(level);
CREATE INDEX IF NOT EXISTS idx_resources_type ON public.resources(type);
CREATE INDEX IF NOT EXISTS idx_resources_verification ON public.resources(verification_status);
CREATE INDEX IF NOT EXISTS idx_resources_title_trgm ON public.resources USING gin(title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_courses_code ON public.courses(code);
CREATE INDEX IF NOT EXISTS idx_courses_level ON public.courses(level);

CREATE INDEX IF NOT EXISTS idx_notices_published_date ON public.notices(published_date DESC);
CREATE INDEX IF NOT EXISTS idx_notices_is_urgent ON public.notices(is_urgent);

CREATE INDEX IF NOT EXISTS idx_opportunities_deadline ON public.opportunities(deadline);
CREATE INDEX IF NOT EXISTS idx_opportunities_category ON public.opportunities(category);

CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON public.submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.submissions(status);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_created_at ON public.audit_events(created_at DESC);

-- ====================================================================
-- 5. ROW-LEVEL SECURITY (RLS) POLICIES (Part Twelve of Specification)
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executive_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Helper security function to test user role
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5.1 Public Read-Only Content (Zero Login Required for Visitors)
CREATE POLICY "Public can view verified resources"
    ON public.resources FOR SELECT
    USING (verification_status IN ('Verified', 'Archived'));

CREATE POLICY "Public can view courses"
    ON public.courses FOR SELECT
    USING (true);

CREATE POLICY "Public can view non-expired notices"
    ON public.notices FOR SELECT
    USING (is_expired = false);

CREATE POLICY "Public can view verified opportunities"
    ON public.opportunities FOR SELECT
    USING (is_verified = true);

CREATE POLICY "Public can view FAQs"
    ON public.faqs FOR SELECT
    USING (true);

CREATE POLICY "Public can view Executive Directory"
    ON public.executive_contacts FOR SELECT
    USING (true);

-- 5.2 Student Contributions & Bookmarks
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Students can view own submissions"
    ON public.submissions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Students can insert submissions"
    ON public.submissions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can manage own bookmarks"
    ON public.bookmarks FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Anyone can report an issue"
    ON public.content_reports FOR INSERT
    WITH CHECK (true);

-- 5.3 Editors & Administrators Elevated Privileges
CREATE POLICY "Editors can view all resources"
    ON public.resources FOR SELECT
    USING (public.has_role('editor'));

CREATE POLICY "Editors can manage resources"
    ON public.resources FOR ALL
    USING (public.has_role('editor'));

CREATE POLICY "Editors can view and review all submissions"
    ON public.submissions FOR ALL
    USING (public.has_role('editor'));

CREATE POLICY "Editors can view and manage notices"
    ON public.notices FOR ALL
    USING (public.has_role('editor'));

CREATE POLICY "Editors can view and manage opportunities"
    ON public.opportunities FOR ALL
    USING (public.has_role('editor'));

CREATE POLICY "Editors can manage content reports"
    ON public.content_reports FOR ALL
    USING (public.has_role('editor'));

CREATE POLICY "Admins can view audit events"
    ON public.audit_events FOR SELECT
    USING (public.has_role('admin'));

-- ====================================================================
-- 6. AUTOMATIC PROFILE TRIGGER ON SIGNUP
-- ====================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name, matric_number)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'matric_number'
    );

    -- Assign default student role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'student');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

