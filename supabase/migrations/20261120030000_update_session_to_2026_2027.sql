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

-- 3. Update Default Passkey & Session in Site Settings (if present)
UPDATE public.site_settings 
SET value = 'ASSON_EXCO_2026_2027' 
WHERE key = 'executive_passkey' AND (value = 'ASSON_EXCO_2024_2025' OR value IS NULL);
