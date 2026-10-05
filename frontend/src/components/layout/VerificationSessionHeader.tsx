import React from 'react';
import {
  Scale,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  ScanLine,
  Camera,
  Crosshair,
  Repeat,
  ThermometerSnowflake,
  ClipboardCheck,
} from 'lucide-react';
import { useLab } from '../../context/LabContext';
import { useScenario } from '../../context/ScenarioContext';
import { useIoT } from '../../context/IoTContext';
import type { NavItemKey } from './Sidebar';

export interface VerificationSessionHeaderProps {
  currentTab: NavItemKey;
  onNavigateToTab: (tab: NavItemKey) => void;
  className?: string;
}

interface StepItem {
  key: NavItemKey;
  stepNumber: string;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  statutoryClause: string;
}

const VERIFICATION_STEPS: StepItem[] = [
  {
    key: 'intake',
    stepNumber: '01',
    label: 'Intake & TAM',
    shortLabel: 'Intake',
    icon: ScanLine,
    statutoryClause: 'OIML R 76-1 Cl. 3.1 & Table 3',
  },
  {
    key: 'vision_audit',
    stepNumber: '02',
    label: 'Physical Audit',
    shortLabel: 'Physical',
    icon: Camera,
    statutoryClause: 'Cl. 3.9.1.1 & Sec. 24',
  },
  {
    key: 'weighing',
    stepNumber: '03',
    label: 'Weighing Error',
    shortLabel: 'Weighing',
    icon: Scale,
    statutoryClause: 'Clause A.4.4 & Table 6',
  },
  {
    key: 'eccentricity',
    stepNumber: '04',
    label: 'Eccentricity',
    shortLabel: 'Eccentricity',
    icon: Crosshair,
    statutoryClause: 'Clause A.4.7',
  },
  {
    key: 'repeatability',
    stepNumber: '05',
    label: 'Repeatability',
    shortLabel: 'Repeatability',
    icon: Repeat,
    statutoryClause: 'Clause A.4.10 & A.4.8',
  },
  {
    key: 'tare_temp',
    stepNumber: '06',
    label: 'Drift & Tare',
    shortLabel: 'Drift',
    icon: ThermometerSnowflake,
    statutoryClause: 'Clause A.5.3 & A.4.6',
  },
  {
    key: 'review',
    stepNumber: '07',
    label: 'Review & Seal',
    shortLabel: 'Sign & Seal',
    icon: ClipboardCheck,
    statutoryClause: 'Rule 16 & OIML R 76-2',
  },
];

export const VerificationSessionHeader: React.FC<VerificationSessionHeaderProps> = ({
  currentTab,
  onNavigateToTab,
  className = '',
}) => {
  const { currentUser, lockedSessionCount } = useLab();
  const { activeScenario } = useScenario();
  const { isConnected, isSimulatorActive, currentWeight, isStable, unit: iotUnit } = useIoT();

  // Active Instrument Data from active scenario or baseline defaults
  const sessionNumber = activeScenario
    ? `TR-2026-${activeScenario.scenario_number.toString().padStart(4, '0')}`
    : 'TR-2026-0001';
  const modelName = activeScenario
    ? `${activeScenario.manufacturer} — ${activeScenario.model_name}`
    : 'Avery Weigh-Tronix ZM510 Precision Platform';
  const serialNumber = activeScenario?.serial_number || 'SN-2026-9931';
  const accuracyClass = activeScenario?.accuracy_class || 'CLASS_III';
  const maxCapacity = activeScenario?.max_capacity || 30000;
  const e = activeScenario?.e || 5;
  const d = activeScenario?.d || 5;
  const unit = activeScenario?.unit || 'g';
  const n = e > 0 ? Math.round(maxCapacity / e) : 6000;

  // Determine current step index
  const currentStepIdx = VERIFICATION_STEPS.findIndex((s) => s.key === currentTab);
  const isVerificationStep = currentStepIdx !== -1;

  if (!isVerificationStep) {
    return null;
  }

  const prevStep = currentStepIdx > 0 ? VERIFICATION_STEPS[currentStepIdx - 1] : null;
  const nextStep =
    currentStepIdx < VERIFICATION_STEPS.length - 1
      ? VERIFICATION_STEPS[currentStepIdx + 1]
      : null;

  return (
    <div
      className={`rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-xs overflow-hidden transition-all ${className}`}
    >
      {/* Top Banner: Persistent Case Context Header */}
      <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Left: Case Identity & Instrument Entity */}
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                CASE {sessionNumber}
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 font-sans">
                {modelName}
              </h2>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                (SN: {serialNumber})
              </span>
            </div>

            {/* Metrological Profile Sub-bar */}
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-mono">
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {accuracyClass.replace('_', ' ')}
              </span>
              <span>•</span>
              <span>Max: {maxCapacity.toLocaleString()} {unit}</span>
              <span>•</span>
              <span>e = {e} {unit}</span>
              <span>•</span>
              <span>d = {d} {unit}</span>
              <span>•</span>
              <span>n = {n.toLocaleString()} div</span>
              <span>•</span>
              <span className="text-slate-400 dark:text-slate-500 font-sans">
                Officer: <strong className="text-slate-700 dark:text-slate-300 font-medium">{currentUser.fullName}</strong>
              </span>
            </div>
          </div>

          {/* Right: Traceability Pre-Condition Gate & Live IoT Indicator */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Traceability Pre-Condition Gate Pill */}
            <button
              onClick={() => onNavigateToTab('traceability')}
              title="Click to inspect standard weights traceability"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-mono font-medium border cursor-pointer transition-colors ${
                lockedSessionCount > 0
                  ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30 hover:bg-rose-500/20'
                  : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
              }`}
            >
              {lockedSessionCount > 0 ? (
                <>
                  <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>STANDARDS: LOCKED</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>STANDARDS: VERIFIED</span>
                </>
              )}
            </button>

            {/* Scale Telemetry Snapping Pill */}
            <button
              onClick={() => onNavigateToTab('live_bridge')}
              title="Live scale connection"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-mono bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-colors"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isStable ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                }`}
              />
              <span className="font-semibold tabular-nums">
                {currentWeight.toFixed(1)} {iotUnit}
              </span>
              <span className="text-xs text-slate-400">
                {isConnected ? 'SERIAL' : isSimulatorActive ? 'VIRTUAL' : 'OFFLINE'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Linear Verification Stepper: 7-Step OIML R 76-1 Testing Protocol */}
      <div className="px-4 py-3 sm:px-5 overflow-x-auto scrollbar-none">
        <div className="flex items-center justify-between min-w-[780px] gap-2">
          {VERIFICATION_STEPS.map((step, idx) => {
            const isCurrent = step.key === currentTab;
            const isCompleted = idx < currentStepIdx;
            const Icon = step.icon;

            return (
              <React.Fragment key={step.key}>
                {/* Stepper Node Button */}
                <button
                  type="button"
                  onClick={() => onNavigateToTab(step.key)}
                  title={`${step.label} (${step.statutoryClause})`}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all cursor-pointer border shrink-0 ${
                    isCurrent
                      ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-100 font-semibold shadow-xs'
                      : isCompleted
                      ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-xs font-mono font-bold ${
                      isCurrent
                        ? 'bg-blue-600 text-white shadow-xs'
                        : isCompleted
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      step.stepNumber
                    )}
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-semibold leading-none flex items-center gap-1.5">
                      <Icon className={`w-4 h-4 shrink-0 ${isCurrent ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                      <span>{step.label}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-1">
                      {isCurrent ? 'Active Step' : isCompleted ? 'Completed' : 'Pending'}
                    </div>
                  </div>
                </button>

                {/* Connecting Step Arrow */}
                {idx < VERIFICATION_STEPS.length - 1 && (
                  <div
                    className={`h-0.5 w-3 shrink-0 transition-colors ${
                      idx < currentStepIdx
                        ? 'bg-emerald-500/50'
                        : 'bg-slate-200 dark:bg-slate-800'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Bottom Step Transition Toolbar: Previous / Next Quick Actions */}
      <div className="px-5 py-3 bg-slate-50/80 dark:bg-white/[0.015] border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs sm:text-sm">
        <div>
          {prevStep ? (
            <button
              type="button"
              onClick={() => onNavigateToTab(prevStep.key)}
              className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>
                Previous: <strong className="font-semibold text-slate-800 dark:text-slate-200">{prevStep.label}</strong>
              </span>
            </button>
          ) : (
            <span className="text-slate-400 text-xs">
              Step 1 of 7: Initial Instrument Intake
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-400 hidden sm:inline text-xs">
            OIML R 76-1 Statutory Test Sequence
          </span>

          {nextStep ? (
            <button
              type="button"
              onClick={() => onNavigateToTab(nextStep.key)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold cursor-pointer shadow-xs transition-colors text-xs sm:text-sm"
            >
              <span>Next: {nextStep.label}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onNavigateToTab('review')}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold cursor-pointer shadow-xs transition-colors text-xs sm:text-sm"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Complete Verification Session</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
