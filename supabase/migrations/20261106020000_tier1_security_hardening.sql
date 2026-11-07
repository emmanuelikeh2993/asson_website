-- ====================================================================
-- ASSON UI: Tier 1 Security, Storage & Privacy Hardening Migration
-- Enforces: PDF & DOCX only (no archives), role-gated audit logs,
-- and matriculation data removal per NDPA compliance.
-- ====================================================================

-- 1. Restrict audit_events INSERT to authorized roles only (Remove anon write backdoor)
DROP POLICY IF EXISTS "Allow system and authorized actors to insert audit events" ON public.audit_events;

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
