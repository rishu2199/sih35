import React, { useState } from 'react';
import {
  Scale,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Calculator,
  ArrowRight,
  RotateCcw,
  Check,
  ChevronDown,
  ChevronUp,
  Sliders,
} from 'lucide-react';

export type TareMode = 'additive' | 'subtractive';

export interface TareResult {
  mode: TareMode;
  tareWeightKg: number;
  initialZeroKg?: number;
  initialLoadKg?: number;
  observedIndicationKg: number;
  calculatedErrorGrams: number;
  allowableLimitGrams: number;
  status: 'PASS' | 'FAIL';
}

interface TareAccuracyTabProps {
  intervalKg?: number; // e.g. 0.005 kg (e = 5 g)
  additiveResult: TareResult;
  subtractiveResult: TareResult;
  onUpdateResult: (mode: TareMode, result: TareResult) => void;
  disabled?: boolean;
}

export const TareAccuracyTab: React.FC<TareAccuracyTabProps> = ({
  intervalKg = 0.005,
  additiveResult,
  subtractiveResult,
  onUpdateResult,
  disabled = false,
}) => {
  const [activeMode, setActiveMode] = useState<TareMode>('additive');
  const [showCalculationTrace, setShowCalculationTrace] = useState<boolean>(false);

  // Applicable statutory tolerance is ±0.25e (OIML R 76-1 CL 3.6.3 / CL A.4.6)
  const allowableErrorGrams = 0.25 * intervalKg * 1000; // 1.25 g

  // 5-step compact procedure (§7)
  const procedureSteps = [
    { num: '01', title: 'Zero the instrument', desc: 'Verify platter is unloaded and instrument reads stable 0.000 kg.' },
    { num: '02', title: 'Apply tare vessel', desc: 'Place reference tare weight / container on the platter.' },
    { num: '03', title: 'Record indication', desc: 'Trigger tare operation and record net indication balance.' },
    { num: '04', title: 'Remove load', desc: 'Unload tare container and observe negative gross register.' },
    { num: '05', title: 'Verify zero return', desc: 'Cancel tare and ensure scale returns to true metrological zero.' },
  ];

  // Worst error computation (§10)
  const worstErrorGrams = Math.max(
    Math.abs(additiveResult.calculatedErrorGrams),
    Math.abs(subtractiveResult.calculatedErrorGrams)
  );
  const isAllTarePass = additiveResult.status === 'PASS' && subtractiveResult.status === 'PASS';

  return (
    <div className="space-y-6 select-none font-sans">
      {/* 1. Header & Statutory Limit Banner (§6, §7) */}
      <div className="bg-white rounded-xl border border-foundation-200 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-foundation-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-foundation-500 uppercase">
                OIML R 76-1 CL 3.6.3 &amp; Clause A.4.6
              </span>
              <span className="text-foundation-300">•</span>
              <span className="text-xs font-mono font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                Tare Criterion: ±0.25e
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-foundation-900 tracking-tight">
              TARE ACCURACY (ADDITIVE &amp; SUBTRACTIVE VERIFICATION)
            </h3>
            <p className="text-xs text-foundation-500 mt-0.5">
              Verify additive and subtractive tare behavior to confirm tare balance register accuracy within ±0.25e.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-xs bg-foundation-50 px-3 py-1.5 rounded-lg border border-foundation-200">
            <span className="text-foundation-500">Interval:</span>
            <span className="font-bold text-foundation-900">e = {(intervalKg * 1000).toFixed(0)} g</span>
            <span className="text-foundation-300">•</span>
            <span className="text-foundation-500">Limit:</span>
            <span className="font-bold text-brand-700">±{allowableErrorGrams.toFixed(2)} g</span>
          </div>
        </div>

        {/* 5-Step Compact Procedure Sequence (§7) */}
        <div className="mt-4 pt-1">
          <span className="text-[10px] font-bold text-foundation-400 uppercase font-mono tracking-wider block mb-2">
            Standard Operating Procedure (OIML CL A.4.6)
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {procedureSteps.map((step) => (
              <div
                key={step.num}
                className="p-2.5 rounded-lg bg-foundation-50 border border-foundation-200 font-mono text-xs space-y-1"
              >
                <div className="flex items-center gap-1.5 text-brand-700 font-bold">
                  <span className="w-4 h-4 rounded-full bg-brand-100 flex items-center justify-center text-[10px]">
                    {step.num}
                  </span>
                  <span className="text-[11px] truncate">{step.title}</span>
                </div>
                <p className="text-[10px] text-foundation-500 font-sans leading-tight">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Side-by-Side Verification Cards: Additive (§8) & Subtractive (§9) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ADDITIVE TARE CARD (§8) */}
        <div
          className={`bg-white rounded-xl border p-4 sm:p-5 shadow-xs transition-all ${
            additiveResult.status === 'PASS'
              ? 'border-foundation-200'
              : 'border-rose-300 bg-rose-50/20'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-foundation-100">
            <div className="flex items-center gap-2">
              <Scale size={16} className="text-brand-600" />
              <h4 className="text-xs font-bold text-foundation-900 uppercase font-mono tracking-wider">
                ADDITIVE TARE VERIFICATION (§8)
              </h4>
            </div>
            <span
              className={`text-xs font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                additiveResult.status === 'PASS'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {additiveResult.status === 'PASS' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
              <span>{additiveResult.status === 'PASS' ? '✓ PASS' : '✕ FAIL'}</span>
            </span>
          </div>

          <div className="mt-3.5 space-y-2.5 font-mono text-xs">
            <div className="flex justify-between p-2 rounded bg-foundation-50 border border-foundation-100">
              <span className="text-foundation-500">Initial Zero (Empty):</span>
              <span className="font-bold text-foundation-900">0.000 kg</span>
            </div>

            <div className="flex justify-between p-2 rounded bg-foundation-50 border border-foundation-100">
              <span className="text-foundation-500">Applied Tare Load:</span>
              <span className="font-bold text-foundation-900">{additiveResult.tareWeightKg.toFixed(3)} kg</span>
            </div>

            <div className="flex justify-between p-2 rounded bg-foundation-50 border border-foundation-100">
              <span className="text-foundation-500">Observed Tare Indication:</span>
              <span className="font-bold text-foundation-900">{additiveResult.observedIndicationKg.toFixed(3)} kg</span>
            </div>

            <div className="flex justify-between p-2 rounded bg-foundation-50 border border-foundation-100">
              <span className="text-foundation-500">Calculated Error:</span>
              <span className={`font-bold ${additiveResult.status === 'PASS' ? 'text-emerald-700' : 'text-rose-700'}`}>
                {(additiveResult.calculatedErrorGrams > 0 ? '+' : '') + additiveResult.calculatedErrorGrams.toFixed(1)} g
              </span>
            </div>

            <div className="flex justify-between p-2 rounded bg-foundation-50 border border-foundation-100">
              <span className="text-foundation-500">Allowable Limit (±0.25e):</span>
              <span className="font-bold text-foundation-700">±{allowableErrorGrams.toFixed(2)} g</span>
            </div>
          </div>
        </div>

        {/* SUBTRACTIVE TARE CARD (§9) */}
        <div
          className={`bg-white rounded-xl border p-4 sm:p-5 shadow-xs transition-all ${
            subtractiveResult.status === 'PASS'
              ? 'border-foundation-200'
              : 'border-rose-300 bg-rose-50/20'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-foundation-100">
            <div className="flex items-center gap-2">
              <Scale size={16} className="text-cyan-600" />
              <h4 className="text-xs font-bold text-foundation-900 uppercase font-mono tracking-wider">
                SUBTRACTIVE TARE VERIFICATION (§9)
              </h4>
            </div>
            <span
              className={`text-xs font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                subtractiveResult.status === 'PASS'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {subtractiveResult.status === 'PASS' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
              <span>{subtractiveResult.status === 'PASS' ? '✓ PASS' : '✕ FAIL'}</span>
            </span>
          </div>

          <div className="mt-3.5 space-y-2.5 font-mono text-xs">
            <div className="flex justify-between p-2 rounded bg-foundation-50 border border-foundation-100">
              <span className="text-foundation-500">Initial Gross Load:</span>
              <span className="font-bold text-foundation-900">5.000 kg</span>
            </div>

            <div className="flex justify-between p-2 rounded bg-foundation-50 border border-foundation-100">
              <span className="text-foundation-500">Tare Applied (Subtracted):</span>
              <span className="font-bold text-foundation-900">{subtractiveResult.tareWeightKg.toFixed(3)} kg</span>
            </div>

            <div className="flex justify-between p-2 rounded bg-foundation-50 border border-foundation-100">
              <span className="text-foundation-500">Observed Net Indication:</span>
              <span className="font-bold text-foundation-900">{subtractiveResult.observedIndicationKg.toFixed(3)} kg</span>
            </div>

            <div className="flex justify-between p-2 rounded bg-foundation-50 border border-foundation-100">
              <span className="text-foundation-500">Calculated Error:</span>
              <span className={`font-bold ${subtractiveResult.status === 'PASS' ? 'text-emerald-700' : 'text-rose-700'}`}>
                {(subtractiveResult.calculatedErrorGrams > 0 ? '+' : '') + subtractiveResult.calculatedErrorGrams.toFixed(1)} g
              </span>
            </div>

            <div className="flex justify-between p-2 rounded bg-foundation-50 border border-foundation-100">
              <span className="text-foundation-500">Allowable Limit (±0.25e):</span>
              <span className="font-bold text-foundation-700">±{allowableErrorGrams.toFixed(2)} g</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Tare Accuracy Result Summary Card (§10) & Failure Alert (§11) */}
      {!isAllTarePass ? (
        <div className="p-4 sm:p-5 rounded-xl bg-rose-50 border border-rose-300 text-rose-950 font-mono text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0">
              <XCircle size={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900">
                ✕ TARE ACCURACY FAILED — Allowable Limit Exceeded (§11)
              </h4>
              <p className="text-[11px] text-rose-800 font-sans mt-0.5">
                Observed tare error ({worstErrorGrams.toFixed(1)} g) exceeds the statutory ±0.25e threshold (±{allowableErrorGrams.toFixed(2)} g).
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded bg-rose-200/60 font-bold border border-rose-300 self-start sm:self-auto">
            Worst Error: {worstErrorGrams.toFixed(1)} g / Limit: {allowableErrorGrams.toFixed(2)} g
          </span>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-foundation-200 p-4 sm:p-5 shadow-xs font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-foundation-100">
            <span className="font-bold text-foundation-900 uppercase tracking-wider">
              TARE ACCURACY RESULT SUMMARY (§10)
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 size={13} />
              <span>✓ PASS</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3.5">
            <div className="p-3 rounded-lg bg-foundation-50 border border-foundation-100">
              <span className="text-[10px] text-foundation-500 uppercase block font-medium">Additive Tare</span>
              <span className="text-sm font-bold text-emerald-700 mt-0.5 block">✓ PASS (0.0 g)</span>
            </div>

            <div className="p-3 rounded-lg bg-foundation-50 border border-foundation-100">
              <span className="text-[10px] text-foundation-500 uppercase block font-medium">Subtractive Tare</span>
              <span className="text-sm font-bold text-emerald-700 mt-0.5 block">✓ PASS (+0.5 g)</span>
            </div>

            <div className="p-3 rounded-lg bg-foundation-50 border border-foundation-100">
              <span className="text-[10px] text-foundation-500 uppercase block font-medium">Worst Error</span>
              <span className="text-sm font-bold text-foundation-900 mt-0.5 block">{worstErrorGrams.toFixed(1)} g</span>
            </div>

            <div className="p-3 rounded-lg bg-foundation-50 border border-foundation-100">
              <span className="text-[10px] text-foundation-500 uppercase block font-medium">Statutory Limit</span>
              <span className="text-sm font-bold text-foundation-700 mt-0.5 block">±{allowableErrorGrams.toFixed(2)} g</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
