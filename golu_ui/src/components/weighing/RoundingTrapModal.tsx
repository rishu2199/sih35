import React from 'react';
import { X, AlertTriangle, XCircle, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

interface RoundingTrapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoundingTrapModal: React.FC<RoundingTrapModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-foundation-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-xl border border-foundation-200 shadow-2xl max-w-xl w-full overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-foundation-100 flex items-center justify-between bg-amber-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foundation-900 tracking-tight font-sans">
                ROUNDING TRAP CALCULATION COMPARISON (OIML A.4.4.3)
              </h3>
              <p className="text-xs text-foundation-600">
                Why conventional spreadsheets produce illegal false passes in legal metrology.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-foundation-400 hover:text-foundation-700 p-1 rounded-lg cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Comparison per spec §20 */}
        <div className="p-5 space-y-4">
          <div className="p-3 bg-foundation-50 rounded-lg border border-foundation-200 text-xs font-mono">
            <span className="font-bold text-foundation-900 block mb-1">
              OBSERVATION SCENARIO: Target Load L = 10.000 kg · Scale Interval e = 5 g · MPE = ±5.0 g
            </span>
            <p className="text-foundation-600">
              Observed displayed digits on scale indicator: <span className="font-bold text-foundation-900">10.000 kg</span>. Additional weights before changeover $\Delta L = 2.8$ g.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Column 1: Legacy Spreadsheet per §20 */}
            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/60 space-y-3">
              <div className="flex items-center justify-between pb-1.5 border-b border-rose-200">
                <span className="text-[11px] font-bold text-rose-800 font-mono uppercase">
                  Legacy Spreadsheet
                </span>
                <span className="text-[10px] font-mono font-bold bg-rose-200 text-rose-900 px-1.5 py-0.5 rounded">
                  FALSE PASS
                </span>
              </div>
              <div className="text-xs font-mono space-y-1.5 text-foundation-700">
                <div>
                  <span className="text-foundation-400 block text-[10px]">Raw Subtraction (I - L)</span>
                  <p className="font-bold text-foundation-900">10.000 kg − 10.000 kg</p>
                  <p className="text-sm font-bold text-rose-700">= 0.0 g error</p>
                </div>
                <div>
                  <span className="text-foundation-400 block text-[10px]">Legal Tolerance</span>
                  <p className="font-bold text-foundation-800">±5.0 g</p>
                </div>
              </div>
              <div className="pt-2 border-t border-rose-200 flex items-center gap-1.5 text-xs font-bold text-rose-800">
                <XCircle size={15} className="shrink-0" />
                <span>Displayed Result: ✓ PASS (Illegal)</span>
              </div>
            </div>

            {/* Column 2: METROLOGIX-76 per §20 */}
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60 space-y-3">
              <div className="flex items-center justify-between pb-1.5 border-b border-emerald-200">
                <span className="text-[11px] font-bold text-emerald-800 font-mono uppercase">
                  METROLOGIX-76
                </span>
                <span className="text-[10px] font-mono font-bold bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded">
                  STATUTORY FAIL
                </span>
              </div>
              <div className="text-xs font-mono space-y-1.5 text-foundation-700">
                <div>
                  <span className="text-foundation-400 block text-[10px]">Continuous Turning Point (P)</span>
                  <p className="font-bold text-foundation-900">P = I + 0.5e − ΔL</p>
                  <p className="text-sm font-bold text-emerald-800">= −5.3 g actual error</p>
                </div>
                <div>
                  <span className="text-foundation-400 block text-[10px]">Legal Limit</span>
                  <p className="font-bold text-foundation-800">±5.0 g MPE</p>
                </div>
              </div>
              <div className="pt-2 border-t border-emerald-200 flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                <CheckCircle2 size={15} className="shrink-0" />
                <span>Statutory Result: ✕ FAIL</span>
              </div>
            </div>
          </div>

          {/* Clear Takeaway per spec §20 */}
          <div className="p-3.5 bg-amber-50 rounded-lg border border-amber-200 text-xs font-mono text-amber-950">
            <span className="font-bold block mb-1">
              METROLOGICAL TAKEAWAY:
            </span>
            <p className="italic">
              &quot;The displayed spreadsheet value hides the actual turning-point error.&quot;
            </p>
            <p className="text-[11px] text-amber-800 mt-1">
              Digital weighing instruments round to the nearest whole display division $e$. By applying fractional weights $\Delta L$, METROLOGIX-76 determines the true analog inflection point $P$ under OIML R 76-1 Clause A.4.4.3, preventing consumer and commercial fraud.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-foundation-50 border-t border-foundation-100 flex items-center justify-between">
          <span className="text-[11px] font-mono text-foundation-500">
            Audited under WELMEC 7.2 & OIML R 76-1
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-foundation-900 hover:bg-black text-white text-xs font-semibold cursor-pointer"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
