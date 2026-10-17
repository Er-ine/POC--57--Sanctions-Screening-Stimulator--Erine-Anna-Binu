# Architecture Specification — Sanctions Screening Simulator (POC-57)

**Real Rails Intelligence Library — Governance & Trust**
**Author:** Erine Anna Binu

---

## 1. System Architecture Overview

The system implements a two-tier decoupled architecture:
1. **Python / FastAPI Backend (Port 8000):** Executes OFAC dataset ingestion, in-memory DuckDB query isolation, RapidFuzz string similarity, reviewer audit decision persistence, and streaming CSV generation.
2. **Next.js 16 / TypeScript Frontend (Port 3000):** Renders the **Real Rails 70/30 UI Split**, providing real-time reactivity, client-side query filtering, histogram visualization, and an interactive intelligence layer.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        REAL RAILS INTELLIGENCE                         │
│                    Sanctions Screening Simulator                       │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌───────────────────────┐         REST / JSON   ┌──────────────────┐  │
│  │   Next.js 16 Frontend │ ◄───────────────────► │  FastAPI Backend │  │
│  │   (Port 3000)         │                       │  (Port 8000)     │  │
│  │                       │                       │                  │  │
│  │  ┌─────────────────┐  │                       │  ┌────────────┐  │  │
│  │  │ Main Stage (70%)│  │                       │  │   DuckDB   │  │  │
│  │  │ - Histogram     │  │                       │  │ (In-Memory)│  │  │
│  │  │ - Slider (0-100)│  │                       │  └──────┬─────┘  │  │
│  │  │ - Case Queue    │  │                                 │        │  │
│  │  └─────────────────┘  │                       ┌─────────▼─────┐  │  │
│  │                       │                       │ OFAC SDN List │  │  │
│  │  ┌─────────────────┐  │                       │ (19,130+ rows)│  │  │
│  │  │ Sidebar (30%)   │  │                       └───────────────┘  │  │
│  │  │ - Case Inspector│  │                                          │  │
│  │  │ - Decisions (DB)│  │  Endpoints:                             │  │
│  │  │ - Why It Matters│  │  • GET  /cases?threshold=               │  │
│  │  │ - Who Controls  │  │  • GET  /stats?threshold=               │  │
│  │  │ - Source Prov.  │  │  • GET  /screen?name=&threshold=         │  │
│  │  │ - Export CSV    │  │  • POST /cases/{id}/decision            │  │
│  │  └─────────────────┘  │  • GET  /export?format=csv               │  │
│  └───────────────────────┘  • GET  /api/source-confidence          │  │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Backend Architecture

### 2.1 Data Management (DuckDB)
- **Engine:** DuckDB in-memory database (`con = duckdb.connect(':memory:')`).
- **Data Ingestion:** Loads official U.S. Treasury OFAC SDN records with `name`, `sdn_uid`, `sdn_type`, and `program`.
- **Synthetic Counterparty Model:** Generates 200 synthetic payment counterparties comprising both true-match adversarial variants (typos, reversed word order, character substitutions, corporate suffixes) and negative control corporate entities.
- **Thread Safety:** Every FastAPI route generates a discrete cursor (`con.cursor()`) to ensure atomic operations under concurrent asynchronous request handling.
- **Decision Tracking Schema:** The `counterparties` table defines explicit `VARCHAR` columns for `decision`, `reviewer_notes`, and `decision_timestamp`, enabling persistent compliance audit records.

### 2.2 Matching Engine & Explainability (`matcher.py`)
- **Scoring Algorithm:** RapidFuzz `fuzz.token_sort_ratio` evaluates token permutations with order invariance, preventing token reversal evasion tactics.
- **Candidate Metadata:** Matches are joined with OFAC SDN metadata to return target programs and entity types.
- **Tiered Explainability Logic:**
  - **Score ≥ 95%:** Near-exact match flag; immediate escalation required.
  - **Score 70%–94%:** Partial lexical similarity; transliteration or typo flag; manual review recommended.
  - **Score 50%–69%:** Moderate lexical overlap; flagged only when threshold is relaxed.
  - **Score < 50%:** Low similarity; benign entity cleared under standard risk appetite.

### 2.3 Endpoints
| Route | Method | Description |
|:---|:---|:---|
| `GET /cases?threshold=` | Screen all counterparties; return queue with effective reviewer decisions. |
| `GET /stats?threshold=` | Aggregate queue metrics (total, escalated, cleared, escalation rate). |
| `GET /screen?name=&threshold=` | Ad-hoc single name lookup returning top 5 candidates. |
| `POST /cases/{id}/decision` | Persist compliance reviewer decisions (*escalated*, *cleared*, *in_review*) with audit notes in DuckDB. |
| `GET /export?format=csv` | Stream RFC 4180-compliant CSV of current case queue with audit trail. |
| `GET /api/source-confidence` | Data provenance and confidence ratings for the intelligence layer. |
| `POST /reset` | Reset counterparties to clean baseline state. |

---

## 3. Frontend Architecture

### 3.1 Strict 70/30 Split Architecture
- Implemented using Tailwind CSS responsive grid (`lg:grid-cols-10` with `lg:col-span-7` and `lg:col-span-3`).
- **Main Stage (70%):**
  - `MatchDistributionChart`: 5-bucket histogram of similarity scores with hover tooltips.
  - `ThresholdSlider`: Interactive sensitivity control with quick presets (50%, 65%, 70%, 80%, 90%).
  - `CaseFilters`: Live status segmented buttons and debounced search input.
  - `ScreeningTable`: High-density case review table with matched OFAC entity and decision badges.
- **Intelligence Sidebar (30%):**
  - `IntelligenceSidebar`: Dual-tab inspector housing:
    1. *Case Inspector:* Displays selected counterparty, confidence score, explainability, and reviewer action buttons.
    2. *Rail Governance:* Displays *Why This Matters*, *Who Controls This Rail*, *Decisions to Make*, *Derived Insights*, and *SourceConfidencePanel*.
    3. *Footer:* Download Case Queue (CSV) button and Data Classification notice.
- **Ad-Hoc Screener (`QuickScreenModal`):** Accessible from the header and sidebar to test arbitrary queries against the live OFAC database.

### 3.2 State Management
- Built using React 19 hooks (`useState`, `useEffect`, `useMemo`).
- All domain interfaces strictly typed in [`frontend/lib/types.ts`](file:///c:/Users/ERINE%20ANNA%20BINU/OneDrive/Desktop/Projects/POC--57--Sanctions-Screening-Stimulator--Erine-Anna-Binu/frontend/lib/types.ts); zero `any` usage.

---

## 4. MCP Protocol Integration (`mcp_server.py`)

The project implements a Model Context Protocol (FastMCP) server exposing:
1. `screen_name(name: str, threshold: float = 70.0)`: Performs live RapidFuzz screening against the OFAC dataset.
2. `list_sanctioned_entities(limit: int = 10)`: Returns sample records directly from the DuckDB OFAC table.
