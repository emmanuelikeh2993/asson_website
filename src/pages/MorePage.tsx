import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/ui/Toast';
import { getCachedStudentProfile, studentSignOut } from '../lib/supabase';
import { UserProfile } from '../types';
import {
  User,
  GraduationCap,
  Sun,
  Moon,
  Monitor,
  Zap,
  HardDrive,
  Smartphone,
  ChevronRight,
  LogOut,
  Check,
  Download,
  Building2,
  Shield,
  FileText,
  Sparkles,
  HelpCircle,
  Briefcase,
  Award,
  PlusCircle,
  Compass,
  Calculator,
  X
} from 'lucide-react';
import { useOnboarding } from '../context/OnboardingContext';
import { StaffDirectoryModal } from '../components/features/department/StaffDirectoryModal';
import { ExecutiveCouncilModal } from '../components/features/department/ExecutiveCouncilModal';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

interface WindowWithMSStream extends Window {
  MSStream?: unknown;
}

interface MorePageProps {
  onOpenSubmit: () => void;
  onOpenAuth: () => void;
}

export const MorePage: React.FC<MorePageProps> = ({ onOpenAuth, onOpenSubmit }) => {
  const { theme, setTheme } = useTheme();
  const { restartOnboarding } = useOnboarding();
  const toast = useToast();

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
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as NavigatorWithStandalone).standalone === true
    );
  });

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [cacheSize, setCacheSize] = useState<string>('0.8 KB');
  const [showDeptModal, setShowDeptModal] = useState<boolean>(false);
  const [showStaffModal, setShowStaffModal] = useState<boolean>(false);
  const [showExecModal, setShowExecModal] = useState<boolean>(false);

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
      setDeferredPrompt(e as BeforeInstallPromptEvent);
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
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as WindowWithMSStream).MSStream;
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
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border-light/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-text-main tracking-tight">
            More & Settings
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Department of Statistics • University of Ibadan
          </p>
        </div>
        <img
          src="/logo/asson_logo.webp"
          alt="ASSON"
          width={36}
          height={36}
          className="w-8 h-8 sm:w-9 sm:h-9 object-contain"
        />
      </div>

      {/* 1. STUDENT STUDY LOCKER CARD (Grouped Profile) */}
      <div className="rounded-2xl border border-border-light bg-surface-card p-4 sm:p-5 shadow-2xs space-y-3.5 transition-all">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-brand-green font-extrabold text-base flex items-center justify-center border border-emerald-200/80 dark:border-emerald-800/80 shrink-0">
              {profile ? profile.displayName.charAt(0).toUpperCase() : <User className="w-5 h-5 text-brand-green" />}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-bold text-text-main truncate block">
                  {profile ? profile.displayName : 'Guest Statistics Scholar'}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-brand-deep dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
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
          <button
            type="button"
            onClick={onOpenAuth}
            className="w-full py-2.5 px-4 rounded-xl bg-surface-bg border border-border-light hover:border-brand-green text-xs font-bold text-text-main hover:text-brand-green transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <User className="w-4 h-4 text-brand-green" aria-hidden="true" />
            <span>Manage Study Locker Account</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenAuth}
            className="w-full py-2.5 px-4 min-h-[44px] rounded-xl bg-brand-green hover:bg-brand-deep text-white text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Sign In to Student Study Locker</span>
          </button>
        )}
      </div>

      {/* 2. PREFERENCES (Grouped iOS Style Card) */}
      <div className="space-y-1.5">
        <span className="text-xs font-bold text-text-muted uppercase tracking-wider px-1">
          Preferences
        </span>
        <div className="rounded-2xl border border-border-light bg-surface-card divide-y divide-border-light/60 overflow-hidden shadow-2xs text-xs">
          {/* Appearance / Theme */}
          <div className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-surface-bg text-amber-500 flex items-center justify-center shrink-0 border border-border-light">
                <Sun className="w-4 h-4" aria-hidden="true" />
              </div>
              <div>
                <span className="font-bold text-text-main block">Appearance</span>
                <span className="text-xs text-text-muted">Display theme preference</span>
              </div>
            </div>

            <div className="inline-flex p-1 rounded-xl bg-surface-bg border border-border-light self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'bg-surface-card text-brand-deep dark:text-emerald-300 shadow-2xs'
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
                <span>Light</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-surface-card text-brand-green shadow-2xs'
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-slate-700 dark:text-emerald-400" aria-hidden="true" />
                <span>Dark</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('system')}
                className={`flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  theme === 'system'
                    ? 'bg-surface-card text-brand-green shadow-2xs'
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                <Monitor className="w-3.5 h-3.5 text-text-muted" aria-hidden="true" />
                <span>System</span>
              </button>
            </div>
          </div>

          {/* Academic Level Focus */}
          <div className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-surface-bg text-brand-green flex items-center justify-center shrink-0 border border-border-light">
                <GraduationCap className="w-4 h-4" aria-hidden="true" />
              </div>
              <div>
                <span className="font-bold text-text-main block">Academic Level Focus</span>
                <span className="text-xs text-text-muted">Targeted course catalog view</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none self-start sm:self-auto">
              {(['100', '200', '300', '400', 'All'] as const).map((lvl) => {
                const label = lvl === 'All' ? 'All' : `${lvl}L`;
                const isSelected = defaultLevel === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => handleLevelChange(lvl)}
                    className={`px-3 py-2 min-h-[44px] min-w-[44px] sm:min-h-[38px] rounded-lg text-xs font-bold transition-all cursor-pointer ${
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
                <Zap className="w-4 h-4" aria-hidden="true" />
              </div>
              <div>
                <span className="font-bold text-text-main block">Campus Data Saver</span>
                <span className="text-xs text-text-muted">Low bandwidth mode for UI campus networks</span>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-label="Toggle Campus Data Saver"
              aria-checked={dataSaver}
              onClick={handleToggleDataSaver}
              className="min-w-[44px] min-h-[44px] flex items-center justify-end cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green rounded-xl px-1 -mr-1"
            >
              <span
                className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  dataSaver ? 'bg-brand-green' : 'bg-neutral-300 dark:bg-neutral-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    dataSaver ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </span>
            </button>
          </div>

          {/* Offline Storage Cache */}
          <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-surface-bg text-text-muted flex items-center justify-center shrink-0 border border-border-light">
                <HardDrive className="w-4 h-4" aria-hidden="true" />
              </div>
              <div>
                <span className="font-bold text-text-main block">Offline Storage</span>
                <span className="text-xs text-text-muted">Cached papers & data: {cacheSize}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClearCache}
              className="px-3.5 py-2 min-h-[44px] min-w-[44px] sm:min-h-[38px] rounded-lg border border-border-light hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-950/40 text-text-muted hover:text-brand-red font-semibold text-xs transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>

          {/* Install Standalone Web App */}
          <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-surface-bg text-text-muted flex items-center justify-center shrink-0 border border-border-light">
                <Smartphone className="w-4 h-4" aria-hidden="true" />
              </div>
              <div>
                <span className="font-bold text-text-main block">Standalone Web App</span>
                <span className="text-xs text-text-muted">
                  {isStandalone ? 'Installed & running full screen' : 'Add to home screen for instant access'}
                </span>
              </div>
            </div>

            {isStandalone ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-deep dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <Check className="w-3.5 h-3.5" aria-hidden="true" /> Installed
              </span>
            ) : (
              <button
                type="button"
                onClick={handleInstallApp}
                className="px-3.5 py-2 min-h-[44px] sm:min-h-[38px] rounded-lg bg-surface-bg border border-border-light hover:border-brand-green text-brand-green font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Install</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. STUDENT TOOLS & OPPORTUNITIES (4 Related Items) */}
      <div className="space-y-1.5">
        <span className="text-xs font-bold text-text-muted uppercase tracking-wider px-1">
          Student Tools &amp; Opportunities
        </span>
        <div className="rounded-2xl border border-border-light bg-surface-card divide-y divide-border-light/60 overflow-hidden shadow-2xs text-xs">
          {/* Submit Academic Material Action */}
          <button
            type="button"
            onClick={onOpenSubmit}
            className="w-full p-3.5 sm:p-4 flex items-center justify-between hover:bg-surface-bg/60 transition-colors group text-left cursor-pointer bg-emerald-50/40 dark:bg-emerald-950/20"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-brand-green text-white flex items-center justify-center shrink-0 shadow-2xs">
                <PlusCircle className="w-4 h-4" aria-hidden="true" />
              </div>
              <div>
                <span className="font-bold text-text-main group-hover:text-brand-green transition-colors block">
                  Submit Academic Material
                </span>
                <span className="text-xs text-text-muted">Upload missing past questions, lecture notes or tutorials</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-brand-green transition-transform group-hover:translate-x-0.5 shrink-0" aria-hidden="true" />
          </button>

          {/* CGPA Calculator */}
          <Link
            to="/cgpa-calculator"
            className="p-3.5 sm:p-4 flex items-center justify-between hover:bg-surface-bg/60 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-surface-bg text-brand-green flex items-center justify-center shrink-0 border border-border-light">
                <Calculator className="w-4 h-4" aria-hidden="true" />
              </div>
              <div>
                <span className="font-bold text-text-main group-hover:text-brand-green transition-colors block">
                  CGPA Calculator
                </span>
                <span className="text-xs text-text-muted">Compute semester GPA, running CGPA &amp; degree class</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-text-subtle group-hover:text-brand-green transition-transform group-hover:translate-x-0.5 shrink-0" aria-hidden="true" />
          </Link>

          {/* Opportunities & Scholarships */}
          <Link
            to="/opportunities"
            className="p-3.5 sm:p-4 flex items-center justify-between hover:bg-surface-bg/60 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-surface-bg text-amber-500 group-hover:text-brand-green flex items-center justify-center shrink-0 border border-border-light">
                <Sparkles className="w-4 h-4" aria-hidden="true" />
              </div>
              <div>
                <span className="font-bold text-text-main group-hover:text-brand-green transition-colors block">
                  Opportunities &amp; Scholarships
                </span>
                <span className="text-xs text-text-muted">Internships, research grants, and student funding</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-text-subtle group-hover:text-brand-green transition-transform group-hover:translate-x-0.5 shrink-0" aria-hidden="true" />
          </Link>

          {/* Student Enterprise Hub */}
          <Link
            to="/enterprise"
            className="p-3.5 sm:p-4 flex items-center justify-between hover:bg-surface-bg/60 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-surface-bg text-emerald-600 group-hover:text-brand-green flex items-center justify-center shrink-0 border border-border-light">
                <Briefcase className="w-4 h-4" aria-hidden="true" />
              </div>
              <div>
                <span className="font-bold text-text-main group-hover:text-brand-green transition-colors block">
                  Student Enterprise Hub
                </span>
                <span className="text-xs text-text-muted">Student-run businesses, consulting & freelance services</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-text-subtle group-hover:text-brand-green transition-transform group-hover:translate-x-0.5 shrink-0" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* 4. DEPARTMENT & SUPPORT (4 Related Items) */}
      <div className="space-y-1.5">
        <span className="text-xs font-bold text-text-muted uppercase tracking-wider px-1">
          Department &amp; Support
        </span>
        <div className="rounded-2xl border border-border-light bg-surface-card divide-y divide-border-light/60 overflow-hidden shadow-2xs text-xs">
          {/* Academic Staff & Lecturers Sheet Trigger */}
          <button
            type="button"
            onClick={() => setShowStaffModal(true)}
            className="w-full p-3.5 sm:p-4 flex items-center justify-between hover:bg-surface-bg/60 transition-colors group text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-surface-bg text-brand-green flex items-center justify-center shrink-0 border border-border-light">
                <GraduationCap className="w-4 h-4" aria-hidden="true" />
              </div>
              <div>
                <span className="font-bold text-text-main group-hover:text-brand-green transition-colors block">
                  Academic Staff &amp; Lecturers
                </span>
                <span className="text-xs text-text-muted">HOD, Professors, Staff Advisers &amp; Office hours</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-text-subtle group-hover:text-brand-green transition-transform group-hover:translate-x-0.5 shrink-0" aria-hidden="true" />
          </button>

          {/* ASSON Executive Council & Electorals Trigger */}
          <button
            type="button"
            onClick={() => setShowExecModal(true)}
            className="w-full p-3.5 sm:p-4 flex items-center justify-between hover:bg-surface-bg/60 transition-colors group text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-surface-bg text-brand-green flex items-center justify-center shrink-0 border border-border-light">
                <Award className="w-4 h-4" aria-hidden="true" />
              </div>
              <div>
                <span className="font-bold text-text-main group-hover:text-brand-green transition-colors block">
                  ASSON Executive Council &amp; Electorals
                </span>
                <span className="text-xs text-text-muted">Elected student leadership &amp; departmental exco</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-text-subtle group-hover:text-brand-green transition-transform group-hover:translate-x-0.5 shrink-0" aria-hidden="true" />
          </button>

          {/* Study Help & Support */}
          <Link
            to="/help"
            className="p-3.5 sm:p-4 flex items-center justify-between hover:bg-surface-bg/60 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-surface-bg text-teal-600 group-hover:text-brand-green flex items-center justify-center shrink-0 border border-border-light">
                <HelpCircle className="w-4 h-4" aria-hidden="true" />
              </div>
              <div>
                <span className="font-bold text-text-main group-hover:text-brand-green transition-colors block">
                  Study Help &amp; Support
                </span>
                <span className="text-xs text-text-muted">Advisers, department offices &amp; private feedback</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-text-subtle group-hover:text-brand-green transition-transform group-hover:translate-x-0.5 shrink-0" aria-hidden="true" />
          </Link>

          {/* Department Information Modal Trigger */}
          <button
            type="button"
            onClick={() => setShowDeptModal(true)}
            className="w-full p-3.5 sm:p-4 flex items-center justify-between hover:bg-surface-bg/60 transition-colors group text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-surface-bg text-brand-green flex items-center justify-center shrink-0 border border-border-light">
                <Building2 className="w-4 h-4" aria-hidden="true" />
              </div>
              <div>
                <span className="font-bold text-text-main group-hover:text-brand-green transition-colors block">
                  Department Information
                </span>
                <span className="text-xs text-text-muted">ASSON Secretariat, HOD &amp; Faculty details</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-text-subtle group-hover:text-brand-green transition-transform group-hover:translate-x-0.5 shrink-0" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* 5. HELP & LEGAL (4 Related Items) */}
      <div className="space-y-1.5">
        <span className="text-xs font-bold text-text-muted uppercase tracking-wider px-1">
          Help &amp; Legal
        </span>
        <div className="rounded-2xl border border-border-light bg-surface-card divide-y divide-border-light/60 overflow-hidden shadow-2xs text-xs">
          {/* Interactive Platform Tour Restart */}
          <button
            type="button"
            onClick={restartOnboarding}
            className="w-full p-3.5 sm:p-4 flex items-center justify-between hover:bg-surface-bg/60 transition-colors group text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-surface-bg text-brand-green flex items-center justify-center shrink-0 border border-border-light">
                <Compass className="w-4 h-4" aria-hidden="true" />
              </div>
              <div>
                <span className="font-bold text-text-main group-hover:text-brand-green transition-colors block">
                  Platform Guide &amp; Interactive Tour
                </span>
                <span className="text-xs text-text-muted">Replay the first-time walkthrough &amp; search guide</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-text-subtle group-hover:text-brand-green transition-transform group-hover:translate-x-0.5 shrink-0" aria-hidden="true" />
          </button>

          {/* FAQs */}
          <Link
            to="/faqs"
            className="p-3.5 sm:p-4 flex items-center justify-between hover:bg-surface-bg/60 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-surface-bg text-text-muted group-hover:text-brand-green flex items-center justify-center shrink-0 border border-border-light">
                <HelpCircle className="w-4 h-4" aria-hidden="true" />
              </div>
              <div>
                <span className="font-bold text-text-main group-hover:text-brand-green transition-colors block">
                  Frequently Asked Questions (FAQs)
                </span>
                <span className="text-xs text-text-muted">Portal rules, course materials &amp; downloads</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-text-subtle group-hover:text-brand-green transition-transform group-hover:translate-x-0.5 shrink-0" aria-hidden="true" />
          </Link>

          {/* Terms of Service */}
          <Link
            to="/terms"
            className="p-3.5 sm:p-4 flex items-center justify-between hover:bg-surface-bg/60 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-surface-bg text-text-muted group-hover:text-brand-green flex items-center justify-center shrink-0 border border-border-light">
                <FileText className="w-4 h-4" aria-hidden="true" />
              </div>
              <div>
                <span className="font-bold text-text-main group-hover:text-brand-green transition-colors block">
                  Terms of Service &amp; Honor Code
                </span>
                <span className="text-xs text-text-muted">Academic integrity and fair-use guidelines</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-text-subtle group-hover:text-brand-green transition-transform group-hover:translate-x-0.5 shrink-0" aria-hidden="true" />
          </Link>

          {/* Privacy Policy */}
          <Link
            to="/privacy"
            className="p-3.5 sm:p-4 flex items-center justify-between hover:bg-surface-bg/60 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-surface-bg text-text-muted group-hover:text-brand-green flex items-center justify-center shrink-0 border border-border-light">
                <Shield className="w-4 h-4" aria-hidden="true" />
              </div>
              <div>
                <span className="font-bold text-text-main group-hover:text-brand-green transition-colors block">
                  Privacy Policy &amp; NDPA
                </span>
                <span className="text-xs text-text-muted">Data protection and student privacy</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-text-subtle group-hover:text-brand-green transition-transform group-hover:translate-x-0.5 shrink-0" aria-hidden="true" />
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
                  <span className="text-xs text-text-muted">University of Ibadan</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDeptModal(false)}
                aria-label="Close Department Information"
                className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-surface-bg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
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

      {/* Staff Directory Modal */}
      <StaffDirectoryModal
        isOpen={showStaffModal}
        onClose={() => setShowStaffModal(false)}
      />

      {/* Executive Council Modal */}
      <ExecutiveCouncilModal
        isOpen={showExecModal}
        onClose={() => setShowExecModal(false)}
      />

      {/* Institutional Footer */}
      <div className="pt-2 text-center">
        <div className="text-xs text-text-subtle font-medium">
          ASSON UI • Department of Statistics<br />
          Faculty of Science, University of Ibadan
        </div>
      </div>
    </div>
  );
};
