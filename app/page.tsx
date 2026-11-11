"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { KpiCards } from "@/components/KpiCards";
import { FuelChart } from "@/components/FuelChart";
import { PriceTable } from "@/components/PriceTable";
import { Footer } from "@/components/Footer";
import { fetchChartData, fetchPrices, parseChartColumns } from "@/lib/api";
import { ChartSeries, FuelType, PriceRow, REGIONS, TimeResolution } from "@/types/fuel";

export default function Home() {
  // Chart states
  const [activeFuel, setActiveFuel] = useState<FuelType>("diesel");
  const [chartResolution, setChartResolution] = useState<TimeResolution>("day");
  const [chartSeries, setChartSeries] = useState<ChartSeries>({ points: [], regionNames: [] });
  const [isChartLoading, setIsChartLoading] = useState<boolean>(true);

  // Table states
  const [tableResolution, setTableResolution] = useState<TimeResolution>("day");
  const [selectedArea, setSelectedArea] = useState<number | null>(null);
  const [tablePrices, setTablePrices] = useState<PriceRow[]>([]);
  const [isTableLoading, setIsTableLoading] = useState<boolean>(true);

  // KPI states
  const [kpiPrices, setKpiPrices] = useState<PriceRow[]>([]);

  const handleFuelChange = (fuel: FuelType) => {
    setIsChartLoading(true);
    setActiveFuel(fuel);
  };

  const handleChartResolutionChange = (res: TimeResolution) => {
    setIsChartLoading(true);
    setChartResolution(res);
  };

  const handleTableResolutionChange = (res: TimeResolution) => {
    setIsTableLoading(true);
    setTableResolution(res);
  };

  const handleAreaChange = (areaId: number | null) => {
    setIsTableLoading(true);
    setSelectedArea(areaId);
  };

  // Load KPI baseline prices on mount
  useEffect(() => {
    fetchPrices("day", null).then((prices) => {
      setKpiPrices(prices);
    });
  }, []);

  // Load Chart data when activeFuel or chartResolution changes
  useEffect(() => {
    let isMounted = true;

    fetchChartData(chartResolution, activeFuel)
      .then((res) => {
        if (!isMounted) return;
        const parsed = parseChartColumns(res);
        setChartSeries(parsed);
      })
      .catch((err) => {
        console.error("Failed to fetch chart data:", err);
      })
      .finally(() => {
        if (isMounted) setIsChartLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeFuel, chartResolution]);

  // Load Table data when tableResolution or selectedArea changes
  useEffect(() => {
    let isMounted = true;

    fetchPrices(tableResolution, selectedArea)
      .then((prices) => {
        if (!isMounted) return;
        setTablePrices(prices);
      })
      .catch((err) => {
        console.error("Failed to fetch table prices:", err);
      })
      .finally(() => {
        if (isMounted) setIsTableLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [tableResolution, selectedArea]);

  // Calculate spreads for the latest day from chart series if available
  const spreads = useMemo(() => {
    if (chartSeries.points.length === 0) return {};
    const latest = chartSeries.points[chartSeries.points.length - 1];

    let minCity = "";
    let minVal = Infinity;
    let maxCity = "";
    let maxVal = -Infinity;

    for (const r of REGIONS) {
      const v = latest[r.name];
      if (typeof v === "number" && !isNaN(v)) {
        if (v < minVal) {
          minVal = v;
          minCity = r.name;
        }
        if (v > maxVal) {
          maxVal = v;
          maxCity = r.name;
        }
      }
    }

    if (minCity && maxCity) {
      return {
        [activeFuel]: { minCity, minVal, maxCity, maxVal },
      };
    }
    return {};
  }, [chartSeries, activeFuel]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Intro Hero Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-2">
              Markttransparenzstelle & Tankstellen-Monitor
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Kraftstoffpreise in Deutschland
            </h1>
            <p className="mt-1 text-sm text-slate-400 max-w-2xl">
              Vergleichende Analyse der Kraftstoffpreise für Diesel, Super E5 und Super E10
              über 6 ausgewählte deutsche Regionen im Tages- und Wochenverlauf.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-800 self-start sm:self-auto">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>6 Standorte erfasst</span>
          </div>
        </div>

        {/* Top KPI Metric Cards */}
        <section aria-label="Aktuelle Preise">
          <KpiCards
            latestDayPrices={kpiPrices}
            chartDataDailyDiesel={activeFuel === "diesel" ? spreads.diesel : undefined}
            chartDataDailyE5={activeFuel === "e5" ? spreads.e5 : undefined}
            chartDataDailyE10={activeFuel === "e10" ? spreads.e10 : undefined}
          />
        </section>

        {/* Interactive Charts Section */}
        <section aria-label="Preisentwicklung">
          <FuelChart
            series={chartSeries}
            activeFuel={activeFuel}
            onFuelChange={handleFuelChange}
            activeResolution={chartResolution}
            onResolutionChange={handleChartResolutionChange}
            isLoading={isChartLoading}
          />
        </section>

        {/* Tabular Price Details */}
        <section aria-label="Preistabelle">
          <PriceTable
            prices={tablePrices}
            selectedArea={selectedArea}
            onAreaChange={handleAreaChange}
            resolution={tableResolution}
            onResolutionChange={handleTableResolutionChange}
            isLoading={isTableLoading}
          />
        </section>

        {/* Regional Coverage Infobox */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 text-xs text-slate-400">
          <h3 className="font-semibold text-slate-300 text-sm mb-2 flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Über die erfassten Regionen
          </h3>
          <p className="leading-relaxed">
            fuelsentinel erfasst kontinuierlich die Preisbewegungen an Stationen verschiedener
            Marken (u. a. ARAL, Shell, TotalEnergies, jet, ESSO, AVIA, Star) in sechs
            strukturell unterschiedlichen Regionen Deutschlands:{" "}
            <span className="text-slate-300 font-medium">Aachen (West)</span>,{" "}
            <span className="text-slate-300 font-medium">Annaberg-Buchholz (Erzgebirge)</span>,{" "}
            <span className="text-slate-300 font-medium">Ansbach (Franken)</span>,{" "}
            <span className="text-slate-300 font-medium">Hamburg (Metropole Nord)</span>,{" "}
            <span className="text-slate-300 font-medium">Potsdam (Ost)</span> und{" "}
            <span className="text-slate-300 font-medium">Stuttgart (Metropole Süd)</span>.
            Dadurch lassen sich regionale Preisspannen und bundesweite Trends objektiv nachvollziehen.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
