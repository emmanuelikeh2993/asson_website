import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AcademicResource, Course, StaffMember, EnterpriseListing } from '../../../types';
import { MOCK_STAFF, MOCK_ENTERPRISES } from '../../../lib/mockData';
import { 
  Search, 
  Clock, 
  FileText, 
  User, 
  Store, 
  MapPin, 
  CornerDownLeft, 
  X, 
  ArrowRight,
  ExternalLink,
  Trash2
} from 'lucide-react';
import { useDebounce } from '../../../hooks/useDebounce';
import { normalizeSearchTerm } from '../../../lib/utils';

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
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 120);
  const inputRef = useRef<HTMLInputElement>(null);

  // Active keyboard navigation index & scope filter
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scope, setScope] = useState<'resources' | 'all' | 'people'>('resources');

  // Recent Searches persisted in localStorage
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('asson_recent_searches');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return ['STA 211', 'Past Questions 2023', 'Prof. O. E. Olubusoye'];
  });

  // Auto-focus on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Save search to recent searches
  const recordSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 5);
      try {
        localStorage.setItem('asson_recent_searches', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const clearRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    localStorage.removeItem('asson_recent_searches');
  };

  const removeRecentItem = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches((prev) => {
      const updated = prev.filter((s) => s !== term);
      localStorage.setItem('asson_recent_searches', JSON.stringify(updated));
      return updated;
    });
  };

  const cleanQuery = debouncedQuery.toLowerCase().trim();
  const normalizedQuery = normalizeSearchTerm(debouncedQuery);
  const matchesTerm = (value: string) => {
    if (value.toLowerCase().includes(cleanQuery)) return true;
    return normalizedQuery.length > 0 && normalizeSearchTerm(value).includes(normalizedQuery);
  };

  // Matched Courses
  const matchedCourses = useMemo(() => {
    if (scope === 'people' || !cleanQuery) return [];
    return courses
      .filter((c) => matchesTerm(c.code) || matchesTerm(c.title))
      .slice(0, 3);
  }, [courses, scope, cleanQuery, normalizedQuery]);

  // Matched Resources (Files)
  const matchedResources = useMemo(() => {
    if (scope === 'people') return [];
    if (!cleanQuery) return resources.slice(0, 3);
    return resources.filter((r) =>
      matchesTerm(r.title) ||
      matchesTerm(r.courseCode) ||
      matchesTerm(r.courseTitle) ||
      matchesTerm(r.type) ||
      matchesTerm(r.session)
    ).slice(0, 4);
  }, [resources, scope, cleanQuery, normalizedQuery]);

  // Matched Staff (Users)
  const matchedStaff = useMemo(() => {
    if (scope === 'resources') return [];
    if (!cleanQuery) return (MOCK_STAFF as StaffMember[]).slice(0, 2);
    return (MOCK_STAFF as StaffMember[]).filter((s) =>
      matchesTerm(s.name) ||
      matchesTerm(s.title) ||
      matchesTerm(s.designation) ||
      s.courses.some((c) => matchesTerm(c))
    ).slice(0, 3);
  }, [scope, cleanQuery, normalizedQuery]);

  // Matched Enterprises
  const matchedEnterprises = useMemo(() => {
    if (scope === 'resources' || !cleanQuery) return [];
    return (MOCK_ENTERPRISES as EnterpriseListing[]).filter((e) =>
      e.businessName.toLowerCase().includes(cleanQuery) ||
      e.category.toLowerCase().includes(cleanQuery) ||
      e.description.toLowerCase().includes(cleanQuery)
    ).slice(0, 2);
  }, [scope, cleanQuery]);

  // Flattened array for unified arrow key navigation
  type SearchResultItem =
    | { kind: 'course'; item: Course }
    | { kind: 'file'; item: AcademicResource }
    | { kind: 'staff'; item: StaffMember }
    | { kind: 'enterprise'; item: EnterpriseListing };

  const allResults = useMemo<SearchResultItem[]>(() => {
    const list: SearchResultItem[] = [];
    matchedCourses.forEach((item) => list.push({ kind: 'course', item }));
    matchedResources.forEach((item) => list.push({ kind: 'file', item }));
    matchedStaff.forEach((item) => list.push({ kind: 'staff', item }));
    matchedEnterprises.forEach((item) => list.push({ kind: 'enterprise', item }));
    return list;
  }, [matchedCourses, matchedResources, matchedStaff, matchedEnterprises]);

  // Handle Selection
  const handleSelectItem = (entry: SearchResultItem) => {
    if (entry.kind === 'course') {
      recordSearch(entry.item.code);
      onSelectCourse(entry.item.code);
    } else if (entry.kind === 'file') {
      recordSearch(entry.item.courseCode);
      onSelectResource(entry.item);
    } else if (entry.kind === 'staff') {
      recordSearch(entry.item.name);
      navigate('/more');
    } else if (entry.kind === 'enterprise') {
      recordSearch(entry.item.businessName);
      navigate('/enterprise');
    }
    onClose();
  };

  // Keyboard Navigation: Up, Down, Enter, Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (allResults.length > 0 ? (prev + 1) % allResults.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (allResults.length > 0 ? (prev - 1 + allResults.length) % allResults.length : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (allResults.length > 0 && allResults[selectedIndex]) {
          handleSelectItem(allResults[selectedIndex]);
        } else if (query.trim()) {
          recordSearch(query.trim());
          navigate(`/resources?search=${encodeURIComponent(query.trim())}`);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, allResults, selectedIndex, query, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 p-3 sm:p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Main Spotlight Search Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Global resource search"
        className="relative w-full max-w-xl rounded-3xl bg-surface-card border border-border-light shadow-2xl overflow-hidden z-10 transition-all animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Top Search Input Bar */}
        <div className="p-4 pb-2">
          <div className="flex items-center px-4 py-2.5 rounded-2xl bg-surface-bg border border-border-light gap-3 focus-within:border-brand-green focus-within:ring-2 focus-within:ring-brand-green/25 transition-all">
            <Search className="w-4 h-4 text-text-subtle shrink-0" aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              aria-label="Search courses, past questions, staff, or student enterprises"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder="Search for courses, past questions, and more..."
              className="w-full bg-transparent text-base font-medium text-text-main placeholder:text-text-subtle focus:outline-none focus-visible:ring-0"
            />
            {query ? (
              <button
                type="button"
                aria-label="Clear search query"
                onClick={() => setQuery('')}
                className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-text-muted hover:text-text-main cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded bg-surface-card border border-border-light text-xs font-mono text-text-muted shadow-2xs font-semibold">
                ↵
              </kbd>
            )}
          </div>

          {/* Search Scope Tabs & Live Count */}
          <div className="flex items-center justify-between gap-2 pt-2.5 px-1 flex-wrap">
            <div className="inline-flex items-center gap-1 rounded-xl bg-surface-bg p-1 border border-border-light text-xs">
              {(
                [
                  { id: 'resources', label: 'Materials & Courses' },
                  { id: 'people', label: 'People & Hub' },
                  { id: 'all', label: 'All' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  aria-pressed={scope === tab.id}
                  onClick={() => {
                    setScope(tab.id);
                    setSelectedIndex(0);
                  }}
                  className={`px-2.5 py-1 min-h-[36px] rounded-lg font-semibold transition-colors cursor-pointer ${
                    scope === tab.id
                      ? 'bg-brand-green text-white shadow-2xs'
                      : 'text-text-muted hover:text-text-main'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <span className="text-xs text-text-muted font-mono" aria-live="polite">
              {cleanQuery ? `${allResults.length} result${allResults.length === 1 ? '' : 's'}` : 'Quick jump'}
            </span>
          </div>
        </div>

        {/* Scrollable Results Body */}
        <div className="max-h-[60vh] overflow-y-auto px-4 py-2 space-y-4 scrollbar-none">
          {/* SECTION 1: Recent Searches */}
          {!cleanQuery && recentSearches.length > 0 && (
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between px-2 pb-1">
                <span className="text-xs font-semibold text-text-subtle uppercase tracking-wider">
                  Recent Search
                </span>
                <button
                  type="button"
                  onClick={clearRecentSearches}
                  className="text-xs text-text-muted hover:text-text-main flex items-center gap-1 min-h-[36px] px-2 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" /> Clear
                </button>
              </div>

              <div className="space-y-0.5">
                {recentSearches.map((term, idx) => (
                  <div
                    key={idx}
                    className="relative flex items-center justify-between px-3 py-1 rounded-xl text-xs text-text-muted hover:bg-surface-bg hover:text-text-main transition-colors group"
                  >
                    <button
                      type="button"
                      onClick={() => setQuery(term)}
                      className="flex items-center gap-2.5 min-h-[44px] flex-1 text-left cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5 text-text-subtle group-hover:text-brand-green transition-colors" aria-hidden="true" />
                      <span className="font-medium">{term}</span>
                    </button>
                    <button
                      type="button"
                      aria-label={`Remove ${term} from recent searches`}
                      onClick={(e) => removeRecentItem(term, e)}
                      className="min-w-[36px] min-h-[36px] flex items-center justify-center text-text-subtle hover:text-text-main transition-opacity cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 1.5: Courses */}
          {matchedCourses.length > 0 && (
            <div>
              <div className="relative my-3 flex items-center justify-center">
                <div className="border-t border-border-light w-full" />
                <span className="bg-surface-card px-3 text-xs uppercase font-bold tracking-widest text-text-subtle absolute">
                  Courses
                </span>
              </div>

              <div className="space-y-1">
                {matchedCourses.map((course, index) => {
                  const globalIdx = index;
                  const isSelected = selectedIndex === globalIdx;
                  return (
                    <button
                      key={course.code}
                      type="button"
                      onClick={() => handleSelectItem({ kind: 'course', item: course })}
                      className={`w-full text-left flex items-center justify-between p-2.5 min-h-[44px] rounded-2xl transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-surface-bg ring-1 ring-brand-green/40'
                          : 'hover:bg-surface-bg/70'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs sm:text-sm font-bold text-text-main truncate">
                          {course.code} — {course.title}
                        </p>
                        <span className="text-xs text-text-subtle">
                          {course.level}L • Sem {course.semester} • {course.units} Units
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-brand-green shrink-0" aria-hidden="true" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 2: Files / Academic Past Questions */}
          {matchedResources.length > 0 && (
            <div>
              <div className="relative my-3 flex items-center justify-center">
                <div className="border-t border-border-light w-full" />
                <span className="bg-surface-card px-3 text-xs uppercase font-bold tracking-widest text-text-subtle absolute">
                  Materials
                </span>
              </div>

              <div className="space-y-1">
                {matchedResources.map((res, index) => {
                  const globalIdx = matchedCourses.length + index;
                  const isSelected = selectedIndex === globalIdx;

                  return (
                    <button
                      key={res.id}
                      type="button"
                      onClick={() => handleSelectItem({ kind: 'file', item: res })}
                      className={`w-full text-left flex items-center justify-between p-2.5 min-h-[44px] rounded-2xl transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-surface-bg ring-1 ring-brand-green/40'
                          : 'hover:bg-surface-bg/70'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div className="w-8 h-8 rounded-xl bg-surface-bg border border-border-light flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4 text-brand-green" aria-hidden="true" />
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-semibold text-text-main truncate">
                            {res.title}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            <span className="text-xs text-text-subtle font-medium">
                              #{res.courseCode}
                            </span>
                            <span className="text-xs text-text-subtle font-medium">
                              #{res.type.replace(/\s+/g, '-')}
                            </span>
                            <span className="text-xs text-text-subtle font-medium">
                              #{res.session}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-mono text-text-subtle hidden sm:inline">
                          {res.level}L
                        </span>
                        <div className="w-5 h-5 rounded-full bg-brand-light text-brand-green flex items-center justify-center font-bold text-xs" aria-hidden="true">
                          ✓
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 3: Staff & Lecturers */}
          {matchedStaff.length > 0 && (
            <div>
              <div className="relative my-3 flex items-center justify-center">
                <div className="border-t border-border-light w-full" />
                <span className="bg-surface-card px-3 text-xs uppercase font-bold tracking-widest text-text-subtle absolute">
                  Staff
                </span>
              </div>

              <div className="space-y-1">
                {matchedStaff.map((staff, index) => {
                  const globalIdx = matchedCourses.length + matchedResources.length + index;
                  const isSelected = selectedIndex === globalIdx;

                  return (
                    <button
                      key={staff.id}
                      type="button"
                      onClick={() => handleSelectItem({ kind: 'staff', item: staff })}
                      className={`w-full text-left flex items-center justify-between p-2.5 min-h-[44px] rounded-2xl transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-surface-bg ring-1 ring-brand-green/40'
                          : 'hover:bg-surface-bg/70'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div className="w-8 h-8 rounded-full bg-brand-light text-brand-green font-bold text-xs flex items-center justify-center shrink-0">
                          {staff.name.charAt(0)}
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-semibold text-text-main truncate">
                            {staff.title} {staff.name}
                          </p>
                          <p className="text-xs text-text-subtle truncate">
                            {staff.designation}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-text-subtle shrink-0">
                        <MapPin className="w-3.5 h-3.5 text-text-subtle" aria-hidden="true" />
                        <span className="hidden sm:inline truncate max-w-[140px]">
                          {staff.office}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 4: Enterprise Hub */}
          {matchedEnterprises.length > 0 && (
            <div>
              <div className="relative my-3 flex items-center justify-center">
                <div className="border-t border-border-light w-full" />
                <span className="bg-surface-card px-3 text-xs uppercase font-bold tracking-widest text-text-subtle absolute">
                  Enterprise
                </span>
              </div>

              <div className="space-y-1">
                {matchedEnterprises.map((item, index) => {
                  const globalIdx = matchedCourses.length + matchedResources.length + matchedStaff.length + index;
                  const isSelected = selectedIndex === globalIdx;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectItem({ kind: 'enterprise', item })}
                      className={`w-full text-left flex items-center justify-between p-2.5 min-h-[44px] rounded-2xl transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-surface-bg ring-1 ring-brand-green/40'
                          : 'hover:bg-surface-bg/70'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div className="w-8 h-8 rounded-xl bg-brand-light text-brand-green flex items-center justify-center shrink-0">
                          <Store className="w-4 h-4" aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-semibold text-text-main truncate">
                            {item.businessName}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-xs text-text-subtle font-medium">
                              #{item.category.replace(/\s+/g, '-')}
                            </span>
                            <span className="text-xs text-text-subtle font-medium">
                              #{item.ownerLevel}L
                            </span>
                          </div>
                        </div>
                      </div>

                      <span className="text-xs font-mono font-semibold text-brand-deep dark:text-emerald-300 bg-brand-light px-2 py-0.5 rounded-md shrink-0">
                        WhatsApp
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty State */}
          {cleanQuery && allResults.length === 0 && (
            <div className="py-10 text-center text-text-subtle">
              <Search className="w-6 h-6 mx-auto mb-2 opacity-60 text-text-subtle" aria-hidden="true" />
              <p className="text-sm font-semibold text-text-main">
                No matching materials or records
              </p>
              <p className="text-xs text-text-muted mt-0.5">
                Try searching for a course code like &ldquo;STA 211&rdquo; or lecturer name.
              </p>
            </div>
          )}
        </div>

        {/* Footer hotkeys */}
        <div className="px-4 py-3 bg-surface-bg border-t border-border-light text-xs text-text-muted flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-surface-card border border-border-light text-xs font-mono shadow-2xs font-semibold text-text-main">
                Enter
              </kbd>
              <span className="font-medium">Select</span>
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-surface-card border border-border-light text-xs font-mono shadow-2xs font-semibold text-text-main">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-surface-card border border-border-light text-xs font-mono shadow-2xs font-semibold text-text-main">
                ↓
              </kbd>
              <span className="font-medium">Move</span>
            </span>
          </div>

          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-surface-card border border-border-light text-xs font-mono shadow-2xs font-semibold text-text-main">
              Esc
            </kbd>
            <span className="font-medium">Exit</span>
          </span>
        </div>
      </div>
    </div>
  );
};
