# Back-up- en hersteltest

Voer minimaal ieder kwartaal een gecontroleerde hersteltest uit.

1. Kies een niet-productieomgeving en een representatieve databaseback-up.
2. Herstel orders, intakegegevens, webhookevents en auditlog naar de testomgeving.
3. Herstel een geselecteerd klantasset via een tijdelijk getekende URL.
4. Controleer referenties tussen order, intake, abonnement en auditlog.
5. Controleer dat private assets niet publiek toegankelijk zijn.
6. Leg hersteltijd, volledigheid, afwijkingen en verbeteracties vast.

Gebruik nooit een productieback-up in een onbeveiligde lokale omgeving. Verwijder testdata na afronding volgens het bewaarbeleid.
