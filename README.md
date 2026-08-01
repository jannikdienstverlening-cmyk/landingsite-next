# Landingsite.nl

Next.js-app voor de verkoop, intake, generatie en oplevering van zakelijke landingspagina’s. De applicatie gebruikt een herstartbare Vercel Workflow, gestructureerde AI-copy en een gecontroleerde HTML-renderer; het taalmodel publiceert dus nooit zelf uitvoerbare code.

## Lokaal starten

1. Kopieer `.env.example` naar `.env.local` en vul de sleutels in.
2. Voer `supabase-migration.sql` uit in de Supabase SQL Editor.
3. Start met `npm run dev` en open `http://localhost:3000`.

Controleer voor iedere release:

```powershell
npm run check
```

## Betaal- en generatieflow

1. Stripe Checkout int eenmalig de bouwprijs voor Starter, Pro of Premium.
2. De ondertekende webhook upsert de order en verwerkt events idempotent met een auditstatus.
3. De klant vult de intake in en kan logo en hoofdbeeld uploaden.
4. De API claimt de order atomair en start `generateLandingWorkflow`.
5. Claude retourneert gevalideerde, gestructureerde copy; `landing-renderer.ts` bouwt veilige HTML.
6. De workflow maakt of hergebruikt een Netlify-site, publiceert de pagina, slaat de status op en verstuurt de oplevermail.
7. Na goedkeuring maakt een beheerder een aparte Stripe-link voor Websitebeheer; de eerste €79-incasso ontstaat pas wanneer de klant die link bij livegang expliciet afrondt.
8. Betaalde Websitebeheer-facturen kunnen maximaal drie commissieposten aanmaken. Die blijven op handmatige controle staan en voeren geen automatische bankbetaling uit.

## Belangrijke beheerpunten

- De Stripe webhook wijst naar `/api/stripe/webhook`.
- De publieke voorwaarden- en privacy-URL zijn in het gekoppelde Stripe-account ingesteld; `STRIPE_TERMS_CONFIGURED=true` houdt de checkout-guard open.
- Websitebeheer kost €79 per maand exclusief btw en omvat hosting, SSL, onderhoud, back-ups, monitoring en maximaal 30 minuten kleine wijzigingen per kalendermaand.
- Het adminwachtwoord wordt alleen naar `/api/admin/login` gestuurd. Daarna gebruikt het dashboard een getekende HttpOnly-cookie.
- `ADMIN_SESSION_SECRET`, `ORDER_TOKEN_SECRET`, `REFERRAL_TOKEN_SECRET`, `CUSTOMER_PORTAL_SECRET` en `IP_HASH_SALT` moeten in productie unieke lange waarden zijn.
- Landingsite.nl wordt aangeboden door Jannik Dienstverlening, Gortstraat 31, 3905 BB Veenendaal (KvK 65549430, btw NL001557133B48).

## Stack

Next.js 16, React 19, TypeScript, Vercel Workflow, Stripe, Supabase, Anthropic, Netlify en Resend.
