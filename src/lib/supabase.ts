import { createClient } from '@supabase/supabase-js';
import { 
  AcademicResource, 
  Course, 
  Notice, 
  Opportunity, 
  FAQItem, 
  StudentSubmission, 
  AuditLog 
} from '../types';
import { 
  COURSES, 
  MOCK_RESOURCES, 
  MOCK_NOTICES, 
  MOCK_OPPORTUNITIES, 
  MOCK_FAQS, 
  MOCK_SUBMISSIONS, 
  MOCK_AUDIT_LOGS 
} from './mockData';

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
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data.map(mapDbResourceToModel);
      }
    } catch (err) {
      console.warn('Resources fetch error from Supabase, serving cached seed:', err);
    }
  }
  return MOCK_RESOURCES;
}

export async function fetchNotices(): Promise<Notice[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .eq('is_expired', false)
        .order('published_date', { ascending: false });
      if (!error && data && data.length > 0) {
        return data.map(mapDbNoticeToModel);
      }
    } catch (err) {
      console.warn('Notices fetch error from Supabase, serving cached seed:', err);
    }
  }
  return MOCK_NOTICES;
}

export async function fetchOpportunities(): Promise<Opportunity[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('is_expired', false)
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data.map(mapDbOpportunityToModel);
      }
    } catch (err) {
      console.warn('Opportunities fetch error from Supabase, serving cached seed:', err);
    }
  }
  return MOCK_OPPORTUNITIES;
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
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id,
          resourceTitle: row.title,
          courseCode: row.course_code,
          resourceType: row.type,
          session: row.session || '2024/2025',
          submittedAt: new Date(row.created_at).toISOString().split('T')[0],
          status: row.status,
          feedback: row.feedback || undefined,
          fileSizeBytes: Number(row.file_size_bytes) || 1500000,
        }));
      }
    } catch (err) {
      console.warn('Submissions fetch error from Supabase, serving cached seed:', err);
    }
  }
  return MOCK_SUBMISSIONS;
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

export async function incrementDownload(resourceId: string): Promise<void> {
  if (supabase) {
    try {
      await supabase.rpc('increment_download_count', { resource_id: resourceId });
    } catch (err) {
      console.warn('Could not increment download count on Supabase:', err);
    }
  }
}
