import React from 'react';
import { Plus, Building2 } from 'lucide-react';

interface PageHeaderProps {
  onNewSession: () => void;
  laboratoryName?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  onNewSession,
  laboratoryName = 'RRSL Bengaluru',
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E4E8EF] dark:border-slate-800">
      <div>
        <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-[11px] font-mono font-bold tracking-wider uppercase mb-1">
          <span>Home</span>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" />
            <span>{laboratoryName}</span>
          </span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight font-sans">
          Laboratory Overview
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-xl">
          See active verification work, pending approvals and current traceability status.
        </p>
      </div>

      <div className="flex items-center gap-4 self-start sm:self-auto shrink-0">
        {/* Calm operational indicator (§4) */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>System Operational</span>
        </div>

        <button
          type="button"
          onClick={onNewSession}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Register Instrument</span>
        </button>
      </div>
    </div>
  );
};
