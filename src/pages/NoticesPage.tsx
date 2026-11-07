import React, { useState, useEffect } from 'react';
import { MOCK_NOTICES } from '../lib/mockData';
import { fetchNotices, registerEventRsvp, isNoticeRsvpd } from '../lib/supabase';
import { Notice, NoticeCategory } from '../types';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Bell, Calendar, Building2, Pin, ArrowRight, Share2, CheckCircle2, MapPin, Clock, Users, ExternalLink, Check } from 'lucide-react';
import { formatDate } from '../lib/utils';
import { useToast } from '../components/ui/Toast';

export const NoticesPage: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>(MOCK_NOTICES);
  const [selectedCategory, setSelectedCategory] = useState<NoticeCategory | 'All'>('All');
  const [activeNotice, setActiveNotice] = useState<Notice | null>(MOCK_NOTICES[0]);
  const [rsvpdNotices, setRsvpdNotices] = useState<Record<string, boolean>>({});
  const toast = useToast();

  useEffect(() => {
    fetchNotices().then((data) => {
      if (data && data.length > 0) {
        setNotices(data);
        setActiveNotice(data[0]);

        // Load RSVP status
        const statuses: Record<string, boolean> = {};
        data.forEach((n) => {
          statuses[n.id] = isNoticeRsvpd(n.id);
        });
        setRsvpdNotices(statuses);
      }
    });
  }, []);

  const handleRsvp = async (n: Notice) => {
    if (rsvpdNotices[n.id]) return;
    const res = await registerEventRsvp(n.id);
    setRsvpdNotices((prev) => ({ ...prev, [n.id]: true }));
    setNotices((prev) =>
      prev.map((item) => (item.id === n.id ? { ...item, rsvpCount: res.newCount } : item))
    );
    if (activeNotice && activeNotice.id === n.id) {
      setActiveNotice({ ...activeNotice, rsvpCount: res.newCount });
    }
    toast.success('RSVP Confirmed', res.message);
  };

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

      {notices.length === 0 ? (
        <div className="py-16 px-4 text-center rounded-3xl border border-dashed border-border-light bg-surface-card max-w-xl mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-brand-green flex items-center justify-center mx-auto border border-emerald-200 shadow-2xs">
            <Bell className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-text-main">No Active Announcements</h3>
            <p className="text-xs text-text-muted max-w-md mx-auto leading-relaxed">
              There are currently no active public circulars or examination announcements issued. Official communiques from the Department of Statistics and the ASSON Secretariat will be published here in real time.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Mobile-Friendly Category Switcher Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none lg:hidden">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all active:scale-95 duration-150 shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-brand-green text-white shadow-xs font-bold'
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

                  {/* Quiet Event & RSVP Block (WhatsApp Calm Design) */}
                  {(activeNotice.eventDate || activeNotice.hasInAppRsvp || activeNotice.venue) && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-green block">
                            Programme Schedule & Attendance
                          </span>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-text-main font-semibold">
                            {activeNotice.eventDate && (
                              <span className="inline-flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-brand-green" />
                                {formatDate(activeNotice.eventDate)}
                              </span>
                            )}
                            {activeNotice.eventTime && (
                              <span className="inline-flex items-center gap-1.5 font-normal text-text-muted">
                                <Clock className="w-3.5 h-3.5" />
                                {activeNotice.eventTime}
                              </span>
                            )}
                            {activeNotice.venue && (
                              <span className="inline-flex items-center gap-1.5 font-normal text-text-muted">
                                <MapPin className="w-3.5 h-3.5 text-brand-green" />
                                {activeNotice.venue}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* RSVP Action */}
                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          {activeNotice.rsvpUrl ? (
                            <a
                              href={activeNotice.rsvpUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-green text-white text-xs font-bold hover:bg-brand-deep transition-colors shadow-2xs"
                            >
                              <span>Register Link</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleRsvp(activeNotice)}
                              disabled={rsvpdNotices[activeNotice.id]}
                              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs ${
                                rsvpdNotices[activeNotice.id]
                                  ? 'bg-emerald-700 text-white cursor-default'
                                  : 'bg-brand-green text-white hover:bg-brand-deep cursor-pointer active:scale-98'
                              }`}
                            >
                              {rsvpdNotices[activeNotice.id] ? (
                                <>
                                  <Check className="w-3.5 h-3.5" /> You're Attending
                                </>
                              ) : (
                                <>
                                  <Users className="w-3.5 h-3.5" /> RSVP to Attend
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {activeNotice.rsvpCount !== undefined && activeNotice.rsvpCount > 0 && (
                        <p className="text-[11px] text-text-muted">
                          <strong>{activeNotice.rsvpCount}</strong> students registered to attend.
                        </p>
                      )}
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
        </>
      )}
    </div>
  );
};
