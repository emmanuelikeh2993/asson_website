import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

/**
 * Displays a calm, high-contrast status banner when the browser loses network connectivity,
 * letting students know cached content remains available and giving a 1-tap retry path.
 */
export const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = async () => {
    setIsChecking(true);
    try {
      const res = await fetch('/manifest.json', { cache: 'no-store' });
      if (res.ok || navigator.onLine) {
        setIsOffline(false);
      }
    } catch {
      setIsOffline(!navigator.onLine);
    } finally {
      setIsChecking(false);
    }
  };

  if (!isOffline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="w-full bg-amber-900 text-amber-50 border-b border-amber-700 px-3 sm:px-6 py-2 text-xs"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <WifiOff className="w-4 h-4 text-amber-200 shrink-0" aria-hidden="true" />
          <p className="truncate font-medium">
            <strong className="font-bold text-white">Offline mode:</strong> Showing cached content where available.
          </p>
        </div>
        <button
          type="button"
          onClick={handleRetry}
          disabled={isChecking}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[44px] sm:min-h-[36px] rounded-lg bg-amber-800 hover:bg-amber-700 text-white font-bold text-xs transition-colors shrink-0 cursor-pointer disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} aria-hidden="true" />
          <span>{isChecking ? 'Checking...' : 'Retry'}</span>
        </button>
      </div>
    </div>
  );
};
