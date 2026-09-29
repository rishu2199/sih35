"""
METROLOGIX-76 — Multi-Interval & Multi-Range Partial Interval Resolver.

Statutory References:
- OIML R 76-1:2006 Clause 3.3: Multi-interval instruments
  - Clause 3.3.1: Partial weighing ranges (W_1, W_2, ..., W_r)
  - Clause 3.3.2: Accuracy class criteria (n_i = Max_i / e_i; e_1 < e_2 < ... < e_r)
  - Clause 3.3.3: Scale interval transitions on increasing and decreasing loads
- OIML R 76-1:2006 Clause 3.4: Multiple range instruments
- Legal Metrology (General) Rules, 2011, Seventh Schedule, Heading A, Part II

Zero-Bug Rules:
1. Enforce strict monotonic increase of verification intervals: e_1 < e_2 < ... < e_r.
2. Enforce strict monotonic increase of partial capacities: Max_1 < Max_2 < ... < Max_r.
3. Exact boundary condition handling at range switch points:
   Load L <= Max_1 is evaluated under Range 1 (W_1) with e_1.
   Load L > Max_1 is evaluated under Range 2 (W_2) with e_2.
4. Full integration with ChangeoverEngine (Step 04) and MPEResolver (Step 05).
5. Zero float conversions; 100% lossless Decimal math.
"""

from decimal import Decimal
from typing import Final

from pydantic import ConfigDict, Field

from app.core.changeover_engine import (
    ChangeoverResult,
    compute_changeover_point,
)
from app.core.mpe_resolver import MPEResult, calculate_mpe
from app.core.schemas import (
    InstrumentSpecification,
    IntervalRange,
    MetrologyBaseModel,
    ObservationPoint,
)
from app.core.types import ComplianceStatus, UnitOfMeasure, VerificationStage

# ============================================================================
# Statutory Constants
# ============================================================================

STATUTORY_CITATION_MULTI_INTERVAL: Final[str] = (
    "OIML R 76-1:2006 Clause 3.3 & Clause 3.4 / "
    "Legal Metrology (General) Rules, 2011, Seventh Schedule"
)
ZERO_DECIMAL: Final[Decimal] = Decimal("0")


# ============================================================================
# Data Contracts
# ============================================================================


class ResolvedPartialRange(MetrologyBaseModel):
    """
    Metadata describing the active partial weighing range (W_i) resolved for a specific load.
    """

    model_config = ConfigDict(frozen=True, extra="forbid")

    range_index: int = Field(
        ..., ge=1, description="1-based index of the partial weighing range (1, 2, ..., r)."
    )
    range_label: str = Field(
        ..., description="Human-readable range identifier (e.g. 'W1', 'W2', 'Range 1')."
    )
    min_capacity: Decimal = Field(
        ..., ge=Decimal("0"), description="Minimum capacity (Min_i) of this partial range."
    )
    max_capacity: Decimal = Field(
        ..., gt=Decimal("0"), description="Maximum capacity (Max_i) of this partial range."
    )
    e: Decimal = Field(
        ..., gt=Decimal("0"), description="Verification scale interval (e_i) for this range."
    )
    d: Decimal = Field(
        ..., gt=Decimal("0"), description="Actual scale interval (d_i) for this range."
    )
    n: Decimal = Field(
        ..., gt=Decimal("0"), description="Scale interval count for this range: n_i = Max_i / e_i."
    )
    is_exact_switch_point: bool = Field(
        default=False,
        description="True if the test load sits exactly on the transition boundary Max_i.",
    )


class MultiIntervalEvaluationResult(MetrologyBaseModel):
    """
    Comprehensive evaluation result combining partial range resolution, digital changeover,
    and stage-aware MPE compliance.
    """

    load: Decimal = Field(..., description="Applied reference test load (L).")
    unit: UnitOfMeasure = Field(..., description="Measurement unit of the instrument.")
    resolved_range: ResolvedPartialRange = Field(
        ..., description="Resolved partial weighing range W_i applicable to this load."
    )
    mpe_result: MPEResult = Field(
        ..., description="Statutory Table 6 MPE resolution evaluated using range interval e_i."
    )
    changeover_result: ChangeoverResult | None = Field(
        default=None,
        description="Calculated changeover point trace (P, E, E_0, E_c), if available.",
    )
    is_compliant: bool = Field(
        ..., description="Pass/Fail decision: True if error is within legal MPE."
    )
    compliance_status: ComplianceStatus = Field(
        ..., description="Standard compliance enum (PASS, FAIL, MARGINAL, or PENDING)."
    )
    margin: Decimal | None = Field(
        default=None, description="Absolute compliance margin: |MPE| - |E_c|."
    )
    step_by_step_explanation: list[str] = Field(
        ..., description="Audit trace documenting partial range match and MPE resolution."
    )
    statutory_citation: str = Field(
        default=STATUTORY_CITATION_MULTI_INTERVAL,
        description="Legal citation under OIML R 76-1 Clause 3.3.",
    )


# ============================================================================
# 1. Pure Monotonicity & Coherence Validation Functions
# ============================================================================


def validate_multi_interval_ranges(ranges: list[IntervalRange]) -> None:
    """
    Validate that partial weighing ranges strictly adhere to OIML R 76-1 Clause 3.3.

    Statutory Invariants:
    1. At least 2 partial ranges (W_1, W_2).
    2. Indices must be strictly consecutive starting at 1: [1, 2, ..., r].
    3. Partial capacities must strictly increase: Max_1 < Max_2 < ... < Max_r.
    4. Verification scale intervals must strictly increase: e_1 < e_2 < ... < e_r.
    5. Actual intervals must satisfy: d_i <= e_i for all i.

    Args:
        ranges: List of IntervalRange models.

    Raises:
        ValueError: If any statutory invariant is violated.
    """
    if not ranges or len(ranges) < 2:
        raise ValueError(
            "Multi-interval instruments must declare at least 2 partial weighing ranges "
            "(OIML R 76-1 Clause 3.3)."
        )

    # Check consecutive 1-based indexing
    sorted_by_index = sorted(ranges, key=lambda r: r.range_index)
    actual_indices = [r.range_index for r in sorted_by_index]
    expected_indices = list(range(1, len(ranges) + 1))
    if actual_indices != expected_indices:
        raise ValueError(
            f"Partial range indices must be strictly consecutive starting at 1. "
            f"Got: {actual_indices}, expected: {expected_indices}."
        )

    for i in range(len(sorted_by_index) - 1):
        curr_r = sorted_by_index[i]
        next_r = sorted_by_index[i + 1]

        # 1. Strictly monotonic capacity increase: Max_i < Max_{i+1}
        if curr_r.max_capacity >= next_r.max_capacity:
            raise ValueError(
                f"Range {curr_r.range_index} Max ({curr_r.max_capacity}) must be strictly less "
                f"than Range {next_r.range_index} Max ({next_r.max_capacity}) per OIML Cl. 3.3.1."
            )

        # 2. Strictly monotonic interval increase: e_i < e_{i+1} (Zero-Bug Rule)
        if curr_r.e >= next_r.e:
            raise ValueError(
                f"Verification scale interval must strictly increase with load range: "
                f"Range {curr_r.range_index} e ({curr_r.e}) is not strictly less than "
                f"Range {next_r.range_index} e ({next_r.e}) as mandated by OIML R 76-1 Cl. 3.3.1."
            )

        # 3. Check actual scale interval d_i <= e_i
        if curr_r.d > curr_r.e:
            raise ValueError(
                f"Range {curr_r.range_index}: actual scale interval d ({curr_r.d}) cannot exceed "
                f"verification interval e ({curr_r.e}) as per OIML R 76-1 Cl. 3.1.2."
            )


# ============================================================================
# 2. Active Partial Range Resolver
# ============================================================================


def resolve_active_partial_range(
    load: Decimal,
    ranges: list[IntervalRange],
) -> ResolvedPartialRange:
    """
    Identify the active partial weighing range W_i applicable to a given test load L.

    Statutory Transition Rule (OIML R 76-1 Clause 3.3):
    - Partial ranges are sorted in ascending order of Max_i: W_1, W_2, ..., W_r.
    - If L <= Max_1: active range is W_1 with verification interval e_1.
    - If Max_1 < L <= Max_2: active range is W_2 with verification interval e_2.
    - If L > Max_{r-1}: active range is W_r with verification interval e_r.
    - At exact transition point L == Max_i: falls into Range i (W_i).

    Args:
        load: Standard test load L applied to the receptor.
        ranges: Declared list of partial interval ranges.

    Returns:
        Immutable ResolvedPartialRange instance.

    Raises:
        ValueError: If load is negative or ranges list is empty.
    """
    if load < ZERO_DECIMAL:
        raise ValueError(f"Test load cannot be negative in range resolution, got: {load}")

    validate_multi_interval_ranges(ranges)

    sorted_ranges = sorted(ranges, key=lambda r: r.max_capacity)

    # Search for first range where load <= Max_i
    for r in sorted_ranges:
        if load <= r.max_capacity:
            is_switch = load == r.max_capacity and r.range_index < len(sorted_ranges)
            return ResolvedPartialRange(
                range_index=r.range_index,
                range_label=f"W{r.range_index}",
                min_capacity=r.min_capacity,
                max_capacity=r.max_capacity,
                e=r.e,
                d=r.d,
                n=r.n,
                is_exact_switch_point=is_switch,
            )

    # If load exceeds highest partial max, use highest range (W_r)
    highest_range = sorted_ranges[-1]
    return ResolvedPartialRange(
        range_index=highest_range.range_index,
        range_label=f"W{highest_range.range_index}",
        min_capacity=highest_range.min_capacity,
        max_capacity=highest_range.max_capacity,
        e=highest_range.e,
        d=highest_range.d,
        n=highest_range.n,
        is_exact_switch_point=False,
    )


# ============================================================================
# 3. Comprehensive Multi-Interval Evaluators
# ============================================================================


def calculate_multi_interval_mpe(
    load: Decimal,
    spec: InstrumentSpecification,
    stage: VerificationStage = VerificationStage.INITIAL_TYPE_APPROVAL,
    corrected_error: Decimal | None = None,
) -> MultiIntervalEvaluationResult:
    """
    Calculate stage-aware MPE for a multi-interval instrument by dynamically resolving e_i.

    Args:
        load: Test load L.
        spec: Complete InstrumentSpecification model.
        stage: Statutory verification stage (INITIAL_TYPE_APPROVAL or SUBSEQUENT_IN_SERVICE).
        corrected_error: Optional corrected error E_c to evaluate against MPE.

    Returns:
        Structured MultiIntervalEvaluationResult.
    """
    if not spec.is_multi_interval or not spec.intervals_array:
        # Fallback for single-interval instruments
        resolved_range = ResolvedPartialRange(
            range_index=1,
            range_label="W1",
            min_capacity=spec.min_capacity,
            max_capacity=spec.max_capacity,
            e=spec.e,
            d=spec.d,
            n=spec.n,
            is_exact_switch_point=False,
        )
        effective_e = spec.e
    else:
        resolved_range = resolve_active_partial_range(load, spec.intervals_array)
        effective_e = resolved_range.e

    # Evaluate Table 6 MPE with resolved range verification interval e_i
    mpe_res = calculate_mpe(
        load=load,
        e=effective_e,
        accuracy_class=spec.accuracy_class,
        stage=stage,
        corrected_error=corrected_error,
    )

    is_comp = mpe_res.is_compliant is True if corrected_error is not None else True
    status = mpe_res.compliance_status

    switch_text = " (Exact Range Switch Boundary)" if resolved_range.is_exact_switch_point else ""
    explanations = [
        (
            f"Partial Range Resolution: Load L = {load} {spec.unit.symbol} resolved to "
            f"{resolved_range.range_label} [{resolved_range.min_capacity} - "
            f"{resolved_range.max_capacity} {spec.unit.symbol}]{switch_text} -> "
            f"Applied scale interval e_{resolved_range.range_index} = "
            f"{effective_e} {spec.unit.symbol}"
        ),
        *mpe_res.step_by_step_explanation,
    ]

    return MultiIntervalEvaluationResult(
        load=load,
        unit=spec.unit,
        resolved_range=resolved_range,
        mpe_result=mpe_res,
        changeover_result=None,
        is_compliant=is_comp,
        compliance_status=status,
        margin=mpe_res.margin,
        step_by_step_explanation=explanations,
        statutory_citation=STATUTORY_CITATION_MULTI_INTERVAL,
    )


def evaluate_multi_interval_observation(
    point: ObservationPoint,
    spec: InstrumentSpecification,
    stage: VerificationStage = VerificationStage.INITIAL_TYPE_APPROVAL,
    zero_error: Decimal = ZERO_DECIMAL,
) -> MultiIntervalEvaluationResult:
    """
    Perform complete end-to-end evaluation of an ObservationPoint on a multi-interval NAWI.

    1. Resolves active partial range W_i and effective scale interval e_i for point.load.
    2. Computes unrounded digital changeover: P = I + 0.5e_i - Delta L.
    3. Computes uncorrected error: E = P - L.
    4. Computes statutory corrected error: E_c = E - E_0.
    5. Evaluates Table 6 MPE tolerance corridor based on m = L / e_i and stage multiplier.
    6. Determines margin and compliance status.

    Args:
        point: Recorded test point with load, indication, and delta_load.
        spec: Declared instrument specifications.
        stage: Statutory verification stage.
        zero_error: Established baseline zero error E_0.

    Returns:
        Fully populated MultiIntervalEvaluationResult.
    """
    # 1. Determine active partial range and e_i
    if spec.is_multi_interval and spec.intervals_array:
        resolved_range = resolve_active_partial_range(point.load, spec.intervals_array)
        effective_e = resolved_range.e
    else:
        resolved_range = ResolvedPartialRange(
            range_index=1,
            range_label="W1",
            min_capacity=spec.min_capacity,
            max_capacity=spec.max_capacity,
            e=spec.e,
            d=spec.d,
            n=spec.n,
            is_exact_switch_point=False,
        )
        effective_e = spec.e

    # 2. Compute digital changeover with effective e_i
    changeover_res = compute_changeover_point(
        load=point.load,
        indication=point.indication,
        e=effective_e,
        delta_load=point.delta_load,
        zero_error=zero_error,
    )

    # 3. Compute Table 6 MPE
    mpe_res = calculate_mpe(
        load=point.load,
        e=effective_e,
        accuracy_class=spec.accuracy_class,
        stage=stage,
        corrected_error=changeover_res.corrected_error,
    )

    switch_text = " (Exact Range Switch Boundary)" if resolved_range.is_exact_switch_point else ""
    explanations = [
        (
            f"Step 0 (Multi-Interval Resolution): Load L = {point.load} {spec.unit.symbol} "
            f"falls into {resolved_range.range_label} [Max_{resolved_range.range_index} = "
            f"{resolved_range.max_capacity} {spec.unit.symbol}]{switch_text} -> "
            f"Using verification scale interval e_{resolved_range.range_index} = "
            f"{effective_e} {spec.unit.symbol}."
        ),
        *changeover_res.step_by_step_explanation,
        *mpe_res.step_by_step_explanation,
    ]

    return MultiIntervalEvaluationResult(
        load=point.load,
        unit=spec.unit,
        resolved_range=resolved_range,
        mpe_result=mpe_res,
        changeover_result=changeover_res,
        is_compliant=mpe_res.is_compliant is True,
        compliance_status=mpe_res.compliance_status,
        margin=mpe_res.margin,
        step_by_step_explanation=explanations,
        statutory_citation=STATUTORY_CITATION_MULTI_INTERVAL,
    )


def evaluate_multi_interval_series(
    points: list[ObservationPoint],
    spec: InstrumentSpecification,
    stage: VerificationStage = VerificationStage.INITIAL_TYPE_APPROVAL,
    initial_zero_error: Decimal | None = None,
) -> list[MultiIntervalEvaluationResult]:
    """
    Evaluate an entire series of observation points across a multi-interval test run.

    Automatically resolves zero error E_0 from the first point at load == 0 if not provided.

    Args:
        points: Ordered list of ObservationPoint objects.
        spec: InstrumentSpecification.
        stage: Statutory verification stage.
        initial_zero_error: Optional explicit zero error override.

    Returns:
        List of MultiIntervalEvaluationResult instances for every test point.
    """
    if not points:
        raise ValueError("Cannot evaluate multi-interval series on an empty points list.")

    # 1. Establish baseline zero error E_0
    if initial_zero_error is not None:
        e_0 = initial_zero_error
    else:
        zero_pt = next((p for p in points if p.load == ZERO_DECIMAL), None)
        if zero_pt is not None:
            # At zero load, resolve range 1 e_1
            if spec.is_multi_interval and spec.intervals_array:
                e_1 = spec.intervals_array[0].e
            else:
                e_1 = spec.e
            zero_changeover = compute_changeover_point(
                load=zero_pt.load,
                indication=zero_pt.indication,
                e=e_1,
                delta_load=zero_pt.delta_load,
                zero_error=ZERO_DECIMAL,
            )
            e_0 = zero_changeover.uncorrected_error
        else:
            e_0 = ZERO_DECIMAL

    # 2. Evaluate all points
    results: list[MultiIntervalEvaluationResult] = []
    for pt in points:
        eval_res = evaluate_multi_interval_observation(
            point=pt,
            spec=spec,
            stage=stage,
            zero_error=e_0,
        )
        results.append(eval_res)

    return results
