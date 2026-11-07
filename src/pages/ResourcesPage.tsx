import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MOCK_RESOURCES, COURSES } from '../lib/mockData';
import { fetchResources, fetchCourses, submitContentReport } from '../lib/supabase';
import { AcademicResource, AcademicLevel, ResourceType, VerificationStatus, Course } from '../types';
import { ResourceTable } from '../components/features/resources/ResourceTable';
import { DownloadCard } from '../components/features/resources/DownloadCard';
import { ResourcePreviewDrawer } from '../components/features/resources/ResourcePreviewDrawer';
import { DocumentPreviewModal } from '../components/features/resources/DocumentPreviewModal';
import { ResourceFilters } from '../components/features/resources/ResourceFilters';
import { ReportIssueModal } from '../components/features/resources/ReportIssueModal';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useDebounce } from '../hooks/useDebounce';
import { ResourceCardSkeleton, TableRowSkeleton } from '../components/ui/Skeleton';
import {
  Search,
  LayoutGrid,
  List,
  BookOpen,
  FolderCheck,
  Sparkles,
  FilterX,
  PlusCircle,
  Folder,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { useToast } from '../components/ui/Toast';

interface ResourcesPageProps {
  initialType?: ResourceType | 'All';
  title?: string;
  subtitle?: string;
  onOpenSubmit: () => void;
}

export const ResourcesPage: React.FC<ResourcesPageProps> = ({
  initialType = 'All',
  title = "Academic Resource Library",
  subtitle = "Explore verified lecture notes, course outlines, past examination papers, and tutorial sheets for the Department of Statistics.",
  onOpenSubmit,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const levelParam = searchParams.get('level') as AcademicLevel | null;
  const courseParam = searchParams.get('course');
  const idParam = searchParams.get('id');

  const [resources, setResources] = useState<AcademicResource[]>(MOCK_RESOURCES);
  const [courses, setCourses] = useState<Course[]>(COURSES);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 250);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<AcademicLevel | 'All'>(levelParam || 'All');
  const [selectedType, setSelectedType] = useState<ResourceType | 'All'>(initialType);
  const [selectedVerification, setSelectedVerification] = useState<VerificationStatus | 'All'>('All');
  const [selectedCourse, setSelectedCourse] = useState<string | 'All'>(courseParam || 'All');

  // Mobile-friendly default: Cards on mobile screen, Table on desktop
  const isMobileInitial = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  const [viewMode, setViewMode] = useState<'grid' | 'table'>(isMobileInitial ? 'grid' : 'table');

  const [selectedResource, setSelectedResource] = useState<AcademicResource | null>(null);
  const [isDrivePreviewOpen, setIsDrivePreviewOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<AcademicResource | null>(null);
  const [isMobileCourseDrawerOpen, setIsMobileCourseDrawerOpen] = useState(false);
  const toast = useToast();

  const handleOpenPreview = (res: AcademicResource) => {
    setSelectedResource(res);
    setIsDrivePreviewOpen(true);
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
    if (levelParam) setSelectedLevel(levelParam);
    if (courseParam) setSelectedCourse(courseParam);
  }, [levelParam, courseParam]);

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
    return resources.filter((res) => {
      // Query filter (debounced)
      if (debouncedSearch.trim() !== '') {
        const q = debouncedSearch.toLowerCase().trim();
        const matchTitle = res.title.toLowerCase().includes(q);
        const matchCourse = res.courseCode.toLowerCase().includes(q);
        const matchCourseTitle = res.courseTitle.toLowerCase().includes(q);
        if (!matchTitle && !matchCourse && !matchCourseTitle) return false;
      }
      // Level filter
      if (selectedLevel !== 'All' && res.level !== selectedLevel) return false;
      // Type filter
      if (selectedType !== 'All' && res.type !== selectedType) return false;
      // Verification filter
      if (selectedVerification !== 'All' && res.verificationStatus !== selectedVerification) return false;
      // Course filter
      if (selectedCourse !== 'All' && res.courseCode !== selectedCourse) return false;

      return true;
    });
  }, [resources, debouncedSearch, selectedLevel, selectedType, selectedVerification, selectedCourse]);

  // Group courses by level for sidebar
  const coursesForSelectedLevel = useMemo(() => {
    if (selectedLevel === 'All') return courses;
    return courses.filter((c) => c.level === selectedLevel);
  }, [selectedLevel, courses]);

  // Top course codes for horizontal mobile pill slider
  const popularCourses = useMemo(() => {
    return coursesForSelectedLevel.slice(0, 16);
  }, [coursesForSelectedLevel]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 w-full max-w-full overflow-hidden">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border-light">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-brand-green">
              <BookOpen className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-text-main tracking-tight">
              {title}
            </h1>
          </div>
          <p className="text-xs text-text-muted max-w-2xl">
            {subtitle}
          </p>
        </div>

        {/* View Switcher & Submit CTA - Strict Order */}
        <div className="flex items-center justify-between sm:justify-end gap-2.5">
          {/* List vs Grid Switcher */}
          <div className="flex items-center rounded-xl border border-border-light bg-surface-card p-1 text-xs shadow-xs">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors ${viewMode === 'table'
                ? 'bg-brand-green text-white shadow-xs'
                : 'text-text-muted hover:text-text-main'
                }`}
            >
              <List className="w-3.5 h-3.5" /> Table
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors ${viewMode === 'grid'
                ? 'bg-brand-green text-white shadow-xs'
                : 'text-text-muted hover:text-text-main'
                }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Cards
            </button>
          </div>

          <Button
            size="sm"
            variant="primary"
            onClick={onOpenSubmit}
            className="text-xs h-9 font-bold shadow-xs hover:shadow"
          >
            <PlusCircle className="w-4 h-4 mr-1.5" />
            Submit Material
          </Button>
        </div>
      </div>

      {/* Search Input Bar (Debounced with high-visibility focus ring) */}
      <div className="relative mt-4">
        <Search className="w-4 h-4 text-brand-green absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by course code (e.g. STA 211), title, or keywords..."
          className="w-full rounded-xl border border-border-light bg-surface-card pl-10 pr-10 py-2.5 text-xs sm:text-sm text-text-main placeholder:text-text-subtle shadow-xs focus:ring-2 focus:ring-brand-green focus:border-brand-green focus:outline-none transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-text-main active:scale-90 transition-transform cursor-pointer"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Filter Bar */}
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

      {/* Mobile-Only Horizontal Course Pills Slider */}
      <div className="lg:hidden mt-3 mb-1">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
            Filter Course:
          </span>
          <button
            onClick={() => setIsMobileCourseDrawerOpen(true)}
            className="text-[11px] font-semibold text-brand-green hover:underline flex items-center gap-1"
          >
            <SlidersHorizontal className="w-3 h-3" /> All {courses.length} Courses
          </button>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-xs">
          <button
            onClick={() => setSelectedCourse('All')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors shrink-0 ${selectedCourse === 'All'
              ? 'bg-brand-green text-white shadow-xs'
              : 'bg-surface-card border border-border-light text-text-muted hover:text-text-main'
              }`}
          >
            All Courses
          </button>
          {popularCourses.map((c) => (
            <button
              key={c.code}
              onClick={() => setSelectedCourse(c.code)}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors shrink-0 ${selectedCourse === c.code
                ? 'bg-brand-green text-white shadow-xs'
                : 'bg-surface-card border border-border-light text-text-main hover:bg-emerald-50/50'
                }`}
            >
              {c.code}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col lg:flex-row gap-6 mt-4">
        {/* Desktop Left Sidebar: Course Tree */}
        <aside className="hidden lg:block w-64 shrink-0 space-y-4">
          <div className="p-4 rounded-2xl border border-border-light bg-surface-card shadow-sm">
            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-border-light">
              <h3 className="text-xs font-bold text-text-main uppercase tracking-wider flex items-center gap-1.5">
                <Folder className="w-4 h-4 text-brand-green" /> Courses ({coursesForSelectedLevel.length})
              </h3>
              {selectedCourse !== 'All' && (
                <button
                  onClick={() => setSelectedCourse('All')}
                  className="text-[10px] text-brand-green hover:underline font-semibold"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="space-y-1 max-h-[58vh] overflow-y-auto pr-1">
              <button
                onClick={() => setSelectedCourse('All')}
                className={`w-full text-left text-xs px-2.5 py-2 rounded-xl font-medium transition-colors flex items-center justify-between ${selectedCourse === 'All'
                  ? 'bg-brand-light text-brand-deep font-bold'
                  : 'text-text-muted hover:bg-surface-bg hover:text-text-main'
                  }`}
              >
                <span>All Courses</span>
                <span className="text-[10px] text-text-subtle font-semibold">{courses.length}</span>
              </button>

              {coursesForSelectedLevel.map((course) => (
                <button
                  key={course.code}
                  onClick={() => setSelectedCourse(course.code)}
                  className={`w-full text-left text-xs px-2.5 py-2 rounded-xl font-medium transition-colors flex items-center justify-between ${selectedCourse === course.code
                    ? 'bg-brand-light text-brand-deep font-bold'
                    : 'text-text-muted hover:bg-surface-bg hover:text-text-main'
                    }`}
                >
                  <span className="truncate">{course.code}</span>
                  <span className="text-[10px] text-text-subtle font-mono">{course.level}L</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Notice Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-brand-light/30 border border-emerald-200 text-xs text-brand-deep">
            <div className="flex items-center gap-1.5 font-bold text-brand-green mb-1">
              <Sparkles className="w-4 h-4" /> Academic Pro-Tip
            </div>
            <p className="text-[11px] leading-relaxed text-text-muted">
              Press <kbd className="font-mono bg-white px-1.5 py-0.5 border rounded shadow-xs text-text-main font-bold">/</kbd> anywhere to launch the instant command search palette.
            </p>
          </div>
        </aside>

        {/* Central Pane: Resource Content (Grid or Table) */}
        <div className="flex-1 min-w-0">
          {/* Active Filters & Search Status Bar */}
          <div className="flex items-center justify-between mb-3 text-xs text-text-muted">
            <div>
              Showing <span className="font-bold text-text-main">{filteredResources.length}</span> verified material{filteredResources.length === 1 ? '' : 's'}
              {selectedCourse !== 'All' && <span> for <span className="font-bold text-brand-green">{selectedCourse}</span></span>}
            </div>
            {activeFiltersCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="text-[11px] text-brand-red hover:underline font-semibold"
              >
                Reset Filters ({activeFiltersCount})
              </button>
            )}
          </div>

          {/* Main Content Area: Loading Skeletons vs Empty State vs Grid/Table */}
          {isLoading ? (
            viewMode === 'table' ? (
              <div className="overflow-hidden rounded-2xl border border-border-light bg-surface-card shadow-card">
                <table className="w-full text-left border-collapse text-xs">
                  <tbody className="divide-y divide-border-light/60">
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ResourceCardSkeleton />
                <ResourceCardSkeleton />
                <ResourceCardSkeleton />
                <ResourceCardSkeleton />
                <ResourceCardSkeleton />
                <ResourceCardSkeleton />
              </div>
            )
          ) : filteredResources.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-border-light bg-surface-card my-4">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-brand-green flex items-center justify-center mb-3">
                <FolderCheck className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-text-main mb-1">
                No matching academic materials found
              </h3>
              <p className="text-xs text-text-muted max-w-sm mb-4">
                We couldn't find any resources matching your search. Try clearing filters or submit a new material!
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button size="sm" variant="outline" onClick={handleResetFilters} className="font-semibold text-xs">
                  <FilterX className="w-3.5 h-3.5 mr-1.5" />
                  Clear Filters
                </Button>
                <Button size="sm" variant="primary" onClick={onOpenSubmit} className="font-bold text-xs">
                  <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
                  Submit This Material
                </Button>
              </div>
            </div>
          ) : viewMode === 'table' ? (
            <ResourceTable
              resources={filteredResources}
              selectedId={selectedResource?.id}
              onSelect={(res) => handleOpenPreview(res)}
              onReport={(res) => setReportTarget(res)}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredResources.map((res) => (
                <DownloadCard
                  key={res.id}
                  resource={res}
                  onPreview={(r) => handleOpenPreview(r)}
                  onReport={(r) => setReportTarget(r)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Pane: Document Preview Drawer (Desktop View) */}
        {selectedResource && !isDrivePreviewOpen && (
          <div className="hidden lg:block">
            <ResourcePreviewDrawer
              resource={selectedResource}
              onClose={() => setSelectedResource(null)}
              onReport={(res) => setReportTarget(res)}
            />
          </div>
        )}
      </div>

      {/* Full Google Drive-Style Document Preview Lightbox Modal */}
      <DocumentPreviewModal
        isOpen={isDrivePreviewOpen && !!selectedResource}
        resource={selectedResource}
        onClose={() => {
          setIsDrivePreviewOpen(false);
          setSelectedResource(null);
        }}
        onOpenSubmit={onOpenSubmit}
        onReport={(res) => setReportTarget(res)}
      />

      {/* Mobile Course Selector Drawer */}
      {isMobileCourseDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          <div
            onClick={() => setIsMobileCourseDrawerOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
          />
          <div className="relative z-10 max-h-[80vh] overflow-y-auto rounded-t-3xl bg-surface-card p-5 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border-light mb-3">
              <h3 className="text-sm font-bold text-text-main">
                Select Course ({courses.length} Departmental Courses)
              </h3>
              <button
                onClick={() => setIsMobileCourseDrawerOpen(false)}
                className="p-1.5 text-text-muted hover:text-text-main rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setSelectedCourse('All');
                  setIsMobileCourseDrawerOpen(false);
                }}
                className={`p-3 rounded-xl text-left text-xs font-bold border transition-colors ${selectedCourse === 'All'
                  ? 'bg-brand-green text-white border-brand-green'
                  : 'bg-surface-card border-border-light text-text-main'
                  }`}
              >
                All Courses ({courses.length})
              </button>
              {courses.map((c) => (
                <button
                  key={c.code}
                  onClick={() => {
                    setSelectedCourse(c.code);
                    setIsMobileCourseDrawerOpen(false);
                  }}
                  className={`p-3 rounded-xl text-left text-xs border transition-colors ${selectedCourse === c.code
                    ? 'bg-brand-green text-white border-brand-green font-bold'
                    : 'bg-surface-card border-border-light text-text-main hover:bg-emerald-50/50'
                    }`}
                >
                  <span className="font-bold block">{c.code}</span>
                  <span className="text-[10px] opacity-80 block truncate">{c.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Report Issue Modal */}
      <ReportIssueModal
        isOpen={!!reportTarget}
        resource={reportTarget}
        onClose={() => setReportTarget(null)}
        onSubmit={(data) => {
          if (reportTarget) {
            submitContentReport(reportTarget.id, data.issueType, data.description).catch(() => {});
          }
          setReportTarget(null);
          toast.success('Issue Reported', 'Thank you. The ASSON academic editorial team has been notified.');
        }}
      />
    </div>
  );
};
