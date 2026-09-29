"""Generic SQLAlchemy 2.0 async BaseRepository.

Provides foundational CRUD operations, pagination, filtering, and counting
without exposing raw SQL or session leaks to the business logic layer.
"""

from __future__ import annotations

from collections.abc import Sequence
from typing import Generic, TypeVar

from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    """Generic async repository implementing type-safe database access."""

    def __init__(self, model: type[ModelType], session: AsyncSession) -> None:
        self.model = model
        self.session = session

    async def get(self, entity_id: str) -> ModelType | None:
        """Fetch a single record by primary key."""
        stmt = select(self.model).where(self.model.id == entity_id)  # type: ignore[attr-defined]
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def list(
        self,
        skip: int = 0,
        limit: int = 100,
        **filters: object,
    ) -> Sequence[ModelType]:
        """Fetch records with optional equality filtering and pagination."""
        stmt = select(self.model)
        for field, value in filters.items():
            if hasattr(self.model, field) and value is not None:
                stmt = stmt.where(getattr(self.model, field) == value)
        stmt = stmt.offset(skip).limit(limit)
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def count(self, **filters: object) -> int:
        """Count records matching optional filter criteria."""
        stmt = select(func.count()).select_from(self.model)
        for field, value in filters.items():
            if hasattr(self.model, field) and value is not None:
                stmt = stmt.where(getattr(self.model, field) == value)
        result = await self.session.execute(stmt)
        count_val = result.scalar()
        return count_val if count_val is not None else 0

    async def create(self, entity: ModelType) -> ModelType:
        """Add and flush a new record to populate generated primary key."""
        self.session.add(entity)
        await self.session.flush()
        return entity

    async def update(self, entity: ModelType) -> ModelType:
        """Flush changes on an active attached entity."""
        await self.session.flush()
        return entity

    async def delete(self, entity_id: str) -> bool:
        """Delete record by primary key."""
        stmt = delete(self.model).where(self.model.id == entity_id)  # type: ignore[attr-defined]
        result = await self.session.execute(stmt)
        await self.session.flush()
        return bool(result.rowcount and result.rowcount > 0)
