import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, User, ShieldCheck } from 'lucide-react';
import { getCachedStudentProfile } from '../lib/supabase';
import { getDefaultLevelPreference } from '../lib/preferences';
import { UserProfile } from '../types';

interface ProfilePageProps {
  onOpenAuth: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onOpenAuth }) => {
  const [profile, setProfile] = useState<UserProfile | null>(() => getCachedStudentProfile());
  const defaultLevel = getDefaultLevelPreference();

  useEffect(() => {
    setProfile(getCachedStudentProfile());
  }, []);

  const displayName = profile?.displayName || 'Guest Statistics Scholar';
  const activeLevel = profile?.level
    ? `${profile.level} Level`
    : defaultLevel === 'All'
    ? 'All Levels'
    : `${defaultLevel} Level`;

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-5 sm:py-8 space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-2 pb-1">
        <Link
          to="/more"
          aria-label="Back to Menu"
          className="min-w-[44px] min-h-[44px] -ml-2 flex items-center justify-center rounded-xl text-text-main hover:bg-surface-card transition-colors"
        >
          <ChevronLeft className="w-5 h-5" aria-hidden="true" />
        </Link>
        <h1 className="text-lg sm:text-xl font-extrabold text-text-main tracking-tight">
          My Profile
        </h1>
      </div>

      {/* Sync Prompt Banner (Guest mode only) */}
      {!profile && (
        <div className="rounded-2xl bg-surface-card border border-border-light/70 p-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-bold text-text-main">
              Sync Your Study Locker
            </p>
            <p className="text-xs text-text-muted mt-0.5">
              Sign in optionally to save bookmarks and contributions across devices.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenAuth}
            className="min-h-[44px] px-4 rounded-full bg-brand-green hover:bg-brand-deep text-white text-xs font-bold transition-colors shrink-0 cursor-pointer"
          >
            Sign In
          </button>
        </div>
      )}

      {/* Identity Overview Card */}
      <div className="rounded-2xl bg-surface-card border border-border-light/70 divide-y divide-border-light/50 overflow-hidden">
        <div className="py-6 px-4 flex flex-col items-center text-center gap-2.5">
          <div className="w-16 h-16 rounded-full bg-brand-light text-brand-deep dark:text-emerald-300 font-extrabold text-2xl flex items-center justify-center border border-emerald-200/80 dark:border-emerald-800/80">
            {profile ? displayName.charAt(0).toUpperCase() : <User className="w-7 h-7 text-brand-green" aria-hidden="true" />}
          </div>
          <div>
            <p className="text-base font-extrabold text-text-main">{displayName}</p>
            <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-light text-brand-deep dark:text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              {profile ? 'Synced Account' : 'Local Guest Mode'}
            </span>
          </div>
        </div>

        <div className="px-4 py-3.5 flex items-center justify-between gap-4 text-sm">
          <span className="text-text-muted">Department</span>
          <span className="font-semibold text-text-main text-right">
            {profile?.department || 'Department of Statistics, UI'}
          </span>
        </div>

        <Link
          to="/settings?panel=level"
          className="px-4 py-3.5 min-h-[52px] flex items-center justify-between gap-4 text-sm hover:bg-surface-bg/60 transition-colors"
        >
          <span className="text-text-muted">Study Level Focus</span>
          <span className="inline-flex items-center gap-1 font-semibold text-text-main">
            {activeLevel}
            <ChevronRight className="w-4 h-4 text-text-subtle" aria-hidden="true" />
          </span>
        </Link>
      </div>

      {/* Details Card */}
      <div className="rounded-2xl bg-surface-card border border-border-light/70 divide-y divide-border-light/50 overflow-hidden text-sm">
        <div className="px-4 py-3.5 flex items-center justify-between gap-4">
          <span className="text-text-muted">Email</span>
          <span className="font-semibold text-text-main truncate">
            {profile?.email || 'Not linked'}
          </span>
        </div>

        <div className="px-4 py-3.5 flex items-center justify-between gap-4">
          <span className="text-text-muted">Data Storage</span>
          <span className="font-semibold text-text-main">
            {profile ? 'Cloud + Browser' : 'This Browser Only'}
          </span>
        </div>

        <Link
          to="/dashboard"
          className="px-4 py-3.5 min-h-[52px] flex items-center justify-between gap-4 hover:bg-surface-bg/60 transition-colors"
        >
          <span className="text-text-muted">Bookmarks &amp; Downloads</span>
          <span className="inline-flex items-center gap-1 font-semibold text-brand-green">
            Open Study Locker
            <ChevronRight className="w-4 h-4 text-text-subtle" aria-hidden="true" />
          </span>
        </Link>
      </div>
    </div>
  );
};
