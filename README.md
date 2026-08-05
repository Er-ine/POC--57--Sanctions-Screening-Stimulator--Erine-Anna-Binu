# Sanctions Screening Simulator

**Governance & Trust — Real Rails Intelligence Library**
**Batch 6 · POC-57**

## Project Overview

A production-style demo of a sanctions compliance screening workflow: fuzzy name matching against the real OFAC sanctions list, explainable confidence scoring, and a reviewer-facing case queue with filtering, search, and detail drill-down. Built to feel like an internal compliance tool, not a static report — every number on the dashboard is live and reacts to the fuzzy-match threshold in real time.

## Problem Statement

Financial institutions are legally required to screen counterparties against government sanctions lists (such as OFAC's SDN list) before transacting with them. Exact-name matching alone is insufficient: sanctioned entities and individuals appear under misspellings, transliterations, reordered names, and deliberate obfuscation. A screening system needs to:

- Catch near-matches, not just exact ones
- Give a human reviewer enough context (a confidence score *and* a plain-language explanation) to make a fast, defensible decision
- Let the reviewer tune sensitivity (threshold) rather than hard-coding a single cutoff, since the right balance between false positives and missed matches depends on institutional risk appetite

This project simulates that workflow end-to-end: real sanctions data in, an adjustable fuzzy-matching engine in the middle, and an actionable case queue out.

## Architecture Summary

Two-tier architecture: FastAPI backend (data ingestion + fuzzy matching) and a Next.js/TypeScript frontend (dashboard).

```
Frontend (Next.js/TS, localhost:3000)
        |  HTTP/JSON
        v
Backend (FastAPI, localhost:8000)
        |
        v
DuckDB (in-memory): sanctions_list, counterparties
        |
        v
OFAC SDN CSV (backend/data/ofac_sdn.csv)
```

- **Backend:** FastAPI serves `/screen`, `/cases`, `/stats`, `/export`. On startup it loads the real OFAC SDN CSV into DuckDB and generates synthetic payment counterparties (including deliberate name variants of real sanctioned entities) to exercise the matcher. Matching uses RapidFuzz token-sort-ratio scoring; each request gets its own DuckDB cursor to stay thread-safe under FastAPI's concurrent request handling.
- **Frontend:** Next.js App Router + Tailwind. `page.tsx` fetches cases/stats on load and on threshold change; status/search filtering happens client-side against the fetched case list. Components: `ScreeningTable`, `CaseFilters`, `CaseDetailModal`, `MatchDistributionChart`, `ThresholdSlider`, `InfoPanel`.

Full detail in [ARCHITECTURE.md](./ARCHITECTURE.md).

## Setup Instructions

**Backend:**
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload
```
Runs at `http://localhost:8000`. Requires `backend/data/ofac_sdn.csv` — download from https://sanctionslist.ofac.treas.gov/ and place it at that path.

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```
Runs at `http://localhost:3000`.

Both servers must be running simultaneously, in separate terminals, for the dashboard to load data.

## Screenshots

> Add screenshots to a `/screenshots` folder in the repo and reference them below, e.g.:
>
> ![Dashboard overview](./screenshots/dashboard-overview.png)
> ![Case detail modal](./screenshots/case-detail.png)
> ![Filtered case queue](./screenshots/filtered-queue.png)
> ![Mobile responsive view](./screenshots/mobile-view.png)

## AI Usage Summary

AI (Claude) was used as an implementation accelerator across scaffolding, debugging, design review (VAR), and documentation drafting. All AI-suggested changes were tested against the running application before being accepted — via terminal output, direct API calls, and visual verification — rather than accepted on faith. Debugging followed the Repomix protocol: sharing terminal logs, stack traces, and screenshots for each real issue rather than describing symptoms from memory. Full detail in [AI_USAGE.md](./AI_USAGE.md).

## Future Enhancements

- Wire the case detail modal's "Escalate" / "Clear" buttons to a real backend endpoint that persists reviewer decisions (currently UI-only)
- Add a downloadable CSV export of the filtered case queue (spec requirement, not yet built)
- Persist filter/threshold state in the URL so a specific view can be shared or bookmarked
- Move from in-memory DuckDB to a persisted store so case decisions survive a backend restart
- Add authentication/role-based access appropriate for a real compliance tool (out of scope for this demo)
- Replace the hand-rolled bar chart with a full charting library (Plotly/ECharts, as specified in the original stack) for richer interactivity

## Project Structure

```
backend/
  main.py               - FastAPI app, routes
  data_loader.py          - OFAC CSV ingestion, synthetic data generation
  matcher.py               - fuzzy matching + explainability logic
  data/ofac_sdn.csv         - OFAC SDN list

frontend/
  app/page.tsx                          - main dashboard
  components/ScreeningTable.tsx          - case queue table
  components/CaseFilters.tsx              - status + search filters
  components/CaseDetailModal.tsx          - case detail view
  components/MatchDistributionChart.tsx    - score distribution chart
  components/ThresholdSlider.tsx           - fuzzy-match threshold control
  components/InfoPanel.tsx                 - "Why this matters" / "Who controls the rail"
  lib/api.ts                                - backend API client
```

## Documentation

- [VAR_REPORT.md](./VAR_REPORT.md) — Visualization Audit Review
- [UAT_CHECKLIST.md](./UAT_CHECKLIST.md) — Functional UAT checklist
- [ARCHITECTURE.md](./ARCHITECTURE.md) — Architecture summary
- [AI_USAGE.md](./AI_USAGE.md) — AI usage summary
