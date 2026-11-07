import React, { useState, useEffect } from 'react';
import { MOCK_SUBMISSIONS, MOCK_RESOURCES } from '../lib/mockData';
import { fetchStudentSubmissions, fetchResources, getCachedStudentProfile, fetchUserBookmarks } from '../lib/supabase';
import { StudentSubmission, AcademicResource, UserProfile } from '../types';
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
  BookOpen,
  History,
  ShieldCheck,
  Settings,
  LogIn
} from 'lucide-react';
import { formatFileSize, formatDate } from '../lib/utils';
import { triggerResourceDownload } from '../lib/download';
import { useToast } from '../components/ui/Toast';

interface DashboardPageProps {
  onOpenSubmit: () => void;
  onOpenSettings?: () => void;
  onOpenAuth?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onOpenSubmit, onOpenSettings, onOpenAuth }) => {
  const [profile, setProfile] = useState<UserProfile | null>(() => getCachedStudentProfile());
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [bookmarks, setBookmarks] = useState<AcademicResource[]>([]);
  const [downloadHistory, setDownloadHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'submissions' | 'bookmarks' | 'downloads'>('submissions');
  const toast = useToast();

  useEffect(() => {
    const cached = getCachedStudentProfile();
    setProfile(cached);

    fetchStudentSubmissions().then((data) => {
      setSubmissions(data || []);
    });

    Promise.all([fetchResources(), fetchUserBookmarks(cached?.id)]).then(([allRes, bmarkIds]) => {
      if (allRes && allRes.length > 0) {
        if (bmarkIds && bmarkIds.length > 0) {
          const userBookmarks = allRes.filter((r) => bmarkIds.includes(r.id));
          setBookmarks(userBookmarks);
        } else {
          setBookmarks(allRes.slice(0, 2));
        }
      }
    });

    // Load local zero-login download history
    try {
      const history = JSON.parse(localStorage.getItem('asson_downloads') || '[]');
      setDownloadHistory(history);
    } catch (e) {
      // ignore
    }
  }, []);

  const handleDownloadBookmark = (res: AcademicResource) => {
    triggerResourceDownload(res, (title, message) => {
      toast.success(title, message);
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* 1. Device Study Locker Banner (Zero-Login Transparency) */}
      <div className="rounded-3xl bg-gradient-to-r from-brand-deep to-emerald-900 text-white p-6 sm:p-8 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shrink-0 font-bold text-xl">
            {profile ? profile.displayName.charAt(0).toUpperCase() : <User className="w-7 h-7 sm:w-8 sm:h-8" />}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight">
                {profile ? `${profile.displayName}'s Study Locker` : 'My Academic Study Locker'}
              </h1>
              <span className="text-[10px] font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                {profile ? `${profile.level}L • Cloud Synchronized` : 'Device-Local Storage'}
              </span>
            </div>
            <p className="text-xs text-emerald-100/80 mt-1 max-w-xl leading-relaxed">
              {profile 
                ? 'Your bookmarks, download history, and submitted papers are synchronized with your verified student account.'
                : 'Your submissions, bookmarks, and downloads are preserved locally on this browser. Zero login or account required.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          {!profile && onOpenAuth && (
            <button
              type="button"
              onClick={onOpenAuth}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In / Sync</span>
            </button>
          )}
          {onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
              title="Preferences & Settings"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Preferences</span>
            </button>
          )}
          <Button
            variant="primary"
            size="md"
            onClick={onOpenSubmit}
            className="bg-white text-brand-deep hover:bg-emerald-50 shrink-0 font-bold text-xs h-10 shadow-md"
          >
            <PlusCircle className="w-4 h-4 mr-1.5" />
            Submit Academic Material
          </Button>
        </div>
      </div>

      {/* 2. Stat Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl border border-border-light bg-surface-card shadow-card">
          <span className="text-[11px] sm:text-xs font-bold text-text-muted uppercase tracking-wider block">Submissions</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-text-main mt-1 block">{submissions.length}</span>
          <span className="text-[11px] text-emerald-700 mt-1 block font-medium">Logged & Tracking</span>
        </div>
        <div className="p-4 sm:p-5 rounded-2xl border border-border-light bg-surface-card shadow-card">
          <span className="text-[11px] sm:text-xs font-bold text-text-muted uppercase tracking-wider block">Saved Bookmarks</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-text-main mt-1 block">{bookmarks.length}</span>
          <span className="text-[11px] text-text-muted mt-1 block">Quick study links</span>
        </div>
        <div className="p-4 sm:p-5 rounded-2xl border border-border-light bg-surface-card shadow-card">
          <span className="text-[11px] sm:text-xs font-bold text-text-muted uppercase tracking-wider block">Downloads</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-text-main mt-1 block">{downloadHistory.length}</span>
          <span className="text-[11px] text-text-muted mt-1 block">Cached to this device</span>
        </div>
        <div className="p-4 sm:p-5 rounded-2xl border border-border-light bg-surface-card shadow-card">
          <span className="text-[11px] sm:text-xs font-bold text-text-muted uppercase tracking-wider block">Access Status</span>
          <span className="text-xl sm:text-2xl font-bold text-brand-green mt-1 block">Unrestricted</span>
          <span className="text-[11px] text-text-muted mt-1 block">No login required</span>
        </div>
      </div>

      {/* 3. Tab Navigation */}
      <div>
        <div className="flex items-center gap-1 sm:gap-2 border-b border-border-light pb-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('submissions')}
            className={`text-xs sm:text-sm font-bold px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'submissions'
                ? 'bg-brand-light text-brand-deep shadow-xs'
                : 'text-text-muted hover:text-text-main hover:bg-surface-bg'
            }`}
          >
            <Clock className="w-4 h-4" />
            My Submissions ({submissions.length})
          </button>
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`text-xs sm:text-sm font-bold px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'bookmarks'
                ? 'bg-brand-light text-brand-deep shadow-xs'
                : 'text-text-muted hover:text-text-main hover:bg-surface-bg'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            Saved Bookmarks ({bookmarks.length})
          </button>
          <button
            onClick={() => setActiveTab('downloads')}
            className={`text-xs sm:text-sm font-bold px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'downloads'
                ? 'bg-brand-light text-brand-deep shadow-xs'
                : 'text-text-muted hover:text-text-main hover:bg-surface-bg'
            }`}
          >
            <History className="w-4 h-4" />
            Recent Downloads ({downloadHistory.length})
          </button>
        </div>

        {/* Tab 1: Submissions Tracker */}
        {activeTab === 'submissions' && (
          <div className="mt-4 space-y-3">
            {submissions.map((sub) => {
              const statusVariant = 
                sub.status === 'Approved' ? 'approved' :
                sub.status === 'Under Review' ? 'pending' : 'changes-requested';

              return (
                <div
                  key={sub.id}
                  className="p-5 rounded-2xl border border-border-light bg-surface-card shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
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
                      <p className="text-xs text-text-main bg-surface-bg p-2.5 rounded-xl border border-border-light/60 mt-2">
                        <span className="font-bold text-brand-deep">Editorial Status:</span> {sub.feedback}
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

        {/* Tab 2: Bookmarks */}
        {activeTab === 'bookmarks' && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {bookmarks.map((res) => (
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
                    onClick={() => handleDownloadBookmark(res)}
                    className="text-xs h-8 font-bold"
                  >
                    <Download className="w-3.5 h-3.5 mr-1" /> Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Recent Downloads */}
        {activeTab === 'downloads' && (
          <div className="mt-4 space-y-2">
            {downloadHistory.length === 0 ? (
              <div className="p-8 text-center text-xs text-text-muted border border-dashed rounded-2xl bg-surface-card">
                No materials downloaded yet on this device. Explore past questions and download anytime!
              </div>
            ) : (
              downloadHistory.map((item, idx) => (
                <div
                  key={`${item.id}-${idx}`}
                  className="p-4 rounded-xl border border-border-light bg-surface-card flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="p-2 rounded-lg bg-emerald-50 text-brand-green">
                      <Download className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="font-bold text-text-main">{item.title}</h4>
                      <span className="text-[11px] text-text-muted">
                        Course: {item.courseCode} • {formatFileSize(item.fileSizeBytes)}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] text-text-subtle">
                    {item.downloadedAt ? new Date(item.downloadedAt).toLocaleDateString() : 'Recent'}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
