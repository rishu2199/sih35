"""Smoke tests — verify the application boots and core imports resolve."""

import pytest
from fastapi.testclient import TestClient

from app.core.config import settings
from app.main import app


@pytest.fixture()
def client() -> TestClient:
    """Return a synchronous test client for the FastAPI app."""
    return TestClient(app)


class TestHealth:
    """Verify the /api/health endpoint is reachable and returns expected payload."""

    def test_health_returns_200(self, client: TestClient) -> None:
        response = client.get("/api/health")
        assert response.status_code == 200

    def test_health_payload_structure(self, client: TestClient) -> None:
        response = client.get("/api/health")
        body = response.json()
        assert "status" in body
        assert "version" in body

    def test_health_status_is_ok(self, client: TestClient) -> None:
        response = client.get("/api/health")
        assert response.json()["status"] in ("ok", "healthy")


    def test_health_version_matches_settings(self, client: TestClient) -> None:
        response = client.get("/api/health")
        assert response.json()["version"] == settings.APP_VERSION


class TestConfiguration:
    """Verify settings load without errors."""

    def test_settings_app_title(self) -> None:
        assert settings.APP_TITLE == "METROLOGIX-76"

    def test_settings_database_url_is_set(self) -> None:
        assert settings.DATABASE_URL != ""

    def test_settings_jwt_algorithm(self) -> None:
        assert settings.JWT_ALGORITHM == "HS256"
