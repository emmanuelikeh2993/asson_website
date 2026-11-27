import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Trash2,
  AlertTriangle,
  Info,
  RotateCcw,
  Check,
  X as XIcon,
  Search,
} from 'lucide-react';
import { Course } from '../../../types';
import {
  CalculatedRowMeta,
  CgpaCourseRow,
  searchCourseSuggestions,
} from '../../../lib/cgpaCalculator';
import { GRADE_OPTIONS } from '../../../lib/gradingConfig';

interface CgpaCourseRowItemProps {
  semesterId: string;
  row: CgpaCourseRow;
  meta: CalculatedRowMeta;
  catalog: Course[];
  onChangeRow: (
    semesterId: string,
    rowId: string,
    patch: Partial<CgpaCourseRow>
  ) => void;
  onDeleteRow: (semesterId: string, rowId: string) => void;
}

export const CgpaCourseRowItem: React.FC<CgpaCourseRowItemProps> = React.memo(
  ({ semesterId, row, meta, catalog, onChangeRow, onDeleteRow }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [manualMode, setManualMode] = useState(false);
    const [candidateQueue, setCandidateQueue] = useState<Course[]>([]);
    const [candidateIndex, setCandidateIndex] = useState(0);
    const [showResitTooltip, setShowResitTooltip] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const suggestions = useMemo(() => {
      if (manualMode || !row.code.trim()) return [];
      return searchCourseSuggestions(row.code, catalog, 5);
    }, [row.code, catalog, manualMode]);

    const pendingCandidate =
      candidateQueue.length > 0 && candidateIndex < candidateQueue.length
        ? candidateQueue[candidateIndex]
        : null;

    // Close dropdown cleanly when clicking outside
    useEffect(() => {
      const handleOutside = (e: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target as Node)
        ) {
          setIsFocused(false);
        }
      };
      document.addEventListener('mousedown', handleOutside);
      return () => document.removeEventListener('mousedown', handleOutside);
    }, []);

    const handleCodeChange = (val: string) => {
      // Typing resets confirmation & re-enables suggestions cleanly
      setManualMode(false);
      setCandidateQueue([]);
      setCandidateIndex(0);
      setIsFocused(true);
      onChangeRow(semesterId, row.id, { code: val });
    };

    const handlePickSuggestion = (picked: Course) => {
      // Build queue starting with clicked course, followed by remaining closest matches
      const rest = suggestions.filter((c) => c.code !== picked.code);
      setCandidateQueue([picked, ...rest]);
      setCandidateIndex(0);
      setIsFocused(false);
    };

    const handleConfirmCandidate = () => {
      if (!pendingCandidate) return;
      onChangeRow(semesterId, row.id, {
        code: pendingCandidate.code,
        title: pendingCandidate.title,
        unit: String(pendingCandidate.units),
      });
      setCandidateQueue([]);
      setCandidateIndex(0);
      setManualMode(false);
    };

    const handleRejectCandidate = () => {
      const nextIdx = candidateIndex + 1;
      if (nextIdx < candidateQueue.length) {
        setCandidateIndex(nextIdx);
      } else {
        // No remaining suggestions: switch seamlessly to manual entry
        setCandidateQueue([]);
        setCandidateIndex(0);
        setManualMode(true);
      }
    };

    const { validation, qualityPoint, isZeroUnitExcluded, isSupersededByResit, isDuplicateWarning } =
      meta;

    const showDropdown =
      isFocused && !pendingCandidate && !manualMode && suggestions.length > 0;

    return (
      <div
        className={`rounded-2xl border p-3.5 sm:p-4 transition-colors space-y-3 ${
          !validation.isValid
            ? 'border-brand-red/60 bg-red-50/30 dark:bg-red-950/15'
            : isSupersededByResit
            ? 'border-border-light bg-surface-bg/70 opacity-80'
            : isDuplicateWarning
            ? 'border-amber-300 dark:border-amber-700 bg-amber-50/20 dark:bg-amber-950/10'
            : 'border-border-light bg-surface-bg/40 hover:border-border-hover'
        }`}
      >
        {/* Mobile-first grid: stacks cleanly on 360px, multi-column on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
          {/* 1. Course Code + Live Suggestions */}
          <div className="sm:col-span-3 relative" ref={containerRef}>
            <label
              htmlFor={`code-${row.id}`}
              className="block text-xs font-bold text-text-muted mb-1"
            >
              Course Code
            </label>
            <div className="relative">
              <input
                id={`code-${row.id}`}
                type="text"
                value={row.code}
                onFocus={() => setIsFocused(true)}
                onChange={(e) => handleCodeChange(e.target.value)}
                placeholder="e.g. STA 211"
                autoComplete="off"
                className="w-full rounded-xl border border-border-light bg-surface-card px-3 py-2 text-xs sm:text-sm font-bold text-text-main placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-brand-green transition-all uppercase"
              />
            </div>

            {/* Suggestion Dropdown */}
            {showDropdown && (
              <div
                role="listbox"
                aria-label="Course outline suggestions"
                className="absolute left-0 right-0 sm:w-72 mt-1 z-30 rounded-xl bg-surface-card border border-border-light shadow-xl overflow-hidden divide-y divide-border-light/60 max-h-56 overflow-y-auto"
              >
                <div className="px-3 py-1.5 bg-surface-bg text-xs font-bold uppercase tracking-wider text-text-subtle flex items-center gap-1.5">
                  <Search className="w-3 h-3 text-brand-green" aria-hidden="true" />
                  <span>Course Suggestions</span>
                </div>
                {suggestions.map((course) => (
                  <button
                    key={course.code}
                    type="button"
                    role="option"
                    aria-selected={false}
                    onClick={() => handlePickSuggestion(course)}
                    className="w-full px-3 py-2.5 text-left hover:bg-surface-bg transition-colors flex items-center justify-between gap-2 cursor-pointer"
                  >
                    <div className="min-w-0">
                      <span className="text-xs font-extrabold text-brand-green block">
                        {course.code}
                      </span>
                      <span className="text-xs text-text-main line-clamp-1">
                        {course.title}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-text-muted bg-surface-bg px-2 py-0.5 rounded border border-border-light shrink-0">
                      {course.units}u
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Course Title */}
          <div className="sm:col-span-4">
            <label
              htmlFor={`title-${row.id}`}
              className="block text-xs font-bold text-text-muted mb-1"
            >
              Course Title
            </label>
            <input
              id={`title-${row.id}`}
              type="text"
              value={row.title}
              onChange={(e) =>
                onChangeRow(semesterId, row.id, { title: e.target.value })
              }
              placeholder="e.g. Probability II"
              className="w-full rounded-xl border border-border-light bg-surface-card px-3 py-2 text-xs sm:text-sm text-text-main placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-brand-green transition-all"
            />
          </div>

          {/* 3. Unit & Grade side-by-side on mobile */}
          <div className="grid grid-cols-2 sm:col-span-3 gap-2.5">
            <div>
              <label
                htmlFor={`unit-${row.id}`}
                className="block text-xs font-bold text-text-muted mb-1"
              >
                Unit (0–9)
              </label>
              <input
                id={`unit-${row.id}`}
                type="text"
                inputMode="numeric"
                value={row.unit}
                onChange={(e) =>
                  onChangeRow(semesterId, row.id, { unit: e.target.value })
                }
                placeholder="3"
                aria-invalid={Boolean(validation.unitError)}
                className={`w-full rounded-xl border bg-surface-card px-3 py-2 text-xs sm:text-sm font-mono font-bold text-text-main focus:outline-none focus:ring-2 transition-all ${
                  validation.unitError
                    ? 'border-brand-red focus:ring-brand-red'
                    : 'border-border-light focus:ring-brand-green focus:border-brand-green'
                }`}
              />
            </div>

            <div>
              <label
                htmlFor={`grade-${row.id}`}
                className="block text-xs font-bold text-text-muted mb-1"
              >
                Grade
              </label>
              <select
                id={`grade-${row.id}`}
                value={row.grade}
                onChange={(e) =>
                  onChangeRow(semesterId, row.id, { grade: e.target.value })
                }
                aria-invalid={Boolean(validation.gradeError)}
                className={`w-full rounded-xl border bg-surface-card px-2.5 py-2 text-xs sm:text-sm font-bold text-text-main focus:outline-none focus:ring-2 transition-all cursor-pointer ${
                  validation.gradeError
                    ? 'border-brand-red focus:ring-brand-red'
                    : 'border-border-light focus:ring-brand-green focus:border-brand-green'
                }`}
              >
                {GRADE_OPTIONS.map((opt) => (
                  <option key={opt.grade} value={opt.grade}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 4. QP Readout, Resit Toggle & Delete Action */}
          <div className="sm:col-span-2 flex items-center justify-between sm:justify-end gap-2 sm:pt-5">
            <div className="flex items-center gap-2">
              {/* Resit Toggle + Accessible Tooltip */}
              <div className="relative">
                <div className="inline-flex items-center rounded-xl border border-border-light bg-surface-card overflow-hidden">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={row.isResit}
                    onClick={() =>
                      onChangeRow(semesterId, row.id, { isResit: !row.isResit })
                    }
                    className={`px-2.5 py-2 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer min-h-[38px] ${
                      row.isResit
                        ? 'bg-brand-green text-white'
                        : 'text-text-muted hover:text-text-main'
                    }`}
                  >
                    <RotateCcw className="w-3 h-3" aria-hidden="true" />
                    <span>Resit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowResitTooltip((prev) => !prev)}
                    aria-label="Explain Resit rule"
                    className="px-1.5 py-2 text-text-subtle hover:text-brand-green border-l border-border-light cursor-pointer min-h-[38px]"
                    title="If marked, only the latest attempt of this course code counts."
                  >
                    <Info className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>

                {showResitTooltip && (
                  <div className="absolute right-0 bottom-full mb-2 w-56 p-2.5 rounded-xl bg-zinc-900 text-white text-xs leading-relaxed shadow-xl z-40">
                    When <strong>Resit</strong> is marked, only the latest chronological attempt of this course code counts toward your CGPA.
                  </div>
                )}
              </div>

              {/* QP pill */}
              <span
                className="text-xs font-mono font-bold px-2 py-1.5 rounded-lg bg-surface-card border border-border-light text-text-main shrink-0"
                title="Quality Points (Unit × Grade Point)"
              >
                {qualityPoint !== null ? `${qualityPoint} QP` : '—'}
              </span>
            </div>

            {/* Delete Row */}
            <button
              type="button"
              onClick={() => onDeleteRow(semesterId, row.id)}
              aria-label={`Remove ${row.code || 'course'} row`}
              className="p-2 rounded-xl text-text-subtle hover:text-brand-red hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Inline Course Suggestion Confirmation Prompt */}
        {pendingCandidate && (
          <div className="p-3 rounded-xl bg-brand-light border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 animate-in fade-in duration-150">
            <span className="text-xs font-bold text-brand-deep dark:text-emerald-200">
              Use {pendingCandidate.code} – {pendingCandidate.title} ({pendingCandidate.units}{' '}
              {pendingCandidate.units === 1 ? 'unit' : 'units'})?
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleConfirmCandidate}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-green hover:bg-brand-deep text-white text-xs font-bold transition-colors cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Yes</span>
              </button>
              <button
                type="button"
                onClick={handleRejectCandidate}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-card border border-border-light hover:border-border-hover text-text-main text-xs font-semibold transition-colors cursor-pointer"
              >
                <XIcon className="w-3.5 h-3.5" />
                <span>No</span>
              </button>
            </div>
          </div>
        )}

        {/* Inline Helper, Validation & Duplicate/Resit Status Messages */}
        {(manualMode ||
          validation.unitError ||
          validation.gradeError ||
          isZeroUnitExcluded ||
          isDuplicateWarning ||
          isSupersededByResit) && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {manualMode && !pendingCandidate && (
              <span className="text-text-muted font-medium">
                Manual entry enabled — enter course title and units directly.
              </span>
            )}
            {validation.unitError && (
              <span className="inline-flex items-center gap-1 text-brand-red font-semibold">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{validation.unitError}</span>
              </span>
            )}
            {validation.gradeError && (
              <span className="inline-flex items-center gap-1 text-brand-red font-semibold">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{validation.gradeError}</span>
              </span>
            )}
            {isZeroUnitExcluded && (
              <span className="text-text-muted font-medium">
                0-unit course excluded from GPA/CGPA calculations.
              </span>
            )}
            {isDuplicateWarning && (
              <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-300 font-semibold">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>
                  Duplicate course code detected. Mark <strong>Resit</strong> on the latest attempt if retaken.
                </span>
              </span>
            )}
            {isSupersededByResit && (
              <span className="inline-flex items-center gap-1 text-text-muted font-semibold">
                <RotateCcw className="w-3 h-3 shrink-0" />
                <span>Superseded by your latest Resit attempt (excluded from totals).</span>
              </span>
            )}
          </div>
        )}
      </div>
    );
  }
);
