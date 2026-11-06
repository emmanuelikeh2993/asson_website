import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FileCheck2, 
  ShieldCheck, 
  BookOpen, 
  AlertTriangle, 
  Scale, 
  ArrowLeft, 
  Mail, 
  Lock,
  GraduationCap
} from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-200">
      {/* Breadcrumb / Back button */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-brand-green transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Academic Hub
        </Link>
      </div>

      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-950 via-brand-deep to-[#053b21] text-white p-6 sm:p-10 shadow-card">
        <div className="flex items-center gap-2 mb-3">
          <span className="p-1 rounded-md bg-white/10 text-emerald-300">
            <Scale className="w-4 h-4" />
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-200">
            ASSON UI Institutional Governance
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Terms of Academic Resource Contribution & Fair Use
        </h1>
        <p className="text-xs sm:text-sm text-emerald-100/80 mt-2 max-w-2xl leading-relaxed">
          Guidelines governing past question archives, student-contributed lecture outlines, non-commercial fair use, and academic integrity for the Department of Statistics, University of Ibadan.
        </p>
        <div className="flex flex-wrap items-center gap-4 mt-5 pt-4 border-t border-white/15 text-[11px] text-emerald-200/90 font-mono">
          <span>Effective Date: 2024/2025 Academic Session</span>
          <span>•</span>
          <span>Version: 2.1 (Open Educational Portal)</span>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="p-6 sm:p-10 rounded-3xl bg-surface-card border border-border-light shadow-2xs space-y-8 text-xs sm:text-sm text-text-main leading-relaxed">
        {/* Section 1: Core Purpose */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-emerald-50 text-brand-green flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-200">
              1
            </span>
            <h2 className="text-base sm:text-lg font-bold text-text-main">
              Purpose & Institutional Framework
            </h2>
          </div>
          <p className="text-text-muted">
            The Association of Statistics Students of Nigeria (ASSON), University of Ibadan Chapter, operates this digital academic repository as an open, zero-login, peer-supported educational service. Its primary purpose is to provide undergraduate and postgraduate Statistics scholars with verified past examination papers, syllabus outlines, tutorial problem sets, and practical computing datasets to aid individual revision and collective scholarly excellence.
          </p>
        </section>

        {/* Section 2: Academic Integrity */}
        <section className="space-y-3 pt-4 border-t border-border-light">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-emerald-50 text-brand-green flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-200">
              2
            </span>
            <h2 className="text-base sm:text-lg font-bold text-text-main">
              Academic Integrity & Genuine Material Pledge
            </h2>
          </div>
          <p className="text-text-muted">
            Scholars who contribute or submit academic materials affirm that:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-text-muted">
            <li>
              <strong>Authenticity:</strong> All submitted past examination papers, class test questions, and tutorial problem sheets correspond genuinely to official past courses administered by the University of Ibadan Department of Statistics or affiliated service departments (e.g. Mathematics, Computer Science, Economics).
            </li>
            <li>
              <strong>No Fabricated Questions:</strong> Intentionally fabricating question papers, misleading academic sessions, or altering examination questions is strictly contrary to the ASSON motto (*"Facts from Reliable Figures"*) and the University of Ibadan Code of Student Conduct.
            </li>
            <li>
              <strong>Legibility:</strong> Uploads must be scanned or photographed with sufficient clarity so that equations, mathematical symbols, statistical tables, and questions are unambiguously readable.
            </li>
          </ul>
        </section>

        {/* Section 3: Non-Commercial Fair-Use Policy */}
        <section className="space-y-3 pt-4 border-t border-border-light">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-emerald-50 text-brand-green flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-200">
              3
            </span>
            <h2 className="text-base sm:text-lg font-bold text-text-main">
              Open Educational Fair Use & Zero Monetization
            </h2>
          </div>
          <p className="text-text-muted">
            All documents published on the ASSON UI Portal are distributed under non-commercial fair use for non-profit scholarly revision:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-text-muted">
            <li>
              <strong>Free Access:</strong> Access to preview, read, and download catalogued materials is completely free and login-free for all students.
            </li>
            <li>
              <strong>Prohibition of Resale:</strong> No individual, student group, tutorial center, or commercial vendor is permitted to download, repackage, water-mark, or sell materials obtained from this platform.
            </li>
            <li>
              <strong>No Paywalls:</strong> ASSON UI will never introduce subscriptions, paywalls, or download limits for Statistics students.
            </li>
          </ul>
        </section>

        {/* Section 4: Copyright, Attribution & Takedown Procedure */}
        <section className="space-y-3 pt-4 border-t border-border-light">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-emerald-50 text-brand-green flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-200">
              4
            </span>
            <h2 className="text-base sm:text-lg font-bold text-text-main">
              Faculty Rights & Takedown Procedure
            </h2>
          </div>
          <p className="text-text-muted">
            ASSON UI deeply respects the academic prerogatives and intellectual property of University of Ibadan faculty members and departmental lecturers:
          </p>
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-950 space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              Notice & Rapid Remediation Protocol:
            </div>
            <p className="text-xs leading-relaxed text-amber-900/90">
              If an official departmental lecturer, examiner, or course coordinator requests that a specific set of lecture notes, unpublished research datasets, or exam questions be modified, updated with revised editions, or delisted from the repository, ASSON Executive Committee acts immediately upon notice.
            </p>
            <p className="text-xs text-amber-900/90">
              Inquiries or removal requests should be sent directly to <strong className="font-mono">asson@ui.edu.ng</strong> or submitted through the <Link to="/help" className="underline font-bold text-amber-950">Where to Get Help Directory</Link>. Inquiries are typically reviewed and resolved within 24 to 48 hours.
            </p>
          </div>
        </section>

        {/* Section 5: Contributor License */}
        <section className="space-y-3 pt-4 border-t border-border-light">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-emerald-50 text-brand-green flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-200">
              5
            </span>
            <h2 className="text-base sm:text-lg font-bold text-text-main">
              Contributor Submission Rights & Peer Credit
            </h2>
          </div>
          <p className="text-text-muted">
            When you submit a document through the ASSON Portal:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-text-muted">
            <li>
              You grant ASSON UI a non-exclusive, royalty-free, perpetual license to host, format, compress, generate previews of, and distribute the document for educational purposes.
            </li>
            <li>
              Contributor names and matriculation numbers are strictly optional. If provided, they serve exclusively as peer attribution on the resource card and within the student dashboard.
            </li>
            <li>
              Contributors retain their underlying personal notes and study summaries; submission does not transfer private ownership.
            </li>
          </ul>
        </section>

        {/* Section 6: Editorial Vetting & Disclaimers */}
        <section className="space-y-3 pt-4 border-t border-border-light">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-emerald-50 text-brand-green flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-200">
              6
            </span>
            <h2 className="text-base sm:text-lg font-bold text-text-main">
              Editorial Disclaimers & Curricular Verification
            </h2>
          </div>
          <p className="text-text-muted">
            While the ASSON Academic Editorial Committee verifies past questions for curriculum alignment and session accuracy:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-text-muted">
            <li>
              Materials are provided *"as is"* as supplementary revision aids. They do not constitute an official curriculum promise or guarantee of future examination structures.
            </li>
            <li>
              Students are advised to cross-check past questions with their course coordinators' current syllabus outlines and recommended departmental textbooks.
            </li>
            <li>
              ASSON UI accepts no liability for syllabus modifications enacted by the University Senate between academic sessions.
            </li>
          </ul>
        </section>

        {/* Footer Contact Strip */}
        <div className="pt-6 border-t border-border-light flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-text-muted">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-green shrink-0" />
            <span>Academic Committee • ASSON University of Ibadan Chapter</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/privacy" className="text-brand-green font-semibold hover:underline">
              Read Privacy Policy →
            </Link>
            <Link to="/help" className="text-brand-green font-semibold hover:underline">
              Contact Editorial Board →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
