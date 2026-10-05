import React from 'react';
import { PlayCircle, Cpu, Radio, CheckCircle2, ArrowRight } from 'lucide-react';
import { NextTestPreview, HardwareTelemetry } from './types';
import { CANONICAL_NEXT_TEST, CANONICAL_HARDWARE_TELEMETRY } from './mockReadinessData';

interface NextTestAndHardwarePreviewProps {
  nextTest?: NextTestPreview;
  telemetry?: HardwareTelemetry;
  isBlocked?: boolean;
  onStartProcedure: () => void;
  onOpenHardwareBridge: () => void;
}

export const NextTestAndHardwarePreview: React.FC<NextTestAndHardwarePreviewProps> = ({
  nextTest = CANONICAL_NEXT_TEST,
  telemetry = CANONICAL_HARDWARE_TELEMETRY,
  isBlocked = false,
  onStartProcedure,
  onOpenHardwareBridge,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between space-y-4">
      <div className="space-y-4">
        {/* Next Test Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <PlayCircle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                CONTEXTUAL PREVIEW §24
              </span>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                NEXT UP: {nextTest.testCode}
              </h3>
            </div>
          </div>

          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
            ✓ QUEUED
          </span>
        </div>

        {/* Procedure details */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 dark:text-white">
              {nextTest.name}
            </span>
            <span className="font-mono text-[11px] text-blue-600 dark:text-blue-400 font-bold">
              {nextTest.standardClause}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Observation Points:</span>
            <strong className="text-slate-700 dark:text-slate-300">{nextTest.loadPointsCount} points (0 to 30 kg)</strong>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Statutory MPE:</span>
            <strong className="text-slate-700 dark:text-slate-300">±0.5 e to ±1.5 e</strong>
          </div>
        </div>

        {/* Scale Bridge Status (§25 & §26) */}
        <div className="p-3.5 rounded-2xl bg-slate-900 text-white dark:bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="text-[10px] uppercase font-bold text-slate-400">Scale Bridge Stream</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/80">
              ● {telemetry.mode} ACTIVE
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <span className="text-2xl font-black text-white font-mono tracking-tight">
              {telemetry.weightKg.toFixed(3)} <span className="text-sm font-sans font-bold text-slate-400">{telemetry.unit}</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-bold uppercase">
              {telemetry.isStable ? '● STABLE' : '○ MOTION'}
            </span>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
            <span>Port: {telemetry.port} ({telemetry.baudRate} 8N1)</span>
            <button
              type="button"
              onClick={onOpenHardwareBridge}
              className="text-blue-400 hover:text-blue-300 underline cursor-pointer"
            >
              Hardware Bridge →
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        disabled={isBlocked}
        onClick={onStartProcedure}
        className={`w-full py-2.5 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
          isBlocked
            ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20'
        }`}
      >
        <span>Open {nextTest.testCode} Workspace →</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
