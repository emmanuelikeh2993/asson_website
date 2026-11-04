import React from 'react';
import { cn } from '../../lib/utils';
import { CheckCircle2, Clock, AlertTriangle, AlertCircle, Archive } from 'lucide-react';

export type BadgeVariant = 
  | 'verified' 
  | 'needs-review' 
  | 'pending' 
  | 'approved' 
  | 'changes-requested'
  | 'urgent'
  | 'neutral'
  | 'course';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  withIcon?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'neutral',
  withIcon = false,
  children,
  ...props
}) => {
  const baseStyles = "inline-flex items-center font-medium text-xs px-2.5 py-0.5 rounded-full transition-colors whitespace-nowrap gap-1";

  const variantStyles: Record<BadgeVariant, string> = {
    verified: "bg-emerald-50 text-emerald-800 border border-emerald-200",
    approved: "bg-emerald-50 text-emerald-800 border border-emerald-200",
    'needs-review': "bg-amber-50 text-amber-800 border border-amber-200",
    pending: "bg-blue-50 text-blue-800 border border-blue-200",
    'changes-requested': "bg-rose-50 text-rose-800 border border-rose-200",
    urgent: "bg-red-50 text-brand-red border border-red-200 font-semibold animate-pulse",
    neutral: "bg-gray-100 text-text-muted border border-gray-200",
    course: "bg-brand-light text-brand-deep font-semibold tracking-wide border border-emerald-200",
  };

  const renderIcon = () => {
    if (!withIcon) return null;
    switch (variant) {
      case 'verified':
      case 'approved':
        return <CheckCircle2 className="w-3 h-3 text-emerald-600" />;
      case 'needs-review':
        return <AlertTriangle className="w-3 h-3 text-amber-600" />;
      case 'pending':
        return <Clock className="w-3 h-3 text-blue-600" />;
      case 'changes-requested':
      case 'urgent':
        return <AlertCircle className="w-3 h-3 text-rose-600" />;
      default:
        return null;
    }
  };

  return (
    <span className={cn(baseStyles, variantStyles[variant], className)} {...props}>
      {renderIcon()}
      {children}
    </span>
  );
};

