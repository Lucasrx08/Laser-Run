const CACHE='laser-run-v35-restauration-20260819';

const CORE=[
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

const OPTIONAL_EXTERNAL=[
  'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js',
  'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js',
  'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js'
];

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    await cache.addAll(CORE);

    // Les dépendances externes sont mises en cache si Internet est disponible.
    // Un échec sur l'une d'elles ne bloque jamais l'installation de la PWA.
    await Promise.allSettled(
      OPTIONAL_EXTERNAL.map(async url=>{
        const response=await fetch(url,{cache:'no-store'});
        if(response && response.ok)await cache.put(url,response.clone());
      })
    );
  })());
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;

  event.respondWith((async()=>{
    const cached=await caches.match(event.request);
    if(cached)return cached;

    try{
      const response=await fetch(event.request);
      if(response && response.ok){
        const cache=await caches.open(CACHE);
        cache.put(event.request,response.clone()).catch(()=>{});
      }
      return response;
    }catch(err){
      if(event.request.mode==='navigate'){
        const fallback=await caches.match('./index.html');
        if(fallback)return fallback;
      }
      throw err;
    }
  })());
});
