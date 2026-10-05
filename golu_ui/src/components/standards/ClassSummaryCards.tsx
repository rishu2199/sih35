import React from 'react';
import { WeightAccuracyClass, StandardWeightSet } from './types';
import { Scale, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface ClassSummaryCardsProps {
  standards: StandardWeightSet[];
  selectedClassFilter: WeightAccuracyClass | 'ALL';
  onSelectClassFilter: (cls: WeightAccuracyClass | 'ALL') => void;
}

export const ClassSummaryCards: React.FC<ClassSummaryCardsProps> = ({
  standards,
  selectedClassFilter,
  onSelectClassFilter,
}) => {
  const classes: WeightAccuracyClass[] = ['E1', 'E2', 'F1', 'M1'];

  const classDescriptions: Record<WeightAccuracyClass, string> = {
    E1: 'Primary Reference (High Precision Micro)',
    E2: 'High Accuracy Laboratory Analytical',
    F1: 'Precision Commercial & Industrial Scale',
    M1: 'Medium Accuracy Cast Iron & Working Standard',
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 select-none font-mono">
      {classes.map((cls) => {
        const setsOfClass = standards.filter((s) => s.accuracyClass === cls);
        const count = setsOfClass.length;
        const hasExpired = setsOfClass.some((s) => s.status === 'EXPIRED');
        const hasExpiring = setsOfClass.some((s) => s.status === 'EXPIRING');
        const isSelected = selectedClassFilter === cls;

        let statusText = '✓ All Valid';
        let statusColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
        let statusIcon = <CheckCircle2 size={12} className="text-emerald-600" />;

        if (hasExpired) {
          statusText = '✕ Expired (Locked)';
          statusColor = 'text-rose-700 bg-rose-50 border-rose-200 font-bold';
          statusIcon = <XCircle size={12} className="text-rose-600" />;
        } else if (hasExpiring) {
          const minDays = Math.min(...setsOfClass.filter((s) => s.status === 'EXPIRING').map((s) => s.daysRemaining));
          statusText = `⚠ ${minDays} days remaining`;
          statusColor = 'text-amber-800 bg-amber-50 border-amber-200 font-bold';
          statusIcon = <AlertTriangle size={12} className="text-amber-600" />;
        }

        return (
          <button
            key={cls}
            type="button"
            onClick={() => onSelectClassFilter(isSelected ? 'ALL' : cls)}
            className={`p-4 rounded-xl border text-left transition-all relative cursor-pointer ${
              isSelected
                ? 'bg-brand-50/70 border-brand-500 ring-2 ring-brand-100 shadow-xs'
                : 'bg-white border-foundation-200 hover:bg-foundation-50/60 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between pb-1">
              <span className="text-lg font-black tracking-tight text-foundation-950 font-sans">
                Class {cls}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1 ${statusColor}`}>
                {statusIcon}
                <span>{statusText}</span>
              </span>
            </div>

            <div className="text-2xl font-black text-foundation-900 mt-1">
              {count} {count === 1 ? 'set' : 'sets'}
            </div>

            <p className="text-[10px] text-foundation-500 font-sans mt-1 truncate">
              {classDescriptions[cls]}
            </p>

            {isSelected && (
              <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-brand-600" />
            )}
          </button>
        );
      })}
    </div>
  );
};
