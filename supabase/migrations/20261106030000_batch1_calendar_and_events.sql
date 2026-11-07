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
CREATE POLICY "Public can view calendar items"
    ON public.academic_calendar FOR SELECT
    USING (true);

-- Authorized editors and admins can manage calendar entries
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

CREATE POLICY "Public and users can register RSVP"
    ON public.event_rsvps FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can view their own RSVP"
    ON public.event_rsvps FOR SELECT
    USING (auth.uid() = user_id OR public.has_role('editor'));
