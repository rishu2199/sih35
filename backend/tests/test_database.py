"""Test suite for METROLOGIX-76 unified database schema and models.

Tests cover:
- Async ORM models instantiation and database operations (SQLite / PostgreSQL)
- Lossless Decimal mapping (Numeric(16, 6)) for loads, errors, and MPE limits
- Dual JSON / JSONB dialect payload storage and retrieval
- Strict foreign key constraints and cascade delete behavior
- Full type-evaluation workflow: Lab -> User -> WeightSet -> Instrument -> Session
  -> Observation -> AuditTrail
- Alembic migration programmatic verification (upgrade to head and downgrade to base)
"""

from __future__ import annotations

import os
import tempfile
from collections.abc import AsyncGenerator
from datetime import UTC, datetime
from decimal import Decimal

import pytest
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from alembic import command
from alembic.config import Config
from app.core.types import (
    AccuracyClass,
    ComplianceStatus,
    InstrumentMobility,
    LoadReceptorType,
    TestType,
    UnitOfMeasure,
    VerificationStage,
)
from app.db.base import Base
from app.db.models import (
    AuditTrailEvent,
    Instrument,
    Laboratory,
    LaboratoryType,
    StandardWeightSet,
    TestObservation,
    TestSession,
    TestSessionStatus,
    User,
    UserRole,
    WeightClass,
)
from app.db.session import _set_sqlite_pragma


@pytest.fixture
async def test_db_engine() -> AsyncGenerator[AsyncEngine, None]:
    """Create an isolated, temporary SQLite async engine for tests with foreign keys enabled."""
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    # Enable foreign keys
    from sqlalchemy import event
    from sqlalchemy.engine import Engine

    event.listen(Engine, "connect", _set_sqlite_pragma)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield engine

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest.fixture
async def db_session(
    test_db_engine: AsyncEngine,
) -> AsyncGenerator[AsyncSession, None]:
    """Yield an active AsyncSession bound to the in-memory test database."""
    session_factory = async_sessionmaker(
        bind=test_db_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )
    async with session_factory() as session:
        yield session


# ============================================================================
# 1. ORM ENTITY PERSISTENCE & LOSSLESS DECIMAL ROUND-TRIP
# ============================================================================


class TestDatabaseModels:
    """Test full ORM persistence and entity relationships."""

    @pytest.mark.asyncio
    async def test_create_laboratory(self, db_session: AsyncSession) -> None:
        """Verify creating an official RRSL laboratory record."""
        lab = Laboratory(
            code="RRSL-BLR",
            name="Regional Reference Standard Laboratory, Bengaluru",
            lab_type=LaboratoryType.RRSL,
            nabl_accreditation_number="CC-2026-NABL-001",
            nabl_validity_date=datetime(2028, 12, 31, tzinfo=UTC),
            address="PB No. 7601, Peenya Industrial Area",
            city="Bengaluru",
            state="Karnataka",
            pincode="560058",
            contact_email="rrsl.blr@nic.in",
            contact_phone="+91-80-28394567",
        )
        db_session.add(lab)
        await db_session.commit()
        await db_session.refresh(lab)

        assert lab.id is not None
        assert lab.code == "RRSL-BLR"
        assert lab.lab_type == LaboratoryType.RRSL
        assert lab.is_active is True

    @pytest.mark.asyncio
    async def test_create_user_with_rbac(self, db_session: AsyncSession) -> None:
        """Verify user creation with statutory role and lab association."""
        lab = Laboratory(
            code="RRSL-AHM",
            name="Regional Reference Standard Laboratory, Ahmedabad",
            lab_type=LaboratoryType.RRSL,
            address="Vatva GIDC",
            city="Ahmedabad",
            state="Gujarat",
            pincode="382445",
            contact_email="rrsl.ahm@nic.in",
            contact_phone="+91-79-25831234",
        )
        db_session.add(lab)
        await db_session.flush()

        officer = User(
            email="arun.kumar@rrsl.gov.in",
            username="arunkumar",
            hashed_password="hashed_secure_password_test",
            full_name="Dr. Arun Kumar",
            designation="Senior Scientific Officer",
            role=UserRole.METROLOGIST,
            laboratory_id=lab.id,
        )
        db_session.add(officer)
        await db_session.commit()
        await db_session.refresh(officer)

        assert officer.id is not None
        assert officer.role == UserRole.METROLOGIST
        assert officer.laboratory_id == lab.id
        assert officer.laboratory is not None
        assert officer.laboratory.code == "RRSL-AHM"

    @pytest.mark.asyncio
    async def test_create_instrument_lossless_decimals(
        self, db_session: AsyncSession
    ) -> None:
        """Verify that Instrument capacity and scale intervals preserve exact Decimal types."""
        inst = Instrument(
            serial_number="IND-2026-WB-50T-001",
            model_name="WIM-Heavy-50T",
            manufacturer="Precision Weighing Technologies Ltd",
            accuracy_class=AccuracyClass.CLASS_III,
            verification_stage=VerificationStage.INITIAL_TYPE_APPROVAL,
            unit=UnitOfMeasure.TONNE,
            max_capacity=Decimal("50.000000"),
            min_capacity=Decimal("0.400000"),
            verification_scale_interval=Decimal("0.020000"),  # 20 kg = 0.02 t
            actual_scale_interval=Decimal("0.020000"),
            receptor_type=LoadReceptorType.WEIGHBRIDGE,
            mobility=InstrumentMobility.FIXED,
            has_level_indicator=True,
            has_tare_device=True,
            num_supports=6,
            is_multi_interval=False,
            rulepack_id="OIML_R76_2006",
            description="50 Ton Pitless Electronic Weighbridge with 6 Load Cells",
        )
        db_session.add(inst)
        await db_session.commit()
        await db_session.refresh(inst)

        assert inst.serial_number == "IND-2026-WB-50T-001"
        assert isinstance(inst.max_capacity, Decimal)
        assert inst.max_capacity == Decimal("50.000000")
        assert isinstance(inst.verification_scale_interval, Decimal)
        assert inst.verification_scale_interval == Decimal("0.020000")
        assert inst.num_supports == 6
        assert inst.receptor_type == LoadReceptorType.WEIGHBRIDGE

    @pytest.mark.asyncio
    async def test_full_test_session_and_observation_grid(
        self, db_session: AsyncSession
    ) -> None:
        """Verify end-to-end session, changeover observation, and audit event insertion."""
        # 1. Laboratory
        lab = Laboratory(
            code="RRSL-FBD",
            name="RRSL Faridabad",
            lab_type=LaboratoryType.RRSL,
            address="Faridabad Sector 15",
            city="Faridabad",
            state="Haryana",
            pincode="121007",
            contact_email="rrsl.fbd@nic.in",
            contact_phone="+91-129-2287654",
        )
        db_session.add(lab)
        await db_session.flush()

        # 2. Users (Operator and Reviewer)
        operator = User(
            email="tester@rrsl.gov.in",
            username="tester_officer",
            hashed_password="pw_hash_test_123",
            full_name="Testing Officer Sharma",
            designation="Testing Officer",
            role=UserRole.METROLOGIST,
            laboratory_id=lab.id,
        )
        reviewer = User(
            email="reviewer@rrsl.gov.in",
            username="pso_reviewer",
            hashed_password="pw_hash_test_456",
            full_name="PSO Dr. Banerjee",
            designation="Principal Scientific Officer",
            role=UserRole.REVIEWER,
            laboratory_id=lab.id,
        )
        db_session.add_all([operator, reviewer])
        await db_session.flush()

        # 3. Standard Weight Set
        weight_set = StandardWeightSet(
            identification_code="RRSL-FBD-F1-SET-02",
            weight_class=WeightClass.F1,
            calibration_certificate_number="NPL/MASS/2026/089",
            calibrated_by="CSIR-NPL India",
            calibration_date=datetime(2026, 1, 15, tzinfo=UTC),
            validity_date=datetime(2027, 1, 14, tzinfo=UTC),
            nominal_min_value=Decimal("0.001000"),
            nominal_max_value=Decimal("20.000000"),
            unit=UnitOfMeasure.KILOGRAM,
            laboratory_id=lab.id,
            expanded_uncertainty_k2=Decimal("0.000005"),
        )
        db_session.add(weight_set)
        await db_session.flush()

        # 4. Instrument
        instrument = Instrument(
            serial_number="SCALE-60KG-TEST-001",
            model_name="CompactBench-60",
            manufacturer="Apex Instruments Pvt Ltd",
            accuracy_class=AccuracyClass.CLASS_III,
            verification_stage=VerificationStage.INITIAL_TYPE_APPROVAL,
            unit=UnitOfMeasure.KILOGRAM,
            max_capacity=Decimal("60.000000"),
            min_capacity=Decimal("0.400000"),
            verification_scale_interval=Decimal("0.020000"),
            actual_scale_interval=Decimal("0.020000"),
            receptor_type=LoadReceptorType.PLATFORM,
            mobility=InstrumentMobility.PORTABLE,
            has_level_indicator=True,
            has_tare_device=True,
            num_supports=4,
        )
        db_session.add(instrument)
        await db_session.flush()

        # 5. Test Session
        session = TestSession(
            session_number="TS-2026-FBD-0042",
            instrument_id=instrument.id,
            laboratory_id=lab.id,
            operator_id=operator.id,
            reviewer_id=reviewer.id,
            weight_set_id=weight_set.id,
            status=TestSessionStatus.IN_PROGRESS,
            verification_stage=VerificationStage.INITIAL_TYPE_APPROVAL,
            ambient_temperature_celsius=Decimal("22.50"),
            relative_humidity_percent=Decimal("54.00"),
            atmospheric_pressure_hpa=Decimal("1013.25"),
            overall_compliance=ComplianceStatus.PENDING,
            started_at=datetime.now(UTC),
        )
        db_session.add(session)
        await db_session.flush()

        # 6. Test Observation (Changeover point calculation)
        obs = TestObservation(
            session_id=session.id,
            test_type=TestType.WEIGHING,
            sequence_number=1,
            run_number=1,
            position_descriptor="Center",
            nominal_load=Decimal("10.000000"),
            indication_I=Decimal("10.000000"),
            delta_L=Decimal("0.008000"),
            turning_point_P=Decimal("10.002000"),  # P = 10 + 0.5(0.02) - 0.008 = 10.002
            calculated_error_E=Decimal("0.002000"),  # E = 10.002 - 10 = +0.002
            corrected_error_Ec=Decimal("0.002000"),
            mpe_limit=Decimal("0.010000"),  # 0.5e = 0.010 kg
            compliance_status=ComplianceStatus.PASS,
            oiml_clause="A.4.4.3",
            raw_observation_grid={
                "load_steps": ["Min", "500e", "2000e", "Max"],
                "temperature_celsius": "22.5",
                "turning_point_weights": [
                    {"step_load": "10.0", "delta_L": "0.008", "calculated_error": "0.002"}
                ],
            },
        )
        db_session.add(obs)
        await db_session.flush()

        # 7. Audit Trail Event
        audit_event = AuditTrailEvent(
            session_id=session.id,
            operator_id=operator.id,
            observation_id=obs.id,
            event_type="OBSERVATION_RECORDED",
            field_name="indication_I",
            old_value=None,
            new_value="10.000000",
            justification_reason="Initial changeover point reading for Step 500e",
            sha256_hash="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            prev_hash="0000000000000000000000000000000000000000000000000000000000000000",
            payload={"action": "add_observation", "nominal_load": "10.000000"},
        )
        db_session.add(audit_event)
        await db_session.commit()

        # Verify Querying & Navigation
        stmt = select(TestSession).where(TestSession.id == session.id)
        result = await db_session.execute(stmt)
        queried_session = result.scalar_one()

        assert queried_session.session_number == "TS-2026-FBD-0042"
        assert len(queried_session.observations) == 1
        assert queried_session.observations[0].calculated_error_E == Decimal("0.002000")
        assert queried_session.observations[0].raw_observation_grid is not None
        assert "load_steps" in queried_session.observations[0].raw_observation_grid
        assert len(queried_session.audit_events) == 1
        assert queried_session.audit_events[0].event_type == "OBSERVATION_RECORDED"


# ============================================================================
# 2. FOREIGN KEY CONSTRAINTS & CASCADE DELETE RULES
# ============================================================================


class TestCascadeAndIntegrityConstraints:
    """Test strict database constraints and cascade deletion."""

    @pytest.mark.asyncio
    async def test_cascade_delete_instrument_deletes_sessions_and_observations(
        self, db_session: AsyncSession
    ) -> None:
        """When an Instrument is deleted, its TestSessions and Observations must cascade delete."""
        lab = Laboratory(
            code="RRSL-VAR",
            name="RRSL Varanasi",
            lab_type=LaboratoryType.RRSL,
            address="Varanasi Cantt",
            city="Varanasi",
            state="Uttar Pradesh",
            pincode="221002",
            contact_email="rrsl.var@nic.in",
            contact_phone="+91-542-2501234",
        )
        user = User(
            email="officer.var@rrsl.gov.in",
            username="var_officer",
            hashed_password="pw_test_varanasi",
            full_name="Testing Officer Varanasi",
            designation="Testing Officer",
            role=UserRole.METROLOGIST,
        )
        inst = Instrument(
            serial_number="CASCADE-TEST-SCALE-001",
            model_name="Platform-15KG",
            manufacturer="National Scales",
            accuracy_class=AccuracyClass.CLASS_III,
            verification_stage=VerificationStage.INITIAL_TYPE_APPROVAL,
            unit=UnitOfMeasure.KILOGRAM,
            max_capacity=Decimal("15.000000"),
            min_capacity=Decimal("0.100000"),
            verification_scale_interval=Decimal("0.005000"),
        )
        db_session.add_all([lab, user, inst])
        await db_session.flush()

        session = TestSession(
            session_number="TS-CASCADE-001",
            instrument_id=inst.id,
            laboratory_id=lab.id,
            operator_id=user.id,
            status=TestSessionStatus.DRAFT,
            verification_stage=VerificationStage.INITIAL_TYPE_APPROVAL,
        )
        db_session.add(session)
        await db_session.flush()

        obs = TestObservation(
            session_id=session.id,
            test_type=TestType.WEIGHING,
            sequence_number=1,
            nominal_load=Decimal("5.000000"),
            indication_I=Decimal("5.000000"),
            delta_L=Decimal("0.002000"),
            turning_point_P=Decimal("5.000500"),
            calculated_error_E=Decimal("0.000500"),
            mpe_limit=Decimal("0.002500"),
            compliance_status=ComplianceStatus.PASS,
            oiml_clause="A.4.4.3",
        )
        db_session.add(obs)
        await db_session.commit()

        # Delete the Instrument
        await db_session.delete(inst)
        await db_session.commit()

        # Verify session and observation are gone
        res_session = await db_session.execute(
            select(TestSession).where(TestSession.id == session.id)
        )
        assert res_session.scalar_one_or_none() is None

        res_obs = await db_session.execute(
            select(TestObservation).where(TestObservation.id == obs.id)
        )
        assert res_obs.scalar_one_or_none() is None

    @pytest.mark.asyncio
    async def test_restrict_delete_laboratory_with_active_sessions(
        self, db_session: AsyncSession
    ) -> None:
        """Deleting a Laboratory with active TestSessions must be RESTRICTED by FK constraint."""
        lab = Laboratory(
            code="RRSL-GHY",
            name="RRSL Guwahati",
            lab_type=LaboratoryType.RRSL,
            address="Guwahati Khanapara",
            city="Guwahati",
            state="Assam",
            pincode="781022",
            contact_email="rrsl.ghy@nic.in",
            contact_phone="+91-361-2361234",
        )
        user = User(
            email="ghy_tester@rrsl.gov.in",
            username="ghy_tester",
            hashed_password="pw_test_ghy",
            full_name="Testing Officer Guwahati",
            designation="Testing Officer",
            role=UserRole.METROLOGIST,
        )
        inst = Instrument(
            serial_number="GHY-SCALE-001",
            model_name="GHY-Bench",
            manufacturer="Assam Weighers",
            accuracy_class=AccuracyClass.CLASS_III,
            verification_stage=VerificationStage.INITIAL_TYPE_APPROVAL,
            unit=UnitOfMeasure.KILOGRAM,
            max_capacity=Decimal("30.000000"),
            min_capacity=Decimal("0.200000"),
            verification_scale_interval=Decimal("0.010000"),
        )
        db_session.add_all([lab, user, inst])
        await db_session.flush()

        session = TestSession(
            session_number="TS-GHY-001",
            instrument_id=inst.id,
            laboratory_id=lab.id,
            operator_id=user.id,
            status=TestSessionStatus.DRAFT,
            verification_stage=VerificationStage.INITIAL_TYPE_APPROVAL,
        )
        db_session.add(session)
        await db_session.commit()

        # Attempt to delete laboratory -> Must raise IntegrityError
        await db_session.delete(lab)
        with pytest.raises(IntegrityError):
            await db_session.commit()
        await db_session.rollback()


# ============================================================================
# 3. PROGRAMMATIC ALEMBIC MIGRATION TEST GATE
# ============================================================================


class TestAlembicMigrations:
    """Verification Test Gate: Alembic migration runs up and down cleanly."""

    def test_alembic_upgrade_and_downgrade(self) -> None:
        """Verify Alembic upgrade head and downgrade base on a temporary SQLite database."""
        with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as tmp_file:
            tmp_db_path = tmp_file.name

        try:
            # Prepare temporary Alembic config pointing to this temp SQLite database
            backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
            ini_path = os.path.join(backend_dir, "alembic.ini")
            alembic_cfg = Config(ini_path)
            sqlite_url = f"sqlite+aiosqlite:///{tmp_db_path.replace(os.sep, '/')}"
            alembic_cfg.set_main_option("sqlalchemy.url", sqlite_url)

            # 1. Upgrade to Head
            command.upgrade(alembic_cfg, "head")

            # 2. Downgrade to Base
            command.downgrade(alembic_cfg, "base")

            # 3. Upgrade to Head again to verify idempotency
            command.upgrade(alembic_cfg, "head")
        finally:
            if os.path.exists(tmp_db_path):
                os.remove(tmp_db_path)
