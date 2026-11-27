import React, { useState, useEffect, useRef } from 'react';
import { AcademicResource } from '../../../types';
import { Button } from '../../ui/Button';
import { AlertCircle, Upload } from 'lucide-react';
import { triggerResourceDownload } from '../../../lib/download';
import { submitContentReport } from '../../../lib/supabase';
import { resolveResourceFileUrl } from '../../../lib/resourceUrl';
import { useToast } from '../../ui/Toast';
import { UnifiedDocumentReader } from './UnifiedDocumentReader';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  resource: AcademicResource | null;
  onClose: () => void;
  onOpenSubmit?: (courseCode?: string) => void;
  onReport?: (resource: AcademicResource) => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  resource,
  onClose,
  onOpenSubmit,
}) => {
  const [reportSent, setReportSent] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const toast = useToast();

  useEffect(() => {
    setReportSent(false);
  }, [resource?.id]);

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus container so keyboard navigation and Escape start inside the dialog
    const timer = window.setTimeout(() => {
      dialogRef.current?.focus();
    }, 10);

    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  if (!isOpen || !resource) return null;

  const fileUrl = resolveResourceFileUrl(resource);

  const handleDownload = () => {
    triggerResourceDownload(resource, (title, message) => {
      toast.success(title, message);
    });
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/resources/${resource.id}`;
    if (navigator.share) {
      navigator
        .share({
          title: resource.title,
          text: `Preview ${resource.courseCode} on ASSON UI: ${resource.title}`,
          url: shareUrl,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.info('Link Copied', 'Material preview link copied to clipboard');
    }
  };

  const handleAlertCommittee = async () => {
    await submitContentReport(
      resource.id,
      'Missing Physical Scan',
      `Student requested physical PDF scan for ${resource.courseCode} (${resource.session})`
    );
    setReportSent(true);
    toast.info(
      'Notice Sent',
      'Academic Editorial Committee has been notified to prioritize digitizing this session.'
    );
  };

  const pendingCard = (
    <div className="w-full max-w-xl bg-surface-card rounded-3xl p-6 sm:p-10 shadow-card border border-border-light text-center space-y-5 animate-in fade-in duration-150">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto border border-amber-200/60 dark:border-amber-800/40 shadow-2xs">
        <AlertCircle className="w-8 h-8" aria-hidden="true" />
      </div>

      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/70 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold mb-2">
          Physical File Pending Upload
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-text-main">
          {resource.courseCode} — {resource.session}
        </h3>
        <p className="text-xs text-text-muted mt-2 max-w-md mx-auto leading-relaxed">
          This academic paper is catalogued in the official Department of Statistics syllabus, but the digitized file has not been uploaded to cloud storage yet.
        </p>
      </div>

      <div className="p-4 rounded-xl bg-surface-bg border border-border-light text-xs text-left space-y-1.5 font-medium">
        <div className="flex items-center justify-between gap-2">
          <span className="text-text-muted">Course Title:</span>
          <span className="text-text-main font-semibold text-right">{resource.courseTitle || 'Statistics Course'}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-text-muted">Academic Level:</span>
          <span className="text-text-main font-semibold">{resource.level} Level</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-text-muted">Academic Session:</span>
          <span className="text-text-main font-semibold">{resource.session}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
        {onOpenSubmit && (
          <Button
            size="md"
            variant="primary"
            onClick={() => {
              onClose();
              onOpenSubmit(resource.courseCode);
            }}
            className="w-full sm:w-auto font-bold text-xs min-h-[44px] px-5 shadow-2xs"
          >
            <Upload className="w-4 h-4 mr-1.5" /> Upload This File Now
          </Button>
        )}

        <Button
          size="md"
          variant="outline"
          onClick={handleAlertCommittee}
          disabled={reportSent}
          className="w-full sm:w-auto font-semibold text-xs min-h-[44px] px-4 border-border-light"
        >
          {reportSent ? (
            <span className="text-brand-green font-bold">Request Logged ✓</span>
          ) : (
            <span>Request Digitization</span>
          )}
        </Button>
      </div>

      <p className="text-xs text-text-subtle pt-2 border-t border-border-light/60">
        Have a copy of this paper? You can scan and submit it to the library in 1 tap without signing in.
      </p>
    </div>
  );

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Preview: ${resource.courseCode} ${resource.title}`}
      tabIndex={-1}
      className="fixed inset-0 z-50 bg-surface-bg flex flex-col focus:outline-none animate-in fade-in duration-150"
    >
      <UnifiedDocumentReader
        variant="workspace"
        title={resource.title}
        courseCode={resource.courseCode}
        subtitle={`${resource.session} • ${resource.level}L`}
        fileUrl={fileUrl}
        fileType={resource.fileType}
        filePath={resource.filePath}
        fileSizeBytes={resource.fileSizeBytes}
        onClose={onClose}
        onDownload={handleDownload}
        onShare={handleShare}
        pendingFallback={pendingCard}
      />
    </div>
  );
};
