import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Bell, Briefcase, Plus, User } from 'lucide-react';

interface MobileNavProps {
  onOpenSubmit: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ onOpenSubmit }) => {
  const location = useLocation();

  const links = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Resources', path: '/resources', icon: BookOpen },
    { name: 'Notices', path: '/notices', icon: Bell },
    { name: 'Dashboard', path: '/dashboard', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface-card border-t border-border-light px-3 py-1.5 lg:hidden shadow-lg flex items-center justify-around">
      {links.slice(0, 2).map((link) => {
        const Icon = link.icon;
        const isActive = location.pathname === link.path;
        return (
          <Link
            key={link.path}
            to={link.path}
            className={`flex flex-col items-center justify-center p-1.5 min-w-[56px] rounded-lg transition-colors ${
              isActive ? 'text-brand-green font-semibold' : 'text-text-muted hover:text-text-main'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">{link.name}</span>
          </Link>
        );
      })}

      {/* Floating Submit Action */}
      <button
        onClick={onOpenSubmit}
        className="flex flex-col items-center justify-center -mt-5 bg-brand-green text-white p-2.5 rounded-full shadow-md hover:bg-brand-deep active:scale-95 transition-transform"
        aria-label="Submit Material"
      >
        <Plus className="w-5 h-5" />
      </button>

      {links.slice(2).map((link) => {
        const Icon = link.icon;
        const isActive = location.pathname === link.path;
        return (
          <Link
            key={link.path}
            to={link.path}
            className={`flex flex-col items-center justify-center p-1.5 min-w-[56px] rounded-lg transition-colors ${
              isActive ? 'text-brand-green font-semibold' : 'text-text-muted hover:text-text-main'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">{link.name}</span>
          </Link>
        );
      })}
    </nav>
  );
};

