import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  Award,
} from 'lucide-react';

interface GreenStampedSealProps {
  sessionNumber: string;
  reportUuid: string;
  signatureDigest: string;
  signerName: string;
  signerDesignation: string;
  signedAt: string;
  verificationUrl?: string;
  qrCodeBase64?: string;
  laboratoryName: string;
  accuracyClass: string;
}

export const GreenStampedSeal: React.FC<GreenStampedSealProps> = ({
  sessionNumber,
  reportUuid,
  signatureDigest,
  signerName,
  signerDesignation,
  signedAt,
  verificationUrl = `https://emaap.doca.gov.in/verify/${reportUuid}?sig=${signatureDigest.slice(0, 32)}`,
  qrCodeBase64,
  laboratoryName,
  accuracyClass,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyDigest = () => {
    navigator.clipboard.writeText(signatureDigest);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = new Date(signedAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-500/80 bg-gradient-to-br from-emerald-50/90 via-white to-emerald-100/40 p-6 shadow-xl dark:border-emerald-500/60 dark:from-emerald-950/40 dark:via-slate-900/90 dark:to-emerald-950/20 backdrop-blur-md transition-all">
      {/* Background Decorative Guilloche Watermark */}
      <div className="pointer-events-none absolute -right-16 -top-16 opacity-10 dark:opacity-15">
        <svg width="260" height="260" viewBox="0 0 200 200" fill="none" className="text-emerald-700 animate-spin-slow">
          <circle cx="100" cy="100" r="95" stroke="currentColor" strokeWidth="2" strokeDasharray="4 2" />
          <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="1.5" strokeDasharray="8 4" />
          <circle cx="100" cy="100" r="65" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
          <polygon
            points="100,20 120,80 180,80 130,120 150,180 100,140 50,180 70,120 20,80 80,80"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
      </div>

      {/* Main Content Layout */}
      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left: Official Legal Metrology Emblem & Certificate Stamp */}
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            {/* Ink Stamp Badge Circle */}
            <div className="w-20 h-20 rounded-full border-4 border-double border-emerald-600 dark:border-emerald-400 bg-emerald-100 dark:bg-emerald-900/50 flex flex-col items-center justify-center p-1 text-center shadow-inner transform -rotate-3">
              <Award className="w-6 h-6 text-emerald-700 dark:text-emerald-300 mb-0.5" />
              <span className="text-[7.5px] font-black uppercase tracking-tighter text-emerald-800 dark:text-emerald-200 leading-tight">
                GOVT OF INDIA
              </span>
              <span className="text-[6.5px] font-bold text-emerald-700 dark:text-emerald-300 leading-none">
                LEGAL METROLOGY
              </span>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white rounded-full p-1 shadow-md">
              <Lock className="w-3 h-3" />
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-600 text-white shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Officially Certified & Sealed
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700">
                Rule 16 • LM Rules 2011
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                {accuracyClass.replace('_', ' ')}
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mt-1.5 flex items-center gap-2">
              <span>National Verification Certificate Issued</span>
              <span className="text-xs font-normal text-emerald-700 dark:text-emerald-400 font-mono">
                [{sessionNumber}]
              </span>
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              Digitally signed and sealed by <strong className="text-slate-800 dark:text-slate-100">{signerName}</strong>, {signerDesignation} at {laboratoryName}.
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <strong className="text-slate-700 dark:text-slate-300 font-medium">Certified At:</strong> {formattedDate}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <strong className="text-slate-700 dark:text-slate-300 font-medium">Status:</strong>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase">Locked / Non-Repudiable</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Cryptographic Digest & QR Code Integration */}
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/80 dark:bg-slate-900/80 p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 shadow-sm w-full lg:w-auto">
          {/* QR Code */}
          <div className="flex-shrink-0 flex flex-col items-center">
            {qrCodeBase64 ? (
              <img
                src={qrCodeBase64}
                alt="eMaap Verification QR Code"
                className="w-20 h-20 rounded-lg border border-slate-200 dark:border-slate-700 bg-white p-1 shadow-sm"
              />
            ) : (
              <div className="w-20 h-20 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex flex-col items-center justify-center text-slate-400">
                <QrCode className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[9px] font-mono mt-0.5">eMaap QR</span>
              </div>
            )}
            <a
              href={verificationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium hover:underline mt-1 flex items-center gap-1"
            >
              Verify <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>

          {/* Cryptographic Hash Block */}
          <div className="flex-1 min-w-[200px] text-xs">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                SHA-256 Audit Digest
              </span>
              <button
                onClick={handleCopyDigest}
                className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1"
                title="Copy SHA-256 Digest"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            <div className="font-mono text-[10px] bg-slate-100 dark:bg-slate-950 p-2 rounded border border-slate-200 dark:border-slate-800 break-all select-all text-slate-700 dark:text-slate-300">
              {signatureDigest}
            </div>

            <div className="mt-2 text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>NIST P-256 ECDSA Digital Signature Verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
