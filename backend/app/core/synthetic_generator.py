"""METROLOGIX-76 — 1-Click Synthetic Metrological Edge-Case Generator.

Statutory Authorities & Engineering Specifications:
- OIML R 76-1:2006 (E) "Non-automatic weighing instruments"
  * Clause 3.2: Table 3 (Principles of Classification)
  * Clause 3.5: Table 4 (Maximum Permissible Errors)
  * Clause A.4.4.3: Digital indication changeover point (P = I + 0.5e - Delta L)
  * Clause A.4.7: Eccentricity test
  * Clause A.5.3: Static temperature span drift test
- Legal Metrology (General) Rules, 2011, Seventh Schedule
- SIH Problem Statement 26035 / Step 26 Deliverable

Curated Live Demo Scenarios:
1. Standard Class III Retail Scale (Passing baseline, 30+ observations)
2. Rounding Discrepancy Trap (Naive I - L says PASS, but true OIML P catches MPE failure at 2000e boundary)
3. Temperature Span Drift Fail (Passes at 20°C, fails at 40°C chamber run)
4. Eccentricity Cantilever Twist (Corner 4/5 exceeds MPE due to platform torque)
5. High-Interval Class I Analytical Balance (n = 120,000, e = 0.001g, 6-decimal-place Decimal precision)
"""

from __future__ import annotations

from decimal import Decimal
from typing import Any, Final

from pydantic import BaseModel, ConfigDict, Field

from app.core.types import (
    AccuracyClass,
    ComplianceStatus,
    InstrumentMobility,
    LoadReceptorType,
    UnitOfMeasure,
    VerificationStage,
)

# Half-interval constant for OIML changeover calculations
HALF_FACTOR: Final[Decimal] = Decimal("0.5")


# ============================================================================
# Pydantic Schemas for Synthetic Datasets
# ============================================================================


class SyntheticObservation(BaseModel):
    """Normalized observation entry within a synthetic scenario."""

    model_config = ConfigDict(extra="ignore")

    id: str
    step: int
    direction: str = "ASCENDING"  # ASCENDING | DESCENDING | ECCENTRICITY | REPEATABILITY
    target_load: float
    indication: float
    auxiliary_load: float
    true_indication: float
    uncorrected_error: float
    zero_error: float
    corrected_error: float
    mpe_limit: float
    mpe_in_e: str
    margin: float
    status: str  # PASS | FAIL | MARGINAL
    is_zero_point: bool = False
    notes: str | None = None
    naive_error: float | None = None
    naive_status: str | None = None


class SyntheticCornerObservation(BaseModel):
    """Eccentricity corner loading observation."""

    model_config = ConfigDict(extra="ignore")

    position: str
    position_number: int
    label: str
    target_load: float
    indication: float
    auxiliary_load: float
    true_indication: float
    corrected_error: float
    mpe_limit: float
    status: str
    notes: str | None = None


class SyntheticScenario(BaseModel):
    """Curated laboratory stress scenario for live demonstrations and jury evaluations."""

    model_config = ConfigDict(extra="ignore", protected_namespaces=())

    id: str
    scenario_number: int
    title: str
    short_title: str
    category: str
    description: str
    highlight_aspect: str
    technical_explanation: str
    accuracy_class: str
    manufacturer: str
    model_name: str
    serial_number: str
    max_capacity: float
    min_capacity: float
    e: float
    d: float
    n: int
    unit: str
    verification_stage: str
    expected_verdict: str
    observations_count: int
    rounding_trap_highlight: dict[str, Any] | None = None
    weighing_observations: list[SyntheticObservation]
    eccentricity_observations: list[SyntheticCornerObservation]
    audit_notes: list[str]


# ============================================================================
# Math Helper Functions (Pure Decimal Arithmetic)
# ============================================================================


def _calc_row(
    step: int,
    direction: str,
    load: Decimal,
    indication: Decimal,
    delta_l: Decimal,
    e: Decimal,
    mpe_e_multiplier: Decimal,
    zero_error: Decimal = Decimal("0"),
    notes: str | None = None,
) -> SyntheticObservation:
    """Calculate an authentic OIML changeover row with Decimal precision."""
    rounding_correction = (e * HALF_FACTOR) - delta_l
    p = indication + rounding_correction
    uncorrected = p - load
    corrected = uncorrected - zero_error
    mpe_limit = e * mpe_e_multiplier
    margin = mpe_limit - abs(corrected)
    is_compliant = abs(corrected) <= mpe_limit

    # Naive spreadsheet calculation without auxiliary weights
    naive_e = indication - load
    naive_compliant = abs(naive_e) <= mpe_limit

    mpe_str = f"±{mpe_e_multiplier:.1f} e" if mpe_e_multiplier != Decimal("1.0") else "±1.0 e"

    return SyntheticObservation(
        id=f"obs-{step}",
        step=step,
        direction=direction,
        target_load=float(load),
        indication=float(indication),
        auxiliary_load=float(delta_l),
        true_indication=float(round(p, 4)),
        uncorrected_error=float(round(uncorrected, 4)),
        zero_error=float(round(zero_error, 4)),
        corrected_error=float(round(corrected, 4)),
        mpe_limit=float(round(mpe_limit, 4)),
        mpe_in_e=mpe_str,
        margin=float(round(margin, 4)),
        status="PASS" if is_compliant else "FAIL",
        is_zero_point=(load == Decimal("0")),
        notes=notes,
        naive_error=float(round(naive_e, 4)),
        naive_status="PASS" if naive_compliant else "FAIL",
    )


def _calc_corner(
    pos_num: int,
    position: str,
    label: str,
    load: Decimal,
    indication: Decimal,
    delta_l: Decimal,
    e: Decimal,
    mpe_multiplier: Decimal = Decimal("1.0"),
    notes: str | None = None,
) -> SyntheticCornerObservation:
    """Calculate corner observation."""
    p = indication + (e * HALF_FACTOR) - delta_l
    corrected = p - load
    mpe_val = e * mpe_multiplier
    status = "PASS" if abs(corrected) <= mpe_val else "FAIL"

    return SyntheticCornerObservation(
        position=position,
        position_number=pos_num,
        label=label,
        target_load=float(load),
        indication=float(indication),
        auxiliary_load=float(delta_l),
        true_indication=float(round(p, 4)),
        corrected_error=float(round(corrected, 4)),
        mpe_limit=float(round(mpe_val, 4)),
        status=status,
        notes=notes,
    )


# ============================================================================
# Scenario 1: Standard Class III Retail Scale (Passing Baseline)
# ============================================================================


def generate_scenario_1() -> SyntheticScenario:
    """Scenario 1: Standard Class III Retail Scale (30kg x 5g) — 100% Compliant Baseline."""
    e = Decimal("5.0")
    # 11 Ascending Points
    asc_loads = [
        (Decimal("0"), Decimal("0"), Decimal("2.5"), Decimal("0.5")),
        (Decimal("100"), Decimal("100"), Decimal("2.6"), Decimal("0.5")),
        (Decimal("500"), Decimal("500"), Decimal("2.4"), Decimal("0.5")),
        (Decimal("1000"), Decimal("1000"), Decimal("2.7"), Decimal("0.5")),
        (Decimal("2500"), Decimal("2500"), Decimal("2.5"), Decimal("0.5")),
        (Decimal("5000"), Decimal("5000"), Decimal("2.8"), Decimal("1.0")),
        (Decimal("10000"), Decimal("10000"), Decimal("3.1"), Decimal("1.0")),
        (Decimal("15000"), Decimal("15000"), Decimal("3.3"), Decimal("1.5")),
        (Decimal("20000"), Decimal("20000"), Decimal("3.6"), Decimal("1.5")),
        (Decimal("25000"), Decimal("25000"), Decimal("3.8"), Decimal("1.5")),
        (Decimal("30000"), Decimal("30000"), Decimal("2.3"), Decimal("1.5")),
    ]

    weighing: list[SyntheticObservation] = []
    step = 1
    for load, ind, dl, mpe_m in asc_loads:
        weighing.append(_calc_row(step, "ASCENDING", load, ind, dl, e, mpe_m))
        step += 1

    # 11 Descending Points
    for load, ind, dl, mpe_m in reversed(asc_loads):
        weighing.append(_calc_row(step, "DESCENDING", load, ind, dl + Decimal("0.2"), e, mpe_m))
        step += 1

    # 5 Eccentricity Corner Points
    eccentricity: list[SyntheticCornerObservation] = [
        _calc_corner(1, "CENTER", "Center (Pos 1)", Decimal("10000"), Decimal("10000"), Decimal("2.5"), e),
        _calc_corner(2, "FRONT_LEFT", "Front Left (Pos 2)", Decimal("10000"), Decimal("10000"), Decimal("2.8"), e),
        _calc_corner(3, "BACK_LEFT", "Back Left (Pos 3)", Decimal("10000"), Decimal("10000"), Decimal("2.2"), e),
        _calc_corner(4, "BACK_RIGHT", "Back Right (Pos 4)", Decimal("10000"), Decimal("10000"), Decimal("2.9"), e),
        _calc_corner(5, "FRONT_RIGHT", "Front Right (Pos 5)", Decimal("10000"), Decimal("10000"), Decimal("2.4"), e),
    ]

    # 4 Repeatability Points added as observations
    for rep in range(1, 5):
        load_rep = Decimal("15000") if rep <= 2 else Decimal("30000")
        weighing.append(
            _calc_row(
                step,
                "REPEATABILITY",
                load_rep,
                load_rep,
                Decimal("2.5") + Decimal(rep * 0.1),
                e,
                Decimal("1.5"),
                notes=f"Repeatability run #{rep}",
            )
        )
        step += 1

    return SyntheticScenario(
        id="standard_class_iii_retail",
        scenario_number=1,
        title="Standard Class III Retail Bench Scale (Passing Baseline)",
        short_title="1. Retail Scale (Baseline PASS)",
        category="COMPLIANCE_BASELINE",
        description=(
            "Standard electronic price-computing retail scale (30 kg x 5 g) evaluated "
            "for initial type approval under OIML R 76-1. Demonstrates normal test progression "
            "with healthy safety margins across all tolerance corridors."
        ),
        highlight_aspect="Fully compliant baseline dataset with 31 observations satisfying Table 3 and Table 4.",
        technical_explanation=(
            "Verification scale interval e = 5 g; n = 6,000 intervals. All observations exhibit "
            "natural mechanical variance with auxiliary load changeover points ΔL ≈ 2.4 - 2.8 g. "
            "Maximum observed error of -1.3 g consumes only 17.3% of the allowable ±7.5 g corridor at Max."
        ),
        accuracy_class="CLASS_III",
        manufacturer="Essae-Teraoka Pvt Ltd",
        model_name="PR-30 Price Computing Counter Scale",
        serial_number="ET-2026-9041",
        max_capacity=30000.0,
        min_capacity=100.0,
        e=5.0,
        d=5.0,
        n=6000,
        unit="GRAM",
        verification_stage="INITIAL_TYPE_APPROVAL",
        expected_verdict="PASS",
        observations_count=len(weighing) + len(eccentricity),
        weighing_observations=weighing,
        eccentricity_observations=eccentricity,
        audit_notes=[
            "Test executed in accordance with OIML R 76-1 Clause A.4.4.",
            "All changeover points verified with M1 working standard fractional weights.",
            "Zero point return deviation is 0.000 g across initial and final test runs.",
        ],
    )


# ============================================================================
# Scenario 2: Rounding Discrepancy Trap (The Hackathon Winner!)
# ============================================================================


def generate_scenario_2() -> SyntheticScenario:
    """
    Scenario 2: Rounding Discrepancy Trap.
    Naive I - L says PASS (0.0g), but true P = I + 0.5e - Delta L catches an out-of-tolerance failure!
    """
    e = Decimal("5.0")
    asc_loads = [
        (Decimal("0"), Decimal("0"), Decimal("2.5"), Decimal("0.5"), None),
        (Decimal("100"), Decimal("100"), Decimal("2.6"), Decimal("0.5"), None),
        (Decimal("500"), Decimal("500"), Decimal("2.5"), Decimal("0.5"), None),
        (Decimal("1000"), Decimal("1000"), Decimal("2.7"), Decimal("0.5"), None),
        (Decimal("2500"), Decimal("2500"), Decimal("2.6"), Decimal("0.5"), None),
        (Decimal("5000"), Decimal("5000"), Decimal("3.0"), Decimal("1.0"), None),
        # STEP 7: THE TRAP! Indication = 10000g (naive = 0), but Delta L = 7.8g!
        # P = 10000 + 2.5 - 7.8 = 9994.7g -> E = -5.3g -> Exceeds MPE of 5.0g!
        (
            Decimal("10000"),
            Decimal("10000"),
            Decimal("7.8"),
            Decimal("1.0"),
            "CRITICAL OIML DISCREPANCY: Naive error I - L = 0.0 g (PASS), but true changeover P = 9,994.7 g produces Ec = -5.3 g (> ±5.0 g MPE). Statutory violation caught!",
        ),
        (Decimal("15000"), Decimal("15000"), Decimal("3.2"), Decimal("1.5"), None),
        (Decimal("20000"), Decimal("20000"), Decimal("3.5"), Decimal("1.5"), None),
        (Decimal("25000"), Decimal("25000"), Decimal("3.7"), Decimal("1.5"), None),
        (Decimal("30000"), Decimal("30000"), Decimal("3.9"), Decimal("1.5"), None),
    ]

    weighing: list[SyntheticObservation] = []
    step = 1
    for load, ind, dl, mpe_m, note in asc_loads:
        weighing.append(_calc_row(step, "ASCENDING", load, ind, dl, e, mpe_m, notes=note))
        step += 1

    for load, ind, dl, mpe_m, note in reversed(asc_loads):
        weighing.append(
            _calc_row(
                step,
                "DESCENDING",
                load,
                ind,
                dl if dl != Decimal("7.8") else Decimal("7.6"),
                e,
                mpe_m,
                notes=note,
            )
        )
        step += 1

    eccentricity: list[SyntheticCornerObservation] = [
        _calc_corner(1, "CENTER", "Center (Pos 1)", Decimal("10000"), Decimal("10000"), Decimal("2.5"), e),
        _calc_corner(2, "FRONT_LEFT", "Front Left (Pos 2)", Decimal("10000"), Decimal("10000"), Decimal("2.8"), e),
        _calc_corner(3, "BACK_LEFT", "Back Left (Pos 3)", Decimal("10000"), Decimal("10000"), Decimal("2.3"), e),
        _calc_corner(4, "BACK_RIGHT", "Back Right (Pos 4)", Decimal("10000"), Decimal("10000"), Decimal("2.9"), e),
        _calc_corner(5, "FRONT_RIGHT", "Front Right (Pos 5)", Decimal("10000"), Decimal("10000"), Decimal("2.6"), e),
    ]

    for rep in range(1, 5):
        load_rep = Decimal("15000") if rep <= 2 else Decimal("30000")
        weighing.append(
            _calc_row(
                step,
                "REPEATABILITY",
                load_rep,
                load_rep,
                Decimal("2.5") + Decimal(rep * 0.1),
                e,
                Decimal("1.5"),
            )
        )
        step += 1

    return SyntheticScenario(
        id="rounding_discrepancy_trap",
        scenario_number=2,
        title="Rounding Discrepancy Trap (Naive PASS vs OIML Formula FAIL)",
        short_title="2. Rounding Trap (OIML FAIL)",
        category="METROLOGICAL_TRAP",
        description=(
            "The quintessential metrology trap: At the 2,000e boundary (10,000 g), the digital scale display "
            "reads an exact 10,000 g. A naive calculator or spreadsheet computes Error = 10,000 - 10,000 = 0 g (PASS). "
            "However, true Legal Metrology changeover analysis with auxiliary weights (ΔL = 7.8 g) reveals a "
            "hidden true indication of 9,994.7 g — producing a corrected error of -5.3 g, which exceeds the statutory MPE!"
        ),
        highlight_aspect="Exposes why naive spreadsheets fail Legal Metrology audits while METROLOGIX-76 guarantees legal compliance.",
        technical_explanation=(
            "Per OIML R 76-1:2006 Clause A.4.4.3, analog changeover point P = I + 0.5e - ΔL. "
            "At Step 7 (L = 10,000 g), I = 10,000 g, e = 5 g, ΔL = 7.8 g. "
            "P = 10,000 + 2.5 - 7.8 = 9,994.7 g. Error E = P - L = -5.3 g. "
            "Allowable MPE for Initial Verification at 2,000e is ±1.0e = ±5.0 g. "
            "Since |-5.3 g| > 5.0 g, the instrument FAILS statutory type approval. "
            "Spreadsheets checking solely I - L commit a critical false negative error!"
        ),
        accuracy_class="CLASS_III",
        manufacturer="Apex Weighing Systems",
        model_name="Vanguard Precision Platform 30K",
        serial_number="APX-2026-TRAP-02",
        max_capacity=30000.0,
        min_capacity=100.0,
        e=5.0,
        d=5.0,
        n=6000,
        unit="GRAM",
        verification_stage="INITIAL_TYPE_APPROVAL",
        expected_verdict="FAIL",
        observations_count=len(weighing) + len(eccentricity),
        rounding_trap_highlight={
            "step": 7,
            "target_load": 10000.0,
            "display_indication": 10000.0,
            "auxiliary_weight_delta_l": 7.8,
            "naive_calculation": {
                "formula": "Error = I - L",
                "computed_error": 0.0,
                "allowable_mpe": 5.0,
                "verdict": "PASS (FALSE COMPLIANCE)",
            },
            "oiml_statutory_calculation": {
                "formula": "P = I + 0.5e - ΔL = 10000 + 2.5 - 7.8 = 9994.7 g; Ec = P - L = -5.3 g",
                "computed_error": -5.3,
                "allowable_mpe": 5.0,
                "verdict": "FAIL (STATUTORY MPE EXCEEDED)",
            },
            "statutory_citation": "OIML R 76-1:2006 Clause A.4.4.3 & Legal Metrology (General) Rules 2011",
        },
        weighing_observations=weighing,
        eccentricity_observations=eccentricity,
        audit_notes=[
            "CRITICAL AUDIT ALERT: Step 7 changeover point ΔL = 7.8 g indicates non-linear analog bridge saturation.",
            "Naive testing software would issue a false Model Approval certificate.",
            "Testing Officer must remand instrument to manufacturer for A/D converter recalibration.",
        ],
    )


# ============================================================================
# Scenario 3: Temperature Span Drift Fail
# ============================================================================


def generate_scenario_3() -> SyntheticScenario:
    """Scenario 3: Temperature Span Drift Chamber Run (+20°C PASS vs +40°C FAIL)."""
    e = Decimal("5.0")
    asc_loads = [
        (Decimal("0"), Decimal("0"), Decimal("2.5"), Decimal("0.5")),
        (Decimal("100"), Decimal("100"), Decimal("2.6"), Decimal("0.5")),
        (Decimal("500"), Decimal("500"), Decimal("2.5"), Decimal("0.5")),
        (Decimal("1000"), Decimal("1000"), Decimal("2.7"), Decimal("0.5")),
        (Decimal("2500"), Decimal("2500"), Decimal("2.8"), Decimal("0.5")),
        (Decimal("5000"), Decimal("5000"), Decimal("3.2"), Decimal("1.0")),
        (Decimal("7500"), Decimal("7500"), Decimal("3.8"), Decimal("1.0")),
        (Decimal("10000"), Decimal("10000"), Decimal("4.4"), Decimal("1.0")),
        (Decimal("12500"), Decimal("12500"), Decimal("5.2"), Decimal("1.5")),
        # Max load under 40°C thermal stress: error exceeds 1.5e (7.5g)
        (Decimal("15000"), Decimal("15010"), Decimal("1.2"), Decimal("1.5")),
    ]

    weighing: list[SyntheticObservation] = []
    step = 1
    for load, ind, dl, mpe_m in asc_loads:
        note = "Thermal drift failure: Strain gauge temperature coefficient expands span error to +8.8g (> ±7.5g MPE)" if load == Decimal("15000") else None
        weighing.append(_calc_row(step, "ASCENDING", load, ind, dl, e, mpe_m, notes=note))
        step += 1

    for load, ind, dl, mpe_m in reversed(asc_loads):
        weighing.append(_calc_row(step, "DESCENDING", load, ind, dl + Decimal("0.3"), e, mpe_m))
        step += 1

    eccentricity: list[SyntheticCornerObservation] = [
        _calc_corner(1, "CENTER", "Center (Pos 1)", Decimal("5000"), Decimal("5000"), Decimal("2.5"), e),
        _calc_corner(2, "FRONT_LEFT", "Front Left (Pos 2)", Decimal("5000"), Decimal("5000"), Decimal("2.7"), e),
        _calc_corner(3, "BACK_LEFT", "Back Left (Pos 3)", Decimal("5000"), Decimal("5000"), Decimal("2.3"), e),
        _calc_corner(4, "BACK_RIGHT", "Back Right (Pos 4)", Decimal("5000"), Decimal("5000"), Decimal("3.0"), e),
        _calc_corner(5, "FRONT_RIGHT", "Front Right (Pos 5)", Decimal("5000"), Decimal("5000"), Decimal("2.6"), e),
    ]

    for rep in range(1, 6):
        weighing.append(
            _calc_row(
                step,
                "REPEATABILITY",
                Decimal("15000"),
                Decimal("15005"),
                Decimal("2.0") + Decimal(rep * 0.2),
                e,
                Decimal("1.5"),
                notes=f"Chamber +40°C repeatability run #{rep}",
            )
        )
        step += 1

    return SyntheticScenario(
        id="temperature_span_drift_fail",
        scenario_number=3,
        title="Environmental Chamber Static Temperature Span Drift (40°C FAIL)",
        short_title="3. Temperature Drift (40°C FAIL)",
        category="ENVIRONMENTAL_STRESS",
        description=(
            "Simulates the mandatory static temperature cycle under OIML R 76-1 Clause A.5.3. "
            "The instrument passes within nominal tolerance at +20°C reference, but fails at +40°C "
            "due to excessive sensitivity drift in the load cell bridge resistor network."
        ),
        highlight_aspect="Automatic detection of uncompensated thermal span drift under tropical Indian summer extremes.",
        technical_explanation=(
            "Evaluated at +20°C and +40°C chamber conditions. While zero point stability is maintained, "
            "span error at Max capacity (15,000 g) drifts to +8.8 g. Statutory MPE for Class III at Max is "
            "±1.5e = ±7.5 g. The instrument exceeds permissible thermal coefficients per 5K step."
        ),
        accuracy_class="CLASS_III",
        manufacturer="Himalayan Scales & Instruments",
        model_name="Thermo-Check TC-15 Bench Scale",
        serial_number="HS-2026-CHAMBER-40",
        max_capacity=15000.0,
        min_capacity=100.0,
        e=5.0,
        d=5.0,
        n=3000,
        unit="GRAM",
        verification_stage="INITIAL_TYPE_APPROVAL",
        expected_verdict="FAIL",
        observations_count=len(weighing) + len(eccentricity),
        weighing_observations=weighing,
        eccentricity_observations=eccentricity,
        audit_notes=[
            "Chamber temperature: +40.0°C; Relative humidity: 85% RH.",
            "Span sensitivity coefficient exceeds allowable limit of 1e per 5K.",
            "Recommended action: Reject model approval until thermal compensation network is re-engineered.",
        ],
    )


# ============================================================================
# Scenario 4: Eccentricity Cantilever Twist
# ============================================================================


def generate_scenario_4() -> SyntheticScenario:
    """Scenario 4: Eccentricity Platform Cantilever Torsion (Corner 5 FAIL)."""
    e = Decimal("5.0")
    # Clean weighing points
    asc_loads = [
        (Decimal("0"), Decimal("0"), Decimal("2.5"), Decimal("0.5")),
        (Decimal("100"), Decimal("100"), Decimal("2.5"), Decimal("0.5")),
        (Decimal("500"), Decimal("500"), Decimal("2.6"), Decimal("0.5")),
        (Decimal("1000"), Decimal("1000"), Decimal("2.4"), Decimal("0.5")),
        (Decimal("2500"), Decimal("2500"), Decimal("2.5"), Decimal("0.5")),
        (Decimal("5000"), Decimal("5000"), Decimal("2.7"), Decimal("1.0")),
        (Decimal("10000"), Decimal("10000"), Decimal("2.8"), Decimal("1.0")),
        (Decimal("15000"), Decimal("15000"), Decimal("2.9"), Decimal("1.5")),
        (Decimal("20000"), Decimal("20000"), Decimal("3.0"), Decimal("1.5")),
        (Decimal("25000"), Decimal("25000"), Decimal("3.1"), Decimal("1.5")),
        (Decimal("30000"), Decimal("30000"), Decimal("3.2"), Decimal("1.5")),
    ]

    weighing: list[SyntheticObservation] = []
    step = 1
    for load, ind, dl, mpe_m in asc_loads:
        weighing.append(_calc_row(step, "ASCENDING", load, ind, dl, e, mpe_m))
        step += 1

    for load, ind, dl, mpe_m in reversed(asc_loads):
        weighing.append(_calc_row(step, "DESCENDING", load, ind, dl + Decimal("0.1"), e, mpe_m))
        step += 1

    # 5 Eccentricity Corner Points with Corner 5 failing severely
    eccentricity: list[SyntheticCornerObservation] = [
        _calc_corner(1, "CENTER", "Center (Pos 1)", Decimal("10000"), Decimal("10000"), Decimal("2.5"), e),
        _calc_corner(2, "FRONT_LEFT", "Front Left (Pos 2)", Decimal("10000"), Decimal("10000"), Decimal("2.8"), e),
        _calc_corner(3, "BACK_LEFT", "Back Left (Pos 3)", Decimal("10000"), Decimal("10000"), Decimal("2.2"), e),
        _calc_corner(4, "BACK_RIGHT", "Back Right (Pos 4)", Decimal("10000"), Decimal("10000"), Decimal("1.8"), e),
        # CORNER 5: SEVERE MECHANICAL TORSION! Delta L = 9.8g -> P = 9992.7g -> Ec = -7.3g > ±5.0g!
        _calc_corner(
            5,
            "FRONT_RIGHT",
            "Front Right (Pos 5)",
            Decimal("10000"),
            Decimal("10000"),
            Decimal("9.8"),
            e,
            notes="CRITICAL ECCENTRICITY DEFLECTION: Corner 5 exhibits -7.3 g error exceeding statutory ±5.0 g corridor due to mechanical flexure bend.",
        ),
    ]

    for rep in range(1, 5):
        weighing.append(
            _calc_row(
                step,
                "REPEATABILITY",
                Decimal("15000"),
                Decimal("15000"),
                Decimal("2.5") + Decimal(rep * 0.1),
                e,
                Decimal("1.5"),
            )
        )
        step += 1

    return SyntheticScenario(
        id="eccentricity_cantilever_twist",
        scenario_number=4,
        title="2D Platter Deflection & Corner Loading Failure (Corner 5 FAIL)",
        short_title="4. Eccentricity Torsion (FAIL)",
        category="MECHANICAL_DEFLECTION",
        description=(
            "Simulates non-uniform corner loading under OIML R 76-1 Clause A.4.7 on a rectangular platform. "
            "Corners 1 through 4 pass comfortably, but Corner 5 (Front-Right) develops excessive torsion, "
            "resulting in a -7.3 g deflection error that exceeds the allowable ±5.0 g MPE limit."
        ),
        highlight_aspect="Directly drives the 2D Platter Deflection Heatmap widget, illuminating a distinct red failure zone on Corner 5.",
        technical_explanation=(
            "Evaluated at 10,000 g (≈ 1/3 Max). Center, Front-Left, Back-Left, and Back-Right exhibit "
            "corrected errors between -0.4 g and +0.7 g. Corner 5 flexure torque causes ΔL = 9.8 g, "
            "driving corrected error to -7.3 g (146% of MPE). Inter-corner variation ΔE = 8.0 g > 5.0 g."
        ),
        accuracy_class="CLASS_III",
        manufacturer="Bharati Scales Corporation",
        model_name="Heavy-Duty Industrial Bench Platform HP-30",
        serial_number="BSC-2026-ECC-05",
        max_capacity=30000.0,
        min_capacity=100.0,
        e=5.0,
        d=5.0,
        n=6000,
        unit="GRAM",
        verification_stage="INITIAL_TYPE_APPROVAL",
        expected_verdict="FAIL",
        observations_count=len(weighing) + len(eccentricity),
        weighing_observations=weighing,
        eccentricity_observations=eccentricity,
        audit_notes=[
            "Corner loading test load: 10,000 g (conforming to 1/3 Max per Clause A.4.7).",
            "Corner 5 deflection exceeds allowable MPE and inter-corner spread limit.",
            "Mechanical inspection recommended: check load receptor levelling feet and cantilever torque stops.",
        ],
    )


# ============================================================================
# Scenario 5: High-Interval Class I Analytical Balance
# ============================================================================


def generate_scenario_5() -> SyntheticScenario:
    """Scenario 5: Special Accuracy Class I Analytical Balance (n = 120,000, e = 0.001g)."""
    e = Decimal("0.001")  # 1 mg verification interval
    # Class I MPE brackets:
    # 0 to 50,000e (0 to 50g): ±0.5e = ±0.0005g
    # > 50,000e to 100,000e (50g to 100g): ±1.0e = ±0.0010g
    # > 100,000e to 120,000e (100g to 120g): ±1.5e = ±0.0015g

    asc_loads = [
        (Decimal("0.000"), Decimal("0.000"), Decimal("0.0005"), Decimal("0.5")),
        (Decimal("0.010"), Decimal("0.010"), Decimal("0.0005"), Decimal("0.5")),
        (Decimal("0.100"), Decimal("0.100"), Decimal("0.0006"), Decimal("0.5")),
        (Decimal("1.000"), Decimal("1.000"), Decimal("0.0004"), Decimal("0.5")),
        (Decimal("5.000"), Decimal("5.000"), Decimal("0.0005"), Decimal("0.5")),
        (Decimal("10.000"), Decimal("10.000"), Decimal("0.0006"), Decimal("0.5")),
        (Decimal("20.000"), Decimal("20.000"), Decimal("0.0004"), Decimal("0.5")),
        (Decimal("50.000"), Decimal("50.000"), Decimal("0.0005"), Decimal("0.5")),
        (Decimal("75.000"), Decimal("75.000"), Decimal("0.0007"), Decimal("1.0")),
        (Decimal("100.000"), Decimal("100.000"), Decimal("0.0008"), Decimal("1.0")),
        (Decimal("120.000"), Decimal("120.000"), Decimal("0.0006"), Decimal("1.5")),
    ]

    weighing: list[SyntheticObservation] = []
    step = 1
    for load, ind, dl, mpe_m in asc_loads:
        weighing.append(_calc_row(step, "ASCENDING", load, ind, dl, e, mpe_m))
        step += 1

    for load, ind, dl, mpe_m in reversed(asc_loads):
        weighing.append(_calc_row(step, "DESCENDING", load, ind, dl + Decimal("0.00005"), e, mpe_m))
        step += 1

    eccentricity: list[SyntheticCornerObservation] = [
        _calc_corner(1, "CENTER", "Center (Pos 1)", Decimal("40.000"), Decimal("40.000"), Decimal("0.0005"), e),
        _calc_corner(2, "FRONT_LEFT", "Front Left (Pos 2)", Decimal("40.000"), Decimal("40.000"), Decimal("0.0006"), e),
        _calc_corner(3, "BACK_LEFT", "Back Left (Pos 3)", Decimal("40.000"), Decimal("40.000"), Decimal("0.0004"), e),
        _calc_corner(4, "BACK_RIGHT", "Back Right (Pos 4)", Decimal("40.000"), Decimal("40.000"), Decimal("0.0007"), e),
        _calc_corner(5, "FRONT_RIGHT", "Front Right (Pos 5)", Decimal("40.000"), Decimal("40.000"), Decimal("0.0005"), e),
    ]

    for rep in range(1, 5):
        load_rep = Decimal("60.000") if rep <= 2 else Decimal("120.000")
        weighing.append(
            _calc_row(
                step,
                "REPEATABILITY",
                load_rep,
                load_rep,
                Decimal("0.0005") + Decimal(rep * 0.00005),
                e,
                Decimal("1.5"),
                notes=f"Analytical balance repeatability run #{rep}",
            )
        )
        step += 1

    return SyntheticScenario(
        id="high_interval_class_i_analytical",
        scenario_number=5,
        title="Special Accuracy Class I Analytical Balance (n = 120,000 divisions)",
        short_title="5. Class I Analytical (PASS)",
        category="SPECIAL_PRECISION",
        description=(
            "Ultra-high precision laboratory analytical balance (120 g x 1 mg, d = 0.1 mg) conforming to "
            "OIML R 76-1 Special Accuracy Class I requirements. Tests the system with 120,000 scale intervals "
            "and sub-milligram changeover weights, demonstrating 6-decimal-place Decimal precision."
        ),
        highlight_aspect="Validates ultra-high resolution (n = 120,000 >= 50,000) with zero floating-point rounding errors.",
        technical_explanation=(
            "Verification interval e = 1 mg, actual interval d = 0.1 mg (e/d = 10). "
            "Evaluated through 50,000e (50 g) and 100,000e (100 g) statutory boundaries. "
            "All calculations utilize Python's Decimal class down to 0.000001 g, completely eliminating "
            "IEEE-754 binary floating point rounding inaccuracies."
        ),
        accuracy_class="CLASS_I",
        manufacturer="Shimadzu Metrology Systems",
        model_name="UniBloc Ultra-Micro Analytical Balance AUW-120D",
        serial_number="SHM-2026-MICRO-120K",
        max_capacity=120.0,
        min_capacity=0.01,
        e=0.001,
        d=0.0001,
        n=120000,
        unit="GRAM",
        verification_stage="INITIAL_TYPE_APPROVAL",
        expected_verdict="PASS",
        observations_count=len(weighing) + len(eccentricity),
        weighing_observations=weighing,
        eccentricity_observations=eccentricity,
        audit_notes=[
            "Special Accuracy Class I certified under OIML R 76-1 Table 3.",
            "Tested with Class E2 primary standard weights traceable to NPL National Prototype.",
            "Draft shield closed and environmental vibration dampening verified.",
        ],
    )


# ============================================================================
# Master Registry & Dispatcher
# ============================================================================


_SCENARIOS_CACHE: dict[str, SyntheticScenario] | None = None


def get_all_scenarios() -> dict[str, SyntheticScenario]:
    """Retrieve all 5 pre-compiled synthetic edge-case scenarios."""
    global _SCENARIOS_CACHE
    if _SCENARIOS_CACHE is None:
        s1 = generate_scenario_1()
        s2 = generate_scenario_2()
        s3 = generate_scenario_3()
        s4 = generate_scenario_4()
        s5 = generate_scenario_5()
        _SCENARIOS_CACHE = {
            s1.id: s1,
            s2.id: s2,
            s3.id: s3,
            s4.id: s4,
            s5.id: s5,
        }
    return _SCENARIOS_CACHE


def get_scenario_by_id(scenario_id: str) -> SyntheticScenario | None:
    """Fetch a specific scenario by its unique identifier."""
    scenarios = get_all_scenarios()
    return scenarios.get(scenario_id)
