# Fuelsentinel Frontend Plan: Adding "Jährlich" (Yearly) as the Default Tab

## 1. Executive Summary & Objective

The objective is to expand the time resolutions in **fuelsentinel** by introducing a **"Jährlich" (Yearly)** tab alongside the existing "Täglich" (Daily) and "Wöchentlich" (Weekly) views across both the **Interactive Fuel Chart** and the **Price Table**, and making **"Jährlich" the default view**.

This provides users with an immediate macro-overview of long-term fuel price development in Germany (e.g. 2020–2024), before allowing them to drill down into weekly or daily trends.

---

## 2. Updated API Contract & Data Model

The API endpoints will be extended to support `year` as a first-class resolution parameter:

```
GET /api/year                          -> { prices: [{ date: "2024", diesel: "...", e5: "...", e10: "..." }, ...] }
GET /api/area/<area_id>/year           -> { prices: [{ date: "2024", diesel: "...", e5: "...", e10: "..." }, ...] }
GET /api/charts/year/<fuel_type>       -> { data: { x: "x", columns: [["x", "2020", "2021", ...], ["Ansbach", ...], ...] } }
```

### Backend Implementation Specification (Flask / PostgreSQL):
In the Python backend (`app.py` / `backend.py`):
```python
@app.route('/api/year')
@cross_origin()
def get_yearly():
    sql = "SELECT extract(year from changed_at::date)::int as jahr, avg(diesel) as diesel_avg, avg(e5) as e5_avg, avg(e10) as e10_avg FROM prices GROUP BY jahr ORDER BY jahr DESC;"
    # ... executes and returns formatted rows ...

@app.route('/api/area/<area_number>/year')
@cross_origin()
def get_area_by_year(area_number):
    sql = "SELECT extract(year from changed_at::date)::int as jahr, avg(diesel) as diesel_avg, avg(e5) as e5_avg, avg(e10) as e10_avg FROM (SELECT * FROM prices, stations WHERE prices.station_id = stations.station_id AND stations.area = %s) as prices_table GROUP BY jahr ORDER BY jahr DESC;"
    # ... executes and returns formatted rows ...

@app.route('/api/charts/year/<fuel_type>')
@cross_origin()
def get_charts_year_fuel_selection(fuel_type):
    sql = "SELECT extract(year from prices.changed_at::date)::int as jahr, stations.area, avg(diesel) as diesel_avg, avg(e5) as e5_avg, avg(e10) as e10_avg FROM prices, stations WHERE prices.station_id = stations.station_id GROUP BY jahr, stations.area ORDER BY jahr;"
    # ... formats into columns matrix ...
```

---

## 3. Frontend Architecture & Implementation Plan

### 3.1 Type Definitions (`new/frontend/types/fuel.ts`)
Update `TimeResolution` to include `'year'`:
```typescript
export type TimeResolution = "year" | "day" | "week";
```

### 3.2 Mock & Resilient Proxy Layer (`lib/mockData.ts` & `app/api/[...slug]/route.ts`)
- Add `getMockYearPrices(areaId?: number)`:
  - Multi-year German fuel price history reflecting actual annual averages (2020: pandemic lows ~1.11–1.26 €, 2021: recovery ~1.39–1.52 €, 2022: peak energy crisis ~1.95–2.01 €, 2023: normalization ~1.72–1.83 €, 2024: ~1.65–1.76 €).
- Add `year` branch in `getMockChartData("year", fuelType)`.
- Update `app/api/[...slug]/route.ts` to handle:
  - `path === "year"`
  - `path.startsWith("area/") && resolution === "year"`
  - `path.startsWith("charts/") && resolution === "year"`

### 3.3 Interactive Chart (`components/FuelChart.tsx`)
- Tab Order: Place **"Jährlich"** as the first tab in the resolution switcher:
  `[ Jährlich | Täglich | Wöchentlich ]`
- Date formatting: Display 4-digit years (e.g. `2022`, `2023`) directly on the X-axis and inside the tooltip card without date truncation.
- Bézier curve rendering adjusted for annual intervals.

### 3.4 Price Table (`components/PriceTable.tsx`)
- Add **"Jährlich"** button to the timeframe selector:
  `[ Jährlich | Täglich | Wöchentlich ]`
- Table column header dynamically adapts:
  - When `resolution === "year"`: Header label displays **"Jahr"**
  - When `resolution === "day"`: Header label displays **"Datum"**
  - When `resolution === "week"`: Header label displays **"Kalenderwoche (KW)"**
- Rows display annual entries cleanly (e.g., `2024`, `2023`, `2022`, `2021`, `2020`).

### 3.5 Page Dashboard Defaults (`app/page.tsx`)
- Set initial state defaults:
  ```typescript
  const [chartResolution, setChartResolution] = useState<TimeResolution>("year");
  const [tableResolution, setTableResolution] = useState<TimeResolution>("year");
  ```
- KPI cards retain baseline daily data (`fetchPrices("day", null)`) for 24h delta tracking, while chart and table render the macro yearly perspective by default.

---

## 4. Execution Steps

1. **Update Types**: Modify `TimeResolution` in `types/fuel.ts`.
2. **Update Mock Data & API Proxy**: Add yearly dataset in `lib/mockData.ts` and handle `/api/year` in `app/api/[...slug]/route.ts`.
3. **Update UI Components**:
   - `FuelChart.tsx`: Add "Jährlich" tab, year formatting, adjust active styles.
   - `PriceTable.tsx`: Add "Jährlich" tab, dynamic "Jahr" table column header.
4. **Update Page State**: Set default state to `"year"` in `app/page.tsx`.
5. **Update Documentation**: Synchronize `new/frontend/doc/plan001.md`.
6. **Verification**: Run `npm run lint` and `npm run build` to verify clean compilation.

---

## 5. Review & Feedback Request
Please review this plan. Upon your approval, we will proceed immediately with the implementation!
