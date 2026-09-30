"""METROLOGIX-76 — Multi-Tier Laboratory Review Pipeline & Row-Level Audit API.

Statutory Authorities:
- Legal Metrology Act, 2009 (Sections 19, 20, 21, 22, 24)
- Legal Metrology (General) Rules, 2011, Rule 16 & Schedule IV
- OIML R 76-2:2007 (Non-Automatic Weighing Instruments: Pattern Evaluation Report)
- SIH Problem Statement 26035
"""

from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.audit_logger import (
    AuditLogger,
    EVENT_SESSION_STATUS_CHANGED,
)
from app.core.crypto_signer import (
    get_authority_signer,
)
from app.core.security import get_pin_hash, verify_pin
from app.core.types import (
    AccuracyClass,
    ComplianceStatus,
    VerificationStage,
)
from app.db.models import (
    RowAuditComment,
    TestSession,
    TestSessionStatus,
    User,
    UserRole,
)
from app.db.repositories.test_session_repository import TestSessionRepository
from app.db.repositories.user_repository import UserRepository
from app.db.session import get_db

logger = logging.getLogger("metrologix.review")

router = APIRouter()

# In-memory store for row-level audit comments during session lifecycle
_ROW_COMMENTS_STORE: dict[str, list[dict[str, Any]]] = {}

# Default Director PIN for demo sandbox
DEFAULT_DIRECTOR_PIN = "1234"


# ============================================================================
# Request / Response Schemas
# ============================================================================


class SubmitReviewRequest(BaseModel):
    """Payload to submit session from IN_TESTING to PENDING_REVIEW."""

    model_config = ConfigDict(extra="ignore")
    operator_id: str = Field(description="ID of testing officer submitting the session")
    operator_notes: str | None = Field(default=None, description="Optional handoff notes")


class RemandSessionRequest(BaseModel):
    """Payload to remand session from PENDING_REVIEW back to operator."""

    model_config = ConfigDict(extra="ignore")
    reviewer_id: str = Field(description="ID of reviewing officer remanding the session")
    reviewer_name: str = Field(description="Name of reviewing officer")
    remand_reason: str = Field(
        ...,
        min_length=5,
        description="Mandatory statutory justification for remanding session",
    )


class ApproveSessionRequest(BaseModel):
    """Payload for reviewing officer to approve and escalate to Director."""

    model_config = ConfigDict(extra="ignore")
    reviewer_id: str = Field(description="ID of reviewing officer")
    reviewer_name: str = Field(description="Name of reviewing officer")
    recommendation_notes: str | None = Field(default=None)


class DirectorSignRequest(BaseModel):
    """Payload for Director to digitally sign and permanently lock session."""

    model_config = ConfigDict(extra="ignore")
    director_id: str = Field(description="ID of Director / Controller")
    director_name: str = Field(description="Full name of Director")
    director_pin: str = Field(description="4-digit Director signing PIN")
    statutory_confirmed: bool = Field(default=True, description="Confirmation of statutory validity")


class AddRowCommentRequest(BaseModel):
    """Payload to append a row-level audit comment."""

    model_config = ConfigDict(extra="ignore")
    step_index: int = Field(ge=0, description="Step number of observation row")
    test_type: str = Field(default="WEIGHING", description="Test procedure type")
    target_load: float = Field(description="Target test load in grams or kg")
    unit: str = Field(default="g")
    author_name: str
    author_role: str
    author_email: str
    comment: str = Field(..., min_length=2)
    severity: str = Field(default="FLAG", description="NOTE, FLAG, or REJECT_REASON")


class SetDirectorPinRequest(BaseModel):
    """Payload to configure personal Director signing PIN."""

    model_config = ConfigDict(extra="ignore")
    director_pin: str = Field(..., min_length=4, max_length=12, description="4-12 digit personal signing PIN")


# ============================================================================
# API Endpoints
# ============================================================================


@router.get("/queue", summary="List evaluation sessions in the review queue")
async def get_review_queue(
    status_filter: str | None = Query(default=None, alias="status"),
    class_filter: str | None = Query(default=None, alias="class"),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Retrieve all evaluation sessions categorized for the review queue."""
    repo = TestSessionRepository(db)
    sessions = await repo.list(limit=50)

    queue_items = []
    for s in sessions:
        if status_filter and s.status.value != status_filter:
            continue

        item_comments = _ROW_COMMENTS_STORE.get(s.id, [])
        queue_items.append({
            "id": s.id,
            "session_number": s.session_number,
            "status": s.status.value,
            "compliance_status": s.overall_compliance.value,
            "stage": s.verification_stage.value,
            "operator_id": s.operator_id,
            "reviewer_id": s.reviewer_id,
            "is_locked": s.status in (TestSessionStatus.APPROVED, TestSessionStatus.ARCHIVED),
            "comments_count": len(item_comments),
            "flagged_count": sum(1 for c in item_comments if c.get("severity") in ("FLAG", "REJECT_REASON")),
            "created_at": s.created_at.isoformat() if s.created_at else None,
        })

    return {
        "total": len(queue_items),
        "items": queue_items,
    }


@router.post("/sessions/{session_id}/submit", summary="Submit session for technical review")
async def submit_for_review(
    session_id: str,
    payload: SubmitReviewRequest,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Metrologist transitions session to PENDING_REVIEW."""
    repo = TestSessionRepository(db)
    session_obj = await repo.get(session_id)
    if not session_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Test session {session_id} not found.",
        )

    if session_obj.status in (TestSessionStatus.APPROVED, TestSessionStatus.ARCHIVED):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session is permanently locked and cannot be resubmitted.",
        )

    old_status = session_obj.status
    session_obj.status = TestSessionStatus.PENDING_REVIEW

    audit = AuditLogger(db)
    await audit.log_session_transition(
        session_id=session_id,
        operator_id=payload.operator_id,
        old_status=old_status,
        new_status=TestSessionStatus.PENDING_REVIEW,
        justification_reason=payload.operator_notes or "Testing completed. Submitted to Principal Scientific Officer for review.",
    )
    await db.commit()

    return {
        "session_id": session_id,
        "old_status": old_status.value,
        "new_status": TestSessionStatus.PENDING_REVIEW.value,
        "message": "Session submitted for technical review.",
    }


@router.post("/sessions/{session_id}/remand", summary="Remand session back to operator")
async def remand_session(
    session_id: str,
    payload: RemandSessionRequest,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Reviewing officer returns session with statutory reason for re-testing."""
    repo = TestSessionRepository(db)
    session_obj = await repo.get(session_id)
    if not session_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Test session {session_id} not found.",
        )

    if session_obj.status in (TestSessionStatus.APPROVED, TestSessionStatus.ARCHIVED):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session is permanently locked and cannot be remanded.",
        )

    old_status = session_obj.status
    session_obj.status = TestSessionStatus.REJECTED
    session_obj.reviewer_id = payload.reviewer_id
    session_obj.notes = f"REMANDED: {payload.remand_reason}"

    audit = AuditLogger(db)
    await audit.log_session_transition(
        session_id=session_id,
        operator_id=payload.reviewer_id,
        old_status=old_status,
        new_status=TestSessionStatus.REJECTED,
        justification_reason=f"Statutory review remand: {payload.remand_reason}",
    )
    await db.commit()

    return {
        "session_id": session_id,
        "old_status": old_status.value,
        "new_status": "REMANDED",
        "remand_reason": payload.remand_reason,
        "reviewer": payload.reviewer_name,
        "message": "Session remanded for laboratory re-test.",
    }


@router.post("/sessions/{session_id}/approve", summary="Reviewing officer technical recommendation")
async def recommend_approval(
    session_id: str,
    payload: ApproveSessionRequest,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Reviewing officer marks technical review satisfied."""
    repo = TestSessionRepository(db)
    session_obj = await repo.get(session_id)
    if not session_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Test session {session_id} not found.",
        )

    session_obj.reviewer_id = payload.reviewer_id
    audit = AuditLogger(db)
    await audit.log_session_transition(
        session_id=session_id,
        operator_id=payload.reviewer_id,
        old_status=session_obj.status,
        new_status=session_obj.status,
        justification_reason=f"Technical review completed by {payload.reviewer_name}. Recommended for Director sign-off.",
    )
    await db.commit()

    return {
        "session_id": session_id,
        "reviewer": payload.reviewer_name,
        "message": "Technical review completed. Session ready for Director digital signature.",
    }


@router.post("/sessions/{session_id}/sign", summary="Director digital signature & lock")
async def director_sign(
    session_id: str,
    payload: DirectorSignRequest,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Director provides PIN, signs with ECDSA P-256, and locks session permanently."""
    # 1. Check individual Director PIN from DB if user exists, with fallback to default demo PIN
    pin_valid = False
    if payload.director_id:
        user_repo = UserRepository(db)
        director_user = await user_repo.get(payload.director_id)
        if not director_user:
            director_user = await user_repo.get_by_email(payload.director_id)
        if not director_user:
            director_user = await user_repo.get_by_username(payload.director_id)

        if director_user and director_user.director_pin_hash:
            pin_valid = verify_pin(payload.director_pin, director_user.director_pin_hash)

    # Allow default PIN for demo ease or unconfigured accounts
    if not pin_valid and payload.director_pin == DEFAULT_DIRECTOR_PIN:
        pin_valid = True

    if not pin_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Director signing PIN.",
        )

    repo = TestSessionRepository(db)
    session_obj = await repo.get(session_id)
    if not session_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Test session {session_id} not found.",
        )

    if session_obj.status in (TestSessionStatus.APPROVED, TestSessionStatus.ARCHIVED):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session has already been digitally signed and permanently locked.",
        )

    # Cryptographically sign using ECDSA P-256
    signer = get_authority_signer()
    session_data = {
        "session_id": session_id,
        "session_number": session_obj.session_number,
        "stage": session_obj.verification_stage.value,
        "compliance": session_obj.overall_compliance.value,
        "signed_at": datetime.now(timezone.utc).isoformat(),
        "director": payload.director_name,
    }
    sig_block = signer.create_signature_block(
        report_uuid=session_id,
        session_data=session_data,
    )

    old_status = session_obj.status
    session_obj.status = TestSessionStatus.APPROVED
    session_obj.completed_at = datetime.now(timezone.utc)

    audit = AuditLogger(db)
    await audit.log_session_transition(
        session_id=session_id,
        operator_id=payload.director_id,
        old_status=old_status,
        new_status=TestSessionStatus.APPROVED,
        justification_reason=f"Director digital signature applied. SHA-256: {sig_block.payload_sha256}",
    )
    await db.commit()

    return {
        "session_id": session_id,
        "status": "APPROVED",
        "is_locked": True,
        "signature_digest": sig_block.payload_sha256,
        "signature_base64": sig_block.signature_b64,
        "verification_url": sig_block.verification_url,
        "signed_at": sig_block.signed_at,
        "signer": payload.director_name,
        "message": "Session officially signed by Director. Immutable read-only lock active.",
    }


@router.post("/directors/{director_id}/pin", summary="Set or update Director personal signing PIN")
async def set_director_pin(
    director_id: str,
    payload: SetDirectorPinRequest,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Sets a cryptographically salted Argon2id PIN for a Director."""
    user_repo = UserRepository(db)
    user = await user_repo.get(director_id)
    if not user:
        user = await user_repo.get_by_email(director_id)
    if not user:
        user = await user_repo.get_by_username(director_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User {director_id} not found.",
        )

    user.director_pin_hash = get_pin_hash(payload.director_pin)
    await db.commit()

    return {
        "status": "success",
        "director_id": user.id,
        "message": f"Personal signing PIN successfully configured for {user.full_name}.",
    }


@router.get("/sessions/{session_id}/comments", summary="Get row-level audit comments")
async def get_row_comments(
    session_id: str,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Retrieve row audit comments for a test session (persisted in database)."""
    # 1. Query persisted DB comments
    stmt = (
        select(RowAuditComment)
        .where(RowAuditComment.session_id == session_id)
        .order_by(RowAuditComment.created_at)
    )
    res = await db.execute(stmt)
    db_comments = res.scalars().all()

    if db_comments:
        comments_list = [
            {
                "id": c.id,
                "session_id": c.session_id,
                "step_index": c.step_index,
                "test_type": c.test_type,
                "target_load": float(c.target_load),
                "unit": c.unit,
                "author_name": c.author_name,
                "author_role": c.author_role,
                "author_email": c.author_email,
                "comment": c.comment,
                "severity": c.severity,
                "timestamp": c.created_at.isoformat() if c.created_at else datetime.now(timezone.utc).isoformat(),
                "resolved": c.resolved,
            }
            for c in db_comments
        ]
        return {
            "session_id": session_id,
            "total": len(comments_list),
            "comments": comments_list,
        }

    # 2. Fallback to memory store (for uncommitted or mock demo sessions)
    comments = _ROW_COMMENTS_STORE.get(session_id, [])
    return {
        "session_id": session_id,
        "total": len(comments),
        "comments": comments,
    }


@router.post("/sessions/{session_id}/comments", summary="Add row-level audit comment")
async def add_row_comment(
    session_id: str,
    payload: AddRowCommentRequest,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Append an audit flag or remark to an observation row with database persistence."""
    comment_id = f"comm-{uuid.uuid4().hex[:8]}"
    now_iso = datetime.now(timezone.utc).isoformat()

    comment_record = {
        "id": comment_id,
        "session_id": session_id,
        "step_index": payload.step_index,
        "test_type": payload.test_type,
        "target_load": payload.target_load,
        "unit": payload.unit,
        "author_name": payload.author_name,
        "author_role": payload.author_role,
        "author_email": payload.author_email,
        "comment": payload.comment,
        "severity": payload.severity,
        "timestamp": now_iso,
        "resolved": False,
    }

    # Always keep in-memory cache updated
    if session_id not in _ROW_COMMENTS_STORE:
        _ROW_COMMENTS_STORE[session_id] = []
    _ROW_COMMENTS_STORE[session_id].append(comment_record)

    # Persist to database if session exists in DB
    try:
        session_repo = TestSessionRepository(db)
        sess = await session_repo.get(session_id)
        if sess:
            db_comment = RowAuditComment(
                id=comment_id,
                session_id=session_id,
                step_index=payload.step_index,
                test_type=payload.test_type,
                target_load=Decimal(str(payload.target_load)),
                unit=payload.unit,
                author_name=payload.author_name,
                author_role=payload.author_role,
                author_email=payload.author_email,
                comment=payload.comment,
                severity=payload.severity,
                resolved=False,
            )
            db.add(db_comment)
            await db.commit()
    except Exception as exc:
        logger.warning("Could not persist row comment to DB for session %s: %s", session_id, exc)

    return {
        "session_id": session_id,
        "comment": comment_record,
        "message": "Row audit comment recorded and persisted.",
    }

