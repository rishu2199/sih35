import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Camera,
  ArrowRight,
  Plus,
  X,
  FileText,
  Eye,
  Check,
  ShieldAlert,
} from 'lucide-react';

export interface FindingItem {
  id: string;
  checkName: string;
  category: string;
  result: 'PASS' | 'WARNING' | 'FAIL';
  evidenceType: string;
  evidenceCount: number;
  notes: string;
  detailedObservation?: string;
  inspector?: string;
  timestamp?: string;
  evidenceThumbnail?: string;
}

interface InspectionFindingsTableProps {
  findings: FindingItem[];
  onAddFinding: (newFinding: Partial<FindingItem>) => void;
  isReadOnly?: boolean;
}

export const InspectionFindingsTable: React.FC<InspectionFindingsTableProps> = ({
  findings,
  onAddFinding,
  isReadOnly = false,
}) => {
  const [selectedFinding, setSelectedFinding] = useState<FindingItem | null>(null);
  const [isAddFindingOpen, setIsAddFindingOpen] = useState(false);

  // Form states for Add Finding Drawer (§17 & §18)
  const [formCategory, setFormCategory] = useState('Physical Condition');
  const [formSeverity, setFormSeverity] = useState<'NOTE' | 'ATTENTION' | 'CRITICAL'>('NOTE');
  const [formDescription, setFormDescription] = useState('');
  const [formEvidenceAttached, setFormEvidenceAttached] = useState(true);

  const handleSubmitNewFinding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDescription.trim()) return;

    const resultStatus =
      formSeverity === 'CRITICAL' ? 'FAIL' : formSeverity === 'ATTENTION' ? 'WARNING' : 'PASS';

    onAddFinding({
      checkName: formCategory,
      category: formCategory,
      result: resultStatus,
      evidenceType: '1 photo',
      evidenceCount: 1,
      notes: formDescription,
      detailedObservation: formDescription,
      inspector: 'Metrologist',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST',
      evidenceThumbnail:
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
    });

    setIsAddFindingOpen(false);
    setFormDescription('');
  };

  const getResultBadge = (res: 'PASS' | 'WARNING' | 'FAIL') => {
    if (res === 'PASS') {
      return (
        <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          <Check className="w-3 h-3 stroke-[2.5]" />
          PASS
        </span>
      );
    }
    if (res === 'WARNING') {
      return (
        <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
          <AlertTriangle className="w-3 h-3" />
          ATTENTION
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
        <XCircle className="w-3 h-3" />
        FAIL
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      {/* Table Header with Add Finding Trigger (§15 & §17) */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-slate-500">
            INSPECTION FINDINGS
          </span>
          <h3 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
            Physical Inspection Checklist &amp; Evidence Records
          </h3>
        </div>

        {!isReadOnly && (
          <button
            type="button"
            onClick={() => setIsAddFindingOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Finding</span>
          </button>
        )}
      </div>

      {/* 6 Statutory Rows Table (§15) */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 font-mono text-[11px] text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th className="py-3 px-6">Inspection Check</th>
              <th className="py-3 px-4">Result</th>
              <th className="py-3 px-4">Evidence</th>
              <th className="py-3 px-4">Notes</th>
              <th className="py-3 px-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
            {findings.map((f) => (
              <tr
                key={f.id}
                onClick={() => setSelectedFinding(f)}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
              >
                <td className="py-3.5 px-6 font-bold text-slate-900 dark:text-white">
                  {f.checkName}
                </td>
                <td className="py-3.5 px-4">
                  {getResultBadge(f.result)}
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                  <span className="inline-flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-slate-400" />
                    <span>{f.evidenceType}</span>
                  </span>
                </td>
                <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                  {f.notes}
                </td>
                <td className="py-3.5 px-6 text-right">
                  <span className="inline-flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform">
                    <span>Inspect</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Progressive Disclosure Drawer (§16) */}
      {selectedFinding && (
        <div className="fixed inset-0 z-50 overflow-hidden select-none">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setSelectedFinding(null)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col animate-in slide-in-from-right duration-200">
              {/* Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                    Inspection Detail (§16)
                  </span>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {selectedFinding.checkName}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedFinding(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
                {/* Result Pill */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">
                    Statutory Result
                  </span>
                  {getResultBadge(selectedFinding.result)}
                </div>

                {/* Evidence Photo */}
                <div className="space-y-2">
                  <span className="font-bold uppercase tracking-wider text-[11px] text-slate-500">
                    Evidence Record
                  </span>
                  <div className="aspect-video w-full rounded-2xl bg-slate-900 overflow-hidden relative shadow-inner">
                    <img
                      src={
                        selectedFinding.evidenceThumbnail ||
                        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80'
                      }
                      alt={selectedFinding.checkName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Detailed Observation */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1.5">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500 font-mono">
                    Observation
                  </span>
                  <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                    {selectedFinding.detailedObservation || selectedFinding.notes}
                  </p>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-3 font-mono text-[11px]">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 font-sans block mb-0.5">Inspector</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {selectedFinding.inspector || 'Metrologist'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 font-sans block mb-0.5">Captured</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {selectedFinding.timestamp || '04 Oct 2026 · 15:08'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedFinding(null)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs transition-colors cursor-pointer"
                >
                  Close Inspection Detail
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Finding Drawer (§17 & §18) */}
      {isAddFindingOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden select-none">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setIsAddFindingOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col animate-in slide-in-from-right duration-200">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                    Audit Observation (§17)
                  </span>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Add Inspection Finding
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddFindingOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitNewFinding} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
                {/* Category */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-slate-900 dark:text-white"
                  >
                    <option value="Physical condition">Physical condition</option>
                    <option value="Spirit level alignment">Spirit level alignment</option>
                    <option value="Lead wire seal">Lead wire seal</option>
                    <option value="Holographic sticker">Holographic sticker</option>
                    <option value="Calibration jumper">Calibration jumper</option>
                    <option value="Nameplate & markings">Nameplate & markings</option>
                    <option value="Other Finding">Other Finding</option>
                  </select>
                </div>

                {/* Severity (§18: NOTE / ATTENTION / CRITICAL) */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                    Severity Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['NOTE', 'ATTENTION', 'CRITICAL'] as const).map((sev) => (
                      <button
                        key={sev}
                        type="button"
                        onClick={() => setFormSeverity(sev)}
                        className={`py-2 px-3 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                          formSeverity === sev
                            ? sev === 'CRITICAL'
                              ? 'bg-red-600 text-white border-red-600'
                              : sev === 'ATTENTION'
                              ? 'bg-amber-500 text-slate-950 border-amber-500'
                              : 'bg-blue-600 text-white border-blue-600'
                            : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {sev}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                    Description &amp; Observation
                  </label>
                  <textarea
                    rows={4}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Enter observation findings, seal serials, or defect notes..."
                    required
                    className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Evidence Attachment */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Link Camera Photo
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formEvidenceAttached}
                    onChange={(e) => setFormEvidenceAttached(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddFindingOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-500 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/25 transition-all cursor-pointer"
                  >
                    Add Finding
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
