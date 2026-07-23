import json
import csv
import io
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(title="Stroke Care Network Response Analyser API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MOCK_DATA_PATH = os.path.join(os.path.dirname(__file__), "mock_data.json")

def load_data():
    with open(MOCK_DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

# Cache data
mock_data = load_data()

@app.get("/")
def root():
    return {"status": "ok", "message": "Stroke Care Network Response Analyser API is running."}

@app.get("/api/metadata")
def get_metadata():
    return mock_data["metadata"]

@app.get("/api/scenarios")
def get_scenarios():
    return mock_data["scenarios"]

@app.get("/api/hospitals")
def get_hospitals():
    return mock_data["hospitals"]

@app.get("/api/source-confidence")
def get_source_confidence():
    return mock_data["source_confidence"]

@app.get("/api/scenarios/{scenario_id}")
def get_scenario_details(scenario_id: str):
    hospitals = mock_data["hospitals"]
    
    if scenario_id == "full_network":
        filtered = hospitals
    elif scenario_id == "saudi_region":
        filtered = [h for h in hospitals if h["region"] == "saudi"]
    elif scenario_id == "uae_region":
        filtered = [h for h in hospitals if h["region"] == "uae"]
    elif scenario_id == "critical_gaps":
        filtered = [h for h in hospitals if h["avg_door_to_needle_min"] > 60]
    else:
        raise HTTPException(status_code=404, detail="Scenario not found")

    total_hospitals = len(filtered)
    
    if total_hospitals == 0:
        return {"error": "No hospitals found for this scenario"}

    avg_door_to_needle = round(sum(h["avg_door_to_needle_min"] for h in filtered) / total_hospitals)
    meeting_target = sum(1 for h in filtered if h["avg_door_to_needle_min"] <= 60)
    pct_meeting_60min = round((meeting_target / total_hospitals) * 100, 1)
    
    overall_thrombolysis = round(sum(h["thrombolysis_rate_pct"] for h in filtered) / total_hospitals, 1)
    total_strokes = sum(h["annual_stroke_volume"] for h in filtered)
    
    total_good_outcomes = 0
    total_outcomes = 0
    for h in filtered:
        outcomes = h["mrs_outcomes"]
        good = outcomes.get("0", 0) + outcomes.get("1", 0) + outcomes.get("2", 0)
        total = sum(outcomes.values())
        total_good_outcomes += good
        total_outcomes += total
        
    good_outcome_rate = round((total_good_outcomes / total_outcomes * 100), 1) if total_outcomes > 0 else 0

    metrics = {
        "total_hospitals": total_hospitals,
        "avg_door_to_needle_min": avg_door_to_needle,
        "pct_meeting_60min_target": pct_meeting_60min,
        "overall_thrombolysis_rate": overall_thrombolysis,
        "total_annual_strokes": total_strokes,
        "good_outcome_rate_pct": good_outcome_rate
    }
    
    why_this_matters = (
        f"Stroke treatment is brutally time-sensitive — every minute of delay kills 1.9 million neurons. "
        f"The international guideline target is ≤60 minutes from hospital door to thrombolysis needle. "
        f"Across this Gulf network, only {pct_meeting_60min}% of stroke centres consistently meet that target. "
        f"This dashboard converts raw timestamp data into a live performance map that shows exactly where "
        f"the network is saving brains — and where it is losing them."
    )

    sidebar = {
        "why_this_matters": why_this_matters,
        "who_controls_the_rail": "National health ministries (Saudi MOH, UAE MOHAP, Qatar MOPH) set stroke-centre accreditation standards. Hospital stroke teams control door-to-needle workflows. EMS services control pre-hospital triage and transport routing. The Angels Initiative provides the performance benchmarking framework. No single entity controls the full chain — which is precisely why network-level intelligence is essential.",
        "what_decisions_can_be_made": [
            "Identify hospitals failing the 60-minute DTN target for targeted quality improvement",
            "Reallocate stroke-unit beds from over-capacity to under-served regions",
            "Deploy mobile stroke units to areas with high onset-to-arrival times",
            "Prioritise Angels Initiative certification for underperforming centres"
        ],
        "what_insights_can_be_derived": [
            "Qatar and UAE lead Gulf DTN performance; Saudi rural centres lag significantly",
            "Thrombolysis rates are improving but remain below international benchmarks (>20%)",
            "Hospitals with thrombectomy capability show 15% better 90-day outcomes",
            "Night/weekend DTN times are 22% longer than weekday daytime"
        ]
    }

    return {
        "scenario_id": scenario_id,
        "metrics": metrics,
        "hospitals": filtered,
        "dtn_distribution": mock_data["dtn_distribution"],
        "thrombolysis_trend": mock_data["thrombolysis_trend"],
        "outcome_distribution": mock_data["outcome_distribution"],
        "impact_chain": mock_data["impact_chain"],
        "sidebar": sidebar
    }

@app.get("/api/download/{scenario_id}")
def download_scenario_csv(scenario_id: str):
    hospitals = mock_data["hospitals"]
    
    if scenario_id == "full_network":
        filtered = hospitals
    elif scenario_id == "saudi_region":
        filtered = [h for h in hospitals if h["region"] == "saudi"]
    elif scenario_id == "uae_region":
        filtered = [h for h in hospitals if h["region"] == "uae"]
    elif scenario_id == "critical_gaps":
        filtered = [h for h in hospitals if h["avg_door_to_needle_min"] > 60]
    else:
        raise HTTPException(status_code=404, detail="Scenario not found")

    if not filtered:
        raise HTTPException(status_code=404, detail="No data to download")
        
    output = io.StringIO()
    # Flatten the dict structure for CSV
    fieldnames = [
        "id", "name", "city", "country", "region", "lat", "lng", 
        "stroke_unit_beds_total", "stroke_unit_beds_available", 
        "has_thrombolysis", "has_thrombectomy", "annual_stroke_volume", 
        "avg_door_to_needle_min", "thrombolysis_rate_pct", "angels_status"
    ]
    
    writer = csv.DictWriter(output, fieldnames=fieldnames)
    writer.writeheader()
    
    for h in filtered:
        row = {k: v for k, v in h.items() if k in fieldnames}
        writer.writerow(row)
        
    output.seek(0)
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=stroke_network_{scenario_id}.csv"}
    )
