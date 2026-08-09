# Productierelease

## Voor deploy

- `npm run check`
- `npm run test:e2e`
- `npm audit --omit=dev --audit-level=high`
- `npm run stripe:validate` met de doelomgeving om alle actieve bedragen, valuta, btw-instelling en intervallen read-only tegen Stripe te controleren.
- Controleer Stripe Price IDs en webhooksecret in Production; `instrumentation.ts` blokkeert een productiestart met ontbrekende of ongeldige Price IDs.
- Controleer Supabase service-role, private bucket en RLS.
- Rol de actuele `supabase-migration.sql` uit voordat marketingtoestemming of nieuwe abonnementsstatusvelden worden gebruikt.
- Laat `MARKETING_EMAIL_ENABLED=false` totdat double opt-in, afmelding en suppressie end-to-end in productie zijn getest.
- Controleer gewijzigde leveranciers en juridische teksten.

## Na deploy

- Draai `SMOKE_BASE_URL=https://www.landingsite.nl npm run smoke`.
- Controleer `/robots.txt` en `/sitemap.xml`.
- Controleer canonical op `/` en `/werk`.
- Controleer `noindex` op `/start`, `/partner` en klant-/intakeroutes.
- Controleer browserconsole op desktop en mobiel.
- Controleer Stripe-, contact- en intakefunnel in testmodus of staging.
- Inspecteer Search Console en vraag herindexering van `/` en `/werk` aan na inhoudelijke wijzigingen.
