import React from 'react';
import { AlertTriangle, X, ArrowRight } from 'lucide-react';
import { AttentionItem } from '../../types';

interface NeedsAttentionPanelProps {
  items: AttentionItem[];
  onActionClick: (item: AttentionItem) => void;
}

export const NeedsAttentionPanel: React.FC<NeedsAttentionPanelProps> = ({
  items,
  onActionClick,
}) => {
  return (
    <div className="bg-white border border-[#E4E8EF] rounded-2xl p-6 shadow-xs flex flex-col justify-between h-full">
      <div>
        {/* Header with ⚠ 2 items badge */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#E4E8EF]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-wider uppercase text-foundation-600">
              Needs Attention
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
            <AlertTriangle size={13} className="text-amber-600" />
            <span>{items.length} items</span>
          </div>
        </div>

        {/* Actionable List */}
        <div className="mt-4 space-y-4">
          {items.map((item, index) => {
            const isWarning = item.severity === 'warning';

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all ${
                  isWarning
                    ? 'border-amber-200 bg-amber-50/40'
                    : 'border-rose-200 bg-rose-50/40'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                      isWarning
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {isWarning ? '⚠' : '✕'}
                  </div>

                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-foundation-950 font-mono">
                      {item.title}
                    </h4>
                    <p className="text-xs text-foundation-600 mt-1 leading-snug">
                      {item.description}
                    </p>

                    <button
                      onClick={() => onActionClick(item)}
                      className={`mt-2.5 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                        isWarning
                          ? 'text-amber-800 hover:text-amber-950'
                          : 'text-rose-700 hover:text-rose-900'
                      }`}
                    >
                      <span>→ {item.actionText || 'Review'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer helper */}
      <div className="mt-5 pt-3 border-t border-[#E4E8EF] text-[11px] text-foundation-400 font-medium">
        Laboratory protocol: Resolve high severity items prior to sign-off.
      </div>
    </div>
  );
};
