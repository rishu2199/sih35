import React, { useState } from 'react';
import { UploadCloud, Check, FileText, Camera, Sparkles, RefreshCw, Eye } from 'lucide-react';

export interface OcrExtractedData {
  manufacturer: string;
  model: string;
  serialNumber: string;
  approvalNumber: string;
  accuracyClass: 'CLASS_I' | 'CLASS_II' | 'CLASS_III' | 'CLASS_IIII';
  maxCapacity: number;
  minCapacity: number;
  verificationInterval: number;
  scaleInterval: number;
  confidence: number;
  fileName: string;
}

interface NameplateScannerProps {
  onApplyOcr: (data: OcrExtractedData) => void;
  isReadOnly?: boolean;
}

export const NameplateScanner: React.FC<NameplateScannerProps> = ({
  onApplyOcr,
  isReadOnly = false,
}) => {
  const [hasUploaded, setHasUploaded] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [applied, setApplied] = useState<boolean>(false);

  // Canonical OCR data (§6)
  const ocrData: OcrExtractedData = {
    manufacturer: 'Avery Weigh-Tronix',
    model: 'ZM201',
    serialNumber: 'AV-2026-8812',
    approvalNumber: 'TAC-2026-III-0142',
    accuracyClass: 'CLASS_III',
    maxCapacity: 30.0,
    minCapacity: 0.1,
    verificationInterval: 0.005,
    scaleInterval: 0.005,
    confidence: 94.2,
    fileName: 'Nameplate_Avery_ZM201.jpg',
  };

  const handleSimulateUpload = () => {
    if (isReadOnly) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setHasUploaded(true);
      setApplied(false);
    }, 600);
  };

  const handleApply = () => {
    onApplyOcr(ocrData);
    setApplied(true);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
      <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-blue-600 dark:text-blue-400">
            01 NAMEPLATE SCANNER
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Optical character recognition from instrument rating plate.
          </p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800">
          Vision OCR
        </span>
      </div>

      {!hasUploaded ? (
        /* Initial Upload State (§5) */
        <div
          onClick={handleSimulateUpload}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 rounded-2xl p-8 text-center bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
            {isProcessing ? (
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            ) : (
              <UploadCloud className="w-6 h-6" />
            )}
          </div>
          <div className="text-xs font-bold text-slate-900 dark:text-white">
            {isProcessing ? 'Analyzing nameplate image...' : 'Drag nameplate photo here or click to browse'}
          </div>
          <p className="text-[11px] text-slate-400 font-mono mt-1">
            Supported: JPG, PNG · Max 15MB
          </p>
        </div>
      ) : (
        /* OCR Result State (§6 & §7) */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700 overflow-hidden relative shrink-0 flex items-center justify-center">
                <Camera className="w-6 h-6 text-slate-400" />
              </div>
              <div>
                <div className="text-xs font-mono font-bold text-slate-900 dark:text-white truncate max-w-[180px]">
                  {ocrData.fileName}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Optical scan completed
                </div>
              </div>
            </div>

            {/* Confidence Badge (§7) */}
            <div className="text-right">
              <div className="text-xs font-mono font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 sm:justify-end">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>94.2%</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">
                High confidence
              </span>
            </div>
          </div>

          {/* OCR Extracted Parameters */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Manufacturer</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{ocrData.manufacturer}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Model</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{ocrData.model}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Serial</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{ocrData.serialNumber}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Max Capacity</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{ocrData.maxCapacity} kg</span>
            </div>
          </div>

          {/* Apply Button (§6) */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              disabled={isReadOnly}
              onClick={handleSimulateUpload}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Rescan image</span>
            </button>

            <button
              type="button"
              disabled={isReadOnly || applied}
              onClick={handleApply}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                applied
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
              }`}
            >
              {applied ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>OCR Data Applied</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                  <span>Apply OCR Data</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
