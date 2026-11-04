import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { DownloadCard } from '../components/features/resources/DownloadCard';
import { MOCK_RESOURCES, MOCK_NOTICES, MOCK_OPPORTUNITIES, COURSES } from '../lib/mockData';
import { 
  Search, 
  BookOpen, 
  FileText, 
  GraduationCap, 
  Briefcase, 
  Bell, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles,
  Download
} from 'lucide-react';
import { AcademicResource, Notice } from '../types';
import { fetchResources, fetchNotices } from '../lib/supabase';
import { useState, useEffect } from 'react';

interface HomePageProps {
  onOpenSearch: () => void;
  onOpenSubmit: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onOpenSearch, onOpenSubmit }) => {
  const [resources, setResources] = useState<AcademicResource[]>(MOCK_RESOURCES);
  const [notices, setNotices] = useState<Notice[]>(MOCK_NOTICES);

  useEffect(() => {
    fetchResources().then((data) => {
      if (data && data.length > 0) setResources(data);
    });
    fetchNotices().then((data) => {
      if (data && data.length > 0) setNotices(data);
    });
  }, []);

  const pastQuestions = resources.filter((r) => r.type === 'Past Question').slice(0, 4);
  const urgentNotice = notices.find((n) => n.isUrgent);

  return (
    <div className="space-y-16 pb-12">
      {/* 1. Hero Section (inspired by Image 07 & Image 01) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-brand-deep to-emerald-900 text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Subtle patterned overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#55C9D5_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center text-center">
          {/* Institutional Trust Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs text-emerald-200 font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Association of Statistics Students of Nigeria • University of Ibadan</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl leading-tight">
            Together for <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-cyan-300 to-white">Academic Excellence</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-4 text-sm sm:text-base text-emerald-100/90 max-w-2xl leading-relaxed">
            Your permanent, searchable academic resource hub for the Department of Statistics. Retrieve verified past examination questions, approved lecture notes, and verified career opportunities.
          </p>

          {/* Hero Quick Search Bar (inspired by Image 07 & 21) */}
          <div className="w-full max-w-xl mt-8">
            <button
              onClick={onOpenSearch}
              className="w-full flex items-center justify-between p-2 pl-4 bg-white text-text-main rounded-2xl shadow-xl hover:shadow-2xl transition-all group border border-white/40"
            >
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5 text-brand-green group-hover:scale-110 transition-transform" />
                <span className="text-xs sm:text-sm text-text-muted">
                  Search course code (e.g. STA 211), syllabus, notes...
                </span>
              </div>
              <span className="bg-brand-green text-white text-xs font-semibold px-4 py-2 rounded-xl group-hover:bg-brand-deep transition-colors">
                Explore
              </span>
            </button>
          </div>

          {/* Quick Stats Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 max-w-3xl w-full text-left">
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="text-2xl font-bold text-white block">100+</span>
              <span className="text-xs text-emerald-200">Verified Past Papers</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="text-2xl font-bold text-white block">12+</span>
              <span className="text-xs text-emerald-200">Departmental Courses</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="text-2xl font-bold text-white block">100%</span>
              <span className="text-xs text-emerald-200">Free Instant Access</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="text-2xl font-bold text-white block">Vetted</span>
              <span className="text-xs text-emerald-200">Editorial Quality</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Urgent Announcement Banner (if any) */}
      {urgentNotice && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
          <div className="p-4 rounded-xl bg-red-50 border border-brand-red/30 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <Badge variant="urgent" withIcon>IMPORTANT</Badge>
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
              className="text-xs font-semibold text-brand-red hover:underline shrink-0 inline-flex items-center gap-1"
            >
              Read Full Notice <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* 3. Bento Feature Grid (inspired by Image 08 & Image 03) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-xl sm:text-2xl font-bold text-text-main">
            Essential Academic Gateways
          </h2>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Fast, zero-login pathways to every verified material maintained for UI Statistics students.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                Study with past examination questions spanning multiple academic sessions (2018–2024). Includes marking outlines and worked solutions.
              </p>
            </div>
            <div className="pt-6 mt-4 border-t border-border-light/60 flex items-center justify-between">
              <span className="text-xs font-semibold text-brand-green">100L - 400L Available</span>
              <Link to="/past-questions">
                <Button size="sm" variant="outline">
                  Browse Papers <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Card 2: Lecture Notes & Lab Outlines */}
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
              <span className="text-xs font-semibold text-cyan-700">Course Outlines & Codes</span>
              <Link to="/resources">
                <Button size="sm" variant="outline">
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
              <span className="text-xs font-semibold text-amber-700">Verified Opportunities</span>
              <Link to="/opportunities">
                <Button size="sm" variant="outline">
                  Find Grants <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Level-by-Level Quick Navigation (inspired by Image 03) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-3xl bg-surface-card border border-border-light shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-text-main">
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
              { level: '100', name: '100 Level', desc: 'Foundational Probability' },
              { level: '200', name: '200 Level', desc: 'Inference & Distribution' },
              { level: '300', name: '300 Level', desc: 'Regression & Experimental Design' },
              { level: '400', name: '400 Level', desc: 'Stochastic & Time Series' },
              { level: 'Postgraduate', name: 'PG & Masters', desc: 'Advanced Research' },
            ].map((lvl) => (
              <Link
                key={lvl.level}
                to={`/resources?level=${lvl.level}`}
                className="p-4 rounded-xl border border-border-light hover:border-brand-green/60 hover:bg-emerald-50/40 transition-all text-left group"
              >
                <span className="text-sm font-bold text-text-main group-hover:text-brand-green block">
                  {lvl.name}
                </span>
                <span className="text-[11px] text-text-muted block mt-1">
                  {lvl.desc}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Featured Verified Past Questions Carousel/Grid (inspired by Image 06 & Image 15) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-text-main">
              Recently Verified Past Examination Papers
            </h3>
            <p className="text-xs text-text-muted">
              Ready for immediate download. No sign-up required.
            </p>
          </div>
          <Link to="/past-questions">
            <Button size="sm" variant="outline">
              View All Past Questions <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {pastQuestions.map((res) => (
            <DownloadCard
              key={res.id}
              resource={res}
              onPreview={(r) => alert(`Previewing ${r.title}`)}
              onReport={(r) => alert(`Reporting ${r.title}`)}
            />
          ))}
        </div>
      </section>

      {/* 6. Community Call to Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-brand-deep to-emerald-900 text-white p-8 sm:p-12 text-center relative overflow-hidden shadow-xl">
          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Have Past Questions or Tutorial Sheets?
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              Help your peers excel. Submit legible lecture notes or past papers. Every verified contribution supports the academic growth of UI Statistics scholars.
            </p>
            <div className="pt-2">
              <Button
                size="lg"
                variant="primary"
                onClick={onOpenSubmit}
                className="bg-white text-brand-deep hover:bg-emerald-50 shadow-md font-bold text-sm"
              >
                Submit an Academic Material
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

