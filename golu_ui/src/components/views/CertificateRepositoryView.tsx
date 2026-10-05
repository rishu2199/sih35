import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  FileCheck2,
  Download,
  Filter,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { CertificateItem, CertificateLanguage } from '../certificates/types';
import { MOCK_CERTIFICATES, TOTAL_CERTIFICATES_COUNT } from '../certificates/mockCertificateData';
import { CertificateFilterBar } from '../certificates/CertificateFilterBar';
import { CertificateCard } from '../certificates/CertificateCard';
import { CertificateDetailsDrawer } from '../certificates/CertificateDetailsDrawer';
import { CertificateDetailModal } from '../certificates/CertificateDetailModal';
import { EmaapVerificationModal } from '../certificates/EmaapVerificationModal';

interface CertificateRepositoryViewProps {
  onBackToDashboard: () => void;
  onNavigateToAudit?: (sessionId: string) => void;
  onViewSession?: (sessionId: string) => void;
  userRole?: string;
}

export const CertificateRepositoryView: React.FC<CertificateRepositoryViewProps> = ({
  onBackToDashboard,
  onNavigateToAudit,
  onViewSession,
  userRole = 'Metrologist',
}) => {
  const [certificates, setCertificates] = useState<CertificateItem[]>(MOCK_CERTIFICATES);
  const [searchQuery, setSearchQuery] = useState('');
  const [language, setLanguage] = useState<CertificateLanguage>('bilingual');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Drawer & Modal States
  const [selectedCert, setSelectedCert] = useState<CertificateItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isEmaapModalOpen, setIsEmaapModalOpen] = useState(false);

  // Download simulation progress (Section 14)
  const [isGeneratingDownload, setIsGeneratingDownload] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Section 14: Simulated Download with Progress Indicator
  const handleDownloadPdf = (cert: CertificateItem) => {
    setIsGeneratingDownload(true);
    setDownloadProgress(24);

    const step1 = setTimeout(() => setDownloadProgress(72), 350);
    const step2 = setTimeout(() => {
      setDownloadProgress(100);
      setIsGeneratingDownload(false);
      showToast('Certificate downloaded successfully (PDF/A).');
    }, 750);
  };

  const handleDownloadWord = (cert: CertificateItem) => {
    setIsGeneratingDownload(true);
    setDownloadProgress(45);

    setTimeout(() => {
      setDownloadProgress(100);
      setIsGeneratingDownload(false);
      showToast('Certificate downloaded successfully (DOCX).');
    }, 600);
  };

  const handleOpenDrawer = (cert: CertificateItem) => {
    setSelectedCert(cert);
    setIsDrawerOpen(true);
  };

  const handlePreview = (cert: CertificateItem) => {
    setSelectedCert(cert);
    setIsPreviewModalOpen(true);
  };

  const handleVerifyEmaap = (cert: CertificateItem) => {
    setSelectedCert(cert);
    setIsEmaapModalOpen(true);
  };

  // Filtered and sorted certificates
  const filteredCertificates = useMemo(() => {
    return certificates
      .filter((c) => {
        // Status & Accuracy Class filters
        if (activeFilter === 'VERIFIED' && c.status !== 'VERIFIED') return false;
        if (activeFilter === 'CLASS_III' && !c.accuracyClass.includes('III')) return false;
        if (activeFilter === 'CLASS_I' && !c.accuracyClass.includes('Class I')) return false;
        if (activeFilter === 'RECENT') {
          if (!c.approvedAt.includes('Oct 2026')) return false;
        }

        // Search query (Section 4)
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase().trim();
        return (
          c.id.toLowerCase().includes(q) ||
          c.serialNumber.toLowerCase().includes(q) ||
          c.instrument.toLowerCase().includes(q) ||
          c.model.toLowerCase().includes(q) ||
          c.manufacturer.toLowerCase().includes(q) ||
          c.director.toLowerCase().includes(q) ||
          c.laboratory.toLowerCase().includes(q) ||
          c.accuracyClass.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === 'certId') return a.id.localeCompare(b.id);
        if (sortBy === 'instrument') return a.instrument.localeCompare(b.instrument);
        if (sortBy === 'oldest') return a.approvedAt.localeCompare(b.approvedAt);
        return b.approvedAt.localeCompare(a.approvedAt);
      });
  }, [certificates, activeFilter, searchQuery, sortBy]);

  // Paginated slice (Section 20: 9-12 cards on page 1)
  const paginatedCertificates = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCertificates.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCertificates, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredCertificates.length / itemsPerPage) || 1;

  return (
    <div className="space-y-6 pb-24 relative font-sans">
      {/* 0. Toast Alert (Section 14 & 16) */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-foundation-950 text-white px-4 py-3 rounded-xl shadow-2xl border border-foundation-700 text-xs font-semibold flex items-center gap-2.5 animate-fade-in font-mono">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 0.1 Download Generation Progress Modal (Section 14) */}
      {isGeneratingDownload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foundation-950/40 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-foundation-200 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
            <h4 className="text-sm font-bold text-foundation-900 font-sans">
              Generating official certificate...
            </h4>
            <div className="w-full bg-foundation-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-600 h-full transition-all duration-300"
                style={{ width: `${downloadProgress}%` }}
              />
            </div>
            <div className="text-[11px] font-mono text-foundation-500">
              {downloadProgress}% • Applying SHA-256 seal & NABL calibration metadata
            </div>
          </div>
        </div>
      )}

      {/* 1. Page Header (Section 3: Certificate Repository) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-foundation-200">
        <div className="flex items-start sm:items-center gap-3.5">
          <button
            onClick={onBackToDashboard}
            className="p-2.5 rounded-xl border border-foundation-200 bg-white hover:bg-foundation-100 text-foundation-700 transition-colors shadow-xs cursor-pointer"
            title="Return to Dashboard"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-brand-100 text-brand-800 border border-brand-200">
                SCREEN 14
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-foundation-900 tracking-tight font-sans">
                Certificate Repository
              </h1>
            </div>
            <p className="text-xs text-foundation-500 mt-0.5 font-sans">
              Search, verify and download issued verification certificates.
            </p>
          </div>
        </div>

        {/* Small Right-side Count (Section 3) */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-foundation-200 text-xs font-mono shadow-xs">
            <Layers size={14} className="text-foundation-500" />
            <span className="font-bold text-foundation-900">{TOTAL_CERTIFICATES_COUNT} issued certificates</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-300 text-xs font-mono font-bold shadow-xs">
            <CheckCircle2 size={13} className="text-emerald-600" />
            <span>100% Cryptographically Sealed</span>
          </div>
        </div>
      </div>

      {/* 2. Prominent Search, Language Selector & Filter Bar (Section 4 & 5) */}
      <CertificateFilterBar
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setCurrentPage(1);
        }}
        language={language}
        onLanguageChange={setLanguage}
        activeFilter={activeFilter}
        onFilterChange={(f) => {
          setActiveFilter(f);
          setCurrentPage(1);
        }}
        sortBy={sortBy}
        onSortChange={setSortBy}
        totalCount={TOTAL_CERTIFICATES_COUNT}
      />

      {/* 3. Certificate Cards Grid (Section 7, 8, 9, 21) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-foundation-700 uppercase tracking-wider font-mono">
            Issued Certificates ({filteredCertificates.length})
          </h3>
          <span className="text-xs font-mono text-foundation-500">
            Language Format: <strong className="text-foundation-800 uppercase">{language}</strong>
          </span>
        </div>

        {filteredCertificates.length === 0 ? (
          /* Empty State (Section 19) */
          <div className="p-12 text-center bg-white rounded-2xl border border-foundation-200 text-foundation-500 shadow-xs space-y-3">
            <Filter className="w-10 h-10 mx-auto opacity-35 text-foundation-400" />
            <div>
              <p className="text-base font-bold text-foundation-900 font-sans">No certificates found</p>
              <p className="text-xs text-foundation-500 mt-1 max-w-sm mx-auto">
                Try a different certificate ID, serial number or instrument model.
              </p>
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveFilter('ALL');
              }}
              className="px-4 py-2 rounded-xl bg-foundation-900 text-white text-xs font-bold hover:bg-foundation-800 transition-colors shadow-xs cursor-pointer"
            >
              Clear Search
            </button>
          </div>
        ) : (
          /* 3-Column Desktop, 2-Column Tablet, 1-Column Mobile Grid (Section 21) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedCertificates.map((cert) => (
              <CertificateCard
                key={cert.id}
                certificate={cert}
                language={language}
                onPreview={handlePreview}
                onOpenDrawer={handleOpenDrawer}
                onDownloadPdf={handleDownloadPdf}
                onDownloadWord={handleDownloadWord}
                onVerifyEmaap={handleVerifyEmaap}
                onViewAudit={(_c) => onNavigateToAudit?.(cert.sessionId)}
              />
            ))}
          </div>
        )}

        {/* 4. Pagination (Section 20) */}
        {filteredCertificates.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-foundation-200 text-xs font-mono text-foundation-500 px-1">
            <span>
              Showing {Math.min(filteredCertificates.length, (currentPage - 1) * itemsPerPage + 1)}–
              {Math.min(filteredCertificates.length, currentPage * itemsPerPage)} of {TOTAL_CERTIFICATES_COUNT} certificates
            </span>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-foundation-200 bg-white hover:bg-foundation-50 text-foundation-700 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                title="Previous page"
              >
                <ChevronLeft size={15} />
              </button>

              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pg) => (
                <button
                  key={pg}
                  onClick={() => setCurrentPage(pg)}
                  className={`w-7 h-7 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                    currentPage === pg
                      ? 'bg-foundation-900 text-white shadow-xs'
                      : 'border border-foundation-200 bg-white text-foundation-700 hover:bg-foundation-50'
                  }`}
                >
                  {pg}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-foundation-200 bg-white hover:bg-foundation-50 text-foundation-700 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                title="Next page"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. Slide-Over Details Drawer (Section 10) */}
      <CertificateDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        certificate={selectedCert}
        onOpenPreview={handlePreview}
        onDownloadPdf={handleDownloadPdf}
        onDownloadWord={handleDownloadWord}
        onVerifyEmaap={handleVerifyEmaap}
        onViewAudit={onNavigateToAudit}
        onViewSession={onViewSession}
      />

      {/* 6. Official Document Preview Modal (Section 11, 12, 26) */}
      <CertificateDetailModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        certificate={selectedCert}
        initialLanguage={language}
        onNavigateToAudit={onNavigateToAudit}
        onDownloadPdf={handleDownloadPdf}
        onDownloadWord={handleDownloadWord}
        onVerifyEmaap={handleVerifyEmaap}
      />

      {/* 7. Public eMaap Verification Modal (Section 15) */}
      <EmaapVerificationModal
        isOpen={isEmaapModalOpen}
        onClose={() => setIsEmaapModalOpen(false)}
        certificate={selectedCert}
      />
    </div>
  );
};
