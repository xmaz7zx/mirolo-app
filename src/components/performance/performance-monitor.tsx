'use client'

import { useEffect, useState } from 'react'

interface PerformanceMetrics {
  fcp: number | null // First Contentful Paint
  lcp: number | null // Largest Contentful Paint
  fid: number | null // First Input Delay
  cls: number | null // Cumulative Layout Shift
  ttfb: number | null // Time to First Byte
}

interface NetworkInfo {
  effectiveType?: string
  downlink?: number
  rtt?: number
  saveData?: boolean
}

export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null
  })

  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>({})

  useEffect(() => {
    // Monitor Core Web Vitals
    const observeWebVitals = () => {
      // First Contentful Paint
      const paintObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            setMetrics(prev => ({ ...prev, fcp: entry.startTime }))
          }
        }
      })
      paintObserver.observe({ type: 'paint', buffered: true })

      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        const lastEntry = entries[entries.length - 1]
        setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }))
      })
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })

      // First Input Delay
      const fidObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          setMetrics(prev => ({ ...prev, fid: (entry as any).processingStart - entry.startTime }))
        }
      })
      fidObserver.observe({ type: 'first-input', buffered: true })

      // Cumulative Layout Shift
      let clsValue = 0
      const clsObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value
            setMetrics(prev => ({ ...prev, cls: clsValue }))
          }
        }
      })
      clsObserver.observe({ type: 'layout-shift', buffered: true })

      // Time to First Byte
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navigation) {
        setMetrics(prev => ({ ...prev, ttfb: navigation.responseStart - navigation.requestStart }))
      }
    }

    // Network Information
    const updateNetworkInfo = () => {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
      if (connection) {
        setNetworkInfo({
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData
        })
      }
    }

    observeWebVitals()
    updateNetworkInfo()

    // Listen for network changes
    const connection = (navigator as any).connection
    if (connection) {
      connection.addEventListener('change', updateNetworkInfo)
    }

    return () => {
      if (connection) {
        connection.removeEventListener('change', updateNetworkInfo)
      }
    }
  }, [])

  return { metrics, networkInfo }
}

// Performance budget checker
export function usePerformanceBudget() {
  const { metrics, networkInfo } = usePerformanceMonitor()

  const budgets = {
    fcp: 1800, // 1.8s
    lcp: 2500, // 2.5s
    fid: 100,  // 100ms
    cls: 0.1,  // 0.1
    ttfb: 600  // 600ms
  }

  const violations = Object.entries(budgets).reduce((acc, [key, budget]) => {
    const metric = metrics[key as keyof PerformanceMetrics]
    if (metric !== null && metric > budget) {
      acc.push({
        metric: key,
        value: metric,
        budget,
        severity: metric > budget * 1.5 ? 'high' : 'medium'
      })
    }
    return acc
  }, [] as Array<{
    metric: string
    value: number
    budget: number
    severity: 'medium' | 'high'
  }>)

  return {
    metrics,
    networkInfo,
    violations,
    isSlowNetwork: networkInfo.effectiveType === 'slow-2g' || networkInfo.effectiveType === '2g',
    hasDataSaver: networkInfo.saveData
  }
}

// Development only performance monitor component
export default function PerformanceMonitor() {
  const { metrics, networkInfo, violations } = usePerformanceBudget()

  // Only show in development
  if (process.env.NODE_ENV !== 'development') return null

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black text-white p-3 rounded-lg text-xs font-mono max-w-xs">
      <div className="font-bold mb-2">⚡ Performance</div>
      
      <div className="space-y-1">
        <div>FCP: {metrics.fcp ? `${Math.round(metrics.fcp)}ms` : '–'}</div>
        <div>LCP: {metrics.lcp ? `${Math.round(metrics.lcp)}ms` : '–'}</div>
        <div>FID: {metrics.fid ? `${Math.round(metrics.fid)}ms` : '–'}</div>
        <div>CLS: {metrics.cls ? metrics.cls.toFixed(3) : '–'}</div>
        <div>TTFB: {metrics.ttfb ? `${Math.round(metrics.ttfb)}ms` : '–'}</div>
      </div>

      {networkInfo.effectiveType && (
        <div className="mt-2 pt-2 border-t border-gray-600">
          <div>📶 {networkInfo.effectiveType.toUpperCase()}</div>
          {networkInfo.downlink && <div>⬇ {networkInfo.downlink} Mbps</div>}
          {networkInfo.saveData && <div>💾 Data Saver ON</div>}
        </div>
      )}

      {violations.length > 0 && (
        <div className="mt-2 pt-2 border-t border-red-600">
          <div className="text-red-400 font-bold">⚠ Violations:</div>
          {violations.map((violation, i) => (
            <div key={i} className={violation.severity === 'high' ? 'text-red-400' : 'text-yellow-400'}>
              {violation.metric}: {Math.round(violation.value)} > {violation.budget}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}