"""
METROLOGIX-76 — Digital Changeover Point & Error Correction Math Engine.

Statutory References:
- OIML R 76-1:2006 Clause A.4.4.3: Digital indication changeover point
  P = I + 0.5e - Delta L
- Seventh Schedule, Legal Metrology (General) Rules, 2011 (Heading A, Part II)
- Formula for uncorrected error of indication:
  E = P - L = I + 0.5e - Delta L - L
- Formula for corrected error (elimination of zero-setting offset):
  E_c = E - E_0

Zero-Bug Rules:
1. Pure functions with explicit Decimal parameter typing and zero floating-point math.
2. Full decimal precision maintained; no premature rounding until final legal display.
3. Zero hardcoded magic numbers: 0.5 is defined as a statutory constant citing Clause A.4.4.3.
4. Comprehensive bounds checking: Delta L in [0, e], e > 0, L >= 0.
"""

from decimal import Decimal
from typing import Final

from pydantic import Field, model_validator

from app.core.schemas import MetrologyBaseModel, ObservationPoint

# ============================================================================
# Statutory Metrological Constants (OIML R 76-1:2006 Clause A.4.4.3)
# ============================================================================

HALF_INTERVAL_FACTOR: Final[Decimal] = Decimal("0.5")
ZERO_DECIMAL: Final[Decimal] = Decimal("0")

STATUTORY_CITATION_A443: Final[str] = (
    "OIML R 76-1:2006 Clause A.4.4.3 / Legal Metrology (General) Rules, 2011, Seventh Schedule"
)


# ============================================================================
# Result Contracts & Pydantic Data Models
# ============================================================================


class ChangeoverResult(MetrologyBaseModel):
    """
    Complete immutable trace record of an OIML digital changeover point computation.

    Contains full unrounded Decimal values for:
    - P: Unrounded true analog indication
    - E: Uncorrected error of indication
    - E_0: Zero-load reference error
    - E_c: Corrected error of indication
    - Step-by-step mathematical explanations and LaTeX expressions for UI rendering.
    """

    load: Decimal = Field(
        ...,
        description="Standard reference test load (L) applied to the load receptor.",
    )
    indication: Decimal = Field(
        ...,
        description="Discrete observed digital indication (I) on the instrument display.",
    )
    e: Decimal = Field(
        ...,
        gt=Decimal("0"),
        description="Verification scale interval (e) applicable at this load.",
    )
    delta_load: Decimal = Field(
        ...,
        ge=Decimal("0"),
        description="Additional fractional test load (Delta L) to flip display to I + e.",
    )
    zero_error: Decimal = Field(
        default=Decimal("0"),
        description="Calculated zero-load error (E_0) applied to eliminate initial offset.",
    )
    p_true_indication: Decimal = Field(
        ...,
        description="Unrounded true analog indication: P = I + 0.5e - Delta L.",
    )
    uncorrected_error: Decimal = Field(
        ...,
        description="Uncorrected error of indication: E = P - L.",
    )
    corrected_error: Decimal = Field(
        ...,
        description="Statutory corrected error of indication: E_c = E - E_0.",
    )
    rounding_correction: Decimal = Field(
        ...,
        description="Digital rounding correction component: 0.5e - Delta L.",
    )
    formula_latex: dict[str, str] = Field(
        ...,
        description="LaTeX formulas representing each step for UI/report display.",
    )
    step_by_step_explanation: list[str] = Field(
        ...,
        description="Step-by-step arithmetic trace strings documenting legal calculations.",
    )
    statutory_citation: str = Field(
        default=STATUTORY_CITATION_A443,
        description="Legal citation under OIML R 76-1 and national regulations.",
    )

    @model_validator(mode="after")
    def validate_mathematical_consistency(self) -> "ChangeoverResult":
        """Assert internal mathematical consistency of the result object."""
        expected_rounding = (self.e * HALF_INTERVAL_FACTOR) - self.delta_load
        if self.rounding_correction != expected_rounding:
            raise ValueError(
                f"Rounding correction mismatch: declared {self.rounding_correction}, "
                f"expected {expected_rounding}."
            )

        expected_p = self.indication + expected_rounding
        if self.p_true_indication != expected_p:
            raise ValueError(
                f"True indication P mismatch: declared {self.p_true_indication}, "
                f"expected {expected_p}."
            )

        expected_e = expected_p - self.load
        if self.uncorrected_error != expected_e:
            raise ValueError(
                f"Uncorrected error E mismatch: declared {self.uncorrected_error}, "
                f"expected {expected_e}."
            )

        expected_ec = expected_e - self.zero_error
        if self.corrected_error != expected_ec:
            raise ValueError(
                f"Corrected error E_c mismatch: declared {self.corrected_error}, "
                f"expected {expected_ec}."
            )

        return self

    @property
    def P(self) -> Decimal:  # noqa: N802
        """Shorthand statutory alias for unrounded true indication P."""
        return self.p_true_indication

    @property
    def E(self) -> Decimal:  # noqa: N802
        """Shorthand statutory alias for uncorrected error E."""
        return self.uncorrected_error

    @property
    def E_c(self) -> Decimal:  # noqa: N802
        """Shorthand statutory alias for corrected error E_c."""
        return self.corrected_error

    @property
    def E_0(self) -> Decimal:  # noqa: N802
        """Shorthand statutory alias for zero-load error E_0."""
        return self.zero_error


class ChangeoverSeriesResult(MetrologyBaseModel):
    """Aggregated result for a complete series of changeover observations."""

    zero_error: Decimal = Field(
        ...,
        description="Baseline zero error E_0 established at the start of the test run.",
    )
    observations: list[ChangeoverResult] = Field(
        ...,
        description="Detailed changeover calculation result for each observation point.",
    )
    max_corrected_error: Decimal = Field(
        ...,
        description="Maximum corrected error observed across all test points: max(E_c).",
    )
    min_corrected_error: Decimal = Field(
        ...,
        description="Minimum corrected error observed across all test points: min(E_c).",
    )
    error_span: Decimal = Field(
        ...,
        description="Spread between maximum and minimum corrected errors: E_c_max - E_c_min.",
    )


# ============================================================================
# Core Pure Mathematical Functions
# ============================================================================


def calculate_changeover(indication: Decimal, e: Decimal, delta_load: Decimal) -> Decimal:
    """
    Compute unrounded true analog indication P per OIML R 76-1:2006 Clause A.4.4.3.

    Formula:
        P = I + 0.5e - Delta L

    Physical Rationale:
        When additional weights Delta L in increments of 0.1d (or 0.1e) are added until
        the display switches from I to I + e, the changeover point occurs at I + e - Delta L.
        Since the switching threshold between I and I + e is physically located at
        I + 0.5e (half an interval above I), the true load before auxiliary weight addition was:
        P = (I + 0.5e) - Delta L = I + 0.5e - Delta L.

    Args:
        indication: Displayed discrete value I.
        e: Verification scale interval e (must be strictly positive).
        delta_load: Auxiliary weights Delta L added until display switches to I + e.

    Returns:
        Exact Decimal value of P without any rounding.

    Raises:
        ValueError: If e <= 0, delta_load < 0, or delta_load > e.
    """
    if e <= ZERO_DECIMAL:
        raise ValueError(f"Verification scale interval e must be strictly positive, got: {e}")
    if delta_load < ZERO_DECIMAL:
        raise ValueError(f"Additional auxiliary load Delta L cannot be negative, got: {delta_load}")
    if delta_load > e:
        raise ValueError(
            f"Auxiliary load Delta L ({delta_load}) cannot exceed verification interval e ({e}) "
            "as changeover occurs within a single scale interval (OIML R 76-1 Cl. A.4.4.3)."
        )

    half_e = e * HALF_INTERVAL_FACTOR
    return indication + half_e - delta_load


def calculate_uncorrected_error(turning_point: Decimal, load: Decimal) -> Decimal:
    """
    Compute uncorrected indication error E = P - L per OIML R 76-1 Clause A.4.4.3.

    Args:
        turning_point: Calculated unrounded indication P.
        load: Standard certified reference weight L applied to receptor.

    Returns:
        Exact Decimal error E.
    """
    return turning_point - load


def calculate_zero_error(
    indication_at_zero: Decimal,
    e: Decimal,
    delta_load_at_zero: Decimal,
    zero_load: Decimal = ZERO_DECIMAL,
) -> Decimal:
    """
    Compute zero-load error E_0 at the start of a test run per Clause A.4.4.3.

    Formula:
        P_0 = I_0 + 0.5e - Delta L_0
        E_0 = P_0 - L_0

    Args:
        indication_at_zero: Indication I_0 recorded at zero load (nominally 0).
        e: Verification scale interval e.
        delta_load_at_zero: Auxiliary weight Delta L_0 required to step from I_0 to I_0 + e.
        zero_load: Applied reference weight at zero (default 0).

    Returns:
        Exact Decimal zero-load error E_0.
    """
    p_0 = calculate_changeover(indication_at_zero, e, delta_load_at_zero)
    return calculate_uncorrected_error(p_0, zero_load)


def calculate_corrected_error(uncorrected_error: Decimal, zero_error: Decimal) -> Decimal:
    """
    Compute statutory corrected error E_c = E - E_0 per OIML R 76-1 Clause A.4.4.3.

    Physical Rationale:
        Eliminates zero-setting device residual error and initial zero-load bias from
        the subsequent test points.

    Args:
        uncorrected_error: Error E calculated at the test load.
        zero_error: Baseline zero error E_0 calculated at zero load.

    Returns:
        Exact Decimal corrected error E_c.
    """
    return uncorrected_error - zero_error


# ============================================================================
# Comprehensive Computation Orchestrator
# ============================================================================


def compute_changeover_point(
    load: Decimal,
    indication: Decimal,
    e: Decimal,
    delta_load: Decimal,
    zero_error: Decimal = ZERO_DECIMAL,
) -> ChangeoverResult:
    """
    Compute digital changeover point, uncorrected error, and corrected error.

    Builds an immutable, auditable ChangeoverResult containing:
    - Step-by-step arithmetic trace strings for UI display and legal records.
    - Mathematical formula strings in LaTeX format.

    Args:
        load: Standard reference test load L.
        indication: Observed digital display indication I.
        e: Verification scale interval e.
        delta_load: Fractional auxiliary load Delta L added to reach changeover.
        zero_error: Baseline zero-load error E_0 (default 0).

    Returns:
        Structured ChangeoverResult instance with full Decimal precision.
    """
    # 1. Pure calculations
    p = calculate_changeover(indication, e, delta_load)
    uncorrected_e = calculate_uncorrected_error(p, load)
    corrected_e = calculate_corrected_error(uncorrected_e, zero_error)
    rounding_corr = (e * HALF_INTERVAL_FACTOR) - delta_load

    # 2. LaTeX formulas for UI presentation
    formula_latex = {
        "P": r"P = I + \frac{1}{2}e - \Delta L",
        "E": r"E = P - L",
        "E_c": r"E_c = E - E_0",
        "rounding": r"\text{Corr} = \frac{1}{2}e - \Delta L",
    }

    # 3. Human-readable step-by-step trace
    sign_e = "+" if uncorrected_e >= ZERO_DECIMAL else ""
    sign_ec = "+" if corrected_e >= ZERO_DECIMAL else ""
    sign_e0 = "+" if zero_error >= ZERO_DECIMAL else ""

    step_by_step = [
        (
            f"Step 1 (Digital Rounding Correction): "
            f"0.5e - Delta L = (0.5 * {e}) - {delta_load} = "
            f"{e * HALF_INTERVAL_FACTOR} - {delta_load} = {rounding_corr}"
        ),
        (
            f"Step 2 (Unrounded True Indication P): "
            f"P = I + 0.5e - Delta L = {indication} + {rounding_corr} = {p}"
        ),
        (
            f"Step 3 (Uncorrected Error of Indication E): "
            f"E = P - L = {p} - {load} = {sign_e}{uncorrected_e}"
        ),
        (
            f"Step 4 (Zero-Load Elimination E_c): "
            f"E_c = E - E_0 = ({sign_e}{uncorrected_e}) - ({sign_e0}{zero_error}) = "
            f"{sign_ec}{corrected_e}"
        ),
    ]

    return ChangeoverResult(
        load=load,
        indication=indication,
        e=e,
        delta_load=delta_load,
        zero_error=zero_error,
        p_true_indication=p,
        uncorrected_error=uncorrected_e,
        corrected_error=corrected_e,
        rounding_correction=rounding_corr,
        formula_latex=formula_latex,
        step_by_step_explanation=step_by_step,
        statutory_citation=STATUTORY_CITATION_A443,
    )


def compute_observation_changeover(
    point: ObservationPoint,
    zero_error: Decimal = ZERO_DECIMAL,
    fallback_e: Decimal | None = None,
) -> ChangeoverResult:
    """
    Compute changeover point directly from an ObservationPoint Pydantic model.

    Args:
        point: ObservationPoint containing load, indication, delta_load, and optional e.
        zero_error: Applicable zero-load error E_0.
        fallback_e: Verification interval e to use if not specified on the point.

    Returns:
        Structured ChangeoverResult.

    Raises:
        ValueError: If e is not defined on the point and fallback_e is not provided.
    """
    effective_e = point.e if point.e is not None else fallback_e
    if effective_e is None:
        raise ValueError(
            "Verification scale interval e must be provided on ObservationPoint "
            "or via fallback_e parameter to compute changeover turning point."
        )

    return compute_changeover_point(
        load=point.load,
        indication=point.indication,
        e=effective_e,
        delta_load=point.delta_load,
        zero_error=zero_error,
    )


def evaluate_observation_series(
    points: list[ObservationPoint],
    default_e: Decimal | None = None,
    initial_zero_error: Decimal | None = None,
) -> ChangeoverSeriesResult:
    """
    Evaluate an entire series of observation points across an NAWI test run.

    Automatically resolves zero-load error E_0:
    - If `initial_zero_error` is explicitly passed, it is used.
    - Otherwise, searches for the first observation with load == 0 to determine E_0.
    - If no zero-load observation exists, defaults E_0 to 0.

    Args:
        points: Ordered list of ObservationPoint models (e.g. ascending or descending test run).
        default_e: Scale interval e to use if not specified on individual points.
        initial_zero_error: Optional explicit zero error override.

    Returns:
        ChangeoverSeriesResult containing each calculated point and summary span statistics.

    Raises:
        ValueError: If points list is empty.
    """
    if not points:
        raise ValueError("Cannot evaluate changeover series on an empty points list.")

    # 1. Establish baseline zero error E_0
    if initial_zero_error is not None:
        e_0 = initial_zero_error
    else:
        # Look for observation with load == 0
        zero_point = next((p for p in points if p.load == ZERO_DECIMAL), None)
        if zero_point is not None:
            eff_e = zero_point.e if zero_point.e is not None else default_e
            if eff_e is None:
                raise ValueError("Verification interval e required to compute baseline zero error.")
            e_0 = calculate_zero_error(
                indication_at_zero=zero_point.indication,
                e=eff_e,
                delta_load_at_zero=zero_point.delta_load,
                zero_load=zero_point.load,
            )
        else:
            e_0 = ZERO_DECIMAL

    # 2. Compute changeover for every point in series
    results: list[ChangeoverResult] = []
    for pt in points:
        res = compute_observation_changeover(
            point=pt,
            zero_error=e_0,
            fallback_e=default_e,
        )
        results.append(res)

    # 3. Compute series aggregate metrics
    all_corrected_errors = [r.corrected_error for r in results]
    max_ec = max(all_corrected_errors)
    min_ec = min(all_corrected_errors)
    span = max_ec - min_ec

    return ChangeoverSeriesResult(
        zero_error=e_0,
        observations=results,
        max_corrected_error=max_ec,
        min_corrected_error=min_ec,
        error_span=span,
    )
