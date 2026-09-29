"""Audit repository for immutable cryptographic event sourcing."""

from __future__ import annotations

from collections.abc import Sequence
from typing import TYPE_CHECKING, Any

from app.db.models import AuditTrailEvent
from app.db.repositories.base import BaseRepository

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import AsyncSession

    from app.core.audit_logger import (
        AuditLogger,
        AuditVerificationResult,
    )

GENESIS_HASH: str = "0" * 64


class AuditRepository(BaseRepository[AuditTrailEvent]):
    """Data access operations for immutable SHA-256 Merkle chain audit logs."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(AuditTrailEvent, session)
        from app.core.audit_logger import AuditLogger

        self._logger: AuditLogger = AuditLogger(session)

    @property
    def logger(self) -> AuditLogger:
        """Return the underlying cryptographic AuditLogger instance."""
        return self._logger

    async def get_latest_event(self, session_id: str) -> AuditTrailEvent | None:
        """Fetch the most recent audit event recorded for a test session."""
        return await self._logger.get_latest_event(session_id)

    async def get_latest_hash(self, session_id: str) -> str:
        """Get the hash of the preceding event, or GENESIS_HASH if first event."""
        return await self._logger.get_latest_hash(session_id)

    async def record_event(
        self,
        session_id: str,
        operator_id: str,
        event_type: str,
        justification_reason: str,
        observation_id: str | None = None,
        field_name: str | None = None,
        old_value: str | None = None,
        new_value: str | None = None,
        payload: dict[str, Any] | None = None,
    ) -> AuditTrailEvent:
        """Record an append-only audit event chained with the previous event's hash."""
        return await self._logger.log_event(
            session_id=session_id,
            operator_id=operator_id,
            event_type=event_type,
            justification_reason=justification_reason,
            observation_id=observation_id,
            field_name=field_name,
            old_value=old_value,
            new_value=new_value,
            extra_data=payload,
        )

    async def get_session_events(
        self,
        session_id: str,
    ) -> Sequence[AuditTrailEvent]:
        """Fetch all chronological audit events for a session."""
        return await self._logger.get_audit_trail(session_id)

    async def verify_integrity(
        self,
        session_id: str,
    ) -> AuditVerificationResult:
        """Verify cryptographic Merkle hash chain integrity for the specified session."""
        return await self._logger.verify_integrity(session_id)
