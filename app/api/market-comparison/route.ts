import { type NextRequest, NextResponse } from "next/server"
import { marketComparisonService } from "@/lib/market-comparison-service"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbolsParam = searchParams.get("symbols")

    if (!symbolsParam) {
      return NextResponse.json({ error: "Symbols parameter is required" }, { status: 400 })
    }

    const symbols = symbolsParam.split(",").map((s) => s.trim())

    if (symbols.length < 2) {
      return NextResponse.json({ error: "At least 2 symbols are required for comparison" }, { status: 400 })
    }

    const comparison = await marketComparisonService.getMarketComparison(symbols)

    return NextResponse.json(comparison)
  } catch (error) {
    console.error("Market comparison API error:", error)
    return NextResponse.json({ error: "Failed to fetch market comparison data" }, { status: 500 })
  }
}
