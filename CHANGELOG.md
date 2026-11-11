# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.0.1] - 2026-11-11

### Added
- **Next.js 16 App Router Migration**: Modern frontend framework running on React 19 and Tailwind CSS v4.
- **Unified Interactive SVG Fuel Chart (`FuelChart.tsx`)**:
  - Replaced legacy 6 stacked charts with a single responsive time-series chart component.
  - Smooth cubic Bézier curve rendering with custom coordinate projections.
  - Interactive fuel selector tabs (**Diesel**, **Super E5**, **Super E10**).
  - Four-tier time resolution switcher: **Jährlich** (Yearly, default), **Monatlich** (Monthly, rolling last 12 months), **Wöchentlich** (Weekly, KW), and **Täglich** (Daily).
  - Clickable region legend pills to toggle or isolate specific cities (Aachen, Annaberg-Buchholz, Ansbach, Hamburg, Potsdam, Stuttgart).
  - Interactive vertical crosshair guide with a floating glassmorphism tooltip card displaying prices ranked from lowest to highest.
- **KPI Summary Cards (`KpiCards.tsx`)**:
  - Prominent cards displaying latest average prices for Diesel, Super E5, and Super E10.
  - 24-hour price trend indicator (delta in ct/L).
  - Regional spread indicator identifying the cheapest and most expensive monitored cities.
- **Dynamic Price Data Table (`PriceTable.tsx`)**:
  - Tabular view supporting all four time resolutions with adaptive headers (`Jahr`, `Monat`, `Kalenderwoche (KW)`, `Datum`).
  - Regional filter pills for city-specific drilldowns or overall German averages.
  - Formatted currency values in standard Euro format (`€ / L`).
- **InfluxDB Backend Integration (`backend-new.py`)**:
  - Activated Flask app entrypoint `backend-new.py` utilizing the InfluxDB v2 Flux client and Pandas aggregations on port `63943`.
  - Added new yearly endpoints: `/api/year`, `/api/area/<id>/year`, and `/api/charts/year/<fuel>`.
  - Added new monthly endpoints: `/api/month`, `/api/area/<id>/month`, and `/api/charts/month/<fuel>`.
  - Parameterized InfluxDB query ranges (`-1y` for 12 months, `-5y` for multi-year) with connection error recovery.
- **Resilient Mock & Proxy Layer (`lib/mockData.ts`, `app/api/[...slug]/route.ts`)**:
  - Next.js API route proxying to InfluxDB backend on port `63943`.
  - Integrated realistic multi-year (2020–2024), 12-month rolling, and daily mock datasets enabling full offline frontend development and testing.
- **Brand Header & Footer**:
  - Modern navigation bar with live status indicator badge.
  - Clean footer honoring the original project and linking to [plantwatch.de](https://plantwatch.de) and Impressum.

### Changed
- Migrated legacy frontend from deprecated Create React App (CRA) and Bootstrap 5 to Next.js 16 + Tailwind CSS v4.
- Replaced imperative Billboard.js / D3 DOM-mutating chart wrappers with declarative React SVG.
- Replaced PostgreSQL / psycopg2 queries with InfluxDB / Flux client in `backend-new.py`.
- Changed default landing view to the **"Jährlich"** (Yearly) resolution across both the chart and table.
- Corrected German spelling throughout the UI ("Wöchentlich" instead of "Wöchtenlich", "Impressum" instead of "Impressium").
- Aligned backend port from `1024` to `63943`.

### Removed
- Removed deprecated Create React App build scripts and outdated `react-billboardjs` dependencies.
- Removed legacy unstyled HTML table layout and hardcoded Bootstrap CSS overrides.
- Removed external Google Fonts runtime network fetching to guarantee reliable offline builds.

