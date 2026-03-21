import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function stuurBevEstigingEmail(opts: {
  email: string
  bedrijfsnaam: string
  pakket: string
  netlifyUrl: string
}) {
  const { email, bedrijfsnaam, pakket, netlifyUrl } = opts

  await resend.emails.send({
    from: 'Landingsite.nl <noreply@landingsite.nl>',
    to: email,
    subject: `✅ Jouw landingspagina is klaar — ${bedrijfsnaam}`,
    html: `
<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: 'Courier New', monospace; background: #f5f2eb; color: #0d0d0d; padding: 2rem; max-width: 600px; margin: 0 auto;">
  <h1 style="font-size: 1.8rem; margin-bottom: 0.5rem;">🎉 Jouw pagina is live!</h1>
  <p style="color: #6b6458; margin-bottom: 2rem;">Bedankt voor je bestelling bij Landingsite.nl</p>

  <div style="background: #ece8df; border: 1px solid #d4cec3; padding: 1.5rem; margin-bottom: 1.5rem;">
    <p><strong>Bedrijf:</strong> ${bedrijfsnaam}</p>
    <p><strong>Pakket:</strong> ${pakket}</p>
    <p style="margin-top: 1rem;"><strong>Jouw preview URL:</strong></p>
    <a href="${netlifyUrl}" style="color: #c8440a; word-break: break-all;">${netlifyUrl}</a>
  </div>

  <h2 style="font-size: 1.2rem; margin-bottom: 1rem;">Eigen domein koppelen</h2>
  <p>Wil je de pagina op jouw eigen domein hosten? Voeg deze DNS-record toe bij jouw domeinbeheerder:</p>

  <div style="background: #0d0d0d; color: #f5f2eb; padding: 1rem; font-family: monospace; margin: 1rem 0;">
    <p>Type: CNAME</p>
    <p>Naam: www (of @ voor root)</p>
    <p>Waarde: ${netlifyUrl.replace('https://', '')}</p>
    <p>TTL: 3600</p>
  </div>

  <p style="color: #6b6458; font-size: 0.85rem; margin-top: 1rem;">
    Na het instellen van de DNS-record duurt het tot 24 uur voordat het domein actief is.
    Heb je vragen? Stuur een mail naar <a href="mailto:info@landingsite.nl" style="color: #c8440a;">info@landingsite.nl</a>
  </p>

  <hr style="border: none; border-top: 1px solid #d4cec3; margin: 2rem 0;">
  <p style="color: #6b6458; font-size: 0.75rem;">© 2026 Landingsite.nl</p>
</body>
</html>
    `,
  })
}
