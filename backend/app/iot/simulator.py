"""METROLOGIX-76 Scale Simulator Engine.

Generates physically authentic industrial scale serial telemetry with:
- Mechanical load cell settling curves (damped harmonic oscillation + Gaussian noise)
- Motion detection flag transition (US -> ST)
- Support for CAS, Mettler-Toledo SICS, and WELMEC 7.2 inquiry commands
"""

from __future__ import annotations

import math
import random
import time
from decimal import Decimal
from typing import Generator, List, Optional
from pydantic import BaseModel, Field

from app.iot.protocols import ProtocolEngine, ScaleProtocol, SerialPacket, WeightMode


class SimulatedScaleConfig(BaseModel):
    """Configuration for physical scale simulator."""
    protocol: ScaleProtocol = Field(default=ScaleProtocol.CAS, description="Protocol format")
    max_capacity: float = Field(default=15.0, description="Max capacity in kg")
    scale_interval: float = Field(default=0.005, description="Verification interval e in kg")
    unit: str = Field(default="kg", description="Unit of measure")
    settling_time_seconds: float = Field(default=1.2, description="Settling time before stable flag triggers")
    noise_sigma: float = Field(default=0.0008, description="Gaussian noise standard deviation")
    damping_ratio: float = Field(default=0.6, description="Mechanical damping ratio zeta")
    natural_frequency_hz: float = Field(default=4.0, description="Platter vibration frequency")
    calibration_counter: int = Field(default=42, description="WELMEC 7.2 Calibration Counter C")
    parameter_counter: int = Field(default=17, description="WELMEC 7.2 Parameter Counter P")
    firmware_hash: str = Field(default="a3f9e29b8c0147d3e5124b89", description="Software hash")


class VirtualScale:
    """Software virtual scale simulating physical load cell dynamics."""

    def __init__(self, config: Optional[SimulatedScaleConfig] = None):
        self.config = config or SimulatedScaleConfig()
        self.current_applied_load = 0.0
        self.tare_weight = 0.0
        self.zero_offset = 0.0
        self.last_load_change_time = time.time()
        self.is_stable = True
        self.current_indication = 0.0

    def apply_load(self, target_weight_kg: float) -> None:
        """User places or removes test weight on platter."""
        self.current_applied_load = target_weight_kg
        self.last_load_change_time = time.time()
        self.is_stable = False

    def tare(self) -> None:
        """Tare current platter load."""
        self.tare_weight = self.current_applied_load
        self.last_load_change_time = time.time()
        self.is_stable = False

    def zero(self) -> None:
        """Re-zero instrument."""
        self.zero_offset = self.current_applied_load
        self.last_load_change_time = time.time()
        self.is_stable = False

    def sample_reading(self, timestamp: Optional[float] = None) -> SerialPacket:
        """Generates an instantaneous telemetry reading at time t."""
        t_now = timestamp if timestamp is not None else time.time()
        elapsed = t_now - self.last_load_change_time
        net_target = self.current_applied_load - self.tare_weight - self.zero_offset

        # Overload check (Clause 4.1.2.4: Indication blanks or shows OL above Max + 9e)
        if net_target > self.config.max_capacity + 9 * self.config.scale_interval:
            raw = f"OL,GS,+9999.999{self.config.unit}\r\n"
            return SerialPacket(
                raw=raw,
                protocol=self.config.protocol,
                valid=True,
                stable=False,
                is_overload=True,
                unit=self.config.unit,
                error_message="OVERLOAD: Load exceeds Max + 9e"
            )

        # Underload check
        if net_target < -self.config.scale_interval * 20:
            raw = f"UL,GS,-9999.999{self.config.unit}\r\n"
            return SerialPacket(
                raw=raw,
                protocol=self.config.protocol,
                valid=True,
                stable=False,
                is_underload=True,
                unit=self.config.unit,
                error_message="UNDERLOAD: Platter below zero pan minimum"
            )

        # Damped mechanical response
        # x(t) = 1 - e^(-zeta*omega*t) * cos(omega_d * t)
        zeta = self.config.damping_ratio
        omega_n = 2.0 * math.pi * self.config.natural_frequency_hz
        omega_d = omega_n * math.sqrt(max(0.001, 1.0 - zeta**2))

        if elapsed < self.config.settling_time_seconds:
            envelope = math.exp(-zeta * omega_n * elapsed)
            oscillation = envelope * math.cos(omega_d * elapsed)
            settling_factor = 1.0 - oscillation
            jitter = random.gauss(0, self.config.noise_sigma * (1.0 + envelope * 3.0))
            instant_weight = net_target * settling_factor + jitter
            self.is_stable = False
        else:
            # Settled stable condition with small ambient air jitter
            jitter = random.gauss(0, self.config.noise_sigma * 0.2)
            instant_weight = net_target + jitter
            self.is_stable = True

        # Quantize to scale interval e for digital indicator display
        e = self.config.scale_interval
        quantized = round(instant_weight / e) * e
        self.current_indication = quantized

        mode = WeightMode.NET if self.tare_weight > 0 else WeightMode.GROSS
        dec_weight = Decimal(f"{quantized:.4f}").quantize(Decimal(f"{e}"))

        if self.config.protocol == ScaleProtocol.METTLER_TOLEDO_SICS:
            raw = ProtocolEngine.format_sics_packet(dec_weight, self.is_stable, self.config.unit)
        else:
            raw = ProtocolEngine.format_cas_packet(dec_weight, self.is_stable, self.config.unit, mode)

        return ProtocolEngine.parse(raw)

    def handle_command(self, cmd: str) -> str:
        """Processes an incoming ASCII command and returns the indicator response."""
        cleaned = cmd.strip()
        u_cmd = cleaned.upper()

        # WELMEC inquiry
        if u_cmd in ("I4", "C", "XM", "AUDIT"):
            return ProtocolEngine.format_welmec_response(
                calibration_counter=self.config.calibration_counter,
                parameter_counter=self.config.parameter_counter,
                firmware_hash=self.config.firmware_hash
            )

        # SICS S (send stable weight)
        if u_cmd == "S":
            packet = self.sample_reading()
            return ProtocolEngine.format_sics_packet(packet.weight or Decimal(0), packet.stable, self.config.unit)

        # SICS SI (send weight immediately)
        if u_cmd == "SI":
            packet = self.sample_reading()
            return ProtocolEngine.format_sics_packet(packet.weight or Decimal(0), False, self.config.unit)

        # SICS Z (zero)
        if u_cmd == "Z":
            self.zero()
            return "Z A\r\n"

        # SICS T (tare)
        if u_cmd == "T":
            self.tare()
            return f"T S {self.tare_weight:.3f} {self.config.unit}\r\n"

        return "ES\r\n"  # Syntax error in SICS
