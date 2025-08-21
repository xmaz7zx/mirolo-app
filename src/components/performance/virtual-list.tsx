'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { cn } from '@/lib/utils'

interface VirtualListProps<T> {
  items: T[]
  itemHeight: number
  containerHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
  className?: string
  gap?: number
  overscan?: number
  onScroll?: (scrollTop: number) => void
}

export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className,
  gap = 0,
  overscan = 5,
  onScroll
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)
  const scrollElementRef = useRef<HTMLDivElement>(null)

  const totalHeight = items.length * (itemHeight + gap) - gap

  const visibleItems = useMemo(() => {
    const containerStart = scrollTop
    const containerEnd = scrollTop + containerHeight

    // Calculate which items are visible
    let startIndex = Math.floor(containerStart / (itemHeight + gap))
    let endIndex = Math.min(
      items.length - 1,
      Math.floor(containerEnd / (itemHeight + gap))
    )

    // Add overscan
    startIndex = Math.max(0, startIndex - overscan)
    endIndex = Math.min(items.length - 1, endIndex + overscan)

    const visible = []
    for (let i = startIndex; i <= endIndex; i++) {
      const item = items[i]
      if (item) {
        visible.push({
          index: i,
          item,
          offsetY: i * (itemHeight + gap)
        })
      }
    }

    return visible
  }, [items, scrollTop, containerHeight, itemHeight, gap, overscan])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop
    setScrollTop(scrollTop)
    onScroll?.(scrollTop)
  }

  return (
    <div
      ref={scrollElementRef}
      className={cn('overflow-auto', className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ index, item, offsetY }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: offsetY,
              left: 0,
              right: 0,
              height: itemHeight
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  )
}

// Hook for automatic height calculation
export function useAutoHeight(ref: React.RefObject<HTMLElement>) {
  const [height, setHeight] = useState(0)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        setHeight(entry.contentRect.height)
      }
    })

    resizeObserver.observe(element)
    return () => resizeObserver.disconnect()
  }, [ref])

  return height
}

// Hook for measuring item heights dynamically
export function useDynamicItemHeight<T>(
  items: T[],
  renderItem: (item: T) => React.ReactNode
) {
  const [itemHeights, setItemHeights] = useState<number[]>([])
  const measureRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!measureRef.current) return

    // Measure heights by temporarily rendering items
    const heights: number[] = []
    const container = measureRef.current

    items.forEach((item, index) => {
      const tempDiv = document.createElement('div')
      tempDiv.style.position = 'absolute'
      tempDiv.style.visibility = 'hidden'
      tempDiv.style.width = `${container.clientWidth}px`
      
      container.appendChild(tempDiv)
      
      // This is a simplified version - in a real implementation,
      // you'd need to properly render the React component
      const itemElement = renderItem(item)
      // tempDiv.innerHTML = ... render the item content
      
      heights[index] = tempDiv.offsetHeight
      container.removeChild(tempDiv)
    })

    setItemHeights(heights)
  }, [items, renderItem])

  return { itemHeights, measureRef }
}