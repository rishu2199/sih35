import React, { useState } from 'react';
import {
  Scale,
  Save,
  ShieldAlert,
  CheckCircle2,
  Lock,
  Info,
  PlusCircle,
  AlertTriangle,
  X,
  Trash2,
  Calendar,
  Check,
} from 'lucide-react';
import { StandardsConfig, StandardWeightSetItem } from '../types';

interface StandardsConfigTabProps {
  config: StandardsConfig;
  onSave: (updated: StandardsConfig) => void;
  canEdit?: boolean;
}

export const StandardsConfigTab: React.FC<StandardsConfigTabProps> = ({
  config,
  onSave,
  canEdit = true,
}) => {
  const [formData, setFormData] = useState<StandardsConfig>(config);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [retireTargetSet, setRetireTargetSet] = useState<StandardWeightSetItem | null>(null);

  // New standard form state
  const [newSetClass, setNewSetClass] = useState<'E2' | 'F1' | 'F2' | 'M1'>('F1');
  const [newSetId, setNewSetId] = useState('FW-24-019');
  const [newCalLab, setNewCalLab] = useState('NPL National Physical Laboratory');
  const [newCertNo, setNewCertNo] = useState('CERT-NPL-2026-F1-019');
  const [newCalDate, setNewCalDate] = useState('18/03/2026');
  const [newExpDate, setNewExpDate] = useState('18/03/2027');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleAddStandardSet = (e: React.FormEvent) => {
    e.preventDefault();
    const newSet: StandardWeightSetItem = {
      id: `SET-0${formData.weightSets.length + 1}`,
      setId: newSetId,
      accuracyClass: newSetClass,
      calibrationLab: newCalLab,
      certificateNumber: newCertNo,
      calibrationDate: newCalDate,
      expiryDate: newExpDate,
      status: 'VALID',
      daysRemaining: 365,
    };
    const updated = {
      ...formData,
      weightSets: [...formData.weightSets, newSet],
    };
    setFormData(updated);
    onSave(updated);
    setIsAddModalOpen(false);
  };

  const handleConfirmRetire = () => {
    if (!retireTargetSet) return;
    const updated = {
      ...formData,
      weightSets: formData.weightSets.map((s) =>
        s.id === retireTargetSet.id ? { ...s, status: 'RETIRED' as const, daysRemaining: 0 } : s
      ),
    };
    setFormData(updated);
    onSave(updated);
    setRetireTargetSet(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. Policy vs Operational Notice (§12) */}
      <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/80 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-blue-950 dark:text-blue-200 space-y-1">
          <div className="font-bold">Administrative Policy vs. Operational Traceability (§12)</div>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
            <strong>Standards &amp; Traceability</strong> is the daily operational workspace answering <em>“Which standard weight sets are currently valid?”</em>. This Settings tab governs statutory administrative policy: <em>“How strictly should the system enforce calibration validity gates and test lockouts?”</em>.
          </p>
        </div>
      </div>

      {/* 2. Standard Weight Sets Registry (§12) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                SECTION §12
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Standard Weights Calibration Registry
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Admin manages laboratory standard-weight sets and their calibration validity.
            </p>
          </div>

          {canEdit && (
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Add Standard Set</span>
            </button>
          )}
        </div>

        {/* Weight Sets Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-600 dark:text-slate-400">
                <th className="py-3 px-4">Set ID</th>
                <th className="py-3 px-4">OIML Class</th>
                <th className="py-3 px-4">Calibration Lab &amp; Certificate</th>
                <th className="py-3 px-4">Calibration Date</th>
                <th className="py-3 px-4">Expiry Date</th>
                <th className="py-3 px-4">Status</th>
                {canEdit && <th className="py-3 px-4 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {formData.weightSets.map((ws) => (
                <tr key={ws.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    {ws.setId}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold text-slate-800 dark:text-slate-200">
                      Class {ws.accuracyClass}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-sans text-slate-600 dark:text-slate-300">
                    <div className="font-semibold text-slate-900 dark:text-white">{ws.calibrationLab}</div>
                    <div className="text-[11px] font-mono text-slate-400">{ws.certificateNumber}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {ws.calibrationDate}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-bold">
                    {ws.expiryDate}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        ws.status === 'VALID'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300'
                          : ws.status === 'EXPIRING'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300'
                          : ws.status === 'EXPIRED'
                          ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-300'
                      }`}
                    >
                      {ws.status === 'VALID'
                        ? `✓ Valid (${ws.daysRemaining}d)`
                        : ws.status === 'EXPIRING'
                        ? `⚠ Expiring (${ws.daysRemaining}d)`
                        : ws.status === 'EXPIRED'
                        ? '🔒 Expired'
                        : '○ Retired'}
                    </span>
                  </td>
                  {canEdit && (
                    <td className="py-3.5 px-4 text-right">
                      {ws.status !== 'RETIRED' && (
                        <button
                          type="button"
                          onClick={() => setRetireTargetSet(ws)}
                          className="text-xs font-sans text-red-600 dark:text-red-400 hover:underline cursor-pointer"
                        >
                          Retire Set
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Statutory Lockout & Buffer Policies */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-5">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Administrative Lockout &amp; Warning Rules
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Governs automatic testing lockouts, calibration expiration buffers, and traceability verification rules.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-rose-600" />
                <span>Block Testing When Calibration is Expired (Hard Lockout)</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                When enabled, METROLOGIX-76 freezes observation inputs across Pages 05–08 immediately if the assigned reference weights are past their validity date.
              </p>
            </div>

            <input
              type="checkbox"
              disabled={!canEdit}
              checked={formData.blockTestingWhenExpired}
              onChange={(e) => setFormData({ ...formData, blockTestingWhenExpired: e.target.checked })}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 mt-1 cursor-pointer"
            />
          </div>

          <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                Require Valid Statutory Calibration Certificate Before Test Intake
              </div>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                Instruments cannot pass the preflight readiness check unless an active NPL/RRSL certificate serial is linked.
              </p>
            </div>

            <input
              type="checkbox"
              disabled={!canEdit}
              checked={formData.requireValidCalibration}
              onChange={(e) => setFormData({ ...formData, requireValidCalibration: e.target.checked })}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 mt-1 cursor-pointer"
            />
          </div>

          <div className="pt-2 max-w-md space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Calibration Expiration Advance Warning Buffer
            </label>
            <div className="flex items-center gap-2 font-mono">
              <input
                type="number"
                disabled={!canEdit}
                min={7}
                max={90}
                value={formData.expiryWarningDays}
                onChange={(e) => setFormData({ ...formData, expiryWarningDays: parseInt(e.target.value) || 30 })}
                className="w-24 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
              />
              <span className="text-xs text-slate-500 font-sans">days prior to certificate expiry</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              Flags weight sets in amber badge state across the application before statutory lock occurs.
            </p>
          </div>
        </div>

        {canEdit && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Standards Policy</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. Add Standard Set Modal (§13) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Add Standard Weight Set (§13)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-[10px] font-sans font-bold text-slate-500 uppercase block mb-1">
                  OIML Accuracy Class
                </label>
                <select
                  value={newSetClass}
                  onChange={(e) => setNewSetClass(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                >
                  <option value="E2">Class E2 (Precision Analytical)</option>
                  <option value="F1">Class F1 (Standard Lab Weights)</option>
                  <option value="F2">Class F2 (Working Platform Weights)</option>
                  <option value="M1">Class M1 (Heavy Commercial Standard)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-sans font-bold text-slate-500 uppercase block mb-1">
                  Set ID
                </label>
                <input
                  type="text"
                  value={newSetId}
                  onChange={(e) => setNewSetId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-sans font-bold text-slate-500 uppercase block mb-1">
                  Calibration Lab
                </label>
                <input
                  type="text"
                  value={newCalLab}
                  onChange={(e) => setNewCalLab(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-sans font-bold text-slate-500 uppercase block mb-1">
                  Certificate Number
                </label>
                <input
                  type="text"
                  value={newCertNo}
                  onChange={(e) => setNewCertNo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-sans font-bold text-slate-500 uppercase block mb-1">
                    Calibration Date
                  </label>
                  <input
                    type="text"
                    value={newCalDate}
                    onChange={(e) => setNewCalDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-sans font-bold text-slate-500 uppercase block mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={newExpDate}
                    onChange={(e) => setNewExpDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-blue-600"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddStandardSet}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20"
              >
                Save Standard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Retire Standard Modal (§14) */}
      {retireTargetSet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-red-300 dark:border-red-900 max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={() => setRetireTargetSet(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Retire Standard {retireTargetSet.setId}? (§14)
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-sans">
                Retiring this set will permanently prevent it from being assigned to any new verification test sessions. Past sessions will preserve historical traceability integrity.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 font-mono text-xs">
              <div>Set: <strong className="text-red-950 dark:text-red-200">{retireTargetSet.setId} (Class {retireTargetSet.accuracyClass})</strong></div>
              <div>Certificate: {retireTargetSet.certificateNumber}</div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRetireTargetSet(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRetire}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md shadow-red-600/20"
              >
                Retire Standard
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};
