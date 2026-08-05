# Sanctions Screening Simulator

**Governance & Trust — Real Rails Intelligence Library**
**Batch 6 · POC-57**

A production-style demo of a sanctions screening workflow: fuzzy name matching against the OFAC sanctions list, explainable confidence scoring, and a compliance case queue with filtering and detail review.

## What it does

- Screens synthetic payment counterparties against the real OFAC SDN sanctions list
- Uses fuzzy string matching (RapidFuzz) to catch name variants, typos, and aliases — not just exact matches
- Assigns a confidence score (0–100) and a plain-language explainability note to every case
- Lets a reviewer adjust the match threshold live and see the case queue update in real time
- Provides a case queue with status filtering, search, and a click-through detail view

## Why it matters

Sanctions screening is a real compliance requirement for financial institutions: transacting with a sanctioned individual or entity — even unknowingly — carries serious legal and financial risk. Exact-match screening misses spelling variants and aliases; fuzzy matching catches more of these while still requiring human judgment on borderline cases, which is why every match includes an explanation, not just a score.

## Stack

**Backend:** FastAPI, Pandas, DuckDB, RapidFuzz
**Frontend:** Next.js, TypeScript, Tailwind CSS

## Running locally

**Backend:**
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload
```
Runs at `http://localhost:8000`. Requires `backend/data/ofac_sdn.csv` (OFAC SDN list, downloaded from https://sanctionslist.ofac.treas.gov/).

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```
Runs at `http://localhost:3000`.

Both must be running simultaneously for the dashboard to load data.

## Data sources

- **OFAC Sanctions List (SDN)** — real, public sanctions data
- **Synthetic payment counterparties** — generated locally, includes deliberate name variants of sanctioned entities (typos, reordering, character substitution) to exercise the fuzzy-matching logic, plus clean/unrelated names as negative controls

## Project structure

```
backend/
  main.py            — FastAPI app, routes
  data_loader.py      — OFAC CSV ingestion, synthetic data generation
  matcher.py          — fuzzy matching + explainability logic
  data/ofac_sdn.csv    — OFAC SDN list (not committed if large; see Deployment Notes)

frontend/
  app/page.tsx                       — main dashboard
  components/ScreeningTable.tsx      — case queue table
  components/CaseFilters.tsx          — status + search filters
  components/CaseDetailModal.tsx      — case detail view
  components/MatchDistributionChart.tsx — score distribution chart
  components/ThresholdSlider.tsx      — fuzzy-match threshold control
  components/InfoPanel.tsx            — "Why this matters" / "Who controls the rail"
  lib/api.ts                          — backend API client
```

## Documentation

- [VAR_REPORT.md](./VAR_REPORT.md) — Visualization Audit Review
- [UAT_CHECKLIST.md](./UAT_CHECKLIST.md) — Functional UAT checklist
- [ARCHITECTURE.md](./ARCHITECTURE.md) — Architecture summary
- [AI_USAGE.md](./AI_USAGE.md) — AI usage summary
