import React from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { CURRENT_HERO_SESSION } from '../../mockData';

interface ContinueTestingPanelProps {
  onContinue: (sessionId: string) => void;
}

export const ContinueTestingPanel: React.FC<ContinueTestingPanelProps> = ({
  onContinue,
}) => {
  const session = CURRENT_HERO_SESSION;

  return (
    <div className="bg-white border border-[#E4E8EF] rounded-2xl p-6 shadow-xs flex flex-col justify-between h-full">
      {/* Card Header */}
      <div>
        <div className="flex items-center justify-between pb-3.5 border-b border-[#E4E8EF]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-wider uppercase text-foundation-600">
              Continue Testing
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">
            <span>IN PROGRESS</span>
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
          </div>
        </div>

        {/* Instrument Identification */}
        <div className="mt-4">
          <h2 className="text-xl font-extrabold text-foundation-950 tracking-tight">
            {session.instrument}
          </h2>
          <p className="text-xs font-mono text-foundation-500 mt-1">
            {session.maxCapacity} <span className="text-foundation-300">•</span> {session.class} <span className="text-foundation-300">•</span> {session.interval}
          </p>
          <div className="mt-1.5 inline-block text-xs font-mono font-semibold text-foundation-600 bg-foundation-100/70 px-2 py-0.5 rounded">
            Session {session.sessionNumber}
          </div>
        </div>

        {/* Protocol Step Rail (1 to 7) */}
        <div className="mt-6">
          <div className="text-[11px] font-bold text-foundation-500 uppercase tracking-wider mb-3">
            Protocol
          </div>

          <div className="relative flex items-center justify-between px-2">
            {/* Background connecting track */}
            <div className="absolute left-6 right-6 top-3.5 h-0.5 bg-foundation-200 -z-0" />
            {/* Completed active progress track */}
            <div
              className="absolute left-6 top-3.5 h-0.5 bg-brand-600 -z-0 transition-all"
              style={{ width: `${((session.completedSteps - 1) / (session.totalSteps - 1)) * 100 * 0.85}%` }}
            />

            {session.steps.map((s) => {
              const isPast = s.num < session.completedSteps;
              const isCurrent = s.num === session.completedSteps;

              return (
                <div key={s.num} className="flex flex-col items-center relative z-10">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                      isPast
                        ? 'bg-brand-600 text-white shadow-xs'
                        : isCurrent
                        ? 'bg-white border-2 border-brand-600 text-brand-700 ring-4 ring-brand-100 shadow-xs'
                        : 'bg-white border-2 border-foundation-300 text-foundation-400'
                    }`}
                  >
                    {isPast ? <Check size={13} className="stroke-[3]" /> : s.num}
                  </div>
                  <span
                    className={`text-[10px] font-mono mt-1.5 ${
                      isCurrent
                        ? 'font-bold text-brand-700'
                        : isPast
                        ? 'font-medium text-foundation-700'
                        : 'text-foundation-400'
                    }`}
                  >
                    {s.num}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Test & Progress */}
        <div className="mt-6 p-4 rounded-xl bg-foundation-50/70 border border-[#E4E8EF]">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-foundation-400">
            Current test
          </div>
          <div className="text-sm font-bold text-foundation-900 mt-0.5">
            {session.currentProcedure}
          </div>

          <div className="mt-3">
            <div className="flex items-center justify-between text-xs font-medium text-foundation-600 mb-1.5">
              <span>Progress</span>
              <span className="font-mono font-bold text-foundation-900">
                {session.completedSteps} of {session.totalSteps}
              </span>
            </div>

            <div className="w-full bg-foundation-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-brand-600 h-full rounded-full transition-all"
                style={{ width: `${(session.completedSteps / session.totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Hero Footer Action: Rule 2 Dominant Action */}
      <div className="mt-6 pt-4 border-t border-[#E4E8EF] flex items-center justify-end">
        <button
          onClick={() => onContinue(session.id)}
          className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white text-xs sm:text-sm font-bold rounded-lg shadow-sm hover:shadow transition-all group cursor-pointer"
        >
          <span>Continue Testing</span>
          <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};
