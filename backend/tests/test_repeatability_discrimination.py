"""Test suite for METROLOGIX-76 Repeatability & Discrimination Engines.

Statutory References:
- OIML R 76-1:2006 Clause 3.6.1 & Clause A.4.10: Repeatability test.
- OIML R 76-1:2006 Clause 3.8 & Clause A.4.8: Discrimination test.
- Legal Metrology (General) Rules, 2011, Seventh Schedule, Heading A, Para 8 & Para 9(1)(c).
- Legal Metrology (General) Fourth Amendment Rules, 2026 (G.S.R. 568(E)):
  * Repeatability error <= 0.3e unlocks 33.3% Max standard weight substitution.
  * Repeatability error <= 0.2e unlocks 20% Max standard weight substitution.

Verification Test Gate:
- Pytest validating repeatability spread compliance and rejection.
- Pytest validating discrimination 1.4d trigger logic and failure cases.
- Empirical sample standard deviation (s) for statistical traceability.
- Capacity threshold awareness (10 runs for <=1000 kg, 3 runs for >1000 kg).
"""

from __future__ import annotations

from decimal import Decimal

import pytest

from app.core.discrimination_engine import (
    calculate_discrimination_extra_load,
    evaluate_discrimination_point,
    evaluate_discrimination_session,
)
from app.core.repeatability_engine import (
    calculate_sample_standard_deviation,
    determine_prescribed_repeatability_runs,
    evaluate_repeatability_run,
    evaluate_repeatability_series,
    evaluate_repeatability_session,
    evaluate_repeatability_substitution,
)
from app.core.rulepack import default_rulepack_manager
from app.core.schemas import (
    DiscriminationObservation,
    InstrumentSpecification,
    RepeatabilityRun,
)
from app.core.types import (
    AccuracyClass,
    ComplianceStatus,
    LoadReceptorType,
    UnitOfMeasure,
    VerificationStage,
)

# ============================================================================
# Fixtures
# ============================================================================


@pytest.fixture
def standard_retail_spec() -> InstrumentSpecification:
    """Standard 15 kg Class III retail bench scale (e = 5 g, d = 5 g)."""
    return InstrumentSpecification(
        model_name="Retail-15K",
        accuracy_class=AccuracyClass.CLASS_III,
        max_capacity=Decimal("15"),
        min_capacity=Decimal("0.1"),
        e=Decimal("0.005"),
        d=Decimal("0.005"),
        unit=UnitOfMeasure.KILOGRAM,
        receptor_type=LoadReceptorType.PLATFORM,
        num_supports=4,
    )


@pytest.fixture
def heavy_weighbridge_spec() -> InstrumentSpecification:
    """Heavy 50,000 kg Class III pitless vehicle weighbridge (e = 20 kg, d = 20 kg)."""
    return InstrumentSpecification(
        model_name="Weighbridge-50T",
        accuracy_class=AccuracyClass.CLASS_III,
        max_capacity=Decimal("50000"),
        min_capacity=Decimal("400"),
        e=Decimal("20"),
        d=Decimal("20"),
        unit=UnitOfMeasure.KILOGRAM,
        receptor_type=LoadReceptorType.WEIGHBRIDGE,
        num_supports=8,
    )


# ============================================================================
# 1. Statistical Math & Standard Deviation Tests
# ============================================================================


class TestRepeatabilityStatisticalCalculations:
    """Verify sample standard deviation (s) calculation under strict Decimal rules."""

    def test_empty_and_single_value_sequence(self) -> None:
        """Sample size n < 2 yields zero variance and zero std dev."""
        m0, v0, s0 = calculate_sample_standard_deviation([])
        assert m0 == Decimal("0")
        assert v0 == Decimal("0")
        assert s0 == Decimal("0")

        m1, v1, s1 = calculate_sample_standard_deviation([Decimal("5.0")])
        assert m1 == Decimal("5.0")
        assert v1 == Decimal("0")
        assert s1 == Decimal("0")

    def test_known_statistical_dataset(self) -> None:
        """Verify against known dataset: [2, 4, 4, 4, 5, 5, 7, 9].

        n = 8
        Sum = 40
        Mean = 5.0
        Squared diffs: 9 + 1 + 1 + 1 + 0 + 0 + 4 + 16 = 32
        Sample variance = 32 / (8 - 1) = 32 / 7
        Std dev = sqrt(32 / 7) approx 2.1380899...
        """
        data = [
            Decimal("2"),
            Decimal("4"),
            Decimal("4"),
            Decimal("4"),
            Decimal("5"),
            Decimal("5"),
            Decimal("7"),
            Decimal("9"),
        ]
        mean, variance, s = calculate_sample_standard_deviation(data)
        assert mean == Decimal("5")
        expected_var = Decimal("32") / Decimal("7")
        assert variance == expected_var
        assert s == expected_var.sqrt()
        # Verify precision: approx 2.1380899
        assert abs(s - Decimal("2.138089935")) < Decimal("0.000001")

    def test_identical_measurements_zero_spread(self) -> None:
        """Identical repeated weighings yield variance 0 and s = 0."""
        data = [Decimal("10.000")] * 10
        mean, variance, s = calculate_sample_standard_deviation(data)
        assert mean == Decimal("10.000")
        assert variance == Decimal("0")
        assert s == Decimal("0")


# ============================================================================
# 2. Capacity-Aware Prescribed Runs
# ============================================================================


class TestPrescribedRepeatabilityRuns:
    """Verify Clause A.4.10 run requirements: <=1000 kg -> 10 runs, >1000 kg -> 3 runs."""

    def test_standard_scale_gets_10_runs_initial(
        self, standard_retail_spec: InstrumentSpecification
    ) -> None:
        runs = determine_prescribed_repeatability_runs(
            standard_retail_spec, VerificationStage.INITIAL_TYPE_APPROVAL
        )
        assert runs == 10

    def test_standard_scale_gets_6_runs_in_service(
        self, standard_retail_spec: InstrumentSpecification
    ) -> None:
        runs = determine_prescribed_repeatability_runs(
            standard_retail_spec, VerificationStage.SUBSEQUENT_IN_SERVICE
        )
        assert runs == 6

    def test_heavy_weighbridge_gets_3_runs(
        self, heavy_weighbridge_spec: InstrumentSpecification
    ) -> None:
        runs = determine_prescribed_repeatability_runs(
            heavy_weighbridge_spec, VerificationStage.INITIAL_TYPE_APPROVAL
        )
        assert runs == 3


# ============================================================================
# 3. VERIFICATION TEST GATE: Repeatability Spread Compliance & Rejection
# ============================================================================


class TestRepeatabilitySeriesEvaluation:
    """Verify statutory Clause A.4.10 repeatability evaluation."""

    def test_repeatability_10_runs_passing_verification_gate(
        self, standard_retail_spec: InstrumentSpecification
    ) -> None:
        """Verification Test Gate: 10 consecutive runs at 50% Max (7.5 kg).

        At 7.5 kg (e = 5 g, m = 1500 e), Table 6 MPE is +/- 1.0 e = +/- 0.005 kg.
        Runs exhibit small errors between -0.001 kg and +0.002 kg.
        Spread Delta E = 0.002 - (-0.001) = 0.003 kg <= 0.005 kg -> PASS.
        """
        nominal_load = Decimal("7.5")  # 50% Max
        e = standard_retail_spec.e  # 0.005 kg

        # 10 runs: indications around 7.500 kg
        run_data = [
            (1, nominal_load, Decimal("7.500"), Decimal("0.002")),  # P = 7.5005, E = +0.0005
            (2, nominal_load, Decimal("7.500"), Decimal("0.001")),  # P = 7.5015, E = +0.0015
            (3, nominal_load, Decimal("7.500"), Decimal("0.003")),  # P = 7.4995, E = -0.0005
            (4, nominal_load, Decimal("7.500"), Decimal("0.002")),  # P = 7.5005, E = +0.0005
            (5, nominal_load, Decimal("7.500"), Decimal("0.0025")),  # P = 7.5000, E = 0.0000
            (6, nominal_load, Decimal("7.500"), Decimal("0.0015")),  # P = 7.5010, E = +0.0010
            (7, nominal_load, Decimal("7.500"), Decimal("0.002")),  # P = 7.5005, E = +0.0005
            (8, nominal_load, Decimal("7.500"), Decimal("0.003")),  # P = 7.4995, E = -0.0005
            (9, nominal_load, Decimal("7.500"), Decimal("0.002")),  # P = 7.5005, E = +0.0005
            (10, nominal_load, Decimal("7.500"), Decimal("0.0025")),  # P = 7.5000, E = 0.0000
        ]

        result = evaluate_repeatability_series(
            runs=run_data,
            nominal_load=nominal_load,
            e=e,
            accuracy_class=AccuracyClass.CLASS_III,
            series_name="Series 1 (~50% Max)",
        )

        assert result.runs_count == 10
        assert result.mpe_limit == Decimal("0.005")  # 1.0 e
        assert result.allowable_spread == Decimal("0.005")
        # Spread is max - min = 0.0015 - (-0.0005) = 0.0020 kg
        assert result.error_spread == Decimal("0.0020")
        assert result.spread_status == ComplianceStatus.PASS
        assert result.all_runs_within_mpe is True
        assert result.overall_status == ComplianceStatus.PASS
        assert result.standard_deviation > Decimal("0")

    def test_repeatability_rejection_when_spread_exceeds_mpe(
        self, standard_retail_spec: InstrumentSpecification
    ) -> None:
        """Verification Test Gate: Scale fails when spread Delta E > |MPE|.

        MPE is 0.005 kg. Runs fluctuate between -0.003 kg and +0.004 kg.
        Spread Delta E = 0.004 - (-0.003) = 0.007 kg > 0.005 kg -> FAIL.
        """
        nominal_load = Decimal("7.5")
        e = standard_retail_spec.e

        run_data = [
            # Run 1: E = +0.004 kg
            RepeatabilityRun(
                run_number=1,
                load=nominal_load,
                indication=Decimal("7.500"),
                delta_load=Decimal("0.000"),
                e=e,
            ),
            # Run 2: E = -0.003 kg (P = 7.500 + 0.0025 - 0.0055 = 7.4970) -> wait, dl in [0, e]
            # If I = 7.495, dl = 0.0005: P = 7.495 + 0.0025 - 0.0005 = 7.4970, E = -0.0030
            RepeatabilityRun(
                run_number=2,
                load=nominal_load,
                indication=Decimal("7.495"),
                delta_load=Decimal("0.0005"),
                e=e,
            ),
            # Run 3: E = 0.000 kg
            RepeatabilityRun(
                run_number=3,
                load=nominal_load,
                indication=Decimal("7.500"),
                delta_load=Decimal("0.0025"),
                e=e,
            ),
        ]

        result = evaluate_repeatability_series(
            runs=run_data,
            nominal_load=nominal_load,
            e=e,
            accuracy_class=AccuracyClass.CLASS_III,
        )

        assert result.runs_count == 3
        # Max error: +0.0025, Min error: -0.0030 -> spread = 0.0055 kg > 0.0050 kg MPE
        assert result.error_spread > result.allowable_spread
        assert result.spread_status == ComplianceStatus.FAIL
        assert result.overall_status == ComplianceStatus.FAIL

    def test_heavy_instrument_3_runs_series(
        self, heavy_weighbridge_spec: InstrumentSpecification
    ) -> None:
        """Heavy weighbridge (50,000 kg) executes 3 runs per Clause A.4.10.1.

        At 25,000 kg (e = 20 kg, m = 1250 e), Table 6 MPE is +/- 20 kg (+/- 1.0 e).
        3 weighings: 25000, 25000, 25000 with Delta L = 10 kg (P = 25000, E = 0).
        """
        nominal_load = Decimal("25000")
        e = heavy_weighbridge_spec.e

        runs = [
            {
                "run_number": 1,
                "load": nominal_load,
                "indication": Decimal("25000"),
                "delta_load": Decimal("10"),
            },
            {
                "run_number": 2,
                "load": nominal_load,
                "indication": Decimal("25000"),
                "delta_load": Decimal("8"),
            },
            {
                "run_number": 3,
                "load": nominal_load,
                "indication": Decimal("25000"),
                "delta_load": Decimal("12"),
            },
        ]

        result = evaluate_repeatability_series(
            runs=runs,
            nominal_load=nominal_load,
            e=e,
            accuracy_class=AccuracyClass.CLASS_III,
        )

        assert result.runs_count == 3
        assert result.overall_status == ComplianceStatus.PASS
        # P1 = 25000, P2 = 25002, P3 = 24998 -> spread = 4 kg <= 20 kg MPE
        assert result.error_spread == Decimal("4")
        assert result.allowable_spread == Decimal("20")

    def test_minimum_runs_validation_error(self) -> None:
        """Fewer than 3 weighings raises ValueError per Clause A.4.10."""
        with pytest.raises(ValueError, match="at least 3 weighings"):
            evaluate_repeatability_series(
                runs=[
                    {"run_number": 1, "load": Decimal("10"), "indication": Decimal("10")},
                    {"run_number": 2, "load": Decimal("10"), "indication": Decimal("10")},
                ],
                nominal_load=Decimal("10"),
                e=Decimal("0.01"),
            )


# ============================================================================
# 4. Standard Weight Substitution Tests (Fourth Amendment Rules, 2026)
# ============================================================================


class TestStandardWeightSubstitution:
    """Verify Legal Metrology Fourth Amendment Rules, 2026 (G.S.R. 568(E)) tiers."""

    def test_tier_2_unlocked_when_error_le_0_2e(self) -> None:
        """Delta E <= 0.2e unlocks Tier 2: 20% Max standard weights (80% substitution)."""
        e = Decimal("10")  # e = 10 g
        spread = Decimal("1.5")  # 1.5 g / 10 g = 0.15e <= 0.2e
        std_dev = Decimal("0.8")

        res = evaluate_repeatability_substitution(
            error_spread=spread,
            standard_deviation=std_dev,
            e=e,
        )
        assert res.unlocked_tier == "TIER_2_20_PCT"
        assert res.required_standard_weights_fraction == Decimal("0.2")
        assert res.required_standard_weights_pct == Decimal("20.0")
        assert res.allowable_substitution_pct == Decimal("80.0")

    def test_tier_1_unlocked_when_error_le_0_3e(self) -> None:
        """0.2e < Delta E <= 0.3e unlocks Tier 1: 33.3% Max standard weights (66.7% sub)."""
        e = Decimal("10")
        spread = Decimal("2.8")  # 0.28e
        std_dev = Decimal("1.2")

        res = evaluate_repeatability_substitution(
            error_spread=spread,
            standard_deviation=std_dev,
            e=e,
        )
        assert res.unlocked_tier == "TIER_1_33_PCT"
        assert res.required_standard_weights_pct == Decimal("33.3333")
        assert res.allowable_substitution_pct == Decimal("66.6667")

    def test_base_tier_when_error_gt_0_3e(self) -> None:
        """Delta E > 0.3e requires Base Tier: 50% Max standard weights (50% sub)."""
        e = Decimal("10")
        spread = Decimal("4.5")  # 0.45e
        std_dev = Decimal("2.0")

        res = evaluate_repeatability_substitution(
            error_spread=spread,
            standard_deviation=std_dev,
            e=e,
        )
        assert res.unlocked_tier == "BASE_50_PCT"
        assert res.required_standard_weights_pct == Decimal("50.0")
        assert res.allowable_substitution_pct == Decimal("50.0")


# ============================================================================
# 5. Full Repeatability Session Evaluation Tests
# ============================================================================


class TestRepeatabilitySessionEvaluation:
    """Verify session aggregating Series 1 (~50% Max) and Series 2 (~100% Max)."""

    def test_complete_passing_session(
        self, standard_retail_spec: InstrumentSpecification
    ) -> None:
        """Both series pass -> session PASS."""
        load_50 = Decimal("7.5")
        load_100 = Decimal("15.0")

        runs_50 = [
            (i, load_50, Decimal("7.500"), Decimal("0.0025")) for i in range(1, 11)
        ]
        runs_100 = [
            (i, load_100, Decimal("15.000"), Decimal("0.0025")) for i in range(1, 11)
        ]

        session_res = evaluate_repeatability_session(
            spec=standard_retail_spec,
            series_data=[
                ("Series 1 (~50% Max)", load_50, runs_50),
                ("Series 2 (~100% Max)", load_100, runs_100),
            ],
        )

        assert session_res.overall_status == ComplianceStatus.PASS
        assert len(session_res.series) == 2
        assert session_res.all_series_compliant is True
        assert session_res.prescribed_runs_per_series == 10
        assert session_res.is_heavy_instrument is False
        assert session_res.substitution_overall.unlocked_tier == "TIER_2_20_PCT"

    def test_session_fails_if_one_series_fails(
        self, standard_retail_spec: InstrumentSpecification
    ) -> None:
        """Series 1 passes, but Series 2 fails -> overall session FAIL."""
        load_50 = Decimal("7.5")
        load_100 = Decimal("15.0")

        runs_50 = [
            (i, load_50, Decimal("7.500"), Decimal("0.0025")) for i in range(1, 11)
        ]
        # Series 2 with high spread exceeding MPE (15 kg, m = 3000 e, MPE = 1.5 e = 0.0075 kg)
        # Indication swings: 15.000 to 15.015 (spread = 0.015 kg > 0.0075 kg)
        runs_100 = [
            (1, load_100, Decimal("15.000"), Decimal("0.0025")),
            (2, load_100, Decimal("15.015"), Decimal("0.0025")),
            (3, load_100, Decimal("15.000"), Decimal("0.0025")),
        ]

        session_res = evaluate_repeatability_session(
            spec=standard_retail_spec,
            series_data=[
                ("Series 1 (~50% Max)", load_50, runs_50),
                ("Series 2 (~100% Max)", load_100, runs_100),
            ],
        )

        assert session_res.overall_status == ComplianceStatus.FAIL
        assert session_res.all_series_compliant is False


# ============================================================================
# 6. VERIFICATION TEST GATE: Discrimination 1.4d Trigger Engine Tests
# ============================================================================


class TestDiscriminationEngine:
    """Verify OIML R 76-1 Clause A.4.8 & Clause 3.8 Discrimination Test."""

    def test_extra_load_calculation_is_1_4d(self) -> None:
        """Verify statutory extra load Delta L = 1.4 * d."""
        d = Decimal("0.005")  # 5 g
        extra = calculate_discrimination_extra_load(d)
        assert extra == Decimal("0.0070")  # 1.4 * 0.005 = 0.0070

    def test_discrimination_point_pass_direct_digital(self) -> None:
        """Verification Test Gate: Extra load 1.4d produces indication step >= 1d -> PASS."""
        d = Decimal("5")  # 5 g
        # Loaded with 1000 g (indication 1000 g). Gentle 1.4d (7 g) advances indication to 1005 g.
        obs = DiscriminationObservation(
            load=Decimal("1000"),
            load_label="0.5 Max",
            initial_indication=Decimal("1000"),
            extra_load=Decimal("7"),
            final_indication=Decimal("1005"),
        )
        pt = evaluate_discrimination_point(observation=obs, d=d)
        assert pt.effective_change == Decimal("5")  # Exactly 1d
        assert pt.required_minimum_change == Decimal("5")
        assert pt.status == ComplianceStatus.PASS

    def test_discrimination_point_fail_when_no_change(self) -> None:
        """Verification Test Gate: Display fails to change when 1.4d is added -> FAIL."""
        d = Decimal("5")
        obs = DiscriminationObservation(
            load=Decimal("1000"),
            load_label="0.5 Max",
            initial_indication=Decimal("1000"),
            extra_load=Decimal("7"),
            final_indication=Decimal("1000"),  # No change!
        )
        pt = evaluate_discrimination_point(observation=obs, d=d)
        assert pt.effective_change == Decimal("0")
        assert pt.status == ComplianceStatus.FAIL

    def test_discrimination_with_unrounded_turning_points(self) -> None:
        """Turning point method: P_1 = 1000.5, P_2 = 1006.0 -> Delta P = 5.5 >= 1.0d -> PASS."""
        d = Decimal("5")
        e = Decimal("5")
        # P_1 = 1000 + 0.5(5) - 2.0 = 1000.5
        # P_2 = 1005 + 0.5(5) - 1.5 = 1006.0
        # Delta P = 1006.0 - 1000.5 = 5.5 g >= 5.0 g (1d)
        obs = DiscriminationObservation(
            load=Decimal("1000"),
            initial_indication=Decimal("1000"),
            final_indication=Decimal("1005"),
            initial_delta_load=Decimal("2.0"),
            final_delta_load=Decimal("1.5"),
        )
        pt = evaluate_discrimination_point(observation=obs, d=d, e=e)
        assert pt.initial_turning_point == Decimal("1000.5")
        assert pt.final_turning_point == Decimal("1006.0")
        assert pt.turning_point_change == Decimal("5.5")
        assert pt.effective_change == Decimal("5.5")
        assert pt.status == ComplianceStatus.PASS

    def test_discrimination_session_3_loads_pass(
        self, standard_retail_spec: InstrumentSpecification
    ) -> None:
        """Clause A.4.8: Tests at Min (0.1 kg), 0.5 Max (7.5 kg), and Max (15 kg)."""
        observations = [
            # Min: 0.100 -> 0.105 (+1d)
            DiscriminationObservation(
                load=Decimal("0.1"),
                load_label="Min Capacity",
                initial_indication=Decimal("0.100"),
                final_indication=Decimal("0.105"),
            ),
            # 0.5 Max: 7.500 -> 7.505 (+1d)
            DiscriminationObservation(
                load=Decimal("7.5"),
                load_label="0.5 Max Capacity",
                initial_indication=Decimal("7.500"),
                final_indication=Decimal("7.505"),
            ),
            # Max: 15.000 -> 15.005 (+1d)
            DiscriminationObservation(
                load=Decimal("15.0"),
                load_label="Max Capacity",
                initial_indication=Decimal("15.000"),
                final_indication=Decimal("15.005"),
            ),
        ]

        session = evaluate_discrimination_session(
            spec=standard_retail_spec,
            observations=observations,
        )

        assert session.overall_status == ComplianceStatus.PASS
        assert session.all_points_passed is True
        assert session.failed_points_count == 0
        assert len(session.points) == 3

    def test_discrimination_session_fails_if_any_point_fails(
        self, standard_retail_spec: InstrumentSpecification
    ) -> None:
        """If discrimination fails at Max load, entire test fails."""
        observations = [
            DiscriminationObservation(
                load=Decimal("0.1"),
                initial_indication=Decimal("0.100"),
                final_indication=Decimal("0.105"),
            ),
            DiscriminationObservation(
                load=Decimal("7.5"),
                initial_indication=Decimal("7.500"),
                final_indication=Decimal("7.505"),
            ),
            DiscriminationObservation(
                load=Decimal("15.0"),
                initial_indication=Decimal("15.000"),
                final_indication=Decimal("15.000"),  # Stuck display!
            ),
        ]

        session = evaluate_discrimination_session(
            spec=standard_retail_spec,
            observations=observations,
        )

        assert session.overall_status == ComplianceStatus.FAIL
        assert session.all_points_passed is False
        assert session.failed_points_count == 1

    def test_discrimination_tuple_and_dict_inputs(self) -> None:
        """Verify dict and tuple formats for discrimination evaluation."""
        d = Decimal("2")
        e = Decimal("2")

        dict_obs = {
            "load": Decimal("50"),
            "initial_indication": Decimal("50"),
            "final_indication": Decimal("52"),
            "initial_delta_load": Decimal("0.5"),
            "final_delta_load": Decimal("0.5"),
            "notes": "Testing dict input",
        }
        pt_dict = evaluate_discrimination_point(dict_obs, d=d, e=e)
        assert pt_dict.status == ComplianceStatus.PASS
        assert pt_dict.notes == "Testing dict input"

        tuple_obs = (Decimal("50"), Decimal("50"), Decimal("52"))
        pt_tuple = evaluate_discrimination_point(tuple_obs, d=d)
        assert pt_tuple.status == ComplianceStatus.PASS
        assert pt_tuple.effective_change == Decimal("2")

    def test_discrimination_turning_point_fail(self) -> None:
        """When turning point delta P < 1.0d -> FAIL."""
        d = Decimal("5")
        e = Decimal("5")
        # P_1 = 1000 + 2.5 - 0.5 = 1002.0
        # P_2 = 1000 + 2.5 - 2.0 = 1000.5
        # Delta P = -1.5 < 5.0 -> FAIL
        obs = DiscriminationObservation(
            load=Decimal("1000"),
            initial_indication=Decimal("1000"),
            final_indication=Decimal("1000"),
            initial_delta_load=Decimal("0.5"),
            final_delta_load=Decimal("2.0"),
        )
        pt = evaluate_discrimination_point(obs, d=d, e=e)
        assert pt.status == ComplianceStatus.FAIL
        assert pt.effective_change == Decimal("-1.5")

    def test_discrimination_input_validations(self) -> None:
        """Verify bounds checking on discrimination parameters."""
        with pytest.raises(ValueError, match="Scale interval d must be > 0"):
            calculate_discrimination_extra_load(d=Decimal("0"))

        with pytest.raises(ValueError, match="Discrimination factor must be > 0"):
            calculate_discrimination_extra_load(d=Decimal("1"), factor=Decimal("-1"))

        with pytest.raises(ValueError, match="Scale interval d must be > 0"):
            evaluate_discrimination_point(
                {
                    "load": Decimal("10"),
                    "initial_indication": Decimal("10"),
                    "final_indication": Decimal("12"),
                },
                d=Decimal("0"),
            )

        with pytest.raises(ValueError, match="Verification interval e must be > 0"):
            evaluate_discrimination_point(
                {
                    "load": Decimal("10"),
                    "initial_indication": Decimal("10"),
                    "final_indication": Decimal("12"),
                },
                d=Decimal("1"),
                e=Decimal("0"),
            )

        with pytest.raises(TypeError, match="Unsupported discrimination observation type"):
            evaluate_discrimination_point(12345, d=Decimal("1"))  # type: ignore[arg-type]


# ============================================================================
# 7. Advanced Metrological Scenarios: In-Service Doubling & 2026 Draft
# ============================================================================


class TestAdvancedRepeatabilityScenarios:
    """Verify in-service doubling, 2026 draft RulePack tightening, and boundary margins."""

    def test_in_service_doubled_mpe_allows_higher_spread(
        self, standard_retail_spec: InstrumentSpecification
    ) -> None:
        """In subsequent in-service verification, MPE is doubled (2.0 e instead of 1.0 e).

        A spread of 0.008 kg fails initial verification (MPE = 0.005 kg),
        but passes in-service inspection (MPE = 0.010 kg).
        """
        nominal_load = Decimal("7.5")
        e = standard_retail_spec.e  # 0.005 kg

        # 6 runs for in-service: indications fluctuate between 7.496 and 7.504 kg
        # (spread = 0.008 kg)
        run_data = [
            (1, nominal_load, Decimal("7.496"), Decimal("0.0025")),  # P = 7.496, E = -0.004
            (2, nominal_load, Decimal("7.504"), Decimal("0.0025")),  # P = 7.504, E = +0.004
            (3, nominal_load, Decimal("7.500"), Decimal("0.0025")),  # P = 7.500, E = 0.000
            (4, nominal_load, Decimal("7.498"), Decimal("0.0025")),  # P = 7.498, E = -0.002
            (5, nominal_load, Decimal("7.502"), Decimal("0.0025")),  # P = 7.502, E = +0.002
            (6, nominal_load, Decimal("7.500"), Decimal("0.0025")),  # P = 7.500, E = 0.000
        ]

        # 1. Initial Verification: fails because spread 0.008 kg > 0.005 kg
        res_initial = evaluate_repeatability_series(
            runs=run_data,
            nominal_load=nominal_load,
            e=e,
            accuracy_class=AccuracyClass.CLASS_III,
            stage=VerificationStage.INITIAL_TYPE_APPROVAL,
        )
        assert res_initial.mpe_limit == Decimal("0.005")
        assert res_initial.spread_status == ComplianceStatus.FAIL

        # 2. Subsequent In-Service: passes because doubled MPE = 0.010 kg >= 0.008 kg
        res_in_service = evaluate_repeatability_series(
            runs=run_data,
            nominal_load=nominal_load,
            e=e,
            accuracy_class=AccuracyClass.CLASS_III,
            stage=VerificationStage.SUBSEQUENT_IN_SERVICE,
        )
        assert res_in_service.mpe_limit == Decimal("0.010")
        assert res_in_service.allowable_spread == Decimal("0.010")
        assert res_in_service.error_spread == Decimal("0.0080")
        assert res_in_service.spread_status == ComplianceStatus.PASS
        assert res_in_service.overall_status == ComplianceStatus.PASS

    def test_oiml_2026_revision_draft_tightened_repeatability_fraction(
        self, standard_retail_spec: InstrumentSpecification
    ) -> None:
        """2026 Revision Draft tightens repeatability allowable spread to 0.8 * |MPE|.

        MPE = 0.005 kg.
        2006 allowable spread = 1.0 * 0.005 = 0.0050 kg.
        2026 draft allowable spread = 0.8 * 0.005 = 0.0040 kg.
        A spread of 0.0045 kg passes under 2006, but FAILS under 2026 Revision Draft.
        """
        rp_manager = default_rulepack_manager
        rp_2006 = rp_manager.get_rulepack("oiml_r76_2006")
        rp_2026 = rp_manager.get_rulepack("oiml_r76_2026_draft")

        nominal_load = Decimal("7.5")
        e = standard_retail_spec.e

        # Spread of 0.0045 kg
        run_data = [
            (1, nominal_load, Decimal("7.500"), Decimal("0.0025")),  # E = 0.0000
            (2, nominal_load, Decimal("7.5045"), Decimal("0.0025")),  # E = +0.0045
            (3, nominal_load, Decimal("7.500"), Decimal("0.0025")),  # E = 0.0000
        ]

        # Passes under 2006 (fraction 1.0)
        res_2006 = evaluate_repeatability_series(
            runs=run_data,
            nominal_load=nominal_load,
            e=e,
            accuracy_class=AccuracyClass.CLASS_III,
            rulepack=rp_2006,
        )
        assert res_2006.allowable_spread == Decimal("0.0050")
        assert res_2006.error_spread == Decimal("0.0045")
        assert res_2006.spread_status == ComplianceStatus.PASS

        # Fails under 2026 Draft (fraction 0.8 -> 0.0040 kg)
        res_2026 = evaluate_repeatability_series(
            runs=run_data,
            nominal_load=nominal_load,
            e=e,
            accuracy_class=AccuracyClass.CLASS_III,
            rulepack=rp_2026,
        )
        assert res_2026.allowable_spread == Decimal("0.0040")
        assert res_2026.error_spread == Decimal("0.0045")
        assert res_2026.spread_status == ComplianceStatus.FAIL

    def test_repeatability_run_and_series_marginal_boundary(self) -> None:
        """Exactly on MPE boundary: margin == 0 -> MARGINAL."""
        e = Decimal("10")
        # Run exactly at MPE limit (load = 500, e = 10, Table 6 MPE = 5, E_c = 5)
        ev_run = evaluate_repeatability_run(
            run_number=1,
            load=Decimal("500"),
            indication=Decimal("505"),
            e=e,
            delta_load=Decimal("5"),  # P = 505 + 5 - 5 = 505, E = 505 - 500 = 5 = MPE
            zero_error=Decimal("0"),
        )
        assert ev_run.corrected_error == Decimal("5")
        assert ev_run.margin == Decimal("0")
        assert ev_run.status == ComplianceStatus.MARGINAL

    def test_repeatability_input_validations(self) -> None:
        """Verify parameter bounds and type handling."""
        with pytest.raises(ValueError, match="Verification scale interval e must be > 0"):
            evaluate_repeatability_run(
                run_number=1,
                load=Decimal("10"),
                indication=Decimal("10"),
                e=Decimal("0"),
            )

        with pytest.raises(ValueError, match="delta_load .* must be within"):
            evaluate_repeatability_run(
                run_number=1,
                load=Decimal("10"),
                indication=Decimal("10"),
                e=Decimal("5"),
                delta_load=Decimal("10"),
            )

        with pytest.raises(ValueError, match="Verification scale interval e must be > 0"):
            evaluate_repeatability_substitution(
                error_spread=Decimal("1"),
                standard_deviation=Decimal("1"),
                e=Decimal("0"),
            )

        with pytest.raises(ValueError, match="at least one series"):
            evaluate_repeatability_session(
                spec=InstrumentSpecification(
                    model_name="Test",
                    accuracy_class=AccuracyClass.CLASS_III,
                    max_capacity=Decimal("10"),
                    min_capacity=Decimal("0.1"),
                    e=Decimal("0.01"),
                    d=Decimal("0.01"),
                ),
                series_data=[],
            )

        with pytest.raises(TypeError, match="Unsupported run item format"):
            evaluate_repeatability_series(
                runs=["bad_type", "another_bad", "third_bad"],  # type: ignore[list-item]
                nominal_load=Decimal("10"),
                e=Decimal("1"),
            )
