import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
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

      {/* Modal Dialog with Sticky Header & Scrollable Body */}
      <div 
        className={cn(
          "relative w-full max-h-[92vh] flex flex-col rounded-2xl bg-surface-card shadow-modal border border-border-light z-10 animate-in fade-in duration-150 overflow-hidden",
          maxWidthStyles[maxWidth]
        )}
        role="dialog"
        aria-modal="true"
      >
        <div className="sticky top-0 bg-surface-card z-30 flex items-center justify-between px-5 py-4 border-b border-border-light shrink-0">
          {title && <h3 className="text-base font-bold text-text-main">{title}</h3>}
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-2.5 py-1 text-text-muted hover:bg-surface-bg hover:text-text-main transition-colors ml-auto border border-border-light shadow-2xs flex items-center gap-1.5 cursor-pointer text-xs font-medium"
            aria-label="Close modal"
            title="Close (Esc)"
          >
            <span className="text-[11px] font-semibold text-text-muted">Close</span>
            <X className="w-4 h-4 text-text-muted" />
          </button>
        </div>
        <div className="overflow-y-auto p-5 sm:p-6 flex-1">{children}</div>
      </div>
    </div>
  );
};

