import { describe, it, expect } from 'vitest';
import {
  resolveResourceFileUrl,
  repairSupabasePublicResourceUrl,
  detectDocumentKind,
  buildStorageDownloadUrl,
  normalizeResourceStoragePath,
} from '../lib/resourceUrl';
import { mapDbResourceToModel } from '../lib/supabase';

describe('Resource URL & Format Resolution', () => {
  it('repairs legacy Supabase URLs missing the resources bucket prefix', () => {
    const legacy = 'https://cvhjohbknghlmspoaenr.supabase.co/storage/v1/object/public/submissions/1700_sta211.pdf';
    expect(repairSupabasePublicResourceUrl(legacy)).toBe(
      'https://cvhjohbknghlmspoaenr.supabase.co/storage/v1/object/public/resources/submissions/1700_sta211.pdf'
    );

    const valid = 'https://cvhjohbknghlmspoaenr.supabase.co/storage/v1/object/public/resources/papers/sta111.pdf';
    expect(repairSupabasePublicResourceUrl(valid)).toBe(valid);
  });

  it('resolves relative filePath strings cleanly and ignores unsafe traversal', () => {
    expect(normalizeResourceStoragePath('../secret.pdf')).toBeNull();
    expect(normalizeResourceStoragePath('resources/submissions/paper.pdf')).toBe('submissions/paper.pdf');

    const resolved = resolveResourceFileUrl(
      { filePath: 'submissions/179_sta311.pdf', downloadUrl: '#' },
      'https://cvhjohbknghlmspoaenr.supabase.co'
    );
    expect(resolved).toBe(
      'https://cvhjohbknghlmspoaenr.supabase.co/storage/v1/object/public/resources/submissions/179_sta311.pdf'
    );
  });

  it('returns null for placeholder catalog entries without uploaded files', () => {
    expect(resolveResourceFileUrl({ filePath: undefined, downloadUrl: '#' })).toBeNull();
    expect(resolveResourceFileUrl({ filePath: '', downloadUrl: 'javascript:alert(1)' })).toBeNull();
  });

  it('maps database resources with preserved filePath and valid storage downloadUrl', () => {
    const mapped = mapDbResourceToModel({
      id: 'res-1',
      title: 'STA 211 Past Question',
      course_code: 'STA 211',
      file_type: 'DOCX',
      file_path: 'submissions/2026_sta211_notes.docx',
      file_size_bytes: 450000,
    });

    expect(mapped.filePath).toBe('submissions/2026_sta211_notes.docx');
    expect(mapped.fileType).toBe('DOCX');
    expect(mapped.downloadUrl).toContain('/storage/v1/object/public/resources/submissions/2026_sta211_notes.docx');
  });

  it('detects document kind from URL pathname (ignoring signed token query params) and fileType fallback', () => {
    expect(
      detectDocumentKind(
        'https://cvhjohbknghlmspoaenr.supabase.co/storage/v1/object/sign/submissions-pending/sub.pdf?token=abc123',
        undefined,
        'submissions/sub.pdf'
      )
    ).toBe('pdf');

    expect(
      detectDocumentKind('https://example.com/download?id=42', 'DOCX')
    ).toBe('docx');

    expect(
      detectDocumentKind('https://cvhjohbknghlmspoaenr.supabase.co/storage/v1/object/public/resources/scan.png', 'PNG')
    ).toBe('image');
  });

  it('appends download disposition hint cleanly on Supabase Storage URLs', () => {
    const url = 'https://cvhjohbknghlmspoaenr.supabase.co/storage/v1/object/public/resources/test.pdf';
    expect(buildStorageDownloadUrl(url, 'STA211.pdf')).toBe(`${url}?download=STA211.pdf`);
  });
});
