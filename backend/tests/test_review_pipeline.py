"""METROLOGIX-76 — Tests for Multi-Tier Laboratory Review Pipeline & Row-Level Audit.

Statutory Authorities:
- Legal Metrology Act, 2009 (Sections 19, 20, 21, 22, 24)
- Legal Metrology (General) Rules, 2011, Rule 16
- OIML R 76-2:2007 (E) Section 8 (Test Report Sign-off & eMaap Verification)
- SIH Problem Statement 26035 / Step 25 Verification Gate
"""

from __future__ import annotations

import uuid
from collections.abc import AsyncGenerator
from datetime import datetime, timezone
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

from app.core.types import (
    AccuracyClass,
    ComplianceStatus,
    InstrumentMobility,
    LoadReceptorType,
    VerificationStage,
)
from app.db.base import Base
from app.db.models import (
    Instrument,
    Laboratory,
    LaboratoryType,
    TestSession,
    TestSessionStatus,
    UnitOfMeasurement,
    User,
    UserRole,
)
from app.db.session import _set_sqlite_pragma, get_db
from app.main import app


# ============================================================================
# Test Database Fixtures
# ============================================================================


@pytest.fixture
async def review_db_engine() -> AsyncGenerator[AsyncEngine, None]:
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
async def review_db_session(
    review_db_engine: AsyncEngine,
) -> AsyncGenerator[AsyncSession, None]:
    """Yield an active transaction session seeded with test laboratory and test session."""
    session_factory = async_sessionmaker(
        bind=review_db_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )
    async with session_factory() as session:
        # Seed Lab
        lab = Laboratory(
            id="lab-rrsl-blr",
            code="RRSL-BLR",
            name="Regional Reference Standard Laboratory, Bengaluru",
            lab_type=LaboratoryType.RRSL,
            address="Outer Ring Road, Bengaluru",
            city="Bengaluru",
            state="Karnataka",
            pincode="560068",
            contact_email="director.blr@rrsl.gov.in",
            contact_phone="+91-80-2553-0001",
        )
        session.add(lab)

        # Seed Users: Metrologist, Reviewer, Director
        metrologist = User(
            id="usr-metrologist-01",
            username="anand.raman",
            email="anand.raman@rrsl.gov.in",
            hashed_password="hashed_pw_test",
            full_name="Dr. Anand Raman",
            designation="Testing Officer Grade I",
            role=UserRole.METROLOGIST,
            laboratory_id=lab.id,
        )
        reviewer = User(
            id="usr-reviewer-01",
            username="preeti.deshmukh",
            email="preeti.deshmukh@rrsl.gov.in",
            hashed_password="hashed_pw_test",
            full_name="Smt. Preeti Deshmukh",
            designation="Principal Scientific Officer",
            role=UserRole.REVIEWER,
            laboratory_id=lab.id,
        )
        director = User(
            id="usr-director-01",
            username="rajeshwar.sharma",
            email="director.blr@rrsl.gov.in",
            hashed_password="hashed_pw_test",
            full_name="Dr. Rajeshwar Sharma",
            designation="Director / Controller",
            role=UserRole.DIRECTOR,
            laboratory_id=lab.id,
        )
        session.add_all([metrologist, reviewer, director])

        # Seed Instrument
        inst = Instrument(
            id="inst-test-01",
            serial_number="ET-2026-9041",
            model_name="Precision-Pro 30K",
            manufacturer="Essae-Teraoka Pvt Ltd",
            accuracy_class=AccuracyClass.CLASS_III,
            verification_stage=VerificationStage.INITIAL_TYPE_APPROVAL,
            unit=UnitOfMeasurement.GRAM,
            max_capacity=Decimal("30000.0"),
            min_capacity=Decimal("100.0"),
            verification_scale_interval=Decimal("5.0"),
            actual_scale_interval=Decimal("5.0"),
            receptor_type=LoadReceptorType.PLATFORM,
            mobility=InstrumentMobility.PORTABLE,
            has_level_indicator=True,
            has_tare_device=True,
            num_supports=4,
            is_multi_interval=False,
            rulepack_id="OIML_R76_2006",
        )
        session.add(inst)

        # Seed TestSession in IN_PROGRESS (IN_TESTING) state
        test_session = TestSession(
            id="sess-review-test-01",
            session_number="RRSL-REV-TEST-001",
            instrument_id=inst.id,
            laboratory_id=lab.id,
            operator_id=metrologist.id,
            status=TestSessionStatus.IN_PROGRESS,
            verification_stage=VerificationStage.INITIAL_TYPE_APPROVAL,
            overall_compliance=ComplianceStatus.PASS,
            notes="Testing observations completed on workbench #3",
        )
        session.add(test_session)
        await session.commit()

        yield session


@pytest.fixture
async def review_client(review_db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Provide AsyncClient with the database session dependency overridden."""

    async def _override_get_db() -> AsyncGenerator[AsyncSession, None]:
        yield review_db_session

    app.dependency_overrides[get_db] = _override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        yield client
    app.dependency_overrides.clear()


# ============================================================================
# Review Pipeline Tests
# ============================================================================


class TestReviewPipeline:
    """Test suite for Step 25 Multi-Tier Review Pipeline."""

    @pytest.mark.asyncio
    async def test_get_review_queue(self, review_client: AsyncClient) -> None:
        """Verify fetching the review queue lists active test sessions."""
        res = await review_client.get("/api/v1/review/queue")
        assert res.status_code == 200
        data = res.json()
        assert data["total"] >= 1
        assert any(item["session_number"] == "RRSL-REV-TEST-001" for item in data["items"])

    @pytest.mark.asyncio
    async def test_submit_for_technical_review(
        self, review_client: AsyncClient, review_db_session: AsyncSession
    ) -> None:
        """Verify Metrologist transitions session from IN_TESTING to PENDING_REVIEW."""
        payload = {
            "operator_id": "usr-metrologist-01",
            "operator_notes": "Observations verified against Table 3. Ready for review.",
        }
        res = await review_client.post(
            "/api/v1/review/sessions/sess-review-test-01/submit",
            json=payload,
        )
        assert res.status_code == 200
        data = res.json()
        assert data["new_status"] == "PENDING_REVIEW"

        # Verify DB state
        session_obj = await review_db_session.get(TestSession, "sess-review-test-01")
        assert session_obj is not None
        assert session_obj.status == TestSessionStatus.PENDING_REVIEW

    @pytest.mark.asyncio
    async def test_remand_session_workflow(
        self, review_client: AsyncClient, review_db_session: AsyncSession
    ) -> None:
        """Verify Reviewing Officer remands session with mandatory justification."""
        payload = {
            "reviewer_id": "usr-reviewer-01",
            "reviewer_name": "Smt. Preeti Deshmukh",
            "remand_reason": "Repeatability margin too low (< 0.2e); re-test recommended.",
        }
        res = await review_client.post(
            "/api/v1/review/sessions/sess-review-test-01/remand",
            json=payload,
        )
        assert res.status_code == 200
        data = res.json()
        assert data["new_status"] == "REMANDED"
        assert "Repeatability margin too low" in data["remand_reason"]

        # Verify DB reflects REJECTED / notes
        session_obj = await review_db_session.get(TestSession, "sess-review-test-01")
        assert session_obj is not None
        assert session_obj.status == TestSessionStatus.REJECTED
        assert "REMANDED" in (session_obj.notes or "")

    @pytest.mark.asyncio
    async def test_recommend_approval_workflow(
        self, review_client: AsyncClient, review_db_session: AsyncSession
    ) -> None:
        """Verify Reviewing Officer recommends session for Director approval."""
        payload = {
            "reviewer_id": "usr-reviewer-01",
            "reviewer_name": "Smt. Preeti Deshmukh",
            "recommendation_notes": "All calculations verified against OIML R 76-1 Cl. A.4.4.",
        }
        res = await review_client.post(
            "/api/v1/review/sessions/sess-review-test-01/approve",
            json=payload,
        )
        assert res.status_code == 200
        data = res.json()
        assert "Technical review completed" in data["message"]

    @pytest.mark.asyncio
    async def test_director_sign_invalid_pin(self, review_client: AsyncClient) -> None:
        """Verify wrong Director PIN returns 401 Unauthorized."""
        payload = {
            "director_id": "usr-director-01",
            "director_name": "Dr. Rajeshwar Sharma",
            "director_pin": "9999",  # Wrong PIN
            "statutory_confirmed": True,
        }
        res = await review_client.post(
            "/api/v1/review/sessions/sess-review-test-01/sign",
            json=payload,
        )
        assert res.status_code == 401
        assert "Invalid Director signing PIN" in res.json()["detail"]

    @pytest.mark.asyncio
    async def test_director_sign_and_permanent_lock(
        self, review_client: AsyncClient, review_db_session: AsyncSession
    ) -> None:
        """Verify Director signs with valid PIN, locks session permanently, and generates ECDSA signature."""
        payload = {
            "director_id": "usr-director-01",
            "director_name": "Dr. Rajeshwar Sharma",
            "director_pin": "1234",  # Valid PIN
            "statutory_confirmed": True,
        }
        res = await review_client.post(
            "/api/v1/review/sessions/sess-review-test-01/sign",
            json=payload,
        )
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "APPROVED"
        assert data["is_locked"] is True
        assert len(data["signature_digest"]) == 64
        assert data["signature_base64"] is not None
        assert "https://emaap.doca.gov.in/verify/" in data["verification_url"]

        # Verify DB reflects permanent lock
        session_obj = await review_db_session.get(TestSession, "sess-review-test-01")
        assert session_obj is not None
        assert session_obj.status == TestSessionStatus.APPROVED
        assert session_obj.completed_at is not None

        # Verify zero-bug rule: subsequent sign attempt fails with 400
        second_res = await review_client.post(
            "/api/v1/review/sessions/sess-review-test-01/sign",
            json=payload,
        )
        assert second_res.status_code == 400
        assert "already been digitally signed" in second_res.json()["detail"]

    @pytest.mark.asyncio
    async def test_row_level_comment_workflow(self, review_client: AsyncClient) -> None:
        """Verify posting and retrieving row-level audit comments."""
        comment_payload = {
            "step_index": 5,
            "test_type": "WEIGHING",
            "target_load": 20000.0,
            "unit": "g",
            "author_name": "Smt. Preeti Deshmukh",
            "author_role": "REVIEWER",
            "author_email": "preeti.deshmukh@rrsl.gov.in",
            "comment": "Repeatability margin too low (< 0.2e); re-test recommended.",
            "severity": "FLAG",
        }
        post_res = await review_client.post(
            "/api/v1/review/sessions/sess-review-test-01/comments",
            json=comment_payload,
        )
        assert post_res.status_code == 200
        data = post_res.json()
        assert data["comment"]["severity"] == "FLAG"
        assert "Repeatability margin too low" in data["comment"]["comment"]

        # Retrieve comments
        get_res = await review_client.get(
            "/api/v1/review/sessions/sess-review-test-01/comments"
        )
        assert get_res.status_code == 200
        comments_data = get_res.json()
        assert comments_data["total"] >= 1
        assert any(c["step_index"] == 5 for c in comments_data["comments"])
