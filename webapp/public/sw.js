/*
 * Service worker Bank Sampah Digital — ditulis native (bukan Workbox/Serwist,
 * karena proyek memakai Turbopack). Strategi sengaja konservatif untuk aplikasi
 * keuangan: aset statis di-cache, tapi data dinamis (saldo, riwayat, RSC, API,
 * POST) TIDAK PERNAH di-cache agar tak ada angka basi/menyesatkan.
 */
const VERSI = "bs-cache-v1";
const CACHE_STATIS = `${VERSI}-statis`;
const HALAMAN_OFFLINE = "/offline";

// App-shell minimal yang aman di-precache (semuanya publik, non-sensitif).
const PRECACHE = [
  HALAMAN_OFFLINE,
  "/icon-192.png",
  "/icon-512.png",
  "/icon-maskable.png",
  "/manifest.webmanifest",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_STATIS);
      // addAll bisa gagal total kalau satu item 404; tambahkan satu per satu
      // agar SW tetap ter-install walau ada aset yang belum siap.
      await Promise.all(
        PRECACHE.map((url) =>
          cache.add(url).catch(() => {
            /* abaikan item yang gagal */
          }),
        ),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const kunci = await caches.keys();
      await Promise.all(
        kunci.filter((k) => !k.startsWith(VERSI)).map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

// Aset statis yang aman di-cache-first (tidak mengandung data pengguna).
function asetStatis(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname === "/manifest.webmanifest" ||
    /\.(?:png|svg|ico|webp|jpg|jpeg|gif|woff2?|ttf|css)$/.test(url.pathname)
  );
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return; // POST/aksi server: biarkan ke jaringan
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // lintas-origin: apa adanya

  // Navigasi halaman: network-first, fallback ke halaman offline.
  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          return await fetch(req);
        } catch {
          const cache = await caches.open(CACHE_STATIS);
          return (
            (await cache.match(HALAMAN_OFFLINE)) ||
            new Response("Offline", { status: 503, statusText: "Offline" })
          );
        }
      })(),
    );
    return;
  }

  // Aset statis: cache-first + perbarui di latar belakang (stale-while-revalidate).
  if (asetStatis(url)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_STATIS);
        const tersimpan = await cache.match(req);
        const jaringan = fetch(req)
          .then((resp) => {
            if (resp && resp.ok && resp.type === "basic") cache.put(req, resp.clone());
            return resp;
          })
          .catch(() => tersimpan);
        return tersimpan || jaringan;
      })(),
    );
    return;
  }

  // Sisanya (RSC, API, data dinamis): network-only, jangan di-cache.
});
