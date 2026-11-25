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
