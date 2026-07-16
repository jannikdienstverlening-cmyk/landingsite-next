import assert from 'node:assert/strict'
import test from 'node:test'
import type { IntakeData, LandingContent } from '../lib/claude'
import { renderLandingPage } from '../lib/landing-renderer'

process.env.NEXT_PUBLIC_BASE_URL = 'https://landingsite.nl'

const intake: IntakeData = {
  pakket: 'pro',
  bedrijfsnaam: '<script>alert(1)</script>',
  niche: 'Test & advies',
  beschrijving: 'Een geldige testbeschrijving die lang genoeg is voor een realistische intake.',
  usp_1: 'Snel', usp_2: 'Veilig', usp_3: 'Helder',
  extra_fields: {
    contactemail: 'test@example.com',
    social_instagram: 'javascript:alert(1)',
    testimonials: [{ naam: '<img src=x onerror=alert(1)>', tekst: 'Heel goed & snel.' }],
  },
}

const content: LandingContent = {
  metaTitle: 'Een veilige landingspagina voor een testbedrijf',
  metaDescription: 'Dit is een veilige omschrijving die lang genoeg is om realistische metadata voor deze rendertest te vormen.',
  eyebrow: 'Veilig getest', headline: '<img src=x onerror=alert(1)>', headlineAccent: 'zonder injectie',
  subheadline: 'Een heldere subheadline die geen onveilige HTML mag kunnen toevoegen aan de uiteindelijke pagina.',
  primaryCta: 'Neem contact op', trustLine: 'Altijd een gecontroleerde en veilige route.',
  benefits: [
    { title: 'Eén', text: 'Een concreet voordeel met voldoende uitleg voor de bezoeker.' },
    { title: 'Twee', text: 'Een tweede voordeel met voldoende uitleg voor de bezoeker.' },
    { title: 'Drie', text: 'Een derde voordeel met voldoende uitleg voor de bezoeker.' },
  ],
  sectionTitle: 'Een veilige route naar resultaat',
  sectionText: 'Deze langere sectietekst beschrijft de aanpak zonder scripts of andere uitvoerbare invoer en blijft volledig onder controle van de renderer.',
  steps: [
    { title: 'Start', text: 'We beginnen met een concrete en heldere briefing.' },
    { title: 'Bouw', text: 'We bouwen de pagina in veilige vaste componenten.' },
    { title: 'Live', text: 'We controleren de uitvoer voordat die live gaat.' },
  ],
  faq: [], finalTitle: 'Klaar om veilig te starten?', finalText: 'Neem contact op en bespreek de volgende stap voor jouw bedrijf.',
  footerTagline: 'Veilig opgebouwd en helder opgeleverd.', theme: 'emerald',
}

test('renderer ontsmet intake en AI-copy en blokkeert onveilige URLs', () => {
  const html = renderLandingPage({ intake, content, leadToken: 'secure-lead-token' })
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/)
  assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;/)
  assert.doesNotMatch(html, /javascript:alert/)
  assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/)
  assert.match(html, /Content-Security-Policy/)
  assert.match(html, /data-lead-form/)
})
