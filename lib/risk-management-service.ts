// Risk Management Service - Comprehensive risk analysis and management tools
export interface RiskMetrics {
  portfolioValue: number
  totalExposure: number
  maxDrawdown: number
  currentDrawdown: number
  valueAtRisk: number // VaR at 95% confidence
  sharpeRatio: number
  sortinoRatio: number
  volatility: number
  beta: number
  correlation: Record<string, number>
}

export interface PositionRisk {
  positionId: string
  pair: string
  market: "forex" | "crypto" | "stocks"
  positionSize: number
  riskAmount: number
  riskPercent: number
  leverageUsed: number
  marginRequired: number
  liquidationPrice?: number
  riskRewardRatio: number
  probabilityOfLoss: number
  maxLoss: number
  timeAtRisk: number // hours
}

export interface RiskAlert {
  id: string
  type: "high_risk" | "margin_call" | "correlation" | "concentration" | "volatility" | "drawdown"
  severity: "low" | "medium" | "high" | "critical"
  title: string
  message: string
  recommendation: string
  timestamp: Date
  acknowledged: boolean
  affectedPositions?: string[]
}

export interface RiskLimits {
  maxPositionSize: number // percentage of portfolio
  maxDailyLoss: number // percentage
  maxDrawdown: number // percentage
  maxLeverage: number
  maxCorrelation: number
  maxConcentration: number // max percentage in single market
  stopLossRequired: boolean
  maxOpenPositions: number
}

export interface ExposureAnalysis {
  byMarket: Record<string, { exposure: number; percentage: number; risk: number }>
  byCurrency: Record<string, { exposure: number; percentage: number; risk: number }>
  byAssetClass: Record<string, { exposure: number; percentage: number; risk: number }>
  correlationMatrix: Record<string, Record<string, number>>
  concentrationRisk: number
}

export interface PositionSizingCalculation {
  recommendedSize: number
  maxSize: number
  riskAmount: number
  riskPercent: number
  stopLossDistance: number
  leverageRequired: number
  marginRequired: number
  reasoning: string[]
}

class RiskManagementService {
  private riskLimits: RiskLimits = {
    maxPositionSize: 10, // 10% of portfolio per position
    maxDailyLoss: 2, // 2% daily loss limit
    maxDrawdown: 15, // 15% max drawdown
    maxLeverage: 10,
    maxCorrelation: 0.7,
    maxConcentration: 30, // 30% max in single market
    stopLossRequired: true,
    maxOpenPositions: 15,
  }

  private alerts: RiskAlert[] = []

  constructor() {
    this.generateSampleAlerts()
  }

  private generateSampleAlerts() {
    const sampleAlerts: Omit<RiskAlert, "id" | "timestamp">[] = [
      {
        type: "high_risk",
        severity: "high",
        title: "High Portfolio Risk Detected",
        message: "Current portfolio risk exceeds recommended levels",
        recommendation: "Consider reducing position sizes or closing some positions",
        acknowledged: false,
        affectedPositions: ["pos_1", "pos_2"],
      },
      {
        type: "correlation",
        severity: "medium",
        title: "High Correlation Risk",
        message: "Multiple positions show high correlation (>0.8)",
        recommendation: "Diversify positions across different asset classes",
        acknowledged: false,
        affectedPositions: ["pos_1", "pos_3"],
      },
      {
        type: "concentration",
        severity: "medium",
        title: "Market Concentration Risk",
        message: "Over 40% of portfolio concentrated in crypto market",
        recommendation: "Consider rebalancing across forex and stocks",
        acknowledged: true,
      },
      {
        type: "volatility",
        severity: "low",
        title: "Increased Market Volatility",
        message: "Market volatility has increased by 25% in the last 24 hours",
        recommendation: "Monitor positions closely and consider tightening stop losses",
        acknowledged: false,
      },
    ]

    this.alerts = sampleAlerts.map((alert, index) => ({
      ...alert,
      id: `alert_${index + 1}`,
      timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
    }))
  }

  // Calculate comprehensive risk metrics
  calculateRiskMetrics(portfolioValue: number, positions: any[]): RiskMetrics {
    const totalExposure = positions.reduce((sum, pos) => sum + Math.abs(pos.entryPrice * pos.quantity), 0)

    // Simulate risk calculations (in real app, these would be based on historical data)
    const maxDrawdown = -12.5 - Math.random() * 5
    const currentDrawdown = -3.2 - Math.random() * 4
    const valueAtRisk = portfolioValue * (0.02 + Math.random() * 0.03) // 2-5% VaR
    const sharpeRatio = 0.8 + Math.random() * 1.2
    const sortinoRatio = 1.1 + Math.random() * 1.4
    const volatility = 0.15 + Math.random() * 0.1 // 15-25% annualized
    const beta = 0.8 + Math.random() * 0.6

    // Simulate correlations
    const correlation = {
      "S&P 500": 0.3 + Math.random() * 0.4,
      "USD Index": -0.2 + Math.random() * 0.4,
      VIX: -0.4 + Math.random() * 0.3,
      Gold: 0.1 + Math.random() * 0.3,
    }

    return {
      portfolioValue,
      totalExposure,
      maxDrawdown,
      currentDrawdown,
      valueAtRisk,
      sharpeRatio,
      sortinoRatio,
      volatility,
      beta,
      correlation,
    }
  }

  // Calculate position-specific risk
  calculatePositionRisk(position: any, portfolioValue: number): PositionRisk {
    const positionSize = Math.abs(position.entryPrice * position.quantity)
    const riskAmount = Math.abs(position.entryPrice - position.stopLoss) * position.quantity
    const riskPercent = (riskAmount / portfolioValue) * 100
    const leverageUsed = positionSize / (portfolioValue * 0.1) // Assuming 10% margin
    const marginRequired = positionSize / leverageUsed
    const riskRewardRatio = position.riskReward || 1.5
    const probabilityOfLoss = 45 + Math.random() * 20 // 45-65%
    const maxLoss = riskAmount
    const timeAtRisk = (Date.now() - new Date(position.entryDate).getTime()) / (1000 * 60 * 60) // hours

    // Calculate liquidation price for leveraged positions
    let liquidationPrice: number | undefined
    if (leverageUsed > 1) {
      const marginPercent = 1 / leverageUsed
      const liquidationDistance = marginPercent * 0.8 // 80% of margin
      liquidationPrice =
        position.type === "long"
          ? position.entryPrice * (1 - liquidationDistance)
          : position.entryPrice * (1 + liquidationDistance)
    }

    return {
      positionId: position.id,
      pair: position.pair,
      market: position.market,
      positionSize,
      riskAmount,
      riskPercent,
      leverageUsed,
      marginRequired,
      liquidationPrice,
      riskRewardRatio,
      probabilityOfLoss,
      maxLoss,
      timeAtRisk,
    }
  }

  // Analyze portfolio exposure
  analyzeExposure(positions: any[], portfolioValue: number): ExposureAnalysis {
    const byMarket: Record<string, { exposure: number; percentage: number; risk: number }> = {}
    const byCurrency: Record<string, { exposure: number; percentage: number; risk: number }> = {}
    const byAssetClass: Record<string, { exposure: number; percentage: number; risk: number }> = {}

    positions.forEach((position) => {
      const exposure = Math.abs(position.entryPrice * position.quantity)
      const risk = Math.abs(position.pnl) || 0

      // By market
      if (!byMarket[position.market]) {
        byMarket[position.market] = { exposure: 0, percentage: 0, risk: 0 }
      }
      byMarket[position.market].exposure += exposure
      byMarket[position.market].risk += risk

      // By currency (simplified)
      const currency = position.pair.includes("USD") ? "USD" : position.pair.split("/")[1] || position.pair
      if (!byCurrency[currency]) {
        byCurrency[currency] = { exposure: 0, percentage: 0, risk: 0 }
      }
      byCurrency[currency].exposure += exposure
      byCurrency[currency].risk += risk

      // By asset class
      const assetClass = position.market === "forex" ? "Currency" : position.market === "crypto" ? "Crypto" : "Equity"
      if (!byAssetClass[assetClass]) {
        byAssetClass[assetClass] = { exposure: 0, percentage: 0, risk: 0 }
      }
      byAssetClass[assetClass].exposure += exposure
      byAssetClass[assetClass].risk += risk
    })

    // Calculate percentages
    Object.values(byMarket).forEach((item) => {
      item.percentage = (item.exposure / portfolioValue) * 100
    })
    Object.values(byCurrency).forEach((item) => {
      item.percentage = (item.exposure / portfolioValue) * 100
    })
    Object.values(byAssetClass).forEach((item) => {
      item.percentage = (item.exposure / portfolioValue) * 100
    })

    // Simulate correlation matrix
    const assets = positions.map((p) => p.pair).slice(0, 5)
    const correlationMatrix: Record<string, Record<string, number>> = {}
    assets.forEach((asset1) => {
      correlationMatrix[asset1] = {}
      assets.forEach((asset2) => {
        if (asset1 === asset2) {
          correlationMatrix[asset1][asset2] = 1
        } else {
          correlationMatrix[asset1][asset2] = -0.5 + Math.random()
        }
      })
    })

    // Calculate concentration risk
    const maxExposure = Math.max(...Object.values(byMarket).map((item) => item.percentage))
    const concentrationRisk = maxExposure > 30 ? maxExposure : 0

    return {
      byMarket,
      byCurrency,
      byAssetClass,
      correlationMatrix,
      concentrationRisk,
    }
  }

  // Calculate optimal position sizing
  calculatePositionSizing(
    accountBalance: number,
    riskPercent: number,
    entryPrice: number,
    stopLoss: number,
    leverage = 1,
  ): PositionSizingCalculation {
    const riskAmount = (accountBalance * riskPercent) / 100
    const stopLossDistance = Math.abs(entryPrice - stopLoss)
    const positionSize = riskAmount / stopLossDistance
    const positionValue = positionSize * entryPrice
    const leverageRequired = Math.min(leverage, positionValue / (accountBalance * 0.1))
    const marginRequired = positionValue / leverageRequired
    const maxSize = (accountBalance * this.riskLimits.maxPositionSize) / 100 / entryPrice

    const reasoning = [
      `Risk amount: ${((riskAmount / accountBalance) * 100).toFixed(2)}% of account`,
      `Stop loss distance: ${((stopLossDistance / entryPrice) * 100).toFixed(2)}%`,
      `Position value: $${positionValue.toLocaleString()}`,
      `Margin required: $${marginRequired.toLocaleString()}`,
    ]

    if (leverageRequired > this.riskLimits.maxLeverage) {
      reasoning.push(`⚠️ Leverage exceeds limit (${this.riskLimits.maxLeverage}x)`)
    }

    return {
      recommendedSize: Math.min(positionSize, maxSize),
      maxSize,
      riskAmount,
      riskPercent,
      stopLossDistance,
      leverageRequired,
      marginRequired,
      reasoning,
    }
  }

  // Get risk alerts
  getRiskAlerts(severity?: RiskAlert["severity"]): RiskAlert[] {
    let alerts = [...this.alerts]
    if (severity) {
      alerts = alerts.filter((alert) => alert.severity === severity)
    }
    return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  // Acknowledge alert
  acknowledgeAlert(id: string): boolean {
    const alertIndex = this.alerts.findIndex((alert) => alert.id === id)
    if (alertIndex === -1) return false

    this.alerts[alertIndex].acknowledged = true
    return true
  }

  // Get risk limits
  getRiskLimits(): RiskLimits {
    return { ...this.riskLimits }
  }

  // Update risk limits
  updateRiskLimits(limits: Partial<RiskLimits>): RiskLimits {
    this.riskLimits = { ...this.riskLimits, ...limits }
    return this.riskLimits
  }

  // Check if position violates risk limits
  checkRiskLimits(position: any, portfolioValue: number): string[] {
    const violations: string[] = []
    const positionRisk = this.calculatePositionRisk(position, portfolioValue)

    if (positionRisk.riskPercent > this.riskLimits.maxPositionSize) {
      violations.push(`Position size exceeds limit (${this.riskLimits.maxPositionSize}%)`)
    }

    if (positionRisk.leverageUsed > this.riskLimits.maxLeverage) {
      violations.push(`Leverage exceeds limit (${this.riskLimits.maxLeverage}x)`)
    }

    if (this.riskLimits.stopLossRequired && !position.stopLoss) {
      violations.push("Stop loss is required but not set")
    }

    return violations
  }

  // Generate new risk alert (simulate real-time risk monitoring)
  generateRiskAlert(type: RiskAlert["type"], severity: RiskAlert["severity"], customMessage?: string): RiskAlert {
    const alertTemplates = {
      high_risk: {
        title: "High Risk Position Detected",
        message: customMessage || "Position risk exceeds recommended levels",
        recommendation: "Consider reducing position size or tightening stop loss",
      },
      margin_call: {
        title: "Margin Call Warning",
        message: customMessage || "Account approaching margin call levels",
        recommendation: "Add funds or close positions to maintain margin requirements",
      },
      correlation: {
        title: "High Correlation Risk",
        message: customMessage || "Multiple positions showing high correlation",
        recommendation: "Diversify positions to reduce correlation risk",
      },
      concentration: {
        title: "Concentration Risk Alert",
        message: customMessage || "Portfolio concentration exceeds recommended limits",
        recommendation: "Rebalance portfolio across different markets",
      },
      volatility: {
        title: "Volatility Alert",
        message: customMessage || "Market volatility has increased significantly",
        recommendation: "Monitor positions closely and consider risk adjustments",
      },
      drawdown: {
        title: "Drawdown Alert",
        message: customMessage || "Portfolio drawdown approaching maximum limit",
        recommendation: "Review and close losing positions",
      },
    }

    const template = alertTemplates[type]
    const newAlert: RiskAlert = {
      id: `alert_${Date.now()}`,
      type,
      severity,
      title: template.title,
      message: template.message,
      recommendation: template.recommendation,
      timestamp: new Date(),
      acknowledged: false,
    }

    this.alerts.unshift(newAlert)
    return newAlert
  }
}

export const riskManagementService = new RiskManagementService()
