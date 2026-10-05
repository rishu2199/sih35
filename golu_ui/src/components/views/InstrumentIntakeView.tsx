import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  X,
  FileCheck2,
  Lock,
} from 'lucide-react';
import { PresetStrip, CANONICAL_INTAKE_PRESETS } from '../intake/PresetStrip';
import { NameplateScanner, OcrExtractedData } from '../intake/NameplateScanner';
import { IdentificationCard } from '../intake/IdentificationCard';
import { MetrologicalValidationHUD } from '../intake/MetrologicalValidationHUD';
import { EvidenceDossier } from '../intake/EvidenceDossier';
import { AccuracyClass, InstrumentPreset } from '../../types';
import { useToast } from '../layout/ToastViewport';

interface InstrumentIntakeViewProps {
  onBackToHome: () => void;
  onRegisterSuccess: (instrumentData: any) => void;
  userRole?: string;
}

export const InstrumentIntakeView: React.FC<InstrumentIntakeViewProps> = ({
  onBackToHome,
  onRegisterSuccess,
  userRole = 'Metrologist',
}) => {
  const { showToast } = useToast();
  const isReadOnly =
    userRole.toLowerCase().includes('review') ||
    userRole.toLowerCase().includes('director') ||
    userRole.toLowerCase().includes('audit');

  // Selected Preset ID (Initial state §28: Avery ZM201 Retail)
  const [selectedPresetId, setSelectedPresetId] = useState<string>('preset-avery');

  // Form Fields (§28 Dummy Data)
  const [manufacturer, setManufacturer] = useState('Avery Weigh-Tronix');
  const [model, setModel] = useState('ZM201 Retail Platform');
  const [serialNumber, setSerialNumber] = useState('AV-2026-8812');
  const [approvalNumber, setApprovalNumber] = useState('TAC-2026-III-0142');

  const [accuracyClass, setAccuracyClass] = useState<AccuracyClass>('CLASS_III');
  const [maxCapacity, setMaxCapacity] = useState<number>(30.0);
  const [minCapacity, setMinCapacity] = useState<number>(0.1);
  const [verificationInterval, setVerificationInterval] = useState<number>(0.005);
  const [scaleInterval, setScaleInterval] = useState<number>(0.005);
  const [unit, setUnit] = useState<string>('kg');

  // Evidence Dossier (5 statutory categories, initialized with 5 for demonstration)
  const [evidence, setEvidence] = useState<Record<string, boolean>>({
    nameplate: true,
    frontView: true,
    sealingPoint: true,
    levelBubble: true,
    specDocument: true,
  });

  // Draft state (§25)
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);

  // Registration modal & state (§22 & §23)
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [showValidationIssues, setShowValidationIssues] = useState<boolean>(false);

  // Preset Selection Handler (§4)
  const handleSelectPreset = (preset: InstrumentPreset) => {
    setSelectedPresetId(preset.id);
    setManufacturer(preset.brand);
    setModel(preset.model);
    setAccuracyClass(preset.accuracyClass);

    if (preset.id === 'preset-mettler') {
      setUnit('g');
      setMaxCapacity(120);
      setMinCapacity(0.01);
      setVerificationInterval(0.001);
      setScaleInterval(0.001);
      setSerialNumber('MT-2026-1042');
      setApprovalNumber('TAC-2026-I-0049');
    } else if (preset.id === 'preset-sansui') {
      setUnit('g');
      setMaxCapacity(6000);
      setMinCapacity(5.0);
      setVerificationInterval(0.1);
      setScaleInterval(0.1);
      setSerialNumber('SN-2026-7721');
      setApprovalNumber('TAC-2025-II-0812');
    } else if (preset.id === 'preset-essae') {
      setUnit('kg');
      setMaxCapacity(150);
      setMinCapacity(1.0);
      setVerificationInterval(0.05);
      setScaleInterval(0.05);
      setSerialNumber('ES-2026-4418');
      setApprovalNumber('TAC-2023-IIII-1105');
    } else {
      setUnit('kg');
      setMaxCapacity(30.0);
      setMinCapacity(0.1);
      setVerificationInterval(0.005);
      setScaleInterval(0.005);
      setSerialNumber('AV-2026-8812');
      setApprovalNumber('TAC-2026-III-0142');
    }

    showToast(
      `${preset.classLabel} loaded`,
      `Instrument identity, specifications and evidence pre-populated.`,
      'info'
    );
  };

  // OCR Apply Handler (§6)
  const handleApplyOcr = (ocrData: OcrExtractedData) => {
    setManufacturer(ocrData.manufacturer);
    setModel(ocrData.model);
    setSerialNumber(ocrData.serialNumber);
    setApprovalNumber(ocrData.approvalNumber);
    setAccuracyClass(ocrData.accuracyClass);
    setMaxCapacity(ocrData.maxCapacity);
    setMinCapacity(ocrData.minCapacity);
    setVerificationInterval(ocrData.verificationInterval);
    setScaleInterval(ocrData.scaleInterval);

    showToast(
      'OCR Data Applied',
      'Nameplate data successfully loaded into form cards.',
      'success'
    );
  };

  const handleFieldChange = (field: string, val: any) => {
    if (field === 'manufacturer') setManufacturer(val);
    if (field === 'model') setModel(val);
    if (field === 'serialNumber') setSerialNumber(val);
    if (field === 'approvalNumber') setApprovalNumber(val);
    if (field === 'maxCapacity') setMaxCapacity(val);
    if (field === 'minCapacity') setMinCapacity(val);
    if (field === 'verificationInterval') setVerificationInterval(val);
    if (field === 'scaleInterval') setScaleInterval(val);
    if (field === 'unit') setUnit(val);
  };

  const handleToggleEvidence = (key: string) => {
    setEvidence((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Save Draft (§25)
  const handleSaveDraft = () => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setDraftSavedAt(timeStr);
    showToast(
      'Draft saved',
      `Intake data saved at ${timeStr}. You can safely return later.`,
      'success'
    );
  };

  // Live metrological validation calculations (§15 & §16)
  const isMaxGreaterThanMin = maxCapacity > minCapacity;
  const isScaleIntervalValid = scaleInterval <= verificationInterval && scaleInterval > 0;
  const n = verificationInterval > 0 ? Math.round(maxCapacity / verificationInterval) : 0;

  let nMin = 100;
  let nMax = 10000;
  let minIntervalValid = true;

  if (accuracyClass === 'CLASS_I') {
    nMin = 50000;
    nMax = 1000000;
    minIntervalValid = verificationInterval >= 0.000001;
  } else if (accuracyClass === 'CLASS_II') {
    nMin = 100;
    nMax = 100000;
    minIntervalValid = verificationInterval >= 0.000001;
  } else if (accuracyClass === 'CLASS_III') {
    nMin = 100;
    nMax = 10000;
    minIntervalValid = verificationInterval >= 0.0001;
  } else if (accuracyClass === 'CLASS_IIII') {
    nMin = 100;
    nMax = 1000;
    minIntervalValid = verificationInterval >= 0.005;
  }

  const isNValid = n >= nMin && n <= nMax;
  const isSpecificationValid =
    isMaxGreaterThanMin && isScaleIntervalValid && isNValid && minIntervalValid;

  const completedEvidenceCount = Object.values(evidence).filter(Boolean).length;
  const isIdentityComplete =
    manufacturer.trim().length >= 2 &&
    model.trim().length >= 2 &&
    serialNumber.trim().length >= 3;
  const isEvidenceComplete = completedEvidenceCount >= 4;

  const isReadyToRegister = isIdentityComplete && isSpecificationValid && isEvidenceComplete;

  // Validation issues list for §24 error state
  const validationIssues: string[] = [];
  if (!isIdentityComplete) validationIssues.push('Instrument manufacturer, model or serial is incomplete');
  if (!isMaxGreaterThanMin) validationIssues.push('Maximum capacity must be strictly greater than Minimum capacity');
  if (!isNValid) validationIssues.push(`Scale intervals (n=${n}) out of Table 3 limits (${nMin}–${nMax})`);
  if (!isScaleIntervalValid) validationIssues.push('Scale interval (d) must not exceed verification interval (e)');
  if (!minIntervalValid) validationIssues.push('Verification interval (e) is below allowable statutory threshold');
  if (completedEvidenceCount < 4) validationIssues.push(`${5 - completedEvidenceCount} statutory evidence photos missing`);

  const handleRegisterConfirmed = () => {
    setShowConfirmModal(false);
    setIsRegistering(true);

    setTimeout(() => {
      setIsRegistering(false);
      const generatedSessionId = `SES-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      showToast(
        '✓ Instrument registered',
        `Session ${generatedSessionId} created. Proceeding to verification workspace.`,
        'success'
      );

      onRegisterSuccess({
        sessionId: generatedSessionId,
        manufacturer,
        model,
        serialNumber,
        approvalNumber,
        accuracyClass,
        maxCapacity: `${maxCapacity} ${unit}`,
        verificationInterval: `e = ${verificationInterval} ${unit}`,
        scaleInterval: `d = ${scaleInterval} ${unit}`,
        unit,
        evidenceCount: completedEvidenceCount,
      });
    }, 600);
  };

  return (
    <div className="space-y-6 pb-28 animate-in fade-in duration-200 font-sans">
      {/* 1. Page Header (§3) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-[11px] font-mono font-bold tracking-wider uppercase mb-1">
            <button
              onClick={onBackToHome}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Instruments</span>
            </button>
            <span className="text-slate-300 dark:text-slate-600">/</span>
            <span className="text-blue-600 dark:text-blue-400">New Registration</span>
          </div>

          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Register New Instrument
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-xl">
            Capture the instrument identity, specifications and supporting evidence before starting verification.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
          {draftSavedAt && (
            <span className="text-xs font-mono text-slate-400">
              Draft saved {draftSavedAt}
            </span>
          )}
          <button
            type="button"
            onClick={handleSaveDraft}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer shadow-xs"
          >
            Save Draft
          </button>
        </div>
      </div>

      {/* Role Read-Only Banner (§26) */}
      {isReadOnly && (
        <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300">
          <Lock className="w-4 h-4 text-slate-500" />
          <span>
            <strong>Read-Only Mode:</strong> As a {userRole}, you are reviewing instrument intake parameters in audit mode. Field editing is restricted to Metrologists.
          </span>
        </div>
      )}

      {/* 2. Quick Start Preset Banner (§4) */}
      <PresetStrip
        selectedPresetId={selectedPresetId}
        onSelectPreset={handleSelectPreset}
      />

      {/* 3. Validation Issues Banner (§24) */}
      {showValidationIssues && validationIssues.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 space-y-2 text-xs animate-in fade-in">
          <div className="font-bold text-rose-900 dark:text-rose-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Cannot register instrument yet ({validationIssues.length} items need attention):</span>
          </div>
          <ul className="list-disc list-inside text-rose-800 dark:text-rose-300 space-y-1 font-mono text-[11px]">
            {validationIssues.map((issue, idx) => (
              <li key={idx}>{issue}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 4. Modular Four-Card Workstation (§2, §5-§20) */}
      <div className="space-y-6">
        {/* Row 1: Card 01 (Nameplate Scanner) & Card 02 (Identification) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <NameplateScanner
            onApplyOcr={handleApplyOcr}
            isReadOnly={isReadOnly}
          />
          <IdentificationCard
            manufacturer={manufacturer}
            model={model}
            serialNumber={serialNumber}
            approvalNumber={approvalNumber}
            onFieldChange={handleFieldChange}
            isReadOnly={isReadOnly}
          />
        </div>

        {/* Row 2: Card 03 (Metrological Specifications & Table 3 HUD) */}
        <MetrologicalValidationHUD
          accuracyClass={accuracyClass}
          onClassChange={setAccuracyClass}
          maxCapacity={maxCapacity}
          minCapacity={minCapacity}
          verificationInterval={verificationInterval}
          scaleInterval={scaleInterval}
          unit={unit}
          onFieldChange={handleFieldChange}
          isReadOnly={isReadOnly}
        />

        {/* Row 3: Card 04 (Statutory Photo Dossier) */}
        <EvidenceDossier
          evidence={evidence}
          onToggleEvidence={handleToggleEvidence}
          isReadOnly={isReadOnly}
        />
      </div>

      {/* 5. Sticky Bottom Action Bar (§21) */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-6 py-4 shadow-xl">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          {/* Status summary */}
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
              {isIdentityComplete && isSpecificationValid && isEvidenceComplete ? '4/4' : '3/4'} information sections complete
            </span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <div className="flex items-center gap-1.5 font-bold">
              <span className="text-slate-500">Specification:</span>
              <span
                className={`font-mono ${
                  isSpecificationValid
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600'
                }`}
              >
                {isSpecificationValid ? '✓ VALID' : '✕ INVALID'}
              </span>
            </div>
            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">·</span>
            <span className="text-slate-400 font-mono hidden sm:inline">
              Evidence: {completedEvidenceCount}/5
            </span>
          </div>

          {/* Action buttons (§35, §36) */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold transition-colors cursor-pointer"
            >
              Save Draft
            </button>

            <button
              type="button"
              disabled={isReadOnly || isRegistering || !isReadyToRegister}
              onClick={() => {
                if (isReadyToRegister) {
                  setShowConfirmModal(true);
                } else {
                  setShowValidationIssues(true);
                }
              }}
              className={`px-6 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                isReadyToRegister && !isReadOnly
                  ? 'bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-sm shadow-blue-600/30'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 border border-slate-300 dark:border-slate-700 cursor-not-allowed'
              }`}
            >
              <span>
                {isReadyToRegister
                  ? 'Register & Create Session →'
                  : `${validationIssues.length} required ${
                      validationIssues.length === 1 ? 'item' : 'items'
                    } remaining`}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 6. Registration Confirmation Modal (§38) */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight font-mono uppercase">
                CREATING VERIFICATION SESSION...
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Statutory registration will initialize an OIML R 76-1 verification dossier.
              </p>
            </div>

            {/* Instrument summary (§38) */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Instrument</span>
                <span className="font-bold text-slate-900 dark:text-white">{manufacturer} {model}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Serial Number</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{serialNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Verification Stage</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">Initial Type Approval</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Standard Set</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">F1-2026-018 ✓ Valid</span>
              </div>
            </div>

            {/* Actions (§38) */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRegisterConfirmed}
                className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-600/30 transition-all cursor-pointer"
              >
                Create Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
