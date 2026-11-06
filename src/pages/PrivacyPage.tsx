import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Lock, 
  EyeOff, 
  Database, 
  Cookie, 
  ArrowLeft, 
  CheckCircle2,
  HardDrive
} from 'lucide-react';

export const PrivacyPage: React.FC = () => {
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
            <Lock className="w-4 h-4" />
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-200">
            Student Data Protection Standard
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Privacy & Student Data Policy
        </h1>
        <p className="text-xs sm:text-sm text-emerald-100/80 mt-2 max-w-2xl leading-relaxed">
          How ASSON UI protects student privacy through zero-login architecture, anonymous peer submissions, confidential feedback channels, and zero commercial tracking.
        </p>
        <div className="flex flex-wrap items-center gap-4 mt-5 pt-4 border-t border-white/15 text-[11px] text-emerald-200/90 font-mono">
          <span>Effective: 2024/2025 Session</span>
          <span>•</span>
          <span>Policy: Privacy by Design & Zero-Surveillance</span>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-6 sm:p-10 rounded-3xl bg-surface-card border border-border-light shadow-2xs space-y-8 text-xs sm:text-sm text-text-main leading-relaxed">
        {/* Core Principles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/70 space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-brand-green text-white flex items-center justify-center">
              <EyeOff className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-brand-deep">Zero Student Login</h3>
            <p className="text-xs text-emerald-900/80 leading-relaxed">
              No registration, passwords, or personal emails required to read or download past questions.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/70 space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-brand-green text-white flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-brand-deep">Write-Only Feedback</h3>
            <p className="text-xs text-emerald-900/80 leading-relaxed">
              Student feedback sent via the Help Directory is confidential and restricted strictly to vetted exco.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/70 space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-brand-green text-white flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-brand-deep">Zero Advertising</h3>
            <p className="text-xs text-emerald-900/80 leading-relaxed">
              Zero Google ad trackers, zero telemetry reselling, zero commercial user profiling.
            </p>
          </div>
        </div>

        {/* Section 1: Zero-Login Access */}
        <section className="space-y-3 pt-4 border-t border-border-light">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-emerald-50 text-brand-green flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-200">
              1
            </span>
            <h2 className="text-base sm:text-lg font-bold text-text-main">
              Zero-Login Architecture (Public Resource Access)
            </h2>
          </div>
          <p className="text-text-muted">
            The ASSON UI platform is deliberately architected to be <strong>zero-login by default</strong>. Students can search course codes, filter academic levels, preview documents, and download past examination papers without creating an account, providing an email address, or logging in through the University portal.
          </p>
        </section>

        {/* Section 2: Material Submissions Data */}
        <section className="space-y-3 pt-4 border-t border-border-light">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-emerald-50 text-brand-green flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-200">
              2
            </span>
            <h2 className="text-base sm:text-lg font-bold text-text-main">
              Data Collected During Document Uploads
            </h2>
          </div>
          <p className="text-text-muted">
            When a student contributes past questions or academic notes:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-text-muted">
            <li>
              <strong>Mandatory Upload Metadata:</strong> Course code, academic session, material type, document title, file size, and the uploaded PDF/DOCX file.
            </li>
            <li>
              <strong>Optional Contributor Credit:</strong> Contributor full name and matriculation number are completely optional. If a student chooses not to provide them, the submission remains 100% anonymous.
            </li>
            <li>
              <strong>Tracking Receipt:</strong> An anonymous tracking code (e.g., <code className="font-mono text-brand-deep font-semibold bg-emerald-50 px-1 py-0.5 rounded">SUB-2026-XXXXX</code>) is issued directly to the student's browser and stored locally in their device's <code className="font-mono">localStorage</code> so they can track its review progress in their personal dashboard without an account.
            </li>
          </ul>
        </section>

        {/* Section 3: Confidential Student Feedback */}
        <section className="space-y-3 pt-4 border-t border-border-light">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-emerald-50 text-brand-green flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-200">
              3
            </span>
            <h2 className="text-base sm:text-lg font-bold text-text-main">
              Confidentiality of Student Inquiries & Welfare Reports
            </h2>
          </div>
          <p className="text-text-muted">
            Inquiries, academic distress complaints, or feedback submitted through the <em>Private Student Feedback Centre</em> on the <Link to="/help" className="text-brand-green underline font-semibold">Where to Get Help</Link> page:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-text-muted">
            <li>
              Are saved into a secured, write-only database table protected by PostgreSQL Row-Level Security (RLS).
            </li>
            <li>
              Are inaccessible to other students, peers, or public web crawlers.
            </li>
            <li>
              Are audited and handled exclusively by designated Staff Advisers or the ASSON Welfare and Academic Executive Directors.
            </li>
          </ul>
        </section>

        {/* Section 4: Cookies, Offline Caching & Local Storage */}
        <section className="space-y-3 pt-4 border-t border-border-light">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-emerald-50 text-brand-green flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-200">
              4
            </span>
            <h2 className="text-base sm:text-lg font-bold text-text-main">
              Local Browser Caching & Zero Ad Trackers
            </h2>
          </div>
          <p className="text-text-muted">
            ASSON UI uses modern web storage solely for essential educational functionality:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-text-muted">
            <li>
              <strong>Progressive Web App (PWA) Cache:</strong> The Service Worker stores past question metadata and core app shells locally on your mobile device so the catalog loads instantly even during cellular network congestion on campus.
            </li>
            <li>
              <strong>Local Storage:</strong> Remembers your bookmarked past questions, active session filter, and your personal submission receipts.
            </li>
            <li>
              <strong>Zero Cross-Site Cookies:</strong> We do not set third-party marketing, analytics, or behavioral cookies.
            </li>
          </ul>
        </section>

        {/* Section 5: Data Security & Storage */}
        <section className="space-y-3 pt-4 border-t border-border-light">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-emerald-50 text-brand-green flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-200">
              5
            </span>
            <h2 className="text-base sm:text-lg font-bold text-text-main">
              Storage Architecture & Security Controls
            </h2>
          </div>
          <p className="text-text-muted">
            All academic documents and database records are housed on enterprise-grade cloud infrastructure (Supabase PostgreSQL with encrypted object storage buckets). Transmission across all endpoints is enforced via Transport Layer Security (HTTPS/TLS). Public download buckets are read-only; document modifications require multi-factor executive authorization.
          </p>
        </section>

        {/* Footer Link Strip */}
        <div className="pt-6 border-t border-border-light flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-text-muted">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-brand-green shrink-0" />
            <span>Data Protection Officer • ASSON Secretariat, University of Ibadan</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/terms" className="text-brand-green font-semibold hover:underline">
              Read Terms of Service →
            </Link>
            <Link to="/help" className="text-brand-green font-semibold hover:underline">
              Visit Help Directory →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
