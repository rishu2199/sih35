import React from 'react';
import { Database, FileSpreadsheet, CheckCircle2, AlertTriangle, ShieldCheck, Check, Copy } from 'lucide-react';
import { ExtractedWorkbookMetadata } from './types';

interface ExtractedMetadataTabProps {
  metadata: ExtractedWorkbookMetadata;
  onStartMigration?: () => void;
  onCopyJson?: () => void;
}

export const ExtractedMetadataTab: React.FC<ExtractedMetadataTabProps> = ({
  metadata,
  onStartMigration,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(metadata, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Extraction Confidence Banner (§21) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-foundation-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold border border-emerald-200 shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                ✓ {metadata.confidentFieldsCount} fields confidently extracted
              </span>
              <span className="font-mono text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                ⚠ {metadata.reviewFieldsCount} fields require confirmation
              </span>
            </div>
            <p className="text-xs text-foundation-500 font-sans mt-1">
              Instrument nameplate and metrological parameters parsed automatically from workbook cells.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="px-3.5 py-2 rounded-xl border border-foundation-200 bg-foundation-50 hover:bg-foundation-100 text-xs font-mono font-bold text-foundation-700 transition-colors flex items-center gap-1.5 self-start sm:self-auto shrink-0 cursor-pointer"
        >
          {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
          <span>{copied ? 'Copied JSON' : 'Export Schema JSON'}</span>
        </button>
      </div>

      {/* 2. Structured Metadata Grids (§20) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Instrument & Metrological */}
        <div className="space-y-6">
          {/* Instrument Section */}
          <div className="bg-white rounded-3xl border border-foundation-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-foundation-100">
              <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center font-bold">
                <Database size={15} />
              </div>
              <h3 className="text-xs font-bold text-foundation-900 uppercase tracking-widest font-mono">
                INSTRUMENT
              </h3>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between py-1.5 border-b border-foundation-100">
                <span className="text-foundation-500 font-sans">Manufacturer</span>
                <span className="font-bold text-foundation-900">{metadata.manufacturer}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-foundation-100">
                <span className="text-foundation-500 font-sans">Model</span>
                <span className="font-bold text-foundation-900">{metadata.model}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-foundation-500 font-sans">Serial Number</span>
                <span className="font-bold text-brand-700">{metadata.serialNumber}</span>
              </div>
            </div>
          </div>

          {/* Metrological Section */}
          <div className="bg-white rounded-3xl border border-foundation-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-foundation-100">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                <ShieldCheck size={15} />
              </div>
              <h3 className="text-xs font-bold text-foundation-900 uppercase tracking-widest font-mono">
                METROLOGICAL
              </h3>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between py-1.5 border-b border-foundation-100">
                <span className="text-foundation-500 font-sans">Accuracy Class</span>
                <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  {metadata.accuracyClass}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-foundation-100">
                <span className="text-foundation-500 font-sans">Max Capacity</span>
                <span className="font-bold text-foundation-900">{metadata.maxCapacity}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-foundation-100">
                <span className="text-foundation-500 font-sans">Min Capacity</span>
                <span className="font-bold text-foundation-900">{metadata.minCapacity}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-foundation-500 font-sans">Verification e</span>
                <span className="font-bold text-foundation-900">{metadata.interval}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Verification & Source */}
        <div className="space-y-6">
          {/* Verification Section */}
          <div className="bg-white rounded-3xl border border-foundation-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-foundation-100">
              <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                <FileSpreadsheet size={15} />
              </div>
              <h3 className="text-xs font-bold text-foundation-900 uppercase tracking-widest font-mono">
                VERIFICATION
              </h3>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between py-1.5 border-b border-foundation-100">
                <span className="text-foundation-500 font-sans">Stage</span>
                <span className="font-bold text-foundation-900">{metadata.verificationStage}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-foundation-100">
                <span className="text-foundation-500 font-sans">Operator</span>
                <span className="font-bold text-foundation-900">{metadata.operator}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-foundation-100">
                <span className="text-foundation-500 font-sans">Date</span>
                <span className="font-bold text-foundation-900">{metadata.reportDate}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-foundation-500 font-sans">Laboratory</span>
                <span className="font-bold text-foundation-900">{metadata.laboratory}</span>
              </div>
            </div>
          </div>

          {/* Source Section */}
          <div className="bg-white rounded-3xl border border-foundation-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-foundation-100">
              <div className="w-7 h-7 rounded-lg bg-foundation-100 text-foundation-700 flex items-center justify-center font-bold">
                <FileSpreadsheet size={15} />
              </div>
              <h3 className="text-xs font-bold text-foundation-900 uppercase tracking-widest font-mono">
                SOURCE
              </h3>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between py-1.5 border-b border-foundation-100">
                <span className="text-foundation-500 font-sans">Workbook</span>
                <span className="font-bold text-foundation-900">{metadata.fileName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-foundation-100">
                <span className="text-foundation-500 font-sans">Sheet</span>
                <span className="font-bold text-brand-700">{metadata.workbookSheet}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-foundation-500 font-sans">Total Observations</span>
                <span className="font-bold text-foundation-900">{metadata.totalRows} rows parsed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Detailed Cell Provenance Table (§21) */}
      <div className="bg-white border border-foundation-200 rounded-3xl overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-foundation-100 flex items-center justify-between">
          <h4 className="text-xs font-bold text-foundation-900 uppercase tracking-wider font-mono">
            Cell Provenance & Extraction Confidence
          </h4>
          <span className="font-mono text-xs text-foundation-500">
            {metadata.fieldConfidences.length} Mapped Keys
          </span>
        </div>

        <table className="w-full border-collapse text-left text-xs font-sans">
          <thead>
            <tr className="bg-foundation-50/80 border-b border-foundation-100 font-mono text-[11px] text-foundation-500 uppercase tracking-wider">
              <th className="py-3 px-4">Field</th>
              <th className="py-3 px-4">Extracted Value</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Cell Provenance Note</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-foundation-100 font-mono">
            {metadata.fieldConfidences.map((fc) => (
              <tr key={fc.field} className="hover:bg-foundation-50/60 transition-colors">
                <td className="py-3 px-4 font-bold text-foundation-900 font-sans">
                  {fc.field}
                </td>
                <td className="py-3 px-4 font-semibold text-foundation-800">
                  {fc.value}
                </td>
                <td className="py-3 px-4">
                  {fc.status === 'CONFIDENT' ? (
                    <span className="inline-flex items-center gap-1 font-bold text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                      ✓ CONFIDENT
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-bold text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                      ⚠ CONFIRMATION NEEDED
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 font-sans text-xs text-foundation-500">
                  {fc.source}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
