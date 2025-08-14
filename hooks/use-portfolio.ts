"use client"

import { useState, useEffect, useCallback } from "react"
import type { Position, PortfolioMetrics, PortfolioAllocation, PerformanceHistory } from "@/lib/portfolio-service"

interface UsePortfolioReturn {
  positions: Position[] | null
  metrics: PortfolioMetrics | null
  allocation: PortfolioAllocation[] | null
  history: PerformanceHistory[] | null
  loading: boolean
  error: string | null
  refetch: () => void
  closePosition: (id: string, exitPrice: number) => Promise<boolean>
  updatePosition: (id: string, updates: { stopLoss?: number; takeProfit?: number }) => Promise<boolean>
}

export function usePortfolio(refreshInterval = 5000): UsePortfolioReturn {
  const [positions, setPositions] = useState<Position[] | null>(null)
  const [metrics, setMetrics] = useState<PortfolioMetrics | null>(null)
  const [allocation, setAllocation] = useState<PortfolioAllocation[] | null>(null)
  const [history, setHistory] = useState<PerformanceHistory[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setError(null)

      const [positionsRes, metricsRes, allocationRes, historyRes] = await Promise.all([
        fetch("/api/portfolio?type=positions&status=open"),
        fetch("/api/portfolio?type=metrics"),
        fetch("/api/portfolio?type=allocation"),
        fetch("/api/portfolio?type=history&days=30"),
      ])

      const [positionsData, metricsData, allocationData, historyData] = await Promise.all([
        positionsRes.json(),
        metricsRes.json(),
        allocationRes.json(),
        historyRes.json(),
      ])

      if (positionsData.success) setPositions(positionsData.data)
      if (metricsData.success) setMetrics(metricsData.data)
      if (allocationData.success) setAllocation(allocationData.data)
      if (historyData.success) setHistory(historyData.data)

      if (!positionsData.success || !metricsData.success || !allocationData.success || !historyData.success) {
        setError("Failed to fetch some portfolio data")
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

  const closePosition = useCallback(
    async (id: string, exitPrice: number): Promise<boolean> => {
      try {
        const response = await fetch("/api/portfolio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "close", id, exitPrice }),
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

  const updatePosition = useCallback(
    async (id: string, updates: { stopLoss?: number; takeProfit?: number }): Promise<boolean> => {
      try {
        const response = await fetch("/api/portfolio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "update", id, updates }),
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
    positions,
    metrics,
    allocation,
    history,
    loading,
    error,
    refetch,
    closePosition,
    updatePosition,
  }
}
