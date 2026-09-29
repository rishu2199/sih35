"""
METROLOGIX-76 — Unit Tests for Digital Changeover Point & Error Correction Math Engine.

Statutory Basis:
- OIML R 76-1:2006 Clause A.4.4.3
- Legal Metrology (General) Rules, 2011 (Seventh Schedule)

Verifies:
1. Verification Test Gate: Textbook changeover calculation
   L = 10000.0, I = 10000.0, e = 5.0, Delta L = 1.5, E_0 = +0.5
   => P = 10001.0, E = +1.0, E_c = +0.5.
2. Pure mathematical functions (calculate_changeover, calculate_uncorrected_error,
   calculate_zero_error, calculate_corrected_error).
3. Zero-bug boundary enforcement: Delta L in [0, e], e > 0.
4. Multiscale coverage: microbalance (mg), retail platform (kg), weighbridge (tonnes).
5. ObservationPoint integration & full ascending test series evaluation.
6. Mathematical explanation strings and LaTeX rendering.
"""

from decimal import Decimal

import pytest
from pydantic import ValidationError

from app.core.changeover_engine import (
    STATUTORY_CITATION_A443,
    ChangeoverResult,
    ChangeoverSeriesResult,
    calculate_changeover,
    calculate_corrected_error,
    calculate_uncorrected_error,
    calculate_zero_error,
    compute_changeover_point,
    compute_observation_changeover,
    evaluate_observation_series,
)
from app.core.schemas import ObservationPoint

# ============================================================================
# 1. Statutory Verification Test Gate (Roadmap Specification)
# ============================================================================


class TestChangeoverRoadmapGate:
    """Verifies the mandatory textbook example specified in the Roadmap and OIML R 76-1."""

    def test_textbook_changeover_example(self) -> None:
        """
        Textbook Gate:
        L = 10000.0 g
        I = 10000.0 g
        e = 5.0 g
        Delta L = 1.5 g
        E_0 = +0.5 g
        => P = 10000 + 2.5 - 1.5 = 10001.0 g
        => E = 10001.0 - 10000.0 = +1.0 g
        => E_c = +1.0 - (+0.5) = +0.5 g
        """
        load = Decimal("10000.0")
        indication = Decimal("10000.0")
        e = Decimal("5.0")
        delta_l = Decimal("1.5")
        zero_error = Decimal("0.5")

        res = compute_changeover_point(
            load=load,
            indication=indication,
            e=e,
            delta_load=delta_l,
            zero_error=zero_error,
        )

        assert isinstance(res, ChangeoverResult)
        assert res.load == Decimal("10000.0")
        assert res.indication == Decimal("10000.0")
        assert res.e == Decimal("5.0")
        assert res.delta_load == Decimal("1.5")
        assert res.zero_error == Decimal("0.5")

        # Core metrological values
        assert res.rounding_correction == Decimal("1.0")  # (0.5 * 5.0) - 1.5 = 2.5 - 1.5 = 1.0
        assert res.p_true_indication == Decimal("10001.0")
        assert res.uncorrected_error == Decimal("1.0")
        assert res.corrected_error == Decimal("0.5")

        # Shorthand alias properties
        assert res.P == Decimal("10001.0")
        assert res.E == Decimal("1.0")
        assert res.E_c == Decimal("0.5")
        assert res.E_0 == Decimal("0.5")

        # LaTeX formula keys
        assert "P" in res.formula_latex
        assert "E" in res.formula_latex
        assert "E_c" in res.formula_latex
        assert "rounding" in res.formula_latex

        # Explanation strings
        assert len(res.step_by_step_explanation) == 4
        assert any(
            "Step 1 (Digital Rounding Correction)" in s for s in res.step_by_step_explanation
        )
        assert any(
            "Step 2 (Unrounded True Indication P)" in s for s in res.step_by_step_explanation
        )
        assert any(
            "Step 3 (Uncorrected Error of Indication E)" in s for s in res.step_by_step_explanation
        )
        assert any(
            "Step 4 (Zero-Load Elimination E_c)" in s for s in res.step_by_step_explanation
        )
        assert res.statutory_citation == STATUTORY_CITATION_A443


# ============================================================================
# 2. Pure Mathematical Functions & Physical Edge Cases
# ============================================================================


class TestPureChangeoverMathFunctions:
    """Verifies each pure helper function independently for exactness and boundary conditions."""

    def test_calculate_changeover_delta_l_zero(self) -> None:
        """When Delta L = 0, the load sits right on the upper switching edge: P = I + 0.5e."""
        i = Decimal("500")
        e = Decimal("10")
        delta_l = Decimal("0")
        p = calculate_changeover(i, e, delta_l)
        assert p == Decimal("505.0")

    def test_calculate_changeover_delta_l_half_e(self) -> None:
        """When Delta L = 0.5e, the actual load matches discrete indication exactly: P = I."""
        i = Decimal("100")
        e = Decimal("2")
        delta_l = Decimal("1")  # 0.5 * 2 = 1
        p = calculate_changeover(i, e, delta_l)
        assert p == Decimal("100.0")

    def test_calculate_changeover_delta_l_equals_e(self) -> None:
        """When Delta L = e, the load was at the lower boundary of indication: P = I - 0.5e."""
        i = Decimal("1000")
        e = Decimal("5")
        delta_l = Decimal("5")
        p = calculate_changeover(i, e, delta_l)
        assert p == Decimal("997.5")

    def test_calculate_uncorrected_error_signs(self) -> None:
        """E = P - L can be positive, zero, or negative."""
        # Over-indicating: P > L
        assert calculate_uncorrected_error(Decimal("100.2"), Decimal("100.0")) == Decimal("0.2")
        # Exact: P == L
        assert calculate_uncorrected_error(Decimal("100.0"), Decimal("100.0")) == Decimal("0.0")
        # Under-indicating: P < L
        assert calculate_uncorrected_error(Decimal("99.8"), Decimal("100.0")) == Decimal("-0.2")

    def test_calculate_zero_error(self) -> None:
        """
        Zero error E_0 at no-load:
        I_0 = 0 g, e = 2 g, Delta L_0 = 0.8 g
        P_0 = 0 + 1.0 - 0.8 = 0.2 g
        E_0 = 0.2 - 0 = +0.2 g
        """
        e_0 = calculate_zero_error(
            indication_at_zero=Decimal("0"),
            e=Decimal("2"),
            delta_load_at_zero=Decimal("0.8"),
        )
        assert e_0 == Decimal("0.2")

    def test_calculate_corrected_error_cancellation(self) -> None:
        """E_c = E - E_0 successfully cancels initial zero shift."""
        # Scenario 1: both positive
        assert calculate_corrected_error(Decimal("1.5"), Decimal("0.5")) == Decimal("1.0")
        # Scenario 2: zero error was negative (-0.2 g)
        assert calculate_corrected_error(Decimal("0.8"), Decimal("-0.2")) == Decimal("1.0")
        # Scenario 3: uncorrected error equals zero error => corrected error is 0
        assert calculate_corrected_error(Decimal("0.4"), Decimal("0.4")) == Decimal("0.0")


# ============================================================================
# 3. Zero-Bug Boundary Validations & Exception Handling
# ============================================================================


class TestChangeoverBoundariesAndExceptions:
    """Verifies that non-physical or illegal metrological inputs are strictly rejected."""

    def test_reject_negative_e(self) -> None:
        with pytest.raises(ValueError, match="strictly positive"):
            calculate_changeover(Decimal("100"), Decimal("-1"), Decimal("0.5"))

    def test_reject_zero_e(self) -> None:
        with pytest.raises(ValueError, match="strictly positive"):
            calculate_changeover(Decimal("100"), Decimal("0"), Decimal("0"))

    def test_reject_negative_delta_l(self) -> None:
        with pytest.raises(ValueError, match="cannot be negative"):
            calculate_changeover(Decimal("100"), Decimal("2"), Decimal("-0.1"))

    def test_reject_delta_l_exceeding_e(self) -> None:
        """Delta L cannot exceed e under OIML changeover testing."""
        with pytest.raises(ValueError, match="cannot exceed verification interval e"):
            calculate_changeover(Decimal("100"), Decimal("2"), Decimal("2.1"))

    def test_changeover_result_inconsistency_guard(self) -> None:
        """Model validator rejects tampered internal arithmetic in ChangeoverResult."""
        with pytest.raises(ValidationError):
            ChangeoverResult(
                load=Decimal("100"),
                indication=Decimal("100"),
                e=Decimal("2"),
                delta_load=Decimal("0.5"),
                zero_error=Decimal("0"),
                p_true_indication=Decimal("999.0"),  # Wrong! Expected 100.5
                uncorrected_error=Decimal("0.5"),
                corrected_error=Decimal("0.5"),
                rounding_correction=Decimal("0.5"),
                formula_latex={},
                step_by_step_explanation=[],
            )


# ============================================================================
# 4. Multiscale Real-World Instrumentation Scenarios
# ============================================================================


class TestMultiscaleChangeoverScenarios:
    """Tests high-precision analytical balances (mg) to heavy weighbridges (tonnes)."""

    def test_class_i_microbalance_milligram_precision(self) -> None:
        """
        Class I Microbalance:
        L = 0.0500 g (50 mg)
        I = 0.0500 g
        e = 0.001 g (1 mg)
        Delta L = 0.0002 g (0.2 mg)
        E_0 = 0.0001 g (0.1 mg)

        0.5e = 0.0005 g
        Rounding corr = 0.0005 - 0.0002 = +0.0003 g
        P = 0.0500 + 0.0003 = 0.0503 g
        E = 0.0503 - 0.0500 = +0.0003 g
        E_c = +0.0003 - 0.0001 = +0.0002 g
        """
        res = compute_changeover_point(
            load=Decimal("0.0500"),
            indication=Decimal("0.0500"),
            e=Decimal("0.001"),
            delta_load=Decimal("0.0002"),
            zero_error=Decimal("0.0001"),
        )
        assert res.P == Decimal("0.0503")
        assert res.E == Decimal("0.0003")
        assert res.E_c == Decimal("0.0002")

    def test_class_iii_heavy_weighbridge_tonnes(self) -> None:
        """
        Class III Weighbridge:
        L = 60.00 t
        I = 60.00 t
        e = 0.02 t (20 kg)
        Delta L = 0.006 t (6 kg)
        E_0 = 0.004 t (4 kg)

        0.5e = 0.010 t
        Rounding corr = 0.010 - 0.006 = +0.004 t
        P = 60.00 + 0.004 = 60.004 t
        E = 60.004 - 60.00 = +0.004 t
        E_c = 0.004 - 0.004 = 0.000 t
        """
        res = compute_changeover_point(
            load=Decimal("60.00"),
            indication=Decimal("60.00"),
            e=Decimal("0.02"),
            delta_load=Decimal("0.006"),
            zero_error=Decimal("0.004"),
        )
        assert res.P == Decimal("60.004")
        assert res.E == Decimal("0.004")
        assert res.E_c == Decimal("0.000")


# ============================================================================
# 5. ObservationPoint Integration & Full Test Series Evaluation
# ============================================================================


class TestObservationSeriesEvaluation:
    """Verifies batch evaluation of test runs and automated zero-error calibration."""

    def test_compute_from_observation_point(self) -> None:
        point = ObservationPoint(
            load=Decimal("5000"),
            indication=Decimal("5000"),
            delta_load=Decimal("1.2"),
            e=Decimal("5.0"),
        )
        res = compute_observation_changeover(point, zero_error=Decimal("0.3"))
        # 0.5 * 5.0 - 1.2 = 2.5 - 1.2 = 1.3
        assert res.P == Decimal("5001.3")
        assert res.E == Decimal("1.3")
        assert res.E_c == Decimal("1.0")

    def test_compute_observation_point_fallback_e(self) -> None:
        point = ObservationPoint(
            load=Decimal("200"),
            indication=Decimal("200"),
            delta_load=Decimal("0.4"),
            e=None,  # No e on point
        )
        res = compute_observation_changeover(
            point,
            zero_error=Decimal("0.1"),
            fallback_e=Decimal("1.0"),
        )
        # 0.5 * 1.0 - 0.4 = 0.1
        assert res.P == Decimal("200.1")
        assert res.E == Decimal("0.1")
        assert res.E_c == Decimal("0.0")

    def test_reject_observation_point_without_e(self) -> None:
        point = ObservationPoint(
            load=Decimal("200"),
            indication=Decimal("200"),
            delta_load=Decimal("0.4"),
            e=None,
        )
        with pytest.raises(ValueError, match="Verification scale interval e must be provided"):
            compute_observation_changeover(point, fallback_e=None)

    def test_evaluate_complete_observation_series(self) -> None:
        """
        Ascending verification test run:
        - Point 0 (Zero Load): L = 0, I = 0, delta_L = 0.6, e = 2.0
          => P_0 = 0 + 1.0 - 0.6 = 0.4 => E_0 = +0.4
        - Point 1 (Min = 40): L = 40, I = 40, delta_L = 1.0, e = 2.0
          => P = 40 + 1.0 - 1.0 = 40.0 => E = 0.0 => E_c = 0.0 - 0.4 = -0.4
        - Point 2 (500e = 1000): L = 1000, I = 1000, delta_L = 0.4, e = 2.0
          => P = 1000 + 1.0 - 0.4 = 1000.6 => E = +0.6 => E_c = +0.6 - 0.4 = +0.2
        - Point 3 (Max = 6000): L = 6000, I = 6000, delta_L = 0.2, e = 2.0
          => P = 6000 + 1.0 - 0.2 = 6000.8 => E = +0.8 => E_c = +0.8 - 0.4 = +0.4
        """
        points = [
            ObservationPoint(
                load=Decimal("0"),
                indication=Decimal("0"),
                delta_load=Decimal("0.6"),
                e=Decimal("2.0"),
            ),
            ObservationPoint(
                load=Decimal("40"),
                indication=Decimal("40"),
                delta_load=Decimal("1.0"),
                e=Decimal("2.0"),
            ),
            ObservationPoint(
                load=Decimal("1000"),
                indication=Decimal("1000"),
                delta_load=Decimal("0.4"),
                e=Decimal("2.0"),
            ),
            ObservationPoint(
                load=Decimal("6000"),
                indication=Decimal("6000"),
                delta_load=Decimal("0.2"),
                e=Decimal("2.0"),
            ),
        ]

        series_res = evaluate_observation_series(points)

        assert isinstance(series_res, ChangeoverSeriesResult)
        assert series_res.zero_error == Decimal("0.4")
        assert len(series_res.observations) == 4

        # Point 0
        assert series_res.observations[0].E == Decimal("0.4")
        assert series_res.observations[0].E_c == Decimal("0.0")

        # Point 1
        assert series_res.observations[1].E == Decimal("0.0")
        assert series_res.observations[1].E_c == Decimal("-0.4")

        # Point 2
        assert series_res.observations[2].E == Decimal("0.6")
        assert series_res.observations[2].E_c == Decimal("0.2")

        # Point 3
        assert series_res.observations[3].E == Decimal("0.8")
        assert series_res.observations[3].E_c == Decimal("0.4")

        # Span statistics: max = +0.4, min = -0.4 => span = 0.8
        assert series_res.max_corrected_error == Decimal("0.4")
        assert series_res.min_corrected_error == Decimal("-0.4")
        assert series_res.error_span == Decimal("0.8")

    def test_evaluate_series_empty_list_rejected(self) -> None:
        with pytest.raises(ValueError, match="Cannot evaluate changeover series on an empty"):
            evaluate_observation_series([])
