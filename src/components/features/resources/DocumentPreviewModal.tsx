import React, { useState, useEffect } from 'react';
import { AcademicResource } from '../../../types';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { 
  X, 
  Download, 
  Share2, 
  Printer, 
  ExternalLink,
  FileText,
  AlertCircle,
  FileCheck2,
  Calendar,
  Layers,
  Upload,
  Eye,
  RefreshCw
} from 'lucide-react';
import { formatFileSize } from '../../../lib/utils';
import { triggerResourceDownload } from '../../../lib/download';
import { submitContentReport } from '../../../lib/supabase';
import { useToast } from '../../ui/Toast';

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
  onReport,
}) => {
  const [viewerMode, setViewerMode] = useState<'google' | 'native'>('google');
  const [reportSent, setReportSent] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !resource) return null;

  // Resolve actual physical PDF URL if uploaded to Supabase Storage or external link
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cvhjohbknghlmspoaenr.supabase.co';
  
  let physicalPdfUrl: string | null = null;

  if (resource.downloadUrl && resource.downloadUrl !== '#' && !resource.downloadUrl.includes('cvhjohbknghlmspoaenr')) {
    physicalPdfUrl = resource.downloadUrl;
  } else if (resource.filePath && (
    resource.filePath.startsWith('papers/') ||
    resource.filePath.startsWith('submissions/') ||
    resource.filePath === 'test.pdf'
  )) {
    const sanitized = resource.filePath.replace(/^resources\//, '');
    physicalPdfUrl = `${supabaseUrl}/storage/v1/object/public/resources/${sanitized}`;
  }

  const handleDownload = () => {
    triggerResourceDownload(resource, (title, message) => {
      toast.success(title, message);
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: resource.title,
        text: `Preview ${resource.courseCode} on ASSON UI: ${resource.title}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
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
    toast.info('Notice Sent', 'Academic Editorial Committee has been notified to prioritize digitizing this session.');
  };

  const googleViewerUrl = physicalPdfUrl 
    ? `https://docs.google.com/viewer?url=${encodeURIComponent(physicalPdfUrl)}&embedded=true`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      {/* 1. Google Drive-Style Top Navigation Bar */}
      <header className="h-14 sm:h-16 bg-[#161d19] border-b border-white/10 px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 text-white select-none">
        {/* Left: Document Identity & Tag */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white/10 text-emerald-300">
                {resource.courseCode}
              </span>
              <h2 className="text-xs sm:text-sm font-bold text-white truncate max-w-xs sm:max-w-md lg:max-w-xl">
                {resource.title}
              </h2>
            </div>
            <p className="text-[10px] text-white/60 truncate">
              {resource.type} • {resource.session} • {resource.level} Level
              {physicalPdfUrl ? ` • ${formatFileSize(resource.fileSizeBytes)}` : ' • Physical Scan Pending'}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {physicalPdfUrl && (
            <>
              {/* Viewer switcher */}
              <div className="hidden md:flex items-center rounded-lg bg-white/10 border border-white/10 p-0.5 text-xs text-white/80 mr-2">
                <button
                  onClick={() => setViewerMode('google')}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                    viewerMode === 'google' ? 'bg-brand-green text-white shadow-xs' : 'hover:text-white'
                  }`}
                >
                  Google Viewer
                </button>
                <button
                  onClick={() => setViewerMode('native')}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                    viewerMode === 'native' ? 'bg-brand-green text-white shadow-xs' : 'hover:text-white'
                  }`}
                >
                  Direct PDF
                </button>
              </div>

              <a
                href={physicalPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors hidden sm:block"
                title="Open raw PDF in new browser tab"
              >
                <ExternalLink className="w-4 h-4" />
              </a>

              <Button
                size="sm"
                variant="primary"
                onClick={handleDownload}
                className="bg-brand-green hover:bg-emerald-600 text-white font-bold text-xs h-9 px-3.5 shadow-md active:scale-95 transition-transform"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                <span className="hidden sm:inline">Download</span> PDF
              </Button>
            </>
          )}

          <button
            onClick={handleShare}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors hidden sm:block"
            title="Share Document"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Close Modal */}
          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors ml-1"
            title="Close Preview (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 2. Main Document Canvas */}
      <main className="flex-1 overflow-auto p-3 sm:p-6 lg:p-8 flex items-center justify-center">
        {physicalPdfUrl ? (
          /* ACTUAL REAL PDF EMBED (Google Docs Viewer or Native Browser PDF Engine) */
          <div className="w-full max-w-5xl h-[80vh] bg-white rounded-2xl shadow-2xl overflow-hidden border border-white/20 flex flex-col">
            <div className="h-9 bg-neutral-100 border-b border-neutral-200 px-4 flex items-center justify-between text-xs text-neutral-600 shrink-0">
              <span className="font-medium truncate">
                Previewing: {resource.courseCode} ({resource.session}) — Official Upload
              </span>
              <div className="flex items-center gap-3">
                <a
                  href={physicalPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-green font-semibold hover:underline flex items-center gap-1 text-[11px]"
                >
                  Direct Link <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="flex-1 w-full h-full bg-neutral-200 relative">
              <iframe
                src={viewerMode === 'google' && googleViewerUrl ? googleViewerUrl : `${physicalPdfUrl}#toolbar=1`}
                title={resource.title}
                className="w-full h-full border-0"
              />
            </div>
          </div>
        ) : (
          /* NO PHYSICAL SCAN YET: 100% HONEST, TRANSPARENT STATUS (NO FAKE / DUMMY QUESTIONS) */
          <div className="w-full max-w-xl bg-surface-card rounded-3xl p-8 sm:p-10 shadow-2xl border border-border-light text-center space-y-5 animate-in zoom-in-95 duration-150">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200/60 shadow-xs">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/60 text-amber-800 text-[11px] font-bold mb-2">
                Physical PDF Pending Upload
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-text-main">
                {resource.courseCode} — {resource.session}
              </h3>
              <p className="text-xs text-text-muted mt-2 max-w-md mx-auto leading-relaxed">
                This academic paper is catalogued in the official Department of Statistics syllabus, but the digitized physical PDF scan has not been uploaded to cloud storage yet.
              </p>
            </div>

            {/* Document Meta Info */}
            <div className="p-4 rounded-xl bg-surface-bg border border-border-light text-xs text-left space-y-1.5 font-medium">
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Course Title:</span>
                <span className="text-text-main font-semibold">{resource.courseTitle || 'Statistics Course'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Academic Level:</span>
                <span className="text-text-main font-semibold">{resource.level} Level</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Academic Session:</span>
                <span className="text-text-main font-semibold">{resource.session}</span>
              </div>
            </div>

            {/* Actions for Students & Exco */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              {onOpenSubmit && (
                <Button
                  size="md"
                  variant="primary"
                  onClick={() => {
                    onClose();
                    onOpenSubmit(resource.courseCode);
                  }}
                  className="w-full sm:w-auto font-bold text-xs h-10 px-5 shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5 mr-1.5" /> Upload This PDF Now
                </Button>
              )}

              <Button
                size="md"
                variant="outline"
                onClick={handleAlertCommittee}
                disabled={reportSent}
                className="w-full sm:w-auto font-semibold text-xs h-10 px-4 border-border-light"
              >
                {reportSent ? (
                  <span className="text-brand-green font-bold">Request Logged ✓</span>
                ) : (
                  <span>Request Digitization</span>
                )}
              </Button>
            </div>

            <p className="text-[11px] text-text-subtle pt-2 border-t border-border-light/60">
              Do you have a physical copy of this exam paper? You can take clear photos or scan it to PDF and upload it in 1 tap without any login.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};
