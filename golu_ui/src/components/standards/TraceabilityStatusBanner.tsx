import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Lock,
  RotateCcw,
} from 'lucide-react';
import { StandardWeightSet } from './types';

interface TraceabilityStatusBannerProps {
  standards: StandardWeightSet[];
  onSelectStandard?: (standardId: string) => void;
  onRenewStandard?: (standardId: string) => void;
  onResolveLockout?: () => void;
  onViewExpiring?: () => void;
}

export const TraceabilityStatusBanner: React.FC<TraceabilityStatusBannerProps> = ({
  standards,
  onSelectStandard,
  onRenewStandard,
  onResolveLockout,
  onViewExpiring,
}) => {
  const expiredStandard = standards.find((s) => s.status === 'EXPIRED');
  const expiringStandards = standards.filter((s) => s.status === 'EXPIRING');
  const expiredCount = standards.filter((s) => s.status === 'EXPIRED').length;
  const expiringCount = expiringStandards.length;

  // 1. EXPIRED STATE (§4: ✕ TRACEABILITY FAILURE)
  if (expiredStandard) {
    return (
      <div className="bg-rose-50 border-2 border-rose-500 rounded-xl p-5 shadow-sm text-rose-950 select-none animate-in fade-in duration-200 font-mono">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Lock size={20} className="stroke-[2.5]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black uppercase tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                  ✕ TRACEABILITY FAILURE
                </span>
                <span className="text-rose-500">•</span>
                <span className="font-mono text-xs text-rose-600 font-bold">
                  OIML R 76-1 CL 3.7.1
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-black tracking-tight text-rose-950 mt-1 font-sans">
                {expiredCount} standard weight set has expired.
              </h2>

              <p className="text-xs sm:text-sm text-rose-900 mt-1 font-medium font-sans max-w-3xl">
                Any verification session using standard <strong className="font-mono font-bold text-rose-950 underline">{expiredStandard.id} ({expiredStandard.accuracyClass})</strong> is blocked. Measurement capture is strictly locked until a valid standard is assigned.
              </p>

              <div className="mt-2.5 flex flex-wrap items-center gap-4 text-xs font-mono text-rose-800">
                <span>
                  Expired standard: <strong>{expiredStandard.id} ({expiredStandard.setName})</strong>
                </span>
                <span>•</span>
                <span>
                  Lapsed on: <strong>{expiredStandard.validUntilDate} ({Math.abs(expiredStandard.daysRemaining)} days overdue)</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 self-end md:self-center font-mono">
            {onRenewStandard && (
              <button
                type="button"
                onClick={() => onRenewStandard(expiredStandard.id)}
                title="Simulate calibration renewal (demo sandbox)"
                className="px-3.5 py-2.5 rounded-lg bg-white border border-rose-300 text-rose-900 hover:bg-rose-100 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw size={13} />
                <span>Renew (Demo)</span>
              </button>
            )}

            <button
              type="button"
              onClick={onResolveLockout}
              className="px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Resolve Traceability →</span>
              <ArrowRight size={14} className="stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. EXPIRING STATE (§4: ⚠ TRACEABILITY ATTENTION)
  if (expiringCount > 0) {
    const firstExpiring = expiringStandards[0];
    return (
      <div className="bg-amber-50/90 border border-amber-300 rounded-xl p-4 sm:p-5 shadow-xs text-amber-950 select-none font-mono">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
              <AlertTriangle size={18} className="stroke-[2.5]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-amber-700 uppercase bg-amber-100 px-2 py-0.5 rounded">
                  ⚠ TRACEABILITY ATTENTION
                </span>
                <span className="text-amber-400">•</span>
                <span className="font-mono text-xs text-amber-800 font-semibold">
                  Legal Metrology Advisory
                </span>
              </div>

              <h2 className="text-sm sm:text-base font-bold text-amber-950 mt-1 font-sans">
                {expiringCount} standard weight set expires within 7 days.
              </h2>

              <p className="text-xs text-amber-900 mt-0.5 font-sans">
                Standard <strong className="font-mono font-bold">{firstExpiring.id} ({firstExpiring.accuracyClass})</strong> expires in <strong className="font-mono font-bold text-amber-950">{firstExpiring.daysRemaining} days</strong> ({firstExpiring.validUntilDate}). Verification testing remains permitted until midnight on expiry date.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto font-mono text-xs">
            <button
              type="button"
              onClick={onViewExpiring}
              className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <span>View Expiring Standards →</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. HEALTHY STATE (§4: ✓ TRACEABILITY HEALTHY)
  return (
    <div className="bg-emerald-50/80 border border-emerald-300 rounded-xl p-4 sm:p-5 shadow-xs text-emerald-950 select-none font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
            <CheckCircle2 size={20} className="stroke-[2.5]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-100 px-2 py-0.5 rounded">
                ✓ TRACEABILITY HEALTHY
              </span>
              <span className="text-emerald-400">•</span>
              <span className="font-mono text-xs text-emerald-800 font-semibold">
                NABL ISO/IEC 17025 Synchronized
              </span>
            </div>

            <h2 className="text-sm sm:text-base font-bold text-emerald-950 mt-1 font-sans">
              All active laboratory standard weight sets are currently valid.
            </h2>

            <p className="text-xs text-emerald-900 mt-0.5 font-sans">
              6 standard sets · 0 blocked. Reference standards comply with OIML R 111-1 Class E1, E2, F1, and M1 tolerances.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs shrink-0 self-end sm:self-auto">
          <div className="bg-white/90 border border-emerald-200 px-3 py-1.5 rounded-lg text-emerald-900 shadow-2xs">
            <span className="font-bold">{standards.length} Active Sets</span>
            <span className="text-emerald-400 mx-1.5">•</span>
            <span className="font-bold text-emerald-700">100% Valid</span>
          </div>
        </div>
      </div>
    </div>
  );
};
