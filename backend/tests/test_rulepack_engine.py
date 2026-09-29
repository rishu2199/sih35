"""
METROLOGIX-76 — Test Suite for Versioned RulePack Engine (Step 07).

Validates:
- Declarative RulePack schema parsing and strict Pydantic validation.
- Loading and caching of OIML R 76-1:2006 and OIML R 76-1:2026 Draft YAML standards.
- Verification Test Gate: Replaying identical observation datasets under 2006 vs 2026
  yields distinct, rule-driven evaluation results (e.g. PASS in 2006, FAIL in 2026).
- Bracket threshold divergence (e.g. Bracket 2 upper bound: 2000e in 2006 vs 1800e in 2026).
- Fourth Amendment Rules 2026 standard weight substitution rules.
- Dual-Evaluation Impact Analysis Report generation.
- Dynamic runtime swapping of active RulePacks without hardcoded constants.
"""

import tempfile
from decimal import Decimal
from pathlib import Path

import pytest
from pydantic import ValidationError

from app.core.rulepack import (
    AccuracyClassRules,
    PointImpactComparison,
    RulePack,
    RulePackImpactReport,
    RulePackManager,
    RulePackMeta,
    StandardWeightSubstitutionRule,
    Table3TierDefinition,
    Table6BracketDefinition,
    default_rulepack_manager,
)
from app.core.schemas import InstrumentSpecification, ObservationPoint
from app.core.types import AccuracyClass, ComplianceStatus, VerificationStage

# ============================================================================
# FIXTURES
# ============================================================================


@pytest.fixture
def rulepack_manager() -> RulePackManager:
    """Return a fresh RulePackManager instance with builtins loaded."""
    return RulePackManager()


@pytest.fixture
def class_iii_retail_spec() -> InstrumentSpecification:
    """Class III retail scale: Max = 15 kg, e = 2 g, d = 2 g, n = 7500."""
    return InstrumentSpecification(
        accuracy_class=AccuracyClass.CLASS_III,
        max_capacity=Decimal("15000"),
        e=Decimal("2"),
        d=Decimal("2"),
        min_capacity=Decimal("40"),
    )


# ============================================================================
# 1. BUILTIN RULEPACK LOADING & SCHEMA TESTS
# ============================================================================


class TestBuiltinRulePacks:
    """Verifies that builtin YAML RulePacks load and satisfy schema constraints."""

    def test_load_builtin_2006_rulepack(self, rulepack_manager: RulePackManager) -> None:
        """Verify OIML R 76-1:2006 standard loads with all 4 classes and standard parameters."""
        rp = rulepack_manager.get_rulepack("OIML_R76_2006")
        assert rp.meta.rulepack_id == "OIML_R76_2006"
        assert rp.meta.version == "2006.1"
        assert not rp.meta.is_draft
        assert rp.meta.jurisdiction == "INTERNATIONAL"

        # Check all 4 NAWI classes exist
        assert AccuracyClass.CLASS_I in rp.classes
        assert AccuracyClass.CLASS_II in rp.classes
        assert AccuracyClass.CLASS_III in rp.classes
        assert AccuracyClass.CLASS_IIII in rp.classes

        # Verify Class III standard in-service multiplier is 2.0
        class_iii = rp.get_class_rules(AccuracyClass.CLASS_III)
        assert isinstance(class_iii, AccuracyClassRules)

        assert class_iii.in_service_multiplier == Decimal("2.0")
        assert class_iii.repeatability_runs == 10
        assert class_iii.repeatability_mpe_fraction == Decimal("1.0")

        # Verify Table 6 bracket definitions
        brackets = class_iii.mpe_brackets_initial
        assert len(brackets) == 3
        assert brackets[0].m_max == Decimal("500")
        assert brackets[0].base_mpe_factor == Decimal("0.5")
        assert brackets[1].m_max == Decimal("2000")
        assert brackets[1].base_mpe_factor == Decimal("1.0")
        assert brackets[2].m_max == Decimal("10000")
        assert brackets[2].base_mpe_factor == Decimal("1.5")

    def test_load_builtin_2026_draft_rulepack(self, rulepack_manager: RulePackManager) -> None:
        """Verify OIML R 76-1:2026 Draft loads with tightened parameters and substitution rules."""
        rp = rulepack_manager.get_rulepack("OIML_R76_2026_DRAFT")
        assert rp.meta.rulepack_id == "OIML_R76_2026_DRAFT"
        assert rp.meta.is_draft is True

        class_iii = rp.get_class_rules(AccuracyClass.CLASS_III)
        assert isinstance(class_iii, AccuracyClassRules)
        # 2026 Draft features tightened in-service multiplier (1.5x)
        assert class_iii.in_service_multiplier == Decimal("1.5")
        # 2026 Draft features tightened repeatability fraction (0.8)
        assert class_iii.repeatability_mpe_fraction == Decimal("0.8")

        # Verify tightened Bracket 2 upper threshold (1800e instead of 2000e)
        brackets = class_iii.mpe_brackets_initial
        assert brackets[1].m_max == Decimal("1800")

        # Fourth Amendment 2026 Standard Weight Substitution Rules must be present
        sub_rules = rp.standard_weight_substitution
        assert sub_rules is not None
        assert isinstance(sub_rules, StandardWeightSubstitutionRule)
        assert sub_rules.base_standard_weights_fraction == Decimal("0.5")
        assert sub_rules.tier1_repeatability_threshold_e == Decimal("0.3")
        assert sub_rules.tier1_standard_weights_fraction == Decimal("0.333333333333")
        assert sub_rules.tier2_repeatability_threshold_e == Decimal("0.2")
        assert sub_rules.tier2_standard_weights_fraction == Decimal("0.2")

    def test_list_rulepacks_metadata(self, rulepack_manager: RulePackManager) -> None:

        """Verify list_rulepacks returns metadata summaries for all cached rulepacks."""
        metas = rulepack_manager.list_rulepacks()
        assert len(metas) >= 2
        ids = [m.rulepack_id for m in metas]
        assert "OIML_R76_2006" in ids
        assert "OIML_R76_2026_DRAFT" in ids

    def test_default_rulepack_manager_singleton(self) -> None:
        """Verify the module-level default_rulepack_manager is initialized and usable."""
        rp = default_rulepack_manager.get_active_rulepack()
        assert rp.meta.rulepack_id == "OIML_R76_2006"


# ============================================================================
# 2. SCHEMA REJECTION & VALIDATION TESTS
# ============================================================================


class TestRulePackSchemaValidation:
    """Verifies Pydantic strictness, immutability, and boundary validations."""

    def test_reject_extra_fields(self) -> None:
        """RulePackMeta must forbid extra unknown attributes."""
        with pytest.raises(ValidationError):
            RulePackMeta(
                rulepack_id="CUSTOM_01",
                name="Custom Standard",
                version="1.0",
                effective_date="2026-01-01",
                description="Test",
                jurisdiction="TEST",
                unknown_rogue_field="not_allowed",  # type: ignore[call-arg]
            )

    def test_reject_invalid_bracket_index(self) -> None:
        """Table6BracketDefinition requires bracket_index between 1 and 3."""
        with pytest.raises(ValidationError):
            Table6BracketDefinition(
                bracket_index=4,  # Out of bounds
                bracket_name="Invalid Bracket",
                m_min=Decimal("2000"),
                m_max=None,
                base_mpe_factor=Decimal("2.0"),
            )

    def test_reject_negative_e_min(self) -> None:
        """Table3TierDefinition e_min_g must be non-negative."""
        with pytest.raises(ValidationError):
            Table3TierDefinition(
                tier_id="T1",
                tier_name="Invalid",
                e_min_g=Decimal("-0.1"),
                e_max_g=Decimal("1.0"),
                n_min=Decimal("100"),
                n_max=Decimal("10000"),
                min_factor_e=Decimal("20"),
            )

    def test_missing_accuracy_class_raises_value_error(
        self, rulepack_manager: RulePackManager
    ) -> None:
        """Attempting to resolve an undefined accuracy class raises ValueError."""
        rp = rulepack_manager.get_rulepack("OIML_R76_2006")
        # Artificially remove CLASS_IIII
        classes_without_iiii: dict[AccuracyClass, AccuracyClassRules] = {
            k: v for k, v in rp.classes.items() if k != AccuracyClass.CLASS_IIII
        }
        modified_rp = RulePack(
            meta=rp.meta,
            classes=classes_without_iiii,
            standard_weight_substitution=rp.standard_weight_substitution,
        )

        with pytest.raises(ValueError, match="is not defined in RulePack"):
            modified_rp.get_class_rules(AccuracyClass.CLASS_IIII)


# ============================================================================
# 3. VERIFICATION TEST GATE: OUTCOME DIVERGENCE (2006 vs 2026 DRAFT)
# ============================================================================


class TestVerificationTestGateDivergence:
    """
    Critical Verification Test Gate:
    Replaying the exact same observation dataset under 2006 vs 2026 yields
    distinct, rule-driven evaluation results.
    """

    def test_in_service_multiplier_divergence(self, rulepack_manager: RulePackManager) -> None:
        """
        Divergence Scenario 1: In-Service Verification Tightening.
        Instrument: Class III, e = 2 g.
        Load L = 3000 g -> m = 1500 e (falls in Bracket 2: 500 <= m <= 2000).
        Base MPE = 1.0 e = 2.0 g.

        Under OIML R 76-1:2006:
            In-Service Multiplier = 2.0x
            Allowable MPE = 1.0e * 2.0 = 2.0e = 4.0 g.
            If Corrected Error E_c = +3.5 g:
                |3.5 g| <= 4.0 g -> PASS (compliant = True, margin = +0.5 g).

        Under OIML R 76-1:2026 Draft:
            In-Service Multiplier = 1.5x (tightened)
            Allowable MPE = 1.0e * 1.5 = 1.5e = 3.0 g.
            If Corrected Error E_c = +3.5 g:
                |3.5 g| > 3.0 g -> FAIL (compliant = False, margin = -0.5 g).

        This test conclusively proves dynamic, rulepack-driven outcome divergence.
        """
        rp_2006 = rulepack_manager.get_rulepack("OIML_R76_2006")
        rp_2026 = rulepack_manager.get_rulepack("OIML_R76_2026_DRAFT")

        load = Decimal("3000")  # grams
        e = Decimal("2")        # grams
        corrected_error = Decimal("3.5")  # grams

        # Evaluate under 2006
        res_2006 = rp_2006.calculate_mpe(
            load=load,
            e=e,
            accuracy_class=AccuracyClass.CLASS_III,
            stage=VerificationStage.SUBSEQUENT_IN_SERVICE,
            corrected_error=corrected_error,
        )

        # Evaluate under 2026 Draft
        res_2026 = rp_2026.calculate_mpe(
            load=load,
            e=e,
            accuracy_class=AccuracyClass.CLASS_III,
            stage=VerificationStage.SUBSEQUENT_IN_SERVICE,
            corrected_error=corrected_error,
        )

        # 1. Verify 2006 verdict: PASS
        assert res_2006.stage_multiplier == Decimal("2.0")
        assert res_2006.mpe_in_units_of_e == Decimal("2.0")
        assert res_2006.mpe_value == Decimal("4.0")
        assert res_2006.is_compliant is True
        assert res_2006.compliance_status == ComplianceStatus.PASS
        assert res_2006.margin == Decimal("0.5")

        # 2. Verify 2026 Draft verdict: FAIL
        assert res_2026.stage_multiplier == Decimal("1.5")
        assert res_2026.mpe_in_units_of_e == Decimal("1.5")
        assert res_2026.mpe_value == Decimal("3.0")
        assert res_2026.is_compliant is False
        assert res_2026.compliance_status == ComplianceStatus.FAIL
        assert res_2026.margin == Decimal("-0.5")

        # 3. Proves divergence between 2006 and 2026
        assert res_2006.is_compliant != res_2026.is_compliant
        assert res_2006.mpe_value != res_2026.mpe_value

    def test_bracket_boundary_divergence(self, rulepack_manager: RulePackManager) -> None:
        """
        Divergence Scenario 2: Bracket 2 Upper Bound Tightened in 2026 Draft.
        In 2006: Bracket 2 is 500 < m <= 2000 (Base MPE = 1.0e).
        In 2026 Draft: Bracket 2 is 500 < m <= 1800 (Base MPE = 1.0e);
                       Bracket 3 is m > 1800 (Base MPE = 1.5e).

        At m = 1900 e (e.g. Load L = 3800 g with e = 2 g):
            Under 2006: m = 1900 <= 2000 -> Bracket 2 -> Base MPE = 1.0e = 2.0 g.
            Under 2026 Draft: m = 1900 > 1800 -> Bracket 3 -> Base MPE = 1.5e = 3.0 g.

        Initial Verification Stage:
            Under 2006: Allowable MPE = 2.0 g.
            Under 2026 Draft: Allowable MPE = 3.0 g.

        If Corrected Error E_c = 2.5 g:
            Under 2006: |2.5 g| > 2.0 g -> FAIL.
            Under 2026 Draft: |2.5 g| <= 3.0 g -> PASS.
        """
        rp_2006 = rulepack_manager.get_rulepack("OIML_R76_2006")
        rp_2026 = rulepack_manager.get_rulepack("OIML_R76_2026_DRAFT")

        load = Decimal("3800")
        e = Decimal("2")
        corrected_error = Decimal("2.5")

        res_2006 = rp_2006.calculate_mpe(
            load=load,
            e=e,
            accuracy_class=AccuracyClass.CLASS_III,
            stage=VerificationStage.INITIAL_TYPE_APPROVAL,
            corrected_error=corrected_error,
        )

        res_2026 = rp_2026.calculate_mpe(
            load=load,
            e=e,
            accuracy_class=AccuracyClass.CLASS_III,
            stage=VerificationStage.INITIAL_TYPE_APPROVAL,
            corrected_error=corrected_error,
        )

        # 2006: Bracket 2 (1.0e)
        assert res_2006.bracket_index == 2
        assert res_2006.base_mpe_factor == Decimal("1.0")
        assert res_2006.mpe_value == Decimal("2.0")
        assert res_2006.is_compliant is False

        # 2026: Bracket 3 (1.5e)
        assert res_2026.bracket_index == 3
        assert res_2026.base_mpe_factor == Decimal("1.5")
        assert res_2026.mpe_value == Decimal("3.0")
        assert res_2026.is_compliant is True

        assert res_2006.is_compliant != res_2026.is_compliant


# ============================================================================
# 4. DUAL-EVALUATION IMPACT ANALYSIS REPORT TESTS
# ============================================================================


class TestDualEvaluationImpactReport:
    """Verifies side-by-side comparison report generation comparing observations."""

    def test_compare_rulepack_impact_detects_divergence(
        self,
        rulepack_manager: RulePackManager,
        class_iii_retail_spec: InstrumentSpecification,
    ) -> None:
        """
        Execute compare_rulepack_impact with 3 observation points:
        Point 1: L = 1000 g (m=500e), uncorrected = 1.0 g -> Passes both versions.
        Point 2: L = 3000 g (m=1500e), indication = 3003.5 g, delta_L = 1.0 g
                 P = 3003.5 + 1.0 - 1.0 = 3003.5 g -> E = +3.5 g.
                 Under 2006 (MPE=4.0g): PASS.
                 Under 2026 (MPE=3.0g): FAIL -> DIVERGENT!
        Point 3: L = 10000 g (m=5000e), uncorrected = 2.0 g -> Passes both.
        """
        points = [
            ObservationPoint(
                load=Decimal("1000"),
                indication=Decimal("1001"),
                delta_load=Decimal("1.0"),  # P = 1001 + 1 - 1 = 1001 -> Ec = 1.0g
                e=Decimal("2"),
            ),
            ObservationPoint(
                load=Decimal("3000"),
                indication=Decimal("3003.5"),
                delta_load=Decimal("1.0"),  # P = 3003.5 + 1 - 1 = 3003.5 -> Ec = 3.5g
                e=Decimal("2"),
            ),
            ObservationPoint(
                load=Decimal("10000"),
                indication=Decimal("10002"),
                delta_load=Decimal("1.0"),  # P = 10002 + 1 - 1 = 10002 -> Ec = 2.0g
                e=Decimal("2"),
            ),
        ]

        report: RulePackImpactReport = rulepack_manager.compare_rulepack_impact(
            points=points,
            spec=class_iii_retail_spec,
            stage=VerificationStage.SUBSEQUENT_IN_SERVICE,
            rulepack_a_id="OIML_R76_2006",
            rulepack_b_id="OIML_R76_2026_DRAFT",
        )

        assert report.points_compared == 3
        assert report.divergent_points_count == 1
        assert len(report.comparisons) == 3

        # Point 1: No divergence (both PASS)
        p1 = report.comparisons[0]
        assert isinstance(p1, PointImpactComparison)
        assert not p1.has_outcome_divergence
        assert p1.rulepack_a_compliant is True
        assert p1.rulepack_b_compliant is True


        # Point 2: Divergence (PASS in 2006, FAIL in 2026)
        p2 = report.comparisons[1]
        assert p2.has_outcome_divergence is True
        assert p2.rulepack_a_compliant is True
        assert p2.rulepack_b_compliant is False
        assert p2.rulepack_a_mpe == Decimal("4.0")
        assert p2.rulepack_b_mpe == Decimal("3.0")
        assert p2.corrected_error == Decimal("3.5")

        # Point 3: No divergence (both PASS)
        p3 = report.comparisons[2]
        assert not p3.has_outcome_divergence
        assert p3.rulepack_a_compliant is True
        assert p3.rulepack_b_compliant is True


# ============================================================================
# 5. DYNAMIC RULEPACK SWAPPING TESTS
# ============================================================================


class TestDynamicRulePackSwapping:
    """Verifies that the manager can swap active RulePack dynamically at runtime."""

    def test_swap_active_rulepack_changes_default_evaluation(
        self, rulepack_manager: RulePackManager
    ) -> None:
        """Changing active rulepack switches default evaluate_mpe calculations."""
        # 1. Initial active is 2006
        assert rulepack_manager.active_rulepack_id == "OIML_R76_2006"
        res_default_2006 = rulepack_manager.evaluate_mpe(
            load=Decimal("3000"),
            e=Decimal("2"),
            accuracy_class=AccuracyClass.CLASS_III,
            stage=VerificationStage.SUBSEQUENT_IN_SERVICE,
            corrected_error=Decimal("3.5"),
        )
        assert res_default_2006.is_compliant is True

        # 2. Swap active to 2026 Draft
        rulepack_manager.set_active_rulepack("OIML_R76_2026_DRAFT")
        assert rulepack_manager.active_rulepack_id == "OIML_R76_2026_DRAFT"

        res_default_2026 = rulepack_manager.evaluate_mpe(
            load=Decimal("3000"),
            e=Decimal("2"),
            accuracy_class=AccuracyClass.CLASS_III,
            stage=VerificationStage.SUBSEQUENT_IN_SERVICE,
            corrected_error=Decimal("3.5"),
        )
        assert res_default_2026.is_compliant is False

        # 3. Swap back to 2006
        rulepack_manager.set_active_rulepack("OIML_R76_2006")
        assert rulepack_manager.active_rulepack_id == "OIML_R76_2006"

    def test_set_active_unknown_rulepack_raises_key_error(
        self, rulepack_manager: RulePackManager
    ) -> None:
        """Setting an unknown RulePack ID raises KeyError."""
        with pytest.raises(KeyError, match="is not loaded"):
            rulepack_manager.set_active_rulepack("NON_EXISTENT_STANDARD")

    def test_load_custom_rulepack_file(self, rulepack_manager: RulePackManager) -> None:
        """Load a custom external YAML file into the manager dynamically."""
        custom_yaml_content = """
meta:
  rulepack_id: "CUSTOM_REGIONAL_2030"
  name: "Custom Regional Standard 2030"
  version: "2030.0"
  effective_date: "2030-01-01"
  is_draft: true
  description: "Test Custom Standard"
  jurisdiction: "REGIONAL_LAB"
  statutory_references:
    - "Regional Gazette Notification 2030"

classes:
  CLASS_III:
    accuracy_class: "CLASS_III"
    designation: "Medium accuracy"
    table_3_tiers:
      - tier_id: "CUSTOM_TIER"
        tier_name: "Custom Tier"
        e_min_g: 0.1
        e_max_g: 50.0
        n_min: 100
        n_max: 10000
        min_factor_e: 20
    mpe_brackets_initial:
      - bracket_index: 1
        bracket_name: "0 <= m <= 500"
        m_min: 0
        m_max: 500
        base_mpe_factor: 0.5
      - bracket_index: 2
        bracket_name: "500 < m <= 2000"
        m_min: 500
        m_max: 2000
        base_mpe_factor: 1.0
      - bracket_index: 3
        bracket_name: "m > 2000"
        m_min: 2000
        m_max: null
        base_mpe_factor: 1.5
    in_service_multiplier: 1.25
"""
        with tempfile.NamedTemporaryFile("w", suffix=".yaml", delete=False, encoding="utf-8") as tf:
            tf.write(custom_yaml_content)
            temp_path = Path(tf.name)

        try:
            custom_rp = rulepack_manager.load_rulepack_from_file(temp_path)
            assert custom_rp.meta.rulepack_id == "CUSTOM_REGIONAL_2030"

            # Check custom in-service multiplier of 1.25
            res = rulepack_manager.evaluate_mpe(
                load=Decimal("1000"),
                e=Decimal("2"),
                accuracy_class=AccuracyClass.CLASS_III,
                stage=VerificationStage.SUBSEQUENT_IN_SERVICE,
                rulepack_id="CUSTOM_REGIONAL_2030",
            )
            assert res.stage_multiplier == Decimal("1.25")
            assert res.mpe_in_units_of_e == Decimal("0.5") * Decimal("1.25")
        finally:
            temp_path.unlink(missing_ok=True)
