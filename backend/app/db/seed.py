"""Official Statutory Database Seeder for METROLOGIX-76.

Populates initial statutory Legal Metrology ecosystem data:
1. 6 Regional Reference Standard Laboratories (RRSLs):
   - Bengaluru (Karnataka) - Southern Region
   - Ahmedabad (Gujarat) - Western Region
   - Faridabad (Haryana) - Northern Region
   - Bhubaneswar (Odisha) - Eastern Region
   - Varanasi (Uttar Pradesh) - Central Region
   - Guwahati (Assam) - North-Eastern Region
2. Government Approved Test Centres (GATCs):
   - GATC New Delhi (GATC-DL-001)
   - GATC Pune (GATC-MH-002)
3. Certified OIML R 111 Standard Weight Sets (Class E2, F1, F2, M1).
4. Statutory User Accounts covering RBAC roles (METROLOGIST, REVIEWER, DIRECTOR, AUDITOR, ADMIN).
5. Baseline NAWI Instruments (Retail counter scale, Platform scale, Weighbridge, Lab balance).

100% idempotent: Safe to execute repeatedly without duplicating records or violating unique keys.
"""

from __future__ import annotations

import asyncio
import logging
from datetime import UTC, datetime
from decimal import Decimal
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.types import (
    AccuracyClass,
    ComplianceStatus,
    InstrumentMobility,
    LoadReceptorType,
    TestType,
    UnitOfMeasure,
    VerificationStage,
)
from app.db.models import (
    Instrument,
    Laboratory,
    LaboratoryType,
    StandardWeightSet,
    TestObservation,
    TestSession,
    TestSessionStatus,
    User,
    UserRole,
    WeightClass,
)
from app.db.repositories import (
    EquipmentRepository,
    InstrumentRepository,
    LaboratoryRepository,
    TestSessionRepository,
    UserRepository,
)
from app.db.session import async_session_factory, init_db

logger = logging.getLogger("metrologix.seed")

# Pre-computed secure bcrypt hash for default development accounts: "Metrologix@2026"
DEFAULT_PASSWORD_HASH = (
    "$2b$12$e8YdEvhG18FmD8hJ3mP3CeU60s6y0Z9Qy4sLgT5uD9cW2lP.OaB3W"  # noqa: S105
)

# ============================================================================
# STATUTORY DATA DEFINITIONS
# ============================================================================

LABORATORIES_DATA: list[dict[str, Any]] = [
    {
        "code": "RRSL-BLR",
        "name": "Regional Reference Standard Laboratory, Bengaluru",
        "lab_type": LaboratoryType.RRSL,
        "nabl_accreditation_number": "CC-2810-NABL-BLR",
        "nabl_validity_date": datetime(2028, 6, 30, tzinfo=UTC),
        "address": "PB No. 7601, Peenya Industrial Area, Phase-II",
        "city": "Bengaluru",
        "state": "Karnataka",
        "pincode": "560058",
        "contact_email": "rrsl.blr@nic.in",
        "contact_phone": "+91-80-28394567",
    },
    {
        "code": "RRSL-AHM",
        "name": "Regional Reference Standard Laboratory, Ahmedabad",
        "lab_type": LaboratoryType.RRSL,
        "nabl_accreditation_number": "CC-2811-NABL-AHM",
        "nabl_validity_date": datetime(2028, 8, 31, tzinfo=UTC),
        "address": "Plot No. 42, GIDC Industrial Estate, Vatva",
        "city": "Ahmedabad",
        "state": "Gujarat",
        "pincode": "382445",
        "contact_email": "rrsl.ahm@nic.in",
        "contact_phone": "+91-79-25831234",
    },
    {
        "code": "RRSL-FBD",
        "name": "Regional Reference Standard Laboratory, Faridabad",
        "lab_type": LaboratoryType.RRSL,
        "nabl_accreditation_number": "CC-2812-NABL-FBD",
        "nabl_validity_date": datetime(2028, 9, 30, tzinfo=UTC),
        "address": "Sector 15-A, Near NH-19",
        "city": "Faridabad",
        "state": "Haryana",
        "pincode": "121007",
        "contact_email": "rrsl.fbd@nic.in",
        "contact_phone": "+91-129-2287654",
    },
    {
        "code": "RRSL-BBI",
        "name": "Regional Reference Standard Laboratory, Bhubaneswar",
        "lab_type": LaboratoryType.RRSL,
        "nabl_accreditation_number": "CC-2813-NABL-BBI",
        "nabl_validity_date": datetime(2028, 11, 30, tzinfo=UTC),
        "address": "Mancheswar Industrial Estate, Sector-B",
        "city": "Bhubaneswar",
        "state": "Odisha",
        "pincode": "751010",
        "contact_email": "rrsl.bbi@nic.in",
        "contact_phone": "+91-674-2589012",
    },
    {
        "code": "RRSL-VNS",
        "name": "Regional Reference Standard Laboratory, Varanasi",
        "lab_type": LaboratoryType.RRSL,
        "nabl_accreditation_number": "CC-2814-NABL-VNS",
        "nabl_validity_date": datetime(2028, 12, 31, tzinfo=UTC),
        "address": "Varanasi Cantt, Near Metrological Yard",
        "city": "Varanasi",
        "state": "Uttar Pradesh",
        "pincode": "221002",
        "contact_email": "rrsl.vns@nic.in",
        "contact_phone": "+91-542-2501234",
    },
    {
        "code": "RRSL-GHY",
        "name": "Regional Reference Standard Laboratory, Guwahati",
        "lab_type": LaboratoryType.RRSL,
        "nabl_accreditation_number": "CC-2815-NABL-GHY",
        "nabl_validity_date": datetime(2029, 3, 31, tzinfo=UTC),
        "address": "Khanapara GS Road, Opp. Veterinary College",
        "city": "Guwahati",
        "state": "Assam",
        "pincode": "781022",
        "contact_email": "rrsl.ghy@nic.in",
        "contact_phone": "+91-361-2361234",
    },
    {
        "code": "GATC-DL-001",
        "name": "Apex Metrology Calibration GATC, New Delhi",
        "lab_type": LaboratoryType.GATC,
        "nabl_accreditation_number": "GATC-2026-DL-01",
        "nabl_validity_date": datetime(2027, 12, 31, tzinfo=UTC),
        "address": "Okhla Industrial Area, Phase-III",
        "city": "New Delhi",
        "state": "Delhi",
        "pincode": "110020",
        "contact_email": "info@apexmetrology.org.in",
        "contact_phone": "+91-11-26814000",
    },
    {
        "code": "GATC-MH-002",
        "name": "Western Precision Metrology GATC, Pune",
        "lab_type": LaboratoryType.GATC,
        "nabl_accreditation_number": "GATC-2026-MH-02",
        "nabl_validity_date": datetime(2027, 10, 31, tzinfo=UTC),
        "address": "Bhosari MIDC, Pimpri-Chinchwad",
        "city": "Pune",
        "state": "Maharashtra",
        "pincode": "411026",
        "contact_email": "support@westerncalib.com",
        "contact_phone": "+91-20-27123456",
    },
]

USERS_DATA: list[dict[str, Any]] = [
    {
        "email": "testing.officer@rrsl.gov.in",
        "username": "sk_ramanathan",
        "full_name": "Dr. S. K. Ramanathan",
        "designation": "Testing Officer (Scientific Officer-II)",
        "role": UserRole.METROLOGIST,
        "lab_code": "RRSL-BLR",
    },
    {
        "email": "pso.reviewer@rrsl.gov.in",
        "username": "m_sundaram",
        "full_name": "Dr. Meenakshi Sundaram",
        "designation": "Principal Scientific Officer (PSO)",
        "role": UserRole.REVIEWER,
        "lab_code": "RRSL-BLR",
    },
    {
        "email": "director@rrsl.gov.in",
        "username": "rajeshwari_sen",
        "full_name": "Dr. Rajeshwari Sen",
        "designation": "Director & Issuing Authority",
        "role": UserRole.DIRECTOR,
        "lab_code": "RRSL-BLR",
    },
    {
        "email": "auditor.doca@gov.in",
        "username": "alok_verma",
        "full_name": "Shri Alok Verma",
        "designation": "Senior Regulatory Inspector (DoCA)",
        "role": UserRole.AUDITOR,
        "lab_code": "RRSL-BLR",
    },
    {
        "email": "admin@metrologix.gov.in",
        "username": "sysadmin",
        "full_name": "METROLOGIX System Administrator",
        "designation": "IT Systems Administrator",
        "role": UserRole.ADMIN,
        "lab_code": "RRSL-BLR",
    },
]

WEIGHT_SETS_DATA: list[dict[str, Any]] = [
    {
        "identification_code": "RRSL-BLR-E2-001",
        "weight_class": WeightClass.E2,
        "calibration_certificate_number": "NPL/MASS/2026/E2-0442",
        "calibrated_by": "CSIR - National Physical Laboratory (NPL India)",
        "calibration_date": datetime(2026, 1, 10, tzinfo=UTC),
        "validity_date": datetime(2028, 1, 9, tzinfo=UTC),
        "nominal_min_value": Decimal("0.000001"),  # 1 mg = 0.000001 kg
        "nominal_max_value": Decimal("1.000000"),  # 1 kg
        "unit": UnitOfMeasure.KILOGRAM,
        "expanded_uncertainty_k2": Decimal("0.00000005"),
        "lab_code": "RRSL-BLR",
    },
    {
        "identification_code": "RRSL-BLR-F1-002",
        "weight_class": WeightClass.F1,
        "calibration_certificate_number": "RRSL/FBD/2026/F1-1029",
        "calibrated_by": "Regional Reference Standard Laboratory, Faridabad",
        "calibration_date": datetime(2026, 2, 1, tzinfo=UTC),
        "validity_date": datetime(2027, 1, 31, tzinfo=UTC),
        "nominal_min_value": Decimal("0.001000"),  # 1 g = 0.001 kg
        "nominal_max_value": Decimal("20.000000"),  # 20 kg
        "unit": UnitOfMeasure.KILOGRAM,
        "expanded_uncertainty_k2": Decimal("0.000005"),
        "lab_code": "RRSL-BLR",
    },
    {
        "identification_code": "RRSL-BLR-F2-003",
        "weight_class": WeightClass.F2,
        "calibration_certificate_number": "RRSL/BLR/2026/F2-0812",
        "calibrated_by": "Regional Reference Standard Laboratory, Bengaluru",
        "calibration_date": datetime(2026, 3, 1, tzinfo=UTC),
        "validity_date": datetime(2027, 2, 28, tzinfo=UTC),
        "nominal_min_value": Decimal("0.100000"),  # 100 g = 0.1 kg
        "nominal_max_value": Decimal("50.000000"),  # 50 kg
        "unit": UnitOfMeasure.KILOGRAM,
        "expanded_uncertainty_k2": Decimal("0.000050"),
        "lab_code": "RRSL-BLR",
    },
    {
        "identification_code": "RRSL-BLR-M1-004",
        "weight_class": WeightClass.M1,
        "calibration_certificate_number": "RRSL/BLR/2026/M1-CAST-500",
        "calibrated_by": "Regional Reference Standard Laboratory, Bengaluru",
        "calibration_date": datetime(2025, 12, 15, tzinfo=UTC),
        "validity_date": datetime(2026, 12, 14, tzinfo=UTC),
        "nominal_min_value": Decimal("20.000000"),  # 20 kg
        "nominal_max_value": Decimal("20000.000000"),  # 20,000 kg (20 Tonnes)
        "unit": UnitOfMeasure.KILOGRAM,
        "expanded_uncertainty_k2": Decimal("0.002000"),
        "lab_code": "RRSL-BLR",
    },
]

INSTRUMENTS_DATA: list[dict[str, Any]] = [
    {
        "serial_number": "IND-RETAIL-15K-001",
        "model_name": "SwiftScale-Retail-15",
        "manufacturer": "Bharat Weighing Solutions Pvt Ltd",
        "accuracy_class": AccuracyClass.CLASS_III,
        "verification_stage": VerificationStage.INITIAL_TYPE_APPROVAL,
        "unit": UnitOfMeasure.KILOGRAM,
        "max_capacity": Decimal("15.000000"),
        "min_capacity": Decimal("0.100000"),  # 20e = 100g
        "verification_scale_interval": Decimal("0.005000"),  # e = 5g
        "actual_scale_interval": Decimal("0.005000"),  # d = 5g
        "receptor_type": LoadReceptorType.PLATFORM,
        "mobility": InstrumentMobility.PORTABLE,
        "has_level_indicator": True,
        "has_tare_device": True,
        "num_supports": 4,
        "is_multi_interval": False,
        "rulepack_id": "OIML_R76_2006",
        "description": "Commercial Counter Retail Scale with Price Computing Display",
    },
    {
        "serial_number": "IND-PLATFORM-60K-002",
        "model_name": "ProBench-60",
        "manufacturer": "National Metrology Equipment Ltd",
        "accuracy_class": AccuracyClass.CLASS_III,
        "verification_stage": VerificationStage.INITIAL_TYPE_APPROVAL,
        "unit": UnitOfMeasure.KILOGRAM,
        "max_capacity": Decimal("60.000000"),
        "min_capacity": Decimal("0.400000"),  # 20e = 400g
        "verification_scale_interval": Decimal("0.020000"),  # e = 20g
        "actual_scale_interval": Decimal("0.020000"),
        "receptor_type": LoadReceptorType.PLATFORM,
        "mobility": InstrumentMobility.PORTABLE,
        "has_level_indicator": True,
        "has_tare_device": True,
        "num_supports": 4,
        "is_multi_interval": False,
        "rulepack_id": "OIML_R76_2006",
        "description": "Industrial Stainless Steel Bench Platform Scale (Clause A.4.7.1)",
    },
    {
        "serial_number": "IND-WEIGHBRIDGE-50T-003",
        "model_name": "Titan-WIM-50T",
        "manufacturer": "HeavyDuty Weighbridges India Ltd",
        "accuracy_class": AccuracyClass.CLASS_III,
        "verification_stage": VerificationStage.INITIAL_TYPE_APPROVAL,
        "unit": UnitOfMeasure.TONNE,
        "max_capacity": Decimal("50.000000"),
        "min_capacity": Decimal("0.400000"),  # 20e = 0.4t = 400kg
        "verification_scale_interval": Decimal("0.020000"),  # e = 0.02t = 20kg
        "actual_scale_interval": Decimal("0.020000"),
        "receptor_type": LoadReceptorType.WEIGHBRIDGE,
        "mobility": InstrumentMobility.FIXED,
        "has_level_indicator": True,
        "has_tare_device": True,
        "num_supports": 6,
        "is_multi_interval": False,
        "rulepack_id": "OIML_R76_2006",
        "description": "Pitless Electronic Road Vehicle Weighbridge (Clause A.4.7.4)",
    },
    {
        "serial_number": "IND-BALANCE-320G-004",
        "model_name": "PrecisionAnalytic-320",
        "manufacturer": "Apex Scientific Instruments Corp",
        "accuracy_class": AccuracyClass.CLASS_II,
        "verification_stage": VerificationStage.INITIAL_TYPE_APPROVAL,
        "unit": UnitOfMeasure.GRAM,
        "max_capacity": Decimal("320.000000"),
        "min_capacity": Decimal("0.200000"),  # 20e = 200mg = 0.2g
        "verification_scale_interval": Decimal("0.010000"),  # e = 10mg
        "actual_scale_interval": Decimal("0.001000"),  # d = 1mg (e = 10d)
        "receptor_type": LoadReceptorType.PLATFORM,
        "mobility": InstrumentMobility.PORTABLE,
        "has_level_indicator": True,
        "has_tare_device": True,
        "num_supports": 3,
        "is_multi_interval": False,
        "rulepack_id": "OIML_R76_2006",
        "description": "High Precision Laboratory Analytical Balance (Draft Shield)",
    },
]


# ============================================================================
# SEED ORCHESTRATOR
# ============================================================================


async def seed_database(session: AsyncSession | None = None) -> dict[str, int]:
    """Execute idempotent database seeding.

    Args:
        session: Optional external AsyncSession. If omitted, uses async_session_factory.

    Returns:
        Summary counts of seeded entities: {laboratories, users, weight_sets, instruments, sessions}
    """
    if session is not None:
        return await _run_seed(session)

    async with async_session_factory() as local_session:
        summary = await _run_seed(local_session)
        await local_session.commit()
        return summary


async def _run_seed(session: AsyncSession) -> dict[str, int]:
    """Internal seeding logic using repository pattern."""
    lab_repo = LaboratoryRepository(session)
    user_repo = UserRepository(session)
    equip_repo = EquipmentRepository(session)
    inst_repo = InstrumentRepository(session)
    session_repo = TestSessionRepository(session)

    stats = {
        "laboratories": 0,
        "users": 0,
        "weight_sets": 0,
        "instruments": 0,
        "test_sessions": 0,
    }

    # 1. Seed Laboratories
    lab_map: dict[str, Laboratory] = {}
    for lab_data in LABORATORIES_DATA:
        existing_lab = await lab_repo.get_by_code(lab_data["code"])
        if existing_lab is None:
            lab = Laboratory(**lab_data)
            await lab_repo.create(lab)
            lab_map[lab.code] = lab
            stats["laboratories"] += 1
        else:
            lab_map[existing_lab.code] = existing_lab

    # 2. Seed Users
    user_map: dict[str, User] = {}
    for user_data in USERS_DATA:
        existing_user = await user_repo.get_by_email(user_data["email"])
        if existing_user is None:
            target_lab: Laboratory | None = lab_map.get(user_data["lab_code"])
            user = User(
                email=user_data["email"],
                username=user_data["username"],
                hashed_password=DEFAULT_PASSWORD_HASH,
                full_name=user_data["full_name"],
                designation=user_data["designation"],
                role=user_data["role"],
                laboratory_id=target_lab.id if target_lab else None,
            )
            await user_repo.create(user)
            user_map[user.username] = user
            stats["users"] += 1
        else:
            user_map[existing_user.username] = existing_user

    # 3. Seed Certified Standard Weight Sets
    weight_map: dict[str, StandardWeightSet] = {}
    for ws_data in WEIGHT_SETS_DATA:
        existing_ws = await equip_repo.get_by_code(ws_data["identification_code"])
        if existing_ws is None:
            ws_lab: Laboratory | None = lab_map.get(ws_data["lab_code"])
            ws = StandardWeightSet(
                identification_code=ws_data["identification_code"],
                weight_class=ws_data["weight_class"],
                calibration_certificate_number=ws_data["calibration_certificate_number"],
                calibrated_by=ws_data["calibrated_by"],
                calibration_date=ws_data["calibration_date"],
                validity_date=ws_data["validity_date"],
                nominal_min_value=ws_data["nominal_min_value"],
                nominal_max_value=ws_data["nominal_max_value"],
                unit=ws_data["unit"],
                laboratory_id=ws_lab.id if ws_lab else None,
                expanded_uncertainty_k2=ws_data["expanded_uncertainty_k2"],
            )
            await equip_repo.create(ws)
            weight_map[ws.identification_code] = ws
            stats["weight_sets"] += 1
        else:
            weight_map[existing_ws.identification_code] = existing_ws

    # 4. Seed NAWI Instruments
    inst_map: dict[str, Instrument] = {}
    for inst_data in INSTRUMENTS_DATA:
        existing_inst = await inst_repo.get_by_serial(inst_data["serial_number"])
        if existing_inst is None:
            inst = Instrument(**inst_data)
            await inst_repo.create(inst)
            inst_map[inst.serial_number] = inst
            stats["instruments"] += 1
        else:
            inst_map[existing_inst.serial_number] = existing_inst

    # 5. Seed Benchmark Completed Test Session
    session_num = "TS-2026-BLR-BENCH-001"
    existing_session = await session_repo.get_by_session_number(session_num)
    if existing_session is None and "IND-PLATFORM-60K-002" in inst_map:
        target_inst = inst_map["IND-PLATFORM-60K-002"]
        blr_lab = lab_map.get("RRSL-BLR")
        tester = user_map.get("sk_ramanathan")
        pso = user_map.get("m_sundaram")
        f1_weights = weight_map.get("RRSL-BLR-F1-002")

        if blr_lab and tester and pso and f1_weights:
            session_obj = TestSession(
                session_number=session_num,
                instrument_id=target_inst.id,
                laboratory_id=blr_lab.id,
                operator_id=tester.id,
                reviewer_id=pso.id,
                weight_set_id=f1_weights.id,
                status=TestSessionStatus.APPROVED,
                verification_stage=VerificationStage.INITIAL_TYPE_APPROVAL,
                ambient_temperature_celsius=Decimal("23.00"),
                relative_humidity_percent=Decimal("52.00"),
                atmospheric_pressure_hpa=Decimal("1012.80"),
                notes="Initial Type Approval Evaluation completed conforming to OIML R 76-1:2006.",
                overall_compliance=ComplianceStatus.PASS,
                started_at=datetime(2026, 3, 10, 9, 30, tzinfo=UTC),
                completed_at=datetime(2026, 3, 10, 16, 45, tzinfo=UTC),
            )
            await session_repo.create(session_obj)

            # Add sample observation
            sample_obs = TestObservation(
                session_id=session_obj.id,
                test_type=TestType.WEIGHING_PERFORMANCE,
                sequence_number=1,
                run_number=1,
                position_descriptor="Center",
                nominal_load=Decimal("20.000000"),
                indication_I=Decimal("20.000000"),
                delta_L=Decimal("0.008000"),
                turning_point_P=Decimal("20.002000"),
                calculated_error_E=Decimal("0.002000"),
                corrected_error_Ec=Decimal("0.002000"),
                mpe_limit=Decimal("0.010000"),
                compliance_status=ComplianceStatus.PASS,
                oiml_clause="A.4.4.3",
            )
            await session_repo.add_observation(sample_obs)
            stats["test_sessions"] += 1

    return stats


async def main() -> None:
    """CLI entrypoint for running database seed."""
    logging.basicConfig(level=logging.INFO)
    logger.info("Initializing database tables...")
    await init_db()
    logger.info("Executing statutory database seed...")
    summary = await seed_database()
    logger.info(f"Database seed complete: {summary}")


if __name__ == "__main__":
    asyncio.run(main())
