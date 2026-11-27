import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate, Link } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { MobileNav } from './components/layout/MobileNav';
import { Footer } from './components/layout/Footer';
import { InstallPwaPrompt } from './components/layout/InstallPwaPrompt';
import { OfflineBanner } from './components/ui/OfflineBanner';
import { OnboardingExperience } from './components/features/onboarding/OnboardingExperience';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { ThemeProvider } from './context/ThemeContext';
import { OnboardingProvider, useOnboarding } from './context/OnboardingContext';
import { HomePage } from './pages/HomePage';
import { MOCK_RESOURCES, COURSES } from './lib/mockData';
import { AcademicResource } from './types';
import { ToastProvider, useToast } from './components/ui/Toast';
import { supabase } from './lib/supabase';
import { applyRouteMetadata } from './lib/seo';
import { FileQuestion, Home, BookOpen } from 'lucide-react';

const ResourcesPage = lazy(() => import('./pages/ResourcesPage').then((m) => ({ default: m.ResourcesPage })));
const ResourceDetailPage = lazy(() => import('./pages/ResourceDetailPage').then((m) => ({ default: m.ResourceDetailPage })));
const PastQuestionsPage = lazy(() => import('./pages/PastQuestionsPage').then((m) => ({ default: m.PastQuestionsPage })));
const CalendarPage = lazy(() => import('./pages/CalendarPage').then((m) => ({ default: m.CalendarPage })));
const NoticesPage = lazy(() => import('./pages/NoticesPage').then((m) => ({ default: m.NoticesPage })));
const OpportunitiesPage = lazy(() => import('./pages/OpportunitiesPage').then((m) => ({ default: m.OpportunitiesPage })));
const FaqPage = lazy(() => import('./pages/FaqPage').then((m) => ({ default: m.FaqPage })));
const HelpPage = lazy(() => import('./pages/HelpPage').then((m) => ({ default: m.HelpPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const AdminPage = lazy(() => import('./pages/AdminPage').then((m) => ({ default: m.AdminPage })));
const TermsPage = lazy(() => import('./pages/TermsPage').then((m) => ({ default: m.TermsPage })));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then((m) => ({ default: m.PrivacyPage })));
const MorePage = lazy(() => import('./pages/MorePage').then((m) => ({ default: m.MorePage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const EnterprisePage = lazy(() => import('./pages/EnterprisePage').then((m) => ({ default: m.EnterprisePage })));
const CgpaCalculatorPage = lazy(() => import('./pages/CgpaCalculatorPage').then((m) => ({ default: m.CgpaCalculatorPage })));

const CommandPalette = lazy(() => import('./components/features/resources/CommandPalette').then((m) => ({ default: m.CommandPalette })));
const SubmitResourceModal = lazy(() => import('./components/features/resources/SubmitResourceModal').then((m) => ({ default: m.SubmitResourceModal })));
const AuthModal = lazy(() => import('./components/features/auth/AuthModal').then((m) => ({ default: m.AuthModal })));

const PageRouteFallback: React.FC = () => (
  <div
    role="status"
    aria-label="Loading page"
    className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-4 animate-pulse"
  >
    <div className="h-7 w-48 rounded-xl bg-surface-card border border-border-light" />
    <div className="h-4 w-72 max-w-full rounded-lg bg-surface-card border border-border-light" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
      <div className="h-32 rounded-2xl bg-surface-card border border-border-light" />
      <div className="h-32 rounded-2xl bg-surface-card border border-border-light" />
    </div>
  </div>
);

interface RouteMetaConfig {
  title: string;
  description: string;
  noindex?: boolean;
}

const ROUTE_META: Record<string, RouteMetaConfig> = {
  '/': {
    title: 'ASSON UI — Together for Academic Excellence',
    description:
      'Academic Resource Hub, Past Examination Questions, Course Outlines, and Announcements for Statistics Students, University of Ibadan.',
  },
  '/resources': {
    title: 'Academic Resource Library — ASSON UI',
    description:
      'Browse 100L–400L and Postgraduate Statistics lecture notes, course outlines, tutorial sheets, and past questions for University of Ibadan.',
  },
  '/past-questions': {
    title: 'Past Examination Questions — ASSON UI',
    description:
      'Search and download verified past examination papers across 100L–400L Department of Statistics courses at University of Ibadan.',
  },
  '/calendar': {
    title: 'Academic Calendar & Timetable — ASSON UI',
    description:
      'Department of Statistics academic calendar, continuous assessment dates, examination timetables, and registration deadlines.',
  },
  '/notices': {
    title: 'Official Notices & Communiques — ASSON UI',
    description:
      'Departmental bulletins, senate circulars, event announcements, and deadlines for Statistics students at University of Ibadan.',
  },
  '/opportunities': {
    title: 'Scholarships & Opportunities — ASSON UI',
    description:
      'Scholarships, research grants, and quantitative internships curated for Statistics undergraduates at University of Ibadan.',
  },
  '/enterprise': {
    title: 'Student Enterprise Hub — ASSON UI',
    description:
      'Directory of student-owned businesses, data tutoring services, and campus ventures within ASSON University of Ibadan.',
  },
  '/cgpa-calculator': {
    title: 'CGPA Calculator — ASSON UI',
    description:
      'Client-side University of Ibadan 5.0 CGPA calculator with Department of Statistics course suggestions and resit support.',
  },
  '/faqs': {
    title: 'Frequently Asked Questions — ASSON UI',
    description:
      'Answers on downloading academic resources, contributing past questions, UI grading policy, and using the ASSON UI portal.',
  },
  '/help': {
    title: 'Study Help & Private Feedback — ASSON UI',
    description:
      'Departmental contacts, academic advisory offices, and private student feedback center for Statistics students, University of Ibadan.',
  },
  '/dashboard': {
    title: 'Student Dashboard — ASSON UI',
    description:
      'Personal Study Locker for bookmarked courses, device download history, and submitted resource tracking.',
    noindex: true,
  },
  '/terms': {
    title: 'Terms of Service & Honor Code — ASSON UI',
    description:
      'Submission guidelines, fair educational use, and academic integrity standards for the ASSON UI repository.',
  },
  '/privacy': {
    title: 'Privacy Policy & NDPA — ASSON UI',
    description:
      'Student privacy practices, local device storage, Supabase account handling, and peer submission data minimization.',
  },
  '/more': {
    title: 'Menu & Account — ASSON UI',
    description:
      'Study Locker shortcut, academic directory, CGPA calculator, and platform settings.',
    noindex: true,
  },
  '/settings': {
    title: 'Settings — ASSON UI',
    description:
      'Themes, academic level focus, data saver, cache management, and student account settings.',
    noindex: true,
  },
  '/profile': {
    title: 'My Profile — ASSON UI',
    description:
      'Student profile details, study level focus, and Study Locker account synchronization status.',
    noindex: true,
  },
  '/executive': {
    title: 'Executive Administration Portal — ASSON UI',
    description: 'Restricted ASSON executive administration portal.',
    noindex: true,
  },
};

function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });

    const cleanPath = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
    const config = ROUTE_META[cleanPath];
    if (config) {
      applyRouteMetadata({ ...config, path: cleanPath });
    } else if (!cleanPath.startsWith('/resources/') && !cleanPath.startsWith('/past-questions/')) {
      applyRouteMetadata({
        title: 'Page Not Found — ASSON UI',
        description: 'The requested page does not exist in the ASSON UI Academic Hub.',
        path: cleanPath,
        noindex: true,
      });
    }
  }, [pathname, search]);

  return null;
}

export function AppContent() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState<'signin' | 'signup' | 'forgot' | 'new-password'>('signin');
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { isOpen: isOnboardingOpen } = useOnboarding();

  // Handle direct navigation to submission, settings, or auth modal via query or route
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('submit') === 'true' || location.pathname === '/submit') {
      setIsSubmitOpen(true);
    }
    if (params.get('settings') === 'true') {
      navigate('/settings', { replace: true });
    }
    // Check if user arrived from a password recovery link in email
    const hash = location.hash || (typeof window !== 'undefined' ? window.location.hash : '');
    if (hash && hash.includes('type=recovery')) {
      setAuthInitialTab('new-password');
      setIsAuthOpen(true);
    } else if (params.get('signup') === 'true' || location.pathname === '/signup') {
      setAuthInitialTab('signup');
      setIsAuthOpen(true);
    } else if (params.get('auth') === 'true' || location.pathname === '/auth' || location.pathname === '/login') {
      setAuthInitialTab('signin');
      setIsAuthOpen(true);
    }
  }, [location.pathname, location.search, location.hash]);

  // Listen for Supabase PASSWORD_RECOVERY event
  useEffect(() => {
    if (supabase) {
      try {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
          if (event === 'PASSWORD_RECOVERY') {
            setAuthInitialTab('new-password');
            setIsAuthOpen(true);
          }
        });
        return () => subscription.unsubscribe();
      } catch {
        // ignore
      }
    }
  }, []);

  // Global keydown listener for Command Palette (Ctrl+K or /)
  useEffect(() => {
    if (isOnboardingOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is currently typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      } else if (e.key === '/') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOnboardingOpen]);

  const handleSelectResource = (resource: AcademicResource) => {
    navigate(`/resources/${resource.id}`);
  };

  const handleSelectCourse = (courseCode: string) => {
    navigate(`/resources?course=${encodeURIComponent(courseCode)}`);
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden flex flex-col bg-surface-bg text-text-main selection:bg-brand-light selection:text-brand-deep">
      {/* Install PWA Prompt Banner for Mobile Devices (paused during first-visit onboarding) */}
      {!isOnboardingOpen && <InstallPwaPrompt />}

      {/* Offline Connectivity Banner with Retry */}
      <OfflineBanner />

      {/* Top Navbar with ASSON & UI Crest */}
      <Navbar
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenSubmit={() => setIsSubmitOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Routed Page Content */}
      <main className="flex-1 pb-16 lg:pb-0">
        <ErrorBoundary>
          <Suspense fallback={<PageRouteFallback />}>
            <Routes>
            <Route 
              path="/" 
              element={
                <HomePage 
                  onOpenSearch={() => setIsSearchOpen(true)} 
                  onOpenSubmit={() => setIsSubmitOpen(true)} 
                />
              } 
            />
            <Route 
              path="/resources" 
              element={
                <ResourcesPage 
                  onOpenSubmit={() => setIsSubmitOpen(true)} 
                />
              } 
            />
            {/* Shareable Resource Detail Pages (WhatsApp / Telegram Direct Link Previews) */}
            <Route 
              path="/resources/:id" 
              element={
                <ResourceDetailPage 
                  onOpenSubmit={() => setIsSubmitOpen(true)} 
                />
              } 
            />
            <Route 
              path="/past-questions" 
              element={
                <PastQuestionsPage 
                  onOpenSubmit={() => setIsSubmitOpen(true)} 
                />
              } 
            />
            <Route 
              path="/past-questions/:id" 
              element={
                <ResourceDetailPage 
                  onOpenSubmit={() => setIsSubmitOpen(true)} 
                />
              } 
            />
            {/* Interactive Academic Calendar & Timetable */}
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/notices" element={<NoticesPage />} />
            <Route path="/opportunities" element={<OpportunitiesPage />} />
            <Route path="/enterprise" element={<EnterprisePage />} />
            <Route path="/cgpa-calculator" element={<CgpaCalculatorPage />} />
            <Route path="/faqs" element={<FaqPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route 
              path="/dashboard" 
              element={
                <DashboardPage 
                  onOpenSubmit={() => setIsSubmitOpen(true)} 
                  onOpenAuth={() => setIsAuthOpen(true)}
                />
              } 
            />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route 
              path="/executive" 
              element={
                <AdminPage 
                  onOpenSubmit={() => setIsSubmitOpen(true)} 
                />
              } 
            />
            <Route path="/console" element={<Navigate to="/executive" replace />} />
            <Route path="/admin" element={<Navigate to="/executive" replace />} />

            <Route 
              path="/more" 
              element={
                <MorePage 
                  onOpenSubmit={() => setIsSubmitOpen(true)} 
                  onOpenAuth={() => setIsAuthOpen(true)} 
                />
              } 
            />
            <Route
              path="/settings"
              element={
                <SettingsPage
                  onOpenAuth={() => setIsAuthOpen(true)}
                />
              }
            />
            <Route
              path="/profile"
              element={
                <ProfilePage
                  onOpenAuth={() => setIsAuthOpen(true)}
                />
              }
            />

            {/* Seamless Aliases and Deep-linking Routes */}
            <Route path="/submit" element={<Navigate to="/resources?submit=true" replace />} />
            <Route path="/login" element={<Navigate to="/resources?auth=true" replace />} />
            <Route path="/auth" element={<Navigate to="/resources?auth=true" replace />} />
            <Route path="/library" element={<Navigate to="/resources" replace />} />
            <Route path="/grants" element={<Navigate to="/opportunities" replace />} />
            <Route path="/get-help" element={<Navigate to="/help" replace />} />

            {/* Polished Academic 404 Catch-All Screen */}
            <Route 
              path="*" 
              element={
                <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
                  <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-surface-card border border-border-light shadow-xl text-center space-y-4 animate-in fade-in duration-150">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-brand-green border border-emerald-200 flex items-center justify-center mx-auto shadow-2xs">
                      <FileQuestion className="w-8 h-8" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-text-subtle">
                        404 Error
                      </span>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-text-main tracking-tight mt-0.5">
                        Page Not Found
                      </h2>
                      <p className="text-sm text-text-muted mt-1 leading-relaxed">
                        The requested academic URL does not exist or has been relocated to another section of the catalog.
                      </p>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                      <Link
                        to="/"
                        className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-green text-white text-xs font-bold hover:bg-brand-deep transition-all shadow-xs"
                      >
                        <Home className="w-3.5 h-3.5" aria-hidden="true" /> Return Home
                      </Link>
                      <Link
                        to="/resources"
                        className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-border-light bg-surface-bg text-text-main text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      >
                        <BookOpen className="w-3.5 h-3.5" aria-hidden="true" /> Course Library
                      </Link>
                    </div>
                  </div>
                </div>
              } 
            />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Bottom Sticky Navigation */}
      <MobileNav 
        onOpenSubmit={() => setIsSubmitOpen(true)} 
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Global Command Palette Modal (Ctrl+K or /) */}
      {isSearchOpen && (
        <Suspense fallback={null}>
          <CommandPalette
            isOpen={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
            resources={MOCK_RESOURCES}
            courses={COURSES}
            onSelectResource={handleSelectResource}
            onSelectCourse={handleSelectCourse}
          />
        </Suspense>
      )}

      {/* Submit Resource Modal */}
      {isSubmitOpen && (
        <Suspense fallback={null}>
          <SubmitResourceModal
            isOpen={isSubmitOpen}
            onClose={() => setIsSubmitOpen(false)}
            onSuccess={(title) => {
              toast.success(
                'Material Submitted Successfully!',
                `"${title}" is logged under review. Reference saved to your Student Dashboard.`
              );
            }}
          />
        </Suspense>
      )}

      {/* Student Study Locker Account Modal (Classy DCN/Reference Authentication) */}
      {isAuthOpen && (
        <Suspense fallback={null}>
          <AuthModal
            isOpen={isAuthOpen}
            onClose={() => setIsAuthOpen(false)}
            initialTab={authInitialTab}
          />
        </Suspense>
      )}

      {/* First-Visit Interactive Platform Onboarding */}
      <OnboardingExperience />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <ThemeProvider>
        <ToastProvider>
          <OnboardingProvider>
            <AppContent />
          </OnboardingProvider>
        </ToastProvider>
      </ThemeProvider>
    </Router>
  );
}
