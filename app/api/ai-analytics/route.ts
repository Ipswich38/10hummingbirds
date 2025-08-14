import { NextResponse } from "next/server"
import { aiAnalyticsService } from "@/lib/ai-analytics-service"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const market = (searchParams.get("market") as "forex" | "crypto" | "stocks") || "forex"
    const pairsParam = searchParams.get("pairs")

    const defaultPairs = {
      forex: ["EUR/USD", "GBP/USD", "USD/JPY"],
      crypto: ["BTC/USD", "ETH/USD", "ADA/USD"],
      stocks: ["AAPL", "TSLA", "NVDA"],
    }

    const pairs = pairsParam ? pairsParam.split(",") : defaultPairs[market]
    const analysis = aiAnalyticsService.getAIAnalysis(pairs, market)

    return NextResponse.json({ success: true, data: analysis })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to generate AI analysis" }, { status: 500 })
  }
}
