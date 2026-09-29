"""Tests for METROLOGIX-76 OIML R 76-2 Archival PDF/A Compiler with Bilingual Support."""

from __future__ import annotations

import io
import os
import tempfile
from decimal import Decimal

import pypdf
import pytest

from app.reporting import (
    OimlR76ReportCompiler,
    OimlR76ReportData,
    compile_oiml_report,
    validate_pdfa_compliance,
)
from app.reporting.pdf_compiler import (
    EccentricityRowItem,
    Form1GeneralInfo,
    Form2EquipmentConditions,
    Form3SummaryEvaluation,
    ObservationRowItem,
    ReportMetadata,
    get_text,
)


class TestOimlPdfCompiler:
    """Suite verifying 1:1 OIML R 76-2 report generation and PDF/A-1b compliance."""

    def test_compile_english_report_structure(self) -> None:
        """Test English report compilation produces valid PDF/A document."""
        pdf_bytes = compile_oiml_report(language="en")
        assert isinstance(pdf_bytes, bytes)
        assert len(pdf_bytes) > 10000
        assert pdf_bytes.startswith(b"%PDF-1.")

        validation = validate_pdfa_compliance(pdf_bytes)
        assert validation["is_valid_pdf"] is True
        assert validation["is_pdfa_compliant"] is True
        assert validation["has_pdfa_xmp_metadata"] is True
        assert validation["has_output_intent"] is True
        assert validation["has_page_numbering"] is True
        assert validation["all_8_forms_present"] is True
        assert validation["page_count"] >= 3

    def test_compile_bilingual_report(self) -> None:
        """Test bilingual English-Hindi report compilation."""
        pdf_bytes = compile_oiml_report(language="bilingual")
        assert isinstance(pdf_bytes, bytes)
        assert len(pdf_bytes) > 20000
        assert pdf_bytes.startswith(b"%PDF-1.")

        validation = validate_pdfa_compliance(pdf_bytes)
        assert validation["is_valid_pdf"] is True
        assert validation["is_pdfa_compliant"] is True
        assert validation["all_8_forms_present"] is True

    def test_compile_hindi_report(self) -> None:
        """Test Devanagari Hindi report compilation."""
        pdf_bytes = compile_oiml_report(language="hi")
        assert isinstance(pdf_bytes, bytes)
        assert len(pdf_bytes) > 20000
        assert pdf_bytes.startswith(b"%PDF-1.")

        validation = validate_pdfa_compliance(pdf_bytes)
        assert validation["is_valid_pdf"] is True
        assert validation["is_pdfa_compliant"] is True
        assert validation["all_8_forms_present"] is True

    def test_all_8_forms_detected_individually(self) -> None:
        """Test that every one of the 8 statutory OIML forms is verified."""
        pdf_bytes = compile_oiml_report(language="en")
        validation = validate_pdfa_compliance(pdf_bytes)

        forms = validation["forms_detected"]
        assert forms["form_1"] is True, "Form 1 (General Info) missing"
        assert forms["form_2"] is True, "Form 2 (Test Equipment) missing"
        assert forms["form_3"] is True, "Form 3 (Summary Table) missing"
        assert forms["form_4"] is True, "Form 4 (Weighing Performance) missing"
        assert forms["form_5"] is True, "Form 5 (Eccentricity) missing"
        assert forms["form_6"] is True, "Form 6 (Repeatability) missing"
        assert forms["form_7"] is True, "Form 7 (Tare/Temp) missing"
        assert forms["form_8"] is True, "Form 8 (Certification & QR) missing"

    def test_page_numbering_two_pass(self) -> None:
        """Verify 'Page X of Y' is present on all pages."""
        pdf_bytes = compile_oiml_report(language="en")
        reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
        total_pages = len(reader.pages)
        assert total_pages >= 3

        for i, page in enumerate(reader.pages):
            page_text = page.extract_text() or ""
            expected_page_needle = f"Page {i + 1} of {total_pages}"
            assert expected_page_needle in page_text, f"Missing '{expected_page_needle}' on page {i + 1}"

    def test_custom_data_injection(self) -> None:
        """Verify report compiles with customized instrument metadata and observations."""
        custom_data = OimlR76ReportData(
            metadata=ReportMetadata(
                application_no="RRSL-TEST-2026-9999",
                report_no="OIML-IND-2026-9999",
                laboratory_name="National Physical Laboratory of India",
                testing_officer="Dr. Arvind Kumar, Senior Scientist",
            ),
            form1=Form1GeneralInfo(
                applicant_name="Apex Weighing Solutions Ltd",
                pattern_type="Bench Scale BS-60",
                model_name="APEX-60",
                max_capacity="60 kg",
                min_capacity="200 g",
                e="10 g",
                d="10 g",
                n=6000,
            ),
            form2=Form2EquipmentConditions(
                standard_weights_id="SET-E2-2026-001",
                weight_class="OIML R 111 Class E2",
                ambient_temperature="20.5 °C (± 0.2 °C)",
            ),
            weighing_rows=[
                ObservationRowItem(
                    step=1,
                    direction="ASCENDING",
                    load="0.000 kg",
                    indication="0.000 kg",
                    delta_load="2.5 g",
                    p="0.0025 kg",
                    error="0.0025 kg",
                    zero_error="0.0000 kg",
                    corrected_error="0.0025 kg",
                    mpe="±5.0 g (±0.5 e)",
                    margin="+50.0%",
                    status="PASS",
                ),
                ObservationRowItem(
                    step=2,
                    direction="ASCENDING",
                    load="30.000 kg",
                    indication="30.005 kg",
                    delta_load="2.0 g",
                    p="30.0070 kg",
                    error="+7.0 g",
                    zero_error="+2.5 g",
                    corrected_error="+4.5 g",
                    mpe="±10.0 g (±1.0 e)",
                    margin="+55.0%",
                    status="PASS",
                ),
            ],
            eccentricity_rows=[
                EccentricityRowItem(
                    position_number=1,
                    position_name="Center (केंद्री लोड)",
                    load="20.000 kg",
                    indication="20.000 kg",
                    delta_load="2.5 g",
                    corrected_error="+0.0 g",
                    mpe="±10.0 g",
                    margin="+100.0%",
                    status="PASS",
                ),
            ],
            audit_hash="a1b2c3d4e5f678901234567890abcdef1234567890abcdef1234567890abcdef",
            verification_url="https://emaap.doca.gov.in/verify/OIML-IND-2026-9999",
        )

        pdf_bytes = compile_oiml_report(data=custom_data, language="en")
        reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
        full_text = " ".join([page.extract_text() or "" for page in reader.pages])

        assert "OIML-IND-2026-9999" in full_text
        assert "Apex Weighing Solutions Ltd" in full_text
        assert "Bench Scale BS-60" in full_text
        assert "SET-E2-2026-001" in full_text

    def test_file_output_path(self) -> None:
        """Verify compile_oiml_report correctly writes PDF file to specified filesystem path."""
        with tempfile.TemporaryDirectory() as tmpdir:
            target_path = os.path.join(tmpdir, "test_report.pdf")
            pdf_bytes = compile_oiml_report(output_path=target_path)

            assert os.path.exists(target_path)
            assert os.path.getsize(target_path) == len(pdf_bytes)
            with open(target_path, "rb") as f:
                disk_bytes = f.read()
            assert disk_bytes.startswith(b"%PDF-1.")

    def test_pdfa_xmp_metadata_structure(self) -> None:
        """Verify PDF/A-1b XMP metadata packet contents."""
        pdf_bytes = compile_oiml_report(language="bilingual")
        assert b"pdfaid:part" in pdf_bytes
        assert b"<pdfaid:part>1</pdfaid:part>" in pdf_bytes
        assert b"pdfaid:conformance" in pdf_bytes
        assert b"<pdfaid:conformance>B</pdfaid:conformance>" in pdf_bytes
        assert b"/GTS_PDFA1" in pdf_bytes

    def test_invalid_pdf_validation(self) -> None:
        """Verify validator handles corrupted or incomplete input gracefully."""
        corrupted_bytes = b"NOT_A_PDF_STREAM_12345"
        val = validate_pdfa_compliance(corrupted_bytes)
        assert val["is_valid_pdf"] is False
        assert val["is_pdfa_compliant"] is False
        assert val["all_8_forms_present"] is False

    def test_glossary_lookup(self) -> None:
        """Verify bilingual glossary lookup returns expected terms."""
        en_title = get_text("FORM_1_TITLE", "en")
        hi_title = get_text("FORM_1_TITLE", "hi")
        bi_title = get_text("FORM_1_TITLE", "bilingual")

        assert "FORM 1:" in en_title
        assert "प्रारूप १:" in hi_title
        assert "FORM 1:" in bi_title and "प्रारूप १:" in bi_title
