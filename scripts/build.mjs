import {readFile,writeFile,mkdir,cp,rm} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {join} from 'node:path';
import {durations,streams,monthText,streamText,chat,quote,widget} from '../public/offer.mjs';

const {pages,faq} = JSON.parse(await readFile('content.json','utf8'));
const origin = new URL(process.env.PUBLIC_SITE_URL || 'https://iptv-deutschland-8k.pages.dev');
if (origin.protocol !== 'https:' || origin.pathname !== '/' || origin.search || origin.hash || origin.username || origin.password) throw new Error('PUBLIC_SITE_URL must be an HTTPS origin.');
const indexable = process.env.PUBLIC_INDEXABLE === 'true';
if (indexable && (/(?:^|\.)(?:pages\.dev|workers\.dev|chatgpt\.site|example|invalid|test|localhost)$/.test(origin.hostname) || process.env.PUBLIC_OPERATOR_CONFIRMED !== 'true')) throw new Error('Owned domain and completed operator information are required before indexing.');
const out='dist';
if(process.env.CF_PAGES==='1' || process.env.CHECK_MEDIA==='true'){
  for(const suffix of ['dashboard','dashboard-800','sports','cinema']){
    const path=`public/images/iptv-deutschland-8k-${suffix}.webp`;
    const data=await readFile(path);
    if(data.toString('ascii',0,4)!=='RIFF' || data.toString('ascii',8,12)!=='WEBP')throw new Error(`Invalid WebP artwork: ${path}`);
  }
}
const brand='IPTV Deutschland 8K';
const artwork={
  dashboard:{slug:'dashboard',width:1600,height:900,title:'IPTV Deutschland 8K – Programmvorschau',alt:'Wohnzimmer mit Blick auf den Berliner Fernsehturm, einem Fußballspiel auf dem Fernseher und Filmplakaten an der Wand.'},
  sports:{slug:'sports',width:1200,height:675,title:'Live-Sport – Fußball, Handball, Basketball und Motorsport',alt:'Ein Fußballer schießt auf das Tor. Auf den benachbarten Bildschirmen sind Handball, Basketball und Motorsport zu sehen.'},
  cinema:{slug:'cinema',width:1200,height:675,title:'Filme und Serien – Genreübersicht',alt:'Sechs illustrierte Genreplakate zeigen unter anderem einen Berliner Krimi, ein Drama und eine Astronautin.'}
};
function pictureFor(page){
  const image=page.path==='/live-sport/'?artwork.sports:page.path==='/filme-und-serien/'?artwork.cinema:artwork.dashboard;
  const path=`/images/iptv-deutschland-8k-${image.slug}.webp`;
  return {...image,path};
}
function picture(page,hero=false){
  const image=pictureFor(page);
  const smaller='/images/iptv-deutschland-8k-dashboard-800.webp';
  const srcset=hero && existsSync('public'+smaller) && image.path.endsWith('.webp')?` srcset="${smaller} 800w, ${image.path} 1600w" sizes="(max-width:760px) 92vw, 48vw"`:'';
  return `<img src="${image.path}"${srcset} alt="${esc(image.alt)}" title="${esc(image.title)}" width="${image.width}" height="${image.height}" ${hero?'fetchpriority="high"':'loading="lazy"'}>`;
}
const map = new Map(pages.map(page=>[page.path,page]));
const markets = [
  ['Australien','https://iptv-australia-8k.pages.dev/'],['Belgien','https://iptv-belgique-8k.com/'],['Finnland','https://iptv-suomi-iptv.fi/'],['Irland','https://iptv-ireland-subscription.com/'],['Kanada','https://iptv-canada-8k.com/en/'],['Nordische Länder','https://www.nordiciptv-elite.com/iptv-nordic-2026/'],['Schweiz','https://iptv-schweiz-8k.pages.dev/'],['USA','https://iptv-usa-8k.com/']
];
const esc=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');

const label=(path,text)=>`<a href="${path}">${esc(text || map.get(path).nav)}</a>`;
const trialButton=(text='Gratis testen')=>`<a class="button primary" href="${esc(widget)}" data-trial>${esc(text)} <span aria-hidden="true">↗</span></a>`;
const logo=`<a class="brand" href="/" aria-label="${brand} – Startseite"><span class="brand-mark" aria-hidden="true">▰</span><span>IPTV <b>Deutschland</b></span><strong>8K</strong></a>`;
function nav(page){
  const links=['/iptv-abonnement/','/sender/','/geraete/','/fragen/'];
  const navLink=p=>`<a href="${p}"${p===page.path?' aria-current="page"':''}>${map.get(p).nav}</a>`;
  return `<a class="skip" href="#inhalt">Direkt zum Inhalt</a><header><div class="wrap head">${logo}<nav class="desktop" aria-label="Hauptnavigation">${links.map(navLink).join('')}</nav>${trialButton()}<details class="mobile"><summary>Menü</summary><nav aria-label="Mobile Navigation">${['/',...links,'/iptv-test/','/kontakt/'].map(navLink).join('')}</nav></details></div></header>`;
}
function footer(){
  return `<footer><div class="wrap"><div class="footer-top"><div>${logo}<p>IPTV-Angebote in Euro vergleichen, Geräte prüfen und die eigene Fernsehroutine testen.</p></div><nav aria-label="Auswahl und Hilfe"><h2>Auswahl & Hilfe</h2>${['/iptv-abonnement/','/iptv-test/','/mehrere-geraete/','/ratgeber/einrichtung/','/ratgeber/iptv-kosten/','/fragen/','/kontakt/'].map(p=>label(p)).join('')}</nav><nav aria-label="Informationen"><h2>Informationen</h2>${['/angebotsablauf/','/datenschutz/','/anbieterinformationen/'].map(p=>label(p)).join('')}</nav></div><div class="regional"><div><h2>Andere Länderangebote</h2><p>Wähle den Markt, in dem du fernsiehst.</p></div><nav aria-label="Regionale Websites">${markets.map(([name,url])=>`<a href="${url}">${name} ↗</a>`).join('')}</nav></div><div class="footnote"><span>© 2026 ${brand}</span><span>Deutschland · Deutsch</span><a href="#inhalt">Nach oben ↑</a></div></div></footer>`;
}
function plans(){
  return `<section class="plan-section" id="tarife" data-plans><div class="wrap"><p class="kicker">Tarifauswahl</p><h2>Laufzeit und parallele Streams wählen</h2><p class="intro">Wähle, wie viele Personen gleichzeitig schauen. Fordere danach den Gesamtbetrag für deine Laufzeit in Euro an.</p><fieldset><legend>Gleichzeitige Streams</legend><div class="picker">${streams.map(n=>`<label><input type="radio" name="streams" value="${n}"${n===1?' checked':''}><span>${n}</span></label>`).join('')}</div></fieldset><p aria-live="polite" data-selection>1 Stream gleichzeitig ausgewählt</p><div class="plan-table"><div class="plan-labels"><span>Laufzeit</span><span>Parallel</span><span>Gesamtpreis</span></div>${durations.map(n=>`<div class="plan-row" data-term="${n}"><strong>${monthText(n)}</strong><span data-count>1 Stream</span><a data-quote href="${esc(quote(n,1))}" aria-label="${monthText(n)} für 1 Stream per WhatsApp anfragen">Preis anfragen ↗</a></div>`).join('')}</div><details class="matrix"><summary>Alle Kombinationen direkt aufrufen</summary><div class="matrix-body">${durations.map(n=>`<div><strong>${monthText(n)}</strong><span>${streams.map(s=>`<a href="${esc(quote(n,s))}" aria-label="${monthText(n)}, ${streamText(s)}">${streamText(s)}</a>`).join('')}</span></div>`).join('')}</div></details><div class="custom"><p><strong>Mehr als sechs parallele Streams?</strong> Frage die passende Konfiguration für deinen Haushalt an.</p><a href="${esc(chat('Hallo, IPTV Deutschland 8K: Angebot für 7+ Streams?'))}">Individuell anfragen ↗</a></div><p class="fine">Die Anfrage öffnet WhatsApp mit einer kurzen Nachricht. Preis, Leistungsumfang und Bedingungen klärst du vor der Entscheidung.</p></div></section>`;
}
function faqList(limit){
  return `<div class="faq-list">${faq.slice(0,limit).map(([q,a])=>`<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>`;
}
const trail=page=>page.path==='/'?'':`<nav class="crumb" aria-label="Brotkrumennavigation">${label('/','Start')} <span> / </span><span aria-current="page">${esc(page.nav)}</span></nav>`;
function mediaShelf(){
  const choices=[['/live-sport/','Spieltag im Blick','Übertragung, Kommentar und schnelle Bewegung am eigenen Fernseher prüfen.'],['/filme-und-serien/','Filmabend nach Wunsch','Staffel, Sprachfassung und Untertitel an einem konkreten Titel testen.']];
  return `<section class="wrap media-shelf"><p class="kicker">Programm entdecken</p><h2>Vom Spieltag zum Filmabend</h2><div>${choices.map(([path,title,lead])=>`<a href="${path}"><figure>${picture(map.get(path))}<figcaption><span>${esc(map.get(path).nav)}</span><strong>${title}</strong><p>${lead}</p></figcaption></figure></a>`).join('')}</div></section>`;
}
function home(page){
  return `<div class="hero"><div class="wrap hero-grid"><div class="hero-copy"><p class="signal"><i></i> DE / FERNSEHEN ÜBER INTERNET</p><h1><em>IPTV Deutschland.</em><br>Erst testen, dann ein Abo wählen.</h1><p>${esc(page.lead)}</p><div class="actions">${trialButton('Testformular öffnen')}<a class="button quiet" href="/iptv-abonnement/">Abos vergleichen →</a></div><small>Gemeinsamer Aktivierungsdienst · Keine Kreditkarte erforderlich</small></div><figure class="screen"><figcaption><span><i></i> PROGRAMMFENSTER</span><b>DE · 01</b></figcaption>${picture(page,true)}<div class="screen-bottom"><span>LIVE-TV</span><span>SPORT</span><span>REGIONAL</span></div></figure></div></div><div class="stats"><div class="wrap"><div><strong>1–24 Monate</strong><span>Laufzeit anfragen</span></div><div><strong>1–6 Streams</strong><span>Gleichzeitig fernsehen</span></div><div><strong>EUR</strong><span>Angebot in Euro</span></div><div><strong>Bis zu 7 Tests</strong><span>30 Tage · täglich neu anfragen</span></div></div></div>
  <section class="wrap focus"><p class="kicker">Für deinen Fernsehalltag</p><h2>Was möchtest du prüfen?</h2><div class="topics">${[['/sender/','01','Deinen Regionalsender finden','Prüfe Lokalzeit, Tonspur und EPG anhand einer bestimmten Sendung.'],['/live-sport/','02','Sport mit schnellen Kameraschwenks','Teste den konkreten Spieltag und beobachte Bild und Ton am Fernseher.'],['/geraete/','03','Den richtigen Player wählen','Notiere Modell und Betriebssystem, bevor du den Zugang einträgst.']].map(([path,n,h,body])=>`<a href="${path}" class="topic"><span>${n} /</span><h3>${h}</h3><p>${body}</p><b>Zum Geräte- und Programmcheck →</b></a>`).join('')}</div></section>
  ${plans()}${mediaShelf()}<section class="wrap guides"><div><p class="kicker">Fernsehen zu Hause</p><h2>Entscheiden mit einer konkreten Frage</h2><p>Wie viele Streams laufen tatsächlich gleichzeitig? Welche Zusatzkosten gehören zum Monatswert? Diese Ratgeber helfen bei der Auswahl.</p></div><nav aria-label="Ratgeber">${['/mehrere-geraete/','/ratgeber/iptv-kosten/','/ratgeber/iptv-ruckelt/','/ratgeber/anbieter-vergleichen/','/ratgeber/einrichtung/','/filme-und-serien/'].map((p,i)=>`<a href="${p}"><span>0${i+1}</span>${esc(map.get(p).h1)}<b>↗</b></a>`).join('')}</nav></section><section class="wrap faq-home"><p class="kicker">Fragen vor dem Start</p><h2>Test und Abonnement erklärt</h2>${faqList(4)}${label('/fragen/','Alle Fragen ansehen →')}</section>`;
}
function calculator(){
  return `<form class="calculator" data-calculator><p class="kicker">Deine eigenen Angebotswerte</p><h2>Monatswert berechnen</h2><div class="inputs"><label>Gesamtpreis in Euro<input name="total" type="number" min="0.01" step="0.01" required></label><label>Zusatzkosten in Euro<input name="extra" type="number" value="0" min="0" step="0.01" required></label><label>Monate<input name="months" type="number" value="12" min="1" step="1" required></label><label>Gleichzeitige Streams<input name="screens" type="number" value="1" min="1" step="1" required></label></div><button type="submit" data-calculate disabled>Monatswert berechnen</button><output aria-live="polite"></output><noscript>Rechenweg: (Gesamtpreis + Zusatzkosten) ÷ Monate. Für den Wert je Stream zusätzlich durch die Streamzahl teilen.</noscript></form>`;
}
function body(page){
  if(page.kind==='home')return home(page);
  const sections=(page.sections||[]).map(([heading,paragraph],i)=>`<section id="abschnitt-${i+1}"><p class="kicker">0${i+1} / ${esc(page.eyebrow)}</p><h2>${esc(heading)}</h2><p>${esc(paragraph)}</p></section>`).join('');
  const sources=page.resources?`<section><h2>Offizielle Informationen</h2><ul>${page.resources.map(([label,url])=>`<li><a href="${esc(url)}">${esc(label)} ↗</a></li>`).join('')}</ul></section>`:'';
  const related=page.related?`<nav class="related" aria-label="Weiterlesen"><h2>Weiterlesen</h2>${page.related.map(p=>label(p,map.get(p).h1+' →')).join('')}</nav>`:'';
  const trial=page.kind==='trial'?`<div class="trial-box"><span class="kicker">Testzugang</span><h2>Auf deinem Gerät ausprobieren</h2><p>Das Formular wird vom gemeinsamen Aktivierungsdienst bereitgestellt. Für einen neuen Zugang gelten die gemeinsamen Limits des Aktivierungsdienstes.</p>${trialButton('Kostenlosen Testzugang öffnen')}</div>`:'';
  const contact=page.kind==='contact'?`<a class="button primary" href="${esc(chat('Hallo, ich brauche Hilfe mit IPTV Deutschland 8K.'))}">WhatsApp öffnen ↗</a>`:'';
  return `<div class="page-intro"><div class="wrap">${trail(page)}<p class="kicker">${esc(page.eyebrow)}</p><h1>${esc(page.h1)}</h1><p>${esc(page.lead)}</p></div></div>${page.kind==='plans'?plans():''}<div class="wrap article-layout"><article>${['/live-sport/','/filme-und-serien/'].includes(page.path)?`<figure class="poster-feature">${picture(page)}<figcaption>Illustrative Programmansicht. Verfügbarkeit im Test prüfen.</figcaption></figure>`:''}${trial}${contact}${page.kind==='faq'?faqList(faq.length):''}${page.kind==='cost'?calculator():''}${sections}${sources}${related}</article><aside><strong>IPTV Deutschland 8K</strong><p>Du möchtest erst mit deinem eigenen Fernseher testen?</p>${label('/iptv-test/','So funktioniert der Test →')}${label('/iptv-abonnement/','Laufzeiten vergleichen →')}${label('/kontakt/','Support kontaktieren →')}</aside></div>`;
}
function graph(page){
  const abs=new URL(page.path,origin).href, home=origin.origin+'/';
  const nodes=[
    {'@type':'Organization','@id':home+'#anbieter',name:brand,url:home,logo:home+'favicon.svg',contactPoint:{'@type':'ContactPoint',contactType:'customer support',telephone:'+212631479723',areaServed:'DE'}},
    {'@type':'WebSite','@id':home+'#website',url:home,name:brand,inLanguage:'de-DE',publisher:{'@id':home+'#anbieter'}},
    {'@type':'WebPage','@id':abs+'#seite',url:abs,name:page.title,description:page.description,inLanguage:'de-DE',isPartOf:{'@id':home+'#website'}}
  ];
  if(page.path!=='/')nodes.push({'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Start',item:home},{'@type':'ListItem',position:2,name:page.nav,item:abs}]});
  if(page.kind==='faq')nodes.push({'@type':'FAQPage',mainEntity:faq.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))});
  return JSON.stringify({'@context':'https://schema.org','@graph':nodes}).replaceAll('<','\\u003c');
}
function render(page){
  const url=new URL(page.path,origin).href;
  const robots=indexable && !page.error?'index,follow,max-image-preview:large,max-snippet:-1':'noindex,follow';
  return `<!doctype html><html lang="de-DE"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(page.title)}</title><meta name="description" content="${esc(page.description)}"><meta name="robots" content="${robots}">${page.error?'':`<link rel="canonical" href="${url}">`}<meta property="og:locale" content="de_DE"><meta property="og:type" content="website"><meta property="og:site_name" content="${brand}"><meta property="og:title" content="${esc(page.title)}"><meta property="og:description" content="${esc(page.description)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${origin.origin}${pictureFor(page).path}"><meta property="og:image:type" content="image/webp"><meta property="og:image:width" content="${pictureFor(page).width}"><meta property="og:image:height" content="${pictureFor(page).height}"><meta property="og:image:alt" content="${esc(pictureFor(page).alt)}"><meta name="twitter:image:alt" content="${esc(pictureFor(page).alt)}"><meta name="twitter:card" content="summary_large_image"><meta name="theme-color" content="#171b20"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="stylesheet" href="/style.css"><script type="module" src="/app.mjs"></script>${page.error?'':`<script type="application/ld+json">${graph(page)}</script>`}</head><body>${nav(page)}<main id="inhalt">${page.error?`<div class="wrap missing"><p class="kicker">404</p><h1>${page.h1}</h1><p>Diese Adresse hat keine Seite. Über die Startseite kommst du zu den aktuellen Angeboten.</p>${label('/','Zur Startseite →')}</div>`:body(page)}</main>${footer()}<dialog id="trial-dialog" aria-label="IPTV-Testformular"><div class="dialog-bar"><strong>IPTV-Test · Deutschland</strong><button data-close autofocus>Schließen ×</button></div><p data-loading role="status">Testformular wird geladen …</p><iframe title="Testzugang IPTV Deutschland 8K" referrerpolicy="no-referrer" allow="clipboard-write"></iframe><div class="dialog-foot"><a data-direct href="${esc(widget)}" target="_blank" rel="noopener">Formular direkt öffnen ↗</a>${label('/datenschutz/')}</div></dialog></body></html>`;
}
await rm(out,{recursive:true,force:true});
await cp('public',out,{recursive:true});
for(const page of pages) {
  const dir=join(out,page.path);
  await mkdir(dir,{recursive:true});
  await writeFile(join(dir,'index.html'),render(page));
}
await writeFile(join(out,'404.html'),render({path:'/404/',nav:'Seite fehlt',title:'Seite nicht gefunden | IPTV Deutschland 8K',description:'Diese Seite wurde nicht gefunden.',h1:'Seite nicht gefunden',error:true}));
function sitemapEntry(page){
  const visibleMedia=page.kind==='home'?[page,map.get('/live-sport/'),map.get('/filme-und-serien/')]:['/live-sport/','/filme-und-serien/'].includes(page.path)?[page]:[];
  const paths=[...new Set(visibleMedia.map(p=>pictureFor(p).path))];
  const images=paths.map(path=>`<image:image><image:loc>${esc(origin.origin+path)}</image:loc></image:image>`).join('');
  return `<url><loc>${esc(origin.origin+page.path)}</loc><lastmod>2026-11-02</lastmod>${images}</url>`;
}
const sitemap=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${indexable?pages.map(sitemapEntry).join('') : ''}</urlset>\n`;
const sitemapIndex=indexable?`<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>${origin.origin}/sitemap.xml</loc></sitemap></sitemapindex>\n`:sitemap;
const headers=`/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Frame-Options: SAMEORIGIN\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n${indexable?'':'  X-Robots-Tag: noindex, follow\n'}https://iptv-deutschland-8k.pages.dev/*\n  X-Robots-Tag: noindex, follow\nhttps://:preview.iptv-deutschland-8k.pages.dev/*\n  X-Robots-Tag: noindex, follow\n/sitemap.xml\n  Content-Type: application/xml; charset=utf-8\n/sitemap-index.xml\n  Content-Type: application/xml; charset=utf-8\n`;
await writeFile(join(out,'robots.txt'),`User-agent: *\nAllow: /\n${indexable?`Sitemap: ${origin.origin}/sitemap-index.xml\n`:''}`);
await writeFile(join(out,'sitemap.xml'),sitemap);
await writeFile(join(out,'sitemap-index.xml'),sitemapIndex);
const readingList=['/iptv-abonnement/','/iptv-test/','/mehrere-geraete/','/geraete/','/sender/','/live-sport/','/filme-und-serien/','/ratgeber/iptv-kosten/','/fragen/','/kontakt/'];
const guide=`# IPTV Deutschland 8K\n\nDeutschsprachige Informationen zum Testen von IPTV, zur Gerätewahl und zu Angebotsanfragen in Euro. Preise und Leistungen werden im individuellen Angebot bestätigt.\n\n## Seiten\n\n${readingList.map(path=>`- [${map.get(path).nav}](${origin.origin}${path})`).join('\n')}\n\n## Test und Angebote\n\nEin neuer Test kann frühestens nach 24 Stunden angefragt werden, höchstens siebenmal in 30 Tagen. Die Grenzen gelten gemeinsam für die regionalen Websites. Die jeweilige Ablaufzeit wird im Zugang angezeigt. Die Abo-Auswahl umfasst sieben Laufzeiten und eine bis sechs gleichzeitige Wiedergaben.\n`;
await writeFile(join(out,'llms.txt'),guide);
await writeFile(join(out,'_headers'),headers);
console.log(`${pages.length} deutsche Seiten erzeugt. Indexierung: ${indexable?'aktiv':'Vorschau (noindex)'}.`);
