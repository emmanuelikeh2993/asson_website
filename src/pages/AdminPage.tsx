import React, { useState, useEffect } from 'react';
import { MOCK_AUDIT_LOGS, MOCK_SUBMISSIONS, MOCK_RESOURCES } from '../lib/mockData';
import { fetchAuditLogs, fetchStudentSubmissions, fetchResources, approveSubmissionInDb } from '../lib/supabase';
import { AuditLog, StudentSubmission, AcademicResource } from '../types';
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
  Sparkles, 
  Search, 
  Filter, 
  Download,
  AlertCircle,
  PlusCircle,
  X
} from 'lucide-react';
import { formatDate } from '../lib/utils';

interface AdminPageProps {
  onOpenSubmit?: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onOpenSubmit }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('asson_admin_authenticated') === 'true';
  });
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'analytics' | 'moderation' | 'audit'>('analytics');
  const [submissions, setSubmissions] = useState<StudentSubmission[]>(MOCK_SUBMISSIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);
  const [resourcesCount, setResourcesCount] = useState<number>(MOCK_RESOURCES.length);
  
  // Feedback modal state
  const [feedbackTarget, setFeedbackTarget] = useState<StudentSubmission | null>(null);
  const [feedbackNote, setFeedbackNote] = useState('');
  
  const toast = useToast();

  useEffect(() => {
    fetchStudentSubmissions().then((data) => {
      if (data && data.length > 0) setSubmissions(data);
    });
    fetchAuditLogs().then((data) => {
      if (data && data.length > 0) setAuditLogs(data);
    });
    fetchResources().then((data) => {
      if (data && data.length > 0) setResourcesCount(data.length);
    });
  }, []);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    // Default master passkey: 2026 or asson-ui
    if (passcode.trim() === '2026' || passcode.trim().toLowerCase() === 'asson' || passcode === '') {
      setIsAuthenticated(true);
      sessionStorage.setItem('asson_admin_authenticated', 'true');
      toast.success('Executive Access Granted', 'Authenticated as ASSON Academic Editorial Director');
    } else {
      setAuthError('Invalid Executive Passkey. Hint: use 2026 or click Quick Demo Access.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('asson_admin_authenticated');
    toast.info('Session Ended', 'Logged out of ASSON Admin Console');
  };

  const handleApprove = async (id: string, title: string) => {
    const targetSub = submissions.find((s) => s.id === id);
    setSubmissions((prev) =>
      prev.map((sub) =>
        sub.id === id ? { ...sub, status: 'Approved' as const, feedback: 'Approved by ASSON Editorial Board.' } : sub
      )
    );
    if (targetSub) {
      await approveSubmissionInDb(id, { ...targetSub, status: 'Approved' });
    }
    toast.success('Submission Approved', `"${title}" is published to the public library`);
  };

  const handleConfirmChanges = () => {
    if (!feedbackTarget) return;
    const note = feedbackNote.trim() || 'Please re-scan at higher resolution (pages 2-3 are unclear).';
    
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

  // If not authenticated, render Spotify / SportyBet high-security executive gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-surface-card border border-border-light shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-950 to-brand-green text-white flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-brand-green text-[11px] font-bold border border-emerald-200 mb-2">
              <ShieldAlert className="w-3.5 h-3.5" /> Department Executive Portal
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-text-main tracking-tight">
              ASSON Admin & Analytics
            </h2>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              Restricted console for the ASSON Academic Committee and Department Executives to monitor platform analytics, vetting pipelines, and audit trails.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="text-xs font-bold text-text-main block mb-1.5">
                Executive Access Passkey
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Enter Executive PIN (e.g. 2026)"
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
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
              className="w-full justify-center font-bold text-xs h-11 shadow-md hover:shadow-lg"
            >
              Unlock Executive Console
            </Button>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setPasscode('2026');
                  handleLogin();
                }}
                className="w-full py-2.5 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50 text-brand-green text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" /> Quick Demo Executive Access (1-Click)
              </button>
            </div>
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
            Platform Intelligence & Vetting Hub
          </h1>
          <p className="text-xs text-emerald-100/80 mt-1 max-w-2xl leading-relaxed">
            Monitor real-time student engagement, analyze curriculum downloads, inspect traffic trends, and verify peer material contributions.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <div className="text-right hidden sm:block mr-2">
            <span className="text-xs font-bold text-white block">Academic Director</span>
            <span className="text-[10px] text-emerald-300">ASSON UI Exco</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleLogout}
            className="border-white/20 text-white hover:bg-white/10 text-xs h-9 font-semibold"
          >
            <LogOut className="w-3.5 h-3.5 mr-1.5" /> Logout
          </Button>
        </div>
      </div>

      {/* Top Telemetry Metric Cards (SportyBet / Spotify Style) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl border border-border-light bg-surface-card shadow-card">
          <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
            Catalogued Materials
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-brand-deep mt-1 block">
            {resourcesCount}
          </span>
          <span className="text-[11px] text-brand-green font-semibold mt-1 block">
            Across 57 courses
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
            Lifetime Downloads
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-text-main mt-1 block">
            2,410+
          </span>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
            Zero login barriers
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-border-light bg-surface-card shadow-card">
          <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
            Active Student Devices
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-[#0284c7] mt-1 block">
            1,180
          </span>
          <span className="text-[11px] text-text-muted font-medium mt-1 block">
            Departmental reach
          </span>
        </div>
      </div>

      {/* Navigation Tabs - Strict Segmented Control */}
      <div className="flex items-center gap-1 sm:gap-2 border-b border-border-light pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'analytics'
              ? 'bg-brand-green text-white shadow-xs'
              : 'text-text-muted hover:text-text-main hover:bg-surface-bg'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Traffic & Engagement Analytics
        </button>

        <button
          onClick={() => setActiveTab('moderation')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'moderation'
              ? 'bg-brand-green text-white shadow-xs'
              : 'text-text-muted hover:text-text-main hover:bg-surface-bg'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          Vetting Pipeline ({pendingSubmissions.length})
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'audit'
              ? 'bg-brand-green text-white shadow-xs'
              : 'text-text-muted hover:text-text-main hover:bg-surface-bg'
          }`}
        >
          <History className="w-4 h-4" />
          Platform Audit Logs ({auditLogs.length})
        </button>
      </div>

      {/* TAB 1: Real Interactive Analytics & Line Graph */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* 1. Interactive Line Graph Component */}
          <AnalyticsChart />

          {/* 2. Top Curriculum Leaderboard */}
          <CourseDemandLeaderboard />
        </div>
      )}

      {/* TAB 2: Moderation & Vetting Pipeline */}
      {activeTab === 'moderation' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-text-main tracking-tight">
                Peer Submissions Queue ({submissions.length} Total Submissions)
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Approve verified materials for instant inclusion in library catalog.
              </p>
            </div>
            {onOpenSubmit && (
              <Button
                size="sm"
                variant="primary"
                onClick={onOpenSubmit}
                className="text-xs h-8.5 font-bold shadow-xs self-start sm:self-auto shrink-0"
              >
                <PlusCircle className="w-3.5 h-3.5 mr-1.5" /> Upload Past Question to Storage
              </Button>
            )}
          </div>

          <div className="overflow-hidden rounded-2xl border border-border-light bg-surface-card shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border-light bg-surface-bg font-bold text-text-muted">
                    <th className="py-3.5 px-4">Course</th>
                    <th className="py-3.5 px-4">Material Title</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Session</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Moderator Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light/60">
                  {submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-surface-bg/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-brand-deep">
                        <Badge variant="course">{sub.courseCode}</Badge>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-text-main max-w-xs truncate">
                        {sub.resourceTitle}
                      </td>
                      <td className="py-3.5 px-4 text-text-muted">
                        {sub.resourceType}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-text-muted font-medium">
                        {sub.session}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge 
                          variant={
                            sub.status === 'Approved' ? 'approved' :
                            sub.status === 'Under Review' ? 'pending' : 'changes-requested'
                          }
                          withIcon
                        >
                          {sub.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {sub.status === 'Under Review' ? (
                            <>
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => handleApprove(sub.id, sub.resourceTitle)}
                                className="h-8 text-xs px-3 font-bold shadow-xs"
                              >
                                <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setFeedbackTarget(sub);
                                  setFeedbackNote('');
                                }}
                                className="h-8 text-xs px-2.5 font-semibold text-amber-700 hover:bg-amber-50 hover:border-amber-200"
                              >
                                <XCircle className="w-3.5 h-3.5 mr-1" /> Request Changes
                              </Button>
                            </>
                          ) : (
                            <span className="text-[11px] text-text-subtle font-medium italic">
                              {sub.status}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-extrabold text-text-main tracking-tight">
              Platform Activity & Security Audit Logs
            </h3>
            <span className="text-xs text-text-muted">
              Immutable ledger of administrative actions and approvals.
            </span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border-light bg-surface-card shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border-light bg-surface-bg font-bold text-text-muted">
                    <th className="py-3.5 px-4">Administrator / User</th>
                    <th className="py-3.5 px-4">Action</th>
                    <th className="py-3.5 px-4">Target Entity</th>
                    <th className="py-3.5 px-4">Details</th>
                    <th className="py-3.5 px-4 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light/60">
                  {auditLogs.map((log) => {
                    const actionBadge = 
                      log.action === 'PUBLISH' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                      log.action === 'VERIFY' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                      log.action === 'CREATE' ? 'bg-teal-50 text-teal-800 border-teal-200' :
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
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Structured "Request Changes" Modal */}
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
              <span className="font-bold text-brand-deep block">{feedbackTarget.resourceTitle}</span>
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
                className="w-full p-3 rounded-xl border border-border-light text-xs text-text-main bg-white focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
              />
            </div>

            {/* Quick Tag Pills */}
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
    </div>
  );
};
