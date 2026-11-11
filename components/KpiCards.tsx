"use client";

import React from "react";
import { FuelType, PriceRow } from "@/types/fuel";

interface KpiCardsProps {
  latestDayPrices: PriceRow[];
  chartDataDailyDiesel?: { minCity: string; minVal: number; maxCity: string; maxVal: number };
  chartDataDailyE5?: { minCity: string; minVal: number; maxCity: string; maxVal: number };
  chartDataDailyE10?: { minCity: string; minVal: number; maxCity: string; maxVal: number };
}

export function KpiCards({
  latestDayPrices,
  chartDataDailyDiesel,
  chartDataDailyE5,
  chartDataDailyE10,
}: KpiCardsProps) {
  // If we have at least 2 days of data, calculate price change
  const current = latestDayPrices[0];
  const previous = latestDayPrices[1];

  const getDelta = (fuel: "diesel" | "e5" | "e10") => {
    if (!current || !previous) return null;
    const curVal = parseFloat(current[fuel]);
    const prevVal = parseFloat(previous[fuel]);
    if (isNaN(curVal) || isNaN(prevVal)) return null;
    return curVal - prevVal;
  };

  const formatPrice = (valStr?: string) => {
    if (!valStr) return "–";
    const num = parseFloat(valStr);
    return isNaN(num) ? "–" : num.toFixed(3).replace(".", ",");
  };

  const cards = [
    {
      id: "diesel" as FuelType,
      name: "Diesel",
      sub: "Dieselkraftstoff",
      price: formatPrice(current?.diesel),
      delta: getDelta("diesel"),
      spread: chartDataDailyDiesel,
      theme: {
        border: "border-amber-500/20 hover:border-amber-500/40",
        bg: "from-amber-950/20 to-slate-900/60",
        badge: "bg-amber-500/10 text-amber-400 border-amber-500/30",
        text: "text-amber-400",
      },
    },
    {
      id: "e5" as FuelType,
      name: "Super E5",
      sub: "Super 95 (5% Ethanol)",
      price: formatPrice(current?.e5),
      delta: getDelta("e5"),
      spread: chartDataDailyE5,
      theme: {
        border: "border-emerald-500/20 hover:border-emerald-500/40",
        bg: "from-emerald-950/20 to-slate-900/60",
        badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
        text: "text-emerald-400",
      },
    },
    {
      id: "e10" as FuelType,
      name: "Super E10",
      sub: "Super 95 (10% Ethanol)",
      price: formatPrice(current?.e10),
      delta: getDelta("e10"),
      spread: chartDataDailyE10,
      theme: {
        border: "border-sky-500/20 hover:border-sky-500/40",
        bg: "from-sky-950/20 to-slate-900/60",
        badge: "bg-sky-500/10 text-sky-400 border-sky-500/30",
        text: "text-sky-400",
      },
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card) => {
        const isUp = card.delta !== null && card.delta > 0.0001;
        const isDown = card.delta !== null && card.delta < -0.0001;

        return (
          <div
            key={card.id}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-b ${card.theme.bg} p-5 border ${card.theme.border} transition-all duration-200 shadow-lg`}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${card.theme.badge}`}>
                  {card.name}
                </span>
                <p className="text-xs text-slate-400 mt-1">{card.sub}</p>
              </div>

              {card.delta !== null && (
                <div
                  className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md ${
                    isDown
                      ? "text-emerald-400 bg-emerald-500/10"
                      : isUp
                      ? "text-rose-400 bg-rose-500/10"
                      : "text-slate-400 bg-slate-800"
                  }`}
                >
                  <span>
                    {isDown ? "▼" : isUp ? "▲" : "–"}{" "}
                    {Math.abs(card.delta * 100).toFixed(1)} ct/L
                  </span>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
                {card.price}
              </span>
              <span className="text-sm font-medium text-slate-400">€ / Liter</span>
            </div>

            {card.spread && (
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <div>
                  <span className="text-emerald-400 font-medium">Günstig:</span>{" "}
                  {card.spread.minCity} ({card.spread.minVal.toFixed(3).replace(".", ",")} €)
                </div>
                <div>
                  <span className="text-rose-400 font-medium">Teuer:</span>{" "}
                  {card.spread.maxCity} ({card.spread.maxVal.toFixed(3).replace(".", ",")} €)
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
