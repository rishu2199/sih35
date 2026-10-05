import React, { createContext, useContext, useState } from 'react';
import { UserRole, PermissionAction, UnifiedVerificationSession } from '../lib/session/types';
import { can, normalizeUserRole } from '../lib/session/permissions';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  designation: string;
  governmentId: string;
  laboratory: string;
}

interface AuthContextType {
  currentUser: UserProfile;
  userRole: UserRole;
  isAuthenticated: boolean;
  can: (action: PermissionAction, session?: UnifiedVerificationSession, resource?: any) => boolean;
  switchRole: (role: UserRole | string) => void;
  login: (user: Partial<UserProfile>) => void;
  logout: () => void;
}

const DEFAULT_USER: UserProfile = {
  id: 'usr-001',
  name: 'R. Sharma',
  role: 'METROLOGIST',
  designation: 'Senior Legal Metrologist',
  governmentId: 'LM-OFF-2024-88',
  laboratory: 'RRSL Bengaluru',
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEFAULT_USER);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  const userRole = currentUser.role;

  const checkCan = (action: PermissionAction, session?: UnifiedVerificationSession, resource?: any) => {
    return can(userRole, action, session, resource);
  };

  const switchRole = (newRoleStr: UserRole | string) => {
    const normalized = normalizeUserRole(newRoleStr);
    const roleProfiles: Record<UserRole, { name: string; designation: string }> = {
      METROLOGIST: { name: 'R. Sharma', designation: 'Senior Legal Metrologist' },
      REVIEWER: { name: 'A. Gupta', designation: 'Technical Review Officer' },
      DIRECTOR: { name: 'Dr. S. Kumar', designation: 'Director of Legal Metrology' },
      AUDITOR: { name: 'P. Das', designation: 'Compliance Auditor' },
      ADMIN: { name: 'Admin', designation: 'System Administrator' },
    };

    const details = roleProfiles[normalized];
    setCurrentUser((prev) => ({
      ...prev,
      role: normalized,
      name: details.name,
      designation: details.designation,
    }));
  };

  const login = (userData: Partial<UserProfile>) => {
    setCurrentUser((prev) => ({
      ...prev,
      ...userData,
      role: normalizeUserRole(userData.role),
    }));
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userRole,
        isAuthenticated,
        can: checkCan,
        switchRole,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
