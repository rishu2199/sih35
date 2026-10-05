import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, QrCode, Copy, Check, ExternalLink } from 'lucide-react';
import { CertificateItem } from './types';

interface EmaapVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificate: CertificateItem | null;
}

export const EmaapVerificationModal: React.FC<EmaapVerificationModalProps> = ({
  isOpen,
  onClose,
  certificate,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !certificate) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(certificate.verificationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-foundation-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-foundation-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-foundation-200 bg-emerald-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold text-foundation-900 tracking-tight font-sans">
                eMaap Certificate Verification
              </h3>
              <p className="text-xs text-foundation-500 font-mono">
                National Legal Metrology Portal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-foundation-400 hover:text-foundation-700 hover:bg-foundation-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-foundation-50 border border-foundation-200 text-xs">
            <div>
              <span className="font-mono text-[10px] text-foundation-500 font-bold uppercase">Certificate ID</span>
              <div className="font-mono text-sm font-bold text-foundation-900">{certificate.id}</div>
              <div className="text-[11px] text-foundation-600 mt-0.5">{certificate.instrument}</div>
            </div>
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
              ✓ VALID
            </span>
          </div>

          {/* Validation Checks */}
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2.5 text-xs">
            <div className="flex items-center gap-2 text-emerald-950 font-semibold">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>Certificate record found in National Registry</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-950 font-semibold">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>Digital signature of Director confirmed valid</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-950 font-semibold">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>SHA-256 Integrity digest verified</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-950 font-semibold">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>Status: APPROVED & STATUTORILY VALID</span>
            </div>
          </div>

          {/* QR & Copy Link */}
          <div className="p-3 rounded-xl border border-foundation-200 bg-foundation-50 flex items-center justify-between text-xs font-mono">
            <div className="truncate pr-2 text-foundation-600 text-[11px]">
              {certificate.verificationUrl}
            </div>
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 rounded-lg bg-white border border-foundation-300 text-foundation-700 text-xs font-semibold flex items-center gap-1 shrink-0"
            >
              {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5"
            >
              <ExternalLink size={14} />
              <span>Open Public Verification Portal (Demo Link)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
