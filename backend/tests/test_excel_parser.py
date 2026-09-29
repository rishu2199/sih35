"""Unit and Integration Tests for Step 29: Legacy Excel Ingestion & Migration Engine.

Verifies:
1. Flawed Legacy Excel Spreadsheet Ingestion:
   - Successfully parses legacy RRSL/GATC workbook.
   - Detects critical FALSE PASS at 10.000 kg where manual Excel formulas masked error > MPE.
   - Identifies omission of zero reference error E_0.
   - Flags direct subtraction (I - L) omitting turning point changeover (0.5e - Delta L).
   - Evaluates OIML overall verdict as FAIL.
2. Compliant Legacy Excel Spreadsheet Ingestion:
   - Successfully parses compliant spreadsheet.
   - Recalculates all turning points and corrected errors.
   - Evaluates OIML overall verdict as PASS with 0 false passes.
3. Robust Column & Merged Cell Resolution:
   - Correctly maps headers with varying labels and units.
   - Gracefully resolves top-left cell values from merged title and metadata blocks.
4. Eccentricity Corner Test Extraction:
   - Parses corner test observations and validates against Table 6 MPE.
5. FastAPI Ingestion Endpoints:
   - POST /api/v1/ingestion/excel/upload
   - POST /api/v1/ingestion/excel/parse-base64
   - GET /api/v1/ingestion/excel/sample-file
   - GET /api/v1/ingestion/excel/demo-report
   - GET /api/v1/ingestion/excel/sample-data-url
"""

from __future__ import annotations

import base64
from decimal import Decimal

import pytest
from fastapi.testclient import TestClient

from app.ingestion.excel_parser import (
    DiscrepancyType,
    LegacyExcelMigrationEngine,
    generate_sample_legacy_excel,
    parse_legacy_excel,
)
from app.main import app


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


# ============================================================================
# 1. CORE EXCEL PARSER TESTS
# ============================================================================


class TestExcelParserEngine:
    """Tests for LegacyExcelMigrationEngine parsing and deterministic OIML recalculation."""

    def test_parse_flawed_legacy_excel_detects_false_pass(self) -> None:
        """Spreadsheet with manual Excel flaws must flag the critical FALSE PASS."""
        excel_bytes = generate_sample_legacy_excel(has_flaws=True)
        report = parse_legacy_excel(excel_bytes, filename="flawed_rrsl_2018.xlsx")

        assert report.filename == "flawed_rrsl_2018.xlsx"
        assert report.total_observations >= 10
        assert report.metadata.manufacturer == "Avery Weigh-Tronix India Pvt Ltd"
        assert report.metadata.max_capacity == Decimal("30")
        assert report.metadata.e == Decimal("0.005")

        # Must flag false passes
        assert report.false_passes_count >= 1
        assert report.oiml_overall_verdict == "FAIL"

        # Check the specific False Pass discrepancy at 10.000 kg
        false_pass_disc = next(
            (d for d in report.discrepancies if d.discrepancy_type == DiscrepancyType.FALSE_PASS),
            None,
        )
        assert false_pass_disc is not None
        assert false_pass_disc.load == Decimal("10")
        assert false_pass_disc.legacy_verdict == "PASS"
        assert false_pass_disc.oiml_verdict == "FAIL"
        assert false_pass_disc.severity == "CRITICAL"
        assert "STATUTORY AUDIT BREACH" in false_pass_disc.legal_implication

    def test_parse_compliant_legacy_excel_returns_pass(self) -> None:
        """Mathematically compliant legacy spreadsheet must evaluate to PASS."""
        excel_bytes = generate_sample_legacy_excel(has_flaws=False)
        report = parse_legacy_excel(excel_bytes, filename="compliant_rrsl_2018.xlsx")

        assert report.filename == "compliant_rrsl_2018.xlsx"
        assert report.false_passes_count == 0
        assert report.oiml_overall_verdict == "PASS"
        assert len(report.observations) >= 10
        assert all(obs.oiml_verdict == "PASS" for obs in report.observations)

    def test_omitted_zero_error_flagged(self) -> None:
        """When legacy formula omits E_0, engine flags OMITTED_ZERO_ERROR."""
        excel_bytes = generate_sample_legacy_excel(has_flaws=True)
        report = parse_legacy_excel(excel_bytes)

        omitted_zero_disc = next(
            (
                d
                for d in report.discrepancies
                if d.discrepancy_type == DiscrepancyType.OMITTED_ZERO_ERROR
            ),
            None,
        )
        # In flawed sheet, formula was =C{row}-B{row} without -$E$4
        assert omitted_zero_disc is not None
        assert "Zero reference error" in omitted_zero_disc.legal_implication

    def test_turning_point_calculation_drift_flagged(self) -> None:
        """Direct subtraction I - L without turning point changeover is flagged."""
        excel_bytes = generate_sample_legacy_excel(has_flaws=True)
        report = parse_legacy_excel(excel_bytes)

        turning_pt_disc = next(
            (
                d
                for d in report.discrepancies
                if d.discrepancy_type == DiscrepancyType.NO_CHANGEOVER_TURNING_POINT
            ),
            None,
        )
        assert turning_pt_disc is not None
        assert turning_pt_disc.severity == "HIGH"
        assert "omitting Clause A.4.4.3 turning point" in turning_pt_disc.legal_implication

    def test_eccentricity_observations_parsed(self) -> None:
        """Eccentricity corner tests in Sheet 3 are parsed and validated."""
        excel_bytes = generate_sample_legacy_excel(has_flaws=False)
        report = parse_legacy_excel(excel_bytes)

        assert len(report.eccentricity_observations) == 5
        center = report.eccentricity_observations[0]
        assert "Center" in center.position
        assert center.load == Decimal("10")
        assert center.is_compliant is True

    def test_engine_classmethod_alias(self) -> None:
        """LegacyExcelMigrationEngine.parse_legacy_excel must match global parse_legacy_excel."""
        excel_bytes = generate_sample_legacy_excel(has_flaws=True)
        r1 = parse_legacy_excel(excel_bytes)
        r2 = LegacyExcelMigrationEngine.parse_legacy_excel(excel_bytes)

        assert r1.oiml_overall_verdict == r2.oiml_overall_verdict
        assert r1.total_discrepancies == r2.total_discrepancies
        assert r1.false_passes_count == r2.false_passes_count


# ============================================================================
# 2. FASTAPI ROUTE INTEGRATION TESTS
# ============================================================================


class TestExcelIngestionApiEndpoints:
    """HTTP endpoint integration tests for /api/v1/ingestion router."""

    def test_upload_excel_endpoint(self, client: TestClient) -> None:
        excel_bytes = generate_sample_legacy_excel(has_flaws=True)
        response = client.post(
            "/api/v1/ingestion/excel/upload",
            files={
                "file": (
                    "RRSL_Bangalore_2018.xlsx",
                    excel_bytes,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                )
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["filename"] == "RRSL_Bangalore_2018.xlsx"
        assert data["total_observations"] >= 10
        assert data["false_passes_count"] >= 1
        assert data["oiml_overall_verdict"] == "FAIL"

    def test_parse_base64_endpoint(self, client: TestClient) -> None:
        excel_bytes = generate_sample_legacy_excel(has_flaws=False)
        b64_str = base64.b64encode(excel_bytes).decode("ascii")

        response = client.post(
            "/api/v1/ingestion/excel/parse-base64",
            json={
                "filename": "compliant_test.xlsx",
                "file_base64": b64_str,
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["filename"] == "compliant_test.xlsx"
        assert data["oiml_overall_verdict"] == "PASS"
        assert data["false_passes_count"] == 0

    def test_download_sample_excel_endpoint(self, client: TestClient) -> None:
        response = client.get("/api/v1/ingestion/excel/sample-file?has_flaws=true")
        assert response.status_code == 200
        assert (
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            in response.headers["content-type"]
        )
        assert len(response.content) > 1000

    def test_demo_report_endpoint(self, client: TestClient) -> None:
        response = client.get("/api/v1/ingestion/excel/demo-report")
        assert response.status_code == 200
        data = response.json()
        assert data["false_passes_count"] >= 1
        assert data["oiml_overall_verdict"] == "FAIL"
        assert len(data["discrepancies"]) >= 1

    def test_sample_data_url_endpoint(self, client: TestClient) -> None:
        response = client.get("/api/v1/ingestion/excel/sample-data-url")
        assert response.status_code == 200
        data = response.json()
        assert "flawed_legacy_sheet" in data
        assert "compliant_legacy_sheet" in data
        assert len(data["flawed_legacy_sheet"]["base64"]) > 500

    def test_reject_invalid_extension(self, client: TestClient) -> None:
        response = client.post(
            "/api/v1/ingestion/excel/upload",
            files={"file": ("invalid_file.pdf", b"%PDF-1.4...", "application/pdf")},
        )
        assert response.status_code == 400
        assert "must be an Excel spreadsheet" in response.json()["detail"]
