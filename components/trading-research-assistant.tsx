"use client"

import { useState } from "react"
import { Search, TrendingUp, TrendingDown, AlertTriangle, DollarSign, Clock, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface TradingRecommendation {
  symbol: string
  action: "BUY" | "SELL" | "HOLD"
  confidence: number
  targetPrice: number
  currentPrice: number
  stopLoss: number
  timeframe: string
  reasoning: string[]
  riskLevel: "LOW" | "MEDIUM" | "HIGH"
  potentialReturn: number
}

export function TradingResearchAssistant() {
  const [symbol, setSymbol] = useState("")
  const [loading, setLoading] = useState(false)
  const [recommendation, setRecommendation] = useState<TradingRecommendation | null>(null)
  const [error, setError] = useState("")

  const handleAnalyze = async () => {
    if (!symbol.trim()) return

    setLoading(true)
    setError("")
    setRecommendation(null)

    try {
      const response = await fetch("/api/trading-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol: symbol.toUpperCase() }),
      })

      if (!response.ok) {
        throw new Error("Failed to analyze symbol")
      }

      const data = await response.json()
      setRecommendation(data)
    } catch (err) {
      setError("Failed to analyze symbol. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case "BUY":
        return "text-green-600 bg-green-50 border-green-200"
      case "SELL":
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "LOW":
        return "text-green-600 bg-green-50"
      case "MEDIUM":
        return "text-yellow-600 bg-yellow-50"
      default:
        return "text-red-600 bg-red-50"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">AI Trading Research Assistant</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Enter any trading symbol to get AI-powered research and recommendations
          </p>
        </div>

        {/* Search Interface */}
        <Card className="border-2 border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Symbol Analysis
            </CardTitle>
            <CardDescription>Enter a stock, crypto, or forex symbol (e.g., AAPL, BTC-USD, EUR/USD)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Enter trading symbol..."
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAnalyze()}
                className="text-lg"
              />
              <Button onClick={handleAnalyze} disabled={loading || !symbol.trim()} className="px-6">
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Analyze
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-5 w-5" />
                {error}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommendation Results */}
        {recommendation && (
          <div className="space-y-4">
            {/* Main Recommendation */}
            <Card className="border-2 border-purple-200 dark:border-purple-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">{recommendation.symbol}</CardTitle>
                  <Badge className={`text-lg px-4 py-2 ${getActionColor(recommendation.action)}`}>
                    {recommendation.action === "BUY" && <TrendingUp className="h-4 w-4 mr-1" />}
                    {recommendation.action === "SELL" && <TrendingDown className="h-4 w-4 mr-1" />}
                    {recommendation.action}
                  </Badge>
                </div>
                <CardDescription>
                  Confidence: {recommendation.confidence}% | Risk:{" "}
                  <span className={`px-2 py-1 rounded text-sm ${getRiskColor(recommendation.riskLevel)}`}>
                    {recommendation.riskLevel}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Current Price</div>
                    <div className="text-lg font-bold">${recommendation.currentPrice}</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Target Price</div>
                    <div className="text-lg font-bold text-green-600">${recommendation.targetPrice}</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Stop Loss</div>
                    <div className="text-lg font-bold text-red-600">${recommendation.stopLoss}</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Potential Return</div>
                    <div className="text-lg font-bold text-purple-600">+{recommendation.potentialReturn}%</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Timeframe: {recommendation.timeframe}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      AI Analysis & Reasoning
                    </h4>
                    <ul className="space-y-1">
                      {recommendation.reasoning.map((reason, index) => (
                        <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                          <span className="text-purple-500 mt-1">•</span>
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Action Card */}
            <Card className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold">Ready to Trade?</h3>
                  <p className="text-purple-100">
                    Based on our analysis, this could help you reach your $1/day trading goal
                  </p>
                  <div className="flex justify-center gap-4 mt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        ${Math.abs(recommendation.targetPrice - recommendation.currentPrice).toFixed(2)}
                      </div>
                      <div className="text-sm text-purple-200">Potential Profit per Share</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {Math.ceil(1 / Math.abs(recommendation.targetPrice - recommendation.currentPrice))}
                      </div>
                      <div className="text-sm text-purple-200">Shares Needed for $1</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
