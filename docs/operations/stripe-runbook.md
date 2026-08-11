# Stripe-runbook

## Voor productie

- Controleer dat alle vier Price IDs in Vercel Production staan.
- Controleer dat bouwprijzen eenmalig zijn en beheer maandelijks terugkeert.
- Controleer webhook-URL, signing secret, Customer Portal en zakelijke voorwaardenlink.
- Gebruik uitsluitend live-sleutels in Production en test-sleutels in Development/Preview.

## Testtransactie

1. Start ieder pakket via `/start`.
2. Controleer bouwprijs, eerste maand beheer, btw en maandbedrag daarna.
3. Rond een Stripe-testcheckout af.
4. Controleer dat precies een order en een abonnement zijn aangemaakt.
5. Controleer dat de intake pas na bevestigde betaling toegankelijk is.
6. Herhaal een webhookevent en bevestig dat geen dubbel effect ontstaat.

## Storing

- Bij `invoice.payment_failed`: geen commissie toekennen en klant naar het tijdelijke Customer Portal leiden.
- Bij refund/dispute: commissie blokkeren of corrigeren volgens de webhookstatus.
- Bij webhookfout: herstel oorzaak en laat Stripe opnieuw afleveren; maak geen handmatige dubbele order.
- Roteer een webhooksecret gecontroleerd en pas Vercel Production en Stripe gelijktijdig aan.
## Catalogus en configuratie

- `config/commercial.ts` is de enige commerciële bron voor €299, €499, €899 en €79 per maand.
- `npm run stripe:validate` leest de actieve Price IDs en wijzigt niets. De controle vereist EUR, `tax_behavior=inclusive`, drie `one_time`-prijzen en één maandelijkse recurring prijs van €79.
- `npm run stripe:sync` maakt ontbrekende inclusieve testprijzen aan en laat bestaande prijzen actief. Gebruik `--archive-old` pas nadat de nieuwe Price IDs zijn gekoppeld en de checkout is gecontroleerd.
- `npm run stripe:sync` wijzigt de catalogus. Live wijzigen kan alleen bewust met `--allow-live`.
- Productie weigert bij serverstart ontbrekende of syntactisch ongeldige Price IDs.

## Webhooks

- De webhook gebruikt de onbewerkte body en verifieert `Stripe-Signature`.
- `stripe_webhook_events` claimt ieder event-ID één keer en maakt retries mogelijk na een fout of vastgelopen verwerking.
- Een ouder Stripe-event kan door `management_event_created` geen nieuwere abonnementsstatus terugdraaien.
- Webhooks hebben bewust geen generieke IP-rate-limit; Stripe moet veilig kunnen retryen.
- Refunds, voids en disputen draaien nog niet uitbetaalde partnercommissie terug. Uitbetalingen blijven handmatig gecontroleerd.

## Klantportaal

- Een portalsessie wordt alleen na een geldige getekende klantlink en rate limit op aanvraag gemaakt.
- Portal-URL's worden niet permanent opgeslagen.
