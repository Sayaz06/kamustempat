const CACHE_NAME = "kamus-cache-v2";
const FILES = [
  "/kamustempat/", // ← tukar folder app ikut versi baru
  "/kamustempat/index.html", // ← tukar path ikut folder baru
  "/kamustempat/style.css", // ← tukar path ikut folder baru
  "/kamustempat/app.js", // ← tukar path ikut folder baru
  "/kamustempat/manifest.json", // ← tukar path ikut folder baru
  "/kamustempat/icons/iconKamusTempat-192.png", // ← tukar path icon
  "/kamustempat/icons/iconKamusTempat-512.png" // ← tukar path icon
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : null))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});