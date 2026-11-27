import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { trackEvent } from '../lib/telemetry';
import {
  ArrowLeft,
  Calculator,
  PlusCircle,
  Trash2,
  AlertTriangle,
  Info,
  Award,
} from 'lucide-react';
import { Course } from '../types';
import { COURSES } from '../lib/mockData';
import { fetchCourses } from '../lib/supabase';
import {
  CGPA_LEVELS,
  CGPA_SEMESTERS,
} from '../lib/gradingConfig';
import {
  CgpaCourseRow,
  CgpaSemesterSection,
  calculateCgpaSummary,
  formatGpa,
  mergeOfficialCatalog,
} from '../lib/cgpaCalculator';
import {
  clearCgpaSemesters,
  loadCgpaSemesters,
  saveCgpaSemesters,
} from '../lib/cgpaStorage';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { CgpaCourseRowItem } from '../components/features/cgpa/CgpaCourseRowItem';

function createEmptyCourseRow(): CgpaCourseRow {
  return {
    id: `cgpa-row-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    code: '',
    title: '',
    unit: '3',
    grade: 'A',
    isResit: false,
  };
}

export const CgpaCalculatorPage: React.FC = () => {
  const toast = useToast();

  // Official catalog loaded synchronously for instant suggestions, enriched with extra remote courses
  const [catalog, setCatalog] = useState<Course[]>(COURSES);

  // Persisted browser-local entries
  const [semesters, setSemesters] = useState<CgpaSemesterSection[]>(() =>
    loadCgpaSemesters()
  );

  // Controls for adding a new semester block
  const [newLevel, setNewLevel] = useState<'100' | '200' | '300' | '400'>('100');
  const [newSemesterNum, setNewSemesterNum] = useState<1 | 2>(1);

  // Confirmation dialogs
  const [isClearAllOpen, setIsClearAllOpen] = useState(false);
  const [semesterToRemove, setSemesterToRemove] = useState<CgpaSemesterSection | null>(null);

  // Publicly readable catalog fetch (available to both signed-in and guest visitors)
  useEffect(() => {
    let active = true;
    fetchCourses().then((remote) => {
      if (active && remote && remote.length > 0) {
        setCatalog(mergeOfficialCatalog(COURSES, remote));
      }
    });
    return () => {
      active = false;
    };
  }, []);

  // Persist entries safely to localStorage on every update (never sent to server)
  useEffect(() => {
    saveCgpaSemesters(semesters);
  }, [semesters]);

  // Keep semesters sorted chronologically (100L 1st -> 100L 2nd -> 200L 1st -> ...)
  const orderedSemesters = useMemo(() => {
    return [...semesters].sort((a, b) => {
      const levelDiff = Number(a.level) - Number(b.level);
      if (levelDiff !== 0) return levelDiff;
      return a.semester - b.semester;
    });
  }, [semesters]);

  // Pure calculation engine
  const summary = useMemo(() => calculateCgpaSummary(orderedSemesters), [orderedSemesters]);

  const hasTrackedComputeRef = useRef(false);
  useEffect(() => {
    if (!hasTrackedComputeRef.current && summary.totalUnits > 0 && summary.cgpa !== null) {
      hasTrackedComputeRef.current = true;
      trackEvent('cgpa_computed', {
        semesterCount: orderedSemesters.length,
        totalUnits: summary.totalUnits,
      });
    }
  }, [orderedSemesters.length, summary.totalUnits, summary.cgpa]);

  const handleAddSemester = useCallback(
    (level: '100' | '200' | '300' | '400' = newLevel, semesterNum: 1 | 2 = newSemesterNum) => {
      const exists = semesters.some(
        (s) => s.level === level && s.semester === semesterNum
      );
      if (exists) {
        toast.info(
          'Semester Already Added',
          `${level} Level — ${semesterNum === 1 ? 'First' : 'Second'} Semester is already in your list.`
        );
        return;
      }

      const next: CgpaSemesterSection = {
        id: `sem-${level}-${semesterNum}-${Date.now()}`,
        level,
        semester: semesterNum,
        courses: [createEmptyCourseRow()],
      };
      setSemesters((prev) => [...prev, next]);
    },
    [newLevel, newSemesterNum, semesters, toast]
  );

  const handleRequestRemoveSemester = useCallback((sem: CgpaSemesterSection) => {
    if (sem.courses.length === 0) {
      setSemesters((prev) => prev.filter((s) => s.id !== sem.id));
    } else {
      setSemesterToRemove(sem);
    }
  }, []);

  const handleConfirmRemoveSemester = () => {
    if (!semesterToRemove) return;
    setSemesters((prev) => prev.filter((s) => s.id !== semesterToRemove.id));
    setSemesterToRemove(null);
  };

  const handleAddCourseRow = useCallback((semesterId: string) => {
    setSemesters((prev) =>
      prev.map((sem) =>
        sem.id === semesterId
          ? { ...sem, courses: [...sem.courses, createEmptyCourseRow()] }
          : sem
      )
    );
  }, []);

  const handleChangeCourseRow = useCallback(
    (semesterId: string, rowId: string, patch: Partial<CgpaCourseRow>) => {
      setSemesters((prev) =>
        prev.map((sem) => {
          if (sem.id !== semesterId) return sem;
          return {
            ...sem,
            courses: sem.courses.map((row) =>
              row.id === rowId ? { ...row, ...patch } : row
            ),
          };
        })
      );
    },
    []
  );

  const handleDeleteCourseRow = useCallback((semesterId: string, rowId: string) => {
    setSemesters((prev) =>
      prev.map((sem) =>
        sem.id === semesterId
          ? { ...sem, courses: sem.courses.filter((row) => row.id !== rowId) }
          : sem
      )
    );
  }, []);

  const handleConfirmClearAll = () => {
    setSemesters([]);
    clearCgpaSemesters();
    setIsClearAllOpen(false);
    toast.info('Cleared', 'All entered semesters and courses were removed.');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-28 space-y-6">
      {/* Top Breadcrumb & Title */}
      <div className="space-y-3">
        <Link
          to="/more"
          className="inline-flex items-center gap-1.5 min-h-[44px] px-2 -ml-2 text-xs font-semibold text-text-muted hover:text-brand-green transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Back to More</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-light text-brand-deep dark:text-emerald-300 text-xs font-bold mb-1.5 border border-emerald-200 dark:border-emerald-800">
              <Calculator className="w-3.5 h-3.5" aria-hidden="true" />
              <span>5.00 Scale • University of Ibadan</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight">
              CGPA Calculator
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Organize courses by level and semester. Saved automatically on this device only.
            </p>
          </div>

          {semesters.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsClearAllOpen(true)}
              className="self-start sm:self-auto text-brand-red border-red-200 hover:border-brand-red hover:bg-red-50 dark:border-red-900/60 dark:hover:bg-red-950/30 text-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </Button>
          )}
        </div>
      </div>

      {/* Live Running CGPA Summary Card */}
      <section
        aria-label="Live CGPA Summary"
        className="rounded-3xl bg-surface-card border border-border-light shadow-card p-5 sm:p-6 space-y-4"
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-3.5 rounded-2xl bg-brand-deep text-white space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-50 block">
              Running CGPA
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight">
              {formatGpa(summary.cgpa)}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface-bg border border-border-light space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-text-subtle flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-brand-green" aria-hidden="true" />
              <span>Degree Class</span>
            </span>
            <div className="text-sm sm:text-base font-extrabold text-text-main leading-snug pt-0.5">
              {summary.degreeClass}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface-bg border border-border-light space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-text-subtle block">
              Total Units
            </span>
            <div className="text-xl sm:text-2xl font-extrabold font-mono text-text-main">
              {summary.totalUnits}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface-bg border border-border-light space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-text-subtle block">
              Quality Points
            </span>
            <div className="text-xl sm:text-2xl font-extrabold font-mono text-text-main">
              {summary.totalQualityPoints}
            </div>
          </div>
        </div>

        {/* Summary Warnings (Invalid rows or Duplicate course codes) */}
        {(summary.invalidRowCount > 0 || summary.duplicateCourseCodes.length > 0) && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 flex flex-wrap items-center gap-3">
            {summary.invalidRowCount > 0 && (
              <span className="inline-flex items-center gap-1.5 font-semibold">
                <AlertTriangle className="w-4 h-4 text-brand-red shrink-0" />
                <span>
                  {summary.invalidRowCount} invalid {summary.invalidRowCount === 1 ? 'row' : 'rows'} excluded (check unit 0–9 or grade A–F).
                </span>
              </span>
            )}
            {summary.duplicateCourseCodes.length > 0 && (
              <span className="inline-flex items-center gap-1.5 font-semibold">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Duplicate code warning ({summary.duplicateCourseCodes.join(', ')}). Mark <strong>Resit</strong> if retaken.
                </span>
              </span>
            )}
          </div>
        )}

        {/* Official Estimate Disclaimer */}
        <p className="text-xs text-text-muted flex items-start gap-1.5 pt-2 border-t border-border-light/60">
          <Info className="w-3.5 h-3.5 text-brand-green shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            This result is an estimate for personal planning. Your official GPA, CGPA, and degree classification are whatever the University of Ibadan releases.
          </span>
        </p>
      </section>

      {/* Add Semester Controls */}
      <section
        aria-label="Add Semester"
        className="rounded-2xl bg-surface-card border border-border-light p-4 flex flex-col sm:flex-row sm:items-end gap-3"
      >
        <div className="grid grid-cols-2 gap-3 flex-1">
          <div>
            <label
              htmlFor="add-semester-level"
              className="block text-xs font-bold text-text-muted mb-1"
            >
              Academic Level
            </label>
            <select
              id="add-semester-level"
              value={newLevel}
              onChange={(e) =>
                setNewLevel(e.target.value as '100' | '200' | '300' | '400')
              }
              className="w-full min-h-[44px] rounded-xl border border-border-light bg-surface-bg px-3 py-2 text-xs sm:text-sm font-bold text-text-main focus:outline-none focus:ring-2 focus:ring-brand-green cursor-pointer"
            >
              {CGPA_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl} Level
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="add-semester-term"
              className="block text-xs font-bold text-text-muted mb-1"
            >
              Semester
            </label>
            <select
              id="add-semester-term"
              value={newSemesterNum}
              onChange={(e) => setNewSemesterNum(Number(e.target.value) as 1 | 2)}
              className="w-full min-h-[44px] rounded-xl border border-border-light bg-surface-bg px-3 py-2 text-xs sm:text-sm font-bold text-text-main focus:outline-none focus:ring-2 focus:ring-brand-green cursor-pointer"
            >
              {CGPA_SEMESTERS.map((sem) => (
                <option key={sem.value} value={sem.value}>
                  {sem.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={() => handleAddSemester()}
          className="w-full sm:w-auto shrink-0 font-bold text-xs sm:text-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Semester</span>
        </Button>
      </section>

      {/* Empty State or Semester Blocks */}
      {orderedSemesters.length === 0 ? (
        <div className="rounded-3xl bg-surface-card border border-border-light p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-light text-brand-green flex items-center justify-center mx-auto">
            <Calculator className="w-6 h-6" />
          </div>
          <p className="text-xs sm:text-sm text-text-muted max-w-md mx-auto">
            Add a semester and start typing a course code (such as <strong>STA 111</strong> or <strong>STA 211</strong>) or enter courses manually to compute your CGPA.
          </p>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => handleAddSemester('100', 1)}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add 100 Level – First Semester</span>
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          {orderedSemesters.map((sem) => {
            const semResult = summary.semesterResults[sem.id];
            const semLabel = sem.semester === 1 ? 'First Semester' : 'Second Semester';

            return (
              <section
                key={sem.id}
                aria-label={`${sem.level} Level ${semLabel}`}
                className="rounded-3xl bg-surface-card border border-border-light shadow-2xs overflow-hidden"
              >
                {/* Semester Header */}
                <div className="p-4 sm:p-5 bg-surface-bg/70 border-b border-border-light flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm sm:text-base font-extrabold text-text-main">
                      {sem.level} Level • {semLabel}
                    </h2>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted mt-0.5">
                      <span>
                        Semester GPA:{' '}
                        <strong className="text-brand-green font-mono text-xs">
                          {formatGpa(semResult?.gpa ?? null)}
                        </strong>
                      </span>
                      <span aria-hidden="true">•</span>
                      <span>
                        Units: <strong className="font-mono text-text-main">{semResult?.totalUnits ?? 0}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        QP: <strong className="font-mono text-text-main">{semResult?.totalQualityPoints ?? 0}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => handleAddCourseRow(sem.id)}
                      className="text-xs font-bold"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Add Course</span>
                    </Button>
                    <button
                      type="button"
                      onClick={() => handleRequestRemoveSemester(sem)}
                      aria-label={`Remove ${sem.level} Level ${semLabel}`}
                      className="p-2 rounded-xl border border-border-light bg-surface-card text-text-subtle hover:text-brand-red hover:border-brand-red/50 transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                      title="Remove semester"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Course Rows */}
                <div className="p-4 sm:p-5 space-y-3">
                  {sem.courses.length === 0 ? (
                    <div className="py-6 text-center text-xs text-text-muted">
                      No courses in this semester yet. Click <strong>Add Course</strong> above to add one.
                    </div>
                  ) : (
                    sem.courses.map((row) => (
                      <CgpaCourseRowItem
                        key={row.id}
                        semesterId={sem.id}
                        row={row}
                        meta={summary.rowMeta[row.id]}
                        catalog={catalog}
                        onChangeRow={handleChangeCourseRow}
                        onDeleteRow={handleDeleteCourseRow}
                      />
                    ))
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal: Clear All */}
      <Modal
        isOpen={isClearAllOpen}
        onClose={() => setIsClearAllOpen(false)}
        title="Clear All CGPA Entries?"
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs sm:text-sm text-text-muted">
          <p>
            This will remove all semesters, courses, and grades saved on this device. This action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsClearAllOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleConfirmClearAll}
            >
              Yes, Clear All
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal: Remove Non-Empty Semester */}
      <Modal
        isOpen={Boolean(semesterToRemove)}
        onClose={() => setSemesterToRemove(null)}
        title="Remove Semester?"
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs sm:text-sm text-text-muted">
          <p>
            Remove{' '}
            <strong className="text-text-main">
              {semesterToRemove?.level} Level •{' '}
              {semesterToRemove?.semester === 1 ? 'First' : 'Second'} Semester
            </strong>{' '}
            and its {semesterToRemove?.courses.length || 0} course entries?
          </p>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSemesterToRemove(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleConfirmRemoveSemester}
            >
              Remove Semester
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
