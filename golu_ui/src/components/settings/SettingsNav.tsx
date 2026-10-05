import React from 'react';
import {
  Building2,
  Users,
  Scale,
  Sliders,
  Languages,
  FileCheck2,
  Palette,
  Sparkles,
  Lock,
} from 'lucide-react';
import { SettingsNavTab } from './types';

interface SettingsNavProps {
  activeTab: SettingsNavTab;
  onSelectTab: (tab: SettingsNavTab) => void;
  isAdmin?: boolean;
}

export const SettingsNav: React.FC<SettingsNavProps> = ({
  activeTab,
  onSelectTab,
  isAdmin = true,
}) => {
  const sections = [
    {
      group: 'IDENTITY & ACCESS',
      items: [
        { id: 'LABORATORY' as SettingsNavTab, label: 'Laboratory', icon: Building2 },
        { id: 'USERS' as SettingsNavTab, label: 'Users & Roles', icon: Users },
      ],
    },
    {
      group: 'STATUTORY TESTING',
      items: [
        { id: 'STANDARDS' as SettingsNavTab, label: 'Standards', icon: Scale },
        { id: 'DEFAULTS' as SettingsNavTab, label: 'Test Defaults', icon: Sliders },
      ],
    },
    {
      group: 'OUTPUT & LOCALIZATION',
      items: [
        { id: 'LANGUAGE' as SettingsNavTab, label: 'Language', icon: Languages },
        { id: 'CERTIFICATES' as SettingsNavTab, label: 'Certificates', icon: FileCheck2 },
      ],
    },
    {
      group: 'SYSTEM & PRESENTATION',
      items: [
        { id: 'APPEARANCE' as SettingsNavTab, label: 'Appearance', icon: Palette },
        { id: 'DEMO' as SettingsNavTab, label: 'Demo Mode', icon: Sparkles },
      ],
    },
  ];

  return (
    <nav className="w-full lg:w-64 space-y-6 select-none flex-shrink-0">
      {sections.map((sec) => (
        <div key={sec.group} className="space-y-1.5">
          <div className="px-3 text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
            {sec.group}
          </div>
          <div className="space-y-0.5">
            {sec.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-indigo-600 dark:text-white shadow-sm font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400 dark:text-indigo-200' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {!isAdmin && item.id !== 'APPEARANCE' && (
                    <Lock className={`w-3 h-3 ${isActive ? 'text-white/60' : 'text-slate-400'}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
};
