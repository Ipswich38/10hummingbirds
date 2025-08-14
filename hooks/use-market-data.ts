"use client"

import { useState, useEffect, useCallback } from "react"
import type { MarketData, MarketDataPoint } from "@/lib/market-data-service"

interface UseMarketDataReturn {
  data: MarketData | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useMarketData(refreshInterval = 5000): UseMarketDataReturn {
  const [data, setData] = useState<MarketData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setError(null)
      const response = await fetch("/api/market-data")
      const result = await response.json()

      if (result.success) {
        setData(result.data)
      } else {
        setError(result.error || "Failed to fetch market data")
      }
    } catch (err) {
      setError("Network error occurred")
    } finally {
      setLoading(false)
    }
  }, [])

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

interface UseMarketDataByTypeReturn {
  data: MarketDataPoint[] | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useMarketDataByType(
  market: "forex" | "crypto" | "stocks",
  refreshInterval = 5000,
): UseMarketDataByTypeReturn {
  const [data, setData] = useState<MarketDataPoint[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setError(null)
      const response = await fetch(`/api/market-data?market=${market}`)
      const result = await response.json()

      if (result.success) {
        setData(result.data)
      } else {
        setError(result.error || "Failed to fetch market data")
      }
    } catch (err) {
      setError("Network error occurred")
    } finally {
      setLoading(false)
    }
  }, [market])

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
