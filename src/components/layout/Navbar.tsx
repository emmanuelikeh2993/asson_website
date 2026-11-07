import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Search,
  PlusCircle,
  Menu,
  X,
  BookOpen,
  FileText,
  Bell,
  GraduationCap,
  HelpCircle,
  User,
  Sparkles,
  ArrowRight,
  Sun,
  Moon,
  Settings,
  Palette,
  Calendar
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useTheme } from '../../context/ThemeContext';
import { getCachedStudentProfile } from '../../lib/supabase';
import { UserProfile } from '../../types';

interface NavbarProps {
  onOpenSearch: () => void;
  onOpenSubmit: () => void;
  onOpenSettings?: () => void;
  onOpenAuth?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSearch, onOpenSubmit, onOpenSettings, onOpenAuth }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(() => getCachedStudentProfile());
  const { actualTheme, toggleTheme } = useTheme();

  useEffect(() => {
    setProfile(getCachedStudentProfile());
  }, [location.pathname]);

  const navLinks = [
    { name: 'Resources', path: '/resources', icon: BookOpen },
    { name: 'Past Questions', path: '/past-questions', icon: FileText },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
    { name: 'Notices', path: '/notices', icon: Bell },
    { name: 'Opportunities', path: '/opportunities', icon: GraduationCap },
    { name: 'Dashboard', path: '/dashboard', icon: User },
  ];

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border-light bg-surface-card/95 backdrop-blur-md transition-all shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Brand & Department Logo alongside University Crest */}
          <Link to="/" className="flex items-center gap-2 sm:gap-2.5 shrink-0 group">
            {/* Left Logos: ASSON Logo always visible; University Crest visible on sm+ screens */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <img
                src="/logo/asson_logo.png"
                alt="ASSON Logo"
                className="w-7 h-7 sm:w-9 sm:h-9 object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
              />
              <span className="w-px h-5 sm:h-6 bg-border-light hidden sm:inline-block" />
              <img
                src="/logo/ui_crest.jpg"
                alt="University of Ibadan Crest"
                className="w-8 h-8 sm:w-9 sm:h-9 object-contain rounded drop-shadow-sm group-hover:scale-105 transition-transform hidden sm:inline-block"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-brand-deep group-hover:text-brand-green transition-colors">
                  ASSON UI
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase bg-emerald-50 dark:bg-emerald-950/40 text-brand-green px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                  Unibadan
                </span>
              </div>
              <span className="text-[10px] text-text-muted font-medium hidden sm:inline-block">
                Dept. of Statistics • Facts from Reliable Figures
              </span>
            </div>
          </Link>

          {/* Global Search Bar Trigger (Desktop) */}
          <div className="flex-1 max-w-md hidden md:block">
            <button
              onClick={onOpenSearch}
              className="w-full flex items-center justify-between px-3.5 py-2 text-xs text-text-muted bg-surface-bg rounded-xl border border-border-light hover:border-brand-green/60 hover:bg-emerald-50/30 transition-all text-left group shadow-xs"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-brand-green group-hover:scale-110 transition-transform" />
                <span>Search STA 211, past questions, notes...</span>
              </div>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 font-mono text-[10px] bg-white border border-border-light px-1.5 py-0.5 rounded text-text-muted shadow-xs">
                <span className="text-xs">⌘</span>K
              </kbd>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-xs font-semibold px-3 py-2 rounded-lg transition-all ${isActive
                    ? 'text-brand-green bg-brand-light font-bold shadow-xs'
                    : 'text-text-main hover:text-brand-green hover:bg-surface-bg'
                    }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right CTA Actions: Lean & uncluttered on mobile like WhatsApp, full on desktop */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Mobile Search Button */}
            <button
              onClick={onOpenSearch}
              className="p-1.5 sm:p-2 text-text-muted hover:text-brand-green hover:bg-surface-bg rounded-xl md:hidden min-w-[34px] min-h-[34px] flex items-center justify-center transition-colors"
              aria-label="Search"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Quick Theme Switcher Button (Desktop & Tablet only; mobile accesses theme via Settings) */}
            <button
              type="button"
              onClick={toggleTheme}
              className="hidden md:flex p-2 text-text-muted hover:text-brand-green hover:bg-surface-bg rounded-xl transition-all cursor-pointer min-w-[36px] min-h-[36px] items-center justify-center"
              title={actualTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {actualTheme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-90 duration-200" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700 animate-in spin-in-90 duration-200" />
              )}
            </button>

            {/* Desktop Settings & Preferences Button */}
            {onOpenSettings && (
              <button
                type="button"
                onClick={onOpenSettings}
                className="hidden sm:flex p-2 text-text-muted hover:text-brand-green hover:bg-surface-bg rounded-xl transition-all cursor-pointer min-w-[36px] min-h-[36px] items-center justify-center"
                title="Preferences & Settings"
                aria-label="Open Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}

            {/* Student Study Locker Account (Tablet & Desktop; mobile accesses via Settings) */}
            {onOpenAuth && (
              <button
                type="button"
                onClick={onOpenAuth}
                className="hidden sm:flex p-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-border-light bg-surface-bg hover:border-brand-green/50 transition-all cursor-pointer min-h-[36px] items-center gap-1.5"
                title={profile ? `Signed in as ${profile.displayName}` : 'Student Study Locker / Sign In'}
              >
                {profile ? (
                  <>
                    <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-brand-green text-[10px] font-bold flex items-center justify-center border border-emerald-300 dark:border-emerald-800">
                      {profile.displayName.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden md:inline text-xs font-semibold text-text-main max-w-[80px] truncate">
                      {profile.displayName.split(' ')[0]}
                    </span>
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4 text-text-muted" />
                    <span className="hidden sm:inline text-xs font-semibold text-text-muted hover:text-text-main">
                      Sign In
                    </span>
                  </>
                )}
              </button>
            )}

            {/* Submit Resource CTA: Visible & Compact on Mobile, Full on Desktop */}
            <Button
              size="sm"
              variant="primary"
              onClick={onOpenSubmit}
              className="text-xs h-7.5 sm:h-9 px-2 sm:px-3.5 shadow-sm hover:shadow active:scale-95 font-bold shrink-0"
            >
              <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Submit Material</span>
              <span className="sm:hidden text-[11px]">Submit</span>
            </Button>

            {/* Mobile Hamburger Menu Button */}
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="p-1.5 text-text-muted hover:text-brand-green hover:bg-surface-bg rounded-xl lg:hidden min-w-[34px] min-h-[34px] flex items-center justify-center transition-colors shrink-0"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile WhatsApp-Style Bottom Sheet Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          {/* Backdrop overlay */}
          <div
            onClick={closeMobileMenu}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
          />

          {/* Calm Bottom Sheet Panel (WhatsApp / Telegram Mobile Sheet) */}
          <div className="relative z-10 w-full max-h-[88vh] bg-surface-card rounded-t-3xl shadow-2xl p-5 border-t border-border-light overflow-y-auto animate-in slide-in-from-bottom duration-200 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            {/* Grab handle indicator */}
            <div className="w-12 h-1.5 bg-border-light rounded-full mx-auto mb-3" />

            <div>
              {/* Sheet Header */}
              <div className="flex items-center justify-between pb-3 border-b border-border-light mb-4">
                <div className="flex items-center gap-2">
                  <img src="/logo/asson_logo.png" alt="ASSON" className="w-7 h-7 object-contain" />
                  <span className="font-bold text-sm text-brand-deep">Menu & Gateways</span>
                </div>
                <button
                  onClick={closeMobileMenu}
                  className="p-1.5 text-text-muted hover:text-text-main hover:bg-surface-bg rounded-lg active:scale-95 transition-transform"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Navigation Links */}
              <div className="space-y-1 mb-5">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={closeMobileMenu}
                      className={`flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-all duration-150 active:scale-95 ${isActive
                        ? 'bg-brand-light text-brand-deep font-bold'
                        : 'text-text-main hover:bg-surface-bg hover:text-brand-green'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`p-1.5 rounded-lg ${isActive ? 'bg-brand-green text-white' : 'bg-surface-bg text-text-muted'}`}>
                          <Icon className="w-4 h-4" />
                        </span>
                        <span>{link.name}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-text-subtle" />
                    </Link>
                  );
                })}

                {/* Preferences & Settings in Mobile Sheet */}
                {onOpenSettings && (
                  <button
                    type="button"
                    onClick={() => {
                      closeMobileMenu();
                      onOpenSettings();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold text-text-main hover:bg-surface-bg hover:text-brand-green transition-all duration-150 active:scale-95 cursor-pointer text-left"
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
              </div>

              {/* Quick Level Filter Shortcuts */}
              <div className="p-3 rounded-xl bg-surface-bg border border-border-light mb-4">
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block mb-2">
                  Browse by Level
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {['100', '200', '300', '400'].map((lvl) => (
                    <Link
                      key={lvl}
                      to={`/resources?level=${lvl}`}
                      onClick={closeMobileMenu}
                      className="text-center py-2 px-1 text-xs font-bold rounded-lg bg-surface-card border border-border-light text-brand-deep hover:bg-brand-green hover:text-white transition-all active:scale-90"
                    >
                      {lvl}L
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Sheet Bottom Actions */}
            <div className="pt-3 border-t border-border-light space-y-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  closeMobileMenu();
                  onOpenSubmit();
                }}
                className="w-full justify-center shadow-md font-bold"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Submit Academic Material
              </Button>

              <div className="flex items-center justify-center gap-3 text-[11px] text-text-muted pt-2">
                <Link to="/terms" onClick={closeMobileMenu} className="hover:text-brand-green transition-colors">
                  Terms of Service
                </Link>
                <span>•</span>
                <Link to="/privacy" onClick={closeMobileMenu} className="hover:text-brand-green transition-colors">
                  Privacy Policy
                </Link>
              </div>

              <div className="text-center text-[10px] text-text-muted pt-1">
                Dept. of Statistics • University of Ibadan<br />
                <span className="text-brand-green font-medium">Facts from Reliable Figures</span>
                <Link
                  to="/console"
                  onClick={closeMobileMenu}
                  className="inline-block text-text-subtle/30 hover:text-text-muted transition-colors px-1 select-none"
                  aria-label="Executive Portal"
                >
                  •
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
