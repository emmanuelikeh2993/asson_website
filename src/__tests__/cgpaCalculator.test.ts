import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  calculateCgpaSummary,
  formatGpa,
  getDegreeClass,
  mergeOfficialCatalog,
  searchCourseSuggestions,
  validateCourseRow,
  CgpaSemesterSection,
} from '../lib/cgpaCalculator';
import {
  loadCgpaSemesters,
  saveCgpaSemesters,
  clearCgpaSemesters,
  CGPA_STORAGE_KEY,
} from '../lib/cgpaStorage';
import { COURSES } from '../lib/mockData';
import { Course } from '../types';

describe('CGPA Calculator Pure Logic', () => {
  it('handles an empty semester list without NaN or Infinity', () => {
    const res = calculateCgpaSummary([]);
    expect(res.totalUnits).toBe(0);
    expect(res.totalQualityPoints).toBe(0);
    expect(res.cgpa).toBeNull();
    expect(formatGpa(res.cgpa)).toBe('—');
    expect(res.degreeClass).toBe('—');
  });

  it('calculates a single course accurately', () => {
    const semesters: CgpaSemesterSection[] = [
      {
        id: 'sem-1',
        level: '100',
        semester: 1,
        courses: [
          { id: 'r1', code: 'STA 111', title: 'Descriptive Statistics', unit: '3', grade: 'B', isResit: false },
        ],
      },
    ];

    const res = calculateCgpaSummary(semesters);
    expect(res.totalUnits).toBe(3);
    expect(res.totalQualityPoints).toBe(12);
    expect(res.cgpa).toBe(4);
    expect(formatGpa(res.cgpa)).toBe('4.00');
    expect(res.degreeClass).toBe('Second Class Upper');
    expect(formatGpa(res.semesterResults['sem-1'].gpa)).toBe('4.00');
  });

  it('handles normal multi-semester GPA and CGPA accurately', () => {
    const semesters: CgpaSemesterSection[] = [
      {
        id: 's1',
        level: '100',
        semester: 1,
        courses: [
          { id: 'c1', code: 'STA 111', title: 'Descriptive Statistics', unit: '3', grade: 'A', isResit: false }, // 15
          { id: 'c2', code: 'MTH 101', title: 'Elementary Mathematics I', unit: '2', grade: 'B', isResit: false }, // 8
        ],
      },
      {
        id: 's2',
        level: '100',
        semester: 2,
        courses: [
          { id: 'c3', code: 'STA 121', title: 'Statistical Inference I', unit: '3', grade: 'A', isResit: false }, // 15
          { id: 'c4', code: 'MAT 142', title: 'Actuarial Maths', unit: '4', grade: 'C', isResit: false }, // 12
        ],
      },
    ];

    const res = calculateCgpaSummary(semesters);
    // Sem 1: 23 / 5 = 4.60; Sem 2: 27 / 7 = 3.8571...
    expect(formatGpa(res.semesterResults['s1'].gpa)).toBe('4.60');
    expect(formatGpa(res.semesterResults['s2'].gpa)).toBe('3.86');
    // Overall: 50 / 12 = 4.16666...
    expect(res.totalUnits).toBe(12);
    expect(res.totalQualityPoints).toBe(50);
    expect(res.cgpa).toBeCloseTo(50 / 12, 10);
    expect(formatGpa(res.cgpa)).toBe('4.17');
    expect(res.degreeClass).toBe('Second Class Upper');
  });

  it('handles all F grades cleanly (0.00, not NaN or empty)', () => {
    const semesters: CgpaSemesterSection[] = [
      {
        id: 's1',
        level: '100',
        semester: 1,
        courses: [
          { id: 'c1', code: 'STA 111', title: 'Descriptive Statistics', unit: '3', grade: 'F', isResit: false },
          { id: 'c2', code: 'STA 112', title: 'Probability I', unit: '3', grade: 'F', isResit: false },
        ],
      },
    ];

    const res = calculateCgpaSummary(semesters);
    expect(res.totalUnits).toBe(6);
    expect(res.totalQualityPoints).toBe(0);
    expect(res.cgpa).toBe(0);
    expect(formatGpa(res.cgpa)).toBe('0.00');
    expect(res.degreeClass).toBe('Below Pass');
  });

  it('excludes 0-unit courses and displays "—" if total units is 0', () => {
    const onlyZero: CgpaSemesterSection[] = [
      {
        id: 's1',
        level: '100',
        semester: 1,
        courses: [
          { id: 'z1', code: 'GNS 001', title: 'Orientation Seminar', unit: '0', grade: 'A', isResit: false },
        ],
      },
    ];

    const zeroRes = calculateCgpaSummary(onlyZero);
    expect(zeroRes.totalUnits).toBe(0);
    expect(zeroRes.totalQualityPoints).toBe(0);
    expect(zeroRes.cgpa).toBeNull();
    expect(formatGpa(zeroRes.cgpa)).toBe('—');
    expect(zeroRes.rowMeta['z1'].isZeroUnitExcluded).toBe(true);

    // Alongside a valid non-zero course, 0-unit row does not inflate units or QP
    const mixed: CgpaSemesterSection[] = [
      {
        id: 's1',
        level: '100',
        semester: 1,
        courses: [
          { id: 'z1', code: 'GNS 001', title: 'Orientation', unit: '0', grade: 'F', isResit: false },
          { id: 'c1', code: 'STA 111', title: 'Descriptive Statistics', unit: '3', grade: 'A', isResit: false },
        ],
      },
    ];
    const mixedRes = calculateCgpaSummary(mixed);
    expect(mixedRes.totalUnits).toBe(3);
    expect(mixedRes.totalQualityPoints).toBe(15);
    expect(formatGpa(mixedRes.cgpa)).toBe('5.00');
    expect(mixedRes.degreeClass).toBe('First Class');
  });

  it('maintains full intermediate decimal precision without premature rounding', () => {
    // Sem 1: 2 units A (10) + 1 unit E (1) => 11 / 3 = 3.6666... (displays 3.67)
    // Sem 2: 2 units A (10) + 1 unit F (0) => 10 / 3 = 3.3333... (displays 3.33)
    // Combined exact: 21 / 6 = 3.50 (Second Class Upper)
    // Another test with 1/3 repeating totals: 4 units A (20) + 2 units E (2) => 22 / 6 = 3.6666...
    // Check unweighted vs unit-weighted precision: 13 / 3 = 4.3333..., 14 / 3 = 4.6666...
    // Exact combined = 27 / 6 = 4.50 -> First Class!
    const semesters: CgpaSemesterSection[] = [
      {
        id: 's1',
        level: '100',
        semester: 1,
        courses: [
          { id: 'c1', code: 'STA 111', title: 'Desc', unit: '2', grade: 'A', isResit: false }, // 10
          { id: 'c2', code: 'GES 107', title: 'Health', unit: '1', grade: 'D', isResit: false }, // 2 -> 12/3=4.00; wait use 1 unit B (4) => 14/3 = 4.6666
        ],
      },
      {
        id: 's2',
        level: '100',
        semester: 2,
        courses: [
          { id: 'c3', code: 'STA 121', title: 'Inf', unit: '2', grade: 'A', isResit: false }, // 10
          { id: 'c4', code: 'GES 108', title: 'French', unit: '1', grade: 'C', isResit: false }, // 3 -> 13/3 = 4.3333
        ],
      },
    ];
    semesters[0].courses[1].grade = 'B'; // 10 + 4 = 14 / 3 = 4.666666...

    const res = calculateCgpaSummary(semesters);
    expect(formatGpa(res.semesterResults['s1'].gpa)).toBe('4.67');
    expect(formatGpa(res.semesterResults['s2'].gpa)).toBe('4.33');
    // 27 / 6 = 4.50 exact (no rounding error!)
    expect(res.cgpa).toBe(4.5);
    expect(formatGpa(res.cgpa)).toBe('4.50');
    expect(res.degreeClass).toBe('First Class');
  });

  it('classifies all degree class boundaries accurately', () => {
    expect(getDegreeClass(5.0)).toBe('First Class');
    expect(getDegreeClass(4.5)).toBe('First Class');
    expect(getDegreeClass(4.49)).toBe('Second Class Upper');
    expect(getDegreeClass(3.5)).toBe('Second Class Upper');
    expect(getDegreeClass(3.49)).toBe('Second Class Lower');
    expect(getDegreeClass(2.4)).toBe('Second Class Lower');
    expect(getDegreeClass(2.39)).toBe('Third Class');
    expect(getDegreeClass(1.5)).toBe('Third Class');
    expect(getDegreeClass(1.49)).toBe('Pass');
    expect(getDegreeClass(1.0)).toBe('Pass');
    expect(getDegreeClass(0.99)).toBe('Below Pass');
  });

  it('flags invalid units and grades and excludes invalid rows from calculation', () => {
    expect(validateCourseRow({ unit: '-1', grade: 'A' }).isValid).toBe(false);
    expect(validateCourseRow({ unit: '10', grade: 'A' }).isValid).toBe(false);
    expect(validateCourseRow({ unit: '2.5', grade: 'A' }).isValid).toBe(false);
    expect(validateCourseRow({ unit: '3', grade: 'Z' }).isValid).toBe(false);
    expect(validateCourseRow({ unit: '3', grade: 'A' }).isValid).toBe(true);

    const semesters: CgpaSemesterSection[] = [
      {
        id: 's1',
        level: '200',
        semester: 1,
        courses: [
          { id: 'bad1', code: 'STA 211', title: 'Bad unit', unit: '12', grade: 'A', isResit: false },
          { id: 'bad2', code: 'STA 219', title: 'Decimal', unit: '2.5', grade: 'B', isResit: false },
          { id: 'good', code: 'COS 201', title: 'Valid', unit: '3', grade: 'A', isResit: false },
        ],
      },
    ];

    const res = calculateCgpaSummary(semesters);
    expect(res.invalidRowCount).toBe(2);
    expect(res.totalUnits).toBe(3);
    expect(res.totalQualityPoints).toBe(15);
    expect(formatGpa(res.cgpa)).toBe('5.00');
  });

  it('warns on duplicate course codes without dropping rows, and counts only latest attempt when Resit is marked', () => {
    const duplicateSemesters: CgpaSemesterSection[] = [
      {
        id: 's1',
        level: '100',
        semester: 1,
        courses: [
          { id: 'r1', code: 'STA 111', title: 'Desc', unit: '3', grade: 'F', isResit: false },
          { id: 'r2', code: 'sta111', title: 'Desc', unit: '3', grade: 'B', isResit: false },
        ],
      },
    ];

    const dupRes = calculateCgpaSummary(duplicateSemesters);
    expect(dupRes.duplicateCourseCodes).toContain('STA111');
    // Both rows kept when Resit is NOT marked
    expect(dupRes.totalUnits).toBe(6);
    expect(dupRes.totalQualityPoints).toBe(12);

    // Mark Resit on latest attempt across semesters: only latest attempt counts
    const resitSemesters: CgpaSemesterSection[] = [
      {
        id: 's100',
        level: '100',
        semester: 1,
        courses: [
          { id: 'attempt1', code: 'STA 111', title: 'Desc', unit: '3', grade: 'F', isResit: false },
        ],
      },
      {
        id: 's200',
        level: '200',
        semester: 1,
        courses: [
          { id: 'attempt2', code: 'sta-111', title: 'Desc', unit: '3', grade: 'A', isResit: true },
        ],
      },
    ];

    const resitRes = calculateCgpaSummary(resitSemesters);
    expect(resitRes.duplicateCourseCodes).toHaveLength(0);
    expect(resitRes.supersededRowIds).toEqual(['attempt1']);
    expect(resitRes.rowMeta['attempt1'].isSupersededByResit).toBe(true);
    expect(resitRes.rowMeta['attempt2'].countsInTotal).toBe(true);
    expect(resitRes.totalUnits).toBe(3);
    expect(resitRes.totalQualityPoints).toBe(15);
    expect(formatGpa(resitRes.cgpa)).toBe('5.00');
  });

  it('merges official catalog first and matches courses ignoring case, spaces, and hyphens', () => {
    const staleRemote: Course[] = [
      { code: 'STA 211', title: 'Old DB Title', level: '200', semester: 1, units: 9 },
      { code: 'STA 316', title: 'Environmental Statistics I', level: '300', semester: 1, units: 3 },
    ];
    const catalog = mergeOfficialCatalog(COURSES, staleRemote);

    // Official COURSES version of STA 211 wins over stale remote row
    const sta211 = catalog.find((c) => c.code === 'STA 211');
    expect(sta211?.title).toBe('Probability II');
    expect(sta211?.units).toBe(3);

    // Extra 300L course from remote is still preserved
    expect(catalog.some((c) => c.code === 'STA 316')).toBe(true);

    // Matching ignores case, spaces, and hyphens
    expect(searchCourseSuggestions('sta211', catalog)[0]?.code).toBe('STA 211');
    expect(searchCourseSuggestions('sta-111', catalog)[0]?.code).toBe('STA 111');
    expect(searchCourseSuggestions('probability ii', catalog).some((c) => c.code === 'STA 211')).toBe(true);
  });
});

describe('CGPA LocalStorage Persistence Safety', () => {
  const store: Record<string, string> = {};
  const originalWindow = globalThis.window;

  beforeEach(() => {
    for (const k of Object.keys(store)) delete store[k];
    (globalThis as any).window = {
      localStorage: {
        getItem: (k: string) => (k in store ? store[k] : null),
        setItem: (k: string, v: string) => {
          store[k] = String(v);
        },
        removeItem: (k: string) => {
          delete store[k];
        },
      },
    };
  });

  afterEach(() => {
    (globalThis as any).window = originalWindow;
  });

  it('saves, loads, clears, and survives corrupted storage safely', () => {
    const sample: CgpaSemesterSection[] = [
      {
        id: 'sem-1',
        level: '100',
        semester: 1,
        courses: [{ id: 'c1', code: 'STA 111', title: 'Descriptive Statistics', unit: '3', grade: 'A', isResit: false }],
      },
    ];
    saveCgpaSemesters(sample);
    expect(loadCgpaSemesters()).toEqual(sample);

    // Corrupted JSON never crashes
    store[CGPA_STORAGE_KEY] = '{not valid json';
    expect(loadCgpaSemesters()).toEqual([]);

    // Non-array JSON never crashes
    store[CGPA_STORAGE_KEY] = '{"unexpected":true}';
    expect(loadCgpaSemesters()).toEqual([]);

    clearCgpaSemesters();
    expect(loadCgpaSemesters()).toEqual([]);
  });
});
