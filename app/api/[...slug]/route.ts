import { NextRequest, NextResponse } from "next/server";
import {
  getMockChartData,
  getMockDayPrices,
  getMockMonthPrices,
  getMockWeekPrices,
  getMockYearPrices,
} from "@/lib/mockData";
import { FuelType, TimeResolution } from "@/types/fuel";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const path = slug.join("/");
  const backendBase = process.env.BACKEND_URL || "http://127.0.0.1:63943";
  const targetUrl = `${backendBase}/api/${path}`;

  // Try proxying to Flask backend (backend-new.py on port 63943) with a short timeout
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1200);

    const backendRes = await fetch(targetUrl, {
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeout);

    if (backendRes.ok) {
      const data = await backendRes.json();
      return NextResponse.json(data);
    }
  } catch {
    // Backend offline or timeout -> serve mock data
  }

  // Handle mock responses based on path structure
  // 1. /api/charts/:resolution/:fuelType
  if (path.startsWith("charts/")) {
    const parts = path.split("/");
    const resolution = (parts[1] || "year") as TimeResolution;
    const fuelType = (parts[2] || "diesel") as FuelType;
    return NextResponse.json(getMockChartData(resolution, fuelType));
  }

  // 2. /api/area/:areaId/:resolution
  if (path.startsWith("area/")) {
    const parts = path.split("/");
    const areaId = parseInt(parts[1], 10);
    const parsedId = isNaN(areaId) ? undefined : areaId;
    const resolution = parts[2];
    if (resolution === "year") {
      return NextResponse.json(getMockYearPrices(parsedId));
    }
    if (resolution === "month") {
      return NextResponse.json(getMockMonthPrices(parsedId));
    }
    if (resolution === "week") {
      return NextResponse.json(getMockWeekPrices(parsedId));
    }
    return NextResponse.json(getMockDayPrices(parsedId));
  }

  // 3. /api/year
  if (path === "year") {
    return NextResponse.json(getMockYearPrices());
  }

  // 4. /api/month
  if (path === "month") {
    return NextResponse.json(getMockMonthPrices());
  }

  // 5. /api/week
  if (path === "week") {
    return NextResponse.json(getMockWeekPrices());
  }

  // 6. /api/day
  if (path === "day") {
    return NextResponse.json(getMockDayPrices());
  }

  // 7. /api/time
  if (path === "time") {
    return NextResponse.json({ time: Date.now() / 1000 });
  }

  return NextResponse.json({ error: "Endpoint not found" }, { status: 404 });
}
