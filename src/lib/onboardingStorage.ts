export type OnboardingStatus = 'completed' | 'skipped';

export const ONBOARDING_STORAGE_KEY = 'asson_ui_onboarding_v1';
const ONBOARDING_COOKIE_NAME = 'asson_ui_onboarding';

interface StoredOnboardingState {
  status: OnboardingStatus;
  updatedAt: number;
}

const EXCLUDED_BOOT_PATHS = ['/executive', '/console', '/admin'];

function readCookieFallback(): OnboardingStatus | null {
  if (typeof document === 'undefined') return null;
  try {
    const cookies = document.cookie.split(';');
    for (const raw of cookies) {
      const [name, val] = raw.trim().split('=');
      if (name === ONBOARDING_COOKIE_NAME) {
        if (val === 'completed' || val === 'skipped') return val;
      }
    }
  } catch {
    // ignore cookie errors in restricted contexts
  }
  return null;
}

function writeCookieFallback(status: OnboardingStatus): void {
  if (typeof document === 'undefined') return;
  try {
    const oneYearSeconds = 60 * 60 * 24 * 365;
    document.cookie = `${ONBOARDING_COOKIE_NAME}=${status}; Max-Age=${oneYearSeconds}; Path=/; SameSite=Lax`;
  } catch {
    // ignore
  }
}

/**
 * Safely retrieves the browser-specific onboarding state.
 * Uses localStorage as primary source of truth, falling back to a SameSite=Lax cookie
 * only if localStorage throws (e.g., strict private-mode restrictions).
 */
export function getOnboardingStatus(): OnboardingStatus | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredOnboardingState>;
    if (parsed && (parsed.status === 'completed' || parsed.status === 'skipped')) {
      return parsed.status;
    }
    return null;
  } catch {
    return readCookieFallback();
  }
}

/**
 * Persists the onboarding completion or skip status safely in browser storage.
 */
export function saveOnboardingStatus(status: OnboardingStatus): void {
  if (typeof window === 'undefined') return;
  const payload: StoredOnboardingState = {
    status,
    updatedAt: Date.now(),
  };
  try {
    window.localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    writeCookieFallback(status);
  }
}

/**
 * Clears stored onboarding state (useful for explicit tour restarts or testing).
 */
export function clearOnboardingStatus(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(ONBOARDING_STORAGE_KEY);
  } catch {
    // ignore
  }
  if (typeof document !== 'undefined') {
    try {
      document.cookie = `${ONBOARDING_COOKIE_NAME}=; Max-Age=0; Path=/; SameSite=Lax`;
    } catch {
      // ignore
    }
  }
}

/**
 * Evaluates synchronously before initial render whether the first-visit onboarding
 * should appear, preventing any brief flash of the main application.
 */
export function shouldShowOnboardingOnBoot(pathname: string = '/'): boolean {
  const normalized = pathname.toLowerCase();
  if (EXCLUDED_BOOT_PATHS.some((prefix) => normalized.startsWith(prefix))) {
    return false;
  }
  return getOnboardingStatus() === null;
}
