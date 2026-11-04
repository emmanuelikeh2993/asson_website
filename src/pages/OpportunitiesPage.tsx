import React, { useState, useEffect } from 'react';
import { MOCK_OPPORTUNITIES } from '../lib/mockData';
import { fetchOpportunities } from '../lib/supabase';
import { Opportunity, OpportunityCategory } from '../types';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { GraduationCap, Briefcase, Calendar, MapPin, ExternalLink, CheckCircle2 } from 'lucide-react';
import { formatDate } from '../lib/utils';

export const OpportunitiesPage: React.FC = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>(MOCK_OPPORTUNITIES);
  const [activeCategory, setActiveCategory] = useState<OpportunityCategory | 'All'>('All');

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-light mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-brand-green">
              <GraduationCap className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-text-main tracking-tight">
              Scholarships & Internships
            </h1>
          </div>
          <p className="text-xs text-text-muted">
            Verified funding, federal scholarship grants, and quantitative data internships for Statistics students.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center rounded-xl border border-border-light bg-surface-card p-1 text-xs">
          {(['All', 'Scholarship', 'Internship'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${activeCategory === cat
                  ? 'bg-brand-green text-white shadow-sm font-semibold'
                  : 'text-text-muted hover:text-text-main'
                }`}
            >
              {cat === 'All' ? 'All Opportunities' : `${cat}s`}
            </button>
          ))}
        </div>
      </div>

      {/* Opportunities Card Grid (inspired by Image 14) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredOpportunities.map((opp) => (
          <div
            key={opp.id}
            className="p-6 rounded-2xl border border-border-light bg-surface-card shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-bold text-brand-deep tracking-wider uppercase">
                  {opp.provider}
                </span>
                <Badge variant={opp.isVerified ? 'verified' : 'neutral'} withIcon>
                  {opp.isVerified ? 'Verified Grant' : 'Unverified'}
                </Badge>
              </div>

              <h3 className="text-base font-bold text-text-main mb-2 group-hover:text-brand-green transition-colors">
                {opp.title}
              </h3>

              <p className="text-xs text-text-muted leading-relaxed mb-4">
                {opp.description}
              </p>

              {/* Eligibility Box */}
              <div className="p-3 rounded-lg bg-surface-bg border border-border-light text-xs text-text-main space-y-1 mb-4">
                <span className="font-semibold text-brand-deep block">Eligibility:</span>
                <p className="text-text-muted text-[11px] leading-relaxed">
                  {opp.eligibility}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-border-light/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1 text-text-muted text-[11px]">
                <div className="flex items-center gap-1.5 font-medium text-brand-red">
                  <Calendar className="w-3.5 h-3.5" />
                  Deadline: {formatDate(opp.deadline)}
                </div>
                {opp.location && (
                  <div className="flex items-center gap-1.5 text-text-muted">
                    <MapPin className="w-3.5 h-3.5" />
                    {opp.location}
                  </div>
                )}
              </div>

              <a
                href={opp.applicationUrl}
                target="_blank"
                rel="noreferrer"
                className="shrink-0"
              >
                <Button size="sm" variant="primary" className="w-full sm:w-auto text-xs">
                  Apply Official Portal <ExternalLink className="w-3 h-3 ml-1.5" />
                </Button>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

