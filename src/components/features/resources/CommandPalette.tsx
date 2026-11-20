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

  // Active keyboard navigation index
  const [selectedIndex, setSelectedIndex] = useState(0);

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

  // Matched Resources (Files)
  const matchedResources = useMemo(() => {
    if (!cleanQuery) return resources.slice(0, 3);
    return resources.filter((r) =>
      r.title.toLowerCase().includes(cleanQuery) ||
      r.courseCode.toLowerCase().includes(cleanQuery) ||
      r.type.toLowerCase().includes(cleanQuery) ||
      r.session.toLowerCase().includes(cleanQuery)
    ).slice(0, 4);
  }, [resources, cleanQuery]);

  // Matched Staff (Users)
  const matchedStaff = useMemo(() => {
    if (!cleanQuery) return (MOCK_STAFF as StaffMember[]).slice(0, 2);
    return (MOCK_STAFF as StaffMember[]).filter((s) =>
      s.name.toLowerCase().includes(cleanQuery) ||
      s.title.toLowerCase().includes(cleanQuery) ||
      s.designation.toLowerCase().includes(cleanQuery) ||
      s.courses.some((c) => c.toLowerCase().includes(cleanQuery))
    ).slice(0, 3);
  }, [cleanQuery]);

  // Matched Enterprises
  const matchedEnterprises = useMemo(() => {
    if (!cleanQuery) return [];
    return (MOCK_ENTERPRISES as EnterpriseListing[]).filter((e) =>
      e.businessName.toLowerCase().includes(cleanQuery) ||
      e.category.toLowerCase().includes(cleanQuery) ||
      e.description.toLowerCase().includes(cleanQuery)
    ).slice(0, 2);
  }, [cleanQuery]);

  // Flattened array for unified arrow key navigation
  type SearchResultItem = 
    | { kind: 'file'; item: AcademicResource }
    | { kind: 'staff'; item: StaffMember }
    | { kind: 'enterprise'; item: EnterpriseListing };

  const allResults = useMemo<SearchResultItem[]>(() => {
    const list: SearchResultItem[] = [];
    matchedResources.forEach((item) => list.push({ kind: 'file', item }));
    matchedStaff.forEach((item) => list.push({ kind: 'staff', item }));
    matchedEnterprises.forEach((item) => list.push({ kind: 'enterprise', item }));
    return list;
  }, [matchedResources, matchedStaff, matchedEnterprises]);

  // Handle Selection
  const handleSelectItem = (entry: SearchResultItem) => {
    if (entry.kind === 'file') {
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

      {/* Main Spotlight Search Modal (Matching Image Structure) */}
      <div className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-[#13171D] border border-zinc-200/90 dark:border-zinc-800 shadow-2xl overflow-hidden z-10 transition-all animate-in fade-in zoom-in-95 duration-150">
        {/* Top Search Input Bar (Matching Image: [Search Icon] [Input] [Return Key Icon]) */}
        <div className="p-4 pb-2">
          <div className="flex items-center px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 gap-3 focus-within:border-[#087A3E] focus-within:ring-2 focus-within:ring-[#087A3E]/10 transition-all">
            <Search className="w-4 h-4 text-zinc-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder="Minimalist - Search for courses, past questions, and more"
              className="w-full bg-transparent text-xs sm:text-sm font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] font-mono text-zinc-400 shadow-2xs font-semibold">
                ↵
              </kbd>
            )}
          </div>
        </div>

        {/* Scrollable Results Body */}
        <div className="max-h-[60vh] overflow-y-auto px-4 py-2 space-y-4 scrollbar-none">
          {/* SECTION 1: Recent Searches (Matching Image: "Recent Search" with Clock Icons) */}
          {!cleanQuery && recentSearches.length > 0 && (
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between px-2 pb-1">
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Recent Search
                </span>
                <button
                  type="button"
                  onClick={clearRecentSearches}
                  className="text-[10px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" /> Clear
                </button>
              </div>

              <div className="space-y-0.5">
                {recentSearches.map((term, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setQuery(term);
                    }}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#087A3E] transition-colors" />
                      <span className="font-medium">{term}</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => removeRecentItem(term, e)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 text-zinc-400 hover:text-zinc-600 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 2: Files / Academic Past Questions (Matching Image: "── File ──") */}
          {matchedResources.length > 0 && (
            <div>
              {/* Centered Section Divider (Key Visual Feature from Image) */}
              <div className="relative my-3 flex items-center justify-center">
                <div className="border-t border-zinc-100 dark:border-zinc-800 w-full" />
                <span className="bg-white dark:bg-[#13171D] px-3 text-[10px] uppercase font-bold tracking-widest text-zinc-400 absolute">
                  File
                </span>
              </div>

              <div className="space-y-1">
                {matchedResources.map((res, index) => {
                  const globalIdx = index;
                  const isSelected = selectedIndex === globalIdx;

                  return (
                    <div
                      key={res.id}
                      onClick={() => handleSelectItem({ kind: 'file', item: res })}
                      className={`flex items-center justify-between p-2.5 rounded-2xl transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-zinc-100/90 dark:bg-zinc-800/80 ring-1 ring-[#087A3E]/30'
                          : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        {/* File Icon Container */}
                        <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 shrink-0">
                          <FileText className="w-4 h-4 text-[#087A3E]" />
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                            {res.title}
                          </p>
                          {/* Tags matching "# product-design # ui-design" from Image */}
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            <span className="text-[10px] text-zinc-400 font-medium">
                              #{res.courseCode}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-medium">
                              #{res.type.replace(/\s+/g, '-')}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-medium">
                              #{res.session}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Meta Stack (Matching Image Stack) */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-mono text-zinc-400 hidden sm:inline">
                          {res.level}L
                        </span>
                        <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[#087A3E] flex items-center justify-center font-bold text-[10px]">
                          ✓
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 3: Staff & Lecturers (Matching Image: "── User ──") */}
          {matchedStaff.length > 0 && (
            <div>
              {/* Centered Section Divider (Key Visual Feature from Image) */}
              <div className="relative my-3 flex items-center justify-center">
                <div className="border-t border-zinc-100 dark:border-zinc-800 w-full" />
                <span className="bg-white dark:bg-[#13171D] px-3 text-[10px] uppercase font-bold tracking-widest text-zinc-400 absolute">
                  User
                </span>
              </div>

              <div className="space-y-1">
                {matchedStaff.map((staff, index) => {
                  const globalIdx = matchedResources.length + index;
                  const isSelected = selectedIndex === globalIdx;

                  return (
                    <div
                      key={staff.id}
                      onClick={() => handleSelectItem({ kind: 'staff', item: staff })}
                      className={`flex items-center justify-between p-2.5 rounded-2xl transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-zinc-100/90 dark:bg-zinc-800/80 ring-1 ring-[#087A3E]/30'
                          : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        {/* Circular Avatar / Badge */}
                        <div className="w-8 h-8 rounded-full bg-[#087A3E]/10 text-[#087A3E] font-bold text-xs flex items-center justify-center shrink-0">
                          {staff.name.charAt(0)}
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                            {staff.title} {staff.name}
                          </p>
                          <p className="text-[10px] text-zinc-400 truncate">
                            @{staff.designation.replace(/\s+/g, '_').toLowerCase()}
                          </p>
                        </div>
                      </div>

                      {/* Right Location/Office (Matching Image: "Bangkok, Thailand") */}
                      <div className="flex items-center gap-1 text-[11px] text-zinc-400 shrink-0">
                        <MapPin className="w-3 h-3 text-zinc-400" />
                        <span className="hidden sm:inline truncate max-w-[140px]">
                          {staff.office}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 4: Enterprise Hub (Student Freelance & Business) */}
          {matchedEnterprises.length > 0 && (
            <div>
              <div className="relative my-3 flex items-center justify-center">
                <div className="border-t border-zinc-100 dark:border-zinc-800 w-full" />
                <span className="bg-white dark:bg-[#13171D] px-3 text-[10px] uppercase font-bold tracking-widest text-zinc-400 absolute">
                  Enterprise
                </span>
              </div>

              <div className="space-y-1">
                {matchedEnterprises.map((item, index) => {
                  const globalIdx = matchedResources.length + matchedStaff.length + index;
                  const isSelected = selectedIndex === globalIdx;

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectItem({ kind: 'enterprise', item })}
                      className={`flex items-center justify-between p-2.5 rounded-2xl transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-zinc-100/90 dark:bg-zinc-800/80 ring-1 ring-[#087A3E]/30'
                          : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div className="w-8 h-8 rounded-xl bg-[#087A3E]/10 text-[#087A3E] flex items-center justify-center shrink-0">
                          <Store className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                            {item.businessName}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-zinc-400 font-medium">
                              #{item.category.replace(/\s+/g, '-')}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-medium">
                              #{item.ownerLevel}L
                            </span>
                          </div>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono font-semibold text-[#087A3E] bg-[#087A3E]/10 px-2 py-0.5 rounded-md shrink-0">
                        WhatsApp
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty State */}
          {cleanQuery && allResults.length === 0 && (
            <div className="py-10 text-center text-zinc-400">
              <Search className="w-6 h-6 mx-auto mb-2 opacity-40 text-zinc-400" />
              <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">
                No matching materials or records
              </p>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Try searching for a course code like &ldquo;STA 211&rdquo; or lecturer name.
              </p>
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* FOOTER: HOTKEYS & CONTROLS (Matching Image Bottom Bar)         */}
        {/* "Enter Select"    "↑ ↓ Move"    "Esc Exit"                    */}
        {/* ------------------------------------------------------------- */}
        <div className="px-4 py-3 bg-zinc-50/70 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800/80 text-[11px] text-zinc-500 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] font-mono shadow-2xs font-semibold text-zinc-700 dark:text-zinc-300">
                Enter
              </kbd>
              <span className="font-medium">Select</span>
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] font-mono shadow-2xs font-semibold text-zinc-700 dark:text-zinc-300">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] font-mono shadow-2xs font-semibold text-zinc-700 dark:text-zinc-300">
                ↓
              </kbd>
              <span className="font-medium">Move</span>
            </span>
          </div>

          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] font-mono shadow-2xs font-semibold text-zinc-700 dark:text-zinc-300">
              Esc
            </kbd>
            <span className="font-medium">Exit</span>
          </span>
        </div>
      </div>
    </div>
  );
};
