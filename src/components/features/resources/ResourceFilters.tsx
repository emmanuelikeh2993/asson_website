import React from 'react';
import { AcademicLevel, ResourceType, VerificationStatus } from '../../../types';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Filter, X, RotateCcw } from 'lucide-react';

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
    <div className="flex flex-col gap-3 py-3 border-y border-border-light/80 bg-surface-card/60 rounded-xl px-4 my-3">
      {/* Level Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-text-muted mr-1 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5 text-brand-green" /> Level:
        </span>
        {levels.map((lvl) => (
          <button
            key={lvl}
            onClick={() => onLevelChange(lvl)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
              selectedLevel === lvl
                ? 'bg-brand-green text-white shadow-sm'
                : 'bg-surface-bg text-text-main hover:bg-emerald-50 hover:text-brand-deep border border-border-light/60'
            }`}
          >
            {lvl === 'All' ? 'All Levels' : `${lvl}L`}
          </button>
        ))}
      </div>

      {/* Resource Type Chips */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border-light/40">
        <span className="text-xs font-semibold text-text-muted mr-1">Category:</span>
        {types.map((t) => (
          <button
            key={t}
            onClick={() => onTypeChange(t)}
            className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
              selectedType === t
                ? 'bg-brand-deep text-white shadow-sm'
                : 'bg-surface-bg text-text-muted hover:text-text-main hover:bg-gray-200/60 border border-border-light/60'
            }`}
          >
            {t}
          </button>
        ))}

        {/* Verification Filter & Clear All */}
        <div className="ml-auto flex items-center gap-2">
          {activeCount > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onReset}
              className="text-xs text-brand-red hover:bg-red-50 hover:text-brand-red h-7 px-2"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Reset ({activeCount})
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

