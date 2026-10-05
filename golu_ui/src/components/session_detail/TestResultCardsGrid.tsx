import React from 'react';
import { ArrowRight, Check, Eye, Lock, AlertTriangle, ShieldCheck, Play, RotateCcw } from 'lucide-react';
import { TestResultModuleItem, TestStepItem } from './types';

interface TestResultCardsGridProps {
  testModules?: TestResultModuleItem[];
  steps?: TestStepItem[];
  onModuleAction?: (module: TestResultModuleItem) => void;
  onStepAction?: (step: TestStepItem) => void;
}

export const TestResultCardsGrid: React.FC<TestResultCardsGridProps> = ({
  testModules,
  steps,
  onModuleAction,
  onStepAction,
}) => {
  // Default canonical OIML test modules (§13, §14)
  const defaultModules: TestResultModuleItem[] = [
    {
      id: 'test-weighing',
      testNumber: 'Test 01',
      name: 'Weighing Error & Linearity',
      standardReference: 'OIML R 76-1 § 3.5.1',
      state: 'COMPLETED',
      verdict: 'PASS',
      observationsCount: '31 observations',
      details: 'Max error: 1.8 g (MPE limit ±5.0 g) · Turning point verified',
      targetView: 'weighing_linearity',
    },
    {
      id: 'test-eccentricity',
      testNumber: 'Test 02',
      name: 'Eccentricity (Corner Loading)',
      standardReference: 'OIML R 76-1 § 3.6.2',
      state: 'COMPLETED',
      verdict: 'PASS',
      observationsCount: '4 positions',
      details: 'Corner deflection compliant · Max difference: 1.2 g',
      targetView: 'eccentricity_workspace',
    },
    {
      id: 'test-repeatability',
      testNumber: 'Test 03',
      name: 'Repeatability Test',
      standardReference: 'OIML R 76-1 § 3.6.1',
      state: 'IN_PROGRESS',
      verdict: 'ACTIVE',
      observationsCount: '10 runs (4 recorded)',
      details: '10 sequential runs at 24.000 kg (0.8 Max) in progress',
      targetView: 'repeatability_workspace',
    },
    {
      id: 'test-environmental',
      testNumber: 'Test 04',
      name: 'Environmental Drift & Tare',
      standardReference: 'OIML R 76-1 § 3.9',
      state: 'PENDING',
      verdict: 'PENDING',
      observationsCount: 'Pending',
      details: 'Thermal chamber stability and tare balance test',
      targetView: 'environmental_workspace',
    },
  ];

  const modulesToRender = testModules && testModules.length > 0 ? testModules : defaultModules;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
              TEST RESULTS
            </h3>
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              OIML R 76-1 Table 6
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Bird&apos;s-eye overview of statutory measurement modules. Click to view results or resume.
          </p>
        </div>

        <span className="text-[11px] font-mono text-slate-500">
          {modulesToRender.filter((m) => m.state === 'COMPLETED').length} of {modulesToRender.length} Complete
        </span>
      </div>

      {/* Grid of 4 compact test cards (§13) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {modulesToRender.map((mod) => {
          const isCompleted = mod.state === 'COMPLETED';
          const isInProgress = mod.state === 'IN_PROGRESS';
          const isBlocked = mod.state === 'BLOCKED';

          const isFailed = mod.verdict === 'FAIL';
          let cardBorder = 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900';
          let badgeStyle = 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';

          if (isFailed) {
            cardBorder = 'border-rose-400 dark:border-rose-700 bg-rose-50/50 dark:bg-rose-950/20 ring-2 ring-rose-500/20';
            badgeStyle = 'bg-rose-600 text-white font-bold';
          } else if (isCompleted) {
            cardBorder = 'border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/20 dark:bg-emerald-950/10 hover:border-emerald-300';
            badgeStyle = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold';
          } else if (isInProgress) {
            cardBorder = 'border-blue-400 dark:border-blue-700 bg-blue-50/40 dark:bg-blue-950/20 ring-2 ring-blue-500/20';
            badgeStyle = 'bg-blue-600 text-white font-bold animate-pulse';
          } else if (isBlocked) {
            cardBorder = 'border-red-300 dark:border-red-800 bg-red-50/40 dark:bg-red-950/20';
            badgeStyle = 'bg-red-600 text-white font-bold';
          }

          return (
            <div
              key={mod.id}
              onClick={() => onModuleAction?.(mod)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group hover:shadow-sm ${cardBorder}`}
            >
              <div className="space-y-2.5">
                {/* Header: Test # and Status */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-black text-slate-400">
                    {mod.testNumber}
                  </span>
                  <span className={`font-mono text-[10px] px-2 py-0.5 rounded-md ${badgeStyle}`}>
                    {isFailed ? '✕ FAIL' : isCompleted ? '✓ PASS' : isInProgress ? '● ACTIVE' : '○ PENDING'}
                  </span>
                </div>

                {/* Test Name and Reference */}
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {mod.name}
                  </h4>
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                    {mod.standardReference}
                  </div>
                </div>

                {/* Observations & Details */}
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                  <div className="font-mono font-bold text-slate-700 dark:text-slate-300">
                    {mod.observationsCount}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    {mod.details}
                  </p>
                </div>
              </div>

              {/* Card Footer CTA */}
              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
                {isCompleted ? (
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <span>View Observations</span>
                    <Eye className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                ) : isInProgress ? (
                  <div className="flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400">
                    <span>Resume Testing</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-xs font-medium text-slate-400">
                    <span>Pending Step</span>
                    <Play className="w-3.5 h-3.5 opacity-50" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
