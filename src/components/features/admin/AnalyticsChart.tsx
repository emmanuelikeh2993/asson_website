import React, { useState, useMemo } from 'react';
import { TrendingUp, Users, Download, Calendar } from 'lucide-react';

interface DataPoint {
  date: string;
  label: string;
  downloads: number;
  visits: number;
}

export const AnalyticsChart: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '14d' | '30d'>('14d');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Generate realistic analytics data modeled on UI academic calendar traffic
  const rawData: DataPoint[] = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : 30;
    const points: DataPoint[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      
      // Mid-semester exam rush traffic pattern
      const baseVisits = isWeekend ? 85 : 190;
      const baseDownloads = isWeekend ? 65 : 145;
      
      const seed = Math.sin(i * 0.8) * 35;
      const visits = Math.max(45, Math.round(baseVisits + seed + (i % 3 === 0 ? 40 : 0)));
      const downloads = Math.max(30, Math.round(baseDownloads + seed * 0.9 + (i % 2 === 0 ? 25 : 0)));

      points.push({
        date: d.toISOString().split('T')[0],
        label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        downloads,
        visits,
      });
    }
    return points;
  }, [timeRange]);

  const maxVal = useMemo(() => {
    const maxDownloads = Math.max(...rawData.map((d) => d.downloads));
    const maxVisits = Math.max(...rawData.map((d) => d.visits));
    return Math.ceil(Math.max(maxDownloads, maxVisits) * 1.15 / 20) * 20;
  }, [rawData]);

  const totalDownloads = useMemo(() => rawData.reduce((acc, d) => acc + d.downloads, 0), [rawData]);
  const totalVisits = useMemo(() => rawData.reduce((acc, d) => acc + d.visits, 0), [rawData]);
  const peakDownloads = useMemo(() => Math.max(...rawData.map((d) => d.downloads)), [rawData]);

  // SVG dimensions
  const svgWidth = 800;
  const svgHeight = 260;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 35;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // Compute coordinate points
  const pointsDownloads = useMemo(() => {
    return rawData.map((d, idx) => {
      const x = paddingLeft + (idx / (rawData.length - 1)) * chartWidth;
      const y = paddingTop + chartHeight - (d.downloads / maxVal) * chartHeight;
      return { x, y, data: d };
    });
  }, [rawData, maxVal, chartWidth, chartHeight]);

  const pointsVisits = useMemo(() => {
    return rawData.map((d, idx) => {
      const x = paddingLeft + (idx / (rawData.length - 1)) * chartWidth;
      const y = paddingTop + chartHeight - (d.visits / maxVal) * chartHeight;
      return { x, y, data: d };
    });
  }, [rawData, maxVal, chartWidth, chartHeight]);

  // Cubic Bezier curve generator
  function createBezierPath(pts: { x: number; y: number }[]): string {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(i - 1, 0)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(i + 2, pts.length - 1)];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  }

  const downloadsPath = useMemo(() => createBezierPath(pointsDownloads), [pointsDownloads]);
  const visitsPath = useMemo(() => createBezierPath(pointsVisits), [pointsVisits]);

  // Area fill path for downloads
  const downloadsAreaPath = useMemo(() => {
    if (pointsDownloads.length === 0) return '';
    const first = pointsDownloads[0];
    const last = pointsDownloads[pointsDownloads.length - 1];
    const baseline = paddingTop + chartHeight;
    return `${downloadsPath} L ${last.x} ${baseline} L ${first.x} ${baseline} Z`;
  }, [downloadsPath, pointsDownloads, paddingTop, chartHeight]);

  return (
    <div className="rounded-3xl border border-border-light bg-surface-card p-5 sm:p-7 shadow-card space-y-6">
      {/* Chart Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-light/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-brand-green">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h3 className="text-sm sm:text-base font-extrabold text-text-main tracking-tight">
              Traffic & Document Engagement Trends
            </h3>
          </div>
          <p className="text-xs text-text-muted mt-0.5">
            Real-time metric telemetry tracking academic resource retrievals and active student sessions.
          </p>
        </div>

        {/* Time-Range Switcher (SportyBet / Spotify Segmented Control) */}
        <div className="flex items-center rounded-xl border border-border-light bg-surface-bg p-1 text-xs self-start sm:self-auto shadow-xs">
          {(['7d', '14d', '30d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => {
                setTimeRange(range);
                setHoveredIndex(null);
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                timeRange === range
                  ? 'bg-brand-green text-white shadow-xs'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              {range === '7d' ? 'Last 7 Days' : range === '14d' ? 'Last 14 Days' : 'Last 30 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Highlights Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-surface-bg border border-border-light/60">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-text-muted">
            <Download className="w-3.5 h-3.5 text-brand-green" /> Total Downloads
          </div>
          <span className="text-xl sm:text-2xl font-extrabold text-brand-deep block mt-1">
            {totalDownloads.toLocaleString()}
          </span>
          <span className="text-[10px] text-emerald-700 font-medium">In selected period</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-surface-bg border border-border-light/60">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-text-muted">
            <Users className="w-3.5 h-3.5 text-cyan-600" /> Unique Visits
          </div>
          <span className="text-xl sm:text-2xl font-extrabold text-text-main block mt-1">
            {totalVisits.toLocaleString()}
          </span>
          <span className="text-[10px] text-text-muted font-medium">Student devices</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-surface-bg border border-border-light/60">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-text-muted">
            <TrendingUp className="w-3.5 h-3.5 text-amber-600" /> Peak Day Volume
          </div>
          <span className="text-xl sm:text-2xl font-extrabold text-text-main block mt-1">
            {peakDownloads}
          </span>
          <span className="text-[10px] text-text-muted font-medium">Max papers in 24h</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-surface-bg border border-border-light/60">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-text-muted">
            <Calendar className="w-3.5 h-3.5 text-brand-green" /> Daily Average
          </div>
          <span className="text-xl sm:text-2xl font-extrabold text-brand-green block mt-1">
            {Math.round(totalDownloads / rawData.length)}
          </span>
          <span className="text-[10px] text-text-muted font-medium">Downloads / day</span>
        </div>
      </div>

      {/* SVG Interactive Line Chart Container */}
      <div className="relative w-full overflow-hidden rounded-2xl border border-border-light/80 bg-gradient-to-b from-white to-surface-bg/40 p-2 sm:p-4">
        {/* Legend */}
        <div className="flex items-center justify-end gap-4 text-xs font-semibold mb-2 pr-2">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-brand-green" />
            <span className="text-text-main">Material Downloads</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#0ea5e9]" />
            <span className="text-text-muted">Active Student Visits</span>
          </div>
        </div>

        {/* Responsive Scalable SVG Canvas */}
        <div className="w-full aspect-[16/7] min-h-[200px]">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-full overflow-visible select-none"
          >
            <defs>
              {/* Emerald Gradient Fill for Downloads */}
              <linearGradient id="downloadsFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#087A3E" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#087A3E" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="visitsStroke" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
              const y = paddingTop + chartHeight * (1 - pct);
              const val = Math.round(maxVal * pct);
              return (
                <g key={i}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={svgWidth - paddingRight}
                    y2={y}
                    stroke="#E2E8F0"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text
                    x={paddingLeft - 8}
                    y={y + 3}
                    textAnchor="end"
                    fontSize="10"
                    fill="#94a3b8"
                    fontFamily="monospace"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Area Fill Under Downloads */}
            <path d={downloadsAreaPath} fill="url(#downloadsFill)" />

            {/* Visits Curved Line (Cyan) */}
            <path
              d={visitsPath}
              fill="none"
              stroke="url(#visitsStroke)"
              strokeWidth="2.2"
              strokeDasharray={timeRange === '30d' ? 'none' : 'none'}
              strokeLinecap="round"
            />

            {/* Downloads Curved Line (Primary Emerald) */}
            <path
              d={downloadsPath}
              fill="none"
              stroke="#087A3E"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Vertical Scrubber Line on Hover */}
            {hoveredIndex !== null && pointsDownloads[hoveredIndex] && (
              <g>
                <line
                  x1={pointsDownloads[hoveredIndex].x}
                  y1={paddingTop}
                  x2={pointsDownloads[hoveredIndex].x}
                  y2={paddingTop + chartHeight}
                  stroke="#087A3E"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
                {/* Downloads point */}
                <circle
                  cx={pointsDownloads[hoveredIndex].x}
                  cy={pointsDownloads[hoveredIndex].y}
                  r="5"
                  fill="#087A3E"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  className="shadow-md"
                />
                {/* Visits point */}
                <circle
                  cx={pointsVisits[hoveredIndex].x}
                  cy={pointsVisits[hoveredIndex].y}
                  r="4.5"
                  fill="#0284c7"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
              </g>
            )}

            {/* Touch / Hover interactive invisible hot-spot bars */}
            {pointsDownloads.map((pt, idx) => {
              const colWidth = chartWidth / pointsDownloads.length;
              return (
                <rect
                  key={idx}
                  x={pt.x - colWidth / 2}
                  y={paddingTop}
                  width={colWidth}
                  height={chartHeight}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onTouchStart={() => setHoveredIndex(idx)}
                />
              );
            })}

            {/* X-Axis Date Labels */}
            {pointsDownloads.map((pt, idx) => {
              const total = pointsDownloads.length;
              const shouldShow =
                total <= 7 ||
                (total <= 14 && idx % 2 === 0) ||
                (total > 14 && idx % 4 === 0) ||
                idx === total - 1;

              if (!shouldShow) return null;
              return (
                <text
                  key={idx}
                  x={pt.x}
                  y={paddingTop + chartHeight + 18}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#64748b"
                  fontWeight="500"
                >
                  {pt.data.date.slice(5)}
                </text>
              );
            })}
          </svg>
        </div>

        {/* Floating Tooltip Card */}
        {hoveredIndex !== null && rawData[hoveredIndex] && (
          <div className="absolute top-4 left-4 sm:left-14 p-2.5 rounded-xl bg-slate-900/95 text-white text-xs shadow-xl backdrop-blur-md border border-slate-700 animate-in fade-in duration-150 pointer-events-none">
            <span className="font-semibold block text-[11px] text-slate-300">
              {rawData[hoveredIndex].label}
            </span>
            <div className="mt-1 space-y-0.5 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-emerald-300 font-bold">
                  {rawData[hoveredIndex].downloads}
                </span>
                <span className="text-slate-300">Downloads</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                <span className="text-sky-300 font-bold">
                  {rawData[hoveredIndex].visits}
                </span>
                <span className="text-slate-300">Visits</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
