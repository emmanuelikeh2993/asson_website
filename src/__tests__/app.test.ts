import { describe, it, expect } from 'vitest';
import { formatFileSize, formatDate } from '../lib/utils';
import { mapDbCalendarEventToModel } from '../lib/supabase';

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
