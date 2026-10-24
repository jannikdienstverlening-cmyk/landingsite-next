# Herstel publicatiebron voor het maandabonnement

## Vastgestelde afwijking

De productie-release van 23 oktober (`31f40a47`) publiceerde een nieuw blog
vanaf `master`. Die branch miste de drie eerder goedgekeurde commits voor
het abonnement, het ene aanbod en de nieuwe cartoon. Daardoor verschenen
de oude bouwprijzen opnieuw, ondanks een technisch werkende Stripe-configuratie.

## Herstel

- Voeg `7eb5dd0a` samen met de actuele `master`, met behoud van alle nieuwe blogs.
- Publiceer uitsluitend het aanbod uit `config/commercial.ts`: 79 euro per maand
  inclusief btw, zonder bouwkosten. De eerste betaling is eveneens 79 euro.
- De Nederlandse uitsplitsing is 65,29 euro exclusief btw plus 13,71 euro btw.
- Checkout bevat uitsluitend de bestaande maandelijkse Stripe-prijs, hoeveelheid 1.
- Bestaande orders, historische betalingen, Stripe-producten en abonnementen blijven intact.
- Oude pakketlinks openen hetzelfde aanbod; oude duurdere open checkoutpogingen
  worden niet hergebruikt.
- Werk ook `master` bij, zodat een volgende blogpublicatie de prijswijziging behoudt.

## Verificatie

Voer de volledige projectcontrole uit en controleer de browserflow op mobiel
en desktop. Controleer de afgeschermde Stripe-readiness en de daadwerkelijke
checkoutregels. Eventuele lege diagnostische checkout wordt uitsluitend
beëindigd als er geen klant, betaling of abonnement aan gekoppeld is.
Voer geen echte betaling uit en wijzig geen bestaande klantgegevens.

## Technisch onderhoud bij deze herstelrelease

De bestaande installatie gaf ook beveiligingsmeldingen. Next.js en bijbehorende
lintconfiguratie zijn bijgewerkt naar 16.4.3, Sharp naar 0.35.5 en Workflow
binnen dezelfde major-reeks naar 4.8.14. Zod, devalue, js-yaml, undici en
brace-expansion gebruiken gecorrigeerde versies binnen hun bestaande major.
Na installatie melden zowel de volledige npm-audit als `npm run audit:production`
nul bekende kwetsbaarheden. De volledige project- en browsercontrole volgt
op deze gewijzigde installatie, niet op de oude afhankelijkheden.

## Afgeschermde livecontrole

De beheerroute kan uitsluitend een recente, lege checkout controleren en
afsluiten wanneer sessie-ID, verzoek-UUID en de huidige commerciele metadata
overeenkomen. Sessies met klantgegevens, betaling of abonnement worden geweigerd.
Het antwoord bevat alleen prijs-, interval- en afleverstatussen, geen sleutels
of klantgegevens. Zo kan de volledige startknop worden getest terwijl
productiesleutels op de server blijven. De controlesessie wordt niet betaald;
de bestaande webhook moet de verlopen onbetaalde order afhandelen.
