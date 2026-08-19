# Landingsite.nl audit voor de upgrade

Datum: 19 augustus 2026  
Branch: `codex/full-conversion-seo-upgrade`

## Samenvatting

De bestaande website heeft al een volwassen technische basis: prijzen komen uit een centrale configuratie, Stripe Checkout vertrouwt geen bedragen uit de browser, webhookverwerking is idempotent en de intake is gekoppeld aan een betaalde order. De grootste winst zit in een compactere commerciële presentatie, een herkenbaarder ontwerp en een volwaardige toestemmings- en meetlaag.

## Huidige techniek

- Next.js 16 App Router met React 19 en TypeScript.
- Stripe Checkout in abonnementsmodus met een eenmalige bouwregel en een terugkerende beheerregel.
- Supabase voor orders, intake, referrals en webhookstatus.
- Resend voor transactionele e-mail.
- Zod-validatie, origincontroles, rate limiting en honeypots op publieke formulieren.
- Server-rendered SEO-pagina's met centraal register, sitemap en robots-configuratie.

## Commerciele bron

Actieve bron: `config/commercial.ts`.

| Pakket | Reguliere bouwprijs incl. btw | Beheer incl. btw | Reguliere eerste betaling incl. btw |
| --- | ---: | ---: | ---: |
| Starter | EUR 299 | EUR 79 | EUR 378 |
| Pro | EUR 499 | EUR 79 | EUR 578 |
| Premium | EUR 899 | EUR 79 | EUR 978 |

Op de auditdatum is de bestaande zomeractie actief tot en met 1 oktober 2026. Daardoor rekent de publieke startflow tijdelijk EUR 79, EUR 278 en EUR 678 inclusief btw af. De Stripe-validatie bevestigt dat de drie bouwprijzen en de maandprijs van EUR 79 in de gekoppelde testcatalogus aanwezig zijn.

## Wat goed werkt

- 64 geautomatiseerde tests slagen.
- Productie-afhankelijkheden bevatten geen bekende hoge kwetsbaarheden.
- Checkout bepaalt pakket en prijs op de server.
- Eerste beheermaand en eventuele bouwprijs worden samen afgerekend.
- Webhookhandtekeningen worden gecontroleerd en events worden uniek opgeslagen.
- De publieke site gebruikt echte projectscreenshots en bevat geen reviewschema of fictieve sterren.
- Contact- en intakegegevens worden niet naar analytics gestuurd.
- Homepage heeft geen horizontale overflow op 375, 768 en 1440 pixels.

## P0-bevindingen

1. Externe analytics staat bewust uit en er is nog geen volwaardige keuze voor noodzakelijk, analyse, marketing en voorkeuren.
2. Google Consent Mode v2 en een consent-gestuurde Google/Meta-loader ontbreken.
3. Campagneparameters worden alleen uit de actuele URL gelezen; herkomst gaat tijdens een langere funnel verloren.
4. De commerciele weergave noemt inclusief btw, maar toont niet consequent ook de uitsplitsing exclusief btw en btw op het orderoverzicht.
5. Stripe is in deze omgeving aan een testcatalogus gekoppeld. Live catalogus en webhooks moeten voor productie afzonderlijk worden gecontroleerd.

## P1-bevindingen

1. De hero combineert actiecommunicatie, prijsdetails, twee CTA's, een projectcase en meerdere vertrouwensregels. Daardoor concurreert bewijs met promotie.
2. De homepage herhaalt hetzelfde ritme van label, kop, uitleg en lijst in vrijwel iedere sectie.
3. Echte projecten zijn aanwezig, maar twee van de drie verschijnen als kleine thumbnails terwijl zij juist het sterkste bewijs vormen.
4. De prijsvergelijking is inhoudelijk compleet maar visueel zwaar en lang op mobiel.
5. De contact- en socialsectie verlengen de homepage nadat de primaire keuze al is gemaakt.
6. Het ontwerp heeft een bruikbaar eigen kleurenpalet, maar mist nog een herkenbaar concept dat de belofte 'eerst bekijken, daarna live' zichtbaar maakt.

## Baseline-controles

- Unit- en integratietests: 64/64 geslaagd.
- Stripe-catalogus: geslaagd in testmodus.
- Productie dependency audit: 0 hoge kwetsbaarheden.
- Visuele nulmeting: opgeslagen in `reports/conversion-upgrade/` voor 375, 768 en 1440 pixels.
- Console: geen foutmeldingen tijdens de nulmeting.
- Overflow: niet aangetroffen tijdens de nulmeting.

## Beoogde richting

Het nieuwe concept heet **de opleverproef**. De site gebruikt echte websites als grote bewijsstukken en presenteert proces, pakketten en beheer als onderdelen van een compacte projectbrief. Daardoor krijgt Landingsite.nl een redactionele, menselijke signatuur zonder dashboards, glows, generieke gradients of fictieve data.
