import React from 'react';
import {
  CheckCircle2,
  Lock,
  Layers,
  Scale,
  ArrowRight,
  ShieldCheck,
  Check,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import { PreflightSummary, PreflightState } from './types';

interface ReadinessHeroCardsProps {
  summary: PreflightSummary;
  state: PreflightState;
  onNavigateToTab: (tabId: string) => void;
  isTraceabilityBlocked?: boolean;
}

export const ReadinessHeroCards: React.FC<ReadinessHeroCardsProps> = ({
  summary,
  state,
  onNavigateToTab,
  isTraceabilityBlocked = false,
}) => {
  const isTraceLocked = isTraceabilityBlocked || state === 'BLOCKED';
  const isAttention = state === 'ATTENTION';
  const isRemanded = state === 'REMANDED';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* 1. Card A: INSTRUMENT (§5) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <Scale className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                INSTRUMENT
              </h3>
            </div>
            <span
              className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isRemanded
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
              }`}
            >
              {isRemanded ? '⚠ ATTENTION' : '✓ READY'}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
              <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold text-slate-900 dark:text-white">Identity: </strong>
                <span>{summary.manufacturer} · {summary.serialNumber}</span>
              </div>
            </div>

            <div className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
              <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold text-slate-900 dark:text-white">Specifications: </strong>
                <span>{summary.accuracyClass} · Max {summary.maxCapacity} · e = {summary.verificationInterval}</span>
              </div>
            </div>

            <div className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
              {isRemanded ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold text-amber-700 dark:text-amber-400">Precondition: </strong>
                    <span className="text-amber-700 dark:text-amber-300">Reviewer inspection re-check requested</span>
                  </div>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold text-slate-900 dark:text-white">Validation: </strong>
                    <span>Table 3 limits passed (n = 6,000 divisions)</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigateToTab('session_detail')}
          className="w-full py-2.5 px-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer group"
        >
          <span>View Instrument Specs</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* 2. Card B: TRACEABILITY (§5 & §15) */}
      <div
        className={`rounded-3xl border p-6 shadow-xs flex flex-col justify-between space-y-4 transition-all ${
          isTraceLocked
            ? 'bg-red-50/60 dark:bg-red-950/30 border-red-300 dark:border-red-900 ring-2 ring-red-500/20'
            : isAttention
            ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-300 dark:border-amber-900'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
        }`}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  isTraceLocked
                    ? 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400'
                    : isAttention
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                    : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {isTraceLocked ? <Lock className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
              </div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                TRACEABILITY
              </h3>
            </div>
            <span
              className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isTraceLocked
                  ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-400'
                  : isAttention
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-400'
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
              }`}
            >
              {isTraceLocked ? '🔒 EXPIRED' : isAttention ? '⚠ EXPIRING SOON' : '✓ VALID'}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-sans">Reference Set:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {summary.selectedWeightSet}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-sans">Calibration Status:</span>
              <span
                className={`font-mono font-bold ${
                  isTraceLocked
                    ? 'text-red-600 dark:text-red-400'
                    : isAttention
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {isTraceLocked
                  ? 'Expired (Hard Lock)'
                  : isAttention
                  ? 'Expires in 12 days'
                  : 'Expires 18 Mar 2027'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-sans">Statutory Chain:</span>
              <span className="font-mono text-slate-700 dark:text-slate-300 text-[11px]">
                NPL / RRSL Calibration Lab
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigateToTab('standards')}
          className={`w-full py-2.5 px-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            isTraceLocked
              ? 'bg-red-600 hover:bg-red-500 text-white border-red-600 shadow-md shadow-red-600/20'
              : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300'
          }`}
        >
          <span>{isTraceLocked ? 'Resolve Standard Weights →' : 'View Standards Registry'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 3. Card C: TEST PLAN (§5 & §14) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                TEST PLAN
              </h3>
            </div>
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
              ✓ COMPLETE
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
              <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold text-slate-900 dark:text-white">Scope: </strong>
                <span>8 / 8 applicable procedures determined</span>
              </div>
            </div>

            <div className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
              <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold text-slate-900 dark:text-white">Procedures: </strong>
                <span>8 configured (0 unresolved scope issues)</span>
              </div>
            </div>

            <div className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
              <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold text-slate-900 dark:text-white">Starting Test: </strong>
                <span>TEST_01 Weighing Error &amp; Linearity</span>
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigateToTab('test_plan')}
          className="w-full py-2.5 px-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer group"
        >
          <span>View Test Plan Matrix</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};
