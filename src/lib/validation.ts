import { z } from 'zod';

/**
 * ASSON UI — Runtime Schema Validation Engine
 * Enforces strict input validation on payloads before persistence and transmission.
 * Mitigates CWE-20 (Improper Input Validation) & satisfies Checklist 4.1.
 */

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
    errorMap: () => ({ message: 'Please select a valid academic level' })
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
  category: z.enum([
    'Tech & Coding',
    'Data & Analytics',
    'Fashion & Apparel',
    'Food & Treats',
    'Design & Media',
    'Hair & Beauty',
    'Gadgets & Accessories',
    'Other Services'
  ]),
  tagline: z
    .string()
    .trim()
    .min(3, 'Tagline is required')
    .max(120, 'Tagline too long'),
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
    .min(7, 'Please enter a valid phone number')
    .max(20, 'Phone number too long'),
  whatsappLink: z.string().trim().max(200).optional(),
  instagramHandle: z.string().trim().max(80).optional(),
  imageUrl: z.string().trim().max(500).optional(),
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
  imageUrl: z.string().trim().max(500).optional(),
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
  imageUrl: z.string().trim().max(500).optional(),
});

export const AuthCredentialsSchema = z.object({
  email: z.string().trim().email('Please enter a valid university or personal email'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const AuthorizedExecutiveSchema = z.object({
  email: z.string().trim().email('Please enter a valid personal or university email address'),
  name: z.string().trim().min(2, 'Name must be at least 2 characters long').max(100),
  office: z.string().trim().min(2, 'Office title is required (e.g. Academic Director)').max(100),
  role: z.enum(['editor', 'admin', 'super_admin']).default('admin'),
});

