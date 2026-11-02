const V='rp-v3';
const CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)));
  self.skipWaiting();
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  const url=new URL(e.request.url);
  // No cachear google fonts, deja que vayan a red
  if(url.hostname.includes('fonts.googleapis')) return;
  e.respondWith(
    caches.match(e.request).then(cached=>{
      const fetchAndCache = fetch(e.request).then(res=>{
        if(res.ok && url.origin===location.origin){
          const clone=res.clone();
          caches.open(V).then(c=>c.put(e.request,clone));
        }
        return res;
      }).catch(()=>cached || caches.match('./index.html'));
      return cached || fetchAndCache;
    })
  );
});
