"""
METROLOGIX-76 — Tests for Instrument Intake, Nameplate OCR, and WELMEC 7.2 Software Examination.

Statutory Authorities & Verification Gates:
- OIML R 76-1:2006 Clause 7.1 (Markings) & Clause 3.2 (Table 3)
- WELMEC 7.2 Issue 7 Software Audit Guide (SHA-256 & C-parameter)
- SIH Problem Statement 26035 / Step 18 Verification Gate
"""

from __future__ import annotations

from collections.abc import AsyncGenerator
from decimal import Decimal

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import event
from sqlalchemy.engine import Engine
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.types import AccuracyClass, UnitOfMeasure
from app.db.base import Base
from app.db.models import Laboratory, LaboratoryType, User, UserRole
from app.db.session import _set_sqlite_pragma, get_db
from app.main import app
from app.vision.ocr_intake import (
    NameplateOcrEngine,
    extract_nameplate_parameters,
)

# ============================================================================
# 1. Test Database Engine & Fixtures
# ============================================================================


@pytest.fixture
async def intake_db_engine() -> AsyncGenerator[AsyncEngine, None]:
    """Create isolated SQLite in-memory engine with PRAGMA foreign keys enabled."""
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    event.listen(Engine, "connect", _set_sqlite_pragma)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield engine

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest.fixture
async def intake_db_session(
    intake_db_engine: AsyncEngine,
) -> AsyncGenerator[AsyncSession, None]:
    """Provide an isolated database session with pre-seeded statutory entities."""
    session_factory = async_sessionmaker(
        bind=intake_db_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )
    async with session_factory() as session:
        # Seed test laboratory
        lab = Laboratory(
            id="lab-rrsl-bengaluru-001",
            code="RRSL-BLR",
            name="Regional Reference Standard Laboratory, Bengaluru",
            lab_type=LaboratoryType.RRSL,
            address="Peenya Industrial Area",
            city="Bengaluru",
            state="Karnataka",
            pincode="560058",
            contact_email="director.blr@doca.gov.in",
            contact_phone="+91-80-28394000",
        )
        session.add(lab)

        # Seed test metrologist
        user = User(
            id="usr-metrologist-001",
            email="metrologist@rrsl.gov.in",
            username="anand.raman",
            hashed_password="hashed_placeholder_pwd",
            full_name="Dr. Anand Raman",
            role=UserRole.METROLOGIST,
            designation="Senior Testing Officer",
            laboratory_id="lab-rrsl-bengaluru-001",
            is_active=True,
        )
        session.add(user)
        await session.commit()

        yield session


@pytest.fixture
async def api_client(
    intake_db_session: AsyncSession,
) -> AsyncGenerator[AsyncClient, None]:
    """FastAPI AsyncClient with dependency override pointing to isolated in-memory DB."""

    async def _override_get_db() -> AsyncGenerator[AsyncSession, None]:
        yield intake_db_session

    app.dependency_overrides[get_db] = _override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        yield client
    app.dependency_overrides.clear()


# ============================================================================
# 2. Unit Tests for Nameplate OCR & Regex Engine
# ============================================================================


class TestNameplateOcrEngine:
    """Evaluates accuracy and robustness of nameplate OCR text extraction."""

    def test_extract_class_iii_nameplate_text(self) -> None:
        raw_text = (
            "Avery India Ltd.\n"
            "Model: ZM510-Industrial\n"
            "S/N: AV-2026-9912\n"
            "Accuracy Class: [III]\n"
            "Max: 30 kg\n"
            "Min: 100 g\n"
            "e = 10 g\n"
            "d = 10 g\n"
            "TAC: IND-TAC-2026-0842\n"
            "FW Ver: v2.4.1-legal\n"
            "Checksum: 8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4\n"
            "C-Parameter: 14"
        )
        res = extract_nameplate_parameters(raw_text)

        assert res.parameters.manufacturer == "Avery India Ltd"
        assert res.parameters.model_name == "ZM510-Industrial"
        assert res.parameters.serial_number == "AV-2026-9912"
        assert res.parameters.accuracy_class == AccuracyClass.CLASS_III
        assert res.parameters.max_capacity == Decimal("30")
        assert res.parameters.min_capacity == Decimal("100")
        assert res.parameters.e == Decimal("10")
        assert res.parameters.d == Decimal("10")
        assert res.parameters.unit == UnitOfMeasure.KILOGRAM
        assert res.parameters.approval_number == "IND-TAC-2026-0842"

        # WELMEC 7.2 software examination markings
        assert res.software_audit.firmware_version == "v2.4.1-legal"
        assert (
            res.software_audit.sha256_checksum
            == "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4"
        )
        assert res.software_audit.calibration_event_counter == 14
        assert res.confidence_score >= 0.85

    def test_extract_class_i_analytical_balance(self) -> None:
        raw_text = (
            "Mettler-Toledo India\n"
            "Model: XPE-205 Micro\n"
            "Serial No: MT-8841-A\n"
            "Class: (I)\n"
            "Max: 220 g\n"
            "Min: 0.02 g\n"
            "e = 0.001 g\n"
            "d = 0.0001 g\n"
            "TAC: IND-TAC-2025-0112\n"
            "SW ID: v1.0.8\n"
            "SHA256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855\n"
            "Event Counter: 2"
        )
        res = NameplateOcrEngine.parse_nameplate_text(raw_text)

        assert res.parameters.manufacturer == "Mettler-Toledo India"
        assert res.parameters.accuracy_class == AccuracyClass.CLASS_I
        assert res.parameters.max_capacity == Decimal("220")
        assert res.parameters.min_capacity == Decimal("0.02")
        assert res.parameters.e == Decimal("0.001")
        assert res.parameters.d == Decimal("0.0001")
        assert res.software_audit.firmware_version == "v1.0.8"
        assert res.software_audit.calibration_event_counter == 2

    def test_extract_class_ii_precision_scale(self) -> None:
        raw_text = (
            "Sansui Electronics India\n"
            "Model: SC-600 High-Precision\n"
            "S/N: SAN-600-441\n"
            "Accuracy Class: II\n"
            "Max = 600 g\n"
            "e = 0.05 g\n"
            "d = 0.01 g\n"
            "C: 5"
        )
        res = NameplateOcrEngine.parse_nameplate_text(raw_text)

        assert res.parameters.accuracy_class == AccuracyClass.CLASS_II
        assert res.parameters.max_capacity == Decimal("600")
        assert res.parameters.e == Decimal("0.05")
        assert res.parameters.d == Decimal("0.01")
        assert res.software_audit.calibration_event_counter == 5

    def test_image_bytes_scan_fallback_safety(self) -> None:
        dummy_png = (
            b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
            b"\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01"
            b"\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
        )
        res = extract_nameplate_parameters(dummy_png, filename="avery_class3_nameplate.png")
        assert res is not None
        assert res.parameters.max_capacity is not None
        assert res.parameters.accuracy_class == AccuracyClass.CLASS_III

    def test_extract_base64_data_url(self) -> None:
        b64 = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
        res = extract_nameplate_parameters(b64)
        assert res is not None
        assert res.confidence_score > 0.0


# ============================================================================
# 3. Integration Tests for FastAPI Intake Routes
# ============================================================================


@pytest.mark.asyncio
class TestIntakeApiEndpoints:
    """Verifies statutory intake REST API endpoints."""

    async def test_ocr_scan_json_endpoint(self, api_client: AsyncClient) -> None:
        sample_text = (
            "Avery India Ltd.\n"
            "Model: Avery-30kg\n"
            "S/N: SN-2026-3001\n"
            "Class: [III]\n"
            "Max: 30 kg\n"
            "Min: 100 g\n"
            "e = 5 g\n"
            "d = 5 g\n"
            "TAC: IND-TAC-2026-0001\n"
            "FW Ver: v2.1.0\n"
            "Checksum: a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890\n"
            "C-Parameter: 8"
        )
        response = await api_client.post(
            "/api/v1/intake/ocr-scan-json",
            json={"raw_text": sample_text},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["parameters"]["max_capacity"] == "30"
        assert data["parameters"]["e"] == "5"
        assert data["parameters"]["accuracy_class"] == "CLASS_III"
        assert data["software_audit"]["firmware_version"] == "v2.1.0"
        assert data["software_audit"]["calibration_event_counter"] == 8

    async def test_validate_specs_valid_class_iii_step_18_gate(
        self, api_client: AsyncClient
    ) -> None:
        """
        Step 18 Verification Gate: Max = 30kg, e = 5g immediately shows n = 6,000
        (Valid Class III) and renders the applicable test cards.
        """
        payload = {
            "accuracy_class": "CLASS_III",
            "max_capacity": "30.0",
            "min_capacity": "0.1",
            "e": "0.005",  # 5 g in kg
            "d": "0.005",
            "unit": "KILOGRAM",
            "receptor_type": "PLATFORM",
            "num_supports": 4,
            "mobility": "FIXED",
            "has_tare_device": True,
            "has_level_indicator": True,
        }
        response = await api_client.post("/api/v1/intake/validate-specs", json=payload)
        assert response.status_code == 200
        data = response.json()

        assert data["is_valid"] is True
        assert Decimal(data["n"]) == Decimal("6000")
        assert data["applicable_tests_count"] >= 6
        assert len(data["test_suite_preview"]) >= 6

        test_names = [t["test_name"] for t in data["test_suite_preview"]]
        assert any("Weighing" in name for name in test_names)
        assert any("Eccentricity" in name for name in test_names)
        assert any("Repeatability" in name for name in test_names)

    async def test_validate_specs_invalid_table_3_rejected(
        self, api_client: AsyncClient
    ) -> None:
        """Verify that out-of-bracket parameters produce validation errors."""
        payload = {
            "accuracy_class": "CLASS_III",
            "max_capacity": "15.0",
            "min_capacity": "0.1",
            "e": "0.05",  # 50 g in kg -> n = 15 / 0.05 = 300 (< 500)
            "d": "0.05",
            "unit": "KILOGRAM",
        }
        response = await api_client.post("/api/v1/intake/validate-specs", json=payload)
        assert response.status_code == 200
        data = response.json()

        assert data["is_valid"] is False
        assert len(data["violations"]) > 0
        assert any("is less than the statutory minimum" in v for v in data["violations"])

    async def test_register_instrument_success(self, api_client: AsyncClient) -> None:
        """Register valid instrument and verify session creation with audit event."""
        unique_serial = f"TEST-SN-{Decimal('1000') + Decimal('42')}"
        payload = {
            "manufacturer": "Avery India Ltd",
            "model_name": "Avery-30kg-Digital",
            "serial_number": unique_serial,
            "approval_number": "IND-TAC-2026-9901",
            "accuracy_class": "CLASS_III",
            "max_capacity": "30.0",
            "min_capacity": "0.1",
            "e": "0.005",
            "d": "0.005",
            "unit": "KILOGRAM",
            "receptor_type": "PLATFORM",
            "firmware_version": "v1.2.0-legal",
            "sha256_checksum": (
                "a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890"
            ),
            "calibration_event_counter": 12,
            "software_separation": "TYPE_P",
            "laboratory_id": "lab-rrsl-bengaluru-001",
            "operator_id": "usr-metrologist-001",
        }
        response = await api_client.post("/api/v1/intake/register", json=payload)
        assert response.status_code == 201
        data = response.json()

        assert data["serial_number"] == unique_serial
        assert data["status"] == "DRAFT"
        assert data["compliance_status"] == "PENDING"
        assert data["audit_event_id"] is not None
        assert len(data["audit_hash"]) == 64

    async def test_register_instrument_invalid_welmec_hash_rejected(
        self, api_client: AsyncClient
    ) -> None:
        payload = {
            "manufacturer": "Avery India Ltd",
            "model_name": "Model-X",
            "serial_number": "SN-INV-HASH-01",
            "accuracy_class": "CLASS_III",
            "max_capacity": "30.0",
            "min_capacity": "0.1",
            "e": "0.005",
            "d": "0.005",
            "unit": "KILOGRAM",
            "sha256_checksum": "INVALID_NON_HEX_HASH_12345",
        }
        response = await api_client.post("/api/v1/intake/register", json=payload)
        assert response.status_code == 422
        detail = response.json()["detail"]
        assert "Invalid WELMEC 7.2 software checksum" in detail["message"]

    async def test_register_instrument_table_3_violation_rejected(
        self, api_client: AsyncClient
    ) -> None:
        payload = {
            "manufacturer": "Avery India Ltd",
            "model_name": "Model-Invalid",
            "serial_number": "SN-INV-TABLE3-01",
            "accuracy_class": "CLASS_III",
            "max_capacity": "15.0",
            "min_capacity": "0.1",
            "e": "0.05",  # n = 300 (< 500)
            "d": "0.05",
            "unit": "KILOGRAM",
        }
        response = await api_client.post("/api/v1/intake/register", json=payload)
        assert response.status_code == 422
        detail = response.json()["detail"]
        assert "violate OIML R 76-1 Table 3" in detail["message"]
