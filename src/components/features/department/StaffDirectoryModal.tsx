import React, { useState, useEffect } from 'react';
import { StaffMember, AcademicLevel } from '../../../types';
import { fetchStaffMembers } from '../../../lib/supabase';
import { 
  Building2, 
  Mail, 
  MapPin, 
  Clock, 
  BookOpen, 
  X, 
  Award,
  Search,
  UserCheck
} from 'lucide-react';

interface StaffDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StaffDirectoryModal: React.FC<StaffDirectoryModalProps> = ({ isOpen, onClose }) => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [selectedAdviser, setSelectedAdviser] = useState<AcademicLevel | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      fetchStaffMembers().then((data) => {
        setStaff(data);
        setIsLoading(false);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredStaff = staff.filter((s) => {
    if (selectedAdviser !== 'All' && s.advisorLevel !== selectedAdviser) {
      return false;
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      const matchName = s.name.toLowerCase().includes(q);
      const matchDesignation = s.designation.toLowerCase().includes(q);
      const matchOffice = s.office?.toLowerCase().includes(q);
      const matchCourses = s.courses.some((c) => c.toLowerCase().includes(q));
      if (!matchName && !matchDesignation && !matchCourses && !matchOffice) return false;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-4xl max-h-[90vh] rounded-3xl bg-surface-card border border-border-light shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border-light/70 flex items-center justify-between gap-3 shrink-0 bg-surface-card">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-brand-green flex items-center justify-center shrink-0 border border-emerald-200/70 dark:border-emerald-800/70">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-text-main truncate">
                Academic Staff & Lecturers
              </h2>
              <p className="text-xs text-text-muted truncate">
                Department of Statistics • Faculty of Science, University of Ibadan
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-text-muted hover:text-text-main hover:bg-surface-bg transition-colors cursor-pointer shrink-0"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar & Level Filter Strip (Image 3 inspired) */}
        <div className="p-3.5 sm:p-5 border-b border-border-light/60 bg-surface-bg/40 space-y-3 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-brand-green absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search lecturer name, office room, or course (e.g. STA 111, STA 211)..."
              className="w-full h-11 rounded-2xl border border-border-light bg-surface-card pl-10 pr-4 text-xs sm:text-sm text-text-main placeholder:text-text-subtle focus:border-brand-green focus:outline-none shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
            <span className="text-[11px] font-bold text-text-muted mr-1 shrink-0">Directory Filter:</span>
            {(['All', '100', '200', '300', '400'] as const).map((lvl) => {
              const label = lvl === 'All' ? 'All Lecturers' : `${lvl}L Staff Adviser`;
              const isSelected = selectedAdviser === lvl;
              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSelectedAdviser(lvl)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-brand-green text-white shadow-2xs'
                      : 'bg-surface-card border border-border-light text-text-muted hover:text-text-main hover:bg-surface-bg'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2-Column Bento Photo Grid (Image 3 Inspired) */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-6">
          {isLoading ? (
            <div className="py-16 text-center text-xs text-text-muted">
              Loading faculty directory and lecturer profiles...
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="py-16 text-center bg-surface-bg/50 rounded-2xl border border-border-light p-6 space-y-2">
              <Building2 className="w-8 h-8 text-text-muted mx-auto opacity-50" />
              <p className="font-bold text-text-main text-xs sm:text-sm">No academic staff found</p>
              <p className="text-xs text-text-muted">Try adjusting your search terms or clearing the level filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {filteredStaff.map((member) => (
                <div
                  key={member.id}
                  className="group relative rounded-3xl overflow-hidden border border-border-light bg-surface-card hover:border-brand-green/60 hover:shadow-md transition-all flex flex-col"
                >
                  {/* Photo Canvas with Floating Pills Overlay (Image 3 Inspired) */}
                  <div className="relative w-full h-56 sm:h-64 bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    {member.imageUrl ? (
                      <img
                        src={member.imageUrl}
                        alt={member.name}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          // Fallback to silhouette if photo fails to load
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-emerald-50 to-emerald-100 dark:from-emerald-950/40 dark:to-zinc-900 text-brand-green p-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/80 dark:bg-zinc-800/80 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-xl font-extrabold shadow-xs">
                          {member.name.split(' ').slice(1, 3).map(n => n[0]).join('') || 'STA'}
                        </div>
                        <span className="text-[11px] font-bold text-brand-deep dark:text-emerald-300 mt-2">
                          Academic Faculty
                        </span>
                      </div>
                    )}

                    {/* Gradient Overlay for photo contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

                    {/* Top Badges (HOD / Adviser) */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {member.isHOD && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-amber-500/90 text-white backdrop-blur-md shadow-xs">
                            <Award className="w-3 h-3" /> Head of Department
                          </span>
                        )}
                        {member.advisorLevel && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-brand-green/90 text-white backdrop-blur-md shadow-xs">
                            <UserCheck className="w-3 h-3" /> {member.advisorLevel}L Staff Adviser
                          </span>
                        )}
                      </div>

                      {member.email && (
                        <a
                          href={`mailto:${member.email}`}
                          title={`Email ${member.name}`}
                          className="pointer-events-auto p-2 rounded-full bg-white/80 hover:bg-white text-brand-deep backdrop-blur-md shadow-xs transition-colors shrink-0"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>

                    {/* Floating Pill Overlay at Bottom of Photo (Image 3 Style) */}
                    <div className="absolute bottom-3 left-3 right-3 p-3 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-white/20 dark:border-zinc-700/60 shadow-lg">
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-white leading-tight truncate">
                        {member.name}
                      </h3>
                      <p className="text-xs font-medium text-brand-green mt-0.5 truncate">
                        {member.designation}
                      </p>
                      
                      <div className="flex items-center gap-2 mt-1.5 text-xs text-text-muted">
                        <span className="inline-flex items-center gap-1 truncate font-medium">
                          <MapPin className="w-3.5 h-3.5 text-brand-green shrink-0" aria-hidden="true" />
                          {member.office}
                        </span>
                        {member.consultationHours && (
                          <>
                            <span className="text-border-light" aria-hidden="true">•</span>
                            <span className="inline-flex items-center gap-1 truncate">
                              <Clock className="w-3.5 h-3.5 text-text-subtle shrink-0" aria-hidden="true" />
                              {member.consultationHours}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Details / Courses Taught */}
                  {member.courses && member.courses.length > 0 && (
                    <div className="p-3.5 pt-3 bg-surface-card border-t border-border-light/60 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-text-muted mr-1">Courses:</span>
                      {member.courses.map((courseCode) => (
                        <span
                          key={courseCode}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-surface-bg border border-border-light/80 text-brand-deep dark:text-emerald-300"
                        >
                          {courseCode}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-border-light/60 bg-surface-bg/30 text-center shrink-0">
          <p className="text-[11px] text-text-subtle font-medium">
            Academic Faculty Directory • Department of Statistics, University of Ibadan
          </p>
        </div>
      </div>
    </div>
  );
};
