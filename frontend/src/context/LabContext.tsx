import React, { createContext, useContext, useState } from 'react';
import type { Laboratory, UserProfile, UserRole } from '../types';

export const NATIONAL_LABORATORIES: Laboratory[] = [
  {
    id: 'lab-rrsl-blr',
    code: 'RRSL-BLR',
    name: 'Regional Reference Standard Laboratory, Bengaluru',
    city: 'Bengaluru',
    state: 'Karnataka',
    labType: 'RRSL',
    nablAccreditationNo: 'CC-2849',
  },
  {
    id: 'lab-rrsl-ahm',
    code: 'RRSL-AHM',
    name: 'Regional Reference Standard Laboratory, Ahmedabad',
    city: 'Ahmedabad',
    state: 'Gujarat',
    labType: 'RRSL',
    nablAccreditationNo: 'CC-3104',
  },
  {
    id: 'lab-rrsl-bbs',
    code: 'RRSL-BBS',
    name: 'Regional Reference Standard Laboratory, Bhubaneswar',
    city: 'Bhubaneswar',
    state: 'Odisha',
    labType: 'RRSL',
    nablAccreditationNo: 'CC-2951',
  },
  {
    id: 'lab-rrsl-fbd',
    code: 'RRSL-FBD',
    name: 'Regional Reference Standard Laboratory, Faridabad',
    city: 'Faridabad',
    state: 'Haryana',
    labType: 'RRSL',
    nablAccreditationNo: 'CC-2780',
  },
  {
    id: 'lab-rrsl-ghy',
    code: 'RRSL-GHY',
    name: 'Regional Reference Standard Laboratory, Guwahati',
    city: 'Guwahati',
    state: 'Assam',
    labType: 'RRSL',
    nablAccreditationNo: 'CC-3412',
  },
  {
    id: 'lab-gatc-del',
    code: 'GATC-DEL',
    name: 'Government Approved Test Centre Central, New Delhi',
    city: 'New Delhi',
    state: 'Delhi',
    labType: 'GATC',
    nablAccreditationNo: 'GATC-DL-001',
  },
];

interface LabContextType {
  activeLab: Laboratory;
  setActiveLab: (lab: Laboratory) => void;
  currentUser: UserProfile;
  setUserRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  login: (profile: UserProfile) => void;
  logout: () => void;
  activeTestCount: number;
  lockedSessionCount: number;
  syncStatus: 'ONLINE_POSTGRES' | 'LOCAL_SQLITE_SYNCING' | 'OFFLINE';
  isOnline: boolean;
}

const LabContext = createContext<LabContextType | undefined>(undefined);

export const LabProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeLab, setActiveLab] = useState<Laboratory>(NATIONAL_LABORATORIES[0]);
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('metrologix_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return {
      id: 'usr-blr-01',
      username: 'testing.officer@rrsl.gov.in',
      fullName: 'Dr. Anand Raman',
      designation: 'Testing Officer / Scientific Officer Grade I',
      email: 'testing.officer@rrsl.gov.in',
      role: 'METROLOGIST',
      laboratoryId: NATIONAL_LABORATORIES[0].id,
      laboratoryName: NATIONAL_LABORATORIES[0].name,
    };
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const savedAuth = localStorage.getItem('metrologix_authenticated');
      return savedAuth !== null ? savedAuth === 'true' : true;
    } catch (e) {
      return true;
    }
  });

  const login = (profile: UserProfile) => {
    setCurrentUser(profile);
    setIsAuthenticated(true);
    try {
      localStorage.setItem('metrologix_user', JSON.stringify(profile));
      localStorage.setItem('metrologix_authenticated', 'true');
    } catch (e) {
      // ignore
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.setItem('metrologix_authenticated', 'false');
    } catch (e) {
      // ignore
    }
  };

  const [activeTestCount] = useState<number>(4);
  const [lockedSessionCount] = useState<number>(1);
  const [syncStatus] = useState<'ONLINE_POSTGRES' | 'LOCAL_SQLITE_SYNCING' | 'OFFLINE'>(
    'ONLINE_POSTGRES'
  );

  const setUserRole = (newRole: UserRole) => {
    setCurrentUser((prev) => {
      const updated = {
        ...prev,
        role: newRole,
        designation:
          newRole === 'METROLOGIST'
            ? 'Testing Officer / Scientific Officer Grade I'
            : newRole === 'REVIEWER'
            ? 'Principal Scientific Officer (Reviewer)'
            : newRole === 'DIRECTOR'
            ? 'Director & Issuing Authority'
            : newRole === 'AUDITOR'
            ? 'DoCA Statutory Metrology Inspector'
            : 'National System Administrator',
      };
      try {
        localStorage.setItem('metrologix_user', JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
      return updated;
    });
  };

  return (
    <LabContext.Provider
      value={{
        activeLab,
        setActiveLab,
        currentUser,
        setUserRole,
        isAuthenticated,
        login,
        logout,
        activeTestCount,
        lockedSessionCount,
        syncStatus,
        isOnline: syncStatus === 'ONLINE_POSTGRES',
      }}
    >
      {children}
    </LabContext.Provider>
  );
};

export const useLab = (): LabContextType => {
  const context = useContext(LabContext);
  if (!context) {
    throw new Error('useLab must be used within a LabProvider');
  }
  return context;
};
