import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, RotateCcw, Info } from 'lucide-react';

interface SpiritLevelHeroProps {
  tilt: number;
  onTiltChange: (newTilt: number) => void;
  onRecordFinding?: (tiltVal: number) => void;
  isReadOnly?: boolean;
}

export const SpiritLevelHero: React.FC<SpiritLevelHeroProps> = ({
  tilt,
  onTiltChange,
  onRecordFinding,
  isReadOnly = false,
}) => {
  const [tiltAngle, setTiltAngle] = useState<number>(45); // direction angle in degrees for 2D position

  // Statutory acceptance thresholds under OIML R 76-1 Section 3.9.1:
  // ≤ 0.35°: Green / Within range / Level OK (§9)
  // 0.36°–0.50°: Amber / Near limit (§10)
  // > 0.50°: Red / Level check failed (§11)
  const isAcceptable = tilt <= 0.35;
  const isNearLimit = tilt > 0.35 && tilt <= 0.50;
  const isFailed = tilt > 0.50;

  // Geometry calculations for the circular vial SVG
  // Center is at (100, 100). Max radius is 75px. 0.50° tolerance circle is at radius 35px.
  const offsetRadius = (tilt / 0.50) * 35;
  const rad = (tiltAngle * Math.PI) / 180;
  const bubbleX = 100 + Math.cos(rad) * offsetRadius;
  const bubbleY = 100 + Math.sin(rad) * offsetRadius;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between space-y-4">
      {/* Header with Traffic Light Status (§9, §10, §11) */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
            SPIRIT LEVEL (§9–12)
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">
            OIML R 76-1 Cl. 3.9.1 Leveled Alignment
          </span>
        </div>

        <div
          className={`px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 transition-colors ${
            isAcceptable
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
              : isNearLimit
              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
              : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-300 ring-2 ring-red-500/20'
          }`}
        >
          {isAcceptable ? (
            <>
              <CheckCircle2 size={13} className="text-emerald-600" />
              <span>✓ LEVEL OK</span>
            </>
          ) : isNearLimit ? (
            <>
              <AlertTriangle size={13} className="text-amber-600" />
              <span>⚠ NEAR LIMIT</span>
            </>
          ) : (
            <>
              <XCircle size={13} className="text-red-600" />
              <span>✕ LEVEL CHECK FAILED</span>
            </>
          )}
        </div>
      </div>

      {/* Circular Spirit Level Bubble Graphic */}
      <div className="flex flex-col items-center justify-center py-2 select-none">
        <div className="relative w-44 h-44">
          <svg className="w-full h-full" viewBox="0 0 200 200">
            <defs>
              <radialGradient id="vialFluidOk" cx="50%" cy="50%" r="50%" fx="40%" fy="40%">
                <stop offset="0%" stopColor="#ECFDF5" />
                <stop offset="70%" stopColor="#D1FAE5" />
                <stop offset="100%" stopColor="#A7F3D0" />
              </radialGradient>
              <radialGradient id="vialFluidWarn" cx="50%" cy="50%" r="50%" fx="40%" fy="40%">
                <stop offset="0%" stopColor="#FFFBEB" />
                <stop offset="70%" stopColor="#FEF3C7" />
                <stop offset="100%" stopColor="#FDE68A" />
              </radialGradient>
              <radialGradient id="vialFluidFail" cx="50%" cy="50%" r="50%" fx="40%" fy="40%">
                <stop offset="0%" stopColor="#FEF2F2" />
                <stop offset="70%" stopColor="#FEE2E2" />
                <stop offset="100%" stopColor="#FECACA" />
              </radialGradient>
            </defs>

            {/* Outer Brass / Aluminum Ring */}
            <circle cx="100" cy="100" r="92" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="6" />
            <circle
              cx="100"
              cy="100"
              r="86"
              fill={isAcceptable ? 'url(#vialFluidOk)' : isNearLimit ? 'url(#vialFluidWarn)' : 'url(#vialFluidFail)'}
              stroke="#94A3B8"
              strokeWidth="2"
            />

            {/* Concentric Crosshairs */}
            <line x1="100" y1="20" x2="100" y2="180" stroke="#64748B" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
            <line x1="20" y1="100" x2="180" y2="100" stroke="#64748B" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />

            {/* Inner Acceptance Target Circle (Threshold ≤ 0.50°) */}
            <circle
              cx="100"
              cy="100"
              r="35"
              fill="none"
              stroke={isAcceptable ? '#059669' : isNearLimit ? '#D97706' : '#DC2626'}
              strokeWidth="2"
              strokeDasharray="4 2"
            />
            <circle cx="100" cy="100" r="4" fill="#64748B" opacity="0.6" />

            {/* Interactive Spirit Level Bubble */}
            <g
              transform={`translate(${bubbleX}, ${bubbleY})`}
              className="transition-transform duration-100 ease-out"
            >
              <circle
                r="18"
                fill={isAcceptable ? '#10B981' : isNearLimit ? '#F59E0B' : '#EF4444'}
                fillOpacity="0.85"
                stroke={isAcceptable ? '#047857' : isNearLimit ? '#B45309' : '#B91C1C'}
                strokeWidth="2.5"
                filter="drop-shadow(0 4px 6px rgba(0,0,0,0.15))"
              />
              <circle cx="-5" cy="-5" r="4" fill="white" fillOpacity="0.7" />
            </g>
          </svg>
        </div>

        {/* Readout Metrics */}
        <div className="text-center font-mono mt-2">
          <div className="text-xl font-black text-slate-900 dark:text-white">
            Tilt: {tilt.toFixed(2)}°
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {isAcceptable
              ? '✓ Within acceptance range (≤ 0.50°)'
              : isNearLimit
              ? '⚠ Off-center near statutory boundary'
              : '✕ Exceeds permissible level limit (≤ 0.50°)'}
          </div>
        </div>
      </div>

      {/* Interactive Tilt Slider (§12) */}
      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="font-sans font-bold text-slate-500 uppercase text-[10px]">
            Simulate Leg Tilt (§12)
          </span>
          <span className="font-bold text-blue-600 dark:text-blue-400">{tilt.toFixed(2)}°</span>
        </div>

        <input
          type="range"
          min="0.00"
          max="0.90"
          step="0.01"
          value={tilt}
          disabled={isReadOnly}
          onChange={(e) => onTiltChange(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />

        <div className="flex justify-between text-[10px] font-mono text-slate-400">
          <span>0.00° (Level)</span>
          <span className="text-amber-600">0.50° (Limit)</span>
          <span className="text-red-600">0.90° (Defect)</span>
        </div>
      </div>

      {/* Record Finding Action if failed (§11) */}
      {isFailed && onRecordFinding && !isReadOnly && (
        <button
          type="button"
          onClick={() => onRecordFinding(tilt)}
          className="w-full py-2 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
        >
          <span>Record Spirit Level Defect Finding</span>
        </button>
      )}
    </div>
  );
};
