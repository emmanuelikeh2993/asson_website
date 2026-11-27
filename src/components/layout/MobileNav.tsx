import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Calendar, Bell, SlidersHorizontal } from 'lucide-react';

interface MobileNavProps {
  onOpenSubmit?: () => void;
  onOpenAuth?: () => void;
}

const MORE_SUBPATHS = new Set([
  '/more',
  '/settings',
  '/cgpa-calculator',
  '/help',
  '/faqs',
  '/enterprise',
  '/terms',
  '/privacy',
  '/opportunities',
]);

export const MobileNav: React.FC<MobileNavProps> = () => {
  const location = useLocation();

  const navTabs = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Resources', path: '/resources', icon: BookOpen },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
    { name: 'Notices', path: '/notices', icon: Bell },
    { name: 'More', path: '/more', icon: SlidersHorizontal },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-surface-card/95 backdrop-blur-md border-t border-border-light px-2 py-1 lg:hidden shadow-sm flex items-center justify-around pb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
      {navTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive =
          location.pathname === tab.path ||
          (tab.path === '/resources' &&
            (location.pathname.startsWith('/resources') ||
              location.pathname.startsWith('/past-questions'))) ||
          (tab.path === '/more' && MORE_SUBPATHS.has(location.pathname));

        return (
          <Link
            key={tab.path}
            to={tab.path}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => {
              window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            }}
            className="flex flex-col items-center justify-center flex-1 py-1 px-1 transition-transform active:scale-95 group cursor-pointer"
          >
            {/* DCN Expert Signature Active Pill Capsule around Icon */}
            <div
              className={`px-4 sm:px-5 py-1 rounded-full flex items-center justify-center transition-all duration-200 ${
                isActive
                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-brand-green shadow-2xs'
                  : 'text-text-muted group-hover:text-text-main'
              }`}
            >
              <Icon
                className={`w-4 h-4 sm:w-5 sm:h-5 ${
                  isActive ? 'stroke-[2.5] text-brand-green' : 'stroke-[1.8]'
                }`}
              />
            </div>
            <span
              className={`text-xs mt-0.5 tracking-tight transition-colors ${
                isActive
                  ? 'font-bold text-brand-green'
                  : 'font-medium text-text-muted group-hover:text-text-main'
              }`}
            >
              {tab.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};
