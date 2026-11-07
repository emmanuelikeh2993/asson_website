import { AcademicResource, Course, Notice, Opportunity, FAQItem, StudentSubmission, AuditLog, CalendarEvent } from '../types';

// Official University of Ibadan Department of Statistics Course Catalog
export const COURSES: Course[] = [
  // 100 Level
  { code: 'STA 111', title: 'Probability I: Elementary Principles & Combinatorics', level: '100', semester: 1, units: 3 },
  { code: 'STA 112', title: 'Descriptive Statistics & Exploratory Data Analysis', level: '100', semester: 1, units: 2 },
  { code: 'STA 121', title: 'Statistical Inference I: Foundation Concepts', level: '100', semester: 2, units: 3 },
  { code: 'STA 131', title: 'Statistical Computing I: Introduction to R & Spreadsheets', level: '100', semester: 2, units: 2 },
  { code: 'MAT 111', title: 'Algebra & Elementary Trigonometry', level: '100', semester: 1, units: 3 },
  { code: 'MAT 121', title: 'Calculus I: Differential & Integral Calculus', level: '100', semester: 1, units: 3 },
  { code: 'MAT 141', title: 'Analytical Geometry & Vectors', level: '100', semester: 2, units: 3 },
  { code: 'CSC 101', title: 'Introduction to Computer Science & Problem Solving', level: '100', semester: 1, units: 3 },

  // 200 Level
  { code: 'STA 211', title: 'Probability II: Distribution Theory & Multivariate Random Variables', level: '200', semester: 1, units: 3 },
  { code: 'STA 212', title: 'Statistical Inference II: Estimation Theory & Hypothesis Testing', level: '200', semester: 1, units: 3 },
  { code: 'STA 221', title: 'Sampling Techniques & Survey Methodology I', level: '200', semester: 2, units: 3 },
  { code: 'STA 231', title: 'Statistical Computing II: Data Wrangling & Simulation in R', level: '200', semester: 2, units: 2 },
  { code: 'STA 241', title: 'Mathematics for Statisticians (Linear Algebra & Matrix Operations)', level: '200', semester: 1, units: 3 },
  { code: 'MAT 211', title: 'Real Analysis I: Sequences, Series & Continuity', level: '200', semester: 1, units: 3 },
  { code: 'MAT 221', title: 'Ordinary Differential Equations & Applications', level: '200', semester: 2, units: 3 },
  { code: 'CSC 221', title: 'Object-Oriented Programming (Python / C++)', level: '200', semester: 2, units: 3 },

  // 300 Level
  { code: 'STA 311', title: 'Probability III: Measure-Theoretic Foundations & Limit Theorems', level: '300', semester: 1, units: 3 },
  { code: 'STA 312', title: 'Statistical Inference III: Likelihood Theory & Asymptotics', level: '300', semester: 1, units: 3 },
  { code: 'STA 321', title: 'Design and Analysis of Experiments I: ANOVA & Block Designs', level: '300', semester: 1, units: 3 },
  { code: 'STA 322', title: 'Regression Analysis & Linear Models', level: '300', semester: 2, units: 3 },
  { code: 'STA 331', title: 'Demography & Social Statistics Methods', level: '300', semester: 2, units: 3 },
  { code: 'STA 332', title: 'Operations Research & Mathematical Programming', level: '300', semester: 2, units: 3 },
  { code: 'STA 341', title: 'Non-Parametric Statistical Methods', level: '300', semester: 1, units: 2 },
  { code: 'STA 351', title: 'Biometrical Methods & Epidemiology', level: '300', semester: 2, units: 3 },
  { code: 'STA 399', title: 'SIWES / Industrial Work Experience Scheme (6 Months)', level: '300', semester: 2, units: 6 },

  // 400 Level
  { code: 'STA 411', title: 'Probability IV: Advanced Stochastic Processes & Markov Chains', level: '400', semester: 1, units: 3 },
  { code: 'STA 412', title: 'Advanced Statistical Inference: Bayesian Analysis & Decision Theory', level: '400', semester: 1, units: 3 },
  { code: 'STA 421', title: 'Time Series Analysis & Forecasting (ARIMA & GARCH)', level: '400', semester: 2, units: 3 },
  { code: 'STA 422', title: 'Multivariate Statistical Analysis (PCA, Factor Analysis & MANOVA)', level: '400', semester: 1, units: 3 },
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
