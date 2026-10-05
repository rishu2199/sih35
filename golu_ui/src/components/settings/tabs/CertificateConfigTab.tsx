import React, { useState } from 'react';
import {
  FileCheck2,
  CheckCircle2,
  QrCode,
  ShieldCheck,
  ExternalLink,
  Award,
  Lock,
  Save,
  AlertTriangle,
  X,
  FileText,
  KeyRound,
} from 'lucide-react';
import { CertificateSettingsConfig } from '../types';

interface CertificateConfigTabProps {
  config: CertificateSettingsConfig;
  onSave: (updated: CertificateSettingsConfig) => void;
  canEdit?: boolean;
  onPreviewSample: () => void;
}

export const CertificateConfigTab: React.FC<CertificateConfigTabProps> = ({
  config,
  onSave,
  canEdit = true,
  onPreviewSample,
}) => {
  const [formData, setFormData] = useState<CertificateSettingsConfig>(config);
  const [prefixInput, setPrefixInput] = useState(config.certificateNumberPrefix);
  const [showPrefixConfirmModal, setShowPrefixConfirmModal] = useState(false);
  const [isSavedToast, setIsSavedToast] = useState(false);

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (prefixInput !== config.certificateNumberPrefix) {
      setShowPrefixConfirmModal(true);
      return;
    }
    applySave(formData);
  };

  const applySave = (dataToSave: CertificateSettingsConfig) => {
    onSave(dataToSave);
    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 3000);
  };

  const handleConfirmPrefixChange = () => {
    const updated = {
      ...formData,
      certificateNumberPrefix: prefixInput,
      nextCertificateId: `${prefixInput}-2026-000185`,
    };
    setFormData(updated);
    setShowPrefixConfirmModal(false);
    applySave(updated);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {isSavedToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">Certificate generation configuration updated successfully.</span>
        </div>
      )}

      {/* Main Certificate Output Settings (§18) */}
      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                SECTION §18
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Certificate Output Configuration
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Governed by Schedule X of the Legal Metrology (General) Rules, 2011 &amp; ISO/IEC 17025.
            </p>
          </div>

          {!canEdit && (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
              <Lock className="w-3 h-3" />
              🔒 Managed by Administrator
            </span>
          )}
        </div>

        {/* Format Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Default Certificate Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(['PDF_A', 'DOCX'] as const).map((fmt) => {
                const isSelected = formData.defaultFormat === fmt;
                return (
                  <button
                    key={fmt}
                    type="button"
                    disabled={!canEdit}
                    onClick={() => setFormData({ ...formData, defaultFormat: fmt })}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-950 dark:text-indigo-100 font-bold ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs">{fmt === 'PDF_A' ? 'PDF/A (Archival)' : 'DOCX (Editable)'}</span>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-indigo-600"></span>}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      {fmt === 'PDF_A' ? 'ISO 19005 compliant statutory record' : 'Word export with table formatting'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Security Features */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Statutory Security Layers
            </label>
            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <QrCode className="w-4 h-4 text-indigo-500" />
                  <div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-white">
                      Verification QR Code
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Encodes SHA-256 certificate digest linking to e-Māap national portal
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  disabled={!canEdit}
                  checked={formData.verificationQrEnabled}
                  onChange={(e) => setFormData({ ...formData, verificationQrEnabled: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <KeyRound className="w-4 h-4 text-emerald-500" />
                  <div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-white">
                      Digital Signature &amp; Seal
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Attaches Director statutory token with cryptographic timestamp
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  disabled={!canEdit}
                  checked={formData.digitalSignatureEnabled}
                  onChange={(e) => setFormData({ ...formData, digitalSignatureEnabled: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Section §19: Certificate Numbering */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                SECTION §19
              </span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Certificate Numbering Sequence
              </h4>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Defines the institutional prefix and sequence logic for verified legal metrology certificates.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Certificate Number Prefix
                </label>
                {!canEdit && (
                  <span className="text-[10px] font-mono text-slate-400">
                    🔒 Managed by Admin
                  </span>
                )}
              </div>
              <input
                type="text"
                disabled={!canEdit}
                value={prefixInput}
                onChange={(e) => setPrefixInput(e.target.value.toUpperCase())}
                placeholder="e.g. CERT, RRSL-BLR"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-60 uppercase"
              />
              <p className="text-[10px] text-slate-400">
                Statutory prefix prepended to the serial tracking string.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between">
              <div className="text-[11px] font-mono uppercase text-slate-500 tracking-wider">
                Next Certificate Identifier
              </div>
              <div className="text-lg font-black font-mono tracking-wider text-indigo-600 dark:text-indigo-400 my-1">
                {prefixInput}-2026-000185
              </div>
              <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Next sequence auto-incremented by cryptographic ledger</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        {canEdit && (
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Save Certificate Configuration
            </button>
          </div>
        )}
      </form>

      {/* Official Certificate Sample Preview Card (§18) */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-sm">
        <div className="space-y-1.5 max-w-md">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-300">
            <Award className="w-4 h-4" />
            <span>Standard Form VI Ready</span>
          </div>
          <h4 className="text-base font-bold text-white">
            Official Verification Certificate Sample
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Preview statutory Form VI layout featuring Green Guilloche anti-counterfeit border, NABL stamp, and live e-Māap QR verification link.
          </p>
        </div>

        <button
          type="button"
          onClick={onPreviewSample}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-slate-900 text-xs font-bold shadow-md hover:bg-slate-100 transition-all cursor-pointer shrink-0"
        >
          <FileText className="w-4 h-4" />
          <span>Preview Certificate</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Confirmation Modal for Prefix Change (§19) */}
      {showPrefixConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <button
                onClick={() => setShowPrefixConfirmModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Modify Certificate Numbering Sequence?
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                This configuration affects future certificate identifiers:
              </p>
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono text-xs font-bold text-center text-slate-800 dark:text-slate-200">
                {config.certificateNumberPrefix} → {prefixInput}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                All previously approved and issued certificates will remain immutable with their original serial identifiers.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setPrefixInput(config.certificateNumberPrefix);
                  setShowPrefixConfirmModal(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPrefixChange}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Confirm Prefix Change
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
