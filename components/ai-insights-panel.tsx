"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Brain, TrendingUp, TrendingDown, AlertTriangle, Activity, BarChart3, RefreshCw, Lightbulb } from "lucide-react"
import { useAIAnalytics } from "@/hooks/use-ai-analytics"
import type { AIInsight, TechnicalIndicator, PatternRecognition } from "@/lib/ai-analytics-service"

interface AIInsightsPanelProps {
  market: "forex" | "crypto" | "stocks"
  pairs?: string[]
}

export function AIInsightsPanel({ market, pairs }: AIInsightsPanelProps) {
  const { data, loading, error, refetch } = useAIAnalytics(market, pairs)

  const getInsightIcon = (type: AIInsight["type"]) => {
    switch (type) {
      case "bullish":
        return <TrendingUp className="h-4 w-4" />
      case "bearish":
        return <TrendingDown className="h-4 w-4" />
      case "warning":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getInsightColor = (type: AIInsight["type"]) => {
    switch (type) {
      case "bullish":
        return "bg-chart-1/20 text-chart-1 border-chart-1/30"
      case "bearish":
        return "bg-chart-2/20 text-chart-2 border-chart-2/30"
      case "warning":
        return "bg-chart-5/20 text-chart-5 border-chart-5/30"
      default:
        return "bg-chart-3/20 text-chart-3 border-chart-3/30"
    }
  }

  const renderTechnicalIndicators = (indicators: TechnicalIndicator[]) => (
    <div className="space-y-3">
      {indicators.slice(0, 6).map((indicator, index) => (
        <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-card/30">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">{indicator.name}</span>
              <Badge
                variant={
                  indicator.signal === "buy" ? "default" : indicator.signal === "sell" ? "destructive" : "secondary"
                }
              >
                {indicator.signal.toUpperCase()}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Value: {indicator.value}</span>
              <Progress value={indicator.strength} className="flex-1 h-2" />
              <span className="text-xs text-muted-foreground">{indicator.strength}%</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const renderPatterns = (patterns: PatternRecognition[]) => (
    <div className="space-y-3">
      {patterns.map((pattern, index) => (
        <div key={index} className="p-4 rounded-lg border bg-card/30">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-medium">{pattern.pattern}</h4>
              <p className="text-sm text-muted-foreground">{pattern.pair}</p>
            </div>
            <Badge
              variant={
                pattern.type === "bullish" ? "default" : pattern.type === "bearish" ? "destructive" : "secondary"
              }
            >
              {pattern.confidence}% confidence
            </Badge>
          </div>
          <p className="text-sm mb-2">{pattern.description}</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>
              Expected: {pattern.expectedMove.direction} {pattern.expectedMove.magnitude.toFixed(1)}%
            </span>
            <span>Timeframe: {pattern.expectedMove.timeframe}</span>
          </div>
        </div>
      ))}
    </div>
  )

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
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

  if (!data) return null

  return (
    <div className="space-y-6">
      {/* Market Sentiment */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Market Sentiment
              </CardTitle>
              <CardDescription>AI-powered market analysis for {market}</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={refetch}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div
              className={`p-3 rounded-full ${
                data.sentiment.overall === "bullish"
                  ? "bg-chart-1/20 text-chart-1"
                  : data.sentiment.overall === "bearish"
                    ? "bg-chart-2/20 text-chart-2"
                    : "bg-chart-3/20 text-chart-3"
              }`}
            >
              {data.sentiment.overall === "bullish" ? (
                <TrendingUp className="h-6 w-6" />
              ) : data.sentiment.overall === "bearish" ? (
                <TrendingDown className="h-6 w-6" />
              ) : (
                <Activity className="h-6 w-6" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold capitalize">{data.sentiment.overall}</h3>
              <p className="text-sm text-muted-foreground">Sentiment Score: {data.sentiment.score}</p>
            </div>
          </div>
          <div className="space-y-2">
            {data.sentiment.factors.map((factor, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span>{factor.factor}</span>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      factor.impact === "positive"
                        ? "default"
                        : factor.impact === "negative"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {factor.impact}
                  </Badge>
                  <span className="text-muted-foreground">{factor.weight.toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            AI Insights
          </CardTitle>
          <CardDescription>Real-time trading recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.insights.slice(0, 5).map((insight) => (
              <div key={insight.id} className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-background/50">{getInsightIcon(insight.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{insight.title}</h4>
                      <Badge variant="outline">{insight.confidence}%</Badge>
                    </div>
                    <p className="text-sm mb-2">{insight.message}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{insight.pair}</span>
                      <span>{insight.timeframe}</span>
                      {insight.actionable && (
                        <Badge variant="secondary" className="text-xs">
                          Actionable
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Technical Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Technical Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="indicators">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="indicators">Indicators</TabsTrigger>
              <TabsTrigger value="patterns">Patterns</TabsTrigger>
            </TabsList>
            <TabsContent value="indicators" className="mt-4">
              {Object.entries(data.technicalIndicators).map(([pair, indicators]) => (
                <div key={pair} className="mb-6">
                  <h4 className="font-medium mb-3">{pair}</h4>
                  {renderTechnicalIndicators(indicators)}
                </div>
              ))}
            </TabsContent>
            <TabsContent value="patterns" className="mt-4">
              {renderPatterns(data.patterns)}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
