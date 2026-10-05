import React from 'react';
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertTriangle,
  Lock,
  ShieldCheck,
  Check,
  FileCheck2,
  AlertOctagon,
  HelpCircle,
} from 'lucide-react';
import { SessionScenario, TestStepItem } from './types';

interface ComplianceAndNextActionProps {
  scenario: SessionScenario;
  steps: TestStepItem[];
  currentStep: TestStepItem;
  onContinueTesting: () => void;
  onResolveBlocker: () => void;
  onViewAttentionItem?: () => void;
  isTraceabilityLocked?: boolean;
}

export const ComplianceAndNextAction: React.FC<ComplianceAndNextActionProps> = ({
  scenario,
  steps,
  currentStep,
  onContinueTesting,
  onResolveBlocker,
  onViewAttentionItem,
  isTraceabilityLocked = false,
}) => {
  const isFailed = scenario === 'FAILED';
  const completedCount = steps.filter((s) => s.state === 'COMPLETED').length;
  const passCount = completedCount;
  const warningCount = scenario === 'REMANDED' ? 1 : 0;
  const failCount = isFailed ? 1 : 0;

  const isBlocked = scenario === 'BLOCKED' || isTraceabilityLocked;

  const getStatusText = () => {
    if (scenario === 'FAILED') return '✕ FAIL';
    if (scenario === 'APPROVED') return 'APPROVED';
    if (scenario === 'REMANDED') return 'REMANDED';
    if (isBlocked) return 'BLOCKED';
    if (scenario === 'FINISHED') return 'READY FOR REVIEW';
    if (scenario === 'FRESH') return 'READY TO START';
    return 'IN PROGRESS';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Card: OVERALL COMPLIANCE (§11) - 5 Columns */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-xs flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                OVERALL RESULT
              </h3>
              <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                OIML R 76-1
              </span>
            </div>

            {/* Progress metric */}
            <div className="py-4 space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {completedCount} <span className="text-lg font-bold text-slate-400">/ 7</span>
                </span>
                <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                  {Math.round((completedCount / 7) * 100)}% Complete
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${(completedCount / 7) * 100}%` }}
                />
              </div>
            </div>

            {/* Stats breakdown (§9, §11) */}
            <div className="space-y-2.5 pt-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Completed stages:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {passCount} COMPLETE
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Attention flags:</span>
                <span
                  className={`font-mono font-bold ${
                    warningCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {warningCount}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Statutory MPE breaches:</span>
                <span className={`font-mono font-bold ${failCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {failCount > 0 ? '1 VIOLATION (MPE EXCEEDED)' : '0 VIOLATIONS'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Overall status:</span>
                <span className={`font-mono font-black ${isFailed ? 'text-rose-600 dark:text-rose-400' : 'text-blue-600 dark:text-blue-400'}`}>
                  {getStatusText()}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            <strong className="text-slate-800 dark:text-slate-200">Statutory Governance: </strong>
            All 7 verification stages must satisfy OIML R 76-1 Table 6 tolerances before the Director may issue Certificate Form VI.
          </div>
        </div>

        {/* Right Card: NEXT ACTION or BLOCKED CARD (§12 & §27) - 7 Columns */}
        {isBlocked ? (
          /* Blocker Card */
          <div className="lg:col-span-7 bg-red-950 text-white rounded-3xl p-6 sm:p-7 shadow-xs border border-red-800 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-black bg-red-500/20 text-red-300 border border-red-500/30">
                <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
                <span>TESTING BLOCKED</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Traceability Lockout Active
              </h3>

              <div className="p-4 rounded-2xl bg-red-900/40 border border-red-700/60 text-xs text-red-200 space-y-1">
                <div className="font-bold text-white uppercase text-[11px] tracking-wider">
                  Blocker Reason:
                </div>
                <p className="leading-relaxed">
                  {isTraceabilityLocked
                    ? 'Standard weight set calibration has expired. Testing is frozen across all screens under OIML R 111-1.'
                    : 'Physical inspection or preflight baseline is incomplete.'}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-red-800/80 flex items-center justify-between">
              <span className="text-xs text-red-300">
                Action required to unlock verification steps
              </span>

              <button
                type="button"
                onClick={onResolveBlocker}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white hover:bg-slate-100 text-red-950 font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <span>Resolve Traceability</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : scenario === 'APPROVED' ? (
          /* Approved Card (§18) */
          <div className="lg:col-span-7 bg-gradient-to-br from-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xs border border-emerald-800 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>APPROVED · READ ONLY</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Verification Session Completed
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                This verification session has been digitally signed and registered. Legal metrology Certificate Form VI has been generated with an embedded e-Māap QR code.
              </p>

              <div className="p-4 rounded-2xl bg-emerald-900/30 border border-emerald-700/50 text-xs font-mono space-y-1">
                <div>
                  Certificate Ref:{' '}
                  <strong className="text-emerald-400 font-bold">CERT-2026-00192</strong>
                </div>
                <div className="text-slate-300">
                  Authorized by: Dr. V. K. Menon (Laboratory Director, RRSL)
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-emerald-800/60 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onContinueTesting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>View Certificate Form VI</span>
              </button>
            </div>
          </div>
        ) : scenario === 'FAILED' ? (
          /* Failed Card (§11, §27) */
          <div className="lg:col-span-7 bg-rose-950 text-white rounded-3xl p-6 sm:p-7 shadow-xs border border-rose-800 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-black bg-rose-500/20 text-rose-300 border border-rose-500/30">
                <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                <span>STATUTORY NON-COMPLIANCE</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Instrument Rejected: Tolerance Exceeded
              </h3>

              <div className="p-4 rounded-2xl bg-rose-900/40 border border-rose-700/60 text-xs text-rose-100 space-y-1.5">
                <div className="font-bold uppercase tracking-wider text-[11px] text-rose-300">
                  Statutory Non-Compliance Notice:
                </div>
                <p className="italic">
                  One or more statutory measurement procedures violated maximum permissible error limits under OIML R 76-1:2006. Instrument cannot be approved for commercial trade without mechanical re-calibration.
                </p>
                <div className="pt-1 font-mono text-[11px] text-rose-300">
                  Action: Review failing observation data and technical calculation proof
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-rose-800/80 flex items-center justify-end">
              <button
                type="button"
                onClick={onContinueTesting}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-md transition-all cursor-pointer"
              >
                <span>Inspect Failing Observation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : scenario === 'REMANDED' ? (
          /* Remanded Card (§19) */
          <div className="lg:col-span-7 bg-amber-950 text-white rounded-3xl p-6 sm:p-7 shadow-xs border border-amber-800 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>SESSION REMANDED</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Reviewer Requested Correction
              </h3>

              <div className="p-4 rounded-2xl bg-amber-900/40 border border-amber-700/60 text-xs text-amber-100 space-y-1.5">
                <div className="font-bold uppercase tracking-wider text-[11px] text-amber-300">
                  Reviewer Note:
                </div>
                <p className="italic">
                  &ldquo;Eccentricity observation requires re-check. Corner 3 displayed 0.4e deviation on off-center placement.&rdquo;
                </p>
                <div className="pt-1 font-mono text-[11px] text-amber-300">
                  Action: Repeat Corner Loading Test on Platform Quadrant 3
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-amber-800/80 flex items-center justify-end">
              <button
                type="button"
                onClick={onContinueTesting}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer"
              >
                <span>Resume Correction</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Next Action Card (§12 & §27) */
          <div className="lg:col-span-7 bg-gradient-to-br from-[#172554] to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xs border border-blue-900 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-black bg-blue-500/20 text-blue-300 border border-blue-500/30">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>NEXT ACTION</span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {scenario === 'FINISHED'
                    ? 'Submit for Statutory Review'
                    : scenario === 'FRESH'
                    ? 'Start Precondition Checks'
                    : 'Continue Weighing Test'}
                </h3>
                <p className="text-xs text-blue-200/80 mt-1 max-w-xl leading-relaxed">
                  {scenario === 'FINISHED'
                    ? 'All measurement tests completed and validated. Forward evidence dossier to Senior Reviewer for four-eyes audit.'
                    : scenario === 'FRESH'
                    ? 'Instrument registration is complete. Complete physical spirit level check and optical lead-wire seal inspection.'
                    : 'Stage 04 in progress: 4 of 31 observations recorded. 27 test points remaining in ascending and descending load cycles.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs font-mono flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Target View:</span>
                  <span className="font-bold text-white">
                    {scenario === 'FINISHED'
                      ? 'Review & Sign-Off'
                      : scenario === 'FRESH'
                      ? 'Preflight Gate'
                      : 'Weighing Error & Linearity'}
                  </span>
                </div>
                <span className="text-blue-300 text-[11px]">
                  Estimated: {scenario === 'FINISHED' ? '5 mins' : '15 mins'}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-blue-900/60 flex items-center justify-between">
              <span className="text-xs text-blue-300 font-medium">
                Ready to proceed
              </span>

              <button
                type="button"
                onClick={onContinueTesting}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <span>Continue →</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dedicated "What Needs Attention?" Card (§23) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <AlertTriangle className={`w-4 h-4 ${scenario === 'REMANDED' ? 'text-amber-600' : 'text-slate-400'}`} />
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              ATTENTION NEEDED
            </h4>
          </div>
          <span className="font-mono text-xs font-bold text-slate-500">
            {scenario === 'REMANDED' ? '⚠ 1 Item Pending' : '✓ 0 Items'}
          </span>
        </div>

        <div className="pt-4">
          {scenario === 'REMANDED' ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs">
              <div className="space-y-0.5">
                <span className="font-bold text-amber-900 dark:text-amber-200">
                  Observation row 14 has a reviewer flag:
                </span>
                <p className="text-amber-800 dark:text-amber-300">
                  Corner 3 off-center error exceeds allowable turning point threshold (Δ = +0.012 kg). Re-check corner loading.
                </p>
              </div>
              <button
                type="button"
                onClick={onViewAttentionItem || onContinueTesting}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 cursor-pointer shadow-xs"
              >
                Review Issue →
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 text-xs text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="font-medium">
                <strong>NO ACTIONS REQUIRED:</strong> Session is progressing normally without unresolved compliance flags or reviewer exceptions.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
