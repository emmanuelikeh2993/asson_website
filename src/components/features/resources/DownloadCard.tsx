import React from 'react';
import { Link } from 'react-router-dom';
import { AcademicResource } from '../../../types';
import { FileText, Download, ArrowUpRight, BookOpen } from 'lucide-react';
import { triggerResourceDownload } from '../../../lib/download';
import { useToast } from '../../ui/Toast';

interface DownloadCardProps {
  resource: AcademicResource;
  onPreview: (resource: AcademicResource) => void;
  onReport?: (resource: AcademicResource) => void;
}

export interface CourseTheme {
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  iconBg: string;
  iconColor: string;
  cardHighlight: string;
  hoverBorder: string;
  accentBar: string;
}

export const getCourseTheme = (courseCode: string): CourseTheme => {
  const code = (courseCode || '').toUpperCase().trim();

  // Consistent, deterministic color identity by course code
  if (code.includes('111')) {
    return {
      badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40',
      badgeText: 'text-emerald-800 dark:text-emerald-200',
      badgeBorder: 'border-emerald-200 dark:border-emerald-800',
      iconBg: 'bg-emerald-100/80 dark:bg-emerald-900/40',
      iconColor: 'text-emerald-700 dark:text-emerald-300',
      cardHighlight: 'border-l-emerald-500',
      hoverBorder: 'hover:border-emerald-400 dark:hover:border-emerald-600',
      accentBar: 'bg-emerald-500',
    };
  }
  if (code.includes('121') || code.includes('131')) {
    return {
      badgeBg: 'bg-teal-50 dark:bg-teal-950/40',
      badgeText: 'text-teal-800 dark:text-teal-200',
      badgeBorder: 'border-teal-200 dark:border-teal-800',
      iconBg: 'bg-teal-100/80 dark:bg-teal-900/40',
      iconColor: 'text-teal-700 dark:text-teal-300',
      cardHighlight: 'border-l-teal-500',
      hoverBorder: 'hover:border-teal-400 dark:hover:border-teal-600',
      accentBar: 'bg-teal-500',
    };
  }
  if (code.includes('211')) {
    return {
      badgeBg: 'bg-sky-50 dark:bg-sky-950/40',
      badgeText: 'text-sky-800 dark:text-sky-200',
      badgeBorder: 'border-sky-200 dark:border-sky-800',
      iconBg: 'bg-sky-100/80 dark:bg-sky-900/40',
      iconColor: 'text-sky-700 dark:text-sky-300',
      cardHighlight: 'border-l-sky-500',
      hoverBorder: 'hover:border-sky-400 dark:hover:border-sky-600',
      accentBar: 'bg-sky-500',
    };
  }
  if (code.includes('221') || code.includes('231')) {
    return {
      badgeBg: 'bg-blue-50 dark:bg-blue-950/40',
      badgeText: 'text-blue-800 dark:text-blue-200',
      badgeBorder: 'border-blue-200 dark:border-blue-800',
      iconBg: 'bg-blue-100/80 dark:bg-blue-900/40',
      iconColor: 'text-blue-700 dark:text-blue-300',
      cardHighlight: 'border-l-blue-500',
      hoverBorder: 'hover:border-blue-400 dark:hover:border-blue-600',
      accentBar: 'bg-blue-500',
    };
  }
  if (code.includes('311') || code.includes('321')) {
    return {
      badgeBg: 'bg-purple-50 dark:bg-purple-950/40',
      badgeText: 'text-purple-800 dark:text-purple-200',
      badgeBorder: 'border-purple-200 dark:border-purple-800',
      iconBg: 'bg-purple-100/80 dark:bg-purple-900/40',
      iconColor: 'text-purple-700 dark:text-purple-300',
      cardHighlight: 'border-l-purple-500',
      hoverBorder: 'hover:border-purple-400 dark:hover:border-purple-600',
      accentBar: 'bg-purple-500',
    };
  }
  if (code.includes('331') || code.includes('341')) {
    return {
      badgeBg: 'bg-indigo-50 dark:bg-indigo-950/40',
      badgeText: 'text-indigo-800 dark:text-indigo-200',
      badgeBorder: 'border-indigo-200 dark:border-indigo-800',
      iconBg: 'bg-indigo-100/80 dark:bg-indigo-900/40',
      iconColor: 'text-indigo-700 dark:text-indigo-300',
      cardHighlight: 'border-l-indigo-500',
      hoverBorder: 'hover:border-indigo-400 dark:hover:border-indigo-600',
      accentBar: 'bg-indigo-500',
    };
  }
  if (code.includes('411') || code.includes('421')) {
    return {
      badgeBg: 'bg-amber-50 dark:bg-amber-950/40',
      badgeText: 'text-amber-800 dark:text-amber-200',
      badgeBorder: 'border-amber-200 dark:border-amber-800',
      iconBg: 'bg-amber-100/80 dark:bg-amber-900/40',
      iconColor: 'text-amber-700 dark:text-amber-300',
      cardHighlight: 'border-l-amber-500',
      hoverBorder: 'hover:border-amber-400 dark:hover:border-amber-600',
      accentBar: 'bg-amber-500',
    };
  }
  if (code.includes('431') || code.includes('451')) {
    return {
      badgeBg: 'bg-orange-50 dark:bg-orange-950/40',
      badgeText: 'text-orange-800 dark:text-orange-200',
      badgeBorder: 'border-orange-200 dark:border-orange-800',
      iconBg: 'bg-orange-100/80 dark:bg-orange-900/40',
      iconColor: 'text-orange-700 dark:text-orange-300',
      cardHighlight: 'border-l-orange-500',
      hoverBorder: 'hover:border-orange-400 dark:hover:border-orange-600',
      accentBar: 'bg-orange-500',
    };
  }
  if (code.includes('MAT')) {
    return {
      badgeBg: 'bg-violet-50 dark:bg-violet-950/40',
      badgeText: 'text-violet-800 dark:text-violet-200',
      badgeBorder: 'border-violet-200 dark:border-violet-800',
      iconBg: 'bg-violet-100/80 dark:bg-violet-900/40',
      iconColor: 'text-violet-700 dark:text-violet-300',
      cardHighlight: 'border-l-violet-500',
      hoverBorder: 'hover:border-violet-400 dark:hover:border-violet-600',
      accentBar: 'bg-violet-500',
    };
  }
  if (code.includes('GES')) {
    return {
      badgeBg: 'bg-rose-50 dark:bg-rose-950/40',
      badgeText: 'text-rose-800 dark:text-rose-200',
      badgeBorder: 'border-rose-200 dark:border-rose-800',
      iconBg: 'bg-rose-100/80 dark:bg-rose-900/40',
      iconColor: 'text-rose-700 dark:text-rose-300',
      cardHighlight: 'border-l-rose-500',
      hoverBorder: 'hover:border-rose-400 dark:hover:border-rose-600',
      accentBar: 'bg-rose-500',
    };
  }

  // Fallback hash for other course codes
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    hash = code.charCodeAt(i) + ((hash << 5) - hash);
  }
  const palettes: CourseTheme[] = [
    {
      badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40',
      badgeText: 'text-emerald-800 dark:text-emerald-200',
      badgeBorder: 'border-emerald-200 dark:border-emerald-800',
      iconBg: 'bg-emerald-100/80 dark:bg-emerald-900/40',
      iconColor: 'text-emerald-700 dark:text-emerald-300',
      cardHighlight: 'border-l-emerald-500',
      hoverBorder: 'hover:border-emerald-400 dark:hover:border-emerald-600',
      accentBar: 'bg-emerald-500',
    },
    {
      badgeBg: 'bg-sky-50 dark:bg-sky-950/40',
      badgeText: 'text-sky-800 dark:text-sky-200',
      badgeBorder: 'border-sky-200 dark:border-sky-800',
      iconBg: 'bg-sky-100/80 dark:bg-sky-900/40',
      iconColor: 'text-sky-700 dark:text-sky-300',
      cardHighlight: 'border-l-sky-500',
      hoverBorder: 'hover:border-sky-400 dark:hover:border-sky-600',
      accentBar: 'bg-sky-500',
    },
    {
      badgeBg: 'bg-purple-50 dark:bg-purple-950/40',
      badgeText: 'text-purple-800 dark:text-purple-200',
      badgeBorder: 'border-purple-200 dark:border-purple-800',
      iconBg: 'bg-purple-100/80 dark:bg-purple-900/40',
      iconColor: 'text-purple-700 dark:text-purple-300',
      cardHighlight: 'border-l-purple-500',
      hoverBorder: 'hover:border-purple-400 dark:hover:border-purple-600',
      accentBar: 'bg-purple-500',
    },
    {
      badgeBg: 'bg-amber-50 dark:bg-amber-950/40',
      badgeText: 'text-amber-800 dark:text-amber-200',
      badgeBorder: 'border-amber-200 dark:border-amber-800',
      iconBg: 'bg-amber-100/80 dark:bg-amber-900/40',
      iconColor: 'text-amber-700 dark:text-amber-300',
      cardHighlight: 'border-l-amber-500',
      hoverBorder: 'hover:border-amber-400 dark:hover:border-amber-600',
      accentBar: 'bg-amber-500',
    },
  ];
  return palettes[Math.abs(hash) % palettes.length];
};

export const DownloadCard: React.FC<DownloadCardProps> = ({
  resource,
  onPreview,
}) => {
  const toast = useToast();
  const theme = getCourseTheme(resource.courseCode);

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
      className={`group relative flex flex-col justify-between rounded-2xl border border-border-light bg-surface-card p-4 sm:p-5 transition-all duration-200 hover:shadow-card-hover ${theme.hoverBorder} cursor-pointer active:scale-[0.99] border-l-4 ${theme.cardHighlight}`}
    >
      <div>
        {/* Top Header: Course identity pill with session, and quiet download icon */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border tracking-tight ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}
            >
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
      <div className="pt-3 border-t border-border-light/50 flex items-center justify-between gap-2 mt-auto">
        <span className="text-[11px] font-semibold text-text-subtle">
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
