import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/ui/Toast';
import { getCachedStudentProfile, studentSignOut } from '../lib/supabase';
import { UserProfile } from '../types';
import {
  User,
  GraduationCap,
  Bookmark,
  PlusCircle,
  FileText,
  Calendar,
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
  Download,
  BookOpen,
  Users,
  Building2,
  Shield,
  ArrowUpRight,
  X
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
  const [showDeptModal, setShowDeptModal] = useState<boolean>(false);

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
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border-light/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-text-main tracking-tight">
            Explore & Preferences
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

      {/* 1. TOP PROFILE CARD (Inspired by DCN Explore & Reference Images) */}
      <div className="rounded-2xl sm:rounded-3xl border border-border-light bg-surface-card p-4 sm:p-5 shadow-sm space-y-3.5 transition-all">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar */}
            <div className="relative w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-brand-green font-extrabold text-base flex items-center justify-center border-2 border-emerald-300 dark:border-emerald-800 shrink-0 shadow-2xs">
              {profile ? profile.displayName.charAt(0).toUpperCase() : <User className="w-5 h-5 text-brand-green" />}
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-surface-card" />
            </div>

            {/* User Info */}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-extrabold text-text-main truncate block">
                  {profile ? profile.displayName : 'Guest Statistics Scholar'}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-brand-green border border-emerald-200 dark:border-emerald-800 shrink-0">
                  {profile ? (profile.level ? `${profile.level}L` : 'Scholar') : 'Public'}
                </span>
              </div>
              <span className="text-xs text-text-muted truncate block mt-0.5">
                {profile ? (profile.email || `${profile.department || 'UI Statistics'} • ${profile.level}L`) : 'Zero-login public access library'}
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
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenAuth}
              className="flex-1 py-2.5 px-4 rounded-xl bg-surface-bg border border-border-light hover:border-brand-green text-xs font-bold text-text-main hover:text-brand-green transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <User className="w-4 h-4 text-brand-green" />
              <span>Manage Study Locker</span>
            </button>
            <Link
              to="/dashboard"
              className="py-2.5 px-3.5 rounded-xl bg-surface-bg border border-border-light hover:border-brand-green text-xs font-bold text-text-main hover:text-brand-green transition-all shadow-2xs flex items-center justify-center gap-1.5 active:scale-[0.99]"
              title="Saved Bookmarks"
            >
              <Bookmark className="w-4 h-4 text-amber-500" />
              <span className="hidden sm:inline">Bookmarks</span>
            </Link>
          </div>
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

      {/* 2. ACADEMIC HUB: 3-Tile Row (Direct DCN Explore Structure) */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider px-1">
          Academic Hub
        </span>
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5">
          <Link
            to="/past-questions"
            className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-surface-card border border-border-light hover:border-brand-green/60 hover:shadow-2xs transition-all text-center group active:scale-95"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-brand-green flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform border border-emerald-200/60 dark:border-emerald-800/60 shadow-2xs">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-text-main group-hover:text-brand-green transition-colors">
              Past Papers
            </span>
            <span className="text-[10px] text-text-muted mt-0.5 hidden sm:inline">100L–400L</span>
          </Link>

          <Link
            to="/calendar"
            className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-surface-card border border-border-light hover:border-sky-500/60 hover:shadow-2xs transition-all text-center group active:scale-95"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-300 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform border border-sky-200/60 dark:border-sky-800/60 shadow-2xs">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-text-main group-hover:text-sky-600 transition-colors">
              Timetable
            </span>
            <span className="text-[10px] text-text-muted mt-0.5 hidden sm:inline">Tests & Exams</span>
          </Link>

          <button
            type="button"
            onClick={onOpenSubmit}
            className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-surface-card border border-border-light hover:border-purple-500/60 hover:shadow-2xs transition-all text-center group active:scale-95 cursor-pointer"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform border border-purple-200/60 dark:border-purple-800/60 shadow-2xs">
              <PlusCircle className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-text-main group-hover:text-purple-600 transition-colors">
              Submit Note
            </span>
            <span className="text-[10px] text-text-muted mt-0.5 hidden sm:inline">Contribute</span>
          </button>
        </div>
      </div>

      {/* 3. CAMPUS SERVICES: 3x2 Grid (Direct DCN Explore Structure) */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider px-1">
          Campus Services
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
          <Link
            to="/opportunities"
            className="p-3.5 rounded-2xl border border-border-light bg-surface-card hover:border-brand-green/60 hover:shadow-2xs transition-all group flex flex-col justify-between active:scale-[0.99]"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-300 flex items-center justify-center mb-2.5 border border-amber-200/60 dark:border-amber-800/60 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-text-main group-hover:text-brand-green transition-colors block">
                Scholarships
              </span>
              <span className="text-[10px] text-text-muted mt-0.5 line-clamp-1">
                Internships & Grants
              </span>
            </div>
          </Link>

          <Link
            to="/notices"
            className="p-3.5 rounded-2xl border border-border-light bg-surface-card hover:border-brand-green/60 hover:shadow-2xs transition-all group flex flex-col justify-between active:scale-[0.99]"
          >
            <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-300 flex items-center justify-center mb-2.5 border border-sky-200/60 dark:border-sky-800/60 group-hover:scale-105 transition-transform">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-text-main group-hover:text-brand-green transition-colors block">
                Notices
              </span>
              <span className="text-[10px] text-text-muted mt-0.5 line-clamp-1">
                Senate & ASSON
              </span>
            </div>
          </Link>

          <Link
            to="/resources"
            className="p-3.5 rounded-2xl border border-border-light bg-surface-card hover:border-brand-green/60 hover:shadow-2xs transition-all group flex flex-col justify-between active:scale-[0.99]"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-brand-green flex items-center justify-center mb-2.5 border border-emerald-200/60 dark:border-emerald-800/60 group-hover:scale-105 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-text-main group-hover:text-brand-green transition-colors block">
                Course Outlines
              </span>
              <span className="text-[10px] text-text-muted mt-0.5 line-clamp-1">
                Approved Syllabi
              </span>
            </div>
          </Link>

          <Link
            to="/help"
            className="p-3.5 rounded-2xl border border-border-light bg-surface-card hover:border-brand-green/60 hover:shadow-2xs transition-all group flex flex-col justify-between active:scale-[0.99]"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-300 flex items-center justify-center mb-2.5 border border-purple-200/60 dark:border-purple-800/60 group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-text-main group-hover:text-brand-green transition-colors block">
                Study Circles
              </span>
              <span className="text-[10px] text-text-muted mt-0.5 line-clamp-1">
                Peer Discussion
              </span>
            </div>
          </Link>

          <Link
            to="/help"
            className="p-3.5 rounded-2xl border border-border-light bg-surface-card hover:border-brand-green/60 hover:shadow-2xs transition-all group flex flex-col justify-between active:scale-[0.99]"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-300 flex items-center justify-center mb-2.5 border border-teal-200/60 dark:border-teal-800/60 group-hover:scale-105 transition-transform">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-text-main group-hover:text-brand-green transition-colors block">
                Help & FAQs
              </span>
              <span className="text-[10px] text-text-muted mt-0.5 line-clamp-1">
                Library Guidance
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setShowDeptModal(true)}
            className="p-3.5 rounded-2xl border border-border-light bg-surface-card hover:border-brand-green/60 hover:shadow-2xs transition-all group flex flex-col justify-between active:scale-[0.99] text-left cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-300 flex items-center justify-center mb-2.5 border border-rose-200/60 dark:border-rose-800/60 group-hover:scale-105 transition-transform">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-text-main group-hover:text-brand-green transition-colors block">
                Dept Info
              </span>
              <span className="text-[10px] text-text-muted mt-0.5 line-clamp-1">
                HOD & Secretariat
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* 4. PREFERENCES: Grouped iOS / DCN Style Card */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider px-1">
          Preferences
        </span>
        <div className="rounded-2xl border border-border-light bg-surface-card divide-y divide-border-light/60 overflow-hidden shadow-2xs text-xs">
          {/* Appearance / Theme */}
          <div className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-surface-bg text-amber-500 flex items-center justify-center shrink-0 border border-border-light">
                <Sun className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-text-main block">Appearance</span>
                <span className="text-[11px] text-text-muted">Display theme preference</span>
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

          {/* Academic Level Focus */}
          <div className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-brand-green flex items-center justify-center shrink-0 border border-emerald-200/60 dark:border-emerald-800/60">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-text-main block">Academic Level Focus</span>
                <span className="text-[11px] text-text-muted">Targeted course catalog view</span>
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

          {/* Campus Data Saver */}
          <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-surface-bg text-emerald-600 flex items-center justify-center shrink-0 border border-border-light">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-text-main block">Campus Data Saver</span>
                <span className="text-[11px] text-text-muted">Low bandwidth mode for UI campus Wi-Fi</span>
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
                <span className="text-[11px] text-text-muted">Cached papers & data: {cacheSize}</span>
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
        </div>
      </div>

      {/* 5. APP & ADMINISTRATION: Grouped iOS / DCN Style Card */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider px-1">
          App & Administration
        </span>
        <div className="rounded-2xl border border-border-light bg-surface-card divide-y divide-border-light/60 overflow-hidden shadow-2xs text-xs">
          {/* Standalone App Status */}
          <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-surface-bg text-text-muted flex items-center justify-center shrink-0 border border-border-light">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-text-main block">Standalone Web App</span>
                <span className="text-[11px] text-text-muted">
                  {isStandalone ? 'Installed & running full screen' : 'Add to home screen for instant access'}
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

          {/* Terms of Service */}
          <Link
            to="/terms"
            className="p-3.5 sm:p-4 flex items-center justify-between hover:bg-surface-bg/60 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-surface-bg text-text-muted group-hover:text-brand-green flex items-center justify-center shrink-0 border border-border-light">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-text-main group-hover:text-brand-green transition-colors block">
                  Terms of Service
                </span>
                <span className="text-[11px] text-text-muted">Academic honor code & usage rules</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-text-subtle group-hover:text-brand-green transition-transform group-hover:translate-x-0.5" />
          </Link>

          {/* Privacy Policy */}
          <Link
            to="/privacy"
            className="p-3.5 sm:p-4 flex items-center justify-between hover:bg-surface-bg/60 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-surface-bg text-text-muted group-hover:text-brand-green flex items-center justify-center shrink-0 border border-border-light">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-text-main group-hover:text-brand-green transition-colors block">
                  Privacy Policy & NDPA
                </span>
                <span className="text-[11px] text-text-muted">Data protection & cookie principles</span>
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

      {/* Department Info Modal */}
      {showDeptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl bg-surface-card border border-border-light p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-light/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-brand-green flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-text-main">
                    Dept. of Statistics
                  </h3>
                  <span className="text-[11px] text-text-muted">University of Ibadan</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDeptModal(false)}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-surface-bg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-text-muted">
              <div>
                <span className="font-bold text-text-main block">Location</span>
                <p className="mt-0.5">Faculty of Science, University of Ibadan, Ibadan, Oyo State, Nigeria.</p>
              </div>
              <div>
                <span className="font-bold text-text-main block">Official Association</span>
                <p className="mt-0.5">Association of Statistics Students of Nigeria (ASSON UI Chapter).</p>
              </div>
              <div>
                <span className="font-bold text-text-main block">Motto</span>
                <p className="mt-0.5 text-brand-green font-semibold">“Together for Academic Excellence • Facts from Reliable Figures”</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowDeptModal(false)}
              className="w-full py-2.5 rounded-xl bg-brand-green text-white font-bold text-xs hover:bg-brand-deep transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Legal & Version Footer */}
      <div className="pt-2 text-center space-y-1.5">
        <div className="text-[11px] text-text-subtle">
          ASSON UI • University of Ibadan Chapter<br />
          Facts from Reliable Figures
        </div>
      </div>
    </div>
  );
};
