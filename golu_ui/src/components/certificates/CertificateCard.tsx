import React, { useState } from 'react';
import {
  FileText,
  Download,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  MoreVertical,
  ShieldCheck,
  Check,
  ExternalLink,
  History,
  Lock,
  ArrowRight,
  User,
} from 'lucide-react';
import { CertificateItem, CertificateLanguage } from './types';

interface CertificateCardProps {
  certificate: CertificateItem;
  language: CertificateLanguage;
  onPreview: (cert: CertificateItem) => void;
  onOpenDrawer: (cert: CertificateItem) => void;
  onDownloadPdf: (cert: CertificateItem) => void;
  onDownloadWord: (cert: CertificateItem) => void;
  onVerifyEmaap: (cert: CertificateItem) => void;
  onViewAudit: (cert: CertificateItem) => void;
}

export const CertificateCard: React.FC<CertificateCardProps> = ({
  certificate,
  language,
  onPreview,
  onOpenDrawer,
  onDownloadPdf,
  onDownloadWord,
  onVerifyEmaap,
  onViewAudit,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isVerified = certificate.status === 'VERIFIED';
  const isRemanded = certificate.status === 'REMANDED';

  // Category & Class badges
  const isAnalytical = certificate.accuracyClass === 'Class I';

  return (
    <div
      onClick={() => onOpenDrawer(certificate)}
      className="bg-white border border-foundation-200 hover:border-brand-300 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative group cursor-pointer font-sans"
    >
      <div>
        {/* 1. Certificate ID First & Issue Date (Section 7 & 23) */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-foundation-900 group-hover:text-brand-600 transition-colors tracking-tight">
              {certificate.id}
            </span>
            <span className="text-[11px] font-mono text-foundation-400">•</span>
            <span className="text-[11px] font-mono text-foundation-500">
              {certificate.approvedAt}
            </span>
          </div>

          {/* Context Menu Trigger */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1 rounded-lg text-foundation-400 hover:text-foundation-700 hover:bg-foundation-100 transition-colors cursor-pointer"
              title="More actions"
            >
              <MoreVertical size={16} />
            </button>

            {isMenuOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setIsMenuOpen(false)} />
                <div className="absolute right-0 mt-1 w-52 rounded-xl border border-foundation-200 bg-white p-1.5 shadow-xl z-40 text-xs font-sans">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onPreview(certificate);
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-lg text-left text-foundation-700 hover:bg-foundation-50 transition-colors cursor-pointer"
                  >
                    <FileText size={13} className="text-brand-600" />
                    <span>Open Full Document</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onDownloadWord(certificate);
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-lg text-left text-foundation-700 hover:bg-foundation-50 transition-colors cursor-pointer"
                  >
                    <Download size={13} className="text-blue-600" />
                    <span>Download DOCX</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onVerifyEmaap(certificate);
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-lg text-left text-foundation-700 hover:bg-foundation-50 transition-colors cursor-pointer"
                  >
                    <QrCode size={13} className="text-emerald-600" />
                    <span>Verify on eMaap Portal</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onViewAudit(certificate);
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-lg text-left text-foundation-700 hover:bg-foundation-50 transition-colors cursor-pointer border-t border-foundation-100 mt-1 pt-1"
                  >
                    <History size={13} className="text-purple-600" />
                    <span>View Cryptographic Audit Trail</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 2. Instrument Identity Second (Section 7) */}
        <div className="mt-1">
          <div className="text-[11px] font-semibold text-foundation-500 uppercase tracking-wide">
            {certificate.manufacturer}
          </div>
          <h4 className="text-sm font-bold text-foundation-900 group-hover:text-brand-600 transition-colors leading-snug line-clamp-1">
            {certificate.model}
          </h4>
        </div>

        {/* Serial Number in Monospace */}
        <div className="flex items-center gap-2 mt-2 text-xs font-mono">
          <span className="font-bold text-foundation-900 bg-foundation-100 px-2 py-0.5 rounded border border-foundation-200">
            {certificate.serialNumber}
          </span>
          <span className="text-foundation-400">•</span>
          <span className="font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-100">
            {certificate.accuracyClass}
          </span>
          <span className="text-foundation-400">•</span>
          <span className="text-foundation-600 font-bold">
            {certificate.maxCapacity}
          </span>
        </div>

        {/* 3. Trust Status Third & Trust Strip (Section 8 & 23) */}
        <div className="mt-3.5 pt-3 border-t border-foundation-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
              <CheckCircle2 size={11} className="text-emerald-700" />
              <span>✓ VERIFIED</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-foundation-700">
            <User size={12} className="text-foundation-400" />
            <span className="font-bold">{certificate.director}</span>
          </div>
        </div>

        {/* Trust Strip Link back to Screen 12 (Section 23) */}
        <div className="mt-1 text-[11px] font-mono text-foundation-400 flex items-center justify-between">
          <span>✓ DIGITALLY VERIFIED</span>
          <span className="text-[10px] text-foundation-500">{certificate.laboratory}</span>
        </div>

        {/* 4. Small Recognizable QR Thumbnail (Section 9) */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            onVerifyEmaap(certificate);
          }}
          className="mt-3.5 p-2.5 rounded-xl border border-emerald-200/90 bg-emerald-50/40 hover:bg-emerald-100/50 cursor-pointer transition-colors flex items-center justify-between gap-3 group/qr shadow-2xs"
          title="Click to launch eMaap verification"
        >
          <div className="flex items-center gap-2.5">
            {/* Crisp QR Code */}
            <div className="w-8 h-8 bg-white p-0.5 rounded-lg border border-emerald-300 flex items-center justify-center shrink-0 shadow-2xs">
              <QrCode size={26} className="text-emerald-950" />
            </div>
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-900">
                Scan to verify
              </div>
              <div className="text-[10px] font-mono text-emerald-700">
                eMaap National Registry Key
              </div>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold text-emerald-800 group-hover/qr:underline flex items-center gap-0.5">
            <span>Verify</span>
            <ArrowRight size={11} />
          </span>
        </div>
      </div>

      {/* 5. Primary Card Bottom Actions (Section 7, 13, 22) */}
      <div className="mt-4 pt-3 border-t border-foundation-100 flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPreview(certificate);
            }}
            className="py-2 px-3 rounded-xl border border-foundation-200 hover:border-brand-300 bg-white hover:bg-brand-50 text-xs font-bold text-foundation-800 hover:text-brand-700 transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
          >
            <FileText size={13} className="text-brand-600" />
            <span>Preview</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDownloadPdf(certificate);
            }}
            className="py-2 px-3 rounded-xl bg-foundation-900 hover:bg-foundation-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Download size={13} />
            <span>Download</span>
          </button>
        </div>

        {/* Section 22: Subtle card hover prompt */}
        <div className="text-center">
          <span className="text-[10px] font-mono text-foundation-400 group-hover:text-brand-600 font-semibold transition-colors flex items-center justify-center gap-1">
            <span>View certificate details</span>
            <ArrowRight size={10} />
          </span>
        </div>
      </div>
    </div>
  );
};
