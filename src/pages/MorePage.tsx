import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  GraduationCap,
  ChevronRight,
  Building2,
  Briefcase,
  Award,
  PlusCircle,
  HelpCircle,
  Calculator,
  BookOpen,
  Calendar,
  Sparkles,
  Settings,
  Bookmark,
} from 'lucide-react';
import { getCachedStudentProfile } from '../lib/supabase';
import { getDefaultLevelPreference } from '../lib/preferences';
import { UserProfile } from '../types';
import { Modal } from '../components/ui/Modal';
import { StaffDirectoryModal } from '../components/features/department/StaffDirectoryModal';
import { ExecutiveCouncilModal } from '../components/features/department/ExecutiveCouncilModal';

interface MorePageProps {
  onOpenSubmit: () => void;
  onOpenAuth: () => void;
}

export const MorePage: React.FC<MorePageProps> = ({ onOpenAuth, onOpenSubmit }) => {
  const [profile, setProfile] = useState<UserProfile | null>(() => getCachedStudentProfile());
  const [defaultLevel] = useState(() => getDefaultLevelPreference());
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [downloadCount, setDownloadCount] = useState(0);

  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showExecModal, setShowExecModal] = useState(false);

  useEffect(() => {
    setProfile(getCachedStudentProfile());
    try {
      const b = JSON.parse(localStorage.getItem('asson_bookmarks') || '[]');
      const d = JSON.parse(localStorage.getItem('asson_downloads') || '[]');
      setBookmarkCount(Array.isArray(b) ? b.length : 0);
      setDownloadCount(Array.isArray(d) ? d.length : 0);
    } catch {
      // ignore storage errors
    }
  }, []);

  const displayName = profile ? profile.displayName : 'Guest Scholar';
  const levelTag = profile?.level ? `${profile.level}L` : defaultLevel === 'All' ? 'All' : `${defaultLevel}L`;

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-5 sm:py-8 space-y-4 pb-24">
      {/* Top Quiet Profile Header Bar */}
      <div className="flex items-center justify-between gap-2 pb-1">
        <Link
          to="/profile"
          className="flex items-center gap-3 min-w-0 min-h-[44px] pr-2 rounded-2xl hover:bg-surface-card/80 transition-colors group"
        >
          <div className="w-11 h-11 rounded-full bg-brand-light text-brand-deep dark:text-emerald-300 font-extrabold text-base flex items-center justify-center border border-emerald-200/80 dark:border-emerald-800/80 shrink-0">
            {profile ? displayName.charAt(0).toUpperCase() : <User className="w-5 h-5 text-brand-green" aria-hidden="true" />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-base sm:text-lg font-extrabold text-text-main tracking-tight truncate group-hover:text-brand-green transition-colors">
                {displayName}
              </h1>
              <ChevronRight className="w-4 h-4 text-text-subtle shrink-0" aria-hidden="true" />
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-brand-light text-brand-deep dark:text-emerald-300">
                {profile ? `Synced • ${levelTag}` : `Guest • ${levelTag}`}
              </span>
            </div>
          </div>
        </Link>

        {/* Right Icon Utilities: Support & Settings */}
        <div className="flex items-center gap-1 shrink-0">
          <Link
            to="/help"
            aria-label="Study Help and Support"
            title="Study Help"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-text-main hover:bg-surface-card transition-colors"
          >
            <HelpCircle className="w-5 h-5" aria-hidden="true" />
          </Link>
          <Link
            to="/settings"
            aria-label="Settings"
            title="Settings"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-text-main hover:bg-surface-card transition-colors"
          >
            <Settings className="w-5 h-5" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* Locker Snapshot Strip */}
      <div className="rounded-2xl bg-surface-card border border-border-light/70 p-4 flex items-center justify-between gap-3">
        <Link to="/dashboard" className="min-w-0 min-h-[44px] flex flex-col justify-center flex-1 group">
          <span className="text-xs text-text-muted block">Study Locker (This Browser)</span>
          <div className="flex items-center gap-3 mt-1 text-sm font-extrabold text-text-main">
            <span>{bookmarkCount} Saved</span>
            <span aria-hidden="true" className="text-text-subtle">•</span>
            <span>{downloadCount} Downloads</span>
          </div>
        </Link>
        {profile ? (
          <Link
            to="/dashboard"
            className="min-h-[44px] px-4 inline-flex items-center justify-center rounded-full bg-brand-light text-brand-deep dark:text-emerald-300 text-xs font-bold hover:bg-brand-green hover:text-white transition-colors shrink-0"
          >
            Open Locker
          </Link>
        ) : (
          <button
            type="button"
            onClick={onOpenAuth}
            className="min-h-[44px] px-4 rounded-full bg-brand-green hover:bg-brand-deep text-white text-xs font-bold transition-colors shrink-0 cursor-pointer"
          >
            Sign In
          </button>
        )}
      </div>

      {/* 3-Action Primary Student Shortcut Strip */}
      <div className="rounded-2xl bg-surface-card border border-border-light/70 p-2 grid grid-cols-3 gap-1">
        <Link
          to="/dashboard"
          className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 min-h-[76px] rounded-xl hover:bg-surface-bg/70 transition-colors text-center"
        >
          <span className="w-9 h-9 rounded-xl bg-brand-light text-brand-green flex items-center justify-center">
            <Bookmark className="w-4 h-4" aria-hidden="true" />
          </span>
          <span className="text-xs font-bold text-text-main">Study Locker</span>
        </Link>

        <Link
          to="/cgpa-calculator"
          className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 min-h-[76px] rounded-xl hover:bg-surface-bg/70 transition-colors text-center"
        >
          <span className="w-9 h-9 rounded-xl bg-brand-light text-brand-green flex items-center justify-center">
            <Calculator className="w-4 h-4" aria-hidden="true" />
          </span>
          <span className="text-xs font-bold text-text-main">CGPA Calc</span>
        </Link>

        <button
          type="button"
          onClick={onOpenSubmit}
          className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 min-h-[76px] rounded-xl hover:bg-surface-bg/70 transition-colors text-center cursor-pointer"
        >
          <span className="w-9 h-9 rounded-xl bg-brand-green text-white flex items-center justify-center">
            <PlusCircle className="w-4 h-4" aria-hidden="true" />
          </span>
          <span className="text-xs font-bold text-text-main">Submit File</span>
        </button>
      </div>

      {/* Group 1: Academic Library & Opportunities (1-Line Rows) */}
      <div className="rounded-2xl bg-surface-card border border-border-light/70 divide-y divide-border-light/50 overflow-hidden">
        <Link
          to="/resources"
          className="px-4 py-3.5 min-h-[52px] flex items-center justify-between gap-3 hover:bg-surface-bg/60 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <BookOpen className="w-4 h-4 text-brand-green shrink-0" aria-hidden="true" />
            <span className="text-sm font-semibold text-text-main truncate">Academic Resource Library</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-text-muted shrink-0">
            <span>Notes &amp; Past Questions</span>
            <ChevronRight className="w-4 h-4 text-text-subtle" aria-hidden="true" />
          </div>
        </Link>

        <Link
          to="/calendar"
          className="px-4 py-3.5 min-h-[52px] flex items-center justify-between gap-3 hover:bg-surface-bg/60 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <Calendar className="w-4 h-4 text-brand-green shrink-0" aria-hidden="true" />
            <span className="text-sm font-semibold text-text-main truncate">Academic Calendar</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-text-muted shrink-0">
            <span>CAs &amp; Exams</span>
            <ChevronRight className="w-4 h-4 text-text-subtle" aria-hidden="true" />
          </div>
        </Link>

        <Link
          to="/opportunities"
          className="px-4 py-3.5 min-h-[52px] flex items-center justify-between gap-3 hover:bg-surface-bg/60 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <Sparkles className="w-4 h-4 text-brand-green shrink-0" aria-hidden="true" />
            <span className="text-sm font-semibold text-text-main truncate">Opportunities &amp; Grants</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-text-muted shrink-0">
            <span>Scholarships</span>
            <ChevronRight className="w-4 h-4 text-text-subtle" aria-hidden="true" />
          </div>
        </Link>

        <Link
          to="/enterprise"
          className="px-4 py-3.5 min-h-[52px] flex items-center justify-between gap-3 hover:bg-surface-bg/60 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <Briefcase className="w-4 h-4 text-brand-green shrink-0" aria-hidden="true" />
            <span className="text-sm font-semibold text-text-main truncate">Student Enterprise Hub</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-text-muted shrink-0">
            <span>Campus Directory</span>
            <ChevronRight className="w-4 h-4 text-text-subtle" aria-hidden="true" />
          </div>
        </Link>
      </div>

      {/* Group 2: Department & Leadership */}
      <div className="rounded-2xl bg-surface-card border border-border-light/70 divide-y divide-border-light/50 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowStaffModal(true)}
          className="w-full px-4 py-3.5 min-h-[52px] flex items-center justify-between gap-3 hover:bg-surface-bg/60 transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-3 min-w-0">
            <GraduationCap className="w-4 h-4 text-brand-green shrink-0" aria-hidden="true" />
            <span className="text-sm font-semibold text-text-main truncate">Academic Staff &amp; Lecturers</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-text-muted shrink-0">
            <span>Office Hours</span>
            <ChevronRight className="w-4 h-4 text-text-subtle" aria-hidden="true" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => setShowExecModal(true)}
          className="w-full px-4 py-3.5 min-h-[52px] flex items-center justify-between gap-3 hover:bg-surface-bg/60 transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-3 min-w-0">
            <Award className="w-4 h-4 text-brand-green shrink-0" aria-hidden="true" />
            <span className="text-sm font-semibold text-text-main truncate">ASSON Executive Council</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-text-muted shrink-0">
            <span>2026/2027</span>
            <ChevronRight className="w-4 h-4 text-text-subtle" aria-hidden="true" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => setShowDeptModal(true)}
          className="w-full px-4 py-3.5 min-h-[52px] flex items-center justify-between gap-3 hover:bg-surface-bg/60 transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-3 min-w-0">
            <Building2 className="w-4 h-4 text-brand-green shrink-0" aria-hidden="true" />
            <span className="text-sm font-semibold text-text-main truncate">Department Information</span>
          </div>
          <ChevronRight className="w-4 h-4 text-text-subtle shrink-0" aria-hidden="true" />
        </button>
      </div>

      {/* Group 3: Profile & Settings Links */}
      <div className="rounded-2xl bg-surface-card border border-border-light/70 divide-y divide-border-light/50 overflow-hidden">
        <Link
          to="/profile"
          className="px-4 py-3.5 min-h-[52px] flex items-center justify-between gap-3 hover:bg-surface-bg/60 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <User className="w-4 h-4 text-brand-green shrink-0" aria-hidden="true" />
            <span className="text-sm font-semibold text-text-main truncate">Profile Info</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-text-muted shrink-0">
            <span>Name, Level &amp; Sync</span>
            <ChevronRight className="w-4 h-4 text-text-subtle" aria-hidden="true" />
          </div>
        </Link>

        <Link
          to="/settings"
          className="px-4 py-3.5 min-h-[52px] flex items-center justify-between gap-3 hover:bg-surface-bg/60 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <Settings className="w-4 h-4 text-brand-green shrink-0" aria-hidden="true" />
            <span className="text-sm font-semibold text-text-main truncate">Settings</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-text-muted shrink-0">
            <span>Themes, Level &amp; Cache</span>
            <ChevronRight className="w-4 h-4 text-text-subtle" aria-hidden="true" />
          </div>
        </Link>
      </div>

      {/* Department Info Modal (Shared Accessible Modal) */}
      <Modal
        isOpen={showDeptModal}
        onClose={() => setShowDeptModal(false)}
        title="Department of Statistics • UI"
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs text-text-muted">
          <div>
            <span className="font-bold text-text-main block">Location</span>
            <p className="mt-0.5">Faculty of Science, University of Ibadan, Ibadan, Oyo State, Nigeria.</p>
          </div>
          <div>
            <span className="font-bold text-text-main block">Official Association</span>
            <p className="mt-0.5">Association of Statistics Students of Nigeria (ASSON UI Chapter).</p>
          </div>
          <div>
            <span className="font-bold text-text-main block">Motto</span>
            <p className="mt-0.5 text-brand-green font-semibold">
              &ldquo;Together for Academic Excellence • Facts from Reliable Figures&rdquo;
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowDeptModal(false)}
            className="w-full min-h-[44px] py-2.5 rounded-xl bg-brand-green text-white font-bold text-xs hover:bg-brand-deep transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </Modal>

      {/* Staff Directory Modal */}
      <StaffDirectoryModal
        isOpen={showStaffModal}
        onClose={() => setShowStaffModal(false)}
      />

      {/* Executive Council Modal */}
      <ExecutiveCouncilModal
        isOpen={showExecModal}
        onClose={() => setShowExecModal(false)}
      />

      {/* Subtle Institutional Footer */}
      <div className="pt-2 text-center text-xs text-text-subtle font-medium">
        ASSON UI • Department of Statistics, University of Ibadan
      </div>
    </div>
  );
};
