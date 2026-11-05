import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { MobileNav } from './components/layout/MobileNav';
import { Footer } from './components/layout/Footer';
import { CommandPalette } from './components/features/resources/CommandPalette';
import { SubmitResourceModal } from './components/features/resources/SubmitResourceModal';
import { HomePage } from './pages/HomePage';
import { ResourcesPage } from './pages/ResourcesPage';
import { PastQuestionsPage } from './pages/PastQuestionsPage';
import { NoticesPage } from './pages/NoticesPage';
import { OpportunitiesPage } from './pages/OpportunitiesPage';
import { FaqPage } from './pages/FaqPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminPage } from './pages/AdminPage';
import { MOCK_RESOURCES, COURSES } from './lib/mockData';
import { AcademicResource } from './types';
import { ToastProvider, useToast } from './components/ui/Toast';

export function AppContent() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

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
      {/* Top Navbar with ASSON & UI Crest */}
      <Navbar
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenSubmit={() => setIsSubmitOpen(true)}
      />

      {/* Main Routed Page Content */}
      <main className="flex-1 pb-16 lg:pb-0">
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
          <Route 
            path="/dashboard" 
            element={
              <DashboardPage 
                onOpenSubmit={() => setIsSubmitOpen(true)} 
              />
            } 
          />
          <Route path="/admin" element={<AdminPage />} />
          <Route 
            path="*" 
            element={
              <div className="text-center py-20">
                <h2 className="text-2xl font-bold">Page Not Found</h2>
                <p className="text-xs text-text-muted mt-2">The requested academic page does not exist.</p>
              </div>
            } 
          />
        </Routes>
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Bottom Sticky Navigation */}
      <MobileNav onOpenSubmit={() => setIsSubmitOpen(true)} />

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
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </Router>
  );
}
