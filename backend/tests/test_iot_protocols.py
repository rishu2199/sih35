"""Tests for METROLOGIX-76 IoT Serial Protocols, Virtual Scale Simulator, and WELMEC 7.2 Audit."""

import pytest
from decimal import Decimal
from fastapi.testclient import TestClient

from app.main import app
from app.iot.protocols import (
    ProtocolEngine,
    ScaleProtocol,
    WeightMode,
    WelmecAuditRecord,
)
from app.iot.simulator import SimulatedScaleConfig, VirtualScale

client = TestClient(app)


def test_parse_cas_protocol_stable_gross():
    """Verify CAS CI-Series format parsing: ST,GS,+0010.000kg"""
    raw = "ST,GS,+0010.000kg\r\n"
    packet = ProtocolEngine.parse(raw)

    assert packet.valid is True
    assert packet.protocol == ScaleProtocol.CAS
    assert packet.stable is True
    assert packet.mode == WeightMode.GROSS
    assert packet.weight == Decimal("10.000")
    assert packet.unit == "kg"
    assert packet.is_overload is False
    assert packet.is_zero is False


def test_parse_cas_protocol_unstable_net():
    """Verify CAS CI-Series motion and net mode: US,NT,+0004.550 g"""
    raw = "US,NT,+0004.550 g\r\n"
    packet = ProtocolEngine.parse(raw)

    assert packet.valid is True
    assert packet.protocol == ScaleProtocol.CAS
    assert packet.stable is False
    assert packet.mode == WeightMode.NET
    assert packet.weight == Decimal("4.550")
    assert packet.unit == "g"


def test_parse_cas_overload():
    """Verify CAS overload flag: OL,GS,..."""
    raw = "OL,GS,+9999.999kg\r\n"
    packet = ProtocolEngine.parse(raw)

    assert packet.valid is True
    assert packet.stable is False
    assert packet.is_overload is True


def test_parse_mettler_toledo_sics_stable():
    """Verify Mettler-Toledo SICS format: S S 10.000 kg"""
    raw = "S S 10.000 kg\r\n"
    packet = ProtocolEngine.parse(raw)

    assert packet.valid is True
    assert packet.protocol == ScaleProtocol.METTLER_TOLEDO_SICS
    assert packet.stable is True
    assert packet.weight == Decimal("10.000")
    assert packet.unit == "kg"


def test_parse_mettler_toledo_sics_dynamic():
    """Verify Mettler-Toledo SICS dynamic (unstable) format: S D 5.234 g"""
    raw = "S D 5.234 g\r\n"
    packet = ProtocolEngine.parse(raw)

    assert packet.valid is True
    assert packet.stable is False
    assert packet.weight == Decimal("5.234")


def test_parse_welmec_7_2_audit_string():
    """Verify WELMEC 7.2 statutory software inquiry: C = 0042, P = 0017."""
    raw = "I4 A \"WELMEC-7.2;C=0042;P=0017;FW=a3f9e29b;V=2.4.1\"\r\n"
    audit = ProtocolEngine.parse_welmec(raw, expected_counter=42)

    assert audit.valid is True
    assert audit.calibration_counter == 42
    assert audit.parameter_counter == 17
    assert audit.firmware_hash == "a3f9e29b"
    assert audit.tamper_detected is False
    assert audit.audit_verdict == "VERIFIED"


def test_welmec_tamper_detection_on_mismatch():
    """Verify tamper alert triggered if scale reports C=0043 when expected C=0042."""
    raw = "I4 A \"WELMEC-7.2;C=0043;P=0017;FW=a3f9e29b;V=2.4.1\"\r\n"
    audit = ProtocolEngine.parse_welmec(raw, expected_counter=42)

    assert audit.valid is True
    assert audit.calibration_counter == 43
    assert audit.tamper_detected is True
    assert audit.audit_verdict == "TAMPER_ALERT"
    assert "STATUTORY AUDIT VIOLATION" in audit.details


def test_virtual_scale_settling_and_stability():
    """Verify software scale physics simulator handles load application and settles."""
    config = SimulatedScaleConfig(
        protocol=ScaleProtocol.CAS,
        max_capacity=15.0,
        scale_interval=0.005,
        settling_time_seconds=0.1,  # fast settling for test
        unit="kg"
    )
    scale = VirtualScale(config)
    scale.apply_load(10.0)

    # Immediately after placing weight, scale must not be stable
    immediate_packet = scale.sample_reading(timestamp=scale.last_load_change_time + 0.02)
    assert immediate_packet.stable is False

    # After settling time, scale must be stable at 10.000 kg
    settled_packet = scale.sample_reading(timestamp=scale.last_load_change_time + 0.3)
    assert settled_packet.stable is True
    assert settled_packet.weight == Decimal("10.000")


def test_virtual_scale_zero_and_tare():
    """Verify zero and tare operations on virtual scale."""
    config = SimulatedScaleConfig(protocol=ScaleProtocol.METTLER_TOLEDO_SICS)
    scale = VirtualScale(config)

    # Place tare container
    scale.apply_load(2.0)
    scale.tare()
    assert scale.tare_weight == 2.0

    # Place net goods
    scale.apply_load(7.0)
    reading = scale.sample_reading(timestamp=scale.last_load_change_time + 2.0)
    assert reading.weight == Decimal("5.000")  # 7.0 - 2.0 tare = 5.0 net


def test_api_parse_packet():
    """Verify POST /api/v1/iot/parse-packet."""
    resp = client.post("/api/v1/iot/parse-packet", json={"raw_packet": "ST,GS,+0025.000kg\r\n"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["valid"] is True
    assert data["stable"] is True
    assert data["protocol"] == "CAS"
    assert data["weight"] == "25.000"


def test_api_welmec_verify_endpoint():
    """Verify POST /api/v1/iot/welmec/verify."""
    resp = client.post("/api/v1/iot/welmec/verify", json={
        "reported_counter": 42,
        "expected_counter": 42,
        "instrument_serial": "SN-2026-9931"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["valid"] is True
    assert data["calibration_counter"] == 42
    assert data["tamper_detected"] is False
    assert data["audit_verdict"] == "VERIFIED"


def test_api_welmec_tamper_alert_endpoint():
    """Verify tamper detection via REST endpoint."""
    resp = client.post("/api/v1/iot/welmec/verify", json={
        "reported_counter": 45,
        "expected_counter": 42
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["tamper_detected"] is True
    assert data["audit_verdict"] == "TAMPER_ALERT"


def test_api_simulate_packet_endpoint():
    """Verify POST /api/v1/iot/simulate-packet."""
    resp = client.post("/api/v1/iot/simulate-packet", json={
        "target_load": 10.0,
        "is_settled": True,
        "protocol": "CAS"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["valid"] is True
    assert data["stable"] is True
    assert data["weight"] == "10.000"


def test_api_protocols_list_endpoint():
    """Verify GET /api/v1/iot/protocols."""
    resp = client.get("/api/v1/iot/protocols")
    assert resp.status_code == 200
    data = resp.json()
    assert "supported_protocols" in data
    protocols = [p["id"] for p in data["supported_protocols"]]
    assert "CAS" in protocols
    assert "METTLER_TOLEDO_SICS" in protocols
    assert "WELMEC_AUDIT" in protocols
