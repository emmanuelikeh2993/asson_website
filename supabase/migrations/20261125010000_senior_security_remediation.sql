-- ====================================================================
-- ASSON UI Student Platform — Senior Security Remediation Migration
-- Fixes:
-- 1. CWE-287 / CWE-204: Revoke anon RPC passkey rotation & email enumeration
-- 2. CWE-284: Enforce strict status/user_id WITH CHECK across public INSERTs
-- 3. CWE-732: Explicit versioned Storage bucket & storage.objects RLS
-- 4. CWE-345: Server-derived audit_events actor_email from auth.jwt()
-- 5. CWE-307: Database-backed rate limiting for auth/OTP/reset operations
-- 6. CWE-20: Postgres CHECK constraints for safe HTTP(S) URLs & extensions
-- 7. Scoped SECURITY DEFINER counter RPCs (downloads & event RSVPs)
-- ====================================================================

-- 1. LOCK DOWN EXECUTIVE RPCS (Remove anon passkey backdoor & enumeration)
REVOKE ALL ON FUNCTION public.verify_executive_login(TEXT, TEXT) FROM PUBLIC, anon, authenticated;
DROP FUNCTION IF EXISTS public.verify_executive_login(TEXT, TEXT);

REVOKE ALL ON FUNCTION public.set_executive_passkey(TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
DROP FUNCTION IF EXISTS public.set_executive_passkey(TEXT, TEXT, TEXT);

REVOKE ALL ON FUNCTION public.has_executive_passkey() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_authorized_executive_email(TEXT) FROM PUBLIC, anon;

-- Authenticated-only self/admin allowlist check (no anonymous email enumeration)
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

-- Super-admin-only passkey rotation requiring a verified JWT session (no p_actor_email)
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

-- 2. SERVER-SIDE RATE LIMITING TABLE & RPC (Mitigate CWE-307 & CWE-602)
CREATE TABLE IF NOT EXISTS public.auth_rate_limits (
    bucket TEXT NOT NULL,
    rate_key TEXT NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 1,
    window_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (bucket, rate_key)
);

ALTER TABLE public.auth_rate_limits ENABLE ROW LEVEL SECURITY;
-- Intentionally zero public/authenticated policies: accessed strictly via SECURITY DEFINER RPC.

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

-- 3. SERVER-DERIVED AUDIT ACTOR IDENTITY TRIGGER (Mitigate CWE-345)
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

-- 4. STRICT RLS WITH CHECK CLAUSES ACROSS PUBLIC WRITE TABLES (Mitigate CWE-284)

-- 4.1 Submissions: force initial status = 'Under Review' & own user_id
DROP POLICY IF EXISTS "Allow public submissions with valid payload" ON public.submissions;
CREATE POLICY "Allow public submissions with valid payload"
    ON public.submissions FOR INSERT
    WITH CHECK (
        status = 'Under Review'
        AND length(trim(resource_title)) >= 3
        AND length(trim(course_code)) >= 3
        AND (user_id IS NULL OR auth.uid() = user_id)
    );

-- 4.2 Enterprise Listings: force initial status = 'Pending' & own user_id
DROP POLICY IF EXISTS "Authenticated students can submit enterprises" ON public.enterprise_listings;
CREATE POLICY "Authenticated students can submit enterprises"
    ON public.enterprise_listings FOR INSERT
    WITH CHECK (
        status = 'Pending'
        AND length(trim(business_name)) >= 2
        AND length(trim(description)) >= 10
        AND (user_id IS NULL OR auth.uid() = user_id)
    );

-- 4.3 Feedback Submissions: lock status & reviewer_notes on public INSERT; add WITH CHECK on UPDATE
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

-- 4.4 Content Reports: disallow arbitrary user_id spoofing & resolved status on INSERT
DROP POLICY IF EXISTS "Anyone can report an issue" ON public.content_reports;
CREATE POLICY "Anyone can report an issue"
    ON public.content_reports FOR INSERT
    WITH CHECK (
        status IN ('Open', 'Pending')
        AND (user_id IS NULL OR auth.uid() = user_id)
    );

-- 4.5 Event RSVPs: disallow spoofing another user's auth.uid()
DROP POLICY IF EXISTS "Public and users can register RSVP" ON public.event_rsvps;
CREATE POLICY "Public and users can register RSVP"
    ON public.event_rsvps FOR INSERT
    WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- 4.6 Profiles UPDATE: explicit WITH CHECK
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 4.7 Explicit WITH CHECK on Admin/Editor FOR ALL policies
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

-- 5. SAFE HTTP(S) URL & FILE PATH CHECK CONSTRAINTS (Mitigate CWE-20 / Stored XSS)
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

-- 6. SCOPED COUNTER RPCS (Replace missing RPC & direct unauthenticated UPDATE fallbacks)
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

-- 7. STORAGE BUCKETS & STORAGE.OBJECTS RLS POLICIES (Mitigate CWE-732 & CWE-434)
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

-- Public verified academic repository: read public, write/delete editors/admins only
DROP POLICY IF EXISTS "Public can read verified resources files" ON storage.objects;
CREATE POLICY "Public can read verified resources files"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'resources');

DROP POLICY IF EXISTS "Editors can manage resources files" ON storage.objects;
CREATE POLICY "Editors can manage resources files"
    ON storage.objects FOR ALL
    USING (bucket_id = 'resources' AND (public.has_role('editor') OR public.has_role('admin')))
    WITH CHECK (bucket_id = 'resources' AND (public.has_role('editor') OR public.has_role('admin')));

-- Private unvetted submission uploads: anon/auth upload-only (no overwrite/list/delete), editors review
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

-- Enterprise showcase images: public read, validated image upload only, admin delete/update
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
