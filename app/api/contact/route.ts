import { NextRequest } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const { naam, email, bericht } = await req.json()

  if (!naam || !email || !bericht) {
    return Response.json({ error: 'Vul alle velden in.' }, { status: 400 })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return Response.json({ error: 'Ongeldig e-mailadres.' }, { status: 400 })
  }

  try {
    await resend.emails.send({
      from: 'Landingsite.nl <noreply@landingsite.nl>',
      to: 'info@landingsite.nl',
      replyTo: email,
      subject: `Nieuw contactbericht van ${naam}`,
      html: `
<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"></head>
<body style="font-family: 'Courier New', monospace; background: #f5f2eb; color: #0d0d0d; padding: 2rem; max-width: 600px; margin: 0 auto;">
  <h2 style="font-size: 1.4rem; margin-bottom: 1.5rem; border-bottom: 1px solid #d4cec3; padding-bottom: 1rem;">
    Nieuw contactbericht via Landingsite.nl
  </h2>
  <div style="background: #ece8df; border: 1px solid #d4cec3; padding: 1.5rem; margin-bottom: 1.5rem;">
    <p style="margin-bottom: 0.5rem;"><strong>Naam:</strong> ${naam}</p>
    <p style="margin-bottom: 0.5rem;"><strong>E-mail:</strong> <a href="mailto:${email}" style="color: #c8440a;">${email}</a></p>
  </div>
  <div style="background: #fff; border: 1px solid #d4cec3; padding: 1.5rem;">
    <p style="margin-bottom: 0.5rem;"><strong>Bericht:</strong></p>
    <p style="white-space: pre-wrap; color: #4a4540;">${bericht}</p>
  </div>
  <hr style="border: none; border-top: 1px solid #d4cec3; margin: 2rem 0;">
  <p style="color: #6b6458; font-size: 0.75rem;">© 2026 Landingsite.nl — Dit bericht is verzonden via het contactformulier.</p>
</body>
</html>
      `,
    })

    return Response.json({ ok: true })
  } catch {
    return Response.json({ error: 'Verzenden mislukt. Probeer het later opnieuw.' }, { status: 500 })
  }
}
