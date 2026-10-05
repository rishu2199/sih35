import React, { useState, useEffect } from 'react';
import {
  Thermometer,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Activity,
  ArrowRight,
  Flame,
  Snowflake,
  ShieldCheck,
  RotateCcw,
  Info,
} from 'lucide-react';

export interface TemperatureStage {
  id: string;
  nominalTempC: number;
  label: string;
  subLabel?: string;
  actualTempC: number;
  targetLoadKg: number;
  observedReadingKg?: number;
  errorGrams?: number;
  allowableMpeGrams: number;
  soakTimeMinutes: number;
  requiredSoakMinutes?: number;
  status: 'DONE' | 'CURRENT' | 'PENDING';
  isFail?: boolean;
}

interface TemperatureDriftTabProps {
  stages: TemperatureStage[];
  currentStageId: string;
  onSelectStage: (stageId: string) => void;
  onOpenTraceDrawer?: (stageId: string) => void;
  disabled?: boolean;
}

export const TemperatureDriftTab: React.FC<TemperatureDriftTabProps> = ({
  stages,
  currentStageId,
  onSelectStage,
  onOpenTraceDrawer,
  disabled = false,
}) => {
  // Live soak timer ticker (18m 42s = 1122 seconds)
  const [soakSeconds, setSoakSeconds] = useState<number>(1122);
  const [hoveredStageId, setHoveredStageId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setSoakSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSecs: number) => {
    const minutes = Math.floor(totalSecs / 60);
    const seconds = totalSecs % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const activeStage = stages.find((s) => s.id === currentStageId) || stages[1];
  const hasFailure = stages.some((s) => s.isFail || (s.errorGrams && Math.abs(s.errorGrams) > s.allowableMpeGrams));
  const failedStage = stages.find((s) => s.isFail || (s.errorGrams && Math.abs(s.errorGrams) > s.allowableMpeGrams));

  // Worst drift calculation
  const evaluatedStages = stages.filter((s) => s.errorGrams !== undefined);
  const maxDriftGrams = evaluatedStages.length > 0
    ? Math.max(...evaluatedStages.map((s) => Math.abs(s.errorGrams ?? 0)))
    : 3.2;

  // SVG dimensions for Temperature Drift Chart (§16, §27)
  const SVG_W = 680;
  const SVG_H = 220;
  const PAD_L = 60;
  const PAD_R = 40;
  const PAD_T = 25;
  const PAD_B = 35;
  const PLOT_W = SVG_W - PAD_L - PAD_R;
  const PLOT_H = SVG_H - PAD_T - PAD_B;

  const Y_MAX = Math.max(5.0, Math.ceil(maxDriftGrams * 1.2));
  const Y_MIN = -Y_MAX;

  const getX = (idx: number) => {
    return PAD_L + (idx / (stages.length - 1)) * PLOT_W;
  };

  const getY = (val: number) => {
    const norm = (val - Y_MIN) / (Y_MAX - Y_MIN);
    return PAD_T + PLOT_H - norm * PLOT_H;
  };

  const zeroY = getY(0);
  const posLimitY = getY(5.0);
  const negLimitY = getY(-5.0);

  // Line coordinates
  const polylinePoints = evaluatedStages
    .map((s) => {
      const idx = stages.findIndex((st) => st.id === s.id);
      return `${getX(idx)},${getY(s.errorGrams || 0)}`;
    })
    .join(' ');

  // Thermal state classifier (§18)
  const getThermalState = () => {
    if (activeStage.status === 'DONE') {
      return {
        badge: '✓ STABLE · SOAK COMPLETE',
        color: 'text-emerald-700 bg-emerald-50 border-emerald-300',
        dot: 'bg-emerald-600',
        desc: `Target reached and soaked for ${activeStage.soakTimeMinutes} minutes.`,
      };
    }
    if (soakSeconds < 1200) {
      return {
        badge: '◌ SOAKING IN PROGRESS',
        color: 'text-amber-800 bg-amber-50 border-amber-300',
        dot: 'bg-amber-500 animate-pulse',
        desc: `Chamber stable. Soak remaining: ${formatTimer(Math.max(0, 1200 - soakSeconds))}`,
      };
    }
    return {
      badge: '🔥 HEATING TO TARGET',
      color: 'text-rose-800 bg-rose-50 border-rose-300',
      dot: 'bg-rose-500 animate-pulse',
      desc: 'Compressor / heating elements actively driving temperature profile.',
    };
  };

  const thermalState = getThermalState();

  return (
    <div className="space-y-6 select-none font-sans">
      {/* 1. Thermal Journey Header & 4-Point Journey Stepper (§12, §13, §15) */}
      <div className="bg-white rounded-xl border border-foundation-200 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-foundation-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-foundation-500 uppercase">
                OIML R 76-1 CL 3.9.2.1
              </span>
              <span className="text-foundation-300">•</span>
              <span className="text-xs font-mono font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                Controlled Thermal Journey
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-foundation-900 tracking-tight">
              TEMPERATURE DRIFT EVALUATION (+20°C → +40°C → −10°C → +20°C)
            </h3>
            <p className="text-xs text-foundation-500 mt-0.5">
              Observe zero indication drift and span error stability under controlled climatic chamber cycles.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-xs">
            <span className="px-2.5 py-1 rounded bg-foundation-100 text-foundation-700 font-bold border border-foundation-200">
              Statutory Limit: ±5.0 g (1.0 MPE)
            </span>
          </div>
        </div>

        {/* 4-Stage Horizontal Journey Rail (§13, §15) */}
        <div className="mt-5 pt-1">
          <div className="flex items-center justify-between text-xs font-mono relative">
            {/* Background connecting bar */}
            <div className="absolute top-4 left-8 right-8 h-0.5 bg-foundation-200 -z-0" />

            {stages.map((stage, idx) => {
              const isDone = stage.status === 'DONE';
              const isCurrent = stage.id === currentStageId;
              const isStageFailed = stage.isFail || (stage.errorGrams && Math.abs(stage.errorGrams) > stage.allowableMpeGrams);

              return (
                <div
                  key={stage.id}
                  onClick={() => onSelectStage(stage.id)}
                  className="flex flex-col items-center relative z-10 cursor-pointer group"
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      isStageFailed
                        ? 'bg-rose-600 text-white ring-4 ring-rose-100 shadow-sm'
                        : isDone
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : isCurrent
                        ? 'bg-brand-600 text-white ring-4 ring-brand-100 shadow-sm scale-110'
                        : 'bg-white text-foundation-400 border-2 border-foundation-300'
                    }`}
                  >
                    {isStageFailed ? (
                      <XCircle size={16} />
                    ) : isDone ? (
                      <CheckCircle2 size={16} />
                    ) : isCurrent ? (
                      <span>●</span>
                    ) : (
                      <span>○</span>
                    )}
                  </div>

                  <span
                    className={`mt-2 font-bold font-sans text-xs ${
                      isStageFailed
                        ? 'text-rose-700'
                        : isCurrent
                        ? 'text-brand-900 font-extrabold'
                        : isDone
                        ? 'text-foundation-900'
                        : 'text-foundation-400'
                    }`}
                  >
                    {stage.label}
                  </span>
                  <span className="text-[10px] text-foundation-500 font-mono">
                    {stage.subLabel || (idx === 0 ? 'Reference' : idx === 1 ? 'High' : idx === 2 ? 'Low' : 'Recovery')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Failure State Alert (§26, §37) */}
      {hasFailure && failedStage && (
        <div className="p-4 sm:p-5 rounded-xl bg-rose-50 border border-rose-300 text-rose-950 font-mono text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0">
              <XCircle size={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900">
                ✕ TEMPERATURE DRIFT FAILED — Sequence Halted at {failedStage.label} (§26)
              </h4>
              <p className="text-[11px] text-rose-800 font-sans mt-0.5">
                The instrument exceeded the allowable environmental drift during the {failedStage.label} stage (Observed error: +{failedStage.errorGrams?.toFixed(1)} g &gt; Limit: ±5.0 g).
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenTraceDrawer && onOpenTraceDrawer(failedStage.id)}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold transition-colors cursor-pointer self-start sm:self-auto shrink-0"
          >
            Inspect Stage
          </button>
        </div>
      )}

      {/* 3. Current Chamber Condition Card (§14) & Thermal States (§18) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CURRENT CHAMBER CONDITION (§14) */}
        <div className="bg-white rounded-xl border border-foundation-200 p-4 sm:p-5 shadow-xs font-mono text-xs space-y-3">
          <div className="flex items-center justify-between pb-2.5 border-b border-foundation-100">
            <div className="flex items-center gap-2">
              <Thermometer size={16} className="text-brand-600" />
              <h4 className="font-bold text-foundation-900 uppercase tracking-wider">
                CURRENT CHAMBER CONDITION (§14)
              </h4>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1.5 ${thermalState.color}`}>
              <span className={`w-2 h-2 rounded-full ${thermalState.dot}`} />
              <span>{thermalState.badge}</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-foundation-50 rounded-lg border border-foundation-100">
              <span className="text-[10px] text-foundation-400 block uppercase">Target Temp</span>
              <span className="text-lg font-bold text-foundation-900 mt-0.5 block">
                {activeStage.nominalTempC > 0 ? `+${activeStage.nominalTempC.toFixed(1)}` : activeStage.nominalTempC.toFixed(1)} °C
              </span>
            </div>

            <div className="p-2.5 bg-foundation-50 rounded-lg border border-foundation-100">
              <span className="text-[10px] text-foundation-400 block uppercase">Actual Temp</span>
              <span className="text-lg font-bold text-foundation-900 mt-0.5 block">
                {activeStage.actualTempC > 0 ? `+${activeStage.actualTempC.toFixed(1)}` : activeStage.actualTempC.toFixed(1)} °C
              </span>
            </div>

            <div className="p-2.5 bg-foundation-50 rounded-lg border border-foundation-100">
              <span className="text-[10px] text-foundation-400 block uppercase">Temp Difference</span>
              <span className="text-sm font-bold text-foundation-700 mt-0.5 block">
                {(activeStage.actualTempC - activeStage.nominalTempC).toFixed(1)} °C
              </span>
            </div>

            <div className="p-2.5 bg-foundation-50 rounded-lg border border-foundation-100">
              <span className="text-[10px] text-foundation-400 block uppercase">Soak Progress</span>
              <span className="text-sm font-bold text-brand-700 mt-0.5 block">
                {formatTimer(soakSeconds)} / 20:00
              </span>
            </div>
          </div>
        </div>

        {/* RECOVERY & THERMAL STABILITY STAGE (§28) */}
        <div className="bg-white rounded-xl border border-foundation-200 p-4 sm:p-5 shadow-xs font-mono text-xs space-y-3">
          <div className="flex items-center justify-between pb-2.5 border-b border-foundation-100">
            <div className="flex items-center gap-2">
              <RotateCcw size={16} className="text-cyan-600" />
              <h4 className="font-bold text-foundation-900 uppercase tracking-wider">
                THERMAL RECOVERY (§28)
              </h4>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
              −10°C → +20°C Stage
            </span>
          </div>

          <div className="p-3 rounded-lg bg-foundation-50 border border-foundation-200 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-foundation-500">Current Recovery Temp:</span>
              <span className="font-bold text-foundation-900 text-sm">+20.1 °C</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-foundation-500">Recovery Status:</span>
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 size={13} />
                <span>✓ Reference Temp Restored</span>
              </span>
            </div>
            <div className="w-full bg-foundation-200 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-full" />
            </div>
            <span className="text-[10px] text-foundation-400 block">
              Instrument restabilized at 20.0°C reference baseline after low-temperature exposure.
            </span>
          </div>
        </div>
      </div>

      {/* 4. Temperature Drift SVG Line Chart (§16, §27) */}
      <div className="bg-white rounded-xl border border-foundation-200 p-4 sm:p-5 shadow-xs font-mono text-xs select-none">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-foundation-100 gap-2">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-brand-600" />
            <h4 className="font-bold text-foundation-900 uppercase tracking-wider">
              TEMPERATURE DRIFT CORRIDOR &amp; OBSERVATION TREND (§16)
            </h4>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-foundation-500">
              Max Drift: <strong className={hasFailure ? 'text-rose-700' : 'text-foundation-900'}>{maxDriftGrams.toFixed(1)} g</strong>
            </span>
            <span className="text-foundation-300">•</span>
            <span className="text-foundation-500">
              Tolerance: <strong>±5.0 g</strong>
            </span>
          </div>
        </div>

        {/* SVG Canvas */}
        <div className="relative w-full overflow-x-auto py-2">
          <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full h-auto min-w-[580px] max-h-[220px]">
            {/* Allowable MPE Corridor */}
            <rect
              x={PAD_L}
              y={posLimitY}
              width={PLOT_W}
              height={negLimitY - posLimitY}
              fill="#F0FDF4"
              opacity="0.8"
            />

            {/* Upper Limit +MPE */}
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
              className="text-[10px] font-bold fill-rose-600"
            >
              +5.0 g Limit
            </text>

            {/* Zero Baseline */}
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
              className="text-[10px] font-bold fill-slate-600"
            >
              0.0 g
            </text>

            {/* Lower Limit -MPE */}
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
              className="text-[10px] font-bold fill-rose-600"
            >
              −5.0 g Limit
            </text>

            {/* Vertical Stage Grid & Stage Labels */}
            {stages.map((st, idx) => {
              const x = getX(idx);
              const isSelected = currentStageId === st.id;

              return (
                <g key={st.id}>
                  <line
                    x1={x}
                    y1={PAD_T}
                    x2={x}
                    y2={PAD_T + PLOT_H}
                    stroke={isSelected ? '#3B82F6' : '#E2E8F0'}
                    strokeWidth={isSelected ? '1.5' : '1'}
                    strokeDasharray={isSelected ? '3 3' : '2 2'}
                  />
                  <text
                    x={x}
                    y={PAD_T + PLOT_H + 18}
                    textAnchor="middle"
                    className={`text-[11px] font-bold ${
                      isSelected ? 'fill-brand-600' : 'fill-slate-600'
                    }`}
                  >
                    {st.label}
                  </text>
                </g>
              );
            })}

            {/* Measured Drift Polyline */}
            {evaluatedStages.length > 1 && (
              <polyline
                fill="none"
                stroke="#2563EB"
                strokeWidth="2.5"
                points={polylinePoints}
              />
            )}

            {/* Stage Points (§16, §27) */}
            {stages.map((st, idx) => {
              if (st.errorGrams === undefined) return null;
              const x = getX(idx);
              const y = getY(st.errorGrams);
              const isSelected = currentStageId === st.id;
              const isStageFailed = st.isFail || Math.abs(st.errorGrams) > st.allowableMpeGrams;

              return (
                <g
                  key={st.id}
                  className="cursor-pointer"
                  onClick={() => onSelectStage(st.id)}
                  onMouseEnter={() => setHoveredStageId(st.id)}
                  onMouseLeave={() => setHoveredStageId(null)}
                >
                  {isStageFailed && (
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

                  <circle
                    cx={x}
                    cy={y}
                    r={isStageFailed ? 7 : isSelected ? 6.5 : 5}
                    fill={isStageFailed ? '#E11D48' : isSelected ? '#1D4ED8' : '#059669'}
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />

                  {/* Point Floating Error Text */}
                  <text
                    x={x}
                    y={y - 9}
                    textAnchor="middle"
                    className={`text-[10px] font-bold ${
                      isStageFailed ? 'fill-rose-700' : 'fill-slate-800'
                    }`}
                  >
                    {(st.errorGrams > 0 ? '+' : '') + st.errorGrams.toFixed(1)}g
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* 5. Environmental Timeline (§17) & Result Summary (§25) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* TEST TIMELINE (§17) */}
        <div className="bg-white rounded-xl border border-foundation-200 p-4 sm:p-5 shadow-xs font-mono text-xs space-y-3">
          <div className="flex items-center gap-2 pb-2.5 border-b border-foundation-100">
            <Clock size={16} className="text-brand-600" />
            <h4 className="font-bold text-foundation-900 uppercase tracking-wider">
              TEST TIMELINE (§17)
            </h4>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-start gap-3 p-2 rounded bg-foundation-50 border border-foundation-100">
              <span className="font-bold text-foundation-500 shrink-0">16:21</span>
              <div>
                <span className="font-bold text-foundation-900">+20°C Reference Stage</span>
                <span className="text-[11px] text-emerald-700 font-semibold block">Baseline reference captured ✓ (0.0 g)</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2 rounded bg-foundation-50 border border-foundation-100">
              <span className="font-bold text-foundation-500 shrink-0">17:03</span>
              <div>
                <span className="font-bold text-foundation-900">+40°C High Temperature Stage</span>
                <span className={`text-[11px] font-semibold block ${hasFailure ? 'text-rose-700 font-bold' : 'text-emerald-700'}`}>
                  {hasFailure ? '✕ Statutory drift exceeded (+6.4 g)' : 'Soak complete ✓ · Error +3.2 g ✓'}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2 rounded bg-foundation-50 border border-foundation-100">
              <span className="font-bold text-foundation-500 shrink-0">17:49</span>
              <div>
                <span className="font-bold text-foundation-900">−10°C Low Temperature Stage</span>
                <span className="text-[11px] text-foundation-600 font-semibold block">Soak complete ✓ · Error +0.8 g</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2 rounded bg-foundation-50 border border-foundation-100">
              <span className="text-foundation-400 shrink-0">—</span>
              <div>
                <span className="font-bold text-foundation-900">+20°C Thermal Recovery</span>
                <span className="text-[11px] text-emerald-700 font-semibold block">Reference temperature restored ✓ (+0.2 g)</span>
              </div>
            </div>
          </div>
        </div>

        {/* TEMPERATURE DRIFT RESULT (§25) */}
        <div className="bg-white rounded-xl border border-foundation-200 p-4 sm:p-5 shadow-xs font-mono text-xs space-y-3">
          <div className="flex items-center justify-between pb-2.5 border-b border-foundation-100">
            <h4 className="font-bold text-foundation-900 uppercase tracking-wider">
              TEMPERATURE DRIFT RESULT (§25)
            </h4>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                !hasFailure
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {!hasFailure ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
              <span>{!hasFailure ? '✓ PASS' : '✕ FAIL'}</span>
            </span>
          </div>

          <div className="space-y-2 font-mono text-xs">
            <div className="flex justify-between p-2 rounded bg-foundation-50 border border-foundation-100">
              <span className="text-foundation-500">+20°C Reference Stage:</span>
              <span className="font-bold text-emerald-700">✓ PASS (0.0 g)</span>
            </div>

            <div className="flex justify-between p-2 rounded bg-foundation-50 border border-foundation-100">
              <span className="text-foundation-500">+40°C High Stage:</span>
              <span className={`font-bold ${hasFailure ? 'text-rose-700' : 'text-emerald-700'}`}>
                {hasFailure ? '✕ FAIL (+6.4 g)' : '✓ PASS (+3.2 g)'}
              </span>
            </div>

            <div className="flex justify-between p-2 rounded bg-foundation-50 border border-foundation-100">
              <span className="text-foundation-500">−10°C Low Stage:</span>
              <span className="font-bold text-emerald-700">✓ PASS (+0.8 g)</span>
            </div>

            <div className="flex justify-between p-2 rounded bg-foundation-50 border border-foundation-100">
              <span className="text-foundation-500">+20°C Recovery:</span>
              <span className="font-bold text-emerald-700">✓ PASS (+0.2 g)</span>
            </div>

            <div className="flex justify-between p-2 rounded bg-brand-50 border border-brand-200 text-brand-900 font-bold">
              <span>Maximum Drift Observed:</span>
              <span>{maxDriftGrams.toFixed(1)} g / Limit: ±5.0 g</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
