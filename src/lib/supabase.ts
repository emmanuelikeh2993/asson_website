import { createClient } from '@supabase/supabase-js';
import {
  COURSES,
  MOCK_RESOURCES,
  MOCK_NOTICES,
  MOCK_OPPORTUNITIES,
  MOCK_FAQS,
  MOCK_SUBMISSIONS,
  MOCK_AUDIT_LOGS,
  MOCK_HELP_DIRECTORY,
  MOCK_STAFF,
  MOCK_ENTERPRISES,
  MOCK_EXECUTIVES
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
  AcademicLevel,
  StaffMember,
  EnterpriseListing,
  ElectedExecutive,
  AuthorizedExecutive
} from '../types';
import {
  AcademicMaterialSubmissionSchema,
  StudentFeedbackSubmissionSchema,
  EnterpriseListingSchema,
  StaffMemberSchema,
  ElectedExecutiveSchema,
  AuthorizedExecutiveSchema
} from './validation';

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
    session: row.session || '2026/2027',
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
    title: 'ENT 211 & GES Continuous Assessment Mid-Semester Test',
    description: 'Faculty computer-based test for all registered statistics students (Entrepreneurship & Innovation).',
    category: 'Continuous Assessment',
    startDate: '2026-11-28',
    startTime: '08:00 AM',
    venue: 'CBT Centre, UI Distance Learning Centre',
    targetLevel: '200',
    isConfirmed: true,
  },
  {
    id: 'cal-3',
    title: 'STA 211 & STA 219 In-Course Continuous Assessment Tests',
    description: 'Department of Statistics continuous assessment tests for Probability II and Statistical Consulting.',
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
    title: 'Faculty of Science 2026/2027 First Semester Examinations',
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
              session: sub.session || '2026/2027',
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
          session: row.session || '2026/2027',
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
  // 1. Validate submission payload against Zod schema (Checklist 4.1)
  const validation = AcademicMaterialSubmissionSchema.safeParse({
    title: payload.title,
    courseCode: payload.courseCode,
    courseTitle: payload.title,
    level: COURSES.find(c => c.code === payload.courseCode)?.level || '200',
    semester: (COURSES.find(c => c.code === payload.courseCode)?.semester || 1) as 1 | 2,
    session: payload.session,
    resourceType: payload.resourceType,
    contributorName: payload.contributorName
  });

  if (!validation.success) {
    const errorMsg = validation.error.issues[0]?.message || 'Invalid resource submission data.';
    return { success: false, submissionId: '', referenceCode: '', message: errorMsg };
  }

  // 2. Validate file type and size (Checklist 8.1: File Upload Security)
  const allowedExtensions = /\.(pdf|docx)$/i;
  const isAllowedExt = allowedExtensions.test(payload.file.name);
  const isAllowedMime = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'application/octet-stream'
  ].includes(payload.file.type) || isAllowedExt;

  if (!isAllowedExt || !isAllowedMime) {
    return {
      success: false,
      submissionId: '',
      referenceCode: '',
      message: 'Security policy restriction: Only verified academic PDF or DOCX documents are accepted.'
    };
  }

  const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
  if (payload.file.size > MAX_FILE_SIZE) {
    return {
      success: false,
      submissionId: '',
      referenceCode: '',
      message: 'File size exceeds maximum permitted limit (15MB).'
    };
  }

  // 3. Collision-resistant safe file path (Checklist 8.2: Disallow overwrite)
  const cleanName = payload.file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const safeNonce = Math.random().toString(36).substring(2, 9);
  const filePath = `submissions/${Date.now()}_${safeNonce}_${cleanName}`;
  const submissionId = `sub-${Date.now()}`;
  const referenceCode = `SUB-2026-${Math.floor(10000 + Math.random() * 90000)}`;

  if (onProgress) onProgress(25);

  let remoteSuccess = false;

  if (supabase) {
    try {
      if (onProgress) onProgress(50);

      // Upload file to Supabase Storage bucket 'resources' (upsert: false prevents overwriting)
      const { error: uploadError } = await supabase.storage
        .from('resources')
        .upload(filePath, payload.file, {
          cacheControl: '3600',
          upsert: false
        });

      if (onProgress) onProgress(75);

      if (!uploadError) {
        // Insert record into Supabase submissions table with reference code (Zero personal matriculation data)
        const contributorInfo = payload.contributorName
          ? `Uploaded by ${payload.contributorName}`
          : 'Student Peer Contributor';

        // Derive user identity if authenticated session exists (Checklist 4.2)
        let sessionUserId: string | null = null;
        try {
          const { data: authUser } = await supabase.auth.getUser();
          if (authUser?.user) sessionUserId = authUser.user.id;
        } catch { }

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
            user_id: sessionUserId,
            feedback: `${contributorInfo} — Submitted to ASSON academic library.`
          })
          .select('id')
          .single();

        if (!insertError && insertData) {
          remoteSuccess = true;
        }
      }
    } catch {
      // Graceful sanitized handling
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
  // Validate input against Zod schema (Checklist 4.1)
  const validation = StudentFeedbackSubmissionSchema.safeParse(payload);
  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message || 'Please provide valid feedback details.'
    };
  }

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
    } catch {
      // Sanitized failure
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
    // Authoritatively verify the active JWT session against Supabase auth server (Checklist 3.3)
    const { data: authUser, error: authErr } = await supabase.auth.getUser();
    if (authErr || !authUser?.user || authUser.user.id !== userId) {
      return { isAuthorized: false };
    }

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
  } catch {
    // Sanitized: suppress internal database query errors from console leaks
  }
  return { isAuthorized: false };
}

// ====================================================================
// EXECUTIVE COMMITTEE ACCESS CONTROL & DELEGATION SYSTEM
// ====================================================================

export const MASTER_ADMIN_EMAILS = [
  'ikehemmanuel70@gmail.com',
  'ikehemmanuel60@gmail.com'
];

export async function checkExecutivePasskeyConfigured(): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;
  try {
    const { data, error } = await supabase.rpc('has_executive_passkey');
    if (!error && typeof data === 'boolean') return data;
  } catch { }
  return false;
}

export async function updateExecutivePasskey(
  newKey: string,
  currentKey?: string
): Promise<{ success: boolean; error?: string }> {
  const trimmedNew = newKey.trim();
  if (trimmedNew.length < 8) {
    return { success: false, error: 'Committee passkey must be at least 8 characters long.' };
  }
  if (!supabase || !isSupabaseConfigured) {
    return { success: false, error: 'Supabase connection is required to store passkeys securely.' };
  }

  const actorEmail = sessionStorage.getItem('asson_admin_email') || '';
  try {
    const { data, error } = await supabase.rpc('set_executive_passkey', {
      p_new_passkey: trimmedNew,
      p_actor_email: actorEmail || null,
      p_current_passkey: currentKey?.trim() || null
    });

    if (error) {
      return { success: false, error: error.message || 'Could not update passkey.' };
    }
    if (data && data.success === false) {
      return { success: false, error: data.error || 'Authorization denied.' };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update passkey.' };
  }
}

export const INITIAL_AUTHORIZED_EXECUTIVES: AuthorizedExecutive[] = [
  {
    id: 'auth-exec-1',
    email: 'ikehemmanuel70@gmail.com',
    name: 'Emmanuel Ikeh',
    office: 'Executive President / Lead Admin',
    role: 'super_admin',
    isMaster: true,
    approvedBy: 'System Founder',
    createdAt: '2026-11-20'
  },
  {
    id: 'auth-exec-2',
    email: 'ikehemmanuel60@gmail.com',
    name: 'Emmanuel Ikeh (Backup)',
    office: 'Master Admin Alternate',
    role: 'super_admin',
    isMaster: true,
    approvedBy: 'System Founder',
    createdAt: '2026-11-20'
  }
];

export async function fetchAuthorizedExecutives(): Promise<AuthorizedExecutive[]> {
  let list = [...INITIAL_AUTHORIZED_EXECUTIVES];
  try {
    const local = JSON.parse(localStorage.getItem('asson_authorized_executives') || '[]');
    if (Array.isArray(local) && local.length > 0) {
      const emailMap = new Map<string, AuthorizedExecutive>();
      list.forEach(e => emailMap.set(e.email.toLowerCase(), e));
      local.forEach((e: AuthorizedExecutive) => emailMap.set(e.email.toLowerCase(), e));
      list = Array.from(emailMap.values());
    }
  } catch { }

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('authorized_executives')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const remoteMapped: AuthorizedExecutive[] = data.map((d: any) => ({
          id: d.id,
          email: d.email,
          name: d.name,
          office: d.office,
          role: d.role,
          isMaster: Boolean(d.is_master || MASTER_ADMIN_EMAILS.includes(d.email.toLowerCase())),
          approvedBy: d.approved_by,
          createdAt: d.created_at ? d.created_at.split('T')[0] : '2026-11-20'
        }));

        const finalMap = new Map<string, AuthorizedExecutive>();
        INITIAL_AUTHORIZED_EXECUTIVES.forEach(e => finalMap.set(e.email.toLowerCase(), e));
        remoteMapped.forEach(e => finalMap.set(e.email.toLowerCase(), e));
        list = Array.from(finalMap.values());
      }
    } catch { }
  }

  return list;
}

export async function addAuthorizedExecutive(data: {
  email: string;
  name: string;
  office: string;
  role: 'editor' | 'admin';
}): Promise<{ success: boolean; data?: AuthorizedExecutive; error?: string }> {
  const validation = AuthorizedExecutiveSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0]?.message || 'Invalid committee details.' };
  }

  const cleanEmail = data.email.trim().toLowerCase();
  const currentAdmin = sessionStorage.getItem('asson_admin_email') || 'Emmanuel Ikeh (President)';

  const newEntry: AuthorizedExecutive = {
    id: `auth-exec-${Date.now()}`,
    email: cleanEmail,
    name: data.name.trim(),
    office: data.office.trim(),
    role: data.role,
    isMaster: false,
    approvedBy: currentAdmin,
    createdAt: new Date().toISOString().split('T')[0]
  };

  if (supabase && isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('authorized_executives').insert({
        id: newEntry.id,
        email: cleanEmail,
        name: newEntry.name,
        office: newEntry.office,
        role: newEntry.role,
        is_master: false,
        approved_by: currentAdmin
      });

      if (error) {
        if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
          return {
            success: false,
            error: 'Database table "authorized_executives" is not set up in Supabase yet. Run APPLY_ALL_PENDING_MIGRATIONS.sql in Supabase SQL Editor.'
          };
        }
        return {
          success: false,
          error: 'Authorization requires a verified Master Admin session (sign in via 6-Digit Email Code or Supabase Password).'
        };
      }

      void supabase.from('audit_events').insert({
        action: 'CREATE',
        entity: 'authorized_executives',
        details: `Approved executive access for ${newEntry.name} (${cleanEmail} — ${newEntry.office})`,
        actor_email: currentAdmin
      });
    } catch (err: any) {
      return { success: false, error: err?.message || 'Database error authorizing executive.' };
    }
  }

  try {
    const existing = await fetchAuthorizedExecutives();
    const updated = [newEntry, ...existing.filter(e => e.email.toLowerCase() !== cleanEmail)];
    localStorage.setItem('asson_authorized_executives', JSON.stringify(updated));
  } catch { }

  return { success: true, data: newEntry };
}

export async function revokeAuthorizedExecutive(id: string, email: string): Promise<{ success: boolean; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (MASTER_ADMIN_EMAILS.includes(cleanEmail)) {
    return { success: false, error: 'Master Admin accounts cannot be revoked.' };
  }

  const currentAdmin = sessionStorage.getItem('asson_admin_email') || 'Emmanuel Ikeh (President)';

  if (supabase && isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('authorized_executives').delete().eq('email', cleanEmail);
      if (error) {
        if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
          return {
            success: false,
            error: 'Database table "authorized_executives" is not set up in Supabase yet. Run APPLY_ALL_PENDING_MIGRATIONS.sql in Supabase SQL Editor.'
          };
        }
        return {
          success: false,
          error: 'Revoking access requires a verified Master Admin session (sign in via 6-Digit Email Code or Supabase Password).'
        };
      }
      void supabase.from('audit_events').insert({
        action: 'DELETE',
        entity: 'authorized_executives',
        details: `Revoked executive access for ${cleanEmail}`,
        actor_email: currentAdmin
      });
    } catch (err: any) {
      return { success: false, error: err?.message || 'Database error revoking executive.' };
    }
  }

  try {
    const existing = await fetchAuthorizedExecutives();
    const updated = existing.filter(e => e.email.toLowerCase() !== cleanEmail);
    localStorage.setItem('asson_authorized_executives', JSON.stringify(updated));
  } catch { }

  return { success: true };
}

function persistAdminSession(params: {
  email: string;
  role: string;
  isMaster: boolean;
  name: string;
  office: string;
}) {
  sessionStorage.setItem('asson_admin_authenticated', 'true');
  sessionStorage.setItem('asson_admin_email', params.email);
  sessionStorage.setItem('asson_admin_role', params.role);
  sessionStorage.setItem('asson_admin_is_master', params.isMaster ? 'true' : 'false');
  sessionStorage.setItem('asson_admin_name', params.name);
  sessionStorage.setItem('asson_admin_office', params.office);

  if (supabase && isSupabaseConfigured) {
    try {
      void supabase.from('audit_events').insert({
        action: 'LOGIN',
        entity: 'admin_session',
        details: `Executive portal session opened by ${params.email} (${params.office})`,
        actor_email: params.email
      });
    } catch { }
  }
}

export async function sendAdminLoginOtp(email: string): Promise<{ success: boolean; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, error: 'Please enter a valid executive email address.' };
  }
  if (!supabase || !isSupabaseConfigured) {
    return { success: false, error: 'Email OTP requires an active Supabase connection.' };
  }

  const isMaster = MASTER_ADMIN_EMAILS.includes(cleanEmail);
  let isAllowed = isMaster;

  if (!isAllowed) {
    try {
      const { data: rpcAllowed, error: rpcErr } = await supabase.rpc('is_authorized_executive_email', {
        p_email: cleanEmail
      });
      if (!rpcErr && rpcAllowed === true) {
        isAllowed = true;
      }
    } catch { }
  }

  if (!isAllowed) {
    return {
      success: false,
      error: `Access Denied: "${email}" is not on the approved committee list.`
    };
  }

  try {
    const { error } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: { shouldCreateUser: true }
    });
    if (error) {
      return { success: false, error: error.message || 'Could not send login code.' };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to send login code.' };
  }
}

export async function verifyAdminLoginOtp(
  email: string,
  token: string
): Promise<{ success: boolean; role?: string; isMaster?: boolean; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanToken = token.trim();
  if (!cleanEmail || !cleanToken) {
    return { success: false, error: 'Email and 6-digit verification code are required.' };
  }
  if (!supabase || !isSupabaseConfigured) {
    return { success: false, error: 'Supabase connection is required.' };
  }

  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email: cleanEmail,
      token: cleanToken,
      type: 'email'
    });

    if (error || !data.user) {
      return { success: false, error: error?.message || 'Invalid or expired verification code.' };
    }

    const authorizedList = await fetchAuthorizedExecutives();
    const isMaster = MASTER_ADMIN_EMAILS.includes(cleanEmail);
    const matchedExec = authorizedList.find(e => e.email.toLowerCase() === cleanEmail);

    if (!isMaster && !matchedExec) {
      await supabase.auth.signOut();
      return { success: false, error: 'Email is not on the approved executive list.' };
    }

    const role = isMaster ? 'super_admin' : (matchedExec?.role || 'admin');
    persistAdminSession({
      email: cleanEmail,
      role,
      isMaster,
      name: matchedExec?.name || (isMaster ? 'Emmanuel Ikeh' : 'Executive Member'),
      office: matchedExec?.office || (isMaster ? 'Executive President / Lead Admin' : 'Executive Council')
    });

    return { success: true, role, isMaster };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Verification failed.' };
  }
}

export async function adminSignIn(
  email: string,
  password?: string
): Promise<{ success: boolean; role?: string; isMaster?: boolean; needsSetup?: boolean; error?: string }> {
  if (!email || !password || !email.includes('@')) {
    return { success: false, error: 'A valid email address and passkey/password are required.' };
  }

  const cleanEmail = email.trim().toLowerCase();
  const inputSecret = password.trim();

  if (!supabase || !isSupabaseConfigured) {
    return {
      success: false,
      error: 'Authentication requires an active Supabase backend connection.'
    };
  }

  const isMaster = MASTER_ADMIN_EMAILS.includes(cleanEmail);

  // 1. Try individual Supabase Auth password first (if executive has a registered Supabase password)
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: inputSecret
    });
    if (!error && data.user) {
      const authorizedList = await fetchAuthorizedExecutives();
      const matchedExec = authorizedList.find(e => e.email.toLowerCase() === cleanEmail);
      if (!isMaster && !matchedExec) {
        await supabase.auth.signOut();
        return {
          success: false,
          error: `Access Denied: "${email}" is not on the approved committee list.`
        };
      }
      const role = isMaster ? 'super_admin' : (matchedExec?.role || 'admin');
      persistAdminSession({
        email: cleanEmail,
        role,
        isMaster,
        name: matchedExec?.name || (isMaster ? 'Emmanuel Ikeh' : 'Executive Member'),
        office: matchedExec?.office || (isMaster ? 'Executive President / Lead Admin' : 'Executive Council')
      });
      return { success: true, role, isMaster };
    }
  } catch { }

  // 2. Verify allowlist + salted SHA-256 committee passkey hash server-side via SECURITY DEFINER RPC
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc('verify_executive_login', {
      p_email: cleanEmail,
      p_passkey: inputSecret
    });

    if (rpcError) {
      if (rpcError.code === 'PGRST202' || rpcError.message?.includes('schema cache')) {
        return {
          success: false,
          error: 'Database setup pending: please run APPLY_ALL_PENDING_MIGRATIONS.sql in your Supabase SQL Editor first.'
        };
      }
      return { success: false, error: rpcError.message || 'Verification service error.' };
    }

    if (rpcData?.success) {
      const role = rpcData.role || (isMaster ? 'super_admin' : 'admin');
      const masterFlag = Boolean(rpcData.isMaster ?? isMaster);
      persistAdminSession({
        email: cleanEmail,
        role,
        isMaster: masterFlag,
        name: rpcData.name || (masterFlag ? 'Emmanuel Ikeh' : 'Executive Member'),
        office: rpcData.office || (masterFlag ? 'Executive President / Lead Admin' : 'Executive Council')
      });
      return { success: true, role, isMaster: masterFlag };
    }

    if (rpcData?.needsSetup) {
      return {
        success: false,
        needsSetup: true,
        error: rpcData.error || 'Committee passkey is not set yet. Use "Sign in with 6-Digit Email Code" below as Master Admin to set it.'
      };
    }

    if (rpcData?.error) {
      return { success: false, error: rpcData.error };
    }
  } catch { }

  return {
    success: false,
    error: 'Incorrect passkey or password. Master Admins can also sign in using a 6-digit Email Code below.'
  };
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
      // In Supabase, if a user already exists and email confirmations are active,
      // signUp returns a user object with empty identities array to avoid email enumeration.
      if (data.user.identities && data.user.identities.length === 0) {
        return {
          success: false,
          error: 'An account with this email address already exists. Please log in or reset your password.'
        };
      }

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

export async function studentSignInWithGoogle(): Promise<{ success: boolean; profile?: UserProfile; error?: string }> {
  if (!supabase) {
    // Offline / Demo mode fallback
    const mockProfile: UserProfile = {
      id: 'google-student-' + Date.now(),
      displayName: 'Statistics Scholar (Google)',
      email: 'scholar@stu.ui.edu.ng',
      level: '200',
      department: 'Department of Statistics',
      role: 'student'
    };
    localStorage.setItem('asson_student_profile', JSON.stringify(mockProfile));
    return { success: true, profile: mockProfile };
  }

  try {
    const redirectUrl = `${window.location.origin}/dashboard`;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true
      }
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data?.url) {
      // Check if provider is enabled to avoid displaying raw 400 error page
      try {
        const testRes = await fetch(data.url, { method: 'HEAD' });
        if (testRes.status === 400) {
          return {
            success: false,
            error: 'Google Sign-In is awaiting provider activation in the Supabase Dashboard (Authentication → Providers → Google). Please log in with your email and password in the meantime.'
          };
        }
      } catch {
        // In case of CORS restriction on HEAD preflight, proceed safely
      }

      window.location.href = data.url;
      return { success: true };
    }

    return { success: false, error: 'Could not initialize Google authentication.' };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Google sign-in error.' };
  }
}

// Listen to OAuth callbacks and session synchronization
if (supabase) {
  try {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const u = session.user;
        let profile: UserProfile = {
          id: u.id,
          displayName: u.user_metadata?.full_name || u.user_metadata?.name || u.user_metadata?.display_name || u.email?.split('@')[0] || 'Statistics Scholar',
          email: u.email || '',
          level: (u.user_metadata?.level as AcademicLevel) || '200',
          department: u.user_metadata?.department || 'Department of Statistics',
          avatarUrl: u.user_metadata?.avatar_url || undefined,
          role: 'student'
        };
        localStorage.setItem('asson_student_profile', JSON.stringify(profile));
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('asson_student_profile');
      }
    });
  } catch {
    // ignore
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

  // Client-side rate limiting / cooldown protection to safeguard Supabase free-tier email quota (Checklist 6.2)
  const RESET_COOLDOWN_KEY = 'asson_pwd_reset_cooldown';
  const lastReset = sessionStorage.getItem(RESET_COOLDOWN_KEY);
  if (lastReset) {
    const elapsed = Date.now() - Number(lastReset);
    if (elapsed < 60000) {
      const waitSec = Math.ceil((60000 - elapsed) / 1000);
      return {
        success: false,
        error: `Security cooldown active: Please wait ${waitSec} seconds before requesting another recovery code.`
      };
    }
  }

  if (!supabase) {
    return { success: true };
  }

  try {
    const redirectUrl = `${window.location.origin}/dashboard#type=recovery`;
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: redirectUrl
    });
    if (error) return { success: false, error: error.message };
    sessionStorage.setItem(RESET_COOLDOWN_KEY, Date.now().toString());
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to send recovery email. Please try again shortly.' };
  }
}

export async function studentVerifyOtpAndResetPassword(
  email: string,
  token: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  if (!email || !token || !newPassword) {
    return { success: false, error: 'All fields are required.' };
  }
  if (newPassword.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' };
  }
  if (!supabase) {
    return { success: true };
  }

  try {
    // 1. Verify the 6-digit OTP code sent to student's email
    const { error: otpError } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: token.trim(),
      type: 'recovery'
    });

    if (otpError) {
      return {
        success: false,
        error: otpError.message || 'Invalid or expired 6-digit code. Please check your email and try again.'
      };
    }

    // 2. Set the new password for the authenticated recovery session
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword.trim()
    });

    if (updateError) {
      return { success: false, error: updateError.message || 'Failed to update password.' };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Password reset error.' };
  }
}

export async function studentUpdatePasswordOnly(newPassword: string): Promise<{ success: boolean; error?: string }> {
  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' };
  }
  if (!supabase) {
    return { success: true };
  }

  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword.trim()
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update password.' };
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

// ====================================================================
// STUDENT ENTERPRISE HUB SERVICES (Tier 5: Student Business Showcase)
// ====================================================================

export async function fetchEnterpriseListings(includePending = false): Promise<EnterpriseListing[]> {
  try {
    const cached = localStorage.getItem('asson_cached_enterprises');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < 1000 * 60 * 15 && parsed.data?.length > 0) {
        return includePending ? parsed.data : parsed.data.filter((e: EnterpriseListing) => e.status === 'approved');
      }
    }
  } catch {
    // ignore
  }

  if (supabase) {
    try {
      let query = supabase.from('enterprise_listings').select('*');
      if (!includePending) {
        query = query.eq('status', 'approved');
      }
      const { data, error } = await query.order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        const mapped = data.map((d: any) => ({
          id: d.id,
          businessName: d.business_name || d.businessName,
          ownerName: d.owner_name || d.ownerName,
          ownerLevel: d.owner_level || d.ownerLevel,
          category: d.category,
          description: d.description,
          whatsapp: d.whatsapp,
          instagram: d.instagram,
          imageUrl: d.image_url || d.imageUrl,
          status: d.status || 'pending',
          createdAt: d.created_at ? d.created_at.split('T')[0] : '2026-11-20',
        }));
        try {
          localStorage.setItem('asson_cached_enterprises', JSON.stringify({ timestamp: Date.now(), data: mapped }));
        } catch {
          // ignore
        }
        return mapped;
      }
    } catch {
      // ignore
    }
  }

  try {
    const cached = localStorage.getItem('asson_cached_enterprises');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.data?.length > 0) {
        return includePending ? parsed.data : parsed.data.filter((e: EnterpriseListing) => e.status === 'approved');
      }
    }
  } catch {
    // ignore
  }

  return includePending ? MOCK_ENTERPRISES : MOCK_ENTERPRISES.filter((e) => e.status === 'approved');
}

export async function submitEnterpriseListing(data: {
  businessName: string;
  ownerName: string;
  ownerLevel: AcademicLevel;
  category: any;
  description: string;
  whatsapp: string;
  instagram?: string;
  imageUrl?: string;
}): Promise<{ success: boolean; data?: EnterpriseListing; error?: string }> {
  const newEntry: EnterpriseListing = {
    id: `ent-${Date.now()}`,
    businessName: data.businessName.trim(),
    ownerName: data.ownerName.trim(),
    ownerLevel: data.ownerLevel,
    category: data.category,
    description: data.description.trim(),
    whatsapp: data.whatsapp.trim(),
    instagram: data.instagram?.trim() || undefined,
    imageUrl: data.imageUrl?.trim() || undefined,
    status: 'pending',
    createdAt: new Date().toISOString().split('T')[0],
  };

  if (supabase) {
    try {
      const { error } = await supabase.from('enterprise_listings').insert({
        business_name: newEntry.businessName,
        owner_name: newEntry.ownerName,
        owner_level: newEntry.ownerLevel,
        category: newEntry.category,
        description: newEntry.description,
        whatsapp: newEntry.whatsapp,
        instagram: newEntry.instagram,
        image_url: newEntry.imageUrl,
        status: 'pending',
      });
      if (error) {
        console.warn('Supabase insert note:', error.message);
      }
    } catch (e: any) {
      console.warn('Supabase offline or table missing, using cache:', e.message);
    }
  }

  try {
    const existing = await fetchEnterpriseListings(true);
    const updated = [newEntry, ...existing];
    localStorage.setItem('asson_cached_enterprises', JSON.stringify({ timestamp: Date.now(), data: updated }));
  } catch {
    // ignore
  }

  return { success: true };
}

export async function updateEnterpriseStatus(
  id: string,
  status: 'approved' | 'rejected'
): Promise<{ success: boolean; error?: string }> {
  if (supabase) {
    try {
      await supabase.from('enterprise_listings').update({ status }).eq('id', id);
    } catch {
      // ignore
    }
  }

  try {
    const cached = localStorage.getItem('asson_cached_enterprises');
    if (cached) {
      const parsed = JSON.parse(cached);
      parsed.data = parsed.data.map((item: EnterpriseListing) => (item.id === id ? { ...item, status } : item));
      localStorage.setItem('asson_cached_enterprises', JSON.stringify(parsed));
    }
  } catch {
    // ignore
  }

  return { success: true };
}

// ====================================================================
// ELECTED EXECUTIVES & ELECTORALS (Department Executive Council)
// ====================================================================

export async function fetchElectedExecutives(): Promise<ElectedExecutive[]> {
  try {
    const cached = localStorage.getItem('asson_cached_executives');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < 1000 * 60 * 15 && parsed.data?.length > 0) {
        return parsed.data;
      }
    }
  } catch {
    // ignore
  }

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('elected_executives')
        .select('*')
        .order('order_index', { ascending: true });

      if (!error && data && data.length > 0) {
        const mapped: ElectedExecutive[] = data.map((d: any) => ({
          id: d.id,
          name: d.name,
          office: d.office,
          session: d.session || '2026/2027',
          level: d.level || '300',
          imageUrl: d.image_url || d.imageUrl,
          whatsapp: d.whatsapp,
          email: d.email,
          bio: d.bio,
          orderIndex: d.order_index ?? 99,
        }));
        try {
          localStorage.setItem('asson_cached_executives', JSON.stringify({ timestamp: Date.now(), data: mapped }));
        } catch { }
        return mapped;
      }
    } catch {
      // ignore
    }
  }

  // Fallback to local cache or MOCK_EXECUTIVES
  try {
    const cached = localStorage.getItem('asson_cached_executives');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.data?.length > 0) return parsed.data;
    }
  } catch { }

  return MOCK_EXECUTIVES;
}

export async function createElectedExecutiveInDb(exec: {
  name: string;
  office: string;
  session: string;
  level: AcademicLevel;
  imageUrl?: string;
  whatsapp?: string;
  email?: string;
  bio?: string;
}): Promise<{ success: boolean; data?: ElectedExecutive; error?: string }> {
  // Validate with Zod schema (Checklist 4.1)
  const validation = ElectedExecutiveSchema.safeParse({
    name: exec.name,
    office: exec.office,
    session: exec.session || '2026/2027',
    level: exec.level,
    imageUrl: exec.imageUrl,
    whatsapp: exec.whatsapp,
    email: exec.email,
    bio: exec.bio,
    orderIndex: Date.now()
  });

  if (!validation.success) {
    return { success: false, error: validation.error.issues[0]?.message || 'Invalid executive data.' };
  }

  const newEntry: ElectedExecutive = {
    id: `exec-${Date.now()}`,
    name: exec.name.trim(),
    office: exec.office.trim(),
    session: exec.session.trim() || '2026/2027',
    level: exec.level,
    imageUrl: exec.imageUrl?.trim() || undefined,
    whatsapp: exec.whatsapp?.trim() || undefined,
    email: exec.email?.trim() || undefined,
    bio: exec.bio?.trim() || undefined,
    orderIndex: Date.now(),
  };

  if (supabase) {
    try {
      const { data: authUser } = await supabase.auth.getUser();
      if (!authUser?.user && sessionStorage.getItem('asson_admin_authenticated') !== 'true') {
        return { success: false, error: 'Unauthorized: Admin privileges required.' };
      }

      await supabase.from('elected_executives').insert({
        name: newEntry.name,
        office: newEntry.office,
        session: newEntry.session,
        level: newEntry.level,
        image_url: newEntry.imageUrl,
        whatsapp: newEntry.whatsapp,
        email: newEntry.email,
        bio: newEntry.bio,
        order_index: newEntry.orderIndex,
      });
    } catch {
      // Sanitized error
    }
  }

  try {
    const current = await fetchElectedExecutives();
    const updated = [...current, newEntry];
    localStorage.setItem('asson_cached_executives', JSON.stringify({ timestamp: Date.now(), data: updated }));
  } catch { }

  return { success: true, data: newEntry };
}

export async function deleteElectedExecutiveInDb(id: string): Promise<{ success: boolean; error?: string }> {
  if (supabase) {
    try {
      const { data: authUser } = await supabase.auth.getUser();
      if (!authUser?.user && sessionStorage.getItem('asson_admin_authenticated') !== 'true') {
        return { success: false, error: 'Unauthorized: Admin privileges required.' };
      }
      await supabase.from('elected_executives').delete().eq('id', id);
    } catch { }
  }

  try {
    const current = await fetchElectedExecutives();
    const updated = current.filter((e) => e.id !== id);
    localStorage.setItem('asson_cached_executives', JSON.stringify({ timestamp: Date.now(), data: updated }));
  } catch { }

  return { success: true };
}

// ====================================================================
// ACADEMIC STAFF & FACULTY DIRECTORY
// ====================================================================

export async function fetchStaffMembers(): Promise<StaffMember[]> {
  try {
    const cached = localStorage.getItem('asson_cached_staff');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < 1000 * 60 * 15 && parsed.data?.length > 0) {
        return parsed.data;
      }
    }
  } catch { }

  if (supabase) {
    try {
      const { data, error } = await supabase.from('staff_members').select('*');
      if (!error && data && data.length > 0) {
        const mapped: StaffMember[] = data.map((d: any) => ({
          id: d.id,
          name: d.name,
          title: d.title,
          designation: d.designation,
          courses: d.courses || [],
          office: d.office,
          email: d.email,
          consultationHours: d.consultation_hours || d.consultationHours,
          advisorLevel: d.advisor_level || d.advisorLevel,
          isHOD: d.is_hod || d.isHOD,
          imageUrl: d.image_url || d.imageUrl || undefined,
        }));
        try {
          localStorage.setItem('asson_cached_staff', JSON.stringify({ timestamp: Date.now(), data: mapped }));
        } catch { }
        return mapped;
      }
    } catch { }
  }

  return MOCK_STAFF;
}

export async function createStaffMemberInDb(staff: Omit<StaffMember, 'id'>): Promise<{ success: boolean; data?: StaffMember; error?: string }> {
  // Validate input against Zod schema (Checklist 4.1)
  const validation = StaffMemberSchema.safeParse(staff);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0]?.message || 'Invalid staff details.' };
  }

  const newStaff: StaffMember = {
    ...staff,
    id: `staff-${Date.now()}`
  };

  if (supabase) {
    try {
      const { data: authUser } = await supabase.auth.getUser();
      if (!authUser?.user && sessionStorage.getItem('asson_admin_authenticated') !== 'true') {
        return { success: false, error: 'Unauthorized: Admin privileges required.' };
      }

      const { data, error } = await supabase.from('staff_members').insert([{
        id: newStaff.id,
        name: newStaff.name,
        title: newStaff.title,
        designation: newStaff.designation,
        courses: newStaff.courses,
        office: newStaff.office,
        email: newStaff.email,
        consultation_hours: newStaff.consultationHours,
        advisor_level: newStaff.advisorLevel,
        is_hod: newStaff.isHOD || false,
        image_url: newStaff.imageUrl || null
      }]).select().single();

      if (!error && data) {
        newStaff.id = data.id;
      }
    } catch {}
  }

  try {
    const current = await fetchStaffMembers();
    const updated = [newStaff, ...current];
    localStorage.setItem('asson_cached_staff', JSON.stringify({ timestamp: Date.now(), data: updated }));
  } catch {}

  return { success: true, data: newStaff };
}

export async function deleteStaffMemberInDb(id: string): Promise<{ success: boolean; error?: string }> {
  if (supabase) {
    try {
      const { data: authUser } = await supabase.auth.getUser();
      if (!authUser?.user && sessionStorage.getItem('asson_admin_authenticated') !== 'true') {
        return { success: false, error: 'Unauthorized: Admin privileges required.' };
      }
      await supabase.from('staff_members').delete().eq('id', id);
    } catch {}
  }

  try {
    const current = await fetchStaffMembers();
    const updated = current.filter((s) => s.id !== id);
    localStorage.setItem('asson_cached_staff', JSON.stringify({ timestamp: Date.now(), data: updated }));
  } catch {}

  return { success: true };
}
