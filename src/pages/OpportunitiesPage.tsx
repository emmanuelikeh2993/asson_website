import React, { useState, useEffect } from 'react';
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
  const toast = useToast();

  useEffect(() => {
    fetchOpportunities().then((data) => {
      if (data && data.length > 0) {
        setOpportunities(data);
      }
    });
  }, []);

  const filteredOpportunities = opportunities.filter(
    (o) => activeCategory === 'All' || o.category === activeCategory
  );

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
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6">
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
          <p className="text-xs text-text-muted">
            Verified corporate funding, federal scholarship awards, and quantitative data internships for Statistics scholars.
          </p>
        </div>

        {/* Tab Toggle - Ordered and Clean */}
        <div className="flex items-center rounded-xl border border-border-light bg-surface-card p-1 text-xs self-start sm:self-auto shadow-xs">
          {(['All', 'Scholarship', 'Internship'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all duration-150 active:scale-95 cursor-pointer ${
                activeCategory === cat
                  ? 'bg-brand-green text-white shadow-xs'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              {cat === 'All' ? 'All Opportunities' : `${cat}s`}
            </button>
          ))}
        </div>
      </div>

      {/* Opportunities Card Grid / Clean Empty State */}
      {filteredOpportunities.length === 0 ? (
        <div className="py-16 px-4 text-center rounded-3xl border border-dashed border-border-light bg-surface-card max-w-xl mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-brand-green flex items-center justify-center mx-auto border border-emerald-200 shadow-2xs">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-text-main">
              No Opportunities Listed Currently
            </h3>
            <p className="text-xs text-text-muted max-w-md mx-auto leading-relaxed">
              There are no active {activeCategory !== 'All' ? activeCategory.toLowerCase() : 'grant, scholarship, or internship'} listings posted at this moment. Verified corporate sponsorships, federal scholarships, and statistical research fellowships will appear here when officially announced and vetted.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredOpportunities.map((opp) => (
            <div
              key={opp.id}
              className="p-6 rounded-3xl border border-border-light bg-surface-card shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Provider & Verification Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-brand-deep tracking-wider uppercase">
                      {opp.provider}
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-brand-green border border-emerald-100">
                      {getDomainFromUrl(opp.applicationUrl)}
                    </span>
                  </div>
                  <Badge variant={opp.isVerified ? 'verified' : 'neutral'} withIcon>
                    {opp.isVerified ? 'Verified Grant' : 'Unverified'}
                  </Badge>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-text-main mb-2 group-hover:text-brand-green transition-colors leading-snug">
                  {opp.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-text-muted leading-relaxed mb-4">
                  {opp.description}
                </p>

                {/* Eligibility Box */}
                <div className="p-3.5 rounded-xl bg-surface-bg border border-border-light text-xs text-text-main space-y-1 mb-4">
                  <span className="font-bold text-brand-deep flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-green" /> Candidate Eligibility:
                  </span>
                  <p className="text-text-muted text-[11px] leading-relaxed">
                    {opp.eligibility}
                  </p>
                </div>
              </div>

              {/* Card Footer: Metadata & Buttons */}
              <div className="pt-4 border-t border-border-light/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs mt-auto">
                <div className="space-y-1 text-text-muted text-[11px]">
                  <div className="flex items-center gap-1.5 font-semibold text-brand-red">
                    <Calendar className="w-3.5 h-3.5" />
                    Deadline: {formatDate(opp.deadline)}
                  </div>
                  <div className="flex items-center gap-1.5 text-text-subtle font-medium">
                    <MapPin className="w-3.5 h-3.5" />
                    {opp.location} • {opp.category}
                  </div>
                </div>

                {/* Buttons: Consistent Order -> Share (Secondary) | Apply (Primary) */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleShareOpportunity(opp)}
                    className="p-2 text-text-subtle hover:text-brand-green hover:bg-emerald-50 rounded-xl border border-border-light transition-colors"
                    title="Share Opportunity"
                    aria-label="Share Opportunity"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>

                  <a
                    href={opp.applicationUrl || 'https://www.icanstudent.com/opportunities/'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block"
                  >
                    <Button size="sm" variant="primary" className="text-xs h-9 font-bold shadow-xs hover:shadow">
                      Apply on {getDomainFromUrl(opp.applicationUrl)} <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
