import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, Plus, Bell, GraduationCap, BookOpen } from 'lucide-react';

interface MobileNavProps {
  onOpenSubmit: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ onOpenSubmit }) => {
  const location = useLocation();

  const leftLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Past Papers', path: '/past-questions', icon: FileText },
  ];

  const rightLinks = [
    { name: 'Notices', path: '/notices', icon: Bell },
    { name: 'Grants', path: '/opportunities', icon: GraduationCap },
  ];

  return (
    <nav 
      aria-label="Mobile Bottom Navigation" 
      className="fixed bottom-0 left-0 right-0 z-40 bg-surface-card/95 backdrop-blur-md border-t border-border-light px-2 py-1.5 lg:hidden shadow-lg flex items-center justify-around pb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
      {/* Left Navigation Tabs */}
      {leftLinks.map((link) => {
        const Icon = link.icon;
        const isActive = location.pathname === link.path;
        return (
          <Link
            key={link.path}
            to={link.path}
            className={`flex flex-col items-center justify-center p-1.5 min-w-[60px] min-h-[46px] rounded-xl transition-all duration-150 active:scale-95 ${
              isActive
                ? 'text-brand-green font-bold bg-emerald-50/80 shadow-xs'
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
            <span className="text-[10px] mt-0.5 font-medium leading-none">{link.name}</span>
          </Link>
        );
      })}

      {/* Floating Center Action: Submit Material */}
      <button
        onClick={onOpenSubmit}
        className="flex flex-col items-center justify-center -mt-5 bg-gradient-to-tr from-brand-deep to-brand-green text-white p-3 rounded-full shadow-lg hover:shadow-xl active:scale-90 transition-transform border-4 border-surface-card group"
        aria-label="Submit Academic Material"
      >
        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
      </button>

      {/* Right Navigation Tabs */}
      {rightLinks.map((link) => {
        const Icon = link.icon;
        const isActive = location.pathname === link.path;
        return (
          <Link
            key={link.path}
            to={link.path}
            className={`flex flex-col items-center justify-center p-1.5 min-w-[60px] min-h-[46px] rounded-xl transition-all duration-150 active:scale-95 ${
              isActive
                ? 'text-brand-green font-bold bg-emerald-50/80 shadow-xs'
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
            <span className="text-[10px] mt-0.5 font-medium leading-none">{link.name}</span>
          </Link>
        );
      })}
    </nav>
  );
};
