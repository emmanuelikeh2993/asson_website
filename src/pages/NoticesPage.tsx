import React, { useState, useEffect } from 'react';
import { MOCK_NOTICES } from '../lib/mockData';
import { fetchNotices } from '../lib/supabase';
import { Notice, NoticeCategory } from '../types';
import { Badge } from '../components/ui/Badge';
import { Bell, Calendar, Building2, Pin, ArrowRight, Share2, CheckCircle2 } from 'lucide-react';
import { formatDate } from '../lib/utils';
import { useToast } from '../components/ui/Toast';

export const NoticesPage: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>(MOCK_NOTICES);
  const [selectedCategory, setSelectedCategory] = useState<NoticeCategory | 'All'>('All');
  const [activeNotice, setActiveNotice] = useState<Notice | null>(MOCK_NOTICES[0]);
  const toast = useToast();

  useEffect(() => {
    fetchNotices().then((data) => {
      if (data && data.length > 0) {
        setNotices(data);
        setActiveNotice(data[0]);
      }
    });
  }, []);

  const categories: (NoticeCategory | 'All')[] = ['All', 'ASSON', 'Department', 'Faculty', 'University'];

  const filteredNotices = notices.filter(
    (n) => selectedCategory === 'All' || n.category === selectedCategory
  );

  const pinnedNotices = notices.filter((n) => n.isUrgent);

  const handleShareNotice = (n: Notice) => {
    if (navigator.share) {
      navigator.share({
        title: n.title,
        text: `${n.title} - ASSON UI Official Notice`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${n.title}\n\n${n.content}\n\nRead more on ASSON UI Portal`);
      toast.info('Copied', 'Notice text copied to clipboard');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6">
      {/* Page Header */}
      <div className="pb-6 border-b border-border-light mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1.5 rounded-lg bg-emerald-50 text-brand-green">
            <Bell className="w-5 h-5" />
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-text-main tracking-tight">
            Official Notices & Communiques
          </h1>
        </div>
        <p className="text-xs text-text-muted">
          Official academic schedules, departmental timetables, ASSON Week communiques, and faculty senate updates.
        </p>
      </div>

      {/* Mobile-Friendly Category Switcher Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none lg:hidden">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
              selectedCategory === cat
                ? 'bg-brand-green text-white shadow-xs'
                : 'bg-surface-card border border-border-light text-text-muted hover:text-text-main'
            }`}
          >
            {cat === 'All' ? 'All Notices' : cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Filter Sidebar & Pinned Notices (Desktop) */}
        <aside className="lg:col-span-4 space-y-4">
          {/* Category Filter Pills (Desktop) */}
          <div className="hidden lg:block p-4 rounded-2xl border border-border-light bg-surface-card shadow-sm">
            <h3 className="text-xs font-bold text-text-main uppercase tracking-wider mb-3">
              Announcement Categories
            </h3>
            <div className="space-y-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left text-xs px-3 py-2 rounded-xl font-medium transition-colors flex items-center justify-between ${
                    selectedCategory === cat
                      ? 'bg-brand-green text-white font-bold'
                      : 'text-text-muted hover:bg-surface-bg hover:text-text-main'
                  }`}
                >
                  <span>{cat === 'All' ? 'All Notices' : `${cat} Notices`}</span>
                  <span className="text-[10px] opacity-80 font-mono">
                    {cat === 'All' ? notices.length : notices.filter((n) => n.category === cat).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Pinned Urgent Updates Tray */}
          {pinnedNotices.length > 0 && (
            <div className="p-4 rounded-2xl border border-red-200 bg-red-50/50 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-brand-red uppercase tracking-wider">
                <Pin className="w-4 h-4" /> Pinned Urgent Updates
              </div>
              <div className="space-y-2">
                {pinnedNotices.map((pn) => (
                  <div
                    key={pn.id}
                    onClick={() => setActiveNotice(pn)}
                    className="p-3 rounded-xl bg-surface-card border border-red-200 shadow-xs cursor-pointer hover:border-brand-red transition-all"
                  >
                    <span className="text-[10px] font-bold text-brand-red uppercase block">
                      {pn.issuer}
                    </span>
                    <h4 className="text-xs font-bold text-text-main mt-0.5 line-clamp-2">
                      {pn.title}
                    </h4>
                    <span className="text-[10px] text-text-muted block mt-1">
                      Published: {formatDate(pn.publishedDate)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notice List Feed */}
          <div className="p-4 rounded-2xl border border-border-light bg-surface-card shadow-sm">
            <h3 className="text-xs font-bold text-text-main uppercase tracking-wider mb-3">
              Recent Communiques ({filteredNotices.length})
            </h3>
            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
              {filteredNotices.map((n) => {
                const isSelected = activeNotice?.id === n.id;
                return (
                  <div
                    key={n.id}
                    onClick={() => setActiveNotice(n)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-brand-green bg-emerald-50/60 shadow-xs'
                        : 'border-border-light hover:border-brand-green/40 hover:bg-surface-bg'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-bold text-brand-green uppercase">
                        {n.category}
                      </span>
                      {n.isUrgent && (
                        <span className="text-[9px] font-bold bg-red-100 text-brand-red px-1.5 py-0.2 rounded">
                          Urgent
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-text-main line-clamp-2 leading-snug">
                      {n.title}
                    </h4>
                    <span className="text-[10px] text-text-muted mt-1 block">
                      {formatDate(n.publishedDate)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Right Column: Full Active Notice Reader */}
        <main className="lg:col-span-8">
          {activeNotice ? (
            <article className="p-6 sm:p-8 rounded-3xl border border-border-light bg-surface-card shadow-card space-y-6">
              {/* Notice Metadata Header */}
              <div className="border-b border-border-light/60 pb-6 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="course">{activeNotice.category}</Badge>
                  {activeNotice.isUrgent && (
                    <Badge variant="urgent" withIcon>Urgent Announcement</Badge>
                  )}
                  <span className="text-xs text-text-muted ml-auto font-medium">
                    Published: {formatDate(activeNotice.publishedDate)}
                  </span>
                </div>

                <h2 className="text-lg sm:text-2xl font-extrabold text-text-main tracking-tight leading-snug">
                  {activeNotice.title}
                </h2>

                <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted pt-1">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-brand-green" />
                    <span>Issued by: <strong className="text-text-main">{activeNotice.issuer}</strong></span>
                  </div>
                  {activeNotice.deadline && (
                    <div className="flex items-center gap-1.5 text-brand-red font-semibold">
                      <Calendar className="w-4 h-4" />
                      <span>Action Deadline: {formatDate(activeNotice.deadline)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Summary Callout Box */}
              {activeNotice.summary && (
                <div className="p-4 rounded-2xl bg-surface-bg border border-border-light text-xs font-medium text-text-main leading-relaxed">
                  <strong className="text-brand-deep block mb-1">Executive Summary:</strong>
                  {activeNotice.summary}
                </div>
              )}

              {/* Full Notice Content Body */}
              <div className="text-xs sm:text-sm text-text-main leading-relaxed space-y-4 whitespace-pre-line">
                {activeNotice.content}
              </div>

              {/* Notice Action Footer */}
              <div className="pt-6 border-t border-border-light/60 flex items-center justify-between text-xs">
                <span className="text-text-muted text-[11px]">
                  ASSON UI Official Academic Desk
                </span>
                <button
                  onClick={() => handleShareNotice(activeNotice)}
                  className="px-3 py-1.5 rounded-xl border border-border-light hover:bg-emerald-50 hover:text-brand-green text-text-main font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" /> Share Notice
                </button>
              </div>
            </article>
          ) : (
            <div className="p-12 rounded-3xl border border-dashed border-border-light bg-surface-card text-center text-text-muted text-xs">
              Select an announcement from the list to view its complete communique.
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
