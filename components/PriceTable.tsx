"use client";

import React, { useState } from "react";
import { PriceRow, REGIONS, TimeResolution } from "@/types/fuel";

interface PriceTableProps {
  prices: PriceRow[];
  selectedArea: number | null;
  onAreaChange: (areaId: number | null) => void;
  resolution: TimeResolution;
  onResolutionChange: (res: TimeResolution) => void;
  isLoading?: boolean;
}

export function PriceTable({
  prices,
  selectedArea,
  onAreaChange,
  resolution,
  onResolutionChange,
  isLoading = false,
}: PriceTableProps) {
  const [showAllRows, setShowAllRows] = useState(false);

  const displayedPrices = showAllRows ? prices : prices.slice(0, 10);

  const formatPrice = (rawStr: string) => {
    const num = parseFloat(rawStr);
    if (isNaN(num)) return "–";
    return num.toFixed(3).replace(".", ",") + " €";
  };

  const getAreaName = () => {
    if (selectedArea === null || selectedArea === undefined) {
      return "Alle Regionen (Gesamtschnitt)";
    }
    const found = REGIONS.find((r) => r.id === selectedArea);
    return found ? found.name : "Region";
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl backdrop-blur-sm">
      {/* Header & Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold tracking-tight text-white">
              Preistabelle ({getAreaName()})
            </h2>
            <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700/60 font-mono">
              {prices.length} Einträge
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Historische Preisübersicht für {resolution === "day" ? "Tagesdurchschnitte" : "Kalenderwochen (KW)"}
          </p>
        </div>

        {/* Timeframe Tabs */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg bg-slate-800/80 p-1 border border-slate-700/60 text-xs">
            <button
              type="button"
              onClick={() => onResolutionChange("day")}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                resolution === "day"
                  ? "bg-slate-700 text-white font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Täglich
            </button>
            <button
              type="button"
              onClick={() => onResolutionChange("week")}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                resolution === "week"
                  ? "bg-slate-700 text-white font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Wöchentlich
            </button>
          </div>
        </div>
      </div>

      {/* Region Selector Pills */}
      <div className="py-3 flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-slate-400 font-medium mr-1">Filter:</span>
        <button
          type="button"
          onClick={() => onAreaChange(null)}
          className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
            selectedArea === null
              ? "bg-amber-500 text-black border-amber-400 font-semibold shadow-sm"
              : "bg-slate-800/70 text-slate-300 border-slate-700/80 hover:bg-slate-800"
          }`}
        >
          Alle Regionen
        </button>

        {REGIONS.map((region) => (
          <button
            key={region.id}
            type="button"
            onClick={() => onAreaChange(region.id)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
              selectedArea === region.id
                ? "bg-slate-700 text-white border-slate-500 font-semibold shadow-sm"
                : "bg-slate-800/70 text-slate-300 border-slate-700/80 hover:bg-slate-800"
            }`}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: region.color }}
            />
            {region.name}
          </button>
        ))}
      </div>

      {/* Responsive Table Container */}
      <div className="mt-2 overflow-x-auto rounded-xl border border-slate-800/90">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-800/50 text-xs font-semibold text-slate-300 uppercase tracking-wider">
              <th scope="col" className="px-4 py-3 font-medium">
                {resolution === "day" ? "Datum" : "Kalenderwoche (KW)"}
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                <span className="inline-flex items-center gap-1.5 text-amber-400">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Diesel
                </span>
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                <span className="inline-flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Super E5
                </span>
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                <span className="inline-flex items-center gap-1.5 text-sky-400">
                  <span className="w-2 h-2 rounded-full bg-sky-400" />
                  Super E10
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                  <div className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-amber-500" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Lade Daten...
                  </div>
                </td>
              </tr>
            ) : prices.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                  Keine Preise verfügbar.
                </td>
              </tr>
            ) : (
              displayedPrices.map((row, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-slate-800/40 transition-colors"
                >
                  <td className="px-4 py-2.5 font-sans font-medium text-slate-200">
                    {resolution === "week" ? `KW ${row.date}` : row.date}
                  </td>
                  <td className="px-4 py-2.5 text-slate-300">
                    {formatPrice(row.diesel)}
                  </td>
                  <td className="px-4 py-2.5 text-slate-300">
                    {formatPrice(row.e5)}
                  </td>
                  <td className="px-4 py-2.5 text-slate-300">
                    {formatPrice(row.e10)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Expand / Collapse toggle if more than 10 rows */}
      {prices.length > 10 && (
        <div className="mt-3 flex justify-center">
          <button
            type="button"
            onClick={() => setShowAllRows(!showAllRows)}
            className="text-xs text-amber-400 hover:text-amber-300 font-medium py-1 px-3 rounded-lg hover:bg-slate-800/50 transition-colors"
          >
            {showAllRows
              ? "▲ Weniger anzeigen (Top 10)"
              : `▼ Alle ${prices.length} Einträge anzeigen`}
          </button>
        </div>
      )}
    </div>
  );
}

