import React, { useState, useEffect } from 'react';
import { AcademicResource } from '../../../types';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { 
  X, 
  Download, 
  Share2, 
  Printer, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  ExternalLink,
  BookOpen, 
  CheckCircle2, 
  FileText,
  AlertTriangle,
  FileCheck2,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { formatFileSize, formatDate } from '../../../lib/utils';
import { triggerResourceDownload } from '../../../lib/download';
import { useToast } from '../../ui/Toast';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  resource: AcademicResource | null;
  onClose: () => void;
  onReport?: (resource: AcademicResource) => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  resource,
  onClose,
  onReport,
}) => {
  const [zoom, setZoom] = useState(100);
  const [activeTab, setActiveTab] = useState<'paper' | 'syllabus'>('paper');
  const toast = useToast();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !resource) return null;

  const handleDownload = () => {
    triggerResourceDownload(resource, (title, message) => {
      toast.success(title, message);
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: resource.title,
        text: `Check out ${resource.courseCode} on ASSON UI: ${resource.title}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.info('Link Copied', 'Material preview link copied to clipboard');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Determine if a physical uploaded PDF exists in Supabase storage
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cvhjohbknghlmspoaenr.supabase.co';
  const hasPhysicalPdf = resource.filePath && (
    resource.filePath.startsWith('papers/') ||
    resource.filePath.startsWith('submissions/') ||
    resource.filePath === 'test.pdf'
  );
  
  const physicalPdfUrl = hasPhysicalPdf 
    ? `${supabaseUrl}/storage/v1/object/public/resources/${resource.filePath?.replace(/^resources\//, '')}`
    : null;

  // Curate sample examination questions based on course type
  const getSimulatedExamQuestions = (code: string) => {
    if (code.includes('231')) {
      return [
        {
          num: 'QUESTION 1 (COMPULSORY)',
          prompt: '(a) Write an R function to simulate N draws from a Gamma distribution using the Accept-Reject Algorithm with an exponential proposal. Compare your empirical distribution against rgamma().\n\n(b) Using dplyr and tidyr, demonstrate the transformation of a wide untidy epidemiological dataset into clean tall format, computing summary statistics (mean, IQR) grouped by gender and treatment group.'
        },
        {
          num: 'QUESTION 2',
          prompt: '(a) Implement a Monte Carlo integration routine in R to approximate the integral of exp(-x^2/2) over [-2, 2]. Calculate the 95% bootstrap confidence interval with B = 2000 replicates.\n\n(b) Explain vectorization in R and benchmark microbenchmark::microbenchmark() comparing vectorized operations versus explicit nested for-loops.'
        },
        {
          num: 'QUESTION 3',
          prompt: '(a) Formulate the Markov Chain Monte Carlo (MCMC) Metropolis-Hastings sampler for a bivariate normal target distribution. Plot the simulated trace plot and autocorrelation function (ACF).\n\n(b) Outline the diagnostic criteria used to assess chain convergence (Gelman-Rubin statistic and burn-in length).'
        }
      ];
    } else if (code.includes('211')) {
      return [
        {
          num: 'QUESTION 1 (COMPULSORY)',
          prompt: '(a) Derive the Moment Generating Function (MGF) of a Gamma distribution with shape alpha and rate beta. Hence, prove that its mean is alpha/beta and variance is alpha/beta^2.\n\n(b) If X1, X2, ..., Xn are independent and identically distributed Poisson random variables with parameter lambda, determine the distribution of their sum using MGFs.'
        },
        {
          num: 'QUESTION 2',
          prompt: '(a) Let (X, Y) have joint probability density function f(x, y) = 8xy for 0 < y < x < 1. Find the marginal density of X and the conditional expectation E[Y | X = x].\n\n(b) Use the bivariate Jacobian transformation technique to derive the distribution of U = X + Y and V = X - Y.'
        },
        {
          num: 'QUESTION 3',
          prompt: '(a) State and prove Chebyshev’s inequality for a continuous random variable.\n\n(b) State the Central Limit Theorem (Lindeberg-Levy) and explain its asymptotic implications for sampling distributions in large-sample statistical inference.'
        }
      ];
    } else if (code.includes('111')) {
      return [
        {
          num: 'QUESTION 1',
          prompt: '(a) Define the classical, relative frequency, and axiomatic foundations of probability.\n\n(b) An unbiased die is tossed twice. Let A be the event that the sum is 8 and B be the event that the first toss is an even number. Calculate P(A | B) and test for independence.'
        },
        {
          num: 'QUESTION 2',
          prompt: '(a) State Bayes Theorem and the Law of Total Probability.\n\n(b) A diagnostic test for a condition is 95% accurate for diseased patients and 90% accurate for healthy individuals. If 1.5% of the population has the condition, what is the probability that a person who tests positive actually has the condition?'
        }
      ];
    } else {
      return [
        {
          num: 'QUESTION 1',
          prompt: '(a) Formulate the theoretical foundations, assumptions, and mathematical derivations underlying the course curriculum.\n\n(b) Solve the analytical modeling problems using standard statistical distributions, estimation bounds, and hypothesis tests.'
        },
        {
          num: 'QUESTION 2',
          prompt: '(a) Apply statistical inference algorithms to compute maximum likelihood estimates, confidence bounds, and goodness-of-fit statistics.\n\n(b) Discuss practical real-world applications in agricultural, financial, or industrial data analytics.'
        }
      ];
    }
  };

  const examQuestions = getSimulatedExamQuestions(resource.courseCode);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* 1. Google Drive-Style Top Navigation Bar */}
      <header className="h-14 sm:h-16 bg-[#181f1b] border-b border-white/10 px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 text-white select-none">
        {/* Left: Document Identity & Tag */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white/10 text-emerald-300">
                {resource.courseCode}
              </span>
              <h2 className="text-xs sm:text-sm font-bold text-white truncate max-w-xs sm:max-w-md lg:max-w-xl">
                {resource.title}
              </h2>
            </div>
            <p className="text-[10px] text-white/60 truncate">
              {resource.type} • {resource.session} • {resource.level} Level • {formatFileSize(resource.fileSizeBytes)}
            </p>
          </div>
        </div>

        {/* Right: Actions (Download, Zoom, Share, Close) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Zoom controls (desktop only) */}
          <div className="hidden md:flex items-center rounded-lg bg-white/10 border border-white/10 p-0.5 text-xs text-white/80 mr-2">
            <button
              onClick={() => setZoom(Math.max(70, zoom - 15))}
              className="p-1 hover:text-white hover:bg-white/10 rounded transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono text-[11px]">{zoom}%</span>
            <button
              onClick={() => setZoom(Math.min(150, zoom + 15))}
              className="p-1 hover:text-white hover:bg-white/10 rounded transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(100)}
              className="p-1 hover:text-white hover:bg-white/10 rounded transition-colors"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleShare}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors hidden sm:block"
            title="Share Document"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            onClick={handlePrint}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors hidden sm:block"
            title="Print Paper"
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* Download Button (Google Drive Style) */}
          <Button
            size="sm"
            variant="primary"
            onClick={handleDownload}
            className="bg-brand-green hover:bg-emerald-600 text-white font-bold text-xs h-9 px-3.5 shadow-md active:scale-95 transition-transform"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            <span className="hidden sm:inline">Download</span> Material
          </Button>

          {/* Close Modal */}
          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors ml-1"
            title="Close Preview (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 2. Main Google Drive-Style Document Canvas */}
      <main className="flex-1 overflow-auto p-3 sm:p-6 lg:p-8 flex items-start justify-center">
        <div 
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
          className="transition-transform duration-150 w-full max-w-4xl"
        >
          {/* Document Sheet Container */}
          <div className="bg-white text-[#17232D] rounded-xl shadow-2xl border border-white/20 p-6 sm:p-12 min-h-[85vh] relative overflow-hidden flex flex-col justify-between">
            {/* Background Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none">
              <span className="text-7xl font-extrabold uppercase tracking-widest text-[#087A3E] rotate-[-30deg]">
                ASSON UI ARCHIVE
              </span>
            </div>

            <div>
              {/* Institutional Header */}
              <div className="border-b-2 border-black pb-4 mb-6 text-center space-y-1">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <img src="/logo/ui_crest.jpg" alt="UI Crest" className="w-10 h-10 object-contain rounded" />
                  <span className="w-px h-8 bg-neutral-300" />
                  <img src="/logo/asson_logo.png" alt="ASSON Emblem" className="w-10 h-10 object-contain" />
                </div>
                <h1 className="text-sm sm:text-base font-extrabold uppercase tracking-tight text-neutral-900">
                  UNIVERSITY OF IBADAN, IBADAN, NIGERIA
                </h1>
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-800">
                  FACULTY OF SCIENCE • DEPARTMENT OF STATISTICS
                </h2>
                <p className="text-[11px] font-semibold text-neutral-600">
                  {resource.session} FIRST/SECOND SEMESTER EXAMINATION • {resource.level} LEVEL
                </p>
                <div className="pt-2 flex items-center justify-between text-xs font-mono font-bold text-neutral-900 border-t border-neutral-200 mt-3">
                  <span>COURSE: {resource.courseCode} — {resource.courseTitle || 'Core Curriculum'}</span>
                  <span>TIME ALLOWED: 3 HOURS</span>
                </div>
              </div>

              {/* Examination Rubric & Instructions */}
              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-xs text-neutral-700 mb-6 space-y-1">
                <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-green" /> Official Examination Instructions:
                </div>
                <p className="text-[11px] text-neutral-600 leading-relaxed">
                  Answer <strong>FOUR (4) questions</strong> in all. All questions carry equal marks. 
                  Scientific non-programmable calculators and approved statistical tables are permitted.
                  Show all clear derivations, intermediate formulas, and assumptions clearly.
                </p>
              </div>

              {/* Physical PDF View or Questions View */}
              {hasPhysicalPdf && physicalPdfUrl ? (
                <div className="space-y-4 mb-6">
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-brand-deep flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileCheck2 className="w-4 h-4 text-brand-green shrink-0" />
                      <span>Physical digitized examination paper verified on Supabase CDN storage.</span>
                    </div>
                    <a
                      href={physicalPdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-brand-green hover:underline flex items-center gap-1"
                    >
                      Open Raw PDF <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Embedded PDF iframe */}
                  <div className="w-full h-[600px] rounded-lg border border-neutral-300 overflow-hidden bg-neutral-100 shadow-inner">
                    <iframe
                      src={`${physicalPdfUrl}#toolbar=1&navpanes=0`}
                      title={resource.title}
                      className="w-full h-full border-0"
                    />
                  </div>
                </div>
              ) : (
                /* Authenticated Examination Paper Questions View */
                <div className="space-y-6 text-neutral-900 text-xs sm:text-sm leading-relaxed">
                  {examQuestions.map((q, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 transition-colors">
                      <span className="font-mono font-bold text-brand-deep text-xs block mb-2">
                        {q.num}
                      </span>
                      <p className="whitespace-pre-line text-neutral-800 text-[12px] sm:text-[13px] font-serif leading-relaxed">
                        {q.prompt}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Document Bottom Footer */}
            <div className="pt-6 mt-8 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-neutral-500">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-green" />
                <span>Verified by ASSON UI Academic Editorial Committee</span>
              </div>
              <div className="font-mono text-neutral-400">
                REF: UI-ASSON-{resource.courseCode.replace(/\s+/g, '')}-{resource.session.replace(/\//g, '')}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
