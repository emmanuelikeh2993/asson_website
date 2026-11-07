import React from 'react';
import { Link } from 'react-router-dom';
import { AcademicResource } from '../../../types';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { FileText, Download, Eye, Flag, Share2 } from 'lucide-react';
import { formatFileSize } from '../../../lib/utils';
import { triggerResourceDownload } from '../../../lib/download';
import { useToast } from '../../ui/Toast';

interface DownloadCardProps {
  resource: AcademicResource;
  onPreview: (resource: AcademicResource) => void;
  onReport: (resource: AcademicResource) => void;
}

export const DownloadCard: React.FC<DownloadCardProps> = ({
  resource,
  onPreview,
  onReport,
}) => {
  const toast = useToast();

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerResourceDownload(resource, (title, message) => {
      toast.success(title, message);
    });
  };

  return (
    <div 
      onClick={() => onPreview(resource)}
      className="group relative flex flex-col justify-between rounded-2xl border border-border-light bg-surface-card p-4 transition-all duration-200 hover:border-brand-green/50 hover:shadow-card-hover cursor-pointer active:scale-[0.99]"
    >
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <Badge variant="course">
            {resource.courseCode}
          </Badge>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold text-text-subtle font-mono">
              {resource.level}L
            </span>
            <Badge 
              variant={resource.verificationStatus === 'Verified' ? 'verified' : 'needs-review'}
              withIcon
            >
              {resource.verificationStatus}
            </Badge>
          </div>
        </div>

        {/* Title */}
        <Link 
          to={resource.type === 'Past Question' ? `/past-questions/${resource.id}` : `/resources/${resource.id}`}
          onClick={(e) => e.stopPropagation()}
          className="block group/link"
        >
          <h4 className="text-sm font-bold text-text-main group-hover/link:text-brand-green group-hover:text-brand-green transition-colors line-clamp-2 mb-1 leading-snug">
            {resource.title}
          </h4>
        </Link>

        {/* Course Title & Session */}
        <p className="text-xs text-text-muted mb-3 line-clamp-1">
          {resource.courseTitle} • <span className="font-semibold text-text-main">{resource.session}</span>
        </p>
      </div>

      {/* File Metadata & Actions - Strict Consistent Order */}
      <div className="pt-3 border-t border-border-light/60 mt-auto">
        <div className="flex items-center justify-between gap-2">
          {/* File format & Size */}
          <div className="flex items-center gap-1.5 text-[11px] text-text-muted font-medium">
            <FileText className="w-3.5 h-3.5 text-brand-green shrink-0" />
            <span>{resource.fileType} • {formatFileSize(resource.fileSizeBytes)}</span>
          </div>

          {/* Action Buttons: Report -> Preview -> Download (Primary) */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onReport(resource);
              }}
              title="Report an issue with this file"
              className="p-1.5 text-text-subtle hover:text-brand-red hover:bg-red-50 rounded-lg transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center"
              aria-label="Report issue"
            >
              <Flag className="w-3.5 h-3.5" />
            </button>

            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onPreview(resource);
              }}
              className="h-8 px-2.5 text-xs font-semibold"
            >
              <Eye className="w-3.5 h-3.5 mr-1" />
              Preview
            </Button>

            <Button
              size="sm"
              variant="primary"
              onClick={handleDownload}
              className="h-8 px-3 text-xs font-bold shadow-xs hover:shadow"
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              Download
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
