import React from 'react';
import { AcademicResource } from '../../../types';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { FileText, Download, Eye, Flag } from 'lucide-react';
import { formatFileSize } from '../../../lib/utils';

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
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Simulate real download trigger
    const alertMsg = `Downloading ${resource.title} (${formatFileSize(resource.fileSizeBytes)})`;
    console.log(alertMsg);
    // In production, triggers Supabase Storage public URL
    window.open(resource.downloadUrl === '#' ? 'javascript:void(0)' : resource.downloadUrl, '_blank');
    alert(`Starting download for: ${resource.title}\nCourse: ${resource.courseCode}\nFile size: ${formatFileSize(resource.fileSizeBytes)}`);
  };

  return (
    <div 
      onClick={() => onPreview(resource)}
      className="group relative flex flex-col justify-between rounded-xl border border-border-light bg-surface-card p-4 transition-all duration-200 hover:border-brand-green/40 hover:shadow-card-hover cursor-pointer"
    >
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <Badge variant="course">
            {resource.courseCode}
          </Badge>
          <div className="flex items-center gap-1.5">
            <Badge 
              variant={resource.verificationStatus === 'Verified' ? 'verified' : 'needs-review'}
              withIcon
            >
              {resource.verificationStatus}
            </Badge>
          </div>
        </div>

        {/* Title */}
        <h4 className="text-sm font-semibold text-text-main group-hover:text-brand-green transition-colors line-clamp-2 mb-1.5">
          {resource.title}
        </h4>

        {/* Course Title & Session */}
        <p className="text-xs text-text-muted mb-3">
          {resource.courseTitle} • <span className="font-medium text-text-main">{resource.session}</span>
        </p>
      </div>

      {/* File Metadata & Actions */}
      <div className="pt-3 border-t border-border-light/60 mt-auto">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-text-muted font-medium">
            <FileText className="w-4 h-4 text-brand-green shrink-0" />
            <span>{resource.fileType} • {formatFileSize(resource.fileSizeBytes)}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onReport(resource);
              }}
              title="Report an issue with this file"
              className="p-1.5 text-text-subtle hover:text-brand-red hover:bg-red-50 rounded-md transition-colors"
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
              className="h-8 px-2.5 text-xs"
            >
              <Eye className="w-3.5 h-3.5 mr-1" />
              Preview
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={handleDownload}
              className="h-8 px-3 text-xs"
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

