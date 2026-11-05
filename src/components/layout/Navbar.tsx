import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Search,
  PlusCircle,
  Menu,
  X,
  BookOpen,
  FileText,
  Bell,
  GraduationCap,
  HelpCircle,
  User,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Button } from '../ui/Button';

interface NavbarProps {
  onOpenSearch: () => void;
  onOpenSubmit: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSearch, onOpenSubmit }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Resources', path: '/resources', icon: BookOpen },
    { name: 'Past Questions', path: '/past-questions', icon: FileText },
    { name: 'Notices', path: '/notices', icon: Bell },
    { name: 'Opportunities', path: '/opportunities', icon: GraduationCap },
    { name: 'FAQs', path: '/faqs', icon: HelpCircle },
    { name: 'Dashboard', path: '/dashboard', icon: User },
  ];

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border-light bg-surface-card/95 backdrop-blur-md transition-all shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Brand & Department Logo alongside University Crest */}
          <Link to="/" className="flex items-center gap-2 sm:gap-2.5 shrink-0 group">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <img
                src="/logo/asson_logo.png"
                alt="ASSON Logo"
                className="w-8 h-8 sm:w-9 sm:h-9 object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
              />
              <span className="w-px h-5 sm:h-6 bg-border-light" />
              <img
                src="/logo/ui_crest.jpg"
                alt="University of Ibadan Crest"
                className="w-8 h-8 sm:w-9 sm:h-9 object-contain rounded drop-shadow-sm group-hover:scale-105 transition-transform"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-brand-deep group-hover:text-brand-green transition-colors">
                  ASSON UI
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase bg-emerald-50 text-brand-green px-1.5 py-0.5 rounded border border-emerald-200">
                  Unibadan
                </span>
              </div>
              <span className="text-[10px] text-text-muted font-medium hidden sm:inline-block">
                Dept. of Statistics • Facts from Reliable Figures
              </span>
            </div>
          </Link>

          {/* Global Search Bar Trigger (Desktop) */}
          <div className="flex-1 max-w-md hidden md:block">
            <button
              onClick={onOpenSearch}
              className="w-full flex items-center justify-between px-3.5 py-2 text-xs text-text-muted bg-surface-bg rounded-xl border border-border-light hover:border-brand-green/60 hover:bg-emerald-50/30 transition-all text-left group shadow-xs"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-brand-green group-hover:scale-110 transition-transform" />
                <span>Search STA 211, past questions, notes...</span>
              </div>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 font-mono text-[10px] bg-white border border-border-light px-1.5 py-0.5 rounded text-text-muted shadow-xs">
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
                  className={`text-xs font-semibold px-3 py-2 rounded-lg transition-all ${isActive
                    ? 'text-brand-green bg-brand-light font-bold shadow-xs'
                    : 'text-text-main hover:text-brand-green hover:bg-surface-bg'
                    }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right CTA Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Mobile Search Button */}
            <button
              onClick={onOpenSearch}
              className="p-2 text-text-muted hover:text-brand-green hover:bg-surface-bg rounded-xl md:hidden min-w-[40px] min-h-[40px] flex items-center justify-center transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Desktop Submit Resource CTA */}
            <Button
              size="sm"
              variant="primary"
              onClick={onOpenSubmit}
              className="hidden sm:inline-flex text-xs h-9 shadow-sm hover:shadow"
            >
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Submit Material
            </Button>

            {/* Mobile Hamburger Menu Button */}
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="p-2 text-text-muted hover:text-brand-green hover:bg-surface-bg rounded-xl lg:hidden min-w-[40px] min-h-[40px] flex items-center justify-center transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-Over Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop overlay */}
          <div
            onClick={closeMobileMenu}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in"
          />

          {/* Slide-out drawer panel */}
          <div className="fixed top-0 right-0 bottom-0 w-[82%] max-w-sm bg-surface-card shadow-2xl p-5 flex flex-col justify-between z-10 border-l border-border-light overflow-y-auto animate-in slide-in-from-right duration-200">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-border-light mb-4">
                <div className="flex items-center gap-2">
                  <img src="/logo/asson_logo.png" alt="ASSON" className="w-7 h-7 object-contain" />
                  <span className="font-bold text-sm text-brand-deep">Menu & Gateways</span>
                </div>
                <button
                  onClick={closeMobileMenu}
                  className="p-1.5 text-text-muted hover:text-text-main hover:bg-surface-bg rounded-lg active:scale-95 transition-transform"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Navigation Links */}
              <div className="space-y-1 mb-6">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={closeMobileMenu}
                      className={`flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-all duration-150 active:scale-95 ${isActive
                        ? 'bg-brand-light text-brand-deep font-bold'
                        : 'text-text-main hover:bg-surface-bg hover:text-brand-green'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`p-1.5 rounded-lg ${isActive ? 'bg-brand-green text-white' : 'bg-surface-bg text-text-muted'}`}>
                          <Icon className="w-4 h-4" />
                        </span>
                        <span>{link.name}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-text-subtle" />
                    </Link>
                  );
                })}
              </div>

              {/* Quick Level Filter Shortcuts */}
              <div className="p-3 rounded-xl bg-surface-bg border border-border-light mb-4">
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block mb-2">
                  Browse by Level
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {['100', '200', '300', '400'].map((lvl) => (
                    <Link
                      key={lvl}
                      to={`/resources?level=${lvl}`}
                      onClick={closeMobileMenu}
                      className="text-center py-2 px-1 text-xs font-bold rounded-lg bg-surface-card border border-border-light text-brand-deep hover:bg-brand-green hover:text-white transition-all active:scale-90"
                    >
                      {lvl}L
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Drawer Bottom Actions */}
            <div className="pt-4 border-t border-border-light space-y-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  closeMobileMenu();
                  onOpenSubmit();
                }}
                className="w-full justify-center shadow-md font-bold"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Submit Academic Material
              </Button>

              <Link
                to="/admin"
                onClick={closeMobileMenu}
                className="flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-text-muted hover:text-brand-green transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-brand-green" /> Exco Admin & Telemetry Console
              </Link>

              <div className="text-center text-[10px] text-text-muted pt-1">
                Dept. of Statistics • University of Ibadan<br />
                <span className="text-brand-green font-medium">Facts from Reliable Figures</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
