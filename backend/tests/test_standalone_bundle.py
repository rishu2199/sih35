"""Comprehensive verification tests for Step 30: Standalone Desktop Packaging & Offline Bundle.

Tests air-gapped lab readiness, configuration validation for Tauri and Docker Compose,
and zero-network deterministic operation.
"""

from __future__ import annotations

import json
from pathlib import Path

from fastapi.testclient import TestClient

from app.ingestion.excel_parser import (
    DiscrepancyType,
    generate_sample_legacy_excel,
    parse_legacy_excel,
)
from app.main import app

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent.parent


class TestStandaloneDesktopPackagingAndOfflineBundle:
    """Validates configuration files and air-gapped lab readiness."""

    def test_tauri_configuration_validity(self) -> None:
        """src-tauri/tauri.conf.json must be valid JSON and contain production metadata."""
        tauri_conf_path = WORKSPACE_ROOT / "src-tauri" / "tauri.conf.json"
        assert tauri_conf_path.exists(), f"Missing {tauri_conf_path}"

        with open(tauri_conf_path, encoding="utf-8") as f:
            data = json.load(f)

        assert data["package"]["productName"] == "METROLOGIX-76"
        assert data["package"]["version"] == "1.0.0"
        assert data["tauri"]["bundle"]["identifier"] == "gov.in.doca.metrologix76"

        # Check window configuration
        windows = data["tauri"]["windows"]
        assert len(windows) >= 1
        main_win = windows[0]
        assert main_win["width"] >= 1024
        assert main_win["height"] >= 700
        assert "Air-Gapped Offline Lab Edition" in main_win["title"]

    def test_tauri_cargo_and_rust_files_exist(self) -> None:
        """Cargo.toml and src/main.rs must exist with valid Rust configurations."""
        cargo_path = WORKSPACE_ROOT / "src-tauri" / "Cargo.toml"
        main_rs_path = WORKSPACE_ROOT / "src-tauri" / "src" / "main.rs"
        build_rs_path = WORKSPACE_ROOT / "src-tauri" / "build.rs"

        assert cargo_path.exists()
        assert main_rs_path.exists()
        assert build_rs_path.exists()

        cargo_content = cargo_path.read_text(encoding="utf-8")
        assert "metrologix-76" in cargo_content
        assert "tauri" in cargo_content

        main_rs_content = main_rs_path.read_text(encoding="utf-8")
        assert "check_offline_status" in main_rs_content
        assert "save_local_certificate_file" in main_rs_content

    def test_docker_offline_bundle_files_exist(self) -> None:
        """Docker Compose offline files and Nginx reverse proxy configuration must exist."""
        compose_path = WORKSPACE_ROOT / "docker-compose.offline.yml"
        backend_df = WORKSPACE_ROOT / "Dockerfile.backend"
        frontend_df = WORKSPACE_ROOT / "Dockerfile.frontend"
        nginx_conf = WORKSPACE_ROOT / "nginx.offline.conf"

        assert compose_path.exists()
        assert backend_df.exists()
        assert frontend_df.exists()
        assert nginx_conf.exists()

        compose_content = compose_path.read_text(encoding="utf-8")
        assert "metrologix-backend-offline" in compose_content
        assert "metrologix-frontend-offline" in compose_content
        assert "OFFLINE_MODE=true" in compose_content

        nginx_content = nginx_conf.read_text(encoding="utf-8")
        assert "proxy_pass http://backend:8000/api/" in nginx_content
        assert "try_files $uri $uri/ /index.html" in nginx_content

    def test_launch_offline_scripts_exist(self) -> None:
        """1-click native launcher scripts for Windows lab PCs must exist."""
        bat_launcher = WORKSPACE_ROOT / "launch_offline.bat"
        ps1_launcher = WORKSPACE_ROOT / "launch_offline.ps1"

        assert bat_launcher.exists()
        assert ps1_launcher.exists()

        bat_content = bat_launcher.read_text(encoding="utf-8", errors="ignore")
        assert "METROLOGIX-76" in bat_content
        assert "uvicorn app.main:app" in bat_content

        ps1_content = ps1_launcher.read_text(encoding="utf-8")
        assert "METROLOGIX-76" in ps1_content
        assert "Start-Process" in ps1_content

    def test_frontend_dist_bundle_built(self) -> None:
        """Production bundle in frontend/dist must exist for air-gapped serving."""
        dist_dir = WORKSPACE_ROOT / "frontend" / "dist"
        index_html = dist_dir / "index.html"
        assets_dir = dist_dir / "assets"

        assert dist_dir.exists(), "frontend/dist directory missing. Run npm run build."
        assert index_html.exists(), "frontend/dist/index.html missing."
        assert assets_dir.exists(), "frontend/dist/assets missing."

    def test_airgap_offline_calculation_deterministic(self) -> None:
        """Entire ingestion, changeover turning point, and discrepancy engine

        must execute deterministically in memory with zero internet connection.
        """
        # Generate flawed spreadsheet in memory
        raw_xlsx = generate_sample_legacy_excel(has_flaws=True)
        assert len(raw_xlsx) > 0

        # Parse without network
        report = parse_legacy_excel(raw_xlsx, filename="airgap_test.xlsx")
        assert report.total_observations >= 10
        assert report.false_passes_count >= 1
        assert report.oiml_overall_verdict == "FAIL"

        # Verify critical false pass detected
        false_pass = next(
            (d for d in report.discrepancies if d.discrepancy_type == DiscrepancyType.FALSE_PASS),
            None,
        )
        assert false_pass is not None
        assert false_pass.load == 10
        assert "STATUTORY AUDIT BREACH" in false_pass.legal_implication

    def test_api_health_endpoint(self) -> None:
        """Health endpoint returns healthy status for offline Docker/Tauri healthcheck."""
        client = TestClient(app)
        for path in ("/health", "/api/health"):
            response = client.get(path)
            assert response.status_code == 200
            data = response.json()
            assert data.get("status") == "healthy"
