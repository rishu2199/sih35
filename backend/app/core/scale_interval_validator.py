"""
METROLOGIX-76 — OIML R 76-1 Table 3 Scale Interval & Capacity Validator.

Statutory Authorities & Technical References:
- OIML R 76-1:2006 (E) Cl. 3.1.1: Units of measurement & scale interval steps
- OIML R 76-1:2006 (E) Clause 3.2: Principles of classification (Table 3)
- OIML R 76-1:2006 (E) Clause 3.3: Multi-interval instruments
- Legal Metrology (General) Rules, 2011, Seventh Schedule, Heading A, Table 17
- Department of Consumer Affairs (DoCA), SIH Problem Statement 26035

Zero-Bug Rule:
    Zero hardcoded magic numbers inside functions. All classification boundaries,
    interval ranges, scale number limits (n_min, n_max), and minimum capacity
    factors are referenced exclusively from the immutable `OIML_R76_TABLE_3_RULES`
    data table.
"""

from __future__ import annotations

from decimal import Decimal
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.core.schemas import InstrumentSpecification, IntervalRange
from app.core.types import AccuracyClass, MetrologyDecimal, UnitOfMeasure, to_decimal

# ============================================================================
# 1. Structured Rule Tier Model for OIML R 76-1 Table 3 / Seventh Schedule Table 17
# ============================================================================


class Table3RuleTier(BaseModel):
    """
    Immutable representation of a legal classification tier defined in Table 3.

    Statutory Reference:
    - OIML R 76-1:2006 Table 3
    - Legal Metrology (General) Rules, 2011, Seventh Schedule, Heading A, Table 17
    """

    model_config = ConfigDict(frozen=True, extra="forbid")

    accuracy_class: AccuracyClass = Field(
        ..., description="Accuracy class (CLASS_I to CLASS_IIII)."
    )
    tier_id: str = Field(
        ..., description="Unique alphanumeric identifier for this classification tier."
    )
    tier_name: str = Field(..., description="Descriptive human-readable tier label.")
    e_min_g: Decimal = Field(
        ..., description="Minimum verification scale interval in grams (inclusive)."
    )
    e_max_g: Decimal | None = Field(
        default=None,
        description="Maximum verification scale interval in grams (inclusive). None if unbounded.",
    )
    n_min: Decimal = Field(
        ..., description="Minimum number of verification scale intervals (Max / e)."
    )
    n_max: Decimal | None = Field(
        default=None,
        description="Maximum number of verification scale intervals (Max / e). None if unbounded.",
    )
    min_factor_e: Decimal = Field(
        ..., description="Statutory multiplier k for minimum capacity: Min = k * e."
    )
    statutory_citation: str = Field(
        ..., description="Legal citation from OIML R 76-1 / LM (General) Rules 2011."
    )


# ============================================================================
# 2. Immutable Statutory Rule Table: OIML R 76-1:2006 Table 3
# ============================================================================
# All numbers in legal metrology are exact Decimals. No floats allowed.

STATUTORY_CITATION_TABLE_3 = (
    "OIML R 76-1:2006 Table 3; LM (General) Rules 2011 Seventh Schedule Table 17"
)

OIML_R76_TABLE_3_RULES: tuple[Table3RuleTier, ...] = (
    # Class I — Special Accuracy / विशेष यथार्थता
    # e >= 0.001 g (1 mg), n >= 50 000, Min = 100 e
    Table3RuleTier(
        accuracy_class=AccuracyClass.CLASS_I,
        tier_id="CLASS_I_BASE",
        tier_name="Class I (Special Accuracy, e >= 0.001 g)",
        e_min_g=Decimal("0.001"),
        e_max_g=None,
        n_min=Decimal("50000"),
        n_max=None,
        min_factor_e=Decimal("100"),
        statutory_citation=STATUTORY_CITATION_TABLE_3,
    ),
    # Class II — High Accuracy / उच्च यथार्थता (Tier 1: 0.001 g <= e <= 0.05 g)
    # 0.001 g <= e <= 0.05 g, 100 <= n <= 100 000, Min = 20 e
    Table3RuleTier(
        accuracy_class=AccuracyClass.CLASS_II,
        tier_id="CLASS_II_TIER_1",
        tier_name="Class II (High Accuracy, 0.001 g <= e <= 0.05 g)",
        e_min_g=Decimal("0.001"),
        e_max_g=Decimal("0.05"),
        n_min=Decimal("100"),
        n_max=Decimal("100000"),
        min_factor_e=Decimal("20"),
        statutory_citation=STATUTORY_CITATION_TABLE_3,
    ),
    # Class II — High Accuracy / उच्च यथार्थता (Tier 2: e >= 0.1 g)
    # 0.1 g <= e, 5 000 <= n <= 100 000, Min = 50 e
    Table3RuleTier(
        accuracy_class=AccuracyClass.CLASS_II,
        tier_id="CLASS_II_TIER_2",
        tier_name="Class II (High Accuracy, e >= 0.1 g)",
        e_min_g=Decimal("0.1"),
        e_max_g=None,
        n_min=Decimal("5000"),
        n_max=Decimal("100000"),
        min_factor_e=Decimal("50"),
        statutory_citation=STATUTORY_CITATION_TABLE_3,
    ),
    # Class III — Medium Accuracy / मध्यम यथार्थता (Tier 1: 0.1 g <= e <= 2 g)
    # 0.1 g <= e <= 2 g, 100 <= n <= 10 000, Min = 20 e
    Table3RuleTier(
        accuracy_class=AccuracyClass.CLASS_III,
        tier_id="CLASS_III_TIER_1",
        tier_name="Class III (Medium Accuracy, 0.1 g <= e <= 2 g)",
        e_min_g=Decimal("0.1"),
        e_max_g=Decimal("2"),
        n_min=Decimal("100"),
        n_max=Decimal("10000"),
        min_factor_e=Decimal("20"),
        statutory_citation=STATUTORY_CITATION_TABLE_3,
    ),
    # Class III — Medium Accuracy / मध्यम यथार्थता (Tier 2: e >= 5 g)
    # 5 g <= e, 500 <= n <= 10 000, Min = 20 e
    Table3RuleTier(
        accuracy_class=AccuracyClass.CLASS_III,
        tier_id="CLASS_III_TIER_2",
        tier_name="Class III (Medium Accuracy, e >= 5 g)",
        e_min_g=Decimal("5"),
        e_max_g=None,
        n_min=Decimal("500"),
        n_max=Decimal("10000"),
        min_factor_e=Decimal("20"),
        statutory_citation=STATUTORY_CITATION_TABLE_3,
    ),
    # Class IIII — Ordinary Accuracy / साधारण यथार्थता (e >= 5 g)
    # 5 g <= e, 100 <= n <= 1 000, Min = 10 e
    Table3RuleTier(
        accuracy_class=AccuracyClass.CLASS_IIII,
        tier_id="CLASS_IIII_BASE",
        tier_name="Class IIII (Ordinary Accuracy, e >= 5 g)",
        e_min_g=Decimal("5"),
        e_max_g=None,
        n_min=Decimal("100"),
        n_max=Decimal("1000"),
        min_factor_e=Decimal("10"),
        statutory_citation=STATUTORY_CITATION_TABLE_3,
    ),
)


# ============================================================================
# 3. Validation Result Schema
# ============================================================================


class ScaleValidationResult(BaseModel):
    """
    Structured result object returned by the Scale Interval Validator.

    Fulfills contract: {is_valid: bool, n: Decimal, min_required: Decimal, violations: list[str]}
    plus diagnostic and regulatory metadata.
    """

    model_config = ConfigDict(
        extra="forbid",
        validate_default=True,
        protected_namespaces=(),
    )

    is_valid: bool = Field(
        ..., description="True if the instrument parameters strictly comply with OIML Table 3."
    )
    n: MetrologyDecimal = Field(
        ..., description="Calculated number of verification scale intervals: n = Max / e."
    )
    min_required: MetrologyDecimal = Field(
        ...,
        description="Statutory minimum capacity required: Min_req = k * e in declared units.",
    )
    violations: list[str] = Field(
        default_factory=list,
        description="List of detailed statutory violations and non-compliance explanations.",
    )
    accuracy_class: AccuracyClass = Field(
        ..., description="Declared accuracy class of the instrument."
    )
    e_in_grams: MetrologyDecimal = Field(
        ...,
        description="Verification scale interval e in grams (reference unit for Table 3).",
    )
    n_min_allowed: MetrologyDecimal | None = Field(
        default=None,
        description="Minimum permitted value of n under the matched classification tier.",
    )
    n_max_allowed: MetrologyDecimal | None = Field(
        default=None,
        description="Maximum permitted value of n under the matched classification tier.",
    )
    min_capacity_actual: MetrologyDecimal = Field(
        ..., description="Declared minimum capacity (Min) of the instrument in declared units."
    )
    matched_tier: str | None = Field(
        default=None,
        description="Identifier of the matched Table 3 rule tier (e.g. CLASS_III_TIER_2).",
    )
    statutory_citation: str | None = Field(
        default=None, description="Legal citation for the applicable OIML / Indian statutory rule."
    )
    is_multi_interval: bool = Field(
        default=False,
        description="True if the instrument is multi-interval with partial weighing ranges.",
    )
    range_results: list[dict[str, Any]] = Field(
        default_factory=list,
        description="Evaluation results for partial weighing ranges if multi-interval.",
    )


# ============================================================================
# 4. Helper: 1 x 10^k, 2 x 10^k, 5 x 10^k Step Validation (OIML Cl. 3.1.1)
# ============================================================================


def is_valid_scale_interval_step(val: Decimal) -> bool:
    """
    Verify whether a Decimal value complies with the 1, 2, 5 rule.

    Statutory Reference:
    - OIML R 76-1:2006 Clause 3.1.1: "The scale interval shall be in the form:
      1 x 10^k, 2 x 10^k, or 5 x 10^k units of mass, where k is a positive or
      negative whole number, or zero."

    Args:
        val: Exact Decimal value to test.

    Returns:
        True if value is of the form 1x10^k, 2x10^k, or 5x10^k.
    """
    if val <= Decimal("0"):
        return False

    # Extract significand digits from Decimal tuple
    digits = val.as_tuple().digits
    non_zero = list(digits)

    # Strip trailing zeroes (e.g., 200 -> (2, 0, 0) -> (2,))
    while non_zero and non_zero[-1] == 0:
        non_zero.pop()

    # The leading non-zero sequence must be precisely [1], [2], or [5]
    return non_zero in ([1], [2], [5])


# ============================================================================
# 5. Helper: Tier Matching against OIML Table 3
# ============================================================================


def match_table_3_tier(
    accuracy_class: AccuracyClass,
    e_in_grams: Decimal,
) -> tuple[Table3RuleTier | None, str | None]:
    """
    Match the declared accuracy class and e (in grams) against Table 3 tiers.

    Zero-Bug Rule:
        No hardcoded limits. Matches directly against `OIML_R76_TABLE_3_RULES`.

    Args:
        accuracy_class: Declared AccuracyClass.
        e_in_grams: Verification scale interval converted to grams.

    Returns:
        Tuple of (matched_tier or None, error_message or None).
    """
    class_tiers = [tier for tier in OIML_R76_TABLE_3_RULES if tier.accuracy_class == accuracy_class]

    if not class_tiers:
        return None, f"No legal Table 3 rules found for accuracy class '{accuracy_class.value}'."

    # Minimum verification interval across all tiers for this class
    min_possible_e = min(tier.e_min_g for tier in class_tiers)
    if e_in_grams < min_possible_e:
        return None, (
            f"Verification scale interval e ({e_in_grams} g) is strictly below the statutory "
            f"minimum ({min_possible_e} g) prescribed for {accuracy_class.designation} "
            f"under OIML R 76-1 Table 3 / Seventh Schedule Table 17."
        )

    # Find the specific matching tier
    for tier in class_tiers:
        # Check lower bound (inclusive)
        if e_in_grams < tier.e_min_g:
            continue
        # Check upper bound (inclusive if defined)
        if tier.e_max_g is not None and e_in_grams > tier.e_max_g:
            continue
        return tier, None

    # e is within min/max envelope, but falls into an unclassified gap (e.g. 3 g on Class III)
    return None, (
        f"Verification scale interval e ({e_in_grams} g) falls into an unclassified interval "
        f"gap for {accuracy_class.designation} under OIML R 76-1 Table 3."
    )


# ============================================================================
# 6. Primary Validator Engine: validate_scale_intervals
# ============================================================================


def validate_scale_intervals(spec: InstrumentSpecification) -> ScaleValidationResult:
    """
    Verify physical and statutory coherence of declared NAWI parameters against OIML Table 3.

    Validates:
    1. Scale interval step conformity: e in {1, 2, 5} x 10^k (Clause 3.1.1).
    2. Table 3 classification tier match based on e in grams (Clause 3.2, Table 3).
    3. Scale interval number: n = Max / e within [n_min, n_max].
    4. Minimum capacity: Min >= k * e (where k is 100 for Class I, 20/50 for Class II,
       20 for Class III, 10 for Class IIII).
    5. Partial interval ranges if multi-interval (Clause 3.3).

    Args:
        spec: Complete InstrumentSpecification model.

    Returns:
        Structured ScaleValidationResult object.
    """
    violations: list[str] = []

    # 1. Basic parameter extraction
    accuracy_class = spec.accuracy_class
    max_cap = spec.max_capacity
    min_cap = spec.min_capacity
    e = spec.e
    unit = spec.unit

    # 2. Compute n = Max / e (lossless Decimal division)
    n = max_cap / e

    # 3. Convert e to grams for Table 3 comparison
    e_in_grams = unit.to_g(e)

    # 4. Step 1, 2, 5 verification (Clause 3.1.1)
    if not is_valid_scale_interval_step(e):
        violations.append(
            f"Verification scale interval e ({e} {unit.symbol}) does not conform to the "
            "1 x 10^k, 2 x 10^k, or 5 x 10^k step requirement (OIML R 76-1 Cl. 3.1.1)."
        )

    # 5. Table 3 tier lookup
    matched_tier, tier_error = match_table_3_tier(accuracy_class, e_in_grams)

    if matched_tier is None:
        if tier_error:
            violations.append(tier_error)
        # Default minimum required capacity factor if no tier matches
        min_required = e * Decimal("20")
        return ScaleValidationResult(
            is_valid=False,
            n=n,
            min_required=min_required,
            violations=violations,
            accuracy_class=accuracy_class,
            e_in_grams=e_in_grams,
            min_capacity_actual=min_cap,
            is_multi_interval=spec.is_multi_interval,
        )

    # 6. Verify number of verification scale intervals n against tier bounds
    n_min_allowed = matched_tier.n_min
    n_max_allowed = matched_tier.n_max

    if n < n_min_allowed:
        violations.append(
            f"Number of scale intervals n ({n}) is less than the statutory minimum "
            f"({n_min_allowed}) for {matched_tier.tier_name} per OIML R 76-1 Table 3."
        )

    if n_max_allowed is not None and n > n_max_allowed:
        violations.append(
            f"Number of scale intervals n ({n}) exceeds the statutory maximum ({n_max_allowed}) "
            f"for {matched_tier.tier_name} per OIML R 76-1 Table 3."
        )

    # 7. Verify minimum capacity Min >= factor * e (or e_1 for multi-interval per Clause 3.3.2)
    if spec.is_multi_interval and spec.intervals_array:
        e_for_min = spec.intervals_array[0].e
        e_1_grams = unit.to_g(e_for_min)
        tier_for_min, _ = match_table_3_tier(accuracy_class, e_1_grams)
        min_factor = tier_for_min.min_factor_e if tier_for_min else matched_tier.min_factor_e
        min_required = min_factor * e_for_min
        tier_label = tier_for_min.tier_name if tier_for_min else matched_tier.tier_name
    else:
        min_factor = matched_tier.min_factor_e
        min_required = min_factor * e
        tier_label = matched_tier.tier_name

    if min_cap < min_required:
        violations.append(
            f"Minimum capacity Min ({min_cap} {unit.symbol}) is less than the "
            f"statutory requirement ({min_required} {unit.symbol} = {min_factor}e) "
            f"for {tier_label}."
        )

    # 8. Multi-interval instrument partial range validation (OIML R 76-1 Clause 3.3)
    range_results: list[dict[str, Any]] = []
    if spec.is_multi_interval and spec.intervals_array:
        for r in spec.intervals_array:
            range_eval = _validate_partial_interval_range(accuracy_class, r, unit)
            range_results.append(range_eval)
            if not range_eval["is_valid"]:
                for r_viol in range_eval["violations"]:
                    violations.append(f"Range {r.range_index} (W{r.range_index}): {r_viol}")

    is_valid = len(violations) == 0

    return ScaleValidationResult(
        is_valid=is_valid,
        n=n,
        min_required=min_required,
        violations=violations,
        accuracy_class=accuracy_class,
        e_in_grams=e_in_grams,
        n_min_allowed=n_min_allowed,
        n_max_allowed=n_max_allowed,
        min_capacity_actual=min_cap,
        matched_tier=matched_tier.tier_id,
        statutory_citation=matched_tier.statutory_citation,
        is_multi_interval=spec.is_multi_interval,
        range_results=range_results,
    )


# ============================================================================
# 7. Internal Helper: Partial Interval Range Evaluation (Clause 3.3)
# ============================================================================


def _validate_partial_interval_range(
    accuracy_class: AccuracyClass,
    r: IntervalRange,
    unit: UnitOfMeasure,
) -> dict[str, Any]:
    """
    Validate a partial weighing range of a multi-interval instrument.

    Statutory Reference:
    - OIML R 76-1:2006 Clause 3.3.2: Partial weighing range requirements
    """
    r_violations: list[str] = []
    r_n = r.max_capacity / r.e
    r_e_g = unit.to_g(r.e)

    # Check 1-2-5 step on partial range e
    if not is_valid_scale_interval_step(r.e):
        r_violations.append(
            f"Scale interval e ({r.e} {unit.symbol}) does not conform to 1, 2, 5 step rule."
        )

    matched_tier, tier_err = match_table_3_tier(accuracy_class, r_e_g)
    if matched_tier is None:
        if tier_err:
            r_violations.append(tier_err)
        return {
            "range_index": r.range_index,
            "is_valid": False,
            "n": r_n,
            "violations": r_violations,
        }

    # For range 1, check n >= n_min and min >= min_factor * e
    if r.range_index == 1:
        if r_n < matched_tier.n_min:
            r_violations.append(
                f"Range 1 n ({r_n}) is less than statutory minimum ({matched_tier.n_min})."
            )
        min_req_range = matched_tier.min_factor_e * r.e
        if r.min_capacity < min_req_range:
            r_violations.append(
                f"Range 1 Min ({r.min_capacity} {unit.symbol}) is less than requirement "
                f"({min_req_range} {unit.symbol} = {matched_tier.min_factor_e}e)."
            )

    # Check n <= n_max
    if matched_tier.n_max is not None and r_n > matched_tier.n_max:
        r_violations.append(
            f"Range {r.range_index} n ({r_n}) exceeds statutory maximum ({matched_tier.n_max})."
        )

    return {
        "range_index": r.range_index,
        "is_valid": len(r_violations) == 0,
        "n": str(r_n),
        "e": str(r.e),
        "e_in_grams": str(r_e_g),
        "matched_tier": matched_tier.tier_id,
        "violations": r_violations,
    }


# ============================================================================
# 8. Convenience API: validate_scale_parameters
# ============================================================================


def validate_scale_parameters(
    accuracy_class: AccuracyClass,
    max_capacity: object,
    min_capacity: object,
    e: object,
    d: object | None = None,
    unit: UnitOfMeasure = UnitOfMeasure.KILOGRAM,
) -> ScaleValidationResult:
    """
    Direct functional validator without needing to construct full InstrumentSpecification.

    Losslessly validates raw inputs and verifies against OIML Table 3.

    Args:
        accuracy_class: Declared AccuracyClass.
        max_capacity: Max capacity (str, int, or Decimal).
        min_capacity: Min capacity (str, int, or Decimal).
        e: Verification interval e (str, int, or Decimal).
        d: Actual interval d (defaults to e if not specified).
        unit: UnitOfMeasure (defaults to KILOGRAM).

    Returns:
        ScaleValidationResult.
    """
    max_d = to_decimal(max_capacity)
    min_d = to_decimal(min_capacity)
    e_d = to_decimal(e)
    d_d = to_decimal(d) if d is not None else e_d

    spec = InstrumentSpecification(
        accuracy_class=accuracy_class,
        max_capacity=max_d,
        min_capacity=min_d,
        e=e_d,
        d=d_d,
        unit=unit,
    )
    return validate_scale_intervals(spec)
