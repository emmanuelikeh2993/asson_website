import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme, Theme } from '../context/ThemeContext';
import { useToast } from '../components/ui/Toast';
import { getCachedStudentProfile, studentSignOut } from '../lib/supabase';
import { UserProfile } from '../types';
import {
  User,
  GraduationCap,
  Bookmark,
  PlusCircle,
  Sun,
  Moon,
  Monitor,
  Zap,
  HardDrive,
  Smartphone,
  Bell,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  ChevronRight,
  LogOut,
  ExternalLink,
  Check,
  Download
} from 'lucide-react';

interface MorePageProps {
  onOpenSubmit: () => void;
  onOpenAuth: () => void;
}

export const MorePage: React.FC<MorePageProps> = ({ onOpenSubmit, onOpenAuth }) => {
  const { theme, setTheme } = useTheme();
  const toast = useToast();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile | null>(() => getCachedStudentProfile());

  const [defaultLevel, setDefaultLevel] = useState<string>(() => {
    try {
      return localStorage.getItem('asson_default_level') || 'All';
    } catch {
      return 'All';
    }
  });

  const [dataSaver, setDataSaver] = useState<boolean>(() => {
    try {
      return localStorage.getItem('asson_data_saver') === 'true';
    } catch {
      return false;
    }
  });

  const [isStandalone, setIsStandalone] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
  });

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [cacheSize, setCacheSize] = useState<string>('0.8 KB');

  useEffect(() => {
    setProfile(getCachedStudentProfile());

    // Storage calculation
    try {
      let total = 0;
      for (const key in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
          total += (localStorage[key].length + key.length) * 2;
        }
      }
      if (total < 1024) {
        setCacheSize(`${total} B`);
      } else if (total < 1024 * 1024) {
        setCacheSize(`${(total / 1024).toFixed(1)} KB`);
      } else {
        setCacheSize(`${(total / (1024 * 1024)).toFixed(1)} MB`);
      }
    } catch {
      setCacheSize('1.2 KB');
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleLevelChange = (lvl: string) => {
    setDefaultLevel(lvl);
    try {
      localStorage.setItem('asson_default_level', lvl);
      toast.info('Preference Updated', `Default level set to ${lvl === 'All' ? 'All Levels' : `${lvl}L`}`);
    } catch {
      // ignore
    }
  };

  const handleToggleDataSaver = () => {
    const nextVal = !dataSaver;
    setDataSaver(nextVal);
    try {
      localStorage.setItem('asson_data_saver', nextVal ? 'true' : 'false');
      toast.info(
        nextVal ? 'Data Saver Enabled' : 'Data Saver Disabled',
        nextVal ? 'Optimized for low cellular data on UI campus networks.' : 'Full document resolution enabled.'
      );
    } catch {
      // ignore
    }
  };

  const handleClearCache = () => {
    try {
      const keysToKeep = ['asson_theme_preference', 'asson_default_level', 'asson_data_saver', 'asson_student_token'];
      const preserved: Record<string, string> = {};
      keysToKeep.forEach((k) => {
        const val = localStorage.getItem(k);
        if (val) preserved[k] = val;
      });

      localStorage.clear();

      Object.entries(preserved).forEach(([k, v]) => {
        localStorage.setItem(k, v);
      });

      setCacheSize('0.8 KB');
      toast.success('Cache Cleaned', 'Temporary offline cached resources cleared successfully.');
    } catch {
      toast.error('Unable to clear', 'Please clear site data directly in your browser settings.');
    }
  };

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsStandalone(true);
        toast.success('App Installed!', 'ASSON UI is now installed on your device as a full screen app.');
      }
      setDeferredPrompt(null);
    } else {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      if (isIOS) {
        alert("To install on iOS / Safari:\n1. Tap the Share button at the bottom of Safari.\n2. Scroll down and tap 'Add to Home Screen'.\n3. Tap 'Add' to launch ASSON UI as a full screen app.");
      } else {
        alert("To install ASSON UI:\n1. Tap your browser menu (⋮).\n2. Tap 'Install App' or 'Add to Home screen'.");
      }
    }
  };

  const handleSignOut = async () => {
    await studentSignOut();
    setProfile(null);
    toast.info('Signed Out', 'Your study locker session has ended on this device.');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 pb-24">
      {/* Page Title */}
      <div className="flex items-center justify-between pb-2 border-b border-border-light/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-text-main tracking-tight">
            Account & Settings
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Dept. of Statistics • University of Ibadan
          </p>
        </div>
        <img
          src="/logo/asson_logo.png"
          alt="ASSON"
          className="w-8 h-8 sm:w-9 sm:h-9 object-contain"
        />
      </div>

      {/* 1. TOP PROFILE CARD (Inspired by Reference Images) */}
      <div className="rounded-2xl sm:rounded-3xl border border-border-light bg-surface-card p-4 sm:p-5 shadow-sm space-y-3.5 transition-all">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar */}
            <div className="relative w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-brand-green font-extrabold text-base flex items-center justify-center border-2 border-emerald-300 dark:border-emerald-800 shrink-0 shadow-2xs">
              {profile ? profile.displayName.charAt(0).toUpperCase() : <User className="w-5 h-5 text-brand-green" />}
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-surface-card" />
            </div>

            {/* User Info */}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-extrabold text-text-main truncate block">
                  {profile ? profile.displayName : 'Guest Student'}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-brand-green border border-emerald-200 dark:border-emerald-800 shrink-0">
                  {profile ? (profile.level ? `${profile.level}L` : 'Scholar') : 'Public'}
                </span>
              </div>
              <span className="text-xs text-text-muted truncate block mt-0.5">
                {profile ? (profile.email || `${profile.department || 'UI Statistics'} • ${profile.level}L`) : 'Zero-login public access'}
              </span>
            </div>
          </div>

          {profile && (
            <button
              type="button"
              onClick={handleSignOut}
              className="p-2 text-text-muted hover:text-brand-red hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors cursor-pointer shrink-0"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Action Button */}
        {profile ? (
          <button
            type="button"
            onClick={onOpenAuth}
            className="w-full py-2.5 px-4 rounded-xl bg-surface-bg border border-border-light hover:border-brand-green text-xs font-bold text-text-main hover:text-brand-green transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            <User className="w-4 h-4 text-brand-green" />
            <span>Manage Study Locker Account</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenAuth}
            className="w-full py-2.5 px-4 rounded-xl bg-brand-green hover:bg-brand-deep text-white text-xs font-bold transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            <span>Sign In to Student Study Locker</span>
          </button>
        )}
      </div>

      {/* 2. ACADEMICS GROUP CARD */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider px-1">
          Academics
        </span>
        <div className="rounded-2xl border border-border-light bg-surface-card divide-y divide-border-light/60 overflow-hidden shadow-2xs text-xs">
          {/* Default Level Selector */}
          <div className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-brand-green flex items-center justify-center shrink-0 border border-emerald-200/60 dark:border-emerald-800/60">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-text-main block">Academic Level Focus</span>
                <span className="text-[11px] text-text-muted">Filtered catalog view</span>
              </div>
            </div>

            {/* Level Selector Pills */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none self-start sm:self-auto">
              {(['All', '100', '200', '300', '400', 'Postgraduate'] as const).map((lvl) => {
                const label = lvl === 'All' ? 'All' : lvl === 'Postgraduate' ? 'PG' : `${lvl}L`;
                const isSelected = defaultLevel === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => handleLevelChange(lvl)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-brand-green text-white shadow-2xs'
                        : 'bg-surface-bg text-text-muted hover:text-text-main border border-border-light/60'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Saved Bookmarks */}
          <Link
            to="/dashboard"
            className="p-3.5 sm:p-4 flex items-center justify-between hover:bg-surface-bg/60 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-surface-bg text-text-muted group-hover:text-brand-green flex items-center justify-center shrink-0 border border-border-light">
                <Bookmark className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-text-main group-hover:text-brand-green transition-colors block">
                  Saved Materials & Bookmarks
                </span>
                <span className="text-[11px] text-text-muted">
                  Quick access to your pinned examination papers
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-text-subtle group-hover:text-brand-green transition-transform group-hover:translate-x-0.5" />
          </Link>

          {/* Submit Material CTA */}
          <button
            type="button"
            onClick={onOpenSubmit}
            className="w-full p-3.5 sm:p-4 flex items-center justify-between hover:bg-surface-bg/60 transition-colors group text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-brand-green flex items-center justify-center shrink-0 border border-emerald-200/60 dark:border-emerald-800/60">
                <PlusCircle className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-text-main group-hover:text-brand-green transition-colors block">
                  Contribute Academic Material
                </span>
                <span className="text-[11px] text-text-muted">
                  Upload verified past questions, outlines or tutorial notes
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-text-subtle group-hover:text-brand-green transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>

      {/* 3. PREFERENCES & EXPERIENCE GROUP CARD */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider px-1">
          Preferences
        </span>
        <div className="rounded-2xl border border-border-light bg-surface-card divide-y divide-border-light/60 overflow-hidden shadow-2xs text-xs">
          {/* Appearance & Theme */}
          <div className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-surface-bg text-amber-500 flex items-center justify-center shrink-0 border border-border-light">
                <Sun className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-text-main block">Appearance</span>
                <span className="text-[11px] text-text-muted">Theme display preference</span>
              </div>
            </div>

            {/* Segmented Theme Switcher */}
            <div className="inline-flex p-1 rounded-xl bg-surface-bg border border-border-light self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'bg-surface-card text-brand-deep shadow-2xs'
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Light</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-surface-card text-brand-green shadow-2xs'
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-slate-700 dark:text-emerald-400" />
                <span>Dark</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('system')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  theme === 'system'
                    ? 'bg-surface-card text-brand-green shadow-2xs'
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                <Monitor className="w-3.5 h-3.5 text-text-muted" />
                <span>System</span>
              </button>
            </div>
          </div>

          {/* Campus Data Saver */}
          <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-surface-bg text-emerald-600 flex items-center justify-center shrink-0 border border-border-light">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-text-main block">Campus Data Saver</span>
                <span className="text-[11px] text-text-muted">Low cellular bandwidth mode</span>
              </div>
            </div>

            {/* Toggle Switch */}
            <button
              type="button"
              role="switch"
              aria-checked={dataSaver}
              onClick={handleToggleDataSaver}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                dataSaver ? 'bg-brand-green' : 'bg-neutral-300 dark:bg-neutral-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  dataSaver ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Offline Storage Cache */}
          <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-surface-bg text-text-muted flex items-center justify-center shrink-0 border border-border-light">
                <HardDrive className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-text-main block">Offline Storage</span>
                <span className="text-[11px] text-text-muted">Cached papers: {cacheSize}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClearCache}
              className="px-3 py-1.5 rounded-lg border border-border-light hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-950/40 text-text-muted hover:text-brand-red font-semibold text-xs transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>

          {/* Standalone App Status */}
          <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-surface-bg text-text-muted flex items-center justify-center shrink-0 border border-border-light">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-text-main block">Standalone App</span>
                <span className="text-[11px] text-text-muted">
                  {isStandalone ? 'Installed & running full screen' : 'Add to home screen'}
                </span>
              </div>
            </div>

            {isStandalone ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-green bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <Check className="w-3.5 h-3.5" /> Installed
              </span>
            ) : (
              <button
                type="button"
                onClick={handleInstallApp}
                className="px-3 py-1.5 rounded-lg bg-surface-bg border border-border-light hover:border-brand-green text-brand-green font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. GENERAL & CAMPUS GATEWAYS */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider px-1">
          Campus Gateways
        </span>
        <div className="rounded-2xl border border-border-light bg-surface-card divide-y divide-border-light/60 overflow-hidden shadow-2xs text-xs">
          {/* Department Notices */}
          <Link
            to="/notices"
            className="p-3.5 sm:p-4 flex items-center justify-between hover:bg-surface-bg/60 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-surface-bg text-text-muted group-hover:text-brand-green flex items-center justify-center shrink-0 border border-border-light">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-text-main group-hover:text-brand-green transition-colors block">
                  Department Notices & RSVPs
                </span>
                <span className="text-[11px] text-text-muted">
                  Official Senate and ASSON announcements
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-text-subtle group-hover:text-brand-green transition-transform group-hover:translate-x-0.5" />
          </Link>

          {/* Opportunities & Scholarships */}
          <Link
            to="/opportunities"
            className="p-3.5 sm:p-4 flex items-center justify-between hover:bg-surface-bg/60 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-surface-bg text-text-muted group-hover:text-brand-green flex items-center justify-center shrink-0 border border-border-light">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-text-main group-hover:text-brand-green transition-colors block">
                  Scholarships & Opportunities
                </span>
                <span className="text-[11px] text-text-muted">
                  Vetted internships and grant applications
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-text-subtle group-hover:text-brand-green transition-transform group-hover:translate-x-0.5" />
          </Link>

          {/* Help Center */}
          <Link
            to="/help"
            className="p-3.5 sm:p-4 flex items-center justify-between hover:bg-surface-bg/60 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-surface-bg text-text-muted group-hover:text-brand-green flex items-center justify-center shrink-0 border border-border-light">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-text-main group-hover:text-brand-green transition-colors block">
                  Help Center & FAQs
                </span>
                <span className="text-[11px] text-text-muted">
                  Past questions download guide and course advisory
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-text-subtle group-hover:text-brand-green transition-transform group-hover:translate-x-0.5" />
          </Link>

          {/* Executive Portal */}
          <Link
            to="/console"
            className="p-3.5 sm:p-4 flex items-center justify-between hover:bg-surface-bg/60 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-brand-green flex items-center justify-center shrink-0 border border-emerald-200/60 dark:border-emerald-800/60">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-text-main group-hover:text-brand-green transition-colors block">
                  Executive Admin Portal
                </span>
                <span className="text-[11px] text-text-muted">
                  Material vetting pipeline & departmental console
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-text-subtle group-hover:text-brand-green transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>

      {/* 5. ABOUT & LEGAL FOOTER */}
      <div className="pt-2 text-center space-y-2">
        <div className="flex items-center justify-center gap-3 text-xs text-text-muted">
          <Link to="/terms" className="hover:text-brand-green transition-colors font-medium">
            Terms of Service
          </Link>
          <span>•</span>
          <Link to="/privacy" className="hover:text-brand-green transition-colors font-medium">
            Privacy Policy
          </Link>
          <span>•</span>
          <Link to="/faqs" className="hover:text-brand-green transition-colors font-medium">
            FAQs
          </Link>
        </div>
        <div className="text-[11px] text-text-subtle">
          ASSON UI v2.3 • Facts from Reliable Figures<br />
          Department of Statistics, Faculty of Science, University of Ibadan
        </div>
      </div>
    </div>
  );
};
