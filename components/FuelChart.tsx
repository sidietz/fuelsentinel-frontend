"use client";

import React, { useMemo, useState, useRef } from "react";
import { ChartSeries, FuelType, REGIONS, TimeResolution, FUEL_LABELS } from "@/types/fuel";

interface FuelChartProps {
  series: ChartSeries;
  activeFuel: FuelType;
  onFuelChange: (fuel: FuelType) => void;
  activeResolution: TimeResolution;
  onResolutionChange: (res: TimeResolution) => void;
  isLoading?: boolean;
}

// Generate smooth cubic Bézier SVG path from array of points [x, y]
function generateSmoothPath(points: [number, number][]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0][0]} ${points[0][1]}`;

  let d = `M ${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }

  return d;
}

export function FuelChart({
  series,
  activeFuel,
  onFuelChange,
  activeResolution,
  onResolutionChange,
  isLoading = false,
}: FuelChartProps) {
  // Region filter: which regions are visible
  const [activeRegions, setActiveRegions] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    for (const r of REGIONS) {
      map[r.name] = true;
    }
    return map;
  });

  const toggleRegion = (name: string) => {
    setActiveRegions((prev) => {
      const currentActiveCount = Object.values(prev).filter(Boolean).length;
      // If clicking the only active one, select all instead
      if (prev[name] && currentActiveCount === 1) {
        const all: Record<string, boolean> = {};
        for (const r of REGIONS) all[r.name] = true;
        return all;
      }
      return { ...prev, [name]: !prev[name] };
    });
  };

  const selectOnlyRegion = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveRegions(() => {
      const next: Record<string, boolean> = {};
      for (const r of REGIONS) next[r.name] = r.name === name;
      return next;
    });
  };

  const selectAllRegions = () => {
    const all: Record<string, boolean> = {};
    for (const r of REGIONS) all[r.name] = true;
    setActiveRegions(all);
  };

  // Hover state
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // SVG dimensions
  const viewWidth = 920;
  const viewHeight = 400;
  const margin = { top: 30, right: 35, bottom: 45, left: 65 };
  const plotWidth = viewWidth - margin.left - margin.right;
  const plotHeight = viewHeight - margin.top - margin.bottom;

  const points = series.points;
  const hasData = points.length > 0;

  // Compute min & max prices across active regions
  const { minPrice, maxPrice, yTicks } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;

    for (const p of points) {
      for (const reg of REGIONS) {
        if (!activeRegions[reg.name]) continue;
        const val = p[reg.name];
        if (typeof val === "number" && !isNaN(val)) {
          if (val < min) min = val;
          if (val > max) max = val;
        }
      }
    }

    if (min === Infinity || max === -Infinity) {
      min = 1.8;
      max = 2.2;
    }

    // Add padding (2 cents or 10%)
    const span = max - min;
    const padding = Math.max(span * 0.12, 0.02);
    const paddedMin = Math.max(0, min - padding);
    const paddedMax = max + padding;

    // Generate 5 round tick values
    const ticks: number[] = [];
    const count = 5;
    const step = (paddedMax - paddedMin) / (count - 1);
    for (let i = 0; i < count; i++) {
      ticks.push(paddedMin + i * step);
    }

    return { minPrice: paddedMin, maxPrice: paddedMax, yTicks: ticks };
  }, [points, activeRegions]);

  // Coordinate scales
  const getY = (val: number) => {
    if (maxPrice <= minPrice) return margin.top + plotHeight / 2;
    const ratio = (val - minPrice) / (maxPrice - minPrice);
    return margin.top + plotHeight - ratio * plotHeight;
  };

  const getX = (index: number) => {
    if (points.length <= 1) return margin.left + plotWidth / 2;
    return margin.left + (index / (points.length - 1)) * plotWidth;
  };

  // Mouse / Touch tracking
  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current || points.length <= 1) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const scaleX = viewWidth / rect.width;
    const svgX = clientX * scaleX;

    const clampedX = Math.max(margin.left, Math.min(margin.left + plotWidth, svgX));
    const ratio = (clampedX - margin.left) / plotWidth;
    const index = Math.round(ratio * (points.length - 1));
    setHoverIndex(index);
  };

  const handlePointerLeave = () => {
    setHoverIndex(null);
  };

  const hoveredPoint = hoverIndex !== null && points[hoverIndex] ? points[hoverIndex] : null;

  // Ranked hover entries for the tooltip
  const hoverRanking = useMemo(() => {
    if (!hoveredPoint) return [];
    const entries: { name: string; val: number; color: string }[] = [];
    for (const reg of REGIONS) {
      if (!activeRegions[reg.name]) continue;
      const v = hoveredPoint[reg.name];
      if (typeof v === "number" && !isNaN(v)) {
        entries.push({ name: reg.name, val: v, color: reg.color });
      }
    }
    return entries.sort((a, b) => a.val - b.val);
  }, [hoveredPoint, activeRegions]);

  const hoverAverage = useMemo(() => {
    if (hoverRanking.length === 0) return null;
    const sum = hoverRanking.reduce((acc, curr) => acc + curr.val, 0);
    return sum / hoverRanking.length;
  }, [hoverRanking]);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl backdrop-blur-sm">
      {/* Chart Header & Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold tracking-tight text-white">
              Kraftstoffpreise im Zeitverlauf
            </h2>
            <span
              className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
              style={{
                backgroundColor: `${FUEL_LABELS[activeFuel].color}20`,
                color: FUEL_LABELS[activeFuel].color,
              }}
            >
              {FUEL_LABELS[activeFuel].label}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Durchschnittswerte der erfassten Stationen je Region in Euro pro Liter (€/L)
          </p>
        </div>

        {/* Tab Controls: Fuel Selection & Timeframe */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Fuel Selector */}
          <div className="inline-flex rounded-lg bg-slate-800/80 p-1 border border-slate-700/60 text-xs">
            {(["diesel", "e5", "e10"] as FuelType[]).map((fuel) => (
              <button
                key={fuel}
                type="button"
                onClick={() => onFuelChange(fuel)}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  activeFuel === fuel
                    ? "bg-slate-700 text-white shadow-sm font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {fuel === "diesel" ? "Diesel" : fuel === "e5" ? "Super E5" : "Super E10"}
              </button>
            ))}
          </div>

          {/* Resolution Selector */}
          <div className="inline-flex rounded-lg bg-slate-800/80 p-1 border border-slate-700/60 text-xs">
            <button
              type="button"
              onClick={() => onResolutionChange("day")}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                activeResolution === "day"
                  ? "bg-amber-500 text-black font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Täglich
            </button>
            <button
              type="button"
              onClick={() => onResolutionChange("week")}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                activeResolution === "week"
                  ? "bg-amber-500 text-black font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Wöchentlich
            </button>
          </div>
        </div>
      </div>

      {/* Region Legend Chips (Click to toggle / double click to isolate) */}
      <div className="flex flex-wrap items-center gap-2 py-3">
        <span className="text-xs text-slate-400 font-medium mr-1">Regionen:</span>
        {REGIONS.map((reg) => {
          const isActive = activeRegions[reg.name];
          return (
            <button
              key={reg.id}
              type="button"
              onClick={() => toggleRegion(reg.name)}
              title={`${reg.name} umschalten (Rechtsklick/Klick auf 'nur' für Einzelansicht)`}
              className={`group flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                isActive
                  ? "bg-slate-800/90 text-slate-200 border-slate-700 shadow-sm"
                  : "bg-slate-900/40 text-slate-500 border-slate-800/80 opacity-50 line-through"
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full transition-transform group-hover:scale-125"
                style={{ backgroundColor: reg.color }}
              />
              <span>{reg.name}</span>
              <span
                onClick={(e) => selectOnlyRegion(reg.name, e)}
                className="opacity-0 group-hover:opacity-100 text-[10px] text-slate-400 hover:text-white px-1 rounded bg-slate-700/60 ml-0.5"
                title={`Nur ${reg.name} anzeigen`}
              >
                nur
              </span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={selectAllRegions}
          className="text-[11px] text-slate-400 hover:text-amber-400 transition-colors ml-auto underline underline-offset-2"
        >
          Alle anzeigen
        </button>
      </div>

      {/* SVG Chart Viewport */}
      <div className="relative w-full overflow-hidden select-none">
        {isLoading ? (
          <div className="h-[360px] flex items-center justify-center">
            <div className="flex items-center gap-3 text-slate-400 text-sm">
              <svg className="animate-spin h-5 w-5 text-amber-500" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Lade Preisdaten...
            </div>
          </div>
        ) : !hasData ? (
          <div className="h-[360px] flex items-center justify-center text-slate-500 text-sm">
            Keine Daten für den gewählten Zeitraum verfügbar
          </div>
        ) : (
          <svg
            ref={svgRef}
            viewBox={`0 0 ${viewWidth} ${viewHeight}`}
            className="w-full h-auto cursor-crosshair overflow-visible"
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
          >
            {/* Gradients */}
            <defs>
              {REGIONS.map((r) => (
                <linearGradient key={r.name} id={`grad-${r.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={r.color} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={r.color} stopOpacity="0.0" />
                </linearGradient>
              ))}
            </defs>

            {/* Horizontal Gridlines & Y-Axis Labels */}
            {yTicks.map((tickVal, i) => {
              const y = getY(tickVal);
              return (
                <g key={i}>
                  <line
                    x1={margin.left}
                    y1={y}
                    x2={margin.left + plotWidth}
                    y2={y}
                    stroke="#334155"
                    strokeDasharray="4 4"
                    strokeWidth={0.7}
                  />
                  <text
                    x={margin.left - 10}
                    y={y + 4}
                    textAnchor="end"
                    fill="#94a3b8"
                    fontSize="11"
                    fontFamily="monospace"
                  >
                    {tickVal.toFixed(3).replace(".", ",")} €
                  </text>
                </g>
              );
            })}

            {/* X-Axis Labels */}
            {points.map((pt, i) => {
              // Show label every N steps depending on points count to avoid overlap
              const step = Math.ceil(points.length / 8);
              if (i % step !== 0 && i !== points.length - 1) return null;
              const x = getX(i);
              return (
                <g key={i}>
                  <line
                    x1={x}
                    y1={margin.top + plotHeight}
                    x2={x}
                    y2={margin.top + plotHeight + 6}
                    stroke="#475569"
                    strokeWidth={1}
                  />
                  <text
                    x={x}
                    y={margin.top + plotHeight + 20}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="11"
                  >
                    {pt.displayLabel}
                  </text>
                </g>
              );
            })}

            {/* Region Lines */}
            {REGIONS.map((reg) => {
              if (!activeRegions[reg.name]) return null;

              // Collect valid points
              const linePoints: [number, number][] = [];
              points.forEach((p, idx) => {
                const val = p[reg.name];
                if (typeof val === "number" && !isNaN(val)) {
                  linePoints.push([getX(idx), getY(val)]);
                }
              });

              if (linePoints.length === 0) return null;
              const pathData = generateSmoothPath(linePoints);

              return (
                <g key={reg.name}>
                  {/* Subtle wider line for glow/selection */}
                  <path
                    d={pathData}
                    fill="none"
                    stroke={reg.color}
                    strokeWidth={4}
                    strokeOpacity={0.15}
                    strokeLinecap="round"
                  />
                  {/* Main line */}
                  <path
                    d={pathData}
                    fill="none"
                    stroke={reg.color}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
              );
            })}

            {/* Active Hover Guide & Intersection Dots */}
            {hoverIndex !== null && points[hoverIndex] && (
              <g>
                {/* Vertical Guideline */}
                <line
                  x1={getX(hoverIndex)}
                  y1={margin.top}
                  x2={getX(hoverIndex)}
                  y2={margin.top + plotHeight}
                  stroke="#94a3b8"
                  strokeDasharray="3 3"
                  strokeWidth={1.2}
                />

                {/* Highlight circles on each active line */}
                {REGIONS.map((reg) => {
                  if (!activeRegions[reg.name]) return null;
                  const val = points[hoverIndex][reg.name];
                  if (typeof val !== "number" || isNaN(val)) return null;
                  const cx = getX(hoverIndex);
                  const cy = getY(val);

                  return (
                    <g key={reg.name}>
                      <circle
                        cx={cx}
                        cy={cy}
                        r={6}
                        fill={reg.color}
                        fillOpacity={0.3}
                      />
                      <circle
                        cx={cx}
                        cy={cy}
                        r={3.5}
                        fill="#0f172a"
                        stroke={reg.color}
                        strokeWidth={2}
                      />
                    </g>
                  );
                })}
              </g>
            )}
          </svg>
        )}

        {/* Hover Tooltip Card (Rendered via HTML/Tailwind for crisp text & glassmorphism) */}
        {hoverIndex !== null && hoveredPoint && hoverRanking.length > 0 && (
          <div
            className="absolute top-4 pointer-events-none transition-all duration-75 z-20"
            style={{
              left:
                getX(hoverIndex) > viewWidth * 0.55
                  ? `calc(${((getX(hoverIndex) - 20) / viewWidth) * 100}% - 240px)`
                  : `calc(${((getX(hoverIndex) + 20) / viewWidth) * 100}%)`,
            }}
          >
            <div className="w-56 rounded-xl bg-slate-900/95 border border-slate-700/80 p-3 shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                <span className="font-semibold text-xs text-white">
                  {hoveredPoint.label.includes("-") ? `Datum: ${hoveredPoint.displayLabel}` : hoveredPoint.displayLabel}
                </span>
                {hoverAverage !== null && (
                  <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                    Ø {hoverAverage.toFixed(3).replace(".", ",")} €
                  </span>
                )}
              </div>

              <div className="space-y-1.5 text-xs">
                {hoverRanking.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 truncate">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-slate-300 truncate text-[11px]">
                        {item.name}
                      </span>
                    </div>
                    <span className="font-mono font-medium text-white text-[11px] ml-2">
                      {item.val.toFixed(3).replace(".", ",")} €
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
