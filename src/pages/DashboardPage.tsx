import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MOCK_SUBMISSIONS, MOCK_RESOURCES } from '../lib/mockData';
import { 
  fetchStudentSubmissions, 
  fetchResources, 
  getCachedStudentProfile, 
  fetchUserBookmarks 
} from '../lib/supabase';
import { StudentSubmission, AcademicResource, UserProfile } from '../types';
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
import { triggerResourceDownload } from '../lib/download';
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
  const [downloadHistory, setDownloadHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'submissions' | 'downloads'>('bookmarks');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Quick Access Modals
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isCouncilModalOpen, setIsCouncilModalOpen] = useState(false);

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
          setBookmarks(allRes.slice(0, 3));
        }
      }
    });

    // Load local zero-login download history
    try {
      const history = JSON.parse(localStorage.getItem('asson_downloads') || '[]');
      setDownloadHistory(history);
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

  const studentName = profile?.displayName || 'Statistics Scholar';
  const studentInitial = studentName.charAt(0).toUpperCase();

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
                Hello, {studentName}
              </h1>
              <p className="text-xs text-text-muted truncate mt-0.5">
                Department of Statistics • University of Ibadan
              </p>
            </div>
          </div>

          {/* Top Right Quick Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/notices')}
              className="p-2.5 rounded-full bg-surface-bg hover:bg-surface-card border border-border-light text-text-muted hover:text-text-main transition-colors relative cursor-pointer"
              title="Notices & Announcements"
              aria-label="Notices and Announcements"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-green" />
            </button>

            <Link
              to="/more"
              className="p-2.5 rounded-full bg-surface-bg hover:bg-surface-card border border-border-light text-text-muted hover:text-text-main transition-colors cursor-pointer"
              title="Preferences & More"
              aria-label="Preferences and More"
            >
              <Settings className="w-4 h-4" />
            </Link>

            {!profile && onOpenAuth && (
              <button
                type="button"
                onClick={onOpenAuth}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-green/10 text-brand-green font-bold text-xs hover:bg-brand-green hover:text-white transition-all cursor-pointer ml-1"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sync Account</span>
              </button>
            )}
          </div>
        </div>

        {/* Search Pill Input (Image 2 Inspired) */}
        <div className="relative">
          <Search className="w-4 h-4 text-brand-green absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your saved past questions, courses, or notes..."
            className="w-full h-12 rounded-full border border-border-light bg-surface-bg pl-11 pr-4 text-xs sm:text-sm text-text-main placeholder:text-text-subtle focus:border-brand-green focus:outline-none shadow-2xs transition-all"
          />
        </div>

        {/* 2 High-Contrast Accent KPI Pills (Image 2 Reference: Lime & Arrow buttons) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Pill 1: Bookmarks / Saved Resources */}
          <div 
            onClick={() => setActiveTab('bookmarks')}
            className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800/80 cursor-pointer group hover:border-brand-green transition-all shadow-xs"
          >
            <div>
              <span className="text-xl sm:text-2xl font-black text-brand-deep dark:text-emerald-300 block">
                {bookmarks.length.toString().padStart(2, '0')}
              </span>
              <span className="text-xs font-bold text-brand-green dark:text-emerald-400">
                Bookmarked Resources
              </span>
            </div>
            <button
              type="button"
              className="w-9 h-9 rounded-full bg-brand-green text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs cursor-pointer shrink-0"
              aria-label="View saved bookmarks"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Pill 2: Submissions & Contributions */}
          <div 
            onClick={() => setActiveTab('submissions')}
            className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 border border-border-light cursor-pointer group hover:border-brand-green transition-all shadow-xs"
          >
            <div>
              <span className="text-xl sm:text-2xl font-black text-text-main block">
                {submissions.length.toString().padStart(2, '0')}
              </span>
              <span className="text-xs font-bold text-text-muted group-hover:text-brand-green transition-colors">
                Peer Submissions Logged
              </span>
            </div>
            <button
              type="button"
              className="w-9 h-9 rounded-full bg-zinc-800 dark:bg-zinc-700 text-white flex items-center justify-center group-hover:bg-brand-green group-hover:scale-110 transition-all shadow-xs cursor-pointer shrink-0"
              aria-label="View submitted papers"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
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
              Announcements & Examination Bulletin
            </h2>
          </div>
          <span className="text-xs font-mono text-zinc-300 bg-white/10 px-2 py-0.5 rounded-full">
            2h ago
          </span>
        </div>

        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-xl">
          Harmattan Semester Past Questions archive for 100L through 400L with model answers has been compiled and indexed. Download your course packs for offline preparation.
        </p>

        <div className="pt-1">
          <button
            type="button"
            onClick={() => navigate('/notices')}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white text-zinc-900 hover:bg-zinc-100 font-bold text-xs transition-transform active:scale-95 cursor-pointer shadow-md"
          >
            <span>Read Notice Board</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TABS: BOOKMARKS / SUBMISSIONS / DOWNLOADS                     */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-4">
        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-border-light pb-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('bookmarks')}
            className={`pb-2 px-3 border-b-2 cursor-pointer transition-colors ${
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
            className={`pb-2 px-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'submissions'
                ? 'border-brand-green text-brand-green'
                : 'border-transparent text-text-muted hover:text-text-main'
            }`}
          >
            My Submissions ({submissions.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('downloads')}
            className={`pb-2 px-3 border-b-2 cursor-pointer transition-colors ${
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
                <Bookmark className="w-8 h-8 text-text-muted mx-auto opacity-40" />
                <p className="text-sm font-bold text-text-main">No bookmarks saved yet</p>
                <p className="text-xs text-text-muted max-w-sm mx-auto">
                  Browse the Past Questions library and tap the bookmark icon on any paper to save it to your dashboard.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/resources')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-green text-white text-xs font-bold hover:bg-brand-deep cursor-pointer mt-2"
                >
                  <BookOpen className="w-3.5 h-3.5" /> Explore Library
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
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-brand-green border border-emerald-200/80 dark:border-emerald-800/80 font-mono">
                          {res.courseCode}
                        </span>
                        <span className="text-[10px] text-text-subtle font-mono">
                          {res.session} • {res.type}
                        </span>
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold text-text-main line-clamp-2">
                        {res.title}
                      </h3>
                      <p className="text-[11px] text-text-muted mt-1 font-mono">
                        {formatFileSize(res.fileSizeBytes)} • {res.level}L
                      </p>
                    </div>

                    <div className="pt-2 border-t border-border-light/60 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleDownload(res)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-green text-white text-xs font-bold hover:bg-brand-deep transition-colors cursor-pointer shadow-2xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PDF</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveBookmark(res.id)}
                        className="p-1.5 text-text-muted hover:text-red-500 transition-colors cursor-pointer"
                        title="Remove Bookmark"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
                <FileText className="w-8 h-8 text-text-muted mx-auto opacity-40" />
                <p className="text-sm font-bold text-text-main">No submissions recorded on this browser</p>
                <p className="text-xs text-text-muted max-w-sm mx-auto">
                  Have past questions, test papers or departmental lecture notes? Contribute to help fellow statistics scholars.
                </p>
                <button
                  type="button"
                  onClick={onOpenSubmit}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-green text-white text-xs font-bold hover:bg-brand-deep cursor-pointer mt-2"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Submit Material
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
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-mono">
                          {sub.courseCode}
                        </span>
                        <span className="text-xs font-bold text-text-main truncate">
                          {sub.resourceTitle}
                        </span>
                      </div>
                      <p className="text-[11px] text-text-muted mt-1 font-mono">
                        Tracking Ref: <span className="font-bold text-text-main">{sub.referenceCode || sub.id}</span> • {sub.submittedAt}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          sub.status === 'Approved'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-brand-green border border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 border border-amber-200 dark:border-amber-800'
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
                <History className="w-8 h-8 text-text-muted mx-auto opacity-40 mb-2" />
                <p className="text-sm font-bold text-text-main">No recent downloads</p>
                <p className="text-xs text-text-muted">Downloaded past questions will be logged here for offline quick access.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {downloadHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl border border-border-light bg-surface-card flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <span className="font-bold text-text-main block truncate">
                        {item.title}
                      </span>
                      <span className="text-[11px] text-text-muted font-mono">
                        Downloaded {item.date || 'recently'}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-brand-green font-mono">
                      Cached
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
