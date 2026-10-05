import React from 'react';
import {
  Search,
  ChevronDown,
  Copy,
  Download,
  Check,
  Lock,
  Database,
  Layers,
  Calendar,
  UserCheck,
} from 'lucide-react';
import { MOCK_AUDIT_SESSIONS } from './mockAuditData';
import { AuditSessionScope } from './types';

interface AuditScopeSelectorProps {
  selectedSessionId: string;
  onSelectSessionId: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  selectedActor: string;
  onSelectActor: (actor: string) => void;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onCopyHash: () => void;
  onExportAudit: () => void;
  isHashCopied: boolean;
  isAuditorMode?: boolean;
}

export const AuditScopeSelector: React.FC<AuditScopeSelectorProps> = ({
  selectedSessionId,
  onSelectSessionId,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  selectedActor,
  onSelectActor,
  selectedDate,
  onSelectDate,
  onCopyHash,
  onExportAudit,
  isHashCopied,
  isAuditorMode = false,
}) => {
  const activeSessionMeta =
    MOCK_AUDIT_SESSIONS.find((s) => s.id === selectedSessionId) || MOCK_AUDIT_SESSIONS[0];

  const categories = [
    { id: 'ALL', label: 'All Events' },
    { id: 'TEST', label: 'Tests' },
    { id: 'REVIEW', label: 'Review' },
    { id: 'SIGNATURE', label: 'Signature' },
    { id: 'CERTIFICATE', label: 'Certificate' },
    { id: 'SYSTEM', label: 'System' },
  ];

  const actors = [
    { id: 'ALL', label: 'All Actors' },
    { id: 'Shashi Shekhar', label: 'Shashi Shekhar (Metrologist)' },
    { id: 'R. Kumar', label: 'R. Kumar (Reviewer)' },
    { id: 'Dr. S. Sharma', label: 'Dr. S. Sharma (Lab Director)' },
    { id: 'Standards Calibration Lab', label: 'Standards Lab' },
    { id: 'METROLOGIX Core', label: 'System Automation' },
  ];

  const dates = [
    { id: 'ALL', label: 'All Dates' },
    { id: 'TODAY', label: '04 Oct 2026 (Today)' },
    { id: 'YESTERDAY', label: '03 Oct 2026' },
  ];

  return (
    <div className="bg-white border border-foundation-200 rounded-2xl p-5 shadow-xs space-y-4">
      {/* 1. Contextual Session Selector & Immutability Ribbon */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-foundation-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-foundation-500 uppercase tracking-wider font-mono">
              Audit Scope
            </span>
            {activeSessionMeta.isImmutable && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.2 rounded bg-purple-100 text-purple-900 border border-purple-200">
                <Lock size={10} />
                <span>SESSION IMMUTABLE</span>
              </span>
            )}
            {activeSessionMeta.isSystemLedger && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.2 rounded bg-slate-100 text-slate-800 border border-slate-200">
                <Database size={10} />
                <span>CENTRAL SYSTEM AUDIT</span>
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <select
                value={selectedSessionId}
                onChange={(e) => onSelectSessionId(e.target.value)}
                className="appearance-none pl-3.5 pr-9 py-2 rounded-xl border border-foundation-200 bg-foundation-50 hover:bg-foundation-100 text-xs font-bold text-foundation-900 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-mono shadow-xs"
              >
                {MOCK_AUDIT_SESSIONS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foundation-400 pointer-events-none" />
            </div>

            <div className="text-xs text-foundation-600 font-sans hidden sm:block">
              <span className="font-bold text-foundation-800">{activeSessionMeta.instrument}</span>
              <span className="text-foundation-400 mx-1.5">•</span>
              <span className="font-mono text-foundation-700">{activeSessionMeta.accuracyClass}</span>
              <span className="text-foundation-400 mx-1.5">•</span>
              <span className="font-mono text-foundation-500">{activeSessionMeta.capacity}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons: Copy Hash & Export Record */}
        <div className="flex items-center gap-2 self-start lg:self-center">
          <button
            onClick={onCopyHash}
            className="px-3 py-2 rounded-xl border border-foundation-200 bg-white hover:bg-foundation-50 text-xs font-mono font-semibold text-foundation-700 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="Copy latest verified SHA-256 block hash"
          >
            {isHashCopied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
            <span>{isHashCopied ? 'Hash Copied' : 'Copy Head Hash'}</span>
          </button>

          <button
            onClick={onExportAudit}
            className="px-3.5 py-2 rounded-xl border border-foundation-200 bg-white hover:bg-foundation-50 text-xs font-semibold text-foundation-700 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="Export forensic JSON audit ledger"
          >
            <Download size={13} className="text-foundation-500" />
            <span>Export Audit Record</span>
          </button>
        </div>
      </div>

      {/* 2. Search & Category Filters (Section 5 & 19) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foundation-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search event, actor, action or hash... (e.g. reviewer, director, 7d91)"
            className="w-full pl-9 pr-8 py-2 text-xs font-sans rounded-xl border border-foundation-200 bg-white placeholder-foundation-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-foundation-400 hover:text-foundation-600 text-xs font-bold p-0.5"
            >
              ✕
            </button>
          )}
        </div>

        {/* Actor and Date dropdowns */}
        <div className="flex items-center gap-2">
          {/* Actor Filter */}
          <div className="relative">
            <select
              value={selectedActor}
              onChange={(e) => onSelectActor(e.target.value)}
              className="appearance-none pl-3 pr-7 py-2 rounded-xl border border-foundation-200 bg-foundation-50 hover:bg-foundation-100 text-xs font-semibold text-foundation-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              {actors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foundation-400 pointer-events-none" />
          </div>

          {/* Date Filter */}
          <div className="relative">
            <select
              value={selectedDate}
              onChange={(e) => onSelectDate(e.target.value)}
              className="appearance-none pl-3 pr-7 py-2 rounded-xl border border-foundation-200 bg-foundation-50 hover:bg-foundation-100 text-xs font-semibold text-foundation-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              {dates.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foundation-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 3. Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelectCategory(c.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === c.id
                ? 'bg-foundation-900 text-white shadow-xs font-semibold'
                : 'bg-foundation-50 border border-foundation-200 text-foundation-600 hover:bg-foundation-100'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
};
