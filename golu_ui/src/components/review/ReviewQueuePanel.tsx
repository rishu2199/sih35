import React, { useState, useMemo } from 'react';
import { Search, Clock, CheckCircle2, AlertTriangle, RotateCcw, Filter, Check, ShieldCheck } from 'lucide-react';
import { ReviewSessionCase, ReviewStatus } from './types';

interface ReviewQueuePanelProps {
  cases: ReviewSessionCase[];
  selectedCaseId: string;
  onSelectCase: (caseItem: ReviewSessionCase) => void;
}

type FilterTab = 'ALL' | 'PENDING_REVIEW' | 'IN_TESTING' | 'APPROVED' | 'REMANDED';

export const ReviewQueuePanel: React.FC<ReviewQueuePanelProps> = ({
  cases,
  selectedCaseId,
  onSelectCase,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('PENDING_REVIEW');

  // Counts for filter pills
  const counts = useMemo(() => {
    return {
      pending: cases.filter((c) => c.status === 'PENDING_REVIEW' || c.status === 'PENDING_DIRECTOR').length,
      inTesting: cases.filter((c) => c.status === 'IN_TESTING').length,
      approved: cases.filter((c) => c.status === 'APPROVED').length,
      remanded: cases.filter((c) => c.status === 'REMANDED').length,
      all: cases.length,
    };
  }, [cases]);

  // Filtered and searched cases
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      // Filter tab
      if (activeFilter === 'PENDING_REVIEW') {
        if (c.status !== 'PENDING_REVIEW' && c.status !== 'PENDING_DIRECTOR') return false;
      } else if (activeFilter === 'IN_TESTING') {
        if (c.status !== 'IN_TESTING') return false;
      } else if (activeFilter === 'APPROVED') {
        if (c.status !== 'APPROVED') return false;
      } else if (activeFilter === 'REMANDED') {
        if (c.status !== 'REMANDED') return false;
      }

      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        c.sessionNumber.toLowerCase().includes(q) ||
        c.serialNumber.toLowerCase().includes(q) ||
        c.manufacturer.toLowerCase().includes(q) ||
        c.model.toLowerCase().includes(q) ||
        c.accuracyClass.toLowerCase().includes(q)
      );
    });
  }, [cases, activeFilter, searchQuery]);

  return (
    <div className="flex flex-col h-full bg-white border border-foundation-200 rounded-2xl shadow-xs overflow-hidden">
      {/* Panel Header */}
      <div className="p-4 border-b border-foundation-200 bg-foundation-50/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-foundation-900 uppercase tracking-wider font-sans">
              Review Queue
            </h2>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-foundation-200 text-foundation-700">
              {filteredCases.length.toString().padStart(2, '0')}
            </span>
          </div>
          <span className="text-[11px] font-mono text-foundation-500">
            Work Queue
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foundation-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search session, serial, model..."
            className="w-full pl-9 pr-3 py-2 text-xs font-sans rounded-xl border border-foundation-200 bg-white placeholder-foundation-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-foundation-400 hover:text-foundation-600 text-xs font-bold"
            >
              ×
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveFilter('PENDING_REVIEW')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              activeFilter === 'PENDING_REVIEW'
                ? 'bg-brand-600 text-white shadow-xs font-semibold'
                : 'bg-white border border-foundation-200 text-foundation-600 hover:bg-foundation-100'
            }`}
          >
            Pending ({counts.pending.toString().padStart(2, '0')})
          </button>

          <button
            onClick={() => setActiveFilter('IN_TESTING')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              activeFilter === 'IN_TESTING'
                ? 'bg-brand-600 text-white shadow-xs font-semibold'
                : 'bg-white border border-foundation-200 text-foundation-600 hover:bg-foundation-100'
            }`}
          >
            In Testing ({counts.inTesting.toString().padStart(2, '0')})
          </button>

          <button
            onClick={() => setActiveFilter('APPROVED')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              activeFilter === 'APPROVED'
                ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                : 'bg-white border border-foundation-200 text-foundation-600 hover:bg-foundation-100'
            }`}
          >
            Approved ({counts.approved.toString().padStart(2, '0')})
          </button>

          <button
            onClick={() => setActiveFilter('REMANDED')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              activeFilter === 'REMANDED'
                ? 'bg-rose-600 text-white shadow-xs font-semibold'
                : 'bg-white border border-foundation-200 text-foundation-600 hover:bg-foundation-100'
            }`}
          >
            Remanded ({counts.remanded.toString().padStart(2, '0')})
          </button>

          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
              activeFilter === 'ALL'
                ? 'bg-foundation-800 text-white shadow-xs font-semibold'
                : 'bg-white border border-foundation-200 text-foundation-600 hover:bg-foundation-100'
            }`}
          >
            All
          </button>
        </div>
      </div>

      {/* Case Cards List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-foundation-50/20">
        {filteredCases.length === 0 ? (
          <div className="py-12 text-center text-foundation-400">
            <Filter className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs font-medium text-foundation-600">No verification cases match filter</p>
            <p className="text-[11px] text-foundation-400 mt-1">Try switching filters or search keywords</p>
          </div>
        ) : (
          filteredCases.map((c) => {
            const isSelected = c.id === selectedCaseId;

            // Status pill styling
            let statusPill = (
              <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                PENDING REVIEW
              </span>
            );

            if (c.status === 'PENDING_DIRECTOR') {
              statusPill = (
                <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse"></span>
                  DIRECTOR SIGN-OFF
                </span>
              );
            } else if (c.status === 'APPROVED') {
              statusPill = (
                <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <Check className="w-3 h-3 text-emerald-600" />
                  APPROVED
                </span>
              );
            } else if (c.status === 'REMANDED') {
              statusPill = (
                <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                  <AlertTriangle className="w-3 h-3 text-rose-600" />
                  REMANDED
                </span>
              );
            } else if (c.status === 'IN_TESTING') {
              statusPill = (
                <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-foundation-100 text-foundation-700 border border-foundation-200">
                  <Clock className="w-3 h-3 text-foundation-500" />
                  IN TESTING
                </span>
              );
            }

            return (
              <button
                key={c.id}
                onClick={() => onSelectCase(c)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-blue-50/70 border-brand-500 ring-2 ring-brand-500/20 shadow-xs'
                    : 'bg-white border-foundation-200 hover:border-foundation-300 hover:bg-foundation-50/50'
                }`}
              >
                {/* Active indicator bar */}
                {isSelected && (
                  <span className="absolute left-0 top-2.5 bottom-2.5 w-1 rounded-r-md bg-brand-600" />
                )}

                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="font-mono text-xs font-bold text-foundation-900">
                    {c.sessionNumber}
                  </span>
                  {statusPill}
                </div>

                <div className="font-semibold text-xs text-foundation-900 tracking-tight line-clamp-1">
                  {c.manufacturer} {c.model}
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-foundation-100 text-[11px] font-mono text-foundation-500">
                  <span className="font-medium text-foundation-700">
                    {c.accuracyClass} · {c.serialNumber}
                  </span>
                  <span className="font-semibold text-foundation-800">
                    {c.completedSteps} / {c.totalSteps} complete
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
