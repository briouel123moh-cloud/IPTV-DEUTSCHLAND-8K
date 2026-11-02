import test from 'node:test';
import assert from 'node:assert/strict';
import {onRequest} from '../functions/_middleware.js';

function request(path,{country,headers={}}={}){
  const req=new Request('https://iptv-deutschland-8k.pages.dev'+path,{headers});
  if(country)Object.defineProperty(req,'cf',{value:{country}});
  return onRequest({request:req,next:()=>new Response('origin',{status:200})});
}
test('MA public pages and API calls are denied before the origin', async()=>{
  for(const path of ['/','/iptv-test/','/api/trial','/api/test/favicon.svg']){
    const res=await request(path,{country:'MA',headers:{'CF-IPCountry':'DE','X-Forwarded-For':'203.0.113.2','Cookie':'admin=1'}});
    assert.equal(res.status,403,path);
    assert.match(res.headers.get('Cache-Control'),/no-store/);
  }
  assert.equal((await request('/',{headers:{'CF-IPCountry':'MA'}})).status,403);
});
test('the edge country takes precedence and normal viewers reach the origin',async()=>{
  assert.equal((await request('/',{country:'DE',headers:{'CF-IPCountry':'MA'}})).status,200);
  assert.equal((await request('/',{headers:{'X-Forwarded-For':'MA'}})).status,200);
});
test('discovery files, static assets and ACME paths are available in MA',async()=>{
  for(const path of ['/robots.txt','/sitemap.xml','/sitemap-index.xml','/llms.txt','/images/hero.webp','/fonts/font.woff2','/.well-known/acme-challenge/sample','/style.css','/app.mjs']){
    assert.equal((await request(path,{country:'MA'})).status,200,path);
  }
});
