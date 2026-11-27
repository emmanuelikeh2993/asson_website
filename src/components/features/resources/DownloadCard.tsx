import React from 'react';
import { Link } from 'react-router-dom';
import { AcademicResource } from '../../../types';
import { Download, ArrowUpRight } from 'lucide-react';
import { triggerResourceDownload } from '../../../lib/download';
import { useToast } from '../../ui/Toast';

interface DownloadCardProps {
  resource: AcademicResource;
  onPreview: (resource: AcademicResource) => void;
  onReport?: (resource: AcademicResource) => void;
}

export const DownloadCard: React.FC<DownloadCardProps> = ({
  resource,
  onPreview,
}) => {
  const toast = useToast();

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerResourceDownload(resource, (title, message) => {
      toast.success(title, message);
    });
  };

  const detailPath = resource.type === 'Past Question'
    ? `/past-questions/${resource.id}`
    : `/resources/${resource.id}`;

  return (
    <div
      className="group relative flex flex-col justify-between rounded-2xl border border-border-light bg-surface-card p-4 sm:p-5 transition-all duration-200 hover:border-brand-green/60 hover:shadow-xs"
    >
      <div>
        {/* Top Header: Course identity pill with session, and quiet download icon */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold tracking-tight bg-emerald-50 dark:bg-emerald-950/50 text-brand-deep dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/70">
              {resource.courseCode}
            </span>
            {resource.session && (
              <span className="text-xs font-medium text-text-muted truncate">
                {resource.session}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleDownload}
            title="Download document"
            className="relative z-10 min-w-[44px] min-h-[44px] -my-2 -mr-2 flex items-center justify-center text-text-muted hover:text-brand-green hover:bg-surface-bg rounded-xl transition-colors shrink-0 cursor-pointer"
            aria-label={`Download ${resource.title}`}
          >
            <Download className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Clean, Prominent Academic Title */}
        <Link
          to={detailPath}
          className="relative z-10 inline-flex items-center max-w-full min-w-[44px] min-h-[28px] py-0.5 group/link"
        >
          <h4 className="text-sm sm:text-base font-bold text-text-main group-hover/link:text-brand-green group-hover:text-brand-green transition-colors line-clamp-2 leading-snug mb-1 min-w-0">
            {resource.title}
          </h4>
        </Link>

        {/* Course Title */}
        <p className="text-xs sm:text-sm text-text-muted line-clamp-1 mb-3">
          {resource.courseTitle}
        </p>
      </div>

      {/* Clean Bottom Row: Level label and single distinct "Open" stretched button */}
      <div className="pt-2 border-t border-border-light/60 flex items-center justify-between gap-2 mt-auto">
        <span className="text-xs font-medium text-text-subtle">
          {resource.level}L • {resource.type}
        </span>

        <button
          type="button"
          onClick={() => onPreview(resource)}
          className="inline-flex items-center gap-1 min-h-[44px] px-2 -mr-2 text-xs font-bold text-brand-green hover:text-brand-deep transition-colors cursor-pointer after:absolute after:inset-0 after:z-0"
        >
          <span>Open</span>
          <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
