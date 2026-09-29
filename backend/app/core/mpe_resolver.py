"""
METROLOGIX-76 — Stage-Aware Maximum Permissible Error (MPE) Resolver.

Statutory References:
- OIML R 76-1:2006 Clause 3.5.1, Table 6: Maximum permissible errors on initial verification
- OIML R 76-1:2006 Clause 3.5.2: Maximum permissible errors in service
- Legal Metrology (General) Rules, 2011, Seventh Schedule, Heading A, Part II, Table 20
- Legal Metrology (General) Rules, 2011, Seventh Schedule, Page 74:
  "The maximum permissible errors during inspection shall be twice the maximum
   permissible errors allowed on verification."

Zero-Bug Rules:
1. Zero hardcoded magic numbers inside functions — all threshold brackets and multipliers
   are stored in an immutable, frozen data structure `OIML_R76_TABLE_6_BRACKETS`.
2. Exact boundary equality checks:
   - Class III: m = 500.00e is strictly within the +/-0.5e tier; m = 500.01e enters +/-1.0e.
   - Class III: m = 2000.00e is strictly within the +/-1.0e tier; m = 2000.01e enters +/-1.5e.
3. Lossless Decimal arithmetic throughout; no floating-point rounding errors.
4. Stage awareness: Initial verification (1x) vs in-service inspection (2x doubling).
"""

from decimal import Decimal
from typing import Final

from pydantic import ConfigDict, Field

from app.core.changeover_engine import ChangeoverResult
from app.core.schemas import InstrumentSpecification, MetrologyBaseModel
from app.core.types import AccuracyClass, ComplianceStatus, VerificationStage

# ============================================================================
# Statutory Constants
# ============================================================================

STATUTORY_CITATION_TABLE_6: Final[str] = (
    "OIML R 76-1:2006 Clause 3.5.1 Table 6 / Seventh Schedule Table 20"
)
STATUTORY_CITATION_IN_SERVICE: Final[str] = (
    "OIML R 76-1:2006 Clause 3.5.2 / "
    "Legal Metrology (General) Rules, 2011, Seventh Schedule (p. 74)"
)

FACTOR_MPE_TIER_1: Final[Decimal] = Decimal("0.5")
FACTOR_MPE_TIER_2: Final[Decimal] = Decimal("1.0")
FACTOR_MPE_TIER_3: Final[Decimal] = Decimal("1.5")
ZERO_DECIMAL: Final[Decimal] = Decimal("0")
HUNDRED_DECIMAL: Final[Decimal] = Decimal("100")


# ============================================================================
# 1. Table 6 Bracket Definition & Structured Rules Table
# ============================================================================


class MPEBracketTier(MetrologyBaseModel):
    """
    Immutable representation of a statutory Table 6 MPE step bracket.

    Defines the load interval range (m = L / e) and base initial MPE factor.
    """

    model_config = ConfigDict(frozen=True, extra="forbid")

    tier_id: str = Field(..., description="Unique identifier for the Table 6 bracket tier.")
    accuracy_class: AccuracyClass = Field(
        ..., description="Applicable NAWI accuracy class."
    )
    bracket_index: int = Field(
        ..., ge=1, le=3, description="Bracket level: 1 (0.5e), 2 (1.0e), or 3 (1.5e)."
    )
    bracket_name: str = Field(..., description="Human-readable bracket label.")
    m_min: Decimal = Field(
        ..., ge=Decimal("0"), description="Lower boundary of load interval m = L/e."
    )
    m_max: Decimal | None = Field(
        default=None,
        description="Inclusive upper boundary of load interval m = L/e (None if unbounded).",
    )
    base_mpe_factor: Decimal = Field(
        ..., gt=Decimal("0"), description="Initial verification MPE in units of e."
    )
    statutory_citation: str = Field(
        default=STATUTORY_CITATION_TABLE_6, description="Legal citation."
    )


# OIML R 76-1 Table 6 & Seventh Schedule Table 20 Statutory Brackets (Frozen)
OIML_R76_TABLE_6_BRACKETS: Final[tuple[MPEBracketTier, ...]] = (
    # -------------------------------------------------------------------------
    # Class I: Special Accuracy
    # Bracket 1: 0 <= m <= 50,000      -> +/- 0.5e
    # Bracket 2: 50,000 < m <= 200,000  -> +/- 1.0e
    # Bracket 3: 200,000 < m            -> +/- 1.5e
    # -------------------------------------------------------------------------
    MPEBracketTier(
        tier_id="CLASS_I_BRACKET_1",
        accuracy_class=AccuracyClass.CLASS_I,
        bracket_index=1,
        bracket_name="0 <= m <= 50,000",
        m_min=Decimal("0"),
        m_max=Decimal("50000"),
        base_mpe_factor=FACTOR_MPE_TIER_1,
    ),
    MPEBracketTier(
        tier_id="CLASS_I_BRACKET_2",
        accuracy_class=AccuracyClass.CLASS_I,
        bracket_index=2,
        bracket_name="50,000 < m <= 200,000",
        m_min=Decimal("50000"),
        m_max=Decimal("200000"),
        base_mpe_factor=FACTOR_MPE_TIER_2,
    ),
    MPEBracketTier(
        tier_id="CLASS_I_BRACKET_3",
        accuracy_class=AccuracyClass.CLASS_I,
        bracket_index=3,
        bracket_name="200,000 < m",
        m_min=Decimal("200000"),
        m_max=None,
        base_mpe_factor=FACTOR_MPE_TIER_3,
    ),
    # -------------------------------------------------------------------------
    # Class II: High Accuracy
    # Bracket 1: 0 <= m <= 5,000        -> +/- 0.5e
    # Bracket 2: 5,000 < m <= 20,000    -> +/- 1.0e
    # Bracket 3: 20,000 < m <= 100,000  -> +/- 1.5e
    # -------------------------------------------------------------------------
    MPEBracketTier(
        tier_id="CLASS_II_BRACKET_1",
        accuracy_class=AccuracyClass.CLASS_II,
        bracket_index=1,
        bracket_name="0 <= m <= 5,000",
        m_min=Decimal("0"),
        m_max=Decimal("5000"),
        base_mpe_factor=FACTOR_MPE_TIER_1,
    ),
    MPEBracketTier(
        tier_id="CLASS_II_BRACKET_2",
        accuracy_class=AccuracyClass.CLASS_II,
        bracket_index=2,
        bracket_name="5,000 < m <= 20,000",
        m_min=Decimal("5000"),
        m_max=Decimal("20000"),
        base_mpe_factor=FACTOR_MPE_TIER_2,
    ),
    MPEBracketTier(
        tier_id="CLASS_II_BRACKET_3",
        accuracy_class=AccuracyClass.CLASS_II,
        bracket_index=3,
        bracket_name="20,000 < m <= 100,000",
        m_min=Decimal("20000"),
        m_max=Decimal("100000"),
        base_mpe_factor=FACTOR_MPE_TIER_3,
    ),
    # -------------------------------------------------------------------------
    # Class III: Medium Accuracy
    # Bracket 1: 0 <= m <= 500          -> +/- 0.5e
    # Bracket 2: 500 < m <= 2,000       -> +/- 1.0e
    # Bracket 3: 2,000 < m <= 10,000    -> +/- 1.5e
    # -------------------------------------------------------------------------
    MPEBracketTier(
        tier_id="CLASS_III_BRACKET_1",
        accuracy_class=AccuracyClass.CLASS_III,
        bracket_index=1,
        bracket_name="0 <= m <= 500",
        m_min=Decimal("0"),
        m_max=Decimal("500"),
        base_mpe_factor=FACTOR_MPE_TIER_1,
    ),
    MPEBracketTier(
        tier_id="CLASS_III_BRACKET_2",
        accuracy_class=AccuracyClass.CLASS_III,
        bracket_index=2,
        bracket_name="500 < m <= 2,000",
        m_min=Decimal("500"),
        m_max=Decimal("2000"),
        base_mpe_factor=FACTOR_MPE_TIER_2,
    ),
    MPEBracketTier(
        tier_id="CLASS_III_BRACKET_3",
        accuracy_class=AccuracyClass.CLASS_III,
        bracket_index=3,
        bracket_name="2,000 < m <= 10,000",
        m_min=Decimal("2000"),
        m_max=Decimal("10000"),
        base_mpe_factor=FACTOR_MPE_TIER_3,
    ),
    # -------------------------------------------------------------------------
    # Class IIII: Ordinary Accuracy
    # Bracket 1: 0 <= m <= 50           -> +/- 0.5e
    # Bracket 2: 50 < m <= 200          -> +/- 1.0e
    # Bracket 3: 200 < m <= 1,000       -> +/- 1.5e
    # -------------------------------------------------------------------------
    MPEBracketTier(
        tier_id="CLASS_IIII_BRACKET_1",
        accuracy_class=AccuracyClass.CLASS_IIII,
        bracket_index=1,
        bracket_name="0 <= m <= 50",
        m_min=Decimal("0"),
        m_max=Decimal("50"),
        base_mpe_factor=FACTOR_MPE_TIER_1,
    ),
    MPEBracketTier(
        tier_id="CLASS_IIII_BRACKET_2",
        accuracy_class=AccuracyClass.CLASS_IIII,
        bracket_index=2,
        bracket_name="50 < m <= 200",
        m_min=Decimal("50"),
        m_max=Decimal("200"),
        base_mpe_factor=FACTOR_MPE_TIER_2,
    ),
    MPEBracketTier(
        tier_id="CLASS_IIII_BRACKET_3",
        accuracy_class=AccuracyClass.CLASS_IIII,
        bracket_index=3,
        bracket_name="200 < m <= 1,000",
        m_min=Decimal("200"),
        m_max=Decimal("1000"),
        base_mpe_factor=FACTOR_MPE_TIER_3,
    ),
)


# ============================================================================
# 2. Result Data Contracts
# ============================================================================


class MPEResult(MetrologyBaseModel):
    """
    Complete evaluation result for Maximum Permissible Error (MPE) at a specific load point.

    Contains full precision values for:
    - m: Load expressed in verification scale intervals (m = L / e)
    - mpe_in_units_of_e: Statutory allowable error in scale intervals (+/- 0.5e, 1.0e, etc.)
    - mpe_value: Statutory allowable error in physical units (+/- value)
    - margin: Absolute safety buffer (|MPE| - |E_c|)
    - is_compliant: Pass/Fail deterministic outcome
    - Explanation strings for UI and audit logs.
    """

    load: Decimal = Field(..., description="Applied reference test load (L).")
    e: Decimal = Field(..., gt=Decimal("0"), description="Verification scale interval (e).")
    m_in_scale_intervals: Decimal = Field(
        ..., description="Test load expressed in scale intervals: m = L / e."
    )
    accuracy_class: AccuracyClass = Field(
        ..., description="Accuracy class of the instrument under test."
    )
    verification_stage: VerificationStage = Field(
        ..., description="Verification stage (Initial 1x vs In-Service 2x)."
    )
    stage_multiplier: Decimal = Field(
        ..., description="Statutory stage multiplier (1.0 for Initial, 2.0 for In-Service)."
    )
    bracket_index: int = Field(
        ..., ge=1, le=3, description="Matched Table 6 step bracket index (1, 2, or 3)."
    )
    bracket_name: str = Field(
        ..., description="Statutory bracket description (e.g., '0 <= m <= 500')."
    )
    base_mpe_factor: Decimal = Field(
        ..., description="Base initial verification MPE factor (0.5, 1.0, or 1.5)."
    )
    mpe_in_units_of_e: Decimal = Field(
        ..., description="Effective MPE in units of e after applying stage multiplier."
    )
    mpe_value: Decimal = Field(
        ..., description="Effective MPE in physical units: mpe_in_units_of_e * e."
    )
    lower_mpe: Decimal = Field(
        ..., description="Lower permissible error boundary: -mpe_value."
    )
    upper_mpe: Decimal = Field(
        ..., description="Upper permissible error boundary: +mpe_value."
    )
    corrected_error: Decimal | None = Field(
        default=None,
        description="Statutory corrected error (E_c) evaluated against this MPE.",
    )
    margin: Decimal | None = Field(
        default=None,
        description="Compliance safety margin: |MPE| - |E_c|.",
    )
    margin_percentage: Decimal | None = Field(
        default=None,
        description="Compliance safety margin expressed as percentage of allowable MPE.",
    )
    is_compliant: bool | None = Field(
        default=None,
        description="True if |E_c| <= |MPE|, False if |E_c| > |MPE|, None if E_c not provided.",
    )
    compliance_status: ComplianceStatus = Field(
        default=ComplianceStatus.PENDING,
        description="Compliance decision status (PASS, FAIL, MARGINAL, or PENDING).",
    )
    is_over_n_max: bool = Field(
        default=False,
        description="Flag indicating whether test load m exceeds statutory n_max for class.",
    )
    step_by_step_explanation: list[str] = Field(
        ..., description="Detailed audit trace documenting the bracket resolution."
    )
    formula_latex: dict[str, str] = Field(
        ..., description="LaTeX mathematical formulas for UI display."
    )
    statutory_citation: str = Field(
        default=STATUTORY_CITATION_TABLE_6,
        description="Statutory rule citation under OIML R 76-1 / Seventh Schedule.",
    )


class EvaluatedObservation(MetrologyBaseModel):
    """
    Combined entity joining digital changeover observation with its stage-aware MPE outcome.
    """

    changeover: ChangeoverResult = Field(
        ..., description="Digital changeover calculation trace (P, E, E_0, E_c)."
    )
    mpe: MPEResult = Field(
        ..., description="Stage-aware MPE resolution and compliance verdict."
    )

    @property
    def is_compliant(self) -> bool:
        """Convenience property returning whether the observation is compliant."""
        return self.mpe.is_compliant is True

    @property
    def margin(self) -> Decimal | None:
        """Convenience property returning the remaining MPE margin."""
        return self.mpe.margin


# ============================================================================
# 3. Core Bracket Resolution Logic
# ============================================================================


def resolve_mpe_bracket(
    accuracy_class: AccuracyClass,
    m: Decimal,
) -> tuple[MPEBracketTier, bool]:
    """
    Resolve the applicable Table 6 MPE step bracket based on accuracy class and m = L / e.

    Zero-Bug Rule:
    Strict boundary equality checks.
    - Bracket 1: 0 <= m <= m_1 (inclusive upper bound)
    - Bracket 2: m_1 < m <= m_2 (inclusive upper bound)
    - Bracket 3: m_2 < m (unbounded or up to m_3)

    Args:
        accuracy_class: Instrument AccuracyClass.
        m: Load in units of verification scale intervals (m = L / e).

    Returns:
        Tuple of (MPEBracketTier, is_over_n_max: bool).

    Raises:
        ValueError: If m is negative or if no bracket matches the accuracy class.
    """
    if m < ZERO_DECIMAL:
        raise ValueError(
            f"Test load in scale intervals m cannot be negative, got: {m}"
        )

    class_brackets = [
        b for b in OIML_R76_TABLE_6_BRACKETS if b.accuracy_class == accuracy_class
    ]
    if not class_brackets:
        raise ValueError(
            f"No Table 6 brackets configured for accuracy class: '{accuracy_class.value}'."
        )

    # Sort brackets strictly by index (1, 2, 3)
    sorted_brackets = sorted(class_brackets, key=lambda b: b.bracket_index)
    b1 = sorted_brackets[0]
    b2 = sorted_brackets[1]
    b3 = sorted_brackets[2]

    # Bracket 1: 0 <= m <= m_1
    # Note: b1.m_max is never None for bracket 1
    assert b1.m_max is not None
    if m <= b1.m_max:
        return b1, False

    # Bracket 2: m_1 < m <= m_2
    assert b2.m_max is not None
    if m <= b2.m_max:
        return b2, False

    # Bracket 3: m > m_2
    # Check if m exceeds statutory n_max (b3.m_max)
    is_over = False
    if b3.m_max is not None and m > b3.m_max:
        is_over = True

    return b3, is_over


# ============================================================================
# 4. Primary MPE Calculator Engine
# ============================================================================


def calculate_mpe(
    load: Decimal,
    e: Decimal,
    accuracy_class: AccuracyClass,
    stage: VerificationStage = VerificationStage.INITIAL_TYPE_APPROVAL,
    corrected_error: Decimal | None = None,
) -> MPEResult:
    """
    Calculate stage-aware Maximum Permissible Error (MPE) and evaluate error compliance.

    Statutory Rationale:
    1. Computes m = L / e.
    2. Resolves Table 6 bracket:
       - Tier 1: 0.5e
       - Tier 2: 1.0e
       - Tier 3: 1.5e
    3. Multiplies by VerificationStage multiplier:
       - Initial Type Approval: 1.0x -> +/- 0.5e, +/- 1.0e, +/- 1.5e
       - In-Service Inspection: 2.0x -> +/- 1.0e, +/- 2.0e, +/- 3.0e
    4. Evaluates compliance against corrected error E_c if provided.

    Args:
        load: Reference test load L.
        e: Verification scale interval e.
        accuracy_class: AccuracyClass (CLASS_I, CLASS_II, CLASS_III, CLASS_IIII).
        stage: VerificationStage (INITIAL_TYPE_APPROVAL or SUBSEQUENT_IN_SERVICE).
        corrected_error: Optional corrected error E_c to evaluate.

    Returns:
        Structured MPEResult.

    Raises:
        ValueError: If e <= 0 or load < 0.
    """
    if e <= ZERO_DECIMAL:
        raise ValueError(f"Verification scale interval e must be strictly positive, got: {e}")
    if load < ZERO_DECIMAL:
        raise ValueError(f"Test load L cannot be negative, got: {load}")

    # 1. Compute m = L / e (lossless Decimal division)
    m = load / e

    # 2. Resolve statutory Table 6 bracket tier
    bracket, is_over_n_max = resolve_mpe_bracket(accuracy_class, m)

    # 3. Apply stage multiplier (1x for initial, 2x for in-service)
    multiplier = stage.mpe_multiplier
    base_factor = bracket.base_mpe_factor
    mpe_in_units_of_e = base_factor * multiplier
    mpe_value = mpe_in_units_of_e * e

    lower_mpe = -mpe_value
    upper_mpe = mpe_value

    # 4. Evaluate compliance if corrected error is supplied
    margin: Decimal | None = None
    margin_percentage: Decimal | None = None
    is_compliant: bool | None = None
    compliance_status = ComplianceStatus.PENDING

    if corrected_error is not None:
        abs_ec = abs(corrected_error)
        abs_mpe = abs(mpe_value)
        margin = abs_mpe - abs_ec
        margin_percentage = (margin / abs_mpe) * HUNDRED_DECIMAL

        if abs_ec < abs_mpe:
            is_compliant = True
            compliance_status = ComplianceStatus.PASS
        elif abs_ec == abs_mpe:
            is_compliant = True
            compliance_status = ComplianceStatus.MARGINAL
        else:
            is_compliant = False
            compliance_status = ComplianceStatus.FAIL

    # 5. Build LaTeX formulas
    stage_label = "Initial" if multiplier == Decimal("1.0") else "In-Service (2x)"
    formula_latex = {
        "m": r"m = \frac{L}{e}",
        "MPE": r"\text{MPE} = \pm " + f"{mpe_in_units_of_e}" + r"e",
        "margin": r"\text{Margin} = |\text{MPE}| - |E_c|",
    }

    # 6. Build audit trail explanation strings
    step_explanations: list[str] = [
        (
            f"Step 1 (Load in Scale Intervals m): "
            f"m = L / e = {load} / {e} = {m} e"
        ),
        (
            f"Step 2 (Table 6 Bracket Match): "
            f"Matched {bracket.bracket_name} for {accuracy_class.designation} "
            f"-> Base MPE factor = +/- {base_factor}e"
        ),
        (
            f"Step 3 (Stage Multiplier Application): "
            f"Stage = {stage.value} ({stage_label}) -> "
            f"Effective MPE = {base_factor}e * {multiplier} = +/- {mpe_in_units_of_e}e "
            f"(+/- {mpe_value})"
        ),
    ]

    if corrected_error is not None:
        comp_str = "COMPLIANT (PASS)" if is_compliant else "NON-COMPLIANT (FAIL)"
        step_explanations.append(
            f"Step 4 (Compliance Evaluation): "
            f"|E_c| = |{corrected_error}| = {abs(corrected_error)}; "
            f"Allowed MPE = {mpe_value} -> "
            f"{comp_str} with margin of {margin} ({margin_percentage:.2f}%)"
        )

    if is_over_n_max:
        step_explanations.append(
            f"Statutory Notice: Test load m ({m}e) exceeds statutory maximum scale "
            f"intervals n_max ({bracket.m_max}e) for {accuracy_class.designation}."
        )

    citation = (
        STATUTORY_CITATION_IN_SERVICE
        if multiplier > Decimal("1.0")
        else STATUTORY_CITATION_TABLE_6
    )

    return MPEResult(
        load=load,
        e=e,
        m_in_scale_intervals=m,
        accuracy_class=accuracy_class,
        verification_stage=stage,
        stage_multiplier=multiplier,
        bracket_index=bracket.bracket_index,
        bracket_name=bracket.bracket_name,
        base_mpe_factor=base_factor,
        mpe_in_units_of_e=mpe_in_units_of_e,
        mpe_value=mpe_value,
        lower_mpe=lower_mpe,
        upper_mpe=upper_mpe,
        corrected_error=corrected_error,
        margin=margin,
        margin_percentage=margin_percentage,
        is_compliant=is_compliant,
        compliance_status=compliance_status,
        is_over_n_max=is_over_n_max,
        step_by_step_explanation=step_explanations,
        formula_latex=formula_latex,
        statutory_citation=citation,
    )


# ============================================================================
# 5. Integration Utilities
# ============================================================================


def evaluate_changeover_with_mpe(
    changeover: ChangeoverResult,
    accuracy_class: AccuracyClass,
    stage: VerificationStage = VerificationStage.INITIAL_TYPE_APPROVAL,
) -> EvaluatedObservation:
    """
    Bridge a ChangeoverResult from Step 04 with its statutory Table 6 MPE evaluation.

    Args:
        changeover: Calculated changeover trace containing L, I, e, delta_L, E_c.
        accuracy_class: Declared AccuracyClass.
        stage: Applicable VerificationStage.

    Returns:
        Combined EvaluatedObservation instance.
    """
    mpe_res = calculate_mpe(
        load=changeover.load,
        e=changeover.e,
        accuracy_class=accuracy_class,
        stage=stage,
        corrected_error=changeover.corrected_error,
    )
    return EvaluatedObservation(
        changeover=changeover,
        mpe=mpe_res,
    )


def resolve_mpe_for_specification(
    load: Decimal,
    spec: InstrumentSpecification,
    stage: VerificationStage = VerificationStage.INITIAL_TYPE_APPROVAL,
    corrected_error: Decimal | None = None,
) -> MPEResult:
    """
    Resolve MPE dynamically for an InstrumentSpecification, resolving multi-interval e.

    Args:
        load: Test load L.
        spec: Complete InstrumentSpecification model.
        stage: Applicable VerificationStage.
        corrected_error: Optional corrected error to evaluate.

    Returns:
        Structured MPEResult.
    """
    effective_e = spec.get_e_for_load(load)
    return calculate_mpe(
        load=load,
        e=effective_e,
        accuracy_class=spec.accuracy_class,
        stage=stage,
        corrected_error=corrected_error,
    )


# Functional alias for semantic ergonomics
resolve_mpe = calculate_mpe

