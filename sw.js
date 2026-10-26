const SHELL = "bet-shell-v4", RUNTIME = "bet-runtime-v1";
const FILES = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(SHELL).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== SHELL && k !== RUNTIME).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  if (url.hostname === "images.ygoprodeck.com" || url.hostname.includes("fonts.")) {
    e.respondWith(caches.open(RUNTIME).then(async c => {
      const hit = await c.match(e.request); if (hit) return hit;
      const res = await fetch(e.request); if (res.ok || res.type === "opaque") c.put(e.request, res.clone()); return res;
    }));
    return;
  }
  if (url.origin === location.origin) {
    e.respondWith(fetch(e.request).then(res => { const cp = res.clone(); caches.open(SHELL).then(c => c.put(e.request, cp)); return res; })
      .catch(() => caches.match(e.request)));
  }
});
