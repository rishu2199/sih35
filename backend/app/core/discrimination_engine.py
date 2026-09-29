"""METROLOGIX-76 — OIML R 76-1 Clause A.4.8 & Clause 3.8 Discrimination Test Engine.

Statutory References:
- OIML R 76-1:2006 Clause 3.8:
  "An additional load that is equal to 1.4d, when gently placed on or withdrawn
   from the load receptor in equilibrium at any load shall change the initial indication."
- OIML R 76-1:2006 Clause A.4.8: Discrimination test:
  * Test loads:
    1. Minimum capacity (Min)
    2. Half maximum capacity (~0.5 Max)
    3. Maximum capacity (Max)
  * Digital indication:
    An extra load equal to 1.4d placed gently on the loaded receptor in equilibrium
    must produce an unrounded changeover or indication increase of at least 1d (Delta I >= 1d
    or Delta P >= 1.0d).
- Legal Metrology (General) Rules, 2011, Seventh Schedule, Heading A,
  Para 8 & Para 3(4)(iii) of Part II:
  "An additional load that is equal to 1.4 times the scale interval for a stationary load,
   when gently placed on or withdrawn from each load receptor in turn when at equilibrium
   at any load, shall change the initial indication."

Zero-Bug Rules:
1. Pure functions with explicit Decimal parameter typing and zero floating-point math.
2. Full lossless Decimal arithmetic: extra load = 1.4 * d.
3. Strict enforcement of statutory trigger condition: Delta P >= 1.0d (or Delta I >= 1d).
4. Dual verification support:
   - Direct digital indication step advance (I_2 - I_1 >= d).
   - Unrounded turning point changeover analysis (P_2 - P_1 >= 1.0d).
"""

from __future__ import annotations

from collections.abc import Sequence
from decimal import Decimal
from typing import Final

from pydantic import Field

from app.core.changeover_engine import calculate_changeover
from app.core.rulepack import RulePack, default_rulepack_manager
from app.core.schemas import (
    DiscriminationObservation,
    InstrumentSpecification,
    MetrologyBaseModel,
)
from app.core.types import (
    ComplianceStatus,
    to_decimal,
)

# ============================================================================
# Statutory Metrological Constants (OIML R 76-1:2006 Clause A.4.8)
# ============================================================================

STATUTORY_CITATION_DISCRIMINATION: Final[str] = (
    "OIML R 76-1:2006 Clause 3.8 & Clause A.4.8; "
    "LM (General) Rules 2011 Seventh Schedule Heading A Para 8"
)

DISCRIMINATION_FACTOR_DEFAULT: Final[Decimal] = Decimal("1.4")
REQUIRED_STEP_FACTOR_DEFAULT: Final[Decimal] = Decimal("1.0")

ZERO_DECIMAL: Final[Decimal] = Decimal("0")
ONE_DECIMAL: Final[Decimal] = Decimal("1")


# ============================================================================
# Math Helpers (Strict Decimal Lossless Math)
# ============================================================================


def calculate_discrimination_extra_load(
    d: Decimal,
    factor: Decimal = DISCRIMINATION_FACTOR_DEFAULT,
) -> Decimal:
    """Calculate the statutory extra test load Delta L = factor * d.

    Statutory Reference:
    - OIML R 76-1:2006 Clause 3.8: Delta L = 1.4d.

    Args:
        d: Actual scale interval (d) of the instrument.
        factor: Discrimination factor, default 1.4.

    Returns:
        Exact Decimal extra test load to be gently placed on the receptor.
    """
    d_dec = to_decimal(d)
    fact_dec = to_decimal(factor)
    if d_dec <= ZERO_DECIMAL:
        raise ValueError(f"Scale interval d must be > 0, got: {d_dec}")
    if fact_dec <= ZERO_DECIMAL:
        raise ValueError(f"Discrimination factor must be > 0, got: {fact_dec}")
    return fact_dec * d_dec


# ============================================================================
# Evaluated Data Models
# ============================================================================


class EvaluatedDiscriminationPoint(MetrologyBaseModel):
    """Statutory evaluation for an OIML R 76-1 Clause A.4.8 discrimination point."""

    load: Decimal = Field(
        ...,
        description="Equilibrium test load (e.g. Min, 0.5 Max, or Max).",
    )
    load_label: str = Field(
        ...,
        description="Descriptive statutory test point label.",
    )
    d: Decimal = Field(
        ...,
        gt=ZERO_DECIMAL,
        description="Actual scale interval (d).",
    )
    extra_load_applied: Decimal = Field(
        ...,
        description="Extra test load placed gently on the receptor (statutory 1.4d).",
    )
    initial_indication: Decimal = Field(
        ...,
        description="Initial observed indication (I_1) before extra load.",
    )
    final_indication: Decimal = Field(
        ...,
        description="Final observed indication (I_2) after depositing extra load.",
    )
    indication_change: Decimal = Field(
        ...,
        description="Digital indication increase: Delta I = I_2 - I_1.",
    )
    initial_turning_point: Decimal | None = Field(
        default=None,
        description="Initial unrounded turning point P_1 if changeover weights were used.",
    )
    final_turning_point: Decimal | None = Field(
        default=None,
        description="Final unrounded turning point P_2 if changeover weights were used.",
    )
    turning_point_change: Decimal | None = Field(
        default=None,
        description="Unrounded changeover difference: Delta P = P_2 - P_1.",
    )
    required_minimum_change: Decimal = Field(
        ...,
        description="Statutory minimum required advance: 1.0d.",
    )
    effective_change: Decimal = Field(
        ...,
        description=(
            "Governing change evaluated against statutory requirement (Delta P or Delta I)."
        ),
    )
    status: ComplianceStatus = Field(
        ...,
        description="Statutory verdict (PASS / FAIL).",
    )
    statutory_clause: str = Field(
        default=STATUTORY_CITATION_DISCRIMINATION,
        description="Statutory legal clause citation.",
    )
    latex_formula: str = Field(
        ...,
        description="LaTeX representation of the discrimination test calculation.",
    )
    notes: str | None = Field(
        default=None,
        description="Field observation remarks or test conditions.",
    )


class DiscriminationEvaluationResult(MetrologyBaseModel):
    """Complete statutory evaluation report for an OIML R 76-1 Clause A.4.8 test session.

    Evaluates the three statutory test points:
    1. Min capacity
    2. 0.5 Max capacity
    3. Max capacity
    """

    points: list[EvaluatedDiscriminationPoint] = Field(
        ...,
        description="Evaluated discrimination observation points.",
    )
    overall_status: ComplianceStatus = Field(
        ...,
        description="Overall test compliance verdict (PASS / FAIL).",
    )
    all_points_passed: bool = Field(
        ...,
        description="True if every evaluated test point satisfied the discrimination trigger.",
    )
    discrimination_factor: Decimal = Field(
        default=DISCRIMINATION_FACTOR_DEFAULT,
        description="Prescribed discrimination factor (1.4d).",
    )
    failed_points_count: int = Field(
        ...,
        description="Number of load points that failed the discrimination test.",
    )
    statutory_reference: str = Field(
        default=STATUTORY_CITATION_DISCRIMINATION,
        description="Official statutory citation.",
    )
    summary_latex: str = Field(
        ...,
        description="Summary LaTeX formula and compliance declaration for certificate output.",
    )


# ============================================================================
# Core Discrimination Evaluation Functions
# ============================================================================


def evaluate_discrimination_point(
    observation: DiscriminationObservation | dict | tuple,
    d: Decimal,
    e: Decimal | None = None,
    discrimination_factor: Decimal = DISCRIMINATION_FACTOR_DEFAULT,
) -> EvaluatedDiscriminationPoint:
    """Evaluate a single discrimination test point.

    Statutory Criterion:
    - Extra load equal to 1.4d placed gently on the load receptor in equilibrium
      must produce an indication increase of at least 1d (Delta I >= 1d)
      or unrounded changeover advance Delta P >= 1.0d.

    Args:
        observation: DiscriminationObservation instance, dict, or tuple.
        d: Actual scale interval (d).
        e: Optional verification scale interval (e), defaults to d.
        discrimination_factor: Factor for extra load, default 1.4.

    Returns:
        EvaluatedDiscriminationPoint with step response and PASS/FAIL verdict.
    """
    d_dec = to_decimal(d)
    e_dec = to_decimal(e) if e is not None else d_dec
    fact_dec = to_decimal(discrimination_factor)

    if d_dec <= ZERO_DECIMAL:
        raise ValueError(f"Scale interval d must be > 0, got: {d_dec}")
    if e_dec <= ZERO_DECIMAL:
        raise ValueError(f"Verification interval e must be > 0, got: {e_dec}")

    # Extract observation attributes
    if isinstance(observation, DiscriminationObservation):
        load_val = observation.load
        label = observation.load_label or f"Load {load_val}"
        i_1 = observation.initial_indication
        i_2 = observation.final_indication
        extra_load = (
            observation.extra_load
            if observation.extra_load is not None
            else calculate_discrimination_extra_load(d_dec, fact_dec)
        )
        dl_1 = observation.initial_delta_load
        dl_2 = observation.final_delta_load
        notes = observation.notes
    elif isinstance(observation, dict):
        load_val = to_decimal(observation["load"])
        label = str(observation.get("load_label", f"Load {load_val}"))
        i_1 = to_decimal(observation["initial_indication"])
        i_2 = to_decimal(observation["final_indication"])
        extra_load = (
            to_decimal(observation["extra_load"])
            if "extra_load" in observation and observation["extra_load"] is not None
            else calculate_discrimination_extra_load(d_dec, fact_dec)
        )
        dl_1 = to_decimal(observation.get("initial_delta_load", ZERO_DECIMAL))
        dl_2 = to_decimal(observation.get("final_delta_load", ZERO_DECIMAL))
        notes = observation.get("notes")
    elif isinstance(observation, tuple | list):
        load_val = to_decimal(observation[0])
        i_1 = to_decimal(observation[1])
        i_2 = to_decimal(observation[2])
        label = f"Load {load_val}"
        extra_load = (
            to_decimal(observation[3])
            if len(observation) > 3 and observation[3] is not None
            else calculate_discrimination_extra_load(d_dec, fact_dec)
        )
        dl_1 = to_decimal(observation[4]) if len(observation) > 4 else ZERO_DECIMAL
        dl_2 = to_decimal(observation[5]) if len(observation) > 5 else ZERO_DECIMAL
        notes = None
    else:
        raise TypeError(
            f"Unsupported discrimination observation type: {type(observation).__name__}"
        )

    delta_i = i_2 - i_1
    req_step = REQUIRED_STEP_FACTOR_DEFAULT * d_dec

    # Determine whether fractional changeover turning points were recorded
    has_turning_points = (dl_1 != ZERO_DECIMAL) or (dl_2 != ZERO_DECIMAL)
    p_1: Decimal | None = None
    p_2: Decimal | None = None
    delta_p: Decimal | None = None

    if has_turning_points:
        p_1 = calculate_changeover(indication=i_1, e=e_dec, delta_load=dl_1)
        p_2 = calculate_changeover(indication=i_2, e=e_dec, delta_load=dl_2)
        delta_p = p_2 - p_1
        effective_change = delta_p
    else:
        effective_change = delta_i

    # Statutory acceptance check: effective_change >= required_minimum_change (1.0d)
    if effective_change >= req_step:
        status = ComplianceStatus.PASS
    else:
        status = ComplianceStatus.FAIL

    if has_turning_points and p_1 is not None and p_2 is not None and delta_p is not None:
        latex = (
            rf"\Delta L = 1.4d = {extra_load}, \quad "
            rf"P_1 = {p_1}, \ P_2 = {p_2}, \ \Delta P = {delta_p}, \quad "
            rf"\Delta P \ge 1.0d ({req_step}) \implies \text{{{status.value}}}"
        )
    else:
        latex = (
            rf"\Delta L = 1.4d = {extra_load}, \quad "
            rf"I_1 = {i_1}, \ I_2 = {i_2}, \ \Delta I = {delta_i}, \quad "
            rf"\Delta I \ge 1.0d ({req_step}) \implies \text{{{status.value}}}"
        )

    return EvaluatedDiscriminationPoint(
        load=load_val,
        load_label=label,
        d=d_dec,
        extra_load_applied=extra_load,
        initial_indication=i_1,
        final_indication=i_2,
        indication_change=delta_i,
        initial_turning_point=p_1,
        final_turning_point=p_2,
        turning_point_change=delta_p,
        required_minimum_change=req_step,
        effective_change=effective_change,
        status=status,
        latex_formula=latex,
        notes=notes,
    )


def evaluate_discrimination_session(
    spec: InstrumentSpecification,
    observations: Sequence[DiscriminationObservation | dict | tuple],
    rulepack: RulePack | None = None,
) -> DiscriminationEvaluationResult:
    """Evaluate a complete OIML R 76-1 Clause A.4.8 discrimination test battery.

    Statutory Reference:
    - Tested at 3 loads: Min, approx. 0.5 Max, and Max.
    - Extra load of 1.4d placed gently must produce >= 1d response.

    Args:
        spec: Declared instrument specifications.
        observations: Sequence of observations at tested loads.
        rulepack: Active metrological RulePack.

    Returns:
        DiscriminationEvaluationResult containing evaluated points and overall verdict.
    """
    if not observations:
        raise ValueError("Discrimination test session must contain at least one observation point.")

    active_rp = rulepack or default_rulepack_manager.get_active_rulepack()
    class_rules = active_rp.get_class_rules(spec.accuracy_class)
    disc_factor = class_rules.discrimination_factor_d

    evaluated_points: list[EvaluatedDiscriminationPoint] = []
    failed_count = 0

    for obs in observations:
        pt = evaluate_discrimination_point(
            observation=obs,
            d=spec.d,
            e=spec.e,
            discrimination_factor=disc_factor,
        )
        evaluated_points.append(pt)
        if pt.status == ComplianceStatus.FAIL:
            failed_count += 1

    all_passed = failed_count == 0
    overall_status = ComplianceStatus.PASS if all_passed else ComplianceStatus.FAIL

    summary_latex = (
        rf"\text{{Discrimination Test (1.4d)}}: \text{{Points Tested}} = {len(evaluated_points)}, "
        rf"\quad \text{{Passed}} = {len(evaluated_points) - failed_count}/{len(evaluated_points)}, "
        rf"\quad \text{{Overall Status}} = \text{{{overall_status.value}}}"
    )

    return DiscriminationEvaluationResult(
        points=evaluated_points,
        overall_status=overall_status,
        all_points_passed=all_passed,
        discrimination_factor=disc_factor,
        failed_points_count=failed_count,
        summary_latex=summary_latex,
    )
