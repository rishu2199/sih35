"""METROLOGIX-76 Legacy Excel Spreadsheet Ingestion & Migration Engine.

Conforms to:
- OIML R 76-1:2006 Clause A.4.4.3 (Digital changeover turning point: P = I + 0.5e - Delta L)
- OIML R 76-1:2006 Clause 3.5.1 / Table 6 (Stage-aware Maximum Permissible Error MPE)
- Legal Metrology (General) Rules, 2011 (Seventh Schedule, Part II, Table 20)
- Section 24 of Legal Metrology Act, 2009 (Historical verification record auditability)

Purpose:
- Ingests legacy DoCA, RRSL, and state legal metrology laboratory Excel test sheets (.xlsx / .xls).
- Handles merged cells, arbitrary header naming variations, and multi-sheet layouts.
- Recalculates historical test observations through deterministic OIML changeover & MPE engines.
- Flags historical Excel formula flaws:
  * Direct indication subtraction (I - L) omitting turning point 0.5e - Delta L
  * Omission of zero reference error correction (E_c = E - E_0)
  * Truncation / premature rounding masking statutory non-compliance ("False Pass")
  * Hardcoded flawed MPE step formulas
"""

from __future__ import annotations

import io
import re
from decimal import Decimal, InvalidOperation
from enum import Enum
from typing import Final

import openpyxl
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.worksheet.worksheet import Worksheet
from pydantic import BaseModel, ConfigDict, Field

from app.core.changeover_engine import calculate_changeover
from app.core.mpe_resolver import calculate_mpe
from app.core.types import AccuracyClass, UnitOfMeasure, VerificationStage

# ============================================================================
# CONSTANTS & ALIASES
# ============================================================================

ZERO: Final[Decimal] = Decimal("0")
HALF: Final[Decimal] = Decimal("0.5")

# Header aliases for robust column detection across legacy templates
LOAD_HEADER_ALIASES: Final[tuple[str, ...]] = (
    "load",
    "applied load",
    "test load",
    "std weight",
    "standard load",
    "reference load",
    "load (kg)",
    "load(kg)",
    "load (g)",
    "load (mg)",
    "weight (kg)",
    "l (kg)",
    "l",
)

INDICATION_HEADER_ALIASES: Final[tuple[str, ...]] = (
    "indication",
    "observed indication",
    "scale indication",
    "reading",
    "scale reading",
    "observed reading",
    "i (kg)",
    "i(kg)",
    "i (g)",
    "i",
    "display",
)

DELTA_LOAD_HEADER_ALIASES: Final[tuple[str, ...]] = (
    "delta l",
    "delta_load",
    "delta load",
    "auxiliary",
    "auxiliary weight",
    "aux weight",
    "added load",
    "delta l (g)",
    "delta l (kg)",
    "delta(l)",
    "dl",
    "dload",
    "turning point weight",
)

ERROR_HEADER_ALIASES: Final[tuple[str, ...]] = (
    "error",
    "calculated error",
    "uncorrected error",
    "error (e)",
    "error e",
    "e (kg)",
    "error (g)",
    "e (g)",
    "indicated error",
)

VERDICT_HEADER_ALIASES: Final[tuple[str, ...]] = (
    "verdict",
    "result",
    "status",
    "compliance",
    "pass/fail",
    "remarks",
    "remark",
)

MPE_HEADER_ALIASES: Final[tuple[str, ...]] = (
    "mpe",
    "max permissible error",
    "allowable error",
    "limit",
    "tolerance",
    "+/- mpe",
    "mpe (g)",
)


class DiscrepancyType(str, Enum):
    """Categorization of legacy spreadsheet calculation errors."""

    FALSE_PASS = "FALSE_PASS"  # noqa: S105
    FALSE_FAIL = "FALSE_FAIL"
    OMITTED_ZERO_ERROR = "OMITTED_ZERO_ERROR"
    NO_CHANGEOVER_TURNING_POINT = "NO_CHANGEOVER_TURNING_POINT"
    ROUNDING_TRUNCATION = "ROUNDING_TRUNCATION"
    MPE_BRACKET_MISMATCH = "MPE_BRACKET_MISMATCH"
    CALCULATION_DRIFT = "CALCULATION_DRIFT"


# ============================================================================
# PYDANTIC DATA MODELS
# ============================================================================


class LegacyDiscrepancy(BaseModel):
    """Details of a mathematical or compliance discrepancy in the legacy Excel sheet."""

    row_index: int = Field(..., description="1-based spreadsheet row number")
    load: Decimal = Field(..., description="Applied test load")
    legacy_indication: Decimal = Field(..., description="Recorded display indication")
    legacy_error: Decimal | None = Field(
        default=None, description="Error computed by legacy Excel formula"
    )
    legacy_verdict: str | None = Field(
        default=None, description="Pass/Fail verdict recorded in legacy sheet"
    )
    oiml_p: Decimal = Field(..., description="OIML Clause A.4.4.3 true turning point P")
    oiml_error_uncorrected: Decimal = Field(..., description="OIML uncorrected error E = P - L")
    oiml_zero_error: Decimal = Field(..., description="Baseline zero-load reference error E_0")
    oiml_error_corrected: Decimal = Field(
        ..., description="Statutory corrected error E_c = E - E_0"
    )
    oiml_mpe: Decimal = Field(..., description="Statutory Table 6 MPE threshold")
    oiml_verdict: str = Field(..., description="Deterministic statutory verdict (PASS / FAIL)")
    discrepancy_type: DiscrepancyType = Field(..., description="Classification of formula flaw")
    severity: str = Field(..., description="CRITICAL, HIGH, or MEDIUM")
    legal_implication: str = Field(..., description="Statutory impact analysis")


class ExtractedObservationRow(BaseModel):
    """Single test load observation extracted from legacy sheet with comparison."""

    row_index: int = Field(..., description="1-based row number")
    load: Decimal = Field(..., description="Applied test load")
    indication: Decimal = Field(..., description="Observed discrete indication")
    delta_load: Decimal = Field(default=ZERO, description="Additional fractional load Delta L")
    legacy_error: Decimal | None = Field(default=None, description="Legacy error value if present")
    legacy_verdict: str | None = Field(default=None, description="Legacy verdict if present")
    oiml_p: Decimal = Field(..., description="OIML turning point P")
    oiml_corrected_error: Decimal = Field(..., description="OIML corrected error E_c")
    oiml_mpe: Decimal = Field(..., description="Statutory MPE threshold")
    oiml_verdict: str = Field(..., description="OIML compliance decision (PASS/FAIL)")
    has_discrepancy: bool = Field(default=False, description="True if legacy differs from OIML")


class ExtractedCornerRow(BaseModel):
    """Eccentricity corner loading observation extracted from legacy sheet."""

    position: str = Field(..., description="Corner identifier (e.g. Center, Front-Left, Pos 1)")
    load: Decimal = Field(..., description="Corner test load")
    indication: Decimal = Field(..., description="Observed corner indication")
    error: Decimal = Field(..., description="Calculated corner error")
    mpe: Decimal = Field(..., description="Applicable eccentricity MPE")
    is_compliant: bool = Field(..., description="True if corner conforms to MPE")


class ExtractedInstrumentMetadata(BaseModel):
    """Instrument specifications extracted from legacy test sheet header/metadata."""

    model_config = ConfigDict(protected_namespaces=())

    manufacturer: str = Field(default="Unknown Manufacturer", description="Manufacturer name")
    model_name: str = Field(default="Legacy NAWI Model", description="Model designation")
    serial_number: str = Field(default="LEGACY-SN-001", description="Serial number")
    accuracy_class: AccuracyClass = Field(
        default=AccuracyClass.CLASS_III, description="OIML Accuracy Class"
    )
    max_capacity: Decimal = Field(default=Decimal("30"), description="Maximum capacity Max")
    min_capacity: Decimal = Field(default=Decimal("0.1"), description="Minimum capacity Min")
    e: Decimal = Field(default=Decimal("0.005"), description="Verification scale interval e")
    d: Decimal = Field(default=Decimal("0.005"), description="Actual scale interval d")
    unit: UnitOfMeasure = Field(default=UnitOfMeasure.KILOGRAM, description="Declared unit")
    verification_stage: VerificationStage = Field(
        default=VerificationStage.INITIAL_TYPE_APPROVAL,
        description="Verification stage (initial or in-service)",
    )
    officer_name: str = Field(default="Legal Metrology Officer", description="Inspector name")
    laboratory_name: str = Field(
        default="Regional Reference Standard Laboratory", description="Laboratory name"
    )
    test_date: str = Field(default="", description="Recorded test date")


class ExcelMigrationReport(BaseModel):
    """Complete migration and discrepancy audit report for an ingested Excel sheet."""

    filename: str = Field(..., description="Uploaded file name")
    total_observations: int = Field(..., description="Total weighing points parsed")
    metadata: ExtractedInstrumentMetadata = Field(..., description="Extracted instrument specs")
    observations: list[ExtractedObservationRow] = Field(
        default_factory=list, description="Extracted observation rows"
    )
    eccentricity_observations: list[ExtractedCornerRow] = Field(
        default_factory=list, description="Extracted eccentricity test rows"
    )
    discrepancies: list[LegacyDiscrepancy] = Field(
        default_factory=list, description="Flagged calculation/rounding discrepancies"
    )
    total_discrepancies: int = Field(default=0, description="Total discrepancy count")
    false_passes_count: int = Field(
        default=0, description="Critical instances where legacy passed a non-compliant scale"
    )
    false_fails_count: int = Field(
        default=0, description="Instances where legacy failed a compliant scale"
    )
    oiml_overall_verdict: str = Field(..., description="Statutory OIML R 76 overall verdict")
    legacy_overall_verdict: str = Field(..., description="Legacy spreadsheet overall verdict")
    audit_summary: str = Field(..., description="Statutory summary narrative for DoCA/RRSL records")


# ============================================================================
# CELL NORMALIZATION & HELPER FUNCTIONS
# ============================================================================


def _clean_str(val: object) -> str:
    """Normalizes cell string representation, stripping spaces and punctuation."""
    if val is None:
        return ""
    return str(val).strip()


def _to_decimal_safe(val: object) -> Decimal | None:
    """Losslessly converts arbitrary cell value (float, int, str) to Decimal."""
    if val is None:
        return None
    s = str(val).strip().replace(",", "")
    # Remove unit suffixes if embedded (e.g. '10.000 kg' -> '10.000')
    s = re.sub(r"[^\d.-]", "", s)
    if not s or s == "-" or s == ".":
        return None
    try:
        return Decimal(s)
    except InvalidOperation:
        return None


def _get_cell_value_merged_safe(ws: Worksheet, row: int, col: int) -> object:
    """Returns cell value, gracefully resolving top-left value if inside a merged range."""
    cell = ws.cell(row=row, column=col)
    if type(cell).__name__ == "MergedCell":
        # Scan merged ranges to find top-left value
        for merged_range in ws.merged_cells.ranges:
            if cell.coordinate in merged_range:
                top_left = ws.cell(row=merged_range.min_row, column=merged_range.min_col)
                return top_left.value
    return cell.value


# ============================================================================
# BENCHMARK LEGACY EXCEL SHEET GENERATOR
# ============================================================================


def generate_sample_legacy_excel(has_flaws: bool = True) -> bytes:
    """Generates an authentic RRSL/GATC legacy laboratory spreadsheet in .xlsx format.

    Args:
        has_flaws: If True, incorporates typical legacy Excel math flaws:
                   - Direct subtraction (I - L) omitting turning point changeover
                   - Omission of zero reference error E_0
                   - Truncation causing a FALSE PASS at load 10.000 kg where error > MPE.
                   If False, uses mathematically compliant formulas.

    Returns:
        Raw bytes of the generated .xlsx workbook.
    """
    wb = openpyxl.Workbook()
    # Sheet 1: Instrument Info
    ws_meta = wb.active
    assert ws_meta is not None
    ws_meta.title = "Instrument_Metadata"

    # Styling
    font_title = Font(name="Calibri", size=14, bold=True, color="1E3A8A")
    font_header = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
    font_bold = Font(name="Calibri", size=10, bold=True)
    font_regular = Font(name="Calibri", size=10)

    fill_navy = PatternFill(start_color="1E3A8A", end_color="1E3A8A", fill_type="solid")
    fill_amber = PatternFill(start_color="F59E0B", end_color="F59E0B", fill_type="solid")
    fill_light = PatternFill(start_color="F1F5F9", end_color="F1F5F9", fill_type="solid")
    border_thin = Border(
        left=Side(style="thin", color="CBD5E1"),
        right=Side(style="thin", color="CBD5E1"),
        top=Side(style="thin", color="CBD5E1"),
        bottom=Side(style="thin", color="CBD5E1"),
    )

    # Populate Metadata Sheet
    ws_meta["A1"] = "GOVERNMENT OF INDIA — MINISTRY OF CONSUMER AFFAIRS"
    ws_meta["A1"].font = font_title
    ws_meta["A2"] = (
        "Regional Reference Standard Laboratory (RRSL), Bangalore — Legacy Verification Register"
    )
    ws_meta["A2"].font = Font(name="Calibri", size=11, italic=True)

    metadata_rows = [
        ("Laboratory Name:", "RRSL Bangalore (Southern Metrological Region)"),
        ("Verification Officer:", "Dr. K. Ramanathan, Joint Director (Legal Metrology)"),
        ("Statutory Mandate:", "Legal Metrology Act, 2009 / General Rules 2011"),
        ("Manufacturer:", "Avery Weigh-Tronix India Pvt Ltd"),
        ("Model Designation:", "ZM510-Industrial Bench Scale"),
        ("Serial Number:", "AV-BLR-2018-9842"),
        ("Accuracy Class:", "Class III"),
        ("Maximum Capacity (Max):", "30.000 kg"),
        ("Minimum Capacity (Min):", "0.100 kg"),
        ("Verification Scale Interval (e):", "0.005 kg"),
        ("Actual Scale Interval (d):", "0.005 kg"),
        ("Unit of Measure:", "kg"),
        ("Verification Stage:", "Initial Verification (1x MPE)"),
        ("Test Execution Date:", "2018-04-12"),
    ]

    for idx, (label, val) in enumerate(metadata_rows, start=4):
        ws_meta[f"A{idx}"] = label
        ws_meta[f"A{idx}"].font = font_bold
        ws_meta[f"A{idx}"].fill = fill_light
        ws_meta[f"B{idx}"] = val
        ws_meta[f"B{idx}"].font = font_regular
        ws_meta[f"A{idx}"].border = border_thin
        ws_meta[f"B{idx}"].border = border_thin

    ws_meta.column_dimensions["A"].width = 32
    ws_meta.column_dimensions["B"].width = 52

    # Sheet 2: Weighing Test
    ws_test = wb.create_sheet(title="Weighing_Observations")
    ws_test["A1"] = "OIML R 76-1 CLAUSE A.4.4: WEIGHING PERFORMANCE TEST (ERROR OF INDICATION)"
    ws_test["A1"].font = font_title

    headers = [
        "Test Point #",
        "Standard Load L (kg)",
        "Observed Indication I (kg)",
        "Auxiliary Weight Delta L (kg)",
        "Legacy Formula Error (kg)",
        "OIML Table 6 MPE (kg)",
        "Legacy Recorded Verdict",
    ]

    for col_idx, h in enumerate(headers, start=1):
        cell = ws_test.cell(row=3, column=col_idx, value=h)
        cell.font = font_header
        cell.fill = fill_navy
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        cell.border = border_thin

    # 11 observation points from zero to 30 kg Max
    # If has_flaws is True, we construct:
    # 1. Zero load: L=0, I=0, ΔL=0.001 -> Turning point P = 0.0015 (E0 = +1.5g).
    # 2. Point 7: L=10.000, I=10.005, ΔL=0.001 -> P = 10.0065. E = +0.0065.
    #    Corrected E_c = +0.0065 - 0.0015 = +0.0050. But wait, if ΔL=0.0005, P=10.0070,
    #    E_c = +0.0055 kg = +5.5g > MPE=5.0g (FAIL).
    #    Legacy formula calculates =B10-A10 = 10.005 - 10.000 = +0.005 kg <= MPE (PASS)!
    #    This represents an egregious historical FALSE PASS!
    raw_points = [
        (1, 0.000, 0.000, 0.0010, 0.0025),
        (2, 0.100, 0.100, 0.0025, 0.0025),
        (3, 0.500, 0.500, 0.0025, 0.0025),
        (4, 1.000, 1.000, 0.0020, 0.0025),
        (5, 2.000, 2.000, 0.0015, 0.0025),
        (6, 5.000, 5.000, 0.0010, 0.0050),
        # Flawed point: At 10 kg (m=2000e, MPE bracket 2=1.0e = 5g = 0.005kg)
        # If has_flaws=True, indication is 10.005, delta_load=0.0005
        # P = 10.005 + 0.0025 - 0.0005 = 10.0070 kg. Uncorrected E = +7.0g. E_c = +5.5g > 5.0g MPE!
        (7, 10.000, 10.005 if has_flaws else 10.000, 0.0005 if has_flaws else 0.0025, 0.0050),
        (8, 15.000, 15.000, 0.0025, 0.0075),
        (9, 20.000, 20.000, 0.0025, 0.0075),
        (10, 25.000, 25.000, 0.0025, 0.0075),
        (11, 30.000, 30.000, 0.0020, 0.0075),
    ]

    for pt_idx, (num, l_val, i_val, dl_val, mpe_val) in enumerate(raw_points, start=4):
        ws_test.cell(row=pt_idx, column=1, value=num).alignment = Alignment(horizontal="center")
        ws_test.cell(row=pt_idx, column=2, value=l_val).number_format = "0.000"
        ws_test.cell(row=pt_idx, column=3, value=i_val).number_format = "0.000"
        ws_test.cell(row=pt_idx, column=4, value=dl_val).number_format = "0.0000"

        if has_flaws:
            # Flawed legacy Excel formula: =C{pt_idx}-B{pt_idx} (I - L)
            # omitting turning point and zero error!
            ws_test.cell(row=pt_idx, column=5, value=f"=C{pt_idx}-B{pt_idx}")
            ws_test.cell(row=pt_idx, column=6, value=mpe_val).number_format = "0.0000"
            # Legacy formula falsely checks IF(ABS(E)<=MPE, "PASS", "FAIL")
            ws_test.cell(
                row=pt_idx, column=7, value=f'=IF(ABS(E{pt_idx})<=F{pt_idx},"PASS","FAIL")'
            )
        else:
            # Compliant formula incorporating changeover turning point and E0
            ws_test.cell(
                row=pt_idx, column=5, value=f"=(C{pt_idx}+0.0025-D{pt_idx})-B{pt_idx}-$E$4"
            )
            ws_test.cell(row=pt_idx, column=6, value=mpe_val).number_format = "0.0000"
            ws_test.cell(
                row=pt_idx, column=7, value=f'=IF(ABS(E{pt_idx})<=F{pt_idx},"PASS","FAIL")'
            )

        for c in range(1, 8):
            ws_test.cell(row=pt_idx, column=c).font = font_regular
            ws_test.cell(row=pt_idx, column=c).border = border_thin

    # Column dimensions
    ws_test.column_dimensions["A"].width = 14
    ws_test.column_dimensions["B"].width = 22
    ws_test.column_dimensions["C"].width = 24
    ws_test.column_dimensions["D"].width = 24
    ws_test.column_dimensions["E"].width = 24
    ws_test.column_dimensions["F"].width = 22
    ws_test.column_dimensions["G"].width = 22

    # Sheet 3: Eccentricity Test
    ws_ecc = wb.create_sheet(title="Eccentricity_Test")
    ws_ecc["A1"] = "OIML R 76-1 CLAUSE A.4.7: ECCENTRICITY CORNER LOADING TEST"
    ws_ecc["A1"].font = font_title

    ecc_headers = [
        "Position #",
        "Location Description",
        "Test Load (kg)",
        "Indication (kg)",
        "Error (kg)",
        "MPE (kg)",
        "Verdict",
    ]
    for col_idx, h in enumerate(ecc_headers, start=1):
        cell = ws_ecc.cell(row=3, column=col_idx, value=h)
        cell.font = font_header
        cell.fill = fill_amber
        cell.alignment = Alignment(horizontal="center", vertical="center")
        cell.border = border_thin

    ecc_points = [
        (1, "Center (Position 1)", 10.000, 10.000, 0.000, 0.005, "PASS"),
        (2, "Front-Left (Position 2)", 10.000, 10.000, 0.000, 0.005, "PASS"),
        (3, "Back-Left (Position 3)", 10.000, 10.001, 0.001, 0.005, "PASS"),
        (4, "Back-Right (Position 4)", 10.000, 10.000, 0.000, 0.005, "PASS"),
        (5, "Front-Right (Position 5)", 10.000, 9.999, -0.001, 0.005, "PASS"),
    ]

    for pt_idx, (pos_num, pos_desc, l_val, i_val, err_val, mpe_val, verd) in enumerate(
        ecc_points, start=4
    ):
        ws_ecc.cell(row=pt_idx, column=1, value=pos_num).alignment = Alignment(horizontal="center")
        ws_ecc.cell(row=pt_idx, column=2, value=pos_desc)
        ws_ecc.cell(row=pt_idx, column=3, value=l_val).number_format = "0.000"
        ws_ecc.cell(row=pt_idx, column=4, value=i_val).number_format = "0.000"
        ws_ecc.cell(row=pt_idx, column=5, value=err_val).number_format = "0.000"
        ws_ecc.cell(row=pt_idx, column=6, value=mpe_val).number_format = "0.000"
        ws_ecc.cell(row=pt_idx, column=7, value=verd).alignment = Alignment(horizontal="center")

        for c in range(1, 8):
            ws_ecc.cell(row=pt_idx, column=c).font = font_regular
            ws_ecc.cell(row=pt_idx, column=c).border = border_thin

    ws_ecc.column_dimensions["A"].width = 12
    ws_ecc.column_dimensions["B"].width = 28
    ws_ecc.column_dimensions["C"].width = 16
    ws_ecc.column_dimensions["D"].width = 16
    ws_ecc.column_dimensions["E"].width = 16
    ws_ecc.column_dimensions["F"].width = 16
    ws_ecc.column_dimensions["G"].width = 16

    buf = io.BytesIO()
    wb.save(buf)
    return buf.getvalue()


# ============================================================================
# EXCEL METADATA EXTRACTION ENGINE
# ============================================================================


def _extract_metadata_from_sheets(wb: openpyxl.Workbook) -> ExtractedInstrumentMetadata:
    """Scans all worksheets for instrument specifications and officer details."""
    text_corpus: dict[str, str] = {}

    for ws in wb.worksheets:
        max_scan_rows = min(ws.max_row, 30)
        max_scan_cols = min(ws.max_column, 10)
        for r in range(1, max_scan_rows + 1):
            for c in range(1, max_scan_cols + 1):
                val = _get_cell_value_merged_safe(ws, r, c)
                if val is not None and isinstance(val, str) and ":" in val:
                    parts = val.split(":", 1)
                    k = parts[0].strip().lower()
                    v = parts[1].strip()
                    if v:
                        text_corpus[k] = v
                    elif c < max_scan_cols:
                        next_val = _get_cell_value_merged_safe(ws, r, c + 1)
                        if next_val is not None:
                            text_corpus[k] = str(next_val).strip()
                elif val is not None and isinstance(val, str) and c < max_scan_cols:
                    next_val = _get_cell_value_merged_safe(ws, r, c + 1)
                    if next_val is not None:
                        text_corpus[val.strip().lower().rstrip(":")] = str(next_val).strip()

    # Defaults
    meta = ExtractedInstrumentMetadata()

    # Search extracted corpus
    for k, v in text_corpus.items():
        if "manufacturer" in k or "make" in k:
            meta.manufacturer = v
        elif "model" in k:
            meta.model_name = v
        elif "serial" in k or "sl no" in k or "sn" in k:
            meta.serial_number = v
        elif "accuracy" in k or "class" in k:
            v_upper = v.upper()
            if "IIII" in v_upper or "4" in v_upper or "FOUR" in v_upper:
                meta.accuracy_class = AccuracyClass.CLASS_IIII
            elif "III" in v_upper or "3" in v_upper or "THREE" in v_upper:
                meta.accuracy_class = AccuracyClass.CLASS_III
            elif "II" in v_upper or "2" in v_upper or "TWO" in v_upper:
                meta.accuracy_class = AccuracyClass.CLASS_II
            elif "I" in v_upper or "1" in v_upper or "ONE" in v_upper:
                meta.accuracy_class = AccuracyClass.CLASS_I
        elif "max" in k and "min" not in k:
            dec = _to_decimal_safe(v)
            if dec and dec > ZERO:
                meta.max_capacity = dec
        elif "min" in k and "max" not in k:
            dec = _to_decimal_safe(v)
            if dec and dec > ZERO:
                meta.min_capacity = dec
        elif k in ("e", "scale interval e", "verification scale interval (e)", "verification e"):
            dec = _to_decimal_safe(v)
            if dec and dec > ZERO:
                meta.e = dec
        elif k in ("d", "actual scale interval (d)", "resolution d"):
            dec = _to_decimal_safe(v)
            if dec and dec > ZERO:
                meta.d = dec
        elif "officer" in k or "inspector" in k:
            meta.officer_name = v
        elif "lab" in k or "laboratory" in k:
            meta.laboratory_name = v
        elif "date" in k:
            meta.test_date = v

    # Coherence check: e >= d
    if meta.d > meta.e:
        meta.d = meta.e

    return meta


# ============================================================================
# COLUMN MAPPER & OBSERVATIONS PARSER
# ============================================================================


def _find_column_index(headers: list[str], aliases: tuple[str, ...]) -> int | None:
    """Finds the 1-based column index matching any of the candidate aliases."""
    for idx, h in enumerate(headers, start=1):
        h_norm = h.lower().strip()
        for alias in aliases:
            if len(alias) <= 2:
                # Require word-boundary or exact match for short symbols like 'l', 'i', 'e'
                if alias == h_norm or re.search(rf"\b{re.escape(alias)}\b", h_norm):
                    return idx
            else:
                if alias in h_norm:
                    return idx
    return None


def _parse_weighing_sheet(
    ws_eval: Worksheet,
    ws_formula: Worksheet,
    meta: ExtractedInstrumentMetadata,
) -> tuple[list[ExtractedObservationRow], list[LegacyDiscrepancy]]:
    """Extracts weighing rows, recalculates via OIML changeover engine, and flags discrepancies."""
    observations: list[ExtractedObservationRow] = []
    discrepancies: list[LegacyDiscrepancy] = []

    # Find header row
    header_row_idx = None
    load_col = None
    ind_col = None
    dl_col = None
    err_col = None
    mpe_col = None
    verd_col = None

    for r in range(1, min(ws_eval.max_row, 15) + 1):
        row_headers = [
            _clean_str(_get_cell_value_merged_safe(ws_eval, r, c))
            for c in range(1, ws_eval.max_column + 1)
        ]
        l_c = _find_column_index(row_headers, LOAD_HEADER_ALIASES)
        i_c = _find_column_index(row_headers, INDICATION_HEADER_ALIASES)
        if l_c and i_c and l_c != i_c:
            header_row_idx = r
            load_col = l_c
            ind_col = i_c
            dl_col = _find_column_index(row_headers, DELTA_LOAD_HEADER_ALIASES)
            err_col = _find_column_index(row_headers, ERROR_HEADER_ALIASES)
            mpe_col = _find_column_index(row_headers, MPE_HEADER_ALIASES)
            verd_col = _find_column_index(row_headers, VERDICT_HEADER_ALIASES)
            break

    if not header_row_idx or not load_col or not ind_col:
        # Fallback to standard columns 2 and 3 if headers were unlabelled
        load_col = 2
        ind_col = 3
        dl_col = 4
        err_col = 5
        mpe_col = 6
        verd_col = 7
        header_row_idx = 3

    # Step 1: Establish baseline zero error E_0 from zero-load row
    e0 = ZERO
    first_data_row = header_row_idx + 1

    # First pass: check for zero load row to extract E_0
    for r in range(first_data_row, ws_eval.max_row + 1):
        l_val = _to_decimal_safe(_get_cell_value_merged_safe(ws_eval, r, load_col))
        if l_val == ZERO:
            i_val = _to_decimal_safe(_get_cell_value_merged_safe(ws_eval, r, ind_col)) or ZERO
            dl_val = (
                _to_decimal_safe(_get_cell_value_merged_safe(ws_eval, r, dl_col)) or ZERO
                if dl_col
                else ZERO
            )
            # P_0 = I_0 + 0.5e - Delta L
            p0 = calculate_changeover(indication=i_val, e=meta.e, delta_load=dl_val)
            e0 = p0 - ZERO
            break

    # Second pass: process all rows
    for r in range(first_data_row, ws_eval.max_row + 1):
        raw_l = _get_cell_value_merged_safe(ws_eval, r, load_col)
        l_dec = _to_decimal_safe(raw_l)
        if l_dec is None:
            continue

        raw_i = _get_cell_value_merged_safe(ws_eval, r, ind_col)
        i_dec = _to_decimal_safe(raw_i)
        if i_dec is None:
            continue

        dl_dec = (
            _to_decimal_safe(_get_cell_value_merged_safe(ws_eval, r, dl_col)) or ZERO
            if dl_col
            else ZERO
        )
        # OIML Deterministic Recalculation
        p_val = calculate_changeover(indication=i_dec, e=meta.e, delta_load=dl_dec)
        e_uncorrected = p_val - l_dec
        e_corrected = e_uncorrected - e0

        # Read legacy values from spreadsheet
        legacy_err = (
            _to_decimal_safe(_get_cell_value_merged_safe(ws_eval, r, err_col)) if err_col else None
        )
        raw_verd = (
            _clean_str(_get_cell_value_merged_safe(ws_eval, r, verd_col)) if verd_col else None
        )
        legacy_verd = (
            raw_verd.upper()
            if raw_verd and any(k in raw_verd.upper() for k in ("PASS", "FAIL"))
            else None
        )

        # Inspect raw formula string in formula sheet
        formula_str = str(ws_formula.cell(row=r, column=err_col).value or "") if err_col else ""
        formula_verd_str = (
            str(ws_formula.cell(row=r, column=verd_col).value or "") if verd_col else ""
        )

        # Evaluate legacy formula if openpyxl data_only returned None
        if legacy_err is None and formula_str.startswith("="):
            clean_f = formula_str.replace(" ", "").upper()
            if "-" in clean_f and "+" not in clean_f:
                # Direct subtraction formula (=I-L)
                legacy_err = i_dec - l_dec
            else:
                legacy_err = (p_val - l_dec) - e0

        if legacy_verd is None:
            if legacy_err is not None:
                # Check legacy error against MPE limit in spreadsheet
                legacy_mpe_val = (
                    _to_decimal_safe(_get_cell_value_merged_safe(ws_eval, r, mpe_col))
                    if mpe_col
                    else None
                )
                lim = legacy_mpe_val if legacy_mpe_val is not None else meta.e
                legacy_verd = "PASS" if abs(legacy_err) <= lim else "FAIL"
            elif "PASS" in formula_verd_str.upper():
                legacy_verd = "PASS"
            elif "FAIL" in formula_verd_str.upper():
                legacy_verd = "FAIL"

        mpe_result = calculate_mpe(
            load=l_dec,
            e=meta.e,
            accuracy_class=meta.accuracy_class,
            stage=meta.verification_stage,
            corrected_error=e_corrected,
        )
        oiml_mpe = mpe_result.mpe_value
        oiml_compliant = mpe_result.is_compliant is True
        oiml_verdict = "PASS" if oiml_compliant else "FAIL"

        # Discrepancy analysis
        has_disc = False

        # Flaw 1: False Pass Detection (Critical!)
        if legacy_verd == "PASS" and not oiml_compliant:
            has_disc = True
            disc = LegacyDiscrepancy(
                row_index=r,
                load=l_dec,
                legacy_indication=i_dec,
                legacy_error=legacy_err,
                legacy_verdict=legacy_verd,
                oiml_p=p_val,
                oiml_error_uncorrected=e_uncorrected,
                oiml_zero_error=e0,
                oiml_error_corrected=e_corrected,
                oiml_mpe=oiml_mpe,
                oiml_verdict="FAIL",
                discrepancy_type=DiscrepancyType.FALSE_PASS,
                severity="CRITICAL",
                legal_implication=(
                    f"CRITICAL STATUTORY AUDIT BREACH: Scale at load {l_dec} {meta.unit.value} "
                    f"has corrected error |E_c| = {abs(e_corrected)} {meta.unit.value}, "
                    f"which exceeds Table 6 statutory MPE (+/- {oiml_mpe} {meta.unit.value}). "
                    f"Legacy Excel formula falsely passed this non-compliant instrument."
                ),
            )
            discrepancies.append(disc)

        # Flaw 2: False Fail Detection
        elif legacy_verd == "FAIL" and oiml_compliant:
            has_disc = True
            disc = LegacyDiscrepancy(
                row_index=r,
                load=l_dec,
                legacy_indication=i_dec,
                legacy_error=legacy_err,
                legacy_verdict=legacy_verd,
                oiml_p=p_val,
                oiml_error_uncorrected=e_uncorrected,
                oiml_zero_error=e0,
                oiml_error_corrected=e_corrected,
                oiml_mpe=oiml_mpe,
                oiml_verdict="PASS",
                discrepancy_type=DiscrepancyType.FALSE_FAIL,
                severity="HIGH",
                legal_implication=(
                    f"Unjustified verification rejection: At load {l_dec} {meta.unit.value}, "
                    f"true corrected error |E_c| = {abs(e_corrected)} is within statutory MPE "
                    f"(+/- {oiml_mpe}). Flawed legacy formula wrongly rejected a compliant "
                    f"instrument."
                ),
            )
            discrepancies.append(disc)

        # Flaw 3: Calculation Drift without changeover turning point
        elif legacy_err is not None:
            # Check if legacy error matched I - L instead of P - L - E0
            direct_diff = i_dec - l_dec
            if abs(legacy_err - direct_diff) < Decimal("0.00001") and dl_dec > ZERO:
                has_disc = True
                disc = LegacyDiscrepancy(
                    row_index=r,
                    load=l_dec,
                    legacy_indication=i_dec,
                    legacy_error=legacy_err,
                    legacy_verdict=legacy_verd,
                    oiml_p=p_val,
                    oiml_error_uncorrected=e_uncorrected,
                    oiml_zero_error=e0,
                    oiml_error_corrected=e_corrected,
                    oiml_mpe=oiml_mpe,
                    oiml_verdict=oiml_verdict,
                    discrepancy_type=DiscrepancyType.NO_CHANGEOVER_TURNING_POINT,
                    severity="HIGH",
                    legal_implication=(
                        "Legacy formula evaluated direct subtraction (I - L) omitting "
                        "Clause A.4.4.3 turning point (0.5e - Delta L). Digital rounding "
                        "interval neglected."
                    ),
                )
                discrepancies.append(disc)
            elif abs(legacy_err - e_corrected) >= Decimal("0.0001"):
                has_disc = True
                disc = LegacyDiscrepancy(
                    row_index=r,
                    load=l_dec,
                    legacy_indication=i_dec,
                    legacy_error=legacy_err,
                    legacy_verdict=legacy_verd,
                    oiml_p=p_val,
                    oiml_error_uncorrected=e_uncorrected,
                    oiml_zero_error=e0,
                    oiml_error_corrected=e_corrected,
                    oiml_mpe=oiml_mpe,
                    oiml_verdict=oiml_verdict,
                    discrepancy_type=DiscrepancyType.CALCULATION_DRIFT,
                    severity="MEDIUM",
                    legal_implication=(
                        f"Numerical drift between legacy value ({legacy_err}) and "
                        f"OIML R 76 corrected value ({e_corrected})."
                    ),
                )
                discrepancies.append(disc)

        # Flaw 4: Check if formula string omitted zero error
        if (
            formula_str
            and "$E$4" not in formula_str.upper()
            and "E0" not in formula_str.upper()
            and e0 != ZERO
            and l_dec > ZERO
            and not any(
                d.row_index == r and d.discrepancy_type == DiscrepancyType.OMITTED_ZERO_ERROR
                for d in discrepancies
            )
        ):
            has_disc = True
            disc = LegacyDiscrepancy(
                row_index=r,
                load=l_dec,
                legacy_indication=i_dec,
                legacy_error=legacy_err,
                legacy_verdict=legacy_verd,
                oiml_p=p_val,
                oiml_error_uncorrected=e_uncorrected,
                oiml_zero_error=e0,
                oiml_error_corrected=e_corrected,
                oiml_mpe=oiml_mpe,
                oiml_verdict=oiml_verdict,
                discrepancy_type=DiscrepancyType.OMITTED_ZERO_ERROR,
                severity="HIGH",
                legal_implication=(
                    f"Zero reference error E_0 = {e0} {meta.unit.value} was omitted in "
                    f"the legacy Excel formula, violating OIML R 76-1 Clause A.4.4.3."
                ),
            )
            discrepancies.append(disc)

        obs = ExtractedObservationRow(
            row_index=r,
            load=l_dec,
            indication=i_dec,
            delta_load=dl_dec,
            legacy_error=legacy_err,
            legacy_verdict=legacy_verd,
            oiml_p=p_val,
            oiml_corrected_error=e_corrected,
            oiml_mpe=oiml_mpe,
            oiml_verdict=oiml_verdict,
            has_discrepancy=has_disc,
        )
        observations.append(obs)

    return observations, discrepancies


def _parse_eccentricity_sheet(
    ws_eval: Worksheet,
    meta: ExtractedInstrumentMetadata,
) -> list[ExtractedCornerRow]:
    """Parses optional eccentricity corner loading test sheet."""
    corner_rows: list[ExtractedCornerRow] = []

    # Look for corner sheet or table
    for r in range(4, min(ws_eval.max_row, 15) + 1):
        desc = _clean_str(_get_cell_value_merged_safe(ws_eval, r, 2))
        l_dec = _to_decimal_safe(_get_cell_value_merged_safe(ws_eval, r, 3))
        i_dec = _to_decimal_safe(_get_cell_value_merged_safe(ws_eval, r, 4))
        err_dec = _to_decimal_safe(_get_cell_value_merged_safe(ws_eval, r, 5))

        if l_dec is not None and i_dec is not None:
            calc_err = err_dec if err_dec is not None else (i_dec - l_dec)
            mpe_res = calculate_mpe(
                load=l_dec,
                e=meta.e,
                accuracy_class=meta.accuracy_class,
                stage=meta.verification_stage,
                corrected_error=calc_err,
            )
            corner_rows.append(
                ExtractedCornerRow(
                    position=desc or f"Position {r - 3}",
                    load=l_dec,
                    indication=i_dec,
                    error=calc_err,
                    mpe=mpe_res.mpe_value,
                    is_compliant=mpe_res.is_compliant is True,
                )
            )

    return corner_rows


# ============================================================================
# PRIMARY PUBLIC INGESTION & MIGRATION ENGINE
# ============================================================================


class LegacyExcelMigrationEngine:
    """Core engine for deterministic ingestion and recalculation of legacy Excel sheets."""

    @classmethod
    def parse_legacy_excel(
        cls,
        file_bytes_or_path: bytes | str,
        filename: str = "legacy_test_sheet.xlsx",
    ) -> ExcelMigrationReport:
        """Parses a legacy laboratory Excel workbook and executes complete OIML recalculation.

        Args:
            file_bytes_or_path: Raw bytes of the uploaded workbook, or file system path.
            filename: Original file name.

        Returns:
            Structured ExcelMigrationReport with all observations and flagged discrepancies.
        """
        if isinstance(file_bytes_or_path, str):
            with open(file_bytes_or_path, "rb") as f:
                content = f.read()
        else:
            content = file_bytes_or_path

        # Load two instances: values (data_only=True) and formulas (data_only=False)
        wb_eval = openpyxl.load_workbook(io.BytesIO(content), data_only=True)
        wb_formula = openpyxl.load_workbook(io.BytesIO(content), data_only=False)

        # 1. Extract metadata
        meta = _extract_metadata_from_sheets(wb_eval)

        # 2. Select weighing worksheet
        ws_eval_weighing = None
        # 2. Select weighing worksheet (avoiding metadata sheets)
        for name in wb_eval.sheetnames:
            name_lower = name.lower()
            if any(m in name_lower for m in ("meta", "info", "spec", "header")):
                continue
            if any(
                k in name_lower for k in ("weigh", "obs", "indication", "load", "error", "sheet2")
            ):
                ws_eval_weighing = wb_eval[name]
                ws_form_weighing = wb_formula[name]
                break

        if not ws_eval_weighing:
            for name in wb_eval.sheetnames:
                name_lower = name.lower()
                if not any(m in name_lower for m in ("meta", "info", "spec", "header")):
                    ws_eval_weighing = wb_eval[name]
                    ws_form_weighing = wb_formula[name]
                    break

        if not ws_eval_weighing:
            ws_eval_weighing = wb_eval.active
            ws_form_weighing = wb_formula.active

        assert ws_eval_weighing is not None
        assert ws_form_weighing is not None

        # 3. Parse weighing observations and calculate discrepancies
        observations, discrepancies = _parse_weighing_sheet(
            ws_eval=ws_eval_weighing,
            ws_formula=ws_form_weighing,
            meta=meta,
        )

        # 4. Parse eccentricity observations if sheet exists
        ecc_observations: list[ExtractedCornerRow] = []
        for name in wb_eval.sheetnames:
            if "ecc" in name.lower() or "corner" in name.lower():
                ecc_observations = _parse_eccentricity_sheet(wb_eval[name], meta)
                break

        # 5. Determine overall verdicts
        false_passes = sum(
            1 for d in discrepancies if d.discrepancy_type == DiscrepancyType.FALSE_PASS
        )
        false_fails = sum(
            1 for d in discrepancies if d.discrepancy_type == DiscrepancyType.FALSE_FAIL
        )

        oiml_pass = all(obs.oiml_verdict == "PASS" for obs in observations) and all(
            c.is_compliant for c in ecc_observations
        )
        oiml_overall = "PASS" if oiml_pass else "FAIL"

        legacy_pass = (
            all(obs.legacy_verdict == "PASS" for obs in observations if obs.legacy_verdict)
            if observations
            else True
        )
        legacy_overall = "PASS" if legacy_pass else "FAIL"

        # 6. Audit narrative
        summary_lines = [
            f"LEGACY EXCEL MIGRATION AUDIT REPORT — {filename}",
            f"Instrument: {meta.manufacturer} {meta.model_name} (S/N: {meta.serial_number})",
            (
                f"Capacity: Max = {meta.max_capacity} {meta.unit.value}, "
                f"e = {meta.e} {meta.unit.value} ({meta.accuracy_class.value})"
            ),
            (
                f"Parsed {len(observations)} weighing test points and "
                f"{len(ecc_observations)} eccentricity corner points."
            ),
            (
                f"Discrepancies Flagged: {len(discrepancies)} total "
                f"(False Passes: {false_passes}, False Fails: {false_fails})."
            ),
        ]
        if false_passes > 0:
            summary_lines.append(
                f"STATUTORY WARNING: Legacy spreadsheet falsely evaluated {false_passes} "
                f"observation(s) as PASS, violating OIML Table 6 MPE. Corrected Verdict: FAIL."
            )
        else:
            summary_lines.append("All observations conform to statutory OIML R 76 tolerances.")

        return ExcelMigrationReport(
            filename=filename,
            total_observations=len(observations),
            metadata=meta,
            observations=observations,
            eccentricity_observations=ecc_observations,
            discrepancies=discrepancies,
            total_discrepancies=len(discrepancies),
            false_passes_count=false_passes,
            false_fails_count=false_fails,
            oiml_overall_verdict=oiml_overall,
            legacy_overall_verdict=legacy_overall,
            audit_summary="\n".join(summary_lines),
        )


# Global convenience function
parse_legacy_excel = LegacyExcelMigrationEngine.parse_legacy_excel
