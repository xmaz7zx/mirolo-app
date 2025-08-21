'use client'

import { useEffect, useRef, useState } from 'react'

interface SwipeGestureOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  threshold?: number
  preventScroll?: boolean
}

interface TouchCoordinate {
  x: number
  y: number
  time: number
}

export function useSwipeGestures(options: SwipeGestureOptions) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
    preventScroll = false
  } = options

  const touchStart = useRef<TouchCoordinate | null>(null)
  const touchEnd = useRef<TouchCoordinate | null>(null)
  const [isSwiping, setIsSwiping] = useState(false)

  const minSwipeDistance = threshold
  const maxSwipeTime = 300 // Maximum time for swipe gesture

  const onTouchStart = (e: React.TouchEvent) => {
    touchEnd.current = null
    const touch = e.touches[0]
    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    }
    setIsSwiping(true)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart.current) return

    const touch = e.touches[0]
    const deltaX = Math.abs(touch.clientX - touchStart.current.x)
    const deltaY = Math.abs(touch.clientY - touchStart.current.y)

    // Prevent default scroll behavior if primarily horizontal swipe
    if (preventScroll && deltaX > deltaY) {
      e.preventDefault()
    }
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return

    const touch = e.changedTouches[0]
    touchEnd.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    }

    handleGesture()
    setIsSwiping(false)
  }

  const handleGesture = () => {
    if (!touchStart.current || !touchEnd.current) return

    const deltaX = touchEnd.current.x - touchStart.current.x
    const deltaY = touchEnd.current.y - touchStart.current.y
    const deltaTime = touchEnd.current.time - touchStart.current.time

    // Check if gesture was too slow
    if (deltaTime > maxSwipeTime) return

    const absX = Math.abs(deltaX)
    const absY = Math.abs(deltaY)

    // Check if movement was significant enough
    if (absX < minSwipeDistance && absY < minSwipeDistance) return

    // Determine swipe direction
    if (absX > absY) {
      // Horizontal swipe
      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight()
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft()
      }
    } else {
      // Vertical swipe
      if (deltaY > 0 && onSwipeDown) {
        onSwipeDown()
      } else if (deltaY < 0 && onSwipeUp) {
        onSwipeUp()
      }
    }
  }

  const listeners = {
    onTouchStart,
    onTouchMove,
    onTouchEnd
  }

  return {
    listeners,
    isSwiping
  }
}

// Hook for specific recipe navigation gestures
export function useRecipeSwipeNavigation(options: {
  onPrevious?: () => void
  onNext?: () => void
  onBack?: () => void
  onFavorite?: () => void
}) {
  const { onPrevious, onNext, onBack, onFavorite } = options

  return useSwipeGestures({
    onSwipeLeft: onNext,
    onSwipeRight: onPrevious,
    onSwipeUp: onBack,
    onSwipeDown: onFavorite,
    threshold: 60,
    preventScroll: true
  })
}

// Hook for tab navigation
export function useTabSwipeNavigation(options: {
  tabs: string[]
  currentTab: string
  onTabChange: (tab: string) => void
}) {
  const { tabs, currentTab, onTabChange } = options

  const goToPreviousTab = () => {
    const currentIndex = tabs.indexOf(currentTab)
    if (currentIndex > 0) {
      onTabChange(tabs[currentIndex - 1])
    }
  }

  const goToNextTab = () => {
    const currentIndex = tabs.indexOf(currentTab)
    if (currentIndex < tabs.length - 1) {
      onTabChange(tabs[currentIndex + 1])
    }
  }

  return useSwipeGestures({
    onSwipeLeft: goToNextTab,
    onSwipeRight: goToPreviousTab,
    threshold: 80,
    preventScroll: true
  })
}

// Hook for pull-to-refresh
export function usePullToRefresh(onRefresh: () => void | Promise<void>, threshold = 80) {
  const [isPulling, setIsPulling] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  const startY = useRef<number>(0)
  const currentY = useRef<number>(0)

  const onTouchStart = (e: React.TouchEvent) => {
    // Only trigger if scrolled to top
    if (window.scrollY > 0) return
    
    startY.current = e.touches[0].clientY
    setIsPulling(true)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isPulling || window.scrollY > 0) return

    currentY.current = e.touches[0].clientY
    const distance = currentY.current - startY.current

    if (distance > 0) {
      e.preventDefault()
      setPullDistance(Math.min(distance, threshold * 2))
    }
  }

  const onTouchEnd = async () => {
    if (!isPulling) return

    setIsPulling(false)

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
        setPullDistance(0)
      }
    } else {
      setPullDistance(0)
    }
  }

  const listeners = {
    onTouchStart,
    onTouchMove,
    onTouchEnd
  }

  return {
    listeners,
    isPulling,
    pullDistance,
    isRefreshing,
    pullProgress: Math.min(pullDistance / threshold, 1)
  }
}