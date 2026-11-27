import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, Mail, MapPin, Clock, Send, Compass, ArrowLeft, MessageSquare, CheckCircle2 } from 'lucide-react';
import { fetchHelpDirectory, submitPrivateFeedback } from '../lib/supabase';
import { HelpDirectoryItem, FeedbackCategory } from '../types';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import { useOnboarding } from '../context/OnboardingContext';

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
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ subject?: string; description?: string }>({});

  const toast = useToast();
  const { restartOnboarding } = useOnboarding();

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
    setFeedbackError(null);
    const nextErrors: { subject?: string; description?: string } = {};
    if (!subject.trim()) nextErrors.subject = 'Please enter a short subject for your feedback.';
    if (!description.trim()) nextErrors.description = 'Please describe the issue or suggestion.';

    if (nextErrors.subject || nextErrors.description) {
      setFieldErrors(nextErrors);
      toast.error('Missing Required Fields', 'Please provide a subject and description for your feedback.');
      return;
    }

    setFieldErrors({});
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
      setFeedbackError('Could not record feedback right now. Please check your connection and try again.');
      toast.error('Submission Failed', 'Could not record feedback. Please try again.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* 1. Header Banner */}
      <div className="pb-6 border-b border-border-light text-center max-w-2xl mx-auto">
        <div className="flex justify-center mb-2">
          <Link
            to="/more"
            className="inline-flex items-center gap-1.5 min-h-[44px] px-3 text-xs font-semibold text-text-muted hover:text-brand-green transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Back to More</span>
          </Link>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-brand-deep dark:text-emerald-300 text-xs font-semibold mb-3 border border-emerald-200 dark:border-emerald-800">
          <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Official Support &amp; Advisory Channels</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight">
          Where to Get Help
        </h1>
        <p className="mt-2 text-sm text-text-muted leading-relaxed">
          Verified academic advisers, departmental officers, and student welfare contacts for Statistics students at the University of Ibadan.
        </p>

        {/* Restart Interactive Onboarding Guide */}
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={restartOnboarding}
            className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] rounded-xl bg-brand-light text-brand-deep dark:text-emerald-300 hover:bg-emerald-100/80 dark:hover:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-xs font-bold transition-all cursor-pointer active:scale-95"
          >
            <Compass className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Restart Interactive Platform Tour</span>
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center justify-center flex-wrap gap-2 mt-6">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 min-w-[44px] min-h-[44px] sm:min-h-[38px] rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-brand-deep text-white shadow-xs'
                  : 'bg-surface-card hover:bg-surface-bg text-text-muted border border-border-light'
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
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-brand-deep dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {item.category}
                </span>
                <span className="text-xs text-text-subtle font-mono">
                  Verified: {item.lastVerifiedDate}
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-text-main mt-1">
                {item.title}
              </h2>
              <p className="text-xs font-semibold text-brand-deep dark:text-emerald-300 mt-0.5">
                {item.officeOrPerson}
              </p>
              <p className="text-sm text-text-muted mt-2 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-border-light/60 space-y-2 text-xs">
              {item.location && (
                <div className="flex items-start gap-2 text-text-muted">
                  <MapPin className="w-3.5 h-3.5 text-brand-green shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{item.location}</span>
                </div>
              )}
              {item.availability && (
                <div className="flex items-start gap-2 text-text-muted">
                  <Clock className="w-3.5 h-3.5 text-brand-green shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{item.availability}</span>
                </div>
              )}
              {item.contactEmail && (
                <div className="flex items-center gap-2 text-brand-deep dark:text-emerald-300 font-semibold">
                  <Mail className="w-3.5 h-3.5 text-brand-green shrink-0" aria-hidden="true" />
                  <a href={`mailto:${item.contactEmail}`} className="inline-flex items-center min-h-[44px] sm:min-h-[36px] py-1 hover:underline truncate">
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
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-200 text-xs font-bold border border-cyan-100 dark:border-cyan-800 mb-2">
              <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Private &amp; Confidential Feedback</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-text-main tracking-tight">
              Private Student Feedback Centre
            </h2>
            <p className="text-sm text-text-muted mt-1 leading-relaxed">
              Submit observations, report incorrect academic material, suggest improvements, or raise student welfare concerns. Submissions are write-only and restricted to the ASSON Welfare Board.
            </p>
          </div>

          {feedbackSubmitted ? (
            <div
              role="status"
              aria-live="polite"
              className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-center space-y-3"
            >
              <CheckCircle2 className="w-10 h-10 text-brand-green mx-auto" aria-hidden="true" />
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
            <form onSubmit={handleFeedbackSubmit} noValidate className="space-y-4">
              {feedbackError && (
                <div role="alert" className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-brand-red font-medium">
                  {feedbackError}
                </div>
              )}

              <div>
                <label htmlFor="fb-category" className="text-xs font-bold text-text-main block mb-1">
                  Feedback Category <span className="text-brand-red">*</span>
                </label>
                <select
                  id="fb-category"
                  value={feedbackCategory}
                  onChange={(e) => setFeedbackCategory(e.target.value as FeedbackCategory)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-border-light bg-surface-bg text-text-main text-base focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/30"
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
                <label htmlFor="fb-subject" className="text-xs font-bold text-text-main block mb-1">
                  Subject / Title <span className="text-brand-red">*</span>
                </label>
                <input
                  id="fb-subject"
                  type="text"
                  placeholder="e.g. Missing solutions for STA 211 2023 exam, or Timetable clash"
                  value={subject}
                  aria-invalid={Boolean(fieldErrors.subject)}
                  aria-describedby={fieldErrors.subject ? 'fb-subject-error' : undefined}
                  onChange={(e) => {
                    setSubject(e.target.value);
                    if (fieldErrors.subject) setFieldErrors((prev) => ({ ...prev, subject: undefined }));
                  }}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-border-light bg-surface-bg text-text-main text-base focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/30"
                  required
                />
                {fieldErrors.subject && (
                  <p id="fb-subject-error" role="alert" className="text-xs text-brand-red mt-1 font-medium">
                    {fieldErrors.subject}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="fb-description" className="text-xs font-bold text-text-main block mb-1">
                  Detailed Description <span className="text-brand-red">*</span>
                </label>
                <textarea
                  id="fb-description"
                  rows={4}
                  placeholder="Please provide specific details so the committee can investigate and resolve the issue..."
                  value={description}
                  aria-invalid={Boolean(fieldErrors.description)}
                  aria-describedby={fieldErrors.description ? 'fb-description-error' : undefined}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (fieldErrors.description) setFieldErrors((prev) => ({ ...prev, description: undefined }));
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-light bg-surface-bg text-text-main text-base focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/30"
                  required
                />
                {fieldErrors.description && (
                  <p id="fb-description-error" role="alert" className="text-xs text-brand-red mt-1 font-medium">
                    {fieldErrors.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="fb-url" className="text-xs font-bold text-text-main block mb-1">
                    Affected Resource or Page URL (Optional)
                  </label>
                  <input
                    id="fb-url"
                    type="text"
                    placeholder="e.g. https://asson-ui.vercel.app/resources?id=res-1"
                    value={affectedUrl}
                    onChange={(e) => setAffectedUrl(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-border-light bg-surface-bg text-text-main text-base focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/30"
                  />
                </div>
                <div>
                  <label htmlFor="fb-contact" className="text-xs font-bold text-text-main block mb-1">
                    Contact Method for Follow-Up (Optional)
                  </label>
                  <input
                    id="fb-contact"
                    type="text"
                    placeholder="Phone or student email (if you want a reply)"
                    value={contactMethod}
                    onChange={(e) => setContactMethod(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-border-light bg-surface-bg text-text-main text-base focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/30"
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

