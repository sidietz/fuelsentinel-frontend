import {
  BackendChartDataResponse,
  BackendPricesResponse,
  ChartSeries,
  FuelType,
  ParsedDataPoint,
  PriceRow,
  TimeResolution,
} from "@/types/fuel";
import { getMockChartData, getMockDayPrices, getMockWeekPrices } from "./mockData";

export async function fetchPrices(
  resolution: TimeResolution,
  areaId?: number | null
): Promise<PriceRow[]> {
  const isArea = areaId !== null && areaId !== undefined && areaId >= 0;
  const endpoint = isArea
    ? `/api/area/${areaId}/${resolution}`
    : `/api/${resolution}`;

  try {
    const res = await fetch(endpoint, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data: BackendPricesResponse = await res.json();
    if (data && Array.isArray(data.prices) && data.prices.length > 0) {
      return data.prices;
    }
    throw new Error("Empty prices array");
  } catch (err) {
    console.warn(`[fuelsentinel] Backend fetch failed for ${endpoint}, using mock fallback:`, err);
    if (resolution === "day") {
      return getMockDayPrices(isArea ? areaId : undefined).prices;
    } else {
      return getMockWeekPrices(isArea ? areaId : undefined).prices;
    }
  }
}

export async function fetchChartData(
  resolution: TimeResolution,
  fuelType: FuelType
): Promise<BackendChartDataResponse> {
  const endpoint = `/api/charts/${resolution}/${fuelType}`;

  try {
    const res = await fetch(endpoint, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data: BackendChartDataResponse = await res.json();
    if (data && data.data && Array.isArray(data.data.columns) && data.data.columns.length > 0) {
      return data;
    }
    throw new Error("Empty chart columns");
  } catch (err) {
    console.warn(`[fuelsentinel] Backend fetch failed for ${endpoint}, using mock fallback:`, err);
    return getMockChartData(resolution, fuelType);
  }
}

/**
 * Transforms Billboard-style columns:
 * columns: [
 *   ["x", "2022-05-25", "2022-05-26", ...],
 *   ["Ansbach", 2.01, 2.02, ...],
 *   ...
 * ]
 * into a structured ChartSeries:
 * points: [{ label: "2022-05-25", displayLabel: "25.05.", Ansbach: 2.01, ... }]
 */
export function parseChartColumns(res: BackendChartDataResponse): ChartSeries {
  const columns = res.data?.columns || [];
  if (columns.length === 0) {
    return { points: [], regionNames: [] };
  }

  const xCol = columns.find((col) => col[0] === "x") || columns[0];
  const regionCols = columns.filter((col) => col !== xCol);

  const regionNames = regionCols.map((col) => String(col[0]));
  const points: ParsedDataPoint[] = [];

  const xValues = xCol.slice(1);
  for (let i = 0; i < xValues.length; i++) {
    const rawX = String(xValues[i]);
    let display = rawX;

    // Check if ISO date "YYYY-MM-DD"
    if (rawX.includes("-") && rawX.split("-").length === 3) {
      const parts = rawX.split("-");
      display = `${parts[2]}.${parts[1]}.`;
    } else if (!isNaN(Number(rawX))) {
      display = `KW ${rawX}`;
    }

    const point: ParsedDataPoint = {
      label: rawX,
      displayLabel: display,
    };

    for (const regCol of regionCols) {
      const name = String(regCol[0]);
      const val = regCol[i + 1];
      if (typeof val === "number") {
        point[name] = val;
      } else if (typeof val === "string") {
        const num = parseFloat(val);
        point[name] = isNaN(num) ? undefined : num;
      }
    }

    points.push(point);
  }

  return { points, regionNames };
}
