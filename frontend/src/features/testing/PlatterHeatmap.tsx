/**
 * METROLOGIX-76 — OIML R 76-1 Clause A.4.7 2D Dynamic Platter Deflection Heatmap
 *
 * Statutory References:
 * - OIML R 76-1:2006 Clause 3.6.2: Eccentric loading errors.
 * - OIML R 76-1:2006 Clause A.4.7: Eccentricity tests:
 *   * A.4.7.1: Platform instruments with <= 4 points of support:
 *     Test load = 1/3 (Max + Additive Tare).
 *     Placement: Center (Pos 1) -> Front-Left (Pos 2) -> Back-Left (Pos 3) ->
 *                Back-Right (Pos 4) -> Front-Right (Pos 5).
 *   * A.4.7.2: Platform instruments with > 4 points of support:
 *     Test load = 1 / (N - 1) * (Max + Additive Tare).
 *   * A.4.7.4: Rolling load test on track / weighbridges: Test load = 0.8 Max.
 * - Legal Metrology (General) Rules, 2011, Seventh Schedule, Heading A, Para 9(1)(b):
 *   "The maximum permissible errors on eccentricity tests shall be the maximum permissible
 *    errors on initial verification for that load."
 *
 * Zero-Bug Rules:
 * 1. Coordinates and load assignments strictly adhere to OIML R 76-1 Clause A.4.7.
 * 2. Visual test gate: Setting Front-Right quadrant to fail immediately turns that
 *    corner crimson red, shows an alert badge, and redirects the deflection vector.
 * 3. Dynamic color coding:
 *    - Emerald (< 50% MPE)
 *    - Amber (50% - 100% MPE)
 *    - Crimson (> 100% MPE)
 * 4. Pure client-side lossless calculation matching backend changeover formulas:
 *    P = I + 0.5e - ΔL, E = P - L, Ec = E - E0.
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Crosshair,
  AlertTriangle,
  CheckCircle2,
  Check,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Layers,
  Activity,
  Compass,
  SlidersHorizontal,
  ShieldCheck,
  Scale,
  Download,
  Edit3,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { ComplianceBadge } from '../../components/ui/ComplianceBadge';
import { Modal } from '../../components/ui/Modal';
import { useScenario } from '../../context/ScenarioContext';
import { DemoScenarioSelector } from './DemoScenarioSelector';
import type {
  AccuracyClass,
  UnitOfMeasure,
  VerificationStage,
  CornerPosition,
  PlatterGeometry,
  EccentricityObservation,
  EccentricitySummaryStats,
} from '../../types';

export interface PlatterHeatmapProps {
  initialAccuracyClass?: AccuracyClass;
  maxCapacity?: number;
  e?: number;
  d?: number;
  unit?: UnitOfMeasure;
  stage?: VerificationStage;
  numSupports?: number;
  initialGeometry?: PlatterGeometry;
  onSaveResults?: (observations: EccentricityObservation[]) => void;
  className?: string;
}

export const PlatterHeatmap: React.FC<PlatterHeatmapProps> = ({
  initialAccuracyClass = 'CLASS_III',
  maxCapacity = 30000,
  e = 5,
  d = 5,
  unit = 'GRAM',
  stage = 'INITIAL_TYPE_APPROVAL',
  numSupports = 4,
  initialGeometry = 'RECTANGLE',
  onSaveResults,
  className = '',
}) => {
  // Verification Stage & Geometry
  const [currentStage, setCurrentStage] = useState<VerificationStage>(stage);
  const [geometry, setGeometry] = useState<PlatterGeometry>(initialGeometry);
  const [supports, setSupports] = useState<number>(numSupports);
  const [isSavedFeedback, setIsSavedFeedback] = useState(false);

  // Active & Hovered Quadrants for Inspection/Editing
  const [selectedPosition, setSelectedPosition] = useState<CornerPosition | null>(null);
  const [hoveredPosition, setHoveredPosition] = useState<CornerPosition | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showAuditTable, setShowAuditTable] = useState(false);
  const [isExportingCSV, setIsExportingCSV] = useState(false);

  // Form edit states
  const [editIndication, setEditIndication] = useState<string>('');
  const [editAuxLoad, setEditAuxLoad] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');

  // Zero Reference Error (E0) observed at zero load
  const [zeroError, setZeroError] = useState<number>(0.0);

  // Stage multiplier: Initial = 1.0x, In-Service = 2.0x (Clause 3.5.2)
  const stageMultiplier = currentStage === 'INITIAL_TYPE_APPROVAL' ? 1.0 : 2.0;

  // Prescribed Statutory Test Load (OIML R 76-1 Clause A.4.7)
  const targetTestLoad = useMemo(() => {
    if (geometry === 'WEIGHBRIDGE_TRACK') {
      // Clause A.4.7.4: Rolling load = 0.8 Max
      return Math.round(maxCapacity * 0.8);
    }
    if (supports > 4) {
      // Clause A.4.7.2: 1 / (N - 1) * Max
      return Math.round(maxCapacity / (supports - 1));
    }
    // Clause A.4.7.1: 1/3 Max
    return Math.round(maxCapacity / 3);
  }, [maxCapacity, supports, geometry]);

  // Statutory Table 6 MPE at target test load
  const table6Mpe = useMemo(() => {
    const m = e > 0 ? targetTestLoad / e : 2000;
    let baseMpeInE = 1.0;

    if (initialAccuracyClass === 'CLASS_I') {
      if (m <= 50000) baseMpeInE = 0.5;
      else if (m <= 200000) baseMpeInE = 1.0;
      else baseMpeInE = 1.5;
    } else if (initialAccuracyClass === 'CLASS_II') {
      if (m <= 5000) baseMpeInE = 0.5;
      else if (m <= 20000) baseMpeInE = 1.0;
      else baseMpeInE = 1.5;
    } else if (initialAccuracyClass === 'CLASS_III') {
      if (m <= 500) baseMpeInE = 0.5;
      else if (m <= 2000) baseMpeInE = 1.0;
      else baseMpeInE = 1.5;
    } else {
      // CLASS_IIII
      if (m <= 50) baseMpeInE = 0.5;
      else if (m <= 200) baseMpeInE = 1.0;
      else baseMpeInE = 1.5;
    }

    const effectiveMpeInE = baseMpeInE * stageMultiplier;
    return {
      mpeInE: `±${effectiveMpeInE.toFixed(1)}e`,
      mpeValue: effectiveMpeInE * e,
      factor: effectiveMpeInE,
    };
  }, [targetTestLoad, e, initialAccuracyClass, stageMultiplier]);

  // Standard Initial 5-Point Eccentricity Observations
  const [readings, setReadings] = useState<{
    [key in CornerPosition]: {
      indication: number | null;
      auxiliaryLoad: number | null;
      notes?: string;
    };
  }>({
    CENTER: { indication: targetTestLoad, auxiliaryLoad: 2.5, notes: 'Position 1: Geometric center reference' },
    FRONT_LEFT: { indication: targetTestLoad, auxiliaryLoad: 2.3, notes: 'Position 2: Front-Left quadrant' },
    BACK_LEFT: { indication: targetTestLoad, auxiliaryLoad: 2.6, notes: 'Position 3: Back-Left quadrant' },
    BACK_RIGHT: { indication: targetTestLoad, auxiliaryLoad: 2.4, notes: 'Position 4: Back-Right quadrant' },
    FRONT_RIGHT: { indication: targetTestLoad, auxiliaryLoad: 2.5, notes: 'Position 5: Front-Right quadrant' },
  });

  const { activeScenario } = useScenario();

  // Sync eccentricity observations when synthetic scenario is loaded
  useEffect(() => {
    if (
      activeScenario &&
      activeScenario.eccentricity_observations &&
      activeScenario.eccentricity_observations.length > 0
    ) {
      const newReadings: Record<string, { indication: number | null; auxiliaryLoad: number | null; notes?: string }> = {};
      for (const corner of activeScenario.eccentricity_observations) {
        newReadings[corner.position] = {
          indication: corner.indication,
          auxiliaryLoad: corner.auxiliary_load,
          notes: corner.notes || undefined,
        };
      }
      setReadings((prev) => ({ ...prev, ...(newReadings as any) }));
    }
  }, [activeScenario]);

  // Calculate full metrological observation data for all 5 quadrants
  const observations: EccentricityObservation[] = useMemo(() => {
    const positions: Array<{ pos: CornerPosition; num: number; label: string }> = [
      { pos: 'CENTER', num: 1, label: 'Center (Pos 1)' },
      { pos: 'FRONT_LEFT', num: 2, label: 'Front-Left (Pos 2)' },
      { pos: 'BACK_LEFT', num: 3, label: 'Back-Left (Pos 3)' },
      { pos: 'BACK_RIGHT', num: 4, label: 'Back-Right (Pos 4)' },
      { pos: 'FRONT_RIGHT', num: 5, label: 'Front-Right (Pos 5)' },
    ];

    return positions.map(({ pos, num, label }) => {
      const data = readings[pos];
      const I = data.indication;
      const auxL = data.auxiliaryLoad;

      if (I === null || auxL === null) {
        return {
          position: pos,
          positionNumber: num,
          label,
          targetLoad: targetTestLoad,
          indication: null,
          auxiliaryLoad: null,
          trueIndication: null,
          uncorrectedError: null,
          zeroError,
          correctedError: null,
          mpeLimit: table6Mpe.mpeValue,
          mpeInE: table6Mpe.mpeInE,
          margin: null,
          status: 'PENDING',
          notes: data.notes,
        };
      }

      // Clause A.4.4.3 changeover point: P = I + 0.5e - ΔL
      const P = I + 0.5 * e - auxL;
      const E = P - targetTestLoad;
      const Ec = E - zeroError;
      const absEc = Math.abs(Ec);
      const isPass = absEc <= table6Mpe.mpeValue + 1e-9;
      const isMarginal = isPass && absEc >= 0.75 * table6Mpe.mpeValue;
      const margin = table6Mpe.mpeValue - absEc;

      return {
        position: pos,
        positionNumber: num,
        label,
        targetLoad: targetTestLoad,
        indication: I,
        auxiliaryLoad: auxL,
        trueIndication: P,
        uncorrectedError: E,
        zeroError,
        correctedError: Ec,
        mpeLimit: table6Mpe.mpeValue,
        mpeInE: table6Mpe.mpeInE,
        margin,
        status: isPass ? (isMarginal ? 'MARGINAL' : 'PASS') : 'FAIL',
        notes: data.notes,
      };
    });
  }, [readings, targetTestLoad, zeroError, e, table6Mpe]);

  // Comprehensive Summary Statistics & Deflection Vector Physics
  const stats: EccentricitySummaryStats = useMemo(() => {
    const evaluated = observations.filter((o) => o.correctedError !== null);
    if (evaluated.length === 0) {
      return {
        overallStatus: 'PENDING',
        maxAbsoluteError: 0,
        interCornerSpread: 0,
        mpeLimit: table6Mpe.mpeValue,
        dominantQuadrant: null,
        deflectionAngle: null,
        deflectionMagnitude: 0,
      };
    }

    const errors = evaluated.map((o) => o.correctedError ?? 0);
    const absErrors = evaluated.map((o) => Math.abs(o.correctedError ?? 0));
    const maxAbs = Math.max(...absErrors);
    const minErr = Math.min(...errors);
    const maxErr = Math.max(...errors);
    const interCornerSpread = maxErr - minErr;

    const hasFail = evaluated.some((o) => o.status === 'FAIL');
    const hasMarginal = evaluated.some((o) => o.status === 'MARGINAL');
    const overallStatus = hasFail ? 'FAIL' : hasMarginal ? 'MARGINAL' : 'PASS';

    // Deflection Vector Calculation: Center of Error Moment
    // Map quadrants to unit directional vectors from center (0,0):
    // FL (Pos 2): (-1, +1) -> 135 deg (SW)
    // RL (Pos 3): (-1, -1) -> 225 deg (NW)
    // RR (Pos 4): (+1, -1) -> 315 deg (NE)
    // FR (Pos 5): (+1, +1) -> 45 deg (SE)
    let vx = 0;
    let vy = 0;
    let maxCornerDev = -1;
    let dominantQuad: CornerPosition | null = null;

    observations.forEach((o) => {
      const err = o.correctedError ?? 0;
      const absVal = Math.abs(err);
      if (absVal > maxCornerDev && o.position !== 'CENTER') {
        maxCornerDev = absVal;
        dominantQuad = o.position;
      }

      if (o.position === 'FRONT_LEFT') {
        vx -= err * 0.7071;
        vy += err * 0.7071;
      } else if (o.position === 'BACK_LEFT') {
        vx -= err * 0.7071;
        vy -= err * 0.7071;
      } else if (o.position === 'BACK_RIGHT') {
        vx += err * 0.7071;
        vy -= err * 0.7071;
      } else if (o.position === 'FRONT_RIGHT') {
        vx += err * 0.7071;
        vy += err * 0.7071;
      }
    });

    const mag = Math.sqrt(vx * vx + vy * vy);
    let angle: number | null = null;
    if (mag > 0.001) {
      // Angle in degrees clockwise from standard top/north
      const rad = Math.atan2(vx, -vy);
      angle = (rad * 180) / Math.PI;
      if (angle < 0) angle += 360;
    }

    return {
      overallStatus,
      maxAbsoluteError: maxAbs,
      interCornerSpread,
      mpeLimit: table6Mpe.mpeValue,
      dominantQuadrant: dominantQuad,
      deflectionAngle: angle !== null ? Math.round(angle) : null,
      deflectionMagnitude: mag,
    };
  }, [observations, table6Mpe]);

  // Color generator based on error ratio |Ec| / MPE
  const getQuadrantColorStyle = useCallback((obs: EccentricityObservation) => {
    if (obs.correctedError === null || obs.indication === null) {
      return {
        fill: 'fill-slate-100/70 dark:fill-slate-800/40',
        stroke: 'stroke-slate-300 dark:stroke-slate-700',
        glowColor: 'transparent',
        badgeClass: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
        ratio: 0,
      };
    }

    const ratio = Math.abs(obs.correctedError) / (obs.mpeLimit || 1);

    if (obs.status === 'FAIL' || ratio > 1.0) {
      // Crimson Red Alert
      return {
        fill: 'fill-rose-500/35 dark:fill-rose-950/70',
        stroke: 'stroke-rose-500',
        strokeWidth: 3,
        glowColor: 'rgba(244, 63, 94, 0.65)',
        badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200 border-rose-300',
        ratio,
        isFlashing: true,
      };
    }

    if (ratio >= 0.50) {
      // Amber Warning (approaching MPE limit)
      return {
        fill: 'fill-amber-500/25 dark:fill-amber-950/50',
        stroke: 'stroke-amber-500',
        strokeWidth: 2.5,
        glowColor: 'rgba(245, 158, 11, 0.45)',
        badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 border-amber-300',
        ratio,
        isFlashing: false,
      };
    }

    // Emerald Green Compliant (< 50% MPE)
    return {
      fill: 'fill-emerald-500/20 dark:fill-emerald-950/45',
      stroke: 'stroke-emerald-500',
      strokeWidth: 2,
      glowColor: 'rgba(16, 185, 129, 0.35)',
      badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border-emerald-300',
      ratio,
      isFlashing: false,
    };
  }, []);

  // Quick Action: Trigger Front-Right Failure (VERIFICATION TEST GATE)
  const handleTriggerFRFailure = () => {
    setReadings((prev) => ({
      ...prev,
      FRONT_RIGHT: {
        indication: targetTestLoad + 6, // Exceeds MPE
        auxiliaryLoad: 2.0,
        notes: 'Verification Gate Test Point: Severe corner torque deflection',
      },
    }));
  };

  // Quick Action: Prefill Compliant Standard Run
  const handlePrefillCompliant = () => {
    setReadings({
      CENTER: { indication: targetTestLoad, auxiliaryLoad: 2.5, notes: 'Center reference verified' },
      FRONT_LEFT: { indication: targetTestLoad, auxiliaryLoad: 2.3, notes: 'FL corner within ±0.1e' },
      BACK_LEFT: { indication: targetTestLoad, auxiliaryLoad: 2.6, notes: 'RL corner within ±0.2e' },
      BACK_RIGHT: { indication: targetTestLoad, auxiliaryLoad: 2.4, notes: 'RR corner within ±0.1e' },
      FRONT_RIGHT: { indication: targetTestLoad, auxiliaryLoad: 2.5, notes: 'FR corner within ±0.1e' },
    });
  };

  // Quick Action: Clear all readings
  const handleClearReadings = () => {
    setReadings({
      CENTER: { indication: null, auxiliaryLoad: null },
      FRONT_LEFT: { indication: null, auxiliaryLoad: null },
      BACK_LEFT: { indication: null, auxiliaryLoad: null },
      BACK_RIGHT: { indication: null, auxiliaryLoad: null },
      FRONT_RIGHT: { indication: null, auxiliaryLoad: null },
    });
  };

  // Save Action with feedback state
  const handleSaveClick = () => {
    if (onSaveResults) onSaveResults(observations);
    setIsSavedFeedback(true);
    setTimeout(() => setIsSavedFeedback(false), 2500);
  };

  // Export authentic RFC-4180 CSV laboratory observation ledger
  const handleExportCSV = useCallback(() => {
    setIsExportingCSV(true);
    const headers = [
      'Position Number',
      'Position Name',
      'Target Load (L) [g]',
      'Display Indication (I) [g]',
      'Auxiliary Load (dL) [g]',
      'Turning Point (P) [g]',
      'Uncorrected Error (E) [g]',
      'Zero Error (E0) [g]',
      'Corrected Error (Ec) [g]',
      'MPE Limit [g]',
      'Margin [g]',
      'Verdict',
      'Notes',
    ];

    const csvRows = observations.map((o) => [
      o.positionNumber,
      o.label,
      o.targetLoad,
      o.indication !== null ? o.indication : '',
      o.auxiliaryLoad !== null ? o.auxiliaryLoad : '',
      o.trueIndication !== null ? o.trueIndication.toFixed(2) : '',
      o.uncorrectedError !== null ? o.uncorrectedError.toFixed(2) : '',
      o.zeroError !== null ? o.zeroError.toFixed(2) : '0.00',
      o.correctedError !== null ? o.correctedError.toFixed(2) : '',
      o.mpeLimit !== null ? `±${o.mpeLimit.toFixed(2)} (${o.mpeInE})` : '',
      o.margin !== null ? o.margin.toFixed(2) : '',
      o.status,
      o.notes ? `"${o.notes.replace(/"/g, '""')}"` : '',
    ]);

    const csvContent = [
      headers.join(','),
      ...csvRows.map((row) =>
        row
          .map((cell) => {
            const str = String(cell);
            return str.includes(',') && !str.startsWith('"') ? `"${str}"` : str;
          })
          .join(',')
      ),
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const today = new Date().toISOString().split('T')[0];
    link.href = url;
    link.setAttribute('download', `OIML_R76_Eccentricity_Observations_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setTimeout(() => setIsExportingCSV(false), 800);
  }, [observations]);

  // Open modal editor for selected quadrant
  const handleOpenQuadrantEditor = (pos: CornerPosition) => {
    const current = readings[pos];
    setSelectedPosition(pos);
    setEditIndication(current.indication !== null ? String(current.indication) : '');
    setEditAuxLoad(current.auxiliaryLoad !== null ? String(current.auxiliaryLoad) : '');
    setEditNotes(current.notes || '');
    setIsEditModalOpen(true);
  };

  // Save quadrant modal edit
  const handleSaveQuadrant = () => {
    if (!selectedPosition) return;
    const parsedIndication = editIndication.trim() === '' ? null : parseFloat(editIndication);
    const parsedAuxLoad = editAuxLoad.trim() === '' ? null : parseFloat(editAuxLoad);

    setReadings((prev) => ({
      ...prev,
      [selectedPosition]: {
        indication: parsedIndication,
        auxiliaryLoad: parsedAuxLoad,
        notes: editNotes.trim(),
      },
    }));

    setIsEditModalOpen(false);
  };

  // Active observation for modal
  const activeModalObs = useMemo(() => {
    if (!selectedPosition) return null;
    return observations.find((o) => o.position === selectedPosition) || null;
  }, [selectedPosition, observations]);

  // Canvas dimensions
  const svgWidth = 640;
  const svgHeight = 520;
  const cx = 320;
  const cy = 260;

  // Deflection arrow vector endpoint (emanating outward from center reference zone)
  const vectorEndpoint = useMemo(() => {
    if (!stats.deflectionAngle || stats.deflectionMagnitude < 0.05) return null;
    const rStart = 68; // Outer edge of center circle
    const normMag = Math.min(stats.deflectionMagnitude / (table6Mpe.mpeValue || 1), 2.0);
    const len = Math.min(105, Math.max(42, normMag * 60));

    const rad = ((stats.deflectionAngle - 90) * Math.PI) / 180;
    const x1 = cx + Math.cos(rad) * rStart;
    const y1 = cy + Math.sin(rad) * rStart;
    const x2 = cx + Math.cos(rad) * (rStart + len);
    const y2 = cy + Math.sin(rad) * (rStart + len);
    const tagDist = rStart + len + 18;
    const tagX = Math.min(svgWidth - 50, Math.max(50, cx + Math.cos(rad) * tagDist));
    const tagY = Math.min(svgHeight - 25, Math.max(30, cy + Math.sin(rad) * tagDist));

    return {
      x1,
      y1,
      x2,
      y2,
      tagX,
      tagY,
      angle: stats.deflectionAngle,
      length: len,
    };
  }, [stats, cx, cy, table6Mpe, svgWidth, svgHeight]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 1-Click Synthetic Metrological Edge-Case Generator (Step 26 Deliverable) */}
      <DemoScenarioSelector />

      {/* Top Header & Context Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200/80 pb-5 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              CLAUSE A.4.7 ECCENTRICITY
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Load L ={' '}
              <strong className="text-slate-800 dark:text-slate-200">
                {(targetTestLoad / 1000).toFixed(1)} kg
              </strong>{' '}
              ({geometry === 'WEIGHBRIDGE_TRACK' ? '0.8 Max' : supports > 4 ? `1/(${supports}-1) Max` : '⅓ Max'})
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2.5 mt-1 font-sans">
            <Crosshair className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            Platter Deflection Heatmap
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Clause A.4.7 Eccentricity &amp; Corner Loading Verification
          </p>
        </div>

        {/* Toolbar: Geometry, Stage, Presets */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Geometry Switcher */}
          <div className="flex items-center rounded-lg border border-slate-200/90 dark:border-white/[0.08] bg-slate-100/80 dark:bg-[#101828] p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setGeometry('RECTANGLE')}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                geometry === 'RECTANGLE'
                  ? 'bg-white dark:bg-[#172136] text-brand-600 dark:text-brand-300 shadow-xs font-bold border border-slate-200/60 dark:border-white/[0.08]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Rectangle
            </button>
            <button
              type="button"
              onClick={() => setGeometry('CIRCLE')}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                geometry === 'CIRCLE'
                  ? 'bg-white dark:bg-[#172136] text-brand-600 dark:text-brand-300 shadow-xs font-bold border border-slate-200/60 dark:border-white/[0.08]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Circular Pan
            </button>
            <button
              type="button"
              onClick={() => setGeometry('WEIGHBRIDGE_TRACK')}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                geometry === 'WEIGHBRIDGE_TRACK'
                  ? 'bg-white dark:bg-[#172136] text-brand-600 dark:text-brand-300 shadow-xs font-bold border border-slate-200/60 dark:border-white/[0.08]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Weighbridge Track
            </button>
          </div>

          {/* Stage Switcher */}
          <div className="flex items-center rounded-lg border border-slate-200/90 dark:border-white/[0.08] bg-slate-100/80 dark:bg-[#101828] p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setCurrentStage('INITIAL_TYPE_APPROVAL')}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                currentStage === 'INITIAL_TYPE_APPROVAL'
                  ? 'bg-white dark:bg-[#172136] text-brand-600 dark:text-brand-300 shadow-xs font-bold border border-slate-200/60 dark:border-white/[0.08]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Initial (1.0×)
            </button>
            <button
              type="button"
              onClick={() => setCurrentStage('IN_SERVICE_INSPECTION')}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                currentStage === 'IN_SERVICE_INSPECTION'
                  ? 'bg-white dark:bg-[#172136] text-brand-600 dark:text-brand-300 shadow-xs font-bold border border-slate-200/60 dark:border-white/[0.08]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              In-Service (2.0×)
            </button>
          </div>

          {/* Supports Switcher for Multi-Support Platforms */}
          {geometry !== 'WEIGHBRIDGE_TRACK' && (
            <div className="flex items-center rounded-lg border border-slate-200/90 dark:border-white/[0.08] bg-slate-100/80 dark:bg-[#101828] p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setSupports(4)}
                className={`px-2 py-1 rounded transition-all cursor-pointer ${
                  supports === 4
                    ? 'bg-white dark:bg-[#172136] text-brand-600 dark:text-brand-300 shadow-xs font-bold border border-slate-200/60 dark:border-white/[0.08]'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
                title="4 Support Points: Test Load L = 1/3 Max"
              >
                N=4 (⅓ Max)
              </button>
              <button
                type="button"
                onClick={() => setSupports(6)}
                className={`px-2 py-1 rounded transition-all cursor-pointer ${
                  supports === 6
                    ? 'bg-white dark:bg-[#172136] text-brand-600 dark:text-brand-300 shadow-xs font-bold border border-slate-200/60 dark:border-white/[0.08]'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
                title="6 Support Points: Test Load L = 1/5 Max"
              >
                N=6 (⅕ Max)
              </button>
            </div>
          )}

          {/* Verification Test Gate Preset */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleTriggerFRFailure}
            className="border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-950/40"
            title="Triggers Verification Test Gate by setting Front-Right quadrant to fail"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1 text-rose-500" />
            Fail FR (Test Gate)
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handlePrefillCompliant}
            title="Prefill all 5 quadrants with compliant readings"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Prefill All
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleClearReadings}
          >
            Clear
          </Button>

          <Button
            variant={isSavedFeedback ? 'secondary' : 'primary'}
            size="sm"
            onClick={handleSaveClick}
            leftIcon={isSavedFeedback ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Download className="w-3.5 h-3.5" />}
            title="Save Clause A.4.7 Eccentricity Results to Audit Ledger"
          >
            {isSavedFeedback ? 'Saved to Ledger' : 'Save Results'}
          </Button>
        </div>
      </div>

      {/* Summary KPI Diagnostics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Card 1: Statutory Verdict */}
        <div
          className={`flex flex-col justify-between p-3.5 sm:p-4 rounded-xl border transition-all ${
            stats.overallStatus === 'PASS'
              ? 'border-emerald-500/40 dark:border-emerald-500/30 bg-emerald-500/[0.03] dark:bg-emerald-500/[0.06]'
              : 'border-rose-500/40 dark:border-rose-500/30 bg-rose-500/[0.04] dark:bg-rose-500/[0.08]'
          }`}
        >
          <div className="flex items-center justify-between gap-1">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Verdict
            </span>
            <div className={`p-1 rounded-md ${stats.overallStatus === 'PASS' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
              {stats.overallStatus === 'PASS' ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5" />
              )}
            </div>
          </div>
          <div className="my-2">
            <span
              className={`text-xl sm:text-2xl font-bold font-mono tracking-tight ${
                stats.overallStatus === 'PASS'
                  ? 'text-emerald-700 dark:text-emerald-300'
                  : 'text-rose-700 dark:text-rose-300'
              }`}
            >
              {stats.overallStatus}
            </span>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] text-[11px] text-slate-500 dark:text-slate-400">
            {stats.overallStatus === 'PASS' ? 'Clause A.4.7 • Conforms' : 'Clause A.4.7 • Out of MPE'}
          </div>
        </div>

        {/* Card 2: Max Corner Error */}
        <div
          className={`flex flex-col justify-between p-3.5 sm:p-4 rounded-xl border bg-white dark:bg-[#0c121e] transition-all ${
            stats.maxAbsoluteError <= table6Mpe.mpeValue
              ? 'border-slate-200/90 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
              : 'border-rose-500/40 dark:border-rose-500/30 bg-rose-500/[0.03] dark:bg-rose-500/[0.06]'
          }`}
        >
          <div className="flex items-center justify-between gap-1">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Max Error
            </span>
            <div className="p-1 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Scale className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="my-2">
            <span
              className={`text-xl sm:text-2xl font-bold font-mono tracking-tight tabular-nums ${
                stats.maxAbsoluteError <= table6Mpe.mpeValue
                  ? 'text-slate-900 dark:text-slate-50'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              ±{stats.maxAbsoluteError.toFixed(2)} g
            </span>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] text-[11px] text-slate-500 dark:text-slate-400">
            Allowable: {table6Mpe.mpeInE} (±{table6Mpe.mpeValue.toFixed(1)}g)
          </div>
        </div>

        {/* Card 3: Inter-Corner Spread */}
        <div className="flex flex-col justify-between p-3.5 sm:p-4 rounded-xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#0c121e] hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Corner Spread
            </span>
            <div className="p-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="my-2">
            <span className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-50 tabular-nums">
              {stats.interCornerSpread.toFixed(2)} g
            </span>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] text-[11px] text-slate-500 dark:text-slate-400">
            max(Ec) − min(Ec) (≤ 1.0 MPE)
          </div>
        </div>

        {/* Card 4: Dominant Deflection */}
        <div className="flex flex-col justify-between p-3.5 sm:p-4 rounded-xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#0c121e] hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Dominant Vector
            </span>
            <div className="p-1 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <Compass className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="my-2">
            <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 uppercase truncate block">
              {stats.dominantQuadrant ? stats.dominantQuadrant.replace('_', ' ') : 'Balanced'}
            </span>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] text-[11px] text-slate-500 dark:text-slate-400">
            {stats.deflectionAngle !== null ? `${stats.deflectionAngle}° Vector Angle` : 'Zero Tilt Bias'}
          </div>
        </div>

        {/* Card 5: Corner Test Load */}
        <div className="flex flex-col justify-between p-3.5 sm:p-4 rounded-xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#0c121e] hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Test Load
            </span>
            <div className="p-1 rounded-md bg-brand-500/10 text-brand-600 dark:text-brand-400">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="my-2">
            <span className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-50 tabular-nums">
              {(targetTestLoad / 1000).toFixed(1)} kg
            </span>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] text-[11px] text-slate-500 dark:text-slate-400">
            {geometry === 'WEIGHBRIDGE_TRACK' ? '0.8 Max' : supports > 4 ? '1/(N-1) Max' : '⅓ Max'} • e = {e}g (d = {d}g)
          </div>
        </div>

        {/* Card 6: Supports / Mounts */}
        <div className="flex flex-col justify-between p-3.5 sm:p-4 rounded-xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#0c121e] hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Load Points
            </span>
            <div className="p-1 rounded-md bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Activity className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="my-2">
            <span className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-50 tabular-nums">
              {supports} Points
            </span>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] text-[11px] text-slate-500 dark:text-slate-400">
            {geometry === 'WEIGHBRIDGE_TRACK' ? 'Rolling Axle Track' : 'Cantilever Platter'}
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive 2D Heatmap SVG & Quadrant Detail Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: SVG 2D Platter Deflection Canvas */}
        <div className="lg:col-span-7 rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0f1728] p-5 shadow-xs dark:shadow-card card-sheen relative overflow-hidden flex flex-col items-center">
          <div className="w-full flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.06] text-xs">
            <span className="font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-mono">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse" />
              Interactive Top-Down Load Receptor ({geometry})
            </span>
            <span className="text-slate-400 font-mono text-[11px]">
              Click any quadrant to edit/inspect
            </span>
          </div>

          <div className="relative w-full max-w-[560px] aspect-[640/520] select-none mt-2">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-full overflow-visible font-mono"
            >
              <defs>
                {/* Glow Filter for Failed or High Error Quadrants */}
                <filter id="errorGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="8" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>

                {/* Drop shadow filter */}
                <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.12" />
                </filter>

                {/* Arrowhead marker for deflection vector */}
                <marker
                  id="vectorArrowhead"
                  markerWidth="8"
                  markerHeight="8"
                  refX="6"
                  refY="4"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 8 4, 0 8"
                    className={stats.overallStatus === 'FAIL' ? 'fill-rose-500' : 'fill-purple-600 dark:fill-purple-400'}
                  />
                </marker>
              </defs>

              {/* Base Platter Outline (Rectangle Geometry) */}
              {geometry === 'RECTANGLE' && (
                <g>
                  {/* Outer Platter Shadow & Bevel */}
                  <rect
                    x="80"
                    y="40"
                    width="480"
                    height="440"
                    rx="20"
                    className="fill-slate-100/90 dark:fill-slate-800/60 stroke-slate-300 dark:stroke-slate-700"
                    strokeWidth="3"
                    filter="url(#cardShadow)"
                  />

                  {/* Corner Support Screws / Load Cell Pin Markers */}
                  {[
                    { x: 100, y: 60 },
                    { x: 540, y: 60 },
                    { x: 100, y: 460 },
                    { x: 540, y: 460 },
                  ].map((pin, i) => (
                    <g key={`pin-${i}`} className="opacity-60">
                      <circle cx={pin.x} cy={pin.y} r="8" className="fill-slate-300 dark:fill-slate-700 stroke-slate-400" />
                      <line x1={pin.x - 5} y1={pin.y} x2={pin.x + 5} y2={pin.y} stroke="#64748b" strokeWidth="1.5" />
                      <line x1={pin.x} y1={pin.y - 5} x2={pin.x} y2={pin.y + 5} stroke="#64748b" strokeWidth="1.5" />
                    </g>
                  ))}

                  {/* Metrological Geometric Axis Crosshairs (Clause A.4.7.1) */}
                  <line x1={cx} y1="45" x2={cx} y2="475" stroke="#94a3b8" strokeDasharray="4 4" strokeWidth="1" opacity="0.35" />
                  <line x1="85" y1={cy} x2="555" y2={cy} stroke="#94a3b8" strokeDasharray="4 4" strokeWidth="1" opacity="0.35" />

                  {/* Quadrant 3: Back-Left (RL) Top-Left */}
                  {(() => {
                    const obs = observations.find((o) => o.position === 'BACK_LEFT')!;
                    const style = getQuadrantColorStyle(obs);
                    const isHighlighted = hoveredPosition === 'BACK_LEFT' || selectedPosition === 'BACK_LEFT';
                    return (
                      <g
                        className="cursor-pointer transition-all hover:opacity-90"
                        onClick={() => handleOpenQuadrantEditor('BACK_LEFT')}
                        onMouseEnter={() => setHoveredPosition('BACK_LEFT')}
                        onMouseLeave={() => setHoveredPosition(null)}
                      >
                        <rect
                          x="95"
                          y="55"
                          width="215"
                          height="195"
                          rx="14"
                          className={`${style.fill} ${isHighlighted ? 'stroke-brand-500' : style.stroke}`}
                          strokeWidth={isHighlighted ? 3 : (style.strokeWidth || 2)}
                          filter={style.isFlashing ? 'url(#errorGlow)' : undefined}
                        />
                        <text x="115" y="85" className="text-xs font-bold font-mono fill-slate-700 dark:fill-slate-200">
                          Pos 3 • Rear-Left
                        </text>
                        <text x="115" y="108" className="text-[11px] font-mono fill-slate-500 dark:fill-slate-400">
                          L: {(targetTestLoad / 1000).toFixed(1)}kg
                        </text>
                        <text
                          x="115"
                          y="134"
                          className={`text-sm font-bold font-mono ${
                            obs.status === 'FAIL' ? 'fill-rose-600 dark:fill-rose-400' : 'fill-slate-900 dark:fill-slate-100'
                          }`}
                        >
                          Ec: {obs.correctedError !== null ? `${obs.correctedError > 0 ? '+' : ''}${obs.correctedError.toFixed(2)}g` : '—'}
                        </text>
                        {/* Status Badge Pill */}
                        <rect
                          x="240"
                          y="70"
                          width="50"
                          height="18"
                          rx="4"
                          className={obs.status === 'FAIL' ? 'fill-rose-500/20 stroke-rose-500/60' : 'fill-emerald-500/20 stroke-emerald-500/60'}
                          strokeWidth="1"
                        />
                        <text
                          x="265"
                          y="83"
                          textAnchor="middle"
                          className={`text-[10px] font-mono font-bold ${obs.status === 'FAIL' ? 'fill-rose-700 dark:fill-rose-300' : 'fill-emerald-700 dark:fill-emerald-300'}`}
                        >
                          {obs.status}
                        </text>
                      </g>
                    );
                  })()}

                  {/* Quadrant 4: Back-Right (RR) Top-Right */}
                  {(() => {
                    const obs = observations.find((o) => o.position === 'BACK_RIGHT')!;
                    const style = getQuadrantColorStyle(obs);
                    const isHighlighted = hoveredPosition === 'BACK_RIGHT' || selectedPosition === 'BACK_RIGHT';
                    return (
                      <g
                        className="cursor-pointer transition-all hover:opacity-90"
                        onClick={() => handleOpenQuadrantEditor('BACK_RIGHT')}
                        onMouseEnter={() => setHoveredPosition('BACK_RIGHT')}
                        onMouseLeave={() => setHoveredPosition(null)}
                      >
                        <rect
                          x="330"
                          y="55"
                          width="215"
                          height="195"
                          rx="14"
                          className={`${style.fill} ${isHighlighted ? 'stroke-brand-500' : style.stroke}`}
                          strokeWidth={isHighlighted ? 3 : (style.strokeWidth || 2)}
                          filter={style.isFlashing ? 'url(#errorGlow)' : undefined}
                        />
                        <text x="350" y="85" className="text-xs font-bold font-mono fill-slate-700 dark:fill-slate-200">
                          Pos 4 • Rear-Right
                        </text>
                        <text x="350" y="108" className="text-[11px] font-mono fill-slate-500 dark:fill-slate-400">
                          L: {(targetTestLoad / 1000).toFixed(1)}kg
                        </text>
                        <text
                          x="350"
                          y="134"
                          className={`text-sm font-bold font-mono ${
                            obs.status === 'FAIL' ? 'fill-rose-600 dark:fill-rose-400' : 'fill-slate-900 dark:fill-slate-100'
                          }`}
                        >
                          Ec: {obs.correctedError !== null ? `${obs.correctedError > 0 ? '+' : ''}${obs.correctedError.toFixed(2)}g` : '—'}
                        </text>
                        {/* Status Badge Pill */}
                        <rect
                          x="475"
                          y="70"
                          width="50"
                          height="18"
                          rx="4"
                          className={obs.status === 'FAIL' ? 'fill-rose-500/20 stroke-rose-500/60' : 'fill-emerald-500/20 stroke-emerald-500/60'}
                          strokeWidth="1"
                        />
                        <text
                          x="500"
                          y="83"
                          textAnchor="middle"
                          className={`text-[10px] font-mono font-bold ${obs.status === 'FAIL' ? 'fill-rose-700 dark:fill-rose-300' : 'fill-emerald-700 dark:fill-emerald-300'}`}
                        >
                          {obs.status}
                        </text>
                      </g>
                    );
                  })()}

                  {/* Quadrant 2: Front-Left (FL) Bottom-Left */}
                  {(() => {
                    const obs = observations.find((o) => o.position === 'FRONT_LEFT')!;
                    const style = getQuadrantColorStyle(obs);
                    const isHighlighted = hoveredPosition === 'FRONT_LEFT' || selectedPosition === 'FRONT_LEFT';
                    return (
                      <g
                        className="cursor-pointer transition-all hover:opacity-90"
                        onClick={() => handleOpenQuadrantEditor('FRONT_LEFT')}
                        onMouseEnter={() => setHoveredPosition('FRONT_LEFT')}
                        onMouseLeave={() => setHoveredPosition(null)}
                      >
                        <rect
                          x="95"
                          y="270"
                          width="215"
                          height="195"
                          rx="14"
                          className={`${style.fill} ${isHighlighted ? 'stroke-brand-500' : style.stroke}`}
                          strokeWidth={isHighlighted ? 3 : (style.strokeWidth || 2)}
                          filter={style.isFlashing ? 'url(#errorGlow)' : undefined}
                        />
                        <text x="115" y="398" className="text-xs font-bold font-mono fill-slate-700 dark:fill-slate-200">
                          Pos 2 • Front-Left
                        </text>
                        <text x="115" y="421" className="text-[11px] font-mono fill-slate-500 dark:fill-slate-400">
                          L: {(targetTestLoad / 1000).toFixed(1)}kg
                        </text>
                        <text
                          x="115"
                          y="447"
                          className={`text-sm font-bold font-mono ${
                            obs.status === 'FAIL' ? 'fill-rose-600 dark:fill-rose-400' : 'fill-slate-900 dark:fill-slate-100'
                          }`}
                        >
                          Ec: {obs.correctedError !== null ? `${obs.correctedError > 0 ? '+' : ''}${obs.correctedError.toFixed(2)}g` : '—'}
                        </text>
                        {/* Status Badge Pill */}
                        <rect
                          x="240"
                          y="432"
                          width="50"
                          height="18"
                          rx="4"
                          className={obs.status === 'FAIL' ? 'fill-rose-500/20 stroke-rose-500/60' : 'fill-emerald-500/20 stroke-emerald-500/60'}
                          strokeWidth="1"
                        />
                        <text
                          x="265"
                          y="445"
                          textAnchor="middle"
                          className={`text-[10px] font-mono font-bold ${obs.status === 'FAIL' ? 'fill-rose-700 dark:fill-rose-300' : 'fill-emerald-700 dark:fill-emerald-300'}`}
                        >
                          {obs.status}
                        </text>
                      </g>
                    );
                  })()}

                  {/* Quadrant 5: Front-Right (FR) Bottom-Right */}
                  {(() => {
                    const obs = observations.find((o) => o.position === 'FRONT_RIGHT')!;
                    const style = getQuadrantColorStyle(obs);
                    const isHighlighted = hoveredPosition === 'FRONT_RIGHT' || selectedPosition === 'FRONT_RIGHT';
                    return (
                      <g
                        className="cursor-pointer transition-all hover:opacity-90"
                        onClick={() => handleOpenQuadrantEditor('FRONT_RIGHT')}
                        onMouseEnter={() => setHoveredPosition('FRONT_RIGHT')}
                        onMouseLeave={() => setHoveredPosition(null)}
                      >
                        <rect
                          x="330"
                          y="270"
                          width="215"
                          height="195"
                          rx="14"
                          className={`${style.fill} ${isHighlighted ? 'stroke-brand-500' : style.stroke}`}
                          strokeWidth={isHighlighted ? 3 : (style.strokeWidth || 2)}
                          filter={style.isFlashing ? 'url(#errorGlow)' : undefined}
                        />
                        <text x="350" y="398" className="text-xs font-bold font-mono fill-slate-700 dark:fill-slate-200">
                          Pos 5 • Front-Right
                        </text>
                        <text x="350" y="421" className="text-[11px] font-mono fill-slate-500 dark:fill-slate-400">
                          L: {(targetTestLoad / 1000).toFixed(1)}kg
                        </text>
                        <text
                          x="350"
                          y="447"
                          className={`text-sm font-bold font-mono ${
                            obs.status === 'FAIL' ? 'fill-rose-600 dark:fill-rose-400' : 'fill-slate-900 dark:fill-slate-100'
                          }`}
                        >
                          Ec: {obs.correctedError !== null ? `${obs.correctedError > 0 ? '+' : ''}${obs.correctedError.toFixed(2)}g` : '—'}
                        </text>
                        {/* Status Badge Pill */}
                        <rect
                          x="475"
                          y="432"
                          width="50"
                          height="18"
                          rx="4"
                          className={obs.status === 'FAIL' ? 'fill-rose-500/20 stroke-rose-500/60' : 'fill-emerald-500/20 stroke-emerald-500/60'}
                          strokeWidth="1"
                        />
                        <text
                          x="500"
                          y="445"
                          textAnchor="middle"
                          className={`text-[10px] font-mono font-bold ${obs.status === 'FAIL' ? 'fill-rose-700 dark:fill-rose-300' : 'fill-emerald-700 dark:fill-emerald-300'}`}
                        >
                          {obs.status}
                        </text>
                      </g>
                    );
                  })()}
                </g>
              )}

              {/* Base Platter Outline (Circular Geometry) */}
              {geometry === 'CIRCLE' && (
                <g>
                  {/* Outer Circular Pan */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r="220"
                    className="fill-slate-100/90 dark:fill-slate-800/60 stroke-slate-300 dark:stroke-slate-700"
                    strokeWidth="3"
                    filter="url(#cardShadow)"
                  />

                  {/* 4 Annular Quadrant Wedges */}
                  {[
                    { pos: 'BACK_LEFT' as CornerPosition, startA: 180, endA: 270, label: 'RL (Pos 3)', tx: 190, ty: 150 },
                    { pos: 'BACK_RIGHT' as CornerPosition, startA: 270, endA: 360, label: 'RR (Pos 4)', tx: 420, ty: 150 },
                    { pos: 'FRONT_LEFT' as CornerPosition, startA: 90, endA: 180, label: 'FL (Pos 2)', tx: 190, ty: 370 },
                    { pos: 'FRONT_RIGHT' as CornerPosition, startA: 0, endA: 90, label: 'FR (Pos 5)', tx: 420, ty: 370 },
                  ].map((sec) => {
                    const obs = observations.find((o) => o.position === sec.pos)!;
                    const style = getQuadrantColorStyle(obs);
                    const isHighlighted = hoveredPosition === sec.pos || selectedPosition === sec.pos;
                    const rInner = 80;
                    const rOuter = 210;

                    const rad1 = (sec.startA * Math.PI) / 180;
                    const rad2 = (sec.endA * Math.PI) / 180;

                    const p1 = { x: cx + rInner * Math.cos(rad1), y: cy + rInner * Math.sin(rad1) };
                    const p2 = { x: cx + rOuter * Math.cos(rad1), y: cy + rOuter * Math.sin(rad1) };
                    const p3 = { x: cx + rOuter * Math.cos(rad2), y: cy + rOuter * Math.sin(rad2) };
                    const p4 = { x: cx + rInner * Math.cos(rad2), y: cy + rInner * Math.sin(rad2) };

                    const dPath = `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} A ${rOuter} ${rOuter} 0 0 1 ${p3.x} ${p3.y} L ${p4.x} ${p4.y} A ${rInner} ${rInner} 0 0 0 ${p1.x} ${p1.y} Z`;

                    return (
                      <g
                        key={sec.pos}
                        className="cursor-pointer transition-all hover:opacity-90"
                        onClick={() => handleOpenQuadrantEditor(sec.pos)}
                        onMouseEnter={() => setHoveredPosition(sec.pos)}
                        onMouseLeave={() => setHoveredPosition(null)}
                      >
                        <path
                          d={dPath}
                          className={`${style.fill} ${isHighlighted ? 'stroke-brand-500' : style.stroke}`}
                          strokeWidth={isHighlighted ? 3 : (style.strokeWidth || 2)}
                          filter={style.isFlashing ? 'url(#errorGlow)' : undefined}
                        />
                        <text x={sec.tx} y={sec.ty} textAnchor="middle" className="text-xs font-bold font-mono fill-slate-800 dark:fill-slate-100">
                          {sec.label}
                        </text>
                        <text
                          x={sec.tx}
                          y={sec.ty + 20}
                          textAnchor="middle"
                          className={`text-xs font-bold font-mono ${
                            obs.status === 'FAIL' ? 'fill-rose-600' : 'fill-slate-600 dark:fill-slate-300'
                          }`}
                        >
                          {obs.correctedError !== null ? `${obs.correctedError > 0 ? '+' : ''}${obs.correctedError.toFixed(2)}g` : '—'}
                        </text>
                      </g>
                    );
                  })}
                </g>
              )}

              {/* Base Platter Outline (Weighbridge Track Geometry) */}
              {geometry === 'WEIGHBRIDGE_TRACK' && (
                <g>
                  {/* Weighbridge Concrete Pit & Deck */}
                  <rect
                    x="60"
                    y="100"
                    width="520"
                    height="320"
                    rx="12"
                    className="fill-slate-200/80 dark:fill-slate-800/80 stroke-slate-400 dark:stroke-slate-600"
                    strokeWidth="3"
                  />

                  {/* Dual Steel Rails */}
                  <line x1="60" y1="180" x2="580" y2="180" stroke="#475569" strokeWidth="8" strokeLinecap="round" />
                  <line x1="60" y1="340" x2="580" y2="340" stroke="#475569" strokeWidth="8" strokeLinecap="round" />

                  {/* 4 Track Test Zones */}
                  {[
                    { pos: 'FRONT_LEFT' as CornerPosition, x: 80, y: 120, w: 140, h: 280, label: 'Axle In-1 (FL)' },
                    { pos: 'BACK_LEFT' as CornerPosition, x: 230, y: 120, w: 120, h: 130, label: 'Mid-Left (RL)' },
                    { pos: 'BACK_RIGHT' as CornerPosition, x: 230, y: 270, w: 120, h: 130, label: 'Mid-Right (RR)' },
                    { pos: 'FRONT_RIGHT' as CornerPosition, x: 360, y: 120, w: 140, h: 280, label: 'Axle Out-2 (FR)' },
                  ].map((sec) => {
                    const obs = observations.find((o) => o.position === sec.pos)!;
                    const style = getQuadrantColorStyle(obs);
                    const isHighlighted = hoveredPosition === sec.pos || selectedPosition === sec.pos;
                    return (
                      <g
                        key={sec.pos}
                        className="cursor-pointer transition-all hover:opacity-90"
                        onClick={() => handleOpenQuadrantEditor(sec.pos)}
                        onMouseEnter={() => setHoveredPosition(sec.pos)}
                        onMouseLeave={() => setHoveredPosition(null)}
                      >
                        <rect
                          x={sec.x}
                          y={sec.y}
                          width={sec.w}
                          height={sec.h}
                          rx="8"
                          className={`${style.fill} ${isHighlighted ? 'stroke-brand-500' : style.stroke}`}
                          strokeWidth={isHighlighted ? 3 : (style.strokeWidth || 2)}
                          filter={style.isFlashing ? 'url(#errorGlow)' : undefined}
                        />
                        <text x={sec.x + sec.w / 2} y={sec.y + 30} textAnchor="middle" className="text-xs font-bold font-mono fill-slate-800 dark:fill-slate-100">
                          {sec.label}
                        </text>
                        <text
                          x={sec.x + sec.w / 2}
                          y={sec.y + 55}
                          textAnchor="middle"
                          className={`text-xs font-bold font-mono ${
                            obs.status === 'FAIL' ? 'fill-rose-600' : 'fill-slate-600 dark:fill-slate-300'
                          }`}
                        >
                          {obs.correctedError !== null ? `${obs.correctedError > 0 ? '+' : ''}${obs.correctedError.toFixed(2)}g` : '—'}
                        </text>
                      </g>
                    );
                  })}
                </g>
              )}

              {/* Pos 1: Center Reference Circle (Prescribed Center Zone) */}
              {(() => {
                const obs = observations.find((o) => o.position === 'CENTER')!;
                const style = getQuadrantColorStyle(obs);
                const isHighlighted = hoveredPosition === 'CENTER' || selectedPosition === 'CENTER';
                return (
                  <g
                    className="cursor-pointer transition-all hover:opacity-95"
                    onClick={() => handleOpenQuadrantEditor('CENTER')}
                    onMouseEnter={() => setHoveredPosition('CENTER')}
                    onMouseLeave={() => setHoveredPosition(null)}
                  >
                    <circle
                      cx={cx}
                      cy={cy}
                      r="65"
                      className={`${style.fill} ${isHighlighted ? 'stroke-brand-500' : style.stroke} shadow-lg`}
                      strokeWidth={isHighlighted ? 3 : (style.strokeWidth || 2)}
                      filter="url(#cardShadow)"
                    />
                    {/* Concentric Bullseye Rings */}
                    <circle cx={cx} cy={cy} r="50" fill="none" stroke="#94a3b8" strokeDasharray="3 3" strokeWidth="1" opacity="0.35" />
                    <circle cx={cx} cy={cy} r="3" fill="#64748b" opacity="0.6" />

                    <text x={cx} y={cy - 24} textAnchor="middle" className="text-xs font-bold font-mono fill-slate-800 dark:fill-slate-100">
                      Pos 1 • Center
                    </text>
                    <text x={cx} y={cy - 7} textAnchor="middle" className="text-[10px] font-mono fill-slate-500 dark:fill-slate-400">
                      L: {(targetTestLoad / 1000).toFixed(1)}kg
                    </text>
                    <text
                      x={cx}
                      y={cy + 16}
                      textAnchor="middle"
                      className={`text-sm font-bold font-mono ${
                        obs.status === 'FAIL' ? 'fill-rose-600 dark:fill-rose-400' : 'fill-slate-900 dark:fill-slate-100'
                      }`}
                    >
                      {obs.correctedError !== null ? `${obs.correctedError > 0 ? '+' : ''}${obs.correctedError.toFixed(2)}g` : '—'}
                    </text>
                    {/* Center Verdict Pill */}
                    <rect
                      x={cx - 24}
                      y={cy + 25}
                      width="48"
                      height="16"
                      rx="4"
                      className={obs.status === 'FAIL' ? 'fill-rose-500/20 stroke-rose-500/60' : 'fill-emerald-500/20 stroke-emerald-500/60'}
                      strokeWidth="1"
                    />
                    <text
                      x={cx}
                      y={cy + 37}
                      textAnchor="middle"
                      className={`text-[9px] font-mono font-bold ${
                        obs.status === 'FAIL' ? 'fill-rose-700 dark:fill-rose-300' : 'fill-emerald-700 dark:fill-emerald-300'
                      }`}
                    >
                      {obs.status}
                    </text>
                  </g>
                );
              })()}

              {/* Dynamic Eccentric Deflection Vector Arrow */}
              {vectorEndpoint && (
                <g pointerEvents="none" className="transition-all duration-300">
                  <line
                    x1={vectorEndpoint.x1}
                    y1={vectorEndpoint.y1}
                    x2={vectorEndpoint.x2}
                    y2={vectorEndpoint.y2}
                    stroke={stats.overallStatus === 'FAIL' ? '#f43f5e' : '#a855f7'}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    markerEnd="url(#vectorArrowhead)"
                  />
                  <circle
                    cx={vectorEndpoint.x1}
                    cy={vectorEndpoint.y1}
                    r="3.5"
                    className={stats.overallStatus === 'FAIL' ? 'fill-rose-500' : 'fill-purple-500'}
                  />
                  {/* Floating Vector Tag positioned along deflection vector outside center zone */}
                  <g transform={`translate(${vectorEndpoint.tagX}, ${vectorEndpoint.tagY})`}>
                    <rect
                      x="-38"
                      y="-11"
                      width="76"
                      height="22"
                      rx="5"
                      className="fill-slate-900/95 dark:fill-slate-100/95 shadow-lg stroke-purple-400/40"
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      className="text-[10px] font-mono font-bold fill-white dark:fill-slate-900 tabular-nums"
                    >
                      {vectorEndpoint.angle}° TILT
                    </text>
                  </g>
                </g>
              )}
            </svg>
          </div>

          {/* Canvas Legend & Deflection Vector Note */}
          <div className="w-full mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-500/25 border border-emerald-500" />
                <span>&lt; 50% MPE</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-500/30 border border-amber-500" />
                <span>50% - 100% MPE</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-rose-500/40 border border-rose-500" />
                <span>&gt; 100% FAIL</span>
              </span>
            </div>

            {stats.deflectionAngle !== null ? (
              <span className="text-purple-600 dark:text-purple-400 flex items-center gap-1 font-bold">
                <Compass className="w-3.5 h-3.5" />
                Vector: {stats.deflectionAngle}° ({stats.dominantQuadrant?.replace('_', ' ')})
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                Balanced • Zero Tilt Bias
              </span>
            )}
          </div>
        </div>

        {/* Right Side: Quadrant Observation Records & Live Inspector */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-brand-500" />
              Prescribed 5-Quadrant Observations
            </h2>
            <span className="text-[11px] font-mono text-slate-400">
              MPE: <strong className="text-slate-700 dark:text-slate-300 font-bold">±{table6Mpe.mpeValue.toFixed(1)} g</strong>
            </span>
          </div>

          {/* Quadrant Detail Cards */}
          <div className="space-y-2.5">
            {observations.map((obs) => {
              const style = getQuadrantColorStyle(obs);
              const isSelected = selectedPosition === obs.position;
              const isHovered = hoveredPosition === obs.position;

              return (
                <div
                  key={obs.position}
                  onClick={() => handleOpenQuadrantEditor(obs.position)}
                  onMouseEnter={() => setHoveredPosition(obs.position)}
                  onMouseLeave={() => setHoveredPosition(null)}
                  className={`group p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected || isHovered
                      ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-500/15 shadow-sm ring-1 ring-brand-500/40'
                      : 'border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0f1728] hover:border-slate-300 dark:hover:border-white/[0.15]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold font-mono ${style.badgeClass}`}>
                      {obs.positionNumber}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 font-sans">
                          {obs.label}
                        </span>
                        <ComplianceBadge status={obs.status} size="sm" />
                      </div>
                      <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500 tabular-nums">
                        I = {obs.indication !== null ? `${obs.indication.toLocaleString()} g` : '—'} • ΔL ={' '}
                        {obs.auxiliaryLoad !== null ? `${obs.auxiliaryLoad.toFixed(1)} g` : '—'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 text-right font-mono">
                    <div>
                      <span
                        className={`text-sm font-bold block tabular-nums ${
                          obs.status === 'FAIL'
                            ? 'text-rose-600 dark:text-rose-400'
                            : obs.status === 'MARGINAL'
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-slate-800 dark:text-slate-100'
                        }`}
                      >
                        {obs.correctedError !== null
                          ? `${obs.correctedError > 0 ? '+' : ''}${obs.correctedError.toFixed(2)} g`
                          : 'PENDING'}
                      </span>
                      <span
                        className={`text-[10px] tabular-nums block ${
                          obs.status === 'FAIL'
                            ? 'text-rose-500 font-semibold'
                            : obs.status === 'MARGINAL'
                            ? 'text-amber-600 dark:text-amber-400 font-medium'
                            : 'text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        {obs.margin !== null
                          ? obs.margin >= 0
                            ? `Margin: +${obs.margin.toFixed(2)} g`
                            : `Breach: ${obs.margin.toFixed(2)} g`
                          : 'Click to Enter'}
                      </span>
                    </div>
                    <Edit3 className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-brand-500 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Diagnostic Recommendation Alert */}
          {stats.overallStatus === 'FAIL' && (
            <div className="p-3.5 rounded-lg border border-rose-300 bg-rose-50/80 dark:border-rose-900/60 dark:bg-rose-950/30 text-xs text-rose-800 dark:text-rose-200 space-y-1 animate-in fade-in duration-200">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Statutory Eccentricity Failure Detected!</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Quadrant{' '}
                <strong className="font-mono">{stats.dominantQuadrant}</strong> exceeds statutory Table 6
                tolerance corridor (±{table6Mpe.mpeValue.toFixed(1)} g). Inspect corner load cell mounting
                torque, shock-absorber gap, or check for mechanical lever friction.
              </p>
            </div>
          )}

          {stats.overallStatus === 'MARGINAL' && (
            <div className="p-3.5 rounded-lg border border-amber-300 bg-amber-50/80 dark:border-amber-900/60 dark:bg-amber-950/30 text-xs text-amber-800 dark:text-amber-200 space-y-1 animate-in fade-in duration-200">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Marginal Corner Loading Detected (≥ 75% MPE)</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Quadrant <strong className="font-mono">{stats.dominantQuadrant}</strong> is approaching Table 6
                statutory limit (±{table6Mpe.mpeValue.toFixed(1)} g). Verify levelling spirit bubble and corner knife-edge seats.
              </p>
            </div>
          )}

          {stats.overallStatus === 'PASS' && (
            <div className="p-3.5 rounded-lg border border-emerald-300 bg-emerald-50/80 dark:border-emerald-900/60 dark:bg-emerald-950/30 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                All 5 corner loading points are strictly compliant with OIML R 76-1 Clause A.4.7 tolerance criteria.
              </span>
            </div>
          )}

          {/* Mechanical Platter Dynamics & Torque Symmetry HUD */}
          <div className="p-3.5 rounded-lg border border-slate-200/90 dark:border-white/[0.08] bg-slate-50/80 dark:bg-[#121c2d] space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-purple-500" />
                Mechanical Suspension & Torque
              </span>
              <span className="text-[10px] text-slate-400">Clause A.4.7.1</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 rounded bg-white dark:bg-[#0c121e] border border-slate-200/60 dark:border-white/[0.06]">
                <span className="text-[10px] text-slate-400 block uppercase">Corner Spread (ΔE)</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                  {stats.interCornerSpread.toFixed(2)} g
                </span>
                <span className="text-[9px] text-slate-400 block">≤ ±{table6Mpe.mpeValue.toFixed(1)} g limit</span>
              </div>

              <div className="p-2 rounded bg-white dark:bg-[#0c121e] border border-slate-200/60 dark:border-white/[0.06]">
                <span className="text-[10px] text-slate-400 block uppercase">Deflection Angle</span>
                <span className="font-bold text-purple-600 dark:text-purple-400 tabular-nums">
                  {stats.deflectionAngle !== null ? `${stats.deflectionAngle}° Tilt` : 'Balanced (0°)'}
                </span>
                <span className="text-[9px] text-slate-400 block truncate">
                  {stats.dominantQuadrant ? stats.dominantQuadrant.replace('_', ' ') : 'Symmetric'}
                </span>
              </div>

              <div className="p-2 rounded bg-white dark:bg-[#0c121e] border border-slate-200/60 dark:border-white/[0.06]">
                <span className="text-[10px] text-slate-400 block uppercase">Torque Margin</span>
                <span
                  className={`font-bold tabular-nums ${
                    table6Mpe.mpeValue - stats.maxAbsoluteError >= 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {(table6Mpe.mpeValue - stats.maxAbsoluteError).toFixed(2)} g
                </span>
                <span className="text-[9px] text-slate-400 block">Buffer to MPE</span>
              </div>

              <div className="p-2 rounded bg-white dark:bg-[#0c121e] border border-slate-200/60 dark:border-white/[0.06]">
                <span className="text-[10px] text-slate-400 block uppercase">Support Geometry</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {geometry === 'WEIGHBRIDGE_TRACK' ? 'Axle Track' : supports > 4 ? `${supports} Load Cells` : 'Cantilever 4pt'}
                </span>
                <span className="text-[9px] text-slate-400 block">OIML Class III</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statutory Conformance Conclusion & Observation Export Panel */}
      <div
        className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
          stats.overallStatus === 'PASS'
            ? 'border-emerald-500/40 dark:border-emerald-500/30 bg-emerald-500/[0.03] dark:bg-emerald-500/[0.06]'
            : 'border-rose-500/40 dark:border-rose-500/30 bg-rose-500/[0.04] dark:bg-rose-500/[0.08]'
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`p-2 rounded-lg shrink-0 mt-0.5 ${
              stats.overallStatus === 'PASS'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
            }`}
          >
            {stats.overallStatus === 'PASS' ? (
              <ShieldCheck className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
          </div>
          <div>
            <h3
              className={`text-sm font-bold font-sans ${
                stats.overallStatus === 'PASS'
                  ? 'text-emerald-800 dark:text-emerald-200'
                  : 'text-rose-800 dark:text-rose-200'
              }`}
            >
              {stats.overallStatus === 'PASS'
                ? 'Complies with OIML R 76-1:2006 (Clause A.4.7) & Legal Metrology Rules, 2011'
                : 'Non-Compliant with OIML R 76-1:2006 (Clause A.4.7) — Corner Loading Error Exceeds Table 6 MPE'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
              {stats.overallStatus === 'PASS'
                ? `All 5 eccentric loading points conform to Table 6 initial MPE (±${table6Mpe.mpeValue.toFixed(1)} g) • Prescribed test load L = ${(targetTestLoad / 1000).toFixed(1)} kg • Verification Stage: Initial (1.0×)`
                : `Corner ${stats.dominantQuadrant ? stats.dominantQuadrant.replace('_', ' ') : 'mount'} exceeds statutory tolerance by ${(stats.maxAbsoluteError - table6Mpe.mpeValue).toFixed(2)} g (Ec = ±${stats.maxAbsoluteError.toFixed(2)} g vs MPE ±${table6Mpe.mpeValue.toFixed(1)} g). Scale requires corner potentiometer trimming.`}
            </p>
          </div>
        </div>

        {/* Action Controls: Export CSV, Toggle Full Audit Table, Save Results */}
        <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={isExportingCSV}
            leftIcon={<Download className="w-3.5 h-3.5" />}
            title="Export authentic RFC-4180 CSV laboratory observation ledger"
          >
            {isExportingCSV ? 'Exporting...' : 'Export CSV'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAuditTable((prev) => !prev)}
            leftIcon={<FileSpreadsheet className="w-3.5 h-3.5" />}
            rightIcon={showAuditTable ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          >
            {showAuditTable ? 'Hide Ledger' : 'Full Ledger'}
          </Button>

          <Button
            variant={isSavedFeedback ? 'secondary' : 'primary'}
            size="sm"
            onClick={handleSaveClick}
            leftIcon={isSavedFeedback ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Download className="w-3.5 h-3.5" />}
          >
            {isSavedFeedback ? 'Saved' : 'Save Results'}
          </Button>
        </div>
      </div>

      {/* Formal OIML R 76-1 Clause A.4.7 Verification Observation Table */}
      {showAuditTable && (
        <div className="rounded-xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#0f1728] p-4 shadow-sm space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/[0.06]">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 font-mono flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-brand-500" />
                Formal OIML R 76-1 Clause A.4.7 Verification Observation Ledger
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                5-point turning-point verification records conforming to OIML R 76-1.
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Zero Reference Error (E₀): <strong className="text-slate-800 dark:text-slate-200 font-bold">{zeroError.toFixed(2)} g</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider bg-slate-50/50 dark:bg-slate-800/30">
                  <th className="py-2.5 px-3 font-semibold">Pos #</th>
                  <th className="py-2.5 px-3 font-semibold">Position Name</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Load (L)</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Indication (I)</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Aux Load (ΔL)</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Turning Pt (P)</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Error (E)</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Corr. Error (Ec)</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Table 6 MPE</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Margin</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Status</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                {observations.map((obs) => {
                  const isFail = obs.status === 'FAIL';
                  const isMarginal = obs.status === 'MARGINAL';

                  return (
                    <tr
                      key={obs.position}
                      className={`hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors ${
                        isFail
                          ? 'bg-rose-500/[0.04] dark:bg-rose-500/[0.08]'
                          : isMarginal
                          ? 'bg-amber-500/[0.03] dark:bg-amber-500/[0.06]'
                          : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 font-bold text-slate-700 dark:text-slate-300">
                        {obs.positionNumber}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100 font-sans">
                        {obs.label}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-slate-600 dark:text-slate-300">
                        {(obs.targetLoad / 1000).toFixed(1)} kg
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-slate-900 dark:text-slate-100 font-bold">
                        {obs.indication !== null ? `${obs.indication.toLocaleString()} g` : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-slate-600 dark:text-slate-300">
                        {obs.auxiliaryLoad !== null ? `${obs.auxiliaryLoad.toFixed(1)} g` : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-slate-600 dark:text-slate-300">
                        {obs.trueIndication !== null ? `${obs.trueIndication.toFixed(2)} g` : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-slate-600 dark:text-slate-300">
                        {obs.uncorrectedError !== null
                          ? `${obs.uncorrectedError > 0 ? '+' : ''}${obs.uncorrectedError.toFixed(2)} g`
                          : '—'}
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right tabular-nums font-bold ${
                          isFail
                            ? 'text-rose-600 dark:text-rose-400'
                            : isMarginal
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        {obs.correctedError !== null
                          ? `${obs.correctedError > 0 ? '+' : ''}${obs.correctedError.toFixed(2)} g`
                          : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-slate-500 dark:text-slate-400">
                        ±{obs.mpeLimit.toFixed(1)} g ({obs.mpeInE})
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right tabular-nums font-semibold ${
                          isFail
                            ? 'text-rose-500'
                            : isMarginal
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {obs.margin !== null
                          ? obs.margin >= 0
                            ? `+${obs.margin.toFixed(2)} g`
                            : `${obs.margin.toFixed(2)} g`
                          : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <ComplianceBadge status={obs.status} size="sm" />
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenQuadrantEditor(obs.position)}
                          className="text-brand-600 dark:text-brand-400 h-7 px-2 text-xs"
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Interactive Quadrant Observation Editor */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={activeModalObs ? `Edit ${activeModalObs.label}` : 'Edit Quadrant Reading'}
        maxWidth="md"
      >
        {activeModalObs && (
          <div className="space-y-5 text-slate-800 dark:text-slate-100 font-sans">
            {/* Context Summary Bar */}
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#121c2d] border border-slate-200 dark:border-white/[0.08] flex items-center justify-between text-xs font-mono">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Target Test Load (L)</span>
                <span className="font-bold text-slate-900 dark:text-slate-50 text-sm">
                  {activeModalObs.targetLoad.toLocaleString()} g ({(activeModalObs.targetLoad / 1000).toFixed(1)} kg)
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Statutory Table 6 MPE</span>
                <span className="font-bold text-brand-600 dark:text-brand-400 text-sm">
                  ±{activeModalObs.mpeLimit.toFixed(1)} g ({activeModalObs.mpeInE})
                </span>
              </div>
              <ComplianceBadge status={activeModalObs.status} size="md" />
            </div>

            {/* Inputs: Indication & Auxiliary Load */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 font-mono">
                  Observed Indication (I) [g] *
                </label>
                <input
                  type="number"
                  step="any"
                  value={editIndication}
                  onChange={(e) => setEditIndication(e.target.value)}
                  placeholder={`e.g. ${activeModalObs.targetLoad}`}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-white/[0.12] bg-white dark:bg-[#121c2d] text-slate-900 dark:text-slate-100 text-sm font-mono focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 font-mono">
                  Auxiliary Load (ΔL) [g] *
                </label>
                <input
                  type="number"
                  step="any"
                  value={editAuxLoad}
                  onChange={(e) => setEditAuxLoad(e.target.value)}
                  placeholder="e.g. 2.5"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-white/[0.12] bg-white dark:bg-[#121c2d] text-slate-900 dark:text-slate-100 text-sm font-mono focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                  Changeover fractional weights
                </span>
              </div>
            </div>

            {/* Live Formula Preview Box */}
            <div className="p-3 rounded-lg border border-brand-500/25 bg-brand-50/40 dark:bg-brand-500/10 text-xs font-mono space-y-1">
              <span className="font-bold text-brand-700 dark:text-brand-300 block">
                Clause A.4.4.3 Changeover Evaluation:
              </span>
              <p className="text-slate-600 dark:text-slate-300">
                P = I + 0.5e - ΔL ={' '}
                <strong>
                  {editIndication !== '' && editAuxLoad !== ''
                    ? (parseFloat(editIndication) + 0.5 * e - parseFloat(editAuxLoad)).toFixed(2)
                    : '—'}
                </strong>{' '}
                g
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                Ec = (P - L) - E₀ ={' '}
                <strong className="text-brand-600 dark:text-brand-400">
                  {editIndication !== '' && editAuxLoad !== ''
                    ? (
                        parseFloat(editIndication) +
                        0.5 * e -
                        parseFloat(editAuxLoad) -
                        activeModalObs.targetLoad -
                        zeroError
                      ).toFixed(2)
                    : '—'}
                </strong>{' '}
                g
              </p>
            </div>

            {/* Zero Reference Error (E0) Adjustment */}
            <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#121c2d] text-xs font-mono">
              <span className="text-slate-600 dark:text-slate-300">
                Zero Reference Error (E₀) [{unit === 'KILOGRAM' ? 'kg' : 'g'}]:
              </span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="any"
                  value={zeroError}
                  onChange={(e) => setZeroError(parseFloat(e.target.value) || 0)}
                  className="w-20 px-2 py-1 rounded border border-slate-300 dark:border-white/[0.12] text-right font-mono text-xs bg-white dark:bg-[#0c121e] text-slate-900 dark:text-slate-100"
                />
                <span className="text-slate-400 font-bold">{unit === 'KILOGRAM' ? 'kg' : 'g'}</span>
              </div>
            </div>

            {/* Notes Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 font-mono">
                Technician Notes / Inspection Remarks
              </label>
              <input
                type="text"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="e.g. Standard 1/3 Max load applied using OIML F1 weights"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-white/[0.12] bg-white dark:bg-[#121c2d] text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveQuadrant}>
                Save Reading
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PlatterHeatmap;
