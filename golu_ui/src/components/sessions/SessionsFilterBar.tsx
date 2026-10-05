import React, { useState } from 'react';
import {
  Search,
  ChevronDown,
  ArrowUpDown,
  Check,
  Filter,
  X,
} from 'lucide-react';
import { SessionTestingStatus } from './types';

export type SessionSortOption =
  | 'RECENT'
  | 'ATTENTION_FIRST'
  | 'PROGRESS'
  | 'NEWEST'
  | 'OLDEST'
  | 'INSTRUMENT_ID';

export type FilterStatusTab =
  | 'ALL'
  | 'IN_TESTING'
  | 'ACTION_REQUIRED'
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'REMANDED';

interface SessionsFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: FilterStatusTab;
  onStatusFilterChange: (status: FilterStatusTab) => void;
  classFilter: string;
  onClassFilterChange: (cls: string) => void;
  stageFilter: string;
  onStageFilterChange: (stage: string) => void;
  sortBy: SessionSortOption;
  onSortByChange: (sort: SessionSortOption) => void;
  counts: {
    total: number;
    inTesting: number;
    needsAttention: number;
    pendingReview: number;
    approved: number;
    remanded: number;
  };
}

export const SessionsFilterBar: React.FC<SessionsFilterBarProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  classFilter,
  onClassFilterChange,
  stageFilter,
  onStageFilterChange,
  sortBy,
  onSortByChange,
  counts,
}) => {
  const [isSortOpen, setIsSortOpen] = useState<boolean>(false);
  const [isClassOpen, setIsClassOpen] = useState<boolean>(false);
  const [isStageOpen, setIsStageOpen] = useState<boolean>(false);

  const sortLabels: Record<SessionSortOption, string> = {
    RECENT: 'Most Recently Updated',
    ATTENTION_FIRST: 'Needs Attention First',
    PROGRESS: 'Progress (Highest)',
    NEWEST: 'Newest First',
    OLDEST: 'Oldest First',
    INSTRUMENT_ID: 'Instrument ID',
  };

  const statusTabs: { id: FilterStatusTab; label: string; count: number }[] = [
    { id: 'ALL', label: 'All', count: counts.total },
    { id: 'IN_TESTING', label: 'In Testing', count: counts.inTesting },
    { id: 'ACTION_REQUIRED', label: 'Needs Attention', count: counts.needsAttention },
    { id: 'PENDING_REVIEW', label: 'Pending Review', count: counts.pendingReview },
    { id: 'APPROVED', label: 'Approved', count: counts.approved },
    { id: 'REMANDED', label: 'Remanded', count: counts.remanded },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-[#E4E8EF] dark:border-slate-800 p-5 shadow-xs space-y-4 select-none">
      {/* 1. Status Filter Segmented Controls (§4) */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl overflow-x-auto">
        {statusTabs.map((tab) => {
          const isActive = statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onStatusFilterChange(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md font-semibold ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. Search & Secondary Filters Row (§5 & §6) */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800">
        {/* Search Input (§5) */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search serial number, model or session ID..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-2.5 p-1 rounded-md text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Secondary Dropdown Filters (§6) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Accuracy Class Filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsClassOpen(!isClassOpen);
                setIsSortOpen(false);
                setIsStageOpen(false);
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <span className="text-slate-400 font-mono text-[10px]">Class:</span>
              <span>{classFilter === 'ALL' ? 'All Classes' : classFilter}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isClassOpen && (
              <div className="absolute right-0 top-10 w-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl py-1.5 z-20 text-xs animate-in fade-in duration-100">
                {['ALL', 'Class I', 'Class II', 'Class III', 'Class IIII'].map((cls) => (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => {
                      onClassFilterChange(cls);
                      setIsClassOpen(false);
                    }}
                    className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer"
                  >
                    <span>{cls === 'ALL' ? 'All Classes' : cls}</span>
                    {classFilter === cls && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Verification Stage Filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsStageOpen(!isStageOpen);
                setIsSortOpen(false);
                setIsClassOpen(false);
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <span className="text-slate-400 font-mono text-[10px]">Stage:</span>
              <span className="truncate max-w-[110px]">{stageFilter === 'ALL' ? 'All Stages' : stageFilter}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isStageOpen && (
              <div className="absolute right-0 top-10 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl py-1.5 z-20 text-xs animate-in fade-in duration-100">
                {['ALL', 'Initial Type Approval', 'Subsequent Verification', 'In-Service Inspection'].map((stg) => (
                  <button
                    key={stg}
                    type="button"
                    onClick={() => {
                      onStageFilterChange(stg);
                      setIsStageOpen(false);
                    }}
                    className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer"
                  >
                    <span className="truncate">{stg === 'ALL' ? 'All Stages' : stg}</span>
                    {stageFilter === stg && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort Control (§6, §13) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsSortOpen(!isSortOpen);
                setIsClassOpen(false);
                setIsStageOpen(false);
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span>{sortLabels[sortBy]}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isSortOpen && (
              <div className="absolute right-0 top-10 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl py-1.5 z-20 text-xs animate-in fade-in duration-100">
                {(
                  [
                    'RECENT',
                    'ATTENTION_FIRST',
                    'PROGRESS',
                    'NEWEST',
                    'OLDEST',
                    'INSTRUMENT_ID',
                  ] as SessionSortOption[]
                ).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      onSortByChange(opt);
                      setIsSortOpen(false);
                    }}
                    className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer"
                  >
                    <span>{sortLabels[opt]}</span>
                    {sortBy === opt && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
