import React from 'react';
import { AcademicResource } from '../../../types';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { 
  X, 
  FileText, 
  Download, 
  Flag, 
  Calendar, 
  User, 
  CheckCircle2, 
  Share2, 
  BookOpen 
} from 'lucide-react';
import { formatFileSize, formatDate } from '../../../lib/utils';

interface ResourcePreviewDrawerProps {
  resource: AcademicResource | null;
  onClose: () => void;
  onReport: (resource: AcademicResource) => void;
}

export const ResourcePreviewDrawer: React.FC<ResourcePreviewDrawerProps> = ({
  resource,
  onClose,
  onReport,
}) => {
  if (!resource) return null;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: resource.title,
        text: `Download ${resource.courseCode} material from ASSON UI: ${resource.title}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Resource link copied to clipboard!');
    }
  };

  const handleDownload = () => {
    alert(`Downloading ${resource.title} (${formatFileSize(resource.fileSizeBytes)})`);
  };

  return (
    <aside className="w-full lg:w-80 lg:shrink-0 rounded-2xl border border-border-light bg-surface-card p-5 shadow-card flex flex-col justify-between">
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border-light mb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            Document Details
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-text-muted hover:bg-surface-bg hover:text-text-main transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thumbnail Preview Area (inspired by Image 04) */}
        <div className="w-full h-44 rounded-xl bg-gradient-to-br from-surface-bg to-emerald-50/50 border border-border-light flex flex-col items-center justify-center p-4 mb-4 text-center relative overflow-hidden group">
          <div className="w-12 h-16 rounded bg-white shadow-sm border border-border-light flex flex-col items-center justify-center p-1 mb-2">
            <span className="text-[9px] font-bold text-brand-red bg-red-50 px-1 rounded uppercase">
              {resource.fileType}
            </span>
            <FileText className="w-6 h-6 text-brand-green mt-1" />
          </div>
          <span className="text-xs font-medium text-text-main line-clamp-1 max-w-[200px]">
            {resource.courseCode}
          </span>
          <span className="text-[11px] text-text-muted">
            {resource.type} • {resource.session}
          </span>
          <div className="mt-2">
            <Badge 
              variant={resource.verificationStatus === 'Verified' ? 'verified' : 'needs-review'}
              withIcon
            >
              {resource.verificationStatus}
            </Badge>
          </div>
        </div>

        {/* Document Title & Meta */}
        <h3 className="text-sm font-semibold text-text-main mb-1.5 leading-snug">
          {resource.title}
        </h3>
        <p className="text-xs text-brand-deep font-medium mb-4 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-brand-green" />
          {resource.courseTitle}
        </p>

        {/* Detailed Metadata Grid */}
        <div className="space-y-2.5 text-xs text-text-main pt-3 border-t border-border-light/60">
          <div className="flex justify-between items-center py-1">
            <span className="text-text-muted">Academic Level:</span>
            <span className="font-medium">{resource.level} Level</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-text-muted">Semester:</span>
            <span className="font-medium">{resource.semester === 1 ? 'First' : 'Second'} Semester</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-text-muted">Academic Session:</span>
            <span className="font-medium">{resource.session}</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-text-muted">File Size:</span>
            <span className="font-medium">{formatFileSize(resource.fileSizeBytes)}</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-text-muted">Verified Date:</span>
            <span className="font-medium">{formatDate(resource.lastCheckedDate)}</span>
          </div>
          {resource.contributorName && (
            <div className="flex justify-between items-center py-1">
              <span className="text-text-muted">Contributor:</span>
              <span className="font-medium text-text-main flex items-center gap-1">
                <User className="w-3 h-3 text-text-subtle" />
                {resource.contributorName}
              </span>
            </div>
          )}
        </div>

        {resource.description && (
          <div className="mt-4 p-3 rounded-lg bg-surface-bg border border-border-light/60 text-xs text-text-muted leading-relaxed">
            {resource.description}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="mt-6 pt-4 border-t border-border-light flex flex-col gap-2">
        <Button
          variant="primary"
          size="md"
          onClick={handleDownload}
          className="w-full justify-center shadow-md font-medium"
        >
          <Download className="w-4 h-4 mr-2" />
          Download {resource.fileType}
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="text-xs"
          >
            <Share2 className="w-3.5 h-3.5 mr-1" />
            Share
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onReport(resource)}
            className="text-xs text-brand-red hover:bg-red-50 hover:border-red-200"
          >
            <Flag className="w-3.5 h-3.5 mr-1" />
            Report Issue
          </Button>
        </div>
      </div>
    </aside>
  );
};

