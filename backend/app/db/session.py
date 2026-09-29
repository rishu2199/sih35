"""Database engine, async session factory, and transaction management.

Provides unified support for:
- Production PostgreSQL (asyncpg) with connection pooling
- Local / Desktop SQLite (aiosqlite) with WAL mode & foreign keys enabled
- FastAPI dependency injection (`get_db`)
- Programmatic database initialization (`init_db`)
"""

from __future__ import annotations

from collections.abc import AsyncGenerator
from typing import Any

from sqlalchemy import event
from sqlalchemy.engine import Engine
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.config import settings
from app.db.base import Base


# Enforce SQLite foreign keys and WAL mode when using SQLite
@event.listens_for(Engine, "connect")
def _set_sqlite_pragma(dbapi_connection: object, connection_record: object) -> None:
    """Enforce foreign key cascade rules and WAL mode on SQLite connections."""
    if hasattr(dbapi_connection, "cursor"):
        cursor = dbapi_connection.cursor()
        if hasattr(cursor, "execute"):
            cursor.execute("PRAGMA foreign_keys=ON;")
            cursor.execute("PRAGMA journal_mode=WAL;")
        cursor.close()


def create_engine_and_sessionmaker(
    database_url: str | None = None,
    echo: bool = False,
) -> tuple[AsyncEngine, async_sessionmaker[AsyncSession]]:
    """Create a configured AsyncEngine and sessionmaker factory.

    Supports both:
    - sqlite+aiosqlite:///...
    - postgresql+asyncpg://...
    """
    url = database_url or settings.DATABASE_URL
    is_sqlite = url.startswith("sqlite")

    engine_kwargs: dict[str, Any] = {
        "echo": echo,
        "future": True,
    }

    if not is_sqlite:
        # PostgreSQL connection pooling optimizations
        engine_kwargs.update(
            {
                "pool_size": 10,
                "max_overflow": 20,
                "pool_pre_ping": True,
                "pool_recycle": 1800,
            }
        )

    engine = create_async_engine(url, **engine_kwargs)
    session_factory = async_sessionmaker(
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False,
    )
    return engine, session_factory


# Default module-level async engine & sessionmaker
engine, async_session_factory = create_engine_and_sessionmaker(
    database_url=settings.DATABASE_URL,
    echo=settings.APP_DEBUG and settings.APP_ENV == "development",
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI async dependency yielding an isolated database session."""
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


async def init_db(target_engine: AsyncEngine | None = None) -> None:
    """Create all tables in the database (used in testing and local dev)."""
    eng = target_engine or engine
    async with eng.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def drop_db(target_engine: AsyncEngine | None = None) -> None:
    """Drop all tables in the database (used in testing)."""
    eng = target_engine or engine
    async with eng.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
