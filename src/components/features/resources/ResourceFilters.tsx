import React from 'react';
import { AcademicLevel, ResourceType, VerificationStatus } from '../../../types';
import { RotateCcw } from 'lucide-react';

interface ResourceFiltersProps {
  selectedLevel: AcademicLevel | 'All';
  selectedType: ResourceType | 'All';
  selectedVerification: VerificationStatus | 'All';
  onLevelChange: (level: AcademicLevel | 'All') => void;
  onTypeChange: (type: ResourceType | 'All') => void;
  onVerificationChange: (status: VerificationStatus | 'All') => void;
  onReset: () => void;
  activeCount: number;
}

export const ResourceFilters: React.FC<ResourceFiltersProps> = ({
  selectedLevel,
  selectedType,
  onLevelChange,
  onTypeChange,
  onReset,
  activeCount,
}) => {
  const levels: (AcademicLevel | 'All')[] = ['All', '100', '200', '300', '400', 'Postgraduate'];
  const types: (ResourceType | 'All')[] = [
    'All',
    'Past Question',
    'Lecture Note',
    'Course Outline',
    'Tutorial Sheet',
  ];

  return (
    <div className="space-y-2 my-3">
      {/* 1. Types Segment Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        {types.map((t) => {
          const isSelected = selectedType === t;
          const label = t === 'All' ? 'All Materials' : t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => onTypeChange(t)}
              className={`px-3.5 py-2 min-h-[44px] sm:min-h-[38px] rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-brand-green text-white shadow-2xs'
                  : 'bg-surface-card border border-border-light text-text-muted hover:text-text-main hover:bg-surface-bg'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* 2. Levels Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-xs font-bold text-text-muted mr-1 shrink-0">Level:</span>
        {levels.map((lvl) => {
          const isSelected = selectedLevel === lvl;
          const label = lvl === 'All' ? 'All' : lvl === 'Postgraduate' ? 'PG' : `${lvl}L`;
          return (
            <button
              key={lvl}
              type="button"
              onClick={() => onLevelChange(lvl)}
              className={`px-3 py-2 min-h-[44px] min-w-[44px] sm:min-h-[38px] rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-brand-deep text-white shadow-2xs font-bold'
                  : 'bg-surface-card border border-border-light text-text-muted hover:text-text-main'
              }`}
            >
              {label}
            </button>
          );
        })}

        {activeCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 text-xs text-brand-red hover:underline font-bold px-3 min-h-[44px] sm:min-h-[38px] ml-auto shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Reset ({activeCount})</span>
          </button>
        )}
      </div>
    </div>
  );
};
