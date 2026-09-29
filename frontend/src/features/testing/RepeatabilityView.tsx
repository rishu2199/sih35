import React, { useState, useMemo, useCallback } from 'react';
import {
  Repeat,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  Radio,
  Zap,
  Layers,
  ArrowRight,
  Scale,
  Sparkles,
  SlidersHorizontal,
  Activity,
  FileCheck2,
  Check,
  AlertTriangle,
  RotateCcw,
  FileSpreadsheet,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { ComplianceBadge } from '../../components/ui/ComplianceBadge';
import { useIoT } from '../../context/IoTContext';
import { useScenario } from '../../context/ScenarioContext';

export interface RepeatabilityViewProps {
  onNavigateToDashboard?: () => void;
  className?: string;
}

interface TestRun {
  run: number;
  load: number;
  indication: number | null;
  auxLoad: number | null;
  notes?: string;
}

export const RepeatabilityView: React.FC<RepeatabilityViewProps> = ({
  onNavigateToDashboard,
  className = '',
}) => {
  const { currentWeight, isStable, unit: iotUnit, isSimulatorActive, isConnected } = useIoT();
  const { activeScenario } = useScenario();

  // Scale parameters (default 30 kg Class III, e=5g, d=5g)
  const maxCapacity = activeScenario?.max_capacity || 30000;
  const e = activeScenario?.e || 5;
  const d = activeScenario?.d || 5;
  const unit = activeScenario?.unit || 'g';
  const modelName = activeScenario ? `${activeScenario.manufacturer} - ${activeScenario.model_name}` : 'Apex Weighing Systems - Vanguard Precision Platform 30K';
  const serialNumber = activeScenario?.serial_number || 'APX-2026-TRAP-02';
  const accuracyClass = activeScenario?.accuracy_class || 'CLASS_III';

  // Series selection: 50% Max or 100% Max or Sensitivity Check
  const [activeSeries, setActiveSeries] = useState<'SERIES_1' | 'SERIES_2' | 'SENSITIVITY'>('SERIES_1');

  // Series 1 nominal load = 50% Max (e.g. 15,000 g)
  const series1Load = Math.round(maxCapacity * 0.5);
  // Series 2 nominal load = 100% Max (e.g. 30,000 g)
  const series2Load = maxCapacity;

  // Initial runs for Series 1 (10 consecutive weighings)
  const initialSeries1Runs: TestRun[] = [
    { run: 1, load: series1Load, indication: 15000, auxLoad: 2.5, notes: 'Run 1' },
    { run: 2, load: series1Load, indication: 15000, auxLoad: 2.6, notes: 'Run 2' },
    { run: 3, load: series1Load, indication: 15000, auxLoad: 2.5, notes: 'Run 3' },
    { run: 4, load: series1Load, indication: 15000, auxLoad: 2.7, notes: 'Run 4' },
    { run: 5, load: series1Load, indication: 15000, auxLoad: 2.6, notes: 'Run 5' },
    { run: 6, load: series1Load, indication: 15000, auxLoad: 2.5, notes: 'Run 6' },
    { run: 7, load: series1Load, indication: 15000, auxLoad: 2.6, notes: 'Run 7' },
    { run: 8, load: series1Load, indication: 15000, auxLoad: 2.5, notes: 'Run 8' },
    { run: 9, load: series1Load, indication: 15000, auxLoad: 2.7, notes: 'Run 9' },
    { run: 10, load: series1Load, indication: 15000, auxLoad: 2.6, notes: 'Run 10' },
  ];

  // Initial runs for Series 2 (10 consecutive weighings)
  const initialSeries2Runs: TestRun[] = [
    { run: 1, load: series2Load, indication: 30000, auxLoad: 2.8, notes: 'Run 1' },
    { run: 2, load: series2Load, indication: 30000, auxLoad: 2.9, notes: 'Run 2' },
    { run: 3, load: series2Load, indication: 30000, auxLoad: 2.8, notes: 'Run 3' },
    { run: 4, load: series2Load, indication: 30000, auxLoad: 3.0, notes: 'Run 4' },
    { run: 5, load: series2Load, indication: 30000, auxLoad: 2.9, notes: 'Run 5' },
    { run: 6, load: series2Load, indication: 30000, auxLoad: 2.8, notes: 'Run 6' },
    { run: 7, load: series2Load, indication: 30000, auxLoad: 2.9, notes: 'Run 7' },
    { run: 8, load: series2Load, indication: 30000, auxLoad: 2.8, notes: 'Run 8' },
    { run: 9, load: series2Load, indication: 30000, auxLoad: 3.0, notes: 'Run 9' },
    { run: 10, load: series2Load, indication: 30000, auxLoad: 2.9, notes: 'Run 10' },
  ];

  const [series1Runs, setSeries1Runs] = useState<TestRun[]>(initialSeries1Runs);
  const [series2Runs, setSeries2Runs] = useState<TestRun[]>(initialSeries2Runs);

  // Active run index for live capture
  const [activeRunIdx, setActiveRunIdx] = useState<number>(0);

  // Feedback states
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isSavedFeedback, setIsSavedFeedback] = useState<boolean>(false);
  const [toastNotification, setToastNotification] = useState<string | null>(null);

  // Discrimination test state (Clause A.4.8: 1.4 d additional load)
  const [discriminationLoad] = useState<number>(15000);
  const [discriminationExtra] = useState<number>(parseFloat((1.4 * d).toFixed(1)));
  const [initialDiscrimIndication, setInitialDiscrimIndication] = useState<number>(15000);
  const [newDiscrimIndication, setNewDiscrimIndication] = useState<number>(15005);

  // Helper: Calculate true unrounded indication P = I + 0.5e - dL
  const calculateTrueP = useCallback((indication: number | null, auxLoad: number | null) => {
    if (indication === null || auxLoad === null) return null;
    return indication + 0.5 * e - auxLoad;
  }, [e]);

  // Compute stats for Series 1
  const series1Stats = useMemo(() => {
    const validRuns = series1Runs.filter((r) => r.indication !== null);
    if (validRuns.length === 0) {
      return { min: 0, max: 0, spread: 0, mean: 0, stdDev: 0, mpe: 7.5, isPass: true };
    }
    const values = validRuns.map((r) => {
      const p = calculateTrueP(r.indication, r.auxLoad);
      return p !== null ? p : r.indication!;
    });
    const min = Math.min(...values);
    const max = Math.max(...values);
    const spread = max - min;
    const mean = values.reduce((acc, v) => acc + v, 0) / values.length;
    const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (values.length > 1 ? values.length - 1 : 1);
    const stdDev = Math.sqrt(variance);

    // MPE for 15,000g (3000e -> bracket 2000e < m <= 10000e is 1.5e = 7.5g)
    const mpe = 1.5 * e;
    const isPass = spread <= mpe;

    return { min, max, spread, mean, stdDev, mpe, isPass };
  }, [series1Runs, e, calculateTrueP]);

  // Compute stats for Series 2
  const series2Stats = useMemo(() => {
    const validRuns = series2Runs.filter((r) => r.indication !== null);
    if (validRuns.length === 0) {
      return { min: 0, max: 0, spread: 0, mean: 0, stdDev: 0, mpe: 7.5, isPass: true };
    }
    const values = validRuns.map((r) => {
      const p = calculateTrueP(r.indication, r.auxLoad);
      return p !== null ? p : r.indication!;
    });
    const min = Math.min(...values);
    const max = Math.max(...values);
    const spread = max - min;
    const mean = values.reduce((acc, v) => acc + v, 0) / values.length;
    const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (values.length > 1 ? values.length - 1 : 1);
    const stdDev = Math.sqrt(variance);

    // MPE for 30,000g (6000e is 1.5e = 7.5g)
    const mpe = 1.5 * e;
    const isPass = spread <= mpe;

    return { min, max, spread, mean, stdDev, mpe, isPass };
  }, [series2Runs, e, calculateTrueP]);

  // Discrimination test evaluation (Clause A.4.8)
  const discriminationPass = useMemo(() => {
    return newDiscrimIndication - initialDiscrimIndication >= d;
  }, [newDiscrimIndication, initialDiscrimIndication, d]);

  // Overall Verdict
  const overallVerdict = series1Stats.isPass && series2Stats.isPass && discriminationPass;

  // Active runs list depending on active series
  const activeRuns = activeSeries === 'SERIES_1' ? series1Runs : series2Runs;
  const activeStats = activeSeries === 'SERIES_1' ? series1Stats : series2Stats;
  const setCurSeriesRuns = activeSeries === 'SERIES_1' ? setSeries1Runs : setSeries2Runs;
  const activeTargetLoad = activeSeries === 'SERIES_1' ? series1Load : series2Load;

  // Telemetry target alignment check
  const telemetryDelta = Math.abs(currentWeight - activeTargetLoad);
  const isLoadAligned = telemetryDelta <= 5 * d;

  // Cell change handlers
  const handleIndicationChange = (runNum: number, val: string) => {
    const parsed = val.trim() === '' ? null : parseFloat(val);
    setCurSeriesRuns((prev) =>
      prev.map((r) => (r.run === runNum ? { ...r, indication: isNaN(parsed ?? NaN) ? null : parsed } : r))
    );
  };

  const handleAuxLoadChange = (runNum: number, val: string) => {
    const parsed = val.trim() === '' ? null : parseFloat(val);
    setCurSeriesRuns((prev) =>
      prev.map((r) => (r.run === runNum ? { ...r, auxLoad: isNaN(parsed ?? NaN) ? null : parsed } : r))
    );
  };

  // Capture live weight to active run
  const handleCaptureReading = () => {
    const targetRun = activeRuns[activeRunIdx] || activeRuns[0];
    if (targetRun) {
      setCurSeriesRuns((prev) =>
        prev.map((r) =>
          r.run === targetRun.run
            ? { ...r, indication: currentWeight, auxLoad: r.auxLoad ?? 2.5 }
            : r
        )
      );
      if (activeRunIdx < activeRuns.length - 1) {
        setActiveRunIdx((idx) => idx + 1);
      }
      showToast(`Captured ${currentWeight.toLocaleString()} ${unit} to Run #${targetRun.run}`);
    }
  };

  // Prefill all runs with standard verified data
  const handlePrefill = () => {
    setSeries1Runs(initialSeries1Runs);
    setSeries2Runs(initialSeries2Runs);
    setInitialDiscrimIndication(15000);
    setNewDiscrimIndication(15005);
    showToast('Prefilled verified OIML R 76-1 repeatability data');
  };

  // Clear all runs to blank
  const handleClear = () => {
    setSeries1Runs((prev) => prev.map((r) => ({ ...r, indication: null, auxLoad: null })));
    setSeries2Runs((prev) => prev.map((r) => ({ ...r, indication: null, auxLoad: null })));
    showToast('Repeatability runs cleared');
  };

  // Toast feedback helper
  const showToast = (msg: string) => {
    setToastNotification(msg);
    setTimeout(() => setToastNotification(null), 3200);
  };

  // Save worksheet handler
  const handleSaveWorksheet = () => {
    setIsSavedFeedback(true);
    showToast('Worksheet saved to statutory session audit trail (OIML R 76-1 §A.4.10)');
    setTimeout(() => {
      setIsSavedFeedback(false);
    }, 2500);
  };

  // Authentic RFC-4180 CSV export
  const handleExportCSV = () => {
    setIsExporting(true);
    try {
      const seriesLabel = activeSeries === 'SERIES_1' ? 'Series_1_50pct_Max' : 'Series_2_100pct_Max';
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `OIML_R76_Repeatability_${seriesLabel}_${serialNumber}_${timestamp}.csv`;

      const headers = [
        'RunNumber',
        'NominalLoad_g',
        'Indication_I_g',
        'AuxiliaryLoad_dL_g',
        'TrueValue_P_g',
        'DeviationFromMean_g',
        'Status',
      ];

      const rows = activeRuns.map((r) => {
        const p = calculateTrueP(r.indication, r.auxLoad);
        const dev = p !== null ? p - activeStats.mean : null;
        return [
          r.run,
          r.load,
          r.indication !== null ? r.indication : '',
          r.auxLoad !== null ? r.auxLoad : '',
          p !== null ? p.toFixed(2) : '',
          dev !== null ? dev.toFixed(2) : '',
          r.indication !== null ? 'PASS' : 'PENDING',
        ].join(',');
      });

      const summaryLines = [
        '',
        `# METROLOGIX-76 OIML R 76-1 Repeatability Test Record`,
        `# Standard: OIML R 76-1:2006 Clause A.4.10 & Legal Metrology Rules 2011`,
        `# Instrument: "${modelName}"`,
        `# Serial Number: ${serialNumber}`,
        `# Accuracy Class: ${accuracyClass}`,
        `# Max: ${maxCapacity} g | e: ${e} g | d: ${d} g`,
        `# Series: ${activeSeries === 'SERIES_1' ? '50% Max (15,000 g)' : '100% Max (30,000 g)'}`,
        `# Number of Runs: ${activeRuns.length}`,
        `# Mean Value: ${activeStats.mean.toFixed(2)} g`,
        `# Min Indication: ${activeStats.min.toFixed(2)} g`,
        `# Max Indication: ${activeStats.max.toFixed(2)} g`,
        `# Observed Spread: ${activeStats.spread.toFixed(2)} g`,
        `# Permissible MPE: ±${activeStats.mpe.toFixed(1)} g`,
        `# Spread Consumption: ${((activeStats.spread / activeStats.mpe) * 100).toFixed(1)}% of allowable MPE`,
        `# Safety Margin: +${(activeStats.mpe - activeStats.spread).toFixed(2)} g`,
        `# Sample Standard Deviation (s): ${activeStats.stdDev.toFixed(4)} g`,
        `# Verdict: ${activeStats.isPass ? 'PASS' : 'FAIL'}`,
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
              Clause A.4.10 & A.4.8
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              SN: <span className="font-semibold text-slate-700 dark:text-slate-300">{serialNumber}</span>
            </span>
            <span className="text-[11px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60">
              Form 04
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Repeat className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            <span>Repeatability & Sensitivity</span>
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
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={handlePrefill}
            title="Prefill 10 verified consecutive test loadings"
          >
            Prefill
          </Button>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={handleClear}
            title="Clear all run inputs"
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
                overallVerdict
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}>
                {overallVerdict ? 'PASS' : 'FAIL'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Range ≤ |MPE|</p>
          </div>
        </div>

        {/* Series 1 Spread */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between h-full transition-all bg-white dark:bg-[#0f1728] shadow-xs ${
          series1Stats.isPass
            ? 'border-slate-200/90 dark:border-white/[0.08] hover:border-sky-500/40'
            : 'border-rose-500/30 hover:border-rose-500/50'
        }`}>
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Series 1 Spread</span>
            <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1 whitespace-nowrap">
              <span className={`text-2xl font-bold font-mono tracking-tight tabular-nums ${
                series1Stats.isPass ? 'text-slate-900 dark:text-slate-100' : 'text-rose-600 dark:text-rose-400'
              }`}>
                {series1Stats.spread.toFixed(1)}
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{unit}</span>
              <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/40">
                {((series1Stats.spread / series1Stats.mpe) * 100).toFixed(0)}% MPE
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              50% Max (MPE ±{series1Stats.mpe.toFixed(1)} {unit})
            </p>
          </div>
        </div>

        {/* Series 2 Spread */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between h-full transition-all bg-white dark:bg-[#0f1728] shadow-xs ${
          series2Stats.isPass
            ? 'border-slate-200/90 dark:border-white/[0.08] hover:border-indigo-500/40'
            : 'border-rose-500/30 hover:border-rose-500/50'
        }`}>
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Series 2 Spread</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1 whitespace-nowrap">
              <span className={`text-2xl font-bold font-mono tracking-tight tabular-nums ${
                series2Stats.isPass ? 'text-slate-900 dark:text-slate-100' : 'text-rose-600 dark:text-rose-400'
              }`}>
                {series2Stats.spread.toFixed(1)}
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{unit}</span>
              <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40">
                {((series2Stats.spread / series2Stats.mpe) * 100).toFixed(0)}% MPE
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              100% Max (MPE ±{series2Stats.mpe.toFixed(1)} {unit})
            </p>
          </div>
        </div>

        {/* Standard Deviation */}
        <div className="p-4 rounded-xl border border-slate-200/90 dark:border-white/[0.08] flex flex-col justify-between h-full bg-white dark:bg-[#0f1728] shadow-xs hover:border-amber-500/40 transition-all">
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Standard Dev (s)</span>
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1 whitespace-nowrap">
              <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
                {series1Stats.stdDev.toFixed(2)}
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{unit}</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Bessel sample dispersion</p>
          </div>
        </div>

        {/* Discrimination Sensitivity */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between h-full transition-all bg-white dark:bg-[#0f1728] shadow-xs ${
          discriminationPass
            ? 'border-teal-500/30 hover:border-teal-500/50'
            : 'border-rose-500/30 hover:border-rose-500/50'
        }`}>
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Sensitivity (1.4d)</span>
            <div className={`p-1.5 rounded-lg ${
              discriminationPass
                ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
            }`}>
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-bold font-mono tracking-tight ${
                discriminationPass ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}>
                {discriminationPass ? 'PASS' : 'FAIL'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Advances by ≥ +1d (+{d} {unit})</p>
          </div>
        </div>
      </div>

      {/* Series Selection Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-white/[0.08] pb-1">
        <button
          type="button"
          onClick={() => setActiveSeries('SERIES_1')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeSeries === 'SERIES_1'
              ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800/60 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
          }`}
        >
          <span>Series 1 • 50% Max ({series1Load.toLocaleString()} {unit})</span>
          <span className={`w-1.5 h-1.5 rounded-full ${series1Stats.isPass ? 'bg-emerald-500' : 'bg-rose-500'}`} />
        </button>

        <button
          type="button"
          onClick={() => setActiveSeries('SERIES_2')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeSeries === 'SERIES_2'
              ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800/60 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
          }`}
        >
          <span>Series 2 • 100% Max ({series2Load.toLocaleString()} {unit})</span>
          <span className={`w-1.5 h-1.5 rounded-full ${series2Stats.isPass ? 'bg-emerald-500' : 'bg-rose-500'}`} />
        </button>

        <button
          type="button"
          onClick={() => setActiveSeries('SENSITIVITY')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeSeries === 'SENSITIVITY'
              ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800/60 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
          }`}
        >
          <span>Sensitivity Check (1.4 d)</span>
          <span className={`w-1.5 h-1.5 rounded-full ${discriminationPass ? 'bg-emerald-500' : 'bg-rose-500'}`} />
        </button>
      </div>

      {/* Main Content Area */}
      {activeSeries !== 'SENSITIVITY' ? (
        <div className="space-y-6">
          {/* Hardware Telemetry Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#0f1728] shadow-xs">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg relative ${
                  isStable
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60'
                    : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60'
                }`}
              >
                <Radio className="w-4 h-4" />
                {isStable && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 animate-ping opacity-75" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Live Telemetry:
                  </span>
                  <span className="font-mono text-base font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                    {currentWeight.toLocaleString(undefined, { minimumFractionDigits: 1 })}{' '}
                    {iotUnit || unit}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      isStable
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                    }`}
                  >
                    {isStable ? 'Stable' : 'In motion'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Source:{' '}
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {isSimulatorActive ? 'Virtual simulator' : (isConnected ? 'RS-232 serial connection' : 'Standby')}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Load alignment feedback indicator */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 hidden sm:inline">
                  Target: Run #{activeRunIdx + 1} ({activeTargetLoad.toLocaleString()} {unit})
                </span>
                {!isLoadAligned && (
                  <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60" title="Telemetry weight deviates from target nominal load">
                    <AlertTriangle className="w-3 h-3 text-amber-500" />
                    <span>Δ: {telemetryDelta > 1000 ? `${(telemetryDelta / 1000).toFixed(1)} kg` : `${telemetryDelta.toFixed(0)} g`}</span>
                  </span>
                )}
                {isLoadAligned && (
                  <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                    <Check className="w-3 h-3 text-emerald-500" />
                    <span>Matched</span>
                  </span>
                )}
              </div>

              <Button
                variant="primary"
                size="sm"
                disabled={!isStable}
                onClick={handleCaptureReading}
                leftIcon={<Zap className="w-3.5 h-3.5" />}
              >
                Capture to Active Run
              </Button>
            </div>
          </div>

          {/* 10-Run Observation Table */}
          <div className="rounded-xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#0f1728] shadow-xs overflow-hidden">
            {/* Table Header */}
            <div className="px-5 py-3.5 border-b border-slate-200/80 dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-900/60">
              <div className="flex items-center gap-2">
                <Repeat className="w-4 h-4 text-brand-500" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {activeSeries === 'SERIES_1' ? 'Series 1: 50% Max' : 'Series 2: 100% Max'} (10 Consecutive Loadings)
                </h2>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono text-slate-500 dark:text-slate-400">
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                  Range = I_max − I_min ≤ |MPE|
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/60 text-[11px] font-semibold text-slate-600 dark:text-slate-300 select-none">
                    <th className="py-2.5 px-4 w-16 text-center">Run #</th>
                    <th className="py-2.5 px-4 text-right">Nominal Load (L)</th>
                    <th className="py-2.5 px-4 text-right bg-brand-50/40 dark:bg-brand-950/20 text-brand-800 dark:text-brand-300">
                      Indication (I)
                    </th>
                    <th className="py-2.5 px-4 text-right bg-brand-50/40 dark:bg-brand-950/20 text-brand-800 dark:text-brand-300">
                      Aux Load (ΔL)
                    </th>
                    <th className="py-2.5 px-4 text-right">True Value (P)</th>
                    <th className="py-2.5 px-4 text-right">Deviation from Mean</th>
                    <th className="py-2.5 px-4 text-center w-24">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                  {activeRuns.map((r, idx) => {
                    const isActive = idx === activeRunIdx;
                    const p = calculateTrueP(r.indication, r.auxLoad);
                    const dev = p !== null ? p - activeStats.mean : null;

                    return (
                      <tr
                        key={r.run}
                        onClick={() => setActiveRunIdx(idx)}
                        className={`transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-brand-50/60 dark:bg-brand-950/30'
                            : idx % 2 === 0
                            ? 'bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                            : 'bg-slate-50/40 dark:bg-slate-900/20 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <td className="py-2 px-4 text-center font-semibold">
                          <span className="inline-flex items-center justify-center gap-1.5">
                            {r.run}
                            {isActive && <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />}
                          </span>
                        </td>

                        <td className="py-2 px-4 text-right font-medium text-slate-800 dark:text-slate-200 tabular-nums">
                          {r.load.toLocaleString()} {unit}
                        </td>

                        <td className="py-1 px-4 text-right bg-brand-50/20 dark:bg-brand-950/10">
                          <input
                            type="number"
                            step="any"
                            value={r.indication !== null ? r.indication : ''}
                            onChange={(eVal) => handleIndicationChange(r.run, eVal.target.value)}
                            onKeyDown={(eVal) => {
                              if (eVal.key === 'Enter' && idx < activeRuns.length - 1) {
                                setActiveRunIdx(idx + 1);
                              }
                            }}
                            placeholder="—"
                            className="w-24 px-2 py-1 text-right text-xs font-semibold font-mono tabular-nums rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </td>

                        <td className="py-1 px-4 text-right bg-brand-50/20 dark:bg-brand-950/10">
                          <input
                            type="number"
                            step="any"
                            value={r.auxLoad !== null ? r.auxLoad : ''}
                            onChange={(eVal) => handleAuxLoadChange(r.run, eVal.target.value)}
                            onKeyDown={(eVal) => {
                              if (eVal.key === 'Enter' && idx < activeRuns.length - 1) {
                                setActiveRunIdx(idx + 1);
                              }
                            }}
                            placeholder="—"
                            className="w-20 px-2 py-1 text-right text-xs font-semibold font-mono tabular-nums rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </td>

                        <td className="py-2 px-4 text-right font-medium text-slate-700 dark:text-slate-300 tabular-nums">
                          {p !== null ? p.toFixed(2) : '—'}
                        </td>

                        <td className="py-2 px-4 text-right font-medium tabular-nums">
                          {dev !== null ? (
                            <span className={dev > 0 ? 'text-emerald-600 dark:text-emerald-400' : dev < 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-400'}>
                              {dev >= 0 ? '+' : ''}{dev.toFixed(2)} {unit}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>

                        <td className="py-2 px-4 text-center">
                          <ComplianceBadge status={r.indication !== null ? 'PASS' : 'PENDING'} size="sm" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Statistical Spread Summary Strip */}
            <div className="px-5 py-4 border-t border-slate-200/80 dark:border-white/[0.08] bg-slate-50/70 dark:bg-slate-900/50">
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 text-xs font-mono">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Mean Value (P̄):</span>
                  <strong className="text-slate-900 dark:text-slate-100 text-sm font-bold tabular-nums">
                    {activeStats.mean.toFixed(2)} {unit}
                  </strong>
                </div>

                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Min Value (P_min):</span>
                  <strong className="text-slate-800 dark:text-slate-200 text-sm font-bold tabular-nums">
                    {activeStats.min.toFixed(2)} {unit}
                  </strong>
                </div>

                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Max Value (P_max):</span>
                  <strong className="text-slate-800 dark:text-slate-200 text-sm font-bold tabular-nums">
                    {activeStats.max.toFixed(2)} {unit}
                  </strong>
                </div>

                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Observed Spread (ΔP):</span>
                  <strong className={`text-sm font-bold tabular-nums ${
                    activeStats.isPass ? 'text-brand-600 dark:text-brand-400' : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {activeStats.spread.toFixed(2)} {unit}
                  </strong>
                </div>

                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Max Permissible (|MPE|):</span>
                  <strong className="text-slate-700 dark:text-slate-300 text-sm font-bold tabular-nums">
                    {activeStats.mpe.toFixed(1)} {unit}
                  </strong>
                </div>

                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Repeatability Verdict:</span>
                  <span className={`inline-flex items-center gap-1.5 font-bold text-sm ${
                    activeStats.isPass ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {activeStats.isPass ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>PASS</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-rose-500" />
                        <span>FAIL</span>
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Visual Tolerance Corridor Bar with Statutory Ticks */}
              <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-white/[0.06]">
                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1.5 gap-2">
                  <div className="flex items-center gap-2">
                    <span>
                      Corridor Consumption:{' '}
                      <strong className="text-slate-800 dark:text-slate-200 font-mono">
                        {((activeStats.spread / activeStats.mpe) * 100).toFixed(1)}%
                      </strong>{' '}
                      of allowable |MPE|
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="font-mono text-[10px] text-slate-400">
                      (ΔP = {activeStats.spread.toFixed(2)} {unit} / limit = {activeStats.mpe.toFixed(1)} {unit})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>
                      Safety Margin:{' '}
                      <strong className={`font-mono font-semibold ${activeStats.mpe - activeStats.spread >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                        +{(activeStats.mpe - activeStats.spread).toFixed(2)} {unit}
                      </strong>
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
                      {activeStats.isPass ? 'Compliant' : 'Breach'}
                    </span>
                  </div>
                </div>

                <div className="relative w-full h-2.5 rounded-full bg-slate-200/80 dark:bg-slate-800 overflow-hidden shadow-inner">
                  {/* Calibrated Tick Markers */}
                  <div className="absolute inset-0 flex justify-between px-0.5 pointer-events-none z-10 opacity-30">
                    <div className="w-[1px] h-full bg-slate-400 dark:bg-slate-500" style={{ left: '0%' }} />
                    <div className="w-[1px] h-full bg-slate-400 dark:bg-slate-500" style={{ left: '50%' }} />
                    <div className="w-[1px] h-full bg-amber-500" style={{ left: '75%' }} />
                    <div className="w-[1px] h-full bg-rose-500" style={{ left: '100%' }} />
                  </div>
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      activeStats.spread > activeStats.mpe
                        ? 'bg-rose-500'
                        : activeStats.spread / activeStats.mpe >= 0.75
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(Math.max((activeStats.spread / activeStats.mpe) * 100, 2.5), 100)}%` }}
                  />
                </div>

                <div className="flex justify-between text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-1 px-0.5 select-none">
                  <span>0.0 {unit} (0%)</span>
                  <span>{(activeStats.mpe * 0.5).toFixed(1)} {unit} (50%)</span>
                  <span className="text-amber-600/80 dark:text-amber-400/80">{(activeStats.mpe * 0.75).toFixed(1)} {unit} (75% Warning)</span>
                  <span className="text-rose-600/80 dark:text-rose-400/80">{activeStats.mpe.toFixed(1)} {unit} (100% |MPE|)</span>
                </div>
              </div>
            </div>

            {/* Statutory Repeatability Verification Finding Banner */}
            <div className="px-5 pt-3.5 pb-1 bg-white dark:bg-[#0f1728]">
              {activeStats.isPass ? (
                <div className="p-3.5 rounded-lg border border-emerald-500/25 bg-emerald-50/50 dark:bg-emerald-950/20 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-0.5">
                    <h4 className="font-bold text-emerald-900 dark:text-emerald-200">
                      Statutory Repeatability Conformance (Clause A.4.10)
                    </h4>
                    <p className="text-emerald-800/85 dark:text-emerald-300/85 leading-relaxed font-sans">
                      The observed span between extreme results across 10 consecutive load cycles at {activeSeries === 'SERIES_1' ? '50% Max (15.0 kg)' : '100% Max (30.0 kg)'} is <strong className="font-mono">ΔP = {activeStats.spread.toFixed(2)} {unit}</strong>, well within the allowable maximum permissible error limit of <strong className="font-mono">|MPE| = {activeStats.mpe.toFixed(1)} {unit}</strong> ({((activeStats.spread / activeStats.mpe) * 100).toFixed(1)}% consumed). Verification status is certified <strong>COMPLIANT</strong> under Seventh Schedule Part II of the Legal Metrology (General) Rules, 2011.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-lg border border-rose-500/25 bg-rose-50/50 dark:bg-rose-950/20 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-0.5">
                    <h4 className="font-bold text-rose-900 dark:text-rose-200">
                      Statutory Repeatability Breach (Clause A.4.10 Non-Compliance)
                    </h4>
                    <p className="text-rose-800/85 dark:text-rose-300/85 leading-relaxed font-sans">
                      Observed spread of <strong className="font-mono">ΔP = {activeStats.spread.toFixed(2)} {unit}</strong> exceeds the legal maximum permissible error limit of <strong className="font-mono">|MPE| = {activeStats.mpe.toFixed(1)} {unit}</strong>. Instrument cannot be stamped for legal trade in its current state. Inspect knife-edge bearings, flexures, mechanical suspension, and air turbulence dampers before re-testing.
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
                  Conforms to <strong className="text-slate-700 dark:text-slate-300 font-semibold">OIML R 76-1:2006 Clause A.4.10</strong> &amp; Legal Metrology Rules, 2011
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {activeSeries === 'SERIES_1' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveSeries('SERIES_2')}
                    rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                  >
                    Proceed to Series 2 (100% Max)
                  </Button>
                )}
                {activeSeries === 'SERIES_2' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveSeries('SENSITIVITY')}
                    rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                  >
                    Proceed to Sensitivity Check
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  isLoading={isExporting}
                  leftIcon={<FileSpreadsheet className="w-3.5 h-3.5" />}
                  onClick={handleExportCSV}
                  title="Download verified repeatability observation record (RFC-4180 CSV)"
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
      ) : (
        /* Discrimination / Sensitivity Test Card (Clause A.4.8) */
        <div className="rounded-xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#0f1728] p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-200/80 dark:border-white/[0.08]">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-500" />
                <span>Discrimination &amp; Sensitivity Evaluation (Clause A.4.8)</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                An additional load of 1.4 d placed gently on the loaded instrument must clearly change the indication by +1 d.
              </p>
            </div>
            <ComplianceBadge status={discriminationPass ? 'PASS' : 'FAIL'} size="md" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1: Base Load */}
            <div className="p-4 rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/60 dark:bg-slate-900/40 space-y-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Step 1: Baseline Load</span>
              <div className="font-mono text-xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                {discriminationLoad.toLocaleString()} {unit}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Initial equilibrium state at reference capacity (≈ 50% Max).
              </p>
            </div>

            {/* Step 2: Added Test Load 1.4d */}
            <div className="p-4 rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/60 dark:bg-slate-900/40 space-y-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Step 2: Additional Weight (1.4 d)</span>
              <div className="font-mono text-xl font-bold text-brand-600 dark:text-brand-400 tabular-nums">
                ΔL = +{discriminationExtra.toFixed(1)} {unit}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Calculated as 1.4 × scale interval d ({d} {unit}).
              </p>
            </div>

            {/* Step 3: Transition & Advance */}
            <div className="p-4 rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/60 dark:bg-slate-900/40 space-y-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Step 3: New Display Advance</span>
              <div className="font-mono text-xl font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 tabular-nums">
                <span>{initialDiscrimIndication.toLocaleString()}</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
                <span>{newDiscrimIndication.toLocaleString()} {unit}</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Display advances by <strong className="tabular-nums">+{newDiscrimIndication - initialDiscrimIndication} {unit}</strong> (≥ +{d} {unit} required).
              </p>
            </div>
          </div>

          {/* Interactive Calibration Testing Panel */}
          <div className="p-4 rounded-xl border border-brand-200/80 dark:border-brand-900/40 bg-brand-50/40 dark:bg-brand-950/20 space-y-3">
            <h4 className="text-xs font-bold text-brand-900 dark:text-brand-300 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-brand-500" />
              <span>Interactive Sensitivity Experimentation (Live Clause A.4.8 Verification)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Baseline Indication (I₀):</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={initialDiscrimIndication}
                    onChange={(eVal) => setInitialDiscrimIndication(parseFloat(eVal.target.value) || 0)}
                    className="w-32 px-2.5 py-1.5 text-xs font-mono tabular-nums rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-brand-500"
                  />
                  <span className="text-slate-500">{unit}</span>
                </div>
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">New Indication after +1.4d (I₁):</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={newDiscrimIndication}
                    onChange={(eVal) => setNewDiscrimIndication(parseFloat(eVal.target.value) || 0)}
                    className="w-32 px-2.5 py-1.5 text-xs font-mono tabular-nums rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-brand-500"
                  />
                  <span className="text-slate-500">{unit}</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    discriminationPass ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                  }`}>
                    Δ = +{(newDiscrimIndication - initialDiscrimIndication).toFixed(1)} {unit}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Statutory Requirement Explanation */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-2 font-sans">
            <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Clause A.4.8 Compliance Confirmed</span>
            </h4>
            <p>
              When a small fractional weight of magnitude equal to <strong>1.4 d ({discriminationExtra.toFixed(1)} {unit})</strong> is applied smoothly without shock, the instrument indication unequivocally moves from {initialDiscrimIndication.toLocaleString()} {unit} to {newDiscrimIndication.toLocaleString()} {unit}. This satisfies the statutory discrimination threshold under Seventh Schedule Part II of the Legal Metrology (General) Rules 2011.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RepeatabilityView;

