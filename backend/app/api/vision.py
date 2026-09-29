"""METROLOGIX-76 Computer Vision Physical Auditor API Router.

Exposes endpoints for:
1. Spirit Bubble Level Verification (Hough Circles tilt measurement)
2. Platter Surface Cleanliness & Obstruction Check (Optical baseline subtraction)
3. Statutory Lead Wire Sealing Hole Verification (Edge-gradient detection)
4. Comprehensive Full Physical Audit (Combined Leveling, Platter & Seal)
5. Sample Demo Photos (Level OK/Tilted, Clean/Cluttered, Seal Present/Missing)
"""

from __future__ import annotations

import base64
from typing import Annotated, Any

from fastapi import APIRouter, File, HTTPException, UploadFile, status
from pydantic import BaseModel, Field

from app.vision.photo_auditor import (
    FullPhysicalAuditResult,
    LeadSealHoleAuditResult,
    PhotoAuditorEngine,
    PlatterSurfaceAuditResult,
    SpiritBubbleAuditResult,
    audit_full_physical_inspection,
    audit_platter_surface,
    audit_spirit_bubble,
    verify_lead_seal_hole,
)

router = APIRouter()


class Base64ImageRequest(BaseModel):
    """Payload for single base64 image requests."""

    image_base64: str = Field(..., description="Base64 encoded image string or data URL")
    max_permitted_tilt_deg: float | None = Field(
        default=0.5, description="Max tilt limit in degrees"
    )


class PlatterSurfaceRequest(BaseModel):
    """Payload for platter surface cleanliness verification."""

    current_image_base64: str = Field(..., description="Current platter image base64")
    baseline_image_base64: str | None = Field(
        default=None, description="Optional empty pan baseline image"
    )


class FullPhysicalAuditRequest(BaseModel):
    """Payload for complete physical inspection."""

    spirit_image_base64: str | None = Field(
        default=None, description="Spirit level bubble image base64"
    )
    current_platter_image_base64: str | None = Field(
        default=None, description="Current platter image base64"
    )
    baseline_platter_image_base64: str | None = Field(
        default=None, description="Optional empty pan baseline image base64"
    )
    casing_seal_image_base64: str | None = Field(
        default=None, description="Lead wire seal casing image base64"
    )
    max_permitted_tilt_deg: float | None = Field(
        default=0.5, description="Max tilt limit in degrees"
    )


def _extract_bytes_from_base64(data_str: str) -> bytes:
    """Strips data URL headers if present and decodes base64 string to bytes."""
    if not data_str:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Empty image data string provided",
        )
    if "," in data_str:
        data_str = data_str.split(",", 1)[1]
    try:
        return base64.b64decode(data_str)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid base64 image data: {e}",
        ) from e


@router.post(
    "/audit-spirit-bubble",
    response_model=SpiritBubbleAuditResult,
    summary="Audit Spirit Level Bubble Concentricity & Tilt Angle",
)
async def api_audit_spirit_bubble(req: Base64ImageRequest) -> SpiritBubbleAuditResult:
    """Measures spirit bubble concentricity and calculates instrument inclination.

    Under OIML R 76-1 Clause 3.9.1.1 & Seventh Schedule Part I Clause 3.9,
    the bubble must remain within the central circle (tilt <= 0.5 degrees).
    """
    img_bytes = _extract_bytes_from_base64(req.image_base64)
    max_tilt = req.max_permitted_tilt_deg or 0.5
    return audit_spirit_bubble(img_bytes, max_permitted_tilt_deg=max_tilt)


@router.post(
    "/audit-spirit-bubble/upload",
    response_model=SpiritBubbleAuditResult,
    summary="Upload Photo for Spirit Bubble Audit",
)
async def upload_spirit_bubble(
    file: Annotated[UploadFile, File(description="Spirit bubble photo file")],
) -> SpiritBubbleAuditResult:
    """Accepts multipart file upload for spirit bubble audit."""
    content = await file.read()
    return audit_spirit_bubble(content)


@router.post(
    "/audit-platter-surface",
    response_model=PlatterSurfaceAuditResult,
    summary="Audit Platter Surface Cleanliness & Edge-Binding Obstructions",
)
async def api_audit_platter_surface(req: PlatterSurfaceRequest) -> PlatterSurfaceAuditResult:
    """Detects foreign mass, contamination, and edge-binding obstructions on load receptor."""
    curr_bytes = _extract_bytes_from_base64(req.current_image_base64)
    base_bytes = (
        _extract_bytes_from_base64(req.baseline_image_base64) if req.baseline_image_base64 else None
    )
    return audit_platter_surface(curr_bytes, baseline_image=base_bytes)


@router.post(
    "/verify-lead-seal",
    response_model=LeadSealHoleAuditResult,
    summary="Verify Statutory Lead Wire Sealing Pass-Through Hole",
)
async def api_verify_lead_seal(req: Base64ImageRequest) -> LeadSealHoleAuditResult:
    """Verifies presence of the physical sealing pass-through hole (Section 24 of Act)."""
    img_bytes = _extract_bytes_from_base64(req.image_base64)
    return verify_lead_seal_hole(img_bytes)


@router.post(
    "/full-physical-audit",
    response_model=FullPhysicalAuditResult,
    summary="Execute Complete Physical Inspection across Leveling, Platter & Seals",
)
async def api_full_physical_audit(req: FullPhysicalAuditRequest) -> FullPhysicalAuditResult:
    """Executes multi-parameter physical verification and generates unified inspection report."""
    spirit_bytes = (
        _extract_bytes_from_base64(req.spirit_image_base64) if req.spirit_image_base64 else None
    )
    curr_bytes = (
        _extract_bytes_from_base64(req.current_platter_image_base64)
        if req.current_platter_image_base64
        else None
    )
    base_bytes = (
        _extract_bytes_from_base64(req.baseline_platter_image_base64)
        if req.baseline_platter_image_base64
        else None
    )
    seal_bytes = (
        _extract_bytes_from_base64(req.casing_seal_image_base64)
        if req.casing_seal_image_base64
        else None
    )

    return audit_full_physical_inspection(
        spirit_image=spirit_bytes,
        current_platter_image=curr_bytes,
        baseline_platter_image=base_bytes,
        casing_seal_image=seal_bytes,
        max_permitted_tilt_deg=req.max_permitted_tilt_deg or 0.5,
    )


@router.get(
    "/demo-samples",
    summary="Get Curated Laboratory Demo Photos for 1-Click Optical Verification",
)
async def get_demo_samples() -> dict[str, Any]:
    """Provides synthetic reference laboratory photos for testing and UI demonstrations."""
    bubble_level_bytes = PhotoAuditorEngine.generate_synthetic_spirit_bubble(is_level=True)
    bubble_tilt_bytes = PhotoAuditorEngine.generate_synthetic_spirit_bubble(is_level=False)
    platter_clean_bytes = PhotoAuditorEngine.generate_synthetic_platter(has_contamination=False)
    platter_clutter_bytes = PhotoAuditorEngine.generate_synthetic_platter(has_contamination=True)
    seal_present_bytes = PhotoAuditorEngine.generate_synthetic_lead_seal(has_hole=True)
    seal_missing_bytes = PhotoAuditorEngine.generate_synthetic_lead_seal(has_hole=False)

    def to_data_url(b: bytes) -> str:
        return f"data:image/png;base64,{base64.b64encode(b).decode('utf-8')}"

    return {
        "spirit_level_pass": {
            "title": "Spirit Level Bubble: Concentric (PASS)",
            "expected_verdict": "PASS",
            "expected_tilt": "< 0.2 deg",
            "description": (
                "Instrument leveling feet correctly adjusted. Bubble centered within target ring."
            ),
            "data_url": to_data_url(bubble_level_bytes),
        },
        "spirit_level_fail": {
            "title": "Spirit Level Bubble: Tilted (FAIL)",
            "expected_verdict": "FAIL",
            "expected_tilt": "> 0.5 deg",
            "description": "Instrument out of level. Bubble displaced beyond outer boundary.",
            "data_url": to_data_url(bubble_tilt_bytes),
        },
        "platter_clean_pass": {
            "title": "Platter Surface: Clean Stainless Pan (PASS)",
            "expected_verdict": "PASS",
            "cleanliness_score": "100%",
            "description": (
                "Empty tared pan with zero foreign objects and clean boundary perimeter."
            ),
            "data_url": to_data_url(platter_clean_bytes),
        },
        "platter_cluttered_fail": {
            "title": "Platter Surface: Foreign Object / Coin Contamination (FAIL)",
            "expected_verdict": "FAIL",
            "cleanliness_score": "< 80%",
            "description": "Contaminant mass (brass coin and washer) detected on platter surface.",
            "data_url": to_data_url(platter_clutter_bytes),
        },
        "lead_seal_hole_pass": {
            "title": "Lead Seal Provision: Wire Pass-Through Hole Present (PASS)",
            "expected_verdict": "PASS",
            "statutory_ref": "Section 24 Legal Metrology Act, 2009",
            "description": (
                "Chassis sealing borehole intact for official verification stamping wire."
            ),
            "data_url": to_data_url(seal_present_bytes),
        },
        "lead_seal_hole_fail": {
            "title": "Lead Seal Provision: Missing Sealing Hole (FAIL)",
            "expected_verdict": "FAIL",
            "statutory_ref": "Rule 11/12 Legal Metrology (General) Rules, 2011",
            "description": "Housing casing lacks mandatory wire sealing hole. Cannot be stamped.",
            "data_url": to_data_url(seal_missing_bytes),
        },
    }
