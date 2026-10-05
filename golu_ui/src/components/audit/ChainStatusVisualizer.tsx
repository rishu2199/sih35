import React from 'react';
import { ShieldCheck, AlertTriangle, ArrowRight } from 'lucide-react';
import { AuditEvent } from './types';

interface ChainStatusVisualizerProps {
  events: AuditEvent[];
  isCorrupted: boolean;
  corruptedBlockNumber?: number;
  onSelectBlock: (event: AuditEvent) => void;
}

export const ChainStatusVisualizer: React.FC<ChainStatusVisualizerProps> = ({
  events,
  isCorrupted,
  corruptedBlockNumber = 36,
  onSelectBlock,
}) => {
  // Sort blocks ascending by blockNumber for chronological chain progression
  const sortedBlocks = [...events].sort((a, b) => a.blockNumber - b.blockNumber);

  return (
    <div className="bg-white border border-foundation-200 rounded-2xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-foundation-100">
        <div>
          <span className="text-[10px] font-bold text-foundation-500 uppercase tracking-wider font-mono">
            Cryptographic Chain Status
          </span>
          <h3 className="text-sm font-bold text-foundation-900 font-sans mt-0.5">
            Sequential Recursive Merkle-Linked Block Progression
          </h3>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold border shadow-xs ${
              isCorrupted
                ? 'bg-rose-50 text-rose-800 border-rose-300 animate-pulse'
                : 'bg-emerald-50 text-emerald-800 border-emerald-300'
            }`}
          >
            {isCorrupted ? (
              <>
                <AlertTriangle size={13} className="text-rose-600" />
                <span>Link Violation Detected at Block #{corruptedBlockNumber}</span>
              </>
            ) : (
              <>
                <ShieldCheck size={13} className="text-emerald-600" />
                <span>Contiguous Proof Verified</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Horizontal Chain Stream */}
      <div className="overflow-x-auto py-2">
        <div className="flex items-center gap-2 min-w-max">
          {sortedBlocks.map((block, index) => {
            const isCorruptThisBlock = isCorrupted && block.blockNumber === corruptedBlockNumber;
            const isLast = index === sortedBlocks.length - 1;
            const isDirector = block.category === 'SIGNATURE';

            return (
              <React.Fragment key={block.id}>
                <button
                  type="button"
                  onClick={() => onSelectBlock(block)}
                  className={`flex flex-col items-center p-3 rounded-xl border transition-all text-center group cursor-pointer ${
                    isCorruptThisBlock
                      ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-500/25 text-rose-950'
                      : isDirector
                      ? 'bg-purple-50/70 border-purple-200 hover:border-purple-300 text-purple-950 shadow-xs'
                      : 'bg-foundation-50 hover:bg-white border-foundation-200 hover:border-brand-300 hover:shadow-xs text-foundation-800'
                  }`}
                  title={`Inspect Block #${block.blockNumber}: ${block.title}`}
                >
                  <div className="flex items-center gap-1 font-mono text-[10px] font-bold">
                    <span>BLK</span>
                    <span className="text-foundation-900 font-extrabold">{block.blockNumber}</span>
                  </div>

                  <div className="mt-1">
                    {isCorruptThisBlock ? (
                      <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-bold">
                        ✕
                      </span>
                    ) : isDirector ? (
                      <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-bold">
                        ★
                      </span>
                    ) : (
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                        ✓
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] font-mono text-foundation-500 mt-1 truncate max-w-[84px]">
                    {block.id}
                  </span>
                </button>

                {!isLast && (
                  <div
                    className={`flex items-center font-mono text-xs px-1 ${
                      isCorrupted && block.blockNumber === corruptedBlockNumber - 1
                        ? 'text-rose-500 font-bold'
                        : 'text-foundation-400'
                    }`}
                  >
                    <span
                      className={`w-3 h-0.5 ${
                        isCorrupted && block.blockNumber === corruptedBlockNumber - 1
                          ? 'bg-rose-500'
                          : 'bg-foundation-300'
                      }`}
                    />
                    <ArrowRight size={12} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] font-mono text-foundation-500 pt-3 border-t border-foundation-100">
        <span>Genesis Hash: 0000000000000000... (Block #30)</span>
        <span>Standard: WELMEC 7.2 Software Guide § 3.2</span>
      </div>
    </div>
  );
};
