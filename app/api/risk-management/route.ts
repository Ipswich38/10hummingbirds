import { NextResponse } from "next/server"
import { riskManagementService } from "@/lib/risk-management-service"
import { portfolioService } from "@/lib/portfolio-service"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    switch (type) {
      case "metrics":
        const positions = portfolioService.getPositions("open")
        const portfolioMetrics = portfolioService.getPortfolioMetrics()
        const riskMetrics = riskManagementService.calculateRiskMetrics(portfolioMetrics.totalValue, positions)
        return NextResponse.json({ success: true, data: riskMetrics })

      case "position-risk":
        const positionId = searchParams.get("positionId")
        if (!positionId) {
          return NextResponse.json({ success: false, error: "Position ID required" }, { status: 400 })
        }
        const position = portfolioService.getPosition(positionId)
        if (!position) {
          return NextResponse.json({ success: false, error: "Position not found" }, { status: 404 })
        }
        const portfolioValue = portfolioService.getPortfolioMetrics().totalValue
        const positionRisk = riskManagementService.calculatePositionRisk(position, portfolioValue)
        return NextResponse.json({ success: true, data: positionRisk })

      case "exposure":
        const allPositions = portfolioService.getPositions("open")
        const totalValue = portfolioService.getPortfolioMetrics().totalValue
        const exposure = riskManagementService.analyzeExposure(allPositions, totalValue)
        return NextResponse.json({ success: true, data: exposure })

      case "alerts":
        const severity = searchParams.get("severity") as "low" | "medium" | "high" | "critical" | undefined
        const alerts = riskManagementService.getRiskAlerts(severity)
        return NextResponse.json({ success: true, data: alerts })

      case "limits":
        const limits = riskManagementService.getRiskLimits()
        return NextResponse.json({ success: true, data: limits })

      case "position-sizing":
        const accountBalance = Number.parseFloat(searchParams.get("accountBalance") || "0")
        const riskPercent = Number.parseFloat(searchParams.get("riskPercent") || "2")
        const entryPrice = Number.parseFloat(searchParams.get("entryPrice") || "0")
        const stopLoss = Number.parseFloat(searchParams.get("stopLoss") || "0")
        const leverage = Number.parseFloat(searchParams.get("leverage") || "1")

        if (!accountBalance || !entryPrice || !stopLoss) {
          return NextResponse.json({ success: false, error: "Missing required parameters" }, { status: 400 })
        }

        const sizing = riskManagementService.calculatePositionSizing(
          accountBalance,
          riskPercent,
          entryPrice,
          stopLoss,
          leverage,
        )
        return NextResponse.json({ success: true, data: sizing })

      default:
        return NextResponse.json({ success: false, error: "Invalid type parameter" }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch risk management data" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    switch (action) {
      case "acknowledge-alert":
        const acknowledged = riskManagementService.acknowledgeAlert(data.id)
        if (!acknowledged) {
          return NextResponse.json({ success: false, error: "Alert not found" }, { status: 404 })
        }
        return NextResponse.json({ success: true, message: "Alert acknowledged" })

      case "update-limits":
        const updatedLimits = riskManagementService.updateRiskLimits(data.limits)
        return NextResponse.json({ success: true, data: updatedLimits })

      case "generate-alert":
        const newAlert = riskManagementService.generateRiskAlert(data.type, data.severity, data.message)
        return NextResponse.json({ success: true, data: newAlert })

      default:
        return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to process risk management action" }, { status: 500 })
  }
}
