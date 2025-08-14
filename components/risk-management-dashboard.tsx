"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, AlertTriangle, TrendingDown, BarChart3, Calculator, PieChart, Activity } from "lucide-react"
import { useRiskManagement } from "@/hooks/use-risk-management"
import type { RiskAlert } from "@/lib/risk-management-service"

export function RiskManagementDashboard() {
  const { riskMetrics, exposure, alerts, limits, loading, error, refetch, acknowledgeAlert, calculatePositionSizing } =
    useRiskManagement()

  const [positionSizingParams, setPositionSizingParams] = useState({
    accountBalance: 100000,
    riskPercent: 2,
    entryPrice: 1.085,
    stopLoss: 1.08,
    leverage: 1,
  })
  const [sizingResult, setSizingResult] = useState<any>(null)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? "+" : ""}${percent.toFixed(2)}%`
  }

  const getAlertSeverityColor = (severity: RiskAlert["severity"]) => {
    switch (severity) {
      case "critical":
        return "bg-red-500/20 text-red-700 border-red-500/30"
      case "high":
        return "bg-orange-500/20 text-orange-700 border-orange-500/30"
      case "medium":
        return "bg-yellow-500/20 text-yellow-700 border-yellow-500/30"
      default:
        return "bg-blue-500/20 text-blue-700 border-blue-500/30"
    }
  }

  const getAlertIcon = (type: RiskAlert["type"]) => {
    switch (type) {
      case "high_risk":
        return <AlertTriangle className="h-4 w-4" />
      case "margin_call":
        return <TrendingDown className="h-4 w-4" />
      case "correlation":
        return <BarChart3 className="h-4 w-4" />
      case "concentration":
        return <PieChart className="h-4 w-4" />
      case "volatility":
        return <Activity className="h-4 w-4" />
      case "drawdown":
        return <TrendingDown className="h-4 w-4" />
      default:
        return <Shield className="h-4 w-4" />
    }
  }

  const handleCalculatePositionSizing = async () => {
    const result = await calculatePositionSizing(positionSizingParams)
    setSizingResult(result)
  }

  const renderRiskMetrics = () => {
    if (!riskMetrics) return null

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="border-l-4 border-l-chart-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Value at Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(riskMetrics.valueAtRisk)}</div>
            <p className="text-xs text-muted-foreground">95% confidence (1 day)</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-chart-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Max Drawdown</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercent(riskMetrics.maxDrawdown)}</div>
            <p className="text-xs text-muted-foreground">Current: {formatPercent(riskMetrics.currentDrawdown)}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-chart-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sharpe Ratio</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{riskMetrics.sharpeRatio.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Risk-adjusted return</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-chart-5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Beta</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{riskMetrics.beta.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Market correlation</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderExposureAnalysis = () => {
    if (!exposure) return null

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Market Exposure</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(exposure.byMarket).map(([market, data]) => (
                  <div key={market} className="flex items-center justify-between">
                    <span className="capitalize text-sm">{market}</span>
                    <div className="text-right">
                      <div className="font-medium">{data.percentage.toFixed(1)}%</div>
                      <div className="text-xs text-muted-foreground">{formatCurrency(data.exposure)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Currency Exposure</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(exposure.byCurrency)
                  .slice(0, 4)
                  .map(([currency, data]) => (
                    <div key={currency} className="flex items-center justify-between">
                      <span className="text-sm">{currency}</span>
                      <div className="text-right">
                        <div className="font-medium">{data.percentage.toFixed(1)}%</div>
                        <div className="text-xs text-muted-foreground">{formatCurrency(data.exposure)}</div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Asset Class</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(exposure.byAssetClass).map(([assetClass, data]) => (
                  <div key={assetClass} className="flex items-center justify-between">
                    <span className="text-sm">{assetClass}</span>
                    <div className="text-right">
                      <div className="font-medium">{data.percentage.toFixed(1)}%</div>
                      <div className="text-xs text-muted-foreground">{formatCurrency(data.exposure)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {exposure.concentrationRisk > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Concentration Risk:</strong> {exposure.concentrationRisk.toFixed(1)}% of portfolio is concentrated
              in a single market. Consider diversifying to reduce risk.
            </AlertDescription>
          </Alert>
        )}
      </div>
    )
  }

  const renderAlerts = () => {
    if (!alerts) return null

    const unacknowledgedAlerts = alerts.filter((alert) => !alert.acknowledged)

    return (
      <div className="space-y-4">
        {unacknowledgedAlerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No active risk alerts</p>
            <p className="text-sm">Your portfolio is within acceptable risk parameters</p>
          </div>
        ) : (
          unacknowledgedAlerts.map((alert) => (
            <Card key={alert.id} className={`border-l-4 ${getAlertSeverityColor(alert.severity)}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-background/50">{getAlertIcon(alert.type)}</div>
                    <div>
                      <h4 className="font-semibold">{alert.title}</h4>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {alert.severity.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => acknowledgeAlert(alert.id)}>
                    Acknowledge
                  </Button>
                </div>
                <p className="text-sm mb-2">{alert.message}</p>
                <p className="text-sm text-muted-foreground">
                  <strong>Recommendation:</strong> {alert.recommendation}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    )
  }

  const renderPositionSizing = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Position Size Calculator
          </CardTitle>
          <CardDescription>Calculate optimal position size based on risk parameters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="accountBalance">Account Balance</Label>
                <Input
                  id="accountBalance"
                  type="number"
                  value={positionSizingParams.accountBalance}
                  onChange={(e) =>
                    setPositionSizingParams((prev) => ({
                      ...prev,
                      accountBalance: Number.parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="riskPercent">Risk Percentage (%)</Label>
                <Input
                  id="riskPercent"
                  type="number"
                  step="0.1"
                  value={positionSizingParams.riskPercent}
                  onChange={(e) =>
                    setPositionSizingParams((prev) => ({
                      ...prev,
                      riskPercent: Number.parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="entryPrice">Entry Price</Label>
                <Input
                  id="entryPrice"
                  type="number"
                  step="0.0001"
                  value={positionSizingParams.entryPrice}
                  onChange={(e) =>
                    setPositionSizingParams((prev) => ({
                      ...prev,
                      entryPrice: Number.parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="stopLoss">Stop Loss</Label>
                <Input
                  id="stopLoss"
                  type="number"
                  step="0.0001"
                  value={positionSizingParams.stopLoss}
                  onChange={(e) =>
                    setPositionSizingParams((prev) => ({
                      ...prev,
                      stopLoss: Number.parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="leverage">Leverage</Label>
                <Input
                  id="leverage"
                  type="number"
                  step="1"
                  value={positionSizingParams.leverage}
                  onChange={(e) =>
                    setPositionSizingParams((prev) => ({
                      ...prev,
                      leverage: Number.parseFloat(e.target.value) || 1,
                    }))
                  }
                />
              </div>
              <Button onClick={handleCalculatePositionSizing} className="w-full">
                Calculate Position Size
              </Button>
            </div>

            {sizingResult && (
              <div className="space-y-4">
                <h4 className="font-semibold">Calculation Results</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Recommended Size:</span>
                    <span className="font-medium">{sizingResult.recommendedSize.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Risk Amount:</span>
                    <span className="font-medium">{formatCurrency(sizingResult.riskAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Margin Required:</span>
                    <span className="font-medium">{formatCurrency(sizingResult.marginRequired)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Leverage Used:</span>
                    <span className="font-medium">{sizingResult.leverageRequired.toFixed(2)}x</span>
                  </div>
                </div>
                <div className="mt-4">
                  <h5 className="text-sm font-medium mb-2">Analysis:</h5>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {sizingResult.reasoning.map((reason: string, index: number) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-primary rounded-full"></div>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {error}.{" "}
          <Button variant="link" onClick={refetch} className="p-0 h-auto">
            Try again
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Risk Metrics */}
      {renderRiskMetrics()}

      {/* Risk Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Risk Alerts
          </CardTitle>
          <CardDescription>Active risk warnings and recommendations</CardDescription>
        </CardHeader>
        <CardContent>{renderAlerts()}</CardContent>
      </Card>

      {/* Exposure Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Portfolio Exposure
          </CardTitle>
          <CardDescription>Breakdown of portfolio exposure by market, currency, and asset class</CardDescription>
        </CardHeader>
        <CardContent>{renderExposureAnalysis()}</CardContent>
      </Card>

      {/* Position Sizing Calculator */}
      {renderPositionSizing()}

      {/* Risk Limits */}
      {limits && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Risk Limits
            </CardTitle>
            <CardDescription>Current risk limits and utilization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Max Daily Loss</span>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(limits.maxDailyLoss)}</div>
                    <div className="text-xs text-muted-foreground">
                      Used: {formatPercent((limits.currentDailyLoss / limits.maxDailyLoss) * 100)}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Max Position Size</span>
                  <div className="text-right">
                    <div className="font-medium">{formatPercent(limits.maxPositionSize)}</div>
                    <div className="text-xs text-muted-foreground">
                      Largest: {formatPercent(limits.largestPosition)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Max Leverage</span>
                  <div className="text-right">
                    <div className="font-medium">{limits.maxLeverage}x</div>
                    <div className="text-xs text-muted-foreground">Current: {limits.currentLeverage.toFixed(2)}x</div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Max Correlation</span>
                  <div className="text-right">
                    <div className="font-medium">{formatPercent(limits.maxCorrelation * 100)}</div>
                    <div className="text-xs text-muted-foreground">
                      Highest: {formatPercent(limits.highestCorrelation * 100)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
