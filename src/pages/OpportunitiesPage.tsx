import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MOCK_OPPORTUNITIES } from '../lib/mockData';
import { fetchOpportunities } from '../lib/supabase';
import { Opportunity, OpportunityCategory } from '../types';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { 
  GraduationCap, 
  Briefcase, 
  Calendar, 
  MapPin, 
  ExternalLink, 
  CheckCircle2, 
  Share2,
  Sparkles
} from 'lucide-react';
import { formatDate } from '../lib/utils';
import { useToast } from '../components/ui/Toast';
import { sanitizeSafeHttpUrl } from '../lib/validation';

function getDomainFromUrl(url?: string): string {
  if (!url) return 'Official Portal';
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return 'Official Portal';
  }
}

export const OpportunitiesPage: React.FC = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>(MOCK_OPPORTUNITIES);
  const [activeCategory, setActiveCategory] = useState<OpportunityCategory | 'All'>('All');
  const [showExpired, setShowExpired] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const toast = useToast();

  const loadOpportunities = () => {
    setLoadError(false);
    fetchOpportunities()
      .then((data) => {
        if (data && data.length > 0) {
          setOpportunities(data);
        } else if (typeof navigator !== 'undefined' && !navigator.onLine) {
          setLoadError(true);
        }
      })
      .catch(() => {
        setLoadError(true);
      });
  };

  useEffect(() => {
    loadOpportunities();
  }, []);

  const filteredOpportunities = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const seen = new Set<string>();
    return opportunities
      .map((o) => {
        const parsedDeadline = o.deadline ? new Date(o.deadline) : null;
        const pastDeadline = parsedDeadline && !Number.isNaN(parsedDeadline.getTime())
          ? parsedDeadline < startOfToday
          : false;
        return { ...o, isExpired: Boolean(o.isExpired) || pastDeadline };
      })
      .filter((o) => {
        if (!showExpired && o.isExpired) return false;
        if (activeCategory !== 'All' && o.category !== activeCategory) return false;
        const dedupeKey = `${o.provider.toLowerCase().trim()}|${o.title.toLowerCase().trim()}`;
        if (seen.has(dedupeKey)) return false;
        seen.add(dedupeKey);
        return true;
      });
  }, [opportunities, activeCategory, showExpired]);

  const handleShareOpportunity = (opp: Opportunity) => {
    if (navigator.share) {
      navigator.share({
        title: opp.title,
        text: `Check out ${opp.title} by ${opp.provider} on ASSON UI Portal:`,
        url: opp.applicationUrl || window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${opp.title} (${opp.provider}): ${opp.applicationUrl}`);
      toast.info('Copied', 'Opportunity link copied to clipboard');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 pb-28">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-light mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-brand-green">
              <GraduationCap className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-text-main tracking-tight">
              Scholarships & Quantitative Internships
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-text-muted">
            Curated funding, scholarships, and quantitative internships for Statistics scholars. Always confirm final deadlines on the official source portal.
          </p>
        </div>

        {/* Tab Toggle & Expired Filter */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center rounded-xl border border-border-light bg-surface-card p-1 text-xs shadow-xs">
            {(['All', 'Scholarship', 'Internship'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 min-h-[44px] sm:min-h-[36px] rounded-lg font-bold transition-all duration-150 active:scale-95 cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-brand-green text-white shadow-xs'
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                {cat === 'All' ? 'All Opportunities' : `${cat}s`}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowExpired((prev) => !prev)}
            aria-pressed={showExpired}
            className={`px-3 py-1.5 min-h-[44px] sm:min-h-[36px] rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
              showExpired
                ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200'
                : 'bg-surface-card border-border-light text-text-muted hover:text-text-main'
            }`}
          >
            {showExpired ? 'Showing Expired' : 'Include Expired'}
          </button>
        </div>
      </div>

      {/* Opportunities Card Grid / Error & Clean Empty State */}
      {loadError && filteredOpportunities.length === 0 ? (
        <div className="py-16 px-4 text-center rounded-3xl border border-dashed border-amber-300 dark:border-amber-700 bg-surface-card max-w-xl mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 flex items-center justify-center mx-auto border border-amber-200 dark:border-amber-800 shadow-2xs">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-text-main">
              Unable to load opportunities
            </h3>
            <p className="text-xs sm:text-sm text-text-muted max-w-md mx-auto leading-relaxed">
              Check your internet connection and retry fetching the latest verified scholarships, grants, and internships.
            </p>
          </div>
          <Button type="button" size="sm" variant="primary" onClick={loadOpportunities}>
            Retry
          </Button>
        </div>
      ) : filteredOpportunities.length === 0 ? (
        <div className="py-16 px-4 text-center rounded-3xl border border-dashed border-border-light bg-surface-card max-w-xl mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-brand-deep dark:text-emerald-300 flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800 shadow-2xs">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-text-main">
              No Opportunities Listed Currently
            </h3>
            <p className="text-xs sm:text-sm text-text-muted max-w-md mx-auto leading-relaxed">
              There are no active {activeCategory !== 'All' ? activeCategory.toLowerCase() : 'grant, scholarship, or internship'} listings posted at this moment. Verified corporate sponsorships, federal scholarships, and statistical research fellowships will appear here when officially announced and vetted.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredOpportunities.map((opp) => {
            const safeApplyUrl = sanitizeSafeHttpUrl(opp.applicationUrl);
            const sourceDomain = getDomainFromUrl(opp.applicationUrl);
            return (
              <div
                key={opp.id}
                className={`p-6 rounded-3xl border bg-surface-card shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between group ${
                  opp.isExpired ? 'border-amber-200 dark:border-amber-800/70 opacity-85' : 'border-border-light'
                }`}
              >
                <div>
                  {/* Provider & Source Attribution Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-brand-deep dark:text-emerald-300 tracking-wider uppercase">
                        {opp.provider}
                      </span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-brand-green border border-emerald-200 dark:border-emerald-800">
                        {sourceDomain}
                      </span>
                    </div>
                    {opp.isExpired ? (
                      <Badge variant="neutral">Expired</Badge>
                    ) : (
                      <Badge variant={opp.isVerified ? 'verified' : 'neutral'} withIcon>
                        {opp.isVerified ? 'Verified Source' : 'Curated Listing'}
                      </Badge>
                    )}
                  </div>

                  {/* Title */}
                  <h2 className="text-base font-bold text-text-main mb-2 group-hover:text-brand-green transition-colors leading-snug">
                    {opp.title}
                  </h2>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-text-muted leading-relaxed mb-4">
                    {opp.description}
                  </p>

                  {/* Eligibility Box */}
                  <div className="p-3.5 rounded-xl bg-surface-bg border border-border-light text-xs text-text-main space-y-1 mb-4">
                    <span className="font-bold text-brand-deep dark:text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-green" aria-hidden="true" /> Candidate Eligibility:
                    </span>
                    <p className="text-text-muted text-xs leading-relaxed">
                      {opp.eligibility}
                    </p>
                  </div>
                </div>

                {/* Card Footer: Dates, Report Link & Buttons */}
                <div className="pt-4 border-t border-border-light/60 space-y-3 text-xs mt-auto">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-text-muted text-xs">
                    <div className="space-y-1">
                      <div className={`flex items-center gap-1.5 font-semibold ${opp.isExpired ? 'text-amber-800 dark:text-amber-300' : 'text-brand-red'}`}>
                        <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                        {opp.isExpired ? `Expired (${formatDate(opp.deadline)})` : `Deadline: ${formatDate(opp.deadline)}`}
                      </div>
                      <div className="flex items-center gap-1.5 text-text-subtle font-medium">
                        <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{opp.location} • {opp.category}</span>
                        {opp.postedDate && (
                          <>
                            <span aria-hidden="true">•</span>
                            <span>Checked {formatDate(opp.postedDate)}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <Link
                      to="/help"
                      className="inline-flex items-center min-h-[44px] sm:min-h-[32px] px-2 text-xs font-semibold text-text-subtle hover:text-brand-green underline-offset-2 hover:underline"
                    >
                      Report outdated
                    </Link>
                  </div>

                  {/* Action Row */}
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleShareOpportunity(opp)}
                      className="min-w-[44px] min-h-[44px] flex items-center justify-center text-text-subtle hover:text-brand-green hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-xl border border-border-light transition-colors cursor-pointer"
                      title="Share Opportunity"
                      aria-label={`Share ${opp.title}`}
                    >
                      <Share2 className="w-4 h-4" aria-hidden="true" />
                    </button>

                    {safeApplyUrl ? (
                      <a
                        href={safeApplyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-4 min-h-[44px] sm:min-h-[38px] rounded-xl bg-brand-green hover:bg-brand-deep text-white text-xs font-bold shadow-xs hover:shadow transition-all"
                      >
                        <span>Visit {sourceDomain}</span>
                        <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                      </a>
                    ) : (
                      <span className="inline-flex items-center px-3 min-h-[38px] rounded-xl bg-surface-bg border border-border-light text-xs font-medium text-text-muted">
                        Official link pending verification
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
