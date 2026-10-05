import React, { useState } from 'react';
import {
  X,
  User,
  Shield,
  CheckCircle2,
  XCircle,
  Building2,
  Mail,
  Lock,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { UserRoleItem, MetrologicalRole } from './types';

interface UserDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserRoleItem | null;
  onSaveUser: (updated: UserRoleItem) => void;
  canEdit?: boolean;
}

export const UserDetailDrawer: React.FC<UserDetailDrawerProps> = ({
  isOpen,
  onClose,
  user,
  onSaveUser,
  canEdit = true,
}) => {
  if (!isOpen || !user) return null;

  const [selectedRole, setSelectedRole] = useState<MetrologicalRole>(user.role);
  const [showRoleChangeConfirm, setShowRoleChangeConfirm] = useState(false);

  // Role capability matrix mapping (§10)
  const getRoleCapabilities = (role: MetrologicalRole) => {
    switch (role) {
      case 'DIRECTOR':
        return {
          allowed: [
            'Review verification dossiers',
            'Authorize & approve sessions',
            'Cryptographically sign certificates (PIN / HSM)',
            'Inspect full SHA-256 audit ledger',
            'Issue statutory Form VI verification certificates',
          ],
          forbidden: [
            'Enter raw weighing test observations (Four-Eyes Principle)',
            'Modify underlying laboratory configuration rules',
          ],
        };
      case 'METROLOGIST':
        return {
          allowed: [
            'Register instruments & perform intake inspection',
            'Enter measurement observations across all OIML modules',
            'Capture live RS-232 telemetry streams',
            'Submit completed test sessions for statutory review',
            'Inspect session audit timeline',
          ],
          forbidden: [
            'Approve own test verification dossiers',
            'Digitally sign Form VI certificate as Director',
            'Modify laboratory administrative settings',
          ],
        };
      case 'REVIEWER':
        return {
          allowed: [
            'Review metrological evidence dossiers',
            'Remand sessions with mandatory statutory justification',
            'Verify compliance calculations and MPE curves',
            'Approve test sessions for Director final authorization',
          ],
          forbidden: [
            'Enter observation test data',
            'Digitally stamp and sign Form VI certificates',
          ],
        };
      case 'AUDITOR':
        return {
          allowed: [
            'Read-only inspection of all verification sessions',
            'Verify SHA-256 tamper-evident merkle chain digests',
            'Export compliance ledgers and flaw audit reports',
            'Inspect historical certificate repository',
          ],
          forbidden: [
            'Alter or mutate any verification record',
            'Sign, approve, or remand sessions',
            'Enter test observations',
          ],
        };
      case 'ADMIN':
        return {
          allowed: [
            'Configure laboratory identity & NABL metadata',
            'Manage standard-weight calibration registry',
            'Configure operational defaults & language preferences',
            'Assign and revoke officer system roles',
            'Execute safe demo environment operations',
          ],
          forbidden: [
            'Falsify or overwrite digitally signed Director certificates',
          ],
        };
    }
  };

  const capabilities = getRoleCapabilities(selectedRole);

  const handleRoleSelect = (newRole: MetrologicalRole) => {
    if (newRole !== user.role) {
      setSelectedRole(newRole);
      setShowRoleChangeConfirm(true);
    } else {
      setSelectedRole(newRole);
      setShowRoleChangeConfirm(false);
    }
  };

  const handleApplySave = () => {
    onSaveUser({
      ...user,
      role: selectedRole,
    });
    setShowRoleChangeConfirm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <User className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
                  ROLE CAPABILITY MATRIX §10
                </span>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  {user.name}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* User Profile Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Designation:</span>
                <span className="font-bold text-slate-900 dark:text-white">{user.designation}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Official Email:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{user.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Laboratory:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{user.laboratory}</span>
              </div>
            </div>

            {/* Role Switcher */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
                Assigned Statutory Role
              </label>
              <select
                disabled={!canEdit}
                value={selectedRole}
                onChange={(e) => handleRoleSelect(e.target.value as MetrologicalRole)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
              >
                <option value="METROLOGIST">METROLOGIST (Test Operator)</option>
                <option value="REVIEWER">REVIEWER (Peer Auditor)</option>
                <option value="DIRECTOR">DIRECTOR (Statutory Signatory)</option>
                <option value="AUDITOR">AUDITOR (Read-Only Inspector)</option>
                <option value="ADMIN">ADMIN (System Administrator)</option>
              </select>
            </div>

            {/* Dangerous Role Change Warning (§11) */}
            {showRoleChangeConfirm && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 space-y-2 text-xs animate-in fade-in">
                <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>CHANGE ROLE? (§11)</span>
                </div>
                <p className="text-amber-800 dark:text-amber-300 leading-relaxed font-sans">
                  This will modify the officer&apos;s statutory authorization within the laboratory from <strong className="font-mono">{user.role}</strong> to <strong className="font-mono">{selectedRole}</strong>.
                </p>
              </div>
            )}

            {/* Capabilities Matrix (§10) */}
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-2">
                  ✓ Permitted Capabilities
                </span>
                <div className="space-y-1.5">
                  {capabilities.allowed.map((cap, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/60 text-xs text-emerald-950 dark:text-emerald-200 flex items-start gap-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{cap}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-600 dark:text-red-400 block mb-2">
                  ✕ Restricted Actions (Statutory Guardrails)
                </span>
                <div className="space-y-1.5">
                  {capabilities.forbidden.map((forb, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-red-50/60 dark:bg-red-950/30 border border-red-100 dark:border-red-900/60 text-xs text-red-950 dark:text-red-200 flex items-start gap-2"
                    >
                      <XCircle className="w-3.5 h-3.5 text-red-600 flex-shrink-0 mt-0.5" />
                      <span>{forb}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
            >
              Cancel
            </button>

            {canEdit && (
              <button
                type="button"
                onClick={handleApplySave}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer"
              >
                <span>Save Permissions</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
