import { Course } from '../types';
import {
  BELOW_PASS_LABEL,
  DEGREE_CLASSES,
  EMPTY_GPA_DISPLAY,
  GRADE_POINTS,
  GradeLetter,
  MAX_COURSE_UNIT,
  MIN_COURSE_UNIT,
} from './gradingConfig';

export interface CgpaCourseRow {
  id: string;
  code: string;
  title: string;
  unit: string; // Stored as string so partial/invalid user edits can be flagged cleanly
  grade: string;
  isResit: boolean;
}

export interface CgpaSemesterSection {
  id: string;
  level: '100' | '200' | '300' | '400';
  semester: 1 | 2;
  courses: CgpaCourseRow[];
}

export interface RowValidationState {
  isValid: boolean;
  parsedUnit: number | null;
  parsedGrade: GradeLetter | null;
  unitError: string | null;
  gradeError: string | null;
}

export interface CalculatedRowMeta {
  validation: RowValidationState;
  qualityPoint: number | null;
  isZeroUnitExcluded: boolean;
  isSupersededByResit: boolean;
  isDuplicateWarning: boolean;
  countsInTotal: boolean;
}

export interface SemesterCalculationResult {
  semesterId: string;
  totalUnits: number;
  totalQualityPoints: number;
  gpa: number | null;
  validCourseCount: number;
  invalidRowCount: number;
}

export interface CgpaCalculationResult {
  cgpa: number | null;
  degreeClass: string;
  totalUnits: number;
  totalQualityPoints: number;
  invalidRowCount: number;
  duplicateCourseCodes: string[];
  supersededRowIds: string[];
  semesterResults: Record<string, SemesterCalculationResult>;
  rowMeta: Record<string, CalculatedRowMeta>;
}

/**
 * Normalizes a course code for matching & duplicate checks (case-insensitive, ignores spaces & hyphens).
 */
export function normalizeCourseCode(code: string): string {
  return code.trim().toUpperCase().replace(/[\s-]+/g, '');
}

/**
 * Checks whether a grade string is a valid grading key (A-F).
 */
export function isValidGrade(grade: string): grade is GradeLetter {
  return Object.prototype.hasOwnProperty.call(GRADE_POINTS, grade.trim().toUpperCase());
}

/**
 * Parses and validates an academic unit string (strict integer 0 to 9).
 */
export function parseValidUnit(rawUnit: string | number): number | null {
  if (typeof rawUnit === 'number') {
    return Number.isInteger(rawUnit) && rawUnit >= MIN_COURSE_UNIT && rawUnit <= MAX_COURSE_UNIT
      ? rawUnit
      : null;
  }
  const trimmed = rawUnit.trim();
  if (!/^\d+$/.test(trimmed)) {
    return null;
  }
  const num = Number(trimmed);
  if (!Number.isInteger(num) || num < MIN_COURSE_UNIT || num > MAX_COURSE_UNIT) {
    return null;
  }
  return num;
}

/**
 * Validates a single course entry row without throwing.
 */
export function validateCourseRow(row: Pick<CgpaCourseRow, 'unit' | 'grade'>): RowValidationState {
  const parsedUnit = parseValidUnit(row.unit);
  const normalizedGrade = row.grade.trim().toUpperCase();
  const gradeValid = isValidGrade(normalizedGrade);

  const unitError =
    parsedUnit === null
      ? `Unit must be a whole number from ${MIN_COURSE_UNIT} to ${MAX_COURSE_UNIT}.`
      : null;

  const gradeError = !gradeValid ? 'Select a grade from A to F.' : null;

  return {
    isValid: parsedUnit !== null && gradeValid,
    parsedUnit,
    parsedGrade: gradeValid ? (normalizedGrade as GradeLetter) : null,
    unitError,
    gradeError,
  };
}

/**
 * Computes raw Quality Point for a valid unit and grade (no rounding).
 */
export function calculateQualityPoint(unit: number, grade: GradeLetter): number {
  return GRADE_POINTS[grade] * unit;
}

/**
 * Formats a raw GPA/CGPA for display (rounded strictly at display time to 2 decimal places).
 * Returns "—" when null or non-finite.
 */
export function formatGpa(value: number | null): string {
  if (value === null || !Number.isFinite(value)) {
    return EMPTY_GPA_DISPLAY;
  }
  return value.toFixed(2);
}

/**
 * Maps a raw CGPA to its degree class using the configured bands.
 */
export function getDegreeClass(cgpa: number | null): string {
  if (cgpa === null || !Number.isFinite(cgpa)) {
    return EMPTY_GPA_DISPLAY;
  }
  const displayLevel = Number(cgpa.toFixed(2));
  for (const band of DEGREE_CLASSES) {
    if (displayLevel >= band.min && displayLevel <= band.max) {
      return band.name;
    }
  }
  return BELOW_PASS_LABEL;
}

/**
 * Pure CGPA and per-semester GPA calculation across all semester sections.
 * Never performs intermediate rounding. Excludes invalid rows and 0-unit courses.
 */
export function calculateCgpaSummary(semesters: CgpaSemesterSection[]): CgpaCalculationResult {
  const orderedSemesters = [...semesters].sort((a, b) => {
    const levelDiff = Number(a.level) - Number(b.level);
    if (levelDiff !== 0) return levelDiff;
    return a.semester - b.semester;
  });

  const validations: Record<string, RowValidationState> = {};
  const attemptsByCode = new Map<
    string,
    { rowId: string; isResit: boolean }[]
  >();

  let invalidRowCount = 0;

  for (const sem of orderedSemesters) {
    for (const row of sem.courses) {
      const val = validateCourseRow(row);
      validations[row.id] = val;

      if (!val.isValid) {
        invalidRowCount += 1;
        continue;
      }

      // 0-unit courses are excluded from totals & repeat calculations
      if (val.parsedUnit === 0) {
        continue;
      }

      const normCode = normalizeCourseCode(row.code);
      if (normCode) {
        const list = attemptsByCode.get(normCode) || [];
        list.push({ rowId: row.id, isResit: row.isResit });
        attemptsByCode.set(normCode, list);
      }
    }
  }

  const supersededSet = new Set<string>();
  const duplicateCodeSet = new Set<string>();

  for (const [normCode, attempts] of attemptsByCode.entries()) {
    if (attempts.length <= 1) continue;
    const hasResitFlag = attempts.some((a) => a.isResit);
    if (hasResitFlag) {
      // Only the latest attempt of that course code counts
      for (let i = 0; i < attempts.length - 1; i += 1) {
        supersededSet.add(attempts[i].rowId);
      }
    } else {
      duplicateCodeSet.add(normCode);
    }
  }

  const semesterResults: Record<string, SemesterCalculationResult> = {};
  const rowMeta: Record<string, CalculatedRowMeta> = {};

  let grandTotalUnits = 0;
  let grandTotalQp = 0;

  for (const sem of semesters) {
    let semUnits = 0;
    let semQp = 0;
    let semValidCount = 0;
    let semInvalidCount = 0;

    for (const row of sem.courses) {
      const val = validations[row.id] || validateCourseRow(row);
      const normCode = normalizeCourseCode(row.code);

      if (!val.isValid || val.parsedUnit === null || val.parsedGrade === null) {
        semInvalidCount += 1;
        rowMeta[row.id] = {
          validation: val,
          qualityPoint: null,
          isZeroUnitExcluded: false,
          isSupersededByResit: false,
          isDuplicateWarning: false,
          countsInTotal: false,
        };
        continue;
      }

      if (val.parsedUnit === 0) {
        rowMeta[row.id] = {
          validation: val,
          qualityPoint: 0,
          isZeroUnitExcluded: true,
          isSupersededByResit: false,
          isDuplicateWarning: false,
          countsInTotal: false,
        };
        continue;
      }

      const qp = calculateQualityPoint(val.parsedUnit, val.parsedGrade);
      const isSuperseded = supersededSet.has(row.id);
      const isDup = Boolean(normCode && duplicateCodeSet.has(normCode));

      if (!isSuperseded) {
        semUnits += val.parsedUnit;
        semQp += qp;
        semValidCount += 1;
        grandTotalUnits += val.parsedUnit;
        grandTotalQp += qp;
      }

      rowMeta[row.id] = {
        validation: val,
        qualityPoint: qp,
        isZeroUnitExcluded: false,
        isSupersededByResit: isSuperseded,
        isDuplicateWarning: isDup,
        countsInTotal: !isSuperseded,
      };
    }

    semesterResults[sem.id] = {
      semesterId: sem.id,
      totalUnits: semUnits,
      totalQualityPoints: semQp,
      gpa: semUnits > 0 ? semQp / semUnits : null,
      validCourseCount: semValidCount,
      invalidRowCount: semInvalidCount,
    };
  }

  const cgpa = grandTotalUnits > 0 ? grandTotalQp / grandTotalUnits : null;

  return {
    cgpa,
    degreeClass: getDegreeClass(cgpa),
    totalUnits: grandTotalUnits,
    totalQualityPoints: grandTotalQp,
    invalidRowCount,
    duplicateCourseCodes: Array.from(duplicateCodeSet),
    supersededRowIds: Array.from(supersededSet),
    semesterResults,
    rowMeta,
  };
}

/**
 * Merges the authoritative official local catalog first, then appends non-conflicting
 * additional courses from remote Supabase data.
 */
export function mergeOfficialCatalog(officialCourses: Course[], remoteCourses: Course[]): Course[] {
  const seen = new Set<string>();
  const merged: Course[] = [];

  for (const c of officialCourses) {
    const key = normalizeCourseCode(c.code);
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(c);
    }
  }

  for (const c of remoteCourses) {
    const key = normalizeCourseCode(c.code);
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(c);
    }
  }

  return merged;
}

/**
 * Searches course outlines by normalized course code or title, ranking exact/prefix
 * code matches first.
 */
export function searchCourseSuggestions(
  query: string,
  catalog: Course[],
  limit: number = 6
): Course[] {
  const raw = query.trim();
  if (!raw) return [];

  const normQuery = normalizeCourseCode(raw);
  const lowerQuery = raw.toLowerCase();

  const scored: { course: Course; score: number }[] = [];

  for (const course of catalog) {
    const normCode = normalizeCourseCode(course.code);
    const lowerTitle = course.title.toLowerCase();

    let score = 0;
    if (normQuery && normCode === normQuery) {
      score = 100;
    } else if (normQuery && normCode.startsWith(normQuery)) {
      score = 80;
    } else if (normQuery && normCode.includes(normQuery)) {
      score = 60;
    } else if (lowerTitle.startsWith(lowerQuery)) {
      score = 40;
    } else if (lowerTitle.includes(lowerQuery)) {
      score = 20;
    }

    if (score > 0) {
      scored.push({ course, score });
    }
  }

  scored.sort((a, b) => b.score - a.score || a.course.code.localeCompare(b.course.code));
  return scored.slice(0, limit).map((item) => item.course);
}
