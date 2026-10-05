import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Layers,
  Save,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Lock,
  Scale,
  SlidersHorizontal,
} from 'lucide-react';
import {
  VerificationStage,
  StatutoryTestItem,
  GET_STATUTORY_TEST_SCOPE,
} from '../testplan/types';
import { ActiveInstrumentCard } from '../testplan/ActiveInstrumentCard';
import { TestPlanSummaryCards } from '../testplan/TestPlanSummaryCards';
import { TestScopeMatrixTable } from '../testplan/TestScopeMatrixTable';
import { VerificationReadinessPanel } from '../testplan/VerificationReadinessPanel';
import { SessionProgressWidget } from '../testplan/SessionProgressWidget';

interface TestApplicabilityViewProps {
  session: any;
  standardsValid: boolean;
  userRole?: string;
  onBackToSessions: () => void;
  onNavigateToTest: (targetView: string) => void;
  onNavigateToStandards?: () => void;
}

export const TestApplicabilityView: React.FC<TestApplicabilityViewProps> = ({
  session,
  standardsValid: initialStandardsValid,
  userRole = 'Metrologist',
  onBackToSessions,
  onNavigateToTest,
  onNavigateToStandards,
}) => {
  const sessionNumber = session?.sessionNumber || session?.id || 'VR-2026-00418';
  const manufacturer = session?.manufacturer || 'Avery Weigh-Tronix';
  const model = session?.model || session?.instrument || 'ZM201 Retail Platform';
  const serialNumber = session?.serialNumber || 'AV-2026-8812';
  const accuracyClass = session?.accuracyClass || 'Class III';
  const maxCapacity = session?.maxCapacity || '30.0 kg';
  const interval = session?.interval || 'e = 0.005 kg';

  // Verification stage state
  const [verificationStage, setVerificationStage] = useState<VerificationStage>('Subsequent Verification');
  const [standardsValid, setStandardsValid] = useState<boolean>(initialStandardsValid);
  const [baselineRecorded, setBaselineRecorded] = useState<boolean>(true);

  // Micro-interaction notification (§18)
  const [stageEvaluationToast, setStageEvaluationToast] = useState<string | null>(null);

  const isPhysicalDone = session?.physicalInspection?.status === 'PASS';

  // Tests derived dynamically from stage and prerequisites
  const [tests, setTests] = useState<StatutoryTestItem[]>(() =>
    GET_STATUTORY_TEST_SCOPE(verificationStage, standardsValid, baselineRecorded, isPhysicalDone)
  );

  // Update tests whenever stage, standardsValid, or baselineRecorded changes
  useEffect(() => {
    setTests(GET_STATUTORY_TEST_SCOPE(verificationStage, standardsValid, baselineRecorded, isPhysicalDone));
  }, [verificationStage, standardsValid, baselineRecorded, isPhysicalDone]);

  // Stage change handler with micro-interaction animation (§18)
  const handleStageChange = (newStage: VerificationStage) => {
    setStageEvaluationToast(`Evaluating statutory rules for ${newStage}...`);
    setTimeout(() => {
      setVerificationStage(newStage);
      setStageEvaluationToast(`✓ Test plan updated: 8 procedures evaluated for ${newStage}.`);
      setTimeout(() => setStageEvaluationToast(null), 3000);
    }, 250);
  };

  // Metrics
  const applicableCount = tests.filter((t) => t.applicable).length;
  const totalCount = tests.length;
  const requiredCount = tests.filter((t) => t.required).length;
  const completeCount = tests.filter((t) => t.status === 'COMPLETE').length;
  const blockerCount = (!standardsValid ? 1 : 0) + (!baselineRecorded ? 1 : 0);
  const isReady = blockerCount === 0;

  // Next ready test in sequence
  const nextReadyTest = tests.find((t) => t.status === 'READY' || t.status === 'CURRENT') || tests[0];

  // Handler for primary "Start Testing" CTA (§11)
  const handleStartTesting = () => {
    if (nextReadyTest) {
      onNavigateToTest(nextReadyTest.targetView);
    } else {
      onNavigateToTest('physical_inspection');
    }
  };

  // Demo Sandbox Handlers
  const handleSimulateAllReady = () => {
    setStandardsValid(true);
    setBaselineRecorded(true);
    setVerificationStage('Subsequent Verification');
  };

  const handleSimulateTypeApproval = () => {
    setStandardsValid(true);
    setBaselineRecorded(true);
    setVerificationStage('Initial Type Approval');
  };

  const handleSimulateInService = () => {
    setStandardsValid(true);
    setBaselineRecorded(true);
    setVerificationStage('In-Service Inspection');
  };

  const handleSimulateBlocker = () => {
    setStandardsValid(false);
  };

  return (
    <div className="space-y-6 pb-28 select-none font-mono">
      {/* Toast Notification (§18) */}
      {stageEvaluationToast && (
        <div className="fixed top-6 right-6 z-50 bg-foundation-900 text-white px-5 py-3 rounded-xl shadow-xl border border-foundation-700 flex items-center gap-2.5 animate-in slide-in-from-top duration-200">
          <Sparkles size={15} className="text-brand-400 shrink-0" />
          <span className="text-xs font-bold font-sans">{stageEvaluationToast}</span>
        </div>
      )}

      {/* 1. Hero Session Header (§2, §4) */}
      <div className="bg-white rounded-xl border border-foundation-200 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <button
                type="button"
                onClick={onBackToSessions}
                className="text-xs font-semibold text-foundation-500 hover:text-brand-600 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <ArrowLeft size={13} />
                <span>Sessions / {sessionNumber}</span>
              </button>
              <span className="text-foundation-300">•</span>
              <span className="text-xs font-bold text-foundation-500 uppercase tracking-wider">
                OIML R 76-1 • Test Applicability
              </span>
            </div>

            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foundation-950 font-sans">
                Test Plan: Applicability & Verification Scope
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono uppercase flex items-center gap-1.5 ${
                  isReady
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isReady ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                <span>{isReady ? '● READY TO START' : '● 1 BLOCKER'}</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-foundation-500 font-sans mt-1">
              Review the statutory procedures applicable to this instrument before active verification testing begins.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start lg:self-center font-mono text-xs">
            <span className="px-3 py-1.5 rounded-lg bg-foundation-50 text-foundation-700 border border-foundation-200 font-bold">
              Role: {userRole}
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-brand-50 text-brand-800 border border-brand-200 font-bold">
              {applicableCount} / {totalCount} Applicable
            </span>
          </div>
        </div>
      </div>

      {/* 2. Active Instrument Context Ribbon & Stage Selector (§3) */}
      <ActiveInstrumentCard
        manufacturer={manufacturer}
        model={model}
        serialNumber={serialNumber}
        sessionNumber={sessionNumber}
        accuracyClass={accuracyClass}
        maxCapacity={maxCapacity}
        interval={interval}
        verificationStage={verificationStage}
        onSelectStage={handleStageChange}
        standardsValid={standardsValid}
      />

      {/* 3. Three Summary Cards (§5) */}
      <TestPlanSummaryCards
        accuracyClass={accuracyClass}
        verificationStage={verificationStage}
        applicableCount={applicableCount}
        totalCount={totalCount}
        isReady={isReady}
        blockerCount={blockerCount}
      />

      {/* 4. Main 2-Column Split: 8-Test Matrix + Right Contextual Panel (§6, §7, §14) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 8-Procedure Statutory Test Matrix (8 cols / ~67%) */}
        <div className="lg:col-span-8 space-y-6">
          <TestScopeMatrixTable
            tests={tests}
            onOpenTest={(t) => onNavigateToTest(t.targetView)}
            standardsValid={standardsValid}
            userRole={userRole}
            onResolveBlocked={() => {
              if (onNavigateToStandards) {
                onNavigateToStandards();
              } else {
                setStandardsValid(true);
              }
            }}
          />

          {/* Verification Readiness Checklist & Gate Panel (§11, §12) */}
          <VerificationReadinessPanel
            tests={tests}
            standardsValid={standardsValid}
            onStartTesting={handleStartTesting}
            onResolveBlocker={() => {
              if (onNavigateToStandards) {
                onNavigateToStandards();
              } else {
                setStandardsValid(true);
              }
            }}
            baselineRecorded={baselineRecorded}
          />
        </div>

        {/* Right Column: Workflow Progress & Traceability Panel (§14) (4 cols / ~33%) */}
        <div className="lg:col-span-4 space-y-6">
          <SessionProgressWidget
            standardsValid={standardsValid}
            assignedStandardId="E2-014"
            assignedStandardClass="E2"
            daysRemaining={42}
            validUntilDate="12 Dec 2026"
            onNavigateToStandards={onNavigateToStandards}
          />

          {/* Statutory Authority Card */}
          <div className="bg-white rounded-xl border border-foundation-200 p-5 shadow-xs font-mono text-xs space-y-3">
            <span className="text-[10px] font-bold text-foundation-400 uppercase tracking-wider block">
              REGULATORY JURISDICTION
            </span>

            <div className="space-y-2 text-foundation-700 font-sans text-xs">
              <div className="flex justify-between border-b border-foundation-100 pb-1.5">
                <span className="text-foundation-500">Primary Standard:</span>
                <span className="font-bold text-foundation-900">OIML R 76-1 (2006)</span>
              </div>
              <div className="flex justify-between border-b border-foundation-100 pb-1.5">
                <span className="text-foundation-500">Software Guide:</span>
                <span className="font-bold text-foundation-900">WELMEC 7.2 (Risk Class C)</span>
              </div>
              <div className="flex justify-between border-b border-foundation-100 pb-1.5">
                <span className="text-foundation-500">National Statute:</span>
                <span className="font-bold text-foundation-900">Legal Metrology Act, 2009</span>
              </div>
              <div className="flex justify-between pt-0.5">
                <span className="text-foundation-500">Inspection Lab:</span>
                <span className="font-bold text-foundation-900">RRSL Bengaluru</span>
              </div>
            </div>

            <p className="text-[11px] text-foundation-400 font-sans pt-1">
              Test applicability cannot be manually suppressed by operators under ISO/IEC 17025 rules.
            </p>
          </div>
        </div>
      </div>

      {/* 5. Statutory Sandbox Demo Presets Bar */}
      <div className="p-4 rounded-xl border border-foundation-200 bg-white/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-brand-600 shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foundation-900 font-sans">
                Statutory Scope Simulation Sandbox:
              </span>
              <span className="text-[10px] bg-brand-100 text-brand-700 font-bold px-1.5 py-0.5 rounded">
                DEMO PRESETS
              </span>
            </div>
            <p className="text-[11px] text-foundation-500 font-sans mt-0.5">
              Switch verification stage or simulate prerequisite gates to show dynamic applicability to judges.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <button
            type="button"
            onClick={handleSimulateAllReady}
            className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
              verificationStage === 'Subsequent Verification' && standardsValid
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            ✓ Subsequent (8/8 Ready)
          </button>

          <button
            type="button"
            onClick={handleSimulateTypeApproval}
            className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
              verificationStage === 'Initial Type Approval'
                ? 'bg-indigo-600 text-white'
                : 'bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100'
            }`}
          >
            ● Type Approval (Full 8 Tests)
          </button>

          <button
            type="button"
            onClick={handleSimulateInService}
            className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
              verificationStage === 'In-Service Inspection'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100'
            }`}
          >
            ● In-Service (Routine 6/8)
          </button>

          <button
            type="button"
            onClick={handleSimulateBlocker}
            className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
              !standardsValid
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            <Lock size={11} className="inline mr-1" />
            <span>Trigger Gate Blocker</span>
          </button>

          <button
            type="button"
            onClick={handleSimulateAllReady}
            className="p-1 rounded-md text-foundation-500 hover:text-foundation-900 hover:bg-foundation-100 transition-colors cursor-pointer"
            title="Reset to default readiness"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* 6. Sticky Bottom Action Footer (§2) */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-foundation-200 py-3.5 px-4 sm:px-8 z-30 shadow-lg font-mono">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs w-full sm:w-auto">
            <span className="font-bold text-foundation-800 font-sans">
              Test Scope Status:
            </span>
            <span className="text-foundation-600">
              {completeCount} of {requiredCount} required tests completed
            </span>
            <span className="text-foundation-300 hidden sm:inline">•</span>
            <span className="text-brand-700 font-bold hidden sm:inline">
              Next: {nextReadyTest ? nextReadyTest.name : 'Weighing Error & Linearity'}
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              disabled={!isReady}
              onClick={handleStartTesting}
              className={`px-7 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer ${
                !isReady
                  ? 'bg-foundation-300 text-foundation-500 cursor-not-allowed shadow-none'
                  : 'bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white shadow-brand-200'
              }`}
            >
              <span>Start Testing →</span>
              <ArrowRight size={14} className="stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
