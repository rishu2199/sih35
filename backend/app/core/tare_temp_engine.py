"""METROLOGIX-76 — OIML R 76-1 Clause A.4.6 Tare & Clause A.5.3 Temperature Influence Engine.

Statutory References:
- OIML R 76-1:2006 Clause A.4.6: Tare weighing tests:
  * A.4.6.1: Weighing test with tare:
    - Tare balancing or tare weighing mechanism evaluated with at least one tare load
      (typically low tare ~1/3 Max and high tare up to Tare Max).
    - Tare setting device accuracy (Clause 3.6.3): Error shall not exceed +/- 0.25e
      for initial verification (+/- 0.5e for in-service inspection).
    - Net indication accuracy (Clause 3.5.3.4):
      "The maximum permissible errors on net load are identical with the maximum
       permissible errors for the same load on gross indication."
- OIML R 76-1:2006 Clause 3.9.2: Temperature influence:
  * Clause 3.9.2.1: Temperature limits:
    - Standard: -10 °C to +40 °C for Class II, III, IIII.
    - Special: +10 °C to +30 °C for Class I (or marked range).
  * Clause 3.9.2.3: Zero temperature coefficient:
    - "The zero indication or near-zero indication shall not vary by more than one scale
       interval for a temperature difference of 5 °C for instruments of classes II, III
       and IIII, and 0.5 scale intervals for instruments of class I."
  * Clause A.5.3.1: Static temperature test:
    - Chamber temperature rate of change: <= 5 °C/h.
    - Thermal stabilization duration: at least 2 hours at each temperature plateau.
    - Test sequence: Reference (+20 °C) -> High (+40 °C / +30 °C) -> Low (-10 °C / +10 °C)
      -> Return to Reference (+20 °C).
    - Weighing performance verified at each plateau: |Ec(L, T)| <= |MPE(L)|.
    - Span sensitivity drift evaluated across thermal range.
- Legal Metrology (General) Rules, 2011:
  * Seventh Schedule, Heading A, Para 9(1)(d): Tare weighing mechanism.
  * Seventh Schedule, Heading A, Para 13(1): Static temperature influence.

Zero-Bug Rules:
1. Pure functions with explicit Decimal parameter typing and zero floating-point math.
2. Full lossless Decimal arithmetic: zero drift per 5 °C = (|Delta E_0| / Delta T) * 5.
3. Strict enforcement of temperature transition speed <= 5 °C/h and stabilization >= 2 h.
4. Comprehensive compliance checking for tare setting (+/- 0.25e), net load errors (Table 6),
   zero thermal drift (0.5e or 1.0e per 5 °C), and span drift across chambers.
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
    ObservationPoint,
)
from app.core.types import (
    AccuracyClass,
    ComplianceStatus,
    VerificationStage,
    to_decimal,
)

# ============================================================================
# Statutory Metrological Constants
# ============================================================================

STATUTORY_CITATION_TARE: Final[str] = (
    "OIML R 76-1:2006 Clause A.4.6, 3.5.3.4, 3.6.3; "
    "LM (General) Rules 2011 Seventh Schedule Heading A Para 9(1)(d)"
)

STATUTORY_CITATION_TEMPERATURE: Final[str] = (
    "OIML R 76-1:2006 Clause A.5.3.1, 3.9.2.1, 3.9.2.3; "
    "LM (General) Rules 2011 Seventh Schedule Heading A Para 13(1)"
)

TARE_SETTING_MPE_FACTOR_INITIAL: Final[Decimal] = Decimal("0.25")
TARE_SETTING_MPE_FACTOR_IN_SERVICE: Final[Decimal] = Decimal("0.50")

ZERO_DRIFT_FACTOR_CLASS_I: Final[Decimal] = Decimal("0.5")  # 0.5e per 5 °C
ZERO_DRIFT_FACTOR_CLASS_OTHER: Final[Decimal] = Decimal("1.0")  # 1.0e per 5 °C

MAX_TEMP_CHANGE_RATE_C_PER_HR: Final[Decimal] = Decimal("5.0")
MIN_STABILIZATION_HOURS: Final[Decimal] = Decimal("2.0")
TEMP_DELTA_NORMALIZATION_STEP: Final[Decimal] = Decimal("5.0")
REFERENCE_TEMPERATURE_CELSIUS: Final[Decimal] = Decimal("20.0")
DEFAULT_REFERENCE_TEMP_CELSIUS: Final[Decimal] = REFERENCE_TEMPERATURE_CELSIUS
STATUTORY_CITATION_TARE_A46: Final[str] = STATUTORY_CITATION_TARE
STATUTORY_CITATION_TEMP_A53: Final[str] = STATUTORY_CITATION_TEMPERATURE
MILLION_DECIMAL: Final[Decimal] = Decimal("1000000")

ZERO_DECIMAL: Final[Decimal] = Decimal("0")
ONE_DECIMAL: Final[Decimal] = Decimal("1")


# ============================================================================
# Part 1: Tare Mechanism Models & Functions
# ============================================================================


class EvaluatedTareSetting(MetrologyBaseModel):
    """Statutory evaluation of a tare setting operation per OIML Clause 3.6.3."""

    tare_load: Decimal = Field(
        ...,
        description="Applied tare weight (T) placed on the load receptor.",
    )
    tare_zero_indication: Decimal = Field(
        ...,
        description="Observed digital indication after tare balancing (typically 0).",
    )
    tare_delta_load: Decimal = Field(
        default=ZERO_DECIMAL,
        description="Fractional load (Delta L) applied to find tare changeover turning point.",
    )
    e: Decimal = Field(
        ...,
        gt=ZERO_DECIMAL,
        description="Verification scale interval (e).",
    )
    turning_point: Decimal = Field(
        ...,
        description="Unrounded true analog indication at tare zero: P_tare = I + 0.5e - Delta L.",
    )
    tare_setting_error: Decimal = Field(
        ...,
        description="Residual tare setting error: E_tare = P_tare - 0.",
    )
    allowable_mpe: Decimal = Field(
        ...,
        description="Statutory maximum permissible error for tare setting (+/- 0.25e or 0.5e).",
    )
    margin: Decimal = Field(
        ...,
        description="Compliance margin: allowable_mpe - |E_tare|.",
    )
    status: ComplianceStatus = Field(
        ...,
        description="Statutory verdict (PASS / MARGINAL / FAIL).",
    )
    statutory_clause: str = Field(
        default=STATUTORY_CITATION_TARE,
        description="Official statutory citation.",
    )
    latex_formula: str = Field(
        ...,
        description="LaTeX representation of the tare setting evaluation.",
    )


class EvaluatedNetLoadPoint(MetrologyBaseModel):
    """Statutory evaluation of a net load weighing point per OIML Clause A.4.6 & 3.5.3.4."""

    tare_load: Decimal = Field(
        ...,
        description="Active tare load (T) on the receptor.",
    )
    net_load: Decimal = Field(
        ...,
        description="Standard reference net test load (L_net) applied over tare.",
    )
    gross_load: Decimal = Field(
        ...,
        description="Total gross load on receptor: L_gross = T + L_net.",
    )
    indication_net: Decimal = Field(
        ...,
        description="Observed digital net indication (I_net) on the instrument display.",
    )
    delta_load: Decimal = Field(
        default=ZERO_DECIMAL,
        description="Fractional load (Delta L) to reach digital changeover turning point.",
    )
    e: Decimal = Field(
        ...,
        gt=ZERO_DECIMAL,
        description="Verification scale interval (e).",
    )
    turning_point_net: Decimal = Field(
        ...,
        description="Unrounded true analog net indication P_net = I_net + 0.5e - Delta L.",
    )
    uncorrected_net_error: Decimal = Field(
        ...,
        description="Uncorrected net error: E_net = P_net - L_net.",
    )
    tare_residual_error: Decimal = Field(
        default=ZERO_DECIMAL,
        description="Residual tare setting error E_tare used for error correction.",
    )
    corrected_net_error: Decimal = Field(
        ...,
        description="Corrected net error: E_c,net = E_net - E_tare.",
    )
    mpe: MPEResult = Field(
        ...,
        description="Table 6 MPE evaluated for the net load per Clause 3.5.3.4.",
    )
    margin: Decimal = Field(
        ...,
        description="Compliance margin: |MPE| - |E_c,net|.",
    )
    status: ComplianceStatus = Field(
        ...,
        description="Statutory verdict (PASS / MARGINAL / FAIL).",
    )
    latex_formula: str = Field(
        ...,
        description="LaTeX representation of net indication error and MPE comparison.",
    )


class TareEvaluationResult(MetrologyBaseModel):
    """Complete statutory evaluation report for an OIML R 76-1 Clause A.4.6 tare test."""

    tare_setting: EvaluatedTareSetting = Field(
        ...,
        description="Evaluation of the tare setting accuracy.",
    )
    net_points: list[EvaluatedNetLoadPoint] = Field(
        ...,
        description="Evaluated net load measurement points across the net range.",
    )
    max_net_error: Decimal = Field(
        ...,
        description="Maximum signed corrected net error observed.",
    )
    min_net_error: Decimal = Field(
        ...,
        description="Minimum signed corrected net error observed.",
    )
    worst_point: EvaluatedNetLoadPoint | None = Field(
        default=None,
        description="Net point exhibiting greatest absolute error deflection.",
    )
    all_net_points_passed: bool = Field(
        ...,
        description="True if every net test point is within Table 6 MPE.",
    )
    overall_status: ComplianceStatus = Field(
        ...,
        description="Overall test compliance verdict (PASS / FAIL).",
    )
    summary_latex: str = Field(
        ...,
        description="Summary LaTeX formula and compliance declaration for certificate output.",
    )


def calculate_tare_setting_mpe(
    e: Decimal,
    stage: VerificationStage = VerificationStage.INITIAL_TYPE_APPROVAL,
) -> Decimal:
    """Calculate the statutory MPE for tare setting device per Clause 3.6.3.

    Initial Verification: +/- 0.25e
    In-Service Inspection: +/- 0.50e
    """
    e_dec = to_decimal(e)
    if e_dec <= ZERO_DECIMAL:
        raise ValueError(f"Verification scale interval e must be > 0, got: {e_dec}")

    factor = (
        TARE_SETTING_MPE_FACTOR_IN_SERVICE
        if stage == VerificationStage.SUBSEQUENT_IN_SERVICE
        else TARE_SETTING_MPE_FACTOR_INITIAL
    )
    return factor * e_dec


def evaluate_tare_setting(
    tare_load: Decimal,
    indication: Decimal = ZERO_DECIMAL,
    delta_load: Decimal = ZERO_DECIMAL,
    e: Decimal = Decimal("1"),
    stage: VerificationStage = VerificationStage.INITIAL_TYPE_APPROVAL,
) -> EvaluatedTareSetting:
    """Evaluate accuracy of tare setting device per Clause 3.6.3.

    Calculates:
    - Turning point: P_tare = I + 0.5e - Delta L
    - Setting error: E_tare = P_tare - 0
    - Checks: |E_tare| <= 0.25e (or 0.5e in-service).
    """
    t_dec = to_decimal(tare_load)
    ind_dec = to_decimal(indication)
    dl_dec = to_decimal(delta_load)
    e_dec = to_decimal(e)

    if t_dec <= ZERO_DECIMAL:
        raise ValueError(f"Tare load must be strictly positive, got: {t_dec}")
    if e_dec <= ZERO_DECIMAL:
        raise ValueError(f"Verification scale interval 'e' must be > 0, got: {e_dec}")
    if dl_dec < ZERO_DECIMAL or dl_dec > e_dec:
        raise ValueError(f"Changeover delta_load ({dl_dec}) must be within [0, e ({e_dec})].")

    p_tare = calculate_changeover(indication=ind_dec, e=e_dec, delta_load=dl_dec)
    e_tare = p_tare - ZERO_DECIMAL

    allowable_mpe = calculate_tare_setting_mpe(e=e_dec, stage=stage)
    margin = allowable_mpe - abs(e_tare)

    if margin > ZERO_DECIMAL:
        status = ComplianceStatus.PASS
    elif margin == ZERO_DECIMAL:
        status = ComplianceStatus.MARGINAL
    else:
        status = ComplianceStatus.FAIL

    latex = (
        rf"P_{{\text{{tare}}}} = {ind_dec} + 0.5({e_dec}) - {dl_dec} = {p_tare}, \quad "
        rf"E_{{\text{{tare}}}} = {p_tare} - 0 = {e_tare}, \quad "
        rf"|{e_tare}| \le {allowable_mpe} \implies \text{{{status.value}}}"
    )

    return EvaluatedTareSetting(
        tare_load=t_dec,
        tare_zero_indication=ind_dec,
        tare_delta_load=dl_dec,
        e=e_dec,
        turning_point=p_tare,
        tare_setting_error=e_tare,
        allowable_mpe=allowable_mpe,
        margin=margin,
        status=status,
        latex_formula=latex,
    )


def evaluate_net_load_point(
    net_load: Decimal,
    indication_net: Decimal,
    tare_load: Decimal = ZERO_DECIMAL,
    e: Decimal | None = None,
    delta_load: Decimal = ZERO_DECIMAL,
    tare_residual_error: Decimal = ZERO_DECIMAL,
    tare_error: Decimal | None = None,
    accuracy_class: AccuracyClass = AccuracyClass.CLASS_III,
    stage: VerificationStage = VerificationStage.INITIAL_TYPE_APPROVAL,
    spec: InstrumentSpecification | None = None,
    rulepack: RulePack | None = None,
) -> EvaluatedNetLoadPoint:
    """Evaluate a single net load observation point per Clause A.4.6 & 3.5.3.4.

    Statutory Requirement:
    - MPE is calculated for the applied NET load (Clause 3.5.3.4).
    - Corrected error: E_c,net = (P_net - L_net) - E_tare.
    """
    if spec is not None:
        if e is None:
            e = spec.e
        if accuracy_class == AccuracyClass.CLASS_III and spec.accuracy_class is not None:
            accuracy_class = spec.accuracy_class

    if e is None:
        raise ValueError("Verification scale interval 'e' or 'spec' must be provided.")

    if tare_error is not None:
        tare_residual_error = tare_error

    t_dec = to_decimal(tare_load)
    net_dec = to_decimal(net_load)
    ind_dec = to_decimal(indication_net)
    e_dec = to_decimal(e)
    dl_dec = to_decimal(delta_load)
    z_tare = to_decimal(tare_residual_error)

    if e_dec <= ZERO_DECIMAL:
        raise ValueError(f"Verification scale interval e must be > 0, got: {e_dec}")
    if dl_dec < ZERO_DECIMAL or dl_dec > e_dec:
        raise ValueError(f"Changeover delta_load ({dl_dec}) must be within [0, e ({e_dec})].")

    p_net = calculate_changeover(indication=ind_dec, e=e_dec, delta_load=dl_dec)
    uncorr_err = calculate_uncorrected_error(turning_point=p_net, load=net_dec)
    corr_err = calculate_corrected_error(uncorrected_error=uncorr_err, zero_error=z_tare)

    gross_dec = t_dec + net_dec

    if rulepack is not None:
        mpe_res = rulepack.calculate_mpe(
            load=net_dec,
            e=e_dec,
            accuracy_class=accuracy_class,
            stage=stage,
        )
    else:
        mpe_res = resolve_mpe(
            load=net_dec,
            e=e_dec,
            accuracy_class=accuracy_class,
            stage=stage,
        )

    margin = mpe_res.mpe_value - abs(corr_err)
    if margin > ZERO_DECIMAL:
        status = ComplianceStatus.PASS
    elif margin == ZERO_DECIMAL:
        status = ComplianceStatus.MARGINAL
    else:
        status = ComplianceStatus.FAIL

    latex = (
        rf"P_{{\text{{net}}}} = {ind_dec} + 0.5({e_dec}) - {dl_dec} = {p_net}, \quad "
        rf"E_{{c,\text{{net}}}} = {p_net} - {net_dec} - ({z_tare}) = {corr_err}, \quad "
        rf"|{corr_err}| \le {mpe_res.mpe_value} \implies \text{{{status.value}}}"
    )

    return EvaluatedNetLoadPoint(
        tare_load=t_dec,
        net_load=net_dec,
        gross_load=gross_dec,
        indication_net=ind_dec,
        delta_load=dl_dec,
        e=e_dec,
        turning_point_net=p_net,
        uncorrected_net_error=uncorr_err,
        tare_residual_error=z_tare,
        corrected_net_error=corr_err,
        mpe=mpe_res,
        margin=margin,
        status=status,
        latex_formula=latex,
    )


def evaluate_tare_session(
    spec: InstrumentSpecification,
    tare_setting_obs: ObservationPoint | dict | tuple | None = None,
    net_observations: Sequence[ObservationPoint | dict | tuple] = (),
    tare_load: Decimal | None = None,
    temperature: Decimal = REFERENCE_TEMPERATURE_CELSIUS,
    stage: VerificationStage = VerificationStage.INITIAL_TYPE_APPROVAL,
    rulepack: RulePack | None = None,
) -> TareEvaluationResult:
    """Evaluate complete tare mechanism test session (Clause A.4.6).

    Args:
        spec: Declared instrument specifications.
        tare_setting_obs: ObservationPoint, dict, or tuple for tare setting.
        net_observations: Sequence of observations under tare condition.
        tare_load: Declared tare test load (inferred from tare_setting_obs if omitted).
        temperature: Ambient temperature during tare test (°C).
        stage: Initial verification vs in-service inspection.
        rulepack: Active metrological RulePack.

    Returns:
        TareEvaluationResult with tare setting compliance, net points, and overall verdict.
    """
    if not net_observations:
        raise ValueError("Tare test session must contain at least one net load observation.")

    active_rp = rulepack or default_rulepack_manager.get_active_rulepack()

    # Determine tare load
    if tare_load is not None:
        t_dec = to_decimal(tare_load)
    elif isinstance(tare_setting_obs, ObservationPoint):
        t_dec = tare_setting_obs.load
    elif isinstance(tare_setting_obs, dict) and (
        "load" in tare_setting_obs or "tare_load" in tare_setting_obs
    ):
        t_dec = to_decimal(tare_setting_obs.get("load", tare_setting_obs.get("tare_load")))
    elif isinstance(tare_setting_obs, tuple | list) and len(tare_setting_obs) > 0:
        t_dec = to_decimal(tare_setting_obs[0])
    else:
        t_dec = spec.min_capacity

    # Evaluate tare setting
    if tare_setting_obs is None:
        tare_set_res = evaluate_tare_setting(
            tare_load=t_dec,
            indication=ZERO_DECIMAL,
            delta_load=ZERO_DECIMAL,
            e=spec.e,
            stage=stage,
        )
    elif isinstance(tare_setting_obs, ObservationPoint):
        tare_set_res = evaluate_tare_setting(
            tare_load=t_dec,
            indication=tare_setting_obs.indication,
            delta_load=tare_setting_obs.delta_load,
            e=spec.e,
            stage=stage,
        )
    elif isinstance(tare_setting_obs, dict):
        tare_set_res = evaluate_tare_setting(
            tare_load=t_dec,
            indication=to_decimal(tare_setting_obs.get("indication", ZERO_DECIMAL)),
            delta_load=to_decimal(tare_setting_obs.get("delta_load", ZERO_DECIMAL)),
            e=spec.e,
            stage=stage,
        )
    elif isinstance(tare_setting_obs, tuple | list):
        ind = to_decimal(tare_setting_obs[0]) if len(tare_setting_obs) > 0 else ZERO_DECIMAL
        dl = to_decimal(tare_setting_obs[1]) if len(tare_setting_obs) > 1 else ZERO_DECIMAL
        tare_set_res = evaluate_tare_setting(
            tare_load=t_dec,
            indication=ind,
            delta_load=dl,
            e=spec.e,
            stage=stage,
        )
    else:
        err_msg = f"Unsupported tare setting observation type: {type(tare_setting_obs).__name__}"
        raise TypeError(err_msg)

    # Evaluate net load points
    evaluated_net_points: list[EvaluatedNetLoadPoint] = []
    worst_pt: EvaluatedNetLoadPoint | None = None

    for item in net_observations:
        if isinstance(item, ObservationPoint):
            net_l = item.load
            ind = item.indication
            dl = item.delta_load
        elif isinstance(item, dict):
            net_l = to_decimal(item.get("net_load", item.get("load")))
            ind = to_decimal(item.get("indication_net", item.get("indication")))
            dl = to_decimal(item.get("delta_load", ZERO_DECIMAL))
        elif isinstance(item, tuple | list):
            net_l = to_decimal(item[0])
            ind = to_decimal(item[1])
            dl = to_decimal(item[2]) if len(item) > 2 else ZERO_DECIMAL
        else:
            raise TypeError(f"Unsupported net observation type: {type(item).__name__}")

        ev_pt = evaluate_net_load_point(
            tare_load=t_dec,
            net_load=net_l,
            indication_net=ind,
            e=spec.e,
            delta_load=dl,
            tare_residual_error=tare_set_res.tare_setting_error,
            accuracy_class=spec.accuracy_class,
            stage=stage,
            rulepack=active_rp,
        )
        evaluated_net_points.append(ev_pt)

        if worst_pt is None or abs(ev_pt.corrected_net_error) > abs(worst_pt.corrected_net_error):
            worst_pt = ev_pt

    net_errors = [p.corrected_net_error for p in evaluated_net_points]
    max_net = max(net_errors)
    min_net = min(net_errors)

    all_net_passed = all(p.status != ComplianceStatus.FAIL for p in evaluated_net_points)
    tare_setting_passed = tare_set_res.status != ComplianceStatus.FAIL

    if all_net_passed and tare_setting_passed:
        overall_status = ComplianceStatus.PASS
    else:
        overall_status = ComplianceStatus.FAIL

    summary_latex = (
        rf"\text{{Tare Session}} \ (T = {t_dec}): \text{{Tare Error}} = "
        rf"{tare_set_res.tare_setting_error} \ (\text{{{tare_set_res.status.value}}}), \quad "
        rf"\text{{Max }} |E_{{c,\text{{net}}}}| = {max(abs(max_net), abs(min_net))}, \quad "
        rf"\text{{Overall Status}} = \text{{{overall_status.value}}}"
    )

    return TareEvaluationResult(
        tare_setting=tare_set_res,
        net_points=evaluated_net_points,
        max_net_error=max_net,
        min_net_error=min_net,
        worst_point=worst_pt,
        all_net_points_passed=all_net_passed,
        overall_status=overall_status,
        summary_latex=summary_latex,
    )


# ============================================================================
# Part 2: Static Temperature Influence Models & Functions
# ============================================================================


class EvaluatedZeroDriftSegment(MetrologyBaseModel):
    """Statutory evaluation of zero indication shift between two temperature levels.

    Statutory Reference:
    - OIML R 76-1:2006 Clause 3.9.2.3:
      Zero drift per 5 °C <= 0.5e (Class I) or 1.0e (Class II, III, IIII).
    """

    from_temperature_celsius: Decimal = Field(
        ...,
        description="Starting temperature of the thermal transition (°C).",
    )
    to_temperature_celsius: Decimal = Field(
        ...,
        description="Ending temperature of the thermal transition (°C).",
    )
    temperature_delta_celsius: Decimal = Field(
        ...,
        gt=ZERO_DECIMAL,
        description="Absolute temperature difference: Delta T = |T_to - T_from|.",
    )
    zero_error_initial: Decimal = Field(
        ...,
        description="Zero-load indication error at starting temperature (E_0,from).",
    )
    zero_error_final: Decimal = Field(
        ...,
        description="Zero-load indication error at ending temperature (E_0,to).",
    )
    zero_error_shift: Decimal = Field(
        ...,
        description="Absolute zero error shift: Delta E_0 = |E_0,to - E_0,from|.",
    )
    drift_per_celsius: Decimal = Field(
        ...,
        description="Zero drift rate per single degree Celsius: Delta E_0 / Delta T.",
    )
    drift_per_5_celsius: Decimal = Field(
        ...,
        description="Statutory normalized zero drift per 5 °C step: (Delta E_0 / Delta T) * 5.",
    )
    drift_per_5_celsius_in_e: Decimal = Field(
        ...,
        description="Normalized zero drift per 5 °C expressed in verification intervals e.",
    )
    allowable_limit_5_celsius: Decimal = Field(
        ...,
        description=(
            "Statutory limit for 5 °C zero drift "
            "(0.5e for Class I, 1.0e for other classes)."
        ),
    )
    margin: Decimal = Field(
        ...,
        description="Compliance margin: allowable_limit - drift_per_5_celsius.",
    )
    status: ComplianceStatus = Field(
        ...,
        description="Statutory verdict (PASS / MARGINAL / FAIL).",
    )
    latex_formula: str = Field(
        ...,
        description="LaTeX representation of the zero drift computation and limit comparison.",
    )


class EvaluatedTemperaturePlateau(MetrologyBaseModel):
    """Statutory evaluation of weighing performance at a specific temperature plateau."""

    temperature_celsius: Decimal = Field(
        ...,
        description="Chamber temperature at this test plateau (°C).",
    )
    plateau_label: str = Field(
        ...,
        description="Plateau identifier, e.g. 'Reference (20 °C)' or 'High Temp (40 °C)'.",
    )
    duration_hours: Decimal = Field(
        ...,
        ge=ZERO_DECIMAL,
        description="Thermal stabilization duration at this plateau (statutory >= 2.0 h).",
    )
    transition_rate_c_per_hr: Decimal | None = Field(
        default=None,
        description="Chamber temperature ramp rate from previous plateau (°C/h, statutory <= 5.0).",
    )
    stabilization_compliant: bool = Field(
        ...,
        description="True if plateau duration satisfied minimum 2 hours thermal soak.",
    )
    transition_rate_compliant: bool = Field(
        ...,
        description="True if chamber transition rate did not exceed statutory 5 °C/h.",
    )
    zero_error: Decimal = Field(
        ...,
        description="Zero-load reference baseline error E_0 at this temperature.",
    )
    span_load: Decimal | None = Field(
        default=None,
        description="Nominal span test load applied (typically Max).",
    )
    span_corrected_error: Decimal | None = Field(
        default=None,
        description="Corrected error at span load at this temperature: E_c(Max, T).",
    )
    span_shift_from_ref: Decimal | None = Field(
        default=None,
        description=(
            "Span error shift relative to reference temperature (+20 °C): "
            "E_c(T) - E_c(T_ref)."
        ),
    )
    span_temp_coefficient_ppm: Decimal | None = Field(
        default=None,
        description="Sensitivity temperature coefficient in ppm/°C.",
    )
    all_loads_passed: bool = Field(
        ...,
        description="True if all test loads at this temperature satisfied Table 6 MPE.",
    )
    status: ComplianceStatus = Field(
        ...,
        description="Overall compliance status for this temperature plateau.",
    )
    notes: str | None = Field(
        default=None,
        description="Laboratory environmental remarks or chamber observations.",
    )


class TemperatureEvaluationResult(MetrologyBaseModel):
    """Complete statutory evaluation report for an OIML R 76-1 Clause A.5.3 temperature test."""

    reference_temperature_celsius: Decimal = Field(
        default=REFERENCE_TEMPERATURE_CELSIUS,
        description="Statutory reference baseline temperature (+20 °C).",
    )
    plateaus: list[EvaluatedTemperaturePlateau] = Field(
        ...,
        description="Evaluated test plateaus across the thermal cycle.",
    )
    zero_drift_segments: list[EvaluatedZeroDriftSegment] = Field(
        ...,
        description="Evaluated zero drift segments across temperature transitions.",
    )
    max_zero_drift_per_5c: Decimal = Field(
        ...,
        description="Maximum normalized zero drift per 5 °C observed across all transitions.",
    )
    max_zero_drift_segment_label: str = Field(
        ...,
        description="Temperature transition that exhibited the maximum zero drift.",
    )
    zero_drift_status: ComplianceStatus = Field(
        ...,
        description="Statutory compliance verdict for zero temperature stability.",
    )
    max_span_shift: Decimal | None = Field(
        default=None,
        description="Maximum span shift observed relative to reference temperature.",
    )
    max_span_temp_coeff_ppm: Decimal | None = Field(
        default=None,
        description="Maximum span temperature coefficient in ppm/°C.",
    )
    all_loads_compliant: bool = Field(
        ...,
        description="True if weighing performance at all temperatures satisfied Table 6 MPE.",
    )
    thermal_rate_compliant: bool = Field(
        ...,
        description="True if all temperature transitions respected the <= 5 °C/h speed limit.",
    )
    stabilization_compliant: bool = Field(
        ...,
        description="True if thermal soak duration at all plateaus satisfied >= 2.0 h.",
    )
    overall_status: ComplianceStatus = Field(
        ...,
        description="Overall test compliance verdict (PASS / FAIL).",
    )
    summary_latex: str = Field(
        ...,
        description="Summary LaTeX formula and compliance declaration for certificate output.",
    )


def calculate_zero_drift_limit(
    e: Decimal,
    accuracy_class: AccuracyClass = AccuracyClass.CLASS_III,
) -> Decimal:
    """Calculate the statutory zero drift limit per 5 °C per Clause 3.9.2.3.

    Class I: 0.5e per 5 °C
    Class II, III, IIII: 1.0e per 5 °C
    """
    e_dec = to_decimal(e)
    if e_dec <= ZERO_DECIMAL:
        raise ValueError(f"Verification scale interval e must be > 0, got: {e_dec}")

    factor = (
        ZERO_DRIFT_FACTOR_CLASS_I
        if accuracy_class == AccuracyClass.CLASS_I
        else ZERO_DRIFT_FACTOR_CLASS_OTHER
    )
    return factor * e_dec


def evaluate_zero_drift_segment(
    from_temp: Decimal | None = None,
    to_temp: Decimal | None = None,
    zero_error_initial: Decimal | None = None,
    zero_error_final: Decimal | None = None,
    e: Decimal | None = None,
    accuracy_class: AccuracyClass | None = None,
    t1: Decimal | None = None,
    t2: Decimal | None = None,
    e0_1: Decimal | None = None,
    e0_2: Decimal | None = None,
    spec: InstrumentSpecification | None = None,
) -> EvaluatedZeroDriftSegment:
    """Evaluate zero indication shift between two temperature levels (Clause 3.9.2.3).

    Calculates:
    - Delta T = |T_to - T_from|
    - Delta E_0 = |E_0,to - E_0,from|
    - Drift per 5 °C = (Delta E_0 / Delta T) * 5
    - Verifies against statutory limit (0.5e for Class I, 1.0e for Class II/III/IIII).
    """
    t1_val = from_temp if from_temp is not None else t1
    t2_val = to_temp if to_temp is not None else t2
    z1_val = zero_error_initial if zero_error_initial is not None else e0_1
    z2_val = zero_error_final if zero_error_final is not None else e0_2
    e_val = e if e is not None else (spec.e if spec is not None else None)
    acc_cls = (
        accuracy_class
        if accuracy_class is not None
        else (spec.accuracy_class if spec is not None else AccuracyClass.CLASS_III)
    )

    if t1_val is None or t2_val is None or z1_val is None or z2_val is None or e_val is None:
        raise ValueError(
            "Missing required arguments for evaluate_zero_drift_segment: "
            "temperatures, zero errors, and e/spec are required."
        )

    t1_dec = to_decimal(t1_val)
    t2_dec = to_decimal(t2_val)
    z1_dec = to_decimal(z1_val)
    z2_dec = to_decimal(z2_val)
    e_dec = to_decimal(e_val)

    if e_dec <= ZERO_DECIMAL:
        raise ValueError(f"Verification scale interval e must be > 0, got: {e_dec}")

    delta_t = abs(t2_dec - t1_dec)
    if delta_t == ZERO_DECIMAL:
        raise ValueError("Temperature delta must be non-zero.")

    delta_z = abs(z2_dec - z1_dec)
    drift_per_c = delta_z / delta_t
    drift_5c = drift_per_c * TEMP_DELTA_NORMALIZATION_STEP
    drift_5c_in_e = drift_5c / e_dec

    limit_5c = calculate_zero_drift_limit(e=e_dec, accuracy_class=acc_cls)
    margin = limit_5c - drift_5c

    if margin > ZERO_DECIMAL:
        status = ComplianceStatus.PASS
    elif margin == ZERO_DECIMAL:
        status = ComplianceStatus.MARGINAL
    else:
        status = ComplianceStatus.FAIL

    latex = (
        rf"\Delta T = |{t2_dec} - ({t1_dec})| = {delta_t} \, ^\circ\text{{C}}, \quad "
        rf"\Delta E_0 = |{z2_dec} - ({z1_dec})| = {delta_z}, \quad "
        rf"\left(\frac{{\Delta E_0}}{{\Delta T}}\right) \times 5 = {drift_5c:.5f} "
        rf"\ ({drift_5c_in_e:.3f}e), \quad "
        rf"\le {limit_5c} \implies \text{{{status.value}}}"
    )

    return EvaluatedZeroDriftSegment(
        from_temperature_celsius=t1_dec,
        to_temperature_celsius=t2_dec,
        temperature_delta_celsius=delta_t,
        zero_error_initial=z1_dec,
        zero_error_final=z2_dec,
        zero_error_shift=delta_z,
        drift_per_celsius=drift_per_c,
        drift_per_5_celsius=drift_5c,
        drift_per_5_celsius_in_e=drift_5c_in_e,
        allowable_limit_5_celsius=limit_5c,
        margin=margin,
        status=status,
        latex_formula=latex,
    )


def evaluate_temperature_plateau(
    temperature: Decimal,
    zero_error: Decimal,
    load_observations: Sequence[ObservationPoint | dict | tuple],
    e: Decimal | None = None,
    accuracy_class: AccuracyClass = AccuracyClass.CLASS_III,
    duration_hours: Decimal = MIN_STABILIZATION_HOURS,
    transition_rate_c_per_hr: Decimal | None = None,
    plateau_label: str = "Temperature Plateau",
    ref_span_error: Decimal | None = None,
    ref_temperature: Decimal = REFERENCE_TEMPERATURE_CELSIUS,
    stage: VerificationStage = VerificationStage.INITIAL_TYPE_APPROVAL,
    spec: InstrumentSpecification | None = None,
    rulepack: RulePack | None = None,
    notes: str | None = None,
) -> EvaluatedTemperaturePlateau:
    """Evaluate weighing performance and span error at a single temperature plateau.

    Calculates:
    - Stabilization and transition rate compliance.
    - Error of indication at test loads: Ec = E - E0.
    - Span shift and sensitivity temperature coefficient relative to reference.
    """
    if spec is not None:
        if e is None:
            e = spec.e
        if accuracy_class == AccuracyClass.CLASS_III and spec.accuracy_class is not None:
            accuracy_class = spec.accuracy_class

    if e is None:
        raise ValueError("Verification scale interval 'e' or 'spec' must be provided.")

    temp_dec = to_decimal(temperature)
    z_dec = to_decimal(zero_error)
    e_dec = to_decimal(e)
    dur_dec = to_decimal(duration_hours)
    rate_dec = (
        to_decimal(transition_rate_c_per_hr)
        if transition_rate_c_per_hr is not None
        else None
    )
    active_rp = rulepack or default_rulepack_manager.get_active_rulepack()

    stabilization_ok = dur_dec >= MIN_STABILIZATION_HOURS
    rate_ok = (rate_dec <= MAX_TEMP_CHANGE_RATE_C_PER_HR) if rate_dec is not None else True

    span_load: Decimal | None = None
    span_corr_err: Decimal | None = None
    all_loads_passed = True

    for item in load_observations:
        if isinstance(item, ObservationPoint):
            load_val = item.load
            ind = item.indication
            dl = item.delta_load
        elif isinstance(item, dict):
            load_val = to_decimal(item.get("load", item.get("net_load")))
            ind = to_decimal(item.get("indication", item.get("indication_net")))
            dl = to_decimal(item.get("delta_load", ZERO_DECIMAL))
        elif isinstance(item, tuple | list):
            load_val = to_decimal(item[0])
            ind = to_decimal(item[1])
            dl = to_decimal(item[2]) if len(item) > 2 else ZERO_DECIMAL
        else:
            raise TypeError(f"Unsupported load observation format: {type(item).__name__}")

        p_true = calculate_changeover(indication=ind, e=e_dec, delta_load=dl)
        e_uncorr = calculate_uncorrected_error(turning_point=p_true, load=load_val)
        e_corr = calculate_corrected_error(uncorrected_error=e_uncorr, zero_error=z_dec)

        mpe_res = active_rp.calculate_mpe(
            load=load_val,
            e=e_dec,
            accuracy_class=accuracy_class,
            stage=stage,
        )

        if abs(e_corr) > mpe_res.mpe_value:
            all_loads_passed = False

        # Identify span load (maximum applied load in this plateau)
        if span_load is None or load_val > span_load:
            span_load = load_val
            span_corr_err = e_corr

    # Calculate span shift and temperature coefficient relative to reference
    span_shift: Decimal | None = None
    temp_coeff_ppm: Decimal | None = None

    if span_corr_err is not None and ref_span_error is not None and span_load is not None:
        span_shift = span_corr_err - ref_span_error
        ref_t_dec = to_decimal(ref_temperature)
        temp_delta_from_ref = temp_dec - ref_t_dec
        if temp_delta_from_ref != ZERO_DECIMAL and span_load > ZERO_DECIMAL:
            temp_coeff = span_shift / (span_load * temp_delta_from_ref)
            temp_coeff_ppm = temp_coeff * MILLION_DECIMAL
        elif temp_delta_from_ref == ZERO_DECIMAL:
            temp_coeff_ppm = ZERO_DECIMAL

    overall_ok = stabilization_ok and rate_ok and all_loads_passed
    status = ComplianceStatus.PASS if overall_ok else ComplianceStatus.FAIL

    return EvaluatedTemperaturePlateau(
        temperature_celsius=temp_dec,
        plateau_label=plateau_label,
        duration_hours=dur_dec,
        transition_rate_c_per_hr=rate_dec,
        stabilization_compliant=stabilization_ok,
        transition_rate_compliant=rate_ok,
        zero_error=z_dec,
        span_load=span_load,
        span_corrected_error=span_corr_err,
        span_shift_from_ref=span_shift,
        span_temp_coefficient_ppm=temp_coeff_ppm,
        all_loads_passed=all_loads_passed,
        status=status,
        notes=notes,
    )


def evaluate_temperature_session(
    spec: InstrumentSpecification,
    plateaus_data: Sequence[dict],
    stage: VerificationStage = VerificationStage.INITIAL_TYPE_APPROVAL,
    rulepack: RulePack | None = None,
    reference_temperature: Decimal = REFERENCE_TEMPERATURE_CELSIUS,
) -> TemperatureEvaluationResult:
    """Evaluate a complete static temperature influence test session (Clause A.5.3).

    Statutory Requirements:
    - Zero drift per 5 °C <= 0.5e (Class I) or 1.0e (Class II, III, IIII).
    - Rate of temperature change <= 5 °C/h.
    - Stabilization >= 2 hours.
    - Weighing accuracy at all test loads within Table 6 MPE.

    Args:
        spec: Declared instrument specifications.
        plateaus_data: List of plateau dicts with keys:
            - temperature: Decimal
            - zero_error: Decimal (or zero_indication and zero_delta_load)
            - load_observations: list of (load, indication, delta_load)
            - duration_hours: Decimal (default 2.0)
            - transition_rate_c_per_hr: Decimal | None
            - plateau_label: str
        stage: Initial verification vs in-service inspection.
        rulepack: Active metrological RulePack.
        reference_temperature: Nominal reference temperature (+20 °C).

    Returns:
        TemperatureEvaluationResult with zero drift segments, plateau performance, and verdict.
    """
    if len(plateaus_data) < 2:
        raise ValueError(
            f"At least 2 temperature plateaus required to evaluate temperature drift, "
            f"got {len(plateaus_data)}."
        )

    active_rp = rulepack or default_rulepack_manager.get_active_rulepack()
    ref_temp = to_decimal(reference_temperature)

    has_ref_plateau = any(to_decimal(p["temperature"]) == ref_temp for p in plateaus_data)
    if not has_ref_plateau:
        raise ValueError(
            f"Reference temperature plateau ({ref_temp} °C) not found in plateaus data."
        )

    # First pass: identify reference span error at +20 °C if present
    ref_span_error: Decimal | None = None
    for p_data in plateaus_data:
        p_temp = to_decimal(p_data["temperature"])
        if p_temp == ref_temp:
            z_err = to_decimal(p_data.get("zero_error", ZERO_DECIMAL))
            load_obs = p_data.get("load_observations", [])
            max_l: Decimal | None = None
            for obs in load_obs:
                l_val = to_decimal(obs["load"] if isinstance(obs, dict) else obs[0])
                ind = to_decimal(obs["indication"] if isinstance(obs, dict) else obs[1])
                if isinstance(obs, dict):
                    dl = to_decimal(obs.get("delta_load", ZERO_DECIMAL))
                else:
                    dl = to_decimal(obs[2] if len(obs) > 2 else ZERO_DECIMAL)
                if max_l is None or l_val > max_l:
                    max_l = l_val
                    p_true = calculate_changeover(indication=ind, e=spec.e, delta_load=dl)
                    ref_span_error = calculate_corrected_error(
                        uncorrected_error=calculate_uncorrected_error(p_true, l_val),
                        zero_error=z_err,
                    )
            break

    # Second pass: evaluate each plateau
    evaluated_plateaus: list[EvaluatedTemperaturePlateau] = []
    for p_data in plateaus_data:
        p_temp = to_decimal(p_data["temperature"])
        z_err = to_decimal(p_data.get("zero_error", ZERO_DECIMAL))
        load_obs = p_data.get("load_observations", [])
        dur = to_decimal(p_data.get("duration_hours", MIN_STABILIZATION_HOURS))
        rate_val = p_data.get("transition_rate_c_per_hr")
        rate = to_decimal(rate_val) if rate_val is not None else None
        lbl = str(p_data.get("plateau_label", f"Plateau ({p_temp} °C)"))

        ev_plat = evaluate_temperature_plateau(
            temperature=p_temp,
            zero_error=z_err,
            load_observations=load_obs,
            e=spec.e,
            accuracy_class=spec.accuracy_class,
            duration_hours=dur,
            transition_rate_c_per_hr=rate,
            plateau_label=lbl,
            ref_span_error=ref_span_error,
            ref_temperature=ref_temp,
            stage=stage,
            rulepack=active_rp,
            notes=p_data.get("notes"),
        )
        evaluated_plateaus.append(ev_plat)

    # Evaluate zero drift across consecutive temperature plateaus
    zero_drift_segments: list[EvaluatedZeroDriftSegment] = []
    max_drift_5c = ZERO_DECIMAL
    max_drift_segment_lbl = "None"

    for i in range(len(evaluated_plateaus) - 1):
        p1 = evaluated_plateaus[i]
        p2 = evaluated_plateaus[i + 1]
        seg = evaluate_zero_drift_segment(
            from_temp=p1.temperature_celsius,
            to_temp=p2.temperature_celsius,
            zero_error_initial=p1.zero_error,
            zero_error_final=p2.zero_error,
            e=spec.e,
            accuracy_class=spec.accuracy_class,
        )
        zero_drift_segments.append(seg)

        if seg.drift_per_5_celsius > max_drift_5c:
            max_drift_5c = seg.drift_per_5_celsius
            max_drift_segment_lbl = f"{p1.temperature_celsius} °C -> {p2.temperature_celsius} °C"

    # Evaluate span shifts
    span_shifts = [
        p.span_shift_from_ref for p in evaluated_plateaus if p.span_shift_from_ref is not None
    ]
    max_span_shift = max((abs(s) for s in span_shifts), default=None)

    span_coeffs = [
        abs(p.span_temp_coefficient_ppm)
        for p in evaluated_plateaus
        if p.span_temp_coefficient_ppm is not None and p.temperature_celsius != ref_temp
    ]
    max_span_coeff_ppm = max(span_coeffs, default=None)

    # Verdict synthesis
    zero_drift_ok = all(s.status != ComplianceStatus.FAIL for s in zero_drift_segments)
    all_loads_ok = all(p.all_loads_passed for p in evaluated_plateaus)
    thermal_rate_ok = all(p.transition_rate_compliant for p in evaluated_plateaus)
    stabilization_ok = all(p.stabilization_compliant for p in evaluated_plateaus)

    zero_drift_status = ComplianceStatus.PASS if zero_drift_ok else ComplianceStatus.FAIL

    overall_ok = zero_drift_ok and all_loads_ok and thermal_rate_ok and stabilization_ok
    overall_status = ComplianceStatus.PASS if overall_ok else ComplianceStatus.FAIL

    limit_5c = calculate_zero_drift_limit(e=spec.e, accuracy_class=spec.accuracy_class)
    summary_latex = (
        rf"\text{{Temperature Test}}: "
        rf"\max(\text{{Zero Drift}}_{{5^\circ\text{{C}}}}) = {max_drift_5c:.4f} "
        rf"\ (\text{{Limit: }} {limit_5c} \implies \text{{{zero_drift_status.value}}}), \quad "
        rf"\text{{Overall Status}} = \text{{{overall_status.value}}}"
    )

    return TemperatureEvaluationResult(
        reference_temperature_celsius=ref_temp,
        plateaus=evaluated_plateaus,
        zero_drift_segments=zero_drift_segments,
        max_zero_drift_per_5c=max_drift_5c,
        max_zero_drift_segment_label=max_drift_segment_lbl,
        zero_drift_status=zero_drift_status,
        max_span_shift=max_span_shift,
        max_span_temp_coeff_ppm=max_span_coeff_ppm,
        all_loads_compliant=all_loads_ok,
        thermal_rate_compliant=thermal_rate_ok,
        stabilization_compliant=stabilization_ok,
        overall_status=overall_status,
        summary_latex=summary_latex,
    )
