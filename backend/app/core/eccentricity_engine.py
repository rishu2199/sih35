"""METROLOGIX-76 — OIML R 76-1 Clause A.4.7 Eccentricity (Corner Loading) Test Engine.

Statutory References:
- OIML R 76-1:2006 Clause 3.6.2: Eccentric loading errors.
- OIML R 76-1:2006 Clause A.4.7: Eccentricity tests:
  * A.4.7.1: Platform instruments with not more than 4 points of support:
    Test load = 1/3 (Max + Additive Tare).
    Placed sequentially in center and each of the 4 quadrants / corners.
  * A.4.7.2: Platform instruments with more than 4 points of support:
    Test load = 1 / (N - 1) * (Max + Additive Tare), where N is number of supports.
  * A.4.7.3: Instruments with special load receptors (tank, hopper, etc.):
    Test load applied over each support point (1 / (N - 1) Max or 0.1 Max).
  * A.4.7.4: Instruments designed for rolling loads (vehicle weighbridges / track scales):
    Rolling test load = 0.8 Max (standard axle loading) applied along track.
  * Clause 3.6.2.4: Instruments with hanging load receptors:
    Test load = 0.5 Max.
- Legal Metrology (General) Rules, 2011, Seventh Schedule, Heading A, Para 9(1)(b):
  "The maximum permissible errors on eccentricity tests shall be the maximum permissible
   errors on initial verification for that load."

Zero-Bug Rules:
1. Pure functions with explicit Decimal parameter typing and zero floating-point math.
2. Lossless Decimal arithmetic throughout; exact error subtraction E_c = E - E_0.
3. Strict enforcement of test load placement sequence per R 76-1:
   Center (Pos 1) -> Front-Left (Pos 2) -> Back-Left (Pos 3) ->
   Back-Right (Pos 4) -> Front-Right (Pos 5).
4. Stage-aware MPE evaluation: Default is Initial Verification MPE (1x Table 6),
   with explicit support for In-Service inspection (2x Table 6).
5. Comprehensive cantilever deflection and structural weakness diagnostics:
   Calculates maximum inter-corner spread Delta E_corner = E_c,max - E_c,min,
   maximum absolute deflection, and identifies suspect load cells or mechanical lever binding.
"""

from __future__ import annotations

from collections.abc import Sequence
from decimal import Decimal
from typing import Final

from pydantic import Field, model_validator

from app.core.changeover_engine import (
    calculate_changeover,
    calculate_corrected_error,
    calculate_uncorrected_error,
)
from app.core.mpe_resolver import MPEResult, resolve_mpe
from app.core.schemas import (
    EccentricityObservation,
    InstrumentSpecification,
    MetrologyBaseModel,
)
from app.core.types import (
    AccuracyClass,
    ComplianceStatus,
    CornerPosition,
    LoadReceptorType,
    VerificationStage,
)

# ============================================================================
# Statutory Constants & Citations (OIML R 76-1:2006 Clause A.4.7)
# ============================================================================

STATUTORY_CITATION_ECC_4_POINTS: Final[str] = (
    "OIML R 76-1:2006 Clause A.4.7.1 / LM (General) Rules 2011 Seventh Schedule Para 9(1)(b)"
)
STATUTORY_CITATION_ECC_MULTI_POINTS: Final[str] = (
    "OIML R 76-1:2006 Clause A.4.7.2 / LM (General) Rules 2011 Seventh Schedule Para 9(1)(b)"
)
STATUTORY_CITATION_ECC_SPECIAL: Final[str] = (
    "OIML R 76-1:2006 Clause A.4.7.3 / LM (General) Rules 2011 Seventh Schedule Para 9(1)(b)"
)
STATUTORY_CITATION_ECC_ROLLING: Final[str] = (
    "OIML R 76-1:2006 Clause A.4.7.4 / LM (General) Rules 2011 Seventh Schedule Para 9(1)(b)"
)
STATUTORY_CITATION_ECC_HANGING: Final[str] = (
    "OIML R 76-1:2006 Clause 3.6.2.4 / LM (General) Rules 2011 Seventh Schedule Para 9(1)(b)"
)

FACTOR_FOUR_POINTS: Final[Decimal] = Decimal("1") / Decimal("3")
FACTOR_ROLLING_LOAD: Final[Decimal] = Decimal("0.8")
FACTOR_SUSPENDED_LOAD: Final[Decimal] = Decimal("0.5")
FACTOR_SPECIAL_HOPPER: Final[Decimal] = Decimal("0.1")

ZERO_DECIMAL: Final[Decimal] = Decimal("0")
ONE_DECIMAL: Final[Decimal] = Decimal("1")
HUNDRED_DECIMAL: Final[Decimal] = Decimal("100")
QUANTIZE_LOAD_STEP: Final[Decimal] = Decimal("0.0001")

# Standard 5-point placement sequence prescribed by OIML R 76-1 Clause A.4.7.1
STANDARD_4_CORNER_SEQUENCE: Final[tuple[CornerPosition, ...]] = (
    CornerPosition.CENTER,
    CornerPosition.FRONT_LEFT,
    CornerPosition.BACK_LEFT,
    CornerPosition.BACK_RIGHT,
    CornerPosition.FRONT_RIGHT,
)


# ============================================================================
# Platter Coordinates & Visual Heatmap Models
# ============================================================================


class PlatterCoordinate(MetrologyBaseModel):
    """Normalized 2D coordinates on the load platter for UI visualization and heatmaps."""

    x_norm: Decimal = Field(
        ...,
        description="Normalized X position (-1.0 = left, 0.0 = center, +1.0 = right).",
    )
    y_norm: Decimal = Field(
        ...,
        description="Normalized Y position (-1.0 = front, 0.0 = center, +1.0 = back).",
    )
    display_x_pct: Decimal = Field(
        ...,
        description="Display X coordinate percentage (0.0% to 100.0%).",
    )
    display_y_pct: Decimal = Field(
        ...,
        description="Display Y coordinate percentage (0.0% to 100.0%).",
    )


def get_platter_coordinate(
    position: CornerPosition | str,
    sequence_index: int = 1,
    total_points: int = 5,
) -> PlatterCoordinate:
    """Return standard normalized coordinates for rendering on 2D platter UI."""
    pos_str = position.value if isinstance(position, CornerPosition) else str(position).upper()

    if pos_str == CornerPosition.CENTER.value or "CENTER" in pos_str:
        return PlatterCoordinate(
            x_norm=Decimal("0.0"),
            y_norm=Decimal("0.0"),
            display_x_pct=Decimal("50.0"),
            display_y_pct=Decimal("50.0"),
        )
    elif pos_str == CornerPosition.FRONT_LEFT.value or "FRONT_LEFT" in pos_str:
        return PlatterCoordinate(
            x_norm=Decimal("-1.0"),
            y_norm=Decimal("-1.0"),
            display_x_pct=Decimal("15.0"),
            display_y_pct=Decimal("85.0"),
        )
    elif pos_str == CornerPosition.BACK_LEFT.value or "BACK_LEFT" in pos_str:
        return PlatterCoordinate(
            x_norm=Decimal("-1.0"),
            y_norm=Decimal("1.0"),
            display_x_pct=Decimal("15.0"),
            display_y_pct=Decimal("15.0"),
        )
    elif pos_str == CornerPosition.BACK_RIGHT.value or "BACK_RIGHT" in pos_str:
        return PlatterCoordinate(
            x_norm=Decimal("1.0"),
            y_norm=Decimal("1.0"),
            display_x_pct=Decimal("85.0"),
            display_y_pct=Decimal("15.0"),
        )
    elif pos_str == CornerPosition.FRONT_RIGHT.value or "FRONT_RIGHT" in pos_str:
        return PlatterCoordinate(
            x_norm=Decimal("1.0"),
            y_norm=Decimal("-1.0"),
            display_x_pct=Decimal("85.0"),
            display_y_pct=Decimal("85.0"),
        )
    elif "TRACK_ENTRY" in pos_str:
        return PlatterCoordinate(
            x_norm=Decimal("-1.0"),
            y_norm=Decimal("0.0"),
            display_x_pct=Decimal("10.0"),
            display_y_pct=Decimal("50.0"),
        )
    elif "TRACK_MIDDLE" in pos_str:
        return PlatterCoordinate(
            x_norm=Decimal("0.0"),
            y_norm=Decimal("0.0"),
            display_x_pct=Decimal("50.0"),
            display_y_pct=Decimal("50.0"),
        )
    elif "TRACK_EXIT" in pos_str:
        return PlatterCoordinate(
            x_norm=Decimal("1.0"),
            y_norm=Decimal("0.0"),
            display_x_pct=Decimal("90.0"),
            display_y_pct=Decimal("50.0"),
        )
    else:
        # Generic multi-support position fallback evenly distributed along border
        if total_points > 1:
            ratio = Decimal(sequence_index - 1) / Decimal(total_points - 1)
            x_pct = (Decimal("15.0") + ratio * Decimal("70.0")).quantize(Decimal("0.1"))
            y_pct = Decimal("50.0")
            return PlatterCoordinate(
                x_norm=(x_pct - Decimal("50.0")) / Decimal("50.0"),
                y_norm=Decimal("0.0"),
                display_x_pct=x_pct,
                display_y_pct=y_pct,
            )
        return PlatterCoordinate(
            x_norm=Decimal("0.0"),
            y_norm=Decimal("0.0"),
            display_x_pct=Decimal("50.0"),
            display_y_pct=Decimal("50.0"),
        )


# ============================================================================
# Evaluated Corner Point & Session Models
# ============================================================================


class EvaluatedCornerPoint(MetrologyBaseModel):
    """Statutory evaluation for a single off-center / corner observation point."""

    position: CornerPosition | str = Field(
        ...,
        description="Receptor placement position (Center, Front-Left, Back-Left, etc.).",
    )
    position_label: str = Field(
        ...,
        description="Human-readable statutory position descriptor.",
    )
    sequence_order: int = Field(
        ...,
        ge=1,
        description="1-indexed sequence order in which this load position was tested.",
    )
    load: Decimal = Field(
        ...,
        description="Standard reference test load (L) applied at this position.",
    )
    indication: Decimal = Field(
        ...,
        description="Observed digital indication (I) on the instrument display.",
    )
    delta_load: Decimal = Field(
        default=ZERO_DECIMAL,
        description="Auxiliary weight (Delta L) to reach digital changeover point.",
    )
    e: Decimal = Field(
        ...,
        description="Verification scale interval (e).",
    )
    turning_point: Decimal = Field(
        ...,
        description="Unrounded true indication P = I + 0.5e - Delta L.",
    )
    uncorrected_error: Decimal = Field(
        ...,
        description="Uncorrected error of indication E = P - L.",
    )
    zero_error: Decimal = Field(
        default=ZERO_DECIMAL,
        description="Zero-load reference baseline error E_0.",
    )
    corrected_error: Decimal = Field(
        ...,
        description="Corrected error E_c = E - E_0 eliminating zero-setting bias.",
    )
    mpe: MPEResult = Field(
        ...,
        description="Stage-aware Table 6 Maximum Permissible Error determination.",
    )
    margin: Decimal = Field(
        ...,
        description="Absolute compliance margin: |MPE| - |E_c|.",
    )
    status: ComplianceStatus = Field(
        ...,
        description="Statutory verdict (PASS / MARGINAL / FAIL).",
    )
    coordinate: PlatterCoordinate = Field(
        ...,
        description="Normalized 2D coordinates for platter heatmap rendering.",
    )
    latex_formula: str = Field(
        ...,
        description="LaTeX representation of the changeover and error calculation.",
    )


class EccentricityEvaluationResult(MetrologyBaseModel):
    """Complete statutory evaluation report for an OIML R 76-1 Clause A.4.7 test session.

    Contains:
    - Prescribed nominal test load and statutory calculation rule citation.
    - Evaluated data points across all support positions.
    - Inter-corner spread Delta E_corner = E_c,max - E_c,min.
    - Maximum absolute corner deflection.
    - Overall statutory compliance verdict.
    - Mechanical cantilever deflection diagnostics.
    """

    test_load_calculated: Decimal = Field(
        ...,
        description="Nominal statutory test load derived from capacity and receptor type.",
    )
    statutory_rule_applied: str = Field(
        ...,
        description="OIML R 76-1 / LM Rules citation for the test load derivation.",
    )
    points: list[EvaluatedCornerPoint] = Field(
        ...,
        description="Evaluated observation points across all tested positions.",
    )
    zero_error_applied: Decimal = Field(
        default=ZERO_DECIMAL,
        description="Baseline zero error E_0 applied for error correction.",
    )
    max_corrected_error: Decimal = Field(
        ...,
        description="Maximum signed corrected error observed across all corners.",
    )
    min_corrected_error: Decimal = Field(
        ...,
        description="Minimum signed corrected error observed across all corners.",
    )
    corner_error_spread: Decimal = Field(
        ...,
        description="Maximum inter-corner spread: Delta E_corner = E_c,max - E_c,min.",
    )
    max_absolute_error: Decimal = Field(
        ...,
        description="Maximum absolute deflection: max |E_c,k|.",
    )
    mpe_limit: Decimal = Field(
        ...,
        description="Absolute statutory MPE tolerance at the eccentricity test load.",
    )
    overall_status: ComplianceStatus = Field(
        ...,
        description="Overall test compliance verdict (PASS / MARGINAL / FAIL).",
    )
    worst_point: EvaluatedCornerPoint = Field(
        ...,
        description="Corner point exhibiting the greatest absolute error deflection.",
    )
    sequence_is_compliant: bool = Field(
        ...,
        description="Whether test load positions followed prescribed OIML sequence.",
    )
    sequence_notes: str | None = Field(
        default=None,
        description="Detailed notes regarding loading order compliance.",
    )
    cantilever_deflection_detected: bool = Field(
        ...,
        description="True if a corner exhibits severe localized mechanical deflection.",
    )
    cantilever_diagnosis: str | None = Field(
        default=None,
        description="Physical metrology diagnosis of mechanical cantilever or mounting issues.",
    )
    summary_latex: str = Field(
        ...,
        description="LaTeX summary formula for official R 76-2 verification reports.",
    )

    @model_validator(mode="after")
    def _validate_session(self) -> EccentricityEvaluationResult:
        """Validate result consistency."""
        if not self.points:
            raise ValueError("Eccentricity evaluation result must contain at least one point.")
        return self


# ============================================================================
# Core Metrological Calculation Functions
# ============================================================================


def calculate_eccentricity_test_load(
    max_capacity: Decimal,
    receptor_type: LoadReceptorType = LoadReceptorType.PLATFORM,
    num_supports: int = 4,
    additive_tare: Decimal = ZERO_DECIMAL,
    e: Decimal | None = None,
) -> Decimal:
    """Calculate the statutory nominal test load for OIML R 76-1 Clause A.4.7 tests.

    Statutory Load Rules:
    1. Platform instruments with <= 4 supports (Clause A.4.7.1):
       L = 1/3 * (Max + Additive Tare).
    2. Platform instruments with > 4 supports (Clause A.4.7.2):
       L = 1 / (N - 1) * (Max + Additive Tare), where N is number of support points.
    3. Vehicle weighbridges and rolling loads (Clause A.4.7.4):
       L = 0.8 * Max (standard rolling axle load).
    4. Hanging / crane scales (Clause 3.6.2.4):
       L = 0.5 * Max.
    5. Special tank / hopper weighers with minimal off-center loading (Clause A.4.7.3):
       If N > 4: L = 1 / (N - 1) * (Max + Additive Tare).
       Else: L = 0.1 * Max.

    Args:
        max_capacity: Declared maximum capacity (Max). Must be strictly positive.
        receptor_type: Load receptor physical classification.
        num_supports: Number of load cells or physical support points (default 4).
        additive_tare: Declared maximum additive tare effect (T_add, default 0).
        e: Optional verification scale interval e for display quantization.

    Returns:
        Exact statutory test load as Decimal.

    Raises:
        ValueError: If max_capacity <= 0, num_supports < 1, or additive_tare < 0.
    """
    if max_capacity <= ZERO_DECIMAL:
        raise ValueError(f"Max capacity must be strictly positive, got: {max_capacity}")
    if num_supports < 1:
        raise ValueError(f"Number of support points must be >= 1, got: {num_supports}")
    if additive_tare < ZERO_DECIMAL:
        raise ValueError(f"Additive tare cannot be negative, got: {additive_tare}")

    total_cap = max_capacity + additive_tare

    if receptor_type == LoadReceptorType.WEIGHBRIDGE:
        # Clause A.4.7.4: Rolling load on vehicle weighbridges
        raw_load = max_capacity * FACTOR_ROLLING_LOAD
    elif receptor_type in (LoadReceptorType.TANK, LoadReceptorType.SUSPENDED_HOPPER):
        # Clause A.4.7.3: Hopper / tank with N supports
        if num_supports > 4:
            divisor = Decimal(num_supports - 1)
            raw_load = total_cap / divisor
        else:
            raw_load = max_capacity * FACTOR_SPECIAL_HOPPER
    elif receptor_type == LoadReceptorType.HANGING:
        # Clause 3.6.2.4: Suspended load receptor
        raw_load = max_capacity * FACTOR_SUSPENDED_LOAD
    else:
        # Standard platform / bench / counter scale
        if num_supports > 4:
            # Clause A.4.7.2: Platform with > 4 supports: 1 / (N - 1) Max
            divisor = Decimal(num_supports - 1)
            raw_load = total_cap / divisor
        else:
            # Clause A.4.7.1: Platform with <= 4 supports: 1/3 Max
            raw_load = total_cap * FACTOR_FOUR_POINTS

    # If verification scale interval e is provided, check if sensible quantization helps
    if e is not None and e > ZERO_DECIMAL:
        # Keep precision clean to 4 decimal places
        return raw_load.quantize(QUANTIZE_LOAD_STEP)
    return raw_load.quantize(QUANTIZE_LOAD_STEP)


def get_standard_corner_positions(
    receptor_type: LoadReceptorType,
    num_supports: int = 4,
) -> list[tuple[CornerPosition | str, str]]:
    """Return standard list of (position_code, label) for the given receptor configuration."""
    if receptor_type == LoadReceptorType.PLATFORM and num_supports <= 4:
        return [
            (CornerPosition.CENTER, "Center (Position 1)"),
            (CornerPosition.FRONT_LEFT, "Front-Left Corner (Position 2)"),
            (CornerPosition.BACK_LEFT, "Back-Left Corner (Position 3)"),
            (CornerPosition.BACK_RIGHT, "Back-Right Corner (Position 4)"),
            (CornerPosition.FRONT_RIGHT, "Front-Right Corner (Position 5)"),
        ]
    elif receptor_type == LoadReceptorType.WEIGHBRIDGE:
        return [
            ("TRACK_ENTRY", "Track Entry / Position 1 (Beginning of Platform)"),
            ("TRACK_MIDDLE", "Track Middle / Position 2 (Center of Platform)"),
            ("TRACK_EXIT", "Track Exit / Position 3 (End of Platform)"),
        ]
    elif (
        receptor_type in (LoadReceptorType.TANK, LoadReceptorType.SUSPENDED_HOPPER)
        or num_supports > 4
    ):
        n = max(num_supports, 3)
        pts: list[tuple[CornerPosition | str, str]] = []
        for i in range(1, n + 1):
            pts.append((f"SUPPORT_{i}", f"Support Point {i} (Load Cell {i})"))
        return pts
    else:
        return [
            (CornerPosition.CENTER, "Center Position (Position 1)"),
            (CornerPosition.FRONT_LEFT, "Off-Center Quadrant A (Position 2)"),
            (CornerPosition.FRONT_RIGHT, "Off-Center Quadrant B (Position 3)"),
        ]


def evaluate_corner_point(
    position: CornerPosition | str,
    load: Decimal,
    indication: Decimal,
    e: Decimal,
    delta_load: Decimal = ZERO_DECIMAL,
    zero_error: Decimal = ZERO_DECIMAL,
    accuracy_class: AccuracyClass = AccuracyClass.CLASS_III,
    stage: VerificationStage = VerificationStage.INITIAL_TYPE_APPROVAL,
    sequence_order: int = 1,
    position_label: str | None = None,
    total_points: int = 5,
) -> EvaluatedCornerPoint:
    """Evaluate a single corner or off-center observation point.

    Computes:
    - P = I + 0.5e - Delta L
    - E = P - L
    - E_c = E - E_0
    - MPE(L) via Table 6 step limits
    - Compliance status (PASS / MARGINAL / FAIL)
    - Normalized 2D platter coordinate

    Args:
        position: Placement position enum or identifier string.
        load: Standard certified reference weight (L).
        indication: Displayed indication (I).
        e: Verification scale interval (e).
        delta_load: Auxiliary weights (Delta L) to digital changeover point.
        zero_error: Zero-load reference error (E_0).
        accuracy_class: Instrument AccuracyClass.
        stage: VerificationStage (INITIAL_TYPE_APPROVAL or SUBSEQUENT_IN_SERVICE).
        sequence_order: 1-indexed order in testing sequence.
        position_label: Optional descriptive text.
        total_points: Total points in session for coordinate scaling.

    Returns:
        EvaluatedCornerPoint with full mathematical derivation.
    """
    if e <= ZERO_DECIMAL:
        raise ValueError(f"Verification scale interval e must be strictly positive, got: {e}")
    if load < ZERO_DECIMAL:
        raise ValueError(f"Reference test load L cannot be negative, got: {load}")

    # 1. Unrounded digital changeover turning point: P = I + 0.5e - Delta L
    p = calculate_changeover(indication=indication, e=e, delta_load=delta_load)

    # 2. Uncorrected indication error: E = P - L
    uncorrected_err = calculate_uncorrected_error(turning_point=p, load=load)

    # 3. Corrected indication error: E_c = E - E_0
    corrected_err = calculate_corrected_error(
        uncorrected_error=uncorrected_err,
        zero_error=zero_error,
    )

    # 4. Resolve Stage-Aware Maximum Permissible Error (MPE)
    mpe_res = resolve_mpe(
        load=load,
        e=e,
        accuracy_class=accuracy_class,
        stage=stage,
        corrected_error=corrected_err,
    )

    abs_ec = abs(corrected_err)
    abs_mpe = abs(mpe_res.mpe_value)
    margin = abs_mpe - abs_ec

    if abs_ec < abs_mpe:
        verdict = ComplianceStatus.PASS
    elif abs_ec == abs_mpe:
        verdict = ComplianceStatus.MARGINAL
    else:
        verdict = ComplianceStatus.FAIL

    # 5. Position label
    pos_str = position.value if isinstance(position, CornerPosition) else str(position)
    if not position_label:
        std_labels: dict[str, str] = {
            CornerPosition.CENTER.value: "Center (Position 1)",
            CornerPosition.FRONT_LEFT.value: "Front-Left Corner (Position 2)",
            CornerPosition.BACK_LEFT.value: "Back-Left Corner (Position 3)",
            CornerPosition.BACK_RIGHT.value: "Back-Right Corner (Position 4)",
            CornerPosition.FRONT_RIGHT.value: "Front-Right Corner (Position 5)",
        }
        position_label = std_labels.get(pos_str, f"Position {sequence_order} ({pos_str})")


    # 6. Normalized 2D coordinates on platter
    coordinate = get_platter_coordinate(
        position=position,
        sequence_index=sequence_order,
        total_points=total_points,
    )

    # 7. LaTeX formula representation for legal verification reporting
    latex_formula = (
        rf"P = {indication} + 0.5({e}) - {delta_load} = {p}; \quad "
        rf"E = {p} - {load} = {uncorrected_err}; \quad "
        rf"E_c = {uncorrected_err} - ({zero_error}) = {corrected_err}; \quad "
        rf"|\text{{MPE}}| = \pm {mpe_res.mpe_value}"
    )

    return EvaluatedCornerPoint(
        position=position,
        position_label=position_label,
        sequence_order=sequence_order,
        load=load,
        indication=indication,
        delta_load=delta_load,
        e=e,
        turning_point=p,
        uncorrected_error=uncorrected_err,
        zero_error=zero_error,
        corrected_error=corrected_err,
        mpe=mpe_res,
        margin=margin,
        status=verdict,
        coordinate=coordinate,
        latex_formula=latex_formula,
    )


def evaluate_eccentricity_session(
    observations: Sequence[EccentricityObservation],
    spec: InstrumentSpecification,
    stage: VerificationStage = VerificationStage.INITIAL_TYPE_APPROVAL,
    zero_error: Decimal = ZERO_DECIMAL,
    additive_tare: Decimal = ZERO_DECIMAL,
) -> EccentricityEvaluationResult:
    """Master evaluator for an OIML R 76-1 Clause A.4.7 Eccentricity Test session.

    Evaluates:
    - Nominal required test load based on capacity and receptor type.
    - Each corner observation point against stage-aware MPE.
    - Maximum inter-corner spread: Delta E_corner = E_c,max - E_c,min.
    - Overall session PASS / FAIL verdict.
    - OIML load placement sequence compliance.
    - Cantilever deflection and structural diagnostics.

    Args:
        observations: Sequence of recorded EccentricityObservation items.
        spec: Declared instrument specifications.
        stage: VerificationStage (INITIAL_TYPE_APPROVAL or SUBSEQUENT_IN_SERVICE).
        zero_error: Baseline zero error E_0 (default 0).
        additive_tare: Declared additive tare capacity (default 0).

    Returns:
        Structured, immutable EccentricityEvaluationResult.

    Raises:
        ValueError: If observations sequence is empty.
    """
    if not observations:
        raise ValueError("Cannot evaluate eccentricity session with empty observations.")

    # 1. Calculate statutory nominal test load
    nominal_load = calculate_eccentricity_test_load(
        max_capacity=spec.max_capacity,
        receptor_type=spec.receptor_type,
        num_supports=spec.num_supports,
        additive_tare=additive_tare,
        e=spec.e,
    )

    # 2. Determine statutory rule citation
    if spec.receptor_type == LoadReceptorType.WEIGHBRIDGE:
        statutory_rule = STATUTORY_CITATION_ECC_ROLLING
    elif spec.receptor_type in (LoadReceptorType.TANK, LoadReceptorType.SUSPENDED_HOPPER):
        statutory_rule = STATUTORY_CITATION_ECC_SPECIAL
    elif spec.receptor_type == LoadReceptorType.HANGING:
        statutory_rule = STATUTORY_CITATION_ECC_HANGING
    elif spec.num_supports > 4:
        statutory_rule = STATUTORY_CITATION_ECC_MULTI_POINTS
    else:
        statutory_rule = STATUTORY_CITATION_ECC_4_POINTS

    # 3. Evaluate each corner observation point
    evaluated_points: list[EvaluatedCornerPoint] = []
    total_obs = len(observations)

    for idx, obs in enumerate(observations, start=1):
        point_eval = evaluate_corner_point(
            position=obs.position,
            load=obs.load,
            indication=obs.indication,
            e=obs.e if obs.e > ZERO_DECIMAL else spec.e,
            delta_load=obs.delta_load,
            zero_error=zero_error,
            accuracy_class=spec.accuracy_class,
            stage=stage,
            sequence_order=idx,
            total_points=total_obs,
        )
        evaluated_points.append(point_eval)

    # 4. Compute error distribution metrics
    corrected_errors = [p.corrected_error for p in evaluated_points]
    max_ec = max(corrected_errors)
    min_ec = min(corrected_errors)
    error_spread = max_ec - min_ec

    # Maximum absolute error and worst deflected corner
    worst_point = max(evaluated_points, key=lambda p: abs(p.corrected_error))
    max_abs_ec = abs(worst_point.corrected_error)
    mpe_limit = abs(worst_point.mpe.mpe_value)

    # 5. Overall compliance verdict
    # Test passes if and only if EVERY position satisfies |E_c| <= MPE
    has_failures = any(p.status == ComplianceStatus.FAIL for p in evaluated_points)
    has_marginals = any(p.status == ComplianceStatus.MARGINAL for p in evaluated_points)

    if has_failures:
        overall_verdict = ComplianceStatus.FAIL
    elif has_marginals:
        overall_verdict = ComplianceStatus.MARGINAL
    else:
        overall_verdict = ComplianceStatus.PASS

    # 6. Check OIML R 76-1 sequence compliance (Center -> FL -> BL -> BR -> FR)
    sequence_is_compliant = True
    sequence_notes: str | None = None

    if (
        spec.receptor_type == LoadReceptorType.PLATFORM
        and spec.num_supports <= 4
        and total_obs >= 5
    ):
        expected_seq = list(STANDARD_4_CORNER_SEQUENCE)
        actual_seq = [
            p.position
            if isinstance(p.position, CornerPosition)
            else CornerPosition(str(p.position))
            for p in evaluated_points[:5]
        ]
        if actual_seq != expected_seq:
            sequence_is_compliant = False
            sequence_notes = (
                f"Loading order deviated from OIML R 76-1 Clause A.4.7.1 sequence: "
                f"expected {[pos.value for pos in expected_seq]}, "
                f"got {[pos.value for pos in actual_seq]}."
            )
        else:
            sequence_notes = (
                "Loading sequence strictly adheres to OIML R 76-1 Clause A.4.7.1 "
                "(Center -> Front-Left -> Back-Left -> Back-Right -> Front-Right)."
            )

    # 7. Structural Cantilever Deflection & Diagnostics (Scenario 4)
    cantilever_detected = False
    cantilever_diagnosis: str | None = None

    # Check if worst point exceeds MPE while others pass
    failing_points = [p for p in evaluated_points if p.status == ComplianceStatus.FAIL]
    passing_points = [p for p in evaluated_points if p.status != ComplianceStatus.FAIL]

    if failing_points and passing_points:
        cantilever_detected = True
        failing_names = ", ".join(p.position_label for p in failing_points)
        worst_margin_pct = (worst_point.margin / mpe_limit) * HUNDRED_DECIMAL
        cantilever_diagnosis = (
            f"Localized off-center deflection detected at {failing_names}. "
            f"Worst error of {worst_point.corrected_error:+f} {spec.unit.symbol} exceeds "
            f"MPE corridor (+/- {mpe_limit} {spec.unit.symbol}) by {abs(worst_point.margin):f} "
            f"{spec.unit.symbol} ({abs(worst_margin_pct):.1f}% deflection beyond limit). "
            f"Statutory Indication: Possible structural cantilever deflection, mounting "
            f"bolt slack, or mechanical corner lever binding (OIML R 76-1 Cl. A.4.7)."
        )
    elif error_spread > (mpe_limit * Decimal("1.5")):
        # Significant corner spread even if within MPE bounds
        cantilever_detected = True
        cantilever_diagnosis = (
            f"Noticeable inter-corner spread of {error_spread:f} {spec.unit.symbol} "
            f"observed across platter positions (Spread exceeds 1.5x MPE). "
            f"Recommend inspecting load cell leveling and mounting plate rigidity."
        )

    # 8. LaTeX summary formula
    summary_latex = (
        rf"\Delta E_{{\text{{corner}}}} = E_{{c,\max}} - E_{{c,\min}} = "
        rf"{max_ec} - ({min_ec}) = {error_spread} \, \text{{{spec.unit.symbol}}}; \quad "
        rf"|E_c|_{{\max}} = {max_abs_ec} \, \text{{{spec.unit.symbol}}} \le {mpe_limit} \, "
        rf"\text{{{spec.unit.symbol}}} \implies \mathbf{{{overall_verdict.value}}}"
    )

    return EccentricityEvaluationResult(
        test_load_calculated=nominal_load,
        statutory_rule_applied=statutory_rule,
        points=evaluated_points,
        zero_error_applied=zero_error,
        max_corrected_error=max_ec,
        min_corrected_error=min_ec,
        corner_error_spread=error_spread,
        max_absolute_error=max_abs_ec,
        mpe_limit=mpe_limit,
        overall_status=overall_verdict,
        worst_point=worst_point,
        sequence_is_compliant=sequence_is_compliant,
        sequence_notes=sequence_notes,
        cantilever_deflection_detected=cantilever_detected,
        cantilever_diagnosis=cantilever_diagnosis,
        summary_latex=summary_latex,
    )
