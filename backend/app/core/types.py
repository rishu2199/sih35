"""
METROLOGIX-76 — Core Metrological Types & Lossless Decimal Abstractions.

Statutory Authorities & Technical References:
- OIML R 76-1:2006 (E) "Non-automatic weighing instruments - Part 1"
- Legal Metrology Act, 2009 (Act No. 1 of 2010), Sections 15, 24, 52
- Legal Metrology (General) Rules, 2011, Seventh Schedule, Heading A
- Legal Metrology (General) Fourth Amendment Rules, 2026 (G.S.R. 568(E))
- Department of Consumer Affairs (DoCA), SIH Problem Statement 26035
"""

from __future__ import annotations

from decimal import Decimal, InvalidOperation
from enum import Enum
from typing import Annotated

from pydantic import BeforeValidator, PlainSerializer

# ============================================================================
# 1. Metrology Decimal: Strict Floating-Point Inaccuracy Prevention
# ============================================================================


def validate_metrology_decimal(v: object) -> Decimal:
    """
    Validate and coerce input to Decimal under zero-bug metrology rules.

    Zero-Bug Rule:
        Python `float` types are STRICTLY PROHIBITED in legal metrology calculations
        because binary IEEE 754 floating-point representations introduce precision
        loss (e.g., 0.1 + 0.2 != 0.3). All inputs must be supplied as `str`, `int`,
        or `decimal.Decimal`.

    Args:
        v: The raw value to validate.

    Returns:
        Exact Decimal representation.

    Raises:
        TypeError: If a Python `float` or unsupported type is passed.
        ValueError: If value is NaN, infinite, or an unparseable string.
    """
    if isinstance(v, float):
        raise ValueError(
            f"Float value {v!r} is strictly prohibited in legal metrology to prevent "
            f"IEEE 754 precision loss. Provide the measurement as str (e.g. '{v}'), "
            f"int, or decimal.Decimal."
        )

    if isinstance(v, Decimal):
        if v.is_nan() or v.is_infinite():
            raise ValueError(f"NaN or Infinite Decimal {v!r} is invalid in legal metrology.")
        return v

    if isinstance(v, int):
        return Decimal(v)

    if isinstance(v, str):
        cleaned = v.strip()
        if not cleaned:
            raise ValueError("Empty string cannot be parsed as a legal metrology Decimal.")
        try:
            d = Decimal(cleaned)
            if d.is_nan() or d.is_infinite():
                raise ValueError(f"Decimal string '{cleaned}' resolved to NaN or Infinity.")
            return d
        except InvalidOperation as e:
            raise ValueError(f"Invalid decimal literal for legal metrology: '{cleaned}'") from e

    raise ValueError(
        f"Unsupported type '{type(v).__name__}' for legal metrology Decimal. "
        f"Expected str, int, or Decimal."
    )


def serialize_metrology_decimal(d: Decimal) -> str:
    """
    Serialize Decimal to exact string in JSON contracts.

    Prevents frontend JSON parsers from corrupting precision via IEEE 754 float cast.
    """
    if d is None:
        return ""
    # Format normal decimal representation (no scientific notation for typical scale intervals)
    return str(d)


MetrologyDecimal = Annotated[
    Decimal,
    BeforeValidator(validate_metrology_decimal),
    PlainSerializer(serialize_metrology_decimal, return_type=str, when_used="json-unless-none"),
]


def to_decimal(val: object) -> Decimal:
    """
    Convenience function for pure-Python domain logic outside Pydantic models.

    Guarantees the exact same validation rules as MetrologyDecimal.
    """
    return validate_metrology_decimal(val)


# ============================================================================
# 2. AccuracyClass: OIML R 76-1 / Seventh Schedule Classification
# ============================================================================


class AccuracyClass(str, Enum):
    """
    Accuracy classes for Non-Automatic Weighing Instruments (NAWI).

    Statutory Reference:
    - OIML R 76-1:2006 Clause 3.2, Table 3
    - Legal Metrology (General) Rules, 2011, Seventh Schedule, Heading A, Table 17
    """

    CLASS_I = "CLASS_I"  # Special Accuracy / विशेष यथार्थता (e.g. Lab Balances)
    CLASS_II = "CLASS_II"  # High Accuracy / उच्च यथार्थता (e.g. Precision Scales)
    CLASS_III = "CLASS_III"  # Medium Accuracy / मध्यम यथार्थता (e.g. Commercial Platforms)
    CLASS_IIII = "CLASS_IIII"  # Ordinary Accuracy / साधारण यथार्थता (e.g. Coarse Scales)

    @property
    def roman(self) -> str:
        """Roman numeral designation prescribed in standard certificates."""
        mapping = {
            AccuracyClass.CLASS_I: "I",
            AccuracyClass.CLASS_II: "II",
            AccuracyClass.CLASS_III: "III",
            AccuracyClass.CLASS_IIII: "IIII",
        }
        return mapping[self]

    @property
    def designation(self) -> str:
        """Official English technical designation per OIML R 76-1."""
        mapping = {
            AccuracyClass.CLASS_I: "Special Accuracy",
            AccuracyClass.CLASS_II: "High Accuracy",
            AccuracyClass.CLASS_III: "Medium Accuracy",
            AccuracyClass.CLASS_IIII: "Ordinary Accuracy",
        }
        return mapping[self]

    @property
    def hindi_name(self) -> str:
        """Official Hindi statutory designation in Gazette notifications."""
        mapping = {
            AccuracyClass.CLASS_I: "विशेष यथार्थता (वर्ग I)",
            AccuracyClass.CLASS_II: "उच्च यथार्थता (वर्ग II)",
            AccuracyClass.CLASS_III: "मध्यम यथार्थता (वर्ग III)",
            AccuracyClass.CLASS_IIII: "साधारण यथार्थता (वर्ग IIII)",
        }
        return mapping[self]

    @property
    def class_number(self) -> int:
        """Numeric rank (1 for I, 2 for II, 3 for III, 4 for IIII)."""
        mapping = {
            AccuracyClass.CLASS_I: 1,
            AccuracyClass.CLASS_II: 2,
            AccuracyClass.CLASS_III: 3,
            AccuracyClass.CLASS_IIII: 4,
        }
        return mapping[self]

    @classmethod
    def from_string(cls, val: str) -> AccuracyClass:
        """
        Flexibly parse accuracy class from diverse user inputs and certificate strings.

        Supports 'I', 'II', 'III', 'IIII', 'IV', 'Class 1', 'CLASS_III', 'Special', etc.
        """
        cleaned = val.strip().upper().replace(" ", "_").replace("-", "_")

        # Direct match
        if cleaned in cls._value2member_map_:
            return cls(cleaned)

        # Mapping variations
        normalized_map = {
            "I": cls.CLASS_I,
            "1": cls.CLASS_I,
            "CLASS_1": cls.CLASS_I,
            "SPECIAL": cls.CLASS_I,
            "SPECIAL_ACCURACY": cls.CLASS_I,
            "II": cls.CLASS_II,
            "2": cls.CLASS_II,
            "CLASS_2": cls.CLASS_II,
            "HIGH": cls.CLASS_II,
            "HIGH_ACCURACY": cls.CLASS_II,
            "III": cls.CLASS_III,
            "3": cls.CLASS_III,
            "CLASS_3": cls.CLASS_III,
            "MEDIUM": cls.CLASS_III,
            "MEDIUM_ACCURACY": cls.CLASS_III,
            "IIII": cls.CLASS_IIII,
            "IV": cls.CLASS_IIII,
            "4": cls.CLASS_IIII,
            "CLASS_4": cls.CLASS_IIII,
            "CLASS_IV": cls.CLASS_IIII,
            "ORDINARY": cls.CLASS_IIII,
            "ORDINARY_ACCURACY": cls.CLASS_IIII,
        }

        if cleaned in normalized_map:
            return normalized_map[cleaned]

        raise ValueError(
            f"Unknown AccuracyClass: '{val}'. Valid options are: " f"{[c.value for c in cls]}"
        )


# ============================================================================
# 3. VerificationStage: Initial Type Approval vs Subsequent In-Service
# ============================================================================


class VerificationStage(str, Enum):
    """
    Statutory stage of metrological testing.

    Statutory Reference:
    - OIML R 76-1:2006 Clause 3.5.1 vs Clause 3.5.2
    - Legal Metrology (General) Rules, 2011, Seventh Schedule, Heading A,
      Table 20 & Page 74: "The maximum permissible errors during inspection
      shall be twice the maximum permissible errors allowed on verification."
    """

    INITIAL_TYPE_APPROVAL = (
        "INITIAL_TYPE_APPROVAL"  # Initial verification & model approval (1x MPE)
    )
    SUBSEQUENT_IN_SERVICE = (
        "SUBSEQUENT_IN_SERVICE"  # In-service inspection & periodic re-verification (2x MPE)
    )

    INITIAL = "INITIAL_TYPE_APPROVAL"
    IN_SERVICE = "SUBSEQUENT_IN_SERVICE"

    @property
    def mpe_multiplier(self) -> Decimal:
        """
        MPE multiplier factor.

        Initial Type Approval = 1.0 (Base MPE: 0.5e, 1.0e, 1.5e).
        Subsequent In-Service = 2.0 (Doubled MPE: 1.0e, 2.0e, 3.0e).
        """
        if self == VerificationStage.INITIAL_TYPE_APPROVAL:
            return Decimal("1")
        return Decimal("2")

    @property
    def description(self) -> str:
        """Human-readable description for generated test reports."""
        if self == VerificationStage.INITIAL_TYPE_APPROVAL:
            return "Initial Verification / Type Approval (Standard MPE)"
        return "Subsequent Verification / In-Service Inspection (Doubled MPE per Rule Clause 74)"

    @property
    def statutory_clause(self) -> str:
        """Legal clause citation for certificate output."""
        if self == VerificationStage.INITIAL_TYPE_APPROVAL:
            return (
                "OIML R 76-1 Cl. 3.5.1; LM (General) Rules 2011 "
                "Seventh Schedule Heading A Para 9(1)"
            )
        return (
            "OIML R 76-1 Cl. 3.5.2; LM (General) Rules 2011 "
            "Seventh Schedule Heading A Para 9(2)(i)"
        )

    @classmethod
    def from_string(cls, val: str) -> VerificationStage:
        """Parse stage from common synonyms."""
        cleaned = val.strip().upper().replace(" ", "_").replace("-", "_")
        if cleaned in cls._value2member_map_:
            return cls(cleaned)
        synonyms = {
            "INITIAL": cls.INITIAL_TYPE_APPROVAL,
            "TYPE_APPROVAL": cls.INITIAL_TYPE_APPROVAL,
            "MODEL_APPROVAL": cls.INITIAL_TYPE_APPROVAL,
            "VERIFICATION": cls.INITIAL_TYPE_APPROVAL,
            "IN_SERVICE": cls.SUBSEQUENT_IN_SERVICE,
            "SUBSEQUENT": cls.SUBSEQUENT_IN_SERVICE,
            "PERIODIC": cls.SUBSEQUENT_IN_SERVICE,
            "INSPECTION": cls.SUBSEQUENT_IN_SERVICE,
            "RE_VERIFICATION": cls.SUBSEQUENT_IN_SERVICE,
        }
        if cleaned in synonyms:
            return synonyms[cleaned]
        raise ValueError(
            f"Unknown VerificationStage: '{val}'. Valid options are: " f"{[s.value for s in cls]}"
        )


# ============================================================================
# 4. UnitOfMeasure: Lossless Legal SI Units & Conversion Engine
# ============================================================================


class UnitOfMeasure(str, Enum):
    """
    Standard units of mass in legal metrology.

    Statutory Reference:
    - Legal Metrology Act, 2009, Sections 5 & 11 (SI Base Unit of mass: kilogram)
    - OIML R 76-1:2006 Clause 2.1
    """

    MILLIGRAM = "MILLIGRAM"  # mg (10^-6 kg)
    GRAM = "GRAM"  # g  (10^-3 kg)
    KILOGRAM = "KILOGRAM"  # kg (SI Base Unit = 1 kg)
    TONNE = "TONNE"  # t  (10^3 kg / 1 Megagram)

    @property
    def symbol(self) -> str:
        """Standard SI unit symbol."""
        mapping = {
            UnitOfMeasure.MILLIGRAM: "mg",
            UnitOfMeasure.GRAM: "g",
            UnitOfMeasure.KILOGRAM: "kg",
            UnitOfMeasure.TONNE: "t",
        }
        return mapping[self]

    @property
    def to_kg_factor(self) -> Decimal:
        """Exact multiplier to convert 1 unit of this measurement to Kilograms."""
        mapping = {
            UnitOfMeasure.MILLIGRAM: Decimal("0.000001"),
            UnitOfMeasure.GRAM: Decimal("0.001"),
            UnitOfMeasure.KILOGRAM: Decimal("1"),
            UnitOfMeasure.TONNE: Decimal("1000"),
        }
        return mapping[self]

    @property
    def to_g_factor(self) -> Decimal:
        """Exact multiplier to convert 1 unit of this measurement to Grams."""
        mapping = {
            UnitOfMeasure.MILLIGRAM: Decimal("0.001"),
            UnitOfMeasure.GRAM: Decimal("1"),
            UnitOfMeasure.KILOGRAM: Decimal("1000"),
            UnitOfMeasure.TONNE: Decimal("1000000"),
        }
        return mapping[self]

    def convert_to(self, value: Decimal, target_unit: UnitOfMeasure) -> Decimal:
        """
        Losslessly convert a value from this unit to the target unit.

        Calculation:
            value_in_kg = value * self.to_kg_factor
            target_value = value_in_kg / target_unit.to_kg_factor

        Args:
            value: Metrological Decimal value.
            target_unit: Desired target UnitOfMeasure.

        Returns:
            Exact Decimal converted value.
        """
        if self == target_unit:
            return value
        value_in_kg = value * self.to_kg_factor
        return value_in_kg / target_unit.to_kg_factor

    def to_kg(self, value: Decimal) -> Decimal:
        """Convert value to kilograms."""
        return value * self.to_kg_factor

    def to_g(self, value: Decimal) -> Decimal:
        """Convert value to grams (standard reference unit for OIML Table 3)."""
        return value * self.to_g_factor

    @classmethod
    def from_symbol(cls, sym: str) -> UnitOfMeasure:
        """Resolve unit from SI symbol: 'mg', 'g', 'kg', 't'."""
        cleaned = sym.strip().lower()
        symbol_map = {
            "mg": cls.MILLIGRAM,
            "g": cls.GRAM,
            "kg": cls.KILOGRAM,
            "t": cls.TONNE,
            "ton": cls.TONNE,
            "tonne": cls.TONNE,
        }
        if cleaned in symbol_map:
            return symbol_map[cleaned]
        raise ValueError(f"Unknown unit symbol: '{sym}'. Allowed: 'mg', 'g', 'kg', 't'.")

    @classmethod
    def from_string(cls, val: str) -> UnitOfMeasure:
        """Flexibly resolve unit from string, enum name, or symbol."""
        cleaned = val.strip().upper()
        if cleaned in cls._value2member_map_:
            return cls(cleaned)
        try:
            return cls.from_symbol(val)
        except ValueError:
            pass
        raise ValueError(
            f"Unknown UnitOfMeasure: '{val}'. Valid options are: "
            f"{[u.value for u in cls]} or symbols ['mg', 'g', 'kg', 't']."
        )


# ============================================================================
# 5. OIML R 76-1 Test Procedures & Supporting Enums
# ============================================================================


class TestType(str, Enum):
    """
    Standard test procedures defined in OIML R 76-1:2006 Annex A.
    """

    WEIGHING_PERFORMANCE = "WEIGHING_PERFORMANCE"  # Clause A.4.4: Accuracy / Linearity test
    TARE_WEIGHING = "TARE_WEIGHING"  # Clause A.4.6: Tare mechanism error test
    ECCENTRICITY = "ECCENTRICITY"  # Clause A.4.7: Off-center / corner load test
    REPEATABILITY = "REPEATABILITY"  # Clause A.4.10: Spread of repeated weighings
    DISCRIMINATION = "DISCRIMINATION"  # Clause A.4.8: Discrimination test (1.4d)
    TILTING = "TILTING"  # Clause A.5.1.1: Tilting test for portable instruments
    ZERO_SETTING = "ZERO_SETTING"  # Clause A.4.2: Zero-setting accuracy & range
    WARM_UP = "WARM_UP"  # Clause A.4.3: Warm-up time test
    TEMPERATURE_INFLUENCE = "TEMPERATURE_INFLUENCE"  # Clause A.5.3: Static temperature test

    # Convenience aliases
    WEIGHING = "WEIGHING_PERFORMANCE"
    TARE = "TARE_WEIGHING"
    TEMPERATURE = "TEMPERATURE_INFLUENCE"


# Prevent pytest from attempting to collect TestType as a test case class
TestType.__test__ = False  # type: ignore[attr-defined]


class LoadReceptorType(str, Enum):
    """
    Physical geometry and mounting of the load receptor.

    Statutory Reference: OIML R 76-1:2006 Clause A.4.7 (Eccentricity tests).
    """

    PLATFORM = "PLATFORM"  # Standard rectangular/circular platform (<= 4 points)
    HANGING = "HANGING"  # Suspended / crane / hanging scale
    WEIGHBRIDGE = "WEIGHBRIDGE"  # Vehicle weighbridge / railway track scale (rolling load)
    TANK = "TANK"  # Tank, hopper, silo, or container weigher
    SUSPENDED_HOPPER = "SUSPENDED_HOPPER"  # Overhead track / suspended hopper


class InstrumentMobility(str, Enum):
    """
    Mobility classification governing tilt testing requirements.

    Statutory Reference: OIML R 76-1:2006 Clause A.5.1.1 (Tilting test).
    """

    PORTABLE = "PORTABLE"  # Freely movable desktop, counter, or transportable scale
    FIXED = "FIXED"  # Permanently anchored, pit-mounted, or immovable scale
    VEHICLE_MOUNTED = "VEHICLE_MOUNTED"  # Mounted on truck, boat, or mobile chassis


class CornerPosition(str, Enum):
    """
    Receptor positions for Eccentricity (Corner Loading) Test.

    Statutory Reference: OIML R 76-1:2006 Clause A.4.7.1
    """

    CENTER = "CENTER"  # Position 1: Central reference point
    FRONT_LEFT = "FRONT_LEFT"  # Position 2: Corner 1
    BACK_LEFT = "BACK_LEFT"  # Position 3: Corner 2
    BACK_RIGHT = "BACK_RIGHT"  # Position 4: Corner 3
    FRONT_RIGHT = "FRONT_RIGHT"  # Position 5: Corner 4
    CUSTOM = "CUSTOM"  # Non-standard or multi-support point (>4 supports)


class ComplianceStatus(str, Enum):
    """Compliance decision status for an observation point or test procedure."""

    PASS = "PASS"  # noqa: S105 - Error is strictly within MPE (|E_c| <= MPE)
    FAIL = "FAIL"  # Error exceeds MPE (|E_c| > MPE)
    MARGINAL = "MARGINAL"  # Exactly on MPE boundary (|E_c| == MPE)
    NOT_APPLICABLE = "NOT_APPLICABLE"  # Test or condition not applicable
    PENDING = "PENDING"  # Awaiting measurement or calculation


class WeightClass(str, Enum):
    """Standard weight accuracy classes per OIML R 111-1 / Legal Metrology Rules.

    Hierarchy (lowest rank = highest accuracy):
    E1 (rank 1) > E2 (rank 2) > F1 (rank 3) > F2 (rank 4) > M1 (rank 5) > M2 (rank 6) > M3 (rank 7)
    """

    E1 = "E1"
    E2 = "E2"
    F1 = "F1"
    F2 = "F2"
    M1 = "M1"
    M2 = "M2"
    M3 = "M3"

    @property
    def rank(self) -> int:
        """Hierarchical ranking integer (1 = E1 best, 7 = M3 lowest)."""
        ranks = {
            "E1": 1,
            "E2": 2,
            "F1": 3,
            "F2": 4,
            "M1": 5,
            "M2": 6,
            "M3": 7,
        }
        return ranks[self.value]

    @property
    def description(self) -> str:
        """Statutory metrological description per OIML R 111-1."""
        descriptions = {
            "E1": "Class E1: Reference standard for national prototypes and Class E2 weights",
            "E2": "Class E2: High-accuracy reference standard for Class I analytical balances",
            "F1": "Class F1: Precision standard for Class II high-accuracy instruments",
            "F2": "Class F2: Precision standard for high-accuracy commercial scales",
            "M1": "Class M1: Working standard for Class III medium accuracy trade instruments",
            "M2": "Class M2: General working standard for lower precision trade weighing",
            "M3": "Class M3: Industrial coarse standard for heavy capacity verification",
        }
        return descriptions[self.value]

    def is_at_least(self, target_class: WeightClass) -> bool:
        """True if this weight class has equal or better accuracy than target_class."""
        return self.rank <= target_class.rank


class TraceabilityStatus(str, Enum):
    """Statutory status of standard weight traceability and equipment validity."""

    VERIFIED = "VERIFIED"  # Active, compliant, uncertainty within 1/3 MPE
    WARNING = "WARNING"  # Valid but expires within 30 days or approaching uncertainty limit
    LOCKED_OUT = "LOCKED_OUT"  # Hard metrological lockout (unusable for testing)


class LockoutReason(str, Enum):
    """Statutory cause triggering a metrological hard lockout."""

    CALIBRATION_EXPIRED = "CALIBRATION_EXPIRED"
    CALIBRATION_FUTURE_DATE = "CALIBRATION_FUTURE_DATE"
    INADEQUATE_WEIGHT_CLASS = "INADEQUATE_WEIGHT_CLASS"
    EXCESSIVE_UNCERTAINTY = "EXCESSIVE_UNCERTAINTY"
    INSUFFICIENT_RANGE = "INSUFFICIENT_RANGE"
    MISSING_CERTIFICATE = "MISSING_CERTIFICATE"
    INACTIVE_WEIGHT_SET = "INACTIVE_WEIGHT_SET"


# Backwards compatibility and synonyms
UnitOfMeasurement = UnitOfMeasure


