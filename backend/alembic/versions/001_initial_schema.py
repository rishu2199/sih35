"""Initial METROLOGIX-76 database schema.

Revision ID: 001_initial_schema
Revises:
Create Date: 2026-09-25 12:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "001_initial_schema"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

# Dialect-aware JSON variant
json_type = sa.JSON().with_variant(postgresql.JSONB(), "postgresql")


def upgrade() -> None:
    # 1. LABORATORIES
    op.create_table(
        "laboratories",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("code", sa.String(length=50), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("lab_type", sa.String(length=50), nullable=False),
        sa.Column("nabl_accreditation_number", sa.String(length=100), nullable=True),
        sa.Column("nabl_validity_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("address", sa.Text(), nullable=False),
        sa.Column("city", sa.String(length=100), nullable=False),
        sa.Column("state", sa.String(length=100), nullable=False),
        sa.Column("pincode", sa.String(length=20), nullable=False),
        sa.Column("contact_email", sa.String(length=255), nullable=False),
        sa.Column("contact_phone", sa.String(length=50), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("1")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("code"),
    )
    op.create_index("ix_laboratories_code", "laboratories", ["code"])
    op.create_index("ix_laboratories_created_at", "laboratories", ["created_at"])
    op.create_index(
        "ix_laboratories_nabl_accreditation_number",
        "laboratories",
        ["nabl_accreditation_number"],
    )

    # 2. USERS
    op.create_table(
        "users",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("username", sa.String(length=100), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("full_name", sa.String(length=255), nullable=False),
        sa.Column(
            "designation",
            sa.String(length=255),
            nullable=False,
            server_default="Testing Officer",
        ),
        sa.Column("role", sa.String(length=50), nullable=False, server_default="METROLOGIST"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("1")),
        sa.Column("laboratory_id", sa.String(length=36), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["laboratory_id"], ["laboratories.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
        sa.UniqueConstraint("username"),
    )
    op.create_index("ix_users_created_at", "users", ["created_at"])
    op.create_index("ix_users_email", "users", ["email"])
    op.create_index("ix_users_laboratory_id", "users", ["laboratory_id"])
    op.create_index("ix_users_username", "users", ["username"])

    # 3. INSTRUMENTS
    op.create_table(
        "instruments",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("serial_number", sa.String(length=100), nullable=False),
        sa.Column("model_name", sa.String(length=150), nullable=False),
        sa.Column("manufacturer", sa.String(length=255), nullable=False),
        sa.Column("accuracy_class", sa.String(length=20), nullable=False),
        sa.Column(
            "verification_stage",
            sa.String(length=30),
            nullable=False,
            server_default="INITIAL_TYPE_APPROVAL",
        ),
        sa.Column(
            "unit",
            sa.String(length=20),
            nullable=False,
            server_default="KILOGRAM",
        ),
        sa.Column("max_capacity", sa.Numeric(precision=16, scale=6), nullable=False),
        sa.Column("min_capacity", sa.Numeric(precision=16, scale=6), nullable=False),
        sa.Column(
            "verification_scale_interval",
            sa.Numeric(precision=16, scale=6),
            nullable=False,
        ),
        sa.Column(
            "actual_scale_interval",
            sa.Numeric(precision=16, scale=6),
            nullable=True,
        ),
        sa.Column(
            "receptor_type",
            sa.String(length=30),
            nullable=False,
            server_default="PLATFORM",
        ),
        sa.Column(
            "mobility",
            sa.String(length=30),
            nullable=False,
            server_default="FIXED",
        ),
        sa.Column("has_level_indicator", sa.Boolean(), nullable=False, server_default=sa.text("1")),
        sa.Column("has_tare_device", sa.Boolean(), nullable=False, server_default=sa.text("1")),
        sa.Column("num_supports", sa.Integer(), nullable=True, server_default="4"),
        sa.Column("is_multi_interval", sa.Boolean(), nullable=False, server_default=sa.text("0")),
        sa.Column("multi_interval_ranges", json_type, nullable=True),
        sa.Column(
            "rulepack_id",
            sa.String(length=50),
            nullable=False,
            server_default="OIML_R76_2006",
        ),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("serial_number"),
    )
    op.create_index("ix_instruments_created_at", "instruments", ["created_at"])
    op.create_index("ix_instruments_manufacturer", "instruments", ["manufacturer"])
    op.create_index("ix_instruments_model_name", "instruments", ["model_name"])
    op.create_index("ix_instruments_serial_number", "instruments", ["serial_number"])

    # 4. STANDARD WEIGHT SETS
    op.create_table(
        "standard_weight_sets",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("identification_code", sa.String(length=100), nullable=False),
        sa.Column("weight_class", sa.String(length=20), nullable=False),
        sa.Column("calibration_certificate_number", sa.String(length=100), nullable=False),
        sa.Column("calibrated_by", sa.String(length=255), nullable=False),
        sa.Column("calibration_date", sa.DateTime(timezone=True), nullable=False),
        sa.Column("validity_date", sa.DateTime(timezone=True), nullable=False),
        sa.Column("nominal_min_value", sa.Numeric(precision=16, scale=6), nullable=False),
        sa.Column("nominal_max_value", sa.Numeric(precision=16, scale=6), nullable=False),
        sa.Column(
            "unit",
            sa.String(length=20),
            nullable=False,
            server_default="KILOGRAM",
        ),
        sa.Column("laboratory_id", sa.String(length=36), nullable=True),
        sa.Column("expanded_uncertainty_k2", sa.Numeric(precision=16, scale=6), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("1")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["laboratory_id"], ["laboratories.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("identification_code"),
    )
    op.create_index(
        "ix_standard_weight_sets_calibration_certificate_number",
        "standard_weight_sets",
        ["calibration_certificate_number"],
    )
    op.create_index(
        "ix_standard_weight_sets_created_at",
        "standard_weight_sets",
        ["created_at"],
    )
    op.create_index(
        "ix_standard_weight_sets_identification_code",
        "standard_weight_sets",
        ["identification_code"],
    )
    op.create_index(
        "ix_standard_weight_sets_laboratory_id",
        "standard_weight_sets",
        ["laboratory_id"],
    )
    op.create_index(
        "ix_standard_weight_sets_validity_date",
        "standard_weight_sets",
        ["validity_date"],
    )

    # 5. TEST SESSIONS
    op.create_table(
        "test_sessions",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("session_number", sa.String(length=100), nullable=False),
        sa.Column("instrument_id", sa.String(length=36), nullable=False),
        sa.Column("laboratory_id", sa.String(length=36), nullable=False),
        sa.Column("operator_id", sa.String(length=36), nullable=False),
        sa.Column("reviewer_id", sa.String(length=36), nullable=True),
        sa.Column("weight_set_id", sa.String(length=36), nullable=True),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="DRAFT"),
        sa.Column(
            "verification_stage",
            sa.String(length=30),
            nullable=False,
            server_default="INITIAL_TYPE_APPROVAL",
        ),
        sa.Column("ambient_temperature_celsius", sa.Numeric(precision=8, scale=2), nullable=True),
        sa.Column("relative_humidity_percent", sa.Numeric(precision=8, scale=2), nullable=True),
        sa.Column("atmospheric_pressure_hpa", sa.Numeric(precision=8, scale=2), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column(
            "overall_compliance",
            sa.String(length=20),
            nullable=False,
            server_default="INCONCLUSIVE",
        ),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["instrument_id"], ["instruments.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["laboratory_id"], ["laboratories.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["operator_id"], ["users.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["reviewer_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(
            ["weight_set_id"],
            ["standard_weight_sets.id"],
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("session_number"),
    )
    op.create_index("ix_test_sessions_created_at", "test_sessions", ["created_at"])
    op.create_index("ix_test_sessions_instrument_id", "test_sessions", ["instrument_id"])
    op.create_index("ix_test_sessions_laboratory_id", "test_sessions", ["laboratory_id"])
    op.create_index("ix_test_sessions_operator_id", "test_sessions", ["operator_id"])
    op.create_index("ix_test_sessions_reviewer_id", "test_sessions", ["reviewer_id"])
    op.create_index("ix_test_sessions_session_number", "test_sessions", ["session_number"])
    op.create_index("ix_test_sessions_status", "test_sessions", ["status"])
    op.create_index("ix_test_sessions_weight_set_id", "test_sessions", ["weight_set_id"])

    # 6. TEST OBSERVATIONS
    op.create_table(
        "test_observations",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("session_id", sa.String(length=36), nullable=False),
        sa.Column("test_type", sa.String(length=30), nullable=False),
        sa.Column("sequence_number", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("run_number", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("position_descriptor", sa.String(length=50), nullable=True),
        sa.Column("nominal_load", sa.Numeric(precision=16, scale=6), nullable=False),
        sa.Column("indication_I", sa.Numeric(precision=16, scale=6), nullable=False),
        sa.Column("delta_L", sa.Numeric(precision=16, scale=6), nullable=False),
        sa.Column("turning_point_P", sa.Numeric(precision=16, scale=6), nullable=False),
        sa.Column("calculated_error_E", sa.Numeric(precision=16, scale=6), nullable=False),
        sa.Column("corrected_error_Ec", sa.Numeric(precision=16, scale=6), nullable=True),
        sa.Column("mpe_limit", sa.Numeric(precision=16, scale=6), nullable=False),
        sa.Column("compliance_status", sa.String(length=20), nullable=False),
        sa.Column("oiml_clause", sa.String(length=50), nullable=False),
        sa.Column("raw_observation_grid", json_type, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["session_id"], ["test_sessions.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_test_observations_created_at", "test_observations", ["created_at"])
    op.create_index("ix_test_observations_session_id", "test_observations", ["session_id"])
    op.create_index("ix_test_observations_test_type", "test_observations", ["test_type"])
    op.create_index(
        "ix_observations_session_type_seq",
        "test_observations",
        ["session_id", "test_type", "sequence_number"],
    )

    # 7. AUDIT TRAIL EVENTS
    op.create_table(
        "audit_trail_events",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("session_id", sa.String(length=36), nullable=False),
        sa.Column("operator_id", sa.String(length=36), nullable=False),
        sa.Column("observation_id", sa.String(length=36), nullable=True),
        sa.Column("event_type", sa.String(length=50), nullable=False),
        sa.Column("field_name", sa.String(length=100), nullable=True),
        sa.Column("old_value", sa.Text(), nullable=True),
        sa.Column("new_value", sa.Text(), nullable=True),
        sa.Column("justification_reason", sa.Text(), nullable=False),
        sa.Column("sha256_hash", sa.String(length=64), nullable=False),
        sa.Column("prev_hash", sa.String(length=64), nullable=False),
        sa.Column("payload", json_type, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["operator_id"], ["users.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["session_id"], ["test_sessions.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_audit_trail_events_created_at", "audit_trail_events", ["created_at"])
    op.create_index("ix_audit_trail_events_event_type", "audit_trail_events", ["event_type"])
    op.create_index(
        "ix_audit_trail_events_observation_id",
        "audit_trail_events",
        ["observation_id"],
    )
    op.create_index("ix_audit_trail_events_operator_id", "audit_trail_events", ["operator_id"])
    op.create_index("ix_audit_trail_events_session_id", "audit_trail_events", ["session_id"])


def downgrade() -> None:
    op.drop_table("audit_trail_events")
    op.drop_table("test_observations")
    op.drop_table("test_sessions")
    op.drop_table("standard_weight_sets")
    op.drop_table("instruments")
    op.drop_table("users")
    op.drop_table("laboratories")
