"""Test session repository for type evaluation sessions and observation grids."""

from __future__ import annotations

from collections.abc import Sequence
from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.types import ComplianceStatus, TestType
from app.db.models import TestObservation, TestSession, TestSessionStatus
from app.db.repositories.base import BaseRepository


__test__ = False


class TestSessionRepository(BaseRepository[TestSession]):
    """Data access operations for evaluation test sessions and observation logging."""

    __test__ = False

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(TestSession, session)

    async def get_by_session_number(self, session_number: str) -> TestSession | None:
        """Fetch test session by unique statutory session identifier."""
        stmt = select(TestSession).where(TestSession.session_number == session_number.strip())
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def list_by_instrument(self, instrument_id: str) -> Sequence[TestSession]:
        """Fetch all historical test sessions performed on an instrument."""
        stmt = (
            select(TestSession)
            .where(TestSession.instrument_id == instrument_id)
            .order_by(TestSession.created_at.desc())
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def list_by_laboratory(
        self,
        laboratory_id: str,
        status: TestSessionStatus | None = None,
        skip: int = 0,
        limit: int = 100,
    ) -> Sequence[TestSession]:
        """List test sessions conducted at a laboratory facility."""
        stmt = select(TestSession).where(TestSession.laboratory_id == laboratory_id)
        if status is not None:
            stmt = stmt.where(TestSession.status == status)
        stmt = stmt.order_by(TestSession.created_at.desc()).offset(skip).limit(limit)
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def list_by_operator(self, operator_id: str) -> Sequence[TestSession]:
        """List sessions operated by a specific testing officer."""
        stmt = (
            select(TestSession)
            .where(TestSession.operator_id == operator_id)
            .order_by(TestSession.created_at.desc())
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def add_observation(
        self,
        observation: TestObservation,
    ) -> TestObservation:
        """Add and flush an observation to a test session."""
        self.session.add(observation)
        await self.session.flush()
        return observation

    async def get_observations(
        self,
        session_id: str,
        test_type: TestType | None = None,
    ) -> Sequence[TestObservation]:
        """Fetch all observations for a session, optionally filtered by test procedure type."""
        stmt = select(TestObservation).where(TestObservation.session_id == session_id)
        if test_type is not None:
            stmt = stmt.where(TestObservation.test_type == test_type)
        stmt = stmt.order_by(
            TestObservation.test_type,
            TestObservation.sequence_number,
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def update_status(
        self,
        session_id: str,
        status: TestSessionStatus,
        overall_compliance: ComplianceStatus | None = None,
    ) -> TestSession | None:
        """Update test session lifecycle status and optional overall compliance verdict."""
        test_session = await self.get(session_id)
        if test_session is None:
            return None

        test_session.status = status
        if overall_compliance is not None:
            test_session.overall_compliance = overall_compliance

        if status in (TestSessionStatus.APPROVED, TestSessionStatus.REJECTED):
            test_session.completed_at = datetime.now(UTC)
        elif status == TestSessionStatus.IN_PROGRESS and test_session.started_at is None:
            test_session.started_at = datetime.now(UTC)

        await self.session.flush()
        return test_session
