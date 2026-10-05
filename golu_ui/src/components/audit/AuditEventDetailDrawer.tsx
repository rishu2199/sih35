import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Copy,
  Check,
  FileCode,
  Clock,
  User,
  AlertTriangle,
  Lock,
  ArrowDown,
  Layers,
} from 'lucide-react';
import { AuditEvent } from './types';

interface AuditEventDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  event: AuditEvent | null;
  isCorrupted?: boolean;
  onCopyHash: (hash: string) => void;
  isAuditorMode?: boolean;
}

export const AuditEventDetailDrawer: React.FC<AuditEventDetailDrawerProps> = ({
  isOpen,
  onClose,
  event,
  isCorrupted = false,
  onCopyHash,
  isAuditorMode = false,
}) => {
  const [copiedCurrent, setCopiedCurrent] = useState(false);
  const [copiedPrev, setCopiedPrev] = useState(false);

  if (!isOpen || !event) return null;

  const handleCopyCurrent = () => {
    onCopyHash(event.hash);
    setCopiedCurrent(true);
    setTimeout(() => setCopiedCurrent(false), 2000);
  };

  const handleCopyPrev = () => {
    onCopyHash(event.previousHash);
    setCopiedPrev(true);
    setTimeout(() => setCopiedPrev(false), 2000);
  };

  const isDirectorSign = event.category === 'SIGNATURE' || event.action === 'DIRECTOR_SIGNED';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foundation-950/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md md:max-w-lg bg-white shadow-2xl flex flex-col border-l border-foundation-200">
          {/* 1. Header (Section 17: EVENT DETAILS ×) */}
          <div className="p-5 border-b border-foundation-200 bg-foundation-50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shadow-xs ${
                  isDirectorSign
                    ? 'bg-purple-700 text-white'
                    : 'bg-foundation-900 text-white'
                }`}
              >
                <FileCode size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foundation-900 tracking-tight font-sans uppercase">
                  Event Details
                </h3>
                <p className="text-[11px] text-foundation-500 font-mono">
                  {event.id} • Block #{event.blockNumber}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-foundation-400 hover:text-foundation-700 hover:bg-foundation-200 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* 2. Drawer Body (Section 17: Fields) */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 font-sans">
            {/* Chain Status Pill */}
            <div
              className={`p-3.5 rounded-xl border flex items-center gap-3 ${
                isCorrupted
                  ? 'bg-rose-50 border-rose-200 text-rose-950'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-950'
              }`}
            >
              {isCorrupted ? (
                <AlertTriangle size={22} className="text-rose-600 shrink-0" />
              ) : (
                <ShieldCheck size={22} className="text-emerald-600 shrink-0" />
              )}
              <div>
                <div className="text-xs font-bold font-sans">
                  {isCorrupted
                    ? '✕ Block Integrity Error Detected'
                    : '✓ Cryptographic Chain Link Valid'}
                </div>
                <div className="text-[11px] font-mono mt-0.5 text-foundation-600">
                  {isCorrupted
                    ? 'Expected previous hash does not match stored block digest'
                    : 'Block #' + event.blockNumber + ' recursively verified back to genesis zero-anchor'}
                </div>
              </div>
            </div>

            {/* Event ID & Action */}
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-[10px] font-bold text-foundation-400 uppercase tracking-wider font-mono">
                  Event ID
                </span>
                <div className="text-sm font-mono font-bold text-foundation-900 mt-0.5">
                  {event.id}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-foundation-400 uppercase tracking-wider font-mono">
                  Action
                </span>
                <div className="text-sm font-bold text-foundation-900 mt-0.5">
                  {event.title}
                </div>
                <p className="text-xs text-foundation-600 mt-1 leading-relaxed">
                  {event.details}
                </p>
              </div>

              {/* Actor & Role */}
              <div className="p-3.5 rounded-xl bg-foundation-50 border border-foundation-200">
                <span className="text-[10px] font-bold text-foundation-400 uppercase tracking-wider font-mono">
                  Actor & Authority
                </span>
                <div className="text-sm font-bold text-foundation-900 mt-0.5">
                  {event.actor}
                </div>
                <div className="text-xs font-mono font-semibold text-foundation-600 mt-0.5">
                  {event.role}
                </div>
              </div>

              {/* Timestamp & Session Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-foundation-50 border border-foundation-200">
                  <span className="text-[10px] font-bold text-foundation-400 uppercase tracking-wider font-mono">
                    Timestamp
                  </span>
                  <div className="font-mono font-bold text-foundation-900 text-xs mt-0.5">
                    {event.dateFormatted}
                  </div>
                  <div className="font-mono text-xs text-foundation-600">
                    {event.timeFormatted} IST
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-foundation-50 border border-foundation-200">
                  <span className="text-[10px] font-bold text-foundation-400 uppercase tracking-wider font-mono">
                    Session
                  </span>
                  <div className="font-mono font-bold text-brand-700 text-xs mt-0.5">
                    {event.sessionId}
                  </div>
                  <div className="text-[11px] text-foundation-500 truncate">
                    {event.instrumentSummary}
                  </div>
                </div>
              </div>

              {/* Previous Hash Block */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-foundation-500 uppercase tracking-wider font-mono flex items-center gap-1">
                    <span>Previous Hash</span>
                    <ArrowDown size={11} className="text-foundation-400" />
                  </span>
                  <button
                    onClick={handleCopyPrev}
                    className="text-[11px] font-mono text-foundation-500 hover:text-foundation-800 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedPrev ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                    <span>{copiedPrev ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 text-slate-300 font-mono text-[11px] break-all border border-slate-800 select-all leading-relaxed">
                  {event.previousHash}
                </div>
              </div>

              {/* Current Hash Block */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-foundation-500 uppercase tracking-wider font-mono">
                    Current Hash (SHA-256)
                  </span>
                  <button
                    onClick={handleCopyCurrent}
                    className="text-[11px] font-mono text-foundation-500 hover:text-foundation-800 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCurrent ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                    <span>{copiedCurrent ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div
                  className={`p-3 rounded-xl font-mono text-[11px] break-all border select-all leading-relaxed ${
                    isCorrupted
                      ? 'bg-rose-950 text-rose-300 border-rose-800 font-bold'
                      : 'bg-slate-900 text-emerald-400 border-slate-800'
                  }`}
                >
                  {event.hash}
                </div>
              </div>

              {/* Chain Status */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-foundation-50 border border-foundation-200">
                <span className="text-[11px] font-bold text-foundation-600 uppercase font-mono">
                  Chain Status
                </span>
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    isCorrupted
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  {isCorrupted ? '✕ Broken Link' : '✓ Valid'}
                </span>
              </div>

              {/* Structured Payload Parameters */}
              <div>
                <span className="text-[10px] font-bold text-foundation-500 uppercase tracking-wider font-mono mb-1.5 block">
                  Structured Event Payload
                </span>
                <div className="p-3.5 rounded-xl bg-foundation-50 border border-foundation-200 font-mono text-[11px] space-y-1.5">
                  {Object.entries(event.payloadSummary).map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between py-0.5 border-b border-foundation-100/60 last:border-b-0">
                      <span className="text-foundation-500">{key}:</span>
                      <span className="font-bold text-foundation-800">{String(val)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Drawer Footer with [Copy Hash] button */}
          <div className="p-4 border-t border-foundation-200 bg-foundation-50 flex items-center justify-between">
            <button
              onClick={handleCopyCurrent}
              className="px-4 py-2 rounded-xl bg-white border border-foundation-200 hover:bg-foundation-100 text-xs font-mono font-bold text-foundation-800 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              {copiedCurrent ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>{copiedCurrent ? 'Hash Copied' : 'Copy Hash'}</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-foundation-900 hover:bg-foundation-800 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
