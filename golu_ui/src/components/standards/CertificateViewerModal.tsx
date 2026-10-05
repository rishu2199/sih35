import React from 'react';
import { StandardWeightSet } from './types';
import {
  X,
  FileText,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Building,
  Award,
} from 'lucide-react';

interface CertificateViewerModalProps {
  standard: StandardWeightSet | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CertificateViewerModal: React.FC<CertificateViewerModalProps> = ({
  standard,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !standard) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-foundation-950/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200 select-none font-mono">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-foundation-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Certificate Header Banner */}
        <div className="p-6 bg-foundation-900 text-white flex items-center justify-between border-b border-foundation-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600/30 border border-brand-400/40 flex items-center justify-center text-brand-400">
              <Award size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-300">
                  LEGAL METROLOGY TRACEABILITY CERTIFICATE
                </span>
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight font-sans">
                Calibration Certificate {standard.certificateNumber}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-foundation-400 hover:text-white hover:bg-foundation-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Certificate Document Body */}
        <div className="p-6 space-y-4 text-xs font-mono">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-foundation-50 border border-foundation-200">
            <div>
              <span className="text-[10px] text-foundation-400 block uppercase">Standard Set ID</span>
              <strong className="text-sm font-black text-foundation-950">{standard.id}</strong>
            </div>
            <div>
              <span className="text-[10px] text-foundation-400 block uppercase">Accuracy Class</span>
              <strong className="text-sm font-black text-brand-700">Class {standard.accuracyClass}</strong>
            </div>
            <div className="mt-2">
              <span className="text-[10px] text-foundation-400 block uppercase">Mass Range</span>
              <strong className="text-foundation-900">{standard.massRange}</strong>
            </div>
            <div className="mt-2">
              <span className="text-[10px] text-foundation-400 block uppercase">Number of Weights</span>
              <strong className="text-foundation-900">{standard.piecesCount} weights</strong>
            </div>
          </div>

          {/* Issuing Authority */}
          <div className="p-3.5 rounded-xl border border-foundation-200 bg-white space-y-1">
            <span className="text-[10px] font-bold text-foundation-400 uppercase tracking-wider flex items-center gap-1.5">
              <Building size={12} className="text-brand-600" />
              <span>Issuing Calibration Laboratory</span>
            </span>
            <div className="font-bold text-foundation-900 text-xs sm:text-sm">
              {standard.laboratory}
            </div>
            <p className="text-[11px] text-foundation-500">
              Accredited under {standard.accreditationBody} according to ISO/IEC 17025:2017.
            </p>
          </div>

          {/* Traceability Dates & Uncertainty */}
          <div className="p-3.5 rounded-xl border border-foundation-200 bg-white space-y-2">
            <div className="flex justify-between items-center py-1 border-b border-foundation-100">
              <span className="text-foundation-500">Calibration Date:</span>
              <strong className="text-foundation-900">{standard.calibrationDate}</strong>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-foundation-100">
              <span className="text-foundation-500">Certificate Valid Until:</span>
              <strong className="text-foundation-900">{standard.validUntilDate}</strong>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-foundation-100">
              <span className="text-foundation-500">Expanded Uncertainty:</span>
              <strong className="text-emerald-700 font-bold">{standard.expandedUncertainty}</strong>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-foundation-500">International Traceability:</span>
              <strong className="text-foundation-800">BIPM / OIML R 111-1 Harmonized</strong>
            </div>
          </div>

          {/* Statutory Stamp */}
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center gap-2.5">
            <ShieldCheck size={20} className="text-emerald-600 shrink-0" />
            <div className="text-[11px]">
              <strong>Official Legal Metrology Attestation:</strong>
              <p className="text-emerald-800 text-[10px] mt-0.5">
                Standards maintain unbroken traceability to the National Prototype Kilogram No. 57.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-foundation-50 border-t border-foundation-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-foundation-300 text-foundation-700 hover:bg-foundation-100 text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => alert(`Certificate ${standard.certificateNumber} document viewer triggered.`)}
              className="px-4 py-2 border border-brand-300 text-brand-700 hover:bg-brand-50 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <FileText size={13} />
              <span>View Document</span>
            </button>
            <button
              type="button"
              onClick={() => alert(`Downloading signed certificate ${standard.certificateNumber}.pdf...`)}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Download size={13} />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
