"use client"

import { useState, useEffect, useCallback } from "react"
import type { MarketComparison } from "@/lib/market-comparison-service"

export function useMarketComparison(symbols: string[]) {
  const [comparison, setComparison] = useState<MarketComparison | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchComparison = useCallback(async () => {
    if (symbols.length < 2) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/market-comparison?symbols=${symbols.join(",")}`)

      if (!response.ok) {
        throw new Error("Failed to fetch market comparison")
      }

      const data = await response.json()
      setComparison(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }, [symbols])

  useEffect(() => {
    fetchComparison()
  }, [fetchComparison])

  const refetch = useCallback(() => {
    fetchComparison()
  }, [fetchComparison])

  return {
    comparison,
    loading,
    error,
    refetch,
  }
}

export function useAssetCorrelation(symbol1: string, symbol2: string) {
  const [correlation, setCorrelation] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCorrelation = useCallback(async () => {
    if (!symbol1 || !symbol2) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/market-comparison/correlation?symbol1=${symbol1}&symbol2=${symbol2}`)

      if (!response.ok) {
        throw new Error("Failed to fetch correlation data")
      }

      const data = await response.json()
      setCorrelation(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }, [symbol1, symbol2])

  useEffect(() => {
    fetchCorrelation()
  }, [fetchCorrelation])

  return {
    correlation,
    loading,
    error,
    refetch: fetchCorrelation,
  }
}
