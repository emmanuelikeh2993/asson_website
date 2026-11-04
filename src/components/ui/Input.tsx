import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, icon, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-text-main mb-1.5">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3 text-text-muted pointer-events-none flex items-center justify-center">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            type={type}
            className={cn(
              "w-full rounded-lg border border-border-light bg-surface-card px-3.5 py-2 text-sm text-text-main placeholder:text-text-subtle transition-colors",
              "focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green",
              "disabled:bg-gray-50 disabled:cursor-not-allowed",
              icon ? "pl-9" : "",
              error ? "border-brand-red focus:border-brand-red focus:ring-brand-red" : "",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-brand-red font-medium">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

