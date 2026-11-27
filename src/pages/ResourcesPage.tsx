import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MOCK_RESOURCES, COURSES } from '../lib/mockData';
import { fetchResources, fetchCourses, submitContentReport } from '../lib/supabase';
import { AcademicResource, AcademicLevel, ResourceType, VerificationStatus, Course } from '../types';
import { DownloadCard } from '../components/features/resources/DownloadCard';
import { DocumentPreviewModal } from '../components/features/resources/DocumentPreviewModal';
import { ResourceFilters } from '../components/features/resources/ResourceFilters';
import { ReportIssueModal } from '../components/features/resources/ReportIssueModal';
import { Button } from '../components/ui/Button';
import { useDebounce } from '../hooks/useDebounce';
import { ResourceCardSkeleton } from '../components/ui/Skeleton';
import {
  Search,
  BookOpen,
  FilterX,
  PlusCircle,
  X,
  List,
  Grid,
  Layers,
  FileText,
  Download,
  Eye,
  Flag,
  CheckCircle2,
  FolderOpen,
  ArrowUpRight
} from 'lucide-react';
import { useToast } from '../components/ui/Toast';
import { formatFileSize, normalizeSearchTerm } from '../lib/utils';
import { triggerResourceDownload } from '../lib/download';
import { trackEvent } from '../lib/telemetry';

interface ResourcesPageProps {
  initialType?: ResourceType | 'All';
  title?: string;
  subtitle?: string;
  onOpenSubmit: () => void;
}

type ViewMode = 'list' | 'grouped' | 'grid';

const VALID_LEVELS = new Set<string>(['100', '200', '300', '400', 'All']);

const getSavedDefaultLevel = (): AcademicLevel | 'All' => {
  try {
    const saved = localStorage.getItem('asson_default_level');
    if (saved && VALID_LEVELS.has(saved)) {
      return saved as AcademicLevel | 'All';
    }
  } catch {
    // ignore storage errors
  }
  return 'All';
};

export const ResourcesPage: React.FC<ResourcesPageProps> = ({
  initialType = 'All',
  title = "Academic Resource Library",
  subtitle = "Verified lecture notes, syllabi, past examination questions, and tutorial materials for the Department of Statistics.",
  onOpenSubmit,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const levelParam = searchParams.get('level') as AcademicLevel | null;
  const courseParam = searchParams.get('course');
  const queryParam = searchParams.get('q') || '';
  const viewParam = searchParams.get('view') as ViewMode | null;
  const idParam = searchParams.get('id');

  const [resources, setResources] = useState<AcademicResource[]>(MOCK_RESOURCES);
  const [courses, setCourses] = useState<Course[]>(COURSES);
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const debouncedSearch = useDebounce(searchQuery, 250);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<AcademicLevel | 'All'>(() => {
    if (levelParam && VALID_LEVELS.has(levelParam)) return levelParam;
    return getSavedDefaultLevel();
  });
  const [selectedType, setSelectedType] = useState<ResourceType | 'All'>(initialType);
  const [selectedVerification, setSelectedVerification] = useState<VerificationStatus | 'All'>('All');
  const [selectedCourse, setSelectedCourse] = useState<string | 'All'>(courseParam || 'All');
  const [viewMode, setViewMode] = useState<ViewMode>(
    viewParam === 'list' || viewParam === 'grouped' || viewParam === 'grid' ? viewParam : 'list'
  );

  const [selectedResource, setSelectedResource] = useState<AcademicResource | null>(null);
  const [isDrivePreviewOpen, setIsDrivePreviewOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<AcademicResource | null>(null);
  const [visibleLimit, setVisibleLimit] = useState(40);
  const toast = useToast();

  const handleOpenPreview = (res: AcademicResource) => {
    setSelectedResource(res);
    setIsDrivePreviewOpen(true);
  };

  const handleDownload = (e: React.MouseEvent, res: AcademicResource) => {
    e.stopPropagation();
    triggerResourceDownload(res, (t, message) => {
      toast.success(t, message);
    });
  };

  useEffect(() => {
    setIsLoading(true);
    fetchResources()
      .then((data) => {
        if (data && data.length > 0) {
          setResources(data);
          if (idParam) {
            const match = data.find((r) => r.id === idParam);
            if (match) {
              setSelectedResource(match);
              setIsDrivePreviewOpen(true);
            }
          }
        }
      })
      .finally(() => {
        setIsLoading(false);
      });

    fetchCourses().then((data) => {
      if (data && data.length > 0) {
        setCourses(data);
      }
    });
  }, [idParam]);

  useEffect(() => {
    if (levelParam && VALID_LEVELS.has(levelParam)) setSelectedLevel(levelParam);
    if (courseParam) setSelectedCourse(courseParam);
  }, [levelParam, courseParam]);

  useEffect(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (debouncedSearch.trim()) {
          next.set('q', debouncedSearch.trim());
        } else {
          next.delete('q');
        }
        if (viewMode !== 'list') {
          next.set('view', viewMode);
        } else {
          next.delete('view');
        }
        return next;
      },
      { replace: true }
    );
  }, [debouncedSearch, viewMode, setSearchParams]);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedLevel !== 'All') count++;
    if (selectedType !== initialType) count++;
    if (selectedVerification !== 'All') count++;
    if (selectedCourse !== 'All') count++;
    if (debouncedSearch.trim() !== '') count++;
    return count;
  }, [selectedLevel, selectedType, selectedVerification, selectedCourse, debouncedSearch, initialType]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedLevel('All');
    setSelectedType(initialType);
    setSelectedVerification('All');
    setSelectedCourse('All');
    setSearchParams({});
    toast.info('Filters Reset', 'Showing all available materials');
  };

  // Filtered resources
  const filteredResources = useMemo(() => {
    const rawQuery = debouncedSearch.toLowerCase().trim();
    const normQuery = normalizeSearchTerm(debouncedSearch);

    return resources.filter((res) => {
      if (rawQuery !== '') {
        const matchField = (field: string) =>
          field.toLowerCase().includes(rawQuery) ||
          (normQuery.length > 0 && normalizeSearchTerm(field).includes(normQuery));

        const matchTitle = matchField(res.title);
        const matchCourse = matchField(res.courseCode);
        const matchCourseTitle = matchField(res.courseTitle);
        if (!matchTitle && !matchCourse && !matchCourseTitle) return false;
      }
      if (selectedLevel !== 'All' && res.level !== selectedLevel) return false;
      if (selectedType !== 'All' && res.type !== selectedType) return false;
      if (selectedVerification !== 'All' && res.verificationStatus !== selectedVerification) return false;
      if (selectedCourse !== 'All' && res.courseCode !== selectedCourse) return false;

      return true;
    });
  }, [resources, debouncedSearch, selectedLevel, selectedType, selectedVerification, selectedCourse]);

  useEffect(() => {
    const trimmed = debouncedSearch.trim();
    if (!isLoading && trimmed.length >= 2 && filteredResources.length === 0) {
      trackEvent('search_zero_results', {
        queryLength: trimmed.length,
        level: selectedLevel,
        type: selectedType,
      });
    }
  }, [isLoading, debouncedSearch, filteredResources.length, selectedLevel, selectedType]);

  // Resources grouped by Course Code
  const groupedResources = useMemo(() => {
    const map = new Map<string, { course: Course | undefined; items: AcademicResource[] }>();
    filteredResources.forEach((res) => {
      const code = res.courseCode;
      if (!map.has(code)) {
        const courseObj = courses.find((c) => c.code === code);
        map.set(code, { course: courseObj, items: [] });
      }
      map.get(code)!.items.push(res);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredResources, courses]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 w-full space-y-5 pb-28">
      {/* Page Header (Minimalist & Clean) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-light">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-brand-deep dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800 mb-1.5">
            <BookOpen className="w-3.5 h-3.5" aria-hidden="true" /> Departmental Academic Library
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-text-main tracking-tight">
            {title}
          </h1>
          <p className="text-sm text-text-muted mt-1 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          {/* View Mode Switcher */}
          <div role="group" aria-label="Resource view mode" className="inline-flex items-center p-1 rounded-xl bg-surface-card border border-border-light shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              aria-label="Compact list view"
              aria-pressed={viewMode === 'list'}
              className={`px-3 py-2 min-w-[44px] min-h-[44px] sm:min-h-[38px] rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-brand-green text-white shadow-2xs'
                  : 'text-text-muted hover:text-text-main'
              }`}
              title="Compact List View"
            >
              <List className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">List</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grouped')}
              aria-label="Group by course"
              aria-pressed={viewMode === 'grouped'}
              className={`px-3 py-2 min-w-[44px] min-h-[44px] sm:min-h-[38px] rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                viewMode === 'grouped'
                  ? 'bg-brand-green text-white shadow-2xs'
                  : 'text-text-muted hover:text-text-main'
              }`}
              title="Group by Course"
            >
              <Layers className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">By Course</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              aria-label="Card grid view"
              aria-pressed={viewMode === 'grid'}
              className={`px-3 py-2 min-w-[44px] min-h-[44px] sm:min-h-[38px] rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-brand-green text-white shadow-2xs'
                  : 'text-text-muted hover:text-text-main'
              }`}
              title="Card Grid View"
            >
              <Grid className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Cards</span>
            </button>
          </div>

          <Button
            size="sm"
            variant="primary"
            onClick={onOpenSubmit}
            className="text-xs h-9 font-bold shrink-0 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
            Submit
          </Button>
        </div>
      </div>

      {/* Single Unified Search Input (Refined Minimalist Spotlight Style) */}
      <div className="relative">
        <Search className="w-4 h-4 text-brand-green absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search resources by course code, title, or topic"
          placeholder="Search by course code (e.g. STA 211, STA111), title, or topic..."
          className="w-full min-h-[44px] rounded-2xl border border-border-light bg-surface-card pl-10 pr-12 py-2.5 text-base text-text-main placeholder:text-text-subtle shadow-2xs focus:border-brand-green focus:ring-2 focus:ring-brand-green/30 focus:outline-none transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            aria-label="Clear search"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-text-muted hover:text-text-main transition-transform cursor-pointer"
            title="Clear search"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Main Filter Strip */}
      <ResourceFilters
        selectedLevel={selectedLevel}
        selectedType={selectedType}
        selectedVerification={selectedVerification}
        onLevelChange={setSelectedLevel}
        onTypeChange={setSelectedType}
        onVerificationChange={setSelectedVerification}
        onReset={handleResetFilters}
        activeCount={activeFiltersCount}
      />

      {/* Results Header Status */}
      <div className="flex items-center justify-between text-xs text-text-muted pt-0.5 px-0.5">
        <div className="flex items-center gap-2">
          <span>
            Showing <span className="font-bold text-text-main">{filteredResources.length}</span> verified material{filteredResources.length === 1 ? '' : 's'}
          </span>
          {selectedCourse !== 'All' && (
            <span className="inline-flex items-center gap-1 font-semibold text-brand-green bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 text-xs">
              {selectedCourse}
            </span>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs text-brand-red hover:underline font-bold cursor-pointer"
          >
            Reset Filters ({activeFiltersCount})
          </button>
        )}
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <ResourceCardSkeleton />
          <ResourceCardSkeleton />
          <ResourceCardSkeleton />
          <ResourceCardSkeleton />
          <ResourceCardSkeleton />
          <ResourceCardSkeleton />
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 sm:p-14 text-center rounded-3xl border border-border-light bg-surface-card my-4 shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-brand-green flex items-center justify-center border border-emerald-200/80 dark:border-emerald-800/80">
            <FilterX className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-bold text-text-main">
              No materials match your filters
            </h3>
            <p className="text-sm text-text-muted max-w-sm mt-1">
              Try searching with a course code (e.g. STA 111, MTH 101), or reset your filters.
            </p>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-3.5 py-1.5 rounded-xl bg-brand-green hover:bg-brand-deep text-white font-bold text-xs transition-all cursor-pointer shadow-2xs"
            >
              Clear Filters
            </button>
            <button
              type="button"
              onClick={onOpenSubmit}
              className="px-3.5 py-1.5 rounded-xl bg-surface-bg border border-border-light hover:border-brand-green text-text-main hover:text-brand-green font-bold text-xs transition-all cursor-pointer"
            >
              Submit Material
            </button>
          </div>
        </div>
      ) : viewMode === 'list' ? (
        /* VIEW 1: MINIMALIST STRUCTURED LIST (Raycast / Notion Style) */
        <div className="space-y-4">
          <div className="rounded-2xl border border-border-light bg-surface-card divide-y divide-border-light/60 overflow-hidden shadow-2xs">
            {filteredResources.slice(0, visibleLimit).map((res) => {
            const detailPath = res.type === 'Past Question'
              ? `/past-questions/${res.id}`
              : `/resources/${res.id}`;

            return (
              <div
                key={res.id}
                className="relative group p-3.5 sm:p-4 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                {/* Left: Document details */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-surface-bg border border-border-light text-brand-green flex items-center justify-center shrink-0 group-hover:border-brand-green/40 transition-colors">
                    <FileText className="w-5 h-5 text-brand-green" aria-hidden="true" />
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md text-xs font-extrabold bg-emerald-50 dark:bg-emerald-950/60 text-brand-green border border-emerald-200 dark:border-emerald-800">
                        {res.courseCode}
                      </span>
                      <span className="text-xs font-medium text-text-muted">
                        {res.level}L • {res.session}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-xs font-semibold bg-surface-bg border border-border-light text-text-subtle">
                        {res.type} · {(res.fileType || 'PDF').toUpperCase()}
                      </span>
                      {res.verificationStatus === 'Verified' && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span className="hidden sm:inline">Verified</span>
                        </span>
                      )}
                    </div>

                    <Link
                      to={detailPath}
                      className="relative z-10 inline-flex items-center max-w-full min-w-[44px] min-h-[28px] py-0.5 group/link"
                    >
                      <h3 className="text-sm font-bold text-text-main group-hover/link:text-brand-green transition-colors truncate min-w-0">
                        {res.title}
                      </h3>
                    </Link>

                    <p className="text-xs sm:text-sm text-text-muted truncate">
                      {res.courseTitle} • {formatFileSize(res.fileSizeBytes)}
                    </p>
                  </div>
                </div>

                {/* Right: Quick actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => setReportTarget(res)}
                    aria-label={`Report issue with ${res.title}`}
                    className="relative z-10 min-w-[44px] min-h-[44px] flex items-center justify-center text-text-subtle hover:text-brand-red rounded-xl transition-colors cursor-pointer"
                    title="Report issue"
                  >
                    <Flag className="w-4 h-4" aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenPreview(res)}
                    className="inline-flex items-center gap-1.5 px-3.5 min-h-[44px] rounded-xl text-xs font-bold bg-surface-bg border border-border-light hover:border-brand-green hover:text-brand-green text-text-main transition-colors cursor-pointer after:absolute after:inset-0 after:z-0"
                  >
                    <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Preview</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleDownload(e, res)}
                    className="relative z-10 inline-flex items-center gap-1.5 px-3.5 min-h-[44px] rounded-xl text-xs font-bold bg-brand-green hover:bg-brand-deep text-white transition-all shadow-2xs active:scale-95 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            );
          })}
          </div>
          {filteredResources.length > visibleLimit && (
            <div className="flex justify-center pt-2">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setVisibleLimit((prev) => prev + 40)}
              >
                Load more ({filteredResources.length - visibleLimit} remaining)
              </Button>
            </div>
          )}
        </div>
      ) : viewMode === 'grouped' ? (
        /* VIEW 2: GROUPED BY COURSE (Institutional Catalog Orderliness) */
        <div className="space-y-6">
          {groupedResources.map(([courseCode, group]) => {
            const courseTitle = group.course?.title || group.items[0]?.courseTitle || 'Departmental Course';
            const courseLevel = group.course?.level || group.items[0]?.level || '200';
            const courseUnits = group.course?.units || 3;

            return (
              <div
                key={courseCode}
                className="rounded-2xl border border-border-light bg-surface-card overflow-hidden shadow-2xs"
              >
                {/* Course Drawer Header */}
                <div className="p-3.5 sm:p-4 bg-surface-bg/70 border-b border-border-light/70 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-brand-green text-white shadow-2xs">
                      {courseCode}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-text-main truncate">
                        {courseTitle}
                      </h3>
                      <span className="text-xs text-text-muted">
                        {courseLevel}L • {courseUnits} Units
                      </span>
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-surface-card border border-border-light text-text-muted shrink-0">
                    {group.items.length} material{group.items.length === 1 ? '' : 's'}
                  </span>
                </div>

                {/* Course Resource List */}
                <div className="divide-y divide-border-light/60">
                  {group.items.map((res) => (
                    <div
                      key={res.id}
                      className="relative p-3 sm:p-3.5 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-all flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText className="w-4 h-4 text-brand-green shrink-0" aria-hidden="true" />
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-text-main truncate">
                            {res.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-text-muted mt-0.5">
                            <span>{res.session}</span>
                            <span aria-hidden="true">•</span>
                            <span>{res.type}</span>
                            <span aria-hidden="true">•</span>
                            <span>{formatFileSize(res.fileSizeBytes)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenPreview(res)}
                          aria-label={`Preview ${res.title}`}
                          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl border border-border-light text-text-muted hover:text-brand-green hover:bg-surface-bg transition-colors cursor-pointer after:absolute after:inset-0 after:z-0"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDownload(e, res)}
                          aria-label={`Download ${res.title}`}
                          className="relative z-10 px-3 min-h-[44px] rounded-xl bg-brand-green hover:bg-brand-deep text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" aria-hidden="true" />
                          <span className="hidden sm:inline">Get</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* VIEW 3: CARD GRID VIEW */
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredResources.slice(0, visibleLimit).map((res) => (
              <DownloadCard
                key={res.id}
                resource={res}
                onPreview={(r) => handleOpenPreview(r)}
                onReport={(r) => setReportTarget(r)}
              />
            ))}
          </div>
          {filteredResources.length > visibleLimit && (
            <div className="flex justify-center pt-2">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setVisibleLimit((prev) => prev + 40)}
              >
                Load more ({filteredResources.length - visibleLimit} remaining)
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Lightbox Document Preview Modal */}
      {selectedResource && (
        <DocumentPreviewModal
          resource={selectedResource}
          isOpen={isDrivePreviewOpen}
          onClose={() => {
            setIsDrivePreviewOpen(false);
            setSelectedResource(null);
          }}
        />
      )}

      {/* Report Issue Modal */}
      {reportTarget && (
        <ReportIssueModal
          resource={reportTarget}
          isOpen={!!reportTarget}
          onClose={() => setReportTarget(null)}
          onSubmit={async (report) => {
            await submitContentReport(reportTarget.id, report.issueType, report.description);
            setReportTarget(null);
            toast.success('Report Submitted', 'Thank you for helping keep our library accurate.');
          }}
        />
      )}
    </div>
  );
};
