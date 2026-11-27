import { z } from 'zod';

/**
 * ASSON UI — Runtime Schema Validation & URL Sanitization Engine
 * Enforces strict input validation on payloads before persistence and rendering.
 * Mitigates CWE-20 (Improper Input Validation) & CWE-79 (XSS via unsafe URL schemes).
 */

export function isSafeHttpUrl(url?: string | null): boolean {
  if (!url || !url.trim()) return false;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function sanitizeSafeHttpUrl(url?: string | null): string | undefined {
  if (!url || !url.trim()) return undefined;
  return isSafeHttpUrl(url) ? url.trim() : undefined;
}

const optionalSafeUrlSchema = z
  .string()
  .trim()
  .max(500, 'URL too long')
  .refine((val) => val === '' || isSafeHttpUrl(val), {
    message: 'URL must start with https:// or http://'
  })
  .optional();

export const AcademicMaterialSubmissionSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Title must be at least 3 characters long')
    .max(150, 'Title cannot exceed 150 characters'),
  courseCode: z
    .string()
    .trim()
    .min(3, 'Course code is required')
    .max(12, 'Invalid course code length'),
  courseTitle: z
    .string()
    .trim()
    .min(3, 'Course title is required')
    .max(150, 'Course title too long'),
  level: z.enum(['100', '200', '300', '400', 'Postgraduate'], {
    error: 'Please select a valid academic level'
  }),
  semester: z.union([z.literal(1), z.literal(2)]),
  session: z
    .string()
    .trim()
    .regex(/^\d{4}\/\d{4}$/, 'Session must be in YYYY/YYYY format (e.g. 2026/2027)'),
  resourceType: z.enum([
    'Past Question',
    'Lecture Note',
    'Course Outline',
    'Tutorial Sheet',
    'Reference Material'
  ]),
  contributorName: z.string().trim().max(80).optional(),
});

export const StudentFeedbackSubmissionSchema = z.object({
  category: z.enum([
    'General Feedback',
    'Incorrect Information',
    'Broken Link / Missing Material',
    'Suggestion',
    'Welfare Concern',
    'Appreciation'
  ]),
  subject: z
    .string()
    .trim()
    .min(3, 'Subject must be at least 3 characters')
    .max(120, 'Subject is too long'),
  description: z
    .string()
    .trim()
    .min(5, 'Please provide more details (at least 5 characters)')
    .max(2500, 'Description cannot exceed 2,500 characters'),
  affectedUrl: z.string().trim().max(255).optional(),
  contactMethod: z.string().trim().max(100).optional(),
});

export const EnterpriseListingSchema = z.object({
  businessName: z
    .string()
    .trim()
    .min(2, 'Business name must be at least 2 characters')
    .max(100, 'Business name too long'),
  category: z.string().trim().min(2, 'Category is required').max(60),
  tagline: z.string().trim().max(120, 'Tagline too long').optional(),
  description: z
    .string()
    .trim()
    .min(10, 'Please write at least 10 characters describing your enterprise')
    .max(2000, 'Description cannot exceed 2,000 characters'),
  ownerName: z
    .string()
    .trim()
    .min(2, 'Owner name is required')
    .max(80, 'Owner name too long'),
  ownerLevel: z.enum(['100', '200', '300', '400', 'Postgraduate']),
  contactPhone: z
    .string()
    .trim()
    .min(7, 'Please enter a valid WhatsApp/phone number')
    .max(20, 'Phone number too long'),
  whatsappLink: optionalSafeUrlSchema,
  instagramHandle: z.string().trim().max(80).optional(),
  imageUrl: optionalSafeUrlSchema,
});

export const NoticeSchema = z.object({
  title: z.string().trim().min(3, 'Notice title must be at least 3 characters').max(180),
  summary: z.string().trim().min(3, 'Summary is required').max(400),
  content: z.string().trim().min(5, 'Content is required').max(5000),
  category: z.enum(['ASSON', 'Department', 'Faculty', 'University']),
  isUrgent: z.boolean(),
  issuer: z.string().trim().min(2, 'Issuer is required').max(120),
  deadline: z.string().trim().max(40).optional(),
  effectiveDate: z.string().trim().max(40).optional(),
});

export const OpportunitySchema = z.object({
  title: z.string().trim().min(3, 'Opportunity title is required').max(180),
  provider: z.string().trim().min(2, 'Provider is required').max(120),
  category: z.enum(['Scholarship', 'Internship']),
  deadline: z.string().trim().min(4, 'Deadline is required').max(40),
  eligibility: z.string().trim().min(3, 'Eligibility is required').max(1000),
  description: z.string().trim().min(5, 'Description is required').max(3000),
  applicationUrl: z
    .string()
    .trim()
    .refine(isSafeHttpUrl, { message: 'Application URL must be a valid https:// or http:// link' }),
  location: z.string().trim().min(2, 'Location is required').max(120),
});

export const FaqSchema = z.object({
  question: z.string().trim().min(5, 'Question is too short').max(300),
  answer: z.string().trim().min(5, 'Answer is too short').max(3000),
  category: z.string().trim().min(2, 'Category is required').max(60),
});

export const CalendarEventSchema = z.object({
  title: z.string().trim().min(3, 'Event title is required').max(160),
  description: z.string().trim().max(1500).optional(),
  category: z.enum([
    'Examination',
    'Continuous Assessment',
    'Registration Deadline',
    'Departmental Event',
    'Resumption / Senate',
    'Academic Milestone'
  ]),
  startDate: z.string().trim().min(4, 'Start date is required').max(40),
  endDate: z.string().trim().max(40).optional(),
  startTime: z.string().trim().max(40).optional(),
  venue: z.string().trim().max(160).optional(),
  isConfirmed: z.boolean(),
});

export const ContentReportSchema = z.object({
  resourceId: z.string().trim().min(1, 'Resource ID is required').max(100),
  issueType: z.string().trim().min(2, 'Issue type is required').max(80),
  description: z.string().trim().max(1000).optional(),
});

export const StaffMemberSchema = z.object({
  name: z.string().trim().min(2, 'Staff name required').max(100),
  title: z.string().trim().max(20),
  designation: z.string().trim().min(2).max(100),
  courses: z.array(z.string().trim()).default([]),
  office: z.string().trim().min(2).max(150),
  email: z.string().trim().email('Invalid email address').optional().or(z.literal('')),
  consultationHours: z.string().trim().max(100).optional(),
  advisorLevel: z.string().trim().max(20).optional(),
  isHOD: z.boolean().default(false),
  imageUrl: optionalSafeUrlSchema,
});

export const ElectedExecutiveSchema = z.object({
  name: z.string().trim().min(2, 'Executive name required').max(100),
  office: z.string().trim().min(2, 'Office title required').max(100),
  session: z.string().trim().max(20),
  level: z.string().trim().max(20),
  whatsapp: z.string().trim().max(50).optional(),
  email: z.string().trim().email().optional().or(z.literal('')),
  bio: z.string().trim().max(1000).optional(),
  orderIndex: z.number().int().min(0).default(0),
  imageUrl: optionalSafeUrlSchema,
});

export const AuthCredentialsSchema = z.object({
  email: z.string().trim().email('Please enter a valid university or personal email'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export const AuthorizedExecutiveSchema = z.object({
  email: z.string().trim().email('Please enter a valid personal or university email address'),
  name: z.string().trim().min(2, 'Name must be at least 2 characters long').max(100),
  office: z.string().trim().min(2, 'Office title is required (e.g. Academic Director)').max(100),
  role: z.enum(['editor', 'admin', 'super_admin']).default('admin'),
});
