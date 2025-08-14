// Trading Signals Service - Generates buy/sell signals with AI analysis
export interface TradingSignal {
  id: string
  pair: string
  market: "forex" | "crypto" | "stocks"
  type: "buy" | "sell"
  strength: "weak" | "moderate" | "strong" | "very_strong"
  confidence: number // 0-100
  entryPrice: number
  currentPrice: number
  stopLoss: number
  takeProfit: number[]
  timeframe: "1h" | "4h" | "1d" | "1w"
  timestamp: Date
  status: "active" | "triggered" | "expired" | "cancelled"
  reasoning: string[]
  technicalIndicators: {
    rsi: number
    macd: number
    bollinger: "upper" | "middle" | "lower"
    movingAverage: "above" | "below"
    volume: "high" | "normal" | "low"
  }
  riskReward: number
  expectedMove: {
    direction: "up" | "down"
    percentage: number
    timeframe: string
  }
  alerts: {
    priceAlert?: number
    timeAlert?: Date
    triggered: boolean
  }
}

export interface SignalPerformance {
  signalId: string
  outcome: "win" | "loss" | "pending"
  pnl: number
  pnlPercent: number
  duration: number // in hours
  maxFavorable: number
  maxAdverse: number
}

export interface SignalStats {
  totalSignals: number
  activeSignals: number
  winRate: number
  avgPnL: number
  bestSignal: number
  worstSignal: number
  avgDuration: number
  signalsByStrength: Record<string, number>
  signalsByMarket: Record<string, number>
}

class TradingSignalsService {
  private signals: TradingSignal[] = []
  private performance: SignalPerformance[] = []

  constructor() {
    this.generateSampleSignals()
  }

  private generateSampleSignals() {
    const pairs = {
      forex: ["EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD", "USD/CHF"],
      crypto: ["BTC/USD", "ETH/USD", "ADA/USD", "SOL/USD", "DOT/USD"],
      stocks: ["AAPL", "TSLA", "NVDA", "GOOGL", "MSFT"],
    }

    const timeframes: TradingSignal["timeframe"][] = ["1h", "4h", "1d", "1w"]
    const strengths: TradingSignal["strength"][] = ["weak", "moderate", "strong", "very_strong"]

    Object.entries(pairs).forEach(([market, pairList]) => {
      pairList.slice(0, 3).forEach((pair, index) => {
        const type = Math.random() > 0.5 ? "buy" : "sell"
        const strength = strengths[Math.floor(Math.random() * strengths.length)]
        const confidence = 60 + Math.random() * 40
        const currentPrice = 100 + Math.random() * 400
        const entryPrice = currentPrice * (1 + (Math.random() - 0.5) * 0.02)

        const stopLossDistance = 0.02 + Math.random() * 0.03
        const takeProfitDistance = 0.03 + Math.random() * 0.05

        const stopLoss = type === "buy" ? entryPrice * (1 - stopLossDistance) : entryPrice * (1 + stopLossDistance)

        const takeProfit =
          type === "buy"
            ? [
                entryPrice * (1 + takeProfitDistance),
                entryPrice * (1 + takeProfitDistance * 1.5),
                entryPrice * (1 + takeProfitDistance * 2),
              ]
            : [
                entryPrice * (1 - takeProfitDistance),
                entryPrice * (1 - takeProfitDistance * 1.5),
                entryPrice * (1 - takeProfitDistance * 2),
              ]

        const reasoning = this.generateReasoning(type, strength)
        const riskReward = Math.abs(takeProfit[0] - entryPrice) / Math.abs(entryPrice - stopLoss)

        this.signals.push({
          id: `signal_${market}_${index + 1}`,
          pair,
          market: market as "forex" | "crypto" | "stocks",
          type,
          strength,
          confidence: Math.round(confidence),
          entryPrice: Number.parseFloat(entryPrice.toFixed(4)),
          currentPrice: Number.parseFloat(currentPrice.toFixed(4)),
          stopLoss: Number.parseFloat(stopLoss.toFixed(4)),
          takeProfit: takeProfit.map((tp) => Number.parseFloat(tp.toFixed(4))),
          timeframe: timeframes[Math.floor(Math.random() * timeframes.length)],
          timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
          status: Math.random() > 0.8 ? "triggered" : "active",
          reasoning,
          technicalIndicators: {
            rsi: 30 + Math.random() * 40,
            macd: (Math.random() - 0.5) * 2,
            bollinger: ["upper", "middle", "lower"][Math.floor(Math.random() * 3)] as "upper" | "middle" | "lower",
            movingAverage: Math.random() > 0.5 ? "above" : "below",
            volume: ["high", "normal", "low"][Math.floor(Math.random() * 3)] as "high" | "normal" | "low",
          },
          riskReward: Number.parseFloat(riskReward.toFixed(2)),
          expectedMove: {
            direction: type === "buy" ? "up" : "down",
            percentage: 2 + Math.random() * 8,
            timeframe: ["1-2 days", "3-5 days", "1 week"][Math.floor(Math.random() * 3)],
          },
          alerts: {
            priceAlert: Math.random() > 0.5 ? entryPrice * (1 + (Math.random() - 0.5) * 0.01) : undefined,
            triggered: false,
          },
        })
      })
    })

    // Sort by confidence descending
    this.signals.sort((a, b) => b.confidence - a.confidence)
  }

  private generateReasoning(type: "buy" | "sell", strength: TradingSignal["strength"]): string[] {
    const buyReasons = [
      "RSI showing oversold recovery",
      "MACD bullish crossover confirmed",
      "Price breaking above key resistance",
      "Volume increasing on upward moves",
      "Bullish divergence detected",
      "Support level holding strong",
      "Moving averages aligning bullishly",
      "Momentum indicators turning positive",
    ]

    const sellReasons = [
      "RSI showing overbought conditions",
      "MACD bearish crossover confirmed",
      "Price failing at resistance level",
      "Volume decreasing on rallies",
      "Bearish divergence detected",
      "Resistance level acting as ceiling",
      "Moving averages turning bearish",
      "Momentum indicators weakening",
    ]

    const reasons = type === "buy" ? buyReasons : sellReasons
    const numReasons = strength === "very_strong" ? 4 : strength === "strong" ? 3 : 2

    return reasons.sort(() => Math.random() - 0.5).slice(0, numReasons)
  }

  // Get all signals with optional filtering
  getSignals(filters?: {
    market?: "forex" | "crypto" | "stocks"
    type?: "buy" | "sell"
    strength?: TradingSignal["strength"]
    status?: TradingSignal["status"]
    minConfidence?: number
  }): TradingSignal[] {
    let filteredSignals = [...this.signals]

    if (filters) {
      if (filters.market) {
        filteredSignals = filteredSignals.filter((s) => s.market === filters.market)
      }
      if (filters.type) {
        filteredSignals = filteredSignals.filter((s) => s.type === filters.type)
      }
      if (filters.strength) {
        filteredSignals = filteredSignals.filter((s) => s.strength === filters.strength)
      }
      if (filters.status) {
        filteredSignals = filteredSignals.filter((s) => s.status === filters.status)
      }
      if (filters.minConfidence) {
        filteredSignals = filteredSignals.filter((s) => s.confidence >= filters.minConfidence)
      }
    }

    return filteredSignals
  }

  // Get signal by ID
  getSignal(id: string): TradingSignal | undefined {
    return this.signals.find((s) => s.id === id)
  }

  // Get signal statistics
  getSignalStats(): SignalStats {
    const activeSignals = this.signals.filter((s) => s.status === "active")
    const completedPerformance = this.performance.filter((p) => p.outcome !== "pending")

    const winRate =
      completedPerformance.length > 0
        ? (completedPerformance.filter((p) => p.outcome === "win").length / completedPerformance.length) * 100
        : 0

    const avgPnL =
      completedPerformance.length > 0
        ? completedPerformance.reduce((sum, p) => sum + p.pnl, 0) / completedPerformance.length
        : 0

    const bestSignal = completedPerformance.length > 0 ? Math.max(...completedPerformance.map((p) => p.pnl)) : 0

    const worstSignal = completedPerformance.length > 0 ? Math.min(...completedPerformance.map((p) => p.pnl)) : 0

    const avgDuration =
      completedPerformance.length > 0
        ? completedPerformance.reduce((sum, p) => sum + p.duration, 0) / completedPerformance.length
        : 0

    const signalsByStrength = this.signals.reduce(
      (acc, signal) => {
        acc[signal.strength] = (acc[signal.strength] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const signalsByMarket = this.signals.reduce(
      (acc, signal) => {
        acc[signal.market] = (acc[signal.market] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      totalSignals: this.signals.length,
      activeSignals: activeSignals.length,
      winRate,
      avgPnL,
      bestSignal,
      worstSignal,
      avgDuration,
      signalsByStrength,
      signalsByMarket,
    }
  }

  // Update signal prices (for real-time updates)
  updateSignalPrices(marketData: Record<string, number>) {
    this.signals = this.signals.map((signal) => {
      if (signal.status === "active" && marketData[signal.pair]) {
        return {
          ...signal,
          currentPrice: marketData[signal.pair],
        }
      }
      return signal
    })
  }

  // Trigger signal (simulate signal execution)
  triggerSignal(id: string): boolean {
    const signalIndex = this.signals.findIndex((s) => s.id === id)
    if (signalIndex === -1) return false

    this.signals[signalIndex] = {
      ...this.signals[signalIndex],
      status: "triggered",
      alerts: {
        ...this.signals[signalIndex].alerts,
        triggered: true,
      },
    }

    return true
  }

  // Cancel signal
  cancelSignal(id: string): boolean {
    const signalIndex = this.signals.findIndex((s) => s.id === id)
    if (signalIndex === -1) return false

    this.signals[signalIndex] = {
      ...this.signals[signalIndex],
      status: "cancelled",
    }

    return true
  }

  // Generate new signals (simulate real-time signal generation)
  generateNewSignals(count = 1): TradingSignal[] {
    const newSignals: TradingSignal[] = []

    for (let i = 0; i < count; i++) {
      // This would normally be based on real market analysis
      // For demo, we'll generate random signals
      const markets = ["forex", "crypto", "stocks"] as const
      const market = markets[Math.floor(Math.random() * markets.length)]

      const pairs = {
        forex: ["EUR/USD", "GBP/USD", "USD/JPY"],
        crypto: ["BTC/USD", "ETH/USD", "ADA/USD"],
        stocks: ["AAPL", "TSLA", "NVDA"],
      }

      const pair = pairs[market][Math.floor(Math.random() * pairs[market].length)]

      // Generate signal similar to constructor logic
      const type = Math.random() > 0.5 ? "buy" : "sell"
      const strength = ["moderate", "strong", "very_strong"][Math.floor(Math.random() * 3)] as TradingSignal["strength"]
      const confidence = 70 + Math.random() * 30

      const signal: TradingSignal = {
        id: `signal_new_${Date.now()}_${i}`,
        pair,
        market,
        type,
        strength,
        confidence: Math.round(confidence),
        entryPrice: 100 + Math.random() * 400,
        currentPrice: 100 + Math.random() * 400,
        stopLoss: 95 + Math.random() * 390,
        takeProfit: [105 + Math.random() * 410, 110 + Math.random() * 420],
        timeframe: ["4h", "1d"][Math.floor(Math.random() * 2)] as "4h" | "1d",
        timestamp: new Date(),
        status: "active",
        reasoning: this.generateReasoning(type, strength),
        technicalIndicators: {
          rsi: 30 + Math.random() * 40,
          macd: (Math.random() - 0.5) * 2,
          bollinger: ["upper", "middle", "lower"][Math.floor(Math.random() * 3)] as "upper" | "middle" | "lower",
          movingAverage: Math.random() > 0.5 ? "above" : "below",
          volume: ["high", "normal", "low"][Math.floor(Math.random() * 3)] as "high" | "normal" | "low",
        },
        riskReward: 1.5 + Math.random() * 2,
        expectedMove: {
          direction: type === "buy" ? "up" : "down",
          percentage: 2 + Math.random() * 6,
          timeframe: "1-3 days",
        },
        alerts: {
          triggered: false,
        },
      }

      newSignals.push(signal)
    }

    this.signals.unshift(...newSignals)
    return newSignals
  }
}

export const tradingSignalsService = new TradingSignalsService()
