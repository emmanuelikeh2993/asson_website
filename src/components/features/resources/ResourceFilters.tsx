import React from 'react';
import { AcademicLevel, ResourceType, VerificationStatus } from '../../../types';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';

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
  selectedVerification,
  onLevelChange,
  onTypeChange,
  onVerificationChange,
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
    'Reference Material',
  ];

  return (
    <div className="space-y-2.5 my-3">
      {/* 1. DCN-Style Top Segmented Category Capsule Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        {types.map((t) => {
          const isSelected = selectedType === t;
          const label = t === 'All' ? 'All Materials' : t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => onTypeChange(t)}
              className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all duration-150 active:scale-95 cursor-pointer shrink-0 ${
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

      {/* 2. DCN-Style Quick Filter Chips Row (Level Filter & Reset) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-surface-card border border-border-light text-[11px] font-bold text-text-muted shrink-0">
          <SlidersHorizontal className="w-3 h-3 text-brand-green" />
          <span>Level:</span>
        </div>

        {levels.map((lvl) => {
          const isSelected = selectedLevel === lvl;
          const label = lvl === 'All' ? 'All' : lvl === 'Postgraduate' ? 'PG' : `${lvl}L`;
          return (
            <button
              key={lvl}
              type="button"
              onClick={() => onLevelChange(lvl)}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
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
            className="inline-flex items-center gap-1 text-[11px] text-brand-red hover:underline font-bold px-2 py-1 ml-auto shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset ({activeCount})</span>
          </button>
        )}
      </div>
    </div>
  );
};

