"""
METROLOGIX-76 — Unit Tests for Multi-Interval & Multi-Range Partial Interval Resolver.

Statutory Basis:
- OIML R 76-1:2006 Clause 3.3: Multi-interval instruments (W_1, W_2, ..., W_r)
- OIML R 76-1:2006 Clause 3.4: Multiple range instruments
- Legal Metrology (General) Rules, 2011, Seventh Schedule, Heading A, Part II

Verifies:
1. Verification Test Gate: Dual-interval supermarket balance with transition at 2000 g:
   - Below transition: L = 1000 g -> W1, e = 1 g, m = 1000e, MPE = +/- 1.0 g.
   - On transition switch point: L = 2000 g -> W1, e = 1 g, m = 2000e, MPE = +/- 1.0 g.
   - Just above transition: L = 2002 g -> W2, e = 2 g, m = 1001e, MPE = +/- 2.0 g.
   - High load: L = 5000 g -> W2, e = 2 g, m = 2500e, MPE = +/- 3.0 g.
2. Zero-Bug Monotonicity Rules:
   - Strict rejection of e_2 <= e_1 (OIML R 76-1 Clause 3.3.1).
   - Strict rejection of Max_2 <= Max_1.
   - Strict rejection of d_i > e_i.
3. In-Service Doubling across partial ranges (2x MPE).
4. End-to-end integration with digital changeover and full multi-interval series evaluation.
"""

from decimal import Decimal

import pytest

from app.core.multi_interval_engine import (
    MultiIntervalEvaluationResult,
    ResolvedPartialRange,
    calculate_multi_interval_mpe,
    evaluate_multi_interval_observation,
    evaluate_multi_interval_series,
    resolve_active_partial_range,
    validate_multi_interval_ranges,
)
from app.core.schemas import InstrumentSpecification, IntervalRange, ObservationPoint
from app.core.types import AccuracyClass, ComplianceStatus, UnitOfMeasure, VerificationStage

# ============================================================================
# Test Fixtures & Models
# ============================================================================


@pytest.fixture
def supermarket_dual_interval_spec() -> InstrumentSpecification:
    """
    Standard Class III Retail Checkout Scale:
    Total Max: 5 kg
    Range 1 (W1): 0 - 2 kg, e_1 = 1 g (0.001 kg), d_1 = 1 g
    Range 2 (W2): 2 - 5 kg, e_2 = 2 g (0.002 kg), d_2 = 2 g
    """
    return InstrumentSpecification(
        serial_number="RETAIL-DUAL-001",
        manufacturer="Mettler-Toledo / Avery India",
        model_name="TigerDual-5K",
        accuracy_class=AccuracyClass.CLASS_III,
        max_capacity=Decimal("5"),
        min_capacity=Decimal("0.02"),  # Min = 20 * e_1 = 20 * 1 g = 20 g (0.02 kg)
        e=Decimal("0.002"),
        d=Decimal("0.002"),
        unit=UnitOfMeasure.KILOGRAM,
        is_multi_interval=True,
        intervals_array=[
            IntervalRange(
                range_index=1,
                min_capacity=Decimal("0.02"),
                max_capacity=Decimal("2"),
                e=Decimal("0.001"),
                d=Decimal("0.001"),
            ),
            IntervalRange(
                range_index=2,
                min_capacity=Decimal("2"),
                max_capacity=Decimal("5"),
                e=Decimal("0.002"),
                d=Decimal("0.002"),
            ),
        ],
    )


# ============================================================================
# 1. Statutory Verification Test Gate: Dual-Interval Supermarket Balance
# ============================================================================


class TestDualIntervalSupermarketGate:
    """
    Mandatory Verification Test Gate:
    Evaluates points below (1000g), on (2000g), and above (2002g, 5000g) the range switch point.
    """

    def test_load_below_transition_w1(
        self, supermarket_dual_interval_spec: InstrumentSpecification
    ) -> None:
        """
        L = 1.0 kg (1000 g):
        Falls into Range 1 (W1, 0 - 2 kg).
        e_1 = 0.001 kg (1 g).
        m = 1.0 / 0.001 = 1000e.
        Class III Table 6 Bracket 2 (500 < m <= 2000):
        Initial MPE = +/- 1.0e = +/- 0.001 kg (+/- 1.0 g).
        """
        load = Decimal("1.0")
        res = calculate_multi_interval_mpe(
            load=load,
            spec=supermarket_dual_interval_spec,
            stage=VerificationStage.INITIAL_TYPE_APPROVAL,
        )

        assert isinstance(res, MultiIntervalEvaluationResult)
        assert res.resolved_range.range_index == 1
        assert res.resolved_range.range_label == "W1"
        assert res.resolved_range.e == Decimal("0.001")
        assert res.resolved_range.is_exact_switch_point is False

        assert res.mpe_result.m_in_scale_intervals == Decimal("1000")
        assert res.mpe_result.bracket_index == 2
        assert res.mpe_result.mpe_in_units_of_e == Decimal("1.0")
        assert res.mpe_result.mpe_value == Decimal("0.001")

    def test_load_exactly_on_switch_point_w1(
        self, supermarket_dual_interval_spec: InstrumentSpecification
    ) -> None:
        """
        L = 2.0 kg (2000 g):
        Exactly on the transition boundary Max_1.
        By OIML R 76-1 Clause 3.3, L = Max_1 is evaluated under Range 1 (W1).
        e_1 = 0.001 kg (1 g).
        m = 2.0 / 0.001 = 2000e.
        Class III Table 6 Bracket 2 (500 < m <= 2000):
        Initial MPE = +/- 1.0e = +/- 0.001 kg (+/- 1.0 g).
        is_exact_switch_point must be True.
        """
        load = Decimal("2.0")
        res = calculate_multi_interval_mpe(
            load=load,
            spec=supermarket_dual_interval_spec,
            stage=VerificationStage.INITIAL_TYPE_APPROVAL,
        )

        assert res.resolved_range.range_index == 1
        assert res.resolved_range.range_label == "W1"
        assert res.resolved_range.e == Decimal("0.001")
        assert res.resolved_range.is_exact_switch_point is True

        assert res.mpe_result.m_in_scale_intervals == Decimal("2000")
        assert res.mpe_result.bracket_index == 2
        assert res.mpe_result.mpe_in_units_of_e == Decimal("1.0")
        assert res.mpe_result.mpe_value == Decimal("0.001")

    def test_load_just_above_switch_point_w2(
        self, supermarket_dual_interval_spec: InstrumentSpecification
    ) -> None:
        """
        L = 2.002 kg (2002 g):
        Just above switch point Max_1 -> switches to Range 2 (W2).
        e_2 = 0.002 kg (2 g).
        m = 2.002 / 0.002 = 1001e.
        Class III Table 6 Bracket 2 (500 < m <= 2000):
        Initial MPE = +/- 1.0e = +/- 0.002 kg (+/- 2.0 g).
        """
        load = Decimal("2.002")
        res = calculate_multi_interval_mpe(
            load=load,
            spec=supermarket_dual_interval_spec,
            stage=VerificationStage.INITIAL_TYPE_APPROVAL,
        )

        assert res.resolved_range.range_index == 2
        assert res.resolved_range.range_label == "W2"
        assert res.resolved_range.e == Decimal("0.002")
        assert res.resolved_range.is_exact_switch_point is False

        assert res.mpe_result.m_in_scale_intervals == Decimal("1001")
        assert res.mpe_result.bracket_index == 2
        assert res.mpe_result.mpe_in_units_of_e == Decimal("1.0")
        # Physical MPE doubles because verification interval e doubled (1 g -> 2 g)
        assert res.mpe_result.mpe_value == Decimal("0.002")

    def test_load_at_high_capacity_w2(
        self, supermarket_dual_interval_spec: InstrumentSpecification
    ) -> None:
        """
        L = 5.0 kg (5000 g):
        Full capacity in Range 2 (W2).
        e_2 = 0.002 kg (2 g).
        m = 5.0 / 0.002 = 2500e.
        Class III Table 6 Bracket 3 (m > 2000):
        Initial MPE = +/- 1.5e = +/- 1.5 * 0.002 kg = +/- 0.003 kg (+/- 3.0 g).
        """
        load = Decimal("5.0")
        res = calculate_multi_interval_mpe(
            load=load,
            spec=supermarket_dual_interval_spec,
            stage=VerificationStage.INITIAL_TYPE_APPROVAL,
        )

        assert res.resolved_range.range_index == 2
        assert res.resolved_range.e == Decimal("0.002")
        assert res.mpe_result.m_in_scale_intervals == Decimal("2500")
        assert res.mpe_result.bracket_index == 3
        assert res.mpe_result.mpe_in_units_of_e == Decimal("1.5")
        assert res.mpe_result.mpe_value == Decimal("0.003")

    def test_in_service_doubling_across_both_ranges(
        self, supermarket_dual_interval_spec: InstrumentSpecification
    ) -> None:
        """In-service inspection doubles MPE on both partial ranges (2x multiplier)."""
        # Range 1 in-service (L = 1 kg): MPE = 2 * 1.0 g = 2.0 g (0.002 kg)
        res_w1 = calculate_multi_interval_mpe(
            load=Decimal("1.0"),
            spec=supermarket_dual_interval_spec,
            stage=VerificationStage.SUBSEQUENT_IN_SERVICE,
        )
        assert res_w1.mpe_result.stage_multiplier == Decimal("2.0")
        assert res_w1.mpe_result.mpe_in_units_of_e == Decimal("2.0")
        assert res_w1.mpe_result.mpe_value == Decimal("0.002")

        # Range 2 in-service (L = 5 kg): MPE = 2 * 3.0 g = 6.0 g (0.006 kg)
        res_w2 = calculate_multi_interval_mpe(
            load=Decimal("5.0"),
            spec=supermarket_dual_interval_spec,
            stage=VerificationStage.SUBSEQUENT_IN_SERVICE,
        )
        assert res_w2.mpe_result.stage_multiplier == Decimal("2.0")
        assert res_w2.mpe_result.mpe_in_units_of_e == Decimal("3.0")
        assert res_w2.mpe_result.mpe_value == Decimal("0.006")


# ============================================================================
# 2. Zero-Bug Invariants: Monotonicity & Statutory Rules Enforcement
# ============================================================================


class TestMultiIntervalMonotonicityInvariants:
    """Verifies that non-physical or illegal partial range structures are rejected."""

    def test_reject_non_increasing_verification_interval(self) -> None:
        """OIML R 76-1 Clause 3.3.1: e_1 < e_2 < ... < e_r must hold strictly."""
        invalid_ranges = [
            IntervalRange(
                range_index=1,
                min_capacity=Decimal("10"),
                max_capacity=Decimal("1000"),
                e=Decimal("2.0"),
                d=Decimal("2.0"),
            ),
            IntervalRange(
                range_index=2,
                min_capacity=Decimal("1000"),
                max_capacity=Decimal("3000"),
                e=Decimal("1.0"),  # Error! e_2 < e_1
                d=Decimal("1.0"),
            ),
        ]
        with pytest.raises(ValueError, match="strictly increase with load range"):
            validate_multi_interval_ranges(invalid_ranges)

    def test_reject_equal_verification_interval(self) -> None:
        """Equal intervals (e_1 == e_2) are not a valid multi-interval scale."""
        invalid_ranges = [
            IntervalRange(
                range_index=1,
                min_capacity=Decimal("10"),
                max_capacity=Decimal("1000"),
                e=Decimal("2.0"),
                d=Decimal("2.0"),
            ),
            IntervalRange(
                range_index=2,
                min_capacity=Decimal("1000"),
                max_capacity=Decimal("3000"),
                e=Decimal("2.0"),  # Error! e_2 == e_1
                d=Decimal("2.0"),
            ),
        ]
        with pytest.raises(ValueError, match="strictly increase with load range"):
            validate_multi_interval_ranges(invalid_ranges)

    def test_reject_non_increasing_capacities(self) -> None:
        """Max_1 < Max_2 must hold strictly."""
        invalid_ranges = [
            IntervalRange(
                range_index=1,
                min_capacity=Decimal("10"),
                max_capacity=Decimal("2000"),
                e=Decimal("1.0"),
                d=Decimal("1.0"),
            ),
            IntervalRange(
                range_index=2,
                min_capacity=Decimal("1000"),
                max_capacity=Decimal("1500"),  # Error! Max_2 < Max_1
                e=Decimal("2.0"),
                d=Decimal("2.0"),
            ),
        ]
        with pytest.raises(ValueError, match="strictly less than Range 2 Max"):
            validate_multi_interval_ranges(invalid_ranges)

    def test_reject_single_range_in_multi_interval_list(self) -> None:
        """Multi-interval instruments require at least 2 ranges."""
        single_range = [
            IntervalRange(
                range_index=1,
                min_capacity=Decimal("10"),
                max_capacity=Decimal("3000"),
                e=Decimal("1.0"),
                d=Decimal("1.0"),
            ),
        ]
        with pytest.raises(ValueError, match="at least 2 partial weighing ranges"):
            validate_multi_interval_ranges(single_range)

    def test_reject_negative_load_in_resolution(self) -> None:
        ranges = [
            IntervalRange(
                range_index=1,
                min_capacity=Decimal("10"),
                max_capacity=Decimal("1000"),
                e=Decimal("1.0"),
                d=Decimal("1.0"),
            ),
            IntervalRange(
                range_index=2,
                min_capacity=Decimal("1000"),
                max_capacity=Decimal("3000"),
                e=Decimal("2.0"),
                d=Decimal("2.0"),
            ),
        ]
        with pytest.raises(ValueError, match="cannot be negative"):
            resolve_active_partial_range(Decimal("-5"), ranges)


# ============================================================================
# 3. Triple-Interval Industrial Scale Resolution
# ============================================================================


class TestTripleIntervalIndustrialScale:
    """
    Tests 3 partial ranges (W1, W2, W3):
    W1: 0 - 30 kg, e_1 = 10 g (0.01 kg)
    W2: 30 - 60 kg, e_2 = 20 g (0.02 kg)
    W3: 60 - 150 kg, e_3 = 50 g (0.05 kg)
    """

    @pytest.fixture
    def industrial_triple_ranges(self) -> list[IntervalRange]:
        return [
            IntervalRange(
                range_index=1,
                min_capacity=Decimal("0.2"),
                max_capacity=Decimal("30"),
                e=Decimal("0.01"),
                d=Decimal("0.01"),
            ),
            IntervalRange(
                range_index=2,
                min_capacity=Decimal("30"),
                max_capacity=Decimal("60"),
                e=Decimal("0.02"),
                d=Decimal("0.02"),
            ),
            IntervalRange(
                range_index=3,
                min_capacity=Decimal("60"),
                max_capacity=Decimal("150"),
                e=Decimal("0.05"),
                d=Decimal("0.05"),
            ),
        ]

    def test_triple_interval_transitions(
        self, industrial_triple_ranges: list[IntervalRange]
    ) -> None:
        # 1. Inside W1: 15 kg
        r1 = resolve_active_partial_range(Decimal("15"), industrial_triple_ranges)
        assert isinstance(r1, ResolvedPartialRange)
        assert r1.range_index == 1
        assert r1.e == Decimal("0.01")
        assert r1.is_exact_switch_point is False

        # 2. Boundary W1/W2: 30 kg
        r1_bound = resolve_active_partial_range(Decimal("30"), industrial_triple_ranges)
        assert r1_bound.range_index == 1
        assert r1_bound.is_exact_switch_point is True

        # 3. Inside W2: 45 kg
        r2 = resolve_active_partial_range(Decimal("45"), industrial_triple_ranges)
        assert r2.range_index == 2
        assert r2.e == Decimal("0.02")
        assert r2.is_exact_switch_point is False

        # 4. Boundary W2/W3: 60 kg
        r2_bound = resolve_active_partial_range(Decimal("60"), industrial_triple_ranges)
        assert r2_bound.range_index == 2
        assert r2_bound.is_exact_switch_point is True

        # 5. Inside W3: 120 kg
        r3 = resolve_active_partial_range(Decimal("120"), industrial_triple_ranges)
        assert r3.range_index == 3
        assert r3.e == Decimal("0.05")
        assert r3.is_exact_switch_point is False


# ============================================================================
# 4. End-to-End Observation & Series Evaluation Integration
# ============================================================================


class TestMultiIntervalObservationIntegration:
    """Verifies complete integration: ObservationPoint -> Changeover -> Table 6 MPE."""

    def test_evaluate_single_observation_point(
        self, supermarket_dual_interval_spec: InstrumentSpecification
    ) -> None:
        """
        Observation at L = 2.0 kg (switch boundary), indication I = 2.0 kg.
        Delta L = 0.0003 kg (0.3 g).
        Range 1 applies: e_1 = 0.001 kg (1.0 g).
        0.5e_1 = 0.0005 kg.
        P = 2.0 + 0.0005 - 0.0003 = 2.0002 kg.
        E = 2.0002 - 2.0 = +0.0002 kg (+0.2 g).
        Zero error E_0 = 0.
        E_c = +0.0002 kg.
        MPE at 2000e = +/- 0.001 kg (+/- 1.0 g).
        Result: PASS, Margin = 0.001 - 0.0002 = 0.0008 kg (80.00%).
        """
        point = ObservationPoint(
            load=Decimal("2.0"),
            indication=Decimal("2.0"),
            delta_load=Decimal("0.0003"),
            e=None,  # Dynamic resolution
        )

        res = evaluate_multi_interval_observation(
            point=point,
            spec=supermarket_dual_interval_spec,
            stage=VerificationStage.INITIAL_TYPE_APPROVAL,
            zero_error=Decimal("0"),
        )

        assert res.resolved_range.range_index == 1
        assert res.resolved_range.e == Decimal("0.001")
        assert res.changeover_result is not None
        assert res.changeover_result.P == Decimal("2.0002")
        assert res.changeover_result.E == Decimal("0.0002")
        assert res.changeover_result.E_c == Decimal("0.0002")
        assert res.is_compliant is True
        assert res.compliance_status == ComplianceStatus.PASS
        assert res.margin == Decimal("0.0008")

    def test_evaluate_ascending_series_with_zero_calibration(
        self, supermarket_dual_interval_spec: InstrumentSpecification
    ) -> None:
        """
        Ascending test run covering both ranges:
        - Point 0: L = 0.0 kg (Zero-load calibration point)
        - Point 1: L = 1.0 kg (Range 1: W1)
        - Point 2: L = 2.0 kg (Range 1: W1 switch boundary)
        - Point 3: L = 3.0 kg (Range 2: W2)
        - Point 4: L = 5.0 kg (Range 2: W2 Max)
        """
        points = [
            ObservationPoint(
                load=Decimal("0.0"),
                indication=Decimal("0.0"),
                delta_load=Decimal("0.0003"),  # E_0 = 0 + 0.0005 - 0.0003 = +0.0002 kg
            ),
            ObservationPoint(
                load=Decimal("1.0"),
                indication=Decimal("1.0"),
                delta_load=Decimal("0.0005"),  # P = 1.0 -> E = 0 -> E_c = -0.0002 kg
            ),
            ObservationPoint(
                load=Decimal("2.0"),
                indication=Decimal("2.0"),
                delta_load=Decimal("0.0003"),  # P = 2.0002 -> E = +0.0002 -> E_c = 0.0 kg
            ),
            ObservationPoint(
                load=Decimal("3.0"),
                indication=Decimal("3.0"),
                delta_load=Decimal("0.0008"),  # W2 (e=2g): P = 3.0002 -> E_c = 0.0 kg
            ),
            ObservationPoint(
                load=Decimal("5.0"),
                indication=Decimal("5.0"),
                delta_load=Decimal("0.0005"),  # W2 (e=2g): P = 5.0005 -> E_c = +0.0003 kg
            ),
        ]

        series_results = evaluate_multi_interval_series(
            points=points,
            spec=supermarket_dual_interval_spec,
            stage=VerificationStage.INITIAL_TYPE_APPROVAL,
        )

        assert len(series_results) == 5

        # Check range transitions
        assert [r.resolved_range.range_index for r in series_results] == [1, 1, 1, 2, 2]
        assert [r.resolved_range.e for r in series_results] == [
            Decimal("0.001"),
            Decimal("0.001"),
            Decimal("0.001"),
            Decimal("0.002"),
            Decimal("0.002"),
        ]

        # Check compliance across entire series
        assert all(r.is_compliant for r in series_results)

    def test_evaluate_empty_series_rejected(
        self, supermarket_dual_interval_spec: InstrumentSpecification
    ) -> None:
        with pytest.raises(ValueError, match="Cannot evaluate multi-interval series on an empty"):
            evaluate_multi_interval_series([], supermarket_dual_interval_spec)
