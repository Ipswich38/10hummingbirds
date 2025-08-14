"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Zap, Target, AlertTriangle, RefreshCw, Play, X, BarChart3, Activity } from "lucide-react"
import { useTradingSignals } from "@/hooks/use-trading-signals"
import type { TradingSignal } from "@/lib/trading-signals-service"

export function TradingSignalsDashboard() {
  const [selectedMarket, setSelectedMarket] = useState<"forex" | "crypto" | "stocks" | undefined>("forex")
  const [selectedType, setSelectedType] = useState<"buy" | "sell" | undefined>("buy")
  const [selectedStrength, setSelectedStrength] = useState<"weak" | "moderate" | "strong" | "very_strong" | undefined>(
    "weak",
  )

  const { signals, stats, loading, error, refetch, triggerSignal, cancelSignal, generateNewSignals } =
    useTradingSignals({
      market: selectedMarket,
      type: selectedType,
      strength: selectedStrength,
      status: "active",
      minConfidence: 60,
    })

  const getSignalTypeColor = (type: "buy" | "sell") => {
    return type === "buy" ? "text-chart-1" : "text-chart-2"
  }

  const getSignalTypeBadge = (type: "buy" | "sell") => {
    return type === "buy" ? "default" : "destructive"
  }

  const getStrengthColor = (strength: TradingSignal["strength"]) => {
    switch (strength) {
      case "very_strong":
        return "bg-chart-1/20 text-chart-1 border-chart-1/30"
      case "strong":
        return "bg-chart-4/20 text-chart-4 border-chart-4/30"
      case "moderate":
        return "bg-chart-3/20 text-chart-3 border-chart-3/30"
      default:
        return "bg-muted/20 text-muted-foreground border-muted/30"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(amount)
  }

  const renderSignalCard = (signal: TradingSignal) => (
    <Card key={signal.id} className="border-l-4 border-l-primary/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div>
              <h4 className="font-semibold flex items-center gap-2">
                {signal.pair}
                <Badge variant={getSignalTypeBadge(signal.type)} className="text-xs">
                  {signal.type.toUpperCase()}
                </Badge>
              </h4>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="capitalize">{signal.market}</span>
                <span>•</span>
                <span>{signal.timeframe}</span>
                <span>•</span>
                <Badge className={`text-xs ${getStrengthColor(signal.strength)}`}>
                  {signal.strength.replace("_", " ").toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold">{signal.confidence}%</div>
            <div className="text-sm text-muted-foreground">Confidence</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
          <div>
            <span className="text-muted-foreground">Entry:</span>
            <div className="font-medium">{formatCurrency(signal.entryPrice)}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Current:</span>
            <div className="font-medium">{formatCurrency(signal.currentPrice)}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Stop Loss:</span>
            <div className="font-medium">{formatCurrency(signal.stopLoss)}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Take Profit:</span>
            <div className="font-medium">{formatCurrency(signal.takeProfit[0])}</div>
          </div>
        </div>

        <div className="mb-4">
          <h5 className="text-sm font-medium mb-2">Analysis:</h5>
          <ul className="text-sm text-muted-foreground space-y-1">
            {signal.reasoning.slice(0, 2).map((reason, index) => (
              <li key={index} className="flex items-center gap-2">
                <div className="w-1 h-1 bg-primary rounded-full"></div>
                {reason}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">R/R:</span>
            <Badge variant="outline">{signal.riskReward}:1</Badge>
            <span className="text-muted-foreground">Expected:</span>
            <Badge variant="outline" className={getSignalTypeColor(signal.type)}>
              {signal.expectedMove.direction} {signal.expectedMove.percentage.toFixed(1)}%
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => triggerSignal(signal.id)} className="bg-chart-1 hover:bg-chart-1/90">
              <Play className="h-3 w-3 mr-1" />
              Execute
            </Button>
            <Button size="sm" variant="outline" onClick={() => cancelSignal(signal.id)}>
              <X className="h-3 w-3 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderStats = () => {
    if (!stats) return null

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="border-l-4 border-l-chart-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Signals</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSignals}</div>
            <p className="text-xs text-muted-foreground">of {stats.totalSignals} total</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-chart-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.winRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Historical performance</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-chart-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg P&L</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.avgPnL)}</div>
            <p className="text-xs text-muted-foreground">Per signal</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-chart-5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgDuration.toFixed(0)}h</div>
            <p className="text-xs text-muted-foreground">Signal lifetime</p>
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
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
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
      {/* Stats Cards */}
      {renderStats()}

      {/* Signals Dashboard */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Trading Signals
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Live
                </div>
              </CardTitle>
              <CardDescription>AI-powered buy/sell recommendations with entry and exit points</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => generateNewSignals(1)}>
                <Zap className="h-4 w-4 mr-2" />
                Generate
              </Button>
              <Button variant="ghost" size="sm" onClick={refetch}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <Select
              value={selectedMarket || "forex"}
              onValueChange={(value) => setSelectedMarket((value as any) || undefined)}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Market" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="forex">Forex</SelectItem>
                <SelectItem value="crypto">Crypto</SelectItem>
                <SelectItem value="stocks">Stocks</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={selectedType || "buy"}
              onValueChange={(value) => setSelectedType((value as any) || undefined)}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="buy">Buy</SelectItem>
                <SelectItem value="sell">Sell</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={selectedStrength || "weak"}
              onValueChange={(value) => setSelectedStrength((value as any) || undefined)}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Strength" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weak">Weak</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="strong">Strong</SelectItem>
                <SelectItem value="very_strong">Very Strong</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Signals List */}
          <div className="space-y-4">
            {signals && signals.length > 0 ? (
              signals.map(renderSignalCard)
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No active signals match your filters</p>
                <Button variant="outline" className="mt-4 bg-transparent" onClick={() => generateNewSignals(3)}>
                  Generate New Signals
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
