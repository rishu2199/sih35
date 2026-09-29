"""Test suite for METROLOGIX-76 Statutory Laboratory RBAC & JWT Authentication.

Verifies:
- Argon2id cryptographic password hashing and multi-scheme fallback verification
- Stateless JWT access token issuance, claims embedding, expiration, and validation
- JSON login (`/api/auth/login`) and OAuth2 form login (`/api/auth/token`)
- User profile retrieval with statutory laboratory affiliation (`/api/auth/me`)
- Statutory Separation of Duties (OIML R 76-1 / ISO/IEC 17025 / Legal Metrology Act, 2009):
  * Metrologists can enter raw observations, but can NEVER review sessions or issue
    certificates (403 Forbidden)
  * Reviewers (PSO) can review sessions and request re-tests, but cannot issue final
    certificates (403 Forbidden)
  * Directors can issue final calibration certificates and review evaluations (200 OK)
  * Auditors possess read-only inspection access and cannot modify test data (403 Forbidden)
  * Deactivated accounts are immediately blocked from authentication (403 Forbidden)
"""

from __future__ import annotations

from collections.abc import AsyncGenerator
from datetime import timedelta

import bcrypt
import pytest
from fastapi import HTTPException
from httpx import ASGITransport, AsyncClient
from sqlalchemy import event
from sqlalchemy.engine import Engine
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.security import (
    create_access_token,
    decode_access_token,
    get_password_hash,
    verify_password,
)
from app.db.base import Base
from app.db.models import Laboratory, LaboratoryType, User, UserRole
from app.db.session import _set_sqlite_pragma, get_db
from app.main import app

# ============================================================================
# Test Database Engine & Fixtures
# ============================================================================


@pytest.fixture
async def auth_db_engine() -> AsyncGenerator[AsyncEngine, None]:
    """Create isolated SQLite in-memory engine with PRAGMA foreign keys enabled."""
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    event.listen(Engine, "connect", _set_sqlite_pragma)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield engine

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest.fixture
async def auth_db_session(
    auth_db_engine: AsyncEngine,
) -> AsyncGenerator[AsyncSession, None]:
    """Yield isolated active AsyncSession."""
    session_factory = async_sessionmaker(
        bind=auth_db_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )
    async with session_factory() as session:
        yield session


@pytest.fixture
async def seeded_rbac_users(
    auth_db_session: AsyncSession,
) -> dict[str, User]:
    """Seed statutory laboratory and officers spanning all RBAC roles."""
    lab = Laboratory(
        code="RRSL-BLR-01",
        name="Regional Reference Standard Laboratory, Bengaluru",
        lab_type=LaboratoryType.RRSL,
        address="Central Metrology Complex, Peenya",
        city="Bengaluru",
        state="Karnataka",
        pincode="560058",
        contact_email="director.blr@doca.gov.in",
        contact_phone="+91-80-28394000",
    )
    auth_db_session.add(lab)
    await auth_db_session.flush()

    common_password = "StatutorySecurePass2026!"  # noqa: S105
    hashed_pwd = get_password_hash(common_password)

    users = {
        "metrologist": User(
            email="metrologist@rrsl.gov.in",
            username="officer.metrologist",
            hashed_password=hashed_pwd,
            full_name="Dr. Anil Kumar",
            role=UserRole.METROLOGIST,
            designation="Testing Officer / Metrologist Grade II",
            laboratory_id=lab.id,
            is_active=True,
        ),
        "reviewer": User(
            email="reviewer@rrsl.gov.in",
            username="officer.reviewer",
            hashed_password=hashed_pwd,
            full_name="Dr. Sunita Sharma",
            role=UserRole.REVIEWER,
            designation="Principal Scientific Officer (PSO)",
            laboratory_id=lab.id,
            is_active=True,
        ),
        "director": User(
            email="director@rrsl.gov.in",
            username="officer.director",
            hashed_password=hashed_pwd,
            full_name="Dr. Rajeshwar Rao",
            role=UserRole.DIRECTOR,
            designation="Director & Controller of Legal Metrology",
            laboratory_id=lab.id,
            is_active=True,
        ),
        "auditor": User(
            email="auditor@doca.gov.in",
            username="officer.auditor",
            hashed_password=hashed_pwd,
            full_name="Shri Manoj Verma",
            role=UserRole.AUDITOR,
            designation="Chief Regulatory Metrology Inspector",
            laboratory_id=None,
            is_active=True,
        ),
        "admin": User(
            email="admin@metrologix.internal",
            username="admin.it",
            hashed_password=hashed_pwd,
            full_name="System IT Administrator",
            role=UserRole.ADMIN,
            designation="Chief Information Officer",
            laboratory_id=None,
            is_active=True,
        ),
        "inactive": User(
            email="inactive@rrsl.gov.in",
            username="officer.inactive",
            hashed_password=hashed_pwd,
            full_name="Former Officer",
            role=UserRole.METROLOGIST,
            designation="Suspended Metrologist",
            laboratory_id=lab.id,
            is_active=False,
        ),
    }

    for user in users.values():
        auth_db_session.add(user)

    await auth_db_session.commit()
    for user in users.values():
        await auth_db_session.refresh(user)

    return users


@pytest.fixture
async def api_client(
    auth_db_session: AsyncSession,
) -> AsyncGenerator[AsyncClient, None]:
    """Create async test client with dependency override for get_db."""
    async def _override_get_db() -> AsyncGenerator[AsyncSession, None]:
        yield auth_db_session

    app.dependency_overrides[get_db] = _override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        yield client
    app.dependency_overrides.clear()


# ============================================================================
# Unit Tests: Password Hashing & Verification (Argon2id)
# ============================================================================


class TestPasswordSecurity:
    """Verify cryptographic strength and multi-scheme password handling."""

    def test_hash_password_produces_argon2(self) -> None:
        raw_password = "SampleLegalMetrologyPassword123!"  # noqa: S105
        hashed = get_password_hash(raw_password)
        assert hashed.startswith("$argon2id$")
        assert len(hashed) > 60

    def test_hash_password_empty_raises_value_error(self) -> None:
        with pytest.raises(ValueError, match="Password cannot be empty"):
            get_password_hash("")

    def test_verify_password_argon2_success(self) -> None:
        raw = "ValidPassword2026!"
        hashed = get_password_hash(raw)
        assert verify_password(raw, hashed) is True

    def test_verify_password_argon2_mismatch(self) -> None:
        raw = "ValidPassword2026!"
        hashed = get_password_hash(raw)
        assert verify_password("WrongPassword123!", hashed) is False

    def test_verify_password_empty_inputs(self) -> None:
        assert verify_password("", "$argon2id$fake") is False
        assert verify_password("Password", "") is False

    def test_verify_password_bcrypt_fallback(self) -> None:
        raw = "BcryptSecret123!"
        salt = bcrypt.gensalt()
        bcrypt_hash = bcrypt.hashpw(raw.encode("utf-8"), salt).decode("utf-8")
        assert verify_password(raw, bcrypt_hash) is True
        assert verify_password("WrongBcrypt!", bcrypt_hash) is False


    def test_verify_password_plain_fallback(self) -> None:
        raw = "PlainMockPasswordForTests"
        assert verify_password(raw, raw) is True
        assert verify_password("Mismatch", raw) is False


# ============================================================================
# Unit Tests: JWT Token Creation & Verification
# ============================================================================


class TestJWTSecurity:
    """Verify stateless JWT claims integrity, expiration, and tampering detection."""

    def test_create_and_decode_token_success(self) -> None:
        user_id = "test-user-uuid-1234"
        claims = {
            "email": "officer@doca.gov.in",
            "username": "doca.officer",
            "role": "REVIEWER",
            "laboratory_id": "lab-5678",
        }
        token = create_access_token(subject=user_id, claims=claims)
        assert isinstance(token, str)
        assert len(token) > 20

        payload = decode_access_token(token)
        assert payload["sub"] == user_id
        assert payload["email"] == "officer@doca.gov.in"
        assert payload["username"] == "doca.officer"
        assert payload["role"] == "REVIEWER"
        assert payload["laboratory_id"] == "lab-5678"
        assert "exp" in payload
        assert "iat" in payload

    def test_token_expiration(self) -> None:
        user_id = "expired-user-uuid"
        token = create_access_token(
            subject=user_id,
            expires_delta=timedelta(seconds=-10),
        )
        with pytest.raises(HTTPException) as exc_info:
            decode_access_token(token)
        assert exc_info.value.status_code == 401
        assert "invalid or expired" in exc_info.value.detail.lower()

    def test_token_tampered_signature(self) -> None:
        token = create_access_token(subject="valid-sub")
        parts = token.split(".")
        tampered_token = f"{parts[0]}.{parts[1]}.tampered_signature_payload"
        with pytest.raises(HTTPException) as exc_info:
            decode_access_token(tampered_token)
        assert exc_info.value.status_code == 401


# ============================================================================
# Integration Tests: Auth Endpoints (Login, Token, Profile)
# ============================================================================


class TestAuthEndpoints:
    """Verify JSON login, form login, and profile access endpoints."""

    @pytest.mark.asyncio
    async def test_login_json_with_email_success(
        self,
        api_client: AsyncClient,
        seeded_rbac_users: dict[str, User],
    ) -> None:
        response = await api_client.post(
            "/api/auth/login",
            json={
                "username_or_email": "metrologist@rrsl.gov.in",
                "password": "StatutorySecurePass2026!",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"  # noqa: S105
        assert data["role"] == "METROLOGIST"
        assert data["user"]["email"] == "metrologist@rrsl.gov.in"
        assert data["user"]["laboratory_code"] == "RRSL-BLR-01"

    @pytest.mark.asyncio
    async def test_login_json_with_username_success(
        self,
        api_client: AsyncClient,
        seeded_rbac_users: dict[str, User],
    ) -> None:
        response = await api_client.post(
            "/api/auth/login",
            json={
                "username_or_email": "officer.director",
                "password": "StatutorySecurePass2026!",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["role"] == "DIRECTOR"
        assert data["user"]["full_name"] == "Dr. Rajeshwar Rao"

    @pytest.mark.asyncio
    async def test_login_json_wrong_password(
        self,
        api_client: AsyncClient,
        seeded_rbac_users: dict[str, User],
    ) -> None:
        response = await api_client.post(
            "/api/auth/login",
            json={
                "username_or_email": "officer.director",
                "password": "IncorrectPassword123!",
            },
        )
        assert response.status_code == 401
        assert "Incorrect username or password" in response.json()["detail"]
        assert response.headers.get("WWW-Authenticate") == "Bearer"

    @pytest.mark.asyncio
    async def test_login_json_nonexistent_user(
        self,
        api_client: AsyncClient,
        seeded_rbac_users: dict[str, User],
    ) -> None:
        response = await api_client.post(
            "/api/auth/login",
            json={
                "username_or_email": "unknown.officer@doca.gov.in",
                "password": "AnyPassword123!",
            },
        )
        assert response.status_code == 401
        assert "Incorrect username or password" in response.json()["detail"]

    @pytest.mark.asyncio
    async def test_login_json_inactive_user(
        self,
        api_client: AsyncClient,
        seeded_rbac_users: dict[str, User],
    ) -> None:
        response = await api_client.post(
            "/api/auth/login",
            json={
                "username_or_email": "inactive@rrsl.gov.in",
                "password": "StatutorySecurePass2026!",
            },
        )
        assert response.status_code == 403
        assert "deactivated" in response.json()["detail"].lower()

    @pytest.mark.asyncio
    async def test_oauth2_form_login_success(
        self,
        api_client: AsyncClient,
        seeded_rbac_users: dict[str, User],
    ) -> None:
        response = await api_client.post(
            "/api/auth/token",
            data={
                "username": "reviewer@rrsl.gov.in",
                "password": "StatutorySecurePass2026!",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["role"] == "REVIEWER"
        assert "access_token" in data

    @pytest.mark.asyncio
    async def test_get_me_authenticated(
        self,
        api_client: AsyncClient,
        seeded_rbac_users: dict[str, User],
    ) -> None:
        login_res = await api_client.post(
            "/api/auth/login",
            json={
                "username_or_email": "director@rrsl.gov.in",
                "password": "StatutorySecurePass2026!",
            },
        )
        token = login_res.json()["access_token"]

        response = await api_client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "director@rrsl.gov.in"
        assert data["role"] == "DIRECTOR"
        assert data["laboratory_code"] == "RRSL-BLR-01"

    @pytest.mark.asyncio
    async def test_get_me_unauthenticated(
        self,
        api_client: AsyncClient,
    ) -> None:
        response = await api_client.get("/api/auth/me")
        assert response.status_code == 401


# ============================================================================
# Verification Test Gate: Statutory RBAC & Separation of Duties
# ============================================================================


class TestStatutorySeparationOfDuties:
    """Verification Test Gate enforcing legal separation of laboratory duties.

    Statutory Invariants:
    1. Metrologists can only enter raw observations; trying to access review or certificate
       issuance endpoints returns 403 Forbidden.
    2. Reviewers can review sessions; trying to issue final certificates returns 403 Forbidden.
    3. Directors can review sessions and issue final calibration certificates.
    4. Auditors have read-only inspection access; entering observations or issuing
       certificates returns 403 Forbidden.
    """

    @pytest.mark.asyncio
    async def test_metrologist_can_enter_observations(
        self,
        api_client: AsyncClient,
        seeded_rbac_users: dict[str, User],
    ) -> None:
        token = create_access_token(
            subject=seeded_rbac_users["metrologist"].id,
            claims={"role": UserRole.METROLOGIST.value},
        )
        response = await api_client.post(
            "/api/auth/observations/enter",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["action"] == "ENTER_RAW_OBSERVATIONS"
        assert data["operator_role"] == "METROLOGIST"

    @pytest.mark.asyncio
    async def test_metrologist_cannot_review_sessions_forbidden_gate(
        self,
        api_client: AsyncClient,
        seeded_rbac_users: dict[str, User],
    ) -> None:
        """VERIFICATION TEST GATE:

        Pytest trying to access review endpoints with METROLOGIST token returns 403 Forbidden.
        """
        token = create_access_token(
            subject=seeded_rbac_users["metrologist"].id,
            claims={"role": UserRole.METROLOGIST.value},
        )
        response = await api_client.post(
            "/api/auth/sessions/review",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 403
        detail = response.json()["detail"]
        assert "Statutory Role Insufficient" in detail
        assert "METROLOGIST" in detail

    @pytest.mark.asyncio
    async def test_metrologist_cannot_issue_certificates_forbidden(
        self,
        api_client: AsyncClient,
        seeded_rbac_users: dict[str, User],
    ) -> None:
        """Metrologists can NEVER digitally sign certificates."""
        token = create_access_token(
            subject=seeded_rbac_users["metrologist"].id,
            claims={"role": UserRole.METROLOGIST.value},
        )
        response = await api_client.post(
            "/api/auth/certificates/issue",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 403
        detail = response.json()["detail"]
        assert "Statutory Role Insufficient" in detail

    @pytest.mark.asyncio
    async def test_reviewer_can_review_sessions(
        self,
        api_client: AsyncClient,
        seeded_rbac_users: dict[str, User],
    ) -> None:
        token = create_access_token(
            subject=seeded_rbac_users["reviewer"].id,
            claims={"role": UserRole.REVIEWER.value},
        )
        response = await api_client.post(
            "/api/auth/sessions/review",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["action"] == "REVIEW_TEST_EVALUATION"
        assert data["operator_role"] == "REVIEWER"

    @pytest.mark.asyncio
    async def test_reviewer_cannot_issue_certificates_forbidden(
        self,
        api_client: AsyncClient,
        seeded_rbac_users: dict[str, User],
    ) -> None:
        """Reviewers cannot digitally sign final certificate — strictly Director only."""
        token = create_access_token(
            subject=seeded_rbac_users["reviewer"].id,
            claims={"role": UserRole.REVIEWER.value},
        )
        response = await api_client.post(
            "/api/auth/certificates/issue",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 403
        detail = response.json()["detail"]
        assert "Statutory Role Insufficient" in detail

    @pytest.mark.asyncio
    async def test_reviewer_cannot_enter_raw_observations_forbidden(
        self,
        api_client: AsyncClient,
        seeded_rbac_users: dict[str, User],
    ) -> None:
        """Reviewers cannot enter raw observations directly (testing officer separation)."""
        token = create_access_token(
            subject=seeded_rbac_users["reviewer"].id,
            claims={"role": UserRole.REVIEWER.value},
        )
        response = await api_client.post(
            "/api/auth/observations/enter",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 403

    @pytest.mark.asyncio
    async def test_director_can_issue_certificates_and_review(
        self,
        api_client: AsyncClient,
        seeded_rbac_users: dict[str, User],
    ) -> None:
        token = create_access_token(
            subject=seeded_rbac_users["director"].id,
            claims={"role": UserRole.DIRECTOR.value},
        )
        cert_res = await api_client.post(
            "/api/auth/certificates/issue",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert cert_res.status_code == 200
        assert cert_res.json()["action"] == "ISSUE_DIGITAL_CERTIFICATE"

        rev_res = await api_client.post(
            "/api/auth/sessions/review",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert rev_res.status_code == 200
        assert rev_res.json()["action"] == "REVIEW_TEST_EVALUATION"

    @pytest.mark.asyncio
    async def test_auditor_can_inspect_audit_logs(
        self,
        api_client: AsyncClient,
        seeded_rbac_users: dict[str, User],
    ) -> None:
        token = create_access_token(
            subject=seeded_rbac_users["auditor"].id,
            claims={"role": UserRole.AUDITOR.value},
        )
        response = await api_client.get(
            "/api/auth/audit/inspect",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["action"] == "INSPECT_AUDIT_LOGS"
        assert data["operator_role"] == "AUDITOR"

    @pytest.mark.asyncio
    async def test_auditor_cannot_alter_observations_or_sign(
        self,
        api_client: AsyncClient,
        seeded_rbac_users: dict[str, User],
    ) -> None:
        token = create_access_token(
            subject=seeded_rbac_users["auditor"].id,
            claims={"role": UserRole.AUDITOR.value},
        )
        obs_res = await api_client.post(
            "/api/auth/observations/enter",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert obs_res.status_code == 403

        cert_res = await api_client.post(
            "/api/auth/certificates/issue",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert cert_res.status_code == 403

    @pytest.mark.asyncio
    async def test_admin_supervisory_access(
        self,
        api_client: AsyncClient,
        seeded_rbac_users: dict[str, User],
    ) -> None:
        token = create_access_token(
            subject=seeded_rbac_users["admin"].id,
            claims={"role": UserRole.ADMIN.value},
        )
        # Admin can access observation entry, review, and cert issuance
        obs_res = await api_client.post(
            "/api/auth/observations/enter",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert obs_res.status_code == 200

        rev_res = await api_client.post(
            "/api/auth/sessions/review",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert rev_res.status_code == 200

        cert_res = await api_client.post(
            "/api/auth/certificates/issue",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert cert_res.status_code == 200
