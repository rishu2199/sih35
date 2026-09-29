"""Test suite for METROLOGIX-76 Repository Pattern layer and database seeder.

Verifies:
- LaboratoryRepository CRUD and filtering (RRSL, GATC)
- UserRepository RBAC queries and unique lookups
- EquipmentRepository OIML R 111 weight sets and validity dates
- InstrumentRepository search, serial number retrieval, and class filtering
- TestSessionRepository session lifecycle, observation logging, and status transitions
- AuditRepository append-only cryptographic Merkle hash chain
- Database seeder execution, 6 RRSLs, GATCs, users, instruments, and 100% idempotence
"""

from __future__ import annotations

from collections.abc import AsyncGenerator
from datetime import UTC, datetime
from decimal import Decimal

import pytest
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
    LoadReceptorType,
    TestType,
    UnitOfMeasure,
    VerificationStage,
)
from app.db.base import Base
from app.db.models import (
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
from app.db.repositories import (
    GENESIS_HASH,
    AuditRepository,
    EquipmentRepository,
    InstrumentRepository,
    LaboratoryRepository,
    TestSessionRepository,
    UserRepository,
)
from app.db.seed import seed_database
from app.db.session import _set_sqlite_pragma


@pytest.fixture
async def test_db_engine() -> AsyncGenerator[AsyncEngine, None]:
    """Create isolated SQLite memory database with foreign keys enabled."""
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
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
    """Yield isolated active AsyncSession."""
    session_factory = async_sessionmaker(
        bind=test_db_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )
    async with session_factory() as session:
        yield session


# ============================================================================
# 1. INDIVIDUAL REPOSITORY CRUD & QUERY TESTS
# ============================================================================


class TestLaboratoryRepository:
    """Test LaboratoryRepository data access operations."""

    @pytest.mark.asyncio
    async def test_laboratory_crud_and_lookups(self, db_session: AsyncSession) -> None:
        repo = LaboratoryRepository(db_session)

        # Create
        lab = Laboratory(
            code="RRSL-TEST-01",
            name="Test RRSL Facility",
            lab_type=LaboratoryType.RRSL,
            nabl_accreditation_number="NABL-TEST-01",
            nabl_validity_date=datetime(2028, 1, 1, tzinfo=UTC),
            address="Test Industrial Area",
            city="Bengaluru",
            state="Karnataka",
            pincode="560001",
            contact_email="test.lab@rrsl.gov.in",
            contact_phone="+91-80-12345678",
        )
        created = await repo.create(lab)
        assert created.id is not None

        # Get by ID
        fetched = await repo.get(created.id)
        assert fetched is not None
        assert fetched.code == "RRSL-TEST-01"

        # Get by Code
        by_code = await repo.get_by_code("RRSL-TEST-01")
        assert by_code is not None
        assert by_code.id == created.id

        # List by Type
        rrsl_list = await repo.list_by_type(LaboratoryType.RRSL)
        assert len(rrsl_list) == 1
        assert rrsl_list[0].code == "RRSL-TEST-01"

        # List active
        active_list = await repo.list_active()
        assert len(active_list) == 1

        # Delete
        deleted = await repo.delete(created.id)
        assert deleted is True
        assert await repo.get(created.id) is None


class TestUserRepository:
    """Test UserRepository RBAC lookups and email queries."""

    @pytest.mark.asyncio
    async def test_user_crud_and_role_queries(self, db_session: AsyncSession) -> None:
        user_repo = UserRepository(db_session)

        user = User(
            email="inspector@doca.gov.in",
            username="doca_inspector",
            hashed_password="hashed_pw_test",  # noqa: S106
            full_name="Inspector Rajesh",
            designation="Legal Metrology Officer",
            role=UserRole.AUDITOR,
        )
        await user_repo.create(user)

        # By email
        by_email = await user_repo.get_by_email("inspector@doca.gov.in")
        assert by_email is not None
        assert by_email.username == "doca_inspector"

        # By username
        by_user = await user_repo.get_by_username("doca_inspector")
        assert by_user is not None
        assert by_user.role == UserRole.AUDITOR

        # List by role
        auditors = await user_repo.list_by_role(UserRole.AUDITOR)
        assert len(auditors) == 1
        assert auditors[0].username == "doca_inspector"


class TestEquipmentRepository:
    """Test EquipmentRepository standard weight set queries."""

    @pytest.mark.asyncio
    async def test_equipment_validity_and_class_queries(
        self, db_session: AsyncSession
    ) -> None:
        lab_repo = LaboratoryRepository(db_session)
        equip_repo = EquipmentRepository(db_session)

        lab = Laboratory(
            code="RRSL-EQ-LAB",
            name="Equipment Lab",
            lab_type=LaboratoryType.RRSL,
            address="Addr",
            city="Delhi",
            state="Delhi",
            pincode="110001",
            contact_email="eq@rrsl.gov.in",
            contact_phone="1234",
        )
        await lab_repo.create(lab)

        # Add valid weight set
        ws_valid = StandardWeightSet(
            identification_code="WS-F1-VALID",
            weight_class=WeightClass.F1,
            calibration_certificate_number="CERT-F1-01",
            calibrated_by="NPL India",
            calibration_date=datetime(2026, 1, 1, tzinfo=UTC),
            validity_date=datetime(2027, 12, 31, tzinfo=UTC),
            nominal_min_value=Decimal("0.001000"),
            nominal_max_value=Decimal("20.000000"),
            laboratory_id=lab.id,
        )
        # Add expired weight set
        ws_expired = StandardWeightSet(
            identification_code="WS-M1-EXPIRED",
            weight_class=WeightClass.M1,
            calibration_certificate_number="CERT-M1-OLD",
            calibrated_by="RRSL",
            calibration_date=datetime(2024, 1, 1, tzinfo=UTC),
            validity_date=datetime(2025, 1, 1, tzinfo=UTC),
            nominal_min_value=Decimal("20.000000"),
            nominal_max_value=Decimal("500.000000"),
            laboratory_id=lab.id,
        )
        await equip_repo.create(ws_valid)
        await equip_repo.create(ws_expired)

        # Check valid weight sets
        valid_sets = await equip_repo.list_valid_by_lab(
            lab.id, as_of_date=datetime(2026, 6, 1, tzinfo=UTC)
        )
        assert len(valid_sets) == 1
        assert valid_sets[0].identification_code == "WS-F1-VALID"

        # Check by weight class
        f1_sets = await equip_repo.list_by_weight_class(WeightClass.F1)
        assert len(f1_sets) == 1


class TestInstrumentRepository:
    """Test InstrumentRepository search and classification filters."""

    @pytest.mark.asyncio
    async def test_instrument_search_and_class_filter(
        self, db_session: AsyncSession
    ) -> None:
        inst_repo = InstrumentRepository(db_session)

        inst1 = Instrument(
            serial_number="SCALE-CLASS-II-001",
            model_name="PrecisionLab-500",
            manufacturer="Precision Instruments India",
            accuracy_class=AccuracyClass.CLASS_II,
            verification_stage=VerificationStage.INITIAL_TYPE_APPROVAL,
            unit=UnitOfMeasure.GRAM,
            max_capacity=Decimal("500.000000"),
            min_capacity=Decimal("0.500000"),
            verification_scale_interval=Decimal("0.010000"),
        )
        inst2 = Instrument(
            serial_number="SCALE-CLASS-III-002",
            model_name="CommercialPlatform-100",
            manufacturer="Standard Scales Corp",
            accuracy_class=AccuracyClass.CLASS_III,
            verification_stage=VerificationStage.INITIAL_TYPE_APPROVAL,
            unit=UnitOfMeasure.KILOGRAM,
            max_capacity=Decimal("100.000000"),
            min_capacity=Decimal("0.400000"),
            verification_scale_interval=Decimal("0.020000"),
        )
        await inst_repo.create(inst1)
        await inst_repo.create(inst2)

        # By serial
        by_serial = await inst_repo.get_by_serial("SCALE-CLASS-II-001")
        assert by_serial is not None
        assert by_serial.model_name == "PrecisionLab-500"

        # By accuracy class
        class_ii = await inst_repo.list_by_accuracy_class(AccuracyClass.CLASS_II)
        assert len(class_ii) == 1
        assert class_ii[0].serial_number == "SCALE-CLASS-II-001"

        # Search by model substring
        search_res = await inst_repo.search("Commercial")
        assert len(search_res) == 1
        assert search_res[0].serial_number == "SCALE-CLASS-III-002"


class TestTestSessionAndAuditRepository:
    """Test TestSessionRepository and AuditRepository Merkle hash chaining."""

    @pytest.mark.asyncio
    async def test_session_lifecycle_and_audit_hash_chain(
        self, db_session: AsyncSession
    ) -> None:
        lab_repo = LaboratoryRepository(db_session)
        user_repo = UserRepository(db_session)
        inst_repo = InstrumentRepository(db_session)
        session_repo = TestSessionRepository(db_session)
        audit_repo = AuditRepository(db_session)

        # Prerequisites
        lab = await lab_repo.create(
            Laboratory(
                code="RRSL-SESS",
                name="Session Lab",
                lab_type=LaboratoryType.RRSL,
                address="Addr",
                city="Faridabad",
                state="Haryana",
                pincode="121001",
                contact_email="fbd@rrsl.gov.in",
                contact_phone="111",
            )
        )
        user = await user_repo.create(
            User(
                email="tester.sess@rrsl.gov.in",
                username="tester_sess",
                hashed_password="pw",  # noqa: S106
                full_name="Tester S",
                designation="Officer",
                role=UserRole.METROLOGIST,
                laboratory_id=lab.id,
            )
        )
        inst = await inst_repo.create(
            Instrument(
                serial_number="INST-SESS-001",
                model_name="M1",
                manufacturer="Mfg",
                accuracy_class=AccuracyClass.CLASS_III,
                verification_stage=VerificationStage.INITIAL_TYPE_APPROVAL,
                unit=UnitOfMeasure.KILOGRAM,
                max_capacity=Decimal("30.000000"),
                min_capacity=Decimal("0.200000"),
                verification_scale_interval=Decimal("0.010000"),
            )
        )

        # Create session
        session = await session_repo.create(
            TestSession(
                session_number="TS-2026-TEST-0001",
                instrument_id=inst.id,
                laboratory_id=lab.id,
                operator_id=user.id,
                status=TestSessionStatus.DRAFT,
                verification_stage=VerificationStage.INITIAL_TYPE_APPROVAL,
            )
        )
        assert session.id is not None

        # Add observation
        obs = TestObservation(
            session_id=session.id,
            test_type=TestType.WEIGHING_PERFORMANCE,
            sequence_number=1,
            nominal_load=Decimal("10.000000"),
            indication_I=Decimal("10.000000"),
            delta_L=Decimal("0.004000"),
            turning_point_P=Decimal("10.001000"),
            calculated_error_E=Decimal("0.001000"),
            mpe_limit=Decimal("0.005000"),
            compliance_status=ComplianceStatus.PASS,
            oiml_clause="A.4.4.3",
        )
        await session_repo.add_observation(obs)

        # Observations query
        observations = await session_repo.get_observations(session.id)
        assert len(observations) == 1
        assert observations[0].calculated_error_E == Decimal("0.001000")

        # Update status
        updated = await session_repo.update_status(
            session.id,
            status=TestSessionStatus.APPROVED,
            overall_compliance=ComplianceStatus.PASS,
        )
        assert updated is not None
        assert updated.status == TestSessionStatus.APPROVED
        assert updated.completed_at is not None

        # Test Audit Trail Merkle Hash Chain
        # Event 1: Genesis event
        event1 = await audit_repo.record_event(
            session_id=session.id,
            operator_id=user.id,
            event_type="OBSERVATION_CREATED",
            justification_reason="Initial reading entered",
            observation_id=obs.id,
            new_value="10.000000",
        )
        assert event1.prev_hash == GENESIS_HASH
        assert len(event1.sha256_hash) == 64

        # Event 2: Chained event
        event2 = await audit_repo.record_event(
            session_id=session.id,
            operator_id=user.id,
            event_type="OBSERVATION_CORRECTED",
            justification_reason="Re-zeroed tare and recorded verified reading",
            observation_id=obs.id,
            old_value="10.000000",
            new_value="10.000000",
        )
        assert event2.prev_hash == event1.sha256_hash
        assert event2.sha256_hash != event1.sha256_hash

        # Chronological session events
        events = await audit_repo.get_session_events(session.id)
        assert len(events) == 2
        assert events[0].id == event1.id
        assert events[1].id == event2.id


# ============================================================================
# 2. VERIFICATION TEST GATE: DATABASE SEEDER EXECUTION & IDEMPOTENCE
# ============================================================================


class TestDatabaseSeeder:
    """Verification Test Gate: Run seed script and assert data existence and idempotence."""

    @pytest.mark.asyncio
    async def test_database_seeder_populates_statutory_data(
        self, db_session: AsyncSession
    ) -> None:
        """Verify that seed_database creates the 6 RRSLs, GATCs, standard weights, and users."""
        stats = await seed_database(db_session)

        # Assert expected entity counts
        assert stats["laboratories"] == 8  # 6 RRSLs + 2 GATCs
        assert stats["users"] == 5  # 5 standard roles
        assert stats["weight_sets"] == 4  # E2, F1, F2, M1 sets
        assert stats["instruments"] == 4  # Retail, Platform, Weighbridge, Balance
        assert stats["test_sessions"] == 1  # 1 benchmark session

        # Verify via repositories that statutory data exists
        lab_repo = LaboratoryRepository(db_session)
        user_repo = UserRepository(db_session)
        equip_repo = EquipmentRepository(db_session)
        inst_repo = InstrumentRepository(db_session)
        session_repo = TestSessionRepository(db_session)

        # Check all 6 RRSLs
        rrsl_codes = [
            "RRSL-BLR",
            "RRSL-AHM",
            "RRSL-FBD",
            "RRSL-BBI",
            "RRSL-VNS",
            "RRSL-GHY",
        ]
        for code in rrsl_codes:
            lab = await lab_repo.get_by_code(code)
            assert lab is not None, f"Missing statutory laboratory: {code}"
            assert lab.lab_type == LaboratoryType.RRSL

        # Check GATCs
        gatc_dl = await lab_repo.get_by_code("GATC-DL-001")
        assert gatc_dl is not None
        assert gatc_dl.lab_type == LaboratoryType.GATC

        # Check Weight Sets (E2, F1, F2, M1)
        ws_e2 = await equip_repo.get_by_code("RRSL-BLR-E2-001")
        assert ws_e2 is not None
        assert ws_e2.weight_class == WeightClass.E2

        ws_f1 = await equip_repo.get_by_code("RRSL-BLR-F1-002")
        assert ws_f1 is not None
        assert ws_f1.weight_class == WeightClass.F1

        ws_m1 = await equip_repo.get_by_code("RRSL-BLR-M1-004")
        assert ws_m1 is not None
        assert ws_m1.weight_class == WeightClass.M1

        # Check Users
        officer = await user_repo.get_by_email("testing.officer@rrsl.gov.in")
        assert officer is not None
        assert officer.role == UserRole.METROLOGIST

        pso = await user_repo.get_by_email("pso.reviewer@rrsl.gov.in")
        assert pso is not None
        assert pso.role == UserRole.REVIEWER

        director = await user_repo.get_by_email("director@rrsl.gov.in")
        assert director is not None
        assert director.role == UserRole.DIRECTOR

        auditor = await user_repo.get_by_email("auditor.doca@gov.in")
        assert auditor is not None
        assert auditor.role == UserRole.AUDITOR

        # Check Instruments
        weighbridge = await inst_repo.get_by_serial("IND-WEIGHBRIDGE-50T-003")
        assert weighbridge is not None
        assert weighbridge.max_capacity == Decimal("50.000000")
        assert weighbridge.receptor_type == LoadReceptorType.WEIGHBRIDGE

        # Check Benchmark Session
        bench_session = await session_repo.get_by_session_number(
            "TS-2026-BLR-BENCH-001"
        )
        assert bench_session is not None
        assert bench_session.status == TestSessionStatus.APPROVED
        assert bench_session.overall_compliance == ComplianceStatus.PASS

        # Assert IDEMPOTENCE: Running seed_database a second time must produce 0 new records
        stats_second_run = await seed_database(db_session)
        assert stats_second_run["laboratories"] == 0
        assert stats_second_run["users"] == 0
        assert stats_second_run["weight_sets"] == 0
        assert stats_second_run["instruments"] == 0
        assert stats_second_run["test_sessions"] == 0
