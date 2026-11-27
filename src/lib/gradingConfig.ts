import { AcademicLevel } from '../types';

export const GRADE_POINTS = {
  A: 5,
  B: 4,
  C: 3,
  D: 2,
  E: 1,
  F: 0,
} as const;

export type GradeLetter = keyof typeof GRADE_POINTS;

export const GRADE_OPTIONS: readonly { grade: GradeLetter; point: number; label: string }[] = [
  { grade: 'A', point: GRADE_POINTS.A, label: 'A (5 pts)' },
  { grade: 'B', point: GRADE_POINTS.B, label: 'B (4 pts)' },
  { grade: 'C', point: GRADE_POINTS.C, label: 'C (3 pts)' },
  { grade: 'D', point: GRADE_POINTS.D, label: 'D (2 pts)' },
  { grade: 'E', point: GRADE_POINTS.E, label: 'E (1 pt)' },
  { grade: 'F', point: GRADE_POINTS.F, label: 'F (0 pts)' },
] as const;

export interface DegreeClassBand {
  name: string;
  min: number;
  max: number;
}

export const DEGREE_CLASSES: readonly DegreeClassBand[] = [
  { name: 'First Class', min: 4.50, max: 5.00 },
  { name: 'Second Class Upper', min: 3.50, max: 4.49 },
  { name: 'Second Class Lower', min: 2.40, max: 3.49 },
  { name: 'Third Class', min: 1.50, max: 2.39 },
  { name: 'Pass', min: 1.00, max: 1.49 },
] as const;

export const BELOW_PASS_LABEL = 'Below Pass';
export const EMPTY_GPA_DISPLAY = '—';

export const MIN_COURSE_UNIT = 0;
export const MAX_COURSE_UNIT = 9;

export const CGPA_LEVELS: readonly Exclude<AcademicLevel, 'Postgraduate'>[] = [
  '100',
  '200',
  '300',
  '400',
];

export const CGPA_SEMESTERS: readonly { value: 1 | 2; label: string }[] = [
  { value: 1, label: 'First Semester' },
  { value: 2, label: 'Second Semester' },
];
