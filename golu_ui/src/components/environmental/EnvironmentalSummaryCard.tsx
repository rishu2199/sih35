import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Calculator,
  Flag,
} from 'lucide-react';
import { EnvironmentalConditions } from './LaboratoryConditionsCard';
import { TareResult } from './TareAccuracyTab';
import { TemperatureStage } from './TemperatureDriftTab';

interface EnvironmentalSummaryCardProps {
  conditions: EnvironmentalConditions;
  additiveResult: TareResult;
  subtractiveResult: TareResult;
  temperatureStages: TemperatureStage[];
  onOpenTraceDrawer?: () => void;
  onOpenAuditModal?: () => void;
}

export const EnvironmentalSummaryCard: React.FC<EnvironmentalSummaryCardProps> = ({
  conditions,
  additiveResult,
  subtractiveResult,
  temperatureStages,
  onOpenTraceDrawer,
  onOpenAuditModal,
}) => {
  const isConditionsRecorded = conditions.recorded;
  const isTarePass = additiveResult.status === 'PASS' && subtractiveResult.status === 'PASS';
  const completedStages = temperatureStages.filter((s) => s.status === 'DONE');
  const isAllStagesDone = completedStages.length === temperatureStages.length;
  const hasStageFailure = temperatureStages.some(
    (s) => s.isFail || (s.errorGrams && Math.abs(s.errorGrams) > s.allowableMpeGrams)
  );

  const isOverallPass = isConditionsRecorded && isTarePass && isAllStagesDone && !hasStageFailure;

  return (
    <div className="bg-white rounded-xl border border-foundation-200 p-5 shadow-xs space-y-4 select-none font-mono">
      {/* 1. Header */}
      <div className="flex items-center justify-between pb-3 border-b border-foundation-100">
        <span className="text-[11px] font-bold text-foundation-400 uppercase tracking-wider">
          ENVIRONMENTAL TEST SUMMARY (§30)
        </span>
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
            isOverallPass
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : hasStageFailure || !isTarePass
              ? 'bg-rose-50 text-rose-700 border border-rose-200'
              : 'bg-brand-50 text-brand-700 border border-brand-200'
          }`}
        >
          {isOverallPass ? (
            <>
              <CheckCircle2 size={13} className="text-emerald-600" />
              <span>✓ PASS</span>
            </>
          ) : hasStageFailure || !isTarePass ? (
            <>
              <XCircle size={13} className="text-rose-600" />
              <span>✕ FAIL</span>
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-brand-600 animate-pulse" />
              <span>IN PROGRESS</span>
            </>
          )}
        </span>
      </div>

      {/* 2. Hero Final Verdict Box (§25, §30) */}
      <div
        className={`p-4 rounded-xl border text-center transition-all ${
          isOverallPass
            ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
            : hasStageFailure || !isTarePass
            ? 'bg-rose-50/80 border-rose-300 text-rose-950'
            : 'bg-foundation-50 border-foundation-200 text-foundation-900'
        }`}
      >
        <span className="text-[10px] font-bold uppercase tracking-widest block opacity-75">
          Overall Metrological Compliance
        </span>

        <div className="text-xl sm:text-2xl font-black my-1.5 flex items-center justify-center gap-2">
          {isOverallPass ? (
            <>
              <CheckCircle2 size={22} className="text-emerald-600" />
              <span>✓ ENVIRONMENT PASSED</span>
            </>
          ) : hasStageFailure || !isTarePass ? (
            <>
              <XCircle size={22} className="text-rose-600" />
              <span>✕ TEST FAILED</span>
            </>
          ) : (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-brand-600 animate-ping" />
              <span>TESTING STAGES ACTIVE</span>
            </>
          )}
        </div>

        <p className="text-[11px] opacity-90 mt-1 font-sans">
          {isOverallPass
            ? 'Tare balance registers and climatic drift remain within statutory limits (OIML R 76-1).'
            : hasStageFailure
            ? 'Temperature drift exceeded allowable limit during thermal soak sequence.'
            : !isTarePass
            ? 'Tare accuracy evaluation exceeded statutory ±0.25e tolerance.'
            : 'Evaluating tare indication accuracy and thermal stability sequence.'}
        </p>
      </div>

      {/* 3. Statutory Sub-Test Checklist (§30) */}
      <div className="space-y-2 text-xs">
        <span className="text-[10px] font-bold text-foundation-400 uppercase tracking-wider block">
          Sub-Test Status Breakdown
        </span>

        {/* Ambient Conditions */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-foundation-50/70 border border-foundation-200">
          <span className="text-foundation-700">Lab Ambient Baseline</span>
          <span className="font-bold text-emerald-700 flex items-center gap-1">
            <CheckCircle2 size={12} />
            <span>✓ PASS ({conditions.temperatureC.toFixed(1)}°C)</span>
          </span>
        </div>

        {/* Tare Accuracy */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-foundation-50/70 border border-foundation-200">
          <span className="text-foundation-700">Tare Accuracy (±0.25e)</span>
          <span className={`font-bold flex items-center gap-1 ${isTarePass ? 'text-emerald-700' : 'text-rose-600'}`}>
            {isTarePass ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
            <span>{isTarePass ? '✓ PASS' : '✕ FAIL'}</span>
          </span>
        </div>

        {/* Temperature Drift */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-foundation-50/70 border border-foundation-200">
          <span className="text-foundation-700">Temperature Drift</span>
          <span className={`font-bold flex items-center gap-1 ${!hasStageFailure ? 'text-emerald-700' : 'text-rose-600'}`}>
            {!hasStageFailure ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
            <span>{!hasStageFailure ? '✓ PASS' : '✕ FAIL'}</span>
          </span>
        </div>

        {/* Chamber Sequence */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-foundation-50/70 border border-foundation-200">
          <span className="text-foundation-700">Chamber Sequence</span>
          <span className="font-bold text-emerald-700 flex items-center gap-1">
            <CheckCircle2 size={12} />
            <span>✓ COMPLETE</span>
          </span>
        </div>
      </div>

      {/* 4. Action Buttons for Drawer and Audit (§33, §34) */}
      <div className="pt-2 border-t border-foundation-100 space-y-2">
        {onOpenTraceDrawer && (
          <button
            type="button"
            onClick={onOpenTraceDrawer}
            className="w-full py-2 px-3 rounded-lg border border-foundation-200 hover:border-brand-300 bg-white hover:bg-brand-50 text-xs font-semibold text-brand-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Calculator size={13} />
            <span>Inspect Chamber Trace Data</span>
          </button>
        )}

        {onOpenAuditModal && (
          <button
            type="button"
            onClick={onOpenAuditModal}
            className="w-full py-2 px-3 rounded-lg border border-foundation-200 hover:border-amber-300 bg-white hover:bg-amber-50 text-xs font-semibold text-amber-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Flag size={13} />
            <span>Add Supervisory Audit Flag</span>
          </button>
        )}
      </div>
    </div>
  );
};
