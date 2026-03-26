/* ZeroPaper™ Service Worker v4.1 */
const CACHE = 'zp-v4-cache-v2';
const ASSETS = [
  '/',
  '/zeropaper_app.html',
  '/zeropaper_admin.html',
  '/zeropaper_landing.html',
  '/manifest.json',
  '/icon.svg',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => {
        // Cachear uno por uno para que fallas individuales no rompan todo
        return Promise.allSettled(ASSETS.map(url => c.add(url)));
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  
  const url = new URL(e.request.url);
  
  // Firestore — siempre network first, sin cachear
  if (url.hostname.includes('googleapis.com') || url.hostname.includes('firestore.googleapis.com')) {
    e.respondWith(
      fetch(e.request).catch(() => new Response(JSON.stringify({error:'offline'}), {
        status: 503, headers: {'Content-Type':'application/json'}
      }))
    );
    return;
  }

  // Archivos propios — cache first, fallback network
  e.respondWith(
    caches.match(e.request).then(cached => {
      const networkFetch = fetch(e.request).then(res => {
        if (res.ok && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => null);

      return cached || networkFetch || new Response('Offline', { status: 503 });
    })
  );
});
