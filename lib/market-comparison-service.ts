export interface ComparisonMetrics {
  symbol: string
  market: string
  currentPrice: number
  change24h: number
  changePercent24h: number
  volume24h: number
  marketCap?: number
  volatility: number
  sharpeRatio: number
  maxDrawdown: number
  correlation: number
  beta: number
  rsi: number
  macd: number
  performance: {
    "1d": number
    "7d": number
    "30d": number
    "90d": number
    "1y": number
  }
}

export interface MarketComparison {
  assets: ComparisonMetrics[]
  correlationMatrix: Record<string, Record<string, number>>
  bestPerformers: {
    "1d": ComparisonMetrics[]
    "7d": ComparisonMetrics[]
    "30d": ComparisonMetrics[]
  }
  worstPerformers: {
    "1d": ComparisonMetrics[]
    "7d": ComparisonMetrics[]
    "30d": ComparisonMetrics[]
  }
  marketSummary: {
    totalMarketCap: number
    avgVolatility: number
    avgCorrelation: number
    marketSentiment: "bullish" | "bearish" | "neutral"
  }
}

class MarketComparisonService {
  private generateRandomPrice(base: number, volatility = 0.05): number {
    const change = (Math.random() - 0.5) * 2 * volatility
    return base * (1 + change)
  }

  private generatePerformanceData(): ComparisonMetrics["performance"] {
    return {
      "1d": (Math.random() - 0.5) * 10,
      "7d": (Math.random() - 0.5) * 20,
      "30d": (Math.random() - 0.5) * 40,
      "90d": (Math.random() - 0.5) * 60,
      "1y": (Math.random() - 0.5) * 100,
    }
  }

  private generateTechnicalIndicators() {
    return {
      rsi: 30 + Math.random() * 40, // RSI between 30-70
      macd: (Math.random() - 0.5) * 2, // MACD between -1 and 1
      volatility: 0.1 + Math.random() * 0.4, // Volatility 10-50%
      sharpeRatio: -0.5 + Math.random() * 3, // Sharpe ratio -0.5 to 2.5
      maxDrawdown: -(Math.random() * 30), // Max drawdown 0-30%
      beta: 0.5 + Math.random() * 1.5, // Beta 0.5-2.0
    }
  }

  private generateCorrelationMatrix(symbols: string[]): Record<string, Record<string, number>> {
    const matrix: Record<string, Record<string, number>> = {}

    symbols.forEach((symbol1) => {
      matrix[symbol1] = {}
      symbols.forEach((symbol2) => {
        if (symbol1 === symbol2) {
          matrix[symbol1][symbol2] = 1
        } else {
          // Generate realistic correlations
          const baseCorrelation = Math.random() * 0.8 - 0.4 // -0.4 to 0.4
          matrix[symbol1][symbol2] = Number(baseCorrelation.toFixed(3))
        }
      })
    })

    return matrix
  }

  async getMarketComparison(symbols: string[]): Promise<MarketComparison> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    const assets: ComparisonMetrics[] = symbols.map((symbol) => {
      const technical = this.generateTechnicalIndicators()
      const basePrice = symbol.includes("BTC")
        ? 45000
        : symbol.includes("ETH")
          ? 2800
          : symbol.includes("EUR")
            ? 1.085
            : symbol.includes("GBP")
              ? 1.27
              : symbol.includes("AAPL")
                ? 175
                : symbol.includes("GOOGL")
                  ? 140
                  : symbol.includes("TSLA")
                    ? 220
                    : 100

      const currentPrice = this.generateRandomPrice(basePrice, technical.volatility)
      const change24h = currentPrice * (Math.random() - 0.5) * 0.1

      return {
        symbol,
        market:
          symbol.includes("BTC") || symbol.includes("ETH")
            ? "crypto"
            : symbol.includes("EUR") || symbol.includes("GBP")
              ? "forex"
              : "stocks",
        currentPrice,
        change24h,
        changePercent24h: (change24h / currentPrice) * 100,
        volume24h: Math.random() * 1000000000,
        marketCap:
          symbol.includes("BTC") || symbol.includes("ETH") || ["AAPL", "GOOGL", "TSLA"].some((s) => symbol.includes(s))
            ? Math.random() * 2000000000000
            : undefined,
        correlation: Math.random() * 0.8 - 0.4,
        performance: this.generatePerformanceData(),
        ...technical,
      }
    })

    // Sort assets for best/worst performers
    const sortByPerformance = (period: keyof ComparisonMetrics["performance"], ascending = false) => {
      return [...assets]
        .sort((a, b) => {
          const aPerf = a.performance[period]
          const bPerf = b.performance[period]
          return ascending ? aPerf - bPerf : bPerf - aPerf
        })
        .slice(0, 3)
    }

    const correlationMatrix = this.generateCorrelationMatrix(symbols)

    return {
      assets,
      correlationMatrix,
      bestPerformers: {
        "1d": sortByPerformance("1d"),
        "7d": sortByPerformance("7d"),
        "30d": sortByPerformance("30d"),
      },
      worstPerformers: {
        "1d": sortByPerformance("1d", true),
        "7d": sortByPerformance("7d", true),
        "30d": sortByPerformance("30d", true),
      },
      marketSummary: {
        totalMarketCap: assets.reduce((sum, asset) => sum + (asset.marketCap || 0), 0),
        avgVolatility: assets.reduce((sum, asset) => sum + asset.volatility, 0) / assets.length,
        avgCorrelation: assets.reduce((sum, asset) => sum + Math.abs(asset.correlation), 0) / assets.length,
        marketSentiment: Math.random() > 0.6 ? "bullish" : Math.random() > 0.3 ? "neutral" : "bearish",
      },
    }
  }

  async getAssetCorrelation(
    symbol1: string,
    symbol2: string,
  ): Promise<{
    correlation: number
    strength: "weak" | "moderate" | "strong"
    direction: "positive" | "negative"
    historicalData: Array<{ date: string; correlation: number }>
  }> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const correlation = (Math.random() - 0.5) * 2 // -1 to 1
    const absCorrelation = Math.abs(correlation)

    const strength = absCorrelation < 0.3 ? "weak" : absCorrelation < 0.7 ? "moderate" : "strong"

    const direction = correlation >= 0 ? "positive" : "negative"

    // Generate historical correlation data
    const historicalData = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      correlation: correlation + (Math.random() - 0.5) * 0.2,
    }))

    return {
      correlation: Number(correlation.toFixed(3)),
      strength,
      direction,
      historicalData,
    }
  }
}

export const marketComparisonService = new MarketComparisonService()
