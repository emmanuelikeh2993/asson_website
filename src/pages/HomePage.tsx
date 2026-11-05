import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { DownloadCard } from '../components/features/resources/DownloadCard';
import { MOCK_RESOURCES, MOCK_NOTICES, COURSES } from '../lib/mockData';
import { 
  Search, 
  BookOpen, 
  FileText, 
  GraduationCap, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Download,
  Folder,
  Layers,
  PlusCircle,
  HelpCircle,
  TrendingUp
} from 'lucide-react';
import { AcademicResource, Notice } from '../types';
import { fetchResources, fetchNotices } from '../lib/supabase';
import { useToast } from '../components/ui/Toast';

interface HomePageProps {
  onOpenSearch: () => void;
  onOpenSubmit: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onOpenSearch, onOpenSubmit }) => {
  const [resources, setResources] = useState<AcademicResource[]>(MOCK_RESOURCES);
  const [notices, setNotices] = useState<Notice[]>(MOCK_NOTICES);
  const toast = useToast();

  useEffect(() => {
    fetchResources().then((data) => {
      if (data && data.length > 0) setResources(data);
    });
    fetchNotices().then((data) => {
      if (data && data.length > 0) setNotices(data);
    });
  }, []);

  const pastQuestions = resources
    .filter((r) => r.type === 'Past Question')
    .slice(0, 4);

  const urgentNotice = notices.find((n) => n.isUrgent);

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      {/* 1. Hero Section (Elevated, Mobile-First, Rich Emerald) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-brand-deep to-[#053b21] text-white pt-10 pb-16 sm:pt-16 sm:pb-24 px-4 sm:px-6 lg:px-8">
        {/* Subtle patterned grid overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#55C9D5_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10 flex flex-col items-center text-center">
          {/* Institutional Trust Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[11px] sm:text-xs text-emerald-200 font-semibold mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Association of Statistics Students of Nigeria • University of Ibadan</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight max-w-4xl text-white">
            Together for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-cyan-200 to-white">
              Academic Excellence
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-4 text-xs sm:text-sm lg:text-base text-emerald-100/90 max-w-2xl leading-relaxed">
            Instant, zero-login academic resource library for UI Statistics students. Download verified past examination papers, lecture outlines, and explore verified career grants.
          </p>

          {/* Mobile-Friendly Quick Level Switcher Pills */}
          <div className="flex items-center justify-center flex-wrap gap-2 mt-6">
            <span className="text-[11px] font-medium text-emerald-300 hidden sm:inline-block mr-1">
              Quick Jump:
            </span>
            {[
              { label: '100L', path: '/resources?level=100' },
              { label: '200L', path: '/resources?level=200' },
              { label: '300L', path: '/resources?level=300' },
              { label: '400L', path: '/resources?level=400' },
              { label: 'PG & Masters', path: '/resources?level=Postgraduate' },
            ].map((lvl) => (
              <Link
                key={lvl.label}
                to={lvl.path}
                className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-emerald-100 transition-all hover:scale-105 active:scale-95"
              >
                {lvl.label}
              </Link>
            ))}
          </div>

          {/* Search Bar Trigger */}
          <div className="w-full max-w-xl mt-6">
            <button
              onClick={onOpenSearch}
              className="w-full flex items-center justify-between p-2 pl-4 bg-white text-text-main rounded-2xl shadow-xl hover:shadow-2xl transition-all group border border-white/40 active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-brand-green group-hover:scale-110 transition-transform" />
                <span className="text-xs sm:text-sm text-text-muted truncate">
                  Search course code (e.g. STA 211), past papers, notes...
                </span>
              </div>
              <span className="bg-brand-green text-white text-xs font-bold px-4 py-2 rounded-xl group-hover:bg-brand-deep transition-colors shrink-0">
                Search
              </span>
            </button>
          </div>

          {/* Strict Hero Button Hierarchy: Primary (Past Questions) vs Secondary (Submit) */}
          <div className="flex flex-col sm:flex-row items-center gap-3 mt-6 w-full sm:w-auto">
            <Link to="/past-questions" className="w-full sm:w-auto">
              <Button
                size="md"
                variant="primary"
                className="w-full sm:w-auto justify-center bg-emerald-500 hover:bg-emerald-400 text-white font-bold shadow-lg shadow-emerald-950/40 text-xs sm:text-sm h-11 px-6"
              >
                <FileText className="w-4 h-4 mr-2" />
                Explore Past Questions (100L - 400L)
              </Button>
            </Link>

            <Button
              size="md"
              variant="outline"
              onClick={onOpenSubmit}
              className="w-full sm:w-auto justify-center border-white/30 text-white hover:bg-white/10 font-semibold text-xs sm:text-sm h-11 px-5"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Submit Material (No Sign-in)
            </Button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-10 max-w-3xl w-full text-left">
            <div className="p-3 sm:p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <span className="text-xl sm:text-2xl font-bold text-white block">625+</span>
              <span className="text-[11px] sm:text-xs text-emerald-200">Catalogued Materials</span>
            </div>
            <div className="p-3 sm:p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <span className="text-xl sm:text-2xl font-bold text-white block">57</span>
              <span className="text-[11px] sm:text-xs text-emerald-200">Departmental Courses</span>
            </div>
            <div className="p-3 sm:p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <span className="text-xl sm:text-2xl font-bold text-white block">100%</span>
              <span className="text-[11px] sm:text-xs text-emerald-200">Free Instant Access</span>
            </div>
            <div className="p-3 sm:p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <span className="text-xl sm:text-2xl font-bold text-white block">Zero</span>
              <span className="text-[11px] sm:text-xs text-emerald-200">Login Walls</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Urgent Announcement Banner (if any) */}
      {urgentNotice && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-12 relative z-20">
          <div className="p-4 rounded-2xl bg-surface-card border border-red-200 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <Badge variant="urgent" withIcon>IMPORTANT NOTICE</Badge>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-text-main">
                  {urgentNotice.title}
                </h4>
                <p className="text-xs text-text-muted mt-0.5 line-clamp-1">
                  {urgentNotice.summary}
                </p>
              </div>
            </div>
            <Link
              to="/notices"
              className="text-xs font-bold text-brand-red hover:underline shrink-0 inline-flex items-center gap-1 min-h-[36px] items-center"
            >
              Read Full Notice <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* 3. Essential Academic Gateways (Bento Feature Grid) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
          <h2 className="text-xl sm:text-2xl font-bold text-text-main tracking-tight">
            Academic Gateways
          </h2>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Zero-barrier pathways to every verified material maintained for UI Statistics scholars.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Past Questions (Primary Focus) */}
          <div className="p-6 rounded-2xl border border-border-light bg-surface-card shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-brand-green flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-text-main mb-2">
                Past Examination Questions
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Study with past examination questions spanning multiple academic sessions (2018–2025). Includes marking guides and tutorial solutions.
              </p>
            </div>
            <div className="pt-6 mt-4 border-t border-border-light/60 flex items-center justify-between">
              <span className="text-xs font-semibold text-brand-green">100L - 400L Available</span>
              <Link to="/past-questions">
                <Button size="sm" variant="outline" className="font-semibold text-xs">
                  Browse Papers <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Card 2: Lecture Notes & Computing Labs */}
          <div className="p-6 rounded-2xl border border-border-light bg-surface-card shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-text-main mb-2">
                Lecture Notes & R Labs
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Access official departmental course outlines, theoretical notes on Probability & Inference, and statistical computing manuals in R and Python.
              </p>
            </div>
            <div className="pt-6 mt-4 border-t border-border-light/60 flex items-center justify-between">
              <span className="text-xs font-semibold text-cyan-700">{COURSES.length} Courses Catalogued</span>
              <Link to="/resources">
                <Button size="sm" variant="outline" className="font-semibold text-xs">
                  View Catalog <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Card 3: Opportunities & Scholarships */}
          <div className="p-6 rounded-2xl border border-border-light bg-surface-card shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-text-main mb-2">
                Scholarships & Internships
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Hand-vetted scholarship opportunities (MTN Foundation, FSB) and SIWES quantitative analyst internships with verified application deadlines.
              </p>
            </div>
            <div className="pt-6 mt-4 border-t border-border-light/60 flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-700">Verified Grants</span>
              <Link to="/opportunities">
                <Button size="sm" variant="outline" className="font-semibold text-xs">
                  Find Grants <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Level-by-Level Curriculum Navigation */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 rounded-3xl bg-surface-card border border-border-light shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-text-main">
                Browse Curriculum by Level
              </h3>
              <p className="text-xs text-text-muted">
                Quickly jump directly into your academic level's dedicated course materials.
              </p>
            </div>
            <Link to="/resources">
              <span className="text-xs font-semibold text-brand-green hover:underline">
                View All {COURSES.length} Courses →
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { level: '100', name: '100 Level', desc: 'Foundational Probability & Calculus' },
              { level: '200', name: '200 Level', desc: 'Inference & Distribution Theory' },
              { level: '300', name: '300 Level', desc: 'Regression & Experimental Design' },
              { level: '400', name: '400 Level', desc: 'Stochastic & Time Series' },
              { level: 'Postgraduate', name: 'PG & Masters', desc: 'Advanced Biostatistics & Research' },
            ].map((lvl) => (
              <Link
                key={lvl.level}
                to={`/resources?level=${lvl.level}`}
                className="p-4 rounded-xl border border-border-light hover:border-brand-green/60 hover:bg-emerald-50/40 transition-all text-left group active:scale-[0.98]"
              >
                <span className="text-sm font-bold text-text-main group-hover:text-brand-green block">
                  {lvl.name}
                </span>
                <span className="text-[11px] text-text-muted block mt-1 line-clamp-2">
                  {lvl.desc}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Featured Verified Past Questions Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-text-main">
              Recently Verified Past Examination Papers
            </h3>
            <p className="text-xs text-text-muted">
              Ready for immediate 1-tap download. No sign-up required.
            </p>
          </div>
          <Link to="/past-questions">
            <Button size="sm" variant="outline" className="hidden sm:inline-flex text-xs font-semibold">
              View All Past Questions <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {pastQuestions.map((res) => (
            <DownloadCard
              key={res.id}
              resource={res}
              onPreview={(r) => {
                window.location.href = `/resources?id=${r.id}`;
              }}
              onReport={(r) => {
                toast.info('Issue Logged', `Reported issue for ${r.title}`);
              }}
            />
          ))}
        </div>

        <div className="mt-4 text-center sm:hidden">
          <Link to="/past-questions">
            <Button size="md" variant="outline" className="w-full justify-center text-xs font-bold">
              View All Past Questions <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </section>

      {/* 6. Community Call to Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-brand-deep to-emerald-900 text-white p-6 sm:p-12 text-center relative overflow-hidden shadow-xl">
          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <h3 className="text-xl sm:text-3xl font-extrabold tracking-tight">
              Have Past Questions or Tutorial Sheets?
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              Help your fellow coursemates excel. Upload clean copies of lecture notes or past papers. No login or password required — every verified submission helps UI Statistics scholars!
            </p>
            <div className="pt-2">
              <Button
                size="lg"
                variant="primary"
                onClick={onOpenSubmit}
                className="bg-white text-brand-deep hover:bg-emerald-50 shadow-md font-bold text-xs sm:text-sm h-11 px-6 active:scale-95 transition-transform"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Submit an Academic Material (1-Click)
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
