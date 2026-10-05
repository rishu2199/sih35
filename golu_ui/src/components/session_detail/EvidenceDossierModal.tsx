import React, { useState } from 'react';
import { X, Check, Camera, ShieldCheck, ExternalLink, Hash, Clock } from 'lucide-react';
import { StatutoryEvidenceItem } from './types';

interface EvidenceDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  evidenceItems: StatutoryEvidenceItem[];
  instrumentId: string;
}

export const EvidenceDossierModal: React.FC<EvidenceDossierModalProps> = ({
  isOpen,
  onClose,
  evidenceItems,
  instrumentId,
}) => {
  const [selectedItem, setSelectedItem] = useState<StatutoryEvidenceItem>(evidenceItems[0] || null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-4xl w-full p-6 sm:p-7 shadow-2xl space-y-6 animate-in zoom-in-95 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                Statutory Evidence Dossier
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-mono">
              Instrument #{instrumentId} · 5 Statutory Intake Photos (OIML R 76-1 / Welmec 7.2)
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content: Left list, Right preview */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 overflow-y-auto flex-1 pr-1">
          {/* List of 5 items - 5 cols */}
          <div className="md:col-span-5 space-y-2.5">
            {evidenceItems.map((item) => {
              const isSelected = selectedItem?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700 shadow-xs'
                      : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {item.category}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>Verified</span>
                    </span>
                  </div>

                  <div className="font-bold text-slate-900 dark:text-white mt-1">
                    {item.name}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                    <span>{item.timestamp}</span>
                    <span className="font-mono text-[10px]">{item.hash.substring(0, 8)}...</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed view of selected item - 7 cols */}
          {selectedItem && (
            <div className="md:col-span-7 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="aspect-video w-full rounded-xl bg-slate-900 overflow-hidden relative shadow-inner flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80"
                    alt={selectedItem.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-md bg-slate-900/80 text-white font-mono text-[10px] backdrop-blur-xs flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-400" />
                    <span>{selectedItem.timestamp}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {selectedItem.name}
                    </h4>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                      OIML STATUTORY PHOTO
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {selectedItem.notes}
                  </p>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-xs space-y-1">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                      <Hash className="w-3 h-3" />
                      <span>SHA-256 Digest (Chained to Audit Log)</span>
                    </div>
                    <div className="text-[11px] text-blue-600 dark:text-blue-400 break-all select-all font-semibold">
                      {selectedItem.hash}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Tamper-evident legal metrology record</span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs transition-colors cursor-pointer"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
