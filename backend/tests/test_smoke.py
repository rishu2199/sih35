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

    def test_settings_cors_origins_various_env_formats(self, monkeypatch: pytest.MonkeyPatch) -> None:
        from app.core.config import Settings

        # Case 1: Wildcard string (Render deployment format: CORS_ORIGINS="*")
        monkeypatch.setenv("CORS_ORIGINS", "*")
        s1 = Settings()
        assert s1.CORS_ORIGINS == ["*"]

        # Case 2: Comma-separated origins
        monkeypatch.setenv("CORS_ORIGINS", "https://app.metrologix.com, https://admin.metrologix.com")
        s2 = Settings()
        assert s2.CORS_ORIGINS == ["https://app.metrologix.com", "https://admin.metrologix.com"]

        # Case 3: JSON array string
        monkeypatch.setenv("CORS_ORIGINS", '["http://localhost:5173", "https://foo.com"]')
        s3 = Settings()
        assert s3.CORS_ORIGINS == ["http://localhost:5173", "https://foo.com"]

        # Case 4: Empty string fallback
        monkeypatch.setenv("CORS_ORIGINS", "")
        s4 = Settings()
        assert s4.CORS_ORIGINS == ["*"]
