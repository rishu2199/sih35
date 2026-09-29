"""Unit and Integration Tests for Step 28: Deterministic OpenCV Photo Auditor.

Verifies:
1. Spirit Bubble Level Verification (Hough Circles tilt measurement):
   - Centered bubble -> PASS (tilt <= 0.5 deg)
   - Displaced bubble -> FAIL / Warning (tilt > 0.5 deg)
   - Custom tilt threshold tolerance
2. Platter Surface Cleanliness & Obstruction Check:
   - Clean stainless platter -> PASS (Cleanliness 100%, 0 foreign objects)
   - Foreign object clutter (coin/screw) -> FAIL / Warning (< 100%, foreign objects detected)
   - Baseline subtraction mode (Δ = |I_curr - I_base|) -> isolates added mass accurately
   - Edge-binding obstruction detection -> flags mechanical force shunting risk
3. Statutory Lead Seal Wire Pass-Through Hole:
   - Present hole -> PASS (Section 24 Legal Metrology Act compliance)
   - Missing hole -> FAIL / Statutory inspection warning
4. Multi-format Input Handling & Robustness:
   - Raw bytes (PNG)
   - Base64 data URLs
   - NumPy arrays
   - Corrupted/empty input graceful handling (no uncaught crashes)
5. FastAPI Vision Endpoints:
   - POST /api/vision/audit-spirit-bubble
   - POST /api/vision/audit-platter-surface
   - POST /api/vision/verify-lead-seal
   - POST /api/vision/full-physical-audit
   - GET /api/vision/demo-samples
"""

from __future__ import annotations

import base64

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.vision.photo_auditor import (
    PhotoAuditorEngine,
    audit_full_physical_inspection,
    audit_platter_surface,
    audit_spirit_bubble,
    decode_image_input,
    generate_synthetic_lead_seal,
    generate_synthetic_platter,
    generate_synthetic_spirit_bubble,
    verify_lead_seal_hole,
)


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


# ============================================================================
# 1. SPIRIT BUBBLE AUDITOR TESTS
# ============================================================================


class TestSpiritBubbleAuditor:
    """Tests for OIML R 76-1 Clause 3.9.1.1 spirit level bubble concentricity & tilt."""

    def test_level_bubble_returns_pass(self) -> None:
        """Centered spirit bubble must evaluate to PASS with tilt <= 0.50 deg."""
        img_bytes = generate_synthetic_spirit_bubble(is_level=True)
        result = audit_spirit_bubble(img_bytes)

        assert result.valid is True
        assert result.verdict == "PASS"
        assert result.tilt_degrees <= 0.50
        assert result.outer_ring is not None
        assert result.bubble_circle is not None
        assert result.outer_ring.radius > result.bubble_circle.radius
        assert result.annotated_image_base64 is not None
        assert result.annotated_image_base64.startswith("data:image/png;base64,")
        assert "conforms to OIML R 76-1" in result.details

    def test_off_center_bubble_triggers_tilt_alert(self) -> None:
        """Displaced spirit bubble must evaluate to FAIL with tilt > 0.50 deg."""
        img_bytes = generate_synthetic_spirit_bubble(is_level=False)
        result = audit_spirit_bubble(img_bytes)

        assert result.valid is True
        assert result.verdict == "FAIL"
        assert result.tilt_degrees > 0.50
        assert "STATUTORY TILT ALERT" in result.details
        assert "Level scale via adjustable feet" in result.details
        assert result.offset_pixels > 10.0

    def test_custom_tilt_threshold(self) -> None:
        """Tight tilt threshold can flag micro-inclinations on precision balances."""
        img_bytes = generate_synthetic_spirit_bubble(is_level=True)
        # Force strict tilt limit
        strict_result = audit_spirit_bubble(img_bytes, max_permitted_tilt_deg=0.01)
        assert strict_result.valid is True
        # If tilt is e.g. 0.05 deg, strict limit 0.01 triggers fail
        if strict_result.tilt_degrees > 0.01:
            assert strict_result.verdict == "FAIL"

    def test_engine_classmethod_alias(self) -> None:
        """PhotoAuditorEngine.audit_spirit_bubble class method must behave identically."""
        img_bytes = generate_synthetic_spirit_bubble(is_level=True)
        res1 = audit_spirit_bubble(img_bytes)
        res2 = PhotoAuditorEngine.audit_spirit_bubble(img_bytes)

        assert res1.verdict == res2.verdict
        assert res1.tilt_degrees == res2.tilt_degrees

    def test_numpy_array_input(self) -> None:
        """Direct numpy image input must be supported."""
        img_bytes = generate_synthetic_spirit_bubble(is_level=True)
        img_np = decode_image_input(img_bytes)
        result = audit_spirit_bubble(img_np)

        assert result.valid is True
        assert result.verdict == "PASS"

    def test_base64_string_input(self) -> None:
        """Base64 data URL input string must be decoded and audited seamlessly."""
        img_bytes = generate_synthetic_spirit_bubble(is_level=False)
        b64_str = f"data:image/png;base64,{base64.b64encode(img_bytes).decode('ascii')}"
        result = audit_spirit_bubble(b64_str)

        assert result.valid is True
        assert result.verdict == "FAIL"

    def test_corrupted_image_handling(self) -> None:
        """Corrupted image bytes must return valid=False with FAIL verdict without crashing."""
        corrupt_bytes = b"NOT_A_VALID_IMAGE_DATA_BYTES"
        result = audit_spirit_bubble(corrupt_bytes)

        assert result.valid is False
        assert result.verdict == "FAIL"
        assert "error" in result.details.lower()


# ============================================================================
# 2. PLATTER SURFACE INTEGRITY & BASELINE SUBTRACTION TESTS
# ============================================================================


class TestPlatterSurfaceAuditor:
    """Tests for OIML R 76-1 Clause 4.1.2.1 platter cleanliness & edge obstruction."""

    def test_clean_platter_returns_pass(self) -> None:
        """Empty clean weighing platter must return PASS with 100% cleanliness."""
        clean_bytes = generate_synthetic_platter(has_contamination=False, has_edge_binding=False)
        result = audit_platter_surface(clean_bytes)

        assert result.valid is True
        assert result.verdict == "PASS"
        assert result.cleanliness_score == 100.0
        assert len(result.foreign_objects) == 0
        assert result.edge_binding_detected is False
        assert "free of extraneous mass" in result.details

    def test_foreign_coin_on_platter_triggers_clutter_alert(self) -> None:
        """Extraneous mass (e.g. coin) must be detected and trigger clutter alert."""
        clutter_bytes = generate_synthetic_platter(has_contamination=True, has_edge_binding=False)
        result = audit_platter_surface(clutter_bytes)

        assert result.valid is True
        assert result.verdict == "FAIL"
        assert len(result.foreign_objects) >= 1
        assert result.contamination_area_pixels > 0
        assert "METROLOGICAL CONTAMINATION ALERT" in result.details
        assert result.foreign_objects[0].area_pixels > 50

    def test_baseline_subtraction_mode(self) -> None:
        """Optical baseline subtraction (Δ = |I_curr - I_base|) must isolate mass."""
        base_bytes = generate_synthetic_platter(has_contamination=False, has_edge_binding=False)
        curr_bytes = generate_synthetic_platter(has_contamination=True, has_edge_binding=False)

        # Baseline vs Baseline -> 100% Clean
        res_clean = audit_platter_surface(base_bytes, baseline_image=base_bytes)
        assert res_clean.valid is True
        assert res_clean.verdict == "PASS"
        assert len(res_clean.foreign_objects) == 0

        # Clutter vs Baseline -> Flags clutter
        res_clutter = audit_platter_surface(curr_bytes, baseline_image=base_bytes)
        assert res_clutter.valid is True
        assert res_clutter.verdict == "FAIL"
        assert len(res_clutter.foreign_objects) >= 1

    def test_edge_binding_obstruction_detection(self) -> None:
        """Obstruction at platter rim boundary must flag edge_binding_detected and HIGH risk."""
        binding_bytes = generate_synthetic_platter(has_contamination=False, has_edge_binding=True)
        base_bytes = generate_synthetic_platter(has_contamination=False, has_edge_binding=False)

        result = audit_platter_surface(binding_bytes, baseline_image=base_bytes)

        assert result.valid is True
        assert result.verdict == "FAIL"
        assert result.edge_binding_detected is True
        assert any(obj.risk_level == "HIGH" for obj in result.foreign_objects)
        assert "Edge-binding obstruction" in result.details

    def test_engine_platter_alias(self) -> None:
        """PhotoAuditorEngine.audit_platter_surface class method must match standalone function."""
        clean_bytes = generate_synthetic_platter(has_contamination=False)
        res1 = audit_platter_surface(clean_bytes)
        res2 = PhotoAuditorEngine.audit_platter_surface(clean_bytes)

        assert res1.verdict == res2.verdict
        assert res1.cleanliness_score == res2.cleanliness_score


# ============================================================================
# 3. STATUTORY LEAD SEAL WIRE HOLE TESTS
# ============================================================================


class TestLeadSealHoleAuditor:
    """Tests for Section 24 Legal Metrology Act lead wire sealing hole verification."""

    def test_seal_hole_present_returns_pass(self) -> None:
        """Casing with statutory sealing pass-through hole must evaluate to PASS."""
        casing_bytes = generate_synthetic_lead_seal(has_hole=True)
        result = verify_lead_seal_hole(casing_bytes)

        assert result.valid is True
        assert result.verdict == "PASS"
        assert result.hole_detected is True
        assert result.hole_center is not None
        assert result.hole_diameter_px is not None
        assert result.hole_diameter_px > 10.0
        assert result.confidence_score >= 0.35
        assert result.circularity_score >= 0.50
        assert result.bbox is not None
        assert "Section 24 of the Legal Metrology Act, 2009" in result.details

    def test_missing_seal_hole_triggers_statutory_warning(self) -> None:
        """Casing without statutory sealing hole must trigger inspection warning."""
        casing_bytes = generate_synthetic_lead_seal(has_hole=False)
        result = verify_lead_seal_hole(casing_bytes)

        assert result.valid is True
        assert result.verdict == "FAIL"
        assert result.hole_detected is False
        assert "STATUTORY INSPECTION WARNING" in result.details
        assert "cannot be stamped under Section 24" in result.details

    def test_engine_seal_alias(self) -> None:
        """PhotoAuditorEngine.verify_lead_seal_hole class method must match standalone function."""
        casing_bytes = generate_synthetic_lead_seal(has_hole=True)
        res1 = verify_lead_seal_hole(casing_bytes)
        res2 = PhotoAuditorEngine.verify_lead_seal_hole(casing_bytes)

        assert res1.verdict == res2.verdict
        assert res1.hole_detected == res2.hole_detected


# ============================================================================
# 4. FULL MULTI-PARAMETER PHYSICAL AUDIT TESTS
# ============================================================================


class TestFullPhysicalAudit:
    """Tests for audit_full_physical_inspection aggregator."""

    def test_all_pass_inspection(self) -> None:
        """When all physical components pass, overall_verdict is PASS."""
        spirit = generate_synthetic_spirit_bubble(is_level=True)
        platter = generate_synthetic_platter(has_contamination=False)
        seal = generate_synthetic_lead_seal(has_hole=True)

        full_res = audit_full_physical_inspection(
            spirit_image=spirit,
            current_platter_image=platter,
            baseline_platter_image=platter,
            casing_seal_image=seal,
        )

        assert full_res.overall_verdict == "PASS"
        assert full_res.spirit_bubble is not None and full_res.spirit_bubble.verdict == "PASS"
        assert full_res.platter_surface is not None and full_res.platter_surface.verdict == "PASS"
        assert full_res.lead_seal_hole is not None and full_res.lead_seal_hole.verdict == "PASS"
        assert any(
            "All inspected physical parameters conform" in note for note in full_res.inspector_notes
        )

    def test_single_failure_fails_overall(self) -> None:
        """If spirit bubble is tilted, overall inspection verdict must be FAIL."""
        spirit_tilted = generate_synthetic_spirit_bubble(is_level=False)
        platter = generate_synthetic_platter(has_contamination=False)
        seal = generate_synthetic_lead_seal(has_hole=True)

        full_res = audit_full_physical_inspection(
            spirit_image=spirit_tilted,
            current_platter_image=platter,
            casing_seal_image=seal,
        )

        assert full_res.overall_verdict == "FAIL"
        assert any("Leveling Alert" in note for note in full_res.inspector_notes)


# ============================================================================
# 5. FASTAPI ROUTE INTEGRATION TESTS
# ============================================================================


class TestVisionApiEndpoints:
    """HTTP endpoint integration tests for /api/vision router."""

    def test_api_audit_spirit_bubble(self, client: TestClient) -> None:
        img_bytes = generate_synthetic_spirit_bubble(is_level=True)
        b64 = f"data:image/png;base64,{base64.b64encode(img_bytes).decode('ascii')}"

        response = client.post(
            "/api/vision/audit-spirit-bubble",
            json={"image_base64": b64, "max_permitted_tilt_deg": 0.5},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] is True
        assert data["verdict"] == "PASS"
        assert data["tilt_degrees"] <= 0.50

    def test_api_audit_platter_surface(self, client: TestClient) -> None:
        clean_bytes = generate_synthetic_platter(has_contamination=False)
        clutter_bytes = generate_synthetic_platter(has_contamination=True)

        b64_clean = f"data:image/png;base64,{base64.b64encode(clean_bytes).decode('ascii')}"
        b64_clutter = f"data:image/png;base64,{base64.b64encode(clutter_bytes).decode('ascii')}"

        response = client.post(
            "/api/vision/audit-platter-surface",
            json={
                "current_image_base64": b64_clutter,
                "baseline_image_base64": b64_clean,
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] is True
        assert data["verdict"] == "FAIL"
        assert len(data["foreign_objects"]) >= 1

    def test_api_verify_lead_seal(self, client: TestClient) -> None:
        seal_bytes = generate_synthetic_lead_seal(has_hole=True)
        b64 = f"data:image/png;base64,{base64.b64encode(seal_bytes).decode('ascii')}"

        response = client.post(
            "/api/vision/verify-lead-seal",
            json={"image_base64": b64},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] is True
        assert data["verdict"] == "PASS"
        assert data["hole_detected"] is True

    def test_api_full_physical_audit(self, client: TestClient) -> None:
        spirit_b = generate_synthetic_spirit_bubble(True)
        platter_b = generate_synthetic_platter(False)
        seal_b = generate_synthetic_lead_seal(True)

        spirit = f"data:image/png;base64,{base64.b64encode(spirit_b).decode('ascii')}"
        platter = f"data:image/png;base64,{base64.b64encode(platter_b).decode('ascii')}"
        seal = f"data:image/png;base64,{base64.b64encode(seal_b).decode('ascii')}"

        response = client.post(
            "/api/vision/full-physical-audit",
            json={
                "spirit_image_base64": spirit,
                "current_platter_image_base64": platter,
                "baseline_platter_image_base64": platter,
                "casing_seal_image_base64": seal,
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["overall_verdict"] == "PASS"

    def test_api_demo_samples(self, client: TestClient) -> None:
        response = client.get("/api/vision/demo-samples")
        assert response.status_code == 200
        data = response.json()
        assert "spirit_level_pass" in data
        assert "spirit_level_fail" in data
        assert "platter_clean_pass" in data
        assert "platter_cluttered_fail" in data
        assert "lead_seal_hole_pass" in data
        assert "lead_seal_hole_fail" in data
