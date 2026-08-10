<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Publicatie- en SEO-regels

1. Publiceer geen fictieve claims, reviews, cijfers, resultaten of medewerkers.
2. Gebruik voor prijzen uitsluitend `config/commercial.ts`.
3. Voeg geen indexeerbare pagina toe zonder unieke zoekintentie in `content/seo-pages.ts` en `docs/seo/keyword-map.json`.
4. Alleen content met status `approved` of `published` mag indexeerbaar zijn, in de sitemap staan of structured data krijgen.
5. Maak geen massale locatie-, branche- of doorwaypagina's.
6. Wijzig Stripe-prijzen, Stripe Price IDs, abonnementen, voorwaarden of privacyteksten alleen na expliciete menselijke goedkeuring.
7. Stuur geen persoonsgegevens, intake-antwoorden, uploads of betaalgegevens naar logs of analytics.
8. Gebruik de Google Indexing API niet voor gewone webpagina's en plaats geen automatische of gekochte backlinks.
9. Garandeer geen ranking, leads, omzet of definitieve livegang binnen 48 uur.
10. Iedere publieke pagina moet server-rendered zijn, feitelijke canonicals gebruiken en visueel op mobiel en desktop worden gecontroleerd.
11. Draai vóór productie minimaal lint, typecheck, SEO-controles, tests en een production build.
12. Externe marketingpublicatie, outreach en productie-deploy vereisen menselijke goedkeuring.
13. Iedere publiceerbare claim moet herleidbaar zijn tot `config/verified-claims.ts` of een andere aantoonbare bron.
14. Bij ontbrekende onderbouwing: niet publiceren, veilig blokkeren en rapporteren.
