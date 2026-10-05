import React from 'react';
import { X, Calculator, CheckCircle2, ShieldCheck } from 'lucide-react';

interface SpreadAnalysisDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  minError: number;
  maxError: number;
  spread: number;
  allowableLimitGrams: number;
  targetLoadKg: number;
}

export const SpreadAnalysisDrawer: React.FC<SpreadAnalysisDrawerProps> = ({
  isOpen,
  onClose,
  minError,
  maxError,
  spread,
  allowableLimitGrams,
  targetLoadKg,
}) => {
  if (!isOpen) return null;

  const isPass = spread <= allowableLimitGrams;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-foundation-950/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md h-full shadow-2xl border-l border-foundation-200 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
        <div>
          {/* Header */}
          <div className="p-5 border-b border-foundation-100 flex items-center justify-between bg-foundation-50/70">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600">
                <Calculator size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foundation-900 tracking-tight">
                  REPEATABILITY SPREAD ANALYSIS
                </h3>
                <span className="text-[11px] font-mono text-foundation-500">
                  OIML R 76-1 CL 3.6.1 · 10 Cycles
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-foundation-400 hover:text-foundation-700 p-1.5 rounded-lg hover:bg-foundation-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Test Conditions Banner */}
          <div className="p-5 border-b border-foundation-100 bg-white grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-foundation-50 border border-foundation-200">
              <span className="text-[10px] text-foundation-400 block uppercase">Standard Test Load</span>
              <span className="text-sm font-bold text-foundation-900">{targetLoadKg.toFixed(3)} kg</span>
            </div>
            <div className="p-2.5 rounded-lg bg-foundation-50 border border-foundation-200">
              <span className="text-[10px] text-foundation-400 block uppercase">Cycles Evaluated</span>
              <span className="text-sm font-bold text-foundation-900">10 / 10 Runs</span>
            </div>
          </div>

          {/* Mathematical Proof */}
          <div className="p-5 space-y-4 font-mono text-xs">
            {/* Step 1: Maximum & Minimum Extraction */}
            <div className="p-3 rounded-lg border border-foundation-200 bg-foundation-50/50 space-y-1">
              <div className="flex justify-between items-center text-foundation-500 font-bold text-[11px]">
                <span>01 · OBSERVED ERROR EXTREMES</span>
                <span>OIML 3.6.1</span>
              </div>
              <div className="pt-1 space-y-1 text-foundation-700">
                <p>Maximum Error (Emax) = <span className="font-bold text-foundation-900">{(maxError > 0 ? '+' : '') + maxError.toFixed(2)} g</span></p>
                <p>Minimum Error (Emin) = <span className="font-bold text-foundation-900">{(minError > 0 ? '+' : '') + minError.toFixed(2)} g</span></p>
              </div>
            </div>

            {/* Step 2: Dispersion Spread Formula */}
            <div className="p-3 rounded-lg border border-foundation-200 bg-foundation-50/50 space-y-1">
              <div className="flex justify-between items-center text-foundation-500 font-bold text-[11px]">
                <span>02 · DISPERSION SPREAD (Δ)</span>
                <span>RANGE CALCULATION</span>
              </div>
              <p className="font-bold text-brand-700 text-sm">Δ = Emax − Emin</p>
              <p className="text-foundation-600 text-[11px] pt-1">
                {(maxError > 0 ? '+' : '') + maxError.toFixed(2)} − ({(minError > 0 ? '+' : '') + minError.toFixed(2)})
              </p>
              <p className="font-bold text-foundation-900 text-sm">
                = {spread.toFixed(2)} g
              </p>
            </div>

            {/* Step 3: Statutory Comparison */}
            <div className="p-3 rounded-lg border border-foundation-200 bg-foundation-50/50 space-y-1.5">
              <div className="flex justify-between items-center text-foundation-500 font-bold text-[11px]">
                <span>03 · STATUTORY VERDICT EVALUATION</span>
                <span>MPE CORRIDOR</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-foundation-600">Calculated Spread (Δ):</span>
                <span className="font-bold text-foundation-900">{spread.toFixed(2)} g</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-foundation-600">Allowable MPE Limit:</span>
                <span className="font-bold text-foundation-900">{allowableLimitGrams.toFixed(2)} g</span>
              </div>

              <div
                className={`mt-2 p-2 rounded flex items-center justify-between font-bold ${
                  isPass ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
                }`}
              >
                <span>VERDICT: {isPass ? 'PASS' : 'FAIL'}</span>
                <span>Δ ≤ Limit ({spread.toFixed(1)} g ≤ {allowableLimitGrams.toFixed(1)} g)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-foundation-100 bg-foundation-50 flex items-center justify-between">
          <span className="text-[11px] font-mono text-foundation-500">
            NABL ISO/IEC 17025 Certified
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-foundation-900 hover:bg-black text-white text-xs font-semibold cursor-pointer"
          >
            Close Analysis
          </button>
        </div>
      </div>
    </div>
  );
};
