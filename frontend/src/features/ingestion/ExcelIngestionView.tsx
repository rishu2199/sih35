import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Upload,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Download,
  Layers,
  ArrowRight,
  ShieldAlert,
  RefreshCw,
  Search,
  Table,
  Cpu,
} from 'lucide-react';

interface ExtractedInstrumentMetadata {
  manufacturer?: string | null;
  model_name?: string | null;
  serial_number?: string | null;
  accuracy_class?: string | null;
  max_capacity?: number | null;
  min_capacity?: number | null;
  e?: number | null;
  d?: number | null;
  unit?: string | null;
  verification_stage?: string | null;
  inspector_name?: string | null;
  lab_location?: string | null;
  verification_date?: string | null;
}

interface ExtractedObservationRow {
  row_index: number;
  load: number;
  indication: number;
  delta_load: number;
  legacy_error?: number | null;
  legacy_verdict?: string | null;
  oiml_p: number;
  oiml_error_uncorrected: number;
  oiml_zero_error: number;
  oiml_error_corrected: number;
  oiml_mpe: number;
  oiml_verdict: string;
  has_discrepancy: boolean;
}

interface LegacyDiscrepancy {
  row_index: number;
  load: number;
  legacy_indication: number;
  legacy_error?: number | null;
  legacy_verdict?: string | null;
  oiml_p: number;
  oiml_error_uncorrected: number;
  oiml_zero_error: number;
  oiml_error_corrected: number;
  oiml_mpe: number;
  oiml_verdict: string;
  discrepancy_type: string;
  severity: 'INFO' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  legal_implication: string;
}

interface EccentricityObservation {
  position: string;
  load: number;
  indication: number;
  error: number;
  mpe: number;
  is_compliant: boolean;
}

interface ExcelIngestionReport {
  filename: string;
  ingestion_timestamp: string;
  sheet_names: string[];
  metadata: ExtractedInstrumentMetadata;
  total_observations: number;
  observations: ExtractedObservationRow[];
  eccentricity_observations: EccentricityObservation[];
  discrepancies: LegacyDiscrepancy[];
  total_discrepancies: number;
  false_passes_count: number;
  false_fails_count: number;
  oiml_overall_verdict: string;
  summary_notes: string[];
}

export const ExcelIngestionView: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<ExcelIngestionReport | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'discrepancies' | 'weighing' | 'eccentricity' | 'metadata'>('discrepancies');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch pre-computed demo report
  const handleLoadDemo = async (flawed: boolean) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch(`/api/v1/ingestion/excel/demo-report?flawed=${flawed}`);
      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }
      const data: ExcelIngestionReport = await response.json();
      setReport(data);
    } catch (err) {
      setErrorMessage(`Failed to load demonstration report: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Upload custom file
  const handleFileUpload = async (file: File) => {
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      setErrorMessage('Please upload a valid Microsoft Excel spreadsheet (.xlsx or .xls)');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/v1/ingestion/excel/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server returned HTTP ${response.status}`);
      }

      const data: ExcelIngestionReport = await response.json();
      setReport(data);
    } catch (err) {
      setErrorMessage(`Ingestion error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadSample = async (flawed: boolean) => {
    try {
      const response = await fetch(`/api/v1/ingestion/excel/sample-file?flawed=${flawed}`);
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = flawed ? 'rrsl_legacy_flawed_test_sheet.xlsx' : 'rrsl_legacy_compliant_test_sheet.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setErrorMessage(`Failed to download template: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // Filter observations based on search
  const filteredObservations = report?.observations.filter((obs) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      obs.load.toString().includes(term) ||
      obs.indication.toString().includes(term) ||
      obs.oiml_verdict.toLowerCase().includes(term)
    );
  }) || [];

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-emerald-500/10 dark:bg-emerald-950/30 rounded-2xl border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-sm shrink-0">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold font-display tracking-tight text-slate-900 dark:text-white">
                Legacy Excel Spreadsheet Ingestion &amp; Migration
              </h1>
              <span className="px-3 py-1 text-[10px] font-bold font-mono uppercase tracking-wider rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-xs">
                10-Yr Historical Audit
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-2xl leading-relaxed">
              Deterministic OIML R 76-1 Clause A.4.4.3 changeover engine. Flags legacy formula rounding errors, omitted zero errors ($E_0$), and statutory false passes under Section 24 of the Legal Metrology Act, 2009.
            </p>
          </div>
        </div>

        {/* Quick Demo Actions */}
        <div className="flex flex-col items-start gap-2.5 shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => handleLoadDemo(true)}
              disabled={isLoading}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-rose-500/30 bg-rose-950/20 hover:bg-rose-950/40 text-rose-200 text-xs font-semibold transition-all disabled:opacity-50 shadow-xs cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Audit Flawed RRSL 2018 Sheet</span>
            </button>
            <button
              type="button"
              onClick={() => handleLoadDemo(false)}
              disabled={isLoading}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-emerald-500/30 bg-emerald-950/20 hover:bg-emerald-950/40 text-emerald-200 text-xs font-semibold transition-all disabled:opacity-50 shadow-xs cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Audit Compliant Lab Sheet</span>
            </button>
          </div>
          <button
            type="button"
            onClick={() => handleDownloadSample(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-700/60 bg-slate-800/40 hover:bg-slate-800/60 text-slate-300 text-xs font-semibold transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>Get Template (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Error Notification */}
      {errorMessage && (
        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-800 dark:text-rose-200 flex items-start gap-3 shadow-sm">
          <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0 text-rose-500" />
          <div className="text-xs font-medium">
            <span className="font-bold">Ingestion Warning: </span>
            {errorMessage}
          </div>
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const files = e.dataTransfer.files;
          if (files && files.length > 0) {
            handleFileUpload(files[0]);
          }
        }}
        className={`relative border-2 border-dashed rounded-2xl min-h-[380px] p-12 text-center transition-all flex flex-col items-center justify-center ${
          isDragging
            ? 'border-brand-500 bg-brand-500/10 dark:bg-brand-950/20'
            : 'border-slate-300/80 dark:border-slate-800/80 bg-white/40 dark:bg-[#070c18]/50 hover:border-slate-400 dark:hover:border-slate-700'
        } shadow-card`}
      >
        <input
          type="file"
          id="excel-file-input"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={(e) => {
            const files = e.target.files;
            if (files && files.length > 0) {
              handleFileUpload(files[0]);
            }
          }}
        />

        <div className="flex flex-col items-center justify-center">
          <div className="w-14 h-14 bg-slate-100 dark:bg-[#111927] rounded-2xl text-brand-600 dark:text-brand-400 border border-slate-200 dark:border-slate-700/60 shadow-inner flex items-center justify-center mb-5">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold font-display text-slate-900 dark:text-white tracking-tight">
              Drag &amp; Drop Legacy Laboratory Test Sheet (.xlsx or .xls)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-xl mx-auto leading-relaxed">
              Supports merged header formats, RRSL / GATC laboratory templates, legacy Avery/Mettler test certificates, and custom column arrangements. Automatically recalculates turning points and highlights discrepancies.
            </p>
          </div>

          <div className="mt-6">
            <label
              htmlFor="excel-file-input"
              className="inline-flex items-center px-6 py-2.5 text-sm font-medium rounded-xl shadow-md text-white bg-brand-600 hover:bg-brand-500 cursor-pointer transition-all active:scale-[0.98]"
            >
              Browse Files from Computer
            </label>
          </div>
        </div>

        {isLoading && (
          <div className="absolute inset-0 bg-[#080c14]/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center z-10">
            <RefreshCw className="w-8 h-8 text-brand-400 animate-spin" />
            <p className="mt-3 text-sm font-bold text-white font-display">
              Recalculating 10-Year Historical Test Points via OIML Engine...
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Evaluating $P = I + 0.5e - \Delta L$ and $E_c = E - E_0$ against Table 6 MPE limits
            </p>
          </div>
        )}
      </div>

      {/* Main Report View */}
      {report && (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Points */}
            <div className="relative overflow-hidden card-sheen p-5 rounded-2xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#0f1728] shadow-card">
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-emerald-500/0 via-emerald-500 to-emerald-500/0" />
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider font-mono">Observations Ingested</span>
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <Table className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
                {report.total_observations}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                From {report.sheet_names.length} worksheets in {report.filename}
              </div>
            </div>

            {/* False Passes Uncovered */}
            <div className={`relative overflow-hidden card-sheen p-5 rounded-2xl border shadow-card ${
              report.false_passes_count > 0
                ? 'border-rose-500/30 bg-rose-500/10 dark:bg-rose-950/20 text-rose-900 dark:text-rose-100'
                : 'border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#0f1728] text-slate-900 dark:text-white'
            }`}>
              <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r ${
                report.false_passes_count > 0
                  ? 'from-rose-500/0 via-rose-500 to-rose-500/0'
                  : 'from-emerald-500/0 via-emerald-500 to-emerald-500/0'
              }`} />
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider font-mono">False Passes Detected</span>
                <div className={`p-1.5 rounded-lg ${report.false_passes_count > 0 ? 'bg-rose-500/20 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                  <ShieldAlert className="w-4 h-4" />
                </div>
              </div>
              <div className={`text-3xl font-black font-mono tracking-tight ${report.false_passes_count > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {report.false_passes_count}
              </div>
              <div className="text-xs mt-1 font-medium text-slate-600 dark:text-slate-300">
                {report.false_passes_count > 0 ? 'Statutory audit breach concealed by Excel formula' : 'Zero false passes detected'}
              </div>
            </div>

            {/* Total Discrepancies */}
            <div className="relative overflow-hidden card-sheen p-5 rounded-2xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#0f1728] shadow-card">
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-amber-500/0 via-amber-500 to-amber-500/0" />
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider font-mono">Formula Flaws Uncovered</span>
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-black font-mono tracking-tight text-amber-600 dark:text-amber-400">
                {report.total_discrepancies}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Turning point skips, rounding drift & zero error omissions
              </div>
            </div>

            {/* Statutory Verdict */}
            <div className={`relative overflow-hidden card-sheen p-5 rounded-2xl border shadow-card ${
              report.oiml_overall_verdict === 'PASS'
                ? 'border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-950/20'
                : 'border-rose-500/30 bg-rose-500/10 dark:bg-rose-950/20'
            }`}>
              <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r ${
                report.oiml_overall_verdict === 'PASS'
                  ? 'from-emerald-500/0 via-emerald-500 to-emerald-500/0'
                  : 'from-rose-500/0 via-rose-500 to-rose-500/0'
              }`} />
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider font-mono">OIML R 76 Verdict</span>
                <div className={`p-1.5 rounded-lg ${report.oiml_overall_verdict === 'PASS' ? 'bg-emerald-500/20 text-emerald-600' : 'bg-rose-500/20 text-rose-600'}`}>
                  {report.oiml_overall_verdict === 'PASS' ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                </div>
              </div>
              <div className={`text-3xl font-black font-mono tracking-tight ${
                report.oiml_overall_verdict === 'PASS' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}>
                {report.oiml_overall_verdict}
              </div>
              <div className="text-xs mt-1 font-medium text-slate-600 dark:text-slate-300">
                Deterministic Table 6 MPE compliance
              </div>
            </div>
          </div>

          {/* Instrument Metadata Ribbon */}
          <div className="card-sheen p-5 rounded-2xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#0f1728] shadow-card">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                  <Cpu className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold font-display text-slate-900 dark:text-white">
                  Extracted Instrument Specifications & Metadata
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-500">
                Source: {report.filename} ({report.ingestion_timestamp.split('T')[0]})
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
              <div>
                <span className="text-[11px] text-slate-400 dark:text-slate-400 block font-medium">Manufacturer</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{report.metadata.manufacturer || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 dark:text-slate-400 block font-medium">Model</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{report.metadata.model_name || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 dark:text-slate-400 block font-medium">Serial No.</span>
                <span className="font-semibold font-mono text-slate-900 dark:text-slate-100">{report.metadata.serial_number || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 dark:text-slate-400 block font-medium">Accuracy Class</span>
                <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/25">
                  {report.metadata.accuracy_class || 'CLASS_III'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 dark:text-slate-400 block font-medium">Max / e</span>
                <span className="font-semibold font-mono text-slate-900 dark:text-slate-100">
                  {report.metadata.max_capacity} {report.metadata.unit} / e={report.metadata.e} {report.metadata.unit}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 dark:text-slate-400 block font-medium">Laboratory</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{report.metadata.lab_location || 'RRSL'}</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-slate-200/90 dark:border-white/[0.08]">
            <nav className="flex space-x-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('discrepancies')}
                className={`py-3 px-1 border-b-2 font-bold text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-colors ${
                  activeTab === 'discrepancies'
                    ? 'border-rose-500 text-rose-600 dark:text-rose-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                Discrepancy Audit Breakdown
                {report.discrepancies.length > 0 && (
                  <span className="ml-1.5 py-0.5 px-2 rounded-full text-[10px] bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/25 font-black">
                    {report.discrepancies.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('weighing')}
                className={`py-3 px-1 border-b-2 font-bold text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-colors ${
                  activeTab === 'weighing'
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
              >
                <Table className="w-4 h-4" />
                Recalculated Observations ({report.observations.length})
              </button>

              {report.eccentricity_observations.length > 0 && (
                <button
                  onClick={() => setActiveTab('eccentricity')}
                  className={`py-3 px-1 border-b-2 font-bold text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-colors ${
                    activeTab === 'eccentricity'
                      ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  Eccentricity Corner Test ({report.eccentricity_observations.length})
                </button>
              )}
            </nav>
          </div>

          {/* TAB 1: Discrepancies Breakdown */}
          {activeTab === 'discrepancies' && (
            <div className="space-y-4">
              {report.discrepancies.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200">
                  <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-3" />
                  <h3 className="text-base font-bold font-display">Flawless Historical Record</h3>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1 max-w-lg mx-auto">
                    All legacy formulas, turning point changeovers ($P = I + 0.5e - \Delta L$), and zero reference corrections match statutory OIML R 76 tolerances with zero false passes.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
                    Statutory Formula Flaws Detected in Spreadsheet Rows:
                  </div>

                  {report.discrepancies.map((disc, idx) => (
                    <div
                      key={idx}
                      className={`card-sheen p-4 rounded-xl border transition-all shadow-sm ${
                        disc.severity === 'CRITICAL'
                          ? 'border-rose-500/30 bg-rose-500/10 dark:bg-rose-950/20'
                          : 'border-amber-500/30 bg-amber-500/10 dark:bg-amber-950/20'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 text-[10px] font-black font-mono uppercase tracking-wider rounded-md border shadow-xs ${
                              disc.severity === 'CRITICAL'
                                ? 'bg-rose-600 text-white border-rose-700'
                                : 'bg-amber-600 text-white border-amber-700'
                            }`}
                          >
                            {disc.discrepancy_type.replace(/_/g, ' ')}
                          </span>
                          <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                            Excel Row #{disc.row_index} | Load = {disc.load} {report.metadata.unit || 'kg'}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs font-mono">
                          <span className="text-slate-500">Legacy: <span className={disc.legacy_verdict === 'PASS' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-rose-600 dark:text-rose-400 font-bold'}>{disc.legacy_verdict || 'PASS'}</span></span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-slate-500">OIML R 76: <span className={disc.oiml_verdict === 'PASS' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-rose-600 dark:text-rose-400 font-bold'}>{disc.oiml_verdict}</span></span>
                        </div>
                      </div>

                      {/* Legal Implication */}
                      <p className="text-xs font-medium text-slate-800 dark:text-slate-200 mt-1">
                        {disc.legal_implication}
                      </p>

                      {/* Mathematical Comparison Grid */}
                      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/80 dark:bg-[#162032] p-3 rounded-lg border border-slate-200/60 dark:border-white/[0.04] text-xs font-mono shadow-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-sans">Indication (I)</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{disc.legacy_indication}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-sans">Legacy Error (I - L)</span>
                          <span className="font-bold text-rose-600 dark:text-rose-400">{disc.legacy_error ?? 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-sans">Corrected Error ($E_c$)</span>
                          <span className="font-bold text-brand-600 dark:text-brand-400">{disc.oiml_error_corrected}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-sans">Statutory MPE</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">&plusmn;{disc.oiml_mpe}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Full Observations Table */}
          {activeTab === 'weighing' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filter by load or verdict..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#162032] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-sm"
                  />
                </div>

                <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                  Showing {filteredObservations.length} of {report.observations.length} test points
                </div>
              </div>

              <div className="overflow-x-auto card-sheen rounded-2xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#0f1728] shadow-card">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50/80 dark:bg-[#162032]/80 text-slate-500 dark:text-slate-400 font-mono text-[10px] font-bold border-b border-slate-200/90 dark:border-white/[0.08] uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-3.5">Row</th>
                      <th className="py-3 px-3.5">Load ($L$)</th>
                      <th className="py-3 px-3.5">Indication ($I$)</th>
                      <th className="py-3 px-3.5">&Delta;L</th>
                      <th className="py-3 px-3.5">Turning Pt ($P$)</th>
                      <th className="py-3 px-3.5">True Error ($E_c$)</th>
                      <th className="py-3 px-3.5">MPE</th>
                      <th className="py-3 px-3.5">Legacy Verdict</th>
                      <th className="py-3 px-3.5">OIML Verdict</th>
                      <th className="py-3 px-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04] font-mono">
                    {filteredObservations.map((obs) => (
                      <tr
                        key={obs.row_index}
                        className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                          obs.has_discrepancy ? 'bg-amber-50/30 dark:bg-amber-950/20' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3 font-bold text-slate-400">#{obs.row_index}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">{obs.load}</td>
                        <td className="py-2.5 px-3">{obs.indication}</td>
                        <td className="py-2.5 px-3 text-slate-500">{obs.delta_load}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300">{obs.oiml_p}</td>
                        <td className={`py-2.5 px-3 font-bold ${
                          Math.abs(obs.oiml_error_corrected) > obs.oiml_mpe
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}>
                          {obs.oiml_error_corrected > 0 ? `+${obs.oiml_error_corrected}` : obs.oiml_error_corrected}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">&plusmn;{obs.oiml_mpe}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            obs.legacy_verdict === 'FAIL'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                          }`}>
                            {obs.legacy_verdict || 'PASS'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            obs.oiml_verdict === 'FAIL'
                              ? 'bg-rose-600 text-white'
                              : 'bg-emerald-600 text-white'
                          }`}>
                            {obs.oiml_verdict}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          {obs.has_discrepancy ? (
                            <span className="inline-flex items-center text-amber-600 dark:text-amber-400 font-sans font-bold text-[11px]">
                              <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Flawed
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-sans font-bold text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Verified
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: Eccentricity Observations */}
          {activeTab === 'eccentricity' && (
            <div className="overflow-x-auto card-sheen rounded-2xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#0f1728] shadow-card">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50/80 dark:bg-[#162032]/80 text-slate-500 dark:text-slate-400 font-mono text-[10px] font-bold border-b border-slate-200/90 dark:border-white/[0.08] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Position Description</th>
                    <th className="py-3 px-4">Test Load</th>
                    <th className="py-3 px-4">Indication</th>
                    <th className="py-3 px-4">Error ($E$)</th>
                    <th className="py-3 px-4">Statutory MPE</th>
                    <th className="py-3 px-4">Verdict</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04] font-mono">
                  {report.eccentricity_observations.map((ecc, i) => (
                    <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="py-2.5 px-4 font-sans font-semibold text-slate-800 dark:text-slate-200">{ecc.position}</td>
                      <td className="py-2.5 px-4">{ecc.load}</td>
                      <td className="py-2.5 px-4">{ecc.indication}</td>
                      <td className={`py-2.5 px-4 font-bold ${ecc.is_compliant ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {ecc.error > 0 ? `+${ecc.error}` : ecc.error}
                      </td>
                      <td className="py-2.5 px-4 text-slate-500 dark:text-slate-400">&plusmn;{ecc.mpe}</td>
                      <td className="py-2.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold shadow-xs ${
                          ecc.is_compliant
                            ? 'bg-emerald-600 text-white'
                            : 'bg-rose-600 text-white'
                        }`}>
                          {ecc.is_compliant ? 'PASS' : 'FAIL'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
