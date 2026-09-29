"""Tests for METROLOGIX-76 Standardized Reports & Repository API endpoints."""

from __future__ import annotations

import io
import docx
import pypdf
import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture()
def client() -> TestClient:
    """Return synchronous TestClient."""
    return TestClient(app)


class TestReportsAPI:
    """Suite verifying PDF & Word (.docx) generation and repository endpoints."""

    def test_download_pdf_report_default(self, client: TestClient) -> None:
        """Test GET /api/v1/reports/pdf returns valid binary PDF/A."""
        response = client.get("/api/v1/reports/pdf")
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/pdf"
        assert "attachment" in response.headers["content-disposition"]
        assert "OIML_R76_Test_Report" in response.headers["content-disposition"]
        assert response.content.startswith(b"%PDF-1.")

        # Verify valid readable PDF structure
        reader = pypdf.PdfReader(io.BytesIO(response.content))
        assert len(reader.pages) >= 3

    def test_download_docx_report_default(self, client: TestClient) -> None:
        """Test GET /api/v1/reports/docx returns valid binary Word document."""
        response = client.get("/api/v1/reports/docx")
        assert response.status_code == 200
        assert "officedocument.wordprocessingml.document" in response.headers["content-type"]
        assert "attachment" in response.headers["content-disposition"]
        assert len(response.content) > 15000

        # Verify valid readable Word document structure
        doc = docx.Document(io.BytesIO(response.content))
        assert len(doc.tables) >= 8

    def test_download_bilingual_and_hindi_reports(self, client: TestClient) -> None:
        """Test language query parameter for PDF and Word."""
        # Bilingual PDF
        resp_bi = client.get("/api/v1/reports/pdf?language=bilingual")
        assert resp_bi.status_code == 200
        assert resp_bi.content.startswith(b"%PDF-1.")

        # Hindi DOCX
        resp_hi = client.get("/api/v1/reports/docx?language=hi")
        assert resp_hi.status_code == 200
        assert len(resp_hi.content) > 15000

    def test_session_report_shortcuts(self, client: TestClient) -> None:
        """Test /sessions/{id}/pdf and /sessions/{id}/docx endpoints."""
        session_id = "sess-rrsl-blr-2026-001"
        pdf_resp = client.get(f"/api/v1/reports/sessions/{session_id}/pdf")
        assert pdf_resp.status_code == 200
        assert pdf_resp.content.startswith(b"%PDF-1.")

        docx_resp = client.get(f"/api/v1/reports/sessions/{session_id}/docx")
        assert docx_resp.status_code == 200
        assert len(docx_resp.content) > 15000

    def test_reports_repository_listing(self, client: TestClient) -> None:
        """Test GET /api/v1/reports/repository returns indexed sessions."""
        response = client.get("/api/v1/reports/repository")
        assert response.status_code == 200
        data = response.json()
        assert "total" in data
        assert "items" in data
        assert data["total"] >= 5
        assert len(data["items"]) >= 5

        # Check structure of items
        first_item = data["items"][0]
        assert "session_number" in first_item
        assert "instrument_model" in first_item
        assert "accuracy_class" in first_item
        assert "pdf_download_url" in first_item
        assert "docx_download_url" in first_item

    def test_reports_repository_search_and_filters(self, client: TestClient) -> None:
        """Test search query and status filters on report repository."""
        # Search by model
        res_search = client.get("/api/v1/reports/repository?search=Precision-Pro")
        assert res_search.status_code == 200
        items = res_search.json()["items"]
        assert len(items) >= 1
        assert any("Precision-Pro" in item["instrument_model"] for item in items)

        # Filter by status
        res_approved = client.get("/api/v1/reports/repository?status=APPROVED")
        assert res_approved.status_code == 200
        approved_items = res_approved.json()["items"]
        assert all(item["status"] == "APPROVED" for item in approved_items)

        # Filter by class
        res_class = client.get("/api/v1/reports/repository?class=CLASS_I")
        assert res_class.status_code == 200
        class_items = res_class.json()["items"]
        assert all(item["accuracy_class"] == "CLASS_I" for item in class_items)
