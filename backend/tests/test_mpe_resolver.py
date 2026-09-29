"""
METROLOGIX-76 — Exhaustive Unit Tests for Stage-Aware MPE Resolver.

Statutory Basis:
- OIML R 76-1:2006 Clause 3.5.1, Table 6: Initial verification MPE step logic
- OIML R 76-1:2006 Clause 3.5.2: In-service inspection MPE doubling (2x)
- Legal Metrology (General) Rules, 2011, Seventh Schedule, Table 20 & Page 74

Verifies:
1. Zero magic numbers: all limits referenced from OIML_R76_TABLE_6_BRACKETS.
2. Boundary equality checks for loads at exact threshold boundaries:
   Class III: 499.99e, 500.00e, 500.01e, 1999.99e, 2000.00e, 2000.01e.
3. Complete coverage of all 4 Accuracy Classes (Class I, II, III, IIII).
4. Stage awareness: Initial Type Approval (1x) vs Subsequent In-Service (2x doubling).
5. Compliance margin and Pass/Fail/Marginal deterministic evaluation.
6. Seamless bridge with Step 04 ChangeoverResult and Step 02 InstrumentSpecification.
"""

from decimal import Decimal

import pytest
from pydantic import ValidationError

from app.core.changeover_engine import compute_changeover_point
from app.core.mpe_resolver import (
    OIML_R76_TABLE_6_BRACKETS,
    EvaluatedObservation,
    MPEBracketTier,
    MPEResult,
    calculate_mpe,
    evaluate_changeover_with_mpe,
    resolve_mpe_bracket,
    resolve_mpe_for_specification,
)
from app.core.schemas import InstrumentSpecification, IntervalRange
from app.core.types import AccuracyClass, ComplianceStatus, UnitOfMeasure, VerificationStage

# ============================================================================
# 1. Statutory Table Structure & Immutability Tests
# ============================================================================


class TestTable6StructureAndImmutability:
    """Verifies that Table 6 brackets are complete and strictly immutable."""

    def test_table_contains_all_four_classes(self) -> None:
        classes = {b.accuracy_class for b in OIML_R76_TABLE_6_BRACKETS}
        assert classes == {
            AccuracyClass.CLASS_I,
            AccuracyClass.CLASS_II,
            AccuracyClass.CLASS_III,
            AccuracyClass.CLASS_IIII,
        }

    def test_every_class_has_exactly_three_brackets(self) -> None:
        for acc_class in AccuracyClass:
            class_brackets = [
                b for b in OIML_R76_TABLE_6_BRACKETS if b.accuracy_class == acc_class
            ]
            assert len(class_brackets) == 3
            assert [b.bracket_index for b in class_brackets] == [1, 2, 3]
            assert [b.base_mpe_factor for b in class_brackets] == [
                Decimal("0.5"),
                Decimal("1.0"),
                Decimal("1.5"),
            ]

    def test_brackets_immutability(self) -> None:
        tier = OIML_R76_TABLE_6_BRACKETS[0]
        assert isinstance(tier, MPEBracketTier)
        with pytest.raises(ValidationError):
            tier.base_mpe_factor = Decimal("9.9")  # type: ignore[misc]


# ============================================================================
# 2. Verification Test Gate: Exact Threshold Boundary Tests (Class III)
# ============================================================================


class TestClassIIIBoundaryEqualityGate:
    """
    Mandatory Verification Test Gate:
    Evaluates exact boundaries 499.99e, 500.00e, 500.01e, 1999.99e, 2000.00e, 2000.01e
    in both Initial Verification and In-Service modes.
    """

    @pytest.mark.parametrize(
        ("m_factor", "expected_bracket", "expected_initial_e", "expected_service_e"),
        [
            # Lower tier: m <= 500 -> Bracket 1 (+/- 0.5e initial, +/- 1.0e service)
            ("499.99", 1, "0.5", "1.0"),
            ("500.00", 1, "0.5", "1.0"),  # Strict equality: 500.00 is Bracket 1
            # Middle tier: 500 < m <= 2000 -> Bracket 2 (+/- 1.0e initial, +/- 2.0e service)
            ("500.01", 2, "1.0", "2.0"),  # Step transition into Bracket 2
            ("1999.99", 2, "1.0", "2.0"),
            ("2000.00", 2, "1.0", "2.0"),  # Strict equality: 2000.00 is Bracket 2
            # Upper tier: m > 2000 -> Bracket 3 (+/- 1.5e initial, +/- 3.0e service)
            ("2000.01", 3, "1.5", "3.0"),  # Step transition into Bracket 3
        ],
    )
    def test_class_iii_boundary_resolution(
        self,
        m_factor: str,
        expected_bracket: int,
        expected_initial_e: str,
        expected_service_e: str,
    ) -> None:
        e = Decimal("2.0")  # Scale interval e = 2 g
        m_val = Decimal(m_factor)
        load = m_val * e

        # 1. Initial Verification Mode (1x multiplier)
        res_initial = calculate_mpe(
            load=load,
            e=e,
            accuracy_class=AccuracyClass.CLASS_III,
            stage=VerificationStage.INITIAL_TYPE_APPROVAL,
        )
        assert isinstance(res_initial, MPEResult)
        assert res_initial.bracket_index == expected_bracket
        assert res_initial.mpe_in_units_of_e == Decimal(expected_initial_e)
        assert res_initial.mpe_value == Decimal(expected_initial_e) * e
        assert res_initial.stage_multiplier == Decimal("1.0")

        # 2. In-Service Mode (2x multiplier)
        res_service = calculate_mpe(
            load=load,
            e=e,
            accuracy_class=AccuracyClass.CLASS_III,
            stage=VerificationStage.SUBSEQUENT_IN_SERVICE,
        )
        assert res_service.bracket_index == expected_bracket
        assert res_service.mpe_in_units_of_e == Decimal(expected_service_e)
        assert res_service.mpe_value == Decimal(expected_service_e) * e
        assert res_service.stage_multiplier == Decimal("2.0")


# ============================================================================
# 3. Exhaustive Boundary Tests Across All 4 Accuracy Classes
# ============================================================================


class TestAllClassesThresholdBoundaries:
    """Verifies Table 6 boundaries across Class I, II, and IIII."""

    # -------------------------------------------------------------------------
    # Class I: Thresholds at 50,000 and 200,000
    # -------------------------------------------------------------------------
    @pytest.mark.parametrize(
        ("m_factor", "expected_bracket", "expected_initial_e"),
        [
            ("0", 1, "0.5"),
            ("49999.99", 1, "0.5"),
            ("50000.00", 1, "0.5"),  # Boundary 1: Upper inclusive
            ("50000.01", 2, "1.0"),
            ("199999.99", 2, "1.0"),
            ("200000.00", 2, "1.0"),  # Boundary 2: Upper inclusive
            ("200000.01", 3, "1.5"),
            ("500000.00", 3, "1.5"),
        ],
    )
    def test_class_i_boundaries(
        self, m_factor: str, expected_bracket: int, expected_initial_e: str
    ) -> None:
        e = Decimal("0.001")  # e = 1 mg
        load = Decimal(m_factor) * e
        res = calculate_mpe(
            load=load,
            e=e,
            accuracy_class=AccuracyClass.CLASS_I,
            stage=VerificationStage.INITIAL_TYPE_APPROVAL,
        )
        assert res.bracket_index == expected_bracket
        assert res.mpe_in_units_of_e == Decimal(expected_initial_e)

    # -------------------------------------------------------------------------
    # Class II: Thresholds at 5,000 and 20,000
    # -------------------------------------------------------------------------
    @pytest.mark.parametrize(
        ("m_factor", "expected_bracket", "expected_initial_e"),
        [
            ("0", 1, "0.5"),
            ("4999.99", 1, "0.5"),
            ("5000.00", 1, "0.5"),  # Boundary 1: Upper inclusive
            ("5000.01", 2, "1.0"),
            ("19999.99", 2, "1.0"),
            ("20000.00", 2, "1.0"),  # Boundary 2: Upper inclusive
            ("20000.01", 3, "1.5"),
            ("100000.00", 3, "1.5"),
        ],
    )
    def test_class_ii_boundaries(
        self, m_factor: str, expected_bracket: int, expected_initial_e: str
    ) -> None:
        e = Decimal("0.05")  # e = 50 mg
        load = Decimal(m_factor) * e
        res = calculate_mpe(
            load=load,
            e=e,
            accuracy_class=AccuracyClass.CLASS_II,
            stage=VerificationStage.INITIAL_TYPE_APPROVAL,
        )
        assert res.bracket_index == expected_bracket
        assert res.mpe_in_units_of_e == Decimal(expected_initial_e)

    # -------------------------------------------------------------------------
    # Class IIII: Thresholds at 50 and 200
    # -------------------------------------------------------------------------
    @pytest.mark.parametrize(
        ("m_factor", "expected_bracket", "expected_initial_e"),
        [
            ("0", 1, "0.5"),
            ("49.99", 1, "0.5"),
            ("50.00", 1, "0.5"),  # Boundary 1: Upper inclusive
            ("50.01", 2, "1.0"),
            ("199.99", 2, "1.0"),
            ("200.00", 2, "1.0"),  # Boundary 2: Upper inclusive
            ("200.01", 3, "1.5"),
            ("1000.00", 3, "1.5"),
        ],
    )
    def test_class_iiii_boundaries(
        self, m_factor: str, expected_bracket: int, expected_initial_e: str
    ) -> None:
        e = Decimal("5.0")  # e = 5 g
        load = Decimal(m_factor) * e
        res = calculate_mpe(
            load=load,
            e=e,
            accuracy_class=AccuracyClass.CLASS_IIII,
            stage=VerificationStage.INITIAL_TYPE_APPROVAL,
        )
        assert res.bracket_index == expected_bracket
        assert res.mpe_in_units_of_e == Decimal(expected_initial_e)


# ============================================================================
# 4. Compliance & Margin Calculations
# ============================================================================


class TestComplianceEvaluationAndMargin:
    """Verifies deterministic pass/fail outcomes, margin values, and boundary conditions."""

    def test_strictly_compliant_pass(self) -> None:
        """
        Class III, e = 5 g, load = 5000 g -> m = 1000e (Bracket 2: +/- 1.0e = +/- 5.0 g).
        Corrected error E_c = +2.0 g.
        Margin = 5.0 - 2.0 = 3.0 g (60.00%).
        """
        res = calculate_mpe(
            load=Decimal("5000"),
            e=Decimal("5"),
            accuracy_class=AccuracyClass.CLASS_III,
            stage=VerificationStage.INITIAL_TYPE_APPROVAL,
            corrected_error=Decimal("2.0"),
        )
        assert res.is_compliant is True
        assert res.compliance_status == ComplianceStatus.PASS
        assert res.margin == Decimal("3.0")
        assert res.margin_percentage == Decimal("60.00")

    def test_negative_corrected_error_pass(self) -> None:
        """
        Negative error is handled by absolute value comparison:
        MPE = +/- 5.0 g, E_c = -3.5 g -> Compliant, Margin = 1.5 g.
        """
        res = calculate_mpe(
            load=Decimal("5000"),
            e=Decimal("5"),
            accuracy_class=AccuracyClass.CLASS_III,
            stage=VerificationStage.INITIAL_TYPE_APPROVAL,
            corrected_error=Decimal("-3.5"),
        )
        assert res.is_compliant is True
        assert res.compliance_status == ComplianceStatus.PASS
        assert res.margin == Decimal("1.5")
        assert res.margin_percentage == Decimal("30.00")

    def test_marginal_pass_exactly_on_boundary(self) -> None:
        """
        |E_c| == |MPE| is legally compliant (MARGINAL):
        MPE = 5.0 g, E_c = 5.0 g -> Margin = 0.0 g.
        """
        res = calculate_mpe(
            load=Decimal("5000"),
            e=Decimal("5"),
            accuracy_class=AccuracyClass.CLASS_III,
            stage=VerificationStage.INITIAL_TYPE_APPROVAL,
            corrected_error=Decimal("5.0"),
        )
        assert res.is_compliant is True
        assert res.compliance_status == ComplianceStatus.MARGINAL
        assert res.margin == Decimal("0.0")
        assert res.margin_percentage == Decimal("0.00")

    def test_non_compliant_fail(self) -> None:
        """
        |E_c| > |MPE|:
        MPE = 5.0 g, E_c = 5.5 g -> Non-compliant, Margin = -0.5 g.
        """
        res = calculate_mpe(
            load=Decimal("5000"),
            e=Decimal("5"),
            accuracy_class=AccuracyClass.CLASS_III,
            stage=VerificationStage.INITIAL_TYPE_APPROVAL,
            corrected_error=Decimal("5.5"),
        )
        assert res.is_compliant is False
        assert res.compliance_status == ComplianceStatus.FAIL
        assert res.margin == Decimal("-0.5")
        assert res.margin_percentage == Decimal("-10.00")

    def test_in_service_doubling_saves_marginal_fail(self) -> None:
        """
        Demonstrates why stage-awareness matters:
        At Initial verification: E_c = +6.0 g with MPE +/- 5.0 g -> FAILS.
        At In-Service verification: MPE doubles to +/- 10.0 g -> PASSES with margin 4.0 g!
        """
        # Initial verification -> FAIL
        initial = calculate_mpe(
            load=Decimal("5000"),
            e=Decimal("5"),
            accuracy_class=AccuracyClass.CLASS_III,
            stage=VerificationStage.INITIAL_TYPE_APPROVAL,
            corrected_error=Decimal("6.0"),
        )
        assert initial.is_compliant is False
        assert initial.compliance_status == ComplianceStatus.FAIL
        assert initial.mpe_value == Decimal("5.0")

        # In-Service inspection -> PASS
        in_service = calculate_mpe(
            load=Decimal("5000"),
            e=Decimal("5"),
            accuracy_class=AccuracyClass.CLASS_III,
            stage=VerificationStage.SUBSEQUENT_IN_SERVICE,
            corrected_error=Decimal("6.0"),
        )
        assert in_service.is_compliant is True
        assert in_service.compliance_status == ComplianceStatus.PASS
        assert in_service.mpe_value == Decimal("10.0")
        assert in_service.margin == Decimal("4.0")


# ============================================================================
# 5. Integration with ChangeoverResult & InstrumentSpecification
# ============================================================================


class TestMPEIntegrationAndHelpers:
    """Verifies end-to-end integration with Step 02 and Step 04 engines."""

    def test_evaluate_changeover_with_mpe_textbook_case(self) -> None:
        """
        Textbook Case from Step 04:
        L = 10000.0 g, I = 10000.0 g, e = 5.0 g, Delta L = 1.5 g, E_0 = +0.5 g
        => P = 10001.0 g, E = +1.0 g, E_c = +0.5 g.
        Class III: m = 10000 / 5 = 2000e (Bracket 2 boundary: MPE = +/- 1.0e = +/- 5.0 g).
        E_c = +0.5 g <= 5.0 g -> PASS, Margin = 4.5 g (90%).
        """
        changeover = compute_changeover_point(
            load=Decimal("10000.0"),
            indication=Decimal("10000.0"),
            e=Decimal("5.0"),
            delta_load=Decimal("1.5"),
            zero_error=Decimal("0.5"),
        )
        assert changeover.corrected_error == Decimal("0.5")

        evaluated = evaluate_changeover_with_mpe(
            changeover=changeover,
            accuracy_class=AccuracyClass.CLASS_III,
            stage=VerificationStage.INITIAL_TYPE_APPROVAL,
        )

        assert isinstance(evaluated, EvaluatedObservation)
        assert evaluated.is_compliant is True
        assert evaluated.mpe.bracket_index == 2
        assert evaluated.mpe.mpe_value == Decimal("5.0")
        assert evaluated.margin == Decimal("4.5")
        assert evaluated.mpe.margin_percentage == Decimal("90.00")
        assert evaluated.mpe.compliance_status == ComplianceStatus.PASS

    def test_multi_interval_mpe_resolution(self) -> None:
        """
        Dual-interval scale:
        Range 1: Max 6 kg, e = 2 g (0 <= L <= 6 kg)
        Range 2: Max 15 kg, e = 5 g (6 kg < L <= 15 kg)

        At load L = 4 kg (in Range 1): e = 2 g -> m = 4000 / 2 = 2000e -> MPE = +/- 1.0 * 2 = 2 g.
        At load L = 10 kg (in Range 2): e = 5 g -> m = 10000 / 5 = 2000e -> MPE = +/- 1.0 * 5 = 5 g.
        """
        spec = InstrumentSpecification(
            serial_number="MULTI-MPE-001",
            manufacturer="Metrology Instruments Ltd",
            model_name="DualRange-15",
            accuracy_class=AccuracyClass.CLASS_III,
            max_capacity=Decimal("15"),
            min_capacity=Decimal("0.04"),
            e=Decimal("0.005"),
            d=Decimal("0.005"),
            unit=UnitOfMeasure.KILOGRAM,
            is_multi_interval=True,
            intervals_array=[
                IntervalRange(
                    range_index=1,
                    max_capacity=Decimal("6"),
                    min_capacity=Decimal("0.04"),
                    e=Decimal("0.002"),
                    d=Decimal("0.002"),
                ),
                IntervalRange(
                    range_index=2,
                    max_capacity=Decimal("15"),
                    min_capacity=Decimal("6"),
                    e=Decimal("0.005"),
                    d=Decimal("0.005"),
                ),
            ],
        )

        # Range 1 test load (4 kg): e = 0.002 kg -> m = 2000e -> MPE = +/- 1.0e = +/- 0.002 kg
        res_r1 = resolve_mpe_for_specification(Decimal("4"), spec)
        assert res_r1.e == Decimal("0.002")
        assert res_r1.mpe_in_units_of_e == Decimal("1.0")
        assert res_r1.mpe_value == Decimal("0.002")

        # Range 2 test load (10 kg): e = 0.005 kg -> m = 2000e -> MPE = +/- 1.0e = +/- 0.005 kg
        res_r2 = resolve_mpe_for_specification(Decimal("10"), spec)
        assert res_r2.e == Decimal("0.005")
        assert res_r2.mpe_in_units_of_e == Decimal("1.0")
        assert res_r2.mpe_value == Decimal("0.005")


# ============================================================================
# 6. Negative & Boundary Error Handling
# ============================================================================


class TestMPEExceptionsAndValidation:
    """Verifies that non-physical loads and intervals are rejected."""

    def test_reject_negative_load(self) -> None:
        with pytest.raises(ValueError, match="cannot be negative"):
            calculate_mpe(
                load=Decimal("-10"),
                e=Decimal("2"),
                accuracy_class=AccuracyClass.CLASS_III,
            )

    def test_reject_zero_or_negative_e(self) -> None:
        with pytest.raises(ValueError, match="strictly positive"):
            calculate_mpe(
                load=Decimal("100"),
                e=Decimal("0"),
                accuracy_class=AccuracyClass.CLASS_III,
            )

    def test_reject_negative_m_in_bracket_resolution(self) -> None:
        with pytest.raises(ValueError, match="cannot be negative"):
            resolve_mpe_bracket(AccuracyClass.CLASS_III, Decimal("-1"))

    def test_load_exceeding_n_max_sets_flag(self) -> None:
        """
        Class III has statutory n_max = 10,000.
        If m = 15,000e, MPE resolves to 1.5e but is_over_n_max is True.
        """
        res = calculate_mpe(
            load=Decimal("30000"),
            e=Decimal("2"),
            accuracy_class=AccuracyClass.CLASS_III,
        )
        assert res.m_in_scale_intervals == Decimal("15000")
        assert res.mpe_in_units_of_e == Decimal("1.5")
        assert res.is_over_n_max is True
        assert any("exceeds statutory maximum" in s for s in res.step_by_step_explanation)
