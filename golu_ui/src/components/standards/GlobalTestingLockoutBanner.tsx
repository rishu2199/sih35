import React from 'react';
import { Lock, ArrowRight, AlertTriangle, ShieldAlert } from 'lucide-react';

interface GlobalTestingLockoutBannerProps {
  expiredStandardId?: string;
  onResolveTraceability: () => void;
}

export const GlobalTestingLockoutBanner: React.FC<GlobalTestingLockoutBannerProps> = ({
  expiredStandardId = 'SW-008',
  onResolveTraceability,
}) => {
  return (
    <div className="bg-rose-600 text-white border-b-2 border-rose-800 py-3.5 px-4 sm:px-6 shadow-md select-none font-mono z-40 relative animate-in slide-in-from-top-2 duration-200">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-800/80 border border-rose-400/40 flex items-center justify-center shrink-0">
            <Lock size={17} className="text-white stroke-[2.5]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xs uppercase tracking-wider text-rose-200">
                HARD TRACEABILITY LOCKOUT
              </span>
              <span className="text-rose-400">•</span>
              <span className="text-xs text-rose-100 font-bold">
                OIML R 76-1 CL 3.7.1
              </span>
            </div>

            <p className="text-xs sm:text-sm font-bold text-white mt-0.5">
              ✕ TESTING LOCKED — Standard weight set <span className="underline decoration-rose-300 font-black">{expiredStandardId}</span> has an expired calibration certificate.
            </p>
            <p className="text-[11px] text-rose-200 font-sans mt-0.5">
              Measurement entry and verification actions are disabled across all test workspaces until a valid traceable standard is selected.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onResolveTraceability}
          className="self-end md:self-auto px-4 py-2 rounded-lg bg-white hover:bg-rose-50 active:bg-rose-100 text-rose-900 font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <span>Resolve Traceability Issue</span>
          <ArrowRight size={13} className="stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
