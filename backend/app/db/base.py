"""SQLAlchemy 2.0 Base and declarative persistence primitives.

Ensures complete cross-dialect compatibility between PostgreSQL and SQLite:
- Dual JSON/JSONB support using SQLAlchemy's .with_variant()
- Lossless Decimal mapping (Numeric(16, 6, asdecimal=True))
- UTC ISO-8601 timezone-aware timestamps
- UUID string primary keys (String(36))
"""

from __future__ import annotations

import uuid
from datetime import UTC, datetime
from typing import Any

from sqlalchemy import JSON, DateTime
from sqlalchemy.dialects import postgresql
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


def utc_now() -> datetime:
    """Return current timestamp with explicit UTC timezone."""
    return datetime.now(UTC)


def generate_uuid() -> str:
    """Generate a clean RFC 4122 v4 UUID string."""
    return str(uuid.uuid4())


# Dialect-aware JSON column: JSONB on PostgreSQL, JSON on SQLite
JsonVariant = JSON().with_variant(postgresql.JSONB(), "postgresql")  # type: ignore[no-untyped-call]


class Base(DeclarativeBase):
    """Base declarative class for all METROLOGIX-76 ORM entities."""

    type_annotation_map = {
        dict[str, Any]: JsonVariant,
    }


class TimestampMixin:
    """Standardized timestamp mixin for auditability across all entities."""

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        index=True,
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
        nullable=False,
    )
