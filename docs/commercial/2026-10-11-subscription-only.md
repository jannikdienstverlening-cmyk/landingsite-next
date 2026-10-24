# Website inclusief bouw voor 79 euro per maand

## Goedkeuring

Op 11 oktober 2026 vroeg Jannik om bedragen te verwijderen en alleen 79 euro
per maand te tonen. Op de expliciete controlevraag bevestigde hij:
"Bouwkosten vervallen; alleen 79 per maand".

De bestaande btw-inclusieve weergave en het maandbedrag blijven behouden.
Alleen nieuwe checkouts gebruiken dit model. De bestaande pakketomvang,
correctierondes, kleine wijzigingen en maandelijkse opzegbaarheid blijven gelijk.
Er wordt geen minimumlooptijd of nieuwe overdrachtsregeling toegevoegd.

## Implementatie

- `config/commercial.ts` is de bron voor de actieve bedragen.
- Alle bouwprijzen zijn nul; de eerste betaling is alleen de eerste maand.
- Stripe Checkout bevat alleen de bestaande maandelijkse beheerprijs.
- Oude Stripe-prijzen worden niet gewijzigd, verwijderd of gearchiveerd.
- Bestaande orders, abonnementen en facturen worden niet gemigreerd.
- Oude webhookmetadata blijft geldig voor historische betalingen.
- Algemene voorwaarden beschrijven dit model alleen voor nieuwe overeenkomsten.

## Voor publicatie

Controleer tests, btw-splitsing, abonnementregel en visuele weergave.
Voor een productie-deploy is een afzonderlijk publicatieverzoek nodig.

## Controle op 11 oktober 2026

- `npm run check`: lint, typecheck, SEO-controles, 97 tests, production build
  en controle van de productie-output geslaagd.
- 53 gerichte Playwright-controles geslaagd tegen de lokale productiebuild.
- Schermformaten: 360, 390, 768, 1024, 1440 en 1920 pixels breed.
- Screenshots van homepage, werk en blog bekeken; visuele referenties bijgewerkt.
- Toegankelijkheid, toetsenbordmenu, projectkeuze, geladen afbeeldingen,
  overflow, btw, maandprijs en structured data gecontroleerd.
- Betaalproviders en database zijn gemockt in de servertests. Zowel de nieuwe
  betaling van 79 euro als een historische betaling met bouwprijs behouden
  hun bedragen, voorwaardenversie en eenmalige bevestiging.
- De lokale productiepreview gebruikt een test-Price-ID voor de configuratiecheck.
  Er zijn geen echte betalingen aangemaakt of bestaande abonnementen gewijzigd.
- De rechtstreekse Stripe-cataloguscontrole kon niet worden uitgevoerd:
  `STRIPE_SECRET_KEY` is niet beschikbaar in deze lokale checkout.

## Nog nodig voor livegang

Expliciet publicatieakkoord en controle van de bestaande maandprijs in de
productieconfiguratie: 7900 cent, EUR, inclusief btw, iedere maand.
De bijgewerkte juridische teksten moeten professioneel worden gecontroleerd.
Er is geen nieuwe minimumlooptijd of overdrachtsregeling bedacht.

## Publicatieakkoord en productiecontrole

Op 11 oktober 2026 gaf Jannik expliciet akkoord met "Zet live".
De bestaande beveiligde productiecontrole `/api/admin/stripe-health` gaf
`ready: true`: live toegang, betaalbevoegdheid, actieve maandprijs, webhooks,
automatische btw, Nederlandse btw-registratie en klantportaal zijn in orde.
De maandprijs is gevalideerd op 7900 cent, EUR, inclusief btw en maandinterval.
Het klantportaal ondersteunt facturen, betaalgegevens en opzegging tegen het
einde van de betaalperiode. Er zijn geen echte betalingen uitgevoerd en geen
bestaande abonnementen of Stripe-prijzen gewijzigd.
