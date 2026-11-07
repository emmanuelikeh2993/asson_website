import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchCalendarEvents, DEFAULT_CALENDAR_EVENTS } from '../lib/supabase';
import { CalendarEvent, CalendarCategory, AcademicLevel } from '../types';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Filter, 
  ArrowRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  List,
  Grid
} from 'lucide-react';
import { formatDate } from '../lib/utils';

export const CalendarPage: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'agenda' | 'month'>('agenda');

  // Month grid navigation state
  const [currentMonthDate, setCurrentMonthDate] = useState(() => new Date(2026, 10, 1)); // November 2026

  useEffect(() => {
    setIsLoading(true);
    fetchCalendarEvents().then((data) => {
      setEvents(data.length > 0 ? data : DEFAULT_CALENDAR_EVENTS);
      setIsLoading(false);
    });
  }, []);

  const categories: string[] = [
    'All',
    'Continuous Assessment',
    'Examination',
    'Registration Deadline',
    'Departmental Event',
    'Resumption / Senate'
  ];

  const levels: string[] = ['All', '100', '200', '300', '400'];

  const filteredEvents = events.filter((ev) => {
    const matchCategory = selectedCategory === 'All' || ev.category === selectedCategory;
    const matchLevel = selectedLevel === 'All' || !ev.targetLevel || ev.targetLevel === selectedLevel;
    return matchCategory && matchLevel;
  });

  // Month navigation helpers
  const nextMonth = () => {
    setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1));
  };
  const prevMonth = () => {
    setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1));
  };

  const monthYearString = currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Compute days in current view month
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6 sm:space-y-8 animate-in fade-in duration-200 w-full max-w-full overflow-hidden">
      {/* Calm Institutional Header (WhatsApp / Spotify Style) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border-light">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-brand-green text-[11px] font-bold border border-emerald-200 dark:border-emerald-800 mb-1.5">
            <CalendarIcon className="w-3.5 h-3.5" /> Departmental Academic Schedule
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-text-main tracking-tight">
            Academic Calendar & Key Dates
          </h1>
          <p className="text-xs text-text-muted mt-0.5 max-w-2xl leading-relaxed">
            Verified schedules for tests, exams, portal registration milestones, and ASSON programmes across all levels.
          </p>
        </div>

        {/* View Switcher (Agenda vs Month) */}
        <div className="inline-flex items-center p-1 rounded-xl bg-surface-card border border-border-light self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('agenda')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'agenda'
                ? 'bg-brand-green text-white shadow-2xs'
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            <List className="w-3.5 h-3.5" /> Agenda
          </button>
          <button
            type="button"
            onClick={() => setViewMode('month')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'month'
                ? 'bg-brand-green text-white shadow-2xs'
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            <Grid className="w-3.5 h-3.5" /> Month
          </button>
        </div>
      </div>

      {/* Filter Row: Calm WhatsApp Pills */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer border ${
                selectedCategory === cat
                  ? 'bg-brand-deep text-white border-brand-deep'
                  : 'bg-surface-card text-text-muted border-border-light hover:text-text-main hover:bg-surface-bg'
              }`}
            >
              {cat === 'Continuous Assessment' ? 'Tests & C.A.' : cat}
            </button>
          ))}
        </div>

        {/* Level selector pills */}
        <div className="flex items-center gap-1.5 text-xs text-text-muted pt-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-subtle mr-1">Level:</span>
          {levels.map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setSelectedLevel(lvl)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                selectedLevel === lvl
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-brand-deep dark:text-emerald-300 font-extrabold'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              {lvl === 'All' ? 'All Levels' : `${lvl}L`}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW 1: AGENDA CHRONOLOGICAL LIST (WhatsApp Orderliness) */}
      {viewMode === 'agenda' && (
        <div className="space-y-3">
          {filteredEvents.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-border-light bg-surface-card text-text-muted space-y-2">
              <CalendarIcon className="w-8 h-8 mx-auto opacity-30 text-text-subtle" />
              <p className="font-semibold text-xs text-text-main">No Academic Dates Found</p>
              <p className="text-[11px] text-text-muted">No scheduled items match the selected category or level filter.</p>
            </div>
          ) : (
            filteredEvents.map((ev) => {
              const eventDateObj = new Date(ev.startDate);
              const dayNum = eventDateObj.getDate();
              const monthStr = eventDateObj.toLocaleString('default', { month: 'short' }).toUpperCase();
              const weekdayStr = eventDateObj.toLocaleString('default', { weekday: 'short' });

              const categoryBadge =
                ev.category === 'Examination' ? 'bg-red-50 dark:bg-red-950/40 text-brand-red border-red-200 dark:border-red-900' :
                ev.category === 'Continuous Assessment' ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900' :
                ev.category === 'Registration Deadline' ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900' :
                'bg-emerald-50 dark:bg-emerald-950/40 text-brand-green border-emerald-200 dark:border-emerald-900';

              return (
                <div
                  key={ev.id}
                  className="p-4 sm:p-5 rounded-2xl border border-border-light bg-surface-card shadow-card hover:border-brand-green/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  {/* Left: Date Badge & Details */}
                  <div className="flex items-start gap-4">
                    {/* Calm Date Block */}
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-surface-bg border border-border-light flex flex-col items-center justify-center shrink-0 text-center font-mono">
                      <span className="text-[10px] font-bold text-text-subtle leading-none uppercase">{monthStr}</span>
                      <span className="text-xl sm:text-2xl font-black text-text-main leading-tight">{dayNum}</span>
                      <span className="text-[9px] text-text-muted leading-none">{weekdayStr}</span>
                    </div>

                    {/* Event Content */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${categoryBadge}`}>
                          {ev.category}
                        </span>
                        {ev.targetLevel && (
                          <span className="px-2 py-0.5 rounded-md bg-surface-bg border border-border-light text-text-muted text-[10px] font-bold">
                            {ev.targetLevel}L
                          </span>
                        )}
                        {ev.isConfirmed ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" /> Confirmed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 dark:text-amber-400">
                            <AlertCircle className="w-3 h-3" /> Provisional
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-text-main leading-snug">
                        {ev.title}
                      </h3>

                      {ev.description && (
                        <p className="text-xs text-text-muted leading-relaxed max-w-2xl">
                          {ev.description}
                        </p>
                      )}

                      {/* Venue and Time chips */}
                      <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-text-subtle font-medium">
                        {ev.startTime && (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-text-muted" /> {ev.startTime}
                          </span>
                        )}
                        {ev.venue && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-brand-green" /> {ev.venue}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Action or linked notice */}
                  <div className="self-end sm:self-center shrink-0">
                    <Link
                      to="/notices"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-brand-green hover:underline py-1 px-2.5 rounded-lg hover:bg-emerald-50/50"
                    >
                      <span>Check Notices</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* VIEW 2: MONTH VIEW GRID (Spotify Style Orderly Calendar) */}
      {viewMode === 'month' && (
        <div className="rounded-3xl border border-border-light bg-surface-card p-5 sm:p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-text-main">
              {monthYearString}
            </h3>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prevMonth}
                className="p-1.5 rounded-lg border border-border-light bg-surface-bg hover:bg-surface-card text-text-muted hover:text-text-main transition-colors cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="p-1.5 rounded-lg border border-border-light bg-surface-bg hover:bg-surface-card text-text-muted hover:text-text-main transition-colors cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] text-text-subtle py-1 border-b border-border-light">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-1">{d}</div>
            ))}
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {/* Empty slots before first day */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="h-16 sm:h-20 rounded-xl bg-surface-bg/40 opacity-40" />
            ))}

            {/* Actual Month Days */}
            {Array.from({ length: totalDays }).map((_, i) => {
              const day = i + 1;
              const dateIso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayEvents = filteredEvents.filter((ev) => ev.startDate === dateIso);
              const hasEvents = dayEvents.length > 0;

              return (
                <div
                  key={`day-${day}`}
                  className={`h-16 sm:h-20 p-1.5 rounded-xl border flex flex-col justify-between transition-colors ${
                    hasEvents 
                      ? 'border-brand-green/40 bg-emerald-50/30 dark:bg-emerald-950/20' 
                      : 'border-border-light/60 bg-surface-card'
                  }`}
                >
                  <span className={`text-xs font-mono font-bold ${hasEvents ? 'text-brand-deep dark:text-emerald-300' : 'text-text-muted'}`}>
                    {day}
                  </span>
                  
                  {hasEvents && (
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 2).map((ev) => (
                        <div
                          key={ev.id}
                          className="text-[9px] font-semibold text-text-main truncate px-1 py-0.5 rounded bg-surface-bg border border-border-light"
                          title={ev.title}
                        >
                          {ev.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <span className="text-[8px] text-text-subtle block font-mono">
                          +{dayEvents.length - 2} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

