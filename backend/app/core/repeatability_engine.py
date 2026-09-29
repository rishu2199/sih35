"""METROLOGIX-76 — OIML R 76-1 Clause A.4.10 Repeatability Test Engine.

Statutory References:
- OIML R 76-1:2006 Clause 3.6.1:
  "The difference between the results of several weighings of the same load shall
   not be greater than the absolute value of the maximum permissible error of
   the instrument for that load."
- OIML R 76-1:2006 Clause A.4.10: Repeatability test:
  * Two series of weighings: one at approx. half capacity (~50% Max),
    and one at approx. full capacity (~100% Max, or 0.8 Max for Max > 1000 kg).
  * Instruments with Max <= 1000 kg: 10 consecutive weighings per series
    (or 6 weighings for in-service / 3 series of 6).
  * Instruments with Max > 1000 kg: 3 consecutive weighings per series.
  * Between weighings, the instrument shall be unloaded to zero.
- Legal Metrology (General) Rules, 2011, Seventh Schedule, Heading A, Para 9(1)(c):
  "The difference between the results of several weighings of the same load shall
   not be greater than the absolute value of the maximum permissible error of the
   instrument for that load."
- Legal Metrology (General) Fourth Amendment Rules, 2026 (G.S.R. 568(E)):
  * Heading-A, Part II, paragraph 9(2)(ii):
    Substitution of standard weights at verification:
    (a) Base: Standard weights of not less than 1/2 of Max (50% Max) shall be used.
    (b) If repeatability error <= 0.3e, standard weights required can be reduced
        to 1/3 of Max (33.3% Max).
    (c) If repeatability error <= 0.2e, standard weights required can be reduced
        to 1/5 of Max (20% Max).
    (d) Repeatability determined with 3 weighings at substitution load.

Zero-Bug Rules:
1. Pure functions with explicit Decimal parameter typing and zero floating-point math.
2. Full lossless Decimal arithmetic; standard deviation computed via Decimal.sqrt().
3. Exact spread check: Delta E_repeat = E_max - E_min <= allowable_spread (|MPE|).
4. Stage-aware MPE evaluation: Initial Verification (1x Table 6) vs In-Service (2x Table 6).
5. Comprehensive statistical metrics: sample mean, sample variance, empirical sample
   standard deviation (s), and standard deviation in units of e (s / e).
"""

from __future__ import annotations

from collections.abc import Sequence
from decimal import Decimal
from typing import Final

from pydantic import Field

from app.core.changeover_engine import (
    calculate_changeover,
    calculate_corrected_error,
    calculate_uncorrected_error,
)
from app.core.mpe_resolver import MPEResult, resolve_mpe
from app.core.rulepack import RulePack, default_rulepack_manager
from app.core.schemas import (
    InstrumentSpecification,
    MetrologyBaseModel,
    RepeatabilityRun,
)
from app.core.types import (
    AccuracyClass,
    ComplianceStatus,
    VerificationStage,
    to_decimal,
)

# ============================================================================
# Statutory Metrological Constants (OIML R 76-1:2006 Clause A.4.10)
# ============================================================================

STATUTORY_CITATION_REPEATABILITY: Final[str] = (
    "OIML R 76-1:2006 Clause 3.6.1 & Clause A.4.10; "
    "LM (General) Rules 2011 Seventh Schedule Heading A Para 9(1)(c)"
)

STATUTORY_CITATION_FOURTH_AMENDMENT_2026: Final[str] = (
    "Legal Metrology (General) Fourth Amendment Rules, 2026 (G.S.R. 568(E)) "
    "Seventh Schedule Heading A Part II Para 9(2)(ii)"
)

HEAVY_CAPACITY_THRESHOLD_KG: Final[Decimal] = Decimal("1000")
ZERO_DECIMAL: Final[Decimal] = Decimal("0")
ONE_DECIMAL: Final[Decimal] = Decimal("1")
TWO_DECIMAL: Final[Decimal] = Decimal("2")
HUNDRED_DECIMAL: Final[Decimal] = Decimal("100")

SUBSTITUTION_TIER_1_THRESHOLD_E: Final[Decimal] = Decimal("0.3")
SUBSTITUTION_TIER_2_THRESHOLD_E: Final[Decimal] = Decimal("0.2")

SUBSTITUTION_BASE_STANDARD_WEIGHTS_PCT: Final[Decimal] = Decimal("50.0")
SUBSTITUTION_TIER_1_STANDARD_WEIGHTS_PCT: Final[Decimal] = Decimal("33.3333")
SUBSTITUTION_TIER_2_STANDARD_WEIGHTS_PCT: Final[Decimal] = Decimal("20.0")


# ============================================================================
# Statistical Math Helpers (Strict Decimal Lossless Math)
# ============================================================================


def calculate_sample_standard_deviation(
    values: Sequence[Decimal],
) -> tuple[Decimal, Decimal, Decimal]:
    """Calculate sample mean, sample variance, and sample standard deviation (s).

    Statutory Reference:
    - OIML R 76-1:2006 Clause A.4.10 / ISO 5725-2
    - Formula:
        mean = (1 / n) * sum(x_i)
        variance = (1 / (n - 1)) * sum((x_i - mean)^2)
        s = sqrt(variance)

    Zero-Bug Rule:
    Strict Decimal math throughout. For n < 2, variance and s are Decimal("0").

    Args:
        values: Sequence of Decimal measurements or errors.

    Returns:
        tuple of (mean, variance, sample_standard_deviation).
    """
    n = len(values)
    if n == 0:
        return ZERO_DECIMAL, ZERO_DECIMAL, ZERO_DECIMAL

    dec_n = Decimal(n)
    mean = sum(values, ZERO_DECIMAL) / dec_n

    if n < 2:
        return mean, ZERO_DECIMAL, ZERO_DECIMAL

    dec_df = Decimal(n - 1)
    variance = sum(((x - mean) ** 2 for x in values), ZERO_DECIMAL) / dec_df
    std_dev = variance.sqrt()

    return mean, variance, std_dev


def determine_prescribed_repeatability_runs(
    spec: InstrumentSpecification,
    stage: VerificationStage = VerificationStage.INITIAL_TYPE_APPROVAL,
    rulepack: RulePack | None = None,
) -> int:
    """Determine prescribed number of weighings for repeatability test.

    Statutory Reference:
    - OIML R 76-1:2006 Clause A.4.10:
      Instruments with Max > 1000 kg: 3 weighings per series.
      Instruments with Max <= 1000 kg: 10 weighings per series (or 6 for in-service).

    Args:
        spec: Declared instrument specifications.
        stage: Initial verification vs in-service inspection.
        rulepack: Active metrological RulePack.

    Returns:
        Prescribed integer number of weighings per series (3, 6, or 10).
    """
    max_in_kg = spec.unit.to_kg(spec.max_capacity)
    if max_in_kg > HEAVY_CAPACITY_THRESHOLD_KG:
        return 3

    if rulepack is not None:
        rp_runs = rulepack.get_class_rules(spec.accuracy_class).repeatability_runs
        if stage == VerificationStage.SUBSEQUENT_IN_SERVICE and rp_runs == 10:
            return 6
        return rp_runs

    if stage == VerificationStage.SUBSEQUENT_IN_SERVICE:
        return 6
    return 10


# ============================================================================
# Evaluated Run, Series & Session Data Models
# ============================================================================


class EvaluatedRepeatabilityRun(MetrologyBaseModel):
    """Statutory evaluation for a single run in a repeatability series."""

    run_number: int = Field(
        ...,
        ge=1,
        description="Sequence index of the measurement run (e.g. 1..10 or 1..3).",
    )
    load: Decimal = Field(
        ...,
        description="Standard reference test load (L) applied to the receptor.",
    )
    indication: Decimal = Field(
        ...,
        description="Observed discrete indication (I) on the instrument display.",
    )
    delta_load: Decimal = Field(
        default=ZERO_DECIMAL,
        description="Auxiliary fractional load (Delta L) to reach digital changeover.",
    )
    e: Decimal = Field(
        ...,
        gt=ZERO_DECIMAL,
        description="Verification scale interval (e).",
    )
    turning_point: Decimal = Field(
        ...,
        description="Unrounded true analog indication P = I + 0.5e - Delta L.",
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
        description="Statutory verdict (PASS / MARGINAL / FAIL) for this individual run.",
    )
    latex_formula: str = Field(
        ...,
        description="LaTeX representation of the changeover and error calculation.",
    )


class RepeatabilitySubstitutionResult(MetrologyBaseModel):
    """Statutory evaluation of standard weight substitution feasibility.

    Statutory Reference:
    - Legal Metrology (General) Fourth Amendment Rules, 2026 (G.S.R. 568(E))
    - Heading A, Part II, paragraph 9(2)(ii)
    """

    unlocked_tier: str = Field(
        ...,
        description=(
            "Unlocked substitution tier: 'TIER_2_20_PCT', 'TIER_1_33_PCT', or 'BASE_50_PCT'."
        ),
    )
    unlocked_tier_label: str = Field(
        ...,
        description="Human-readable explanation of unlocked substitution privilege.",
    )
    repeatability_error_in_e: Decimal = Field(
        ...,
        description="Observed repeatability error expressed in verification intervals e.",
    )
    standard_deviation_in_e: Decimal = Field(
        ...,
        description="Sample standard deviation s expressed in verification intervals e.",
    )
    required_standard_weights_fraction: Decimal = Field(
        ...,
        description="Mandatory minimum standard weights fraction of Max (0.2, 0.3333, or 0.5).",
    )
    required_standard_weights_pct: Decimal = Field(
        ...,
        description="Mandatory minimum standard weights percentage of Max (20%, 33.3%, or 50%).",
    )
    allowable_substitution_pct: Decimal = Field(
        ...,
        description="Allowable substitution percentage using constant loads (80%, 66.7%, or 50%).",
    )
    statutory_citation: str = Field(
        default=STATUTORY_CITATION_FOURTH_AMENDMENT_2026,
        description="Official statutory gazette citation.",
    )


class RepeatabilitySeriesResult(MetrologyBaseModel):
    """Complete statutory evaluation report for one repeatability load series.

    Evaluates:
    - Spread: Delta E = E_max - E_min <= allowable_spread (|MPE|)
    - Statistical distribution: mean, variance, sample standard deviation (s)
    - Standard weight substitution classification per 2026 Fourth Amendment Rules
    """

    series_name: str = Field(
        ...,
        description="Series descriptor, e.g. 'Series 1 (~50% Max)' or 'Series 2 (~100% Max)'.",
    )
    nominal_load: Decimal = Field(
        ...,
        description="Prescribed nominal test load for this repeatability series.",
    )
    runs_count: int = Field(
        ...,
        ge=1,
        description="Total number of consecutive measurement runs executed.",
    )
    runs: list[EvaluatedRepeatabilityRun] = Field(
        ...,
        description="Detailed evaluation of each individual measurement run.",
    )
    mean_indication: Decimal = Field(
        ...,
        description="Arithmetic sample mean of unrounded indications (P_bar).",
    )
    mean_error: Decimal = Field(
        ...,
        description="Arithmetic sample mean of corrected errors (E_c_bar).",
    )
    variance: Decimal = Field(
        ...,
        description="Sample variance of corrected errors (s^2).",
    )
    standard_deviation: Decimal = Field(
        ...,
        description="Empirical sample standard deviation (s).",
    )
    standard_deviation_in_e: Decimal = Field(
        ...,
        description="Sample standard deviation scaled to verification scale intervals (s / e).",
    )
    max_error: Decimal = Field(
        ...,
        description="Maximum signed corrected error observed across the series (E_c,max).",
    )
    min_error: Decimal = Field(
        ...,
        description="Minimum signed corrected error observed across the series (E_c,min).",
    )
    error_spread: Decimal = Field(
        ...,
        description="Repeatability spread: Delta E = E_c,max - E_c,min.",
    )
    error_spread_in_e: Decimal = Field(
        ...,
        description="Repeatability spread scaled to verification intervals: Delta E / e.",
    )
    mpe_limit: Decimal = Field(
        ...,
        description="Absolute Table 6 MPE limit at this nominal load: |MPE(L)|.",
    )
    allowable_spread: Decimal = Field(
        ...,
        description="Allowable spread tolerance: repeatability_mpe_fraction * |MPE(L)|.",
    )
    spread_status: ComplianceStatus = Field(
        ...,
        description="Spread compliance verdict (PASS / MARGINAL / FAIL).",
    )
    all_runs_within_mpe: bool = Field(
        ...,
        description="Whether every individual run satisfied |E_c| <= |MPE|.",
    )
    overall_status: ComplianceStatus = Field(
        ...,
        description="Overall series compliance status.",
    )
    substitution: RepeatabilitySubstitutionResult = Field(
        ...,
        description="Fourth Amendment Rules 2026 standard weight substitution determination.",
    )
    latex_formula: str = Field(
        ...,
        description="LaTeX representation of the repeatability spread and MPE comparison.",
    )


class RepeatabilityEvaluationResult(MetrologyBaseModel):
    """Complete statutory evaluation report for an entire OIML R 76-1 Clause A.4.10 test session.

    Aggregates both load series (approx. 50% Max and approx. 100% Max) and issues
    the final metrological compliance verdict.
    """

    series: list[RepeatabilitySeriesResult] = Field(
        ...,
        description="Evaluated repeatability series (typically Series 1 @ 50% and Series 2 @ Max).",
    )
    overall_status: ComplianceStatus = Field(
        ...,
        description="Overall test compliance verdict (PASS / MARGINAL / FAIL).",
    )
    max_spread_observed: Decimal = Field(
        ...,
        description="Maximum repeatability error spread observed across all series.",
    )
    max_spread_series: str = Field(
        ...,
        description="Name of the series that exhibited the maximum repeatability spread.",
    )
    worst_run: EvaluatedRepeatabilityRun | None = Field(
        default=None,
        description="Measurement run that exhibited the greatest absolute corrected error.",
    )
    is_heavy_instrument: bool = Field(
        ...,
        description="Whether the instrument has Max > 1000 kg qualifying for 3 weighings.",
    )
    prescribed_runs_per_series: int = Field(
        ...,
        description="Statutory prescribed run count per series (3 or 10).",
    )
    all_series_compliant: bool = Field(
        ...,
        description="True if all evaluated series satisfy Delta E <= allowable_spread.",
    )
    substitution_overall: RepeatabilitySubstitutionResult = Field(
        ...,
        description="Governing standard weight substitution determination across both series.",
    )
    summary_latex: str = Field(
        ...,
        description="Summary LaTeX formula and compliance declaration for certificate output.",
    )


# ============================================================================
# Core Repeatability Evaluation Functions
# ============================================================================


def evaluate_repeatability_substitution(
    error_spread: Decimal,
    standard_deviation: Decimal,
    e: Decimal,
    rulepack: RulePack | None = None,
) -> RepeatabilitySubstitutionResult:
    """Evaluate standard weight substitution qualification under Fourth Amendment Rules, 2026.

    Statutory Reference:
    - G.S.R. 568(E) dated 3rd July, 2026, Seventh Schedule Heading A Part II Para 9(2)(ii):
      * If repeatability error <= 0.2e -> 1/5 Max standard weights (20% Max).
      * If repeatability error <= 0.3e -> 1/3 Max standard weights (33.3% Max).
      * Otherwise -> 1/2 Max standard weights (50% Max).

    Args:
        error_spread: Observed spread Delta E = E_max - E_min.
        standard_deviation: Sample standard deviation s.
        e: Verification scale interval.
        rulepack: Active metrological RulePack.

    Returns:
        RepeatabilitySubstitutionResult containing unlocked tier and percentages.
    """
    if e <= ZERO_DECIMAL:
        raise ValueError(f"Verification scale interval e must be > 0, got: {e}")

    spread_in_e = error_spread / e
    s_in_e = standard_deviation / e

    sub_rules = (
        rulepack.standard_weight_substitution
        if rulepack and rulepack.standard_weight_substitution
        else None
    )
    tier1_thresh = (
        sub_rules.tier1_repeatability_threshold_e
        if sub_rules
        else SUBSTITUTION_TIER_1_THRESHOLD_E
    )
    tier2_thresh = (
        sub_rules.tier2_repeatability_threshold_e
        if sub_rules
        else SUBSTITUTION_TIER_2_THRESHOLD_E
    )

    if spread_in_e <= tier2_thresh:
        tier = "TIER_2_20_PCT"
        tier_label = (
            f"Tier 2 Qualified: Repeatability spread ({spread_in_e:.3f}e <= {tier2_thresh}e) "
            f"unlocks standard weight reduction to 20% Max (1/5 Max)."
        )
        req_fraction = Decimal("0.2")
        req_pct = SUBSTITUTION_TIER_2_STANDARD_WEIGHTS_PCT
        allow_sub_pct = Decimal("80.0")
    elif spread_in_e <= tier1_thresh:
        tier = "TIER_1_33_PCT"
        tier_label = (
            f"Tier 1 Qualified: Repeatability spread ({spread_in_e:.3f}e <= {tier1_thresh}e) "
            f"unlocks standard weight reduction to 33.3% Max (1/3 Max)."
        )
        req_fraction = Decimal("1") / Decimal("3")
        req_pct = SUBSTITUTION_TIER_1_STANDARD_WEIGHTS_PCT
        allow_sub_pct = Decimal("66.6667")
    else:
        tier = "BASE_50_PCT"
        tier_label = (
            f"Base Requirement: Repeatability spread ({spread_in_e:.3f}e > {tier1_thresh}e) "
            f"requires at least 50% Max standard certified weights."
        )
        req_fraction = Decimal("0.5")
        req_pct = SUBSTITUTION_BASE_STANDARD_WEIGHTS_PCT
        allow_sub_pct = Decimal("50.0")

    return RepeatabilitySubstitutionResult(
        unlocked_tier=tier,
        unlocked_tier_label=tier_label,
        repeatability_error_in_e=spread_in_e,
        standard_deviation_in_e=s_in_e,
        required_standard_weights_fraction=req_fraction,
        required_standard_weights_pct=req_pct,
        allowable_substitution_pct=allow_sub_pct,
    )


def evaluate_repeatability_run(
    run_number: int,
    load: Decimal,
    indication: Decimal,
    e: Decimal,
    delta_load: Decimal = ZERO_DECIMAL,
    zero_error: Decimal = ZERO_DECIMAL,
    accuracy_class: AccuracyClass = AccuracyClass.CLASS_III,
    stage: VerificationStage = VerificationStage.INITIAL_TYPE_APPROVAL,
    rulepack: RulePack | None = None,
) -> EvaluatedRepeatabilityRun:
    """Evaluate a single repeatability measurement run.

    Calculates:
    - Turning point: P = I + 0.5e - Delta L
    - Uncorrected error: E = P - L
    - Corrected error: E_c = E - E_0
    - Stage-aware MPE tolerance and run compliance status.
    """
    load_dec = to_decimal(load)
    ind_dec = to_decimal(indication)
    e_dec = to_decimal(e)
    dl_dec = to_decimal(delta_load)
    z_dec = to_decimal(zero_error)

    if e_dec <= ZERO_DECIMAL:
        raise ValueError(f"Verification scale interval e must be > 0, got: {e_dec}")
    if dl_dec < ZERO_DECIMAL or dl_dec > e_dec:
        raise ValueError(
            f"Changeover delta_load ({dl_dec}) must be within [0, e ({e_dec})]."
        )

    p_true = calculate_changeover(indication=ind_dec, e=e_dec, delta_load=dl_dec)
    e_uncorr = calculate_uncorrected_error(turning_point=p_true, load=load_dec)
    e_corr = calculate_corrected_error(uncorrected_error=e_uncorr, zero_error=z_dec)

    if rulepack is not None:
        mpe_res = rulepack.calculate_mpe(
            load=load_dec,
            e=e_dec,
            accuracy_class=accuracy_class,
            stage=stage,
        )
    else:
        mpe_res = resolve_mpe(
            load=load_dec,
            e=e_dec,
            accuracy_class=accuracy_class,
            stage=stage,
        )

    margin = mpe_res.mpe_value - abs(e_corr)
    if margin > ZERO_DECIMAL:
        status = ComplianceStatus.PASS
    elif margin == ZERO_DECIMAL:
        status = ComplianceStatus.MARGINAL
    else:
        status = ComplianceStatus.FAIL

    latex = (
        rf"P_{{{run_number}}} = {ind_dec} + 0.5({e_dec}) - {dl_dec} = {p_true}, \quad "
        rf"E_{{c,{run_number}}} = {p_true} - {load_dec} - ({z_dec}) = {e_corr}, \quad "
        rf"|{e_corr}| \le {mpe_res.mpe_value} \implies \text{{{status.value}}}"
    )

    return EvaluatedRepeatabilityRun(
        run_number=run_number,
        load=load_dec,
        indication=ind_dec,
        delta_load=dl_dec,
        e=e_dec,
        turning_point=p_true,
        uncorrected_error=e_uncorr,
        zero_error=z_dec,
        corrected_error=e_corr,
        mpe=mpe_res,
        margin=margin,
        status=status,
        latex_formula=latex,
    )


def evaluate_repeatability_series(
    runs: Sequence[RepeatabilityRun | dict | tuple],
    nominal_load: Decimal,
    e: Decimal,
    accuracy_class: AccuracyClass = AccuracyClass.CLASS_III,
    stage: VerificationStage = VerificationStage.INITIAL_TYPE_APPROVAL,
    series_name: str = "Repeatability Series",
    rulepack: RulePack | None = None,
    zero_error: Decimal = ZERO_DECIMAL,
) -> RepeatabilitySeriesResult:
    """Evaluate an entire series of repeated weighings at a constant nominal load.

    Statutory Requirements:
    - Minimum runs: At least 3 runs must be provided.
    - Statutory criterion: Delta E = E_c,max - E_c,min <= allowable_spread (|MPE(L)|).

    Args:
        runs: Sequence of RepeatabilityRun models, dicts, or tuples (run_no, load, ind, delta_l).
        nominal_load: Prescribed test load for this series.
        e: Verification scale interval.
        accuracy_class: Scale accuracy class.
        stage: Initial verification vs in-service inspection.
        series_name: Name of the series (e.g. "Series 1 (~50% Max)").
        rulepack: Optional custom RulePack.
        zero_error: Optional zero-load baseline error E_0 applied if run does not declare one.

    Returns:
        RepeatabilitySeriesResult containing runs, spread, std dev, and compliance verdict.
    """
    if len(runs) < 3:
        raise ValueError(
            f"OIML R 76-1 Clause A.4.10 requires at least 3 weighings per repeatability series, "
            f"got: {len(runs)}."
        )

    load_dec = to_decimal(nominal_load)
    e_dec = to_decimal(e)
    active_rp = rulepack or default_rulepack_manager.get_active_rulepack()

    evaluated_runs: list[EvaluatedRepeatabilityRun] = []
    for idx, item in enumerate(runs, start=1):
        if isinstance(item, RepeatabilityRun):
            r_no = item.run_number or idx
            r_load = item.load
            r_ind = item.indication
            r_dl = item.delta_load
            r_z = item.zero_error if item.zero_error != ZERO_DECIMAL else zero_error
        elif isinstance(item, dict):
            r_no = item.get("run_number", idx)
            r_load = to_decimal(item.get("load", load_dec))
            r_ind = to_decimal(item["indication"])
            r_dl = to_decimal(item.get("delta_load", ZERO_DECIMAL))
            r_z = to_decimal(item.get("zero_error", zero_error))
        elif isinstance(item, tuple | list):
            r_no = item[0] if len(item) > 0 else idx
            r_load = to_decimal(item[1]) if len(item) > 1 else load_dec
            r_ind = to_decimal(item[2]) if len(item) > 2 else to_decimal(item[0])
            r_dl = to_decimal(item[3]) if len(item) > 3 else ZERO_DECIMAL
            r_z = to_decimal(item[4]) if len(item) > 4 else zero_error
        else:
            raise TypeError(f"Unsupported run item format: {type(item).__name__}")

        ev_run = evaluate_repeatability_run(
            run_number=r_no,
            load=r_load,
            indication=r_ind,
            e=e_dec,
            delta_load=r_dl,
            zero_error=r_z,
            accuracy_class=accuracy_class,
            stage=stage,
            rulepack=active_rp,
        )
        evaluated_runs.append(ev_run)

    # Statistical distributions
    errors = [r.corrected_error for r in evaluated_runs]
    turning_points = [r.turning_point for r in evaluated_runs]

    mean_err, variance, std_dev = calculate_sample_standard_deviation(errors)
    mean_ind, _, _ = calculate_sample_standard_deviation(turning_points)
    std_dev_in_e = std_dev / e_dec

    max_err = max(errors)
    min_err = min(errors)
    spread = max_err - min_err
    spread_in_e = spread / e_dec

    # MPE tolerance & allowable spread
    mpe_res = active_rp.calculate_mpe(
        load=load_dec,
        e=e_dec,
        accuracy_class=accuracy_class,
        stage=stage,
    )
    mpe_limit = mpe_res.mpe_value

    class_rules = active_rp.get_class_rules(accuracy_class)
    mpe_fraction = class_rules.repeatability_mpe_fraction
    allowable_spread = mpe_fraction * mpe_limit

    # Statutory acceptance
    if spread < allowable_spread:
        spread_status = ComplianceStatus.PASS
    elif spread == allowable_spread:
        spread_status = ComplianceStatus.MARGINAL
    else:
        spread_status = ComplianceStatus.FAIL

    all_runs_within = all(r.status != ComplianceStatus.FAIL for r in evaluated_runs)

    if spread_status == ComplianceStatus.PASS and all_runs_within:
        overall_status = ComplianceStatus.PASS
    elif spread_status == ComplianceStatus.FAIL or not all_runs_within:
        overall_status = ComplianceStatus.FAIL
    else:
        overall_status = ComplianceStatus.MARGINAL

    # Fourth Amendment standard weight substitution qualification
    sub_res = evaluate_repeatability_substitution(
        error_spread=spread,
        standard_deviation=std_dev,
        e=e_dec,
        rulepack=active_rp,
    )

    latex = (
        rf"\Delta E = E_{{c,\max}} - E_{{c,\min}} = {max_err} - ({min_err}) = {spread}, \quad "
        rf"\Delta E \le |\text{{MPE}}| = {allowable_spread} \implies "
        rf"\text{{{spread_status.value}}}, \quad s = {std_dev:.5f} \ ({std_dev_in_e:.3f}e)"
    )

    return RepeatabilitySeriesResult(
        series_name=series_name,
        nominal_load=load_dec,
        runs_count=len(evaluated_runs),
        runs=evaluated_runs,
        mean_indication=mean_ind,
        mean_error=mean_err,
        variance=variance,
        standard_deviation=std_dev,
        standard_deviation_in_e=std_dev_in_e,
        max_error=max_err,
        min_error=min_err,
        error_spread=spread,
        error_spread_in_e=spread_in_e,
        mpe_limit=mpe_limit,
        allowable_spread=allowable_spread,
        spread_status=spread_status,
        all_runs_within_mpe=all_runs_within,
        overall_status=overall_status,
        substitution=sub_res,
        latex_formula=latex,
    )


def evaluate_repeatability_session(
    spec: InstrumentSpecification,
    series_data: Sequence[tuple[str, Decimal, Sequence[RepeatabilityRun | dict | tuple]]],
    stage: VerificationStage = VerificationStage.INITIAL_TYPE_APPROVAL,
    rulepack: RulePack | None = None,
    zero_error: Decimal = ZERO_DECIMAL,
) -> RepeatabilityEvaluationResult:
    """Evaluate a complete repeatability test session (typically Series 1 & Series 2).

    Statutory Requirements:
    - Clause A.4.10: Two load series (approx. 50% Max and approx. 100% Max, or 80% Max for heavy).
    - Prescribed run count: 10 runs for Max <= 1000 kg, 3 runs for Max > 1000 kg.

    Args:
        spec: Declared instrument specifications.
        series_data: List of tuples (series_name, nominal_load, runs_sequence).
        stage: Initial verification vs in-service inspection.
        rulepack: Optional custom RulePack.
        zero_error: Baseline zero-load error E_0.

    Returns:
        RepeatabilityEvaluationResult containing evaluated series and overall verdict.
    """
    if not series_data:
        raise ValueError(
            "Repeatability test session must contain at least one series of weighings."
        )

    active_rp = rulepack or default_rulepack_manager.get_active_rulepack()
    max_in_kg = spec.unit.to_kg(spec.max_capacity)
    is_heavy = max_in_kg > HEAVY_CAPACITY_THRESHOLD_KG
    prescribed_runs = determine_prescribed_repeatability_runs(spec, stage, active_rp)

    evaluated_series: list[RepeatabilitySeriesResult] = []
    worst_run: EvaluatedRepeatabilityRun | None = None
    max_spread = ZERO_DECIMAL
    max_spread_series_name = ""

    for s_name, s_load, s_runs in series_data:
        ser_res = evaluate_repeatability_series(
            runs=s_runs,
            nominal_load=s_load,
            e=spec.e,
            accuracy_class=spec.accuracy_class,
            stage=stage,
            series_name=s_name,
            rulepack=active_rp,
            zero_error=zero_error,
        )
        evaluated_series.append(ser_res)

        if ser_res.error_spread > max_spread:
            max_spread = ser_res.error_spread
            max_spread_series_name = ser_res.series_name

        for run in ser_res.runs:
            if worst_run is None or abs(run.corrected_error) > abs(worst_run.corrected_error):
                worst_run = run

    # Overall compliance status
    all_passed = all(s.overall_status == ComplianceStatus.PASS for s in evaluated_series)
    any_failed = any(s.overall_status == ComplianceStatus.FAIL for s in evaluated_series)

    if any_failed:
        overall_status = ComplianceStatus.FAIL
    elif all_passed:
        overall_status = ComplianceStatus.PASS
    else:
        overall_status = ComplianceStatus.MARGINAL

    all_series_compliant = all(
        s.spread_status != ComplianceStatus.FAIL for s in evaluated_series
    )

    # Worst series substitution governs overall instrument substitution qualification
    max_spread_in_e = max_spread / spec.e
    worst_std_dev = max(s.standard_deviation for s in evaluated_series)
    substitution_overall = evaluate_repeatability_substitution(
        error_spread=max_spread,
        standard_deviation=worst_std_dev,
        e=spec.e,
        rulepack=active_rp,
    )

    summary_latex = (
        rf"\text{{Repeatability Session}}: \max(\Delta E) = {max_spread} "
        rf"({max_spread_in_e:.3f}e \text{{ in }} \text{{{max_spread_series_name}}}), "
        rf"\quad \text{{Overall Status}} = \text{{{overall_status.value}}}, "
        rf"\quad \text{{Substitution}} = \text{{{substitution_overall.unlocked_tier}}}"
    )

    return RepeatabilityEvaluationResult(
        series=evaluated_series,
        overall_status=overall_status,
        max_spread_observed=max_spread,
        max_spread_series=max_spread_series_name,
        worst_run=worst_run,
        is_heavy_instrument=is_heavy,
        prescribed_runs_per_series=prescribed_runs,
        all_series_compliant=all_series_compliant,
        substitution_overall=substitution_overall,
        summary_latex=summary_latex,
    )
