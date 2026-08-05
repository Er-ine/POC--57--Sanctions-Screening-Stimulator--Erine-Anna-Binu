from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import duckdb

from data_loader import load_ofac_list, generate_synthetic_counterparties
from matcher import screen_name, screen_all_counterparties

app = FastAPI(title="Sanctions Screening Simulator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

con = duckdb.connect(database=":memory:")


@app.on_event("startup")
def startup():
    load_ofac_list(con)
    generate_synthetic_counterparties(con)


@app.get("/screen")
def screen(name: str, threshold: float = 70.0):
    cur = con.cursor()
    return screen_name(cur, name, threshold)


@app.get("/cases")
def cases(threshold: float = Query(70.0)):
    cur = con.cursor()
    return screen_all_counterparties(cur, threshold)


@app.get("/export")
def export():
    cur = con.cursor()
    df = cur.execute("SELECT * FROM counterparties").df()
    return df.to_dict(orient="records")


@app.get("/stats")
def stats(threshold: float = 70.0):
    cur = con.cursor()
    cases = screen_all_counterparties(cur, threshold)
    escalated = sum(1 for c in cases if c["status"] == "escalated")
    return {
        "total": len(cases),
        "escalated": escalated,
        "cleared": len(cases) - escalated,
        "escalation_rate": round(escalated / len(cases) * 100, 1) if cases else 0,
    }
