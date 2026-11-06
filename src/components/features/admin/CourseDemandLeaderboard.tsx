import React, { useMemo } from 'react';
import { Award, BookOpen, FileCheck } from 'lucide-react';
import { COURSES } from '../../../lib/mockData';

export const CourseDemandLeaderboard: React.FC = () => {
  // Check for real resources stored locally or in database
  const rankedCourses = useMemo(() => {
    try {
      const custom = JSON.parse(localStorage.getItem('asson_custom_resources') || '[]');
      if (Array.isArray(custom) && custom.length > 0) {
        // Group by courseCode and count
        const counts: Record<string, number> = {};
        custom.forEach((r: any) => {
          counts[r.courseCode] = (counts[r.courseCode] || 0) + 1;
        });
        return Object.entries(counts)
          .map(([code, count]) => {
            const meta = COURSES.find((c) => c.code === code) || {
              title: 'Departmental Course',
              level: '200',
            };
            return {
              code,
              title: meta.title,
              level: meta.level,
              count,
            };
          })
          .sort((a, b) => b.count - a.count);
      }
    } catch {
      // ignore
    }
    return [];
  }, []);

  return (
    <div className="rounded-3xl border border-border-light bg-surface-card p-5 sm:p-7 shadow-card space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-border-light/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-brand-green">
              <Award className="w-4 h-4" />
            </span>
            <h3 className="text-sm sm:text-base font-extrabold text-text-main tracking-tight">
              Curriculum Demand Leaderboard
            </h3>
          </div>
          <p className="text-xs text-text-muted mt-0.5">
            Most contributed and requested courses across UI Statistics levels.
          </p>
        </div>
        <span className="text-xs font-bold text-brand-green bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 hidden sm:inline-block">
          {COURSES.length} Courses Catalogued
        </span>
      </div>

      {rankedCourses.length > 0 ? (
        <div className="space-y-3.5">
          {rankedCourses.map((course, idx) => (
            <div
              key={course.code}
              className="p-3.5 rounded-2xl bg-surface-bg border border-border-light/70 hover:border-brand-green/40 hover:bg-emerald-50/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-extrabold shrink-0 ${
                    idx === 0
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : idx === 1
                      ? 'bg-slate-200 text-slate-700'
                      : idx === 2
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-white text-text-muted border border-border-light'
                  }`}
                >
                  #{idx + 1}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs sm:text-sm text-text-main">
                      {course.code}
                    </span>
                    <span className="text-[10px] text-text-muted font-medium px-1.5 py-0.2 rounded bg-neutral-100">
                      {course.level}L
                    </span>
                  </div>
                  <p className="text-xs text-text-muted truncate mt-0.5">{course.title}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-brand-green">
                <FileCheck className="w-4 h-4" />
                <span>{course.count} Document{course.count === 1 ? '' : 's'}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Honest zero-fake-data empty state */
        <div className="py-8 px-4 text-center rounded-2xl border border-dashed border-border-light bg-surface-bg/50 space-y-2">
          <BookOpen className="w-8 h-8 text-text-subtle mx-auto opacity-50" />
          <h4 className="text-xs sm:text-sm font-bold text-text-main">
            Leaderboard Awaiting Upload Activity
          </h4>
          <p className="text-xs text-text-muted max-w-sm mx-auto leading-relaxed">
            As students and course reps upload past papers and notes, courses will be ranked here by real contribution and download frequency.
          </p>
        </div>
      )}
    </div>
  );
};
