import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DownloadCard } from '../components/features/resources/DownloadCard';
import { MOCK_RESOURCES, MOCK_NOTICES, COURSES } from '../lib/mockData';
import {
  Search,
  FileText,
  ArrowRight,
  PlusCircle,
  Bell,
  ArrowUpRight
} from 'lucide-react';
import { AcademicResource, Notice, AcademicLevel } from '../types';
import { fetchResources, fetchNotices } from '../lib/supabase';
import { useToast } from '../components/ui/Toast';
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
  const [selectedLevel, setSelectedLevel] = useState<'100' | '200' | '300' | '400' | 'All'>('100');
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

  // Filter verified past questions by selected level
  const pastQuestions = resources
    .filter((r) => r.type === 'Past Question')
    .filter((r) => selectedLevel === 'All' || r.level === selectedLevel)
    .slice(0, 6);

  const bentoLevels = [
    {
      level: '100' as const,
      name: '100 Level',
      tag: 'Year 1',
      subtitle: 'Elementary Probability, Calculus & Computing',
      courses: COURSES.filter((c) => c.level === '100'),
    },
    {
      level: '200' as const,
      name: '200 Level',
      tag: 'Year 2',
      subtitle: 'Distribution Theory & Survey Sampling',
      courses: COURSES.filter((c) => c.level === '200'),
    },
    {
      level: '300' as const,
      name: '300 Level',
      tag: 'Year 3',
      subtitle: 'Regression, ANOVA & Demography',
      courses: COURSES.filter((c) => c.level === '300'),
    },
    {
      level: '400' as const,
      name: '400 Level',
      tag: 'Year 4',
      subtitle: 'Stochastic Processes, Time Series & Project',
      courses: COURSES.filter((c) => c.level === '400'),
    },
  ];

  const activeLevel = selectedLevel === 'All' ? '100' : selectedLevel;
  const activeLevelConfig = bentoLevels.find((b) => b.level === activeLevel) || bentoLevels[0];
  const activeLevelCourses = activeLevelConfig.courses;
  const firstSemesterCourses = activeLevelCourses.filter((c) => c.semester === 1);
  const secondSemesterCourses = activeLevelCourses.filter((c) => c.semester === 2);

  return (
    <div className="space-y-8 sm:space-y-10 pb-16">
      {/* ==================================================================== */}
      {/* ZONE 1: FOCUSED HERO & SEARCH GATEWAY */}
      {/* ==================================================================== */}
      <section className="relative w-full overflow-hidden bg-brand-deep text-white pt-8 pb-10 sm:pt-12 sm:pb-14 px-4 sm:px-6 lg:px-8 border-b border-emerald-900/60">
        <div className="max-w-3xl mx-auto flex flex-col items-center text-center">
          {/* Subtle Institutional Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] sm:text-xs text-emerald-100 font-medium mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Association of Statistics Students of Nigeria • University of Ibadan</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Academic Resource Hub
          </h1>

          {/* Primary Search Bar Trigger (Matching Spotlight Palette Trigger) */}
          <div className="w-full max-w-2xl mt-4 sm:mt-5">
            <button
              data-tour="hero-search"
              onClick={onOpenSearch}
              className="w-full flex items-center justify-between p-3 sm:p-3.5 pl-4 bg-white text-zinc-900 rounded-2xl shadow-lg shadow-black/10 hover:shadow-xl transition-all group border border-zinc-200/80 cursor-pointer"
              aria-label="Search past questions or course codes"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400 group-hover:text-[#087A3E] transition-colors shrink-0" />
                <span className="text-xs sm:text-sm text-zinc-400 truncate font-medium">
                  Search past questions, courses, lecturers, and more...
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-lg bg-zinc-100 border border-zinc-200 text-[10px] font-mono text-zinc-500 font-bold">
                  ⌘ + K
                </kbd>
                <span className="bg-[#087A3E] text-white text-xs font-bold px-3.5 sm:px-4 py-1.5 rounded-xl group-hover:bg-[#066131] transition-colors">
                  Search
                </span>
              </div>
            </button>

            {/* Level Selector Chips */}
            <div className="flex items-center justify-center flex-wrap gap-1.5 sm:gap-2 mt-3.5">
              {(['100', '200', '300', '400', 'All'] as const).map((lvl) => {
                const label = lvl === 'All' ? 'All Materials' : `${lvl}L`;
                const isSelected = selectedLevel === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => {
                      setSelectedLevel(lvl);
                      setCurriculumSemester('all');
                    }}
                    className={`px-3.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
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

      {/* Urgent Announcement Banner (Rendered only when active) */}
      {urgentNotice && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

      {/* ==================================================================== */}
      {/* ZONE 2: CURRICULUM & COURSE OUTLINES BY LEVEL */}
      {/* ==================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-text-main">
            Curriculum & Course Outlines
          </h2>
          <Link
            to="/resources"
            className="text-xs font-bold text-brand-green hover:underline flex items-center gap-1"
          >
            <span>All Courses</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 4 Bento Level Cards (Unified Monochrome Surface + Emerald Accent) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
          {bentoLevels.map((bento) => {
            const isSelected = activeLevel === bento.level;
            return (
              <button
                key={bento.level}
                type="button"
                onClick={() => {
                  setSelectedLevel(bento.level);
                  setCurriculumSemester('all');
                }}
                className={`p-3.5 sm:p-4 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between min-h-[110px] ${
                  isSelected
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/30 border-brand-green ring-1 ring-brand-green shadow-xs'
                    : 'bg-surface-card border-border-light hover:border-brand-green/40 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    isSelected
                      ? 'bg-brand-green text-white'
                      : 'bg-surface-bg text-text-muted border border-border-light'
                  }`}>
                    {bento.tag}
                  </span>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    isSelected ? 'text-brand-green' : 'text-text-subtle'
                  }`}>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="mt-2.5">
                  <h3 className="text-sm sm:text-base font-extrabold text-text-main">
                    {bento.name}
                  </h3>
                  <span className="text-[11px] text-text-muted block">
                    {bento.courses.length} Courses
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Level Courses Grid */}
        <div className="p-4 sm:p-5 rounded-2xl bg-surface-card border border-border-light shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-border-light/60">
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-text-main">
                {activeLevel} Level Courses
              </h3>
              <span className="text-xs text-text-muted">
                {activeLevelConfig.subtitle}
              </span>
            </div>

            {/* Semester Switcher */}
            <div className="inline-flex p-1 rounded-xl bg-surface-bg border border-border-light self-start sm:self-auto text-xs">
              <button
                type="button"
                onClick={() => setCurriculumSemester('all')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  curriculumSemester === 'all'
                    ? 'bg-brand-green text-white shadow-2xs'
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setCurriculumSemester(1)}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  curriculumSemester === 1
                    ? 'bg-brand-green text-white shadow-2xs'
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                1st Semester
              </button>
              <button
                type="button"
                onClick={() => setCurriculumSemester(2)}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  curriculumSemester === 2
                    ? 'bg-brand-green text-white shadow-2xs'
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                2nd Semester
              </button>
            </div>
          </div>

          {/* Courses List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {(curriculumSemester === 'all' ? activeLevelCourses : curriculumSemester === 1 ? firstSemesterCourses : secondSemesterCourses).map((c) => (
              <Link
                key={c.code}
                to={`/resources?course=${encodeURIComponent(c.code)}`}
                className="p-3 rounded-xl border border-border-light bg-surface-bg hover:border-brand-green/60 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 transition-all flex items-center justify-between gap-3 group"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold text-brand-green">
                      {c.code}
                    </span>
                    <span className="text-[10px] text-text-subtle font-mono">
                      {c.units} Units
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-text-main group-hover:text-brand-green transition-colors line-clamp-1">
                    {c.title}
                  </p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-text-subtle group-hover:text-brand-green group-hover:translate-x-0.5 transition-transform shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* ZONE 3: VERIFIED PAST EXAMINATION PAPERS */}
      {/* ==================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-text-main">
              {selectedLevel === 'All' ? 'Verified Past Papers' : `${selectedLevel}L Past Examination Papers`}
            </h2>
            <p className="text-xs text-text-muted">
              Official past examination papers and solutions.
            </p>
          </div>
          <Link
            to={selectedLevel === 'All' ? '/past-questions' : `/past-questions?level=${selectedLevel}`}
            className="text-xs font-bold text-brand-green hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
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
            <div className="col-span-full py-10 text-center bg-surface-card rounded-2xl border border-border-light p-6">
              <FileText className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-50" />
              <p className="text-xs sm:text-sm font-semibold text-text-main">
                {selectedLevel === 'All' ? 'No past papers catalogued yet.' : `No past papers listed for ${selectedLevel}L yet.`}
              </p>
              <button
                type="button"
                onClick={onOpenSubmit}
                className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-green text-white text-xs font-bold hover:bg-brand-deep transition-all cursor-pointer shadow-2xs"
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

      {/* Document Preview Modal */}
      {previewResource && (
        <DocumentPreviewModal
          resource={previewResource}
          isOpen={!!previewResource}
          onClose={() => setPreviewResource(null)}
        />
      )}
    </div>
  );
};
