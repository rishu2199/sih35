import React, { useState } from 'react';
import {
  Check,
  Copy,
  ArrowUpRight,
  Clock,
  User,
  ShieldCheck,
  AlertTriangle,
  Lock,
  ArrowDown,
  Layers,
  FileCheck,
  Award,
  Cpu,
  FileText,
  Eye,
} from 'lucide-react';
import { AuditEvent } from './types';

interface AuditBlockCardProps {
  event: AuditEvent;
  onOpenDetails: (event: AuditEvent) => void;
  onCopyHash: (hash: string) => void;
  isCorrupted?: boolean;
  expectedHash?: string;
  receivedHash?: string;
  isAuditorMode?: boolean;
}

export const AuditBlockCard: React.FC<AuditBlockCardProps> = ({
  event,
  onOpenDetails,
  onCopyHash,
  isCorrupted = false,
  expectedHash,
  receivedHash,
  isAuditorMode = false,
}) => {
  const [copiedCurrent, setCopiedCurrent] = useState(false);

  const handleCopyCurrent = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCopyHash(event.hash);
    setCopiedCurrent(true);
    setTimeout(() => setCopiedCurrent(false), 2000);
  };

  // Format 64-char SHA-256 into clean 4-char spaced chunks for forensic monospace readability
  const formatHashChunks = (hash: string) => {
    if (!hash) return '';
    const clean = hash.trim();
    if (clean === '0000000000000000000000000000000000000000000000000000000000000000') {
      return '0000 0000 0000 0000 ... GENESIS ZERO ANCHOR';
    }
    // Show prefix + mid ellipsis + suffix with 4-char groups
    const prefix = clean.slice(0, 16).match(/.{1,4}/g)?.join(' ') || clean.slice(0, 16);
    const suffix = clean.slice(-16).match(/.{1,4}/g)?.join(' ') || clean.slice(-16);
    return `${prefix}  ...  ${suffix}`;
  };

  // Category Icon & Badge
  const getCategoryDetails = () => {
    switch (event.category) {
      case 'INSTRUMENT':
        return {
          icon: <Layers size={13} className="text-slate-600" />,
          label: '⊞ Instrument',
          badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
        };
      case 'TEST':
        return {
          icon: <Cpu size={13} className="text-blue-600" />,
          label: '◌ Test',
          badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
        };
      case 'EVIDENCE':
        return {
          icon: <Eye size={13} className="text-cyan-600" />,
          label: '▣ Evidence',
          badgeClass: 'bg-cyan-50 text-cyan-800 border-cyan-200',
        };
      case 'REVIEW':
        return {
          icon: <FileText size={13} className="text-amber-600" />,
          label: '◆ Review',
          badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
        };
      case 'APPROVAL':
        return {
          icon: <FileCheck size={13} className="text-emerald-600" />,
          label: '✓ Approval',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        };
      case 'SIGNATURE':
        return {
          icon: <Award size={13} className="text-purple-600" />,
          label: '✎ Signature',
          badgeClass: 'bg-purple-100 text-purple-900 border-purple-300 font-bold',
        };
      case 'CERTIFICATE':
        return {
          icon: <FileCheck size={13} className="text-indigo-600" />,
          label: '▤ Certificate',
          badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200',
        };
      case 'SYSTEM':
      default:
        return {
          icon: <Cpu size={13} className="text-slate-600" />,
          label: '⚙ System',
          badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
        };
    }
  };

  const cat = getCategoryDetails();
  const isDirectorSign = event.category === 'SIGNATURE' || event.action === 'DIRECTOR_SIGNED';

  return (
    <div
      onClick={() => onOpenDetails(event)}
      className={`p-5 rounded-2xl border transition-all cursor-pointer group shadow-xs ${
        isCorrupted
          ? 'bg-rose-50/70 border-rose-400 ring-2 ring-rose-500/25 hover:border-rose-500'
          : isDirectorSign
          ? 'bg-gradient-to-br from-purple-50/40 via-white to-purple-50/20 border-purple-200 hover:border-purple-300'
          : 'bg-white border-foundation-200 hover:border-foundation-300 hover:shadow-md'
      }`}
    >
      {/* 1. Header Row: Human Title & Category Badge */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold border ${cat.badgeClass}`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </span>

            {isDirectorSign && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-mono font-bold bg-purple-700 text-white shadow-xs">
                <Lock size={11} />
                <span>SESSION IMMUTABLE</span>
              </span>
            )}

            {isCorrupted && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-mono font-bold bg-rose-700 text-white animate-pulse">
                <AlertTriangle size={11} />
                <span>INTEGRITY FAILURE</span>
              </span>
            )}
          </div>

          {/* Human-Readable Event Title */}
          <h4
            className={`text-base font-bold tracking-tight font-sans ${
              isCorrupted
                ? 'text-rose-950'
                : isDirectorSign
                ? 'text-purple-950 group-hover:text-purple-700'
                : 'text-foundation-900 group-hover:text-brand-600'
            }`}
          >
            {event.title}
          </h4>

          {/* Secondary Technical Event ID */}
          <div className="flex items-center gap-2 mt-0.5 text-xs font-mono text-foundation-500">
            <span className="font-bold text-foundation-800">{event.id}</span>
            <span>•</span>
            <span>Block #{event.blockNumber}</span>
            <span>•</span>
            <span className="font-sans italic text-foundation-600">{event.statutoryReference}</span>
          </div>
        </div>

        {/* Timestamp */}
        <div className="text-right shrink-0">
          <div className="flex items-center justify-end gap-1.5 text-xs font-mono font-semibold text-foundation-700">
            <Clock size={12} className="text-foundation-400" />
            <span>{event.timeFormatted} IST</span>
          </div>
          <div className="text-[11px] font-mono text-foundation-400 mt-0.5">{event.dateFormatted}</div>
        </div>
      </div>

      {/* 2. Actor Attribution & Action Description */}
      <div className="mt-3.5 pt-3 border-t border-foundation-100 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
              isDirectorSign
                ? 'bg-purple-200 text-purple-900'
                : 'bg-foundation-200 text-foundation-700'
            }`}
          >
            <User size={13} />
          </div>
          <div>
            <span className="font-bold text-foundation-900">{event.actor}</span>
            <span className="text-foundation-400 mx-1.5">•</span>
            <span
              className={`font-mono text-[11px] font-semibold ${
                isDirectorSign ? 'text-purple-700' : 'text-foundation-600'
              }`}
            >
              {event.role}
            </span>
          </div>
        </div>

        <span className="font-mono text-[11px] text-foundation-500 bg-foundation-50 px-2 py-0.5 rounded border border-foundation-200">
          {event.sessionId}
        </span>
      </div>

      <p className="text-xs text-foundation-600 mt-2 leading-relaxed font-sans">
        {event.details}
      </p>

      {/* 3. Monospace SHA-256 Block Hash Card */}
      <div
        className={`mt-4 p-3.5 rounded-xl border text-xs font-mono transition-all ${
          isCorrupted
            ? 'bg-rose-950 text-rose-100 border-rose-800'
            : isDirectorSign
            ? 'bg-slate-950 text-slate-200 border-purple-900/60'
            : 'bg-slate-900 text-slate-200 border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 uppercase font-bold tracking-wider">
              SHA-256 Cryptographic Link
            </span>
            <span className="text-[10px] text-slate-500 font-normal">(Monospace Block)</span>
          </div>

          <div className="flex items-center gap-2">
            {isCorrupted ? (
              <span className="px-2 py-0.5 rounded bg-rose-900 text-rose-200 font-bold text-[10px] flex items-center gap-1">
                <AlertTriangle size={11} />
                <span>✕ BROKEN LINK DETECTED</span>
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold text-[10px] flex items-center gap-1">
                <ShieldCheck size={11} />
                <span>✓ CHAIN LINK VALID</span>
              </span>
            )}

            <button
              type="button"
              onClick={handleCopyCurrent}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Copy current SHA-256 block hash"
            >
              {copiedCurrent ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            </button>
          </div>
        </div>

        {/* Previous Hash -> Current Hash relationship */}
        <div className="space-y-2 select-all">
          <div>
            <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
              <span>PREVIOUS HASH</span>
              <ArrowDown size={11} className="text-slate-500" />
            </div>
            <div className="text-[11px] text-slate-400 tracking-wide mt-0.5">
              {formatHashChunks(event.previousHash)}
            </div>
          </div>

          <div>
            <div className="text-[10px] text-slate-400 font-bold">CURRENT BLOCK HASH</div>
            <div
              className={`text-[11px] tracking-wide font-semibold mt-0.5 ${
                isCorrupted ? 'text-rose-300 font-bold underline' : 'text-emerald-400'
              }`}
            >
              {isCorrupted && receivedHash
                ? formatHashChunks(receivedHash)
                : formatHashChunks(event.hash)}
            </div>
          </div>

          {/* Tamper Comparison Callout if corrupted */}
          {isCorrupted && expectedHash && (
            <div className="pt-2 mt-2 border-t border-rose-900/80 text-[10px] space-y-1">
              <div className="text-rose-300 font-bold">TAMPER AUDIT DISCREPANCY:</div>
              <div className="text-slate-400 truncate">
                Expected: <span className="text-emerald-400 font-mono">{expectedHash.slice(0, 24)}...</span>
              </div>
              <div className="text-rose-200 truncate">
                Received: <span className="text-rose-400 font-mono">{receivedHash?.slice(0, 24)}...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Card Bottom Trigger */}
      <div className="flex items-center justify-between mt-3 text-xs">
        <span className="font-mono text-[11px] text-foundation-500">
          {Object.keys(event.payloadSummary).length} metadata fields logged
        </span>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetails(event);
          }}
          className={`font-semibold flex items-center gap-1 font-sans transition-colors ${
            isDirectorSign
              ? 'text-purple-700 hover:text-purple-800'
              : 'text-brand-600 hover:text-brand-700'
          }`}
        >
          <span>View details</span>
          <ArrowUpRight size={13} />
        </button>
      </div>
    </div>
  );
};
