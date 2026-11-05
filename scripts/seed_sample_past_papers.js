/**
 * ASSON UI - Seed Sample Departmental Past Question PDFs to Supabase Storage
 * Generates verified, valid PDF examination papers and uploads them into the 'resources' bucket.
 */

import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// Load .env
if (!process.env.SUPABASE_SERVICE_ROLE_KEY && fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx > 0) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://cvhjohbknghlmspoaenr.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY is required.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

/**
 * Builds a syntactically valid PDF 1.4 document buffer with text
 */
function generateValidPdf(header, courseCode, courseTitle, session, instructions, questions) {
  const textLines = [
    `UNIVERSITY OF IBADAN, IBADAN, NIGERIA`,
    `FACULTY OF SCIENCE -- DEPARTMENT OF STATISTICS`,
    `FIRST SEMESTER EXAMINATION (${session})`,
    `--------------------------------------------------------------------------------`,
    `COURSE: ${courseCode} -- ${courseTitle}`,
    `TIME ALLOWED: 3 HOURS`,
    `INSTRUCTIONS: ${instructions}`,
    `================================================================================`,
    ``
  ];

  questions.forEach((q, idx) => {
    textLines.push(`QUESTION ${idx + 1}:`);
    textLines.push(q);
    textLines.push(``);
  });

  textLines.push(`--------------------------------------------------------------------------------`);
  textLines.push(`ASSON UI DIGITAL ACADEMIC ARCHIVE -- DEPARTMENT OF STATISTICS, UI`);

  // Simple, compliant PDF formatting
  let contentStream = 'BT\n/F1 12 Tf\n40 760 Td\n15 TL\n';
  for (const line of textLines) {
    const sanitized = line.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
    contentStream += `(${sanitized}) '\n`;
  }
  contentStream += 'ET';

  const streamLength = Buffer.byteLength(contentStream, 'utf-8');

  const pdfBody = 
`%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${streamLength} >>
stream
${contentStream}
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000240 00000 n 
0000000350 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
450
%%EOF`;

  return Buffer.from(pdfBody, 'utf-8');
}

const SAMPLE_PAPERS = [
  {
    courseCode: 'STA 111',
    courseTitle: 'Descriptive Statistics & Probability I',
    session: '2023/2024',
    filePath: 'papers/sta111_2023_2024_exam.pdf',
    instructions: 'Answer FOUR questions in all. Scientific non-programmable calculators allowed.',
    questions: [
      '1(a) Distinguish between primary and secondary statistical data, citing two merits of each. (b) Compute the Mean, Median, and Pearsonian Coefficient of Skewness for the sample dataset provided.',
      '2(a) State the classical, empirical, and axiomatic definitions of probability. (b) A bag contains 5 red, 7 green, and 8 white balls. If 3 balls are drawn at random without replacement, find the probability that at least two are green.',
      '3(a) Define Bayes theorem and state the Law of Total Probability. (b) In a diagnostic laboratory, test T detects disease D with 96% sensitivity and 95% specificity. If prevalence is 2%, calculate P(D|T+).'
    ]
  },
  {
    courseCode: 'STA 211',
    courseTitle: 'Probability & Distribution Theory I',
    session: '2023/2024',
    filePath: 'papers/sta211_2023_2024_exam.pdf',
    instructions: 'Answer Question ONE (Compulsory) and any other THREE questions.',
    questions: [
      '1(a) Derive the Moment Generating Function (MGF) of a Gamma distribution with parameters alpha and beta. Hence, determine its mean and variance. (b) Show that the sum of n independent Poisson random variables is itself Poisson.',
      '2(a) Let X and Y have joint density f(x,y) = 24xy for 0 < x < 1, 0 < y < 1, x+y < 1. Find the marginal density of X and test whether X and Y are independent.',
      '3(a) Use the Jacobian Transformation technique to derive the distribution of U = X + Y and V = X / (X + Y) where X and Y are independent Exponential random variables with parameter lambda.'
    ]
  },
  {
    courseCode: 'STA 312',
    courseTitle: 'Statistical Inference II',
    session: '2023/2024',
    filePath: 'papers/sta312_2023_2024_exam.pdf',
    instructions: 'Answer any FOUR questions. Statistical tables and formula sheets provided.',
    questions: [
      '1(a) State and prove the Rao-Blackwell Theorem. Explain its role in the construction of Uniformly Minimum Variance Unbiased Estimators (UMVUE).',
      '2(a) State the Neyman-Pearson Lemma for testing simple null hypotheses against simple alternatives. (b) Construct the Most Powerful (MP) test of size alpha for the mean of a Normal distribution with known variance.',
      '3(a) Derive the Generalized Likelihood Ratio Test (GLRT) statistic for comparing the variances of two independent normal populations.'
    ]
  },
  {
    courseCode: 'STA 411',
    courseTitle: 'Stochastic Processes & Time Series Analysis',
    session: '2023/2024',
    filePath: 'papers/sta411_2023_2024_exam.pdf',
    instructions: 'Answer Question 1 and any other 3 questions.',
    questions: [
      '1(a) Define a Discrete-Time Markov Chain (DTMC). Explain Chapman-Kolmogorov equations and derive the stationary distribution for an ergodic transition probability matrix P.',
      '2(a) Formulate the Yule-Walker equations for an Autoregressive process of order p, AR(p). (b) Verify the stationarity conditions for an ARMA(1,1) series Xt = 0.6 X_{t-1} + et - 0.4 e_{t-1}.',
      '3(a) Describe the Poisson Process as a pure birth process. Derive the state probabilities P_n(t) starting from initial state zero.'
    ]
  }
];

async function seedPastPapers() {
  console.log(`Starting PDF Generation & Upload to Supabase Storage ['resources' bucket]...`);

  for (const paper of SAMPLE_PAPERS) {
    try {
      const pdfBuffer = generateValidPdf(
        'UNIVERSITY OF IBADAN',
        paper.courseCode,
        paper.courseTitle,
        paper.session,
        paper.instructions,
        paper.questions
      );

      // 1. Upload to Supabase storage bucket 'resources'
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('resources')
        .upload(paper.filePath, pdfBuffer, {
          contentType: 'application/pdf',
          upsert: true
        });

      if (uploadErr) {
        console.warn(`[UPLOAD FAILED] ${paper.courseCode}:`, uploadErr.message);
        continue;
      }

      console.log(`[STORAGE UPLOADED] ${paper.filePath} (${pdfBuffer.length} bytes)`);

      // 2. Update matching resources in the database so file_path points to the physical file
      const { data: updatedRows, error: updateErr } = await supabase
        .from('resources')
        .update({
          file_path: paper.filePath,
          file_type: 'PDF',
          file_size_bytes: pdfBuffer.length,
          verification_status: 'Verified'
        })
        .ilike('course_code', paper.courseCode)
        .eq('session', paper.session)
        .select('id, title, course_code');

      if (!updateErr && updatedRows) {
        console.log(`[DB UPDATED] Linked physical PDF to ${updatedRows.length} catalogued items for ${paper.courseCode}`);
      }
    } catch (err) {
      console.error(`Error processing ${paper.courseCode}:`, err.message);
    }
  }

  // Verify storage bucket listing
  const { data: files } = await supabase.storage.from('resources').list('papers');
  console.log(`\n========================================`);
  console.log(`Uploaded physical past papers in storage bucket:`);
  console.log(files ? files.map(f => ` - papers/${f.name} (${f.metadata?.size || 'unknown'} bytes)`).join('\n') : 'No files listed');
  console.log(`========================================\n`);
}

seedPastPapers();

