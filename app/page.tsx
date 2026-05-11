import {
  BenefitsGrid,
  ComparisonSection,
  FAQSection,
  FinalCTA,
  Footer,
  Header,
  Hero,
  PricingSection,
  ProblemSection,
  ProcessTimeline,
  ShowcaseSection,
} from '@/components/home-redesign'

const faqs = [
  {
    q: 'Hoe snel is mijn pagina live?',
    a: 'Na betaling en intake leveren we je eerste pagina binnen 48 uur op. Bij complete input lukt dat vaak sneller.',
  },
  {
    q: 'Wat lever ik zelf aan?',
    a: 'Je vult een korte intake in met je aanbod, doelgroep, sterke punten en contactgegevens. Beeldmateriaal is handig, maar niet verplicht.',
  },
  {
    q: 'Kan ik achteraf nog iets aanpassen?',
    a: 'Ja. Pro bevat 1 correctieronde en Premium bevat 3 correctierondes. Starter is bedoeld voor ondernemers die direct live willen met minimale afstemming.',
  },
  {
    q: 'Wordt de pagina ook gehost?',
    a: 'Ja. We zetten de pagina live en geven je duidelijke DNS-instructies voor je eigen domein. Je hoeft geen losse hostingpartij te regelen.',
  },
  {
    q: 'Waarom geen complete website?',
    a: 'Een campagne heeft focus nodig. Een landingspagina stuurt bezoekers naar één actie en haalt alle afleiding weg die op een normale website blijft hangen.',
  },
  {
    q: 'Wat als ik niet tevreden ben?',
    a: 'Als de pagina niet voldoet aan de afgesproken specificaties, lossen we dat op binnen je correctieronde of krijg je je geld terug.',
  },
]

const packages = [
  {
    id: 'starter' as const,
    name: 'Starter',
    price: '€299',
    tagline: 'Voor snel valideren',
    tier: 'Compact',
    label: 'Kies Starter',
    features: [
      '1 tot 3 secties',
      'Jij levert tekst en beeld aan',
      'Mobiel geoptimaliseerd design',
      'Contactformulier inbegrepen',
      'Hosting op jouw domein',
    ],
  },
  {
    id: 'pro' as const,
    name: 'Pro',
    price: '€499',
    tagline: 'Voor leads en campagnes',
    tier: 'Launch',
    label: 'Kies Pro',
    highlighted: true,
    features: [
      'Tot 6 uitgebreide secties',
      'FAQ en reviewsectie',
      'Koppeling met social media',
      'Werkgebied en doelgroepfocus',
      '1 correctieronde inbegrepen',
    ],
  },
  {
    id: 'premium' as const,
    name: 'Premium',
    price: '€899',
    tagline: 'Voor volledig ontzorgd',
    tier: 'Studio',
    label: 'Kies Premium',
    features: [
      'Onbeperkt secties',
      'AI schrijft alle teksten voor je',
      'Aangepast design en sfeer',
      'Alle tools en pixels voorbereiden',
      '3 correctierondes inbegrepen',
    ],
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://landingsite.nl/#organization',
      name: 'Landingsite.nl',
      url: 'https://landingsite.nl',
      description:
        'Professionele landingspagina’s laten maken voor Nederlandse ondernemers. Binnen 48 uur live, vaste prijs en hosting inbegrepen.',
      areaServed: 'NL',
      priceRange: '€299 - €899',
    },
    {
      '@type': 'Service',
      name: 'Landingspagina laten maken',
      provider: { '@id': 'https://landingsite.nl/#organization' },
      description: 'Professionele, converterende landingspagina binnen 48 uur online.',
      offers: packages.map((pakket) => ({
        '@type': 'Offer',
        name: pakket.name,
        price: pakket.price.replace('€', ''),
        priceCurrency: 'EUR',
      })),
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.q,
        acceptedAnswer: { '@type': 'Answer', text: faq.a },
      })),
    },
  ],
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main>
        <Hero />
        <ProblemSection />
        <ProcessTimeline />
        <ShowcaseSection />
        <BenefitsGrid />
        <PricingSection packages={packages} />
        <ComparisonSection />
        <FAQSection faqs={faqs} />
        <FinalCTA />
      </main>
      <Footer />
    </>
  )
}
