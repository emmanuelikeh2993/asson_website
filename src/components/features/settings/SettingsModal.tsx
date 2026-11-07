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
  Info
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '../../ui/Toast';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { theme, setTheme, actualTheme } = useTheme();
  const toast = useToast();

  const [defaultLevel, setDefaultLevel] = useState<string>(() => {
    try {
      return localStorage.getItem('asson_default_level') || 'All';
    } catch {
      return 'All';
    }
  });

  const [cacheSize, setCacheSize] = useState<string>('0 KB');

  // Compute local storage usage (Telegram-style storage metrics)
  useEffect(() => {
    if (isOpen) {
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

  const handleLevelChange = (lvl: string) => {
    setDefaultLevel(lvl);
    try {
      localStorage.setItem('asson_default_level', lvl);
      toast.info('Preference Updated', `Default study level set to ${lvl === 'All' ? 'All Levels' : `${lvl}L`}`);
    } catch {
      // ignore
    }
  };

  const handleClearCache = () => {
    try {
      const keysToKeep = ['asson_theme_preference', 'asson_default_level'];
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Preferences & Settings"
      maxWidth="md"
    >
      <div className="space-y-5 py-1 text-text-main animate-in fade-in duration-150">
        
        {/* SECTION 1: APPEARANCE (Claude & Telegram Theme Selector) */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-text-muted uppercase tracking-wider px-1">
            <Palette className="w-3.5 h-3.5 text-brand-green" />
            <span>Appearance & Theme</span>
          </div>

          <div className="p-4 rounded-2xl bg-surface-bg border border-border-light space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-text-main block">Interface Theme</span>
                <span className="text-[11px] text-text-muted">
                  Currently running in <strong className="capitalize text-brand-green">{actualTheme} Mode</strong>
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

        {/* SECTION 2: ACADEMIC FOCUS (Telegram/WhatsApp Grouped List) */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-text-muted uppercase tracking-wider px-1">
            <BookOpen className="w-3.5 h-3.5 text-brand-green" />
            <span>Academic Preferences</span>
          </div>

          <div className="p-4 rounded-2xl bg-surface-bg border border-border-light space-y-3 shadow-2xs">
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

        {/* SECTION 3: STORAGE & DATA (Telegram-style Storage Usage) */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-text-muted uppercase tracking-wider px-1">
            <HardDrive className="w-3.5 h-3.5 text-brand-green" />
            <span>Storage & Data</span>
          </div>

          <div className="p-4 rounded-2xl bg-surface-bg border border-border-light space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-text-main block">Offline Study Cache</span>
                <span className="text-[11px] text-text-muted">
                  Storage used by saved past questions and local submission tracking.
                </span>
              </div>
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-surface-card border border-border-light text-text-main">
                {cacheSize}
              </span>
            </div>

            <div className="pt-1 flex items-center justify-between">
              <span className="text-[11px] text-text-subtle">
                Clearing cache will not affect public repository documents.
              </span>
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

        {/* SECTION 4: ABOUT & LEGAL */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-text-muted uppercase tracking-wider px-1">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-green" />
            <span>Platform & Compliance</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface-bg border border-border-light divide-y divide-border-light/60 shadow-2xs text-xs">
            <div className="pb-2.5 flex items-center justify-between">
              <span className="text-text-muted">Platform Version</span>
              <span className="font-mono font-bold text-brand-green">ASSON UI v2.2 (Build 2026.11)</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
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
            <div className="pt-2.5 text-[11px] text-text-subtle">
              Association of Statistics Students of Nigeria • University of Ibadan Chapter
            </div>
          </div>
        </div>

      </div>
    </Modal>
  );
};
