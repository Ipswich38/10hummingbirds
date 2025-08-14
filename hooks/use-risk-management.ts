"use client"

import { useState, useEffect, useCallback } from "react"
import type {
  RiskMetrics,
  ExposureAnalysis,
  RiskAlert,
  RiskLimits,
  PositionSizingCalculation,
} from "@/lib/risk-management-service"

interface UseRiskManagementReturn {
  riskMetrics: RiskMetrics | null
  exposure: ExposureAnalysis | null
  alerts: RiskAlert[] | null
  limits: RiskLimits | null
  loading: boolean
  error: string | null
  refetch: () => void
  acknowledgeAlert: (id: string) => Promise<boolean>
  updateLimits: (limits: Partial<RiskLimits>) => Promise<boolean>
  calculatePositionSizing: (params: {
    accountBalance: number
    riskPercent: number
    entryPrice: number
    stopLoss: number
    leverage?: number
  }) => Promise<PositionSizingCalculation | null>
}

export function useRiskManagement(refreshInterval = 15000): UseRiskManagementReturn {
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics | null>(null)
  const [exposure, setExposure] = useState<ExposureAnalysis | null>(null)
  const [alerts, setAlerts] = useState<RiskAlert[] | null>(null)
  const [limits, setLimits] = useState<RiskLimits | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setError(null)

      const [metricsRes, exposureRes, alertsRes, limitsRes] = await Promise.all([
        fetch("/api/risk-management?type=metrics"),
        fetch("/api/risk-management?type=exposure"),
        fetch("/api/risk-management?type=alerts"),
        fetch("/api/risk-management?type=limits"),
      ])

      const [metricsData, exposureData, alertsData, limitsData] = await Promise.all([
        metricsRes.json(),
        exposureRes.json(),
        alertsRes.json(),
        limitsRes.json(),
      ])

      if (metricsData.success) setRiskMetrics(metricsData.data)
      if (exposureData.success) setExposure(exposureData.data)
      if (alertsData.success) setAlerts(alertsData.data)
      if (limitsData.success) setLimits(limitsData.data)

      if (!metricsData.success || !exposureData.success || !alertsData.success || !limitsData.success) {
        setError("Failed to fetch some risk management data")
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

  const acknowledgeAlert = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const response = await fetch("/api/risk-management", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "acknowledge-alert", id }),
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

  const updateLimits = useCallback(async (newLimits: Partial<RiskLimits>): Promise<boolean> => {
    try {
      const response = await fetch("/api/risk-management", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update-limits", limits: newLimits }),
      })

      const result = await response.json()
      if (result.success) {
        setLimits(result.data)
        return true
      }
      return false
    } catch {
      return false
    }
  }, [])

  const calculatePositionSizing = useCallback(
    async (params: {
      accountBalance: number
      riskPercent: number
      entryPrice: number
      stopLoss: number
      leverage?: number
    }): Promise<PositionSizingCalculation | null> => {
      try {
        const queryParams = new URLSearchParams({
          type: "position-sizing",
          accountBalance: params.accountBalance.toString(),
          riskPercent: params.riskPercent.toString(),
          entryPrice: params.entryPrice.toString(),
          stopLoss: params.stopLoss.toString(),
          leverage: (params.leverage || 1).toString(),
        })

        const response = await fetch(`/api/risk-management?${queryParams}`)
        const result = await response.json()

        if (result.success) {
          return result.data
        }
        return null
      } catch {
        return null
      }
    },
    [],
  )

  useEffect(() => {
    fetchData()

    const interval = setInterval(fetchData, refreshInterval)
    return () => clearInterval(interval)
  }, [fetchData, refreshInterval])

  return {
    riskMetrics,
    exposure,
    alerts,
    limits,
    loading,
    error,
    refetch,
    acknowledgeAlert,
    updateLimits,
    calculatePositionSizing,
  }
}
