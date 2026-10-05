import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Download,
  ExternalLink,
  History,
  FileText,
  Lock,
  ArrowUpRight,
  Printer,
  QrCode,
  Layers,
} from 'lucide-react';
import { CertificateItem } from './types';

interface CertificateDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  certificate: CertificateItem | null;
  onOpenPreview: (cert: CertificateItem) => void;
  onDownloadPdf: (cert: CertificateItem) => void;
  onDownloadWord: (cert: CertificateItem) => void;
  onVerifyEmaap: (cert: CertificateItem) => void;
  onViewAudit?: (sessionId: string) => void;
  onViewSession?: (sessionId: string) => void;
}

export const CertificateDetailsDrawer: React.FC<CertificateDetailsDrawerProps> = ({
  isOpen,
  onClose,
  certificate,
  onOpenPreview,
  onDownloadPdf,
  onDownloadWord,
  onVerifyEmaap,
  onViewAudit,
  onViewSession,
}) => {
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  if (!isOpen || !certificate) return null;

  const handleCopyHash = () => {
    navigator.clipboard.writeText(certificate.sha256Digest);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(certificate.verificationUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foundation-950/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md md:max-w-lg bg-white shadow-2xl flex flex-col border-l border-foundation-200">
          {/* 1. Drawer Header (Section 10) */}
          <div className="p-5 border-b border-foundation-200 bg-foundation-50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foundation-900 tracking-tight font-sans uppercase">
                  Certificate Details
                </h3>
                <p className="text-[11px] text-foundation-500 font-mono">
                  {certificate.id} • {certificate.laboratory}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-foundation-400 hover:text-foundation-700 hover:bg-foundation-200 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* 2. Drawer Body (Section 10, 24, 25) */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs font-sans">
            {/* Status Banner */}
            <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-950 font-bold">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span>✓ VERIFIED STATUTORY CERTIFICATE</span>
              </div>
              <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                ACTIVE
              </span>
            </div>

            {/* Certificate ID */}
            <div>
              <span className="text-[10px] font-bold text-foundation-400 uppercase tracking-wider font-mono">
                Certificate Number
              </span>
              <div className="text-base font-mono font-bold text-foundation-900 mt-0.5">
                {certificate.id}
              </div>
            </div>

            {/* Instrument & Manufacturer */}
            <div className="p-4 rounded-xl bg-foundation-50 border border-foundation-200 space-y-3">
              <div>
                <span className="text-[10px] font-bold text-foundation-400 uppercase tracking-wider font-mono">
                  Instrument & Manufacturer
                </span>
                <div className="text-sm font-bold text-foundation-900 mt-0.5">
                  {certificate.manufacturer}
                </div>
                <div className="text-xs font-semibold text-foundation-700">
                  {certificate.model}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-foundation-200/80">
                <div>
                  <span className="text-[10px] font-mono text-foundation-500 uppercase">Serial Number</span>
                  <div className="font-mono font-bold text-foundation-900 mt-0.5">{certificate.serialNumber}</div>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-foundation-500 uppercase">Accuracy Class</span>
                  <div className="font-mono font-bold text-brand-700 mt-0.5">{certificate.accuracyClass}</div>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-foundation-500 uppercase">Max Capacity</span>
                  <div className="font-mono font-bold text-foundation-800 mt-0.5">{certificate.maxCapacity}</div>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-foundation-500 uppercase">Verification Interval</span>
                  <div className="font-mono font-bold text-foundation-800 mt-0.5">{certificate.interval}</div>
                </div>
              </div>
            </div>

            {/* Director & Laboratory Authority */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-foundation-50 border border-foundation-200">
                <span className="text-[10px] font-bold text-foundation-400 uppercase tracking-wider font-mono">
                  Director Signatory
                </span>
                <div className="font-bold text-foundation-900 mt-0.5">{certificate.director}</div>
                <div className="text-[11px] text-foundation-500">{certificate.directorRole}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-foundation-50 border border-foundation-200">
                <span className="text-[10px] font-bold text-foundation-400 uppercase tracking-wider font-mono">
                  Laboratory Node
                </span>
                <div className="font-bold text-foundation-900 mt-0.5">{certificate.laboratory}</div>
                <div className="text-[11px] text-foundation-500">Issued: {certificate.approvedAt}</div>
              </div>
            </div>

            {/* Section 25: Connection with the test session */}
            <div className="p-3.5 rounded-xl bg-foundation-50 border border-foundation-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-foundation-400 uppercase tracking-wider font-mono">
                  Source Verification Session
                </span>
                <div className="font-mono font-bold text-brand-700 mt-0.5 flex items-center gap-1.5">
                  <span>{certificate.sessionId}</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded font-semibold">
                    ✓ Approved
                  </span>
                </div>
              </div>

              {onViewSession && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onViewSession(certificate.sessionId);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white border border-foundation-300 hover:bg-foundation-100 text-xs font-semibold text-foundation-800 transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
                >
                  <span>View Session</span>
                  <ArrowUpRight size={12} />
                </button>
              )}
            </div>

            {/* Section 24: Connection with the Cryptographic Audit Trail */}
            <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-purple-900 uppercase tracking-wider font-mono flex items-center gap-1">
                  <History size={12} className="text-purple-700" />
                  <span>Cryptographic Audit Proof</span>
                </span>
                <span className="text-[10px] font-mono text-purple-800 font-bold">
                  Block #41 Verified
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 text-slate-200 font-mono text-[11px] border border-purple-900/40 select-all">
                <div className="text-[10px] text-slate-400 pb-1 mb-1 border-b border-slate-800 flex items-center justify-between">
                  <span>SHA-256 Digest:</span>
                  <button
                    onClick={handleCopyHash}
                    className="text-slate-400 hover:text-white flex items-center gap-0.5 cursor-pointer"
                  >
                    {copiedHash ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                    <span>{copiedHash ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="break-all text-emerald-400 leading-snug">
                  {certificate.sha256Digest}
                </div>
              </div>

              {onViewAudit && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onViewAudit(certificate.sessionId);
                  }}
                  className="w-full mt-1.5 py-2 px-3 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <History size={13} />
                  <span>View Audit Trail →</span>
                </button>
              )}
            </div>

            {/* Public Verification Link */}
            <div className="p-3 rounded-xl bg-foundation-50 border border-foundation-200 space-y-1.5 font-mono">
              <div className="flex items-center justify-between text-[10px] text-foundation-500 font-bold uppercase">
                <span>Public Verification URL</span>
                <button
                  onClick={handleCopyUrl}
                  className="text-foundation-600 hover:text-foundation-900 flex items-center gap-1 cursor-pointer font-sans"
                >
                  {copiedUrl ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                  <span>{copiedUrl ? 'Copied' : 'Copy URL'}</span>
                </button>
              </div>
              <div className="text-[11px] text-foundation-700 truncate select-all">
                {certificate.verificationUrl}
              </div>
            </div>
          </div>

          {/* 3. Drawer Bottom Action Hierarchy (Section 10 & 13) */}
          <div className="p-4 border-t border-foundation-200 bg-foundation-50 space-y-2">
            <button
              onClick={() => {
                onClose();
                onOpenPreview(certificate);
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-foundation-900 hover:bg-foundation-800 text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FileText size={14} />
              <span>Open Certificate Document</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onDownloadPdf(certificate)}
                className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download size={13} />
                <span>Download PDF/A</span>
              </button>

              <button
                onClick={() => onDownloadWord(certificate)}
                className="w-full py-2 px-3 rounded-xl border border-foundation-300 bg-white hover:bg-foundation-100 text-xs font-bold text-foundation-800 transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download size={13} className="text-blue-600" />
                <span>Download DOCX</span>
              </button>
            </div>

            <button
              onClick={() => onVerifyEmaap(certificate)}
              className="w-full py-2 px-3 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ExternalLink size={13} className="text-emerald-700" />
              <span>Verify on eMaap Portal ↗</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
