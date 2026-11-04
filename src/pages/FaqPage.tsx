import React, { useState, useEffect } from 'react';
import { MOCK_FAQS } from '../lib/mockData';
import { fetchFaqs } from '../lib/supabase';
import { FAQItem } from '../types';
import { HelpCircle, ChevronDown } from 'lucide-react';

export const FaqPage: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQItem[]>(MOCK_FAQS);
  const [openIds, setOpenIds] = useState<string[]>([MOCK_FAQS[0].id]);

  useEffect(() => {
    fetchFaqs().then((data) => {
      if (data && data.length > 0) {
        setFaqs(data);
      }
    });
  }, []);

  const toggleFaq = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-10">
        <span className="p-2 rounded-full bg-emerald-50 text-brand-green inline-block mb-3">
          <HelpCircle className="w-6 h-6" />
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-xs sm:text-sm text-text-muted mt-2">
          Find fast answers regarding academic materials, past questions, portal rules, and resource submissions.
        </p>
      </div>

      {/* Accordion List (inspired by Image 19) */}
      <div className="space-y-3">
        {faqs.map((faq) => {
          const isOpen = openIds.includes(faq.id);
          return (
            <div
              key={faq.id}
              className={`rounded-2xl border transition-all ${
                isOpen
                  ? 'border-brand-green/40 bg-surface-card shadow-sm'
                  : 'border-border-light bg-surface-card hover:border-border-hover'
              }`}
            >
              <button
                onClick={() => toggleFaq(faq.id)}
                className="w-full text-left p-5 flex items-center justify-between gap-4"
              >
                <span className="text-sm font-bold text-text-main">
                  {faq.question}
                </span>
                <span
                  className={`w-8 h-8 rounded-full border border-border-light flex items-center justify-center shrink-0 transition-transform duration-200 ${
                    isOpen ? 'bg-brand-green text-white rotate-180 border-brand-green' : 'bg-surface-bg text-text-muted'
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </span>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-text-muted leading-relaxed border-t border-border-light/40 pt-3 animate-in fade-in duration-150">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

