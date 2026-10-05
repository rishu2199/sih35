import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Download,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  RefreshCw,
  QrCode,
  ExternalLink,
  Copy,
  Check,
  RotateCcw,
} from 'lucide-react';
import {
  downloadReport,
  fetchRepositoryReports,
  type ReportItem,
} from './downloadService';

interface ReportRepositoryViewProps {
  onOpenSession?: (sessionId: string) => void;
  className?: string;
}

export const ReportRepositoryView: React.FC<ReportRepositoryViewProps> = ({
  onOpenSession,
  className = '',
}) => {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [classFilter, setClassFilter] = useState('ALL');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi' | 'bilingual'>('en');

  // Download loading trackers
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadingType, setDownloadingType] = useState<'pdf' | 'docx' | null>(null);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // QR Modal
  const [activeQrReport, setActiveQrReport] = useState<ReportItem | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchRepositoryReports({
        search: searchQuery,
        status: statusFilter,
        class: classFilter,
        stage: stageFilter,
      });
      setReports(data);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, classFilter, stageFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleDownload = async (
    type: 'pdf' | 'docx',
    sessionId?: string,
    sessionNumber?: string
  ) => {
    const key = sessionId || 'standard';
    setDownloadingId(key);
    setDownloadingType(type);
    setActionMessage(null);

    const res = await downloadReport({
      type,
      sessionId,
      sessionNumber,
      language: selectedLanguage,
    });

    if (res.success) {
      setActionMessage({ text: res.message, type: 'success' });
    } else {
      setActionMessage({ text: res.message, type: 'error' });
    }

    setDownloadingId(null);
    setDownloadingType(null);

    setTimeout(() => {
      setActionMessage(null);
    }, 4000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  // Metrics
  const totalCount = reports.length;
  const approvedCount = reports.filter((r) => r.status === 'APPROVED').length;
  const pendingCount = reports.filter((r) => r.status === 'PENDING_REVIEW').length;
  const rejectedCount = reports.filter((r) => r.status === 'REJECTED').length;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Top Banner: Statutory Title and Quick One-Click Actions */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#0c1322] p-5 sm:p-6 shadow-card relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                <FileText className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2 font-display">
                <span>Standardized Digital Test Report Repository</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">
                  OIML R 76-2:2007
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
              Mandatory digital repository and instant search &amp; retrieval facility conforming to SIH Problem Statement 26035.
              Provides dual-format export in official PDF/A-1b and editable Microsoft Word (.docx) formats with embedded eMaap cryptographic seals.
            </p>
          </div>

          {/* Quick Dual Export Actions */}
          <div className="flex flex-col items-end gap-2.5 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#070c18] p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                <span className="text-[11px] font-mono px-1.5 text-slate-500 dark:text-slate-400">Lang:</span>
                {(['en', 'hi', 'bilingual'] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setSelectedLanguage(lang)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      selectedLanguage === lang
                        ? 'bg-brand-600 text-white font-bold shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {lang === 'en' ? 'EN' : lang === 'hi' ? 'हिंदी' : 'Dual'}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => handleDownload('pdf')}
                disabled={downloadingId === 'standard' && downloadingType === 'pdf'}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {downloadingId === 'standard' && downloadingType === 'pdf' ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>Sample PDF/A Report</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleDownload('docx')}
              disabled={downloadingId === 'standard' && downloadingType === 'docx'}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-700/60 bg-slate-900/60 hover:bg-slate-800 text-slate-200 text-xs font-medium shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {downloadingId === 'standard' && downloadingType === 'docx' ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileText className="w-3.5 h-3.5 text-brand-400" />
              )}
              <span>Sample Word (.docx)</span>
            </button>
          </div>
        </div>

        {/* Action toast feedback */}
        {actionMessage && (
          <div
            className={`mt-4 p-3 rounded-lg text-xs flex items-center gap-2 border transition-all ${
              actionMessage.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
            }`}
          >
            {actionMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span className="font-medium">{actionMessage.text}</span>
          </div>
        )}
      </div>

      {/* KPI Metrics Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#0c1322] shadow-card flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Total Repository Reports
          </span>
          <div className="mt-2">
            <span className="text-3xl font-black font-mono text-slate-900 dark:text-white tabular-nums tracking-tight">
              {totalCount} Reports
            </span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-3">
            National metrology digital repository
          </span>
        </div>

        <div className="p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#0c1322] shadow-card flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Approved &amp; Sealed
          </span>
          <div className="mt-2">
            <span className="text-3xl font-black font-mono text-slate-900 dark:text-white tabular-nums tracking-tight">
              {approvedCount} Reports
            </span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-3">
            Legally signed &amp; digitally certified
          </span>
        </div>

        <div className="p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#0c1322] shadow-card flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            In Verification
          </span>
          <div className="mt-2">
            <span className="text-3xl font-black font-mono text-slate-900 dark:text-white tabular-nums tracking-tight">
              {pendingCount} Sessions
            </span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-3">
            Pending technical reviewer audit
          </span>
        </div>

        <div className="p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#0c1322] shadow-card flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Remanded / Rejected
          </span>
          <div className="mt-2">
            <span className="text-3xl font-black font-mono text-slate-900 dark:text-white tabular-nums tracking-tight">
              {rejectedCount} Sessions
            </span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-3">
            Flagged for mandatory re-test
          </span>
        </div>
      </div>

      {/* Search & Multi-Filter Control Toolbar */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#0c1322] p-4 shadow-card">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Free-text Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by serial number (e.g. SN-2026), model (Precision-Pro), manufacturer, or session"
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070c18] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400 font-mono">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070c18] text-slate-800 dark:text-slate-200 focus:outline-hidden text-xs"
              >
                <option value="ALL">All Statuses</option>
                <option value="APPROVED">Approved &amp; Sealed</option>
                <option value="PENDING_REVIEW">Pending Review</option>
                <option value="REJECTED">Remanded / Rejected</option>
              </select>
            </div>

            {/* Class Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400 font-mono">Class:</span>
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070c18] text-slate-800 dark:text-slate-200 focus:outline-hidden text-xs"
              >
                <option value="ALL">All Classes</option>
                <option value="CLASS_I">Class I (Special)</option>
                <option value="CLASS_II">Class II (High)</option>
                <option value="CLASS_III">Class III (Medium)</option>
                <option value="CLASS_IIII">Class IIII (Ordinary)</option>
              </select>
            </div>

            {/* Stage Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400 font-mono">Stage:</span>
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070c18] text-slate-800 dark:text-slate-200 focus:outline-hidden text-xs"
              >
                <option value="ALL">All Stages</option>
                <option value="INITIAL_TYPE_APPROVAL">Initial Pattern Approval</option>
                <option value="SUBSEQUENT_IN_SERVICE">Subsequent In-Service</option>
              </select>
            </div>

            {/* Reset Button */}
            {(statusFilter !== 'ALL' || classFilter !== 'ALL' || stageFilter !== 'ALL' || searchQuery !== '') && (
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('ALL');
                  setClassFilter('ALL');
                  setStageFilter('ALL');
                  setSearchQuery('');
                }}
                className="px-2.5 py-1.5 rounded-xl text-rose-500 hover:bg-rose-500/10 text-xs font-medium flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Reports Table */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#0c1322] shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200/90 dark:border-slate-800/80 bg-slate-50/75 dark:bg-[#070c18]/75 text-slate-400 uppercase tracking-wider font-mono text-[10px] select-none">
                <th className="py-3 px-4">Certificate / Session #</th>
                <th className="py-3 px-4">Instrument Specification</th>
                <th className="py-3 px-4">Accredited Laboratory</th>
                <th className="py-3 px-4">Officer &amp; Date</th>
                <th className="py-3 px-4 text-center">Compliance</th>
                <th className="py-3 px-4">Cryptographic Seal</th>
                <th className="py-3 px-4 text-right">Standardized Export</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 dark:divide-white/[0.06]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-brand-500" />
                    Searching Legal Metrology report archives...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No test reports matched your filter parameters.
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr
                    key={report.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Session Number & Status */}
                    <td className="py-3 px-4 font-mono">
                      <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <span>{report.session_number}</span>
                        {report.is_locked && (
                          <span
                            title="Immutable Statutory Lock Active"
                            className="inline-flex text-emerald-400"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 font-mono">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                            report.status === 'APPROVED'
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              : report.status === 'PENDING_REVIEW'
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                              : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {report.status}
                        </span>
                        <span className="text-[10px] text-slate-400 font-sans">
                          {report.verification_stage === 'INITIAL_TYPE_APPROVAL' ? 'Initial' : 'In-Service'}
                        </span>
                      </div>
                    </td>

                    {/* Instrument Specs */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {report.instrument_model}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {report.manufacturer}
                      </div>
                      <div className="font-mono text-[11px] text-slate-400 mt-0.5">
                        S/N: {report.serial_number} • {report.accuracy_class} • Max {report.max_capacity}
                      </div>
                    </td>

                    {/* Laboratory */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800 dark:text-slate-200 text-xs">
                        {report.laboratory_name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        ISO/IEC 17025 Accredited
                      </div>
                    </td>

                    {/* Officer & Date */}
                    <td className="py-3 px-4">
                      <div className="text-slate-800 dark:text-slate-200 text-xs font-medium">
                        {report.operator_name.includes('(') ? (
                          <>
                            <div>{report.operator_name.split('(')[0].trim()}</div>
                            <div className="text-[11px] text-slate-400 font-normal">
                              ({report.operator_name.split('(')[1]}
                            </div>
                          </>
                        ) : (
                          report.operator_name
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {report.completed_at
                          ? (() => {
                              const d = new Date(report.completed_at);
                              return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
                            })()
                          : report.created_at
                          ? (() => {
                              const d = new Date(report.created_at);
                              return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
                            })()
                          : 'Recent'}
                      </div>
                    </td>

                    {/* Compliance */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-xs font-mono uppercase ${
                          report.overall_compliance === 'PASS'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : report.overall_compliance === 'FAIL'
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {report.overall_compliance === 'PASS' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-rose-400" />
                        )}
                        {report.overall_compliance}
                      </span>
                    </td>

                    {/* Cryptographic Seal */}
                    <td className="py-3 px-4">
                      {report.signature_digest ? (
                        <div className="flex flex-col items-start gap-0.5">
                          <button
                            type="button"
                            onClick={() => setActiveQrReport(report)}
                            className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                          >
                            <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                            <span>SHA-256 Seal</span>
                          </button>
                          <span className="text-[11px] text-teal-400/90 dark:text-teal-300 font-mono">
                            {report.signature_digest.slice(0, 8)}...{report.signature_digest.slice(-6)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs font-sans">Pending Sign</span>
                      )}
                    </td>

                    {/* Actions: Download PDF & Word */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* PDF Download */}
                        <button
                          type="button"
                          onClick={() => handleDownload('pdf', report.id, report.session_number)}
                          disabled={downloadingId === report.id && downloadingType === 'pdf'}
                          title="Download Standardized PDF/A Report"
                          className="w-10 h-10 rounded-xl border border-slate-700/60 bg-slate-900/60 hover:bg-slate-800 text-slate-200 text-[10px] font-bold font-mono flex flex-col items-center justify-center transition-all cursor-pointer shadow-xs disabled:opacity-50"
                        >
                          {downloadingId === report.id && downloadingType === 'pdf' ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-400" />
                          ) : (
                            <Download className="w-3.5 h-3.5 text-slate-400 mb-0.5" />
                          )}
                          <span>PDF</span>
                        </button>

                        {/* Word DOCX Download */}
                        <button
                          type="button"
                          onClick={() => handleDownload('docx', report.id, report.session_number)}
                          disabled={downloadingId === report.id && downloadingType === 'docx'}
                          title="Download Editable Word (.docx) Report"
                          className="w-10 h-10 rounded-xl border border-slate-700/60 bg-slate-900/60 hover:bg-slate-800 text-slate-200 text-[10px] font-bold font-mono flex flex-col items-center justify-center transition-all cursor-pointer shadow-xs disabled:opacity-50"
                        >
                          {downloadingId === report.id && downloadingType === 'docx' ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-400" />
                          ) : (
                            <FileText className="w-3.5 h-3.5 text-slate-400 mb-0.5" />
                          )}
                          <span>DOCX</span>
                        </button>

                        {/* Open Review Details */}
                        {onOpenSession && (
                          <button
                            type="button"
                            onClick={() => onOpenSession(report.id)}
                            title="Inspect in Multi-Tier Review Pipeline"
                            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer ml-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Code & Cryptographic Verification Modal */}
      {activeQrReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#0f1728] rounded-2xl border border-slate-200 dark:border-white/[0.1] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.08]">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-50">
                  Government eMaap Verification Seal
                </h3>
              </div>
              <button
                onClick={() => setActiveQrReport(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-center space-y-3">
              <div className="inline-block p-4 bg-white rounded-xl shadow-md border border-slate-200">
                <img
                  src={`/api/v1/verify/${activeQrReport.id}/qr`}
                  onError={(e) => {
                    // Fallback to high-contrast SVG QR placeholder
                    (e.currentTarget as HTMLImageElement).src =
                      'https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=' +
                      encodeURIComponent(`https://emaap.doca.gov.in/verify/${activeQrReport.id}`);
                  }}
                  alt="eMaap Verification QR"
                  className="w-36 h-36 mx-auto object-contain"
                />
              </div>

              <div>
                <div className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                  {activeQrReport.session_number}
                </div>
                <div className="text-xs text-slate-500">
                  {activeQrReport.manufacturer} • {activeQrReport.instrument_model}
                </div>
              </div>

              {activeQrReport.signature_digest && (
                <div className="p-3 bg-slate-50 dark:bg-[#121c2d] rounded-lg border border-slate-200 dark:border-white/[0.08] text-left">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mb-1">
                    <span>CANONICAL SHA-256 DIGEST:</span>
                    <button
                      onClick={() => copyToClipboard(activeQrReport.signature_digest!)}
                      className="text-brand-600 hover:underline flex items-center gap-1"
                    >
                      {copiedHash === activeQrReport.signature_digest ? (
                        <>
                          <Check className="w-2.5 h-2.5" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-2.5 h-2.5" /> Copy
                        </>
                      )}
                    </button>
                  </div>
                  <div className="font-mono text-[10px] text-slate-800 dark:text-slate-200 break-all">
                    {activeQrReport.signature_digest}
                  </div>
                </div>
              )}

              <p className="text-[11px] text-slate-500 leading-relaxed">
                Scan with any standard smartphone camera or eMaap inspector terminal to authenticate the original cryptographic verification record directly against Department of Consumer Affairs ledgers.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveQrReport(null)}
                className="w-full py-2 px-4 rounded-xl border border-slate-700/60 bg-slate-900/60 hover:bg-slate-800 text-slate-200 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Close Verification Modal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
