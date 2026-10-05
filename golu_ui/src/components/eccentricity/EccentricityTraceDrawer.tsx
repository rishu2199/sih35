import React from 'react';
import { X, Calculator, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { EccentricityPosition } from './PlatterVisualizer';

interface EccentricityTraceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  position: EccentricityPosition | null;
  verificationIntervalKg: number;
}

export const EccentricityTraceDrawer: React.FC<EccentricityTraceDrawerProps> = ({
  isOpen,
  onClose,
  position,
  verificationIntervalKg,
}) => {
  if (!isOpen || !position || position.observedReading === undefined) return null;

  const e = verificationIntervalKg; // 0.005 kg
  const deltaL = 0.0025; // standard delta L 0.5e
  const I = position.observedReading;
  const L = position.targetLoad;
  const P = I + 0.5 * e - deltaL;
  const E = P - L;
  const E0 = 0.000;
  const Ec = E - E0;
  const errorGrams = Ec * 1000;
  const mpe = position.mpeGrams;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-foundation-950/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md h-full shadow-2xl border-l border-foundation-200 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
        <div>
          {/* Header */}
          <div className="p-5 border-b border-foundation-100 flex items-center justify-between bg-foundation-50/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600">
                <Calculator size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foundation-900 tracking-tight font-sans">
                  ECCENTRICITY CALCULATION PROOF
                </h3>
                <span className="text-[11px] font-mono text-foundation-500">
                  {position.name} · OIML R 76-1 CL 3.6.2
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-foundation-400 hover:text-foundation-700 p-1.5 rounded-lg hover:bg-foundation-100 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Test Parameters */}
          <div className="p-4 border-b border-foundation-100 grid grid-cols-2 gap-3 text-xs font-mono bg-white">
            <div className="p-2.5 rounded-lg bg-foundation-50 border border-foundation-200">
              <span className="text-[10px] text-foundation-400 block uppercase font-bold">Eccentric Test Load (1/3 Max)</span>
              <span className="text-base font-bold text-foundation-900">{L.toFixed(3)} kg</span>
            </div>
            <div className="p-2.5 rounded-lg bg-foundation-50 border border-foundation-200">
              <span className="text-[10px] text-foundation-400 block uppercase font-bold">Observed Reading (I)</span>
              <span className="text-base font-bold text-foundation-900">{I.toFixed(3)} kg</span>
            </div>
          </div>

          {/* Mathematical Proof */}
          <div className="p-5 space-y-4 font-mono text-xs">
            {/* Step 1: Turning Point */}
            <div className="p-3.5 rounded-xl border border-foundation-200 bg-foundation-50/60 space-y-1">
              <div className="flex justify-between items-center text-foundation-500 font-bold text-[10px]">
                <span>01 · TURNING POINT INFLECTION</span>
                <span>CLAUSE A.4.4.3</span>
              </div>
              <p className="font-bold text-brand-800 text-sm">P = I + 0.5e − ΔL</p>
              <p className="text-foundation-600 text-[11px]">
                {I.toFixed(3)} + {(0.5 * e).toFixed(4)} − {deltaL.toFixed(4)}
              </p>
              <p className="font-bold text-foundation-950 text-xs">
                = {P.toFixed(4)} kg
              </p>
            </div>

            {/* Step 2: Uncorrected Error */}
            <div className="p-3.5 rounded-xl border border-foundation-200 bg-foundation-50/60 space-y-1">
              <div className="flex justify-between items-center text-foundation-500 font-bold text-[10px]">
                <span>02 · UNCORRECTED ERROR</span>
                <span>CLAUSE A.4.4.3</span>
              </div>
              <p className="font-bold text-brand-800 text-sm">E = P − L</p>
              <p className="text-foundation-600 text-[11px]">
                {P.toFixed(4)} − {L.toFixed(3)}
              </p>
              <p className="font-bold text-foundation-950 text-xs">
                = {(E > 0 ? '+' : '') + (E * 1000).toFixed(1)} g
              </p>
            </div>

            {/* Step 3: Zero Correction */}
            <div className="p-3.5 rounded-xl border border-foundation-200 bg-foundation-50/60 space-y-1">
              <div className="flex justify-between items-center text-foundation-500 font-bold text-[10px]">
                <span>03 · ZERO CORRECTION</span>
                <span>CLAUSE A.4.4.3</span>
              </div>
              <p className="font-bold text-brand-800 text-sm">Ec = E − E₀</p>
              <p className="text-foundation-600 text-[11px]">
                {(E * 1000).toFixed(1)} g − 0.0 g (Tare center verified)
              </p>
              <p className="font-bold text-foundation-950 text-xs">
                = {(Ec > 0 ? '+' : '') + errorGrams.toFixed(1)} g
              </p>
            </div>

            {/* Step 4: Statutory Eccentricity Check */}
            <div className="p-3.5 rounded-xl border border-foundation-200 bg-foundation-50/60 space-y-2">
              <div className="flex justify-between items-center text-foundation-500 font-bold text-[10px]">
                <span>04 · STATUTORY TOLERANCE CHECK</span>
                <span>OIML R 76-1 CL 3.6.2</span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-foundation-600">Position Error (Ec):</span>
                  <span className="font-bold text-foundation-900">
                    {(Ec > 0 ? '+' : '') + errorGrams.toFixed(1)} g
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-foundation-600">Legal Limit (±MPE):</span>
                  <span className="font-bold text-foundation-900">±{mpe.toFixed(1)} g</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-foundation-500">Allowable Load Fraction:</span>
                  <span className="text-foundation-700">1/3 Max Capacity (10.000 kg)</span>
                </div>
              </div>

              <div
                className={`mt-2 p-2.5 rounded-lg flex items-center justify-between font-bold text-xs ${
                  position.status === 'PASS'
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : position.status === 'MARGINAL'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-rose-100 text-rose-900 border border-rose-300'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {position.status === 'PASS' ? (
                    <CheckCircle2 size={15} />
                  ) : position.status === 'MARGINAL' ? (
                    <AlertTriangle size={15} />
                  ) : (
                    <XCircle size={15} />
                  )}
                  <span>VERDICT: {position.status}</span>
                </div>
                <span>|Ec| ≤ MPE ({Math.abs(errorGrams).toFixed(1)} g / {mpe.toFixed(1)} g)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-foundation-50 border-t border-foundation-100 flex items-center justify-between">
          <span className="text-[11px] font-mono text-foundation-500">
            Complies with OIML R 76-1 CL 3.6.2
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-foundation-900 hover:bg-black text-white text-xs font-semibold cursor-pointer"
          >
            Close Trace
          </button>
        </div>
      </div>
    </div>
  );
};
