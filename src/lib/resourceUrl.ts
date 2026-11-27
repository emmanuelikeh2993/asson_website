import { AcademicResource } from '../types';
import { sanitizeSafeHttpUrl } from './validation';

export type SupportedDocumentKind = 'pdf' | 'docx' | 'image' | 'unknown';

const DEFAULT_SUPABASE_URL = 'https://cvhjohbknghlmspoaenr.supabase.co';
const KNOWN_STORAGE_BUCKETS = new Set(['resources', 'submissions-pending', 'enterprise-images']);

export function getSupabaseBaseUrl(explicitBaseUrl?: string): string {
  const configured = explicitBaseUrl || import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  return configured.replace(/\/+$/, '');
}

/**
 * Strips leading bucket/slash prefixes and rejects path-traversal attempts.
 */
export function normalizeResourceStoragePath(rawPath?: string | null): string | null {
  if (!rawPath) return null;
  const trimmed = rawPath.trim().replace(/^\/+/, '');
  if (!trimmed || trimmed === '#' || trimmed.includes('..')) {
    return null;
  }

  const withoutBucket = trimmed.replace(/^resources\/+/, '');
  const sanitized = withoutBucket.replace(/[^a-zA-Z0-9._/\- ()]/g, '');
  return sanitized || null;
}

/**
 * Repairs legacy Supabase Storage URLs produced when `mapDbResourceToModel`
 * concatenated `row.file_path` directly after `/storage/v1/object/public/` without
 * the `resources/` bucket segment (e.g. `.../public/submissions/...`).
 */
export function repairSupabasePublicResourceUrl(rawUrl: string): string {
  const safe = sanitizeSafeHttpUrl(rawUrl);
  if (!safe) return rawUrl;

  try {
    const parsed = new URL(safe);
    const marker = '/storage/v1/object/public/';
    const idx = parsed.pathname.indexOf(marker);
    if (idx === -1) return safe;

    const afterMarker = parsed.pathname.slice(idx + marker.length).replace(/^\/+/, '');
    if (!afterMarker) return safe;

    const firstSegment = afterMarker.split('/')[0];
    if (!KNOWN_STORAGE_BUCKETS.has(firstSegment)) {
      parsed.pathname = `${parsed.pathname.slice(0, idx + marker.length)}resources/${afterMarker}`;
    }
    return parsed.toString();
  } catch {
    return safe;
  }
}

/**
 * Single source of truth for resolving an AcademicResource's fetchable file URL.
 * Supports:
 * 1. Verified external HTTP(S) links
 * 2. Full Supabase Storage public/signed URLs (repairing missing `/resources/` bucket if needed)
 * 3. Relative Supabase storage paths (`submissions/...`, `papers/...`, `test.pdf`, etc.)
 * Returns `null` when a catalog entry is metadata-only and awaits physical upload.
 */
export function resolveResourceFileUrl(
  resource: Pick<AcademicResource, 'downloadUrl' | 'filePath'>,
  explicitSupabaseUrl?: string
): string | null {
  const baseUrl = getSupabaseBaseUrl(explicitSupabaseUrl);

  // 1. Prefer explicit relative filePath if it is a storage object path or HTTP(S) URL
  if (resource.filePath && resource.filePath.trim() && resource.filePath.trim() !== '#') {
    const trimmedPath = resource.filePath.trim();
    if (/^https?:\/\//i.test(trimmedPath)) {
      const safeDirect = sanitizeSafeHttpUrl(trimmedPath);
      return safeDirect ? repairSupabasePublicResourceUrl(safeDirect) : null;
    }
    const cleanPath = normalizeResourceStoragePath(trimmedPath);
    if (cleanPath) {
      const encodedPath = cleanPath
        .split('/')
        .map((segment) => encodeURIComponent(segment))
        .join('/');
      return `${baseUrl}/storage/v1/object/public/resources/${encodedPath}`;
    }
  }

  // 2. Fallback to downloadUrl (external link or full Supabase URL)
  if (resource.downloadUrl && resource.downloadUrl.trim() && resource.downloadUrl.trim() !== '#') {
    const safeUrl = sanitizeSafeHttpUrl(resource.downloadUrl);
    if (!safeUrl) return null;
    return repairSupabasePublicResourceUrl(safeUrl);
  }

  return null;
}

/**
 * Appends `?download=<filename>` on Supabase Storage URLs so cross-origin anchor clicks
 * trigger a real file save (`Content-Disposition: attachment`) instead of navigating away.
 */
export function buildStorageDownloadUrl(fileUrl: string, suggestedFilename?: string): string {
  try {
    const parsed = new URL(fileUrl);
    if (parsed.pathname.includes('/storage/v1/object/')) {
      parsed.searchParams.set('download', suggestedFilename || '');
      return parsed.toString();
    }
  } catch {
    // Keep non-URL strings untouched
  }
  return fileUrl;
}

/**
 * Determines rendering engine kind from URL pathname (ignoring query tokens),
 * storage path, and resource `fileType`.
 */
export function detectDocumentKind(
  fileUrl?: string | null,
  fileType?: string | null,
  filePath?: string | null
): SupportedDocumentKind {
  const candidates: string[] = [];

  if (fileUrl) {
    try {
      const pathname = new URL(fileUrl).pathname;
      candidates.push(pathname.toLowerCase());
    } catch {
      candidates.push(fileUrl.split('?')[0].toLowerCase());
    }
  }

  if (filePath) {
    candidates.push(filePath.split('?')[0].toLowerCase());
  }

  for (const candidate of candidates) {
    if (/\.pdf$/i.test(candidate)) return 'pdf';
    if (/\.docx$/i.test(candidate)) return 'docx';
    if (/\.(png|jpe?g|webp|gif|bmp)$/i.test(candidate)) return 'image';
  }

  const normalizedType = (fileType || '').trim().toUpperCase();
  if (normalizedType === 'PDF') return 'pdf';
  if (normalizedType === 'DOCX') return 'docx';
  if (['PNG', 'JPG', 'JPEG', 'WEBP', 'GIF', 'BMP'].includes(normalizedType)) return 'image';

  return 'unknown';
}
