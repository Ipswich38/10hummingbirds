// Portfolio Service - Manages trading positions and portfolio performance
export interface Position {
  id: string
  pair: string
  type: "long" | "short"
  entryPrice: number
  currentPrice: number
  quantity: number
  entryDate: Date
  status: "open" | "closed"
  stopLoss?: number
  takeProfit?: number
  pnl: number
  pnlPercent: number
  fees: number
  market: "forex" | "crypto" | "stocks"
}

export interface PortfolioMetrics {
  totalValue: number
  totalPnL: number
  totalPnLPercent: number
  dayPnL: number
  dayPnLPercent: number
  openPositions: number
  closedPositions: number
  winRate: number
  avgWin: number
  avgLoss: number
  sharpeRatio: number
  maxDrawdown: number
  totalFees: number
}

export interface PortfolioAllocation {
  market: "forex" | "crypto" | "stocks"
  value: number
  percentage: number
  pnl: number
  positions: number
}

export interface PerformanceHistory {
  date: Date
  portfolioValue: number
  pnl: number
  drawdown: number
}

class PortfolioService {
  private positions: Position[] = []
  private initialBalance = 100000 // Starting with $100k

  constructor() {
    this.generateSamplePositions()
  }

  private generateSamplePositions() {
    const samplePositions: Omit<Position, "id" | "pnl" | "pnlPercent">[] = [
      {
        pair: "EUR/USD",
        type: "long",
        entryPrice: 1.0825,
        currentPrice: 1.0847,
        quantity: 100000,
        entryDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: "open",
        stopLoss: 1.078,
        takeProfit: 1.09,
        fees: 15,
        market: "forex",
      },
      {
        pair: "BTC/USD",
        type: "long",
        entryPrice: 42000,
        currentPrice: 43247,
        quantity: 0.5,
        entryDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        status: "open",
        stopLoss: 40000,
        takeProfit: 48000,
        fees: 85,
        market: "crypto",
      },
      {
        pair: "AAPL",
        type: "long",
        entryPrice: 185.2,
        currentPrice: 189.47,
        quantity: 100,
        entryDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        status: "open",
        stopLoss: 180.0,
        takeProfit: 200.0,
        fees: 12,
        market: "stocks",
      },
      {
        pair: "GBP/USD",
        type: "short",
        entryPrice: 1.268,
        currentPrice: 1.2634,
        quantity: 50000,
        entryDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        status: "open",
        stopLoss: 1.275,
        takeProfit: 1.255,
        fees: 8,
        market: "forex",
      },
      {
        pair: "TSLA",
        type: "short",
        entryPrice: 255.0,
        currentPrice: 248.91,
        quantity: 50,
        entryDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        status: "closed",
        fees: 18,
        market: "stocks",
      },
    ]

    this.positions = samplePositions.map((pos, index) => {
      const pnl = this.calculatePnL(pos)
      const positionValue = pos.entryPrice * pos.quantity
      const pnlPercent = (pnl / positionValue) * 100

      return {
        ...pos,
        id: `pos_${index + 1}`,
        pnl: pnl - pos.fees,
        pnlPercent,
      }
    })
  }

  private calculatePnL(position: Omit<Position, "id" | "pnl" | "pnlPercent">): number {
    const priceDiff = position.currentPrice - position.entryPrice
    const multiplier = position.type === "long" ? 1 : -1
    return priceDiff * position.quantity * multiplier
  }

  // Update position prices (simulate real-time updates)
  updatePositionPrices(marketData: Record<string, number>) {
    this.positions = this.positions.map((position) => {
      if (position.status === "open" && marketData[position.pair]) {
        const newPrice = marketData[position.pair]
        const pnl = this.calculatePnL({ ...position, currentPrice: newPrice })
        const positionValue = position.entryPrice * position.quantity
        const pnlPercent = (pnl / positionValue) * 100

        return {
          ...position,
          currentPrice: newPrice,
          pnl: pnl - position.fees,
          pnlPercent,
        }
      }
      return position
    })
  }

  // Get all positions
  getPositions(status?: "open" | "closed"): Position[] {
    if (status) {
      return this.positions.filter((pos) => pos.status === status)
    }
    return this.positions
  }

  // Get position by ID
  getPosition(id: string): Position | undefined {
    return this.positions.find((pos) => pos.id === id)
  }

  // Calculate portfolio metrics
  getPortfolioMetrics(): PortfolioMetrics {
    const openPositions = this.positions.filter((pos) => pos.status === "open")
    const closedPositions = this.positions.filter((pos) => pos.status === "closed")

    const totalPnL = this.positions.reduce((sum, pos) => sum + pos.pnl, 0)
    const totalValue = this.initialBalance + totalPnL
    const totalPnLPercent = (totalPnL / this.initialBalance) * 100

    // Calculate day P&L (positions opened today)
    const today = new Date()
    const todayPositions = this.positions.filter((pos) => pos.entryDate.toDateString() === today.toDateString())
    const dayPnL = todayPositions.reduce((sum, pos) => sum + pos.pnl, 0)
    const dayPnLPercent = (dayPnL / this.initialBalance) * 100

    // Calculate win rate
    const profitablePositions = closedPositions.filter((pos) => pos.pnl > 0)
    const winRate = closedPositions.length > 0 ? (profitablePositions.length / closedPositions.length) * 100 : 0

    // Calculate average win/loss
    const wins = closedPositions.filter((pos) => pos.pnl > 0)
    const losses = closedPositions.filter((pos) => pos.pnl < 0)
    const avgWin = wins.length > 0 ? wins.reduce((sum, pos) => sum + pos.pnl, 0) / wins.length : 0
    const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((sum, pos) => sum + pos.pnl, 0) / losses.length) : 0

    const totalFees = this.positions.reduce((sum, pos) => sum + pos.fees, 0)

    return {
      totalValue,
      totalPnL,
      totalPnLPercent,
      dayPnL,
      dayPnLPercent,
      openPositions: openPositions.length,
      closedPositions: closedPositions.length,
      winRate,
      avgWin,
      avgLoss,
      sharpeRatio: 1.2 + Math.random() * 0.8, // Simulated
      maxDrawdown: -5.2 - Math.random() * 3, // Simulated
      totalFees,
    }
  }

  // Get portfolio allocation by market
  getPortfolioAllocation(): PortfolioAllocation[] {
    const markets: ("forex" | "crypto" | "stocks")[] = ["forex", "crypto", "stocks"]
    const totalValue = this.getPortfolioMetrics().totalValue

    return markets.map((market) => {
      const marketPositions = this.positions.filter((pos) => pos.market === market && pos.status === "open")
      const value = marketPositions.reduce((sum, pos) => sum + pos.entryPrice * pos.quantity, 0)
      const pnl = marketPositions.reduce((sum, pos) => sum + pos.pnl, 0)
      const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0

      return {
        market,
        value,
        percentage,
        pnl,
        positions: marketPositions.length,
      }
    })
  }

  // Get performance history (simulated)
  getPerformanceHistory(days = 30): PerformanceHistory[] {
    const history: PerformanceHistory[] = []
    const startValue = this.initialBalance
    let currentValue = startValue

    for (let i = days; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      const dailyReturn = (Math.random() - 0.5) * 0.02 // Random daily return between -1% and 1%
      currentValue *= 1 + dailyReturn
      const pnl = currentValue - startValue
      const drawdown = Math.min(
        0,
        ((currentValue - Math.max(...history.map((h) => h.portfolioValue), startValue)) /
          Math.max(...history.map((h) => h.portfolioValue), startValue)) *
          100,
      )

      history.push({
        date,
        portfolioValue: currentValue,
        pnl,
        drawdown,
      })
    }

    return history
  }

  // Add new position
  addPosition(position: Omit<Position, "id" | "pnl" | "pnlPercent">): Position {
    const pnl = this.calculatePnL(position)
    const positionValue = position.entryPrice * position.quantity
    const pnlPercent = (pnl / positionValue) * 100

    const newPosition: Position = {
      ...position,
      id: `pos_${Date.now()}`,
      pnl: pnl - position.fees,
      pnlPercent,
    }

    this.positions.push(newPosition)
    return newPosition
  }

  // Close position
  closePosition(id: string, exitPrice: number): Position | null {
    const positionIndex = this.positions.findIndex((pos) => pos.id === id)
    if (positionIndex === -1) return null

    const position = this.positions[positionIndex]
    const pnl = this.calculatePnL({ ...position, currentPrice: exitPrice })
    const positionValue = position.entryPrice * position.quantity
    const pnlPercent = (pnl / positionValue) * 100

    this.positions[positionIndex] = {
      ...position,
      status: "closed",
      currentPrice: exitPrice,
      pnl: pnl - position.fees,
      pnlPercent,
    }

    return this.positions[positionIndex]
  }

  // Update stop loss or take profit
  updatePosition(id: string, updates: Partial<Pick<Position, "stopLoss" | "takeProfit">>): Position | null {
    const positionIndex = this.positions.findIndex((pos) => pos.id === id)
    if (positionIndex === -1) return null

    this.positions[positionIndex] = {
      ...this.positions[positionIndex],
      ...updates,
    }

    return this.positions[positionIndex]
  }
}

export const portfolioService = new PortfolioService()
