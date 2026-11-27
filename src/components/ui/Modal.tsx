import React, { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  hideHeader?: boolean;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
  hideHeader = false,
}) => {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';

    // Move initial keyboard focus into the dialog cleanly
    const focusTimer = window.setTimeout(() => {
      const dialogEl = dialogRef.current;
      if (!dialogEl) return;
      const focusable = Array.from(dialogEl.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusable.length > 0) {
        focusable[0].focus();
      } else {
        dialogEl.focus();
      }
    }, 0);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
        );
        if (focusable.length === 0) {
          e.preventDefault();
          dialogRef.current.focus();
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog with Sticky Header, Focus Trap & Scrollable Body */}
      <div 
        ref={dialogRef}
        tabIndex={-1}
        className={cn(
          "relative w-full max-h-[92vh] flex flex-col rounded-2xl bg-surface-card shadow-modal border border-border-light z-10 animate-in fade-in duration-150 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green",
          maxWidthStyles[maxWidth]
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title && !hideHeader ? titleId : undefined}
      >
        {!hideHeader && (
          <div className="sticky top-0 bg-surface-card z-30 flex items-center justify-between px-5 py-3.5 border-b border-border-light shrink-0">
            {title && (
              <h3 id={titleId} className="text-base font-bold text-text-main">
                {title}
              </h3>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-3 py-2 min-h-[44px] text-text-muted hover:bg-surface-bg hover:text-text-main transition-colors ml-auto border border-border-light shadow-2xs flex items-center gap-1.5 cursor-pointer text-xs font-medium"
              aria-label="Close modal"
              title="Close (Esc)"
            >
              <span className="text-xs font-semibold text-text-muted">Close</span>
              <X className="w-4 h-4 text-text-muted" aria-hidden="true" />
            </button>
          </div>
        )}
        <div className={cn("overflow-y-auto flex-1", hideHeader ? "p-0" : "p-5 sm:p-6")}>{children}</div>
      </div>
    </div>
  );
};

