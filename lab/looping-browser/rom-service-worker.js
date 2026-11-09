'use strict';
// Scoped to /lab/looping-browser/ — this worker does not affect the homepage.
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('message',event=>{
  if(event.data?.type==='NGS_CLAIM_CLIENTS')event.waitUntil(self.clients.claim());
});
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  const expected=new URL('./local/looping.zip',self.registration.scope);
  if(url.origin!==expected.origin||url.pathname!==expected.pathname)return;
  event.respondWith((async()=>{
    // Ask the active page for its selected ROM. Never store a game on disk,
    // in CacheStorage or IndexedDB. A fresh selection is needed after refresh.
    let client=event.clientId ? await self.clients.get(event.clientId) : null;
    if(!client){
      const pages=await self.clients.matchAll({type:'window',includeUncontrolled:true});
      client=pages.find(page=>page.url.startsWith(self.registration.scope));
    }
    if(!client)return new Response('No game page available',{status:503});
    const channel=new MessageChannel();
    try{
      const reply=new Promise((resolve,reject)=>{
        const timer=setTimeout(()=>reject(Error('Local ROM request timed out')),15000);
        channel.port1.onmessage=message=>{
          clearTimeout(timer);
          if(message.data?.error)reject(Error(message.data.error));
          else resolve(message.data?.buffer);
        };
        channel.port1.onmessageerror=()=>{clearTimeout(timer);reject(Error('Malformed ROM response'));};
      });
      client.postMessage({type:'NGS_GET_LOOPING_ROM'},[channel.port2]);
      const buffer=await reply;
      if(!(buffer instanceof ArrayBuffer)||buffer.byteLength<1000||buffer.byteLength>8*1024*1024){
        throw Error('Invalid local ROM response');
      }
      return new Response(buffer,{status:200,headers:{
        'Content-Type':'application/zip',
        'Content-Disposition':'inline; filename="looping.zip"',
        'Cache-Control':'no-store',
        'Access-Control-Allow-Origin':'*',
        'X-Content-Type-Options':'nosniff'
      }});
    }catch(error){
      return new Response('Local ROM unavailable: '+String(error.message||error),{status:503,headers:{'Cache-Control':'no-store'}});
    }finally{channel.port1.close();}
  })());
});
