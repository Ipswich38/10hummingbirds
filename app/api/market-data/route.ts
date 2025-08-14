import { NextResponse } from "next/server"
import { marketDataService } from "@/lib/market-data-service"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const market = searchParams.get("market") as "forex" | "crypto" | "stocks" | null

    if (market) {
      const data = marketDataService.getMarketDataByType(market)
      return NextResponse.json({ success: true, data })
    }

    const data = marketDataService.getMarketData()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch market data" }, { status: 500 })
  }
}
