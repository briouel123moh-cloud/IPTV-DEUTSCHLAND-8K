import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {quote,widget,durations,streams,monthlyCost} from '../public/offer.mjs';

const {pages,faq}=JSON.parse(readFileSync('content.json','utf8'));
const html=new Map(pages.map(page=>[page.path,readFileSync(join('dist',page.path,'index.html'),'utf8')]));
const decode=value=>value.replaceAll('&amp;','&');
const origin=new URL(process.env.PUBLIC_SITE_URL||'https://iptv-deutschland-8k.pages.dev').origin;
test('all regional pages have unique titles, descriptions, one heading and self canonicals',()=>{
  const titles=new Set(), descriptions=new Set();
  for(const page of pages){
    const body=html.get(page.path);
    assert.ok(body.startsWith('<!doctype html><html lang="de-DE">'));
    assert.equal((body.match(/<h1>/g)||[]).length,1,page.path);
    assert.ok(body.includes(`rel="canonical" href="${origin}${page.path}"`));
    const title=body.match(/<title>([^<]+)<\/title>/)[1];
    const desc=body.match(/name="description" content="([^"]+)"/)[1];
    assert.ok(!titles.has(title)&&!descriptions.has(desc),page.path);
    titles.add(title); descriptions.add(desc);
    assert.ok(body.includes('property="og:image:alt"'));
    const graph=JSON.parse(body.match(/type="application\/ld\+json">([^<]+)<\/script>/)[1]);
    assert.equal(graph['@graph'].find(n=>n['@type']==='WebPage').url,origin+page.path);
  }
});
test('all internal routes, static assets and same-page links resolve',()=>{
  const checked=new Set();
  for(const [path,body] of html){
    for(const match of body.matchAll(/\b(?:href|src)="([^"]+)"/g)){
      const url=new URL(decode(match[1]),origin+path);
      if(url.origin!==origin)continue;
      const key=url.pathname+url.hash;
      if(checked.has(key))continue;
      const f=join('dist',url.pathname.endsWith('/')?url.pathname+'index.html':url.pathname);
      assert.ok(existsSync(f),`${path}: ${key}`);
      if(url.hash)assert.ok(readFileSync(f,'utf8').includes(`id="${url.hash.slice(1)}"`),key);
      checked.add(key);
    }
    assert.ok(body.includes('/iptv-test/')&&body.includes('/iptv-abonnement/'));
  }
});
test('each of the 42 duration and screen selections yields the right short EUR inquiry',()=>{
  const matrix=html.get('/iptv-abonnement/');
  const values=new Set();
  for(const m of durations)for(const s of streams){
    const url=new URL(quote(m,s)),message=url.searchParams.get('text');
    assert.equal(url.hostname,'wa.me');assert.equal(url.pathname,'/212631479723');
    assert.ok(message.includes(`${m} Monat`)&&message.includes(`${s} Stream`)&&message.includes('EUR?')&&message.length<85);
    assert.ok(matrix.includes(quote(m,s)));
    values.add(message);
  }
  assert.equal(values.size,42);
  assert.throws(()=>quote(99,1));assert.throws(()=>quote(12,0));
});
test('local calculator accepts german household quotes and refuses invalid divisors',()=>{
  assert.deepEqual(monthlyCost(108,12,12,2),{monthly:10,perStream:5});
  assert.equal(monthlyCost(108,12,0,2),null);
  assert.equal(monthlyCost(0,0,12,2),null);
  assert.equal(monthlyCost(108,-1,12,2),null);
  assert.equal(monthlyCost(108,12,12,2.5),null);
});
test('German storefront connects to native activation and the shared quotas',()=>{
  const trial=html.get('/iptv-test/');
  assert.equal(new URL(widget).searchParams.get('site'),'germany');
  assert.equal(new URL(widget).searchParams.get('lang'),'de');
  for(const body of html.values()){
    assert.ok(body.includes('site=germany&amp;lang=de'));
    assert.ok(body.includes('IPTV-Testformular'));
    assert.ok(!/<iframe[^>]*\bsrc=/i.test(body),'frame should load on intentional request only');
  }
  assert.ok(trial.includes('24 Stunden')&&trial.includes('sieben Tests innerhalb von 30 Tagen'));
});
test('network links match all eight permitted destinations without Emerald or UK promotion',()=>{
  const expected=['iptv-australia-8k.pages.dev','iptv-belgique-8k.com','iptv-suomi-iptv.fi','iptv-ireland-subscription.com','iptv-canada-8k.com','www.nordiciptv-elite.com','iptv-schweiz-8k.pages.dev','iptv-usa-8k.com'].sort();
  for(const [path,body] of html){
    const region=body.match(/<nav aria-label="Regionale Websites">(.+?)<\/nav>/s)[1];
    assert.deepEqual([...region.matchAll(/href="([^"]+)"/g)].map(m=>new URL(m[1]).hostname).sort(),expected,path);
    assert.ok(!/href="https?:\/\/(?:www\.)?(?:emeraldiptv\.irish|iptv-uk\.cloud)\//i.test(body),path);
  }
});
test('FAQ schema reproduces the visible questions and answers',()=>{
  const body=html.get('/fragen/');
  const graph=JSON.parse(body.match(/type="application\/ld\+json">([^<]+)<\/script>/)[1])['@graph'];
  const list=graph.find(v=>v['@type']==='FAQPage').mainEntity;
  assert.equal(list.length,faq.length);
  for(const entry of list)assert.ok(body.includes(`<summary>${entry.name}</summary><p>${entry.acceptedAnswer.text}</p>`));
});
test('preview inventory and headers stay noindex until an approved domain launch',()=>{
  const preview=process.env.PUBLIC_INDEXABLE!=='true';
  const sitemap=readFileSync('dist/sitemap.xml','utf8');
  assert.equal((sitemap.match(/<url>/g)||[]).length,preview?0:pages.length);
  const headers=readFileSync('dist/_headers','utf8');
  assert.equal(headers.split('\nhttps://')[0].includes('X-Robots-Tag: noindex'),preview);
  assert.ok(headers.includes('https://:preview.iptv-deutschland-8k.pages.dev/*'));
  for(const body of html.values())assert.equal(body.includes('content="noindex,follow"'),preview);
  assert.ok(readFileSync('dist/404.html','utf8').includes('Seite nicht gefunden'));
});
