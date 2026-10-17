# AI Usage Summary — Sanctions Screening Simulator (POC-57)

**Real Rails Intelligence Library — Governance & Trust**
**Author:** Erine Anna Binu

---

## 1. How AI Was Utilized

Per the **Real Rails Engineering Protocol**, AI (Claude / Antigravity) served as an engineering accelerator across scaffolding, debugging, architectural compliance auditing, and verification.

### 1.1 Scaffolding & Initial Implementation
- Generated the foundational FastAPI backend architecture (`main.py`, `data_loader.py`, `matcher.py`) for ingesting the official U.S. OFAC SDN sanctions CSV and applying RapidFuzz token-sort-ratio matching.
- Scaffolded initial Next.js App Router components (`ScreeningTable`, `ThresholdSlider`, `MatchDistributionChart`) matching the dark fintech theme.

### 1.2 Repomix Debugging Protocol
All debugging strictly adhered to the Repomix protocol: passing full terminal outputs, stack traces, and direct endpoint responses rather than vague symptom descriptions:
- **DuckDB Cursor Concurrency:** Diagnosed and resolved thread-safety exceptions under FastAPI's concurrent async handling by issuing per-request cursors (`con.cursor()`).
- **Dynamic Path Resolution:** Identified and resolved relative file path errors (`FileNotFoundError: data/ofac_sdn.csv`) by anchoring resolution to `__file__`.
- **DuckDB Type Conversion:** Resolved timestamp schema conversion errors by explicitly defining table schemas with `VARCHAR` decision fields.
- **FastAPI Modernization:** Updated deprecated startup event handlers to FastAPI's modern async `lifespan` context manager.
- **ESLint & TypeScript Cleanup:** Eliminated all explicit `any` types, unescaped entity warnings, and effect state cascades across all React components.

### 1.3 Organisational Compliance & Architectural Gap Resolution
- **70/30 Split Layout:** Restructured the application to follow the Real Rails Master Manifesto: 70% Main Stage on the left and 30% Intelligence Sidebar on the right.
- **Mandatory Intelligence Sections:** Implemented all five required intelligence sections in the right-side rail: *Why This Matters*, *Who Controls This Rail*, *Decisions to Make*, *Derived Insights*, and *Source Confidence Panel*.
- **Reviewer Decision Persistence:** Engineered the complete decision recording workflow (`POST /cases/{id}/decision`), writing directly to DuckDB with UTC audit timestamps.
- **Streaming CSV Export:** Implemented RFC 4180-compliant CSV streaming from `GET /export/csv`.
- **FastMCP Protocol:** Wired `mcp_server.py` to the live OFAC dataset and matching engine.

### 1.4 Automated Verification Suite
- Authored a comprehensive 14-point automated test suite in `backend/test_backend.py` covering dataset loading, fuzzy matching invariance, decision persistence, export streaming, and MCP tools.

---

## 2. What Was NOT Delegated to AI

- **Acceptance Decisions:** Architectural alignment and Gate 1 evaluation decisions remained with the developer.
- **Data Provenance:** The official OFAC SDN dataset was sourced directly from the U.S. Department of the Treasury.
- **Git Safety:** Git commands were kept strictly local; no destructive commands, rebasing, committing, pushing, or branch switching were automated.

---

## 3. Verification Protocol

Every AI-suggested modification was verified against running processes:
1. **Automated Backend Tests:** 14 of 14 pytest cases passing in 47.36s.
2. **Frontend Linter:** `npm run lint` passing with 0 errors and 0 warnings.
3. **Frontend Production Build:** `npm run build` compiling without errors.
4. **End-to-End Live Connectivity:** Both FastAPI and Next.js verified via HTTP requests.
