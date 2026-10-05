import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, Sparkles, Check, RefreshCw, AlertCircle, X } from 'lucide-react';
import { ExtractedWorkbookMetadata } from './types';

interface ExcelUploadZoneProps {
  isParsed: boolean;
  metadata: ExtractedWorkbookMetadata | null;
  onRunBenchmarkDemo: () => void;
  onFileUpload: (file: File) => void;
  onReset: () => void;
  isProcessing: boolean;
  processingStep: number;
}

export const ExcelUploadZone: React.FC<ExcelUploadZoneProps> = ({
  isParsed,
  metadata,
  onRunBenchmarkDemo,
  onFileUpload,
  onReset,
  isProcessing,
  processingStep,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcess(e.target.files[0]);
    }
  };

  const validateAndProcess = (file: File) => {
    if (!file.name.endsWith('.xlsx')) {
      setFileError('Please select an Excel workbook (.xlsx).');
      return;
    }
    setFileError(null);
    onFileUpload(file);
  };

  // Stepped animation items matching §5 and §27 of the specification
  const steppedProgress = [
    { label: 'Reading workbook', detail: 'Sheet detected' },
    { label: 'Extracting observations', detail: '31 rows' },
    { label: 'Checking formulas', detail: 'Formula patterns identified' },
    { label: 'Recalculating', detail: 'Digital comparison complete' },
    { label: 'Finding discrepancies', detail: 'Analysis finished' },
  ];

  // Ingesting/Processing Progress State (§5, §27)
  if (isProcessing) {
    return (
      <div className="bg-white border border-brand-200 rounded-3xl p-8 shadow-xs text-center space-y-6 animate-scale-in">
        <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto shadow-xs border border-brand-100">
          <RefreshCw size={26} className="animate-spin text-brand-600" />
        </div>
        <div>
          <h3 className="text-base font-bold text-foundation-900 font-sans tracking-tight">
            Analyzing Workbook...
          </h3>
          <p className="text-xs text-foundation-500 font-mono mt-1">
            Re-calculating legacy formulas against OIML R 76-1 statutory turning-points
          </p>
        </div>

        {/* Pipeline steps */}
        <div className="max-w-md mx-auto space-y-2.5 text-left text-xs font-mono">
          {steppedProgress.map((step, idx) => {
            const isDone = idx < processingStep;
            const isCurrent = idx === processingStep;
            return (
              <div
                key={step.label}
                className={`flex items-center justify-between p-2.5 rounded-xl transition-all ${
                  isDone
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200/80 font-semibold'
                    : isCurrent
                    ? 'bg-brand-50 text-brand-900 border border-brand-200 font-bold shadow-xs'
                    : 'text-foundation-400 bg-foundation-50/50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {isDone ? (
                    <Check size={15} className="text-emerald-600 shrink-0" />
                  ) : isCurrent ? (
                    <span className="w-2 h-2 rounded-full bg-brand-600 animate-ping shrink-0" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-foundation-300 shrink-0" />
                  )}
                  <span>{step.label}</span>
                </div>
                <span className="text-[11px] font-sans text-foundation-500">
                  {isDone ? `✓ ${step.detail}` : isCurrent ? '● Processing...' : '○ Pending'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // WorkBook Ingested State (§6, §25)
  if (isParsed && metadata) {
    return (
      <>
        <div className="bg-white border border-foundation-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase tracking-wider">
                  <Check size={11} /> WORKBOOK INGESTED
                </span>
                <span className="text-xs font-mono text-foundation-500">
                  {metadata.importedDate}
                </span>
              </div>
              <h3 className="text-base font-bold text-foundation-900 font-sans mt-0.5">
                {metadata.fileName}
              </h3>
              <p className="text-xs text-foundation-500 font-mono mt-0.5">
                {metadata.fileSize} • {metadata.totalSheets} sheets • {metadata.totalRows} observations • Sheet: <strong>{metadata.workbookSheet}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onRunBenchmarkDemo}
              className="px-4 py-2 rounded-xl border border-foundation-200 bg-white hover:bg-foundation-50 text-xs font-semibold text-foundation-700 transition-colors shadow-xs flex items-center gap-1.5"
            >
              <RefreshCw size={13} className="text-foundation-500" />
              <span>Re-run Analysis</span>
            </button>

            <button
              type="button"
              onClick={() => setShowReplaceModal(true)}
              className="px-4 py-2 rounded-xl border border-foundation-200 bg-foundation-50 hover:bg-foundation-100 text-xs font-semibold text-foundation-700 transition-colors shadow-xs"
            >
              Replace File
            </button>
          </div>
        </div>

        {/* Replace File Confirmation Modal (§25) */}
        {showReplaceModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-foundation-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-foundation-200 text-center space-y-4 animate-scale-in">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
                <AlertCircle size={24} />
              </div>
              <div>
                <h4 className="text-base font-bold text-foundation-900 font-sans">
                  Replace current workbook?
                </h4>
                <p className="text-xs text-foundation-500 mt-1 font-sans">
                  Current forensic analysis and recalculation findings will be cleared.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReplaceModal(false)}
                  className="px-4 py-2 rounded-xl border border-foundation-200 bg-white hover:bg-foundation-50 text-xs font-semibold text-foundation-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowReplaceModal(false);
                    onReset();
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs"
                >
                  Replace
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Empty Dropzone State (§4)
  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`rounded-3xl border-2 border-dashed p-8 sm:p-12 text-center transition-all ${
        isDragOver
          ? 'border-brand-500 bg-brand-50/50'
          : 'border-foundation-300 bg-white hover:border-foundation-400'
      }`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".xlsx"
        className="hidden"
      />

      <div className="max-w-md mx-auto space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto shadow-xs border border-brand-100">
          <UploadCloud size={28} />
        </div>

        <div>
          <h3 className="text-base font-bold text-foundation-900 font-sans">
            Upload Spreadsheet
          </h3>
          <p className="text-xs text-foundation-500 mt-1 font-sans">
            Drag and drop a legacy .xlsx verification workbook here, or browse your computer.
          </p>
        </div>

        {fileError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-2 text-left">
            <div className="flex items-center gap-2">
              <AlertCircle size={15} className="text-rose-600 shrink-0" />
              <span>{fileError}</span>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-rose-900 font-bold underline shrink-0"
            >
              Choose File
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-5 py-2.5 rounded-xl bg-foundation-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            Browse Files
          </button>

          <span className="text-xs font-mono text-foundation-400">or</span>

          {/* Instant Benchmark Demo (§5) */}
          <button
            type="button"
            onClick={onRunBenchmarkDemo}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Sparkles size={14} className="text-amber-300" />
            <span>Run Instant Benchmark Demo</span>
          </button>
        </div>

        <p className="text-[11px] font-mono text-foundation-400 pt-2">
          Excel workbooks only (.xlsx)
        </p>
      </div>
    </div>
  );
};
