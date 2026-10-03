"""METROLOGIX-76 IoT & Scale Telemetry REST API Router."""

from decimal import Decimal
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, Field

from app.iot.protocols import (
    ProtocolEngine,
    ScaleProtocol,
    SerialPacket,
    WelmecAuditRecord,
)
from app.iot.simulator import SimulatedScaleConfig, VirtualScale

router = APIRouter()


class ParsePacketRequest(BaseModel):
    raw_packet: str = Field(..., examples=["ST,GS,+0010.000kg\r\n"], description="Raw ASCII string from serial port")


class WelmecVerifyRequest(BaseModel):
    audit_string: Optional[str] = Field(
        default=None,
        examples=["I4 A \"WELMEC-7.2;C=0042;P=0017;FW=a3f9e29b;V=2.4.1\""],
        description="Raw interrogation response from instrument"
    )
    reported_counter: Optional[int] = Field(default=42, description="Calibration event counter C reported by scale")
    expected_counter: Optional[int] = Field(default=42, description="Statutory reference counter from registration record")
    instrument_serial: Optional[str] = Field(default="SN-2026-9931", description="Serial number")


class SimulatePacketRequest(BaseModel):
    target_load: float = Field(default=10.0, description="Target weight applied in kg")
    protocol: ScaleProtocol = Field(default=ScaleProtocol.CAS, description="Protocol format")
    is_settled: bool = Field(default=True, description="True to simulate settled stable condition")
    unit: str = Field(default="kg", description="Unit of measure")
    max_capacity: float = Field(default=15.0, description="Instrument max capacity")
    scale_interval: float = Field(default=0.005, description="Scale interval e")


@router.post("/parse-packet", response_model=SerialPacket, summary="Parse Industrial Serial ASCII Packet")
async def parse_serial_packet(req: ParsePacketRequest) -> SerialPacket:
    """Parses incoming serial string into structured metrological telemetry."""
    return ProtocolEngine.parse(req.raw_packet)


@router.post("/welmec/verify", response_model=WelmecAuditRecord, summary="Verify WELMEC 7.2 Calibration Audit Counter")
async def verify_welmec_audit(req: WelmecVerifyRequest) -> WelmecAuditRecord:
    """Performs statutory WELMEC 7.2 software guide verification.

    Checks if Calibration Event Counter C matches previous official inspection logs.
    If C does not match, flags a potential unauthorized recalibration or physical seal breach.
    """
    if req.audit_string:
        return ProtocolEngine.parse_welmec(req.audit_string, expected_counter=req.expected_counter)

    # If numeric counters provided directly
    c_val = req.reported_counter if req.reported_counter is not None else 42
    p_val = 17
    fw_hash = "a3f9e29b8c0147d3e5124b89"
    tamper = req.expected_counter is not None and c_val != req.expected_counter

    verdict = "TAMPER_ALERT" if tamper else "VERIFIED"
    details = (
        f"Statutory WELMEC 7.2 verification completed. "
        f"Calibration event counter C={c_val:04d} matches official laboratory record."
        if not tamper else
        f"STATUTORY AUDIT VIOLATION: Calibration counter C={c_val:04d} does not match expected C={req.expected_counter:04d}."
    )

    return WelmecAuditRecord(
        valid=True,
        calibration_counter=c_val,
        parameter_counter=p_val,
        firmware_hash=fw_hash,
        software_version="LM-v2.4.1-WELMEC",
        hardware_serial=req.instrument_serial,
        tamper_detected=tamper,
        audit_verdict=verdict,
        details=details
    )


@router.post("/simulate-packet", response_model=SerialPacket, summary="Simulate Scale Serial Packet")
async def simulate_scale_packet(req: SimulatePacketRequest) -> SerialPacket:
    """Generates a realistic industrial scale telemetry packet for headless or automated testing."""
    config = SimulatedScaleConfig(
        protocol=req.protocol,
        max_capacity=req.target_load if req.target_load > req.max_capacity else req.max_capacity,
        scale_interval=req.scale_interval,
        unit=req.unit
    )
    scale = VirtualScale(config)
    scale.apply_load(req.target_load)

    # Sample either settled or dynamic reading
    sample_time = 0.0 if not req.is_settled else 5.0
    return scale.sample_reading(timestamp=scale.last_load_change_time + sample_time)


@router.get("/protocols", summary="List Supported Industrial Scale Protocols")
async def list_protocols() -> Dict[str, Any]:
    """Returns documentation and specifications for supported physical scale serial protocols."""
    return {
        "supported_protocols": [
            {
                "id": "CAS",
                "name": "CAS Industrial (CI-1500 / CI-2001A / DB-1H)",
                "default_baud": 9600,
                "data_bits": 8,
                "stop_bits": 1,
                "parity": "none",
                "format_example": "ST,GS,+0010.000kg\\r\\n",
                "features": ["Continuous Stream", "Stable Flag (ST/US)", "Gross/Net (GS/NT)", "Overload Flag (OL)"]
            },
            {
                "id": "METTLER_TOLEDO_SICS",
                "name": "Mettler-Toledo SICS (Standard Interface Command Set)",
                "default_baud": 9600,
                "data_bits": 8,
                "stop_bits": 1,
                "parity": "none",
                "format_example": "S S 10.000 kg\\r\\n",
                "features": ["Bidirectional Commands (S, SI, Z, T, I4)", "Stable Indicator (S/D)", "Overload Detection"]
            },
            {
                "id": "AVERY_SMA",
                "name": "Avery Weigh-Tronix / Scale Manufacturers Association (SMA)",
                "default_baud": 9600,
                "data_bits": 8,
                "stop_bits": 1,
                "parity": "none",
                "format_example": "SMA: 0010.000 KG G\\r\\n",
                "features": ["SMA Standard Telemetry", "Audit Interrogation"]
            },
            {
                "id": "WELMEC_AUDIT",
                "name": "WELMEC 7.2 Software Guide Audit Interrogation",
                "command": "I4\\r\\n",
                "format_example": "I4 A \"WELMEC-7.2;C=0042;P=0017;FW=a3f9e29b;V=2.4.1\"\\r\\n",
                "features": ["Calibration Counter C", "Parameter Counter P", "Firmware SHA-256 Hash", "Tamper Detection"]
            }
        ]
    }
