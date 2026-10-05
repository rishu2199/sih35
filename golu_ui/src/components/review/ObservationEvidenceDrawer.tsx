import React, { useState } from 'react';
import {
  X,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  MessageSquare,
  Plus,
  Clock,
  ShieldCheck,
  Scale,
} from 'lucide-react';
import { ReviewTestItem, ReviewFinding } from './types';

interface ObservationEvidenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  test: ReviewTestItem | null;
  onAddComment?: (finding: Omit<ReviewFinding, 'id' | 'timestamp' | 'resolved'>) => void;
}

export const ObservationEvidenceDrawer: React.FC<ObservationEvidenceDrawerProps> = ({
  isOpen,
  onClose,
  test,
  onAddComment,
}) => {
  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState<'NOTE' | 'FLAG'>('NOTE');

  if (!isOpen || !test) return null;

  const isPass = test.status === 'PASS';
  const isMarginal = test.status === 'MARGINAL';
  const isFail = test.status === 'FAIL';

  // Sample observation datasets based on test code
  const getObservationRows = () => {
    if (test.code.includes('3.5.1') || test.name.toLowerCase().includes('weighing')) {
      return [
        { load: '0.100 kg (Min)', observed: '0.100 kg', error: '0.000 g', mpe: '±2.5 g', result: 'PASS' },
        { load: '2.500 kg (500e)', observed: '2.500 kg', error: '0.000 g', mpe: '±2.5 g', result: 'PASS' },
        { load: '10.000 kg (2000e)', observed: '10.002 kg', error: '+2.000 g', mpe: '±5.0 g', result: 'PASS' },
        { load: '20.000 kg', observed: '20.003 kg', error: '+3.000 g', mpe: '±7.5 g', result: 'PASS' },
        { load: '30.000 kg (Max)', observed: '30.004 kg', error: '+4.000 g', mpe: '±7.5 g', result: 'PASS' },
      ];
    }
    if (test.code.includes('3.6.2') || test.name.toLowerCase().includes('eccentricity')) {
      return [
        { load: '10.000 kg (Pos 1 - Center)', observed: '10.000 kg', error: '0.000 g', mpe: '±5.0 g', result: 'PASS' },
        { load: '10.000 kg (Pos 2 - Front-Left)', observed: '10.002 kg', error: '+2.000 g', mpe: '±5.0 g', result: 'PASS' },
        { load: '10.000 kg (Pos 3 - Back-Left)', observed: '10.001 kg', error: '+1.000 g', mpe: '±5.0 g', result: 'PASS' },
        { load: '10.000 kg (Pos 4 - Back-Right)', observed: '10.004 kg', error: '+4.000 g', mpe: '±5.0 g', result: 'PASS' },
        { load: '10.000 kg (Pos 5 - Front-Right)', observed: '10.002 kg', error: '+2.000 g', mpe: '±5.0 g', result: 'PASS' },
      ];
    }
    if (test.code.includes('3.6.1') || test.name.toLowerCase().includes('repeatability')) {
      return [
        { load: '24.000 kg (Run 01)', observed: '24.001 kg', error: '+1.000 g', mpe: '±7.5 g', result: 'PASS' },
        { load: '24.000 kg (Run 02)', observed: '24.002 kg', error: '+2.000 g', mpe: '±7.5 g', result: 'PASS' },
        { load: '24.000 kg (Run 03)', observed: '24.001 kg', error: '+1.000 g', mpe: '±7.5 g', result: 'PASS' },
        { load: '24.000 kg (Run 04)', observed: '24.002 kg', error: '+2.000 g', mpe: '±7.5 g', result: 'PASS' },
        { load: '24.000 kg (Run 05)', observed: '24.001 kg', error: '+1.000 g', mpe: '±7.5 g', result: 'PASS' },
      ];
    }
    return [
      { load: 'Reference Baseline', observed: 'Normal', error: '0.000 g', mpe: '±2.5 g', result: 'PASS' },
      { load: 'Tare Compensation', observed: 'Balanced', error: '0.000 g', mpe: '±1.25 g', result: 'PASS' },
    ];
  };

  const observationRows = getObservationRows();

  const handleAddCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    onAddComment?.({
      observationIndex: 'Observation Review',
      testName: test.name,
      severity: commentType,
      title: commentType === 'FLAG' ? 'Reviewer Observation Flag' : 'Observation Audit Note',
      author: 'R. Kumar • Technical Reviewer',
      text: newComment.trim(),
    });

    setNewComment('');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-hidden font-mono select-none"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foundation-950/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col border-l border-foundation-200">
          {/* Header (§10) */}
          <div className="p-5 border-b border-foundation-200 bg-foundation-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200 text-brand-700 flex items-center justify-center shrink-0">
                <FileCheck2 size={20} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-foundation-500 uppercase tracking-wider block">
                  OBSERVATION REVIEW & EVIDENCE
                </span>
                <h3 className="text-base font-bold text-foundation-950 font-sans tracking-tight">
                  {test.name}
                </h3>
                <span className="text-xs text-foundation-500 font-mono">
                  {test.code}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-foundation-400 hover:text-foundation-700 hover:bg-foundation-200 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Primary Statutory Assessment (§10) */}
            <div className="p-4 rounded-xl bg-foundation-50 border border-foundation-200 space-y-2 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-foundation-200">
                <span className="text-foundation-500 uppercase tracking-wider text-[10px] font-bold">
                  Statutory Conformance
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                    isFail
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : isMarginal
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  }`}
                >
                  {isFail ? (
                    <XCircle size={12} className="text-rose-600" />
                  ) : isMarginal ? (
                    <AlertTriangle size={12} className="text-amber-600" />
                  ) : (
                    <CheckCircle2 size={12} className="text-emerald-600" />
                  )}
                  <span>{test.status}</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
                <div>
                  <span className="text-foundation-400 text-[10px] block">Dataset Volume</span>
                  <span className="font-bold text-foundation-900">{test.observationsCount}</span>
                </div>
                <div>
                  <span className="text-foundation-400 text-[10px] block">Turning Point Analysis</span>
                  <span className="font-bold text-foundation-900">P = I + 0.5e - ΔL ✓</span>
                </div>
              </div>

              <p className="text-xs text-foundation-700 font-sans mt-2 pt-2 border-t border-foundation-200/60">
                {test.detail}
              </p>
            </div>

            {/* Observation Table (§10) */}
            <div className="border border-foundation-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="p-3 bg-foundation-100/60 border-b border-foundation-200 flex items-center justify-between">
                <span className="text-xs font-bold text-foundation-900 font-sans">
                  Recorded Test Observations
                </span>
                <span className="text-[10px] text-foundation-500">
                  Read-only laboratory log
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-foundation-50 text-[10px] text-foundation-500 uppercase tracking-wider border-b border-foundation-200">
                      <th className="py-2 px-3">Target Load</th>
                      <th className="py-2 px-3">Observed Reading</th>
                      <th className="py-2 px-3">Calculated Error</th>
                      <th className="py-2 px-3">Legal Tolerance</th>
                      <th className="py-2 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-foundation-100 font-mono">
                    {observationRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-foundation-50/50">
                        <td className="py-2 px-3 font-semibold text-foundation-900">{row.load}</td>
                        <td className="py-2 px-3 text-foundation-800">{row.observed}</td>
                        <td className="py-2 px-3 font-bold text-brand-700">{row.error}</td>
                        <td className="py-2 px-3 text-foundation-600">{row.mpe}</td>
                        <td className="py-2 px-3 text-right">
                          <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                            ✓ {row.result}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Audit Comment Formulation (§10) */}
            <div className="p-4 rounded-xl border border-foundation-200 bg-white space-y-3">
              <div className="flex items-center gap-2">
                <MessageSquare size={16} className="text-brand-600" />
                <h4 className="text-xs font-bold text-foundation-900 uppercase tracking-wider font-sans">
                  Reviewer Audit Comment
                </h4>
              </div>

              <form onSubmit={handleAddCommentSubmit} className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCommentType('NOTE')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                      commentType === 'NOTE'
                        ? 'bg-blue-600 text-white'
                        : 'bg-foundation-100 text-foundation-700 hover:bg-foundation-200'
                    }`}
                  >
                    Technical Note
                  </button>
                  <button
                    type="button"
                    onClick={() => setCommentType('FLAG')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                      commentType === 'FLAG'
                        ? 'bg-amber-600 text-white'
                        : 'bg-foundation-100 text-foundation-700 hover:bg-foundation-200'
                    }`}
                  >
                    Observation Flag
                  </button>
                </div>

                <textarea
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Enter statutory observation comment or exception note..."
                  className="w-full p-2.5 rounded-lg border border-foundation-200 text-xs font-sans text-foundation-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!newComment.trim()}
                    className="px-4 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    + Add Comment
                  </button>
                </div>
              </form>

              <div className="p-2.5 rounded-lg bg-foundation-50 border border-foundation-200 text-[11px] text-foundation-600 font-sans">
                <strong>Reviewer note:</strong> "Readings consistent with standard sequence. All hysteresis values within OIML Class III Table 6 corridor."
              </div>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-foundation-200 bg-foundation-50 flex items-center justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-foundation-200 hover:bg-foundation-300 text-foundation-900 font-bold text-xs cursor-pointer"
            >
              Close Observation Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
