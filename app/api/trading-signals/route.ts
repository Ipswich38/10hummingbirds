import { NextResponse } from "next/server"
import { tradingSignalsService } from "@/lib/trading-signals-service"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    switch (type) {
      case "signals":
        const market = searchParams.get("market") as "forex" | "crypto" | "stocks" | undefined
        const signalType = searchParams.get("signalType") as "buy" | "sell" | undefined
        const strength = searchParams.get("strength") as "weak" | "moderate" | "strong" | "very_strong" | undefined
        const status = searchParams.get("status") as "active" | "triggered" | "expired" | "cancelled" | undefined
        const minConfidence = searchParams.get("minConfidence")
          ? Number.parseInt(searchParams.get("minConfidence")!)
          : undefined

        const signals = tradingSignalsService.getSignals({
          market,
          type: signalType,
          strength,
          status,
          minConfidence,
        })
        return NextResponse.json({ success: true, data: signals })

      case "stats":
        const stats = tradingSignalsService.getSignalStats()
        return NextResponse.json({ success: true, data: stats })

      case "signal":
        const id = searchParams.get("id")
        if (!id) {
          return NextResponse.json({ success: false, error: "Signal ID required" }, { status: 400 })
        }
        const signal = tradingSignalsService.getSignal(id)
        if (!signal) {
          return NextResponse.json({ success: false, error: "Signal not found" }, { status: 404 })
        }
        return NextResponse.json({ success: true, data: signal })

      default:
        return NextResponse.json({ success: false, error: "Invalid type parameter" }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch trading signals" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    switch (action) {
      case "trigger":
        const triggered = tradingSignalsService.triggerSignal(data.id)
        if (!triggered) {
          return NextResponse.json({ success: false, error: "Signal not found" }, { status: 404 })
        }
        return NextResponse.json({ success: true, message: "Signal triggered" })

      case "cancel":
        const cancelled = tradingSignalsService.cancelSignal(data.id)
        if (!cancelled) {
          return NextResponse.json({ success: false, error: "Signal not found" }, { status: 404 })
        }
        return NextResponse.json({ success: true, message: "Signal cancelled" })

      case "generate":
        const count = data.count || 1
        const newSignals = tradingSignalsService.generateNewSignals(count)
        return NextResponse.json({ success: true, data: newSignals })

      default:
        return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to process signal action" }, { status: 500 })
  }
}
