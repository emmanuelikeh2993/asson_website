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
      onClick={() => onPreview(resource)}
      className="group relative flex flex-col justify-between rounded-2xl border border-border-light bg-surface-card p-4 sm:p-5 transition-all duration-200 hover:border-brand-green/60 hover:shadow-xs cursor-pointer active:scale-[0.99]"
    >
      <div>
        {/* Top Header: Course identity pill with session, and quiet download icon */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold tracking-tight bg-emerald-50 dark:bg-emerald-950/50 text-brand-green border border-emerald-200/70 dark:border-emerald-800/70">
              {resource.courseCode}
            </span>
            {resource.session && (
              <span className="text-[11px] font-medium text-text-muted truncate">
                {resource.session}
              </span>
            )}
          </div>

          <button
            onClick={handleDownload}
            title="Download document"
            className="p-1.5 text-text-muted hover:text-brand-green hover:bg-surface-bg rounded-lg transition-colors shrink-0"
            aria-label="Download document"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

        {/* Clean, Prominent Academic Title */}
        <Link
          to={detailPath}
          onClick={(e) => e.stopPropagation()}
          className="block group/link"
        >
          <h4 className="text-sm sm:text-base font-bold text-text-main group-hover/link:text-brand-green group-hover:text-brand-green transition-colors line-clamp-2 leading-snug mb-1">
            {resource.title}
          </h4>
        </Link>

        {/* Course Title */}
        <p className="text-xs text-text-muted line-clamp-1 mb-4">
          {resource.courseTitle}
        </p>
      </div>

      {/* Clean Bottom Row: Level label and single distinct "Open" button */}
      <div className="pt-3 border-t border-border-light/60 flex items-center justify-between gap-2 mt-auto">
        <span className="text-[11px] font-medium text-text-subtle">
          {resource.level}L • {resource.type}
        </span>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPreview(resource);
          }}
          className="inline-flex items-center gap-1 text-xs font-bold text-brand-green hover:text-brand-deep group-hover:translate-x-0.5 transition-transform"
        >
          <span>Open</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
