"""METROLOGIX-76 Computer Vision & Optical Character Recognition Module."""

from app.vision.ocr_intake import (
    NameplateExtractionResult,
    NameplateOcrEngine,
    ParsedScaleParameters,
    SoftwareAuditMarking,
    extract_nameplate_parameters,
)
from app.vision.photo_auditor import (
    BoundingBox,
    CircleGeometry,
    ForeignObjectDetection,
    FullPhysicalAuditResult,
    LeadSealHoleAuditResult,
    PhotoAuditorEngine,
    PlatterSurfaceAuditResult,
    SpiritBubbleAuditResult,
    audit_full_physical_inspection,
    audit_platter_surface,
    audit_spirit_bubble,
    generate_synthetic_lead_seal,
    generate_synthetic_platter,
    generate_synthetic_spirit_bubble,
    verify_lead_seal_hole,
)

__all__ = [
    "NameplateExtractionResult",
    "NameplateOcrEngine",
    "ParsedScaleParameters",
    "SoftwareAuditMarking",
    "extract_nameplate_parameters",
    "BoundingBox",
    "CircleGeometry",
    "ForeignObjectDetection",
    "FullPhysicalAuditResult",
    "LeadSealHoleAuditResult",
    "PhotoAuditorEngine",
    "PlatterSurfaceAuditResult",
    "SpiritBubbleAuditResult",
    "audit_spirit_bubble",
    "audit_platter_surface",
    "verify_lead_seal_hole",
    "audit_full_physical_inspection",
    "generate_synthetic_spirit_bubble",
    "generate_synthetic_platter",
    "generate_synthetic_lead_seal",
]
