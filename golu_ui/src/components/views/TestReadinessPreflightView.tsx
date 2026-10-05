import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ArrowRight,
  ShieldCheck,
  Thermometer,
  RotateCcw,
  Check,
  Clock,
  FileCheck2,
  History,
  AlertOctagon,
  RefreshCw,
  HelpCircle,
  Scale,
} from 'lucide-react';
import {
  PreflightSummary,
  PreflightState,
  ReadinessCheckItem,
  EnvironmentalBaseline,
} from '../readiness/types';
import {
  INITIAL_PREFLIGHT_SUMMARY,
  CANONICAL_READY_CHECKLIST,
  CANONICAL_ATTENTION_CHECKLIST,
  CANONICAL_BLOCKED_CHECKLIST,
  CANONICAL_REMANDED_CHECKLIST,
  CANONICAL_PREFLIGHT_STEPS,
} from '../readiness/mockReadinessData';
import { PreflightStepper } from '../readiness/PreflightStepper';
import { ReadinessHeroCards } from '../readiness/ReadinessHeroCards';
import { ReadinessChecklistTable } from '../readiness/ReadinessChecklistTable';
import { PhysicalPreconditionCard } from '../readiness/PhysicalPreconditionCard';
import { NextTestAndHardwarePreview } from '../readiness/NextTestAndHardwarePreview';
import { EnvironmentBaselineCard } from '../readiness/EnvironmentBaselineCard';
import { BlockerDetailDrawer } from '../readiness/BlockerDetailDrawer';
import { WhyCantIStartModal } from '../readiness/WhyCantIStartModal';
import { PreflightConfirmationModal } from '../readiness/PreflightConfirmationModal';
import { useToast } from '../layout/ToastViewport';

interface TestReadinessPreflightViewProps {
  session?: any;
  onBackToSession: () => void;
  onNavigateToTab: (tabId: string) => void;
  onStartVerification: () => void;
  userRole?: string;
  isGloballyTraceabilityLocked?: boolean;
}

export const TestReadinessPreflightView: React.FC<TestReadinessPreflightViewProps> = ({
  session,
  onBackToSession,
  onNavigateToTab,
  onStartVerification,
  userRole = 'Metrologist',
  isGloballyTraceabilityLocked = false,
}) => {
  const { showToast } = useToast();

  const roleLower = userRole.toLowerCase();
  const isReadOnly =
    roleLower.includes('review') ||
    roleLower.includes('director') ||
    roleLower.includes('audit');

  // Interactive Scenario / State Switcher (§18)
  const [state, setState] = useState<PreflightState>(
    isGloballyTraceabilityLocked ? 'BLOCKED' : 'READY'
  );

  const [selectedItem, setSelectedItem] = useState<ReadinessCheckItem | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [isWhyBlockedModalOpen, setIsWhyBlockedModalOpen] = useState<boolean>(false);
  const [isAllBlockersDrawerOpen, setIsAllBlockersDrawerOpen] = useState<boolean>(false);
  const [isRefreshingSensor, setIsRefreshingSensor] = useState<boolean>(false);

  // Live environmental baseline state (§9 & §10)
  const [environment, setEnvironment] = useState<EnvironmentalBaseline>(
    INITIAL_PREFLIGHT_SUMMARY.environmentalBaseline
  );

  // Summary with session props fallback
  const summary: PreflightSummary = {
    ...INITIAL_PREFLIGHT_SUMMARY,
    sessionNumber: session?.sessionNumber || session?.id || INITIAL_PREFLIGHT_SUMMARY.sessionNumber,
    manufacturer: session?.manufacturer || INITIAL_PREFLIGHT_SUMMARY.manufacturer,
    model: session?.model || INITIAL_PREFLIGHT_SUMMARY.model,
    serialNumber: session?.serialNumber || INITIAL_PREFLIGHT_SUMMARY.serialNumber,
    accuracyClass: session?.accuracyClass || INITIAL_PREFLIGHT_SUMMARY.accuracyClass,
    maxCapacity: session?.maxCapacity || INITIAL_PREFLIGHT_SUMMARY.maxCapacity,
    verificationInterval: session?.interval || INITIAL_PREFLIGHT_SUMMARY.verificationInterval,
    environmentalBaseline: environment,
  };

  // Determine active checklist based on state (§6 & §18)
  const getChecklistForState = (): ReadinessCheckItem[] => {
    switch (state) {
      case 'ATTENTION':
        return CANONICAL_ATTENTION_CHECKLIST;
      case 'BLOCKED':
        return CANONICAL_BLOCKED_CHECKLIST;
      case 'REMANDED':
        return CANONICAL_REMANDED_CHECKLIST;
      case 'APPROVED':
      case 'READY':
      default:
        return CANONICAL_READY_CHECKLIST;
    }
  };

  const checklistItems = getChecklistForState();

  const isBlocked = state === 'BLOCKED' || isGloballyTraceabilityLocked;
  const isAttention = state === 'ATTENTION';
  const isApproved = state === 'APPROVED';
  const isRemanded = state === 'REMANDED';
  const isReady = state === 'READY' && !isGloballyTraceabilityLocked;

  // Refresh reading handler (§10 & §11)
  const handleRefreshEnvironment = () => {
    setIsRefreshingSensor(true);
    setTimeout(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' IST';
      // Simulated variation within OIML limits
      const tempVariation = (Math.random() * 0.4 - 0.2).toFixed(1);
      const newTemp = parseFloat((23.4 + parseFloat(tempVariation)).toFixed(1));
      const newHumidity = Math.round(48 + (Math.random() * 2 - 1));

      setEnvironment({
        temperatureC: newTemp,
        temperatureValid: true,
        humidityPercent: newHumidity,
        humidityValid: true,
        pressureHpa: 1008,
        pressureValid: true,
        timestamp: timeStr,
        sensorNode: 'BMP-280 Environmental Node #04 (Calibrated)',
      });

      setIsRefreshingSensor(false);
      showToast(
        'Environmental Baseline Refreshed',
        `Sensor readings updated at ${timeStr}. Temperature: ${newTemp}°C, Humidity: ${newHumidity}%, Pressure: 1008 hPa.`,
        'success'
      );
    }, 600);
  };

  const blockedItems = checklistItems.filter(
    (i) => i.status === 'BLOCKED' || (isRemanded && i.status === 'WARNING')
  );

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-200">
      {/* 1. Top Breadcrumb & Scenario Switcher (§3 & §18) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5 text-xs font-semibold">
          <button
            type="button"
            onClick={onBackToSession}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Session #{summary.sessionNumber}</span>
          </button>
          <span className="text-slate-400">/</span>
          <span className="font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Test Readiness Gate
          </span>
        </div>

        {/* Demo State Switcher for Assessment (§18) */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium hidden md:inline">
            Readiness State:
          </span>
          <div className="inline-flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => setState('READY')}
              className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                state === 'READY'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              ✓ Ready (8/8)
            </button>
            <button
              type="button"
              onClick={() => setState('ATTENTION')}
              className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                state === 'ATTENTION'
                  ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              ⚠ Attention
            </button>
            <button
              type="button"
              onClick={() => setState('BLOCKED')}
              className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                state === 'BLOCKED'
                  ? 'bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              🔒 Blocked
            </button>
            <button
              type="button"
              onClick={() => setState('REMANDED')}
              className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                state === 'REMANDED'
                  ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Remanded
            </button>
            <button
              type="button"
              onClick={() => setState('APPROVED')}
              className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                state === 'APPROVED'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Approved
            </button>
          </div>
        </div>
      </div>

      {/* 2. Global Seven-Stage Stepper (§23) */}
      <PreflightStepper onNavigateToTab={onNavigateToTab} />

      {/* 3. Header & Technical Specification Banner (§3 & §4) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Test Readiness
            </h1>
            <span
              className={`font-mono text-xs font-bold px-3 py-1 rounded-full ${
                isApproved
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : isBlocked
                  ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                  : isAttention || isRemanded
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
              }`}
            >
              {isApproved
                ? '🔒 SESSION APPROVED'
                : isBlocked
                ? '⚠ ACTION REQUIRED'
                : isAttention
                ? '⚠ ATTENTION NEEDED'
                : isRemanded
                ? '⚠ CORRECTION REQUIRED'
                : '✓ READY TO START'}
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Final GO / NO-GO verification gate before statutory measurement begins.
          </p>

          <div className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-300 pt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-bold text-slate-900 dark:text-white">
              {summary.manufacturer} {summary.model}
            </span>
            <span className="text-slate-400">·</span>
            <span>Serial: <strong className="text-slate-900 dark:text-white">{summary.serialNumber}</strong></span>
            <span className="text-slate-400">·</span>
            <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded font-bold text-slate-800 dark:text-slate-200">{summary.accuracyClass}</span>
            <span className="text-slate-400">·</span>
            <span>Max {summary.maxCapacity}</span>
            <span className="text-slate-400">·</span>
            <span>e = 0.005 kg</span>
            <span className="text-slate-400">·</span>
            <span className="text-blue-600 dark:text-blue-400 font-bold uppercase">{summary.verificationStage}</span>
          </div>
        </div>

        {isReadOnly && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            <Lock className="w-3.5 h-3.5" />
            <span>ROLE: {userRole.toUpperCase()} (READ ONLY)</span>
          </div>
        )}
      </div>

      {/* 4. Primary Readiness Banners (§1, §4, §15, §16) */}
      {isApproved ? (
        /* Approved Session State (§15) */
        <div className="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <Lock className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-black tracking-tight uppercase">
                🔒 APPROVED SESSION · PREFLIGHT COMPLETED
              </h2>
              <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
                Preflight completed · Testing completed · Certificate Form VI digitally signed by Director. This session is immutable.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigateToTab('reports')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>View Certificate</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateToTab('audit')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <History className="w-4 h-4" />
              <span>Audit Trail</span>
            </button>
          </div>
        </div>
      ) : isRemanded ? (
        /* Remanded Session State (§16) */
        <div className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-md">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-black tracking-tight uppercase">
                ⚠ SESSION REMANDED · PREFLIGHT REQUIRES CORRECTION
              </h2>
              <p className="text-xs text-amber-900 dark:text-amber-300 leading-relaxed">
                Reviewer note: &ldquo;Repeat physical inspection after seal verification.&rdquo; Testing cannot commence until resolved.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateToTab('physical_inspection')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer whitespace-nowrap"
          >
            <span>Resolve Remand in Inspection →</span>
          </button>
        </div>
      ) : isBlocked ? (
        /* Blocked Banner (§4, §10, §15) */
        <div className="p-6 rounded-3xl bg-red-50 dark:bg-red-950/40 border-2 border-red-300 dark:border-red-800 text-red-950 dark:text-red-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-600/30">
              <Lock className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-black tracking-tight uppercase text-red-900 dark:text-red-300">
                🔒 TESTING BLOCKED · TRACEABILITY LOCKOUT
              </h2>
              <p className="text-xs text-red-800 dark:text-red-300 leading-relaxed">
                The assigned standard weight set (<strong className="font-mono">{summary.selectedWeightSet}</strong>) has expired. Test inputs are locked under OIML R 76-1 statutory mandates.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsWhyBlockedModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl border border-red-300 dark:border-red-800 bg-white dark:bg-slate-800 text-red-700 dark:text-red-300 font-bold text-xs hover:bg-red-100 transition-colors cursor-pointer"
            >
              Why Blocked?
            </button>
            <button
              type="button"
              onClick={() => onNavigateToTab('standards')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md shadow-red-600/20 transition-all cursor-pointer whitespace-nowrap"
            >
              <span>Manage Standard Weights →</span>
            </button>
          </div>
        </div>
      ) : isAttention ? (
        /* Warning Banner (§4) */
        <div className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-md">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-black tracking-tight uppercase">
                ⚠ READY WITH ATTENTION
              </h2>
              <p className="text-xs text-amber-900 dark:text-amber-300 leading-relaxed">
                1 non-blocking item requires review: Reference standard set expires in 12 days. Prepare backup set E2-015 for ongoing sessions.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateToTab('standards')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer whitespace-nowrap"
          >
            <span>Review Weights Registry →</span>
          </button>
        </div>
      ) : (
        /* Ready Banner (§4 & §18) */
        <div className="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-black tracking-tight uppercase text-emerald-900 dark:text-emerald-300">
              ✓ READY TO BEGIN TESTING
            </h2>
            <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
              All 8 required preflight checks have passed. Standard weight traceability is verified through NPL/RRSL.
            </p>
          </div>
        </div>
      )}

      {/* 5. Three Readiness Cards (§5 & §15) */}
      <ReadinessHeroCards
        summary={summary}
        state={state}
        onNavigateToTab={onNavigateToTab}
        isTraceabilityBlocked={isBlocked}
      />

      {/* 6. Readiness Checklist Table & Drawer Trigger (§6, §7, §8, §16, §27) */}
      <ReadinessChecklistTable
        items={checklistItems}
        onSelectItem={(item) => setSelectedItem(item)}
      />

      {/* 7. Grid of 3 Deep Context Panels: Physical Precondition (§13), Environment Baseline (§10), Next Test & Bridge (§24, §25) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <PhysicalPreconditionCard
          status={summary.physicalInspection}
          isRemanded={isRemanded}
          onNavigateToInspection={() => onNavigateToTab('physical_inspection')}
        />

        <EnvironmentBaselineCard
          baseline={summary.environmentalBaseline}
          onRefresh={handleRefreshEnvironment}
          onUpdateBaseline={(updated) => setEnvironment(updated)}
          isRefreshing={isRefreshingSensor}
        />

        <NextTestAndHardwarePreview
          nextTest={summary.nextTest}
          telemetry={summary.hardwareTelemetry}
          isBlocked={isBlocked}
          onStartProcedure={() => onNavigateToTab('weighing_linearity')}
          onOpenHardwareBridge={() => onNavigateToTab('hardware_bridge')}
        />
      </div>

      {/* 8. Ready-to-Start Primary Action Bar (§11, §12, §17, §18, §22) */}
      {!isApproved && (
        <div
          className={`p-6 sm:p-7 rounded-3xl border shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 ${
            isBlocked
              ? 'bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-800 opacity-95'
              : 'bg-gradient-to-r from-slate-900 to-indigo-950 text-white border-slate-800'
          }`}
        >
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                  isBlocked
                    ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-300'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {isBlocked ? <Lock className="w-3 h-3" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                {isBlocked ? 'PRECONDITIONS UNMET · TESTING BLOCKED' : 'ALL 8 PRECONDITIONS SATISFIED'}
              </span>
            </div>

            <h3
              className={`text-lg font-black tracking-tight ${
                isBlocked ? 'text-slate-900 dark:text-white' : 'text-white'
              }`}
            >
              {isBlocked
                ? 'Verification Cannot Proceed Until Lockout is Resolved'
                : 'Ready to Begin Measurement Testing'}
            </h3>

            <p
              className={`text-xs leading-relaxed ${
                isBlocked ? 'text-slate-600 dark:text-slate-400' : 'text-slate-300'
              }`}
            >
              {isBlocked
                ? 'Statutory standard weights calibration has expired or physical inspection is remanded. Test execution is blocked under OIML R 76-1.'
                : 'Preflight gate verified under OIML R 76-1. Initializing testing will launch TEST_01 Weighing Error & Linearity (31 observation points).'}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {isBlocked && (
              <button
                type="button"
                onClick={() => setIsWhyBlockedModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <HelpCircle className="w-4 h-4 text-slate-400" />
                <span>Why can&apos;t I start?</span>
              </button>
            )}

            {isReadOnly ? (
              <button
                type="button"
                onClick={onBackToSession}
                className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all cursor-pointer"
              >
                <span>Return to Session Overview</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={isBlocked}
                onClick={() => {
                  if (isBlocked) {
                    setIsWhyBlockedModalOpen(true);
                  } else {
                    setIsConfirmModalOpen(true);
                  }
                }}
                className={`inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-xs font-black transition-all shadow-lg cursor-pointer ${
                  isBlocked
                    ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-300 dark:border-slate-700'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 hover:scale-[1.02]'
                }`}
              >
                <span>{isBlocked ? 'Testing Locked' : 'Start Testing →'}</span>
                {!isBlocked && <ArrowRight className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>
      )}

      {/* 9. Slideover Blocker & Spec Inspection Drawer (§21) */}
      <BlockerDetailDrawer
        isOpen={Boolean(selectedItem) || isAllBlockersDrawerOpen}
        item={selectedItem}
        allItems={checklistItems}
        onClose={() => {
          setSelectedItem(null);
          setIsAllBlockersDrawerOpen(false);
        }}
        onResolve={(targetTab) => {
          setSelectedItem(null);
          setIsAllBlockersDrawerOpen(false);
          onNavigateToTab(targetTab);
        }}
      />

      {/* 10. “Why can't I start?” Explanation Modal (§22) */}
      <WhyCantIStartModal
        isOpen={isWhyBlockedModalOpen}
        onClose={() => setIsWhyBlockedModalOpen(false)}
        blockedItems={blockedItems}
        onOpenDrawer={() => {
          setIsWhyBlockedModalOpen(false);
          setIsAllBlockersDrawerOpen(true);
        }}
        onResolveItem={(targetTab) => {
          setIsWhyBlockedModalOpen(false);
          onNavigateToTab(targetTab);
        }}
      />

      {/* 11. 4-Phase Preflight Confirmation Modal (§19) */}
      <PreflightConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={onStartVerification}
        summary={summary}
      />
    </div>
  );
};
