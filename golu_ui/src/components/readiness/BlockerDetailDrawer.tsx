import React from 'react';
import {
  X,
  AlertTriangle,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Info,
} from 'lucide-react';
import { ReadinessCheckItem } from './types';

interface BlockerDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  item: ReadinessCheckItem | null;
  allItems?: ReadinessCheckItem[];
  onResolve: (targetTab: string) => void;
}

export const BlockerDetailDrawer: React.FC<BlockerDetailDrawerProps> = ({
  isOpen,
  onClose,
  item,
  allItems = [],
  onResolve,
}) => {
  if (!isOpen) return null;

  const blockingItems = allItems.filter(
    (i) => i.status === 'BLOCKED' || i.status === 'WARNING'
  );

  const displaySingle = item !== null;
  const isBlocked = item?.status === 'BLOCKED';
  const isWarning = item?.status === 'WARNING';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  isBlocked
                    ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                    : isWarning
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
                }`}
              >
                {isBlocked ? (
                  <Lock className="w-4 h-4" />
                ) : isWarning ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-slate-500 tracking-wider">
                  STATUTORY INSPECTION §21
                </span>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  {displaySingle
                    ? isBlocked
                      ? 'Preflight Blocker'
                      : isWarning
                      ? 'Attention Required'
                      : 'Prerequisite Verified'
                    : 'Blocking Preflight Issues'}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {displaySingle && item ? (
              /* Single Item Detail */
              <>
                <div>
                  <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    {item.category}
                  </span>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Current Value / State Card */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-2 text-xs">
                  <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                    Current Condition Evidence
                  </div>
                  <div className="font-mono font-bold text-slate-900 dark:text-white">
                    {item.detail}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500">
                    Statutory Ref: {item.statutoryRef}
                  </div>
                </div>

                {/* Spec details grid */}
                {item.specDetails && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-2 text-xs font-mono">
                    <div className="text-[10px] font-sans font-bold text-slate-500 uppercase tracking-wider pb-1 border-b border-slate-200 dark:border-slate-700">
                      Specification Parameters
                    </div>
                    {Object.entries(item.specDetails).map(([key, val]) => (
                      <div key={key} className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                        <span className="text-slate-500 font-sans">{key}:</span>
                        <span className="font-bold text-slate-900 dark:text-white text-right">{val}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Blocker Rationale & Action */}
                {(isBlocked || isWarning) && (
                  <div
                    className={`p-4 rounded-2xl border space-y-3 text-xs ${
                      isBlocked
                        ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900'
                        : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900'
                    }`}
                  >
                    <div>
                      <div
                        className={`font-bold uppercase tracking-wider text-[10px] ${
                          isBlocked ? 'text-red-700 dark:text-red-400' : 'text-amber-700 dark:text-amber-400'
                        }`}
                      >
                        {isBlocked ? 'BLOCKER REASON' : 'ATTENTION NOTICE'}
                      </div>
                      <div
                        className={`font-bold mt-0.5 ${
                          isBlocked ? 'text-red-950 dark:text-red-200' : 'text-amber-950 dark:text-amber-200'
                        }`}
                      >
                        {item.blockerReason || item.title}
                      </div>
                    </div>

                    <div>
                      <div
                        className={`font-bold uppercase tracking-wider text-[10px] ${
                          isBlocked ? 'text-red-700 dark:text-red-400' : 'text-amber-700 dark:text-amber-400'
                        }`}
                      >
                        Why does this matter?
                      </div>
                      <div
                        className={`mt-0.5 leading-relaxed ${
                          isBlocked ? 'text-red-800 dark:text-red-300' : 'text-amber-800 dark:text-amber-300'
                        }`}
                      >
                        {item.whyItMatters ||
                          'Statutory verification measurements cannot proceed until standard weights and metrological parameters are valid.'}
                      </div>
                    </div>

                    <div>
                      <div
                        className={`font-bold uppercase tracking-wider text-[10px] ${
                          isBlocked ? 'text-red-700 dark:text-red-400' : 'text-amber-700 dark:text-amber-400'
                        }`}
                      >
                        Required action
                      </div>
                      <div
                        className={`mt-0.5 leading-relaxed ${
                          isBlocked ? 'text-red-800 dark:text-red-300' : 'text-amber-800 dark:text-amber-300'
                        }`}
                      >
                        {item.requiredAction || 'Resolve this prerequisite to unlock verification testing.'}
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* All Blockers List (§21) */
              <div className="space-y-4">
                <p className="text-xs text-slate-500">
                  {blockingItems.length} issue(s) are currently preventing or cautioning test commencement:
                </p>

                {blockingItems.map((blk, idx) => (
                  <div
                    key={blk.id}
                    className="p-4 rounded-2xl border border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-red-600 bg-red-100 dark:bg-red-900/60 px-1.5 py-0.2 rounded">
                        0{idx + 1}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {blk.statutoryRef}
                      </span>
                    </div>

                    <h5 className="font-bold text-red-950 dark:text-red-200">
                      {blk.title}
                    </h5>

                    <p className="text-red-800 dark:text-red-300 text-[11px] leading-relaxed">
                      {blk.blockerReason || blk.detail}
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onResolve(blk.resolutionTargetTab || 'standards');
                      }}
                      className="mt-2 w-full py-2 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>{blk.resolutionActionText || 'Resolve Issue →'}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Action */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 cursor-pointer"
            >
              Close
            </button>

            {item && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onResolve(item.resolutionTargetTab || 'standards');
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer"
              >
                <span>{item.resolutionActionText || 'Open Target Workspace'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
