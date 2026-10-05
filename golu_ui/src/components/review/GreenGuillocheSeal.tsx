import React, { useState } from 'react';
import { ShieldCheck, Check, Copy, QrCode, FileText, Download, Printer, Lock } from 'lucide-react';
import { CertificateInfo } from './types';

interface GreenGuillocheSealProps {
  certificate: CertificateInfo;
  instrumentModel: string;
  serialNumber: string;
  onViewCertificateModal?: () => void;
  onDownloadPdf?: () => void;
  onDownloadWord?: () => void;
}

export const GreenGuillocheSeal: React.FC<GreenGuillocheSealProps> = ({
  certificate,
  instrumentModel,
  serialNumber,
  onViewCertificateModal,
  onDownloadPdf,
  onDownloadWord,
}) => {
  const [copiedUrl, setCopiedUrl] = useState(false);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(certificate.verificationUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  // Generate Guilloche rosette petals path
  // Epitrochoid / Hypotrochoid curve points
  const generateGuillochePath = (radius: number, petals: number, stepCount = 180) => {
    let d = '';
    const R = radius;
    const r = radius / petals;
    const p = radius * 0.45;

    for (let i = 0; i <= stepCount; i++) {
      const theta = (i * 2 * Math.PI) / stepCount;
      const x = (R - r) * Math.cos(theta) + p * Math.cos(((R - r) * theta) / r);
      const y = (R - r) * Math.sin(theta) - p * Math.sin(((R - r) * theta) / r);
      if (i === 0) {
        d += `M ${120 + x} ${120 + y}`;
      } else {
        d += ` L ${120 + x} ${120 + y}`;
      }
    }
    return d + ' Z';
  };

  const path1 = generateGuillochePath(80, 8);
  const path2 = generateGuillochePath(72, 12);
  const path3 = generateGuillochePath(64, 16);

  return (
    <div className="bg-gradient-to-b from-emerald-950/5 via-white to-emerald-950/10 border-2 border-emerald-600/30 rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
      {/* Background watermark badge */}
      <div className="absolute -right-8 -bottom-8 w-64 h-64 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-emerald-200/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
            <Lock size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
                🔒 APPROVED · PERMANENTLY IMMUTABLE
              </span>
              <span className="text-[11px] font-mono text-emerald-800">
                WELMEC 7.2 Compliant
              </span>
            </div>
            <h2 className="text-lg font-bold text-foundation-900 mt-1 tracking-tight font-sans">
              Statutory Certificate of Legal Metrological Verification
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-emerald-800 bg-white px-3 py-1.5 rounded-xl border border-emerald-300 shadow-xs">
            Cert ID: {certificate.id}
          </span>
        </div>
      </div>

      {/* Central Guilloche Rosette Presentation */}
      <div className="my-8 flex flex-col md:flex-row items-center justify-center gap-8 lg:gap-12">
        {/* Animated Guilloche Vector Rosette */}
        <div className="relative w-56 h-56 shrink-0 flex items-center justify-center select-none">
          {/* Subtle animated spinning rosette lines */}
          <svg
            className="w-full h-full animate-[spin_20s_linear_infinite]"
            viewBox="0 0 240 240"
            fill="none"
          >
            <circle cx="120" cy="120" r="110" stroke="#059669" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
            <circle cx="120" cy="120" r="102" stroke="#10B981" strokeWidth="1" opacity="0.8" />
            
            <path d={path1} stroke="#047857" strokeWidth="1.2" opacity="0.75" />
            <path d={path2} stroke="#10B981" strokeWidth="1" opacity="0.65" />
            <path d={path3} stroke="#059669" strokeWidth="0.8" opacity="0.85" />
            
            <circle cx="120" cy="120" r="54" fill="#ECFDF5" stroke="#047857" strokeWidth="2" />
          </svg>

          {/* Central seal badge */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center mb-1 shadow-xs">
              <Check size={18} strokeWidth={3} />
            </div>
            <span className="text-[10px] font-bold text-emerald-900 tracking-wider uppercase font-sans">
              Govt. of India
            </span>
            <span className="text-[11px] font-extrabold text-emerald-950 font-serif uppercase tracking-tight">
              VERIFIED
            </span>
            <span className="text-[8px] font-mono font-semibold text-emerald-800">
              LEGAL METROLOGY
            </span>
          </div>
        </div>

        {/* Certificate Details */}
        <div className="flex-1 max-w-lg space-y-4">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white border border-foundation-200">
              <span className="text-[10px] font-bold text-foundation-400 uppercase tracking-wider font-mono">
                Instrument & Serial
              </span>
              <div className="font-bold text-foundation-900 mt-0.5">{instrumentModel}</div>
              <div className="text-[11px] font-mono text-foundation-500">{serialNumber}</div>
            </div>

            <div className="p-3 rounded-xl bg-white border border-foundation-200">
              <span className="text-[10px] font-bold text-foundation-400 uppercase tracking-wider font-mono">
                Sign-off Authority
              </span>
              <div className="font-bold text-foundation-900 mt-0.5">{certificate.signedBy}</div>
              <div className="text-[11px] text-foundation-500">{certificate.signedRole}</div>
            </div>

            <div className="p-3 rounded-xl bg-white border border-foundation-200">
              <span className="text-[10px] font-bold text-foundation-400 uppercase tracking-wider font-mono">
                Date & Time of Seal
              </span>
              <div className="font-bold text-foundation-900 mt-0.5">{certificate.signTimestamp}</div>
              <div className="text-[11px] text-emerald-700 font-medium">Valid for 12 Months</div>
            </div>

            <div className="p-3 rounded-xl bg-white border border-foundation-200">
              <span className="text-[10px] font-bold text-foundation-400 uppercase tracking-wider font-mono">
                Laboratory Node
              </span>
              <div className="font-bold text-foundation-900 mt-0.5">Central LM Laboratory</div>
              <div className="text-[11px] text-foundation-500">Node ID: RRSL-DL-01</div>
            </div>
          </div>

          {/* QR & Verification Link Box */}
          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              {/* QR Pattern visualizer */}
              <div className="w-12 h-12 bg-white p-1 rounded-lg border border-emerald-300 shrink-0 flex items-center justify-center">
                <QrCode size={38} className="text-emerald-900" />
              </div>

              <div>
                <div className="font-bold text-emerald-950 font-sans">
                  Public Statutory Verification URL
                </div>
                <div className="font-mono text-[11px] text-emerald-700 truncate max-w-[240px] sm:max-w-xs">
                  {certificate.verificationUrl}
                </div>
              </div>
            </div>

            <button
              onClick={handleCopyUrl}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-emerald-100/70 border border-emerald-300 text-emerald-800 text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0"
            >
              {copiedUrl ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
              <span>{copiedUrl ? 'Copied' : 'Copy URL'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Post-Approval Action Buttons */}
      <div className="pt-6 border-t border-emerald-200/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-900">
          <ShieldCheck size={16} className="text-emerald-600" />
          <span>Cryptographic Hash Sealed: {certificate.sha256Digest.slice(0, 16)}...</span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onViewCertificateModal}
            className="px-4 py-2 rounded-xl bg-white hover:bg-foundation-50 border border-foundation-200 text-xs font-bold text-foundation-800 shadow-xs transition-colors flex items-center gap-1.5"
          >
            <FileText size={14} className="text-brand-600" />
            <span>View Certificate</span>
          </button>

          <button
            onClick={onDownloadPdf}
            className="px-4 py-2 rounded-xl bg-white hover:bg-foundation-50 border border-foundation-200 text-xs font-bold text-foundation-800 shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Download size={14} className="text-emerald-600" />
            <span>Download PDF/A</span>
          </button>

          <button
            onClick={onDownloadWord}
            className="px-4 py-2 rounded-xl bg-white hover:bg-foundation-50 border border-foundation-200 text-xs font-bold text-foundation-800 shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Download size={14} className="text-blue-600" />
            <span>Download Word</span>
          </button>
        </div>
      </div>
    </div>
  );
};
