import React, { useState, useEffect } from 'react';
import { MOCK_AUDIT_LOGS, MOCK_SUBMISSIONS, MOCK_RESOURCES } from '../lib/mockData';
import { fetchAuditLogs, fetchStudentSubmissions } from '../lib/supabase';
import { AuditLog, StudentSubmission } from '../types';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { 
  ShieldAlert, 
  CheckCircle, 
  XCircle, 
  FileCheck, 
  History, 
  Users, 
  TrendingUp, 
  ExternalLink 
} from 'lucide-react';
import { formatDate } from '../lib/utils';

export const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'moderation' | 'audit'>('moderation');
  const [submissions, setSubmissions] = useState<StudentSubmission[]>(MOCK_SUBMISSIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);

  useEffect(() => {
    fetchStudentSubmissions().then((data) => {
      if (data && data.length > 0) {
        setSubmissions(data);
      }
    });
    fetchAuditLogs().then((data) => {
      if (data && data.length > 0) {
        setAuditLogs(data);
      }
    });
  }, []);

  const handleApprove = (id: string) => {
    setSubmissions((prev) =>
      prev.map((sub) =>
        sub.id === id ? { ...sub, status: 'Approved' as const, feedback: 'Approved by Editor.' } : sub
      )
    );
    alert('Material approved and scheduled for public library publication.');
  };

  const handleRequestChanges = (id: string) => {
    const reason = prompt('Please specify feedback for the student (e.g. Blurry page 4):');
    if (reason) {
      setSubmissions((prev) =>
        prev.map((sub) =>
          sub.id === id ? { ...sub, status: 'Changes Requested' as const, feedback: reason } : sub
        )
      );
      alert('Feedback dispatched to student submission tracker.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-border-light flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-brand-green">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-text-main tracking-tight">
              ASSON Editorial & Admin Console
            </h1>
          </div>
          <p className="text-xs text-text-muted">
            Vetting pipeline, resource verification, audit logs, and departmental platform governance.
          </p>
        </div>

        {/* Console Mode Switcher */}
        <div className="flex items-center rounded-xl border border-border-light bg-surface-card p-1 text-xs">
          <button
            onClick={() => setActiveTab('moderation')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'moderation'
                ? 'bg-brand-green text-white shadow-sm font-semibold'
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            <FileCheck className="w-4 h-4" /> Vetting Queue ({submissions.filter(s => s.status === 'Under Review').length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'audit'
                ? 'bg-brand-green text-white shadow-sm font-semibold'
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            <History className="w-4 h-4" /> Audit Logs
          </button>
        </div>
      </div>

      {/* Admin Stat Metrics (inspired by Image 20) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-border-light bg-surface-card shadow-card">
          <span className="text-xs font-semibold text-text-muted block">Catalogued Resources</span>
          <span className="text-2xl font-bold text-text-main mt-1 block">{MOCK_RESOURCES.length}</span>
          <span className="text-[11px] text-brand-green mt-1 block">100% verified integrity</span>
        </div>
        <div className="p-5 rounded-2xl border border-border-light bg-surface-card shadow-card">
          <span className="text-xs font-semibold text-text-muted block">Pending Vetting</span>
          <span className="text-2xl font-bold text-amber-600 mt-1 block">
            {submissions.filter(s => s.status === 'Under Review').length}
          </span>
          <span className="text-[11px] text-text-muted mt-1 block">Awaiting review</span>
        </div>
        <div className="p-5 rounded-2xl border border-border-light bg-surface-card shadow-card">
          <span className="text-xs font-semibold text-text-muted block">Total Downloads</span>
          <span className="text-2xl font-bold text-text-main mt-1 block">2,410</span>
          <span className="text-[11px] text-emerald-700 mt-1 block">Across UI curriculum</span>
        </div>
        <div className="p-5 rounded-2xl border border-border-light bg-surface-card shadow-card">
          <span className="text-xs font-semibold text-text-muted block">Active Editorial Roles</span>
          <span className="text-2xl font-bold text-brand-deep mt-1 block">4</span>
          <span className="text-[11px] text-text-muted mt-1 block">ASSON Academic Exco</span>
        </div>
      </div>

      {/* View 1: Moderation Queue (inspired by Image 17) */}
      {activeTab === 'moderation' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-text-main">
            Submissions Moderation Pipeline
          </h3>

          <div className="overflow-hidden rounded-2xl border border-border-light bg-surface-card shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border-light bg-surface-bg font-semibold text-text-muted">
                    <th className="py-3 px-4">Course</th>
                    <th className="py-3 px-4">Material Title</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Session</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Moderator Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light/60">
                  {submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-surface-bg/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-brand-deep">
                        <Badge variant="course">{sub.courseCode}</Badge>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-text-main">
                        {sub.resourceTitle}
                      </td>
                      <td className="py-3.5 px-4 text-text-muted">
                        {sub.resourceType}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-text-muted">
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
                                onClick={() => handleApprove(sub.id)}
                                className="h-7 text-xs px-2.5"
                              >
                                <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRequestChanges(sub.id)}
                                className="h-7 text-xs px-2 text-amber-700 hover:bg-amber-50 hover:border-amber-200"
                              >
                                <XCircle className="w-3.5 h-3.5 mr-1" /> Request Changes
                              </Button>
                            </>
                          ) : (
                            <span className="text-[11px] text-text-subtle italic">Action completed</span>
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

      {/* View 2: Audit Logs Table (inspired by Image 23) */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-text-main">
            Platform Activity & Security Audit Logs
          </h3>

          <div className="overflow-hidden rounded-2xl border border-border-light bg-surface-card shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border-light bg-surface-bg font-semibold text-text-muted">
                    <th className="py-3 px-4">Administrator / User</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Target Entity</th>
                    <th className="py-3 px-4">Details</th>
                    <th className="py-3 px-4 text-right">Timestamp</th>
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
                        <td className="py-3.5 px-4 font-mono text-text-main">
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
    </div>
  );
};

