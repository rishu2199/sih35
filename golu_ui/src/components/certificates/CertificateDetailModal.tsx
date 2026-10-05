import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Camera,
  History,
  ExternalLink,
  Copy,
  Check,
  Globe,
  Layers,
  Lock,
} from 'lucide-react';
import { CertificateItem, CertificateLanguage } from './types';

interface CertificateDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificate: CertificateItem | null;
  initialLanguage?: CertificateLanguage;
  onNavigateToAudit?: (sessionId: string) => void;
  onDownloadPdf?: (cert: CertificateItem) => void;
  onDownloadWord?: (cert: CertificateItem) => void;
  onVerifyEmaap?: (cert: CertificateItem) => void;
}

export const CertificateDetailModal: React.FC<CertificateDetailModalProps> = ({
  isOpen,
  onClose,
  certificate,
  initialLanguage = 'bilingual',
  onNavigateToAudit,
  onDownloadPdf,
  onDownloadWord,
  onVerifyEmaap,
}) => {
  const [language, setLanguage] = useState<CertificateLanguage>(initialLanguage);
  const [isCopiedUrl, setIsCopiedUrl] = useState(false);
  const [isCopiedHash, setIsCopiedHash] = useState(false);

  // Sync initialLanguage when modal opens
  React.useEffect(() => {
    if (initialLanguage) {
      setLanguage(initialLanguage);
    }
  }, [initialLanguage, isOpen]);

  if (!isOpen || !certificate) return null;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(certificate.verificationUrl);
    setIsCopiedUrl(true);
    setTimeout(() => setIsCopiedUrl(false), 2000);
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(certificate.sha256Digest);
    setIsCopiedHash(true);
    setTimeout(() => setIsCopiedHash(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto font-sans">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-foundation-950/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-5xl my-6 bg-white rounded-2xl shadow-2xl border border-foundation-200 overflow-hidden flex flex-col max-h-[94vh]">
        {/* 1. Top Document Workspace Toolbar (Section 11) */}
        <div className="p-4 border-b border-foundation-200 bg-foundation-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300">
              {certificate.id}
            </span>
            <span className="text-xs font-bold text-foundation-800 truncate max-w-xs hidden sm:inline">
              {certificate.instrument}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Selector Inside Document Viewer */}
            <div className="flex items-center p-1 bg-foundation-200 rounded-xl border border-foundation-300/80">
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  language === 'en' ? 'bg-white text-foundation-900 shadow-xs font-bold' : 'text-foundation-600'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  language === 'hi' ? 'bg-white text-foundation-900 shadow-xs font-bold' : 'text-foundation-600'
                }`}
              >
                हिन्दी
              </button>
              <button
                onClick={() => setLanguage('bilingual')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  language === 'bilingual' ? 'bg-brand-600 text-white shadow-xs font-bold' : 'text-foundation-600'
                }`}
              >
                Bilingual
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="p-2 rounded-xl border border-foundation-300 bg-white hover:bg-foundation-50 text-foundation-700 transition-colors shadow-2xs cursor-pointer"
              title="Print Certificate"
            >
              <Printer size={16} />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-foundation-400 hover:text-foundation-700 hover:bg-foundation-200 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 2. Main 2-Panel Layout: Document Sheet on Left (68%), Info & Actions on Right (32%) */}
        <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row bg-slate-100">
          {/* Left: The Official Certificate Document Sheet (Section 12) */}
          <div className="flex-1 p-4 sm:p-8 flex justify-center overflow-y-auto">
            <div className="w-full max-w-2xl bg-white border border-slate-300 p-8 sm:p-10 shadow-md font-serif text-slate-900 space-y-6 relative">
              {/* Official Seal Watermark (Green Guilloche Rosette) */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                <div className="w-96 h-96 rounded-full border-[12px] border-emerald-900 flex items-center justify-center">
                  <div className="w-72 h-72 rounded-full border-[8px] border-emerald-800" />
                </div>
              </div>

              {/* Document Header (Section 12: clean white, deep navy headings, thin rules) */}
              <div className="text-center space-y-1 pb-4 border-b-2 border-slate-900">
                {/* Emblem Stamp */}
                <div className="w-11 h-11 mx-auto rounded-full border border-slate-800 flex items-center justify-center font-bold text-slate-900 text-xs mb-1.5 bg-slate-50">
                  सत्यमेव जयते
                </div>

                {language === 'hi' ? (
                  <>
                    <h1 className="text-base font-bold uppercase tracking-wider text-slate-950 font-serif">
                      भारत सरकार • विधिक मापविज्ञान प्रभाग
                    </h1>
                    <h2 className="text-xs font-semibold text-slate-800">
                      उपभोक्ता मामले, खाद्य और सार्वजनिक वितरण मंत्रालय
                    </h2>
                    <div className="text-[10px] font-mono text-slate-600">
                      क्षेत्रीय संदर्भ मानक प्रयोगशाला • {certificate.laboratory}
                    </div>
                    <div className="pt-2 text-sm font-bold text-slate-950 uppercase tracking-widest underline decoration-1 underline-offset-4">
                      विधिक सत्यापन प्रमाण-पत्र (अनुसूची XI)
                    </div>
                  </>
                ) : language === 'bilingual' ? (
                  <>
                    <h1 className="text-sm font-bold uppercase tracking-wider text-slate-950 font-serif">
                      GOVERNMENT OF INDIA • भारत सरकार
                    </h1>
                    <h2 className="text-xs font-semibold text-slate-800">
                      MINISTRY OF CONSUMER AFFAIRS • उपभोक्ता मामले मंत्रालय
                    </h2>
                    <div className="text-[10px] font-mono text-slate-600">
                      LEGAL METROLOGY DIVISION • {certificate.laboratory}
                    </div>
                    <div className="pt-2 text-xs font-bold text-slate-950 uppercase tracking-widest underline decoration-1 underline-offset-4">
                      CERTIFICATE OF METROLOGICAL VERIFICATION • सत्यापन प्रमाण-पत्र
                    </div>
                  </>
                ) : (
                  <>
                    <h1 className="text-base font-bold uppercase tracking-wider text-slate-950 font-serif">
                      GOVERNMENT OF INDIA
                    </h1>
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-800">
                      Department of Consumer Affairs • Legal Metrology Division
                    </h2>
                    <div className="text-[10px] font-mono text-slate-600 uppercase">
                      Regional Reference Standard Laboratory • {certificate.laboratory}
                    </div>
                    <div className="pt-2 text-sm font-bold text-slate-950 uppercase tracking-widest underline decoration-1 underline-offset-4">
                      Certificate of Metrological Verification
                    </div>
                  </>
                )}

                <div className="text-[9px] font-mono text-slate-500 pt-1">
                  Issued under Section 24 of Legal Metrology Act, 2009 & Rule 14 of LM (General) Rules, 2011 • OIML R 76-1 Compliant
                </div>
              </div>

              {/* ID & Date Ribbon */}
              <div className="flex items-center justify-between text-xs font-mono border-b border-slate-200 pb-2">
                <div>
                  <strong>{language === 'hi' ? 'प्रमाणपत्र सं:' : 'Certificate No:'}</strong>{' '}
                  <span className="font-bold text-slate-900">{certificate.id}</span>
                </div>
                <div>
                  <strong>{language === 'hi' ? 'जारी तिथि:' : 'Issue Date:'}</strong>{' '}
                  <span>{certificate.approvedAt}</span>
                </div>
              </div>

              {/* Section 6 & 26: Statutory Details Table */}
              <div className="space-y-2 text-xs">
                <table className="w-full border-collapse border border-slate-300 text-xs">
                  <tbody>
                    {/* BILINGUAL DUAL-COLUMN TABLE (Section 6) */}
                    {language === 'bilingual' ? (
                      <>
                        <tr className="border-b border-slate-300 bg-slate-100 font-bold text-[10px] uppercase font-mono text-slate-800">
                          <td className="p-2 border-r border-slate-300 w-1/3">Parameter (English)</td>
                          <td className="p-2 border-r border-slate-300 w-1/3">पैरामीटर (हिन्दी)</td>
                          <td className="p-2">Verified Value / सत्यापन मूल्य</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="p-2 font-medium">Manufacturer</td>
                          <td className="p-2 font-medium">निर्माता</td>
                          <td className="p-2 font-mono font-bold">{certificate.manufacturer}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="p-2 font-medium">Instrument Model</td>
                          <td className="p-2 font-medium">उपकरण मॉडल</td>
                          <td className="p-2 font-mono">{certificate.model}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="p-2 font-medium">Serial Number</td>
                          <td className="p-2 font-medium">क्रम संख्या</td>
                          <td className="p-2 font-mono font-bold text-emerald-900">{certificate.serialNumber}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="p-2 font-medium">Accuracy Class</td>
                          <td className="p-2 font-medium">शुद्धता वर्ग</td>
                          <td className="p-2 font-mono font-bold">{certificate.accuracyClass}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="p-2 font-medium">Maximum Capacity (Max)</td>
                          <td className="p-2 font-medium">अधिकतम क्षमता (Max)</td>
                          <td className="p-2 font-mono">{certificate.maxCapacity}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="p-2 font-medium">Verification Interval (e)</td>
                          <td className="p-2 font-medium">सत्यापन अंतराल (e)</td>
                          <td className="p-2 font-mono">{certificate.interval}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="p-2 font-medium">Statutory Verification Validity</td>
                          <td className="p-2 font-medium">सत्यापन वैधता अवधि</td>
                          <td className="p-2 font-mono font-bold">{certificate.validUntil}</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-medium">Reference Standard Used</td>
                          <td className="p-2 font-medium">प्रयुक्त संदर्भ मानक</td>
                          <td className="p-2 font-mono">{certificate.standardWeightsUsed}</td>
                        </tr>
                      </>
                    ) : language === 'hi' ? (
                      /* HINDI ONLY TABLE */
                      <>
                        <tr className="border-b border-slate-200">
                          <td className="p-2.5 bg-slate-50 font-semibold w-1/3">निर्माता</td>
                          <td className="p-2.5 font-mono font-bold">{certificate.manufacturer}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="p-2.5 bg-slate-50 font-semibold">उपकरण मॉडल</td>
                          <td className="p-2.5 font-mono">{certificate.model}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="p-2.5 bg-slate-50 font-semibold">क्रम संख्या</td>
                          <td className="p-2.5 font-mono font-bold text-emerald-900">{certificate.serialNumber}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="p-2.5 bg-slate-50 font-semibold">शुद्धता वर्ग</td>
                          <td className="p-2.5 font-mono font-bold">{certificate.accuracyClass}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="p-2.5 bg-slate-50 font-semibold">अधिकतम क्षमता</td>
                          <td className="p-2.5 font-mono">{certificate.maxCapacity}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="p-2.5 bg-slate-50 font-semibold">सत्यापन अंतराल (e)</td>
                          <td className="p-2.5 font-mono">{certificate.interval}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="p-2.5 bg-slate-50 font-semibold">सत्यापन वैधता</td>
                          <td className="p-2.5 font-mono font-bold">{certificate.validUntil}</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 bg-slate-50 font-semibold">प्रयुक्त संदर्भ मानक</td>
                          <td className="p-2.5 font-mono">{certificate.standardWeightsUsed}</td>
                        </tr>
                      </>
                    ) : (
                      /* ENGLISH ONLY TABLE */
                      <>
                        <tr className="border-b border-slate-200">
                          <td className="p-2.5 bg-slate-50 font-semibold w-1/3">Manufacturer</td>
                          <td className="p-2.5 font-mono font-bold">{certificate.manufacturer}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="p-2.5 bg-slate-50 font-semibold">Instrument Model</td>
                          <td className="p-2.5 font-mono">{certificate.model}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="p-2.5 bg-slate-50 font-semibold">Serial Number</td>
                          <td className="p-2.5 font-mono font-bold text-emerald-900">{certificate.serialNumber}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="p-2.5 bg-slate-50 font-semibold">Accuracy Class</td>
                          <td className="p-2.5 font-mono font-bold">{certificate.accuracyClass}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="p-2.5 bg-slate-50 font-semibold">Maximum Capacity</td>
                          <td className="p-2.5 font-mono">{certificate.maxCapacity}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="p-2.5 bg-slate-50 font-semibold">Verification Interval (e)</td>
                          <td className="p-2.5 font-mono">{certificate.interval}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="p-2.5 bg-slate-50 font-semibold">Verification Validity</td>
                          <td className="p-2.5 font-mono font-bold">{certificate.validUntil}</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 bg-slate-50 font-semibold">Traceable Standard</td>
                          <td className="p-2.5 font-mono">{certificate.standardWeightsUsed}</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Statutory Legal Declaration */}
              <div className="p-3 bg-slate-50 border border-slate-200 text-[11px] leading-relaxed italic text-slate-700">
                {language === 'hi' ? (
                  <>
                    "यह प्रमाणित किया जाता है कि उपरोक्त उपकरण का विधिक मापविज्ञान अधिनियम, २००९ एवं संबंधित नियमों के अंतर्गत परीक्षण एवं सत्यापन किया गया है, तथा यह विहित अधिकतम अनुमेय त्रुटि सीमाओं के अनुरूप पाया गया है।"
                  </>
                ) : (
                  <>
                    "This is to certify that the weighing instrument described above has been inspected and tested in accordance with Section 24 of the Legal Metrology Act, 2009 and OIML R 76-1. The instrument complies with statutory Maximum Permissible Error (MPE) tolerances and is hereby stamped and verified for commercial/prescribed use."
                  </>
                )}
              </div>

              {/* Bottom Signatory & Stamp (Section 12) */}
              <div className="pt-4 border-t-2 border-slate-900 flex items-end justify-between">
                {/* QR Code */}
                <div className="space-y-1">
                  <div className="w-16 h-16 border border-slate-300 p-1 bg-white shadow-2xs">
                    <QrCode size={56} className="text-slate-950" />
                  </div>
                  <div className="text-[9px] font-mono text-slate-600">eMaap Registry QR</div>
                </div>

                {/* Green Guilloche Verification Stamp */}
                <div className="w-24 h-24 border-2 border-dashed border-emerald-800 rounded-full flex flex-col items-center justify-center p-2 text-center text-emerald-900 rotate-[-4deg] bg-emerald-50/40 shadow-xs">
                  <CheckCircle2 size={18} className="text-emerald-700" />
                  <div className="text-[8px] font-extrabold uppercase mt-0.5 tracking-wider">VERIFIED</div>
                  <div className="text-[6px] font-mono">GOVT OF INDIA</div>
                  <div className="text-[5px] font-mono text-emerald-800">PIN AUTH: 7620</div>
                </div>

                {/* Director Signature Authority */}
                <div className="text-right space-y-0.5">
                  <div className="font-serif italic text-slate-950 text-sm font-bold">
                    {certificate.director}
                  </div>
                  <div className="text-[11px] font-bold text-slate-800 font-sans">
                    {certificate.directorRole}
                  </div>
                  <div className="text-[9px] font-mono text-emerald-800">
                    4-Digit PIN Authenticated • Digital Guilloche Attached
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Document Info & One-Click Actions Panel (Section 11 & 13) */}
          <div className="w-full lg:w-80 bg-white border-t lg:border-t-0 lg:border-l border-foundation-200 p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-foundation-400 uppercase tracking-wider font-mono">
                  Document Info
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                    <CheckCircle2 size={12} className="text-emerald-700" />
                    <span>✓ VERIFIED</span>
                  </span>
                </div>
              </div>

              {/* Key Attributes */}
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-foundation-400 text-[10px] font-mono uppercase">Authorizing Director</span>
                  <div className="font-bold text-foundation-900 mt-0.5">{certificate.director}</div>
                  <div className="text-[11px] text-foundation-500">{certificate.laboratory}</div>
                </div>

                <div>
                  <span className="text-foundation-400 text-[10px] font-mono uppercase">SHA-256 Digest</span>
                  <div className="font-mono text-[11px] text-foundation-700 bg-foundation-50 p-2 rounded-lg border border-foundation-200 break-all select-all mt-1">
                    {certificate.sha256Digest.slice(0, 16)}...{certificate.sha256Digest.slice(-12)}
                  </div>
                  <button
                    onClick={handleCopyHash}
                    className="text-[11px] font-mono text-brand-600 hover:text-brand-800 mt-1 flex items-center gap-1 cursor-pointer"
                  >
                    {isCopiedHash ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                    <span>{isCopiedHash ? 'Digest Copied' : 'Copy Full SHA-256'}</span>
                  </button>
                </div>

                <div>
                  <span className="text-foundation-400 text-[10px] font-mono uppercase">Public Verification URL</span>
                  <div className="text-[11px] font-mono text-foundation-600 truncate mt-0.5">
                    {certificate.verificationUrl}
                  </div>
                  <button
                    onClick={handleCopyUrl}
                    className="text-[11px] font-mono text-brand-600 hover:text-brand-800 mt-1 flex items-center gap-1 cursor-pointer"
                  >
                    {isCopiedUrl ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                    <span>{isCopiedUrl ? 'URL Copied' : 'Copy Verification URL'}</span>
                  </button>
                </div>
              </div>

              {/* Audit Connection Link (Section 24) */}
              {onNavigateToAudit && (
                <div className="pt-2">
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToAudit(certificate.sessionId);
                    }}
                    className="w-full py-2 px-3 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <History size={13} className="text-purple-700" />
                    <span>View Audit Trail →</span>
                  </button>
                </div>
              )}
            </div>

            {/* One-Click Action Hierarchy (Section 13) */}
            <div className="space-y-2 pt-4 border-t border-foundation-200">
              <button
                onClick={() => onDownloadPdf?.(certificate)}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download size={14} />
                <span>Download PDF/A</span>
              </button>

              <button
                onClick={() => onDownloadWord?.(certificate)}
                className="w-full py-2 px-4 rounded-xl border border-foundation-300 bg-white hover:bg-foundation-100 text-xs font-bold text-foundation-800 transition-colors shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download size={14} className="text-blue-600" />
                <span>Download DOCX</span>
              </button>

              <button
                onClick={() => onVerifyEmaap?.(certificate)}
                className="w-full py-2 px-4 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ExternalLink size={13} className="text-emerald-700" />
                <span>Verify on eMaap Portal ↗</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
