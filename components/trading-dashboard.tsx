"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Bitcoin,
  BarChart3,
  Brain,
  AlertTriangle,
  RefreshCw,
  Zap,
  Shield,
  GitCompare,
} from "lucide-react"
import { useMarketData } from "@/hooks/use-market-data"
import { usePortfolio } from "@/hooks/use-portfolio"
import { AIInsightsPanel } from "@/components/ai-insights-panel"
import { PortfolioOverview } from "@/components/portfolio-overview"
import { TradingSignalsDashboard } from "@/components/trading-signals-dashboard"
import { RiskManagementDashboard } from "@/components/risk-management-dashboard"
import { MarketComparisonDashboard } from "@/components/market-comparison-dashboard"

export function TradingDashboard() {
  const [activeMarket, setActiveMarket] = useState("forex")
  const [activeTab, setActiveTab] = useState("market")
  const { data: marketData, loading, error, refetch } = useMarketData(3000)
  const { metrics: portfolioMetrics } = usePortfolio()

  const renderMarketData = () => {
    if (loading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-lg border bg-card/50">
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-5 rounded" />
                <div>
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
              <div className="text-right">
                <Skeleton className="h-6 w-16 mb-2" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
          ))}
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

    if (!marketData) return null

    const currentMarketData = marketData[activeMarket as keyof typeof marketData] || []

    return (
      <div className="space-y-4">
        {currentMarketData.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 rounded-lg border bg-card/50 transition-all duration-200 hover:bg-card/70"
          >
            <div className="flex items-center gap-3">
              {activeMarket === "crypto" && <Bitcoin className="h-5 w-5 text-orange-500" />}
              <div>
                <div className="font-semibold">{item.pair}</div>
                <div className="text-2xl font-bold">{item.price}</div>
                {item.volume && <div className="text-xs text-muted-foreground">Vol: {item.volume}</div>}
              </div>
            </div>
            <div className="text-right">
              <Badge variant={item.trend === "up" ? "default" : "destructive"} className="mb-2">
                {item.trend === "up" ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {item.changePercent}
              </Badge>
              <div className="text-sm text-muted-foreground">{item.change}</div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-50/20">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
                <Brain className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">AI Trading Analytics</h1>
                <p className="text-sm text-muted-foreground">Comprehensive Trading Intelligence Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={refetch} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button className="bg-accent hover:bg-accent/90">Explore Market Trends</Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Market Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-chart-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Portfolio</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {portfolioMetrics ? `$${portfolioMetrics.totalValue.toLocaleString()}` : "$124,847"}
              </div>
              <p className="text-xs text-chart-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {portfolioMetrics ? `${portfolioMetrics.totalPnLPercent.toFixed(2)}%` : "+2.4%"} total return
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-chart-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily P&L</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {portfolioMetrics ? `$${portfolioMetrics.dayPnL.toLocaleString()}` : "-$1,247"}
              </div>
              <p className="text-xs text-chart-2 flex items-center gap-1">
                <TrendingDown className="h-3 w-3" />
                {portfolioMetrics ? `${portfolioMetrics.dayPnLPercent.toFixed(2)}%` : "-0.8%"} today
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-chart-3">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Positions</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{portfolioMetrics ? portfolioMetrics.openPositions : "12"}</div>
              <p className="text-xs text-muted-foreground">
                {portfolioMetrics ? `${portfolioMetrics.winRate.toFixed(0)}% win rate` : "8 profitable, 4 at loss"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-chart-5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Confidence</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">78%</div>
              <p className="text-xs text-muted-foreground">High confidence signals</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="market">Market Data</TabsTrigger>
            <TabsTrigger value="signals">
              <Zap className="h-4 w-4 mr-2" />
              Signals
            </TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="ai">AI Insights</TabsTrigger>
            <TabsTrigger value="risk">
              <Shield className="h-4 w-4 mr-2" />
              Risk
            </TabsTrigger>
            <TabsTrigger value="comparison">
              <GitCompare className="h-4 w-4 mr-2" />
              Compare
            </TabsTrigger>
          </TabsList>

          <TabsContent value="market" className="mt-8">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Activity className="h-5 w-5" />
                          Market Data
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            Live
                          </div>
                        </CardTitle>
                        <CardDescription>Real-time prices across forex, crypto, and stocks</CardDescription>
                      </div>
                      <Button variant="ghost" size="sm" onClick={refetch} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={activeMarket} onValueChange={setActiveMarket}>
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="forex">Forex</TabsTrigger>
                        <TabsTrigger value="crypto">Crypto</TabsTrigger>
                        <TabsTrigger value="stocks">Stocks</TabsTrigger>
                      </TabsList>

                      <TabsContent value={activeMarket} className="mt-6">
                        {renderMarketData()}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="signals" className="mt-8">
            <TradingSignalsDashboard />
          </TabsContent>

          <TabsContent value="portfolio" className="mt-8">
            <PortfolioOverview />
          </TabsContent>

          <TabsContent value="ai" className="mt-8">
            <AIInsightsPanel market={activeMarket as "forex" | "crypto" | "stocks"} />
          </TabsContent>

          <TabsContent value="risk" className="mt-8">
            <RiskManagementDashboard />
          </TabsContent>

          <TabsContent value="comparison" className="mt-8">
            <MarketComparisonDashboard />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
