import React, { useState } from 'react';
import {
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  RefreshCw,
  Sparkles,
  ArrowLeft,
  ShieldAlert,
  Info,
  Layers,
  Check,
  Download,
} from 'lucide-react';
import {
  AuditDiscrepancy,
  WeighingRecalcRow,
  EccentricityComparisonRow,
  ExtractedWorkbookMetadata,
} from '../excel/types';
import {
  INITIAL_EXTRACTED_METADATA,
  MOCK_DISCREPANCIES,
  MOCK_WEIGHING_RECALC,
  MOCK_ECCENTRICITY_ROWS,
} from '../excel/mockExcelData';
import { ExcelUploadZone } from '../excel/ExcelUploadZone';
import { DiscrepanciesTab } from '../excel/DiscrepanciesTab';
import { WeighingRecalculationTab } from '../excel/WeighingRecalculationTab';
import { EccentricityComparisonTab } from '../excel/EccentricityComparisonTab';
import { ExtractedMetadataTab } from '../excel/ExtractedMetadataTab';
import { FindingDetailDrawer } from '../excel/FindingDetailDrawer';

interface LegacyExcelAuditorViewProps {
  onBackToDashboard?: () => void;
  onNavigateToTestSession?: (sessionId?: string) => void;
  userRole?: string;
}

export const LegacyExcelAuditorView: React.FC<LegacyExcelAuditorViewProps> = ({
  onBackToDashboard,
  onNavigateToTestSession,
  userRole = 'Legal Metrology Officer',
}) => {
  // Application State
  const [isUploaded, setIsUploaded] = useState<boolean>(true); // Default to ingested benchmark state for seamless evaluation
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [processingStep, setProcessingStep] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<
    'DISCREPANCIES' | 'WEIGHING' | 'ECCENTRICITY' | 'METADATA'
  >('DISCREPANCIES');
  const [selectedDiscrepancy, setSelectedDiscrepancy] = useState<AuditDiscrepancy | null>(null);
  const [showMigrationModal, setShowMigrationModal] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Data
  const metadata: ExtractedWorkbookMetadata = INITIAL_EXTRACTED_METADATA;
  const discrepancies: AuditDiscrepancy[] = MOCK_DISCREPANCIES;
  const weighingRows: WeighingRecalcRow[] = MOCK_WEIGHING_RECALC;
  const eccentricityRows: EccentricityComparisonRow[] = MOCK_ECCENTRICITY_ROWS;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Instant Benchmark Demo Trigger (§5)
  const handleRunDemo = () => {
    setIsAnalyzing(true);
    setProcessingStep(0);
    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      setProcessingStep(step);
      if (step >= 5) {
        clearInterval(interval);
        setIsAnalyzing(false);
        setIsUploaded(true);
        setActiveTab('DISCREPANCIES');
        showToast('Instant Benchmark parsed: 31 observations analyzed against OIML R 76-1');
      }
    }, 240);
  };

  const handleFileUpload = (_file: File) => {
    setIsAnalyzing(true);
    setProcessingStep(0);
    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      setProcessingStep(step);
      if (step >= 5) {
        clearInterval(interval);
        setIsAnalyzing(false);
        setIsUploaded(true);
        showToast('Workbook parsed and recalculated');
      }
    }, 240);
  };

  const handleReplaceFile = () => {
    setIsUploaded(false);
    setSelectedDiscrepancy(null);
    setProcessingStep(0);
  };

  const handleExportAudit = () => {
    showToast('Exporting forensic audit findings report (PDF/A + JSON)...');
  };

  const handleConfirmMigration = () => {
    setShowMigrationModal(false);
    if (onNavigateToTestSession) {
      onNavigateToTestSession('VR-2026-00417');
    } else {
      showToast('Created digital session VR-2026-00417 with audited parameters');
    }
  };

  return (
    <div className="space-y-6 pb-20 relative font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-foundation-900 text-white px-4 py-2.5 rounded-xl shadow-xl border border-foundation-700 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Page Header (§3) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-foundation-200">
        <div className="flex items-center gap-3">
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="p-2 rounded-xl border border-foundation-200 bg-white hover:bg-foundation-100 text-foundation-600 transition-colors shadow-xs cursor-pointer"
              title="Return to Workspace"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-brand-100 text-brand-800 border border-brand-200">
                SCREEN 16
              </span>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-foundation-100 text-foundation-700 border border-foundation-200">
                LEGACY DATA
              </span>
              <h1 className="text-xl font-bold text-foundation-900 tracking-tight">
                Legacy Excel Auditor
              </h1>
            </div>
            <p className="text-xs text-foundation-500 mt-0.5">
              Import historical verification records and compare them against the digital test workflow.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isUploaded && (
            <button
              type="button"
              onClick={handleRunDemo}
              className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 text-white shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles size={13} className="text-amber-300" />
              <span>Run Instant Benchmark Demo</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowHelpModal(true)}
            className="p-2 rounded-xl border border-foundation-200 bg-white hover:bg-foundation-50 text-foundation-600 transition-colors shadow-xs"
            title="Forensic Methodology Help"
          >
            <HelpCircle size={16} />
          </button>
        </div>
      </div>

      {/* 2. Drag & Drop Upload Zone / Ingested Workbook Banner (§4, §6) */}
      <ExcelUploadZone
        isParsed={isUploaded}
        metadata={isUploaded ? metadata : null}
        onRunBenchmarkDemo={handleRunDemo}
        onFileUpload={handleFileUpload}
        onReset={handleReplaceFile}
        isProcessing={isAnalyzing}
        processingStep={processingStep}
      />

      {/* 3. Analysis Summary Cards (§7, §24) */}
      {isUploaded && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Rows Analyzed */}
            <div className="p-4 rounded-2xl bg-white border border-foundation-200 shadow-xs flex flex-col justify-between">
              <span className="text-[10px] font-bold text-foundation-400 uppercase tracking-widest font-mono">
                ROWS ANALYZED
              </span>
              <div className="text-2xl font-black font-mono text-foundation-900 mt-1">
                {metadata.totalRows}
              </div>
              <span className="text-[11px] font-mono text-foundation-500 mt-1">
                3 sheets parsed
              </span>
            </div>

            {/* Discrepancies */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 shadow-xs flex flex-col justify-between">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest font-mono">
                DISCREPANCIES
              </span>
              <div className="text-2xl font-black font-mono text-amber-900 mt-1">
                {metadata.discrepanciesCount}
              </div>
              <span className="text-[11px] font-mono text-amber-700 mt-1">
                Methodology divergences
              </span>
            </div>

            {/* High-Risk Finding */}
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 shadow-xs flex flex-col justify-between">
              <span className="text-[10px] font-bold text-rose-800 uppercase tracking-widest font-mono">
                HIGH RISK
              </span>
              <div className="text-2xl font-black font-mono text-rose-700 mt-1">
                {metadata.highRiskCount}
              </div>
              <span className="text-[11px] font-mono text-rose-600 mt-1">
                False pass requires review
              </span>
            </div>

            {/* Matched Records */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-xs flex flex-col justify-between">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest font-mono">
                MATCHED RECORDS
              </span>
              <div className="text-2xl font-black font-mono text-emerald-700 mt-1">
                {metadata.matchedRows}
              </div>
              <span className="text-[11px] font-mono text-emerald-600 mt-1">
                Identical legal verdicts
              </span>
            </div>
          </div>

          {/* 4. Tab Navigation (§9) */}
          <div className="border-b border-foundation-200">
            <div className="flex gap-2 overflow-x-auto pb-px">
              <button
                type="button"
                onClick={() => setActiveTab('DISCREPANCIES')}
                className={`px-4 py-2.5 text-xs font-mono font-bold rounded-t-xl transition-all border-b-2 cursor-pointer ${
                  activeTab === 'DISCREPANCIES'
                    ? 'border-brand-600 text-brand-600 bg-white shadow-xs'
                    : 'border-transparent text-foundation-500 hover:text-foundation-800 hover:bg-foundation-100'
                }`}
              >
                [ Discrepancies ] ({discrepancies.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('WEIGHING')}
                className={`px-4 py-2.5 text-xs font-mono font-bold rounded-t-xl transition-all border-b-2 cursor-pointer ${
                  activeTab === 'WEIGHING'
                    ? 'border-brand-600 text-brand-600 bg-white shadow-xs'
                    : 'border-transparent text-foundation-500 hover:text-foundation-800 hover:bg-foundation-100'
                }`}
              >
                [ Weighing Recalculation ]
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('ECCENTRICITY')}
                className={`px-4 py-2.5 text-xs font-mono font-bold rounded-t-xl transition-all border-b-2 cursor-pointer ${
                  activeTab === 'ECCENTRICITY'
                    ? 'border-brand-600 text-brand-600 bg-white shadow-xs'
                    : 'border-transparent text-foundation-500 hover:text-foundation-800 hover:bg-foundation-100'
                }`}
              >
                [ Eccentricity Comparison ]
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('METADATA')}
                className={`px-4 py-2.5 text-xs font-mono font-bold rounded-t-xl transition-all border-b-2 cursor-pointer ${
                  activeTab === 'METADATA'
                    ? 'border-brand-600 text-brand-600 bg-white shadow-xs'
                    : 'border-transparent text-foundation-500 hover:text-foundation-800 hover:bg-foundation-100'
                }`}
              >
                [ Extracted Metadata ]
              </button>
            </div>
          </div>

          {/* 5. Active Tab Panel */}
          <div>
            {activeTab === 'DISCREPANCIES' && (
              <DiscrepanciesTab
                discrepancies={discrepancies}
                onSelectDiscrepancy={(item) => setSelectedDiscrepancy(item)}
                onExportAuditReport={handleExportAudit}
                onViewCalculationProof={() => setActiveTab('WEIGHING')}
              />
            )}

            {activeTab === 'WEIGHING' && (
              <WeighingRecalculationTab rows={weighingRows} />
            )}

            {activeTab === 'ECCENTRICITY' && (
              <EccentricityComparisonTab rows={eccentricityRows} />
            )}

            {activeTab === 'METADATA' && (
              <ExtractedMetadataTab
                metadata={metadata}
                onStartMigration={() => setShowMigrationModal(true)}
              />
            )}
          </div>

          {/* 6. Migration Action Bar (§22, §23) */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white border border-foundation-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <Check size={11} /> WORKBOOK ANALYSIS COMPLETE
                </span>
                <span className="font-mono text-xs font-semibold text-foundation-600">
                  27 records match • 3 discrepancies require review
                </span>
              </div>
              <p className="text-xs text-amber-700 font-sans mt-1">
                ⚠ 3 records require review before migration. Questionable legacy results will not be imported blindly.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handleExportAudit}
                className="px-4 py-2.5 rounded-xl border border-foundation-200 bg-white hover:bg-foundation-50 text-xs font-semibold text-foundation-700 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Download size={14} className="text-foundation-500" />
                <span>Export Audit Report</span>
              </button>

              <button
                type="button"
                onClick={() => setShowMigrationModal(true)}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <span>Create Digital Session →</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Slide-over Finding Detail Drawer (§13) */}
      <FindingDetailDrawer
        isOpen={Boolean(selectedDiscrepancy)}
        discrepancy={selectedDiscrepancy}
        onClose={() => setSelectedDiscrepancy(null)}
        onViewRecalculation={() => {
          setSelectedDiscrepancy(null);
          setActiveTab('WEIGHING');
        }}
      />

      {/* 8. Migration Confirmation Modal (§22, §23) */}
      {showMigrationModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-foundation-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-foundation-200 space-y-4 animate-scale-in">
            <div className="flex items-center gap-2.5 pb-3 border-b border-foundation-100">
              <div className="w-9 h-9 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-xs">
                <Layers size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foundation-900 font-sans">
                  Create Digital Verification Session
                </h3>
                <p className="text-[11px] font-mono text-foundation-500">
                  Migrate Verified Metadata to METROLOGIX-76
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs font-sans text-foundation-700">
              <p>
                Instrument specifications (<strong>{metadata.manufacturer} {metadata.model}</strong>, <strong>{metadata.serialNumber}</strong>) will be seeded into a new digital verification session.
              </p>
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] space-y-1">
                <span className="font-bold block">Integrity Safeguard Enforced:</span>
                <span>
                  The 3 legacy spreadsheet formula errors (including False Pass in Row 17) will be discarded. Test observations will be re-evaluated under OIML R 76-1 turning points.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-foundation-100">
              <button
                type="button"
                onClick={() => setShowMigrationModal(false)}
                className="px-4 py-2 rounded-xl border border-foundation-200 bg-white hover:bg-foundation-50 text-xs font-semibold text-foundation-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmMigration}
                className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                <span>Confirm &amp; Launch Session</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-foundation-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-foundation-200 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-foundation-100">
              <div className="flex items-center gap-2">
                <HelpCircle size={18} className="text-brand-600" />
                <h3 className="text-sm font-bold text-foundation-900 font-sans">
                  Forensic Excel Auditor Architecture
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="text-xs font-mono text-foundation-400 hover:text-foundation-700"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-foundation-600 font-sans">
              <div>
                <h4 className="font-bold text-foundation-900 font-sans">
                  1. The Forensic Premise
                </h4>
                <p>
                  Historical Excel verification workbooks frequently contain hardcoded tolerance corridors, truncated roundings, or omission of turning-point fractional weights, which accidentally certify non-compliant equipment.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-foundation-900 font-sans">
                  2. OIML Turning-Point Recalculation
                </h4>
                <p>
                  METROLOGIX-76 recalculates every observation via <code className="font-mono text-brand-700">P = I + 0.5e - ΔL</code> to determine true unrounded continuous error and compare it against statutory Table 6 MPE limits.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-foundation-900 font-sans">
                  3. Controlled Migration
                </h4>
                <p>
                  Valid metadata is preserved for instrument intake, while flawed spreadsheet formulas are discarded to prevent carrying forward non-compliant legacy calculations.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-foundation-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 rounded-xl bg-foundation-900 text-white text-xs font-bold"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
