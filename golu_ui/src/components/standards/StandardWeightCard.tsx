import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  ShieldCheck,
  Scale,
  Calendar,
  Clock,
  ArrowRight,
  ExternalLink,
  Layers,
  Lock,
} from 'lucide-react';
import { StandardWeightSet } from './types';

interface StandardWeightCardProps {
  standard: StandardWeightSet;
  isSelectedForTesting: boolean;
  onSelectForTesting: (standard: StandardWeightSet) => void;
  onViewDetails: (standard: StandardWeightSet) => void;
  onReplaceStandard?: (standard: StandardWeightSet) => void;
  onViewAssignedSessions?: (standard: StandardWeightSet) => void;
  userRole?: string;
}

export const StandardWeightCard: React.FC<StandardWeightCardProps> = ({
  standard,
  isSelectedForTesting,
  onSelectForTesting,
  onViewDetails,
  onReplaceStandard,
  onViewAssignedSessions,
  userRole = 'METROLOGIST',
}) => {
  const isExpired = standard.status === 'EXPIRED';
  const isExpiring = standard.status === 'EXPIRING';
  const isRetired = standard.status === 'RETIRED';

  // Validity percentage for 365-day calibration cycle
  const percentRemaining = Math.max(0, Math.min(100, Math.round((standard.daysRemaining / 365) * 100)));

  return (
    <div
      className={`bg-white rounded-xl border p-4 sm:p-5 shadow-xs flex flex-col justify-between transition-all font-mono select-none ${
        isExpired
          ? 'border-rose-300 bg-rose-50/20 ring-1 ring-rose-200'
          : isExpiring
          ? 'border-amber-300 bg-amber-50/15'
          : isSelectedForTesting
          ? 'border-brand-500 ring-2 ring-brand-100 shadow-sm'
          : 'border-foundation-200 hover:border-foundation-300 hover:shadow-sm'
      }`}
    >
      <div>
        {/* Top Header: ID + Class Pill + Status Badge (§6, §8) */}
        <div className="flex items-start justify-between gap-2 pb-3 border-b border-foundation-100">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded font-black text-xs ${
                  standard.accuracyClass === 'E1'
                    ? 'bg-purple-100 text-purple-900 border border-purple-200'
                    : standard.accuracyClass === 'E2'
                    ? 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                    : standard.accuracyClass === 'F1'
                    ? 'bg-blue-100 text-blue-900 border border-blue-200'
                    : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                }`}
              >
                [{standard.accuracyClass}]
              </span>
              <span className="text-base font-extrabold text-foundation-950 font-sans">
                {standard.id}
              </span>
            </div>
            <p className="text-xs text-foundation-500 font-sans mt-0.5">
              {standard.setName}
            </p>
          </div>

          {/* Status Badge (§6, §14, §15) */}
          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 shrink-0 ${
              isExpired
                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                : isExpiring
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}
          >
            {isExpired ? (
              <>
                <XCircle size={13} className="text-rose-600" />
                <span>✕ EXPIRED</span>
              </>
            ) : isExpiring ? (
              <>
                <AlertTriangle size={13} className="text-amber-600" />
                <span>⚠ EXPIRING</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={13} className="text-emerald-600" />
                <span>✓ VALID</span>
              </>
            )}
          </span>
        </div>

        {/* Calibration Validity Countdown & Meter (§6, §7) */}
        <div className="mt-3.5 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-foundation-500 text-[10px] font-bold uppercase tracking-wider">
              Calibration Validity
            </span>
            <span
              className={`font-bold ${
                isExpired
                  ? 'text-rose-700'
                  : isExpiring
                  ? 'text-amber-700'
                  : 'text-foundation-900'
              }`}
            >
              {isExpired
                ? `Expired ${Math.abs(standard.daysRemaining)} days ago`
                : `${standard.daysRemaining} days remaining`}
            </span>
          </div>

          {/* Visual Progress Meter (§6) */}
          <div className="w-full bg-foundation-200 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isExpired
                  ? 'bg-rose-500'
                  : isExpiring
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${percentRemaining}%` }}
            />
          </div>
        </div>

        {/* Certificate Metadata (§6, §28) */}
        <div className="mt-3.5 space-y-1.5 text-xs">
          <div className="flex justify-between p-2 rounded bg-foundation-50 border border-foundation-100">
            <span className="text-foundation-500">Certificate:</span>
            <span className="font-bold text-foundation-900">{standard.certificateNumber}</span>
          </div>

          <div className="flex justify-between p-2 rounded bg-foundation-50 border border-foundation-100">
            <span className="text-foundation-500">Last Calibrated:</span>
            <span className="font-bold text-foundation-800">{standard.calibrationDate}</span>
          </div>

          <div className="flex justify-between p-2 rounded bg-foundation-50 border border-foundation-100">
            <span className="text-foundation-500">Valid Until:</span>
            <span
              className={`font-bold ${
                isExpired ? 'text-rose-700' : isExpiring ? 'text-amber-800' : 'text-foundation-800'
              }`}
            >
              {standard.validUntilDate}
            </span>
          </div>
        </div>

        {/* Currently Assigned / Active Sessions Indicator (§13, §27) */}
        <div className="mt-3.5 pt-2.5 border-t border-foundation-100 flex items-center justify-between text-[11px]">
          {isSelectedForTesting ? (
            <div className="flex items-center gap-1.5 text-brand-700 font-bold">
              <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
              <span>CURRENTLY ASSIGNED (Active Session)</span>
            </div>
          ) : standard.assignedSessionsCount > 0 ? (
            <button
              type="button"
              onClick={() => onViewAssignedSessions && onViewAssignedSessions(standard)}
              className="text-foundation-600 hover:text-brand-600 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Used in <strong>{standard.assignedSessionsCount} active sessions</strong></span>
              <ExternalLink size={11} />
            </button>
          ) : (
            <span className="text-foundation-400">Available for assignment</span>
          )}
        </div>
      </div>

      {/* Action Buttons (§6, §12, §15) */}
      <div className="mt-4 pt-3 border-t border-foundation-100 flex items-center justify-between gap-2 text-xs">
        <button
          type="button"
          onClick={() => onViewDetails(standard)}
          className="px-3 py-1.5 rounded-lg border border-foundation-200 text-foundation-700 hover:bg-foundation-50 font-semibold transition-colors cursor-pointer"
        >
          View Details
        </button>

        {isExpired ? (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-rose-700 uppercase bg-rose-50 px-2 py-1 rounded border border-rose-200 flex items-center gap-1">
              <Lock size={11} />
              <span>TESTING BLOCKED</span>
            </span>
            {onReplaceStandard && (
              <button
                type="button"
                onClick={() => onReplaceStandard(standard)}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold transition-colors cursor-pointer"
              >
                Replace Standard
              </button>
            )}
          </div>
        ) : isSelectedForTesting ? (
          <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 size={13} className="text-emerald-600" />
            <span>Assigned ✓</span>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => onSelectForTesting(standard)}
            className="px-3.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
          >
            <span>Select for Testing</span>
            <ArrowRight size={13} />
          </button>
        )}
      </div>
    </div>
  );
};
