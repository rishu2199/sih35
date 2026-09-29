"""Tests for METROLOGIX-76 Cryptographic ECDSA Digital Signing & eMaap Verification."""

from __future__ import annotations

import base64
from decimal import Decimal

import pytest
from fastapi.testclient import TestClient

from app.core.crypto_signer import (
    SIGNATURE_ALGORITHM,
    DigitalSignatureBlock,
    EcdsaCryptoSigner,
    VerificationCheckRequest,
    build_verification_url,
    canonicalize_payload,
    compute_sha256_digest,
    export_private_key_pem,
    export_public_key_pem,
    generate_keypair,
    generate_verification_qr_b64,
    generate_verification_qr_png,
    get_authority_signer,
    load_private_key_pem,
    load_public_key_pem,
    sign_payload,
    verify_signature,
)
from app.main import app


@pytest.fixture()
def client() -> TestClient:
    """Return synchronous FastAPI test client."""
    return TestClient(app)


class TestKeyManagement:
    """Tests for ECDSA NIST P-256 key generation, export, and loading."""

    def test_generate_keypair(self) -> None:
        """Verify generation of valid ECDSA P-256 keypair."""
        sk, pk = generate_keypair()
        assert sk is not None
        assert pk is not None
        assert sk.curve.name == "secp256r1"

    def test_export_and_load_unencrypted_keys(self) -> None:
        """Verify unencrypted PKCS#8 and SPKI PEM export and reload roundtrip."""
        sk, pk = generate_keypair()
        sk_pem = export_private_key_pem(sk)
        pk_pem = export_public_key_pem(pk)

        assert "BEGIN PRIVATE KEY" in sk_pem
        assert "BEGIN PUBLIC KEY" in pk_pem

        loaded_sk = load_private_key_pem(sk_pem)
        loaded_pk = load_public_key_pem(pk_pem)

        # Signing with reloaded key verifies against reloaded public key
        sig_b64, _, _ = sign_payload(loaded_sk, "test data")
        assert verify_signature(loaded_pk, "test data", sig_b64) is True

    def test_export_and_load_encrypted_private_key(self) -> None:
        """Verify password-protected PKCS#8 private key encryption and decryption."""
        sk, pk = generate_keypair()
        password = "StatutorySecureLabPassword123!"
        sk_pem = export_private_key_pem(sk, password=password)

        assert "ENCRYPTED" in sk_pem or "BEGIN ENCRYPTED PRIVATE KEY" in sk_pem

        # Loading without password or wrong password raises error
        with pytest.raises(Exception):
            load_private_key_pem(sk_pem, password="WrongPassword")

        # Loading with correct password succeeds
        loaded_sk = load_private_key_pem(sk_pem, password=password)
        sig_b64, _, _ = sign_payload(loaded_sk, "authenticated test payload")
        assert verify_signature(pk, "authenticated test payload", sig_b64) is True


class TestCanonicalizationAndHashing:
    """Tests for deterministic JSON canonicalization and SHA-256 digests."""

    def test_dictionary_key_sorting(self) -> None:
        """Verify dictionary keys sort lexicographically regardless of input order."""
        data1 = {"z": 100, "a": "apple", "m": [3, 2, 1], "sub": {"b": True, "a": False}}
        data2 = {"a": "apple", "sub": {"a": False, "b": True}, "m": [3, 2, 1], "z": 100}

        canon1 = canonicalize_payload(data1)
        canon2 = canonicalize_payload(data2)

        assert canon1 == canon2
        assert compute_sha256_digest(data1) == compute_sha256_digest(data2)

    def test_decimal_lossless_handling(self) -> None:
        """Verify Decimals are serialized consistently without precision loss."""
        payload = {"load": Decimal("30.000000"), "error": Decimal("-0.002500")}
        canon = canonicalize_payload(payload)
        assert b"30" in canon
        assert b"-0.0025" in canon


class TestSigningAndVerificationGate:
    """Core mathematical verification test gate for tamper detection."""

    def test_sign_and_verify_success(self) -> None:
        """Verify valid digital signature evaluates to True."""
        sk, pk = generate_keypair()
        payload = {
            "report_uuid": "OIML-IND-2026-0042",
            "max_capacity": "30.000 kg",
            "accuracy_class": "CLASS_III",
            "verdict": "PASS",
        }

        sig_b64, sig_hex, sha = sign_payload(sk, payload)
        assert len(sig_b64) > 30
        assert len(sig_hex) > 60
        assert len(sha) == 64

        assert verify_signature(pk, payload, sig_b64) is True
        assert verify_signature(pk, payload, sig_hex) is True

    def test_tamper_detection_one_byte_payload_change(self) -> None:
        """Verification Gate: Altering 1 byte in payload MUST return False."""
        sk, pk = generate_keypair()
        original_payload = {
            "report_uuid": "OIML-IND-2026-0042",
            "max_capacity": "30.000 kg",
            "verdict": "PASS",
        }

        sig_b64, _, _ = sign_payload(sk, original_payload)
        assert verify_signature(pk, original_payload, sig_b64) is True

        # Tampered payload (changed 'PASS' to 'FAIL' or modified 1 digit)
        tampered_payload_1 = {
            "report_uuid": "OIML-IND-2026-0042",
            "max_capacity": "30.000 kg",
            "verdict": "FAIL",
        }
        tampered_payload_2 = {
            "report_uuid": "OIML-IND-2026-0042",
            "max_capacity": "30.001 kg",  # 1-digit change
            "verdict": "PASS",
        }

        assert verify_signature(pk, tampered_payload_1, sig_b64) is False
        assert verify_signature(pk, tampered_payload_2, sig_b64) is False

    def test_tamper_detection_signature_bit_flip(self) -> None:
        """Verification Gate: Corrupting 1 byte in signature MUST return False."""
        sk, pk = generate_keypair()
        payload = {"instrument_id": "SN-9912", "result": "APPROVED"}
        sig_b64, _, _ = sign_payload(sk, payload)

        # Corrupt one character in base64 string
        raw_sig = bytearray(base64.b64decode(sig_b64))
        raw_sig[5] ^= 0xFF  # Flip bits in byte 5
        corrupted_sig_b64 = base64.b64encode(raw_sig).decode("ascii")

        assert verify_signature(pk, payload, corrupted_sig_b64) is False

    def test_wrong_public_key_rejection(self) -> None:
        """Signature verified against a different public key MUST return False."""
        sk1, _ = generate_keypair()
        _, pk2 = generate_keypair()
        payload = {"data": "confidential statutory result"}

        sig_b64, _, _ = sign_payload(sk1, payload)
        assert verify_signature(pk2, payload, sig_b64) is False


class TestQrCodeAndVerificationUrl:
    """Tests for eMaap verification URL and QR code generation."""

    def test_build_verification_url(self) -> None:
        """Verify URL generation conforms to official eMaap specification."""
        url = build_verification_url("REPORT-2026-001", "MEUCIQDx123456==")
        assert url.startswith("https://emaap.doca.gov.in/verify/REPORT-2026-001?sig=")
        assert "MEUCIQDx123456" in url

    def test_generate_verification_qr_png(self) -> None:
        """Verify high-resolution QR code PNG output."""
        url = "https://emaap.doca.gov.in/verify/TEST-UUID"
        png_bytes = generate_verification_qr_png(url, box_size=6, border=1)
        assert isinstance(png_bytes, bytes)
        assert len(png_bytes) > 200
        # Valid PNG magic signature
        assert png_bytes.startswith(b"\x89PNG\r\n\x1a\n")

    def test_generate_verification_qr_b64(self) -> None:
        """Verify base64 data URL formatting."""
        url = "https://emaap.doca.gov.in/verify/TEST-UUID"
        data_url = generate_verification_qr_b64(url)
        assert data_url.startswith("data:image/png;base64,")


class TestDigitalSignatureBlock:
    """Tests for full cryptographic signature blocks."""

    def test_create_and_verify_signature_block(self) -> None:
        """Verify creation and self-consistency of complete signature block."""
        signer = EcdsaCryptoSigner(signer_name="Dr. R. K. Sharma")
        session_data = {
            "application_no": "RRSL-2026-009",
            "instrument": "Platform Scale 30kg",
            "weighing_points": 10,
            "overall_status": "PASS",
        }

        block = signer.create_signature_block(
            report_uuid="OIML-IND-2026-0089",
            session_data=session_data,
        )

        assert block.report_uuid == "OIML-IND-2026-0089"
        assert block.signer_name == "Dr. R. K. Sharma"
        assert block.signature_algorithm == SIGNATURE_ALGORITHM
        assert block.is_tamper_evident is True
        assert len(block.payload_sha256) == 64
        assert block.qr_code_png_b64.startswith("data:image/png;base64,")

        # Verify signature mathematically against embedded public key
        pk = load_public_key_pem(block.public_key_pem)
        assert verify_signature(pk, session_data, block.signature_b64) is True


class TestVerificationApiEndpoints:
    """Tests for public FastAPI verification endpoints."""

    def test_get_verify_report_endpoint(self, client: TestClient) -> None:
        """Test GET /api/v1/verify/{report_uuid} returns authentic status."""
        response = client.get("/api/v1/verify/OIML-IND-2026-0042")
        assert response.status_code == 200
        data = response.json()
        assert data["report_uuid"] == "OIML-IND-2026-0042"
        assert data["is_authentic"] is True
        assert data["verification_status"] == "STATUTORY_VERIFIED"
        assert "Regional Reference Standard Laboratory" in data["authority"]
        assert data["signature_algorithm"] == "ECDSA_SHA256_SECP256R1"

    def test_post_verify_check_endpoint_success(self, client: TestClient) -> None:
        """Test POST /api/v1/verify/check validates genuine payload."""
        sk, pk = generate_keypair()
        pk_pem = export_public_key_pem(pk)
        payload = {"instrument": "ZM510-PRO", "max": 30000, "status": "PASS"}
        sig_b64, _, _ = sign_payload(sk, payload)

        req_body = {
            "payload": payload,
            "signature": sig_b64,
            "public_key_pem": pk_pem,
        }
        response = client.post("/api/v1/verify/check", json=req_body)
        assert response.status_code == 200
        res = response.json()
        assert res["is_valid"] is True
        assert len(res["payload_sha256"]) == 64
        assert res["error_message"] is None

    def test_post_verify_check_endpoint_tampered(self, client: TestClient) -> None:
        """Test POST /api/v1/verify/check rejects tampered payload."""
        sk, pk = generate_keypair()
        pk_pem = export_public_key_pem(pk)
        payload = {"instrument": "ZM510-PRO", "max": 30000, "status": "PASS"}
        sig_b64, _, _ = sign_payload(sk, payload)

        # Alter the payload
        tampered_payload = {"instrument": "ZM510-PRO", "max": 30000, "status": "FAIL"}

        req_body = {
            "payload": tampered_payload,
            "signature": sig_b64,
            "public_key_pem": pk_pem,
        }
        response = client.post("/api/v1/verify/check", json=req_body)
        assert response.status_code == 200
        res = response.json()
        assert res["is_valid"] is False
        assert res["error_message"] is not None

    def test_post_verify_sign_endpoint(self, client: TestClient) -> None:
        """Test POST /api/v1/verify/sign creates signed block."""
        req_body = {
            "report_uuid": "RRSL-SIGN-2026-9901",
            "session_data": {"test_points": 10, "mpe_result": "PASS"},
            "signer_name": "Dr. Arvind Kumar",
        }
        response = client.post("/api/v1/verify/sign", json=req_body)
        assert response.status_code == 200
        block = response.json()
        assert block["report_uuid"] == "RRSL-SIGN-2026-9901"
        assert block["signer_name"] == "Dr. Arvind Kumar"
        assert block["signature_b64"] != ""
        assert "https://emaap.doca.gov.in" in block["verification_url"]

    def test_get_report_qr_image_endpoint(self, client: TestClient) -> None:
        """Test GET /api/v1/verify/{report_uuid}/qr returns PNG image."""
        response = client.get("/api/v1/verify/OIML-IND-2026-0042/qr")
        assert response.status_code == 200
        assert response.headers["content-type"] == "image/png"
        assert response.content.startswith(b"\x89PNG\r\n\x1a\n")
