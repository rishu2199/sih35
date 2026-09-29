import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Maximize2,
  Minimize2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Eye,
  EyeOff,
} from 'lucide-react';
import type {
  AccuracyClass,
  UnitOfMeasure,
  VerificationStage,
  ObservationRow,
} from '../../types';

export interface ErrorCorridorChartProps {
  observations: ObservationRow[];
  accuracyClass?: AccuracyClass;
  maxCapacity?: number;
  e?: number;
  unit?: UnitOfMeasure;
  stage?: VerificationStage;
  className?: string;
}

interface TooltipData {
  x: number;
  y: number;
  load: number;
  loadInE: number;
  error: number;
  errorInE: number;
  mpe: number;
  mpeInE: number;
  margin: number;
  status: 'PASS' | 'FAIL' | 'MARGINAL' | 'PENDING';
  direction: 'ASCENDING' | 'DESCENDING' | 'REPEATABILITY' | 'ECCENTRICITY';
  step: number;
  indication?: number | null;
  auxiliaryLoad?: number | null;
  trueIndication?: number | null;
}

export const ErrorCorridorChart: React.FC<ErrorCorridorChartProps> = ({
  observations,
  accuracyClass = 'CLASS_III',
  maxCapacity = 30000,
  e = 5,
  unit = 'GRAM',
  stage = 'INITIAL_TYPE_APPROVAL',
  className = '',
}) => {
  // Chart Display Preferences
  const [yAxisMode, setYAxisMode] = useState<'UNITS_OF_E' | 'PHYSICAL_UNITS'>('UNITS_OF_E');
  const [showAscending, setShowAscending] = useState(true);
  const [showDescending, setShowDescending] = useState(true);
  const [showCorridor, setShowCorridor] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  // Active Tooltip on Hover
  const [hoveredPoint, setHoveredPoint] = useState<TooltipData | null>(null);
  const chartSvgRef = useRef<SVGSVGElement | null>(null);

  // Stage multiplier: Initial = 1.0x, In-Service = 2.0x
  const stageMultiplier = stage === 'INITIAL_TYPE_APPROVAL' ? 1.0 : 2.0;

  // Maximum scale interval count n = Max / e
  const nMax = e > 0 ? maxCapacity / e : 6000;

  // OIML Table 6 Step Boundaries (in units of e)
  const stepBoundaries = useMemo(() => {
    if (accuracyClass === 'CLASS_I') {
      return { step1: 50000, step2: 200000 };
    }
    if (accuracyClass === 'CLASS_II') {
      return { step1: 5000, step2: 20000 };
    }
    if (accuracyClass === 'CLASS_IIII') {
      return { step1: 50, step2: 200 };
    }
    // Default CLASS_III
    return { step1: 500, step2: 2000 };
  }, [accuracyClass]);

  // Chart ViewBox Dimensions
  const width = 860;
  const height = isExpanded ? 460 : 340;
  const margin = { top: 30, right: 35, bottom: 45, left: 55 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  // Domain & Range
  const xDomainMax = Math.max(nMax * 1.05, stepBoundaries.step2 * 1.2);
  const maxMpeInE = 1.5 * stageMultiplier;
  const yDomainMax = Math.max(maxMpeInE * 1.4, 2.5);
  const yDomainMin = -yDomainMax;

  // Coordinate Transformers
  const scaleX = useCallback(
    (valInE: number) => {
      return margin.left + (valInE / xDomainMax) * plotWidth;
    },
    [margin.left, xDomainMax, plotWidth]
  );

  const scaleY = useCallback(
    (valInE: number) => {
      const norm = (valInE - yDomainMin) / (yDomainMax - yDomainMin);
      return margin.top + (1 - norm) * plotHeight;
    },
    [margin.top, yDomainMin, yDomainMax, plotHeight]
  );

  // Helper: MPE at any given m in units of e
  const getMpeInEAt = useCallback(
    (m: number): number => {
      if (m <= stepBoundaries.step1) return 0.5 * stageMultiplier;
      if (m <= stepBoundaries.step2) return 1.0 * stageMultiplier;
      return 1.5 * stageMultiplier;
    },
    [stepBoundaries, stageMultiplier]
  );

  // Generate SVG Polygon path for the green shaded corridor with vertical jumps
  const corridorPath = useMemo(() => {
    const s1 = stepBoundaries.step1;
    const s2 = stepBoundaries.step2;
    const end = xDomainMax;

    const mpe1 = 0.5 * stageMultiplier;
    const mpe2 = 1.0 * stageMultiplier;
    const mpe3 = 1.5 * stageMultiplier;

    // Top boundary points (including vertical jumps at s1 and s2)
    const topPoints = [
      { x: 0, y: mpe1 },
      { x: s1, y: mpe1 },
      { x: s1, y: mpe2 }, // Vertical step up 1
      { x: s2, y: mpe2 },
      { x: s2, y: mpe3 }, // Vertical step up 2
      { x: end, y: mpe3 },
    ];

    // Bottom boundary points (reversed, including vertical jumps)
    const bottomPoints = [
      { x: end, y: -mpe3 },
      { x: s2, y: -mpe3 },
      { x: s2, y: -mpe2 }, // Vertical step down 2
      { x: s1, y: -mpe2 },
      { x: s1, y: -mpe1 }, // Vertical step down 1
      { x: 0, y: -mpe1 },
    ];

    const allPoints = [...topPoints, ...bottomPoints];
    const pathCommands = allPoints.map((pt, idx) => {
      const sx = scaleX(pt.x).toFixed(1);
      const sy = scaleY(pt.y).toFixed(1);
      return `${idx === 0 ? 'M' : 'L'} ${sx} ${sy}`;
    });

    return `${pathCommands.join(' ')} Z`;
  }, [stepBoundaries, stageMultiplier, xDomainMax, scaleX, scaleY]);

  // Generate Upper and Lower Corridor Boundary Lines for crisp stroke rendering
  const upperLinePath = useMemo(() => {
    const s1 = stepBoundaries.step1;
    const s2 = stepBoundaries.step2;
    const end = xDomainMax;

    const mpe1 = 0.5 * stageMultiplier;
    const mpe2 = 1.0 * stageMultiplier;
    const mpe3 = 1.5 * stageMultiplier;

    return `M ${scaleX(0)} ${scaleY(mpe1)} ` +
      `L ${scaleX(s1)} ${scaleY(mpe1)} ` +
      `L ${scaleX(s1)} ${scaleY(mpe2)} ` +
      `L ${scaleX(s2)} ${scaleY(mpe2)} ` +
      `L ${scaleX(s2)} ${scaleY(mpe3)} ` +
      `L ${scaleX(end)} ${scaleY(mpe3)}`;
  }, [stepBoundaries, stageMultiplier, xDomainMax, scaleX, scaleY]);

  const lowerLinePath = useMemo(() => {
    const s1 = stepBoundaries.step1;
    const s2 = stepBoundaries.step2;
    const end = xDomainMax;

    const mpe1 = -0.5 * stageMultiplier;
    const mpe2 = -1.0 * stageMultiplier;
    const mpe3 = -1.5 * stageMultiplier;

    return `M ${scaleX(0)} ${scaleY(mpe1)} ` +
      `L ${scaleX(s1)} ${scaleY(mpe1)} ` +
      `L ${scaleX(s1)} ${scaleY(mpe2)} ` +
      `L ${scaleX(s2)} ${scaleY(mpe2)} ` +
      `L ${scaleX(s2)} ${scaleY(mpe3)} ` +
      `L ${scaleX(end)} ${scaleY(mpe3)}`;
  }, [stepBoundaries, stageMultiplier, xDomainMax, scaleX, scaleY]);

  // Separate Observations into Ascending and Descending Series
  const validObservations = useMemo(() => {
    return observations.filter(
      (r) => r.correctedError !== null && r.indication !== null && r.auxiliaryLoad !== null
    );
  }, [observations]);

  const ascendingPoints = useMemo(() => {
    return validObservations
      .filter((r) => r.direction === 'ASCENDING')
      .map((r) => {
        const loadInE = e > 0 ? r.targetLoad / e : 0;
        const errorInE = e > 0 ? (r.correctedError ?? 0) / e : 0;
        const mpeInE = getMpeInEAt(loadInE);
        const mpeVal = mpeInE * e;
        const margin = mpeVal - Math.abs(r.correctedError ?? 0);

        return {
          row: r,
          x: scaleX(loadInE),
          y: scaleY(errorInE),
          load: r.targetLoad,
          loadInE,
          error: r.correctedError ?? 0,
          errorInE,
          mpe: mpeVal,
          mpeInE,
          margin,
          status: r.status,
          direction: r.direction,
          step: r.step,
          indication: r.indication,
          auxiliaryLoad: r.auxiliaryLoad,
          trueIndication: r.trueIndication,
        };
      });
  }, [validObservations, e, getMpeInEAt, scaleX, scaleY]);

  const descendingPoints = useMemo(() => {
    return validObservations
      .filter((r) => r.direction === 'DESCENDING')
      .map((r) => {
        const loadInE = e > 0 ? r.targetLoad / e : 0;
        const errorInE = e > 0 ? (r.correctedError ?? 0) / e : 0;
        const mpeInE = getMpeInEAt(loadInE);
        const mpeVal = mpeInE * e;
        const margin = mpeVal - Math.abs(r.correctedError ?? 0);

        return {
          row: r,
          x: scaleX(loadInE),
          y: scaleY(errorInE),
          load: r.targetLoad,
          loadInE,
          error: r.correctedError ?? 0,
          errorInE,
          mpe: mpeVal,
          mpeInE,
          margin,
          status: r.status,
          direction: r.direction,
          step: r.step,
          indication: r.indication,
          auxiliaryLoad: r.auxiliaryLoad,
          trueIndication: r.trueIndication,
        };
      });
  }, [validObservations, e, getMpeInEAt, scaleX, scaleY]);

  // Construct Connected Path strings for observation curves
  const makeSeriesPath = (points: Array<{ x: number; y: number }>) => {
    if (points.length === 0) return '';
    return points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  };

  const ascPathString = useMemo(() => makeSeriesPath(ascendingPoints), [ascendingPoints]);
  const descPathString = useMemo(() => makeSeriesPath(descendingPoints), [descendingPoints]);

  // Grid Ticks
  const yTicks = useMemo(() => {
    const count = 5;
    const ticks: number[] = [];
    const step = (yDomainMax * 2) / (count - 1);
    for (let i = 0; i < count; i++) {
      ticks.push(yDomainMin + i * step);
    }
    return ticks;
  }, [yDomainMin, yDomainMax]);

  const xTicks = useMemo(() => {
    const ticks = [0, stepBoundaries.step1, stepBoundaries.step2, Math.round(nMax)];
    return Array.from(new Set(ticks)).sort((a, b) => a - b);
  }, [stepBoundaries, nMax]);

  // Overall Corridor Compliance Status
  const allPointsCompliant = useMemo(() => {
    if (validObservations.length === 0) return null;
    return validObservations.every((r) => r.status === 'PASS');
  }, [validObservations]);

  return (
    <div
      className={`rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0f1728] p-5 shadow-xs dark:shadow-card card-sheen relative overflow-hidden ${className}`}
    >
      {/* Top Header & Interactive Filter Bar */}
      {/* Chart Header & Controls Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80 dark:border-white/[0.08]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                allPointsCompliant === false
                  ? 'bg-rose-500 shadow-xs shadow-rose-500/50 animate-pulse'
                  : 'bg-emerald-500 shadow-xs shadow-emerald-500/50'
              }`}
            />
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-sans">
              Tolerance Corridor & MPE Envelope
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80">
              Table 6
            </span>

            {allPointsCompliant !== null && (
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  allPointsCompliant
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                }`}
              >
                {allPointsCompliant ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                )}
                {allPointsCompliant ? 'Within tolerance' : 'Out of tolerance'}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Stepped MPE envelope with vertical jumps at{' '}
            <strong className="font-mono font-bold text-slate-700 dark:text-slate-300">
              {stepBoundaries.step1.toLocaleString()}e
            </strong>{' '}
            and{' '}
            <strong className="font-mono font-bold text-slate-700 dark:text-slate-300">
              {stepBoundaries.step2.toLocaleString()}e
            </strong>{' '}
            breakpoints.
          </p>
        </div>

        {/* Action Toggles: Units, Series Filters & Expand */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Y-Axis Units Switcher */}
          <div className="flex items-center rounded-lg border border-slate-200/90 dark:border-white/[0.08] bg-slate-100/80 dark:bg-slate-800/60 p-0.5 font-medium">
            <button
              type="button"
              onClick={() => setYAxisMode('UNITS_OF_E')}
              className={`px-2.5 py-1 rounded-md transition-all text-xs cursor-pointer ${
                yAxisMode === 'UNITS_OF_E'
                  ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-300 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Units of e
            </button>
            <button
              type="button"
              onClick={() => setYAxisMode('PHYSICAL_UNITS')}
              className={`px-2.5 py-1 rounded-md transition-all text-xs cursor-pointer ${
                yAxisMode === 'PHYSICAL_UNITS'
                  ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-300 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Grams (g)
            </button>
          </div>

          {/* Series Visibility Toggles */}
          <button
            type="button"
            onClick={() => setShowCorridor((p) => !p)}
            className={`px-2.5 py-1 rounded-md border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              showCorridor
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60 font-semibold'
                : 'bg-slate-50 text-slate-400 border-slate-200 dark:bg-slate-800/40 dark:text-slate-500 dark:border-slate-700/60'
            }`}
          >
            {showCorridor ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            Corridor
          </button>

          <button
            type="button"
            onClick={() => setShowAscending((p) => !p)}
            className={`px-2.5 py-1 rounded-md border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              showAscending
                ? 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/60 font-semibold'
                : 'bg-slate-50 text-slate-400 border-slate-200 dark:bg-slate-800/40 dark:text-slate-500 dark:border-slate-700/60'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Ascending
          </button>

          <button
            type="button"
            onClick={() => setShowDescending((p) => !p)}
            className={`px-2.5 py-1 rounded-md border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              showDescending
                ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60 font-semibold'
                : 'bg-slate-50 text-slate-400 border-slate-200 dark:bg-slate-800/40 dark:text-slate-500 dark:border-slate-700/60'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            Descending
          </button>

          {/* Expand / Minimize Toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded((p) => !p)}
            className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
            title={isExpanded ? 'Compress View' : 'Expand View'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Primary SVG Chart Visualization */}
      <div className="relative mt-4 select-none">
        <svg
          ref={chartSvgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible font-mono"
        >
          <defs>
            {/* Shaded MPE Corridor Green Gradient */}
            <linearGradient id="mpeCorridorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
              <stop offset="50%" stopColor="#10b981" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.22" />
            </linearGradient>

            {/* Ascending Series Sky Blue Gradient */}
            <linearGradient id="ascLineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>

            {/* Descending Series Purple Gradient */}
            <linearGradient id="descLineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#9333ea" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>

            {/* Drop Shadow Filter */}
            <filter id="shadowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* Grid Background */}
          <rect
            x={margin.left}
            y={margin.top}
            width={plotWidth}
            height={plotHeight}
            className="fill-slate-50/60 dark:fill-slate-900/40"
            rx="6"
          />

          {/* Horizontal Grid Lines */}
          {yTicks.map((tickVal, idx) => {
            const y = scaleY(tickVal);
            const isZero = Math.abs(tickVal) < 0.001;

            return (
              <g key={`y-grid-${idx}`}>
                <line
                  x1={margin.left}
                  y1={y}
                  x2={width - margin.right}
                  y2={y}
                  stroke={isZero ? '#64748b' : '#cbd5e1'}
                  strokeWidth={isZero ? 1.5 : 0.75}
                  strokeDasharray={isZero ? undefined : '3 3'}
                  className={isZero ? 'stroke-slate-500 dark:stroke-slate-400' : 'stroke-slate-200 dark:stroke-slate-800/80'}
                />
                <text
                  x={margin.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  className={`text-[10px] font-mono ${
                    isZero
                      ? 'fill-slate-800 dark:fill-slate-200 font-bold'
                      : 'fill-slate-400 dark:fill-slate-500'
                  }`}
                >
                  {isZero
                    ? (yAxisMode === 'UNITS_OF_E' ? '0.0e' : '0.0g')
                    : yAxisMode === 'UNITS_OF_E'
                    ? `${tickVal > 0 ? '+' : ''}${tickVal.toFixed(1)}e`
                    : `${tickVal > 0 ? '+' : ''}${(tickVal * e).toFixed(1)}g`}
                </text>
              </g>
            );
          })}

          {/* Vertical Grid Lines & Step Breakpoint Labels */}
          {xTicks.map((xVal, idx) => {
            const x = scaleX(xVal);
            const isBreakpoint =
              xVal === stepBoundaries.step1 || xVal === stepBoundaries.step2;

            return (
              <g key={`x-grid-${idx}`}>
                <line
                  x1={x}
                  y1={margin.top}
                  x2={x}
                  y2={height - margin.bottom}
                  stroke={isBreakpoint ? '#10b981' : '#e2e8f0'}
                  strokeWidth={isBreakpoint ? 1.2 : 0.75}
                  strokeDasharray={isBreakpoint ? '4 2' : '2 2'}
                  className="dark:stroke-slate-800"
                />
                <text
                  x={x}
                  y={height - margin.bottom + 16}
                  textAnchor="middle"
                  className={`text-[10px] font-mono ${
                    isBreakpoint
                      ? 'fill-emerald-600 dark:fill-emerald-400 font-bold'
                      : 'fill-slate-400 dark:fill-slate-500'
                  }`}
                >
                  {xVal >= 1000 ? `${(xVal / 1000).toFixed(1)}ke` : `${xVal}e`}
                </text>
              </g>
            );
          })}

          {/* Shaded MPE Tolerance Corridor (Step-Function Polygon) */}
          {showCorridor && (
            <g>
              <path
                d={corridorPath}
                fill="url(#mpeCorridorGradient)"
                stroke="none"
              />
              {/* Upper MPE Boundary Line with Vertical Steps */}
              <path
                d={upperLinePath}
                fill="none"
                stroke="#10b981"
                strokeWidth="1.5"
                strokeDasharray="4 2"
                className="opacity-80"
              />
              {/* Lower MPE Boundary Line with Vertical Steps */}
              <path
                d={lowerLinePath}
                fill="none"
                stroke="#10b981"
                strokeWidth="1.5"
                strokeDasharray="4 2"
                className="opacity-80"
              />

              {/* Corridor Labels */}
              <text
                x={scaleX(stepBoundaries.step1 / 2)}
                y={scaleY(0.5 * stageMultiplier) - 6}
                textAnchor="middle"
                className="text-[9px] fill-emerald-600 dark:fill-emerald-400 font-bold"
              >
                {yAxisMode === 'UNITS_OF_E'
                  ? `±${(0.5 * stageMultiplier).toFixed(1)}e`
                  : `±${(0.5 * stageMultiplier * e).toFixed(1)}g`}
              </text>
              <text
                x={scaleX((stepBoundaries.step1 + stepBoundaries.step2) / 2)}
                y={scaleY(1.0 * stageMultiplier) - 6}
                textAnchor="middle"
                className="text-[9px] fill-emerald-600 dark:fill-emerald-400 font-bold"
              >
                {yAxisMode === 'UNITS_OF_E'
                  ? `±${(1.0 * stageMultiplier).toFixed(1)}e`
                  : `±${(1.0 * stageMultiplier * e).toFixed(1)}g`}
              </text>
              <text
                x={scaleX((stepBoundaries.step2 + xDomainMax) / 2)}
                y={scaleY(1.5 * stageMultiplier) - 6}
                textAnchor="middle"
                className="text-[9px] fill-emerald-600 dark:fill-emerald-400 font-bold"
              >
                {yAxisMode === 'UNITS_OF_E'
                  ? `±${(1.5 * stageMultiplier).toFixed(1)}e`
                  : `±${(1.5 * stageMultiplier * e).toFixed(1)}g`}
              </text>
            </g>
          )}

          {/* Ascending Series (Curve & Points) */}
          {showAscending && (
            <g>
              {ascPathString && (
                <path
                  d={ascPathString}
                  fill="none"
                  stroke="url(#ascLineGrad)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {ascendingPoints.map((pt, idx) => (
                <g
                  key={`asc-pt-${idx}`}
                  className="cursor-pointer transition-transform hover:scale-125"
                  onMouseEnter={() => setHoveredPoint(pt)}
                  onMouseLeave={() => setHoveredPoint(null)}
                >
                  {pt.status === 'FAIL' && (
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="11"
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth="1.5"
                      className="animate-ping opacity-75 pointer-events-none"
                    />
                  )}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="5"
                    className={`${
                      pt.status === 'PASS'
                        ? 'fill-sky-500 stroke-white dark:stroke-slate-900'
                        : 'fill-rose-500 stroke-white dark:stroke-slate-900'
                    }`}
                    strokeWidth="2"
                    filter="url(#shadowFilter)"
                  />
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="2"
                    fill="white"
                  />
                </g>
              ))}
            </g>
          )}

          {/* Descending Series (Curve & Points) */}
          {showDescending && (
            <g>
              {descPathString && (
                <path
                  d={descPathString}
                  fill="none"
                  stroke="url(#descLineGrad)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="5 3"
                />
              )}

              {descendingPoints.map((pt, idx) => (
                <g
                  key={`desc-pt-${idx}`}
                  className="cursor-pointer transition-transform hover:scale-125"
                  onMouseEnter={() => setHoveredPoint(pt)}
                  onMouseLeave={() => setHoveredPoint(null)}
                >
                  {pt.status === 'FAIL' && (
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="11"
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth="1.5"
                      className="animate-ping opacity-75 pointer-events-none"
                    />
                  )}
                  <rect
                    x={pt.x - 4}
                    y={pt.y - 4}
                    width="8"
                    height="8"
                    transform={`rotate(45, ${pt.x}, ${pt.y})`}
                    className={`${
                      pt.status === 'PASS'
                        ? 'fill-purple-500 stroke-white dark:stroke-slate-900'
                        : 'fill-rose-500 stroke-white dark:stroke-slate-900'
                    }`}
                    strokeWidth="2"
                    filter="url(#shadowFilter)"
                  />
                </g>
              ))}
            </g>
          )}

          {/* Statutory Violation Callout Pins for Failed Points */}
          {[...ascendingPoints, ...descendingPoints]
            .filter((pt) => pt.status === 'FAIL')
            .slice(0, 1)
            .map((failPt, idx) => (
              <g key={`fail-tag-${idx}`} className="pointer-events-none">
                <line
                  x1={failPt.x}
                  y1={failPt.y - 7}
                  x2={failPt.x}
                  y2={failPt.y - 20}
                  stroke="#f43f5e"
                  strokeWidth="1.5"
                />
                <rect
                  x={failPt.x - 56}
                  y={failPt.y - 34}
                  width="112"
                  height="16"
                  rx="3"
                  className="fill-rose-950/95 stroke-rose-500/80"
                  strokeWidth="1"
                />
                <text
                  x={failPt.x}
                  y={failPt.y - 22}
                  textAnchor="middle"
                  className="text-[9px] font-mono font-bold fill-rose-300 tracking-tight"
                >
                  FAIL: {failPt.error > 0 ? '+' : ''}{failPt.error.toFixed(1)}g &gt; MPE
                </text>
              </g>
            ))}

          {/* Hover Crosshairs */}
          {hoveredPoint && (
            <g pointerEvents="none">
              <line
                x1={hoveredPoint.x}
                y1={margin.top}
                x2={hoveredPoint.x}
                y2={height - margin.bottom}
                stroke="#64748b"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <line
                x1={margin.left}
                y1={hoveredPoint.y}
                x2={width - margin.right}
                y2={hoveredPoint.y}
                stroke="#64748b"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <circle
                cx={hoveredPoint.x}
                cy={hoveredPoint.y}
                r="8"
                fill="none"
                stroke={hoveredPoint.direction === 'ASCENDING' ? '#0ea5e9' : '#a855f7'}
                strokeWidth="2"
                className="animate-ping"
              />
            </g>
          )}

          {/* Axis Labels */}
          <text
            x={width / 2}
            y={height - 10}
            textAnchor="middle"
            className="text-[11px] fill-slate-500 dark:fill-slate-400 font-bold"
          >
            Applied Reference Load L (Scale Intervals m = L/e)
          </text>

          <text
            x={-height / 2}
            y={16}
            textAnchor="middle"
            transform="rotate(-90)"
            className="text-[11px] fill-slate-500 dark:fill-slate-400 font-bold"
          >
            {yAxisMode === 'UNITS_OF_E'
              ? 'Error of Indication (units of e)'
              : 'Error of Indication (grams)'}
          </text>
        </svg>

        {/* Interactive Floating Hover Tooltip Card */}
        {hoveredPoint && (
          <div
            className="absolute z-20 pointer-events-none rounded-lg border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md p-3 shadow-xl text-xs font-sans max-w-xs transition-all animate-in fade-in zoom-in-95 duration-150"
            style={{
              left: `${Math.min(hoveredPoint.x + 12, width - 260)}px`,
              top: `${Math.max(hoveredPoint.y - 140, 10)}px`,
            }}
          >
            <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 dark:border-slate-700/80 pb-1.5 mb-1.5">
              <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 font-mono text-[11px]">
                {hoveredPoint.direction === 'ASCENDING' ? (
                  <TrendingUp className="w-3.5 h-3.5 text-sky-500" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-purple-500" />
                )}
                Step {hoveredPoint.step} ({hoveredPoint.direction})
              </span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                  hoveredPoint.status === 'PASS'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : hoveredPoint.status === 'MARGINAL'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                }`}
              >
                {hoveredPoint.status}
              </span>
            </div>

            <div className="space-y-1 font-mono text-[11px] text-slate-600 dark:text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Load (L):</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">
                  {hoveredPoint.load.toLocaleString()} {unit === 'KILOGRAM' ? 'kg' : 'g'} (
                  {hoveredPoint.loadInE.toLocaleString()}e)
                </span>
              </div>

              {hoveredPoint.indication !== undefined && hoveredPoint.indication !== null && (
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-400">Display (I):</span>
                  <span>{hoveredPoint.indication.toLocaleString()} {unit === 'KILOGRAM' ? 'kg' : 'g'}</span>
                </div>
              )}

              {hoveredPoint.auxiliaryLoad !== undefined && hoveredPoint.auxiliaryLoad !== null && (
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-400">Aux Weight (ΔL):</span>
                  <span className="text-amber-600 dark:text-amber-400 font-semibold">+{hoveredPoint.auxiliaryLoad.toFixed(1)} g</span>
                </div>
              )}

              {hoveredPoint.trueIndication !== undefined && hoveredPoint.trueIndication !== null && (
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-400">Turning Point (P):</span>
                  <span className="font-semibold text-sky-600 dark:text-sky-400">{hoveredPoint.trueIndication.toFixed(1)} g</span>
                </div>
              )}

              <div className="flex justify-between pt-0.5">
                <span className="text-slate-400">Corrected Error (Ec):</span>
                <span className={`font-bold ${hoveredPoint.status === 'FAIL' ? 'text-rose-600 dark:text-rose-400' : 'text-brand-600 dark:text-brand-400'}`}>
                  {hoveredPoint.error > 0 ? '+' : ''}
                  {hoveredPoint.error.toFixed(2)} g ({hoveredPoint.errorInE > 0 ? '+' : ''}
                  {hoveredPoint.errorInE.toFixed(2)}e)
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Table 6 MPE:</span>
                <span>
                  ±{hoveredPoint.mpe.toFixed(2)} g (±{hoveredPoint.mpeInE.toFixed(1)}e)
                </span>
              </div>

              <div className="flex justify-between pt-1 border-t border-slate-100 dark:border-slate-700">
                <span className="text-slate-400">Tolerance Margin:</span>
                <span className={`font-bold ${
                  hoveredPoint.margin >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}>
                  {hoveredPoint.margin >= 0 ? `+${hoveredPoint.margin.toFixed(2)}` : hoveredPoint.margin.toFixed(2)} g
                  {hoveredPoint.margin < 0 ? ' (BREACH)' : ''}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chart Legend & Verification Stage Indicator */}
      <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-500/20 border border-emerald-500" />
            <span className="text-slate-600 dark:text-slate-300 font-medium">
              MPE corridor (Table 6)
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
            <span className="text-slate-600 dark:text-slate-300 font-medium">Ascending</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rotate-45 bg-purple-500" />
            <span className="text-slate-600 dark:text-slate-300 font-medium">Descending</span>
          </div>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Stage: <strong className="font-semibold text-slate-700 dark:text-slate-200">{stage === 'INITIAL_TYPE_APPROVAL' ? 'Initial verification (1.0×)' : 'In-service (2.0×)'}</strong></span>
        </div>
      </div>
    </div>
  );
};

export default ErrorCorridorChart;
