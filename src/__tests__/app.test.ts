import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { formatFileSize, formatDate, normalizeSearchTerm } from '../lib/utils';
import {
  trackEvent,
  reportError,
  getTelemetrySnapshot,
  clearTelemetrySnapshot,
  setErrorReportSink,
  type ErrorReportPayload,
} from '../lib/telemetry';
import { mapDbCalendarEventToModel } from '../lib/supabase';
import {
  getOnboardingStatus,
  saveOnboardingStatus,
  clearOnboardingStatus,
  shouldShowOnboardingOnBoot,
  ONBOARDING_STORAGE_KEY,
} from '../lib/onboardingStorage';
import {
  isSafeHttpUrl,
  sanitizeSafeHttpUrl,
  OpportunitySchema,
  EnterpriseListingSchema,
} from '../lib/validation';

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

    // Executive/console/admin routes are excluded
    expect(shouldShowOnboardingOnBoot('/executive')).toBe(false);
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

describe('Security URL Sanitization & Schema Validation', () => {
  it('blocks javascript:, data:, and invalid URLs while allowing http/https', () => {
    expect(isSafeHttpUrl('https://asson-ui.vercel.app/resources')).toBe(true);
    expect(isSafeHttpUrl('http://localhost:8000')).toBe(true);
    expect(sanitizeSafeHttpUrl('javascript:alert(1)')).toBeUndefined();
    expect(sanitizeSafeHttpUrl('data:text/html,<script>alert(1)</script>')).toBeUndefined();
    expect(sanitizeSafeHttpUrl('vbscript:msgbox(1)')).toBeUndefined();
    expect(sanitizeSafeHttpUrl('not-a-url')).toBeUndefined();
  });

  it('rejects unsafe applicationUrl in OpportunitySchema and bad imageUrl in EnterpriseListingSchema', () => {
    const badOpp = OpportunitySchema.safeParse({
      title: 'Test Scholarship',
      provider: 'UI Foundation',
      category: 'Scholarship',
      deadline: '2026-12-01',
      eligibility: 'All Statistics students',
      description: 'Annual tuition grant for undergraduates.',
      applicationUrl: 'javascript:alert(document.cookie)',
      location: 'Nigeria',
    });
    expect(badOpp.success).toBe(false);

    const badEnt = EnterpriseListingSchema.safeParse({
      businessName: 'DataCraft UI',
      category: 'Data & Tech',
      description: 'Statistical modeling and R/Python data tutoring.',
      ownerName: 'Ade Student',
      ownerLevel: '300',
      contactPhone: '08012345678',
      imageUrl: 'data:image/svg+xml,<svg onload=alert(1)>',
    });
    expect(badEnt.success).toBe(false);

    const goodEnt = EnterpriseListingSchema.safeParse({
      businessName: 'DataCraft UI',
      category: 'Data & Tech',
      description: 'Statistical modeling and R/Python data tutoring.',
      ownerName: 'Ade Student',
      ownerLevel: '300',
      contactPhone: '08012345678',
      imageUrl: 'https://cvhjohbknghlmspoaenr.supabase.co/storage/v1/object/public/enterprise-images/enterprises/test.jpg',
    });
    expect(goodEnt.success).toBe(true);
  });
});

describe('Search Normalization & Privacy Telemetry', () => {
  beforeEach(() => {
    clearTelemetrySnapshot();
    setErrorReportSink(null);
  });

  afterEach(() => {
    setErrorReportSink(null);
  });

  it('normalizes spaces, hyphens, and casing across course search variations', () => {
    const canonical = normalizeSearchTerm('STA 111');
    expect(normalizeSearchTerm('STA111')).toBe(canonical);
    expect(normalizeSearchTerm('sta-111')).toBe(canonical);
    expect(normalizeSearchTerm('  Sta - 111  ')).toBe(canonical);
  });

  it('strips sensitive PII keys from telemetry events while keeping safe metrics', () => {
    trackEvent('search_zero_results', {
      queryLength: 6,
      level: '100',
      email: 'student@ui.edu.ng',
      matricNumber: '234567',
      userName: 'Should Be Stripped',
      token: 'secret-token',
    });

    const { events } = getTelemetrySnapshot();
    expect(events).toHaveLength(1);
    expect(events[0].name).toBe('search_zero_results');
    expect(events[0].props).toEqual({ queryLength: 6, level: '100' });
  });

  it('captures runtime exceptions into error telemetry sink without crashing', () => {
    const captured: ErrorReportPayload[] = [];
    setErrorReportSink((payload) => captured.push(payload));

    reportError(new Error('Simulated render crash'), 'error_boundary');

    const { errors } = getTelemetrySnapshot();
    expect(errors).toHaveLength(1);
    expect(captured).toHaveLength(1);
    expect(captured[0].source).toBe('error_boundary');
    expect(captured[0].message).toBe('Simulated render crash');
  });
});
