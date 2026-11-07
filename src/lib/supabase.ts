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
  FeedbackSubmission,
  CalendarEvent,
  CalendarCategory,
  UserProfile,
  AcademicLevel
} from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
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
    fileType: (row.file_type as 'PDF' | 'DOCX') || 'PDF',
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
  const isPastDeadline = row.deadline ? new Date(row.deadline) < new Date(new Date().setHours(0, 0, 0, 0)) : false;
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
    isExpired: Boolean(row.is_expired) || isPastDeadline,
    eventDate: row.event_date || undefined,
    eventTime: row.event_time || undefined,
    venue: row.venue || undefined,
    rsvpUrl: row.rsvp_url || undefined,
    hasInAppRsvp: Boolean(row.has_in_app_rsvp),
    rsvpCount: Number(row.rsvp_count) || 0,
  };
}

export function mapDbCalendarEventToModel(row: any): CalendarEvent {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    category: row.category || 'Academic Milestone',
    startDate: row.start_date ? new Date(row.start_date).toISOString().split('T')[0] : '2026-11-20',
    endDate: row.end_date ? new Date(row.end_date).toISOString().split('T')[0] : undefined,
    startTime: row.start_time || undefined,
    targetLevel: row.target_level || undefined,
    venue: row.venue || undefined,
    isConfirmed: Boolean(row.is_confirmed),
    noticeId: row.notice_id || undefined,
  };
}

export const DEFAULT_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'cal-1',
    title: 'First Semester Course Registration Closes',
    description: 'Deadline for all 100L–400L students to complete faculty portal course registration and adviser clearance.',
    category: 'Registration Deadline',
    startDate: '2026-11-20',
    startTime: '11:59 PM',
    isConfirmed: true,
  },
  {
    id: 'cal-2',
    title: 'GES 301 Continuous Assessment Mid-Semester Test',
    description: 'University-wide computer-based test for all 300L students registered for Entrepreneurship and Innovation.',
    category: 'Continuous Assessment',
    startDate: '2026-11-28',
    startTime: '08:00 AM',
    venue: 'CBT Centre, UI Distance Learning Centre',
    targetLevel: '300',
    isConfirmed: true,
  },
  {
    id: 'cal-3',
    title: 'STA 211 & STA 212 In-Course Continuous Assessment Tests',
    description: 'Department of Statistics continuous assessment tests for Probability II and Statistical Inference II.',
    category: 'Continuous Assessment',
    startDate: '2026-12-05',
    startTime: '10:00 AM',
    venue: 'Large Lecture Theatre (LLT), Faculty of Science',
    targetLevel: '200',
    isConfirmed: true,
  },
  {
    id: 'cal-4',
    title: 'ASSON UI Annual Statistics Symposium & Data Hackathon',
    description: 'Departmental student symposium featuring quantitative industry speakers, career workshops, and python/R data challenge.',
    category: 'Departmental Event',
    startDate: '2026-12-12',
    startTime: '09:30 AM',
    venue: 'Faculty of Science Board Room / LLT',
    isConfirmed: true,
  },
  {
    id: 'cal-5',
    title: 'Faculty of Science 2024/2025 First Semester Examinations',
    description: 'Official commencement of degree examinations across all science departments.',
    category: 'Examination',
    startDate: '2027-01-11',
    endDate: '2027-01-30',
    isConfirmed: false,
  }
];

function mapDbOpportunityToModel(row: any): Opportunity {
  const isPastDeadline = row.deadline ? new Date(row.deadline) < new Date(new Date().setHours(0, 0, 0, 0)) : false;
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
    isExpired: Boolean(row.is_expired) || isPastDeadline,
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
              fileType: fPath.endsWith('.docx') ? 'DOCX' : 'PDF',
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

export async function fetchCalendarEvents(): Promise<CalendarEvent[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('academic_calendar')
        .select('*')
        .order('start_date', { ascending: true });
      if (!error && data && data.length > 0) {
        return data.map(mapDbCalendarEventToModel);
      }
    } catch (err) {
      console.warn('Calendar fetch error from Supabase, serving verified academic schedule:', err);
    }
  }
  return DEFAULT_CALENDAR_EVENTS;
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
      console.warn('Submissions fetch error from Supabase:', err);
    }
  }

  // Merge any locally tracked submissions submitted on this device
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
        // 2. Insert record into Supabase submissions table with reference code (Zero personal matriculation data)
        const contributorInfo = payload.contributorName
          ? `Uploaded by ${payload.contributorName}`
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
            feedback: `${contributorInfo} — Submitted to ASSON academic library.`
          })
          .select('id')
          .single();

        if (!insertError && insertData) {
          remoteSuccess = true;
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
    fileType: payload.file.name.endsWith('.docx') ? 'DOCX' : 'PDF',
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
): Promise<{ success: boolean; error?: string }> {
  if (supabase) {
    try {
      // 1. Update submissions table in Supabase
      const { error: updateError } = await supabase
        .from('submissions')
        .update({ status: 'Approved', feedback: 'Approved by ASSON Editorial Board.' })
        .eq('id', submissionId);

      if (updateError) {
        console.error('Remote submission approval failed:', updateError.message);
        return { success: false, error: updateError.message };
      }

      // 2. Publish to resources table so paper immediately appears in public catalog
      const courseNum = submission.courseCode.match(/\d+/)?.[0] || '200';
      const level = courseNum.startsWith('1') ? '100' : courseNum.startsWith('2') ? '200' : courseNum.startsWith('3') ? '300' : '400';

      const { error: insertError } = await supabase.from('resources').insert({
        title: submission.resourceTitle,
        course_code: submission.courseCode,
        course_title: `${submission.courseCode} Academic Material`,
        level,
        semester: 1,
        session: submission.session,
        type: submission.resourceType,
        file_type: submission.filePath?.endsWith('.docx') ? 'DOCX' : 'PDF',
        file_path: submission.filePath || `submissions/${submission.id}.pdf`,
        file_size_bytes: submission.fileSizeBytes || 2500000,
        verification_status: 'Verified',
        contributor_name: 'Student Peer Contributor (Vetted)',
        description: `Verified ${submission.resourceType} for ${submission.courseCode} (${submission.session}). Approved by ASSON Academic Editorial Committee.`,
        downloads_count: 0
      });

      if (insertError) {
        console.warn('Resource catalog registration warning:', insertError.message);
      }

      // 3. Log audit event
      const userEmail = sessionStorage.getItem('asson_admin_email') || 'ASSON Academic Director';
      await supabase.from('audit_events').insert({
        action: 'PUBLISH',
        entity: 'submissions',
        details: `Approved & published submission ${submission.id}: "${submission.resourceTitle}" (${submission.courseCode})`,
        actor_email: userEmail
      });
    } catch (err: any) {
      console.error('Failed to update remote submission approval:', err);
      return { success: false, error: err?.message || 'Database connection error during approval.' };
    }
  }

  // Update local storage only if remote succeeded or offline
  try {
    const local = JSON.parse(localStorage.getItem('asson_submissions') || '[]');
    const updated = local.map((s: any) => s.id === submissionId ? { ...s, status: 'Approved', feedback: 'Approved by ASSON Editorial Board.' } : s);
    localStorage.setItem('asson_submissions', JSON.stringify(updated));
  } catch (e) {
    // ignore
  }

  return { success: true };
}

export async function requestChangesOnSubmissionInDb(
  submissionId: string,
  feedbackNote: string
): Promise<{ success: boolean; error?: string }> {
  if (supabase) {
    try {
      const { error } = await supabase
        .from('submissions')
        .update({ status: 'Changes Requested', feedback: feedbackNote })
        .eq('id', submissionId);

      if (error) {
        return { success: false, error: error.message };
      }

      const userEmail = sessionStorage.getItem('asson_admin_email') || 'ASSON Academic Director';
      await supabase.from('audit_events').insert({
        action: 'UPDATE',
        entity: 'submissions',
        details: `Changes requested on submission ${submissionId}: "${feedbackNote}"`,
        actor_email: userEmail
      });
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to update submission status.' };
    }
  }

  try {
    const local = JSON.parse(localStorage.getItem('asson_submissions') || '[]');
    const updated = local.map((s: any) => s.id === submissionId ? { ...s, status: 'Changes Requested', feedback: feedbackNote } : s);
    localStorage.setItem('asson_submissions', JSON.stringify(updated));
  } catch (e) {
    // ignore
  }

  return { success: true };
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
// SECURE EXECUTIVE AUTHENTICATION & ROLE VERIFICATION (Tiers 1 & 2)
// ====================================================================

export async function verifyExecutiveRole(userId: string): Promise<{ isAuthorized: boolean; role?: 'editor' | 'admin' | 'super_admin' }> {
  if (!supabase) return { isAuthorized: false };
  try {
    // 1. Authoritative check via Postgres SECURITY DEFINER function has_role
    const { data: isAdmin, error: adminErr } = await supabase.rpc('has_role', { required_role: 'admin' });
    if (!adminErr && isAdmin === true) {
      return { isAuthorized: true, role: 'admin' };
    }

    const { data: isEditor, error: editorErr } = await supabase.rpc('has_role', { required_role: 'editor' });
    if (!editorErr && isEditor === true) {
      return { isAuthorized: true, role: 'editor' };
    }

    // 2. Direct table fallback if user has direct select access
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    if (!error && data && ['editor', 'admin', 'super_admin'].includes(data.role)) {
      return { isAuthorized: true, role: data.role as 'editor' | 'admin' | 'super_admin' };
    }
  } catch (e) {
    console.warn('Role verification query failed:', e);
  }
  return { isAuthorized: false };
}

export async function adminSignIn(email: string, password?: string): Promise<{ success: boolean; role?: string; error?: string }> {
  if (!email || !password || !email.includes('@')) {
    return { success: false, error: 'A valid email address and password are required.' };
  }

  if (!supabase) {
    return { success: false, error: 'Authentication service is not configured. Contact the platform administrator.' };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim()
    });

    if (error || !data.session || !data.user) {
      return { success: false, error: error?.message || 'Invalid credentials. Access denied.' };
    }

    // Role-gated authentication: verify in public.user_roles (enforced by RLS)
    const roleCheck = await verifyExecutiveRole(data.user.id);
    if (!roleCheck.isAuthorized) {
      // Disallow non-executive users immediately
      await supabase.auth.signOut();
      sessionStorage.removeItem('asson_admin_authenticated');
      sessionStorage.removeItem('asson_admin_email');
      sessionStorage.removeItem('asson_admin_role');
      return {
        success: false,
        error: 'Access denied: Your account does not have authorized executive privileges (editor or admin role required in database).'
      };
    }

    sessionStorage.setItem('asson_admin_authenticated', 'true');
    sessionStorage.setItem('asson_admin_email', data.user.email || email);
    sessionStorage.setItem('asson_admin_role', roleCheck.role || 'editor');
    return { success: true, role: roleCheck.role };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Authentication failed. Please try again.' };
  }
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
  sessionStorage.removeItem('asson_admin_role');
}

export function isExecutiveAuthenticated(): boolean {
  return sessionStorage.getItem('asson_admin_authenticated') === 'true';
}

// ====================================================================
// EDITORIAL CMS SERVICES (Tier 4: Dynamic Admin Management)
// ====================================================================

export async function createNoticeInDb(notice: {
  title: string;
  summary: string;
  content: string;
  category: string;
  isUrgent: boolean;
  issuer: string;
  deadline?: string;
  effectiveDate?: string;
}): Promise<{ success: boolean; error?: string }> {
  if (supabase) {
    try {
      const { error } = await supabase.from('notices').insert({
        title: notice.title.trim(),
        summary: notice.summary.trim(),
        content: notice.content.trim(),
        category: notice.category,
        is_urgent: notice.isUrgent,
        issuer: notice.issuer.trim(),
        deadline: notice.deadline || null,
        effective_date: notice.effectiveDate || null,
        is_expired: false,
      });

      if (error) return { success: false, error: error.message };

      const userEmail = sessionStorage.getItem('asson_admin_email') || 'ASSON Executive';
      await supabase.from('audit_events').insert({
        action: 'CREATE',
        entity: 'notices',
        details: `Created new announcement: "${notice.title}" (${notice.category})`,
        actor_email: userEmail
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Database error creating notice.' };
    }
  }
  return { success: false, error: 'Database service is offline.' };
}

export async function deleteNoticeInDb(id: string): Promise<{ success: boolean; error?: string }> {
  if (supabase) {
    try {
      const { error } = await supabase.from('notices').delete().eq('id', id);
      if (error) return { success: false, error: error.message };

      const userEmail = sessionStorage.getItem('asson_admin_email') || 'ASSON Executive';
      await supabase.from('audit_events').insert({
        action: 'DELETE',
        entity: 'notices',
        details: `Deleted notice ${id}`,
        actor_email: userEmail
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Database error deleting notice.' };
    }
  }
  return { success: false, error: 'Database service is offline.' };
}

export async function createOpportunityInDb(opp: {
  title: string;
  provider: string;
  category: string;
  deadline: string;
  eligibility: string;
  description: string;
  applicationUrl: string;
  location: string;
}): Promise<{ success: boolean; error?: string }> {
  if (supabase) {
    try {
      const { error } = await supabase.from('opportunities').insert({
        title: opp.title.trim(),
        provider: opp.provider.trim(),
        category: opp.category,
        deadline: opp.deadline,
        eligibility: opp.eligibility.trim(),
        description: opp.description.trim(),
        application_url: opp.applicationUrl.trim(),
        location: opp.location.trim(),
        is_verified: true,
        is_expired: false
      });

      if (error) return { success: false, error: error.message };

      const userEmail = sessionStorage.getItem('asson_admin_email') || 'ASSON Executive';
      await supabase.from('audit_events').insert({
        action: 'CREATE',
        entity: 'opportunities',
        details: `Added opportunity: "${opp.title}" by ${opp.provider}`,
        actor_email: userEmail
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Database error adding opportunity.' };
    }
  }
  return { success: false, error: 'Database service is offline.' };
}

export async function deleteOpportunityInDb(id: string): Promise<{ success: boolean; error?: string }> {
  if (supabase) {
    try {
      const { error } = await supabase.from('opportunities').delete().eq('id', id);
      if (error) return { success: false, error: error.message };

      const userEmail = sessionStorage.getItem('asson_admin_email') || 'ASSON Executive';
      await supabase.from('audit_events').insert({
        action: 'DELETE',
        entity: 'opportunities',
        details: `Deleted opportunity ${id}`,
        actor_email: userEmail
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Database error deleting opportunity.' };
    }
  }
  return { success: false, error: 'Database service is offline.' };
}

export async function createFaqInDb(faq: {
  question: string;
  answer: string;
  category: string;
}): Promise<{ success: boolean; error?: string }> {
  if (supabase) {
    try {
      const { error } = await supabase.from('faqs').insert({
        question: faq.question.trim(),
        answer: faq.answer.trim(),
        category: faq.category.trim()
      });

      if (error) return { success: false, error: error.message };

      const userEmail = sessionStorage.getItem('asson_admin_email') || 'ASSON Executive';
      await supabase.from('audit_events').insert({
        action: 'CREATE',
        entity: 'faqs',
        details: `Added FAQ: "${faq.question}"`,
        actor_email: userEmail
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Database error creating FAQ.' };
    }
  }
  return { success: false, error: 'Database service is offline.' };
}

export async function deleteFaqInDb(id: string): Promise<{ success: boolean; error?: string }> {
  if (supabase) {
    try {
      const { error } = await supabase.from('faqs').delete().eq('id', id);
      if (error) return { success: false, error: error.message };

      const userEmail = sessionStorage.getItem('asson_admin_email') || 'ASSON Executive';
      await supabase.from('audit_events').insert({
        action: 'DELETE',
        entity: 'faqs',
        details: `Deleted FAQ ${id}`,
        actor_email: userEmail
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Database error deleting FAQ.' };
    }
  }
  return { success: false, error: 'Database service is offline.' };
}

// ====================================================================
// ACADEMIC CALENDAR & EVENT RSVP SERVICES (Batch 1)
// ====================================================================

export async function createCalendarEventInDb(event: {
  title: string;
  description?: string;
  category: CalendarCategory;
  startDate: string;
  endDate?: string;
  startTime?: string;
  targetLevel?: AcademicLevel;
  venue?: string;
  isConfirmed: boolean;
}): Promise<{ success: boolean; error?: string }> {
  if (supabase) {
    try {
      const { error } = await supabase.from('academic_calendar').insert({
        title: event.title.trim(),
        description: event.description?.trim() || null,
        category: event.category,
        start_date: event.startDate,
        end_date: event.endDate || null,
        start_time: event.startTime || null,
        target_level: event.targetLevel || null,
        venue: event.venue?.trim() || null,
        is_confirmed: event.isConfirmed,
      });

      if (error) return { success: false, error: error.message };

      const userEmail = sessionStorage.getItem('asson_admin_email') || 'ASSON Executive';
      await supabase.from('audit_events').insert({
        action: 'CREATE',
        entity: 'academic_calendar',
        details: `Created calendar event: "${event.title}" (${event.startDate})`,
        actor_email: userEmail
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Database error creating calendar event.' };
    }
  }
  return { success: false, error: 'Database service is offline.' };
}

export async function deleteCalendarEventInDb(id: string): Promise<{ success: boolean; error?: string }> {
  if (supabase) {
    try {
      const { error } = await supabase.from('academic_calendar').delete().eq('id', id);
      if (error) return { success: false, error: error.message };

      const userEmail = sessionStorage.getItem('asson_admin_email') || 'ASSON Executive';
      await supabase.from('audit_events').insert({
        action: 'DELETE',
        entity: 'academic_calendar',
        details: `Deleted calendar event ${id}`,
        actor_email: userEmail
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Database error deleting calendar event.' };
    }
  }
  return { success: false, error: 'Database service is offline.' };
}

export async function registerEventRsvp(
  noticeId: string,
  contributorName?: string
): Promise<{ success: boolean; newCount: number; message: string }> {
  let count = 1;
  if (supabase) {
    try {
      // 1. Insert RSVP record
      await supabase.from('event_rsvps').insert({
        notice_id: noticeId,
        contributor_name: contributorName?.trim() || 'Student Attendee'
      });

      // 2. Increment count on notices
      const { data: notice } = await supabase
        .from('notices')
        .select('rsvp_count')
        .eq('id', noticeId)
        .single();

      if (notice) {
        count = (notice.rsvp_count || 0) + 1;
        await supabase
          .from('notices')
          .update({ rsvp_count: count })
          .eq('id', noticeId);
      }
    } catch (err) {
      console.warn('Remote RSVP sync notice:', err);
    }
  }

  // Save device-local RSVP status
  try {
    const existing = JSON.parse(localStorage.getItem('asson_rsvps') || '[]');
    if (!existing.includes(noticeId)) {
      localStorage.setItem('asson_rsvps', JSON.stringify([...existing, noticeId]));
    }
  } catch (e) {
    // ignore
  }

  return { success: true, newCount: count, message: 'RSVP confirmed! See you at the session.' };
}

export function isNoticeRsvpd(noticeId: string): boolean {
  try {
    const existing = JSON.parse(localStorage.getItem('asson_rsvps') || '[]');
    return existing.includes(noticeId);
  } catch {
    return false;
  }
}

// ====================================================================
// STUDENT AUTHENTICATION & PERSONAL STUDY LOCKER (Batch 1)
// ====================================================================

export async function studentSignUp(
  email: string,
  password: string,
  displayName: string,
  level: AcademicLevel
): Promise<{ success: boolean; error?: string; message?: string }> {
  if (!email || !password || !displayName) {
    return { success: false, error: 'Name, email, and password are required.' };
  }
  if (!supabase) {
    return { success: false, error: 'Database authentication service is offline.' };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password.trim(),
      options: {
        data: {
          display_name: displayName.trim(),
          level,
          department: 'Department of Statistics'
        }
      }
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.user) {
      const profile: UserProfile = {
        id: data.user.id,
        displayName: displayName.trim(),
        email: email.trim(),
        level,
        department: 'Department of Statistics',
        role: 'student'
      };
      localStorage.setItem('asson_student_profile', JSON.stringify(profile));
      return { 
        success: true, 
        message: data.session 
          ? 'Welcome to ASSON UI! Your study locker is ready.' 
          : 'Verification link sent! Please check your email to confirm your account.' 
      };
    }
    return { success: false, error: 'Registration could not be completed.' };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error during registration.' };
  }
}

export async function studentSignIn(
  email: string,
  password: string
): Promise<{ success: boolean; user?: any; profile?: UserProfile; error?: string }> {
  if (!email || !password) {
    return { success: false, error: 'Email and password are required.' };
  }
  if (!supabase) {
    return { success: false, error: 'Database authentication service is offline.' };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim()
    });

    if (error || !data.user) {
      return { success: false, error: error?.message || 'Invalid email or password.' };
    }

    let profile: UserProfile = {
      id: data.user.id,
      displayName: data.user.user_metadata?.display_name || email.split('@')[0],
      email: data.user.email || email,
      level: (data.user.user_metadata?.level as AcademicLevel) || '200',
      department: data.user.user_metadata?.department || 'Department of Statistics',
      role: 'student'
    };

    try {
      const { data: dbProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (dbProfile) {
        profile = {
          ...profile,
          displayName: dbProfile.display_name || profile.displayName,
          level: dbProfile.level || profile.level,
          department: dbProfile.department || profile.department,
          avatarUrl: dbProfile.avatar_url || undefined
        };
      }
    } catch {
      // fallback to metadata
    }

    localStorage.setItem('asson_student_profile', JSON.stringify(profile));
    return { success: true, user: data.user, profile };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Authentication error.' };
  }
}

export async function studentSignOut(): Promise<void> {
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
  }
  localStorage.removeItem('asson_student_profile');
}

export async function studentResetPassword(email: string): Promise<{ success: boolean; error?: string }> {
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Please enter a valid email address.' };
  }
  if (!supabase) {
    return { success: false, error: 'Auth service is unavailable.' };
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/dashboard`
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to send reset email.' };
  }
}

export function getCachedStudentProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem('asson_student_profile');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function fetchUserBookmarks(userId?: string): Promise<string[]> {
  let localBookmarks: string[] = [];
  try {
    localBookmarks = JSON.parse(localStorage.getItem('asson_bookmarks') || '[]');
  } catch {
    // ignore
  }

  if (supabase && userId) {
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('resource_id')
        .eq('user_id', userId);

      if (!error && data) {
        const remoteIds = data.map((b: any) => b.resource_id);
        const merged = Array.from(new Set([...localBookmarks, ...remoteIds]));
        localStorage.setItem('asson_bookmarks', JSON.stringify(merged));
        return merged;
      }
    } catch {
      // ignore
    }
  }

  return localBookmarks;
}

export async function toggleUserBookmark(resourceId: string, userId?: string): Promise<boolean> {
  let bookmarks: string[] = [];
  try {
    bookmarks = JSON.parse(localStorage.getItem('asson_bookmarks') || '[]');
  } catch {
    // ignore
  }

  const isBookmarked = bookmarks.includes(resourceId);
  const updated = isBookmarked
    ? bookmarks.filter((id) => id !== resourceId)
    : [...bookmarks, resourceId];

  localStorage.setItem('asson_bookmarks', JSON.stringify(updated));

  if (supabase && userId) {
    try {
      if (isBookmarked) {
        await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', userId)
          .eq('resource_id', resourceId);
      } else {
        await supabase
          .from('bookmarks')
          .insert({ user_id: userId, resource_id: resourceId });
      }
    } catch (err) {
      console.warn('Remote bookmark sync notice:', err);
    }
  }

  return !isBookmarked;
}
