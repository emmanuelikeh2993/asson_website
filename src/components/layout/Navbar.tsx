import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, PlusCircle, BookOpen, Bell, Briefcase, HelpCircle, Shield, LayoutDashboard } from 'lucide-react';
import { Button } from '../ui/Button';

interface NavbarProps {
  onOpenSearch: () => void;
  onOpenSubmit: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSearch, onOpenSubmit }) => {
  const location = useLocation();

  const navLinks = [
    { name: 'Resources', path: '/resources' },
    { name: 'Past Questions', path: '/past-questions' },
    { name: 'Notices', path: '/notices' },
    { name: 'Opportunities', path: '/opportunities' },
    { name: 'FAQs', path: '/faqs' },
    { name: 'Dashboard', path: '/dashboard' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border-light bg-surface-card/95 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Department Logo alongside University Crest */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="flex items-center gap-2">
            <img
              src="/logo/asson_logo.png"
              alt="ASSON Logo"
              className="w-9 h-9 object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
            />
            <span className="w-px h-6 bg-border-light" />
            <img
              src="/logo/ui_crest.jpg"
              alt="University of Ibadan Crest"
              className="w-9 h-9 object-contain rounded drop-shadow-sm group-hover:scale-105 transition-transform"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-brand-deep group-hover:text-brand-green transition-colors">
                ASSON UI
              </span>
              <span className="text-[10px] font-semibold uppercase bg-emerald-50 text-brand-green px-1.5 py-0.2 rounded border border-emerald-200">
                Unibadan
              </span>
            </div>
            <span className="text-[10px] text-text-muted font-medium hidden sm:inline-block">
              Dept. of Statistics • Facts from Reliable Figures
            </span>
          </div>
        </Link>

        {/* Global Search Bar Trigger (inspired by Image 21) */}
        <div className="flex-1 max-w-md hidden md:block">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3.5 py-1.5 text-xs text-text-muted bg-surface-bg rounded-lg border border-border-light hover:border-brand-green/60 hover:bg-emerald-50/30 transition-all text-left group"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-brand-green group-hover:scale-110 transition-transform" />
              <span>Search STA 211, past questions, notes...</span>
            </div>
            <kbd className="hidden lg:inline-flex items-center gap-0.5 font-mono text-[10px] bg-white border border-border-light px-1.5 py-0.5 rounded text-text-muted shadow-sm">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`text-xs font-semibold px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'text-brand-green bg-brand-light font-bold'
                    : 'text-text-main hover:text-brand-green hover:bg-surface-bg'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Mobile Search Button */}
          <button
            onClick={onOpenSearch}
            className="p-2 text-text-muted hover:text-brand-green hover:bg-surface-bg rounded-lg md:hidden"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Submit Resource CTA */}
          <Button
            size="sm"
            variant="primary"
            onClick={onOpenSubmit}
            className="hidden sm:inline-flex text-xs h-9"
          >
            <PlusCircle className="w-4 h-4 mr-1.5" />
            Submit Material
          </Button>
        </div>
      </div>
    </header>
  );
};

