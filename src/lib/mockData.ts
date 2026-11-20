import { AcademicResource, Course, Notice, Opportunity, FAQItem, StudentSubmission, AuditLog, CalendarEvent, StaffMember, EnterpriseListing, ElectedExecutive } from '../types';

// Official University of Ibadan Department of Statistics Course Catalog (Aligned with 2025/2026 Course Forms)
export const COURSES: Course[] = [
  // -------------------------------------------------------------
  // 100 Level (37 Units Registered - UI Department of Statistics)
  // -------------------------------------------------------------
  { code: 'STA 111', title: 'Descriptive Statistics', level: '100', semester: 1, units: 3 },
  { code: 'STA 112', title: 'Probability I', level: '100', semester: 1, units: 3 },
  { code: 'STA 121', title: 'Statistical Inference I', level: '100', semester: 2, units: 3 },
  { code: 'STA 122', title: 'Statistical Computing I', level: '100', semester: 2, units: 3 },
  { code: 'MTH 101', title: 'Elementary Mathematics I (Algebra and Trigonometry)', level: '100', semester: 1, units: 2 },
  { code: 'MTH 102', title: 'Elementary Mathematics II (Calculus)', level: '100', semester: 2, units: 2 },
  { code: 'MTH 103', title: 'Elementary Mathematics III (Vectors, Geometry and Dynamics)', level: '100', semester: 1, units: 2 },
  { code: 'COS 101', title: 'Introduction to Computing Sciences', level: '100', semester: 1, units: 3 },
  { code: 'PHY 101', title: 'General Physics I', level: '100', semester: 1, units: 2 },
  { code: 'PHY 102', title: 'General Physics II', level: '100', semester: 2, units: 2 },
  { code: 'PHY 103', title: 'General Physics III', level: '100', semester: 1, units: 2 },
  { code: 'GST 111', title: 'Communication in English I', level: '100', semester: 1, units: 2 },
  { code: 'GST 112', title: 'Nigerian Peoples and Culture', level: '100', semester: 2, units: 2 },
  { code: 'GES 107', title: 'Reproductive Health, STIs, Drugs and Mankind', level: '100', semester: 1, units: 1 },
  { code: 'GES 108', title: 'Introduction to French', level: '100', semester: 2, units: 1 },
  { code: 'MAT 142', title: 'Introduction to Actuarial Mathematics', level: '100', semester: 2, units: 4 },

  // -------------------------------------------------------------
  // 200 Level (41 Units Registered - UI Department of Statistics)
  // -------------------------------------------------------------
  { code: 'STA 211', title: 'Probability II', level: '200', semester: 1, units: 3 },
  { code: 'STA 219', title: 'Statistical Consulting', level: '200', semester: 1, units: 2 },
  { code: 'STA 231', title: 'Statistical Computing II', level: '200', semester: 1, units: 2 },
  { code: 'STA 202', title: 'Statistics for Physical Science & Engineering', level: '200', semester: 1, units: 3 },
  { code: 'STA 212', title: 'Introduction to Social & Economic Statistics', level: '200', semester: 2, units: 3 },
  { code: 'STA 221', title: 'Statistical Inference II', level: '200', semester: 2, units: 3 },
  { code: 'STA 224', title: 'Introduction to Statistical Machine Learning', level: '200', semester: 2, units: 2 },
  { code: 'STA 225', title: 'Data Visualization', level: '200', semester: 2, units: 2 },
  { code: 'STA 299', title: 'Industrial Attachment', level: '200', semester: 2, units: 3 },
  { code: 'MTH 204', title: 'Linear Algebra I', level: '200', semester: 1, units: 2 },
  { code: 'MTH 207', title: 'Real Analysis I', level: '200', semester: 1, units: 2 },
  { code: 'MTH 202', title: 'Elementary Differential Equations', level: '200', semester: 2, units: 2 },
  { code: 'MTH 209', title: 'Introduction to Numerical Analysis', level: '200', semester: 2, units: 2 },
  { code: 'COS 201', title: 'Computer Programming I', level: '200', semester: 1, units: 3 },
  { code: 'ENT 211', title: 'Entrepreneurship and Innovation', level: '200', semester: 1, units: 2 },
  { code: 'GST 212', title: 'Philosophy, Logic and Human Existence', level: '200', semester: 2, units: 2 },
  { code: 'GES 201', title: 'Use of English II', level: '200', semester: 1, units: 2 },
  { code: 'GES 103', title: 'Government, Society & the Economy', level: '200', semester: 1, units: 1 },

  // -------------------------------------------------------------
  // 300 Level
  // -------------------------------------------------------------
  { code: 'STA 311', title: 'Probability III: Limit Theorems & Foundations', level: '300', semester: 1, units: 3 },
  { code: 'STA 312', title: 'Statistical Inference III: Likelihood Theory', level: '300', semester: 1, units: 3 },
  { code: 'STA 321', title: 'Design and Analysis of Experiments I', level: '300', semester: 1, units: 3 },
  { code: 'STA 322', title: 'Regression Analysis & Linear Models', level: '300', semester: 2, units: 3 },
  { code: 'STA 331', title: 'Demography & Social Statistics Methods', level: '300', semester: 2, units: 3 },
  { code: 'STA 332', title: 'Operations Research & Mathematical Programming', level: '300', semester: 2, units: 3 },
  { code: 'STA 341', title: 'Non-Parametric Statistical Methods', level: '300', semester: 1, units: 2 },
  { code: 'STA 351', title: 'Biometrical Methods & Epidemiology', level: '300', semester: 2, units: 3 },
  { code: 'STA 399', title: 'SIWES / Industrial Work Experience Scheme (6 Months)', level: '300', semester: 2, units: 6 },

  // -------------------------------------------------------------
  // 400 Level
  // -------------------------------------------------------------
  { code: 'STA 411', title: 'Probability IV: Advanced Stochastic Processes', level: '400', semester: 1, units: 3 },
  { code: 'STA 412', title: 'Advanced Statistical Inference: Bayesian Analysis', level: '400', semester: 1, units: 3 },
  { code: 'STA 421', title: 'Time Series Analysis & Forecasting (ARIMA & GARCH)', level: '400', semester: 2, units: 3 },
  { code: 'STA 422', title: 'Multivariate Statistical Analysis (PCA & MANOVA)', level: '400', semester: 1, units: 3 },
  { code: 'STA 431', title: 'Econometric Methods & Simultaneous Equation Models', level: '400', semester: 2, units: 3 },
  { code: 'STA 432', title: 'Quality Control & Industrial Statistics', level: '400', semester: 2, units: 2 },
  { code: 'STA 441', title: 'Survival Analysis & Reliability Theory', level: '400', semester: 2, units: 3 },
  { code: 'STA 499', title: 'Final Year Original Research Project', level: '400', semester: 2, units: 6 },
];

// Zero Dummy Data: Only genuine uploaded/verified resources are served
export const MOCK_RESOURCES: AcademicResource[] = [];

// Zero Dummy Data: Only genuine administrative notices are served
export const MOCK_NOTICES: Notice[] = [];

// Zero Dummy Data: Only genuine vetted scholarships/grants are served
export const MOCK_OPPORTUNITIES: Opportunity[] = [];

// Zero Dummy Data: Only genuine calendar events are served
export const MOCK_CALENDAR_EVENTS: CalendarEvent[] = [];

export const MOCK_FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'How do I download past examination questions?',
    answer: 'Navigate to the Academic Resources or Past Questions tab. You can use the search bar to type your course code (e.g. STA 211) or filter by your academic level. Click the "Download" button on any resource card to download the PDF directly. Registration is not required to download public approved resources.',
    category: 'Resources',
  },
  {
    id: 'faq-2',
    question: 'How can I submit lecture notes or past questions to help other students?',
    answer: 'Click on the "Submit Material" button on the navigation bar, homepage, or help page. Select the course code, specify the academic session, attach your document (PDF, DOCX, or ZIP up to 15MB), and submit. Uploaded materials undergo curriculum verification by the ASSON editorial board before appearing in the public catalog.',
    category: 'Submissions',
  },
  {
    id: 'faq-3',
    question: 'What is the grading system in the Department of Statistics, University of Ibadan?',
    answer: 'The University operates on a 5-point Cumulative Grade Point Average (CGPA) system: 70–100% = A (5 points), 60–69% = B (4 points), 50–59% = C (3 points), 45–49% = D (2 points), 0–44% = F (0 points). Degree classifications are First Class (4.50–5.00), Second Class Upper (3.50–4.49), Second Class Lower (2.40–3.49), and Third Class (1.50–2.39).',
    category: 'Academics',
  },
  {
    id: 'faq-4',
    question: 'Who do I contact if I notice a broken link or incorrect examination paper?',
    answer: 'Every resource card features a "Report Issue" action. Alternatively, contact the ASSON Academic Editorial Committee directly via email at asson@ui.edu.ng or use the confidential student feedback desk on the Where to Get Help page.',
    category: 'ASSON',
  },
];

export const MOCK_HELP_DIRECTORY = [
  {
    id: 'help-1',
    category: 'Departmental Office' as const,
    title: 'Departmental General Office',
    officeOrPerson: 'Departmental Secretary & Admin Staff',
    description: 'Official academic documentation, transcript requests, departmental clearance, departmental timetable queries, and general university student enquiries.',
    contactEmail: 'statistics@ui.edu.ng',
    location: 'Department of Statistics Building, Faculty of Science, University of Ibadan',
    availability: 'Monday – Friday, 8:00 AM – 4:00 PM',
    lastVerifiedDate: '2026-11-01',
    orderIndex: 1,
  },
  {
    id: 'help-2',
    category: 'Academic Advisory' as const,
    title: 'Undergraduate Course Advisory Board',
    officeOrPerson: 'Level Staff Advisers (100L – 400L)',
    description: 'Course registration clearance, prerequisites counseling, add/drop assistance, and academic performance guidance.',
    contactEmail: 'statistics.adviser@ui.edu.ng',
    location: 'Faculty of Science, University of Ibadan',
    availability: 'Departmental consultation hours (check notice board for current session)',
    lastVerifiedDate: '2026-11-01',
    orderIndex: 2,
  },
  {
    id: 'help-3',
    category: 'Student Welfare' as const,
    title: 'ASSON UI Executive Welfare Committee',
    officeOrPerson: 'ASSON Welfare Director & Secretariat',
    description: 'Peer study circles, tutorial groups, student wellbeing support, and welfare emergencies for statistics scholars.',
    contactEmail: 'asson.unibadan@gmail.com',
    location: 'ASSON Secretariat, Department of Statistics',
    availability: 'Available during semester sessions and tutorial hours',
    lastVerifiedDate: '2026-11-01',
    orderIndex: 3,
  },
  {
    id: 'help-4',
    category: 'Platform Technical Help' as const,
    title: 'ASSON Portal Technical Desk',
    officeOrPerson: 'Platform Administrator & Editorial Desk',
    description: 'Report missing examination papers, broken PDF downloads, metadata corrections, or mobile display issues.',
    contactEmail: 'asson.unibadan@gmail.com',
    location: 'Online via Portal Feedback Centre',
    availability: 'Reviewed daily by ASSON Editorial Board',
    lastVerifiedDate: '2026-11-01',
    orderIndex: 4,
  },
];

export const MOCK_SUBMISSIONS: StudentSubmission[] = [];

export const MOCK_AUDIT_LOGS: AuditLog[] = [];

export const MOCK_STAFF: StaffMember[] = [
  {
    id: 'staff-1',
    name: 'Prof. O. O. Ojo',
    title: 'Professor & Head of Department',
    designation: 'Professor of Biostatistics & Statistical Computing',
    courses: ['STA 451', 'STA 711'],
    office: 'HOD Office, 2nd Floor, Department of Statistics',
    email: 'hod.statistics@ui.edu.ng',
    consultationHours: 'Wednesdays 11:00 AM – 1:00 PM',
    isHOD: true,
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'staff-2',
    name: 'Prof. A. A. Adepoju',
    title: 'Professor',
    designation: 'Professor of Econometrics & Time Series Analysis',
    courses: ['STA 411', 'STA 321'],
    office: 'Room 205, Department of Statistics',
    email: 'aa.adepoju@ui.edu.ng',
    consultationHours: 'Tuesdays 10:00 AM – 12:00 PM',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'staff-3',
    name: 'Dr. O. I. Shittu',
    title: 'Reader',
    designation: 'Reader in Stochastic Processes & Probability Theory',
    courses: ['STA 211', 'STA 421'],
    office: 'Room 208, Department of Statistics',
    email: 'oi.shittu@ui.edu.ng',
    consultationHours: 'Thursdays 12:00 PM – 2:00 PM',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'staff-4',
    name: 'Dr. K. A. Bashiru',
    title: 'Senior Lecturer',
    designation: 'Senior Lecturer & 200 Level Staff Adviser',
    courses: ['STA 221', 'STA 311'],
    office: 'Room 104, Department of Statistics',
    email: 'ka.bashiru@ui.edu.ng',
    consultationHours: 'Mondays & Thursdays 10:00 AM – 12:00 PM',
    advisorLevel: '200',
    imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'staff-5',
    name: 'Dr. S. O. Ogundunmade',
    title: 'Lecturer I',
    designation: 'Lecturer I & 100 Level Staff Adviser',
    courses: ['STA 111', 'STA 121'],
    office: 'Room 102, Department of Statistics',
    email: 'so.ogundunmade@ui.edu.ng',
    consultationHours: 'Tuesdays & Fridays 9:00 AM – 11:00 AM',
    advisorLevel: '100',
    imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'staff-6',
    name: 'Dr. F. M. Awe',
    title: 'Senior Lecturer',
    designation: 'Senior Lecturer & 300 Level Staff Adviser',
    courses: ['STA 331', 'STA 341'],
    office: 'Room 203, Department of Statistics',
    email: 'fm.awe@ui.edu.ng',
    consultationHours: 'Wednesdays 2:00 PM – 4:00 PM',
    advisorLevel: '300',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'staff-7',
    name: 'Dr. T. O. Olatayo',
    title: 'Senior Lecturer',
    designation: 'Senior Lecturer & 400 Level Staff Adviser',
    courses: ['STA 431', 'STA 441'],
    office: 'Room 207, Department of Statistics',
    email: 'to.olatayo@ui.edu.ng',
    consultationHours: 'Mondays 11:00 AM – 1:00 PM',
    advisorLevel: '400',
    imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80',
  },
];

export const MOCK_ENTERPRISES: EnterpriseListing[] = [
  {
    id: 'ent-1',
    businessName: 'DataStat Solutions',
    ownerName: 'Oluwaseun Bakare',
    ownerLevel: '400',
    category: 'Data & Tech',
    description: 'Specialized statistical analysis for undergraduate and postgraduate projects using R, SPSS, Stata, and Python.',
    whatsapp: '2348012345678',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
    status: 'approved',
    createdAt: '2026-11-10',
  },
  {
    id: 'ent-2',
    businessName: 'Apex Statistical Tutors',
    ownerName: 'Emmanuel Danjuma',
    ownerLevel: '300',
    category: 'Academic & Tutorials',
    description: 'One-on-one and group revision tutorials for STA 111, STA 121, STA 211, and MTH 102 calculus.',
    whatsapp: '2348023456789',
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80',
    status: 'approved',
    createdAt: '2026-11-12',
  },
  {
    id: 'ent-3',
    businessName: 'UI LensCraft Media',
    ownerName: 'Chiamaka Okeke',
    ownerLevel: '200',
    category: 'Design & Creative',
    description: 'Professional event coverage, departmental convocation portraits, and flyer designs for student programmes.',
    whatsapp: '2348034567890',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80',
    status: 'approved',
    createdAt: '2026-11-15',
  },
  {
    id: 'ent-4',
    businessName: 'Campus Bites & Bakes',
    ownerName: 'Fatima Aliyu',
    ownerLevel: '300',
    category: 'Campus Goods & Food',
    description: 'Fresh pastries, meat pies, and cold zobo drink deliveries across faculty lecture theatres and halls of residence.',
    whatsapp: '2348045678901',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
    status: 'approved',
    createdAt: '2026-11-18',
  },
];

export const MOCK_EXECUTIVES: ElectedExecutive[] = [
  {
    id: 'exec-1',
    name: 'Ayomide Babatunde',
    office: 'President',
    session: '2024/2025',
    level: '400',
    whatsapp: '2348011223344',
    email: 'president.asson@ui.edu.ng',
    bio: 'Championing academic excellence, transparent administration, and industry mentorship for all UI Statisticians.',
    orderIndex: 1,
  },
  {
    id: 'exec-2',
    name: 'Blessing Okon',
    office: 'Vice President',
    session: '2024/2025',
    level: '300',
    whatsapp: '2348022334455',
    email: 'vp.asson@ui.edu.ng',
    bio: 'Overseeing academic committee initiatives, freshers induction, and welfare programs.',
    orderIndex: 2,
  },
  {
    id: 'exec-3',
    name: 'Chinedu Eze',
    office: 'General Secretary',
    session: '2024/2025',
    level: '300',
    whatsapp: '2348033445566',
    email: 'secgen.asson@ui.edu.ng',
    bio: 'Maintaining official departmental correspondence, executive documentation, and meeting communiques.',
    orderIndex: 3,
  },
  {
    id: 'exec-4',
    name: 'Oluwafemi Adeyemi',
    office: 'Academic Director',
    session: '2024/2025',
    level: '300',
    whatsapp: '2348044556677',
    email: 'academics.asson@ui.edu.ng',
    bio: 'Coordinating peer tutorials, past question archives, and statistical computing revision workshops.',
    orderIndex: 4,
  },
  {
    id: 'exec-5',
    name: 'Zainab Alabi',
    office: 'Financial Secretary',
    session: '2024/2025',
    level: '300',
    whatsapp: '2348055667788',
    email: 'finsec.asson@ui.edu.ng',
    bio: 'Ensuring accountable stewardship of departmental association dues and budget allocations.',
    orderIndex: 5,
  },
  {
    id: 'exec-6',
    name: 'Daniel Adeleke',
    office: 'Public Relations Officer (P.R.O)',
    session: '2024/2025',
    level: '200',
    whatsapp: '2348066778899',
    email: 'pro.asson@ui.edu.ng',
    bio: 'Managing official ASSON broadcasts, social platforms, and student information dissemination.',
    orderIndex: 6,
  },
  {
    id: 'exec-7',
    name: 'Grace Nwosu',
    office: 'Welfare Director',
    session: '2024/2025',
    level: '300',
    whatsapp: '2348077889900',
    email: 'welfare.asson@ui.edu.ng',
    bio: 'Promoting student health, wellbeing, academic aid, and hall representation.',
    orderIndex: 7,
  },
];


