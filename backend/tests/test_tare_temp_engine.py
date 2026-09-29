"""Test suite for METROLOGIX-76 Tare Mechanism & Temperature Span Drift Engines.

Statutory References:
- OIML R 76-1:2006 Clause 3.6.3 & Clause A.4.6: Tare setting accuracy.
- OIML R 76-1:2006 Clause 3.5.3.4: Net load errors evaluated against MPE calculated for net load.
- OIML R 76-1:2006 Clause 3.9.2.3 & Clause A.5.3: Temperature influence on zero and span.
- Legal Metrology (General) Rules, 2011, Seventh Schedule, Part I & Part II.

Verification Test Gate:
- Pytest validating tare setting compliance (<= 0.25e initial, <= 0.50e in-service).
- Pytest validating net load errors evaluated against Table 6 MPE for net load L_net.
- Pytest validating zero drift rate per 5 °C (<= 0.5e Class I, <= 1.0e Class II/III/IIII).
- Pytest validating chamber ramp rate (<= 5 °C/h) and thermal soak duration (>= 2.0 h).
- Pytest validating span error shifts and sensitivity temperature coefficient in ppm/°C.
- Pytest validating complete session aggregation with pass/marginal/fail verdicts.
"""

from __future__ import annotations

from decimal import Decimal

import pytest

from app.core.rulepack import default_rulepack_manager
from app.core.schemas import InstrumentSpecification, ObservationPoint
from app.core.tare_temp_engine import (
    DEFAULT_REFERENCE_TEMP_CELSIUS,
    MAX_TEMP_CHANGE_RATE_C_PER_HR,
    MIN_STABILIZATION_HOURS,
    EvaluatedNetLoadPoint,
    EvaluatedTareSetting,
    EvaluatedTemperaturePlateau,
    EvaluatedZeroDriftSegment,
    TareEvaluationResult,
    TemperatureEvaluationResult,
    calculate_tare_setting_mpe,
    calculate_zero_drift_limit,
    evaluate_net_load_point,
    evaluate_tare_session,
    evaluate_tare_setting,
    evaluate_temperature_plateau,
    evaluate_temperature_session,
    evaluate_zero_drift_segment,
)
from app.core.types import (
    AccuracyClass,
    ComplianceStatus,
    LoadReceptorType,
    UnitOfMeasure,
    VerificationStage,
)


@pytest.fixture
def class_iii_bench_scale() -> InstrumentSpecification:
    """Fixture for standard Class III retail/bench scale.

    Max = 15 kg, e = 5 g, d = 5 g, n = 3000.
    """
    return InstrumentSpecification(
        accuracy_class=AccuracyClass.CLASS_III,
        max_capacity=Decimal("15"),
        min_capacity=Decimal("0.100"),
        e=Decimal("0.005"),
        d=Decimal("0.005"),
        unit=UnitOfMeasure.KILOGRAM,
        receptor_type=LoadReceptorType.PLATFORM,
        num_supports=4,
    )


@pytest.fixture
def class_i_analytical_balance() -> InstrumentSpecification:
    """Fixture for Class I high precision laboratory micro-balance.

    Max = 200 g, e = 1 mg (0.001 g), d = 0.1 mg (0.0001 g), n = 200,000.
    """
    return InstrumentSpecification(
        accuracy_class=AccuracyClass.CLASS_I,
        max_capacity=Decimal("200"),
        min_capacity=Decimal("0.050"),
        e=Decimal("0.001"),
        d=Decimal("0.0001"),
        unit=UnitOfMeasure.GRAM,
        receptor_type=LoadReceptorType.PLATFORM,
        num_supports=4,
    )


# ==============================================================================
# 1. TARE SETTING ACCURACY TESTS (Clause 3.6.3 & Clause A.4.6)
# ==============================================================================


class TestTareSettingAccuracy:
    """Tests for tare setting accuracy evaluation."""

    def test_tare_setting_mpe_initial_vs_in_service(self):
        """Initial verification MPE is 0.25e; in-service is 0.50e."""
        e = Decimal("0.005")  # 5 g
        mpe_init = calculate_tare_setting_mpe(e=e, stage=VerificationStage.INITIAL)
        mpe_service = calculate_tare_setting_mpe(e=e, stage=VerificationStage.IN_SERVICE)

        assert mpe_init == Decimal("0.00125")  # 0.25 * 0.005
        assert mpe_service == Decimal("0.0025")  # 0.50 * 0.005

    def test_evaluate_tare_setting_exact_zero_error(self, class_iii_bench_scale):
        """Tare balancing where calculated changeover yields exact zero error."""
        # tare load = 2.000 kg, indication after taring = 0.000 kg
        # delta_load = 0.5 * e = 0.0025 kg -> P_tare = 0.000 + 0.0025 - 0.0025 = 0.000 kg
        res = evaluate_tare_setting(
            tare_load=Decimal("2.000"),
            indication=Decimal("0.000"),
            delta_load=Decimal("0.0025"),
            e=class_iii_bench_scale.e,
            stage=VerificationStage.INITIAL,
        )

        assert isinstance(res, EvaluatedTareSetting)
        assert res.tare_setting_error == Decimal("0")
        assert res.status == ComplianceStatus.PASS
        assert res.allowable_mpe == Decimal("0.00125")
        assert res.margin == Decimal("0.00125")
        assert r"\text{PASS}" in res.latex_formula

    def test_evaluate_tare_setting_at_allowable_boundary(self, class_iii_bench_scale):
        """Tare setting error right at the +0.25e boundary passes."""
        # e = 0.005. Allowable MPE = 0.00125.
        # delta_load = 0.00125 -> P = 0 + 0.0025 - 0.00125 = +0.00125 kg
        res = evaluate_tare_setting(
            tare_load=Decimal("3.000"),
            indication=Decimal("0.000"),
            delta_load=Decimal("0.00125"),
            e=class_iii_bench_scale.e,
            stage=VerificationStage.INITIAL,
        )

        assert res.tare_setting_error == Decimal("0.00125")
        assert res.status == ComplianceStatus.MARGINAL
        assert res.margin == Decimal("0.00000")

    def test_evaluate_tare_setting_exceeding_initial_limit_fails(self, class_iii_bench_scale):
        """Tare setting error of 0.35e exceeds initial limit (0.25e) and fails."""
        # e = 0.005. Allowable MPE = 0.00125.
        # delta_load = 0.00075 -> P = 0 + 0.0025 - 0.00075 = +0.00175 kg (0.35e)
        res = evaluate_tare_setting(
            tare_load=Decimal("1.500"),
            indication=Decimal("0.000"),
            delta_load=Decimal("0.00075"),
            e=class_iii_bench_scale.e,
            stage=VerificationStage.INITIAL,
        )

        assert res.tare_setting_error == Decimal("0.00175")
        assert res.status == ComplianceStatus.FAIL
        assert res.margin == Decimal("-0.00050")
        assert r"\text{FAIL}" in res.latex_formula

    def test_evaluate_tare_setting_in_service_permits_double_mpe(self, class_iii_bench_scale):
        """In-service stage permits up to 0.50e (0.0025 kg)."""
        # error = 0.00175 kg (0.35e) fails initial but passes in-service
        res = evaluate_tare_setting(
            tare_load=Decimal("1.500"),
            indication=Decimal("0.000"),
            delta_load=Decimal("0.00075"),
            e=class_iii_bench_scale.e,
            stage=VerificationStage.IN_SERVICE,
        )

        assert res.tare_setting_error == Decimal("0.00175")
        assert res.status == ComplianceStatus.PASS
        assert res.allowable_mpe == Decimal("0.0025")
        assert res.margin == Decimal("0.00075")

    def test_evaluate_tare_setting_invalid_inputs(self, class_iii_bench_scale):
        """Invalid tare load <= 0 or e <= 0 raises ValueError."""
        with pytest.raises(ValueError, match="Tare load must be strictly positive"):
            evaluate_tare_setting(
                tare_load=Decimal("0.000"),
                indication=Decimal("0.000"),
                delta_load=Decimal("0.0025"),
                e=class_iii_bench_scale.e,
            )

        with pytest.raises(ValueError, match="Verification scale interval 'e' must be > 0"):
            evaluate_tare_setting(
                tare_load=Decimal("2.000"),
                indication=Decimal("0.000"),
                delta_load=Decimal("0.0025"),
                e=Decimal("0.000"),
            )


# ==============================================================================
# 2. NET LOAD POINTS & MPE EVALUATION (Clause 3.5.3.4 & Clause A.4.6)
# ==============================================================================


class TestNetLoadEvaluation:
    """Tests for net load point evaluation against net load MPE."""

    def test_net_load_point_bracket_tier_1_pass(self, class_iii_bench_scale):
        """Net load of 2.0 kg (400e) is in Bracket 1 (0 <= m <= 500e -> MPE = 1.0e = 5 g)."""
        # tare error = +0.5 g = 0.0005 kg
        tare_setting = evaluate_tare_setting(
            tare_load=Decimal("1.000"),
            indication=Decimal("0.000"),
            delta_load=Decimal("0.0020"),
            e=class_iii_bench_scale.e,
        )
        tare_error = tare_setting.tare_setting_error

        # net load = 2.000 kg, indication = 2.000 kg, delta_load = 0.0025 kg
        # P = 2.000 kg -> uncorrected error = 0
        # E_c_net = 0 - 0.0005 = -0.0005 kg
        net_pt = evaluate_net_load_point(
            net_load=Decimal("2.000"),
            indication_net=Decimal("2.000"),
            delta_load=Decimal("0.0025"),
            tare_error=tare_error,
            spec=class_iii_bench_scale,
        )

        assert isinstance(net_pt, EvaluatedNetLoadPoint)
        assert net_pt.net_load == Decimal("2.000")
        assert net_pt.corrected_net_error == Decimal("-0.0005")
        assert net_pt.mpe.mpe_value == Decimal("0.0025")  # 0.5e
        assert net_pt.status == ComplianceStatus.PASS
        assert net_pt.margin == Decimal("0.0020")
        assert r"\text{PASS}" in net_pt.latex_formula

    def test_net_load_point_bracket_tier_2_evaluation(self, class_iii_bench_scale):
        """Net load of 5.0 kg (1000e) is in Bracket 2 (500e < m <= 2000e -> MPE = 1.5e = 7.5 g)."""
        net_pt = evaluate_net_load_point(
            net_load=Decimal("5.000"),
            indication_net=Decimal("5.000"),
            delta_load=Decimal("0.0025"),
            tare_error=Decimal("0.000"),
            spec=class_iii_bench_scale,
        )

        assert net_pt.mpe.mpe_value == Decimal("0.005")  # 1.0e = 5 g
        assert net_pt.status == ComplianceStatus.PASS

    def test_net_load_point_failing_mpe(self, class_iii_bench_scale):
        """Net load error exceeding Table 6 MPE fails."""
        # net load = 2.000 kg (MPE = 5 g = 0.005 kg)
        # delta_load = 0 -> P = 2.000 + 0.0025 = 2.0025
        # indication = 2.010 -> P = 2.010 + 0.0025 - 0.0025 = 2.010 kg
        # error = 2.010 - 2.000 = +0.010 kg (2.0e > 1.0e)
        net_pt = evaluate_net_load_point(
            net_load=Decimal("2.000"),
            indication_net=Decimal("2.010"),
            delta_load=Decimal("0.0025"),
            tare_error=Decimal("0.000"),
            spec=class_iii_bench_scale,
        )

        assert net_pt.corrected_net_error == Decimal("0.010")
        assert net_pt.mpe.mpe_value == Decimal("0.0025")
        assert net_pt.status == ComplianceStatus.FAIL
        assert net_pt.margin == Decimal("-0.0075")


# ==============================================================================
# 3. TARE SESSION EVALUATION TESTS (Clause A.4.6)
# ==============================================================================


class TestTareSessionEvaluation:
    """Tests for complete tare session evaluation."""

    def test_complete_tare_session_compliant(self, class_iii_bench_scale):
        """Full tare session with valid tare setting and compliant net points passes."""
        tare_obs = ObservationPoint(
            load=Decimal("2.000"),  # Tare container weight
            indication=Decimal("0.000"),
            delta_load=Decimal("0.0025"),
        )

        net_obs = [
            ObservationPoint(
                load=Decimal("0.100"),  # Min net load (20e)
                indication=Decimal("0.100"),
                delta_load=Decimal("0.0025"),
            ),
            ObservationPoint(
                load=Decimal("2.500"),  # 500e
                indication=Decimal("2.500"),
                delta_load=Decimal("0.0025"),
            ),
            ObservationPoint(
                load=Decimal("5.000"),  # 1000e
                indication=Decimal("5.000"),
                delta_load=Decimal("0.0025"),
            ),
            ObservationPoint(
                load=Decimal("10.000"),  # 2000e
                indication=Decimal("10.000"),
                delta_load=Decimal("0.0025"),
            ),
            ObservationPoint(
                load=Decimal("13.000"),  # Max - Tare = 15 - 2 = 13 kg (2600e)
                indication=Decimal("13.000"),
                delta_load=Decimal("0.0025"),
            ),
        ]

        result = evaluate_tare_session(
            spec=class_iii_bench_scale,
            tare_setting_obs=tare_obs,
            net_observations=net_obs,
            temperature=Decimal("20.0"),
            stage=VerificationStage.INITIAL,
        )

        assert isinstance(result, TareEvaluationResult)
        assert result.tare_setting.status == ComplianceStatus.PASS
        assert result.all_net_points_passed is True
        assert result.overall_status == ComplianceStatus.PASS
        assert len(result.net_points) == 5
        assert result.worst_point is not None

    def test_tare_session_fails_when_tare_setting_fails(self, class_iii_bench_scale):
        """Session fails if tare setting error > 0.25e, even if net points pass."""
        # tare error = 0.35e -> fails
        tare_obs = ObservationPoint(
            load=Decimal("2.000"),
            indication=Decimal("0.000"),
            delta_load=Decimal("0.00075"),  # Yields error = 0.00175 kg (0.35e)
        )
        net_obs = [
            ObservationPoint(
                load=Decimal("2.000"),
                indication=Decimal("2.000"),
                delta_load=Decimal("0.0025"),
            )
        ]

        result = evaluate_tare_session(
            spec=class_iii_bench_scale,
            tare_setting_obs=tare_obs,
            net_observations=net_obs,
        )

        assert result.tare_setting.status == ComplianceStatus.FAIL
        assert result.overall_status == ComplianceStatus.FAIL

    def test_tare_session_fails_when_net_point_fails(self, class_iii_bench_scale):
        """Session fails if any net load point fails Table 6 MPE."""
        tare_obs = ObservationPoint(
            load=Decimal("2.000"),
            indication=Decimal("0.000"),
            delta_load=Decimal("0.0025"),
        )
        net_obs = [
            ObservationPoint(
                load=Decimal("2.000"),
                indication=Decimal("2.000"),
                delta_load=Decimal("0.0025"),
            ),
            ObservationPoint(
                load=Decimal("10.000"),
                indication=Decimal("10.030"),  # Huge 30 g error exceeds MPE (7.5 g)
                delta_load=Decimal("0.0025"),
            ),
        ]

        result = evaluate_tare_session(
            spec=class_iii_bench_scale,
            tare_setting_obs=tare_obs,
            net_observations=net_obs,
        )

        assert result.tare_setting.status == ComplianceStatus.PASS
        assert result.all_net_points_passed is False
        assert result.overall_status == ComplianceStatus.FAIL

    def test_tare_session_accepts_dict_observations(self, class_iii_bench_scale):
        """Session works seamlessly with plain dict observations."""
        tare_dict = {"load": "2.000", "indication": "0.000", "delta_load": "0.0025"}
        net_dicts = [
            {"net_load": "2.000", "indication_net": "2.000", "delta_load": "0.0025"},
            {"net_load": "5.000", "indication_net": "5.000", "delta_load": "0.0025"},
        ]

        result = evaluate_tare_session(
            spec=class_iii_bench_scale,
            tare_setting_obs=tare_dict,
            net_observations=net_dicts,
        )

        assert result.overall_status == ComplianceStatus.PASS
        assert len(result.net_points) == 2


# ==============================================================================
# 4. ZERO DRIFT PER 5 °C TESTS (Clause 3.9.2.3 & Clause A.5.3)
# ==============================================================================


class TestZeroDriftPer5Celsius:
    """Tests for zero drift calculation and statutory limits."""

    def test_calculate_zero_drift_limit(self):
        """Class I limit is 0.5e; Class II/III/IIII limit is 1.0e."""
        e = Decimal("0.010")  # 10 mg
        limit_i = calculate_zero_drift_limit(e=e, accuracy_class=AccuracyClass.CLASS_I)
        limit_ii = calculate_zero_drift_limit(e=e, accuracy_class=AccuracyClass.CLASS_II)
        limit_iii = calculate_zero_drift_limit(e=e, accuracy_class=AccuracyClass.CLASS_III)
        limit_iiii = calculate_zero_drift_limit(e=e, accuracy_class=AccuracyClass.CLASS_IIII)

        assert limit_i == Decimal("0.0050")  # 0.5e
        assert limit_ii == Decimal("0.0100")  # 1.0e
        assert limit_iii == Decimal("0.0100")  # 1.0e
        assert limit_iiii == Decimal("0.0100")  # 1.0e

    def test_evaluate_zero_drift_segment_class_iii_compliant(self, class_iii_bench_scale):
        """Zero drift across 20 °C delta on Class III scale within 1.0e limit."""
        # e = 0.005 kg. Limit per 5 °C = 1.0e = 0.005 kg.
        # Temp delta = 40 - 20 = 20 °C.
        # Zero error shifts by 0.008 kg over 20 °C.
        # Drift per 5 °C = (0.008 / 20) * 5 = 0.002 kg (0.40e <= 1.0e) -> PASS.
        seg = evaluate_zero_drift_segment(
            t1=Decimal("20.0"),
            e0_1=Decimal("0.001"),
            t2=Decimal("40.0"),
            e0_2=Decimal("0.009"),
            spec=class_iii_bench_scale,
        )

        assert isinstance(seg, EvaluatedZeroDriftSegment)
        assert seg.temperature_delta_celsius == Decimal("20.0")
        assert seg.zero_error_shift == Decimal("0.008")
        assert seg.drift_per_5_celsius == Decimal("0.002000000000000000000000000000")
        assert seg.drift_per_5_celsius_in_e == Decimal("0.4000000000000000000000000000")
        assert seg.allowable_limit_5_celsius == Decimal("0.005")
        assert seg.status == ComplianceStatus.PASS
        assert r"\le" in seg.latex_formula

    def test_evaluate_zero_drift_segment_class_iii_excessive_drift_fails(
        self, class_iii_bench_scale
    ):
        """Zero drift exceeding 1.0e / 5 °C on Class III fails."""
        # Temp delta = 20 °C to -10 °C -> delta = 30 °C.
        # Zero shift = 0.040 kg over 30 °C.
        # Drift per 5 °C = (0.040 / 30) * 5 = 0.00667 kg (1.33e > 1.0e) -> FAIL.
        seg = evaluate_zero_drift_segment(
            t1=Decimal("20.0"),
            e0_1=Decimal("0.000"),
            t2=Decimal("-10.0"),
            e0_2=Decimal("0.040"),
            spec=class_iii_bench_scale,
        )

        assert seg.status == ComplianceStatus.FAIL
        assert seg.margin < Decimal("0")
        assert r"\text{FAIL}" in seg.latex_formula

    def test_evaluate_zero_drift_segment_class_i_stricter_limit(
        self, class_i_analytical_balance
    ):
        """Class I has strict 0.5e limit per 5 °C."""
        # e = 0.001 g. Limit per 5 °C = 0.5e = 0.0005 g.
        # Temp delta = 30 - 20 = 10 °C.
        # Zero shift = 0.0012 g over 10 °C.
        # Drift per 5 °C = (0.0012 / 10) * 5 = 0.0006 g (0.6e > 0.5e) -> FAIL.
        seg = evaluate_zero_drift_segment(
            t1=Decimal("20.0"),
            e0_1=Decimal("0.0000"),
            t2=Decimal("30.0"),
            e0_2=Decimal("0.0012"),
            spec=class_i_analytical_balance,
        )

        assert seg.allowable_limit_5_celsius == Decimal("0.0005")
        assert seg.status == ComplianceStatus.FAIL

    def test_evaluate_zero_drift_segment_zero_delta_raises(self, class_iii_bench_scale):
        """Identical temperatures raise ValueError."""
        with pytest.raises(ValueError, match="Temperature delta must be non-zero"):
            evaluate_zero_drift_segment(
                t1=Decimal("20.0"),
                e0_1=Decimal("0.001"),
                t2=Decimal("20.0"),
                e0_2=Decimal("0.002"),
                spec=class_iii_bench_scale,
            )


# ==============================================================================
# 5. TEMPERATURE PLATEAU & SPAN SHIFT TESTS (Clause A.5.3)
# ==============================================================================


class TestTemperaturePlateau:
    """Tests for single temperature plateau evaluation."""

    def test_statutory_temperature_constants(self):
        """Verifies statutory constants match OIML R 76 Clause A.5.3 rules."""
        assert DEFAULT_REFERENCE_TEMP_CELSIUS == Decimal("20.0")
        assert MAX_TEMP_CHANGE_RATE_C_PER_HR == Decimal("5.0")
        assert MIN_STABILIZATION_HOURS == Decimal("2.0")

    def test_plateau_thermal_stabilization_compliance(self, class_iii_bench_scale):
        """Duration >= 2.0 h is compliant; < 2.0 h fails test condition rules."""
        rp = default_rulepack_manager.get_active_rulepack()
        p_ok = evaluate_temperature_plateau(
            temperature=Decimal("20.0"),
            zero_error=Decimal("0.000"),
            load_observations=[],
            duration_hours=Decimal("2.5"),
            spec=class_iii_bench_scale,
            rulepack=rp,
        )
        assert isinstance(p_ok, EvaluatedTemperaturePlateau)
        assert p_ok.stabilization_compliant is True

        p_short = evaluate_temperature_plateau(
            temperature=Decimal("20.0"),
            zero_error=Decimal("0.000"),
            load_observations=[],
            duration_hours=Decimal("1.5"),  # Less than 2.0 hours
            spec=class_iii_bench_scale,
        )
        assert p_short.stabilization_compliant is False

    def test_plateau_transition_rate_compliance(self, class_iii_bench_scale):
        """Transition rate <= 5.0 °C/h passes; > 5.0 °C/h fails test condition."""
        p_good_rate = evaluate_temperature_plateau(
            temperature=Decimal("40.0"),
            zero_error=Decimal("0.002"),
            load_observations=[],
            duration_hours=Decimal("2.0"),
            transition_rate_c_per_hr=Decimal("4.5"),
            spec=class_iii_bench_scale,
        )
        assert p_good_rate.transition_rate_compliant is True

        p_fast_rate = evaluate_temperature_plateau(
            temperature=Decimal("40.0"),
            zero_error=Decimal("0.002"),
            load_observations=[],
            duration_hours=Decimal("2.0"),
            transition_rate_c_per_hr=Decimal("6.0"),  # Exceeds statutory 5.0 °C/h
            spec=class_iii_bench_scale,
        )
        assert p_fast_rate.transition_rate_compliant is False

    def test_plateau_span_shift_and_temp_coefficient(self, class_iii_bench_scale):
        """Calculates span shift and TC_span in ppm/°C relative to reference."""
        # Reference plateau at 20 °C had span error = +0.002 kg at Max (15 kg).
        ref_error = Decimal("0.002")

        # Plateau at 40 °C (delta T = 20 °C):
        # Load = 15 kg, Indication = 15.005 kg, delta_load = 0.0025 -> P = 15.005
        # zero_error at 40 °C = 0.001 kg -> E_c = 0.005 - 0.001 = 0.004 kg
        # Span shift = 0.004 - 0.002 = +0.002 kg
        # TC_span = (0.002 / (15 * 20)) * 10^6 = (0.002 / 300) * 10^6 = 6.67 ppm/°C
        plat = evaluate_temperature_plateau(
            temperature=Decimal("40.0"),
            zero_error=Decimal("0.001"),
            load_observations=[
                ObservationPoint(
                    load=Decimal("15.000"),
                    indication=Decimal("15.005"),
                    delta_load=Decimal("0.0025"),
                )
            ],
            duration_hours=Decimal("2.5"),
            transition_rate_c_per_hr=Decimal("4.0"),
            ref_span_error=ref_error,
            ref_temperature=Decimal("20.0"),
            spec=class_iii_bench_scale,
        )

        assert plat.span_corrected_error == Decimal("0.004")
        assert plat.span_shift_from_ref == Decimal("0.002")
        assert plat.span_temp_coefficient_ppm is not None
        # approx 6.666... ppm/°C
        assert abs(plat.span_temp_coefficient_ppm - Decimal("6.6667")) < Decimal("0.01")


# ==============================================================================
# 6. COMPLETE TEMPERATURE CYCLE TESTS (Clause A.5.3)
# ==============================================================================


class TestCompleteTemperatureCycle:
    """Tests for full static chamber temperature cycle (20 -> 40 -> -10 -> 20 °C)."""

    def test_full_chamber_cycle_compliant(self, class_iii_bench_scale):
        """Full standard static temperature cycle passing all statutory checks."""
        plateaus = [
            {
                "temperature": "20.0",
                "plateau_label": "Reference 1 (+20 °C)",
                "duration_hours": "2.5",
                "transition_rate_c_per_hr": None,
                "zero_error": "0.000",
                "load_observations": [
                    {"load": "15.000", "indication": "15.000", "delta_load": "0.0025"}
                ],
            },
            {
                "temperature": "40.0",
                "plateau_label": "High Temp (+40 °C)",
                "duration_hours": "3.0",
                "transition_rate_c_per_hr": "4.0",
                "zero_error": "0.003",  # delta E0 = 0.003 over 20 °C -> 0.00075 / 5 °C (0.15e)
                "load_observations": [
                    {"load": "15.000", "indication": "15.004", "delta_load": "0.0025"}
                ],
            },
            {
                "temperature": "-10.0",
                "plateau_label": "Low Temp (-10 °C)",
                "duration_hours": "3.5",
                "transition_rate_c_per_hr": "4.5",
                "zero_error": "-0.004",  # delta E0 = 0.007 over 50 °C -> 0.0007 / 5 °C (0.14e)
                "load_observations": [
                    {"load": "15.000", "indication": "14.997", "delta_load": "0.0025"}
                ],
            },
            {
                "temperature": "20.0",
                "plateau_label": "Return Reference (+20 °C)",
                "duration_hours": "2.0",
                "transition_rate_c_per_hr": "3.8",
                "zero_error": "0.001",  # delta E0 = 0.005 over 30 °C -> 0.00083 / 5 °C (0.17e)
                "load_observations": [
                    {"load": "15.000", "indication": "15.001", "delta_load": "0.0025"}
                ],
            },
        ]

        res = evaluate_temperature_session(
            spec=class_iii_bench_scale,
            plateaus_data=plateaus,
            reference_temperature=Decimal("20.0"),
        )

        assert isinstance(res, TemperatureEvaluationResult)
        assert res.zero_drift_status == ComplianceStatus.PASS
        assert res.all_loads_compliant is True
        assert res.thermal_rate_compliant is True
        assert res.stabilization_compliant is True
        assert res.overall_status == ComplianceStatus.PASS
        assert len(res.zero_drift_segments) == 3
        assert res.max_span_shift is not None
        assert res.max_span_temp_coeff_ppm is not None

    def test_full_chamber_cycle_fails_on_excessive_zero_drift(self, class_iii_bench_scale):
        """Cycle fails when thermal zero drift exceeds class limit."""
        plateaus = [
            {
                "temperature": "20.0",
                "zero_error": "0.000",
                "duration_hours": "2.5",
                "load_observations": [
                    {"load": "15.000", "indication": "15.000", "delta_load": "0.0025"}
                ],
            },
            {
                "temperature": "40.0",
                "zero_error": "0.030",  # 30 g shift over 20 °C -> 7.5 g / 5 °C (1.5e > 1.0e)
                "duration_hours": "2.5",
                "transition_rate_c_per_hr": "4.0",
                "load_observations": [
                    {"load": "15.000", "indication": "15.000", "delta_load": "0.0025"}
                ],
            },
        ]

        res = evaluate_temperature_session(
            spec=class_iii_bench_scale,
            plateaus_data=plateaus,
            reference_temperature=Decimal("20.0"),
        )

        assert res.zero_drift_status == ComplianceStatus.FAIL
        assert res.overall_status == ComplianceStatus.FAIL

    def test_full_chamber_cycle_fails_on_transition_rate_violation(self, class_iii_bench_scale):
        """Cycle fails when chamber ramp rate exceeds 5 °C/h."""
        plateaus = [
            {
                "temperature": "20.0",
                "zero_error": "0.000",
                "duration_hours": "2.5",
            },
            {
                "temperature": "40.0",
                "zero_error": "0.002",
                "duration_hours": "2.5",
                "transition_rate_c_per_hr": "7.5",  # VIOLATION: > 5 °C/hr
            },
        ]

        res = evaluate_temperature_session(
            spec=class_iii_bench_scale,
            plateaus_data=plateaus,
            reference_temperature=Decimal("20.0"),
        )

        assert res.thermal_rate_compliant is False
        assert res.overall_status == ComplianceStatus.FAIL

    def test_full_chamber_cycle_fails_on_insufficient_soak(self, class_iii_bench_scale):
        """Cycle fails when thermal stabilization soak is less than 2.0 hours."""
        plateaus = [
            {
                "temperature": "20.0",
                "zero_error": "0.000",
                "duration_hours": "1.0",  # VIOLATION: < 2.0 hours
            },
            {
                "temperature": "40.0",
                "zero_error": "0.002",
                "duration_hours": "2.5",
                "transition_rate_c_per_hr": "4.0",
            },
        ]

        res = evaluate_temperature_session(
            spec=class_iii_bench_scale,
            plateaus_data=plateaus,
            reference_temperature=Decimal("20.0"),
        )

        assert res.stabilization_compliant is False
        assert res.overall_status == ComplianceStatus.FAIL

    def test_temperature_session_missing_reference_plateau_raises(self, class_iii_bench_scale):
        """Raises ValueError if declared reference temperature plateau is missing."""
        plateaus = [
            {"temperature": "30.0", "zero_error": "0.000"},
            {"temperature": "40.0", "zero_error": "0.002"},
        ]

        with pytest.raises(ValueError, match="Reference temperature plateau.*not found"):
            evaluate_temperature_session(
                spec=class_iii_bench_scale,
                plateaus_data=plateaus,
                reference_temperature=Decimal("20.0"),
            )

    def test_temperature_session_insufficient_plateaus_raises(self, class_iii_bench_scale):
        """Raises ValueError if fewer than 2 plateaus are provided."""
        plateaus = [{"temperature": "20.0", "zero_error": "0.000"}]

        with pytest.raises(ValueError, match="At least 2 temperature plateaus required"):
            evaluate_temperature_session(
                spec=class_iii_bench_scale,
                plateaus_data=plateaus,
                reference_temperature=Decimal("20.0"),
            )
