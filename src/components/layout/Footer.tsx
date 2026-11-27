import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border-light bg-surface-card pt-10 pb-20 lg:pb-10 mt-16 text-xs text-text-muted w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 3-Section Minimal Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8">
          {/* Section 1: ASSON Identity & Brief Description */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <img
                src="/logo/asson_logo.webp"
                alt="ASSON Logo"
                width={36}
                height={36}
                loading="lazy"
                className="w-9 h-9 object-contain"
              />
              <span className="w-px h-5 bg-border-light" aria-hidden="true" />
              <img
                src="/logo/ui_crest.webp"
                alt="University of Ibadan Crest"
                width={36}
                height={36}
                loading="lazy"
                className="w-9 h-9 object-contain rounded"
              />
            </div>
            <p className="font-bold text-text-main text-sm leading-snug">
              Association of Statistics Students of Nigeria (ASSON)
            </p>
            <p className="text-sm text-text-muted leading-relaxed max-w-sm">
              University of Ibadan Chapter — organized course outlines, past examination archives, and departmental updates for Statistics students.
            </p>
          </div>

          {/* Section 2: Academic Resources */}
          <div className="md:col-span-3 sm:col-span-6 space-y-1.5">
            <h2 className="font-bold text-text-main text-xs uppercase tracking-wider">
              Academic Resources
            </h2>
            <ul className="space-y-0">
              <li>
                <Link to="/resources" className="inline-flex items-center min-h-[44px] hover:text-brand-green transition-colors">
                  Course Catalog &amp; Notes
                </Link>
              </li>
              <li>
                <Link to="/past-questions" className="inline-flex items-center min-h-[44px] hover:text-brand-green transition-colors">
                  Past Questions
                </Link>
              </li>
              <li>
                <Link to="/notices" className="inline-flex items-center min-w-[44px] min-h-[44px] hover:text-brand-green transition-colors">
                  Notices
                </Link>
              </li>
              <li>
                <Link to="/opportunities" className="inline-flex items-center min-h-[44px] hover:text-brand-green transition-colors">
                  Opportunities
                </Link>
              </li>
            </ul>
          </div>

          {/* Section 3: Help & Information */}
          <div className="md:col-span-4 sm:col-span-6 space-y-1.5">
            <h2 className="font-bold text-text-main text-xs uppercase tracking-wider">
              Help &amp; Information
            </h2>
            <ul className="space-y-0">
              <li>
                <Link to="/help" className="inline-flex items-center min-h-[44px] hover:text-brand-green transition-colors">
                  Platform Guide
                </Link>
              </li>
              <li>
                <Link to="/faqs" className="inline-flex items-center min-w-[44px] min-h-[44px] hover:text-brand-green transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link to="/terms" className="inline-flex items-center min-h-[44px] hover:text-brand-green transition-colors">
                  Submission Guidelines
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="inline-flex items-center min-h-[44px] hover:text-brand-green transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Concise Institutional Disclaimer */}
        <div className="pt-5 border-t border-border-light/80 text-xs text-text-subtle leading-relaxed">
          <p>
            <strong className="text-text-muted">Institutional Disclaimer:</strong> ASSON UI is a student-run academic resource initiative of the Association of Statistics Students of Nigeria (ASSON), University of Ibadan Chapter, and is not an official administrative portal of the University of Ibadan.
          </p>
        </div>

        {/* Minimal Bottom Bar */}
        <div className="pt-4 mt-4 border-t border-border-light/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-text-subtle">
          <p>© {new Date().getFullYear()} ASSON UI Chapter. All Rights Reserved.</p>
          <p className="font-medium">Facts from Reliable Figures</p>
        </div>
      </div>
    </footer>
  );
};
