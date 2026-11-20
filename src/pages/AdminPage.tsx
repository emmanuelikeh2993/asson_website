import React, { useState, useEffect, useMemo } from 'react';
import { 
  MOCK_AUDIT_LOGS, 
  MOCK_SUBMISSIONS, 
  MOCK_RESOURCES, 
  MOCK_NOTICES, 
  MOCK_OPPORTUNITIES, 
  MOCK_FAQS,
  MOCK_EXECUTIVES
} from '../lib/mockData';
import { 
  fetchAuditLogs, 
  fetchStudentSubmissions, 
  fetchResources, 
  approveSubmissionInDb, 
  requestChangesOnSubmissionInDb,
  adminSignIn, 
  adminSignOut, 
  fetchNotices,
  createNoticeInDb,
  deleteNoticeInDb,
  fetchOpportunities,
  createOpportunityInDb,
  deleteOpportunityInDb,
  fetchFaqs,
  createFaqInDb,
  deleteFaqInDb,
  fetchCalendarEvents,
  createCalendarEventInDb,
  deleteCalendarEventInDb,
  DEFAULT_CALENDAR_EVENTS,
  fetchEnterpriseListings,
  updateEnterpriseStatus,
  fetchElectedExecutives,
  createElectedExecutiveInDb,
  deleteElectedExecutiveInDb,
  fetchStaffMembers,
  createStaffMemberInDb,
  deleteStaffMemberInDb,
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
  OpportunityCategory,
  CalendarEvent,
  CalendarCategory,
  AcademicLevel,
  EnterpriseListing,
  ElectedExecutive,
  StaffMember
} from '../types';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { AnalyticsChart } from '../components/features/admin/AnalyticsChart';
import { CourseDemandLeaderboard } from '../components/features/admin/CourseDemandLeaderboard';
import { useToast } from '../components/ui/Toast';
import { 
  BarChart3, 
  ArrowRight, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ChevronDown, 
  LayoutDashboard, 
  Store, 
  Calendar, 
  Bell, 
  Briefcase, 
  HelpCircle, 
  TrendingUp, 
  History, 
  LogOut, 
  CheckCircle, 
  FileCheck, 
  AlertCircle, 
  PlusCircle, 
  X, 
  FileText, 
  Check, 
  Trash2, 
  ExternalLink, 
  ShieldCheck, 
  Search, 
  User, 
  Activity, 
  SlidersHorizontal,
  Menu,
  Award,
  Phone,
  Building2
} from 'lucide-react';

interface AdminPageProps {
  onOpenSubmit?: () => void;
}

type TabKey = 
  | 'dashboard' 
  | 'moderation' 
  | 'staff'
  | 'electorals'
  | 'calendar' 
  | 'notices' 
  | 'opportunities' 
  | 'faqs' 
  | 'enterprise' 
  | 'analytics' 
  | 'audit';

export const AdminPage: React.FC<AdminPageProps> = ({ onOpenSubmit }) => {
  const toast = useToast();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('asson_admin_authenticated') === 'true';
  });
  const [adminRole, setAdminRole] = useState<string>(() => {
    return sessionStorage.getItem('asson_admin_role') || 'admin';
  });
  const [adminEmail, setAdminEmail] = useState<string>(() => {
    return sessionStorage.getItem('asson_admin_email') || 'executive@asson.ui.edu.ng';
  });

  // Login Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'editor' | 'director'>('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Dashboard Navigation State
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [searchFilter, setSearchFilter] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Data Collections
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [resourcesCount, setResourcesCount] = useState<number>(MOCK_RESOURCES.length);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [enterprises, setEnterprises] = useState<EnterpriseListing[]>([]);
  const [executives, setExecutives] = useState<ElectedExecutive[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);

  // Modals & Forms
  const [feedbackTarget, setFeedbackTarget] = useState<StudentSubmission | null>(null);
  const [feedbackNote, setFeedbackNote] = useState('');

  // Staff Modal State
  const [isCreateStaffOpen, setIsCreateStaffOpen] = useState(false);
  const [staffForm, setStaffForm] = useState({
    name: '',
    title: 'Dr.',
    designation: 'Lecturer',
    courses: '',
    office: '',
    email: '',
    consultationHours: '',
    advisorLevel: '' as AcademicLevel | '',
    isHOD: false,
    imageUrl: ''
  });

  // Executive Council Modal State
  const [isCreateExecOpen, setIsCreateExecOpen] = useState(false);
  const [execForm, setExecForm] = useState({
    name: '',
    office: 'President',
    session: '2024/2025',
    level: '300' as AcademicLevel,
    imageUrl: '',
    whatsapp: '',
    email: '',
    bio: ''
  });

  const [isCreateCalOpen, setIsCreateCalOpen] = useState(false);
  const [calForm, setCalForm] = useState({
    title: '',
    category: 'Continuous Assessment' as CalendarCategory,
    startDate: '',
    endDate: '',
    targetLevel: 'all' as AcademicLevel | 'all',
    venue: '',
    description: '',
    isConfirmed: true,
  });

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

  // Load Data on Initial Render
  useEffect(() => {
    fetchStudentSubmissions().then((data) => setSubmissions(data.length > 0 ? data : MOCK_SUBMISSIONS));
    fetchAuditLogs().then((data) => setAuditLogs(data.length > 0 ? data : MOCK_AUDIT_LOGS));
    fetchResources().then((data) => setResourcesCount(data.length > 0 ? data.length : MOCK_RESOURCES.length));
    fetchNotices().then((data) => setNotices(data.length > 0 ? data : MOCK_NOTICES));
    fetchOpportunities().then((data) => setOpportunities(data.length > 0 ? data : MOCK_OPPORTUNITIES));
    fetchFaqs().then((data) => setFaqs(data || MOCK_FAQS));
    fetchCalendarEvents().then((data) => setCalendarEvents(data.length > 0 ? data : DEFAULT_CALENDAR_EVENTS));
    fetchEnterpriseListings(true).then((data) => setEnterprises(data));
    fetchElectedExecutives().then((data) => setExecutives(data.length > 0 ? data : MOCK_EXECUTIVES));
    fetchStaffMembers().then((data) => setStaff(data));
  }, []);

  // Time-aware greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'GOOD MORNING';
    if (hour < 17) return 'GOOD AFTERNOON';
    return 'GOOD EVENING';
  }, []);

  // Filtered pending submissions
  const pendingSubmissions = useMemo(() => {
    return submissions.filter((s) => s.status === 'Under Review');
  }, [submissions]);

  // Handle Login
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
      setAdminRole(res.role || selectedRole);
      setAdminEmail(email.trim());
      toast.success('Executive Access Granted', `Authenticated as ${res.role?.toUpperCase() || 'ADMIN'}`);
    } else {
      setAuthError(res.error || 'Authentication failed. Please verify credentials.');
    }
  };

  // Demo Fast-Fill
  const handleDemoLogin = async () => {
    setEmail('executive@asson.ui.edu.ng');
    setPassword('assonadmin');
    setIsLoggingIn(true);
    const res = await adminSignIn('executive@asson.ui.edu.ng', 'assonadmin');
    setIsLoggingIn(false);
    if (res.success) {
      setIsAuthenticated(true);
      setAdminRole('admin');
      setAdminEmail('executive@asson.ui.edu.ng');
      toast.success('Executive Demo Granted', 'Logged in as ASSON Executive Administrator');
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    await adminSignOut();
    setIsAuthenticated(false);
    toast.info('Session Ended', 'Logged out of ASSON Executive Console');
  };

  // Moderation Handlers
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

  // Executive Management Handlers
  const handleCreateExecutive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!execForm.name.trim() || !execForm.office.trim()) {
      toast.error('Validation Error', 'Full Name and Executive Office are required.');
      return;
    }

    const res = await createElectedExecutiveInDb(execForm);
    if (!res.success || !res.data) {
      toast.error('Failed to Add Executive', res.error || 'Database rejection.');
      return;
    }

    setExecutives((prev) => [...prev, res.data!]);
    setIsCreateExecOpen(false);
    setExecForm({
      name: '',
      office: 'President',
      session: '2024/2025',
      level: '300',
      imageUrl: '',
      whatsapp: '',
      email: '',
      bio: ''
    });
    toast.success('Executive Added', `Added ${res.data.name} (${res.data.office}) to official council.`);
  };

  const handleDeleteExecutive = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove executive: "${name}"?`)) return;
    const res = await deleteElectedExecutiveInDb(id);
    if (!res.success) {
      toast.error('Delete Failed', res.error || 'Failed to remove executive.');
      return;
    }
    setExecutives((prev) => prev.filter((e) => e.id !== id));
    toast.info('Executive Removed', `Removed "${name}" from executive council.`);
  };

  // Staff Directory Handlers
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.name.trim()) {
      toast.error('Validation Error', 'Lecturer full name is required.');
      return;
    }

    const coursesArray = staffForm.courses
      ? staffForm.courses.split(',').map((c) => c.trim().toUpperCase()).filter(Boolean)
      : [];

    const res = await createStaffMemberInDb({
      name: staffForm.name.trim(),
      title: staffForm.title.trim(),
      designation: staffForm.designation.trim(),
      courses: coursesArray,
      office: staffForm.office.trim(),
      email: staffForm.email.trim(),
      consultationHours: staffForm.consultationHours.trim() || undefined,
      advisorLevel: (staffForm.advisorLevel as AcademicLevel) || undefined,
      isHOD: staffForm.isHOD,
      imageUrl: staffForm.imageUrl.trim() || undefined,
    });

    if (!res.success || !res.data) {
      toast.error('Failed to Add Staff', res.error || 'Database rejection.');
      return;
    }

    setStaff((prev) => [res.data!, ...prev]);
    setIsCreateStaffOpen(false);
    setStaffForm({
      name: '',
      title: 'Dr.',
      designation: 'Lecturer',
      courses: '',
      office: '',
      email: '',
      consultationHours: '',
      advisorLevel: '',
      isHOD: false,
      imageUrl: ''
    });
    toast.success('Staff Member Added', `Added ${res.data.name} to Faculty Directory.`);
  };

  const handleDeleteStaff = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove staff member: "${name}"?`)) return;
    const res = await deleteStaffMemberInDb(id);
    if (!res.success) {
      toast.error('Delete Failed', res.error || 'Failed to remove staff member.');
      return;
    }
    setStaff((prev) => prev.filter((s) => s.id !== id));
    toast.info('Staff Removed', `Removed "${name}" from directory.`);
  };

  // CMS Handlers
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

  const handleCreateCalendarEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!calForm.title.trim() || !calForm.startDate) {
      toast.error('Validation Error', 'Title and Start Date are required.');
      return;
    }

    const res = await createCalendarEventInDb({
      title: calForm.title.trim(),
      category: calForm.category,
      startDate: calForm.startDate,
      endDate: calForm.endDate || undefined,
      targetLevel: calForm.targetLevel === 'all' ? undefined : (calForm.targetLevel as AcademicLevel),
      venue: calForm.venue.trim() || undefined,
      description: calForm.description.trim() || undefined,
      isConfirmed: calForm.isConfirmed,
    });

    if (!res.success) {
      toast.error('Failed to Schedule Date', res.error || 'Database rejection.');
      return;
    }

    const refreshed = await fetchCalendarEvents();
    setCalendarEvents(refreshed.length > 0 ? refreshed : DEFAULT_CALENDAR_EVENTS);
    setIsCreateCalOpen(false);
    setCalForm({
      title: '',
      category: 'Continuous Assessment',
      startDate: '',
      endDate: '',
      targetLevel: 'all',
      venue: '',
      description: '',
      isConfirmed: true,
    });
    toast.success('Academic Date Scheduled', `"${calForm.title}" published to student calendar.`);
  };

  const handleDeleteCalendarEvent = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to remove academic date: "${title}"?`)) return;
    const res = await deleteCalendarEventInDb(id);
    if (!res.success) {
      toast.error('Delete Failed', res.error || 'Failed to remove date from calendar.');
      return;
    }
    setCalendarEvents((prev) => prev.filter((c) => c.id !== id));
    toast.info('Date Removed', `Removed "${title}" from academic calendar.`);
  };

  // ====================================================================
  // SCREEN 1: ADMIN SIGN-IN (OFFICIAL ASSON LOGO + CLEAN WHITE BACKGROUND)
  // Per User Directive: Pure White Canvas, Official ASSON Logo & UI Crest
  // ====================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative bg-[#F8FAFC] dark:bg-[#0A0D10]">
        {/* Centered Minimalist White Card */}
        <div className="w-full max-w-[420px] rounded-3xl bg-white dark:bg-[#13171D] border border-zinc-200/90 dark:border-zinc-800 shadow-xl p-7 sm:p-9 space-y-6">
          {/* Official ASSON Logo paired with University of Ibadan Crest */}
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <img
                src="/logo/asson_logo.png"
                alt="ASSON Official Logo"
                className="w-14 h-14 object-contain"
              />
              <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-700" />
              <img
                src="/logo/ui_crest.jpg"
                alt="University of Ibadan Crest"
                className="w-11 h-11 object-contain rounded-lg"
              />
            </div>

            <h1 className="text-2xl sm:text-[26px] font-extrabold text-zinc-900 dark:text-white tracking-tight">
              Welcome back
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Log in to access ASSON Executive Portal
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Role Dropdown */}
            <div>
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1.5">
                Role
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <User className="w-4 h-4" />
                </div>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as any)}
                  className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#0D1117] border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs font-medium focus:outline-none focus:border-[#087A3E] focus:ring-1 focus:ring-[#087A3E] transition-all appearance-none cursor-pointer"
                >
                  <option value="admin">Executive Administrator</option>
                  <option value="editor">Academic Editorial Lead</option>
                  <option value="director">Department Exco Director</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-zinc-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Email / Username Input */}
            <div>
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1.5">
                Email / Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="executive@asson.ui.edu.ng"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setAuthError(null);
                  }}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#0D1117] border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 text-xs focus:outline-none focus:border-[#087A3E] focus:ring-1 focus:ring-[#087A3E] transition-all"
                />
              </div>
            </div>

            {/* Password Input with Show/Hide */}
            <div>
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setAuthError(null);
                  }}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#0D1117] border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 text-xs font-mono focus:outline-none focus:border-[#087A3E] focus:ring-1 focus:ring-[#087A3E] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Forgot password link */}
              <div className="text-right mt-1.5">
                <button
                  type="button"
                  onClick={() => toast.info('Password Recovery', 'Executive password reset tokens are managed by the Department Webmaster.')}
                  className="text-[11px] text-zinc-500 hover:text-[#087A3E] transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            {/* Error Message */}
            {authError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-snug">{authError}</span>
              </div>
            )}

            {/* Primary Action Button: ASSON Green with Arrow */}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 px-4 rounded-xl bg-[#087A3E] hover:bg-[#066131] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] cursor-pointer disabled:opacity-50"
            >
              <span>{isLoggingIn ? 'Verifying Credentials...' : 'Access Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Divider: or continue with */}
          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-zinc-200 dark:border-zinc-800 w-full" />
            <span className="bg-white dark:bg-[#13171D] px-3 text-[11px] uppercase tracking-wider text-zinc-400 absolute font-medium">
              or continue with
            </span>
          </div>

          {/* Quick Demo Access Button */}
          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full py-2.5 px-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/60 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-[#087A3E]" />
              <span>One-Click Executive Demo Access</span>
            </button>
          </div>

          {/* Bottom Watermark */}
          <div className="text-center pt-2 text-[10px] text-zinc-400">
            Association of Statistics Students of Nigeria • University of Ibadan Chapter
          </div>
        </div>
      </div>
    );
  }

  // ====================================================================
  // SCREEN 2: MINIMALIST DASHBOARD
  // Per User Directive: Clicking other tabs takes the user DIRECTLY to
  // that view without having to scroll past the dashboard cards!
  // ====================================================================
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A0D10] text-zinc-900 dark:text-zinc-100 flex flex-col md:flex-row">
      {/* ------------------------------------------------------------- */}
      {/* LEFT SIDEBAR                                                  */}
      {/* ------------------------------------------------------------- */}
      <aside
        className={`fixed md:sticky top-0 z-40 h-screen w-64 bg-white dark:bg-[#0E1318] border-r border-zinc-200/80 dark:border-zinc-800/80 flex flex-col justify-between transition-transform duration-200 ease-in-out shrink-0 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/60">
            <div className="flex items-center gap-2.5">
              <img
                src="/logo/asson_logo.png"
                alt="ASSON Logo"
                className="w-8 h-8 object-contain shrink-0"
              />
              <div>
                <span className="font-extrabold text-sm tracking-tight block text-zinc-900 dark:text-white">
                  ASSON UI
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase text-zinc-400 block -mt-0.5">
                  Executive Desk
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="md:hidden p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Grouped Sidebar Navigation */}
          <nav className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)] scrollbar-none text-xs">
            {/* Group 1: OVERVIEW */}
            <div>
              <span className="px-3 text-[10px] font-bold tracking-widest uppercase text-zinc-400 block mb-2">
                OVERVIEW
              </span>
              <div className="space-y-0.5">
                <button
                  onClick={() => {
                    setActiveTab('dashboard');
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-colors ${
                    activeTab === 'dashboard'
                      ? 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-900 dark:text-white font-bold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 hover:text-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <LayoutDashboard className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-[#087A3E]' : ''}`} />
                    <span>General Dashboard</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('analytics');
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-colors ${
                    activeTab === 'analytics'
                      ? 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-900 dark:text-white font-bold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 hover:text-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <TrendingUp className={`w-4 h-4 ${activeTab === 'analytics' ? 'text-[#087A3E]' : ''}`} />
                    <span>Analytics & Telemetry</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Group 2: EDITORIAL & ELECTORAL DESK */}
            <div>
              <span className="px-3 text-[10px] font-bold tracking-widest uppercase text-zinc-400 block mb-2">
                LEADERSHIP & EDITORIAL
              </span>
              <div className="space-y-0.5">
                <button
                  onClick={() => {
                    setActiveTab('moderation');
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-colors ${
                    activeTab === 'moderation'
                      ? 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-900 dark:text-white font-bold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 hover:text-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FileCheck className={`w-4 h-4 ${activeTab === 'moderation' ? 'text-[#087A3E]' : ''}`} />
                    <span>Submissions</span>
                  </div>
                  {pendingSubmissions.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-[#087A3E] text-white text-[10px] font-bold">
                      {pendingSubmissions.length}
                    </span>
                  )}
                </button>

                {/* Staff & Lecturers Directory Tab */}
                <button
                  onClick={() => {
                    setActiveTab('staff');
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-colors ${
                    activeTab === 'staff'
                      ? 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-900 dark:text-white font-bold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 hover:text-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Building2 className={`w-4 h-4 ${activeTab === 'staff' ? 'text-[#087A3E]' : ''}`} />
                    <span>Staff & Lecturers</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {staff.length}
                  </span>
                </button>

                {/* Elected Executives Tab */}
                <button
                  onClick={() => {
                    setActiveTab('electorals');
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-colors ${
                    activeTab === 'electorals'
                      ? 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-900 dark:text-white font-bold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 hover:text-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Award className={`w-4 h-4 ${activeTab === 'electorals' ? 'text-[#087A3E]' : ''}`} />
                    <span>Elected Executives</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {executives.length}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('enterprise');
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-colors ${
                    activeTab === 'enterprise'
                      ? 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-900 dark:text-white font-bold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 hover:text-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Store className={`w-4 h-4 ${activeTab === 'enterprise' ? 'text-[#087A3E]' : ''}`} />
                    <span>Enterprise Hub</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {enterprises.length}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('calendar');
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-colors ${
                    activeTab === 'calendar'
                      ? 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-900 dark:text-white font-bold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 hover:text-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Calendar className={`w-4 h-4 ${activeTab === 'calendar' ? 'text-[#087A3E]' : ''}`} />
                    <span>Academic Calendar</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {calendarEvents.length}
                  </span>
                </button>
              </div>
            </div>

            {/* Group 3: BROADCASTS & SERVICES */}
            <div>
              <span className="px-3 text-[10px] font-bold tracking-widest uppercase text-zinc-400 block mb-2">
                BROADCASTS
              </span>
              <div className="space-y-0.5">
                <button
                  onClick={() => {
                    setActiveTab('notices');
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-colors ${
                    activeTab === 'notices'
                      ? 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-900 dark:text-white font-bold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 hover:text-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Bell className={`w-4 h-4 ${activeTab === 'notices' ? 'text-[#087A3E]' : ''}`} />
                    <span>Notices & News</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {notices.length}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('opportunities');
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-colors ${
                    activeTab === 'opportunities'
                      ? 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-900 dark:text-white font-bold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 hover:text-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Briefcase className={`w-4 h-4 ${activeTab === 'opportunities' ? 'text-[#087A3E]' : ''}`} />
                    <span>Opportunities</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {opportunities.length}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('faqs');
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-colors ${
                    activeTab === 'faqs'
                      ? 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-900 dark:text-white font-bold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 hover:text-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <HelpCircle className={`w-4 h-4 ${activeTab === 'faqs' ? 'text-[#087A3E]' : ''}`} />
                    <span>Help & FAQs</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Group 4: GOVERNANCE */}
            <div>
              <span className="px-3 text-[10px] font-bold tracking-widest uppercase text-zinc-400 block mb-2">
                GOVERNANCE
              </span>
              <div className="space-y-0.5">
                <button
                  onClick={() => {
                    setActiveTab('audit');
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-colors ${
                    activeTab === 'audit'
                      ? 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-900 dark:text-white font-bold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 hover:text-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <History className={`w-4 h-4 ${activeTab === 'audit' ? 'text-[#087A3E]' : ''}`} />
                    <span>Audit Trail</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {auditLogs.length}
                  </span>
                </button>
              </div>
            </div>
          </nav>
        </div>

        {/* Sidebar Footer: User Card */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800/60">
          <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/40">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#087A3E] text-white flex items-center justify-center font-bold text-xs shrink-0">
                EX
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                  {adminEmail ? adminEmail.split('@')[0] : 'ASSON Exco'}
                </p>
                <p className="text-[10px] text-zinc-400 font-medium capitalize">
                  {adminRole}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 z-30 md:hidden backdrop-blur-xs"
        />
      )}

      {/* ------------------------------------------------------------- */}
      {/* MAIN CONTENT WORKSPACE                                        */}
      {/* ------------------------------------------------------------- */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Top Header Bar */}
        <header className="h-16 px-4 sm:px-8 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-[#0E1318]/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
              <span className="uppercase tracking-wider">
                {activeTab === 'dashboard' || activeTab === 'analytics'
                  ? 'OVERVIEW'
                  : activeTab === 'moderation' || activeTab === 'electorals' || activeTab === 'enterprise' || activeTab === 'calendar'
                  ? 'LEADERSHIP & EDITORIAL'
                  : activeTab === 'notices' || activeTab === 'opportunities' || activeTab === 'faqs'
                  ? 'BROADCASTS'
                  : 'GOVERNANCE'}
              </span>
              <span>›</span>
              <span className="text-zinc-900 dark:text-zinc-100 font-bold capitalize">
                {activeTab === 'dashboard'
                  ? 'General Dashboard'
                  : activeTab === 'moderation'
                  ? 'Submissions Review'
                  : activeTab === 'electorals'
                  ? 'Elected Executives'
                  : activeTab}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Search */}
            <div className="relative hidden sm:block w-48 lg:w-64">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search records... ⌘K"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#087A3E]"
              />
            </div>

            {/* Quick Action Contextual Button */}
            <button
              onClick={() => {
                if (activeTab === 'electorals') setIsCreateExecOpen(true);
                else if (activeTab === 'calendar') setIsCreateCalOpen(true);
                else if (activeTab === 'notices') setIsCreateNoticeOpen(true);
                else if (activeTab === 'opportunities') setIsCreateOppOpen(true);
                else if (activeTab === 'faqs') setIsCreateFaqOpen(true);
                else if (onOpenSubmit) onOpenSubmit();
              }}
              className="px-3.5 py-1.5 rounded-lg bg-[#087A3E] hover:bg-[#066131] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {activeTab === 'electorals'
                  ? 'Add Executive'
                  : activeTab === 'calendar'
                  ? 'Schedule Date'
                  : activeTab === 'notices'
                  ? 'Broadcast Notice'
                  : activeTab === 'opportunities'
                  ? 'Publish Opp'
                  : 'Add Resource'}
              </span>
            </button>
          </div>
        </header>

        {/* Workspace Body */}
        <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 max-w-7xl w-full">
          {/* ------------------------------------------------------------- */}
          {/* TAB: GENERAL DASHBOARD ONLY                                   */}
          {/* Displays the greeting, 4 KPI cards, 30-day stats, chart,     */}
          {/* and quick queue ONLY when activeTab === 'dashboard'.          */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 sm:space-y-8">
              {/* Greeting & Headline */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
                <div>
                  <span className="text-[11px] font-bold tracking-widest text-zinc-400 uppercase block mb-1">
                    {greeting}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                    Executive, here is the department
                  </h1>
                  <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                    Today at a glance, pending editorial vetting, and semester telemetry.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50"
                  >
                    Telemetry
                  </button>
                  <button
                    onClick={() => setActiveTab('moderation')}
                    className="px-3.5 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-bold transition-all shadow-xs"
                  >
                    Review Queue ({pendingSubmissions.length})
                  </button>
                </div>
              </div>

              {/* 4 Top KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div 
                  onClick={() => setActiveTab('moderation')}
                  className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#13171D] border border-zinc-200/80 dark:border-zinc-800/80 cursor-pointer hover:border-[#087A3E]/50 transition-all shadow-xs"
                >
                  <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    <span>PENDING VETTING</span>
                    <span className="text-zinc-300 dark:text-zinc-600">···</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white mt-2">
                    {String(pendingSubmissions.length).padStart(2, '0')}
                  </div>
                  <div className="text-[11px] text-[#087A3E] font-semibold mt-1">
                    Awaiting review
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('moderation')}
                  className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#13171D] border border-zinc-200/80 dark:border-zinc-800/80 cursor-pointer hover:border-[#087A3E]/50 transition-all shadow-xs"
                >
                  <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    <span>MATERIALS</span>
                    <span className="text-zinc-300 dark:text-zinc-600">···</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white mt-2">
                    {resourcesCount}
                  </div>
                  <div className="text-[11px] text-zinc-500 font-medium mt-1">
                    Verified in catalog
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('electorals')}
                  className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#13171D] border border-zinc-200/80 dark:border-zinc-800/80 cursor-pointer hover:border-[#087A3E]/50 transition-all shadow-xs"
                >
                  <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    <span>ELECTED EXCOS</span>
                    <span className="text-zinc-300 dark:text-zinc-600">···</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white mt-2">
                    {String(executives.length).padStart(2, '0')}
                  </div>
                  <div className="text-[11px] text-[#087A3E] font-medium mt-1">
                    Executive Council
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('notices')}
                  className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#13171D] border border-zinc-200/80 dark:border-zinc-800/80 cursor-pointer hover:border-[#087A3E]/50 transition-all shadow-xs"
                >
                  <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    <span>ACTIVE NOTICES</span>
                    <span className="text-zinc-300 dark:text-zinc-600">···</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white mt-2">
                    {String(notices.filter(n => !n.isExpired).length).padStart(2, '0')}
                  </div>
                  <div className="text-[11px] text-zinc-500 font-medium mt-1">
                    Broadcast live
                  </div>
                </div>
              </div>

              {/* 30 Days Telemetry Row */}
              <div className="space-y-3">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                  LAST 30 DAYS • SEMESTER TELEMETRY
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                  <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#13171D] border border-zinc-200/80 dark:border-zinc-800/80 space-y-1 shadow-xs">
                    <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                      <span>TOTAL DOWNLOADS</span>
                      <span className="text-zinc-300 dark:text-zinc-600">···</span>
                    </div>
                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
                        1,420
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-[#087A3E]/10 text-[#087A3E] text-[10px] font-bold">
                        +18%
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500">
                      Direct student material requests
                    </p>
                  </div>

                  <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#13171D] border border-zinc-200/80 dark:border-zinc-800/80 space-y-1 shadow-xs">
                    <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                      <span>EDITORIAL VELOCITY</span>
                      <span className="text-zinc-300 dark:text-zinc-600">···</span>
                    </div>
                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
                        96.4%
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-[10px] font-bold">
                        &lt; 24h
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500">
                      Submissions vetted within 24 hours
                    </p>
                  </div>

                  <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#13171D] border border-zinc-200/80 dark:border-zinc-800/80 space-y-1 shadow-xs">
                    <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                      <span>SUPABASE EGRESS</span>
                      <span className="text-zinc-300 dark:text-zinc-600">···</span>
                    </div>
                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
                        0.00 GB
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-[#087A3E]/10 text-[#087A3E] text-[10px] font-bold">
                        100% Free
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500">
                      Protected via CDN & external mirrors
                    </p>
                  </div>
                </div>
              </div>

              {/* Activity Bar Chart */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#13171D] border border-zinc-200/80 dark:border-zinc-800/80 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                      ACTIVITY & DOWNLOADS PER DAY
                    </span>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      1,420 interactions recorded across all four academic levels
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-zinc-400 hidden sm:block">
                    Semester Peak: STA 211 & STA 311
                  </span>
                </div>

                <div className="h-44 pt-6 flex items-end justify-between gap-1 sm:gap-2 px-1">
                  {[
                    { day: '1/11', val: 32 },
                    { day: '2/11', val: 45 },
                    { day: '3/11', val: 28 },
                    { day: '4/11', val: 62 },
                    { day: '5/11', val: 50 },
                    { day: '6/11', val: 78 },
                    { day: '7/11', val: 89 },
                    { day: '8/11', val: 95 },
                    { day: '9/11', val: 120 },
                    { day: '10/11', val: 180, isPeak: true },
                    { day: '11/11', val: 130 },
                    { day: '12/11', val: 110 },
                    { day: '13/11', val: 85 },
                    { day: '14/11', val: 70 },
                    { day: '15/11', val: 45 },
                    { day: '16/11', val: 55 },
                    { day: '17/11', val: 92 },
                    { day: '18/11', val: 105 },
                    { day: '19/11', val: 74 },
                    { day: '20/11', val: 88 },
                  ].map((item, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                      <div
                        style={{ height: `${(item.val / 180) * 100}%` }}
                        className={`w-full max-w-[16px] rounded-t-sm transition-all duration-300 ${
                          item.isPeak
                            ? 'bg-[#087A3E]'
                            : 'bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700'
                        }`}
                        title={`${item.day}: ${item.val} interactions`}
                      />
                      <span className="text-[9px] text-zinc-400 font-mono hidden sm:block">
                        {idx % 3 === 0 ? item.day : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Queue Overview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-white tracking-tight">
                      Submissions Awaiting Attention
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Verify student uploaded examination papers and lecture notes.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('moderation')}
                    className="text-xs font-bold text-[#087A3E] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View all submissions</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#13171D] shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 font-bold text-zinc-400">
                          <th className="py-3 px-4">Course</th>
                          <th className="py-3 px-4">Material Title</th>
                          <th className="py-3 px-4">Contributor</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                        {pendingSubmissions.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-zinc-400">
                              <CheckCircle className="w-7 h-7 text-[#087A3E] mx-auto mb-1.5 opacity-60" />
                              <p className="font-semibold text-zinc-900 dark:text-zinc-200 text-xs">Queue Clear</p>
                              <p className="text-[11px] text-zinc-400">No submissions currently awaiting vetting.</p>
                            </td>
                          </tr>
                        ) : (
                          pendingSubmissions.slice(0, 4).map((sub) => (
                            <tr key={sub.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors">
                              <td className="py-3 px-4 font-bold text-[#087A3E]">{sub.courseCode}</td>
                              <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-100 max-w-xs truncate">
                                {sub.resourceTitle}
                              </td>
                              <td className="py-3 px-4 text-zinc-500 text-[11px]">{sub.feedback || 'Student Contributor'}</td>
                              <td className="py-3 px-4">
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600">
                                  {sub.status}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right space-x-1.5">
                                <button
                                  onClick={() => handleApprove(sub.id, sub.resourceTitle)}
                                  className="h-7 text-xs px-2.5 rounded-lg bg-[#087A3E] hover:bg-[#066131] text-white font-bold transition-all shadow-xs inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" /> Approve
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 1: SUBMISSIONS MODERATION QUEUE (DIRECT VIEW)             */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'moderation' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                    Submissions Moderation Ledger ({submissions.length})
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Verify examination papers and lecture notes submitted by students and course reps.
                  </p>
                </div>
                {onOpenSubmit && (
                  <button
                    onClick={onOpenSubmit}
                    className="px-3.5 py-1.5 rounded-lg bg-[#087A3E] hover:bg-[#066131] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> Add Material
                  </button>
                )}
              </div>

              <div className="overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#13171D] shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 font-bold text-zinc-400">
                        <th className="py-3.5 px-4">Course</th>
                        <th className="py-3.5 px-4">Material Title</th>
                        <th className="py-3.5 px-4">Contributor</th>
                        <th className="py-3.5 px-4">Type & Session</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                      {submissions.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-zinc-400">
                            <FileText className="w-8 h-8 mx-auto mb-2 opacity-40 text-zinc-400" />
                            <p className="font-semibold text-zinc-900 dark:text-zinc-200 text-xs">No Submissions Recorded</p>
                          </td>
                        </tr>
                      ) : (
                        submissions.map((sub) => {
                          const fileUrl = sub.filePath
                            ? `https://cvhjohbknghlmspoaenr.supabase.co/storage/v1/object/public/resources/${sub.filePath.replace(/^resources\//, '')}`
                            : null;

                          return (
                            <tr key={sub.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors">
                              <td className="py-3.5 px-4 font-bold text-[#087A3E]">
                                {sub.courseCode}
                              </td>
                              <td className="py-3.5 px-4 font-semibold text-zinc-900 dark:text-zinc-100 max-w-xs truncate">
                                {sub.resourceTitle}
                              </td>
                              <td className="py-3.5 px-4 text-zinc-500 text-[11px]">
                                {sub.feedback || 'Student Contributor'}
                              </td>
                              <td className="py-3.5 px-4 text-zinc-500 font-medium">
                                <span>{sub.resourceType}</span>
                                <span className="text-[10px] text-zinc-400 block font-mono">{sub.session}</span>
                              </td>
                              <td className="py-3.5 px-4">
                                <span
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                    sub.status === 'Approved'
                                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-[#087A3E]'
                                      : sub.status === 'Under Review'
                                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600'
                                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600'
                                  }`}
                                >
                                  {sub.status}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {fileUrl && (
                                    <a
                                      href={fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-[11px] font-semibold text-zinc-700 dark:text-zinc-200 transition-colors shrink-0"
                                    >
                                      <Eye className="w-3.5 h-3.5" /> Preview
                                    </a>
                                  )}
                                  {sub.status === 'Under Review' && (
                                    <>
                                      <button
                                        onClick={() => handleApprove(sub.id, sub.resourceTitle)}
                                        className="h-7 text-xs px-2.5 rounded-lg bg-[#087A3E] hover:bg-[#066131] text-white font-bold transition-all shadow-xs inline-flex items-center gap-1 cursor-pointer"
                                      >
                                        <Check className="w-3.5 h-3.5" /> Approve
                                      </button>
                                      <button
                                        onClick={() => {
                                          setFeedbackTarget(sub);
                                          setFeedbackNote('');
                                        }}
                                        className="h-7 text-xs px-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-semibold transition-colors cursor-pointer"
                                      >
                                        Revise
                                      </button>
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

          {/* ------------------------------------------------------------- */}
          {/* TAB 2: ELECTED EXECUTIVES & ELECTORALS (DIRECT VIEW)          */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'electorals' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                    ASSON Executive Council & Electorals ({executives.length})
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Official departmental leadership. Added details and photos are synchronized with the student portal.
                  </p>
                </div>
                <button
                  onClick={() => setIsCreateExecOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#087A3E] hover:bg-[#066131] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Add Executive
                </button>
              </div>

              {/* Executives Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {executives.map((exec) => (
                  <div
                    key={exec.id}
                    className="p-4 rounded-2xl bg-white dark:bg-[#13171D] border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col justify-between space-y-3 shadow-xs relative group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {exec.imageUrl ? (
                            <img
                              src={exec.imageUrl}
                              alt={exec.name}
                              className="w-12 h-12 rounded-2xl object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-2xl bg-[#087A3E]/10 text-[#087A3E] font-bold text-sm flex items-center justify-center shrink-0">
                              {exec.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <h3 className="text-sm font-bold text-zinc-900 dark:text-white leading-snug">
                              {exec.name}
                            </h3>
                            <span className="text-[11px] text-zinc-500 font-mono block">
                              {exec.level} Level • {exec.session}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteExecutive(exec.id, exec.name)}
                          className="p-1 text-zinc-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          title="Remove Executive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="inline-block">
                        <span className="px-2 py-0.5 rounded-md bg-[#087A3E]/10 text-[#087A3E] text-[10px] font-bold uppercase tracking-wider">
                          {exec.office}
                        </span>
                      </div>

                      {exec.bio && (
                        <p className="text-xs text-zinc-500 line-clamp-2 italic">
                          &ldquo;{exec.bio}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2.5 border-t border-zinc-100 dark:border-zinc-800/60 text-xs text-zinc-500 font-mono">
                      <span>{exec.whatsapp || 'No Phone'}</span>
                      {exec.email && <span className="truncate max-w-[130px]">{exec.email}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB: ACADEMIC STAFF & LECTURERS (DIRECT VIEW)                 */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'staff' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                    Academic Staff & Lecturers Directory ({staff.length})
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Manage departmental lecturers, course advisers, and Head of Department (HOD) profiles.
                  </p>
                </div>
                <button
                  onClick={() => setIsCreateStaffOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#087A3E] hover:bg-[#066131] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Add Lecturer / HOD
                </button>
              </div>

              {/* Staff Cards Bento Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {staff.map((member) => (
                  <div
                    key={member.id}
                    className="p-4 rounded-2xl bg-white dark:bg-[#13171D] border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col justify-between space-y-3 shadow-xs relative group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {member.imageUrl ? (
                            <img
                              src={member.imageUrl}
                              alt={member.name}
                              className="w-12 h-12 rounded-2xl object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-2xl bg-[#087A3E]/10 text-[#087A3E] font-bold text-sm flex items-center justify-center shrink-0">
                              {member.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3 className="text-sm font-bold text-zinc-900 dark:text-white leading-snug">
                                {member.name}
                              </h3>
                              {member.isHOD && (
                                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500 text-white">
                                  HOD
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-zinc-500 font-mono block">
                              {member.designation}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteStaff(member.id, member.name)}
                          className="p-1 text-zinc-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          title="Remove Staff"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {member.advisorLevel && (
                        <span className="inline-block px-2 py-0.5 rounded-md bg-[#087A3E]/10 text-[#087A3E] text-[10px] font-bold">
                          {member.advisorLevel}L Staff Adviser
                        </span>
                      )}

                      <div className="text-[11px] text-zinc-500 space-y-0.5 font-mono">
                        <p>Office: {member.office}</p>
                        {member.consultationHours && <p>Hours: {member.consultationHours}</p>}
                      </div>

                      {member.courses && member.courses.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap pt-1">
                          {member.courses.map((c) => (
                            <span key={c} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                              {c}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2.5 border-t border-zinc-100 dark:border-zinc-800/60 text-xs text-zinc-500 font-mono">
                      <span className="truncate">{member.email || 'No email recorded'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 3: ACADEMIC CALENDAR (DIRECT VIEW)                        */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'calendar' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                    Academic Calendar & Milestones ({calendarEvents.length})
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Schedule and update departmental tests, examinations, and Senate deadlines.
                  </p>
                </div>
                <button
                  onClick={() => setIsCreateCalOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#087A3E] hover:bg-[#066131] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Schedule Date
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {calendarEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-4 rounded-2xl bg-white dark:bg-[#13171D] border border-zinc-200/80 dark:border-zinc-800/80 space-y-2 relative group shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold text-[#087A3E] uppercase tracking-wider block">
                          {evt.category}
                        </span>
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-white mt-0.5">
                          {evt.title}
                        </h4>
                      </div>
                      <button
                        onClick={() => handleDeleteCalendarEvent(evt.id, evt.title)}
                        className="p-1 text-zinc-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete Event"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-zinc-500 font-mono">
                      <span>{evt.startDate}</span>
                      {evt.venue && <span>• {evt.venue}</span>}
                      {evt.targetLevel && <span>• {evt.targetLevel}L</span>}
                    </div>

                    {evt.description && (
                      <p className="text-xs text-zinc-500 line-clamp-2">
                        {evt.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 4: NOTICES & BROADCASTS (DIRECT VIEW)                     */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'notices' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                    Department Notices & Broadcasts ({notices.length})
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Official announcements from the ASSON Secretariat and Department of Statistics.
                  </p>
                </div>
                <button
                  onClick={() => setIsCreateNoticeOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#087A3E] hover:bg-[#066131] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Broadcast Notice
                </button>
              </div>

              <div className="space-y-3">
                {notices.map((n) => (
                  <div
                    key={n.id}
                    className="p-4 rounded-2xl bg-white dark:bg-[#13171D] border border-zinc-200/80 dark:border-zinc-800/80 flex items-start justify-between gap-4 shadow-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-[#087A3E] uppercase tracking-wider">
                          {n.category}
                        </span>
                        {n.isUrgent && (
                          <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 text-[9px] font-bold uppercase">
                            Urgent
                          </span>
                        )}
                        <span className="text-[11px] text-zinc-400 font-mono">
                          {n.publishedDate}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                        {n.title}
                      </h4>
                      <p className="text-xs text-zinc-500 line-clamp-2">
                        {n.content}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeleteNotice(n.id, n.title)}
                      className="p-2 text-zinc-400 hover:text-red-500 transition-colors shrink-0"
                      title="Delete Notice"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 5: OPPORTUNITIES (DIRECT VIEW)                            */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'opportunities' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                    Opportunities & Scholarships ({opportunities.length})
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Curated internships, graduate programs, and data science scholarships.
                  </p>
                </div>
                <button
                  onClick={() => setIsCreateOppOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#087A3E] hover:bg-[#066131] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Add Opportunity
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {opportunities.map((opp) => (
                  <div
                    key={opp.id}
                    className="p-4 rounded-2xl bg-white dark:bg-[#13171D] border border-zinc-200/80 dark:border-zinc-800/80 space-y-2 relative group shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold text-[#087A3E] uppercase tracking-wider block">
                          {opp.category} • {opp.provider}
                        </span>
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-white mt-0.5">
                          {opp.title}
                        </h4>
                      </div>
                      <button
                        onClick={() => handleDeleteOpportunity(opp.id, opp.title)}
                        className="p-1 text-zinc-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete Opportunity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-xs text-zinc-500 line-clamp-2">
                      {opp.description}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/60 text-xs">
                      <span className="text-[11px] text-zinc-400 font-mono">
                        Deadline: {opp.deadline}
                      </span>
                      <a
                        href={opp.applicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#087A3E] font-bold hover:underline inline-flex items-center gap-1"
                      >
                        <span>Apply</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 6: ENTERPRISE HUB (DIRECT VIEW)                           */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'enterprise' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                    Student Enterprise Hub Moderation ({enterprises.length})
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Vet student freelance businesses, tutoring services, and ventures before public showcase.
                  </p>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#13171D] shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 font-bold text-zinc-400">
                        <th className="py-3 px-4">Business / Venture</th>
                        <th className="py-3 px-4">Student Owner</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">WhatsApp Contact</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Moderation Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                      {enterprises.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-10 text-center text-zinc-400">
                            No student enterprises submitted yet.
                          </td>
                        </tr>
                      ) : (
                        enterprises.map((item) => (
                          <tr key={item.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors">
                            <td className="py-3 px-4 font-bold text-zinc-900 dark:text-white">
                              <div className="flex items-center gap-3">
                                {item.imageUrl ? (
                                  <img
                                    src={item.imageUrl}
                                    alt={item.businessName}
                                    className="w-10 h-10 rounded-xl object-cover shrink-0 border border-zinc-200 dark:border-zinc-700"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-xl bg-[#087A3E]/10 text-[#087A3E] font-black text-xs flex items-center justify-center shrink-0">
                                    {item.businessName.charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <span className="block truncate">{item.businessName}</span>
                                  <p className="text-[11px] font-normal text-zinc-500 line-clamp-1">{item.description}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              {item.ownerName}
                              <span className="text-[10px] text-zinc-400 block font-mono">{item.ownerLevel}L</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded-md bg-[#087A3E]/10 text-[#087A3E] font-bold text-[10px]">
                                {item.category}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono text-zinc-500">
                              {item.whatsapp}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  item.status === 'approved'
                                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-[#087A3E]'
                                    : item.status === 'pending'
                                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600'
                                    : 'bg-red-50 text-red-600'
                                }`}
                              >
                                {item.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right space-x-1.5">
                              {item.status !== 'approved' && (
                                <button
                                  onClick={async () => {
                                    await updateEnterpriseStatus(item.id, 'approved');
                                    setEnterprises((prev) =>
                                      prev.map((e) => (e.id === item.id ? { ...e, status: 'approved' } : e))
                                    );
                                    toast.success('Approved', `Approved ${item.businessName} for showcase.`);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-[#087A3E] hover:bg-[#066131] text-white font-bold text-[11px] transition-colors cursor-pointer"
                                >
                                  Approve
                                </button>
                              )}
                              {item.status !== 'rejected' && (
                                <button
                                  onClick={async () => {
                                    await updateEnterpriseStatus(item.id, 'rejected');
                                    setEnterprises((prev) =>
                                      prev.map((e) => (e.id === item.id ? { ...e, status: 'rejected' } : e))
                                    );
                                    toast.info('Rejected', `Removed ${item.businessName} from showcase.`);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-[11px] transition-colors cursor-pointer"
                                >
                                  Reject
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 7: FAQS (DIRECT VIEW)                                     */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'faqs' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                    Frequently Asked Questions ({faqs.length})
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Maintain guidance entries for portal navigation, academic advising, and registration.
                  </p>
                </div>
                <button
                  onClick={() => setIsCreateFaqOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#087A3E] hover:bg-[#066131] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Add FAQ
                </button>
              </div>

              <div className="space-y-3">
                {faqs.map((f) => (
                  <div
                    key={f.id}
                    className="p-4 rounded-2xl bg-white dark:bg-[#13171D] border border-zinc-200/80 dark:border-zinc-800/80 flex items-start justify-between gap-4 shadow-xs"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-[#087A3E] uppercase tracking-wider block">
                        {f.category}
                      </span>
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                        {f.question}
                      </h4>
                      <p className="text-xs text-zinc-500">
                        {f.answer}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteFaq(f.id)}
                      className="p-2 text-zinc-400 hover:text-red-500 transition-colors shrink-0"
                      title="Delete FAQ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 8: ANALYTICS (DIRECT VIEW)                                */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                  Telemetry & Platform Analytics
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Real-time download logs, course popularity, and student demand leaderboard.
                </p>
              </div>
              <AnalyticsChart />
              <CourseDemandLeaderboard />
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 9: AUDIT LOGS (DIRECT VIEW)                               */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'audit' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                  Platform Security & Audit Trail ({auditLogs.length})
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Immutable security ledger recording every administrative mutation and publication.
                </p>
              </div>

              <div className="overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#13171D] shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 font-bold text-zinc-400">
                        <th className="py-3 px-4">Action</th>
                        <th className="py-3 px-4">Entity</th>
                        <th className="py-3 px-4">Details</th>
                        <th className="py-3 px-4">Executive Actor</th>
                        <th className="py-3 px-4 text-right">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-mono text-[11px]">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors">
                          <td className="py-3 px-4 font-bold text-[#087A3E]">
                            {log.action}
                          </td>
                          <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">
                            {log.entity}
                          </td>
                          <td className="py-3 px-4 font-sans text-zinc-800 dark:text-zinc-200 max-w-md truncate">
                            {log.details}
                          </td>
                          <td className="py-3 px-4 text-zinc-500">
                            {log.user}
                          </td>
                          <td className="py-3 px-4 text-right text-zinc-400">
                            {log.timestamp}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ------------------------------------------------------------- */}
      {/* MODALS: EXECUTIVE, FEEDBACK, NOTICES, CALENDAR, OPPS, FAQS    */}
      {/* ------------------------------------------------------------- */}

      {/* ADD ELECTED EXECUTIVE MODAL */}
      {isCreateExecOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsCreateExecOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-xs" />
          <div className="relative z-10 w-full max-w-lg rounded-3xl bg-white dark:bg-[#13171D] p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#087A3E]" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Add Elected Executive</h3>
              </div>
              <button onClick={() => setIsCreateExecOpen(false)} className="p-1 text-zinc-400 hover:text-zinc-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateExecutive} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Babatunde Ayomide"
                  value={execForm.name}
                  onChange={(e) => setExecForm({ ...execForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#087A3E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Office / Portfolio *</label>
                  <select
                    value={execForm.office}
                    onChange={(e) => setExecForm({ ...execForm, office: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#087A3E]"
                  >
                    <option value="President">President</option>
                    <option value="Vice President">Vice President</option>
                    <option value="General Secretary">General Secretary</option>
                    <option value="Academic Director">Academic Director</option>
                    <option value="Financial Secretary">Financial Secretary</option>
                    <option value="Public Relations Officer (P.R.O)">Public Relations Officer (P.R.O)</option>
                    <option value="Welfare Director">Welfare Director</option>
                    <option value="Social Director">Social Director</option>
                    <option value="Sports Director">Sports Director</option>
                    <option value="Assistant General Secretary">Assistant General Secretary</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Academic Level *</label>
                  <select
                    value={execForm.level}
                    onChange={(e) => setExecForm({ ...execForm, level: e.target.value as AcademicLevel })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#087A3E]"
                  >
                    <option value="100">100 Level</option>
                    <option value="200">200 Level</option>
                    <option value="300">300 Level</option>
                    <option value="400">400 Level</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Administration Session</label>
                  <input
                    type="text"
                    placeholder="e.g. 2024/2025"
                    value={execForm.session}
                    onChange={(e) => setExecForm({ ...execForm, session: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#087A3E]"
                  />
                </div>

                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">WhatsApp Line</label>
                  <input
                    type="tel"
                    placeholder="e.g. 08012345678"
                    value={execForm.whatsapp}
                    onChange={(e) => setExecForm({ ...execForm, whatsapp: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#087A3E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Official Email</label>
                  <input
                    type="email"
                    placeholder="e.g. president.asson@ui.edu.ng"
                    value={execForm.email}
                    onChange={(e) => setExecForm({ ...execForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#087A3E]"
                  />
                </div>

                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Profile Photo URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={execForm.imageUrl}
                    onChange={(e) => setExecForm({ ...execForm, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#087A3E]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Brief Manifesto / Quote</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Dedicated to statistical excellence and student welfare..."
                  value={execForm.bio}
                  onChange={(e) => setExecForm({ ...execForm, bio: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#087A3E]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCreateExecOpen(false)}
                  className="px-3 py-1.5 text-xs text-zinc-500 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-[#087A3E] hover:bg-[#066131] text-white text-xs font-bold"
                >
                  Save Executive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD STAFF / LECTURER MODAL */}
      {isCreateStaffOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsCreateStaffOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-xs" />
          <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-[#13171D] p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#087A3E]" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Add Academic Lecturer / HOD</h3>
              </div>
              <button onClick={() => setIsCreateStaffOpen(false)} className="p-1 text-zinc-400 hover:text-zinc-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Title *</label>
                  <select
                    value={staffForm.title}
                    onChange={(e) => setStaffForm({ ...staffForm, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#087A3E]"
                  >
                    <option value="Prof.">Prof.</option>
                    <option value="Dr.">Dr.</option>
                    <option value="Mr.">Mr.</option>
                    <option value="Mrs.">Mrs.</option>
                    <option value="Ms.">Ms.</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. K. I. Ojo or O. I. Shittu"
                    value={staffForm.name}
                    onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#087A3E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Designation *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Professor, Senior Lecturer, Lecturer I"
                    value={staffForm.designation}
                    onChange={(e) => setStaffForm({ ...staffForm, designation: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#087A3E]"
                  />
                </div>
                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Staff Adviser Level</label>
                  <select
                    value={staffForm.advisorLevel}
                    onChange={(e) => setStaffForm({ ...staffForm, advisorLevel: e.target.value as AcademicLevel | '' })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#087A3E]"
                  >
                    <option value="">None / Not an adviser</option>
                    <option value="100">100 Level Adviser</option>
                    <option value="200">200 Level Adviser</option>
                    <option value="300">300 Level Adviser</option>
                    <option value="400">400 Level Adviser</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                <input
                  type="checkbox"
                  id="staff-is-hod"
                  checked={staffForm.isHOD}
                  onChange={(e) => setStaffForm({ ...staffForm, isHOD: e.target.checked })}
                  className="rounded text-[#087A3E] focus:ring-[#087A3E]"
                />
                <label htmlFor="staff-is-hod" className="font-bold text-amber-900 dark:text-amber-200 cursor-pointer">
                  Designate as Head of Department (HOD)
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Office Room *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Room 214, Faculty of Science"
                    value={staffForm.office}
                    onChange={(e) => setStaffForm({ ...staffForm, office: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#087A3E]"
                  />
                </div>
                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Consultation Hours</label>
                  <input
                    type="text"
                    placeholder="e.g. Wed & Fri 10am - 12pm"
                    value={staffForm.consultationHours}
                    onChange={(e) => setStaffForm({ ...staffForm, consultationHours: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#087A3E]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Official Email</label>
                <input
                  type="email"
                  placeholder="e.g. k.ojo@ui.edu.ng"
                  value={staffForm.email}
                  onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#087A3E]"
                />
              </div>

              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Courses Taught (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. STA 111, STA 211, STA 720"
                  value={staffForm.courses}
                  onChange={(e) => setStaffForm({ ...staffForm, courses: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#087A3E]"
                />
              </div>

              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Lecturer Photo URL (Direct Link)</label>
                <input
                  type="url"
                  placeholder="https://... (Direct photo link)"
                  value={staffForm.imageUrl}
                  onChange={(e) => setStaffForm({ ...staffForm, imageUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#087A3E]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateStaffOpen(false)}
                  className="px-3 py-1.5 text-xs text-zinc-500 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#087A3E] hover:bg-[#066131] text-white font-bold transition-all shadow-xs"
                >
                  Save Lecturer Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Feedback / Request Revision Modal */}
      {feedbackTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setFeedbackTarget(null)} className="fixed inset-0 bg-black/40 backdrop-blur-xs" />
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white dark:bg-[#13171D] p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
              Request Document Revision
            </h3>
            <p className="text-xs text-zinc-500">
              Provide feedback for &ldquo;{feedbackTarget.resourceTitle}&rdquo;.
            </p>
            <textarea
              rows={3}
              value={feedbackNote}
              onChange={(e) => setFeedbackNote(e.target.value)}
              placeholder="e.g. Please re-scan pages 4 and 5 in clearer resolution."
              className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#087A3E]"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setFeedbackTarget(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-500 hover:bg-zinc-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmChanges}
                className="px-3.5 py-1.5 rounded-lg bg-[#087A3E] hover:bg-[#066131] text-white text-xs font-bold"
              >
                Dispatch Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Calendar Date Modal */}
      {isCreateCalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsCreateCalOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-xs" />
          <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white dark:bg-[#13171D] p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Schedule Academic Date</h3>
              <button onClick={() => setIsCreateCalOpen(false)} className="p-1 text-zinc-400 hover:text-zinc-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCalendarEvent} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. STA 311 Continuous Assessment Test"
                  value={calForm.title}
                  onChange={(e) => setCalForm({ ...calForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#087A3E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Category</label>
                  <select
                    value={calForm.category}
                    onChange={(e) => setCalForm({ ...calForm, category: e.target.value as CalendarCategory })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#087A3E]"
                  >
                    <option value="Continuous Assessment">Continuous Assessment (CA)</option>
                    <option value="Examination">Final Examination</option>
                    <option value="Academic Milestone">Academic Milestone</option>
                    <option value="Departmental Event">Departmental Event</option>
                    <option value="Registration Deadline">Registration Deadline</option>
                    <option value="Resumption / Senate">Resumption / Senate</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Target Level</label>
                  <select
                    value={calForm.targetLevel}
                    onChange={(e) => setCalForm({ ...calForm, targetLevel: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#087A3E]"
                  >
                    <option value="all">All Levels</option>
                    <option value="100">100 Level</option>
                    <option value="200">200 Level</option>
                    <option value="300">300 Level</option>
                    <option value="400">400 Level</option>
                    <option value="Postgraduate">Postgraduate</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={calForm.startDate}
                    onChange={(e) => setCalForm({ ...calForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#087A3E]"
                  />
                </div>
                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Venue (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. LLT"
                    value={calForm.venue}
                    onChange={(e) => setCalForm({ ...calForm, venue: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#087A3E]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCreateCalOpen(false)}
                  className="px-3 py-1.5 text-xs text-zinc-500 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-[#087A3E] hover:bg-[#066131] text-white text-xs font-bold"
                >
                  Schedule Date
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Broadcast Notice Modal */}
      {isCreateNoticeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsCreateNoticeOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-xs" />
          <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white dark:bg-[#13171D] p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Broadcast Department Notice</h3>
              <button onClick={() => setIsCreateNoticeOpen(false)} className="p-1 text-zinc-400 hover:text-zinc-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNotice} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Notice Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rescheduled STA 214 Practical Session"
                  value={noticeForm.title}
                  onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#087A3E]"
                />
              </div>

              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Notice Content *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Enter notice announcement details..."
                  value={noticeForm.content}
                  onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                  className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#087A3E]"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="notice-urgent"
                  checked={noticeForm.isUrgent}
                  onChange={(e) => setNoticeForm({ ...noticeForm, isUrgent: e.target.checked })}
                  className="rounded text-[#087A3E] focus:ring-[#087A3E]"
                />
                <label htmlFor="notice-urgent" className="text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                  Mark as High Priority / Urgent
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCreateNoticeOpen(false)}
                  className="px-3 py-1.5 text-xs text-zinc-500 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-[#087A3E] hover:bg-[#066131] text-white text-xs font-bold"
                >
                  Broadcast Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Opportunity Modal */}
      {isCreateOppOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsCreateOppOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-xs" />
          <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white dark:bg-[#13171D] p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Publish Opportunity</h3>
              <button onClick={() => setIsCreateOppOpen(false)} className="p-1 text-zinc-400 hover:text-zinc-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOpportunity} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Data Analytics Summer Internship 2026"
                  value={oppForm.title}
                  onChange={(e) => setOppForm({ ...oppForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#087A3E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Provider *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. KPMG Nigeria"
                    value={oppForm.provider}
                    onChange={(e) => setOppForm({ ...oppForm, provider: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#087A3E]"
                  />
                </div>
                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Application URL *</label>
                  <input
                    type="url"
                    required
                    placeholder="https://..."
                    value={oppForm.applicationUrl}
                    onChange={(e) => setOppForm({ ...oppForm, applicationUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#087A3E]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Details and eligibility..."
                  value={oppForm.description}
                  onChange={(e) => setOppForm({ ...oppForm, description: e.target.value })}
                  className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#087A3E]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOppOpen(false)}
                  className="px-3 py-1.5 text-xs text-zinc-500 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-[#087A3E] hover:bg-[#066131] text-white text-xs font-bold"
                >
                  Publish Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add FAQ Modal */}
      {isCreateFaqOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsCreateFaqOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-xs" />
          <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white dark:bg-[#13171D] p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Add Guidance FAQ</h3>
              <button onClick={() => setIsCreateFaqOpen(false)} className="p-1 text-zinc-400 hover:text-zinc-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFaq} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Question *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. How do I request past question solutions?"
                  value={faqForm.question}
                  onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#087A3E]"
                />
              </div>

              <div>
                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Answer *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide clear guidance..."
                  value={faqForm.answer}
                  onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                  className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#087A3E]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCreateFaqOpen(false)}
                  className="px-3 py-1.5 text-xs text-zinc-500 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-[#087A3E] hover:bg-[#066131] text-white text-xs font-bold"
                >
                  Save FAQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
