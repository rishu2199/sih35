import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  History,
  FileCode,
  Download,
  Copy,
  Check,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Bug,
  Lock,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { AuditEvent, AuditChainState, AuditSessionScope } from '../audit/types';
import {
  INITIAL_AUDIT_CHAIN_STATE,
  MOCK_AUDIT_SESSIONS,
  MOCK_AVERY_EVENTS,
  TAMPER_DEMO_CORRUPTED_EVENT_ID,
  TAMPER_DEMO_CORRUPTED_BLOCK_NUMBER,
  TAMPER_DEMO_EXPECTED_HASH,
  TAMPER_DEMO_FORGED_HASH,
} from '../audit/mockAuditData';
import { AuditIntegrityBanner } from '../audit/AuditIntegrityBanner';
import { AuditOverviewCards } from '../audit/AuditOverviewCards';
import { AuditScopeSelector } from '../audit/AuditScopeSelector';
import { AuditBlockCard } from '../audit/AuditBlockCard';
import { AuditEventDetailDrawer } from '../audit/AuditEventDetailDrawer';
import { ChainStatusVisualizer } from '../audit/ChainStatusVisualizer';

interface CryptographicAuditViewProps {
  initialSessionId?: string;
  onBackToDashboard: () => void;
  userRole?: string;
}

export const CryptographicAuditView: React.FC<CryptographicAuditViewProps> = ({
  initialSessionId = 'AV-2026-8812',
  onBackToDashboard,
  userRole = 'Metrologist',
}) => {
  const [selectedSessionId, setSelectedSessionId] = useState<string>(initialSessionId);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedActor, setSelectedActor] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState('ALL');
  const [chainState, setChainState] = useState<AuditChainState>(INITIAL_AUDIT_CHAIN_STATE);
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isHashCopied, setIsHashCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [sortAscending, setSortAscending] = useState(false); // Default: latest first (descending)
  const [isAuditorMode, setIsAuditorMode] = useState(userRole.toLowerCase().includes('auditor'));

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Hackathon Demonstration: Toggle simulation of tamper / hash mismatch in Block #36
  const handleToggleSimulateTamper = () => {
    setChainState((prev) => {
      const nextValid = !prev.isChainValid;
      if (!nextValid) {
        showToast('Simulated tampering in Event AUD-000407: Previous hash mismatch detected!');
        return {
          ...prev,
          isChainValid: false,
          integrityIssues: 1,
          brokenLinkCount: 1,
          corruptedEventId: TAMPER_DEMO_CORRUPTED_EVENT_ID,
          corruptedBlockNumber: TAMPER_DEMO_CORRUPTED_BLOCK_NUMBER,
          expectedHash: TAMPER_DEMO_EXPECTED_HASH,
          receivedHash: TAMPER_DEMO_FORGED_HASH,
        };
      } else {
        showToast('Cryptographic chain restored: All 42 verification event links valid.');
        return {
          ...prev,
          isChainValid: true,
          integrityIssues: 0,
          brokenLinkCount: 0,
          corruptedEventId: undefined,
          corruptedBlockNumber: undefined,
          expectedHash: undefined,
          receivedHash: undefined,
        };
      }
    });
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setIsHashCopied(true);
    showToast('SHA-256 hash copied.');
    setTimeout(() => setIsHashCopied(false), 2000);
  };

  const handleCopyHeadHash = () => {
    const headHash = MOCK_AVERY_EVENTS[0]?.hash || '8d72f1c3a91b4e72c10b5039f1c93a8d4e9f7831b204c8e71a04b86291a61e9b';
    handleCopyHash(headHash);
  };

  const handleExportAudit = () => {
    const exportData = {
      exportMetadata: {
        exportedAt: new Date().toISOString(),
        sessionId: selectedSessionId,
        chainIntegrityStatus: chainState.isChainValid ? 'VERIFIED_SECURE' : 'TAMPER_FAILURE_DETECTED',
        totalEvents: MOCK_AVERY_EVENTS.length,
        statutoryStandards: ['OIML R 76-1', 'WELMEC 7.2 Guide § 4.3', 'Legal Metrology Act 2009'],
      },
      events: MOCK_AVERY_EVENTS,
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-trail-${selectedSessionId}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Audit ledger exported for ${selectedSessionId}`);
  };

  const handleOpenEventDetails = (event: AuditEvent) => {
    setSelectedEvent(event);
    setIsDrawerOpen(true);
  };

  // Base events for the current active scope
  const rawEvents = useMemo(() => {
    if (selectedSessionId === 'AV-2026-8812') {
      return MOCK_AVERY_EVENTS;
    }
    // For other demo sessions, return customized sets
    return MOCK_AVERY_EVENTS.map((e) => ({
      ...e,
      sessionId: selectedSessionId === 'ALL' ? e.sessionId : selectedSessionId,
    }));
  }, [selectedSessionId]);

  // Filtered & sorted events
  const filteredEvents = useMemo(() => {
    const list = rawEvents.filter((e) => {
      // Category filter
      if (selectedCategory !== 'ALL' && e.category !== selectedCategory) {
        return false;
      }

      // Actor filter
      if (selectedActor !== 'ALL' && e.actor !== selectedActor) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          e.title.toLowerCase().includes(q) ||
          e.actor.toLowerCase().includes(q) ||
          e.role.toLowerCase().includes(q) ||
          e.action.toLowerCase().includes(q) ||
          e.id.toLowerCase().includes(q) ||
          e.sessionId.toLowerCase().includes(q) ||
          e.hash.toLowerCase().includes(q) ||
          e.previousHash.toLowerCase().includes(q) ||
          e.statutoryReference.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });

    return list.sort((a, b) => {
      return sortAscending
        ? a.blockNumber - b.blockNumber
        : b.blockNumber - a.blockNumber;
    });
  }, [rawEvents, selectedCategory, selectedActor, searchQuery, sortAscending]);

  const activeSessionMeta =
    MOCK_AUDIT_SESSIONS.find((s) => s.id === selectedSessionId) || MOCK_AUDIT_SESSIONS[0];

  return (
    <div className="space-y-6 pb-24 relative font-sans">
      {/* 0. Toast Alert (Section 30: "SHA-256 hash copied.") */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-foundation-950 text-white px-4 py-3 rounded-xl shadow-2xl border border-foundation-700 text-xs font-semibold flex items-center gap-2.5 animate-fade-in">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span className="font-mono">{toastMessage}</span>
        </div>
      )}

      {/* 1. Header (Section 3 & 22) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-foundation-200">
        <div className="flex items-start sm:items-center gap-3.5">
          <button
            onClick={onBackToDashboard}
            className="p-2.5 rounded-xl border border-foundation-200 bg-white hover:bg-foundation-100 text-foundation-700 transition-colors shadow-xs cursor-pointer"
            title="Return to Dashboard"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-brand-100 text-brand-800 border border-brand-200">
                SCREEN 13
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-foundation-900 tracking-tight font-sans">
                Cryptographic Audit Trail
              </h1>
            </div>
            <p className="text-xs text-foundation-500 mt-0.5 font-sans">
              Immutable chronological record of verification activity.
            </p>
          </div>
        </div>

        {/* Right side status badge: Always visible ● CHAIN VERIFIED & Auditor badge */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Auditor Mode Toggle / Indicator (Section 22) */}
          <button
            onClick={() => setIsAuditorMode(!isAuditorMode)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs ${
              isAuditorMode
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-white text-foundation-600 border-foundation-200 hover:bg-foundation-50'
            }`}
            title="Toggle read-only Auditor Inspection Mode"
          >
            <Eye size={13} className={isAuditorMode ? 'text-amber-700' : 'text-foundation-400'} />
            <span>{isAuditorMode ? 'AUDITOR MODE: READ-ONLY' : 'Metrologist View'}</span>
          </button>

          {/* Always Visible Chain Status Badge (Section 3) */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold border shadow-xs transition-all ${
              chainState.isChainValid
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                : 'bg-rose-50 text-rose-900 border-rose-300 animate-pulse'
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                chainState.isChainValid ? 'bg-emerald-500 animate-pulse' : 'bg-rose-600'
              }`}
            />
            <span>{chainState.isChainValid ? '● CHAIN VERIFIED' : '● INTEGRITY ISSUE'}</span>
          </div>
        </div>
      </div>

      {/* 2. Chain Integrity Banner (Section 15, 16, 23) */}
      <AuditIntegrityBanner
        chainState={chainState}
        onToggleSimulateFailure={handleToggleSimulateTamper}
        onInspectCorruptedBlock={() => {
          const corrupted = MOCK_AVERY_EVENTS.find(
            (e) => e.id === TAMPER_DEMO_CORRUPTED_EVENT_ID
          );
          if (corrupted) handleOpenEventDetails(corrupted);
        }}
      />

      {/* 3. Audit Overview Cards & Immutability Status (Section 2 & 6) */}
      <AuditOverviewCards
        chainState={chainState}
        eventsCount={activeSessionMeta.eventsCount}
        actorsCount={chainState.totalActors}
      />

      {/* 4. Session Selector & Search & Filters (Section 4, 5, 19, 20) */}
      <AuditScopeSelector
        selectedSessionId={selectedSessionId}
        onSelectSessionId={setSelectedSessionId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        selectedActor={selectedActor}
        onSelectActor={setSelectedActor}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        onCopyHash={handleCopyHeadHash}
        onExportAudit={handleExportAudit}
        isHashCopied={isHashCopied}
        isAuditorMode={isAuditorMode}
      />

      {/* 5. Horizontal Merkle Chain Status Visualizer */}
      <ChainStatusVisualizer
        events={rawEvents}
        isCorrupted={!chainState.isChainValid}
        corruptedBlockNumber={chainState.corruptedBlockNumber}
        onSelectBlock={handleOpenEventDetails}
      />

      {/* 6. Main Chronological Timeline (Section 7, 8, 14, 18, 21) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div>
            <h3 className="text-sm font-bold text-foundation-900 uppercase tracking-wider font-mono">
              Verification History Timeline
            </h3>
            <p className="text-xs text-foundation-500 font-sans mt-0.5">
              Chronological cryptographic sequence linked via SHA-256 recursive hash digests.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSortAscending(!sortAscending)}
              className="text-xs font-mono font-semibold text-foundation-600 hover:text-foundation-900 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-foundation-200 shadow-xs cursor-pointer"
            >
              <SlidersHorizontal size={12} />
              <span>{sortAscending ? 'Oldest First (Ascending)' : 'Latest First (Descending)'}</span>
            </button>

            <span className="text-xs font-mono text-foundation-500">
              Showing {filteredEvents.length} of {rawEvents.length} events
            </span>
          </div>
        </div>

        {/* Empty State (Section 27) */}
        {filteredEvents.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-foundation-200 text-foundation-500 shadow-xs space-y-3">
            <Filter className="w-9 h-9 mx-auto opacity-40 text-foundation-400" />
            <div>
              <p className="text-sm font-bold text-foundation-800">No audit events match your search</p>
              <p className="text-xs text-foundation-500 mt-1">
                Try resetting your search query, actor selection, or category filters.
              </p>
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
                setSelectedActor('ALL');
                setSelectedDate('ALL');
              }}
              className="px-4 py-2 rounded-xl bg-foundation-900 text-white text-xs font-bold hover:bg-foundation-800 transition-colors cursor-pointer shadow-xs"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Timeline Container with Dynamic Failure Line (Section 16) */
          <div className="relative pl-7 sm:pl-9 space-y-6 before:absolute before:left-3.5 sm:before:left-4 before:top-5 before:bottom-5 before:w-0.5 before:bg-foundation-300">
            {filteredEvents.map((event, idx) => {
              const isCorrupt =
                !chainState.isChainValid && event.id === chainState.corruptedEventId;
              const isDirector = event.category === 'SIGNATURE';

              return (
                <div key={event.id} className="relative">
                  {/* Timeline Node Dot (Section 16: affected event turns red) */}
                  <div
                    className={`absolute -left-7 sm:-left-9 top-6 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all shadow-xs ${
                      isCorrupt
                        ? 'bg-rose-600 border-white text-white ring-4 ring-rose-200 animate-pulse'
                        : isDirector
                        ? 'bg-purple-700 border-white text-white ring-4 ring-purple-100'
                        : event.category === 'APPROVAL'
                        ? 'bg-emerald-600 border-white text-white ring-4 ring-emerald-100'
                        : event.category === 'REVIEW'
                        ? 'bg-amber-500 border-white text-white ring-4 ring-amber-100'
                        : 'bg-brand-600 border-white text-white ring-4 ring-brand-100'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-white" />
                  </div>

                  {/* Section 16: The line connecting that event to the next event also changes to the failure state */}
                  {isCorrupt && (
                    <div className="absolute -left-7 sm:-left-9 top-13 bottom-0 w-0.5 bg-rose-500 z-10" />
                  )}

                  {/* Event Block Card */}
                  <AuditBlockCard
                    event={event}
                    onOpenDetails={handleOpenEventDetails}
                    onCopyHash={handleCopyHash}
                    isCorrupted={isCorrupt}
                    expectedHash={isCorrupt ? chainState.expectedHash : undefined}
                    receivedHash={isCorrupt ? chainState.receivedHash : undefined}
                    isAuditorMode={isAuditorMode}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 7. Event Details Slide-Over Drawer (Section 17 & 30) */}
      <AuditEventDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        event={selectedEvent}
        isCorrupted={
          !chainState.isChainValid &&
          selectedEvent?.id === chainState.corruptedEventId
        }
        onCopyHash={handleCopyHash}
        isAuditorMode={isAuditorMode}
      />
    </div>
  );
};
