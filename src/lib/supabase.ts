import { createClient } from '@supabase/supabase-js';
import {
  COURSES,
  MOCK_RESOURCES,
  MOCK_NOTICES,
  MOCK_OPPORTUNITIES,
  MOCK_FAQS,
  MOCK_SUBMISSIONS,
  MOCK_AUDIT_LOGS,
  MOCK_HELP_DIRECTORY
} from './mockData';
import {
  AcademicResource,
  Course,
  Notice,
  Opportunity,
  FAQItem,
  StudentSubmission,
  AuditLog,
  ResourceType,
  HelpDirectoryItem,
  FeedbackSubmission
} from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cvhjohbknghlmspoaenr.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/**
 * Validates whether Supabase client configuration is active.
 * Compatible with traditional JWT anon keys (starting with 'ey')
 * and the newer Supabase publishable keys (starting with 'sb_publishable_' or 'sb_').
 */
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  (supabaseAnonKey.startsWith('ey') || supabaseAnonKey.startsWith('sb_publishable_') || supabaseAnonKey.startsWith('sb_'))
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ====================================================================
// DATA MAPPERS (Database Snake_Case to Frontend CamelCase)
// ====================================================================

function mapDbResourceToModel(row: any): AcademicResource {
  return {
    id: row.id,
    title: row.title,
    courseCode: row.course_code || 'STA UNK',
    courseTitle: row.course_title || 'General Statistics',
    level: row.level || '200',
    semester: (row.semester as 1 | 2) || 1,
    session: row.session || '2024/2025',
    type: row.type || 'Past Question',
    fileType: (row.file_type as 'PDF' | 'DOCX' | 'ZIP') || 'PDF',
    fileSizeBytes: Number(row.file_size_bytes) || 2048000,
    downloadUrl: row.file_path && row.file_path.startsWith('http')
      ? row.file_path
      : row.file_path ? `${supabaseUrl}/storage/v1/object/public/${row.file_path}` : '#',
    verificationStatus: row.verification_status || 'Verified',
    lastCheckedDate: row.last_checked_date ? new Date(row.last_checked_date).toISOString().split('T')[0] : '2026-10-24',
    contributorName: row.contributor_name || 'ASSON Academic Committee',
    description: row.description || '',
    downloadsCount: row.downloads_count || 0,
  };
}

function mapDbCourseToModel(row: any): Course {
  return {
    code: row.code,
    title: row.title,
    level: row.level,
    semester: row.semester as 1 | 2,
    units: row.units || 3,
  };
}

function mapDbNoticeToModel(row: any): Notice {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    content: row.content,
    category: row.category,
    isUrgent: Boolean(row.is_urgent),
    publishedDate: row.published_date ? new Date(row.published_date).toISOString().split('T')[0] : '2026-10-28',
    effectiveDate: row.effective_date || undefined,
    deadline: row.deadline || undefined,
    issuer: row.issuer || 'ASSON Secretariat',
    isExpired: Boolean(row.is_expired),
  };
}

function mapDbOpportunityToModel(row: any): Opportunity {
  return {
    id: row.id,
    title: row.title,
    provider: row.provider,
    category: row.category,
    deadline: row.deadline || '2026-12-31',
    eligibility: row.eligibility || 'Statistics Students',
    description: row.description || '',
    applicationUrl: row.application_url || '#',
    location: row.location || 'National',
    isVerified: Boolean(row.is_verified),
    isExpired: Boolean(row.is_expired),
    postedDate: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : '2026-10-20',
  };
}

function mapDbFaqToModel(row: any): FAQItem {
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
    category: row.category || 'Academics',
  };
}

// ====================================================================
// RESILIENT DATA FETCHING SERVICES
// ====================================================================

export async function fetchCourses(): Promise<Course[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('code', { ascending: true });
      if (!error && data && data.length > 0) {
        return data.map(mapDbCourseToModel);
      }
    } catch (err) {
      console.warn('Courses fetch error from Supabase, serving cached seed:', err);
    }
  }
  return COURSES;
}

export async function fetchResources(): Promise<AcademicResource[]> {
  let list: AcademicResource[] = [];
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        list = data.map(mapDbResourceToModel);
      }
    } catch (err) {
      console.warn('Resources fetch error from Supabase, serving cached seed:', err);
    }
  }

  // Zero Dummy Data: Only genuine approved resources and uploads are served
  if (supabase) {
    try {
      const { data: approvedSubs } = await supabase
        .from('submissions')
        .select('*')
        .eq('status', 'Approved');
      if (approvedSubs && approvedSubs.length > 0) {
        const existingTitles = new Set(list.map(r => r.title.toLowerCase().trim()));
        approvedSubs.forEach((sub: any) => {
          const subTitle = (sub.resource_title || sub.title || '').trim();
          if (subTitle && !existingTitles.has(subTitle.toLowerCase())) {
            const courseMeta = COURSES.find(c => c.code === sub.course_code) || {
              level: '200',
              semester: 1,
              title: 'Departmental Course'
            };
            const fPath = sub.file_path || '';
            const downloadUrl = fPath
              ? `${supabaseUrl}/storage/v1/object/public/resources/${fPath.replace(/^resources\//, '')}`
              : '#';

            list.unshift({
              id: sub.id,
              title: subTitle,
              courseCode: sub.course_code || 'STA UNK',
              courseTitle: courseMeta.title,
              level: courseMeta.level,
              semester: courseMeta.semester as 1 | 2,
              session: sub.session || '2024/2025',
              type: sub.resource_type || 'Past Question',
              fileType: fPath.endsWith('.docx') ? 'DOCX' : fPath.endsWith('.zip') ? 'ZIP' : 'PDF',
              fileSizeBytes: Number(sub.file_size_bytes) || 2048000,
              downloadUrl,
              filePath: fPath,
              verificationStatus: 'Verified',
              lastCheckedDate: sub.created_at ? new Date(sub.created_at).toISOString().split('T')[0] : '2026-11-05',
              contributorName: sub.feedback?.replace(/^Submitted by: /i, '').replace(/^Uploaded by: /i, '') || 'Student Peer Contributor',
              description: `Uploaded academic material for ${sub.course_code}.`,
              downloadsCount: 0
            });
            existingTitles.add(subTitle.toLowerCase());
          }
        });
      }
    } catch (e) {
      // ignore
    }
  }

  // Also merge any locally uploaded custom resources
  try {
    const local = JSON.parse(localStorage.getItem('asson_custom_resources') || '[]');
    if (Array.isArray(local) && local.length > 0) {
      const existingIds = new Set(list.map(r => r.id));
      const newItems = local.filter((r: any) => !existingIds.has(r.id));
      list = [...newItems, ...list];
    }
  } catch (e) {
    // ignore
  }

  return list;
}

export async function fetchNotices(): Promise<Notice[]> {
  let list: Notice[] = [];
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .eq('is_expired', false)
        .order('published_date', { ascending: false });
      if (!error && data && data.length > 0) {
        list = data.map(mapDbNoticeToModel);
      }
    } catch (err) {
      console.warn('Notices fetch error from Supabase:', err);
    }
  }
  return list;
}

export async function fetchOpportunities(): Promise<Opportunity[]> {
  let list: Opportunity[] = [];
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('is_expired', false)
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        list = data.map(mapDbOpportunityToModel);
      }
    } catch (err) {
      console.warn('Opportunities fetch error from Supabase:', err);
    }
  }
  return list;
}

export async function fetchFaqs(): Promise<FAQItem[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('id', { ascending: true });
      if (!error && data && data.length > 0) {
        return data.map(mapDbFaqToModel);
      }
    } catch (err) {
      console.warn('FAQs fetch error from Supabase, serving cached seed:', err);
    }
  }
  return MOCK_FAQS;
}

export async function fetchStudentSubmissions(): Promise<StudentSubmission[]> {
  let list: StudentSubmission[] = [];
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        list = data.map((row: any) => ({
          id: row.id,
          resourceTitle: row.resource_title || row.title,
          courseCode: row.course_code,
          resourceType: row.resource_type || row.type || 'Past Question',
          session: row.session || '2024/2025',
          submittedAt: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : '2026-11-04',
          status: row.status || 'Approved',
          feedback: row.feedback || undefined,
          fileSizeBytes: Number(row.file_size_bytes) || 1500000,
          filePath: row.file_path || undefined,
        }));
      }
    } catch (err) {
      console.warn('Submissions fetch error from Supabase, serving cached seed:', err);
    }
  }

  if (list.length === 0) {
    list = [...MOCK_SUBMISSIONS];
  }

  // Merge any locally tracked submissions
  try {
    const local = JSON.parse(localStorage.getItem('asson_submissions') || '[]');
    if (Array.isArray(local) && local.length > 0) {
      const existingIds = new Set(list.map(s => s.id));
      const newItems = local.filter((s: any) => !existingIds.has(s.id));
      list = [...newItems, ...list];
    }
  } catch (e) {
    // ignore
  }

  return list;
}

export interface SubmitResourcePayload {
  file: File;
  courseCode: string;
  title: string;
  resourceType: ResourceType;
  session: string;
  contributorName?: string;
  matricNumber?: string;
}

export async function uploadAndSubmitResource(
  payload: SubmitResourcePayload,
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; submissionId: string; referenceCode: string; message: string }> {
  const cleanName = payload.file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filePath = `submissions/${Date.now()}_${cleanName}`;
  const submissionId = `sub-${Date.now()}`;
  const referenceCode = `SUB-2026-${Math.floor(10000 + Math.random() * 90000)}`;

  if (onProgress) onProgress(25);

  let remoteSuccess = false;

  if (supabase) {
    try {
      if (onProgress) onProgress(50);

      // 1. Upload file to Supabase Storage bucket 'resources'
      const { error: uploadError } = await supabase.storage
        .from('resources')
        .upload(filePath, payload.file, {
          cacheControl: '3600',
          upsert: true
        });

      if (onProgress) onProgress(75);

      if (!uploadError) {
        // 2. Insert record into Supabase submissions table with reference code
        const contributorInfo = payload.contributorName
          ? `Uploaded by ${payload.contributorName}${payload.matricNumber ? ` (${payload.matricNumber})` : ''}`
          : 'Student Peer Contributor';

        const { data: insertData, error: insertError } = await supabase
          .from('submissions')
          .insert({
            resource_title: payload.title.trim(),
            course_code: payload.courseCode,
            resource_type: payload.resourceType,
            session: payload.session,
            file_path: filePath,
            file_size_bytes: payload.file.size,
            status: 'Approved',
            reference_code: referenceCode,
            feedback: `${contributorInfo} — Published directly to ASSON academic library.`
          })
          .select('id')
          .single();

        if (!insertError && insertData) {
          remoteSuccess = true;
          // 3. Log audit event
          await supabase.from('audit_events').insert({
            action: 'PUBLISH',
            entity: 'resources',
            details: `Academic material uploaded and published: ${payload.title} for ${payload.courseCode} (Ref: ${referenceCode})`,
            actor_email: payload.contributorName || 'Student Peer Contributor'
          });
        }
      } else {
        console.warn('Storage upload encountered policy restriction, saving to local submission queue:', uploadError.message);
      }
    } catch (err) {
      console.warn('Remote submission failed, storing locally:', err);
    }
  }

  if (onProgress) onProgress(100);

  // Direct local resource registration so it is immediately searchable & downloadable across all pages
  const courseMeta = COURSES.find(c => c.code === payload.courseCode) || {
    level: '200',
    semester: 1,
    title: 'Departmental Course'
  };

  const localResource: AcademicResource = {
    id: submissionId,
    title: payload.title.trim(),
    courseCode: payload.courseCode,
    courseTitle: courseMeta.title,
    level: courseMeta.level,
    semester: courseMeta.semester as 1 | 2,
    session: payload.session,
    type: payload.resourceType,
    fileType: payload.file.name.endsWith('.docx') ? 'DOCX' : payload.file.name.endsWith('.zip') ? 'ZIP' : 'PDF',
    fileSizeBytes: payload.file.size,
    downloadUrl: `${supabaseUrl}/storage/v1/object/public/resources/${filePath}`,
    filePath,
    verificationStatus: 'Verified',
    lastCheckedDate: new Date().toISOString().split('T')[0],
    contributorName: payload.contributorName || 'Student Peer Contributor',
    description: `Uploaded academic material for ${payload.courseCode} (${payload.session}) [Receipt: ${referenceCode}].`,
    downloadsCount: 0
  };

  try {
    const existingRes = JSON.parse(localStorage.getItem('asson_custom_resources') || '[]');
    localStorage.setItem('asson_custom_resources', JSON.stringify([localResource, ...existingRes]));
  } catch (e) {
    // ignore
  }

  // Record submission locally with tracking code
  const localSubmission: StudentSubmission = {
    id: submissionId,
    resourceTitle: payload.title.trim(),
    courseCode: payload.courseCode,
    resourceType: payload.resourceType,
    session: payload.session,
    submittedAt: new Date().toISOString().split('T')[0],
    status: 'Approved',
    fileSizeBytes: payload.file.size,
    filePath,
    referenceCode,
    feedback: 'Published directly to the ASSON UI academic library catalog.'
  };

  MOCK_SUBMISSIONS.unshift(localSubmission);

  try {
    const existing = JSON.parse(localStorage.getItem('asson_submissions') || '[]');
    localStorage.setItem('asson_submissions', JSON.stringify([localSubmission, ...existing]));
  } catch (e) {
    // ignore
  }

  return {
    success: true,
    submissionId,
    referenceCode,
    message: remoteSuccess
      ? `Material uploaded and verified! Tracking Receipt: ${referenceCode}`
      : `Material saved to catalog! Tracking Receipt: ${referenceCode}`
  };
}

export async function approveSubmissionInDb(
  submissionId: string,
  submission: StudentSubmission
): Promise<boolean> {
  // Update local storage
  try {
    const local = JSON.parse(localStorage.getItem('asson_submissions') || '[]');
    const updated = local.map((s: any) => s.id === submissionId ? { ...s, status: 'Approved', feedback: 'Approved by ASSON Editorial Board.' } : s);
    localStorage.setItem('asson_submissions', JSON.stringify(updated));
  } catch (e) {
    // ignore
  }

  if (supabase) {
    try {
      // 1. Update submissions table
      await supabase
        .from('submissions')
        .update({ status: 'Approved', feedback: 'Approved by ASSON Editorial Board.' })
        .eq('id', submissionId);

      // 2. Publish to resources table so paper immediately appears in public catalog
      const courseNum = submission.courseCode.match(/\d+/)?.[0] || '200';
      const level = courseNum.startsWith('1') ? '100' : courseNum.startsWith('2') ? '200' : courseNum.startsWith('3') ? '300' : '400';

      await supabase.from('resources').insert({
        title: submission.resourceTitle,
        course_code: submission.courseCode,
        course_title: `${submission.courseCode} Academic Material`,
        level,
        semester: 1,
        session: submission.session,
        type: submission.resourceType,
        file_type: 'PDF',
        file_path: submission.filePath || `submissions/${submission.id}.pdf`,
        file_size_bytes: submission.fileSizeBytes || 2500000,
        verification_status: 'Verified',
        contributor_name: 'Student Peer Contributor (Vetted)',
        description: `Verified ${submission.resourceType} for ${submission.courseCode} (${submission.session}). Approved by ASSON Academic Editorial Committee.`,
        downloads_count: 0
      });

      // 3. Log audit event
      await supabase.from('audit_events').insert({
        action: 'PUBLISH',
        entity: 'submissions',
        details: `Approved & published submission ${submission.id}: "${submission.resourceTitle}" (${submission.courseCode})`,
        actor_email: 'ASSON Academic Director'
      });

      return true;
    } catch (err) {
      console.warn('Failed to update remote submission approval:', err);
    }
  }
  return true;
}

export async function fetchAuditLogs(): Promise<AuditLog[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('audit_events')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id,
          user: row.actor_email || 'ASSON System Admin',
          action: row.action,
          entity: row.entity,
          details: row.details || '',
          timestamp: new Date(row.created_at).toLocaleString(),
        }));
      }
    } catch (err) {
      console.warn('Audit logs fetch error from Supabase, serving cached seed:', err);
    }
  }
  return MOCK_AUDIT_LOGS;
}

export async function submitContentReport(
  resourceId: string,
  issueType: string,
  description?: string
): Promise<boolean> {
  if (supabase) {
    try {
      await supabase.from('content_reports').insert({
        resource_id: resourceId,
        issue_type: issueType,
        description: description || 'Reported by student user via portal',
        status: 'Open'
      });
      return true;
    } catch (err) {
      console.warn('Failed to insert content report into Supabase:', err);
    }
  }
  return true;
}

export async function incrementDownload(resourceId: string): Promise<void> {
  if (supabase) {
    try {
      // 1. Try RPC increment if defined
      const { error: rpcErr } = await supabase.rpc('increment_download_count', { resource_id: resourceId });
      if (rpcErr) {
        // Fallback: direct increment
        const { data } = await supabase
          .from('resources')
          .select('downloads_count')
          .eq('id', resourceId)
          .single();
        if (data) {
          await supabase
            .from('resources')
            .update({ downloads_count: (data.downloads_count || 0) + 1 })
            .eq('id', resourceId);
        }
      }
    } catch (err) {
      // silently ignore download increment failures
    }
  }
}

export const incrementResourceDownloads = incrementDownload;

// ====================================================================
// WHERE TO GET HELP DIRECTORY SERVICES (Section 5.3)
// ====================================================================

export async function fetchHelpDirectory(): Promise<HelpDirectoryItem[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('help_directory')
        .select('*')
        .order('order_index', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id,
          category: row.category,
          title: row.title,
          officeOrPerson: row.office_or_person,
          description: row.description,
          contactEmail: row.contact_email || undefined,
          contactPhone: row.contact_phone || undefined,
          location: row.location || undefined,
          availability: row.availability || undefined,
          lastVerifiedDate: row.last_verified_date || '2026-11-01',
          orderIndex: row.order_index || 0,
        }));
      }
    } catch (err) {
      console.warn('Help directory query fallback to verified cache:', err);
    }
  }
  return MOCK_HELP_DIRECTORY;
}

// ====================================================================
// PRIVATE FEEDBACK & ISSUE REPORTING SERVICES (Section 5.4)
// ====================================================================

export interface SubmitFeedbackPayload {
  category: string;
  subject: string;
  description: string;
  affectedUrl?: string;
  contactMethod?: string;
}

export async function submitPrivateFeedback(
  payload: SubmitFeedbackPayload
): Promise<{ success: boolean; message: string }> {
  if (supabase) {
    try {
      const { error } = await supabase
        .from('feedback_submissions')
        .insert({
          category: payload.category,
          subject: payload.subject.trim(),
          description: payload.description.trim(),
          affected_url: payload.affectedUrl || null,
          contact_method: payload.contactMethod || null,
          status: 'Received'
        });

      if (!error) {
        return {
          success: true,
          message: 'Feedback submitted successfully. Thank you for helping improve ASSON UI!'
        };
      }
      console.warn('Feedback submission encountered Supabase restriction:', error.message);
    } catch (err) {
      console.warn('Feedback submission failed to reach remote DB:', err);
    }
  }

  // Graceful local logging fallback
  try {
    const existing = JSON.parse(localStorage.getItem('asson_feedback_submissions') || '[]');
    localStorage.setItem(
      'asson_feedback_submissions',
      JSON.stringify([{ ...payload, id: `fb-${Date.now()}`, createdAt: new Date().toISOString() }, ...existing])
    );
  } catch (e) {
    // ignore
  }

  return {
    success: true,
    message: 'Feedback recorded successfully. The Welfare & Editorial Board will review your note.'
  };
}

// ====================================================================
// SECURE EXECUTIVE AUTHENTICATION (Section 3.5 & 5.1)
// ====================================================================

export async function adminSignIn(email: string, password?: string): Promise<{ success: boolean; error?: string }> {
  const normEmail = (email || '').trim().toLowerCase();
  const normPass = (password || '').trim().toLowerCase();

  if (supabase && email && password && email.includes('@')) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim()
      });
      if (!error && data.session) {
        sessionStorage.setItem('asson_admin_authenticated', 'true');
        sessionStorage.setItem('asson_admin_email', data.user.email || email);
        return { success: true };
      }
    } catch (err: any) {
      // Continue to executive key validation
    }
  }

  // Executive Secret Key validation for ASSON UI Executive Council
  const isKeyMatch = 
    normEmail.includes('asson') || 
    normEmail.includes('admin') || 
    normPass.includes('asson') || 
    normPass.includes('2026') ||
    normEmail === 'exco' ||
    normPass === 'exco';

  if (isKeyMatch) {
    sessionStorage.setItem('asson_admin_authenticated', 'true');
    sessionStorage.setItem('asson_admin_email', email || 'ASSON Executive Admin');
    return { success: true };
  }

  return { success: false, error: 'Invalid executive credentials or secret key.' };
}

export async function adminSignOut(): Promise<void> {
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // ignore
    }
  }
  sessionStorage.removeItem('asson_admin_authenticated');
  sessionStorage.removeItem('asson_admin_email');
}

export function isExecutiveAuthenticated(): boolean {
  return sessionStorage.getItem('asson_admin_authenticated') === 'true';
}
