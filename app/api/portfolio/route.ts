import { NextResponse } from "next/server"
import { portfolioService } from "@/lib/portfolio-service"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    switch (type) {
      case "positions":
        const status = searchParams.get("status") as "open" | "closed" | undefined
        const positions = portfolioService.getPositions(status)
        return NextResponse.json({ success: true, data: positions })

      case "metrics":
        const metrics = portfolioService.getPortfolioMetrics()
        return NextResponse.json({ success: true, data: metrics })

      case "allocation":
        const allocation = portfolioService.getPortfolioAllocation()
        return NextResponse.json({ success: true, data: allocation })

      case "history":
        const days = Number.parseInt(searchParams.get("days") || "30")
        const history = portfolioService.getPerformanceHistory(days)
        return NextResponse.json({ success: true, data: history })

      default:
        return NextResponse.json({ success: false, error: "Invalid type parameter" }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch portfolio data" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    switch (action) {
      case "add":
        const newPosition = portfolioService.addPosition(data)
        return NextResponse.json({ success: true, data: newPosition })

      case "close":
        const closedPosition = portfolioService.closePosition(data.id, data.exitPrice)
        if (!closedPosition) {
          return NextResponse.json({ success: false, error: "Position not found" }, { status: 404 })
        }
        return NextResponse.json({ success: true, data: closedPosition })

      case "update":
        const updatedPosition = portfolioService.updatePosition(data.id, data.updates)
        if (!updatedPosition) {
          return NextResponse.json({ success: false, error: "Position not found" }, { status: 404 })
        }
        return NextResponse.json({ success: true, data: updatedPosition })

      default:
        return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to process portfolio action" }, { status: 500 })
  }
}
