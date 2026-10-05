import React from 'react';
import {
  StandardWeightSet,
} from './types';
import {
  Scale,
  FileText,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  ShieldCheck,
  Layers,
  History,
  Clock,
} from 'lucide-react';

interface StandardDetailPanelProps {
  standard: StandardWeightSet;
  onOpenCertificateModal: (standard: StandardWeightSet) => void;
  onSimulateExpiry?: (standardId: string) => void;
}

export const StandardDetailPanel: React.FC<StandardDetailPanelProps> = ({
  standard,
  onOpenCertificateModal,
  onSimulateExpiry,
}) => {
  const isExpired = standard.status === 'EXPIRED';
  const isExpiring = standard.status === 'EXPIRING';

  return (
    <div className="bg-white rounded-xl border border-foundation-200 p-5 shadow-xs space-y-4 select-none font-mono">
      {/* 1. Header with Class Tag */}
      <div className="flex items-start justify-between pb-3 border-b border-foundation-100">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded font-black text-xs ${
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
            <span className="text-foundation-400 font-sans text-xs">•</span>
            <span className="text-xs text-foundation-500 font-semibold font-sans">
              Reference Working Standard
            </span>
          </div>

          <h3 className="text-xl font-black text-foundation-950 tracking-tight font-sans mt-1">
            STANDARD {standard.id}
          </h3>
          <p className="text-xs text-foundation-500 font-sans">
            {standard.setName}
          </p>
        </div>

        {/* Status Badge */}
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
            isExpired
              ? 'bg-rose-100 text-rose-800 border border-rose-200'
              : isExpiring
              ? 'bg-amber-100 text-amber-900 border border-amber-200'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}
        >
          {isExpired ? (
            <XCircle size={13} className="text-rose-600" />
          ) : isExpiring ? (
            <AlertTriangle size={13} className="text-amber-600" />
          ) : (
            <CheckCircle2 size={13} className="text-emerald-600" />
          )}
          <span>{standard.status}</span>
        </span>
      </div>

      {/* 2. Weight-Set Physical Breakdown (Section 12) */}
      <div className="p-3.5 bg-foundation-50 rounded-xl border border-foundation-200 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[10px] font-bold text-foundation-500 uppercase tracking-wider">
            Standard Contents ({standard.piecesCount} Pieces)
          </span>
          <span className="font-bold text-foundation-900">{standard.massRange}</span>
        </div>

        {/* Visual Pill Matrix */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {standard.piecesList.map((piece, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded bg-white border border-foundation-200 text-[11px] font-bold text-foundation-800 flex items-center gap-1 shadow-2xs"
            >
              <span>{piece}</span>
              <span className="text-emerald-600 text-[10px]">✓</span>
            </span>
          ))}
        </div>
      </div>

      {/* 3. Calibration Validity & Expiry Countdown (Section 10, 11) */}
      <div className="p-3.5 bg-foundation-50/70 rounded-xl border border-foundation-200 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-foundation-500 uppercase tracking-wider">
            Calibration & Validity
          </span>
          <span className="text-[11px] font-bold text-brand-700">
            {standard.certificateNumber}
          </span>
        </div>

        <div className="space-y-1.5 pt-1 border-t border-foundation-200/60 text-foundation-700">
          <div className="flex justify-between">
            <span className="text-foundation-500">Calibrated:</span>
            <strong className="text-foundation-900">{standard.calibrationDate}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-foundation-500">Valid Until:</span>
            <strong className="text-foundation-900">{standard.validUntilDate}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-foundation-500">Remaining Period:</span>
            <strong
              className={`font-black ${
                isExpired ? 'text-rose-700' : isExpiring ? 'text-amber-800' : 'text-emerald-700'
              }`}
            >
              {isExpired ? 'EXPIRED' : `${standard.daysRemaining} days`}
            </strong>
          </div>
          <div className="flex justify-between">
            <span className="text-foundation-500">Uncertainty:</span>
            <strong className="text-foundation-900">{standard.expandedUncertainty}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-foundation-500">Accreditation:</span>
            <strong className="text-foundation-800 text-[11px]">{standard.accreditationBody}</strong>
          </div>
        </div>

        {/* Certificate Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => onOpenCertificateModal(standard)}
            className="w-full py-2 rounded-lg bg-white border border-foundation-300 hover:bg-foundation-100 hover:border-foundation-400 text-foundation-900 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
          >
            <FileText size={13} className="text-brand-600" />
            <span>View Calibration Certificate</span>
            <ExternalLink size={12} className="text-foundation-400" />
          </button>
        </div>
      </div>

      {/* 4. Traceability Chain: "USED BY" (Section 14) */}
      <div className="p-3.5 bg-foundation-50/70 rounded-xl border border-foundation-200 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-foundation-500 uppercase tracking-wider flex items-center gap-1">
            <History size={12} className="text-brand-600" />
            <span>Active Traceability Links ("USED BY")</span>
          </span>
          <span className="text-[10px] text-foundation-400">
            {(standard.assignedSessionsList || []).length} sessions
          </span>
        </div>

        {(!standard.assignedSessionsList || standard.assignedSessionsList.length === 0) ? (
          <p className="text-[11px] text-foundation-400 italic pt-1">
            Standard is currently unassigned to any active verification session.
          </p>
        ) : (
          <div className="space-y-1.5 pt-1">
            {standard.assignedSessionsList.map((sess, idx) => (
              <div
                key={idx}
                className="p-2 rounded bg-white border border-foundation-200 flex items-center justify-between text-[11px]"
              >
                <div>
                  <strong className="text-foundation-900">{sess.sessionId}</strong>
                  <span className="text-foundation-400 mx-1">•</span>
                  <span className="text-foundation-600">{sess.stage}</span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-foundation-100 text-foundation-700 text-[10px] font-semibold">
                  {sess.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
