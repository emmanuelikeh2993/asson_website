import { CgpaCourseRow, CgpaSemesterSection } from './cgpaCalculator';

export const CGPA_STORAGE_KEY = 'asson_ui_cgpa_entries_v1';

const VALID_LEVELS = new Set(['100', '200', '300', '400']);

function sanitizeRow(raw: unknown): CgpaCourseRow | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== 'string' || !r.id.trim()) return null;

  return {
    id: r.id,
    code: typeof r.code === 'string' ? r.code : '',
    title: typeof r.title === 'string' ? r.title : '',
    unit:
      typeof r.unit === 'string'
        ? r.unit
        : typeof r.unit === 'number' && Number.isFinite(r.unit)
        ? String(r.unit)
        : '',
    grade: typeof r.grade === 'string' ? r.grade : 'A',
    isResit: Boolean(r.isResit),
  };
}

function sanitizeSemester(raw: unknown): CgpaSemesterSection | null {
  if (!raw || typeof raw !== 'object') return null;
  const s = raw as Record<string, unknown>;
  if (typeof s.id !== 'string' || !s.id.trim()) return null;
  const level = typeof s.level === 'string' && VALID_LEVELS.has(s.level)
    ? (s.level as '100' | '200' | '300' | '400')
    : '100';
  const semester = s.semester === 2 ? 2 : 1;
  const courses = Array.isArray(s.courses)
    ? s.courses.map(sanitizeRow).filter((row): row is CgpaCourseRow => row !== null)
    : [];

  return {
    id: s.id,
    level,
    semester,
    courses,
  };
}

/**
 * Safely reads persisted CGPA semester entries from localStorage.
 * Handles missing or corrupted payloads gracefully without throwing.
 */
export function loadCgpaSemesters(): CgpaSemesterSection[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(CGPA_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(sanitizeSemester)
      .filter((sem): sem is CgpaSemesterSection => sem !== null);
  } catch {
    return [];
  }
}

/**
 * Safely writes CGPA semester entries to localStorage (device-only, never sent to server).
 */
export function saveCgpaSemesters(semesters: CgpaSemesterSection[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CGPA_STORAGE_KEY, JSON.stringify(semesters));
  } catch {
    // Ignore quota or private mode storage exceptions cleanly
  }
}

/**
 * Safely clears stored CGPA entries from localStorage.
 */
export function clearCgpaSemesters(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(CGPA_STORAGE_KEY);
  } catch {
    // ignore
  }
}
