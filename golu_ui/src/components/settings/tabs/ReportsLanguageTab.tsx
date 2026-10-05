import React, { useState } from 'react';
import { Languages, Save, FileText, QrCode, FileCheck, Lock, Check } from 'lucide-react';
import { LanguageSettingsConfig } from '../types';

interface LanguageTabProps {
  config: LanguageSettingsConfig;
  onSave: (updated: LanguageSettingsConfig) => void;
  canEdit?: boolean;
}

export const ReportsLanguageTab: React.FC<LanguageTabProps> = ({
  config,
  onSave,
  canEdit = true,
}) => {
  const [formData, setFormData] = useState<LanguageSettingsConfig>(config);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                SECTION §17
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Language &amp; Localization Configuration
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure user interface language and statutory bilingual certificate output under the Official Languages Act.
            </p>
          </div>

          {!canEdit && (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
              <Lock className="w-3 h-3" />
              🔒 Managed by Administrator
            </span>
          )}
        </div>

        <div className="space-y-6">
          {/* Application UI Language */}
          <div className="space-y-2 max-w-md">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Application Workspace Language
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(['ENGLISH', 'HINDI'] as const).map((lang) => {
                const isSelected = formData.applicationLanguage === lang;
                return (
                  <button
                    type="button"
                    key={lang}
                    disabled={!canEdit}
                    onClick={() => setFormData({ ...formData, applicationLanguage: lang })}
                    className={`py-2.5 px-3.5 rounded-2xl border text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    } disabled:opacity-60`}
                  >
                    <span>{lang === 'ENGLISH' ? 'English (Official)' : 'हिन्दी (Hindi)'}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Certificate Output Language Modes (§17) */}
          <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Available Certificate Form VI Output Modes
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl">
              {(['ENGLISH', 'HINDI', 'BILINGUAL'] as const).map((mode) => {
                const isSelected = formData.certificateLanguage === mode;
                return (
                  <button
                    type="button"
                    key={mode}
                    disabled={!canEdit}
                    onClick={() => setFormData({ ...formData, certificateLanguage: mode })}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-950 dark:text-blue-100 ring-2 ring-blue-500/20 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    } disabled:opacity-60`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs">
                        {mode === 'ENGLISH' ? '● English' : mode === 'HINDI' ? '● Hindi' : '● Bilingual'}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      {mode === 'ENGLISH'
                        ? 'Standard English Form VI statutory text'
                        : mode === 'HINDI'
                        ? 'Rajbhasha Hindi legal metrology stamping'
                        : 'Parallel English & Hindi dual statutory format'}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bilingual Layout Options */}
          {formData.certificateLanguage === 'BILINGUAL' && (
            <div className="space-y-1.5 max-w-md pt-2 animate-in fade-in">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Bilingual Form Layout
              </label>
              <select
                disabled={!canEdit}
                value={formData.bilingualLayout}
                onChange={(e) => setFormData({ ...formData, bilingualLayout: e.target.value as any })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
              >
                <option value="PARALLEL_COLUMNS">Parallel Columns (Side-by-Side English &amp; Hindi)</option>
                <option value="INTERLEAVED">Interleaved Rows (Alternating Language Rows)</option>
              </select>
            </div>
          )}
        </div>

        {canEdit && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Language Preferences</span>
            </button>
          </div>
        )}
      </div>
    </form>
  );
};
