'use client'

import { useEffect, useState } from 'react'

// Critical CSS that should be inlined for faster first paint
const criticalCSS = `
  /* Critical styles for above-the-fold content */
  body {
    margin: 0;
    font-family: system-ui, -apple-system, sans-serif;
    line-height: 1.5;
    background-color: #ffffff;
    color: #0f172a;
  }

  .loading-skeleton {
    background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
    background-size: 200% 100%;
    animation: loading-shimmer 2s infinite;
  }

  @keyframes loading-shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  .btn-primary {
    background-color: #6366f1;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .btn-primary:hover {
    background-color: #4f46e5;
  }

  .card {
    background-color: white;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    padding: 1rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 768px) {
    body {
      font-size: 14px;
    }
    
    .card {
      padding: 0.75rem;
    }
  }
`

export function CriticalCSS() {
  useEffect(() => {
    // Remove critical CSS after main CSS is loaded to avoid duplication
    const timer = setTimeout(() => {
      const criticalStyleElement = document.getElementById('critical-css')
      if (criticalStyleElement) {
        criticalStyleElement.remove()
      }
    }, 3000) // Remove after 3 seconds

    return () => clearTimeout(timer)
  }, [])

  return (
    <style
      id="critical-css"
      dangerouslySetInnerHTML={{ __html: criticalCSS }}
    />
  )
}

// Hook to detect when main CSS is loaded
export function useStylesLoaded() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Check if main CSS variables are available
    const checkStyles = () => {
      const testElement = document.createElement('div')
      testElement.style.position = 'absolute'
      testElement.style.visibility = 'hidden'
      testElement.className = 'text-primary' // Tailwind class
      
      document.body.appendChild(testElement)
      
      const styles = window.getComputedStyle(testElement)
      const color = styles.color
      
      document.body.removeChild(testElement)
      
      // If we get a specific color (not initial/inherited), CSS is loaded
      if (color !== 'rgba(0, 0, 0, 0)' && color !== 'rgb(0, 0, 0)') {
        setIsLoaded(true)
      }
    }

    // Check immediately
    checkStyles()

    // Also check on load event
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', checkStyles)
      window.addEventListener('load', checkStyles)
      
      return () => {
        document.removeEventListener('DOMContentLoaded', checkStyles)
        window.removeEventListener('load', checkStyles)
      }
    }
  }, [])

  return isLoaded
}

// Loading skeleton component for above-the-fold content
export function CriticalSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header skeleton */}
      <div className="h-16 bg-slate-100 loading-skeleton"></div>
      
      {/* Content skeleton */}
      <div className="p-4 space-y-4">
        <div className="h-8 w-3/4 bg-slate-100 loading-skeleton rounded"></div>
        <div className="h-4 w-1/2 bg-slate-100 loading-skeleton rounded"></div>
        
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="h-20 bg-slate-100 loading-skeleton rounded"></div>
          <div className="h-20 bg-slate-100 loading-skeleton rounded"></div>
        </div>

        <div className="space-y-4 mt-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="card">
              <div className="h-32 bg-slate-100 loading-skeleton rounded mb-3"></div>
              <div className="h-4 w-3/4 bg-slate-100 loading-skeleton rounded mb-2"></div>
              <div className="h-3 w-1/2 bg-slate-100 loading-skeleton rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}