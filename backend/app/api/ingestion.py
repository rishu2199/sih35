"""METROLOGIX-76 Legacy Excel Ingestion & Migration API Router.

Endpoints for:
1. Uploading and parsing legacy RRSL/DoCA Excel spreadsheets (.xlsx).
2. Deterministic recalculation through the OIML R 76 changeover engine.
3. Auditing historical mathematical flaws and False Passes.
4. Generating benchmark legacy sample sheets for 1-click testing.
"""

from __future__ import annotations

import base64
from typing import Annotated, Any

from fastapi import APIRouter, File, HTTPException, Query, Response, UploadFile, status
from pydantic import BaseModel, Field

from app.ingestion.excel_parser import (
    ExcelMigrationReport,
    LegacyExcelMigrationEngine,
    generate_sample_legacy_excel,
)

router = APIRouter()


class Base64ExcelRequest(BaseModel):
    """Payload for base64 encoded Excel spreadsheet."""

    filename: str = Field(default="legacy_test_sheet.xlsx", description="Original filename")
    file_base64: str = Field(..., description="Base64 encoded .xlsx file content")


@router.post(
    "/excel/upload",
    response_model=ExcelMigrationReport,
    summary="Upload and Migrate Legacy Lab Excel Spreadsheet",
)
async def upload_legacy_excel(
    file: Annotated[UploadFile, File(description="Legacy .xlsx test sheet")],
) -> ExcelMigrationReport:
    """Accepts legacy RRSL / DoCA laboratory Excel spreadsheet upload.

    Intelligently maps columns, extracts metadata, recalculates observations
    through OIML R 76 Clause A.4.4.3 changeover engine, and flags historical formula flaws.
    """
    if not file.filename or not file.filename.lower().endswith((".xlsx", ".xls")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file must be an Excel spreadsheet (.xlsx or .xls)",
        )

    content = await file.read()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty",
        )

    try:
        return LegacyExcelMigrationEngine.parse_legacy_excel(
            file_bytes_or_path=content,
            filename=file.filename,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to parse legacy Excel spreadsheet: {e}",
        ) from e


@router.post(
    "/excel/parse-base64",
    response_model=ExcelMigrationReport,
    summary="Parse Base64 Encoded Legacy Excel Sheet",
)
async def parse_base64_excel(req: Base64ExcelRequest) -> ExcelMigrationReport:
    """Accepts base64 encoded spreadsheet payload and returns migration audit report."""
    clean_b64 = req.file_base64
    if "," in clean_b64:
        clean_b64 = clean_b64.split(",", 1)[1]

    try:
        content = base64.b64decode(clean_b64)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid base64 payload: {e}",
        ) from e

    try:
        return LegacyExcelMigrationEngine.parse_legacy_excel(
            file_bytes_or_path=content,
            filename=req.filename,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to process Excel spreadsheet: {e}",
        ) from e


@router.get(
    "/excel/sample-file",
    summary="Download Benchmark Sample Legacy Excel Spreadsheet",
)
async def download_sample_excel(
    has_flaws: bool = Query(
        default=True,
        description="If True, includes historical Excel formula math flaws (false pass at 10kg)",
    ),
) -> Response:
    """Generates an authentic RRSL Bangalore legacy lab test sheet for testing."""
    excel_bytes = generate_sample_legacy_excel(has_flaws=has_flaws)
    filename = (
        "RRSL_Bangalore_Legacy_Sheet_Flawed_2018.xlsx"
        if has_flaws
        else "RRSL_Bangalore_Legacy_Sheet_Compliant_2018.xlsx"
    )
    return Response(
        content=excel_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get(
    "/excel/demo-report",
    response_model=ExcelMigrationReport,
    summary="Get Instant Demo Migration Report with Flagged Formula Flaws",
)
async def get_demo_report() -> ExcelMigrationReport:
    """Returns an instantaneous migration report on the benchmark legacy sheet.

    Highlights the critical False Pass at 10.000 kg where manual Excel formulas
    masked a non-compliant instrument under Section 24 of the Legal Metrology Act.
    """
    excel_bytes = generate_sample_legacy_excel(has_flaws=True)
    return LegacyExcelMigrationEngine.parse_legacy_excel(
        file_bytes_or_path=excel_bytes,
        filename="RRSL_Bangalore_Legacy_Sheet_Flawed_2018.xlsx",
    )


@router.get(
    "/excel/sample-data-url",
    summary="Get Sample Legacy Excel as Base64 Data URL for UI Demo",
)
async def get_sample_data_url() -> dict[str, Any]:
    """Provides base64 data URLs for both flawed and compliant sample legacy sheets."""
    flawed_bytes = generate_sample_legacy_excel(has_flaws=True)
    compliant_bytes = generate_sample_legacy_excel(has_flaws=False)

    def to_b64(b: bytes) -> str:
        return base64.b64encode(b).decode("utf-8")

    return {
        "flawed_legacy_sheet": {
            "title": "RRSL Bangalore Legacy Sheet (Flawed Formulas - False Pass)",
            "filename": "RRSL_Bangalore_Legacy_Sheet_Flawed_2018.xlsx",
            "has_flaws": True,
            "description": (
                "Historical 2018 spreadsheet using direct subtraction (=I-L) and omitting "
                "turning point Delta L and zero error E_0. Falsely passes non-compliant scale at 10kg."
            ),
            "base64": to_b64(flawed_bytes),
        },
        "compliant_legacy_sheet": {
            "title": "RRSL Bangalore Legacy Sheet (Compliant OIML Formulation)",
            "filename": "RRSL_Bangalore_Legacy_Sheet_Compliant_2018.xlsx",
            "has_flaws": False,
            "description": "Historical spreadsheet with correct turning point formulas.",
            "base64": to_b64(compliant_bytes),
        },
    }
