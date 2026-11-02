import { ownerPreviewHost, serveOwnerPreview } from '../edge/owner-preview.mjs';

const openFiles=new Set(['/robots.txt','/sitemap.xml','/sitemap-index.xml','/llms.txt','/llms-full.txt','/favicon.ico','/favicon.svg','/app.mjs','/offer.mjs','/style.css']);
const openDirectories=['/images/','/fonts/','/_astro/','/.well-known/acme-challenge/'];
function isPublicAsset(pathname){
  return openFiles.has(pathname) || openDirectories.some(prefix=>pathname.startsWith(prefix));
}
async function onRequest(context){
  const {request}=context;
  if (new URL(request.url).hostname === ownerPreviewHost) {
    return serveOwnerPreview(request, () => context.next());
  }
  const path = new URL(request.url).pathname;
  const country=String(request.cf?.country || request.headers.get('CF-IPCountry') || '').trim().toUpperCase();
  if(country==='MA' && !isPublicAsset(path)){
    return new Response('Dieses Angebot ist an deinem Standort nicht verfügbar.',{
      status:403,
      headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow'}
    });
  }
  return context.next();
}

export {onRequest};
