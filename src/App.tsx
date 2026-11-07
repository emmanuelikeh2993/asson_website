import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate, Link } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { MobileNav } from './components/layout/MobileNav';
import { Footer } from './components/layout/Footer';
import { InstallPwaPrompt } from './components/layout/InstallPwaPrompt';
import { CommandPalette } from './components/features/resources/CommandPalette';
import { SubmitResourceModal } from './components/features/resources/SubmitResourceModal';
import { SettingsModal } from './components/features/settings/SettingsModal';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { ThemeProvider } from './context/ThemeContext';
import { HomePage } from './pages/HomePage';
import { ResourcesPage } from './pages/ResourcesPage';
import { PastQuestionsPage } from './pages/PastQuestionsPage';
import { NoticesPage } from './pages/NoticesPage';
import { OpportunitiesPage } from './pages/OpportunitiesPage';
import { FaqPage } from './pages/FaqPage';
import { HelpPage } from './pages/HelpPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminPage } from './pages/AdminPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { MOCK_RESOURCES, COURSES } from './lib/mockData';
import { AcademicResource } from './types';
import { ToastProvider, useToast } from './components/ui/Toast';
import { FileQuestion, ArrowRight, Home, Search, BookOpen } from 'lucide-react';

export function AppContent() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  // Handle direct navigation to submission or settings modal via query or route
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('submit') === 'true' || location.pathname === '/submit') {
      setIsSubmitOpen(true);
    }
    if (params.get('settings') === 'true' || location.pathname === '/settings') {
      setIsSettingsOpen(true);
    }
  }, [location.pathname, location.search]);

  // Global keydown listener for Command Palette (Ctrl+K or /)
  useEffect(() => {
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
  }, []);

  const handleSelectResource = (resource: AcademicResource) => {
    navigate(`/resources?id=${resource.id}`);
  };

  const handleSelectCourse = (courseCode: string) => {
    navigate(`/resources?course=${encodeURIComponent(courseCode)}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-bg text-text-main selection:bg-brand-light selection:text-brand-deep">
      {/* Install PWA Prompt Banner for Mobile Devices */}
      <InstallPwaPrompt />

      {/* Top Navbar with ASSON & UI Crest */}
      <Navbar
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenSubmit={() => setIsSubmitOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
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
            <Route 
              path="/past-questions" 
              element={
                <PastQuestionsPage 
                  onOpenSubmit={() => setIsSubmitOpen(true)} 
                />
              } 
            />
            <Route path="/notices" element={<NoticesPage />} />
            <Route path="/opportunities" element={<OpportunitiesPage />} />
            <Route path="/faqs" element={<FaqPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route 
              path="/dashboard" 
              element={
                <DashboardPage 
                  onOpenSubmit={() => setIsSubmitOpen(true)} 
                  onOpenSettings={() => setIsSettingsOpen(true)}
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

            {/* Seamless Aliases and Deep-linking Routes */}
            <Route path="/submit" element={<Navigate to="/resources?submit=true" replace />} />
            <Route path="/settings" element={<Navigate to="/resources?settings=true" replace />} />
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
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <ThemeProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </ThemeProvider>
    </Router>
  );
}
