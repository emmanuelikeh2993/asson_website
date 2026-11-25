import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate, Link } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { MobileNav } from './components/layout/MobileNav';
import { Footer } from './components/layout/Footer';
import { InstallPwaPrompt } from './components/layout/InstallPwaPrompt';
import { CommandPalette } from './components/features/resources/CommandPalette';
import { SubmitResourceModal } from './components/features/resources/SubmitResourceModal';
import { SettingsModal } from './components/features/settings/SettingsModal';
import { AuthModal } from './components/features/auth/AuthModal';
import { OnboardingExperience } from './components/features/onboarding/OnboardingExperience';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { ThemeProvider } from './context/ThemeContext';
import { OnboardingProvider, useOnboarding } from './context/OnboardingContext';
import { HomePage } from './pages/HomePage';
import { ResourcesPage } from './pages/ResourcesPage';
import { ResourceDetailPage } from './pages/ResourceDetailPage';
import { PastQuestionsPage } from './pages/PastQuestionsPage';
import { CalendarPage } from './pages/CalendarPage';
import { NoticesPage } from './pages/NoticesPage';
import { OpportunitiesPage } from './pages/OpportunitiesPage';
import { FaqPage } from './pages/FaqPage';
import { HelpPage } from './pages/HelpPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminPage } from './pages/AdminPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { MorePage } from './pages/MorePage';
import { EnterprisePage } from './pages/EnterprisePage';
import { MOCK_RESOURCES, COURSES } from './lib/mockData';
import { AcademicResource } from './types';
import { ToastProvider, useToast } from './components/ui/Toast';
import { supabase } from './lib/supabase';
import { FileQuestion, ArrowRight, Home, Search, BookOpen } from 'lucide-react';

function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });
  }, [pathname, search]);

  return null;
}

export function AppContent() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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
      setIsSettingsOpen(true);
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

      {/* Top Navbar with ASSON & UI Crest */}
      <Navbar
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenSubmit={() => setIsSubmitOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Routed Page Content */}
      <main className="flex-1 pb-16 lg:pb-0">
        <ErrorBoundary>
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
            <Route path="/faqs" element={<FaqPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route 
              path="/dashboard" 
              element={
                <DashboardPage 
                  onOpenSubmit={() => setIsSubmitOpen(true)} 
                  onOpenSettings={() => setIsSettingsOpen(true)}
                  onOpenAuth={() => setIsAuthOpen(true)}
                />
              } 
            />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route 
              path="/console" 
              element={
                <AdminPage 
                  onOpenSubmit={() => setIsSubmitOpen(true)} 
                />
              } 
            />
            <Route 
              path="/admin" 
              element={
                <AdminPage 
                  onOpenSubmit={() => setIsSubmitOpen(true)} 
                />
              } 
            />

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
                <MorePage 
                  onOpenSubmit={() => setIsSubmitOpen(true)} 
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
                      <span className="text-[11px] font-bold uppercase tracking-wider text-text-subtle">
                        404 Error
                      </span>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-text-main tracking-tight mt-0.5">
                        Page Not Found
                      </h2>
                      <p className="text-xs text-text-muted mt-1 leading-relaxed">
                        The requested academic URL does not exist or has been relocated to another section of the catalog.
                      </p>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                      <Link
                        to="/"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-green text-white text-xs font-bold hover:bg-brand-deep transition-all shadow-xs"
                      >
                        <Home className="w-3.5 h-3.5" /> Return Home
                      </Link>
                      <Link
                        to="/resources"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-border-light bg-surface-bg text-text-main text-xs font-semibold hover:bg-neutral-100 transition-colors"
                      >
                        <BookOpen className="w-3.5 h-3.5" /> Course Library
                      </Link>
                    </div>
                  </div>
                </div>
              } 
            />
          </Routes>
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Bottom Sticky Navigation */}
      <MobileNav 
        onOpenSubmit={() => setIsSubmitOpen(true)} 
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Global Command Palette Modal (Ctrl+K or /) */}
      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        resources={MOCK_RESOURCES}
        courses={COURSES}
        onSelectResource={handleSelectResource}
        onSelectCourse={handleSelectCourse}
      />

      {/* Submit Resource Modal */}
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

      {/* Preferences & Settings Modal (Claude/WhatsApp/Telegram-style) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Student Study Locker Account Modal (Classy DCN/Reference Authentication) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialTab={authInitialTab}
      />

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
