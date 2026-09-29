"""
METROLOGIX-76 — High-Precision Pydantic v2 Data Models for Legal Metrology.

Statutory Authorities & Technical References:
- OIML R 76-1:2006 (E) "Non-automatic weighing instruments"
  * Clause 3.1: Units of measurement
  * Clause 3.2: Principles of classification (Table 3)
  * Clause 3.3: Multi-interval instruments
  * Clause 3.4: Auxiliary indicating devices
  * Clause 3.5: Maximum permissible errors (Table 4 / Table 20)
  * Clause A.4.4.3: Digital indication changeover point calculation (P = I + 0.5e - Delta L)
- Legal Metrology (General) Rules, 2011, Seventh Schedule, Heading A (Rules 17, 20, 24)
- Department of Consumer Affairs (DoCA), SIH Problem Statement 26035
"""

from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from app.core.types import (
    AccuracyClass,
    ComplianceStatus,
    CornerPosition,
    InstrumentMobility,
    LoadReceptorType,
    MetrologyDecimal,
    UnitOfMeasure,
)

# ============================================================================
# Base Metrology Model Configuration
# ============================================================================


class MetrologyBaseModel(BaseModel):
    """Base model enforcing strict legal metrology schema integrity."""

    model_config = ConfigDict(
        extra="forbid",
        validate_default=True,
        validate_assignment=True,
        str_strip_whitespace=True,
        use_enum_values=False,
        protected_namespaces=(),
    )


# ============================================================================
# 1. Partial Interval Range (for Multi-Interval / Multi-Range NAWIs)
# ============================================================================


class IntervalRange(MetrologyBaseModel):
    """
    Partial weighing range definition for a multi-interval or multi-range instrument.

    Statutory Reference:
    - OIML R 76-1:2006 Clause 3.3 (Multi-interval instruments)
    - Clause 3.4 (Scale interval of multi-interval instruments)
    """

    range_index: int = Field(
        ...,
        ge=1,
        description="1-based index of this partial interval range (e.g., 1 for W1, 2 for W2).",
    )
    min_capacity: MetrologyDecimal = Field(
        ..., description="Minimum capacity for this partial range (Min_i)."
    )
    max_capacity: MetrologyDecimal = Field(
        ..., description="Maximum capacity for this partial range (Max_i)."
    )
    e: MetrologyDecimal = Field(
        ..., description="Verification scale interval for this partial range (e_i)."
    )
    d: MetrologyDecimal = Field(
        ..., description="Actual scale interval (display resolution) for this partial range (d_i)."
    )

    @field_validator("min_capacity", "max_capacity", "e", "d")
    @classmethod
    def validate_positive_values(cls, v: Decimal) -> Decimal:
        """All range capacity and interval parameters must be strictly positive."""
        if v <= Decimal("0"):
            raise ValueError(f"Interval parameter must be strictly positive (> 0), got: {v}")
        return v

    @model_validator(mode="after")
    def validate_range_coherence(self) -> IntervalRange:
        """Validate Max_i > Min_i and e_i >= d_i."""
        if self.max_capacity <= self.min_capacity:
            raise ValueError(
                f"Range {self.range_index}: max_capacity ({self.max_capacity}) must be strictly "
                f"greater than min_capacity ({self.min_capacity})."
            )
        if self.e < self.d:
            raise ValueError(
                f"Range {self.range_index}: verification scale interval e ({self.e}) must be "
                f"greater than or equal to actual scale interval d ({self.d}) "
                "as per OIML R 76-1 Cl. 3.1.2."
            )
        return self

    @property
    def n(self) -> Decimal:
        """Number of verification scale intervals for this partial range: n_i = Max_i / e_i."""
        return self.max_capacity / self.e


# ============================================================================
# 2. InstrumentSpecification: Non-Automatic Weighing Instrument Specs
# ============================================================================


class InstrumentSpecification(MetrologyBaseModel):
    """
    Complete metrological specification for a Non-Automatic Weighing Instrument.

    Statutory Reference:
    - OIML R 76-1:2006 Clause 3.1, 3.2, 3.3
    - Legal Metrology (General) Rules, 2011, Seventh Schedule, Heading A, Table 17
    """

    accuracy_class: AccuracyClass = Field(
        ...,
        description="Accuracy Class per OIML Table 3 / Seventh Schedule Table 17.",
    )
    max_capacity: MetrologyDecimal = Field(
        ..., description="Maximum capacity (Max) of the instrument."
    )
    min_capacity: MetrologyDecimal = Field(
        ..., description="Minimum capacity (Min) of the instrument."
    )
    e: MetrologyDecimal = Field(..., description="Verification scale interval (e).")
    d: MetrologyDecimal = Field(..., description="Actual scale interval / display resolution (d).")
    unit: UnitOfMeasure = Field(
        default=UnitOfMeasure.KILOGRAM,
        description="Declared physical unit of measure (MILLIGRAM, GRAM, KILOGRAM, TONNE).",
    )
    is_multi_interval: bool = Field(
        default=False,
        description="True if the instrument is multi-interval with partial weighing ranges.",
    )
    intervals_array: list[IntervalRange] | None = Field(
        default=None,
        description="Partial interval ranges if is_multi_interval is True (W1, W2, etc.).",
    )
    receptor_type: LoadReceptorType = Field(
        default=LoadReceptorType.PLATFORM,
        description="Physical type of load receptor (PLATFORM, HANGING, WEIGHBRIDGE, TANK).",
    )
    mobility: InstrumentMobility = Field(
        default=InstrumentMobility.FIXED,
        description="Mobility classification (PORTABLE, FIXED, VEHICLE_MOUNTED).",
    )
    has_level_indicator: bool = Field(
        default=True,
        description="True if equipped with a spirit / electronic leveling indicator.",
    )
    has_tare_device: bool = Field(
        default=True,
        description="True if equipped with a tare balancing or tare weighing mechanism.",
    )
    num_supports: int = Field(
        default=4,
        ge=1,
        description="Number of discrete points of support beneath the load receptor.",
    )
    tare_max: MetrologyDecimal | None = Field(
        default=None, description="Maximum subtractive or additive tare capacity (T), if equipped."
    )
    manufacturer: str | None = Field(
        default=None, max_length=256, description="Name of the instrument manufacturer."
    )
    model_name: str | None = Field(
        default=None, max_length=128, description="Commercial model name / number."
    )
    serial_number: str | None = Field(
        default=None, max_length=128, description="Unique equipment serial number."
    )
    approval_number: str | None = Field(
        default=None,
        max_length=128,
        description="Model approval certificate reference number (e.g. IND/09/2026/XXX).",
    )


    @field_validator("max_capacity", "min_capacity", "e", "d")
    @classmethod
    def validate_positive_capacity_and_intervals(cls, v: Decimal) -> Decimal:
        """Physical capacities and scale intervals must be strictly positive."""
        if v <= Decimal("0"):
            raise ValueError(f"Value must be strictly positive (> 0), got: {v}")
        return v

    @field_validator("tare_max")
    @classmethod
    def validate_positive_tare(cls, v: Decimal | None) -> Decimal | None:
        """Tare capacity, if declared, must be non-negative."""
        if v is not None and v < Decimal("0"):
            raise ValueError(f"Tare maximum capacity cannot be negative, got: {v}")
        return v

    @model_validator(mode="after")
    def validate_metrological_coherence(self) -> InstrumentSpecification:
        """
        Enforce OIML R 76-1 metrological invariants:
        1. Max > Min
        2. e >= d
        3. Multi-interval ranges consistency (monotonic capacities & intervals)
        """
        # 1. Max > Min
        if self.max_capacity <= self.min_capacity:
            raise ValueError(
                f"Maximum capacity Max ({self.max_capacity}) must be strictly greater than "
                f"Minimum capacity Min ({self.min_capacity})."
            )

        # 2. e >= d (OIML R 76-1 Clause 3.1.2)
        if self.e < self.d:
            raise ValueError(
                f"Verification scale interval e ({self.e}) must be greater than or equal to "
                f"actual scale interval d ({self.d}) as mandated by OIML R 76-1 Clause 3.1.2."
            )

        # 3. Multi-interval validation
        if self.is_multi_interval:
            if not self.intervals_array or len(self.intervals_array) < 2:
                raise ValueError(
                    "Multi-interval instrument ('is_multi_interval=True') must specify an "
                    "'intervals_array' containing at least 2 partial interval ranges (W1, W2, ...)."
                )

            # Check that ranges are sorted and strictly monotonic
            sorted_ranges = sorted(self.intervals_array, key=lambda r: r.range_index)
            if [r.range_index for r in self.intervals_array] != list(
                range(1, len(self.intervals_array) + 1)
            ):
                raise ValueError(
                    f"Interval range indices must be strictly consecutive starting at 1. "
                    f"Got indices: {[r.range_index for r in self.intervals_array]}"
                )

            for i in range(len(sorted_ranges) - 1):
                curr_r = sorted_ranges[i]
                next_r = sorted_ranges[i + 1]

                # Capacity progression: Max_i < Max_{i+1}
                if curr_r.max_capacity >= next_r.max_capacity:
                    raise ValueError(
                        f"Range {curr_r.range_index} Max ({curr_r.max_capacity}) must be strictly "
                        f"less than Range {next_r.range_index} Max ({next_r.max_capacity})."
                    )

                # Verification interval progression: e_i < e_{i+1} (OIML R 76-1 Clause 3.3.1)
                if curr_r.e >= next_r.e:
                    raise ValueError(
                        f"Range {curr_r.range_index} e ({curr_r.e}) must be strictly less than "
                        f"Range {next_r.range_index} e ({next_r.e}) as per OIML R 76-1 Cl. 3.3.1."
                    )

            # Last range max must match overall instrument max_capacity
            last_range = sorted_ranges[-1]
            if last_range.max_capacity != self.max_capacity:
                raise ValueError(
                    f"The highest partial interval range max_capacity ({last_range.max_capacity}) "
                    f"must equal the instrument's declared max_capacity ({self.max_capacity})."
                )

            # First range min must match or be compatible with instrument min_capacity
            first_range = sorted_ranges[0]
            if first_range.min_capacity != self.min_capacity:
                raise ValueError(
                    f"The lowest partial interval range min_capacity ({first_range.min_capacity}) "
                    f"must equal the instrument's declared min_capacity ({self.min_capacity})."
                )

        else:
            # Single-interval instrument
            if self.intervals_array and len(self.intervals_array) > 1:
                raise ValueError(
                    "Instrument declared as single-interval ('is_multi_interval=False') "
                    "cannot have multiple partial interval ranges in 'intervals_array'."
                )

        return self

    @property
    def n(self) -> Decimal:
        """
        Number of verification scale intervals for single interval or highest interval:
        n = Max / e
        """
        return self.max_capacity / self.e

    def get_e_for_load(self, load: Decimal) -> Decimal:
        """
        Resolve the applicable verification scale interval e for a given load.

        For single-interval instruments, this is simply self.e.
        For multi-interval instruments, it resolves to the partial range e_i where
        Min_i <= load <= Max_i (OIML R 76-1 Clause 3.3).
        """
        if not self.is_multi_interval or not self.intervals_array:
            return self.e

        # Evaluate against partial ranges in ascending capacity
        for r in sorted(self.intervals_array, key=lambda x: x.max_capacity):
            if load <= r.max_capacity:
                return r.e

        # Above highest partial max, use highest range e
        return self.intervals_array[-1].e


# ============================================================================
# 3. ObservationPoint: Strict Changeover & Unrounded Indication Model
# ============================================================================


class ObservationPoint(MetrologyBaseModel):
    """
    A single recorded test point during an OIML R 76 evaluation.

    Statutory Reference:
    - OIML R 76-1:2006 Clause A.4.4.3: Digital indication changeover point
      P = I + 0.5e - Delta L
    - Error calculation:
      Uncorrected error E = P - L
      Corrected error E_c = E - E_0
    """

    load: MetrologyDecimal = Field(
        ..., description="Standard reference test load (L) applied to the receptor."
    )
    indication: MetrologyDecimal = Field(
        ..., description="Observed digital display indication (I)."
    )
    delta_load: MetrologyDecimal = Field(
        default=Decimal("0"),
        description="Additional fractional test load (Delta L) to reach changeover.",
    )
    e: MetrologyDecimal | None = Field(
        default=None, description="Verification scale interval (e) at this load point."
    )
    d: MetrologyDecimal | None = Field(
        default=None, description="Actual scale interval (d) at this load point."
    )
    tare: MetrologyDecimal = Field(
        default=Decimal("0"), description="Tare load applied (T), if tare test."
    )
    run_number: int = Field(
        default=1,
        ge=1,
        description="Measurement run sequence number (e.g., 1..10 in repeatability test).",
    )
    position: CornerPosition | None = Field(
        default=None, description="Receptor position (for eccentricity / corner loading tests)."
    )
    temperature_celsius: MetrologyDecimal | None = Field(
        default=None, description="Ambient chamber/lab temperature at time of observation."
    )
    relative_humidity: MetrologyDecimal | None = Field(
        default=None, description="Ambient relative humidity percentage (0 - 100%)."
    )
    timestamp: datetime | None = Field(
        default=None, description="Observation timestamp with timezone traceability."
    )
    notes: str | None = Field(
        default=None, max_length=500, description="Optional laboratory observation notes."
    )

    @field_validator("load", "indication", "delta_load", "tare")
    @classmethod
    def validate_non_negative_physical_values(cls, v: Decimal) -> Decimal:
        """Physical test loads and indications cannot be negative in standard weighings."""
        if v < Decimal("0"):
            raise ValueError(f"Physical measurement value cannot be negative, got: {v}")
        return v

    @field_validator("relative_humidity")
    @classmethod
    def validate_humidity_range(cls, v: Decimal | None) -> Decimal | None:
        """Relative humidity must fall in the physical range 0% - 100%."""
        if v is not None and (v < Decimal("0") or v > Decimal("100")):
            raise ValueError(f"Relative humidity must be between 0% and 100%, got: {v}")
        return v

    @model_validator(mode="after")
    def validate_delta_load_bound(self) -> ObservationPoint:
        """
        Validate that fractional load Delta L does not exceed the verification interval e.
        Per OIML R 76-1 Clause A.4.4.3, Delta L is composed of small fractional weights
        up to 1e added until the next display changeover occurs.
        """
        if self.e is not None and self.delta_load > self.e:
            raise ValueError(
                f"Delta load ({self.delta_load}) cannot exceed verification interval e ({self.e}) "
                "under changeover testing (OIML R 76-1 Cl. A.4.4.3)."
            )
        return self

    def calculate_turning_point(self) -> Decimal:
        """
        Calculate unrounded true indication P per OIML R 76-1 Clause A.4.4.3:
        P = I + 0.5e - Delta L

        If verification interval e is not explicitly defined on this point,
        falls back to discrete indication I.
        """
        if self.e is None:
            return self.indication
        half_e = self.e * Decimal("0.5")
        return self.indication + half_e - self.delta_load

    def calculate_uncorrected_error(self) -> Decimal:
        """
        Calculate uncorrected error E per OIML R 76-1 Clause A.4.4.3:
        E = P - L
        """
        p = self.calculate_turning_point()
        return p - self.load

    def calculate_corrected_error(self, zero_error: Decimal = Decimal("0")) -> Decimal:
        """
        Calculate corrected error E_c per OIML R 76-1 Clause A.4.4.3:
        E_c = E - E_0
        where E_0 is the error at zero (or near-zero) load.
        """
        return self.calculate_uncorrected_error() - zero_error


# ============================================================================
# 4. Eccentricity & Repeatability Specific Schemas
# ============================================================================


class EccentricityObservation(MetrologyBaseModel):
    """
    Observation for an off-center / corner loading test point.

    Statutory Reference: OIML R 76-1:2006 Clause A.4.7
    """

    position: CornerPosition = Field(
        ..., description="Receptor position (Center, Front-Left, etc.)."
    )
    load: MetrologyDecimal = Field(..., description="Eccentric test load (typically 1/3 Max).")
    indication: MetrologyDecimal = Field(..., description="Observed indication.")
    delta_load: MetrologyDecimal = Field(
        default=Decimal("0"), description="Changeover fractional weight."
    )
    e: MetrologyDecimal = Field(..., description="Verification scale interval.")
    corrected_error: MetrologyDecimal | None = Field(default=None, description="Calculated E_c.")
    mpe: MetrologyDecimal | None = Field(
        default=None, description="Maximum permissible error for this load."
    )
    status: ComplianceStatus | None = Field(
        default=None, description="Compliance status (PASS/FAIL)."
    )


class RepeatabilityRun(MetrologyBaseModel):
    """
    Observation for a single run of the repeatability test.

    Statutory Reference: OIML R 76-1:2006 Clause A.4.10
    """

    run_number: int = Field(
        ..., ge=1, le=20, description="Run number (typically 1 to 3, or 1 to 10)."
    )
    load: MetrologyDecimal = Field(
        ..., description="Constant test load (typically ~0.5 Max or ~1.0 Max)."
    )
    indication: MetrologyDecimal = Field(..., description="Observed indication.")
    delta_load: MetrologyDecimal = Field(
        default=Decimal("0"), description="Changeover fractional load."
    )
    e: MetrologyDecimal = Field(..., description="Verification scale interval.")
    zero_error: MetrologyDecimal = Field(
        default=Decimal("0"), description="Zero-load baseline error E_0."
    )
    p: MetrologyDecimal | None = Field(default=None, description="True unrounded indication P.")
    corrected_error: MetrologyDecimal | None = Field(
        default=None, description="Calculated corrected error E_c."
    )


class DiscriminationObservation(MetrologyBaseModel):
    """
    Observation for an OIML R 76-1 Clause A.4.8 discrimination test point.

    Statutory Reference:
    - OIML R 76-1:2006 Clause 3.8 & Clause A.4.8
    - Legal Metrology (General) Rules, 2011, Seventh Schedule, Heading A, Para 8
    """

    load: MetrologyDecimal = Field(
        ..., description="Equilibrium test load (e.g. Min, 0.5 Max, or Max)."
    )
    load_label: str = Field(
        default="", description="Descriptive label (e.g. 'Min', '0.5 Max', 'Max')."
    )
    initial_indication: MetrologyDecimal = Field(
        ..., description="Observed indication I_1 before extra load."
    )
    extra_load: MetrologyDecimal | None = Field(
        default=None, description="Applied additional load (statutory 1.4d)."
    )
    final_indication: MetrologyDecimal = Field(
        ..., description="Observed indication I_2 after gently depositing extra load."
    )
    initial_delta_load: MetrologyDecimal = Field(
        default=Decimal("0"),
        description="Fractional load Delta L_1 for initial turning point P_1.",
    )
    final_delta_load: MetrologyDecimal = Field(
        default=Decimal("0"),
        description="Fractional load Delta L_2 for final turning point P_2.",
    )
    d: MetrologyDecimal | None = Field(
        default=None, description="Actual scale interval d."
    )
    e: MetrologyDecimal | None = Field(
        default=None, description="Verification scale interval e."
    )
    notes: str | None = Field(
        default=None, description="Field observation notes."
    )


# ============================================================================
# 5. Laboratory & Environmental Context Schemas
# ============================================================================


class EnvironmentalConditions(MetrologyBaseModel):
    """
    Laboratory environmental conditions recorded during the test session.

    Statutory Reference: OIML R 76-1:2006 Clause 3.9.2 & Clause A.5.3
    """

    temperature_celsius: MetrologyDecimal = Field(
        ..., description="Ambient laboratory temperature in °C."
    )
    relative_humidity_percent: MetrologyDecimal = Field(
        ..., description="Relative humidity in percentage (0 - 100%)."
    )
    atmospheric_pressure_hpa: MetrologyDecimal | None = Field(
        default=None, description="Atmospheric pressure in hectopascals (hPa / mbar)."
    )
    mains_voltage_volts: MetrologyDecimal | None = Field(
        default=None, description="Supply AC/DC mains voltage (V) during testing."
    )
    mains_frequency_hz: MetrologyDecimal | None = Field(
        default=None, description="Mains electrical frequency (Hz), typically 50 Hz."
    )

    @field_validator("relative_humidity_percent")
    @classmethod
    def validate_humidity_bounds(cls, v: Decimal) -> Decimal:
        if v < Decimal("0") or v > Decimal("100"):
            raise ValueError(f"Relative humidity must be between 0% and 100%, got: {v}")
        return v


class LaboratoryDetails(MetrologyBaseModel):
    """
    Accredited Testing Laboratory and Test Officer identification.

    Statutory Reference:
    - GATC Rules, 2013 & GATC Amendment Rules, 2021 (G.S.R. 73(E) — ISO/IEC 17025 mandate)
    - GATC Amendment Rules, 2026 (G.S.R. 346(E) — Schedule of weights/measures)
    """

    lab_name: str = Field(
        ..., min_length=2, max_length=256, description="Official testing laboratory name."
    )
    accreditation_number: str | None = Field(
        default=None,
        max_length=128,
        description="NABL / ISO/IEC 17025:2017 accreditation certificate number.",
    )
    gatc_registration_number: str | None = Field(
        default=None,
        max_length=128,
        description="Government Approved Test Centre (GATC) statutory registration ID.",
    )
    location: str | None = Field(
        default=None, max_length=256, description="Laboratory address / city."
    )
    test_officer_name: str = Field(
        ..., min_length=2, max_length=128, description="Primary testing officer / metrologist."
    )
    test_officer_designation: str | None = Field(
        default=None, max_length=128, description="Official title / rank."
    )
    verified_by_officer_name: str | None = Field(
        default=None, max_length=128, description="Approving authority / director."
    )


class ModelApprovalHeader(MetrologyBaseModel):
    """
    Standard Model Approval dossier identification block.

    Statutory Reference:
    - Legal Metrology (Approval of Models) Rules, 2011 / Amendment 2019
    - DoCA SIH Problem Statement 26035 Key Functional Requirements
    """

    application_number: str | None = Field(
        default=None, max_length=128, description="Portal application tracking ID."
    )
    manufacturer_name: str = Field(
        ..., min_length=2, max_length=256, description="Legal name of manufacturer / applicant."
    )
    manufacturer_address: str | None = Field(
        default=None, max_length=512, description="Registered manufacturing premises."
    )
    instrument_model: str = Field(
        ..., min_length=1, max_length=128, description="Model designation submitted for approval."
    )
    serial_number: str = Field(
        ...,
        min_length=1,
        max_length=128,
        description="Serial number of the physical test specimen.",
    )
    instrument_description: str | None = Field(
        default=None,
        max_length=256,
        description="Technical description (e.g., Tabletop Platform Scale).",
    )
    test_date: str | None = Field(
        default=None, max_length=32, description="Date of physical testing (YYYY-MM-DD)."
    )
    place_of_testing: str | None = Field(
        default=None, max_length=256, description="Testing location (Laboratory or On-Site)."
    )
