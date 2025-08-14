"use client"

import { useState, useEffect, useCallback } from "react"
import type {
  AIInsight,
  MarketSentiment,
  PatternRecognition,
  TechnicalIndicator,
  PriceTarget,
} from "@/lib/ai-analytics-service"

interface AIAnalysisData {
  insights: AIInsight[]
  sentiment: MarketSentiment
  patterns: PatternRecognition[]
  technicalIndicators: Record<string, TechnicalIndicator[]>
  priceTargets: Record<string, PriceTarget>
}

interface UseAIAnalyticsReturn {
  data: AIAnalysisData | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useAIAnalytics(
  market: "forex" | "crypto" | "stocks",
  pairs?: string[],
  refreshInterval = 30000, // 30 seconds
): UseAIAnalyticsReturn {
  const [data, setData] = useState<AIAnalysisData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setError(null)
      const pairsQuery = pairs ? `&pairs=${pairs.join(",")}` : ""
      const response = await fetch(`/api/ai-analytics?market=${market}${pairsQuery}`)
      const result = await response.json()

      if (result.success) {
        setData(result.data)
      } else {
        setError(result.error || "Failed to fetch AI analysis")
      }
    } catch (err) {
      setError("Network error occurred")
    } finally {
      setLoading(false)
    }
  }, [market, pairs])

  const refetch = useCallback(() => {
    setLoading(true)
    fetchData()
  }, [fetchData])

  useEffect(() => {
    fetchData()

    const interval = setInterval(fetchData, refreshInterval)
    return () => clearInterval(interval)
  }, [fetchData, refreshInterval])

  return { data, loading, error, refetch }
}
