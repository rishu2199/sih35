import React, { createContext, useContext, useState, useEffect } from 'react';
import { Laboratory } from '../types/laboratory';
import { LAB_RRSL_BENGALURU, ALL_LABORATORIES } from '../data/laboratories';
import { emitAuditEvent } from '../lib/audit/auditEvents';

interface LabContextType {
  activeLab: Laboratory;
  allLaboratories: Laboratory[];
  switchLab: (labId: string) => void;
  pendingLab: Laboratory | null;
  requestLabSwitch: (lab: Laboratory) => void;
  confirmLabSwitch: () => void;
  cancelLabSwitch: () => void;
  isSwitchModalOpen: boolean;
}

const STORAGE_KEY_LAB = 'metrologix:activeLabId';

const LabContext = createContext<LabContextType | null>(null);

export const LabProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeLab, setActiveLab] = useState<Laboratory>(() => {
    try {
      const storedId = localStorage.getItem(STORAGE_KEY_LAB);
      if (storedId) {
        const found = ALL_LABORATORIES.find((l) => l.id === storedId || l.code === storedId);
        if (found) return found;
      }
    } catch (e) {
      // Ignore
    }
    return LAB_RRSL_BENGALURU;
  });

  const [pendingLab, setPendingLab] = useState<Laboratory | null>(null);
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState<boolean>(false);

  const requestLabSwitch = (lab: Laboratory) => {
    if (lab.id === activeLab.id) return;
    setPendingLab(lab);
    setIsSwitchModalOpen(true);
  };

  const confirmLabSwitch = () => {
    if (pendingLab) {
      const prevLab = activeLab;
      setActiveLab(pendingLab);
      try {
        localStorage.setItem(STORAGE_KEY_LAB, pendingLab.id);
      } catch (e) {
        // Ignore
      }
      emitAuditEvent({
        action: 'SWITCH_LABORATORY',
        metadata: {
          fromLab: prevLab.code,
          toLab: pendingLab.code,
        },
      });
      setPendingLab(null);
      setIsSwitchModalOpen(false);
    }
  };

  const cancelLabSwitch = () => {
    setPendingLab(null);
    setIsSwitchModalOpen(false);
  };

  const switchLab = (labId: string) => {
    const found = ALL_LABORATORIES.find((l) => l.id === labId || l.code === labId);
    if (found) {
      requestLabSwitch(found);
    }
  };

  return (
    <LabContext.Provider
      value={{
        activeLab,
        allLaboratories: ALL_LABORATORIES,
        switchLab,
        pendingLab,
        requestLabSwitch,
        confirmLabSwitch,
        cancelLabSwitch,
        isSwitchModalOpen,
      }}
    >
      {children}
    </LabContext.Provider>
  );
};

export const useLab = () => {
  const context = useContext(LabContext);
  if (!context) {
    throw new Error('useLab must be used within a LabProvider');
  }
  return context;
};
