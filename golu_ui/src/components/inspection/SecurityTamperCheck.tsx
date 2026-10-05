import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Camera,
  X,
  Clock,
  Eye,
  Check,
} from 'lucide-react';

export interface SecurityCheckItem {
  id: string;
  name: string;
  description: string;
  status: 'INTACT' | 'DAMAGED' | 'NOT_INSPECTED';
  evidenceFile?: string;
  evidenceDate?: string;
  evidenceUrl?: string;
}

interface SecurityTamperCheckProps {
  checks: SecurityCheckItem[];
  onToggleCheckStatus: (id: string, newStatus: 'INTACT' | 'DAMAGED' | 'NOT_INSPECTED') => void;
  onOpenAddFinding?: () => void;
  isReadOnly?: boolean;
}

export const SecurityTamperCheck: React.FC<SecurityTamperCheckProps> = ({
  checks,
  onToggleCheckStatus,
  onOpenAddFinding,
  isReadOnly = false,
}) => {
  const [selectedEvidenceModal, setSelectedEvidenceModal] = useState<SecurityCheckItem | null>(null);

  const failedItems = checks.filter((c) => c.status === 'DAMAGED');
  const allPassed = checks.every((c) => c.status === 'INTACT');

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between space-y-4">
      <div>
        {/* Header (§13) */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
              SECURITY &amp; SEAL (§13)
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">
              WELMEC 7.2 &amp; Legal Metrology Act § 24
            </span>
          </div>

          <div
            className={`px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 transition-colors ${
              failedItems.length > 0
                ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-300'
                : allPassed
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
            }`}
          >
            {failedItems.length > 0 ? (
              <>
                <ShieldAlert size={13} className="text-red-600" />
                <span>✕ TAMPER DETECTED</span>
              </>
            ) : allPassed ? (
              <>
                <ShieldCheck size={13} className="text-emerald-600" />
                <span>✓ ALL SEALS INTACT</span>
              </>
            ) : (
              <>
                <AlertTriangle size={13} className="text-amber-600" />
                <span>PENDING</span>
              </>
            )}
          </div>
        </div>

        {/* 3 Explicit Checks with Clean Selectors (§13 & §14) */}
        <div className="mt-4 space-y-3">
          {checks.map((item) => {
            const isIntact = item.status === 'INTACT';
            const isDamaged = item.status === 'DAMAGED';

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isDamaged
                    ? 'bg-red-50/70 dark:bg-red-950/30 border-red-300 dark:border-red-900'
                    : isIntact
                    ? 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                    : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {item.name}
                    </span>
                    {/* Evidence Shortcut (§14) */}
                    <button
                      type="button"
                      onClick={() => setSelectedEvidenceModal(item)}
                      className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      <Camera className="w-3 h-3" />
                      <span>View Evidence</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 max-w-sm leading-snug">
                    {item.description}
                  </p>
                </div>

                {/* Clean Selector Dropdown (§13) */}
                <select
                  value={item.status}
                  onChange={(e) =>
                    onToggleCheckStatus(item.id, e.target.value as 'INTACT' | 'DAMAGED' | 'NOT_INSPECTED')
                  }
                  disabled={isReadOnly}
                  className={`p-2 px-3 rounded-xl border text-xs font-mono font-bold cursor-pointer self-start sm:self-auto ${
                    isIntact
                      ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                      : isDamaged
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}
                >
                  <option value="INTACT">✓ INTACT</option>
                  <option value="DAMAGED">✕ DAMAGED / BROKEN</option>
                  <option value="NOT_INSPECTED">○ NOT INSPECTED</option>
                </select>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Finding Shortcut Button (§17) */}
      {onOpenAddFinding && !isReadOnly && (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onOpenAddFinding}
            className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
          >
            + Add Security Observation
          </button>
        </div>
      )}

      {/* Evidence Modal (§14) */}
      {selectedEvidenceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in select-none">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {selectedEvidenceModal.name} Evidence
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEvidenceModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video w-full rounded-2xl bg-slate-900 overflow-hidden relative shadow-inner">
              <img
                src={
                  selectedEvidenceModal.evidenceUrl ||
                  'https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=800&auto=format&fit=crop&q=80'
                }
                alt={selectedEvidenceModal.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-md bg-slate-900/80 text-white font-mono text-[10px] backdrop-blur-xs flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-400" />
                <span>{selectedEvidenceModal.evidenceDate || '04 Oct 2026 • 15:41 IST'}</span>
              </div>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-400 font-mono">
              <div>File: {selectedEvidenceModal.evidenceFile || 'seal_01.jpg'}</div>
              <div>Status: {selectedEvidenceModal.status}</div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedEvidenceModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
