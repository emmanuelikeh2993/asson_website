import { createClient, type User } from '@supabase/supabase-js';
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
  EnterpriseCategory,
  ElectedExecutive,
  AuthorizedExecutive,
  NoticeCategory,
  OpportunityCategory,
  HelpCategory,
  VerificationStatus,
  SubmissionStatus
} from '../types';
import {
  AcademicMaterialSubmissionSchema,
  StudentFeedbackSubmissionSchema,
  EnterpriseListingSchema,
  NoticeSchema,
  OpportunitySchema,
  FaqSchema,
  CalendarEventSchema,
  ContentReportSchema,
  StaffMemberSchema,
  ElectedExecutiveSchema,
  AuthorizedExecutiveSchema,
  sanitizeSafeHttpUrl
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

if (!isSupabaseConfigured && import.meta.env.PROD) {
  throw new Error('Critical configuration error: Required Supabase environment variables are missing.');
}

function logDevWarning(message: string, err?: unknown) {
  if (import.meta.env.DEV) {
    console.warn(message, err);
  }
}

function getErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ====================================================================
// DATABASE ROW TYPES & DATA MAPPERS (Snake_Case to Frontend CamelCase)
// ====================================================================

interface DbResourceRow {
  id: string;
  title: string;
  course_code?: string | null;
  course_title?: string | null;
  level?: AcademicLevel | null;
  semester?: number | null;
  session?: string | null;
  type?: ResourceType | null;
  file_type?: string | null;
  file_size_bytes?: number | string | null;
  file_path?: string | null;
  verification_status?: VerificationStatus | null;
  last_checked_date?: string | null;
  contributor_name?: string | null;
  description?: string | null;
  downloads_count?: number | null;
}

interface DbCourseRow {
  code: string;
  title: string;
  level: AcademicLevel;
  semester: number;
  units?: number | null;
}

interface DbNoticeRow {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: NoticeCategory;
  is_urgent?: boolean | null;
  published_date?: string | null;
  effective_date?: string | null;
  deadline?: string | null;
  issuer?: string | null;
  is_expired?: boolean | null;
  event_date?: string | null;
  event_time?: string | null;
  venue?: string | null;
  rsvp_url?: string | null;
  has_in_app_rsvp?: boolean | null;
  rsvp_count?: number | string | null;
}

interface DbCalendarEventRow {
  id: string;
  title: string;
  description?: string | null;
  category?: CalendarCategory | string | null;
  start_date?: string | null;
  end_date?: string | null;
  start_time?: string | null;
  target_level?: AcademicLevel | string | null;
  venue?: string | null;
  is_confirmed?: boolean | null;
  notice_id?: string | null;
}

interface DbOpportunityRow {
  id: string;
  title: string;
  provider: string;
  category: OpportunityCategory;
  deadline?: string | null;
  eligibility?: string | null;
  description?: string | null;
  application_url?: string | null;
  location?: string | null;
  is_verified?: boolean | null;
  is_expired?: boolean | null;
  created_at?: string | null;
}

interface DbFaqRow {
  id: string;
  question: string;
  answer: string;
  category?: FAQItem['category'] | null;
}

interface DbSubmissionRow {
  id: string;
  resource_title?: string | null;
  title?: string | null;
  course_code: string;
  resource_type?: ResourceType | null;
  type?: ResourceType | null;
  session?: string | null;
  created_at?: string | null;
  status?: SubmissionStatus | null;
  feedback?: string | null;
  file_size_bytes?: number | string | null;
  file_path?: string | null;
}

interface DbAuditLogRow {
  id: string;
  actor_email?: string | null;
  user_name?: string | null;
  action: AuditLog['action'];
  entity: string;
  details?: string | null;
  created_at: string;
}

interface DbHelpDirectoryRow {
  id: string;
  category: HelpCategory;
  title: string;
  office_or_person: string;
  description: string;
  contact_email?: string | null;
  contact_phone?: string | null;
  location?: string | null;
  availability?: string | null;
  last_verified_date?: string | null;
  order_index?: number | null;
}

interface DbAuthorizedExecutiveRow {
  id: string;
  email: string;
  name: string;
  office: string;
  role: AuthorizedExecutive['role'];
  is_master?: boolean | null;
  approved_by?: string | null;
  created_at?: string | null;
}

interface DbEnterpriseRow {
  id: string;
  business_name?: string;
  businessName?: string;
  owner_name?: string;
  ownerName?: string;
  owner_level?: AcademicLevel;
  ownerLevel?: AcademicLevel;
  category: EnterpriseCategory;
  description: string;
  whatsapp?: string;
  contact_phone?: string;
  instagram?: string;
  instagram_handle?: string;
  image_url?: string | null;
  imageUrl?: string | null;
  status?: string | null;
  created_at?: string | null;
}

interface DbElectedExecutiveRow {
  id: string;
  name: string;
  office: string;
  session?: string | null;
  level?: AcademicLevel | null;
  image_url?: string | null;
  imageUrl?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  bio?: string | null;
  order_index?: number | null;
}

interface DbStaffRow {
  id: string;
  name: string;
  title: string;
  designation: string;
  courses?: string[] | null;
  office: string;
  email?: string | null;
  consultation_hours?: string | null;
  consultationHours?: string | null;
  advisor_level?: AcademicLevel | null;
  advisorLevel?: AcademicLevel | null;
  is_hod?: boolean | null;
  isHOD?: boolean | null;
  image_url?: string | null;
  imageUrl?: string | null;
}

function mapDbResourceToModel(row: DbResourceRow): AcademicResource {
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

function mapDbCourseToModel(row: DbCourseRow): Course {
  return {
    code: row.code,
    title: row.title,
    level: row.level,
    semester: row.semester as 1 | 2,
    units: row.units || 3,
  };
}

function mapDbNoticeToModel(row: DbNoticeRow): Notice {
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

export function mapDbCalendarEventToModel(row: DbCalendarEventRow): CalendarEvent {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    category: (row.category as CalendarCategory) || 'Academic Milestone',
    startDate: row.start_date ? new Date(row.start_date).toISOString().split('T')[0] : '2026-11-20',
    endDate: row.end_date ? new Date(row.end_date).toISOString().split('T')[0] : undefined,
    startTime: row.start_time || undefined,
    targetLevel: (row.target_level as AcademicLevel) || undefined,
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

function mapDbOpportunityToModel(row: DbOpportunityRow): Opportunity {
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

function mapDbFaqToModel(row: DbFaqRow): FAQItem {
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
      logDevWarning('Courses fetch error from Supabase, serving cached seed:', err);
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
      logDevWarning('Resources fetch error from Supabase, serving cached seed:', err);
    }
  }

  // Only verified approved resources from the curated `resources` catalog are served publicly.
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
      logDevWarning('Notices fetch error from Supabase:', err);
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
      logDevWarning('Opportunities fetch error from Supabase:', err);
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
      logDevWarning('Calendar fetch error from Supabase, serving verified academic schedule:', err);
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
      logDevWarning('FAQs fetch error from Supabase, serving cached seed:', err);
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
        list = (data as DbSubmissionRow[]).map((row) => ({
          id: row.id,
          resourceTitle: row.resource_title || row.title || 'Untitled Material',
          courseCode: row.course_code,
          resourceType: row.resource_type || row.type || 'Past Question',
          session: row.session || '2026/2027',
          submittedAt: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : '2026-11-04',
          status: row.status || 'Under Review',
          feedback: row.feedback || undefined,
          fileSizeBytes: Number(row.file_size_bytes) || 1500000,
          filePath: row.file_path || undefined,
        }));
      }
    } catch (err) {
      logDevWarning('Submissions fetch error from Supabase:', err);
    }
  }

  // Merge any locally tracked submission receipts submitted on this device
  try {
    const local = JSON.parse(localStorage.getItem('asson_submissions') || '[]') as StudentSubmission[];
    if (Array.isArray(local) && local.length > 0) {
      const existingIds = new Set(list.map(s => s.id));
      const newItems = local.filter((s) => !existingIds.has(s.id));
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

async function hasValidDocumentMagicBytes(file: File): Promise<boolean> {
  try {
    const header = new Uint8Array(await file.slice(0, 5).arrayBuffer());
    const lowerName = file.name.toLowerCase();
    if (lowerName.endsWith('.pdf')) {
      return (
        header[0] === 0x25 &&
        header[1] === 0x50 &&
        header[2] === 0x44 &&
        header[3] === 0x46 &&
        header[4] === 0x2d
      );
    }
    if (lowerName.endsWith('.docx')) {
      return (
        header[0] === 0x50 &&
        header[1] === 0x4b &&
        header[2] === 0x03 &&
        header[3] === 0x04
      );
    }
    return false;
  } catch {
    return false;
  }
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

  // 2. Strict file type, MIME, magic-byte signature, and size checks (Checklist 8.1)
  const allowedExtensions = /\.(pdf|docx)$/i;
  const isAllowedExt = allowedExtensions.test(payload.file.name);
  const isAllowedMime = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'
  ].includes(payload.file.type);

  if (!isAllowedExt || !isAllowedMime || !(await hasValidDocumentMagicBytes(payload.file))) {
    return {
      success: false,
      submissionId: '',
      referenceCode: '',
      message: 'Security policy restriction: Only verified PDF or DOCX files with valid headers are accepted.'
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

  // 3. Collision-resistant safe file path inside private staging bucket (Checklist 8.2)
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

      // Upload unvetted files to private `submissions-pending` bucket (never overwrite)
      const { error: uploadError } = await supabase.storage
        .from('submissions-pending')
        .upload(filePath, payload.file, {
          cacheControl: '3600',
          upsert: false
        });

      if (onProgress) onProgress(75);

      if (!uploadError) {
        const contributorInfo = payload.contributorName
          ? `Uploaded by ${payload.contributorName.trim()}`
          : 'Student Peer Contributor';

        // Derive user identity strictly from verified session if logged in (Checklist 4.2)
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
            status: 'Under Review',
            reference_code: referenceCode,
            user_id: sessionUserId,
            feedback: `${contributorInfo} — Awaiting ASSON Editorial Board verification.`
          })
          .select('id')
          .single();

        if (!insertError && insertData) {
          remoteSuccess = true;
        }
      }
    } catch {
      // Sanitized handling
    }
  }

  if (onProgress) onProgress(100);

  if (!remoteSuccess && supabase) {
    return {
      success: false,
      submissionId: '',
      referenceCode: '',
      message: 'Could not upload file to review queue right now. Please try again shortly.'
    };
  }

  // Record only a local receipt tracker for the contributor's dashboard (never pre-approved into public catalog)
  const localSubmission: StudentSubmission = {
    id: submissionId,
    resourceTitle: payload.title.trim(),
    courseCode: payload.courseCode,
    resourceType: payload.resourceType,
    session: payload.session,
    submittedAt: new Date().toISOString().split('T')[0],
    status: 'Under Review',
    fileSizeBytes: payload.file.size,
    filePath,
    referenceCode,
    feedback: 'Submitted to ASSON Editorial Board review queue.'
  };

  try {
    const existing = JSON.parse(localStorage.getItem('asson_submissions') || '[]');
    localStorage.setItem('asson_submissions', JSON.stringify([localSubmission, ...existing]));
  } catch {
    // ignore
  }

  return {
    success: true,
    submissionId,
    referenceCode,
    message: `Material queued for verification! Tracking Receipt: ${referenceCode}`
  };
}

export async function getSubmissionPreviewUrl(filePath?: string): Promise<string | null> {
  if (!filePath) return null;
  const cleanPath = filePath.replace(/^resources\//, '').replace(/[^a-zA-Z0-9._/-]/g, '');
  if (!supabase) return null;

  try {
    const { data, error } = await supabase.storage
      .from('submissions-pending')
      .createSignedUrl(cleanPath, 120);
    if (!error && data?.signedUrl) {
      return sanitizeSafeHttpUrl(data.signedUrl) || null;
    }
  } catch { }

  const { data: pubData } = supabase.storage.from('resources').getPublicUrl(cleanPath);
  return sanitizeSafeHttpUrl(pubData?.publicUrl) || null;
}

export async function approveSubmissionInDb(
  submissionId: string,
  submission: StudentSubmission
): Promise<{ success: boolean; error?: string }> {
  if (supabase) {
    try {
      // Verify active server-side admin/editor session
      const { data: authUser } = await supabase.auth.getUser();
      if (!authUser?.user) {
        return { success: false, error: 'Executive session required to approve submissions.' };
      }

      const targetPath = (submission.filePath || `submissions/${submission.id}.pdf`).replace(/^resources\//, '');

      // Promote file from private `submissions-pending` bucket to public `resources` bucket if present
      if (submission.filePath) {
        try {
          const { data: fileBlob, error: dlError } = await supabase.storage
            .from('submissions-pending')
            .download(targetPath);
          if (!dlError && fileBlob) {
            await supabase.storage
              .from('resources')
              .upload(targetPath, fileBlob, { cacheControl: '3600', upsert: true });
            await supabase.storage
              .from('submissions-pending')
              .remove([targetPath]);
          }
        } catch {
          // File may already reside in resources bucket for legacy rows
        }
      }

      // 1. Update submissions table in Supabase
      const { error: updateError } = await supabase
        .from('submissions')
        .update({ status: 'Approved', feedback: 'Approved by ASSON Editorial Board.' })
        .eq('id', submissionId);

      if (updateError) {
        logDevWarning('Remote submission approval failed:', updateError.message);
        return { success: false, error: 'Database rejected submission approval. Confirm your executive permissions.' };
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
        file_type: targetPath.endsWith('.docx') ? 'DOCX' : 'PDF',
        file_path: targetPath,
        file_size_bytes: submission.fileSizeBytes || 2500000,
        verification_status: 'Verified',
        contributor_name: 'Student Peer Contributor (Vetted)',
        description: `Verified ${submission.resourceType} for ${submission.courseCode} (${submission.session}). Approved by ASSON Academic Editorial Committee.`,
        downloads_count: 0
      });

      if (insertError) {
        logDevWarning('Resource catalog registration warning:', insertError.message);
      }

      // 3. Log audit event (actor_email bound server-side by DB trigger from auth.jwt())
      await supabase.from('audit_events').insert({
        action: 'PUBLISH',
        entity: 'submissions',
        details: `Approved & published submission ${submission.id}: "${submission.resourceTitle}" (${submission.courseCode})`
      });
    } catch (err) {
      logDevWarning('Failed to update remote submission approval:', err);
      return { success: false, error: 'Database connection error during approval.' };
    }
  }

  try {
    const local = JSON.parse(localStorage.getItem('asson_submissions') || '[]') as StudentSubmission[];
    const updated = local.map((s) => s.id === submissionId ? { ...s, status: 'Approved', feedback: 'Approved by ASSON Editorial Board.' } : s);
    localStorage.setItem('asson_submissions', JSON.stringify(updated));
  } catch {
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
        .update({ status: 'Changes Requested', feedback: feedbackNote.trim() })
        .eq('id', submissionId);

      if (error) {
        return { success: false, error: 'Could not update submission status. Check executive authorization.' };
      }

      await supabase.from('audit_events').insert({
        action: 'UPDATE',
        entity: 'submissions',
        details: `Changes requested on submission ${submissionId}: "${feedbackNote.trim()}"`
      });
    } catch {
      return { success: false, error: 'Failed to update submission status.' };
    }
  }

  try {
    const local = JSON.parse(localStorage.getItem('asson_submissions') || '[]') as StudentSubmission[];
    const updated = local.map((s) => s.id === submissionId ? { ...s, status: 'Changes Requested', feedback: feedbackNote } : s);
    localStorage.setItem('asson_submissions', JSON.stringify(updated));
  } catch {
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
        return (data as DbAuditLogRow[]).map((row) => ({
          id: row.id,
          user: row.actor_email || row.user_name || 'ASSON System Admin',
          action: row.action,
          entity: row.entity,
          details: row.details || '',
          timestamp: new Date(row.created_at).toLocaleString(),
        }));
      }
    } catch (err) {
      logDevWarning('Audit logs fetch error from Supabase, serving cached seed:', err);
    }
  }
  return MOCK_AUDIT_LOGS;
}

export async function submitContentReport(
  resourceId: string,
  issueType: string,
  description?: string
): Promise<boolean> {
  const parsed = ContentReportSchema.safeParse({ resourceId, issueType, description });
  if (!parsed.success) return false;

  if (supabase) {
    try {
      let sessionUserId: string | null = null;
      try {
        const { data: authUser } = await supabase.auth.getUser();
        if (authUser?.user) sessionUserId = authUser.user.id;
      } catch { }

      await supabase.from('content_reports').insert({
        resource_id: parsed.data.resourceId,
        user_id: sessionUserId,
        issue_type: parsed.data.issueType,
        description: parsed.data.description || 'Reported by student user via portal',
        status: 'Open'
      });
      return true;
    } catch (err) {
      logDevWarning('Failed to insert content report into Supabase:', err);
    }
  }
  return true;
}

export async function incrementDownload(resourceId: string): Promise<void> {
  if (supabase) {
    try {
      await supabase.rpc('increment_download_count', { resource_id: resourceId });
    } catch {
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
        return (data as DbHelpDirectoryRow[]).map((row) => ({
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
      logDevWarning('Help directory query fallback to verified cache:', err);
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
  newKey: string
): Promise<{ success: boolean; error?: string }> {
  const trimmedNew = newKey.trim();
  if (trimmedNew.length < 8) {
    return { success: false, error: 'Committee passkey must be at least 8 characters long.' };
  }
  if (!supabase || !isSupabaseConfigured) {
    return { success: false, error: 'Supabase connection is required.' };
  }

  try {
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser?.user) {
      return { success: false, error: 'Verified Super Admin Supabase session required.' };
    }

    const { data, error } = await supabase.rpc('set_executive_passkey', {
      p_new_passkey: trimmedNew
    });

    if (error) {
      return { success: false, error: 'Could not update security key. Verify Super Admin authorization.' };
    }
    if (data && data.success === false) {
      return { success: false, error: data.error || 'Authorization denied.' };
    }
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to update passkey.' };
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
        const remoteMapped: AuthorizedExecutive[] = (data as DbAuthorizedExecutiveRow[]).map((d) => ({
          id: d.id,
          email: d.email,
          name: d.name,
          office: d.office,
          role: d.role,
          isMaster: Boolean(d.is_master || MASTER_ADMIN_EMAILS.includes(d.email.toLowerCase())),
          approvedBy: d.approved_by || undefined,
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

  if (!supabase || !isSupabaseConfigured) {
    return { success: false, error: 'Active Supabase backend connection required.' };
  }

  const cleanEmail = data.email.trim().toLowerCase();

  try {
    const { data: authUser } = await supabase.auth.getUser();
    const actorEmail = authUser?.user?.email?.trim().toLowerCase();
    if (!actorEmail) {
      return { success: false, error: 'Verified Master Admin session required.' };
    }

    const newEntry: AuthorizedExecutive = {
      id: `auth-exec-${Date.now()}`,
      email: cleanEmail,
      name: data.name.trim(),
      office: data.office.trim(),
      role: data.role,
      isMaster: false,
      approvedBy: actorEmail,
      createdAt: new Date().toISOString().split('T')[0]
    };

    const { error } = await supabase.from('authorized_executives').insert({
      id: newEntry.id,
      email: cleanEmail,
      name: newEntry.name,
      office: newEntry.office,
      role: newEntry.role,
      is_master: false,
      approved_by: actorEmail
    });

    if (error) {
      return {
        success: false,
        error: 'Authorization requires a verified Master Admin session (6-Digit Email OTP or Password).'
      };
    }

    await supabase.from('audit_events').insert({
      action: 'CREATE',
      entity: 'authorized_executives',
      details: `Approved executive access for ${newEntry.name} (${cleanEmail} — ${newEntry.office})`
    });

    return { success: true, data: newEntry };
  } catch {
    return { success: false, error: 'Database error authorizing executive.' };
  }
}

export async function revokeAuthorizedExecutive(id: string, email: string): Promise<{ success: boolean; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (MASTER_ADMIN_EMAILS.includes(cleanEmail)) {
    return { success: false, error: 'Master Admin accounts cannot be revoked.' };
  }
  if (!supabase || !isSupabaseConfigured) {
    return { success: false, error: 'Active Supabase backend connection required.' };
  }

  try {
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser?.user) {
      return { success: false, error: 'Verified Master Admin session required.' };
    }

    const { error } = await supabase.from('authorized_executives').delete().eq('email', cleanEmail);
    if (error) {
      return {
        success: false,
        error: 'Revoking access requires a verified Master Admin session.'
      };
    }

    await supabase.from('audit_events').insert({
      action: 'DELETE',
      entity: 'authorized_executives',
      details: `Revoked executive access for ${cleanEmail}`
    });

    return { success: true };
  } catch {
    return { success: false, error: 'Database error revoking executive.' };
  }
}

function clearAdminClientLabels() {
  sessionStorage.removeItem('asson_admin_authenticated');
  sessionStorage.removeItem('asson_admin_email');
  sessionStorage.removeItem('asson_admin_role');
  sessionStorage.removeItem('asson_admin_is_master');
  sessionStorage.removeItem('asson_admin_name');
  sessionStorage.removeItem('asson_admin_office');
}

function persistAdminSession(params: {
  email: string;
  role: string;
  isMaster: boolean;
  name: string;
  office: string;
}) {
  // Store strictly display metadata only (server JWT + RLS remain sole authority)
  sessionStorage.setItem('asson_admin_email', params.email);
  sessionStorage.setItem('asson_admin_name', params.name);
  sessionStorage.setItem('asson_admin_office', params.office);

  if (supabase && isSupabaseConfigured) {
    try {
      void supabase.from('audit_events').insert({
        action: 'LOGIN',
        entity: 'admin_session',
        details: `Executive portal session opened (${params.office})`
      });
    } catch { }
  }
}

export async function sendAdminLoginOtp(email: string): Promise<{ success: boolean; message?: string; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, error: 'Please enter a valid executive email address.' };
  }
  if (!supabase || !isSupabaseConfigured) {
    return { success: false, error: 'Email OTP requires an active Supabase connection.' };
  }

  try {
    // Enforce server-side rate limiting before dispatching email OTP
    const { data: limitData } = await supabase.rpc('check_rate_limit', {
      p_bucket: 'exec_otp',
      p_key: cleanEmail,
      p_max_attempts: 5,
      p_window_seconds: 900
    });

    if (limitData && limitData.allowed === false) {
      return {
        success: false,
        error: `Too many code requests. Please wait ${limitData.retryAfter || 60} seconds before retrying.`
      };
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: { shouldCreateUser: true }
    });

    if (error) {
      return { success: false, error: 'Could not send verification code right now. Please try again shortly.' };
    }

    return {
      success: true,
      message: 'If this email is approved on the executive list, a 6-digit login code has been sent.'
    };
  } catch {
    return { success: false, error: 'Failed to send login code.' };
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
    const { data: limitData } = await supabase.rpc('check_rate_limit', {
      p_bucket: 'exec_verify',
      p_key: cleanEmail,
      p_max_attempts: 8,
      p_window_seconds: 900
    });

    if (limitData && limitData.allowed === false) {
      return {
        success: false,
        error: `Too many verification attempts. Wait ${limitData.retryAfter || 60} seconds and try again.`
      };
    }

    const { data, error } = await supabase.auth.verifyOtp({
      email: cleanEmail,
      token: cleanToken,
      type: 'email'
    });

    if (error || !data.user) {
      return { success: false, error: 'Invalid or expired 6-digit verification code.' };
    }

    const isMaster = MASTER_ADMIN_EMAILS.includes(cleanEmail);
    let isAllowed = isMaster;
    if (!isAllowed) {
      const { data: rpcAllowed } = await supabase.rpc('is_authorized_executive_email', {
        p_email: cleanEmail
      });
      isAllowed = rpcAllowed === true;
    }

    if (!isAllowed) {
      await supabase.auth.signOut();
      return { success: false, error: 'Access Denied: email is not authorized for the executive console.' };
    }

    const authorizedList = await fetchAuthorizedExecutives();
    const matchedExec = authorizedList.find(e => e.email.toLowerCase() === cleanEmail);
    const role = isMaster ? 'super_admin' : (matchedExec?.role || 'admin');

    persistAdminSession({
      email: cleanEmail,
      role,
      isMaster,
      name: matchedExec?.name || (isMaster ? 'Emmanuel Ikeh' : 'Executive Member'),
      office: matchedExec?.office || (isMaster ? 'Executive President / Lead Admin' : 'Executive Council')
    });

    return { success: true, role, isMaster };
  } catch {
    return { success: false, error: 'Verification failed.' };
  }
}

export async function adminSignIn(
  email: string,
  password?: string
): Promise<{ success: boolean; role?: string; isMaster?: boolean; needsSetup?: boolean; error?: string }> {
  if (!email || !password || !email.includes('@')) {
    return { success: false, error: 'A valid executive email address and password are required.' };
  }

  const cleanEmail = email.trim().toLowerCase();
  const inputSecret = password.trim();

  if (!supabase || !isSupabaseConfigured) {
    return {
      success: false,
      error: 'Authentication requires an active Supabase backend connection.'
    };
  }

  try {
    // Rate-limit executive password attempts server-side before hitting auth
    const { data: limitData } = await supabase.rpc('check_rate_limit', {
      p_bucket: 'exec_pwd',
      p_key: cleanEmail,
      p_max_attempts: 5,
      p_window_seconds: 900
    });

    if (limitData && limitData.allowed === false) {
      return {
        success: false,
        error: `Too many failed sign-in attempts. Wait ${limitData.retryAfter || 60} seconds or use 6-Digit Email Code.`
      };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: inputSecret
    });

    if (error || !data.user) {
      return {
        success: false,
        error: 'Invalid executive credentials. Newly added committee members should use "Sign in with 6-Digit Email Code" below.'
      };
    }

    const isMaster = MASTER_ADMIN_EMAILS.includes(cleanEmail);
    let isAllowed = isMaster;
    if (!isAllowed) {
      const { data: rpcAllowed } = await supabase.rpc('is_authorized_executive_email', {
        p_email: cleanEmail
      });
      isAllowed = rpcAllowed === true;
    }

    if (!isAllowed) {
      await supabase.auth.signOut();
      return {
        success: false,
        error: 'Invalid executive credentials. Access denied.'
      };
    }

    const authorizedList = await fetchAuthorizedExecutives();
    const matchedExec = authorizedList.find(e => e.email.toLowerCase() === cleanEmail);
    const role = isMaster ? 'super_admin' : (matchedExec?.role || 'admin');

    persistAdminSession({
      email: cleanEmail,
      role,
      isMaster,
      name: matchedExec?.name || (isMaster ? 'Emmanuel Ikeh' : 'Executive Member'),
      office: matchedExec?.office || (isMaster ? 'Executive President / Lead Admin' : 'Executive Council')
    });

    return { success: true, role, isMaster };
  } catch {
    return {
      success: false,
      error: 'Authentication service unavailable. Try signing in with a 6-digit Email Code.'
    };
  }
}

export async function adminSignOut(): Promise<void> {
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
  }
  clearAdminClientLabels();
}

export async function isExecutiveAuthenticated(): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser?.user?.email) return false;
    const { isAuthorized } = await verifyExecutiveRole(authUser.user.id);
    return isAuthorized;
  } catch {
    return false;
  }
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
  const parsed = NoticeSchema.safeParse(notice);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Invalid notice payload.' };
  }

  if (supabase) {
    try {
      const { error } = await supabase.from('notices').insert({
        title: parsed.data.title,
        summary: parsed.data.summary,
        content: parsed.data.content,
        category: parsed.data.category,
        is_urgent: parsed.data.isUrgent,
        issuer: parsed.data.issuer,
        deadline: parsed.data.deadline || null,
        effective_date: parsed.data.effectiveDate || null,
        is_expired: false,
      });

      if (error) return { success: false, error: 'Database rejected notice creation. Verify executive permissions.' };

      await supabase.from('audit_events').insert({
        action: 'CREATE',
        entity: 'notices',
        details: `Created new announcement: "${parsed.data.title}" (${parsed.data.category})`
      });

      return { success: true };
    } catch {
      return { success: false, error: 'Database error creating notice.' };
    }
  }
  return { success: false, error: 'Database service is offline.' };
}

export async function deleteNoticeInDb(id: string): Promise<{ success: boolean; error?: string }> {
  if (supabase) {
    try {
      const { error } = await supabase.from('notices').delete().eq('id', id);
      if (error) return { success: false, error: 'Could not delete notice. Verify executive permissions.' };

      await supabase.from('audit_events').insert({
        action: 'DELETE',
        entity: 'notices',
        details: `Deleted notice ${id}`
      });

      return { success: true };
    } catch {
      return { success: false, error: 'Database error deleting notice.' };
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
  const parsed = OpportunitySchema.safeParse(opp);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Invalid opportunity details.' };
  }

  if (supabase) {
    try {
      const { error } = await supabase.from('opportunities').insert({
        title: parsed.data.title,
        provider: parsed.data.provider,
        category: parsed.data.category,
        deadline: parsed.data.deadline,
        eligibility: parsed.data.eligibility,
        description: parsed.data.description,
        application_url: parsed.data.applicationUrl,
        location: parsed.data.location,
        is_verified: true,
        is_expired: false
      });

      if (error) return { success: false, error: 'Could not create opportunity. Verify executive permissions.' };

      await supabase.from('audit_events').insert({
        action: 'CREATE',
        entity: 'opportunities',
        details: `Added opportunity: "${parsed.data.title}" by ${parsed.data.provider}`
      });

      return { success: true };
    } catch {
      return { success: false, error: 'Database error adding opportunity.' };
    }
  }
  return { success: false, error: 'Database service is offline.' };
}

export async function deleteOpportunityInDb(id: string): Promise<{ success: boolean; error?: string }> {
  if (supabase) {
    try {
      const { error } = await supabase.from('opportunities').delete().eq('id', id);
      if (error) return { success: false, error: 'Could not delete opportunity. Verify executive permissions.' };

      await supabase.from('audit_events').insert({
        action: 'DELETE',
        entity: 'opportunities',
        details: `Deleted opportunity ${id}`
      });

      return { success: true };
    } catch {
      return { success: false, error: 'Database error deleting opportunity.' };
    }
  }
  return { success: false, error: 'Database service is offline.' };
}

export async function createFaqInDb(faq: {
  question: string;
  answer: string;
  category: string;
}): Promise<{ success: boolean; error?: string }> {
  const parsed = FaqSchema.safeParse(faq);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Invalid FAQ content.' };
  }

  if (supabase) {
    try {
      const { error } = await supabase.from('faqs').insert({
        question: parsed.data.question,
        answer: parsed.data.answer,
        category: parsed.data.category
      });

      if (error) return { success: false, error: 'Could not create FAQ. Verify executive permissions.' };

      await supabase.from('audit_events').insert({
        action: 'CREATE',
        entity: 'faqs',
        details: `Added FAQ: "${parsed.data.question}"`
      });

      return { success: true };
    } catch {
      return { success: false, error: 'Database error creating FAQ.' };
    }
  }
  return { success: false, error: 'Database service is offline.' };
}

export async function deleteFaqInDb(id: string): Promise<{ success: boolean; error?: string }> {
  if (supabase) {
    try {
      const { error } = await supabase.from('faqs').delete().eq('id', id);
      if (error) return { success: false, error: 'Could not delete FAQ. Verify executive permissions.' };

      await supabase.from('audit_events').insert({
        action: 'DELETE',
        entity: 'faqs',
        details: `Deleted FAQ ${id}`
      });

      return { success: true };
    } catch {
      return { success: false, error: 'Database error deleting FAQ.' };
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
  const parsed = CalendarEventSchema.safeParse(event);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Invalid calendar event details.' };
  }

  if (supabase) {
    try {
      const { error } = await supabase.from('academic_calendar').insert({
        title: parsed.data.title,
        description: parsed.data.description || null,
        category: parsed.data.category,
        start_date: parsed.data.startDate,
        end_date: parsed.data.endDate || null,
        start_time: parsed.data.startTime || null,
        target_level: event.targetLevel || null,
        venue: parsed.data.venue || null,
        is_confirmed: parsed.data.isConfirmed,
      });

      if (error) return { success: false, error: 'Could not create calendar event. Verify executive permissions.' };

      await supabase.from('audit_events').insert({
        action: 'CREATE',
        entity: 'academic_calendar',
        details: `Created calendar event: "${parsed.data.title}" (${parsed.data.startDate})`
      });

      return { success: true };
    } catch {
      return { success: false, error: 'Database error creating calendar event.' };
    }
  }
  return { success: false, error: 'Database service is offline.' };
}

export async function deleteCalendarEventInDb(id: string): Promise<{ success: boolean; error?: string }> {
  if (supabase) {
    try {
      const { error } = await supabase.from('academic_calendar').delete().eq('id', id);
      if (error) return { success: false, error: 'Could not delete calendar event. Verify executive permissions.' };

      await supabase.from('audit_events').insert({
        action: 'DELETE',
        entity: 'academic_calendar',
        details: `Deleted calendar event ${id}`
      });

      return { success: true };
    } catch {
      return { success: false, error: 'Database error deleting calendar event.' };
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
      const { data: rpcCount, error } = await supabase.rpc('increment_notice_rsvp', {
        p_notice_id: noticeId,
        p_contributor_name: contributorName?.trim() || 'Student Attendee'
      });
      if (!error && typeof rpcCount === 'number') {
        count = rpcCount;
      }
    } catch (err) {
      logDevWarning('Remote RSVP sync notice:', err);
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
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err, 'Network error during registration.') };
  }
}

export async function studentSignIn(
  email: string,
  password: string
): Promise<{ success: boolean; user?: User; profile?: UserProfile; error?: string }> {
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
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err, 'Authentication error.') };
  }
}

export async function studentSignInWithGoogle(): Promise<{ success: boolean; profile?: UserProfile; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Authentication service is currently offline.' };
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
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err, 'Google sign-in error.') };
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
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  if (!supabase) {
    return { success: false, error: 'Password reset service is currently offline.' };
  }

  try {
    // Server-side rate limiting against brute-force / email quota abuse (Checklist 6.2 & 6.3)
    const { data: limitData } = await supabase.rpc('check_rate_limit', {
      p_bucket: 'pwd_reset',
      p_key: cleanEmail,
      p_max_attempts: 3,
      p_window_seconds: 900
    });

    if (limitData && limitData.allowed === false) {
      return {
        success: false,
        error: `Security cooldown active: Please wait ${limitData.retryAfter || 60} seconds before requesting another recovery code.`
      };
    }

    const redirectUrl = `${window.location.origin}/dashboard#type=recovery`;
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: redirectUrl
    });
    if (error) return { success: false, error: 'Could not initiate recovery email. Please try again later.' };
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
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err, 'Password reset error.') };
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
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err, 'Failed to update password.') };
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
        const remoteIds = (data as Array<{ resource_id: string }>).map((b) => b.resource_id);
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
      logDevWarning('Remote bookmark sync notice:', err);
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
        return includePending
          ? parsed.data
          : parsed.data.filter((e: EnterpriseListing) => String(e.status).toLowerCase() === 'approved');
      }
    }
  } catch {
    // ignore
  }

  if (supabase) {
    try {
      let query = supabase.from('enterprise_listings').select('*');
      if (!includePending) {
        query = query.in('status', ['Approved', 'approved']);
      }
      const { data, error } = await query.order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        const mapped: EnterpriseListing[] = (data as DbEnterpriseRow[]).map((d) => ({
          id: d.id,
          businessName: d.business_name || d.businessName || 'Enterprise',
          ownerName: d.owner_name || d.ownerName || 'Student Owner',
          ownerLevel: d.owner_level || d.ownerLevel || '200',
          category: d.category,
          description: d.description,
          whatsapp: d.whatsapp || d.contact_phone || '',
          instagram: d.instagram || d.instagram_handle,
          imageUrl: sanitizeSafeHttpUrl(d.image_url || d.imageUrl || undefined),
          status: (String(d.status || 'Pending').toLowerCase() as 'pending' | 'approved' | 'rejected'),
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
        return includePending
          ? parsed.data
          : parsed.data.filter((e: EnterpriseListing) => String(e.status).toLowerCase() === 'approved');
      }
    }
  } catch {
    // ignore
  }

  return includePending ? MOCK_ENTERPRISES : MOCK_ENTERPRISES.filter((e) => e.status === 'approved');
}

export async function uploadEnterpriseImage(
  file: File
): Promise<{ success: boolean; publicUrl?: string; error?: string }> {
  const allowedMimes: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  };
  const ext = allowedMimes[file.type];
  if (!ext) {
    return { success: false, error: 'Only JPEG, PNG, or WebP images are permitted.' };
  }
  if (file.size > 2 * 1024 * 1024) {
    return { success: false, error: 'Image must be 2MB or smaller.' };
  }
  if (!supabase) {
    return { success: false, error: 'Image storage requires an active Supabase connection.' };
  }

  const nonce = Math.random().toString(36).slice(2, 9);
  const path = `enterprises/${Date.now()}_${nonce}.${ext}`;

  try {
    const { error } = await supabase.storage
      .from('enterprise-images')
      .upload(path, file, { cacheControl: '3600', upsert: false });

    if (error) {
      return { success: false, error: 'Image upload rejected by storage policy.' };
    }

    const { data } = supabase.storage.from('enterprise-images').getPublicUrl(path);
    const safeUrl = sanitizeSafeHttpUrl(data?.publicUrl);
    return safeUrl ? { success: true, publicUrl: safeUrl } : { success: false, error: 'Invalid storage URL returned.' };
  } catch {
    return { success: false, error: 'Failed to upload image.' };
  }
}

export async function submitEnterpriseListing(data: {
  businessName: string;
  ownerName: string;
  ownerLevel: AcademicLevel;
  category: EnterpriseCategory;
  description: string;
  whatsapp: string;
  instagram?: string;
  imageUrl?: string;
}): Promise<{ success: boolean; data?: EnterpriseListing; error?: string }> {
  const validation = EnterpriseListingSchema.safeParse({
    businessName: data.businessName,
    category: data.category,
    description: data.description,
    ownerName: data.ownerName,
    ownerLevel: data.ownerLevel,
    contactPhone: data.whatsapp,
    instagramHandle: data.instagram,
    imageUrl: data.imageUrl,
  });

  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || 'Please check your business submission fields.'
    };
  }

  const safeImageUrl = data.imageUrl ? sanitizeSafeHttpUrl(data.imageUrl) : undefined;
  const newEntry: EnterpriseListing = {
    id: `ent-${Date.now()}`,
    businessName: data.businessName.trim(),
    ownerName: data.ownerName.trim(),
    ownerLevel: data.ownerLevel,
    category: data.category,
    description: data.description.trim(),
    whatsapp: data.whatsapp.trim(),
    instagram: data.instagram?.trim() || undefined,
    imageUrl: safeImageUrl,
    status: 'pending',
    createdAt: new Date().toISOString().split('T')[0],
  };

  if (supabase) {
    try {
      let sessionUserId: string | null = null;
      try {
        const { data: authUser } = await supabase.auth.getUser();
        if (authUser?.user) sessionUserId = authUser.user.id;
      } catch { }

      const { error } = await supabase.from('enterprise_listings').insert({
        business_name: newEntry.businessName,
        tagline: `${newEntry.businessName} — ${newEntry.category}`,
        owner_name: newEntry.ownerName,
        owner_level: newEntry.ownerLevel,
        category: 'Other Services',
        description: newEntry.description,
        contact_phone: newEntry.whatsapp,
        whatsapp_link: `https://wa.me/${newEntry.whatsapp}`,
        instagram_handle: newEntry.instagram || null,
        image_url: safeImageUrl || null,
        user_id: sessionUserId,
        status: 'Pending',
      });
      if (error) {
        logDevWarning('Supabase insert note:', error.message);
        return { success: false, error: 'Submission could not be saved right now. Please try again shortly.' };
      }
    } catch {
      return { success: false, error: 'Database error saving business submission.' };
    }
  }

  return { success: true, data: newEntry };
}

export async function updateEnterpriseStatus(
  id: string,
  status: 'approved' | 'rejected'
): Promise<{ success: boolean; error?: string }> {
  const dbStatus = status === 'approved' ? 'Approved' : 'Rejected';
  if (supabase) {
    try {
      const { data: authUser } = await supabase.auth.getUser();
      if (!authUser?.user) {
        return { success: false, error: 'Unauthorized: Executive session required.' };
      }
      const { error } = await supabase.from('enterprise_listings').update({ status: dbStatus }).eq('id', id);
      if (error) {
        return { success: false, error: 'Database rejected enterprise status change.' };
      }
    } catch {
      return { success: false, error: 'Database error updating enterprise status.' };
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
        const mapped: ElectedExecutive[] = (data as DbElectedExecutiveRow[]).map((d) => ({
          id: d.id,
          name: d.name,
          office: d.office,
          session: d.session || '2026/2027',
          level: d.level || '300',
          imageUrl: sanitizeSafeHttpUrl(d.image_url || d.imageUrl || undefined),
          whatsapp: d.whatsapp || undefined,
          email: d.email || undefined,
          bio: d.bio || undefined,
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
    imageUrl: sanitizeSafeHttpUrl(exec.imageUrl) || undefined,
    whatsapp: exec.whatsapp?.trim() || undefined,
    email: exec.email?.trim() || undefined,
    bio: exec.bio?.trim() || undefined,
    orderIndex: Date.now(),
  };

  if (supabase) {
    try {
      const { data: authUser } = await supabase.auth.getUser();
      if (!authUser?.user) {
        return { success: false, error: 'Unauthorized: Verified Supabase session required.' };
      }

      const { error } = await supabase.from('elected_executives').insert({
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

      if (error) {
        return { success: false, error: 'Database rejected executive creation. Confirm admin privileges.' };
      }
    } catch {
      return { success: false, error: 'Database connection error creating executive.' };
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
      if (!authUser?.user) {
        return { success: false, error: 'Unauthorized: Verified Supabase session required.' };
      }
      const { error } = await supabase.from('elected_executives').delete().eq('id', id);
      if (error) {
        return { success: false, error: 'Database rejected executive deletion.' };
      }
    } catch {
      return { success: false, error: 'Database connection error deleting executive.' };
    }
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
        const mapped: StaffMember[] = (data as DbStaffRow[]).map((d) => ({
          id: d.id,
          name: d.name,
          title: d.title,
          designation: d.designation,
          courses: d.courses || [],
          office: d.office,
          email: d.email || undefined,
          consultationHours: d.consultation_hours || d.consultationHours || undefined,
          advisorLevel: d.advisor_level || d.advisorLevel || undefined,
          isHOD: Boolean(d.is_hod || d.isHOD),
          imageUrl: sanitizeSafeHttpUrl(d.image_url || d.imageUrl || undefined) || undefined,
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
    imageUrl: sanitizeSafeHttpUrl(staff.imageUrl),
    id: `staff-${Date.now()}`
  };

  if (supabase) {
    try {
      const { data: authUser } = await supabase.auth.getUser();
      if (!authUser?.user) {
        return { success: false, error: 'Unauthorized: Verified Supabase session required.' };
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

      if (error) {
        return { success: false, error: 'Database rejected staff creation. Confirm admin privileges.' };
      }

      if (data) {
        newStaff.id = data.id;
      }
    } catch {
      return { success: false, error: 'Database connection error creating staff member.' };
    }
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
      if (!authUser?.user) {
        return { success: false, error: 'Unauthorized: Verified Supabase session required.' };
      }
      const { error } = await supabase.from('staff_members').delete().eq('id', id);
      if (error) {
        return { success: false, error: 'Database rejected staff deletion.' };
      }
    } catch {
      return { success: false, error: 'Database connection error deleting staff member.' };
    }
  }

  try {
    const current = await fetchStaffMembers();
    const updated = current.filter((s) => s.id !== id);
    localStorage.setItem('asson_cached_staff', JSON.stringify({ timestamp: Date.now(), data: updated }));
  } catch {}

  return { success: true };
}
