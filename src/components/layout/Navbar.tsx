import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Search,
  PlusCircle,
  BookOpen,
  FileText,
  Bell,
  GraduationCap,
  User,
  Sun,
  Moon,
  Settings,
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

          {/* Global Search Bar Trigger (Desktop - matching Spotlight Trigger) */}
          <div className="flex-1 max-w-sm hidden md:block">
            <button
              data-tour="search-trigger"
              onClick={onOpenSearch}
              className="w-full flex items-center justify-between px-3.5 py-2 text-xs text-zinc-400 bg-white dark:bg-[#13171D] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 hover:border-[#087A3E]/60 transition-all text-left group shadow-xs cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Search className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#087A3E] transition-colors" />
                <span className="text-zinc-500 font-medium">Search</span>
              </div>
              <div className="flex items-center gap-1.5">
                <kbd className="hidden lg:inline-flex items-center gap-0.5 font-mono text-[10px] bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-1.5 py-0.5 rounded text-zinc-500 shadow-2xs font-semibold">
                  ⌘ + K
                </kbd>
              </div>
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

          {/* Right CTA Actions: Quiet, calm and uncluttered like WhatsApp & Claude */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Mobile Search Button */}
            <button
              onClick={onOpenSearch}
              className="p-2 text-text-muted hover:text-brand-green hover:bg-surface-bg rounded-xl md:hidden min-w-[38px] min-h-[38px] flex items-center justify-center transition-colors"
              aria-label="Search past questions and courses"
            >
              <Search className="w-5 h-5 text-text-muted hover:text-brand-green" />
            </button>

            {/* Mobile Submit Button: 1-Tap Access for Easy Material Upload */}
            <button
              type="button"
              data-tour="submit-trigger"
              onClick={onOpenSubmit}
              className="inline-flex sm:hidden items-center gap-1 px-2.5 py-1.5 rounded-xl bg-brand-green text-white hover:bg-brand-deep font-bold text-xs shadow-2xs active:scale-95 transition-all cursor-pointer shrink-0"
              aria-label="Submit Material"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Submit</span>
            </button>

            {/* Quick Theme Switcher Button (Desktop & Tablet only; mobile accesses theme via More) */}
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

            {/* Student Study Locker Account (Tablet & Desktop; mobile accesses via More) */}
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

            {/* Submit Resource CTA: Desktop & Tablet Only */}
            <Button
              size="sm"
              variant="primary"
              data-tour="submit-trigger"
              onClick={onOpenSubmit}
              className="hidden sm:inline-flex text-xs h-9 px-3.5 shadow-sm hover:shadow active:scale-95 font-bold shrink-0"
            >
              <PlusCircle className="w-4 h-4 mr-1.5" />
              <span>Submit Material</span>
            </Button>
          </div>
        </div>
      </header>
    </>
  );
};
