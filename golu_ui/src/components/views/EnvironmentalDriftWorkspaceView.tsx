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
  Scale,
  Thermometer,
  Cpu,
  Lock,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { LaboratoryConditionsCard, EnvironmentalConditions } from '../environmental/LaboratoryConditionsCard';
import { TareAccuracyTab, TareResult, TareMode } from '../environmental/TareAccuracyTab';
import { TemperatureDriftTab, TemperatureStage } from '../environmental/TemperatureDriftTab';
import { ChamberHUDTab } from '../environmental/ChamberHUDTab';
import { EnvironmentalSummaryCard } from '../environmental/EnvironmentalSummaryCard';
import { EnvironmentalTraceDrawer } from '../environmental/EnvironmentalTraceDrawer';
import { EnvironmentalAuditModal, EnvironmentalAuditComment } from '../environmental/EnvironmentalAuditModal';

export type EnvironmentalSubTab = 'tare' | 'temperature' | 'chamber';

interface EnvironmentalDriftWorkspaceViewProps {
  session: any;
  onBackToDashboard: () => void;
  onContinueToReview: (updatedSession: any) => void;
  onNavigatePrevious?: () => void;
  onUpdateSession?: (updatedSession: any) => void;
  onNavigateToStandards?: () => void;
}

export const EnvironmentalDriftWorkspaceView: React.FC<EnvironmentalDriftWorkspaceViewProps> = ({
  session,
  onBackToDashboard,
  onContinueToReview,
  onNavigatePrevious,
  onUpdateSession,
  onNavigateToStandards,
}) => {
  // Session metadata
  const sessionNumber = session?.sessionNumber || session?.id || 'VR-2026-00418';
  const manufacturer = session?.manufacturer || 'Avery Weigh-Tronix';
  const model = session?.model || session?.instrument || 'ZM201 Retail Platform';
  const accuracyClass = session?.accuracyClass || 'Class III';
  const maxCapacityKg = 30.0;
  const intervalKg = 0.005; // 5 g
  const userRole = session?.userRole || 'METROLOGIST';

  // 1. Active Sub-Tab Navigation (Section 5)
  const [activeSubTab, setActiveSubTab] = useState<EnvironmentalSubTab>('tare');

  // 2. Laboratory Ambient Conditions State (Section 3, 4, 36)
  const [conditions, setConditions] = useState<EnvironmentalConditions>({
    temperatureC: 23.4,
    relativeHumidityPercent: 48,
    pressureHpa: 1013,
    recorded: true,
    isStale: false,
    staleMinutes: 0,
    timestamp: '04 Oct 2026 · 16:12',
    source: 'Central Laboratory Sensor Network (OIML Environmental Unit)',
    sensorId: 'LM-ENV-2026-99',
  });

  // 3. Tare Accuracy State (Section 6-11)
  const [additiveResult, setAdditiveResult] = useState<TareResult>({
    mode: 'additive',
    tareWeightKg: 2.0,
    initialZeroKg: 0.0,
    observedIndicationKg: 2.0,
    calculatedErrorGrams: 0.0,
    allowableLimitGrams: 1.25,
    status: 'PASS',
  });

  const [subtractiveResult, setSubtractiveResult] = useState<TareResult>({
    mode: 'subtractive',
    tareWeightKg: 2.0,
    initialLoadKg: 5.0,
    observedIndicationKg: 3.0,
    calculatedErrorGrams: 0.5,
    allowableLimitGrams: 1.25,
    status: 'PASS',
  });

  // 4. 4-Stage Temperature Sequence State (Section 12, 13, 15, 36)
  const initialStages: TemperatureStage[] = [
    {
      id: 'temp_20_start',
      nominalTempC: 20.0,
      label: '+20°C',
      subLabel: 'Reference',
      actualTempC: 20.2,
      targetLoadKg: 30.0,
      observedReadingKg: 30.000,
      errorGrams: 0.0,
      allowableMpeGrams: 5.0,
      soakTimeMinutes: 20,
      status: 'DONE',
    },
    {
      id: 'temp_40',
      nominalTempC: 40.0,
      label: '+40°C',
      subLabel: 'High',
      actualTempC: 39.7,
      targetLoadKg: 30.0,
      observedReadingKg: 30.0032,
      errorGrams: 3.2,
      allowableMpeGrams: 5.0,
      soakTimeMinutes: 22,
      status: 'DONE',
    },
    {
      id: 'temp_neg10',
      nominalTempC: -10.0,
      label: '−10°C',
      subLabel: 'Low',
      actualTempC: -9.8,
      targetLoadKg: 30.0,
      observedReadingKg: 30.0008,
      errorGrams: 0.8,
      allowableMpeGrams: 5.0,
      soakTimeMinutes: 25,
      status: 'DONE',
    },
    {
      id: 'temp_20_final',
      nominalTempC: 20.0,
      label: '+20°C',
      subLabel: 'Recovery',
      actualTempC: 20.1,
      targetLoadKg: 30.0,
      observedReadingKg: 30.0002,
      errorGrams: 0.2,
      allowableMpeGrams: 5.0,
      soakTimeMinutes: 20,
      status: 'DONE',
    },
  ];

  const [temperatureStages, setTemperatureStages] = useState<TemperatureStage[]>(initialStages);
  const [currentStageId, setCurrentStageId] = useState<string>('temp_40');

  // Chamber Disconnected & Traceability Locked states (§23, §35)
  const [isChamberDisconnected, setIsChamberDisconnected] = useState<boolean>(false);
  const [isTraceabilityLocked, setIsTraceabilityLocked] = useState<boolean>(false);

  // Drawers and Modals
  const [isTraceDrawerOpen, setIsTraceDrawerOpen] = useState<boolean>(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);
  const [auditComments, setAuditComments] = useState<Record<string, EnvironmentalAuditComment>>({});

  // Transition & Loading state
  const [isAdvancing, setIsAdvancing] = useState<boolean>(false);
  const [advanceCompleted, setAdvanceCompleted] = useState<boolean>(false);

  // Overall compliance check (§30, §31)
  const isTarePass = additiveResult.status === 'PASS' && subtractiveResult.status === 'PASS';
  const hasStageFailure = temperatureStages.some(
    (s) => s.isFail || (s.errorGrams && Math.abs(s.errorGrams) > s.allowableMpeGrams)
  );
  const isOverallPass = conditions.recorded && isTarePass && !hasStageFailure && !isTraceabilityLocked;

  // Preset Handlers (§36, §37)
  const handleApplyCanonicalPassing = () => {
    setConditions({
      temperatureC: 23.4,
      relativeHumidityPercent: 48,
      pressureHpa: 1013,
      recorded: true,
      isStale: false,
      staleMinutes: 0,
      timestamp: '04 Oct 2026 · 16:12',
      source: 'Central Laboratory Sensor Network (OIML Environmental Unit)',
      sensorId: 'LM-ENV-2026-99',
    });
    setAdditiveResult({
      mode: 'additive',
      tareWeightKg: 2.0,
      initialZeroKg: 0.0,
      observedIndicationKg: 2.0,
      calculatedErrorGrams: 0.0,
      allowableLimitGrams: 1.25,
      status: 'PASS',
    });
    setSubtractiveResult({
      mode: 'subtractive',
      tareWeightKg: 2.0,
      initialLoadKg: 5.0,
      observedIndicationKg: 3.0,
      calculatedErrorGrams: 0.5,
      allowableLimitGrams: 1.25,
      status: 'PASS',
    });
    setTemperatureStages(initialStages);
    setIsChamberDisconnected(false);
    setIsTraceabilityLocked(false);
    onUpdateSession?.({
      ...session,
      environment: {
        ...session?.environment,
        status: 'PASS',
        conditions,
      },
    });
  };

  const handleApplyThermalFailure = () => {
    // Stage +40°C drift +6.4g > 5.0g limit (§26, §37)
    setTemperatureStages([
      initialStages[0],
      {
        ...initialStages[1],
        observedReadingKg: 30.0064,
        errorGrams: 6.4,
        status: 'DONE',
        isFail: true,
      },
      {
        ...initialStages[2],
        observedReadingKg: undefined,
        errorGrams: undefined,
        status: 'PENDING',
      },
      {
        ...initialStages[3],
        observedReadingKg: undefined,
        errorGrams: undefined,
        status: 'PENDING',
      },
    ]);
    setActiveSubTab('temperature');
    setCurrentStageId('temp_40');
    onUpdateSession?.({
      ...session,
      complianceStatus: 'FAIL',
      status: 'FAIL',
      notes: 'Temperature-induced span shift at +40°C (+6.4 g) exceeds statutory limit ±5.0 g.',
      environment: {
        ...session?.environment,
        status: 'FAIL',
        thermalDriftPpmPerK: 14.2,
      },
    });
  };

  // Auto-load scenario on mount if matching session scenario
  React.useEffect(() => {
    if (
      session?.scenarioId === 'temperature_span_drift_fail' ||
      session?.id?.includes('temp') ||
      session?.id?.includes('therm') ||
      session?.environment?.status === 'FAIL'
    ) {
      handleApplyThermalFailure();
    }
  }, [session?.id, session?.scenarioId]);

  const handleApplyTareFailure = () => {
    // Subtractive tare error 1.7g > 1.25g limit (§11)
    setSubtractiveResult({
      mode: 'subtractive',
      tareWeightKg: 2.0,
      initialLoadKg: 5.0,
      observedIndicationKg: 3.0017,
      calculatedErrorGrams: 1.7,
      allowableLimitGrams: 1.25,
      status: 'FAIL',
    });
    setActiveSubTab('tare');
  };

  const handleResetAll = () => {
    handleApplyCanonicalPassing();
    setActiveSubTab('tare');
  };

  // Continue to Step 07 (Supervisory Review & Director Sign-Off)
  const handleContinue = () => {
    if (!isOverallPass || isAdvancing || advanceCompleted) return;

    setIsAdvancing(true);
    setTimeout(() => {
      setIsAdvancing(false);
      setAdvanceCompleted(true);
      setTimeout(() => {
        onContinueToReview({
          ...session,
          environmentalResults: {
            conditions,
            additiveResult,
            subtractiveResult,
            temperatureStages,
            status: isOverallPass ? 'PASS' : 'FAIL',
          },
        });
      }, 700);
    }, 600);
  };

  // 7-step progress rail (Step 06 Environmental Active)
  const steps = [
    { num: 1, label: 'Intake', status: 'DONE' },
    { num: 2, label: 'Physical Audit', status: 'DONE' },
    { num: 3, label: 'Weighing Error', status: 'DONE' },
    { num: 4, label: 'Eccentricity', status: 'DONE' },
    { num: 5, label: 'Repeatability', status: 'DONE' },
    { num: 6, label: 'Environment', status: 'CURRENT' },
    { num: 7, label: 'Review', status: 'PENDING' },
  ];

  return (
    <div className="space-y-6 pb-28 select-none font-sans">
      {/* 1. Persistent Session Header (Section 2, 38) */}
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
                Step 06 of 07
              </span>
            </div>

            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foundation-950">
                ENVIRONMENTAL DRIFT &amp; TARE
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono uppercase bg-brand-50 text-brand-700 border border-brand-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
                <span>IN PROGRESS</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-foundation-500 mt-1">
              Verify tare behavior and weighing stability under controlled environmental and thermal changes (OIML R 76-1 CL 3.6.3 &amp; CL 3.9.2).
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
              <span className="text-foundation-500">[{accuracyClass}] 30 kg · e = 5 g</span>
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

      {/* Traceability Lockout Banner (§35) */}
      {isTraceabilityLocked && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0">
              <Lock size={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider font-mono">
                🔒 TESTING LOCKED — Standard Weight Traceability Expired (§35)
              </h4>
              <p className="text-xs mt-0.5 text-amber-900">
                Environmental measurements cannot be recorded while the assigned traceable standard is invalid. Existing observations remain available for review.
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

      {/* Demo Presets Bar (§36, §37) */}
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
              onClick={handleApplyCanonicalPassing}
              className="px-2.5 py-1 rounded bg-foundation-100 hover:bg-foundation-200 text-foundation-800 font-semibold transition-colors cursor-pointer"
              title="Canonical passing scenario: Ambient 23.4°C, Tare PASS, Temp Drift PASS (3.2g ≤ 5.0g)"
            >
              Canonical Pass (§36)
            </button>
            <button
              type="button"
              onClick={handleApplyThermalFailure}
              className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 font-semibold transition-colors cursor-pointer"
              title="Thermal failure at +40°C stage (+6.4g > 5.0g)"
            >
              Thermal Fail (+40°C) (§37)
            </button>
            <button
              type="button"
              onClick={handleApplyTareFailure}
              className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 font-semibold transition-colors cursor-pointer"
              title="Subtractive tare exceeds ±0.25e (1.7g > 1.25g)"
            >
              Tare Fail (§11)
            </button>
            <button
              type="button"
              onClick={() =>
                setConditions((prev) => ({
                  ...prev,
                  isStale: !prev.isStale,
                  staleMinutes: !prev.isStale ? 26 : 0,
                }))
              }
              className={`px-2.5 py-1 rounded border font-semibold cursor-pointer ${
                conditions.isStale ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-foundation-100 text-foundation-700 border-foundation-200'
              }`}
            >
              Baseline: {conditions.isStale ? 'Stale' : 'Normal'} (§4)
            </button>
            <button
              type="button"
              onClick={() => setIsChamberDisconnected((p) => !p)}
              className={`px-2.5 py-1 rounded border font-semibold cursor-pointer ${
                isChamberDisconnected ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-foundation-100 text-foundation-700 border-foundation-200'
              }`}
            >
              Chamber: {isChamberDisconnected ? 'Disconnected' : 'Online'} (§23)
            </button>
            <button
              type="button"
              onClick={() => setIsTraceabilityLocked((p) => !p)}
              className={`px-2.5 py-1 rounded border font-semibold cursor-pointer ${
                isTraceabilityLocked ? 'bg-rose-100 text-rose-900 border-rose-300' : 'bg-foundation-100 text-foundation-700 border-foundation-200'
              }`}
            >
              Lockout: {isTraceabilityLocked ? 'Locked' : 'Normal'}
            </button>
            <button
              type="button"
              onClick={handleResetAll}
              className="px-2 py-1 rounded bg-foundation-100 hover:bg-foundation-200 text-foundation-600 cursor-pointer"
              title="Reset all states"
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Card: Ambient Laboratory Conditions (§3, §4, §38) */}
      <LaboratoryConditionsCard
        conditions={conditions}
        onUpdateConditions={(updated) => setConditions(updated)}
        disabled={isTraceabilityLocked}
      />

      {/* 3. Three Primary Sub-Tabs Navigation (§5, §38) */}
      <div className="bg-white rounded-xl border border-foundation-200 p-2 shadow-xs flex items-center gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveSubTab('tare')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
            activeSubTab === 'tare'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'text-foundation-600 hover:text-foundation-900 hover:bg-foundation-50'
          }`}
        >
          <Scale size={14} />
          <span>Tare Accuracy</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeSubTab === 'tare'
                ? 'bg-brand-700 text-white'
                : isTarePass
                ? 'bg-emerald-100 text-emerald-800 font-semibold'
                : 'bg-rose-100 text-rose-800 font-semibold'
            }`}
          >
            {isTarePass ? '✓ PASS' : '✕ FAIL'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('temperature')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
            activeSubTab === 'temperature'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'text-foundation-600 hover:text-foundation-900 hover:bg-foundation-50'
          }`}
        >
          <Thermometer size={14} />
          <span>Temperature Drift</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeSubTab === 'temperature'
                ? 'bg-brand-700 text-white'
                : hasStageFailure
                ? 'bg-rose-100 text-rose-800 font-semibold'
                : 'bg-emerald-100 text-emerald-800 font-semibold'
            }`}
          >
            {hasStageFailure ? '✕ FAIL' : '4/4 Stages'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('chamber')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
            activeSubTab === 'chamber'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'text-foundation-600 hover:text-foundation-900 hover:bg-foundation-50'
          }`}
        >
          <Cpu size={14} />
          <span>Chamber HUD</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeSubTab === 'chamber'
                ? 'bg-brand-700 text-white'
                : isChamberDisconnected
                ? 'bg-amber-100 text-amber-800'
                : 'bg-brand-50 text-brand-700 border border-brand-200'
            }`}
          >
            {isChamberDisconnected ? 'Offline' : 'Active HUD'}
          </span>
        </button>
      </div>

      {/* 4. Active Sub-Tab View (Left 65% / Right 35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Active Sub-Tab View */}
        <div className="lg:col-span-8">
          {activeSubTab === 'tare' ? (
            <TareAccuracyTab
              intervalKg={intervalKg}
              additiveResult={additiveResult}
              subtractiveResult={subtractiveResult}
              onUpdateResult={(mode, res) => {
                if (mode === 'additive') setAdditiveResult(res);
                else setSubtractiveResult(res);
              }}
              disabled={isTraceabilityLocked}
            />
          ) : activeSubTab === 'temperature' ? (
            <TemperatureDriftTab
              stages={temperatureStages}
              currentStageId={currentStageId}
              onSelectStage={(id) => setCurrentStageId(id)}
              onOpenTraceDrawer={() => setIsTraceDrawerOpen(true)}
              disabled={isTraceabilityLocked}
            />
          ) : (
            <ChamberHUDTab
              currentTempC={39.8}
              targetTempC={40.0}
              humidityPercent={41}
              pressureHpa={1011}
              isDisconnected={isChamberDisconnected}
              onReconnect={() => setIsChamberDisconnected(false)}
              onSimulateStage={(temp) => {
                // sync to temp stage
                if (temp === 20.0) setCurrentStageId('temp_20_start');
                else if (temp === 40.0) setCurrentStageId('temp_40');
                else if (temp === -10.0) setCurrentStageId('temp_neg10');
              }}
              disabled={isTraceabilityLocked}
            />
          )}
        </div>

        {/* Right Column (4 cols): Persistent Environmental Summary Card (§30) */}
        <div className="lg:col-span-4">
          <EnvironmentalSummaryCard
            conditions={conditions}
            additiveResult={additiveResult}
            subtractiveResult={subtractiveResult}
            temperatureStages={temperatureStages}
            onOpenTraceDrawer={() => setIsTraceDrawerOpen(true)}
            onOpenAuditModal={() => setIsAuditModalOpen(true)}
          />
        </div>
      </div>

      {/* 4. Section 42: All Required Tests Complete Summary Banner */}
      {isOverallPass && (
        <div className="bg-emerald-950 text-white rounded-2xl border-2 border-emerald-500 p-6 sm:p-7 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-5 animate-in slide-in-from-bottom-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-xs font-black uppercase tracking-wider text-emerald-300">
                ALL REQUIRED TESTS COMPLETE
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-800 text-[10px] font-mono font-bold text-emerald-200">
                5 / 5 PROCEDURES COMPLETE
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans">
              Overall Result: ✓ PASS (Statutory MPE Envelope Compliant)
            </h3>
            <p className="text-xs text-emerald-200/90 leading-relaxed max-w-2xl font-sans">
              Physical inspection, weighing linearity, eccentricity corner loading, repeatability spread, and environmental tare response comply with OIML R 76-1:2006. Submit this verification for peer review.
            </p>
          </div>
          <button
            type="button"
            disabled={isAdvancing || advanceCompleted}
            onClick={handleContinue}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-all shrink-0 cursor-pointer hover:scale-[1.02]"
          >
            <span>Open Review Summary →</span>
          </button>
        </div>
      )}

      {hasStageFailure && (
        <div className="bg-rose-950 text-white rounded-2xl border-2 border-rose-500 p-6 sm:p-7 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-5 animate-in slide-in-from-bottom-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span className="font-mono text-xs font-black uppercase tracking-wider text-rose-300">
                STATUTORY TEST NON-COMPLIANCE
              </span>
              <span className="px-2 py-0.5 rounded-full bg-rose-800 text-[10px] font-mono font-bold text-rose-200">
                MPE EXCEEDED
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans">
              Environmental Test Result: ✕ FAIL
            </h3>
            <p className="text-xs text-rose-200/90 leading-relaxed max-w-2xl font-sans">
              Temperature-induced span shift at +40°C (+6.4 g) exceeds statutory maximum permissible error (±5.0 g). Advance to supervisory review is barred until compliance is resolved.
            </p>
          </div>
          <button
            type="button"
            onClick={handleApplyCanonicalPassing}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all shrink-0 cursor-pointer"
          >
            <RotateCcw size={14} />
            <span>Reset to Compliant Baseline</span>
          </button>
        </div>
      )}

      {/* 5. Sticky Bottom Action Bar (§31, §38) */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-foundation-200 py-3.5 px-4 sm:px-8 z-30 shadow-lg">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 font-mono">
          {/* Left Progress Indicators */}
          <div className="flex items-center gap-3 text-xs w-full sm:w-auto">
            <span className="font-bold text-foundation-800 font-sans">
              Environmental Progress:
            </span>
            <span className="text-foundation-600">
              Tare {isTarePass ? '✓' : '✕'} • Temp {temperatureStages.filter((s) => s.status === 'DONE').length}/4 Stages • Chamber {isChamberDisconnected ? '⚠ Offline' : '✓ Stable'}
            </span>
            <span className="text-foundation-300 hidden sm:inline">•</span>
            <span
              className={`font-bold hidden sm:inline ${
                isOverallPass ? 'text-emerald-700' : 'text-rose-600'
              }`}
            >
              {isOverallPass ? '✓ All Tolerances Compliant' : '✕ Requirements Pending or Failed'}
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
                <span>Previous: Repeatability</span>
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
              disabled={!isOverallPass || isAdvancing || advanceCompleted || isTraceabilityLocked}
              onClick={handleContinue}
              title={
                !isOverallPass
                  ? 'Resolve environmental test requirements before advancing'
                  : 'Proceed to Step 07: Statutory Review & Director Sign-Off'
              }
              className={`px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold text-white transition-all flex items-center gap-2 shadow-sm cursor-pointer ${
                advanceCompleted
                  ? 'bg-emerald-600'
                  : isAdvancing
                  ? 'bg-brand-600 opacity-90'
                  : isOverallPass
                  ? 'bg-brand-600 hover:bg-brand-700 active:bg-brand-800 hover:shadow'
                  : 'bg-foundation-300 cursor-not-allowed opacity-60'
              }`}
            >
              {isAdvancing ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving Environmental Test...</span>
                </>
              ) : advanceCompleted ? (
                <>
                  <Check size={16} className="stroke-[3]" />
                  <span>Environmental Complete ✓ · Opening Review →</span>
                </>
              ) : (
                <>
                  <span>Continue to Review</span>
                  <ArrowRight size={15} className="stroke-[2.5]" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Environmental Trace Drawer (§33) */}
      <EnvironmentalTraceDrawer
        isOpen={isTraceDrawerOpen}
        onClose={() => setIsTraceDrawerOpen(false)}
        conditions={conditions}
        stage={temperatureStages.find((s) => s.id === currentStageId) || temperatureStages[1]}
        allowableMpeGrams={5.0}
      />

      {/* Environmental Audit Modal (§34) */}
      <EnvironmentalAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        subTest={activeSubTab}
        currentComment={auditComments[activeSubTab] || null}
        onSaveComment={(cmt) => {
          setAuditComments((prev) => ({ ...prev, [activeSubTab]: cmt }));
        }}
        userRole={userRole}
      />
    </div>
  );
};
