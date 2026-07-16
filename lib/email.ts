import { escapeHtml } from './html'
import { getResend } from './resend'

export async function sendDeliveryEmail(opts: {
  email: string
  bedrijfsnaam: string
  pakket: string
  netlifyUrl: string
  idempotencyKey: string
}) {
  const company = escapeHtml(opts.bedrijfsnaam)
  const url = escapeHtml(opts.netlifyUrl)
  const host = escapeHtml(new URL(opts.netlifyUrl).hostname)

  await getResend().emails.send({
    from: process.env.RESEND_FROM ?? 'Landingsite.nl <noreply@landingsite.nl>',
    to: opts.email,
    subject: `Je landingspagina voor ${opts.bedrijfsnaam} staat klaar`,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.65;color:#0b2019;background:#f3f8f5;padding:32px">
      <div style="max-width:620px;margin:auto;background:#fff;border:1px solid #dce7e2;border-radius:18px;padding:32px">
        <p style="color:#16845c;font-size:13px;font-weight:800;letter-spacing:.08em;text-transform:uppercase">Klaar voor controle</p>
        <h1 style="font-size:28px;line-height:1.2;margin:10px 0 16px">Je landingspagina staat live</h1>
        <p>Hoi, de eerste versie voor <strong>${company}</strong> is gegenereerd en gepubliceerd. Bekijk hem rustig op:</p>
        <p style="margin:26px 0"><a href="${url}" style="display:inline-block;background:#0b3d2e;color:#fff;padding:13px 20px;border-radius:999px;text-decoration:none;font-weight:700">Bekijk jouw pagina</a></p>
        <p style="font-size:13px;color:#61716b;word-break:break-all">${url}</p>
        <h2 style="font-size:19px;margin-top:30px">Eigen domein</h2>
        <p>Een eigen domein vereist eerst dat het domein in Netlify wordt toegevoegd. Daarna verschillen de juiste DNS-records per provider en tussen een hoofddomein en <em>www</em>. Stuur ons je domeinnaam; we helpen je met de exacte koppeling naar <strong>${host}</strong>.</p>
        <p>Hosting van €15 per maand wordt pas na jouw akkoord geactiveerd en is maandelijks opzegbaar.</p>
        <hr style="border:0;border-top:1px solid #dce7e2;margin:30px 0"><p style="font-size:13px;color:#61716b">Vragen of wijzigingen? Mail naar <a href="mailto:info@landingsite.nl">info@landingsite.nl</a>.</p>
      </div>
    </div>`,
  }, { idempotencyKey: opts.idempotencyKey })
}
