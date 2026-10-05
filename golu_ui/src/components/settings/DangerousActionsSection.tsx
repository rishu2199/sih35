import React, { useState } from 'react';
import {
  AlertOctagon,
  RotateCcw,
  Trash2,
  RefreshCw,
  X,
  AlertTriangle,
  Lock,
} from 'lucide-react';

interface DangerousActionsSectionProps {
  onResetDemo: () => void;
  onClearDemoData: () => void;
  onRestoreDefaults: () => void;
  readOnly?: boolean;
}

export const DangerousActionsSection: React.FC<DangerousActionsSectionProps> = ({
  onResetDemo,
  onClearDemoData,
  onRestoreDefaults,
  readOnly = false,
}) => {
  const [modalType, setModalType] = useState<'NONE' | 'RESET_DEMO' | 'CLEAR_DATA' | 'RESTORE_DEFAULTS'>('NONE');
  const [confirmInputText, setConfirmInputText] = useState('');

  const openModal = (type: 'RESET_DEMO' | 'CLEAR_DATA' | 'RESTORE_DEFAULTS') => {
    setConfirmInputText('');
    setModalType(type);
  };

  const closeModal = () => {
    setModalType('NONE');
    setConfirmInputText('');
  };

  const handleConfirmAction = () => {
    if (modalType === 'RESTORE_DEFAULTS') {
      if (confirmInputText.trim() === 'RESET') {
        onRestoreDefaults();
        closeModal();
      }
    } else if (modalType === 'RESET_DEMO') {
      onResetDemo();
      closeModal();
    } else if (modalType === 'CLEAR_DATA') {
      onClearDemoData();
      closeModal();
    }
  };

  return (
    <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
      <div className="rounded-3xl border border-rose-200/80 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/20 p-6 sm:p-7 space-y-6">
        {/* Section Header (§24) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-rose-100 dark:border-rose-900/40">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/80 px-2 py-0.5 rounded-md">
                SECTION §24
              </span>
              <h3 className="text-xs font-mono font-bold tracking-widest uppercase text-rose-700 dark:text-rose-400">
                DANGEROUS ACTIONS
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Destructive workspace actions affecting cached parameters, simulated data, and demo configurations.
            </p>
          </div>

          {readOnly && (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-slate-500 bg-white/80 dark:bg-slate-800 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
              <Lock className="w-3 h-3" />
              🔒 Managed by Administrator
            </span>
          )}
        </div>

        {/* Action Items List (§24) */}
        <div className="divide-y divide-rose-100 dark:divide-rose-900/40">
          {/* 1. Reset demo environment */}
          <div className="py-4 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                Reset Demo Environment
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Re-seeds baseline active session datasets and resets telemetry feeds to factory defaults.
              </div>
            </div>
            <button
              type="button"
              disabled={readOnly}
              onClick={() => openModal('RESET_DEMO')}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-xs font-bold transition-all shadow-2xs shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* 2. Clear local demo data */}
          <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                Clear Local Demo Data
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Clears browser-stored drafts, temporary observation logs, and mock hardware traces.
              </div>
            </div>
            <button
              type="button"
              disabled={readOnly}
              onClick={() => openModal('CLEAR_DATA')}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-xs font-bold transition-all shadow-2xs shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>

          {/* 3. Restore default configuration */}
          <div className="py-4 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                Restore Default Configuration
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Replaces all laboratory configurations, standards policies, and defaults with initial presets.
              </div>
            </div>
            <button
              type="button"
              disabled={readOnly}
              onClick={() => openModal('RESTORE_DEFAULTS')}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-sm shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Restore Defaults</span>
            </button>
          </div>
        </div>
      </div>

      {/* Destructive Confirmation Modal (§25) */}
      {modalType !== 'NONE' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalType === 'RESTORE_DEFAULTS' ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <h3 className="text-base font-black font-mono tracking-tight text-slate-900 dark:text-white uppercase">
                    RESTORE DEFAULTS?
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    This will replace the current demo configuration with the application defaults.
                  </p>
                  <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                    This action cannot be undone.
                  </p>
                </div>

                <div className="pt-2 space-y-1.5">
                  <label className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 block">
                    Type <span className="font-mono text-rose-600 dark:text-rose-400 font-black">RESET</span> to continue:
                  </label>
                  <input
                    type="text"
                    value={confirmInputText}
                    onChange={(e) => setConfirmInputText(e.target.value)}
                    placeholder="RESET"
                    autoFocus
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
              </div>
            ) : modalType === 'RESET_DEMO' ? (
              <div className="space-y-2">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Reset Demo Environment?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Active mock test recordings and sensor feeds will be refreshed back to initial benchmark state.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Clear Local Demo Data?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  All cached observations and unsaved draft certificates stored in this browser session will be permanently erased.
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={modalType === 'RESTORE_DEFAULTS' && confirmInputText.trim() !== 'RESET'}
                onClick={handleConfirmAction}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {modalType === 'RESTORE_DEFAULTS' ? 'Restore Defaults' : 'Confirm Action'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
