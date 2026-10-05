import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ArrowRight,
  UserCheck,
  ChevronDown,
} from 'lucide-react';
import { SettingsNav } from '../settings/SettingsNav';
import {
  SettingsNavTab,
  LaboratoryConfig,
  UserRoleItem,
  StandardsConfig,
  TestDefaultsConfig,
  LanguageSettingsConfig,
  CertificateSettingsConfig,
  AppearanceConfig,
  DemoModeConfig,
  SystemStatusInfo,
  MetrologicalRole,
} from '../settings/types';
import {
  INITIAL_LABORATORY_CONFIG,
  INITIAL_USERS,
  INITIAL_STANDARDS_CONFIG,
  INITIAL_TEST_DEFAULTS,
  INITIAL_LANGUAGE_CONFIG,
  INITIAL_CERTIFICATE_CONFIG,
  INITIAL_APPEARANCE_CONFIG,
  INITIAL_DEMO_CONFIG,
  INITIAL_SYSTEM_STATUS,
} from '../settings/mockSettingsData';
import { LaboratoryTab } from '../settings/tabs/LaboratoryTab';
import { UsersRolesTab } from '../settings/tabs/UsersRolesTab';
import { StandardsConfigTab } from '../settings/tabs/StandardsConfigTab';
import { TestDefaultsTab } from '../settings/tabs/TestDefaultsTab';
import { ReportsLanguageTab } from '../settings/tabs/ReportsLanguageTab';
import { CertificateConfigTab } from '../settings/tabs/CertificateConfigTab';
import { AppearanceTab } from '../settings/tabs/AppearanceTab';
import { DemoModeTab } from '../settings/tabs/DemoModeTab';
import { UserDetailDrawer } from '../settings/UserDetailDrawer';
import { DangerousActionsSection } from '../settings/DangerousActionsSection';
import { SystemStatusPanel } from '../settings/SystemStatusPanel';

interface SettingsViewProps {
  onNavigate?: (tab: string) => void;
  currentUserRole?: MetrologicalRole;
  onOpenJuryDemo?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onNavigate,
  currentUserRole: initialUserRole = 'ADMIN',
  onOpenJuryDemo,
}) => {
  // Navigation tab state (8 sections)
  const [activeTab, setActiveTab] = useState<SettingsNavTab>('LABORATORY');

  // Role simulation state (allows testing permission behaviors)
  const [currentRole, setCurrentRole] = useState<MetrologicalRole>(initialUserRole);
  const isAdmin = currentRole === 'ADMIN';

  // Config states
  const [labConfig, setLabConfig] = useState<LaboratoryConfig>(INITIAL_LABORATORY_CONFIG);
  const [users, setUsers] = useState<UserRoleItem[]>(INITIAL_USERS);
  const [standardsConfig, setStandardsConfig] = useState<StandardsConfig>(INITIAL_STANDARDS_CONFIG);
  const [testDefaults, setTestDefaults] = useState<TestDefaultsConfig>(INITIAL_TEST_DEFAULTS);
  const [languageConfig, setLanguageConfig] = useState<LanguageSettingsConfig>(INITIAL_LANGUAGE_CONFIG);
  const [certificateConfig, setCertificateConfig] = useState<CertificateSettingsConfig>(INITIAL_CERTIFICATE_CONFIG);
  const [appearanceConfig, setAppearanceConfig] = useState<AppearanceConfig>(INITIAL_APPEARANCE_CONFIG);
  const [demoConfig, setDemoConfig] = useState<DemoModeConfig>(INITIAL_DEMO_CONFIG);
  const [systemStatus, setSystemStatus] = useState<SystemStatusInfo>(INITIAL_SYSTEM_STATUS);

  // Selected user for details drawer
  const [selectedUser, setSelectedUser] = useState<UserRoleItem | null>(null);

  // Unsaved changes tracking for appearance/demo mode
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Non-intrusive toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const getUpdatedTimestamp = () => {
    return (
      new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }) + ' IST'
    );
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveLabConfig = (updated: LaboratoryConfig) => {
    setLabConfig(updated);
    setSystemStatus((prev) => ({ ...prev, lastSavedTimestamp: getUpdatedTimestamp() }));
    showToast('Laboratory configuration updated successfully');
  };

  const handleSaveStandardsConfig = (updated: StandardsConfig) => {
    setStandardsConfig(updated);
    setSystemStatus((prev) => ({ ...prev, lastSavedTimestamp: getUpdatedTimestamp() }));
    showToast('Standards calibration policy updated');
  };

  const handleSaveTestDefaults = (updated: TestDefaultsConfig) => {
    setTestDefaults(updated);
    setSystemStatus((prev) => ({ ...prev, lastSavedTimestamp: getUpdatedTimestamp() }));
    showToast('Test defaults and operational rules saved');
  };

  const handleSaveLanguageConfig = (updated: LanguageSettingsConfig) => {
    setLanguageConfig(updated);
    setSystemStatus((prev) => ({ ...prev, lastSavedTimestamp: getUpdatedTimestamp() }));
    showToast('Language and localization preferences saved');
  };

  const handleSaveCertificateConfig = (updated: CertificateSettingsConfig) => {
    setCertificateConfig(updated);
    setSystemStatus((prev) => ({ ...prev, lastSavedTimestamp: getUpdatedTimestamp() }));
    showToast('Certificate numbering and formatting saved');
  };

  const handleAppearanceChange = (updated: AppearanceConfig) => {
    setAppearanceConfig(updated);
    setHasUnsavedChanges(true);
  };

  const handleDemoConfigChange = (updated: DemoModeConfig) => {
    setDemoConfig(updated);
    setHasUnsavedChanges(true);
  };

  const handleSaveUnsaved = () => {
    setHasUnsavedChanges(false);
    setSystemStatus((prev) => ({ ...prev, lastSavedTimestamp: getUpdatedTimestamp() }));
    showToast('System display and presentation preferences saved');
  };

  const handleDiscardUnsaved = () => {
    setAppearanceConfig(INITIAL_APPEARANCE_CONFIG);
    setDemoConfig(INITIAL_DEMO_CONFIG);
    setHasUnsavedChanges(false);
    showToast('Unsaved changes discarded');
  };

  const handleSaveUser = (updatedUser: UserRoleItem) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    setSelectedUser(null);
    setSystemStatus((prev) => ({ ...prev, lastSavedTimestamp: getUpdatedTimestamp() }));
    showToast(`Permissions updated for ${updatedUser.name}`);
  };

  const handleAddUser = () => {
    const newUser: UserRoleItem = {
      id: `USR-0${users.length + 1}`,
      name: 'New Officer',
      designation: 'Metrologist Cadet',
      email: 'cadet.metrology@gov.in',
      role: 'METROLOGIST',
      laboratory: labConfig.name,
      status: 'ACTIVE',
      permissions: {
        registerInstruments: true,
        enterObservations: true,
        captureLiveReadings: true,
        submitForReview: true,
        reviewTestDossier: false,
        remandWithJustification: false,
        directorSignOff: false,
        modifySystemSettings: false,
        auditLedgerInspection: true,
      },
    };
    setUsers((prev) => [...prev, newUser]);
    setSelectedUser(newUser);
    showToast('New user profile generated');
  };

  // Dangerous Actions handlers (§24, §25)
  const handleResetDemoEnvironment = () => {
    setDemoConfig(INITIAL_DEMO_CONFIG);
    showToast('Demo environment and telemetry seeds refreshed');
  };

  const handleClearDemoData = () => {
    showToast('Local browser demo cache and drafts cleared');
  };

  const handleRestoreDefaults = () => {
    setLabConfig(INITIAL_LABORATORY_CONFIG);
    setStandardsConfig(INITIAL_STANDARDS_CONFIG);
    setTestDefaults(INITIAL_TEST_DEFAULTS);
    setLanguageConfig(INITIAL_LANGUAGE_CONFIG);
    setCertificateConfig(INITIAL_CERTIFICATE_CONFIG);
    setAppearanceConfig(INITIAL_APPEARANCE_CONFIG);
    setDemoConfig(INITIAL_DEMO_CONFIG);
    setUsers(INITIAL_USERS);
    setHasUnsavedChanges(false);
    setSystemStatus((prev) => ({ ...prev, lastSavedTimestamp: getUpdatedTimestamp() }));
    showToast('Factory default configuration successfully restored');
  };

  const isLabConfigIncomplete = !labConfig.name.trim() || !labConfig.code.trim();

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 font-sans pb-28 text-slate-800 dark:text-slate-200">
      {/* Non-intrusive Top-Right Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-top-3 fade-in duration-200">
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xl border border-slate-700/50 dark:border-slate-200 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Header Container */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-20 backdrop-blur-md bg-white/90 dark:bg-slate-900/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-mono font-bold tracking-wider uppercase mb-1">
                <SettingsIcon className="w-4 h-4" />
                METROLOGIX-76 Enterprise Configuration
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Settings &amp; Laboratory Configuration
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Configure laboratory identity, statutory role permissions, standards lockout threshold, and system preferences.
              </p>
            </div>

            {/* Role Switcher Sandbox for Jury Evaluation */}
            <div className="flex items-center gap-2.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shrink-0">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 pl-2 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
                Active Role:
              </span>
              <select
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value as MetrologicalRole)}
                className="bg-white dark:bg-slate-900 text-xs font-bold font-mono px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 cursor-pointer shadow-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="ADMIN">ADMIN (Full Control)</option>
                <option value="METROLOGIST">METROLOGIST (Read-Only)</option>
                <option value="REVIEWER">REVIEWER (Read-Only)</option>
                <option value="DIRECTOR">DIRECTOR (Read-Only)</option>
                <option value="AUDITOR">AUDITOR (Read-Only)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Incomplete Laboratory Configuration Alert Banner */}
        {isLabConfigIncomplete && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <div>
                <div className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  Laboratory Configuration Incomplete
                </div>
                <div className="text-xs text-amber-700 dark:text-amber-400">
                  Certificate generation requires complete laboratory identity and NABL accreditation details.
                </div>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('LABORATORY')}
              className="text-xs font-bold text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-900/60 px-3.5 py-1.5 rounded-xl hover:bg-amber-200 dark:hover:bg-amber-800 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              Complete Configuration
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Restricted Settings Notice for Non-Admins (§27, §28) */}
        {!isAdmin && (
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                Restricted Settings Mode ({currentRole})
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  READ-ONLY
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Your role allows inspecting laboratory parameters and statutory defaults, but modification of system configuration requires Administrator credentials.
              </div>
            </div>
          </div>
        )}

        {/* Mobile Navigation Dropdown (§36) */}
        <div className="block lg:hidden">
          <label className="text-[11px] font-mono uppercase text-slate-500 font-bold block mb-1.5">
            Select Configuration Section
          </label>
          <div className="relative">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as SettingsNavTab)}
              className="w-full appearance-none px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="LABORATORY">Laboratory Identity</option>
              <option value="USERS">Users &amp; Roles</option>
              <option value="STANDARDS">Standards Registry</option>
              <option value="DEFAULTS">Test Defaults</option>
              <option value="LANGUAGE">Language &amp; Localization</option>
              <option value="CERTIFICATES">Certificates Output</option>
              <option value="APPEARANCE">Appearance &amp; UI Ergonomics</option>
              <option value="DEMO">Demo Mode &amp; Presentation</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Two-Column Settings Workspace */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Desktop Left Sub-Navigation */}
          <div className="hidden lg:block">
            <SettingsNav
              activeTab={activeTab}
              onSelectTab={setActiveTab}
              isAdmin={isAdmin}
            />
          </div>

          {/* Active Tab Panel */}
          <div className="flex-1 w-full min-w-0 space-y-8">
            {activeTab === 'LABORATORY' && (
              <LaboratoryTab
                config={labConfig}
                onSave={handleSaveLabConfig}
                canEdit={isAdmin}
              />
            )}

            {activeTab === 'USERS' && (
              <UsersRolesTab
                users={users}
                onSelectUser={setSelectedUser}
                onAddUser={handleAddUser}
                canEdit={isAdmin}
              />
            )}

            {activeTab === 'STANDARDS' && (
              <StandardsConfigTab
                config={standardsConfig}
                onSave={handleSaveStandardsConfig}
                canEdit={isAdmin}
              />
            )}

            {activeTab === 'DEFAULTS' && (
              <TestDefaultsTab
                config={testDefaults}
                onSave={handleSaveTestDefaults}
                canEdit={isAdmin}
              />
            )}

            {activeTab === 'LANGUAGE' && (
              <ReportsLanguageTab
                config={languageConfig}
                onSave={handleSaveLanguageConfig}
                canEdit={isAdmin}
              />
            )}

            {activeTab === 'CERTIFICATES' && (
              <CertificateConfigTab
                config={certificateConfig}
                onSave={handleSaveCertificateConfig}
                canEdit={isAdmin}
                onPreviewSample={() => {
                  if (onNavigate) {
                    onNavigate('certificates');
                  } else {
                    showToast('Opening Certificate Repository...');
                  }
                }}
              />
            )}

            {activeTab === 'APPEARANCE' && (
              <AppearanceTab
                config={appearanceConfig}
                onChange={handleAppearanceChange}
                readOnly={!isAdmin}
              />
            )}

            {activeTab === 'DEMO' && (
              <DemoModeTab
                config={demoConfig}
                onChange={handleDemoConfigChange}
                onOpenJuryDemo={onOpenJuryDemo}
                readOnly={!isAdmin}
              />
            )}

            {/* Dangerous Actions (§24, §25) - Rendered at bottom of configuration flow */}
            <DangerousActionsSection
              onResetDemo={handleResetDemoEnvironment}
              onClearDemoData={handleClearDemoData}
              onRestoreDefaults={handleRestoreDefaults}
              readOnly={!isAdmin}
            />

            {/* System Status Panel (§26) */}
            <SystemStatusPanel status={systemStatus} />
          </div>
        </div>
      </div>

      {/* User Details & Permissions Drawer (§10, §11) */}
      <UserDetailDrawer
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        user={selectedUser}
        onSaveUser={handleSaveUser}
        canEdit={isAdmin}
      />

      {/* Floating Unsaved Changes Bottom Bar (§8) */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center gap-4 px-5 py-3 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-2xl border border-slate-700/60 dark:border-slate-200 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
              <span>Unsaved changes</span>
            </div>
            <div className="flex items-center gap-2 pl-2 border-l border-slate-700 dark:border-slate-300">
              <button
                type="button"
                onClick={handleDiscardUnsaved}
                className="px-3 py-1.5 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors text-slate-300 dark:text-slate-600 text-xs font-semibold cursor-pointer"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={handleSaveUnsaved}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
