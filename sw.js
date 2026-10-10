const C="grades-v14",F=["./","./index.html","./manifest.webmanifest","./icon-180.png","./icon-192.png","./icon-512.png"];
const clean=async r=>r.redirected?new Response(await r.blob(),{status:200,headers:r.headers}):r;
self.addEventListener("install",e=>{e.waitUntil((async()=>{const c=await caches.open(C);
 for(const u of F){try{const r=await fetch(u,{cache:"reload"});if(!r.ok)throw new Error(u);await c.put(u,await clean(r))}catch(err){if(u==="./"||u==="./index.html")throw err}}
 await self.skipWaiting()})())});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{const q=e.request;if(q.method!=="GET")return;
 e.respondWith((async()=>{const m=await caches.match(q,{ignoreSearch:true});if(m)return m;
  try{return await fetch(q)}catch(err){if(q.mode==="navigate")return(await caches.match("./index.html"))||(await caches.match("./"));throw err}})())});
