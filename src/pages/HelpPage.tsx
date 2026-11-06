import React, { useState, useEffect } from 'react';
import { HelpCircle, Mail, MapPin, Clock, Phone, Send, CheckCircle2, AlertCircle, ShieldAlert, Sparkles, MessageSquare } from 'lucide-react';
import { fetchHelpDirectory, submitPrivateFeedback } from '../lib/supabase';
import { HelpDirectoryItem, FeedbackCategory } from '../types';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';

export const HelpPage: React.FC = () => {
  const [helpItems, setHelpItems] = useState<HelpDirectoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Feedback form state
  const [feedbackCategory, setFeedbackCategory] = useState<FeedbackCategory>('General Feedback');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [affectedUrl, setAffectedUrl] = useState('');
  const [contactMethod, setContactMethod] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const toast = useToast();

  useEffect(() => {
    setIsLoading(true);
    fetchHelpDirectory()
      .then((data) => {
        if (data && data.length > 0) setHelpItems(data);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const categories = ['All', 'Departmental Office', 'Academic Advisory', 'Student Welfare', 'Platform Technical Help'];

  const filteredItems = helpItems.filter(
    (item) => selectedCategory === 'All' || item.category === selectedCategory
  );

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      toast.error('Missing Required Fields', 'Please provide a subject and description for your feedback.');
      return;
    }

    setIsSubmitting(true);
    const res = await submitPrivateFeedback({
      category: feedbackCategory,
      subject,
      description,
      affectedUrl: affectedUrl.trim() || undefined,
      contactMethod: contactMethod.trim() || undefined,
    });
    setIsSubmitting(false);

    if (res.success) {
      setFeedbackSubmitted(true);
      toast.success('Feedback Recorded', res.message);
      setSubject('');
      setDescription('');
      setAffectedUrl('');
      setContactMethod('');
    } else {
      toast.error('Submission Failed', 'Could not record feedback. Please try again.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* 1. Header Banner */}
      <div className="pb-6 border-b border-border-light text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-brand-green text-xs font-semibold mb-3 border border-emerald-100">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Official Support & Advisory Channels</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight">
          Where to Get Help
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-text-muted leading-relaxed">
          Verified academic advisers, departmental officers, and student welfare contacts for Statistics students at the University of Ibadan.
        </p>

        {/* Category Filter Pills */}
        <div className="flex items-center justify-center flex-wrap gap-2 mt-6">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-brand-deep text-white shadow-xs'
                  : 'bg-surface-card hover:bg-neutral-100 text-text-muted border border-border-light'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Help Directory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="p-5 sm:p-6 rounded-2xl bg-surface-card border border-border-light hover:border-brand-green/40 shadow-xs hover:shadow-card transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-brand-green border border-emerald-100">
                  {item.category}
                </span>
                <span className="text-[10px] text-text-subtle font-mono">
                  Verified: {item.lastVerifiedDate}
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-text-main mt-1">
                {item.title}
              </h2>
              <p className="text-xs font-semibold text-brand-deep mt-0.5">
                {item.officeOrPerson}
              </p>
              <p className="text-xs text-text-muted mt-2 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-border-light/60 space-y-2 text-xs">
              {item.location && (
                <div className="flex items-start gap-2 text-text-muted">
                  <MapPin className="w-3.5 h-3.5 text-brand-green shrink-0 mt-0.5" />
                  <span>{item.location}</span>
                </div>
              )}
              {item.availability && (
                <div className="flex items-start gap-2 text-text-muted">
                  <Clock className="w-3.5 h-3.5 text-brand-green shrink-0 mt-0.5" />
                  <span>{item.availability}</span>
                </div>
              )}
              {item.contactEmail && (
                <div className="flex items-center gap-2 text-brand-deep font-semibold">
                  <Mail className="w-3.5 h-3.5 text-brand-green shrink-0" />
                  <a href={`mailto:${item.contactEmail}`} className="hover:underline truncate">
                    {item.contactEmail}
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 3. Private Feedback Centre (Directive Section 5.4) */}
      <div className="rounded-3xl bg-surface-card border border-border-light p-6 sm:p-10 shadow-card">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 text-cyan-800 text-xs font-bold border border-cyan-100 mb-2">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Private & Confidential Feedback</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-text-main tracking-tight">
              Private Student Feedback Centre
            </h2>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              Submit observations, report incorrect academic material, suggest improvements, or raise student welfare concerns. Submissions are write-only and restricted to the ASSON Welfare Board.
            </p>
          </div>

          {feedbackSubmitted ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-brand-green mx-auto" />
              <h3 className="text-base font-bold text-text-main">
                Thank You — Feedback Received
              </h3>
              <p className="text-xs text-text-muted max-w-md mx-auto">
                Your submission has been securely recorded. The Welfare and Editorial Board regularly reviews entries to maintain portal accuracy and student support.
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setFeedbackSubmitted(false)}
                className="mt-2 text-xs font-semibold"
              >
                Submit Another Feedback Note
              </Button>
            </div>
          ) : (
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-text-main block mb-1">
                  Feedback Category <span className="text-brand-red">*</span>
                </label>
                <select
                  value={feedbackCategory}
                  onChange={(e) => setFeedbackCategory(e.target.value as FeedbackCategory)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-light bg-surface-bg text-text-main text-xs focus:outline-none focus:border-brand-green"
                >
                  <option value="General Feedback">General Student Feedback</option>
                  <option value="Broken Link / Missing Material">Broken Link / Missing Course Material</option>
                  <option value="Incorrect Information">Incorrect Examination or Syllabus Information</option>
                  <option value="Suggestion">Feature or Resource Suggestion</option>
                  <option value="Welfare Concern">Student Welfare Concern</option>
                  <option value="Appreciation">Appreciation</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-text-main block mb-1">
                  Subject / Title <span className="text-brand-red">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Missing solutions for STA 211 2023 exam, or Timetable clash"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-light bg-surface-bg text-text-main text-xs focus:outline-none focus:border-brand-green"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text-main block mb-1">
                  Detailed Description <span className="text-brand-red">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Please provide specific details so the committee can investigate and resolve the issue..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-light bg-surface-bg text-text-main text-xs focus:outline-none focus:border-brand-green"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-text-main block mb-1">
                    Affected Resource or Page URL (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. https://asson-ui.vercel.app/resources?id=res-1"
                    value={affectedUrl}
                    onChange={(e) => setAffectedUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-light bg-surface-bg text-text-main text-xs focus:outline-none focus:border-brand-green"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-text-main block mb-1">
                    Contact Method for Follow-Up (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Phone, matric no., or student email (if you want a reply)"
                    value={contactMethod}
                    onChange={(e) => setContactMethod(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border-light bg-surface-bg text-text-main text-xs focus:outline-none focus:border-brand-green"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  size="md"
                  variant="primary"
                  disabled={isSubmitting}
                  className="w-full justify-center text-xs font-bold h-11 active:scale-95"
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  {isSubmitting ? 'Recording...' : 'Submit Private Feedback'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

