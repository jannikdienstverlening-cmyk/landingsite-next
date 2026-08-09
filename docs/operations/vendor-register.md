# Leveranciersregister

De technisch actieve bron is `config/vendors.ts`. Pas leveranciers daar eerst aan en controleer daarna privacybeleid en verwerkersovereenkomst.

## Controle per kwartaal

1. Bevestig dat iedere leverancier nog technisch actief is.
2. Controleer doel, gegevenscategorieen en verwerkersrol.
3. Controleer DPA, subverwerkerslijst en doorgiftewaarborg.
4. Verwijder een leverancier uit code en juridische teksten wanneer deze niet meer wordt gebruikt.
5. Leg datum, controleur en wijzigingen vast in het interne auditlog.

De actieve lijst bevat momenteel Vercel, Supabase, Stripe, Resend, Anthropic en Netlify. Stripe kan voor betaalverwerking deels zelfstandig verwerkingsverantwoordelijke zijn; de overige rollen volgen uit de concrete verwerking.
