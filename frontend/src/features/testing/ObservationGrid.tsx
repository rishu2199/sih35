import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import {
  Scale,
  CheckCircle2,
  Check,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
  Sparkles,
  Download,
  SlidersHorizontal,
  FileCheck2,
  Columns2,
  Table,
  LineChart,
  Radio,
  Zap,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { ComplianceBadge } from '../../components/ui/ComplianceBadge';
import { Modal } from '../../components/ui/Modal';
import { ErrorCorridorChart } from './ErrorCorridorChart';
import { useScenario } from '../../context/ScenarioContext';
import { useIoT } from '../../context/IoTContext';
import type {
  AccuracyClass,
  UnitOfMeasure,
  VerificationStage,
  ComplianceStatus,
  ObservationRow,
  WeighingCalculationTrace,
} from '../../types';

interface ObservationGridProps {
  initialAccuracyClass?: AccuracyClass;
  initialMaxCapacity?: number;
  initialE?: number;
  initialD?: number;
  initialUnit?: UnitOfMeasure;
  serialNumber?: string;
  instrumentModel?: string;
  onSaveWorksheet?: (rows: ObservationRow[]) => void;
  className?: string;
}

export const ObservationGrid: React.FC<ObservationGridProps> = ({
  initialAccuracyClass = 'CLASS_III',
  initialMaxCapacity = 30000,
  initialE = 5,
  initialD = 5,
  initialUnit = 'GRAM',
  serialNumber: propSerialNumber = 'SN-2026-9931',
  instrumentModel: propInstrumentModel = 'Avery Weigh-Tronix ZM510',
  onSaveWorksheet,
  className = '',
}) => {
  const { activeScenario, isRoundingTrapActive } = useScenario();
  const {
    currentWeight,
    isStable,
    unit: iotUnit,
    isSimulatorActive,
    isConnected,
  } = useIoT();

  // Instrument Specifications
  const [accuracyClass, setAccuracyClass] = useState<AccuracyClass>(initialAccuracyClass);
  const [maxCapacity, setMaxCapacity] = useState<number>(initialMaxCapacity);
  const [e, setE] = useState<number>(initialE);
  const [d, setD] = useState<number>(initialD);
  const [unit, setUnit] = useState<UnitOfMeasure>(initialUnit);
  const [serialNumber, setSerialNumber] = useState<string>(propSerialNumber);
  const [instrumentModel, setInstrumentModel] = useState<string>(propInstrumentModel);

  // Verification Stage Switcher (Initial 1x vs In-Service 2x per Clause 3.5.2)
  const [stage, setStage] = useState<VerificationStage>('INITIAL_TYPE_APPROVAL');

  // Presentation View Mode: Split (Grid + Corridor), Grid Only, or Corridor Chart Only
  const [viewMode, setViewMode] = useState<'SPLIT' | 'GRID' | 'CHART'>('SPLIT');

  // Column Density: Clean Standard (7 essential cols) vs Detailed Metrologist (12 cols)
  const [tableDensity, setTableDensity] = useState<'STANDARD' | 'DETAILED'>('STANDARD');

  // Active Selected Row for "Inspect Calculation Trace" Modal
  const [selectedTraceRow, setSelectedTraceRow] = useState<ObservationRow | null>(null);
  const [isTraceModalOpen, setIsTraceModalOpen] = useState(false);
  const [isSavedFeedback, setIsSavedFeedback] = useState(false);

  // Keyboard navigation refs: rowIdx-colName
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // Helper: Statutory OIML R 76-1 Table 6 MPE in units of e
  const getTable6MpeFactor = useCallback((
    targetLoad: number,
    scaleInterval: number,
    accClass: AccuracyClass
  ): { factor: number; bracketName: string } => {
    if (scaleInterval <= 0) return { factor: 0.5, bracketName: '0 <= m <= 500' };
    const m = targetLoad / scaleInterval;

    if (accClass === 'CLASS_I') {
      if (m <= 50000) return { factor: 0.5, bracketName: '0 <= m <= 50,000' };
      if (m <= 200000) return { factor: 1.0, bracketName: '50,000 < m <= 200,000' };
      return { factor: 1.5, bracketName: '200,000 < m' };
    }

    if (accClass === 'CLASS_II') {
      if (m <= 5000) return { factor: 0.5, bracketName: '0 <= m <= 5,000' };
      if (m <= 20000) return { factor: 1.0, bracketName: '5,000 < m <= 20,000' };
      return { factor: 1.5, bracketName: '20,000 < m <= 100,000' };
    }

    if (accClass === 'CLASS_III') {
      if (m <= 500) return { factor: 0.5, bracketName: '0 <= m <= 500' };
      if (m <= 2000) return { factor: 1.0, bracketName: '500 < m <= 2,000' };
      return { factor: 1.5, bracketName: '2,000 < m <= 10,000' };
    }

    // CLASS_IIII
    if (m <= 50) return { factor: 0.5, bracketName: '0 <= m <= 50' };
    if (m <= 200) return { factor: 1.0, bracketName: '50 < m <= 200' };
    return { factor: 1.5, bracketName: '200 < m <= 1,000' };
  }, []);

  // Standard Initial 10-Point OIML R 76-1 Clause A.4.4.1 Test Pattern
  const initialObservations: ObservationRow[] = useMemo(() => {
    // Breakpoints for Class III 30kg (e=5g): Min=100g, 500e=2500g, 2000e=10000g, Max=30000g
    const minLoad = Math.max(e * 20, 100);
    const p500e = e * 500;
    const p2000e = e * 2000;
    const maxLoad = maxCapacity;

    return [
      {
        id: 'row-1',
        step: 1,
        direction: 'ASCENDING',
        targetLoad: 0,
        indication: 0,
        auxiliaryLoad: 2.0, // 0 + 0.5(5) - 2.0 = +0.5 -> E0 = +0.5
        trueIndication: null,
        uncorrectedError: null,
        zeroError: 0,
        correctedError: null,
        mpeLimit: null,
        mpeInE: null,
        margin: null,
        status: 'PENDING',
        isZeroPoint: true,
        notes: 'Initial zero reference point (Clause A.4.4.2)',
      },
      {
        id: 'row-2',
        step: 2,
        direction: 'ASCENDING',
        targetLoad: minLoad,
        indication: minLoad,
        auxiliaryLoad: 2.2,
        trueIndication: null,
        uncorrectedError: null,
        zeroError: 0,
        correctedError: null,
        mpeLimit: null,
        mpeInE: null,
        margin: null,
        status: 'PENDING',
        isZeroPoint: false,
        notes: 'Minimum capacity test point (Min >= 20e)',
      },
      {
        id: 'row-3',
        step: 3,
        direction: 'ASCENDING',
        targetLoad: p500e,
        indication: p500e,
        auxiliaryLoad: 2.1,
        trueIndication: null,
        uncorrectedError: null,
        zeroError: 0,
        correctedError: null,
        mpeLimit: null,
        mpeInE: null,
        margin: null,
        status: 'PENDING',
        isZeroPoint: false,
        notes: 'First changeover breakpoint (500e)',
      },
      {
        id: 'row-4',
        step: 4,
        direction: 'ASCENDING',
        targetLoad: p2000e, // 10000
        indication: 10000,
        auxiliaryLoad: 1.5, // The Verification Gate! P=10001.0, Ec=+0.5
        trueIndication: null,
        uncorrectedError: null,
        zeroError: 0,
        correctedError: null,
        mpeLimit: null,
        mpeInE: null,
        margin: null,
        status: 'PENDING',
        isZeroPoint: false,
        notes: 'Second changeover breakpoint (2000e)',
      },
      {
        id: 'row-5',
        step: 5,
        direction: 'ASCENDING',
        targetLoad: maxLoad,
        indication: maxLoad,
        auxiliaryLoad: 2.4,
        trueIndication: null,
        uncorrectedError: null,
        zeroError: 0,
        correctedError: null,
        mpeLimit: null,
        mpeInE: null,
        margin: null,
        status: 'PENDING',
        isZeroPoint: false,
        notes: 'Maximum capacity test point (Max)',
      },
      {
        id: 'row-6',
        step: 6,
        direction: 'DESCENDING',
        targetLoad: maxLoad,
        indication: maxLoad,
        auxiliaryLoad: 2.3,
        trueIndication: null,
        uncorrectedError: null,
        zeroError: 0,
        correctedError: null,
        mpeLimit: null,
        mpeInE: null,
        margin: null,
        status: 'PENDING',
        isZeroPoint: false,
        notes: 'Return load Max descending',
      },
      {
        id: 'row-7',
        step: 7,
        direction: 'DESCENDING',
        targetLoad: p2000e,
        indication: 10000,
        auxiliaryLoad: 1.6,
        trueIndication: null,
        uncorrectedError: null,
        zeroError: 0,
        correctedError: null,
        mpeLimit: null,
        mpeInE: null,
        margin: null,
        status: 'PENDING',
        isZeroPoint: false,
        notes: 'Descending 2000e breakpoint',
      },
      {
        id: 'row-8',
        step: 8,
        direction: 'DESCENDING',
        targetLoad: p500e,
        indication: p500e,
        auxiliaryLoad: 2.0,
        trueIndication: null,
        uncorrectedError: null,
        zeroError: 0,
        correctedError: null,
        mpeLimit: null,
        mpeInE: null,
        margin: null,
        status: 'PENDING',
        isZeroPoint: false,
        notes: 'Descending 500e breakpoint',
      },
      {
        id: 'row-9',
        step: 9,
        direction: 'DESCENDING',
        targetLoad: minLoad,
        indication: minLoad,
        auxiliaryLoad: 2.1,
        trueIndication: null,
        uncorrectedError: null,
        zeroError: 0,
        correctedError: null,
        mpeLimit: null,
        mpeInE: null,
        margin: null,
        status: 'PENDING',
        isZeroPoint: false,
        notes: 'Descending Min capacity',
      },
      {
        id: 'row-10',
        step: 10,
        direction: 'DESCENDING',
        targetLoad: 0,
        indication: 0,
        auxiliaryLoad: 2.1,
        trueIndication: null,
        uncorrectedError: null,
        zeroError: 0,
        correctedError: null,
        mpeLimit: null,
        mpeInE: null,
        margin: null,
        status: 'PENDING',
        isZeroPoint: true,
        notes: 'Final zero return indication (Clause A.4.4.2)',
      },
    ];
  }, [e, maxCapacity]);

  const [rows, setRows] = useState<ObservationRow[]>(initialObservations);

  // Synchronize rows & instrument specifications when 1-click synthetic scenario changes
  useEffect(() => {
    if (activeScenario) {
      if (activeScenario.accuracy_class) {
        setAccuracyClass(activeScenario.accuracy_class as AccuracyClass);
      }
      if (activeScenario.max_capacity) {
        setMaxCapacity(activeScenario.max_capacity);
      }
      if (activeScenario.e) {
        setE(activeScenario.e);
      }
      if (activeScenario.d) {
        setD(activeScenario.d);
      }
      if (activeScenario.unit) {
        setUnit(
          activeScenario.unit.toLowerCase() === 'g' || activeScenario.unit === 'GRAM'
            ? 'GRAM'
            : 'KILOGRAM'
        );
      }
      if (activeScenario.serial_number) {
        setSerialNumber(activeScenario.serial_number);
      }
      if (activeScenario.model_name) {
        setInstrumentModel(`${activeScenario.manufacturer} - ${activeScenario.model_name}`);
      }

      if (activeScenario.weighing_observations && activeScenario.weighing_observations.length > 0) {
        const scenarioRows: ObservationRow[] = activeScenario.weighing_observations.map((obs) => ({
          id: obs.id,
          step: obs.step,
          direction: obs.direction as 'ASCENDING' | 'DESCENDING' | 'REPEATABILITY',
          targetLoad: obs.target_load,
          indication: obs.indication,
          auxiliaryLoad: obs.auxiliary_load,
          trueIndication: obs.true_indication,
          uncorrectedError: obs.uncorrected_error,
          zeroError: obs.zero_error,
          correctedError: obs.corrected_error,
          mpeLimit: obs.mpe_limit,
          mpeInE: obs.mpe_in_e,
          margin: obs.margin,
          status: obs.status,
          isZeroPoint: obs.is_zero_point,
          notes: obs.notes || undefined,
        }));
        setRows(scenarioRows);
      }
    }
  }, [activeScenario]);

  // Pure Metrological Changeover & MPE Calculation (Zero Latency Client-Side Math)
  const computedRows: ObservationRow[] = useMemo(() => {
    // Stage factor: Initial = 1.0, In-Service = 2.0
    const stageMultiplier =
      stage === 'INITIAL_TYPE_APPROVAL' ? 1.0 : 2.0;

    // Step 1: Calculate Zero Error E0 from first row where targetLoad === 0
    let establishedZeroError = 0;
    const zeroRow = rows.find((r) => r.isZeroPoint && r.step === 1);
    if (
      zeroRow &&
      zeroRow.indication !== null &&
      zeroRow.auxiliaryLoad !== null &&
      e > 0
    ) {
      const p0 = zeroRow.indication + 0.5 * e - zeroRow.auxiliaryLoad;
      establishedZeroError = p0 - zeroRow.targetLoad;
    }

    // Step 2: Calculate all rows with exact decimal math
    return rows.map((row) => {
      if (row.indication === null || row.auxiliaryLoad === null || e <= 0) {
        return {
          ...row,
          trueIndication: null,
          uncorrectedError: null,
          zeroError: establishedZeroError,
          correctedError: null,
          mpeLimit: null,
          mpeInE: null,
          margin: null,
          status: 'PENDING',
        };
      }

      // Digital Changeover Point: P = I + 0.5e - Delta L
      const roundingCorrection = 0.5 * e - row.auxiliaryLoad;
      const p = row.indication + roundingCorrection;

      // Uncorrected error: E = P - L
      const uncorrectedE = p - row.targetLoad;

      // Corrected error: Ec = E - E0
      const correctedEc = uncorrectedE - establishedZeroError;

      // MPE Tier Resolution
      const { factor: baseFactor } = getTable6MpeFactor(
        row.targetLoad,
        e,
        accuracyClass
      );
      const effectiveMpeInE = baseFactor * stageMultiplier;
      const mpeValue = effectiveMpeInE * e;

      // Absolute margin: |MPE| - |Ec|
      const margin = mpeValue - Math.abs(correctedEc);

      // Status
      let status: ComplianceStatus = 'PASS';
      if (Math.abs(correctedEc) > mpeValue) {
        status = 'FAIL';
      } else if (margin < 0.1 * e) {
        status = 'MARGINAL';
      }

      return {
        ...row,
        trueIndication: parseFloat(p.toFixed(4)),
        uncorrectedError: parseFloat(uncorrectedE.toFixed(4)),
        zeroError: parseFloat(establishedZeroError.toFixed(4)),
        correctedError: parseFloat(correctedEc.toFixed(4)),
        mpeLimit: parseFloat(mpeValue.toFixed(4)),
        mpeInE: `±${effectiveMpeInE.toFixed(1)}e`,
        margin: parseFloat(margin.toFixed(4)),
        status,
      };
    });
  }, [rows, e, stage, accuracyClass, getTable6MpeFactor]);

  // Overall Worksheet Statistics
  const stats = useMemo(() => {
    const validRows = computedRows.filter((r) => r.correctedError !== null);
    if (validRows.length === 0) {
      return {
        totalEvaluated: 0,
        maxEc: 0,
        minEc: 0,
        errorSpan: 0,
        hysteresis: 0,
        overallStatus: 'PENDING' as ComplianceStatus,
      };
    }

    const errors = validRows.map((r) => r.correctedError!);
    const maxEc = Math.max(...errors);
    const minEc = Math.min(...errors);
    const errorSpan = maxEc - minEc;

    // Hysteresis between max load ascending and descending
    const maxAsc = computedRows.find((r) => r.targetLoad === maxCapacity && r.direction === 'ASCENDING');
    const maxDesc = computedRows.find((r) => r.targetLoad === maxCapacity && r.direction === 'DESCENDING');
    const hysteresis =
      maxAsc?.correctedError !== undefined &&
      maxAsc?.correctedError !== null &&
      maxDesc?.correctedError !== undefined &&
      maxDesc?.correctedError !== null
        ? Math.abs(maxDesc.correctedError - maxAsc.correctedError)
        : 0;

    const anyFail = validRows.some((r) => r.status === 'FAIL');
    const anyMarginal = validRows.some((r) => r.status === 'MARGINAL');
    const overallStatus: ComplianceStatus = anyFail
      ? 'FAIL'
      : anyMarginal
      ? 'MARGINAL'
      : 'PASS';

    return {
      totalEvaluated: validRows.length,
      maxEc,
      minEc,
      errorSpan,
      hysteresis,
      overallStatus,
    };
  }, [computedRows, maxCapacity]);

  // Cell Change Handlers
  const handleIndicationChange = (rowId: string, val: string) => {
    const parsed = val.trim() === '' ? null : parseFloat(val);
    setRows((prev) =>
      prev.map((r) =>
        r.id === rowId ? { ...r, indication: isNaN(parsed ?? NaN) ? null : parsed } : r
      )
    );
  };

  const handleAuxiliaryLoadChange = (rowId: string, val: string) => {
    const parsed = val.trim() === '' ? null : parseFloat(val);
    setRows((prev) =>
      prev.map((r) =>
        r.id === rowId ? { ...r, auxiliaryLoad: isNaN(parsed ?? NaN) ? null : parsed } : r
      )
    );
  };

  // Keyboard navigation across dense cells (Arrow Up/Down, Tab, Enter)
  const handleKeyDown = (
    eKey: React.KeyboardEvent<HTMLInputElement>,
    rowIdx: number,
    colField: 'indication' | 'auxiliaryLoad'
  ) => {
    if (eKey.key === 'ArrowDown' || eKey.key === 'Enter') {
      eKey.preventDefault();
      const nextKey = `${rowIdx + 1}-${colField}`;
      if (inputRefs.current[nextKey]) inputRefs.current[nextKey]?.focus();
    } else if (eKey.key === 'ArrowUp') {
      eKey.preventDefault();
      const prevKey = `${rowIdx - 1}-${colField}`;
      if (inputRefs.current[prevKey]) inputRefs.current[prevKey]?.focus();
    } else if (eKey.key === 'ArrowRight' && colField === 'indication') {
      const nextColKey = `${rowIdx}-auxiliaryLoad`;
      if (inputRefs.current[nextColKey]) inputRefs.current[nextColKey]?.focus();
    } else if (eKey.key === 'ArrowLeft' && colField === 'auxiliaryLoad') {
      const prevColKey = `${rowIdx}-indication`;
      if (inputRefs.current[prevColKey]) inputRefs.current[prevColKey]?.focus();
    }
  };

  // Preset: Verification Test Gate Load
  const handleLoadVerificationTestGate = () => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.targetLoad === 10000 && r.direction === 'ASCENDING') {
          return {
            ...r,
            indication: 10000,
            auxiliaryLoad: 1.5,
          };
        }
        return r;
      })
    );
  };

  // Preset: Fill Complete Valid Test Run
  const handleFillStandardRun = () => {
    setRows(initialObservations);
  };

  // Preset: Clear to Blank
  const handleClearReadings = () => {
    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        indication: null,
        auxiliaryLoad: null,
      }))
    );
  };

  // Step 27: Capture live reading from physical scale or virtual simulator
  const handleCaptureLiveReading = useCallback(() => {
    // Find the currently pending row or first row with null indication
    const pendingRow = rows.find((r) => r.indication === null) || rows[0];
    if (pendingRow) {
      setRows((prev) =>
        prev.map((r) =>
          r.id === pendingRow.id
            ? { ...r, indication: currentWeight, auxiliaryLoad: r.auxiliaryLoad ?? (r.isZeroPoint ? 2.0 : 1.5) }
            : r
        )
      );
    }
  }, [rows, currentWeight]);

  // Open Trace Modal
  const handleOpenTrace = (row: ObservationRow) => {
    setSelectedTraceRow(row);
    setIsTraceModalOpen(true);
  };

  // Step 28: Export authentic RFC-4180 CSV laboratory observation ledger
  const handleExportCSV = useCallback(() => {
    const headers = [
      'Step',
      'Direction',
      'Target Load (L)',
      'Display Indication (I)',
      'Auxiliary Load (dL)',
      'Unrounded Turning Point (P)',
      'Uncorrected Error (E)',
      'Zero Error (E0)',
      'Corrected Error (Ec)',
      'MPE Limit',
      'Verdict',
    ];

    const csvRows = computedRows.map((r) => [
      r.step,
      r.direction,
      `${r.targetLoad} ${unit === 'KILOGRAM' ? 'kg' : 'g'}`,
      r.indication !== null ? r.indication : '',
      r.auxiliaryLoad !== null ? r.auxiliaryLoad : '',
      r.trueIndication !== null ? r.trueIndication.toFixed(2) : '',
      r.uncorrectedError !== null ? r.uncorrectedError.toFixed(2) : '',
      r.zeroError !== null ? r.zeroError.toFixed(2) : '0.00',
      r.correctedError !== null ? r.correctedError.toFixed(2) : '',
      r.mpeLimit !== null ? `±${r.mpeLimit.toFixed(2)} (${r.mpeInE})` : '',
      r.status,
    ]);

    const csvContent = [
      headers.join(','),
      ...csvRows.map((row) =>
        row
          .map((cell) => {
            const str = String(cell);
            return str.includes(',') ? `"${str}"` : str;
          })
          .join(',')
      ),
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `OIML_R76_Weighing_Observations_${serialNumber}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [computedRows, unit, serialNumber]);

  // Save Worksheet with feedback confirmation
  const handleSaveWorksheet = () => {
    if (onSaveWorksheet) onSaveWorksheet(computedRows);
    setIsSavedFeedback(true);
    setTimeout(() => setIsSavedFeedback(false), 2500);
  };

  // Generate Calculation Trace Details for Modal
  const traceDetails: WeighingCalculationTrace | null = useMemo(() => {
    if (!selectedTraceRow) return null;
    const row = selectedTraceRow;
    if (row.indication === null || row.auxiliaryLoad === null) {
      return null;
    }

    const rowIndication = row.indication;
    const rowAuxLoad = row.auxiliaryLoad;
    const stageMultiplier = stage === 'INITIAL_TYPE_APPROVAL' ? 1.0 : 2.0;
    const roundingCorrection = 0.5 * e - rowAuxLoad;
    const p = rowIndication + roundingCorrection;
    const uncorrectedE = p - row.targetLoad;
    const zeroError = row.zeroError;
    const correctedEc = uncorrectedE - zeroError;

    const { factor: baseFactor, bracketName } = getTable6MpeFactor(
      row.targetLoad,
      e,
      accuracyClass
    );
    const effectiveMpeInE = baseFactor * stageMultiplier;
    const mpeValue = effectiveMpeInE * e;
    const margin = mpeValue - Math.abs(correctedEc);
    const marginPercentage = (margin / mpeValue) * 100;

    return {
      step: row.step,
      direction: row.direction,
      load: row.targetLoad,
      indication: rowIndication,
      e,
      d,
      unit,
      auxiliaryLoad: rowAuxLoad,
      roundingCorrection,
      trueIndication: p,
      uncorrectedError: uncorrectedE,
      zeroError,
      correctedError: correctedEc,
      stage,
      stageMultiplier,
      mRatio: row.targetLoad / e,
      bracketName,
      mpeInE: `±${effectiveMpeInE.toFixed(1)}e`,
      mpeValue,
      margin,
      marginPercentage,
      isCompliant: Math.abs(correctedEc) <= mpeValue,
      statutoryCitation:
        'OIML R 76-1:2006 Clause A.4.4.3 & Legal Metrology (General) Rules, 2011, Seventh Schedule Part II',
    };
  }, [selectedTraceRow, e, d, unit, stage, accuracyClass, getTable6MpeFactor]);

  return (
    <div className={`space-y-6 pb-12 ${className}`}>
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800/60">
              Clause A.4.4
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              SN: <span className="font-semibold text-slate-700 dark:text-slate-300">{serialNumber}</span>
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Scale className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            <span>Weighing Performance</span>
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium text-slate-700 dark:text-slate-300">{instrumentModel}</span>
            <span>•</span>
            <span>{accuracyClass.replace('_', ' ')}</span>
            <span>•</span>
            <span>Max <strong className="font-mono text-slate-700 dark:text-slate-300">{(maxCapacity / 1000).toFixed(1)} kg</strong></span>
            <span>•</span>
            <span>e = <strong className="font-mono text-slate-700 dark:text-slate-300">{e} g</strong></span>
            <span>•</span>
            <span>d = <strong className="font-mono text-slate-700 dark:text-slate-300">{d} g</strong></span>
          </div>
        </div>

        {/* View Switcher, Stage Selector & Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Switcher */}
          <div className="flex items-center rounded-lg border border-slate-200/90 dark:border-white/[0.08] bg-slate-100/80 dark:bg-slate-800/60 p-0.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => setViewMode('SPLIT')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'SPLIT'
                  ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-300 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Columns2 className="w-3.5 h-3.5" />
              <span>Split</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('GRID')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'GRID'
                  ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-300 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('CHART')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'CHART'
                  ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-300 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <LineChart className="w-3.5 h-3.5" />
              <span>Chart</span>
            </button>
          </div>

          {/* Stage Switcher */}
          <div className="flex items-center rounded-lg border border-slate-200/90 dark:border-white/[0.08] bg-slate-100/80 dark:bg-slate-800/60 p-0.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => setStage('INITIAL_TYPE_APPROVAL')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                stage === 'INITIAL_TYPE_APPROVAL'
                  ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-300 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span>Initial (1.0×)</span>
            </button>
            <button
              type="button"
              onClick={() => setStage('IN_SERVICE_INSPECTION')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                stage === 'IN_SERVICE_INSPECTION'
                  ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-300 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span>In-service (2.0×)</span>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Sparkles className="w-3.5 h-3.5 text-brand-500" />}
              onClick={handleLoadVerificationTestGate}
              title="Test gate at L=10,000g, I=10,000g, ΔL=1.5g"
            >
              Step 19 test
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={handleFillStandardRun}
            >
              Prefill
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearReadings}
            >
              Clear
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Metrics Strip — Fixed width, non-truncating titles & non-wrapping numbers */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Overall Verdict */}
        <div className={`p-4 rounded-xl border bg-white dark:bg-[#0f1728] shadow-xs flex flex-col justify-between transition-colors ${
          stats.overallStatus === 'FAIL'
            ? 'border-rose-500/40 dark:border-rose-500/30'
            : stats.overallStatus === 'PASS'
            ? 'border-emerald-500/40 dark:border-emerald-500/30'
            : 'border-slate-200/90 dark:border-white/[0.08]'
        }`}>
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Verdict</span>
            <div className={`p-1.5 rounded-lg ${
              stats.overallStatus === 'PASS'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                : stats.overallStatus === 'FAIL'
                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
            }`}>
              {stats.overallStatus === 'PASS' ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className={`text-2xl font-bold font-mono tracking-tight ${
              stats.overallStatus === 'PASS'
                ? 'text-emerald-600 dark:text-emerald-400'
                : stats.overallStatus === 'FAIL'
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-amber-600 dark:text-amber-400'
            }`}>
              {stats.overallStatus}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
            <span>Clause A.4.4</span>
            {stats.overallStatus === 'FAIL' && (
              <span className="text-rose-600 dark:text-rose-400 font-semibold">• Out of MPE</span>
            )}
            {stats.overallStatus === 'PASS' && (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">• Conforms</span>
            )}
          </p>
        </div>

        {/* Tested Points */}
        <div className="p-4 rounded-xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#0f1728] shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Tested Points</span>
            <div className="p-1.5 rounded-lg bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
              {stats.totalEvaluated}
            </span>
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 font-mono">
              / {computedRows.length}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Asc & desc runs</p>
        </div>

        {/* Max Error */}
        <div className="p-4 rounded-xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#0f1728] shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Max Error</span>
            <div className={`p-1.5 rounded-lg ${
              stats.maxEc > e
                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                : 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400'
            }`}>
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1 whitespace-nowrap">
            <span className={`text-2xl font-bold font-mono tracking-tight tabular-nums ${
              stats.maxEc > e ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'
            }`}>
              {stats.maxEc > 0 ? '+' : ''}{stats.maxEc.toFixed(1)}
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">g</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Highest shift ({stats.maxEc > 0 ? '+' : ''}{(stats.maxEc / (e || 1)).toFixed(1)}e)
          </p>
        </div>

        {/* Min Error */}
        <div className="p-4 rounded-xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#0f1728] shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Min Error</span>
            <div className={`p-1.5 rounded-lg ${
              stats.minEc < -e
                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
            }`}>
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1 whitespace-nowrap">
            <span className={`text-2xl font-bold font-mono tracking-tight tabular-nums ${
              stats.minEc < -e ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'
            }`}>
              {stats.minEc > 0 ? '+' : ''}{stats.minEc.toFixed(1)}
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">g</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Lowest shift ({stats.minEc > 0 ? '+' : ''}{(stats.minEc / (e || 1)).toFixed(1)}e)
          </p>
        </div>

        {/* Error Span */}
        <div className="p-4 rounded-xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#0f1728] shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Error Span</span>
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1 whitespace-nowrap">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
              {stats.errorSpan.toFixed(1)}
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">g</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            max(Ec) − min(Ec) ({(stats.errorSpan / (e || 1)).toFixed(1)}e)
          </p>
        </div>

        {/* Hysteresis */}
        <div className="p-4 rounded-xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#0f1728] shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Hysteresis</span>
            <div className={`p-1.5 rounded-lg ${
              stats.hysteresis <= e
                ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
            }`}>
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1 whitespace-nowrap">
            <span className={`text-2xl font-bold font-mono tracking-tight tabular-nums ${
              stats.hysteresis <= e ? 'text-slate-900 dark:text-slate-100' : 'text-rose-600 dark:text-rose-400'
            }`}>
              {stats.hysteresis.toFixed(1)}
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">g</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            At max capacity (≤ 1.0 MPE)
          </p>
        </div>
      </div>

      {/* Error Corridor Visualization */}
      {(viewMode === 'SPLIT' || viewMode === 'CHART') && (
        <ErrorCorridorChart
          observations={computedRows}
          accuracyClass={accuracyClass}
          maxCapacity={maxCapacity}
          e={e}
          unit={unit}
          stage={stage}
        />
      )}

      {/* Hardware Telemetry Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#0f1728] shadow-xs">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${
              isStable
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60'
                : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60'
            }`}
          >
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Live Telemetry:
              </span>
              <span className="font-mono text-base font-bold text-slate-900 dark:text-slate-100">
                {currentWeight.toLocaleString(undefined, {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 3,
                })}{' '}
                {iotUnit || unit}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1.5 ${
                  isStable
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isStable ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
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
          {rows.find((r) => r.indication === null) && (
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 hidden sm:inline">
              Target: Step {rows.find((r) => r.indication === null)?.step} ({rows.find((r) => r.indication === null)?.targetLoad} g)
            </span>
          )}
          <Button
            variant="primary"
            size="sm"
            disabled={!isStable}
            onClick={handleCaptureLiveReading}
            leftIcon={<Zap className="w-3.5 h-3.5" />}
            title={!isStable ? 'OIML R 76-1 Clause 4.4.2: Capture inhibited during scale motion' : 'Transfer load cell reading to active observation row'}
          >
            Capture Reading
          </Button>
        </div>
      </div>

      {/* Metrological Observation Table */}
      {(viewMode === 'SPLIT' || viewMode === 'GRID') && (
        <div className="rounded-xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#0f1728] shadow-xs overflow-hidden">
          {/* Table Top Context Toolbar */}
          <div className="px-5 py-3.5 border-b border-slate-200/80 dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-900/60">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
                <Table className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Observation Worksheet
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {tableDensity === 'STANDARD' ? 'Clean test run: target loads, observations, and statutory pass/fail verdicts' : 'Detailed metrologist mode: unrounded turning points (P), zero error (E₀), and auxiliary weights (ΔL)'}
                </p>
              </div>
            </div>

            {/* Density Mode Switcher */}
            <div className="flex items-center rounded-lg border border-slate-200/90 dark:border-white/[0.08] bg-slate-100/90 dark:bg-slate-800/80 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setTableDensity('STANDARD')}
                className={`px-3 py-1 rounded-md transition-all font-medium cursor-pointer ${
                  tableDensity === 'STANDARD'
                    ? 'bg-white dark:bg-slate-700 text-brand-800 dark:text-brand-300 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Standard View
              </button>
              <button
                type="button"
                onClick={() => setTableDensity('DETAILED')}
                className={`px-3 py-1 rounded-md transition-all font-medium cursor-pointer ${
                  tableDensity === 'DETAILED'
                    ? 'bg-white dark:bg-slate-700 text-brand-800 dark:text-brand-300 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Metrology Details (ΔL, P, E₀)
              </button>
            </div>
          </div>

          {/* Spreadsheet Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/60 text-[11px] font-semibold text-slate-600 dark:text-slate-300 select-none">
                  <th className="py-2.5 px-3 w-14 text-center">Step</th>
                  <th className="py-2.5 px-3 w-20">Direction</th>
                  <th className="py-2.5 px-3 text-right">Target Load (L)</th>
                  <th className="py-2.5 px-3 text-right bg-brand-50/40 dark:bg-brand-950/20 text-brand-800 dark:text-brand-300">
                    Observation (I)
                  </th>
                  {tableDensity === 'DETAILED' && (
                    <>
                      <th className="py-2.5 px-3 text-right bg-brand-50/40 dark:bg-brand-950/20 text-brand-800 dark:text-brand-300">
                        Aux Load (ΔL)
                      </th>
                      <th className="py-2.5 px-3 text-right">True Load (P)</th>
                      <th className="py-2.5 px-3 text-right">Error (E)</th>
                      <th className="py-2.5 px-3 text-right">Zero Shift (E₀)</th>
                    </>
                  )}
                  <th className="py-2.5 px-3 text-right text-brand-700 dark:text-brand-300 font-bold">
                    Calculated Error (Ec)
                  </th>
                  <th className="py-2.5 px-3 text-right">Legal MPE Limit</th>
                  <th className="py-2.5 px-3 text-center">Verdict</th>
                  <th className="py-2.5 px-3 text-center w-20">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {computedRows.map((row, idx) => {
                  const isSelected = selectedTraceRow?.id === row.id;
                  const isTrapRow = isRoundingTrapActive && row.step === 7;
                  const isFailRow = row.status === 'FAIL' && !isTrapRow;
                  const isDirectionTransition =
                    idx > 0 &&
                    computedRows[idx - 1].direction === 'ASCENDING' &&
                    row.direction === 'DESCENDING';
                  const isSupplementaryTransition =
                    idx > 0 &&
                    computedRows[idx - 1].isZeroPoint &&
                    row.targetLoad > 0;

                  return (
                    <tr
                      key={row.id}
                      className={`transition-colors ${
                        isTrapRow
                          ? 'bg-amber-500/[0.08] dark:bg-amber-500/[0.12] border-y border-amber-500/40 font-semibold border-l-4 border-l-amber-500'
                          : isFailRow
                          ? 'bg-rose-500/[0.06] dark:bg-rose-500/[0.10] border-y border-rose-500/40 font-semibold border-l-4 border-l-rose-500'
                          : isSelected
                          ? 'bg-brand-50/60 dark:bg-brand-950/30 border-l-4 border-l-brand-500'
                          : idx % 2 === 0
                          ? 'bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                          : 'bg-slate-50/40 dark:bg-slate-900/20 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      } ${
                        isDirectionTransition
                          ? 'border-t-2 border-t-purple-400/50 dark:border-t-purple-500/50'
                          : isSupplementaryTransition
                          ? 'border-t-2 border-t-sky-400/50 dark:border-t-sky-500/50'
                          : ''
                      }`}
                    >
                      {/* Step Index & Indicator */}
                      <td className="py-2 px-3 text-center font-semibold">
                        <span className="flex items-center justify-center gap-1.5">
                          {row.step}
                          {isTrapRow && (
                            <span
                              className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 shadow-xs"
                              title="Rounding Trap: Naive I - L says PASS (0.0 g), but true unrounded changeover P = 9,994.7 g produces Ec = -5.3 g (statutory FAIL)"
                            >
                              Trap
                            </span>
                          )}
                          {isFailRow && (
                            <span
                              className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-500/30 shadow-xs"
                              title={`Statutory Breach: Corrected error (${row.correctedError?.toFixed(1)} g) exceeds Table 6 MPE (±${row.mpeLimit?.toFixed(1)} g)`}
                            >
                              FAIL
                            </span>
                          )}
                          {row.isZeroPoint && (
                            <span
                              className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-sky-500/20 text-sky-800 dark:text-sky-300 border border-sky-500/30 shadow-xs"
                              title="Zero Return Reference Point (Clause A.4.4.2: Zero drift must not exceed 0.5e)"
                            >
                              Zero
                            </span>
                          )}
                        </span>
                      </td>

                      {/* Direction */}
                      <td className="py-2 px-3">
                        {row.direction === 'ASCENDING' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-sky-700 dark:text-sky-400 font-medium">
                            <TrendingUp className="w-3 h-3" />
                            Asc
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 text-[11px] text-purple-700 dark:text-purple-400 font-medium"
                            title={isDirectionTransition ? "Phase Reversal: Unloading sequence starting from Max capacity down to zero (Clause A.4.4.1)" : undefined}
                          >
                            <TrendingDown className="w-3 h-3" />
                            Desc
                            {isDirectionTransition && (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-purple-500/20 text-purple-800 dark:text-purple-300 font-semibold border border-purple-500/30 ml-0.5">
                                Max
                              </span>
                            )}
                          </span>
                        )}
                      </td>

                      {/* Target Load L */}
                      <td className="py-2 px-3 text-right font-medium text-slate-800 dark:text-slate-200 tabular-nums">
                        {row.targetLoad.toLocaleString()} {unit === 'KILOGRAM' ? 'kg' : 'g'}
                      </td>

                      {/* Indication I (Editable Cell) */}
                      <td className="py-1 px-2 text-right bg-brand-50/20 dark:bg-brand-950/10">
                        <input
                          ref={(el) => {
                            inputRefs.current[`${idx}-indication`] = el;
                          }}
                          type="number"
                          step="any"
                          value={row.indication !== null ? row.indication : ''}
                          onChange={(eVal) => handleIndicationChange(row.id, eVal.target.value)}
                          onKeyDown={(eKey) => handleKeyDown(eKey, idx, 'indication')}
                          placeholder="—"
                          className={`w-24 px-2 py-1 text-right text-xs font-semibold font-mono rounded-md border text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none transition-all tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                            isTrapRow
                              ? 'border-amber-400 dark:border-amber-600 bg-amber-50/50 dark:bg-slate-900 shadow-xs'
                              : isFailRow
                              ? 'border-rose-400 dark:border-rose-600 bg-rose-50/30 dark:bg-slate-900 shadow-xs'
                              : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900'
                          }`}
                        />
                      </td>

                      {/* Detailed Calibration Parameters (Only in Detailed View) */}
                      {tableDensity === 'DETAILED' && (
                        <>
                          {/* Auxiliary Load Delta L (Editable Cell) */}
                          <td className="py-1 px-2 text-right bg-brand-50/20 dark:bg-brand-950/10">
                            <input
                              ref={(el) => {
                                inputRefs.current[`${idx}-auxiliaryLoad`] = el;
                              }}
                              type="number"
                              step="any"
                              value={row.auxiliaryLoad !== null ? row.auxiliaryLoad : ''}
                              onChange={(eVal) => handleAuxiliaryLoadChange(row.id, eVal.target.value)}
                              onKeyDown={(eKey) => handleKeyDown(eKey, idx, 'auxiliaryLoad')}
                              placeholder="—"
                              className={`w-20 px-2 py-1 text-right text-xs font-semibold font-mono rounded-md border text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none transition-all tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                                isTrapRow
                                  ? 'border-amber-400 dark:border-amber-600 bg-amber-50/50 dark:bg-slate-900 shadow-xs'
                                  : isFailRow
                                  ? 'border-rose-400 dark:border-rose-600 bg-rose-50/30 dark:bg-slate-900 shadow-xs'
                                  : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900'
                              }`}
                            />
                          </td>

                          {/* True Indication P */}
                          <td className="py-2 px-3 text-right font-medium text-slate-700 dark:text-slate-300 tabular-nums">
                            {row.trueIndication !== null ? row.trueIndication.toFixed(1) : '—'}
                          </td>

                          {/* Uncorrected Error E */}
                          <td className="py-2 px-3 text-right font-medium text-slate-600 dark:text-slate-400 tabular-nums">
                            {row.uncorrectedError !== null
                              ? `${row.uncorrectedError > 0 ? '+' : ''}${row.uncorrectedError.toFixed(1)}`
                              : '—'}
                          </td>

                          {/* Zero Error E0 */}
                          <td className="py-2 px-3 text-right text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                            {row.zeroError !== 0
                              ? `${row.zeroError > 0 ? '+' : ''}${row.zeroError.toFixed(1)}`
                              : '0.0'}
                          </td>
                        </>
                      )}

                      {/* Corrected Error Ec (Primary Legal Value) */}
                      <td className="py-2 px-3 text-right font-bold text-xs tabular-nums">
                        {row.correctedError !== null ? (
                          <span
                            className={
                              row.status === 'PASS'
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : row.status === 'MARGINAL'
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-rose-600 dark:text-rose-400'
                            }
                          >
                            {row.correctedError > 0 ? '+' : ''}
                            {row.correctedError.toFixed(1)} g
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>

                      {/* MPE Limit */}
                      <td className="py-2 px-3 text-right text-xs text-slate-500 dark:text-slate-400 tabular-nums whitespace-nowrap">
                        {row.mpeLimit !== null ? (
                          <span className="inline-flex items-center gap-1 font-mono">
                            <span>±{row.mpeLimit.toFixed(1)} g</span>
                            <span className="text-[11px] text-slate-400">({row.mpeInE})</span>
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-2 px-3 text-center">
                        <ComplianceBadge status={row.status} size="sm" />
                      </td>

                      {/* Trace Action Button */}
                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleOpenTrace(row)}
                          disabled={row.indication === null || row.auxiliaryLoad === null}
                          className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer inline-flex items-center justify-center gap-1 ${
                            isSelected
                              ? 'bg-brand-600 text-white shadow-xs'
                              : isTrapRow
                              ? 'text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-950/60 font-bold'
                              : isFailRow
                              ? 'text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-950/60 font-bold'
                              : 'text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/50 hover:underline'
                          } disabled:opacity-30 disabled:pointer-events-none`}
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer Actions & Export Bar */}
          <div className="px-5 py-3.5 border-t border-slate-200/80 dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60 dark:bg-slate-900/40">
            {computedRows.some((r) => r.status === 'FAIL') ? (
              <div className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2 font-medium">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>
                  <strong className="font-semibold text-rose-700 dark:text-rose-300">Non-compliant with OIML R 76-1:2006 (Clause A.4.4)</strong> — {computedRows.filter((r) => r.status === 'FAIL').length} point{computedRows.filter((r) => r.status === 'FAIL').length > 1 ? 's' : ''} exceed Table 6 MPE • Stage:{' '}
                  <span className="font-mono text-slate-700 dark:text-slate-300">
                    {stage === 'INITIAL_TYPE_APPROVAL' ? 'Initial verification (1.0×)' : 'In-service (2.0×)'}
                  </span>
                </span>
              </div>
            ) : (
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  Complies with <strong className="text-slate-700 dark:text-slate-300 font-semibold">OIML R 76-1:2006 (Clause A.4.4.3)</strong> — All points conform to Table 6 MPE • Stage:{' '}
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {stage === 'INITIAL_TYPE_APPROVAL' ? 'Initial verification (1.0×)' : 'In-service (2.0×)'}
                  </span>
                </span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download className="w-3.5 h-3.5" />}
                onClick={handleExportCSV}
                title="Download official laboratory RFC-4180 CSV observation ledger"
              >
                Export CSV
              </Button>
              <Button
                variant={isSavedFeedback ? 'secondary' : 'primary'}
                size="sm"
                leftIcon={isSavedFeedback ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : undefined}
                rightIcon={!isSavedFeedback ? <ChevronRight className="w-3.5 h-3.5" /> : undefined}
                onClick={handleSaveWorksheet}
              >
                {isSavedFeedback ? 'Worksheet Saved' : 'Save Worksheet'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Interactive "Inspect Calculation Trace" (Clause A.4.4.3 Formula Inspector) */}
      <Modal
        isOpen={isTraceModalOpen}
        onClose={() => setIsTraceModalOpen(false)}
        title="Calculation Trace"
        maxWidth="lg"
      >
        {traceDetails && (
          <div className="space-y-5 text-slate-800 dark:text-slate-100 font-sans">
            {/* Header Context Banner */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/[0.08]">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Test Point Observation Trace
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-50 mt-0.5">
                  Step {traceDetails.step} ({traceDetails.direction === 'ASCENDING' ? 'Ascending' : 'Descending'}) • Target Load L ={' '}
                  <span className="font-mono text-brand-600 dark:text-brand-400">
                    {traceDetails.load.toLocaleString()} {traceDetails.unit === 'KILOGRAM' ? 'kg' : 'g'}
                  </span>
                </h3>
              </div>

              <ComplianceBadge
                status={traceDetails.isCompliant ? 'PASS' : 'FAIL'}
                size="md"
              />
            </div>

            {/* Statutory Scenario & Discrepancy Alert Banners */}
            {isRoundingTrapActive && traceDetails.step === 7 && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs">
                <div className="flex items-center gap-2 font-bold mb-1 text-amber-800 dark:text-amber-300">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>OIML R 76-1 Statutory Rounding Trap Discrepancy</span>
                </div>
                <p className="leading-relaxed">
                  At Step 7 (10,000 g / 2000e), the scale displays <strong>10,000 g</strong>. A naive spreadsheet calculates <span className="font-mono font-semibold">I − L = 0.0 g (PASS)</span>. But with auxiliary turning point weight <span className="font-mono font-semibold">ΔL = 7.8 g</span>, true unrounded load is <span className="font-mono font-semibold">P = 9,994.7 g</span>, which produces <span className="font-mono font-bold text-rose-600 dark:text-rose-400">Ec = -5.3 g</span>, violating statutory <span className="font-mono font-semibold">±5.0 g</span> MPE!
                </p>
              </div>
            )}

            {!traceDetails.isCompliant && !(isRoundingTrapActive && traceDetails.step === 7) && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-900 dark:text-rose-200 text-xs">
                <div className="flex items-center gap-2 font-bold mb-1 text-rose-800 dark:text-rose-300">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>Statutory MPE Breach (Clause A.4.4 & Table 6)</span>
                </div>
                <p className="leading-relaxed">
                  The zero-offset corrected error (<span className="font-mono font-bold">|Ec| = {Math.abs(traceDetails.correctedError).toFixed(2)} g</span>) exceeds the Maximum Permissible Error (<span className="font-mono font-semibold">MPE = ±{traceDetails.mpeValue.toFixed(2)} g</span>) for accuracy class {accuracyClass}. The instrument fails verification at this test point.
                </p>
              </div>
            )}

            {/* Step-by-Step Mathematical Equations */}
            <div className="space-y-3">
              {/* Step 1: Digital Rounding Correction */}
              <div className="p-3.5 rounded-xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-slate-900/60">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
                  <span>1. Digital rounding correction (δ)</span>
                  <span className="font-mono text-slate-400">Clause A.4.4.3</span>
                </div>
                <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
                  δ = 0.5e − ΔL = 0.5 × {traceDetails.e} − {traceDetails.auxiliaryLoad} ={' '}
                  <span className="text-brand-600 dark:text-brand-400 font-bold">
                    {traceDetails.roundingCorrection > 0 ? '+' : ''}
                    {traceDetails.roundingCorrection.toFixed(2)} g
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Determines the analog changeover point before display transitions from I to I + e.
                </p>
              </div>

              {/* Step 2: Unrounded True Indication P */}
              <div className="p-3.5 rounded-xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-slate-900/60">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
                  <span>2. True analog indication (P)</span>
                  <span className="font-mono text-slate-400">P = I + 0.5e − ΔL</span>
                </div>
                <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
                  P = {traceDetails.indication} + ({traceDetails.roundingCorrection > 0 ? '+' : ''}
                  {traceDetails.roundingCorrection.toFixed(2)}) ={' '}
                  <span className="text-brand-600 dark:text-brand-400 font-bold">
                    {traceDetails.trueIndication.toFixed(2)} g
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Restores continuous precision by stripping the discrete digital quantization error.
                </p>
              </div>

              {/* Step 3: Raw Error of Indication E */}
              <div className="p-3.5 rounded-xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-slate-900/60">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
                  <span>3. Uncorrected indication error (E)</span>
                  <span className="font-mono text-slate-400">E = P − L</span>
                </div>
                <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
                  E = {traceDetails.trueIndication.toFixed(2)} − {traceDetails.load} ={' '}
                  <span className="text-brand-600 dark:text-brand-400 font-bold">
                    {traceDetails.uncorrectedError > 0 ? '+' : ''}
                    {traceDetails.uncorrectedError.toFixed(2)} g
                  </span>
                </div>
              </div>

              {/* Step 4: Corrected Error Ec */}
              <div className="p-3.5 rounded-xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-slate-900/60">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
                  <span>4. Zero-offset corrected error (Ec)</span>
                  <span className="font-mono text-slate-400">Ec = E − E₀</span>
                </div>
                <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Ec = ({traceDetails.uncorrectedError > 0 ? '+' : ''}
                  {traceDetails.uncorrectedError.toFixed(2)}) − ({traceDetails.zeroError > 0 ? '+' : ''}
                  {traceDetails.zeroError.toFixed(2)}) ={' '}
                  <span
                    className={
                      traceDetails.isCompliant
                        ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                        : 'text-rose-600 dark:text-rose-400 font-bold'
                    }
                  >
                    {traceDetails.correctedError > 0 ? '+' : ''}
                    {traceDetails.correctedError.toFixed(2)} g
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Eliminates zero-setting device residual error (E₀ = {traceDetails.zeroError.toFixed(2)} g) from the test point.
                </p>
              </div>

              {/* Step 5: Table 6 MPE Comparison & Safety Margin */}
              <div
                className={`p-3.5 rounded-xl border ${
                  traceDetails.isCompliant
                    ? 'border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-slate-900/60'
                    : 'border-rose-500/30 bg-rose-500/[0.03] dark:bg-rose-950/20'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
                  <span>5. Statutory tolerance evaluation</span>
                  <span className="font-mono text-slate-400">Table 6 ({traceDetails.bracketName})</span>
                </div>
                <div className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 flex-wrap">
                  <span>|Ec| = |{traceDetails.correctedError > 0 ? '+' : ''}{traceDetails.correctedError.toFixed(2)} g|</span>
                  <span className={traceDetails.isCompliant ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400 font-bold'}>
                    {traceDetails.isCompliant ? '≤' : '>'}
                  </span>
                  <span>|MPE| = {traceDetails.mpeValue.toFixed(2)} g ({traceDetails.mpeInE})</span>
                  {!traceDetails.isCompliant && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30">
                      BREACH
                    </span>
                  )}
                </div>
                <div className="mt-2.5 flex items-center justify-between text-xs pt-2.5 border-t border-slate-100 dark:border-slate-800 font-mono">
                  <span>{traceDetails.isCompliant ? 'Compliance Safety Margin:' : 'Statutory Breach Margin:'}</span>
                  <span
                    className={`font-bold ${
                      traceDetails.isCompliant
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {traceDetails.isCompliant
                      ? `+${traceDetails.margin.toFixed(2)} g (${traceDetails.marginPercentage.toFixed(1)}% buffer)`
                      : `${traceDetails.margin.toFixed(2)} g (Exceeds MPE by ${Math.abs(traceDetails.margin).toFixed(2)} g)`}
                  </span>
                </div>
              </div>
            </div>

            {/* Legal Metrology Statutory Citation */}
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-500 dark:text-slate-400 leading-relaxed border border-slate-200/60 dark:border-slate-700/60">
              <strong className="text-slate-700 dark:text-slate-300">Statutory Citation:</strong> {traceDetails.statutoryCitation}. Under Rule 13 of the Legal Metrology (General) Rules 2011, verification errors shall be computed by eliminating zero error using fractional test weights ΔL = 0.1d.
            </div>

            {/* Modal Close Button */}
            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => setIsTraceModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ObservationGrid;
