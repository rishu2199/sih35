import React, { useState } from 'react';
import {
  Building2,
  Save,
  CheckCircle2,
  ShieldCheck,
  Info,
  Lock,
  Upload,
  Eye,
  Award,
} from 'lucide-react';
import { LaboratoryConfig } from '../types';

interface LaboratoryTabProps {
  config: LaboratoryConfig;
  onSave: (updated: LaboratoryConfig) => void;
  canEdit?: boolean;
}

export const LaboratoryTab: React.FC<LaboratoryTabProps> = ({
  config,
  onSave,
  canEdit = true,
}) => {
  const [formData, setFormData] = useState<LaboratoryConfig>(config);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. Laboratory Identity Card (§5) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                SECTION §5
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Laboratory Identity
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage the identity and statutory profile of this laboratory node.
            </p>
          </div>

          {!canEdit && (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
              <Lock className="w-3 h-3" />
              🔒 Managed by Administrator
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Lab Name */}
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Laboratory Name
            </label>
            <input
              type="text"
              disabled={!canEdit}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:bg-slate-50 dark:disabled:bg-slate-850"
              required
            />
          </div>

          {/* Lab Code */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Laboratory Code
            </label>
            <input
              type="text"
              disabled={!canEdit}
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
              required
            />
          </div>

          {/* Lab Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Lab Type
            </label>
            <select
              disabled={!canEdit}
              value={formData.labType}
              onChange={(e) => setFormData({ ...formData, labType: e.target.value as any })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
            >
              <option value="RRSL">RRSL (Regional Reference Standards Laboratory)</option>
              <option value="GATC">GATC (Government Approved Test Center)</option>
              <option value="CENTRAL_REFERENCE">Central Legal Metrology Reference Lab</option>
              <option value="STATE_DISTRICT">State Legal Metrology Verification Center</option>
            </select>
          </div>

          {/* City */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              City
            </label>
            <input
              type="text"
              disabled={!canEdit}
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white disabled:opacity-60"
              required
            />
          </div>

          {/* State */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              State / Union Territory
            </label>
            <input
              type="text"
              disabled={!canEdit}
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white disabled:opacity-60"
              required
            />
          </div>

          {/* Address */}
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Facility Address
            </label>
            <textarea
              rows={2}
              disabled={!canEdit}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white disabled:opacity-60"
            />
          </div>
        </div>
      </div>

      {/* 2. Accreditation Information Card (§6) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
              SECTION §6
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Accreditation Information
            </h3>
          </div>
          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            ● Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              NABL Accreditation Number
            </label>
            <input
              type="text"
              disabled={!canEdit}
              value={formData.nablAccreditationNo}
              onChange={(e) => setFormData({ ...formData, nablAccreditationNo: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-blue-600 dark:text-blue-400 disabled:opacity-60"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Accreditation Valid Until
            </label>
            <input
              type="text"
              disabled={!canEdit}
              value={formData.nablValidUntil}
              onChange={(e) => setFormData({ ...formData, nablValidUntil: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 disabled:opacity-60"
            />
          </div>
        </div>
      </div>

      {/* 3. Document Identity & Branding Card (§7) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
              SECTION §7
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Document Identity &amp; Statutory Branding
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Form VI Header Elements
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
              Laboratory Logo
            </span>
            <div className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 truncate">
              {formData.brandingLogoName}
            </div>
            <button
              type="button"
              disabled={!canEdit}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload SVG Logo</span>
            </button>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
              Government Identity Mark
            </span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Configured ✓</span>
            </div>
            <p className="text-[10px] text-slate-400">
              National Emblem &amp; Lion Capital embedded.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
              Report Header Stamping
            </span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <Award className="w-4 h-4" />
              <span>Standard Template</span>
            </div>
            <button
              type="button"
              onClick={() => setIsPreviewOpen(!isPreviewOpen)}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{isPreviewOpen ? 'Hide Preview' : 'Preview Header'}</span>
            </button>
          </div>
        </div>

        {isPreviewOpen && (
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2 text-center font-serif text-slate-900 dark:text-white animate-in fade-in">
            <div className="text-[11px] font-sans font-bold tracking-widest uppercase text-slate-500">
              GOVERNMENT OF INDIA · MINISTRY OF CONSUMER AFFAIRS
            </div>
            <div className="text-sm font-black uppercase">
              {formData.name}
            </div>
            <div className="text-[10px] font-sans font-mono text-slate-500">
              Node: {formData.code} · NABL Accr: {formData.nablAccreditationNo} · {formData.city}, {formData.state}
            </div>
          </div>
        )}
      </div>

      {canEdit && (
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Laboratory Profile</span>
          </button>
        </div>
      )}
    </form>
  );
};
