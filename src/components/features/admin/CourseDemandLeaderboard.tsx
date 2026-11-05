import React from 'react';
import { Badge } from '../../ui/Badge';
import { BookOpen, TrendingUp, Download, Eye, Award } from 'lucide-react';

interface CourseMetric {
  code: string;
  title: string;
  level: string;
  downloads: number;
  views: number;
  percentage: number;
}

export const CourseDemandLeaderboard: React.FC = () => {
  const topCourses: CourseMetric[] = [
    { code: 'MAT 121', title: 'Calculus I: Differential & Integral', level: '100', downloads: 680, views: 1420, percentage: 95 },
    { code: 'STA 111', title: 'Probability I: Elementary Principles', level: '100', downloads: 512, views: 1180, percentage: 80 },
    { code: 'STA 312', title: 'Statistical Inference III', level: '300', downloads: 421, views: 890, percentage: 66 },
    { code: 'STA 211', title: 'Probability II: Distribution Theory', level: '200', downloads: 342, views: 760, percentage: 54 },
    { code: 'STA 322', title: 'Regression Analysis & Linear Models', level: '300', downloads: 289, views: 640, percentage: 46 },
    { code: 'STA 421', title: 'Time Series Analysis & Forecasting', level: '400', downloads: 260, views: 580, percentage: 41 },
  ];

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
            Most requested and downloaded courses across UI Statistics levels.
          </p>
        </div>
        <span className="text-xs font-bold text-brand-green bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 hidden sm:inline-block">
          57 Courses Catalogued
        </span>
      </div>

      <div className="space-y-3.5">
        {topCourses.map((course, idx) => (
          <div
            key={course.code}
            className="p-3.5 rounded-2xl bg-surface-bg border border-border-light/70 hover:border-brand-green/40 hover:bg-emerald-50/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-extrabold shrink-0 ${
                idx === 0 ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                idx === 1 ? 'bg-slate-200 text-slate-700' :
                idx === 2 ? 'bg-orange-100 text-orange-800' :
                'bg-white text-text-muted border border-border-light'
              }`}>
                #{idx + 1}
              </span>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant="course">{course.code}</Badge>
                  <span className="text-[10px] font-mono text-text-subtle font-semibold">
                    {course.level}L
                  </span>
                </div>
                <h4 className="text-xs font-bold text-text-main truncate mt-0.5 group-hover:text-brand-green transition-colors">
                  {course.title}
                </h4>
              </div>
            </div>

            {/* Demand Meter & Stats */}
            <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border-light/50">
              <div className="w-28 sm:w-36">
                <div className="flex justify-between text-[10px] text-text-muted mb-1">
                  <span>Relative Demand</span>
                  <span className="font-bold text-text-main">{course.percentage}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-border-light overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-deep to-brand-green transition-all duration-500"
                    style={{ width: `${course.percentage}%` }}
                  />
                </div>
              </div>

              <div className="text-right min-w-[70px]">
                <span className="text-xs font-extrabold text-brand-deep block flex items-center justify-end gap-1">
                  <Download className="w-3 h-3 text-brand-green" /> {course.downloads}
                </span>
                <span className="text-[10px] text-text-muted block">
                  {course.views} views
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
