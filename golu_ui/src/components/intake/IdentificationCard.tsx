import React from 'react';
import { Check, AlertCircle } from 'lucide-react';

interface IdentificationCardProps {
  manufacturer: string;
  model: string;
  serialNumber: string;
  approvalNumber: string;
  onFieldChange: (field: string, value: string) => void;
  isReadOnly?: boolean;
}

export const IdentificationCard: React.FC<IdentificationCardProps> = ({
  manufacturer,
  model,
  serialNumber,
  approvalNumber,
  onFieldChange,
  isReadOnly = false,
}) => {
  const isSerialValid = serialNumber.trim().length >= 4;
  const isMfrValid = manufacturer.trim().length >= 2;
  const isModelValid = model.trim().length >= 2;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
      <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-blue-600 dark:text-blue-400">
            02 IDENTIFICATION
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Core legal and manufacturer identity for statutory registry.
          </p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
          4 Fields
        </span>
      </div>

      <div className="space-y-4 text-xs font-sans">
        {/* Field 1: Manufacturer */}
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
            Manufacturer
          </label>
          <div className="relative">
            <input
              type="text"
              disabled={isReadOnly}
              value={manufacturer}
              onChange={(e) => onFieldChange('manufacturer', e.target.value)}
              placeholder="e.g. Avery Weigh-Tronix"
              className={`w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                !isMfrValid
                  ? 'border-rose-300 dark:border-rose-800'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            />
            {isMfrValid && (
              <Check className="w-4 h-4 text-emerald-500 absolute right-3 top-3 stroke-[2.5]" />
            )}
          </div>
          {!isMfrValid && (
            <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-mono">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Manufacturer name required</span>
            </p>
          )}
        </div>

        {/* Field 2: Model Name */}
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
            Model Name
          </label>
          <div className="relative">
            <input
              type="text"
              disabled={isReadOnly}
              value={model}
              onChange={(e) => onFieldChange('model', e.target.value)}
              placeholder="e.g. ZM201 Retail Platform"
              className={`w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                !isModelValid
                  ? 'border-rose-300 dark:border-rose-800'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            />
            {isModelValid && (
              <Check className="w-4 h-4 text-emerald-500 absolute right-3 top-3 stroke-[2.5]" />
            )}
          </div>
          {!isModelValid && (
            <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-mono">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Model designation required</span>
            </p>
          )}
        </div>

        {/* Field 3: Serial Number (with Section 9 validation) */}
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
            Serial Number
          </label>
          <div className="relative">
            <input
              type="text"
              disabled={isReadOnly}
              value={serialNumber}
              onChange={(e) => onFieldChange('serialNumber', e.target.value)}
              placeholder="e.g. AV-2026-8812"
              className={`w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border rounded-xl font-mono text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                !isSerialValid
                  ? 'border-rose-300 dark:border-rose-800'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            />
            {isSerialValid && (
              <Check className="w-4 h-4 text-emerald-500 absolute right-3 top-3 stroke-[2.5]" />
            )}
          </div>
          {isSerialValid ? (
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-mono">
              <Check className="w-3 h-3 stroke-[2.5]" />
              <span>Serial number format accepted</span>
            </p>
          ) : (
            <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-mono">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Serial number required</span>
            </p>
          )}
        </div>

        {/* Field 4: Type Approval Number */}
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
            Type Approval Number
          </label>
          <div className="relative">
            <input
              type="text"
              disabled={isReadOnly}
              value={approvalNumber}
              onChange={(e) => onFieldChange('approvalNumber', e.target.value)}
              placeholder="e.g. TAC-2026-III-0142"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
          <p className="text-[10px] text-slate-400 font-mono mt-1">
            National model approval certificate reference
          </p>
        </div>
      </div>
    </div>
  );
};
