import os
import sys
import pytest
from fastapi.testclient import TestClient

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from data_loader import load_ofac_list, generate_synthetic_counterparties  # noqa: E402
from matcher import screen_name, screen_all_counterparties, _explain  # noqa: E402
from main import app, con, init_db  # noqa: E402
import mcp_server  # noqa: E402


@pytest.fixture(scope="session", autouse=True)
def setup_db():
    init_db()


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


def test_ofac_data_loading():
    """Verify that OFAC list loads from real CSV into DuckDB with expected volume."""
    cur = con.cursor()
    count = cur.execute("SELECT COUNT(*) FROM sanctions_list").fetchone()[0]
    assert count > 10000, f"Expected >10,000 OFAC entries, got {count}"
    
    sample = cur.execute("SELECT name, sdn_type, program FROM sanctions_list LIMIT 1").fetchone()
    assert sample is not None
    assert len(sample[0]) > 0


def test_synthetic_counterparties_generation():
    """Verify synthetic payment counterparties table structure and decision defaults."""
    cur = con.cursor()
    count = cur.execute("SELECT COUNT(*) FROM counterparties").fetchone()[0]
    assert count == 200

    columns = [col[0] for col in cur.execute("DESCRIBE counterparties").fetchall()]
    for expected in ["id", "name", "decision", "reviewer_notes", "decision_timestamp"]:
        assert expected in columns, f"Missing expected column '{expected}'"


def test_matcher_exact_match():
    """Verify exact match returns 100% confidence score and flags match."""
    cur = con.cursor()
    res = screen_name(cur, "AEROCARIBBEAN AIRLINES", threshold=70.0)
    assert res["match_found"] is True
    assert res["confidence_score"] == 100.0
    assert "Near-exact match" in res["explainability"]
    assert len(res["matches"]) > 0
    assert res["matches"][0]["matched_name"] == "AEROCARIBBEAN AIRLINES"


def test_matcher_fuzzy_reordering_and_typo():
    """Verify token sort ratio catches word order inversion and character mutations."""
    cur = con.cursor()
    # Word reordering
    res_reorder = screen_name(cur, "AIRLINES AEROCARIBBEAN", threshold=70.0)
    assert res_reorder["confidence_score"] == 100.0
    assert res_reorder["match_found"] is True

    # Typo variation
    res_typo = screen_name(cur, "AEROCARIBEAN AIRLNES", threshold=70.0)
    assert res_typo["confidence_score"] >= 85.0
    assert res_typo["match_found"] is True


def test_matcher_clean_entity_clears():
    """Verify clean benign corporate names do not trigger high-confidence sanctions flags."""
    cur = con.cursor()
    res_clean = screen_name(cur, "Pacific Rim Green Energy Logistics Ltd #999", threshold=70.0)
    assert res_clean["confidence_score"] < 70.0
    assert res_clean["match_found"] is False


def test_explainability_logic():
    """Verify plain-language rationales match score categories."""
    assert "high confidence" in _explain("test", {"score": 98.0, "matched_name": "TARGET"})
    assert "Manual compliance review" in _explain("test", {"score": 75.0, "matched_name": "TARGET"})
    assert "below default threshold" in _explain("test", {"score": 55.0, "matched_name": "TARGET"})
    assert "likely benign" in _explain("test", {"score": 30.0, "matched_name": "TARGET"})
    assert "No candidates found" in _explain("test", None)


def test_api_root(client):
    """Verify API root endpoint metadata."""
    res = client.get("/")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "operational"
    assert data["poc_id"] == 57


def test_api_stats_math(client):
    """Verify that total = escalated + cleared across different thresholds."""
    for threshold in [50.0, 70.0, 90.0]:
        res = client.get(f"/stats?threshold={threshold}")
        assert res.status_code == 200
        data = res.json()
        assert data["total"] == data["escalated"] + data["cleared"]
        calculated_rate = round((data["escalated"] / data["total"]) * 100, 1)
        assert data["escalation_rate"] == calculated_rate


def test_api_cases_threshold_sensitivity(client):
    """Verify that lowering threshold increases or maintains escalated count."""
    res_permissive = client.get("/cases?threshold=30")
    res_strict = client.get("/cases?threshold=95")
    assert res_permissive.status_code == 200
    assert res_strict.status_code == 200

    escalated_permissive = sum(1 for c in res_permissive.json() if c["status"] == "escalated")
    escalated_strict = sum(1 for c in res_strict.json() if c["status"] == "escalated")
    assert escalated_permissive >= escalated_strict


def test_api_reviewer_decision_persistence(client):
    """Verify compliance officer review actions persist in the database."""
    # Find a case
    cases = client.get("/cases?threshold=70").json()
    case_to_test = cases[5]
    case_id = case_to_test["id"]

    # Post an escalation decision
    post_res = client.post(
        f"/cases/{case_id}/decision",
        json={"decision": "escalated", "notes": "Sanctions compliance review audit note #101"},
    )
    assert post_res.status_code == 200
    assert post_res.json()["success"] is True
    assert post_res.json()["decision"] == "escalated"

    # Verify reflected in cases queue
    cases_updated = client.get("/cases?threshold=70").json()
    updated_case = next(c for c in cases_updated if c["id"] == case_id)
    assert updated_case["status"] == "escalated"
    assert updated_case["decision"] == "escalated"
    assert "audit note #101" in updated_case["reviewer_notes"]

    # Post a clear decision
    clear_res = client.post(
        f"/cases/{case_id}/decision",
        json={"decision": "cleared", "notes": "Verified false positive against beneficial ownership registry"},
    )
    assert clear_res.status_code == 200
    cases_after_clear = client.get("/cases?threshold=70").json()
    cleared_case = next(c for c in cases_after_clear if c["id"] == case_id)
    assert cleared_case["status"] == "cleared"
    assert cleared_case["decision"] == "cleared"


def test_api_decision_validation_errors(client):
    """Verify 400 on invalid decision value and 404 on nonexistent case ID."""
    bad_val = client.post("/cases/0/decision", json={"decision": "invalid_status"})
    assert bad_val.status_code == 400

    not_found = client.post("/cases/999999/decision", json={"decision": "escalated"})
    assert not_found.status_code == 404


def test_api_export_formats(client):
    """Verify both JSON and CSV exports function and produce valid headers."""
    # JSON export
    json_res = client.get("/export?threshold=70&format=json")
    assert json_res.status_code == 200
    assert isinstance(json_res.json(), list)
    assert len(json_res.json()) == 200

    # CSV export
    csv_res = client.get("/export?threshold=70&format=csv")
    assert csv_res.status_code == 200
    assert "text/csv" in csv_res.headers["content-type"]
    lines = csv_res.text.strip().split("\n")
    assert len(lines) == 201  # Header + 200 records
    assert "Case ID,Counterparty Name,Closest OFAC Candidate" in lines[0]

    # Direct CSV alias
    csv_alias = client.get("/export/csv?threshold=70")
    assert csv_alias.status_code == 200
    assert "attachment" in csv_alias.headers["content-disposition"]


def test_api_source_confidence(client):
    """Verify Source Confidence Panel API returns expected attribution and metrics."""
    res = client.get("/api/source-confidence")
    assert res.status_code == 200
    sources = res.json()
    assert len(sources) >= 2
    ofac = next(s for s in sources if s["id"] == "ofac_sdn")
    assert ofac["confidence"] == 98
    assert "OFAC" in ofac["source"]
    assert ofac["record_count"] > 10000


def test_mcp_server_integration():
    """Verify FastMCP server tools screen real names and return sample entities."""
    # Test screen_name tool
    res = mcp_server.screen_name("AEROCARIBBEAN AIRLINES", threshold=70.0)
    assert res["match_found"] is True
    assert res["confidence_score"] == 100.0

    # Test list_sanctioned_entities tool
    entities = mcp_server.list_sanctioned_entities(limit=5)
    assert len(entities) == 5
    assert "name" in entities[0]
