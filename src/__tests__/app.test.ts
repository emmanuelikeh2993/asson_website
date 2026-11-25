import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { formatFileSize, formatDate } from '../lib/utils';
import { mapDbCalendarEventToModel } from '../lib/supabase';
import {
  getOnboardingStatus,
  saveOnboardingStatus,
  clearOnboardingStatus,
  shouldShowOnboardingOnBoot,
  ONBOARDING_STORAGE_KEY,
} from '../lib/onboardingStorage';

describe('Format Utilities', () => {
  it('formats file sizes accurately for student bandwidth awareness', () => {
    expect(formatFileSize(500)).toBe('500 Bytes');
    expect(formatFileSize(1024 * 500)).toBe('500 KB');
    expect(formatFileSize(1024 * 1024 * 3.5)).toBe('3.5 MB');
  });

  it('formats dates consistently', () => {
    expect(formatDate('2026-11-15')).toContain('Nov');
  });
});

describe('Calendar Event DB Mapping', () => {
  it('maps academic calendar records faithfully', () => {
    const raw = {
      id: 'cal-1',
      title: 'STA 311 First Test',
      category: 'Continuous Assessment',
      start_date: '2026-11-20',
      end_date: null,
      target_level: '300',
      venue: 'Department LLT',
      is_confirmed: true,
      description: 'Mid-term test covering Chapters 1-4'
    };

    const model = mapDbCalendarEventToModel(raw);
    expect(model.id).toBe('cal-1');
    expect(model.title).toBe('STA 311 First Test');
    expect(model.targetLevel).toBe('300');
    expect(model.isConfirmed).toBe(true);
    expect(model.venue).toBe('Department LLT');
  });
});

describe('Onboarding Browser Persistence', () => {
  const store: Record<string, string> = {};
  const originalWindow = globalThis.window;

  beforeEach(() => {
    for (const k of Object.keys(store)) delete store[k];
    (globalThis as any).window = {
      localStorage: {
        getItem: (k: string) => (k in store ? store[k] : null),
        setItem: (k: string, v: string) => {
          store[k] = String(v);
        },
        removeItem: (k: string) => {
          delete store[k];
        },
      },
    };
  });

  afterEach(() => {
    (globalThis as any).window = originalWindow;
  });

  it('shows onboarding on first visit and persists completion and skip status', () => {
    expect(getOnboardingStatus()).toBeNull();
    expect(shouldShowOnboardingOnBoot('/')).toBe(true);
    expect(shouldShowOnboardingOnBoot('/resources')).toBe(true);

    // Console/admin routes are excluded
    expect(shouldShowOnboardingOnBoot('/console')).toBe(false);
    expect(shouldShowOnboardingOnBoot('/admin')).toBe(false);

    // Completing persists across subsequent checks
    saveOnboardingStatus('completed');
    expect(getOnboardingStatus()).toBe('completed');
    expect(shouldShowOnboardingOnBoot('/')).toBe(false);

    // Clearing storage triggers onboarding again on next visit
    clearOnboardingStatus();
    expect(store[ONBOARDING_STORAGE_KEY]).toBeUndefined();
    expect(shouldShowOnboardingOnBoot('/')).toBe(true);

    // Skipping also persists cleanly
    saveOnboardingStatus('skipped');
    expect(getOnboardingStatus()).toBe('skipped');
    expect(shouldShowOnboardingOnBoot('/')).toBe(false);
  });

  it('handles storage exceptions gracefully without crashing', () => {
    (globalThis as any).window = {
      localStorage: {
        getItem: () => {
          throw new Error('SecurityError');
        },
        setItem: () => {
          throw new Error('QuotaExceededError');
        },
        removeItem: () => {
          throw new Error('SecurityError');
        },
      },
    };

    expect(() => getOnboardingStatus()).not.toThrow();
    expect(() => saveOnboardingStatus('skipped')).not.toThrow();
    expect(() => clearOnboardingStatus()).not.toThrow();
  });
});
