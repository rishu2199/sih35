import React, { useState } from 'react';
import { TrendingUp, Layers, CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';

export interface WeighingPoint {
  id: string;
  series: 'ascending' | 'descending';
  stepIndex: number;
  targetLoad: number; // in kg
  observedReading?: number; // in kg
  errorGrams?: number; // in grams
  mpeGrams: number; // in grams
  status: 'PASS' | 'MARGINAL' | 'FAIL' | 'PENDING';
  turningPointP?: number;
  deltaL?: number;
}

interface ErrorCorridorChartProps {
  points: WeighingPoint[];
  selectedPointId?: string;
  onSelectPoint?: (point: WeighingPoint) => void;
  verificationStageMultiplier: number; // 1 for Initial, 2 for Subsequent
  isExpandedChartOnly?: boolean;
}

export const ErrorCorridorChart: React.FC<ErrorCorridorChartProps> = ({
  points,
  selectedPointId,
  onSelectPoint,
  verificationStageMultiplier,
  isExpandedChartOnly = false,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<WeighingPoint | null>(null);

  // Filter completed points that have an error reading
  const completedPoints = points.filter((p) => p.errorGrams !== undefined && p.status !== 'PENDING');

  // Chart coordinates
  const SVG_WIDTH = 800;
  const SVG_HEIGHT = isExpandedChartOnly ? 380 : 270;
  const PAD_LEFT = 75;
  const PAD_RIGHT = 40;
  const PAD_TOP = 30;
  const PAD_BOTTOM = 45;

  const PLOT_W = SVG_WIDTH - PAD_LEFT - PAD_RIGHT;
  const PLOT_H = SVG_HEIGHT - PAD_TOP - PAD_BOTTOM;

  const MAX_LOAD = 30; // 30 kg capacity
  // Scale Y to accommodate max MPE (7.5g * 2 = 15g in subsequent verification or ±9g in initial)
  const maxMpeDisplay = 8.5 * verificationStageMultiplier;
  const MAX_ERROR = maxMpeDisplay;
  const MIN_ERROR = -maxMpeDisplay;

  const getX = (loadKg: number) => {
    return PAD_LEFT + (Math.max(0, Math.min(MAX_LOAD, loadKg)) / MAX_LOAD) * PLOT_W;
  };

  const getY = (errorGrams: number) => {
    const clamped = Math.max(MIN_ERROR, Math.min(MAX_ERROR, errorGrams));
    const normalized = (clamped - MIN_ERROR) / (MAX_ERROR - MIN_ERROR);
    return PAD_TOP + PLOT_H - normalized * PLOT_H;
  };

  const zeroY = getY(0);

  // OIML R 76-1 Table 6 Stepped MPE Corridor Generator
  // m <= 2.5kg: 2.5g; 2.5kg < m <= 10kg: 5.0g; 10kg < m <= 30kg: 7.5g
  const getStatutoryMpe = (loadKg: number) => {
    if (loadKg <= 2.5) return 2.5 * verificationStageMultiplier;
    if (loadKg <= 10.0) return 5.0 * verificationStageMultiplier;
    return 7.5 * verificationStageMultiplier;
  };

  // Generate stepped path for positive MPE boundary
  const posMpeSteps = [
    { x: getX(0), y: getY(2.5 * verificationStageMultiplier) },
    { x: getX(2.5), y: getY(2.5 * verificationStageMultiplier) },
    { x: getX(2.5), y: getY(5.0 * verificationStageMultiplier) },
    { x: getX(10.0), y: getY(5.0 * verificationStageMultiplier) },
    { x: getX(10.0), y: getY(7.5 * verificationStageMultiplier) },
    { x: getX(30.0), y: getY(7.5 * verificationStageMultiplier) },
  ];

  const posMpePath = posMpeSteps.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`).join(' ');

  // Generate stepped path for negative MPE boundary
  const negMpeSteps = [
    { x: getX(30.0), y: getY(-7.5 * verificationStageMultiplier) },
    { x: getX(10.0), y: getY(-7.5 * verificationStageMultiplier) },
    { x: getX(10.0), y: getY(-5.0 * verificationStageMultiplier) },
    { x: getX(2.5), y: getY(-5.0 * verificationStageMultiplier) },
    { x: getX(2.5), y: getY(-2.5 * verificationStageMultiplier) },
    { x: getX(0), y: getY(-2.5 * verificationStageMultiplier) },
  ];

  const negMpePath = negMpeSteps.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`).join(' ');

  // Complete filled corridor polygon
  const corridorFillPath = `${posMpePath} L ${negMpeSteps[0].x} ${negMpeSteps[0].y} ${negMpePath.replace('M', 'L')} Z`;

  // Group points by series
  const ascPoints = completedPoints.filter((p) => p.series === 'ascending');
  const dscPoints = completedPoints.filter((p) => p.series === 'descending');

  // Build SVG path lines
  const ascPath = ascPoints
    .slice()
    .sort((a, b) => a.targetLoad - b.targetLoad)
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.targetLoad)} ${getY(p.errorGrams!)}`)
    .join(' ');

  const dscPath = dscPoints
    .slice()
    .sort((a, b) => b.targetLoad - a.targetLoad)
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.targetLoad)} ${getY(p.errorGrams!)}`)
    .join(' ');

  return (
    <div className="bg-white rounded-xl border border-foundation-200 p-4 sm:p-5 shadow-xs flex flex-col justify-between select-none">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-foundation-100 gap-2">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-brand-600" />
          <h3 className="text-xs font-bold text-foundation-900 uppercase font-mono tracking-wider">
            {isExpandedChartOnly ? 'WEIGHING ERROR — STATUTORY ERROR CORRIDOR' : 'ERROR CORRIDOR VISUALIZATION (OIML R 76-1 CL 3.5)'}
          </h3>
          <span className="text-[10px] font-mono font-bold bg-foundation-100 text-foundation-700 px-2 py-0.5 rounded">
            Class III · e = 5 g · {verificationStageMultiplier}× MPE
          </span>
        </div>

        {/* Legend per spec §22: ● Ascending · ◆ Descending */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
            <span className="text-foundation-600 font-semibold">● Ascending (0 → Max)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rotate-45 bg-purple-600 inline-block" />
            <span className="text-foundation-600 font-semibold">◆ Descending (Max → 0)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-0.5 border-t-2 border-dashed border-rose-500 inline-block" />
            <span className="text-rose-600 font-bold">±MPE Statutory Tolerance</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative w-full overflow-x-auto py-2">
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="w-full h-auto min-w-[650px]"
        >
          <defs>
            {/* Gradient for permissible tolerance corridor */}
            <linearGradient id="corridorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.12" />
              <stop offset="50%" stopColor="#10B981" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.12" />
            </linearGradient>
          </defs>

          {/* Shaded Statutory Legal Tolerance Corridor (Between -MPE and +MPE) */}
          <path d={corridorFillPath} fill="url(#corridorGradient)" />

          {/* Stepped Positive MPE Boundary */}
          <path
            d={posMpePath}
            fill="none"
            stroke="#E11D48"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />

          {/* Stepped Negative MPE Boundary */}
          <path
            d={negMpePath}
            fill="none"
            stroke="#E11D48"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />

          {/* MPE Tier Labels along the stepped boundary */}
          <text
            x={getX(1.25)}
            y={getY(2.5 * verificationStageMultiplier) - 5}
            textAnchor="middle"
            className="text-[9px] font-mono font-bold fill-rose-600"
          >
            +{(2.5 * verificationStageMultiplier).toFixed(1)}g (±0.5e)
          </text>
          <text
            x={getX(6.25)}
            y={getY(5.0 * verificationStageMultiplier) - 5}
            textAnchor="middle"
            className="text-[9px] font-mono font-bold fill-rose-600"
          >
            +{(5.0 * verificationStageMultiplier).toFixed(1)}g (±1.0e)
          </text>
          <text
            x={getX(20.0)}
            y={getY(7.5 * verificationStageMultiplier) - 5}
            textAnchor="middle"
            className="text-[9px] font-mono font-bold fill-rose-600"
          >
            +{(7.5 * verificationStageMultiplier).toFixed(1)}g (±1.5e)
          </text>

          {/* Negative MPE Labels */}
          <text
            x={getX(1.25)}
            y={getY(-2.5 * verificationStageMultiplier) + 12}
            textAnchor="middle"
            className="text-[9px] font-mono font-bold fill-rose-600"
          >
            -{(2.5 * verificationStageMultiplier).toFixed(1)}g
          </text>
          <text
            x={getX(6.25)}
            y={getY(-5.0 * verificationStageMultiplier) + 12}
            textAnchor="middle"
            className="text-[9px] font-mono font-bold fill-rose-600"
          >
            -{(5.0 * verificationStageMultiplier).toFixed(1)}g
          </text>
          <text
            x={getX(20.0)}
            y={getY(-7.5 * verificationStageMultiplier) + 12}
            textAnchor="middle"
            className="text-[9px] font-mono font-bold fill-rose-600"
          >
            -{(7.5 * verificationStageMultiplier).toFixed(1)}g
          </text>

          {/* Zero Error Baseline */}
          <line
            x1={PAD_LEFT}
            y1={zeroY}
            x2={PAD_LEFT + PLOT_W}
            y2={zeroY}
            stroke="#475569"
            strokeWidth="1.2"
          />
          <text
            x={PAD_LEFT - 8}
            y={zeroY + 3}
            textAnchor="end"
            className="text-[10px] font-mono font-bold fill-slate-700"
          >
            0.0 g
          </text>

          {/* Vertical Grid Lines & Load Labels */}
          {[0, 2.5, 5, 10, 15, 20, 25, 30].map((load) => {
            const x = getX(load);
            return (
              <g key={load}>
                <line
                  x1={x}
                  y1={PAD_TOP}
                  x2={x}
                  y2={PAD_TOP + PLOT_H}
                  stroke="#E2E8F0"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
                <text
                  x={x}
                  y={PAD_TOP + PLOT_H + 18}
                  textAnchor="middle"
                  className="text-[10px] font-mono font-medium fill-slate-500"
                >
                  {load} kg
                </text>
              </g>
            );
          })}

          {/* X Axis Title */}
          <text
            x={PAD_LEFT + PLOT_W / 2}
            y={SVG_HEIGHT - 6}
            textAnchor="middle"
            className="text-[10px] font-mono font-bold uppercase fill-slate-400 tracking-wider"
          >
            Nominal Test Load L (0 → 30 kg)
          </text>

          {/* Ascending Trend Line */}
          {ascPath && (
            <path
              d={ascPath}
              fill="none"
              stroke="#2563EB"
              strokeWidth="2"
              className="transition-all duration-300"
            />
          )}

          {/* Descending Trend Line */}
          {dscPath && (
            <path
              d={dscPath}
              fill="none"
              stroke="#9333EA"
              strokeWidth="2"
              strokeDasharray="5 3"
              className="transition-all duration-300"
            />
          )}

          {/* Render Points per spec §22: ● Ascending (circles) and ◆ Descending (diamonds) */}
          {completedPoints.map((pt) => {
            const cx = getX(pt.targetLoad);
            const cy = getY(pt.errorGrams!);
            const isSelected = selectedPointId === pt.id;
            const isAsc = pt.series === 'ascending';
            const isFail = pt.status === 'FAIL';
            const isMarginal = pt.status === 'MARGINAL';

            // Near-limit color shifting per §24 and fail per §25
            const fillColor = isFail
              ? '#E11D48' // Crimson
              : isMarginal
              ? '#D97706' // Amber
              : isAsc
              ? '#2563EB' // Royal Blue for Ascending
              : '#9333EA'; // Purple for Descending

            return (
              <g
                key={pt.id}
                className="cursor-pointer transition-transform hover:scale-125"
                onMouseEnter={() => setHoveredPoint(pt)}
                onMouseLeave={() => setHoveredPoint(null)}
                onClick={() => onSelectPoint && onSelectPoint(pt)}
              >
                {/* Glow ring for selected point */}
                {isSelected && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r="10"
                    fill={fillColor}
                    fillOpacity="0.25"
                    stroke={fillColor}
                    strokeWidth="1.5"
                  />
                )}

                {/* Ascending = Circle ● per §22 */}
                {isAsc ? (
                  <circle
                    cx={cx}
                    cy={cy}
                    r="5.5"
                    fill={fillColor}
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    className="shadow-sm"
                  />
                ) : (
                  /* Descending = Diamond ◆ per §22 */
                  <polygon
                    points={`${cx},${cy - 6.5} ${cx + 6.5},${cy} ${cx},${cy + 6.5} ${cx - 6.5},${cy}`}
                    fill={fillColor}
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    className="shadow-sm"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay (Spec §23) */}
        {hoveredPoint && (
          <div
            className="absolute z-20 bg-slate-900/95 text-white backdrop-blur-md rounded-lg p-3 shadow-xl text-xs font-mono pointer-events-none border border-slate-700 animate-in fade-in zoom-in-95"
            style={{
              top: `${Math.max(10, getY(hoveredPoint.errorGrams!) - 75)}px`,
              left: `${Math.min(520, getX(hoveredPoint.targetLoad) + 15)}px`,
            }}
          >
            <div className="flex items-center justify-between gap-3 border-b border-slate-700 pb-1 mb-1.5">
              <span className="font-bold text-amber-300 uppercase">
                {hoveredPoint.series === 'ascending' ? '● ASCENDING' : '◆ DESCENDING'} #{hoveredPoint.stepIndex}
              </span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                  hoveredPoint.status === 'PASS'
                    ? 'bg-emerald-900 text-emerald-300 border border-emerald-700'
                    : hoveredPoint.status === 'MARGINAL'
                    ? 'bg-amber-900 text-amber-300 border border-amber-700'
                    : 'bg-rose-900 text-rose-300 border border-rose-700'
                }`}
              >
                {hoveredPoint.status}
              </span>
            </div>
            <div className="text-[11px] space-y-1">
              <p>Load: <span className="text-white font-bold">{hoveredPoint.targetLoad.toFixed(3)} kg</span></p>
              <p>Error: <span className="text-white font-bold">{(hoveredPoint.errorGrams! > 0 ? '+' : '') + hoveredPoint.errorGrams!.toFixed(1)} g</span></p>
              <p>Limit: <span className="text-slate-300 font-bold">±{(hoveredPoint.mpeGrams * verificationStageMultiplier).toFixed(1)} g</span></p>
              <p className="text-[10px] text-slate-400 pt-0.5 border-t border-slate-800">
                Click point to select in observation table
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Chart Footer Insight */}
      <div className="pt-2 border-t border-foundation-100 flex flex-col sm:flex-row sm:items-center sm:justify-between text-[11px] font-mono text-foundation-500 gap-1">
        <span>Evaluated: {completedPoints.length} of {points.length} points</span>
        <div className="flex items-center gap-2">
          {completedPoints.some((p) => p.status === 'FAIL') ? (
            <span className="text-rose-700 font-bold flex items-center gap-1">
              <XCircle size={13} />
              <span>✕ Statutory Out-of-Tolerance Point Detected</span>
            </span>
          ) : completedPoints.some((p) => p.status === 'MARGINAL') ? (
            <span className="text-amber-700 font-bold flex items-center gap-1">
              <AlertTriangle size={13} />
              <span>⚠ Marginal Linear Drift Near MPE Corridor Boundary</span>
            </span>
          ) : (
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle2 size={13} />
              <span>✓ All Points Within Safe Metrological Corridor</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
