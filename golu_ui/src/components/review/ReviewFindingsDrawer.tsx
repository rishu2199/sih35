import React, { useState } from 'react';
import { X, AlertTriangle, Info, Check, MessageSquare, Plus, Clock, UserCheck } from 'lucide-react';
import { ReviewFinding } from './types';

interface ReviewFindingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  findings: ReviewFinding[];
  onToggleResolve: (findingId: string) => void;
  onAddComment?: (newFinding: Omit<ReviewFinding, 'id' | 'timestamp' | 'resolved'>) => void;
}

export const ReviewFindingsDrawer: React.FC<ReviewFindingsDrawerProps> = ({
  isOpen,
  onClose,
  findings,
  onToggleResolve,
  onAddComment,
}) => {
  const [newCommentText, setNewCommentText] = useState('');
  const [newCommentSeverity, setNewCommentSeverity] = useState<'FLAG' | 'NOTE'>('NOTE');
  const [selectedTest, setSelectedTest] = useState('Weighing • Ascending Series');

  if (!isOpen) return null;

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    onAddComment?.({
      observationIndex: 'Officer Note',
      testName: selectedTest,
      severity: newCommentSeverity,
      title: newCommentSeverity === 'FLAG' ? 'Reviewer Flag' : 'Technical Note',
      author: 'R. Kumar • Technical Reviewer',
      text: newCommentText.trim(),
    });
    setNewCommentText('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foundation-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-foundation-200">
          {/* Header */}
          <div className="p-5 border-b border-foundation-200 bg-foundation-50 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-brand-600" />
                <h3 className="text-sm font-bold text-foundation-900 tracking-tight font-sans">
                  Review Findings & Audit Notes
                </h3>
              </div>
              <p className="text-[11px] text-foundation-500 mt-0.5 font-mono">
                Statutory observation trace · {findings.length} comment{findings.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-foundation-400 hover:text-foundation-700 hover:bg-foundation-200 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Finding Cards List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {findings.length === 0 ? (
              <div className="py-12 text-center text-foundation-400">
                <Check className="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-60" />
                <p className="text-xs font-semibold text-foundation-700">No review findings logged</p>
                <p className="text-[11px] text-foundation-400 mt-1">All observation checkpoints verified clean.</p>
              </div>
            ) : (
              findings.map((f) => {
                const isFlag = f.severity === 'FLAG' || f.severity === 'BLOCKER';

                return (
                  <div
                    key={f.id}
                    className={`p-4 rounded-xl border transition-all ${
                      f.resolved
                        ? 'bg-foundation-50/50 border-foundation-200 opacity-75'
                        : isFlag
                        ? 'bg-amber-50/40 border-amber-200 shadow-xs'
                        : 'bg-blue-50/30 border-blue-200 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                            f.severity === 'BLOCKER'
                              ? 'bg-rose-100 text-rose-800'
                              : f.severity === 'FLAG'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {isFlag ? <AlertTriangle size={11} /> : <Info size={11} />}
                          {f.severity}
                        </span>
                        <span className="font-mono text-xs font-bold text-foundation-800">
                          {f.observationIndex}
                        </span>
                      </div>

                      {/* Resolve toggle */}
                      <button
                        onClick={() => onToggleResolve(f.id)}
                        className={`px-2 py-1 rounded text-[11px] font-mono font-semibold transition-colors flex items-center gap-1 ${
                          f.resolved
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-white border border-foundation-200 text-foundation-600 hover:border-emerald-300 hover:text-emerald-700'
                        }`}
                      >
                        <Check size={12} className={f.resolved ? 'text-emerald-600' : 'text-foundation-400'} />
                        <span>{f.resolved ? 'Resolved' : 'Resolve'}</span>
                      </button>
                    </div>

                    <div className="text-xs font-bold text-foundation-900 mb-1">
                      {f.title}
                    </div>

                    <p className="text-xs text-foundation-700 leading-relaxed font-sans mb-3 bg-white/70 p-2.5 rounded-lg border border-foundation-100 italic">
                      "{f.text}"
                    </p>

                    <div className="flex items-center justify-between text-[11px] font-mono text-foundation-500 pt-2 border-t border-foundation-100">
                      <span className="font-medium text-foundation-700">{f.author}</span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {f.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })
            )}

            {/* Add new review comment block */}
            <form onSubmit={handleAddNew} className="p-4 rounded-xl border border-dashed border-foundation-300 bg-foundation-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foundation-800">Add Technical Observation</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setNewCommentSeverity('NOTE')}
                    className={`px-2 py-0.5 text-[10px] font-mono rounded ${
                      newCommentSeverity === 'NOTE' ? 'bg-blue-600 text-white font-bold' : 'bg-white text-foundation-600 border'
                    }`}
                  >
                    Note
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewCommentSeverity('FLAG')}
                    className={`px-2 py-0.5 text-[10px] font-mono rounded ${
                      newCommentSeverity === 'FLAG' ? 'bg-amber-600 text-white font-bold' : 'bg-white text-foundation-600 border'
                    }`}
                  >
                    Flag
                  </button>
                </div>
              </div>

              <textarea
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Enter statutory observation, margin check, or review note..."
                rows={2}
                className="w-full p-2.5 text-xs rounded-lg border border-foundation-200 bg-white placeholder-foundation-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!newCommentText.trim()}
                  className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center gap-1"
                >
                  <Plus size={13} />
                  <span>Log Note</span>
                </button>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-foundation-200 bg-foundation-50 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-foundation-800 hover:bg-foundation-900 text-white text-xs font-bold transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
