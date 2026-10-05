import React, { useState } from 'react';
import { Terminal, Trash2, ChevronDown, ChevronUp, Code, Copy, Check } from 'lucide-react';

interface CommunicationLogEntry {
  id: string;
  time: string;
  direction: 'RX' | 'TX';
  rawPayload: string;
  hexBytes?: string;
  parsedSummary: string;
}

interface LiveCommunicationStreamProps {
  logs: CommunicationLogEntry[];
  onClearLogs: () => void;
  protocolName: string;
}

export const LiveCommunicationStream: React.FC<LiveCommunicationStreamProps> = ({
  logs,
  onClearLogs,
  protocolName,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showHex, setShowHex] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLogs = () => {
    const text = logs
      .map((l) => `${l.time}  ${l.direction}  ${showHex ? l.hexBytes || l.rawPayload : l.rawPayload}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-foundation-200 rounded-3xl shadow-xs overflow-hidden transition-all">
      {/* Header / Collapsible Bar */}
      <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-foundation-100 text-foundation-700 flex items-center justify-center">
            <Terminal size={16} />
          </div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-foundation-900 font-sans tracking-tight">
              SERIAL TELEMETRY LOG
            </h3>
            <span className="font-mono text-[11px] text-foundation-500">
              • {logs.length} messages
            </span>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-foundation-100 text-foundation-600 font-semibold hidden sm:inline-block">
              {protocolName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isExpanded && (
            <>
              <button
                type="button"
                onClick={() => setShowHex(!showHex)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-colors ${
                  showHex
                    ? 'bg-purple-100 text-purple-800 border border-purple-200'
                    : 'bg-foundation-100 text-foundation-600 hover:bg-foundation-200'
                }`}
              >
                {showHex ? 'ASCII' : 'HEX'}
              </button>

              <button
                type="button"
                onClick={handleCopyLogs}
                className="p-1.5 rounded-lg text-foundation-500 hover:text-foundation-800 hover:bg-foundation-100 transition-colors"
                title="Copy telemetry"
              >
                {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              </button>

              <button
                type="button"
                onClick={onClearLogs}
                className="px-2.5 py-1 rounded-lg border border-foundation-200 bg-white hover:bg-foundation-50 text-[11px] font-semibold text-foundation-600 transition-colors flex items-center gap-1"
              >
                <Trash2 size={12} />
                <span>Clear Log</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1.5 rounded-xl border border-foundation-200 bg-foundation-50 hover:bg-foundation-100 text-xs font-mono font-bold text-foundation-700 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>{isExpanded ? 'Collapse' : 'Expand'}</span>
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Expanded Terminal Panel */}
      {isExpanded && (
        <div className="border-t border-foundation-100 p-5 bg-slate-950 font-mono text-[11px] text-slate-300 space-y-2">
          <div className="max-h-60 overflow-y-auto space-y-1.5 pr-2 select-text">
            {logs.length === 0 ? (
              <div className="py-6 text-center text-slate-600 italic">
                No serial telemetry received yet. Awaiting scale frames...
              </div>
            ) : (
              logs.slice(-25).map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between gap-3 font-mono py-0.5 border-b border-slate-900/60 hover:bg-slate-900/40 px-1 rounded transition-colors"
                >
                  <div className="flex items-center gap-3 truncate">
                    <span className="text-slate-500 shrink-0 select-none">{log.time}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded shrink-0 select-none ${
                        log.direction === 'RX'
                          ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                          : 'bg-slate-800 text-sky-400 border border-slate-700'
                      }`}
                    >
                      {log.direction}
                    </span>
                    <span className="text-slate-200 truncate select-all">
                      {showHex ? log.hexBytes || log.rawPayload : log.rawPayload}
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-400 shrink-0 font-sans hidden sm:inline-block">
                    {log.parsedSummary}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>Baud: 9600 bps • 8 Data Bits • No Parity • 1 Stop Bit (8-N-1)</span>
            <span>Buffer: 25 frames cached</span>
          </div>
        </div>
      )}
    </div>
  );
};
