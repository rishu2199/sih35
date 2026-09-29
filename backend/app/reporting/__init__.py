"""METROLOGIX-76 — Official OIML R 76-2 International Reporting & PDF/A Compilation Module.

Statutory Authorities:
- OIML R 76-2:2007 (E) "Pattern evaluation report"
- Legal Metrology (General) Rules, 2011, Seventh Schedule
- Department of Consumer Affairs (DoCA), SIH Problem Statement 26035
"""

from app.reporting.docx_compiler import (
    OimlR76DocxCompiler,
    compile_oiml_docx,
    validate_docx_compliance,
)
from app.reporting.pdf_compiler import (
    OimlR76ReportCompiler,
    OimlR76ReportData,
    compile_oiml_report,
    validate_pdfa_compliance,
)

__all__ = [
    "OimlR76ReportCompiler",
    "OimlR76DocxCompiler",
    "OimlR76ReportData",
    "compile_oiml_report",
    "compile_oiml_docx",
    "validate_pdfa_compliance",
    "validate_docx_compliance",
]
