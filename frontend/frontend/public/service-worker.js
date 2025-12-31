// Service Worker untuk Sistem Informasi Akuntansi Darussalam PWA
// Version: 4.0 - Offline caching untuk data referensi non-sensitif
const CACHE_NAME = 'sia-darussalam-v4.1';
const DATA_CACHE_NAME = 'sia-darussalam-data-v1';
const OFFLINE_URL = '/offline.html';

// Daftar file statis yang akan di-cache saat install
const STATIC_ASSETS = [
  '/offline.html',
  '/manifest.json',
  '/logo.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/favicon.ico'
];

// API Endpoints yang AMAN untuk di-cache (data referensi tanpa nilai finansial)
const SAFE_API_ENDPOINTS = [
  '/api/chart-of-accounts',     // Daftar kode akun (TANPA saldo)
  '/api/account-categories',    // Kategori akun
  '/api/transaction-types',     // Jenis transaksi
  '/api/periods',               // Periode akuntansi
  '/api/profile/me',            // Profil user dasar
];

// API Endpoints yang TIDAK BOLEH di-cache (data sensitif)
const NEVER_CACHE_API = [
  '/api/transactions',          // Transaksi keuangan
  '/api/journals',              // Jurnal umum
  '/api/ledger',                // Buku besar
  '/api/balance-sheet',         // Neraca
  '/api/income-statement',      // Laba rugi
  '/api/cash-flow',             // Arus kas
  '/api/trial-balance',         // Neraca saldo
  '/api/reports',               // Semua laporan
  '/api/accounts/balance',      // Saldo akun
  '/api/auth',                  // Autentikasi
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker v3...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async (cache) => {
        console.log('[SW] Caching static assets');

        // Cache offline.html first - this is critical
        try {
          const offlineResponse = await fetch(OFFLINE_URL);
          await cache.put(OFFLINE_URL, offlineResponse);
          console.log('[SW] Cached offline.html successfully');
        } catch (error) {
          console.error('[SW] Failed to cache offline.html:', error);
        }

        // Cache other assets
        for (const asset of STATIC_ASSETS) {
          if (asset !== OFFLINE_URL) {
            try {
              await cache.add(asset);
              console.log('[SW] Cached:', asset);
            } catch (error) {
              console.warn('[SW] Failed to cache:', asset);
            }
          }
        }
      })
      .then(() => {
        console.log('[SW] Installation complete, skipping waiting');
        return self.skipWaiting();
      })
  );
});

// Activate event - cleanup old caches and claim clients
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker v3...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName.startsWith('hr-darussalam-') && cacheName !== CACHE_NAME)
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[SW] Claiming clients');
        return self.clients.claim();
      })
  );
});

// Fetch event handler
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip non-http requests (chrome-extension, etc)
  if (!request.url.startsWith('http')) {
    return;
  }

  const url = new URL(request.url);

  // Skip development-only requests
  if (url.pathname.includes('_next/webpack-hmr') ||
    url.pathname.includes('__nextjs') ||
    url.pathname.includes('_next/static/development') ||
    url.pathname.includes('turbopack')) {
    return;
  }

  // Handle navigation requests (page loads)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Network failed
          // EXCEPTION: Don't redirect /login to offline.html - it handles offline state itself
          if (url.pathname === '/login') {
            console.log('[SW] /login page offline - returning cached version or letting page handle it');
            return caches.match(request).then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Return empty response to let the page's offline handling work
              return new Response('', {
                status: 503,
                statusText: 'Offline',
                headers: { 'Content-Type': 'text/html' }
              });
            });
          }

          // For other pages - serve offline.html
          console.log('[SW] Navigation failed, serving offline.html');
          return caches.match(OFFLINE_URL).then((cachedOffline) => {
            if (cachedOffline) {
              return cachedOffline;
            }
            // Fallback: return inline HTML if cache fails
            return new Response(getFallbackHTML(), {
              headers: { 'Content-Type': 'text/html; charset=utf-8' }
            });
          });
        })
    );
    return;
  }

  // Handle static assets
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then((response) => {
            // Cache successful responses for static assets and safe APIs
            if (response.ok && shouldCache(url)) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
                // If it's an API endpoint, update sync time
                if (url.pathname.includes('/api/')) {
                  saveLastSyncTime();
                }
              });
            }
            return response;
          })
          .catch(() => {
            // Return empty response for failed requests
            if (url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/)) {
              // Return transparent pixel for images
              return new Response(
                new Uint8Array([71, 73, 70, 56, 57, 97, 1, 0, 1, 0, 128, 0, 0, 0, 0, 0, 255, 255, 255, 33, 249, 4, 1, 0, 0, 0, 0, 44, 0, 0, 0, 0, 1, 0, 1, 0, 0, 2, 1, 68, 0, 59]),
                { headers: { 'Content-Type': 'image/gif' } }
              );
            }
            return new Response('', { status: 503, statusText: 'Offline' });
          });
      })
  );
});

// Helper: determine if we should cache this URL
function shouldCache(url) {
  // Check if it's a SAFE API endpoint
  if (url.pathname.includes('/api/')) {
    return isSafeApiEndpoint(url.pathname);
  }
  // Cache static assets
  if (url.pathname.startsWith('/_next/static/')) {
    return true;
  }
  // Cache images and static files
  if (url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico|css|js|woff|woff2|ttf)$/)) {
    return true;
  }
  return false;
}

// Helper: check if API endpoint is safe to cache
function isSafeApiEndpoint(pathname) {
  // First, check if it's in the NEVER cache list
  for (const blockedPath of NEVER_CACHE_API) {
    if (pathname.includes(blockedPath)) {
      console.log('[SW] Blocking cache for sensitive API:', pathname);
      return false;
    }
  }
  // Then, check if it's in the safe list
  for (const safePath of SAFE_API_ENDPOINTS) {
    if (pathname.includes(safePath)) {
      console.log('[SW] Safe to cache API:', pathname);
      return true;
    }
  }
  // Default: don't cache unknown API endpoints
  return false;
}

// Helper: save last sync time
function saveLastSyncTime() {
  const now = new Date().toISOString();
  // Store in IndexedDB or just broadcast to clients
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_TIME_UPDATE',
        timestamp: now
      });
    });
  });
}

// Fallback HTML if everything else fails
function getFallbackHTML() {
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#f97316">
  <title>Offline - HR Darussalam</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(to bottom, #fff7ed, #fff);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .header {
      background: linear-gradient(to right, #f97316, #ea580c);
      color: white;
      padding: 16px;
      text-align: center;
    }
    .header h1 { font-size: 16px; margin-bottom: 4px; }
    .header p { font-size: 13px; opacity: 0.9; }
    .content {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px 16px;
      text-align: center;
    }
    .logo {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #f97316, #ea580c);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 16px;
    }
    h2 { font-size: 24px; color: #1f2937; margin-bottom: 8px; }
    .badge {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #6b7280;
      font-size: 14px;
      margin-bottom: 32px;
    }
    .dot {
      width: 8px;
      height: 8px;
      background: #ef4444;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
    .card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      padding: 24px;
      max-width: 360px;
      width: 100%;
      margin-bottom: 24px;
      text-align: left;
    }
    .card h3 { font-size: 16px; color: #1f2937; margin-bottom: 12px; }
    .card p { font-size: 14px; color: #4b5563; line-height: 1.6; }
    .btn {
      background: linear-gradient(to right, #f97316, #ea580c);
      color: white;
      border: none;
      padding: 16px 32px;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(249,115,22,0.4);
    }
    .btn:hover { transform: translateY(-2px); }
    .footer { padding: 20px; text-align: center; color: #9ca3af; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>⚠️ Koneksi Terputus</h1>
    <p>Anda sedang offline. Beberapa fitur tidak tersedia.</p>
  </div>
  <div class="content">
    <div class="logo">HR</div>
    <h2>HR Darussalam</h2>
    <div class="badge"><span class="dot"></span> Offline Mode</div>
    <div class="card">
      <h3>Mode Offline</h3>
      <p>Saat offline, beberapa fitur mungkin terbatas. Periksa koneksi internet Anda dan coba lagi.</p>
    </div>
    <button class="btn" onclick="location.reload()">🔄 Refresh Halaman</button>
  </div>
  <div class="footer">© 2025 Yayasan Darussalam</div>
  <script>
    window.addEventListener('online', function() {
      location.reload();
    });
  </script>
</body>
</html>`;
}

// Listen for messages
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
