# Architecture Summary — POC 43: Stroke Care Network Response Analyser

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    REAL RAILS INTELLIGENCE                       │
│            Stroke Care Network Response Analyser                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────┐       ┌──────────────────────────┐    │
│  │   Next.js 16 Frontend │◄─────►│   FastAPI Backend        │    │
│  │   (Port 3000)         │  REST │   (Port 8000)            │    │
│  │                       │  JSON │                           │    │
│  │  ┌─────────────────┐  │       │  ┌────────────────────┐  │    │
│  │  │ Main Stage (70%)│  │       │  │ mock_data.json     │  │    │
│  │  │ - DTN Chart     │  │       │  │ (Mock Fallback)    │  │    │
│  │  │ - Stroke Map    │  │       │  └────────────────────┘  │    │
│  │  │ - Outcome Funnel│  │       │                           │    │
│  │  │ - Benchmark Tbl │  │       │  Endpoints:               │    │
│  │  └─────────────────┘  │       │  /api/scenarios            │    │
│  │                       │       │  /api/scenarios/{id}       │    │
│  │  ┌─────────────────┐  │       │  /api/hospitals            │    │
│  │  │ Sidebar (30%)   │  │       │  /api/dtn-distribution     │    │
│  │  │ - Metrics       │  │       │  /api/thrombolysis-trend   │    │
│  │  │ - Why Matters   │  │       │  /api/source-confidence    │    │
│  │  │ - Who Controls  │  │       │  /api/download/{id}        │    │
│  │  │ - Decisions     │  │       │                           │    │
│  │  │ - Download CSV  │  │       └──────────────────────────┘    │
│  │  └─────────────────┘  │                                        │
│  └──────────────────────┘                                        │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  Data Sources (Intelligence Layer)                               │
│  ┌────────────────┐ ┌──────────────┐ ┌───────────────────┐      │
│  │ Angels Init.   │ │ WHO Stroke   │ │ Saudi Stroke Soc. │      │
│  │ (Conf: 90%)    │ │ (Conf: 88%)  │ │ (Conf: 82%)       │      │
│  └────────────────┘ └──────────────┘ └───────────────────┘      │
│  ┌──────────────────┐                                            │
│  │ OECD Indicators  │  + Synthetic Model (Conf: 60%)            │
│  │ (Conf: 85%)      │  — labeled per Manifesto                  │
│  └──────────────────┘                                            │
└─────────────────────────────────────────────────────────────────┘
```

## Technology Stack
| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 16 (App Router) | UI framework |
| Styling | Tailwind CSS v4 | Utility-first CSS |
| Charts | Recharts 3.x | Data visualization |
| Maps | Leaflet.js + react-leaflet | Stroke-unit coverage map |
| Icons | lucide-react | Consistent iconography |
| Language | TypeScript | Type safety |
| Backend | Python FastAPI | API server |
| Data | Pandas, JSON | Data orchestration |
| Theme | Real Rails DNA | #030712 Obsidian Black |

## Visual Identity (Real Rails DNA — Inherited from PoC 35)
- Background: `#030712` (Obsidian Black)
- Surface: `#0B1117` (Deep Navy Grey)
- Primary Accent: `#38BDF8` (Electric Cyan)
- Secondary Accent: `#818CF8` (Indigo)
- Critical Alert: `#EF4444` (Red-500) — for hospitals missing 60-min target
- Warning: `#F59E0B` (Amber-500) — for hospitals near threshold
- Success: `#22C55E` (Green-500) — for hospitals meeting target
- Borders: `#1F2937` (Slate-800)
- Font: Inter (tight letter-spacing) + mono for metrics

## Main Stage Components (70%)
1. **DoorToNeedleChart** — Histogram: DTN time distribution vs 60-minute guideline target line
2. **StrokeUnitMap** — Leaflet map: Hospital locations color-coded by DTN performance with bed-availability popups
3. **ThrombolysisRateTrend** — Area chart: Monthly thrombolysis rate trend across the network
4. **OutcomeFunnel** — Funnel/bar chart: 90-day mRS disability-outcome distribution (mRS 0–6)
5. **HospitalBenchmarkTable** — Interactive table: Expandable rows with hospital-level KPIs

## Intelligence Sidebar Components (30%)
1. **ScenarioSelector** — Toggle between network views (All Regions, Saudi, UAE, Qatar+)
2. **Key Metric Header** — Animated count-up of critical metrics (avg DTN, % meeting target)
3. **StrokeAlertCard** — Active alerts for hospitals in critical state
4. **Why This Matters Panel** — Narrative intelligence
5. **Who Controls The Rail Panel** — Stakeholder mapping
6. **Decisions & Insights Panel** — Actionable intelligence
7. **SourceConfidencePanel** — Data source attribution with confidence %
8. **Download Button** — CSV export of current scenario data

## Data Flow
1. User selects a scenario/region via the Intelligence Sidebar
2. Frontend calls `GET /api/scenarios/{scenario_id}`
3. Backend loads mock_data.json, filters hospitals by region, calculates aggregate metrics
4. Frontend renders Main Stage (charts, map, table) and Sidebar (insights)
5. All filters update without full page refresh (SPA behavior)

## Mock Data: 18 Gulf Hospitals
- **Saudi Arabia (8):** King Faisal Specialist, KAMC, KFMC, KAMC Makkah, KFUH Dammam, PSMMC, Madinah General, Aseer Central
- **UAE (5):** Cleveland Clinic Abu Dhabi, Rashid Hospital Dubai, SKMC Abu Dhabi, Al Qassimi Sharjah, Tawam Al Ain
- **Qatar (2):** Hamad General, HMC Neuroscience Institute
- **Kuwait (2):** Mubarak Al-Kabeer, Ibn Sina
- **Oman (1):** Royal Hospital Muscat
