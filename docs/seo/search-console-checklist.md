# Google Search Console-checklist

## Dag 1

- Verifieer de Domain Property `sc-domain:landingsite.nl`.
- Controleer **Manual actions** en **Security issues**.
- Exporteer Performance over de afgelopen zestien maanden als die data beschikbaar is.
- Exporteer Pages/Indexing en leg de huidige aantallen vast.
- Inspecteer de homepage en noteer Google-selected canonical, laatst gecrawlde versie en oude snippettekst.
- Leg oude vermeldingen van het hostingbedrag vast als nulmeting.

## Na deployment

- Test live: `/`, `/landingspagina-laten-maken`, `/website-laten-maken-zzp` en `/kosten-website-laten-maken`.
- Controleer per URL status 200, canonical, robotsmeta en mobiel renderresultaat.
- Vraag per belangrijke URL éénmalig indexering aan; herhaal dit niet dagelijks.
- Dien `https://www.landingsite.nl/sitemap.xml` in.
- Controleer sitemap, structured data en rendered HTML met URL Inspection en Rich Results Test.
- Controleer dat `/start`, intake, beheer en interne routes niet indexeerbaar zijn.

## Dagelijks gedurende tien dagen

- Controleer indexatiestatus, impressions, query's, gemiddelde positie en CTR.
- Controleer Google-selected canonical en crawlproblemen.
- Noteer wijzigingen; herschrijf niet dagelijks de volledige pagina zonder data.
- Gebruik de Google Indexing API niet voor gewone pagina's.

## Optionele API-rapportage

`npm run seo:report` gebruikt alleen de officiële Search Console Search Analytics API. Benodigd:

- `GOOGLE_SEARCH_CONSOLE_SITE_URL=sc-domain:landingsite.nl`
- `GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN=<tijdelijk OAuth-token met webmasters.readonly>`

Credentials worden niet in Git opgeslagen. Ontbrekende credentials geven een duidelijke fout; er worden nooit gesimuleerde rankings gemaakt.
