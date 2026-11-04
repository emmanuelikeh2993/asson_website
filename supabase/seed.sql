-- ====================================================================
-- ASSON UI Student Platform — Seed Data
-- ====================================================================

-- 1. Insert Department Courses
INSERT INTO public.courses (code, title, level, semester, units) VALUES
('STA 111', 'Probability I', '100', 1, 3),
('STA 121', 'Statistical Inference I', '100', 2, 3),
('STA 211', 'Probability & Distribution Theory I', '200', 1, 3),
('STA 212', 'Statistical Inference II', '200', 1, 3),
('STA 221', 'Biostatistics', '200', 2, 2),
('STA 311', 'Probability & Distribution Theory II', '300', 1, 3),
('STA 312', 'Regression Analysis & Modelling', '300', 1, 3),
('STA 321', 'Design & Analysis of Experiments', '300', 2, 3),
('STA 411', 'Stochastic Processes', '400', 1, 3),
('STA 412', 'Multivariate Data Analysis', '400', 1, 3),
('STA 421', 'Time Series Analysis & Forecasting', '400', 2, 3),
('STA 701', 'Advanced Mathematical Statistics', 'Postgraduate', 1, 4)
ON CONFLICT (code) DO NOTHING;

-- 2. Insert Academic Resources
INSERT INTO public.resources (
    title, course_code, course_title, level, semester, session, type, file_type, file_path, file_size_bytes, verification_status, contributor_name, description, downloads_count
) VALUES
(
    'STA 211 First Semester Examination (2023/2024)',
    'STA 211',
    'Probability & Distribution Theory I',
    '200',
    1,
    '2023/2024',
    'Past Question',
    'PDF',
    'resources/sta211_2023_2024_exam.pdf',
    2450000,
    'Verified',
    'ASSON Academic Committee',
    'Complete 3-hour theoretical examination paper with questions on Moment Generating Functions, Joint Distributions, and Transformations.',
    342
),
(
    'STA 212 Examination & Marking Guide (2022/2023)',
    'STA 212',
    'Statistical Inference II',
    '200',
    1,
    '2022/2023',
    'Past Question',
    'PDF',
    'resources/sta212_2022_2023_exam.pdf',
    1820000,
    'Verified',
    'ASSON Secretariat',
    'Past examination paper covering Maximum Likelihood Estimation, Neyman-Pearson Lemma, and Hypothesis Testing.',
    289
),
(
    'STA 312 Complete Lecture Notes & R Code Lab Manual',
    'STA 312',
    'Regression Analysis & Modelling',
    '300',
    1,
    '2024/2025',
    'Lecture Note',
    'PDF',
    'resources/sta312_lecture_notes_r_manual.pdf',
    5400000,
    'Verified',
    'Dr. O. A. Department of Statistics',
    'Comprehensive approved lecture notes detailing Simple & Multiple Linear Regression, Residual Diagnostics, Multicollinearity, and practical R script walk-throughs.',
    512
),
(
    'STA 111 Tutorial Practice Sheet & Solutions (Sets 1 - 4)',
    'STA 111',
    'Probability I',
    '100',
    1,
    '2024/2025',
    'Tutorial Sheet',
    'PDF',
    'resources/sta111_tutorial_sheet_solutions.pdf',
    1200000,
    'Verified',
    'ASSON Tutorial Mentors',
    'Full problem set with step-by-step worked solutions for Permutations, Combinations, Conditional Probability, and Bayes Theorem.',
    420
),
(
    'STA 311 Mid-Semester Continuous Assessment (2023/2024)',
    'STA 311',
    'Probability & Distribution Theory II',
    '300',
    1,
    '2023/2024',
    'Past Question',
    'PDF',
    'resources/sta311_ca_2023_2024.pdf',
    980000,
    'Verified',
    'Student Submission',
    'Mid-term test on Bivariate Normal distributions, Order Statistics, and Characteristic Functions.',
    198
),
(
    'STA 411 Stochastic Processes Course Syllabus & Reading List',
    'STA 411',
    'Stochastic Processes',
    '400',
    1,
    '2024/2025',
    'Course Outline',
    'PDF',
    'resources/sta411_outline.pdf',
    420000,
    'Verified',
    'Departmental Office',
    'Official course outline: Markov Chains, Transition Matrices, Poisson Processes, Renewal Theory, and recommended reference textbooks.',
    165
),
(
    'STA 421 Time Series Analysis Past Questions (2018 - 2023)',
    'STA 421',
    'Time Series Analysis & Forecasting',
    '400',
    2,
    '2022/2023',
    'Past Question',
    'PDF',
    'resources/sta421_archive_2018_2023.pdf',
    6800000,
    'Verified',
    'ASSON Academic Committee',
    'Compiled 5-year retrospective archive of degree examination questions covering ARIMA, Stationarity, Autocorrelation, and Spectral Analysis.',
    260
);

-- 3. Insert Notices
INSERT INTO public.notices (title, summary, content, category, is_urgent, published_date, effective_date, deadline, issuer) VALUES
(
    'Official Resumption Date and Course Registration Deadline for First Semester',
    'The University Senate has announced the commencement date for physical lectures and portal closure for course registration.',
    'All undergraduate students of the Department of Statistics, University of Ibadan, are hereby notified that lectures for the 2026/2027 Academic Session commence immediately. Portal course registration must be completed by Friday, 28th November. Late registration fees will apply strictly after the deadline.',
    'University',
    true,
    '2026-10-28',
    '2026-11-01',
    '2026-11-28',
    'UI Academic Affairs / Senate'
),
(
    'ASSON Week 2026: Schedule of Academic Hackathon, Data Sprint & Dinner',
    'Join our annual departmental week featuring the Inter-Level Statistics Quiz, Industry Data Hackathon, and Annual Alumni Dinner.',
    'The Executive Committee of ASSON UI cordially invites all members to ASSON Week 2026. Schedule: Monday - Awareness walk & health talk; Tuesday - Data Analytics Workshop in Python/R; Wednesday - Dean’s Cup Football Match; Thursday - Inter-Level Academic Quiz; Friday - Dinner & Award Night.',
    'ASSON',
    false,
    '2026-10-24',
    '2026-11-15',
    '2026-11-20',
    'ASSON UI Central Executive Council'
),
(
    'Department of Statistics: Updated First Semester Timetable (Rev 2)',
    'Revision 2 of the 100L - 400L departmental lecture and practical lab timetable has been published on the departmental notice board.',
    'Students should note the updated venue allocations for STA 211 (moved to Faculty Large Lecture Hall) and STA 312 Practical sessions (Statistical Computing Laboratory, Block B). Please verify your personal schedule to prevent clashing.',
    'Department',
    true,
    '2026-10-22',
    NULL,
    NULL,
    'Departmental Timetable Committee'
);

-- 4. Insert Opportunities
INSERT INTO public.opportunities (title, provider, category, deadline, eligibility, description, application_url, location) VALUES
(
    'MTN Science & Technology Scholarship Scheme (2026)',
    'MTN Foundation',
    'Scholarship',
    '2026-11-30',
    '200 Level & 300 Level Statistics undergraduates with a minimum CGPA of 3.5 / 5.0 (or Second Class Upper equivalent).',
    'Annual scholarship award of ₦200,000 per academic session until graduation for high-performing STEM students across accredited Nigerian universities.',
    'https://www.mtn.ng/scholarships',
    'National (Nigeria)'
),
(
    'Data Science & Machine Learning Intern (SIWES / 6-Month)',
    'Moniepoint Financial Services',
    'Internship',
    '2026-12-15',
    'Penultimate year (300L/400L) students seeking SIWES industrial training. Proficiency in Python (pandas, numpy) and SQL required.',
    'Work alongside senior quantitative researchers analyzing millions of payment transactions, fraud detection heuristics, and time-series forecasting models.',
    'https://moniepoint.com/careers/internships',
    'Lagos / Hybrid'
),
(
    'Federal Government Bilateral Education Agreement (BEA) Awards',
    'Federal Ministry of Education',
    'Scholarship',
    '2026-12-28',
    'Graduating students and final year Statistics undergraduates with First Class or Strong 2:1 for postgraduate study abroad.',
    'Fully funded scholarship covering tuition, accommodation, and living stipend for Master’s and PhD programs in Russia, China, Hungary, and Morocco.',
    'https://education.gov.ng/fsb',
    'International'
);

-- 5. Insert FAQs
INSERT INTO public.faqs (question, answer, category, order_index) VALUES
(
    'How do I download past examination questions?',
    'Navigate to the Academic Resources or Past Questions tab. You can use the search bar to type your course code (e.g. STA 211) or filter by your academic level. Click the "Download" button on any resource card to download the PDF directly. Registration is not required to download public approved resources.',
    'Resources',
    1
),
(
    'How can I submit lecture notes or past questions to help other students?',
    'Click on the "Submit a Resource" button on the navigation bar or in your student dashboard. Select the course code, specify the academic session, upload your PDF file (up to 15MB), and submit. An ASSON academic editor will review the material for accuracy and legibility before publishing it.',
    'Submissions',
    2
),
(
    'What is the grading system in the Department of Statistics, University of Ibadan?',
    'The University operates on a 5-point Cumulative Grade Point Average (CGPA) system: 70–100% = A (5 points), 60–69% = B (4 points), 50–59% = C (3 points), 45–49% = D (2 points), 0–44% = F (0 points). Degree classifications are First Class (4.50–5.00), Second Class Upper (3.50–4.49), Second Class Lower (2.40–3.49), and Third Class (1.50–2.39).',
    'Academics',
    3
),
(
    'Who do I contact if I notice a broken link or incorrect examination paper?',
    'Every resource card features a "Report an Issue" button. Click it to submit a brief note specifying what is wrong. The editorial team receives the notification immediately and investigates within 48 hours.',
    'Resources',
    4
);

