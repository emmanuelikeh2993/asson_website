import React, { useState, useEffect } from 'react';
import { MOCK_SUBMISSIONS, MOCK_RESOURCES } from '../lib/mockData';
import { fetchStudentSubmissions, fetchResources } from '../lib/supabase';
import { StudentSubmission, AcademicResource } from '../types';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { 
  User, 
  FileText, 
  Bookmark, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  PlusCircle, 
  Download,
  BookOpen
} from 'lucide-react';
import { formatFileSize, formatDate } from '../lib/utils';

interface DashboardPageProps {
  onOpenSubmit: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onOpenSubmit }) => {
  const [submissions, setSubmissions] = useState<StudentSubmission[]>(MOCK_SUBMISSIONS);
  const [bookmarks, setBookmarks] = useState<AcademicResource[]>(MOCK_RESOURCES.slice(0, 3));
  const [activeTab, setActiveTab] = useState<'submissions' | 'bookmarks'>('submissions');

  useEffect(() => {
    fetchStudentSubmissions().then((data) => {
      if (data && data.length > 0) {
        setSubmissions(data);
      }
    });
    fetchResources().then((data) => {
      if (data && data.length > 0) {
        setBookmarks(data.slice(0, 3));
      }
    });
  }, []);

  const bookmarkedResources = bookmarks;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Greeting Banner (inspired by Image 13 & Image 01) */}
      <div className="rounded-3xl bg-gradient-to-r from-brand-deep to-emerald-900 text-white p-6 sm:p-8 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shrink-0">
            <User className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                Welcome back, Insight
              </h1>
              <span className="text-[10px] font-semibold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                Active Scholar
              </span>
            </div>
            <p className="text-xs text-emerald-100/80 mt-1">
              Matric No: UI/2024/12345 • 200 Level Statistics • First Semester
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={onOpenSubmit}
          className="bg-white text-brand-deep hover:bg-emerald-50 shrink-0 font-semibold"
        >
          <PlusCircle className="w-4 h-4 mr-1.5" />
          Submit New Material
        </Button>
      </div>

      {/* 2. Stat Metric Cards (inspired by Image 16 & Image 13) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-border-light bg-surface-card shadow-card">
          <span className="text-xs font-semibold text-text-muted block">Submissions</span>
          <span className="text-2xl font-bold text-text-main mt-1 block">3</span>
          <span className="text-[11px] text-emerald-700 mt-1 block">1 Verified & Live</span>
        </div>
        <div className="p-5 rounded-2xl border border-border-light bg-surface-card shadow-card">
          <span className="text-xs font-semibold text-text-muted block">Saved Bookmarks</span>
          <span className="text-2xl font-bold text-text-main mt-1 block">5</span>
          <span className="text-[11px] text-text-muted mt-1 block">Quick study links</span>
        </div>
        <div className="p-5 rounded-2xl border border-border-light bg-surface-card shadow-card">
          <span className="text-xs font-semibold text-text-muted block">Materials Downloaded</span>
          <span className="text-2xl font-bold text-text-main mt-1 block">18</span>
          <span className="text-[11px] text-text-muted mt-1 block">Past papers & notes</span>
        </div>
        <div className="p-5 rounded-2xl border border-border-light bg-surface-card shadow-card">
          <span className="text-xs font-semibold text-text-muted block">Academic Standing</span>
          <span className="text-2xl font-bold text-brand-green mt-1 block">Good</span>
          <span className="text-[11px] text-text-muted mt-1 block">Departmental Member</span>
        </div>
      </div>

      {/* 3. Tab Navigation for Submissions vs Bookmarks */}
      <div>
        <div className="flex items-center gap-2 border-b border-border-light pb-2">
          <button
            onClick={() => setActiveTab('submissions')}
            className={`text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'submissions'
                ? 'bg-brand-light text-brand-deep font-bold'
                : 'text-text-muted hover:text-text-main hover:bg-surface-bg'
            }`}
          >
            <Clock className="w-4 h-4" />
            My Submissions & Vetting Status ({MOCK_SUBMISSIONS.length})
          </button>
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'bookmarks'
                ? 'bg-brand-light text-brand-deep font-bold'
                : 'text-text-muted hover:text-text-main hover:bg-surface-bg'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            Saved Bookmarks ({bookmarkedResources.length})
          </button>
        </div>

        {/* Tab Content 1: Submissions Tracker (inspired by Image 15 & Image 17) */}
        {activeTab === 'submissions' && (
          <div className="mt-4 space-y-3">
            {MOCK_SUBMISSIONS.map((sub) => {
              const statusVariant = 
                sub.status === 'Approved' ? 'approved' :
                sub.status === 'Under Review' ? 'pending' : 'changes-requested';

              return (
                <div
                  key={sub.id}
                  className="p-5 rounded-2xl border border-border-light bg-surface-card shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="course">{sub.courseCode}</Badge>
                      <h4 className="text-sm font-bold text-text-main">{sub.resourceTitle}</h4>
                      <Badge variant={statusVariant} withIcon>
                        {sub.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-text-muted">
                      {sub.resourceType} • {sub.session} • Submitted on {formatDate(sub.submittedAt)}
                    </p>
                    {sub.feedback && (
                      <p className="text-xs text-text-main bg-surface-bg p-2 rounded-lg border border-border-light/60 mt-2">
                        <span className="font-semibold text-brand-deep">Editorial Note:</span> {sub.feedback}
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono text-text-muted">
                      {formatFileSize(sub.fileSizeBytes)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab Content 2: Bookmarks */}
        {activeTab === 'bookmarks' && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {bookmarkedResources.map((res) => (
              <div
                key={res.id}
                className="p-5 rounded-2xl border border-border-light bg-surface-card shadow-card flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="course">{res.courseCode}</Badge>
                    <Badge variant="verified" withIcon>Verified</Badge>
                  </div>
                  <h4 className="text-xs font-bold text-text-main mb-1 line-clamp-2">
                    {res.title}
                  </h4>
                  <p className="text-[11px] text-text-muted">
                    {res.session} • {formatFileSize(res.fileSizeBytes)}
                  </p>
                </div>
                <div className="pt-3 border-t border-border-light/60 mt-3 flex justify-end">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => alert(`Downloading ${res.title}`)}
                    className="text-xs h-8"
                  >
                    <Download className="w-3.5 h-3.5 mr-1" /> Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

