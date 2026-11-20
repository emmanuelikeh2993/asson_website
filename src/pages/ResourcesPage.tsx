import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  subtitle = "Verified lecture notes, syllabi, past examination questions, and tutorial materials for the Department of Statistics.",
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

  const [selectedResource, setSelectedResource] = useState<AcademicResource | null>(null);
  const [isDrivePreviewOpen, setIsDrivePreviewOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<AcademicResource | null>(null);
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
      if (debouncedSearch.trim() !== '') {
        const q = debouncedSearch.toLowerCase().trim();
        const matchTitle = res.title.toLowerCase().includes(q);
        const matchCourse = res.courseCode.toLowerCase().includes(q);
        const matchCourseTitle = res.courseTitle.toLowerCase().includes(q);
        if (!matchTitle && !matchCourse && !matchCourseTitle) return false;
      }
      if (selectedLevel !== 'All' && res.level !== selectedLevel) return false;
      if (selectedType !== 'All' && res.type !== selectedType) return false;
      if (selectedVerification !== 'All' && res.verificationStatus !== selectedVerification) return false;
      if (selectedCourse !== 'All' && res.courseCode !== selectedCourse) return false;

      return true;
    });
  }, [resources, debouncedSearch, selectedLevel, selectedType, selectedVerification, selectedCourse]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-light">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="p-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-brand-green">
              <BookOpen className="w-4 h-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-text-main tracking-tight">
              {title}
            </h1>
          </div>
          <p className="text-xs text-text-muted max-w-2xl">
            {subtitle}
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          onClick={onOpenSubmit}
          className="text-xs h-9 font-bold shrink-0 self-start sm:self-auto"
        >
          <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
          Submit Material
        </Button>
      </div>

      {/* Single Unified Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-brand-green absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by course code (e.g. STA 211, MAT 121), title, or topic..."
          className="w-full rounded-xl border border-border-light bg-surface-card pl-10 pr-10 py-2.5 text-xs sm:text-sm text-text-main placeholder:text-text-subtle shadow-2xs focus:border-brand-green focus:outline-none transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-text-main transition-transform cursor-pointer"
            title="Clear search"
          >
            <X className="w-4 h-4" />
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
      <div className="flex items-center justify-between text-xs text-text-muted pt-1">
        <div>
          Showing <span className="font-bold text-text-main">{filteredResources.length}</span> material{filteredResources.length === 1 ? '' : 's'}
          {selectedCourse !== 'All' && <span> for <span className="font-bold text-brand-green">{selectedCourse}</span></span>}
        </div>
        {activeFiltersCount > 0 && (
          <button
            onClick={handleResetFilters}
            className="text-[11px] text-brand-red hover:underline font-semibold cursor-pointer"
          >
            Reset Filters ({activeFiltersCount})
          </button>
        )}
      </div>

      {/* Resource Grid */}
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
        <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-border-light bg-surface-card my-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-brand-green flex items-center justify-center mb-3 border border-emerald-200/80 dark:border-emerald-800/80">
            <FilterX className="w-6 h-6" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-text-main mb-1">
            No materials match your filters
          </h3>
          <p className="text-xs text-text-muted max-w-sm mb-4">
            Try searching with a course code (e.g. STA 111, MAT 121), or reset your filters.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-3.5 py-1.5 rounded-lg bg-brand-green hover:bg-brand-deep text-white font-bold text-xs transition-all cursor-pointer"
            >
              Clear Filters
            </button>
            <button
              type="button"
              onClick={onOpenSubmit}
              className="px-3.5 py-1.5 rounded-lg bg-surface-bg border border-border-light hover:border-brand-green text-text-main hover:text-brand-green font-bold text-xs transition-all cursor-pointer"
            >
              Submit Material
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
