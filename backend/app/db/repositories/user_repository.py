"""User repository for managing laboratory personnel and RBAC permissions."""

from __future__ import annotations

from collections.abc import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import User, UserRole
from app.db.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    """Data access operations for User accounts and role hierarchies."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(User, session)

    async def get_by_email(self, email: str) -> User | None:
        """Fetch user by primary login email."""
        stmt = select(User).where(User.email == email.strip().lower())
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_username(self, username: str) -> User | None:
        """Fetch user by unique username identifier."""
        stmt = select(User).where(User.username == username.strip())
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def list_by_role(
        self,
        role: UserRole,
        skip: int = 0,
        limit: int = 100,
    ) -> Sequence[User]:
        """List active users assigned to a specific statutory role."""
        stmt = (
            select(User)
            .where(User.role == role, User.is_active.is_(True))
            .order_by(User.full_name)
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def list_by_laboratory(self, laboratory_id: str) -> Sequence[User]:
        """List all users attached to a specific laboratory facility."""
        stmt = (
            select(User)
            .where(User.laboratory_id == laboratory_id, User.is_active.is_(True))
            .order_by(User.full_name)
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()
