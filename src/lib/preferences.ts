export const PREF_DEFAULT_LEVEL_KEY = 'asson_default_level';
export const PREF_DATA_SAVER_KEY = 'asson_data_saver';

export type DefaultLevelPreference = '100' | '200' | '300' | '400' | 'All';

const VALID_LEVELS = new Set<string>(['100', '200', '300', '400', 'All']);

export function getDefaultLevelPreference(): DefaultLevelPreference {
  try {
    const saved = localStorage.getItem(PREF_DEFAULT_LEVEL_KEY);
    if (saved && VALID_LEVELS.has(saved)) {
      return saved as DefaultLevelPreference;
    }
  } catch {
    // ignore storage errors
  }
  return 'All';
}

export function setDefaultLevelPreference(level: DefaultLevelPreference): void {
  try {
    localStorage.setItem(PREF_DEFAULT_LEVEL_KEY, level);
  } catch {
    // ignore storage errors
  }
}

export function getDataSaverPreference(): boolean {
  try {
    return localStorage.getItem(PREF_DATA_SAVER_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setDataSaverPreference(enabled: boolean): void {
  try {
    localStorage.setItem(PREF_DATA_SAVER_KEY, enabled ? 'true' : 'false');
  } catch {
    // ignore storage errors
  }
}

export function getLocalStorageUsageLabel(): string {
  try {
    let total = 0;
    for (const key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
        total += (localStorage[key].length + key.length) * 2;
      }
    }
    if (total < 1024) return `${total} B`;
    if (total < 1024 * 1024) return `${(total / 1024).toFixed(1)} KB`;
    return `${(total / (1024 * 1024)).toFixed(1)} MB`;
  } catch {
    return '0.8 KB';
  }
}

export function clearNonEssentialCache(): void {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('asson_cached_') || k === 'asson_recent_searches')) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch {
    // ignore storage errors
  }
}

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

export function isStandaloneDisplay(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as NavigatorWithStandalone).standalone === true
  );
}
