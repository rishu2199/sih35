"""Instrument repository for Non-Automatic Weighing Instruments (NAWI)."""

from __future__ import annotations

from collections.abc import Sequence

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.types import AccuracyClass
from app.db.models import Instrument
from app.db.repositories.base import BaseRepository


class InstrumentRepository(BaseRepository[Instrument]):
    """Data access operations for NAWI instrument specifications and models."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(Instrument, session)

    async def get_by_serial(self, serial_number: str) -> Instrument | None:
        """Fetch instrument by manufacturer unique serial number."""
        stmt = select(Instrument).where(Instrument.serial_number == serial_number.strip())
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def list_by_accuracy_class(
        self,
        accuracy_class: AccuracyClass,
        skip: int = 0,
        limit: int = 100,
    ) -> Sequence[Instrument]:
        """Fetch instruments by OIML accuracy classification (Class I–IIII)."""
        stmt = (
            select(Instrument)
            .where(Instrument.accuracy_class == accuracy_class)
            .order_by(Instrument.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def list_by_manufacturer(
        self,
        manufacturer: str,
        skip: int = 0,
        limit: int = 100,
    ) -> Sequence[Instrument]:
        """Fetch instruments manufactured by a specific vendor."""
        stmt = (
            select(Instrument)
            .where(Instrument.manufacturer.ilike(f"%{manufacturer.strip()}%"))
            .order_by(Instrument.model_name)
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def search(
        self,
        query: str,
        skip: int = 0,
        limit: int = 100,
    ) -> Sequence[Instrument]:
        """Search instruments by serial number, model name, or manufacturer substring."""
        pattern = f"%{query.strip()}%"
        stmt = (
            select(Instrument)
            .where(
                or_(
                    Instrument.serial_number.ilike(pattern),
                    Instrument.model_name.ilike(pattern),
                    Instrument.manufacturer.ilike(pattern),
                )
            )
            .order_by(Instrument.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()
