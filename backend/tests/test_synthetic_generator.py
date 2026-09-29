"""Unit & Integration Tests for 1-Click Synthetic Metrological Edge-Case Generator (Step 26).

Verifies:
- Authentic OIML R 76-1 calculations across 5 curated metrological stress scenarios
- Rounding Discrepancy Trap (Naive I - L = PASS vs True P = FAIL)
- Temperature drift at 40°C chamber run
- Eccentricity platform cantilever twist on Corner 5
- Class I analytical balance with n = 120,000 and sub-milligram Decimal precision
- API endpoints: GET /api/v1/sessions/scenarios and POST /api/v1/sessions/load-scenario/{id}
"""

from __future__ import annotations

import pytest
from httpx import ASGITransport, AsyncClient

from app.core.synthetic_generator import (
    generate_scenario_1,
    generate_scenario_2,
    generate_scenario_3,
    generate_scenario_4,
    generate_scenario_5,
    get_all_scenarios,
    get_scenario_by_id,
)
from app.main import app


# ============================================================================
# Pure Core Generator Tests
# ============================================================================


def test_scenario_registry_loads_all_five_scenarios() -> None:
    """Ensure registry contains all 5 curated scenarios with unique IDs."""
    scenarios = get_all_scenarios()
    assert len(scenarios) == 5
    expected_ids = [
        "standard_class_iii_retail",
        "rounding_discrepancy_trap",
        "temperature_span_drift_fail",
        "eccentricity_cantilever_twist",
        "high_interval_class_i_analytical",
    ]
    for sid in expected_ids:
        assert sid in scenarios
        s = get_scenario_by_id(sid)
        assert s is not None
        assert s.id == sid
        assert s.observations_count >= 30
        assert len(s.weighing_observations) >= 20
        assert len(s.eccentricity_observations) >= 4


def test_scenario_1_standard_retail_baseline() -> None:
    """Scenario 1: Class III retail scale must pass all weighing and eccentricity tests."""
    s1 = generate_scenario_1()
    assert s1.accuracy_class == "CLASS_III"
    assert s1.expected_verdict == "PASS"
    assert s1.max_capacity == 30000.0
    assert s1.e == 5.0
    assert s1.n == 6000
    assert s1.observations_count == 31
    assert len(s1.weighing_observations) >= 20
    assert len(s1.eccentricity_observations) == 5

    # Check zero point
    zero_obs = s1.weighing_observations[0]
    assert zero_obs.target_load == 0.0
    assert zero_obs.is_zero_point is True
    assert zero_obs.status == "PASS"

    # All weighing observations must PASS
    for obs in s1.weighing_observations:
        assert obs.status == "PASS"
        assert abs(obs.corrected_error) <= obs.mpe_limit

    # All eccentricity observations must PASS
    for corner in s1.eccentricity_observations:
        assert corner.status == "PASS"
        assert abs(corner.corrected_error) <= corner.mpe_limit


def test_scenario_2_rounding_discrepancy_trap() -> None:
    """Scenario 2 (Hackathon Highlight): Naive I - L says PASS, but OIML P catches FAIL."""
    s2 = generate_scenario_2()
    assert s2.accuracy_class == "CLASS_III"
    assert s2.expected_verdict == "FAIL"
    assert s2.observations_count == 31
    assert s2.rounding_trap_highlight is not None

    trap = s2.rounding_trap_highlight
    assert trap["step"] == 7
    assert trap["target_load"] == 10000.0
    assert trap["auxiliary_weight_delta_l"] == 7.8
    assert trap["naive_calculation"]["computed_error"] == 0.0
    assert "PASS" in trap["naive_calculation"]["verdict"]
    assert trap["oiml_statutory_calculation"]["computed_error"] == -5.3
    assert "FAIL" in trap["oiml_statutory_calculation"]["verdict"]

    # Check row 7 directly
    row_7 = s2.weighing_observations[6]
    assert row_7.step == 7
    assert row_7.target_load == 10000.0
    assert row_7.indication == 10000.0
    assert row_7.auxiliary_load == 7.8
    assert row_7.true_indication == 9994.7
    assert row_7.corrected_error == -5.3
    assert row_7.mpe_limit == 5.0
    assert row_7.status == "FAIL"
    assert row_7.naive_error == 0.0
    assert row_7.naive_status == "PASS"


def test_scenario_3_temperature_drift_fail() -> None:
    """Scenario 3: Thermal coefficient drift causes MPE violation at high loads."""
    s3 = generate_scenario_3()
    assert s3.expected_verdict == "FAIL"
    assert "40°C" in s3.title or "40°C" in s3.description

    # Find failing observation at or near Max
    failing_obs = [obs for obs in s3.weighing_observations if obs.status == "FAIL"]
    assert len(failing_obs) > 0

    max_load_obs = next(obs for obs in s3.weighing_observations if obs.target_load == 15000.0)
    assert max_load_obs.status == "FAIL"
    assert abs(max_load_obs.corrected_error) > max_load_obs.mpe_limit


def test_scenario_4_eccentricity_cantilever_twist() -> None:
    """Scenario 4: Corner 5 exceeds MPE due to platform mechanical torque."""
    s4 = generate_scenario_4()
    assert s4.expected_verdict == "FAIL"

    corner_fails = [c for c in s4.eccentricity_observations if c.status == "FAIL"]
    assert len(corner_fails) >= 1
    # Corner 5 (Right-Rear) should be the failing corner
    corner_5 = next(c for c in s4.eccentricity_observations if c.position_number == 5)
    assert corner_5.status == "FAIL"
    assert abs(corner_5.corrected_error) > corner_5.mpe_limit


def test_scenario_5_high_interval_class_i_analytical() -> None:
    """Scenario 5: Special Accuracy Class I balance with n = 120,000."""
    s5 = generate_scenario_5()
    assert s5.accuracy_class == "CLASS_I"
    assert s5.expected_verdict == "PASS"
    assert s5.n == 120000
    assert s5.e == 0.001
    assert s5.d == 0.0001
    assert s5.max_capacity == 120.0
    assert s5.observations_count == 31
    assert len(s5.weighing_observations) >= 20
    assert len(s5.eccentricity_observations) == 5

    for obs in s5.weighing_observations:
        assert obs.status == "PASS"
        assert abs(obs.corrected_error) <= obs.mpe_limit


# ============================================================================
# API Endpoint Integration Tests
# ============================================================================


@pytest.mark.asyncio
async def test_api_list_scenarios() -> None:
    """Test GET /api/v1/sessions/scenarios returns all 5 scenario summaries."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/sessions/scenarios")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 5
        scenario_ids = [item["id"] for item in data]
        assert "rounding_discrepancy_trap" in scenario_ids
        assert "standard_class_iii_retail" in scenario_ids


@pytest.mark.asyncio
async def test_api_get_scenario_by_id() -> None:
    """Test GET /api/v1/sessions/scenarios/{id} returns full scenario."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Valid ID
        res = await client.get("/api/v1/sessions/scenarios/rounding_discrepancy_trap")
        assert res.status_code == 200
        data = res.json()
        assert data["id"] == "rounding_discrepancy_trap"
        assert data["observations_count"] == 31
        assert len(data["weighing_observations"]) >= 20
        assert len(data["eccentricity_observations"]) == 5
        assert data["rounding_trap_highlight"]["step"] == 7

        # Invalid ID
        res_404 = await client.get("/api/v1/sessions/scenarios/non_existent_scenario")
        assert res_404.status_code == 404


@pytest.mark.asyncio
async def test_api_load_scenario_endpoint() -> None:
    """Test POST /api/v1/sessions/load-scenario/{id} loads scenario and returns hydrated session."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.post("/api/v1/sessions/load-scenario/rounding_discrepancy_trap")
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert data["observations_loaded"] >= 30
        assert "session_id" in data
        assert "session_number" in data
        assert data["scenario"]["id"] == "rounding_discrepancy_trap"
        assert data["scenario"]["observations_count"] == 31
