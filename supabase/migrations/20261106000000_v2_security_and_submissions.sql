-- ====================================================================
-- ASSON UI Student Platform — V2 Security, Anonymous Submissions,
-- Private Feedback & Help Directory Migration
-- Reference: ASSON_UI_V2_Implementation_Directive.pdf (Sections 3.3, 5.3, 5.4, 7.2)
-- ====================================================================

-- 1. ANONYMOUS STUDENT SUBMISSIONS HARDENING
-- Allow unauthenticated submissions while enforcing receipt tracking

-- 1.1 Make user_id nullable for anonymous submissions
ALTER TABLE IF EXISTS public.submissions 
    ALTER COLUMN user_id DROP NOT NULL;

-- 1.2 Add reference_code for anonymous receipt tracking
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'submissions' 
          AND column_name = 'reference_code'
    ) THEN
        ALTER TABLE public.submissions 
            ADD COLUMN reference_code TEXT UNIQUE;
    END IF;
END $$;

-- 1.3 Add index on reference_code
CREATE INDEX IF NOT EXISTS idx_submissions_reference_code 
    ON public.submissions(reference_code);

-- 1.4 Update RLS Policies for Submissions
DROP POLICY IF EXISTS "Students can insert submissions" ON public.submissions;
DROP POLICY IF EXISTS "Students can view own submissions" ON public.submissions;

-- Allow anyone (authenticated or anonymous) to insert submissions with valid title and course
CREATE POLICY "Allow public submissions with valid payload"
    ON public.submissions FOR INSERT
    WITH CHECK (
        length(trim(resource_title)) >= 3
        AND length(trim(course_code)) >= 3
        AND (user_id IS NULL OR auth.uid() = user_id)
    );

-- Allow authenticated users to view their own submissions; anonymous users track locally
CREATE POLICY "Users can view own submissions"
    ON public.submissions FOR SELECT
    USING (
        (auth.uid() IS NOT NULL AND auth.uid() = user_id)
        OR public.has_role('editor')
    );


-- ====================================================================
-- 2. PRIVATE FEEDBACK CENTRE & WELFARE SUBMISSIONS (Directive Section 5.4)
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.feedback_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category TEXT NOT NULL CHECK (category IN (
        'General Feedback', 
        'Incorrect Information', 
        'Broken Link / Missing Material', 
        'Suggestion', 
        'Welfare Concern', 
        'Appreciation'
    )),
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    affected_url TEXT,
    contact_method TEXT,
    status TEXT DEFAULT 'Received' NOT NULL CHECK (status IN (
        'Received', 
        'Under Review', 
        'Referred', 
        'Resolved', 
        'Closed'
    )),
    reviewer_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_feedback_category ON public.feedback_submissions(category);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON public.feedback_submissions(status);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback_submissions(created_at DESC);

-- Enable RLS on feedback_submissions
ALTER TABLE public.feedback_submissions ENABLE ROW LEVEL SECURITY;

-- Write-Only policy for the public: Anyone can submit feedback/welfare issues
CREATE POLICY "Public can submit private feedback"
    ON public.feedback_submissions FOR INSERT
    WITH CHECK (
        length(trim(subject)) >= 3
        AND length(trim(description)) >= 5
    );

-- Strictly restrict SELECT and UPDATE to verified editors and administrators
-- Anonymous users and public search/AI cannot read private feedback
CREATE POLICY "Only authorized editors can view feedback"
    ON public.feedback_submissions FOR SELECT
    USING (public.has_role('editor') OR public.has_role('admin'));

CREATE POLICY "Only authorized editors can update feedback"
    ON public.feedback_submissions FOR UPDATE
    USING (public.has_role('editor') OR public.has_role('admin'));


-- ====================================================================
-- 3. WHERE TO GET HELP DIRECTORY (Directive Section 5.3)
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.help_directory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category TEXT NOT NULL CHECK (category IN (
        'Academic Advisory', 
        'Departmental Office', 
        'Student Welfare', 
        'Platform Technical Help'
    )),
    title TEXT NOT NULL,
    office_or_person TEXT NOT NULL,
    description TEXT NOT NULL,
    contact_email TEXT,
    contact_phone TEXT,
    location TEXT,
    availability TEXT,
    last_verified_date DATE DEFAULT CURRENT_DATE NOT NULL,
    order_index SMALLINT DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_help_category ON public.help_directory(category);
CREATE INDEX IF NOT EXISTS idx_help_order ON public.help_directory(order_index ASC);

-- Enable RLS on help_directory
ALTER TABLE public.help_directory ENABLE ROW LEVEL SECURITY;

-- Public can read verified help channels
CREATE POLICY "Public can view help directory"
    ON public.help_directory FOR SELECT
    USING (true);

-- Only editors can manage help channels
CREATE POLICY "Editors can manage help directory"
    ON public.help_directory FOR ALL
    USING (public.has_role('editor') OR public.has_role('admin'));


-- ====================================================================
-- 4. SEED VERIFIED UI HELP DIRECTORY CONTACTS
-- ====================================================================

INSERT INTO public.help_directory (category, title, office_or_person, description, contact_email, location, availability, order_index)
VALUES
(
    'Departmental Office',
    'Departmental General Office',
    'Departmental Secretary',
    'Official academic documentation, transcript requests, departmental clearance, and general university student enquiries.',
    'statistics@ui.edu.ng',
    'Department of Statistics Building, Faculty of Science, University of Ibadan',
    'Monday – Friday, 8:00 AM – 4:00 PM',
    1
),
(
    'Academic Advisory',
    'Undergraduate Course Advisory Board',
    'Level Staff Advisers (100L – 400L)',
    'Course registration approval, add/drop counselling, prerequisites verification, and academic guidance.',
    'statistics.adviser@ui.edu.ng',
    'Faculty of Science, University of Ibadan',
    'Departmental consultation hours (check notice board for current session)',
    2
),
(
    'Student Welfare',
    'ASSON UI Executive Welfare Committee',
    'ASSON Welfare Director & Secretariat',
    'Support with study resources, academic group tutorials, student wellbeing, and emergency assistance.',
    'asson.unibadan@gmail.com',
    'ASSON Secretariat, Department of Statistics',
    'ASSON Week and tutorial schedule periods',
    3
),
(
    'Platform Technical Help',
    'ASSON Portal Technical Desk',
    'Platform Administrator & Editorial Desk',
    'Report missing course materials, broken PDF links, incorrect metadata, or upload issues.',
    'asson.unibadan@gmail.com',
    'Online via Portal Feedback Centre',
    'Reviewed daily by ASSON Editorial Board',
    4
)
ON CONFLICT DO NOTHING;

