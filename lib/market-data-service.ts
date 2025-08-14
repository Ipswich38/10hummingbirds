// Market Data Service - Simulates real-time trading data
export interface MarketDataPoint {
  pair: string
  price: string
  change: string
  changePercent: string
  trend: "up" | "down"
  volume?: string
  high24h?: string
  low24h?: string
  timestamp: number
}

export interface MarketData {
  forex: MarketDataPoint[]
  crypto: MarketDataPoint[]
  stocks: MarketDataPoint[]
}

class MarketDataService {
  private baseData: MarketData = {
    forex: [
      {
        pair: "EUR/USD",
        price: "1.0847",
        change: "+0.0023",
        changePercent: "+0.21%",
        trend: "up",
        timestamp: Date.now(),
      },
      {
        pair: "GBP/USD",
        price: "1.2634",
        change: "-0.0045",
        changePercent: "-0.35%",
        trend: "down",
        timestamp: Date.now(),
      },
      {
        pair: "USD/JPY",
        price: "149.82",
        change: "+0.67",
        changePercent: "+0.45%",
        trend: "up",
        timestamp: Date.now(),
      },
      {
        pair: "AUD/USD",
        price: "0.6543",
        change: "+0.0012",
        changePercent: "+0.18%",
        trend: "up",
        timestamp: Date.now(),
      },
      {
        pair: "USD/CHF",
        price: "0.8765",
        change: "-0.0034",
        changePercent: "-0.39%",
        trend: "down",
        timestamp: Date.now(),
      },
    ],
    crypto: [
      {
        pair: "BTC/USD",
        price: "43,247",
        change: "+1,234",
        changePercent: "+2.94%",
        trend: "up",
        volume: "2.4B",
        timestamp: Date.now(),
      },
      {
        pair: "ETH/USD",
        price: "2,587",
        change: "-67",
        changePercent: "-2.52%",
        trend: "down",
        volume: "1.8B",
        timestamp: Date.now(),
      },
      {
        pair: "ADA/USD",
        price: "0.4821",
        change: "+0.0234",
        changePercent: "+5.11%",
        trend: "up",
        volume: "456M",
        timestamp: Date.now(),
      },
      {
        pair: "SOL/USD",
        price: "98.45",
        change: "+3.21",
        changePercent: "+3.37%",
        trend: "up",
        volume: "892M",
        timestamp: Date.now(),
      },
      {
        pair: "DOT/USD",
        price: "7.23",
        change: "-0.45",
        changePercent: "-5.86%",
        trend: "down",
        volume: "234M",
        timestamp: Date.now(),
      },
    ],
    stocks: [
      {
        pair: "AAPL",
        price: "189.47",
        change: "+2.34",
        changePercent: "+1.25%",
        trend: "up",
        volume: "45.2M",
        timestamp: Date.now(),
      },
      {
        pair: "TSLA",
        price: "248.91",
        change: "-5.67",
        changePercent: "-2.23%",
        trend: "down",
        volume: "67.8M",
        timestamp: Date.now(),
      },
      {
        pair: "NVDA",
        price: "456.78",
        change: "+12.45",
        changePercent: "+2.80%",
        trend: "up",
        volume: "89.1M",
        timestamp: Date.now(),
      },
      {
        pair: "GOOGL",
        price: "142.56",
        change: "+1.89",
        changePercent: "+1.34%",
        trend: "up",
        volume: "23.4M",
        timestamp: Date.now(),
      },
      {
        pair: "MSFT",
        price: "378.92",
        change: "-2.11",
        changePercent: "-0.55%",
        trend: "down",
        volume: "34.7M",
        timestamp: Date.now(),
      },
    ],
  }

  // Simulate real-time price fluctuations
  private simulatePriceChange(
    currentPrice: string,
    volatility = 0.02,
  ): { price: string; change: string; changePercent: string; trend: "up" | "down" } {
    const price = Number.parseFloat(currentPrice.replace(/,/g, ""))
    const changePercent = (Math.random() - 0.5) * volatility * 2
    const newPrice = price * (1 + changePercent)
    const absoluteChange = newPrice - price

    return {
      price: newPrice.toLocaleString(undefined, {
        minimumFractionDigits: currentPrice.includes(".") ? currentPrice.split(".")[1].length : 0,
        maximumFractionDigits: currentPrice.includes(".") ? currentPrice.split(".")[1].length : 0,
      }),
      change: absoluteChange >= 0 ? `+${absoluteChange.toFixed(4)}` : absoluteChange.toFixed(4),
      changePercent:
        changePercent >= 0 ? `+${(changePercent * 100).toFixed(2)}%` : `${(changePercent * 100).toFixed(2)}%`,
      trend: absoluteChange >= 0 ? "up" : "down",
    }
  }

  // Get current market data with simulated real-time updates
  getMarketData(): MarketData {
    const updatedData: MarketData = { forex: [], crypto: [], stocks: [] }

    Object.entries(this.baseData).forEach(([market, pairs]) => {
      updatedData[market as keyof MarketData] = pairs.map((pair) => {
        const volatility = market === "crypto" ? 0.05 : market === "stocks" ? 0.03 : 0.01
        const priceUpdate = this.simulatePriceChange(pair.price, volatility)

        return {
          ...pair,
          ...priceUpdate,
          timestamp: Date.now(),
        }
      })
    })

    // Update base data for next iteration
    this.baseData = updatedData
    return updatedData
  }

  // Get specific market data
  getMarketDataByType(type: "forex" | "crypto" | "stocks"): MarketDataPoint[] {
    return this.getMarketData()[type]
  }

  // Get historical data simulation (for charts)
  getHistoricalData(
    pair: string,
    timeframe: "1h" | "4h" | "1d" | "1w" = "1h",
  ): Array<{
    timestamp: number
    open: number
    high: number
    low: number
    close: number
    volume: number
  }> {
    const intervals = timeframe === "1h" ? 24 : timeframe === "4h" ? 24 : timeframe === "1d" ? 30 : 52
    const data = []
    let basePrice = 100

    for (let i = 0; i < intervals; i++) {
      const volatility = 0.02
      const change = (Math.random() - 0.5) * volatility
      const open = basePrice
      const close = basePrice * (1 + change)
      const high = Math.max(open, close) * (1 + Math.random() * 0.01)
      const low = Math.min(open, close) * (1 - Math.random() * 0.01)
      const volume = Math.random() * 1000000

      data.push({
        timestamp:
          Date.now() -
          (intervals - i) *
            (timeframe === "1h" ? 3600000 : timeframe === "4h" ? 14400000 : timeframe === "1d" ? 86400000 : 604800000),
        open,
        high,
        low,
        close,
        volume,
      })

      basePrice = close
    }

    return data
  }
}

export const marketDataService = new MarketDataService()
