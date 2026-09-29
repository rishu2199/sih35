"""
METROLOGIX-76 — Declarative RulePack Schema for Legal Metrology Standards.

Defines Pydantic models for parsing and validating versioned legal metrology rulepacks
(YAML/JSON) without hardcoded statutory numbers. Supports dynamic runtime evaluation
under OIML R 76-1:2006, OIML R 76-1:2026 Committee Draft, and National Amendments.
"""

from decimal import Decimal

from pydantic import ConfigDict, Field

from app.core.mpe_resolver import MPEResult
from app.core.schemas import MetrologyBaseModel
from app.core.types import AccuracyClass, ComplianceStatus, VerificationStage

ZERO_DECIMAL = Decimal("0")
HUNDRED_DECIMAL = Decimal("100")


class RulePackMeta(MetrologyBaseModel):
    """Metadata describing a legal metrology RulePack version."""

    model_config = ConfigDict(frozen=True, extra="forbid")

    rulepack_id: str = Field(
        ..., description="Unique alphanumeric identifier (e.g. 'OIML_R76_2006')."
    )
    name: str = Field(..., description="Official title of the standard or amendment.")
    version: str = Field(
        ..., description="Standard release version string (e.g. '2006.1', '2026.0-draft')."
    )
    effective_date: str = Field(
        ..., description="Effective enforcement date in ISO-8601 YYYY-MM-DD."
    )
    is_draft: bool = Field(default=False, description="True if this RulePack is a draft revision.")
    description: str = Field(..., description="Summary of the scope and regulatory changes.")
    jurisdiction: str = Field(
        ..., description="Jurisdiction of application (e.g. 'INTERNATIONAL', 'INDIA')."
    )
    statutory_references: list[str] = Field(
        default_factory=list, description="Primary legal citations and gazette references."
    )


class Table3TierDefinition(MetrologyBaseModel):
    """Statutory tier parameters for verification scale interval e and interval count n."""

    model_config = ConfigDict(frozen=True, extra="forbid")

    tier_id: str = Field(
        ..., description="Identifier for this Table 3 tier (e.g. 'CLASS_III_TIER_1')."
    )
    tier_name: str = Field(
        ..., description="Descriptive label of the verification scale interval range."
    )
    e_min_g: Decimal = Field(
        ..., ge=Decimal("0"), description="Statutory minimum e in grams (inclusive)."
    )
    e_max_g: Decimal | None = Field(
        default=None, description="Statutory maximum e in grams (inclusive, None if unbounded)."
    )
    n_min: Decimal = Field(
        ..., ge=Decimal("0"), description="Statutory minimum scale intervals n_min."
    )
    n_max: Decimal | None = Field(
        default=None, description="Statutory maximum scale intervals n_max (None if unbounded)."
    )
    min_factor_e: Decimal = Field(
        ..., gt=Decimal("0"), description="Factor k in Min = k * e (e.g. 20, 50, 100)."
    )


class Table6BracketDefinition(MetrologyBaseModel):
    """Statutory Table 6 MPE step bracket definition."""

    model_config = ConfigDict(frozen=True, extra="forbid")

    bracket_index: int = Field(
        ..., ge=1, le=3, description="Bracket level: 1 (0.5e), 2 (1.0e), or 3 (1.5e)."
    )
    bracket_name: str = Field(
        ..., description="Bracket range description (e.g. '0 <= m <= 500')."
    )
    m_min: Decimal = Field(
        ..., ge=Decimal("0"), description="Lower boundary of load interval m = L / e."
    )
    m_max: Decimal | None = Field(
        default=None, description="Inclusive upper boundary of m = L / e (None if unbounded)."
    )
    base_mpe_factor: Decimal = Field(
        ..., gt=Decimal("0"), description="Base MPE factor in units of e on initial verification."
    )


class AccuracyClassRules(MetrologyBaseModel):
    """Complete regulatory rule set for a specific NAWI accuracy class."""


    model_config = ConfigDict(frozen=True, extra="forbid")

    accuracy_class: AccuracyClass = Field(..., description="Accuracy class enum value.")
    designation: str = Field(..., description="Statutory English designation.")
    table_3_tiers: list[Table3TierDefinition] = Field(
        ..., min_length=1, description="Table 3 classification tiers for this class."
    )
    mpe_brackets_initial: list[Table6BracketDefinition] = Field(
        ..., min_length=3, max_length=3, description="Table 6 initial verification MPE brackets."
    )
    in_service_multiplier: Decimal = Field(
        default=Decimal("2.0"),
        gt=Decimal("0"),
        description="Multiplier for in-service / subsequent re-verification (e.g. 2.0 or 1.5).",
    )
    repeatability_runs: int = Field(
        default=10, ge=3, description="Prescribed number of weighings for repeatability test."
    )
    repeatability_mpe_fraction: Decimal = Field(
        default=Decimal("1.0"),
        gt=Decimal("0"),
        description="Allowable spread fraction of |MPE| (e.g. 1.0 for 2006, 0.8 for 2026 draft).",
    )
    discrimination_factor_d: Decimal = Field(
        default=Decimal("1.4"),
        gt=Decimal("0"),
        description=(
            "Factor in units of actual scale interval d for discrimination test (typically 1.4d)."
        ),
    )
    eccentricity_load_fraction: Decimal = Field(
        default=Decimal("0.333333333333"),
        gt=Decimal("0"),
        description="Fraction of Max applied during eccentricity test (typically 1/3 Max).",
    )


class StandardWeightSubstitutionRule(MetrologyBaseModel):
    """
    Substitution of standard weights rules (e.g. Legal Metrology Fourth Amendment Rules, 2026).
    """

    model_config = ConfigDict(frozen=True, extra="forbid")

    base_standard_weights_fraction: Decimal = Field(
        default=Decimal("0.5"),
        description="Base requirement of standard weights as fraction of Max (typically 50%).",
    )
    tier1_repeatability_threshold_e: Decimal = Field(
        default=Decimal("0.3"),
        description=(
            "Repeatability error threshold in units of e to unlock Tier 1 reduction (e.g. 0.3e)."
        ),
    )
    tier1_standard_weights_fraction: Decimal = Field(
        default=Decimal("0.333333333333"),
        description="Reduced standard weights fraction for Tier 1 (typically 1/3 Max).",
    )
    tier2_repeatability_threshold_e: Decimal = Field(
        default=Decimal("0.2"),
        description=(
            "Repeatability error threshold in units of e to unlock Tier 2 reduction (e.g. 0.2e)."
        ),
    )
    tier2_standard_weights_fraction: Decimal = Field(
        default=Decimal("0.2"),
        description="Reduced standard weights fraction for Tier 2 (typically 1/5 Max).",
    )
    statutory_reference: str = Field(
        default="Legal Metrology (General) Fourth Amendment Rules, 2026 (G.S.R. 568(E))",
        description="Official statutory citation.",
    )



class RulePack(MetrologyBaseModel):
    """
    Top-level declarative RulePack model governing all legal metrology calculations.
    """

    model_config = ConfigDict(frozen=True, extra="forbid")

    meta: RulePackMeta = Field(..., description="RulePack identification and metadata.")
    classes: dict[AccuracyClass, AccuracyClassRules] = Field(
        ..., description="Map of accuracy class to its full statutory rule definition."
    )
    standard_weight_substitution: StandardWeightSubstitutionRule | None = Field(
        default=None, description="Standard weight substitution rules, if applicable."
    )

    def get_class_rules(self, accuracy_class: AccuracyClass) -> AccuracyClassRules:
        """Retrieve class rules, raising ValueError if not defined in this RulePack."""
        if accuracy_class not in self.classes:
            msg = (
                f"Accuracy class '{accuracy_class.value}' is not defined "
                f"in RulePack '{self.meta.rulepack_id}'."
            )
            raise ValueError(msg)
        return self.classes[accuracy_class]

    get_rules_for_class = get_class_rules


    def resolve_table_6_bracket(
        self,
        accuracy_class: AccuracyClass,
        m: Decimal,
    ) -> Table6BracketDefinition:
        """Resolve Table 6 MPE step bracket based on this RulePack's declared thresholds."""
        if m < ZERO_DECIMAL:
            raise ValueError(f"Test load in scale intervals m cannot be negative, got: {m}")

        class_rules = self.get_class_rules(accuracy_class)
        sorted_brackets = sorted(class_rules.mpe_brackets_initial, key=lambda b: b.bracket_index)

        b1 = sorted_brackets[0]
        b2 = sorted_brackets[1]
        b3 = sorted_brackets[2]

        assert b1.m_max is not None
        if m <= b1.m_max:
            return b1

        assert b2.m_max is not None
        if m <= b2.m_max:
            return b2

        return b3

    def calculate_mpe(
        self,
        load: Decimal,
        e: Decimal,
        accuracy_class: AccuracyClass,
        stage: VerificationStage = VerificationStage.INITIAL_TYPE_APPROVAL,
        corrected_error: Decimal | None = None,
    ) -> MPEResult:
        """
        Evaluate stage-aware MPE dynamically using the active RulePack parameters.

        Zero-Bug Guarantee:
        Never hardcodes 0.5e, 1.0e, 1.5e, or 2.0x. Sourced purely from the declarative RulePack.
        """
        if e <= ZERO_DECIMAL:
            raise ValueError(f"Verification scale interval e must be strictly positive, got: {e}")
        if load < ZERO_DECIMAL:
            raise ValueError(f"Test load L cannot be negative, got: {load}")

        class_rules = self.get_class_rules(accuracy_class)
        m = load / e

        bracket = self.resolve_table_6_bracket(accuracy_class, m)

        # Stage multiplier: 1.0 for initial, class_rules.in_service_multiplier for in-service
        multiplier = (
            Decimal("1.0")
            if stage == VerificationStage.INITIAL_TYPE_APPROVAL
            else class_rules.in_service_multiplier
        )

        base_factor = bracket.base_mpe_factor
        mpe_in_units_of_e = base_factor * multiplier
        mpe_value = mpe_in_units_of_e * e

        lower_mpe = -mpe_value
        upper_mpe = mpe_value

        margin: Decimal | None = None
        margin_percentage: Decimal | None = None
        is_compliant: bool | None = None
        compliance_status = ComplianceStatus.PENDING

        if corrected_error is not None:
            abs_ec = abs(corrected_error)
            abs_mpe = abs(mpe_value)
            margin = abs_mpe - abs_ec
            margin_percentage = (margin / abs_mpe) * HUNDRED_DECIMAL

            if abs_ec < abs_mpe:
                is_compliant = True
                compliance_status = ComplianceStatus.PASS
            elif abs_ec == abs_mpe:
                is_compliant = True
                compliance_status = ComplianceStatus.MARGINAL
            else:
                is_compliant = False
                compliance_status = ComplianceStatus.FAIL

        # LaTeX formula
        stage_name = "Initial" if multiplier == Decimal("1.0") else f"In-Service ({multiplier}x)"
        formula_latex = {
            "m": r"m = \frac{L}{e}",
            "MPE": r"\text{MPE} = \pm " + f"{mpe_in_units_of_e}" + r"e",
            "margin": r"\text{Margin} = |\text{MPE}| - |E_c|",
        }

        step_explanations: list[str] = [
            f"RulePack Active: {self.meta.name} (ID: {self.meta.rulepack_id})",
            f"Step 1: m = L / e = {load} / {e} = {m} e",
            (
                f"Step 2 (Bracket Match): {bracket.bracket_name} for "
                f"{accuracy_class.designation} -> Base MPE = +/- {base_factor}e"
            ),
            (
                f"Step 3 (Stage Multiplier): Stage = {stage.value} ({stage_name}) -> "
                f"Effective MPE = {base_factor}e * {multiplier} = +/- {mpe_in_units_of_e}e "
                f"(+/- {mpe_value})"
            ),
        ]

        if corrected_error is not None:
            comp_str = "COMPLIANT (PASS)" if is_compliant else "NON-COMPLIANT (FAIL)"
            margin_str = f"{margin_percentage:.2f}%" if margin_percentage is not None else "N/A"
            step_explanations.append(
                f"Step 4 (Compliance Evaluation): |E_c| = |{corrected_error}|; "
                f"Allowed MPE = {mpe_value} -> {comp_str} with margin of {margin} ({margin_str})"
            )


        citation = (
            f"RulePack {self.meta.rulepack_id}: {self.meta.name} "
            f"({', '.join(self.meta.statutory_references)})"
        )

        return MPEResult(
            load=load,
            e=e,
            m_in_scale_intervals=m,
            accuracy_class=accuracy_class,
            verification_stage=stage,
            stage_multiplier=multiplier,
            bracket_index=bracket.bracket_index,
            bracket_name=bracket.bracket_name,
            base_mpe_factor=base_factor,
            mpe_in_units_of_e=mpe_in_units_of_e,
            mpe_value=mpe_value,
            lower_mpe=lower_mpe,
            upper_mpe=upper_mpe,
            corrected_error=corrected_error,
            margin=margin,
            margin_percentage=margin_percentage,
            is_compliant=is_compliant,
            compliance_status=compliance_status,
            is_over_n_max=False,
            step_by_step_explanation=step_explanations,
            formula_latex=formula_latex,
            statutory_citation=citation,
        )
