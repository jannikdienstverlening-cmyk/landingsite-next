# ASVS-baseline

Deze lijst vertaalt de relevante OWASP ASVS-onderwerpen naar deze repository.

- Authenticatie: admin- en klanttokens zijn doelgebonden, getekend, verlopen en timing-safe gecontroleerd.
- Toegang: klantintake en assets vereisen een betaalde order; serverroutes gebruiken server-side credentials.
- Sessies: cookies zijn Secure, HttpOnly en SameSite waar van toepassing.
- Validatie: Zod, bodylimieten, origincontrole, upload-MIME en magic-byte-validatie.
- Data: klantassets staan in een private bucket en gebruiken korte signed URLs.
- Cryptografie: secrets staan uitsluitend in environment variables en worden niet gelogd.
- Logging: auditstatus zonder volledige formulierinhoud of betaalgegevens.
- Betalingen: Stripe-signaturecontrole, event-idempotentie en server-side Price IDs.
- Headers: CSP, HSTS, nosniff, frame-ancestors, referrer- en permissions-policy.
- Misbruik: routegerichte rate limits; Stripe-webhooks worden niet door generieke rate limiting geblokkeerd.

Herhaal deze controle bij nieuwe authenticatie, uploads, leveranciers of betaalstromen.
