import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  BookOpen,
  Calendar,
  Bell,
  LayoutGrid,
  X,
  FileText,
  GraduationCap,
  Settings,
  User,
  PlusCircle,
  ArrowRight,
  Shield,
  HelpCircle
} from 'lucide-react';
import { Button } from '../ui/Button';
import { getCachedStudentProfile } from '../../lib/supabase';
import { useTheme } from '../../context/ThemeContext';

interface MobileNavProps {
  onOpenSubmit?: () => void;
  onOpenSettings?: () => void;
  onOpenAuth?: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  onOpenSubmit,
  onOpenSettings,
  onOpenAuth,
}) => {
  const location = useLocation();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const profile = getCachedStudentProfile();
  const { actualTheme } = useTheme();

  const navTabs = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Resources', path: '/resources', icon: BookOpen },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
    { name: 'Notices', path: '/notices', icon: Bell },
  ];

  const closeMore = () => setIsMoreOpen(false);

  return (
    <>
      <nav
        aria-label="Mobile Bottom Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 bg-surface-card/95 backdrop-blur-md border-t border-border-light px-1 py-1 lg:hidden shadow-sm flex items-center justify-around pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      >
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              onClick={() => setIsMoreOpen(false)}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 min-h-[46px] rounded-xl transition-all duration-150 active:scale-95 ${
                isActive && !isMoreOpen
                  ? 'text-brand-green font-bold bg-emerald-50/70 dark:bg-emerald-950/40 shadow-2xs'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive && !isMoreOpen ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              <span className="text-[10px] sm:text-[11px] mt-1 font-medium leading-none tracking-tight">
                {tab.name}
              </span>
            </Link>
          );
        })}

        {/* 5th Tab: More (Unifies Settings, Locker, FAQs, Executive Portal without noise) */}
        <button
          type="button"
          onClick={() => setIsMoreOpen((prev) => !prev)}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 min-h-[46px] rounded-xl transition-all duration-150 active:scale-95 cursor-pointer ${
            isMoreOpen
              ? 'text-brand-green font-bold bg-emerald-50/70 dark:bg-emerald-950/40 shadow-2xs'
              : 'text-text-muted hover:text-brand-green'
          }`}
          aria-label="More navigation and settings"
        >
          <LayoutGrid className={`w-4 h-4 sm:w-5 sm:h-5 ${isMoreOpen ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] sm:text-[11px] mt-1 font-medium leading-none tracking-tight">
            More
          </span>
        </button>
      </nav>

      {/* Modern, Clean "More" Bottom Sheet Hub */}
      {isMoreOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          {/* Backdrop overlay */}
          <div
            onClick={closeMore}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
          />

          {/* Bottom Sheet Drawer */}
          <div className="relative z-10 w-full max-h-[85vh] bg-surface-card rounded-t-3xl shadow-2xl p-5 border-t border-border-light overflow-y-auto animate-in slide-in-from-bottom duration-200 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            {/* Grab handle indicator */}
            <div className="w-12 h-1.5 bg-border-light rounded-full mx-auto mb-3" />

            {/* Sheet Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border-light mb-4">
              <div className="flex items-center gap-2">
                <img src="/logo/asson_logo.png" alt="ASSON UI" className="w-7 h-7 object-contain" />
                <span className="font-extrabold text-sm text-brand-deep">More & Gateways</span>
              </div>
              <button
                onClick={closeMore}
                className="p-1.5 text-text-muted hover:text-text-main hover:bg-surface-bg rounded-lg active:scale-95 transition-transform"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Student Study Locker Account Banner */}
            <div className="p-3.5 rounded-2xl bg-surface-bg border border-border-light mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-brand-green font-bold text-xs flex items-center justify-center border border-emerald-200 dark:border-emerald-800 shrink-0">
                  {profile ? profile.displayName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-text-main block truncate">
                    {profile ? profile.displayName : 'Guest Student'}
                  </span>
                  <span className="text-[10px] text-text-muted block">
                    {profile ? profile.level || 'Statistics Scholar' : 'Zero-login public access'}
                  </span>
                </div>
              </div>

              {onOpenAuth && (
                <button
                  type="button"
                  onClick={() => {
                    closeMore();
                    onOpenAuth();
                  }}
                  className="px-3 py-1.5 text-xs font-bold rounded-xl bg-surface-card border border-border-light text-brand-green hover:border-brand-green shadow-2xs transition-all shrink-0 cursor-pointer"
                >
                  {profile ? 'Account' : 'Sign In'}
                </button>
              )}
            </div>

            {/* Primary Action: Submit Academic Material */}
            {onOpenSubmit && (
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  closeMore();
                  onOpenSubmit();
                }}
                className="w-full justify-center shadow-md font-bold mb-4"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Submit Academic Material
              </Button>
            )}

            {/* Navigation Gateways List */}
            <div className="space-y-1 mb-4">
              <Link
                to="/past-questions"
                onClick={closeMore}
                className="flex items-center justify-between p-3 rounded-xl text-xs font-semibold text-text-main hover:bg-surface-bg hover:text-brand-green transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="p-1.5 rounded-lg bg-surface-bg text-text-muted">
                    <FileText className="w-4 h-4 text-brand-green" />
                  </span>
                  <span>Past Examination Questions</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-text-subtle" />
              </Link>

              <Link
                to="/opportunities"
                onClick={closeMore}
                className="flex items-center justify-between p-3 rounded-xl text-xs font-semibold text-text-main hover:bg-surface-bg hover:text-brand-green transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="p-1.5 rounded-lg bg-surface-bg text-text-muted">
                    <GraduationCap className="w-4 h-4 text-brand-green" />
                  </span>
                  <span>Opportunities & Scholarships</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-text-subtle" />
              </Link>

              <Link
                to="/dashboard"
                onClick={closeMore}
                className="flex items-center justify-between p-3 rounded-xl text-xs font-semibold text-text-main hover:bg-surface-bg hover:text-brand-green transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="p-1.5 rounded-lg bg-surface-bg text-text-muted">
                    <User className="w-4 h-4 text-brand-green" />
                  </span>
                  <span>Student Dashboard & Bookmarks</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-text-subtle" />
              </Link>

              {/* Preferences & Settings */}
              {onOpenSettings && (
                <button
                  type="button"
                  onClick={() => {
                    closeMore();
                    onOpenSettings();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold text-text-main hover:bg-surface-bg hover:text-brand-green transition-all cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="p-1.5 rounded-lg bg-surface-bg text-text-muted">
                      <Settings className="w-4 h-4 text-brand-green" />
                    </span>
                    <span>Preferences & Settings</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-surface-bg border border-border-light text-text-muted capitalize">
                      {actualTheme}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-text-subtle" />
                  </div>
                </button>
              )}

              <Link
                to="/help"
                onClick={closeMore}
                className="flex items-center justify-between p-3 rounded-xl text-xs font-semibold text-text-main hover:bg-surface-bg hover:text-brand-green transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="p-1.5 rounded-lg bg-surface-bg text-text-muted">
                    <HelpCircle className="w-4 h-4 text-brand-green" />
                  </span>
                  <span>Help & Academic FAQs</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-text-subtle" />
              </Link>

              {/* Executive Portal (Clearly labeled with Shield, replacing mysterious three-dots) */}
              <Link
                to="/console"
                onClick={closeMore}
                className="flex items-center justify-between p-3 rounded-xl text-xs font-semibold text-text-main hover:bg-surface-bg hover:text-brand-green transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="p-1.5 rounded-lg bg-surface-bg text-text-muted">
                    <Shield className="w-4 h-4 text-emerald-600" />
                  </span>
                  <span>Executive Portal</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-text-subtle" />
              </Link>
            </div>

            {/* Bottom Legal Links */}
            <div className="pt-3 border-t border-border-light text-center space-y-1.5">
              <div className="flex items-center justify-center gap-3 text-[11px] text-text-muted">
                <Link to="/terms" onClick={closeMore} className="hover:text-brand-green transition-colors">
                  Terms of Service
                </Link>
                <span>•</span>
                <Link to="/privacy" onClick={closeMore} className="hover:text-brand-green transition-colors">
                  Privacy Policy
                </Link>
              </div>
              <div className="text-[10px] text-text-muted">
                Dept. of Statistics • University of Ibadan<br />
                <span className="text-brand-green font-medium">Facts from Reliable Figures</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
