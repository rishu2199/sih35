import React from 'react';
import { X, Scale, FileText, CheckCircle2, ArrowRight, Plus, ExternalLink, ShieldCheck } from 'lucide-react';
import { Instrument } from '../../types/instrument';
import { VerificationSession } from '../../types/session';

interface InstrumentDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  instrument: Instrument | null;
  historySessions: VerificationSession[];
  onOpenCurrentSession: (session: VerificationSession) => void;
  onStartNewVerification: (instrument: Instrument) => void;
}

export const InstrumentDetailsDrawer: React.FC<InstrumentDetailsDrawerProps> = ({
  isOpen,
  onClose,
  instrument,
  historySessions,
  onOpenCurrentSession,
  onStartNewVerification,
}) => {
  if (!isOpen || !instrument) return null;

  const currentSession = historySessions.find(
    (s) => s.reviewStatus === 'IN_TESTING' || s.reviewStatus === 'PENDING_REVIEW'
  ) || historySessions[0];

  const getClassBadge = (accClass: string) => {
    const norm = (accClass || '').toUpperCase();
    if (norm.includes('CLASS_I') || norm === 'CLASS_I') {
      return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800';
    }
    if (norm.includes('CLASS_IIII') || norm === 'CLASS_IIII') {
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800';
    }
    if (norm.includes('CLASS_III') || norm === 'CLASS_III') {
      return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800';
    }
    return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800';
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between overflow-y-auto font-sans">
        {/* Drawer Header (§25) */}
        <div>
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-slate-400">
                  Instrument Details
                </h3>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[240px]">
                  {instrument.modelName}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body (§25) */}
          <div className="p-6 space-y-6 text-xs">
            {/* Manufacturer & Title */}
            <div>
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Manufacturer & Model
              </div>
              <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                {instrument.manufacturer}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                {instrument.modelName}
              </div>
            </div>

            {/* Specifications Grid */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 font-mono">
              <div>
                <span className="text-slate-400 text-[10px] block uppercase">Serial Number</span>
                <span className="font-bold text-slate-900 dark:text-white">{instrument.serialNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block uppercase">Accuracy Class</span>
                <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold border ${getClassBadgeStyle(instrument.accuracyClass)}`}>
                  {String(instrument.accuracyClass).replace('_', ' ')}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block uppercase">Max Capacity</span>
                <span className="font-bold text-slate-900 dark:text-white">{instrument.maxCapacity} {instrument.unit}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block uppercase">Verification Interval (e)</span>
                <span className="font-bold text-slate-900 dark:text-white">{instrument.e} {instrument.unit}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block uppercase">Approval No (TAC)</span>
                <span className="font-bold text-slate-900 dark:text-white truncate block">{instrument.approvalNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block uppercase">Firmware</span>
                <span className="font-bold text-slate-900 dark:text-white">{instrument.firmwareVersion || 'v2.4.1'}</span>
              </div>
            </div>

            {/* Verification History Section (§25) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">
                  Verification History
                </span>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {historySessions.length} {historySessions.length === 1 ? 'session' : 'sessions'}
                </span>
              </div>

              {historySessions.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-slate-400">
                  No previous verification sessions recorded for this instrument.
                </div>
              ) : (
                <div className="space-y-2">
                  {historySessions.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => onOpenCurrentSession(s)}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-all cursor-pointer group flex items-center justify-between"
                    >
                      <div>
                        <div className="font-mono font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                          {s.sessionNumber}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {s.verificationStage?.replace(/_/g, ' ') || 'Subsequent Verification'}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                            s.reviewStatus === 'APPROVED'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : s.reviewStatus === 'REMANDED'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : s.reviewStatus === 'PENDING_REVIEW'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {s.reviewStatus || 'IN TESTING'}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions (§25) */}
        <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/80 space-y-2.5">
          {currentSession && (
            <button
              type="button"
              onClick={() => onOpenCurrentSession(currentSession)}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Open Current Session</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => onStartNewVerification(instrument)}
            className="w-full py-2.5 px-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-slate-400 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Start New Verification</span>
          </button>
        </div>
      </div>
    </div>
  );
};

function getClassBadgeStyle(accClass: string) {
  const norm = (accClass || '').toUpperCase();
  if (norm.includes('CLASS_I') || norm === 'CLASS_I') {
    return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300';
  }
  if (norm.includes('CLASS_IIII') || norm === 'CLASS_IIII') {
    return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300';
  }
  if (norm.includes('CLASS_III') || norm === 'CLASS_III') {
    return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300';
  }
  return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300';
}
