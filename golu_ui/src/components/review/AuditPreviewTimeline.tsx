import React from 'react';
import { History, CheckCircle2, ArrowRight, Eye, AlertTriangle, ShieldCheck, RotateCcw } from 'lucide-react';
import { AuditTrailEntry } from './types';

interface AuditPreviewTimelineProps {
  entries: AuditTrailEntry[];
}

export const AuditPreviewTimeline: React.FC<AuditPreviewTimelineProps> = ({ entries }) => {
  return (
    <div className="bg-white border border-foundation-200 rounded-2xl p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-foundation-100">
        <div>
          <span className="text-[11px] font-bold text-foundation-400 uppercase tracking-wider font-mono">
            Audit Activity Preview
          </span>
          <h3 className="text-sm font-bold text-foundation-900 font-sans">
            Cryptographic Action Log (WELMEC 7.2)
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
          <ShieldCheck size={13} className="text-emerald-600" />
          <span>Immutable Ledger Active</span>
        </div>
      </div>

      <div className="relative pl-6 space-y-3.5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-foundation-200">
        {entries.map((entry) => {
          let icon = <CheckCircle2 size={13} className="text-emerald-600" />;
          let dotBg = 'bg-emerald-50 border-emerald-200';

          if (entry.iconType === 'forward') {
            icon = <ArrowRight size={13} className="text-brand-600" />;
            dotBg = 'bg-brand-50 border-brand-200';
          } else if (entry.iconType === 'open') {
            icon = <Eye size={13} className="text-purple-600" />;
            dotBg = 'bg-purple-50 border-purple-200';
          } else if (entry.iconType === 'flag') {
            icon = <AlertTriangle size={13} className="text-amber-600" />;
            dotBg = 'bg-amber-50 border-amber-200';
          } else if (entry.iconType === 'sign') {
            icon = <ShieldCheck size={13} className="text-emerald-700" />;
            dotBg = 'bg-emerald-100 border-emerald-300';
          } else if (entry.iconType === 'remand') {
            icon = <RotateCcw size={13} className="text-rose-600" />;
            dotBg = 'bg-rose-50 border-rose-200';
          }

          return (
            <div key={entry.id} className="relative flex items-start justify-between gap-3 text-xs">
              <div
                className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border flex items-center justify-center ${dotBg} shrink-0`}
              >
                {icon}
              </div>

              <div>
                <p className="font-semibold text-foundation-800 leading-snug">
                  {entry.action}
                </p>
                <p className="text-[11px] font-mono text-foundation-500 mt-0.5">
                  by {entry.actor}
                </p>
              </div>

              <span className="font-mono text-[11px] font-bold text-foundation-400 shrink-0">
                {entry.time}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
