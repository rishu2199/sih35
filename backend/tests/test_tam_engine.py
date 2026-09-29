"""
METROLOGIX-76 — Test Suite for Automated Test Applicability Matrix (TAM) Engine (Step 08).

Validates:
- Inspection of declared scale parameters (capacity, class, receptor type, mobility).
- Verification Test Gate: A 60 kg platform scale gets 4-corner eccentricity,
  while a 50 t weighbridge gets rolling-load eccentricity with standard axles.
- Verification Test Gate: Heavy scales (Max > 1000 kg) receive 3 repeatability runs,
  while standard scales (Max <= 1000 kg) receive 10 repeatability runs (Clause A.4.10).
- Tilting test applicability: Fixed weighbridge is exempt; portable with level indicator
  gets 2/1000; portable without level indicator gets 50/1000.
- Discrimination test: 1.4d additional load test at Min, 50% Max, and Max.
- Tare test: Enabled when tare device is present, exempt when absent.
- Tank/hopper scales: Multi-support point eccentricity testing.
- Authorizing OIML R 76-1 and Legal Metrology Rules, 2011 statutory citations.
"""

from decimal import Decimal

import pytest

from app.core.rulepack.rulepack_manager import RulePackManager
from app.core.schemas import InstrumentSpecification, IntervalRange
from app.core.tam_engine import (
    TestApplicabilityMatrix,
    generate_discrimination_test_battery,
    generate_eccentricity_test_battery,
    generate_repeatability_test_battery,
    generate_tare_test_battery,
    generate_temperature_test_battery,
    generate_test_applicability_matrix,
    generate_tilting_test_battery,
    generate_weighing_test_battery,
)
from app.core.types import (
    AccuracyClass,
    CornerPosition,
    InstrumentMobility,
    LoadReceptorType,
    TestType,
    UnitOfMeasure,
    VerificationStage,
)

# ============================================================================
# FIXTURES
# ============================================================================


@pytest.fixture
def rulepack_manager() -> RulePackManager:
    """Return default RulePackManager."""
    return RulePackManager()


@pytest.fixture
def platform_60kg_retail_scale() -> InstrumentSpecification:
    """
    Standard Commercial Platform / Bench Scale:
    Class III, Max = 60 kg, Min = 400 g, e = 20 g, d = 20 g,
    Receptor: PLATFORM, Mobility: PORTABLE, has_level_indicator: True.
    """
    return InstrumentSpecification(
        accuracy_class=AccuracyClass.CLASS_III,
        max_capacity=Decimal("60"),
        min_capacity=Decimal("0.4"),
        e=Decimal("0.02"),
        d=Decimal("0.02"),
        unit=UnitOfMeasure.KILOGRAM,
        receptor_type=LoadReceptorType.PLATFORM,
        mobility=InstrumentMobility.PORTABLE,
        has_level_indicator=True,
        has_tare_device=True,
        tare_max=Decimal("20"),
        serial_number="PLT-60-2026-001",
    )


@pytest.fixture
def weighbridge_50t() -> InstrumentSpecification:
    """
    Heavy Industrial Road Vehicle Weighbridge:
    Class III, Max = 50 t = 50,000 kg, Min = 400 kg, e = 20 kg, d = 20 kg,
    Receptor: WEIGHBRIDGE, Mobility: FIXED, num_supports: 6.
    """
    return InstrumentSpecification(
        accuracy_class=AccuracyClass.CLASS_III,
        max_capacity=Decimal("50000"),
        min_capacity=Decimal("400"),
        e=Decimal("20"),
        d=Decimal("20"),
        unit=UnitOfMeasure.KILOGRAM,
        receptor_type=LoadReceptorType.WEIGHBRIDGE,
        mobility=InstrumentMobility.FIXED,
        has_level_indicator=False,
        has_tare_device=True,
        num_supports=6,
        serial_number="WB-50T-2026-999",
    )


@pytest.fixture
def laboratory_analytical_balance() -> InstrumentSpecification:
    """
    Special Accuracy Laboratory Balance:
    Class I, Max = 220 g, Min = 0.01 g, e = 1 mg (0.001 g), d = 0.1 mg (0.0001 g),
    Receptor: PLATFORM, Mobility: PORTABLE, has_level_indicator: True.
    """
    return InstrumentSpecification(
        accuracy_class=AccuracyClass.CLASS_I,
        max_capacity=Decimal("220"),
        min_capacity=Decimal("0.01"),
        e=Decimal("0.001"),
        d=Decimal("0.0001"),
        unit=UnitOfMeasure.GRAM,
        receptor_type=LoadReceptorType.PLATFORM,
        mobility=InstrumentMobility.PORTABLE,
        has_level_indicator=True,
        has_tare_device=True,
        tare_max=Decimal("100"),
        serial_number="LAB-EXP-2026-444",
    )


@pytest.fixture
def industrial_tank_scale() -> InstrumentSpecification:
    """
    Industrial Silo / Tank Weigher:
    Class III, Max = 10,000 kg, Min = 100 kg, e = 5 kg, d = 5 kg,
    Receptor: TANK, Mobility: FIXED, num_supports: 4.
    """
    return InstrumentSpecification(
        accuracy_class=AccuracyClass.CLASS_III,
        max_capacity=Decimal("10000"),
        min_capacity=Decimal("100"),
        e=Decimal("5"),
        d=Decimal("5"),
        unit=UnitOfMeasure.KILOGRAM,
        receptor_type=LoadReceptorType.TANK,
        mobility=InstrumentMobility.FIXED,
        num_supports=4,
        has_level_indicator=False,
        has_tare_device=False,
        serial_number="TANK-10T-2026-789",
    )


# ============================================================================
# 1. VERIFICATION TEST GATE: PLATFORM 4-CORNER VS WEIGHBRIDGE ROLLING LOAD
# ============================================================================


class TestEccentricityVerificationTestGate:
    """
    Critical Verification Test Gate:
    A 60 kg platform scale gets 4-corner eccentricity,
    while a 50 t weighbridge gets rolling-load eccentricity with standard axles.
    """

    def test_platform_scale_gets_4_corner_eccentricity(
        self,
        platform_60kg_retail_scale: InstrumentSpecification,
        rulepack_manager: RulePackManager,
    ) -> None:
        """
        Verify that a 60 kg platform scale receives standard 4-corner loading:
        - Test load = 1/3 Max = 20 kg
        - 5 target positions: Center, Front-Left, Back-Left, Back-Right, Front-Right
        - Authorized by OIML R 76-1:2006 Clause A.4.7.1
        """
        rp = rulepack_manager.get_active_rulepack()
        ecc_battery = generate_eccentricity_test_battery(
            platform_60kg_retail_scale, rp, VerificationStage.INITIAL_TYPE_APPROVAL
        )

        assert ecc_battery.is_applicable is True
        assert ecc_battery.test_type == TestType.ECCENTRICITY
        assert "Clause A.4.7.1" in ecc_battery.statutory_clause
        assert "Seventh Schedule Heading A Para 9(1)(b)" in ecc_battery.statutory_clause

        # Test load must equal exactly 1/3 Max = 20 kg
        expected_load = Decimal("20")
        assert len(ecc_battery.target_loads) == 5

        # Check all 5 standard corner loading positions
        positions = [pt.position for pt in ecc_battery.target_loads]
        assert CornerPosition.CENTER in positions
        assert CornerPosition.FRONT_LEFT in positions
        assert CornerPosition.BACK_LEFT in positions
        assert CornerPosition.BACK_RIGHT in positions
        assert CornerPosition.FRONT_RIGHT in positions

        for pt in ecc_battery.target_loads:
            assert pt.load_nominal == expected_load
            assert pt.base_mpe > Decimal("0")

    def test_weighbridge_gets_rolling_load_eccentricity(
        self,
        weighbridge_50t: InstrumentSpecification,
        rulepack_manager: RulePackManager,
    ) -> None:
        """
        Verify that a 50 t weighbridge receives rolling-load eccentricity:
        - Test load = 0.8 Max = 40,000 kg (40 t)
        - Track positions: Track Entry, Track Middle, Track Exit
        - Authorized by OIML R 76-1:2006 Clause A.4.7.4
        """
        rp = rulepack_manager.get_active_rulepack()
        ecc_battery = generate_eccentricity_test_battery(
            weighbridge_50t, rp, VerificationStage.INITIAL_TYPE_APPROVAL
        )

        assert ecc_battery.is_applicable is True
        assert ecc_battery.test_type == TestType.ECCENTRICITY
        assert "Clause A.4.7.4" in ecc_battery.statutory_clause
        assert "Seventh Schedule Heading A Para 9(1)(b)" in ecc_battery.statutory_clause

        # Test load must equal 0.8 Max = 40,000 kg
        expected_load = Decimal("40000")
        assert len(ecc_battery.target_loads) == 3

        positions = [pt.position for pt in ecc_battery.target_loads]
        assert "TRACK_ENTRY" in positions
        assert "TRACK_MIDDLE" in positions
        assert "TRACK_EXIT" in positions

        for pt in ecc_battery.target_loads:
            assert pt.load_nominal == expected_load


# ============================================================================
# 2. VERIFICATION TEST GATE: CAPACITY-AWARE REPEATABILITY RUNS (CLAUSE A.4.10)
# ============================================================================


class TestRepeatabilityCapacityThresholds:
    """
    Verifies that instruments with Max > 1000 kg get 3 weighings per series,
    while standard instruments (Max <= 1000 kg) get 10 weighings per series.
    """

    def test_heavy_weighbridge_gets_3_repeatability_runs(
        self,
        weighbridge_50t: InstrumentSpecification,
        rulepack_manager: RulePackManager,
    ) -> None:
        """Max = 50,000 kg > 1000 kg -> 3 weighings per series."""
        rp = rulepack_manager.get_active_rulepack()
        rep_battery = generate_repeatability_test_battery(
            weighbridge_50t, rp, VerificationStage.INITIAL_TYPE_APPROVAL
        )
        assert rep_battery.is_applicable is True
        assert rep_battery.prescribed_runs_count == 3
        assert "Clause A.4.10" in rep_battery.statutory_clause
        assert "3 weighings per series" in rep_battery.acceptance_criteria

    def test_standard_retail_scale_gets_10_repeatability_runs(
        self,
        platform_60kg_retail_scale: InstrumentSpecification,
        rulepack_manager: RulePackManager,
    ) -> None:
        """Max = 60 kg <= 1000 kg -> 10 weighings per series."""
        rp = rulepack_manager.get_active_rulepack()
        rep_battery = generate_repeatability_test_battery(
            platform_60kg_retail_scale, rp, VerificationStage.INITIAL_TYPE_APPROVAL
        )
        assert rep_battery.is_applicable is True
        assert rep_battery.prescribed_runs_count == 10
        assert "10 weighings per series" in rep_battery.acceptance_criteria


# ============================================================================
# 3. TILTING TEST APPLICABILITY & LEVEL INDICATOR RULES
# ============================================================================


class TestTiltingTestApplicability:
    """
    Verifies Clause A.5.1.1 rules:
    - Fixed instruments are exempt
    - Portable with level indicator gets 2/1000
    - Portable without level indicator gets 50/1000
    """

    def test_fixed_weighbridge_exempt_from_tilting(
        self,
        weighbridge_50t: InstrumentSpecification,
        rulepack_manager: RulePackManager,
    ) -> None:
        """Permanently installed weighbridge is legally exempt from tilting test."""
        rp = rulepack_manager.get_active_rulepack()
        tilt_battery = generate_tilting_test_battery(
            weighbridge_50t, rp, VerificationStage.INITIAL_TYPE_APPROVAL
        )
        assert tilt_battery.is_applicable is False
        assert tilt_battery.exemption_reason is not None
        assert "exempt" in tilt_battery.exemption_reason.lower()
        assert len(tilt_battery.target_loads) == 0

    def test_portable_scale_with_level_indicator_gets_2_per_thousand(
        self,
        platform_60kg_retail_scale: InstrumentSpecification,
        rulepack_manager: RulePackManager,
    ) -> None:
        """Portable scale with level indicator is tilted by 2/1000."""
        rp = rulepack_manager.get_active_rulepack()
        tilt_battery = generate_tilting_test_battery(
            platform_60kg_retail_scale, rp, VerificationStage.INITIAL_TYPE_APPROVAL
        )
        assert tilt_battery.is_applicable is True
        assert "2/1000" in tilt_battery.test_name
        assert len(tilt_battery.target_loads) == 2  # Zero load and 50% Max

    def test_portable_scale_without_level_indicator_gets_50_per_thousand(
        self, rulepack_manager: RulePackManager
    ) -> None:
        """Portable scale lacking a level indicator must be tilted by 50/1000 (5%)."""
        rp = rulepack_manager.get_active_rulepack()
        spec = InstrumentSpecification(
            accuracy_class=AccuracyClass.CLASS_III,
            max_capacity=Decimal("15"),
            min_capacity=Decimal("0.1"),
            e=Decimal("0.005"),
            d=Decimal("0.005"),
            unit=UnitOfMeasure.KILOGRAM,
            receptor_type=LoadReceptorType.PLATFORM,
            mobility=InstrumentMobility.PORTABLE,
            has_level_indicator=False,  # NO LEVEL INDICATOR
        )
        tilt_battery = generate_tilting_test_battery(
            spec, rp, VerificationStage.INITIAL_TYPE_APPROVAL
        )
        assert tilt_battery.is_applicable is True
        assert "50/1000" in tilt_battery.test_name


# ============================================================================
# 4. DISCRIMINATION, TARE & TANK SCALE TESTS
# ============================================================================


class TestDiscriminationAndTareTests:
    """Verifies Clause A.4.8 (Discrimination) and Clause A.4.6 (Tare)."""

    def test_discrimination_test_uses_1_point_4_d(
        self,
        platform_60kg_retail_scale: InstrumentSpecification,
        rulepack_manager: RulePackManager,
    ) -> None:
        """Discrimination test applies extra load of 1.4d = 1.4 * 0.02 = 0.028 kg."""
        rp = rulepack_manager.get_active_rulepack()
        disc_battery = generate_discrimination_test_battery(
            platform_60kg_retail_scale, rp, VerificationStage.INITIAL_TYPE_APPROVAL
        )
        assert disc_battery.is_applicable is True
        assert "1.4d" in disc_battery.description
        assert "0.028" in disc_battery.description
        assert len(disc_battery.target_loads) == 3  # Min, 50% Max, Max

    def test_tare_test_applicable_when_equipped(
        self,
        platform_60kg_retail_scale: InstrumentSpecification,
        rulepack_manager: RulePackManager,
    ) -> None:
        """Tare test is active when instrument has tare device."""
        rp = rulepack_manager.get_active_rulepack()
        tare_battery = generate_tare_test_battery(
            platform_60kg_retail_scale, rp, VerificationStage.INITIAL_TYPE_APPROVAL
        )
        assert tare_battery.is_applicable is True
        assert len(tare_battery.target_loads) == 2
        assert "Clause A.4.6" in tare_battery.statutory_clause

    def test_tare_test_exempt_when_device_absent(
        self,
        industrial_tank_scale: InstrumentSpecification,
        rulepack_manager: RulePackManager,
    ) -> None:
        """Tank scale without tare device is exempt from tare testing."""
        rp = rulepack_manager.get_active_rulepack()
        tare_battery = generate_tare_test_battery(
            industrial_tank_scale, rp, VerificationStage.INITIAL_TYPE_APPROVAL
        )
        assert tare_battery.is_applicable is False
        assert tare_battery.exemption_reason is not None

    def test_tank_scale_multi_support_eccentricity(
        self,
        industrial_tank_scale: InstrumentSpecification,
        rulepack_manager: RulePackManager,
    ) -> None:
        """Tank with 4 supports gets eccentricity test on each of the 4 supports."""
        rp = rulepack_manager.get_active_rulepack()
        ecc_battery = generate_eccentricity_test_battery(
            industrial_tank_scale, rp, VerificationStage.INITIAL_TYPE_APPROVAL
        )
        assert ecc_battery.is_applicable is True
        assert len(ecc_battery.target_loads) == 4
        positions = [pt.position for pt in ecc_battery.target_loads]
        assert positions == ["SUPPORT_1", "SUPPORT_2", "SUPPORT_3", "SUPPORT_4"]


# ============================================================================
# 5. MASTER TAM COMPILER & MULTI-INTERVAL INTEGRATION
# ============================================================================


class TestMasterTAMCompiler:
    """Verifies complete TestApplicabilityMatrix compilation."""

    def test_compile_tam_for_retail_platform_scale(
        self,
        platform_60kg_retail_scale: InstrumentSpecification,
        rulepack_manager: RulePackManager,
    ) -> None:
        """Verify full TAM matrix generation for retail scale."""
        rp = rulepack_manager.get_active_rulepack()
        tam: TestApplicabilityMatrix = generate_test_applicability_matrix(
            platform_60kg_retail_scale, rp, VerificationStage.INITIAL_TYPE_APPROVAL
        )

        assert tam.accuracy_class == AccuracyClass.CLASS_III
        assert tam.max_capacity == Decimal("60")
        assert tam.total_applicable_tests == 7  # All 7 tests active
        assert len(tam.test_suite) == 7
        assert len(tam.statutory_references) >= 3

    def test_compile_tam_for_weighbridge(
        self,
        weighbridge_50t: InstrumentSpecification,
        rulepack_manager: RulePackManager,
    ) -> None:
        """Verify full TAM matrix for weighbridge: tilting exempt -> 6 applicable tests."""
        rp = rulepack_manager.get_active_rulepack()
        tam: TestApplicabilityMatrix = generate_test_applicability_matrix(
            weighbridge_50t, rp, VerificationStage.INITIAL_TYPE_APPROVAL
        )

        assert tam.accuracy_class == AccuracyClass.CLASS_III
        assert tam.max_capacity == Decimal("50000")
        # Tilting test is exempt, so 6 applicable tests
        assert tam.total_applicable_tests == 6

        tilt_item = next(t for t in tam.test_suite if t.test_type == TestType.TILTING)
        assert tilt_item.is_applicable is False

    def test_temperature_test_battery_temperature_ranges(
        self,
        laboratory_analytical_balance: InstrumentSpecification,
        platform_60kg_retail_scale: InstrumentSpecification,
        rulepack_manager: RulePackManager,
    ) -> None:
        """Verify temperature span: Class I (+10 to +30 C), Class III (-10 to +40 C)."""
        rp = rulepack_manager.get_active_rulepack()
        temp_class_i = generate_temperature_test_battery(
            laboratory_analytical_balance, rp, VerificationStage.INITIAL_TYPE_APPROVAL
        )
        assert temp_class_i.is_applicable is True
        assert "+10 °C to +30 °C" in temp_class_i.description
        assert "Clause A.5.3.1" in temp_class_i.statutory_clause

        temp_class_iii = generate_temperature_test_battery(
            platform_60kg_retail_scale, rp, VerificationStage.INITIAL_TYPE_APPROVAL
        )
        assert temp_class_iii.is_applicable is True
        assert "-10 °C to +40 °C" in temp_class_iii.description

    def test_weighing_test_battery_includes_multi_interval_maxima(

        self, rulepack_manager: RulePackManager
    ) -> None:
        """Multi-interval scale includes range 1 Max in weighing test loads."""
        rp = rulepack_manager.get_active_rulepack()
        multi_spec = InstrumentSpecification(
            accuracy_class=AccuracyClass.CLASS_III,
            max_capacity=Decimal("15"),
            min_capacity=Decimal("0.04"),
            e=Decimal("0.002"),
            d=Decimal("0.002"),
            unit=UnitOfMeasure.KILOGRAM,
            is_multi_interval=True,
            intervals_array=[
                IntervalRange(
                    range_index=1,
                    min_capacity=Decimal("0.04"),
                    max_capacity=Decimal("6"),
                    e=Decimal("0.001"),
                    d=Decimal("0.001"),
                ),
                IntervalRange(
                    range_index=2,
                    min_capacity=Decimal("6"),
                    max_capacity=Decimal("15"),
                    e=Decimal("0.002"),
                    d=Decimal("0.002"),
                ),
            ],
        )


        weigh_battery = generate_weighing_test_battery(
            multi_spec, rp, VerificationStage.INITIAL_TYPE_APPROVAL
        )
        loads = [pt.load_nominal for pt in weigh_battery.target_loads]
        assert Decimal("6") in loads  # Range 1 Max included!
        assert Decimal("15") in loads  # Overall Max included!
