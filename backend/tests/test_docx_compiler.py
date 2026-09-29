"""Tests for METROLOGIX-76 OIML R 76-2 Standardized Editable Microsoft Word (.docx) Compiler."""

from __future__ import annotations

import io
import os
import tempfile

import docx
import pytest

from app.reporting import (
    OimlR76DocxCompiler,
    OimlR76ReportData,
    compile_oiml_docx,
    validate_docx_compliance,
)
from app.reporting.pdf_compiler import (
    EccentricityRowItem,
    Form1GeneralInfo,
    Form2EquipmentConditions,
    Form3SummaryEvaluation,
    ObservationRowItem,
    ReportMetadata,
)


class TestOimlDocxCompiler:
    """Suite verifying 1:1 OIML R 76-2 editable Word (.docx) report generation."""

    def test_compile_english_docx_structure(self) -> None:
        """Test English editable Word document compilation produces valid .docx package."""
        docx_bytes = compile_oiml_docx(language="en")
        assert isinstance(docx_bytes, bytes)
        assert len(docx_bytes) > 20000

        # Open and inspect via python-docx
        doc = docx.Document(io.BytesIO(docx_bytes))
        assert len(doc.tables) >= 8
        assert len(doc.paragraphs) > 5

        # Check compliance
        validation = validate_docx_compliance(docx_bytes)
        assert validation["is_valid_docx"] is True
        assert validation["is_docx_compliant"] is True
        assert validation["all_8_forms_present"] is True
        assert validation["explicit_column_widths"] is True
        assert validation["table_count"] >= 8

    def test_compile_bilingual_docx(self) -> None:
        """Test bilingual English-Hindi editable Word report compilation."""
        docx_bytes = compile_oiml_docx(language="bilingual")
        assert isinstance(docx_bytes, bytes)
        assert len(docx_bytes) > 20000

        validation = validate_docx_compliance(docx_bytes)
        assert validation["is_valid_docx"] is True
        assert validation["is_docx_compliant"] is True
        assert validation["all_8_forms_present"] is True

    def test_compile_hindi_docx(self) -> None:
        """Test Hindi Devanagari editable Word report compilation."""
        docx_bytes = compile_oiml_docx(language="hi")
        assert isinstance(docx_bytes, bytes)
        assert len(docx_bytes) > 20000

        validation = validate_docx_compliance(docx_bytes)
        assert validation["is_valid_docx"] is True
        assert validation["is_docx_compliant"] is True
        assert validation["all_8_forms_present"] is True

    def test_all_8_forms_individually_detected(self) -> None:
        """Verify each of the 8 statutory OIML forms is verified in Word document."""
        docx_bytes = compile_oiml_docx(language="en")
        validation = validate_docx_compliance(docx_bytes)
        forms = validation["forms_detected"]

        assert forms["form_1"] is True, "Form 1 (General Info) missing"
        assert forms["form_2"] is True, "Form 2 (Test Equipment) missing"
        assert forms["form_3"] is True, "Form 3 (Summary Table) missing"
        assert forms["form_4"] is True, "Form 4 (Weighing Performance) missing"
        assert forms["form_5"] is True, "Form 5 (Eccentricity) missing"
        assert forms["form_6"] is True, "Form 6 (Repeatability) missing"
        assert forms["form_7"] is True, "Form 7 (Tare/Temp) missing"
        assert forms["form_8"] is True, "Form 8 (Official Certification) missing"

    def test_custom_data_injection_in_docx(self) -> None:
        """Verify report populates custom instrument data, weights, and observations."""
        custom_data = OimlR76ReportData(
            metadata=ReportMetadata(
                application_no="RRSL-DOCX-2026-7777",
                report_no="OIML-IND-2026-7777",
                laboratory_name="RRSL Dehradun Regional Laboratory",
                testing_officer="K. S. Sundaram, Scientific Officer",
            ),
            form1=Form1GeneralInfo(
                applicant_name="Himalayan Scales Pvt Ltd",
                pattern_type="Heavy Platform Scale HPS-500",
                model_name="HPS-500-ULTRA",
                serial_number="SN-HPS-8841",
                accuracy_class="CLASS_III",
                max_capacity="500 kg",
                min_capacity="2 kg",
                e="100 g",
                d="100 g",
                n=5000,
            ),
            form2=Form2EquipmentConditions(
                standard_weights_id="SET-M1-2026-009",
                weight_class="OIML R 111 Class M1",
                ambient_temperature="22.1 °C",
            ),
            weighing_rows=[
                ObservationRowItem(
                    step=1,
                    direction="ASCENDING",
                    load="0.0 kg",
                    indication="0.0 kg",
                    delta_load="50 g",
                    p="0.05 kg",
                    error="+50 g",
                    zero_error="0 g",
                    corrected_error="+50 g",
                    mpe="±50 g",
                    margin="+0.0%",
                    status="PASS",
                ),
                ObservationRowItem(
                    step=2,
                    direction="ASCENDING",
                    load="500.0 kg",
                    indication="500.1 kg",
                    delta_load="50 g",
                    p="500.15 kg",
                    error="+150 g",
                    zero_error="+50 g",
                    corrected_error="+100 g",
                    mpe="±150 g",
                    margin="+33.3%",
                    status="PASS",
                ),
            ],
            eccentricity_rows=[
                EccentricityRowItem(
                    position_number=1,
                    position_name="Center Platform",
                    load="160.0 kg",
                    indication="160.0 kg",
                    delta_load="50 g",
                    corrected_error="0 g",
                    mpe="±100 g",
                    margin="+100.0%",
                    status="PASS",
                ),
            ],
            audit_hash="d7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8",
            verification_url="https://emaap.doca.gov.in/verify/OIML-IND-2026-7777",
        )

        docx_bytes = compile_oiml_docx(data=custom_data, language="en")
        doc = docx.Document(io.BytesIO(docx_bytes))

        # Check that customized values exist in the document text
        all_text = " ".join([p.text for p in doc.paragraphs])
        for t in doc.tables:
            for row in t.rows:
                for cell in row.cells:
                    all_text += " " + cell.text

        assert "OIML-IND-2026-7777" in all_text
        assert "Himalayan Scales Pvt Ltd" in all_text
        assert "Heavy Platform Scale HPS-500" in all_text
        assert "SET-M1-2026-009" in all_text
        assert "500 kg" in all_text

    def test_file_output_path(self) -> None:
        """Verify compile_oiml_docx correctly writes file to filesystem path."""
        with tempfile.TemporaryDirectory() as tmpdir:
            file_path = os.path.join(tmpdir, "test_report.docx")
            docx_bytes = compile_oiml_docx(output_path=file_path)

            assert os.path.exists(file_path)
            assert os.path.getsize(file_path) == len(docx_bytes)

            # Re-read from disk
            doc = docx.Document(file_path)
            assert len(doc.tables) >= 8

    def test_invalid_docx_validation_error_handling(self) -> None:
        """Verify validator handles corrupted or truncated bytes safely."""
        corrupted = b"NOT_A_VALID_DOCX_FILE_STREAM"
        val = validate_docx_compliance(corrupted)
        assert val["is_valid_docx"] is False
        assert val["is_docx_compliant"] is False
        assert val["all_8_forms_present"] is False

    def test_failing_observation_verdict_styling(self) -> None:
        """Verify that a failing observation row compiles and displays FAIL status."""
        data = OimlR76DocxCompiler()._create_default_data()
        data.form3.eccentricity_verdict = "FAIL"
        data.weighing_rows[0].status = "FAIL"

        docx_bytes = compile_oiml_docx(data=data, language="en")
        doc = docx.Document(io.BytesIO(docx_bytes))

        all_text = ""
        for t in doc.tables:
            for row in t.rows:
                for cell in row.cells:
                    all_text += " " + cell.text

        assert "FAIL" in all_text
