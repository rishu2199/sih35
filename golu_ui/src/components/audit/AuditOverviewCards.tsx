import React from 'react';
import { ShieldCheck, Users, Hash, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { AuditChainState } from './types';

interface AuditOverviewCardsProps {
  chainState: AuditChainState;
  eventsCount: number;
  actorsCount: number;
}

export const AuditOverviewCards: React.FC<AuditOverviewCardsProps> = ({
  chainState,
  eventsCount,
  actorsCount,
}) => {
  const isValid = chainState.isChainValid;

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
      {/* 1. Left: Three Metric Cards (7 cols on md) */}
      <div className="md:col-span-7 grid grid-cols-3 gap-3">
        {/* Total Events */}
        <div className="p-4 rounded-2xl bg-white border border-foundation-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-foundation-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-foundation-500">
              Total Events
            </span>
            <Hash size={14} />
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-foundation-900 font-mono tracking-tight">
              {eventsCount}
            </div>
            <div className="text-[11px] font-mono text-foundation-500 font-semibold mt-0.5 uppercase">
              Events Logged
            </div>
          </div>
        </div>

        {/* Actors */}
        <div className="p-4 rounded-2xl bg-white border border-foundation-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-foundation-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-foundation-500">
              Actors
            </span>
            <Users size={14} />
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-foundation-900 font-mono tracking-tight">
              {actorsCount}
            </div>
            <div className="text-[11px] font-mono text-foundation-500 font-semibold mt-0.5 uppercase">
              Authorized Actors
            </div>
          </div>
        </div>

        {/* Integrity Issues */}
        <div
          className={`p-4 rounded-2xl border shadow-xs flex flex-col justify-between transition-colors ${
            isValid
              ? 'bg-white border-foundation-200'
              : 'bg-rose-50 border-rose-300 ring-2 ring-rose-500/20'
          }`}
        >
          <div
            className={`flex items-center justify-between ${
              isValid ? 'text-foundation-400' : 'text-rose-500'
            }`}
          >
            <span
              className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                isValid ? 'text-foundation-500' : 'text-rose-700'
              }`}
            >
              Integrity
            </span>
            {isValid ? <ShieldCheck size={14} /> : <AlertTriangle size={14} />}
          </div>
          <div className="mt-2">
            <div
              className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${
                isValid ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {isValid ? '0' : '1'}
            </div>
            <div
              className={`text-[11px] font-mono font-semibold mt-0.5 uppercase ${
                isValid ? 'text-foundation-500' : 'text-rose-700 font-bold'
              }`}
            >
              {isValid ? 'Issues Detected' : 'Integrity Issue'}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Right: Immutability Status Card (5 cols on md) */}
      <div
        className={`md:col-span-5 p-5 rounded-2xl border shadow-xs flex flex-col justify-between ${
          isValid
            ? 'bg-white border-foundation-200'
            : 'bg-rose-50/80 border-rose-300'
        }`}
      >
        <div>
          <div className="flex items-center justify-between pb-2 border-b border-foundation-100">
            <span className="text-[11px] font-bold text-foundation-500 uppercase tracking-wider font-mono">
              Immutability Status
            </span>
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                isValid
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : 'bg-rose-100 text-rose-900 border border-rose-300'
              }`}
            >
              {isValid ? 'VERIFIED' : 'FAILED'}
            </span>
          </div>

          <div className="mt-3 space-y-2 text-xs font-sans">
            <div className="flex items-center gap-2">
              {isValid ? (
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
              ) : (
                <XCircle size={15} className="text-rose-600 shrink-0" />
              )}
              <span className={isValid ? 'text-foundation-700 font-medium' : 'text-rose-900 font-bold'}>
                {isValid ? 'Hash chain verified' : 'Hash chain integrity failure'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {isValid ? (
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
              ) : (
                <XCircle size={15} className="text-rose-600 shrink-0" />
              )}
              <span className={isValid ? 'text-foundation-700 font-medium' : 'text-rose-900 font-bold'}>
                {isValid ? 'No broken links' : '1 broken link detected in sequence'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {isValid ? (
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
              ) : (
                <XCircle size={15} className="text-rose-600 shrink-0" />
              )}
              <span className={isValid ? 'text-foundation-700 font-medium' : 'text-rose-900 font-bold'}>
                {isValid ? 'Record sequence consistent' : 'Chain link validation interrupted'}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-foundation-100 flex items-center justify-between text-[11px] font-mono text-foundation-400">
          <span>Algorithm: SHA-256</span>
          <span>WELMEC 7.2 Guide § 4.3</span>
        </div>
      </div>
    </div>
  );
};
