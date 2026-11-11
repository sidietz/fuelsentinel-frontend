export type FuelType = "diesel" | "e5" | "e10";

export type TimeResolution = "year" | "month" | "week" | "day";

export interface AreaInfo {
  id: number;
  name: string;
  color: string;
}

export const REGIONS: AreaInfo[] = [
  { id: 0, name: "Ansbach", color: "#3b82f6" },           // blue-500
  { id: 1, name: "Potsdam", color: "#10b981" },           // emerald-500
  { id: 2, name: "Aachen", color: "#f59e0b" },            // amber-500
  { id: 3, name: "Annaberg-Buchholz", color: "#ec4899" }, // pink-500
  { id: 4, name: "Hamburg", color: "#8b5cf6" },           // violet-500
  { id: 5, name: "Stuttgart", color: "#06b6d4" },         // cyan-500
];

export const FUEL_LABELS: Record<FuelType, { label: string; desc: string; color: string }> = {
  diesel: { label: "Diesel", desc: "Dieselkraftstoff", color: "#f59e0b" },
  e5: { label: "Super E5", desc: "Superbenzin 95 (5% Ethanol)", color: "#10b981" },
  e10: { label: "Super E10", desc: "Superbenzin 95 (10% Ethanol)", color: "#3b82f6" },
};

export interface PriceRow {
  date: string; // DD.MM.YYYY or "KW 22"
  diesel: string;
  e5: string;
  e10: string;
}

export interface BackendPricesResponse {
  prices: PriceRow[];
}

export interface BackendChartDataResponse {
  data: {
    x: string;
    columns: (string | number)[][];
  };
}

export interface ParsedDataPoint {
  label: string;
  displayLabel: string;
  timestamp?: number;
  [regionName: string]: string | number | undefined;
}

export interface ChartSeries {
  points: ParsedDataPoint[];
  regionNames: string[];
}

