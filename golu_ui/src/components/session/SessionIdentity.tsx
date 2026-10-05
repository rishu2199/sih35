import React from 'react';
import { Scale } from 'lucide-react';

export interface SessionIdentityProps {
  serialNumber: string;
  modelName: string;
  accuracyClass: string;
  maxCap: string;
  minCap: string;
  eVal: string;
  dVal: string;
  className?: string;
}

/**
 * SessionIdentity (§35)
 * Displays persistent instrument identification and statutory specifications
 */
export const SessionIdentity: React.FC<SessionIdentityProps> = ({
  serialNumber,
  modelName,
  accuracyClass,
  maxCap,
  minCap,
  eVal,
  dVal,
  className = '',
}) => {
  return (
    <div className={`flex flex-wrap items-center gap-2.5 text-xs ${className}`}>
      {/* Serial Number Tag */}
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-mono font-bold">
        <Scale className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
        <span>{serialNumber}</span>
      </div>

      {/* Model Name */}
      <span className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate max-w-[240px]">
        {modelName}
      </span>

      <span className="text-slate-300 dark:text-slate-700 font-light">|</span>

      {/* Accuracy Class Badge */}
      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
        {accuracyClass}
      </span>

      <span className="text-slate-300 dark:text-slate-700 font-light">|</span>

      {/* Technical Specifications in IBM Plex Mono */}
      <div className="flex items-center gap-2 font-mono text-slate-600 dark:text-slate-400 text-xs">
        <span>Max {maxCap}</span>
        <span>•</span>
        <span>Min {minCap}</span>
        <span>•</span>
        <span>{eVal}</span>
        <span>•</span>
        <span>{dVal}</span>
      </div>
    </div>
  );
};
