import React, { useState, useMemo } from 'react';
import {
  Scale,
  ShieldCheck,
  RefreshCw,
  PlusCircle,
  FileText,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  Lock,
  ArrowLeft,
  CheckCircle2,
  Search,
  Filter,
  SlidersHorizontal,
  XCircle,
  UserCheck,
  Check,
} from 'lucide-react';
import {
  StandardWeightSet,
  WeightAccuracyClass,
  INITIAL_STANDARD_WEIGHTS,
} from '../standards/types';
import { TraceabilityStatusBanner } from '../standards/TraceabilityStatusBanner';
import { StandardWeightCard } from '../standards/StandardWeightCard';
import { StandardDetailDrawer } from '../standards/StandardDetailDrawer';
import { CertificateViewerModal } from '../standards/CertificateViewerModal';
import { HardLockoutModal } from '../standards/HardLockoutModal';
import { AddStandardSetModal } from '../standards/AddStandardSetModal';

interface StandardsTraceabilityViewProps {
  standards: StandardWeightSet[];
  onUpdateStandards: (newStandards: StandardWeightSet[]) => void;
  onBackToDashboard: () => void;
}

type FilterCategory = 'ALL' | 'E1' | 'E2' | 'F1' | 'M1' | 'EXPIRING' | 'EXPIRED';
type SortOption = 'EXPIRY_ASC' | 'CLASS_ASC' | 'ID_ASC' | 'DAYS_ASC';
type UserRole = 'ADMIN' | 'METROLOGIST' | 'REVIEWER';

export const StandardsTraceabilityView: React.FC<StandardsTraceabilityViewProps> = ({
  standards,
  onUpdateStandards,
  onBackToDashboard,
}) => {
  // Navigation / Filter State
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('EXPIRY_ASC');
  const [userRole, setUserRole] = useState<UserRole>('METROLOGIST');

  // Modals & Drawer State
  const [selectedDrawerStandard, setSelectedDrawerStandard] = useState<StandardWeightSet | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [viewingCertStandard, setViewingCertStandard] = useState<StandardWeightSet | null>(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isLockoutModalOpen, setIsLockoutModalOpen] = useState<boolean>(false);
  const [lockoutTargetStandard, setLockoutTargetStandard] = useState<StandardWeightSet | null>(null);

  // Toast / feedback message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active Session reference
  const activeSessionId = 'VR-2026-00418';

  // Counts for summary metrics (§25) and filter pills (§5)
  const totalCount = standards.length;
  const validCount = standards.filter((s) => s.status === 'VALID').length;
  const expiringCount = standards.filter((s) => s.status === 'EXPIRING').length;
  const expiredCount = standards.filter((s) => s.status === 'EXPIRED').length;
  const e1Count = standards.filter((s) => s.accuracyClass === 'E1').length;
  const e2Count = standards.filter((s) => s.accuracyClass === 'E2').length;
  const f1Count = standards.filter((s) => s.accuracyClass === 'F1').length;
  const m1Count = standards.filter((s) => s.accuracyClass === 'M1').length;

  // Identify currently assigned standard
  const currentlyAssignedStandard = standards.find(
    (s) => s.isCurrentlyAssigned || s.assignedToSessionId === activeSessionId
  );

  // Show Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filter & Search Logic
  const filteredStandards = useMemo(() => {
    let result = [...standards];

    // Filter by Category
    if (filterCategory === 'E1' || filterCategory === 'E2' || filterCategory === 'F1' || filterCategory === 'M1') {
      result = result.filter((s) => s.accuracyClass === filterCategory);
    } else if (filterCategory === 'EXPIRING') {
      result = result.filter((s) => s.status === 'EXPIRING');
    } else if (filterCategory === 'EXPIRED') {
      result = result.filter((s) => s.status === 'EXPIRED');
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.id.toLowerCase().includes(q) ||
          s.setName.toLowerCase().includes(q) ||
          s.certificateNumber.toLowerCase().includes(q) ||
          s.accuracyClass.toLowerCase().includes(q) ||
          s.laboratory.toLowerCase().includes(q)
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'EXPIRY_ASC' || sortBy === 'DAYS_ASC') {
        return a.daysRemaining - b.daysRemaining;
      }
      if (sortBy === 'CLASS_ASC') {
        const order: Record<WeightAccuracyClass, number> = { E1: 1, E2: 2, F1: 3, M1: 4 };
        return order[a.accuracyClass] - order[b.accuracyClass];
      }
      if (sortBy === 'ID_ASC') {
        return a.id.localeCompare(b.id);
      }
      return 0;
    });

    return result;
  }, [standards, filterCategory, searchQuery, sortBy]);

  // Operational Actions: Select for Testing (§12, §16)
  const handleSelectForTesting = (standard: StandardWeightSet) => {
    if (standard.status === 'EXPIRED') {
      // Trigger hard lockout modal
      setLockoutTargetStandard(standard);
      setIsLockoutModalOpen(true);
      return;
    }

    // Update standards list so standard is assigned to active session
    const updated = standards.map((s) => {
      if (s.id === standard.id) {
        return {
          ...s,
          isCurrentlyAssigned: true,
          assignedToSessionId: activeSessionId,
        };
      }
      return {
        ...s,
        isCurrentlyAssigned: false,
        assignedToSessionId: s.assignedToSessionId === activeSessionId ? undefined : s.assignedToSessionId,
      };
    });

    onUpdateStandards(updated);
    showToast(`✓ Standard selected: ${standard.id} is now assigned to ${activeSessionId}.`);
  };

  // Replace Standard / Resolve Lockout (§18)
  const handleResolveLockout = (newStandard: StandardWeightSet) => {
    const updated = standards.map((s) => {
      if (s.id === newStandard.id) {
        return {
          ...s,
          isCurrentlyAssigned: true,
          assignedToSessionId: activeSessionId,
        };
      }
      return {
        ...s,
        isCurrentlyAssigned: false,
        assignedToSessionId: s.assignedToSessionId === activeSessionId ? undefined : s.assignedToSessionId,
      };
    });

    onUpdateStandards(updated);
    setIsLockoutModalOpen(false);
    setLockoutTargetStandard(null);
    showToast(`✓ Lockout resolved: ${newStandard.id} assigned to ${activeSessionId}. Testing unlocked.`);
  };

  // Add Standard Set (Admin §20)
  const handleAddStandard = (newStandard: StandardWeightSet) => {
    onUpdateStandards([newStandard, ...standards]);
    showToast(`✓ Standard set ${newStandard.id} registered successfully.`);
  };

  // Renew Standard (Demo sandbox action)
  const handleRenewStandard = (standardId: string) => {
    const updated = standards.map((s) => {
      if (s.id === standardId) {
        return {
          ...s,
          status: 'VALID' as const,
          daysRemaining: 365,
          calibrationDate: '04 Oct 2026',
          validUntilDate: '04 Oct 2027',
          certificateNumber: `NABL-2026-RNW-${s.id}`,
        };
      }
      return s;
    });
    onUpdateStandards(updated);
    showToast(`✓ Standard ${standardId} renewed for 365 days.`);
  };

  // Demo Presets (§31)
  const handlePresetAllValid = () => {
    const updated = standards.map((s) => ({
      ...s,
      status: 'VALID' as const,
      daysRemaining: Math.max(45, s.daysRemaining > 0 ? s.daysRemaining : 120),
      validUntilDate: '15 Feb 2027',
    }));
    onUpdateStandards(updated);
    showToast('Simulation: All laboratory reference standards set to VALID.');
  };

  const handlePresetExpiringNotice = () => {
    const updated = standards.map((s) => {
      if (s.id === 'F1-008') {
        return {
          ...s,
          status: 'EXPIRING' as const,
          daysRemaining: 5,
          validUntilDate: '09 Oct 2026',
        };
      }
      return s;
    });
    onUpdateStandards(updated);
    setFilterCategory('EXPIRING');
    showToast('Simulation: F1-008 set to EXPIRING (5 days remaining).');
  };

  const handlePresetTriggerLockout = () => {
    // Make M1-003 assigned to active session and trigger lockout
    const m1 = standards.find((s) => s.id === 'M1-003') || {
      id: 'M1-003',
      accuracyClass: 'M1' as const,
      setName: 'Class M1 Heavy Cast Iron Set',
      massRange: '1 kg – 50 kg',
      piecesCount: 10,
      piecesList: ['1 kg', '2 kg', '5 kg', '10 kg', '20 kg', '50 kg'],
      certificateNumber: 'NABL-2025-M1-003',
      calibrationDate: '02 Oct 2025',
      validUntilDate: '02 Oct 2026',
      daysRemaining: -2,
      status: 'EXPIRED' as const,
      laboratory: 'Central Legal Metrology Calibration Lab',
      accreditationBody: 'NABL ISO/IEC 17025',
      expandedUncertainty: 'U = 5.0 mg (k = 2)',
      isCurrentlyAssigned: true,
      assignedToSessionId: activeSessionId,
      assignedSessionsCount: 1,
      assignedSessionsList: [],
      usageHistory: [],
    };

    const updated = standards.map((s) => ({
      ...s,
      isCurrentlyAssigned: s.id === 'M1-003',
      assignedToSessionId: s.id === 'M1-003' ? activeSessionId : undefined,
    }));

    onUpdateStandards(updated);
    setLockoutTargetStandard(m1);
    setIsLockoutModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-20 select-none font-mono">
      {/* Toast Alert Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-foundation-900 text-white px-5 py-3 rounded-xl shadow-xl border border-foundation-700 flex items-center gap-2.5 animate-in slide-in-from-top duration-200">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span className="text-xs font-bold font-sans">{toastMessage}</span>
        </div>
      )}

      {/* 1. Page Header (§3, §21) */}
      <div className="bg-white rounded-xl border border-foundation-200 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <button
                type="button"
                onClick={onBackToDashboard}
                className="text-xs font-semibold text-foundation-500 hover:text-brand-600 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <ArrowLeft size={13} />
                <span>Dashboard</span>
              </button>
              <span className="text-foundation-300">•</span>
              <span className="text-xs font-bold text-foundation-500 uppercase tracking-wider">
                Assurance / Traceability
              </span>
            </div>

            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foundation-950 font-sans">
                Standard Weights & Traceability
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span>ISO/IEC 17025 Compliant</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-foundation-500 font-sans mt-1">
              Maintain laboratory reference standards, calibration validity and testing eligibility under OIML R 111-1 & R 76-1.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0 font-mono text-xs">
            {/* Role Switcher (§21) */}
            <div className="flex items-center gap-1 bg-foundation-100 p-1 rounded-lg border border-foundation-200">
              <span className="text-[10px] text-foundation-500 font-bold px-1.5 uppercase font-sans">Role:</span>
              <button
                type="button"
                onClick={() => setUserRole('METROLOGIST')}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                  userRole === 'METROLOGIST'
                    ? 'bg-white text-brand-700 shadow-2xs'
                    : 'text-foundation-600 hover:text-foundation-900'
                }`}
              >
                Metrologist
              </button>
              <button
                type="button"
                onClick={() => setUserRole('ADMIN')}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                  userRole === 'ADMIN'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-foundation-600 hover:text-foundation-900'
                }`}
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => setUserRole('REVIEWER')}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                  userRole === 'REVIEWER'
                    ? 'bg-white text-foundation-900 shadow-2xs'
                    : 'text-foundation-600 hover:text-foundation-900'
                }`}
              >
                Reviewer
              </button>
            </div>

            {/* Admin Add Standard Button (§20, §21) */}
            {(userRole === 'ADMIN' || userRole === 'METROLOGIST') && (
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle size={14} />
                <span>+ Add Standard Set</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Global Status Banner (§4) */}
      <TraceabilityStatusBanner
        standards={standards}
        onSelectStandard={(id) => {
          const std = standards.find((s) => s.id === id);
          if (std) {
            setSelectedDrawerStandard(std);
            setIsDrawerOpen(true);
          }
        }}
        onRenewStandard={handleRenewStandard}
        onResolveLockout={() => {
          const exp = standards.find((s) => s.status === 'EXPIRED') || standards[0];
          setLockoutTargetStandard(exp);
          setIsLockoutModalOpen(true);
        }}
        onViewExpiring={() => setFilterCategory('EXPIRING')}
      />

      {/* 3. Summary Metrics Row (§25) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-foundation-200 p-4 shadow-2xs">
          <div className="text-2xl font-black text-foundation-950 font-sans">
            {totalCount}
          </div>
          <div className="text-xs font-bold text-foundation-500 uppercase tracking-wider mt-0.5">
            Active Sets
          </div>
          <div className="text-[11px] text-foundation-400 mt-1">
            Registered Standards
          </div>
        </div>

        <div className="bg-white rounded-xl border border-foundation-200 p-4 shadow-2xs">
          <div className="text-2xl font-black text-emerald-700 font-sans">
            {validCount}
          </div>
          <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mt-0.5">
            Valid
          </div>
          <div className="text-[11px] text-foundation-400 mt-1">
            Ready for testing
          </div>
        </div>

        <div className="bg-white rounded-xl border border-foundation-200 p-4 shadow-2xs">
          <div className="text-2xl font-black text-amber-600 font-sans">
            {expiringCount}
          </div>
          <div className="text-xs font-bold text-amber-700 uppercase tracking-wider mt-0.5">
            Expiring
          </div>
          <div className="text-[11px] text-foundation-400 mt-1">
            Within 7 days
          </div>
        </div>

        <div
          className={`rounded-xl border p-4 shadow-2xs transition-colors ${
            expiredCount > 0
              ? 'bg-rose-50 border-rose-300 ring-1 ring-rose-200'
              : 'bg-white border-foundation-200'
          }`}
        >
          <div
            className={`text-2xl font-black font-sans ${
              expiredCount > 0 ? 'text-rose-700' : 'text-foundation-950'
            }`}
          >
            {expiredCount}
          </div>
          <div
            className={`text-xs font-bold uppercase tracking-wider mt-0.5 ${
              expiredCount > 0 ? 'text-rose-700' : 'text-foundation-500'
            }`}
          >
            Expired
          </div>
          <div className="text-[11px] text-foundation-400 mt-1">
            {expiredCount > 0 ? 'Testing blocked' : '0 locked sets'}
          </div>
        </div>
      </div>

      {/* 4. Filter Bar & Search / Sort (§5) */}
      <div className="bg-white rounded-xl border border-foundation-200 p-4 shadow-xs space-y-3">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterCategory === 'ALL'
                ? 'bg-foundation-900 text-white'
                : 'bg-foundation-100 text-foundation-700 hover:bg-foundation-200'
            }`}
          >
            All {totalCount}
          </button>

          <button
            type="button"
            onClick={() => setFilterCategory('E1')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterCategory === 'E1'
                ? 'bg-purple-900 text-white'
                : 'bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100'
            }`}
          >
            E1 {e1Count}
          </button>

          <button
            type="button"
            onClick={() => setFilterCategory('E2')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterCategory === 'E2'
                ? 'bg-indigo-900 text-white'
                : 'bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100'
            }`}
          >
            E2 {e2Count}
          </button>

          <button
            type="button"
            onClick={() => setFilterCategory('F1')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterCategory === 'F1'
                ? 'bg-blue-900 text-white'
                : 'bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100'
            }`}
          >
            F1 {f1Count}
          </button>

          <button
            type="button"
            onClick={() => setFilterCategory('M1')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterCategory === 'M1'
                ? 'bg-emerald-900 text-white'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            M1 {m1Count}
          </button>

          <div className="h-4 w-px bg-foundation-300 mx-1" />

          <button
            type="button"
            onClick={() => setFilterCategory('EXPIRING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterCategory === 'EXPIRING'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            Expiring {expiringCount}
          </button>

          <button
            type="button"
            onClick={() => setFilterCategory('EXPIRED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterCategory === 'EXPIRED'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            Expired {expiredCount}
          </button>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-foundation-100 text-xs">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-foundation-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search standard, ID or certificate..."
              className="w-full pl-9 pr-4 py-2 bg-foundation-50 border border-foundation-200 rounded-lg text-foundation-900 font-sans focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-foundation-500 font-bold uppercase tracking-wider text-[11px] font-sans">
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-foundation-50 border border-foundation-200 rounded-lg px-3 py-2 text-foundation-900 font-bold focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
            >
              <option value="EXPIRY_ASC">Expiry Date ▾</option>
              <option value="CLASS_ASC">Class (E1 → M1) ▾</option>
              <option value="ID_ASC">Identifier ▾</option>
              <option value="DAYS_ASC">Days Remaining ▾</option>
            </select>
          </div>
        </div>
      </div>

      {/* 5. Main Grid of Standard Weight Cards (§6, §33) */}
      {filteredStandards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStandards.map((std) => (
            <StandardWeightCard
              key={std.id}
              standard={std}
              isSelectedForTesting={std.isCurrentlyAssigned || std.assignedToSessionId === activeSessionId}
              onSelectForTesting={handleSelectForTesting}
              onViewDetails={(s) => {
                setSelectedDrawerStandard(s);
                setIsDrawerOpen(true);
              }}
              onReplaceStandard={(s) => {
                setLockoutTargetStandard(s);
                setIsLockoutModalOpen(true);
              }}
              onViewAssignedSessions={(s) => {
                setSelectedDrawerStandard(s);
                setIsDrawerOpen(true);
              }}
              userRole={userRole}
            />
          ))}
        </div>
      ) : searchQuery.trim() ? (
        /* Search Empty State (§24) */
        <div className="bg-white rounded-xl border border-foundation-200 p-12 text-center shadow-xs">
          <Search size={32} className="mx-auto text-foundation-300 mb-3" />
          <h3 className="text-base font-bold text-foundation-950 font-sans">
            No standard weights match "{searchQuery}"
          </h3>
          <p className="text-xs text-foundation-500 font-sans mt-1">
            Try adjusting your search keywords or filter category.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setFilterCategory('ALL');
            }}
            className="mt-4 px-4 py-2 rounded-lg bg-foundation-100 hover:bg-foundation-200 text-foundation-800 font-bold text-xs transition-colors cursor-pointer"
          >
            Clear Search
          </button>
        </div>
      ) : (
        /* Empty State (§23) */
        <div className="bg-white rounded-xl border border-foundation-200 p-12 text-center shadow-xs">
          <Scale size={36} className="mx-auto text-foundation-300 mb-3" />
          <h3 className="text-base font-bold text-foundation-950 font-sans">
            No standard weights registered
          </h3>
          <p className="text-xs text-foundation-500 font-sans mt-1 max-w-md mx-auto">
            Add a traceable laboratory reference standard before starting verification work under OIML R 76-1.
          </p>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            + Add Standard Set
          </button>
        </div>
      )}

      {/* 6. Demo Sandbox Bar (§31 - clearly marked DEMO ONLY) */}
      <div className="p-4 rounded-xl border border-foundation-200 bg-white/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-brand-600 shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foundation-900 font-sans">
                Statutory Demo Simulator:
              </span>
              <span className="text-[10px] bg-brand-100 text-brand-700 font-bold px-1.5 py-0.5 rounded">
                DEMO SANDBOX
              </span>
            </div>
            <p className="text-[11px] text-foundation-500 font-sans mt-0.5">
              Demonstrate OIML R 76-1 Cl 3.7.1 lockout gates and valid standard replacement to jury.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <button
            type="button"
            onClick={handlePresetAllValid}
            className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer font-bold"
          >
            ✓ 100% Valid State
          </button>

          <button
            type="button"
            onClick={handlePresetExpiringNotice}
            className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer font-bold"
          >
            ⚠ F1-008 Expiring (5d)
          </button>

          <button
            type="button"
            onClick={handlePresetTriggerLockout}
            className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer font-bold flex items-center gap-1"
          >
            <Lock size={12} />
            <span>Trigger Hard Lockout (M1-003)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onUpdateStandards(INITIAL_STANDARD_WEIGHTS);
              setFilterCategory('ALL');
              showToast('Reset standards registry to canonical state.');
            }}
            className="px-2.5 py-1.5 rounded-lg bg-foundation-100 text-foundation-700 hover:bg-foundation-200 transition-colors cursor-pointer font-semibold"
            title="Reset to default initial standards"
          >
            <RotateCcw size={12} />
          </button>
        </div>
      </div>

      {/* 7. Slide-over Detail Drawer (§9, §10, §11, §27) */}
      <StandardDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedDrawerStandard(null);
        }}
        standard={selectedDrawerStandard}
        onOpenCertificateModal={(std) => {
          setViewingCertStandard(std);
          setIsCertModalOpen(true);
        }}
      />

      {/* 8. Certificate Viewer Modal (§28) */}
      <CertificateViewerModal
        standard={viewingCertStandard}
        isOpen={isCertModalOpen}
        onClose={() => {
          setIsCertModalOpen(false);
          setViewingCertStandard(null);
        }}
      />

      {/* 9. Hard Lockout Modal (§16, §17, §18, §19 - Non-Dismissible) */}
      {lockoutTargetStandard && (
        <HardLockoutModal
          isOpen={isLockoutModalOpen}
          expiredStandard={lockoutTargetStandard}
          assignedSessionId={activeSessionId}
          availableStandards={standards}
          onSelectReplacement={handleResolveLockout}
        />
      )}

      {/* 10. Add Standard Set Modal (Admin §20) */}
      <AddStandardSetModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddStandard={handleAddStandard}
      />
    </div>
  );
};
