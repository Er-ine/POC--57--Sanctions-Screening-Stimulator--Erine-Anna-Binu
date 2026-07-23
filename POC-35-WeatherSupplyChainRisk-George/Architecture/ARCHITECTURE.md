# Architecture Summary — POC 35: Weather-to-Supply Chain Risk Model

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    REAL RAILS INTELLIGENCE                       │
│              Weather-to-Supply Chain Risk Model                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────┐       ┌──────────────────────────┐    │
│  │   Next.js 14 Frontend │◄─────►│   FastAPI Backend        │    │
│  │   (Port 3000)         │  REST │   (Port 8000)            │    │
│  │                       │  JSON │                           │    │
│  │  ┌─────────────────┐  │       │  ┌────────────────────┐  │    │
│  │  │ Main Stage (70%)│  │       │  │ mock_data.json     │  │    │
│  │  │ - Route Table   │  │       │  │ (Mock Fallback)    │  │    │
│  │  │ - Delay Charts  │  │       │  └────────────────────┘  │    │
│  │  │ - Impact Chain  │  │       │                           │    │
│  │  └─────────────────┘  │       │  Endpoints:               │    │
│  │                       │       │  /api/scenarios            │    │
│  │  ┌─────────────────┐  │       │  /api/scenarios/{id}      │    │
│  │  │ Sidebar (30%)   │  │       │  /api/weather-events      │    │
│  │  │ - Metrics       │  │       │  /api/supply-routes       │    │
│  │  │ - Why Matters   │  │       │  /api/impact-chain        │    │
│  │  │ - Who Controls  │  │       │  /api/source-confidence   │    │
│  │  │ - Filters       │  │       │  /api/download/{id}       │    │
│  │  │ - Download CSV  │  │       │                           │    │
│  │  └─────────────────┘  │       └──────────────────────────┘    │
│  └──────────────────────┘                                        │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  Data Sources (Intelligence Layer)                               │
│  ┌────────────┐ ┌──────────────┐ ┌─────────────┐               │
│  │ NOAA       │ │ OpenWeather  │ │ UN Comtrade  │               │
│  │ (Conf: 92%)│ │ (Conf: 85%)  │ │ (Conf: 78%) │               │
│  └────────────┘ └──────────────┘ └─────────────┘               │
│  + Synthetic Model (Conf: 60%) — labeled per Manifesto          │
└─────────────────────────────────────────────────────────────────┘
```

## Technology Stack
| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 14 (App Router) | UI framework |
| Styling | Tailwind CSS | Utility-first CSS |
| Charts | Recharts | Data visualization |
| Language | TypeScript | Type safety |
| Backend | Python FastAPI | API server |
| Data | Pandas, JSON | Data orchestration |
| Theme | Real Rails DNA | #030712 Obsidian Black |

## Visual Identity (Real Rails DNA)
- Background: `#030712` (Obsidian Black)
- Surface: `#0B1117` (Deep Navy Grey)
- Primary Accent: `#38BDF8` (Electric Cyan)
- Secondary Accent: `#818CF8` (Indigo)
- Borders: `#1F2937` (Slate-800)
- Font: Inter (tight letter-spacing)

## Data Flow
1. User selects a weather scenario via the Intelligence Sidebar
2. Frontend calls `GET /api/scenarios/{scenario_id}`
3. Backend loads mock_data.json, enriches routes with intelligence metrics
4. Frontend renders the Main Stage (charts, tables) and Sidebar (insights)
5. All filters update without full page refresh (SPA behavior)
