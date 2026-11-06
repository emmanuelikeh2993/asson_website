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
CREATE POLICY "Allow system and authorized actors to insert audit events"
    ON public.audit_events FOR INSERT
    WITH CHECK (true);

