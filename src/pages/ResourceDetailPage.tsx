import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchResources, incrementResourceDownloads, toggleUserBookmark, fetchUserBookmarks, getCachedStudentProfile } from '../lib/supabase';
import { AcademicResource } from '../types';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { triggerResourceDownload } from '../lib/download';
import { useToast } from '../components/ui/Toast';
import { 
  Download, 
  Share2, 
  Bookmark, 
  Check, 
  ArrowLeft, 
  ShieldCheck, 
  Calendar, 
  FileText, 
  BookOpen, 
  GraduationCap, 
  User, 
  Clock, 
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { formatFileSize, formatDate } from '../lib/utils';

interface ResourceDetailPageProps {
  onOpenSubmit?: () => void;
}

export const ResourceDetailPage: React.FC<ResourceDetailPageProps> = ({ onOpenSubmit }) => {
  const { id } = useParams<{ id: string }>();
  const [resource, setResource] = useState<AcademicResource | null>(null);
  const [relatedResources, setRelatedResources] = useState<AcademicResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    fetchResources().then((all) => {
      const found = all.find((r) => r.id === id || r.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === id);
      if (found) {
        setResource(found);
        // Find related papers from the same course code
        const related = all.filter((r) => r.id !== found.id && r.courseCode === found.courseCode).slice(0, 4);
        setRelatedResources(related);

        // Dynamic Document Meta for WhatsApp and Social Previews
        document.title = `${found.courseCode} — ${found.title} (${found.session}) | ASSON UI`;
      }
      setIsLoading(false);
    });

    // Check bookmark state
    const user = getCachedStudentProfile();
    fetchUserBookmarks(user?.id).then((bmarks) => {
      if (id && bmarks.includes(id)) {
        setIsBookmarked(true);
      }
    });
  }, [id]);

  const handleDownload = () => {
    if (!resource) return;
    triggerResourceDownload(resource, (title, message) => {
      toast.success(title, message);
    });
  };

  const handleCopyLink = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      toast.success('Link Copied', 'Direct shareable link copied to clipboard.');
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      toast.info('Direct Link', url);
    }
  };

  const handleWhatsAppShare = () => {
    if (!resource) return;
    const text = encodeURIComponent(
      `📚 *${resource.courseCode}: ${resource.title}* (${resource.session})\n` +
      `Verified ${resource.type} on the ASSON UI Academic Platform.\n\n` +
      `Direct link to view & download:\n${window.location.href}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleToggleBookmark = async () => {
    if (!resource) return;
    const user = getCachedStudentProfile();
    const newStatus = await toggleUserBookmark(resource.id, user?.id);
    setIsBookmarked(newStatus);
    toast.info(
      newStatus ? 'Saved to Study Locker' : 'Removed from Study Locker',
      newStatus ? `"${resource.title}" is saved for offline review.` : 'Removed from your saved items.'
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 rounded-full border-2 border-brand-green border-t-transparent animate-spin mx-auto mb-4" />
        <p className="text-xs text-text-muted font-medium">Opening verified academic document...</p>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-surface-card border border-border-light flex items-center justify-center mx-auto text-text-muted">
          <FileText className="w-8 h-8 opacity-40" />
        </div>
        <h2 className="text-lg font-bold text-text-main">Academic Document Not Found</h2>
        <p className="text-xs text-text-muted leading-relaxed">
          The requested paper reference may have been updated or merged into another catalog listing.
        </p>
        <Link
          to="/resources"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-green text-white text-xs font-bold shadow-xs hover:bg-brand-deep transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Course Library
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in duration-200">
      {/* Calm Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/resources"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text-main transition-colors py-1.5 px-2.5 rounded-lg hover:bg-surface-card border border-transparent hover:border-border-light"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Catalog</span>
        </Link>

        {/* Quiet Quick Share / Bookmark Actions (WhatsApp / Spotify Style) */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleToggleBookmark}
            className={`p-2 rounded-xl border text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              isBookmarked 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-brand-green border-emerald-300 dark:border-emerald-800' 
                : 'bg-surface-card text-text-muted border-border-light hover:text-text-main'
            }`}
            title={isBookmarked ? 'Saved in Study Locker' : 'Save to Study Locker'}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-brand-green' : ''}`} />
            <span className="hidden sm:inline text-[11px] font-semibold">{isBookmarked ? 'Saved' : 'Save'}</span>
          </button>

          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="p-2 rounded-xl border border-border-light bg-surface-card text-text-muted hover:text-emerald-700 hover:bg-emerald-50/50 transition-colors cursor-pointer flex items-center gap-1.5"
            title="Share on WhatsApp"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline text-[11px] font-semibold">Share</span>
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="p-2 rounded-xl border border-border-light bg-surface-card text-text-muted hover:text-text-main transition-colors cursor-pointer"
            title="Copy Direct Link"
          >
            {copiedLink ? <Check className="w-4 h-4 text-brand-green" /> : <ExternalLink className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Document Showcase Card */}
      <div className="rounded-3xl border border-border-light bg-surface-card p-6 sm:p-8 shadow-card space-y-6">
        {/* Header Tags & Metadata */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-brand-deep dark:text-emerald-300 text-xs font-mono font-extrabold border border-emerald-200 dark:border-emerald-800">
              {resource.courseCode}
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-surface-bg text-text-muted text-[11px] font-bold border border-border-light">
              {resource.level} Level
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-surface-bg text-text-muted text-[11px] font-bold border border-border-light font-mono">
              {resource.session}
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-[11px] font-bold border border-blue-200 dark:border-blue-800">
              {resource.type}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-text-main tracking-tight leading-snug">
            {resource.title}
          </h1>

          <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
            {resource.courseTitle} • Semester {resource.semester} Curriculum
          </p>
        </div>

        {/* Primary Download Action Bar (WhatsApp Calm Design) */}
        <div className="p-4 rounded-2xl bg-surface-bg border border-border-light flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-brand-green flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-text-main block">
                Official Document ({resource.fileType})
              </span>
              <span className="text-[11px] text-text-muted">
                {formatFileSize(resource.fileSizeBytes)} • {resource.downloadsCount || 0} downloads
              </span>
            </div>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={handleDownload}
            className="w-full sm:w-auto justify-center font-bold text-xs h-10 px-5 shadow-sm active:scale-98"
          >
            <Download className="w-4 h-4 mr-1.5" /> Download Paper ({resource.fileType})
          </Button>
        </div>

        {/* Document Specifications & Institutional Verification Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border-light/60 text-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold">
              <ShieldCheck className="w-4 h-4 text-brand-green" />
              <span>Verified Academic Record</span>
            </div>
            <p className="text-[11px] text-text-muted leading-relaxed">
              Curated and verified for accuracy by the ASSON Academic Editorial Committee. Formatted for clear mobile viewing and offline study.
            </p>
          </div>

          <div className="space-y-1.5 text-text-muted">
            <div className="flex justify-between py-1 border-b border-border-light/40">
              <span>Contributor Credit:</span>
              <strong className="text-text-main">{resource.contributorName || 'ASSON Academic Committee'}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-border-light/40">
              <span>Catalog Checked:</span>
              <span className="font-mono text-text-main">{resource.lastCheckedDate}</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Access License:</span>
              <span className="text-text-main">Open Academic Fair Use (UI)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Course Materials Tray */}
      {relatedResources.length > 0 && (
        <div className="space-y-3 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-text-main tracking-tight">
              More Materials for {resource.courseCode}
            </h3>
            <Link
              to={`/resources?course=${encodeURIComponent(resource.courseCode)}`}
              className="text-xs font-semibold text-brand-green hover:underline inline-flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowLeft className="w-3 h-3 rotate-180" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {relatedResources.map((rel) => (
              <Link
                key={rel.id}
                to={`/resources/${rel.id}`}
                className="p-3.5 rounded-2xl border border-border-light bg-surface-card hover:border-brand-green/40 transition-all flex items-start justify-between gap-3 group shadow-2xs"
              >
                <div className="space-y-1 min-w-0">
                  <span className="text-[10px] font-mono font-bold text-brand-deep dark:text-emerald-400 block">
                    {rel.session} • {rel.type}
                  </span>
                  <h4 className="text-xs font-bold text-text-main group-hover:text-brand-green transition-colors truncate">
                    {rel.title}
                  </h4>
                  <span className="text-[10px] text-text-subtle block">
                    {formatFileSize(rel.fileSizeBytes)}
                  </span>
                </div>
                <div className="p-1.5 rounded-lg bg-surface-bg text-text-muted group-hover:text-brand-green shrink-0">
                  <Download className="w-3.5 h-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

