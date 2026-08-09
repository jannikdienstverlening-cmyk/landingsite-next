# Landingsite.nl + Lead Engine

Next.js-app voor de verkoop, intake, generatie en oplevering van zakelijke landingspagina’s, aangevuld met de **Landingsite Lead Engine**. De Lead Engine vindt en prioriteert lokale zakelijke prospects, auditeert openbare websites, maakt uitlegbare scores en zet persoonlijke outreachconcepten in een menselijke approval-queue.

De bestaande app gebruikt Supabase/PostgreSQL. De Lead Engine sluit daarop aan in plaats van een tweede Prisma-datalaag te introduceren. Browsertoegang tot bedrijfsdata is via RLS gesloten; vertrouwde serverroutes gebruiken de service-role key.

## Lokaal starten

1. Kopieer `.env.example` naar `.env.local` en vul de benodigde sleutels in.
2. Voer `supabase-migration.sql` en daarna `supabase-lead-engine-migration.sql` uit in de Supabase SQL Editor.
3. Laat `LEAD_ENGINE_DEMO_MODE=true` staan voor gemarkeerde demodata of zet deze na databaseconfiguratie op `false`.
4. Start met `npm run dev`, log in via `/admin` en open `/dashboard`.

Controleer voor iedere release:

```powershell
npm run lint
npm run typecheck
npm run test
npm run build
```

## Lead Engine-routes

- `/dashboard` — kerncijfers en geprioriteerde hot leads.
- `/leads` — filters voor plaats, score, website, social platform en CRM-status.
- `/leads/{id}` — bedrijfsdata, scoreonderbouwing, audit, AI-salesanalyse, notities en activiteiten.
- `/outreach` — concepten bewerken, overslaan, later zetten of handmatig verzenden.
- `/crm` — pipeline van `NEW` tot `WON`, `LOST` en `DO_NOT_CONTACT`.
- `/insights` — learning loop en datakwaliteit voor “Wat werkt?”.
- `/settings` — configureerbare scoregewichten en kanaalbeleid.
- `/preview/{token}` — tijdelijke, noindex homepageconceptpreview.

Alle interne schermen gebruiken dezelfde getekende, HttpOnly adminsessie als `/admin`.

## Environment variables

Naast de bestaande Stripe, Supabase, Anthropic, Resend en securityvariabelen gebruikt de Lead Engine:

| Variabele | Verplicht | Doel |
|---|---:|---|
| `LEAD_ENGINE_DEMO_MODE` | ja | `true` toont demodata; zet in productie expliciet op `false`. |
| `LEAD_ENGINE_DAILY_BATCH_SIZE` | nee | Maximum nieuwe prospects per dagelijkse run, standaard 25. |
| `LEAD_DISCOVERY_PROVIDER` | nee | `OPENSTREETMAP` (standaard zonder KVK-key) of `KVK`. |
| `OVERPASS_API_URL` | OSM discovery | Configureerbare publieke of eigen Overpass-endpoint. |
| `OSM_DISCOVERY_PLACES` | nee | Optionele kommagescheiden subset voor een kleine test- of gefaseerde run. |
| `OSM_DISCOVERY_RADIUS_METERS` | nee | Zoekstraal per marktplaats, standaard 5.000 meter. |
| `OSM_DISCOVERY_LIMIT_PER_PLACE` | nee | Volumeguard per plaats, standaard 25. |
| `OSM_REQUEST_TIMEOUT_MS` | nee | Time-out per Overpass-request, standaard 35 seconden. |
| `WEBSITE_DISCOVERY_MAX_CANDIDATES` | nee | Maximum rechtstreeks te verifiëren `.nl`/`.com`-domeinen per bedrijf, standaard 8. |
| `KVK_API_KEY` | alleen KVK-provider | Server-side sleutel voor KVK Handelsregister en Mutatieservice. |
| `KVK_API_BASE_URL` | nee | Standaard `https://api.kvk.nl/api`; kan naar de officiële testomgeving wijzen. |
| `KVK_DISCOVERY_LIMIT_PER_PLACE` | nee | Kosten- en volumeguard per plaats, standaard 20. |
| `KVK_MUTATION_ENABLED` | nee | Zet op `true` na inrichting van een Mutatieservice-abonnement. |
| `KVK_MUTATION_SUBSCRIPTION_ID` | nee | Technisch abonnements-ID; zonder waarde wordt het officiële abonnementenendpoint bevraagd. |
| `GOOGLE_PLACES_API_KEY` | enrichment | Places API (New) voor website, zakelijk telefoonnummer en Google Business-data. |
| `GOOGLE_PAGESPEED_API_KEY` | aanbevolen | PageSpeed Insights v5 en Lighthouse. |
| `ANTHROPIC_LEAD_MODEL` | nee | Concrete salesanalyse, outreachconcepten en democopy. |
| `ANTHROPIC_VISION_MODEL` | nee | Visuele beoordeling van de Lighthouse-screenshot. |
| `CRON_SECRET` | productie | Bearer-secret voor `/api/cron/lead-engine`. |

Credentials staan nooit in broncode of clientbundles.

## Discovery-bronnen

Zonder KVK-abonnement gebruikt de Lead Engine `OPENSTREETMAP`. Per marktplaats wordt één begrensde Overpass-query uitgevoerd voor relevante `craft`, `shop`, `office` en zakelijke `amenity`-categorieën. De koppeling:

- gebruikt alleen openbare OSM-tags zoals naam, categorie, zakelijk adres, website en zakelijke contactvelden;
- bewaart het stabiele OSM-element-ID en een idempotente `dedupe_key`, maar verzint nooit een KVK-nummer;
- sluit gemarkeerde ketens, netwerken, verlaten vermeldingen en digitale bureaucategorieën uit;
- beperkt radius, output, time-out en resultaten per plaats en ondersteunt een eigen Overpass-instance;
- toont `© OpenStreetMap contributors` en de ODbL-verwijzing in de applicatie.

OSM-dekking is community-gedreven. Rechtsvorm, werknemersaantal en bedrijfsleeftijd blijven daarom onbekend totdat die via een andere toegestane bron of handmatige verificatie zijn vastgesteld. Elke match moet vóór outreach menselijk worden gecontroleerd.

### Optionele KVK-configuratie

De implementatie gebruikt uitsluitend officiële KVK-producten:

- Zoeken v2: `GET https://api.kvk.nl/api/v2/zoeken`.
- Basisprofiel v1: `GET https://api.kvk.nl/api/v1/basisprofielen/{kvkNummer}`.
- Vestigingsprofiel v1: `GET https://api.kvk.nl/api/v1/vestigingsprofielen/{vestigingsnummer}`.
- Mutatieservice v1 onder `https://api.kvk.nl/api/v1/abonnementen`.

Authenticatie gaat alleen via de server-side `apikey`-header. Fase 1 zoekt hoofdvestigingen in Veenendaal, Ede, Wageningen, Rhenen, Renswoude, Scherpenzeel, Leersum, Amerongen, Woudenberg, Barneveld en Lunteren. Postcode-, SBI-, bedrijfsleeftijd-, rechtsvorm-, actief/inactief- en werknemersfilters zijn in de KVK-laag aanwezig. De plaatsenset vormt de eerste straal/regio rond Veenendaal en is centraal geconfigureerd voor latere landelijke uitbreiding.

De `dedupe_key` en bronidentiteit (`source` + `source_record_id`) maken discovery voor zowel OSM als KVK idempotent. De app bewaart geen volledige ruwe bronresponse, maar alleen gebruikte bedrijfsvelden en minimale bronmetadata. Controleer bij KVK-gebruik vóór livegang het eigen contract, toegestane gebruiksdoelen en actuele bewaarbeperkingen.

## Enrichment en audit

Google Business-matches worden alleen geaccepteerd bij hoge gecombineerde confidence op bedrijfsnaam, plaats, adres, telefoon en domein, plus voldoende verschil met de tweede kandidaat. Gelijknamige profielen worden daardoor niet automatisch gekoppeld.

Zonder betaalde enrichment-API probeert de app logische `.nl`- en `.com`-domeinen rechtstreeks. Een domein wordt alleen gekoppeld als bedrijfsnaam én onafhankelijke locatie-, adres- of telefooninformatie op de publieke homepage voldoende overeenkomen. Een ontbrekende URL in OpenStreetMap betekent uitsluitend **website nog niet gevonden**; alleen handmatig bevestigde afwezigheid mag de score-regel `Geen website` activeren.

De website-auditor:

- accepteert alleen publiek oplosbare HTTP(S)-doelen op poort 80/443 en blokkeert private, loopback en link-local adressen;
- valideert redirects opnieuw, limiteert responsetijd en -grootte en respecteert `Disallow: /` in `robots.txt`;
- controleert mobiel, HTTPS, metadata/H1, CTA, formulieren, afspraak/WhatsApp, reviews, links, structured data, sitemap, robots, analytics/pixels, cookiebanner, contact en social-links;
- gebruikt PageSpeed Insights v5 voor Lighthouse, LCP, CLS en INP wanneer beschikbaar;
- gebruikt de PageSpeed-screenshot voor optionele visuele AI-beoordeling en slaat de screenshot zelf niet op.

Een gevonden Instagram-URL is alleen aanwezigheid. Recente activiteit telt pas mee als die via een toegestane officiële API of handmatige bevestiging als zodanig is vastgelegd. De app bevat geen platformscrapers.

## Scoring

`score_weights` bevat alle configureerbare gewichten. De totaalscore wordt begrensd op 0–100:

- 0–39 `LOW`
- 40–59 `MEDIUM`
- 60–74 `GOOD`
- 75–84 `HOT`
- 85–100 `VERY_HOT`

Iedere berekening maakt een immutable `prospect_scores`-record met breakdown en modelversie. Digitale agencies/IT-SBI’s krijgen standaard `-50`; een moderne professionele website krijgt standaard `-35`. Aanpassingen in `/settings` gelden voor nieuwe of opnieuw gescoorde prospects en worden geaudit.

## Jobs en retries

`vercel.json` start dagelijks om `06:00 UTC` de beveiligde cronroute. Die start een duurzame Vercel Workflow en retourneert direct `202`.

De workflow voert achtereenvolgens uit:

1. KVK discovery en optionele Mutatieservice-pull.
2. Gratis directe domeinverificatie en optionele Google Places-enrichment.
3. Website-audit en optionele visuele beoordeling.
4. Opportunity scoring.
5. Concrete AI-salesanalyse.
6. Vijf outreachconcepten en prioritering.
7. Verwijdering van verlopen, nooit benaderde prospects.

Externe fases zijn aparte `use step`-functies met retries. Writes zijn idempotent door unieke sleutels en upserts. Runs komen in `lead_engine_job_runs`; fouten in `lead_engine_audit_log`. Handmatig starten kan via `/dashboard`.

## Datamodel

Belangrijkste tabellen:

- `prospects`, `prospect_urls`, `website_audits`, `prospect_scores`, `score_weights`
- `sales_analyses`, `outreach_drafts`, `outreach_outcomes`
- `crm_notes`, `crm_activities`, `prospect_status_history`
- `suppression_list`, `lead_engine_audit_log`, `lead_engine_job_runs`
- `kvk_mutation_events`, `demo_previews`, `lead_engine_settings`, `lead_engine_roles`

De bestaande tabel `leads` blijft voor formulieren van opgeleverde klantwebsites en is bewust niet hergebruikt.

## Compliance en veiligheid

- Geen LinkedIn-, Instagram-, Facebook- of TikTok-scraping, connectieautomatisering of geautomatiseerde social-DM’s.
- OpenStreetMap-data wordt gebruikt onder ODbL 1.0 met zichtbare bronvermelding; publieke Overpass-instanties worden laagfrequent, begrensd en zonder rate-limit-omzeiling bevraagd.
- “Versturen” kopieert het concept en opent het openbare profiel; pas na handmatige verzending markeert de gebruiker het als verzonden.
- E-mail, WhatsApp en telefoon staan in fase 1 ook op `MANUAL`. Een latere integratie mag alleen `OFFICIAL_API` gebruiken na kanaal- en juridische configuratie.
- `DO_NOT_CONTACT` maakt een harde suppression entry die scoring en learning niet kunnen overrulen.
- E-mailconcepten bevatten opt-out; geen reactie, positieve/negatieve reactie, afspraak en klant kunnen expliciet worden vastgelegd.
- Onbenaderde `NEW`/`RESEARCHED` prospects krijgen standaard 180 dagen retentie. De job verwijdert verlopen records; individuele prospectdata kan in het dossier worden gewist.
- Rollen `ADMIN`, `SALES`, `RESEARCHER` en `VIEWER` zijn voorbereid. Fase 1 geeft alleen de bestaande adminsessie schrijftoegang.
- Geen CAPTCHA-bypass, rate-limit-bypass, accountrotatie of nepaccounts. Mutaties hebben same-origin-controle en rate limits; cron gebruikt `CRON_SECRET`.
- Leg vóór live outreach de gerechtvaardigd-belangafweging, bron, doel, bewaartermijn en bezwaarprocedure vast met juridisch advies.

## Deployment

1. Maak een Supabase/PostgreSQL-project en voer beide migraties uit.
2. Configureer alle server-side secrets in Vercel Production.
3. Gebruik standaard OpenStreetMap/Overpass of activeer optioneel KVK en Google API’s met passende quota- en budgetalerts.
4. Deploy naar Vercel; `withWorkflow` is al geconfigureerd.
5. Controleer `CRON_SECRET` en de Production-cron.
6. Start met een lage `OSM_DISCOVERY_LIMIT_PER_PLACE` of `KVK_DISCOVERY_LIMIT_PER_PLACE` en controleer alle matches handmatig.

## Bestaande betaal- en generatieflow

1. Stripe Checkout int de bouwprijs en eerste beheermaand.
2. De ondertekende webhook verwerkt events idempotent.
3. De klant vult de intake in en uploadt toegestane assets.
4. `generateLandingWorkflow` genereert gevalideerde copy en gecontroleerde HTML.
5. Netlify publiceert de pagina en de klant ontvangt de oplevering.
6. Het Stripe-portaal beheert facturen, betaalgegevens en opzegging.

## Belangrijke beheerpunten

- De Stripe webhook wijst naar `/api/stripe/webhook`.
- `ADMIN_SESSION_SECRET`, `ORDER_TOKEN_SECRET`, `REFERRAL_TOKEN_SECRET`, `CUSTOMER_PORTAL_SECRET` en `IP_HASH_SALT` moeten unieke lange productiewaarden zijn.
- Landingsite.nl wordt aangeboden door Jannik Dienstverlening, Gortstraat 31, 3905 BB Veenendaal (KvK 65549430, btw NL001557133B48).

## Stack

Next.js 16, React 19, TypeScript, Vercel Workflow, Supabase/PostgreSQL, Anthropic, Google Places, PageSpeed Insights, Stripe, Netlify en Resend.
