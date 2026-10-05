import React from 'react';
import { X, Printer, Download, CheckCircle2, ShieldCheck, QrCode } from 'lucide-react';
import { ReviewSessionCase, CertificateInfo } from './types';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: ReviewSessionCase;
  certificate: CertificateInfo;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  caseItem,
  certificate,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-foundation-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-3xl my-8 bg-white rounded-2xl shadow-2xl border border-foundation-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Control Bar */}
        <div className="p-4 border-b border-foundation-200 bg-foundation-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
              PDF/A PREVIEW
            </span>
            <span className="text-xs font-mono text-foundation-600">
              {certificate.id} · OIML R 76-1
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg border border-foundation-300 bg-white hover:bg-foundation-50 text-xs font-semibold text-foundation-700 transition-colors flex items-center gap-1.5"
            >
              <Printer size={14} />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-foundation-400 hover:text-foundation-700 hover:bg-foundation-200 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Certificate Paper Document */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-slate-50 flex justify-center">
          <div className="w-full max-w-2xl bg-white border-2 border-emerald-800/80 p-8 shadow-sm relative font-serif text-foundation-900 space-y-6">
            {/* Top Emblem & Header */}
            <div className="text-center space-y-1 border-b-2 border-double border-emerald-800 pb-4">
              <div className="w-12 h-12 mx-auto rounded-full border-2 border-emerald-800 flex items-center justify-center font-bold text-emerald-900 text-xs mb-1">
                GOI
              </div>
              <h1 className="text-lg font-bold uppercase tracking-widest text-emerald-950">
                Government of India
              </h1>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-foundation-800">
                Department of Consumer Affairs · Legal Metrology Division
              </h2>
              <div className="text-[11px] font-mono text-foundation-500 uppercase">
                Central Reference Standard Laboratory · New Delhi
              </div>
              <div className="pt-2 text-xs font-bold text-emerald-900 uppercase underline tracking-widest">
                Certificate of Metrological Verification
              </div>
              <div className="text-[11px] font-mono text-foundation-600">
                [ Issued under Section 24 of Legal Metrology Act, 2009 & OIML R 76-1 ]
              </div>
            </div>

            {/* Certificate ID & Metadata */}
            <div className="flex items-center justify-between text-xs font-mono border-b border-foundation-200 pb-2">
              <div>
                <strong>Certificate No:</strong> {certificate.id}
              </div>
              <div>
                <strong>Date of Verification:</strong> {certificate.signTimestamp.split('•')[0]}
              </div>
            </div>

            {/* Instrument Specification Table */}
            <div className="space-y-2 text-xs">
              <p className="leading-relaxed">
                This is to certify that the weighing instrument specified below has been examined and verified at the Central Legal Metrology Laboratory and found to conform to the standards and Maximum Permissible Errors prescribed under the Legal Metrology (General) Rules, 2011 and OIML R 76-1.
              </p>

              <table className="w-full border-collapse border border-foundation-300 text-xs mt-3">
                <tbody>
                  <tr className="border-b border-foundation-200">
                    <td className="p-2 bg-foundation-50 font-semibold w-1/3">Manufacturer</td>
                    <td className="p-2 font-mono">{caseItem.manufacturer}</td>
                  </tr>
                  <tr className="border-b border-foundation-200">
                    <td className="p-2 bg-foundation-50 font-semibold">Model / Type</td>
                    <td className="p-2 font-mono">{caseItem.model}</td>
                  </tr>
                  <tr className="border-b border-foundation-200">
                    <td className="p-2 bg-foundation-50 font-semibold">Serial Number</td>
                    <td className="p-2 font-mono font-bold text-emerald-900">{caseItem.serialNumber}</td>
                  </tr>
                  <tr className="border-b border-foundation-200">
                    <td className="p-2 bg-foundation-50 font-semibold">Accuracy Class</td>
                    <td className="p-2 font-mono font-bold">{caseItem.accuracyClass}</td>
                  </tr>
                  <tr className="border-b border-foundation-200">
                    <td className="p-2 bg-foundation-50 font-semibold">Maximum Capacity (Max)</td>
                    <td className="p-2 font-mono">{caseItem.maxCapacity}</td>
                  </tr>
                  <tr className="border-b border-foundation-200">
                    <td className="p-2 bg-foundation-50 font-semibold">Verification Scale Interval (e)</td>
                    <td className="p-2 font-mono">{caseItem.interval}</td>
                  </tr>
                  <tr>
                    <td className="p-2 bg-foundation-50 font-semibold">Traceable Standards Used</td>
                    <td className="p-2 font-mono">Standard Weight Set STD-E1-01 (NABL Cert #2026/E1/041)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Statutory Seal & Signature Box */}
            <div className="pt-6 border-t border-foundation-200 flex items-end justify-between">
              {/* QR Pattern */}
              <div className="space-y-1">
                <div className="w-20 h-20 border border-foundation-300 p-1 bg-white">
                  <QrCode size={70} className="text-emerald-950" />
                </div>
                <div className="text-[9px] font-mono text-foundation-500">
                  Scan to verify online authenticity
                </div>
              </div>

              {/* Digital Guilloche Stamp */}
              <div className="w-32 h-32 border-2 border-dashed border-emerald-700 rounded-full flex flex-col items-center justify-center p-2 text-center text-emerald-800 rotate-[-4deg]">
                <div className="text-[8px] font-bold uppercase tracking-wider">Govt of India</div>
                <CheckCircle2 size={24} className="text-emerald-700 my-0.5" />
                <div className="text-[10px] font-extrabold uppercase">VERIFIED</div>
                <div className="text-[7px] font-mono">CENTRAL LM LAB</div>
              </div>

              {/* Signature block */}
              <div className="text-right space-y-1">
                <div className="font-serif italic text-emerald-900 text-sm font-bold">
                  {certificate.signedBy}
                </div>
                <div className="text-xs font-bold text-foundation-800">
                  Laboratory Director
                </div>
                <div className="text-[10px] font-mono text-foundation-500">
                  Central Legal Metrology Reference Laboratory
                </div>
                <div className="text-[9px] font-mono text-emerald-700">
                  PIN Auth: •••• | SHA-256 Validated
                </div>
              </div>
            </div>

            {/* Bottom Footer Note */}
            <div className="text-center text-[10px] font-mono text-foundation-400 pt-4 border-t border-foundation-100">
              Security Hash: {certificate.sha256Digest.slice(0, 32)}... · This is an official digital government record.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
