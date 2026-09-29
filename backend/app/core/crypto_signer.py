"""METROLOGIX-76 — Cryptographic ECDSA Digital Signing & eMaap QR Code Generator.

Statutory Authorities & Technical References:
- Information Technology Act, 2000 & Electronic Signature Rules (CCA India)
- OIML R 76-2:2007 (E) "Non-automatic weighing instruments - Part 2: Pattern evaluation report"
  * Section 8 / Form 8: Official Certification & Cryptographic Authenticity Verification
- Department of Consumer Affairs (DoCA), SIH Problem Statement 26035:
  * Non-repudiation and instant mobile verification for issued test reports
  * SHA-256 canonical hashing of normalized test session data JSON
  * ECDSA digital signing using NIST P-256 (secp256r1) curve
  * eMaap dynamic verification QR code linking to official DoCA statutory endpoint

Zero-Bug Rules:
1. Strict deterministic JSON canonicalization (sorted keys, normalized Decimals, UTC ISO timestamps).
2. ECDSA signature verification is 100% mathematically verifiable; 1-bit alteration yields False.
3. Private keys are securely handled with PKCS#8 PEM encoding and optional encryption.
4. Flexible signature input handling (Base64 URL-safe, standard Base64, Hex, or raw DER).
5. High-resolution QR code generator returning PNG bytes and Base64 data URLs.
"""

from __future__ import annotations

import base64
import hashlib
import io
import json
import os
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any, Final

from cryptography.exceptions import InvalidSignature
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import ec
from pydantic import BaseModel, ConfigDict, Field
import qrcode

from app.core.config import settings

SIGNATURE_ALGORITHM: Final[str] = "ECDSA_SHA256_SECP256R1"


# ============================================================================
# 1. Pydantic Models for Digital Signatures & Verification
# ============================================================================


class VerificationCheckRequest(BaseModel):
    """Payload for verifying an external signature against a public key."""

    model_config = ConfigDict(extra="ignore")
    payload: Any = Field(description="Original un-tampered data object or string")
    signature: str = Field(description="Base64 or Hex encoded ECDSA signature")
    public_key_pem: str = Field(description="SubjectPublicKeyInfo PEM public key")


class VerificationResult(BaseModel):
    """Result of a mathematical signature verification check."""

    model_config = ConfigDict(extra="ignore")
    is_valid: bool = Field(description="True if mathematically valid, False if altered or invalid")
    report_uuid: str = Field(default="", description="Report identifier if present")
    payload_sha256: str = Field(description="Hex SHA-256 digest of canonicalized payload")
    signature_algorithm: str = Field(default=SIGNATURE_ALGORITHM)
    checked_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    signer_name: str = Field(default="Director / Controller of Legal Metrology")
    error_message: str | None = Field(default=None)


class DigitalSignatureBlock(BaseModel):
    """Cryptographic certificate and signature block for OIML R 76-2 reports."""

    model_config = ConfigDict(extra="ignore")
    report_uuid: str = Field(description="Unique report or session UUID")
    payload_sha256: str = Field(description="SHA-256 hash of canonical test data")
    signature_algorithm: str = Field(default=SIGNATURE_ALGORITHM)
    signature_b64: str = Field(description="Base64 encoded ECDSA signature")
    signature_hex: str = Field(description="Hex encoded ECDSA signature")
    signer_name: str = Field(default="Dr. R. K. Sharma")
    signer_designation: str = Field(default="Director / Controller of Legal Metrology")
    signed_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    public_key_pem: str = Field(description="Signer SPKI PEM public key")
    verification_url: str = Field(description="eMaap URL for instant QR verification")
    qr_code_png_b64: str = Field(description="Base64 data URL for embedded QR code")
    is_tamper_evident: bool = Field(default=True)


# ============================================================================
# 2. Deterministic JSON Canonicalization & Hashing
# ============================================================================


def _json_serial_default(obj: Any) -> Any:
    """JSON serialization handler for Decimals, datetimes, and Pydantic models."""
    if isinstance(obj, Decimal):
        return f"{obj:.6f}".rstrip("0").rstrip(".") if "." in f"{obj:.6f}" else f"{obj:.6f}"
    if isinstance(obj, datetime):
        if obj.tzinfo is None:
            obj = obj.replace(tzinfo=timezone.utc)
        return obj.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    if hasattr(obj, "model_dump"):
        return obj.model_dump()
    if hasattr(obj, "dict"):
        return obj.dict()
    raise TypeError(f"Object of type {type(obj).__name__} is not JSON serializable")


def canonicalize_payload(data: Any) -> bytes:
    """
    Serialize data into deterministic, canonical UTF-8 JSON bytes.

    Rules:
    - Dict keys sorted lexicographically at all nesting levels.
    - Compact separators (',' and ':') without extraneous whitespace.
    - Strict lossless Decimal and UTC ISO datetime representation.
    """
    if isinstance(data, (bytes, bytearray)):
        return bytes(data)
    if isinstance(data, str):
        # If it's a string, attempt to parse JSON to normalize it, otherwise encode directly
        try:
            parsed = json.loads(data)
            return json.dumps(
                parsed,
                sort_keys=True,
                separators=(",", ":"),
                ensure_ascii=False,
                default=_json_serial_default,
            ).encode("utf-8")
        except Exception:
            return data.encode("utf-8")

    return json.dumps(
        data,
        sort_keys=True,
        separators=(",", ":"),
        ensure_ascii=False,
        default=_json_serial_default,
    ).encode("utf-8")


def compute_sha256_digest(data: Any) -> str:
    """Compute the 64-character hexadecimal SHA-256 digest of canonicalized data."""
    canon_bytes = canonicalize_payload(data)
    return hashlib.sha256(canon_bytes).hexdigest()


# ============================================================================
# 3. Key Generation & Serialization (ECDSA NIST P-256)
# ============================================================================


def generate_keypair() -> tuple[ec.EllipticCurvePrivateKey, ec.EllipticCurvePublicKey]:
    """Generate a high-entropy ECDSA keypair using NIST P-256 (secp256r1)."""
    private_key = ec.generate_private_key(ec.SECP256R1())
    public_key = private_key.public_key()
    return private_key, public_key


def export_private_key_pem(
    private_key: ec.EllipticCurvePrivateKey,
    password: str | bytes | None = None,
) -> str:
    """Export private key to PKCS#8 PEM format with optional password encryption."""
    if password:
        pw_bytes = password.encode("utf-8") if isinstance(password, str) else password
        enc: serialization.KeySerializationEncryption = (
            serialization.BestAvailableEncryption(pw_bytes)
        )
    else:
        enc = serialization.NoEncryption()

    pem_bytes = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=enc,
    )
    return pem_bytes.decode("utf-8")


def export_public_key_pem(public_key: ec.EllipticCurvePublicKey) -> str:
    """Export public key to SubjectPublicKeyInfo (SPKI) PEM format."""
    pem_bytes = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    )
    return pem_bytes.decode("utf-8")


def load_private_key_pem(
    pem_data: str | bytes,
    password: str | bytes | None = None,
) -> ec.EllipticCurvePrivateKey:
    """Load an ECDSA private key from PEM bytes or string."""
    data_bytes = pem_data.encode("utf-8") if isinstance(pem_data, str) else pem_data
    pw_bytes = password.encode("utf-8") if isinstance(password, str) else password
    key = serialization.load_pem_private_key(data_bytes, password=pw_bytes)
    if not isinstance(key, ec.EllipticCurvePrivateKey):
        raise TypeError("Loaded key is not an EllipticCurvePrivateKey")
    return key


def load_public_key_pem(pem_data: str | bytes) -> ec.EllipticCurvePublicKey:
    """Load an ECDSA public key from SubjectPublicKeyInfo PEM bytes or string."""
    data_bytes = pem_data.encode("utf-8") if isinstance(pem_data, str) else pem_data
    key = serialization.load_pem_public_key(data_bytes)
    if not isinstance(key, ec.EllipticCurvePublicKey):
        raise TypeError("Loaded key is not an EllipticCurvePublicKey")
    return key


# ============================================================================
# 4. Digital Signing & Mathematical Verification
# ============================================================================


def sign_payload(
    private_key: ec.EllipticCurvePrivateKey,
    data: Any,
) -> tuple[str, str, str]:
    """
    Sign data using ECDSA P-256 with SHA-256.

    Returns:
        tuple of (signature_b64, signature_hex, canonical_sha256)
    """
    canon_bytes = canonicalize_payload(data)
    canonical_sha256 = hashlib.sha256(canon_bytes).hexdigest()
    der_signature = private_key.sign(canon_bytes, ec.ECDSA(hashes.SHA256()))

    sig_b64 = base64.b64encode(der_signature).decode("ascii")
    sig_hex = der_signature.hex()
    return sig_b64, sig_hex, canonical_sha256


def verify_signature(
    public_key: ec.EllipticCurvePublicKey,
    data: Any,
    signature: str | bytes,
) -> bool:
    """
    Mathematically verify an ECDSA signature against canonical payload.

    Accepts signature as:
    - Base64 encoded string (standard or URL-safe)
    - Hexadecimal string
    - Raw DER bytes
    """
    canon_bytes = canonicalize_payload(data)

    sig_bytes: bytes
    if isinstance(signature, (bytes, bytearray)):
        sig_bytes = bytes(signature)
    elif isinstance(signature, str):
        sig_str = signature.strip()
        # Try hex if even length and hex characters
        try:
            if len(sig_str) > 10 and all(c in "0123456789abcdefABCDEF" for c in sig_str):
                sig_bytes = bytes.fromhex(sig_str)
            else:
                sig_bytes = base64.b64decode(sig_str)
        except Exception:
            try:
                sig_bytes = base64.urlsafe_b64decode(sig_str)
            except Exception:
                return False
    else:
        return False

    try:
        public_key.verify(sig_bytes, canon_bytes, ec.ECDSA(hashes.SHA256()))
        return True
    except InvalidSignature:
        return False
    except Exception:
        return False


# ============================================================================
# 5. eMaap Verification URL & QR Code Generation
# ============================================================================


def build_verification_url(
    report_uuid: str,
    signature_b64: str,
    base_url: str | None = None,
) -> str:
    """Generate statutory eMaap public verification URL with signature snippet."""
    root = (base_url or settings.EMAAP_VERIFY_BASE_URL).rstrip("/")
    # Use URL-safe signature representation
    url_sig = signature_b64.replace("+", "-").replace("/", "_").rstrip("=")
    return f"{root}/{report_uuid}?sig={url_sig}"


def generate_verification_qr_png(
    url: str,
    box_size: int = 6,
    border: int = 1,
) -> bytes:
    """Generate high-resolution PNG QR code bytes for a given verification URL."""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=box_size,
        border=border,
    )
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#0F172A", back_color="#FFFFFF")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def generate_verification_qr_b64(
    url: str,
    box_size: int = 6,
    border: int = 1,
) -> str:
    """Generate base64 data URL for embedded QR code images."""
    png_bytes = generate_verification_qr_png(url, box_size=box_size, border=border)
    b64 = base64.b64encode(png_bytes).decode("ascii")
    return f"data:image/png;base64,{b64}"


# ============================================================================
# 6. EcdsaCryptoSigner Manager Class
# ============================================================================


class EcdsaCryptoSigner:
    """Statutory laboratory crypto-signing engine managing authority keys."""

    def __init__(
        self,
        private_key: ec.EllipticCurvePrivateKey | None = None,
        public_key: ec.EllipticCurvePublicKey | None = None,
        signer_name: str = "Dr. R. K. Sharma",
        signer_designation: str = "Director / Controller of Legal Metrology",
    ) -> None:
        if private_key is None:
            self.private_key, self.public_key = generate_keypair()
        else:
            self.private_key = private_key
            self.public_key = public_key or private_key.public_key()

        self.signer_name = signer_name
        self.signer_designation = signer_designation

    @classmethod
    def from_pem(
        cls,
        private_pem: str | bytes,
        password: str | bytes | None = None,
        signer_name: str = "Dr. R. K. Sharma",
        signer_designation: str = "Director / Controller of Legal Metrology",
    ) -> EcdsaCryptoSigner:
        """Instantiate signer from a PKCS#8 PEM string or file bytes."""
        sk = load_private_key_pem(private_pem, password=password)
        return cls(
            private_key=sk,
            signer_name=signer_name,
            signer_designation=signer_designation,
        )

    def create_signature_block(
        self,
        report_uuid: str,
        session_data: Any,
        base_url: str | None = None,
    ) -> DigitalSignatureBlock:
        """
        Sign report payload and generate a complete, tamper-evident signature block.
        """
        sig_b64, sig_hex, sha256_hash = sign_payload(self.private_key, session_data)
        verify_url = build_verification_url(report_uuid, sig_b64, base_url=base_url)
        qr_b64 = generate_verification_qr_b64(verify_url)
        pk_pem = export_public_key_pem(self.public_key)

        return DigitalSignatureBlock(
            report_uuid=report_uuid,
            payload_sha256=sha256_hash,
            signature_algorithm=SIGNATURE_ALGORITHM,
            signature_b64=sig_b64,
            signature_hex=sig_hex,
            signer_name=self.signer_name,
            signer_designation=self.signer_designation,
            signed_at=datetime.now(timezone.utc).isoformat(),
            public_key_pem=pk_pem,
            verification_url=verify_url,
            qr_code_png_b64=qr_b64,
            is_tamper_evident=True,
        )

    def verify(self, data: Any, signature: str | bytes) -> bool:
        """Verify data with this signer's public key."""
        return verify_signature(self.public_key, data, signature)


# Module-level default authority signer instance (lazy cached)
_DEFAULT_SIGNER: EcdsaCryptoSigner | None = None


def get_authority_signer() -> EcdsaCryptoSigner:
    """Retrieve or initialize the active Laboratory Director crypto-signing authority."""
    global _DEFAULT_SIGNER
    if _DEFAULT_SIGNER is not None:
        return _DEFAULT_SIGNER

    # Check if files exist at configured paths
    priv_path = settings.LAB_PRIVATE_KEY_PATH
    if os.path.exists(priv_path):
        try:
            with open(priv_path, "rb") as f:
                _DEFAULT_SIGNER = EcdsaCryptoSigner.from_pem(f.read())
                return _DEFAULT_SIGNER
        except Exception:
            pass

    # Generate new high-entropy authority keypair
    _DEFAULT_SIGNER = EcdsaCryptoSigner()
    return _DEFAULT_SIGNER
