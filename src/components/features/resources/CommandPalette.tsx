import React, { useState, useEffect } from 'react';
import { AcademicResource, Course } from '../../../types';
import { Search, FileText, ArrowRight, X, BookOpen } from 'lucide-react';
import { Badge } from '../../ui/Badge';
import { formatFileSize } from '../../../lib/utils';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  resources: AcademicResource[];
  courses: Course[];
  onSelectResource: (resource: AcademicResource) => void;
  onSelectCourse: (courseCode: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  resources,
  courses,
  onSelectResource,
  onSelectCourse,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // toggle handled by parent
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const cleanQuery = query.toLowerCase().trim();

  // Filter matched resources
  const matchedResources = cleanQuery === '' 
    ? resources.slice(0, 5) 
    : resources.filter(r => 
        r.courseCode.toLowerCase().includes(cleanQuery) ||
        r.title.toLowerCase().includes(cleanQuery) ||
        r.courseTitle.toLowerCase().includes(cleanQuery) ||
        r.type.toLowerCase().includes(cleanQuery)
      ).slice(0, 6);

  // Filter matched courses
  const matchedCourses = cleanQuery === ''
    ? courses.slice(0, 4)
    : courses.filter(c => 
        c.code.toLowerCase().includes(cleanQuery) ||
        c.title.toLowerCase().includes(cleanQuery)
      ).slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Palette Container (inspired by Image 21) */}
      <div className="relative w-full max-w-2xl rounded-2xl bg-surface-card shadow-2xl border border-border-light overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Search Bar Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-border-light gap-3 bg-surface-card">
          <Search className="w-5 h-5 text-brand-green shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses (e.g. STA 211), past questions, lecture notes..."
            className="w-full bg-transparent text-sm text-text-main placeholder:text-text-subtle focus:outline-none"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="text-xs text-text-muted hover:text-text-main p-1"
            >
              Clear
            </button>
          )}
          <span className="text-[10px] font-semibold bg-surface-bg border border-border-light text-text-muted px-1.5 py-0.5 rounded">
            ESC
          </span>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-3 divide-y divide-border-light/40">
          {/* Quick Courses Section */}
          {matchedCourses.length > 0 && (
            <div className="pb-3">
              <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider px-2 py-1 block">
                Courses
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-1">
                {matchedCourses.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => {
                      onSelectCourse(c.code);
                      onClose();
                    }}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-emerald-50 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="course">{c.code}</Badge>
                      <span className="text-xs font-medium text-text-main truncate max-w-[160px]">
                        {c.title}
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-brand-green group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Academic Materials Section */}
          <div className="pt-2">
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider px-2 py-1 block">
              Academic Resources ({matchedResources.length})
            </span>
            {matchedResources.length === 0 ? (
              <div className="py-8 text-center text-xs text-text-muted">
                No matching materials found for "{query}".
              </div>
            ) : (
              <div className="space-y-1 mt-1">
                {matchedResources.map((res) => (
                  <button
                    key={res.id}
                    onClick={() => {
                      onSelectResource(res);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-emerald-50/70 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div className="w-8 h-8 rounded-lg bg-surface-bg border border-border-light flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-brand-green" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-text-main group-hover:text-brand-green transition-colors truncate">
                            {res.title}
                          </span>
                          <Badge variant={res.verificationStatus === 'Verified' ? 'verified' : 'needs-review'}>
                            {res.verificationStatus}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-text-muted truncate">
                          {res.courseCode} • {res.session} • {formatFileSize(res.fileSizeBytes)}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-brand-green opacity-0 group-hover:opacity-100 transition-opacity shrink-0 flex items-center gap-1">
                      View <ArrowRight className="w-3 h-3" />
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-surface-bg border-t border-border-light text-[11px] text-text-muted flex items-center justify-between">
          <span>Navigate with arrow keys • Enter to select</span>
          <span className="font-medium text-brand-deep">ASSON UI Academic Search</span>
        </div>
      </div>
    </div>
  );
};

