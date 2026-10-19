# Infocreon Internship - Sanctions Screening Simulator

**Project ID:** POC-57
**Program:** Infocreon Internship
**Framework:** Next.js 16.2 (App Router) · React 19 · TypeScript · Tailwind CSS

---

## 1. Overview

The frontend is a high-density compliance reviewer dashboard. The histogram, threshold controls, and case queue use the full available content width. The Intelligence Layer opens in a right-side overlay drawer and does not resize or move the dashboard content.

- **Main Stage:** Responsive match distribution histogram, fuzzy threshold slider with quick sensitivity presets, client-side search/status filtering, and interactive payment counterparty queue.
- **Intelligence Layer:** Right-side overlay drawer featuring the **Case Inspector** (persistent *Escalate* and *Clear* decision workflows), narrative regulatory briefs (*Why This Matters*, *Who Controls This Rail*, *Decisions to Make*, *Derived Insights*), the API-backed **Source Confidence Panel**, and CSV export. Case Inspector and Rail Governance remain available as tabs. Close it with the close button, Escape, or an outside click.
- **Data availability:** Case/stat requests are required for screening results. If they fail, the UI shows an unavailable state rather than treating zero records as successful screening. Source provenance loads independently and is not replaced with hardcoded confidence figures.

---

## 2. Component Architecture

```
frontend/
├── app/
│   ├── globals.css              # Custom styling, glassmorphism, scrollbars, colors
│   ├── layout.tsx               # Root dark theme layout wrapper
│   └── page.tsx                 # Composition root: dashboard state and Intelligence Layer drawer
├── components/
│   ├── CaseFilters.tsx          # Status filter buttons (All/Escalated/Cleared) + live search
│   ├── CaseSidebar.tsx          # Standalone case inspector component
│   ├── IntelligenceSidebar.tsx  # Intelligence drawer, case and governance tabs
│   ├── MatchDistributionChart.tsx # 5-bucket confidence score distribution histogram
│   ├── QuickScreenModal.tsx     # Modal for ad-hoc single entity screening against OFAC
│   ├── ScreeningTable.tsx       # Case review queue table with candidate matching & audit badges
│   ├── SourceConfidencePanel.tsx# Source attribution & confidence breakdown
│   └── ThresholdSlider.tsx      # Sensitivity threshold slider (0–100%) + quick presets
└── lib/
    ├── api.ts                   # Strongly typed REST client for FastAPI backend
    └── types.ts                 # TypeScript domain contracts (ScreeningCase, Stats, etc.)
```

---

## 3. Key Workflows & State Flow

1. **Initial Load & Threshold Adjustment:**
   - On page mount or whenever the threshold slider is dragged, `page.tsx` loads the cases and statistics concurrently and loads source provenance independently.
   - The API client uses `NEXT_PUBLIC_API_URL` when configured and otherwise defaults to `http://localhost:8000`. Public deployments must configure this variable with their backend API URL.
   - Failed requests produce explicit unavailable states instead of synthetic screening results or misleading zero counts. The queue and histogram update to reflect the new threshold without reloading the page.
2. **Case Review Workflow:**
   - Clicking any row in `ScreeningTable` triggers `setSelectedCase(case)`, which immediately updates the **Case Inspector** inside `IntelligenceSidebar`.
   - The Inspector displays the closest matched OFAC entity, confidence score, explainability rationale, and compliance review controls.
3. **Persisted Reviewer Decision Actions:**
   - Reviewers can enter compliance audit notes and click **Escalate Case** or **Clear Case**.
   - This invokes `recordCaseDecision(caseId, { decision, notes })` via `POST /cases/{id}/decision`.
   - The backend persists this in DuckDB, returns the updated audit record, and the UI immediately updates the case queue and metric counts with a confirmation toast.
4. **Ad-Hoc Single Entity Screener:**
   - Clicking **Quick Screen Single Entity** opens `QuickScreenModal`, allowing compliance teams to test any individual or corporate entity name against the live 19,130+ OFAC dataset with immediate candidate rankings.
5. **Streaming CSV Export:**
   - The **Download Case Queue (CSV)** action triggers a direct download of the screened counterparty queue via `GET /export/csv?threshold=...`.

---

## 4. Visual Identity & Design System

The application uses a dark, high-contrast compliance dashboard design:
- **Background:** `#030712` (Obsidian Black)
- **Surfaces & Cards:** `#0B1117` / `zinc-900/60` with `backdrop-blur-md`
- **Borders:** `#1F2937` (Slate-800) / `zinc-800`
- **Primary Accent:** `orange-500` / `orange-400` (thresholds, highlights, primary buttons)
- **Semantic Badges:**
  - `red-950` / `red-400`: High-risk sanctions flag (≥ 70% match)
  - `emerald-950` / `emerald-400`: Cleared counterparty (< 70% match)
- **Typography:** `Inter` for general copy, tabular `Monospace` for numeric metrics, scores, and entity identifiers.

---

## 5. Development & Verification Commands

```bash
# Install dependencies
npm install

# Run ESLint (must be 0 errors, 0 warnings)
npm run lint

# Build production bundle
npm run build

# Start Next.js development server
npm run dev
```

Server starts at `http://localhost:3000`. Ensure the backend server is running concurrently at `http://localhost:8000`.
