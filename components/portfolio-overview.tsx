"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
  AlertTriangle,
  RefreshCw,
  Target,
  StopCircle,
} from "lucide-react"
import { usePortfolio } from "@/hooks/use-portfolio"
import type { Position } from "@/lib/portfolio-service"

export function PortfolioOverview() {
  const { positions, metrics, allocation, loading, error, refetch, closePosition, updatePosition } = usePortfolio()

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

  const getPositionStatusColor = (position: Position) => {
    if (position.pnl > 0) return "text-chart-1"
    if (position.pnl < 0) return "text-chart-2"
    return "text-muted-foreground"
  }

  const renderPositions = () => {
    if (!positions) return null

    return (
      <div className="space-y-4">
        {positions.map((position) => (
          <Card key={position.id} className="border-l-4 border-l-primary/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div>
                    <h4 className="font-semibold">{position.pair}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant={position.type === "long" ? "default" : "destructive"} className="text-xs">
                        {position.type.toUpperCase()}
                      </Badge>
                      <span>{position.market}</span>
                      <span>Qty: {position.quantity.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${getPositionStatusColor(position)}`}>
                    {formatCurrency(position.pnl)}
                  </div>
                  <div className={`text-sm ${getPositionStatusColor(position)}`}>
                    {formatPercent(position.pnlPercent)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Entry:</span>
                  <div className="font-medium">{position.entryPrice.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Current:</span>
                  <div className="font-medium">{position.currentPrice.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Stop Loss:</span>
                  <div className="font-medium">{position.stopLoss?.toLocaleString() || "N/A"}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Take Profit:</span>
                  <div className="font-medium">{position.takeProfit?.toLocaleString() || "N/A"}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <Button size="sm" variant="outline" onClick={() => closePosition(position.id, position.currentPrice)}>
                  <StopCircle className="h-3 w-3 mr-1" />
                  Close
                </Button>
                <Button size="sm" variant="outline">
                  <Target className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const renderAllocation = () => {
    if (!allocation) return null

    return (
      <div className="space-y-4">
        {allocation.map((item) => (
          <div key={item.market} className="flex items-center justify-between p-4 rounded-lg border bg-card/30">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <div>
                <h4 className="font-medium capitalize">{item.market}</h4>
                <p className="text-sm text-muted-foreground">{item.positions} positions</p>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold">{formatCurrency(item.value)}</div>
              <div className="text-sm text-muted-foreground">{item.percentage.toFixed(1)}%</div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32 mb-2" />
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
      {/* Portfolio Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-chart-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics.totalValue)}</div>
              <p
                className={`text-xs flex items-center gap-1 ${metrics.totalPnL >= 0 ? "text-chart-1" : "text-chart-2"}`}
              >
                {metrics.totalPnL >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {formatPercent(metrics.totalPnLPercent)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-chart-3">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Day P&L</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics.dayPnL)}</div>
              <p className={`text-xs flex items-center gap-1 ${metrics.dayPnL >= 0 ? "text-chart-1" : "text-chart-2"}`}>
                {metrics.dayPnL >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {formatPercent(metrics.dayPnLPercent)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-chart-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.winRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {metrics.openPositions} open, {metrics.closedPositions} closed
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-chart-5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sharpe Ratio</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.sharpeRatio.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Risk-adjusted return</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Portfolio Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Portfolio Details
              </CardTitle>
              <CardDescription>Manage your trading positions and allocation</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={refetch}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="positions">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="positions">Open Positions</TabsTrigger>
              <TabsTrigger value="allocation">Allocation</TabsTrigger>
            </TabsList>
            <TabsContent value="positions" className="mt-6">
              {renderPositions()}
            </TabsContent>
            <TabsContent value="allocation" className="mt-6">
              {renderAllocation()}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
