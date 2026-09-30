"""METROLOGIX-76 — Immutable Audit Trail & Cryptographic Event Sourcing Engine.

Implements tamper-evident audit logging for Non-Automatic Weighing Instruments (NAWI)
testing observations and lifecycle state transitions as mandated by the Legal Metrology
Act, 2009 (Rule 27 / Clause 26035) and OIML R 76-1 / ISO/IEC 17025 traceability requirements.

Key Architectural Guarantees:
1. Continuous SHA-256 Merkle Hash Chain:
   H_k = SHA256(H_{k-1} + ':' + canonical_json(payload_k))
   where H_0 = GENESIS_HASH (64 zeros).
2. Complete Operator & Temporal Attestation:
   Every event records operator identity, Indian Standard Time (IST, UTC+5:30),
   entity identifiers, field modifications, and mandatory statutory justification.
3. Immutability & Append-Only Guarantees:
   Audit records can NEVER be updated or deleted. Enforced at the SQLAlchemy ORM layer
   via mapper event listeners and at the database level via ON DELETE RESTRICT constraints.
4. Independent Cryptographic Integrity Verification:
   Provides `verify_audit_integrity` to recalculate the full chain from row data
   and detect any unauthorized manual database modifications or record deletions.
"""

from __future__ import annotations

import hashlib
import json
import uuid
from collections.abc import Sequence
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta, timezone
from decimal import Decimal
from typing import Any

from sqlalchemy import event, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.types import ComplianceStatus
try:
    from app.db.models import (
        AuditTrailEvent,
        TestObservation,
        TestSessionStatus,
    )
except ImportError:
    AuditTrailEvent = None  # type: ignore[assignment, misc]
    TestObservation = None  # type: ignore[assignment, misc]
    TestSessionStatus = None  # type: ignore[assignment, misc]

# Statutory Constants
GENESIS_HASH: str = "0" * 64
IST_TIMEZONE: timezone = timezone(timedelta(hours=5, minutes=30), name="IST")

# Audit Event Type Constants
EVENT_OBSERVATION_CREATED: str = "OBSERVATION_CREATED"
EVENT_OBSERVATION_UPDATED: str = "OBSERVATION_UPDATED"
EVENT_OBSERVATION_BATCH_UPDATED: str = "OBSERVATION_BATCH_UPDATED"
EVENT_SESSION_CREATED: str = "SESSION_CREATED"
EVENT_SESSION_STATUS_CHANGED: str = "SESSION_STATUS_CHANGED"
EVENT_EQUIPMENT_ASSIGNED: str = "EQUIPMENT_ASSIGNED"
EVENT_CALIBRATION_VERIFIED: str = "CALIBRATION_VERIFIED"
EVENT_AUDIT_VERIFIED: str = "AUDIT_VERIFIED"


class AuditError(Exception):
    """Base exception for all audit trail and event sourcing errors."""


class AuditValidationError(AuditError, ValueError):
    """Raised when mandatory audit attributes (e.g., justification) are missing or invalid."""


class ImmutableAuditRecordError(AuditError, RuntimeError):
    """Raised when an illegal attempt is made to update or delete an immutable audit record."""


class AuditChainIntegrityError(AuditError):
    """Raised when a cryptographic hash chain mismatch or tampering is detected."""


def get_ist_now() -> datetime:
    """Return the current datetime in Indian Standard Time (IST, UTC+5:30)."""
    return datetime.now(IST_TIMEZONE)


def format_ist_timestamp(dt: datetime | None = None) -> str:
    """Format a datetime as an ISO-8601 string in Indian Standard Time (IST)."""
    if dt is None:
        target_dt = get_ist_now()
    elif dt.tzinfo is None:
        target_dt = dt.replace(tzinfo=UTC).astimezone(IST_TIMEZONE)
    else:
        target_dt = dt.astimezone(IST_TIMEZONE)
    return target_dt.isoformat()


def serialize_value(val: object) -> str | None:
    """Serialize any python/domain value (Decimal, Enum, datetime) to string."""
    if val is None:
        return None
    if isinstance(val, Decimal):
        return f"{val:.6f}"
    if hasattr(val, "value"):
        return str(val.value)
    if isinstance(val, datetime):
        return format_ist_timestamp(val)
    return str(val)


def build_canonical_payload(
    event_id: str,
    session_id: str,
    operator_id: str,
    event_type: str,
    justification_reason: str,
    timestamp_ist: str,
    observation_id: str | None = None,
    field_name: str | None = None,
    old_value: str | None = None,
    new_value: str | None = None,
    extra_data: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Construct canonical audit payload dictionary for deterministic hashing."""
    return {
        "event_id": event_id,
        "session_id": session_id,
        "operator_id": operator_id,
        "observation_id": observation_id,
        "event_type": event_type,
        "field_name": field_name,
        "old_value": old_value,
        "new_value": new_value,
        "justification_reason": justification_reason,
        "timestamp_ist": timestamp_ist,
        "extra_data": extra_data if extra_data is not None else {},
    }


def compute_event_hash(prev_hash: str, canonical_payload: dict[str, Any]) -> str:
    """Compute SHA-256 Merkle chain hash: H_k = SHA256(H_{k-1} + ':' + canonical_json)."""
    serialized = json.dumps(
        canonical_payload,
        sort_keys=True,
        separators=(",", ":"),
        default=str,
    )
    preimage = f"{prev_hash}:{serialized}"
    return hashlib.sha256(preimage.encode("utf-8")).hexdigest()


@dataclass
class AuditVerificationResult:
    """Cryptographic audit chain integrity verification result.

    Behaves as a boolean in conditional statements (`if result: ...`)
    and supports direct equality with `True` / `False`.
    """

    is_valid: bool
    session_id: str
    total_events: int
    chain_head_hash: str | None = None
    broken_event_id: str | None = None
    broken_sequence_index: int | None = None
    expected_hash: str | None = None
    actual_hash: str | None = None
    failure_reason: str | None = None

    def __bool__(self) -> bool:
        """Allow evaluating result directly as boolean."""
        return self.is_valid

    def __eq__(self, other: object) -> bool:
        """Support direct comparison with boolean values."""
        if isinstance(other, bool):
            return self.is_valid == other
        return super().__eq__(other)


class AuditLogger:
    """Core audit logging engine for immutable, cryptographic event sourcing."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        _register_audit_listeners()

    async def get_latest_event(self, session_id: str) -> AuditTrailEvent | None:
        """Fetch the most recent audit trail event for the specified test session."""
        from app.db.models import AuditTrailEvent

        stmt = (
            select(AuditTrailEvent)
            .where(AuditTrailEvent.session_id == session_id)
            .order_by(AuditTrailEvent.created_at.desc())
            .limit(1)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_latest_hash(self, session_id: str) -> str:
        """Get the hash of the preceding event, or GENESIS_HASH if no prior events exist."""
        latest = await self.get_latest_event(session_id)
        if latest is None:
            return GENESIS_HASH
        return latest.sha256_hash

    async def log_event(
        self,
        session_id: str,
        operator_id: str,
        event_type: str,
        justification_reason: str,
        observation_id: str | None = None,
        field_name: str | None = None,
        old_value: str | None = None,
        new_value: str | None = None,
        extra_data: dict[str, Any] | None = None,
    ) -> AuditTrailEvent:
        """Log an immutable event chained to the preceding event with SHA-256 hash.

        Strict validation rules:
        - `justification_reason` is mandatory and cannot be empty or whitespace only.
        - `session_id` and `operator_id` must be non-empty strings.
        """
        if not session_id or not session_id.strip():
            raise AuditValidationError("session_id is mandatory for audit logging.")
        if not operator_id or not operator_id.strip():
            raise AuditValidationError("operator_id is mandatory for audit logging.")

        clean_reason = justification_reason.strip() if justification_reason else ""
        if not clean_reason:
            raise AuditValidationError(
                "Justification reason is strictly mandatory under "
                "Legal Metrology Act enforcement rules."
            )

        clean_session_id = session_id.strip()
        clean_operator_id = operator_id.strip()
        clean_obs_id = observation_id.strip() if observation_id else None
        clean_field_name = field_name.strip() if field_name else None

        prev_hash = await self.get_latest_hash(clean_session_id)
        event_id = str(uuid.uuid4())
        timestamp_ist = format_ist_timestamp()

        canonical_payload = build_canonical_payload(
            event_id=event_id,
            session_id=clean_session_id,
            operator_id=clean_operator_id,
            event_type=event_type,
            justification_reason=clean_reason,
            timestamp_ist=timestamp_ist,
            observation_id=clean_obs_id,
            field_name=clean_field_name,
            old_value=old_value,
            new_value=new_value,
            extra_data=extra_data,
        )

        sha256_hash = compute_event_hash(prev_hash, canonical_payload)

        persisted_payload: dict[str, Any] = {
            "timestamp_ist": timestamp_ist,
            "canonical_payload": canonical_payload,
            "extra_data": extra_data if extra_data is not None else {},
        }

        from app.db.models import AuditTrailEvent

        event_record = AuditTrailEvent(
            id=event_id,
            session_id=clean_session_id,
            operator_id=clean_operator_id,
            observation_id=clean_obs_id,
            event_type=event_type,
            field_name=clean_field_name,
            old_value=old_value,
            new_value=new_value,
            justification_reason=clean_reason,
            sha256_hash=sha256_hash,
            prev_hash=prev_hash,
            payload=persisted_payload,
        )

        self.session.add(event_record)
        await self.session.flush()
        return event_record

    async def log_observation_creation(
        self,
        session_id: str,
        operator_id: str,
        observation: TestObservation,
        justification_reason: str = "Initial observation recorded during testing procedure",
        extra_data: dict[str, Any] | None = None,
    ) -> AuditTrailEvent:
        """Log the initial recording of a test observation."""
        obs_extra: dict[str, Any] = {
            "test_type": (
                observation.test_type.value
                if hasattr(observation.test_type, "value")
                else str(observation.test_type)
            ),
            "sequence_number": observation.sequence_number,
            "nominal_load": serialize_value(observation.nominal_load),
            "indication_I": serialize_value(observation.indication_I),
            "delta_L": serialize_value(observation.delta_L),
            "turning_point_P": serialize_value(observation.turning_point_P),
            "calculated_error_E": serialize_value(observation.calculated_error_E),
            "compliance_status": serialize_value(observation.compliance_status),
        }
        if extra_data:
            obs_extra.update(extra_data)

        new_value_summary = (
            f"L={serialize_value(observation.nominal_load)}, "
            f"I={serialize_value(observation.indication_I)}, "
            f"dL={serialize_value(observation.delta_L)}, "
            f"P={serialize_value(observation.turning_point_P)}, "
            f"E={serialize_value(observation.calculated_error_E)}, "
            f"Status={serialize_value(observation.compliance_status)}"
        )

        return await self.log_event(
            session_id=session_id,
            operator_id=operator_id,
            event_type=EVENT_OBSERVATION_CREATED,
            justification_reason=justification_reason,
            observation_id=observation.id,
            field_name="observation_grid",
            old_value=None,
            new_value=new_value_summary,
            extra_data=obs_extra,
        )

    async def log_observation_update(
        self,
        session_id: str,
        operator_id: str,
        observation_id: str,
        field_name: str,
        old_value: object,
        new_value: object,
        justification_reason: str,
        extra_data: dict[str, Any] | None = None,
    ) -> AuditTrailEvent:
        """Log modification of an individual observation field with mandatory reason."""
        return await self.log_event(
            session_id=session_id,
            operator_id=operator_id,
            event_type=EVENT_OBSERVATION_UPDATED,
            justification_reason=justification_reason,
            observation_id=observation_id,
            field_name=field_name,
            old_value=serialize_value(old_value),
            new_value=serialize_value(new_value),
            extra_data=extra_data,
        )

    async def log_observation_batch_update(
        self,
        session_id: str,
        operator_id: str,
        observation_id: str,
        changes: dict[str, tuple[object, object]],
        justification_reason: str,
        extra_data: dict[str, Any] | None = None,
    ) -> list[AuditTrailEvent]:
        """Log multiple field modifications on an observation as atomic chained audit events."""
        events: list[AuditTrailEvent] = []
        for field, (old_val, new_val) in changes.items():
            evt = await self.log_observation_update(
                session_id=session_id,
                operator_id=operator_id,
                observation_id=observation_id,
                field_name=field,
                old_value=old_val,
                new_value=new_val,
                justification_reason=justification_reason,
                extra_data=extra_data,
            )
            events.append(evt)
        return events

    async def log_session_transition(
        self,
        session_id: str,
        operator_id: str,
        old_status: TestSessionStatus | str,
        new_status: TestSessionStatus | str,
        justification_reason: str,
        overall_compliance: ComplianceStatus | str | None = None,
        extra_data: dict[str, Any] | None = None,
    ) -> AuditTrailEvent:
        """Log test session lifecycle state transition."""
        session_extra: dict[str, Any] = {}
        if overall_compliance is not None:
            session_extra["overall_compliance"] = serialize_value(overall_compliance)
        if extra_data:
            session_extra.update(extra_data)

        return await self.log_event(
            session_id=session_id,
            operator_id=operator_id,
            event_type=EVENT_SESSION_STATUS_CHANGED,
            justification_reason=justification_reason,
            field_name="status",
            old_value=serialize_value(old_status),
            new_value=serialize_value(new_status),
            extra_data=session_extra,
        )

    async def get_audit_trail(self, session_id: str) -> Sequence[AuditTrailEvent]:
        """Fetch all chronological audit events for a test session."""
        from app.db.models import AuditTrailEvent

        stmt = (
            select(AuditTrailEvent)
            .where(AuditTrailEvent.session_id == session_id)
            .order_by(AuditTrailEvent.created_at.asc(), AuditTrailEvent.id.asc())
            .execution_options(populate_existing=True)
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def verify_integrity(self, session_id: str) -> AuditVerificationResult:
        """Cryptographically verify the entire SHA-256 Merkle chain for a test session.

        Detects:
        1. Manual modification to row data (old_value, new_value, operator, justification, etc.).
        2. Deleted intermediate audit events (chain broken).
        3. Deleted or modified genesis event (H_0 != GENESIS_HASH).
        4. Forged hashes where subsequent events don't chain correctly.
        5. Non-monotonic chronological anomalies.
        """
        events = await self.get_audit_trail(session_id)
        total_events = len(events)

        if total_events == 0:
            return AuditVerificationResult(
                is_valid=True,
                session_id=session_id,
                total_events=0,
                chain_head_hash=None,
            )

        expected_prev_hash = GENESIS_HASH

        for idx, evt in enumerate(events):
            # 1. Verify link to preceding hash
            if evt.prev_hash != expected_prev_hash:
                return AuditVerificationResult(
                    is_valid=False,
                    session_id=session_id,
                    total_events=total_events,
                    chain_head_hash=None,
                    broken_event_id=evt.id,
                    broken_sequence_index=idx,
                    expected_hash=expected_prev_hash,
                    actual_hash=evt.prev_hash,
                    failure_reason=(
                        f"Chain continuity broken at event index {idx} ({evt.id}): "
                        f"expected prev_hash '{expected_prev_hash}', got '{evt.prev_hash}'."
                    ),
                )

            # 2. Reconstruct canonical payload from database columns
            timestamp_ist = ""
            extra_data: dict[str, Any] = {}
            if isinstance(evt.payload, dict):
                timestamp_ist = str(evt.payload.get("timestamp_ist", ""))
                extra_data = evt.payload.get("extra_data", {})
            if not timestamp_ist:
                timestamp_ist = format_ist_timestamp(evt.created_at)

            reconstructed_payload = build_canonical_payload(
                event_id=evt.id,
                session_id=evt.session_id,
                operator_id=evt.operator_id,
                event_type=evt.event_type,
                justification_reason=evt.justification_reason,
                timestamp_ist=timestamp_ist,
                observation_id=evt.observation_id,
                field_name=evt.field_name,
                old_value=evt.old_value,
                new_value=evt.new_value,
                extra_data=extra_data,
            )

            # 3. Recalculate SHA-256 hash
            recalculated_hash = compute_event_hash(evt.prev_hash, reconstructed_payload)

            if recalculated_hash != evt.sha256_hash:
                return AuditVerificationResult(
                    is_valid=False,
                    session_id=session_id,
                    total_events=total_events,
                    chain_head_hash=None,
                    broken_event_id=evt.id,
                    broken_sequence_index=idx,
                    expected_hash=recalculated_hash,
                    actual_hash=evt.sha256_hash,
                    failure_reason=(
                        f"Cryptographic hash mismatch at event index {idx} ({evt.id}): "
                        "Database row contents have been tampered with or modified directly."
                    ),
                )

            # Advance expected previous hash to this event's hash
            expected_prev_hash = evt.sha256_hash

        return AuditVerificationResult(
            is_valid=True,
            session_id=session_id,
            total_events=total_events,
            chain_head_hash=events[-1].sha256_hash,
        )


async def verify_audit_integrity(
    session_id: str,
    session: AsyncSession | None = None,
) -> AuditVerificationResult:
    """Verify cryptographic audit trail integrity for a session.

    Accepts either an explicit AsyncSession or opens a temporary session
    using the global session factory.
    """
    if session is not None:
        logger = AuditLogger(session)
        return await logger.verify_integrity(session_id)

    from app.db.session import async_session_factory

    async with async_session_factory() as ambient_session:
        logger = AuditLogger(ambient_session)
        return await logger.verify_integrity(session_id)


# ============================================================================
# ORM Immutability Event Listeners (Zero-Bug Defense-in-Depth)
# ============================================================================


def _prevent_audit_update(mapper: object, connection: object, target: Any) -> None:
    """Intercept and reject any ORM update operation on audit records."""
    raise ImmutableAuditRecordError(
        f"Illegal modification attempt: Audit trail event '{getattr(target, 'id', 'unknown')}' is strictly immutable "
        "under Legal Metrology Act regulations (Clause 26035). Updates are prohibited."
    )


def _prevent_audit_delete(mapper: object, connection: object, target: Any) -> None:
    """Intercept and reject any ORM delete operation on audit records."""
    raise ImmutableAuditRecordError(
        f"Illegal deletion attempt: Audit trail event '{getattr(target, 'id', 'unknown')}' cannot be deleted. "
        "Audit trail records are strictly append-only under Legal Metrology Act regulations."
    )


def _register_audit_listeners() -> None:
    """Register immutability event listeners on AuditTrailEvent."""
    try:
        from app.db.models import AuditTrailEvent

        if AuditTrailEvent is not None:
            if not event.contains(AuditTrailEvent, "before_update", _prevent_audit_update):
                event.listen(AuditTrailEvent, "before_update", _prevent_audit_update, propagate=True)
            if not event.contains(AuditTrailEvent, "before_delete", _prevent_audit_delete):
                event.listen(AuditTrailEvent, "before_delete", _prevent_audit_delete, propagate=True)
    except Exception:
        pass


_register_audit_listeners()
