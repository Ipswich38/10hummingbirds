"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Plus,
  X,
  GitCompare,
} from "lucide-react"
import { useMarketComparison, useAssetCorrelation } from "@/hooks/use-market-comparison"

const DEFAULT_SYMBOLS = ["BTC/USD", "ETH/USD", "EUR/USD", "AAPL", "GOOGL"]

export function MarketComparisonDashboard() {
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>(DEFAULT_SYMBOLS)
  const [newSymbol, setNewSymbol] = useState("")
  const [correlationPair, setCorrelationPair] = useState<[string, string] | null>(null)

  const { comparison, loading, error, refetch } = useMarketComparison(selectedSymbols)
  const { correlation: correlationData, loading: correlationLoading } = useAssetCorrelation(
    correlationPair?.[0] || "",
    correlationPair?.[1] || "",
  )

  const formatCurrency = (amount: number, symbol: string) => {
    if (symbol.includes("USD") || ["AAPL", "GOOGL", "TSLA"].some((s) => symbol.includes(s))) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: symbol.includes("BTC") ? 0 : 2,
      }).format(amount)
    }
    return amount.toFixed(4)
  }

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? "+" : ""}${percent.toFixed(2)}%`
  }

  const formatLargeNumber = (num: number) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
    return `$${num.toFixed(0)}`
  }

  const getPerformanceColor = (value: number) => {
    return value >= 0 ? "text-green-600" : "text-red-600"
  }

  const getPerformanceIcon = (value: number) => {
    return value >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />
  }

  const addSymbol = () => {
    if (newSymbol && !selectedSymbols.includes(newSymbol)) {
      setSelectedSymbols([...selectedSymbols, newSymbol])
      setNewSymbol("")
    }
  }

  const removeSymbol = (symbol: string) => {
    setSelectedSymbols(selectedSymbols.filter((s) => s !== symbol))
  }

  const renderComparisonTable = () => {
    if (!comparison) return null

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3 font-medium">Asset</th>
              <th className="text-right p-3 font-medium">Price</th>
              <th className="text-right p-3 font-medium">24h Change</th>
              <th className="text-right p-3 font-medium">Volume</th>
              <th className="text-right p-3 font-medium">Volatility</th>
              <th className="text-right p-3 font-medium">RSI</th>
              <th className="text-right p-3 font-medium">Sharpe</th>
              <th className="text-center p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {comparison.assets.map((asset) => (
              <tr key={asset.symbol} className="border-b hover:bg-muted/50">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{asset.symbol}</span>
                    <Badge variant="outline" className="text-xs">
                      {asset.market.toUpperCase()}
                    </Badge>
                  </div>
                </td>
                <td className="text-right p-3 font-mono">{formatCurrency(asset.currentPrice, asset.symbol)}</td>
                <td className={`text-right p-3 ${getPerformanceColor(asset.changePercent24h)}`}>
                  <div className="flex items-center justify-end gap-1">
                    {getPerformanceIcon(asset.changePercent24h)}
                    {formatPercent(asset.changePercent24h)}
                  </div>
                </td>
                <td className="text-right p-3 text-sm text-muted-foreground">{formatLargeNumber(asset.volume24h)}</td>
                <td className="text-right p-3">{formatPercent(asset.volatility * 100)}</td>
                <td className="text-right p-3">
                  <Badge variant={asset.rsi > 70 ? "destructive" : asset.rsi < 30 ? "default" : "secondary"}>
                    {asset.rsi.toFixed(1)}
                  </Badge>
                </td>
                <td className="text-right p-3">{asset.sharpeRatio.toFixed(2)}</td>
                <td className="text-center p-3">
                  <Button size="sm" variant="outline" onClick={() => removeSymbol(asset.symbol)}>
                    <X className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  const renderPerformanceComparison = () => {
    if (!comparison) return null

    const periods = ["1d", "7d", "30d", "90d", "1y"] as const

    return (
      <div className="space-y-6">
        {periods.map((period) => (
          <Card key={period}>
            <CardHeader>
              <CardTitle className="text-lg">{period.toUpperCase()} Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {comparison.assets
                  .sort((a, b) => b.performance[period] - a.performance[period])
                  .map((asset, index) => (
                    <div key={asset.symbol} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{asset.symbol}</div>
                          <div className="text-sm text-muted-foreground capitalize">{asset.market}</div>
                        </div>
                      </div>
                      <div className={`text-right ${getPerformanceColor(asset.performance[period])}`}>
                        <div className="flex items-center gap-1">
                          {getPerformanceIcon(asset.performance[period])}
                          <span className="font-medium">{formatPercent(asset.performance[period])}</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const renderCorrelationMatrix = () => {
    if (!comparison) return null

    return (
      <div className="space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left p-2 font-medium">Asset</th>
                {comparison.assets.map((asset) => (
                  <th key={asset.symbol} className="text-center p-2 font-medium text-xs">
                    {asset.symbol.split("/")[0]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparison.assets.map((asset1) => (
                <tr key={asset1.symbol}>
                  <td className="p-2 font-medium text-sm">{asset1.symbol.split("/")[0]}</td>
                  {comparison.assets.map((asset2) => {
                    const correlation = comparison.correlationMatrix[asset1.symbol]?.[asset2.symbol] || 0
                    const absCorrelation = Math.abs(correlation)
                    const intensity = Math.round(absCorrelation * 255)
                    const bgColor =
                      correlation >= 0 ? `rgba(34, 197, 94, ${absCorrelation})` : `rgba(239, 68, 68, ${absCorrelation})`

                    return (
                      <td
                        key={asset2.symbol}
                        className="p-2 text-center text-xs font-mono cursor-pointer hover:ring-2 hover:ring-primary/50"
                        style={{ backgroundColor: bgColor }}
                        onClick={() => setCorrelationPair([asset1.symbol, asset2.symbol])}
                      >
                        {correlation.toFixed(2)}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500/50 rounded"></div>
              <span>Positive Correlation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500/50 rounded"></div>
              <span>Negative Correlation</span>
            </div>
          </div>
          <span>Click cells for detailed analysis</span>
        </div>

        {correlationPair && correlationData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitCompare className="h-5 w-5" />
                Correlation Analysis: {correlationPair[0]} vs {correlationPair[1]}
              </CardTitle>
              <Button size="sm" variant="outline" onClick={() => setCorrelationPair(null)} className="w-fit">
                Close
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{correlationData.correlation}</div>
                  <div className="text-sm text-muted-foreground">Correlation Coefficient</div>
                </div>
                <div className="text-center">
                  <Badge
                    variant={
                      correlationData.strength === "strong"
                        ? "default"
                        : correlationData.strength === "moderate"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {correlationData.strength.toUpperCase()}
                  </Badge>
                  <div className="text-sm text-muted-foreground mt-1">Strength</div>
                </div>
                <div className="text-center">
                  <Badge variant={correlationData.direction === "positive" ? "default" : "destructive"}>
                    {correlationData.direction.toUpperCase()}
                  </Badge>
                  <div className="text-sm text-muted-foreground mt-1">Direction</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  const renderMarketSummary = () => {
    if (!comparison) return null

    const { marketSummary } = comparison

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Cap</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatLargeNumber(marketSummary.totalMarketCap)}</div>
            <p className="text-xs text-muted-foreground">Combined market value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Volatility</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercent(marketSummary.avgVolatility * 100)}</div>
            <p className="text-xs text-muted-foreground">Average price volatility</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Correlation</CardTitle>
            <GitCompare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketSummary.avgCorrelation.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Average asset correlation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Sentiment</CardTitle>
            {marketSummary.marketSentiment === "bullish" ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : marketSummary.marketSentiment === "bearish" ? (
              <TrendingDown className="h-4 w-4 text-red-600" />
            ) : (
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            )}
          </CardHeader>
          <CardContent>
            <Badge
              variant={
                marketSummary.marketSentiment === "bullish"
                  ? "default"
                  : marketSummary.marketSentiment === "bearish"
                    ? "destructive"
                    : "secondary"
              }
            >
              {marketSummary.marketSentiment.toUpperCase()}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">Overall market mood</p>
          </CardContent>
        </Card>
      </div>
    )
  }

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
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Market Comparison</span>
            <Button onClick={refetch} size="sm" variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardTitle>
          <CardDescription>Compare performance across different markets and assets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedSymbols.map((symbol) => (
              <Badge key={symbol} variant="secondary" className="flex items-center gap-1">
                {symbol}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => removeSymbol(symbol)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add symbol (e.g., TSLA, GBP/USD)"
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addSymbol()}
            />
            <Button onClick={addSymbol}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Market Summary */}
      {renderMarketSummary()}

      {/* Comparison Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="correlation">Correlation</TabsTrigger>
          <TabsTrigger value="leaders">Top/Bottom</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Asset Comparison</CardTitle>
              <CardDescription>Detailed comparison of selected assets</CardDescription>
            </CardHeader>
            <CardContent>{renderComparisonTable()}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          {renderPerformanceComparison()}
        </TabsContent>

        <TabsContent value="correlation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Correlation Matrix</CardTitle>
              <CardDescription>Asset correlation analysis - click cells for detailed view</CardDescription>
            </CardHeader>
            <CardContent>{renderCorrelationMatrix()}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaders" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <TrendingUp className="h-5 w-5" />
                  Best Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="1d">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="1d">1D</TabsTrigger>
                    <TabsTrigger value="7d">7D</TabsTrigger>
                    <TabsTrigger value="30d">30D</TabsTrigger>
                  </TabsList>
                  {(["1d", "7d", "30d"] as const).map((period) => (
                    <TabsContent key={period} value={period} className="space-y-3 mt-4">
                      {comparison?.bestPerformers[period].map((asset, index) => (
                        <div
                          key={asset.symbol}
                          className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/20"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                            <span className="font-medium">{asset.symbol}</span>
                          </div>
                          <span className="text-green-600 font-medium">{formatPercent(asset.performance[period])}</span>
                        </div>
                      ))}
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <TrendingDown className="h-5 w-5" />
                  Worst Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="1d">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="1d">1D</TabsTrigger>
                    <TabsTrigger value="7d">7D</TabsTrigger>
                    <TabsTrigger value="30d">30D</TabsTrigger>
                  </TabsList>
                  {(["1d", "7d", "30d"] as const).map((period) => (
                    <TabsContent key={period} value={period} className="space-y-3 mt-4">
                      {comparison?.worstPerformers[period].map((asset, index) => (
                        <div
                          key={asset.symbol}
                          className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-950/20"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                            <span className="font-medium">{asset.symbol}</span>
                          </div>
                          <span className="text-red-600 font-medium">{formatPercent(asset.performance[period])}</span>
                        </div>
                      ))}
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
