import React from 'react';
import { ArrowRight, ChevronRight, Eye, Scale } from 'lucide-react';
import { Instrument } from '../../types/instrument';

interface InstrumentsTableProps {
  instruments: Instrument[];
  onSelectInstrument: (instrument: Instrument) => void;
  onStartVerification: (instrument: Instrument) => void;
}

export const InstrumentsTable: React.FC<InstrumentsTableProps> = ({
  instruments,
  onSelectInstrument,
  onStartVerification,
}) => {
  const getClassBadge = (accClass: string) => {
    const norm = (accClass || '').toUpperCase();
    if (norm.includes('CLASS_I') || norm === 'CLASS_I') {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
          Class I
        </span>
      );
    }
    if (norm.includes('CLASS_IIII') || norm === 'CLASS_IIII') {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          Class IIII
        </span>
      );
    }
    if (norm.includes('CLASS_III') || norm === 'CLASS_III') {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
          Class III
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
        Class II
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const s = (status || '').toUpperCase();
    if (s.includes('APPROV')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          Approved
        </span>
      );
    }
    if (s.includes('REVIEW')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          Review
        </span>
      );
    }
    if (s.includes('REMAND')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
          Remanded
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
        In Testing
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-[#E4E8EF] dark:border-slate-800 rounded-3xl shadow-xs overflow-hidden">
      {/* Desktop Table (§24) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/70 dark:bg-slate-800/40 border-b border-[#E4E8EF] dark:border-slate-800 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th className="py-3.5 px-6">Model & Manufacturer</th>
              <th className="py-3.5 px-4">Serial Number</th>
              <th className="py-3.5 px-4">Accuracy Class</th>
              <th className="py-3.5 px-4">Capacity / Interval</th>
              <th className="py-3.5 px-4">Current Status</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E4E8EF] dark:divide-slate-800 text-xs">
            {instruments.map((inst) => (
              <tr
                key={inst.id}
                onClick={() => onSelectInstrument(inst)}
                className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
              >
                {/* Model */}
                <td className="py-4 px-6">
                  <div className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                    {inst.modelName}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                    {inst.manufacturer}
                  </div>
                </td>

                {/* Serial */}
                <td className="py-4 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                  {inst.serialNumber}
                </td>

                {/* Class */}
                <td className="py-4 px-4">
                  {getClassBadge(inst.accuracyClass)}
                </td>

                {/* Capacity */}
                <td className="py-4 px-4 font-mono">
                  <div className="text-slate-900 dark:text-white font-semibold">
                    {inst.maxCapacity} {inst.unit}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    e = {inst.e} {inst.unit}
                  </div>
                </td>

                {/* Status */}
                <td className="py-4 px-4">
                  {getStatusBadge(inst.status)}
                </td>

                {/* Actions */}
                <td className="py-4 px-6 text-right">
                  <div className="inline-flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 flex items-center gap-1 transition-colors">
                      <span>Inspect</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards View */}
      <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
        {instruments.map((inst) => (
          <div
            key={inst.id}
            onClick={() => onSelectInstrument(inst)}
            className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer space-y-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  {inst.modelName}
                </h4>
                <div className="text-xs text-slate-400 font-mono">
                  {inst.serialNumber}
                </div>
              </div>
              {getStatusBadge(inst.status)}
            </div>

            <div className="flex items-center justify-between text-xs font-mono pt-1">
              <span className="text-slate-500">{inst.maxCapacity} {inst.unit} (e = {inst.e})</span>
              {getClassBadge(inst.accuracyClass)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
