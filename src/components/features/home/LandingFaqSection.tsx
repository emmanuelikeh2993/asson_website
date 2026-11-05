import React, { useState } from 'react';
import { HelpCircle, ChevronDown, Sparkles, MessageCircle, ArrowRight } from 'lucide-react';
import { MOCK_FAQS } from '../../../lib/mockData';
import { Link } from 'react-router-dom';

export const LandingFaqSection: React.FC = () => {
  const [openIds, setOpenIds] = useState<string[]>([MOCK_FAQS[0]?.id || 'faq-1']);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'Resources', 'Submissions', 'Examinations', 'Verification'];

  const toggleFaq = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredFaqs = MOCK_FAQS.filter((faq) => {
    if (activeCategory === 'All') return true;
    return faq.category?.toLowerCase() === activeCategory.toLowerCase();
  });

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="p-6 sm:p-10 lg:p-12 rounded-3xl bg-surface-card border border-border-light shadow-card relative overflow-hidden">
        {/* Subtle decorative radial glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-green/5 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-brand-green text-xs font-bold border border-emerald-100 mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions? We've Got Reliable Figures</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-text-muted mt-2 leading-relaxed">
            Everything you need to know about accessing past exam papers, lecture notes, zero-login access, and submitting materials.
          </p>

          {/* Category Tabs */}
          <div className="flex items-center justify-center flex-wrap gap-1.5 mt-5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeCategory === cat
                    ? 'bg-brand-deep text-white shadow-xs'
                    : 'bg-surface-bg text-text-muted hover:text-text-main border border-border-light'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Accordion FAQ Items */}
        <div className="space-y-3">
          {filteredFaqs.map((faq) => {
            const isOpen = openIds.includes(faq.id);
            return (
              <div
                key={faq.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'border-brand-green/40 bg-surface-bg/50 shadow-xs'
                    : 'border-border-light bg-surface-card hover:border-brand-green/20'
                }`}
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer select-none"
                  aria-expanded={isOpen}
                >
                  <span className="text-xs sm:text-sm font-bold text-text-main flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-green shrink-0" />
                    {faq.question}
                  </span>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 bg-brand-green text-white' : 'text-text-muted bg-surface-bg border border-border-light'
                    }`}
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 text-xs sm:text-sm text-text-muted leading-relaxed border-t border-border-light/40 animate-in fade-in duration-150">
                    <p className="pt-3 text-[12px] sm:text-xs leading-relaxed text-text-main/90">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still have questions footer */}
        <div className="mt-8 pt-6 border-t border-border-light/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-text-muted text-[11px] sm:text-xs">
            Have a question not listed here or need syllabus guidance?
          </span>
          <Link
            to="/faqs"
            className="inline-flex items-center gap-1.5 font-bold text-brand-green hover:text-brand-deep transition-colors"
          >
            <span>Visit Full FAQ Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};
