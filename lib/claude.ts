import Anthropic from '@anthropic-ai/sdk'
import { Pakket } from './supabase'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface IntakeData {
  pakket: Pakket
  bedrijfsnaam: string
  niche: string
  beschrijving: string
  usp_1: string
  usp_2: string
  usp_3: string
  extra_fields?: {
    doelgroep?: string
    werkgebied?: string
    testimonials?: Array<{ naam: string; tekst: string }>
    faq?: Array<{ vraag: string; antwoord: string }>
    social_facebook?: string
    social_instagram?: string
    social_linkedin?: string
    extra_wensen?: string
    sfeer?: string
    contacttelefoon?: string
    contactemail?: string
  }
}

const HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{META_TITLE}}</title>
<link rel="icon" type="image/png" href="/favicon.png">
<meta name="description" content="{{META_DESCRIPTION}}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  :root {
    --ink: #0d0d0d;
    --paper: #f5f2eb;
    --accent: #c8440a;
    --accent-light: #e85a1a;
    --muted: #6b6458;
    --rule: #d4cec3;
    --green: #1a7a4a;
    --surface: #ece8df;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { background: var(--paper); color: var(--ink); font-family: 'DM Mono', monospace; font-size: 16px; line-height: 1.6; overflow-x: hidden; }
  .container { max-width: 1000px; margin: 0 auto; padding: 0 2rem; position: relative; z-index: 1; }
  nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 1.25rem 2rem; display: flex; justify-content: space-between; align-items: center; background: rgba(245,242,235,0.95); backdrop-filter: blur(8px); border-bottom: 1px solid var(--rule); }
  .nav-logo { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.2rem; letter-spacing: -0.02em; color: var(--ink); text-decoration: none; }
  .nav-logo span { color: var(--accent); }
  .nav-cta { background: var(--ink); color: var(--paper); font-family: 'DM Mono', monospace; font-size: 0.75rem; letter-spacing: 0.06em; text-transform: uppercase; padding: 0.6rem 1.4rem; text-decoration: none; border: none; cursor: pointer; transition: background 0.2s, transform 0.1s; }
  .nav-cta:hover { background: var(--accent); transform: translateY(-1px); }
  #hero { padding: 9rem 0 5rem; text-align: center; }
  .hero-label { font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--accent); margin-bottom: 1rem; font-weight: 500; }
  h1 { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(2.5rem, 6vw, 4.5rem); line-height: 1.05; letter-spacing: -0.03em; max-width: 15ch; margin: 0 auto 1.5rem; }
  h1 em { font-style: italic; font-family: 'Instrument Serif', serif; font-weight: 400; color: var(--accent); }
  .hero-sub { font-size: 1.05rem; max-width: 48ch; margin: 0 auto 2.5rem; color: var(--muted); }
  .cta-primary { display: inline-flex; align-items: center; gap: 0.75rem; background: var(--accent); color: #fff; font-family: 'DM Mono', monospace; font-size: 0.8rem; letter-spacing: 0.06em; text-transform: uppercase; padding: 1.1rem 2.2rem; text-decoration: none; transition: background 0.2s, transform 0.1s; box-shadow: 4px 4px 0 var(--ink); }
  .cta-primary:hover { background: var(--accent-light); transform: translate(-2px,-2px); box-shadow: 6px 6px 0 var(--ink); }
  section { padding: 5rem 0; border-top: 1px solid var(--rule); }
  .features { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; margin-top: 2rem; }
  @media(max-width: 768px) { .features { grid-template-columns: 1fr; } }
  .feat-box { padding: 2rem; background: var(--surface); border: 1px solid var(--rule); }
  .feat-box h3 { font-family: 'Syne', sans-serif; font-size: 1.2rem; margin-bottom: 0.5rem; }
  .feat-box p { font-size: 0.85rem; color: var(--muted); }
  #contact { text-align: center; }
  .form-wrapper { max-width: 500px; margin: 0 auto; text-align: left; }
  .contact-form input, .contact-form textarea, .contact-form select { width: 100%; background: var(--paper); border: 1px solid var(--rule); padding: 1rem; margin-bottom: 1rem; font-family: 'DM Mono', monospace; font-size: 0.9rem; outline: none; transition: border-color 0.2s; }
  .contact-form input:focus, .contact-form textarea:focus, .contact-form select:focus { border-color: var(--accent); }
  .form-submit { width: 100%; justify-content: center; border: none; font-size: 1rem; cursor: pointer; }
  #seo-content { background: var(--surface); padding: 4rem 0; border-top: 1px solid var(--rule); }
  .seo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; }
  @media(max-width: 768px) { .seo-grid { grid-template-columns: 1fr; } }
  .seo-grid h2 { font-family: 'Syne', sans-serif; font-size: 1.5rem; margin-bottom: 1rem; letter-spacing: -0.02em; }
  .seo-grid p { font-size: 0.9rem; color: var(--muted); margin-bottom: 1rem; line-height: 1.7; }
  {{EXTRA_CSS}}
  footer { text-align: center; padding: 2.5rem 2rem; border-top: 1px solid var(--rule); font-size: 0.75rem; color: var(--muted); }
</style>
</head>
<body>
<nav>
  <a href="#" class="nav-logo">{{BEDRIJFSNAAM_KORT}}<span>.</span></a>
  <a href="#contact" class="nav-cta">{{CTA_LABEL}}</a>
</nav>
<section id="hero">
  <div class="container">
    <p class="hero-label">{{HERO_LABEL}}</p>
    <h1>{{H1_VOOR}} <em>{{H1_ACCENT}}</em>{{H1_NA}}</h1>
    <p class="hero-sub">{{HERO_SUB}}</p>
    <a href="#contact" class="cta-primary">{{CTA_HERO}}</a>
  </div>
</section>
<section id="features">
  <div class="container">
    <div class="features">
      <div class="feat-box">
        <h3>{{FEAT1_TITEL}}</h3>
        <p>{{FEAT1_TEKST}}</p>
      </div>
      <div class="feat-box">
        <h3>{{FEAT2_TITEL}}</h3>
        <p>{{FEAT2_TEKST}}</p>
      </div>
      <div class="feat-box">
        <h3>{{FEAT3_TITEL}}</h3>
        <p>{{FEAT3_TEKST}}</p>
      </div>
    </div>
  </div>
</section>
{{EXTRA_SECTIONS}}
<section id="seo-content">
  <div class="container">
    <div class="seo-grid">
      <div>
        <h2>{{SEO_H2_1}}</h2>
        <p>{{SEO_P1}}</p>
      </div>
      <div>
        <h2>{{SEO_H2_2}}</h2>
        <p>{{SEO_P2}}</p>
      </div>
    </div>
  </div>
</section>
<section id="contact">
  <div class="container">
    <h2 style="font-family:'Syne'; font-size:2rem; margin-bottom:1rem;">{{CONTACT_TITEL}}</h2>
    <p style="color:var(--muted); margin-bottom:2rem;">{{CONTACT_SUB}}</p>
    <div class="form-wrapper">
      <form class="contact-form" action="mailto:{{CONTACT_EMAIL}}" method="GET">
        <input type="text" name="naam" placeholder="Jouw naam" required>
        <input type="email" name="email" placeholder="E-mailadres" required>
        <input type="tel" name="telefoon" placeholder="Telefoonnummer">
        <textarea name="bericht" rows="4" placeholder="Jouw bericht of vraag..." style="resize:vertical;"></textarea>
        <button type="submit" class="cta-primary form-submit">{{CTA_FORM}}</button>
      </form>
    </div>
  </div>
</section>
<footer>
  <p>© 2026 {{BEDRIJFSNAAM}} — {{FOOTER_TAGLINE}}</p>
</footer>
</body>
</html>`

export async function genereerLandingspagina(intake: IntakeData): Promise<string> {
  const systemPrompt = `Je bent een expert webdeveloper die professionele Nederlandse landingspagina's maakt.
Je krijgt een HTML-template met placeholders en intake-gegevens van een klant.
Vervang ALLE placeholders door passende, overtuigende Nederlandse content.

Template:
${HTML_TEMPLATE}

Regels:
- Vervang alle {{PLACEHOLDER}} waarden door echte content
- {{EXTRA_CSS}} kan extra CSS bevatten voor reviews, FAQ secties (alleen voor Pro/Premium) — of leeg zijn
- {{EXTRA_SECTIONS}} kan extra HTML-secties bevatten voor reviews, FAQ (alleen voor Pro/Premium) — of leeg zijn
- Schrijf overtuigende, professionele Nederlandse teksten gericht op de doelgroep
- De H1 moet een krachtige headline zijn met een <em>-accent op het meest impactvolle woord of korte zinsdeel
- De 3 features moeten de USPs van de klant benadrukken
- Voor Premium: schrijf alle teksten zelf op basis van de niche en beschrijving
- Geef ALLEEN de volledige HTML terug, niets anders`

  const pakketInfo = intake.pakket === 'premium'
    ? 'PREMIUM pakket: schrijf professionele, overtuigende teksten voor alle secties op basis van de niche en beschrijving.'
    : intake.pakket === 'pro'
      ? 'PRO pakket: gebruik de intake gegevens inclusief testimonials en FAQ.'
      : 'STARTER pakket: gebruik de aangeleverde teksten en USPs direct.'

  const userPrompt = `${pakketInfo}

Intake gegevens:
${JSON.stringify(intake, null, 2)}

Genereer nu de volledige HTML-pagina door alle placeholders te vervangen.`

  const message = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 8096,
    messages: [{ role: 'user', content: userPrompt }],
    system: systemPrompt,
  })

  const content = message.content[0]
  if (content.type !== 'text') throw new Error('Onverwacht response type van Claude')

  // Strip markdown code blocks if present
  let html = content.text.trim()
  if (html.startsWith('```html')) html = html.slice(7)
  if (html.startsWith('```')) html = html.slice(3)
  if (html.endsWith('```')) html = html.slice(0, -3)

  return html.trim()
}
