import React from 'react';
import { Lock, AlertOctagon, ArrowRight, X, ShieldAlert } from 'lucide-react';
import { ReadinessCheckItem } from './types';

interface WhyCantIStartModalProps {
  isOpen: boolean;
  onClose: () => void;
  blockedItems: ReadinessCheckItem[];
  onOpenDrawer: () => void;
  onResolveItem: (targetTab: string) => void;
}

export const WhyCantIStartModal: React.FC<WhyCantIStartModalProps> = ({
  isOpen,
  onClose,
  blockedItems,
  onOpenDrawer,
  onResolveItem,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in select-none">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-red-200 dark:border-red-900/80 max-w-md w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
        {/* Header (§22) */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center font-bold">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-red-600 dark:text-red-400 uppercase tracking-wider block">
                GATE EXPLANATION §22
              </span>
              <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                Why is Testing Blocked?
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Statutory metrological standards prevent test measurements until all mandatory prerequisites are confirmed. <strong className="text-slate-900 dark:text-white font-bold">{blockedItems.length || 1} mandatory condition(s)</strong> remain unresolved:
          </p>

          <div className="space-y-2">
            {blockedItems.length > 0 ? (
              blockedItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-red-700 dark:text-red-400">
                        {idx + 1}. {item.title}
                      </span>
                    </div>
                    <p className="text-red-800 dark:text-red-300 text-[11px] leading-relaxed">
                      {item.blockerReason || item.detail}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onResolveItem(item.resolutionTargetTab || 'standards');
                    }}
                    className="flex-shrink-0 px-2.5 py-1 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] transition-colors cursor-pointer"
                  >
                    Resolve →
                  </button>
                </div>
              ))
            ) : (
              <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-900 dark:text-red-300">
                1. Standard weight calibration has expired or traceability is locked.
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenDrawer();
            }}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            View All Issues in Drawer →
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
