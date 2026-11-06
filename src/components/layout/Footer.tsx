import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ExternalLink, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border-light bg-surface-card pt-12 pb-16 lg:pb-12 mt-16 text-xs text-text-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Brand & Logos */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <img
                src="/logo/asson_logo.png"
                alt="ASSON Logo"
                className="w-10 h-10 object-contain"
              />
              <span className="w-px h-6 bg-border-light" />
              <img
                src="/logo/ui_crest.jpg"
                alt="UI Crest"
                className="w-10 h-10 object-contain rounded"
              />
            </div>
            <p className="font-semibold text-text-main text-sm">
              Association of Statistics Students of Nigeria (ASSON)
            </p>
            <p className="text-text-muted leading-relaxed">
              University of Ibadan Chapter. Dedicated to academic excellence, verified student resources, and quantitative career readiness.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-2.5">
            <h5 className="font-semibold text-text-main text-xs uppercase tracking-wider">
              Academic Engine
            </h5>
            <ul className="space-y-1.5">
              <li>
                <Link to="/resources" className="hover:text-brand-green transition-colors">
                  Course Catalog & Notes
                </Link>
              </li>
              <li>
                <Link to="/past-questions" className="hover:text-brand-green transition-colors">
                  Past Examination Questions
                </Link>
              </li>
              <li>
                <Link to="/notices" className="hover:text-brand-green transition-colors">
                  Departmental Notice Board
                </Link>
              </li>
              <li>
                <Link to="/opportunities" className="hover:text-brand-green transition-colors">
                  Scholarships & Internships
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Student Support */}
          <div className="space-y-2.5">
            <h5 className="font-semibold text-text-main text-xs uppercase tracking-wider">
              Support & Community
            </h5>
            <ul className="space-y-1.5">
              <li>
                <Link to="/help" className="hover:text-brand-green font-semibold text-text-main transition-colors">
                  Where to Get Help & Support
                </Link>
              </li>
              <li>
                <Link to="/faqs" className="hover:text-brand-green transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-brand-green transition-colors">
                  Student Submission Tracker
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-brand-green transition-colors">
                  Terms of Academic Contribution
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-brand-green transition-colors">
                  Student Privacy Policy
                </Link>
              </li>
              <li>
                <a 
                  href="https://student-portal.ui.edu.ng/login" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="hover:text-brand-green transition-colors inline-flex items-center gap-1"
                >
                  UI Student Portal <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a 
                  href="https://www.instagram.com/asson_unibadan/" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="hover:text-brand-green transition-colors inline-flex items-center gap-1"
                >
                  ASSON Instagram (@asson_unibadan) <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Verified Contact */}
          <div className="space-y-2.5">
            <h5 className="font-semibold text-text-main text-xs uppercase tracking-wider">
              Official Contact
            </h5>
            <p className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
              <span>Department of Statistics, Faculty of Science, University of Ibadan, Oyo State, Nigeria.</span>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-brand-green shrink-0" />
              <span>asson@ui.edu.ng</span>
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-green" />
                Verified ASSON UI Platform V1.0
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-border-light flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <p>© {new Date().getFullYear()} ASSON Unibadan Chapter. All Rights Reserved.</p>
          <div className="flex items-center gap-1 text-text-subtle">
            <span>Motto: Facts from Reliable Figures</span>
            <Link
              to="/console"
              className="inline-block text-text-subtle/40 hover:text-text-muted transition-colors text-xs px-0.5 select-none"
              title=""
              aria-label="Executive Portal"
            >
              •
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

