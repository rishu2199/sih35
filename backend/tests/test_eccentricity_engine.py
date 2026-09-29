"""Test suite for METROLOGIX-76 OIML R 76-1 Clause A.4.7 Eccentricity Test Engine.

Verifies:
- Nominal test load calculation across platform, multi-support, weighbridge, and hopper scales
- Platter 2D normalized coordinate mapping for UI visual heatmap rendering
- Single-point digital changeover error and stage-aware Table 6 MPE resolution
- Verification Test Gate (Scenario 4):
  * Pass condition when all corners remain strictly within MPE
  * Fail condition when Front-Right corner deflects beyond tolerance (+62 g vs +/-50 g)
  * Cantilever deflection detection and physical diagnostic explanation
- Inter-corner spread Delta E_corner = E_c,max - E_c,min
- Prescribed OIML loading sequence compliance (Center -> FL -> BL -> BR -> FR)
- Initial Verification (1x Table 6) vs In-Service Inspection (2x Table 6) doubling
"""

from __future__ import annotations

from decimal import Decimal

import pytest

from app.core.eccentricity_engine import (
    calculate_eccentricity_test_load,
    evaluate_corner_point,
    evaluate_eccentricity_session,
    get_platter_coordinate,
    get_standard_corner_positions,
)
from app.core.schemas import (
    EccentricityObservation,
    InstrumentSpecification,
)
from app.core.types import (
    AccuracyClass,
    ComplianceStatus,
    CornerPosition,
    LoadReceptorType,
    UnitOfMeasure,
    VerificationStage,
)

# ============================================================================
# 1. Test Load Derivation Tests
# ============================================================================


class TestEccentricityTestLoadCalculation:
    """Verify statutory nominal test load derivation across receptor configurations."""

    def test_standard_4_point_platform_load(self) -> None:
        """Clause A.4.7.1: Platform with <= 4 supports -> 1/3 Max."""
        max_cap = Decimal("150")  # 150 kg industrial scale
        load = calculate_eccentricity_test_load(
            max_capacity=max_cap,
            receptor_type=LoadReceptorType.PLATFORM,
            num_supports=4,
        )
        assert load == Decimal("50.0000")  # 150 / 3 = 50 kg

    def test_standard_4_point_platform_with_additive_tare(self) -> None:
        """Clause A.4.7.1: Load = 1/3 (Max + Additive Tare)."""
        max_cap = Decimal("15")  # 15 kg retail scale
        additive_tare = Decimal("3")  # 3 kg additive tare
        load = calculate_eccentricity_test_load(
            max_capacity=max_cap,
            receptor_type=LoadReceptorType.PLATFORM,
            num_supports=4,
            additive_tare=additive_tare,
        )
        # (15 + 3) / 3 = 6.0000 kg
        assert load == Decimal("6.0000")

    def test_multi_support_platform_load(self) -> None:
        """Clause A.4.7.2: Platform with > 4 supports -> 1 / (N - 1) Max."""
        max_cap = Decimal("1000")  # 1000 kg large platform with 6 load cells
        load = calculate_eccentricity_test_load(
            max_capacity=max_cap,
            receptor_type=LoadReceptorType.PLATFORM,
            num_supports=6,
        )
        # 1000 / (6 - 1) = 1000 / 5 = 200 kg
        assert load == Decimal("200.0000")

    def test_vehicle_weighbridge_rolling_load(self) -> None:
        """Clause A.4.7.4: Vehicle weighbridge -> 0.8 Max standard rolling axle load."""
        max_cap = Decimal("50000")  # 50 metric ton weighbridge
        load = calculate_eccentricity_test_load(
            max_capacity=max_cap,
            receptor_type=LoadReceptorType.WEIGHBRIDGE,
        )
        # 50,000 * 0.8 = 40,000 kg
        assert load == Decimal("40000.0000")

    def test_hanging_crane_scale_load(self) -> None:
        """Clause 3.6.2.4: Suspended / crane scale -> 0.5 Max."""
        max_cap = Decimal("5000")
        load = calculate_eccentricity_test_load(
            max_capacity=max_cap,
            receptor_type=LoadReceptorType.HANGING,
        )
        # 5000 * 0.5 = 2500 kg
        assert load == Decimal("2500.0000")

    def test_tank_hopper_scale_load(self) -> None:
        """Clause A.4.7.3: Hopper scale with 4 supports -> 0.1 Max."""
        max_cap = Decimal("2000")
        load = calculate_eccentricity_test_load(
            max_capacity=max_cap,
            receptor_type=LoadReceptorType.TANK,
            num_supports=4,
        )
        assert load == Decimal("200.0000")

    def test_invalid_parameters_raise_value_error(self) -> None:
        with pytest.raises(ValueError, match="Max capacity must be strictly positive"):
            calculate_eccentricity_test_load(max_capacity=Decimal("0"))
        with pytest.raises(ValueError, match="Number of support points must be >= 1"):
            calculate_eccentricity_test_load(max_capacity=Decimal("100"), num_supports=0)
        with pytest.raises(ValueError, match="Additive tare cannot be negative"):
            calculate_eccentricity_test_load(
                max_capacity=Decimal("100"),
                additive_tare=Decimal("-1"),
            )


# ============================================================================
# 2. Platter Coordinate Mapping Tests
# ============================================================================


class TestPlatterCoordinateMapping:
    """Verify 2D normalized coordinates for heatmap and platter UI rendering."""

    def test_center_coordinate(self) -> None:
        coord = get_platter_coordinate(CornerPosition.CENTER)
        assert coord.x_norm == Decimal("0.0")
        assert coord.y_norm == Decimal("0.0")
        assert coord.display_x_pct == Decimal("50.0")
        assert coord.display_y_pct == Decimal("50.0")

    def test_four_corners_coordinates(self) -> None:
        fl = get_platter_coordinate(CornerPosition.FRONT_LEFT)
        assert fl.x_norm == Decimal("-1.0")
        assert fl.y_norm == Decimal("-1.0")
        assert fl.display_x_pct == Decimal("15.0")
        assert fl.display_y_pct == Decimal("85.0")

        bl = get_platter_coordinate(CornerPosition.BACK_LEFT)
        assert bl.x_norm == Decimal("-1.0")
        assert bl.y_norm == Decimal("1.0")

        br = get_platter_coordinate(CornerPosition.BACK_RIGHT)
        assert br.x_norm == Decimal("1.0")
        assert br.y_norm == Decimal("1.0")

        fr = get_platter_coordinate(CornerPosition.FRONT_RIGHT)
        assert fr.x_norm == Decimal("1.0")
        assert fr.y_norm == Decimal("-1.0")

    def test_weighbridge_track_coordinates(self) -> None:
        entry = get_platter_coordinate("TRACK_ENTRY")
        assert entry.x_norm == Decimal("-1.0")
        assert entry.y_norm == Decimal("0.0")

        mid = get_platter_coordinate("TRACK_MIDDLE")
        assert mid.x_norm == Decimal("0.0")
        assert mid.y_norm == Decimal("0.0")

        exit_c = get_platter_coordinate("TRACK_EXIT")
        assert exit_c.x_norm == Decimal("1.0")
        assert exit_c.y_norm == Decimal("0.0")


# ============================================================================
# 3. Single Corner Point Evaluation Tests
# ============================================================================


class TestSingleCornerEvaluation:
    """Verify individual corner turning point and MPE calculations."""

    def test_corner_point_zero_error(self) -> None:
        """L = 50 kg, e = 0.05 kg, I = 50 kg, Delta L = 0.025 kg -> P = 50 kg, E = 0."""
        load = Decimal("50")
        e = Decimal("0.05")
        point = evaluate_corner_point(
            position=CornerPosition.CENTER,
            load=load,
            indication=load,
            e=e,
            delta_load=Decimal("0.025"),  # 0.5 * e
            zero_error=Decimal("0"),
            accuracy_class=AccuracyClass.CLASS_III,
        )
        assert point.turning_point == Decimal("50.000")
        assert point.uncorrected_error == Decimal("0.000")
        assert point.corrected_error == Decimal("0.000")
        assert point.status == ComplianceStatus.PASS
        assert point.margin == point.mpe.mpe_value

    def test_corner_point_with_baseline_zero_error(self) -> None:
        """Verify baseline zero error E_0 subtraction."""
        load = Decimal("50")
        e = Decimal("0.05")
        # I = 50.05, Delta L = 0.025 -> P = 50.05 + 0.025 - 0.025 = 50.05 -> E = +0.05
        # If zero error E_0 = +0.02 -> E_c = +0.05 - 0.02 = +0.03
        point = evaluate_corner_point(
            position=CornerPosition.FRONT_LEFT,
            load=load,
            indication=Decimal("50.05"),
            e=e,
            delta_load=Decimal("0.025"),
            zero_error=Decimal("0.02"),
            accuracy_class=AccuracyClass.CLASS_III,
        )
        assert point.uncorrected_error == Decimal("0.050")
        assert point.corrected_error == Decimal("0.030")
        assert point.status == ComplianceStatus.PASS

    def test_corner_point_boundary_marginal(self) -> None:
        """At L=50 kg, e=0.05 kg (1000e), MPE is +/-1.0e = +/-0.05 kg."""
        load = Decimal("50")
        e = Decimal("0.05")
        point = evaluate_corner_point(
            position=CornerPosition.BACK_LEFT,
            load=load,
            indication=Decimal("50.05"),
            e=e,
            delta_load=Decimal("0.025"),
            zero_error=Decimal("0"),
            accuracy_class=AccuracyClass.CLASS_III,
        )
        assert point.corrected_error == Decimal("0.050")
        assert point.margin == Decimal("0.000")
        assert point.status == ComplianceStatus.MARGINAL


# ============================================================================
# 4. VERIFICATION TEST GATE: Scenario 4 & Deflection Diagnostics
# ============================================================================


class TestVerificationTestGateScenario4:
    """OIML R 76-1 Clause A.4.7 Verification Test Gate.

    Based on statutory Scenario 4 from legal metrology test documentation:
    - Instrument: Class III Industrial Platform Scale (Max = 150 kg, e = 50 g = 0.05 kg).
    - Prescribed nominal load: L = 1/3 Max = 50 kg (1000e).
    - Table 6 MPE at 1000e: +/-1.0e = +/-0.05 kg (+/-50 g).

    Gates:
    1. Pass Gate: All corners within +/-50 g -> PASS.
    2. Fail Gate: Front-Right corner deflects beyond tolerance (E_c = +62 g) -> FAIL.
    """

    @pytest.fixture
    def industrial_platform_spec(self) -> InstrumentSpecification:
        return InstrumentSpecification(
            serial_number="RRSL-PLATFORM-150KG",
            manufacturer="Metrologix Bharat",
            model_name="IND-PL-150",
            accuracy_class=AccuracyClass.CLASS_III,
            max_capacity=Decimal("150"),
            min_capacity=Decimal("1"),
            e=Decimal("0.05"),  # 50 g
            d=Decimal("0.05"),
            unit=UnitOfMeasure.KILOGRAM,
            receptor_type=LoadReceptorType.PLATFORM,
            num_supports=4,
        )

    def test_pass_gate_all_corners_within_tolerance(
        self,
        industrial_platform_spec: InstrumentSpecification,
    ) -> None:
        """VERIFICATION TEST GATE: Pass condition when all corners < MPE."""
        # Test load L = 50 kg. e = 0.05 kg. Delta L = 0.025 kg -> P = I.
        observations = [
            EccentricityObservation(
                position=CornerPosition.CENTER,
                load=Decimal("50"),
                indication=Decimal("50.00"),
                delta_load=Decimal("0.025"),
                e=Decimal("0.05"),
            ),
            EccentricityObservation(
                position=CornerPosition.FRONT_LEFT,
                load=Decimal("50"),
                indication=Decimal("50.00"),
                delta_load=Decimal("0.035"),  # E = -0.010 kg (-10 g)
                e=Decimal("0.05"),
            ),
            EccentricityObservation(
                position=CornerPosition.BACK_LEFT,
                load=Decimal("50"),
                indication=Decimal("50.00"),
                delta_load=Decimal("0.015"),  # E = +0.010 kg (+10 g)
                e=Decimal("0.05"),
            ),
            EccentricityObservation(
                position=CornerPosition.BACK_RIGHT,
                load=Decimal("50"),
                indication=Decimal("50.00"),
                delta_load=Decimal("0.010"),  # E = +0.015 kg (+15 g)
                e=Decimal("0.05"),
            ),
            EccentricityObservation(
                position=CornerPosition.FRONT_RIGHT,
                load=Decimal("50"),
                indication=Decimal("50.00"),
                delta_load=Decimal("0.005"),  # E = +0.020 kg (+20 g)
                e=Decimal("0.05"),
            ),
        ]

        result = evaluate_eccentricity_session(
            observations=observations,
            spec=industrial_platform_spec,
            stage=VerificationStage.INITIAL_TYPE_APPROVAL,
        )

        assert result.overall_status == ComplianceStatus.PASS
        assert result.test_load_calculated == Decimal("50.0000")
        assert result.mpe_limit == Decimal("0.05")
        assert result.max_absolute_error == Decimal("0.020")
        assert result.corner_error_spread == Decimal("0.030")  # +0.020 - (-0.010) = 0.030 kg
        assert result.sequence_is_compliant is True
        assert result.cantilever_deflection_detected is False

    def test_fail_gate_front_right_corner_deflects_beyond_tolerance(
        self,
        industrial_platform_spec: InstrumentSpecification,
    ) -> None:
        """VERIFICATION TEST GATE: Fail condition when Front-Right deflects beyond tolerance.

        Scenario 4 parameters:
        - Corner 1 (FL): E_c = -10 g (-0.010 kg) -> PASS
        - Corner 2 (BL): E_c = +15 g (+0.015 kg) -> PASS
        - Corner 3 (BR): E_c = +20 g (+0.020 kg) -> PASS
        - Corner 4 (FR): E_c = +62 g (+0.062 kg) > MPE (+/-50 g) -> FAIL!
        """
        # Load = 50 kg, e = 0.05 kg.
        # For FR to have E_c = +0.062 kg:
        # P = 50.062 -> I = 50.05, Delta L = 0.05 * 0.5 - 0.012 = 0.013 kg.
        # P = 50.05 + 0.025 - 0.013 = 50.062 kg -> E = 50.062 - 50 = +0.062 kg (+62 g).
        observations = [
            EccentricityObservation(
                position=CornerPosition.CENTER,
                load=Decimal("50"),
                indication=Decimal("50.00"),
                delta_load=Decimal("0.020"),  # E = +0.005 kg (+5 g)
                e=Decimal("0.05"),
            ),
            EccentricityObservation(
                position=CornerPosition.FRONT_LEFT,
                load=Decimal("50"),
                indication=Decimal("50.00"),
                delta_load=Decimal("0.035"),  # E = -0.010 kg (-10 g)
                e=Decimal("0.05"),
            ),
            EccentricityObservation(
                position=CornerPosition.BACK_LEFT,
                load=Decimal("50"),
                indication=Decimal("50.00"),
                delta_load=Decimal("0.010"),  # E = +0.015 kg (+15 g)
                e=Decimal("0.05"),
            ),
            EccentricityObservation(
                position=CornerPosition.BACK_RIGHT,
                load=Decimal("50"),
                indication=Decimal("50.00"),
                delta_load=Decimal("0.005"),  # E = +0.020 kg (+20 g)
                e=Decimal("0.05"),
            ),
            EccentricityObservation(
                position=CornerPosition.FRONT_RIGHT,
                load=Decimal("50"),
                indication=Decimal("50.05"),
                delta_load=Decimal("0.013"),  # E = 50.05 + 0.025 - 0.013 - 50 = +0.062 kg (+62 g)
                e=Decimal("0.05"),
            ),
        ]

        result = evaluate_eccentricity_session(
            observations=observations,
            spec=industrial_platform_spec,
            stage=VerificationStage.INITIAL_TYPE_APPROVAL,
        )

        # Statutory Assertions
        assert result.overall_status == ComplianceStatus.FAIL
        assert result.mpe_limit == Decimal("0.05")  # 50 g
        assert result.worst_point.position == CornerPosition.FRONT_RIGHT
        assert result.worst_point.corrected_error == Decimal("0.062")
        assert result.worst_point.status == ComplianceStatus.FAIL

        # Diagnostic and cantilever detection verification
        assert result.cantilever_deflection_detected is True
        assert result.cantilever_diagnosis is not None
        assert "Front-Right" in result.cantilever_diagnosis
        assert "cantilever deflection" in result.cantilever_diagnosis.lower()

        # Spread: +0.062 - (-0.010) = 0.072 kg (72 g)
        assert result.corner_error_spread == Decimal("0.072")


# ============================================================================
# 5. In-Service vs Initial Verification Stage Awareness
# ============================================================================


class TestStageAwarenessInitialVsInService:
    """Verify that In-Service inspection (2x Table 6) applies correctly to eccentricity."""

    def test_in_service_doubling_passes_borderline_error(self) -> None:
        """An error of +62 g fails initial verification (MPE +/-50 g),

        but passes subsequent in-service inspection where MPE is doubled (+/-100 g).
        """
        spec = InstrumentSpecification(
            serial_number="INSPECTION-SCALE-001",
            manufacturer="Standard Scales India",
            model_name="SSI-150",
            accuracy_class=AccuracyClass.CLASS_III,
            max_capacity=Decimal("150"),
            min_capacity=Decimal("1"),
            e=Decimal("0.05"),
            d=Decimal("0.05"),
            unit=UnitOfMeasure.KILOGRAM,
            receptor_type=LoadReceptorType.PLATFORM,
            num_supports=4,
        )

        obs = [
            EccentricityObservation(
                position=CornerPosition.CENTER,
                load=Decimal("50"),
                indication=Decimal("50.00"),
                delta_load=Decimal("0.025"),
                e=Decimal("0.05"),
            ),
            EccentricityObservation(
                position=CornerPosition.FRONT_RIGHT,
                load=Decimal("50"),
                indication=Decimal("50.05"),
                delta_load=Decimal("0.013"),  # E_c = +0.062 kg (+62 g)
                e=Decimal("0.05"),
            ),
        ]

        # 1. Under Initial Verification -> FAIL
        initial_res = evaluate_eccentricity_session(
            observations=obs,
            spec=spec,
            stage=VerificationStage.INITIAL_TYPE_APPROVAL,
        )
        assert initial_res.overall_status == ComplianceStatus.FAIL
        assert initial_res.mpe_limit == Decimal("0.05")  # +/-50 g

        # 2. Under Subsequent In-Service Inspection -> PASS (doubled corridor +/-100 g)
        in_service_res = evaluate_eccentricity_session(
            observations=obs,
            spec=spec,
            stage=VerificationStage.SUBSEQUENT_IN_SERVICE,
        )
        assert in_service_res.overall_status == ComplianceStatus.PASS
        assert in_service_res.mpe_limit == Decimal("0.10")  # +/-100 g


# ============================================================================
# 6. Sequence Compliance & Standard Positions Tests
# ============================================================================


class TestSequenceComplianceAndPositions:
    """Verify OIML R 76-1 Clause A.4.7.1 sequence validation and receptor positions."""

    def test_standard_corner_positions_helper(self) -> None:
        positions_4 = get_standard_corner_positions(LoadReceptorType.PLATFORM, num_supports=4)
        assert len(positions_4) == 5
        assert positions_4[0][0] == CornerPosition.CENTER
        assert positions_4[1][0] == CornerPosition.FRONT_LEFT

        positions_6 = get_standard_corner_positions(LoadReceptorType.PLATFORM, num_supports=6)
        assert len(positions_6) == 6
        assert positions_6[0][0] == "SUPPORT_1"

        wb_positions = get_standard_corner_positions(LoadReceptorType.WEIGHBRIDGE)
        assert len(wb_positions) == 3
        assert wb_positions[0][0] == "TRACK_ENTRY"

    def test_out_of_order_sequence_detected(self) -> None:
        spec = InstrumentSpecification(
            serial_number="TEST-SCALE-002",
            manufacturer="Standard Scales",
            model_name="SS-150",
            accuracy_class=AccuracyClass.CLASS_III,
            max_capacity=Decimal("150"),
            min_capacity=Decimal("1"),
            e=Decimal("0.05"),
            d=Decimal("0.05"),
            unit=UnitOfMeasure.KILOGRAM,
            receptor_type=LoadReceptorType.PLATFORM,
            num_supports=4,
        )

        # Scrambled sequence starting with FRONT_RIGHT instead of CENTER
        scrambled_obs = [
            EccentricityObservation(
                position=CornerPosition.FRONT_RIGHT,
                load=Decimal("50"),
                indication=Decimal("50.00"),
                delta_load=Decimal("0.025"),
                e=Decimal("0.05"),
            ),
            EccentricityObservation(
                position=CornerPosition.CENTER,
                load=Decimal("50"),
                indication=Decimal("50.00"),
                delta_load=Decimal("0.025"),
                e=Decimal("0.05"),
            ),
            EccentricityObservation(
                position=CornerPosition.FRONT_LEFT,
                load=Decimal("50"),
                indication=Decimal("50.00"),
                delta_load=Decimal("0.025"),
                e=Decimal("0.05"),
            ),
            EccentricityObservation(
                position=CornerPosition.BACK_LEFT,
                load=Decimal("50"),
                indication=Decimal("50.00"),
                delta_load=Decimal("0.025"),
                e=Decimal("0.05"),
            ),
            EccentricityObservation(
                position=CornerPosition.BACK_RIGHT,
                load=Decimal("50"),
                indication=Decimal("50.00"),
                delta_load=Decimal("0.025"),
                e=Decimal("0.05"),
            ),
        ]

        res = evaluate_eccentricity_session(
            observations=scrambled_obs,
            spec=spec,
            stage=VerificationStage.INITIAL_TYPE_APPROVAL,
        )
        assert res.sequence_is_compliant is False
        assert res.sequence_notes is not None
        assert "deviated from OIML R 76-1" in res.sequence_notes

    def test_empty_observations_raises_value_error(self) -> None:
        spec = InstrumentSpecification(
            serial_number="EMPTY-TEST",
            manufacturer="Standard",
            model_name="M-1",
            accuracy_class=AccuracyClass.CLASS_III,
            max_capacity=Decimal("100"),
            min_capacity=Decimal("1"),
            e=Decimal("0.05"),
            d=Decimal("0.05"),
            unit=UnitOfMeasure.KILOGRAM,
        )
        with pytest.raises(ValueError, match="empty observations"):
            evaluate_eccentricity_session(observations=[], spec=spec)
