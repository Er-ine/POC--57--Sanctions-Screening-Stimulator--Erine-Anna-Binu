# Architecture Summary — Sanctions Screening Simulator
 
## Overview
 
Two-tier architecture: a Python/FastAPI backend performing data ingestion and fuzzy matching, and a Next.js/TypeScript frontend rendering the dashboard and consuming the backend's JSON API.
 
```
┌─────────────────────┐         HTTP/JSON          ┌──────────────────────┐
│   Frontend           │  ────────────────────────▶ │   Backend             │
│   Next.js + TS        │  ◀──────────────────────── │   FastAPI              │
│   localhost:3000      │                             │   localhost:8000       │
└─────────────────────┘                              └──────────┬───────────┘
                                                                   │
                                                        ┌──────────▼───────────┐
                                                        │   DuckDB (in-memory)   │
                                                        │   - sanctions_list     │
                                                        │   - counterparties     │
                                                        └──────────┬───────────┘
                                                                   │
                                                        ┌──────────▼───────────┐
                                                        │   OFAC SDN CSV         │
                                                        │   (data/ofac_sdn.csv)  │
                                                        └────────────────────────┘
```
 
## Backend
 
**Framework:** FastAPI
**Data layer:** DuckDB (in-memory, loaded fresh on startup)
**Matching engine:** RapidFuzz (token-sort-ratio fuzzy string matching)
 
On startup, the backend:
1. Loads the OFAC SDN CSV into a `sanctions_list` table
2. Generates a synthetic `counterparties` table — a mix of clean names and deliberately mutated variants of real sanctioned names (character substitution, reordering, truncation) to exercise fuzzy matching
Each request opens its own DuckDB cursor (`con.cursor()`) off the shared in-memory connection, avoiding cross-request state corruption under concurrent access.
 
**Endpoints:**
| Route | Purpose |
|---|---|
| `GET /screen?name=&threshold=` | Screen a single name against the sanctions list |
| `GET /cases?threshold=` | Screen all synthetic counterparties, return case list |
| `GET /stats?threshold=` | Aggregate counts (total / escalated / cleared / rate) |
| `GET /export` | Raw counterparty dataset for download |
 
Matching logic (`matcher.py`) returns, per case: the matched name, a 0–100 confidence score, a boolean `match_found` against the current threshold, and a human-readable `explainability` string describing why the match was or wasn't flagged.
 
## Frontend
 
**Framework:** Next.js (App Router) + TypeScript + Tailwind CSS
**State:** React `useState`/`useEffect`/`useMemo`, no external state library — appropriate for this scope (single page, no cross-page shared state)
 
`app/page.tsx` is the composition root: it fetches cases/stats from the backend on mount and whenever the threshold changes, and derives the filtered case list client-side (status + search) via `useMemo` rather than re-querying the backend for every keystroke.
 
Component breakdown:
- `ScreeningTable` — renders the case queue, handles loading skeleton and empty states, row click delegates to a parent-controlled modal
- `CaseFilters` — status toggle + search input, fully controlled by parent state
- `CaseDetailModal` — case detail view, currently presentational (Escalate/Clear buttons not yet wired to a backend mutation)
- `MatchDistributionChart` — client-side histogram bucketing of confidence scores, no charting library dependency (hand-rolled bars for this MVP)
- `ThresholdSlider`, `InfoPanel` — presentational
## Data flow
 
1. User loads the page → frontend calls `/cases` and `/stats` in parallel
2. User moves the threshold slider → frontend re-calls both endpoints with the new threshold → backend re-runs fuzzy matching at that threshold → UI updates
3. User types in search or clicks a status filter → filtering happens entirely client-side against the already-fetched case list (no additional backend call)
4. User clicks a case row → modal opens with that case's already-fetched data (no additional backend call)
## Known limitations / next steps
 
- DuckDB is in-memory and rebuilt on every backend restart — no persistence layer
- Escalate/Clear actions in the case detail modal are UI-only; no backend endpoint yet records reviewer decisions
- No authentication/authorization — appropriate for a demo, not for production compliance use
 
