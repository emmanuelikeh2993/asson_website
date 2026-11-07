import React, { useState, useEffect } from 'react';
import { Modal } from '../../ui/Modal';
import { useTheme, Theme } from '../../../context/ThemeContext';
import { 
  Sun, 
  Moon, 
  Monitor, 
  Palette, 
  BookOpen, 
  HardDrive, 
  ShieldCheck, 
  Trash2, 
  Check, 
  Sparkles,
  ExternalLink,
  Smartphone,
  Download,
  Wifi,
  User,
  LogOut,
  Info
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '../../ui/Toast';
import { getCachedStudentProfile, studentSignOut } from '../../../lib/supabase';
import { UserProfile } from '../../../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onOpenAuth }) => {
  const { theme, setTheme, actualTheme } = useTheme();
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
    return window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
  });

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [cacheSize, setCacheSize] = useState<string>('0 KB');

  useEffect(() => {
    if (isOpen) {
      setProfile(getCachedStudentProfile());

      // Check standalone mode
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);

      // Compute local storage usage (Telegram-style storage metrics)
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
        setCacheSize('12.4 KB');
      }
    }
  }, [isOpen]);

  useEffect(() => {
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
      toast.info('Preference Updated', `Default study level set to ${lvl === 'All' ? 'All Levels' : `${lvl}L`}`);
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
      // Explain manual installation for iOS or browsers without prompt
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      if (isIOS) {
        alert("To install on iOS / Safari:\n1. Tap the Share button at the bottom of Safari.\n2. Scroll down and tap 'Add to Home Screen'.\n3. Tap 'Add' to launch ASSON UI as a full screen app.");
      } else {
        alert("To install ASSON UI as a full screen app:\n1. Tap your browser's menu (3 dots at top or bottom).\n2. Tap 'Install App' or 'Add to Home screen'.\n3. Launch ASSON UI directly from your home screen without browser bars.");
      }
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

  const handleSignOut = async () => {
    await studentSignOut();
    setProfile(null);
    toast.info('Signed Out', 'Your study locker session has ended on this device.');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Preferences & Settings"
      maxWidth="md"
    >
      <div className="space-y-4 py-1 text-text-main animate-in fade-in duration-150">
        
        {/* SECTION 1: APPEARANCE (Claude & Telegram Theme Selector) */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-text-muted uppercase tracking-wider px-1">
            <Palette className="w-3.5 h-3.5 text-brand-green" />
            <span>Appearance & Theme</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface-bg border border-border-light space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-text-main block">Interface Theme</span>
                <span className="text-[11px] text-text-muted">
                  Active mode: <strong className="capitalize text-brand-green">{actualTheme} Mode</strong>
                </span>
              </div>
            </div>

            {/* Segmented Pill Selector (Inspired by Claude app settings) */}
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-surface-card border border-border-light">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'bg-brand-green text-white shadow-xs'
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Light</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-brand-green text-white shadow-xs'
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Dark</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('system')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  theme === 'system'
                    ? 'bg-brand-green text-white shadow-xs'
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>System</span>
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 2: FULL SCREEN APP EXPERIENCE (PWA) */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-text-muted uppercase tracking-wider px-1">
            <Smartphone className="w-3.5 h-3.5 text-brand-green" />
            <span>Mobile & Desktop App</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface-bg border border-border-light space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-text-main block">Full Screen App Mode</span>
                <span className="text-[11px] text-text-muted">
                  {isStandalone 
                    ? 'Running as a standalone app with no browser address bar' 
                    : 'Install to your home screen for full-screen native app experience'}
                </span>
              </div>
              {isStandalone ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-brand-green text-[11px] font-bold border border-emerald-300 dark:border-emerald-800">
                  <Check className="w-3.5 h-3.5" /> Installed
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleInstallApp}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-green text-white hover:bg-brand-deep text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95 shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Install App</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3: ACADEMIC FOCUS (Telegram/WhatsApp Grouped List) */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-text-muted uppercase tracking-wider px-1">
            <BookOpen className="w-3.5 h-3.5 text-brand-green" />
            <span>Academic Preferences</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface-bg border border-border-light space-y-2.5 shadow-2xs">
            <div>
              <span className="text-xs font-bold text-text-main block">Default Level Filter</span>
              <span className="text-[11px] text-text-muted">
                Pre-selects your academic year whenever you browse the library.
              </span>
            </div>

            <div className="flex items-center flex-wrap gap-1.5 pt-1">
              {['All', '100', '200', '300', '400', 'Postgraduate'].map((lvl) => {
                const isSelected = defaultLevel === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => handleLevelChange(lvl)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-brand-deep text-white shadow-xs font-bold scale-105'
                        : 'bg-surface-card text-text-muted hover:text-text-main border border-border-light'
                    }`}
                  >
                    {lvl === 'All' ? 'All Levels' : lvl === 'Postgraduate' ? 'Postgraduate' : `${lvl} Level`}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* SECTION 4: DATA & STORAGE (WhatsApp-style Storage & Data) */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-text-muted uppercase tracking-wider px-1">
            <HardDrive className="w-3.5 h-3.5 text-brand-green" />
            <span>Storage & Campus Data</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface-bg border border-border-light space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-text-main block">Data Saver Mode</span>
                <span className="text-[11px] text-text-muted">
                  Optimize loading speed and save mobile data on UI campus networks
                </span>
              </div>
              <button
                type="button"
                onClick={handleToggleDataSaver}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  dataSaver ? 'bg-brand-green' : 'bg-border-light'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    dataSaver ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="pt-2 border-t border-border-light/60 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-text-main block">Offline Past Papers Cache</span>
                <span className="text-[11px] text-text-muted">
                  Stored size: <strong className="font-mono text-text-main">{cacheSize}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={handleClearCache}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-brand-red hover:bg-red-500/10 transition-colors border border-brand-red/30 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Cache</span>
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 5: STUDENT STUDY LOCKER (Spotify / WhatsApp Quiet Identity) */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-text-muted uppercase tracking-wider px-1">
            <User className="w-3.5 h-3.5 text-brand-green" />
            <span>Study Locker Account</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface-bg border border-border-light space-y-2 shadow-2xs text-xs">
            {profile ? (
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-text-main block">{profile.displayName}</span>
                  <span className="text-[11px] text-text-muted">{profile.email} • {profile.level}L Statistics</span>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border-light hover:bg-red-50 dark:hover:bg-red-950/40 text-text-muted hover:text-brand-red font-semibold transition-colors cursor-pointer text-[11px]"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-text-main block">Guest Student</span>
                  <span className="text-[11px] text-text-muted">Sign in to sync your bookmarks across phone and laptop.</span>
                </div>
                {onOpenAuth && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAuth();
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface-card border border-border-light hover:border-brand-green font-bold text-text-main hover:text-brand-green shadow-2xs transition-all cursor-pointer text-xs"
                  >
                    <span>Sign In</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* SECTION 6: PLATFORM & COMPLIANCE */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-text-muted uppercase tracking-wider px-1">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-green" />
            <span>Platform & Compliance</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface-bg border border-border-light divide-y divide-border-light/60 shadow-2xs text-xs">
            <div className="pb-2 flex items-center justify-between">
              <span className="text-text-muted">Platform Build</span>
              <span className="font-mono font-bold text-brand-green">ASSON UI v2.2 (Build 2026.11)</span>
            </div>
            <div className="py-2 flex items-center justify-between">
              <Link 
                to="/terms" 
                onClick={onClose}
                className="text-text-main font-semibold hover:text-brand-green inline-flex items-center gap-1"
              >
                Terms of Academic Contribution <ExternalLink className="w-3 h-3 text-text-muted" />
              </Link>
              <Link 
                to="/privacy" 
                onClick={onClose}
                className="text-text-main font-semibold hover:text-brand-green inline-flex items-center gap-1"
              >
                Student Privacy Policy <ExternalLink className="w-3 h-3 text-text-muted" />
              </Link>
            </div>
            <div className="pt-2 text-[11px] text-text-subtle">
              Department of Statistics • Faculty of Science • University of Ibadan
            </div>
          </div>
        </div>

      </div>
    </Modal>
  );
};
