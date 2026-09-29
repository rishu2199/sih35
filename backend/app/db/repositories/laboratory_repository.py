"""Laboratory repository for managing RRSL and GATC test facilities."""

from __future__ import annotations

from collections.abc import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import Laboratory, LaboratoryType
from app.db.repositories.base import BaseRepository


class LaboratoryRepository(BaseRepository[Laboratory]):
    """Data access operations for RRSL and GATC laboratory profiles."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(Laboratory, session)

    async def get_by_code(self, code: str) -> Laboratory | None:
        """Fetch a laboratory by its unique statutory code (e.g., RRSL-BLR)."""
        stmt = select(Laboratory).where(Laboratory.code == code)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def list_by_type(
        self,
        lab_type: LaboratoryType,
        skip: int = 0,
        limit: int = 100,
    ) -> Sequence[Laboratory]:
        """List laboratories by categorization (RRSL, GATC, etc.)."""
        stmt = (
            select(Laboratory)
            .where(Laboratory.lab_type == lab_type)
            .order_by(Laboratory.code)
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def list_active(self) -> Sequence[Laboratory]:
        """Fetch all operational laboratories."""
        stmt = (
            select(Laboratory)
            .where(Laboratory.is_active.is_(True))
            .order_by(Laboratory.code)
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()
