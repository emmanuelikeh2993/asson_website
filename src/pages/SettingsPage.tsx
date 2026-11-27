import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  User,
  Bookmark,
  SunMoon,
  GraduationCap,
  Zap,
  HardDrive,
  Smartphone,
  Compass,
  HelpCircle,
  MessageSquare,
  FileText,
  Shield,
  Check,
  LogOut,
  LogIn,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useOnboarding } from '../context/OnboardingContext';
import { useToast } from '../components/ui/Toast';
import { getCachedStudentProfile, studentSignOut } from '../lib/supabase';
import { UserProfile } from '../types';
import {
  DefaultLevelPreference,
  getDataSaverPreference,
  getDefaultLevelPreference,
  getLocalStorageUsageLabel,
  setDataSaverPreference,
  setDefaultLevelPreference,
  clearNonEssentialCache,
  isStandaloneDisplay,
} from '../lib/preferences';

interface SettingsPageProps {
  onOpenAuth: () => void;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface WindowWithMSStream extends Window {
  MSStream?: unknown;
}

const THEME_OPTIONS: {
  id: 'light' | 'dark' | 'system';
  label: string;
  hint?: string;
}[] = [
  { id: 'light', label: 'Light Mode' },
  { id: 'dark', label: 'Dark Mode' },
  { id: 'system', label: 'System Default', hint: 'This will follow your device appearance settings' },
];

const LEVEL_OPTIONS: {
  id: DefaultLevelPreference;
  label: string;
  hint?: string;
}[] = [
  { id: 'All', label: 'All Levels', hint: 'Show 100L to 400L across the library' },
  { id: '100', label: '100 Level' },
  { id: '200', label: '200 Level' },
  { id: '300', label: '300 Level' },
  { id: '400', label: '400 Level' },
];

export const SettingsPage: React.FC<SettingsPageProps> = ({ onOpenAuth }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const activePanel = searchParams.get('panel'); // null | 'theme' | 'level'

  const { theme, setTheme } = useTheme();
  const { restartOnboarding } = useOnboarding();
  const toast = useToast();

  const [profile, setProfile] = useState<UserProfile | null>(() => getCachedStudentProfile());
  const [defaultLevel, setDefaultLevel] = useState<DefaultLevelPreference>(() => getDefaultLevelPreference());
  const [dataSaver, setDataSaver] = useState<boolean>(() => getDataSaverPreference());
  const [cacheSize, setCacheSize] = useState<string>(() => getLocalStorageUsageLabel());
  const [isStandalone, setIsStandalone] = useState<boolean>(() => isStandaloneDisplay());
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    setProfile(getCachedStudentProfile());
    setCacheSize(getLocalStorageUsageLabel());

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleToggleDataSaver = () => {
    const next = !dataSaver;
    setDataSaver(next);
    setDataSaverPreference(next);
    toast.info(
      next ? 'Data Saver Enabled' : 'Data Saver Disabled',
      next ? 'Optimized for low bandwidth on campus networks.' : 'Standard quality restored.'
    );
  };

  const handleClearCache = () => {
    clearNonEssentialCache();
    setCacheSize('0.1 KB');
    toast.success('Cache Cleared', 'Temporary cached data cleared; your saved CGPA & bookmarks are intact.');
  };

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsStandalone(true);
        toast.success('App Installed', 'ASSON UI is ready as a standalone app.');
      }
      setDeferredPrompt(null);
      return;
    }

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as WindowWithMSStream).MSStream;
    toast.info(
      'Install ASSON UI',
      isIOS
        ? 'Tap Safari Share and choose "Add to Home Screen".'
        : 'Open your browser menu and select "Install App" or "Add to Home Screen".'
    );
  };

  const handleSignOut = async () => {
    await studentSignOut();
    setProfile(null);
    toast.info('Signed Out', 'Study Locker session cleared from this browser.');
    navigate('/more');
  };

  // Sub-panel: Themes (clean grouped radio list)
  if (activePanel === 'theme') {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-5 sm:py-8 space-y-5 pb-24">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSearchParams({})}
            aria-label="Back to Settings"
            className="min-w-[44px] min-h-[44px] -ml-2 flex items-center justify-center rounded-xl text-text-main hover:bg-surface-card transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" aria-hidden="true" />
          </button>
          <h1 className="text-lg sm:text-xl font-extrabold text-text-main tracking-tight">
            Themes
          </h1>
        </div>

        <div className="space-y-3" role="radiogroup" aria-label="Theme preference">
          {THEME_OPTIONS.map((opt) => {
            const selected = theme === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setTheme(opt.id)}
                className={`w-full text-left px-4 py-4 min-h-[56px] rounded-2xl bg-surface-card flex items-center justify-between gap-3 transition-all cursor-pointer ${
                  selected
                    ? 'border-2 border-brand-green shadow-2xs'
                    : 'border border-border-light/70 hover:border-border-hover'
                }`}
              >
                <div>
                  <span className="text-sm font-bold text-text-main block">
                    {opt.label}
                  </span>
                  {opt.hint && (
                    <span className="text-xs text-text-muted mt-0.5 block">
                      {opt.hint}
                    </span>
                  )}
                </div>

                <span
                  aria-hidden="true"
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    selected
                      ? 'bg-brand-green text-white'
                      : 'border-2 border-border-hover bg-transparent'
                  }`}
                >
                  {selected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Sub-panel: Default Academic Level Focus
  if (activePanel === 'level') {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-5 sm:py-8 space-y-5 pb-24">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSearchParams({})}
            aria-label="Back to Settings"
            className="min-w-[44px] min-h-[44px] -ml-2 flex items-center justify-center rounded-xl text-text-main hover:bg-surface-card transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" aria-hidden="true" />
          </button>
          <h1 className="text-lg sm:text-xl font-extrabold text-text-main tracking-tight">
            Default Academic Level
          </h1>
        </div>

        <div className="space-y-3" role="radiogroup" aria-label="Default Academic Level">
          {LEVEL_OPTIONS.map((opt) => {
            const selected = defaultLevel === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => {
                  setDefaultLevel(opt.id);
                  setDefaultLevelPreference(opt.id);
                  toast.info(
                    'Preference Updated',
                    `Default level filter set to ${opt.id === 'All' ? 'All Levels' : `${opt.id} Level`}.`
                  );
                }}
                className={`w-full text-left px-4 py-4 min-h-[56px] rounded-2xl bg-surface-card flex items-center justify-between gap-3 transition-all cursor-pointer ${
                  selected
                    ? 'border-2 border-brand-green shadow-2xs'
                    : 'border border-border-light/70 hover:border-border-hover'
                }`}
              >
                <div>
                  <span className="text-sm font-bold text-text-main block">
                    {opt.label}
                  </span>
                  {opt.hint && (
                    <span className="text-xs text-text-muted mt-0.5 block">
                      {opt.hint}
                    </span>
                  )}
                </div>

                <span
                  aria-hidden="true"
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    selected
                      ? 'bg-brand-green text-white'
                      : 'border-2 border-border-hover bg-transparent'
                  }`}
                >
                  {selected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const themeLabel = theme === 'light' ? 'Light' : theme === 'dark' ? 'Dark' : 'System';
  const levelLabel = defaultLevel === 'All' ? 'All Levels' : `${defaultLevel}L`;

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-5 sm:py-8 space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-2 pb-1">
        <Link
          to="/more"
          aria-label="Back to Menu"
          className="min-w-[44px] min-h-[44px] -ml-2 flex items-center justify-center rounded-xl text-text-main hover:bg-surface-card transition-colors"
        >
          <ChevronLeft className="w-5 h-5" aria-hidden="true" />
        </Link>
        <h1 className="text-lg sm:text-xl font-extrabold text-text-main tracking-tight">
          Settings
        </h1>
      </div>

      {/* Group 1: Account */}
      <div className="rounded-2xl bg-surface-card border border-border-light/70 divide-y divide-border-light/50 overflow-hidden">
        <Link
          to="/profile"
          className="px-4 py-3.5 min-h-[52px] flex items-center justify-between gap-3 hover:bg-surface-bg/60 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <User className="w-4 h-4 text-brand-green shrink-0" aria-hidden="true" />
            <span className="text-sm font-semibold text-text-main">My Profile</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-text-muted shrink-0">
            <span className="truncate max-w-[140px]">
              {profile ? profile.displayName : 'Guest'}
            </span>
            <ChevronRight className="w-4 h-4 text-text-subtle" aria-hidden="true" />
          </div>
        </Link>

        <Link
          to="/dashboard"
          className="px-4 py-3.5 min-h-[52px] flex items-center justify-between gap-3 hover:bg-surface-bg/60 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <Bookmark className="w-4 h-4 text-brand-green shrink-0" aria-hidden="true" />
            <span className="text-sm font-semibold text-text-main">Study Locker</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-text-muted shrink-0">
            <span>Saved &amp; Downloads</span>
            <ChevronRight className="w-4 h-4 text-text-subtle" aria-hidden="true" />
          </div>
        </Link>
      </div>

      {/* Group 2: Display & Bandwidth Preferences */}
      <div className="rounded-2xl bg-surface-card border border-border-light/70 divide-y divide-border-light/50 overflow-hidden">
        <button
          type="button"
          onClick={() => setSearchParams({ panel: 'theme' })}
          className="w-full px-4 py-3.5 min-h-[52px] flex items-center justify-between gap-3 hover:bg-surface-bg/60 transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <SunMoon className="w-4 h-4 text-brand-green shrink-0" aria-hidden="true" />
            <span className="text-sm font-semibold text-text-main">Themes</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-text-muted shrink-0">
            <span>{themeLabel}</span>
            <ChevronRight className="w-4 h-4 text-text-subtle" aria-hidden="true" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => setSearchParams({ panel: 'level' })}
          className="w-full px-4 py-3.5 min-h-[52px] flex items-center justify-between gap-3 hover:bg-surface-bg/60 transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <GraduationCap className="w-4 h-4 text-brand-green shrink-0" aria-hidden="true" />
            <span className="text-sm font-semibold text-text-main">Academic Level Focus</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-text-muted shrink-0">
            <span>{levelLabel}</span>
            <ChevronRight className="w-4 h-4 text-text-subtle" aria-hidden="true" />
          </div>
        </button>

        <div className="px-4 py-2.5 min-h-[52px] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Zap className="w-4 h-4 text-brand-green shrink-0" aria-hidden="true" />
            <span className="text-sm font-semibold text-text-main">Campus Data Saver</span>
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
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                  dataSaver ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleClearCache}
          className="w-full px-4 py-3.5 min-h-[52px] flex items-center justify-between gap-3 hover:bg-surface-bg/60 transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <HardDrive className="w-4 h-4 text-brand-green shrink-0" aria-hidden="true" />
            <span className="text-sm font-semibold text-text-main">Clear Temporary Cache</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-text-muted shrink-0">
            <span className="font-mono">{cacheSize}</span>
            <ChevronRight className="w-4 h-4 text-text-subtle" aria-hidden="true" />
          </div>
        </button>

        {!isStandalone && (
          <button
            type="button"
            onClick={handleInstallApp}
            className="w-full px-4 py-3.5 min-h-[52px] flex items-center justify-between gap-3 hover:bg-surface-bg/60 transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-3">
              <Smartphone className="w-4 h-4 text-brand-green shrink-0" aria-hidden="true" />
              <span className="text-sm font-semibold text-text-main">Install Web App</span>
            </div>
            <ChevronRight className="w-4 h-4 text-text-subtle shrink-0" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Group 3: Support & Legal */}
      <div className="rounded-2xl bg-surface-card border border-border-light/70 divide-y divide-border-light/50 overflow-hidden">
        <button
          type="button"
          onClick={restartOnboarding}
          className="w-full px-4 py-3.5 min-h-[52px] flex items-center justify-between gap-3 hover:bg-surface-bg/60 transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <Compass className="w-4 h-4 text-brand-green shrink-0" aria-hidden="true" />
            <span className="text-sm font-semibold text-text-main">Platform Guide &amp; Tour</span>
          </div>
          <ChevronRight className="w-4 h-4 text-text-subtle shrink-0" aria-hidden="true" />
        </button>

        <Link
          to="/help"
          className="px-4 py-3.5 min-h-[52px] flex items-center justify-between gap-3 hover:bg-surface-bg/60 transition-colors"
        >
          <div className="flex items-center gap-3">
            <MessageSquare className="w-4 h-4 text-brand-green shrink-0" aria-hidden="true" />
            <span className="text-sm font-semibold text-text-main">Feedback &amp; Study Help</span>
          </div>
          <ChevronRight className="w-4 h-4 text-text-subtle shrink-0" aria-hidden="true" />
        </Link>

        <Link
          to="/faqs"
          className="px-4 py-3.5 min-h-[52px] flex items-center justify-between gap-3 hover:bg-surface-bg/60 transition-colors"
        >
          <div className="flex items-center gap-3">
            <HelpCircle className="w-4 h-4 text-brand-green shrink-0" aria-hidden="true" />
            <span className="text-sm font-semibold text-text-main">Frequently Asked Questions</span>
          </div>
          <ChevronRight className="w-4 h-4 text-text-subtle shrink-0" aria-hidden="true" />
        </Link>

        <Link
          to="/terms"
          className="px-4 py-3.5 min-h-[52px] flex items-center justify-between gap-3 hover:bg-surface-bg/60 transition-colors"
        >
          <div className="flex items-center gap-3">
            <FileText className="w-4 h-4 text-brand-green shrink-0" aria-hidden="true" />
            <span className="text-sm font-semibold text-text-main">Terms &amp; Submission Guide</span>
          </div>
          <ChevronRight className="w-4 h-4 text-text-subtle shrink-0" aria-hidden="true" />
        </Link>

        <Link
          to="/privacy"
          className="px-4 py-3.5 min-h-[52px] flex items-center justify-between gap-3 hover:bg-surface-bg/60 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Shield className="w-4 h-4 text-brand-green shrink-0" aria-hidden="true" />
            <span className="text-sm font-semibold text-text-main">Privacy Policy &amp; NDPA</span>
          </div>
          <ChevronRight className="w-4 h-4 text-text-subtle shrink-0" aria-hidden="true" />
        </Link>
      </div>

      {/* Bottom Standalone Sign In / Sign Out Card */}
      {profile ? (
        <button
          type="button"
          onClick={handleSignOut}
          className="w-full min-h-[52px] rounded-2xl bg-surface-card border border-border-light/70 px-4 py-3.5 flex items-center justify-center gap-2 text-sm font-bold text-brand-red hover:bg-red-50/40 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" aria-hidden="true" />
          <span>Sign Out</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={onOpenAuth}
          className="w-full min-h-[52px] rounded-2xl bg-surface-card border border-border-light/70 px-4 py-3.5 flex items-center justify-center gap-2 text-sm font-bold text-brand-green hover:bg-brand-light/40 transition-colors cursor-pointer"
        >
          <LogIn className="w-4 h-4" aria-hidden="true" />
          <span>Sign In to Sync Study Locker</span>
        </button>
      )}
    </div>
  );
};
