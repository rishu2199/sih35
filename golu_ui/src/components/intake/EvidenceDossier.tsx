import React, { useState } from 'react';
import { Check, Plus, Eye, X, Camera, ShieldCheck, FileText } from 'lucide-react';

export interface EvidenceCategory {
  id: string;
  category: string;
  fileName: string;
  isComplete: boolean;
  uploadedAt: string;
  previewUrl: string;
}

interface EvidenceDossierProps {
  evidence: Record<string, boolean>;
  onToggleEvidence: (key: string) => void;
  isReadOnly?: boolean;
}

export const EvidenceDossier: React.FC<EvidenceDossierProps> = ({
  evidence,
  onToggleEvidence,
  isReadOnly = false,
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<EvidenceCategory | null>(null);

  // 5 Canonical Evidence Categories (§18)
  const categories: EvidenceCategory[] = [
    {
      id: 'nameplate',
      category: 'NAMEPLATE',
      fileName: 'Nameplate_rating.jpg',
      isComplete: !!evidence['nameplate'],
      uploadedAt: '04 Oct 2026, 12:41',
      previewUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'frontView',
      category: 'FRONT VIEW',
      fileName: 'Front_scale_view.jpg',
      isComplete: !!evidence['frontView'],
      uploadedAt: '04 Oct 2026, 12:42',
      previewUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'sealingPoint',
      category: 'SEALING POINT',
      fileName: 'Wire_lead_seal.jpg',
      isComplete: !!evidence['sealingPoint'],
      uploadedAt: '04 Oct 2026, 12:42',
      previewUrl: 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'levelBubble',
      category: 'LEVEL BUBBLE',
      fileName: 'Level_indicator.jpg',
      isComplete: !!evidence['levelBubble'],
      uploadedAt: '04 Oct 2026, 12:45',
      previewUrl: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'specDocument',
      category: 'DOC / SPEC',
      fileName: 'Oiml_datasheet.pdf',
      isComplete: !!evidence['specDocument'],
      uploadedAt: '04 Oct 2026, 12:40',
      previewUrl: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=800&auto=format&fit=crop&q=80',
    },
  ];

  const completedCount = Object.values(evidence).filter(Boolean).length;
  const isAllComplete = completedCount === 5;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
      {/* Header (§18 & §20) */}
      <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-blue-600 dark:text-blue-400">
            04 STATUTORY PHOTO DOSSIER
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Capture the 5 mandatory evidence records required for statutory type verification.
          </p>
        </div>

        <span
          className={`text-xs font-mono font-bold px-3 py-1 rounded-full border self-start sm:self-auto flex items-center gap-1.5 ${
            isAllComplete
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
              : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isAllComplete ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          <span>{completedCount} / 5 evidence items captured</span>
        </span>
      </div>

      {/* 5 Evidence Cards (§18 & §19) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {categories.map((item) => {
          const isDone = !!evidence[item.id];

          return (
            <div
              key={item.id}
              onClick={() => {
                if (isDone) {
                  setSelectedPhoto(item);
                } else if (!isReadOnly) {
                  onToggleEvidence(item.id);
                }
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                isDone
                  ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 hover:border-emerald-400'
                  : 'border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 hover:border-blue-400'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isDone
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 group-hover:bg-blue-600 group-hover:text-white'
                    }`}
                  >
                    {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Plus className="w-3.5 h-3.5 stroke-[3]" />}
                  </span>

                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    {isDone ? '✓ Captured' : 'Pending'}
                  </span>
                </div>

                <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {item.category}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span className="truncate max-w-[85px]">{isDone ? item.fileName : '+ Add photo'}</span>
                {isDone && (
                  <span className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
                    View
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Checklist (§20) */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-4 text-xs font-mono">
        {categories.map((item) => (
          <div key={item.id} className="flex items-center gap-1.5">
            <span className={evidence[item.id] ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'}>
              {item.category}
            </span>
            <span className={evidence[item.id] ? 'text-emerald-600 font-bold' : 'text-slate-300 dark:text-slate-600'}>
              {evidence[item.id] ? '✓' : '○'}
            </span>
          </div>
        ))}
      </div>

      {/* Photo Preview Modal (§19) */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-4 px-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  {selectedPhoto.category} · Evidence Record
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-video bg-slate-100 dark:bg-slate-800 relative">
                <img
                  src={selectedPhoto.previewUrl}
                  alt={selectedPhoto.category}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
                <span>File: {selectedPhoto.fileName}</span>
                <span>Captured: {selectedPhoto.uploadedAt}</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={() => {
                      onToggleEvidence(selectedPhoto.id);
                      setSelectedPhoto(null);
                    }}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
                  >
                    Remove Photo
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedPhoto(null)}
                  className="px-5 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer ml-auto"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
