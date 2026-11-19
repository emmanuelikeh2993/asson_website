import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Calendar, Bell, LayoutGrid } from 'lucide-react';

interface MobileNavProps {
  onOpenSubmit?: () => void;
  onOpenSettings?: () => void;
  onOpenAuth?: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = () => {
  const location = useLocation();

  const navTabs = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Resources', path: '/resources', icon: BookOpen },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
    { name: 'Notices', path: '/notices', icon: Bell },
    { name: 'More', path: '/more', icon: LayoutGrid },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-surface-card/95 backdrop-blur-md border-t border-border-light px-1 py-1 lg:hidden shadow-sm flex items-center justify-around pb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
      {navTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive =
          location.pathname === tab.path ||
          (tab.path === '/more' && location.pathname === '/settings');

        return (
          <Link
            key={tab.path}
            to={tab.path}
            className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 min-h-[46px] rounded-xl transition-all duration-150 active:scale-95 ${
              isActive
                ? 'text-brand-green font-bold bg-emerald-50/70 dark:bg-emerald-950/40 shadow-2xs'
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
            <span className="text-[10px] sm:text-[11px] mt-1 font-medium leading-none tracking-tight">
              {tab.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};
