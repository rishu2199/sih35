"""Test suite for METROLOGIX-76 OIML R 111 Standard Weight & Equipment Traceability Lockout Engine.

Statutory References:
- OIML R 111-1:2004:
  * Clause 5.2: Maximum expanded uncertainty of standard weights: U <= (1/3) * delta_m.
  * Table 1: Maximum permissible errors for weights (classes E1, E2, F1, F2, M1, M2, M3).
- OIML R 76-1:2006:
  * Clause 3.7.1: Standard weights used for testing shall not have an error or expanded
    uncertainty greater than 1/3 of the MPE of the instrument for the applied load:
    U(k=2) <= (1/3) * MPE(L).
  * Class adequacy: Class I requires E1/E2; Class II requires E2/F1 (F2 conditional);
    Class III requires F2/M1 (M2 conditional); Class IIII requires M1/M2/M3.
- Legal Metrology (General) Rules, 2011:
  * First Schedule & Seventh Schedule: Reference, Secondary, and Working standard weights.
  * Calibration certificate validity rules: Uncalibrated or expired weights hard-lock
    the test session workspace to prevent illegal or invalid verification.

Verification Test Gate:
- Pytest checking that an expired calibration certificate triggers a metrological hard lockout.
- Pytest checking that an M2 weight on a Class II scale triggers a metrological hard lockout.
- Pytest checking standard weight class adequacy across all accuracy classes (E1..M3).
- Pytest checking one-third uncertainty rule: U(k=2) <= (1/3) * MPE.
- Pytest checking nominal range coverage and active commissioning status.
- Pytest checking hard-lock gate enforcement raising TraceabilityLockoutError.
"""

from __future__ import annotations

from datetime import UTC, datetime, timedelta
from decimal import Decimal

import pytest

from app.core.schemas import InstrumentSpecification
from app.core.traceability_validator import (
    ONE_THIRD_FACTOR,
    StandardWeightSetInput,
    TraceabilityLockoutError,
    TraceabilityValidationResult,
    calculate_critical_allowable_uncertainty,
    check_calibration_validity,
    check_weight_class_adequacy,
    convert_mass,
    enforce_traceability_lockout,
    evaluate_uncertainty_at_load,
    lookup_oiml_r111_default_uncertainty,
    lookup_oiml_r111_mpe,
    validate_standard_weight_set,
)
from app.core.types import (
    AccuracyClass,
    ComplianceStatus,
    LockoutReason,
    TraceabilityStatus,
    UnitOfMeasure,
    WeightClass,
)

# ============================================================================
# Test Fixtures: Instrument Specifications
# ============================================================================


@pytest.fixture
def class_i_analytical_balance() -> InstrumentSpecification:
    """Class I Special Accuracy analytical balance (Max=220 g, e=1 mg, d=0.1 mg)."""
    return InstrumentSpecification(
        accuracy_class=AccuracyClass.CLASS_I,
        max_capacity=Decimal("220"),
        min_capacity=Decimal("0.01"),
        e=Decimal("0.001"),  # 1 mg = 0.001 g
        d=Decimal("0.0001"),  # 0.1 mg
        unit=UnitOfMeasure.GRAM,
    )


@pytest.fixture
def class_ii_precision_scale() -> InstrumentSpecification:
    """Class II High Accuracy laboratory scale (Max=6000 g, e=0.1 g, d=0.01 g)."""
    return InstrumentSpecification(
        accuracy_class=AccuracyClass.CLASS_II,
        max_capacity=Decimal("6000"),
        min_capacity=Decimal("5"),
        e=Decimal("0.1"),  # 100 mg = 0.1 g
        d=Decimal("0.01"),
        unit=UnitOfMeasure.GRAM,
    )


@pytest.fixture
def class_iii_bench_scale() -> InstrumentSpecification:
    """Class III Medium Accuracy commercial bench scale (Max=30 kg, e=10 g, d=10 g)."""
    return InstrumentSpecification(
        accuracy_class=AccuracyClass.CLASS_III,
        max_capacity=Decimal("30"),
        min_capacity=Decimal("0.2"),  # 20e = 200 g = 0.2 kg
        e=Decimal("0.01"),  # 10 g = 0.01 kg
        d=Decimal("0.01"),
        unit=UnitOfMeasure.KILOGRAM,
    )


@pytest.fixture
def class_iiii_crane_scale() -> InstrumentSpecification:
    """Class IIII Ordinary Accuracy heavy crane scale (Max=5000 kg, e=2 kg)."""
    return InstrumentSpecification(
        accuracy_class=AccuracyClass.CLASS_IIII,
        max_capacity=Decimal("5000"),
        min_capacity=Decimal("100"),
        e=Decimal("2"),
        d=Decimal("2"),
        unit=UnitOfMeasure.KILOGRAM,
    )


# ============================================================================
# Test Fixtures: Standard Weight Sets
# ============================================================================


@pytest.fixture
def reference_e2_weight_set() -> StandardWeightSetInput:
    """OIML Class E2 Reference Standard Set (1 mg to 500 g)."""
    now = datetime.now(UTC)
    return StandardWeightSetInput(
        identification_code="RRSL-SET-E2-001",
        weight_class=WeightClass.E2,
        calibration_certificate_number="NPLI-CAL-2026-E2-0842",
        calibrated_by="National Physical Laboratory India (NPLI)",
        calibration_date=now - timedelta(days=90),
        validity_date=now + timedelta(days=275),
        nominal_min_value=Decimal("0.001"),  # 1 mg in g
        nominal_max_value=Decimal("500"),  # 500 g
        unit=UnitOfMeasure.GRAM,
        expanded_uncertainty_k2=Decimal("0.00005"),  # 0.05 mg in g
        is_active=True,
    )


@pytest.fixture
def reference_f1_weight_set() -> StandardWeightSetInput:
    """OIML Class F1 Working Standard Set (1 g to 10 kg)."""
    now = datetime.now(UTC)
    return StandardWeightSetInput(
        identification_code="RRSL-SET-F1-042",
        weight_class=WeightClass.F1,
        calibration_certificate_number="RRSL-BLR-2026-F1-110",
        calibrated_by="RRSL Bengaluru",
        calibration_date=now - timedelta(days=60),
        validity_date=now + timedelta(days=305),
        nominal_min_value=Decimal("1"),  # 1 g
        nominal_max_value=Decimal("10000"),  # 10 kg in g
        unit=UnitOfMeasure.GRAM,
        expanded_uncertainty_k2=Decimal("0.0015"),  # 1.5 mg in g
        is_active=True,
    )


@pytest.fixture
def working_m1_weight_set() -> StandardWeightSetInput:
    """OIML Class M1 Commercial Verification Weight Set (100 g to 50 kg)."""
    now = datetime.now(UTC)
    return StandardWeightSetInput(
        identification_code="LM-DLH-M1-778",
        weight_class=WeightClass.M1,
        calibration_certificate_number="DLH-LM-2026-M1-992",
        calibrated_by="Delhi State Legal Metrology Central Lab",
        calibration_date=now - timedelta(days=120),
        validity_date=now + timedelta(days=245),
        nominal_min_value=Decimal("0.1"),  # 100 g in kg
        nominal_max_value=Decimal("50"),  # 50 kg
        unit=UnitOfMeasure.KILOGRAM,
        expanded_uncertainty_k2=Decimal("0.0005"),  # 0.5 g in kg
        is_active=True,
    )


# ============================================================================
# 1. OIML R 111 Table 1 MPE & Uncertainty Lookups
# ============================================================================


def test_oiml_r111_table_1_nominal_mpe_values() -> None:
    """Verify statutory Table 1 MPE values for 1 kg across classes E1 to M3."""
    one_kg_g = Decimal("1000")
    mpe_e1 = lookup_oiml_r111_mpe(one_kg_g, WeightClass.E1, UnitOfMeasure.GRAM)
    mpe_e2 = lookup_oiml_r111_mpe(one_kg_g, WeightClass.E2, UnitOfMeasure.GRAM)
    mpe_f1 = lookup_oiml_r111_mpe(one_kg_g, WeightClass.F1, UnitOfMeasure.GRAM)
    mpe_f2 = lookup_oiml_r111_mpe(one_kg_g, WeightClass.F2, UnitOfMeasure.GRAM)
    mpe_m1 = lookup_oiml_r111_mpe(one_kg_g, WeightClass.M1, UnitOfMeasure.GRAM)
    mpe_m2 = lookup_oiml_r111_mpe(one_kg_g, WeightClass.M2, UnitOfMeasure.GRAM)
    mpe_m3 = lookup_oiml_r111_mpe(one_kg_g, WeightClass.M3, UnitOfMeasure.GRAM)

    # 1 kg MPE in grams: E1=0.5mg (0.0005g), E2=1.6mg (0.0016g), F1=5.0mg (0.005g),
    # F2=16mg (0.016g), M1=50mg (0.050g), M2=160mg (0.160g), M3=500mg (0.500g)
    assert mpe_e1 == Decimal("0.0005")
    assert mpe_e2 == Decimal("0.0016")
    assert mpe_f1 == Decimal("0.0050")
    assert mpe_f2 == Decimal("0.0160")
    assert mpe_m1 == Decimal("0.0500")
    assert mpe_m2 == Decimal("0.1600")
    assert mpe_m3 == Decimal("0.5000")


def test_oiml_r111_default_uncertainty_is_one_third_mpe() -> None:
    """Verify default uncertainty lookup satisfies U <= (1/3) * delta_m per Clause 5.2."""
    load = Decimal("100")  # 100 g
    mpe = lookup_oiml_r111_mpe(load, WeightClass.F1, UnitOfMeasure.GRAM)
    default_u = lookup_oiml_r111_default_uncertainty(load, WeightClass.F1, UnitOfMeasure.GRAM)

    expected_u = mpe * ONE_THIRD_FACTOR
    assert default_u == expected_u


def test_convert_mass_lossless() -> None:
    """Verify mass unit conversions across mg, g, kg, and tonne."""
    one_kg = Decimal("1")
    assert convert_mass(one_kg, UnitOfMeasure.KILOGRAM, UnitOfMeasure.GRAM) == Decimal("1000")
    assert convert_mass(one_kg, UnitOfMeasure.KILOGRAM, UnitOfMeasure.MILLIGRAM) == Decimal(
        "1000000"
    )
    assert (
        convert_mass(Decimal("1000"), UnitOfMeasure.KILOGRAM, UnitOfMeasure.TONNE)
        == Decimal("1")
    )
    assert convert_mass(Decimal("500"), UnitOfMeasure.GRAM, UnitOfMeasure.GRAM) == Decimal("500")


# ============================================================================
# 2. Reference Weight Class Adequacy per OIML R 76-1 Clause 3.7.1
# ============================================================================


class TestWeightClassAdequacy:
    """Verifies statutory class adequacy rules per OIML R 76-1 Clause 3.7.1."""

    def test_class_i_requires_e1_or_e2(self) -> None:
        """Class I (Special Accuracy) mandates Class E1 or E2 standards."""
        ok, msg = check_weight_class_adequacy(WeightClass.E1, AccuracyClass.CLASS_I)
        assert ok is True
        assert msg is None

        ok, msg = check_weight_class_adequacy(WeightClass.E2, AccuracyClass.CLASS_I)
        assert ok is True
        assert msg is None

        # F1 standard on Class I must fail
        ok, msg = check_weight_class_adequacy(WeightClass.F1, AccuracyClass.CLASS_I)
        assert ok is False
        assert msg is not None
        assert "legally inadequate for Class I" in msg

        # M1 standard on Class I must fail
        ok, msg = check_weight_class_adequacy(WeightClass.M1, AccuracyClass.CLASS_I)
        assert ok is False
        assert msg is not None

    def test_class_ii_permits_e1_e2_f1_and_conditional_f2(self) -> None:
        """Class II (High Accuracy) permits E1, E2, F1, and conditional F2."""
        ok, _ = check_weight_class_adequacy(WeightClass.E1, AccuracyClass.CLASS_II)
        assert ok is True
        ok, _ = check_weight_class_adequacy(WeightClass.E2, AccuracyClass.CLASS_II)
        assert ok is True
        ok, _ = check_weight_class_adequacy(WeightClass.F1, AccuracyClass.CLASS_II)
        assert ok is True

        # F2 without verified uncertainty is rejected
        ok, msg = check_weight_class_adequacy(
            WeightClass.F2, AccuracyClass.CLASS_II, has_verified_uncertainty=False
        )
        assert ok is False
        assert msg is not None
        assert "conditional" in msg.lower()

        # F2 with verified uncertainty satisfies Clause 3.7.1
        ok, msg = check_weight_class_adequacy(
            WeightClass.F2, AccuracyClass.CLASS_II, has_verified_uncertainty=True
        )
        assert ok is True
        assert msg is None

    def test_class_ii_rejects_m1_m2_m3_metrological_hard_gate(self) -> None:
        """VERIFICATION TEST GATE: Pytest checking M2 weight on Class II scale triggers failure."""
        ok_m1, msg_m1 = check_weight_class_adequacy(WeightClass.M1, AccuracyClass.CLASS_II)
        assert ok_m1 is False
        assert "legally inadequate for Class II" in msg_m1

        ok_m2, msg_m2 = check_weight_class_adequacy(WeightClass.M2, AccuracyClass.CLASS_II)
        assert ok_m2 is False
        assert "legally inadequate for Class II" in msg_m2

        ok_m3, msg_m3 = check_weight_class_adequacy(WeightClass.M3, AccuracyClass.CLASS_II)
        assert ok_m3 is False
        assert "legally inadequate for Class II" in msg_m3

    def test_class_iii_permits_f2_m1_and_conditional_m2(self) -> None:
        """Class III (Medium Accuracy) permits F2, M1, conditional M2, but rejects M3."""
        ok, _ = check_weight_class_adequacy(WeightClass.M1, AccuracyClass.CLASS_III)
        assert ok is True
        ok, _ = check_weight_class_adequacy(WeightClass.F2, AccuracyClass.CLASS_III)
        assert ok is True

        # M2 without verified uncertainty is rejected
        ok, msg = check_weight_class_adequacy(
            WeightClass.M2, AccuracyClass.CLASS_III, has_verified_uncertainty=False
        )
        assert ok is False
        assert msg is not None
        assert "conditional" in msg.lower()

        # M2 with verified uncertainty is accepted
        ok, msg = check_weight_class_adequacy(
            WeightClass.M2, AccuracyClass.CLASS_III, has_verified_uncertainty=True
        )
        assert ok is True
        assert msg is None

        # M3 is rejected
        ok, msg = check_weight_class_adequacy(WeightClass.M3, AccuracyClass.CLASS_III)
        assert ok is False
        assert "legally inadequate for Class III" in msg

    def test_class_iiii_permits_m1_m2_m3(self) -> None:
        """Class IIII (Ordinary Accuracy) permits M1, M2, and M3."""
        for wc in [WeightClass.M1, WeightClass.M2, WeightClass.M3]:
            ok, msg = check_weight_class_adequacy(wc, AccuracyClass.CLASS_IIII)
            assert ok is True
            assert msg is None


# ============================================================================
# 3. Calibration Certificate Validity & Expiry Tests
# ============================================================================


class TestCalibrationValidity:
    """Verifies calibration validity dates and expiry detection."""

    def test_valid_active_certificate(self) -> None:
        """Current date between calibration date and validity date passes."""
        now = datetime.now(UTC)
        cal_date = now - timedelta(days=100)
        val_date = now + timedelta(days=265)

        is_valid, days_left, violation = check_calibration_validity(
            validity_date=val_date,
            calibration_date=cal_date,
            as_of_date=now,
        )
        assert is_valid is True
        assert days_left == 265
        assert violation is None

    def test_expired_certificate_triggers_violation(self) -> None:
        """VERIFICATION TEST GATE: Expired calibration certificate triggers hard lockout."""
        now = datetime.now(UTC)
        cal_date = now - timedelta(days=400)
        val_date = now - timedelta(days=35)  # Expired 35 days ago

        is_valid, days_left, violation = check_calibration_validity(
            validity_date=val_date,
            calibration_date=cal_date,
            as_of_date=now,
        )
        assert is_valid is False
        assert days_left == -35
        assert violation is not None
        assert "expired" in violation.lower()
        assert "35 days ago" in violation.lower()

    def test_future_calibration_date_rejected(self) -> None:
        """Calibration date occurring in the future is flagged as anomalous."""
        now = datetime.now(UTC)
        cal_date = now + timedelta(days=5)  # Future date
        val_date = now + timedelta(days=365)

        is_valid, _, violation = check_calibration_validity(
            validity_date=val_date,
            calibration_date=cal_date,
            as_of_date=now,
        )
        assert is_valid is False
        assert violation is not None
        assert "future" in violation.lower()

    def test_missing_certificate_number_triggers_lockout(
        self,
        class_iii_bench_scale: InstrumentSpecification,
        working_m1_weight_set: StandardWeightSetInput,
    ) -> None:
        """Blank or missing certificate number is strictly rejected with hard lockout."""
        blank_cert_set = working_m1_weight_set.model_copy(
            update={"calibration_certificate_number": "   "}
        )
        result = validate_standard_weight_set(
            weight_set=blank_cert_set,
            spec=class_iii_bench_scale,
        )
        assert result.is_locked is True
        assert LockoutReason.MISSING_CERTIFICATE in result.lockout_reasons


# ============================================================================
# 4. One-Third Uncertainty Rule Check: U <= (1/3) * MPE
# ============================================================================


class TestOneThirdUncertaintyRule:
    """Verifies Clause 3.7.1: U(k=2) <= (1/3) * MPE."""

    def test_critical_allowable_uncertainty_calculation(
        self, class_iii_bench_scale: InstrumentSpecification
    ) -> None:
        crit_mpe, allowable_u = calculate_critical_allowable_uncertainty(class_iii_bench_scale)
        # Min load 0.2 kg = 20e -> Tier 1 (MPE = 0.5e = 0.005 kg)
        assert crit_mpe == Decimal("0.005")
        assert allowable_u == crit_mpe * ONE_THIRD_FACTOR

    def test_evaluate_uncertainty_at_compliant_load(
        self, class_iii_bench_scale: InstrumentSpecification
    ) -> None:
        """Standard weight uncertainty satisfies U <= (1/3)*MPE."""
        test_load = Decimal("10.0")  # 10 kg
        # Allowable uncertainty at 10 kg: MPE = 10 g (0.01 kg) -> 1/3 MPE = 3.333 g
        weight_u = Decimal("0.0005")  # 0.5 g
        eval_point = evaluate_uncertainty_at_load(
            load=test_load,
            weight_uncertainty=weight_u,
            spec=class_iii_bench_scale,
        )
        assert eval_point.is_compliant is True
        assert eval_point.status == ComplianceStatus.PASS
        assert eval_point.weight_uncertainty <= eval_point.allowable_uncertainty
        assert eval_point.uncertainty_ratio < Decimal("1.0")

    def test_evaluate_uncertainty_excessive_load(
        self, class_i_analytical_balance: InstrumentSpecification
    ) -> None:
        """Standard weight with excessive uncertainty triggers NON_COMPLIANT status."""
        test_load = Decimal("200")  # 200 g
        # Analytical balance MPE at 200 g: 200,000e -> Tier 3 (MPE = 1.5 mg = 0.0015 g)
        # 1/3 MPE = 0.0005 g (0.5 mg)
        # Declared excessive uncertainty: U = 0.001 g (1.0 mg) > 0.5 mg
        excessive_u = Decimal("0.0010")
        eval_point = evaluate_uncertainty_at_load(
            load=test_load,
            weight_uncertainty=excessive_u,
            spec=class_i_analytical_balance,
        )
        assert eval_point.is_compliant is False
        assert eval_point.status == ComplianceStatus.FAIL
        assert eval_point.weight_uncertainty > eval_point.allowable_uncertainty
        assert eval_point.uncertainty_ratio > Decimal("0.333333")


# ============================================================================
# 5. Master Validation Engine & Hard Lockout Gate
# ============================================================================


class TestMasterTraceabilityValidator:
    """End-to-end statutory validation and hard lockout gate execution."""

    def test_verified_standard_weight_set_passes_cleanly(
        self,
        class_i_analytical_balance: InstrumentSpecification,
        reference_e2_weight_set: StandardWeightSetInput,
    ) -> None:
        """Valid Class E2 weight set on Class I balance passes with VERIFIED status."""
        result = validate_standard_weight_set(
            weight_set=reference_e2_weight_set,
            spec=class_i_analytical_balance,
            test_loads=[Decimal("0.1"), Decimal("50"), Decimal("100"), Decimal("200")],
        )
        assert result.is_locked is False
        assert result.status == TraceabilityStatus.VERIFIED
        assert len(result.violations) == 0
        assert len(result.lockout_reasons) == 0
        assert result.class_adequate is True
        assert result.certificate_valid is True
        assert result.is_expired is False
        assert result.latex_formula != ""
        assert "Traceability:" in result.latex_formula

        # Enforce gate must pass without raising
        enforce_traceability_lockout(result)

    def test_verification_gate_m2_weight_on_class_ii_scale_triggers_hard_lockout(
        self,
        class_ii_precision_scale: InstrumentSpecification,
    ) -> None:
        """VERIFICATION TEST GATE: M2 weight on Class II scale triggers hard lockout."""
        now = datetime.now(UTC)
        m2_weight_set = StandardWeightSetInput(
            identification_code="WORKSHOP-M2-SET",
            weight_class=WeightClass.M2,
            calibration_certificate_number="M2-CERT-2026-789",
            calibrated_by="State Weights & Measures Lab",
            calibration_date=now - timedelta(days=30),
            validity_date=now + timedelta(days=335),
            nominal_min_value=Decimal("10"),  # 10 g
            nominal_max_value=Decimal("6000"),  # 6 kg
            unit=UnitOfMeasure.GRAM,
            expanded_uncertainty_k2=Decimal("0.05"),
            is_active=True,
        )

        result = validate_standard_weight_set(
            weight_set=m2_weight_set,
            spec=class_ii_precision_scale,
            test_loads=[Decimal("100"), Decimal("3000"), Decimal("6000")],
        )

        # Must be hard-locked
        assert result.is_locked is True
        assert result.status == TraceabilityStatus.LOCKED_OUT
        assert LockoutReason.INADEQUATE_WEIGHT_CLASS in result.lockout_reasons
        assert any("inadequate for Class II" in v for v in result.violations)

        # Enforce gate must raise TraceabilityLockoutError
        with pytest.raises(TraceabilityLockoutError) as exc_info:
            enforce_traceability_lockout(result)

        err = exc_info.value
        assert err.is_locked is True
        assert err.weight_set_code == "WORKSHOP-M2-SET"
        assert LockoutReason.INADEQUATE_WEIGHT_CLASS in err.lockout_reasons
        assert "HARD METROLOGICAL LOCKOUT" in str(err)

    def test_verification_gate_expired_calibration_triggers_hard_lockout(
        self,
        class_iii_bench_scale: InstrumentSpecification,
        working_m1_weight_set: StandardWeightSetInput,
    ) -> None:
        """VERIFICATION TEST GATE: Expired calibration certificate triggers hard lockout."""
        now = datetime.now(UTC)
        # Modify fixture to make certificate expired 10 days ago
        expired_m1_set = working_m1_weight_set.model_copy(
            update={
                "calibration_date": now - timedelta(days=375),
                "validity_date": now - timedelta(days=10),
            }
        )

        result = validate_standard_weight_set(
            weight_set=expired_m1_set,
            spec=class_iii_bench_scale,
            test_loads=[Decimal("1.0"), Decimal("15.0"), Decimal("30.0")],
        )

        # Must be hard-locked
        assert result.is_locked is True
        assert result.status == TraceabilityStatus.LOCKED_OUT
        assert result.is_expired is True
        assert LockoutReason.CALIBRATION_EXPIRED in result.lockout_reasons
        assert any("expired" in v.lower() for v in result.violations)

        # Enforce gate must raise TraceabilityLockoutError
        with pytest.raises(TraceabilityLockoutError) as exc_info:
            enforce_traceability_lockout(result)
        assert LockoutReason.CALIBRATION_EXPIRED in exc_info.value.lockout_reasons

    def test_inactive_weight_set_triggers_hard_lockout(
        self,
        class_iii_bench_scale: InstrumentSpecification,
        working_m1_weight_set: StandardWeightSetInput,
    ) -> None:
        """Decommissioned / inactive weight set triggers hard lockout."""
        inactive_set = working_m1_weight_set.model_copy(update={"is_active": False})

        result = validate_standard_weight_set(
            weight_set=inactive_set,
            spec=class_iii_bench_scale,
        )
        assert result.is_locked is True
        assert result.status == TraceabilityStatus.LOCKED_OUT
        assert LockoutReason.INACTIVE_WEIGHT_SET in result.lockout_reasons

    def test_insufficient_nominal_range_coverage_triggers_lockout(
        self,
        class_iii_bench_scale: InstrumentSpecification,
    ) -> None:
        """Weight set whose maximum value does not reach Max capacity triggers hard lockout."""
        now = datetime.now(UTC)
        short_range_set = StandardWeightSetInput(
            identification_code="SHORT-RANGE-M1",
            weight_class=WeightClass.M1,
            calibration_certificate_number="M1-SHORT-001",
            calibrated_by="State Lab",
            calibration_date=now - timedelta(days=20),
            validity_date=now + timedelta(days=345),
            nominal_min_value=Decimal("0.5"),  # 500 g
            nominal_max_value=Decimal("10.0"),  # 10 kg (Scale Max is 30 kg!)
            unit=UnitOfMeasure.KILOGRAM,
            expanded_uncertainty_k2=Decimal("0.0001"),
            is_active=True,
        )

        result = validate_standard_weight_set(
            weight_set=short_range_set,
            spec=class_iii_bench_scale,
            test_load_max=Decimal("30.0"),
        )
        assert result.is_locked is True
        assert LockoutReason.INSUFFICIENT_RANGE in result.lockout_reasons
        assert any("maximum capacity" in v.lower() for v in result.violations)

    def test_expiring_soon_weight_set_generates_warning_without_lockout(
        self,
        class_iii_bench_scale: InstrumentSpecification,
        working_m1_weight_set: StandardWeightSetInput,
    ) -> None:
        """Certificate expiring within 30 days produces WARNING status without locking workspace."""
        now = datetime.now(UTC)
        expiring_soon_set = working_m1_weight_set.model_copy(
            update={
                "calibration_date": now - timedelta(days=345),
                "validity_date": now + timedelta(days=14),  # 14 days remaining
            }
        )

        result = validate_standard_weight_set(
            weight_set=expiring_soon_set,
            spec=class_iii_bench_scale,
        )
        assert result.is_locked is False
        assert result.status == TraceabilityStatus.WARNING
        assert len(result.warnings) > 0
        assert len(result.violations) == 0
        assert 0 < result.days_until_expiry <= 15
        assert "TRACEABILITY VERIFIED (WITH WARNINGS)" in result.summary_message

        # Enforce gate must pass without raising
        enforce_traceability_lockout(result)

    def test_duck_typed_or_dict_input(
        self,
        class_iii_bench_scale: InstrumentSpecification,
    ) -> None:
        """Validator accepts standard dictionary or duck-typed ORM objects seamlessly."""
        now = datetime.now(UTC)
        dict_payload = {
            "identification_code": "DICT-M1-001",
            "weight_class": WeightClass.M1,
            "calibration_certificate_number": "DICT-CERT-2026",
            "calibrated_by": "National Standards Bureau",
            "calibration_date": now - timedelta(days=50),
            "validity_date": now + timedelta(days=315),
            "nominal_min_value": Decimal("0.1"),
            "nominal_max_value": Decimal("50.0"),
            "unit": UnitOfMeasure.KILOGRAM,
            "expanded_uncertainty_k2": Decimal("0.0002"),
            "is_active": True,
        }

        result = validate_standard_weight_set(
            weight_set=dict_payload,
            spec=class_iii_bench_scale,
        )
        assert result.is_locked is False
        assert result.status == TraceabilityStatus.VERIFIED
        assert result.weight_set_code == "DICT-M1-001"

    def test_pydantic_serialization_roundtrip(
        self,
        class_i_analytical_balance: InstrumentSpecification,
        reference_e2_weight_set: StandardWeightSetInput,
    ) -> None:
        """TraceabilityValidationResult serializes to JSON and round-trips correctly."""
        result = validate_standard_weight_set(
            weight_set=reference_e2_weight_set,
            spec=class_i_analytical_balance,
            test_loads=[Decimal("100"), Decimal("200")],
        )
        data = result.model_dump()
        reconstructed = TraceabilityValidationResult.model_validate(data)

        assert reconstructed.is_locked == result.is_locked
        assert reconstructed.status == result.status
        assert reconstructed.weight_set_code == result.weight_set_code
        assert reconstructed.expanded_uncertainty == result.expanded_uncertainty
        assert len(reconstructed.evaluated_points) == len(result.evaluated_points)
