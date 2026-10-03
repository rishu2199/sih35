"""
METROLOGIX-76 — Instrument Intake & Nameplate OCR API Routes.

Statutory Authorities:
- OIML R 76-1:2006 (E) Clause 7.1 (Markings) & Clause 3.2 (Table 3)
- WELMEC 7.2 (Issue 7) Software Guide: Legally Relevant Software Audit
- Legal Metrology (General) Rules, 2011, Seventh Schedule, Part A
- SIH Problem Statement 26035
"""

from __future__ import annotations

import re
import uuid
from decimal import Decimal
from typing import Any

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.audit_logger import AuditLogger, EVENT_SESSION_CREATED
from app.core.scale_interval_validator import validate_scale_intervals
from app.core.schemas import InstrumentSpecification
from app.core.tam_engine import generate_test_applicability_matrix
from app.core.types import (
    AccuracyClass,
    ComplianceStatus,
    InstrumentMobility,
    LoadReceptorType,
    UnitOfMeasure,
    VerificationStage,
)
from app.db.models import (
    Instrument,
    Laboratory,
    LaboratoryType,
    TestSession,
    TestSessionStatus,
    UnitOfMeasurement,
    User,
    UserRole,
)
from app.db.repositories.instrument_repository import InstrumentRepository
from app.db.repositories.test_session_repository import TestSessionRepository
from app.db.session import get_db
from app.vision.ocr_intake import (
    NameplateExtractionResult,
    ParsedScaleParameters,
    SoftwareAuditMarking,
    extract_nameplate_parameters,
)

router = APIRouter()

# ============================================================================
# 1. Pydantic Schemas for Requests & Responses
# ============================================================================


class OcrScanJsonRequest(BaseModel):
    """JSON payload alternative for OCR scanning."""

    model_config = ConfigDict(extra="ignore")

    image_base64: str | None = Field(default=None, description="Base64 encoded nameplate image.")
    raw_text: str | None = Field(
        default=None, description="Direct text input to parse against NAWI regex patterns."
    )
    filename: str = Field(default="nameplate.jpg", description="Original image filename.")


class ValidateSpecsRequest(BaseModel):
    """Real-time validation request for instrument metrological specifications."""

    model_config = ConfigDict(extra="ignore")

    accuracy_class: AccuracyClass
    max_capacity: Decimal = Field(..., gt=Decimal("0"))
    min_capacity: Decimal = Field(..., gt=Decimal("0"))
    e: Decimal = Field(..., gt=Decimal("0"))
    d: Decimal | None = None
    unit: UnitOfMeasure = UnitOfMeasure.KILOGRAM
    receptor_type: LoadReceptorType = LoadReceptorType.PLATFORM
    num_supports: int = Field(default=4, ge=1)
    mobility: InstrumentMobility = InstrumentMobility.FIXED
    has_tare_device: bool = True
    has_level_indicator: bool = True
    stage: VerificationStage = VerificationStage.INITIAL_TYPE_APPROVAL


class TestBatteryPreviewItem(BaseModel):
    """Compact summary of an applicable OIML R 76 test procedure."""

    test_type: str
    test_name: str
    statutory_clause: str
    is_applicable: bool
    target_loads_count: int
    acceptance_criteria: str
    sample_loads: list[str]


class ValidateSpecsResponse(BaseModel):
    """Result of real-time OIML Table 3 evaluation & TAM test plan preview."""

    is_valid: bool
    accuracy_class: AccuracyClass
    max_capacity: str
    min_capacity: str
    e: str
    d: str
    unit: str
    n: str
    n_min: str | None
    n_max: str | None
    ratio_e_d: str
    min_in_e: str
    matched_tier: str
    violations: list[str]
    warnings: list[str]
    applicable_tests_count: int
    test_suite_preview: list[TestBatteryPreviewItem]


class RegisterInstrumentRequest(BaseModel):
    """Complete instrument registration payload with WELMEC 7.2 software markings."""

    model_config = ConfigDict(extra="ignore", protected_namespaces=())

    # Hardware & Manufacturer
    manufacturer: str = Field(..., min_length=2, max_length=255)
    model_name: str = Field(..., min_length=2, max_length=150)
    serial_number: str = Field(..., min_length=2, max_length=100)
    approval_number: str | None = Field(default=None, max_length=100)

    # Metrological Parameters
    accuracy_class: AccuracyClass
    max_capacity: Decimal = Field(..., gt=Decimal("0"))
    min_capacity: Decimal = Field(..., gt=Decimal("0"))
    e: Decimal = Field(..., gt=Decimal("0"))
    d: Decimal | None = None
    unit: UnitOfMeasure = UnitOfMeasure.KILOGRAM
    receptor_type: LoadReceptorType = LoadReceptorType.PLATFORM
    num_supports: int = Field(default=4, ge=1)
    mobility: InstrumentMobility = InstrumentMobility.FIXED
    has_tare_device: bool = True
    has_level_indicator: bool = True

    # WELMEC 7.2 Software Examination
    firmware_version: str | None = Field(default=None, max_length=50)
    sha256_checksum: str | None = Field(default=None, max_length=64)
    calibration_event_counter: int | None = Field(default=None, ge=0)
    software_separation: str = Field(default="TYPE_P")

    # Session & Laboratory Context
    laboratory_id: str | None = None
    operator_id: str = Field(default="usr-metrologist-001")
    verification_stage: VerificationStage = VerificationStage.INITIAL_TYPE_APPROVAL
    notes: str | None = None


class RegisterInstrumentResponse(BaseModel):
    """Confirmation payload returned on successful statutory registration."""

    instrument_id: str
    serial_number: str
    session_id: str
    session_number: str
    status: str
    compliance_status: str
    audit_event_id: str
    audit_hash: str
    message: str


# ============================================================================
# 2. Endpoints
# ============================================================================


@router.post(
    "/ocr-scan",
    response_model=NameplateExtractionResult,
    summary="Scan NAWI nameplate image or text with automated parameter extraction",
)
async def scan_nameplate(
    file: UploadFile | None = File(None),
    raw_text: str | None = Form(None),
    image_base64: str | None = Form(None),
) -> NameplateExtractionResult:
    """
    Accepts scale rating plate image (multipart/form-data) or base64/raw text,
    runs lightweight vision preprocessing, regex heuristic parsers, and extracts
    metrological parameters and WELMEC 7.2 software markings.
    """
    if file and file.filename:
        content = await file.read()
        return extract_nameplate_parameters(content, filename=file.filename)
    elif image_base64:
        return extract_nameplate_parameters(image_base64, filename="upload.jpg")
    elif raw_text:
        return extract_nameplate_parameters(raw_text)
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Must provide either an image file upload, image_base64 string, or raw_text.",
        )


@router.post(
    "/ocr-scan-json",
    response_model=NameplateExtractionResult,
    summary="JSON body alternative for OCR scanning",
)
async def scan_nameplate_json(payload: OcrScanJsonRequest) -> NameplateExtractionResult:
    """JSON endpoint for nameplate OCR scanning."""
    if payload.image_base64:
        return extract_nameplate_parameters(payload.image_base64, filename=payload.filename)
    elif payload.raw_text:
        return extract_nameplate_parameters(payload.raw_text, filename=payload.filename)
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payload must include either image_base64 or raw_text.",
        )


@router.post(
    "/validate-specs",
    response_model=ValidateSpecsResponse,
    summary="Live real-time OIML Table 3 validation & TAM test preview",
)
async def validate_specs(payload: ValidateSpecsRequest) -> ValidateSpecsResponse:
    """
    Evaluates scale parameters against OIML R 76-1:2006 Table 3 / Seventh Schedule Table 17.
    If mathematically and legally valid, dynamically compiles the Test Applicability Matrix.
    """
    d_val = payload.d if payload.d is not None else payload.e

    spec = InstrumentSpecification(
        accuracy_class=payload.accuracy_class,
        max_capacity=payload.max_capacity,
        min_capacity=payload.min_capacity,
        e=payload.e,
        d=d_val,
        unit=payload.unit,
        receptor_type=payload.receptor_type,
        num_supports=payload.num_supports,
        mobility=payload.mobility,
        has_tare_device=payload.has_tare_device,
        has_level_indicator=payload.has_level_indicator,
    )

    # Run Table 3 Validator
    val_res = validate_scale_intervals(spec)

    preview_items: list[TestBatteryPreviewItem] = []
    applicable_count = 0

    if val_res.is_valid:
        # Generate TAM matrix
        matrix = generate_test_applicability_matrix(spec, stage=payload.stage)
        applicable_count = matrix.total_applicable_tests

        for item in matrix.test_suite:
            if item.is_applicable:
                samples = [f"{pt.load_nominal} {payload.unit.value}" for pt in item.target_loads[:4]]
                preview_items.append(
                    TestBatteryPreviewItem(
                        test_type=item.test_type.value,
                        test_name=item.test_name,
                        statutory_clause=item.statutory_clause,
                        is_applicable=item.is_applicable,
                        target_loads_count=len(item.target_loads),
                        acceptance_criteria=item.acceptance_criteria,
                        sample_loads=samples,
                    )
                )

    ratio_ed = payload.e / d_val if d_val > 0 else Decimal("1")
    min_in_e = payload.min_capacity / payload.e if payload.e > 0 else Decimal("0")

    return ValidateSpecsResponse(
        is_valid=val_res.is_valid,
        accuracy_class=payload.accuracy_class,
        max_capacity=str(payload.max_capacity),
        min_capacity=str(payload.min_capacity),
        e=str(payload.e),
        d=str(d_val),
        unit=payload.unit.value,
        n=str(val_res.n),
        n_min=str(val_res.n_min_allowed) if val_res.n_min_allowed is not None else None,
        n_max=str(val_res.n_max_allowed) if val_res.n_max_allowed is not None else None,
        ratio_e_d=str(ratio_ed),
        min_in_e=str(min_in_e),
        matched_tier=val_res.matched_tier or "UNMATCHED",
        violations=val_res.violations,
        warnings=[],
        applicable_tests_count=applicable_count,
        test_suite_preview=preview_items,
    )


@router.post(
    "/register",
    response_model=RegisterInstrumentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register instrument & initiate statutory test session with WELMEC 7.2 software audit",
)
async def register_instrument(
    payload: RegisterInstrumentRequest,
    session: AsyncSession = Depends(get_db),
) -> RegisterInstrumentResponse:
    """
    Persists instrument technical profile into database, validates OIML Table 3 criteria,
    checks WELMEC SHA-256 hash formatting, creates initial test session, and logs
    cryptographic event to immutable audit trail.
    """
    d_val = payload.d if payload.d is not None else payload.e

    # 1. Validate Table 3 Conformity
    spec = InstrumentSpecification(
        accuracy_class=payload.accuracy_class,
        max_capacity=payload.max_capacity,
        min_capacity=payload.min_capacity,
        e=payload.e,
        d=d_val,
        unit=payload.unit,
        receptor_type=payload.receptor_type,
        num_supports=payload.num_supports,
        mobility=payload.mobility,
        has_tare_device=payload.has_tare_device,
        has_level_indicator=payload.has_level_indicator,
    )

    val_res = validate_scale_intervals(spec)
    if not val_res.is_valid:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "message": "Scale parameters violate OIML R 76-1 Table 3 statutory criteria.",
                "violations": val_res.violations,
            },
        )

    # 2. Validate WELMEC 7.2 SHA-256 Checksum if provided
    if payload.sha256_checksum:
        clean_hash = payload.sha256_checksum.strip().lower()
        if not re.match(r"^[0-9a-f]{64}$", clean_hash):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail={
                    "message": "Invalid WELMEC 7.2 software checksum. Must be exactly 64 hexadecimal characters (SHA-256).",
                    "provided_checksum": payload.sha256_checksum,
                },
            )

    inst_repo = InstrumentRepository(session)
    session_repo = TestSessionRepository(session)
    audit_logger = AuditLogger(session)

    # 3. Check for existing instrument with identical serial number
    clean_serial = payload.serial_number.strip()
    existing_inst = await inst_repo.get_by_serial(clean_serial)

    # Map unit
    unit_map = {
        UnitOfMeasure.KILOGRAM: UnitOfMeasurement.KILOGRAM,
        UnitOfMeasure.GRAM: UnitOfMeasurement.GRAM,
        UnitOfMeasure.MILLIGRAM: UnitOfMeasurement.MILLIGRAM,
        UnitOfMeasure.TONNE: UnitOfMeasurement.TONNE,
    }
    db_unit = unit_map.get(payload.unit, UnitOfMeasurement.KILOGRAM)

    db_receptor = payload.receptor_type

    if existing_inst:
        instrument_id = existing_inst.id
    else:
        # Create new instrument entity
        instrument_id = str(uuid.uuid4())
        new_inst = Instrument(
            id=instrument_id,
            serial_number=clean_serial,
            model_name=payload.model_name.strip(),
            manufacturer=payload.manufacturer.strip(),
            accuracy_class=payload.accuracy_class,
            verification_stage=payload.verification_stage,
            unit=db_unit,
            max_capacity=payload.max_capacity,
            min_capacity=payload.min_capacity,
            verification_scale_interval=payload.e,
            actual_scale_interval=d_val,
            receptor_type=db_receptor,
            mobility=payload.mobility,
            has_level_indicator=payload.has_level_indicator,
            has_tare_device=payload.has_tare_device,
            num_supports=payload.num_supports,
            is_multi_interval=False,
            rulepack_id="OIML_R76_2006",
            description=(
                f"TAC: {payload.approval_number or 'N/A'} | "
                f"FW: {payload.firmware_version or 'N/A'} | "
                f"C-Param: {payload.calibration_event_counter or 0}"
            ),
        )
        await inst_repo.create(new_inst)

    # 4. Resolve valid laboratory_id and operator_id (resilient to mock/empty IDs)
    lab_id = payload.laboratory_id
    if lab_id:
        lab_stmt = select(Laboratory).where(
            (Laboratory.id == lab_id) | (Laboratory.code == lab_id)
        ).limit(1)
        matched_lab = (await session.execute(lab_stmt)).scalar_one_or_none()
        lab_id = matched_lab.id if matched_lab else None

    if not lab_id:
        fallback_lab = (await session.execute(select(Laboratory).limit(1))).scalar_one_or_none()
        if fallback_lab:
            lab_id = fallback_lab.id
        else:
            fallback_lab = Laboratory(
                id=str(uuid.uuid4()),
                code="RRSL-BLR",
                name="Regional Reference Standard Laboratory, Bengaluru",
                lab_type=LaboratoryType.RRSL,
                nabl_accreditation_number="CC-2810-NABL-BLR",
                address="Peenya Industrial Area",
                city="Bengaluru",
                state="Karnataka",
                pincode="560058",
                contact_email="rrsl.blr@nic.in",
                contact_phone="+91-80-28394567",
                is_active=True,
            )
            session.add(fallback_lab)
            await session.flush()
            lab_id = fallback_lab.id

    op_id = payload.operator_id
    if op_id:
        op_stmt = select(User).where(
            (User.id == op_id) | (User.username == op_id) | (User.email == op_id)
        ).limit(1)
        matched_op = (await session.execute(op_stmt)).scalar_one_or_none()
        op_id = matched_op.id if matched_op else None

    if not op_id:
        fallback_op = (
            await session.execute(select(User).where(User.role == UserRole.METROLOGIST).limit(1))
        ).scalar_one_or_none()
        if not fallback_op:
            fallback_op = (await session.execute(select(User).limit(1))).scalar_one_or_none()
        if fallback_op:
            op_id = fallback_op.id
        else:
            fallback_op = User(
                id=str(uuid.uuid4()),
                email="testing.officer@rrsl.gov.in",
                username="sk_ramanathan",
                hashed_password="$argon2id$v=19$m=65536,t=3,p=4$SOtC/3G6VsfruVUzOhJglw$dUXCd2+qcSmIiXukEZk3isMlYc0mMqW38k4YYk4veTg",
                full_name="Dr. S. K. Ramanathan",
                designation="Senior Metrological Officer",
                role=UserRole.METROLOGIST,
                laboratory_id=lab_id,
                is_active=True,
            )
            session.add(fallback_op)
            await session.flush()
            op_id = fallback_op.id

    session_id = str(uuid.uuid4())
    session_num = f"RRSL-INTAKE-{uuid.uuid4().hex[:8].upper()}"

    new_session = TestSession(
        id=session_id,
        session_number=session_num,
        instrument_id=instrument_id,
        laboratory_id=lab_id,
        operator_id=op_id,
        status=TestSessionStatus.DRAFT,
        verification_stage=payload.verification_stage,
        overall_compliance=ComplianceStatus.PENDING,
        notes=payload.notes,
    )
    await session_repo.create(new_session)

    # 5. Log Cryptographic Audit Trail Event
    audit_data = {
        "manufacturer": payload.manufacturer,
        "model_name": payload.model_name,
        "serial_number": clean_serial,
        "accuracy_class": payload.accuracy_class.value,
        "max_capacity": str(payload.max_capacity),
        "e": str(payload.e),
        "n": str(val_res.n),
        "firmware_version": payload.firmware_version,
        "sha256_checksum": payload.sha256_checksum,
        "calibration_event_counter": payload.calibration_event_counter,
        "software_separation": payload.software_separation,
    }

    audit_event = await audit_logger.log_event(
        session_id=session_id,
        operator_id=op_id,
        event_type=EVENT_SESSION_CREATED,
        justification_reason=(
            "Statutory NAWI intake registration and WELMEC 7.2 software verification."
        ),
        extra_data=audit_data,
    )

    await session.commit()

    return RegisterInstrumentResponse(
        instrument_id=instrument_id,
        serial_number=clean_serial,
        session_id=session_id,
        session_number=session_num,
        status=TestSessionStatus.DRAFT.value,
        compliance_status=ComplianceStatus.PENDING.value,
        audit_event_id=audit_event.id,
        audit_hash=audit_event.sha256_hash,
        message="Instrument registered successfully. OIML Table 3 criteria satisfied.",
    )
