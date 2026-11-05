import React from 'react';
import { cn } from '../../lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-gray-200/70",
        className
      )}
      {...props}
    />
  );
};

export const ResourceCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-2xl border border-border-light bg-surface-card p-4 sm:p-5 shadow-card space-y-3.5">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-20 rounded-md" />
        <Skeleton className="h-4 w-16 rounded-md" />
      </div>
      <div className="space-y-1.5">
        <Skeleton className="h-5 w-5/6 rounded-md" />
        <Skeleton className="h-3.5 w-3/5 rounded-md" />
      </div>
      <div className="pt-2 flex items-center justify-between border-t border-border-light/60">
        <Skeleton className="h-3.5 w-24 rounded-md" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-16 rounded-lg" />
          <Skeleton className="h-7 w-20 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export const TableRowSkeleton: React.FC = () => {
  return (
    <tr className="border-b border-border-light/60">
      <td className="py-3.5 px-4"><Skeleton className="h-5 w-16 rounded-md" /></td>
      <td className="py-3.5 px-4"><Skeleton className="h-4 w-48 rounded-md" /></td>
      <td className="py-3.5 px-4"><Skeleton className="h-4 w-20 rounded-md" /></td>
      <td className="py-3.5 px-4"><Skeleton className="h-4 w-16 rounded-md" /></td>
      <td className="py-3.5 px-4"><Skeleton className="h-4 w-14 rounded-md" /></td>
      <td className="py-3.5 px-4 text-right"><Skeleton className="h-7 w-28 rounded-lg ml-auto" /></td>
    </tr>
  );
};

