import { type NextRequest, NextResponse } from "next/server"
import { marketComparisonService } from "@/lib/market-comparison-service"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol1 = searchParams.get("symbol1")
    const symbol2 = searchParams.get("symbol2")

    if (!symbol1 || !symbol2) {
      return NextResponse.json({ error: "Both symbol1 and symbol2 parameters are required" }, { status: 400 })
    }

    const correlation = await marketComparisonService.getAssetCorrelation(symbol1, symbol2)

    return NextResponse.json(correlation)
  } catch (error) {
    console.error("Correlation API error:", error)
    return NextResponse.json({ error: "Failed to fetch correlation data" }, { status: 500 })
  }
}
