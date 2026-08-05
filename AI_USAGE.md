# AI Usage Summary — Sanctions Screening Simulator

## How AI was used

AI (Claude) was used as an implementation accelerator throughout this project, per the Real Rails engineering protocol. Usage fell into four categories:

### 1. Scaffolding
- Generated the initial backend structure (`main.py`, `data_loader.py`, `matcher.py`) implementing OFAC CSV ingestion, synthetic counterparty generation, and RapidFuzz-based fuzzy matching
- Generated the initial frontend structure (Next.js pages, components, API client) matching the project spec (stack, required features, panel copy)

### 2. Debugging
Followed the Repomix debugging protocol: shared terminal output, stack traces, and screenshots for each issue rather than describing problems from memory. Issues diagnosed and fixed this way included:
- A DuckDB thread-safety bug (`TypeError: 'NoneType' object is not subscriptable`, `KeyError: 'id'`) caused by sharing a single connection object across concurrent FastAPI request threads — fixed by issuing a per-request cursor
- A file path/naming mismatch (`ofac_sdn.csv.csv` vs. expected `ofac_sdn.csv`) causing silent data-loading failures
- Recurring "Failed to fetch" errors traced to the backend not actually running in the terminal being tested (wrong working directory, or the process having been replaced by a different command in the same terminal)
- A corrupted Next.js `.next` build cache after a dependency reinstall, resolved via a clean cache + `node_modules` rebuild

### 3. Design/audit iteration
Used AI as a design reviewer (VAR role) to identify gaps against the spec's visual and interaction requirements — filters, tooltips, loading states, and a case-detail view were all identified as missing and then implemented in response.

### 4. Documentation generation
This document, along with `VAR_REPORT.md`, `ARCHITECTURE.md`, and the `UAT_CHECKLIST.md` scaffold, were AI-drafted based on the actual implemented code and the review conducted during this project, then intended for manual verification before submission.

## What was NOT delegated to AI
- Manual verification of the UAT checklist (responsive behavior at specific breakpoints, data-correctness spot checks, edge case testing at threshold extremes) — these require running the actual application and were left as unchecked items for manual completion, not marked as done by AI
- Final decisions on which VAR recommendations to act on before submission
- Git commit/push operations were run by the developer, not automated

## Verification approach
Every AI-suggested code change was applied and tested against the running application (via terminal output, direct API calls, and browser screenshots) before being accepted, following the "verification remains your responsibility" principle of the Phase 1 protocol.
