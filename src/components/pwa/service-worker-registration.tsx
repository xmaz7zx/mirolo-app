'use client'

import { useEffect } from 'react'

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Register service worker
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration)
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const installingWorker = registration.installing
            if (installingWorker) {
              installingWorker.addEventListener('statechange', () => {
                if (installingWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    // New content is available and will be used when all
                    // tabs for this page are closed
                    console.log('New content is available; please refresh.')
                    
                    // Show update notification
                    showUpdateNotification()
                  } else {
                    // Content is cached for offline use
                    console.log('Content is cached for offline use.')
                  }
                }
              })
            }
          })
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError)
        })

      // Listen for controlling service worker change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // This is called when the service worker becomes active
        window.location.reload()
      })
    }
  }, [])

  const showUpdateNotification = () => {
    // Create update notification (you could use a toast library here)
    const updateBanner = document.createElement('div')
    updateBanner.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #6366f1;
        color: white;
        padding: 12px;
        text-align: center;
        z-index: 10000;
        font-family: system-ui;
      ">
        <span>Eine neue Version ist verfügbar!</span>
        <button 
          onclick="window.location.reload()" 
          style="
            margin-left: 12px;
            background: white;
            color: #6366f1;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
          "
        >
          Aktualisieren
        </button>
        <button 
          onclick="this.parentElement.parentElement.remove()" 
          style="
            margin-left: 8px;
            background: transparent;
            color: white;
            border: 1px solid white;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
          "
        >
          Später
        </button>
      </div>
    `
    document.body.appendChild(updateBanner)

    // Auto-remove after 10 seconds
    setTimeout(() => {
      updateBanner.remove()
    }, 10000)
  }

  return null // This component doesn't render anything
}