const CACHE_NAME = 'mirolo-v1';
const OFFLINE_URL = '/offline';

// Files to cache for offline functionality
const STATIC_CACHE = [
  '/',
  '/dashboard',
  '/entdecken',
  '/profil',
  '/offline',
  '/manifest.json',
  // Add more static assets here
];

// Recipe data cache
const RECIPE_CACHE = 'recipes-v1';

// Install event - cache static files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching static files');
        return cache.addAll(STATIC_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== RECIPE_CACHE) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests (recipes, user data)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // Handle other requests (static files, images, etc.)
  event.respondWith(handleResourceRequest(request));
});

// Handle API requests with cache-first strategy for recipes
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  // Only cache GET requests for recipes
  if (request.method === 'GET' && url.pathname.includes('/api/recipes')) {
    try {
      const cache = await caches.open(RECIPE_CACHE);
      const cachedResponse = await cache.match(request);
      
      // Try network first
      try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
          cache.put(request, networkResponse.clone());
          return networkResponse;
        }
        throw new Error('Network response not ok');
      } catch (error) {
        // Return cached version if network fails
        if (cachedResponse) {
          console.log('Serving cached recipe data');
          return cachedResponse;
        }
        throw error;
      }
    } catch (error) {
      console.log('Recipe API request failed:', error);
      return new Response(JSON.stringify({ error: 'Offline - Daten nicht verfügbar' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // For other API requests, just try network
  return fetch(request).catch(() => {
    return new Response(JSON.stringify({ error: 'Offline - Service nicht verfügbar' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  });
}

// Handle navigation requests (pages)
async function handleNavigationRequest(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.log('Navigation request failed, serving offline page');
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Serve offline page as fallback
    return cache.match(OFFLINE_URL);
  }
}

// Handle static resource requests
async function handleResourceRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    // Cache successful responses
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Resource request failed:', error);
    // Could return a fallback image or icon here
    return new Response('Offline', { status: 503 });
  }
}

// Background sync for recipe uploads when back online
self.addEventListener('sync', event => {
  if (event.tag === 'recipe-upload') {
    event.waitUntil(syncRecipeUploads());
  }
});

async function syncRecipeUploads() {
  // Implementation for syncing recipe uploads when back online
  console.log('Syncing recipe uploads...');
  // This would retrieve queued uploads from IndexedDB and submit them
}

// Push notifications (for future use)
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'Neue Rezepte verfügbar!',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Entdecken',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Schließen',
        icon: '/icons/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Mirolo', options)
  );
});