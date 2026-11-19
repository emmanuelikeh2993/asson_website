import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { DownloadCard } from '../components/features/resources/DownloadCard';
import { MOCK_RESOURCES, MOCK_NOTICES, COURSES } from '../lib/mockData';
import {
  Search,
  FileText,
  BookOpen,
  ArrowRight,
  PlusCircle,
  Bell,
  Sparkles,
  ArrowUpRight,
  GraduationCap
} from 'lucide-react';
import { AcademicResource, Notice, AcademicLevel } from '../types';
import { fetchResources, fetchNotices } from '../lib/supabase';
import { useToast } from '../components/ui/Toast';
import { LandingFaqSection } from '../components/features/home/LandingFaqSection';
import { DocumentPreviewModal } from '../components/features/resources/DocumentPreviewModal';
import { ResourceCardSkeleton } from '../components/ui/Skeleton';

interface HomePageProps {
  onOpenSearch: () => void;
  onOpenSubmit: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onOpenSearch, onOpenSubmit }) => {
  const [resources, setResources] = useState<AcademicResource[]>(MOCK_RESOURCES);
  const [notices, setNotices] = useState<Notice[]>(MOCK_NOTICES);
  const [isLoading, setIsLoading] = useState(true);
  const [previewResource, setPreviewResource] = useState<AcademicResource | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<AcademicLevel | 'All'>('All');
  const [curriculumLevel, setCurriculumLevel] = useState<'100' | '200' | '300' | '400'>('100');
  const [curriculumSemester, setCurriculumSemester] = useState<1 | 2 | 'all'>('all');
  const toast = useToast();

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetchResources().then((data) => {
        if (data && data.length > 0) setResources(data);
      }),
      fetchNotices().then((data) => {
        if (data && data.length > 0) setNotices(data);
      })
    ]).finally(() => {
      setIsLoading(false);
    });
  }, []);

  const urgentNotice = notices.find((n) => n.isUrgent);

  // Filter verified past questions by selected level tab
  const pastQuestions = resources
    .filter((r) => r.type === 'Past Question')
    .filter((r) => selectedLevel === 'All' || r.level === selectedLevel)
    .slice(0, 6);

  return (
    <div className="space-y-8 sm:space-y-12 pb-16">
      {/* 1. Authoritative Academic Hero Section */}
      <section className="relative w-full max-w-full overflow-hidden bg-brand-deep text-white pt-8 pb-10 sm:pt-14 sm:pb-16 px-4 sm:px-6 lg:px-8 border-b border-emerald-900/60">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
          {/* Subtle Departmental Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] sm:text-xs text-emerald-100 font-medium mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Association of Statistics Students of Nigeria • University of Ibadan</span>
          </div>

          {/* Clean Headline */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Academic Resource Hub
          </h1>

          {/* Primary Search Bar Trigger */}
          <div className="w-full max-w-2xl mt-4 sm:mt-5">
            <button
              onClick={onOpenSearch}
              className="w-full flex items-center justify-between p-2.5 sm:p-3 pl-4 bg-white text-text-main rounded-xl shadow-md hover:shadow-lg transition-all group border border-border-light active:scale-[0.99] cursor-pointer"
              aria-label="Search past questions or course codes"
            >
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-brand-green shrink-0" />
                <span className="text-xs sm:text-sm text-text-muted truncate">
                  Search course code (e.g. STA 211, STA 111, MAT 121) or topic...
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 rounded bg-neutral-100 border border-neutral-200 text-[10px] font-mono text-neutral-500 font-semibold">
                  ⌘K
                </kbd>
                <span className="bg-brand-green text-white text-xs font-semibold px-3 sm:px-4 py-1.5 rounded-lg group-hover:bg-brand-deep transition-colors">
                  Search
                </span>
              </div>
            </button>

            {/* Quiet Academic Level Selector Chips */}
            <div className="flex items-center justify-center flex-wrap gap-1.5 sm:gap-2 mt-3.5">
              {(['All', '100', '200', '300', '400', 'Postgraduate'] as const).map((lvl) => {
                const label = lvl === 'All' ? 'All Levels' : lvl === 'Postgraduate' ? 'PG & Masters' : `${lvl}L`;
                const isSelected = selectedLevel === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSelectedLevel(lvl)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white text-brand-deep font-bold shadow-xs'
                        : 'bg-white/10 hover:bg-white/20 text-emerald-100 border border-white/10'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Urgent Announcement Pill (If active) */}
      {urgentNotice && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-full overflow-hidden">
          <Link
            to="/notices"
            className="flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-xl bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 hover:bg-amber-100/80 dark:hover:bg-amber-900/30 transition-colors group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="p-1 rounded-md bg-amber-600 text-white shrink-0">
                <Bell className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-bold text-amber-900 dark:text-amber-200 truncate">
                {urgentNotice.title}
              </span>
              <span className="text-[11px] text-amber-800/80 dark:text-amber-300/80 hidden md:inline truncate">
                — {urgentNotice.summary}
              </span>
            </div>
            <span className="text-xs font-bold text-amber-800 dark:text-amber-300 group-hover:underline shrink-0 flex items-center gap-1">
              Read notice <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>
      )}

      {/* 3. Verified Past Examination Questions (Immediately Visible) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-full overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-text-main">
              {selectedLevel === 'All' ? 'Verified Past Examination Papers' : `${selectedLevel}L Past Examination Papers`}
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Verified examination questions across departmental and faculty courses.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenSubmit}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-green/30 bg-emerald-50 dark:bg-emerald-950/40 text-brand-green hover:bg-emerald-100 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-2xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Submit Material</span>
            </button>
            <Link
              to={selectedLevel === 'All' ? '/past-questions' : `/past-questions?level=${selectedLevel}`}
              className="text-xs font-bold text-brand-green hover:underline flex items-center gap-1 px-1 py-1.5"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Papers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {isLoading ? (
            <>
              <ResourceCardSkeleton />
              <ResourceCardSkeleton />
              <ResourceCardSkeleton />
            </>
          ) : pastQuestions.length === 0 ? (
            <div className="col-span-full py-12 text-center bg-surface-card rounded-2xl border border-border-light p-6">
              <FileText className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-50" />
              <p className="text-xs sm:text-sm font-semibold text-text-main">
                {selectedLevel === 'All' ? 'No past examination papers catalogued yet.' : `No past papers listed for ${selectedLevel}L yet.`}
              </p>
              <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
                Have examination papers or test questions? Contribute them to help your fellow statistics scholars revise effectively.
              </p>
              <button
                type="button"
                onClick={onOpenSubmit}
                className="mt-3.5 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-green text-white text-xs font-bold hover:bg-brand-deep active:scale-95 transition-all shadow-sm cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Submit a Past Question
              </button>
            </div>
          ) : (
            pastQuestions.map((res) => (
              <DownloadCard
                key={res.id}
                resource={res}
                onPreview={(r) => setPreviewResource(r)}
                onReport={(r) => {
                  toast.info('Issue Logged', `Reported issue for ${r.title}`);
                }}
              />
            ))
          )}
        </div>
      </section>

      {/* 4. Curriculum Directory By Level: 4 Bento Cards (2x2 Grid) + Semester Categorization */}
      {(() => {
        const bentoLevels = [
          {
            level: '100' as const,
            name: '100 Level',
            tag: 'Year 1 Foundation',
            subtitle: 'Elementary Probability, Calculus & Computing',
            badgeBg: 'bg-emerald-100/90 text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-200',
            cardBg: 'bg-[#EBF7F0] dark:bg-emerald-950/20',
            border: 'border-emerald-200/90 dark:border-emerald-800/80',
            hoverBorder: 'hover:border-emerald-400 dark:hover:border-emerald-600',
            pillBg: 'bg-emerald-200/70 text-emerald-900 dark:bg-emerald-900/80 dark:text-emerald-100',
            courses: COURSES.filter((c) => c.level === '100'),
          },
          {
            level: '200' as const,
            name: '200 Level',
            tag: 'Year 2 Intermediate',
            subtitle: 'Distribution Theory & Survey Sampling',
            badgeBg: 'bg-sky-100/90 text-sky-900 dark:bg-sky-900/50 dark:text-sky-200',
            cardBg: 'bg-[#ECF5FB] dark:bg-sky-950/20',
            border: 'border-sky-200/90 dark:border-sky-800/80',
            hoverBorder: 'hover:border-sky-400 dark:hover:border-sky-600',
            pillBg: 'bg-sky-200/70 text-sky-900 dark:bg-sky-900/80 dark:text-sky-100',
            courses: COURSES.filter((c) => c.level === '200'),
          },
          {
            level: '300' as const,
            name: '300 Level',
            tag: 'Year 3 Core Analytics',
            subtitle: 'Regression, ANOVA & Demography',
            badgeBg: 'bg-pink-100/90 text-pink-900 dark:bg-pink-900/50 dark:text-pink-200',
            cardBg: 'bg-[#FDF0F3] dark:bg-pink-950/20',
            border: 'border-pink-200/90 dark:border-pink-800/80',
            hoverBorder: 'hover:border-pink-400 dark:hover:border-pink-600',
            pillBg: 'bg-pink-200/70 text-pink-900 dark:bg-pink-900/80 dark:text-pink-100',
            courses: COURSES.filter((c) => c.level === '300'),
          },
          {
            level: '400' as const,
            name: '400 Level',
            tag: 'Final Year Honours',
            subtitle: 'Stochastic Processes, Time Series & Project',
            badgeBg: 'bg-amber-100/90 text-amber-900 dark:bg-amber-900/50 dark:text-amber-200',
            cardBg: 'bg-[#FEF5E9] dark:bg-amber-950/20',
            border: 'border-amber-200/90 dark:border-amber-800/80',
            hoverBorder: 'hover:border-amber-400 dark:hover:border-amber-600',
            pillBg: 'bg-amber-200/70 text-amber-900 dark:bg-amber-900/80 dark:text-amber-100',
            courses: COURSES.filter((c) => c.level === '400'),
          },
        ];

        const activeLevelConfig = bentoLevels.find((b) => b.level === curriculumLevel) || bentoLevels[0];
        const activeLevelCourses = activeLevelConfig.courses;
        const firstSemesterCourses = activeLevelCourses.filter((c) => c.semester === 1);
        const secondSemesterCourses = activeLevelCourses.filter((c) => c.semester === 2);

        return (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-full overflow-hidden space-y-4">
            {/* Section Heading */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base sm:text-xl font-extrabold text-text-main tracking-tight">
                  Curriculum & Course Outlines
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Select an academic year to explore courses, semester syllabi, and study notes.
                </p>
              </div>
              <Link
                to="/resources"
                className="text-xs font-bold text-brand-green hover:underline flex items-center gap-1 self-start sm:self-auto"
              >
                <span>All Courses Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 4 Bento Level Cards (2x2 Grid matching reference inspiration) */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {bentoLevels.map((bento) => {
                const isSelected = curriculumLevel === bento.level;
                return (
                  <button
                    key={bento.level}
                    type="button"
                    onClick={() => {
                      setCurriculumLevel(bento.level);
                      setCurriculumSemester('all');
                    }}
                    className={`relative p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all duration-200 text-left cursor-pointer flex flex-col justify-between min-h-[125px] sm:min-h-[145px] active:scale-[0.98] ${
                      bento.cardBg
                    } ${bento.border} ${bento.hoverBorder} ${
                      isSelected
                        ? 'ring-2 ring-brand-green shadow-md scale-[1.01]'
                        : 'shadow-2xs opacity-95 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full gap-2">
                      <span className={`text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 rounded-full ${bento.badgeBg}`}>
                        {bento.tag}
                      </span>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform shrink-0 ${bento.pillBg}`}>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    <div className="mt-3">
                      <h4 className="text-base sm:text-xl font-extrabold text-text-main tracking-tight">
                        {bento.name}
                      </h4>
                      <p className="text-[11px] sm:text-xs text-text-muted mt-0.5 line-clamp-1">
                        {bento.subtitle}
                      </p>
                      <span className="text-[10px] font-semibold text-text-subtle mt-1 block">
                        {bento.courses.length} Approved Courses
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Level Semester Drill-Down Box */}
            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-surface-card border border-border-light shadow-sm space-y-5 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-light/60">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-xs border ${activeLevelConfig.badgeBg} ${activeLevelConfig.border}`}>
                    {curriculumLevel}L
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-extrabold text-text-main">
                      {curriculumLevel} Level Courses & Syllabi
                    </h4>
                    <span className="text-[11px] sm:text-xs text-text-muted">
                      Official course outlines, units, and semester breakdown
                    </span>
                  </div>
                </div>

                {/* Semester Switcher Tabs */}
                <div className="inline-flex p-1 rounded-xl bg-surface-bg border border-border-light self-start sm:self-auto text-xs">
                  <button
                    type="button"
                    onClick={() => setCurriculumSemester('all')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      curriculumSemester === 'all'
                        ? 'bg-brand-green text-white shadow-2xs'
                        : 'text-text-muted hover:text-text-main'
                    }`}
                  >
                    All Semesters
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurriculumSemester(1)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      curriculumSemester === 1
                        ? 'bg-brand-green text-white shadow-2xs'
                        : 'text-text-muted hover:text-text-main'
                    }`}
                  >
                    First Semester
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurriculumSemester(2)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      curriculumSemester === 2
                        ? 'bg-brand-green text-white shadow-2xs'
                        : 'text-text-muted hover:text-text-main'
                    }`}
                  >
                    Second Semester
                  </button>
                </div>
              </div>

              {/* First Semester Group */}
              {(curriculumSemester === 'all' || curriculumSemester === 1) && (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-text-muted uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>First Semester Courses ({firstSemesterCourses.length})</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {firstSemesterCourses.map((c) => (
                      <Link
                        key={c.code}
                        to={`/resources?course=${encodeURIComponent(c.code)}`}
                        className="p-3.5 rounded-xl border border-border-light bg-surface-bg hover:border-brand-green/60 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 transition-all flex items-start justify-between gap-3 group active:scale-[0.99]"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-surface-card border border-border-light text-brand-deep group-hover:text-brand-green group-hover:border-brand-green/40 transition-colors">
                              {c.code}
                            </span>
                            <span className="text-[10px] font-semibold text-text-subtle font-mono">
                              {c.units} Units
                            </span>
                          </div>
                          <p className="text-xs font-bold text-text-main group-hover:text-brand-green transition-colors line-clamp-1">
                            {c.title}
                          </p>
                          <span className="text-[11px] text-text-muted mt-0.5 block">
                            View outline & study materials
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-text-subtle group-hover:text-brand-green group-hover:translate-x-0.5 transition-transform shrink-0 mt-1" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Second Semester Group */}
              {(curriculumSemester === 'all' || curriculumSemester === 2) && (
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-text-muted uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-sky-500" />
                    <span>Second Semester Courses ({secondSemesterCourses.length})</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {secondSemesterCourses.map((c) => (
                      <Link
                        key={c.code}
                        to={`/resources?course=${encodeURIComponent(c.code)}`}
                        className="p-3.5 rounded-xl border border-border-light bg-surface-bg hover:border-brand-green/60 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 transition-all flex items-start justify-between gap-3 group active:scale-[0.99]"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-surface-card border border-border-light text-brand-deep group-hover:text-brand-green group-hover:border-brand-green/40 transition-colors">
                              {c.code}
                            </span>
                            <span className="text-[10px] font-semibold text-text-subtle font-mono">
                              {c.units} Units
                            </span>
                          </div>
                          <p className="text-xs font-bold text-text-main group-hover:text-brand-green transition-colors line-clamp-1">
                            {c.title}
                          </p>
                          <span className="text-[11px] text-text-muted mt-0.5 block">
                            View outline & study materials
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-text-subtle group-hover:text-brand-green group-hover:translate-x-0.5 transition-transform shrink-0 mt-1" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        );
      })()}

      {/* 5. Frequently Asked Questions Section */}
      <LandingFaqSection />

      {/* 6. Respectful Community Contribution Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-full overflow-hidden">
        <div className="rounded-2xl bg-neutral-900 text-white p-5 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h3 className="text-sm sm:text-base font-bold">
              Have past questions or tutorial solutions?
            </h3>
            <p className="text-xs text-neutral-300 mt-0.5">
              Contribute verified course materials to support fellow UI Statistics students. No login required.
            </p>
          </div>
          <Button
            size="sm"
            variant="primary"
            onClick={onOpenSubmit}
            className="bg-brand-green hover:bg-emerald-600 text-white font-semibold text-xs px-4 py-2 shrink-0 active:scale-95"
          >
            <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
            Submit Academic Material
          </Button>
        </div>
      </section>

      {/* 7. Document Preview Modal */}
      <DocumentPreviewModal
        isOpen={!!previewResource}
        resource={previewResource}
        onClose={() => setPreviewResource(null)}
        onOpenSubmit={onOpenSubmit}
        onReport={(r) => {
          toast.info('Issue Logged', `Reported issue for ${r.title}`);
        }}
      />
    </div>
  );
};
