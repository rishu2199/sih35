"""Authentication and Statutory Role-Based Access Control (RBAC) API Endpoints.

Provides:
- POST /api/auth/login: JSON-based user login issuing JWT access token
- POST /api/auth/token: OAuth2-compliant form login for OpenAPI Swagger UI
- GET /api/auth/me: Current authenticated user profile with laboratory affiliation
- Statutory Separation of Duties Verification Endpoints:
  * POST /api/auth/observations/enter (Metrologist testing officer only)
  * POST /api/auth/sessions/review (Principal Scientific Officer / Reviewer only)
  * POST /api/auth/certificates/issue (Director / Issuing Authority only)
  * GET /api/auth/audit/inspect (Regulatory Auditor inspection)
"""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import (
    create_access_token,
    get_current_active_user,
    require_auditor,
    require_director,
    require_metrologist,
    require_reviewer,
    verify_password,
)
from app.db.models import User, UserRole
from app.db.repositories.user_repository import UserRepository
from app.db.session import get_db

router = APIRouter()


class LoginRequest(BaseModel):
    """JSON credentials payload for login."""

    model_config = ConfigDict(extra="forbid")

    username_or_email: str = Field(
        ...,
        description="Official email address or unique username of the officer",
        examples=["operator.blr@doca.gov.in"],
    )
    password: str = Field(
        ...,
        description="Plaintext password for authentication",
        examples=["ValidSecretPassword123!"],
    )


class UserProfileResponse(BaseModel):
    """Statutory user profile with laboratory accreditation details."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    username: str
    full_name: str
    designation: str
    role: UserRole
    laboratory_id: str | None = None
    laboratory_code: str | None = None
    laboratory_name: str | None = None
    is_active: bool


class TokenResponse(BaseModel):
    """OAuth2 Bearer token response with embedded user profile."""

    access_token: str
    token_type: str = "bearer"
    expires_in: int
    role: UserRole
    user: UserProfileResponse


class RBACActionResponse(BaseModel):
    """Audit attestation response for authorized statutory actions."""

    status: str = "authorized"
    action: str
    operator_username: str
    operator_role: UserRole
    statutory_citation: str


def _build_user_profile(user: User) -> UserProfileResponse:
    """Build UserProfileResponse including laboratory code and name if affiliated."""
    lab_code = user.laboratory.code if user.laboratory else None
    lab_name = user.laboratory.name if user.laboratory else None
    role_enum = user.role if isinstance(user.role, UserRole) else UserRole(str(user.role))
    return UserProfileResponse(
        id=user.id,
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        designation=user.designation,
        role=role_enum,
        laboratory_id=user.laboratory_id,
        laboratory_code=lab_code,
        laboratory_name=lab_name,
        is_active=user.is_active,
    )


async def _authenticate_user(
    username_or_email: str,
    password: str,
    db: AsyncSession,
) -> User:
    """Look up user by email or username and verify password."""
    user_repo = UserRepository(db)
    clean_identifier = username_or_email.strip()

    # Try lookup by email first, then username
    user = await user_repo.get_by_email(clean_identifier)
    if user is None:
        user = await user_repo.get_by_username(clean_identifier)

    if user is None or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated. Contact Legal Metrology administrator.",
        )

    return user


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="User Login (JSON)",
    description="Authenticate an officer and issue a stateless JWT access token.",
)
async def login_json(
    credentials: LoginRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> TokenResponse:
    """Authenticate via JSON payload and return JWT bearer token."""
    user = await _authenticate_user(credentials.username_or_email, credentials.password, db)
    role_val = user.role.value if isinstance(user.role, UserRole) else str(user.role)
    role_enum = UserRole(role_val)
    token = create_access_token(
        subject=user.id,
        claims={
            "email": user.email,
            "username": user.username,
            "role": role_val,
            "laboratory_id": user.laboratory_id,
        },
    )
    user_profile = _build_user_profile(user)
    return TokenResponse(
        access_token=token,
        token_type="bearer",  # noqa: S106
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        role=role_enum,
        user=user_profile,
    )


@router.post(
    "/token",
    response_model=TokenResponse,
    summary="OAuth2 Form Login (Swagger UI)",
    description="OAuth2 standard compliant form-encoded login endpoint.",
)
async def login_oauth2_form(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> TokenResponse:
    """Authenticate via form data (username=email/username, password=...) for Swagger UI."""
    user = await _authenticate_user(form_data.username, form_data.password, db)
    role_val = user.role.value if isinstance(user.role, UserRole) else str(user.role)
    role_enum = UserRole(role_val)
    token = create_access_token(
        subject=user.id,
        claims={
            "email": user.email,
            "username": user.username,
            "role": role_val,
            "laboratory_id": user.laboratory_id,
        },
    )
    user_profile = _build_user_profile(user)
    return TokenResponse(
        access_token=token,
        token_type="bearer",  # noqa: S106
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        role=role_enum,
        user=user_profile,
    )



@router.get(
    "/me",
    response_model=UserProfileResponse,
    summary="Get Current User Profile",
    description="Retrieve account details and laboratory affiliation for the officer.",
)
async def get_me(
    current_user: Annotated[User, Depends(get_current_active_user)],
) -> UserProfileResponse:
    """Return profile of the currently active authenticated user."""
    return _build_user_profile(current_user)


# ============================================================================
# Statutory Separation-of-Duties Endpoints (RBAC Verification)
# ============================================================================


@router.post(
    "/observations/enter",
    response_model=RBACActionResponse,
    summary="Enter Raw Observations (Metrologist)",
    description="Restricted to METROLOGIST testing officers. Enforces separation of duties.",
)
async def enter_observations_endpoint(
    current_user: Annotated[User, Depends(require_metrologist)],
) -> RBACActionResponse:
    """Verify that only Metrologist (Testing Officer) can enter raw observation data."""
    return RBACActionResponse(
        action="ENTER_RAW_OBSERVATIONS",
        operator_username=current_user.username,
        operator_role=current_user.role,
        statutory_citation="OIML R 76-1:2006 Clause A.4 / LM Rules 2011 Clause 26035",
    )


@router.post(
    "/sessions/review",
    response_model=RBACActionResponse,
    summary="Review Evaluation & Request Retest (Reviewer)",
    description="Restricted to Principal Scientific Officers (REVIEWER / DIRECTOR).",
)
async def review_session_endpoint(
    current_user: Annotated[User, Depends(require_reviewer)],
) -> RBACActionResponse:
    """Verify that only Reviewer/Director can perform review and request retests."""
    return RBACActionResponse(
        action="REVIEW_TEST_EVALUATION",
        operator_username=current_user.username,
        operator_role=current_user.role,
        statutory_citation="ISO/IEC 17025 Clause 7.7 / LM Act 2009 Section 24",
    )


@router.post(
    "/certificates/issue",
    response_model=RBACActionResponse,
    summary="Issue & Sign Calibration Certificate (Director)",
    description="Strictly restricted to Laboratory Directors / Controllers of Legal Metrology.",
)
async def issue_certificate_endpoint(
    current_user: Annotated[User, Depends(require_director)],
) -> RBACActionResponse:
    """Verify that only Laboratory Director can approve and digitally sign final certificate."""
    return RBACActionResponse(
        action="ISSUE_DIGITAL_CERTIFICATE",
        operator_username=current_user.username,
        operator_role=current_user.role,
        statutory_citation="Legal Metrology Act, 2009 Section 27 / Rule 24 Model Approval",
    )


@router.get(
    "/audit/inspect",
    response_model=RBACActionResponse,
    summary="Inspect Laboratory Audit Logs (Auditor)",
    description="Accessible by regulatory inspectors (AUDITOR) and supervisory staff.",
)
async def inspect_audit_endpoint(
    current_user: Annotated[User, Depends(require_auditor)],
) -> RBACActionResponse:
    """Verify that Auditors have read-only inspection access."""
    return RBACActionResponse(
        action="INSPECT_AUDIT_LOGS",
        operator_username=current_user.username,
        operator_role=current_user.role,
        statutory_citation="Legal Metrology Enforcement Rules / Central DoCA Inspection Mandate",
    )
