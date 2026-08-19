# Landingsite.nl upgrade-report

Datum: 19 augustus 2026
Branch: `codex/full-conversion-seo-upgrade`

## 1. Samenvatting

De belangrijkste conversieremming was een combinatie van veel losse boodschappen, een generieke agency-uitstraling, onduidelijke btw-communicatie en onvoldoende samenhang tussen pakketkeuze, Stripe en intake. De homepage is opnieuw opgebouwd rond één concept: **eerst de werkende versie bekijken, daarna publiceren**. Echte websites dragen de presentatie; fictieve dashboards, claims en reviews worden niet gebruikt.

De primaire route is nu: homepage → pakket kiezen → controle van pakket en eerste betaling → Stripe Checkout → bevestigde betaling → beveiligde intake. Een gesprek is niet verplicht.

## 2. Prijzen

De gebruiker heeft bevestigd dat de bedragen **inclusief btw** zijn. Dit wijkt af van de voorbeeldtabel in de opdracht en is daarom expliciet vastgelegd in `config/commercial.ts` met `pricesIncludeVat: true` en Stripe `tax_behavior: inclusive`.

### Reguliere configuratie

| Pakket | Bouw incl. btw | Bouw excl. btw | Beheer incl. btw | Eerste betaling incl. btw | Eerste betaling excl. btw | Stripe bouwprijs | Stripe beheerprijs |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- |
| Starter | €299 | €247,11 | €79 p/m | €378 | €312,40 | `price_1U2sNOBQafqsEpgz0wEYyIIX` | `price_1U2sNTBQafqsEpgzZ16TLvrR` |
| Pro | €499 | €412,40 | €79 p/m | €578 | €477,69 | `price_1U2sNQBQafqsEpgzTocBhbor` | `price_1U2sNTBQafqsEpgzZ16TLvrR` |
| Premium | €899 | €742,98 | €79 p/m | €978 | €808,26 | `price_1U2sNRBQafqsEpgzVi52FALh` | `price_1U2sNTBQafqsEpgzZ16TLvrR` |

### Zomeractie tot en met 1 oktober 2026

| Pakket | Actieve bouwprijs incl. btw | Eerste betaling incl. btw | Daarna |
| --- | ---: | ---: | ---: |
| Starter | €0 | €79 | €79 p/m incl. btw |
| Pro | €199 | €278 | €79 p/m incl. btw |
| Premium | €599 | €678 | €79 p/m incl. btw |

Voor een actieprijs maakt de server een tijdelijke Stripe-prijsregel met dezelfde inclusieve btw-instelling. De browser bepaalt nooit het bedrag. De reguliere Price ID’s blijven de gecontroleerde catalogusbron buiten de actieperiode.

## 3. Technische wijzigingen

- `config/commercial.ts` is de enige actieve commerciële bron voor pakketten, btw, actie en beheer.
- Stripe combineert de eenmalige bouwregel en de terugkerende beheerregel in één `subscription` Checkout Session.
- Server-side pakketvalidatie, Stripe-idempotency, webhook-signaturecontrole en webhook-eventclaims blijven actief.
- De order wordt één keer aan Stripe customer en subscription gekoppeld; een intake opent alleen na een betaalde order.
- De eerste werkende versie wordt consequent gekoppeld aan betaling én een complete intake.
- Consent, campagneattributie en aankoopmeting zijn centraal gemaakt.
- Nieuwe serveromgevingsvariabelen: `GOOGLE_ANALYTICS_API_SECRET` en `META_GRAPH_API_VERSION`.
- Er was geen databasemigratie nodig; meetcontext wordt beperkt en consentgebonden in Stripe-metadata doorgegeven.
- De bestaande Supabase-order-, audit-, referral- en webhooktabellen blijven de operationele bron.

## 4. Ontwerp en homepage

De homepage gebruikt een eigen redactioneel concept met donkere inktvlakken, warm papier, kobaltblauw en een klein oranje signaalaccent. Er zijn geen paarse gradients, glassmorphism, glowdashboards, stockfoto’s of generieke AI-illustraties toegevoegd.

Nieuwe volgorde:

1. Compacte header en één primaire startactie.
2. Hero met echte Ontwikkelbegeleiding.nl-screenshot.
3. Direct bewijs met WIA Management en AIbouwers.
4. Probleemherkenning in redactionele vorm.
5. Wat wordt opgeleverd en hoe het proces werkt.
6. Scanbare pakketten met volledige eerste betaling.
7. Hosting & Websitebeheer.
8. Kort persoonlijk blok.
9. FAQ, compacte vraagroute en slotactie.

De projecten zijn op 19 augustus 2026 opnieuw vastgelegd in desktop- en mobiele WebP-bestanden. De oude interactieve carousel en dubbele portfoliovertoning zijn verwijderd.

## 5. SEO

- 11 goedgekeurde indexeerbare routes hebben unieke metadata, één hoofdzoekintentie en absolute canonicals.
- Sitemap bevat exact deze 11 canonieke routes.
- Start-, checkout-, intake-, beheer-, preview-, account- en interne routes zijn niet indexeerbaar.
- Interne-linkcontrole, contentlint, structured-data-broncontrole en sitemapcontrole slagen.
- Er is geen `AggregateRating` of `Review`-schema zonder echte publiceerbare reviews.
- Oude fictieve claims en de oude actieve hostingprijs komen niet in de publieke funnel voor.
- Cookiebeleid is als aparte juridische route toegevoegd.

## 6. Tracking en consent

- Consent Mode v2 start met `analytics_storage`, `ad_storage`, `ad_user_data` en `ad_personalization` op `denied`.
- Accepteren, weigeren, categorieën kiezen en later wijzigen zijn beschikbaar.
- Google- en Meta-scripts laden alleen na de passende toestemming én wanneer de integratie is geconfigureerd.
- Campagnevelden worden begrensd tot goedgekeurde UTM- en klik-ID-velden.
- Checkout-attributie wordt server-side opnieuw aan de consentcookie getoetst.
- `purchase` gebruikt de Stripe Checkout Session ID als Google-transactie-ID en Meta `event_id`.
- Meta browser- en serverevents gebruiken hetzelfde event-ID voor deduplicatie.
- Server-side Meta gebruikt uitsluitend na marketingtoestemming een genormaliseerd, SHA-256-gehasht e-mailadres; vrije formulierinhoud en intakegegevens worden niet verzonden.
- Een browserrefresh verstuurt geen tweede aankoop in dezelfde browsersessie; provider-deduplicatie beschermt ook over sessies heen.

Officiële technische basis: [Google Consent Mode](https://developers.google.com/tag-platform/security/guides/consent), [GA4 Measurement Protocol](https://developers.google.com/analytics/devguides/collection/protocol/ga4) en [Meta Conversions API](https://www.facebook.com/business/help/AboutConversionsAPI).

### Geïmplementeerde events

`view_item_list`, `select_item`, `view_item`, `begin_checkout`, `purchase`, `complete_intake`, `view_case`, `click_live_case`, `form_start`, `form_submit`, `form_error`, plus bestaande specifieke funnel-events voor hero, pakketten, checkout, intake, FAQ, cases, blog, social en klantportaal.

## 7. Testresultaten

| Controle | Resultaat |
| --- | --- |
| Lint | Geslaagd, 0 fouten; 2 waarschuwingen in losstaande niet-gecommit social-render scripts |
| Typecheck | Geslaagd |
| Unit- en integratietests | 71/71 geslaagd |
| SEO-contentcontrole | Geslaagd, 11 indexeerbare routes |
| Interne links | Geslaagd |
| Structured-data broncontrole | Geslaagd |
| Sitemapcontrole | Geslaagd, 11 canonieke URL’s |
| Productiebuild | Geslaagd, 63 routes gegenereerd |
| Productie-contentlint | Geslaagd |
| Playwright | 35/35 geslaagd |
| Responsive overflow | Geslaagd op 320, 360, 375, 390, 412, 768, 1024, 1440 en 1920 px |
| Axe toegankelijkheid | Geen ernstige overtredingen op gecontroleerde routes |
| Stripe-catalogus | Geslaagd in testmodus, vier Price ID’s gecontroleerd |
| Productie-dependencyaudit | 0 kwetsbaarheden |
| Route- en assetsmoke | Geslaagd |
| Lighthouse homepage | Performance 89, Accessibility 100, Best Practices 100, SEO 100 |
| Lighthouse kernmetingen | FCP 0,9 s; LCP 3,0 s; CLS 0; TBT 250 ms |

## 8. Screenshots voor en na

Voor:

- `reports/conversion-upgrade/before-home-375.png`
- `reports/conversion-upgrade/before-home-768.png`
- `reports/conversion-upgrade/before-home-1440.png`

Na:

- `reports/seo/screenshots/homepage-mobile.png`
- `reports/seo/screenshots/homepage-tablet.png`
- `reports/seo/screenshots/homepage-desktop.png`
- `reports/seo/screenshots/werk-mobile.png`
- `reports/seo/screenshots/werk-tablet.png`
- `reports/seo/screenshots/werk-desktop.png`
- `reports/seo/screenshots/start-mobile.png`
- `reports/seo/screenshots/start-tablet.png`
- `reports/seo/screenshots/start-desktop.png`

## 9. Openstaande externe punten

De code is veilig voorbereid, maar de volgende productievariabelen ontbreken lokaal en moeten via de advertentieaccounts worden aangemaakt en in Vercel worden gezet:

- `NEXT_PUBLIC_GOOGLE_MEASUREMENT_ID`
- `NEXT_PUBLIC_GOOGLE_ADS_ID`
- `GOOGLE_ANALYTICS_API_SECRET`
- `NEXT_PUBLIC_META_PIXEL_ID`
- `META_CONVERSIONS_API_TOKEN`
- `META_GRAPH_API_VERSION`

Zonder deze waarden blijven externe analytics en advertentiemeting bewust uit. De checkout, orderverwerking en intake blijven wel functioneren. Een echte aankoop is niet uitgevoerd; Stripe is volgens opdracht uitsluitend in testmodus gevalideerd.

De algemene voorwaarden beschrijven een redelijke overdracht van domeininstellingen en klantspecifieke content na opzegging. Exacte exportvorm, broncodeomvang en eventuele migratieprijs zijn geen vast pakketonderdeel en moeten commercieel/juridisch worden bevestigd voordat daar concretere publieke toezeggingen over worden gedaan. Definitieve juridische teksten verdienen controle door een Nederlandse jurist.

## 10. Advertentiegereedheid

**TECHNISCH GEREED, IDS ONTBREKEN**

De funnel, consent, deduplicatie, server-side purchase, SEO-landingsroutes en tests zijn gereed. De status wordt pas `GEREED VOOR KLEINE TESTCAMPAGNE` nadat de zes externe Google/Meta-waarden zijn ingevuld en één veilige testconversie in beide platforms is gecontroleerd.

## 11. Previewdeployment

De gevalideerde branch is als Vercel-preview gepubliceerd op:

`https://landingsite-next-3qbki74tw-jannikdienstverlening-1219s-projects.vercel.app`

Status: `Ready`. Homepage, `/start`, `/werk`, `robots.txt` en `sitemap.xml` reageren met HTTP 200. De preview krijgt vanuit Vercel bewust `X-Robots-Tag: noindex` en is niet naar het productiedomein gepromoveerd. De bestaande Next.js-, Stripe-, Supabase- en webhookarchitectuur is op Vercel behouden; er is geen tweede Sites-hostingproject naast de betaalomgeving aangemaakt.

## 12. Belangrijkste gewijzigde bestanden

- Homepage en design: `app/page.tsx`, `app/homepage.css`, `components/studio-site.tsx`, `components/site-interactions.tsx`
- Prijzen en startflow: `config/commercial.ts`, `app/start/page.tsx`, `app/api/stripe/checkout/route.ts`
- Betaling en intake: `app/api/stripe/webhook/route.ts`, `app/api/order/route.ts`, `app/intake/[session_id]/page.tsx`
- Consent en meting: `components/consent-manager.tsx`, `config/consent.ts`, `config/tracking.ts`, `config/server-tracking.ts`, `lib/analytics.ts`, `lib/conversion-payloads.ts`, `lib/server-conversions.ts`
- SEO en beleid: `content/seo-pages.ts`, `components/seo-page.tsx`, `app/privacybeleid/page.tsx`, `app/cookiebeleid/page.tsx`, `next.config.ts`
- Portfolio: `data/portfolio.ts`, `scripts/capture-portfolio-screenshots.mjs`, `public/images/portfolio/*-20260819.webp`
- Verificatie: `tests/*.test.ts`, `e2e/*.spec.ts`, `scripts/seo/*`, `scripts/smoke-routes.mjs`, `reports/seo/*`
