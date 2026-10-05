import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Check,
  RotateCcw,
  Sparkles,
  Lock,
  ExternalLink,
  ShieldCheck,
  Scale,
} from 'lucide-react';
import { TestLoadSelector, RepeatabilityLoadOption } from '../repeatability/TestLoadSelector';
import { RepeatabilitySequenceTable, RepeatabilityReading } from '../repeatability/RepeatabilitySequenceTable';
import { DispersionScatterChart } from '../repeatability/DispersionScatterChart';
import { RepeatabilitySummaryCard } from '../repeatability/RepeatabilitySummaryCard';
import { SpreadAnalysisDrawer } from '../repeatability/SpreadAnalysisDrawer';
import { ZeroReturnSummaryCard } from '../repeatability/ZeroReturnSummaryCard';
import { RunDetailDrawer } from '../repeatability/RunDetailDrawer';
import { RepeatabilityAuditModal, RepeatabilityAuditComment } from '../repeatability/RepeatabilityAuditModal';
import { RepeatabilityManualModal } from '../repeatability/RepeatabilityManualModal';

interface RepeatabilityWorkspaceViewProps {
  session: any;
  onBackToDashboard: () => void;
  onContinueToEnvironment: (updatedSession: any) => void;
  onNavigatePrevious?: () => void;
  onUpdateSession?: (updatedSession: any) => void;
  onNavigateToStandards?: () => void;
}

export const RepeatabilityWorkspaceView: React.FC<RepeatabilityWorkspaceViewProps> = ({
  session,
  onBackToDashboard,
  onContinueToEnvironment,
  onNavigatePrevious,
  onUpdateSession,
  onNavigateToStandards,
}) => {
  // Session metadata
  const sessionNumber = session?.sessionNumber || session?.id || 'VR-2026-00418';
  const manufacturer = session?.manufacturer || 'Avery Weigh-Tronix';
  const model = session?.model || session?.instrument || 'ZM201 Retail Platform';
  const serialNumber = session?.serialNumber || 'AV-2026-8812';
  const accuracyClass = session?.accuracyClass || 'Class III';
  const maxCapacityKg = 30.0;
  const allowableLimitGrams = 2.0; // Statutory MPE limit per OIML Clause A.4.10
  const userRole = session?.userRole || 'METROLOGIST';

  // 1. Test Load Selection (Section 3, 22, 23)
  const [loadOption, setLoadOption] = useState<RepeatabilityLoadOption>('0.5_max');
  const targetLoadKg = loadOption === '0.5_max' ? 15.0 : loadOption === '0.8_max' ? 24.0 : 30.0;

  // Canonical source scenario (§15, §30): Emax = +1.8g, Emin = +0.6g => Spread Δ = 1.2g, Limit = 2.0g => PASS
  const canonicalReadings: RepeatabilityReading[] = [
    { run: 1, targetLoad: 15.0, observedReading: 15.001, zeroReturnConfirmed: true, errorGrams: 1.0, status: 'PASS' },
    { run: 2, targetLoad: 15.0, observedReading: 15.0018, zeroReturnConfirmed: true, errorGrams: 1.8, status: 'PASS' },
    { run: 3, targetLoad: 15.0, observedReading: 15.0006, zeroReturnConfirmed: true, errorGrams: 0.6, status: 'PASS' },
    { run: 4, targetLoad: 15.0, observedReading: 15.0012, zeroReturnConfirmed: true, errorGrams: 1.2, status: 'PASS' },
    { run: 5, targetLoad: 15.0, observedReading: 15.0015, zeroReturnConfirmed: true, errorGrams: 1.5, status: 'PASS' },
    { run: 6, targetLoad: 15.0, observedReading: 15.0010, zeroReturnConfirmed: true, errorGrams: 1.0, status: 'PASS' },
    { run: 7, targetLoad: 15.0, observedReading: 15.0008, zeroReturnConfirmed: true, errorGrams: 0.8, status: 'PASS' },
    { run: 8, targetLoad: 15.0, observedReading: 15.0014, zeroReturnConfirmed: true, errorGrams: 1.4, status: 'PASS' },
    { run: 9, targetLoad: 15.0, observedReading: 15.0011, zeroReturnConfirmed: true, errorGrams: 1.1, status: 'PASS' },
    { run: 10, targetLoad: 15.0, observedReading: 15.0009, zeroReturnConfirmed: true, errorGrams: 0.9, status: 'PASS' },
  ];

  // Multi-load storage state (§22, §23)
  const [loadDatasets, setLoadDatasets] = useState<Record<RepeatabilityLoadOption, RepeatabilityReading[]>>({
    '0.5_max': canonicalReadings,
    '0.8_max': Array.from({ length: 10 }, (_, i) => ({
      run: i + 1,
      targetLoad: 24.0,
      observedReading: undefined,
      zeroReturnConfirmed: false,
      errorGrams: undefined,
      status: 'PENDING',
    })),
    '1.0_max': Array.from({ length: 10 }, (_, i) => ({
      run: i + 1,
      targetLoad: 30.0,
      observedReading: undefined,
      zeroReturnConfirmed: false,
      errorGrams: undefined,
      status: 'PENDING',
    })),
  });

  const readings = loadDatasets[loadOption];

  // Active run & UI selection
  const [activeRun, setActiveRun] = useState<number>(11); // 11 means completed 10
  const [selectedRunId, setSelectedRunId] = useState<number>(2);

  // Drawers and Modals
  const [isAnalysisDrawerOpen, setIsAnalysisDrawerOpen] = useState<boolean>(false);
  const [detailRunId, setDetailRunId] = useState<number | null>(null);
  const [auditRunId, setAuditRunId] = useState<number | null>(null);
  const [manualRunId, setManualRunId] = useState<number | null>(null);
  const [auditComments, setAuditComments] = useState<Record<number, RepeatabilityAuditComment>>({});

  // Hardware live scale & traceability lock state (§9, §29)
  const [isScaleStable, setIsScaleStable] = useState<boolean>(true);
  const [isTraceabilityLocked, setIsTraceabilityLocked] = useState<boolean>(false);

  // Transition state
  const [isAdvancing, setIsAdvancing] = useState<boolean>(false);
  const [advanceCompleted, setAdvanceCompleted] = useState<boolean>(false);

  // Derived statistics (Section 12, 14, 25)
  const evaluatedReadings = readings.filter((r) => r.errorGrams !== undefined);
  const errorValues = evaluatedReadings.map((r) => r.errorGrams || 0);

  const minError = errorValues.length > 0 ? Math.min(...errorValues) : 0.6;
  const maxError = errorValues.length > 0 ? Math.max(...errorValues) : 1.8;
  const spread = errorValues.length > 0 ? Math.round((maxError - minError) * 10) / 10 : 1.2;

  const completedCount = readings.filter((r) => r.observedReading !== undefined && r.zeroReturnConfirmed).length;
  const isSequenceComplete = completedCount === 10;
  const isPass = spread <= allowableLimitGrams;

  // Completion count map for each load (§23)
  const loadCompletedCounts: Record<RepeatabilityLoadOption, number> = {
    '0.5_max': loadDatasets['0.5_max'].filter((r) => r.observedReading !== undefined && r.zeroReturnConfirmed).length,
    '0.8_max': loadDatasets['0.8_max'].filter((r) => r.observedReading !== undefined && r.zeroReturnConfirmed).length,
    '1.0_max': loadDatasets['1.0_max'].filter((r) => r.observedReading !== undefined && r.zeroReturnConfirmed).length,
  };

  // Helper to update current load readings
  const updateCurrentReadings = (updater: (prev: RepeatabilityReading[]) => RepeatabilityReading[]) => {
    setLoadDatasets((prev) => ({
      ...prev,
      [loadOption]: updater(prev[loadOption]),
    }));
  };

  // Handlers for active sequence capture (§8, §9)
  const handleCaptureRun = (runNumber: number) => {
    if (!isScaleStable || isTraceabilityLocked) return;

    const dummyErrors = [1.0, 1.8, 0.6, 1.2, 1.5, 1.0, 0.8, 1.4, 1.1, 0.9];
    const err = dummyErrors[runNumber - 1] ?? 1.0;
    const observed = targetLoadKg + err / 1000;

    updateCurrentReadings((prev) =>
      prev.map((r) =>
        r.run === runNumber
          ? {
              ...r,
              observedReading: observed,
              errorGrams: err,
              zeroReturnConfirmed: false,
              status: Math.abs(err) > allowableLimitGrams ? 'FAIL' : 'PASS',
            }
          : r
      )
    );
  };

  const handleConfirmZeroReturn = (runNumber: number) => {
    if (isTraceabilityLocked) return;

    updateCurrentReadings((prev) =>
      prev.map((r) =>
        r.run === runNumber ? { ...r, zeroReturnConfirmed: true } : r
      )
    );
    setActiveRun(runNumber + 1);
    setSelectedRunId(runNumber);
  };

  const handleRecaptureRun = (runNumber: number) => {
    handleCaptureRun(runNumber);
  };

  const handleSaveManualReading = (runNumber: number, observedKg: number, zeroConfirmed: boolean) => {
    const errGrams = Math.round((observedKg - targetLoadKg) * 1000 * 10) / 10;
    updateCurrentReadings((prev) =>
      prev.map((r) =>
        r.run === runNumber
          ? {
              ...r,
              observedReading: observedKg,
              zeroReturnConfirmed: zeroConfirmed,
              errorGrams: errGrams,
              status: Math.abs(errGrams) > allowableLimitGrams ? 'FAIL' : 'PASS',
              isOutlier: Math.abs(errGrams) > allowableLimitGrams,
            }
          : r
      )
    );
    if (runNumber >= activeRun) {
      setActiveRun(runNumber + 1);
    }
  };

  // Preset switchers (§15, §17, §18, §19, §25, §27)
  const handleApplyCanonicalPass = () => {
    updateCurrentReadings(() => canonicalReadings);
    setActiveRun(11);
    setSelectedRunId(2);
  };

  const handleApplyIncomplete = () => {
    // 8 out of 10 completed (§5, §25)
    updateCurrentReadings(() =>
      canonicalReadings.map((r) =>
        r.run >= 9
          ? {
              ...r,
              observedReading: undefined,
              zeroReturnConfirmed: false,
              errorGrams: undefined,
              status: 'PENDING',
            }
          : r
      )
    );
    setActiveRun(9);
    setSelectedRunId(8);
  };

  const handleApplyNearLimitWarning = () => {
    // Near limit: Spread Δ = 1.9 g against 2.0 g limit (§17)
    const warningReadings: RepeatabilityReading[] = [
      { run: 1, targetLoad: 15.0, observedReading: 15.0019, zeroReturnConfirmed: true, errorGrams: 1.9, status: 'PASS' },
      { run: 2, targetLoad: 15.0, observedReading: 15.0000, zeroReturnConfirmed: true, errorGrams: 0.0, status: 'PASS' },
      { run: 3, targetLoad: 15.0, observedReading: 15.0015, zeroReturnConfirmed: true, errorGrams: 1.5, status: 'PASS' },
      { run: 4, targetLoad: 15.0, observedReading: 15.0008, zeroReturnConfirmed: true, errorGrams: 0.8, status: 'PASS' },
      { run: 5, targetLoad: 15.0, observedReading: 15.0018, zeroReturnConfirmed: true, errorGrams: 1.8, status: 'PASS' },
      { run: 6, targetLoad: 15.0, observedReading: 15.0002, zeroReturnConfirmed: true, errorGrams: 0.2, status: 'PASS' },
      { run: 7, targetLoad: 15.0, observedReading: 15.0017, zeroReturnConfirmed: true, errorGrams: 1.7, status: 'PASS' },
      { run: 8, targetLoad: 15.0, observedReading: 15.0005, zeroReturnConfirmed: true, errorGrams: 0.5, status: 'PASS' },
      { run: 9, targetLoad: 15.0, observedReading: 15.0014, zeroReturnConfirmed: true, errorGrams: 1.4, status: 'PASS' },
      { run: 10, targetLoad: 15.0, observedReading: 15.0012, zeroReturnConfirmed: true, errorGrams: 1.2, status: 'PASS' },
    ];
    updateCurrentReadings(() => warningReadings);
    setActiveRun(11);
    setSelectedRunId(1);
  };

  const handleApplyOutOfToleranceFail = () => {
    // Fail: Spread Δ = 2.4 g exceeding 2.0 g limit (§18, §26)
    const failReadings: RepeatabilityReading[] = [
      { run: 1, targetLoad: 15.0, observedReading: 15.0024, zeroReturnConfirmed: true, errorGrams: 2.4, status: 'FAIL' },
      { run: 2, targetLoad: 15.0, observedReading: 15.0000, zeroReturnConfirmed: true, errorGrams: 0.0, status: 'PASS' },
      { run: 3, targetLoad: 15.0, observedReading: 15.0018, zeroReturnConfirmed: true, errorGrams: 1.8, status: 'PASS' },
      { run: 4, targetLoad: 15.0, observedReading: 15.0004, zeroReturnConfirmed: true, errorGrams: 0.4, status: 'PASS' },
      { run: 5, targetLoad: 15.0, observedReading: 15.0021, zeroReturnConfirmed: true, errorGrams: 2.1, status: 'FAIL' },
      { run: 6, targetLoad: 15.0, observedReading: 15.0001, zeroReturnConfirmed: true, errorGrams: 0.1, status: 'PASS' },
      { run: 7, targetLoad: 15.0, observedReading: 15.0019, zeroReturnConfirmed: true, errorGrams: 1.9, status: 'PASS' },
      { run: 8, targetLoad: 15.0, observedReading: 15.0008, zeroReturnConfirmed: true, errorGrams: 0.8, status: 'PASS' },
      { run: 9, targetLoad: 15.0, observedReading: 15.0023, zeroReturnConfirmed: true, errorGrams: 2.3, status: 'FAIL' },
      { run: 10, targetLoad: 15.0, observedReading: 15.0006, zeroReturnConfirmed: true, errorGrams: 0.6, status: 'PASS' },
    ];
    updateCurrentReadings(() => failReadings);
    setActiveRun(11);
    setSelectedRunId(1);
  };

  const handleApplyZeroReturnAnomaly = () => {
    // 2 zero-return anomalies on Run 04 and Run 07 (§19)
    updateCurrentReadings(() =>
      canonicalReadings.map((r) =>
        r.run === 4 || r.run === 7
          ? { ...r, zeroReturnConfirmed: false }
          : r
      )
    );
    setActiveRun(11);
    setSelectedRunId(4);
  };

  const handleApplyOutlierRun09 = () => {
    // Run 09 abnormal at +6.0g (§27)
    updateCurrentReadings(() =>
      canonicalReadings.map((r) =>
        r.run === 9
          ? {
              ...r,
              observedReading: 15.006,
              errorGrams: 6.0,
              status: 'FAIL',
              isOutlier: true,
            }
          : r
      )
    );
    setActiveRun(11);
    setSelectedRunId(9);
  };

  const handleResetSequence = () => {
    updateCurrentReadings(() =>
      Array.from({ length: 10 }, (_, i) => ({
        run: i + 1,
        targetLoad: targetLoadKg,
        observedReading: undefined,
        zeroReturnConfirmed: false,
        errorGrams: undefined,
        status: 'PENDING',
      }))
    );
    setActiveRun(1);
    setSelectedRunId(1);
  };

  // Continue to Step 06 (Environmental Drift & Tare)
  const handleContinue = () => {
    if (!isPass || !isSequenceComplete || isAdvancing || advanceCompleted) return;

    setIsAdvancing(true);
    setTimeout(() => {
      setIsAdvancing(false);
      setAdvanceCompleted(true);
      setTimeout(() => {
        onContinueToEnvironment({
          ...session,
          repeatabilityResults: {
            loadOption,
            targetLoadKg,
            readings,
            minError,
            maxError,
            spread,
            allowableLimitGrams,
            status: isPass ? 'PASS' : 'FAIL',
          },
        });
      }, 700);
    }, 600);
  };

  // 7-step progress rail (§2)
  const steps = [
    { num: 1, label: 'Intake', status: 'DONE' },
    { num: 2, label: 'Physical Audit', status: 'DONE' },
    { num: 3, label: 'Weighing Error', status: 'DONE' },
    { num: 4, label: 'Eccentricity', status: 'DONE' },
    { num: 5, label: 'Repeatability', status: 'CURRENT' },
    { num: 6, label: 'Environment', status: 'PENDING' },
    { num: 7, label: 'Review', status: 'PENDING' },
  ];

  return (
    <div className="space-y-6 pb-28">
      {/* 1. Persistent Session Header (Section 2, 31) */}
      <div className="bg-white rounded-xl border border-foundation-200 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-foundation-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <button
                type="button"
                onClick={onBackToDashboard}
                className="text-xs font-semibold text-foundation-500 hover:text-brand-600 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <ArrowLeft size={13} />
                <span>Verification / {sessionNumber}</span>
              </button>
              <span className="text-foundation-300">•</span>
              <span className="font-mono text-xs font-bold text-foundation-500 uppercase">
                Step 05 of 07
              </span>
            </div>

            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foundation-950 font-sans">
                REPEATABILITY TEST
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono uppercase bg-brand-50 text-brand-700 border border-brand-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
                <span>IN PROGRESS</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-foundation-500 mt-1">
              Confirm consistency of repeated readings under identical loading conditions according to OIML R 76-1 CL 3.6.1 &amp; Clause A.4.10.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            {/* Traceability Valid Chip */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-semibold">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>✓ Traceability Valid</span>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs text-foundation-600 bg-foundation-50 px-3 py-1.5 rounded-lg border border-foundation-200">
              <span className="font-bold text-foundation-900">{manufacturer} {model}</span>
              <span className="text-foundation-300">•</span>
              <span className="text-foundation-500">[{accuracyClass}] 30 kg · e = 0.005 kg</span>
            </div>
          </div>
        </div>

        {/* 7-Step Horizontal Progress Rail */}
        <div className="flex items-center justify-between overflow-x-auto pt-3 text-xs">
          {steps.map((s, idx) => (
            <React.Fragment key={s.num}>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold ${
                    s.status === 'DONE'
                      ? 'bg-emerald-100 text-emerald-800'
                      : s.status === 'CURRENT'
                      ? 'bg-brand-600 text-white shadow-xs ring-2 ring-brand-100'
                      : 'bg-foundation-100 text-foundation-400'
                  }`}
                >
                  {s.status === 'DONE' ? '✓' : s.num}
                </span>
                <span
                  className={`font-medium ${
                    s.status === 'CURRENT'
                      ? 'text-brand-900 font-bold'
                      : s.status === 'DONE'
                      ? 'text-foundation-800 font-semibold'
                      : 'text-foundation-400'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <span className="text-foundation-300 px-2 select-none">→</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Traceability Lockout Banner (§29) */}
      {isTraceabilityLocked && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0">
              <Lock size={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider font-mono">
                🔒 TESTING LOCKED — Standard Weight Traceability Expired
              </h4>
              <p className="text-xs mt-0.5 text-amber-900">
                The assigned reference standard weight certificate has expired. Existing observations remain visible in read-only mode, but new readings cannot be captured until resolved.
              </p>
            </div>
          </div>
          {onNavigateToStandards && (
            <button
              type="button"
              onClick={onNavigateToStandards}
              className="px-3.5 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-mono font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
            >
              <span>Resolve Traceability</span>
              <ExternalLink size={12} />
            </button>
          )}
        </div>
      )}

      {/* Demo Presets Bar (§15, §17, §18, §19, §25, §27, §30) */}
      <div className="bg-white rounded-xl border border-foundation-200 p-3 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded uppercase">
              DEMO SCENARIOS
            </span>
            <span className="text-xs font-mono text-foundation-500">
              Instant statutory states:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
            <button
              type="button"
              onClick={handleApplyCanonicalPass}
              className="px-2.5 py-1 rounded bg-foundation-100 hover:bg-foundation-200 text-foundation-800 font-semibold transition-colors cursor-pointer"
              title="Canonical passing scenario: Δ = 1.2 g, Limit = 2.0 g (PASS)"
            >
              Canonical Pass (Δ=1.2g)
            </button>
            <button
              type="button"
              onClick={handleApplyIncomplete}
              className="px-2.5 py-1 rounded bg-foundation-100 hover:bg-foundation-200 text-foundation-800 font-semibold transition-colors cursor-pointer"
              title="Incomplete state: 8 of 10 readings recorded"
            >
              Incomplete (8/10)
            </button>
            <button
              type="button"
              onClick={handleApplyNearLimitWarning}
              className="px-2.5 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-semibold transition-colors cursor-pointer"
              title="Near limit warning: Δ = 1.9 g"
            >
              Near Limit (Δ=1.9g)
            </button>
            <button
              type="button"
              onClick={handleApplyOutOfToleranceFail}
              className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 font-semibold transition-colors cursor-pointer"
              title="Out of tolerance failure: Δ = 2.4 g > 2.0 g"
            >
              Fail (Δ=2.4g)
            </button>
            <button
              type="button"
              onClick={handleApplyZeroReturnAnomaly}
              className="px-2.5 py-1 rounded bg-foundation-100 hover:bg-foundation-200 text-foundation-800 font-semibold transition-colors cursor-pointer"
              title="Simulate 2 zero return anomalies"
            >
              Zero Anomaly
            </button>
            <button
              type="button"
              onClick={handleApplyOutlierRun09}
              className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 font-semibold transition-colors cursor-pointer"
              title="Abnormal Run 09 at +6.0g"
            >
              Outlier R09 (+6.0g)
            </button>
            <button
              type="button"
              onClick={() => setIsScaleStable((p) => !p)}
              className={`px-2.5 py-1 rounded border font-semibold transition-colors cursor-pointer ${
                isScaleStable
                  ? 'bg-foundation-100 text-foundation-700 border-foundation-200'
                  : 'bg-amber-100 text-amber-900 border-amber-300'
              }`}
            >
              Scale: {isScaleStable ? 'Stable' : 'Unstable'}
            </button>
            <button
              type="button"
              onClick={() => setIsTraceabilityLocked((p) => !p)}
              className={`px-2.5 py-1 rounded border font-semibold transition-colors cursor-pointer ${
                isTraceabilityLocked
                  ? 'bg-rose-100 text-rose-900 border-rose-300'
                  : 'bg-foundation-100 text-foundation-700 border-foundation-200'
              }`}
            >
              Lockout: {isTraceabilityLocked ? 'Locked' : 'Normal'}
            </button>
            <button
              type="button"
              onClick={handleResetSequence}
              className="px-2 py-1 rounded bg-foundation-100 hover:bg-foundation-200 text-foundation-600 transition-colors cursor-pointer"
              title="Reset sequence to pending"
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Test Load Selector (Zone 1, Section 3, 4, 22, 23) */}
      <TestLoadSelector
        maxCapacityKg={maxCapacityKg}
        selectedOption={loadOption}
        onSelectOption={(opt) => {
          setLoadOption(opt);
          setActiveRun(1);
          setSelectedRunId(1);
        }}
        disabled={false}
        loadCompletedCounts={loadCompletedCounts}
        activeLoadRecordedCount={completedCount}
      />

      {/* 3. Main Workstation Area (Zone 2: Sequence Table + Zone 3: Scatter & Summary) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (65% / 8 cols): 10-Reading Sequence Table + Dispersion Scatter Chart */}
        <div className="lg:col-span-8 space-y-6">
          <RepeatabilitySequenceTable
            readings={readings}
            activeRun={activeRun}
            targetLoadKg={targetLoadKg}
            selectedRunId={selectedRunId}
            onSelectRun={(run) => setSelectedRunId(run)}
            onCaptureRun={handleCaptureRun}
            onConfirmZeroReturn={handleConfirmZeroReturn}
            onRecaptureRun={handleRecaptureRun}
            onOpenRunDetail={(run) => setDetailRunId(run)}
            onOpenAuditModal={(run) => setAuditRunId(run)}
            onOpenManualModal={(run) => setManualRunId(run)}
            allowableLimitGrams={allowableLimitGrams}
            isScaleStable={isScaleStable}
            liveReadingKg={targetLoadKg + 0.001}
            userRole={userRole}
            isLocked={isTraceabilityLocked}
          />

          <DispersionScatterChart
            readings={readings}
            allowableLimitGrams={allowableLimitGrams}
            selectedRunId={selectedRunId}
            onSelectRun={(run) => setSelectedRunId(run)}
            minError={minError}
            maxError={maxError}
            spread={spread}
          />
        </div>

        {/* Right Column (35% / 4 cols): Repeatability Summary Hero Card + Zero Return Card */}
        <div className="lg:col-span-4 space-y-6">
          <RepeatabilitySummaryCard
            minError={minError}
            maxError={maxError}
            spread={spread}
            allowableLimitGrams={allowableLimitGrams}
            completedCount={completedCount}
            onInspectSpread={() => setIsAnalysisDrawerOpen(true)}
            targetLoadKg={targetLoadKg}
          />

          <ZeroReturnSummaryCard readings={readings} />
        </div>
      </div>

      {/* 4. Statutory Outcome / Failure Banner (Section 18, 19, 26) */}
      <div
        className={`rounded-xl border p-4 sm:p-5 transition-all ${
          !isSequenceComplete
            ? 'bg-foundation-50/80 border-foundation-200 text-foundation-800'
            : !isPass
            ? 'bg-rose-50/80 border-rose-300 text-rose-950'
            : 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                !isSequenceComplete
                  ? 'bg-foundation-400 text-white'
                  : !isPass
                  ? 'bg-rose-600 text-white'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {!isSequenceComplete ? (
                <span>○</span>
              ) : !isPass ? (
                <XCircle size={20} className="stroke-[2.5]" />
              ) : (
                <CheckCircle2 size={20} className="stroke-[2.5]" />
              )}
            </div>

            <div>
              <h3 className="text-sm font-bold tracking-tight">
                {!isSequenceComplete
                  ? `○ REPEATABILITY TEST IN PROGRESS (${completedCount} of 10 cycles recorded)`
                  : !isPass
                  ? '✕ REPEATABILITY TEST FAILED — Total Observed Spread Exceeds Limit'
                  : '✓ REPEATABILITY COMPLIANT — Stable Metrological Consistency'}
              </h3>
              <p className="text-xs mt-0.5 font-medium opacity-90 font-mono">
                {!isSequenceComplete
                  ? `Capture remaining ${10 - completedCount} cycle(s) with true zero verification to complete statutory repeatability evaluation.`
                  : !isPass
                  ? `Total observed spread Δ = ${spread.toFixed(1)} g exceeds the allowable statutory limit of ${allowableLimitGrams.toFixed(1)} g (OIML R 76-1 CL 3.6.1 violated).`
                  : `Total observed spread Δ = ${spread.toFixed(1)} g is within the allowable statutory limit of ${allowableLimitGrams.toFixed(1)} g (60% consumed).`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs font-bold shrink-0">
            <span className="px-2.5 py-1 rounded bg-white/80 border border-black/10">
              Spread: {spread.toFixed(1)} g / Limit: {allowableLimitGrams.toFixed(1)} g
            </span>
          </div>
        </div>
      </div>

      {/* 5. Sticky Bottom Action Footer (Section 23, 24, 25) */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-foundation-200 py-3.5 px-4 sm:px-8 z-30 shadow-lg">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Left Progress Indicators */}
          <div className="flex items-center gap-3 text-xs w-full sm:w-auto font-mono">
            <span className="font-bold text-foundation-800 font-sans">
              Test Progress:
            </span>
            <span className="text-foundation-600">
              {completedCount} / 10 cycles complete
            </span>
            <div className="w-24 h-2 bg-foundation-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  !isPass ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${(completedCount / 10) * 100}%` }}
              />
            </div>
            <span className="text-foundation-300 hidden sm:inline">•</span>
            <span className="text-foundation-400 text-[11px] hidden sm:inline">
              Spread {spread.toFixed(1)} g / Limit {allowableLimitGrams.toFixed(1)} g
            </span>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {onNavigatePrevious && (
              <button
                type="button"
                onClick={onNavigatePrevious}
                className="px-4 py-2 border border-foundation-200 text-foundation-700 hover:bg-foundation-100 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={13} />
                <span>Previous: Eccentricity</span>
              </button>
            )}

            <button
              type="button"
              onClick={onBackToDashboard}
              className="px-4 py-2 border border-foundation-200 text-foundation-700 hover:bg-foundation-100 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Save Draft
            </button>

            {/* Dominant Primary Action CTA */}
            <button
              type="button"
              disabled={!isPass || !isSequenceComplete || isAdvancing || advanceCompleted || isTraceabilityLocked}
              onClick={handleContinue}
              title={
                !isSequenceComplete
                  ? 'Complete all 10 cycles before advancing'
                  : !isPass
                  ? 'Repeatability failed statutory limit'
                  : 'Save repeatability test and advance to Environmental & Tare verification.'
              }
              className={`px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold text-white transition-all flex items-center gap-2 shadow-sm cursor-pointer ${
                advanceCompleted
                  ? 'bg-emerald-600'
                  : isAdvancing
                  ? 'bg-brand-600 opacity-90'
                  : isPass && isSequenceComplete && !isTraceabilityLocked
                  ? 'bg-brand-600 hover:bg-brand-700 active:bg-brand-800 hover:shadow'
                  : 'bg-foundation-300 cursor-not-allowed opacity-60'
              }`}
            >
              {isAdvancing ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving Repeatability Test...</span>
                </>
              ) : advanceCompleted ? (
                <>
                  <Check size={16} className="stroke-[3]" />
                  <span>Repeatability Complete ✓ · Opening Environment →</span>
                </>
              ) : (
                <>
                  <span>Continue to Environment</span>
                  <ArrowRight size={15} className="stroke-[2.5]" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Analysis Slide-over Drawer (Section 20) */}
      <SpreadAnalysisDrawer
        isOpen={isAnalysisDrawerOpen}
        onClose={() => setIsAnalysisDrawerOpen(false)}
        minError={minError}
        maxError={maxError}
        spread={spread}
        allowableLimitGrams={allowableLimitGrams}
        targetLoadKg={targetLoadKg}
      />

      {/* Run Detail Drawer (§20) */}
      <RunDetailDrawer
        isOpen={detailRunId !== null}
        onClose={() => setDetailRunId(null)}
        reading={readings.find((r) => r.run === detailRunId) || null}
        targetLoadKg={targetLoadKg}
        allowableLimitGrams={allowableLimitGrams}
      />

      {/* Audit Modal (§21) */}
      <RepeatabilityAuditModal
        isOpen={auditRunId !== null}
        onClose={() => setAuditRunId(null)}
        reading={readings.find((r) => r.run === auditRunId) || null}
        currentComment={auditRunId ? auditComments[auditRunId] : null}
        onSaveComment={(cmt) => {
          if (auditRunId) {
            setAuditComments((prev) => ({ ...prev, [auditRunId]: cmt }));
          }
        }}
        userRole={userRole}
      />

      {/* Manual Entry Fallback Modal */}
      <RepeatabilityManualModal
        isOpen={manualRunId !== null}
        onClose={() => setManualRunId(null)}
        reading={readings.find((r) => r.run === manualRunId) || null}
        targetLoadKg={targetLoadKg}
        allowableLimitGrams={allowableLimitGrams}
        onSaveReading={handleSaveManualReading}
      />
    </div>
  );
};
