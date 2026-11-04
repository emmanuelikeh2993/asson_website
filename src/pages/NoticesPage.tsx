import React, { useState, useEffect } from 'react';
import { MOCK_NOTICES } from '../lib/mockData';
import { fetchNotices } from '../lib/supabase';
import { Notice, NoticeCategory } from '../types';
import { Badge } from '../components/ui/Badge';
import { Bell, Calendar, Building2, Pin, ArrowRight } from 'lucide-react';
import { formatDate } from '../lib/utils';

export const NoticesPage: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>(MOCK_NOTICES);
  const [selectedCategory, setSelectedCategory] = useState<NoticeCategory | 'All'>('All');
  const [activeNotice, setActiveNotice] = useState<Notice | null>(MOCK_NOTICES[0]);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="pb-6 border-b border-border-light mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1.5 rounded-lg bg-emerald-50 text-brand-green">
            <Bell className="w-5 h-5" />
          </span>
          <h1 className="text-2xl font-bold text-text-main tracking-tight">
            Notices & Departmental Announcements
          </h1>
        </div>
        <p className="text-xs text-text-muted">
          Official academic timetables, resumption notices, ASSON Week communiques, and university senate decisions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Filter Sidebar & Pinned Notices (inspired by Image 12) */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Category Filter Pills */}
          <div className="p-4 rounded-xl border border-border-light bg-surface-card shadow-sm">
            <h3 className="text-xs font-bold text-text-main uppercase tracking-wider mb-3">
              Announcement Categories
            </h3>
            <div className="space-y-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left text-xs px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-between ${
                    selectedCategory === cat
                      ? 'bg-brand-green text-white font-bold'
                      : 'text-text-muted hover:bg-surface-bg hover:text-text-main'
                  }`}
                >
                  <span>{cat === 'All' ? 'All Notices' : `${cat} Notices`}</span>
                  <span className="text-[10px] opacity-80">
                    {cat === 'All' ? MOCK_NOTICES.length : MOCK_NOTICES.filter((n) => n.category === cat).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Pinned Urgent Updates Tray (inspired by Image 12 right panel) */}
          <div className="p-4 rounded-xl border border-red-200 bg-red-50/50 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-brand-red uppercase tracking-wider">
              <Pin className="w-4 h-4" /> Pinned Urgent Updates
            </div>
            <div className="space-y-2">
              {pinnedNotices.map((pn) => (
                <div
                  key={pn.id}
                  onClick={() => setActiveNotice(pn)}
                  className="p-3 rounded-lg bg-surface-card border border-red-200 shadow-xs cursor-pointer hover:border-brand-red transition-all"
                >
                  <span className="text-[10px] font-semibold text-brand-red uppercase block">
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
        </aside>

        {/* Central/Right Column: Notices Feed & Active Viewer */}
        <div className="lg:col-span-8 space-y-4">
          {filteredNotices.map((notice) => (
            <article
              key={notice.id}
              className={`p-6 rounded-2xl border transition-all ${
                notice.isUrgent
                  ? 'border-brand-red/30 bg-surface-card shadow-card'
                  : 'border-border-light bg-surface-card shadow-card hover:shadow-card-hover'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <Badge variant={notice.isUrgent ? 'urgent' : 'course'}>
                    {notice.category}
                  </Badge>
                  <span className="text-xs font-medium text-text-muted flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-text-subtle" />
                    {notice.issuer}
                  </span>
                </div>
                <span className="text-xs text-text-muted flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-text-subtle" />
                  {formatDate(notice.publishedDate)}
                </span>
              </div>

              <h3 className="text-base font-bold text-text-main mb-2">
                {notice.title}
              </h3>

              <p className="text-xs sm:text-sm text-text-muted leading-relaxed mb-4">
                {notice.content}
              </p>

              {notice.deadline && (
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium inline-block mb-2">
                  Action Deadline: <span className="font-bold">{formatDate(notice.deadline)}</span>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

