import React from 'react';
import { Compass, CheckCircle2, AlertTriangle, XCircle, ArrowUpRight, Star } from 'lucide-react';
import { PlatterGeometry } from './PlatterGeometrySelector';

export interface EccentricityPosition {
  id: string;
  label: string;
  name: string;
  x: number;
  y: number;
  targetLoad: number; // in kg
  observedReading?: number; // in kg
  errorGrams?: number; // in grams
  mpeGrams: number;
  status: 'PASS' | 'MARGINAL' | 'FAIL' | 'PENDING';
}

interface PlatterVisualizerProps {
  geometry: PlatterGeometry;
  positions: EccentricityPosition[];
  selectedPositionId: string;
  onSelectPosition: (positionId: string) => void;
  mpeGrams: number;
}

export const PlatterVisualizer: React.FC<PlatterVisualizerProps> = ({
  geometry,
  positions,
  selectedPositionId,
  onSelectPosition,
  mpeGrams,
}) => {
  const selectedPos = positions.find((p) => p.id === selectedPositionId) || positions[0];

  // Helper for status color per spec §5, §13
  const getNodeColor = (status: string, isSelected: boolean) => {
    if (status === 'FAIL') return '#E11D48'; // Crimson
    if (status === 'MARGINAL') return '#D97706'; // Amber
    if (status === 'PASS') return '#059669'; // Emerald
    if (isSelected) return '#2563EB'; // Active selection blue
    return '#94A3B8'; // Slate pending
  };

  // Find worst position for deflection angle per §12, §14
  const evaluatedPositions = positions.filter((p) => p.status !== 'PENDING' && p.errorGrams !== undefined);
  const worstPos = evaluatedPositions.reduce<EccentricityPosition | null>((worst, cur) => {
    if (!worst) return cur;
    return Math.abs(cur.errorGrams || 0) > Math.abs(worst.errorGrams || 0) ? cur : worst;
  }, null);

  // Deflection vector calculations from center (200, 200) to worstPos
  const deflTarget = worstPos && worstPos.id !== 'center' ? worstPos : selectedPos;
  const deflX = deflTarget ? deflTarget.x - 200 : 50;
  const deflY = deflTarget ? deflTarget.y - 200 : 50;
  const deflAngleRad = Math.atan2(deflY, deflX);
  const worstErrorAbs = worstPos ? Math.abs(worstPos.errorGrams || 0) : 0;
  const deflMagnitudeDeg = worstPos ? Math.min(0.95, parseFloat((worstErrorAbs * 0.08).toFixed(2))) : 0.06;
  const deflLen = Math.max(35, Math.min(85, 35 + worstErrorAbs * 8)); // scale arrow length with error

  const vectorEndX = 200 + Math.cos(deflAngleRad) * deflLen;
  const vectorEndY = 200 + Math.sin(deflAngleRad) * deflLen;

  // Mechanical canting direction description
  const getDirectionText = (angleRad: number) => {
    const deg = (angleRad * 180) / Math.PI;
    if (deg >= -45 && deg < 45) return 'Right (East)';
    if (deg >= 45 && deg < 135) return 'Rear-Right (South-East)';
    if (deg >= 135 || deg < -135) return 'Left (West)';
    return 'Front-Right (North-East)';
  };

  return (
    <div className="bg-white rounded-xl border border-foundation-200 p-5 shadow-xs flex flex-col justify-between select-none">
      {/* 1. Visualizer Header & Instructions per spec §10 */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-foundation-100 gap-2">
          <div className="flex items-center gap-2">
            <Compass size={16} className="text-brand-600" />
            <h3 className="text-xs font-bold text-foundation-900 uppercase font-mono tracking-wider">
              INTERACTIVE PLATTER LOAD VISUALIZER (OIML CL 3.6.2)
            </h3>
          </div>

          {/* Legend per spec §13 */}
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-foundation-600">≤50% MPE (Safe)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-foundation-600">50-100% (Warning)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-foundation-600">&gt;100% (Fail)</span>
            </div>
          </div>
        </div>

        {/* Load Positioning Instruction Strip per spec §10 */}
        <div className="mt-3 p-3 bg-brand-50/70 rounded-xl border border-brand-200/80 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono text-brand-950 uppercase tracking-wide">
                ACTIVE POSITION: {selectedPos.name.toUpperCase()}
              </span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-brand-200 text-brand-900">
                ★ Highlighted
              </span>
            </div>
            <p className="text-xs text-brand-800 mt-0.5">
              Place the prescribed test load ({selectedPos.targetLoad.toFixed(3)} kg) at the highlighted position on the platform.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-brand-900 bg-white px-2 py-1 rounded border border-brand-200 shrink-0">
            Target: {selectedPos.targetLoad.toFixed(3)} kg
          </span>
        </div>
      </div>

      {/* 2. Main SVG Platter Graphic */}
      <div className="relative w-full aspect-square max-h-[380px] my-3 flex items-center justify-center bg-foundation-50/60 rounded-xl border border-foundation-100 p-4 overflow-hidden">
        {/* Subtle coordinate grid backdrop */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#94A3B8 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        <svg viewBox="0 0 400 400" className="w-full h-full max-w-[340px] max-h-[340px]">
          <defs>
            <linearGradient id="platterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#F8FAFC" />
            </linearGradient>
            <filter id="loadGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#2563EB" floodOpacity="0.4" />
            </filter>
            <marker
              id="vectorArrow"
              markerWidth="10"
              markerHeight="8"
              refX="8"
              refY="4"
              orient="auto"
            >
              <polygon
                points="0 0, 10 4, 0 8"
                fill={worstPos?.status === 'FAIL' ? '#E11D48' : worstPos?.status === 'MARGINAL' ? '#D97706' : '#2563EB'}
              />
            </marker>
          </defs>

          {/* GEOMETRY 1: SQUARE PLATTER (Standard 4 corners + Center) per spec §4 */}
          {geometry === 'square' && (
            <g>
              {/* Outer Platter Edge Shadow */}
              <rect
                x="55"
                y="55"
                width="290"
                height="290"
                rx="18"
                fill="#E2E8F0"
                stroke="#CBD5E1"
                strokeWidth="4"
              />
              {/* Platter Surface */}
              <rect
                x="60"
                y="60"
                width="280"
                height="280"
                rx="14"
                fill="url(#platterGrad)"
                stroke="#94A3B8"
                strokeWidth="1.5"
              />

              {/* Sub-quadrant dividing reference lines */}
              <line x1="200" y1="60" x2="200" y2="340" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="60" y1="200" x2="340" y2="200" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="4 4" />

              {/* 1/4 Area Boundary Rings */}
              <circle cx="200" cy="200" r="48" fill="none" stroke="#E2E8F0" strokeWidth="1" />
            </g>
          )}

          {/* GEOMETRY 2: ROUND PLATTER (3 supports at 120°) per spec §21 */}
          {geometry === 'round' && (
            <g>
              <circle cx="200" cy="200" r="144" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="4" />
              <circle cx="200" cy="200" r="140" fill="url(#platterGrad)" stroke="#94A3B8" strokeWidth="1.5" />
              {/* 120-degree radial guide lines */}
              <line x1="200" y1="200" x2="200" y2="60" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="200" y1="200" x2="320" y2="270" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="200" y1="200" x2="80" y2="270" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="4 4" />
            </g>
          )}

          {/* GEOMETRY 3: ROLLING LOAD TRACK per spec §22 */}
          {geometry === 'rolling' && (
            <g>
              <rect x="50" y="80" width="300" height="240" rx="8" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="2" />
              <line x1="50" y1="120" x2="350" y2="120" stroke="#64748B" strokeWidth="4" />
              <line x1="50" y1="280" x2="350" y2="280" stroke="#64748B" strokeWidth="4" />
              {[90, 140, 190, 240, 290].map((tieX) => (
                <line key={tieX} x1={tieX} y1="110" x2={tieX} y2="290" stroke="#CBD5E1" strokeWidth="3" />
              ))}
            </g>
          )}

          {/* Dynamic 2D Deflection Vector Arrow per spec §14, §15 */}
          {worstPos && worstPos.id !== 'center' && worstPos.errorGrams !== undefined && (
            <g>
              <line
                x1="200"
                y1="200"
                x2={vectorEndX}
                y2={vectorEndY}
                stroke={worstPos.status === 'FAIL' ? '#E11D48' : worstPos.status === 'MARGINAL' ? '#D97706' : '#2563EB'}
                strokeWidth="3"
                markerEnd="url(#vectorArrow)"
                className="transition-all duration-300"
              />
              <circle
                cx="200"
                cy="200"
                r="4"
                fill={worstPos.status === 'FAIL' ? '#E11D48' : worstPos.status === 'MARGINAL' ? '#D97706' : '#2563EB'}
              />
            </g>
          )}

          {/* Test Position Nodes (Corners / Supports) */}
          {positions.map((pos) => {
            const isSelected = selectedPositionId === pos.id;
            const nodeColor = getNodeColor(pos.status, isSelected);

            return (
              <g
                key={pos.id}
                onClick={() => onSelectPosition(pos.id)}
                className="cursor-pointer transition-transform hover:scale-110"
              >
                {/* Target node touch target circle */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="24"
                  fill={isSelected ? '#DBEAFE' : '#F1F5F9'}
                  stroke={isSelected ? '#2563EB' : '#CBD5E1'}
                  strokeWidth={isSelected ? '2.5' : '1'}
                  className="transition-colors"
                />

                {/* Inner status ring */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="13"
                  fill={nodeColor}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  filter={isSelected ? 'url(#loadGlow)' : undefined}
                />

                {/* Node Label Text */}
                <text
                  x={pos.x}
                  y={pos.y + 4}
                  textAnchor="middle"
                  className="text-[11px] font-mono font-bold fill-white pointer-events-none select-none"
                >
                  {pos.label}
                </text>

                {/* Star marker ★ for active load position per spec §10 */}
                {isSelected && (
                  <text
                    x={pos.x + 18}
                    y={pos.y - 12}
                    className="text-sm font-bold fill-brand-600 animate-bounce pointer-events-none"
                  >
                    ★
                  </text>
                )}

                {/* Error Callout Pill above or below node */}
                {pos.errorGrams !== undefined && (
                  <g transform={`translate(${pos.x}, ${pos.y > 200 ? pos.y + 24 : pos.y - 20})`}>
                    <rect
                      x="-22"
                      y="-8"
                      width="44"
                      height="16"
                      rx="4"
                      fill={pos.status === 'FAIL' ? '#FFE4E6' : pos.status === 'MARGINAL' ? '#FEF3C7' : '#DCFCE7'}
                      stroke={pos.status === 'FAIL' ? '#FDA4AF' : pos.status === 'MARGINAL' ? '#FCD34D' : '#86EFAC'}
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      className={`text-[9px] font-mono font-bold ${
                        pos.status === 'FAIL'
                          ? 'fill-rose-700'
                          : pos.status === 'MARGINAL'
                          ? 'fill-amber-800'
                          : 'fill-emerald-800'
                      }`}
                    >
                      {(pos.errorGrams > 0 ? '+' : '') + pos.errorGrams.toFixed(1)}g
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Active Standard Load Pulsing Reticle on selected position */}
          <g
            transform={`translate(${selectedPos.x}, ${selectedPos.y})`}
            className="pointer-events-none transition-all duration-300"
          >
            <circle
              cx="0"
              cy="0"
              r="28"
              fill="none"
              stroke="#2563EB"
              strokeWidth="1.5"
              strokeDasharray="4 2"
              className="animate-spin"
            />
          </g>
        </svg>
      </div>

      {/* 3. Deflection / Mechanical Response Telemetry per spec §14, §15 */}
      <div className="bg-foundation-50 rounded-xl p-3.5 border border-foundation-200 font-mono text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-foundation-200 mb-2">
          <span className="text-[10px] font-bold text-foundation-500 uppercase tracking-wider">
            MECHANICAL CANTING / DEFLECTION RESPONSE
          </span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
              worstPos?.status === 'FAIL'
                ? 'bg-rose-100 text-rose-800'
                : worstPos?.status === 'MARGINAL'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {worstPos?.status === 'FAIL'
              ? '✕ Critical Torque Flex'
              : worstPos?.status === 'MARGINAL'
              ? '⚠ Elevated Deflection'
              : '✓ Within Normal Limits'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded bg-white border border-foundation-200 shadow-2xs">
            <span className="text-[9px] text-foundation-400 block uppercase font-bold">Deflection</span>
            <span className="font-bold text-foundation-900 text-sm">{deflMagnitudeDeg}°</span>
          </div>
          <div className="p-2 rounded bg-white border border-foundation-200 shadow-2xs">
            <span className="text-[9px] text-foundation-400 block uppercase font-bold">Direction</span>
            <span className="font-bold text-foundation-800">{getDirectionText(deflAngleRad)}</span>
          </div>
          <div className="p-2 rounded bg-white border border-foundation-200 shadow-2xs">
            <span className="text-[9px] text-foundation-400 block uppercase font-bold">Worst Position</span>
            <span className="font-bold text-foundation-950">{worstPos ? worstPos.name : '—'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
