"""
METROLOGIX-76 — Unit Tests for OIML R 76-1 Table 3 Scale Interval Validator.

Verifies:
1. Zero hardcoded magic numbers: all limits sourced from OIML_R76_TABLE_3_RULES.
2. 10+ Valid instruments across all 4 accuracy classes (Class I, II, III, IIII).
3. 10+ Invalid parameter combinations (e.g. n = 60,000 on Class III, n < n_min, Min < required).
4. 1 x 10^k, 2 x 10^k, 5 x 10^k scale interval rule enforcement.
5. Multi-interval instrument partial range validation.
6. Structured ScaleValidationResult contract: {is_valid, n, min_required, violations}.
"""

from decimal import Decimal

import pytest
from pydantic import ValidationError

from app.core.scale_interval_validator import (
    OIML_R76_TABLE_3_RULES,
    Table3RuleTier,
    is_valid_scale_interval_step,
    validate_scale_intervals,
    validate_scale_parameters,
)
from app.core.schemas import InstrumentSpecification, IntervalRange
from app.core.types import AccuracyClass, UnitOfMeasure

# ============================================================================
# 1. Zero Magic Numbers & Table 3 Structure Verification
# ============================================================================


class TestTable3RuleStructure:
    """Zero-Bug Rule: All limits are structured in OIML_R76_TABLE_3_RULES."""

    def test_table_contains_all_four_accuracy_classes(self) -> None:
        classes_in_table = {tier.accuracy_class for tier in OIML_R76_TABLE_3_RULES}
        assert classes_in_table == {
            AccuracyClass.CLASS_I,
            AccuracyClass.CLASS_II,
            AccuracyClass.CLASS_III,
            AccuracyClass.CLASS_IIII,
        }

    def test_table_tiers_immutability(self) -> None:
        tier = OIML_R76_TABLE_3_RULES[0]
        assert isinstance(tier, Table3RuleTier)
        with pytest.raises(ValidationError):
            tier.n_min = Decimal("999")  # type: ignore[misc]

    def test_step_1_2_5_helper(self) -> None:
        valid_steps = [
            "0.001",
            "0.002",
            "0.005",
            "0.01",
            "0.02",
            "0.05",
            "0.1",
            "0.2",
            "0.5",
            "1",
            "2",
            "5",
            "10",
            "20",
            "50",
            "100",
            "200",
            "500",
            "1000",
        ]
        for s in valid_steps:
            assert is_valid_scale_interval_step(Decimal(s)) is True, f"Failed for {s}"

        invalid_steps = ["0.003", "0.004", "0.007", "0.15", "0.25", "3", "4", "6", "7", "8", "9"]
        for s in invalid_steps:
            assert is_valid_scale_interval_step(Decimal(s)) is False, f"Failed for {s}"


# ============================================================================
# 2. 10+ Valid Test Cases Across All 4 Accuracy Classes
# ============================================================================


class TestValidInstrumentsAllClasses:
    """10+ Valid instruments strictly complying with OIML Table 3."""

    # ── CLASS I (Special Accuracy) ──────────────────────────────────────────
    def test_valid_class_i_microbalance(self) -> None:
        """Class I: Max 60 g, Min 0.1 g, e = 1 mg (0.001 g), d = 0.1 mg -> n = 60,000."""
        res = validate_scale_parameters(
            accuracy_class=AccuracyClass.CLASS_I,
            max_capacity=Decimal("60"),
            min_capacity=Decimal("0.1"),
            e=Decimal("0.001"),
            d=Decimal("0.0001"),
            unit=UnitOfMeasure.GRAM,
        )
        assert res.is_valid is True
        assert res.n == Decimal("60000")
        assert res.min_required == Decimal("0.1")  # 100 * 0.001 g = 0.1 g
        assert len(res.violations) == 0

    def test_valid_class_i_analytical_balance(self) -> None:
        """Class I: Max 220 g, Min 0.1 g, e = 1 mg, d = 0.1 mg -> n = 220,000."""
        res = validate_scale_parameters(
            accuracy_class=AccuracyClass.CLASS_I,
            max_capacity=Decimal("220"),
            min_capacity=Decimal("0.1"),
            e=Decimal("0.001"),
            d=Decimal("0.0001"),
            unit=UnitOfMeasure.GRAM,
        )
        assert res.is_valid is True
        assert res.n == Decimal("220000")
        assert len(res.violations) == 0

    def test_valid_class_i_mass_comparator(self) -> None:
        """Class I: Max 1000 g (1 kg), Min 0.2 g, e = 2 mg (0.002 g) -> n = 500,000."""
        res = validate_scale_parameters(
            accuracy_class=AccuracyClass.CLASS_I,
            max_capacity=Decimal("1000"),
            min_capacity=Decimal("0.2"),
            e=Decimal("0.002"),
            d=Decimal("0.0002"),
            unit=UnitOfMeasure.GRAM,
        )
        assert res.is_valid is True
        assert res.n == Decimal("500000")

    # ── CLASS II (High Accuracy) ────────────────────────────────────────────
    def test_valid_class_ii_tier_1_precious_metals(self) -> None:
        """Class II Tier 1: Max 600 g, Min 0.2 g, e = 0.01 g (10 mg) -> n = 60,000."""
        res = validate_scale_parameters(
            accuracy_class=AccuracyClass.CLASS_II,
            max_capacity=Decimal("600"),
            min_capacity=Decimal("0.2"),
            e=Decimal("0.01"),
            d=Decimal("0.01"),
            unit=UnitOfMeasure.GRAM,
        )
        assert res.is_valid is True
        assert res.n == Decimal("60000")
        assert res.min_required == Decimal("0.2")  # 20 * 0.01 g = 0.2 g
        assert res.matched_tier == "CLASS_II_TIER_1"

    def test_valid_class_ii_tier_1_boundary_50mg(self) -> None:
        """Class II Tier 1: Max 2500 g, Min 1.0 g, e = 0.05 g (50 mg) -> n = 50,000."""
        res = validate_scale_parameters(
            accuracy_class=AccuracyClass.CLASS_II,
            max_capacity=Decimal("2500"),
            min_capacity=Decimal("1.0"),
            e=Decimal("0.05"),
            d=Decimal("0.05"),
            unit=UnitOfMeasure.GRAM,
        )
        assert res.is_valid is True
        assert res.n == Decimal("50000")
        assert res.matched_tier == "CLASS_II_TIER_1"

    def test_valid_class_ii_tier_2_commercial_precision(self) -> None:
        """Class II Tier 2: Max 6000 g (6 kg), Min 5 g, e = 0.1 g (100 mg) -> n = 60,000."""
        res = validate_scale_parameters(
            accuracy_class=AccuracyClass.CLASS_II,
            max_capacity=Decimal("6000"),
            min_capacity=Decimal("5.0"),
            e=Decimal("0.1"),
            d=Decimal("0.1"),
            unit=UnitOfMeasure.GRAM,
        )
        assert res.is_valid is True
        assert res.n == Decimal("60000")
        assert res.min_required == Decimal("5.0")  # 50 * 0.1 g = 5.0 g
        assert res.matched_tier == "CLASS_II_TIER_2"

    def test_valid_class_ii_tier_2_in_kilograms(self) -> None:
        """Class II Tier 2: Max 20 kg, Min 0.05 kg (50 g), e = 0.001 kg (1 g) -> n = 20,000."""
        res = validate_scale_parameters(
            accuracy_class=AccuracyClass.CLASS_II,
            max_capacity=Decimal("20"),
            min_capacity=Decimal("0.05"),
            e=Decimal("0.001"),
            unit=UnitOfMeasure.KILOGRAM,
        )
        assert res.is_valid is True
        assert res.n == Decimal("20000")
        assert res.min_required == Decimal("0.05")  # 50 * 0.001 kg = 0.05 kg

    # ── CLASS III (Medium Accuracy) ─────────────────────────────────────────
    def test_valid_class_iii_tier_1_retail_compact(self) -> None:
        """Class III Tier 1: Max 6 kg, Min 0.04 kg (40 g), e = 0.002 kg (2 g) -> n = 3,000."""
        res = validate_scale_parameters(
            accuracy_class=AccuracyClass.CLASS_III,
            max_capacity=Decimal("6"),
            min_capacity=Decimal("0.04"),
            e=Decimal("0.002"),
            unit=UnitOfMeasure.KILOGRAM,
        )
        assert res.is_valid is True
        assert res.n == Decimal("3000")
        assert res.min_required == Decimal("0.04")  # 20 * 0.002 kg = 0.04 kg
        assert res.matched_tier == "CLASS_III_TIER_1"

    def test_valid_class_iii_tier_2_standard_platform(self) -> None:
        """Class III Tier 2: Max 150 kg, Min 1 kg, e = 0.05 kg (50 g) -> n = 3,000."""
        res = validate_scale_parameters(
            accuracy_class=AccuracyClass.CLASS_III,
            max_capacity=Decimal("150"),
            min_capacity=Decimal("1"),
            e=Decimal("0.05"),
            unit=UnitOfMeasure.KILOGRAM,
        )
        assert res.is_valid is True
        assert res.n == Decimal("3000")
        assert res.min_required == Decimal("1.0")  # 20 * 0.05 kg = 1.0 kg
        assert res.matched_tier == "CLASS_III_TIER_2"

    def test_valid_class_iii_heavy_weighbridge_in_tonnes(self) -> None:
        """Class III: Heavy Road Weighbridge:
        Max 60 t, Min 0.4 t (400 kg), e = 0.02 t (20 kg) -> n = 3,000.
        """
        res = validate_scale_parameters(
            accuracy_class=AccuracyClass.CLASS_III,
            max_capacity=Decimal("60"),
            min_capacity=Decimal("0.4"),
            e=Decimal("0.02"),
            unit=UnitOfMeasure.TONNE,
        )
        assert res.is_valid is True
        assert res.n == Decimal("3000")
        assert res.min_required == Decimal("0.4")  # 20 * 0.02 t = 0.4 t
        assert res.matched_tier == "CLASS_III_TIER_2"

    # ── CLASS IIII (Ordinary Accuracy) ──────────────────────────────────────
    def test_valid_class_iiii_crane_scale(self) -> None:
        """Class IIII: Crane scale: Max 5000 kg, Min 50 kg, e = 5 kg -> n = 1,000."""
        res = validate_scale_parameters(
            accuracy_class=AccuracyClass.CLASS_IIII,
            max_capacity=Decimal("5000"),
            min_capacity=Decimal("50"),
            e=Decimal("5"),
            unit=UnitOfMeasure.KILOGRAM,
        )
        assert res.is_valid is True
        assert res.n == Decimal("1000")
        assert res.min_required == Decimal("50")  # 10 * 5 kg = 50 kg
        assert res.matched_tier == "CLASS_IIII_BASE"

    def test_valid_class_iiii_hopper_weigher(self) -> None:
        """Class IIII: Hopper weigher: Max 2000 kg, Min 20 kg, e = 10 kg -> n = 200."""
        res = validate_scale_parameters(
            accuracy_class=AccuracyClass.CLASS_IIII,
            max_capacity=Decimal("2000"),
            min_capacity=Decimal("100"),
            e=Decimal("10"),
            unit=UnitOfMeasure.KILOGRAM,
        )
        assert res.is_valid is True
        assert res.n == Decimal("200")


# ============================================================================
# 3. 10+ Invalid Parameter Combinations
# ============================================================================


class TestInvalidInstrumentsAllClasses:
    """10+ Invalid parameter combinations covering all statutory failure modes."""

    def test_fail_class_iii_n_equals_60000(self) -> None:
        """
        Target Verification Gate: n = 60,000 on Class III must fail.
        Max = 300 kg, e = 0.005 kg (5 g) -> n = 300 / 0.005 = 60,000 > 10,000 max.
        """
        res = validate_scale_parameters(
            accuracy_class=AccuracyClass.CLASS_III,
            max_capacity=Decimal("300"),
            min_capacity=Decimal("1"),
            e=Decimal("0.005"),
            unit=UnitOfMeasure.KILOGRAM,
        )
        assert res.is_valid is False
        assert res.n == Decimal("60000")
        assert any("exceeds the statutory maximum (10000)" in v for v in res.violations)

    def test_fail_class_iii_n_below_minimum_tier_2(self) -> None:
        """Class III Tier 2 (e >= 5 g): n must be >= 500. Here n = 200."""
        # Max = 10 kg, e = 0.05 kg (50 g) -> n = 10 / 0.05 = 200 < 500
        res = validate_scale_parameters(
            accuracy_class=AccuracyClass.CLASS_III,
            max_capacity=Decimal("10"),
            min_capacity=Decimal("1"),
            e=Decimal("0.05"),
            unit=UnitOfMeasure.KILOGRAM,
        )
        assert res.is_valid is False
        assert res.n == Decimal("200")
        assert any("less than the statutory minimum (500)" in v for v in res.violations)

    def test_fail_class_iii_n_below_minimum_tier_1(self) -> None:
        """Class III Tier 1 (0.1 g <= e <= 2 g): n must be >= 100. Here n = 50."""
        # Max = 50 g, e = 1 g -> n = 50 < 100
        res = validate_scale_parameters(
            accuracy_class=AccuracyClass.CLASS_III,
            max_capacity=Decimal("50"),
            min_capacity=Decimal("20"),
            e=Decimal("1"),
            unit=UnitOfMeasure.GRAM,
        )
        assert res.is_valid is False
        assert res.n == Decimal("50")
        assert any("less than the statutory minimum (100)" in v for v in res.violations)

    def test_fail_class_i_n_below_50000(self) -> None:
        """Class I: n must be >= 50,000. Here Max = 20 g, e = 1 mg -> n = 20,000."""
        res = validate_scale_parameters(
            accuracy_class=AccuracyClass.CLASS_I,
            max_capacity=Decimal("20"),
            min_capacity=Decimal("0.1"),
            e=Decimal("0.001"),
            unit=UnitOfMeasure.GRAM,
        )
        assert res.is_valid is False
        assert res.n == Decimal("20000")
        assert any("less than the statutory minimum (50000)" in v for v in res.violations)

    def test_fail_class_ii_n_exceeds_100000(self) -> None:
        """Class II: Maximum permitted n is 100,000. Here n = 150,000."""
        res = validate_scale_parameters(
            accuracy_class=AccuracyClass.CLASS_II,
            max_capacity=Decimal("1500"),
            min_capacity=Decimal("0.2"),
            e=Decimal("0.01"),
            unit=UnitOfMeasure.GRAM,
        )
        assert res.is_valid is False
        assert res.n == Decimal("150000")
        assert any("exceeds the statutory maximum (100000)" in v for v in res.violations)

    def test_fail_class_ii_tier_2_n_below_5000(self) -> None:
        """Class II Tier 2 (e >= 0.1 g): n must be >= 5,000. Here n = 3,000."""
        res = validate_scale_parameters(
            accuracy_class=AccuracyClass.CLASS_II,
            max_capacity=Decimal("300"),
            min_capacity=Decimal("5"),
            e=Decimal("0.1"),
            unit=UnitOfMeasure.GRAM,
        )
        assert res.is_valid is False
        assert res.n == Decimal("3000")
        assert any("less than the statutory minimum (5000)" in v for v in res.violations)

    def test_fail_class_iiii_n_exceeds_1000(self) -> None:
        """Class IIII: n cannot exceed 1,000. Here n = 2,000."""
        res = validate_scale_parameters(
            accuracy_class=AccuracyClass.CLASS_IIII,
            max_capacity=Decimal("10000"),
            min_capacity=Decimal("50"),
            e=Decimal("5"),
            unit=UnitOfMeasure.KILOGRAM,
        )
        assert res.is_valid is False
        assert res.n == Decimal("2000")
        assert any("exceeds the statutory maximum (1000)" in v for v in res.violations)

    def test_fail_class_iii_e_below_minimum(self) -> None:
        """Class III: e must be >= 0.1 g. Here e = 0.05 g (50 mg)."""
        res = validate_scale_parameters(
            accuracy_class=AccuracyClass.CLASS_III,
            max_capacity=Decimal("500"),
            min_capacity=Decimal("1"),
            e=Decimal("0.05"),
            unit=UnitOfMeasure.GRAM,
        )
        assert res.is_valid is False
        assert any("strictly below the statutory minimum (0.1 g)" in v for v in res.violations)

    def test_fail_class_iiii_e_below_minimum(self) -> None:
        """Class IIII: e must be >= 5 g. Here e = 2 g."""
        res = validate_scale_parameters(
            accuracy_class=AccuracyClass.CLASS_IIII,
            max_capacity=Decimal("500"),
            min_capacity=Decimal("20"),
            e=Decimal("2"),
            unit=UnitOfMeasure.GRAM,
        )
        assert res.is_valid is False
        assert any("strictly below the statutory minimum (5 g)" in v for v in res.violations)

    def test_fail_invalid_scale_interval_step_rule(self) -> None:
        """OIML R 76-1 Clause 3.1.1: e must be 1, 2, or 5 x 10^k. Here e = 0.03 kg."""
        # Note: InstrumentSpecification allows Decimal, but validator flags 1,2,5 step violation
        res = validate_scale_parameters(
            accuracy_class=AccuracyClass.CLASS_III,
            max_capacity=Decimal("150"),
            min_capacity=Decimal("1"),
            e=Decimal("0.03"),  # 0.03 is not in {1, 2, 5}
            unit=UnitOfMeasure.KILOGRAM,
        )
        assert res.is_valid is False
        assert any("1 x 10^k, 2 x 10^k, or 5 x 10^k step requirement" in v for v in res.violations)

    def test_fail_min_capacity_below_requirement_class_iii(self) -> None:
        """Class III: Min must be >= 20e. e = 1 kg -> Min must be >= 20 kg. Here Min = 10 kg."""
        res = validate_scale_parameters(
            accuracy_class=AccuracyClass.CLASS_III,
            max_capacity=Decimal("1000"),
            min_capacity=Decimal("10"),  # 10 < 20e
            e=Decimal("1"),
            unit=UnitOfMeasure.KILOGRAM,
        )
        assert res.is_valid is False
        assert res.min_required == Decimal("20")
        assert any(
            "less than the statutory requirement" in v and "20e" in v for v in res.violations
        )

    def test_fail_min_capacity_below_requirement_class_i(self) -> None:
        """Class I: Min must be >= 100e. e = 0.001 g -> Min required = 0.1 g. Here Min = 0.05 g."""
        res = validate_scale_parameters(
            accuracy_class=AccuracyClass.CLASS_I,
            max_capacity=Decimal("220"),
            min_capacity=Decimal("0.05"),  # 0.05 < 100e (0.1 g)
            e=Decimal("0.001"),
            unit=UnitOfMeasure.GRAM,
        )
        assert res.is_valid is False
        assert res.min_required == Decimal("0.1")
        assert any(
            "less than the statutory requirement" in v and "100e" in v for v in res.violations
        )

    def test_fail_min_capacity_below_requirement_class_ii_tier_2(self) -> None:
        """Class II Tier 2 (e >= 0.1 g):
        Min must be >= 50e. e = 0.1 g -> Min required = 5 g. Here Min = 2 g.
        """
        res = validate_scale_parameters(
            accuracy_class=AccuracyClass.CLASS_II,
            max_capacity=Decimal("6000"),
            min_capacity=Decimal("2.0"),  # 2 < 50e (5.0 g)
            e=Decimal("0.1"),
            unit=UnitOfMeasure.GRAM,
        )
        assert res.is_valid is False
        assert res.min_required == Decimal("5.0")
        assert any("50e" in v for v in res.violations)


# ============================================================================
# 4. Multi-Interval Instrument Scale Validation
# ============================================================================


class TestMultiIntervalScaleValidation:
    """Verify OIML R 76-1 Clause 3.3 multi-interval validation."""

    def test_valid_dual_interval_instrument(self) -> None:
        r1 = IntervalRange(
            range_index=1,
            min_capacity=Decimal("0.04"),  # Min1 = 20 * 0.002 kg = 0.04 kg
            max_capacity=Decimal("6"),
            e=Decimal("0.002"),
            d=Decimal("0.002"),
        )
        r2 = IntervalRange(
            range_index=2,
            min_capacity=Decimal("6"),
            max_capacity=Decimal("15"),
            e=Decimal("0.005"),
            d=Decimal("0.005"),
        )
        spec = InstrumentSpecification(
            accuracy_class=AccuracyClass.CLASS_III,
            max_capacity=Decimal("15"),
            min_capacity=Decimal("0.04"),
            e=Decimal("0.005"),
            d=Decimal("0.005"),
            unit=UnitOfMeasure.KILOGRAM,
            is_multi_interval=True,
            intervals_array=[r1, r2],
        )
        res = validate_scale_intervals(spec)
        assert res.is_valid is True
        assert res.is_multi_interval is True
        assert len(res.range_results) == 2
        assert res.range_results[0]["is_valid"] is True
        assert res.range_results[1]["is_valid"] is True

    def test_invalid_multi_interval_range_1_min_too_low(self) -> None:
        # Min1 = 0.01 kg < 20 * 0.002 kg (0.04 kg)
        r1 = IntervalRange(
            range_index=1,
            min_capacity=Decimal("0.01"),  # Too low
            max_capacity=Decimal("6"),
            e=Decimal("0.002"),
            d=Decimal("0.002"),
        )
        r2 = IntervalRange(
            range_index=2,
            min_capacity=Decimal("6"),
            max_capacity=Decimal("15"),
            e=Decimal("0.005"),
            d=Decimal("0.005"),
        )
        spec = InstrumentSpecification(
            accuracy_class=AccuracyClass.CLASS_III,
            max_capacity=Decimal("15"),
            min_capacity=Decimal("0.01"),
            e=Decimal("0.005"),
            d=Decimal("0.005"),
            unit=UnitOfMeasure.KILOGRAM,
            is_multi_interval=True,
            intervals_array=[r1, r2],
        )
        res = validate_scale_intervals(spec)
        assert res.is_valid is False
        assert any("Range 1" in v and "less than requirement" in v for v in res.violations)
