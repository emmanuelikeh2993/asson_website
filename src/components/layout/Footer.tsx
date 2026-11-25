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
                src="/logo/asson_logo.png"
                alt="ASSON Logo"
                className="w-9 h-9 object-contain"
              />
              <span className="w-px h-5 bg-border-light" />
              <img
                src="/logo/ui_crest.jpg"
                alt="University of Ibadan Crest"
                className="w-9 h-9 object-contain rounded"
              />
            </div>
            <p className="font-bold text-text-main text-sm leading-snug">
              Association of Statistics Students of Nigeria (ASSON)
            </p>
            <p className="text-text-muted leading-relaxed max-w-sm">
              University of Ibadan Chapter — organized course outlines, past examination archives, and departmental updates for Statistics students.
            </p>
          </div>

          {/* Section 2: Academic Resources */}
          <div className="md:col-span-3 sm:col-span-6 space-y-2.5">
            <h5 className="font-bold text-text-main text-[11px] uppercase tracking-wider">
              Academic Resources
            </h5>
            <ul className="space-y-2">
              <li>
                <Link to="/resources" className="hover:text-brand-green transition-colors">
                  Course Catalog &amp; Notes
                </Link>
              </li>
              <li>
                <Link to="/past-questions" className="hover:text-brand-green transition-colors">
                  Past Questions
                </Link>
              </li>
              <li>
                <Link to="/notices" className="hover:text-brand-green transition-colors">
                  Notices
                </Link>
              </li>
              <li>
                <Link to="/opportunities" className="hover:text-brand-green transition-colors">
                  Opportunities
                </Link>
              </li>
            </ul>
          </div>

          {/* Section 3: Help & Information */}
          <div className="md:col-span-4 sm:col-span-6 space-y-2.5">
            <h5 className="font-bold text-text-main text-[11px] uppercase tracking-wider">
              Help &amp; Information
            </h5>
            <ul className="space-y-2">
              <li>
                <Link to="/help" className="hover:text-brand-green transition-colors">
                  Platform Guide
                </Link>
              </li>
              <li>
                <Link to="/faqs" className="hover:text-brand-green transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-brand-green transition-colors">
                  Submission Guidelines
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-brand-green transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Concise Institutional Disclaimer */}
        <div className="pt-5 border-t border-border-light/80 text-[11px] text-text-subtle leading-relaxed">
          <p>
            <strong className="text-text-muted">Institutional Disclaimer:</strong> ASSON UI is a student-run academic resource initiative of the Association of Statistics Students of Nigeria (ASSON), University of Ibadan Chapter, and is not an official administrative portal of the University of Ibadan.
          </p>
        </div>

        {/* Minimal Bottom Bar */}
        <div className="pt-4 mt-4 border-t border-border-light/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-text-subtle">
          <p>© {new Date().getFullYear()} ASSON UI Chapter. All Rights Reserved.</p>
          <p className="font-medium">Facts from Reliable Figures</p>
        </div>
      </div>
    </footer>
  );
};
