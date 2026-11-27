import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowLeft,
  X,
  BookOpen,
  FileText,
  Bell,
  Sparkles,
  HelpCircle,
  LayoutDashboard,
  PlusCircle,
  Search,
  CheckCircle2,
  GraduationCap,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { useOnboarding } from '../../../context/OnboardingContext';

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const WELCOME_PREVIEW_PILLS = [
  {
    id: 'resources',
    label: 'Resources',
    heading: 'Structured Course Outlines & Notes',
    caption: 'Organized cleanly by 100L–400L and semester.',
    calloutTag: 'COURSE TOUR',
    calloutTitle: 'STA 211 • Probability II',
    calloutMeta: '3 Units • 1st Sem',
  },
  {
    id: 'search',
    label: 'Search',
    heading: 'Instant Course Code Discovery',
    caption: 'Jump straight to STA 111, STA 211 or MTH 101 in seconds.',
    calloutTag: 'QUICK FILTER',
    calloutTitle: 'STA 111 • Descriptive Stats',
    calloutMeta: '3 Units • 100L',
  },
  {
    id: 'submit',
    label: 'Contribute',
    heading: 'Peer-Verified Resource Uploads',
    caption: 'Share past questions & notes vetted by ASSON academics.',
    calloutTag: '3-STEP UPLOAD',
    calloutTitle: 'PDF / DOCX up to 15MB',
    calloutMeta: 'Zero-Noise Quality',
  },
] as const;

const PLATFORM_SECTIONS = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
    description: 'Track saved bookmarks, study level focus, and peer contribution statuses.',
  },
  {
    title: 'Academic Resources',
    path: '/resources',
    icon: BookOpen,
    description: 'Browse course materials in clean compact lists or grouped course drawers.',
  },
  {
    title: 'Past Questions',
    path: '/past-questions',
    icon: FileText,
    description: 'Access verified examination papers sorted by level and academic session.',
  },
  {
    title: 'Notices',
    path: '/notices',
    icon: Bell,
    description: 'Stay updated on departmental circulars, tests, and university schedules.',
  },
  {
    title: 'Opportunities',
    path: '/opportunities',
    icon: Sparkles,
    description: 'Discover vetted scholarships, fellowships, and quantitative internships.',
  },
  {
    title: 'FAQs',
    path: '/faqs',
    icon: HelpCircle,
    description: 'Quick answers on UI Statistics grading, downloads, and repository rules.',
  },
  {
    title: 'Submit Academic Material',
    path: '/submit',
    icon: PlusCircle,
    description: 'Upload missing past papers or lecture notes through a fast 3-step guide.',
  },
] as const;

const SEARCH_DEMO_SAMPLES = [
  {
    code: 'STA 211',
    title: 'Probability II',
    meta: '200 Level • 1st Semester • 3 Units',
  },
  {
    code: 'STA 111',
    title: 'Descriptive Statistics',
    meta: '100 Level • 1st Semester • 3 Units',
  },
  {
    code: 'MTH 101',
    title: 'Elementary Mathematics I',
    meta: '100 Level • Algebra & Trigonometry • 2 Units',
  },
] as const;

function findVisibleElement(selectors: string[]): HTMLElement | null {
  for (const selector of selectors) {
    const matches = Array.from(document.querySelectorAll<HTMLElement>(selector));
    for (const el of matches) {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        return el;
      }
    }
  }
  return null;
}

export const OnboardingExperience: React.FC = () => {
  const {
    isOpen,
    currentStep,
    totalSteps,
    nextStep,
    prevStep,
    skipOnboarding,
    completeOnboarding,
  } = useOnboarding();

  const location = useLocation();
  const navigate = useNavigate();
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  const [welcomePillId, setWelcomePillId] = useState<'resources' | 'search' | 'submit'>('resources');
  const [selectedSearchDemo, setSelectedSearchDemo] = useState<string>('STA 211');
  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);
  const [viewport, setViewport] = useState<{ w: number; h: number }>({
    w: typeof window !== 'undefined' ? window.innerWidth : 1024,
    h: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  const isSpotlightStep = currentStep === 2 || currentStep === 3;

  // Ensure user is on Home route when running spotlight steps so real Hero Search & Submit targets exist
  useEffect(() => {
    if (!isOpen || !isSpotlightStep) {
      setSpotlightRect(null);
      return;
    }
    if (location.pathname !== '/') {
      navigate('/', { replace: false });
    }
  }, [isOpen, isSpotlightStep, location.pathname, navigate]);

  const measureTarget = useCallback(() => {
    if (!isOpen || !isSpotlightStep) {
      setSpotlightRect(null);
      return;
    }

    setViewport({ w: window.innerWidth, h: window.innerHeight });

    const selectors =
      currentStep === 2
        ? ['[data-tour="hero-search"]', '[data-tour="search-trigger"]']
        : ['[data-tour="submit-trigger"]'];

    const target = findVisibleElement(selectors);
    if (!target) {
      setSpotlightRect(null);
      return;
    }

    const r = target.getBoundingClientRect();
    const pad = 6;
    setSpotlightRect({
      top: Math.max(4, r.top - pad),
      left: Math.max(4, r.left - pad),
      width: r.width + pad * 2,
      height: r.height + pad * 2,
    });
  }, [isOpen, isSpotlightStep, currentStep]);

  useEffect(() => {
    if (!isOpen || !isSpotlightStep) return;

    // Scroll cleanly to top so navbar and hero search are framed properly
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const raf = requestAnimationFrame(measureTarget);
    const timer = window.setTimeout(measureTarget, 180);

    window.addEventListener('resize', measureTarget);
    window.addEventListener('scroll', measureTarget, true);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      window.removeEventListener('resize', measureTarget);
      window.removeEventListener('scroll', measureTarget, true);
    };
  }, [isOpen, isSpotlightStep, currentStep, location.pathname, measureTarget]);

  // Keyboard shortcuts & focus management (Escape skips, Tab traps inside dialog, focus restored on close)
  useEffect(() => {
    if (!isOpen) return;

    previousActiveElementRef.current = document.activeElement as HTMLElement | null;
    const focusTimer = window.setTimeout(() => {
      const container = dialogRef.current;
      if (!container) return;
      const focusable = container.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length > 0) {
        focusable[0].focus();
      } else {
        container.focus();
      }
    }, 0);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        skipOnboarding();
        return;
      }
      if (e.key === 'ArrowRight' && currentStep < totalSteps - 1) {
        nextStep();
        return;
      }
      if (e.key === 'ArrowLeft' && currentStep > 0) {
        prevStep();
        return;
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => el.offsetParent !== null);

        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first || !dialogRef.current.contains(document.activeElement)) {
            e.preventDefault();
            last.focus();
          }
        } else if (document.activeElement === last || !dialogRef.current.contains(document.activeElement)) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', onKeyDown);
      if (previousActiveElementRef.current && document.contains(previousActiveElementRef.current)) {
        previousActiveElementRef.current.focus();
      }
    };
  }, [isOpen, currentStep, totalSteps, skipOnboarding, nextStep, prevStep]);

  if (!isOpen) return null;

  const activePill =
    WELCOME_PREVIEW_PILLS.find((p) => p.id === welcomePillId) || WELCOME_PREVIEW_PILLS[0];
  const activeSearchSample =
    SEARCH_DEMO_SAMPLES.find((s) => s.code === selectedSearchDemo) || SEARCH_DEMO_SAMPLES[0];

  const progressPercent = Math.round(((currentStep + 1) / totalSteps) * 100);

  // =========================================================================
  // RENDER SPOTLIGHT OVERLAY FOR STEPS 2 (Search) & 3 (Submit)
  // =========================================================================
  if (isSpotlightStep) {
    const isMobile = viewport.w < 640;
    const cardWidth = Math.min(400, viewport.w - 24);

    let tooltipStyle: React.CSSProperties;
    if (spotlightRect) {
      const spaceBelow = viewport.h - (spotlightRect.top + spotlightRect.height);
      const preferredLeft = spotlightRect.left + spotlightRect.width / 2 - cardWidth / 2;
      const clampedLeft = Math.max(12, Math.min(preferredLeft, viewport.w - cardWidth - 12));

      if (!isMobile && spaceBelow >= 270) {
        tooltipStyle = {
          top: spotlightRect.top + spotlightRect.height + 14,
          left: clampedLeft,
          width: cardWidth,
        };
      } else if (!isMobile && spotlightRect.top >= 280) {
        tooltipStyle = {
          bottom: viewport.h - spotlightRect.top + 14,
          left: clampedLeft,
          width: cardWidth,
        };
      } else if (isMobile && spotlightRect.top < 140) {
        tooltipStyle = {
          top: spotlightRect.top + spotlightRect.height + 14,
          left: 12,
          right: 12,
        };
      } else {
        tooltipStyle = {
          bottom: 16,
          left: isMobile ? 12 : clampedLeft,
          right: isMobile ? 12 : undefined,
          width: isMobile ? undefined : cardWidth,
        };
      }
    } else {
      tooltipStyle = {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: cardWidth,
      };
    }

    return (
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={currentStep === 2 ? 'Search Guide' : 'Submission Guide'}
        className="fixed inset-0 z-[70] animate-in fade-in duration-200 focus:outline-none"
      >
        {/* SVG Spotlight Cutout Mask */}
        <svg
          className="fixed inset-0 w-full h-full pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <defs>
            <mask id="asson-spotlight-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {spotlightRect && (
                <rect
                  x={spotlightRect.left}
                  y={spotlightRect.top}
                  width={spotlightRect.width}
                  height={spotlightRect.height}
                  rx="16"
                  ry="16"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(6, 20, 14, 0.72)"
            mask="url(#asson-spotlight-mask)"
          />
        </svg>

        {/* Emerald Highlight Ring Around Target Element */}
        {spotlightRect && (
          <div
            style={{
              top: spotlightRect.top,
              left: spotlightRect.left,
              width: spotlightRect.width,
              height: spotlightRect.height,
            }}
            className="fixed rounded-2xl ring-2 ring-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.22)] pointer-events-none transition-all duration-200"
          />
        )}

        {/* Interactive Tooltip Card */}
        <div
          style={tooltipStyle}
          className="fixed z-[72] rounded-2xl bg-surface-card border border-border-light shadow-2xl p-4 sm:p-5 space-y-3.5 max-h-[calc(100vh-110px)] overflow-y-auto animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Top Bar: Step pill & Skip */}
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-light text-brand-green text-xs font-bold">
              {currentStep === 2 ? (
                <>
                  <Search className="w-3 h-3" /> Search Guide • {currentStep + 1} of {totalSteps}
                </>
              ) : (
                <>
                  <PlusCircle className="w-3 h-3" /> Submission Guide • {currentStep + 1} of {totalSteps}
                </>
              )}
            </span>
            <button
              type="button"
              onClick={skipOnboarding}
              className="text-[11px] font-semibold text-text-muted hover:text-text-main px-2 py-1 rounded-lg hover:bg-surface-bg transition-colors cursor-pointer"
            >
              Skip
            </button>
          </div>

          {/* Progress Line */}
          <div className="w-full h-1 bg-surface-bg rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-green rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {currentStep === 2 ? (
            <div className="space-y-3">
              <div>
                <h3 className="text-base font-extrabold text-text-main tracking-tight">
                  Find Courses Instantly by Code
                </h3>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  Use the search bar above (or press <kbd className="px-1.5 py-0.5 rounded bg-surface-bg border border-border-light font-mono text-[10px]">⌘K</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-surface-bg border border-border-light font-mono text-[10px]">/</kbd>) to look up any course code, title, or past session.
                </p>
              </div>

              {/* Interactive Sample Course Code Tester */}
              <div className="p-3 rounded-xl bg-surface-bg border border-border-light space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-subtle">
                    Try tapping a course code:
                  </span>
                </div>
                <div className="flex items-center flex-wrap gap-1.5">
                  {SEARCH_DEMO_SAMPLES.map((sample) => {
                    const active = selectedSearchDemo === sample.code;
                    return (
                      <button
                        key={sample.code}
                        type="button"
                        onClick={() => setSelectedSearchDemo(sample.code)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          active
                            ? 'bg-brand-green text-white shadow-2xs'
                            : 'bg-surface-card text-text-main border border-border-light hover:border-brand-green/50'
                        }`}
                      >
                        {sample.code}
                      </button>
                    );
                  })}
                </div>
                <div className="p-2.5 rounded-lg bg-surface-card border border-border-light/80 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-text-main truncate">
                      {activeSearchSample.code} — {activeSearchSample.title}
                    </div>
                    <div className="text-xs text-text-muted truncate">
                      {activeSearchSample.meta}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-brand-green bg-brand-light px-2 py-0.5 rounded shrink-0">
                    Match
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <h3 className="text-base font-extrabold text-text-main tracking-tight">
                  Contribute Academic Materials
                </h3>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  Have past examination questions, lecture notes, or tutorial sheets? Tap the highlighted <strong>Submit</strong> button anytime to upload a PDF or DOCX (up to 15MB).
                </p>
              </div>

              <div className="p-3 rounded-xl bg-surface-bg border border-border-light flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-brand-green shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-xs text-text-muted leading-relaxed">
                  Every contribution is verified by the ASSON Academic Committee before appearing in the public library, keeping materials accurate for every UI Statistics student.
                </p>
              </div>
            </div>
          )}

          {/* Footer Controls: Previous & Next */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-border-light/60">
            <button
              type="button"
              onClick={prevStep}
              className="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border-light bg-surface-bg hover:bg-surface-subtle text-xs font-semibold text-text-main transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Previous</span>
            </button>

            <button
              type="button"
              onClick={nextStep}
              className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-brand-green hover:bg-brand-deep text-white text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <span>{currentStep === 3 ? 'Finish Tour' : 'Next'}</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // FULL-VIEWPORT ARCHITECTURAL OVERLAY FOR STEPS 0 (Welcome), 1 (Intro), 4 (Done)
  // =========================================================================
  return (
    <div
      ref={dialogRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label="ASSON UI Platform Onboarding"
      className="fixed inset-0 z-[70] bg-surface-card bg-architectural-grid text-text-main overflow-y-auto flex flex-col justify-between animate-in fade-in duration-200 focus:outline-none"
    >
      {/* Top Minimal Architectural Header */}
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <img
            src="/logo/asson_logo.webp"
            alt="ASSON Logo"
            width={36}
            height={36}
            className="w-8 h-8 sm:w-9 sm:h-9 object-contain"
          />
          <span className="w-px h-5 bg-border-light hidden sm:inline-block" />
          <img
            src="/logo/ui_crest.webp"
            alt="University of Ibadan Crest"
            width={32}
            height={32}
            className="w-7 h-7 sm:w-8 sm:h-8 object-contain rounded hidden sm:inline-block"
          />
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-extrabold tracking-tight text-brand-deep">
              ASSON UI
            </span>
            <span className="text-xs text-text-muted hidden sm:inline">
              Academic Resource Hub
            </span>
          </div>
        </div>

        {/* Progress & Skip */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentStep
                    ? 'w-5 bg-brand-green'
                    : idx < currentStep
                    ? 'w-2 bg-brand-green/50'
                    : 'w-2 bg-border-light'
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] font-bold text-text-muted hidden sm:inline">
            Step {currentStep + 1} of {totalSteps}
          </span>
          {currentStep < totalSteps - 1 && (
            <button
              type="button"
              onClick={skipOnboarding}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border-light bg-surface-card hover:bg-surface-subtle text-xs font-semibold text-text-muted hover:text-text-main transition-colors cursor-pointer"
            >
              <span>Skip</span>
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </header>

      {/* Center Content Stage */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex items-center">
        {/* ----------------------------------------------------------------- */}
        {/* STEP 0: WELCOME SCREEN (Dribbble Reference Split Architecture)    */}
        {/* ----------------------------------------------------------------- */}
        {currentStep === 0 && (
          <div className="w-full space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
              {/* Left Column: Editorial Headline + Get Started */}
              <div className="lg:col-span-6 space-y-5 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-light text-brand-green border border-emerald-200/70 dark:border-emerald-800/60 text-[11px] font-bold">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Department of Statistics • University of Ibadan</span>
                </div>

                <div className="space-y-2.5">
                  <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-text-main leading-[1.05]">
                    ASSON
                    <span className="block text-brand-green">ACADEMIC HUB</span>
                  </h1>
                  <p className="text-xs sm:text-sm font-mono tracking-wide text-text-muted">
                    / Facts from Reliable Figures /
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-text-muted max-w-md mx-auto lg:mx-0 leading-relaxed">
                  Your central library for verified past examination questions, course outlines, lecture notes, departmental notices, and student opportunities.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-1">
                  <button
                    type="button"
                    onClick={nextStep}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-brand-deep hover:bg-brand-green text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={skipOnboarding}
                    className="px-4 py-2.5 text-xs font-semibold text-text-muted hover:text-brand-green transition-colors cursor-pointer"
                  >
                    Skip introduction
                  </button>
                </div>
              </div>

              {/* Right Column: Dribbble-Inspired Interactive Platform Preview Card */}
              <div className="lg:col-span-6">
                <div className="relative rounded-3xl bg-surface-card border border-border-light shadow-card-hover p-5 sm:p-6 overflow-hidden">
                  {/* Top Interactive Pill Tabs */}
                  <div className="flex items-center gap-1.5 flex-wrap mb-4">
                    {WELCOME_PREVIEW_PILLS.map((pill) => {
                      const active = welcomePillId === pill.id;
                      return (
                        <button
                          key={pill.id}
                          type="button"
                          onClick={() => setWelcomePillId(pill.id)}
                          className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                            active
                              ? 'bg-brand-deep text-white shadow-2xs'
                              : 'bg-surface-bg text-text-muted border border-border-light hover:border-brand-green/40'
                          }`}
                        >
                          {pill.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Preview Title & Subtitle */}
                  <div className="max-w-sm space-y-1 mb-5">
                    <h2 className="text-base sm:text-lg font-extrabold text-text-main tracking-tight">
                      {activePill.heading}
                    </h2>
                    <p className="text-xs text-text-muted leading-relaxed">
                      {activePill.caption}
                    </p>
                  </div>

                  {/* Architectural Platform Preview Graphic + Hotspot Callout */}
                  <div className="relative rounded-2xl bg-gradient-to-br from-emerald-950 via-brand-deep to-emerald-900 p-4 sm:p-5 text-white border border-emerald-800/50">
                    {/* Stylized Mini Hub Interface */}
                    <div className="grid grid-cols-2 gap-2.5 max-w-[230px] sm:max-w-[260px]">
                      {(['100L', '200L', '300L', '400L'] as const).map((lvl, i) => (
                        <div
                          key={lvl}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            i === 1
                              ? 'bg-white text-zinc-900 border-white shadow-md'
                              : 'bg-white/10 text-emerald-50 border-white/15'
                          }`}
                        >
                          <span className="text-[10px] font-bold uppercase tracking-wider opacity-75 block">
                            Level
                          </span>
                          <span className="text-xs sm:text-sm font-extrabold">{lvl}</span>
                        </div>
                      ))}
                    </div>

                    {/* Calm Hotspot Indicator & Floating Callout Card */}
                    <div className="mt-4 sm:mt-0 sm:absolute sm:top-4 sm:right-4 flex items-center gap-2.5">
                      <span className="hidden sm:flex relative w-4 h-4 items-center justify-center" aria-hidden="true">
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white border-2 border-emerald-400" />
                      </span>
                      <div className="rounded-2xl bg-surface-card text-text-main p-3 border border-border-light shadow-xl min-w-[165px]">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-brand-green block">
                          {activePill.calloutTag}
                        </span>
                        <div className="text-xs font-bold text-text-main mt-0.5">
                          {activePill.calloutTitle}
                        </div>
                        <div className="text-xs text-text-muted mt-0.5 font-mono">
                          {activePill.calloutMeta}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Architectural Band (Adapted from Reference Footer Strip) */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-stretch pt-2">
              <div className="sm:col-span-5 rounded-2xl bg-brand-deep text-white p-4 sm:p-5 flex flex-col justify-between shadow-sm">
                <div className="text-sm sm:text-base font-bold leading-snug">
                  Built on verified departmental records
                </div>
                <p className="text-[11px] text-emerald-100/85 mt-1.5 leading-relaxed">
                  Aligned with University of Ibadan Statistics course codes—zero registration required for public downloads.
                </p>
              </div>
              <div className="sm:col-span-7 rounded-2xl bg-surface-card border border-border-light p-4 sm:p-5 flex items-center justify-between gap-4">
                <div>
                  <div className="text-xl sm:text-2xl font-extrabold text-text-main tracking-tight">
                    100L – 400L
                  </div>
                  <div className="text-xs text-text-muted mt-0.5">
                    Full Statistics curriculum, notices & scholarship hub
                  </div>
                </div>
                <button
                  type="button"
                  onClick={nextStep}
                  className="shrink-0 inline-flex items-center gap-1.5 text-xs font-bold text-brand-green hover:underline cursor-pointer"
                >
                  <span>Explore features</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* STEP 1: PLATFORM INTRODUCTION (All 7 Major Sections)              */}
        {/* ----------------------------------------------------------------- */}
        {currentStep === 1 && (
          <div className="w-full space-y-6 animate-in fade-in slide-in-from-right-3 duration-250">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-light text-brand-green text-[11px] font-bold">
                <Compass className="w-3.5 h-3.5" />
                <span>Platform Overview</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight">
                Everything You Need in One Hub
              </h2>
              <p className="text-xs sm:text-sm text-text-muted">
                Navigate seamlessly across seven dedicated sections tailored for UI Statistics scholars.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {PLATFORM_SECTIONS.map((sec) => {
                const Icon = sec.icon;
                return (
                  <div
                    key={sec.title}
                    className="p-4 rounded-2xl bg-surface-card border border-border-light shadow-2xs flex items-start gap-3 hover:border-brand-green/40 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-brand-light text-brand-green flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs sm:text-sm font-bold text-text-main">
                        {sec.title}
                      </h3>
                      <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed">
                        {sec.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border-light/60">
              <button
                type="button"
                onClick={prevStep}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border-light bg-surface-card hover:bg-surface-subtle text-xs font-semibold text-text-main transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <button
                type="button"
                onClick={nextStep}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-green hover:bg-brand-deep text-white text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer active:scale-95"
              >
                <span>Next: Search Guide</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* STEP 4: COMPLETION SCREEN                                         */}
        {/* ----------------------------------------------------------------- */}
        {currentStep === 4 && (
          <div className="w-full max-w-lg mx-auto animate-in fade-in zoom-in-95 duration-250">
            <div className="rounded-3xl bg-surface-card border border-border-light shadow-card-hover p-6 sm:p-9 text-center space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-brand-light text-brand-green border border-emerald-200/70 dark:border-emerald-800/60 flex items-center justify-center mx-auto shadow-2xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-green">
                  Onboarding Complete
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-text-main tracking-tight">
                  You&apos;re all set! Your academic resources are just a click away.
                </h2>
                <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                  Start exploring 100L–400L past papers, course outlines, and notices. You can replay this tour anytime from <strong>Help</strong> or <strong>More</strong>.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={prevStep}
                  className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-border-light bg-surface-bg hover:bg-surface-subtle text-xs font-semibold text-text-main transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Previous</span>
                </button>
                <button
                  type="button"
                  onClick={completeOnboarding}
                  className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-brand-green hover:bg-brand-deep text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer active:scale-95"
                >
                  <span>Enter ASSON Academic Hub</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Subtle Footer Caption */}
      <footer className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 text-center text-xs text-text-subtle shrink-0">
        Association of Statistics Students of Nigeria (ASSON) • University of Ibadan Chapter
      </footer>
    </div>
  );
};
