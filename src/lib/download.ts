import { AcademicResource } from '../types';
import { formatFileSize } from './utils';

/**
 * Triggers zero-barrier file download for students without requiring any login or signup.
 * - Streams directly from public Supabase Storage CDN or external link
 * - Records local download metric in browser storage for personal dashboard
 */
export function triggerResourceDownload(
  resource: AcademicResource,
  onNotify?: (title: string, message?: string) => void
): void {
  // Determine effective download URL
  let downloadUrl = resource.downloadUrl;
  
  if (!downloadUrl || downloadUrl === '#') {
    // Fallback to Supabase public storage path if present
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cvhjohbknghlmspoaenr.supabase.co';
    if (resource.filePath) {
      downloadUrl = resource.filePath.startsWith('http')
        ? resource.filePath
        : `${supabaseUrl}/storage/v1/object/public/resources/${resource.filePath}`;
    }
  }

  // Trigger notification
  if (onNotify) {
    onNotify(
      `Starting Download: ${resource.courseCode}`,
      `${resource.title} (${formatFileSize(resource.fileSizeBytes)})`
    );
  }

  // Record to local browser download history for Student Dashboard
  try {
    const history = JSON.parse(localStorage.getItem('asson_downloads') || '[]');
    const newEntry = {
      id: resource.id,
      title: resource.title,
      courseCode: resource.courseCode,
      downloadedAt: new Date().toISOString(),
      fileSizeBytes: resource.fileSizeBytes,
      type: resource.type,
    };
    const updated = [newEntry, ...history.filter((h: any) => h.id !== resource.id)].slice(0, 50);
    localStorage.setItem('asson_downloads', JSON.stringify(updated));
  } catch (err) {
    // ignore local storage errors
  }

  // Silent direct browser download trigger
  if (downloadUrl && downloadUrl !== '#') {
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${resource.courseCode}_${resource.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.${resource.fileType.toLowerCase()}`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
    }, 200);
  } else {
    // If no physical file link exists yet, create a clean verified academic study slip
    const textSlip = `=====================================================
ASSON UI - Association of Statistics Students of Nigeria
Department of Statistics, University of Ibadan
=====================================================
COURSE: ${resource.courseCode} - ${resource.courseTitle}
TITLE: ${resource.title}
TYPE: ${resource.type}
SESSION: ${resource.session} (Semester ${resource.semester})
LEVEL: ${resource.level} Level
STATUS: ${resource.verificationStatus}
CONTRIBUTOR: ${resource.contributorName || 'ASSON Academic Committee'}
VERIFIED DATE: ${resource.lastCheckedDate}
=====================================================
Note: This material is part of the ASSON UI Academic Repository.
Visit https://asson-ui.org for all updated past questions and notes.
`;
    const blob = new Blob([textSlip], { type: 'text/plain;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `${resource.courseCode}_${resource.type.replace(/\s+/g, '_')}_${resource.session.replace(/\//g, '-')}.txt`;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    }, 200);
  }
}
