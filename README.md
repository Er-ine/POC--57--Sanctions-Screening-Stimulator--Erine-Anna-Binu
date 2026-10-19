# Sanctions Screening Simulator

**Governance & Trust — Real Rails Intelligence Library**
**Batch 6 · POC-57**
**Author:** Erine Anna Binu
**Repository:** [POC--57--Sanctions-Screening-Stimulator--Erine-Anna-Binu](https://github.com/Er-ine/POC--57--Sanctions-Screening-Stimulator--Erine-Anna-Binu)
**Evidence Drive:** [Screenshots & Demonstration Video](https://drive.google.com/drive/folders/1PgA-M80GGV0YOokWQKraaN6XEbxouY1g?usp=drive_link)

---

## 1. Project Overview & Problem Statement

Financial institutions and cross-border payment processors are legally mandated by authorities like the U.S. Department of the Treasury's Office of Foreign Assets Control (OFAC) to screen payment counterparties and beneficial owners against designated sanctions lists before transaction settlement.

Exact-name string matching fails in production: sanctioned entities, blocked vessels, and designated individuals routinely appear under transliteration variations, spelling typos, token reorderings (e.g. *&quot;AIRLINES AEROCARIBBEAN&quot;* vs. *&quot;AEROCARIBBEAN AIRLINES&quot;*), and deliberate obfuscation.

**Sanctions Screening Simulator (POC-57)** provides a production-grade, two-tier compliance workflow:
1. **Real Data Ingestion:** Loads the live OFAC Specially Designated Nationals (SDN) dataset (19,130+ designated records).
2. **Fuzzy String Matching Engine:** RapidFuzz token-sort-ratio matching across synthetic payment counterparties (typo variants, token inversions, character mutations, and benign negative controls).
3. **Explainable Confidence Scoring:** Generates a 0–100 similarity score paired with a plain-language audit rationale for defensible analyst reviews.
4. **Responsive Intelligence Drawer:** The screening visualization, threshold controls, and case queue use the full dashboard width. The Intelligence Layer opens as a right-side overlay drawer, with Case Inspector and Rail Governance available as tabs.

---

## 2. Architecture & System Flow

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
│  │  │ Main Stage     │  │                       │  │   DuckDB   │  │  │
│  │  │ - Histogram     │  │                       │  │ (In-Memory)│  │  │
│  │  │ - Slider (0-100)│  │                       │  └──────┬─────┘  │  │
│  │  │ - Case Queue    │  │                                 │        │  │
│  │  └─────────────────┘  │                       ┌─────────▼─────┐  │  │
│  │                       │                       │ OFAC SDN List │  │  │
│  │  │ - Case Queue    │  │                       │ (19,130+ rows)│  │  │
│  │  └─────────────────┘  │                       └───────────────┘  │  │
│  │  Intelligence Layer: right-side overlay drawer                    │  │
│  │  - Case Inspector / Rail Governance / Decisions / Source Provenance│  │
│  │  - CSV export / Ad-hoc screener     Endpoints:                    │  │
│  │                                       • GET /cases?threshold=     │  │
│  │                                       • GET /stats?threshold=     │  │
│  │                                       • POST /cases/{id}/decision│  │
│  └───────────────────────┘              • GET /export?format=csv    │  │
│                                          • GET /api/source-confidence│  │
│                                                                        │
├────────────────────────────────────────────────────────────────────────┤
│  Data Layer & Protocols:                                               │
│  - Real Regulatory Data: U.S. Treasury OFAC SDN List (Confidence: 98%) │
│  - Simulation Model: Adversarial Typology Generator (Confidence: 85%) │
│  - FastMCP Protocol: mcp_server.py (stdio JSON-RPC integration)        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

| Layer | Technologies | Key Responsibilities |
|:---|:---|:---|
| **Backend** | Python 3.14, FastAPI, DuckDB, RapidFuzz, Pandas, Pydantic | Ingestion of OFAC SDN CSV, in-memory SQL execution, thread-safe cursors, fuzzy similarity calculations, audit decision persistence, CSV streaming |
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS | High-density fintech aesthetic (`#030712` Obsidian black), reactive state, client-side filtering, interactive threshold slider, case review workflow |
| **Protocol** | FastMCP (Model Context Protocol) | LLM tool integration exposing `screen_name` and `list_sanctioned_entities` over stdio |
| **Testing** | Pytest, FastAPI TestClient, ESLint | 14 automated backend test cases, zero-error ESLint compliance, production build verification |

---

## 4. Verified Features & Workflows

- [x] **OFAC Ingestion:** Dynamic path-resolved ingestion of 19,130+ OFAC SDN records into DuckDB with entity types and sanctions program tags.
- [x] **Token-Sort Fuzzy Engine:** Uses `fuzz.token_sort_ratio` to ensure token permutations (e.g. *&quot;AEROCARIBBEAN AIRLINES&quot;* vs. *&quot;AIRLINES AEROCARIBBEAN&quot;*) yield a 100% match score while capturing spelling variants.
- [x] **Explainable Match Scoring:** Every candidate match generates a tier-based plain-language explanation distinguishing near-exact matches, potential transliterations, and low-probability lexical coincidences.
- [x] **Full-Width Dashboard and Intelligence Drawer:**
  - The histogram, sensitivity slider, and case queue use the full available dashboard width by default.
  - The Intelligence Layer opens in a right-side overlay and closes by button, Escape, or clicking outside. The Case Inspector and Rail Governance remain accessible in tabs.
- [x] **Reviewer Decision Workflow (Persisted):** Analysts can record audit actions (*Escalate Case*, *Clear Case*) with custom compliance notes via `POST /cases/{case_id}/decision`, immediately updating the case queue, stats, and audit records in DuckDB.
- [x] **Downloadable Sample Data / CSV Export:** Streamed live export from `GET /export?format=csv` incorporating case IDs, counterparty names, closest OFAC candidates, confidence scores, reviewer decisions, audit notes, and timestamps.
- [x] **Ad-Hoc Single Entity Screener:** Interactive modal allowing compliance teams to test arbitrary entity queries against the live OFAC database with immediate candidate rankings and explainability.
- [x] **MCP Tool Integration:** Fully wired `mcp_server.py` connecting AI agents directly to live sanctions screening functions.

---

## 5. API Reference

| Endpoint | Method | Parameters | Description |
|:---|:---|:---|:---|
| `/` | `GET` | — | System health status, project metadata, and rail category. |
| `/screen` | `GET` | `name` (string), `threshold` (float, default 70.0) | Screens a single counterparty name against the OFAC SDN list; returns top 5 candidate matches and explainability. |
| `/cases` | `GET` | `threshold` (float, 0.0–100.0) | Screens all counterparties at the given threshold and returns the case queue. |
| `/stats` | `GET` | `threshold` (float, 0.0–100.0) | Aggregate queue metrics (total, escalated, cleared, escalation rate %). |
| `/cases/{id}/decision` | `POST` | `case_id` (path int), Body: `{ decision: "escalated" \| "cleared" \| "in_review", notes: string }` | Persists an analyst review decision, audit timestamp, and compliance notes in DuckDB. |
| `/export` | `GET` | `threshold` (float), `format` (`"json"` or `"csv"`) | Exports the screened case queue. Format `csv` triggers a streaming download. |
| `/export/csv` | `GET` | `threshold` (float) | Direct download alias for the CSV case queue. |
| `/api/source-confidence` | `GET` | — | Data source attribution, freshness, record counts, and confidence ratings. |
| `/reset` | `POST` | — | Re-initializes synthetic counterparties to clean baseline state for testing. |

---

## 6. Installation & Startup Instructions

### Prerequisites
- Python 3.10+ (tested on Python 3.14)
- Node.js 18+ (tested on Node.js 20+)
- Official OFAC SDN dataset at `backend/data/ofac_sdn.csv` (included in repository)

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Run automated test suite
python -m pytest test_backend.py -v

# Start FastAPI server
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```
*API runs at `http://127.0.0.1:8000` (Interactive Swagger docs at `http://127.0.0.1:8000/docs`).*

### Frontend Setup
```bash
# In a separate terminal, navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run type check & linter
npm run lint

# Build production bundle
npm run build

# Start development server
npm run dev
```
*Application runs at `http://localhost:3000`.*

---

## 7. Automated Test Suite & Quality Verification

The repository includes a comprehensive 14-test verification suite in [`backend/test_backend.py`](file:///c:/Users/ERINE%20ANNA%20BINU/OneDrive/Desktop/Projects/POC--57--Sanctions-Screening-Stimulator--Erine-Anna-Binu/backend/test_backend.py):

```
backend/test_backend.py::test_ofac_data_loading PASSED                   [  7%]
backend/test_backend.py::test_synthetic_counterparties_generation PASSED [ 14%]
backend/test_backend.py::test_matcher_exact_match PASSED                 [ 21%]
backend/test_backend.py::test_matcher_fuzzy_reordering_and_typo PASSED   [ 28%]
backend/test_backend.py::test_matcher_clean_entity_clears PASSED         [ 35%]
backend/test_backend.py::test_explainability_logic PASSED                [ 42%]
backend/test_backend.py::test_api_root PASSED                            [ 50%]
backend/test_backend.py::test_api_stats_math PASSED                      [ 57%]
backend/test_backend.py::test_api_cases_threshold_sensitivity PASSED     [ 64%]
backend/test_backend.py::test_api_reviewer_decision_persistence PASSED   [ 71%]
backend/test_backend.py::test_api_decision_validation_errors PASSED      [ 78%]
backend/test_backend.py::test_api_export_formats PASSED                  [ 85%]
backend/test_backend.py::test_api_source_confidence PASSED               [ 92%]
backend/test_backend.py::test_mcp_server_integration PASSED              [100%]

============================= 14 passed in 47.36s =============================
```

Frontend quality verification:
- **TypeScript:** Strict type contracts in [`frontend/lib/types.ts`](file:///c:/Users/ERINE%20ANNA%20BINU/OneDrive/Desktop/Projects/POC--57--Sanctions-Screening-Stimulator--Erine-Anna-Binu/frontend/lib/types.ts) with zero `any` types.
- **ESLint:** `npm run lint` passes with 0 errors and 0 warnings.
- **Next.js Build:** `npm run build` generates optimized static pages cleanly.

---

## 8. Responsible Screening & Data Provenance Disclosure

- **Potential vs. Confirmed Matches:** The screening scores represent lexical and token similarity against government lists. A score ≥ 70% indicates a *potential candidate for enhanced due diligence*, not a legally confirmed identity match.
- **Synthetic Test Controls:** While the OFAC SDN dataset is genuine and public, payment counterparty records are synthetically modeled to evaluate algorithm recall and precision without exposing real customer financial data.
- **Regulatory Disclaimers:** This proof of concept is an intelligence simulation and decision-support prototype. It does not replace official compliance counsel or mandatory regulatory filings (such as FinCEN SARs or OFAC blocking reports).

---

## 9. Project Structure

```
├── backend/
│   ├── data/
│   │   └── ofac_sdn.csv          # Real OFAC SDN sanctions list (19,130+ entries)
│   ├── data_loader.py            # Dynamic CSV ingestion & synthetic generator
│   ├── main.py                   # FastAPI application, decision endpoints & CSV streaming
│   ├── matcher.py                # RapidFuzz scoring & explainability generation
│   ├── requirements.txt          # Python dependencies (FastAPI, DuckDB, RapidFuzz, pytest)
│   └── test_backend.py           # 14-point automated test suite
├── frontend/
│   ├── app/
│   │   ├── globals.css           # Tailwind styling & dark theme variables
│   │   ├── layout.tsx            # Root layout wrapper
│   │   └── page.tsx              # Full-width dashboard and Intelligence Layer drawer
│   ├── components/
│   │   ├── CaseFilters.tsx       # Status toggle & search filtering
│   │   ├── CaseSidebar.tsx       # Presentational inspector component
│   │   ├── IntelligenceSidebar.tsx # Intelligence drawer content and decision actions
│   │   ├── MatchDistributionChart.tsx # Match score bucket histogram
│   │   ├── QuickScreenModal.tsx  # Ad-hoc live OFAC entity screener
│   │   ├── ScreeningTable.tsx    # Case review table with candidate matching
│   │   ├── SourceConfidencePanel.tsx # Source attribution & confidence ratings
│   │   └── ThresholdSlider.tsx   # Sensitivity slider & quick presets
│   ├── lib/
│   │   ├── api.ts                # Typed backend API client
│   │   └── types.ts              # Domain interfaces & TypeScript contracts
│   └── README.md                 # Frontend architecture documentation
├── mcp_server.py                 # FastMCP server integrating live OFAC screening tools
├── Screenshots and video         # Reference URL for visual demonstration assets
├── ARCHITECTURE.md               # Detailed system architecture specification
├── AI_USAGE.md                   # AI usage summary and Repomix protocol audit
├── VAR_REPORT.md                 # Gate 1 Visualization Audit Review (100% compliant)
└── UAT_CHECKLIST.md              # Requirement-linked User Acceptance Checklist
```

---

## 10. Documentation Index

- [ARCHITECTURE.md](file:///c:/Users/ERINE%20ANNA%20BINU/OneDrive/Desktop/Projects/POC--57--Sanctions-Screening-Stimulator--Erine-Anna-Binu/ARCHITECTURE.md) — Architectural patterns, DuckDB concurrency, and data flow.
- [VAR_REPORT.md](file:///c:/Users/ERINE%20ANNA%20BINU/OneDrive/Desktop/Projects/POC--57--Sanctions-Screening-Stimulator--Erine-Anna-Binu/VAR_REPORT.md) — Visualization Audit Review across Gate 1 criteria.
- [UAT_CHECKLIST.md](file:///c:/Users/ERINE%20ANNA%20BINU/OneDrive/Desktop/Projects/POC--57--Sanctions-Screening-Stimulator--Erine-Anna-Binu/UAT_CHECKLIST.md) — Requirement-linked acceptance checklist with step-by-step test records.
- [AI_USAGE.md](file:///c:/Users/ERINE%20ANNA%20BINU/OneDrive/Desktop/Projects/POC--57--Sanctions-Screening-Stimulator--Erine-Anna-Binu/AI_USAGE.md) — AI usage methodology and verification log.
- [frontend/README.md](file:///c:/Users/ERINE%20ANNA%20BINU/OneDrive/Desktop/Projects/POC--57--Sanctions-Screening-Stimulator--Erine-Anna-Binu/frontend/README.md) — Frontend architecture, scripts, and component breakdown.
