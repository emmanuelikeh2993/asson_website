import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

export const InstallPwaPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already in standalone PWA mode
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as NavigatorWithStandalone).standalone
    ) {
      setIsInstalled(true);
      return;
    }

    // Check if dismissed recently (within 7 days)
    const dismissedTime = localStorage.getItem('asson_pwa_dismissed');
    if (dismissedTime && Date.now() - Number(dismissedTime) < 7 * 24 * 60 * 60 * 1000) {
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('asson_pwa_dismissed', Date.now().toString());
  };

  if (!showPrompt || isInstalled) return null;

  return (
    <div className="w-full max-w-full overflow-hidden bg-emerald-900 text-white px-3 sm:px-6 py-2.5 shadow-md border-b border-emerald-700/50 flex items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-emerald-200 shrink-0">
          <Smartphone className="w-4 h-4" aria-hidden="true" />
        </div>
        <p className="truncate font-medium text-emerald-50 text-xs">
          <strong className="text-white font-bold">Install ASSON UI App:</strong> Access past questions &amp; notes offline on your phone
        </p>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <Button
          size="sm"
          onClick={handleInstall}
          className="bg-white text-brand-deep hover:bg-emerald-50 text-xs min-h-[44px] sm:min-h-[36px] px-3 font-bold rounded-lg shadow-xs"
        >
          <Download className="w-3.5 h-3.5 mr-1" aria-hidden="true" /> Install App
        </Button>
        <button
          type="button"
          onClick={handleDismiss}
          className="min-w-[44px] min-h-[44px] sm:min-w-[36px] sm:min-h-[36px] -mr-1 flex items-center justify-center rounded-lg text-emerald-200 hover:text-white transition-colors cursor-pointer"
          title="Dismiss"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

