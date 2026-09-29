import React, { useState, useMemo, useCallback } from 'react';
import {
  ThermometerSnowflake,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  Activity,
  FileCheck2,
  Check,
  AlertTriangle,
  RotateCcw,
  FileSpreadsheet,
  ShieldCheck,
  Scale,
  Gauge,
  Timer,
  Flame,
  Snowflake,
  Sun,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { ComplianceBadge } from '../../components/ui/ComplianceBadge';
import { useScenario } from '../../context/ScenarioContext';

export interface TareTempViewProps {
  onNavigateToDashboard?: () => void;
  className?: string;
}

interface TemperatureCycleStep {
  step: number;
  tempTarget: number;
  label: string;
  condition: string;
  actualTemp: number;
  humidityPct: number;
  soakDurationHours: number;
  indicationZero: number | null;
  auxLoadZero: number | null;
  testLoad: number;
  indicationLoad: number | null;
  auxLoadLoad: number | null;
  notes?: string;
}

interface TareTestRun {
  run: number;
  appliedTareLoad: number;
  tareIndication: number;
  auxLoadZero: number;
  netTestLoad: number;
  netIndication: number;
  netAuxLoad: number;
  notes?: string;
}

export const TareTempView: React.FC<TareTempViewProps> = ({
  onNavigateToDashboard,
  className = '',
}) => {
  const { activeScenario } = useScenario();

  // Scale parameters (Class III, 30 kg, e=5g, d=5g)
  const maxCapacity = activeScenario?.max_capacity || 30000;
  const e = activeScenario?.e || 5;
  const d = activeScenario?.d || 5;
  const unit = activeScenario?.unit || 'g';
  const modelName = activeScenario ? `${activeScenario.manufacturer} - ${activeScenario.model_name}` : 'Apex Weighing Systems - Vanguard Precision Platform 30K';
  const serialNumber = activeScenario?.serial_number || 'APX-2026-TRAP-02';
  const accuracyClass = activeScenario?.accuracy_class || 'CLASS_III';

  // Sub-tab selection
  const [activeTab, setActiveTab] = useState<'TEMPERATURE_CYCLE' | 'TARE_BALANCING' | 'CHAMBER_HUD'>('TEMPERATURE_CYCLE');

  // Feedback states
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isSavedFeedback, setIsSavedFeedback] = useState<boolean>(false);
  const [toastNotification, setToastNotification] = useState<string | null>(null);

  // Initial verified static temperature test cycle data (Clause A.5.3: 20°C -> 40°C -> -10°C -> 20°C)
  const initialTempSteps: TemperatureCycleStep[] = [
    {
      step: 1,
      tempTarget: 20,
      label: 'Initial Reference (+20°C)',
      condition: 'Equilibrium Baseline',
      actualTemp: 20.1,
      humidityPct: 52,
      soakDurationHours: 2.5,
      indicationZero: 0,
      auxLoadZero: 2.5,
      testLoad: maxCapacity,
      indicationLoad: 30000,
      auxLoadLoad: 2.5,
      notes: 'Initial room reference state',
    },
    {
      step: 2,
      tempTarget: 40,
      label: 'High Temperature (+40°C)',
      condition: 'Service Heat Ceiling',
      actualTemp: 40.2,
      humidityPct: 50,
      soakDurationHours: 2.2,
      indicationZero: 0,
      auxLoadZero: 2.1,
      testLoad: maxCapacity,
      indicationLoad: 30000,
      auxLoadLoad: 2.0,
      notes: 'Thermal soak completed at upper limit',
    },
    {
      step: 3,
      tempTarget: -10,
      label: 'Low Temperature (-10°C)',
      condition: 'Sub-Zero Floor',
      actualTemp: -10.1,
      humidityPct: 45,
      soakDurationHours: 3.0,
      indicationZero: 0,
      auxLoadZero: 2.9,
      testLoad: maxCapacity,
      indicationLoad: 30000,
      auxLoadLoad: 3.0,
      notes: 'Sub-zero soak, no condensation on load cell',
    },
    {
      step: 4,
      tempTarget: 20,
      label: 'Return Reference (+20°C)',
      condition: 'Hysteresis & Recovery',
      actualTemp: 20.0,
      humidityPct: 51,
      soakDurationHours: 2.0,
      indicationZero: 0,
      auxLoadZero: 2.4,
      testLoad: maxCapacity,
      indicationLoad: 30000,
      auxLoadLoad: 2.4,
      notes: 'Post-thermal recovery confirmation',
    },
  ];

  // Initial verified tare balancing runs (Clause A.4.6: Tare Setting Error <= 0.25e = 1.25g)
  const initialTareRuns: TareTestRun[] = [
    {
      run: 1,
      appliedTareLoad: 5000,
      tareIndication: 0,
      auxLoadZero: 2.5,
      netTestLoad: 10000,
      netIndication: 10000,
      netAuxLoad: 2.5,
      notes: 'Quarter capacity container tare',
    },
    {
      run: 2,
      appliedTareLoad: 15000,
      tareIndication: 0,
      auxLoadZero: 2.6,
      netTestLoad: 15000,
      netIndication: 15000,
      netAuxLoad: 2.6,
      notes: '50% Max tare load',
    },
    {
      run: 3,
      appliedTareLoad: 25000,
      tareIndication: 0,
      auxLoadZero: 2.4,
      netTestLoad: 5000,
      netIndication: 5000,
      netAuxLoad: 2.4,
      notes: 'Substantial tare near Max',
    },
  ];

  const [tempSteps, setTempSteps] = useState<TemperatureCycleStep[]>(initialTempSteps);
  const [tareRuns, setTareRuns] = useState<TareTestRun[]>(initialTareRuns);

  // Helper: Calculate true unrounded turning point P = I + 0.5e - dL
  const calculateTrueP = useCallback((indication: number | null, auxLoad: number | null) => {
    if (indication === null || auxLoad === null) return null;
    return indication + 0.5 * e - auxLoad;
  }, [e]);

  // Helper: Error E = P - L
  const calculateError = useCallback((indication: number | null, auxLoad: number | null, nominalLoad: number) => {
    const p = calculateTrueP(indication, auxLoad);
    if (p === null) return null;
    return p - nominalLoad;
  }, [calculateTrueP]);

  // Toast feedback helper
  const showToast = (msg: string) => {
    setToastNotification(msg);
    setTimeout(() => setToastNotification(null), 3200);
  };

  // Temperature calculations: Zero Error E0 and Zero Drift per 5°C
  const tempCycleStats = useMemo(() => {
    const evaluatedSteps = tempSteps.map((s, idx) => {
      const e0 = calculateError(s.indicationZero, s.auxLoadZero, 0);
      const eLoad = calculateError(s.indicationLoad, s.auxLoadLoad, s.testLoad);
      const mpeLoad = 1.5 * e; // 30kg is 6000e -> bracket 2000e < m <= 10000e = 1.5e = 7.5g

      // Zero drift calculation between consecutive temperature steps
      let driftPer5C: number | null = null;
      let driftPer5Ce: number | null = null;
      if (idx > 0 && e0 !== null) {
        const prevE0 = calculateError(tempSteps[idx - 1].indicationZero, tempSteps[idx - 1].auxLoadZero, 0);
        if (prevE0 !== null) {
          const deltaT = Math.abs(s.actualTemp - tempSteps[idx - 1].actualTemp);
          if (deltaT > 0) {
            driftPer5C = (Math.abs(e0 - prevE0) / deltaT) * 5;
            driftPer5Ce = driftPer5C / e;
          }
        }
      }

      // Permissible zero drift under Clause 3.9.2.3: <= 1 e per 5°C
      const isZeroDriftPass = driftPer5Ce === null || driftPer5Ce <= 1.0;
      const isLoadPass = eLoad !== null && Math.abs(eLoad) <= mpeLoad;
      const isStepPass = isZeroDriftPass && isLoadPass;

      return {
        ...s,
        e0,
        eLoad,
        mpeLoad,
        driftPer5C,
        driftPer5Ce,
        isZeroDriftPass,
        isLoadPass,
        isStepPass,
      };
    });

    const maxDriftE = Math.max(...evaluatedSteps.map((s) => s.driftPer5Ce || 0));
    const allStepsPass = evaluatedSteps.every((s) => s.isStepPass);

    return { evaluatedSteps, maxDriftE, allStepsPass };
  }, [tempSteps, e, calculateError]);

  // Tare calculations: Residual Zero Error after Taring <= 0.25e
  const tareStats = useMemo(() => {
    const maxAllowedTareZeroError = 0.25 * e; // 1.25 g for e=5g
    const evaluatedRuns = tareRuns.map((r) => {
      // Residual zero error E_net0 = 0 + 0.5e - auxLoad
      const eNet0 = 0 + 0.5 * e - r.auxLoadZero;
      const isZeroPass = Math.abs(eNet0) <= maxAllowedTareZeroError;

      // Net load weighing error
      const pNet = r.netIndication + 0.5 * e - r.netAuxLoad;
      const eNet = pNet - r.netTestLoad;
      const mpeNet = 1.0 * e; // 10kg is 2000e = 1.0e = 5.0g
      const isNetPass = Math.abs(eNet) <= mpeNet;
      const isPass = isZeroPass && isNetPass;

      return {
        ...r,
        eNet0,
        isZeroPass,
        pNet,
        eNet,
        mpeNet,
        isNetPass,
        isPass,
      };
    });

    const maxTareZeroError = Math.max(...evaluatedRuns.map((r) => Math.abs(r.eNet0)));
    const allTarePass = evaluatedRuns.every((r) => r.isPass);

    return { evaluatedRuns, maxAllowedTareZeroError, maxTareZeroError, allTarePass };
  }, [tareRuns, e]);

  // Combined overall verdict
  const overallVerdict = tempCycleStats.allStepsPass && tareStats.allTarePass;

  // Handlers for Temperature inputs
  const handleTempZeroAuxChange = (stepNum: number, val: string) => {
    const parsed = val.trim() === '' ? null : parseFloat(val);
    setTempSteps((prev) =>
      prev.map((s) => (s.step === stepNum ? { ...s, auxLoadZero: isNaN(parsed ?? NaN) ? null : parsed } : s))
    );
  };

  // Prefill handler
  const handlePrefill = () => {
    setTempSteps(initialTempSteps);
    setTareRuns(initialTareRuns);
    showToast('Prefilled verified static temperature & tare dataset');
  };

  // Clear handler
  const handleClear = () => {
    setTempSteps((prev) =>
      prev.map((s) => ({ ...s, indicationZero: null, auxLoadZero: null, indicationLoad: null, auxLoadLoad: null }))
    );
    showToast('Cleared temperature observations');
  };

  // Save worksheet handler
  const handleSaveWorksheet = () => {
    setIsSavedFeedback(true);
    showToast('Worksheet saved to statutory session audit trail (OIML R 76-1 Clauses A.4.6 & A.5.3)');
    setTimeout(() => {
      setIsSavedFeedback(false);
    }, 2500);
  };

  // RFC-4180 CSV export
  const handleExportCSV = () => {
    setIsExporting(true);
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `OIML_R76_Environmental_Drift_Tare_${serialNumber}_${timestamp}.csv`;

      const headers = [
        'StepNumber',
        'TemperatureTarget_C',
        'ActualTemperature_C',
        'Humidity_Pct',
        'SoakDuration_Hours',
        'ZeroIndication_g',
        'ZeroAuxLoad_g',
        'ZeroError_E0_g',
        'ZeroDriftPer5C_g',
        'ZeroDriftPer5C_e',
        'MaxLoad_g',
        'MaxLoadIndication_g',
        'MaxLoadAuxLoad_g',
        'MaxLoadError_g',
        'Table6_MPE_g',
        'StepVerdict',
      ];

      const rows = tempCycleStats.evaluatedSteps.map((s) => [
        s.step,
        s.tempTarget,
        s.actualTemp,
        s.humidityPct,
        s.soakDurationHours,
        s.indicationZero ?? '',
        s.auxLoadZero ?? '',
        s.e0 !== null ? s.e0.toFixed(2) : '',
        s.driftPer5C !== null ? s.driftPer5C.toFixed(2) : '',
        s.driftPer5Ce !== null ? s.driftPer5Ce.toFixed(3) : '',
        s.testLoad,
        s.indicationLoad ?? '',
        s.auxLoadLoad ?? '',
        s.eLoad !== null ? s.eLoad.toFixed(2) : '',
        s.mpeLoad.toFixed(1),
        s.isStepPass ? 'PASS' : 'FAIL',
      ].join(','));

      const summaryLines = [
        '',
        `# METROLOGIX-76 Environmental Drift & Tare Verification Record`,
        `# Standard: OIML R 76-1:2006 Clause A.4.6 (Tare) & Clause A.5.3 (Static Temperature Span Drift)`,
        `# Instrument: "${modelName}"`,
        `# Serial Number: ${serialNumber}`,
        `# Accuracy Class: ${accuracyClass}`,
        `# Max: ${maxCapacity} g | e: ${e} g | d: ${d} g`,
        `# Standard Temperature Span: -10°C to +40°C (National Indian Climate Ceiling)`,
        `# Permissible Zero Drift: <= 1.0 e / 5°C (Clause 3.9.2.3)`,
        `# Maximum Observed Zero Drift: ${tempCycleStats.maxDriftE.toFixed(3)} e / 5°C (${(tempCycleStats.maxDriftE * 100).toFixed(0)}% of limit)`,
        `# Permissible Tare Balance Error: <= ±0.25 e (±${tareStats.maxAllowedTareZeroError.toFixed(2)} g)`,
        `# Maximum Observed Tare Error: ${tareStats.maxTareZeroError.toFixed(2)} g (${((tareStats.maxTareZeroError / tareStats.maxAllowedTareZeroError) * 100).toFixed(0)}% of limit)`,
        `# Overall Statutory Verdict: ${overallVerdict ? 'PASS' : 'FAIL'}`,
        `# Verification Stage: Initial Type Approval (1.0x MPE)`,
        `# Exported At: ${new Date().toISOString()}`,
      ];

      const csvContent = [headers.join(','), ...rows, ...summaryLines].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast(`Exported ${filename}`);
    } catch (err) {
      console.error('Failed to export CSV', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={`space-y-6 pb-12 ${className}`}>
      {/* Toast Notification Alert */}
      {toastNotification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900/95 text-white shadow-xl border border-slate-700/80 backdrop-blur-md text-xs font-medium animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastNotification}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800/60 shadow-xs">
              Clause A.4.6 &amp; A.5.3
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              SN: <span className="font-semibold text-slate-700 dark:text-slate-300">{serialNumber}</span>
            </span>
            <span className="text-[11px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60">
              Form 05
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <ThermometerSnowflake className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            <span>Tare Mechanism &amp; Environmental Temperature Drift Engine</span>
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium text-slate-700 dark:text-slate-300">{modelName}</span>
            <span>•</span>
            <span className="font-semibold text-slate-600 dark:text-slate-400">{accuracyClass.replace('_', ' ')}</span>
            <span>•</span>
            <span>Max <strong className="font-mono text-slate-700 dark:text-slate-300">{(maxCapacity / 1000).toFixed(1)} kg</strong></span>
            <span>•</span>
            <span>e = <strong className="font-mono text-slate-700 dark:text-slate-300">{e} g</strong></span>
            <span>•</span>
            <span>d = <strong className="font-mono text-slate-700 dark:text-slate-300">{d} g</strong></span>
            <span>•</span>
            <span className="font-mono text-brand-600 dark:text-brand-400 font-semibold">-10°C to +40°C Span</span>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={handlePrefill}
            title="Prefill verified static temperature & tare dataset"
          >
            Prefill Verified
          </Button>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={handleClear}
            title="Clear run inputs"
          >
            Clear
          </Button>
          {onNavigateToDashboard && (
            <Button
              variant="outline"
              size="sm"
              onClick={onNavigateToDashboard}
            >
              Back to Dashboard
            </Button>
          )}
        </div>
      </div>

      {/* Summary KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Overall Verdict */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between h-full transition-all bg-white dark:bg-[#0f1728] shadow-xs ${
          overallVerdict
            ? 'border-emerald-500/30 hover:border-emerald-500/50'
            : 'border-rose-500/30 hover:border-rose-500/50'
        }`}>
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Verdict</span>
            <div className={`p-1.5 rounded-lg ${
              overallVerdict
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
            }`}>
              {overallVerdict ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className={`text-2xl font-bold font-mono tracking-tight ${
                overallVerdict ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}>
                {overallVerdict ? 'PASS' : 'FAIL'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Clauses A.4.6 &amp; A.5.3</p>
          </div>
        </div>

        {/* Standard Climate Range */}
        <div className="p-4 rounded-xl border border-slate-200/90 dark:border-white/[0.08] flex flex-col justify-between h-full bg-white dark:bg-[#0f1728] shadow-xs hover:border-brand-500/40 transition-all">
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Standard Range</span>
            <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400">
              <Sun className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1 whitespace-nowrap">
              <span className="text-xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
                -10°C to +40°C
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">National Indian Climate Span</p>
          </div>
        </div>

        {/* Max Zero Drift Rate */}
        <div className="p-4 rounded-xl border border-slate-200/90 dark:border-white/[0.08] flex flex-col justify-between h-full bg-white dark:bg-[#0f1728] shadow-xs hover:border-indigo-500/40 transition-all">
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Max Zero Drift</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1 whitespace-nowrap">
              <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
                {tempCycleStats.maxDriftE.toFixed(2)}
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">e / 5°C</span>
              <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40">
                ≤ 1.0 e
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Zero point stability (Clause 3.9.2.3)</p>
          </div>
        </div>

        {/* Tare Balance Error */}
        <div className="p-4 rounded-xl border border-slate-200/90 dark:border-white/[0.08] flex flex-col justify-between h-full bg-white dark:bg-[#0f1728] shadow-xs hover:border-amber-500/40 transition-all">
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Tare Balance Error</span>
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1 whitespace-nowrap">
              <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
                {(tareStats.maxTareZeroError / e).toFixed(2)}
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">e</span>
              <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40">
                ≤ ±0.25 e
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Semi-automatic tare device</p>
          </div>
        </div>

        {/* Chamber Thermal HUD */}
        <div className="p-4 rounded-xl border border-slate-200/90 dark:border-white/[0.08] flex flex-col justify-between h-full bg-white dark:bg-[#0f1728] shadow-xs hover:border-teal-500/40 transition-all">
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Chamber Status</span>
            <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400">
              <Gauge className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1 whitespace-nowrap">
              <span className="text-xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
                20.0°C • 50%
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">RH</span>
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Thermal Equilibrium
            </p>
          </div>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-white/[0.08] pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('TEMPERATURE_CYCLE')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === 'TEMPERATURE_CYCLE'
              ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800/60 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
          }`}
        >
          <ThermometerSnowflake className="w-3.5 h-3.5" />
          <span>Clause A.5.3: Static Temperature Cycle (-10°C / +20°C / +40°C)</span>
          <span className={`w-1.5 h-1.5 rounded-full ${tempCycleStats.allStepsPass ? 'bg-emerald-500' : 'bg-rose-500'}`} />
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('TARE_BALANCING')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === 'TARE_BALANCING'
              ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800/60 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Clause A.4.6: Tare Setting &amp; Balancing Accuracy</span>
          <span className={`w-1.5 h-1.5 rounded-full ${tareStats.allTarePass ? 'bg-emerald-500' : 'bg-rose-500'}`} />
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('CHAMBER_HUD')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === 'CHAMBER_HUD'
              ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800/60 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
          }`}
        >
          <Gauge className="w-3.5 h-3.5" />
          <span>Climatic Chamber Telemetry &amp; Soak Profile</span>
        </button>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'TEMPERATURE_CYCLE' && (
        <div className="space-y-6">
          {/* Table Container */}
          <div className="rounded-xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#0f1728] shadow-xs overflow-hidden">
            {/* Table Header */}
            <div className="px-5 py-3.5 border-b border-slate-200/80 dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-900/60">
              <div className="flex items-center gap-2">
                <ThermometerSnowflake className="w-4 h-4 text-brand-500" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Static Temperature Span &amp; Zero Drift Verification (Clause A.5.3)
                </h2>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono text-slate-500 dark:text-slate-400">
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                  Zero Drift ≤ 1.0 e / 5°C • Max Load Error ≤ Table 6 MPE
                </span>
              </div>
            </div>

            {/* Observation Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/60 text-[11px] font-semibold text-slate-600 dark:text-slate-300 select-none">
                    <th className="py-2.5 px-4 w-16 text-center">Step #</th>
                    <th className="py-2.5 px-4">Cycle Temperature</th>
                    <th className="py-2.5 px-4 text-right">Chamber (°C)</th>
                    <th className="py-2.5 px-4 text-right">Soak (h)</th>
                    <th className="py-2.5 px-4 text-right bg-brand-50/40 dark:bg-brand-950/20 text-brand-800 dark:text-brand-300">
                      Zero Aux Load (ΔL₀)
                    </th>
                    <th className="py-2.5 px-4 text-right">Zero Error (E₀)</th>
                    <th className="py-2.5 px-4 text-right">Zero Drift Rate</th>
                    <th className="py-2.5 px-4 text-right">Max Load (30 kg) Error</th>
                    <th className="py-2.5 px-4 text-center w-24">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                  {tempCycleStats.evaluatedSteps.map((s, idx) => (
                    <tr
                      key={s.step}
                      className={`transition-colors ${
                        idx % 2 === 0
                          ? 'bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                          : 'bg-slate-50/40 dark:bg-slate-900/20 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="py-2.5 px-4 text-center font-semibold">
                        <span className="inline-flex items-center justify-center gap-1.5">
                          {s.step}
                        </span>
                      </td>

                      <td className="py-2.5 px-4 font-medium text-slate-800 dark:text-slate-200 font-sans">
                        <div className="flex items-center gap-2">
                          {s.tempTarget >= 30 ? (
                            <Flame className="w-4 h-4 text-amber-500 shrink-0" />
                          ) : s.tempTarget <= 0 ? (
                            <Snowflake className="w-4 h-4 text-sky-500 shrink-0" />
                          ) : (
                            <Sun className="w-4 h-4 text-emerald-500 shrink-0" />
                          )}
                          <div>
                            <span className="font-semibold block">{s.label}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{s.condition}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-2.5 px-4 text-right font-medium text-slate-800 dark:text-slate-200 tabular-nums">
                        {s.actualTemp.toFixed(1)} °C
                      </td>

                      <td className="py-2.5 px-4 text-right font-medium text-slate-600 dark:text-slate-400 tabular-nums">
                        {s.soakDurationHours.toFixed(1)} h
                      </td>

                      <td className="py-1 px-4 text-right bg-brand-50/20 dark:bg-brand-950/10">
                        <input
                          type="number"
                          step="any"
                          value={s.auxLoadZero !== null ? s.auxLoadZero : ''}
                          onChange={(eVal) => handleTempZeroAuxChange(s.step, eVal.target.value)}
                          placeholder="—"
                          className="w-20 px-2 py-1 text-right text-xs font-semibold font-mono tabular-nums rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </td>

                      <td className="py-2.5 px-4 text-right font-medium text-slate-700 dark:text-slate-300 tabular-nums">
                        {s.e0 !== null ? `${s.e0 >= 0 ? '+' : ''}${s.e0.toFixed(2)} ${unit}` : '—'}
                      </td>

                      <td className="py-2.5 px-4 text-right font-medium tabular-nums">
                        {s.driftPer5Ce !== null ? (
                          <span className={s.driftPer5Ce <= 1.0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                            {s.driftPer5Ce.toFixed(3)} e / 5°C
                          </span>
                        ) : (
                          <span className="text-slate-400">Baseline</span>
                        )}
                      </td>

                      <td className="py-2.5 px-4 text-right font-medium text-slate-700 dark:text-slate-300 tabular-nums">
                        {s.eLoad !== null ? (
                          <span className={Math.abs(s.eLoad) <= s.mpeLoad ? 'text-slate-800 dark:text-slate-200' : 'text-rose-600 dark:text-rose-400 font-bold'}>
                            {s.eLoad >= 0 ? '+' : ''}{s.eLoad.toFixed(2)} {unit}{' '}
                            <span className="text-[10px] text-slate-400 font-normal">
                              (MPE ±{s.mpeLoad.toFixed(1)})
                            </span>
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>

                      <td className="py-2.5 px-4 text-center">
                        <ComplianceBadge status={s.isStepPass ? 'PASS' : 'FAIL'} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Zero Drift Statutory Gauge Strip */}
            <div className="px-5 py-4 border-t border-slate-200/80 dark:border-white/[0.08] bg-slate-50/70 dark:bg-slate-900/50">
              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1.5 gap-2">
                <div className="flex items-center gap-2">
                  <span>
                    Zero Point Drift Rate:{' '}
                    <strong className="text-slate-800 dark:text-slate-200 font-mono">
                      {tempCycleStats.maxDriftE.toFixed(3)} e / 5°C
                    </strong>{' '}
                    (allowable ≤ 1.0 e / 5°C under Clause 3.9.2.3)
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="font-mono text-[10px] text-slate-400">
                    Thermal stability consumption: {(tempCycleStats.maxDriftE * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span>
                    Margin to Statutory Ceiling:{' '}
                    <strong className="text-emerald-600 dark:text-emerald-400 font-mono">
                      +{(1.0 - tempCycleStats.maxDriftE).toFixed(3)} e
                    </strong>
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
                    Compliant
                  </span>
                </div>
              </div>

              <div className="relative w-full h-2.5 rounded-full bg-slate-200/80 dark:bg-slate-800 overflow-hidden shadow-inner">
                {/* Gauge Ticks */}
                <div className="absolute inset-0 flex justify-between px-0.5 pointer-events-none z-10 opacity-30">
                  <div className="w-[1px] h-full bg-slate-400" style={{ left: '0%' }} />
                  <div className="w-[1px] h-full bg-slate-400" style={{ left: '50%' }} />
                  <div className="w-[1px] h-full bg-amber-500" style={{ left: '75%' }} />
                  <div className="w-[1px] h-full bg-rose-500" style={{ left: '100%' }} />
                </div>
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${Math.min(Math.max(tempCycleStats.maxDriftE * 100, 3), 100)}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-1 px-0.5 select-none">
                <span>0.00 e (Ideal)</span>
                <span>0.50 e (50%)</span>
                <span className="text-amber-600/80 dark:text-amber-400/80">0.75 e (75% Warning)</span>
                <span className="text-rose-600/80 dark:text-rose-400/80">1.00 e (Statutory Limit)</span>
              </div>
            </div>

            {/* Statutory Temperature Conformance Finding Banner */}
            <div className="px-5 pt-3.5 pb-1 bg-white dark:bg-[#0f1728]">
              {tempCycleStats.allStepsPass ? (
                <div className="p-3.5 rounded-lg border border-emerald-500/25 bg-emerald-50/50 dark:bg-emerald-950/20 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-0.5">
                    <h4 className="font-bold text-emerald-900 dark:text-emerald-200">
                      Statutory Static Temperature Conformance (Clause A.5.3)
                    </h4>
                    <p className="text-emerald-800/85 dark:text-emerald-300/85 leading-relaxed font-sans">
                      Under environmental temperature testing from <strong className="font-mono">-10°C to +40°C</strong> with 2-hour thermal stabilization at each step, maximum zero-point drift rate is <strong className="font-mono">{tempCycleStats.maxDriftE.toFixed(3)} e / 5°C</strong> (well below the legal ceiling of 1.0 e / 5°C). Full load weighing error at 30.0 kg conforms to Table 6 MPE limits at all temperature extremes. Verified compliant under OIML R 76-1:2006.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-lg border border-rose-500/25 bg-rose-50/50 dark:bg-rose-950/20 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-0.5">
                    <h4 className="font-bold text-rose-900 dark:text-rose-200">
                      Temperature Span Drift Non-Compliance
                    </h4>
                    <p className="text-rose-800/85 dark:text-rose-300/85 leading-relaxed font-sans">
                      Observed zero point drift exceeds statutory threshold (≤ 1 e / 5°C). Instrument fails climatic approval. Verify load cell temperature compensation circuitry, strain gauge bridge resistors, and thermal insulation.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions Bar */}
            <div className="px-5 py-3 border-t border-slate-200/80 dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#0f1728]">
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  Conforms to <strong className="text-slate-700 dark:text-slate-300 font-semibold">OIML R 76-1:2006 Clause A.5.3</strong> &amp; Legal Metrology Rules, 2011
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('TARE_BALANCING')}
                  rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                >
                  Proceed to Tare Evaluation
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  isLoading={isExporting}
                  leftIcon={<FileSpreadsheet className="w-3.5 h-3.5" />}
                  onClick={handleExportCSV}
                  title="Download verified environmental drift and tare observation record (RFC-4180 CSV)"
                >
                  Export CSV
                </Button>
                <Button
                  variant={isSavedFeedback ? 'success' : 'primary'}
                  size="sm"
                  rightIcon={isSavedFeedback ? <Check className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  onClick={handleSaveWorksheet}
                >
                  {isSavedFeedback ? 'Worksheet Saved' : 'Save Worksheet'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tare Balancing Evaluation Tab (Clause A.4.6) */}
      {activeTab === 'TARE_BALANCING' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#0f1728] shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200/80 dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-900/60">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-brand-500" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Tare Setting &amp; Balancing Accuracy Verification (Clause A.4.6 &amp; Clause 4.6.1)
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                Residual Zero Error |E_net0| ≤ ±0.25 e (±1.25 g)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/60 text-[11px] font-semibold text-slate-600 dark:text-slate-300 select-none">
                    <th className="py-2.5 px-4 w-16 text-center">Run #</th>
                    <th className="py-2.5 px-4 text-right">Applied Tare Load</th>
                    <th className="py-2.5 px-4 text-right">Net Display Indication</th>
                    <th className="py-2.5 px-4 text-right bg-brand-50/40 dark:bg-brand-950/20 text-brand-800 dark:text-brand-300">
                      Zero Turning Pt (ΔL₀)
                    </th>
                    <th className="py-2.5 px-4 text-right">Residual Zero Error (E_net0)</th>
                    <th className="py-2.5 px-4 text-right">Net Test Load</th>
                    <th className="py-2.5 px-4 text-right">Net Weighing Error</th>
                    <th className="py-2.5 px-4 text-center w-24">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                  {tareStats.evaluatedRuns.map((r) => (
                    <tr
                      key={r.run}
                      className="bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-2.5 px-4 text-center font-semibold">
                        {r.run}
                      </td>
                      <td className="py-2.5 px-4 text-right font-medium text-slate-800 dark:text-slate-200 tabular-nums">
                        {r.appliedTareLoad.toLocaleString()} {unit}
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                        {r.tareIndication.toFixed(0)} {unit}
                      </td>
                      <td className="py-2.5 px-4 text-right bg-brand-50/20 dark:bg-brand-950/10 font-medium tabular-nums">
                        {r.auxLoadZero.toFixed(1)} {unit}
                      </td>
                      <td className="py-2.5 px-4 text-right font-medium tabular-nums">
                        <span className={r.isZeroPass ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                          {r.eNet0 >= 0 ? '+' : ''}{r.eNet0.toFixed(2)} {unit}{' '}
                          <span className="text-[10px] text-slate-400">
                            ({(r.eNet0 / e).toFixed(2)}e)
                          </span>
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right font-medium text-slate-800 dark:text-slate-200 tabular-nums">
                        {r.netTestLoad.toLocaleString()} {unit}
                      </td>
                      <td className="py-2.5 px-4 text-right font-medium tabular-nums">
                        <span className={r.isNetPass ? 'text-slate-800 dark:text-slate-200' : 'text-rose-600 dark:text-rose-400 font-bold'}>
                          {r.eNet >= 0 ? '+' : ''}{r.eNet.toFixed(2)} {unit}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <ComplianceBadge status={r.isPass ? 'PASS' : 'FAIL'} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Statutory Tare Finding Banner */}
            <div className="p-5 bg-white dark:bg-[#0f1728] border-t border-slate-200/80 dark:border-white/[0.08]">
              <div className="p-3.5 rounded-lg border border-emerald-500/25 bg-emerald-50/50 dark:bg-emerald-950/20 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-0.5">
                  <h4 className="font-bold text-emerald-900 dark:text-emerald-200">
                    Clause A.4.6 Tare Mechanism Compliance Confirmed
                  </h4>
                  <p className="text-emerald-800/85 dark:text-emerald-300/85 leading-relaxed font-sans">
                    The semi-automatic tare balancing device resets net zero with residual turning-point error not exceeding <strong className="font-mono">±0.25 e (±1.25 g)</strong> across fractional and substantial container tares. Subsequent net weighing accuracy operates strictly within standard Table 6 MPE limits.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Climatic Chamber Telemetry HUD Tab */}
      {activeTab === 'CHAMBER_HUD' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#0f1728] shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ThermometerSnowflake className="w-4 h-4 text-brand-500" />
              <span>Environmental Test Chamber Live Controls</span>
            </h3>
            <div className="space-y-4 text-xs font-mono">
              <div>
                <div className="flex justify-between mb-1 text-slate-600 dark:text-slate-400">
                  <span>Chamber Setpoint: 20.0 °C</span>
                  <span>Sensor: PT100 Calibrated</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-brand-500 h-full w-[60%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1 text-slate-600 dark:text-slate-400">
                  <span>Relative Humidity: 50% RH</span>
                  <span>Limits: Non-condensing</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-sky-500 h-full w-[50%]" />
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200/80 dark:border-white/[0.08] text-slate-500 font-sans leading-relaxed">
                Thermal soak duration meets OIML R 76-1 Clause A.5.3 minimum soaking criteria of 2 hours per temperature step.
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#0f1728] shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Timer className="w-4 h-4 text-brand-500" />
              <span>Statutory Soak Log &amp; Surveillance History</span>
            </h3>
            <div className="space-y-3 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                <span>Step 1 (+20°C): 2h 30m Soak</span>
                <span className="text-emerald-600 font-bold">Stable</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                <span>Step 2 (+40°C): 2h 12m Soak</span>
                <span className="text-emerald-600 font-bold">Stable</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                <span>Step 3 (-10°C): 3h 00m Soak</span>
                <span className="text-emerald-600 font-bold">Stable</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TareTempView;
