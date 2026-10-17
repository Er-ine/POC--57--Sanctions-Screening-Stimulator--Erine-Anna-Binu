# User Acceptance Testing (UAT) Checklist — POC 57

**Project:** Sanctions Screening Simulator
**POC ID:** 57
**Author:** Erine Anna Binu
**Evaluation Standard:** Real Rails Master Manifesto Acceptance Criteria
**Verification Date:** 2026-10-17
**Overall Status:** **100% PASS (20 of 20 Tests Verified)**

---

## 1. Test Execution Summary

| Test Category | Total Tests | Pass | Fail | Partial |
|:---|:---:|:---:|:---:|:---:|
| **Fuzzy Matching & Algorithms** | 4 | 4 | 0 | 0 |
| **User Interface & 70/30 Layout** | 4 | 4 | 0 | 0 |
| **Interactivity & The Handshake** | 4 | 4 | 0 | 0 |
| **Reviewer Decision Persistence** | 3 | 3 | 0 | 0 |
| **Intelligence Layer & Governance** | 3 | 3 | 0 | 0 |
| **API, Export & Tool Protocols** | 2 | 2 | 0 | 0 |
| **TOTAL** | **20** | **20** | **0** | **0** |

---

## 2. Requirement-Linked Acceptance Test Cases

### Category A: Fuzzy Matching & Data Ingestion

#### `UAT-DATA-01`: Ingestion of Real OFAC SDN Sanctions List
- **Requirement Link:** REQ-01 / Architecture Specification
- **Test Steps:**
  1. Initialize backend via `init_db()` or startup.
  2. Query `SELECT COUNT(*) FROM sanctions_list`.
  3. Inspect column schema for `name`, `sdn_uid`, `sdn_type`, and `program`.
- **Expected Result:** Database ingests >19,000 real entries from `backend/data/ofac_sdn.csv`.
- **Actual Result:** 19,133 distinct sanctioned names loaded; all 4 columns populated.
- **Status:** **PASS ✅**

#### `UAT-MATCH-02`: Token Reordering Invariance
- **Requirement Link:** REQ-03 / RapidFuzz Engine
- **Test Steps:**
  1. Screen inverted string: `AIRLINES AEROCARIBBEAN`.
  2. Screen standard string: `AEROCARIBBEAN AIRLINES`.
  3. Compare fuzzy confidence scores.
- **Expected Result:** Token-sort-ratio recognizes word order permutation and returns 100.0% score.
- **Actual Result:** Score is exactly 100.0%; `match_found: true`.
- **Status:** **PASS ✅**

#### `UAT-MATCH-03`: Typographical Error & Mutation Detection
- **Requirement Link:** REQ-02, REQ-03 / Typology Generator
- **Test Steps:**
  1. Screen mutated string: `AEROCARIBEAN AIRLNES` (missing characters).
  2. Query at default threshold 70.0%.
- **Expected Result:** Score remains above 85.0% and flags case for escalation.
- **Actual Result:** Confidence score is 90.5%; match flagged with explainability text.
- **Status:** **PASS ✅**

#### `UAT-MATCH-04`: Negative Control / Benign Corporate Name
- **Requirement Link:** REQ-03 / Precision Testing
- **Test Steps:**
  1. Screen benign name: `Pacific Rim Green Energy Logistics Ltd #999`.
  2. Query at threshold 70.0%.
- **Expected Result:** Confidence score remains well below 70.0%; `match_found: false`.
- **Actual Result:** Score is 43.5%; automatically categorized as cleared.
- **Status:** **PASS ✅**

---

### Category B: User Interface & 70/30 Layout Architecture

#### `UAT-UI-05`: Strict 70/30 Split Layout
- **Requirement Link:** REQ-07 / Real Rails Master Manifesto
- **Test Steps:**
  1. View viewport at desktop resolution (1920px and 1366px).
  2. Verify Main Stage occupies 70% width and Intelligence Sidebar occupies 30% width.
- **Expected Result:** 10-column grid (`col-span-7` vs `col-span-3`) maintains clean side-by-side positioning without wrapping.
- **Actual Result:** CSS grid verified; 70% stage displays charts and queue; 30% sidebar displays intelligence.
- **Status:** **PASS ✅**

#### `UAT-UI-06`: Top Metric Cards & Mathematical Consistency
- **Requirement Link:** REQ-05 / Gate 1 Metric Standards
- **Test Steps:**
  1. Observe four top metric cards: *Total Screened*, *Escalated Flagged*, *Cleared Entities*, *Escalation Rate*.
  2. Verify: `Total = Escalated + Cleared`.
  3. Verify: `Escalation Rate = (Escalated / Total) * 100`.
- **Expected Result:** Math is strictly consistent across threshold modifications.
- **Actual Result:** At threshold 75%: Total = 200, Escalated = 35, Cleared = 165; Rate = 17.5%. Verified across all thresholds.
- **Status:** **PASS ✅**

#### `UAT-UI-07`: Match Score Distribution Histogram
- **Requirement Link:** REQ-06 / VAR Report
- **Test Steps:**
  1. Observe Match Score Distribution chart.
  2. Hover over histogram bars.
- **Expected Result:** Bars render proportional heights for 5 score buckets (0–20%, 21–40%, 41–60%, 61–80%, 81–100%) with tooltip showing count.
- **Actual Result:** Gradient bars update dynamically; hover tooltips display exact count and range.
- **Status:** **PASS ✅**

#### `UAT-UI-08`: Responsive Viewport Degradation
- **Requirement Link:** REQ-14 / VAR Responsive Rubric
- **Test Steps:**
  1. Test breakpoints: 1920px (Desktop), 1366px (Laptop), 768px (Tablet), 375px (Mobile).
- **Expected Result:** Fluid scaling on desktop; vertical stacking on mobile with horizontally scrollable table.
- **Actual Result:** Layout holds at 375px width without breaking header or sidebar; table scrolls horizontally with preserved badges.
- **Status:** **PASS ✅**

---

### Category C: Interactivity & "The Handshake"

#### `UAT-INT-09`: Dynamic Threshold Slider Reactivity
- **Requirement Link:** REQ-05 / Real-time Reactive State
- **Test Steps:**
  1. Drag threshold slider from 70% down to 30%.
  2. Drag slider up to 95%.
- **Expected Result:** Case queue, histogram buckets, and escalation metrics update immediately without full page reload.
- **Actual Result:** Permissive threshold (30%) flags 190+ cases; conservative threshold (95%) flags only near-exact matches (~25 cases).
- **Status:** **PASS ✅**

#### `UAT-INT-10`: Threshold Quick Preset Buttons
- **Requirement Link:** REQ-05 / Usability Standards
- **Test Steps:**
  1. Click quick preset buttons: `50%`, `65%`, `70%`, `80%`, `90%`.
- **Expected Result:** Slider and underlying queue update to exact preset value.
- **Actual Result:** Presets toggle state immediately; active button highlights with orange accent.
- **Status:** **PASS ✅**

#### `UAT-INT-11`: Status & Search Queue Filters
- **Requirement Link:** REQ-07 / Case Queue Usability
- **Test Steps:**
  1. Click `Escalated` status filter button.
  2. Type query into search input (e.g. "Air").
  3. Click `Clear` search button (✕).
- **Expected Result:** Table shows only matching records; clears instantly on reset.
- **Actual Result:** Status filter reduces table to flagged cases only; search performs instant case-insensitive matching across counterparty and candidate names.
- **Status:** **PASS ✅**

#### `UAT-INT-12`: The Handshake (Row Selection to Sidebar)
- **Requirement Link:** REQ-07, REQ-10 / The Real Rails Handshake
- **Test Steps:**
  1. Click any row in the case review queue table.
  2. Press Tab and Enter to navigate via keyboard.
- **Expected Result:** Row highlights with orange border; Intelligence Sidebar immediately populates with case details, score bar, candidate match, and explainability.
- **Actual Result:** Selected row updates sidebar seamlessly; keyboard navigation works.
- **Status:** **PASS ✅**

---

### Category D: Reviewer Decision Workflow & Persistence

#### `UAT-DEC-13`: Escalate Case Review Action
- **Requirement Link:** REQ-10 / Reviewer Workflow Persistence
- **Test Steps:**
  1. Select a pending counterparty case (e.g. ID #5).
  2. Enter note: *"Escalating for Enhanced Due Diligence."*
  3. Click **Escalate Case** button.
- **Expected Result:** `POST /cases/5/decision` executes; DuckDB table records decision; UI displays green confirmation toast; badge changes to `✓ ESCALATED`.
- **Actual Result:** Verified via automated test `test_api_reviewer_decision_persistence` and UI execution; audit timestamp recorded in UTC ISO format.
- **Status:** **PASS ✅**

#### `UAT-DEC-14`: Clear Case False Positive Override
- **Requirement Link:** REQ-10 / Compliance Audit Standards
- **Test Steps:**
  1. Select a high-score case.
  2. Enter note: *"Verified false positive against secondary ID documents."*
  3. Click **Clear Case** button.
- **Expected Result:** Case status changes to cleared; decision audit card appears in inspector.
- **Actual Result:** Backend persists `decision = 'cleared'`; queue displays `✓ CLEARED` badge.
- **Status:** **PASS ✅**

#### `UAT-DEC-15`: Audit Trail Persistence Across Refiltering
- **Requirement Link:** REQ-10 / DuckDB Concurrency & State
- **Test Steps:**
  1. Modify threshold slider after recording a decision.
  2. Query `GET /cases` to verify whether decision survives threshold re-evaluations.
- **Expected Result:** Persisted decisions override automated threshold flags.
- **Actual Result:** Case retains reviewer decision even after threshold slider moves.
- **Status:** **PASS ✅**

---

### Category E: Intelligence Layer & Rail Governance

#### `UAT-GOV-16`: Sidebar Tab Navigation & Institutional Intelligence
- **Requirement Link:** REQ-08 / Organisational Feedback
- **Test Steps:**
  1. In the 30% Intelligence Sidebar, toggle between **Case Inspector** and **Rail Governance** tabs.
  2. Inspect sections: *Why This Matters*, *Who Controls This Rail*, *Decisions to Make*, *Derived Insights*.
- **Expected Result:** All four sections display authoritative regulatory copy without truncation.
- **Actual Result:** Both tabs render cleanly; all four narrative intelligence sections and governing authority tables (OFAC, FinCEN, EU, FATF) display.
- **Status:** **PASS ✅**

#### `UAT-GOV-17`: Source Confidence Panel Rendering
- **Requirement Link:** REQ-09 / Real Rails Master Manifesto
- **Test Steps:**
  1. Inspect Source Confidence Panel in the Intelligence Sidebar.
  2. Verify attribution cards for U.S. OFAC SDN list and Synthetic Counterparty Generator.
- **Expected Result:** OFAC displayed with 98% confidence and 19,130+ records; Synthetic generator displayed with 85% confidence and 200 records.
- **Actual Result:** Progress bars and metadata render accurately based on live API response `/api/source-confidence`.
- **Status:** **PASS ✅**

#### `UAT-GOV-18`: Ad-Hoc Single Entity Screener Modal
- **Requirement Link:** REQ-12 / Ad-Hoc Compliance Screener
- **Test Steps:**
  1. Click **Quick Screen Single Entity** button in header or sidebar.
  2. Input name: `AEROCARIBBEAN AIRLINES`.
  3. Click **Screen Name**.
- **Expected Result:** Modal displays top 5 candidate matches on OFAC list with individual scores, programs, and explainability.
- **Actual Result:** Modal displays exact match candidate with 100% score, program `CUBA`, and explainable match rationale.
- **Status:** **PASS ✅**

---

### Category F: API, Export & Protocols

#### `UAT-EXPORT-19`: Streaming CSV Case Queue Download
- **Requirement Link:** REQ-11 / Real Rails 'Download Sample Data'
- **Test Steps:**
  1. Click **Download Case Queue (CSV)** in sidebar footer.
  2. Fetch `GET /export?format=csv&threshold=70`.
- **Expected Result:** Browser triggers download of `sanctions_screening_cases_t70.csv` with valid RFC 4180 headers.
- **Actual Result:** 201-row CSV streamed with columns: `Case ID`, `Counterparty Name`, `Closest OFAC Candidate`, `Confidence Score`, `Effective Status`, `Algorithm Status`, `Reviewer Decision`, `Reviewer Notes`, `Decision Timestamp`, `Explainability`.
- **Status:** **PASS ✅**

#### `UAT-MCP-20`: FastMCP Server Tool Execution
- **Requirement Link:** REQ-13 / Model Context Protocol Integration
- **Test Steps:**
  1. Execute `mcp_server.py` tools `screen_name` and `list_sanctioned_entities`.
- **Expected Result:** Tools return real OFAC data, not dummy placeholders.
- **Actual Result:** `screen_name("AEROCARIBBEAN AIRLINES")` returns confidence score 100.0%; `list_sanctioned_entities(limit=5)` returns 5 real OFAC records.
- **Status:** **PASS ✅**

---

## 3. Final Sign-Off

- **Audit Completion:** 20 of 20 tests verified.
- **Automated Backend Pytest:** 14 passed in 47.36s.
- **Frontend Linter (ESLint):** 0 errors, 0 warnings.
- **Frontend Build (Next.js 16):** Production build succeeded.
- **Gate 1 Acceptance Status:** **ACCEPTED & FULLY COMPLIANT ✅**
