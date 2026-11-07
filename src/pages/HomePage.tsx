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
  Sparkles
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

          {/* Focused Description */}
          <p className="mt-2 text-xs sm:text-sm text-emerald-100/90 max-w-xl leading-relaxed">
            Fast, zero-login repository of verified past examination questions, course outlines, and academic announcements for UI Statistics scholars.
          </p>

          {/* Primary Search Bar Trigger */}
          <div className="w-full max-w-2xl mt-5">
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

      {/* 4. Curriculum Directory By Level */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-full overflow-hidden">
        <div className="p-5 sm:p-6 rounded-2xl bg-surface-card border border-border-light shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-text-main">
                Curriculum Courses Directory
              </h3>
              <p className="text-xs text-text-muted">
                Explore course outlines, tutorial sheets, and lecture notes by level.
              </p>
            </div>
            <Link to="/resources">
              <span className="text-xs font-semibold text-brand-green hover:underline">
                View All {COURSES.length} Courses →
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {[
              { level: '100', name: '100 Level', desc: 'Foundational Probability & Math' },
              { level: '200', name: '200 Level', desc: 'Inference & Distribution Theory' },
              { level: '300', name: '300 Level', desc: 'Regression & Experimental Design' },
              { level: '400', name: '400 Level', desc: 'Stochastic Processes & Analytics' },
              { level: 'Postgraduate', name: 'PG & Masters', desc: 'Advanced Biostatistics & Research' },
            ].map((lvl) => (
              <Link
                key={lvl.level}
                to={`/resources?level=${lvl.level}`}
                className="p-3 rounded-xl border border-border-light hover:border-brand-green/50 hover:bg-emerald-50/30 transition-all text-left group active:scale-[0.98]"
              >
                <span className="text-xs sm:text-sm font-bold text-text-main group-hover:text-brand-green block">
                  {lvl.name}
                </span>
                <span className="text-[11px] text-text-muted block mt-0.5 line-clamp-1">
                  {lvl.desc}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

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
