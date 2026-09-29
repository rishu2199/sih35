"""
METROLOGIX-76 — Metrological Types & Pydantic Data Models Unit Test Suite.

Verifies:
1. Exact lossless arithmetic: Decimal('0.1') + Decimal('0.2') == Decimal('0.3').
2. Strict prohibition of IEEE 754 floats across all legal metrology fields.
3. AccuracyClass, VerificationStage, and UnitOfMeasure enums with OIML citations.
4. Lossless unit conversions (mg, g, kg, t).
5. InstrumentSpecification validation rules (Max > Min, e >= d, positive intervals, multi-interval).
6. ObservationPoint digital changeover point math (P = I + 0.5e - Delta L) and error formulas.
7. Full JSON serialization and deserialization round-trip fidelity.
"""

from decimal import Decimal

import pytest
from pydantic import ValidationError

from app.core.schemas import (
    EccentricityObservation,
    EnvironmentalConditions,
    InstrumentSpecification,
    IntervalRange,
    LaboratoryDetails,
    ModelApprovalHeader,
    ObservationPoint,
    RepeatabilityRun,
)
from app.core.types import (
    AccuracyClass,
    ComplianceStatus,
    CornerPosition,
    UnitOfMeasure,
    VerificationStage,
    to_decimal,
)

# ============================================================================
# 1. Verification Test Gate: Lossless Decimal Arithmetic
# ============================================================================


class TestDecimalLosslessArithmetic:
    """Zero-Bug Metrology Gate: Float imprecision vs exact Decimal arithmetic."""

    def test_float_addition_imprecision_proof(self) -> None:
        """
        Proof of why float is illegal in legal metrology:
        IEEE 754 floating-point arithmetic fails elementary exactness.
        """
        float_sum = 0.1 + 0.2
        assert float_sum != 0.3
        assert str(float_sum) == "0.30000000000000004"

    def test_decimal_addition_exactness_gate(self) -> None:
        """
        Mandatory Verification Test Gate:
        Assert Decimal('0.1') + Decimal('0.2') == Decimal('0.3').
        """
        d1 = Decimal("0.1")
        d2 = Decimal("0.2")
        d3 = Decimal("0.3")
        assert d1 + d2 == d3

    def test_to_decimal_lossless_coercion(self) -> None:
        """Test to_decimal helper with valid types."""
        assert to_decimal("0.1") == Decimal("0.1")
        assert to_decimal(Decimal("0.1")) == Decimal("0.1")
        assert to_decimal(150) == Decimal("150")
        assert to_decimal("  42.500  ") == Decimal("42.500")

    def test_to_decimal_rejects_floats(self) -> None:
        """Strictly enforce that float inputs are rejected with ValueError."""
        with pytest.raises(ValueError, match="strictly prohibited in legal metrology"):
            to_decimal(0.1)

        with pytest.raises(ValueError, match="strictly prohibited in legal metrology"):
            to_decimal(100.5)

    def test_to_decimal_rejects_nan_and_infinity(self) -> None:
        """Reject invalid numerical states."""
        with pytest.raises(ValueError, match="NaN or Infinite"):
            to_decimal(Decimal("NaN"))

        with pytest.raises(ValueError, match="NaN or Infinite"):
            to_decimal(Decimal("Infinity"))

        with pytest.raises(ValueError, match="Invalid decimal literal"):
            to_decimal("not-a-number")


# ============================================================================
# 2. Metrological Enums & Conversion Engine
# ============================================================================


class TestAccuracyClass:
    """OIML R 76-1 Clause 3.2 & Seventh Schedule Table 17 accuracy classes."""

    def test_all_four_classes_exist(self) -> None:
        assert AccuracyClass.CLASS_I.value == "CLASS_I"
        assert AccuracyClass.CLASS_II.value == "CLASS_II"
        assert AccuracyClass.CLASS_III.value == "CLASS_III"
        assert AccuracyClass.CLASS_IIII.value == "CLASS_IIII"

    def test_class_properties(self) -> None:
        assert AccuracyClass.CLASS_I.roman == "I"
        assert AccuracyClass.CLASS_I.designation == "Special Accuracy"
        assert AccuracyClass.CLASS_I.class_number == 1
        assert "विशेष यथार्थता" in AccuracyClass.CLASS_I.hindi_name

        assert AccuracyClass.CLASS_III.roman == "III"
        assert AccuracyClass.CLASS_III.designation == "Medium Accuracy"
        assert AccuracyClass.CLASS_III.class_number == 3

        assert AccuracyClass.CLASS_IIII.roman == "IIII"
        assert AccuracyClass.CLASS_IIII.designation == "Ordinary Accuracy"

    def test_from_string_parsing(self) -> None:
        assert AccuracyClass.from_string("I") == AccuracyClass.CLASS_I
        assert AccuracyClass.from_string("Class 1") == AccuracyClass.CLASS_I
        assert AccuracyClass.from_string("special") == AccuracyClass.CLASS_I
        assert AccuracyClass.from_string("CLASS_II") == AccuracyClass.CLASS_II
        assert AccuracyClass.from_string("3") == AccuracyClass.CLASS_III
        assert AccuracyClass.from_string("III") == AccuracyClass.CLASS_III
        assert AccuracyClass.from_string("IV") == AccuracyClass.CLASS_IIII
        assert AccuracyClass.from_string("IIII") == AccuracyClass.CLASS_IIII
        assert AccuracyClass.from_string("ordinary") == AccuracyClass.CLASS_IIII

    def test_from_string_invalid(self) -> None:
        with pytest.raises(ValueError, match="Unknown AccuracyClass"):
            AccuracyClass.from_string("CLASS_V")


class TestVerificationStage:
    """OIML R 76-1 Clause 3.5.1 / 3.5.2 & Rule 74 MPE Doubling Rule."""

    def test_stages_and_multipliers(self) -> None:
        initial = VerificationStage.INITIAL_TYPE_APPROVAL
        in_service = VerificationStage.SUBSEQUENT_IN_SERVICE

        # Statutory Doubling Rule: In-service MPE = 2 x Initial MPE
        assert initial.mpe_multiplier == Decimal("1")
        assert in_service.mpe_multiplier == Decimal("2")

        assert "Initial Verification" in initial.description
        assert "Doubled MPE" in in_service.description

    def test_from_string(self) -> None:
        assert VerificationStage.from_string("initial") == VerificationStage.INITIAL_TYPE_APPROVAL
        assert (
            VerificationStage.from_string("type_approval")
            == VerificationStage.INITIAL_TYPE_APPROVAL
        )
        assert (
            VerificationStage.from_string("in_service") == VerificationStage.SUBSEQUENT_IN_SERVICE
        )
        assert (
            VerificationStage.from_string("re_verification")
            == VerificationStage.SUBSEQUENT_IN_SERVICE
        )


class TestUnitOfMeasure:
    """SI units of mass and lossless conversions."""

    def test_symbols_and_factors(self) -> None:
        assert UnitOfMeasure.MILLIGRAM.symbol == "mg"
        assert UnitOfMeasure.GRAM.symbol == "g"
        assert UnitOfMeasure.KILOGRAM.symbol == "kg"
        assert UnitOfMeasure.TONNE.symbol == "t"

        assert UnitOfMeasure.MILLIGRAM.to_kg_factor == Decimal("0.000001")
        assert UnitOfMeasure.GRAM.to_kg_factor == Decimal("0.001")
        assert UnitOfMeasure.KILOGRAM.to_kg_factor == Decimal("1")
        assert UnitOfMeasure.TONNE.to_kg_factor == Decimal("1000")

    def test_lossless_conversions(self) -> None:
        # 5000 grams to kilograms
        assert UnitOfMeasure.GRAM.convert_to(Decimal("5000"), UnitOfMeasure.KILOGRAM) == Decimal(
            "5"
        )

        # 0.05 kilograms to grams
        assert UnitOfMeasure.KILOGRAM.convert_to(Decimal("0.05"), UnitOfMeasure.GRAM) == Decimal(
            "50"
        )

        # 1.5 tonnes to kilograms
        assert UnitOfMeasure.TONNE.convert_to(Decimal("1.5"), UnitOfMeasure.KILOGRAM) == Decimal(
            "1500"
        )

        # 250 milligrams to grams
        assert UnitOfMeasure.MILLIGRAM.convert_to(Decimal("250"), UnitOfMeasure.GRAM) == Decimal(
            "0.25"
        )

    def test_from_symbol_and_string(self) -> None:
        assert UnitOfMeasure.from_symbol("kg") == UnitOfMeasure.KILOGRAM
        assert UnitOfMeasure.from_symbol("g") == UnitOfMeasure.GRAM
        assert UnitOfMeasure.from_symbol("mg") == UnitOfMeasure.MILLIGRAM
        assert UnitOfMeasure.from_symbol("t") == UnitOfMeasure.TONNE

        assert UnitOfMeasure.from_string("kilogram") == UnitOfMeasure.KILOGRAM
        assert UnitOfMeasure.from_string("G") == UnitOfMeasure.GRAM


# ============================================================================
# 3. InstrumentSpecification: Schema Validation & Invariants
# ============================================================================


class TestInstrumentSpecification:
    """Test OIML R 76-1 Non-Automatic Weighing Instrument specifications."""

    def test_valid_single_interval_class_iii(self) -> None:
        """Typical retail / platform scale: Max 150 kg, Min 1 kg, e = 50 g, d = 50 g."""
        spec = InstrumentSpecification(
            accuracy_class=AccuracyClass.CLASS_III,
            max_capacity=Decimal("150"),
            min_capacity=Decimal("1"),
            e=Decimal("0.05"),
            d=Decimal("0.05"),
            unit=UnitOfMeasure.KILOGRAM,
            manufacturer="National Scale Co.",
            model_name="NSC-150P",
            serial_number="2026-NAWI-001",
        )
        assert spec.accuracy_class == AccuracyClass.CLASS_III
        assert spec.max_capacity == Decimal("150")
        assert spec.min_capacity == Decimal("1")
        assert spec.e == Decimal("0.05")
        assert spec.d == Decimal("0.05")
        # n = Max / e = 150 / 0.05 = 3000
        assert spec.n == Decimal("3000")
        assert spec.is_multi_interval is False
        assert spec.get_e_for_load(Decimal("50")) == Decimal("0.05")

    def test_valid_high_precision_class_i(self) -> None:
        """Analytical laboratory balance: Max 220 g, Min 0.01 g, e = 1 mg, d = 0.1 mg."""
        spec = InstrumentSpecification(
            accuracy_class=AccuracyClass.CLASS_I,
            max_capacity=Decimal("220"),
            min_capacity=Decimal("0.01"),
            e=Decimal("0.001"),
            d=Decimal("0.0001"),
            unit=UnitOfMeasure.GRAM,
        )
        assert spec.accuracy_class == AccuracyClass.CLASS_I
        # n = 220 / 0.001 = 220,000 verification intervals
        assert spec.n == Decimal("220000")
        assert spec.e > spec.d

    def test_valid_multi_interval_dual_range(self) -> None:
        """
        Multi-interval instrument (OIML R 76-1 Clause 3.3):
        W1: Min = 0.02 kg, Max = 6 kg, e1 = 0.002 kg, d1 = 0.002 kg
        W2: Min = 6 kg, Max = 15 kg, e2 = 0.005 kg, d2 = 0.005 kg
        """
        r1 = IntervalRange(
            range_index=1,
            min_capacity=Decimal("0.02"),
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
            min_capacity=Decimal("0.02"),
            e=Decimal("0.005"),
            d=Decimal("0.005"),
            unit=UnitOfMeasure.KILOGRAM,
            is_multi_interval=True,
            intervals_array=[r1, r2],
        )
        assert spec.is_multi_interval is True
        assert len(spec.intervals_array or []) == 2
        # Resolving e for loads
        assert spec.get_e_for_load(Decimal("2.5")) == Decimal("0.002")  # in Range 1
        assert spec.get_e_for_load(Decimal("6.0")) == Decimal("0.002")  # boundary Range 1
        assert spec.get_e_for_load(Decimal("10.0")) == Decimal("0.005")  # in Range 2
        assert spec.get_e_for_load(Decimal("15.0")) == Decimal("0.005")  # at Max

    def test_reject_float_in_specification(self) -> None:
        """Passing float into any measurement field must raise ValidationError."""
        with pytest.raises(ValidationError) as exc_info:
            InstrumentSpecification(
                accuracy_class=AccuracyClass.CLASS_III,
                max_capacity=150.0,  # type: ignore[arg-type] # float rejected at runtime
                min_capacity=Decimal("1"),
                e=Decimal("0.05"),
                d=Decimal("0.05"),
            )
        assert "Float value 150.0 is strictly prohibited" in str(exc_info.value)

    def test_reject_max_less_than_or_equal_to_min(self) -> None:
        """Max must be strictly greater than Min."""
        with pytest.raises(ValidationError, match="strictly greater than Minimum capacity"):
            InstrumentSpecification(
                accuracy_class=AccuracyClass.CLASS_III,
                max_capacity=Decimal("10"),
                min_capacity=Decimal("10"),
                e=Decimal("0.05"),
                d=Decimal("0.05"),
            )

        with pytest.raises(ValidationError, match="strictly greater than Minimum capacity"):
            InstrumentSpecification(
                accuracy_class=AccuracyClass.CLASS_III,
                max_capacity=Decimal("5"),
                min_capacity=Decimal("10"),
                e=Decimal("0.05"),
                d=Decimal("0.05"),
            )

    def test_reject_e_less_than_d(self) -> None:
        """OIML R 76-1 Clause 3.1.2: e >= d is a non-negotiable physical law."""
        with pytest.raises(
            ValidationError, match="must be greater than or equal to actual scale interval d"
        ):
            InstrumentSpecification(
                accuracy_class=AccuracyClass.CLASS_III,
                max_capacity=Decimal("150"),
                min_capacity=Decimal("1"),
                e=Decimal("0.01"),  # e < d is invalid
                d=Decimal("0.05"),
            )

    def test_reject_non_positive_intervals(self) -> None:
        """Scale intervals e and d must be strictly positive."""
        with pytest.raises(ValidationError, match="must be strictly positive"):
            InstrumentSpecification(
                accuracy_class=AccuracyClass.CLASS_III,
                max_capacity=Decimal("150"),
                min_capacity=Decimal("1"),
                e=Decimal("0"),
                d=Decimal("0"),
            )

    def test_reject_invalid_multi_interval_ranges(self) -> None:
        """Multi-interval instruments must have valid consecutive, ascending ranges."""
        # Non-monotonic capacities: r1 Max (10) > r2 Max (9)
        r1 = IntervalRange(
            range_index=1,
            min_capacity=Decimal("0.02"),
            max_capacity=Decimal("10"),
            e=Decimal("0.002"),
            d=Decimal("0.002"),
        )
        r2 = IntervalRange(
            range_index=2,
            min_capacity=Decimal("5"),
            max_capacity=Decimal("9"),  # valid within r2 (9 > 5), but violates r1.Max < r2.Max
            e=Decimal("0.005"),
            d=Decimal("0.005"),
        )
        with pytest.raises(ValidationError, match="must be strictly less than"):
            InstrumentSpecification(
                accuracy_class=AccuracyClass.CLASS_III,
                max_capacity=Decimal("9"),
                min_capacity=Decimal("0.02"),
                e=Decimal("0.005"),
                d=Decimal("0.005"),
                is_multi_interval=True,
                intervals_array=[r1, r2],
            )

        # Multi-interval declared but empty intervals_array
        with pytest.raises(ValidationError, match="must specify an 'intervals_array'"):
            InstrumentSpecification(
                accuracy_class=AccuracyClass.CLASS_III,
                max_capacity=Decimal("15"),
                min_capacity=Decimal("0.02"),
                e=Decimal("0.005"),
                d=Decimal("0.005"),
                is_multi_interval=True,
                intervals_array=[],
            )

        # Non-monotonic scale intervals: e1 (0.005) >= e2 (0.002)
        r_desc_e1 = IntervalRange(
            range_index=1,
            min_capacity=Decimal("0.02"),
            max_capacity=Decimal("6"),
            e=Decimal("0.005"),
            d=Decimal("0.002"),
        )
        r_desc_e2 = IntervalRange(
            range_index=2,
            min_capacity=Decimal("6"),
            max_capacity=Decimal("15"),
            e=Decimal("0.002"),  # invalid: e2 < e1
            d=Decimal("0.002"),
        )
        with pytest.raises(ValidationError, match="must be strictly less than"):
            InstrumentSpecification(
                accuracy_class=AccuracyClass.CLASS_III,
                max_capacity=Decimal("15"),
                min_capacity=Decimal("0.02"),
                e=Decimal("0.005"),
                d=Decimal("0.002"),
                is_multi_interval=True,
                intervals_array=[r_desc_e1, r_desc_e2],
            )


# ============================================================================
# 4. ObservationPoint: Digital Changeover Math & Strict Decimal Parsing
# ============================================================================


class TestObservationPoint:
    """Test recorded test point, digital changeover point (P), and error formulas."""

    def test_valid_observation_point(self) -> None:
        point = ObservationPoint(
            load=Decimal("10000"),
            indication=Decimal("10000"),
            delta_load=Decimal("1.5"),
            e=Decimal("5"),
            d=Decimal("5"),
        )
        assert point.load == Decimal("10000")
        assert point.indication == Decimal("10000")
        assert point.delta_load == Decimal("1.5")
        assert point.e == Decimal("5")

    def test_oiml_changeover_point_textbook_math(self) -> None:
        """
        OIML R 76-1 Clause A.4.4.3 & Roadmap Step 04 reference example:
        Given:
            L = 10000, I = 10000, e = 5.0, Delta L = 1.5, E0 = +0.5
        Formula:
            P = I + 0.5e - Delta L = 10000 + 2.5 - 1.5 = 10001.0
            E = P - L = 10001.0 - 10000.0 = +1.0
            E_c = E - E0 = 1.0 - 0.5 = +0.5
        """
        obs = ObservationPoint(
            load=Decimal("10000.0"),
            indication=Decimal("10000.0"),
            delta_load=Decimal("1.5"),
            e=Decimal("5.0"),
        )
        p = obs.calculate_turning_point()
        assert p == Decimal("10001.0")

        e_uncorrected = obs.calculate_uncorrected_error()
        assert e_uncorrected == Decimal("1.0")

        e_corrected = obs.calculate_corrected_error(zero_error=Decimal("0.5"))
        assert e_corrected == Decimal("0.5")

    def test_reject_float_in_observation_point(self) -> None:
        """Ensure float load or indication is strictly rejected."""
        with pytest.raises(ValidationError, match="strictly prohibited in legal metrology"):
            ObservationPoint(
                load=100.5,  # type: ignore[arg-type] # float disallowed
                indication=Decimal("100.5"),
            )

        with pytest.raises(ValidationError, match="strictly prohibited in legal metrology"):
            ObservationPoint(
                load=Decimal("100"),
                indication=99.9,  # type: ignore[arg-type] # float disallowed
            )

    def test_reject_negative_measurements(self) -> None:
        with pytest.raises(ValidationError, match="cannot be negative"):
            ObservationPoint(
                load=Decimal("-10"),
                indication=Decimal("0"),
            )

    def test_reject_delta_load_exceeding_e(self) -> None:
        """Delta load cannot exceed verification scale interval e."""
        with pytest.raises(ValidationError, match="cannot exceed verification interval e"):
            ObservationPoint(
                load=Decimal("100"),
                indication=Decimal("100"),
                delta_load=Decimal("6"),  # 6 > e (5)
                e=Decimal("5"),
            )


# ============================================================================
# 5. Serialization Round-Trip Fidelity
# ============================================================================


class TestSerializationRoundTrip:
    """Zero-Bug Test: Pydantic v2 JSON serialization and deserialization integrity."""

    def test_instrument_specification_json_roundtrip(self) -> None:
        original = InstrumentSpecification(
            accuracy_class=AccuracyClass.CLASS_III,
            max_capacity=Decimal("150.00"),
            min_capacity=Decimal("1.00"),
            e=Decimal("0.05"),
            d=Decimal("0.05"),
            unit=UnitOfMeasure.KILOGRAM,
            manufacturer="Apex Metrology Ltd.",
            model_name="APX-3000",
            serial_number="SN-998877",
            approval_number="IND/09/2026/445",
        )

        # Serialize to JSON string
        json_str = original.model_dump_json()
        assert '"max_capacity":"150.00"' in json_str or '"max_capacity": "150.00"' in json_str
        assert (
            '"accuracy_class":"CLASS_III"' in json_str
            or '"accuracy_class": "CLASS_III"' in json_str
        )

        # Deserialize back
        restored = InstrumentSpecification.model_validate_json(json_str)

        assert original == restored
        assert isinstance(restored.max_capacity, Decimal)
        assert restored.max_capacity == Decimal("150.00")
        assert restored.n == Decimal("3000")

    def test_observation_point_json_roundtrip(self) -> None:
        obs = ObservationPoint(
            load=Decimal("50.000"),
            indication=Decimal("50.000"),
            delta_load=Decimal("0.025"),
            e=Decimal("0.050"),
            position=CornerPosition.CENTER,
            run_number=2,
            notes="Center loading repeatability verification",
        )

        json_str = obs.model_dump_json()
        restored = ObservationPoint.model_validate_json(json_str)

        assert obs == restored
        assert isinstance(restored.load, Decimal)
        assert restored.load == Decimal("50.000")
        assert restored.calculate_turning_point() == Decimal("50.000")


# ============================================================================
# 6. Supporting Test Procedures Schemas
# ============================================================================


class TestSupportingTestSchemas:
    """Verify Eccentricity, Repeatability, Environmental, and Header schemas."""

    def test_eccentricity_observation(self) -> None:
        ecc = EccentricityObservation(
            position=CornerPosition.FRONT_LEFT,
            load=Decimal("50"),
            indication=Decimal("50.02"),
            delta_load=Decimal("0.01"),
            e=Decimal("0.05"),
            corrected_error=Decimal("0.015"),
            mpe=Decimal("0.05"),
            status=ComplianceStatus.PASS,
        )
        assert ecc.position == CornerPosition.FRONT_LEFT
        assert ecc.status == ComplianceStatus.PASS

    def test_repeatability_run(self) -> None:
        run = RepeatabilityRun(
            run_number=1,
            load=Decimal("75"),
            indication=Decimal("75.00"),
            delta_load=Decimal("0.02"),
            e=Decimal("0.05"),
        )
        assert run.run_number == 1
        assert run.load == Decimal("75")

    def test_environmental_conditions(self) -> None:
        env = EnvironmentalConditions(
            temperature_celsius=Decimal("23.5"),
            relative_humidity_percent=Decimal("55.0"),
            atmospheric_pressure_hpa=Decimal("1013.25"),
            mains_voltage_volts=Decimal("230.1"),
            mains_frequency_hz=Decimal("50.0"),
        )
        assert env.temperature_celsius == Decimal("23.5")
        assert env.relative_humidity_percent == Decimal("55.0")

        # Invalid humidity > 100%
        with pytest.raises(ValidationError, match="between 0% and 100%"):
            EnvironmentalConditions(
                temperature_celsius=Decimal("20"),
                relative_humidity_percent=Decimal("105"),
            )

    def test_laboratory_details_and_header(self) -> None:
        lab = LaboratoryDetails(
            lab_name="Regional Reference Standards Laboratory (RRSL), Ahmedabad",
            accreditation_number="TC-5542",
            gatc_registration_number="GATC/2026/WR/012",
            test_officer_name="Dr. V. K. Sharma",
            test_officer_designation="Senior Metrology Officer",
        )
        assert "RRSL" in lab.lab_name

        header = ModelApprovalHeader(
            manufacturer_name="Avery India Ltd.",
            instrument_model="AV-2026-X",
            serial_number="AVL-88491",
            instrument_description="Electronic Counter Scale Class III",
        )
        assert header.instrument_model == "AV-2026-X"
