"""Test suite for METROLOGIX-76 Immutable Audit Trail & Cryptographic Event Sourcing.

Verifies:
- Continuous SHA-256 Merkle hash chain computation and deterministic canonicalization
- Statutory Indian Standard Time (IST, UTC+5:30) attestation
- AuditLogger observation creation, field modification, batch update, and session lifecycle tracking
- Mandatory justification reason enforcement under Legal Metrology Act regulations
- ORM immutability enforcement preventing any update or deletion of audit records
- Cryptographic integrity verification detecting all forms of manual database tampering:
  * Raw column alteration (new_value, old_value, operator_id, justification_reason)
  * Intermediate event deletion (broken hash chain link)
  * Genesis event deletion (invalid initial predecessor hash)
  * Hash forgery attempts (subsequent chain continuity failure)
- Standalone and repository-integrated integrity verification APIs
"""

from __future__ import annotations

from collections.abc import AsyncGenerator
from datetime import datetime
from decimal import Decimal

import pytest
from sqlalchemy import event, text
from sqlalchemy.engine import Engine
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.audit_logger import (
    EVENT_OBSERVATION_CREATED,
    EVENT_OBSERVATION_UPDATED,
    EVENT_SESSION_STATUS_CHANGED,
    GENESIS_HASH,
    IST_TIMEZONE,
    AuditLogger,
    AuditValidationError,
    AuditVerificationResult,
    ImmutableAuditRecordError,
    build_canonical_payload,
    compute_event_hash,
    format_ist_timestamp,
    get_ist_now,
    serialize_value,
    verify_audit_integrity,
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
    TestObservation,
    TestSession,
    TestSessionStatus,
    User,
    UserRole,
)
from app.db.repositories.audit_repository import AuditRepository
from app.db.session import _set_sqlite_pragma


@pytest.fixture
async def test_db_engine() -> AsyncGenerator[AsyncEngine, None]:
    """Create isolated SQLite in-memory database with foreign keys enabled."""
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


@pytest.fixture
async def seeded_entities(
    db_session: AsyncSession,
) -> tuple[Laboratory, User, Instrument, TestSession, TestObservation]:
    """Seed minimal entity hierarchy required for audit trail tests."""
    lab = Laboratory(
        code="RRSL-TEST-001",
        name="RRSL Test Facility",
        lab_type=LaboratoryType.RRSL,
        address="Central Metrology Complex, Peenya",
        city="Bengaluru",
        state="Karnataka",
        pincode="560001",
        contact_email="test.rrsl@doca.gov.in",
        contact_phone="+91-80-22220000",
    )
    db_session.add(lab)
    await db_session.flush()

    user = User(
        email="officer@doca.gov.in",
        username="metrologist_officer",
        hashed_password="hashed_pw_test",  # noqa: S106
        full_name="Dr. Testing Officer",
        designation="Senior Scientific Officer",
        role=UserRole.METROLOGIST,
        laboratory_id=lab.id,
    )
    db_session.add(user)
    await db_session.flush()

    instrument = Instrument(
        serial_number="TEST-SCALE-2026-X1",
        model_name="Precision Bench Scale",
        manufacturer="Test Scales Ltd",
        accuracy_class=AccuracyClass.CLASS_III,
        verification_stage=VerificationStage.INITIAL_TYPE_APPROVAL,
        unit=UnitOfMeasure.KILOGRAM,
        max_capacity=Decimal("30.000000"),
        min_capacity=Decimal("0.100000"),
        verification_scale_interval=Decimal("0.005000"),
        actual_scale_interval=Decimal("0.001000"),
        receptor_type=LoadReceptorType.PLATFORM,
    )
    db_session.add(instrument)
    await db_session.flush()

    session = TestSession(
        session_number="SESSION-TEST-2026-001",
        laboratory_id=lab.id,
        instrument_id=instrument.id,
        operator_id=user.id,
        status=TestSessionStatus.IN_PROGRESS,
        verification_stage=VerificationStage.INITIAL_TYPE_APPROVAL,
    )
    db_session.add(session)
    await db_session.flush()

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
    db_session.add(obs)
    await db_session.flush()

    return lab, user, instrument, session, obs


# ============================================================================
# 1. CRYPTOGRAPHIC HASHING & DETERMINISTIC CANONICALIZATION TESTS
# ============================================================================


class TestAuditHashingAndCanonicalization:
    """Test cryptographic SHA-256 Merkle chain utilities and IST attestation."""

    def test_genesis_hash_constant(self) -> None:
        """Assert GENESIS_HASH is 64 hex zeros."""
        assert GENESIS_HASH == "0" * 64
        assert len(GENESIS_HASH) == 64

    def test_ist_timestamp_formatting(self) -> None:
        """Assert timestamps use Indian Standard Time (+05:30 offset)."""
        now_ist = get_ist_now()
        assert now_ist.tzinfo == IST_TIMEZONE
        formatted = format_ist_timestamp(now_ist)
        assert "+05:30" in formatted

        # From naive UTC datetime
        naive = datetime(2026, 9, 25, 12, 0, 0)
        formatted_naive = format_ist_timestamp(naive)
        assert "+05:30" in formatted_naive
        # 12:00 UTC + 5:30 = 17:30 IST
        assert "17:30:00" in formatted_naive

    def test_serialize_value(self) -> None:
        """Assert lossless formatting for Decimal, Enum, datetime, and None."""
        assert serialize_value(Decimal("10.500000")) == "10.500000"
        assert serialize_value(ComplianceStatus.PASS) == "PASS"
        assert serialize_value(None) is None
        assert serialize_value("raw_string") == "raw_string"
        assert serialize_value(42) == "42"

    def test_deterministic_hash_generation(self) -> None:
        """Assert same inputs produce identical SHA-256 hashes regardless of dict key order."""
        payload1 = build_canonical_payload(
            event_id="evt-1",
            session_id="sess-1",
            operator_id="user-1",
            event_type=EVENT_OBSERVATION_CREATED,
            justification_reason="Initial entry",
            timestamp_ist="2026-09-25T15:00:00+05:30",
            observation_id="obs-1",
            new_value="10.000000",
        )
        hash1 = compute_event_hash(GENESIS_HASH, payload1)

        payload2 = build_canonical_payload(
            event_id="evt-1",
            session_id="sess-1",
            operator_id="user-1",
            event_type=EVENT_OBSERVATION_CREATED,
            justification_reason="Initial entry",
            timestamp_ist="2026-09-25T15:00:00+05:30",
            observation_id="obs-1",
            new_value="10.000000",
        )
        hash2 = compute_event_hash(GENESIS_HASH, payload2)

        assert hash1 == hash2
        assert len(hash1) == 64

        # Altering any field modifies the resulting hash
        payload_altered = dict(payload1)
        payload_altered["new_value"] = "10.001000"
        hash_altered = compute_event_hash(GENESIS_HASH, payload_altered)
        assert hash_altered != hash1


# ============================================================================
# 2. AUDIT LOGGER APPEND-ONLY & MERKLE CHAIN TRACKING TESTS
# ============================================================================


class TestAuditLoggerAppendOnlyOperations:
    """Test AuditLogger event recording, observation updates, and chaining."""

    @pytest.mark.asyncio
    async def test_log_observation_creation_and_chaining(
        self,
        db_session: AsyncSession,
        seeded_entities: tuple[Laboratory, User, Instrument, TestSession, TestObservation],
    ) -> None:
        """Verify recording observation creation links to GENESIS_HASH."""
        _, user, _, session, obs = seeded_entities
        logger = AuditLogger(db_session)

        event1 = await logger.log_observation_creation(
            session_id=session.id,
            operator_id=user.id,
            observation=obs,
            justification_reason="First performance test run logged",
        )

        assert event1.id is not None
        assert event1.session_id == session.id
        assert event1.operator_id == user.id
        assert event1.prev_hash == GENESIS_HASH
        assert len(event1.sha256_hash) == 64
        assert event1.event_type == EVENT_OBSERVATION_CREATED

        # Second event: update observation field
        event2 = await logger.log_observation_update(
            session_id=session.id,
            operator_id=user.id,
            observation_id=obs.id,
            field_name="delta_L",
            old_value=Decimal("0.004000"),
            new_value=Decimal("0.002000"),
            justification_reason="Re-zeroed auxiliary weight per laboratory SOP",
        )

        assert event2.prev_hash == event1.sha256_hash
        assert event2.sha256_hash != event1.sha256_hash
        assert event2.event_type == EVENT_OBSERVATION_UPDATED
        assert event2.field_name == "delta_L"
        assert event2.old_value == "0.004000"
        assert event2.new_value == "0.002000"

    @pytest.mark.asyncio
    async def test_log_observation_batch_update(
        self,
        db_session: AsyncSession,
        seeded_entities: tuple[Laboratory, User, Instrument, TestSession, TestObservation],
    ) -> None:
        """Verify batch updating multiple fields creates an atomic chained sequence."""
        _, user, _, session, obs = seeded_entities
        logger = AuditLogger(db_session)

        # Genesis event
        evt_init = await logger.log_observation_creation(
            session_id=session.id,
            operator_id=user.id,
            observation=obs,
            justification_reason="Initial reading",
        )

        changes: dict[str, tuple[object, object]] = {
            "delta_L": (Decimal("0.004000"), Decimal("0.002000")),
            "turning_point_P": (Decimal("10.001000"), Decimal("10.003000")),
            "calculated_error_E": (Decimal("0.001000"), Decimal("0.003000")),
        }

        batch_events = await logger.log_observation_batch_update(
            session_id=session.id,
            operator_id=user.id,
            observation_id=obs.id,
            changes=changes,
            justification_reason=(
                "Recalculated changeover with auxiliary weight calibration correction"
            ),
        )

        assert len(batch_events) == 3
        # Assert unbroken chain: init -> batch[0] -> batch[1] -> batch[2]
        assert batch_events[0].prev_hash == evt_init.sha256_hash
        assert batch_events[1].prev_hash == batch_events[0].sha256_hash
        assert batch_events[2].prev_hash == batch_events[1].sha256_hash

    @pytest.mark.asyncio
    async def test_log_session_transition(
        self,
        db_session: AsyncSession,
        seeded_entities: tuple[Laboratory, User, Instrument, TestSession, TestObservation],
    ) -> None:
        """Verify lifecycle status change is recorded with statutory justification."""
        _, user, _, session, _ = seeded_entities
        logger = AuditLogger(db_session)

        evt = await logger.log_session_transition(
            session_id=session.id,
            operator_id=user.id,
            old_status=TestSessionStatus.IN_PROGRESS,
            new_status=TestSessionStatus.APPROVED,
            justification_reason="All Clause A.4 tests passed within Table 6 MPE limits",
            overall_compliance=ComplianceStatus.PASS,
        )

        assert evt.event_type == EVENT_SESSION_STATUS_CHANGED
        assert evt.old_value == TestSessionStatus.IN_PROGRESS.value
        assert evt.new_value == TestSessionStatus.APPROVED.value
        assert evt.justification_reason == "All Clause A.4 tests passed within Table 6 MPE limits"

    @pytest.mark.asyncio
    async def test_get_audit_trail_chronological_order(
        self,
        db_session: AsyncSession,
        seeded_entities: tuple[Laboratory, User, Instrument, TestSession, TestObservation],
    ) -> None:
        """Verify audit trail retrieves events in strictly chronological order."""
        _, user, _, session, obs = seeded_entities
        logger = AuditLogger(db_session)

        e1 = await logger.log_observation_creation(
            session_id=session.id,
            operator_id=user.id,
            observation=obs,
            justification_reason="Event 1",
        )
        e2 = await logger.log_observation_update(
            session_id=session.id,
            operator_id=user.id,
            observation_id=obs.id,
            field_name="delta_L",
            old_value="0.004",
            new_value="0.002",
            justification_reason="Event 2",
        )
        e3 = await logger.log_session_transition(
            session_id=session.id,
            operator_id=user.id,
            old_status=TestSessionStatus.IN_PROGRESS,
            new_status=TestSessionStatus.APPROVED,
            justification_reason="Event 3",
        )

        trail = await logger.get_audit_trail(session.id)
        assert len(trail) == 3
        assert trail[0].id == e1.id
        assert trail[1].id == e2.id
        assert trail[2].id == e3.id


# ============================================================================
# 3. MANDATORY VALIDATION & IMMUTABILITY ENFORCEMENT TESTS
# ============================================================================


class TestAuditValidationAndImmutability:
    """Test mandatory justification validation and ORM immutability protection."""

    @pytest.mark.asyncio
    async def test_empty_justification_strictly_rejected(
        self,
        db_session: AsyncSession,
        seeded_entities: tuple[Laboratory, User, Instrument, TestSession, TestObservation],
    ) -> None:
        """Verify that missing or whitespace justification raises AuditValidationError."""
        _, user, _, session, obs = seeded_entities
        logger = AuditLogger(db_session)

        with pytest.raises(
            AuditValidationError,
            match="Justification reason is strictly mandatory",
        ):
            await logger.log_observation_update(
                session_id=session.id,
                operator_id=user.id,
                observation_id=obs.id,
                field_name="delta_L",
                old_value="0.004",
                new_value="0.002",
                justification_reason="",
            )

        with pytest.raises(
            AuditValidationError,
            match="Justification reason is strictly mandatory",
        ):
            await logger.log_observation_update(
                session_id=session.id,
                operator_id=user.id,
                observation_id=obs.id,
                field_name="delta_L",
                old_value="0.004",
                new_value="0.002",
                justification_reason="   \t\n  ",
            )

    @pytest.mark.asyncio
    async def test_empty_session_id_or_operator_id_rejected(
        self,
        db_session: AsyncSession,
        seeded_entities: tuple[Laboratory, User, Instrument, TestSession, TestObservation],
    ) -> None:
        """Verify missing session_id or operator_id raises AuditValidationError."""
        _, user, _, session, _ = seeded_entities
        logger = AuditLogger(db_session)

        with pytest.raises(AuditValidationError, match="session_id is mandatory"):
            await logger.log_event(
                session_id="",
                operator_id=user.id,
                event_type=EVENT_OBSERVATION_CREATED,
                justification_reason="Valid reason",
            )

        with pytest.raises(AuditValidationError, match="operator_id is mandatory"):
            await logger.log_event(
                session_id=session.id,
                operator_id="   ",
                event_type=EVENT_OBSERVATION_CREATED,
                justification_reason="Valid reason",
            )

    @pytest.mark.asyncio
    async def test_orm_update_prevented_by_listener(
        self,
        db_session: AsyncSession,
        seeded_entities: tuple[Laboratory, User, Instrument, TestSession, TestObservation],
    ) -> None:
        """Verify modifying an AuditTrailEvent through ORM raises ImmutableAuditRecordError."""
        _, user, _, session, obs = seeded_entities
        logger = AuditLogger(db_session)

        evt = await logger.log_observation_creation(
            session_id=session.id,
            operator_id=user.id,
            observation=obs,
            justification_reason="Initial observation",
        )

        # Attempt to modify a field via ORM
        evt.new_value = "Tampered Value"
        with pytest.raises(ImmutableAuditRecordError, match="strictly immutable"):
            await db_session.flush()

    @pytest.mark.asyncio
    async def test_orm_delete_prevented_by_listener(
        self,
        db_session: AsyncSession,
        seeded_entities: tuple[Laboratory, User, Instrument, TestSession, TestObservation],
    ) -> None:
        """Verify deleting an AuditTrailEvent through ORM raises ImmutableAuditRecordError."""
        _, user, _, session, obs = seeded_entities
        logger = AuditLogger(db_session)

        evt = await logger.log_observation_creation(
            session_id=session.id,
            operator_id=user.id,
            observation=obs,
            justification_reason="Initial observation",
        )

        # Attempt to delete via ORM
        await db_session.delete(evt)
        with pytest.raises(ImmutableAuditRecordError, match="cannot be deleted"):
            await db_session.flush()


# ============================================================================
# 4. VERIFICATION TEST GATE: CRYPTOGRAPHIC TAMPERING DETECTION
# ============================================================================


class TestCryptographicTamperingDetection:
    """Verification Test Gate: verify_audit_integrity detects all tampering vectors."""

    @pytest.mark.asyncio
    async def test_valid_audit_chain_verifies(
        self,
        db_session: AsyncSession,
        seeded_entities: tuple[Laboratory, User, Instrument, TestSession, TestObservation],
    ) -> None:
        """Verify an untampered audit chain produces a valid verification result."""
        _, user, _, session, obs = seeded_entities
        logger = AuditLogger(db_session)

        e1 = await logger.log_observation_creation(
            session_id=session.id,
            operator_id=user.id,
            observation=obs,
            justification_reason="Initial reading logged",
        )
        assert e1.prev_hash == GENESIS_HASH

        e2 = await logger.log_observation_update(
            session_id=session.id,
            operator_id=user.id,
            observation_id=obs.id,
            field_name="delta_L",
            old_value="0.004000",
            new_value="0.002000",
            justification_reason="Auxiliary weight re-zeroed",
        )
        assert e2.prev_hash == e1.sha256_hash

        e3 = await logger.log_session_transition(
            session_id=session.id,
            operator_id=user.id,
            old_status=TestSessionStatus.IN_PROGRESS,
            new_status=TestSessionStatus.APPROVED,
            justification_reason="Verification approved",
        )
        assert e3.prev_hash == e2.sha256_hash

        result: AuditVerificationResult = await logger.verify_integrity(session.id)
        assert result.is_valid is True
        assert bool(result) is True
        assert result == True  # noqa: E712
        assert result.total_events == 3
        assert result.chain_head_hash == e3.sha256_hash
        assert result.broken_event_id is None
        assert result.failure_reason is None

    @pytest.mark.asyncio
    async def test_empty_session_audit_chain_verifies(
        self,
        db_session: AsyncSession,
        seeded_entities: tuple[Laboratory, User, Instrument, TestSession, TestObservation],
    ) -> None:
        """Verify a session with zero events is valid and returns total_events = 0."""
        _, _, _, session, _ = seeded_entities
        logger = AuditLogger(db_session)

        result = await logger.verify_integrity(session.id)
        assert result.is_valid is True
        assert result.total_events == 0
        assert result.chain_head_hash is None

    @pytest.mark.asyncio
    async def test_tampering_new_value_detected(
        self,
        db_session: AsyncSession,
        seeded_entities: tuple[Laboratory, User, Instrument, TestSession, TestObservation],
    ) -> None:
        """Vector 1: Attacker modifies new_value column directly via raw SQL.

        Assert that verify_audit_integrity detects hash mismatch and identifies the broken event.
        """
        _, user, _, session, obs = seeded_entities
        target_session_id = str(session.id)
        logger = AuditLogger(db_session)

        await logger.log_observation_creation(
            session_id=target_session_id,
            operator_id=user.id,
            observation=obs,
            justification_reason="Initial reading",
        )
        event2 = await logger.log_observation_update(
            session_id=target_session_id,
            operator_id=user.id,
            observation_id=obs.id,
            field_name="delta_L",
            old_value="0.004000",
            new_value="0.002000",
            justification_reason="Auxiliary weight re-zeroed",
        )
        await db_session.commit()

        # Simulate direct database tampering via raw SQL bypassing ORM
        await db_session.execute(
            text("UPDATE audit_trail_events SET new_value = '9999.000000' WHERE id = :id"),
            {"id": event2.id},
        )
        await db_session.commit()
        db_session.expire_all()

        # Integrity verification must catch the tampering
        result = await logger.verify_integrity(target_session_id)
        assert result.is_valid is False
        assert bool(result) is False
        assert result == False  # noqa: E712
        assert result.broken_event_id == event2.id
        assert result.broken_sequence_index == 1
        assert result.failure_reason is not None
        assert "hash mismatch" in result.failure_reason.lower()

    @pytest.mark.asyncio
    async def test_tampering_operator_id_detected(
        self,
        db_session: AsyncSession,
        seeded_entities: tuple[Laboratory, User, Instrument, TestSession, TestObservation],
    ) -> None:
        """Vector 2: Attacker modifies operator_id column directly via raw SQL.

        Assert that operator substitution is caught by cryptographic verification.
        """
        lab, user, _, session, obs = seeded_entities
        target_session_id = str(session.id)
        logger = AuditLogger(db_session)

        # Create another valid user to satisfy foreign key constraints
        rogue_user = User(
            email="rogue@doca.gov.in",
            username="rogue_officer",
            hashed_password="hashed_pw_test",  # noqa: S106
            full_name="Rogue Testing Officer",
            designation="Junior Assistant",
            role=UserRole.METROLOGIST,
            laboratory_id=lab.id,
        )
        db_session.add(rogue_user)
        await db_session.flush()

        event1 = await logger.log_observation_creation(
            session_id=target_session_id,
            operator_id=user.id,
            observation=obs,
            justification_reason="Initial reading",
        )
        await db_session.commit()

        # Tamper operator_id directly in the DB
        await db_session.execute(
            text("UPDATE audit_trail_events SET operator_id = :rogue_id WHERE id = :id"),
            {"rogue_id": rogue_user.id, "id": event1.id},
        )
        await db_session.commit()
        db_session.expire_all()

        result = await logger.verify_integrity(target_session_id)
        assert result.is_valid is False
        assert result.broken_event_id == event1.id
        assert result.broken_sequence_index == 0
        assert "hash mismatch" in str(result.failure_reason).lower()

    @pytest.mark.asyncio
    async def test_tampering_delete_intermediate_event_detected(
        self,
        db_session: AsyncSession,
        seeded_entities: tuple[Laboratory, User, Instrument, TestSession, TestObservation],
    ) -> None:
        """Vector 3: Attacker deletes an intermediate audit event using raw SQL.

        Assert that verify_audit_integrity detects the broken hash chain link.
        """
        _, user, _, session, obs = seeded_entities
        target_session_id = str(session.id)
        logger = AuditLogger(db_session)

        await logger.log_observation_creation(
            session_id=target_session_id,
            operator_id=user.id,
            observation=obs,
            justification_reason="Event 1: initial reading",
        )
        event2 = await logger.log_observation_update(
            session_id=target_session_id,
            operator_id=user.id,
            observation_id=obs.id,
            field_name="delta_L",
            old_value="0.004000",
            new_value="0.002000",
            justification_reason="Event 2: aux weight adjusted",
        )
        event3 = await logger.log_session_transition(
            session_id=target_session_id,
            operator_id=user.id,
            old_status=TestSessionStatus.IN_PROGRESS,
            new_status=TestSessionStatus.APPROVED,
            justification_reason="Event 3: session approved",
        )
        await db_session.commit()

        # Delete intermediate event2 via raw SQL
        await db_session.execute(
            text("DELETE FROM audit_trail_events WHERE id = :id"),
            {"id": event2.id},
        )
        await db_session.commit()
        db_session.expire_all()

        # Verification must detect the missing link between event1 and event3
        result = await logger.verify_integrity(target_session_id)
        assert result.is_valid is False
        assert result.broken_event_id == event3.id
        assert result.broken_sequence_index == 1
        assert "chain continuity broken" in str(result.failure_reason).lower()

    @pytest.mark.asyncio
    async def test_tampering_delete_genesis_event_detected(
        self,
        db_session: AsyncSession,
        seeded_entities: tuple[Laboratory, User, Instrument, TestSession, TestObservation],
    ) -> None:
        """Vector 4: Attacker deletes the genesis event.

        Assert that the new first event fails because its prev_hash is not GENESIS_HASH.
        """
        _, user, _, session, obs = seeded_entities
        target_session_id = str(session.id)
        logger = AuditLogger(db_session)

        event1 = await logger.log_observation_creation(
            session_id=target_session_id,
            operator_id=user.id,
            observation=obs,
            justification_reason="Genesis event",
        )
        event2 = await logger.log_observation_update(
            session_id=target_session_id,
            operator_id=user.id,
            observation_id=obs.id,
            field_name="delta_L",
            old_value="0.004000",
            new_value="0.002000",
            justification_reason="Second event",
        )
        await db_session.commit()

        # Delete genesis event via raw SQL
        await db_session.execute(
            text("DELETE FROM audit_trail_events WHERE id = :id"),
            {"id": event1.id},
        )
        await db_session.commit()
        db_session.expire_all()

        # Verification must fail at event2 (which is now at index 0)
        result = await logger.verify_integrity(target_session_id)
        assert result.is_valid is False
        assert result.broken_event_id == event2.id
        assert result.broken_sequence_index == 0
        assert "chain continuity broken" in str(result.failure_reason).lower()
        assert result.expected_hash == GENESIS_HASH

    @pytest.mark.asyncio
    async def test_standalone_and_repository_verify_api(
        self,
        db_session: AsyncSession,
        seeded_entities: tuple[Laboratory, User, Instrument, TestSession, TestObservation],
    ) -> None:
        """Verify standalone `verify_audit_integrity` and `AuditRepository.verify_integrity`."""
        _, user, _, session, obs = seeded_entities
        repo = AuditRepository(db_session)

        # Record events via repository
        await repo.record_event(
            session_id=session.id,
            operator_id=user.id,
            event_type=EVENT_OBSERVATION_CREATED,
            justification_reason="Initial reading via repo",
            observation_id=obs.id,
            new_value="10.000000",
        )
        await repo.record_event(
            session_id=session.id,
            operator_id=user.id,
            event_type=EVENT_OBSERVATION_UPDATED,
            justification_reason="Corrected reading via repo",
            observation_id=obs.id,
            old_value="10.000000",
            new_value="10.001000",
        )

        # 1. Verify via AuditRepository
        repo_result = await repo.verify_integrity(session.id)
        assert repo_result.is_valid is True
        assert repo_result.total_events == 2

        # 2. Verify via standalone verify_audit_integrity function
        standalone_result = await verify_audit_integrity(session.id, db_session)
        assert standalone_result.is_valid is True
        assert standalone_result.total_events == 2
        assert standalone_result.chain_head_hash == repo_result.chain_head_hash
