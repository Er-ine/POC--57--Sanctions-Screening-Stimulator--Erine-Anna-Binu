"""
Real Rails Intelligence: Weather-to-Supply Chain Risk Model
FastAPI Backend — POC 35

This backend serves structured intelligence data for the Real Rails dashboard.
It follows the Real Rails Master Manifesto: Backend First, Mock Fallback, .env for secrets.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import json
import os
import io
import csv
from typing import Optional

app = FastAPI(
    title="Real Rails Intelligence API",
    description="Weather-to-Supply Chain Risk Model — POC 35",
    version="1.0.0",
)

# CORS — Allow the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# DATA LOADING (Mock Fallback per Manifesto)
# ─────────────────────────────────────────────
MOCK_DATA_PATH = os.path.join(os.path.dirname(__file__), "mock_data.json")

_cached_data = None

def load_data():
    """Load mock data with caching. Implements the Manifesto Mock Fallback rule."""
    global _cached_data
    if _cached_data is not None:
        return _cached_data
    if not os.path.exists(MOCK_DATA_PATH):
        raise HTTPException(
            status_code=500,
            detail="CRITICAL: mock_data.json not found. The Mock Fallback has failed.",
        )
    with open(MOCK_DATA_PATH, "r", encoding="utf-8") as f:
        _cached_data = json.load(f)
    return _cached_data


def _get_route_details(data, route_id: str):
    """Look up the full supply route by ID."""
    for route in data["supply_routes"]:
        if route["id"] == route_id:
            return route
    return None


# ─────────────────────────────────────────────
# API ENDPOINTS
# ─────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "operational", "project": "Real Rails Intelligence — POC 35"}


@app.get("/api/metadata")
def get_metadata():
    """Returns project metadata and data labeling."""
    data = load_data()
    return data["metadata"]


@app.get("/api/weather-events")
def get_weather_events():
    """Returns all weather events in the system."""
    data = load_data()
    return data["weather_events"]


@app.get("/api/supply-routes")
def get_supply_routes():
    """Returns all global supply routes with waypoints for map rendering."""
    data = load_data()
    return data["supply_routes"]


@app.get("/api/scenarios")
def get_all_scenarios():
    """Returns scenario summaries for the UI toggles."""
    data = load_data()
    return [
        {
            "id": s["id"],
            "name": s["name"],
            "description": s["description"],
            "metrics": s["metrics"],
        }
        for s in data["scenarios"]
    ]


@app.get("/api/scenarios/{scenario_id}")
def get_scenario(scenario_id: str):
    """
    Returns the full intelligence payload for a specific scenario.
    This endpoint powers the entire dashboard: Main Stage + Intelligence Sidebar.
    """
    data = load_data()

    # Find the scenario
    scenario = None
    for s in data["scenarios"]:
        if s["id"] == scenario_id:
            scenario = s
            break
    if scenario is None:
        raise HTTPException(status_code=404, detail=f"Scenario '{scenario_id}' not found.")

    # Enrich routes with full supply route details
    enriched_routes = []
    for route_impact in scenario["routes"]:
        route_detail = _get_route_details(data, route_impact["route_id"])
        if route_detail:
            enriched = {**route_detail, **route_impact}
            # Intelligence transformation: calculate % lead time increase
            if route_detail["base_lead_time_days"] > 0:
                enriched["lead_time_increase_pct"] = round(
                    (route_impact["delay_days"] / route_detail["base_lead_time_days"]) * 100, 1
                )
            else:
                enriched["lead_time_increase_pct"] = 0
            enriched_routes.append(enriched)

    # Get active weather events
    active_events = [
        e for e in data["weather_events"] if e["id"] in scenario.get("active_events", [])
    ]

    # Get delay timeline for this scenario
    timeline = data["delay_timeline"].get(scenario_id, [])

    # Build the Intelligence Sidebar payload
    sidebar = {
        "title": scenario["name"],
        "high_level_metric": f"${scenario['metrics']['total_value_at_risk_usd']:,.0f}",
        "metric_label": "Total Value at Risk",
        "why_this_matters": (
            "This is where data rails become operating rails. "
            "A single weather event can cascade through global logistics networks, "
            f"causing up to {scenario['metrics']['downstream_manufacturing_impact_days']} days "
            "of downstream manufacturing delays. Understanding these propagation patterns "
            "transforms meteorological data into actionable supply chain intelligence."
        ),
        "who_controls_the_rail": (
            "Governments control the meteorological data rails (NOAA, national weather services). "
            "Global logistics conglomerates (Maersk, MSC, CMA CGM) control the physical routing. "
            "Digital freight brokers and port authorities determine alternative capacity allocation. "
            "No single entity controls the full chain — which is precisely the systemic risk."
        ),
        "what_decisions_can_be_made": (
            "• Reroute critical shipments to unaffected secondary ports.\n"
            "• Expedite downstream manufacturing orders before backlog hits.\n"
            "• Trigger contingent business interruption insurance claims."
        ),
        "what_insights_can_be_derived": (
            "The data shows a predictable cascade: weather events trigger port closures, "
            "leading to vessel rerouting and capacity backlogs. This extends "
            f"lead times and ultimately creates {scenario['metrics']['downstream_manufacturing_impact_days']} days "
            "of manufacturing delays downstream."
        ),
    }

    return {
        "scenario": {
            "id": scenario["id"],
            "name": scenario["name"],
            "description": scenario["description"],
            "metrics": scenario["metrics"],
        },
        "routes": enriched_routes,
        "weather_events": active_events,
        "delay_timeline": timeline,
        "sidebar": sidebar,
    }


@app.get("/api/impact-chain")
def get_impact_chain():
    """Returns the event impact chain stages for the visualization."""
    data = load_data()
    return data["impact_chain"]["stages"]


@app.get("/api/source-confidence")
def get_source_confidence():
    """Returns confidence ratings for each data source (Source Confidence Panel)."""
    data = load_data()
    return data["source_confidence"]


@app.get("/api/download/{scenario_id}")
def download_scenario_csv(scenario_id: str):
    """
    Download sample data as CSV for a given scenario.
    Implements the Manifesto requirement: 'Download Sample Data button'.
    """
    data = load_data()

    scenario = None
    for s in data["scenarios"]:
        if s["id"] == scenario_id:
            scenario = s
            break
    if scenario is None:
        raise HTTPException(status_code=404, detail="Scenario not found.")

    # Build CSV
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Route ID", "Route Name", "Origin", "Destination", "Commodity",
        "Base Lead Time (Days)", "Delay (Days)", "Status",
        "Daily Volume (USD)", "Delay Cost (USD)", "Confidence"
    ])

    for route_impact in scenario["routes"]:
        route_detail = _get_route_details(data, route_impact["route_id"])
        if route_detail:
            writer.writerow([
                route_detail["id"],
                route_detail["name"],
                route_detail["origin"]["port"],
                route_detail["destination"]["port"],
                route_detail["commodity"],
                route_detail["base_lead_time_days"],
                route_impact["delay_days"],
                route_impact["status"],
                route_detail["daily_volume_usd"],
                route_impact["delay_cost_usd"],
                route_impact["confidence"],
            ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=realrails_poc35_{scenario_id}.csv"},
    )
