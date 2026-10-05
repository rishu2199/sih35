import React, { useState } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  PlusCircle,
  FileText,
  Calendar,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { StandardWeightSet, WeightAccuracyClass, StandardValidityStatus } from './types';

interface StandardRegistryTableProps {
  standards: StandardWeightSet[];
  selectedStandardId: string;
  onSelectStandard: (standardId: string) => void;
  classFilter: WeightAccuracyClass | 'ALL';
  onClearClassFilter: () => void;
  onRegisterNewStandard?: () => void;
}

export const StandardRegistryTable: React.FC<StandardRegistryTableProps> = ({
  standards,
  selectedStandardId,
  onSelectStandard,
  classFilter,
  onClearClassFilter,
  onRegisterNewStandard,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | StandardValidityStatus>('ALL');

  // Filter logic
  const filteredStandards = standards.filter((s) => {
    // Class filter
    if (classFilter !== 'ALL' && s.accuracyClass !== classFilter) return false;

    // Status filter
    if (statusFilter !== 'ALL' && s.status !== statusFilter) return false;

    // Search query
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      const matchId = s.id.toLowerCase().includes(q);
      const matchCert = s.certificateNumber.toLowerCase().includes(q);
      const matchName = s.setName.toLowerCase().includes(q);
      const matchClass = s.accuracyClass.toLowerCase().includes(q);
      if (!matchId && !matchCert && !matchName && !matchClass) return false;
    }

    return true;
  });

  return (
    <div className="bg-white rounded-xl border border-foundation-200 shadow-xs overflow-hidden select-none font-mono">
      {/* Table Header with Search and Filter Pills */}
      <div className="p-4 sm:p-5 border-b border-foundation-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foundation-900 tracking-tight font-sans">
              STANDARD WEIGHT REGISTRY
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-foundation-100 text-foundation-700 font-semibold">
              {filteredStandards.length} of {standards.length} sets
            </span>
            {classFilter !== 'ALL' && (
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-brand-100 text-brand-800 flex items-center gap-1">
                <span>Class {classFilter}</span>
                <button
                  type="button"
                  onClick={onClearClassFilter}
                  className="hover:text-brand-950 font-bold ml-1 cursor-pointer"
                >
                  ×
                </button>
              </span>
            )}
          </div>
          <p className="text-xs text-foundation-500 font-sans mt-0.5">
            Active reference standards accredited under OIML R 111-1 weight tolerances.
          </p>
        </div>

        {/* Controls: Search + Filter Pills */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative w-full sm:w-60">
            <Search size={14} className="absolute left-3 top-2.5 text-foundation-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search set ID, cert..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-foundation-50 border border-foundation-200 rounded-lg text-foundation-900 placeholder:text-foundation-400 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center p-1 bg-foundation-100/70 rounded-lg border border-foundation-200 text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                statusFilter === 'ALL'
                  ? 'bg-white text-foundation-900 font-bold shadow-xs'
                  : 'text-foundation-600 hover:text-foundation-900'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('VALID')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                statusFilter === 'VALID'
                  ? 'bg-white text-emerald-800 font-bold shadow-xs'
                  : 'text-foundation-600 hover:text-foundation-900'
              }`}
            >
              Valid
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('EXPIRING')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                statusFilter === 'EXPIRING'
                  ? 'bg-white text-amber-800 font-bold shadow-xs'
                  : 'text-foundation-600 hover:text-foundation-900'
              }`}
            >
              Expiring
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('EXPIRED')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                statusFilter === 'EXPIRED'
                  ? 'bg-white text-rose-800 font-bold shadow-xs'
                  : 'text-foundation-600 hover:text-foundation-900'
              }`}
            >
              Expired
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Content */}
      {filteredStandards.length === 0 ? (
        /* Empty State (Section 21) */
        <div className="p-12 text-center select-none font-sans">
          <div className="w-12 h-12 rounded-full bg-foundation-100 flex items-center justify-center mx-auto text-foundation-400 mb-3">
            <Layers size={22} />
          </div>
          <h4 className="text-sm font-bold text-foundation-900">No standard weights found</h4>
          <p className="text-xs text-foundation-500 max-w-sm mx-auto mt-1 font-mono">
            {searchTerm || statusFilter !== 'ALL' || classFilter !== 'ALL'
              ? 'No registered standards match the active search or class filter criteria.'
              : 'Add a laboratory reference standard to enable traceable verification.'}
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            {(searchTerm || statusFilter !== 'ALL' || classFilter !== 'ALL') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('ALL');
                  onClearClassFilter();
                }}
                className="px-3.5 py-1.5 rounded-lg border border-foundation-200 text-xs font-mono font-semibold text-foundation-700 hover:bg-foundation-50 cursor-pointer"
              >
                Clear Filters
              </button>
            )}
            <button
              type="button"
              onClick={onRegisterNewStandard}
              className="px-4 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-mono font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <PlusCircle size={13} />
              <span>+ Register Standard</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-foundation-50/75 border-b border-foundation-200 text-[11px] text-foundation-500 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-4">Set ID</th>
                <th className="py-2.5 px-3">Class</th>
                <th className="py-2.5 px-3">Mass Range</th>
                <th className="py-2.5 px-3">Calibration Certificate</th>
                <th className="py-2.5 px-3">Validity Countdown</th>
                <th className="py-2.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foundation-100">
              {filteredStandards.map((std) => {
                const isSelected = std.id === selectedStandardId;
                const isExpired = std.status === 'EXPIRED';
                const isExpiring = std.status === 'EXPIRING';

                return (
                  <tr
                    key={std.id}
                    onClick={() => onSelectStandard(std.id)}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-brand-50/70 border-l-4 border-l-brand-600 font-medium'
                        : isExpired
                        ? 'bg-rose-50/40 hover:bg-rose-50/70'
                        : isExpiring
                        ? 'bg-amber-50/30 hover:bg-amber-50/60'
                        : 'hover:bg-foundation-50/60'
                    }`}
                  >
                    {/* Set ID */}
                    <td className="py-3 px-4 font-bold text-foundation-950 flex items-center gap-2">
                      <span className="underline decoration-foundation-300 underline-offset-2">
                        {std.id}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] px-1.5 py-0.2 bg-brand-100 text-brand-800 rounded font-semibold">
                          Active
                        </span>
                      )}
                    </td>

                    {/* Class */}
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-xs ${
                          std.accuracyClass === 'E1'
                            ? 'bg-purple-100 text-purple-900 border border-purple-200'
                            : std.accuracyClass === 'E2'
                            ? 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                            : std.accuracyClass === 'F1'
                            ? 'bg-blue-100 text-blue-900 border border-blue-200'
                            : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                        }`}
                      >
                        {std.accuracyClass}
                      </span>
                    </td>

                    {/* Mass Range */}
                    <td className="py-3 px-3 text-foundation-800">
                      <div>{std.massRange}</div>
                      <span className="text-[10px] text-foundation-400 block">
                        {std.piecesCount} weights in set
                      </span>
                    </td>

                    {/* Certificate */}
                    <td className="py-3 px-3 text-foundation-700">
                      <div className="flex items-center gap-1">
                        <FileText size={12} className="text-foundation-400" />
                        <span className="font-semibold">{std.certificateNumber}</span>
                      </div>
                      <span className="text-[10px] text-foundation-400 block truncate max-w-[180px]">
                        {std.laboratory}
                      </span>
                    </td>

                    {/* Validity Countdown (Section 10) */}
                    <td className="py-3 px-3">
                      {isExpired ? (
                        <div>
                          <span className="font-black text-rose-700 text-xs">
                            EXPIRED
                          </span>
                          <span className="text-[10px] text-rose-500 block">
                            Expired {Math.abs(std.daysRemaining)} days ago
                          </span>
                        </div>
                      ) : isExpiring ? (
                        <div>
                          <span className="font-black text-amber-800 text-xs">
                            {std.daysRemaining} days
                          </span>
                          <span className="text-[10px] text-amber-600 block">
                            Valid until {std.validUntilDate}
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span className="font-bold text-foundation-900 text-xs">
                            {std.daysRemaining} days
                          </span>
                          <span className="text-[10px] text-foundation-400 block">
                            Valid until {std.validUntilDate}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                          isExpired
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : isExpiring
                            ? 'bg-amber-100 text-amber-900 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {isExpired ? (
                          <XCircle size={12} />
                        ) : isExpiring ? (
                          <AlertTriangle size={12} />
                        ) : (
                          <CheckCircle2 size={12} />
                        )}
                        <span>{std.status}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
