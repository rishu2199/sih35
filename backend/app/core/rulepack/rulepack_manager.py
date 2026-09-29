"""
METROLOGIX-76 — Runtime RulePack Manager & Dynamic Metrology Compiler.

Loads, validates, and manages versioned legal metrology RulePacks (OIML R 76-1:2006 vs
2026 Committee Draft Revision). Provides runtime evaluation and side-by-side impact analysis.
"""

from decimal import Decimal
from pathlib import Path
from typing import Final

import yaml
from pydantic import Field

from app.core.mpe_resolver import MPEResult
from app.core.rulepack.rulepack_schema import RulePack, RulePackMeta
from app.core.schemas import InstrumentSpecification, MetrologyBaseModel, ObservationPoint
from app.core.types import AccuracyClass, VerificationStage

DEFAULT_RULEPACK_DIR: Final[Path] = Path(__file__).parent
DEFAULT_ACTIVE_RULEPACK_ID: Final[str] = "OIML_R76_2006"


class PointImpactComparison(MetrologyBaseModel):
    """Side-by-side compliance comparison of an individual test load under two RulePacks."""

    load: Decimal = Field(..., description="Applied test load (L).")
    e: Decimal = Field(..., description="Verification scale interval (e).")
    corrected_error: Decimal = Field(..., description="Statutory corrected error (E_c).")
    rulepack_a_id: str = Field(
        ..., description="ID of baseline RulePack (e.g. OIML_R76_2006)."
    )
    rulepack_a_mpe: Decimal = Field(..., description="Allowable MPE under baseline RulePack.")
    rulepack_a_compliant: bool = Field(
        ..., description="Compliance status under baseline RulePack."
    )
    rulepack_b_id: str = Field(
        ..., description="ID of revision RulePack (e.g. OIML_R76_2026_DRAFT)."
    )
    rulepack_b_mpe: Decimal = Field(..., description="Allowable MPE under revision RulePack.")
    rulepack_b_compliant: bool = Field(
        ..., description="Compliance status under revision RulePack."
    )
    has_outcome_divergence: bool = Field(
        ...,
        description="True if outcome changed (e.g. PASSED in 2006 but FAILS under 2026 revision).",
    )



class RulePackImpactReport(MetrologyBaseModel):
    """Complete impact analysis report comparing test observations under two RulePack versions."""

    rulepack_a: RulePackMeta = Field(..., description="Metadata of baseline RulePack A.")
    rulepack_b: RulePackMeta = Field(..., description="Metadata of revision RulePack B.")
    points_compared: int = Field(..., description="Total observation points evaluated.")
    divergent_points_count: int = Field(
        ..., description="Count of points where compliance verdict changed between versions."
    )
    comparisons: list[PointImpactComparison] = Field(
        ..., description="Detailed point-by-point comparison records."
    )


class RulePackManager:
    """
    Singleton manager for loading, caching, and querying versioned legal metrology RulePacks.
    """

    def __init__(self, rulepack_dir: Path | str = DEFAULT_RULEPACK_DIR) -> None:
        self.rulepack_dir = Path(rulepack_dir)
        self._cache: dict[str, RulePack] = {}
        self._active_id: str = DEFAULT_ACTIVE_RULEPACK_ID
        self.load_all_builtins()

    def load_rulepack_from_file(self, file_path: Path | str) -> RulePack:
        """Load and validate a YAML or JSON RulePack file against RulePack schema."""
        path = Path(file_path)
        if not path.is_file():
            raise FileNotFoundError(f"RulePack file does not exist: {path.resolve()}")

        with path.open("r", encoding="utf-8") as f:
            raw_data = yaml.safe_load(f)

        rulepack = RulePack.model_validate(raw_data)
        self._cache[rulepack.meta.rulepack_id] = rulepack
        return rulepack

    def load_all_builtins(self) -> None:
        """Scan the rulepack directory and load all .yaml and .yml files into cache."""
        if not self.rulepack_dir.is_dir():
            return

        for yml_file in self.rulepack_dir.glob("*.yaml"):
            self.load_rulepack_from_file(yml_file)

        for yml_file in self.rulepack_dir.glob("*.yml"):
            self.load_rulepack_from_file(yml_file)

    def get_rulepack(self, rulepack_id: str) -> RulePack:
        """Retrieve a cached RulePack by its unique identifier."""
        if rulepack_id not in self._cache:
            # Attempt to find corresponding file in directory
            candidate = self.rulepack_dir / f"{rulepack_id.lower()}.yaml"
            if candidate.is_file():
                return self.load_rulepack_from_file(candidate)
            raise KeyError(
                f"RulePack '{rulepack_id}' is not loaded. Available IDs: {list(self._cache.keys())}"
            )
        return self._cache[rulepack_id]

    def get_active_rulepack(self) -> RulePack:
        """Retrieve the currently active RulePack."""
        return self.get_rulepack(self._active_id)

    def set_active_rulepack(self, rulepack_id: str) -> None:
        """Set the global active RulePack."""
        # Ensure it exists
        self.get_rulepack(rulepack_id)
        self._active_id = rulepack_id

    @property
    def active_rulepack_id(self) -> str:
        """Return the identifier of the active RulePack."""
        return self._active_id

    def list_rulepacks(self) -> list[RulePackMeta]:
        """List metadata summaries of all available RulePacks."""
        return [rp.meta for rp in self._cache.values()]

    def evaluate_mpe(
        self,
        load: Decimal,
        e: Decimal,
        accuracy_class: AccuracyClass,
        stage: VerificationStage = VerificationStage.INITIAL_TYPE_APPROVAL,
        corrected_error: Decimal | None = None,
        rulepack_id: str | None = None,
    ) -> MPEResult:
        """
        Evaluate MPE using a specified RulePack (or the active RulePack if omitted).
        """
        rp = self.get_rulepack(rulepack_id) if rulepack_id else self.get_active_rulepack()
        return rp.calculate_mpe(
            load=load,
            e=e,
            accuracy_class=accuracy_class,
            stage=stage,
            corrected_error=corrected_error,
        )

    def compare_rulepack_impact(
        self,
        points: list[ObservationPoint],
        spec: InstrumentSpecification,
        stage: VerificationStage = VerificationStage.INITIAL_TYPE_APPROVAL,
        rulepack_a_id: str = "OIML_R76_2006",
        rulepack_b_id: str = "OIML_R76_2026_DRAFT",
    ) -> RulePackImpactReport:
        """
        Execute Dual-Evaluation Impact Analysis comparing an observation dataset
        under two versioned RulePacks (e.g. 2006 vs 2026 Draft Revision).
        """
        rp_a = self.get_rulepack(rulepack_a_id)
        rp_b = self.get_rulepack(rulepack_b_id)

        comparisons: list[PointImpactComparison] = []
        divergent_count = 0

        for pt in points:
            effective_e = pt.e if pt.e is not None else spec.get_e_for_load(pt.load)
            # Compute turning point and uncorrected error
            half_e = effective_e * Decimal("0.5")
            p = pt.indication + half_e - pt.delta_load
            uncorrected_e = p - pt.load
            # Use uncorrected error as sample error if zero error is 0
            sample_ec = uncorrected_e

            res_a = rp_a.calculate_mpe(
                load=pt.load,
                e=effective_e,
                accuracy_class=spec.accuracy_class,
                stage=stage,
                corrected_error=sample_ec,
            )
            res_b = rp_b.calculate_mpe(
                load=pt.load,
                e=effective_e,
                accuracy_class=spec.accuracy_class,
                stage=stage,
                corrected_error=sample_ec,
            )

            is_a_comp = res_a.is_compliant is True
            is_b_comp = res_b.is_compliant is True
            divergence = is_a_comp != is_b_comp
            if divergence:
                divergent_count += 1

            comparisons.append(
                PointImpactComparison(
                    load=pt.load,
                    e=effective_e,
                    corrected_error=sample_ec,
                    rulepack_a_id=rp_a.meta.rulepack_id,
                    rulepack_a_mpe=res_a.mpe_value,
                    rulepack_a_compliant=is_a_comp,
                    rulepack_b_id=rp_b.meta.rulepack_id,
                    rulepack_b_mpe=res_b.mpe_value,
                    rulepack_b_compliant=is_b_comp,
                    has_outcome_divergence=divergence,
                )
            )

        return RulePackImpactReport(
            rulepack_a=rp_a.meta,
            rulepack_b=rp_b.meta,
            points_compared=len(points),
            divergent_points_count=divergent_count,
            comparisons=comparisons,
        )


# Global default RulePackManager instance
default_rulepack_manager = RulePackManager()
