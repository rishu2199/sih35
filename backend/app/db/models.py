"""SQLAlchemy 2.0 ORM Models for METROLOGIX-76.

Implements unified, high-integrity schema for:
- User (Statutory RBAC: METROLOGIST, REVIEWER, DIRECTOR, AUDITOR, ADMIN)
- Laboratory (RRSL / GATC statutory facilities with NABL ISO/IEC 17025 accreditation)
- Instrument (NAWI technical specifications, intervals, receptors, mobility)
- StandardWeightSet (OIML R 111 calibration traceability & certificate validity)
- TestSession (Type evaluation workflow, environmental logging, status lifecycle)
- TestObservation (Changeover readings, digital errors, MPE limits, JSON grids)
- AuditTrailEvent (Immutable cryptographic SHA-256 Merkle chain event log)

100% dialect-compatible between PostgreSQL and SQLite.
All physical loads, scale intervals, errors, and MPE limits use Numeric(16, 6).
"""

from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import Any

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.types import (
    AccuracyClass,
    ComplianceStatus,
    InstrumentMobility,
    LoadReceptorType,
    TestType,
    UnitOfMeasurement,
    VerificationStage,
    WeightClass,
)
from app.db.base import Base, JsonVariant, TimestampMixin, generate_uuid, utc_now

# ============================================================================
# STATUTORY DATABASE ENUMS
# ============================================================================


class UserRole(str, Enum):
    """Statutory laboratory access roles under Legal Metrology enforcement."""

    METROLOGIST = "METROLOGIST"  # Testing Officer (enters observations)
    REVIEWER = "REVIEWER"  # Principal Scientific Officer (PSO / Reviewer)
    DIRECTOR = "DIRECTOR"  # Laboratory Head / Director (Issuing Authority)
    AUDITOR = "AUDITOR"  # Read-only Regulatory Auditor (DoCA Inspector)
    ADMIN = "ADMIN"  # System / IT Administrator


class LaboratoryType(str, Enum):
    """Legal Metrology laboratory categorization in India."""

    RRSL = "RRSL"  # Regional Reference Standard Laboratory (Central Govt)
    GATC = "GATC"  # Government Approved Test Centre (under GATC Rules, 2013/2026)
    NPL = "NPL"  # National Physical Laboratory (Apex National Metrology Institute)
    STATE_LAB = "STATE_LAB"  # State Legal Metrology Secondary / Working Standard Lab


class TestSessionStatus(str, Enum):
    """Lifecycle status of a type evaluation / verification session."""

    DRAFT = "DRAFT"  # Initial creation and parameter setup
    IN_PROGRESS = "IN_PROGRESS"  # Active observation entry underway
    PENDING_REVIEW = "PENDING_REVIEW"  # Testing complete, submitted to PSO for review
    APPROVED = "APPROVED"  # Validated and approved by Reviewer and Director
    REJECTED = "REJECTED"  # Non-compliant or returned for re-testing
    ARCHIVED = "ARCHIVED"  # Locked, immutable historical record with issued certificate


# WeightClass is imported from app.core.types for unified domain-db consistency.


# ============================================================================
# ORM ENTITY MODELS
# ============================================================================


class User(Base, TimestampMixin):
    """Laboratory personnel with role-based access control (RBAC)."""

    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=generate_uuid,
    )
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )
    username: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        index=True,
        nullable=False,
    )
    hashed_password: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    full_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    designation: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        default="Testing Officer",
    )
    role: Mapped[UserRole] = mapped_column(
        String(50),
        nullable=False,
        default=UserRole.METROLOGIST,
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )
    director_pin_hash: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
    laboratory_id: Mapped[str | None] = mapped_column(
        String(36),
        ForeignKey("laboratories.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # Relationships
    laboratory: Mapped[Laboratory | None] = relationship(
        "Laboratory",
        back_populates="users",
        lazy="selectin",
    )
    operated_sessions: Mapped[list[TestSession]] = relationship(
        "TestSession",
        foreign_keys="[TestSession.operator_id]",
        back_populates="operator",
    )
    reviewed_sessions: Mapped[list[TestSession]] = relationship(
        "TestSession",
        foreign_keys="[TestSession.reviewer_id]",
        back_populates="reviewer",
    )


class Laboratory(Base, TimestampMixin):
    """RRSL or GATC testing laboratory facility metadata."""

    __tablename__ = "laboratories"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=generate_uuid,
    )
    code: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        index=True,
        nullable=False,
    )
    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    lab_type: Mapped[LaboratoryType] = mapped_column(
        String(50),
        nullable=False,
        default=LaboratoryType.RRSL,
    )
    nabl_accreditation_number: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
        index=True,
    )
    nabl_validity_date: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    address: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    city: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    state: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    pincode: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )
    contact_email: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    contact_phone: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    # Relationships
    users: Mapped[list[User]] = relationship(
        "User",
        back_populates="laboratory",
    )
    test_sessions: Mapped[list[TestSession]] = relationship(
        "TestSession",
        back_populates="laboratory",
    )
    weight_sets: Mapped[list[StandardWeightSet]] = relationship(
        "StandardWeightSet",
        back_populates="laboratory",
    )


class Instrument(Base, TimestampMixin):
    """Non-Automatic Weighing Instrument (NAWI) technical specification profile."""

    __tablename__ = "instruments"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=generate_uuid,
    )
    serial_number: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        index=True,
        nullable=False,
    )
    model_name: Mapped[str] = mapped_column(
        String(150),
        index=True,
        nullable=False,
    )
    manufacturer: Mapped[str] = mapped_column(
        String(255),
        index=True,
        nullable=False,
    )
    accuracy_class: Mapped[AccuracyClass] = mapped_column(
        String(20),
        nullable=False,
    )
    verification_stage: Mapped[VerificationStage] = mapped_column(
        String(30),
        nullable=False,
        default=VerificationStage.INITIAL_TYPE_APPROVAL,
    )
    unit: Mapped[UnitOfMeasurement] = mapped_column(
        String(20),
        nullable=False,
        default=UnitOfMeasurement.KILOGRAM,
    )
    max_capacity: Mapped[Decimal] = mapped_column(
        Numeric(16, 6, asdecimal=True),
        nullable=False,
    )
    min_capacity: Mapped[Decimal] = mapped_column(
        Numeric(16, 6, asdecimal=True),
        nullable=False,
    )
    verification_scale_interval: Mapped[Decimal] = mapped_column(
        Numeric(16, 6, asdecimal=True),
        nullable=False,
    )
    actual_scale_interval: Mapped[Decimal | None] = mapped_column(
        Numeric(16, 6, asdecimal=True),
        nullable=True,
    )
    receptor_type: Mapped[LoadReceptorType] = mapped_column(
        String(30),
        nullable=False,
        default=LoadReceptorType.PLATFORM,
    )
    mobility: Mapped[InstrumentMobility] = mapped_column(
        String(30),
        nullable=False,
        default=InstrumentMobility.FIXED,
    )
    has_level_indicator: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )
    has_tare_device: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )
    num_supports: Mapped[int | None] = mapped_column(
        Integer,
        default=4,
        nullable=True,
    )
    is_multi_interval: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )
    multi_interval_ranges: Mapped[dict[str, Any] | None] = mapped_column(
        JsonVariant,
        nullable=True,
    )
    rulepack_id: Mapped[str] = mapped_column(
        String(50),
        default="OIML_R76_2006",
        nullable=False,
    )
    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # Relationships
    test_sessions: Mapped[list[TestSession]] = relationship(
        "TestSession",
        back_populates="instrument",
        cascade="all, delete-orphan",
    )


class StandardWeightSet(Base, TimestampMixin):
    """Certified standard weights conforming to OIML R 111-1 traceability."""

    __tablename__ = "standard_weight_sets"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=generate_uuid,
    )
    identification_code: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        index=True,
        nullable=False,
    )
    weight_class: Mapped[WeightClass] = mapped_column(
        String(20),
        nullable=False,
    )
    calibration_certificate_number: Mapped[str] = mapped_column(
        String(100),
        index=True,
        nullable=False,
    )
    calibrated_by: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    calibration_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )
    validity_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        index=True,
        nullable=False,
    )
    nominal_min_value: Mapped[Decimal] = mapped_column(
        Numeric(16, 6, asdecimal=True),
        nullable=False,
    )
    nominal_max_value: Mapped[Decimal] = mapped_column(
        Numeric(16, 6, asdecimal=True),
        nullable=False,
    )
    unit: Mapped[UnitOfMeasurement] = mapped_column(
        String(20),
        nullable=False,
        default=UnitOfMeasurement.KILOGRAM,
    )
    laboratory_id: Mapped[str | None] = mapped_column(
        String(36),
        ForeignKey("laboratories.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    expanded_uncertainty_k2: Mapped[Decimal | None] = mapped_column(
        Numeric(16, 6, asdecimal=True),
        nullable=True,
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    # Relationships
    laboratory: Mapped[Laboratory | None] = relationship(
        "Laboratory",
        back_populates="weight_sets",
    )
    test_sessions: Mapped[list[TestSession]] = relationship(
        "TestSession",
        back_populates="weight_set",
    )


class TestSession(Base, TimestampMixin):
    """Type evaluation test session encompassing all prescribed test procedures."""

    __test__ = False

    __tablename__ = "test_sessions"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=generate_uuid,
    )
    session_number: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        index=True,
        nullable=False,
    )
    instrument_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("instruments.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    laboratory_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("laboratories.id", ondelete="RESTRICT"),
        index=True,
        nullable=False,
    )
    operator_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="RESTRICT"),
        index=True,
        nullable=False,
    )
    reviewer_id: Mapped[str | None] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    weight_set_id: Mapped[str | None] = mapped_column(
        String(36),
        ForeignKey("standard_weight_sets.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    status: Mapped[TestSessionStatus] = mapped_column(
        String(30),
        default=TestSessionStatus.DRAFT,
        index=True,
        nullable=False,
    )
    verification_stage: Mapped[VerificationStage] = mapped_column(
        String(30),
        nullable=False,
        default=VerificationStage.INITIAL_TYPE_APPROVAL,
    )
    ambient_temperature_celsius: Mapped[Decimal | None] = mapped_column(
        Numeric(8, 2, asdecimal=True),
        nullable=True,
    )
    relative_humidity_percent: Mapped[Decimal | None] = mapped_column(
        Numeric(8, 2, asdecimal=True),
        nullable=True,
    )
    atmospheric_pressure_hpa: Mapped[Decimal | None] = mapped_column(
        Numeric(8, 2, asdecimal=True),
        nullable=True,
    )
    notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    overall_compliance: Mapped[ComplianceStatus] = mapped_column(
        String(20),
        default=ComplianceStatus.PENDING,
        nullable=False,
    )
    started_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # Relationships
    instrument: Mapped[Instrument] = relationship(
        "Instrument",
        back_populates="test_sessions",
        lazy="selectin",
    )
    laboratory: Mapped[Laboratory] = relationship(
        "Laboratory",
        back_populates="test_sessions",
        lazy="selectin",
    )
    operator: Mapped[User] = relationship(
        "User",
        foreign_keys=[operator_id],
        back_populates="operated_sessions",
        lazy="selectin",
    )
    reviewer: Mapped[User | None] = relationship(
        "User",
        foreign_keys=[reviewer_id],
        back_populates="reviewed_sessions",
        lazy="selectin",
    )
    weight_set: Mapped[StandardWeightSet | None] = relationship(
        "StandardWeightSet",
        back_populates="test_sessions",
        lazy="selectin",
    )
    observations: Mapped[list[TestObservation]] = relationship(
        "TestObservation",
        back_populates="test_session",
        cascade="all, delete-orphan",
        order_by="TestObservation.sequence_number",
        lazy="selectin",
    )
    audit_events: Mapped[list[AuditTrailEvent]] = relationship(
        "AuditTrailEvent",
        back_populates="test_session",
        cascade="save-update, merge",
        order_by="AuditTrailEvent.created_at",
        lazy="selectin",
    )
    row_comments: Mapped[list[RowAuditComment]] = relationship(
        "RowAuditComment",
        back_populates="test_session",
        cascade="all, delete-orphan",
        order_by="RowAuditComment.created_at",
        lazy="selectin",
    )


class TestObservation(Base, TimestampMixin):
    """Individual test observation and changeover calculation record."""

    __test__ = False

    __tablename__ = "test_observations"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=generate_uuid,
    )
    session_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("test_sessions.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    test_type: Mapped[TestType] = mapped_column(
        String(30),
        index=True,
        nullable=False,
    )
    sequence_number: Mapped[int] = mapped_column(
        Integer,
        default=1,
        nullable=False,
    )
    run_number: Mapped[int] = mapped_column(
        Integer,
        default=1,
        nullable=False,
    )
    position_descriptor: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )
    nominal_load: Mapped[Decimal] = mapped_column(
        Numeric(16, 6, asdecimal=True),
        nullable=False,
    )
    indication_I: Mapped[Decimal] = mapped_column(  # noqa: N815
        Numeric(16, 6, asdecimal=True),
        nullable=False,
    )
    delta_L: Mapped[Decimal] = mapped_column(  # noqa: N815
        Numeric(16, 6, asdecimal=True),
        nullable=False,
    )
    turning_point_P: Mapped[Decimal] = mapped_column(  # noqa: N815
        Numeric(16, 6, asdecimal=True),
        nullable=False,
    )
    calculated_error_E: Mapped[Decimal] = mapped_column(  # noqa: N815
        Numeric(16, 6, asdecimal=True),
        nullable=False,
    )
    corrected_error_Ec: Mapped[Decimal | None] = mapped_column(  # noqa: N815
        Numeric(16, 6, asdecimal=True),
        nullable=True,
    )
    mpe_limit: Mapped[Decimal] = mapped_column(
        Numeric(16, 6, asdecimal=True),
        nullable=False,
    )
    compliance_status: Mapped[ComplianceStatus] = mapped_column(
        String(20),
        nullable=False,
    )
    oiml_clause: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )
    raw_observation_grid: Mapped[dict[str, Any] | None] = mapped_column(
        JsonVariant,
        nullable=True,
    )

    # Relationships
    test_session: Mapped[TestSession] = relationship(
        "TestSession",
        back_populates="observations",
    )

    __table_args__ = (
        Index(
            "ix_observations_session_type_seq",
            "session_id",
            "test_type",
            "sequence_number",
        ),
    )


class AuditTrailEvent(Base):
    """Immutable audit trail event with cryptographic SHA-256 Merkle chain hash."""

    __tablename__ = "audit_trail_events"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=generate_uuid,
    )
    session_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("test_sessions.id", ondelete="RESTRICT"),
        index=True,
        nullable=False,
    )
    operator_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="RESTRICT"),
        index=True,
        nullable=False,
    )
    observation_id: Mapped[str | None] = mapped_column(
        String(36),
        index=True,
        nullable=True,
    )
    event_type: Mapped[str] = mapped_column(
        String(50),
        index=True,
        nullable=False,
    )
    field_name: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )
    old_value: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    new_value: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    justification_reason: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    sha256_hash: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
    )
    prev_hash: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
    )
    payload: Mapped[dict[str, Any] | None] = mapped_column(
        JsonVariant,
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        index=True,
        nullable=False,
    )

    # Relationships
    test_session: Mapped[TestSession] = relationship(
        "TestSession",
        back_populates="audit_events",
    )
    operator: Mapped[User] = relationship(
        "User",
    )


class RowAuditComment(Base, TimestampMixin):
    """Row-level observation audit comments made by testing officers, reviewers, or directors."""

    __tablename__ = "row_audit_comments"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=generate_uuid,
    )
    session_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("test_sessions.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    step_index: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )
    test_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="WEIGHING",
    )
    target_load: Mapped[Decimal] = mapped_column(
        Numeric(16, 6),
        nullable=False,
        default=Decimal("0.0"),
    )
    unit: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="g",
    )
    author_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    author_role: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )
    author_email: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    comment: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    severity: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="FLAG",  # NOTE | FLAG | REJECT_REASON
    )
    resolved: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    # Relationships
    test_session: Mapped[TestSession] = relationship(
        "TestSession",
        back_populates="row_comments",
    )


# Prevent pytest from attempting to collect Enum as test case class
TestSessionStatus.__test__ = False  # type: ignore[attr-defined]


