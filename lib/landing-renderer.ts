import { escapeHtml } from './html'
import type { IntakeData, LandingContent } from './claude'

const themes = {
  emerald: { ink: '#071a17', paper: '#f2f6f1', accent: '#16a36a', glow: '#80e9bd' },
  navy: { ink: '#081426', paper: '#f3f6fb', accent: '#2867f0', glow: '#8fb8ff' },
  clay: { ink: '#24130d', paper: '#fbf4ef', accent: '#d5522b', glow: '#ffb69d' },
  sand: { ink: '#1c1912', paper: '#faf7ed', accent: '#a8730d', glow: '#e8c46d' },
} as const

function safeUrl(value: string | undefined) {
  if (!value) return ''
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:' ? escapeHtml(url.toString()) : ''
  } catch {
    return ''
  }
}

function renderBenefits(content: LandingContent) {
  return content.benefits.map((benefit, index) => `
    <article class="benefit reveal">
      <span>0${index + 1}</span>
      <h3>${escapeHtml(benefit.title)}</h3>
      <p>${escapeHtml(benefit.text)}</p>
    </article>`).join('')
}

function renderSteps(content: LandingContent) {
  return content.steps.map((step, index) => `
    <li>
      <span>${String(index + 1).padStart(2, '0')}</span>
      <div><h3>${escapeHtml(step.title)}</h3><p>${escapeHtml(step.text)}</p></div>
    </li>`).join('')
}

function renderFaq(content: LandingContent) {
  if (!content.faq.length) return ''
  return `<section class="section faq" aria-labelledby="faq-title">
    <div class="wrap narrow">
      <p class="kicker">Goed om te weten</p>
      <h2 id="faq-title">Veelgestelde vragen</h2>
      <div class="faq-list">${content.faq.map(item => `
        <details><summary>${escapeHtml(item.question)}</summary><p>${escapeHtml(item.answer)}</p></details>`).join('')}
      </div>
    </div>
  </section>`
}

function renderTestimonials(intake: IntakeData) {
  const testimonials = intake.extra_fields?.testimonials?.filter(item => item.naam && item.tekst) ?? []
  if (!testimonials.length) return ''
  return `<section class="section proof" aria-labelledby="proof-title"><div class="wrap">
    <p class="kicker">Ervaringen</p><h2 id="proof-title">Wat klanten zeggen</h2>
    <div class="quotes">${testimonials.map(item => `<figure><blockquote>“${escapeHtml(item.tekst)}”</blockquote><figcaption>${escapeHtml(item.naam)}</figcaption></figure>`).join('')}</div>
  </div></section>`
}

export function renderLandingPage(opts: {
  intake: IntakeData
  content: LandingContent
  leadToken: string
}) {
  const { intake, content, leadToken } = opts
  const theme = themes[content.theme]
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL ?? 'https://landingsite.nl').replace(/\/$/, '')
  const endpoint = `${baseUrl}/api/leads`
  const logoUrl = safeUrl(intake.extra_fields?.logo_url)
  const heroUrl = safeUrl(intake.extra_fields?.hero_image_url)
  const email = escapeHtml(intake.extra_fields?.contactemail ?? '')
  const phone = escapeHtml(intake.extra_fields?.contacttelefoon ?? '')
  const company = escapeHtml(intake.bedrijfsnaam)
  const socials = [
    ['Instagram', intake.extra_fields?.social_instagram],
    ['LinkedIn', intake.extra_fields?.social_linkedin],
    ['Facebook', intake.extra_fields?.social_facebook],
  ].map(([label, href]) => ({ label, href: safeUrl(href) })).filter(item => item.href)
  const cspOrigin = escapeHtml(new URL(baseUrl).origin)

  return `<!doctype html>
<html lang="nl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(content.metaTitle)}</title>
  <meta name="description" content="${escapeHtml(content.metaDescription)}">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <meta name="theme-color" content="${theme.ink}">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' https: data:; style-src 'unsafe-inline'; script-src ${cspOrigin}; connect-src ${cspOrigin}; form-action ${cspOrigin}; base-uri 'none'; object-src 'none'; frame-ancestors 'none'">
  <style>
    :root{--ink:${theme.ink};--paper:${theme.paper};--accent:${theme.accent};--glow:${theme.glow};--line:color-mix(in srgb,var(--ink) 16%,transparent);--muted:color-mix(in srgb,var(--ink) 68%,transparent)}
    *{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--paper);color:var(--ink);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;line-height:1.6;-webkit-font-smoothing:antialiased}a{color:inherit}button,input,textarea{font:inherit}.wrap{width:min(1160px,calc(100% - 40px));margin:auto}.narrow{width:min(760px,calc(100% - 40px))}.nav{position:sticky;top:0;z-index:10;background:color-mix(in srgb,var(--paper) 88%,transparent);backdrop-filter:blur(18px);border-bottom:1px solid var(--line)}.nav-inner{min-height:76px;display:flex;align-items:center;justify-content:space-between;gap:24px}.brand{display:flex;align-items:center;gap:12px;text-decoration:none;font-weight:850;letter-spacing:-.03em}.brand img{width:auto;max-width:150px;height:40px;object-fit:contain}.brand-mark{width:34px;height:34px;border-radius:10px;background:linear-gradient(145deg,var(--accent),var(--glow));box-shadow:inset 0 0 0 1px #fff4}.nav-cta,.button{display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:999px;background:var(--accent);color:#fff;text-decoration:none;font-weight:780;padding:13px 20px;box-shadow:0 10px 30px color-mix(in srgb,var(--accent) 25%,transparent);transition:transform .2s,box-shadow .2s}.nav-cta:hover,.button:hover{transform:translateY(-2px);box-shadow:0 16px 36px color-mix(in srgb,var(--accent) 35%,transparent)}.hero{position:relative;overflow:hidden;padding:clamp(70px,10vw,140px) 0 90px}.hero:before{content:"";position:absolute;width:600px;height:600px;right:-220px;top:-220px;border-radius:50%;background:var(--glow);opacity:.2;filter:blur(3px)}.hero-grid{position:relative;display:grid;grid-template-columns:minmax(0,1.15fr) minmax(300px,.85fr);gap:clamp(50px,8vw,100px);align-items:center}.kicker{margin:0 0 16px;color:var(--accent);font-size:.78rem;font-weight:850;letter-spacing:.16em;text-transform:uppercase}.hero h1,.section h2{font-size:clamp(2.7rem,6.4vw,6rem);line-height:.98;letter-spacing:-.065em;margin:0}.hero h1 em{display:block;color:var(--accent);font-style:normal}.hero-copy{font-size:clamp(1.08rem,1.5vw,1.28rem);max-width:650px;color:var(--muted);margin:28px 0}.hero-actions{display:flex;align-items:center;gap:18px;flex-wrap:wrap}.trust{font-size:.86rem;color:var(--muted)}.hero-art{min-height:510px;border-radius:32px;background:linear-gradient(145deg,var(--ink),color-mix(in srgb,var(--ink) 75%,var(--accent)));position:relative;overflow:hidden;box-shadow:0 35px 80px #0002}.hero-art img{width:100%;height:100%;min-height:510px;object-fit:cover;opacity:.74}.hero-art:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 35%,var(--ink));opacity:.55}.hero-card{position:absolute;z-index:2;left:24px;right:24px;bottom:24px;padding:24px;border-radius:20px;background:#fff;color:#111;box-shadow:0 18px 50px #0004}.hero-card strong{display:block;font-size:1.25rem;line-height:1.2}.hero-card span{display:block;color:#59605e;font-size:.88rem;margin-top:8px}.section{padding:clamp(80px,10vw,140px) 0;border-top:1px solid var(--line)}.section h2{font-size:clamp(2.1rem,4.5vw,4.5rem);max-width:850px}.benefits{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:54px}.benefit{padding:34px;border:1px solid var(--line);border-radius:24px;background:#fff8}.benefit>span{color:var(--accent);font-size:.75rem;font-weight:900}.benefit h3{font-size:1.3rem;line-height:1.2;margin:42px 0 10px;letter-spacing:-.03em}.benefit p,.story p,.steps p,.faq p{margin:0;color:var(--muted)}.story-grid{display:grid;grid-template-columns:.9fr 1.1fr;gap:clamp(50px,9vw,120px);align-items:start}.story-copy{font-size:clamp(1.15rem,2vw,1.55rem);line-height:1.55}.steps{list-style:none;padding:0;margin:0}.steps li{display:grid;grid-template-columns:54px 1fr;gap:20px;padding:28px 0;border-bottom:1px solid var(--line)}.steps li>span{color:var(--accent);font-size:.8rem;font-weight:850}.steps h3{margin:0 0 6px;font-size:1.1rem}.proof{background:var(--ink);color:var(--paper)}.quotes{display:grid;grid-template-columns:repeat(2,1fr);gap:18px;margin-top:50px}.quotes figure{margin:0;padding:34px;border:1px solid #fff2;border-radius:24px;background:#fff1}.quotes blockquote{margin:0;font-size:1.15rem}.quotes figcaption{margin-top:24px;color:var(--glow);font-weight:800}.faq-list{margin-top:50px}.faq details{border-top:1px solid var(--line);padding:22px 0}.faq details:last-child{border-bottom:1px solid var(--line)}.faq summary{cursor:pointer;font-weight:800;font-size:1.05rem}.faq details p{padding-top:14px}.contact{background:var(--ink);color:var(--paper)}.contact-grid{display:grid;grid-template-columns:.9fr 1.1fr;gap:clamp(50px,9vw,120px)}.contact h2{font-size:clamp(2.2rem,5vw,4.8rem)}.contact-copy{color:#fff9;max-width:520px}.contact-links{display:flex;gap:16px;flex-wrap:wrap;margin-top:26px;font-size:.9rem}.lead-form{padding:32px;border-radius:28px;background:var(--paper);color:var(--ink)}.field{margin-bottom:16px}.field label{display:block;font-size:.78rem;font-weight:800;margin:0 0 7px}.field input,.field textarea{width:100%;padding:14px 15px;border:1px solid var(--line);border-radius:12px;background:#fff;color:var(--ink)}.field textarea{min-height:125px;resize:vertical}.field input:focus,.field textarea:focus{outline:3px solid color-mix(in srgb,var(--accent) 22%,transparent);border-color:var(--accent)}.hp{position:absolute;left:-9999px}.form-status{min-height:24px;margin:14px 0 0;font-size:.85rem}.footer{padding:38px 0;background:var(--ink);color:#fff9;border-top:1px solid #fff2}.footer-inner{display:flex;justify-content:space-between;gap:24px;flex-wrap:wrap}.footer p{margin:0}.footer a{color:var(--glow)}@media(max-width:850px){.hero-grid,.story-grid,.contact-grid{grid-template-columns:1fr}.hero-art{min-height:380px}.hero-art img{min-height:380px}.benefits{grid-template-columns:1fr 1fr}.quotes{grid-template-columns:1fr}}@media(max-width:560px){.wrap,.narrow{width:min(100% - 28px,1160px)}.nav-inner{min-height:66px}.nav-cta{padding:10px 14px;font-size:.82rem}.hero{padding-top:64px}.hero h1{font-size:clamp(2.65rem,14vw,4.5rem)}.hero-art{min-height:330px}.hero-art img{min-height:330px}.benefits{grid-template-columns:1fr}.benefit h3{margin-top:24px}.lead-form{padding:22px}.section{padding:76px 0}}
    @media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*{transition:none!important}}
  </style>
</head>
<body>
  <header class="nav"><div class="wrap nav-inner">
    <a class="brand" href="#top">${logoUrl ? `<img src="${logoUrl}" alt="${company}">` : `<span class="brand-mark" aria-hidden="true"></span><span>${company}</span>`}</a>
    <a class="nav-cta" href="#contact">${escapeHtml(content.primaryCta)}</a>
  </div></header>
  <main id="top">
    <section class="hero"><div class="wrap hero-grid">
      <div><p class="kicker">${escapeHtml(content.eyebrow)}</p><h1>${escapeHtml(content.headline)} <em>${escapeHtml(content.headlineAccent)}</em></h1><p class="hero-copy">${escapeHtml(content.subheadline)}</p><div class="hero-actions"><a class="button" href="#contact">${escapeHtml(content.primaryCta)}</a><span class="trust">${escapeHtml(content.trustLine)}</span></div></div>
      <div class="hero-art">${heroUrl ? `<img src="${heroUrl}" alt="" fetchpriority="high">` : ''}<div class="hero-card"><strong>${company}</strong><span>${escapeHtml(intake.niche)}${intake.extra_fields?.werkgebied ? ` · ${escapeHtml(intake.extra_fields.werkgebied)}` : ''}</span></div></div>
    </div></section>
    <section class="section" aria-labelledby="benefits-title"><div class="wrap"><p class="kicker">Waarom ${company}</p><h2 id="benefits-title">${escapeHtml(content.sectionTitle)}</h2><div class="benefits">${renderBenefits(content)}</div></div></section>
    <section class="section story"><div class="wrap story-grid"><div><p class="kicker">De aanpak</p><h2>Helder van eerste vraag tot resultaat.</h2></div><div><p class="story-copy">${escapeHtml(content.sectionText)}</p><ol class="steps">${renderSteps(content)}</ol></div></div></section>
    ${renderTestimonials(intake)}
    ${renderFaq(content)}
    <section class="section contact" id="contact" aria-labelledby="contact-title"><div class="wrap contact-grid"><div><p class="kicker">Contact</p><h2 id="contact-title">${escapeHtml(content.finalTitle)}</h2><p class="contact-copy">${escapeHtml(content.finalText)}</p><div class="contact-links">${email ? `<a href="mailto:${email}">${email}</a>` : ''}${phone ? `<a href="tel:${phone}">${phone}</a>` : ''}${socials.map(item => `<a href="${item.href}" rel="noopener noreferrer" target="_blank">${item.label}</a>`).join('')}</div></div>
      <form class="lead-form" data-lead-form data-endpoint="${escapeHtml(endpoint)}" novalidate>
        <input type="hidden" name="token" value="${escapeHtml(leadToken)}"><div class="hp" aria-hidden="true"><label for="website">Website</label><input id="website" name="website" tabindex="-1" autocomplete="off"></div>
        <div class="field"><label for="naam">Naam</label><input id="naam" name="naam" autocomplete="name" required minlength="2"></div>
        <div class="field"><label for="email">E-mailadres</label><input id="email" name="email" type="email" autocomplete="email" required></div>
        <div class="field"><label for="telefoon">Telefoonnummer <span>(optioneel)</span></label><input id="telefoon" name="telefoon" type="tel" autocomplete="tel"></div>
        <div class="field"><label for="bericht">Waar kunnen we mee helpen?</label><textarea id="bericht" name="bericht"></textarea></div>
        <button class="button" type="submit">${escapeHtml(content.primaryCta)}</button><p class="form-status" data-form-status aria-live="polite"></p>
      </form>
    </div></section>
  </main>
  <footer class="footer"><div class="wrap footer-inner"><p>© ${new Date().getFullYear()} ${company}</p><p>${escapeHtml(content.footerTagline)}</p><p>Site door <a href="${escapeHtml(baseUrl)}">Landingsite.nl</a></p></div></footer>
  <script src="${escapeHtml(baseUrl)}/generated-form.js" defer></script>
</body></html>`
}
