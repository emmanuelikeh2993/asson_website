import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  fetchStudentSubmissions,
  fetchResources,
  fetchNotices,
  getCachedStudentProfile,
  fetchUserBookmarks
} from '../lib/supabase';
import { StudentSubmission, AcademicResource, UserProfile, Notice } from '../types';
import { 
  User, 
  FileText, 
  Bookmark, 
  Clock, 
  CheckCircle2, 
  PlusCircle, 
  Download,
  BookOpen,
  History,
  ShieldCheck,
  Settings,
  LogIn,
  Search,
  Bell,
  ArrowRight,
  Building2,
  Briefcase,
  Calendar,
  Award,
  ChevronRight,
  ExternalLink,
  Trash2
} from 'lucide-react';
import { formatFileSize, formatDate } from '../lib/utils';
import { triggerResourceDownload, type DownloadHistoryEntry } from '../lib/download';
import { useToast } from '../components/ui/Toast';
import { StaffDirectoryModal } from '../components/features/department/StaffDirectoryModal';
import { ExecutiveCouncilModal } from '../components/features/department/ExecutiveCouncilModal';

interface DashboardPageProps {
  onOpenSubmit: () => void;
  onOpenAuth?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ 
  onOpenSubmit, 
  onOpenAuth 
}) => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(() => getCachedStudentProfile());
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [bookmarks, setBookmarks] = useState<AcademicResource[]>([]);
  const [downloadHistory, setDownloadHistory] = useState<DownloadHistoryEntry[]>([]);
  const [latestNotice, setLatestNotice] = useState<Notice | null>(null);
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'submissions' | 'downloads'>('bookmarks');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Quick Access Modals
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isCouncilModalOpen, setIsCouncilModalOpen] = useState(false);

  const toast = useToast();

  useEffect(() => {
    const cached = getCachedStudentProfile();
    setProfile(cached);

    // Guests only see submissions saved locally on this device (never seeded or other students' rows)
    if (cached) {
      fetchStudentSubmissions().then((data) => {
        setSubmissions(data || []);
      });
    } else {
      try {
        const localSubs = JSON.parse(localStorage.getItem('asson_submissions') || '[]');
        setSubmissions(Array.isArray(localSubs) ? (localSubs as StudentSubmission[]) : []);
      } catch {
        setSubmissions([]);
      }
    }

    Promise.all([fetchResources(), fetchUserBookmarks(cached?.id)]).then(([allRes, bmarkIds]) => {
      if (allRes && allRes.length > 0 && bmarkIds && bmarkIds.length > 0) {
        const userBookmarks = allRes.filter((r) => bmarkIds.includes(r.id));
        setBookmarks(userBookmarks);
      } else {
        setBookmarks([]);
      }
    });

    fetchNotices().then((notices) => {
      const active = (notices || []).find((n) => !n.isExpired);
      setLatestNotice(active || null);
    });

    // Load local browser download history
    try {
      const history = JSON.parse(localStorage.getItem('asson_downloads') || '[]');
      setDownloadHistory(Array.isArray(history) ? (history as DownloadHistoryEntry[]) : []);
    } catch {
      // ignore
    }
  }, []);

  const handleDownload = (res: AcademicResource) => {
    triggerResourceDownload(res, (title, message) => {
      toast.success(title, message);
    });
  };

  const handleRemoveBookmark = (resId: string) => {
    try {
      const cached = JSON.parse(localStorage.getItem('asson_bookmarks') || '[]');
      const updated = cached.filter((id: string) => id !== resId);
      localStorage.setItem('asson_bookmarks', JSON.stringify(updated));
      setBookmarks((prev) => prev.filter((b) => b.id !== resId));
      toast.success('Removed', 'Resource removed from study bookmarks.');
    } catch {
      // ignore
    }
  };

  const studentName = profile?.displayName || 'Guest Study Locker';
  const studentInitial = profile ? studentName.charAt(0).toUpperCase() : 'G';

  const filteredBookmarks = bookmarks.filter((b) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      b.title.toLowerCase().includes(q) ||
      b.courseCode.toLowerCase().includes(q) ||
      b.type.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6 pb-24 w-full">
      {/* ------------------------------------------------------------- */}
      {/* TOP CARD (IMAGE 2 INSPIRED: MINIMALIST, HIGH-CONTRAST ACCENTS) */}
      {/* ------------------------------------------------------------- */}
      <div className="rounded-3xl bg-surface-card border border-border-light p-5 sm:p-7 shadow-lg space-y-5">
        {/* Top Row: User Greeting, Avatar & Quick Actions */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Student Avatar with green status ring */}
            <div className="relative shrink-0">
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border-2 border-brand-green text-brand-green flex items-center justify-center font-black text-lg sm:text-xl shadow-xs">
                {profile?.avatarUrl ? (
                  <img 
                    src={profile.avatarUrl} 
                    alt={studentName} 
                    className="w-full h-full rounded-full object-cover" 
                  />
                ) : (
                  studentInitial
                )}
              </div>
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-brand-green border-2 border-surface-card" />
            </div>

            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-extrabold text-text-main truncate">
                {profile ? `Hello, ${studentName}` : 'Guest Study Locker'}
              </h1>
              <p className="text-xs text-text-muted truncate mt-0.5">
                {profile
                  ? 'Department of Statistics • Synced Account'
                  : 'Saved on this browser only • Optional sign-in syncs across devices'}
              </p>
            </div>
          </div>

          {/* Top Right Quick Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/notices')}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-surface-bg hover:bg-surface-card border border-border-light text-text-muted hover:text-text-main transition-colors relative cursor-pointer"
              title="Notices & Announcements"
              aria-label="Notices and Announcements"
            >
              <Bell className="w-4 h-4" aria-hidden="true" />
              {latestNotice && <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-brand-green" />}
            </button>

            <Link
              to="/more"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-surface-bg hover:bg-surface-card border border-border-light text-text-muted hover:text-text-main transition-colors cursor-pointer"
              title="Preferences & More"
              aria-label="Preferences and More"
            >
              <Settings className="w-4 h-4" aria-hidden="true" />
            </Link>

            {!profile && onOpenAuth && (
              <button
                type="button"
                onClick={onOpenAuth}
                className="inline-flex items-center gap-1.5 px-3 min-h-[44px] rounded-xl bg-brand-light text-brand-deep dark:text-emerald-300 font-bold text-xs hover:bg-brand-green hover:text-white transition-all cursor-pointer ml-1"
              >
                <LogIn className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Sign In to Sync</span>
              </button>
            )}
          </div>
        </div>

        {/* Search Pill Input (Image 2 Inspired) */}
        <div className="relative">
          <Search className="w-4 h-4 text-brand-green absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search your saved past questions, courses, or notes"
            placeholder="Search your saved past questions, courses, or notes..."
            className="w-full h-12 rounded-full border border-border-light bg-surface-bg pl-11 pr-4 text-base sm:text-sm text-text-main placeholder:text-text-subtle focus:border-brand-green focus:ring-2 focus:ring-brand-green/40 focus:outline-none shadow-2xs transition-all"
          />
        </div>

        {/* 2 High-Contrast Accent KPI Pills (Image 2 Reference: Lime & Arrow buttons) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Pill 1: Bookmarks / Saved Resources */}
          <button
            type="button"
            onClick={() => setActiveTab('bookmarks')}
            className="w-full text-left flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800/80 cursor-pointer group hover:border-brand-green transition-all shadow-xs min-h-[64px]"
          >
            <div>
              <span className="text-xl sm:text-2xl font-black text-brand-deep dark:text-emerald-300 block">
                {bookmarks.length.toString().padStart(2, '0')}
              </span>
              <span className="text-xs font-bold text-brand-green dark:text-emerald-400">
                Bookmarked Resources
              </span>
            </div>
            <span
              className="w-9 h-9 rounded-full bg-brand-green text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs shrink-0"
              aria-hidden="true"
            >
              <ArrowRight className="w-4 h-4" />
            </span>
          </button>

          {/* Pill 2: Submissions & Contributions */}
          <button
            type="button"
            onClick={() => setActiveTab('submissions')}
            className="w-full text-left flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 border border-border-light cursor-pointer group hover:border-brand-green transition-all shadow-xs min-h-[64px]"
          >
            <div>
              <span className="text-xl sm:text-2xl font-black text-text-main block">
                {submissions.length.toString().padStart(2, '0')}
              </span>
              <span className="text-xs font-bold text-text-muted group-hover:text-brand-green transition-colors">
                {profile ? 'Account Submissions' : 'Device Submissions'}
              </span>
            </div>
            <span
              className="w-9 h-9 rounded-full bg-zinc-800 dark:bg-zinc-700 text-white flex items-center justify-center group-hover:bg-brand-green group-hover:scale-110 transition-all shadow-xs shrink-0"
              aria-hidden="true"
            >
              <ArrowRight className="w-4 h-4" />
            </span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* QUICK ACTIONS PILLS (HORIZONTAL SCROLLING)                    */}
      {/* ------------------------------------------------------------- */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <button
          type="button"
          onClick={() => navigate('/resources')}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-zinc-900 text-white dark:bg-zinc-800 dark:hover:bg-zinc-700 font-bold whitespace-nowrap transition-all shadow-xs cursor-pointer hover:bg-zinc-800 shrink-0"
        >
          <BookOpen className="w-3.5 h-3.5 text-brand-green" />
          <span>Past Questions</span>
        </button>

        <button
          type="button"
          onClick={() => setIsStaffModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-surface-card border border-border-light text-text-main font-bold whitespace-nowrap hover:bg-surface-bg transition-all shadow-2xs cursor-pointer shrink-0"
        >
          <Building2 className="w-3.5 h-3.5 text-brand-green" />
          <span>Staff Directory</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/enterprise')}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-surface-card border border-border-light text-text-main font-bold whitespace-nowrap hover:bg-surface-bg transition-all shadow-2xs cursor-pointer shrink-0"
        >
          <Briefcase className="w-3.5 h-3.5 text-brand-green" />
          <span>Enterprise Hub</span>
        </button>

        <button
          type="button"
          onClick={() => setIsCouncilModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-surface-card border border-border-light text-text-main font-bold whitespace-nowrap hover:bg-surface-bg transition-all shadow-2xs cursor-pointer shrink-0"
        >
          <Award className="w-3.5 h-3.5 text-brand-green" />
          <span>Executive Council</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/calendar')}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-surface-card border border-border-light text-text-main font-bold whitespace-nowrap hover:bg-surface-bg transition-all shadow-2xs cursor-pointer shrink-0"
        >
          <Calendar className="w-3.5 h-3.5 text-brand-green" />
          <span>Academic Dates</span>
        </button>

        <button
          type="button"
          onClick={onOpenSubmit}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-brand-green text-white font-bold whitespace-nowrap hover:bg-brand-deep transition-all shadow-xs cursor-pointer shrink-0 ml-auto"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Submit Material</span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* PROMINENT ANNOUNCEMENTS CARD (IMAGE 2 WATER MAINTENANCE STYLE) */}
      {/* ------------------------------------------------------------- */}
      <div className="rounded-3xl bg-zinc-900 text-white p-5 sm:p-6 shadow-xl space-y-3.5 relative overflow-hidden border border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-green" aria-hidden="true" />
            <h2 className="text-sm sm:text-base font-bold text-white">
              {latestNotice ? latestNotice.title : 'Departmental Notice Board'}
            </h2>
          </div>
          <span className="text-xs font-mono text-zinc-300 bg-white/10 px-2.5 py-0.5 rounded-full">
            {latestNotice ? formatDate(latestNotice.publishedDate) : 'Live Board'}
          </span>
        </div>

        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-xl">
          {latestNotice
            ? latestNotice.summary
            : 'Check the Notice Board and Academic Calendar for departmental circulars, examination schedules, and ASSON communiques.'}
        </p>

        <div className="pt-1">
          <button
            type="button"
            onClick={() => navigate('/notices')}
            className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white text-zinc-900 hover:bg-zinc-100 font-bold text-xs transition-transform active:scale-95 cursor-pointer shadow-md"
          >
            <span>Read Notice Board</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TABS: BOOKMARKS / SUBMISSIONS / DOWNLOADS                     */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-4">
        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-border-light pb-1 text-xs font-bold overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('bookmarks')}
            className={`min-h-[44px] pb-2 px-3 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'bookmarks'
                ? 'border-brand-green text-brand-green'
                : 'border-transparent text-text-muted hover:text-text-main'
            }`}
          >
            Saved Bookmarks ({bookmarks.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('submissions')}
            className={`min-h-[44px] pb-2 px-3 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'submissions'
                ? 'border-brand-green text-brand-green'
                : 'border-transparent text-text-muted hover:text-text-main'
            }`}
          >
            {profile ? `My Submissions (${submissions.length})` : `Device Submissions (${submissions.length})`}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('downloads')}
            className={`min-h-[44px] pb-2 px-3 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'downloads'
                ? 'border-brand-green text-brand-green'
                : 'border-transparent text-text-muted hover:text-text-main'
            }`}
          >
            Offline Downloads ({downloadHistory.length})
          </button>
        </div>

        {/* Tab 1: Bookmarks Content */}
        {activeTab === 'bookmarks' && (
          <div className="space-y-3">
            {filteredBookmarks.length === 0 ? (
              <div className="py-12 text-center rounded-2xl bg-surface-card border border-border-light p-6 space-y-2">
                <Bookmark className="w-8 h-8 text-text-muted mx-auto opacity-40" aria-hidden="true" />
                <p className="text-sm font-bold text-text-main">No bookmarks saved yet</p>
                <p className="text-xs text-text-muted max-w-sm mx-auto">
                  {profile
                    ? 'Browse the Academic Library and tap the bookmark icon on any paper to save it here.'
                    : 'Browse the Library freely and bookmark resources to keep them saved in this browser (or sign in to sync across devices).'}
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/resources')}
                  className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-green text-white text-xs font-bold hover:bg-brand-deep cursor-pointer mt-2"
                >
                  <BookOpen className="w-3.5 h-3.5" aria-hidden="true" /> Explore Library
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredBookmarks.map((res) => (
                  <div
                    key={res.id}
                    className="p-4 rounded-2xl border border-border-light bg-surface-card hover:border-brand-green/60 transition-all flex flex-col justify-between space-y-3 shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-xs font-black px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-brand-green border border-emerald-200/80 dark:border-emerald-800/80 font-mono">
                          {res.courseCode}
                        </span>
                        <span className="text-xs text-text-subtle font-mono">
                          {res.session} • {res.type}
                        </span>
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold text-text-main line-clamp-2">
                        {res.title}
                      </h3>
                      <p className="text-xs text-text-muted mt-1 font-mono">
                        {formatFileSize(res.fileSizeBytes)} • {res.level}L
                      </p>
                    </div>

                    <div className="pt-2 border-t border-border-light/60 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleDownload(res)}
                        className="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-green text-white text-xs font-bold hover:bg-brand-deep transition-colors cursor-pointer shadow-2xs"
                      >
                        <Download className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Download</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveBookmark(res.id)}
                        aria-label={`Remove ${res.title} from bookmarks`}
                        className="min-w-[44px] min-h-[44px] flex items-center justify-center text-text-muted hover:text-brand-red transition-colors cursor-pointer rounded-xl"
                        title="Remove Bookmark"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Submissions Content */}
        {activeTab === 'submissions' && (
          <div className="space-y-3">
            {submissions.length === 0 ? (
              <div className="py-12 text-center rounded-2xl bg-surface-card border border-border-light p-6 space-y-2">
                <FileText className="w-8 h-8 text-text-muted mx-auto opacity-40" aria-hidden="true" />
                <p className="text-sm font-bold text-text-main">No submissions recorded on this browser</p>
                <p className="text-xs text-text-muted max-w-sm mx-auto">
                  Have past questions, test papers or departmental lecture notes? Contribute to help fellow statistics scholars.
                </p>
                <button
                  type="button"
                  onClick={onOpenSubmit}
                  className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-green text-white text-xs font-bold hover:bg-brand-deep cursor-pointer mt-2"
                >
                  <PlusCircle className="w-3.5 h-3.5" aria-hidden="true" /> Submit Material
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {submissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-4 rounded-2xl border border-border-light bg-surface-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-mono">
                          {sub.courseCode}
                        </span>
                        <span className="text-xs font-bold text-text-main truncate">
                          {sub.resourceTitle}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted mt-1 font-mono">
                        Tracking Ref: <span className="font-bold text-text-main">{sub.referenceCode || sub.id}</span> • {sub.submittedAt}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          sub.status === 'Approved'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-brand-green border border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Downloads History */}
        {activeTab === 'downloads' && (
          <div className="space-y-3">
            {downloadHistory.length === 0 ? (
              <div className="py-12 text-center rounded-2xl bg-surface-card border border-border-light p-6">
                <History className="w-8 h-8 text-text-muted mx-auto opacity-40 mb-2" aria-hidden="true" />
                <p className="text-sm font-bold text-text-main">No recent downloads</p>
                <p className="text-xs text-text-muted">Downloaded past questions will be logged here for quick access on this device.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {downloadHistory.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-3.5 rounded-2xl border border-border-light bg-surface-card flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <span className="font-bold text-text-main block truncate">
                        {item.title}
                      </span>
                      <span className="text-xs text-text-muted font-mono">
                        {item.courseCode} • Downloaded {item.downloadedAt ? formatDate(item.downloadedAt) : 'recently'}
                      </span>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-brand-green font-mono shrink-0">
                      Saved Locally
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* QUICK MODALS */}
      <StaffDirectoryModal 
        isOpen={isStaffModalOpen} 
        onClose={() => setIsStaffModalOpen(false)} 
      />

      <ExecutiveCouncilModal
        isOpen={isCouncilModalOpen}
        onClose={() => setIsCouncilModalOpen(false)}
      />
    </div>
  );
};
