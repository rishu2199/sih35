import React, { useState, useEffect } from 'react';
import { Plus, Search, Scale, ArrowRight } from 'lucide-react';
import { Instrument } from '../../types/instrument';
import { VerificationSession } from '../../types/session';
import { instrumentRepository } from '../../repositories/instrumentRepository';
import { sessionRepository } from '../../repositories/sessionRepository';
import { InstrumentsTable } from './InstrumentsTable';
import { InstrumentDetailsDrawer } from './InstrumentDetailsDrawer';

interface InstrumentsPageProps {
  onRegisterNew: () => void;
  onOpenSession: (session: VerificationSession) => void;
}

export const InstrumentsPage: React.FC<InstrumentsPageProps> = ({
  onRegisterNew,
  onOpenSession,
}) => {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [sessions, setSessions] = useState<VerificationSession[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [instList, sessList] = await Promise.all([
        instrumentRepository.list(),
        sessionRepository.list(),
      ]);
      setInstruments(instList);
      setSessions(sessList);
    } catch (e) {
      console.warn('Error loading instruments data', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredInstruments = instruments.filter((inst) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase().trim();
    return (
      inst.modelName.toLowerCase().includes(q) ||
      inst.serialNumber.toLowerCase().includes(q) ||
      inst.manufacturer.toLowerCase().includes(q) ||
      String(inst.accuracyClass).toLowerCase().includes(q)
    );
  });

  const handleSelectInstrument = (inst: Instrument) => {
    setSelectedInstrument(inst);
    setIsDrawerOpen(true);
  };

  const handleStartNewVerification = async (inst: Instrument) => {
    setIsDrawerOpen(false);
    // Find preset corresponding to this instrument or create directly
    let presetKey = 'avery';
    if (inst.accuracyClass === 'CLASS_I') presetKey = 'mettler';
    else if (inst.accuracyClass === 'CLASS_II') presetKey = 'sansui';
    else if (inst.accuracyClass === 'CLASS_IIII') presetKey = 'essae';

    const newSess = await sessionRepository.createFromPreset(presetKey);
    onOpenSession(newSess);
  };

  // Get sessions related to selected instrument (§25)
  const getInstrumentSessions = (inst: Instrument | null): VerificationSession[] => {
    if (!inst) return [];
    return sessions.filter((s) => {
      const matchInstId = s.instrumentId === inst.id;
      const matchSerial = s.sessionNumber?.toLowerCase().includes(inst.serialNumber.toLowerCase());
      const matchPrefix = s.sessionNumber?.toLowerCase().startsWith(inst.serialNumber.substring(0, 2).toLowerCase());
      return matchInstId || matchSerial || matchPrefix;
    });
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-200 font-sans">
      {/* 1. Header (§24) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-[11px] font-mono font-bold tracking-wider uppercase mb-1">
            <span>Laboratory</span>
            <span className="text-slate-300 dark:text-slate-600">/</span>
            <span className="text-blue-600 dark:text-blue-400">Physical Registry</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Registered Weighing Instruments
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-xl">
            Physical weighing instruments under statutory metrological jurisdiction at this facility.
          </p>
        </div>

        <button
          type="button"
          onClick={onRegisterNew}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Register Instrument</span>
        </button>
      </div>

      {/* 2. Search Filter Row (§24) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search model, manufacturer or serial number..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
          />
        </div>

        <div className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 self-end sm:self-auto">
          {filteredInstruments.length} {filteredInstruments.length === 1 ? 'instrument' : 'instruments'} registered
        </div>
      </div>

      {/* 3. Instruments Table (§24) */}
      {filteredInstruments.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Scale className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            No matching instruments found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try a different model or serial query, or register a new instrument.
          </p>
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <InstrumentsTable
          instruments={filteredInstruments}
          onSelectInstrument={handleSelectInstrument}
          onStartVerification={handleStartNewVerification}
        />
      )}

      {/* 4. Inspection Detail Drawer (§25) */}
      <InstrumentDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        instrument={selectedInstrument}
        historySessions={getInstrumentSessions(selectedInstrument)}
        onOpenCurrentSession={(sess) => {
          setIsDrawerOpen(false);
          onOpenSession(sess);
        }}
        onStartNewVerification={handleStartNewVerification}
      />
    </div>
  );
};
