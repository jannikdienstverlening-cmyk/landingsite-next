# Consent- en referralrunbook

De bron voor actuele toestemmingsversies is `config/consent.ts`.

- Bestelling, contact en voorwaardenacceptatie zijn nooit marketingtoestemming.
- Marketingautomatisering staat standaard uit via `MARKETING_EMAIL_ENABLED=false`.
- Inschakelen mag pas nadat de Supabase-tabellen uit `supabase-migration.sql` zijn uitgerold, `MARKETING_TOKEN_SECRET` is gezet en de bevestigings- en afmeldroutes in productie zijn getest.
- Een inschrijving wordt eerst `pending`; pas na een aparte bevestigingshandeling wordt de abonnee `active`.
- Iedere marketingverzending moet vooraf zowel een actuele actieve toestemming als de centrale `marketing_suppressions`-lijst controleren via `maySendMarketing`.
- Een afmelding zet de abonnee op `unsubscribed`, schrijft een auditregel en voegt het adres toe aan de suppressielijst. CSV-imports mogen deze lijst nooit omzeilen.
- Bewaar tekst, versie, bron, verzoek-, bevestigings- en intrektijdstip als bewijs. Het privacybeleid noemt een bewaartermijn van in beginsel vijf jaar na het laatste marketingbericht.
- Referralattributie blijft standaard beperkt tot de browsersessie.
- Een 30-dagenreferralcookie vereist de actuele expliciete toestemmingsversie.
- Fingerprinting is niet toegestaan.
- Externe analytics ontvangt geen events zolang analytics niet is ingeschakeld en afzonderlijke toestemming ontbreekt.

Bij een nieuwe tekst of doelwijziging: verhoog de toestemmingsversie, bewaar tijdstip en versie en vraag opnieuw toestemming wanneer de bestaande keuze het nieuwe doel niet dekt.
