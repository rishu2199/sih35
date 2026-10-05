import React, { useState } from 'react';
import { Target, TrendingUp, Info } from 'lucide-react';
import { RepeatabilityReading } from './RepeatabilitySequenceTable';

interface DispersionScatterChartProps {
  readings: RepeatabilityReading[];
  allowableLimitGrams: number;
  selectedRunId?: number;
  onSelectRun: (runNumber: number) => void;
  minError: number;
  maxError: number;
  spread: number;
}

export const DispersionScatterChart: React.FC<DispersionScatterChartProps> = ({
  readings,
  allowableLimitGrams,
  selectedRunId,
  onSelectRun,
  minError,
  maxError,
  spread,
}) => {
  const [hoveredRun, setHoveredRun] = useState<RepeatabilityReading | null>(null);

  const completedReadings = readings.filter((r) => r.errorGrams !== undefined);

  // SVG dimensions
  const SVG_W = 700;
  const SVG_H = 240;
  const PAD_L = 65;
  const PAD_R = 40;
  const PAD_T = 25;
  const PAD_B = 35;

  const PLOT_W = SVG_W - PAD_L - PAD_R;
  const PLOT_H = SVG_H - PAD_T - PAD_B;

  // Dynamic Y scale accommodating outliers (e.g. +6.0g outlier)
  const maxObsError = Math.max(...readings.map((r) => Math.abs(r.errorGrams ?? 0)), allowableLimitGrams);
  const Y_BOUND = Math.max(allowableLimitGrams * 1.5, Math.ceil(maxObsError * 1.2));
  const Y_MAX = Y_BOUND;
  const Y_MIN = -Y_BOUND;

  const getX = (run: number) => {
    // 10 runs spaced evenly from 1 to 10
    return PAD_L + ((run - 0.5) / 10) * PLOT_W;
  };

  const getY = (errGrams: number) => {
    const norm = (errGrams - Y_MIN) / (Y_MAX - Y_MIN);
    return PAD_T + PLOT_H - norm * PLOT_H;
  };

  const zeroY = getY(0);
  const posLimitY = getY(allowableLimitGrams);
  const negLimitY = getY(-allowableLimitGrams);

  return (
    <div className="bg-white rounded-xl border border-foundation-200 p-4 sm:p-5 shadow-xs flex flex-col justify-between select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-foundation-100 gap-2">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-brand-600" />
          <h3 className="text-xs font-bold text-foundation-900 uppercase font-mono tracking-wider">
            READING DISPERSION &amp; SCATTER CORRIDOR (10 REPEATED RUNS)
          </h3>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-foundation-500">
            Min Error:{' '}
            <span className="font-bold text-foundation-900">
              {(minError > 0 ? '+' : '') + minError.toFixed(1)} g
            </span>
          </span>
          <span className="text-foundation-300">•</span>
          <span className="text-foundation-500">
            Max Error:{' '}
            <span className="font-bold text-foundation-900">
              {(maxError > 0 ? '+' : '') + maxError.toFixed(1)} g
            </span>
          </span>
          <span className="text-foundation-300">•</span>
          <span className="text-brand-700 font-bold bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
            Spread Δ = {spread.toFixed(1)} g
          </span>
        </div>
      </div>

      {/* SVG Scatter Canvas */}
      <div className="relative w-full overflow-x-auto py-2">
        <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full h-auto min-w-[560px] max-h-[240px]">
          {/* Shaded Allowable Dispersion Corridor (§12) */}
          <rect
            x={PAD_L}
            y={posLimitY}
            width={PLOT_W}
            height={negLimitY - posLimitY}
            fill="#F0FDF4"
            opacity="0.8"
          />

          {/* Upper Allowable Boundary (+MPE) */}
          <line
            x1={PAD_L}
            y1={posLimitY}
            x2={PAD_L + PLOT_W}
            y2={posLimitY}
            stroke="#E11D48"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
          <text
            x={PAD_L - 8}
            y={posLimitY + 3}
            textAnchor="end"
            className="text-[10px] font-mono font-bold fill-rose-600"
          >
            +{allowableLimitGrams.toFixed(1)}g Limit
          </text>

          {/* Zero Error Baseline */}
          <line
            x1={PAD_L}
            y1={zeroY}
            x2={PAD_L + PLOT_W}
            y2={zeroY}
            stroke="#64748B"
            strokeWidth="1.2"
          />
          <text
            x={PAD_L - 8}
            y={zeroY + 3}
            textAnchor="end"
            className="text-[10px] font-mono font-bold fill-slate-600"
          >
            0.0 g
          </text>

          {/* Lower Allowable Boundary (-MPE) */}
          <line
            x1={PAD_L}
            y1={negLimitY}
            x2={PAD_L + PLOT_W}
            y2={negLimitY}
            stroke="#E11D48"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
          <text
            x={PAD_L - 8}
            y={negLimitY + 3}
            textAnchor="end"
            className="text-[10px] font-mono font-bold fill-rose-600"
          >
            -{allowableLimitGrams.toFixed(1)}g Limit
          </text>

          {/* X Axis Columns for 10 Runs */}
          {Array.from({ length: 10 }).map((_, i) => {
            const runNum = i + 1;
            const x = getX(runNum);
            const isSelected = selectedRunId === runNum;

            return (
              <g key={runNum}>
                {/* Vertical Run Column Grid */}
                <line
                  x1={x}
                  y1={PAD_T}
                  x2={x}
                  y2={PAD_T + PLOT_H}
                  stroke={isSelected ? '#3B82F6' : '#E2E8F0'}
                  strokeWidth={isSelected ? '1.5' : '1'}
                  strokeDasharray={isSelected ? '3 3' : '2 2'}
                />

                {/* X Axis Label */}
                <text
                  x={x}
                  y={PAD_T + PLOT_H + 18}
                  textAnchor="middle"
                  className={`text-[10px] font-mono font-bold ${
                    isSelected ? 'fill-brand-600' : 'fill-slate-500'
                  }`}
                >
                  R{runNum.toString().padStart(2, '0')}
                </text>
              </g>
            );
          })}

          {/* Scatter Plot Points */}
          {completedReadings.map((r) => {
            const x = getX(r.run);
            const y = getY(r.errorGrams ?? 0);
            const isSelected = selectedRunId === r.run;
            const isHovered = hoveredRun?.run === r.run;
            const isOutlier = r.isOutlier || (r.errorGrams !== undefined && Math.abs(r.errorGrams) > allowableLimitGrams);

            return (
              <g
                key={r.run}
                className="cursor-pointer transition-transform"
                onClick={() => onSelectRun(r.run)}
                onMouseEnter={() => setHoveredRun(r)}
                onMouseLeave={() => setHoveredRun(null)}
              >
                {/* Outlier Crimson Halo (§27) */}
                {isOutlier && (
                  <circle
                    cx={x}
                    cy={y}
                    r={14}
                    fill="#FEE2E2"
                    stroke="#E11D48"
                    strokeWidth="1.5"
                    strokeDasharray="3 2"
                    className="animate-pulse"
                  />
                )}

                {/* Highlight Circle if Selected or Hovered */}
                {(isSelected || isHovered) && !isOutlier && (
                  <circle
                    cx={x}
                    cy={y}
                    r={11}
                    fill="#EFF6FF"
                    stroke="#2563EB"
                    strokeWidth="2"
                  />
                )}

                {/* Main Scatter Point */}
                <circle
                  cx={x}
                  cy={y}
                  r={isOutlier ? 6.5 : isSelected ? 6 : 5}
                  fill={isOutlier ? '#E11D48' : isSelected ? '#1D4ED8' : '#059669'}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />

                {/* Error Value Floating Label */}
                <text
                  x={x}
                  y={y - 9}
                  textAnchor="middle"
                  className={`text-[9px] font-mono font-bold ${
                    isOutlier ? 'fill-rose-700' : 'fill-slate-800'
                  }`}
                >
                  {(r.errorGrams ?? 0) > 0 ? '+' : ''}
                  {(r.errorGrams ?? 0).toFixed(1)}g
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay (§11) */}
        {hoveredRun && hoveredRun.errorGrams !== undefined && (
          <div
            className="absolute z-20 pointer-events-none bg-foundation-900 text-white rounded-lg p-2.5 shadow-xl text-xs font-mono space-y-1"
            style={{
              left: `${Math.min(SVG_W - 160, Math.max(10, getX(hoveredRun.run) - 60))}px`,
              top: '10px',
            }}
          >
            <div className="font-bold text-brand-300 border-b border-foundation-700 pb-1 flex items-center justify-between gap-3">
              <span>Run #{hoveredRun.run.toString().padStart(2, '0')}</span>
              <span className={hoveredRun.isOutlier ? 'text-rose-400' : 'text-emerald-400'}>
                {hoveredRun.isOutlier ? '✕ OUTLIER' : '✓ PASS'}
              </span>
            </div>
            <div className="text-[11px] space-y-0.5 pt-0.5">
              <div className="flex justify-between gap-3">
                <span className="text-foundation-400">Observed Reading:</span>
                <span className="font-bold">{hoveredRun.observedReading?.toFixed(3)} kg</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-foundation-400">Corrected Error:</span>
                <span className="font-bold text-amber-300">
                  {(hoveredRun.errorGrams > 0 ? '+' : '') + hoveredRun.errorGrams.toFixed(1)} g
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-foundation-400">Zero Return:</span>
                <span className="text-emerald-300">
                  {hoveredRun.zeroReturnConfirmed ? '0.000 kg ✓' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-2 border-t border-foundation-100 flex items-center justify-between text-[11px] font-mono text-foundation-500">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
          <span>Compliant Cycle</span>
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600 ml-2" />
          <span>Statutory Outlier / Exceeded Limit</span>
        </div>
        <span>Click any run point to inspect in table</span>
      </div>
    </div>
  );
};
