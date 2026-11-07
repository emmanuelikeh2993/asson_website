export type AcademicLevel = '100' | '200' | '300' | '400' | 'Postgraduate';

export type ResourceType = 
  | 'Past Question'
  | 'Lecture Note'
  | 'Course Outline'
  | 'Tutorial Sheet'
  | 'Reference Material';

export type VerificationStatus = 'Verified' | 'Unverified' | 'Needs Review' | 'Archived';

export interface Course {
  code: string;           // e.g. "STA 211"
  title: string;          // e.g. "Probability & Distribution Theory I"
  level: AcademicLevel;
  semester: 1 | 2;
  units: number;
}

export interface AcademicResource {
  id: string;
  title: string;
  courseCode: string;
  courseTitle: string;
  level: AcademicLevel;
  semester: 1 | 2;
  session: string;        // e.g. "2023/2024"
  type: ResourceType;
  fileType: 'PDF' | 'DOCX';
  fileSizeBytes: number;
  downloadUrl: string;
  filePath?: string;
  verificationStatus: VerificationStatus;
  lastCheckedDate: string;
  contributorName?: string;
  description?: string;
  downloadsCount: number;
}

export type NoticeCategory = 'ASSON' | 'Department' | 'Faculty' | 'University';

export interface Notice {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: NoticeCategory;
  isUrgent: boolean;
  publishedDate: string;
  effectiveDate?: string;
  deadline?: string;
  issuer: string;
  isExpired: boolean;
}

export type OpportunityCategory = 'Scholarship' | 'Internship';

export interface Opportunity {
  id: string;
  title: string;
  provider: string;
  category: OpportunityCategory;
  deadline: string;
  eligibility: string;
  description: string;
  applicationUrl: string;
  location?: string;
  isVerified: boolean;
  isExpired: boolean;
  postedDate: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'Academics' | 'Resources' | 'ASSON' | 'Submissions';
}

export interface Executive {
  id: string;
  name: string;
  role: string;
  level: string;
  bio: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
}

export type SubmissionStatus = 'Under Review' | 'Approved' | 'Changes Requested';

export interface StudentSubmission {
  id: string;
  resourceTitle: string;
  courseCode: string;
  resourceType: ResourceType;
  session: string;
  submittedAt: string;
  status: SubmissionStatus;
  feedback?: string;
  fileSizeBytes: number;
  filePath?: string;
  referenceCode?: string;
}

export type FeedbackCategory = 
  | 'General Feedback' 
  | 'Incorrect Information' 
  | 'Broken Link / Missing Material' 
  | 'Suggestion' 
  | 'Welfare Concern' 
  | 'Appreciation';

export type FeedbackStatus = 'Received' | 'Under Review' | 'Referred' | 'Resolved' | 'Closed';

export interface FeedbackSubmission {
  id: string;
  category: FeedbackCategory;
  subject: string;
  description: string;
  affectedUrl?: string;
  contactMethod?: string;
  status: FeedbackStatus;
  reviewerNotes?: string;
  createdAt: string;
}

export type HelpCategory = 
  | 'Academic Advisory' 
  | 'Departmental Office' 
  | 'Student Welfare' 
  | 'Platform Technical Help';

export interface HelpDirectoryItem {
  id: string;
  category: HelpCategory;
  title: string;
  officeOrPerson: string;
  description: string;
  contactEmail?: string;
  contactPhone?: string;
  location?: string;
  availability?: string;
  lastVerifiedDate: string;
  orderIndex: number;
}

export interface AuditLog {
  id: string;
  user: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'PUBLISH' | 'VERIFY';
  entity: string;
  details: string;
  timestamp: string;
}

