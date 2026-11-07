import React, { useState, useEffect } from 'react';
import { MOCK_AUDIT_LOGS, MOCK_SUBMISSIONS, MOCK_RESOURCES, MOCK_NOTICES, MOCK_OPPORTUNITIES, MOCK_FAQS } from '../lib/mockData';
import { 
  fetchAuditLogs, 
  fetchStudentSubmissions, 
  fetchResources, 
  approveSubmissionInDb, 
  requestChangesOnSubmissionInDb,
  adminSignIn, 
  adminSignOut, 
  verifyExecutiveRole,
  fetchNotices,
  createNoticeInDb,
  deleteNoticeInDb,
  fetchOpportunities,
  createOpportunityInDb,
  deleteOpportunityInDb,
  fetchFaqs,
  createFaqInDb,
  deleteFaqInDb,
  supabase 
} from '../lib/supabase';
import { 
  AuditLog, 
  StudentSubmission, 
  AcademicResource, 
  Notice, 
  Opportunity, 
  FAQItem, 
  NoticeCategory, 
  OpportunityCategory 
} from '../types';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { AnalyticsChart } from '../components/features/admin/AnalyticsChart';
import { CourseDemandLeaderboard } from '../components/features/admin/CourseDemandLeaderboard';
import { useToast } from '../components/ui/Toast';
import { 
  ShieldAlert, 
  CheckCircle, 
  XCircle, 
  FileCheck, 
  History, 
  TrendingUp, 
  Lock, 
  KeyRound, 
  LogOut, 
  AlertCircle,
  PlusCircle,
  X,
  Eye,
  FileText,
  Mail,
  Bell,
  Briefcase,
  HelpCircle,
  Trash2,
  Calendar,
  ExternalLink,
  ShieldCheck,
  Check
} from 'lucide-react';

interface AdminPageProps {
  onOpenSubmit?: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onOpenSubmit }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('asson_admin_authenticated') === 'true';
  });
  const [adminRole, setAdminRole] = useState<string>(() => {
    return sessionStorage.getItem('asson_admin_role') || 'editor';
  });
  const [adminEmail, setAdminEmail] = useState<string>(() => {
    return sessionStorage.getItem('asson_admin_email') || '';
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  type TabKey = 'moderation' | 'notices' | 'opportunities' | 'faqs' | 'analytics' | 'audit';
  const [activeTab, setActiveTab] = useState<TabKey>('moderation');

  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [resourcesCount, setResourcesCount] = useState<number>(MOCK_RESOURCES.length);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);

  // Modal states
  const [feedbackTarget, setFeedbackTarget] = useState<StudentSubmission | null>(null);
  const [feedbackNote, setFeedbackNote] = useState('');

  // CMS Creation Modals
  const [isCreateNoticeOpen, setIsCreateNoticeOpen] = useState(false);
  const [noticeForm, setNoticeForm] = useState({
    title: '',
    summary: '',
    content: '',
    category: 'Department' as NoticeCategory,
    isUrgent: false,
    issuer: 'ASSON Academic Committee',
    deadline: '',
    effectiveDate: ''
  });

  const [isCreateOppOpen, setIsCreateOppOpen] = useState(false);
  const [oppForm, setOppForm] = useState({
    title: '',
    provider: '',
    category: 'Internship' as OpportunityCategory,
    deadline: '',
    eligibility: 'Statistics Students (100L - 400L)',
    description: '',
    applicationUrl: '',
    location: 'Ibadan / Remote'
  });

  const [isCreateFaqOpen, setIsCreateFaqOpen] = useState(false);
  const [faqForm, setFaqForm] = useState({
    question: '',
    answer: '',
    category: 'Academics' as 'Academics' | 'Resources' | 'ASSON' | 'Submissions'
  });

  const toast = useToast();

  useEffect(() => {
    // Cryptographically verify session against Supabase if client claims to be authenticated
    if (sessionStorage.getItem('asson_admin_authenticated') === 'true') {
      if (supabase) {
        supabase.auth.getUser().then(async ({ data, error }) => {
          if (error || !data?.user) {
            setIsAuthenticated(false);
            sessionStorage.removeItem('asson_admin_authenticated');
            sessionStorage.removeItem('asson_admin_email');
            sessionStorage.removeItem('asson_admin_role');
          } else {
            const roleCheck = await verifyExecutiveRole(data.user.id);
            if (!roleCheck.isAuthorized) {
              await adminSignOut();
              setIsAuthenticated(false);
              toast.error('Session Revoked', 'Your account does not have authorized executive roles in the database.');
            } else {
              setAdminRole(roleCheck.role || 'editor');
              setAdminEmail(data.user.email || '');
            }
          }
        }).catch(() => {
          setIsAuthenticated(false);
          sessionStorage.removeItem('asson_admin_authenticated');
        });
      }
    }

    // Load initial datasets
    fetchStudentSubmissions().then((data) => setSubmissions(data || []));
    fetchAuditLogs().then((data) => setAuditLogs(data || []));
    fetchResources().then((data) => {
      if (data && data.length > 0) setResourcesCount(data.length);
    });
    fetchNotices().then((data) => setNotices(data.length > 0 ? data : MOCK_NOTICES));
    fetchOpportunities().then((data) => setOpportunities(data.length > 0 ? data : MOCK_OPPORTUNITIES));
    fetchFaqs().then((data) => setFaqs(data || MOCK_FAQS));
  }, []);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim()) {
      setAuthError('Please provide your executive email address.');
      return;
    }
    setIsLoggingIn(true);
    setAuthError(null);

    const res = await adminSignIn(email, password);
    setIsLoggingIn(false);

    if (res.success) {
      setIsAuthenticated(true);
      setAdminRole(res.role || 'editor');
      setAdminEmail(email.trim());
      toast.success('Executive Access Granted', `Authenticated as ${res.role?.toUpperCase() || 'EXECUTIVE'} (${email})`);
    } else {
      setAuthError(res.error || 'Authentication failed. Please verify credentials and role authorization.');
    }
  };

  const handleLogout = async () => {
    await adminSignOut();
    setIsAuthenticated(false);
    toast.info('Session Ended', 'Logged out of ASSON Admin Console');
  };

  const handleApprove = async (id: string, title: string) => {
    const targetSub = submissions.find((s) => s.id === id);
    if (!targetSub) return;

    const res = await approveSubmissionInDb(id, { ...targetSub, status: 'Approved' });
    if (!res.success) {
      toast.error('Approval Failed', res.error || 'Database transaction rejected approval.');
      return;
    }

    setSubmissions((prev) =>
      prev.map((sub) =>
        sub.id === id ? { ...sub, status: 'Approved' as const, feedback: 'Approved by ASSON Editorial Board.' } : sub
      )
    );
    toast.success('Submission Approved', `"${title}" is published to the public library`);
  };

  const handleConfirmChanges = async () => {
    if (!feedbackTarget) return;
    const note = feedbackNote.trim() || 'Please re-scan at higher resolution (pages are unclear).';

    const res = await requestChangesOnSubmissionInDb(feedbackTarget.id, note);
    if (!res.success) {
      toast.error('Revision Request Failed', res.error || 'Failed to update submission.');
      return;
    }

    setSubmissions((prev) =>
      prev.map((sub) =>
        sub.id === feedbackTarget.id
          ? { ...sub, status: 'Changes Requested' as const, feedback: note }
          : sub
      )
    );
    toast.info('Revision Dispatched', `Feedback sent for "${feedbackTarget.resourceTitle}"`);
    setFeedbackTarget(null);
    setFeedbackNote('');
  };

  // --- CMS Handlers ---
  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeForm.title.trim() || !noticeForm.content.trim()) {
      toast.error('Validation Error', 'Notice Title and Content are required.');
      return;
    }

    const res = await createNoticeInDb(noticeForm);
    if (!res.success) {
      toast.error('Failed to Create Notice', res.error || 'Database rejection.');
      return;
    }

    const newNotice: Notice = {
      id: `notice-${Date.now()}`,
      title: noticeForm.title.trim(),
      summary: noticeForm.summary.trim() || noticeForm.title.trim(),
      content: noticeForm.content.trim(),
      category: noticeForm.category,
      isUrgent: noticeForm.isUrgent,
      publishedDate: new Date().toISOString().split('T')[0],
      deadline: noticeForm.deadline || undefined,
      effectiveDate: noticeForm.effectiveDate || undefined,
      issuer: noticeForm.issuer.trim() || 'ASSON Secretariat',
      isExpired: false
    };

    setNotices((prev) => [newNotice, ...prev]);
    setIsCreateNoticeOpen(false);
    setNoticeForm({
      title: '',
      summary: '',
      content: '',
      category: 'Department',
      isUrgent: false,
      issuer: 'ASSON Academic Committee',
      deadline: '',
      effectiveDate: ''
    });
    toast.success('Notice Published', `"${newNotice.title}" is now visible to all students`);
  };

  const handleDeleteNotice = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete notice: "${title}"?`)) return;
    const res = await deleteNoticeInDb(id);
    if (!res.success) {
      toast.error('Delete Failed', res.error || 'Failed to remove notice.');
      return;
    }
    setNotices((prev) => prev.filter((n) => n.id !== id));
    toast.info('Notice Deleted', `Removed "${title}" from the notice board.`);
  };

  const handleCreateOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oppForm.title.trim() || !oppForm.provider.trim() || !oppForm.applicationUrl.trim()) {
      toast.error('Validation Error', 'Title, Provider, and Application URL are required.');
      return;
    }

    const res = await createOpportunityInDb(oppForm);
    if (!res.success) {
      toast.error('Failed to Add Opportunity', res.error || 'Database rejection.');
      return;
    }

    const newOpp: Opportunity = {
      id: `opp-${Date.now()}`,
      title: oppForm.title.trim(),
      provider: oppForm.provider.trim(),
      category: oppForm.category,
      deadline: oppForm.deadline || '2026-12-31',
      eligibility: oppForm.eligibility.trim(),
      description: oppForm.description.trim(),
      applicationUrl: oppForm.applicationUrl.trim(),
      location: oppForm.location.trim() || 'National',
      isVerified: true,
      isExpired: false,
      postedDate: new Date().toISOString().split('T')[0]
    };

    setOpportunities((prev) => [newOpp, ...prev]);
    setIsCreateOppOpen(false);
    setOppForm({
      title: '',
      provider: '',
      category: 'Internship',
      deadline: '',
      eligibility: 'Statistics Students (100L - 400L)',
      description: '',
      applicationUrl: '',
      location: 'Ibadan / Remote'
    });
    toast.success('Opportunity Published', `"${newOpp.title}" is now visible in the Opportunities Hub`);
  };

  const handleDeleteOpportunity = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to remove opportunity: "${title}"?`)) return;
    const res = await deleteOpportunityInDb(id);
    if (!res.success) {
      toast.error('Delete Failed', res.error || 'Failed to remove opportunity.');
      return;
    }
    setOpportunities((prev) => prev.filter((o) => o.id !== id));
    toast.info('Opportunity Removed', `Removed "${title}" from the platform.`);
  };

  const handleCreateFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqForm.question.trim() || !faqForm.answer.trim()) {
      toast.error('Validation Error', 'Both Question and Answer are required.');
      return;
    }

    const res = await createFaqInDb(faqForm);
    if (!res.success) {
      toast.error('Failed to Create FAQ', res.error || 'Database rejection.');
      return;
    }

    const newFaq: FAQItem = {
      id: `faq-${Date.now()}`,
      question: faqForm.question.trim(),
      answer: faqForm.answer.trim(),
      category: faqForm.category
    };

    setFaqs((prev) => [newFaq, ...prev]);
    setIsCreateFaqOpen(false);
    setFaqForm({ question: '', answer: '', category: 'Academics' });
    toast.success('FAQ Added', 'New guidance entry added to student knowledge base.');
  };

  const handleDeleteFaq = async (id: string) => {
    if (!confirm('Are you sure you want to remove this FAQ?')) return;
    const res = await deleteFaqInDb(id);
    if (!res.success) {
      toast.error('Delete Failed', res.error || 'Failed to delete FAQ.');
      return;
    }
    setFaqs((prev) => prev.filter((f) => f.id !== id));
    toast.info('FAQ Removed', 'Removed item from knowledge base.');
  };

  // If not authenticated, render executive gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-surface-card border border-border-light shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-950 to-brand-green text-white flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-brand-green text-[11px] font-bold border border-emerald-200 dark:border-emerald-800 mb-2">
              <ShieldAlert className="w-3.5 h-3.5" /> Department Executive Portal
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-text-main tracking-tight">
              ASSON Admin & Analytics
            </h2>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              Restricted console for the ASSON Academic Directorate and Department Executives. Access requires verified role assignment (`editor` or `admin`).
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="text-xs font-bold text-text-main block mb-1.5">
                Executive Email Identity
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="e.g. executive@asson.ui.edu.ng"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setAuthError(null);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-surface-bg text-text-main text-xs focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
                />
                <Mail className="w-4 h-4 text-text-muted absolute right-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-text-main block mb-1.5">
                Executive Access Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Enter executive password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setAuthError(null);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-border-light bg-surface-bg text-text-main text-xs font-mono focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
                />
                <KeyRound className="w-4 h-4 text-text-muted absolute right-3.5 top-3" />
              </div>
              {authError && (
                <p className="text-[11px] text-brand-red font-medium mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {authError}
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isLoggingIn}
              className="w-full justify-center font-bold text-xs h-11 shadow-md hover:shadow-lg"
            >
              {isLoggingIn ? 'Verifying Credentials...' : 'Unlock Executive Console'}
            </Button>
          </form>

          <div className="text-[10px] text-text-subtle pt-2 border-t border-border-light/60">
            Association of Statistics Students of Nigeria • University of Ibadan Chapter
          </div>
        </div>
      </div>
    );
  }

  const pendingSubmissions = submissions.filter((s) => s.status === 'Under Review');

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6 sm:space-y-8">
      {/* Executive Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-950 via-brand-deep to-[#053b21] text-white p-6 sm:p-8 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1 rounded-md bg-white/10 text-emerald-300">
              <ShieldAlert className="w-4 h-4" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-200">
              Executive Governance & Telemetry Console
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Platform Intelligence & Editorial Hub
          </h1>
          <p className="text-xs text-emerald-100/80 mt-1 max-w-2xl leading-relaxed">
            Manage academic materials, broadcast verified notices, publish scholarship opportunities, and inspect telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
          <div className="text-right hidden sm:block">
            <div className="flex items-center gap-1.5 justify-end">
              <span className="text-xs font-bold text-white block">{adminEmail || 'ASSON Executive'}</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-[10px] font-mono font-bold uppercase border border-emerald-400/40">
                {adminRole}
              </span>
            </div>
            <span className="text-[10px] text-emerald-300/80">ASSON UI Directorate</span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-white/30 bg-white/15 hover:bg-white/25 text-white text-xs font-bold backdrop-blur-md transition-all active:scale-95 cursor-pointer shadow-xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Top Telemetry Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl border border-border-light bg-surface-card shadow-card">
          <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
            Catalogued Materials
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-brand-deep dark:text-emerald-400 mt-1 block">
            {resourcesCount}
          </span>
          <span className="text-[11px] text-brand-green font-semibold mt-1 block">
            Verified in catalog
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-border-light bg-surface-card shadow-card">
          <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
            Pending Editorial Vetting
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-1 block">
            {pendingSubmissions.length}
          </span>
          <span className="text-[11px] text-text-muted font-medium mt-1 block">
            Awaiting verification
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-border-light bg-surface-card shadow-card">
          <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
            Active Notices
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-text-main mt-1 block">
            {notices.filter(n => !n.isExpired).length}
          </span>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-1 block">
            Broadcast live
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-border-light bg-surface-card shadow-card">
          <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
            Live Opportunities
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-[#0284c7] mt-1 block">
            {opportunities.filter(o => !o.isExpired).length}
          </span>
          <span className="text-[11px] text-text-muted font-medium mt-1 block">
            Scholarships & Internships
          </span>
        </div>
      </div>

      {/* Navigation Tabs - Segmented Control */}
      <div className="flex items-center gap-1 sm:gap-2 border-b border-border-light pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('moderation')}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'moderation'
              ? 'bg-brand-green text-white shadow-xs'
              : 'text-text-muted hover:text-text-main hover:bg-surface-bg'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          Submissions ({submissions.length})
        </button>

        <button
          onClick={() => setActiveTab('notices')}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'notices'
              ? 'bg-brand-green text-white shadow-xs'
              : 'text-text-muted hover:text-text-main hover:bg-surface-bg'
          }`}
        >
          <Bell className="w-4 h-4" />
          Notices ({notices.length})
        </button>

        <button
          onClick={() => setActiveTab('opportunities')}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'opportunities'
              ? 'bg-brand-green text-white shadow-xs'
              : 'text-text-muted hover:text-text-main hover:bg-surface-bg'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Opportunities ({opportunities.length})
        </button>

        <button
          onClick={() => setActiveTab('faqs')}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'faqs'
              ? 'bg-brand-green text-white shadow-xs'
              : 'text-text-muted hover:text-text-main hover:bg-surface-bg'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          FAQs ({faqs.length})
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'analytics'
              ? 'bg-brand-green text-white shadow-xs'
              : 'text-text-muted hover:text-text-main hover:bg-surface-bg'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Analytics
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'audit'
              ? 'bg-brand-green text-white shadow-xs'
              : 'text-text-muted hover:text-text-main hover:bg-surface-bg'
          }`}
        >
          <History className="w-4 h-4" />
          Audit Logs ({auditLogs.length})
        </button>
      </div>

      {/* TAB 1: Submissions Moderation Queue */}
      {activeTab === 'moderation' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-text-main tracking-tight">
                Uploaded Academic Materials & Submissions ({submissions.length} Total)
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                All materials submitted by students and course reps, verified and catalogued.
              </p>
            </div>
            {onOpenSubmit && (
              <Button
                size="sm"
                variant="primary"
                onClick={onOpenSubmit}
                className="text-xs h-8.5 font-bold shadow-xs self-start sm:self-auto shrink-0"
              >
                <PlusCircle className="w-3.5 h-3.5 mr-1.5" /> Submit New Material
              </Button>
            )}
          </div>

          <div className="overflow-hidden rounded-2xl border border-border-light bg-surface-card shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs" aria-label="Student Submissions Moderation Queue">
                <caption className="sr-only">Uploaded Academic Materials & Submissions Moderation Table</caption>
                <thead>
                  <tr className="border-b border-border-light bg-surface-bg font-bold text-text-muted">
                    <th scope="col" className="py-3.5 px-4">Course</th>
                    <th scope="col" className="py-3.5 px-4">Material Title</th>
                    <th scope="col" className="py-3.5 px-4">Contributor / Reference</th>
                    <th scope="col" className="py-3.5 px-4">Type & Session</th>
                    <th scope="col" className="py-3.5 px-4">Status</th>
                    <th scope="col" className="py-3.5 px-4 text-right">Document Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light/60">
                  {submissions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-text-muted">
                        <FileText className="w-8 h-8 text-text-subtle mx-auto mb-2 opacity-40" />
                        <p className="font-semibold text-text-main text-xs">No Submissions Recorded Yet</p>
                        <p className="text-[11px] text-text-muted mt-0.5 max-w-sm mx-auto">
                          When students or course reps upload academic documents, they will appear here directly in real time.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    submissions.map((sub) => {
                      const fileUrl = sub.filePath
                        ? `https://cvhjohbknghlmspoaenr.supabase.co/storage/v1/object/public/resources/${sub.filePath.replace(/^resources\//, '')}`
                        : null;

                      return (
                        <tr key={sub.id} className="hover:bg-surface-bg/60 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-brand-deep">
                            <Badge variant="course">{sub.courseCode}</Badge>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-text-main max-w-xs truncate">
                            {sub.resourceTitle}
                          </td>
                          <td className="py-3.5 px-4 text-text-muted text-[11px]">
                            {sub.feedback || 'Student Peer Contributor'}
                          </td>
                          <td className="py-3.5 px-4 text-text-muted font-medium">
                            <span>{sub.resourceType}</span>
                            <span className="text-[10px] text-text-subtle block font-mono">{sub.session}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <Badge 
                              variant={
                                sub.status === 'Approved' ? 'approved' :
                                sub.status === 'Under Review' ? 'pending' : 'changes-requested'
                              }
                              withIcon
                            >
                              {sub.status === 'Approved' ? 'Live & Published' : sub.status}
                            </Badge>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {fileUrl && (
                                <a
                                  href={fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-bg border border-border-light hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-brand-green text-[11px] font-semibold text-text-main transition-colors shrink-0"
                                  title="Preview Uploaded File"
                                >
                                  <Eye className="w-3.5 h-3.5" /> Preview
                                </a>
                              )}
                              {sub.status === 'Under Review' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="primary"
                                    onClick={() => handleApprove(sub.id, sub.resourceTitle)}
                                    className="h-7 text-xs px-2.5 font-bold shadow-xs"
                                  >
                                    <CheckCircle className="w-3 h-3 mr-1" /> Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setFeedbackTarget(sub);
                                      setFeedbackNote('');
                                    }}
                                    className="h-7 text-xs px-2 font-semibold text-amber-700 hover:bg-amber-50"
                                  >
                                    <XCircle className="w-3 h-3 mr-1" /> Request Changes
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Notices & Announcements CMS */}
      {activeTab === 'notices' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-text-main tracking-tight">
                Departmental Notice Board Management
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Publish verified announcements, timetable releases, and Senate notices for UI Statistics students.
              </p>
            </div>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsCreateNoticeOpen(true)}
              className="text-xs h-8.5 font-bold shadow-xs self-start sm:self-auto shrink-0"
            >
              <PlusCircle className="w-3.5 h-3.5 mr-1.5" /> Broadcast New Notice
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notices.map((n) => (
              <div 
                key={n.id} 
                className="p-4 sm:p-5 rounded-2xl border border-border-light bg-surface-card shadow-card space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        n.category === 'Department' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' :
                        n.category === 'University' ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300' :
                        'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                      }`}>
                        {n.category}
                      </span>
                      {n.isUrgent && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 animate-pulse">
                          Urgent
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-text-subtle font-mono">{n.publishedDate}</span>
                  </div>

                  <h4 className="text-sm font-bold text-text-main leading-snug">
                    {n.title}
                  </h4>
                  <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                    {n.summary || n.content}
                  </p>
                </div>

                <div className="pt-2 border-t border-border-light/60 flex items-center justify-between text-xs">
                  <span className="text-text-subtle text-[11px]">Issuer: {n.issuer}</span>
                  <button
                    onClick={() => handleDeleteNotice(n.id, n.title)}
                    className="p-1.5 rounded-lg text-text-muted hover:text-brand-red hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                    title="Delete Notice"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Opportunities CMS */}
      {activeTab === 'opportunities' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-text-main tracking-tight">
                Scholarships & Career Opportunities Management
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Curate verified data science internships, industrial training (IT/SIWES), and national scholarships.
              </p>
            </div>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsCreateOppOpen(true)}
              className="text-xs h-8.5 font-bold shadow-xs self-start sm:self-auto shrink-0"
            >
              <PlusCircle className="w-3.5 h-3.5 mr-1.5" /> Add Opportunity
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {opportunities.map((opp) => (
              <div 
                key={opp.id} 
                className="p-4 sm:p-5 rounded-2xl border border-border-light bg-surface-card shadow-card space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      {opp.category}
                    </span>
                    <span className="text-[10px] text-text-subtle font-mono">Deadline: {opp.deadline}</span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-text-main leading-snug">
                      {opp.title}
                    </h4>
                    <p className="text-[11px] text-brand-green font-semibold mt-0.5">
                      {opp.provider} • {opp.location}
                    </p>
                  </div>

                  <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                    {opp.description}
                  </p>
                  <p className="text-[11px] text-text-subtle">
                    <strong>Eligibility:</strong> {opp.eligibility}
                  </p>
                </div>

                <div className="pt-2 border-t border-border-light/60 flex items-center justify-between text-xs">
                  <a
                    href={opp.applicationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-green hover:underline"
                  >
                    Application Link <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    onClick={() => handleDeleteOpportunity(opp.id, opp.title)}
                    className="p-1.5 rounded-lg text-text-muted hover:text-brand-red hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                    title="Delete Opportunity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: FAQs Management */}
      {activeTab === 'faqs' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-text-main tracking-tight">
                Academic FAQs & Guidance Management
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Update the official FAQ accordion covering grading systems, past questions, and contribution standards.
              </p>
            </div>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsCreateFaqOpen(true)}
              className="text-xs h-8.5 font-bold shadow-xs self-start sm:self-auto shrink-0"
            >
              <PlusCircle className="w-3.5 h-3.5 mr-1.5" /> Add New FAQ
            </Button>
          </div>

          <div className="space-y-3">
            {faqs.map((f) => (
              <div 
                key={f.id} 
                className="p-4 rounded-2xl border border-border-light bg-surface-card shadow-card flex items-start justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-surface-bg border border-border-light text-text-muted">
                      {f.category}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-text-main">
                      {f.question}
                    </h4>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed pl-1">
                    {f.answer}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteFaq(f.id)}
                  className="p-1.5 rounded-lg text-text-muted hover:text-brand-red hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors shrink-0"
                  title="Delete FAQ"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: Analytics & Telemetry */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <AnalyticsChart />
          <CourseDemandLeaderboard />
        </div>
      )}

      {/* TAB 6: Platform Audit Logs */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-extrabold text-text-main tracking-tight">
              Platform Security & Editorial Audit Logs
            </h3>
            <span className="text-xs text-text-muted">
              Role-protected immutable ledger of executive actions and publications.
            </span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border-light bg-surface-card shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs" aria-label="Platform Security and Administrative Audit Logs">
                <caption className="sr-only">Platform Activity and Administrative Audit Logs</caption>
                <thead>
                  <tr className="border-b border-border-light bg-surface-bg font-bold text-text-muted">
                    <th scope="col" className="py-3.5 px-4">Executive / User</th>
                    <th scope="col" className="py-3.5 px-4">Action</th>
                    <th scope="col" className="py-3.5 px-4">Target Entity</th>
                    <th scope="col" className="py-3.5 px-4">Details</th>
                    <th scope="col" className="py-3.5 px-4 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light/60">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-text-muted">
                        <History className="w-8 h-8 text-text-subtle mx-auto mb-2 opacity-40" />
                        <p className="font-semibold text-text-main text-xs">No Audit Logs Recorded Yet</p>
                        <p className="text-[11px] text-text-muted mt-0.5">Platform administrative actions and publish events will appear here.</p>
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => {
                      const actionBadge = 
                        log.action === 'PUBLISH' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                        log.action === 'VERIFY' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                        log.action === 'CREATE' ? 'bg-teal-50 text-teal-800 border-teal-200' :
                        log.action === 'DELETE' ? 'bg-red-50 text-red-800 border-red-200' :
                        'bg-gray-100 text-gray-800 border-gray-200';

                      return (
                        <tr key={log.id} className="hover:bg-surface-bg/60 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-text-main">
                            {log.user}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${actionBadge}`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-text-main font-semibold">
                            {log.entity}
                          </td>
                          <td className="py-3.5 px-4 text-text-muted">
                            {log.details}
                          </td>
                          <td className="py-3.5 px-4 text-right text-text-subtle font-mono">
                            {log.timestamp}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 1: Request Changes --- */}
      {feedbackTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setFeedbackTarget(null)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
          />
          <div className="relative z-10 w-full max-w-md rounded-3xl bg-surface-card p-6 shadow-2xl border border-border-light space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-border-light">
              <h3 className="text-sm font-bold text-text-main">
                Request Revisions from Contributor
              </h3>
              <button
                onClick={() => setFeedbackTarget(null)}
                className="p-1.5 text-text-muted hover:text-text-main rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-surface-bg text-xs">
              <span className="font-bold text-brand-deep dark:text-emerald-400 block">{feedbackTarget.resourceTitle}</span>
              <span className="text-[11px] text-text-muted">{feedbackTarget.courseCode} • {feedbackTarget.session}</span>
            </div>

            <div>
              <label className="text-xs font-bold text-text-main block mb-1.5">
                Feedback for Student (What needs fixing?)
              </label>
              <textarea
                rows={3}
                value={feedbackNote}
                onChange={(e) => setFeedbackNote(e.target.value)}
                placeholder="e.g. Page 3 is blurry. Please scan in higher resolution using CamScanner and re-submit."
                className="w-full p-3 rounded-xl border border-border-light text-xs text-text-main bg-surface-bg focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[
                'Blurry page scan',
                'Missing worked solutions',
                'Wrong session labeled',
                'Incomplete document'
              ].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setFeedbackNote(tag)}
                  className="px-2.5 py-1 rounded-lg bg-surface-bg border border-border-light text-[11px] text-text-muted hover:text-brand-green hover:border-brand-green/40 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-light">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFeedbackTarget(null)}
                className="text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmChanges}
                className="text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white"
              >
                Dispatch Revision Request
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: Create Notice --- */}
      {isCreateNoticeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setIsCreateNoticeOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
          />
          <div className="relative z-10 w-full max-w-lg rounded-3xl bg-surface-card p-6 shadow-2xl border border-border-light space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-border-light">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-brand-green" />
                <h3 className="text-sm font-bold text-text-main">Broadcast Departmental Notice</h3>
              </div>
              <button
                onClick={() => setIsCreateNoticeOpen(false)}
                className="p-1.5 text-text-muted hover:text-text-main rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNotice} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-text-main block mb-1">Notice Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Revised First Semester 2024/2025 Examination Timetable"
                  value={noticeForm.title}
                  onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-light bg-surface-bg text-text-main focus:outline-none focus:border-brand-green"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-text-main block mb-1">Category</label>
                  <select
                    value={noticeForm.category}
                    onChange={(e) => setNoticeForm({ ...noticeForm, category: e.target.value as NoticeCategory })}
                    className="w-full px-3 py-2 rounded-xl border border-border-light bg-surface-bg text-text-main focus:outline-none focus:border-brand-green"
                  >
                    <option value="Department">Department of Statistics</option>
                    <option value="ASSON">ASSON UI Secretariat</option>
                    <option value="Faculty">Faculty of Science</option>
                    <option value="University">University Senate</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-text-main block mb-1">Issuer Authority</label>
                  <input
                    type="text"
                    placeholder="e.g. HOD / Exam Officer"
                    value={noticeForm.issuer}
                    onChange={(e) => setNoticeForm({ ...noticeForm, issuer: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border-light bg-surface-bg text-text-main focus:outline-none focus:border-brand-green"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-text-main block mb-1">Summary / Lead Paragraph</label>
                <input
                  type="text"
                  placeholder="Short brief visible on notice cards"
                  value={noticeForm.summary}
                  onChange={(e) => setNoticeForm({ ...noticeForm, summary: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-light bg-surface-bg text-text-main focus:outline-none focus:border-brand-green"
                />
              </div>

              <div>
                <label className="font-bold text-text-main block mb-1">Full Announcement Body *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detailed text of the announcement..."
                  value={noticeForm.content}
                  onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                  className="w-full p-3 rounded-xl border border-border-light bg-surface-bg text-text-main focus:outline-none focus:border-brand-green"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-text-main">
                  <input
                    type="checkbox"
                    checked={noticeForm.isUrgent}
                    onChange={(e) => setNoticeForm({ ...noticeForm, isUrgent: e.target.checked })}
                    className="rounded text-brand-green focus:ring-brand-green"
                  />
                  <span>Mark as Urgent / Priority Banner</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-light">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateNoticeOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="font-bold"
                >
                  Publish Notice
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: Create Opportunity --- */}
      {isCreateOppOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setIsCreateOppOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
          />
          <div className="relative z-10 w-full max-w-lg rounded-3xl bg-surface-card p-6 shadow-2xl border border-border-light space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-border-light">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-brand-green" />
                <h3 className="text-sm font-bold text-text-main">Publish Opportunity</h3>
              </div>
              <button
                onClick={() => setIsCreateOppOpen(false)}
                className="p-1.5 text-text-muted hover:text-text-main rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOpportunity} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-text-main block mb-1">Opportunity Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MTN Foundation Science & Technology Scholarship 2026"
                  value={oppForm.title}
                  onChange={(e) => setOppForm({ ...oppForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-light bg-surface-bg text-text-main focus:outline-none focus:border-brand-green"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-text-main block mb-1">Provider / Organization *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MTN Foundation"
                    value={oppForm.provider}
                    onChange={(e) => setOppForm({ ...oppForm, provider: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border-light bg-surface-bg text-text-main focus:outline-none focus:border-brand-green"
                  />
                </div>

                <div>
                  <label className="font-bold text-text-main block mb-1">Category</label>
                  <select
                    value={oppForm.category}
                    onChange={(e) => setOppForm({ ...oppForm, category: e.target.value as OpportunityCategory })}
                    className="w-full px-3 py-2 rounded-xl border border-border-light bg-surface-bg text-text-main focus:outline-none focus:border-brand-green"
                  >
                    <option value="Scholarship">Scholarship</option>
                    <option value="Internship">Internship / SIWES</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-text-main block mb-1">Deadline Date</label>
                  <input
                    type="date"
                    required
                    value={oppForm.deadline}
                    onChange={(e) => setOppForm({ ...oppForm, deadline: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border-light bg-surface-bg text-text-main focus:outline-none focus:border-brand-green"
                  />
                </div>

                <div>
                  <label className="font-bold text-text-main block mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Ibadan / Remote / Nigeria"
                    value={oppForm.location}
                    onChange={(e) => setOppForm({ ...oppForm, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border-light bg-surface-bg text-text-main focus:outline-none focus:border-brand-green"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-text-main block mb-1">Eligibility Criteria</label>
                <input
                  type="text"
                  placeholder="e.g. 200L/300L Statistics students with CGPA >= 3.5"
                  value={oppForm.eligibility}
                  onChange={(e) => setOppForm({ ...oppForm, eligibility: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-light bg-surface-bg text-text-main focus:outline-none focus:border-brand-green"
                />
              </div>

              <div>
                <label className="font-bold text-text-main block mb-1">Application URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={oppForm.applicationUrl}
                  onChange={(e) => setOppForm({ ...oppForm, applicationUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-light bg-surface-bg text-text-main focus:outline-none focus:border-brand-green"
                />
              </div>

              <div>
                <label className="font-bold text-text-main block mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Brief details about the opportunity..."
                  value={oppForm.description}
                  onChange={(e) => setOppForm({ ...oppForm, description: e.target.value })}
                  className="w-full p-3 rounded-xl border border-border-light bg-surface-bg text-text-main focus:outline-none focus:border-brand-green"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-light">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateOppOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="font-bold"
                >
                  Publish Opportunity
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 4: Create FAQ --- */}
      {isCreateFaqOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setIsCreateFaqOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
          />
          <div className="relative z-10 w-full max-w-lg rounded-3xl bg-surface-card p-6 shadow-2xl border border-border-light space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-border-light">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-brand-green" />
                <h3 className="text-sm font-bold text-text-main">Add Knowledge Base FAQ</h3>
              </div>
              <button
                onClick={() => setIsCreateFaqOpen(false)}
                className="p-1.5 text-text-muted hover:text-text-main rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFaq} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-text-main block mb-1">Category</label>
                <select
                  value={faqForm.category}
                  onChange={(e) => setFaqForm({ ...faqForm, category: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-border-light bg-surface-bg text-text-main focus:outline-none focus:border-brand-green"
                >
                  <option value="Academics">Academics & Grading</option>
                  <option value="Resources">Past Questions & Downloads</option>
                  <option value="ASSON">ASSON UI Association</option>
                  <option value="Submissions">Material Contributions</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-text-main block mb-1">Student Question *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. How do I calculate my Statistics CGPA under UI 4.0 grading scale?"
                  value={faqForm.question}
                  onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-light bg-surface-bg text-text-main focus:outline-none focus:border-brand-green"
                />
              </div>

              <div>
                <label className="font-bold text-text-main block mb-1">Official Answer *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Clear, authoritative answer..."
                  value={faqForm.answer}
                  onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                  className="w-full p-3 rounded-xl border border-border-light bg-surface-bg text-text-main focus:outline-none focus:border-brand-green"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-light">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateFaqOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="font-bold"
                >
                  Save FAQ
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
