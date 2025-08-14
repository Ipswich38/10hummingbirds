"use client"

import { useState, useEffect, useCallback } from "react"
import type { TradingSignal, SignalStats } from "@/lib/trading-signals-service"

interface UseTradingSignalsReturn {
  signals: TradingSignal[] | null
  stats: SignalStats | null
  loading: boolean
  error: string | null
  refetch: () => void
  triggerSignal: (id: string) => Promise<boolean>
  cancelSignal: (id: string) => Promise<boolean>
  generateNewSignals: (count?: number) => Promise<boolean>
}

export function useTradingSignals(
  filters?: {
    market?: "forex" | "crypto" | "stocks"
    type?: "buy" | "sell"
    strength?: "weak" | "moderate" | "strong" | "very_strong"
    status?: "active" | "triggered" | "expired" | "cancelled"
    minConfidence?: number
  },
  refreshInterval = 10000, // 10 seconds
): UseTradingSignalsReturn {
  const [signals, setSignals] = useState<TradingSignal[] | null>(null)
  const [stats, setStats] = useState<SignalStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams({ type: "signals" })
    if (filters?.market) params.append("market", filters.market)
    if (filters?.type) params.append("signalType", filters.type)
    if (filters?.strength) params.append("strength", filters.strength)
    if (filters?.status) params.append("status", filters.status)
    if (filters?.minConfidence) params.append("minConfidence", filters.minConfidence.toString())
    return params.toString()
  }, [filters])

  const fetchData = useCallback(async () => {
    try {
      setError(null)

      const [signalsRes, statsRes] = await Promise.all([
        fetch(`/api/trading-signals?${buildQueryString()}`),
        fetch("/api/trading-signals?type=stats"),
      ])

      const [signalsData, statsData] = await Promise.all([signalsRes.json(), statsRes.json()])

      if (signalsData.success) setSignals(signalsData.data)
      if (statsData.success) setStats(statsData.data)

      if (!signalsData.success || !statsData.success) {
        setError("Failed to fetch some trading signals data")
      }
    } catch (err) {
      setError("Network error occurred")
    } finally {
      setLoading(false)
    }
  }, [buildQueryString])

  const refetch = useCallback(() => {
    setLoading(true)
    fetchData()
  }, [fetchData])

  const triggerSignal = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const response = await fetch("/api/trading-signals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "trigger", id }),
        })

        const result = await response.json()
        if (result.success) {
          refetch()
          return true
        }
        return false
      } catch {
        return false
      }
    },
    [refetch],
  )

  const cancelSignal = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const response = await fetch("/api/trading-signals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "cancel", id }),
        })

        const result = await response.json()
        if (result.success) {
          refetch()
          return true
        }
        return false
      } catch {
        return false
      }
    },
    [refetch],
  )

  const generateNewSignals = useCallback(
    async (count = 1): Promise<boolean> => {
      try {
        const response = await fetch("/api/trading-signals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "generate", count }),
        })

        const result = await response.json()
        if (result.success) {
          refetch()
          return true
        }
        return false
      } catch {
        return false
      }
    },
    [refetch],
  )

  useEffect(() => {
    fetchData()

    const interval = setInterval(fetchData, refreshInterval)
    return () => clearInterval(interval)
  }, [fetchData, refreshInterval])

  return {
    signals,
    stats,
    loading,
    error,
    refetch,
    triggerSignal,
    cancelSignal,
    generateNewSignals,
  }
}
