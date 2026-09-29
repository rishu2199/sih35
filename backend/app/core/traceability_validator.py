"""METROLOGIX-76 — OIML R 111 Standard Weight & Equipment Traceability Lockout Engine.

Statutory References:
- OIML R 111-1:2004:
  * Clause 5.2: Maximum expanded uncertainty of standard weights: U <= (1/3) * delta_m.
  * Table 1: Maximum permissible errors for weights (classes E1, E2, F1, F2, M1, M2, M3).
- OIML R 76-1:2006:
  * Clause 3.7.1: Standard weights used for testing shall not have an error or expanded
    uncertainty greater than 1/3 of the MPE of the instrument for the applied load:
    U(k=2) <= (1/3) * MPE(L).
  * Class adequacy: Class I requires E1/E2; Class II requires E2/F1 (F2 conditional);
    Class III requires F2/M1 (M2 conditional); Class IIII requires M1/M2/M3.
- Legal Metrology (General) Rules, 2011:
  * First Schedule & Seventh Schedule: Reference, Secondary, and Working standard weights.
  * Calibration certificate validity rules: Uncalibrated or expired weights hard-lock
    the test session workspace to prevent illegal or invalid verification.
"""

from __future__ import annotations

from collections.abc import Sequence
from datetime import UTC, date, datetime
from decimal import Decimal
from typing import Final

from pydantic import Field

from app.core.mpe_resolver import resolve_mpe
from app.core.rulepack import RulePack, default_rulepack_manager
from app.core.schemas import InstrumentSpecification, MetrologyBaseModel
from app.core.types import (
    AccuracyClass,
    ComplianceStatus,
    LockoutReason,
    TraceabilityStatus,
    UnitOfMeasure,
    VerificationStage,
    WeightClass,
    to_decimal,
)


def format_decimal_for_latex(val: Decimal | None) -> str:
    """Format a Decimal number cleanly for LaTeX rendering without float artifacts."""
    if val is None:
        return "N/A"
    s = f"{val:.6f}".rstrip("0").rstrip(".")
    return s if s else "0"


# ============================================================================
# Statutory Metrological Constants
# ============================================================================

STATUTORY_CITATION_R111: Final[str] = (
    "OIML R 111-1:2004 Clause 5.2 & Table 1; "
    "LM (General) Rules 2011 First & Seventh Schedules"
)

STATUTORY_CITATION_R76_TRACEABILITY: Final[str] = (
    "OIML R 76-1:2006 Clause 3.7.1; "
    "LM (General) Rules 2011 Seventh Schedule Heading A Para 7"
)

ONE_THIRD_FACTOR: Final[Decimal] = Decimal("1") / Decimal("3")
ONE_THIRD_FACTOR_ROUNDED: Final[Decimal] = Decimal("0.333333333333")
EXPIRY_WARNING_THRESHOLD_DAYS: Final[int] = 30

ZERO_DECIMAL: Final[Decimal] = Decimal("0")
ONE_DECIMAL: Final[Decimal] = Decimal("1")
THREE_DECIMAL: Final[Decimal] = Decimal("3")

# Unit conversions to Kilogram (SI Base Unit)
UNIT_TO_KG_FACTORS: Final[dict[UnitOfMeasure, Decimal]] = {
    UnitOfMeasure.MILLIGRAM: Decimal("0.000001"),
    UnitOfMeasure.GRAM: Decimal("0.001"),
    UnitOfMeasure.KILOGRAM: Decimal("1"),
    UnitOfMeasure.TONNE: Decimal("1000"),
}


# ============================================================================
# OIML R 111-1:2004 Table 1: Standard Weight MPE (in milligrams)
# Nominal mass mapped to class MPE (+/- delta_m in mg)
# ============================================================================

OIML_R111_TABLE_1_MG: Final[dict[Decimal, dict[WeightClass, Decimal]]] = {
    # 5000 kg to 100 kg (nominal expressed in grams: 5000000 g = 5000 kg)
    Decimal("5000000"): {
        WeightClass.F1: Decimal("25000"),
        WeightClass.F2: Decimal("80000"),
        WeightClass.M1: Decimal("250000"),
        WeightClass.M2: Decimal("800000"),
        WeightClass.M3: Decimal("2500000"),
    },
    Decimal("2000000"): {
        WeightClass.F1: Decimal("10000"),
        WeightClass.F2: Decimal("30000"),
        WeightClass.M1: Decimal("100000"),
        WeightClass.M2: Decimal("300000"),
        WeightClass.M3: Decimal("1000000"),
    },
    Decimal("1000000"): {
        WeightClass.E2: Decimal("1600"),
        WeightClass.F1: Decimal("5000"),
        WeightClass.F2: Decimal("16000"),
        WeightClass.M1: Decimal("50000"),
        WeightClass.M2: Decimal("160000"),
        WeightClass.M3: Decimal("500000"),
    },
    Decimal("500000"): {
        WeightClass.E2: Decimal("800"),
        WeightClass.F1: Decimal("2500"),
        WeightClass.F2: Decimal("8000"),
        WeightClass.M1: Decimal("25000"),
        WeightClass.M2: Decimal("80000"),
        WeightClass.M3: Decimal("250000"),
    },
    Decimal("200000"): {
        WeightClass.E2: Decimal("300"),
        WeightClass.F1: Decimal("1000"),
        WeightClass.F2: Decimal("3000"),
        WeightClass.M1: Decimal("10000"),
        WeightClass.M2: Decimal("30000"),
        WeightClass.M3: Decimal("100000"),
    },
    Decimal("100000"): {
        WeightClass.E2: Decimal("160"),
        WeightClass.F1: Decimal("500"),
        WeightClass.F2: Decimal("1600"),
        WeightClass.M1: Decimal("5000"),
        WeightClass.M2: Decimal("16000"),
        WeightClass.M3: Decimal("50000"),
    },
    # 50 kg to 1 kg
    Decimal("50000"): {
        WeightClass.E1: Decimal("25"),
        WeightClass.E2: Decimal("80"),
        WeightClass.F1: Decimal("250"),
        WeightClass.F2: Decimal("800"),
        WeightClass.M1: Decimal("2500"),
        WeightClass.M2: Decimal("8000"),
        WeightClass.M3: Decimal("25000"),
    },
    Decimal("20000"): {
        WeightClass.E1: Decimal("10"),
        WeightClass.E2: Decimal("30"),
        WeightClass.F1: Decimal("100"),
        WeightClass.F2: Decimal("300"),
        WeightClass.M1: Decimal("1000"),
        WeightClass.M2: Decimal("3000"),
        WeightClass.M3: Decimal("10000"),
    },
    Decimal("10000"): {
        WeightClass.E1: Decimal("5.0"),
        WeightClass.E2: Decimal("16"),
        WeightClass.F1: Decimal("50"),
        WeightClass.F2: Decimal("160"),
        WeightClass.M1: Decimal("500"),
        WeightClass.M2: Decimal("1600"),
        WeightClass.M3: Decimal("5000"),
    },
    Decimal("5000"): {
        WeightClass.E1: Decimal("2.5"),
        WeightClass.E2: Decimal("8.0"),
        WeightClass.F1: Decimal("25"),
        WeightClass.F2: Decimal("80"),
        WeightClass.M1: Decimal("250"),
        WeightClass.M2: Decimal("800"),
        WeightClass.M3: Decimal("2500"),
    },
    Decimal("2000"): {
        WeightClass.E1: Decimal("1.0"),
        WeightClass.E2: Decimal("3.0"),
        WeightClass.F1: Decimal("10"),
        WeightClass.F2: Decimal("30"),
        WeightClass.M1: Decimal("100"),
        WeightClass.M2: Decimal("300"),
        WeightClass.M3: Decimal("1000"),
    },
    Decimal("1000"): {
        WeightClass.E1: Decimal("0.5"),
        WeightClass.E2: Decimal("1.6"),
        WeightClass.F1: Decimal("5.0"),
        WeightClass.F2: Decimal("16"),
        WeightClass.M1: Decimal("50"),
        WeightClass.M2: Decimal("160"),
        WeightClass.M3: Decimal("500"),
    },
    # 500 g to 1 g
    Decimal("500"): {
        WeightClass.E1: Decimal("0.25"),
        WeightClass.E2: Decimal("0.8"),
        WeightClass.F1: Decimal("2.5"),
        WeightClass.F2: Decimal("8.0"),
        WeightClass.M1: Decimal("25"),
        WeightClass.M2: Decimal("80"),
        WeightClass.M3: Decimal("250"),
    },
    Decimal("200"): {
        WeightClass.E1: Decimal("0.10"),
        WeightClass.E2: Decimal("0.30"),
        WeightClass.F1: Decimal("1.0"),
        WeightClass.F2: Decimal("3.0"),
        WeightClass.M1: Decimal("10"),
        WeightClass.M2: Decimal("30"),
        WeightClass.M3: Decimal("100"),
    },
    Decimal("100"): {
        WeightClass.E1: Decimal("0.05"),
        WeightClass.E2: Decimal("0.16"),
        WeightClass.F1: Decimal("0.5"),
        WeightClass.F2: Decimal("1.6"),
        WeightClass.M1: Decimal("5.0"),
        WeightClass.M2: Decimal("16"),
        WeightClass.M3: Decimal("50"),
    },
    Decimal("50"): {
        WeightClass.E1: Decimal("0.03"),
        WeightClass.E2: Decimal("0.10"),
        WeightClass.F1: Decimal("0.30"),
        WeightClass.F2: Decimal("1.0"),
        WeightClass.M1: Decimal("3.0"),
        WeightClass.M2: Decimal("10"),
        WeightClass.M3: Decimal("30"),
    },
    Decimal("20"): {
        WeightClass.E1: Decimal("0.02"),
        WeightClass.E2: Decimal("0.08"),
        WeightClass.F1: Decimal("0.25"),
        WeightClass.F2: Decimal("0.80"),
        WeightClass.M1: Decimal("2.5"),
        WeightClass.M2: Decimal("8.0"),
        WeightClass.M3: Decimal("25"),
    },
    Decimal("10"): {
        WeightClass.E1: Decimal("0.02"),
        WeightClass.E2: Decimal("0.06"),
        WeightClass.F1: Decimal("0.20"),
        WeightClass.F2: Decimal("0.60"),
        WeightClass.M1: Decimal("2.0"),
        WeightClass.M2: Decimal("6.0"),
        WeightClass.M3: Decimal("20"),
    },
    Decimal("5"): {
        WeightClass.E1: Decimal("0.016"),
        WeightClass.E2: Decimal("0.05"),
        WeightClass.F1: Decimal("0.16"),
        WeightClass.F2: Decimal("0.50"),
        WeightClass.M1: Decimal("1.6"),
        WeightClass.M2: Decimal("5.0"),
        WeightClass.M3: Decimal("16"),
    },
    Decimal("2"): {
        WeightClass.E1: Decimal("0.012"),
        WeightClass.E2: Decimal("0.04"),
        WeightClass.F1: Decimal("0.12"),
        WeightClass.F2: Decimal("0.40"),
        WeightClass.M1: Decimal("1.2"),
        WeightClass.M2: Decimal("4.0"),
        WeightClass.M3: Decimal("12"),
    },
    Decimal("1"): {
        WeightClass.E1: Decimal("0.010"),
        WeightClass.E2: Decimal("0.03"),
        WeightClass.F1: Decimal("0.10"),
        WeightClass.F2: Decimal("0.30"),
        WeightClass.M1: Decimal("1.0"),
        WeightClass.M2: Decimal("3.0"),
        WeightClass.M3: Decimal("10"),
    },
    # Sub-gram fractional weights: 500 mg to 1 mg (nominal expressed in grams)
    Decimal("0.5"): {
        WeightClass.E1: Decimal("0.008"),
        WeightClass.E2: Decimal("0.025"),
        WeightClass.F1: Decimal("0.08"),
        WeightClass.F2: Decimal("0.25"),
        WeightClass.M1: Decimal("0.8"),
        WeightClass.M2: Decimal("2.5"),
    },
    Decimal("0.2"): {
        WeightClass.E1: Decimal("0.006"),
        WeightClass.E2: Decimal("0.020"),
        WeightClass.F1: Decimal("0.06"),
        WeightClass.F2: Decimal("0.20"),
        WeightClass.M1: Decimal("0.6"),
        WeightClass.M2: Decimal("2.0"),
    },
    Decimal("0.1"): {
        WeightClass.E1: Decimal("0.005"),
        WeightClass.E2: Decimal("0.016"),
        WeightClass.F1: Decimal("0.05"),
        WeightClass.F2: Decimal("0.16"),
        WeightClass.M1: Decimal("0.5"),
        WeightClass.M2: Decimal("1.6"),
    },
    Decimal("0.05"): {
        WeightClass.E1: Decimal("0.004"),
        WeightClass.E2: Decimal("0.012"),
        WeightClass.F1: Decimal("0.04"),
        WeightClass.F2: Decimal("0.12"),
        WeightClass.M1: Decimal("0.4"),
    },
    Decimal("0.02"): {
        WeightClass.E1: Decimal("0.003"),
        WeightClass.E2: Decimal("0.010"),
        WeightClass.F1: Decimal("0.03"),
        WeightClass.F2: Decimal("0.10"),
        WeightClass.M1: Decimal("0.3"),
    },
    Decimal("0.01"): {
        WeightClass.E1: Decimal("0.003"),
        WeightClass.E2: Decimal("0.008"),
        WeightClass.F1: Decimal("0.025"),
        WeightClass.F2: Decimal("0.08"),
        WeightClass.M1: Decimal("0.25"),
    },
    Decimal("0.005"): {
        WeightClass.E1: Decimal("0.003"),
        WeightClass.E2: Decimal("0.006"),
        WeightClass.F1: Decimal("0.020"),
        WeightClass.F2: Decimal("0.06"),
        WeightClass.M1: Decimal("0.20"),
    },
    Decimal("0.002"): {
        WeightClass.E1: Decimal("0.003"),
        WeightClass.E2: Decimal("0.006"),
        WeightClass.F1: Decimal("0.020"),
        WeightClass.F2: Decimal("0.06"),
        WeightClass.M1: Decimal("0.20"),
    },
    Decimal("0.001"): {
        WeightClass.E1: Decimal("0.003"),
        WeightClass.E2: Decimal("0.006"),
        WeightClass.F1: Decimal("0.020"),
        WeightClass.F2: Decimal("0.06"),
        WeightClass.M1: Decimal("0.20"),
    },
}

OIML_R111_TABLE_1_MPE_MG: Final[dict[Decimal, dict[WeightClass, Decimal]]] = OIML_R111_TABLE_1_MG


# ============================================================================
# Exceptions
# ============================================================================


class TraceabilityError(Exception):
    """Base exception for legal metrology traceability violations."""


class TraceabilityLockoutError(TraceabilityError):
    """Hard metrological lockout error preventing test execution or approval."""

    def __init__(
        self,
        message: str,
        validation_result: TraceabilityValidationResult | None = None,
        session_id: str | None = None,
    ) -> None:
        super().__init__(message)
        self.message = message
        self.validation_result = validation_result
        self.session_id = session_id

    @property
    def is_locked(self) -> bool:
        """Always True for lockout exceptions."""
        return True

    @property
    def weight_set_code(self) -> str | None:
        """Identification code of the offending standard weight set."""
        return self.validation_result.weight_set_code if self.validation_result else None

    @property
    def lockout_reasons(self) -> list[LockoutReason]:
        """List of statutory triggers causing this lockout."""
        return self.validation_result.lockout_reasons if self.validation_result else []


# ============================================================================
# Pydantic Schemas
# ============================================================================


class StandardWeightSetInput(MetrologyBaseModel):
    """Input contract for standard weight set equipment specifications."""

    identification_code: str = Field(
        ...,
        description="Unique laboratory equipment tag / serial number, e.g. 'RRSL-BLR-F1-002'.",
    )
    weight_class: WeightClass = Field(
        ...,
        description="OIML R 111-1 accuracy class (E1, E2, F1, F2, M1, M2, M3).",
    )
    calibration_certificate_number: str = Field(
        ...,
        description="Official calibration certificate identifier issued by NMI/RRSL/NABL lab.",
    )
    calibrated_by: str = Field(
        ...,
        description="Issuing calibration laboratory (e.g. 'NPL India' or 'RRSL Bangalore').",
    )
    calibration_date: datetime | date = Field(
        ...,
        description="Date of calibration certificate issue.",
    )
    validity_date: datetime | date = Field(
        ...,
        description="Date of calibration certificate expiry.",
    )
    nominal_min_value: Decimal = Field(
        ...,
        gt=ZERO_DECIMAL,
        description="Smallest individual standard weight in set.",
    )
    nominal_max_value: Decimal = Field(
        ...,
        gt=ZERO_DECIMAL,
        description="Largest cumulative standard weight capacity available in set.",
    )
    unit: UnitOfMeasure = Field(
        default=UnitOfMeasure.KILOGRAM,
        description="Unit of measurement for nominal values.",
    )
    expanded_uncertainty_k2: Decimal | None = Field(
        default=None,
        ge=ZERO_DECIMAL,
        description="Stated expanded uncertainty U (k=2, 95% confidence) in same unit as weights.",
    )
    is_active: bool = Field(
        default=True,
        description="True if equipment is currently active and commissioned in lab registry.",
    )
    laboratory_id: str | None = Field(
        default=None,
        description="Owning laboratory UUID.",
    )


class UncertaintyEvaluationPoint(MetrologyBaseModel):
    """Evaluation of standard weight uncertainty compliance at a specific load point."""

    load: Decimal = Field(
        ...,
        description="Nominal test load applied.",
    )
    unit: UnitOfMeasure = Field(
        ...,
        description="Unit of measurement.",
    )
    instrument_mpe: Decimal = Field(
        ...,
        description="Absolute maximum permissible error of instrument at this load.",
    )
    allowable_uncertainty: Decimal = Field(
        ...,
        description="Statutory maximum allowable weight uncertainty: (1/3) * MPE.",
    )
    weight_uncertainty: Decimal = Field(
        ...,
        description="Effective expanded uncertainty U (k=2) of the standard weights.",
    )
    uncertainty_ratio: Decimal = Field(
        ...,
        description="Calculated ratio: U / MPE (must be <= 0.333333).",
    )
    margin: Decimal = Field(
        ...,
        description="Compliance margin: allowable_uncertainty - weight_uncertainty.",
    )
    is_compliant: bool = Field(
        ...,
        description="True if U <= (1/3) * MPE.",
    )
    status: ComplianceStatus = Field(
        ...,
        description="Verdict for this test point (PASS / MARGINAL / FAIL).",
    )
    latex_formula: str = Field(
        ...,
        description="LaTeX formula documenting the 1/3 uncertainty test.",
    )


class TraceabilityValidationResult(MetrologyBaseModel):
    """Complete statutory traceability verification report and lockout declaration."""

    is_locked: bool = Field(
        ...,
        description="True if workspace is hard-locked due to any traceability violation.",
    )
    status: TraceabilityStatus = Field(
        ...,
        description="Statutory status (VERIFIED / WARNING / LOCKED_OUT).",
    )
    lockout_reasons: list[LockoutReason] = Field(
        default_factory=list,
        description="Enum list of triggers that caused the hard lockout.",
    )
    violations: list[str] = Field(
        default_factory=list,
        description="Human-readable statutory violation details for inspector audit.",
    )
    warnings: list[str] = Field(
        default_factory=list,
        description="Advisory warnings (e.g. expiring within 30 days).",
    )
    weight_set_code: str = Field(
        ...,
        description="Standard weight set identification code.",
    )
    weight_class: WeightClass = Field(
        ...,
        description="Standard weight accuracy class.",
    )
    instrument_class: AccuracyClass = Field(
        ...,
        description="Declared accuracy class of the instrument under test.",
    )
    class_adequate: bool = Field(
        ...,
        description="True if weight class satisfies R 76-1 Clause 3.7.1 adequacy rules.",
    )
    certificate_valid: bool = Field(
        ...,
        description="True if calibration certificate is active, valid, and not expired.",
    )
    days_until_expiry: int = Field(
        ...,
        description="Days remaining until certificate expiry (negative if expired).",
    )
    is_expired: bool = Field(
        ...,
        description="True if calibration certificate has expired as of test date.",
    )
    expanded_uncertainty: Decimal = Field(
        ...,
        description="Declared or derived expanded uncertainty U (k=2).",
    )
    critical_mpe: Decimal = Field(
        ...,
        description="Smallest critical MPE of the instrument (typically at Min or 500e).",
    )
    allowable_uncertainty: Decimal = Field(
        ...,
        description="Maximum allowable expanded uncertainty: (1/3) * critical_mpe.",
    )
    uncertainty_ratio: Decimal = Field(
        ...,
        description="Ratio of U / critical_mpe.",
    )
    uncertainty_compliant: bool = Field(
        ...,
        description="True if expanded uncertainty satisfies U <= (1/3) * MPE.",
    )
    range_covered: bool = Field(
        ...,
        description="True if weight set capacity range covers the required test load range.",
    )
    evaluated_points: list[UncertaintyEvaluationPoint] = Field(
        default_factory=list,
        description="Load-by-load uncertainty evaluations if specific test loads were checked.",
    )
    latex_formula: str = Field(
        ...,
        description="Summary LaTeX formula for calibration certificate and test report.",
    )
    summary_message: str = Field(
        ...,
        description="Actionable statutory verdict or lockout message for UI banner.",
    )


# ============================================================================
# Datetime Normalization Helper
# ============================================================================


def _normalize_to_utc_datetime(dt_or_d: datetime | date | None) -> datetime:
    """Losslessly convert date or datetime to timezone-aware UTC datetime.

    Prevents Python TypeError: can't compare offset-naive and offset-aware datetimes.
    """
    if dt_or_d is None:
        return datetime.now(UTC)
    if isinstance(dt_or_d, datetime):
        if dt_or_d.tzinfo is None:
            return dt_or_d.replace(tzinfo=UTC)
        return dt_or_d.astimezone(UTC)
    # Plain date: convert to midnight UTC
    return datetime(dt_or_d.year, dt_or_d.month, dt_or_d.day, tzinfo=UTC)


# ============================================================================
# Unit Conversion Helper
# ============================================================================


def convert_mass(value: Decimal, from_unit: UnitOfMeasure, to_unit: UnitOfMeasure) -> Decimal:
    """Convert mass measurement between legal SI units with exact Decimal precision."""
    if from_unit == to_unit:
        return value
    val_dec = to_decimal(value)
    kg_val = val_dec * UNIT_TO_KG_FACTORS[from_unit]
    return kg_val / UNIT_TO_KG_FACTORS[to_unit]


# ============================================================================
# Core Metrological Rules
# ============================================================================


def check_weight_class_adequacy(
    weight_class: WeightClass,
    instrument_class: AccuracyClass,
    has_verified_uncertainty: bool = False,
) -> tuple[bool, str | None]:
    """Check standard weight class adequacy per OIML R 76-1 Clause 3.7.1.

    Statutory Adequacy Hierarchy:
    - Class I (Special Accuracy):
      Requires Class E1 or E2 standards. F1, F2, M1, M2, M3 are strictly inadequate.
    - Class II (High Accuracy):
      Requires Class E1, E2, or F1 standards.
      Class F2 is conditionally allowed ONLY IF expanded uncertainty U <= (1/3)*MPE is verified.
      Class M1, M2, M3 are strictly inadequate.
    - Class III (Medium Accuracy):
      Requires Class E1, E2, F1, F2, or M1 standards.
      Class M2 is conditionally allowed ONLY IF expanded uncertainty U <= (1/3)*MPE is verified.
      Class M3 is strictly inadequate.
    - Class IIII (Ordinary Accuracy):
      Allows Class M1, M2, M3 (and any higher class).

    Returns:
        tuple of (is_adequate: bool, violation_message: str | None)
    """
    w_rank = weight_class.rank

    if instrument_class == AccuracyClass.CLASS_I:
        if w_rank <= WeightClass.E2.rank:
            return True, None
        err = (
            f"Weight Class '{weight_class.value}' is legally inadequate for Class I "
            f"(Special Accuracy) instruments. OIML R 76-1 Clause 3.7.1 mandates Class E1 or E2 "
            f"reference standards."
        )
        return False, err

    if instrument_class == AccuracyClass.CLASS_II:
        if w_rank <= WeightClass.F1.rank:
            return True, None
        if w_rank == WeightClass.F2.rank:
            if has_verified_uncertainty:
                return True, None
            err = (
                "Weight Class 'F2' on Class II (High Accuracy) instruments is conditional: "
                "expanded calibration uncertainty must satisfy U <= (1/3)*MPE per Clause 3.7.1."
            )
            return False, err
        err = (
            f"Weight Class '{weight_class.value}' is legally inadequate for Class II "
            "(High Accuracy) instruments. OIML R 76-1 Clause 3.7.1 requires Class E2 or "
            "F1 standards."
        )
        return False, err

    if instrument_class == AccuracyClass.CLASS_III:
        if w_rank <= WeightClass.M1.rank:
            return True, None
        if w_rank == WeightClass.M2.rank:
            if has_verified_uncertainty:
                return True, None
            err = (
                "Weight Class 'M2' on Class III (Medium Accuracy) instruments is conditional: "
                "expanded calibration uncertainty must satisfy U <= (1/3)*MPE per Clause 3.7.1."
            )
            return False, err
        err = (
            f"Weight Class '{weight_class.value}' is legally inadequate for Class III "
            f"(Medium Accuracy) instruments. OIML R 76-1 Clause 3.7.1 requires Class M1 or better."
        )
        return False, err

    if instrument_class == AccuracyClass.CLASS_IIII:
        if w_rank <= WeightClass.M3.rank:
            return True, None
        err = f"Weight Class '{weight_class.value}' is invalid."
        return False, err

    return False, f"Unknown instrument accuracy class: '{instrument_class}'."


def check_calibration_validity(
    validity_date: datetime | date,
    calibration_date: datetime | date | None = None,
    as_of_date: datetime | date | None = None,
) -> tuple[bool, int, str | None]:
    """Check calibration certificate temporal validity.

    Args:
        validity_date: Expiration timestamp of the certificate.
        calibration_date: Date certificate was issued.
        as_of_date: Evaluation reference timestamp (defaults to current UTC).

    Returns:
        tuple of (is_valid: bool, days_until_expiry: int, message: str | None)
    """
    ref_dt = _normalize_to_utc_datetime(as_of_date)
    val_dt = _normalize_to_utc_datetime(validity_date)

    if calibration_date is not None:
        cal_dt = _normalize_to_utc_datetime(calibration_date)
        if cal_dt > ref_dt:
            delta_fut = (cal_dt - ref_dt).days
            return (
                False,
                0,
                f"Calibration issue date ({cal_dt.date()}) is in the future by {delta_fut} days.",
            )

    time_diff = val_dt - ref_dt
    days_left = time_diff.days

    if ref_dt > val_dt:
        days_expired = abs(days_left)
        return (
            False,
            days_left,
            f"Calibration certificate expired on {val_dt.date()} ({days_expired} days ago). "
            f"Traceability is legally void under Legal Metrology Rules.",
        )

    return True, days_left, None


def lookup_oiml_r111_mpe(
    nominal_mass: Decimal,
    weight_class: WeightClass,
    unit: UnitOfMeasure = UnitOfMeasure.KILOGRAM,
) -> Decimal:
    """Lookup maximum permissible error delta_m for a standard weight per OIML R 111-1 Table 1.

    Args:
        nominal_mass: Nominal mass value in the specified unit.
        weight_class: OIML R 111 accuracy class.
        unit: Unit of nominal_mass.

    Returns:
        delta_m expressed in the specified unit.
    """
    mass_g = convert_mass(nominal_mass, from_unit=unit, to_unit=UnitOfMeasure.GRAM)

    # Find matching row in Table 1 or nearest standard step
    table_keys = sorted(OIML_R111_TABLE_1_MG.keys())
    matched_key: Decimal | None = None

    for k in table_keys:
        if abs(mass_g - k) <= (Decimal("0.001") * k):
            matched_key = k
            break

    if matched_key is None:
        # Fallback to nearest nominal key
        matched_key = min(table_keys, key=lambda k: abs(k - mass_g))

    class_mpe_map = OIML_R111_TABLE_1_MG[matched_key]
    if weight_class in class_mpe_map:
        mpe_mg = class_mpe_map[weight_class]
    else:
        # If class not defined for heavy weights (e.g. E1 above 50 kg), extrapolate or take M3
        mpe_mg = class_mpe_map[min(class_mpe_map.keys(), key=lambda c: c.rank)]

    # Convert mg to requested unit
    return convert_mass(mpe_mg, from_unit=UnitOfMeasure.MILLIGRAM, to_unit=unit)


def lookup_oiml_r111_default_uncertainty(
    nominal_mass: Decimal,
    weight_class: WeightClass,
    unit: UnitOfMeasure = UnitOfMeasure.KILOGRAM,
) -> Decimal:
    """Calculate default expanded uncertainty U = (1/3) * delta_m per OIML R 111-1 Clause 5.2.

    Returns:
        Expanded uncertainty U (k=2) in the specified unit.
    """
    delta_m = lookup_oiml_r111_mpe(nominal_mass=nominal_mass, weight_class=weight_class, unit=unit)
    return delta_m * ONE_THIRD_FACTOR


def calculate_critical_allowable_uncertainty(
    spec: InstrumentSpecification,
    stage: VerificationStage = VerificationStage.INITIAL_TYPE_APPROVAL,
    rulepack: RulePack | None = None,
) -> tuple[Decimal, Decimal]:
    """Calculate the smallest critical MPE and allowable weight uncertainty (1/3 * MPE).

    Statutory Requirement (OIML R 76-1 Clause 3.7.1):
    The standard weights must satisfy U <= (1/3) * MPE at all test loads.
    The most stringent constraint occurs at the smallest non-zero load (Min capacity or 500e),
    where MPE is +/- 0.5e (Initial Verification).

    Returns:
        tuple of (critical_mpe: Decimal, allowable_uncertainty: Decimal)
    """
    e_dec = to_decimal(spec.e)
    min_load = to_decimal(spec.min_capacity)
    active_rp = rulepack or default_rulepack_manager.get_active_rulepack()

    # Query MPE at Min capacity
    if active_rp is not None:
        mpe_res = active_rp.calculate_mpe(
            load=min_load,
            e=e_dec,
            accuracy_class=spec.accuracy_class,
            stage=stage,
        )
    else:
        mpe_res = resolve_mpe(
            load=min_load,
            e=e_dec,
            accuracy_class=spec.accuracy_class,
            stage=stage,
        )

    crit_mpe = mpe_res.mpe_value
    allowable_u = crit_mpe * ONE_THIRD_FACTOR
    return crit_mpe, allowable_u


def evaluate_uncertainty_at_load(
    load: Decimal,
    weight_uncertainty: Decimal,
    spec: InstrumentSpecification,
    stage: VerificationStage = VerificationStage.INITIAL_TYPE_APPROVAL,
    rulepack: RulePack | None = None,
) -> UncertaintyEvaluationPoint:
    """Evaluate standard weight uncertainty compliance at a specific test load.

    Formula:
        Allowable U = (1/3) * |MPE(L)|
        Check: U <= Allowable U
    """
    l_dec = to_decimal(load)
    u_dec = to_decimal(weight_uncertainty)
    e_dec = to_decimal(spec.e)
    active_rp = rulepack or default_rulepack_manager.get_active_rulepack()

    if active_rp is not None:
        mpe_res = active_rp.calculate_mpe(
            load=l_dec,
            e=e_dec,
            accuracy_class=spec.accuracy_class,
            stage=stage,
        )
    else:
        mpe_res = resolve_mpe(
            load=l_dec,
            e=e_dec,
            accuracy_class=spec.accuracy_class,
            stage=stage,
        )

    inst_mpe = mpe_res.mpe_value
    allowable_u = inst_mpe * ONE_THIRD_FACTOR
    margin = allowable_u - u_dec
    ratio = u_dec / inst_mpe if inst_mpe > ZERO_DECIMAL else ZERO_DECIMAL

    if margin > ZERO_DECIMAL:
        status = ComplianceStatus.PASS
        is_comp = True
    elif margin == ZERO_DECIMAL:
        status = ComplianceStatus.MARGINAL
        is_comp = True
    else:
        status = ComplianceStatus.FAIL
        is_comp = False

    latex = (
        rf"U = {format_decimal_for_latex(u_dec)} \, \text{{{spec.unit.symbol}}}, \quad "
        rf"\text{{MPE}}({l_dec}) = {format_decimal_for_latex(inst_mpe)}, \quad "
        rf"\frac{{1}}{{3}}\text{{MPE}} = {format_decimal_for_latex(allowable_u)}, \quad "
        rf"\frac{{U}}{{\text{{MPE}}}} = {ratio:.3f} \le \frac{{1}}{{3}} "
        rf"\implies \text{{{status.value}}}"
    )

    return UncertaintyEvaluationPoint(
        load=l_dec,
        unit=spec.unit,
        instrument_mpe=inst_mpe,
        allowable_uncertainty=allowable_u,
        weight_uncertainty=u_dec,
        uncertainty_ratio=ratio,
        margin=margin,
        is_compliant=is_comp,
        status=status,
        latex_formula=latex,
    )


# ============================================================================
# Main Validation Engine
# ============================================================================


def validate_standard_weight_set(
    weight_set: StandardWeightSetInput | dict[str, object] | object,
    spec: InstrumentSpecification,
    test_loads: Sequence[Decimal] | None = None,
    test_load_min: Decimal | None = None,
    test_load_max: Decimal | None = None,
    as_of_date: datetime | date | None = None,
    stage: VerificationStage = VerificationStage.INITIAL_TYPE_APPROVAL,
    rulepack: RulePack | None = None,
) -> TraceabilityValidationResult:
    """Validate standard weight set conformity to OIML R 111 & R 76-1 Clause 3.7.1.

    Executes 5 statutory checks:
    1. Commissioned/active status in laboratory registry.
    2. Reference standard accuracy class adequacy (E1, E2, F1, F2, M1, M2, M3).
    3. Calibration certificate validity & expiry dates.
    4. One-third uncertainty rule: U(k=2) <= (1/3) * MPE.
    5. Nominal range coverage of required test loads.

    If any validation check fails, sets `is_locked = True` (metrological hard lockout).

    Args:
        weight_set: StandardWeightSetInput, ORM StandardWeightSet model, or dict.
        spec: Declared instrument specifications.
        test_loads: Optional list of test loads to check individually.
        test_load_min: Optional minimum test load required (defaults to spec.min_capacity).
        test_load_max: Optional maximum test load required (defaults to spec.max_capacity).
        as_of_date: Test evaluation date (defaults to current UTC/IST).
        stage: Initial verification vs in-service inspection.
        rulepack: Active metrological RulePack.

    Returns:
        TraceabilityValidationResult with complete diagnostics and hard lockout verdict.
    """
    # Normalize input
    if isinstance(weight_set, dict):
        ws = StandardWeightSetInput(**weight_set)
    elif hasattr(weight_set, "identification_code") and not isinstance(
        weight_set, StandardWeightSetInput
    ):
        # Extract from ORM model or duck-typed object
        ws = StandardWeightSetInput(
            identification_code=weight_set.identification_code,
            weight_class=weight_set.weight_class,
            calibration_certificate_number=getattr(
                weight_set, "calibration_certificate_number", "UNKNOWN-CERT"
            ),
            calibrated_by=getattr(weight_set, "calibrated_by", "Statutory Metrology Lab"),
            calibration_date=weight_set.calibration_date,
            validity_date=weight_set.validity_date,
            nominal_min_value=weight_set.nominal_min_value,
            nominal_max_value=weight_set.nominal_max_value,
            unit=getattr(weight_set, "unit", spec.unit),
            expanded_uncertainty_k2=getattr(weight_set, "expanded_uncertainty_k2", None),
            is_active=getattr(weight_set, "is_active", True),
            laboratory_id=getattr(weight_set, "laboratory_id", None),
        )
    else:
        ws = weight_set

    violations: list[str] = []
    warnings: list[str] = []
    lockout_reasons: list[LockoutReason] = []

    # 1. Active Commissioning Check
    if not ws.is_active:
        violations.append(
            f"Standard weight set '{ws.identification_code}' is marked inactive / decommissioned "
            f"in the laboratory equipment registry."
        )
        lockout_reasons.append(LockoutReason.INACTIVE_WEIGHT_SET)

    # Certificate presence check
    if not ws.calibration_certificate_number or not ws.calibration_certificate_number.strip():
        violations.append(
            f"Standard weight set '{ws.identification_code}' is missing a valid calibration "
            f"certificate number."
        )
        lockout_reasons.append(LockoutReason.MISSING_CERTIFICATE)

    # 2. Calibration Expiry & Future-Date Check
    cert_valid, days_left, cal_err = check_calibration_validity(
        validity_date=ws.validity_date,
        calibration_date=ws.calibration_date,
        as_of_date=as_of_date,
    )
    is_expired = not cert_valid and days_left < 0

    if not cert_valid:
        if is_expired:
            violations.append(cal_err or "Calibration certificate expired.")
            lockout_reasons.append(LockoutReason.CALIBRATION_EXPIRED)
        else:
            violations.append(cal_err or "Calibration date error.")
            lockout_reasons.append(LockoutReason.CALIBRATION_FUTURE_DATE)
    elif days_left <= EXPIRY_WARNING_THRESHOLD_DAYS:
        warnings.append(
            f"Calibration certificate '{ws.calibration_certificate_number}' expires in "
            f"{days_left} days. Recalibration scheduled notice."
        )

    # 3. Class Adequacy Check
    # First evaluate if uncertainty is explicitly known and complies
    crit_mpe, allowable_u = calculate_critical_allowable_uncertainty(
        spec=spec, stage=stage, rulepack=rulepack
    )

    # Convert declared expanded uncertainty to instrument unit
    if ws.expanded_uncertainty_k2 is not None:
        effective_u = convert_mass(
            ws.expanded_uncertainty_k2, from_unit=ws.unit, to_unit=spec.unit
        )
    else:
        # Derive default uncertainty from R 111 Table 1 at nominal min load
        derived_u = lookup_oiml_r111_default_uncertainty(
            nominal_mass=ws.nominal_min_value,
            weight_class=ws.weight_class,
            unit=ws.unit,
        )
        effective_u = convert_mass(derived_u, from_unit=ws.unit, to_unit=spec.unit)

    u_ratio = effective_u / crit_mpe if crit_mpe > ZERO_DECIMAL else ZERO_DECIMAL
    u_compliant = effective_u <= allowable_u

    class_ok, class_err = check_weight_class_adequacy(
        weight_class=ws.weight_class,
        instrument_class=spec.accuracy_class,
        has_verified_uncertainty=u_compliant,
    )

    if not class_ok:
        violations.append(class_err or "Weight class inadequate.")
        lockout_reasons.append(LockoutReason.INADEQUATE_WEIGHT_CLASS)

    # 4. Uncertainty Compliance Check (U <= 1/3 * MPE)
    if not u_compliant:
        violations.append(
            f"Traceability Error: Standard weights expanded uncertainty U ({effective_u} "
            f"{spec.unit.symbol}) exceeds 1/3 MPE ({allowable_u:.6f} {spec.unit.symbol}). "
            f"Ratio: {u_ratio:.1%}. Clause 3.7.1 Violation."
        )
        lockout_reasons.append(LockoutReason.EXCESSIVE_UNCERTAINTY)

    # 5. Nominal Range Coverage Check
    req_min = test_load_min if test_load_min is not None else spec.min_capacity
    req_max = test_load_max if test_load_max is not None else spec.max_capacity

    ws_min_in_spec_unit = convert_mass(ws.nominal_min_value, from_unit=ws.unit, to_unit=spec.unit)
    ws_max_in_spec_unit = convert_mass(ws.nominal_max_value, from_unit=ws.unit, to_unit=spec.unit)

    range_covered = True
    if ws_min_in_spec_unit > req_min:
        violations.append(
            f"Weight set minimum capacity ({ws.nominal_min_value} {ws.unit.symbol} = "
            f"{ws_min_in_spec_unit} {spec.unit.symbol}) cannot cover required minimum test load "
            f"({req_min} {spec.unit.symbol})."
        )
        lockout_reasons.append(LockoutReason.INSUFFICIENT_RANGE)
        range_covered = False

    if ws_max_in_spec_unit < req_max:
        violations.append(
            f"Weight set maximum capacity ({ws.nominal_max_value} {ws.unit.symbol} = "
            f"{ws_max_in_spec_unit} {spec.unit.symbol}) cannot cover required maximum test load "
            f"({req_max} {spec.unit.symbol})."
        )
        lockout_reasons.append(LockoutReason.INSUFFICIENT_RANGE)
        range_covered = False

    # 6. Evaluate Individual Load Points if provided
    evaluated_pts: list[UncertaintyEvaluationPoint] = []
    if test_loads:
        for t_load in test_loads:
            pt = evaluate_uncertainty_at_load(
                load=t_load,
                weight_uncertainty=effective_u,
                spec=spec,
                stage=stage,
                rulepack=rulepack,
            )
            evaluated_pts.append(pt)
            if not pt.is_compliant:
                violations.append(
                    f"Test load {t_load} {spec.unit.symbol}: Weight uncertainty exceeds 1/3 MPE."
                )
                if LockoutReason.EXCESSIVE_UNCERTAINTY not in lockout_reasons:
                    lockout_reasons.append(LockoutReason.EXCESSIVE_UNCERTAINTY)

    # Synthesize Final Verdict
    is_locked = len(violations) > 0
    if is_locked:
        status = TraceabilityStatus.LOCKED_OUT
        summary_msg = (
            f"HARD METROLOGICAL LOCKOUT: Standard weight set '{ws.identification_code}' "
            f"failed traceability verification ({len(violations)} statutory violation(s)). "
            f"Primary cause: {lockout_reasons[0].value}. Session workspace is locked."
        )
    elif warnings:
        status = TraceabilityStatus.WARNING
        summary_msg = (
            f"TRACEABILITY VERIFIED (WITH WARNINGS): Standard weight set "
            f"'{ws.identification_code}' is compliant. {warnings[0]}"
        )
    else:
        status = TraceabilityStatus.VERIFIED
        summary_msg = (
            f"TRACEABILITY VERIFIED: Standard weight set '{ws.identification_code}' "
            f"(Class {ws.weight_class.value}, Cert: {ws.calibration_certificate_number}) "
            f"fully satisfies OIML R 111 & R 76-1 Clause 3.7.1."
        )

    latex = (
        rf"\text{{Traceability: }} \text{{{ws.identification_code}}} "
        rf"(\text{{Class {ws.weight_class.value}}}), "
        rf"\quad U = {format_decimal_for_latex(effective_u)} \le \frac{{1}}{{3}}\text{{MPE}} "
        rf"({format_decimal_for_latex(allowable_u)}), \quad "
        rf"\text{{Status: }} \text{{{status.value}}}"
    )

    return TraceabilityValidationResult(
        is_locked=is_locked,
        status=status,
        lockout_reasons=lockout_reasons,
        violations=violations,
        warnings=warnings,
        weight_set_code=ws.identification_code,
        weight_class=ws.weight_class,
        instrument_class=spec.accuracy_class,
        class_adequate=class_ok,
        certificate_valid=cert_valid,
        days_until_expiry=days_left,
        is_expired=is_expired,
        expanded_uncertainty=effective_u,
        critical_mpe=crit_mpe,
        allowable_uncertainty=allowable_u,
        uncertainty_ratio=u_ratio,
        uncertainty_compliant=u_compliant,
        range_covered=range_covered,
        evaluated_points=evaluated_pts,
        latex_formula=latex,
        summary_message=summary_msg,
    )


def enforce_traceability_lockout(
    validation_result: TraceabilityValidationResult,
    session_id: str | None = None,
) -> None:
    """Hard-lock execution gate.

    Raises:
        TraceabilityLockoutError if the validation result is locked.
    """
    if validation_result.is_locked:
        viol_summary = "; ".join(validation_result.violations)
        raise TraceabilityLockoutError(
            message=(
                f"HARD METROLOGICAL LOCKOUT: Test session cannot proceed with standard "
                f"weight set '{validation_result.weight_set_code}'. Violations: {viol_summary}"
            ),
            validation_result=validation_result,
            session_id=session_id,
        )
