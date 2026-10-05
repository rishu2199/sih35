import React, { useState } from 'react';
import {
  X,
  Scale,
  ShieldCheck,
  FileText,
  Calendar,
  Clock,
  ExternalLink,
  Download,
  History,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Layers,
} from 'lucide-react';
import { StandardWeightSet } from './types';

interface StandardDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  standard: StandardWeightSet | null;
  onOpenCertificateModal: (standard: StandardWeightSet) => void;
}

export const StandardDetailDrawer: React.FC<StandardDetailDrawerProps> = ({
  isOpen,
  onClose,
  standard,
  onOpenCertificateModal,
}) => {
  if (!isOpen || !standard) return null;

  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'sessions'>('overview');

  const isExpired = standard.status === 'EXPIRED';
  const isExpiring = standard.status === 'EXPIRING';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foundation-950/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-white shadow-2xl border-l border-foundation-200 flex flex-col justify-between">
          {/* Header (§9) */}
          <div className="p-5 border-b border-foundation-200 bg-foundation-50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span
                className={`px-2.5 py-1 rounded font-mono font-bold text-xs ${
                  standard.accuracyClass === 'E1'
                    ? 'bg-purple-100 text-purple-900 border border-purple-200'
                    : standard.accuracyClass === 'E2'
                    ? 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                    : standard.accuracyClass === 'F1'
                    ? 'bg-blue-100 text-blue-900 border border-blue-200'
                    : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                }`}
              >
                Class {standard.accuracyClass}
              </span>
              <div>
                <h3 className="text-base font-bold text-foundation-950 tracking-tight font-mono">
                  {standard.id}
                </h3>
                <span className="text-xs text-foundation-500 font-sans">
                  {standard.setName}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-foundation-400 hover:text-foundation-700 hover:bg-foundation-200/60 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Sub-Tabs: Overview / Usage History / Assigned Sessions */}
          <div className="px-5 pt-3 border-b border-foundation-200 flex items-center gap-4 text-xs font-mono">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`pb-2.5 font-bold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'overview'
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-foundation-500 hover:text-foundation-900'
              }`}
            >
              Traceability Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`pb-2.5 font-bold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'history'
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-foundation-500 hover:text-foundation-900'
              }`}
            >
              Usage History ({standard.usageHistory.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('sessions')}
              className={`pb-2.5 font-bold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'sessions'
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-foundation-500 hover:text-foundation-900'
              }`}
            >
              Active Sessions ({standard.assignedSessionsCount})
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
            {activeTab === 'overview' && (
              <>
                {/* Traceability Status Banner (§9) */}
                <div
                  className={`p-4 rounded-xl border flex items-center justify-between font-mono ${
                    isExpired
                      ? 'bg-rose-50 border-rose-300 text-rose-950'
                      : isExpiring
                      ? 'bg-amber-50 border-amber-300 text-amber-950'
                      : 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        isExpired
                          ? 'bg-rose-600 text-white'
                          : isExpiring
                          ? 'bg-amber-600 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {isExpired ? <XCircle size={18} /> : isExpiring ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider block">
                        TRACEABILITY: {isExpired ? '✕ EXPIRED' : isExpiring ? '⚠ EXPIRING SOON' : '✓ VALID'}
                      </span>
                      <span className="text-[11px] opacity-80 font-sans">
                        {isExpired
                          ? `Calibration expired ${Math.abs(standard.daysRemaining)} days ago. Testing prohibited.`
                          : `${standard.daysRemaining} days remaining in current calibration cycle.`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Certificate Specifications (§9, §10) */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-foundation-500 uppercase font-mono tracking-wider">
                    Traceability Certificate Data
                  </h4>

                  <div className="rounded-xl border border-foundation-200 divide-y divide-foundation-100 font-mono bg-foundation-50/50">
                    <div className="p-3 flex items-center justify-between">
                      <span className="text-foundation-500">Certificate Number</span>
                      <span className="font-bold text-foundation-900">{standard.certificateNumber}</span>
                    </div>

                    <div className="p-3 flex items-center justify-between">
                      <span className="text-foundation-500">Calibration Date</span>
                      <span className="font-bold text-foundation-900">{standard.calibrationDate}</span>
                    </div>

                    <div className="p-3 flex items-center justify-between">
                      <span className="text-foundation-500">Valid Until</span>
                      <span className="font-bold text-foundation-900">{standard.validUntilDate}</span>
                    </div>

                    <div className="p-3 flex items-center justify-between">
                      <span className="text-foundation-500">Calibration Laboratory</span>
                      <span className="font-bold text-foundation-900 text-right">{standard.laboratory}</span>
                    </div>

                    <div className="p-3 flex items-center justify-between">
                      <span className="text-foundation-500">Accreditation Body</span>
                      <span className="font-bold text-foundation-700">{standard.accreditationBody}</span>
                    </div>

                    <div className="p-3 flex items-center justify-between">
                      <span className="text-foundation-500">Expanded Uncertainty</span>
                      <span className="font-bold text-foundation-900">{standard.expandedUncertainty}</span>
                    </div>
                  </div>
                </div>

                {/* Reference / Certificate Action Buttons (§10) */}
                <div className="p-3.5 rounded-xl bg-foundation-50 border border-foundation-200 flex items-center justify-between font-mono">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-brand-600" />
                    <div>
                      <span className="font-bold text-foundation-900 block text-xs">Official Calibration Certificate</span>
                      <span className="text-[10px] text-foundation-500">PDF document with cryptographic seal</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenCertificateModal(standard)}
                      className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <ExternalLink size={12} />
                      <span>Open Certificate</span>
                    </button>
                  </div>
                </div>

                {/* Physical Weight Set Pieces Contents */}
                <div className="p-4 rounded-xl border border-foundation-200 bg-white space-y-2">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="font-bold text-foundation-700 uppercase">
                      Weight Set Contents ({standard.piecesCount} Pieces)
                    </span>
                    <span className="font-bold text-foundation-900">{standard.massRange}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {standard.piecesList.map((piece, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-foundation-100 border border-foundation-200 font-mono text-[11px] font-bold text-foundation-800"
                      >
                        {piece}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'history' && (
              /* Usage History Table (§11) */
              <div className="space-y-3 font-mono">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-foundation-500 uppercase tracking-wider">
                    Recent Verification Usage History (§11)
                  </h4>
                  <span className="text-[11px] text-foundation-400">Total sessions: {standard.usageHistory.length}</span>
                </div>

                <div className="rounded-xl border border-foundation-200 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-foundation-50 border-b border-foundation-200 text-foundation-500 text-[10px] uppercase font-bold">
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Session</th>
                        <th className="py-2.5 px-3">Operator</th>
                        <th className="py-2.5 px-3 text-right">Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-foundation-100">
                      {standard.usageHistory.map((h, idx) => (
                        <tr key={idx} className="hover:bg-foundation-50/50">
                          <td className="py-2 px-3 text-foundation-600">{h.date}</td>
                          <td className="py-2 px-3 font-bold text-foundation-900">{h.sessionId}</td>
                          <td className="py-2 px-3 text-foundation-700">{h.operator}</td>
                          <td className="py-2 px-3 text-right font-bold text-emerald-700">{h.result}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'sessions' && (
              /* Assigned Sessions Dialog / List (§27) */
              <div className="space-y-3 font-mono">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-foundation-500 uppercase tracking-wider">
                    Active Sessions Using {standard.id} (§27)
                  </h4>
                  <span className="text-[11px] text-foundation-400">{standard.assignedSessionsCount} linked</span>
                </div>

                {standard.assignedSessionsList.length > 0 ? (
                  <div className="space-y-2">
                    {standard.assignedSessionsList.map((s, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg border border-foundation-200 bg-foundation-50 flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-foundation-900 block">{s.sessionId}</span>
                          <span className="text-[11px] text-foundation-500">{s.stage} · {s.operator}</span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            s.status === 'ACTIVE'
                              ? 'bg-brand-50 text-brand-700 border border-brand-200'
                              : s.status === 'REVIEW'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-foundation-200 text-foundation-700'
                          }`}
                        >
                          {s.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-foundation-400 border border-dashed rounded-xl">
                    No active verification sessions currently assigned to this standard set.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-foundation-200 bg-foundation-50 flex items-center justify-end font-mono text-xs">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-foundation-900 hover:bg-foundation-800 text-white font-bold transition-colors cursor-pointer"
            >
              Close Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
