import React, { useState } from 'react';
import { Copy, Check, ShieldCheck, Lock, AlertTriangle, Scale, Clock, CheckCircle2 } from 'lucide-react';
import { InstrumentSpecs, SessionMeta, SessionScenario } from './types';

interface InstrumentIdentityHeaderProps {
  specs: InstrumentSpecs;
  meta: SessionMeta;
  scenario: SessionScenario;
}

export const InstrumentIdentityHeader: React.FC<InstrumentIdentityHeaderProps> = ({
  specs,
  meta,
  scenario,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopySessionId = () => {
    navigator.clipboard?.writeText(meta.sessionId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = () => {
    switch (scenario) {
      case 'APPROVED':
        return (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>● APPROVED · READ ONLY</span>
          </div>
        );
      case 'REMANDED':
        return (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            <span>⚠ SESSION REMANDED</span>
          </div>
        );
      case 'BLOCKED':
        return (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            <Lock className="w-3.5 h-3.5 text-rose-600" />
            <span>🔒 TESTING LOCKED</span>
          </div>
        );
      case 'FRESH':
        return (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <span>○ NOT STARTED</span>
          </div>
        );
      case 'FINISHED':
        return (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
            <span>✓ READY FOR REVIEW</span>
          </div>
        );
      case 'ACTIVE':
      default:
        return (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>● IN TESTING</span>
          </div>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-6">
      {/* Upper block: Scale Thumbnail Icon, Manufacturer, Model, Serial, Verification Stage, Status Badge (§3, §5, §6, §7) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-start gap-4">
          {/* Scale Thumbnail Illustration Box (§6) */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-blue-50 dark:from-slate-800 dark:to-blue-950/50 border border-slate-200 dark:border-slate-700/80 flex flex-col items-center justify-center shrink-0 shadow-xs">
            <Scale className="w-7 h-7 text-[#172554] dark:text-blue-400" />
            <span className="text-[8px] font-mono font-bold uppercase text-slate-400 mt-0.5">
              SCALE
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
              <span className="font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                {specs.manufacturer}
              </span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="font-mono text-slate-500">TAC: {specs.tacNumber}</span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              {/* Verification Stage clearly stated (§7) */}
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 uppercase">
                {specs.verificationStage || 'SUBSEQUENT VERIFICATION'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {specs.model}
            </h1>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-400">
              <span>SERIAL NUMBER:</span>
              <strong className="text-slate-900 dark:text-white font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                {specs.serialNumber}
              </strong>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {getStatusBadge()}
        </div>
      </div>

      {/* Metrological Specifications Line in IBM Plex Mono (§5 & §27) */}
      <div className="flex flex-wrap items-center gap-2.5 pt-1">
        <span className="px-3 py-1.5 rounded-xl font-mono text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          {specs.accuracyClass}
        </span>
        <span className="px-3 py-1.5 rounded-xl font-mono text-xs font-semibold bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
          {specs.maxCapacity} Max
        </span>
        <span className="px-3 py-1.5 rounded-xl font-mono text-xs font-semibold bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
          {specs.minCapacity} Min
        </span>
        <span className="px-3 py-1.5 rounded-xl font-mono text-xs font-semibold bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
          e = {specs.interval}
        </span>
        <span className="px-3 py-1.5 rounded-xl font-mono text-xs font-semibold bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
          d = {specs.scaleInterval}
        </span>
        <span className="px-3 py-1.5 rounded-xl font-mono text-xs font-semibold bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          n = {specs.divisionsCount.toLocaleString()}
        </span>
      </div>

      {/* Session Metadata Strip (§4, §17) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
            Session ID
          </div>
          <button
            type="button"
            onClick={handleCopySessionId}
            className="inline-flex items-center gap-1.5 font-mono font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer group"
            title="Click to copy Session ID"
          >
            <span>{meta.sessionId}</span>
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
            )}
          </button>
        </div>

        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
            Verification Stage
          </div>
          <div className="font-semibold text-slate-800 dark:text-slate-200">
            {specs.verificationStage || meta.stage}
          </div>
        </div>

        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
            Operator
          </div>
          <div className="font-semibold text-slate-800 dark:text-slate-200">
            {meta.operator}
          </div>
        </div>

        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
            Started
          </div>
          <div className="font-mono text-slate-700 dark:text-slate-300">
            {meta.startedAt}
          </div>
        </div>
      </div>

      {/* Session Health Strip (§29) */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold uppercase text-[10px] text-blue-800 dark:text-blue-300">
            SESSION HEALTH:
          </span>
          <div className="flex flex-wrap items-center gap-3 text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Traceability Valid
            </span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Required Data Complete
            </span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Evidence Dossier Linked
            </span>
          </div>
        </div>

        {scenario === 'REMANDED' ? (
          <span className="text-amber-700 dark:text-amber-300 font-bold font-mono text-[11px] flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> 1 Attention Item Pending
          </span>
        ) : (
          <span className="text-emerald-700 dark:text-emerald-400 font-bold font-mono text-[11px] flex items-center gap-1">
            ✓ 0 Blockers
          </span>
        )}
      </div>
    </div>
  );
};
