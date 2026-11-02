# IPTV Deutschland 8K

German storefront built with Node and static HTML. Run `npm run check` to generate `dist/` and verify the 17 pages. The build uses no third-party JS dependencies. Pages project `iptv-deutschland-8k` uses `npm run build` and the output directory `dist`.

## Preview and launch

Preview origin is https://iptv-deutschland-8k.pages.dev/. Indexing stays disabled on Pages hosts. The preview emits an empty sitemap inventory. Before enabling production indexing, connect an owned domain, complete the operator identity and contact information on the Anbieterinformationen and Datenschutz pages, confirm applicable customer terms, register the domain with the shared trial service and set `PUBLIC_SITE_URL`, `PUBLIC_INDEXABLE=true` and `PUBLIC_OPERATOR_CONFIRMED=true` in the production Wrangler config. Keep preview indexing disabled. Verify HTTPS, canonical redirects, robots.txt and `/sitemap-index.xml` on the final domain.

## Trial and enquiries

The shared widget uses `site=germany&lang=de`. The form uses the native German translation in the shared activation service. Register the exact HTTPS storefront origin, country code 49, WhatsApp 212631479723 and German privacy destination `/datenschutz/` on the shared service. The form opens on deliberate interaction and exposes a direct link. The shared service owns validation, quotas and credential issuance.

The seven durations and six parallel-stream choices produce 42 explicit EUR quote requests. WhatsApp opens with a localized short message. No price is collected or assumed. The cost calculator accepts only the visitor's own quote amounts and runs locally.

## Search intent

| German query family | Page | Visitor decision |
| --- | --- | --- |
| IPTV Deutschland Abo, IPTV Preis Deutschland | /iptv-abonnement/ | Select duration and concurrent streams, then request the EUR total. |
| IPTV kostenlos testen, IPTV 7 Tage Test | /iptv-test/ | Understand daily requests and open the shared form. |
| IPTV mehrere Geräte, IPTV parallele Streams | /mehrere-geraete/ | Count simultaneous viewing sessions. |
| IPTV Smart TV, IPTV Fire TV einrichten | /geraete/ and /ratgeber/einrichtung/ | Identify the device, supported player and connection method. |
| IPTV Sender Deutschland, regionales IPTV | /sender/ | Check a specific regional edition and its program guide. |
| IPTV Live-Sport, IPTV Filme und Serien | /live-sport/ and /filme-und-serien/ | Verify a specific feed, competition, title or audio track. |
| IPTV Kosten vergleichen | /ratgeber/iptv-kosten/ | Compare supplied total costs by month and concurrent stream. |
| IPTV Anbieter vergleichen, IPTV ruckelt | /ratgeber/anbieter-vergleichen/ and /ratgeber/iptv-ruckelt/ | Compare offer terms or troubleshoot a specific playback problem. |

These headings describe intent. No paid search volume, difficulty, ranking or rights claim is implied. The regional navigation includes the other eight non-Emerald market sites. The shared control endpoint is used for activation.

The dashboard, sport and cinema assets use filenames beginning `public/images/iptv-deutschland-8k-`. The dashboard also supports an 800-pixel derivative. The final publishing check should confirm all four branded images exist.
