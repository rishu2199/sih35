"""Equipment repository for standard weight sets and calibration traceability."""

from __future__ import annotations

from collections.abc import Sequence
from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import StandardWeightSet, WeightClass
from app.db.repositories.base import BaseRepository


class EquipmentRepository(BaseRepository[StandardWeightSet]):
    """Data access operations for OIML R 111 certified standard weight sets."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(StandardWeightSet, session)

    async def get_by_code(self, identification_code: str) -> StandardWeightSet | None:
        """Fetch weight set by unique identification code."""
        stmt = select(StandardWeightSet).where(
            StandardWeightSet.identification_code == identification_code.strip()
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def list_valid_by_lab(
        self,
        laboratory_id: str,
        as_of_date: datetime | None = None,
    ) -> Sequence[StandardWeightSet]:
        """Fetch all weight sets attached to a lab whose calibration validity has not expired."""
        target_date = as_of_date or datetime.now(UTC)
        stmt = (
            select(StandardWeightSet)
            .where(
                StandardWeightSet.laboratory_id == laboratory_id,
                StandardWeightSet.is_active.is_(True),
                StandardWeightSet.validity_date >= target_date,
            )
            .order_by(StandardWeightSet.weight_class)
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def list_by_weight_class(
        self,
        weight_class: WeightClass,
    ) -> Sequence[StandardWeightSet]:
        """List active standard weight sets belonging to an OIML R 111 weight class."""
        stmt = (
            select(StandardWeightSet)
            .where(
                StandardWeightSet.weight_class == weight_class,
                StandardWeightSet.is_active.is_(True),
            )
            .order_by(StandardWeightSet.identification_code)
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()
