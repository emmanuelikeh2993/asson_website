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
  ArrowUpRight,
  BookOpen,
  Calendar,
  Sparkles,
  LayoutDashboard,
  Briefcase,
  HelpCircle,
  Compass,
  CheckCircle2,
  ShieldCheck,
  GraduationCap,
  ChevronRight,
  Quote
} from 'lucide-react';
import { AcademicResource, Notice } from '../types';
import { fetchResources, fetchNotices } from '../lib/supabase';
import { useToast } from '../components/ui/Toast';
import { DocumentPreviewModal } from '../components/features/resources/DocumentPreviewModal';
import { ResourceCardSkeleton } from '../components/ui/Skeleton';
import { useOnboarding } from '../context/OnboardingContext';

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
  const [showAllCoursesInPreview, setShowAllCoursesInPreview] = useState(false);
  const toast = useToast();
  const { restartOnboarding } = useOnboarding();

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
      subtitle: 'Descriptive Statistics, Probability I, Calculus & Computing',
      courses: COURSES.filter((c) => c.level === '100'),
    },
    {
      level: '200' as const,
      name: '200 Level',
      tag: 'Year 2',
      subtitle: 'Probability II, Consulting, Statistical ML & Computing II',
      courses: COURSES.filter((c) => c.level === '200'),
    },
    {
      level: '300' as const,
      name: '300 Level',
      tag: 'Year 3',
      subtitle: 'Likelihood Inference, ANOVA, Regression & SIWES',
      courses: COURSES.filter((c) => c.level === '300'),
    },
    {
      level: '400' as const,
      name: '400 Level',
      tag: 'Year 4',
      subtitle: 'Stochastic Processes, Time Series, Bayesian & Final Project',
      courses: COURSES.filter((c) => c.level === '400'),
    },
  ];

  const activeLevel = selectedLevel === 'All' ? '100' : selectedLevel;
  const activeLevelConfig = bentoLevels.find((b) => b.level === activeLevel) || bentoLevels[0];
  const activeLevelCourses = activeLevelConfig.courses;
  const filteredCurriculumCourses =
    curriculumSemester === 'all'
      ? activeLevelCourses
      : activeLevelCourses.filter((c) => c.semester === curriculumSemester);
  const visibleCurriculumCourses = showAllCoursesInPreview
    ? filteredCurriculumCourses
    : filteredCurriculumCourses.slice(0, 6);

  const ecosystemTiles = [
    { label: 'Resources', to: '/resources', icon: BookOpen },
    { label: 'Past Papers', to: '/past-questions', icon: FileText },
    { label: 'Calendar', to: '/calendar', icon: Calendar },
    { label: 'Notices', to: '/notices', icon: Bell },
    { label: 'Opportunities', to: '/opportunities', icon: Sparkles },
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { label: 'Enterprise', to: '/enterprise', icon: Briefcase },
    { label: 'Study Help', to: '/help', icon: HelpCircle },
  ];

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      {/* ==================================================================== */}
      {/* ZONE 1: LIGHT ARCHITECTURAL HERO (CLAUSE-INSPIRED EDITORIAL GRID)   */}
      {/* ==================================================================== */}
      <section className="relative w-full overflow-hidden bg-surface-card bg-architectural-grid pt-10 pb-12 sm:pt-16 sm:pb-14 px-4 sm:px-6 lg:px-8 border-b border-border-light">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
          {/* Small Pill Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-bg border border-border-light text-xs font-bold uppercase tracking-wider text-brand-green mb-4 shadow-2xs">
            <GraduationCap className="w-3.5 h-3.5" aria-hidden="true" />
            <span>ASSON Academic Hub • University of Ibadan</span>
          </div>

          {/* Crisp Editorial Headline with Underlined Keyword */}
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-text-main leading-[1.08] max-w-3xl">
            One hub to{' '}
            <span className="relative inline-block">
              <span className="relative z-10">organize</span>
              <span
                aria-hidden="true"
                className="absolute left-0 right-0 bottom-1 sm:bottom-1.5 h-2.5 sm:h-3 bg-emerald-300/75 dark:bg-emerald-500/40 -z-0 rounded-sm"
              />
            </span>{' '}
            your Statistics academics
          </h1>

          <p className="mt-4 text-sm sm:text-base text-text-muted max-w-2xl leading-relaxed">
            Access verified past examination questions, official 100L–400L course outlines, lecture notes, departmental circulars, and scholarships—built cleanly for UI Statistics scholars.
          </p>

          {/* Single Dominant Primary CTA + Quiet Secondary Text/Outline Action */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 mt-6 w-full sm:w-auto">
            <Link
              to="/resources"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-deep hover:bg-brand-green text-white text-sm font-bold shadow-sm transition-all active:scale-95"
            >
              <span>Explore Library</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={onOpenSubmit}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-transparent hover:bg-surface-bg text-text-muted hover:text-text-main border border-border-light text-sm font-semibold transition-all cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-brand-green" aria-hidden="true" />
              <span>Submit Material</span>
            </button>
          </div>

          {/* Spotlight Search Bar Trigger */}
          <div className="w-full max-w-2xl mt-7">
            <button
              type="button"
              data-tour="hero-search"
              onClick={onOpenSearch}
              className="w-full flex items-center justify-between p-2.5 sm:p-3 pl-4 bg-surface-bg hover:bg-surface-card text-text-main rounded-2xl shadow-xs hover:shadow-md transition-all group border border-border-light hover:border-brand-green/60 cursor-pointer"
              aria-label="Search past questions or course codes"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-text-subtle group-hover:text-brand-green transition-colors shrink-0" aria-hidden="true" />
                <span className="text-xs sm:text-sm text-text-muted truncate font-medium">
                  Search course codes (e.g. STA 211, STA 111, MTH 101)...
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-lg bg-surface-card border border-border-light text-xs font-mono text-text-muted font-bold">
                  ⌘ + K
                </kbd>
                <span className="bg-brand-green text-white text-xs font-bold px-3.5 py-1.5 rounded-xl group-hover:bg-brand-deep transition-colors">
                  Search
                </span>
              </div>
            </button>
          </div>

          {/* Trust / Academic Coverage Strip (Hero Footer Row) */}
          <div className="w-full max-w-4xl mt-10 pt-6 border-t border-border-light/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-muted">
            <span className="font-bold text-text-main uppercase tracking-wider text-xs">
              Official 2026/2027 Curriculum Coverage
            </span>
            <div className="flex items-center flex-wrap justify-center gap-x-5 gap-y-1.5 font-semibold">
              <span>100L Foundation</span>
              <span className="text-text-subtle" aria-hidden="true">•</span>
              <span>200L Inference &amp; ML</span>
              <span className="text-text-subtle" aria-hidden="true">•</span>
              <span>300L ANOVA &amp; SIWES</span>
              <span className="text-text-subtle" aria-hidden="true">•</span>
              <span>400L Bayesian &amp; Project</span>
            </div>
          </div>
        </div>
      </section>

      {/* Urgent Announcement Banner (Rendered only when active) */}
      {urgentNotice && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
          <Link
            to="/notices"
            className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 hover:bg-amber-100/80 dark:hover:bg-amber-900/30 transition-colors group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="p-1.5 rounded-lg bg-amber-600 text-white shrink-0">
                <Bell className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-bold text-amber-900 dark:text-amber-200 truncate">
                {urgentNotice.title}
              </span>
              <span className="text-xs text-amber-900/90 dark:text-amber-200 hidden md:inline truncate">
                — {urgentNotice.summary}
              </span>
            </div>
            <span className="text-xs font-bold text-amber-800 dark:text-amber-300 group-hover:underline shrink-0 flex items-center gap-1">
              Read notice <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </span>
          </Link>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ZONE 2: FEATURES BENTO SHOWCASE (1 WIDE CARD + 2 SIDE-BY-SIDE CARDS) */}
      {/* ==================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-card border border-border-light text-xs font-bold uppercase tracking-wider text-brand-green">
            Features
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight">
            Built to simplify every semester
          </h2>
          <p className="text-sm text-text-muted leading-relaxed">
            Discover your registered courses, follow departmental announcements, and submit study materials—all organized in one calm workspace.
          </p>
        </div>

        {/* Top Wide Feature Card: Interactive Curriculum & Course Explorer */}
        <div className="rounded-3xl bg-surface-card border border-border-light shadow-card p-5 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Explanation + Level Switcher */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-5">
            <div className="space-y-2.5">
              <h3 className="text-lg sm:text-xl font-extrabold text-text-main tracking-tight">
                Structured Course Catalog
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Every course from 100L through 400L is indexed with official UI Statistics codes, credit units, and semester breakdown. Select your level to preview courses or open its resources directly.
              </p>
            </div>

            {/* Level Pills */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-text-subtle block">
                Select Academic Level
              </span>
              <div className="grid grid-cols-2 gap-2">
                {bentoLevels.map((bento) => {
                  const isSelected = activeLevel === bento.level;
                  return (
                    <button
                      key={bento.level}
                      type="button"
                      onClick={() => {
                        setSelectedLevel(bento.level);
                        setCurriculumSemester('all');
                        setShowAllCoursesInPreview(false);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-brand-light border-brand-green text-brand-deep dark:text-emerald-200 font-bold shadow-2xs'
                          : 'bg-surface-bg border-border-light text-text-main hover:border-brand-green/40'
                      }`}
                    >
                      <div>
                        <span className="text-xs font-extrabold block">{bento.name}</span>
                        <span className="text-xs text-text-muted">{bento.courses.length} Courses</span>
                      </div>
                      <ArrowUpRight className={`w-3.5 h-3.5 ${isSelected ? 'text-brand-green' : 'text-text-subtle'}`} aria-hidden="true" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Link
                to="/resources"
                className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-brand-deep hover:bg-brand-green text-white text-xs font-bold transition-colors shadow-2xs"
              >
                <span>Explore All Courses</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Right Inset Miniature Interactive UI Panel */}
          <div className="lg:col-span-7 rounded-2xl bg-surface-bg border border-border-light p-4 sm:p-5 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border-light/70">
              <div>
                <div className="text-xs sm:text-sm font-extrabold text-text-main">
                  {activeLevelConfig.name} • {filteredCurriculumCourses.length} Courses
                </div>
                <div className="text-xs text-text-muted line-clamp-1">
                  {activeLevelConfig.subtitle}
                </div>
              </div>

              {/* Semester Filter */}
              <div className="inline-flex p-0.5 rounded-xl bg-surface-card border border-border-light self-start text-xs">
                {(['all', 1, 2] as const).map((sem) => (
                  <button
                    key={sem}
                    type="button"
                    onClick={() => {
                      setCurriculumSemester(sem);
                      setShowAllCoursesInPreview(false);
                    }}
                    className={`px-3 py-2 min-h-[44px] sm:min-h-[36px] min-w-[44px] rounded-lg font-bold transition-all cursor-pointer ${
                      curriculumSemester === sem
                        ? 'bg-brand-green text-white'
                        : 'text-text-muted hover:text-text-main'
                    }`}
                  >
                    {sem === 'all' ? 'All' : sem === 1 ? '1st Sem' : '2nd Sem'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {visibleCurriculumCourses.map((c) => (
                <Link
                  key={c.code}
                  to={`/resources?course=${encodeURIComponent(c.code)}`}
                  className="p-2.5 rounded-xl bg-surface-card border border-border-light hover:border-brand-green/60 transition-all flex items-center justify-between gap-2.5 group"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-extrabold text-brand-green">{c.code}</span>
                      <span className="text-xs font-mono text-text-subtle">{c.units}u</span>
                    </div>
                    <p className="text-xs font-semibold text-text-main group-hover:text-brand-green transition-colors line-clamp-1">
                      {c.title}
                    </p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-text-subtle group-hover:text-brand-green shrink-0" aria-hidden="true" />
                </Link>
              ))}
            </div>

            {filteredCurriculumCourses.length > 6 && (
              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={() => setShowAllCoursesInPreview((prev) => !prev)}
                  className="inline-flex items-center justify-center min-h-[44px] px-3 text-xs font-bold text-brand-green hover:underline cursor-pointer"
                >
                  {showAllCoursesInPreview
                    ? 'Show fewer courses'
                    : `Show all ${filteredCurriculumCourses.length} courses in ${activeLevel}L`}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom 2-Column Feature Cards (Smart Alerts + Contribution Pipeline) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {/* Left Card: Smart Notices & Academic Calendar */}
          <div className="rounded-3xl bg-surface-card border border-border-light shadow-card p-5 sm:p-7 flex flex-col justify-between space-y-5">
            <div className="space-y-1.5 text-center sm:text-left">
              <h3 className="text-base sm:text-lg font-extrabold text-text-main tracking-tight">
                Smart Notices &amp; Exam Calendar
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Keep track of departmental circulars, CA test dates, and verified scholarship deadlines without digging through group chats.
              </p>
            </div>

            {/* Inner White/Card Miniature UI Preview (Clause-style structured feed) */}
            <div className="rounded-2xl bg-surface-bg border border-border-light p-3.5 space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-text-main">
                  Live Academic Channels
                </span>
                <Link
                  to="/notices"
                  className="inline-flex items-center min-h-[44px] px-2 -mr-2 text-xs font-bold text-brand-green hover:underline"
                >
                  Open Feed
                </Link>
              </div>

              <div className="space-y-1.5">
                {[
                  { label: 'CA Tests & Exam Dates', status: 'Calendar', to: '/calendar' },
                  { label: 'Departmental & Senate Circulars', status: 'Notices', to: '/notices' },
                  { label: 'Scholarships & Internships', status: 'Opportunities', to: '/opportunities' },
                  { label: 'Academic Advisories & Help', status: 'Support', to: '/help' },
                ].map((row) => (
                  <Link
                    key={row.label}
                    to={row.to}
                    className="p-2.5 min-h-[44px] rounded-xl bg-surface-card border border-border-light/80 hover:border-brand-green/50 flex items-center justify-between gap-2 transition-colors group"
                  >
                    <span className="text-xs font-semibold text-text-main group-hover:text-brand-green transition-colors truncate">
                      {row.label}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-light text-brand-deep dark:text-emerald-300 text-xs font-bold shrink-0">
                      {row.status}
                      <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right Card: Peer Archive & Material Submission */}
          <div className="rounded-3xl bg-surface-card border border-border-light shadow-card p-5 sm:p-7 flex flex-col justify-between space-y-5">
            <div className="space-y-1.5 text-center sm:text-left">
              <h3 className="text-base sm:text-lg font-extrabold text-text-main tracking-tight">
                Peer Archive &amp; Contribution Queue
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Help fellow students succeed by sharing missing past papers or lecture notes. Every upload passes committee verification before publishing.
              </p>
            </div>

            {/* Inner Miniature UI Activity Card */}
            <div className="rounded-2xl bg-surface-bg border border-border-light p-3.5 space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-text-main">
                  Contribution Pipeline
                </span>
                <button
                  type="button"
                  onClick={onOpenSubmit}
                  className="inline-flex items-center gap-1 px-3 py-1.5 min-h-[44px] sm:min-h-[36px] rounded-lg bg-brand-green text-white text-xs font-bold hover:bg-brand-deep transition-colors cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Submit</span>
                </button>
              </div>

              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-surface-card border border-border-light/80 flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-brand-light text-brand-deep dark:text-emerald-300 flex items-center justify-center text-xs font-extrabold shrink-0">
                    1
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-text-main">Select Course &amp; Session</div>
                    <div className="text-xs text-text-muted">Tag the exact course code (e.g. STA 211) and session.</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-surface-card border border-border-light/80 flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-brand-light text-brand-deep dark:text-emerald-300 flex items-center justify-center text-xs font-extrabold shrink-0">
                    2
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-text-main">Upload Clean PDF or DOCX</div>
                    <div className="text-xs text-text-muted">Safe file scanning up to 15MB with zero clutter.</div>
                  </div>
                </div>

                <Link
                  to="/dashboard"
                  className="p-2.5 rounded-xl bg-surface-card border border-border-light/80 hover:border-brand-green/50 flex items-center justify-between gap-2 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0" aria-hidden="true" />
                    <span className="text-xs font-bold text-text-main group-hover:text-brand-green transition-colors">
                      Track Review Status in Dashboard
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-text-subtle group-hover:text-brand-green shrink-0" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* ZONE 3: DEEP FOREST UNIFIED PLATFORM DIRECTORY ("All Tools. One Hub") */}
      {/* ==================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-[#064B2B] dark:bg-[#0B231B] text-white bg-architectural-grid-dark p-6 sm:p-10 lg:p-12 shadow-lg border border-emerald-900/50 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-bold uppercase tracking-wider text-emerald-200">
              <Compass className="w-3 h-3" aria-hidden="true" />
              <span>Unified Ecosystem</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              All academic tools. One clear hub.
            </h2>
            <p className="text-sm text-emerald-100 leading-relaxed">
              Every essential resource for Statistics students at the University of Ibadan—jump directly to any section or restart the interactive walkthrough anytime.
            </p>
            <div className="pt-1 flex items-center justify-center gap-4">
              <Link
                to="/resources"
                className="inline-flex items-center min-h-[44px] px-3 text-xs font-bold text-white underline underline-offset-4 hover:text-emerald-200 transition-colors"
              >
                Browse Full Library →
              </Link>
              <button
                type="button"
                onClick={restartOnboarding}
                className="inline-flex items-center min-h-[44px] px-3 text-xs font-semibold text-emerald-200 hover:text-white transition-colors cursor-pointer"
              >
                Replay Tour
              </button>
            </div>
          </div>

          {/* Crisp Floating Tiles Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
            {ecosystemTiles.map((tile) => {
              const Icon = tile.icon;
              return (
                <Link
                  key={tile.label}
                  to={tile.to}
                  className="p-4 rounded-2xl bg-white dark:bg-surface-card text-text-main hover:-translate-y-0.5 hover:shadow-xl transition-all flex flex-col items-center text-center gap-2 border border-white/20 dark:border-border-light group"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-light text-brand-green flex items-center justify-center group-hover:bg-brand-green group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-zinc-900 dark:text-text-main">
                    {tile.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* ZONE 4: RECENT VERIFIED PAST EXAMINATION PAPERS                      */}
      {/* ==================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-xl font-extrabold text-text-main tracking-tight">
              {selectedLevel === 'All' ? 'Verified Past Examination Papers' : `${selectedLevel}L Past Examination Papers`}
            </h2>
            <p className="text-sm text-text-muted">
              Verified examination papers and study guides ready for direct download.
            </p>
          </div>
          <Link
            to={selectedLevel === 'All' ? '/past-questions' : `/past-questions?level=${selectedLevel}`}
            className="inline-flex items-center gap-1 min-h-[44px] px-2 -mr-2 text-xs font-bold text-brand-green hover:underline shrink-0"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {isLoading ? (
            <>
              <ResourceCardSkeleton />
              <ResourceCardSkeleton />
              <ResourceCardSkeleton />
            </>
          ) : pastQuestions.length === 0 ? (
            <div className="col-span-full py-9 text-center bg-surface-card rounded-2xl border border-border-light p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-brand-light text-brand-green flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-bold text-text-main">
                    {selectedLevel === 'All'
                      ? 'Past papers archive is open for 2026/2027 contributions.'
                      : `No ${selectedLevel}L past papers uploaded yet.`}
                  </p>
                  <p className="text-xs text-text-muted">
                    Only committee-verified materials appear here—upload a genuine PDF or DOCX to contribute.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onOpenSubmit}
                className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-green text-white text-xs font-bold hover:bg-brand-deep transition-all cursor-pointer shadow-2xs"
              >
                <PlusCircle className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Submit Past Paper</span>
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

      {/* ==================================================================== */}
      {/* ZONE 5: EDITORIAL QUOTE + FACTUAL METRICS STRIP                      */}
      {/* ==================================================================== */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-center">
        <div className="space-y-4 max-w-3xl mx-auto">
          <Quote className="w-6 h-6 text-brand-green mx-auto opacity-80" aria-hidden="true" />
          <blockquote className="text-lg sm:text-2xl font-bold text-text-main tracking-tight leading-snug">
            &ldquo;Facts from Reliable Figures — equipping University of Ibadan Statistics students with organized course materials, verified archives, and transparent academic updates.&rdquo;
          </blockquote>
          <div className="flex items-center justify-center gap-2 text-xs text-text-muted">
            <ShieldCheck className="w-4 h-4 text-brand-green" aria-hidden="true" />
            <span className="font-semibold">ASSON UI • 2026/2027 Executive Administration</span>
          </div>
        </div>

        {/* 3-Metric Soft Bento Strip */}
        <div className="rounded-3xl bg-surface-card border border-border-light p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-3 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-border-light/70">
          <div className="pt-2 sm:pt-0">
            <div className="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight">
              100L–400L
            </div>
            <div className="text-xs text-text-muted mt-1 font-medium">
              Full Undergraduate Curriculum
            </div>
          </div>
          <div className="pt-4 sm:pt-0">
            <div className="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight">
              {COURSES.length}+
            </div>
            <div className="text-xs text-text-muted mt-1 font-medium">
              Indexed Department Courses
            </div>
          </div>
          <div className="pt-4 sm:pt-0">
            <div className="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight">
              Zero Login
            </div>
            <div className="text-xs text-text-muted mt-1 font-medium">
              Instant Public File Downloads
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* ZONE 6: DARK PRE-FOOTER CTA BAND (CLAUSE BOTTOM BANNER)              */}
      {/* ==================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-[#064B2B] dark:bg-[#0B231B] text-white px-6 py-8 sm:px-10 sm:py-10 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-md border border-emerald-900/50">
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight leading-snug">
              Discover the full scale of{' '}
              <span className="underline decoration-emerald-400 decoration-2 underline-offset-4">
                ASSON UI
              </span>{' '}
              resources
            </h2>
            <p className="text-sm text-emerald-100 mt-1">
              Open the resource library or contribute past examination papers for your level.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              to="/resources"
              className="min-h-[44px] inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-white text-brand-deep hover:bg-emerald-50 text-xs font-bold transition-colors shadow-2xs"
            >
              Open Library
            </Link>
            <button
              type="button"
              onClick={onOpenSubmit}
              className="min-h-[44px] inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/25 text-xs font-bold transition-colors cursor-pointer"
            >
              Submit Material
            </button>
          </div>
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
