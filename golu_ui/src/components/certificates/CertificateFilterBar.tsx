import React from 'react';
import { Search, ChevronDown, Check, Globe, SlidersHorizontal } from 'lucide-react';
import { CertificateLanguage } from './types';

interface CertificateFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  language: CertificateLanguage;
  onLanguageChange: (lang: CertificateLanguage) => void;
  activeFilter: string;
  onFilterChange: (f: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  totalCount: number;
}

export const CertificateFilterBar: React.FC<CertificateFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  language,
  onLanguageChange,
  activeFilter,
  onFilterChange,
  sortBy,
  onSortChange,
  totalCount,
}) => {
  return (
    <div className="bg-white border border-foundation-200 rounded-2xl p-5 shadow-xs space-y-4 font-sans">
      {/* 1. Top Row: Prominent Search (Section 4) & Segmented Language Selector (Section 5) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-foundation-100">
        {/* Prominent Search Bar */}
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foundation-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="⌕ Search certificate ID, serial number or instrument model... (e.g. CERT-2026-000184, AV-2026-8812)"
            className="w-full pl-10 pr-8 py-2.5 text-xs font-mono rounded-xl border border-foundation-200 bg-white placeholder-foundation-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-foundation-400 hover:text-foundation-600 text-xs font-bold p-0.5 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Segmented Language Selector (Section 5: English | हिन्दी | Bilingual) */}
        <div className="flex items-center gap-2 self-start lg:self-center">
          <span className="text-[10px] font-bold text-foundation-500 uppercase tracking-wider font-mono flex items-center gap-1">
            <Globe size={13} className="text-foundation-400" />
            <span>Language:</span>
          </span>

          <div className="flex items-center p-1 bg-foundation-100 rounded-xl border border-foundation-200">
            <button
              type="button"
              onClick={() => onLanguageChange('en')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                language === 'en'
                  ? 'bg-white text-foundation-900 shadow-xs font-bold'
                  : 'text-foundation-600 hover:text-foundation-900'
              }`}
            >
              English
            </button>

            <button
              type="button"
              onClick={() => onLanguageChange('hi')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                language === 'hi'
                  ? 'bg-white text-foundation-900 shadow-xs font-bold'
                  : 'text-foundation-600 hover:text-foundation-900'
              }`}
            >
              हिन्दी
            </button>

            <button
              type="button"
              onClick={() => onLanguageChange('bilingual')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                language === 'bilingual'
                  ? 'bg-brand-600 text-white shadow-xs font-bold'
                  : 'text-foundation-600 hover:text-foundation-900'
              }`}
            >
              <span>Bilingual</span>
              <span className={`text-[10px] font-mono ${language === 'bilingual' ? 'text-white/80' : 'text-foundation-400'}`}>
                (Dual-Col)
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Bottom Row: Filter Pills (Section 17) & Sort Dropdown (Section 18) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-0.5">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => onFilterChange('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeFilter === 'ALL'
                ? 'bg-foundation-900 text-white shadow-xs font-semibold'
                : 'bg-foundation-50 border border-foundation-200 text-foundation-600 hover:bg-foundation-100'
            }`}
          >
            All Certificates ({totalCount})
          </button>

          <button
            onClick={() => onFilterChange('VERIFIED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeFilter === 'VERIFIED'
                ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                : 'bg-foundation-50 border border-foundation-200 text-foundation-600 hover:bg-foundation-100'
            }`}
          >
            Verified Only
          </button>

          <button
            onClick={() => onFilterChange('RECENT')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeFilter === 'RECENT'
                ? 'bg-brand-600 text-white shadow-xs font-semibold'
                : 'bg-foundation-50 border border-foundation-200 text-foundation-600 hover:bg-foundation-100'
            }`}
          >
            Recent (48 hrs)
          </button>

          <button
            onClick={() => onFilterChange('CLASS_III')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeFilter === 'CLASS_III'
                ? 'bg-foundation-800 text-white shadow-xs font-semibold'
                : 'bg-foundation-50 border border-foundation-200 text-foundation-600 hover:bg-foundation-100'
            }`}
          >
            Class III (Commercial)
          </button>

          <button
            onClick={() => onFilterChange('CLASS_I')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeFilter === 'CLASS_I'
                ? 'bg-foundation-800 text-white shadow-xs font-semibold'
                : 'bg-foundation-50 border border-foundation-200 text-foundation-600 hover:bg-foundation-100'
            }`}
          >
            Class I (Analytical)
          </button>
        </div>

        {/* Sort Select (Section 18) */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <span className="text-xs font-mono text-foundation-500">Sort:</span>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 rounded-xl border border-foundation-200 bg-white text-xs font-bold text-foundation-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-xs"
            >
              <option value="newest">Latest issued ▾</option>
              <option value="oldest">Oldest issued</option>
              <option value="certId">Certificate ID</option>
              <option value="instrument">Instrument Name</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foundation-400 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};
