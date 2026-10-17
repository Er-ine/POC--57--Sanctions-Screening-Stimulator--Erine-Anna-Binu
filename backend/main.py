import csv
import io
import datetime
from contextlib import asynccontextmanager
from typing import Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
import duckdb

from data_loader import load_ofac_list, generate_synthetic_counterparties
from matcher import screen_name, screen_all_counterparties

# In-memory DuckDB instance
con = duckdb.connect(database=":memory:")


def init_db():
    """Initializes OFAC sanctions list and synthetic counterparties in DuckDB."""
    load_ofac_list(con)
    generate_synthetic_counterparties(con)


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="Sanctions Screening Simulator API",
    description="Real Rails Batch 6 (POC-57) — Compliance Screening Engine & Reviewer Queue",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class DecisionRequest(BaseModel):
    decision: str = Field(
        ...,
        description="Reviewer decision: 'escalated', 'cleared', or 'in_review'",
        examples=["escalated", "cleared"],
    )
    notes: Optional[str] = Field(
        default="", description="Compliance reviewer notes or rationale"
    )


@app.get("/")
def root():
    return {
        "status": "operational",
        "service": "Sanctions Screening Simulator API",
        "poc_id": 57,
        "author": "Erine Anna Binu",
        "library": "Real Rails Intelligence Library — Governance & Trust",
    }


@app.get("/screen")
def screen(name: str, threshold: float = 70.0):
    """
    Screen a single counterparty name against the OFAC sanctions list.
    Returns fuzzy similarity scores and candidate matches.
    """
    cur = con.cursor()
    return screen_name(cur, name, threshold)


@app.get("/cases")
def cases(threshold: float = Query(70.0, ge=0.0, le=100.0)):
    """
    Screen all payment counterparties in the system at the given threshold.
    Returns the compliance case queue.
    """
    cur = con.cursor()
    return screen_all_counterparties(cur, threshold)


@app.get("/stats")
def stats(threshold: float = Query(70.0, ge=0.0, le=100.0)):
    """
    Aggregate queue metrics based on the current threshold and reviewer decisions.
    """
    cur = con.cursor()
    case_list = screen_all_counterparties(cur, threshold)
    total = len(case_list)
    escalated = sum(1 for c in case_list if c["status"] == "escalated")
    cleared = total - escalated
    rate = round(escalated / total * 100, 1) if total > 0 else 0.0

    return {
        "total": total,
        "escalated": escalated,
        "cleared": cleared,
        "escalation_rate": rate,
        "threshold": threshold,
    }


@app.post("/cases/{case_id}/decision")
def record_decision(case_id: int, payload: DecisionRequest):
    """
    Persist an analyst review decision ('escalated' or 'cleared')
    with timestamp and audit notes into the DuckDB database.
    """
    decision = payload.decision.lower().strip()
    if decision not in ["escalated", "cleared", "in_review", "pending"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid decision. Must be 'escalated', 'cleared', or 'in_review'.",
        )

    cur = con.cursor()
    check = cur.execute(
        "SELECT id, name FROM counterparties WHERE id = ?", [case_id]
    ).fetchall()
    if not check:
        raise HTTPException(
            status_code=404, detail=f"Case with ID {case_id} not found."
        )

    timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()
    cur.execute(
        """
        UPDATE counterparties
        SET decision = ?, reviewer_notes = ?, decision_timestamp = ?
        WHERE id = ?
        """,
        [decision, payload.notes or "", timestamp, case_id],
    )

    updated_row = cur.execute(
        "SELECT id, name, decision, reviewer_notes, decision_timestamp FROM counterparties WHERE id = ?",
        [case_id],
    ).df()

    return {
        "success": True,
        "case_id": case_id,
        "decision": decision,
        "notes": payload.notes,
        "decision_timestamp": timestamp,
        "counterparty": updated_row.to_dict(orient="records")[0],
    }


@app.get("/export")
def export(
    threshold: float = Query(70.0, ge=0.0, le=100.0),
    format: str = Query("json", pattern="^(json|csv)$"),
):
    """
    Export the screened case queue as JSON or streaming CSV.
    Implements the Real Rails Master Manifesto 'Download Sample Data' requirement.
    """
    cur = con.cursor()
    case_list = screen_all_counterparties(cur, threshold)

    if format.lower() == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(
            [
                "Case ID",
                "Counterparty Name",
                "Closest OFAC Candidate",
                "Confidence Score",
                "Effective Status",
                "Algorithm Status",
                "Reviewer Decision",
                "Reviewer Notes",
                "Decision Timestamp",
                "Explainability",
            ]
        )
        for c in case_list:
            writer.writerow(
                [
                    c["id"],
                    c["name"],
                    c.get("matched_name", ""),
                    c["confidence_score"],
                    c["status"],
                    c.get("auto_status", ""),
                    c.get("decision", "pending"),
                    c.get("reviewer_notes", ""),
                    c.get("decision_timestamp", ""),
                    c["explainability"],
                ]
            )
        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=sanctions_screening_cases_t{int(threshold)}.csv"
            },
        )

    return case_list


@app.get("/export/csv")
def export_csv(threshold: float = Query(70.0, ge=0.0, le=100.0)):
    """Direct alias for CSV export."""
    return export(threshold=threshold, format="csv")


@app.get("/api/source-confidence")
def source_confidence():
    """
    Returns data provenance and confidence ratings for the intelligence layer.
    Complies with the Real Rails Master Manifesto requirement for source attribution.
    """
    cur = con.cursor()
    # Check if tables exist, if not initialize
    try:
        ofac_count = cur.execute("SELECT COUNT(*) FROM sanctions_list").fetchone()[0]
        syn_count = cur.execute("SELECT COUNT(*) FROM counterparties").fetchone()[0]
    except Exception:
        init_db()
        ofac_count = cur.execute("SELECT COUNT(*) FROM sanctions_list").fetchone()[0]
        syn_count = cur.execute("SELECT COUNT(*) FROM counterparties").fetchone()[0]

    return [
        {
            "id": "ofac_sdn",
            "source": "U.S. Department of the Treasury (OFAC)",
            "dataset": "Specially Designated Nationals (SDN) List",
            "type": "Official Regulatory Dataset",
            "confidence": 98,
            "freshness": "Active Edition (19,000+ entities)",
            "record_count": int(ofac_count),
            "attribution": "Direct Ingestion via Official SDN CSV",
        },
        {
            "id": "synthetic_generator",
            "source": "Real Rails Synthetic Counterparty Engine",
            "dataset": "Adversarial Typology & Mutation Generator",
            "type": "Simulated Payment Rail Feed",
            "confidence": 85,
            "freshness": "Generated at Startup",
            "record_count": int(syn_count),
            "attribution": "Rule-Based Typologies (Transliterations, Typos, Reordering)",
        },
    ]


@app.post("/reset")
def reset_database():
    """Reset synthetic counterparties and decisions to fresh initial state."""
    generate_synthetic_counterparties(con)
    return {"status": "reset_successful"}
