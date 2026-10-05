import React, { useState } from 'react';
import {
  Lock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { UnifiedVerificationSession } from '../../lib/session/types';
import { getSessionLockState } from '../../lib/session/lockStateEngine';
import { getNextBestAction, getSessionProgress } from '../../lib/session/sessionSelectors';
import { SessionIdentity } from './SessionIdentity';
import { TraceabilityIndicator } from './TraceabilityIndicator';
import { SessionProgress } from './SessionProgress';
import { SessionStepper, StepDefinition } from './SessionStepper';

export interface VerificationSessionHeaderProps {
  session?: UnifiedVerificationSession | any;
  currentTab: string;
  onNavigateTab: (tabId: string) => void;
  standardsStatus?: 'VALID' | 'EXPIRING' | 'EXPIRED';
  isTraceabilityLocked?: boolean;
  onNavigateToStandards?: () => void;
  onOpenCalculationProof?: () => void;
}

const STATUTORY_STEPS: StepDefinition[] = [
  { id: 'readiness', stepNum: '01', label: 'Intake / Preflight', short: 'Readiness' },
  { id: 'physical_inspection', stepNum: '02', label: 'Physical & Visual', short: 'Physical' },
  { id: 'weighing_linearity', stepNum: '03', label: 'Weighing Linearity', short: 'Weighing' },
  { id: 'eccentricity_workspace', stepNum: '04', label: 'Eccentricity (Corner)', short: 'Eccentricity' },
  { id: 'repeatability_workspace', stepNum: '05', label: 'Repeatability Test', short: 'Repeatability' },
  { id: 'environmental_workspace', stepNum: '06', label: 'Environmental / Tare', short: 'Environment' },
  { id: 'review_workspace', stepNum: '07', label: 'Supervisory Review', short: 'Review & Sign' },
];

/**
 * VerificationSessionHeader (§23, §24, §25, §35)
 * Composed session header containing SessionIdentity, TraceabilityIndicator, SessionProgress, and SessionStepper
 */
export const VerificationSessionHeader: React.FC<VerificationSessionHeaderProps> = ({
  session,
  currentTab,
  onNavigateTab,
  standardsStatus = 'VALID',
  isTraceabilityLocked = false,
  onNavigateToStandards,
  onOpenCalculationProof,
}) => {
  const [isMobileDetailsOpen, setIsMobileDetailsOpen] = useState(false);
  const [blockedNotice, setBlockedNotice] = useState<string | null>(null);

  // Extract or normalize parameters
  const instrument = session?.instrument || {};
  const modelName = instrument.modelName || session?.model || session?.instrument || 'Avery ZM201 Retail Platform';
  const serialNumber = instrument.serialNumber || session?.serialNumber || session?.sessionNumber || 'AV-2026-8812';
  const accuracyClass = (instrument.accuracyClass || session?.accuracyClass || session?.class || 'CLASS_III')
    .toString()
    .replace('_', ' ');
  const maxCap = instrument.maxCapacity ? `${instrument.maxCapacity} ${instrument.unit || 'kg'}` : session?.maxCapacity || '30.000 kg';
  const minCap = instrument.minCapacity ? `${instrument.minCapacity} ${instrument.unit || 'kg'}` : '0.100 kg';
  const eVal = instrument.e ? `e = ${instrument.e} ${instrument.unit || 'kg'}` : session?.interval || 'e = 0.005 kg';
  const dVal = instrument.d ? `d = ${instrument.d} ${instrument.unit || 'kg'}` : 'd = 0.005 kg';

  const lockInfo = getSessionLockState(session, !isTraceabilityLocked && standardsStatus !== 'EXPIRED');
  const nextAction = getNextBestAction(session);
  const progress = getSessionProgress(session);

  // Match current step
  const activeStepIdx = STATUTORY_STEPS.findIndex((s) => s.id === currentTab);
  const currentStepNumber = activeStepIdx !== -1 ? activeStepIdx + 1 : progress.currentStepIndex;

  // Stepper prerequisite validator (§24)
  const handleStepClick = (step: StepDefinition, stepIdx: number) => {
    const stepNumber = stepIdx + 1;
    const isCompleted = stepNumber < currentStepNumber || session?.reviewStatus === 'APPROVED';
    const isCurrent = step.id === currentTab || (currentTab === 'review' && step.id === 'review_workspace');

    if (isCurrent) return;

    if (isCompleted) {
      onNavigateTab(step.id === 'review_workspace' ? 'review' : step.id);
      setBlockedNotice(null);
      return;
    }

    // Traceability gate check
    if (isTraceabilityLocked && stepNumber > 1) {
      setBlockedNotice(
        '🔒 Traceability Gate Locked: Testing standards have expired. Resolve traceability in Standards Repository before proceeding.'
      );
      setTimeout(() => setBlockedNotice(null), 5000);
      return;
    }

    // Prerequisite sequential check
    if (stepNumber > currentStepNumber + 1 && session?.reviewStatus !== 'APPROVED') {
      const priorStep = STATUTORY_STEPS[stepIdx - 1];
      setBlockedNotice(
        `Prerequisite Required: Please complete Step ${priorStep.stepNum} (${priorStep.short}) before entering ${step.short}.`
      );
      setTimeout(() => setBlockedNotice(null), 5000);
      return;
    }

    // Accessible step
    onNavigateTab(step.id === 'review_workspace' ? 'review' : step.id);
    setBlockedNotice(null);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-2xs transition-colors shrink-0">
      
      {/* 1. Golden Padlock Banner if Approved (§13) */}
      {lockInfo.isGoldenPadlock && (
        <div className="bg-amber-500/10 dark:bg-amber-950/40 border-b border-amber-300 dark:border-amber-700/50 px-4 sm:px-6 py-1.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
            <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="font-bold tracking-wide">PERMANENTLY SEALED & APPROVED</span>
            <span className="text-amber-800/80 dark:text-amber-300/70 hidden sm:inline">
              — Digitally signed under Form VI. All test observations and parameters are read-only.
            </span>
          </div>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-bold border border-amber-400/40">
            GOLDEN PADLOCK
          </span>
        </div>
      )}

      {/* Blocked Explanation Notice (§24) */}
      {blockedNotice && (
        <div className="bg-rose-50 dark:bg-rose-950/60 border-b border-rose-200 dark:border-rose-800 px-4 sm:px-6 py-2 text-xs flex items-center justify-between text-rose-800 dark:text-rose-200 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-semibold">{blockedNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setBlockedNotice(null)}
            className="text-rose-500 hover:text-rose-800 text-xs font-bold px-2 py-0.5 rounded cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2. Desktop Spec Bar (§23, §35) */}
      <div className="hidden md:flex px-6 py-3 items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800">
        <SessionIdentity
          serialNumber={serialNumber}
          modelName={modelName}
          accuracyClass={accuracyClass}
          maxCap={maxCap}
          minCap={minCap}
          eVal={eVal}
          dVal={dVal}
        />

        <div className="flex items-center gap-3 shrink-0">
          <TraceabilityIndicator
            status={standardsStatus}
            isLocked={lockInfo.lockState === 'TRACEABILITY_LOCKED'}
            onNavigateToStandards={onNavigateToStandards}
          />

          <SessionProgress
            complianceStatus={session?.complianceStatus || 'PASS'}
            nextAction={nextAction}
            isGoldenPadlock={lockInfo.isGoldenPadlock}
            onNavigateTab={onNavigateTab}
          />
        </div>
      </div>

      {/* 2b. Mobile Spec Bar (§25) */}
      <div className="md:hidden px-4 py-2.5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-2 font-mono font-bold">
          <span className="text-blue-600 dark:text-blue-400">{serialNumber}</span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            {accuracyClass}
          </span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="text-emerald-700 dark:text-emerald-400 text-[11px]">✓ Valid</span>
        </div>

        <button
          type="button"
          onClick={() => setIsMobileDetailsOpen(!isMobileDetailsOpen)}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold cursor-pointer"
        >
          <span>Specs</span>
          {isMobileDetailsOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Expandable Mobile Accordion Details (§25) */}
      {isMobileDetailsOpen && (
        <div className="md:hidden px-4 py-3 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-xs space-y-2 animate-in fade-in duration-150">
          <div className="font-semibold text-slate-900 dark:text-white">{modelName}</div>
          <div className="grid grid-cols-2 gap-2 font-mono text-[11px] text-slate-600 dark:text-slate-400">
            <div>Max: <strong className="text-slate-800 dark:text-slate-200">{maxCap}</strong></div>
            <div>Min: <strong className="text-slate-800 dark:text-slate-200">{minCap}</strong></div>
            <div>Verification: <strong className="text-slate-800 dark:text-slate-200">{eVal}</strong></div>
            <div>Division: <strong className="text-slate-800 dark:text-slate-200">{dVal}</strong></div>
          </div>
        </div>
      )}

      {/* 3. 7-Step Statutory Horizontal Workflow Stepper (§23, §24, §25, §35) */}
      <SessionStepper
        steps={STATUTORY_STEPS}
        currentTab={currentTab}
        currentStepNumber={currentStepNumber}
        isApproved={session?.reviewStatus === 'APPROVED'}
        onStepClick={handleStepClick}
      />
    </div>
  );
};
