// Proxy streaming: video melakukan permintaan Range ke /_s/<akun>/<fileId>; SW meneruskannya ke Drive dengan token.
const T={},CH=4*1024*1024;
self.oninstall=()=>self.skipWaiting();
self.onactivate=e=>e.waitUntil(clients.claim());
self.onmessage=e=>{if(e.data&&e.data.tok)Object.assign(T,e.data.tok)};
async function tk(a,force){if(T[a]&&!force)return T[a];delete T[a];
 for(const c of await clients.matchAll({type:'window'})){const ch=new MessageChannel(),p=new Promise(r=>ch.port1.onmessage=m=>r(m.data));
  c.postMessage({need:a,force:!!force},[ch.port2]);const t=await Promise.race([p,new Promise(r=>setTimeout(r,4000))]);if(t)return T[a]=t}}
async function go(req,a,id,size,mime){const oc=await caches.open('off').then(c=>c.match('/_o/'+id));
 if(oc){const b=await oc.blob(),q=/bytes=(\d+)-(\d*)/.exec(req.headers.get('range')||''),s=q?+q[1]:0,e=Math.min(b.size-1,q&&q[2]?+q[2]:s+8*1048576-1);
  return new Response(b.slice(s,e+1),{status:206,headers:{'Content-Type':mime,'Content-Range':`bytes ${s}-${e}/${b.size}`,'Content-Length':e-s+1,'Accept-Ranges':'bytes'}})}
 const m=/bytes=(\d+)-(\d*)/.exec(req.headers.get('range')||''),s=m?+m[1]:0,e=Math.min(size-1,m&&m[2]?+m[2]:s+CH-1,s+2*CH-1);
 let r;for(let i=0;i<2;i++){r=await fetch('https://www.googleapis.com/drive/v3/files/'+id+'?alt=media',{headers:{Authorization:'Bearer '+await tk(a,i),Range:`bytes=${s}-${e}`}});if(r.status!=401)break}
 if(r.status!=206&&r.status!=200)return new Response('',{status:r.status});
 return new Response(r.body,{status:206,headers:{'Content-Type':mime,'Content-Range':`bytes ${s}-${e}/${size}`,'Content-Length':e-s+1,'Accept-Ranges':'bytes'}})}
self.onfetch=e=>{const u=new URL(e.request.url),m=u.pathname.match(/^\/_s\/([^/]+)\/([^/]+)$/);if(m)e.respondWith(go(e.request,m[1],m[2],+u.searchParams.get('s'),u.searchParams.get('m')||'video/mp4'))};
