import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, X, KeyRound, Check, Copy, HelpCircle, AlertCircle } from 'lucide-react';
import { ReviewSessionCase, CertificateInfo } from './types';

interface DirectorSignModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: ReviewSessionCase;
  onSignSuccess: (certInfo: CertificateInfo) => void;
}

export const DirectorSignModal: React.FC<DirectorSignModalProps> = ({
  isOpen,
  onClose,
  caseItem,
  onSignSuccess,
}) => {
  const [pinDigits, setPinDigits] = useState<string[]>(['', '', '', '']);
  const [declarationChecked, setDeclarationChecked] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [signingStep, setSigningStep] = useState('');

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Document SHA-256 digest
  const documentDigest = '8d72f1c3a9689e47b01dc1f0e27ba61e9b6238f9024cf4f87ab2e105e19db621';

  useEffect(() => {
    if (isOpen) {
      setPinDigits(['', '', '', '']);
      setDeclarationChecked(false);
      setPinError(false);
      setIsSigning(false);
      setTimeout(() => inputRefs[0].current?.focus(), 150);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDigitChange = (index: number, val: string) => {
    const cleanVal = val.replace(/\D/g, '').slice(-1);
    const newDigits = [...pinDigits];
    newDigits[index] = cleanVal;
    setPinDigits(newDigits);
    setPinError(false);

    if (cleanVal && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pinDigits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleLoadDemoPin = () => {
    setPinDigits(['7', '6', '2', '0']);
    setPinError(false);
    inputRefs[3].current?.focus();
  };

  const handleCopyDigest = () => {
    navigator.clipboard.writeText(documentDigest);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleAuthenticateAndSign = () => {
    const fullPin = pinDigits.join('');
    if (fullPin !== '7620') {
      setPinError(true);
      return;
    }

    if (!declarationChecked) {
      return;
    }

    setIsSigning(true);
    setSigningStep('Verifying Director Credentials...');

    setTimeout(() => {
      setSigningStep('Generating SHA-256 Record Digest...');
    }, 600);

    setTimeout(() => {
      setSigningStep('Applying Green Guilloche Statutory Seal...');
    }, 1200);

    setTimeout(() => {
      const certInfo: CertificateInfo = {
        id: `CERT-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        signedBy: 'Dr. S. Sharma',
        signedRole: 'Laboratory Director, Central LM Laboratory',
        signTimestamp: '04 Oct 2026 • 16:02 IST',
        sha256Digest: documentDigest,
        verificationUrl: `https://metrologix.gov.in/verify/CERT-2026-00172`,
        qrPayload: `METROLOGIX-76|CERT-2026-00172|${caseItem.manufacturer}|${caseItem.serialNumber}|PASS|2026-10-04T16:02:00IST`,
        directorPinUsed: '7620',
      };
      setIsSigning(false);
      onSignSuccess(certInfo);
      onClose();
    }, 1900);
  };

  const isPinComplete = pinDigits.every((d) => d !== '');
  const canSubmit = isPinComplete && declarationChecked && !isSigning;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foundation-900/60 backdrop-blur-xs transition-opacity"
        onClick={!isSigning ? onClose : undefined}
      />

      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-foundation-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-foundation-200 bg-[#0F172A] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center ring-1 ring-emerald-500/30">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight font-sans">
                Final Statutory Authorization
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Digitally sign & certify {caseItem.sessionNumber}
              </p>
            </div>
          </div>
          {!isSigning && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <div className="p-6 space-y-5">
          {/* Target Instrument banner */}
          <div className="p-3 rounded-xl bg-foundation-50 border border-foundation-200 flex items-center justify-between text-xs">
            <div>
              <div className="font-bold text-foundation-900">
                {caseItem.manufacturer} {caseItem.model}
              </div>
              <div className="text-[11px] font-mono text-foundation-500">
                Serial {caseItem.serialNumber} · {caseItem.accuracyClass} · Max {caseItem.maxCapacity}
              </div>
            </div>
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
              ✓ VERIFIED PASS
            </span>
          </div>

          {/* 4-digit PIN section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-foundation-800 uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound size={13} className="text-brand-600" />
                <span>Director 4-Digit Security PIN</span>
              </label>

              <button
                type="button"
                onClick={handleLoadDemoPin}
                className="text-[11px] font-mono font-semibold text-brand-600 hover:text-brand-800 hover:underline cursor-pointer"
              >
                Load Demo PIN · 7620
              </button>
            </div>

            <div className={`flex justify-center gap-3 py-2 ${pinError ? 'animate-shake' : ''}`}>
              {pinDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={inputRefs[index]}
                  type="password"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={isSigning}
                  className={`w-12 h-14 text-center text-xl font-mono font-bold rounded-xl border-2 transition-all focus:outline-none ${
                    pinError
                      ? 'border-rose-400 bg-rose-50 text-rose-800'
                      : digit
                      ? 'border-emerald-500 bg-emerald-50/40 text-foundation-900'
                      : 'border-foundation-200 bg-white text-foundation-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20'
                  }`}
                />
              ))}
            </div>

            {pinError && (
              <p className="text-center text-xs font-medium text-rose-600 mt-1 flex items-center justify-center gap-1">
                <AlertCircle size={13} />
                <span>PIN INVALID. Please enter the 4-digit Director PIN (Demo: 7620).</span>
              </p>
            )}
          </div>

          {/* Statutory Declaration Checkbox */}
          <label className="flex items-start gap-3 p-3.5 rounded-xl border border-foundation-200 bg-foundation-50/50 hover:bg-foundation-100/50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={declarationChecked}
              onChange={(e) => setDeclarationChecked(e.target.checked)}
              disabled={isSigning}
              className="mt-0.5 w-4 h-4 rounded text-brand-600 border-foundation-300 focus:ring-brand-500"
            />
            <span className="text-xs text-foundation-800 leading-relaxed font-sans">
              <strong>Statutory Declaration:</strong> I confirm that I have reviewed the complete verification record, confirmed standard traceability, and hereby authorize this statutory certificate under the Legal Metrology Act and OIML R 76-1.
            </span>
          </label>

          {/* SHA-256 Digest Preview */}
          <div className="p-3.5 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono border border-slate-800">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <span>Document SHA-256 Digest</span>
                <span title="Cryptographic SHA-256 representation of the signed verification record.">
                  <HelpCircle size={11} className="text-slate-500" />
                </span>
              </span>
              <button
                type="button"
                onClick={handleCopyDigest}
                className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
              >
                {isCopied ? <Check size={11} /> : <Copy size={11} />}
                <span>{isCopied ? 'Copied' : 'Copy digest'}</span>
              </button>
            </div>
            <div className="break-all text-[11px] text-emerald-400 select-all leading-snug">
              {documentDigest}
            </div>
          </div>

          {/* Loading / Signing overlay or status */}
          {isSigning && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-center gap-2 animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping" />
              <span className="font-bold">{signingStep}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-2 border-t border-foundation-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSigning}
              className="px-4 py-2.5 rounded-xl border border-foundation-200 text-xs font-semibold text-foundation-700 hover:bg-foundation-100 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAuthenticateAndSign}
              disabled={!canSubmit}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2"
            >
              <ShieldCheck size={16} />
              <span>Authenticate & Sign Certificate</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
