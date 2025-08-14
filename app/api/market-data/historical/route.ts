import { NextResponse } from "next/server"
import { marketDataService } from "@/lib/market-data-service"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const pair = searchParams.get("pair")
    const timeframe = (searchParams.get("timeframe") as "1h" | "4h" | "1d" | "1w") || "1h"

    if (!pair) {
      return NextResponse.json({ success: false, error: "Pair parameter is required" }, { status: 400 })
    }

    const data = marketDataService.getHistoricalData(pair, timeframe)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch historical data" }, { status: 500 })
  }
}
