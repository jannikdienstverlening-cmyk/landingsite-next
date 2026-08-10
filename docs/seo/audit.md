# SEO-audit Landingsite.nl

Datum: 9 augustus 2026
Scope: repository, publieke routes, actieve funnel en het aangeleverde onderzoeksrapport.

## Samenvatting

De commerciële configuratie en gecombineerde Stripe-checkout waren al coherent: Starter €299, Pro €499, Premium €899 en €79 per maand voor Hosting & Websitebeheer. De belangrijkste gaten waren een te smalle indexeerbare sitestructuur, ontbrekende intentpagina's, een sitemap met dynamische `lastmod`, een geforceerde standaardkeuze op `/start` en onvoldoende geautomatiseerde SEO-governance.

## Belangrijkste bevindingen

| Prioriteit | Bevinding | Uitvoering |
|---|---|---|
| P0 | Google kan nog een oud hostingbedrag in het snippet tonen | Actieve broncode wordt projectbreed gecontroleerd; actuele metadata en sitemap zijn gekoppeld aan het contentregister. Recrawl blijft handmatig. |
| P0 | `/start` koos zonder gebruikersactie Pro | Geen pakket is nu standaard geselecteerd. Alleen een specifieke pakketlink vult de keuze. |
| P0 | Sitemap gebruikte bij iedere build een nieuwe datum | `lastModified` komt nu uit de inhoudelijke `updatedAt`-datum. |
| P0 | Private en transactionele routes waren niet volledig in robots opgenomen | Robots sluit start, intake, beheer, preview, admin, API en interne leadroutes uit. Routes houden daarnaast hun noindex/authenticatie. |
| P1 | Alleen homepage en werk bedienden commerciële zoekintenties | Drie onderscheiden intentpagina's en `/over-landingsite` toegevoegd. |
| P1 | Geen centrale keyword- en publicatiestatus | `content/seo-pages.ts` en `docs/seo/keyword-map.json` toegevoegd. |
| P1 | Geen geautomatiseerde canonical-, sitemap- en orphancontrole | Nieuwe `seo:*`-scripts en regressietests toegevoegd. |

## Route-inventarisatie

| Route | Index | Canonical | H1 / intent | Rendering |
|---|---:|---|---|---|
| `/` | ja | self | website laten maken | statisch/server |
| `/landingspagina-laten-maken` | ja | self | landingspagina laten maken | statisch/server |
| `/website-laten-maken-zzp` | ja | self | website laten maken zzp | statisch/server |
| `/kosten-website-laten-maken` | ja | self | kosten website laten maken | statisch/server |
| `/werk` | ja | self | live voorbeelden | statisch/server |
| `/over-landingsite` | ja | self | verantwoordelijkheid en werkwijze | statisch/server |
| `/algemene-voorwaarden` | ja | self | branded voorwaarden | statisch/server |
| `/privacybeleid` | ja | self | branded privacy | statisch/server |
| `/start` | nee | self | pakketkeuze en checkout | server + client checkoutactie |
| `/partner`, `/partnervoorwaarden`, `/verwerkersovereenkomst` | nee | self waar aanwezig | ondersteunend/juridisch | server |
| `/intake/*`, `/beheer/*`, `/preview/*`, `/genereren/*` | nee | n.v.t. | transactioneel/privé | dynamisch en token- of statusbeveiligd |
| `/admin/*`, `/dashboard`, `/leads`, `/outreach`, `/crm`, `/insights`, `/settings` | nee | n.v.t. | intern | dynamisch, sessiebeveiligd |
| `/partners` | redirect | `/partner` | oude route | permanente redirect |

## Cannibalisatiebesluit

`/website-laten-maken-binnen-48-uur` wordt niet gepubliceerd. De inhoud zou de homepage en pakketpagina's grotendeels herhalen. De voorwaarden rond de eerste versie staan op de homepage, drie intentpagina's, `/start` en in de voorwaarden.

## Structured data

- Homepage: `Organization`, `WebSite`, `Service` en `OfferCatalog` met actuele configprijzen.
- Intentpagina's: `BreadcrumbList` en `Service` met actuele pakketten.
- Werk: `BreadcrumbList` en `ItemList` met echte externe project-URL's.
- Over: `Organization` met geverifieerde bedrijfsgegevens.
- Geen `AggregateRating`, `Review` of fictieve resultaten.

## Security en privacy

De bestaande repository heeft CSP, HSTS, nosniff, framebeveiliging, rate limiting, servervalidatie, Stripe-signatuurcontrole, idempotente eventopslag en afgeschermde intake-assets. SEO-wijzigingen maken geen privégegevens publiek. Analytics blijft consent-aware en accepteert alleen beperkte niet-persoonlijke velden.

## Handmatig nodig

- Search Console Domain Property en toegangsrechten controleren.
- Sitemap na release indienen en vier belangrijke URL's éénmalig inspecteren.
- Oude snippet vastleggen en recrawl afwachten.
- Echte projectcredits of backlinks alleen na klanttoestemming plaatsen.
- Juridische teksten en Stripe Price IDs zijn niet gewijzigd; eventuele toekomstige wijzigingen vereisen goedkeuring.
