import React from 'react';
import { ShieldCheck, AlertTriangle, Bug, CheckCircle2, RotateCcw, Search } from 'lucide-react';
import { AuditChainState } from './types';

interface AuditIntegrityBannerProps {
  chainState: AuditChainState;
  onToggleSimulateFailure: () => void;
  onInspectCorruptedBlock?: () => void;
}

export const AuditIntegrityBanner: React.FC<AuditIntegrityBannerProps> = ({
  chainState,
  onToggleSimulateFailure,
  onInspectCorruptedBlock,
}) => {
  const isValid = chainState.isChainValid;

  return (
    <div
      className={`rounded-2xl border p-5 transition-all shadow-xs ${
        isValid
          ? 'bg-gradient-to-r from-emerald-50/80 via-white to-emerald-50/30 border-emerald-200'
          : 'bg-gradient-to-r from-rose-50/90 via-white to-rose-50/50 border-rose-300 ring-2 ring-rose-500/20'
      }`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Left Side: Status Icon & Primary Statutory Message */}
        <div className="flex items-start sm:items-center gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
              isValid
                ? 'bg-emerald-600 text-white'
                : 'bg-rose-600 text-white animate-pulse'
            }`}
          >
            {isValid ? <ShieldCheck size={26} /> : <AlertTriangle size={26} />}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                  isValid
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-rose-100 text-rose-900 border border-rose-300 animate-pulse'
                }`}
              >
                {isValid ? 'CHAIN VERIFIED' : 'INTEGRITY VERIFICATION FAILED'}
              </span>

              <span className="text-xs font-mono text-foundation-500">
                {chainState.totalEvents} of {chainState.totalEvents} event links checked
              </span>

              {!isValid && (
                <span className="text-xs font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  {chainState.brokenLinkCount || 1} broken link detected
                </span>
              )}
            </div>

            <h3 className="text-base sm:text-lg font-bold text-foundation-900 mt-1 tracking-tight font-sans">
              {isValid
                ? '✓ HASH CHAIN VERIFIED'
                : '✕ INTEGRITY VERIFICATION FAILED'}
            </h3>

            <p className="text-xs text-foundation-600 mt-0.5 font-sans leading-relaxed">
              {isValid ? (
                <>
                  All {chainState.totalEvents} of {chainState.totalEvents} event links verified successfully. No integrity discrepancies detected.
                  <span className="font-mono text-foundation-400 ml-1.5">
                    (Verified: {chainState.lastVerifiedTime})
                  </span>
                </>
              ) : (
                <span className="text-rose-800 font-semibold font-mono">
                  Event {chainState.corruptedEventId || 'AUD-000407'} does not match the expected chain hash.
                </span>
              )}
            </p>

            {/* Mismatch breakdown when corrupted */}
            {!isValid && chainState.expectedHash && chainState.receivedHash && (
              <div className="mt-3 p-3 rounded-xl bg-rose-100/70 border border-rose-200 font-mono text-xs space-y-1.5 max-w-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-rose-900">
                  <span className="text-foundation-500 text-[11px] font-semibold uppercase">Expected Hash:</span>
                  <span className="text-emerald-700 font-bold select-all break-all">
                    {chainState.expectedHash.slice(0, 28)}...{chainState.expectedHash.slice(-12)}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-rose-900">
                  <span className="text-foundation-500 text-[11px] font-semibold uppercase">Received Hash:</span>
                  <span className="text-rose-700 font-bold select-all break-all underline">
                    {chainState.receivedHash.slice(0, 28)}...{chainState.receivedHash.slice(-12)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Hackathon Demo Mode Simulation Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 self-start lg:self-center shrink-0">
          {!isValid && onInspectCorruptedBlock && (
            <button
              onClick={onInspectCorruptedBlock}
              className="px-3 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Search size={13} />
              <span>Inspect Corrupted Block</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-foundation-100 border border-foundation-200">
            <span className="text-[10px] font-mono font-bold text-foundation-500 uppercase px-2">
              Demo
            </span>
            <button
              onClick={onToggleSimulateFailure}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                isValid
                  ? 'bg-white hover:bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-600'
              }`}
            >
              {isValid ? (
                <>
                  <Bug size={13} className="text-rose-600" />
                  <span>Simulate Tamper</span>
                </>
              ) : (
                <>
                  <RotateCcw size={13} />
                  <span>Restore Demo Chain</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
