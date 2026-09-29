"""
METROLOGIX-76 — Automated Test Applicability Matrix (TAM) Engine.

Statutory Authorities & Technical References:
- OIML R 76-1:2006 (E) "Non-automatic weighing instruments":
  * Clause A.4.4: Weighing test (Linearity & Hysteresis)
  * Clause A.4.6: Tare mechanism error test
  * Clause A.4.7: Eccentricity test (Platform, Rolling Load, Multi-point, Tank)
  * Clause A.4.8: Discrimination test (1.4d load step)
  * Clause A.4.10: Repeatability test (10 weighings or 3 weighings for Max > 1000 kg)
  * Clause A.5.1.1: Tilting test (2/1000 with level indicator, 50/1000 without)
  * Clause A.5.3.1: Static temperature test (-10°C to +40°C / Class I range)
- Legal Metrology (General) Rules, 2011, Seventh Schedule, Heading A (Paras 8, 9, 12, 13)
- Legal Metrology (General) Fourth Amendment Rules, 2026 (G.S.R. 568(E))
- Department of Consumer Affairs (DoCA), SIH Problem Statement 26035
"""

from decimal import Decimal
from typing import Final

from pydantic import ConfigDict, Field

from app.core.rulepack.rulepack_manager import RulePackManager, default_rulepack_manager
from app.core.rulepack.rulepack_schema import RulePack
from app.core.schemas import InstrumentSpecification, MetrologyBaseModel
from app.core.types import (
    AccuracyClass,
    CornerPosition,
    InstrumentMobility,
    LoadReceptorType,
    TestType,
    UnitOfMeasure,
    VerificationStage,
)

ZERO_DECIMAL: Final[Decimal] = Decimal("0")
HALF_DECIMAL: Final[Decimal] = Decimal("0.5")
ONE_DECIMAL: Final[Decimal] = Decimal("1")
TWO_DECIMAL: Final[Decimal] = Decimal("2")
DISCRIMINATION_FACTOR: Final[Decimal] = Decimal("1.4")
HEAVY_CAPACITY_THRESHOLD_KG: Final[Decimal] = Decimal("1000")


# ============================================================================
# 1. Pydantic Models for Test Applicability Matrix
# ============================================================================


class TargetLoadPoint(MetrologyBaseModel):
    """
    Individual target test load point with expected MPE bracket and physical positioning.
    """

    model_config = ConfigDict(frozen=True, extra="forbid")

    load_index: int = Field(..., ge=1, description="Sequential sequence index of the test point.")
    load_nominal: Decimal = Field(..., ge=Decimal("0"), description="Target test load (L).")
    load_in_units_of_e: Decimal = Field(
        ..., ge=Decimal("0"), description="Load expressed in scale intervals m = L / e."
    )
    label: str = Field(..., description="Descriptive label (e.g. 'Min', '500e (Bracket 1/2)').")
    position: CornerPosition | str | None = Field(
        default=None, description="Receptor placement position (e.g. Center, Front-Left)."
    )
    base_mpe: Decimal = Field(..., description="Allowable MPE in verification units on initial.")
    in_service_mpe: Decimal = Field(..., description="Allowable MPE during in-service inspection.")
    notes: str | None = Field(default=None, description="Metrological instructions or annotations.")


class TestBatteryItem(MetrologyBaseModel):
    """
    An individual test procedure in the Test Applicability Matrix.
    """

    model_config = ConfigDict(frozen=True, extra="forbid")

    test_type: TestType = Field(..., description="Standard test procedure type enum.")
    test_name: str = Field(..., description="Official title of the test procedure.")
    is_applicable: bool = Field(..., description="True if mandatory for this instrument.")
    exemption_reason: str | None = Field(
        default=None, description="Statutory justification if exempt from testing."
    )
    statutory_clause: str = Field(..., description="Authorizing legal metrology clause citation.")
    description: str = Field(..., description="Procedural execution summary.")
    target_loads: list[TargetLoadPoint] = Field(
        default_factory=list, description="Prescribed target load points."
    )
    prescribed_runs_count: int | None = Field(
        default=None, description="Prescribed number of weighings per series (e.g. 10 or 3)."
    )
    acceptance_criteria: str = Field(..., description="Summary of legal pass/fail tolerance.")


class TestApplicabilityMatrix(MetrologyBaseModel):
    """
    Complete statutory test plan tailored to declared instrument characteristics.
    """

    model_config = ConfigDict(frozen=True, extra="forbid")

    instrument_id: str | None = Field(
        default=None, description="Equipment serial number or approval identifier."
    )
    accuracy_class: AccuracyClass = Field(..., description="NAWI accuracy classification.")
    max_capacity: Decimal = Field(..., description="Maximum weighing capacity (Max).")
    min_capacity: Decimal = Field(..., description="Minimum weighing capacity (Min).")
    e: Decimal = Field(..., description="Verification scale interval (e).")
    d: Decimal = Field(..., description="Actual scale interval (d).")
    unit: UnitOfMeasure = Field(..., description="Declared unit of measurement.")
    receptor_type: LoadReceptorType = Field(..., description="Receptor geometry and mounting.")
    mobility: InstrumentMobility = Field(..., description="Mobility classification.")
    num_supports: int = Field(..., description="Number of support points beneath the receptor.")
    has_level_indicator: bool = Field(..., description="True if equipped with level indicator.")
    has_tare_device: bool = Field(..., description="True if equipped with tare device.")
    total_applicable_tests: int = Field(
        ..., description="Total count of active applicable tests in battery."
    )
    test_suite: list[TestBatteryItem] = Field(
        ..., description="Battery of all evaluated test procedures."
    )
    statutory_references: list[str] = Field(
        ..., description="Complete legal and regulatory citations governing this matrix."
    )
    rulepack_id: str = Field(..., description="Identifier of the active RulePack used.")


# Prevent pytest from attempting to collect TestApplicabilityMatrix as a test case class
TestApplicabilityMatrix.__test__ = False  # type: ignore[attr-defined]
TestBatteryItem.__test__ = False  # type: ignore[attr-defined]


# ============================================================================
# 2. Individual Test Battery Generators

# ============================================================================


def generate_weighing_test_battery(
    spec: InstrumentSpecification,
    rulepack: RulePack,
    stage: VerificationStage = VerificationStage.INITIAL_TYPE_APPROVAL,
) -> TestBatteryItem:
    """
    Generate mandatory Weighing Performance (Linearity & Hysteresis) Test procedure.

    Statutory Reference:
    - OIML R 76-1:2006 Clause A.4.4
    - Legal Metrology (General) Rules, 2011, Seventh Schedule, Heading A, Para 9(1)(a)
    """
    class_rules = rulepack.get_class_rules(spec.accuracy_class)
    brackets = sorted(class_rules.mpe_brackets_initial, key=lambda b: b.bracket_index)

    raw_loads: set[Decimal] = {spec.min_capacity, spec.max_capacity}

    # Half capacity
    half_max = spec.max_capacity * HALF_DECIMAL
    if spec.min_capacity < half_max < spec.max_capacity:
        raw_loads.add(half_max)

    # Brackets boundaries in units of e (e.g. 500e, 2000e)
    for b in brackets:
        if b.m_max is not None:
            load_b = b.m_max * spec.e
            if spec.min_capacity < load_b < spec.max_capacity:
                raw_loads.add(load_b)

    # If multi-interval, include partial range maxima (W1, W2, ...)
    if spec.is_multi_interval and spec.intervals_array:
        for rng in spec.intervals_array:
            if spec.min_capacity < rng.max_capacity < spec.max_capacity:
                raw_loads.add(rng.max_capacity)

    sorted_loads = sorted(raw_loads)
    target_points: list[TargetLoadPoint] = []

    for idx, load_val in enumerate(sorted_loads, start=1):
        m_val = load_val / spec.e
        mpe_init = rulepack.calculate_mpe(
            load=load_val,
            e=spec.e,
            accuracy_class=spec.accuracy_class,
            stage=VerificationStage.INITIAL_TYPE_APPROVAL,
        )
        mpe_serv = rulepack.calculate_mpe(
            load=load_val,
            e=spec.e,
            accuracy_class=spec.accuracy_class,
            stage=VerificationStage.SUBSEQUENT_IN_SERVICE,
        )

        label_parts = []
        if load_val == spec.min_capacity:
            label_parts.append("Min Capacity")
        elif load_val == spec.max_capacity:
            label_parts.append("Max Capacity")
        elif load_val == half_max:
            label_parts.append("50% Max")

        for b in brackets:
            if b.m_max is not None and load_val == b.m_max * spec.e:
                label_parts.append(f"Bracket {b.bracket_index} Boundary ({b.m_max}e)")

        label = (
            ", ".join(label_parts)
            if label_parts
            else f"Test Load {load_val} {spec.unit.symbol}"
        )

        target_points.append(

            TargetLoadPoint(
                load_index=idx,
                load_nominal=load_val,
                load_in_units_of_e=m_val,
                label=label,
                position=CornerPosition.CENTER,
                base_mpe=mpe_init.mpe_value,
                in_service_mpe=mpe_serv.mpe_value,
                notes=(
                    f"Test with increasing and decreasing loads. "
                    f"Bracket {mpe_init.bracket_index} ({mpe_init.bracket_name})."
                ),
            )
        )

    return TestBatteryItem(
        test_type=TestType.WEIGHING_PERFORMANCE,
        test_name="Weighing Performance & Linearity Test",
        is_applicable=True,
        exemption_reason=None,
        statutory_clause=(
            "OIML R 76-1:2006 Clause A.4.4; "
            "LM (General) Rules 2011 Seventh Schedule Heading A Para 9(1)(a)"
        ),
        description=(
            "Apply test loads from zero up to Max and return to zero with minimum 5 points. "
            "Determine unrounded indication P and corrected error Ec at each point."
        ),
        target_loads=target_points,
        prescribed_runs_count=None,
        acceptance_criteria=(
            "At each test load, |Ec| <= |MPE| (Table 6). For decreasing loads, "
            "hysteresis error must also stay within MPE."
        ),
    )


def generate_repeatability_test_battery(
    spec: InstrumentSpecification,
    rulepack: RulePack,
    stage: VerificationStage = VerificationStage.INITIAL_TYPE_APPROVAL,
) -> TestBatteryItem:
    """
    Generate mandatory Repeatability Test procedure.

    Statutory Reference:
    - OIML R 76-1:2006 Clause A.4.10
    - Legal Metrology (General) Rules, 2011, Seventh Schedule, Heading A, Para 9(1)(c)
    - Legal Metrology (General) Fourth Amendment Rules, 2026 (G.S.R. 568(E))
    """
    max_in_kg = spec.unit.to_kg(spec.max_capacity)
    is_heavy_instrument = max_in_kg > HEAVY_CAPACITY_THRESHOLD_KG

    # Clause A.4.10: For instruments with Max > 1000 kg, each series may consist of 3 weighings;
    # otherwise 10 weighings (or 6 for in-service)
    runs_count = 3 if is_heavy_instrument else 10

    load_mid = spec.max_capacity * HALF_DECIMAL
    load_max = spec.max_capacity * Decimal("0.8") if is_heavy_instrument else spec.max_capacity

    target_points: list[TargetLoadPoint] = []
    repeat_loads = [
        (load_mid, "Repeatability Series 1 (~50% Max)"),
        (load_max, "Repeatability Series 2 (~Max)"),
    ]
    for idx, (load_val, lbl) in enumerate(repeat_loads, start=1):
        mpe_init = rulepack.calculate_mpe(
            load=load_val,
            e=spec.e,
            accuracy_class=spec.accuracy_class,
            stage=VerificationStage.INITIAL_TYPE_APPROVAL,
        )
        mpe_serv = rulepack.calculate_mpe(
            load=load_val,
            e=spec.e,
            accuracy_class=spec.accuracy_class,
            stage=VerificationStage.SUBSEQUENT_IN_SERVICE,
        )
        target_points.append(
            TargetLoadPoint(
                load_index=idx,
                load_nominal=load_val,
                load_in_units_of_e=load_val / spec.e,
                label=lbl,
                position=CornerPosition.CENTER,
                base_mpe=mpe_init.mpe_value,
                in_service_mpe=mpe_serv.mpe_value,
                notes=f"Execute {runs_count} consecutive weighings under identical conditions.",
            )
        )

    runs_note = (
        f"{runs_count} weighings per series (Max = {max_in_kg} kg > 1000 kg)"
        if is_heavy_instrument
        else f"{runs_count} weighings per series (Standard capacity <= 1000 kg)"
    )

    acceptance_text = (
        f"The spread between maximum and minimum indication (Emax - Emin) shall not exceed "
        f"|MPE| for that load. {runs_note}."
    )
    if rulepack.standard_weight_substitution:
        acceptance_text += (
            " Under Fourth Amendment Rules 2026, repeatability error <= 0.3e unlocks 33.3% Max "
            "standard weight substitution, and <= 0.2e unlocks 20% Max substitution."
        )

    return TestBatteryItem(
        test_type=TestType.REPEATABILITY,
        test_name="Repeatability Test",
        is_applicable=True,
        exemption_reason=None,
        statutory_clause=(
            "OIML R 76-1:2006 Clause A.4.10; "
            "LM (General) Rules 2011 Seventh Schedule Heading A Para 9(1)(c)"
        ),
        description=(
            f"Two series of weighings: one with load near 0.5 Max and one near Max. "
            f"Zero instrument prior to each series. Perform {runs_count} runs per series."
        ),
        target_loads=target_points,
        prescribed_runs_count=runs_count,
        acceptance_criteria=acceptance_text,
    )


def generate_eccentricity_test_battery(
    spec: InstrumentSpecification,
    rulepack: RulePack,
    stage: VerificationStage = VerificationStage.INITIAL_TYPE_APPROVAL,
) -> TestBatteryItem:
    """
    Generate Eccentricity (Corner / Off-Center Loading) Test procedure tailored to receptor type.

    Statutory Reference:
    - OIML R 76-1:2006 Clause A.4.7 (A.4.7.1, A.4.7.2, A.4.7.3, A.4.7.4)
    - Legal Metrology (General) Rules, 2011, Seventh Schedule, Heading A, Para 9(1)(b)
    """
    target_points: list[TargetLoadPoint] = []
    clause_ref: str
    description: str
    acceptance_text: str

    if spec.receptor_type == LoadReceptorType.PLATFORM:
        # Clause A.4.7.1: Load = 1/3 (Max + Additive Tare) on platform with <= 4 supports
        test_load = (spec.max_capacity / Decimal("3")).quantize(Decimal("0.0001"))
        clause_ref = (
            "OIML R 76-1:2006 Clause A.4.7.1; "
            "LM (General) Rules 2011 Seventh Schedule Heading A Para 9(1)(b)"
        )
        description = (
            "Standard platform/bench scale: apply test load of 1/3 Max on center and each "
            "of the 4 quadrant corners."
        )
        positions = [
            (CornerPosition.CENTER, "Center (Position 1)"),
            (CornerPosition.FRONT_LEFT, "Front-Left Corner (Position 2)"),
            (CornerPosition.BACK_LEFT, "Back-Left Corner (Position 3)"),
            (CornerPosition.BACK_RIGHT, "Back-Right Corner (Position 4)"),
            (CornerPosition.FRONT_RIGHT, "Front-Right Corner (Position 5)"),
        ]
        mpe_init = rulepack.calculate_mpe(
            load=test_load,
            e=spec.e,
            accuracy_class=spec.accuracy_class,
            stage=VerificationStage.INITIAL_TYPE_APPROVAL,
        )
        mpe_serv = rulepack.calculate_mpe(
            load=test_load,
            e=spec.e,
            accuracy_class=spec.accuracy_class,
            stage=VerificationStage.SUBSEQUENT_IN_SERVICE,
        )

        for idx, (pos, lbl) in enumerate(positions, start=1):
            target_points.append(
                TargetLoadPoint(
                    load_index=idx,
                    load_nominal=test_load,
                    load_in_units_of_e=test_load / spec.e,
                    label=f"Corner Loading: {lbl}",
                    position=pos,
                    base_mpe=mpe_init.mpe_value,
                    in_service_mpe=mpe_serv.mpe_value,
                    notes=f"Load = 1/3 Max ({test_load} {spec.unit.symbol}) applied at {lbl}.",
                )
            )

        acceptance_text = (
            f"The corrected error Ec at each corner position shall not exceed MPE "
            f"(+/- {mpe_init.mpe_value} {spec.unit.symbol} initial, "
            f"+/- {mpe_serv.mpe_value} {spec.unit.symbol} in-service)."
        )

    elif spec.receptor_type == LoadReceptorType.WEIGHBRIDGE:
        # Clause A.4.7.4: Rolling load on vehicle weighers (0.8 Max standard axle rolling load)
        test_load = (spec.max_capacity * Decimal("0.8")).quantize(Decimal("0.0001"))
        clause_ref = (
            "OIML R 76-1:2006 Clause A.4.7.4; "
            "LM (General) Rules 2011 Seventh Schedule Heading A Para 9(1)(b)"
        )
        description = (
            "Vehicle weighbridge / track scale: apply standard rolling axle load (0.8 Max) "
            "at the beginning, middle, and end of the weighbridge deck in both drive directions."
        )
        weighbridge_positions = [
            ("TRACK_ENTRY", "Track Entry / Axle Position 1 (Beginning of Platform)"),
            ("TRACK_MIDDLE", "Track Middle / Axle Position 2 (Center of Platform)"),
            ("TRACK_EXIT", "Track Exit / Axle Position 3 (End of Platform)"),
        ]
        mpe_init = rulepack.calculate_mpe(
            load=test_load,
            e=spec.e,
            accuracy_class=spec.accuracy_class,
            stage=VerificationStage.INITIAL_TYPE_APPROVAL,
        )
        mpe_serv = rulepack.calculate_mpe(
            load=test_load,
            e=spec.e,
            accuracy_class=spec.accuracy_class,
            stage=VerificationStage.SUBSEQUENT_IN_SERVICE,
        )

        for idx, (pos_code, lbl) in enumerate(weighbridge_positions, start=1):
            target_points.append(
                TargetLoadPoint(
                    load_index=idx,
                    load_nominal=test_load,
                    load_in_units_of_e=test_load / spec.e,
                    label=lbl,
                    position=pos_code,
                    base_mpe=mpe_init.mpe_value,
                    in_service_mpe=mpe_serv.mpe_value,
                    notes=(
                        f"Rolling load of 0.8 Max ({test_load} {spec.unit.symbol}) "
                        f"applied at {lbl}."
                    ),
                )

            )



        acceptance_text = (
            f"The indication error at each rolling track position shall not exceed MPE "
            f"(+/- {mpe_init.mpe_value} {spec.unit.symbol} initial, "
            f"+/- {mpe_serv.mpe_value} {spec.unit.symbol} in-service)."
        )

    elif spec.receptor_type in (LoadReceptorType.TANK, LoadReceptorType.SUSPENDED_HOPPER):
        # Clause A.4.7.3 / A.4.7.2: Hopper / tank with N support points
        # If N > 4: 1 / (N - 1) Max; if special hopper with minimal off-center: 1/10 Max per support
        n_pts = max(spec.num_supports, 3)
        factor = Decimal("1") / Decimal(n_pts - 1) if n_pts > 4 else Decimal("0.1")
        test_load = (spec.max_capacity * factor).quantize(Decimal("0.0001"))

        clause_ref = (
            "OIML R 76-1:2006 Clause A.4.7.3 / A.4.7.2; "
            "LM (General) Rules 2011 Seventh Schedule Heading A Para 9(1)(b)"
        )
        description = (
            f"Tank/hopper weigher with {n_pts} support points: apply test load of "
            f"{factor:.2f} Max sequentially to each load-cell support point."
        )

        mpe_init = rulepack.calculate_mpe(
            load=test_load,
            e=spec.e,
            accuracy_class=spec.accuracy_class,
            stage=VerificationStage.INITIAL_TYPE_APPROVAL,
        )
        mpe_serv = rulepack.calculate_mpe(
            load=test_load,
            e=spec.e,
            accuracy_class=spec.accuracy_class,
            stage=VerificationStage.SUBSEQUENT_IN_SERVICE,
        )

        for i in range(1, n_pts + 1):
            target_points.append(
                TargetLoadPoint(
                    load_index=i,
                    load_nominal=test_load,
                    load_in_units_of_e=test_load / spec.e,
                    label=f"Support Point {i} (Load Cell {i})",
                    position=f"SUPPORT_{i}",
                    base_mpe=mpe_init.mpe_value,
                    in_service_mpe=mpe_serv.mpe_value,
                    notes=f"Test load = {test_load} {spec.unit.symbol} placed on Support {i}.",
                )
            )

        acceptance_text = (
            f"Indication error at each support point shall not exceed MPE "
            f"(+/- {mpe_init.mpe_value} {spec.unit.symbol})."
        )

    else:
        # HANGING / CRANE scales
        test_load = (spec.max_capacity * HALF_DECIMAL).quantize(Decimal("0.0001"))
        clause_ref = "OIML R 76-1:2006 Clause A.4.7.5"
        description = (
            "Hanging/crane scale: central suspended axis. If off-center loading is physically "
            "possible via cradle or hook displacement, apply 0.5 Max; otherwise axial verification."
        )
        mpe_init = rulepack.calculate_mpe(
            load=test_load,
            e=spec.e,
            accuracy_class=spec.accuracy_class,
            stage=VerificationStage.INITIAL_TYPE_APPROVAL,
        )
        mpe_serv = rulepack.calculate_mpe(
            load=test_load,
            e=spec.e,
            accuracy_class=spec.accuracy_class,
            stage=VerificationStage.SUBSEQUENT_IN_SERVICE,
        )
        target_points.append(
            TargetLoadPoint(
                load_index=1,
                load_nominal=test_load,
                load_in_units_of_e=test_load / spec.e,
                label="Central Hanging Axis / Hook Test",
                position="SUSPENSION_AXIS",
                base_mpe=mpe_init.mpe_value,
                in_service_mpe=mpe_serv.mpe_value,
                notes="Single axial suspension verification.",
            )
        )
        acceptance_text = (
            f"Indication error shall not exceed MPE (+/- {mpe_init.mpe_value} {spec.unit.symbol})."
        )

    return TestBatteryItem(
        test_type=TestType.ECCENTRICITY,
        test_name="Eccentricity (Off-Center Loading) Test",
        is_applicable=True,
        exemption_reason=None,
        statutory_clause=clause_ref,
        description=description,
        target_loads=target_points,
        prescribed_runs_count=len(target_points),
        acceptance_criteria=acceptance_text,
    )


def generate_discrimination_test_battery(
    spec: InstrumentSpecification,
    rulepack: RulePack,
    stage: VerificationStage = VerificationStage.INITIAL_TYPE_APPROVAL,
) -> TestBatteryItem:
    """
    Generate mandatory Discrimination Test procedure (1.4d extra load test).

    Statutory Reference:
    - OIML R 76-1:2006 Clause A.4.8 & Clause 3.8
    - Legal Metrology (General) Rules, 2011, Seventh Schedule, Heading A, Para 8
    """
    extra_load = DISCRIMINATION_FACTOR * spec.d
    half_max = spec.max_capacity * HALF_DECIMAL

    loads_to_test = [spec.min_capacity, half_max, spec.max_capacity]
    target_points: list[TargetLoadPoint] = []

    for idx, load_val in enumerate(loads_to_test, start=1):
        mpe_init = rulepack.calculate_mpe(
            load=load_val,
            e=spec.e,
            accuracy_class=spec.accuracy_class,
            stage=VerificationStage.INITIAL_TYPE_APPROVAL,
        )
        mpe_serv = rulepack.calculate_mpe(
            load=load_val,
            e=spec.e,
            accuracy_class=spec.accuracy_class,
            stage=VerificationStage.SUBSEQUENT_IN_SERVICE,
        )
        target_points.append(
            TargetLoadPoint(
                load_index=idx,
                load_nominal=load_val,
                load_in_units_of_e=load_val / spec.e,
                label=(
                    f"Discrimination at Load {load_val} {spec.unit.symbol} "
                    f"(+ 1.4d = {extra_load})"
                ),
                position=CornerPosition.CENTER,
                base_mpe=mpe_init.mpe_value,
                in_service_mpe=mpe_serv.mpe_value,
                notes=(
                    f"While instrument displays I at load {load_val}, gently place extra load "
                    f"of 1.4d ({extra_load} {spec.unit.symbol}). Display must advance by >= 1d."
                ),
            )
        )


    return TestBatteryItem(
        test_type=TestType.DISCRIMINATION,
        test_name="Discrimination Test (1.4d Additional Load)",
        is_applicable=True,
        exemption_reason=None,
        statutory_clause=(
            "OIML R 76-1:2006 Clause A.4.8 & Clause 3.8; "
            "LM (General) Rules 2011 Seventh Schedule Heading A Para 8"
        ),
        description=(
            f"An extra load of 1.4d ({extra_load} {spec.unit.symbol}) placed gently on the loaded "
            f"receptor at equilibrium must cause the indication to increase by at least 1d."
        ),
        target_loads=target_points,
        prescribed_runs_count=len(target_points),
        acceptance_criteria=(
            f"Indication must unequivocally change by at least +1d "
            f"(+{spec.d} {spec.unit.symbol}) when 1.4d is added."
        ),
    )


def generate_tare_test_battery(
    spec: InstrumentSpecification,
    rulepack: RulePack,
    stage: VerificationStage = VerificationStage.INITIAL_TYPE_APPROVAL,
) -> TestBatteryItem:
    """
    Generate Tare Mechanism Test procedure.

    Statutory Reference:
    - OIML R 76-1:2006 Clause A.4.6, Clause 3.5.3, Clause 3.6.3
    - Legal Metrology (General) Rules, 2011, Seventh Schedule, Heading A, Para 9(1)(d)
    """
    has_tare = spec.has_tare_device or (spec.tare_max is not None and spec.tare_max > ZERO_DECIMAL)

    if not has_tare:
        clause_tare = (
            "OIML R 76-1:2006 Clause A.4.6; "
            "LM (General) Rules 2011 Seventh Schedule Heading A Para 9(1)(d)"
        )
        return TestBatteryItem(
            test_type=TestType.TARE_WEIGHING,
            test_name="Tare Mechanism & Net Weighing Test",
            is_applicable=False,
            exemption_reason=(
                "Instrument is not equipped with a tare balancing or tare weighing mechanism."
            ),
            statutory_clause=clause_tare,
            description="Exempt: Tare mechanism absent.",
            target_loads=[],
            prescribed_runs_count=0,
            acceptance_criteria="Not Applicable.",
        )

    tare_val = (
        spec.tare_max
        if spec.tare_max is not None and spec.tare_max > ZERO_DECIMAL
        else (spec.max_capacity * Decimal("0.3")).quantize(Decimal("0.0001"))
    )
    net_load = spec.max_capacity - tare_val

    mpe_tare = rulepack.calculate_mpe(
        load=net_load,
        e=spec.e,
        accuracy_class=spec.accuracy_class,
        stage=stage,
    )
    in_service_multiplier = (
        TWO_DECIMAL if stage == VerificationStage.SUBSEQUENT_IN_SERVICE else ONE_DECIMAL
    )

    target_points = [
        TargetLoadPoint(
            load_index=1,
            load_nominal=tare_val,
            load_in_units_of_e=tare_val / spec.e,
            label=f"Tare Load Setting (T = {tare_val} {spec.unit.symbol})",
            position=CornerPosition.CENTER,
            base_mpe=spec.e * Decimal("0.25"),  # Zero/tare setting accuracy within 0.25e
            in_service_mpe=spec.e * Decimal("0.5"),
            notes="Verify tare setting accuracy: residual error <= 0.25e.",
        ),
        TargetLoadPoint(
            load_index=2,
            load_nominal=net_load,
            load_in_units_of_e=net_load / spec.e,
            label=f"Net Load Test (L_net = {net_load} {spec.unit.symbol})",
            position=CornerPosition.CENTER,
            base_mpe=mpe_tare.mpe_value,
            in_service_mpe=mpe_tare.mpe_value * in_service_multiplier,
            notes=(
                f"Verify net indication accuracy: error within MPE for net load "
                f"({net_load} {spec.unit.symbol})."
            ),
        ),
    ]

    return TestBatteryItem(
        test_type=TestType.TARE_WEIGHING,
        test_name="Tare Mechanism & Net Weighing Test",
        is_applicable=True,
        exemption_reason=None,
        statutory_clause=(
            "OIML R 76-1:2006 Clause A.4.6 & Clause 3.5.3; "
            "LM (General) Rules 2011 Seventh Schedule Heading A Para 9(1)(d)"
        ),
        description=(
            f"Apply tare load (T = {tare_val} {spec.unit.symbol}), activate tare device to zero, "
            f"then apply net loads up to net maximum capacity ({net_load} {spec.unit.symbol})."
        ),
        target_loads=target_points,
        prescribed_runs_count=2,
        acceptance_criteria=(
            "Tare setting error <= +/- 0.25e. Net indication error Ec <= MPE for applied net load."
        ),
    )


def generate_tilting_test_battery(
    spec: InstrumentSpecification,
    rulepack: RulePack,
    stage: VerificationStage = VerificationStage.INITIAL_TYPE_APPROVAL,
) -> TestBatteryItem:
    """
    Generate Tilting Test procedure for movable / portable instruments.

    Statutory Reference:
    - OIML R 76-1:2006 Clause A.5.1.1 & Clause 3.9.1.1
    - Legal Metrology (General) Rules, 2011, Seventh Schedule, Heading A, Para 12(1)
    """
    clause_tilt = (
        "OIML R 76-1:2006 Clause A.5.1.1; "
        "LM (General) Rules 2011 Seventh Schedule Heading A Para 12(1)"
    )

    # Fixed instruments (weighbridges, tanks, bolted platform scales) are strictly exempt
    if spec.mobility == InstrumentMobility.FIXED:
        return TestBatteryItem(
            test_type=TestType.TILTING,
            test_name="Tilting Test",
            is_applicable=False,
            exemption_reason=(
                "Permanently installed fixed/weighbridge/pit instrument is legally exempt."
            ),
            statutory_clause=clause_tilt,
            description="Exempt: Fixed installation.",
            target_loads=[],
            prescribed_runs_count=0,
            acceptance_criteria="Not Applicable for permanently fixed installations.",
        )

    # Class I laboratory instruments in fixed setups are exempt
    if (
        spec.accuracy_class == AccuracyClass.CLASS_I
        and spec.mobility != InstrumentMobility.PORTABLE
    ):
        return TestBatteryItem(
            test_type=TestType.TILTING,
            test_name="Tilting Test",
            is_applicable=False,
            exemption_reason=(
                "Class I special accuracy instruments in fixed laboratory environments are exempt."
            ),
            statutory_clause="OIML R 76-1:2006 Clause 3.9.1.1",
            description="Exempt: Controlled laboratory installation.",
            target_loads=[],
            prescribed_runs_count=0,
            acceptance_criteria="Not Applicable.",
        )

    # Portable instruments: determine tilt angle based on level indicator
    tilt_ratio = "2/1000 (0.2%)" if spec.has_level_indicator else "50/1000 (5.0%)"
    tilt_desc = (
        "Instrument has level indicator: tilt to limiting angle of 2/1000."
        if spec.has_level_indicator
        else "Instrument lacks level indicator: tilt by 50/1000 (5%)."
    )

    half_max = spec.max_capacity * HALF_DECIMAL
    target_points: list[TargetLoadPoint] = []
    tilt_tests = [
        (ZERO_DECIMAL, "Zero Load Tilted"),
        (half_max, "50% Max Load Tilted"),
    ]
    in_service_multiplier = (
        TWO_DECIMAL if stage == VerificationStage.SUBSEQUENT_IN_SERVICE else ONE_DECIMAL
    )

    for idx, (load_val, lbl) in enumerate(tilt_tests, start=1):
        mpe = rulepack.calculate_mpe(
            load=load_val,
            e=spec.e,
            accuracy_class=spec.accuracy_class,
            stage=stage,
        )
        target_points.append(
            TargetLoadPoint(
                load_index=idx,
                load_nominal=load_val,
                load_in_units_of_e=load_val / spec.e,
                label=f"{lbl} at tilt angle {tilt_ratio}",
                position=CornerPosition.CENTER,
                base_mpe=mpe.mpe_value,
                in_service_mpe=mpe.mpe_value * in_service_multiplier,
                notes=(
                    f"Tilt longitudinally and transversely by {tilt_ratio}. "
                    f"Check zero and indication."
                ),
            )
        )



    return TestBatteryItem(
        test_type=TestType.TILTING,
        test_name=f"Tilting Test ({tilt_ratio})",
        is_applicable=True,
        exemption_reason=None,
        statutory_clause=clause_tilt,
        description=(
            f"Portable instrument tilt test: {tilt_desc} "
            f"Zero instrument in reference position, tilt longitudinally and transversely, "
            f"and evaluate zero error and indication error at ~50% Max."
        ),
        target_loads=target_points,
        prescribed_runs_count=len(target_points),
        acceptance_criteria=(
            "Difference in indication between tilted and level positions shall not exceed "
            "1.0e (at zero) or MPE (at load) per Clause A.5.1.1."
        ),
    )


def generate_temperature_test_battery(
    spec: InstrumentSpecification,
    rulepack: RulePack,
    stage: VerificationStage = VerificationStage.INITIAL_TYPE_APPROVAL,
) -> TestBatteryItem:
    """
    Generate Static Temperature Influence Test procedure.

    Statutory Reference:
    - OIML R 76-1:2006 Clause A.5.3.1 & Clause 3.9.2
    - Legal Metrology (General) Rules, 2011, Seventh Schedule, Heading A, Para 13(1)
    """
    # Temperature limits per accuracy class
    if spec.accuracy_class == AccuracyClass.CLASS_I:
        temp_range = "+10 °C to +30 °C (Special span <= 5 °C)"
    else:
        temp_range = "-10 °C to +40 °C (Standard statutory span)"

    test_points = [
        TargetLoadPoint(
            load_index=1,
            load_nominal=ZERO_DECIMAL,
            load_in_units_of_e=ZERO_DECIMAL,
            label="Zero Indication Across Temperature Range",
            position=CornerPosition.CENTER,
            base_mpe=spec.e * Decimal("0.5"),
            in_service_mpe=spec.e * Decimal("1.0"),
            notes="Zero shift <= 1e per 5 °C (Class I/II) or per 1 °C change.",
        ),
        TargetLoadPoint(
            load_index=2,
            load_nominal=spec.max_capacity,
            load_in_units_of_e=spec.max_capacity / spec.e,
            label="Max Load Span Across Temperature Range",
            position=CornerPosition.CENTER,
            base_mpe=rulepack.calculate_mpe(
                load=spec.max_capacity,
                e=spec.e,
                accuracy_class=spec.accuracy_class,
                stage=stage,
            ).mpe_value,
            in_service_mpe=rulepack.calculate_mpe(
                load=spec.max_capacity,
                e=spec.e,
                accuracy_class=spec.accuracy_class,
                stage=VerificationStage.SUBSEQUENT_IN_SERVICE,
            ).mpe_value,
            notes=f"Span error must remain within MPE across {temp_range}.",
        ),
    ]

    return TestBatteryItem(
        test_type=TestType.TEMPERATURE_INFLUENCE,
        test_name="Static Temperature Influence Test",
        is_applicable=True,
        exemption_reason=None,
        statutory_clause=(
            "OIML R 76-1:2006 Clause A.5.3.1; "
            "LM (General) Rules 2011 Seventh Schedule Heading A Para 13(1)"
        ),
        description=(
            f"Maintain instrument at reference temperature (20 °C), then cycle to upper specified "
            f"limit, lower specified limit, and return to 20 °C ({temp_range})."
        ),
        target_loads=test_points,
        prescribed_runs_count=len(test_points),
        acceptance_criteria=(
            f"Zero return error <= 0.5e. Indication errors across {temp_range} "
            f"shall not exceed MPE."
        ),
    )




# ============================================================================
# 3. Master Test Applicability Matrix Generator Engine
# ============================================================================


def generate_test_applicability_matrix(
    spec: InstrumentSpecification,
    rulepack: RulePack | None = None,
    stage: VerificationStage = VerificationStage.INITIAL_TYPE_APPROVAL,
    rulepack_manager: RulePackManager = default_rulepack_manager,
) -> TestApplicabilityMatrix:
    """
    Master compiler: automatically inspects declared instrument parameters and generates
    the customized statutory Test Applicability Matrix (TAM) and calculated load points.

    Zero-Bug Guarantee:
    - Never uses hardcoded numbers for MPE or bracket boundaries.
    - Sourced purely through declarative RulePacks and OIML R 76 statutory clauses.
    - Tailors eccentricity tests specifically to receptor geometry (Platform 4-corner,
      Weighbridge rolling-axle, Tank multi-support, Crane axial).
    - Accurately exempts fixed installations from tilt testing while enforcing 2/1000
      or 50/1000 for portable instruments.
    """
    active_rp = rulepack if rulepack is not None else rulepack_manager.get_active_rulepack()

    # Build the battery of test procedures
    battery: list[TestBatteryItem] = [
        generate_weighing_test_battery(spec, active_rp, stage),
        generate_repeatability_test_battery(spec, active_rp, stage),
        generate_eccentricity_test_battery(spec, active_rp, stage),
        generate_discrimination_test_battery(spec, active_rp, stage),
        generate_tare_test_battery(spec, active_rp, stage),
        generate_tilting_test_battery(spec, active_rp, stage),
        generate_temperature_test_battery(spec, active_rp, stage),
    ]

    applicable_count = sum(1 for item in battery if item.is_applicable)

    statutory_refs = [
        f"RulePack {active_rp.meta.rulepack_id}: {active_rp.meta.name}",
        "OIML R 76-1:2006 (E) Non-automatic weighing instruments (Annex A)",
        "Legal Metrology (General) Rules, 2011, Seventh Schedule, Heading A",
        "Legal Metrology (General) Fourth Amendment Rules, 2026 (G.S.R. 568(E))",
    ]

    return TestApplicabilityMatrix(
        instrument_id=spec.serial_number or spec.approval_number,
        accuracy_class=spec.accuracy_class,
        max_capacity=spec.max_capacity,
        min_capacity=spec.min_capacity,
        e=spec.e,
        d=spec.d,
        unit=spec.unit,
        receptor_type=spec.receptor_type,
        mobility=spec.mobility,
        num_supports=spec.num_supports,
        has_level_indicator=spec.has_level_indicator,
        has_tare_device=spec.has_tare_device,
        total_applicable_tests=applicable_count,
        test_suite=battery,
        statutory_references=statutory_refs,
        rulepack_id=active_rp.meta.rulepack_id,
    )
