import { BackendChartDataResponse, BackendPricesResponse, FuelType, REGIONS } from "@/types/fuel";

// Simulated 14-day history around the 2022 German fuel rebate ("Tankrabatt")
const DATES = [
  "2022-05-25", "2022-05-26", "2022-05-27", "2022-05-28", "2022-05-29",
  "2022-05-30", "2022-05-31", "2022-06-01", "2022-06-02", "2022-06-03",
  "2022-06-04", "2022-06-05", "2022-06-06", "2022-06-07"
];

const WEEKS = [20, 21, 22, 23];

function formatDateDisplay(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

// Regional base price offsets in €/L
const REGION_OFFSETS: Record<string, number> = {
  Ansbach: -0.012,
  Potsdam: 0.008,
  Aachen: -0.018,
  "Annaberg-Buchholz": 0.024,
  Hamburg: 0.015,
  Stuttgart: -0.005,
};

// Base price curves (showing pre-rebate high around 2.05€ then dropping on June 1st)
const BASE_PRICES: Record<string, Record<FuelType, number>> = {
  "2022-05-25": { diesel: 2.029, e5: 2.139, e10: 2.079 },
  "2022-05-26": { diesel: 2.035, e5: 2.145, e10: 2.085 },
  "2022-05-27": { diesel: 2.049, e5: 2.159, e10: 2.099 },
  "2022-05-28": { diesel: 2.052, e5: 2.164, e10: 2.104 },
  "2022-05-29": { diesel: 2.059, e5: 2.172, e10: 2.112 },
  "2022-05-30": { diesel: 2.065, e5: 2.179, e10: 2.119 },
  "2022-05-31": { diesel: 2.069, e5: 2.185, e10: 2.125 },
  // Tankrabatt starts June 1st (tax cut: ~14c for diesel, ~30c for petrol)
  "2022-06-01": { diesel: 1.959, e5: 1.919, e10: 1.859 },
  "2022-06-02": { diesel: 1.942, e5: 1.895, e10: 1.835 },
  "2022-06-03": { diesel: 1.939, e5: 1.889, e10: 1.829 },
  "2022-06-04": { diesel: 1.948, e5: 1.902, e10: 1.842 },
  "2022-06-05": { diesel: 1.965, e5: 1.929, e10: 1.869 },
  "2022-06-06": { diesel: 1.982, e5: 1.949, e10: 1.889 },
  "2022-06-07": { diesel: 1.995, e5: 1.962, e10: 1.902 },
};

export function getMockDayPrices(areaId?: number): BackendPricesResponse {
  const prices = DATES.map((date) => {
    const base = BASE_PRICES[date];
    const offset = areaId !== undefined && REGIONS[areaId]
      ? REGION_OFFSETS[REGIONS[areaId].name] || 0
      : 0;

    return {
      date: formatDateDisplay(date),
      diesel: (base.diesel + offset).toFixed(5),
      e5: (base.e5 + offset).toFixed(5),
      e10: (base.e10 + offset).toFixed(5),
    };
  });

  return { prices: prices.reverse() };
}

export function getMockWeekPrices(areaId?: number): BackendPricesResponse {
  const weekData = [
    { kw: 20, diesel: 2.025, e5: 2.135, e10: 2.075 },
    { kw: 21, diesel: 2.048, e5: 2.158, e10: 2.098 },
    { kw: 22, diesel: 2.062, e5: 2.176, e10: 2.116 },
    { kw: 23, diesel: 1.961, e5: 1.918, e10: 1.858 },
  ];

  const prices = weekData.map((row) => {
    const offset = areaId !== undefined && REGIONS[areaId]
      ? REGION_OFFSETS[REGIONS[areaId].name] || 0
      : 0;

    return {
      date: String(row.kw),
      diesel: (row.diesel + offset).toFixed(5),
      e5: (row.e5 + offset).toFixed(5),
      e10: (row.e10 + offset).toFixed(5),
    };
  });

  return { prices: prices.reverse() };
}

export function getMockChartData(timeframe: "day" | "week", fuelType: FuelType): BackendChartDataResponse {
  if (timeframe === "day") {
    const columns: (string | number)[][] = [
      ["x", ...DATES]
    ];

    for (const region of REGIONS) {
      const offset = REGION_OFFSETS[region.name] || 0;
      const values: (string | number)[] = [region.name];
      for (const d of DATES) {
        const val = BASE_PRICES[d][fuelType] + offset;
        values.push(Number(val.toFixed(5)));
      }
      columns.push(values);
    }

    return {
      data: {
        x: "x",
        columns,
      },
    };
  } else {
    const columns: (string | number)[][] = [
      ["x", ...WEEKS]
    ];

    const weekAvg: Record<number, Record<FuelType, number>> = {
      20: { diesel: 2.025, e5: 2.135, e10: 2.075 },
      21: { diesel: 2.048, e5: 2.158, e10: 2.098 },
      22: { diesel: 2.062, e5: 2.176, e10: 2.116 },
      23: { diesel: 1.961, e5: 1.918, e10: 1.858 },
    };

    for (const region of REGIONS) {
      const offset = REGION_OFFSETS[region.name] || 0;
      const values: (string | number)[] = [region.name];
      for (const kw of WEEKS) {
        const val = weekAvg[kw][fuelType] + offset;
        values.push(Number(val.toFixed(5)));
      }
      columns.push(values);
    }

    return {
      data: {
        x: "x",
        columns,
      },
    };
  }
}

